import { ARCHETYPES, type ArchetypeId } from "./archetype";

/**
 * COVERAGE RULE — every shipped catalog program MUST have a persona here.
 *
 * When you add a program, graduate one from PROVISIONAL, or restructure
 * an existing program's tiers/phases, update this file in the same
 * commit. A shipped program without a persona bundle means no audit can
 * catch its regressions.
 *
 * Minimum coverage per program:
 *   1× consistent-average persona at the program's lowest tier + arc
 *     length in `days`
 *   1× archetype variant (overperformer or erratic) for the fast/slow
 *     path — only required once the program leaves PROVISIONAL
 *
 * Assertive check: at simulator load, `runSimulationV2` throws if a
 * persona references a slug not in `manifest.programs[]`. Keeps the two
 * lists honest.
 *
 * See also: reference_app-audit-system.md + feedback_harness-persona-
 * coverage.md in the founder's auto-memory.
 */

export type Persona = {
  id: string;
  displayName: string;
  archetypeId: ArchetypeId;
  programSlug: string;
  /**
   * 2026-08-18 (#concurrent-tracks-audit) — a persona can now declare
   * additional program slugs to activate concurrently. The primary
   * `programSlug` remains for backwards compatibility (persona-recover,
   * persona-strength, persona-erratic all keep single-program flows).
   * When set, the simulator activates these alongside the primary via
   * `addSecondaryProgram`, and the Today view is expected to render
   * both programs' blocks on days where both schedule work.
   */
  additionalProgramSlugs?: string[];
  /**
   * Tier id written to `program_states[slug].tier` so tier-aware phase
   * selection (schedule.ts activePhaseFor) works. Defaults to the first
   * tier of the target program when unset. Comprehensive audit
   * 2026-08-18 P0-M: adaptation verification broke without this.
   */
  tier?: string;
  days: number;
  email: string;
  password: string;
  focus: string;
};

const DEFAULT_PASSWORD = "TestPassword123!";

