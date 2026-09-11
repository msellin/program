import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { useStore } from "@/lib/useStore";
import type { Proposal, Store } from "@/lib/schemas";

/**
 * Accepting a proposal is now reversible, and it took a "before" to get there.
 *
 * `recordProposalOutcome` shipped and the undo it was written for never did.
 * It could not have: nothing recorded a prior state.
 * `training_max_provenance` keeps a source and a timestamp and NOT the value,
 * so an accepted TM bump had nothing to restore, and a tier promotion's prior
 * tier survived only inside `tier_history`.
 *
 * The capture happens in `useProposalActions` rather than in the store,
 * deliberately: every branch of that switch overwrites the thing it would need
 * to record, so by the time the store is called the old value is gone.
 *
 * Three properties worth holding:
 *
 *   1. An undo actually restores the value, not just the history row.
 *   2. An IGNORE records no reversal. It changed nothing, so offering to undo
 *      it would restore a state the user never left.
 *   3. History is MARKED, never deleted. `proposal_history` is append-only for
 *      the export path; an undo is a thing that happened.
 */
const base = (): Store =>
  ({
    version: 2,
    logs: {},
    training_maxes: { back_squat: 120, deadlift_conventional: 150 },
    cycle: { cycle_number: 1, week_in_cycle: 1 },
    user_profile: {
      active_program_id: "concurrent-strength-maintenance",
      program_states: { "concurrent-strength-maintenance": { tier: "tier_a" } },
    },
  }) as unknown as Store;

const tmProposal = {
  id: "tm-bump:test",
  kind: "tm_bump",
  lifts: [{ exerciseId: "back_squat", currentTM: 120, newTM: 125, delta: 5 }],
} as unknown as Proposal;

describe("undoing an accepted proposal", () => {
  beforeEach(() => {
    useStore.setState({ store: base(), hydrated: true } as never);
  });

  it("restores the training max the bump overwrote", () => {
    const s = useStore.getState();
    // What `useProposalActions` captures before calling setTM.
    const reversal = { training_maxes: { back_squat: 120 } };
    s.setTM("back_squat", 125, "bump");
    s.recordProposalOutcome(tmProposal, "accepted", "2026-09-11", reversal);

    expect(useStore.getState().store.training_maxes.back_squat).toBe(125);

    const what = useStore.getState().undoLastProposalOutcome();
    expect(what).toContain("back_squat");
    expect(
      useStore.getState().store.training_maxes.back_squat,
      "the bump was undone in the history but not in the training max",
    ).toBe(120);
  });

  it("removes a training max that did not exist before the accept", () => {
    // `null` means "there was none" — restoring it as 0 or leaving 125 would
    // both be wrong.
    const s = useStore.getState();
    s.setTM("bench_press", 80, "bump");
    s.recordProposalOutcome(tmProposal, "accepted", "2026-09-11", {
      training_maxes: { bench_press: null },
    });
    useStore.getState().undoLastProposalOutcome();
    expect(useStore.getState().store.training_maxes.bench_press).toBeUndefined();
  });

  it("restores a tier and drops the promotion it wrote", () => {
    const s = useStore.getState();
    s.promoteTier("concurrent-strength-maintenance", "tier_b", "retest");
    s.recordProposalOutcome(
      { id: "tier:x", kind: "tier_advance" } as unknown as Proposal,
      "accepted",
      "2026-09-11",
      { program_slug: "concurrent-strength-maintenance", tier: "tier_a" },
    );
    const promoted = useStore.getState().store.user_profile!.program_states!;
    expect(promoted["concurrent-strength-maintenance"].tier).toBe("tier_b");
    expect(promoted["concurrent-strength-maintenance"].tier_history?.length).toBe(1);

    useStore.getState().undoLastProposalOutcome();
    const after = useStore.getState().store.user_profile!.program_states!;
    expect(after["concurrent-strength-maintenance"].tier).toBe("tier_a");
    expect(
      after["concurrent-strength-maintenance"].tier_history ?? [],
      "an undone promotion must not leave a promotion on the record",
    ).toHaveLength(0);
  });

  it("an ignore records no reversal and is not undoable", () => {
    const s = useStore.getState();
    s.recordProposalOutcome(tmProposal, "ignored", "2026-09-11", {
      training_maxes: { back_squat: 120 },
    });
    const h = useStore.getState().store.proposal_history ?? [];
    expect(h).toHaveLength(1);
    expect(h[0].reversal, "an ignore changed nothing — there is nothing to reverse").toBeUndefined();
    expect(useStore.getState().undoLastProposalOutcome()).toBeNull();
  });

  it("marks the entry undone rather than deleting it", () => {
    const s = useStore.getState();
    s.recordProposalOutcome(tmProposal, "accepted", "2026-09-11", {
      training_maxes: { back_squat: 120 },
    });
    useStore.getState().undoLastProposalOutcome();
    const h = useStore.getState().store.proposal_history ?? [];
    expect(h, "proposal_history is append-only for the export path").toHaveLength(1);
    expect(h[0].undone_at).toBeGreaterThan(0);
  });

  it("will not undo the same entry twice", () => {
    const s = useStore.getState();
    s.setTM("back_squat", 125, "bump");
    s.recordProposalOutcome(tmProposal, "accepted", "2026-09-11", {
      training_maxes: { back_squat: 120 },
    });
    expect(useStore.getState().undoLastProposalOutcome()).toBeTruthy();
    expect(
      useStore.getState().undoLastProposalOutcome(),
      "a second undo would restore a value from before the first",
    ).toBeNull();
    expect(useStore.getState().store.training_maxes.back_squat).toBe(120);
  });

  it("returns null with nothing to undo", () => {
    expect(useStore.getState().undoLastProposalOutcome()).toBeNull();
  });
});

describe("the undo affordance reaches the user", () => {
  const read = (rel: string) =>
    fs.readFileSync(path.resolve(process.cwd(), "src", rel), "utf8");

  it("the accept path captures a reversal BEFORE it mutates", () => {
    // The whole reason this was impossible: by the time the store is called,
    // every branch has already overwritten what it would need to record.
    const src = read("lib/proposals/useProposalActions.ts");
    const capture = src.indexOf("const reversal");
    const firstMutation = src.indexOf("switch (proposal.kind)");
    expect(capture, "no reversal captured on accept").toBeGreaterThan(-1);
    expect(
      capture < firstMutation,
      "the capture must precede the switch, or it records post-change values",
    ).toBe(true);
    expect(src).toContain('recordProposalOutcome(proposal, "accepted", date, reversal)');
  });

  it("the stack offers Undo, as a status rather than an alert", () => {
    const src = read("components/workout/ProposalStack.tsx");
    expect(src).toContain('role="status"');
    expect(src).toContain("undoLastProposalOutcome");
  });

  it("the toast survives the stack collapsing to empty", () => {
    // Accepting the LAST proposal empties the stack, which is exactly when the
    // undo is wanted. An early `return null` there would hide it.
    const src = read("components/workout/ProposalStack.tsx");
    expect(src).toContain("if (proposals.length === 0) return undoToast;");
  });
});
