import { ARCHETYPES, type ArchetypeId } from "./archetype";

export type Persona = {
  id: string;
  displayName: string;
  archetypeId: ArchetypeId;
  programSlug: string;
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
    id: "persona-strength",
    displayName: "Strength overperformer",
    archetypeId: "overperformer",
    programSlug: "engine-builder",
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
];

export function personaArchetype(persona: Persona) {
  return ARCHETYPES[persona.archetypeId];
}
