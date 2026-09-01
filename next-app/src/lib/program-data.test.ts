import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { programSchema } from "./schemas";

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
const PROGRAM_DIR = path.join(process.cwd(), "public", "data", "programs");

const programFiles = fs
  .readdirSync(PROGRAM_DIR)
  .filter((f) => f.endsWith(".json") && f !== "manifest.json");

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
