"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/useStore";
import { announce } from "@/lib/announce";
import { playCountdownTick, playTimerComplete } from "@/lib/sound";
import { VideoModal } from "@/components/VideoModal";
import { ExerciseFigure } from "./ExerciseFigure";
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
  const [skipArmed, setSkipArmed] = useState(false);
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
      if (paused) return;
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
  }, [paused, endAt, phase, step, idx, completeSet, goTo]);

  useEffect(() => {
    if (phase === "done") doneHeading.current?.focus();
  }, [phase]);

  const getElapsed = useCallback(() => {
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
    onPrimary = () => completeSet(count, null);
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
      className="fixed inset-0 z-[60] flex justify-center bg-ground text-ink"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
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
            <h2 ref={doneHeading} tabIndex={-1} className="text-[28px] font-bold text-strong outline-none">
              {hurt ? "Stopped" : `${title} done`}
            </h2>
            <p className="text-[15px] text-muted">
              {hurt
                ? `${loggedSets} ${loggedSets === 1 ? "set" : "sets"} logged. Stopping early is fine.`
                : `${loggedSets} ${loggedSets === 1 ? "set" : "sets"} logged.`}
            </p>
            {hurt ? (
              <Link
                href="/check"
                className="mt-1 flex h-[52px] items-center rounded-[14px] bg-bronze px-7 font-bold text-ground"
              >
                Log what hurt
              </Link>
            ) : null}
            <button
              type="button"
              onClick={onExit}
              className={
                hurt
                  ? "flex h-11 items-center px-4 text-[15px] font-semibold text-ink"
                  : "mt-1 flex h-[52px] items-center rounded-[14px] bg-bronze px-7 font-bold text-ground"
              }
            >
              {hurt ? "Back to Today" : "Back to session"}
            </button>
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-grow flex-col px-4 pt-2">
              <div className="relative aspect-video w-full flex-shrink-0 overflow-hidden rounded-[18px] bg-surface">
                {step.figure ? (
                  <ExerciseFigure
                    key={`${step.figure}-${step.side}`}
                    figure={step.figure}
                    side={step.side}
                    playing={phase === "work" && !paused}
                    getElapsed={getElapsed}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-6 text-center text-[13px] text-muted">
                    {step.cue ?? "Open the full tutorial for this move."}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setVideo(true)}
                  aria-label="Full tutorial video, opens a player"
                  className="absolute left-2.5 top-2.5 h-11 rounded-full bg-ground/70 px-3.5 text-[13px] font-semibold text-ink"
                >
                  Full tutorial <span aria-hidden="true">↗</span>
                </button>
              </div>

              <div className="mt-3.5 flex h-7 flex-shrink-0 items-center justify-between">
                <span
                  className="flex h-7 w-[92px] items-center justify-center rounded-full text-[12px] font-bold tracking-[.06em]"
                  style={{ background: chip.bg, color: chip.fg }}
                >
                  {chip.label}
                </span>
                <span className="font-mono text-[12px] tabular-nums text-muted">
                  Set {step.set}/{step.of} · Step {idx + 1}/{steps.length}
                </span>
              </div>
              <h2 className="mt-2.5 line-clamp-2 h-[53px] flex-shrink-0 text-[22px] font-bold leading-[1.2] text-strong">
                {step.name}
              </h2>
              <p className="mt-1 line-clamp-2 h-[44px] flex-shrink-0 text-[15px] leading-[1.45] text-ink">
                {step.cue ?? ""}
              </p>

              <div className="flex min-h-0 flex-grow flex-col items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={repWork ? () => {
                    const n = Math.min(step.reps ?? 1, count + 1);
                    setCount(n);
                    announce(`Rep ${n} of ${step.reps}.`);
                  } : undefined}
                  disabled={!repWork}
                  aria-label={repWork ? `Rep ${count} of ${step.reps}. Tap to count the next rep` : `${big} ${caption}`}
                  className="relative h-[176px] w-[176px] flex-shrink-0 disabled:cursor-default"
                >
                  <svg width="176" height="176" viewBox="0 0 176 176" aria-hidden="true" className="absolute inset-0">
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
                      className="font-mono text-[64px] font-semibold leading-none tabular-nums"
                      style={{ color: phase === "rest" ? "#93989f" : "#f4f5f7" }}
                    >
                      {big}
                    </span>
                    <span className="h-[18px] text-[13px] text-muted">{caption}</span>
                  </span>
                </button>
                <div className="flex h-11 w-full flex-shrink-0 items-center justify-center gap-2.5">
                  {repWork ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setCount((c) => Math.max(0, c - 1))}
                        className="h-11 w-[64px] rounded-xl border border-line text-[15px] font-semibold text-ink"
                      >
                        −1
                      </button>
                      <button
                        type="button"
                        onClick={() => setCount((c) => Math.min(step.reps ?? 1, c + 1))}
                        className="h-11 w-[72px] rounded-xl border border-line text-[15px] font-semibold text-ink"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => completeSet(step.reps ?? 1, null)}
                        className="h-11 w-[120px] rounded-xl border border-line text-[15px] font-semibold text-ink"
                      >
                        Log all {step.reps}
                      </button>
                    </>
                  ) : phase === "rest" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => (paused ? setPausedLeft((p) => (p ?? 0) + 15000) : setEndAt((e) => e + 15000))}
                        className="h-11 w-[72px] rounded-xl border border-line text-[15px] font-semibold text-ink"
                      >
                        +15 s
                      </button>
                      <span className="max-w-[240px] truncate text-[13px] text-muted">{nextLine}</span>
                    </>
                  ) : (
                    <span className="max-w-[300px] truncate text-[13px] text-muted">{nextLine}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 justify-center px-7 pt-1">
            <button
              type="button"
              onClick={() => {
                setHurt(true);
                setPhase("done");
                announce("Stopped. Note what hurt in your check.");
              }}
              className="min-h-[44px] w-auto px-5 flex-shrink-0 rounded-full border border-red-strong/45 text-[13px] font-semibold text-red-strong"
            >
              Something hurts
            </button>
            </div>
            <div className="grid flex-shrink-0 grid-cols-3 items-start px-7 pb-4 pt-2.5">
              <button
                type="button"
                // During a rest the cursor still points at the set just finished:
                // Back returns to it rather than two steps back.
                onClick={() => goTo(phase === "rest" ? idx : Math.max(0, idx - 1))}
                className="flex flex-col items-center gap-1.5"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d6d9de" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </span>
                <span className="text-[12px] text-muted">Back</span>
              </button>
              <button type="button" onClick={onPrimary} className="-mt-2 flex flex-col items-center gap-1.5">
                <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-bronze" aria-hidden="true">
                  {primaryLabel === "Pause" || primaryLabel === "Skip rest" || primaryLabel === "Cancel" ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#0e0f12"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                  ) : primaryLabel === "Set done" ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0e0f12" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 12 10 17 19 7" /></svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#0e0f12"><polygon points="8 5 19 12 8 19 8 5" /></svg>
                  )}
                </span>
                <span className="w-24 text-center text-[12px] font-semibold text-ink">{primaryLabel}</span>
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
                className="flex flex-col items-center gap-1.5"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d6d9de" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
                <span className="text-[12px] text-muted">{skipArmed ? "Tap again" : "Skip set"}</span>
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
