import type { Program, Block, Store } from "../schemas";

type Exclusion = NonNullable<Program["intake_exclusions"]>[number];

/**
 * Which deferrals are active for this user, from their stored intake answers.
 *
 * Before this existed, `shoulder_pain_overhead` and `elbow_tendon_pain` were
 * required questions whose help text promised specific programming changes —
 * "we defer heavy negatives", "we defer ring dip work and use band-assisted dip
 * only" — and nothing read the answers. The one place `shoulder_pain_overhead`
 * appeared in the source was a set that decides which visual section of the
 * intake form it renders in.
 */
export function activeExclusions(
  program: Program,
  profile: Store["user_profile"] | undefined,
): Exclusion[] {
  const rules = program.intake_exclusions;
  if (!rules?.length) return [];
  const slug = program.slug;
  if (!slug) return [];
  const answers = profile?.program_states?.[slug]?.intake_answers;
  if (!answers) return [];
  return rules.filter((r) => {
    const answer = answers[r.question_id];
    return typeof answer === "string" && r.when_value_in.includes(answer);
  });
}

/**
 * Remove deferred movements from a block, substituting where the rule names a
 * replacement.
 *
 * Substitution matters: "defer ring dip work" that merely deletes three items
 * hands the user a thinner session with no explanation, which reads as the app
 * losing their work. The rule names what takes its place, inserted once at the
 * position of the first item it replaces so the session keeps its shape and its
 * ordering.
 *
 * Applied as a final pass in `composeBlockForUser`, after both the slot-composed
 * and the authored-item paths, so a deferral cannot be reintroduced by
 * composition.
 */
export function applyIntakeExclusions(block: Block, rules: Exclusion[]): Block {
  if (!rules.length || !block.items?.length) return block;

  const excluded = new Map<string, Exclusion>();
  for (const r of rules) {
    for (const id of r.exclude_exercise_ids) excluded.set(id, r);
  }
  if (!block.items.some((it) => it.exercise_id && excluded.has(it.exercise_id))) {
    return block;
  }

  const present = new Set(
    block.items.map((it) => it.exercise_id).filter((id): id is string => !!id),
  );
  const substitutedAlready = new Set<string>();
  const items: NonNullable<Block["items"]> = [];

  for (const it of block.items) {
    const rule = it.exercise_id ? excluded.get(it.exercise_id) : undefined;
    if (!rule) {
      items.push(it);
      continue;
    }
    const sub = rule.substitute_with;
    if (
      sub &&
      !substitutedAlready.has(sub) &&
      // Don't duplicate a movement the block already programmes on its own.
      (!present.has(sub) || excluded.has(sub))
    ) {
      substitutedAlready.add(sub);
      items.push({ ...it, exercise_id: sub });
    }
    // No substitute, or already substituted once: the item is simply dropped.
  }

  return { ...block, items };
}

/**
 * User-facing reasons for whatever was deferred, deduplicated. Surfaced on the
 * session so the change is visible — a silent substitution is indistinguishable
 * from a bug, and the whole point of the confirm-first contract is that the user
 * can see why the plan looks the way it does.
 */
export function exclusionNotices(rules: Exclusion[]): string[] {
  return [...new Set(rules.map((r) => r.reason))];
}

/**
 * Narrow a set of active rules to the ones that actually changed TODAY.
 *
 * `activeExclusions` answers "which rules does this user's intake trigger?",
 * which is a property of the user and true every day of the programme.
 * `BriefView` was rendering the notice straight off that, so a muscle-up user
 * with current elbow pain saw "Adjusted for you — ring dip work is
 * band-assisted only…" on a session containing no dip work of any kind. The
 * app claimed an adjustment it had not made.
 *
 * That is the same defect as the one this notice was built to fix, pointed the
 * other way. The original was a promise with nothing behind it (the deferral
 * never ran); this is a report of something that did not happen. Both leave
 * the user unable to trust the screen, which is the only thing confirm-first
 * rests on.
 *
 * Resolved against the AUTHORED items in `program.blocks`, because the blocks
 * the view receives have already had the exclusions applied — the deferred
 * movement is gone by then, so there is nothing left to detect.
 *
 * A block that authors no items (rowing's note-only blocks; slot-based
 * programmes that compose from `drill_library` at render time) cannot be
 * checked this way, and those rules are KEPT. Between telling a user about an
 * adjustment that did not affect today and silently withholding one that did,
 * the first is the cheaper error.
 */
export function exclusionsAffectingDay(
  program: Program,
  blockIds: string[],
  rules: Exclusion[],
): Exclusion[] {
  if (!rules.length) return [];
  // No blocks, or none that resolve against the programme, is the same
  // undecidable case as a block that authors no items: there is nothing to
  // check the rule against. Keep, per the note above — withholding an
  // adjustment the user was promised is the more expensive mistake.
  if (!blockIds.length) return rules;
  const authored = (program.blocks ?? []).filter((b) => blockIds.includes(b.id));
  if (!authored.length) return rules;
  const undecidable = authored.some((b) => !b.items?.length);
  const present = new Set(
    authored.flatMap((b) => (b.items ?? []).map((it) => it.exercise_id)).filter(Boolean),
  );
  return rules.filter(
    (r) => undecidable || r.exclude_exercise_ids.some((id) => present.has(id)),
  );
}
