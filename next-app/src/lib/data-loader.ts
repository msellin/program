import {
  programSchema,
  exercisesFileSchema,
  programManifestSchema,
  type Program,
  type Exercise,
  type ProgramManifest,
} from "./schemas";

/** Canonical fallback program — Margus's original. Preserves current single-user behaviour. */
export const DEFAULT_PROGRAM_SLUG = "anterior-hip-rebuild";

export type ClinicalContext = {
  schema_version?: string;
  generated?: string;
  note?: string;
  source_period?: { earliest?: string; latest?: string };
  staleness_warning?: string;
  findings?: Array<{ id: string; region: string; label: string; detail?: string }>;
  provocative_positions?: Array<{ id: string; label: string; reason?: string }>;
  red_flags?: Array<{ id: string; label: string; action?: string }>;
  history?: unknown;
  clinical_exam?: unknown;
};

let cache: {
  programBySlug: Map<string, Program>;
  exercises?: Exercise[];
  exerciseById?: Record<string, Exercise>;
  clinical?: ClinicalContext;
  manifest?: ProgramManifest;
} = { programBySlug: new Map() };

/**
 * Load a program template by slug. Falls back to Margus's canonical program
 * when no slug is provided — preserves single-user behaviour for existing users
 * whose `user_profile.active_program_id` isn't set yet.
 */
export async function loadProgram(slug?: string): Promise<Program> {
  const effectiveSlug = slug ?? DEFAULT_PROGRAM_SLUG;
  const cached = cache.programBySlug.get(effectiveSlug);
  if (cached) return cached;
  const res = await fetch(`/data/programs/${effectiveSlug}.json`);
  if (!res.ok) throw new Error(`programs/${effectiveSlug}.json → HTTP ${res.status}`);
  const data = await res.json();
  const parsed = programSchema.parse(data);
  // Tag with slug so downstream code (schedule.ts, adapt.ts, etc.) can identify
  // the program without a separate arg. Not authored in the JSON.
  parsed.slug = effectiveSlug;
  cache.programBySlug.set(effectiveSlug, parsed);
  return parsed;
}

/** Load the catalog manifest — list of available programs the user can pick from. */
export async function loadProgramManifest(): Promise<ProgramManifest> {
  if (cache.manifest) return cache.manifest;
  const res = await fetch("/data/programs/manifest.json");
  if (!res.ok) throw new Error(`programs/manifest.json → HTTP ${res.status}`);
  const data = await res.json();
  const parsed = programManifestSchema.parse(data);
  cache.manifest = parsed;
  return parsed;
}

export async function loadExercises(): Promise<{
  exercises: Exercise[];
  byId: Record<string, Exercise>;
}> {
  if (cache.exercises && cache.exerciseById) {
    return { exercises: cache.exercises, byId: cache.exerciseById };
  }
  const res = await fetch("/data/exercises.json");
  if (!res.ok) throw new Error(`exercises.json → HTTP ${res.status}`);
  const data = await res.json();
  const parsed = exercisesFileSchema.parse(data);
  const byId = Object.fromEntries(parsed.exercises.map((e) => [e.id, e]));
  cache.exercises = parsed.exercises;
  cache.exerciseById = byId;
  return { exercises: parsed.exercises, byId };
}

/**
 * Merge a program's `exercise_overrides` onto the shared movement library.
 *
 * `exercises.json` is one library shared by every program in the catalog, so its
 * `cues` / `rationale` are general coaching copy. Constraints belonging to a
 * single person's clinical record live in that program's `exercise_overrides`
 * and are folded in here — so `anterior-hip-rebuild` still renders "low-bar rack
 * position is OFF the menu due to shoulder retroversion" while a catalog-public
 * program sharing the same `back_squat_highbar` entry renders only the general
 * cue.
 *
 * Pure: returns a new map, leaves the cached library untouched. Call it at any
 * render site that has a program in hand; sites without one (log lists, loading
 * fallbacks) correctly render the general copy.
 */
export function applyProgramExerciseOverrides(
  byId: Record<string, Exercise>,
  program: Pick<Program, "exercise_overrides"> | null | undefined,
): Record<string, Exercise> {
  const overrides = program?.exercise_overrides;
  if (!overrides) return byId;
  const out: Record<string, Exercise> = { ...byId };
  for (const [id, ov] of Object.entries(overrides)) {
    const base = byId[id];
    // An override for an exercise the library doesn't have is authoring debt,
    // not a runtime error — data-integrity.test.ts fails on it.
    if (!base) continue;
    const merged: Exercise = { ...base };
    if (ov.cues) merged.cues = ov.cues;
    if (ov.cues_append?.length) merged.cues = [...(merged.cues ?? []), ...ov.cues_append];
    if (ov.cues_external_focus) merged.cues_external_focus = ov.cues_external_focus;
    if (ov.cues_internal_focus) merged.cues_internal_focus = ov.cues_internal_focus;
    if (ov.setup) merged.setup = ov.setup;
    if (ov.rationale) merged.rationale = ov.rationale;
    if (ov.warning) merged.warning = ov.warning;
    if (ov.extra_set_side) {
      merged.default = { ...(merged.default ?? {}), extra_set_side: ov.extra_set_side };
    }
    out[id] = merged;
  }
  return out;
}

export async function loadClinicalContext(): Promise<ClinicalContext | null> {
  if (cache.clinical) return cache.clinical;
  try {
    const res = await fetch("/data/clinical-context.json");
    if (!res.ok) return null;
    const data = (await res.json()) as ClinicalContext;
    cache.clinical = data;
    return data;
  } catch {
    return null;
  }
}

export function clearDataCache(): void {
  cache = { programBySlug: new Map() };
}
