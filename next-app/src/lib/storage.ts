import { storeSchema, type Store, type DayLog, type ExerciseLog } from "./schemas";
import { today } from "./utils";

const KEY = "program.log.v2";
const OLD_KEY = "program.log.v1";
const CORRUPT_BACKUP_KEY = "program.log.v2.corrupt";
const SEED_DONE_KEY = "program.log.v2.seeded";  // set once seed-from-repo has run

const emptyStore = (): Store => ({
  version: 2,
  logs: {},
  training_maxes: {},
  cycle: { phase_id: null, cycle_number: 1, week_in_cycle: 1 },
});

/**
 * Load and validate the store. Sanitises corrupt shapes without discarding valid entries.
 * Migrates v1 → v2 automatically if only v1 is present.
 */
export function loadStore(): Store {
  if (typeof window === "undefined") return emptyStore();

  const raw = localStorage.getItem(KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const result = storeSchema.safeParse(parsed);
      if (result.success) return result.data;
      // Try a lenient sanitisation before giving up
      const cleaned = trySanitize(parsed);
      if (cleaned) return cleaned;
      // Back up the corrupt payload before starting fresh
      localStorage.setItem(CORRUPT_BACKUP_KEY, raw);
      console.warn("Store validation failed; backed up to", CORRUPT_BACKUP_KEY);
    } catch (e) {
      console.warn("Store parse failed:", e);
    }
  }

  // v1 → v2 migration
  try {
    const v1raw = localStorage.getItem(OLD_KEY);
    if (v1raw) {
      const v1 = JSON.parse(v1raw);
      if (v1 && typeof v1 === "object" && !Array.isArray(v1)) {
        const s = emptyStore();
        for (const [date, entry] of Object.entries(v1 as Record<string, unknown>)) {
          if (!entry || typeof entry !== "object") continue;
          const e = entry as Record<string, unknown>;
          const exs: Record<string, ExerciseLog> = {};
          const rawExs = (e.exercises as Record<string, unknown>) || {};
          for (const [k, v] of Object.entries(rawExs)) {
            exs[k] =
              typeof v === "boolean"
                ? { done: v, weight_kg: null, reps: null, notes: "" }
                : (v as ExerciseLog);
          }
          s.logs[date] = {
            date,
            exercises: exs,
            symptoms: (e.symptoms as DayLog["symptoms"]) ?? null,
            derived_state: (e.derived_state as DayLog["derived_state"]) ?? null,
            notes: typeof e.notes === "string" ? e.notes : "",
          };
        }
        return s;
      }
    }
  } catch {
    // ignore, fall through to empty
  }

  return emptyStore();
}

function trySanitize(raw: unknown): Store | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const s = emptyStore();
  if (r.training_maxes && typeof r.training_maxes === "object" && !Array.isArray(r.training_maxes)) {
    for (const [k, v] of Object.entries(r.training_maxes)) {
      if (typeof v === "number" && isFinite(v) && v > 0 && v <= 500) s.training_maxes[k] = v;
    }
  }
  if (r.logs && typeof r.logs === "object" && !Array.isArray(r.logs)) {
    for (const [date, entry] of Object.entries(r.logs as Record<string, unknown>)) {
      if (!entry || typeof entry !== "object") continue;
      const e = entry as Record<string, unknown>;
      const exs: Record<string, ExerciseLog> = {};
      const rawExs = (e.exercises as Record<string, unknown>) || {};
      for (const [k, v] of Object.entries(rawExs)) {
        if (v && typeof v === "object" && !Array.isArray(v)) {
          exs[k] = v as ExerciseLog;
        }
      }
      s.logs[date] = {
        date: typeof e.date === "string" ? e.date : date,
        exercises: exs,
        symptoms: (e.symptoms as DayLog["symptoms"]) ?? null,
        derived_state: (e.derived_state as DayLog["derived_state"]) ?? null,
        notes: typeof e.notes === "string" ? e.notes : "",
      };
    }
  }
  if (r.stretch_targets && typeof r.stretch_targets === "object" && !Array.isArray(r.stretch_targets)) {
    s.stretch_targets = {};
    for (const [k, v] of Object.entries(r.stretch_targets)) {
      if (typeof v === "number" && isFinite(v)) s.stretch_targets[k] = v;
    }
  }
  return s;
}

export function saveStore(store: Store): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch (e) {
    // Quota exceeded, corrupt storage, etc.
    console.error("saveStore failed:", e);
    throw e;
  }
}

/**
 * Fetch /data/log.json (the seed log the repo ships) and merge into the store
 * ONLY on the very first visit ever. The `SEED_DONE_KEY` flag is set once
 * seed either succeeds or is skipped, so subsequent wipes stay wiped, and
 * migrated v1 data isn't clobbered by the seed.
 */
export async function seedFromRepoLogIfEmpty(current: Store): Promise<Store | null> {
  if (typeof window === "undefined") return null;
  // Never seed twice. Wipe intentionally does NOT clear this flag.
  if (localStorage.getItem(SEED_DONE_KEY) === "1") return null;

  const isEmpty =
    Object.keys(current.logs).length === 0 &&
    Object.keys(current.training_maxes).length === 0;
  // Mark as seed-attempted BEFORE the fetch so a race between StrictMode double-mount
  // (or concurrent tabs) doesn't produce two overlapping writes.
  try { localStorage.setItem(SEED_DONE_KEY, "1"); } catch { /* ignore quota */ }

  if (!isEmpty) return null; // store already has content — v1 migration wins

  try {
    const res = await fetch("/data/log.json", { cache: "no-cache" });
    if (!res.ok) return null;
    const data = await res.json();
    const result = storeSchema.safeParse(data);
    if (!result.success) {
      console.warn("Repo log fell short of schema; skipping seed:", result.error.message);
      return null;
    }
    saveStore(result.data);
    return result.data;
  } catch (e) {
    console.warn("Repo log seed fetch failed:", e);
    return null;
  }
}

export function ensureDay(store: Store, date = today()): DayLog {
  if (!store.logs[date]) {
    store.logs[date] = {
      date,
      // Stamped once, here, because every caller of ensureDay is a write
      // path — the row exists only because the user just recorded something.
      // Distinguishes a same-day entry from a Sunday-night backfill of the
      // whole week, which nothing could tell apart once the 14-day server
      // snapshots pruned. Never rewritten: a later edit to the same day does
      // not change when the day was first written.
      first_written_at: new Date().toISOString(),
      exercises: {},
      symptoms: null,
      derived_state: null,
      notes: "",
    };
  }
  return store.logs[date];
}

export function ensureExercise(day: DayLog, blockId: string, exId: string): ExerciseLog {
  const key = `${blockId}:${exId}`;
  if (!day.exercises[key]) {
    day.exercises[key] = { done: false, weight_kg: null, reps: null, notes: "" };
  }
  return day.exercises[key];
}
