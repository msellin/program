import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { deriveState } from "@/lib/symptom-state";
import type { Symptoms } from "@/lib/schemas";

const ROOT = path.resolve(process.cwd(), "..");
const DOC = path.join(ROOT, "dev/active/saas-launch/how-to-use-terav.md");
const src = (rel: string) => fs.readFileSync(path.resolve(process.cwd(), "src", rel), "utf8");

/**
 * The hand-out doc describes the app that exists.
 *
 * This repo already learned this lesson on the landing page: a document
 * describing the product drifts from it, nobody notices, and the drift is
 * discovered by a user. `data-integrity.test.ts` pins the landing's catalog to
 * the manifest for that reason. A one-pager handed to beta users in a gym is
 * the same risk with a shorter feedback loop and a more embarrassing failure —
 * somebody following step 4 and not finding the button.
 *
 * Only the doc's CHECKABLE claims are asserted: routes, affordances and
 * thresholds. Tone and ordering are editorial.
 */
const doc = () => fs.readFileSync(DOC, "utf8");

describe("the how-to doc exists and stays honest", () => {
  it("is there", () => {
    expect(fs.existsSync(DOC), "the one-pager is gone").toBe(true);
  });

  it("the affordances it tells people to tap all exist", () => {
    const d = doc();
    if (d.includes("Something hurt")) {
      expect(src("components/session/OverflowSheet.tsx")).toContain('label="Something hurt"');
    }
    if (d.includes("Send feedback")) {
      expect(src("app/profile/page.tsx")).toContain('href="/feedback/"');
    }
    if (d.includes("Lifts you did elsewhere")) {
      expect(src("components/offplan/OffPlanSession.tsx")).toContain("Lifts you did elsewhere");
    }
    if (/\bUndo\b/.test(d)) {
      expect(src("components/workout/ProposalStack.tsx")).toContain("undoLastProposalOutcome");
    }
  });

  it("the undo window it promises matches the code", () => {
    // The doc says six seconds. If someone shortens the toast, the doc is
    // wrong in a way a beta user will notice and nobody else will.
    const d = doc();
    const m = d.match(/(\w+) seconds on the card/);
    if (!m) return;
    const words: Record<string, number> = { four: 4, five: 5, six: 6, seven: 7, eight: 8, ten: 10 };
    const promised = words[m[1].toLowerCase()] ?? Number(m[1]);
    expect(promised, "unparsed duration in the doc").toBeGreaterThan(0);
    const stack = src("components/workout/ProposalStack.tsx");
    expect(stack, `the doc promises ${promised}s; the toast no longer uses that`).toContain(
      String(promised * 1000),
    );
  });

  it("the green / amber / red descriptions match deriveState", () => {
    /**
     * The doc's table is the thing a user will quote back at you. It must
     * agree with the ONE place the state is derived — not with a programme's
     * own authored thresholds, which are deliberately not live.
     */
    const s = (o: Partial<Symptoms>) => deriveState(o as Symptoms);

    // "Green — nothing above 3/10"
    expect(s({ shoulder: 3 } as never)).toBe("green");
    // "Amber — something is stiff or sore"
    expect(s({ shoulder: 4 } as never)).toBe("amber");
    // "Red — pain above 5/10"
    expect(s({ shoulder: 6 } as never)).toBe("red");
    // "…night pain, gait change"
    expect(s({ night_pain: true } as never)).toBe("red");
    expect(s({ gait_change: true } as never)).toBe("red");
  });

  it("the promise that nothing changes without Accept is still true", () => {
    // The doc states it twice, in bold. It is the product's whole mechanic,
    // and the one claim that would matter most if it stopped being true.
    const actions = src("lib/proposals/useProposalActions.ts");
    expect(actions).toContain("onAccept");
    expect(actions).toContain("onIgnore");
    // Nothing in the selector may mutate: proposals are chosen, never applied.
    expect(src("lib/proposals/select.ts")).not.toMatch(/\bsetTM\(|promoteTier\(|acceptDayAdjustment\(/);
  });

  it("does not promise anything the app cannot do", () => {
    const d = doc().toLowerCase();
    // Claims the landing has made at various points that the app never
    // supported. If one appears here it is drift, not copy.
    for (const overclaim of ["full training plan", "medical advice", "diagnos"]) {
      /**
       * EVERY occurrence, not the first.
       *
       * The first draft used `indexOf`, and the doc legitimately contains "it
       * is not a full training plan" near the top — so a mutation appending
       * "Terav gives you a full training plan for the whole week" passed,
       * because the guard had already found the negated one and stopped. The
       * third time today a check was satisfied by the correct instance of the
       * thing it was hunting for.
       */
      let at = d.indexOf(overclaim);
      while (at !== -1) {
        // Allowed only in a NEGATED sentence — "it will not give you medical
        // advice". The preceding clause has to say so.
        const before = d.slice(Math.max(0, at - 80), at);
        expect(
          before,
          `"${overclaim}" at index ${at} reads as a promise rather than a disclaimer`,
        ).toMatch(/not|never|wrong app|is not/);
        at = d.indexOf(overclaim, at + overclaim.length);
      }
    }
  });
});
