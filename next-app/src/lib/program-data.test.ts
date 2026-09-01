import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  programSchema,
  exercisesFileSchema,
  programManifestSchema,
  storeSchema,
} from "./schemas";

/**
 * Every shipped program JSON must satisfy `programSchema`.
 *
 * Added 2026-09-01 after a one-line data edit shipped a program that parsed as
 * JSON but failed Zod at runtime: a citation appended to
 * `evidence_base.references[]` omitted the required `used_for` field, and the
 * app rendered "Couldn't load program data" for every user of that program.
 *
 * The repo's existing validation loop (`for f in data/*.json; python3 -m
 * json.tool`) only proves the file is syntactically JSON. It cannot catch a
 * missing required field, a wrong type, or a renamed key — which is exactly
 * the class of error a hand-edit introduces. The persona harness did catch it,
 * but only after a six-minute browser run; this catches it in milliseconds.
 */
const DATA_DIR = path.join(process.cwd(), "public", "data");
const PROGRAM_DIR = path.join(DATA_DIR, "programs");

function readJson(...segs: string[]): unknown {
  return JSON.parse(fs.readFileSync(path.join(...segs), "utf8"));
}

function expectParses(schema: { safeParse: (v: unknown) => { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string; code: string }> } } }, label: string, value: unknown) {
  const result = schema.safeParse(value);
  if (!result.success) {
    const issues = (result.error?.issues ?? [])
      .slice(0, 8)
      .map((i) => `  ${i.path.join(".")}: ${i.message} (${i.code})`)
      .join("\n");
    throw new Error(`${label} failed schema validation:\n${issues}`);
  }
  expect(result.success).toBe(true);
}

const programFiles = fs
  .readdirSync(PROGRAM_DIR)
  .filter((f) => f.endsWith(".json") && f !== "manifest.json");

/**
 * These three have a LARGER blast radius than any single program: a bad edit to
 * exercises.json or manifest.json breaks every program at once, not one. Both
 * are loaded with `.parse()` (throws) in data-loader.ts. Neither had a test
 * until 2026-09-01.
 */
describe("shared runtime data validates", () => {
  it("exercises.json", () => {
    expectParses(exercisesFileSchema, "exercises.json", readJson(DATA_DIR, "exercises.json"));
  });

  it("programs/manifest.json", () => {
    expectParses(programManifestSchema, "programs/manifest.json", readJson(PROGRAM_DIR, "manifest.json"));
  });

  it("log.json seed", () => {
    expectParses(storeSchema, "log.json", readJson(DATA_DIR, "log.json"));
  });
});

describe("program data validates against programSchema", () => {
  it("finds program files to check", () => {
    expect(programFiles.length).toBeGreaterThan(0);
  });

  for (const file of programFiles) {
    it(`${file} parses`, () => {
      const raw = JSON.parse(fs.readFileSync(path.join(PROGRAM_DIR, file), "utf8"));
      const result = programSchema.safeParse(raw);
      if (!result.success) {
        const issues = result.error.issues
          .slice(0, 8)
          .map((i) => `  ${i.path.join(".")}: ${i.message} (${i.code})`)
          .join("\n");
        throw new Error(`${file} failed programSchema:\n${issues}`);
      }
      expect(result.success).toBe(true);
    });
  }
});
