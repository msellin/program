/**
 * Program coach — Cloudflare Worker that proxies to the Anthropic Messages API.
 *
 * POST /api/coach
 *   body: { messages: [{role, content}...], state?: {...} }
 *   returns: SSE stream of Anthropic events
 *
 * GET /api/health → { ok: true }
 *
 * Reads program.json / exercises.json / clinical-context.json from FRONTEND_ORIGIN
 * (fetched fresh, cached in the runtime for the request). Builds a system prompt
 * that stays static across turns — that block uses prompt caching for cost efficiency.
 */

type Env = {
  ANTHROPIC_API_KEY: string;
  FRONTEND_ORIGIN: string;
  CLAUDE_MODEL: string;
  STORE: KVNamespace;
};

// Single-user for now. If we ever add multi-user, key by CF-Access user email.
const STATE_KEY = "user:margus:v2";

type ChatMessage = { role: "user" | "assistant"; content: string };

type UserState = {
  training_maxes?: Record<string, number>;
  recent_logs?: Record<string, unknown>;
  recent_symptoms?: Record<string, unknown> | null;
  current_phase?: string;
  cycle_week?: number;
  stretch_targets?: Record<string, number>;
  skipped?: Record<string, unknown>;
};

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") return corsResponse(env, 204);

    if (url.pathname === "/api/health") {
      return corsJson(env, { ok: true, model: env.CLAUDE_MODEL });
    }

    if (url.pathname === "/api/state" && request.method === "GET") {
      return handleGetState(env).catch((e) =>
        corsJson(env, { error: (e as Error).message }, 500),
      );
    }

    if (url.pathname === "/api/state" && request.method === "PUT") {
      return handlePutState(request, env).catch((e) =>
        corsJson(env, { error: (e as Error).message }, 500),
      );
    }

    if (url.pathname === "/api/coach" && request.method === "POST") {
      return handleCoach(request, env).catch((e) =>
        corsJson(env, { error: (e as Error).message }, 500),
      );
    }

    return corsJson(env, { error: "Not found" }, 404);
  },
};

async function handleGetState(env: Env): Promise<Response> {
  const raw = await env.STORE.get(STATE_KEY);
  if (!raw) {
    return corsJson(env, { store: null, updated_at: 0 });
  }
  try {
    const parsed = JSON.parse(raw);
    return corsJson(env, { store: parsed, updated_at: parsed?.updated_at ?? 0 });
  } catch (e) {
    return corsJson(env, { error: "Corrupt state", detail: (e as Error).message }, 500);
  }
}

async function handlePutState(request: Request, env: Env): Promise<Response> {
  const body = await request.text();
  // Size sanity — KV allows 25 MB but we'd never legitimately hit that.
  if (body.length > 1_000_000) {
    return corsJson(env, { error: "State too large" }, 413);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return corsJson(env, { error: "Invalid JSON" }, 400);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return corsJson(env, { error: "State must be an object" }, 400);
  }
  await env.STORE.put(STATE_KEY, body);
  const updated_at = (parsed as { updated_at?: number }).updated_at ?? Date.now();
  return corsJson(env, { ok: true, updated_at });
}

async function handleCoach(request: Request, env: Env): Promise<Response> {
  if (!env.ANTHROPIC_API_KEY) {
    return corsJson(env, { error: "ANTHROPIC_API_KEY not configured on the worker" }, 500);
  }
  const body = (await request.json()) as { messages?: ChatMessage[]; state?: UserState };
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const state = body.state ?? {};

  if (!messages.length) {
    return corsJson(env, { error: "messages required" }, 400);
  }

  const { staticContext, volatileContext } = await buildSystemPrompt(env, state);

  const anthropicBody = {
    model: env.CLAUDE_MODEL,
    max_tokens: 1024,
    stream: true,
    system: [
      {
        type: "text",
        text: staticContext,
        // Cache the big static block across turns of the same conversation
        cache_control: { type: "ephemeral" },
      },
      { type: "text", text: volatileContext },
    ],
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  };

  const upstream = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": ANTHROPIC_VERSION,
      // Streaming is default when stream:true; no extra header needed.
    },
    body: JSON.stringify(anthropicBody),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text();
    return corsJson(env, { error: "Anthropic error", detail: text, status: upstream.status }, 502);
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      "connection": "keep-alive",
      ...corsHeaders(env),
    },
  });
}

