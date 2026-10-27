import type { Block, Program, Store } from "../schemas";
import { deriveState, reasonForState } from "../symptom-state";
import { iso } from "../utils";

/**
 * G-07 (2026-10-27): red changes the day, not just a number on it.
 *
 * Before this, red cut 10% off the TM path in `suggest.ts` and nothing else:
 * a CSM user with a low-back red got the bike session unchanged and loggable.
 * Red now means HOLD — today's planned session is not offered as-is and
 * nothing progresses — plus the program's own alternative (`red_day` in the
 * program file), which is optional by construction: rest is always first.
 *
 * Nothing here decides how lenient the gate is. The state comes from the
 * logged `derived_state` (written by `deriveState` in `lib/symptom-state.ts`);
 * this file only says what a red state turns the day into.
 */

/** How far a morning check carries forward when today has none. Same rule as `suggest.ts`. */
export const CHECK_CARRY_DAYS = 3;

export function effectiveCheckState(
  logs: Store["logs"],
  todayISO: string,
): { state: "green" | "amber" | "red" | null; sourceDate: string | null } {
  const today = logs[todayISO]?.derived_state ?? null;
  if (today) return { state: today, sourceDate: todayISO };
  const t = new Date(todayISO + "T00:00:00");
  for (let back = 1; back <= CHECK_CARRY_DAYS; back++) {
    const d = new Date(t);
    d.setDate(t.getDate() - back);
    const key = iso(d);
    const s = logs[key]?.derived_state;
    if (s) return { state: s, sourceDate: key };
  }
  return { state: null, sourceDate: null };
}

export type RedDayDirective =
  | { hold: false }
  | {
      hold: true;
      /** The date whose check set the state — today, or up to 3 days back. */
      sourceDate: string;
      /** Why it is red, from `reasonForState`; null when the check row has no symptoms. */
      reason: string | null;
      /**
       * A red flag (night pain, gait change, painful click) offers rest only:
       * those are signals to talk to a clinician, not to train around.
       */
      redFlag: boolean;
      /** Rest is always the first option; this is the optional second. Null = rest only. */
      alternative: { label: string; blocks: Block[] } | null;
    };

/**
 * On red: hold today's session, and offer the program's alternative.
 * Pure — the session UI (lane 2a) and Today read this; neither re-derives red.
 */
export function redDayDirective(
  program: Program,
  logs: Store["logs"],
  todayISO: string,
): RedDayDirective {
  const { state, sourceDate } = effectiveCheckState(logs, todayISO);
  if (state !== "red" || !sourceDate) return { hold: false };

  const symptoms = logs[sourceDate]?.symptoms ?? null;
  const redFlag = !!(
    symptoms &&
    (symptoms.night_pain || symptoms.gait_change || (symptoms.click_present && symptoms.click_painful))
  );
  const reason = symptoms ? reasonForState(symptoms, deriveState(symptoms)) : null;

  const authored = program.red_day;
  let alternative: { label: string; blocks: Block[] } | null = null;
  if (authored && !redFlag) {
    const byId = new Map(program.blocks.map((b) => [b.id, b]));
    const blocks = authored.alternative_block_ids
      .map((id) => byId.get(id))
      .filter((b): b is Block => !!b);
    alternative = { label: authored.label, blocks };
  }

  return { hold: true, sourceDate, reason, redFlag, alternative };
}
