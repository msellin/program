import { describe, it, expect, beforeEach } from "vitest";
import { writeRest, clearRest, restoreRest } from "./rest-persistence";

/**
 * The last piece of session state that vanished when iOS discarded a
 * backgrounded app. `session-cursor.ts` puts you back on the set; this puts
 * back the rest you were in the middle of.
 */
const T0 = Date.parse("2026-09-04T10:00:00.000Z");
const rest = (over: Partial<Parameters<typeof writeRest>[0]> = {}) => ({
  scope: "day:engine-builder",
  date: "2026-09-04",
  startedAt: T0,
  targetSeconds: 180,
  ...over,
});

beforeEach(() => localStorage.clear());

describe("restoreRest", () => {
  it("restores a rest still running, anchored to when it actually started", () => {
    // 180s rest, 60s gone. The anchor is what makes the restored countdown
    // read 2:00 rather than restarting at 3:00.
    writeRest(rest());
    expect(restoreRest("day:engine-builder", "2026-09-04", T0 + 60_000)).toEqual({
      kind: "running",
      startedAt: T0,
      targetSeconds: 180,
    });
  });

  it("reports a rest that ended while the app was gone as expired", () => {
    // THE case this module exists for. Resurrecting this as a live
    // countdown would be the app inventing time the user then acts on.
    const r = restoreRest("day:engine-builder", "2026-09-04", T0 + 300_000);
    writeRest(rest());
    const after = restoreRest("day:engine-builder", "2026-09-04", T0 + 300_000);
    expect(r).toBeNull(); // nothing written yet
    expect(after).toEqual({
      kind: "expired",
      startedAt: T0,
      targetSeconds: 180,
      agoSeconds: 120,
    });
  });

  it("treats the exact expiry moment as expired, not running", () => {
    // A restored rest at 0:00 that still counts is a countdown with
    // nowhere to go.
    writeRest(rest());
    expect(restoreRest("day:engine-builder", "2026-09-04", T0 + 180_000)?.kind).toBe("expired");
  });

  it("drops a rest older than thirty minutes", () => {
    // Past this it is not a rest, it is a note that you stopped training a
    // while ago. Much shorter than the session cursor's six hours on
    // purpose.
    writeRest(rest());
    expect(restoreRest("day:engine-builder", "2026-09-04", T0 + 31 * 60_000)).toBeNull();
  });

  it("does not restore across scopes or days", () => {
    writeRest(rest());
    expect(restoreRest("offplan", "2026-09-04", T0 + 1000)).toBeNull();
    expect(restoreRest("day:engine-builder", "2026-09-05", T0 + 1000)).toBeNull();
  });

  it("rejects a start time in the future", () => {
    // A clock that moved — a device time change, or a value synced from
    // somewhere ahead. Negative elapsed would render a countdown above its
    // own target.
    writeRest(rest());
    expect(restoreRest("day:engine-builder", "2026-09-04", T0 - 1000)).toBeNull();
  });

  it("rejects a corrupt or nonsensical value instead of throwing", () => {
    localStorage.setItem("program.rest.v1", "{not json");
    expect(restoreRest("day:engine-builder", "2026-09-04", T0)).toBeNull();
    writeRest(rest({ targetSeconds: 0 }));
    expect(restoreRest("day:engine-builder", "2026-09-04", T0)).toBeNull();
  });

  it("clears", () => {
    writeRest(rest());
    clearRest();
    expect(restoreRest("day:engine-builder", "2026-09-04", T0 + 1000)).toBeNull();
  });
});
