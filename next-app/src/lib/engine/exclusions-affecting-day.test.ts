import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import type { Program } from "../schemas";
import { activeExclusions, exclusionsAffectingDay } from "./intake-exclusions";

function loadProgram(slug: string): Program {
  const p = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../../public/data/programs", `${slug}.json`),
      "utf8",
    ),
  ) as Program;
  p.slug = slug;
  return p;
}

const ELBOW_PROFILE = {
  program_states: {
    "muscle-up": { intake_answers: { elbow_tendon_pain: "current" } },
  },
} as unknown as Parameters<typeof activeExclusions>[1];

/**
 * "Adjusted for you" must describe an adjustment that happened TODAY.
 *
 * Found in the sweep #7 artifacts, not by reading code: `persona-muscleup-elbow`
 * captured a session listing hollow-body holds, a straight-arm pulldown,
 * false-grip work and band shoulder prep — no dip work of any kind — with the
 * notice "Ring dip work is band-assisted only while your elbow is symptomatic"
 * sitting above it.
 *
 * `BriefView` rendered straight off `activeExclusions`, which answers "which
 * rules does this user's intake trigger" — a property of the user, true every
 * day of the programme, not a statement about this session.
 *
 * It is the same defect the notice was built to fix, reversed. The original was
 * a promise with nothing behind it: the user was told ring dips were deferred
 * and then shown ring dips, because `applyIntakeExclusions` never ran in
 * production. This is the inverse — a report of an adjustment that did not
 * occur. Either way the user cannot take the screen at its word, and
 * confirm-first has nothing else to stand on.
 */
describe("exclusionsAffectingDay", () => {
  const program = loadProgram("muscle-up");
  const active = activeExclusions(program, ELBOW_PROFILE);

  it("the user's answer does trigger a rule", () => {
    // Guards the fixture: if this stops firing, the rest proves nothing.
    expect(active.length).toBeGreaterThan(0);
  });

  it("keeps the notice on a day that authors the deferred movement", () => {
    const withDips = (program.blocks ?? []).filter((b) =>
      (b.items ?? []).some((it) =>
        active.some((r) => r.exclude_exercise_ids.includes(it.exercise_id ?? "")),
      ),
    );
    expect(withDips.length, "fixture: no block authors a deferred movement").toBeGreaterThan(0);
    expect(
      exclusionsAffectingDay(program, withDips.map((b) => b.id), active),
    ).toHaveLength(active.length);
  });

  it("drops the notice on a day that authors none of it", () => {
    const withoutDips = (program.blocks ?? []).filter(
      (b) =>
        (b.items ?? []).length > 0 &&
        !(b.items ?? []).some((it) =>
          active.some((r) => r.exclude_exercise_ids.includes(it.exercise_id ?? "")),
        ),
    );
    expect(withoutDips.length, "fixture: every block authors a deferred movement")
      .toBeGreaterThan(0);
    expect(
      exclusionsAffectingDay(program, withoutDips.map((b) => b.id), active),
    ).toEqual([]);
  });

  it("keeps the notice when the day's blocks author no items at all", () => {
    /**
     * Rowing's blocks are note-only; slot-based programmes compose their
     * exercises from `drill_library` at render time. Neither can be checked
     * against authored items, so the rule is kept rather than dropped.
     *
     * Deliberately the less tidy of the two errors: telling a user about an
     * adjustment that did not affect today is cheaper than silently
     * withholding one that did.
     */
    const noItems = { ...program, blocks: [{ id: "block_slotted", name: "Slotted" }] } as Program;
    expect(exclusionsAffectingDay(noItems, ["block_slotted"], active)).toHaveLength(active.length);
  });

  it("returns nothing when no rule is active, whatever the day holds", () => {
    const anyBlock = (program.blocks ?? []).slice(0, 1).map((b) => b.id);
    expect(exclusionsAffectingDay(program, anyBlock, [])).toEqual([]);
  });

  it("keeps the notice when there are no blocks to check against", () => {
    // Same undecidable branch as an item-less block, and reached by the
    // BriefView unit tests, which render a rail without blocks.
    expect(exclusionsAffectingDay(program, [], active)).toHaveLength(active.length);
  });
});
