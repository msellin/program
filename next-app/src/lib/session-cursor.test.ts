import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  readSessionCursor,
  writeSessionCursor,
  clearSessionCursor,
  reconcileCursor,
} from "./session-cursor";

/**
 * The other half of the backgrounding report (founder, 2026-09-04):
 * "page views reset".
 *
 * iOS evicts a backgrounded web view under memory pressure and relaunches
 * COLD at the manifest `start_url`. `ResumeLastRoute` restores the route;
 * this restores what was on it.
 */
const CURSOR = { mode: "set" as const, activeKey: "b:front_squat", activeSetIndex: 2 };

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

describe("readSessionCursor", () => {
  it("round-trips the cursor for the same scope and day", () => {
    writeSessionCursor("day:anterior-hip-rebuild", "2026-09-04", CURSOR);
    expect(readSessionCursor("day:anterior-hip-rebuild", "2026-09-04")).toEqual(CURSOR);
  });

  it("does not restore across scopes", () => {
    // Backgrounding out of off-plan must not drop you into a programme
    // session, or the reverse. The rails are different lists; a key from
    // one is meaningless in the other.
    writeSessionCursor("offplan", "2026-09-04", CURSOR);
    expect(readSessionCursor("day:anterior-hip-rebuild", "2026-09-04")).toBeNull();
  });

  it("does not restore yesterday's session onto today", () => {
    writeSessionCursor("day:x", "2026-09-03", CURSOR);
    expect(readSessionCursor("day:x", "2026-09-04")).toBeNull();
  });

  it("expires after six hours", () => {
    // Long enough for the gym and the trip home. Same window as
    // ResumeLastRoute, which restores the route this cursor sits on —
    // different numbers would mean landing on the right route with a
    // stale cursor.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-04T08:00:00.000Z"));
    writeSessionCursor("day:x", "2026-09-04", CURSOR);
    const sixHoursOne = Date.parse("2026-09-04T14:00:01.000Z");
    expect(readSessionCursor("day:x", "2026-09-04", sixHoursOne)).toBeNull();
    const fiveFiftyNine = Date.parse("2026-09-04T13:59:00.000Z");
    expect(readSessionCursor("day:x", "2026-09-04", fiveFiftyNine)).toEqual(CURSOR);
  });

  it("rejects a corrupt value instead of throwing", () => {
    // A cold start must not be failed by an unreadable convenience.
    localStorage.setItem("program.sessionCursor.v1", "{not json");
    expect(() => readSessionCursor("day:x", "2026-09-04")).not.toThrow();
    expect(readSessionCursor("day:x", "2026-09-04")).toBeNull();
  });

  it("rejects a structurally invalid cursor", () => {
    // A negative or fractional set index would index off the end of the
    // rail and render a Set screen for a set that does not exist.
    localStorage.setItem(
      "program.sessionCursor.v1",
      JSON.stringify({ scope: "day:x", date: "2026-09-04", at: Date.now(), mode: "set", activeKey: "a:b", activeSetIndex: -1 }),
    );
    expect(readSessionCursor("day:x", "2026-09-04")).toBeNull();
  });

  it("rejects an unknown mode", () => {
    localStorage.setItem(
      "program.sessionCursor.v1",
      JSON.stringify({ scope: "day:x", date: "2026-09-04", at: Date.now(), mode: "rest", activeKey: "a:b", activeSetIndex: 0 }),
    );
    expect(readSessionCursor("day:x", "2026-09-04")).toBeNull();
  });

  it("clears", () => {
    writeSessionCursor("day:x", "2026-09-04", CURSOR);
    clearSessionCursor();
    expect(readSessionCursor("day:x", "2026-09-04")).toBeNull();
  });
});

describe("reconcileCursor", () => {
  const exists = (keys: string[]) => (k: string) => keys.includes(k);

  it("keeps a cursor whose exercise is still on the rail", () => {
    expect(reconcileCursor(CURSOR, exists(["b:front_squat"]))).toEqual(CURSOR);
  });

  it("falls back to the Brief when the exercise is gone", () => {
    // A six-hour-old cursor can outlive a phase rollover or a block
    // replacement. Restoring onto a key that no longer resolves puts the
    // user on a blank Set screen with no way out but the nav — the Brief
    // is the screen that can always render.
    expect(reconcileCursor(CURSOR, exists(["b:back_squat_highbar"]))).toEqual({
      mode: "brief",
      activeKey: null,
      activeSetIndex: 0,
    });
  });

  it("never restores into Set with no exercise selected", () => {
    // mode "set" with a null key is the one combination that renders
    // nothing at all — `active` is null and the Set branch is skipped,
    // so the screen would be blank.
    expect(
      reconcileCursor({ mode: "set", activeKey: null, activeSetIndex: 0 }, exists([])),
    ).toEqual({ mode: "brief", activeKey: null, activeSetIndex: 0 });
  });
});
