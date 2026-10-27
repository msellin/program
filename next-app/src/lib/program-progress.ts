import type { Program, Store } from "./schemas";
import { shiftedPhases } from "./engine/schedule";

/**
 * P-06: the one place "Week N of M · ends dd Mon" comes from. Today, Plan,
 * first-run and Programs all read this, over the WHOLE program (first phase
 * start to last phase end, with the user's shift and extension applied) —
 * never a single phase, and never the engine's tier.
 */
export type ProgramProgress = { weekN: number; totalWeeks: number; endsOn: string };

export function programProgress(
  program: Program,
  dateISO: string,
  profile?: Store["user_profile"],
): ProgramProgress | null {
  const phases = shiftedPhases(program, profile);
  const first = phases[0];
  const last = phases[phases.length - 1];
  if (!first?.starts || !last?.ends) return null;
  const day = (iso: string) => new Date(iso.slice(0, 10) + "T00:00:00").getTime();
  if (day(dateISO) < day(first.starts) || day(dateISO) > day(last.ends)) return null;
  const totalDays = Math.floor((day(last.ends) - day(first.starts)) / 864e5) + 1;
  const daysIn = Math.floor((day(dateISO) - day(first.starts)) / 864e5);
  return {
    weekN: Math.floor(daysIn / 7) + 1,
    totalWeeks: Math.max(1, Math.ceil(totalDays / 7)),
    endsOn: last.ends,
  };
}

export function endsLabel(endsOn: string): string {
  return new Date(endsOn.slice(0, 10) + "T12:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
