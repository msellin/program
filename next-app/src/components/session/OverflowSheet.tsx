"use client";

import { useState } from "react";
import { countLoggedSets } from "@/lib/set-progress";
import { prescriptionRows } from "@/lib/engine/suggest";
import { BottomSheet } from "@/components/session/shared/BottomSheet";
import { VideoModal } from "@/components/VideoModal";
import { ExerciseDetailsSheet } from "@/components/workout/ExerciseDetailsSheet";
import { useStore, useDayExercise, entrySets } from "@/lib/useStore";
import type { RailExercise } from "@/components/session/DaySession";

/**
 * Screen 6b's `⋯` sheet.
 *
 * "Remove a set" was cut per the original design, on the reasoning that
 * "Finish here" is what people actually mean and that removing set 3 of 5
 * while set 4 exists is a data-model action rather than a gym action.
 *
 * Restored 2026-09-21. The reasoning held for the case it imagined and not
 * for the one that happened: "Finish here" ends the exercise, it does not
 * delete anything, so a row that exists stays in the log for ever. The
 * founder's 2026-09-21 back squat is stored as three real sets followed by
 * three rows of nulls — `addSet` had been writing rows the rail never
 * rendered — and there was no way, anywhere in the app, to take them out.
 *
 * An app that can add a set and cannot remove one is not making a
 * considered choice about gym actions; it is asymmetric.
 */
export function OverflowSheet({
  active,
  activeSetIndex,
  date,
  onClose,
  onAddSet,
  onRemoveSet,
  onFinishHere,
  onOpenNote,
}: {
  active: RailExercise;
  /** Which row the user is looking at — the one "Remove set N" removes. */
  activeSetIndex: number;
  date: string;
  onClose: () => void;
  onAddSet: () => void;
  /** Removes the set currently being viewed. */
  onRemoveSet: () => void;
  onFinishHere: () => void;
  onOpenNote: () => void;
}) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const store = useStore((s) => s.store);
  const updateSet = useStore((s) => s.updateSet);
  const markDone = useStore((s) => s.markDone);
  const entry = useDayExercise(active.blockId, active.exercise.id, date);
  const loggedCount = countLoggedSets(entrySets(entry), active.isLoadable);

  const exercise = active.exercise;
  const hasWarning = !!(exercise.warning || exercise.avoid);
  const hasVideo = !!(exercise.video_url || exercise.video_search);
  const tm = store.training_maxes[exercise.id];

  const markAllPrescribed = () => {
    const rows = prescriptionRows(active.suggestion, active.schemeRowCount ?? active.rowCount);
    for (let i = 0; i < active.rowCount; i++) {
      const prescribed = rows[i] ?? null;
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
        <p id="overflow-title" className="text-body font-semibold text-strong mb-3.5 tracking-[-.015em]">
          {exercise.name}
        </p>
        <div className="flex flex-col gap-px bg-line-soft border border-line-soft rounded-lg overflow-hidden mb-3.5">
          <Row label="Add a set" hint={`${active.rowCount + 1}th at prescription`} onClick={onAddSet} />
          {active.rowCount > 1 ? (
            <Row
              label={`Remove set ${activeSetIndex + 1}`}
              hint={
                loggedCount > 0 && activeSetIndex < loggedCount
                  ? "Deletes what you logged for it"
                  : "Takes the empty row out"
              }
              onClick={onRemoveSet}
            />
          ) : null}
          <Row
            label="Finish here"
            hint={`Logs ${loggedCount} of ${active.rowCount}, moves on`}
            onClick={() => {
              markDone(active.blockId, exercise.id, true, date);
              onFinishHere();
            }}
          />
          <Row label="I already did this" hint={`Mark all ${active.rowCount} as prescribed`} onClick={markAllPrescribed} />
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
          className="w-full h-[52px] rounded-lg border border-line-strong text-ink text-body"
        >
          Close
        </button>
      </BottomSheet>

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
      <span className="text-body font-medium text-strong">{label}</span>
      <span className="text-eyebrow text-muted">{hint}</span>
    </button>
  );
}
