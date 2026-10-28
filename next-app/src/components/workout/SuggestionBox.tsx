import type { Suggestion } from "@/lib/engine/suggest";
import { platesLabel } from "@/lib/plates";
import { BarVisualizer } from "./BarVisualizer";

export function SuggestionBox({ suggestion }: { suggestion: Suggestion }) {
  const label =
    suggestion.state === "red"
      ? "Suggested — reduced (red day)"
      : suggestion.state === "amber"
        ? "Suggested — hold (amber day)"
        : "Suggested today";

  return (
    // Nested inside ExerciseCard, so a panel rather than a second card (D-03);
    // the label names the red/amber state.
    <div className="rounded-lg bg-surface-2 p-3">
      <p className="font-mono text-eyebrow uppercase tracking-widest text-muted mb-1">
        {label}
      </p>
      <p className="text-h3 text-slate leading-tight">
        {suggestion.top_set.kg} kg × {suggestion.top_set.reps}
      </p>
      <p className="text-eyebrow font-mono text-muted mt-0.5">
        {platesLabel(suggestion.top_set.kg)}
      </p>
      <div className="mt-1.5">
        <BarVisualizer targetKg={suggestion.top_set.kg} />
      </div>
      {suggestion.fsl ? (
        <p className="text-caption font-mono text-muted mt-2">
          FSL {suggestion.fsl.sets}×{suggestion.fsl.reps} @ {suggestion.fsl.kg} kg
          <span className="text-eyebrow ml-1 text-muted">
            ({platesLabel(suggestion.fsl.kg)})
          </span>
        </p>
      ) : null}
      {suggestion.working_sets && suggestion.working_sets.length ? (
        /*
         * The ladder, spelled out. These are WORKING sets — on a deload every
         * one of them is the session, and rendering them as "Warm-up: 45×5 →
         * 55×5" told the user two thirds of their squat day was optional.
         */
        <p className="text-caption font-mono text-muted mt-2">
          Sets: {suggestion.working_sets.map((w) => `${w.kg}×${w.reps}`).join(" → ")}
        </p>
      ) : suggestion.ramp_sets && suggestion.ramp_sets.length ? (
        // Working sets before the top set — not a warm-up. See `ramp_sets`.
        <p className="text-eyebrow font-mono text-muted mt-0.5">
          Sets: {[...suggestion.ramp_sets, suggestion.top_set].map((w) => `${w.kg}×${w.reps}`).join(" → ")}
        </p>
      ) : null}
      <p className="text-eyebrow italic text-muted mt-1.5">{suggestion.reasoning}</p>
    </div>
  );
}
