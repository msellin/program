"use client";

/**
 * One-line micro-copy shown under every notes textarea across the app.
 *
 * Terav differs from other fitness apps because the free-text notes are
 * NOT just for the user's own diary — they feed `note-signals.ts` regex
 * extractor, which produces the fatigue / pain / easy / externalLoad
 * signals that `proposedLoadMultiplier` and `evaluateOverperformer` act
 * on. Users should know this from the first tap. Sits directly under any
 * notes textarea; kept tight so it doesn't compete for attention.
 *
 * Variants let each site tune the keyword set to what's most useful for
 * that surface (session notes → "felt strong / bar felt light"; morning
 * check → "padel / hike / poor sleep"; run notes → "long / hard / easy").
 */
export function EngineReadsNotesHint({
  variant = "session",
}: {
  variant?: "session" | "check" | "run";
}) {
  const examples =
    variant === "check"
      ? "padel, hike, poor sleep"
      : variant === "run"
        ? "long, hard, easy, felt smooth"
        : "felt strong, no sleep, wrecked";
  return (
    <p className="text-[11px] text-muted mt-1 leading-snug">
      The engine reads these. Keywords like{" "}
      <em className="not-italic text-ink">{examples}</em> feed today&apos;s proposal — no LLM, just
      a keyword parser, all done on-device.
    </p>
  );
}
