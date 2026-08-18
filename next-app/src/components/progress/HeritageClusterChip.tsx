"use client";

import { classify } from "@/lib/engine/non-responder-classifier";
import type { Program, Store } from "@/lib/schemas";
import type {
  ClassificationVerdict,
  MetricBaseline,
} from "@/lib/engine/non-responder-classifier";

/**
 * HERITAGE Phase 3 (#63) — cluster chip in the Weekly Summary header.
 *
 * Renders one of three states when both baseline requirements are met:
 *   Cluster A · responding        (green)
 *   Cluster B · under-dosing      (amber)
 *   Cluster C · non-responder     (red)
 *
 * Returns null when the program doesn't declare a `non_responder_classifier`,
 * or when there aren't enough baselines (< requires_baselines). No fake
 * confidence — no chip until the classifier can honestly speak.
 *
 * Baseline collection: reads from the store's future `retest_readings`
 * shape (Phase 5 mid-block scheduler will populate this). Until Phase 5
 * lands, most users see no chip. Founder-facing test users can prime the
 * chip by seeding retest_readings directly.
 */
export function HeritageClusterChip({
  program,
  store,
}: {
  program: Program;
  store: Store;
}) {
  const classifier = (
    program as unknown as {
      non_responder_classifier?: Program["non_responder_classifier"];
    }
  ).non_responder_classifier;
  if (!classifier) return null;

  const baselines = collectBaselines(store, program);
  if (baselines.length < classifier.requires_baselines) return null;

  const result = classify(program, store, { baselines });
  const label = labelFor(result.composite_verdict);
  if (!label) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${label.tone}`}
      title={result.composite_copy || undefined}
    >
      <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-current" />
      {label.text}
    </span>
  );
}

function labelFor(v: ClassificationVerdict): { text: string; tone: string } | null {
  switch (v) {
    case "responding":
      return { text: "Cluster A · responding", tone: "bg-green/15 text-green" };
    case "under_dosing":
      return { text: "Cluster B · under-dosing", tone: "bg-amber/15 text-amber" };
    case "true_non_response":
      return { text: "Cluster C · non-responder", tone: "bg-red/15 text-red" };
    default:
      return null;
  }
}

/**
 * Gather baselines from wherever the store keeps them. Today: the future
 * `retest_readings` array (Phase 5 scheduler). Legacy `assessments` packs
 * won't populate this; they're a different flow.
 */
function collectBaselines(store: Store, _program: Program): MetricBaseline[] {
  const readings = (store as unknown as { retest_readings?: MetricBaseline[] })
    .retest_readings;
  if (!Array.isArray(readings)) return [];
  return readings;
}
