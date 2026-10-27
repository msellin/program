import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { FollowAlong } from "./FollowAlong";
import { useStore } from "@/lib/useStore";
import type { FollowStep } from "@/lib/follow-along/steps";

vi.mock("@/lib/sound", () => ({ playTimerComplete: vi.fn(), playCountdownTick: vi.fn(), playConfirm: vi.fn() }));
vi.mock("@/lib/announce", () => ({ announce: vi.fn() }));

const base = {
  blockId: "block_a_home",
  cue: "Press the thigh up into your hands",
  figure: "hipflex",
  videoUrl: null,
  videoSearch: "x",
  optional: false,
} as const;

const steps: FollowStep[] = [
  { ...base, key: "block_a_home:hip_flexor_iso_seated", exerciseId: "hip_flexor_iso_seated", name: "Seated hip-flexor hold", kind: "hold", seconds: 20, reps: null, side: "L", set: 1, of: 1, setIndex: 0, restSeconds: 5 },
  { ...base, key: "block_a_home:hip_flexor_iso_seated", exerciseId: "hip_flexor_iso_seated", name: "Seated hip-flexor hold", kind: "hold", seconds: 20, reps: null, side: "R", set: 1, of: 1, setIndex: 0, restSeconds: 20 },
  { ...base, key: "block_a_home:glute_bridge_single", exerciseId: "glute_bridge_single", name: "Single-leg glute bridge", figure: "bridge", kind: "reps", seconds: null, reps: 3, side: "L", set: 1, of: 1, setIndex: 0, restSeconds: 0 },
];

function setup() {
  const updateSet = vi.fn();
  useStore.setState({ updateSet } as never);
  const onExit = vi.fn();
  render(<FollowAlong title="Home rehab" steps={steps} date="2026-10-20" onExit={onExit} />);
  return { updateSet, onExit };
}
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe("FollowAlong", () => {
  beforeEach(() => vi.useFakeTimers({ now: new Date("2026-10-20T08:00:00Z") }));
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("starts nothing on its own: the first hold waits for Start", () => {
    const { updateSet } = setup();
    advance(60_000);
    expect(screen.getByText("seconds")).toBeTruthy();
    expect(updateSet).not.toHaveBeenCalled();
  });

  it("runs Start → 3-2-1 → a 20 s hold and logs it exactly like SetView does", () => {
    const { updateSet } = setup();
    fireEvent.click(screen.getByText("Start"));
    advance(3_300); // countdown
    expect(screen.getByText("hold")).toBeTruthy();
    advance(20_500);
    expect(updateSet).toHaveBeenCalledWith(
      "block_a_home",
      "hip_flexor_iso_seated",
      0,
      { weight_kg: null, failed: false, reps: 1, seconds: 20 },
      "2026-10-20",
    );
    expect(screen.getByText("rest")).toBeTruthy();
  });

  it("never logs a skipped set, and the done screen counts only finished work", () => {
    const { updateSet } = setup();
    fireEvent.click(screen.getByText("Skip set"));
    fireEvent.click(screen.getByText("Skip set"));
    // Rep step: count two reps, then Set done.
    fireEvent.click(screen.getByText("Start"));
    advance(3_300);
    const ring = screen.getByLabelText(/Rep 0 of 3/);
    fireEvent.click(ring);
    fireEvent.click(screen.getByLabelText(/Rep 1 of 3/));
    fireEvent.click(screen.getByText("Set done"));
    expect(updateSet).toHaveBeenCalledTimes(1);
    expect(updateSet).toHaveBeenCalledWith(
      "block_a_home",
      "glute_bridge_single",
      0,
      { weight_kg: null, failed: false, reps: 2 },
      "2026-10-20",
    );
    expect(screen.getByText("Home rehab done")).toBeTruthy();
    expect(screen.getByText(/sets? logged\./)).toBeTruthy();
  });

  it("pausing a hold stops its clock", () => {
    setup();
    fireEvent.click(screen.getByText("Start"));
    advance(3_300);
    advance(5_000);
    fireEvent.click(screen.getByText("Pause"));
    const ring = () => screen.getByRole("button", { name: /^\d+ paused$/ }).getAttribute("aria-label");
    const shown = ring();
    expect(shown).toBe("15 paused");
    advance(30_000);
    expect(ring()).toBe(shown);
  });

  it("'Something hurts' ends the session and points to the symptom check", () => {
    setup();
    fireEvent.click(screen.getByText("Something hurts"));
    expect(screen.getByText("Stopped")).toBeTruthy();
    expect(screen.getByText("Log what hurt").closest("a")?.getAttribute("href")).toBe("/check");
  });

  it("Log all counts the full set in one tap (phone out of reach)", () => {
    const { updateSet } = setup();
    fireEvent.click(screen.getByText("Skip set"));
    fireEvent.click(screen.getByText("Skip set"));
    fireEvent.click(screen.getByText("Start"));
    advance(3_300);
    fireEvent.click(screen.getByText("Log all 3"));
    expect(updateSet).toHaveBeenCalledWith("block_a_home", "glute_bridge_single", 0, { weight_kg: null, failed: false, reps: 3 }, "2026-10-20");
  });
});

describe("FollowAlong done screen", () => {
  beforeEach(() => vi.useFakeTimers({ now: new Date("2026-10-20T08:00:00Z") }));
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("counts every finished set per side, across timer-completed holds and tapped rep sets", () => {
    setup();
    fireEvent.click(screen.getByText("Start"));
    advance(3_300);
    advance(20_500); // L hold completes on the clock
    fireEvent.click(screen.getByText("Skip rest"));
    fireEvent.click(screen.getByText("Skip set")); // R hold skipped
    fireEvent.click(screen.getByText("Start"));
    advance(3_300);
    fireEvent.click(screen.getByText("Log all 3")); // L bridge set, last step
    expect(screen.getByText(/sets? logged\./)).toBeTruthy();
  });
});

describe("FollowAlong during a rest", () => {
  beforeEach(() => vi.useFakeTimers({ now: new Date("2026-10-20T08:00:00Z") }));
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("Skip set skips the UPCOMING set and never un-does the one just finished", () => {
    setup();
    fireEvent.click(screen.getByText("Start"));
    advance(3_300);
    advance(20_500); // L hold done → rest
    fireEvent.click(screen.getByText("Skip set")); // skips R, lands on the bridge
    expect(screen.getByText("Single-leg glute bridge")).toBeTruthy();
    fireEvent.click(screen.getByText("Something hurts"));
    expect(screen.getByText(/1 set logged\./)).toBeTruthy();
  });
});
