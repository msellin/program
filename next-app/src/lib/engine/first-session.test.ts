import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { programSchema, type Store } from "../schemas";
import { emptyStore } from "../storage";
import { firstSessionOffer } from "./first-session";
import { materializeLookahead } from "./materialize-blocks";

const DATA = join(__dirname, "../../../public/data");
const load = (slug: string) =>
  programSchema.parse(JSON.parse(readFileSync(join(DATA, `programs/${slug}.json`), "utf8")));

const SLUG = "first-strict-pullup";
const TUE = "2026-10-27"; // pull-ups train Mon/Wed/Fri at every tier

function freshSignup(startedOn: string): Store {
  const store = emptyStore();
  const profile = {
    ...(store.user_profile ?? {}),
    active_program: SLUG,
    active_program_started_at: startedOn,
    program_states: { [SLUG]: { started_at: startedOn, tier: "tier_a" } },
  } as Store["user_profile"];
  const { blocks } = materializeLookahead(load(SLUG), startedOn, 56, undefined, profile);
  return { ...store, user_profile: profile, scheduled_blocks: blocks };
}

describe("firstSessionOffer (G-01)", () => {
  it("a Tuesday sign-up is offered Wednesday's session today", () => {
    const store = freshSignup(TUE);
    const onToday = Object.values(store.scheduled_blocks ?? {}).filter((b) => b.actual_date === TUE);
    expect(onToday, "fixture drifted: Tuesday should be a pull-up rest day").toEqual([]);

    const offer = firstSessionOffer(store, SLUG, TUE);
    expect(offer?.fromDate).toBe("2026-10-28");
    expect(offer?.blockTemplateIds.length).toBeGreaterThan(0);
  });

  it("no offer when today already has a session", () => {
    expect(firstSessionOffer(freshSignup("2026-10-26"), SLUG, "2026-10-26")).toBeNull();
  });

  it("no offer once a session is done or after the first week", () => {
    const store = freshSignup(TUE);
    const anyId = Object.keys(store.scheduled_blocks!)[0];
    const done = {
      ...store,
      scheduled_blocks: { ...store.scheduled_blocks, [anyId]: { ...store.scheduled_blocks![anyId], state: "done" as const } },
    };
    expect(firstSessionOffer(done, SLUG, TUE)).toBeNull();
    expect(firstSessionOffer(store, SLUG, "2026-11-03")).toBeNull();
  });

  it("no offer for a program the user has not started", () => {
    expect(firstSessionOffer(freshSignup(TUE), "muscle-up", TUE)).toBeNull();
  });
});
