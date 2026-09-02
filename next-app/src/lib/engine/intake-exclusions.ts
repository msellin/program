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
