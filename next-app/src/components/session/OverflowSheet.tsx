"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/session/shared/BottomSheet";
import { VideoModal } from "@/components/VideoModal";
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
  const updateSet = useStore((s) => s.updateSet);
  const markDone = useStore((s) => s.markDone);
  const entry = useDayExercise(active.blockId, active.exercise.id, date);
  const loggedCount = entrySets(entry).filter((s) => s.weight_kg != null && s.reps != null).length;

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
      <BottomSheet titleId="overflow-title" onClose={onClose}>
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
      <span className="font-mono text-[11px] text-line">{hint}</span>
    </button>
  );
}
