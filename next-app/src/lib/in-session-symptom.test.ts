import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { useStore } from "@/lib/useStore";
import { deriveState } from "@/lib/symptom-state";
import type { Store, Symptoms } from "@/lib/schemas";

/**
 * Pain that arrives DURING a session now has somewhere to go.
 *
 * Four programmes require the user to tick "I agree to stop the session if
 * shoulder pain appears during a hang, transition, or support hold — no
 * training through it." It is `required: true`, so nobody starts without
 * agreeing.
 *
 * Nothing could detect it. The morning check was the only symptom input and it
 * runs BEFORE the session, so the exact moment the consent is about had no way
 * to be recorded at all. Resurfacing the rule (2026-09-11, earlier) told the
 * user what they had agreed to; this is the other half — a way to say it
 * happened, and for the app to act on it.
 */
const base = (): Store =>
  ({
    version: 2,
    logs: {},
    training_maxes: {},
    cycle: { cycle_number: 1, week_in_cycle: 1 },
    user_profile: { active_program_id: "first-strict-pullup" },
  }) as unknown as Store;

const DATE = "2026-09-11";

describe("reporting a symptom mid-session", () => {
  beforeEach(() => {
    useStore.setState({ store: base(), hydrated: true } as never);
  });

  it("records the region on today's log", () => {
    useStore.getState().reportInSessionSymptom(DATE, "shoulder", 6);
    const day = useStore.getState().store.logs[DATE];
    expect((day.symptoms as Record<string, unknown>).shoulder).toBe(6);
  });

  it("the sheet reports AMBER, not red — the tap carries no severity", () => {
    /**
     * `deriveState` reds at `peak > 5` and ambers at `peak >= 4`. The sheet
     * sent 6 until it was driven in the running app, which turned the day RED
     * off a single tap that asked for no severity and was given none.
     *
     * Red is a claim this input cannot support. Amber is: something is up, the
     * plan should soften, and the rule the user agreed to gets shown so they
     * can stop if it warrants it.
     */
    const src = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/session/OverflowSheet.tsx"),
      "utf8",
    );
    expect(src, "the sheet's reported severity moved").toContain(
      "reportInSessionSymptom(date, r.id, 5)",
    );
    useStore.getState().reportInSessionSymptom(DATE, "shoulder", 5);
    expect(useStore.getState().store.logs[DATE].derived_state).toBe("amber");
  });

  it("still goes red when the score genuinely warrants it", () => {
    // The store action asserts nothing about severity — a 6 from anywhere
    // else must still read red.
    useStore.getState().reportInSessionSymptom(DATE, "shoulder", 6);
    expect(useStore.getState().store.logs[DATE].derived_state).toBe("red");
  });

  it("moves the day off green through the SAME derivation the check uses", () => {
    // Not a second threshold implementation. `deriveState` is the one place
    // green/amber/red is decided, by design — a symptom arriving later in the
    // day does not get its own rules.
    useStore.getState().reportInSessionSymptom(DATE, "shoulder", 6);
    const day = useStore.getState().store.logs[DATE];
    expect(day.derived_state).not.toBe("green");
    expect(day.derived_state).toBe(deriveState(day.symptoms as Symptoms));
  });

  it("never walks an existing score DOWN", () => {
    // A 6 reported mid-session must survive. Re-reporting the same region,
    // or a milder second report, must not erase the worse reading — that
    // would let the day recover on the strength of a later, gentler tap.
    const s = useStore.getState();
    s.reportInSessionSymptom(DATE, "shoulder", 6);
    s.reportInSessionSymptom(DATE, "shoulder", 2);
    expect(
      (useStore.getState().store.logs[DATE].symptoms as Record<string, unknown>).shoulder,
    ).toBe(6);
  });

  it("does not erase a morning check that is already recorded", () => {
    const s = useStore.getState();
    s.setDaySymptoms(DATE, { low_back: 3 } as unknown as Symptoms, "green");
    s.reportInSessionSymptom(DATE, "shoulder", 6);
    const sym = useStore.getState().store.logs[DATE].symptoms as Record<string, unknown>;
    expect(sym.low_back, "the morning answers were overwritten").toBe(3);
    expect(sym.shoulder).toBe(6);
  });

  it("stamps the instrument, like every other symptom write", () => {
    // `scale_version` exists because the check moved from sliders to a
    // four-bucket tap scale and nothing recorded which produced a row. A new
    // write path that skips it reintroduces exactly that.
    useStore.getState().reportInSessionSymptom(DATE, "shoulder", 6);
    const sym = useStore.getState().store.logs[DATE].symptoms as Record<string, unknown>;
    expect(sym.scale_version, "unstamped symptom write").toBeTruthy();
  });

  it("leaves other days alone", () => {
    const s = useStore.getState();
    s.reportInSessionSymptom(DATE, "shoulder", 6);
    expect(Object.keys(useStore.getState().store.logs)).toEqual([DATE]);
  });
});

describe("the report is reachable, and offers the stop rather than taking it", () => {
  const src = fs.readFileSync(
    path.resolve(process.cwd(), "src/components/session/OverflowSheet.tsx"),
    "utf8",
  );

  it("the in-session sheet has a way in", () => {
    expect(src).toContain('label="Something hurt"');
    expect(src).toContain("reportInSessionSymptom(");
  });

  it("offers Stop here AND Keep going", () => {
    /**
     * Confirm-first. An app that ends someone's session on their behalf has
     * stopped proposing — and the user may be mid-warm-up on an unrelated
     * lift. The recommendation is stated; the decision stays theirs.
     */
    expect(src).toContain("Stop here");
    expect(src).toContain("Keep going");
  });

  it("shows the programme's own rule at the moment it applies", () => {
    expect(src).toMatch(/agreed at intake/i);
  });

  it("offers the PROGRAMME's regions, not the whole library", () => {
    // The hip programme's four regions were once rendered to every user of
    // every programme, so a pull-up user with medial epicondylitis had no
    // elbow field and the engine read green. `regionsForProgram` is the
    // resolver the morning check uses.
    expect(src).toContain("regionsForProgram");
  });

  it("still lets you report when the programme fails to load", () => {
    // A failed fetch must not leave someone in pain with no way to say so.
    expect(src).toContain("regionsForProgram(null)");
  });
});
