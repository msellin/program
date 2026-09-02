import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { RestTakeover } from "./RestTakeover";
import type { RailExercise } from "./DaySession";
import type { Exercise } from "@/lib/schemas";

vi.mock("@/lib/sound", () => ({ playTimerComplete: vi.fn(), playConfirm: vi.fn() }));
vi.mock("@/lib/announce", () => ({ announce: vi.fn() }));

const rail = (over: Partial<RailExercise> = {}): RailExercise =>
  ({
    key: "b:back_squat_highbar",
    blockId: "b",
    blockName: "Heavy",
    exercise: { id: "back_squat_highbar", name: "Back squat", category: "strength", targets: ["general"] } as Exercise,
    item: { exercise_id: "back_squat_highbar" },
    rowCount: 5,
    suggestion: { top_set: { kg: 100, reps: "5+" }, fsl: null, reasoning: "" },
    isLoadable: true,
    ...over,
  }) as RailExercise;

function renderRest(over: { upNext?: Parameters<typeof RestTakeover>[0]["upNext"]; effortAnswered?: boolean } = {}) {
  const active = rail();
  const onEffortAnswered = vi.fn();
  render(
    <RestTakeover
      active={active}
      justLoggedSetIndex={0}
      targetSeconds={120}
      railExercises={[active]}
      upNext={over.upNext ?? { kind: "set", setIndex: 1, rail: active }}
      effortAnswered={over.effortAnswered ?? false}
      onEffortAnswered={onEffortAnswered}
      date="2026-09-02"
      onDone={() => {}}
      onJump={() => {}}
      onOpenNoteSheet={() => {}}
    />,
  );
  return { onEffortAnswered };
}

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe("the effort picker", () => {
  it("asks in reps-in-reserve, not bare RPE numbers", () => {
    // Rewritten from a 3-option RPE scale: "how many more could you have done"
    // is a question a person can answer honestly mid-session; "rate 1-10" is
    // one they guess at.
    renderRest();
    // Anchored: an unanchored /easy/i matches "Very easy" too.
    for (const label of [/^very easy/i, /^easy/i, /^solid/i, /^grind/i]) {
      expect(screen.getByRole("radio", { name: label }), String(label)).toBeDefined();
    }
  });

  it("exposes the options as a radiogroup with checked state", () => {
    // The options were plain buttons — a screen reader announced four
    // unrelated controls rather than one choice with four answers.
    renderRest();
    expect(screen.getByRole("radiogroup")).toBeDefined();
    const solid = screen.getByRole("radio", { name: /solid/i });
    expect(solid.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(solid);
    expect(screen.getByRole("radio", { name: /solid/i }).getAttribute("aria-checked")).toBe("true");
  });

  it("still asks after the final set of an exercise", () => {
    // The picker sat inside the `upNext.kind !== "done"` branch, so the last
    // set of a session — the one where effort matters most for TM inference —
    // was never asked.
    renderRest({ upNext: { kind: "done" } });
    expect(screen.getByRole("radiogroup")).toBeDefined();
  });

  it("reports the answer upward so the session can move on", () => {
    const { onEffortAnswered } = renderRest();
    fireEvent.click(screen.getByRole("radio", { name: /grind/i }));
    expect(onEffortAnswered).toHaveBeenCalledWith(true);
  });
});
