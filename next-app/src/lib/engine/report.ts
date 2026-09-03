import type { Store, Program, DayLog } from "../schemas";
import { iso } from "../utils";
import { daySignals } from "./note-signals";
import { HIP_FLEXOR_PACK, scoreKeysFor } from "../assessments-data";
import { packScoreSeries } from "./assessment-engine";
import { SYMPTOM_REGIONS } from "../symptom-regions";
import { isFailedAttempt } from "../set-progress";

/**
 * Aggregator for the specialist-ready training report.
 *
 * Pure over the store — no fetches, no side effects. Returns a shaped object
 * the report page renders. Every field is either directly observed (a score
 * the user typed, a set they logged) or a deterministic aggregation of same.
 * No inference, no LLM. This is a *log*, not a diagnosis.
 */

const TM_LIFT_IDS = new Set([
  "back_squat_highbar",
  "back_squat_ssb",
  "front_squat",
  "block_pull_midshin",
  "deadlift_conventional",
  "trap_bar_dl_blocks",
  "trap_bar_dl_floor",
]);

const SYMPTOM_NOTE_RE =
  /\b(pain|hurt\w*|sharp|twinge|flare|shoot\w*|pinch|ache|aching|catch|click\w*|valu\w*|torkab|kipitab|krambid|krampis|jäik)\b/i;

export type ReportDateRange = {
  start: string; // ISO yyyy-mm-dd
  end: string;
};

export type ReportData = {
  range: ReportDateRange;
  overview: {
    daysInRange: number;
    daysWithAnyLog: number;
    strengthSessionsCompleted: number;
    enduranceSessionsLogged: number;
    endurance_totalKm: number;
    endurance_totalMinutes: number;
    rehabDays: number;
    stateDistribution: { green: number; amber: number; red: number; unchecked: number };
  };
  symptomSeries: {
    /**
     * One series per region that actually carries a score, keyed by region id.
     * Was four fixed keys — the hip program's map — so a pull-up user's elbow
     * or a muscle-up user's wrist never reached the specialist report at all.
     * That report is the artifact this project considers its most valuable
     * output; it has to carry the region the user was actually hurting in.
     */
    regions: Record<string, Array<{ date: string; value: number }>>;
    click_days: string[]; // dates where click_present was true
    night_pain_days: string[];
    gait_change_days: string[];
  };
  hipAssessments: Array<{ date: string; overall: number; byKey: Record<string, number> }>;
  provocateurIncidents: Array<{
    date: string;
    context: "note" | "check";
    text: string;
    exercise?: string;
    weight_kg?: number | null;
    reps?: number | null;
  }>;
  loadProgression: Array<{
    exerciseId: string;
    entries: Array<{ date: string; top_kg: number; top_reps: number; rpe: number | null }>;
  }>;
  weeklyRehabAdherence: Array<{ weekStart: string; done: number; scheduled: number }>;
  keywordsInNotes: Array<{
    date: string;
    exerciseId?: string;
    text: string;
  }>;
};

function inRange(dateISO: string, range: ReportDateRange): boolean {
  return dateISO >= range.start && dateISO <= range.end;
}

function daysBetween(a: string, b: string): number {
  const t1 = new Date(a + "T00:00:00").getTime();
  const t2 = new Date(b + "T00:00:00").getTime();
  return Math.floor((t2 - t1) / 86_400_000) + 1;
}

function mondayOf(dateISO: string): Date {
  const d = new Date(dateISO + "T00:00:00");
  const dow = d.getDay();
  const daysBackToMon = (dow + 6) % 7;
  const mon = new Date(d);
  mon.setDate(d.getDate() - daysBackToMon);
  return mon;
}

