"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimer } from "@/lib/useTimer";
import type { SetLog } from "@/lib/schemas";

type Props = {
  index: number;
  set: SetLog;
  prev?: { weight_kg: number; reps: number } | null;
  prescribed?: { kg: number; reps: string } | null;
  isPR?: boolean;
  restSeconds?: number;
  onChange: (patch: Partial<SetLog>) => void;
  onRemove?: () => void;
};

export function SetRow({ index, set, prev, prescribed, isPR, restSeconds, onChange, onRemove }: Props) {
  const filled = set.weight_kg != null && set.reps != null;
  const startTimer = useTimer((s) => s.start);
  const previouslyFilled = useRef(filled);
  const [notesOpen, setNotesOpen] = useState(!!set.notes);
  useEffect(() => {
    if (filled && !previouslyFilled.current && restSeconds) {
      startTimer(restSeconds);
    }
    previouslyFilled.current = filled;
  }, [filled, restSeconds, startTimer]);
  const hasNote = !!(set.notes && set.notes.trim());
  return (
    <div
      className={cn(
        "grid gap-2 items-center py-2 px-3 border-b border-line-soft last:border-b-0 text-sm",
        "grid-cols-[24px_minmax(60px,1fr)_minmax(70px,80px)_minmax(60px,70px)_50px_28px_28px]",
      )}
    >
      <span className="text-xs font-mono text-muted text-center">{index + 1}</span>
      <div className="text-[11px] font-mono text-muted overflow-hidden">
        {prescribed ? (
          <span className="text-slate">
            {prescribed.kg}×{prescribed.reps}
          </span>
        ) : prev ? (
          <span title={`Prev: ${prev.weight_kg} kg × ${prev.reps}`}>
            {prev.weight_kg}×{prev.reps}
          </span>
        ) : (
          <span className="text-line">—</span>
        )}
      </div>
      <input
        type="number"
        inputMode="decimal"
        step={0.5}
        min={0}
        max={500}
        placeholder={
          prescribed?.kg != null
            ? String(prescribed.kg)
            : prev?.weight_kg != null
              ? String(prev.weight_kg)
              : "kg"
        }
        aria-label={`Set ${index + 1} weight`}
        value={set.weight_kg ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          const v = raw === "" ? null : clamp(Number(raw), 0, 500);
          onChange({ weight_kg: v });
        }}
        className="w-full font-mono text-sm px-2 py-2 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze placeholder:text-line"
      />
      <input
        type="number"
        inputMode="numeric"
        step={1}
        min={0}
        max={50}
        placeholder={
          prescribed?.reps != null
            ? String(prescribed.reps).replace(/\D+$/, "") || "reps"
            : prev?.reps != null
              ? String(prev.reps)
              : "reps"
        }
        aria-label={`Set ${index + 1} reps`}
        value={set.reps ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          const v = raw === "" ? null : clampInt(Number(raw), 0, 50);
          onChange({ reps: v });
        }}
        className="w-full font-mono text-sm px-2 py-2 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze placeholder:text-line"
      />
      <input
        type="number"
        inputMode="decimal"
        step={0.5}
        min={0}
        max={10}
        placeholder="RPE"
        aria-label={`Set ${index + 1} RPE`}
        value={set.rpe ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          const v = raw === "" ? null : clamp(Number(raw), 0, 10);
          onChange({ rpe: v });
        }}
        className="w-full font-mono text-sm px-2 py-2 min-h-[44px] border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze"
      />
      <button
        type="button"
        aria-label={hasNote ? `Edit note on set ${index + 1}` : `Add note to set ${index + 1}`}
        aria-expanded={notesOpen}
        onClick={() => setNotesOpen((v) => !v)}
        className={cn(
          "w-11 h-11 -my-2 rounded flex items-center justify-center relative",
          hasNote ? "text-bronze" : "text-muted hover:text-ink hover:bg-line-soft",
        )}
      >
        <MessageSquare size={15} />
        {hasNote ? (
          <span aria-hidden className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-bronze" />
        ) : null}
      </button>
      <button
        type="button"
        aria-label={`Remove set ${index + 1}`}
        onClick={onRemove}
        disabled={!onRemove}
        className={cn(
          "w-11 h-11 -my-2 rounded flex items-center justify-center text-muted",
          onRemove ? "hover:text-red hover:bg-line-soft" : "opacity-30 cursor-not-allowed",
        )}
      >
        <Trash2 size={16} />
      </button>
      {isPR ? (
        <output
          aria-label={`Personal record: ${set.weight_kg} kilograms for ${set.reps} reps`}
          className="col-span-7 flex items-center justify-end gap-1 mt-1 mono-caps text-green motion-safe:animate-[tag-in_260ms_cubic-bezier(0.16,1,0.3,1)]"
        >
          <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-green" />
          <span aria-hidden>PR · {set.weight_kg} × {set.reps}</span>
        </output>
      ) : filled ? (
        <span aria-hidden className="col-span-7 h-0.5 bg-green/40 rounded-full mt-1" />
      ) : null}
      {notesOpen ? (
        <div className="col-span-7 mt-1 min-w-0">
          <label className="mono-caps block mb-1" htmlFor={`set-note-${index}`}>Set {index + 1} note</label>
          <textarea
            id={`set-note-${index}`}
            rows={2}
            placeholder="anything specific to this set — click, side asymmetry, form cue…"
            value={set.notes ?? ""}
            onChange={(e) => onChange({ notes: e.target.value })}
            className="block w-full max-w-full text-[13px] px-2 py-1.5 border border-line rounded bg-surface focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze resize-y min-h-[44px] break-words [overflow-wrap:anywhere] whitespace-pre-wrap"
          />
        </div>
      ) : null}
    </div>
  );
}

function clamp(n: number, min: number, max: number): number | null {
  if (!isFinite(n) || n < 0) return null;
  return Math.min(Math.max(n, min), max);
}
function clampInt(n: number, min: number, max: number): number | null {
  const v = clamp(n, min, max);
  return v == null ? null : Math.round(v);
}
