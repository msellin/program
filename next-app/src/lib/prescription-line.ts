import { lastSessionFor } from "@/lib/engine/history";
import { prescriptionRows } from "@/lib/engine/suggest";
import { setShape } from "@/components/session/BriefView";
import type { RailExercise } from "@/components/session/DaySession";
import type { Store } from "@/lib/schemas";

/**
 * One prescription line per exercise, the same detail for every exercise
 * (custom-track pass, 2026-10-28). The brief showed the main lift's full
 * ladder twice and every other exercise as a bare "4 sets": hip thrust is
 * authored 4×8 and the screen gave neither the reps nor what was lifted last.
 *
 * The program's own item numbers win over the library default (BUG-42).
 */
export function prescriptionLine(r: RailExercise, store: Store, date: string): string {
  const shape = setShape(r);
  const sets = r.schemeRowCount ?? r.rowCount;
  if (r.suggestion && shape.kind === "straight") return `${shape.sets}×${shape.reps} · ${shape.kg} kg`;
  if (r.suggestion && shape.kind === "ladder") return `${shape.kgs.length}×${shape.reps} · ${shape.kgs.join(" / ")} kg`;
  if (r.suggestion && shape.kind === "top_set") {
    return `${sets} sets · top set ${shape.kg} kg × ${shape.reps}`;
  }
  const dose = authoredDose(r);
  // No authored reps: say the set count rather than invent "×1".
  const parts = [dose.each ? `${sets}×${dose.each}${dose.perSide ? " each side" : ""}` : `${sets} sets`];
  if (r.isLoadable && dose.kind === "reps") {
    const last = heaviestLast(store, r.exercise.id, date);
    if (last != null) parts.push(`last ${last} kg`);
  }
  return parts.join(" · ");
}

/** The main lift's sets as chips: "77.5×5", "90×5", "102.5×5+", "5×77.5". */
export function prescriptionChips(r: RailExercise): string[] {
  const shape = setShape(r);
  if (!r.suggestion || shape.kind !== "top_set") return [];
  const ladder = [...shape.ramp, { kg: shape.kg, reps: shape.reps }].map((w) => `${w.kg} kg × ${w.reps}`);
  return shape.backoff ? [...ladder, `back-offs ${shape.backoff.sets} × ${shape.backoff.kg} kg`] : ladder;
}

export function authoredDose(r: RailExercise): {
  kind: "hold" | "minutes" | "reps";
  each: string;
  perSide: boolean;
} {
  const d = (r.exercise.default ?? {}) as Record<string, unknown>;
  const num = (k: string): number | null => {
    const v = (r.item as Record<string, unknown> | undefined)?.[k] ?? d[k];
    return typeof v === "number" ? v : null;
  };
  const perSide = d.per_side === true;
  const hold = num("hold_seconds");
  const reps = num("reps");
  if (hold != null && reps == null) return { kind: "hold", each: `${hold} s hold`, perSide };
  const minutes = num("minutes_per_set") ?? num("minutes");
  if (minutes != null && reps == null) return { kind: "minutes", each: `${minutes} min`, perSide };
  return { kind: "reps", each: reps == null ? "" : String(reps), perSide };
}

/** What set N is for: "Set", "Top set", "Back-off", "Extra set". */
export function setRole(r: RailExercise, index: number): "Set" | "Top set" | "Back-off" | "Extra set" {
  if (r.schemeRowCount != null && index >= r.schemeRowCount) return "Extra set";
  const shape = setShape(r);
  if (!r.suggestion || shape.kind !== "top_set") return "Set";
  const rows = prescriptionRows(r.suggestion, r.schemeRowCount ?? r.rowCount);
  const top = rows.findIndex((row) => row != null && row.kg === shape.kg && row.reps === shape.reps);
  if (index === top) return "Top set";
  if (top >= 0 && index > top) return "Back-off";
  return "Set";
}

/**
 * "Last time" against the RIGHT set (strength-coach review, 2026-10-28).
 *
 * It compared same-index rows, so set 1 at 77.5 kg read "Last time 101 × 5" —
 * last session's top set. A top set is compared with last session's heaviest
 * set; any other set with a set at the same weight; otherwise nothing, because
 * a wrong number is worse than none.
 */
export function lastComparison(
  store: Store,
  r: RailExercise,
  index: number,
  date: string,
  targetKg: number | null,
): string | null {
  const last = lastSessionFor(store, r.exercise.id, date);
  if (!last) return null;
  const made = last.sets.filter((s) => s.reps != null && s.reps > 0);
  if (!made.length) return null;
  const when = shortDate(last.date, date);
  if (!r.isLoadable) {
    const s = made[index] ?? made[made.length - 1];
    return s.seconds != null ? `Last time · ${when} · ${s.seconds} s` : `Last time · ${when} · ${s.reps} reps`;
  }
  if (setRole(r, index) === "Top set") {
    const top = made.reduce((a, b) => ((b.weight_kg ?? 0) > (a.weight_kg ?? 0) ? b : a));
    return top.weight_kg != null ? `Last top set · ${when} · ${top.weight_kg} kg × ${top.reps}` : null;
  }
  if (targetKg == null) return null;
  const same = made.find((s) => s.weight_kg === targetKg);
  return same ? `Last time at ${targetKg} kg · ${when} · ${same.reps} reps` : null;
}

function heaviestLast(store: Store, exerciseId: string, date: string): number | null {
  const last = lastSessionFor(store, exerciseId, date);
  const kgs = (last?.sets ?? []).map((s) => s.weight_kg ?? 0).filter((w) => w > 0);
  return kgs.length ? Math.max(...kgs) : null;
}

/** "Mon" within the last six days, else "12 Oct". */
export function shortDate(iso: string, today: string): string {
  const d = new Date(iso + "T12:00:00");
  const days = Math.round((new Date(today + "T12:00:00").getTime() - d.getTime()) / 864e5);
  return days >= 0 && days <= 6
    ? d.toLocaleDateString("en-GB", { weekday: "short" })
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
