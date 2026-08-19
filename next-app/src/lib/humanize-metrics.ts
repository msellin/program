/**
 * P1-40 (Batch 17) + A10 (Batch 26) — humanize metric identifiers +
 * verdict enums that come out of engine payloads. Two callers so far:
 * ProposalCard non-responder per-metric list, HeritageClusterChip
 * expanded sheet. Extracted here so a third caller doesn't tempt
 * anyone to redefine the DISPLAY_NAMES map.
 *
 * When a program authors a fully unreadable metric_id, add it to
 * DISPLAY_NAMES here rather than baking the pretty name into the
 * JSON (which would drift from the engine-side identifier).
 */

const DISPLAY_NAMES: Record<string, string> = {
  submax_hr_bpm: "sub-max HR",
  resting_hr_bpm: "resting HR",
  hrv_rmssd_ms: "HRV (RMSSD)",
};

export function humanizeMetricId(id: string): string {
  return DISPLAY_NAMES[id] ?? id.replace(/_/g, " ");
}

export function humanizeVerdict(v: string): string {
  switch (v) {
    case "true_non_response":
      return "not responding";
    case "under_dosing":
      return "room to push";
    case "responding":
      return "responding";
    case "insufficient_data":
      return "not enough data yet";
    default:
      return v.replace(/_/g, " ");
  }
}
