import type { Store, AssessmentEntry } from "../schemas";
import { findPack, scoreKeysFor, type AssessmentPack } from "../assessments-data";
import { iso } from "../utils";

/**
 * Assessment-pack engine. Reads a pack + the store and answers:
 *   - is the pack due today (cadence-based)?
 *   - how has the athlete been trending on it?
 *   - what's the current adherence to rehab work that supports this region?
 *
 * Kept intentionally pack-agnostic — no hip-specific code lives here. If we
 * add a shoulder pack later, we call the same functions with a different pack.
 */

export function lastEntryFor(store: Store, packId: string): AssessmentEntry | null {
  const list = store.assessments?.[packId] ?? [];
  return list.length > 0 ? list[list.length - 1] : null;
}

function daysBetweenISO(a: string, b: string): number {
  const t1 = new Date(a + "T00:00:00").getTime();
  const t2 = new Date(b + "T00:00:00").getTime();
  return Math.round((t2 - t1) / 86_400_000);
}

/** Whether an assessment pack is due today given its cadence and last entry. */
export function isDue(
  store: Store,
  packId: string,
  todayISO: string,
): { due: boolean; daysSince: number | null; lastDate: string | null; cadence: number } {
  const pack = findPack(packId);
  const cadence = pack?.cadence_days ?? 28;
  const last = lastEntryFor(store, packId);
  if (!last) {
    return { due: true, daysSince: null, lastDate: null, cadence };
  }
  const daysSince = daysBetweenISO(last.date, todayISO);
  return {
    due: daysSince >= cadence,
    daysSince,
    lastDate: last.date,
    cadence,
  };
}

/**
 * Time-series of overall pack scores. Each entry's score is the mean of all
 * question scores (paired questions contribute both sides). Higher = more
 * symptomatic (all packs are `better: "lower"`).
 */
export function packScoreSeries(
  store: Store,
  pack: AssessmentPack,
): Array<{ date: string; overall: number; byKey: Record<string, number> }> {
  const entries = store.assessments?.[pack.id] ?? [];
  const keys = scoreKeysFor(pack);
  return entries.map((e) => {
    const nums = keys
      .map((k) => e.scores[k])
      .filter((v): v is number => typeof v === "number");
    const overall = nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    return {
      date: e.date,
      overall: Math.round(overall * 10) / 10,
      byKey: e.scores,
    };
  });
}

/**
 * Rehab adherence: fraction of the last `windowDays` on which any exercise
 * belonging to `blockId` was marked done. Used to surface consistency on the
 * Progress tile — the constraint from the clinical notes is precisely this:
 * daily consistency on rehab is what protects the barbell work.
 */
export function rehabAdherence(
  store: Store,
  blockId: string,
  windowDays: number,
  todayISO: string,
): { doneDays: number; totalDays: number; ratio: number } {
  const today = new Date(todayISO + "T00:00:00");
  let done = 0;
  for (let i = 0; i < windowDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = iso(d);
    const day = store.logs[key];
    if (!day) continue;
    for (const [exKey, entry] of Object.entries(day.exercises)) {
      if (!exKey.startsWith(`${blockId}:`)) continue;
      if (entry.done) {
        done++;
        break;
      }
    }
  }
  return {
    doneDays: done,
    totalDays: windowDays,
    ratio: Math.round((done / windowDays) * 100) / 100,
  };
}

/**
 * Morning-check symptom trend, for the Progress tile. Returns one point per
 * day the user recorded a value. Not all days are checked, so gaps are real.
 */
export function symptomTrend(
  store: Store,
  field: "groin_left" | "buttock_left" | "low_back" | "shoulder_right",
  windowDays: number,
  todayISO: string,
): Array<{ date: string; value: number }> {
  const today = new Date(todayISO + "T00:00:00");
  const out: Array<{ date: string; value: number }> = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = iso(d);
    const day = store.logs[key];
    const value = day?.symptoms?.[field];
    if (typeof value === "number") {
      out.push({ date: key, value });
    }
  }
  return out;
}
