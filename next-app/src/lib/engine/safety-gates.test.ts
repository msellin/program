import { describe, it, expect } from "vitest";
import {
  evaluateSafetyGates,
  warningsAcknowledged,
  acknowledgementsToPersist,
  severityOf,
  type SafetyGate,
} from "./safety-gates";

/**
 * The gap this tier closes: a gate could only hard-block, so an author facing
 * a question where refusal was too blunt and silence too permissive chose
 * silence. Seven of eight shipped programs have at least one risky answer
 * that reaches no gate at all.
 *
 * The invariant that matters most is the default. If an absent `severity`
 * ever resolved to "warn", this change would silently downgrade every
 * existing refusal in the catalog into a dismissible notice — turning a
 * safety feature into a formality without a single JSON edit.
 */

const blockGate: SafetyGate = {
  question_id: "rotator_cuff_dx",
  unsafe_values: ["yes"],
  block_title: "See your physio first",
  block_body: "A diagnosed tear needs a rehab pathway.",
};

const warnGate: SafetyGate = {
  question_id: "shoulder_pain_flexion",
  unsafe_values: ["yes"],
  severity: "warn",
  block_title: "This program loads the range that hurts",
  block_body: "Every phase works end-range flexion.",
  acknowledge_label: "I understand and I'm choosing to continue.",
};

describe("severity defaults", () => {
  it("treats an absent severity as block", () => {
    expect(severityOf(blockGate)).toBe("block");
  });

  it("never lets an unknown severity loosen a gate", () => {
    // A typo in a program JSON must fail closed, not open.
    expect(severityOf({ ...blockGate, severity: "warning" as never })).toBe("block");
  });
});

describe("evaluateSafetyGates", () => {
  it("returns nothing when no unsafe answer is given", () => {
    const out = evaluateSafetyGates([blockGate, warnGate], { rotator_cuff_dx: "no" });
    expect(out.blocker).toBeNull();
    expect(out.warnings).toEqual([]);
  });

  it("blocks on a blocking gate", () => {
    const out = evaluateSafetyGates([blockGate], { rotator_cuff_dx: "yes" });
    expect(out.blocker?.title).toBe("See your physio first");
  });

  it("warns without blocking on a warn gate", () => {
    const out = evaluateSafetyGates([warnGate], { shoulder_pain_flexion: "yes" });
    expect(out.blocker).toBeNull();
    expect(out.warnings.map((w) => w.question_id)).toEqual(["shoulder_pain_flexion"]);
  });

  it("suppresses warnings once something blocks", () => {
    // Advisory notices under a refusal are noise; the user is not continuing.
    const out = evaluateSafetyGates([warnGate, blockGate], {
      shoulder_pain_flexion: "yes",
      rotator_cuff_dx: "yes",
    });
    expect(out.blocker).not.toBeNull();
    expect(out.warnings).toEqual([]);
  });

  it("accumulates every warning hit", () => {
    const second: SafetyGate = {
      question_id: "hypertension_unmanaged",
      unsafe_values: ["unsure"],
      severity: "warn",
      block_title: "Get your blood pressure checked",
      block_body: "This program includes maximal work.",
    };
    const out = evaluateSafetyGates([warnGate, second], {
      shoulder_pain_flexion: "yes",
      hypertension_unmanaged: "unsure",
    });
    expect(out.warnings).toHaveLength(2);
  });

  it("falls back to a generic acknowledgement label", () => {
    const out = evaluateSafetyGates(
      [{ ...warnGate, acknowledge_label: undefined }],
      { shoulder_pain_flexion: "yes" },
    );
    expect(out.warnings[0].acknowledge_label).toMatch(/choosing to continue/i);
  });

  it("ignores an unanswered question", () => {
    expect(evaluateSafetyGates([blockGate], {}).blocker).toBeNull();
  });

  it("handles a program with no gates", () => {
    expect(evaluateSafetyGates(undefined, { anything: "yes" })).toEqual({
      blocker: null,
      warnings: [],
    });
  });
});

describe("warningsAcknowledged", () => {
  const { warnings } = evaluateSafetyGates([warnGate], { shoulder_pain_flexion: "yes" });

  it("holds the intake until the box is ticked", () => {
    expect(warningsAcknowledged(warnings, {})).toBe(false);
    expect(warningsAcknowledged(warnings, { shoulder_pain_flexion: false })).toBe(false);
  });

  it("passes once acknowledged", () => {
    expect(warningsAcknowledged(warnings, { shoulder_pain_flexion: true })).toBe(true);
  });

  it("is vacuously true when nothing was raised", () => {
    expect(warningsAcknowledged([], {})).toBe(true);
  });
});

describe("acknowledgementsToPersist", () => {
  const { warnings } = evaluateSafetyGates([warnGate], { shoulder_pain_flexion: "yes" });

  it("records what the user was told and agreed to", () => {
    // "They were told and said yes" is a different fact from "nobody asked",
    // and after the fact the two are otherwise indistinguishable.
    expect(acknowledgementsToPersist(warnings, { shoulder_pain_flexion: true })).toEqual({
      "safety_ack.shoulder_pain_flexion": "true",
    });
  });

  it("records nothing for an unticked warning", () => {
    expect(acknowledgementsToPersist(warnings, {})).toEqual({});
  });
});