export function computeReport(
  store: Store,
  program: Program,
  range: ReportDateRange,
): ReportData {
  const daysInRange = daysBetween(range.start, range.end);

  const overview: ReportData["overview"] = {
    daysInRange,
    daysWithAnyLog: 0,
    strengthSessionsCompleted: 0,
    enduranceSessionsLogged: 0,
    endurance_totalKm: 0,
    endurance_totalMinutes: 0,
    rehabDays: 0,
    stateDistribution: { green: 0, amber: 0, red: 0, unchecked: 0 },
  };

  const symptomSeries: ReportData["symptomSeries"] = {
    regions: {},
    click_days: [],
    night_pain_days: [],
    gait_change_days: [],
  };

  const provocateurIncidents: ReportData["provocateurIncidents"] = [];
  const keywordsInNotes: ReportData["keywordsInNotes"] = [];

  // Build the sorted date list inside range from actual logs.
  const dates = Object.keys(store.logs).filter((d) => inRange(d, range)).sort();

  for (const d of dates) {
    const day = store.logs[d] as DayLog | undefined;
    if (!day) continue;
    overview.daysWithAnyLog++;

    // State distribution
    if (day.derived_state === "green") overview.stateDistribution.green++;
    else if (day.derived_state === "amber") overview.stateDistribution.amber++;
    else if (day.derived_state === "red") overview.stateDistribution.red++;

    // Symptom series (only for days the user actually entered something)
    if (day.symptoms) {
      const s = day.symptoms;
      for (const r of SYMPTOM_REGIONS) {
        const v = (s as Record<string, unknown>)[r.id];
        if (typeof v === "number") {
          (symptomSeries.regions[r.id] ??= []).push({ date: d, value: v });
        }
      }
      if (s.click_present) symptomSeries.click_days.push(d);
      if (s.night_pain) symptomSeries.night_pain_days.push(d);
      if (s.gait_change) symptomSeries.gait_change_days.push(d);

      // Provocateur incidents from morning check
      if (
        s.night_pain ||
        s.gait_change ||
        (s.click_present && s.click_painful) ||
        (typeof s.groin_left === "number" && s.groin_left >= 5) ||
        (typeof s.buttock_left === "number" && s.buttock_left >= 5) ||
        (typeof s.low_back === "number" && s.low_back >= 5)
      ) {
        const parts: string[] = [];
        if (s.night_pain) parts.push("night pain");
        if (s.gait_change) parts.push("gait change");
        if (s.click_present && s.click_painful) parts.push("painful click");
        if (typeof s.groin_left === "number" && s.groin_left >= 5) parts.push(`groin L ${s.groin_left}`);
        if (typeof s.buttock_left === "number" && s.buttock_left >= 5) parts.push(`buttock L ${s.buttock_left}`);
        if (typeof s.low_back === "number" && s.low_back >= 5) parts.push(`low back ${s.low_back}`);
        provocateurIncidents.push({
          date: d,
          context: "check",
          text: parts.join(", "),
        });
      }
    }

    // Endurance
    for (const r of day.runs ?? []) {
      overview.enduranceSessionsLogged++;
      if (r.distance_km) overview.endurance_totalKm += r.distance_km;
      if (r.minutes) overview.endurance_totalMinutes += r.minutes;
    }

    // Session completion + rehab + notes
    let anyStrengthDone = false;
    let anyRehabDone = false;
    for (const [key, ex] of Object.entries(day.exercises)) {
      const [blockId, exId] = key.split(":");
      const block = program.blocks.find((b) => b.id === blockId);
      const isStrength = (block?.category ?? "strength") === "strength";
      if (ex.done && isStrength) anyStrengthDone = true;
      if (ex.done && blockId === "block_a_home") anyRehabDone = true;

      // Notes containing symptom keywords → flag as incident
      if (ex.notes && SYMPTOM_NOTE_RE.test(ex.notes)) {
        // Attach heaviest logged set on this exercise this day, if any.
        // Same exclusion, same reason: this reports the load that was on the
        // bar for work the user completed. "122 kg × 0 reps" next to a pain
        // note reads either as nonsense or as a 122 kg lift; neither is true.
        // The note's own text is still reported verbatim.
        const heaviest = (ex.sets ?? [])
          .filter((st) => st.weight_kg != null && st.reps != null && !isFailedAttempt(st))
          .sort((a, b) => (b.weight_kg ?? 0) - (a.weight_kg ?? 0))[0];
        provocateurIncidents.push({
          date: d,
          context: "note",
          text: ex.notes,
          exercise: exId,
          weight_kg: heaviest?.weight_kg ?? null,
          reps: heaviest?.reps ?? null,
        });
        keywordsInNotes.push({ date: d, exerciseId: exId, text: ex.notes });
      }
      // Per-set notes with keywords
      for (const st of ex.sets ?? []) {
        if (st.notes && SYMPTOM_NOTE_RE.test(st.notes)) {
          provocateurIncidents.push({
            date: d,
            context: "note",
            text: st.notes,
            exercise: exId,
            weight_kg: st.weight_kg ?? null,
            reps: st.reps ?? null,
          });
          keywordsInNotes.push({ date: d, exerciseId: exId, text: st.notes });
        }
      }
    }
    if (anyStrengthDone) overview.strengthSessionsCompleted++;
    if (anyRehabDone) overview.rehabDays++;

    // Day-level note keywords
    if (day.notes && SYMPTOM_NOTE_RE.test(day.notes)) {
      keywordsInNotes.push({ date: d, text: day.notes });
      // Also count as a mild incident even without a strong pattern; adds context.
      provocateurIncidents.push({ date: d, context: "note", text: day.notes });
    }
  }

  // Unchecked days = days in range that lack a derived_state.
  // We count based on the calendar range, not just days with logs.
  {
    const start = new Date(range.start + "T00:00:00");
    for (let i = 0; i < daysInRange; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = iso(d);
      const state = store.logs[key]?.derived_state;
      if (state === "green" || state === "amber" || state === "red") continue;
      overview.stateDistribution.unchecked++;
    }
  }

  // Hip assessments in range
  const packSeries = packScoreSeries(store, HIP_FLEXOR_PACK).filter((p) =>
    inRange(p.date, range),
  );
  // Only include the score keys defined by the pack (drop any legacy keys).
  const packKeys = new Set(scoreKeysFor(HIP_FLEXOR_PACK));
  const hipAssessments = packSeries.map((p) => ({
    date: p.date,
    overall: p.overall,
    byKey: Object.fromEntries(Object.entries(p.byKey).filter(([k]) => packKeys.has(k))),
  }));

  // Load progression per lift — one entry per date the lift was logged with the heaviest set.
  const loadByLift = new Map<string, ReportData["loadProgression"][number]["entries"]>();
  for (const d of dates) {
    const day = store.logs[d];
    if (!day) continue;
    for (const [key, ex] of Object.entries(day.exercises)) {
      const exId = key.split(":")[1];
      if (!TM_LIFT_IDS.has(exId)) continue;
      // Failed attempts excluded (2026-09-03). This sorts by weight and takes
      // the top, so a missed 122 would outrank every set actually lifted that
      // day and land on the clinical report as the day's top set — a lift the
      // user never made, at 0 reps, shown to a clinician.
      const heaviest = (ex.sets ?? [])
        .filter((s) => s.weight_kg != null && s.reps != null && !isFailedAttempt(s))
        .sort((a, b) => (b.weight_kg ?? 0) - (a.weight_kg ?? 0))[0];
      if (!heaviest || heaviest.weight_kg == null || heaviest.reps == null) continue;
      if (!loadByLift.has(exId)) loadByLift.set(exId, []);
      loadByLift.get(exId)!.push({
        date: d,
        top_kg: heaviest.weight_kg,
        top_reps: heaviest.reps,
        rpe: heaviest.rpe ?? null,
      });
    }
  }
  const loadProgression: ReportData["loadProgression"] = Array.from(loadByLift.entries()).map(
    ([exerciseId, entries]) => ({ exerciseId, entries }),
  );

  // Weekly rehab adherence: how many days per week (Mon-Sun) had block_a_home done.
  const weeklyMap = new Map<string, { done: number; scheduled: number }>();
  {
    const start = new Date(range.start + "T00:00:00");
    for (let i = 0; i < daysInRange; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = iso(d);
      const weekKey = iso(mondayOf(key));
      const bucket = weeklyMap.get(weekKey) ?? { done: 0, scheduled: 0 };
      bucket.scheduled++;
      const day = store.logs[key];
      if (day && Object.entries(day.exercises).some(([k, e]) => k.startsWith("block_a_home:") && e.done)) {
        bucket.done++;
      }
      weeklyMap.set(weekKey, bucket);
    }
  }
  const weeklyRehabAdherence = Array.from(weeklyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, v]) => ({ weekStart, done: v.done, scheduled: Math.min(7, v.scheduled) }));

  // Suppress duplicate incidents (same date + same text)
  const seen = new Set<string>();
  const deduped: ReportData["provocateurIncidents"] = [];
  for (const inc of provocateurIncidents) {
    const key = `${inc.date}|${inc.context}|${inc.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(inc);
  }

  // Reference the daySignals engine so a future report enrichment (fatigue trend
  // per week, external-load days count) has a natural entrypoint.
  void daySignals;

  return {
    range,
    overview,
    symptomSeries,
    hipAssessments,
    provocateurIncidents: deduped,
    loadProgression,
    weeklyRehabAdherence,
    keywordsInNotes,
  };
}
