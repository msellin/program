import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  exercisesFileSchema,
  programSchema,
  programManifestSchema,
  type Exercise,
  type Program,
} from "./schemas";
import { applyProgramExerciseOverrides } from "./data-loader";

const DATA = path.resolve(__dirname, "../../public/data");
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(DATA, p), "utf8"));

const library = exercisesFileSchema.parse(read("exercises.json"));
const manifest = programManifestSchema.parse(read("programs/manifest.json"));
const byId: Record<string, Exercise> = Object.fromEntries(
  library.exercises.map((e) => [e.id, e]),
);

const programs: Array<{ id: string; personal: boolean; program: Program }> =
  manifest.programs.map((entry) => ({
    id: entry.id,
    personal: entry.personal === true,
    program: programSchema.parse(read(`programs/${entry.slug ?? entry.id}.json`)),
  }));

function exerciseIdsIn(program: Program): string[] {
  const ids = new Set<string>();
  for (const b of program.blocks ?? []) {
    for (const it of b.items ?? []) if (it.exercise_id) ids.add(it.exercise_id);
  }
  for (const id of program.drill_library ?? []) ids.add(id);
  return [...ids];
}

describe("referential integrity", () => {
  it.each(programs.map((p) => p.id))("%s resolves every exercise_id", (id) => {
    const { program } = programs.find((p) => p.id === id)!;
    const missing = exerciseIdsIn(program).filter((eid) => !byId[eid]);
    expect(missing).toEqual([]);
  });

  it.each(programs.map((p) => p.id))("%s overrides target real exercises", (id) => {
    const { program } = programs.find((p) => p.id === id)!;
    const missing = Object.keys(program.exercise_overrides ?? {}).filter((eid) => !byId[eid]);
    expect(missing).toEqual([]);
  });
});

/**
 * The shared movement library ships to every user of every catalog-public
 * program. Copy that only makes sense for one person's clinical record —
 * a named side, a documented deficit, a specific diagnosis — belongs in that
 * program's `exercise_overrides`, not here.
 *
 * Regression guard for the CSM leak: `back_squat_highbar` and `front_squat` are
 * shared by `anterior-hip-rebuild` (personal) and `concurrent-strength-maintenance`
 * (catalog-public), and carried one person's shoulder diagnosis as generic cues.
 */
const PERSONAL_LANGUAGE = [
  /\bdocumented\b/i,
  /\bthis user\b/i,
  /\bthe (?:right|left) (?:shoulder|hip|glute|glute-max|SI|groin|side)\b/i,
  /\b(?:right|left) shoulder\b/i,
  /\bretroversion\b/i,
  /\bBertolotti\b/i,
  /\bSLAP\b/,
  /\blabral\b/i,
  /\bFADIR\b/,
  /\b(?:Left|Right) side (?:first|gets)\b/,
  /~\d+\s*kg/i,
];

