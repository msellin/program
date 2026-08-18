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
];

export function personaArchetype(persona: Persona) {
  return ARCHETYPES[persona.archetypeId];
}
