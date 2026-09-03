/**
 * The symptom region library.
 *
 * Before this existed, the morning check rendered four hardcoded fields —
 * `groin_left`, `low_back`, `buttock_left`, `shoulder_right` — and derived
 * green/amber/red from their peak. That is `anterior-hip-rebuild`'s clinical
 * map: the one program in the manifest marked `personal: true`. Every other
 * program got asked about someone else's hip.
 *
 * The cost was not cosmetic. `first-strict-pullup` authors
 * `elbow_symptom_score`, because medial epicondylitis is the classic pull-up
 * injury; there was no elbow field, so a user at 7/10 had nowhere to report it
 * and the engine saw green. `muscle-up` authors `wrist_symptom_score` — false
 * grip is notorious for wrist strain — with no wrist field. And only
 * `shoulder_right` existed, so a left shoulder had nowhere to go at all.
 *
 * Regions are a shared library and programs select from it, exactly as they do
 * with `exercises.json`. Two consequences worth stating:
 *
 *   - **Storage stays flat and unmigrated.** Region ids are the same top-level
 *     keys `symptoms` always used, so multi-year history recorded under
 *     `groin_left` keeps validating and keeps rendering. Nothing is orphaned.
 *   - **Ids are curated, not free-form.** A program cannot invent a region;
 *     `data-integrity.test.ts` fails if it names one that isn't here. That is
 *     what stops this becoming another authored-JSON key nothing reads.
 *
 * Programs declare their set in `symptom_regions[]`. Thresholds are NOT
 * program-authored: a program says what feeds the safety gate, never how
 * lenient the gate is. See `deriveState`.
 */

export type SymptomRegion = {
  id: string;
  /** Full label, used in the check form. */
  label: string;
  /** Compact label for dense surfaces — log lists, chart legends. */
  short: string;
};

export const SYMPTOM_REGIONS: SymptomRegion[] = [
  // Hip / trunk — the original four. Ids unchanged so history survives.
  { id: "groin_left", label: "Left groin", short: "Groin L" },
  { id: "groin_right", label: "Right groin", short: "Groin R" },
  { id: "low_back", label: "Low back", short: "Low back" },
  { id: "buttock_left", label: "Left buttock", short: "Buttock L" },
  { id: "buttock_right", label: "Right buttock", short: "Buttock R" },
  // Unsided variants. The hip program needs laterality because its record is
  // explicitly left-vs-right; a pull-up user reporting elbow pain does not, and
  // a six-row sided form answered every morning is friction that trains people
  // to tap through without reading. Programs pick whichever fits.
  { id: "shoulder", label: "Shoulder", short: "Shoulder" },
  { id: "elbow", label: "Elbow", short: "Elbow" },
  { id: "wrist", label: "Wrist", short: "Wrist" },
  { id: "knee", label: "Knee", short: "Knee" },
  { id: "achilles", label: "Achilles", short: "Achilles" },
  // Upper body — sided.
  { id: "shoulder_left", label: "Left shoulder", short: "Shoulder L" },
  { id: "shoulder_right", label: "Right shoulder", short: "Shoulder R" },
  { id: "elbow_left", label: "Left elbow", short: "Elbow L" },
  { id: "elbow_right", label: "Right elbow", short: "Elbow R" },
  { id: "wrist_left", label: "Left wrist", short: "Wrist L" },
  { id: "wrist_right", label: "Right wrist", short: "Wrist R" },
  { id: "neck", label: "Neck", short: "Neck" },
  // Lower body — endurance and concurrent programs.
  { id: "knee_left", label: "Left knee", short: "Knee L" },
  { id: "knee_right", label: "Right knee", short: "Knee R" },
  { id: "hamstring_left", label: "Left hamstring", short: "Ham L" },
  { id: "hamstring_right", label: "Right hamstring", short: "Ham R" },
  { id: "achilles_left", label: "Left Achilles", short: "Achilles L" },
  { id: "achilles_right", label: "Right Achilles", short: "Achilles R" },
  { id: "shin", label: "Shins", short: "Shin" },
];