async function buildSystemPrompt(
  env: Env,
  state: UserState,
): Promise<{ staticContext: string; volatileContext: string }> {
  const origin = env.FRONTEND_ORIGIN;
  const [programRes, exercisesRes, clinicalRes] = await Promise.all([
    fetch(origin + "/data/program.json", { cf: { cacheTtl: 300 } }),
    fetch(origin + "/data/exercises.json", { cf: { cacheTtl: 300 } }),
    fetch(origin + "/data/clinical-context.json", { cf: { cacheTtl: 300 } }),
  ]);
  const [program, exercises, clinical] = await Promise.all([
    programRes.json(),
    exercisesRes.json(),
    clinicalRes.json(),
  ]);

  const staticContext = renderStatic(program, exercises, clinical);
  const volatileContext = renderVolatile(state);
  return { staticContext, volatileContext };
}

function renderStatic(program: unknown, exercises: unknown, clinical: unknown): string {
  return `You are a strength coach and rehab-informed advisor for one specific user.

Your job:
- Help this user progress squat and deadlift toward their goals while respecting a documented injury history.
- Answer questions about the plan, form, symptoms, session structure, and what to do next.
- Propose adjustments. NEVER silently drift the plan — always name what you're changing and why.

Non-negotiables (these override anything else):
- The progressive approach never gets lost. Skips don't reset TMs down. Missed cycles don't quietly lower the plan. The trajectory always points up.
- Never recommend a provocative position (see clinical context) without a clear symptom gate.
- Red flags escalate to a physio/orthopaedist, not the app. You are a companion to clinical care, not a substitute.
- No emoji, no motivational padding, no "you got this." Editorial voice: terse, opinionated, specific.

Style guide:
- Answers are 1-3 short paragraphs unless the user asks for depth.
- Use metric (kg). Use ISO dates (YYYY-MM-DD).
- Show your reasoning when recommending numeric changes (weights, TM bumps, phase shifts).
- If the user asks a form/technique question, cue in 2-4 words, not paragraphs.
- If you don't know something (their bodyweight, current pain, whether they slept), ask.

---
## CANONICAL PROGRAM DATA
---

### clinical-context.json (the constraint set)
${JSON.stringify(clinical, null, 2)}

### program.json (phases, blocks, milestones, adaptive engine spec)
${JSON.stringify(program, null, 2)}

### exercises.json (movement library)
${JSON.stringify(exercises, null, 2)}
`;
}

function renderVolatile(state: UserState): string {
  const now = new Date().toISOString().slice(0, 10);
  return `## CURRENT USER STATE (as of ${now})

Training maxes: ${JSON.stringify(state.training_maxes ?? {}, null, 2)}

Current phase: ${state.current_phase ?? "unknown"}
Cycle week: ${state.cycle_week ?? "unknown"}

Stretch targets (adjusted milestones): ${JSON.stringify(state.stretch_targets ?? {}, null, 2)}

Recent logs (recent days only, may be trimmed): ${JSON.stringify(state.recent_logs ?? {}, null, 2)}

Recent symptoms (most-recent morning check): ${JSON.stringify(state.recent_symptoms ?? null, null, 2)}

Recent skips: ${JSON.stringify(state.skipped ?? {}, null, 2)}

When answering, cross-reference the user's actual logged weights against the program's suggested numbers. If they consistently exceed reintro caps, note it. If they're behind milestones, name the gap and what would close it without violating the non-negotiables.
`;
}

function corsHeaders(env: Env): HeadersInit {
  return {
    "access-control-allow-origin": env.FRONTEND_ORIGIN,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
  };
}

function corsResponse(env: Env, status: number): Response {
  return new Response(null, { status, headers: corsHeaders(env) });
}

function corsJson(env: Env, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      ...corsHeaders(env),
    },
  });
}
