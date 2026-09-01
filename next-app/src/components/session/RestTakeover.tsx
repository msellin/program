"use client";

import { useEffect, useRef, useState } from "react";
import { useStore, entrySets } from "@/lib/useStore";
import { announce } from "@/lib/announce";
import { playCountdownTick, playTimerComplete } from "@/lib/sound";
import type { RailExercise } from "@/components/session/DaySession";
import type { UpNext } from "@/components/session/shared/advance";

/**
 * The scale bottomed out at RPE 7 until 2026-09-01, and that cost real
 * accuracy. `inferTMFromSet` derives reps-in-reserve as `10 - rpe`, so the
 * lowest thing a lifter could say was "3 in reserve". On 31 Aug the founder ran
 * an AMRAP top set at 95 kg × 9 with roughly five left; the honest entry did
 * not exist, and the engine's training-max estimate came out ~5 kg low on the
 * single number the whole strength track is built from.
 *
 * Labels lead with reps-in-reserve because that is the question a lifter can
 * actually answer after an AMRAP — "how many more could you have done" — and it
 * is exactly what the engine converts the RPE back into. Easy/Solid/Grind are
 * kept as the familiar wording for fixed-rep sets.
 */
const EFFORTS = [
  { label: "Plenty left", rir: "4-5+ in reserve", rpe: 5 },
  { label: "Easy", rir: "~3 in reserve", rpe: 7 },
  { label: "Solid", rir: "~2 in reserve", rpe: 8 },
  { label: "Grind", rir: "0-1 in reserve", rpe: 9 },
] as const;

/**
 * Screens "4a resting" / "6a" from the Day redesign — a full-screen
 * takeover (`position: fixed; inset: 0`), because rest is the only
 * moment the lifter is actually looking at the phone. The countdown
 * logic (interval, vibrate, sound, screen-reader announce at 30s/zero)
 * is ported from `RestTimer.tsx`, not rewritten — same behavior, new
 * full-screen presentation instead of a bottom-fixed widget.
 *
 * Deliberately does NOT touch `lib/useTimer.ts`'s shared store. That
 * store also drives the OLD bottom-fixed `RestTimerHost`/`RestTimer`
 * widget, still live on `/off-plan` (the pre-redesign ExerciseCard/
 * SetRow flow) and mounted app-wide via `AppShell`. `targetSeconds`
 * comes in as a plain prop instead, so this component's countdown is
 * fully self-contained — no risk of both timers firing (double
 * vibration/sound/announce) on this route.
 *
 * Answering the effort prompt is optional and costs nothing (the engine
 * already infers difficulty from reps hit vs. prescribed) — the timer
 * runs and auto-advances regardless of whether it's answered.
 */