export const REGION_BY_ID: Record<string, SymptomRegion> = Object.fromEntries(
  SYMPTOM_REGIONS.map((r) => [r.id, r]),
);

/**
 * What the check asked before programs could declare anything. Used when a
 * program declares no `symptom_regions[]`, so an un-migrated program keeps
 * exactly its previous behaviour rather than silently asking nothing.
 */
export const LEGACY_REGIONS = [
  "groin_left",
  "low_back",
  "buttock_left",
  "shoulder_right",
] as const;

/** Region ids a program asks about, falling back to the historical four. */
export function regionsForProgram(
  program?: { symptom_regions?: string[] } | null,
): SymptomRegion[] {
  const ids = program?.symptom_regions?.length
    ? program.symptom_regions
    : [...LEGACY_REGIONS];
  return ids.map((id) => REGION_BY_ID[id]).filter((r): r is SymptomRegion => !!r);
}

/** Every region id that carries a score on this day's check. */
export function scoredRegionIds(symptoms: Record<string, unknown>): string[] {
  return SYMPTOM_REGIONS.map((r) => r.id).filter(
    (id) => typeof symptoms[id] === "number",
  );
}

/**
 * Red-flag chips.
 *
 * Same story as the regions, one layer along. `gait_change` (shortened stride)
 * and a painful hip click are labral red flags — they came from
 * `anterior-hip-rebuild`'s clinical record and were shown to that program only,
 * via a hardcoded `isHip` check in the check page. Correct in effect, wrong in
 * mechanism: the next program needing a flag of its own would have had to add a
 * second slug comparison, which is exactly how `SKILL_PROGRAMS` ended up
 * holding a slug that did not exist.
 *
 * `night_pain` stays the default for every program. Pain that wakes you is a
 * red flag whatever you are training for, and it is the one flag a program
 * should not be able to opt out of by omission.
 */
export type SymptomFlag = {
  id: string;
  label: string;
  /**
   * Store keys the chip writes. `painful_click` sets two — the record
   * distinguishes a click that hurts from one that does not, and only the
   * painful kind is a flag.
   */
  keys: string[];
};

export const SYMPTOM_FLAGS: SymptomFlag[] = [
  { id: "night_pain", label: "Woke me at night", keys: ["night_pain"] },
  { id: "gait_change", label: "Shortened stride", keys: ["gait_change"] },
  { id: "painful_click", label: "Painful click", keys: ["click_present", "click_painful"] },
];

export const FLAG_BY_ID: Record<string, SymptomFlag> = Object.fromEntries(
  SYMPTOM_FLAGS.map((f) => [f.id, f]),
);

/** Flags a program asks about. Undeclared → night pain only, as before. */
export function flagsForProgram(
  program?: { symptom_flags?: string[] } | null,
): SymptomFlag[] {
  const ids = program?.symptom_flags?.length ? program.symptom_flags : ["night_pain"];
  return ids.map((id) => FLAG_BY_ID[id]).filter((f): f is SymptomFlag => !!f);
}

/**
 * Identifies the instrument that produced a stored symptom row, stamped onto
 * `symptoms.scale_version` on every write.
 *
 * The stored fields are all `z.number()` on a 0-10 range, but the UI filling
 * them changed shape: until 2026-08-21 the check used continuous sliders and
 * any value could appear; Cut D replaced them with a four-option tap scale
 * writing exactly {0, 2, 5, 8}, three-option life load and four-option
 * stiffness. Nothing recorded which instrument produced a given row, so a
 * multi-year chart shows a step at that date belonging to the FORM rather
 * than to the person, and no consumer could tell the two apart.
 *
 * Bump this whenever the values the check can WRITE change — a new bucket, a
 * different numeric mapping, a return to a continuous scale. Do NOT bump it
 * for wording, layout or colour: it identifies the measurement, not the
 * design. Absent means a pre-Cut-D slider entry, which is the honest reading
 * of the history that already exists and cannot be repaired.
 */
export const SYMPTOM_SCALE_VERSION = "bucket4.2026-08-21";
