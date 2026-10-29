"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/useStore";
import { announce } from "@/lib/announce";
import { playCountdownTick, playTimerComplete } from "@/lib/sound";
import { VideoModal } from "@/components/VideoModal";
import { ExerciseFigure } from "./ExerciseFigure";
import { DemoVideo } from "./DemoVideo";
import type { FollowStep, StepSide } from "@/lib/follow-along/steps";

/**
 * Guided follow-along player for accessory and mobility blocks (2026-10-19).
 *
 * Design frozen on the canvas ("D · Refined A") after the founder picked A
 * and a design / mobile / a11y panel reviewed it. The rules that came out of
 * that review, each of which an earlier draft got wrong:
 *
 * - Nothing starts by itself. Every set waits for Start, then 3-2-1 to get
 *   into position (WCAG 2.2.1; also: you are lying on the floor).
 * - Skip never logs. Only finished work is written, so the left/right record
 *   the engine reads stays true.
 * - The layout never moves between steps: fixed-size side chip, two reserved
 *   lines each for name and cue, an always-present 44px aux row.
 * - Timers run off wall-clock end times, so a locked phone does not freeze or
 *   drift a hold.
 * - "Something hurts" is always on screen and ends the session.
 *
 * Logging goes through `updateSet` with exactly the shape SetView writes, so
 * history cannot tell which surface logged a set (see follow-along/steps.ts
 * for the per-side setIndex rule).
 */

type Phase = "ready" | "count" | "work" | "rest" | "done";

const CHIP: Record<StepSide, { label: string; speak: string; bg: string; fg: string; ring: string }> = {
  L: { label: "LEFT", speak: "left side", bg: "#4a8894", fg: "#0e0f12", ring: "#4a8894" },
  R: { label: "RIGHT", speak: "right side", bg: "#a279a8", fg: "#0e0f12", ring: "#a279a8" },
  B: { label: "BOTH", speak: "both sides", bg: "#2e323b", fg: "#f4f5f7", ring: "#d6d9de" },
  E: { label: "EACH SIDE", speak: "each side, alternating", bg: "#2e323b", fg: "#f4f5f7", ring: "#d6d9de" },
};
const RING = 2 * Math.PI * 80;

