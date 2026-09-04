import { describe, it, expect, vi, afterEach } from "vitest";
import { elapsedSecondsSince } from "./wall-clock";

/**
 * The arithmetic half of the backgrounding fix. The hook itself is
 * exercised through `RestTakeover.test.tsx`, where the thing worth
 * asserting — a timer that was backgrounded for two minutes comes back
 * reading two minutes — needs a rendered component.
 */
afterEach(() => vi.useRealTimers());

describe("elapsedSecondsSince", () => {
  it("derives elapsed from two timestamps, not from tick count", () => {
    // The whole point. A hundred missed intervals cannot change this
    // answer, which is what makes it survive a backgrounded web view.
    const t0 = Date.parse("2026-09-04T10:00:00.000Z");
    expect(elapsedSecondsSince(t0, t0 + 125_000)).toBe(125);
  });

  it("floors partial seconds rather than rounding up", () => {
    const t0 = 1_000_000;
    expect(elapsedSecondsSince(t0, t0 + 1999)).toBe(1);
  });

  it("never returns a negative elapsed", () => {
    // Clock skew, or a persisted `startedAt` written by a device whose
    // clock ran ahead. A negative elapsed would render as a countdown
    // above its own target.
    const t0 = 1_000_000;
    expect(elapsedSecondsSince(t0, t0 - 5000)).toBe(0);
  });

  it("treats a missing anchor as zero rather than NaN", () => {
    // A corrupt persisted value must not put "NaN:NaN" on the screen.
    expect(elapsedSecondsSince(Number.NaN, 1_000_000)).toBe(0);
  });
});
