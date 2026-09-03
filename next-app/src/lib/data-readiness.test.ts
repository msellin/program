import { describe, it, expect } from "vitest";
import { tallyReadiness } from "./data-readiness";

/**
 * The gap this closes: F5 is blocked on "90+ days of real log data" and the
 * locked M3 trigger reads "25 users × 90 days", but nothing could evaluate
 * either — so building-or-deferring was a judgement about an invisible
 * number.
 */

function userWithDays(
  n: number,
  opts: { checks?: number; nonzero?: number; startDay?: number } = {},
) {
  const logs: Record<string, unknown> = {};
  const checks = opts.checks ?? 0;
  const nonzero = opts.nonzero ?? 0;
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.UTC(2026, 0, 1 + i + (opts.startDay ?? 0)))
      .toISOString()
      .slice(0, 10);
    logs[d] = {
      exercises: { "b:x": { done: true } },
      symptoms:
        i < checks ? { groin_left: i < nonzero ? 4 : 0, scale_version: "bucket4.2026-08-21" } : null,
    };
  }
  return { logs };
}

describe("tallyReadiness", () => {
  it("counts how many users clear each day threshold", () => {
    const r = tallyReadiness([userWithDays(95), userWithDays(35), userWithDays(5)]);
    expect(r.users_total).toBe(3);
    expect(r.logged_days.find((x) => x.min_days === 30)?.users).toBe(2);
    expect(r.logged_days.find((x) => x.min_days === 90)?.users).toBe(1);
    expect(r.logged_days.find((x) => x.min_days === 180)?.users).toBe(0);
  });

  it("counts checked days separately from logged days", () => {
    // Training every day and checking rarely is the common shape, and a
    // correlation needs the check side, not the training side.
    const r = tallyReadiness([userWithDays(100, { checks: 20 })]);
    expect(r.logged_days.find((x) => x.min_days === 90)?.users).toBe(1);
    expect(r.checked_days.find((x) => x.min_days === 90)?.users).toBe(0);
    expect(r.checked_days.find((x) => x.min_days === 30)?.users).toBe(0);
  });

  it("counts only days with a symptom score above zero as variance", () => {
    // The failure this guards: a user who answers None for months inflates
    // every day count while contributing nothing to explain.
    const r = tallyReadiness([userWithDays(100, { checks: 100, nonzero: 0 })]);
    expect(r.checked_days.find((x) => x.min_days === 90)?.users).toBe(1);
    expect(r.nonzero_symptom_days.find((x) => x.min_days === 5)?.users).toBe(0);
  });

  it("does not count flags or life_load as a symptom score", () => {
    const r = tallyReadiness([
      { logs: { "2026-01-01": { symptoms: { night_pain: true, life_load: 8, groin_left: 0 } } } },
    ]);
    expect(r.nonzero_symptom_days.find((x) => x.min_days === 5)?.users).toBe(0);
  });

  it("reports the longest single-user span, not the sum", () => {
    const r = tallyReadiness([userWithDays(10), userWithDays(40)]);
    expect(r.max_span_days).toBe(40);
  });

  it("reports check completion as a share of the span", () => {
    // Day counts overstate continuity: 30 checks scattered over 100 days is a
    // different record from 30 consecutive ones.
    const r = tallyReadiness([userWithDays(100, { checks: 50 })]);
    expect(r.mean_check_completion_pct).toBe(50);
  });

  it("returns null completion when nobody has checked", () => {
    expect(tallyReadiness([userWithDays(10)]).mean_check_completion_pct).toBeNull();
  });

  it("survives a user with no logs at all", () => {
    const r = tallyReadiness([{}, { logs: {} }, userWithDays(5)]);
    expect(r.users_total).toBe(3);
    expect(r.users_with_any_log).toBe(1);
  });

  it("reports zeros rather than throwing on an empty beta", () => {
    const r = tallyReadiness([]);
    expect(r.users_total).toBe(0);
    expect(r.max_span_days).toBe(0);
    expect(r.logged_days.every((x) => x.users === 0)).toBe(true);
  });

  it("emits no per-user rows, ids or dates", () => {
    // Privacy contract, matching completions.ts. Asserted rather than
    // documented because the tempting change — "just return the raw counts
    // per user" — is re-identifying at beta scale and would look harmless.
    const r = tallyReadiness([userWithDays(30, { checks: 30, nonzero: 10 })]);
    const serialized = JSON.stringify(r);
    expect(serialized).not.toMatch(/2026-/);
    expect(Object.keys(r)).toEqual([
      "users_total",
      "users_with_any_log",
      "logged_days",
      "checked_days",
      "nonzero_symptom_days",
      "max_span_days",
      "mean_check_completion_pct",
    ]);
  });
});
