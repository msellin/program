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

/**
 * P1-66 (Batch 27) — humanize exercise_id snake_case. The canonical
 * pretty names live in exercises.json, but we don't want to fetch that
 * JSON every render just to display "back_squat_highbar" → "back squat
 * (high bar)". Simple heuristic: underscore→space, and capitalize each
 * word except common prep articles. If a program authors a slug that
 * doesn't parse well, add it to EXERCISE_DISPLAY_NAMES.
 */
const EXERCISE_DISPLAY_NAMES: Record<string, string> = {
  back_squat_highbar: "back squat (high bar)",
  back_squat_ssb: "back squat (SSB)",
  block_pull_midshin: "block pull (midshin)",
  trap_bar_dl_blocks: "trap-bar DL (blocks)",
  trap_bar_dl_floor: "trap-bar DL (floor)",
  deadlift_conventional: "conventional deadlift",
  front_squat: "front squat",
};

export function humanizeExerciseId(id: string): string {
  return EXERCISE_DISPLAY_NAMES[id] ?? id.replace(/_/g, " ");
}
