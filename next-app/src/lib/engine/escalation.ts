import type { Program, Store } from "../schemas";

/**
 * The engine's mechanism for caution.
 *
 * Six programmes author an escalation rule — "three red days in a row means
 * take a full week off and consult a clinician", "persistent shoulder or
 * elbow pain > 3 days -> stop, see a clinician". Until now exactly one line
 * of code read any of them: `plan/page.tsx` pushed the string into a
 * default-collapsed accordion on `/plan`. A user could have three red days
 * and never see the rule their own programme wrote for exactly that.
 *
 * Meanwhile three consecutive GREEN days is a counted, code-resident trigger
 * (`evaluateOverperformer`) that raises a proposal to add load — and when
 * both fire, `proposals/select.ts` deletes the caution proposal and keeps the
 * optimism one. The app had a mechanism for optimism and none for caution.
 *
 * What this does NOT do is enforce. CLAUDE.md is explicit that a programme
 * declares what feeds the safety gate and not how lenient the gate is, and
 * the reason is on the record: every programme had authored its own symptom
 * thresholds, several laxer than the audited default, and making those live
 * would have put nine unreviewed threshold sets on the decision that tells
 * someone not to train. The same reasoning applies here in reverse. These six
 * rules are prose, in three different predicate shapes, none machine-
 * evaluable. Executing them would mean interpreting them, and an interpreted
 * stop-rule is a stop-rule nobody wrote.
 *
 * So: count the streak, and show the programme its own sentence at the moment
 * it applies. The engine proposes; the user decides. That is the same
 * contract as every other adaptive change in this app.
 */

/** Three, because five of the six authored rules say three. */
export const RED_STREAK_THRESHOLD = 3;

/**
 * Consecutive red days ending on `todayISO`.
 *
 * Mirrors `evaluateOverperformer`'s green-streak read deliberately — same
 * window, same "a day with no `derived_state` breaks the streak" rule — so
 * the caution signal cannot be accused of using a softer standard than the
 * optimism signal it balances. A day we cannot classify is not evidence.
 */
export function redStreak(store: Store, todayISO: string): number {
  const logs = Object.values(store.logs ?? {})
    .filter((d) => d?.date && d.date <= todayISO)
    .sort((a, b) => a.date.localeCompare(b.date));

  let streak = 0;
  for (let i = logs.length - 1; i >= 0; i--) {
    const state = logs[i]?.derived_state;
    if (state === "red") {
      streak += 1;
      continue;
    }
    // Anything else ends it — including a day with no derived_state, which
    // is unknown rather than fine.
    break;
  }
  return streak;
}

export type EscalationNotice = {
  /** The programme's own words. Never paraphrased, never synthesised. */
  text: string;
  streak: number;
};

/**
 * The authored escalation text, when the streak says it applies.
 *
 * Returns the programme's `progression_rules.escalation` verbatim. If a
 * programme authors none, this returns null rather than substituting a
 * generic warning — an app-authored stop-rule attributed to a programme is
 * exactly the kind of claim this codebase keeps having to withdraw.
 *
 * `anterior-hip-rebuild`'s rule is about three AMBER WEEKS, not red days, and
 * this does not fire on it. Better to cover five of six honestly than to
 * stretch a day-counter over a rule written about weeks.
 */
export function escalationNoticeFor(
  program: Program | undefined,
  store: Store,
  todayISO: string,
): EscalationNotice | null {
  if (!program) return null;
  const rules = (program as unknown as { progression_rules?: Record<string, unknown> })
    .progression_rules;
  const text = rules?.escalation;
  if (typeof text !== "string" || !text.trim()) return null;

  const streak = redStreak(store, todayISO);
  if (streak < RED_STREAK_THRESHOLD) return null;

  return { text: text.trim(), streak };
}
