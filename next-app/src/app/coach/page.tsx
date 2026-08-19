"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Trash2, StopCircle } from "lucide-react";
import { useStore } from "@/lib/useStore";
import {
  coachConfigured,
  streamCoach,
  type ChatMessage,
} from "@/lib/coach-client";
import { cn } from "@/lib/utils";
import { ConfirmSheet } from "@/components/ConfirmSheet";

const HISTORY_KEY = "program.coach.history.v1";

const STARTER_PROMPTS_BY_PROGRAM: Record<string, string[]> = {
  "anterior-hip-rebuild": [
    "Look at my recent logs and tell me what to do this week.",
    "How's my squat progression looking against the milestones?",
    "The hip felt weak yesterday. Should I change today's session?",
    "Explain why today's prescription is what it is.",
  ],
  "engine-builder": [
    "Am I ready to add the Norwegian 4×4 yet?",
    "Look at my HR data — is my Z2 pace drifting?",
    "How's my submax HR trend against the week-8 retest?",
    "Should I take a rest day given my recent load?",
  ],
  "concurrent-strength-maintenance": [
    "Is my back squat still holding at pre-block level?",
    "Am I too close to the interference ceiling this week?",
    "The last hard row session felt heavy. Adjust today's lift?",
    "Explain why today's session is scheduled after yesterday's Z2.",
  ],
  "rowing-2k-test-prep": [
    "How's my 2K trend against the target?",
    "Given my last threshold session, what pace should I hold today?",
    "Am I tapering enough with the test date coming up?",
    "Should I move today's session — I have a WOD later.",
  ],
  "handstand-walk": [
    "Am I ready to graduate from wall to freestand?",
    "The wrist is complaining. Adjust today's drill selection?",
    "Explain the drill order — is this random practice or blocked?",
    "How's my freestand hold trending against the tier gate?",
  ],
  "overhead-mobility": [
    "How's my ROM trend? Have I hit the phase-2 gate?",
    "The shoulder felt tight yesterday. Change today's routine?",
    "Explain which mobility drill targets which position.",
  ],
};
type CoachExample = {
  questions: string[];
  weeklyReview: string;
  sessionDay: string;
  explain: string;
};
const EXAMPLE_BY_PROGRAM: Record<string, CoachExample> = {
  "anterior-hip-rebuild": {
    questions: [
      "is my squat progressing?",
      "the hip flared yesterday, should I train today?",
      "why is the plan giving me 92.5 kg?",
    ],
    weeklyReview:
      "Spot patterns in your training you'd miss — a squat stalling because bench day is too heavy, a symptom returning on a specific movement, a sleep drop the week before.",
    sessionDay:
      '"Given how yesterday went, what should I actually do today?" Answered against your data, not a template.',
    explain:
      "Why 92.5 kg? Why 5×5 not 3×8? Why this week and not last? The coach cites the program's evidence base.",
  },
  "engine-builder": {
    questions: [
      "am I ready to add the Norwegian 4×4?",
      "is my Z2 pace drifting?",
      "should I take a rest day given my recent load?",
    ],
    weeklyReview:
      "Spot patterns you'd miss — HR drift creeping up on the same Z2 pace, resting HR climbing after a heavy week, an easy run that stopped feeling easy.",
    sessionDay:
      '"Given how yesterday\'s Z2 went, should today be threshold or another Z1?" Answered against your data, not a template.',
    explain:
      "Why 45 min not 60? Why introduce the 4×4 in week 4 not 2? The coach cites the program's evidence base.",
  },
  "concurrent-strength-maintenance": {
    questions: [
      "is my back squat still holding at pre-block level?",
      "am I too close to the interference ceiling?",
      "why did the plan drop this week's Z2?",
    ],
    weeklyReview:
      "Spot patterns you'd miss — TM held or slipping, submax HR trend against week-8 target, hard-session count drifting above the interference ceiling.",
    sessionDay:
      '"Given yesterday\'s hard row, should I lift heavy today or hold?" Answered against your data, not a template.',
    explain:
      "Why 6h between hard cardio and heavy lift? Why the 4×4 on Thu not Tue? The coach cites Robineau + Schumann.",
  },
  "rowing-2k-test-prep": {
    questions: [
      "how's my 2K trend against my target?",
      "given last threshold, what pace should I hold today?",
      "am I tapering enough with the test coming up?",
    ],
    weeklyReview:
      "Spot patterns you'd miss — threshold split creeping up, HR drift on Z2, hard-session count drifting relative to your taper target.",
    sessionDay:
      '"Given yesterday\'s Z2, what pace should the 4×8 min be today?" Answered against your intake baseline, not a template.',
    explain:
      "Why 3×10 min not 4×8? Why race pace on Sat not Wed? The coach cites Mujika + Joyner-Coyle.",
  },
  "handstand-walk": {
    questions: [
      "am I ready to graduate from wall to freestand?",
      "the wrist is tight, adjust today's drill selection?",
      "why is my drill order shuffled this week?",
    ],
    weeklyReview:
      "Spot patterns you'd miss — freestand hold plateauing, wrist-symptom score creeping up, walk-distance test regressing after an obstacle week.",
    sessionDay:
      '"Given yesterday\'s wall session, is today a freestand day or a wrist prep day?" Answered against your capability profile.',
    explain:
      "Why blocked practice weeks 1-2 and random from week 3? Why these three drills today? The coach cites Shea & Morgan + Wulf & Shea.",
  },
  "overhead-mobility": {
    questions: [
      "did I hit the phase-2 ROM gate?",
      "the shoulder felt tight yesterday, change today's routine?",
      "which mobility drill targets which position?",
    ],
    weeklyReview:
      "Spot patterns you'd miss — ROM plateau on one side vs the other, shoulder symptoms returning on specific drills, adherence drift.",
    sessionDay:
      '"Given yesterday\'s tight shoulder, is today a full block or a modified one?" Answered against your data.',
    explain:
      "Why supine flexion instead of standing? Why this scap drill? The coach cites Kibler + Escamilla.",
  },
  default: {
    questions: [
      "look at my recent logs and tell me what to do this week",
      "am I on track for my retest metric?",
      "why is today's prescription what it is?",
    ],
    weeklyReview:
      "Spot patterns you'd miss — progress against your retest, sleep drops the week before a hard week, sessions where your notes said one thing and your log said another.",
    sessionDay:
      '"Given how yesterday went, what should I actually do today?" Answered against your data, not a template.',
    explain:
      "Why this session, this week, this dose? The coach cites the program's evidence base.",
  },
};

