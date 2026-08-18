import type { Store } from "./schemas";
import { isBlockObjectOn } from "./engine/block-selectors";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type StreamHandler = {
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
};

const COACH_URL = process.env.NEXT_PUBLIC_COACH_URL;

export function coachConfigured(): boolean {
  return !!COACH_URL && COACH_URL.length > 0;
}

/**
 * Build the volatile per-request state slice sent to the Worker.
 * Trim logs to the last 30 days so system prompt stays sane.
 *
 * Phase F · block-object rebuild — when `block_object` is on, `skipped`
 * is synthesized from `scheduled_blocks` so the Worker LLM sees the same
 * canonical shape regardless of surface. Also emits a `blocks_summary`
 * with per-program recent activity so the coach can reference specific
 * program adherence without loading the whole `scheduled_blocks` map.
 */
export function extractState(store: Store) {
  const dates = Object.keys(store.logs).sort();
  const recent = dates.slice(-30);
  const recent_logs: Record<string, unknown> = {};
  for (const d of recent) recent_logs[d] = store.logs[d];
  const lastWithSymptoms = [...recent].reverse().find((d) => store.logs[d]?.symptoms);

  // Merged `skipped` shape: legacy + synthesized-from-blocks.
  const blockObjectOn = isBlockObjectOn(store);
  const skipped: Record<string, { reason?: string; moved_to?: string }> = {
    ...(store.skipped ?? {}),
  };
  if (blockObjectOn) {
    for (const b of Object.values(store.scheduled_blocks ?? {})) {
      if (b.state === "skipped") {
        skipped[b.actual_date] = { reason: b.notes };
      } else if (b.state === "moved") {
        skipped[b.planned_date] = {
          reason: "moved",
          moved_to: b.actual_date,
        };
      }
    }
  }

  // Per-program recent-activity summary (last 30 days).
  const blocks_summary: Record<
    string,
    { done: number; planned: number; skipped: number; moved: number }
  > = {};
  if (blockObjectOn) {
    const cutoff = recent[0] ?? "";
    for (const b of Object.values(store.scheduled_blocks ?? {})) {
      if (b.actual_date < cutoff) continue;
      const p = (blocks_summary[b.program_slug] ??= {
        done: 0,
        planned: 0,
        skipped: 0,
        moved: 0,
      });
      if (b.state === "done") p.done++;
      else if (b.state === "skipped") p.skipped++;
      else if (b.state === "moved") p.moved++;
      else p.planned++;
    }
  }

  return {
    training_maxes: store.training_maxes,
    recent_logs,
    recent_symptoms: lastWithSymptoms ? store.logs[lastWithSymptoms].symptoms : null,
    current_phase: store.cycle?.phase_id ?? null,
    cycle_week: store.cycle?.week_in_cycle ?? null,
    stretch_targets: store.stretch_targets ?? {},
    skipped,
    blocks_summary,
  };
}

/**
 * Post to the coach endpoint and stream Anthropic events.
 * The Worker returns raw SSE from Anthropic; we parse `event: content_block_delta`
 * frames and emit their `delta.text` via `onDelta`.
 */
export async function streamCoach(
  messages: ChatMessage[],
  store: Store,
  handler: StreamHandler,
  abort?: AbortSignal,
): Promise<void> {
  if (!coachConfigured()) {
    handler.onError("Coach isn't configured yet. Set NEXT_PUBLIC_COACH_URL to the deployed worker URL.");
    handler.onDone();
    return;
  }

  const res = await fetch(COACH_URL + "/api/coach", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages, state: extractState(store) }),
    signal: abort,
  }).catch((e) => {
    handler.onError(e instanceof Error ? e.message : String(e));
    handler.onDone();
    return null;
  });

  if (!res) return;
  if (!res.ok || !res.body) {
    const txt = await res.text().catch(() => "");
    handler.onError(`Coach error ${res.status}: ${txt.slice(0, 200)}`);
    handler.onDone();
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf("\n\n")) >= 0) {
        const frame = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        parseFrame(frame, handler);
      }
    }
  } catch (e) {
    handler.onError(e instanceof Error ? e.message : String(e));
  } finally {
    handler.onDone();
  }
}

function parseFrame(frame: string, handler: StreamHandler) {
  // Anthropic SSE frames: `event: <type>\ndata: <json>`
  const lines = frame.split("\n");
  let eventType = "";
  let data = "";
  for (const line of lines) {
    if (line.startsWith("event:")) eventType = line.slice(6).trim();
    else if (line.startsWith("data:")) data += line.slice(5).trim();
  }
  if (!data) return;
  if (eventType === "content_block_delta") {
    try {
      const parsed = JSON.parse(data) as { delta?: { type?: string; text?: string } };
      if (parsed.delta?.type === "text_delta" && parsed.delta.text) {
        handler.onDelta(parsed.delta.text);
      }
    } catch {
      // ignore malformed
    }
  } else if (eventType === "error") {
    try {
      const parsed = JSON.parse(data) as { error?: { message?: string } };
      handler.onError(parsed.error?.message ?? "Stream error");
    } catch {
      handler.onError("Stream error");
    }
  }
  // Other events (message_start, ping, message_delta, message_stop) don't need per-token action here.
}