describe("shared exercise library carries no person-specific clinical copy", () => {
  const COPY_FIELDS = ["cues", "cues_external_focus", "cues_internal_focus"] as const;

  it("cue arrays are general coaching copy", () => {
    const offenders: string[] = [];
    for (const e of library.exercises) {
      for (const field of COPY_FIELDS) {
        for (const [i, cue] of (e[field] ?? []).entries()) {
          const hit = PERSONAL_LANGUAGE.find((re) => re.test(cue));
          if (hit) offenders.push(`${e.id}.${field}[${i}] :: ${cue}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("rationale is general coaching copy", () => {
    const offenders = library.exercises
      .filter((e) => e.rationale && PERSONAL_LANGUAGE.some((re) => re.test(e.rationale!)))
      .map((e) => `${e.id}.rationale :: ${e.rationale}`);
    expect(offenders).toEqual([]);
  });

  it("laterality emphasis is program-scoped, not baked into the library", () => {
    const offenders = library.exercises
      .filter((e) => e.default?.extra_set_side != null)
      .map((e) => e.id);
    expect(offenders).toEqual([]);
  });
});

describe("catalog-public programs render only general copy", () => {
  const publicPrograms = programs.filter((p) => !p.personal);

  it("no catalog-public program has any exercise_overrides", () => {
    // Overrides exist to hold personal constraints. If a catalog-public program
    // ever needs one, revisit this test — but it must not smuggle clinical copy.
    expect(publicPrograms.filter((p) => p.program.exercise_overrides).map((p) => p.id)).toEqual([]);
  });

  it.each(publicPrograms.map((p) => p.id))("%s renders no personal language", (id) => {
    const { program } = publicPrograms.find((p) => p.id === id)!;
    const resolved = applyProgramExerciseOverrides(byId, program);
    const offenders: string[] = [];
    for (const eid of exerciseIdsIn(program)) {
      const e = resolved[eid];
      if (!e) continue;
      for (const text of [...(e.cues ?? []), ...(e.cues_external_focus ?? []), e.rationale ?? ""]) {
        if (PERSONAL_LANGUAGE.some((re) => re.test(text))) offenders.push(`${eid} :: ${text}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("anterior-hip-rebuild keeps its clinical constraints", () => {
  const hip = programs.find((p) => p.id === "anterior-hip-rebuild")!.program;
  const resolved = applyProgramExerciseOverrides(byId, hip);

  it.each([
    ["back_squat_highbar", "shoulder retroversion"],
    ["back_squat_highbar", "the right shoulder"],
    ["front_squat", "the right shoulder"],
    ["block_pull_midshin", "symptom-free"],
    ["deadlift_conventional", "150 kg"],
    ["deadlift_conventional", "left SI"],
    ["glute_bridge_single", "documented left gluteus maximus deficit"],
    ["bulgarian_split_squat_db", "documented left glute-max"],
    ["single_leg_rdl", "Left side gets the extra set"],
    ["banded_march_standing", "clicking was documented"],
    ["split_squat_rfe", "FADIR"],
  ])("%s still surfaces %s", (eid, needle) => {
    const e = resolved[eid];
    expect(e, `${eid} missing from library`).toBeDefined();
    expect((e.cues ?? []).join(" | ")).toContain(needle);
  });

  it.each([
    ["back_squat_highbar", "Bertolotti"],
    ["dead_bug", "Bertolotti"],
    ["bulgarian_split_squat_db", "the record documents"],
    ["single_leg_rdl", "left glute-max gap"],
  ])("%s rationale still says %s", (eid, needle) => {
    expect(resolved[eid].rationale ?? "").toContain(needle);
  });

  it("restores the left-side emphasis the library no longer carries", () => {
    for (const eid of [
      "glute_bridge_single",
      "split_squat_rfe",
      "bulgarian_split_squat_db",
      "single_leg_rdl",
    ]) {
      expect(byId[eid].default?.extra_set_side, `${eid} library`).toBeUndefined();
      expect(resolved[eid].default?.extra_set_side, `${eid} resolved`).toBe("left");
    }
  });

  it("leaves the cached library untouched", () => {
    expect(byId.back_squat_highbar.cues?.[0]).toBe("Bar sits on the traps, not the rear delts");
  });

});

/**
 * Six library entries have never carried cue copy. That predates the
 * general/personal split and is tracked separately — pinning the set here means
 * moving a cue out of the shared library can never silently add a seventh.
 */
const KNOWN_CUELESS = [
  "back_squat",
  "hollow_hold",
  "nordic_curl",
  "pallof_press",
  "sled_push",
  "trap_bar_dl_floor",
];

describe("no program lost its cue rendering", () => {
  const hasCopy = (e: Exercise) =>
    (e.cues?.length ?? 0) > 0 ||
    (e.cues_external_focus?.length ?? 0) > 0 ||
    (e.cues_internal_focus?.length ?? 0) > 0 ||
    !!e.setup;

  it("the set of cue-less library entries has not grown", () => {
    expect(library.exercises.filter((e) => !hasCopy(e)).map((e) => e.id).sort()).toEqual(
      KNOWN_CUELESS,
    );
  });

  it.each(programs.map((p) => p.id))("%s renders cues for every exercise it uses", (id) => {
    const { program } = programs.find((p) => p.id === id)!;
    const resolved = applyProgramExerciseOverrides(byId, program);
    const silent = exerciseIdsIn(program)
      .filter((eid) => resolved[eid] && !hasCopy(resolved[eid]))
      .filter((eid) => !KNOWN_CUELESS.includes(eid));
    expect(silent).toEqual([]);
  });
});
