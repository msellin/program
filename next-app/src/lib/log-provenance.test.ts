import { describe, it, expect, beforeEach, vi } from "vitest";
import { ensureDay } from "./storage";
import { SYMPTOM_SCALE_VERSION } from "./symptom-regions";
import { storeSchema } from "./schemas";
import { useStore } from "./useStore";
import type { Store } from "./schemas";

/**
 * Two fields that record HOW a log entry came to exist, not just what it says.
 *
 * Both were added on 2026-09-03 after an advisory review pointed out they are
 * cheap now and impossible retroactively:
 *
 * - `first_written_at` — `date` is the day an entry is ABOUT; this is when it
 *   was written. Same-day logging and Sunday-night backfill are different
 *   measurement processes, and server snapshots prune at 14 days, so after
 *   two weeks nothing anywhere recorded which had happened.
 * - `symptoms.scale_version` — every symptom field is a 0-10 number, but the
 *   check wrote continuous slider values before 2026-08-21 and four fixed
 *   buckets after. A long-range chart shows that as a step in the person.
 */

const emptyStore = (): Store =>
  ({ version: 2, logs: {}, training_maxes: {}, cycle: {} }) as unknown as Store;

describe("first_written_at", () => {
  it("is stamped when a day row is created", () => {
    const s = emptyStore();
    const day = ensureDay(s, "2026-09-01");
    expect(day.first_written_at).toBeTruthy();
    expect(Number.isFinite(Date.parse(day.first_written_at!))).toBe(true);
  });

  it("records the write moment, not the day being logged", () => {
    // The whole point: logging Tuesday's session on Sunday must be visible.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-06T21:30:00.000Z"));
    const s = emptyStore();
    const day = ensureDay(s, "2026-09-01");
    expect(day.date).toBe("2026-09-01");
    expect(day.first_written_at).toBe("2026-09-06T21:30:00.000Z");
    vi.useRealTimers();
  });

  it("is never rewritten when the same day is touched again", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-01T06:00:00.000Z"));
    const s = emptyStore();
    ensureDay(s, "2026-09-01");
    const first = s.logs["2026-09-01"].first_written_at;
    vi.setSystemTime(new Date("2026-09-04T19:00:00.000Z"));
    ensureDay(s, "2026-09-01");
    expect(s.logs["2026-09-01"].first_written_at).toBe(first);
    vi.useRealTimers();
  });

  it("is optional, so history written before it existed still parses", () => {
    const parsed = storeSchema.safeParse({
      version: 2,
      logs: {
        "2026-08-01": { date: "2026-08-01", exercises: {}, symptoms: null, derived_state: null },
      },
      training_maxes: {},
      cycle: { phase_id: null, cycle_number: 1, week_in_cycle: 1 },
    });
    expect(parsed.success).toBe(true);
  });
});

describe("symptoms.scale_version", () => {
  beforeEach(() => {
    useStore.setState({ store: emptyStore() });
  });

  it("is stamped on every symptom write", () => {
    useStore.getState().setDaySymptoms("2026-09-01", { groin_left: 5 }, "amber");
    const written = useStore.getState().store.logs["2026-09-01"].symptoms;
    expect(written?.scale_version).toBe(SYMPTOM_SCALE_VERSION);
  });

  it("names the instrument, and the current one is the four-bucket scale", () => {
    // If the check's writable values change, this constant must change with
    // them — that is the whole contract. Wording and layout changes must not.
    expect(SYMPTOM_SCALE_VERSION).toBe("bucket4.2026-08-21");
  });

  it("leaves a null symptom write null rather than inventing a row", () => {
    useStore.getState().setDaySymptoms("2026-09-01", null, null);
    expect(useStore.getState().store.logs["2026-09-01"].symptoms).toBeNull();
  });

  it("is optional, so pre-Cut-D slider entries still parse", () => {
    const parsed = storeSchema.safeParse({
      version: 2,
      logs: {
        "2026-07-01": {
          date: "2026-07-01",
          exercises: {},
          // A 7 is unreachable on the four-bucket scale — exactly the kind of
          // value whose provenance the field exists to record.
          symptoms: { groin_left: 7 },
          derived_state: "red",
        },
      },
      training_maxes: {},
      cycle: { phase_id: null, cycle_number: 1, week_in_cycle: 1 },
    });
    expect(parsed.success).toBe(true);
    expect(
      parsed.success && parsed.data.logs["2026-07-01"].symptoms?.scale_version,
    ).toBeUndefined();
  });
});