const DEFAULT_STARTERS = [
  "Which program fits me best right now?",
  "How does the app decide what I lift today?",
  "What signals do my logged sessions send back to the plan?",
  "How is this different from a template plan?",
];

export default function CoachPage() {
  const store = useStore((s) => s.store);
  const hydrated = useStore((s) => s.hydrated);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [pending, setPending] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const configured = coachConfigured();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    // P1-22 — respect prefers-reduced-motion. Smooth scroll on a chat
    // feed is churn for users with vestibular sensitivity.
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [messages, pending]);

  const send = async (text: string) => {
    if (!text.trim() || streaming) return;
    setError(null);
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);
    setPending("");
    const ac = new AbortController();
    abortRef.current = ac;
    let acc = "";
    await streamCoach(
      nextMessages,
      store,
      {
        onDelta: (t) => {
          acc += t;
          setPending(acc);
        },
        onError: (msg) => setError(msg),
        onDone: () => {
          setStreaming(false);
          abortRef.current = null;
          if (acc.trim()) {
            setMessages([...nextMessages, { role: "assistant", content: acc }]);
          }
          setPending("");
        },
      },
      ac.signal,
    );
  };

  const stop = () => {
    abortRef.current?.abort();
  };

  const clearHistory = () => {
    setConfirmClear(true);
  };
  const doClearHistory = () => {
    setConfirmClear(false);
    setMessages([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* ignore */
    }
  };

  if (!hydrated) return <div className="pt-8 text-sm text-muted">Loading…</div>;

  return (
    <div className="pt-4 pb-4 flex flex-col" style={{ minHeight: "calc(100dvh - 180px)" }}>
      <header className="flex items-baseline justify-between gap-3 mb-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-strong">Coach</h1>
          <p className="mt-1 text-sm text-muted">Reads your full history + clinical context each turn.</p>
        </div>
        {messages.length > 0 ? (
          <button
            type="button"
            onClick={clearHistory}
            aria-label="Clear conversation"
            className="w-11 h-11 flex items-center justify-center rounded hover:bg-surface-2 text-muted hover:text-red"
          >
            <Trash2 size={16} />
          </button>
        ) : null}
      </header>

      {!configured ? (
        <>
          <NotConfigured />
          {messages.length > 0 ? (
            <div className="mt-4 space-y-3">
              <p className="mono-caps">Prior conversation ({messages.length} messages)</p>
              {/* P2-15 — role="log" so SRs recognize the transcript as a
                  conversation feed. aria-atomic=false lets them read only
                  the new entry when a message lands, not the whole list. */}
              <div
                role="log"
                aria-live="polite"
                aria-atomic="false"
                className="rounded border border-line bg-surface p-3 space-y-3 max-h-[50vh] overflow-y-auto"
              >
                {messages.map((m, i) => (
                  <Bubble key={i} role={m.role} text={m.content} />
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-3 rounded border border-line bg-surface p-3 mb-3"
            style={{ maxHeight: "calc(100dvh - 320px)", minHeight: 240 }}
          >
            {messages.length === 0 && !pending ? (
              <Empty onPick={send} activeSlug={store.user_profile?.active_program_id ?? null} />
            ) : null}
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} text={m.content} />
            ))}
            {pending ? <Bubble role="assistant" text={pending} streaming /> : null}
            {error ? (
              <div className="border-l-4 border-red bg-red/10 rounded-r px-3 py-2 text-[14px]">
                <strong>Coach error:</strong> {error}
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 items-end"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask about your plan, form, symptoms…  ⌘⏎ to send"
              rows={2}
              aria-label="Ask the coach a question"
              className="flex-1 text-sm px-3 py-2 min-h-[48px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze resize-none font-sans"
            />
            {streaming ? (
              <button
                type="button"
                onClick={stop}
                aria-label="Stop response"
                className="w-11 h-11 flex items-center justify-center rounded border border-amber text-amber hover:bg-amber/10"
              >
                <StopCircle size={18} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className="w-11 h-11 flex items-center justify-center rounded bg-bronze text-ground hover:bg-bronze-hover disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            )}
          </form>

          <p className="text-[11px] text-muted mt-2 italic">
            Coach reads your logs, TMs, symptoms, milestones, and clinical constraints each turn. Nothing is stored on the server.
          </p>
        </>
      )}
      <ConfirmSheet
        open={confirmClear}
        title="Clear the coach conversation?"
        body="This deletes every message in this session. Cannot be undone."
        confirmLabel="Clear"
        danger
        onConfirm={doClearHistory}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}

function Empty({ onPick, activeSlug }: { onPick: (t: string) => void; activeSlug: string | null }) {
  const prompts =
    (activeSlug && STARTER_PROMPTS_BY_PROGRAM[activeSlug]) || DEFAULT_STARTERS;
  return (
    <div className="text-center text-muted text-[14px] space-y-4 py-6">
      <p>Ask anything about your program, form, or how the plan is progressing.</p>
      <div className="space-y-2 max-w-md mx-auto">
        {prompts.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPick(p)}
            className="w-full text-left text-[14px] px-3 py-2 rounded border border-line bg-surface hover:bg-surface-2 hover:border-bronze transition-colors"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

function Bubble({
  role,
  text,
  streaming,
}: {
  role: "user" | "assistant";
  text: string;
  streaming?: boolean;
}) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2 text-[14px] whitespace-pre-wrap",
          role === "user"
            ? "bg-bronze/20 text-strong border border-bronze/30"
            : "bg-surface-2 text-ink border border-line-soft",
        )}
      >
        {text}
        {streaming ? <span className="inline-block ml-1 w-1.5 h-4 bg-bronze align-middle motion-safe:animate-pulse" aria-hidden /> : null}
      </div>
    </div>
  );
}

function NotConfigured() {
  const activeSlug = useStore((s) => s.store.user_profile?.active_program_id);
  const example =
    EXAMPLE_BY_PROGRAM[activeSlug ?? ""] ?? EXAMPLE_BY_PROGRAM.default;
  return (
    <div className="space-y-4">
      <div className="rounded border border-line bg-surface p-5 space-y-3">
        <div className="mono-caps text-bronze">Coming soon</div>
        <h2 className="text-xl font-semibold text-strong">
          A coach that reads your whole log every time you ask.
        </h2>
        <p className="text-sm text-ink leading-relaxed">
          Plain-English questions like &ldquo;{example.questions[0]}&rdquo; — answered
          against every session you&apos;ve logged and the research your program is built on.
        </p>
      </div>

      <p className="text-[14px] text-muted italic">
        Meanwhile: keep logging on Today. When the coach lands, your history is what it reads.
      </p>
    </div>
  );
}
