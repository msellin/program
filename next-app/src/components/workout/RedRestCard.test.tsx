import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { reasonForState } from "@/lib/symptom-state";
import { RedRestCard } from "./RedRestCard";

/**
 * RECHECK-new-4: Today's red card read "Your shoulder is 8/10" while the check
 * said "Shoulder is above 5/10". Both now render the one reason line.
 */
let symptoms: Record<string, unknown> | null = null;
vi.mock("@/lib/useStore", () => ({
  useStore: (sel: (s: unknown) => unknown) =>
    sel({ store: { logs: symptoms ? { "2026-10-30": { symptoms } } : {} } }),
}));

afterEach(() => cleanup());

describe("red rest card", () => {
  it("says what the check says, word for word", () => {
    symptoms = { shoulder_right: 8 };
    render(<RedRestCard sourceDate="2026-10-30" />);
    const reason = reasonForState(symptoms as never, "red");
    expect(reason).toBe("Shoulder R is 8/10, above the 5/10 line.");
    expect(screen.getByText(new RegExp(reason.replace(/[/.]/g, "\\$&")))).toBeTruthy();
  });

  it("names a red flag instead of a vague line", () => {
    symptoms = { night_pain: true };
    render(<RedRestCard sourceDate="2026-10-30" />);
    expect(screen.getByText(/Red flag: night pain woke you\./)).toBeTruthy();
  });
});
