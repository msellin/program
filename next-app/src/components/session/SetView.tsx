"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useElapsedSeconds } from "@/lib/wall-clock";
import { countLoggedSets, isSetLogged, requiredRowCount, isOptionalRow } from "@/lib/set-progress";
import { announce } from "@/lib/announce";
import { playTimerComplete } from "@/lib/sound";
import { useStore, useDayExercise, entrySets } from "@/lib/useStore";
import { isSetPR } from "@/lib/pr";
import { platesLabel } from "@/lib/plates";
import { restSecondsFor, exerciseListName } from "@/lib/day-format";
import { lastSessionSetsFor } from "@/lib/engine/history";
import { prescriptionRows } from "@/lib/engine/suggest";
import { OverflowSheet } from "@/components/session/OverflowSheet";
import { HurtSheet } from "@/components/session/HurtSheet";
import type { RailExercise, SessionSheet } from "@/components/session/DaySession";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/session/shared/BottomSheet";
import { ExerciseFigure } from "@/components/follow-along/ExerciseFigure";
import { DemoVideo } from "@/components/follow-along/DemoVideo";
import { figureFor } from "@/lib/figures/exercise-figures";
import { lastComparison, setRole } from "@/lib/prescription-line";
import { demoAutoplayAsked, readDemoAutoplayPref, useDemoAutoplayPref } from "@/lib/useUserPrefs";

const ZERO = () => 0;
/** Exercises whose demo clip the user has tapped open this session. */
const OPENED_DEMOS = new Set<string>();
/** Exercises whose clip the user hid this session: autoplay leaves them shut. */
const CLOSED_DEMOS = new Set<string>();

