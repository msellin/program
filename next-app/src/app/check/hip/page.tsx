"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { HIP_FLEXOR_PACK, scoreKeysFor, type AssessmentQuestion } from "@/lib/assessments-data";
import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import { VideoModal } from "@/components/VideoModal";

/**
 * Guided flow through a fixed pack of self-tests. Deliberately linear —
 * intro screen, one question per step, review + submit. Anything the user
 * doesn't understand is explained inline; the video-search link is one tap.
 *
 * No medical claims. Every question stores a 0-10 score keyed by
 * `<question_id>` or `<question_id>:left` / `<question_id>:right`.
 */
export default function HipCheckPage() {
  const pack = HIP_FLEXOR_PACK;
  const recordAssessment = useStore((s) => s.recordAssessment);

  const steps = useMemo(() => buildSteps(pack.questions), [pack.questions]);
  const [stepIdx, setStepIdx] = useState(-1); // -1 = intro
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = steps.length;
  const isIntro = stepIdx === -1;
  const isReview = stepIdx === totalSteps;
  const current = !isIntro && !isReview ? steps[stepIdx] : null;

  const missingKeys = scoreKeysFor(pack).filter((k) => scores[k] == null);

  if (submitted) {
    return (
      <div className="mt-8 space-y-4">
        <div className="rounded border border-green/40 bg-green/10 p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-green mb-1">
            Logged
          </p>
          <p className="text-[14px] text-ink">
            Your hip check is saved. You&apos;ll see the trend on the Progress page. Next check
            is scheduled in {pack.cadence_days} days.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/progress"
            className="font-mono text-[11.5px] uppercase tracking-wider px-3 py-2 rounded border border-line hover:bg-line-soft"
          >
            View progress
          </Link>
          <Link
            href="/"
            className="font-mono text-[11.5px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground"
          >
            Back to today
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-5">
      <header className="space-y-1">
        <p className="mono-caps">Hip check</p>
        <h1 className="text-2xl font-semibold tracking-tight text-strong">{pack.name}</h1>
        {!isIntro && !isReview ? (
          <p className="text-[12px] text-muted">
            Step {stepIdx + 1} of {totalSteps}
          </p>
        ) : null}
      </header>

      {isIntro ? (
        <IntroPanel
          pack={pack}
          onStart={() => setStepIdx(0)}
        />
      ) : isReview ? (
        <ReviewPanel
          pack={pack}
          scores={scores}
          notes={notes}
          setNotes={setNotes}
          missingKeys={missingKeys}
          onBack={() => setStepIdx(totalSteps - 1)}
          onSubmit={() => {
            recordAssessment(pack.id, todayISO(), scores, notes || undefined);
            setSubmitted(true);
          }}
          onJumpTo={(id) => {
            const idx = steps.findIndex((s) => s.key === id || s.key.startsWith(id + ":"));
            if (idx >= 0) setStepIdx(idx);
          }}
        />
      ) : current ? (
        <QuestionPanel
          step={current}
          value={scores[current.key]}
          onValue={(v) => setScores((prev) => ({ ...prev, [current.key]: v }))}
        />
      ) : null}

      {!isIntro ? (
        <nav className="flex items-center justify-between gap-2 pt-3 border-t border-line-soft">
          <button
            type="button"
            onClick={() => setStepIdx(stepIdx - 1)}
            className="font-mono text-[11.5px] uppercase tracking-wider inline-flex items-center gap-1 px-3 py-2 rounded border border-line hover:bg-line-soft"
          >
            <ChevronLeft size={14} />
            Back
          </button>
          {!isReview ? (
            <button
              type="button"
              onClick={() => setStepIdx(stepIdx + 1)}
              disabled={current ? scores[current.key] == null : false}
              className="font-mono text-[11.5px] uppercase tracking-wider inline-flex items-center gap-1 px-3 py-2 rounded bg-bronze text-ground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {stepIdx === totalSteps - 1 ? "Review" : "Next"}
              <ChevronRight size={14} />
            </button>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}

type Step = {
  key: string;
  question: AssessmentQuestion;
  side: "left" | "right" | null;
};

function buildSteps(questions: AssessmentQuestion[]): Step[] {
  const out: Step[] = [];
  for (const q of questions) {
    if (q.paired === "left_right") {
      out.push({ key: `${q.id}:left`, question: q, side: "left" });
      out.push({ key: `${q.id}:right`, question: q, side: "right" });
    } else {
      out.push({ key: q.id, question: q, side: null });
    }
  }
  return out;
}

function IntroPanel({
  pack,
  onStart,
}: {
  pack: typeof HIP_FLEXOR_PACK;
  onStart: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[14px] text-ink leading-relaxed">{pack.intro}</p>
      <div className="rounded border border-amber/40 border-l-4 border-l-amber bg-amber/10 p-3 text-[13px]">
        <p className="font-semibold text-strong mb-1">Ground rules</p>
        <p>{pack.safety}</p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="font-mono text-[12px] uppercase tracking-wider px-4 py-3 rounded bg-bronze text-ground hover:bg-bronze/90"
      >
        Start check ({pack.questions.length} items)
      </button>
    </div>
  );
}

function QuestionPanel({
  step,
  value,
  onValue,
}: {
  step: Step;
  value: number | undefined;
  onValue: (v: number) => void;
}) {
  const q = step.question;
  const sideLabel = step.side ? (step.side === "left" ? "Left side" : "Right side") : null;
  const [videoOpen, setVideoOpen] = useState(false);
  return (
    <div className="space-y-4">
      <div>
        {sideLabel ? (
          <p className="mono-caps text-slate mb-1">{sideLabel}</p>
        ) : null}
        <h2 className="text-[17px] font-semibold text-strong leading-snug">{q.label}</h2>
      </div>

      <div className="rounded border border-line-soft bg-surface p-3 text-[13.5px] leading-relaxed space-y-2">
        <div>
          <p className="mono-caps text-muted mb-1">How to do it</p>
          <p>{q.method}</p>
        </div>
        <div>
          <p className="mono-caps text-muted mb-1">What the score means</p>
          <p>{q.interpret}</p>
        </div>
        {q.video_search ? (
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            className="inline-block text-[12.5px] text-slate border-b border-slate"
          >
            Watch a demo →
          </button>
        ) : null}
      </div>

      <ScoreSlider value={value} onValue={onValue} scale={q.scale} />

      {videoOpen && q.video_search ? (
        <VideoModal
          title={q.label}
          searchQuery={q.video_search}
          onClose={() => setVideoOpen(false)}
        />
      ) : null}
    </div>
  );
}

function ScoreSlider({
  value,
  onValue,
  scale,
}: {
  value: number | undefined;
  onValue: (v: number) => void;
  scale: AssessmentQuestion["scale"];
}) {
  const active = value != null;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-muted">
        <span>{scale.low_label} · 0</span>
        <span className="text-[20px] font-mono text-strong tabular-nums">
          {active ? value : "—"}
        </span>
        <span>10 · {scale.high_label}</span>
      </div>
      <div className="grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }).map((_, i) => {
          const selected = value === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onValue(i)}
              className={
                "h-11 rounded font-mono text-[13px] tabular-nums " +
                (selected
                  ? "bg-bronze text-ground"
                  : "bg-line-soft text-muted hover:bg-line hover:text-ink")
              }
              aria-label={`Score ${i}`}
              aria-pressed={selected}
            >
              {i}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReviewPanel({
  pack,
  scores,
  notes,
  setNotes,
  missingKeys,
  onBack: _onBack,
  onSubmit,
  onJumpTo,
}: {
  pack: typeof HIP_FLEXOR_PACK;
  scores: Record<string, number>;
  notes: string;
  setNotes: (v: string) => void;
  missingKeys: string[];
  onBack: () => void;
  onSubmit: () => void;
  onJumpTo: (id: string) => void;
}) {
  const anyMissing = missingKeys.length > 0;
  return (
    <div className="space-y-4">
      <h2 className="text-[17px] font-semibold text-strong">Review your scores</h2>
      <ul className="space-y-2">
        {pack.questions.map((q) => (
          <li key={q.id} className="rounded border border-line-soft bg-surface p-3">
            <button
              type="button"
              onClick={() => onJumpTo(q.id)}
              className="w-full text-left"
            >
              <p className="font-semibold text-strong text-[14px]">{q.label}</p>
              {q.paired === "left_right" ? (
                <div className="flex gap-4 mt-1 font-mono text-[13px]">
                  <span>L: <strong>{scores[`${q.id}:left`] ?? "—"}</strong></span>
                  <span>R: <strong>{scores[`${q.id}:right`] ?? "—"}</strong></span>
                </div>
              ) : (
                <p className="mt-1 font-mono text-[13px]">
                  Score: <strong>{scores[q.id] ?? "—"}</strong>
                </p>
              )}
            </button>
          </li>
        ))}
      </ul>

      <div>
        <label
          htmlFor="hip-check-notes"
          className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1"
        >
          Notes (optional)
        </label>
        <textarea
          id="hip-check-notes"
          rows={2}
          placeholder="Anything unusual? Skipped a test? Note it here."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="block w-full max-w-full text-[13.5px] px-2 py-1.5 border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate resize-y min-h-[44px] break-words [overflow-wrap:anywhere] whitespace-pre-wrap"
        />
      </div>

      {anyMissing ? (
        <p className="text-[12.5px] text-amber">
          {missingKeys.length} unanswered item{missingKeys.length === 1 ? "" : "s"} — tap them
          above to fill in, or submit anyway if you skipped intentionally.
        </p>
      ) : null}

      <button
        type="button"
        onClick={onSubmit}
        className="font-mono text-[12px] uppercase tracking-wider inline-flex items-center gap-1 px-4 py-3 rounded bg-bronze text-ground hover:bg-bronze/90"
      >
        <Check size={14} />
        Log this hip check
      </button>
    </div>
  );
}
