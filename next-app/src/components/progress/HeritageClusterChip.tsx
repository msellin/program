"use client";

import { useState } from "react";
import { classify } from "@/lib/engine/non-responder-classifier";
import { InfoSheet } from "@/components/InfoSheet";
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
  const [open, setOpen] = useState(false);
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

  // Mobile-UX audit 2026-08-18 (P1) — chip was `<span title="…">` so touch
  // users had no way to reveal the composite_copy explanation. Wrap in a
  // real button opening an InfoSheet. The visual size stays tiny (10px
  // pill) but tap target expands invisibly via `p-2 -m-2` inset trick to
  // meet the 44px min without altering the header rhythm.
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${label.text}. Tap to see why.`}
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${label.tone} hover:brightness-110`}
      >
        <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-current" />
        {label.text}
      </button>
      {open ? (
        <InfoSheet title={`${label.text} — engine read`} onClose={() => setOpen(false)}>
          <p>{result.composite_copy || "No explanation available."}</p>
          {result.per_metric.length > 0 ? (
            <ul className="mt-3 space-y-1 font-mono text-[12px]">
              {result.per_metric.map((m) => (
                <li key={m.metric_id}>
                  <span className="text-muted">{m.metric_id} ({m.role}):</span>{" "}
                  <span className="text-ink">{m.verdict.replace(/_/g, " ")}</span>
                  {m.delta_at_mid_block != null ? (
                    <> · Δ {m.delta_at_mid_block.toFixed(2)}</>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </InfoSheet>
      ) : null}
    </>
  );
}

function labelFor(v: ClassificationVerdict): { text: string; tone: string } | null {
  // Copy audit 2026-08-18 — dropped the "Cluster A/B/C" research-protocol
  // vocabulary from the chip; colour + label carry the state. The full
  // Cluster taxonomy stays in `title` (composite_copy).
  // Visual-craft audit 2026-08-18 — Cluster C bumped to /25 alpha so the
  // strongest signal reads as the strongest visual.
  switch (v) {
    case "responding":
      return { text: "Responding", tone: "bg-green/15 text-green" };
    case "under_dosing":
      return { text: "Room to push", tone: "bg-amber/15 text-amber" };
    case "true_non_response":
      return { text: "Not responding", tone: "bg-red/25 text-red" };
    default:
      return null;
  }
}

/**
 * Gather baselines from wherever the store keeps them. Primary source is
 * the `retest_readings` array (Phase 5 scheduler). Fallback: synthesize
 * from `runs[]` — programs like engine-builder + rowing-2k declare a
 * `primary_signal_metric_id` matching a `retest_metrics` entry that
 * queries runs. When retest_readings is empty (persona harness, users
 * pre-Phase-5), read the same runs the retest evaluator reads so the
 * classifier can fire. Delta audit 2026-08-19 P1.
 */
function collectBaselines(store: Store, program: Program): MetricBaseline[] {
  const readings = (store as unknown as { retest_readings?: MetricBaseline[] })
    .retest_readings;
  if (Array.isArray(readings) && readings.length > 0) return readings;

  const classifier = (program as unknown as {
    non_responder_classifier?: { primary_signal_metric_id?: string };
  }).non_responder_classifier;
  if (!classifier?.primary_signal_metric_id) return [];

  const retestMetrics = (program as unknown as {
    retest_metrics?: Array<{ metric_id?: string; source?: string; source_ref?: string }>;
  }).retest_metrics ?? [];
  const primary = retestMetrics.find((m) => m.metric_id === classifier.primary_signal_metric_id);
  if (!primary || primary.source !== "run_field" && primary.source !== "log_field") return [];

  const ref = primary.source_ref ?? "";
  const runFieldMatch = /^runs\[\]\.([a-z0-9_]+)(?:\s+where\s+(.+))?$/i.exec(ref);
  if (!runFieldMatch) return [];
  const field = runFieldMatch[1];
  const filters: Array<{ k: string; v: string }> = [];
  const whereClause = runFieldMatch[2];
  if (whereClause) {
    for (const part of whereClause.split(/\s+and\s+/i)) {
      const eq = /^([a-z0-9_]+)\s*==\s*'([^']*)'$/i.exec(part.trim());
      if (eq) filters.push({ k: eq[1], v: eq[2] });
    }
  }

  const out: MetricBaseline[] = [];
  for (const [date, day] of Object.entries(store.logs ?? {})) {
    for (const run of day.runs ?? []) {
      const runRec = run as unknown as Record<string, unknown>;
      // Field aliasing mirrors retest-evaluator: `modality` == activity_type.
      let matchesAll = true;
      for (const f of filters) {
        const actual = f.k === "modality" ? runRec.activity_type : runRec[f.k];
        if (String(actual ?? "") !== f.v) {
          matchesAll = false;
          break;
        }
      }
      if (!matchesAll) continue;
      const v = runRec[field];
      if (typeof v !== "number" || !Number.isFinite(v)) continue;
      out.push({
        metric_id: classifier.primary_signal_metric_id,
        value: v,
        observed_at: date,
      });
    }
  }
  return out.sort((a, b) => a.observed_at.localeCompare(b.observed_at));
}