export function FollowAlong({
  title,
  steps,
  initialIndex = 0,
  date,
  onExit,
}: {
  title: string;
  steps: FollowStep[];
  /** Start on this step (a move tapped in the Brief's follow-along card). */
  initialIndex?: number;
  date: string;
  onExit: () => void;
}) {
  const updateSet = useStore((s) => s.updateSet);
  const [idx, setIdx] = useState(initialIndex);
  const [phase, setPhase] = useState<Phase>("ready");
  const [endAt, setEndAt] = useState(0);
  const [pausedLeft, setPausedLeft] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [results, setResults] = useState<Record<number, "done" | "skip">>({});
  const [hurt, setHurt] = useState(false);
  const [video, setVideo] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [skipArmed, setSkipArmed] = useState(false);
  // What each finished set recorded, so Back can show it read-only.
  const [logged, setLogged] = useState<Record<number, { reps: number; seconds: number | null }>>({});
  // Read-only look at an earlier set. The live position (idx/phase/count) is
  // untouched; the clock is frozen with `leftMs` and re-armed on return.
  const [review, setReview] = useState<{ target: number; leftMs: number | null; frozen: number } | null>(null);
  const anim = useRef({ start: 0, frozen: 0 });
  const [now, setNow] = useState(() => Date.now());
  const doneHeading = useRef<HTMLHeadingElement>(null);

  const step = steps[Math.min(idx, steps.length - 1)];
  const next = steps[idx + 1] ?? null;
  const paused = pausedLeft != null;
  const msLeft = paused ? pausedLeft : Math.max(0, endAt - now);
  const secLeft = Math.ceil(msLeft / 1000);

  // The clock: a 250 ms wall-clock tick, plus an immediate tick when the app
  // comes back to the foreground (iOS suspends intervals in a hidden web view).
  // Each tick runs `tick.current`, the phase machine below, with fresh state.
  const tick = useRef<(t: number) => void>(() => {});
  useEffect(() => {
    const run = () => {
      const t = Date.now();
      setNow(t);
      tick.current(t);
    };
    const id = setInterval(run, 250);
    document.addEventListener("visibilitychange", run);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", run);
    };
  }, []);

  // Keep the screen awake while the player is open (iOS 18.4+ in a home-screen app).
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    const request = () => {
      nav.wakeLock?.request("screen").then((l) => (lock = l)).catch(() => {});
    };
    request();
    const vis = () => document.visibilityState === "visible" && request();
    document.addEventListener("visibilitychange", vis);
    return () => {
      document.removeEventListener("visibilitychange", vis);
      lock?.release().catch(() => {});
    };
  }, []);

  const goTo = useCallback(
    (i: number) => {
      if (i >= steps.length) {
        setPhase("done");
        announce("Session done.");
        return;
      }
      const s = steps[i];
      setIdx(i);
      setPhase("ready");
      setCount(0);
      setPausedLeft(null);
      announce(`${s.name}, ${CHIP[s.side].speak}, set ${s.set} of ${s.of}.`);
    },
    [steps],
  );

  const log = useCallback(
    (s: FollowStep, reps: number, seconds: number | null) => {
      updateSet(
        s.blockId,
        s.exerciseId,
        s.setIndex,
        { weight_kg: null, failed: false, reps, ...(seconds != null ? { seconds } : {}) },
        date,
      );
    },
    [updateSet, date],
  );

  const completeSet = useCallback(
    (reps: number, seconds: number | null) => {
      const s = steps[idx];
      if (reps > 0) log(s, reps, seconds);
      setLogged((l) => {
        const { [idx]: _drop, ...rest } = l;
        return reps > 0 ? { ...rest, [idx]: { reps, seconds } } : rest;
      });
      setResults((r) => ({ ...r, [idx]: reps > 0 ? "done" : "skip" }));
      const n = steps[idx + 1];
      if (!n) {
        setPhase("done");
        announce("Session done.");
        return;
      }
      if (s.restSeconds <= 0) {
        goTo(idx + 1);
        return;
      }
      setPhase("rest");
      setPausedLeft(null);
      setEndAt(Date.now() + s.restSeconds * 1000);
      const switching = n.exerciseId === s.exerciseId && n.setIndex === s.setIndex;
      announce(switching ? `Rest. Next, ${CHIP[n.side].speak}.` : `Rest. Next, ${n.name}.`);
    },
    [steps, idx, log, goTo],
  );

  // Phase transitions, driven by the clock tick (not by render).
  const lastTick = useRef<number | null>(null);
  useEffect(() => {
    tick.current = (t: number) => {
      if (paused || review) return;
      const left = Math.max(0, endAt - t);
      const sec = Math.ceil(left / 1000);
      if (phase === "count") {
        if (sec !== lastTick.current && sec > 0) {
          lastTick.current = sec;
          playCountdownTick();
        }
        if (left <= 0) {
          lastTick.current = null;
          anim.current = { start: t, frozen: 0 };
          setPhase("work");
          if (step.kind === "hold") setEndAt(t + (step.seconds ?? 0) * 1000);
          announce("Go.");
        }
      } else if (phase === "work" && step.kind === "hold") {
        if (left <= 0) {
          playTimerComplete();
          if ("vibrate" in navigator) navigator.vibrate?.([80, 60, 80]);
          completeSet(1, step.seconds ?? 0);
        } else if (sec === 5 && lastTick.current !== 5) {
          lastTick.current = 5;
          announce("5 seconds left.");
        }
      } else if (phase === "rest" && left <= 0) {
        goTo(idx + 1);
      }
    };
  }, [paused, review, endAt, phase, step, idx, completeSet, goTo]);

  useEffect(() => {
    if (phase === "done") doneHeading.current?.focus();
  }, [phase]);

  // Before Start the figure demonstrates the movement on its own clock (founder-feedback round 2, 2026-10-29: a
  // still pose until Start read as "this one doesn't animate"); Start resets it so the set's own clock begins at 0.
  // Rest and pause stay still; reduced motion is handled inside ExerciseFigure.
  const preview = useRef(0);
  useEffect(() => {
    if (phase === "ready") preview.current = Date.now();
  }, [phase, idx]);
  const getElapsed = useCallback(() => {
    if (phase === "ready") return Date.now() - preview.current;
    if (phase !== "work") return 0;
    return paused ? anim.current.frozen : Date.now() - anim.current.start;
  }, [phase, paused]);

  const pause = () => {
    anim.current.frozen = Date.now() - anim.current.start;
    setPausedLeft(msLeft);
  };
  const resume = () => {
    anim.current.start = Date.now() - anim.current.frozen;
    setEndAt(Date.now() + (pausedLeft ?? 0));
    setPausedLeft(null);
  };

  const startReview = () => {
    setSkipArmed(false);
    const target = phase === "rest" ? idx : idx - 1;
    if (target < 0) return;
    setReview({ target, leftMs: paused || phase === "ready" ? null : msLeft, frozen: Date.now() - anim.current.start });
  };
  const stepReviewBack = () => setReview((r) => (r && r.target > 0 ? { ...r, target: r.target - 1 } : r));
  const returnFromReview = () => {
    if (!review) return;
    if (review.leftMs != null) {
      setEndAt(Date.now() + review.leftMs);
      setNow(Date.now());
    }
    anim.current.start = Date.now() - review.frozen;
    setReview(null);
  };
  const redoReviewed = () => {
    if (!review) return;
    const t = review.target;
    setResults((r) => {
      const { [t]: _drop, ...rest } = r;
      return rest;
    });
    setLogged((l) => {
      const { [t]: _drop, ...rest } = l;
      return rest;
    });
    setReview(null);
    goTo(t);
  };
  const reviewed = review ? steps[review.target] : null;
  const reviewedResult = review ? results[review.target] : undefined;
  const reviewedLog = review ? logged[review.target] : undefined;

  const repWork = phase === "work" && step.kind === "reps";
  const chip = CHIP[step.side];

  let primaryLabel = "Start";
  let onPrimary = () => {
    setPhase("count");
    setPausedLeft(null);
    setEndAt(Date.now() + 3000);
  };
  if (phase === "count") {
    primaryLabel = "Cancel";
    onPrimary = () => goTo(idx);
  } else if (phase === "work" && step.kind === "hold") {
    primaryLabel = paused ? "Resume" : "Pause";
    onPrimary = paused ? resume : pause;
  } else if (repWork) {
    primaryLabel = "Set done";
    // Not counting reps is normal: "Set done" with an untouched counter means the
    // set as prescribed. Logging nothing here lost every set a user didn't count.
    onPrimary = () => completeSet(count > 0 ? count : (step.reps ?? 1), null);
  } else if (phase === "rest") {
    primaryLabel = paused ? "Resume" : "Skip rest";
    onPrimary = paused ? resume : () => goTo(idx + 1);
  }

  let big = "";
  let caption = "";
  let frac = 1;
  if (phase === "ready") {
    big = String(step.kind === "hold" ? step.seconds : step.reps);
    caption = step.kind === "hold" ? "seconds" : step.side === "E" ? "each side" : "reps";
  } else if (phase === "count") {
    big = String(secLeft);
    caption = "get set";
    frac = msLeft / 3000;
  } else if (phase === "rest") {
    big = String(secLeft);
    caption = paused ? "paused" : "rest";
    frac = msLeft / (step.restSeconds * 1000);
  } else if (phase === "work" && step.kind === "hold") {
    big = String(secLeft);
    caption = paused ? "paused" : "hold";
    frac = msLeft / ((step.seconds ?? 1) * 1000);
  } else if (repWork) {
    big = String(count);
    caption = `of ${step.reps}`;
    frac = count / (step.reps ?? 1);
  }
  const ringColor = phase === "rest" ? "#5f6570" : chip.ring;
  const nextLine = next
    ? next.exerciseId === step.exerciseId && next.setIndex === step.setIndex
      ? `Next: ${CHIP[next.side].speak}`
      : `Next: ${next.name}`
    : "Last set";

  const loggedSets = useMemo(() => Object.values(results).filter((v) => v === "done").length, [results]);

  const progress = `${Math.round(((phase === "done" ? steps.length : idx) / steps.length) * 100)}%`;

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-center bg-ground pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-ink"
    >
      <div className="flex h-full w-full max-w-[430px] flex-col">
        <div className="flex h-11 flex-shrink-0 items-center gap-3 px-4 pt-2">
          <button
            type="button"
            onClick={onExit}
            aria-label="End follow-along"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
          <div className="h-1 flex-grow overflow-hidden rounded-full bg-line-soft" aria-hidden="true">
            <div className="h-1 bg-bronze" style={{ width: progress }} />
          </div>
        </div>

        {phase === "done" ? (
          <div className="flex flex-grow flex-col items-center justify-center gap-3.5 px-6 text-center">
            <h2 ref={doneHeading} tabIndex={-1} className="text-h1 font-bold text-strong outline-none">
              {hurt ? "Stopped" : `${title} done`}
            </h2>
            <p className="text-body text-muted">
              {hurt
                ? `${loggedSets} ${loggedSets === 1 ? "set" : "sets"} logged. Stopping early is fine.`
                : `${loggedSets} ${loggedSets === 1 ? "set" : "sets"} logged.`}
            </p>
            {hurt ? (
              <Link
                href="/check"
                className="mt-1 flex h-[52px] items-center rounded-xl bg-bronze px-7 font-bold text-ground"
              >
                Log what hurt
              </Link>
            ) : null}
            <button
              type="button"
              onClick={onExit}
              className={
                hurt
                  ? "flex h-11 items-center px-4 text-body font-semibold text-ink"
                  : "mt-1 flex h-[52px] items-center rounded-xl bg-bronze px-7 font-bold text-ground"
              }
            >
              {hurt ? "Back to Today" : "Back to session"}
            </button>
          </div>
        ) : (
          <>
            {review && reviewed ? (
              <div className="flex min-h-0 flex-grow flex-col items-center justify-center gap-3 px-6 text-center">
                <span className="font-mono text-caption tabular-nums text-muted">
                  Set {reviewed.set}/{reviewed.of} · Step {review.target + 1}/{steps.length}
                </span>
                <h2 className="text-h2 font-bold leading-[1.2] text-strong">{reviewed.name}</h2>
                <p className="text-small text-muted">{CHIP[reviewed.side].speak}</p>
                <p data-testid="review-result" className="text-body font-semibold text-ink">
                  {reviewedResult === "done" && reviewedLog
                    ? reviewedLog.seconds != null
                      ? `Logged: ${reviewedLog.seconds} seconds held`
                      : `Logged: ${reviewedLog.reps} ${reviewedLog.reps === 1 ? "rep" : "reps"}`
                    : reviewedResult === "skip"
                      ? "Skipped"
                      : "Not done"}
                </p>
                <button
                  type="button"
                  onClick={returnFromReview}
                  className="mt-2 flex h-[52px] items-center rounded-xl bg-bronze px-7 font-bold text-ground"
                >
                  Back to set {step.set}
                </button>
                <button
                  type="button"
                  onClick={redoReviewed}
                  className="flex h-11 items-center px-4 text-body font-semibold text-ink"
                >
                  Redo this set
                </button>
              </div>
            ) : (
            <div className="flex min-h-0 flex-grow flex-col px-4 pt-2">
              {step.figure || step.videoUrl ? (
                <div className="relative aspect-video w-full flex-shrink-0 overflow-hidden rounded-xl bg-surface [@media(max-height:700px)]:aspect-[2.3]">
                  {step.figure ? (
                    <ExerciseFigure
                      key={`${step.figure}-${step.side}`}
                      figure={step.figure}
                      side={step.side}
                      playing={(phase === "ready" || (phase === "work" && !paused)) && !demoOpen}
                      getElapsed={getElapsed}
                    />
                  ) : null}
                  {step.videoUrl ? (
                    <DemoVideo key={step.key} url={step.videoUrl} start={step.videoStart} end={step.videoEnd} title={step.name} onOpenChange={setDemoOpen} hasFigure={!!step.figure} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setVideo(true)}
                      aria-label="Find a demo video, opens a search"
                      className="absolute left-2.5 top-2.5 h-11 rounded-full bg-ground/70 px-3.5 text-caption font-semibold text-ink"
                    >
                      Find a demo <span aria-hidden="true">↗</span>
                    </button>
                  )}
                </div>
              ) : null}

              <div className="mt-3.5 flex h-7 flex-shrink-0 items-center justify-between">
                <span
                  className="flex h-7 w-[92px] items-center justify-center rounded-full text-caption font-bold tracking-[.06em]"
                  style={{ background: chip.bg, color: chip.fg }}
                >
                  {chip.label}
                </span>
                <span className="font-mono text-caption tabular-nums text-muted">
                  Set {step.set}/{step.of} · Step {idx + 1}/{steps.length}
                </span>
              </div>
              <h2 className="mt-2.5 line-clamp-2 h-[53px] flex-shrink-0 text-h2 font-bold leading-[1.2] text-strong">
                {step.name}
              </h2>
              <p className="mt-1 line-clamp-2 h-[44px] flex-shrink-0 text-body leading-[1.45] text-ink">
                {step.cue ?? ""}
              </p>
              {!step.figure && !step.videoUrl ? (
                <button
                  type="button"
                  onClick={() => setVideo(true)}
                  className="flex h-11 flex-shrink-0 items-center self-start text-caption font-semibold text-slate"
                >
                  Find a demo <span aria-hidden="true">↗</span>
                </button>
              ) : null}

              <div className="flex min-h-0 flex-grow flex-col items-center justify-center-safe gap-2 overflow-y-auto">
                <button
                  type="button"
                  onClick={repWork ? () => {
                    const n = Math.min(step.reps ?? 1, count + 1);
                    setCount(n);
                    announce(`Rep ${n} of ${step.reps}.`);
                  } : undefined}
                  disabled={!repWork}
                  aria-label={repWork ? `Rep ${count} of ${step.reps}. Tap to count the next rep` : `${big} ${caption}`}
                  className="relative h-[176px] w-[176px] flex-shrink-0 disabled:cursor-default [@media(max-height:700px)]:h-[124px] [@media(max-height:700px)]:w-[124px]"
                >
                  <svg width="100%" height="100%" viewBox="0 0 176 176" aria-hidden="true" className="absolute inset-0">
                    <circle cx="88" cy="88" r="80" fill="#16181c" stroke="#24272f" strokeWidth="10" />
                    <circle
                      cx="88"
                      cy="88"
                      r="80"
                      fill="none"
                      stroke={ringColor}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={RING}
                      strokeDashoffset={RING * (1 - Math.max(0, Math.min(1, frac)))}
                      transform="rotate(-90 88 88)"
                    />
                  </svg>
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                    <span
                      className={`font-mono text-[64px] font-semibold leading-none tabular-nums [@media(max-height:700px)]:text-[52px] ${phase === "rest" ? "text-[#93989f]" : "text-[#f4f5f7]"}`}
                    >
                      {big}
                    </span>
                    <span className="h-[18px] text-caption text-muted">{caption}</span>
                  </span>
                </button>
                <div className="flex h-11 w-full flex-shrink-0 items-center justify-center gap-2.5">
                  {repWork ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setCount((c) => Math.max(0, c - 1))}
                        className="h-11 w-[64px] rounded-xl border border-line text-body font-semibold text-ink"
                      >
                        −1
                      </button>
                      <button
                        type="button"
                        onClick={() => setCount((c) => Math.min(step.reps ?? 1, c + 1))}
                        className="h-11 w-[72px] rounded-xl border border-line text-body font-semibold text-ink"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => completeSet(step.reps ?? 1, null)}
                        className="h-11 w-[120px] rounded-xl border border-line text-body font-semibold text-ink"
                      >
                        Log all {step.reps}
                      </button>
                    </>
                  ) : phase === "rest" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => (paused ? setPausedLeft((p) => (p ?? 0) + 15000) : setEndAt((e) => e + 15000))}
                        className="h-11 w-[72px] rounded-xl border border-line text-body font-semibold text-ink"
                      >
                        +15 s
                      </button>
                      <span className="max-w-[240px] truncate text-caption text-muted">{nextLine}</span>
                    </>
                  ) : (
                    <span className="max-w-[300px] truncate text-caption text-muted">{nextLine}</span>
                  )}
                </div>
              </div>
            </div>
            )}

            <div className="flex flex-shrink-0 justify-center px-7 pt-1">
            <button
              type="button"
              onClick={() => {
                setHurt(true);
                setPhase("done");
                announce("Stopped. Note what hurt in your check.");
              }}
              className="min-h-[44px] w-auto px-5 flex-shrink-0 rounded-full border border-red-strong/45 text-caption font-semibold text-red-strong"
            >
              Something hurts
            </button>
            </div>
            <div className="grid flex-shrink-0 grid-cols-3 items-start px-7 pb-4 pt-2.5">
              <button
                type="button"
                // Back only looks: it never resets a set or changes a result.
                onClick={review ? stepReviewBack : startReview}
                className="flex flex-col items-center gap-1.5"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d6d9de" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </span>
                <span className="text-caption text-muted">Back</span>
              </button>
              <button type="button" onClick={onPrimary} disabled={!!review} className="-mt-2 flex flex-col items-center gap-1.5 disabled:opacity-40">
                <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-bronze" aria-hidden="true">
                  {primaryLabel === "Pause" || primaryLabel === "Skip rest" || primaryLabel === "Cancel" ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#0e0f12"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                  ) : primaryLabel === "Set done" ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0e0f12" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 12 10 17 19 7" /></svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#0e0f12"><polygon points="8 5 19 12 8 19 8 5" /></svg>
                  )}
                </span>
                <span className="w-24 text-center text-caption font-semibold text-ink">{primaryLabel}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  // A set in progress with reps counted needs a second tap.
                  if (phase === "work" && count > 0 && !skipArmed) {
                    setSkipArmed(true);
                    return;
                  }
                  setSkipArmed(false);
                  // During a rest the set at `idx` is already DONE; Skip means the
                  // upcoming one. Marking `idx` here overwrote finished work.
                  const target = phase === "rest" ? idx + 1 : idx;
                  setResults((r) => ({ ...r, [target]: "skip" }));
                  goTo(target + 1);
                }}
                disabled={!!review}
                className="flex flex-col items-center gap-1.5 disabled:opacity-40"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d6d9de" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
                <span className="text-caption text-muted">{skipArmed ? "Tap again" : "Skip set"}</span>
              </button>
            </div>
          </>
        )}
      </div>
      {video ? (
        <VideoModal
          title={step.name}
          videoUrl={step.videoUrl}
          searchQuery={step.videoSearch}
          onClose={() => setVideo(false)}
        />
      ) : null}
    </div>
  );
}