export function RestTakeover({
  active,
  justLoggedSetIndex,
  targetSeconds,
  railExercises,
  upNext,
  effortAnswered,
  onEffortAnswered,
  date,
  onDone,
  onJump,
  onOpenNoteSheet,
}: {
  active: RailExercise;
  justLoggedSetIndex: number;
  targetSeconds: number;
  railExercises: RailExercise[];
  /** Where the timer will actually land. Drives the "Next up" copy. */
  upNext: UpNext;
  effortAnswered: boolean;
  onEffortAnswered: (v: boolean) => void;
  date: string;
  onDone: () => void;
  onJump: (key: string) => void;
  onOpenNoteSheet: () => void;
}) {
  const updateSet = useStore((s) => s.updateSet);
  const store = useStore((s) => s.store);

  // Seconds the user has added with +30s. Kept separate from `elapsed`
  // so the timer EXTENDS rather than rewinds (2026-08-24): the button
  // used to do `setElapsed(e => Math.max(0, e - 30))`, which clamped at
  // zero — so tapping it inside the first 30 seconds snapped the display
  // back to the full duration instead of adding anything, and remaining
  // could never exceed the original target at all.
  const [extra, setExtra] = useState(0);
  const target = targetSeconds + extra;
  const [elapsed, setElapsed] = useState(0);
  const [selectedEffort, setSelectedEffort] = useState<(typeof EFFORTS)[number]["label"] | null>(null);
  const [jumpOpen, setJumpOpen] = useState(false);
  // The countdown effect runs once, so `target` inside it would be the
  // mount-time value forever. A ref, refreshed every render, is what the
  // interval reads.
  const targetRef = useRef(target);
  useEffect(() => {
    targetRef.current = target;
  }, [target]);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const announced30sRef = useRef(false);
  // Which of the 3-2-1 ticks have already fired. A Set rather than a
  // counter because +30s can push `remaining` back above 3, and the
  // lead-in should then play again on the way down.
  const tickedRef = useRef<Set<number>>(new Set());
  // Completion (vibrate/sound/announce/onDone) fires once via
  // `doneFiredRef` guarding the interval callback itself — no separate
  // "did we hit zero" state, no reactive effect keyed on it.
  const doneFiredRef = useRef(false);

  useEffect(() => {
    announce(`Rest timer started, ${target} seconds.`);
    tick.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        const t = targetRef.current;
        const remaining = Math.max(0, t - next);
        if (!announced30sRef.current && remaining === 30) {
          announce("30 seconds remaining.");
          announced30sRef.current = true;
        }
        // Audible 3-2-1. The chime alone was easy to miss mid-workout;
        // this gives you a beat to put the bar down and look up.
        if (remaining > 0 && remaining <= 3 && !tickedRef.current.has(remaining)) {
          tickedRef.current.add(remaining);
          playCountdownTick();
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate?.(25);
          }
        }
        if (next >= t && !doneFiredRef.current) {
          doneFiredRef.current = true;
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate?.([80, 60, 80]);
          }
          playTimerComplete();
          announce("Rest complete.");
          onDone();
        }
        return next;
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remaining = Math.max(0, target - elapsed);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const fmt = `${mins}:${String(secs).padStart(2, "0")}`;
  const pct = Math.min(1, elapsed / target) * 100;

  const existingNote = (store.logs[date]?.exercises[active.key]?.notes ?? "").trim();
  const justLogged = entrySets(store.logs[date]?.exercises[active.key] ?? null)[justLoggedSetIndex];
  const summary =
    justLogged?.weight_kg != null && justLogged?.reps != null
      ? `Logged · ${justLogged.weight_kg} kg × ${justLogged.reps}`
      : null;

  const selectEffort = (effort: (typeof EFFORTS)[number]) => {
    setSelectedEffort(effort.label);
    onEffortAnswered(true);
    updateSet(active.blockId, active.exercise.id, justLoggedSetIndex, { rpe: effort.rpe }, date);
    if (effort.label === "Grind") onOpenNoteSheet();
  };

  const skip = () => {
    onDone();
  };

  return (
    <div data-surface="RestTakeover" className="fixed inset-0 z-40 bg-ground flex flex-col">
      <div className="flex-shrink-0 px-[22px] pt-1">
        <div className="h-[3px] bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full bg-slate rounded-full transition-[width]" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center min-h-0">
        <p className="font-mono text-[11px] uppercase tracking-[.18em] text-slate mb-[18px]">Rest</p>
        <p className="text-[104px] leading-[.9] font-semibold tracking-[-.05em] text-strong mb-2">{fmt}</p>
        {effortAnswered && selectedEffort ? (
          <p className="text-[14.5px] text-line">
            {selectedEffort} · {EFFORTS.find((e) => e.label === selectedEffort)?.rir}
            {" · "}
            <button type="button" onClick={() => onEffortAnswered(false)} className="text-slate">
              change
            </button>
          </p>
        ) : upNext.kind !== "done" ? (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[.16em] text-line mb-2">Next up</p>
            <p className="text-[20px] font-semibold text-strong mb-1 tracking-[-.02em]">
              {upNext.kind === "set"
                ? `Set ${upNext.setIndex + 1} of ${upNext.rail.rowCount}`
                : upNext.rail.suggestion
                  ? `${upNext.rail.suggestion.top_set.kg} kg × ${upNext.rail.suggestion.top_set.reps}`
                  : `${upNext.rail.rowCount} sets`}
            </p>
            <p className="text-[14.5px] text-ink">{upNext.rail.exercise.name}</p>
          </>
        ) : (
          <p className="text-[14.5px] text-line">{summary ?? ""}</p>
        )}
      </div>
      <div className="flex-shrink-0 px-[22px] pb-[22px] flex flex-col gap-3.5">
        {/* 2026-09-01 — the effort picker used to sit inside the
            `upNext.kind !== "done"` branch above, so the FINAL set of a session
            was never asked how it went. That is the set most worth asking
            about: it is where an AMRAP lands and where fatigue shows. The
            picker now renders independently of what comes next. */}
        {!effortAnswered ? (
          <div className="border border-line-strong rounded-xl bg-surface px-[14px] pt-[15px] pb-3.5">
            <p className="text-[15.5px] font-semibold text-strong mb-1 tracking-[-.01em]">How was that?</p>
            <p className="text-[13px] text-ink mb-3">How many more could you have done? This sets your training max.</p>
            <div className="flex gap-2">
              {EFFORTS.map((effort) => (
                <button
                  key={effort.label}
                  type="button"
                  onClick={() => selectEffort(effort)}
                  className={
                    "flex-1 h-[66px] rounded-[10px] border " +
                    (selectedEffort === effort.label
                      ? "border-bronze bg-[rgba(200,150,102,.14)]"
                      : "border-line-strong bg-surface-2")
                  }
                >
                  <span className="block text-[13.5px] font-semibold text-strong leading-tight">{effort.label}</span>
                  <span
                    className={
                      "block font-mono text-[9px] mt-0.5 leading-tight " +
                      (selectedEffort === effort.label ? "text-bronze" : "text-line")
                    }
                  >
                    {effort.rir}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => {
              setExtra((x) => x + 30);
              // Past the 30-second warning already? Adding time puts us
              // back above it, so let it fire again on the way down.
              if (Math.max(0, target - elapsed) <= 30) announced30sRef.current = false;
              tickedRef.current.clear();
            }}
            aria-label="Add 30 seconds to the rest timer"
            className="flex-shrink-0 w-24 h-[58px] rounded-[10px] border border-line-strong text-ink text-[14.5px]"
          >
            +30s
            {extra > 0 ? (
              <span className="block font-mono text-[9.5px] text-line leading-none mt-0.5">
                +{extra}s added
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={skip}
            className="flex-1 h-[58px] rounded-[10px] border border-line-strong bg-surface-2 text-strong text-[16px] font-semibold"
          >
            Skip rest
          </button>
        </div>
        {/* A7 (2026-08-26): note capture was reachable two ways, both
            buried — `⋯` → "Note for this exercise", or an auto-open that
            fired ONLY if you tapped "Grind". Rest is the one moment in a
            session you are actually holding the phone, so the affordance
            belongs here unconditionally. Shows what you already wrote, so
            the loop closes: notes stopped being write-only. */}
        <button
          type="button"
          onClick={onOpenNoteSheet}
          className="w-full flex items-center justify-between gap-2.5 rounded border border-line-soft bg-surface px-3.5 py-2.5 text-left"
        >
          <span className="min-w-0">
            <span className="block text-[13.5px] text-ink">
              {existingNote ? "Note" : "Add a note"}
            </span>
            {existingNote ? (
              <span className="block text-[12.5px] italic text-slate truncate">
                “{existingNote}”
              </span>
            ) : null}
          </span>
          <span className="flex-shrink-0 text-[14px] text-line">›</span>
        </button>
        <button
          type="button"
          onClick={() => setJumpOpen(true)}
          className="w-full h-10 text-ink text-[14px]"
        >
          Do something else next
        </button>
      </div>

      {jumpOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Jump to"
          onClick={() => setJumpOpen(false)}
          className="fixed inset-0 z-50 bg-ground/70 flex flex-col justify-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-surface border-t border-line-strong rounded-t-[16px] px-5 pt-[18px] pb-[calc(22px+env(safe-area-inset-bottom))]"
          >
            <p className="text-[16px] font-semibold text-strong mb-1 tracking-[-.015em]">Jump to</p>
            <p className="text-[13.5px] leading-snug text-ink mb-3.5">
              Order isn&apos;t sacred. The log records what you actually did, in the order you did it.
            </p>
            <div className="flex flex-col gap-[7px] mb-3">
              {railExercises.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => {
                    setJumpOpen(false);
                    onJump(r.key);
                  }}
                  className="flex items-center justify-between gap-3 rounded border border-line-soft bg-ground px-3.5 py-3"
                >
                  <span className="text-[14.5px] font-semibold text-strong tracking-[-.01em]">
                    {r.exercise.name}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setJumpOpen(false)}
              className="w-full h-[50px] rounded-[10px] border border-line-strong text-ink text-[15px]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
