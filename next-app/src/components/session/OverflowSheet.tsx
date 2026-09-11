"use client";

import { useEffect, useState } from "react";
import { countLoggedSets } from "@/lib/set-progress";
import { BottomSheet } from "@/components/session/shared/BottomSheet";
import { VideoModal } from "@/components/VideoModal";
import { loadProgram } from "@/lib/data-loader";
import { regionsForProgram, type SymptomRegion } from "@/lib/symptom-regions";
import { ExerciseDetailsSheet } from "@/components/workout/ExerciseDetailsSheet";
import { useStore, useDayExercise, entrySets } from "@/lib/useStore";
import type { RailExercise } from "@/components/session/DaySession";

/**
 * Screen 6b's `⋯` sheet. "Remove a set" is cut per the design — "Finish
 * here" is what people actually mean; removing set 3 of 5 while set 4
 * exists is a data-model action, not a gym action.
 */
export function OverflowSheet({
  active,
  date,
  onClose,
  onAddSet,
  onFinishHere,
  onOpenNote,
}: {
  active: RailExercise;
  date: string;
  onClose: () => void;
  onAddSet: () => void;
  onFinishHere: () => void;
  onOpenNote: () => void;
}) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const store = useStore((s) => s.store);
  const [hurtOpen, setHurtOpen] = useState(false);
  const [hurtDone, setHurtDone] = useState<string | null>(null);
  /**
   * The programme's own regions, not the whole library.
   *
   * `regionsForProgram` is the same resolver the morning check uses, so a
   * pull-up user is offered shoulder and elbow rather than the hip
   * programme's groin and buttock. That mismatch is a defect this repo has
   * already shipped once — the hip programme's four regions were rendered to
   * every user of every programme, so a pull-up user with medial
   * epicondylitis had no elbow field and the engine read green.
   *
   * Loaded here rather than threaded down as a prop: `SetView` does not have
   * the programme either, so passing it would mean changing two component
   * signatures for one sheet. `loadProgram` is cached.
   */
  const activeSlug = store.user_profile?.active_program_id;
  const [regions, setRegions] = useState<SymptomRegion[]>([]);
  useEffect(() => {
    if (!hurtOpen || !activeSlug) return;
    let live = true;
    void loadProgram(activeSlug)
      .then((prog) => {
        if (live) setRegions(regionsForProgram(prog as { symptom_regions?: string[] }));
      })
      .catch(() => {
        // A failed load must not leave the user with no way to report pain.
        if (live) setRegions(regionsForProgram(null));
      });
    return () => {
      live = false;
    };
  }, [hurtOpen, activeSlug]);
  const updateSet = useStore((s) => s.updateSet);
  const markDone = useStore((s) => s.markDone);
  const reportInSessionSymptom = useStore((s) => s.reportInSessionSymptom);
  const entry = useDayExercise(active.blockId, active.exercise.id, date);
  const loggedCount = countLoggedSets(entrySets(entry), active.isLoadable);

  const exercise = active.exercise;
  const hasWarning = !!(exercise.warning || exercise.avoid);
  const hasVideo = !!(exercise.video_url || exercise.video_search);
  const tm = store.training_maxes[exercise.id];

  const markAllPrescribed = () => {
    for (let i = 0; i < active.rowCount; i++) {
      const prescribed = active.suggestion?.fsl
        ? i === 0
          ? active.suggestion.top_set
          : { kg: active.suggestion.fsl.kg, reps: String(active.suggestion.fsl.reps) }
        : i === active.rowCount - 1 && active.suggestion
          ? active.suggestion.top_set
          : null;
      if (!prescribed) continue;
      const reps = parseInt(prescribed.reps, 10);
      updateSet(active.blockId, exercise.id, i, { weight_kg: prescribed.kg, reps: Number.isFinite(reps) ? reps : null }, date);
    }
    markDone(active.blockId, exercise.id, true, date);
    onClose();
  };

  return (
    <>
      <BottomSheet surface="OverflowSheet" titleId="overflow-title" onClose={onClose}>
        <p id="overflow-title" className="text-[16px] font-semibold text-strong mb-3.5 tracking-[-.015em]">
          {exercise.name}
        </p>
        <div className="flex flex-col gap-px bg-line-soft border border-line-soft rounded-[9px] overflow-hidden mb-3.5">
          <Row label="Add a set" hint={`${active.rowCount + 1}th at prescription`} onClick={onAddSet} />
          <Row
            label="Finish here"
            hint={`Logs ${loggedCount} of ${active.rowCount}, moves on`}
            onClick={() => {
              markDone(active.blockId, exercise.id, true, date);
              onFinishHere();
            }}
          />
          <Row label="I already did this" hint={`Mark all ${active.rowCount} as prescribed`} onClick={markAllPrescribed} />
          {/* Something hurt (2026-09-11).
              Four programmes REQUIRE the user to tick "I agree to stop the
              session if shoulder pain appears during a hang, transition, or
              support hold — no training through it." Nothing could detect
              that: the morning check is the only symptom input and it runs
              before the session, so the moment the consent is actually about
              had nowhere to be recorded.
              Sits next to "Finish here" because that is the action it most
              often precedes — and it OFFERS that rather than doing it.
              Confirm-first: the engine proposes, the user decides, and an app
              that ends someone's session on their behalf has stopped
              proposing. */}
          <Row
            label="Something hurt"
            hint="Record it, and stop if you should"
            onClick={() => setHurtOpen(true)}
          />
          <Row label="Note for this exercise" hint="›" onClick={onOpenNote} />
          {hasVideo ? <Row label="Watch the lift" hint="›" onClick={() => setVideoOpen(true)} /> : null}
          <Row
            label={
              <span className="flex items-center gap-2">
                Form cues and warnings
                {hasWarning ? (
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-amber" />
                ) : null}
              </span>
            }
            hint="›"
            onClick={() => setDetailsOpen(true)}
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full h-[52px] rounded-[10px] border border-line-strong text-ink text-[15px]"
        >
          Close
        </button>
      </BottomSheet>

        {hurtOpen ? (
          <BottomSheet
            surface="HurtSheet"
            titleId="hurt-title"
            onClose={() => { setHurtOpen(false); setHurtDone(null); }}
          >
            <p id="hurt-title" className="mb-3 text-[16px] font-semibold tracking-[-.015em] text-strong">
              Something hurt
            </p>
            {hurtDone ? (
              <div className="space-y-3 p-1">
                <p role="status" className="text-sm text-ink">
                  Recorded — {hurtDone}. Today&rsquo;s readiness has been updated, so
                  tomorrow&rsquo;s session already knows.
                </p>
                {/* The programme's own sentence, at the moment it applies.
                    Four programmes make the user agree to stop the session if
                    pain appears during a hang, transition or support hold.
                    Showing it here is the difference between a consent taken
                    once at intake and a rule that reaches the person in the
                    position it describes. */}
                <p className="text-sm text-muted">
                  You agreed at intake to stop rather than train through it. That is
                  still the advice.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    markDone(active.blockId, exercise.id, true, date);
                    setHurtOpen(false);
                    setHurtDone(null);
                    onFinishHere();
                  }}
                  className="min-h-[48px] w-full rounded bg-bronze px-4 py-3 text-sm font-semibold text-ink-inverse"
                >
                  Stop here
                </button>
                <button
                  type="button"
                  onClick={() => { setHurtOpen(false); setHurtDone(null); onClose(); }}
                  className="min-h-[48px] w-full rounded border border-line-soft px-4 py-3 text-sm"
                >
                  Keep going
                </button>
              </div>
            ) : (
              <div className="space-y-2 p-1">
                <p className="text-sm text-muted">Where? This goes on today&rsquo;s record.</p>
                {regions.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      /**
                       * 5, which is AMBER.
                       *
                       * `deriveState` reds at `peak > 5` and ambers at
                       * `peak >= 4`. This was 6 until it was driven in the
                       * running app and turned the day red — a single tap,
                       * with no severity asked for and none given, declaring
                       * the day unsafe to train.
                       *
                       * Amber is what the report actually supports: something
                       * is up, the plan should soften, and the rule the user
                       * agreed to is shown so they can stop if it warrants
                       * it. Red is a claim this input cannot make. The
                       * morning check remains the place to say how bad, on
                       * the same unchanged scale.
                       */
                      reportInSessionSymptom(date, r.id, 5);
                      setHurtDone(r.label.toLowerCase());
                    }}
                    className="flex min-h-[48px] w-full items-center justify-between rounded border border-line-soft px-3 py-3 text-left text-sm active:bg-line-soft/50"
                  >
                    <span>{r.label}</span>
                    <span aria-hidden className="text-muted">›</span>
                  </button>
                ))}
                {regions.length === 0 ? (
                  <p className="text-sm text-muted">Loading…</p>
                ) : null}
              </div>
            )}
          </BottomSheet>
        ) : null}
      {videoOpen ? (
        <VideoModal
          title={exercise.name}
          videoUrl={exercise.video_url}
          searchQuery={exercise.video_search ?? `${exercise.name} exercise form`}
          onClose={() => setVideoOpen(false)}
        />
      ) : null}
      {detailsOpen ? (
        <ExerciseDetailsSheet
          exercise={exercise}
          item={active.item}
          tm={tm}
          onClose={() => setDetailsOpen(false)}
        />
      ) : null}
    </>
  );
}

function Row({
  label,
  hint,
  onClick,
}: {
  label: React.ReactNode;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-3 w-full text-left border-none bg-surface-2 px-3.5 py-[15px]"
    >
      <span className="text-[15px] font-medium text-strong">{label}</span>
      <span className="font-mono text-[11px] text-muted">{hint}</span>
    </button>
  );
}
