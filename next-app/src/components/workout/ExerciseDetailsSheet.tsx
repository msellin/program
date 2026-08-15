"use client";

import { useRef } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { cn } from "@/lib/utils";
import type { Exercise, Block } from "@/lib/schemas";

type Item = NonNullable<Block["items"]>[number];

/**
 * Bottom sheet that holds everything about an exercise that isn't the set grid.
 *
 * Was scattered across the expanded ExerciseCard: dose line, scheme line, TM
 * line, warning box, cues chevron, flags chip row. That reads as noise once the
 * user knows the exercise. Consolidating behind a single tap keeps the info a
 * short reach away without spending vertical rhythm on every session.
 *
 * Safety-critical warnings ALSO surface as a small ⚠ icon on the card face —
 * the sheet is the "read all about it" panel, not the only entrypoint.
 */
export function ExerciseDetailsSheet({
  exercise,
  item,
  tm,
  onClose,
}: {
  exercise: Exercise;
  item: Item;
  tm: number | undefined;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `ex-details-${exercise.id}`;
  useFocusTrap(panelRef, onClose);

  const dose = buildDoseLine(exercise, item);
  const scheme = item.scheme;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-ground/85 flex items-end sm:items-center justify-center p-2 sm:p-4"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "bg-surface border border-line rounded-t-lg sm:rounded-lg w-full max-w-xl max-h-[85vh] overflow-auto",
        )}
      >
        <header className="sticky top-0 flex items-start justify-between gap-3 px-4 py-3 border-b border-line bg-surface">
          <div className="min-w-0">
            <h3 id={titleId} className="text-[15px] font-semibold text-strong truncate">
              {exercise.name}
            </h3>
            {(dose || scheme) ? (
              <p className="text-[12.5px] text-muted mt-0.5 truncate">
                {[dose, scheme].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-ink w-11 h-11 -my-2 flex items-center justify-center text-xl leading-none rounded flex-shrink-0"
          >
            ×
          </button>
        </header>

        <div className="p-4 space-y-4 text-[13.5px]">
          {(exercise.warning || exercise.avoid) ? (
            <section>
              <p className="text-[12px] text-red mb-1">Warning</p>
              <div className="border-l-4 border-red bg-red/10 rounded-r px-3 py-2">
                {exercise.warning ?? exercise.avoid}
              </div>
            </section>
          ) : null}

          {tm != null ? (
            <section>
              <p className="text-[12px] text-muted mb-0.5">Training max</p>
              <p className="font-mono">{tm} kg</p>
            </section>
          ) : null}

          {exercise.setup ? (
            <section>
              <p className="text-[12px] text-muted mb-0.5">Setup</p>
              <p>{exercise.setup}</p>
            </section>
          ) : null}

          {exercise.cues?.length ? (
            <section>
              <p className="text-[12px] text-muted mb-1">Cues</p>
              <ul className="list-disc pl-5 space-y-1">
                {exercise.cues.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {exercise.rationale ? (
            <section>
              <p className="text-[12px] text-muted mb-0.5">Why this exercise</p>
              <p className="text-muted">{exercise.rationale}</p>
            </section>
          ) : null}

          {exercise.flags?.length ? (
            <section>
              <p className="text-[12px] text-muted mb-1">Flags</p>
              <div className="flex flex-wrap gap-1.5">
                {exercise.flags.map((f) => (
                  <span
                    key={f}
                    className={cn(
                      "font-mono text-[10.5px] uppercase tracking-wider px-1.5 py-0.5 rounded",
                      f.startsWith("monitor") || f.startsWith("historical_provocateur")
                        ? "bg-amber/20 text-amber"
                        : "bg-line-soft text-muted",
                    )}
                  >
                    {humanizeFlag(f)}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function humanizeFlag(f: string): string {
  const map: Record<string, string> = {
    "historical_provocateur": "Provocateur",
    "monitor:click": "Watch clicking",
    "monitor:knee_valgus": "Watch knee cave",
    "reintroduction_step": "Reintro step",
    "shoulder_load:front_rack": "Shoulder load",
    "shoulder_load:grip": "Shoulder grip",
    "loads_adduction": "Adductor load",
    "approaches_provocative:resisted_slr": "Near-provocative",
  };
  const [base, detail] = f.split(":");
  const key = detail ? `${base}:${detail}` : base;
  if (map[key]) return map[key];
  if (map[base]) return detail ? `${map[base]} · ${detail}` : map[base];
  return f.replace(/_/g, " ").replace(/:/g, " · ");
}

function buildDoseLine(ex: Exercise, item: Item): string {
  const d = { ...(ex.default ?? {}), ...(item as Record<string, unknown>) };
  const parts: string[] = [];
  if (d.sets) parts.push(`${d.sets} sets`);
  if (d.reps) parts.push(`${d.reps} reps`);
  if (d.hold_seconds) parts.push(`${d.hold_seconds}s hold`);
  if (d.distance_m) parts.push(`${d.distance_m} m`);
  if (d.intensity_pct) parts.push(`@ ${d.intensity_pct}%`);
  if (d.tempo) parts.push(String(d.tempo));
  if (d.per_side) parts.push("each side");
  return parts.join(" · ");
}
