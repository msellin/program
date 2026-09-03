"use client";

import { useState } from "react";
import { classify } from "@/lib/engine/non-responder-classifier";
import { InfoSheet } from "@/components/InfoSheet";
import { humanizeMetricId, humanizeVerdict } from "@/lib/humanize-metrics";
import type { Program, Store } from "@/lib/schemas";
import type { ClassificationVerdict } from "@/lib/engine/non-responder-classifier";
import { resolveRetestReadings } from "@/lib/engine/retest-readings";

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
 * Baseline collection: `resolveRetestReadings` — readings the user logged
 * explicitly, merged with readings derived from the run log via each
 * metric's declared `source_ref`. This component used to own that
 * derivation privately, as a fallback that switched off the moment any
 * reading was logged by hand; see `lib/engine/retest-readings.ts`.
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

  const baselines = resolveRetestReadings(store, program);
  // Gate on baselines for the metrics this classifier actually reads. The
  // old count was across every metric in the store, which was survivable
  // while only the primary metric was ever collected — once readings are
  // merged for every declared metric, two unrelated readings would have
  // been enough to show a chip the classifier cannot honestly speak to.
  const classifierMetricIds = new Set(
    [
      classifier.primary_signal_metric_id,
      ...(classifier.secondary_signal_metric_ids ?? []),
    ].filter(Boolean) as string[],
  );
  const relevant = baselines.filter((b) => classifierMetricIds.has(b.metric_id));
  if (relevant.length < classifier.requires_baselines) return null;

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
          {/* A10 (Batch 26) — was rendering a "No explanation available."
              fallback + raw metric_id + (role) parenthetical + underscore
              verdicts. All debug-dump. Now: only render composite_copy if
              present (skip the sheet-body entirely otherwise; the chip
              itself is the label), and humanize per-metric identifiers +
              verdicts the same way ProposalCard does (P1-40). */}
          {result.composite_copy ? <p>{result.composite_copy}</p> : null}
          {result.per_metric.length > 0 ? (
            <ul className="mt-3 space-y-1 font-mono text-[12px]">
              {result.per_metric.map((m) => (
                <li key={m.metric_id}>
                  <span className="text-muted">{humanizeMetricId(m.metric_id)}:</span>{" "}
                  <span className="text-ink">{humanizeVerdict(m.verdict)}</span>
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

