import { describe, it, expect } from "vitest";
import { activeExclusions, applyIntakeExclusions, exclusionNotices } from "./intake-exclusions";
import type { Program, Block, Store } from "../schemas";
import fs from "node:fs";
import path from "node:path";
import { composeBlockForUser } from "./plan-generator";

const RULE = {
  id: "elbow_current",
  question_id: "elbow_tendon_pain",
  when_value_in: ["current"],
  exclude_exercise_ids: ["mu_ring_dip_full", "mu_ring_dip_deep"],
  substitute_with: "mu_band_assisted_ring_dip",
  reason: "Ring dip work is band-assisted only while your elbow is symptomatic.",
};

const program = { slug: "muscle-up", intake_exclusions: [RULE] } as unknown as Program;
const profileWith = (answers: Record<string, string>) =>
  ({ program_states: { "muscle-up": { intake_answers: answers } } }) as unknown as Store["user_profile"];
const block = (ids: string[]): Block =>
  ({ id: "b", items: ids.map((exercise_id) => ({ exercise_id })) }) as unknown as Block;
const idsOf = (b: Block) => (b.items ?? []).map((i) => i.exercise_id);

describe("activeExclusions", () => {
  it("fires on the answer the user actually gave", () => {
    expect(activeExclusions(program, profileWith({ elbow_tendon_pain: "current" }))).toHaveLength(1);
  });

  it("stays silent for other answers to the same question", () => {
    for (const v of ["no", "resolved"]) {
      expect(activeExclusions(program, profileWith({ elbow_tendon_pain: v })), v).toEqual([]);
    }
  });

  it("stays silent when intake was never completed", () => {
    expect(activeExclusions(program, undefined)).toEqual([]);
    expect(activeExclusions(program, profileWith({}))).toEqual([]);
  });
});

describe("applyIntakeExclusions", () => {
  const rules = [RULE];

  it("replaces the deferred movements with the substitute, once", () => {
    // Both ring dips are excluded; the user should get one band-assisted dip,
    // not two — and not a session that quietly lost two movements.
    const out = applyIntakeExclusions(block(["mu_false_grip_hang", "mu_ring_dip_full", "mu_ring_dip_deep"]), rules);
    expect(idsOf(out)).toEqual(["mu_false_grip_hang", "mu_band_assisted_ring_dip"]);
  });

  it("keeps the substitute in the position of what it replaced", () => {
    const out = applyIntakeExclusions(block(["mu_ring_dip_full", "mu_false_grip_hang"]), rules);
    expect(idsOf(out)).toEqual(["mu_band_assisted_ring_dip", "mu_false_grip_hang"]);
  });

  it("does not duplicate a movement the block already programmes", () => {
    const out = applyIntakeExclusions(
      block(["mu_band_assisted_ring_dip", "mu_ring_dip_full"]), rules,
    );
    expect(idsOf(out)).toEqual(["mu_band_assisted_ring_dip"]);
  });

  it("drops without substituting when the rule names no replacement", () => {
    const bare = [{ ...RULE, substitute_with: undefined }];
    expect(idsOf(applyIntakeExclusions(block(["mu_ring_dip_full", "x"]), bare))).toEqual(["x"]);
  });

  it("returns the block untouched when nothing matches", () => {
    const b = block(["mu_false_grip_hang"]);
    expect(applyIntakeExclusions(b, rules)).toBe(b);
    expect(applyIntakeExclusions(b, [])).toBe(b);
  });

  it("leaves non-exercise rows alone", () => {
    const b = { id: "b", items: [{}, { exercise_id: "mu_ring_dip_full" }] } as unknown as Block;
    expect(applyIntakeExclusions(b, rules).items).toHaveLength(2);
  });
});

describe("exclusionNotices", () => {
  it("deduplicates so one reason is not shown twice", () => {
    expect(exclusionNotices([RULE, { ...RULE, id: "other" }])).toEqual([RULE.reason]);
  });
});

describe("deferrals reach the session the user actually sees", () => {
  /**
   * The unit above works. It was never REACHED (2026-09-06).
   *
   * `composeBlockForUser` short-circuits on `onlyIfEmpty` for any block with
   * authored items, and all three production callers pass that flag —
   * TodaySession, DaySession, OffPlanSession. Every slot block in muscle-up
   * (9/9) and first-strict-pullup (11/11) has authored items, so
   * `applyIntakeExclusions` sat below an early return and never ran in
   * production.
   *
   * Meanwhile BriefView renders the deferral notice unconditionally. A user
   * who answered `elbow_tendon_pain: "current"` saw "we defer ring dip work"
   * printed above a session containing ring dips — the exact scenario the
   * feature's own schema doc gives as its reason to exist.
   *
   * Ten unit tests passed throughout. The gap was never in the function; it
   * was in whether anything called it. That is what this asserts.
   */
  const program = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../../../public/data/programs/muscle-up.json"),
      "utf8",
    ),
  ) as Program;
  program.slug = "muscle-up"; // activeExclusions keys off program.slug
  const exercises = (
    JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../../../public/data/exercises.json"), "utf8"),
    ) as { exercises: Array<{ id: string }> }
  ).exercises;
  const drillsById = Object.fromEntries(exercises.map((e) => [e.id, e])) as never;

  const symptomaticElbow = {
    active_program_id: "muscle-up",
    program_states: { "muscle-up": { intake_answers: { elbow_tendon_pain: "current" } } },
  } as unknown as Store["user_profile"];

  const DEFERRED = ["mu_ring_dip_full", "mu_ring_dip_deep", "mu_ring_dip_negative", "mu_rto_dip"];

  it("removes the deferred movements on the PRODUCTION path (onlyIfEmpty)", () => {
    const offenders: string[] = [];
    for (const block of program.blocks) {
      const composed = composeBlockForUser(
        program,
        block,
        symptomaticElbow,
        "2026-09-06",
        drillsById,
        { onlyIfEmpty: true }, // exactly what TodaySession/DaySession/OffPlanSession pass
      );
      const ids = [
        ...(composed.items ?? []),
        ...(composed.segments ?? []).flatMap((sg) => sg.items ?? []),
      ].map((i) => i.exercise_id);
      for (const id of ids) {
        if (DEFERRED.includes(id as string)) offenders.push(`${block.id}: ${id}`);
      }
    }
    expect(
      offenders,
      "a movement the user was TOLD would be deferred is still in the session",
    ).toEqual([]);
  });

  it("leaves the session alone for a user who reported no elbow pain", () => {
    // The deferral must be caused by the ANSWER, not by the code path.
    const healthy = {
      active_program_id: "muscle-up",
      program_states: { "muscle-up": { intake_answers: { elbow_tendon_pain: "no" } } },
    } as unknown as Store["user_profile"];
    const withDips = program.blocks.some((block) => {
      const composed = composeBlockForUser(program, block, healthy, "2026-09-06", drillsById, {
        onlyIfEmpty: true,
      });
      return [
        ...(composed.items ?? []),
        ...(composed.segments ?? []).flatMap((sg) => sg.items ?? []),
      ].some((i) => DEFERRED.includes(i.exercise_id as string));
    });
    expect(withDips, "ring dip work should still be programmed for an asymptomatic user").toBe(true);
  });
});
