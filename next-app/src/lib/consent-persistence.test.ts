import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { storeSchema } from "./schemas";

/**
 * The consent tick is the lawful basis the privacy page names for symptom
 * data — Article 9(2)(a), explicit consent — and it lived only in
 * `intake_drafts[slug].consents`, which `clearIntakeDraft` deletes on a
 * successful commit. So after enrolment there was no record anywhere that
 * consent had been given. The app collected the tick, relied on it in a legal
 * disclosure, and discarded it.
 *
 * `consent_symptom_data_at` had been in the schema the whole time and was
 * written by nothing. Same class as `daily_log_schema`,
 * `progression_rules.states[]`, `item.optional` and `weekly_overrides`; this
 * one just happened to be the one with a legal basis attached.
 */

const SRC = path.resolve(__dirname, "../app/programs/[slug]/intake/IntakeClient.tsx");
const intakeSource = fs.readFileSync(SRC, "utf8");

describe("intake consent survives the commit that deletes its draft", () => {
  it("writes the consents onto the program state", () => {
    expect(intakeSource).toMatch(/consents:\s*\{\s*\.\.\.consents\s*\}/);
  });

  it("stamps when the consents were given", () => {
    expect(intakeSource).toMatch(/consents_at:\s*Date\.now\(\)/);
  });

  it("stamps the profile-level health-data consent exactly once", () => {
    // Set once, on first consent. Re-stamping on every programme would make
    // it "when did they last enrol", which is a different fact and a worse
    // answer to "when did they consent".
    expect(intakeSource).toMatch(
      /consent_symptom_data_at == null[\s\S]{0,120}consent_symptom_data_at = Date\.now\(\)/,
    );
  });

  it("persists before the draft is cleared", () => {
    const write = intakeSource.indexOf("consents_at: Date.now()");
    const clear = intakeSource.indexOf("clearIntakeDraft(slug)");
    expect(write).toBeGreaterThan(-1);
    expect(clear).toBeGreaterThan(-1);
    expect(write).toBeLessThan(clear);
  });

  it("the schema accepts what the intake writes", () => {
    const parsed = storeSchema.safeParse({
      version: 2,
      logs: {},
      training_maxes: {},
      cycle: { phase_id: null, cycle_number: 1, week_in_cycle: 1 },
      user_profile: {
        consent_symptom_data_at: 1_756_000_000_000,
        program_states: {
          "overhead-mobility": {
            consents: { consent_symptom_data: true, not_medical_advice: true },
            consents_at: 1_756_000_000_000,
          },
        },
      },
    });
    expect(parsed.success).toBe(true);
    expect(
      parsed.success &&
        parsed.data.user_profile?.program_states?.["overhead-mobility"]?.consents
          ?.consent_symptom_data,
    ).toBe(true);
  });
});