export const PERSONAS: Persona[] = [
  {
    id: "persona-recover",
    displayName: "Recovering rehab user",
    archetypeId: "injured-recovery",
    programSlug: "anterior-hip-rebuild",
    days: 30,
    email: "e2e-persona-recover@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Rehab pathway with gated progression, symptom-driven red/amber banner, physio-first messaging",
  },
  {
    // Persona-strength must run on a program with a strength-progression
    // surface — the overperformer TM-bump rule (adapt.ts:evaluateOverperformer)
    // gates on `training_maxes.starting_values_kg`. Engine-builder is aerobic
    // and has no TMs, so the previous wiring silently zeroed out this
    // persona's overperformer coverage. Concurrent Strength Maintenance
    // declares TMs and is the correct target. Fixed 2026-08-18.
    id: "persona-strength",
    displayName: "Strength overperformer",
    archetypeId: "overperformer",
    programSlug: "concurrent-strength-maintenance",
    days: 30,
    email: "e2e-persona-strength@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Adaptive load progression, engine proposing increases, high accept rate on ProposalStack",
  },
  {
    id: "persona-erratic",
    displayName: "Erratic concurrent user",
    archetypeId: "erratic",
    programSlug: "concurrent-strength-maintenance",
    days: 45,
    email: "e2e-persona-erratic@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Skipped sessions, dismissed proposals, re-plan behavior across two goals",
  },
  {
    // 2026-08-18 · added to satisfy dev/active/concurrent-tracks-audit/plan.md.
    // Two active programs: hip-rebuild (rehab, daily) + engine-builder
    // (aerobic, 3-5×/week). Covers the interference warning + the
    // density case where both schedule sessions on the same day. Life-load
    // elevated on ~30% of days so day_adjustment_soften proposals appear.
    id: "persona-concurrent",
    displayName: "Concurrent-tracks user",
    archetypeId: "consistent-average",
    programSlug: "anterior-hip-rebuild",
    additionalProgramSlugs: ["engine-builder"],
    days: 30,
    email: "e2e-persona-concurrent@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Two active programs concurrently. Audit target: Today view density when both schedule sessions on the same day; program-identity signal strength at row level; interference-advisory copy clarity.",
  },
  // 2026-08-18 — per-program comprehensive-audit personas. Each covers ONE
  // shipped catalog program from cold intake through days of adaptive
  // logs. Auditors read the persona's tour artifacts to assess intake UX,
  // program-picker UX, per-tab visual + copy, and whether the engine
  // actually adapts across the arc's length.
  {
    id: "persona-engine",
    displayName: "Engine-builder solo",
    archetypeId: "consistent-average",
    programSlug: "engine-builder",
    tier: "foundation",
    days: 60,
    email: "e2e-persona-engine@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Aerobic Zone-2 arc. 60 days spans multiple phase transitions and the 4-week retest window. Audit target: HR-drift retest UX, phase-progression transparency, run/rest cadence readability on Week + Today.",
  },
  {
    id: "persona-handstand",
    displayName: "Handstand walk beginner",
    archetypeId: "consistent-average",
    programSlug: "handstand-walk",
    tier: "tier_a_foundation",
    days: 45,
    email: "e2e-persona-handstand@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Skill arc, multi-tier. Persona picks Tier A wall-hold entry. 45 days covers phase_0 bail-out prep + first tier-gate + wall-to-free transition window. Audit target: does the tier selection surface tell the user why? Do wall-hold retests fire? Bail-out prep gating.",
  },
  {
    // Promotion coverage for first-strict-pullup (2026-09-01). Mirrors
    // persona-handstand: same multi_dimensional generator, same tier-gated
    // shape, so the audit surface is comparable across the two skill arcs.
    // Tier A is the true floor here — the user cannot yet hold a dead hang,
    // so phase_1_hang_and_row_base is all grip + scap work with no bar reps.
    id: "persona-pullup",
    displayName: "First strict pull-up beginner",
    archetypeId: "consistent-average",
    programSlug: "first-strict-pullup",
    tier: "tier_a_hang",
    days: 45,
    email: "e2e-persona-pullup@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Skill arc, 4-tier. Persona enters at Tier A (no dead hang yet). 45 days covers the 8-week manifest arc plus the weekly hang-time retest and the 4-week full assessment. Audit target: does a user with zero pull-ups understand why they are doing scap pulls and ring rows? Does the hang-time retest read as progress when the headline metric (strict reps) is still zero?",
  },
  {
    id: "persona-mobility",
    displayName: "Overhead mobility user",
    archetypeId: "consistent-average",
    programSlug: "overhead-mobility",
    tier: "foundation",
    days: 45,
    email: "e2e-persona-mobility@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Sequential-phase mobility arc, three tiers. 45 days spans phase 1→2 transition (+ mid-block retest). Audit target: retest card UX for TGU hold + OHS depth; does the tier readout tell the user their gate progress? Non-strength log affordance.",
  },
  {
    id: "persona-rowing",
    displayName: "Rowing 2K race prep",
    archetypeId: "consistent-average",
    programSlug: "rowing-2k-test-prep",
    tier: "foundation",
    days: 45,
    email: "e2e-persona-rowing@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Race-anchored arc, taper-terminated. 45 days lands the user mid-block through the taper week. Audit target: taper-week block replacements (block_race_pace_row → block_easy_recovery), 2K retest UX, mid-block threshold pace retest, run/erg log affordance.",
  },
  // 2026-08-19 · archetype-variant personas for a full-arc audit sweep.
  // Each pairs a program with an off-baseline archetype so adaptation
  // paths (bump / hold / drop / advance) can be validated end-to-end.
  {
    id: "persona-engine-fast",
    displayName: "Engine-builder overperformer",
    archetypeId: "overperformer",
    programSlug: "engine-builder",
    tier: "progression",
    days: 60,
    email: "e2e-persona-engine-fast@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Aerobic overperformer. Every logged Z2 session at RPE 5-6, HR runs low, 'felt strong' notes. Does the engine propose faster progression? Does the Progression → Push tier promotion fire from mid-block retest?",
  },
  {
    id: "persona-strength-slow",
    displayName: "CSM underperformer",
    archetypeId: "underperformer",
    programSlug: "concurrent-strength-maintenance",
    tier: "foundation",
    days: 60,
    email: "e2e-persona-strength-slow@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "CSM underperformer. RPE creeps high, symptoms elevated. Does the engine hold TM instead of bumping? Does the amber-week drop-4×4 hook fire (P1-11 from tonight's audit — currently unimplemented, this persona will surface whether the copy shows up but no engine action)?",
  },
  {
    // Cut C code sprint (2026-08-21) — a 400-day tenure persona to
    // verify the Record surface at scale. Exercises the
    // ActivityHeatmap year-column mode (auto-switches ≥120 days),
    // the full RetestTimeline with ~14 events, and the rolling-
    // avg curve's 12-week baseline math at 1y/All zoom. Same
    // archetype as persona-strength (overperformer) but with a
    // year+ of history simulated so the tenure story reads
    // honest.
    id: "persona-strength-long",
    displayName: "Strength · 400-day tenure",
    archetypeId: "overperformer",
    programSlug: "concurrent-strength-maintenance",
    days: 400,
    email: "e2e-persona-strength-long@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Long-tenure Cut C validation. Verify Record's year-column ActivityHeatmap, 14+ retest events on the timeline, since-baseline line on LatestRetestTile (+X kg since Q1'24 pattern), and the rolling-avg curve at 1y/All zoom without a mode-switch.",
  },
  {
    id: "persona-handstand-fast",
    displayName: "Handstand overperformer",
    archetypeId: "overperformer",
    programSlug: "handstand-walk",
    tier: "tier_a_foundation",
    days: 60,
    email: "e2e-persona-handstand-fast@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Skill overperformer. Long wall holds early, freestand attempts push past drilled instructions. Does a tier-advance proposal (Tier A → Tier B) fire from retest readings? Does the multi-dim generator start blending Tier B blocks?",
  },
  {
    // Second half of the first-strict-pullup coverage rule: one archetype
    // variant, required once the program leaves DRAFT. Overperformer chosen
    // over erratic because the interesting failure here is tier progression,
    // not adherence — this program's whole thesis is that it re-tiers you as
    // sub-capabilities improve at different rates.
    id: "persona-pullup-fast",
    displayName: "Pull-up overperformer",
    archetypeId: "overperformer",
    programSlug: "first-strict-pullup",
    tier: "tier_a_hang",
    days: 60,
    email: "e2e-persona-pullup-fast@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Skill overperformer. Grip outpaces pulling strength — hang times jump early while strict reps stay at zero. Does the multi-dim generator re-target the weakest sub-capability (row/negative) rather than just advancing the tier? Does a Tier A → Tier B advance fire off hang-time retests alone, and should it?",
  },
  {
    // muscle-up promotion coverage (2026-09-01). Tier A is the floor: no
    // false-grip hang yet, so the arc is grip + ring-dip + transition mechanics
    // before any muscle-up attempt exists. 10-week manifest arc; 60 days lands
    // past the first tier gate.
    id: "persona-muscleup",
    displayName: "Ring muscle-up beginner",
    archetypeId: "consistent-average",
    programSlug: "muscle-up",
    tier: "tier_a_prep",
    days: 60,
    email: "e2e-persona-muscleup@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Skill arc, 3-tier, gymnastics. Enters at Tier A with no false-grip hang. Audit target: does the composer actually rotate sub-capabilities (false grip / ring dip / transition) now that the capability_slot names resolve? Four of five were dead until 2026-09-01 and the fallback was silent, so this persona is the regression guard for that specific failure.",
  },
  {
    // engine-builder-block-2 promotion coverage (2026-09-01). Block 2 assumes
    // Block 1 is complete OR an equivalent aerobic base declared at intake —
    // the interesting case is a user arriving mid-arc rather than at zero.
    id: "persona-engine-block2",
    displayName: "Engine Builder Block 2",
    archetypeId: "consistent-average",
    programSlug: "engine-builder-block-2",
    tier: "foundation",
    days: 60,
    email: "e2e-persona-engine-block2@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Threshold-dominant middle block of the 3-block Engine arc. 60 days over a 10-week template crosses several phase transitions. Audit target: does the hand-off read correctly for someone who did NOT come from Block 1, and does the volume-expansion phase language stay honest when the retest metrics move slowly?",
  },
  {
    id: "persona-rowing-erratic",
    displayName: "Rowing erratic through taper",
    archetypeId: "erratic",
    programSlug: "rowing-2k-test-prep",
    tier: "foundation",
    days: 45,
    email: "e2e-persona-rowing-erratic@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Race-anchored user with 40% skip rate. Does the taper still fire when session compliance is under 60%? Does the 2K retest render honestly with sparse baseline runs? Does the classifier flag 'under-dosing' vs 'true non-response'?",
  },
  // 2026-08-19 · founder request — improve harness with multi-track + graduation
  // coverage. Multi-track uses super-admin's "Add alongside" affordance to
  // stack programs; graduation runs a program past its last phase.ends to
  // hit isPastProgramEnd + GraduationCard + verify what happens next.
  {
    id: "persona-multitrack",
    displayName: "Multi-track super-admin",
    archetypeId: "consistent-average",
    programSlug: "engine-builder",
    additionalProgramSlugs: [
      "concurrent-strength-maintenance",
      "overhead-mobility",
    ],
    tier: "foundation",
    days: 45,
    email: "e2e-persona-multitrack@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Three concurrent programs. Audit target: how does Today render when multiple programs schedule blocks on the same day? Do interference banners fire? Does Programs list show all three with 'primary'/'today's' badges correctly? Are per-track adherence rows all populated? Super-admin badge visible on Profile.",
  },
  {
    id: "persona-graduate",
    displayName: "Post-graduation user",
    archetypeId: "consistent-average",
    programSlug: "engine-builder",
    tier: "foundation",
    days: 64,
    email: "e2e-persona-graduate@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "8-week arc + 8 days past graduation. Audit target: does GraduationCard fire? Does it suggest a follow-on (Block 2 engine-builder, Progression/Push tier, another program)? Retest card populates real deltas? Report renders a shareable summary of the arc? What SHOULD happen after finishing but currently doesn't?",
  },
  {
    // 2026-08-25 — positioned to sit INSIDE a retest window. engine-builder
    // declares a mid-block retest for `submax_hr_pace5_bpm` at week 4, and
    // `selectRetestDue` opens the proposal from that week's start through
    // the end of the following one. 25 days lands in week 4; the
    // simulator's own readings fire on day 14, comfortably outside the
    // 7-day freshness window that would suppress the proposal.
    //
    // Exists because RetestLoggingSheet was the last interactive surface
    // no persona could reach — it needs real state, not a better selector.
    id: "persona-retest",
    displayName: "Retest-window user",
    archetypeId: "consistent-average",
    programSlug: "engine-builder",
    days: 25,
    email: "e2e-persona-retest@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Sits inside engine-builder's week-4 mid-block retest window. Audit target: does the retest proposal explain what to log and why, and does the logging sheet make the reading easy to enter mid-session?",
  },
  {
    // 2026-08-25 — the existing rowing personas run 45 days, which ends AT
    // the 2K test date, so they are past the program end with no session
    // within +/-7 days: seven of ten flows correctly skip and the rowing
    // UI never gets exercised interactively. This one stops mid-arc so it
    // actually has sessions to walk.
    id: "persona-rowing-mid",
    displayName: "Rowing user mid-arc",
    archetypeId: "consistent-average",
    programSlug: "rowing-2k-test-prep",
    days: 21,
    email: "e2e-persona-rowing-mid@example.test",
    password: DEFAULT_PASSWORD,
    focus:
      "Rowing block partway through, before the test date. Audit target: mid-arc session flow for a row-modality program, where the prescribed session IS the logged activity.",
  },
];

export function personaArchetype(persona: Persona) {
  return ARCHETYPES[persona.archetypeId];
}