function prescribedIsAmrap(r: RailExercise, index: number): boolean {
  if (!r.suggestion) return false;
  return !!prescriptionRows(r.suggestion, r.schemeRowCount ?? r.rowCount)[index]?.reps?.includes("+");
}

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
  onStopSession,
  programSlug,
  onConfirmed,
  onEdited,
  sheet,
  onOpenSheet,
  onCloseSheet,
  date,
  resting = false,
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
  /** Ends the session as stopped (not finished). Reached from the Something hurt chip. */
  onStopSession: () => void;
  /** The programme this session belongs to; falls back to the active programme. */
  programSlug?: string;
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
  /** The rest takeover covers this screen; an open clip is taken down under it. */
  resting?: boolean;
}) {
  const store = useStore((s) => s.store);
  const updateSet = useStore((s) => s.updateSet);
  const addSet = useStore((s) => s.addSet);
  const removeSet = useStore((s) => s.removeSet);

  // Long rails scroll, so the active exercise can start off-screen —
  // most obviously on off-plan, where you tap in from a grouped list and
  // could land on item 20 of 34. Pull it into view on mount. SetView is
  // keyed on exercise + set index by both shells, so this runs on every
  // move without needing to watch anything.
  const entry = useDayExercise(active.blockId, active.exercise.id, date);
  const sets = entrySets(entry);
  const currentChipRef = useRef<HTMLButtonElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // Centre the current set in the strip without scrolling the page.
    const strip = stripRef.current;
    const chip = currentChipRef.current;
    if (strip && chip) strip.scrollLeft = chip.offsetLeft - strip.clientWidth / 2 + chip.clientWidth / 2;
  }, []);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  // A clip the user opened stays open across sets of that exercise (SetView
  // remounts per set). In memory only: a reload asks for the tap again.
  const [autoplay, setAutoplay] = useDemoAutoplayPref();
  const [askAutoplay, setAskAutoplay] = useState(false);
  const [demoOpen, setDemoOpen] = useState(() => {
    const id = active.exercise.id;
    if (OPENED_DEMOS.has(id)) return true;
    // Autoplay (owner decision, 2026-10-29): only once the user has said yes,
    // only on the first set of an exercise, never under reduced motion, and
    // only where the band is on screen anyway.
    if (!active.exercise.video_url || !readDemoAutoplayPref() || CLOSED_DEMOS.has(id)) return false;
    if (countLoggedSets(entrySets(entry), active.isLoadable) > 0) return false;
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return window.matchMedia("(min-height: 760px)").matches || !(prescribedIsAmrap(active, activeSetIndex));
  });
  const openDemo = () => {
    OPENED_DEMOS.add(active.exercise.id);
    CLOSED_DEMOS.delete(active.exercise.id);
    setDemoOpen(true);
    if (!demoAutoplayAsked() && !autoplay) setAskAutoplay(true);
  };
  const mountedAt = useRef(0);
  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);
  // Milliseconds, like every other ExerciseFigure caller. This returned seconds until 2026-10-29, so one
  // 5 s rep took 80 minutes and the set player's figure looked frozen on the founder's phone.
  const elapsed = useCallback(() => performance.now() - mountedAt.current, []);

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
  // The programme's own numbers for this item win over the library default
  // (BUG-42, 2026-10-01): Thursday's split squats are authored 4×6 and were
  // showing the library's 3×8.
  const itemNum = (k: "reps" | "sets" | "hold_seconds"): number | null =>
    typeof active.item?.[k] === "number" ? (active.item[k] as number) : null;
  const authoredReps = itemNum("reps") ?? num("reps");
  const holdSeconds = itemNum("hold_seconds") ?? num("hold_seconds");
  // Duration-based work. Aerobic blocks author minutes, not reps —
  // `aerobic_z1_steady` is `{minutes: 45}`, `aerobic_threshold_cruise` is
  // `{sets: 3, minutes_per_set: 8}` — so a 45-minute Zone 1 run was
  // presenting a rep counter reading zero. The harness caught this across
  // nine personas on 2026-08-26: the whole aerobic, skill and mobility
  // half of the catalog. Same class as the hold bug, one step out.
  const authoredMinutes = num("minutes_per_set") ?? num("minutes");
  const timedSeconds = holdSeconds ?? (authoredMinutes != null ? authoredMinutes * 60 : null);
  const authoredSets = itemNum("sets") ?? num("sets");
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
  const prescribed = active.suggestion
    ? (prescriptionRows(active.suggestion, active.schemeRowCount ?? active.rowCount)[activeSetIndex] ?? null)
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
  // A row the user added past the prescription has no prescribed load, so it
  // fell through to LAST SESSION's same-index set: after 80/100/120 today, an
  // added set 4 offered 100 × 7 from a week earlier. Someone adding a set is
  // carrying on from the row they just did — seed from that instead.
  const priorRowToday =
    active.schemeRowCount != null && activeSetIndex >= active.schemeRowCount
      ? sets.slice(0, activeSetIndex).reverse().find((s) => s.weight_kg != null && s.failed !== true) ?? null
      : null;
  const [weight, setWeight] = useState<number>(
    () => setForRow.weight_kg ?? prescribed?.kg ?? priorRowToday?.weight_kg ?? prev?.weight_kg ?? 0,
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
      // A missed set holds `reps: 0`. Seeding the stepper from it would mean
      // tapping back into a miss to correct it offers zero as the starting
      // rep count — the same "0 is never a correct starting value" trap the
      // `defaultReps` fallback below exists to close. Fall through to the
      // normal chain instead; the set is still marked missed until Done is
      // pressed, which is what clears the flag.
      (setForRow.failed === true ? null : setForRow.reps) ??
      (parseInt(prescribed?.reps ?? "", 10) || itemNum("reps") || priorRowToday?.reps || prev?.reps || defaultReps || 0),
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
  // AMRAP reps above the 9-tile grid. Separate from `reps` (the fixed-rep
  // stepper) so stepping here cannot alter a non-AMRAP set's prescription.
  const [repsOverflow, setRepsOverflow] = useState(false);
  const [overflowReps, setOverflowReps] = useState(10);
  /**
   * `per_side` work is two efforts inside one set — 90/90 switches, most hip
   * stretches. The clock only ever ran once: at zero the single action was
   * "Done", which logs the set and advances, so there was no route back to the
   * start for the second side short of logging the first and hoping another
   * set row existed. `per_side` was read in one place (the summary string) and
   * the timer UI was otherwise side-blind. Founder hit it mid-session on a hip
   * stretch, 2026-09-01.
   *
   * SetView remounts per set (`key={active.key + activeSetIndex}`), so this
   * resets between sets without an effect.
   */
  const [sideIndex, setSideIndex] = useState(0);
  /**
   * Wall-clock hold timer (2026-09-04). This counted DOWN by one per
   * interval tick, so a backgrounded web view — where iOS suspends
   * intervals — froze the hold mid-count. Third of the three timers to be
   * converted; fixing one and leaving its siblings is this repo's
   * signature defect, and all three shipped the same bug.
   *
   * `banked` carries elapsed time across a pause, because the anchor is
   * re-taken on resume.
   */
  const [banked, setBanked] = useState(0);
  // "Log it now" with nothing timed would store 0 s but count as logged.
  const [confirmUntimed, setConfirmUntimed] = useState(false);
  const held = useElapsedSeconds(running, null, banked);
  const remaining = Math.max(0, seconds - held);
  const awaitingOtherSide = perSide && remaining === 0 && sideIndex === 0;
  // Completion, fired once per run. `<= 0` rather than `=== 0`: returning
  // from a backgrounded app jumps straight past the exact second, so exact
  // equality would leave a finished hold running forever.
  const holdDoneRef = useRef(false);
  useEffect(() => {
    if (!running) return;
    if (remaining > 0) {
      holdDoneRef.current = false;
      return;
    }
    if (holdDoneRef.current) return;
    holdDoneRef.current = true;
    setBanked(seconds);
    setRunning(false);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.([80, 60, 80]);
    }
    playTimerComplete();
    announce("Hold complete.");
  }, [running, remaining, seconds]);

  // A would-be PR, and only once: a set already logged today at this weight
  // and reps has claimed it, so set 4 at the same load is not "PR" again.
  const wouldBePR =
    active.isLoadable &&
    weight > 0 &&
    reps > 0 &&
    isSetPR(store, active.exercise.id, weight, reps, date) &&
    !sets.some(
      (s, i) =>
        i !== activeSetIndex && s.failed !== true && (s.weight_kg ?? 0) >= weight && (s.reps ?? 0) >= reps,
    );
  const plates = active.isLoadable ? platesLabel(weight) : null;

  // "Sets left" means REQUIRED sets left (2026-09-03). Optional work — a
  // taper week's FSL backoff, an optional accessory — must not make a
  // finished session read as unfinished, or the counter stops meaning
  // anything and the user learns to ignore it.
  const totalRemaining = railExercises.reduce((n, r) => {
    const rEntry = store.logs[date]?.exercises[r.key] ?? null;
    const logged = countLoggedSets(entrySets(rEntry), r.isLoadable);
    return n + Math.max(0, requiredRowCount(r) - logged);
  }, 0);

  /**
   * Can this set record a missed attempt (2026-09-03)?
   *
   * Gated to loadable lifts that carry a TRAINING MAX, not to loadable lifts
   * generally. A miss is only worth capturing where it changes something:
   * a training max is the number every prescription for that lift is
   * computed from, and a failed load is the only entry in the log that
   * bounds it from above (see `tm-plausibility`).
   *
   * The gate is also what keeps this off-plan-safe. `SetView` is shared —
   * `DaySession` renders it for programme days, `OffPlanSession` for a rail
   * that can run to 34 items of accessory and cardio work. Without the TM
   * condition every one of those rows would grow a button, which is exactly
   * the "off-plan should not become a detailed logging surface" objection
   * the founder raised when this was specced.
   */
  const canRecordMiss =
    active.isLoadable && typeof store.training_maxes?.[active.exercise.id] === "number";

  const confirm = (finalReps: number, failed = false, heldOverride?: number) => {
    updateSet(
      active.blockId,
      active.exercise.id,
      activeSetIndex,
      {
        weight_kg: active.isLoadable ? weight : null,
        // `failed` is written explicitly either way. Undefined would leave a
        // stale `true` in place when a mis-tapped miss is corrected back to
        // a made set through the pips — `updateSet` merges.
        failed,
        // A hold still records `reps` — one completed hold — because
        // `reps != null` is what marks a set logged everywhere else.
        // `seconds` is the dose that actually means something.
        reps: finalReps,
        // What was actually held. Reaching zero means the full dose;
        // stopping early banks the elapsed portion. Keying this off
        // `running` was wrong for the paused case — pausing then logging
        // recorded the full authored time regardless of when you stopped.
        ...(isHold
          ? { seconds: heldOverride ?? (remaining === 0 ? seconds : Math.max(0, seconds - remaining)) }
          : {}),
      },
      date,
    );
    // Correcting set 2 while you're really on set 5 shouldn't start a
    // rest timer — you aren't between efforts, you're fixing a number.
    if (isEditingLoggedSet) onEdited();
    else onConfirmed(restSecondsFor(active.exercise));
  };

  const railIndex = railExercises.findIndex((r) => r.key === active.key);
  // The rep grid needs the height the media band would take, so on short
  // phones an AMRAP set shows a thumbnail and a "Watch demo" pill instead.
  const compactMedia = isAmrap && !isEditingLoggedSet;
  // Short phones keep the band for the first set of an exercise, then hand
  // the height back to the set (round-3 vote, X1): by set 6 you know the lift.
  const shortBandGone = compactMedia || countLoggedSets(sets, active.isLoadable) > 0;
  const figure = figureFor(active.exercise.id);
  const videoUrl = active.exercise.video_url ?? null;
  const role = isEditingLoggedSet ? `Editing set ${activeSetIndex + 1}` : setRole(active, activeSetIndex);
  const comparison = lastComparison(store, active, activeSetIndex, date, active.isLoadable ? weight : null);
  // "Next" only when it tells you something the strip does not: a weight
  // change you have to load, or the next exercise (strength-coach vote).
  const nextLine = (() => {
    if (activeSetIndex + 1 < active.rowCount) {
      const nextRow = active.suggestion
        ? prescriptionRows(active.suggestion, active.schemeRowCount ?? active.rowCount)[activeSetIndex + 1]
        : null;
      return nextRow && active.isLoadable && nextRow.kg !== weight
        ? `Next: set ${activeSetIndex + 2} · ${nextRow.kg} kg × ${nextRow.reps}`
        : null;
    }
    const nextEx = railExercises[railIndex + 1];
    return nextEx ? `Next: ${exerciseListName(nextEx.exercise)}` : null;
  })();

  return (
    <>
      <div className="flex-shrink-0 px-4 pt-[max(env(safe-area-inset-top),6px)]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToBrief}
            aria-label="Back to brief"
            className="flex-shrink-0 w-11 h-11 rounded-full bg-surface text-ink text-h3"
          >
            ‹
          </button>
          {/* One segment per exercise, filling by its sets — the guided
              player's bar, so both players read as one app. */}
          <div className="flex-1 min-w-0 flex gap-1" aria-hidden="true">
            {railExercises.map((r) => {
              const logged = countLoggedSets(entrySets(store.logs[date]?.exercises[r.key] ?? null), r.isLoadable);
              const frac = r.rowCount ? Math.min(1, logged / r.rowCount) : 0;
              return (
                <span key={r.key} className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                  <span className="block h-full bg-ink" style={{ width: `${frac * 100}%` }} />
                </span>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => onOpenSheet("hurt")}
            className="flex-shrink-0 h-11 rounded-full border border-amber/60 px-3.5 text-caption font-semibold text-amber"
          >
            Something hurt
          </button>
          <button
            type="button"
            onClick={() => onOpenSheet("overflow")}
            aria-label="More options"
            className="flex-shrink-0 w-11 h-11 rounded-full bg-surface text-strong text-body font-semibold"
          >
            ⋯
          </button>
        </div>
        {/* Exercise switcher (2026-10-28). The tab rail could not fit: at
            375px it showed "Block pull, m…" and "Barbel 0/4" beside the two
            action buttons. The name now gets the full width, wraps rather
            than truncates, and every exercise is one tap away in the sheet. */}
        <div className="mt-2.5 flex items-center gap-3">
          {figure && shortBandGone && !demoOpen ? (
            <span
              className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface [@media(min-height:760px)]:hidden"
              aria-hidden="true"
            >
              <ExerciseFigure figure={figure} side="B" playing={false} getElapsed={ZERO} />
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setSwitcherOpen(true)}
            aria-label={`${exerciseListName(active.exercise)}, exercise ${railIndex + 1} of ${railExercises.length}. Switch exercise`}
            className="min-w-0 flex-1 text-left"
          >
            <span className="block text-h3 font-semibold leading-tight tracking-[-.015em] text-strong line-clamp-2">
              {exerciseListName(active.exercise)} <span aria-hidden="true" className="text-muted">▾</span>
            </span>
            <span className="block text-caption text-muted mt-0.5">
              Exercise {railIndex + 1} of {railExercises.length}
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 flex flex-col">
        {/* Media band. A vetted clip or figure is the movement, so it leads
            on phones tall enough to hold it with the set and the button
            (≥ 760px); on shorter ones for the first set of an exercise.
            YouTube is contacted only after a tap on "Watch demo", or when the
            user has said yes to playing clips automatically. An open clip
            gets the full 16:9 frame — capped, YouTube's own controls covered
            the picture and our close button. */}
        {figure || videoUrl ? (
          <div
            className={
              "relative mt-3 w-full flex-shrink-0 overflow-hidden rounded-2xl bg-surface aspect-video " +
              (demoOpen
                ? // An open clip on a short phone stays short enough that the
                  // weight and Done both fit under it (round 8: it hid the weight).
                  "[@media(max-height:760px)]:max-h-[24vh] "
                : "max-h-[20vh] " +
                  // The rep grid needs ~110px more than Done, so a top set keeps
                  // the band shorter on tall phones too.
                  (compactMedia
                    ? "[@media(min-height:760px)]:max-h-[22vh] "
                    : "[@media(min-height:760px)]:aspect-square [@media(min-height:760px)]:max-h-[44vh] ") +
                  (shortBandGone ? "hidden [@media(min-height:760px)]:block" : ""))
            }
          >
            {figure ? (
              <ExerciseFigure figure={figure} side="B" playing={!demoOpen} getElapsed={elapsed} />
            ) : null}
            {videoUrl && !resting ? (
              <DemoVideo
                key={demoOpen ? "open" : "closed"}
                url={videoUrl}
                start={active.exercise.video_start}
                end={active.exercise.video_end}
                title={active.exercise.name}
                hasFigure={!!figure}
                wholeArea
                hideClose
                initialOpen={demoOpen}
                onUserToggle={(open) => {
                  if (open) openDemo();
                }}
              />
            ) : null}
          </div>
        ) : null}
        {demoOpen ? (
          <>
            <div className="mt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  OPENED_DEMOS.delete(active.exercise.id);
                  CLOSED_DEMOS.add(active.exercise.id);
                  setDemoOpen(false);
                  setAskAutoplay(false);
                }}
                className="flex-shrink-0 h-11 rounded-full bg-surface-2 border border-line-strong px-3.5 text-caption font-semibold text-ink"
              >
                Hide demo
              </button>
            </div>
            {askAutoplay ? (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-line-soft px-3 py-1.5">
                <span className="min-w-0 text-caption text-ink">Autoplay clips? They load from YouTube.</span>
                <span className="flex flex-shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAutoplay(true);
                      setAskAutoplay(false);
                    }}
                    className="h-11 rounded-full bg-surface-2 border border-line-strong px-3.5 text-caption font-semibold text-ink"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoplay(false);
                      setAskAutoplay(false);
                    }}
                    className="h-11 rounded-full border border-line-soft px-3 text-caption text-ink"
                  >
                    Not now
                  </button>
                </span>
              </div>
            ) : null}
          </>
        ) : null}
        {videoUrl && !demoOpen && shortBandGone ? (
          <button
            type="button"
            onClick={openDemo}
            aria-label={`Watch demo video of ${active.exercise.name}. Loads from YouTube`}
            className="mt-3 self-start flex h-11 items-center gap-1.5 rounded-full border border-line-strong bg-surface-2 px-4 text-caption font-semibold text-ink [@media(min-height:760px)]:hidden"
          >
            <span aria-hidden="true">▶</span> Watch demo
          </button>
        ) : null}

        {/* "Set N of M" sits on its own line with nothing that can push it
            out: it used to share a truncating line with the exercise name,
            which is how "set 1 of 8" disappeared at 375px. */}
        <div className="flex items-baseline justify-between gap-3 mt-4">
          <span className="text-small font-semibold text-ink">
            Set {activeSetIndex + 1} of {active.rowCount}
            {role === "Set" ? "" : ` · ${role}`}
            {isOptionalRow(active, activeSetIndex) ? " · optional" : ""}
          </span>
          <span className="flex-shrink-0 text-small text-muted">
            {totalRemaining} {totalRemaining === 1 ? "set" : "sets"} left today
          </span>
        </div>
        {/* Set strip (2026-10-28, voted 4–1 over a table). The pips were one
            non-wrapping row of flex-1 tiles: 20 sets made them 13px wide.
            Fixed 56px chips scroll sideways instead, so 8 and 20 sets look
            the same, and every set — logged ones included — is still one tap
            away. Accessible names are unchanged; the harness walks them. */}
        {active.rowCount > 1 ? (
          <div className="relative mt-2 -mx-4 flex-shrink-0">
          <div ref={stripRef} className="px-4 flex gap-2 overflow-x-auto no-scrollbar">
            {Array.from({ length: active.rowCount }, (_, i) => {
              const done = loggedAt(i);
              const isCurrent = i === activeSetIndex;
              const logged = sets[i];
              const optionalRow = isOptionalRow(active, i);
              const planned = active.suggestion
                ? prescriptionRows(active.suggestion, active.schemeRowCount ?? active.rowCount)[i]
                : null;
              return (
                <button
                  key={i}
                  type="button"
                  ref={isCurrent ? currentChipRef : undefined}
                  onClick={() => onSelectSetIndex(i)}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={
                    done && logged
                      ? logged.failed === true
                        ? `Set ${i + 1}, missed ${logged.weight_kg} kilos. Edit.`
                        : logged.seconds != null
                          ? `Set ${i + 1}, held ${logged.seconds} seconds. Edit.`
                          : active.isLoadable
                            ? `Set ${i + 1}, logged ${logged.weight_kg} kilos by ${logged.reps} reps. Edit.`
                            : `Set ${i + 1}, logged ${logged.reps} reps. Edit.`
                      : `Set ${i + 1}${optionalRow ? ", optional" : ""}, not logged yet`
                  }
                  className={
                    "flex-shrink-0 min-w-[56px] h-11 px-2 rounded-xl text-center " +
                    (optionalRow && !done && !isCurrent ? "border border-dashed " : "border ") +
                    (isCurrent
                      ? "border-bronze bg-surface-2"
                      : done
                        ? "border-transparent bg-surface-2"
                        : "border-line-soft bg-transparent")
                  }
                >
                  <span className={"flex items-center justify-center gap-1 text-caption leading-none " + (isCurrent ? "text-bronze" : "text-muted")}>
                    {done && logged && logged.failed !== true ? "✓" : ""}
                    {i + 1}
                    {/* The top set is the one that moves the training max. */}
                    {setRole(active, i) === "Top set" ? (
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-bronze" />
                    ) : null}
                  </span>
                  <span
                    className={
                      "block text-caption font-semibold leading-none mt-1 tabular-nums whitespace-nowrap " +
                      (isCurrent ? "text-strong" : done ? "text-ink" : "text-muted")
                    }
                  >
                    {done && logged
                      ? logged.failed === true
                        ? // "122×0" reads as a logging mistake.
                          "miss"
                        : logged.seconds != null
                          ? `${logged.seconds}s`
                          : active.isLoadable
                            ? `${logged.weight_kg}×${logged.reps}`
                            : `${logged.reps}`
                      : planned && active.isLoadable
                        ? `${planned.kg}`
                        : "·"}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Fade at the right edge: the strip scrolls, and a chip cut off at
              the screen edge did not say so. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-ground to-transparent" />
          </div>
        ) : null}

        {/* The target sits centred in the space between the set strip and
            Done (round 8): one spacer above it left a dead band at 375. */}
        <div className="flex-1 min-h-3" />
        {/* The target sits just above Done (2026-10-28): it used to float
            mid-screen, 92px, with empty space on both sides of it. */}
        <div className="flex flex-col items-center text-center pb-3">
          <div className={"flex items-center gap-2 mb-1" + (demoOpen ? " [@media(max-height:760px)]:hidden" : "")}>
            {setForRow.failed === true ? (
              <span className="text-caption font-semibold text-strong border border-line-strong rounded-md px-1.5 py-0.5">
                Missed
              </span>
            ) : null}
            {wouldBePR ? (
              <span className="text-caption font-semibold text-ground bg-green rounded-md px-1.5 py-0.5">{`PR at ${reps}`}</span>
            ) : null}
          </div>
          {active.isLoadable ? (
            <p className="flex items-baseline gap-1.5">
              <span
                className={
                  // An open clip takes the band's full 16:9; on a short phone
                  // the weight steps down so it stays above the fold.
                  (demoOpen ? "text-metric [@media(min-height:760px)]:text-[64px] " : "text-[64px] [@media(max-height:700px)]:text-[52px] ") +
                  "leading-none font-semibold tracking-[-.04em] tabular-nums text-strong"
                }
              >
                {weight}
              </span>
              <span className="text-h3 font-medium text-muted">kg</span>
            </p>
          ) : null}
          {isHold ? (
            <>
              <p className="text-[64px] [@media(max-height:700px)]:text-[52px] leading-none font-semibold tracking-[-.04em] tabular-nums text-strong">
                {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
              </p>
              <p className="text-small text-muted mt-1">
                {running
                  ? isHoldShaped
                    ? "holding"
                    : "running"
                  : remaining === 0
                    ? awaitingOtherSide
                      ? "first side done"
                      : "done"
                    : durationLabel}
                {perSide ? ` · side ${sideIndex + 1} of 2` : ""}
              </p>
            </>
          ) : (
            <p
              className={
                active.isLoadable
                  ? "text-h2 font-semibold tracking-[-.02em] text-strong mt-0.5"
                  : "text-[64px] [@media(max-height:700px)]:text-[52px] leading-none font-semibold tracking-[-.04em] text-strong"
              }
            >
              {active.isLoadable ? "× " : ""}
              {isAmrap ? `${reps} or more` : active.isLoadable ? reps : `${reps} ${reps === 1 ? "rep" : "reps"}`}
            </p>
          )}
          {plates ? (
            <p className="text-small text-muted mt-2">
              {plates.includes("/side") ? `Per side ${plates.replace(" kg /side", " kg")}` : plates}
            </p>
          ) : null}
          {comparison ? <p className="text-small text-ink mt-1">{comparison}</p> : null}
          {!comparison && !prescribed && authoredDose && role !== "Extra set" ? (
            <p className="text-small text-ink mt-1">Plan: {authoredDose}</p>
          ) : null}
          {nextLine ? <p className="text-caption text-muted mt-2">{nextLine}</p> : null}
        </div>
        <div className="flex-1 min-h-0" />
      </div>

      <div className="flex-shrink-0 px-4 pt-1 pb-[max(env(safe-area-inset-bottom),16px)]">
        {isHold ? (
          <>
            {editingLoad ? (
              <div className="rounded-lg bg-surface-2 p-3 mb-2.5 flex flex-col gap-2">
                <StepperRow
                  label={isHoldShaped ? "seconds" : "minutes"}
                  value={isHoldShaped ? seconds : Math.round(seconds / 60)}
                  step={isHoldShaped ? 5 : 1}
                  onChange={(v) => {
                    // 5-second steps on a 45-minute run would take nine
                    // hundred taps; minutes-based work steps in minutes.
                    const next = isHoldShaped ? v : Math.max(1, v) * 60;
                    setSeconds(next);
                    if (!running) setBanked(0);
                  }}
                />
              </div>
            ) : null}
            <Button
              type="button"
              onClick={() => {
                if (running) {
                  // Pause and bank what was held.
                  setBanked(held);
                  setRunning(false);
                  return;
                }
                if (awaitingOtherSide) {
                  // Reset the clock rather than logging. Not auto-started —
                  // you need a moment to actually switch sides.
                  setSideIndex(1);
                  setBanked(0);
                  holdDoneRef.current = false;
                  announce(`First side done. Switch sides, then start ${seconds} seconds.`);
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
              size="lg"
              block
            >
              {running
                ? "Pause"
                : awaitingOtherSide
                  ? `Other side · ${isHoldShaped ? `${seconds}s` : `${Math.round(seconds / 60)} min`}`
                  : remaining === 0
                  ? `${isEditingLoggedSet ? "Save" : "Done"} — set ${activeSetIndex + 1} · ${
                      isHoldShaped ? `${seconds}s` : `${Math.round(seconds / 60)} min`
                    }`
                  : remaining < seconds
                    ? "Resume"
                    : isHoldShaped
                      ? `Start the hold · ${seconds}s`
                      : `Start the timer · ${Math.round(seconds / 60)} min`}
            </Button>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => onEditingLoad(!editingLoad)}
                className="flex-1 h-11 rounded-xl border border-line-strong bg-surface-2 text-ink text-small font-medium"
              >
                {editingLoad ? "Hide" : "Change time"}
              </button>
              {/* Held it without the timer running, or cut it short — log
                  whatever was actually held rather than forcing the clock
                  to zero. */}
              <button
                type="button"
                onClick={() => {
                  setRunning(false);
                  if (isHold && remaining === seconds) {
                    setConfirmUntimed(true);
                    return;
                  }
                  confirm(1);
                }}
                className="flex-1 h-11 rounded-xl border border-line-strong bg-surface-2 text-ink text-small font-medium"
              >
                Log it now
              </button>
            </div>
            {confirmUntimed ? (
              <div role="alertdialog" aria-label="Log an untimed hold" className="mt-2 rounded-lg bg-surface-2 p-3">
                <p className="text-small text-ink mb-2">
                  The timer hasn&rsquo;t run. Log the full {seconds}s as held?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmUntimed(false);
                      confirm(1, false, seconds);
                    }}
                    className="flex-1 min-h-[44px] rounded-lg bg-bronze text-ground text-small font-semibold"
                  >
                    Log {seconds}s
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmUntimed(false)}
                    className="flex-1 min-h-[44px] rounded-lg border border-line-strong text-ink text-small"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
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
              <div className="rounded-lg bg-surface-2 p-3 mb-2.5 flex flex-col gap-2">
                <StepperRow label="kg" value={weight} step={2.5} onChange={setWeight} />
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-caption uppercase tracking-[.14em] text-ink">
                    Steps of 2.5 kg
                  </span>
                  {prescribed ? (
                    <button
                      type="button"
                      onClick={() => setWeight(prescribed.kg)}
                      className="text-slate text-caption"
                    >
                      Back to prescription
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
            <p className="text-small text-muted mb-2 text-center">
              {isEditingLoggedSet ? `Fix the reps on set ${activeSetIndex + 1}` : "How many reps did you get?"}
            </p>
            {/* BUG-32 (founder, 2026-09-02): this grid ran 1-9 and stopped.
                An AMRAP is unbounded by definition — that is the whole point of
                the "+" in 5+/3+/1+ — so a good day was unloggable. Founder hit
                11 and had to record it in a free-text note, which means the set
                lands with the wrong reps and TM inference reads it wrong, the
                same downstream cost as BUG-28's locked weight. Third defect
                found in this branch: the AMRAP path keeps being built as though
                it were the fixed-rep path.
                Grid keeps the fast taps; "10+" opens a stepper rather than
                adding twenty tiles nobody scans. */}
            {repsOverflow ? (
              <div className="rounded-lg bg-surface-2 p-3 flex flex-col gap-2">
                <StepperRow label="reps" value={overflowReps} step={1} onChange={setOverflowReps} />
                <div className="flex gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setRepsOverflow(false)}
                    className="flex-1 h-11 text-ink text-small"
                  >
                    Back to the grid
                  </button>
                  <button
                    type="button"
                    onClick={() => confirm(overflowReps)}
                    className="flex-1 h-11 rounded-lg bg-bronze text-ground text-body font-semibold"
                  >
                    Log {overflowReps} reps
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => confirm(n)}
                    className="h-[52px] rounded-xl border border-line-soft bg-surface text-strong text-h2 font-semibold tracking-[-.02em]"
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setOverflowReps((r) => (r >= 10 ? r : 10));
                    setRepsOverflow(true);
                  }}
                  className="h-[52px] rounded-xl border border-line-strong bg-surface text-strong text-h3 font-semibold tracking-[-.02em]"
                  aria-label="Ten or more reps"
                >
                  10+
                </button>
              </div>
            )}
            {active.isLoadable ? (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => onEditingLoad(!editingLoad)}
                  className="flex-1 h-11 rounded-xl border border-line-strong bg-surface-2 text-ink text-small font-medium"
                >
                  {editingLoad ? "Hide" : "Change weight"}
                </button>
                {/* Every 5/3/1 top set is an AMRAP, so the heavy single a
                    person actually misses lands in THIS branch, not the
                    fixed-rep one below. Shipping the miss button only there
                    would have missed the case it was written for. */}
                {canRecordMiss && !repsOverflow ? <button
                type="button"
                onClick={() => confirm(0, true)}
                className="flex-1 h-11 rounded-xl border border-line-strong bg-surface-2 text-ink text-small font-medium"
              >
                Missed {weight} kg
              </button> : null}
              </div>
            ) : null}
          </>
        ) : (
          <>
            {editingLoad ? (
              <div className="rounded-lg bg-surface-2 p-3 mb-2.5 flex flex-col gap-2">
                {active.isLoadable ? (
                  <StepperRow label="kg" value={weight} step={2.5} onChange={setWeight} />
                ) : null}
                <StepperRow label="reps" value={reps} step={1} onChange={setReps} />
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-caption uppercase tracking-[.14em] text-ink">
                    {active.isLoadable ? "Steps of 2.5 kg" : "Steps of 1 rep"}
                  </span>
                  {prescribed ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (active.isLoadable) setWeight(prescribed.kg);
                        setReps(parseInt(prescribed.reps, 10) || reps);
                      }}
                      className="text-slate text-caption"
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
            <Button
              type="button"
              onClick={() => confirm(reps)}
              size="lg"
              block
            >
              {active.isLoadable
                ? `${isEditingLoggedSet ? "Save" : "Done"} — set ${activeSetIndex + 1} · ${weight} kg`
                : `${isEditingLoggedSet ? "Save" : "Done"} — set ${activeSetIndex + 1}`}
            </Button>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => onEditingLoad(!editingLoad)}
                className="flex-1 h-11 rounded-xl border border-line-strong bg-surface-2 text-ink text-small font-medium"
              >
                {editingLoad ? "Hide" : active.isLoadable ? "Change weight" : "Change reps"}
              </button>
              {canRecordMiss ? <button
                type="button"
                onClick={() => confirm(0, true)}
                className="flex-1 h-11 rounded-xl border border-line-strong bg-surface-2 text-ink text-small font-medium"
              >
                Missed {weight} kg
              </button> : null}
            </div>
          </>
        )}
      </div>

      {switcherOpen ? (
        <BottomSheet titleId="exercise-switcher-title" onClose={() => setSwitcherOpen(false)} surface="ExerciseSwitcher">
          <p id="exercise-switcher-title" className="text-h3 font-semibold text-strong mb-3">
            Today&rsquo;s exercises
          </p>
          <div className="flex flex-col gap-1.5 mb-3 max-h-[60vh] overflow-y-auto">
            {railExercises.map((r, i) => {
              const logged = countLoggedSets(entrySets(store.logs[date]?.exercises[r.key] ?? null), r.isLoadable);
              const isActive = r.key === active.key;
              const fig = figureFor(r.exercise.id);
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => {
                    setSwitcherOpen(false);
                    if (!isActive) onSelectExercise(r.key);
                  }}
                  aria-current={isActive ? "true" : undefined}
                  className={
                    "flex min-h-[56px] w-full items-center gap-3 rounded-xl px-3 py-2 text-left " +
                    (isActive ? "bg-surface-2 border border-bronze" : "bg-surface-2 border border-transparent")
                  }
                >
                  {fig ? (
                    <span className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-md bg-ground" aria-hidden="true">
                      <ExerciseFigure figure={fig} side="B" playing={false} getElapsed={ZERO} />
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-semibold text-strong">{exerciseListName(r.exercise)}</span>
                    <span className="block text-caption text-muted">Exercise {i + 1}</span>
                  </span>
                  <span className="flex-shrink-0 font-mono text-small tabular-nums text-ink">
                    {logged}/{r.rowCount}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setSwitcherOpen(false)}
            className="w-full h-[52px] rounded-lg border border-line-strong text-ink text-body"
          >
            Close
          </button>
        </BottomSheet>
      ) : null}
      {sheet === "hurt" ? (
        <HurtSheet
          slug={programSlug ?? store.user_profile?.active_program_id}
          date={date}
          onClose={onCloseSheet}
          onNote={() => onOpenSheet("note")}
          onSkipExercise={() => {
            const i = railExercises.findIndex((r) => r.key === active.key);
            const next = railExercises[i + 1];
            onCloseSheet();
            if (next) onSelectExercise(next.key);
            else onBackToBrief();
          }}
          onStopSession={() => {
            onCloseSheet();
            onStopSession();
          }}
        />
      ) : null}
      {sheet === "overflow" ? (
        <OverflowSheet
          active={active}
          activeSetIndex={activeSetIndex}
          date={date}
          onClose={onCloseSheet}
          onAddSet={() => {
            /**
             * Two ways "Add a set" appeared to do nothing (founder, 2026-09-23).
             *
             * 1. It added the row and left the cursor where it was. Coming back
             *    to a finished exercise lands on its LAST logged set, so the
             *    screen kept saying "Editing 120 kg · Save — set 3" and the new
             *    row was a small tile at the end of the strip. He wrote the
             *    extra sets into a note instead.
             * 2. `addSet` pushes onto what is STORED, and rows are only stored
             *    once touched. With fewer stored than prescribed, the pushed
             *    row filled a prescribed slot and `rowCount` did not move.
             *
             * So pad to the prescription first, add one past it, and land on
             * the new row — the one the user asked for.
             */
            const newIndex = Math.max(active.rowCount, sets.length);
            for (let n = sets.length; n <= newIndex; n++) addSet(active.blockId, active.exercise.id, date);
            onCloseSheet();
            onSelectSetIndex(newIndex);
          }}
          onRemoveSet={() => {
            removeSet(active.blockId, active.exercise.id, activeSetIndex, date);
            onCloseSheet();
            // The row under the cursor just went away. Re-landing on the
            // first unfinished set is what `onSetLogged` already does, and
            // leaving the index pointing past the end renders a blank set.
            onBackToBrief();
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
        className="w-[58px] h-[52px] flex-shrink-0 rounded-lg border border-line-strong bg-surface-2 text-strong text-h1 font-medium"
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
          className="w-20 bg-transparent border-0 border-b border-dashed border-line-strong text-strong text-h2 font-semibold tracking-[-.02em] text-center py-0.5 outline-none"
        />
        <span className="text-small font-medium text-muted">{label}</span>
      </span>
      <button
        type="button"
        onClick={() => onChange(round(value + step))}
        className="w-[58px] h-[52px] flex-shrink-0 rounded-lg border border-line-strong bg-surface-2 text-strong text-h1 font-medium"
      >
        +
      </button>
    </div>
  );
}

function round(n: number): number {
  return Math.round(n * 2) / 2;
}
