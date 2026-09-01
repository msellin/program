import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Cross-file referential integrity for the SHIPPED data tree.
 *
 * Zod validates each file in isolation. It cannot catch a reference that is
 * well-typed but points at nothing, because both sides are `z.string()`. Three
 * such defects reached the repo before this existed (all found 2026-09-01):
 *
 *  1. muscle-up.json declared four `capability_slot` values that no drill in
 *     its own `drill_library` could satisfy. `composeSlotDrills` falls back to
 *     authored items SILENTLY when `candidates.length === 0`, so the
 *     multi-dimensional composer — the program's central claim — never fired
 *     and nothing said a word.
 *  2. first-strict-pullup.json had `rhea_2003_meta` in `evidence_base.
 *     references[]` but not in `reference_ids[]`. Every other program keeps the
 *     two lists exactly in sync; nothing enforced it.
 *  3. An unresolved `exercise_id` does not throw — `DaySession.tsx` and
 *     `OffPlanSession.tsx` both do `if (!exercise) continue`, so the movement
 *     just vanishes from the workout. CLAUDE.md claims this is "checked on load
 *     and fail loudly". It is not. This test is that check.
 *
 * `validate.py` does similar work against the ROOT `data/` directory, which the
 * app does not serve. This covers `next-app/public/data/`, which it does.
 */
const DATA_DIR = path.join(process.cwd(), "public", "data");
const PROGRAM_DIR = path.join(DATA_DIR, "programs");

const readJson = (...segs: string[]) =>
  JSON.parse(fs.readFileSync(path.join(...segs), "utf8"));

// `daily_log_schema` blocks declare field TYPES, not references — "string",
// "number", "boolean" appear where an exercise_id would. Same placeholder set
// validate.py skips.
const PLACEHOLDERS = new Set(["string", "number", "boolean", "int", "float", "date"]);

type Exercise = { id: string; capability_domains?: string[] };

const exercises = readJson(DATA_DIR, "exercises.json") as { exercises: Exercise[] };
const exerciseById = new Map(exercises.exercises.map((e) => [e.id, e]));
const citations = readJson(DATA_DIR, "citations.json") as { citations: Array<{ id: string }> };
const citationIds = new Set(citations.citations.map((c) => c.id));
const manifest = readJson(PROGRAM_DIR, "manifest.json") as {
  programs: Array<{ slug: string; personal?: boolean; status?: string }>;
};
const programFiles = fs
  .readdirSync(PROGRAM_DIR)
  .filter((f) => f.endsWith(".json") && f !== "manifest.json");

describe("referential integrity across the shipped data tree", () => {
  it("has no duplicate exercise ids", () => {
    const seen = new Set<string>();
    const dupes = exercises.exercises
      .map((e) => e.id)
      .filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    expect(dupes).toEqual([]);
  });

  it("manifest slugs and program files agree in both directions", () => {
    const fileSlugs = new Set(programFiles.map((f) => f.replace(/\.json$/, "")));
    const manifestSlugs = new Set(manifest.programs.map((p) => p.slug));
    const missingFile = [...manifestSlugs].filter((s) => !fileSlugs.has(s));
    const missingManifest = [...fileSlugs].filter((s) => !manifestSlugs.has(s));
    expect({ missingFile, missingManifest }).toEqual({
      missingFile: [],
      missingManifest: [],
    });
  });

  for (const file of programFiles) {
    const slug = file.replace(/\.json$/, "");
    const program = readJson(PROGRAM_DIR, file) as Record<string, unknown>;

    it(`${slug}: every exercise_id and drill_library id resolves`, () => {
      const raw = fs.readFileSync(path.join(PROGRAM_DIR, file), "utf8");
      const referenced = new Set<string>();
      for (const m of raw.matchAll(/"exercise_id"\s*:\s*"([^"]+)"/g)) referenced.add(m[1]);
      for (const id of (program.drill_library as string[] | undefined) ?? []) referenced.add(id);
      const unresolved = [...referenced]
        .filter((id) => !PLACEHOLDERS.has(id))
        .filter((id) => !exerciseById.has(id))
        .sort();
      expect(unresolved).toEqual([]);
    });

    it(`${slug}: every capability_slot has at least one drill that can fill it`, () => {
      const blocks = (program.blocks as Array<{ id: string; capability_slot?: string }>) ?? [];
      const slots = blocks.filter((b) => b.capability_slot);
      if (slots.length === 0) return;
      const domains = new Set<string>();
      for (const id of (program.drill_library as string[] | undefined) ?? []) {
        for (const d of exerciseById.get(id)?.capability_domains ?? []) domains.add(d);
      }
      // A dead slot is invisible at runtime: composeSlotDrills falls back to
      // authored items, so the program looks fine and silently stops adapting.
      const dead = slots
        .filter((b) => !domains.has(b.capability_slot as string))
        .map((b) => `${b.id} → ${b.capability_slot}`)
        .sort();
      expect(dead).toEqual([]);
    });

    it(`${slug}: evidence_base references[] and reference_ids[] agree, and resolve`, () => {
      const eb = program.evidence_base as
        | { references?: Array<{ id: string }>; reference_ids?: string[] }
        | undefined;
      if (!eb) return;
      const refIds = new Set((eb.references ?? []).map((r) => r.id));
      const listed = new Set(eb.reference_ids ?? []);
      if (refIds.size === 0 && listed.size === 0) return;
      const onlyInReferences = [...refIds].filter((id) => !listed.has(id)).sort();
      const onlyInReferenceIds = [...listed].filter((id) => !refIds.has(id)).sort();
      const unresolvable = [...listed].filter((id) => !citationIds.has(id)).sort();
      expect({ onlyInReferences, onlyInReferenceIds, unresolvable }).toEqual({
        onlyInReferences: [],
        onlyInReferenceIds: [],
        unresolvable: [],
      });
    });
  }
});
