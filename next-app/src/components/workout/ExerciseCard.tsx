"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Play,
  Info,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { cn, hapticTap } from "@/lib/utils";
import { useStore, useDayExercise, entrySets } from "@/lib/useStore";
import { suggestForExercise, inferTMFromSet, type Suggestion } from "@/lib/engine/suggest";
import { lastSessionSetsFor } from "@/lib/engine/history";
import { isSetPR } from "@/lib/pr";
import { SetRow } from "./SetRow";
import { SuggestionBox } from "./SuggestionBox";
import { NoteSignalHint } from "./NoteSignalHint";
import { EngineReadsNotesHint } from "./EngineReadsNotesHint";
import { ExerciseDetailsSheet } from "./ExerciseDetailsSheet";
import { VideoModal } from "@/components/VideoModal";
import type { Exercise, Program, Block } from "@/lib/schemas";
import { today } from "@/lib/utils";

type Item = NonNullable<Block["items"]>[number];

type Props = {
  blockId: string;
  item: Item;
  exercise: Exercise;
  program: Program;
  date?: string;
};

export function ExerciseCard({ blockId, item, exercise, program, date }: Props) {
  const activeDate = date ?? today();
  const [videoOpen, setVideoOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  // Collapsed by default so a day's list is scannable. Auto-expands when the user
  // has started logging (any set has any value) so mid-session doesn't need re-tap.
  const [manuallyExpanded, setManuallyExpanded] = useState(false);
  const store = useStore((s) => s.store);
  const updateSet = useStore((s) => s.updateSet);
  const addSet = useStore((s) => s.addSet);
  const removeSet = useStore((s) => s.removeSet);
  const setNotes = useStore((s) => s.setNotes);
  const markDone = useStore((s) => s.markDone);
  const setTM = useStore((s) => s.setTM);

  const todayEntry = useDayExercise(blockId, exercise.id, activeDate);
  const sets = entrySets(todayEntry);
  const notes = todayEntry?.notes ?? "";
  const done = todayEntry?.done ?? false;

  const suggestion: Suggestion | null = suggestForExercise(
    exercise.id,
    blockId,
    program,
    store,
    activeDate,
  );

  // Last session's set array — used to pre-fill SetRow placeholders. #1 praised
  // feature in Strong / Hevy reviews: last numbers appear as ghost text.
  const prevSets = lastSessionSetsFor(store, exercise.id, activeDate);

  const tm = store.training_maxes[exercise.id];
  const isLoadable = ["strength", "unilateral"].includes(exercise.category);

  const isLeftEmphasis = exercise.default?.extra_set_side === "left";
  const isRightEmphasis = exercise.default?.extra_set_side === "right";
  const hasLaterality = isLeftEmphasis || isRightEmphasis;

  const hasWarning = !!(exercise.warning || exercise.avoid);
  const hasVideo = !!(exercise.video_url || exercise.video_search);
  const hasNotesContent = !!notes.trim();

  // Number of prescribed sets: prefer item.sets → exercise default → 3
  const defaultSets =
    (typeof item.sets === "number" ? item.sets : undefined) ??
    (typeof exercise.default?.sets === "number" ? (exercise.default.sets as number) : undefined) ??
    3;
  const rowCount = Math.max(sets.length, defaultSets);

  // Auto-expand once the user starts logging (any set has a value).
  // Collapse automatically once marked done, unless the user has explicitly re-expanded.
  const hasAnyLoggedValue = sets.some((s) => s.weight_kg != null || s.reps != null);
  const expanded = manuallyExpanded || (hasAnyLoggedValue && !done);

  // Compact one-line preview shown when collapsed
  const previewText = suggestion
    ? `${suggestion.top_set.kg} kg × ${suggestion.top_set.reps}`
    : `${rowCount} sets`;

  // TM auto-suggest surfaces only after the session is done OR the last prescribed
  // row has both weight and reps recorded. Was: mid-session banner on any set entry,
  // which stacked a 4th block into the card while logging.
  const lastPrescribedRow = sets[rowCount - 1];
  const lastRowFilled = !!(lastPrescribedRow?.weight_kg && lastPrescribedRow?.reps);
  const showTmSuggest = tm != null && (done || lastRowFilled);

  return (
    <article
      data-exercise-card
      className={cn(
        "bg-surface border border-line rounded-md overflow-hidden",
        hasLaterality ? "grid grid-cols-[28px_1fr]" : "block",
        done && "opacity-90",
      )}
    >
      {/* Laterality spine — only rendered when the exercise emphasises a side. */}
      {hasLaterality ? (
        <aside className="bg-line-soft flex flex-col items-center justify-center gap-0.5 py-2 font-mono text-[9px] font-bold text-muted uppercase">
          {isLeftEmphasis ? (
            <>
              <span className="text-lat-left">L</span>
              <span>R</span>
            </>
          ) : (
            <>
              <span>L</span>
              <span className="text-lat-right">R</span>
            </>
          )}
        </aside>
      ) : null}

      <div className="p-3 space-y-3 min-w-0">
        {/* Header — always visible. Tap the name area to expand; secondary icons on the right. */}
        <header className="flex items-center gap-2">
          <label
            className="flex-shrink-0 w-11 h-11 -my-1 flex items-center justify-center cursor-pointer"
            aria-label={`Mark ${exercise.name} done`}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={done}
              onChange={(e) => {
                const next = e.target.checked;
                markDone(blockId, exercise.id, next, activeDate);
                if (next) {
                  setManuallyExpanded(false);
                  hapticTap("light");
                  const row = e.currentTarget.closest("[data-exercise-card]") as HTMLElement | null;
                  if (row) {
                    row.classList.remove("mark-done-flash");
                    // Force reflow to restart the animation if repeatedly toggled.
                    void row.offsetWidth;
                    row.classList.add("mark-done-flash");
                  }
                }
              }}
              className="w-5 h-5 accent-bronze cursor-pointer"
            />
          </label>
          <button
            type="button"
            onClick={() => setManuallyExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={`ex-body-${blockId}-${exercise.id}`}
            className="flex-1 flex items-center gap-2 min-w-0 text-left py-1 -my-1"
          >
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-semibold tracking-tight truncate",
                  done && "line-through decoration-1 opacity-60",
                )}
              >
                {exercise.name}
              </h3>
              {previewText ? (
                <p className="font-mono text-[12px] text-slate mt-0.5 truncate">{previewText}</p>
              ) : null}
              {typeof (item as { note?: string }).note === "string" && (item as { note: string }).note.trim() ? (
                <p className="text-[13px] text-muted italic mt-1 leading-snug">
                  <span className="font-mono text-[10px] uppercase tracking-wider not-italic text-bronze mr-1.5">
                    cue
                  </span>
                  {(item as { note: string }).note}
                </p>
              ) : null}
            </div>
            {expanded ? (
              <ChevronDown size={16} className="text-muted flex-shrink-0" aria-hidden />
            ) : (
              <ChevronRight size={16} className="text-muted flex-shrink-0" aria-hidden />
            )}
          </button>
          {/* Secondary actions — always visible so they're 1 tap away regardless of expand state. */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {hasVideo ? (
              <button
                type="button"
                onClick={() => setVideoOpen(true)}
                aria-label="Watch demo"
                className="w-11 h-11 flex items-center justify-center text-muted hover:text-ink hover:bg-line-soft rounded"
              >
                <Play size={15} strokeWidth={1.75} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              aria-label={hasWarning ? "Warning + details" : "Details"}
              className={cn(
                "w-11 h-11 flex items-center justify-center rounded hover:bg-line-soft",
                hasWarning ? "text-amber" : "text-muted hover:text-ink",
              )}
            >
              {hasWarning ? (
                <AlertTriangle size={15} strokeWidth={1.75} />
              ) : (
                <Info size={15} strokeWidth={1.75} />
              )}
            </button>
          </div>
        </header>

        {expanded ? (
          <div id={`ex-body-${blockId}-${exercise.id}`} className="space-y-3">
            {/* Suggestion (adaptive engine — never demoted). */}
            {suggestion ? <SuggestionBox suggestion={suggestion} /> : null}

            {/* Sets */}
            {isLoadable ? (
              <div className="rounded border border-line-soft overflow-hidden">
                <div
                  className={cn(
                    "grid gap-2 items-center px-3 py-1.5 bg-line-soft/50 text-[10px] font-mono uppercase tracking-wider text-muted",
                    "grid-cols-[24px_minmax(60px,1fr)_minmax(70px,80px)_minmax(60px,70px)_50px_28px_28px]",
                  )}
                >
                  <span className="text-center">#</span>
                  <span>Prev / Rx</span>
                  <span>Weight kg</span>
                  <span>Reps</span>
                  <span>RPE</span>
                  <span aria-hidden></span>
                  <span aria-hidden></span>
                </div>
                {Array.from({ length: rowCount }).map((_, i) => {
                  const setForRow = sets[i] ?? { weight_kg: null, reps: null, rpe: null };
                  const pr =
                    setForRow.weight_kg != null && setForRow.reps != null
                      ? isSetPR(store, exercise.id, setForRow.weight_kg, setForRow.reps, activeDate)
                      : false;
                  const prevForRow = prevSets?.[i];
                  const prevProp =
                    prevForRow && prevForRow.weight_kg != null && prevForRow.reps != null
                      ? { weight_kg: prevForRow.weight_kg, reps: prevForRow.reps }
                      : null;
                  return (
                    <SetRow
                      key={i}
                      index={i}
                      set={setForRow}
                      prev={prevProp}
                      prescribed={
                        i === rowCount - 1 && suggestion
                          ? suggestion.top_set
                          : suggestion?.fsl && i < rowCount - 1
                            ? { kg: suggestion.fsl.kg, reps: String(suggestion.fsl.reps) }
                            : null
                      }
                      isPR={pr}
                      restSeconds={restSecondsFor(exercise)}
                      onChange={(patch) => updateSet(blockId, exercise.id, i, patch, activeDate)}
                      onRemove={
                        sets.length > 0 && i < sets.length
                          ? () => removeSet(blockId, exercise.id, i, activeDate)
                          : undefined
                      }
                    />
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    const target = rowCount + 1;
                    const toAdd = target - sets.length;
                    for (let n = 0; n < toAdd; n++) addSet(blockId, exercise.id, activeDate);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 min-h-[44px] text-[12px] font-mono uppercase tracking-wider text-muted hover:text-ink hover:bg-line-soft transition-colors"
                >
                  <Plus size={14} />
                  Add set
                </button>
                {/* TM auto-suggest — only after done or last set filled. */}
                {showTmSuggest ? (
                  <TMSuggestionInline
                    exId={exercise.id}
                    sets={sets}
                    currentTM={tm}
                    onAccept={(newTM) => setTM(exercise.id, newTM)}
                  />
                ) : null}
              </div>
            ) : null}

            {/* Notes — hidden behind a "+ Note" button by default. */}
            {notesOpen || hasNotesContent ? (
              <div>
                <label
                  htmlFor={`notes-${blockId}-${exercise.id}`}
                  className="block text-[11px] text-muted mb-1"
                >
                  Notes
                </label>
                <textarea
                  id={`notes-${blockId}-${exercise.id}`}
                  rows={2}
                  placeholder="How did it feel? Anything to flag?"
                  value={notes}
                  onChange={(e) => setNotes(blockId, exercise.id, e.target.value, activeDate)}
                  className="block w-full max-w-full text-sm px-2 py-1.5 border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-slate/40 focus:border-slate resize-y min-h-[44px] break-words [overflow-wrap:anywhere] whitespace-pre-wrap"
                />
                <EngineReadsNotesHint variant="session" />
                <NoteSignalHint text={notes} />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setNotesOpen(true)}
                className="inline-flex items-center gap-1.5 text-[12px] text-slate hover:text-ink"
              >
                <MessageSquare size={13} />
                Add note
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Video modal */}
      {videoOpen ? (
        <VideoModal
          title={exercise.name}
          videoUrl={exercise.video_url}
          searchQuery={exercise.video_search ?? `${exercise.name} exercise form`}
          onClose={() => setVideoOpen(false)}
        />
      ) : null}

      {/* Details sheet (dose, scheme, TM, warning, cues, rationale, flags) */}
      {detailsOpen ? (
        <ExerciseDetailsSheet
          exercise={exercise}
          item={item}
          tm={tm}
          onClose={() => setDetailsOpen(false)}
        />
      ) : null}
    </article>
  );
}

function restSecondsFor(ex: Exercise): number {
  if (ex.category === "strength") return 180;
  if (ex.category === "unilateral") return 90;
  if (ex.category === "trunk" || ex.category === "mobility") return 60;
  return 120;
}

function TMSuggestionInline({
  exId: _exId,
  sets,
  currentTM,
  onAccept,
}: {
  exId: string;
  sets: Array<{ weight_kg: number | null; reps: number | null; rpe?: number | null }>;
  currentTM: number;
  onAccept: (newTM: number) => void;
}) {
  const heaviest = [...sets]
    .filter((s) => s.weight_kg && s.reps)
    .sort((a, b) => (b.weight_kg ?? 0) - (a.weight_kg ?? 0))[0];
  if (!heaviest || !heaviest.weight_kg || !heaviest.reps) return null;
  const est = inferTMFromSet(heaviest.weight_kg, heaviest.reps, heaviest.rpe ?? null, currentTM);
  if (!est) return null;
  const delta = est.suggestedTM - currentTM;
  if (Math.abs(delta) < 2.5) return null;
  return (
    <div className="px-3 py-2 border-t border-line-soft text-[12px] font-mono text-muted flex items-center justify-between gap-2 flex-wrap">
      <span>
        → est 1RM ~{est.est1RM} kg · suggested TM{" "}
        <strong className="text-slate">{est.suggestedTM} kg</strong>{" "}
        <span className={delta >= 0 ? "text-green" : "text-red"}>
          ({delta >= 0 ? "+" : ""}
          {delta.toFixed(1)})
        </span>
      </span>
      <button
        type="button"
        onClick={() => onAccept(est.suggestedTM)}
        className="px-2 py-0.5 border border-slate rounded text-slate hover:bg-slate hover:text-surface transition-colors"
      >
        Set TM
      </button>
    </div>
  );
}
