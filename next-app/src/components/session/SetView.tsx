"use client";

import { useState } from "react";
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
  onBackToBrief,
  onConfirmed,
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
  sheet: SessionSheet;
  onOpenSheet: (s: SessionSheet) => void;
  onCloseSheet: () => void;
  date: string;
}) {
  const store = useStore((s) => s.store);
  const updateSet = useStore((s) => s.updateSet);
  const addSet = useStore((s) => s.addSet);

  const entry = useDayExercise(active.blockId, active.exercise.id, date);
  const sets = entrySets(entry);
  const prevSets = lastSessionSetsFor(store, active.exercise.id, date);
  const setForRow = sets[activeSetIndex] ?? { weight_kg: null, reps: null, rpe: null };
  const prevForRow = prevSets?.[activeSetIndex];
  const prev =
    prevForRow && prevForRow.weight_kg != null && prevForRow.reps != null
      ? { weight_kg: prevForRow.weight_kg, reps: prevForRow.reps }
      : null;
  const prescribed = active.suggestion?.fsl
    ? activeSetIndex === 0
      ? active.suggestion.top_set
      : { kg: active.suggestion.fsl.kg, reps: String(active.suggestion.fsl.reps) }
    : activeSetIndex === active.rowCount - 1 && active.suggestion
      ? active.suggestion.top_set
      : null;
  const isAmrap = !!prescribed?.reps?.includes("+");

  // Local editable weight/reps, seeded from the logged value (if any) or
  // the prescription/last-time fallback. Committed to the store only on
  // Done — the README: "Weight is prefilled... editable at any moment,"
  // and the confirm button names the exact number it will log.
  const [weight, setWeight] = useState<number>(
    () => setForRow.weight_kg ?? prescribed?.kg ?? prev?.weight_kg ?? 0,
  );
  const [reps, setReps] = useState<number>(
    () => setForRow.reps ?? (parseInt(prescribed?.reps ?? "", 10) || prev?.reps || 0),
  );
  // No resync-effect: DaySession mounts this component with
  // `key={active.key + activeSetIndex}`, so React fully remounts (and
  // re-runs the useState initializers above) whenever the exercise or
  // set index changes, instead of an effect reaching back to reset
  // state — React's own recommended pattern over "sync state via effect."

  const wouldBePR =
    active.isLoadable && weight > 0 && reps > 0 && isSetPR(store, active.exercise.id, weight, reps, date);
  const plates = active.isLoadable ? platesLabel(weight) : null;

  const totalRemaining = railExercises.reduce((n, r) => {
    const rEntry = store.logs[date]?.exercises[r.key] ?? null;
    const logged = entrySets(rEntry).filter((s) => s.weight_kg != null && s.reps != null).length;
    return n + Math.max(0, r.rowCount - logged);
  }, 0);

  const confirm = (finalReps: number) => {
    updateSet(
      active.blockId,
      active.exercise.id,
      activeSetIndex,
      { weight_kg: active.isLoadable ? weight : null, reps: finalReps },
      date,
    );
    onConfirmed(restSecondsFor(active.exercise));
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
          {railExercises.map((r) => {
            const rEntry = store.logs[date]?.exercises[r.key] ?? null;
            const logged = entrySets(rEntry).filter((s) => s.weight_kg != null && s.reps != null).length;
            const isActive = r.key === active.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => onSelectExercise(r.key)}
                style={{ flex: isActive ? 2 : 1 }}
                className={
                  "min-w-0 rounded-[7px] px-1 py-1.5 text-center border " +
                  (isActive ? "border-bronze bg-[rgba(200,150,102,.14)]" : "border-line-soft bg-surface")
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
                  className={"block font-mono text-[9px] mt-0.5 " + (isActive ? "text-bronze" : "text-line")}
                >
                  {logged}/{r.rowCount}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onOpenSheet("overflow")}
            aria-label="More options"
            className="flex-shrink-0 w-[34px] h-[34px] rounded-[7px] border border-line-strong bg-surface-2 text-strong text-[15px] font-semibold"
          >
            ⋯
          </button>
        </div>
        <div className="flex justify-between mt-2.5 px-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[.14em] text-ink">
            {active.exercise.name} · set {activeSetIndex + 1} of {active.rowCount}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[.14em] text-ink">
            {totalRemaining} sets left
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center min-h-0">
        <p className="font-mono text-[11px] uppercase tracking-[.18em] text-bronze mb-[18px] flex items-center gap-2">
          {activeSetIndex === active.rowCount - 1 ? "Top set" : "Set"}
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
        <p
          className={
            active.isLoadable
              ? "text-[26px] leading-[1.2] font-semibold tracking-[-.02em] text-strong mb-3"
              : "text-[92px] leading-[.9] font-semibold tracking-[-.05em] text-strong mb-3"
          }
        >
          {isAmrap ? `${reps}+ reps` : `${reps} reps`}
        </p>
        {prev || prescribed ? (
          <div className="flex items-stretch border border-line-soft rounded-[8px] overflow-hidden mb-3">
            {prev ? (
              <div className="px-4 py-2.5 bg-surface">
                <p className="font-mono text-[9.5px] uppercase tracking-[.14em] text-line mb-0.5">
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
                <p className="font-mono text-[9.5px] uppercase tracking-[.14em] text-line mb-0.5">
                  Prescribed
                </p>
                <p className="text-[15px] font-semibold text-ink">
                  {active.isLoadable ? `${prescribed.kg} × ${prescribed.reps}` : prescribed.reps}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
        {plates ? <p className="font-mono text-[11px] text-line">{plates}</p> : null}
      </div>

      <div className="flex-shrink-0 px-[22px] pb-[22px]">
        {isAmrap ? (
          <>
            <p className="font-mono text-[10px] uppercase tracking-[.14em] text-muted mb-2 text-center">
              Reps you got on set {activeSetIndex + 1}
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
                ? `Done — set ${activeSetIndex + 1} · ${weight} kg`
                : `Done — set ${activeSetIndex + 1}`}
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
