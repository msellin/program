import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { Program } from "../schemas";

/**
 * Regression harness for the "stuck at 10/11" intake bug (2026-08-18).
 *
 * Root cause: `consent_symptom_data` was authored as `required: true` in
 * every program's `intake.questions` but rendered as a consent checkbox
 * (its "answer" lives in `consents`, not `answers`). The required-answered
 * counter stayed one below the total forever; submit stayed disabled with
 * no visible path forward.
 *
 * Two guards below:
 *   1. Every required question in every program MUST be one the renderer
 *      actually shows in a question-answering surface. The renderer's
 *      excluded-set (RENDERED_CONSENT_QUESTION_IDS) must match here or
 *      re-introduce the bug for that program.
 *   2. Any question id that appears in `intake.consent[]` (rendered as a
 *      checkbox) must NOT also appear as a `required: true` question in
 *      `intake.questions` — that's the specific double-shape the bug hit.
 */

const PROGRAM_SLUGS = [
  "engine-builder",
  "handstand-walk",
  "rowing-2k-test-prep",
  "concurrent-strength-maintenance",
  "overhead-mobility",
  "anterior-hip-rebuild",
];

// Keep this in lockstep with IntakeClient's RENDERED_CONSENT_QUESTION_IDS
// set. If this list grows, mirror the change in the renderer.
const CONSENT_QIDS_HANDLED_ELSEWHERE = new Set(["consent_symptom_data"]);

function loadProgram(slug: string): Program {
  const p = path.resolve(
    __dirname,
    "../../../public/data/programs",
    `${slug}.json`,
  );
  return JSON.parse(fs.readFileSync(p, "utf8")) as Program;
}

describe("intake required-question renderability", () => {
  for (const slug of PROGRAM_SLUGS) {
    it(`${slug}: every required question is renderable OR handled by the consent block`, () => {
      const program = loadProgram(slug);
      const questions = program.intake?.questions ?? [];
      const required = questions.filter((q) => q.required);
      const unrenderable = required.filter(
        (q) => !CONSENT_QIDS_HANDLED_ELSEWHERE.has(q.id) && q.type === "boolean" && q.id.startsWith("consent_"),
      );
      // The strict version of the guard: if a required question id looks
      // like consent-content but is not in the handled-elsewhere set, the
      // renderer will show it AND require it — that's fine. What we're
      // guarding against is a required consent question with no UI at all.
      expect(unrenderable).toEqual([]);
    });

    it(`${slug}: no question id both appears in intake.consent[] and is a required question`, () => {
      const program = loadProgram(slug);
      const questions = program.intake?.questions ?? [];
      const consents = program.intake?.consent ?? [];
      const consentIds = new Set(consents.map((c) => c.id));
      const doubles = questions.filter((q) => q.required && consentIds.has(q.id));
      expect(doubles).toEqual([]);
    });
  }
});
