import type { Suggestion } from "@/lib/engine/suggest";
import { platesLabel } from "@/lib/plates";
import { BarVisualizer } from "./BarVisualizer";
import { cn } from "@/lib/utils";

export function SuggestionBox({ suggestion }: { suggestion: Suggestion }) {
  const stateClass =
    suggestion.state === "red"
      ? "bg-red/10 border-l-red text-ink"
      : suggestion.state === "amber"
        ? "bg-amber/10 border-l-amber text-ink"
        : "bg-green/10 border-l-green text-ink";

  const label =
    suggestion.state === "red"
      ? "Suggested — reduced (red day)"
      : suggestion.state === "amber"
        ? "Suggested — hold (amber day)"
        : "Suggested today";

  return (
    <div className={cn("border-l-4 px-3 py-2.5 rounded-r", stateClass)}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
        {label}
      </p>
      <p className="text-lg font-semibold text-slate leading-tight">
        {suggestion.top_set.kg} kg × {suggestion.top_set.reps}
      </p>
      <p className="text-[11px] font-mono text-muted mt-0.5">
        {platesLabel(suggestion.top_set.kg)}
      </p>
      <div className="mt-1.5">
        <BarVisualizer targetKg={suggestion.top_set.kg} />
      </div>
      {suggestion.fsl ? (
        <p className="text-xs font-mono text-muted mt-2">
          FSL {suggestion.fsl.sets}×{suggestion.fsl.reps} @ {suggestion.fsl.kg} kg
          <span className="text-[10px] ml-1 text-muted/70">
            ({platesLabel(suggestion.fsl.kg)})
          </span>
        </p>
      ) : null}
      {suggestion.warmups && suggestion.warmups.length ? (
        <p className="text-[11px] font-mono text-muted mt-0.5">
          Warm-up: {suggestion.warmups.map((w) => `${w.kg}×${w.reps}`).join(" → ")}
        </p>
      ) : null}
      <p className="text-[11px] italic text-muted mt-1.5">{suggestion.reasoning}</p>
    </div>
  );
}
