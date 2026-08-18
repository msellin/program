import { ARCHETYPES, type ArchetypeId } from "./archetype";

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
      "Adaptive load progression, engine proposing increases, high accept rate on Coach page",
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
];

export function personaArchetype(persona: Persona) {
  return ARCHETYPES[persona.archetypeId];
}
