"use client";

import { useEffect, useRef, useState } from "react";
import { countLoggedSets, isSetLogged } from "@/lib/set-progress";
import { announce } from "@/lib/announce";
import { playTimerComplete } from "@/lib/sound";
import { useStore, useDayExercise, entrySets } from "@/lib/useStore";
import { isSetPR } from "@/lib/pr";
import { platesLabel } from "@/lib/plates";
import { restSecondsFor } from "@/lib/day-format";
import { lastSessionSetsFor } from "@/lib/engine/history";
import { OverflowSheet } from "@/components/session/OverflowSheet";
import type { RailExercise, SessionSheet } from "@/components/session/DaySession";

/**
 * Screen 3 ("Set" / 4a work state / 6b) from the Day redesign. One set at
 * a time, full-screen, with a rail so any exercise is one tap away.
 * Nothing is added to this screen beyond what the README specifies —
 * effort/notes/progression live in Rest or the Brief, never here.
 */
export function SetView({
  railExercises,
  active,
  activeSetIndex,
  editingLoad,
  onEditingLoad,
  onSelectExercise,
  onSelectSetIndex,
  onBackToBrief,
  onConfirmed,
  onEdited,
  sheet,
  onOpenSheet,
  onCloseSheet,
  date,
}: {
  railExercises: RailExercise[];
  active: RailExercise;
  activeSetIndex: number;
  editingLoad: boolean;
  onEditingLoad: (v: boolean) => void;
  onSelectExercise: (key: string) => void;
  /**
   * Move to any set on the CURRENT exercise, including one already
   * logged. Every other entry point into Set (`startSession`, `jumpTo`,
   * Rest's auto-advance) lands on the first UNFINISHED set, which is
   * what made a logged set unreachable — and therefore unfixable —
   * once you'd passed it. The set pips below are the only backwards
   * affordance in the flow.
   */
  onSelectSetIndex: (index: number) => void;
  onBackToBrief: () => void;
  // Carries the rest duration up rather than starting `lib/useTimer.ts`'s
  // shared store directly — that store also drives the OLD bottom-fixed
  // `RestTimerHost`/`RestTimer` widget (still live on `/off-plan`, which
  // keeps the pre-redesign ExerciseCard/SetRow flow). Touching it here
  // would make both timers fire — double vibration, double sound, double
  // screen-reader announcement — since `RestTimerHost` is mounted
  // app-wide in `AppShell`, not scoped to this route. `RestTakeover`
  // manages its own fully independent countdown instead.
  onConfirmed: (restSeconds: number) => void;
  /**
   * Confirm on a set that was ALREADY logged — a correction, not a set
   * you just did. No rest timer (you're not between efforts), and the
   * shell returns you to where you were working.
   */
  onEdited: () => void;
  sheet: SessionSheet;
  onOpenSheet: (s: SessionSheet) => void;
  onCloseSheet: () => void;
  date: string;
}) {
  const store = useStore((s) => s.store);
  const updateSet = useStore((s) => s.updateSet);
  const addSet = useStore((s) => s.addSet);

  // Long rails scroll, so the active exercise can start off-screen —
  // most obviously on off-plan, where you tap in from a grouped list and
  // could land on item 20 of 34. Pull it into view on mount. SetView is
  // keyed on exercise + set index by both shells, so this runs on every
  // move without needing to watch anything.
  const activeRailRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    activeRailRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, []);

  const entry = useDayExercise(active.blockId, active.exercise.id, date);
  const sets = entrySets(entry);
  const prevSets = lastSessionSetsFor(store, active.exercise.id, date);
  const setForRow = sets[activeSetIndex] ?? { weight_kg: null, reps: null, rpe: null };
  // Last time's matching row — or, when this index has no counterpart
  // (last session stopped after two sets and you're on set three), the
  // last row it DID log. Without the second half, set 3 of an exercise
  // you've only ever done for two sets had no "last time" at all and fell
  // straight through to the zero default below.
  const prevForRow =
    prevSets?.[activeSetIndex] ??
    (prevSets ?? []).filter((p) => p.reps != null).slice(-1)[0];
  const prev =
    prevForRow && prevForRow.weight_kg != null && prevForRow.reps != null
      ? { weight_kg: prevForRow.weight_kg, reps: prevForRow.reps }
      : null;
  // The authored dose from exercises.json. `default` is a loose record, so
  // read it through a narrow helper rather than casting the whole thing.
  const authored = active.exercise.default ?? {};
  const num = (k: string): number | null =>
    typeof authored[k] === "number" ? (authored[k] as number) : null;
  const authoredReps = num("reps");
  const holdSeconds = num("hold_seconds");
  // Duration-based work. Aerobic blocks author minutes, not reps —
  // `aerobic_z1_steady` is `{minutes: 45}`, `aerobic_threshold_cruise` is
  // `{sets: 3, minutes_per_set: 8}` — so a 45-minute Zone 1 run was
  // presenting a rep counter reading zero. The harness caught this across
  // nine personas on 2026-08-26: the whole aerobic, skill and mobility
  // half of the catalog. Same class as the hold bug, one step out.
  const authoredMinutes = num("minutes_per_set") ?? num("minutes");
  const timedSeconds = holdSeconds ?? (authoredMinutes != null ? authoredMinutes * 60 : null);
  const authoredSets = num("sets");
  const perSide = authored.per_side === true;
  // Hold-based work (isometrics, stretches) authors `hold_seconds` and no
  // reps — there is no rep count to predefine. One hold is one effort, so
  // seed 1: zero is never a correct starting value for something you are
  // about to do.
  // Never zero. An exercise that authors no dose at all (om_wall_slides
  // has `default: null`) still gets 1 — you either did the drill or you
  // did not, and the screen must never offer 0 as the thing it is about
  // to write to your log.
  const defaultReps = authoredReps ?? 1;
  // What the program actually asks for, in words. The "Prescribed" card
  // below only ever rendered for TM-derived strength suggestions, so
  // accessory and mobility work showed no dose at all — you had to know
  // that 90/90 hip switches are 10 a side from memory.
  const authoredDose = (() => {
    const parts: string[] = [];
    if (holdSeconds != null) parts.push(`${holdSeconds}s hold`);
    else if (authoredMinutes != null) parts.push(`${authoredMinutes} min`);
    else if (authoredReps != null) parts.push(`${authoredReps} reps`);
    if (authoredSets != null) parts.push(`${authoredSets} sets`);
    if (perSide) parts.push("per side");
    return parts.length ? parts.join(" · ") : null;
  })();
  const prescribed = active.suggestion?.fsl
    ? activeSetIndex === 0
      ? active.suggestion.top_set
      : { kg: active.suggestion.fsl.kg, reps: String(active.suggestion.fsl.reps) }
    : activeSetIndex === active.rowCount - 1 && active.suggestion
      ? active.suggestion.top_set
      : null;
  const isAmrap = !!prescribed?.reps?.includes("+");
  // Time-based work. An exercise that authors `hold_seconds` and no reps
  // is held, not counted — a rep stepper is the wrong instrument for it,
  // and offering one is how a 30-second kneeling stretch ended up logged
  // as "x12" in the founder's 2026-08-24 record.
  const isHold = timedSeconds != null && authoredReps == null;
  // A 20-second isometric and a 45-minute Zone 1 run are both "timed",
  // but they are not the same thing to a person. Hold copy for the first,
  // duration copy for the second.
  const isHoldShaped = holdSeconds != null;
  const durationLabel = isHoldShaped
    ? `${timedSeconds}s hold`
    : `${Math.round((timedSeconds ?? 0) / 60)} min`;

  // Local editable weight/reps, seeded from the logged value (if any) or
  // the prescription/last-time fallback. Committed to the store only on
  // Done — the README: "Weight is prefilled... editable at any moment,"
  // and the confirm button names the exact number it will log.
  const [weight, setWeight] = useState<number>(
    () => setForRow.weight_kg ?? prescribed?.kg ?? prev?.weight_kg ?? 0,
  );
  // Seeding chain (2026-08-25): what you logged → what the engine
  // prescribes → what you did last time → the exercise's authored default
  // → 0.
  //
  // `default` was missing from that chain, so any exercise without a
  // TM-derived prescription AND without a same-index history seeded at
  // ZERO — and tapping Done committed the zero. That is where the founder's
  // 2026-08-24 log got `hip_switch_9090` set 1 at 0 reps between two sets
  // of 12, and `air_squat_daily` set 3 at 0 after two sets of 10. Both
  // exercises author `default.reps: 10`; nothing ever read it. `rowCount`
  // in DaySession already fell back to `exercise.default.sets` — only reps
  // was missing the same treatment.
  const [reps, setReps] = useState<number>(
    () =>
      setForRow.reps ??
      (parseInt(prescribed?.reps ?? "", 10) || prev?.reps || defaultReps || 0),
  );
  // No resync-effect: DaySession mounts this component with
  // `key={active.key + activeSetIndex}`, so React fully remounts (and
  // re-runs the useState initializers above) whenever the exercise or
  // set index changes, instead of an effect reaching back to reset
  // state — React's own recommended pattern over "sync state via effect."

  // A set counts as logged once it carries reps (and a weight, when the
  // exercise is loadable) — the same rule DaySession/OffPlanSession use
  // to count progress, so the pips and the rail's `n/m` never disagree.
  const loggedAt = (i: number): boolean => isSetLogged(sets[i], active.isLoadable);
  const isEditingLoggedSet = loggedAt(activeSetIndex);

  // Seconds held on THIS set: what was logged, else the authored dose.
  const [seconds, setSeconds] = useState<number>(
    () => setForRow.seconds ?? timedSeconds ?? 30,
  );
  // Countdown state. `running` starts it; `remaining` drives the clock.
  // Deliberately independent of RestTakeover's timer — that one owns the
  // between-sets rest and lives in a different component; two countdowns
  // sharing a store is how the old RestTimerHost double-fired.
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState<number>(() => seconds);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setRunning(false);
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate?.([80, 60, 80]);
          }
          playTimerComplete();
          announce("Hold complete.");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const wouldBePR =
    active.isLoadable && weight > 0 && reps > 0 && isSetPR(store, active.exercise.id, weight, reps, date);
  const plates = active.isLoadable ? platesLabel(weight) : null;

  const totalRemaining = railExercises.reduce((n, r) => {
    const rEntry = store.logs[date]?.exercises[r.key] ?? null;
    const logged = countLoggedSets(entrySets(rEntry), r.isLoadable);
    return n + Math.max(0, r.rowCount - logged);
  }, 0);

  const confirm = (finalReps: number) => {
    updateSet(
      active.blockId,
      active.exercise.id,
      activeSetIndex,
      {
        weight_kg: active.isLoadable ? weight : null,
        // A hold still records `reps` — one completed hold — because
        // `reps != null` is what marks a set logged everywhere else.
        // `seconds` is the dose that actually means something.
        reps: finalReps,
        // What was actually held. Reaching zero means the full dose;
        // stopping early banks the elapsed portion. Keying this off
        // `running` was wrong for the paused case — pausing then logging
        // recorded the full authored time regardless of when you stopped.
        ...(isHold
          ? { seconds: remaining === 0 ? seconds : Math.max(0, seconds - remaining) }
          : {}),
      },
      date,
    );
    // Correcting set 2 while you're really on set 5 shouldn't start a
    // rest timer — you aren't between efforts, you're fixing a number.
    if (isEditingLoggedSet) onEdited();
    else onConfirmed(restSecondsFor(active.exercise));
  };

  return (
    <>
      <div className="flex-shrink-0 px-4 pt-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onBackToBrief}
            aria-label="Back to brief"
            className="flex-shrink-0 w-[34px] h-[34px] rounded-[7px] border border-line-soft bg-surface text-ink text-[15px]"
          >
            ‹
          </button>
          {/* Rail scrolls (2026-08-24). It used to be a plain flex row of
              `flex: 1` buttons with no minimum, sized to fit whatever the
              rail held. Fine on Day, where a session is 2-5 exercises —
              but off-plan flattens EVERY accessory and cardio block into
              one rail: 16 exercises for anterior-hip-rebuild, 23 for
              first-strict-pullup, 34 for handstand-walk. At 393px that's
              roughly 11px per tab, i.e. clickable but not tappable. A
              minimum width plus horizontal scroll keeps every target
              thumb-sized no matter how long the rail gets. Back and `⋯`
              sit outside the scroller so they never drift off-screen. */}
          <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {railExercises.map((r) => {
            const rEntry = store.logs[date]?.exercises[r.key] ?? null;
            const logged = countLoggedSets(entrySets(rEntry), r.isLoadable);
            const isActive = r.key === active.key;
            return (
              <button
                key={r.key}
                type="button"
                ref={isActive ? activeRailRef : undefined}
                onClick={() => onSelectExercise(r.key)}
                className={
                  "min-w-0 rounded-[7px] px-1 py-1.5 text-center border flex-shrink-0 " +
                  (isActive
                    ? "flex-[2] min-w-[104px] border-bronze bg-[rgba(200,150,102,.14)]"
                    : "flex-1 min-w-[74px] border-line-soft bg-surface")
                }
              >
                <span
                  className={
                    "block text-[10.5px] font-semibold truncate " + (isActive ? "text-strong" : "text-ink")
                  }
                >
                  {r.exercise.name}
                </span>
                <span
                  className={"block font-mono text-[9px] mt-0.5 " + (isActive ? "text-bronze" : "text-muted")}
                >
                  {logged}/{r.rowCount}
                </span>
              </button>
            );
          })}
          </div>
          <button
            type="button"
            onClick={() => onOpenSheet("overflow")}
            aria-label="More options"
            className="flex-shrink-0 w-[34px] h-[34px] rounded-[7px] border border-line-strong bg-surface-2 text-strong text-[15px] font-semibold"
          >
            ⋯
          </button>
        </div>
        {/* min-w-0 + truncate: long exercise names used to wrap and
            interleave with the "N sets left" counter — "wrist extension
            prep on floor · set 121 sets 1 of 2 left". The name is the
            part that can be shortened; the counters can't. */}
        <div className="flex items-baseline justify-between gap-3 mt-2.5 px-1.5">
          <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[.14em] text-ink">
            {active.exercise.name} · set {activeSetIndex + 1} of {active.rowCount}
          </span>
          <span className="flex-shrink-0 font-mono text-[10px] uppercase tracking-[.14em] text-ink">
            {totalRemaining} sets left
          </span>
        </div>
        {/* Set pips (2026-08-24). The set counter above used to be the
            only place a set index appeared, and it was plain text — so
            once a set was logged there was no way back to it, and a
            mis-tapped weight was permanent. These are the backwards
            affordance: every set on this exercise, one tap away, logged
            ones showing what they hold. */}
        {active.rowCount > 1 ? (
          <div className="flex items-center gap-1 mt-1.5">
            {Array.from({ length: active.rowCount }, (_, i) => {
              const done = loggedAt(i);
              const isCurrent = i === activeSetIndex;
              const logged = sets[i];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectSetIndex(i)}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={
                    done && logged
                      ? logged.seconds != null
                        ? `Set ${i + 1}, held ${logged.seconds} seconds. Edit.`
                        : active.isLoadable
                          ? `Set ${i + 1}, logged ${logged.weight_kg} kilos by ${logged.reps} reps. Edit.`
                          : `Set ${i + 1}, logged ${logged.reps} reps. Edit.`
                      : `Set ${i + 1}, not logged yet`
                  }
                  className={
                    "flex-1 min-w-0 h-[34px] rounded-[7px] border text-center " +
                    (isCurrent
                      ? "border-bronze bg-[rgba(200,150,102,.14)]"
                      : done
                        ? "border-line-strong bg-surface-2"
                        : "border-line-soft bg-surface")
                  }
                >
                  <span
                    className={
                      "block font-mono text-[10px] leading-none " +
                      (isCurrent ? "text-bronze" : done ? "text-ink" : "text-muted")
                    }
                  >
                    {i + 1}
                  </span>
                  <span
                    className={
                      "block font-mono text-[9px] leading-none mt-0.5 truncate " +
                      (isCurrent ? "text-strong" : done ? "text-ink" : "text-muted")
                    }
                  >
                    {done && logged
                      ? logged.seconds != null
                        ? `${logged.seconds}s`
                        : active.isLoadable
                          ? `${logged.weight_kg}×${logged.reps}`
                          : `${logged.reps}`
                      : "·"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center min-h-0">
        <p className="font-mono text-[11px] uppercase tracking-[.18em] text-bronze mb-[18px] flex items-center gap-2">
          {isEditingLoggedSet
            ? "Editing"
            : activeSetIndex === active.rowCount - 1
              ? "Top set"
              : "Set"}
          {wouldBePR ? (
            <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[.12em] text-ground bg-green rounded px-1.5 py-0.5">
              Rep PR
            </span>
          ) : null}
        </p>
        {active.isLoadable ? (
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-[92px] leading-[.9] font-semibold tracking-[-.05em] text-strong">
              {weight}
            </span>
            <span className="text-[24px] font-medium text-muted">kg</span>
          </div>
        ) : null}
        {isHold ? (
          <>
            <p className="text-[92px] leading-[.9] font-semibold tracking-[-.05em] text-strong mb-1">
              {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[.16em] text-muted mb-3">
              {running
                ? isHoldShaped
                  ? "holding"
                  : "running"
                : remaining === 0
                  ? "done"
                  : durationLabel}
            </p>
          </>
        ) : (
          <p
            className={
              active.isLoadable
                ? "text-[26px] leading-[1.2] font-semibold tracking-[-.02em] text-strong mb-3"
                : "text-[92px] leading-[.9] font-semibold tracking-[-.05em] text-strong mb-3"
            }
          >
            {isAmrap ? `${reps}+ reps` : `${reps} ${reps === 1 ? "rep" : "reps"}`}
          </p>
        )}
        {!prev && !prescribed && authoredDose ? (
          <div className="border border-line-soft rounded-[8px] overflow-hidden mb-3">
            <div className="px-4 py-2.5 bg-surface">
              <p className="font-mono text-[9.5px] uppercase tracking-[.14em] text-muted mb-0.5">
                Programme asks for
              </p>
              <p className="text-[15px] font-semibold text-ink">{authoredDose}</p>
            </div>
          </div>
        ) : null}
        {prev || prescribed ? (
          <div className="flex items-stretch border border-line-soft rounded-[8px] overflow-hidden mb-3">
            {prev ? (
              <div className="px-4 py-2.5 bg-surface">
                <p className="font-mono text-[9.5px] uppercase tracking-[.14em] text-muted mb-0.5">
                  Last time
                </p>
                <p className="text-[15px] font-semibold text-ink">
                  {active.isLoadable ? `${prev.weight_kg} × ${prev.reps}` : prev.reps}
                </p>
              </div>
            ) : null}
            {prev && prescribed ? <div className="w-px bg-line-soft" /> : null}
            {prescribed ? (
              <div className="px-4 py-2.5 bg-surface">
                <p className="font-mono text-[9.5px] uppercase tracking-[.14em] text-muted mb-0.5">
                  Prescribed
                </p>
                <p className="text-[15px] font-semibold text-ink">
                  {active.isLoadable ? `${prescribed.kg} × ${prescribed.reps}` : prescribed.reps}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
        {plates ? <p className="font-mono text-[11px] text-muted">{plates}</p> : null}
      </div>

      <div className="flex-shrink-0 px-[22px] pb-[22px]">
        {isHold ? (
          <>
            {editingLoad ? (
              <div className="border border-line-strong rounded-[10px] bg-surface p-3 mb-2.5 flex flex-col gap-2">
                <StepperRow
                  label={isHoldShaped ? "seconds" : "minutes"}
                  value={isHoldShaped ? seconds : Math.round(seconds / 60)}
                  step={isHoldShaped ? 5 : 1}
                  onChange={(v) => {
                    // 5-second steps on a 45-minute run would take nine
                    // hundred taps; minutes-based work steps in minutes.
                    const next = isHoldShaped ? v : Math.max(1, v) * 60;
                    setSeconds(next);
                    if (!running) setRemaining(next);
                  }}
                />
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => {
                if (running) {
                  // Pause and bank what was held.
                  setRunning(false);
                  return;
                }
                if (remaining === 0) {
                  // Finished — log it.
                  confirm(1);
                  return;
                }
                setRunning(true);
                announce(`Hold started, ${remaining} seconds.`);
              }}
              className="w-full h-[62px] rounded-[10px] bg-bronze text-ground text-[17px] font-semibold tracking-[-.01em]"
            >
              {running
                ? "Pause"
                : remaining === 0
                  ? `${isEditingLoggedSet ? "Save" : "Done"} — set ${activeSetIndex + 1} · ${
                      isHoldShaped ? `${seconds}s` : `${Math.round(seconds / 60)} min`
                    }`
                  : remaining < seconds
                    ? "Resume"
                    : isHoldShaped
                      ? `Start the hold · ${seconds}s`
                      : `Start the timer · ${Math.round(seconds / 60)} min`}
            </button>
            <div className="flex gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => onEditingLoad(!editingLoad)}
                className="flex-1 h-10 text-ink text-[14px]"
              >
                {editingLoad ? "Hide" : "Change the time"}
              </button>
              {/* Held it without the timer running, or cut it short — log
                  whatever was actually held rather than forcing the clock
                  to zero. */}
              <button
                type="button"
                onClick={() => {
                  setRunning(false);
                  confirm(1);
                }}
                className="flex-1 h-10 text-ink text-[14px]"
              >
                Log it now
              </button>
            </div>
          </>
        ) : isAmrap ? (
          <>
            {/* 2026-08-31 — the AMRAP branch used to render the rep grid
                ALONE: no load editor and no "Change the weight" toggle, both
                of which live in the fixed-rep branch below. Every 5/3/1 top
                set is an AMRAP, so the one set most likely to be run at a
                different weight than prescribed was the only set whose weight
                could not be changed. The founder squatted 95 kg on 31 Aug
                against a prescribed 93.5, could only say so in a free-text
                note, and the set logged at 93.5 — feeding the wrong number
                straight into TM inference, which reads weight × reps. The
                rep grid still confirms; this just lets the kg be right. */}
            {editingLoad && active.isLoadable ? (
              <div className="border border-line-strong rounded-[10px] bg-surface p-3 mb-2.5 flex flex-col gap-2">
                <StepperRow label="kg" value={weight} step={2.5} onChange={setWeight} />
                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-[.14em] text-ink">
                    Steps of 2.5 kg
                  </span>
                  {prescribed ? (
                    <button
                      type="button"
                      onClick={() => setWeight(prescribed.kg)}
                      className="text-slate text-[13px]"
                    >
                      Back to prescription
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
            <p className="font-mono text-[10px] uppercase tracking-[.14em] text-muted mb-2 text-center">
              {isEditingLoggedSet
                ? `Fix the reps on set ${activeSetIndex + 1}`
                : `Reps you got on set ${activeSetIndex + 1}`}
              {active.isLoadable ? ` · ${weight} kg` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => confirm(n)}
                  className="flex-1 basis-[60px] h-[62px] rounded-[10px] border border-line-soft bg-surface text-strong text-[22px] font-semibold tracking-[-.02em]"
                >
                  {n}
                </button>
              ))}
            </div>
            {active.isLoadable ? (
              <button
                type="button"
                onClick={() => onEditingLoad(!editingLoad)}
                className="w-full h-10 mt-1.5 text-ink text-[14px]"
              >
                {editingLoad ? "Hide" : "Change the weight"}
              </button>
            ) : null}
          </>
        ) : (
          <>
            {editingLoad ? (
              <div className="border border-line-strong rounded-[10px] bg-surface p-3 mb-2.5 flex flex-col gap-2">
                {active.isLoadable ? (
                  <StepperRow label="kg" value={weight} step={2.5} onChange={setWeight} />
                ) : null}
                <StepperRow label="reps" value={reps} step={1} onChange={setReps} />
                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-[.14em] text-ink">
                    {active.isLoadable ? "Steps of 2.5 kg" : "Steps of 1 rep"}
                  </span>
                  {prescribed ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (active.isLoadable) setWeight(prescribed.kg);
                        setReps(parseInt(prescribed.reps, 10) || reps);
                      }}
                      className="text-slate text-[13px]"
                    >
                      Back to prescription
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
            {/* Names the SET, not just the weight (2026-08-24). "Done —
                115 kg" read as a session-level number, so per-set logging
                looked like it wasn't there: the set counter is the smallest
                type on the screen, and the button covered by your thumb was
                the only other place a number appeared. */}
            <button
              type="button"
              onClick={() => confirm(reps)}
              className="w-full h-[62px] rounded-[10px] bg-bronze text-ground text-[17px] font-semibold tracking-[-.01em]"
            >
              {active.isLoadable
                ? `${isEditingLoggedSet ? "Save" : "Done"} — set ${activeSetIndex + 1} · ${weight} kg`
                : `${isEditingLoggedSet ? "Save" : "Done"} — set ${activeSetIndex + 1}`}
            </button>
            <button
              type="button"
              onClick={() => onEditingLoad(!editingLoad)}
              className="w-full h-10 mt-1.5 text-ink text-[14px]"
            >
              {editingLoad ? "Hide" : active.isLoadable ? "Change the weight" : "Change the reps"}
            </button>
          </>
        )}
      </div>

      {sheet === "overflow" ? (
        <OverflowSheet
          active={active}
          date={date}
          onClose={onCloseSheet}
          onAddSet={() => {
            addSet(active.blockId, active.exercise.id, date);
            onCloseSheet();
          }}
          onFinishHere={() => {
            onCloseSheet();
            onBackToBrief();
          }}
          onOpenNote={() => onOpenSheet("note")}
        />
      ) : null}
    </>
  );
}

function StepperRow({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, round(value - step)))}
        className="w-[58px] h-[52px] flex-shrink-0 rounded-[8px] border border-line-strong bg-surface-2 text-strong text-[24px] font-medium"
      >
        −
      </button>
      <span className="flex-1 min-w-0 flex items-baseline justify-center gap-1.5">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isFinite(v)) onChange(v);
          }}
          aria-label={label}
          className="w-20 bg-transparent border-0 border-b border-dashed border-line-strong text-strong text-[22px] font-semibold tracking-[-.02em] text-center py-0.5 outline-none"
        />
        <span className="text-[14px] font-medium text-muted">{label}</span>
      </span>
      <button
        type="button"
        onClick={() => onChange(round(value + step))}
        className="w-[58px] h-[52px] flex-shrink-0 rounded-[8px] border border-line-strong bg-surface-2 text-strong text-[24px] font-medium"
      >
        +
      </button>
    </div>
  );
}

function round(n: number): number {
  return Math.round(n * 2) / 2;
}
