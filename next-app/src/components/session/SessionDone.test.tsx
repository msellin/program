import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SessionDone, summarizeSession } from "./SessionDone";
import type { RailExercise } from "./DaySession";
import { bestSetOfSession, nextPlanned } from "./done/session-stats";

vi.mock("@/lib/data-loader", () => ({
  loadProgram: vi.fn().mockResolvedValue({ symptom_regions: [] }),
}));

const rail = [
  { key: "b:pullup", exercise: { id: "pullup", name: "Pull-up" }, isLoadable: false, rowCount: 3 },
] as unknown as RailExercise[];

afterEach(() => cleanup());

describe("Stop is not Finish", () => {
  it("summarizes only logged sets", () => {
    const logs = { "2026-10-27": { exercises: { "b:pullup": { sets: [{ reps: 5 }, { reps: null }] } } } };
    const s = summarizeSession(rail, logs as never, "2026-10-27");
    expect(s.totalSets).toBe(1);
  });

  it("same-named variants stay distinguishable", () => {
    const r = ["incline, easy", "horizontal", "feet elevated"].map((variant, i) => ({
      key: `b${i}:row${i}`,
      exercise: { id: `row${i}`, name: "Ring row", variant },
      isLoadable: false,
      rowCount: 1,
    })) as unknown as RailExercise[];
    const logs = { d: { exercises: Object.fromEntries(r.map((x) => [x.key, { sets: [{ reps: 8 }] }])) } };
    const names = summarizeSession(r, logs as never, "d").movements.map((m) => m.name);
    expect(new Set(names).size).toBe(3);
    expect(names[1]).toBe("Ring row (horizontal)");
  });

  it("Finish shows Done with no symptom prompt", () => {
    render(<SessionDone end="finished" rail={rail} date="2026-10-27" slug="first-strict-pullup" />);
    expect(screen.getByRole("heading", { name: "Session done" })).toBeTruthy();
    expect(screen.queryByText(/Where did it hurt/)).toBeNull();
    expect(screen.getByRole("link", { name: "Back to Today" })).toBeTruthy();
    expect(screen.queryByText(/Continue/)).toBeNull();
  });

  it("Stop shows a stopped screen with a symptom prompt", () => {
    render(<SessionDone end="stopped" rail={rail} date="2026-10-27" slug="first-strict-pullup" />);
    expect(screen.getByRole("heading", { name: "Session stopped" })).toBeTruthy();
    expect(screen.getByText(/Where did it hurt/)).toBeTruthy();
    expect(screen.queryByText(/Continue/)).toBeNull();
  });
});

describe("session payoff", () => {
  const prog = (b: Partial<{ id: string }> = {}) => ({ id: "pullup", ...b });
  const r = [
    { key: "b:pullup", exercise: prog(), isLoadable: false, rowCount: 1 },
  ] as unknown as RailExercise[];
  const day = (reps: number) => ({ exercises: { "b:pullup": { done: true, sets: [{ weight_kg: null, reps }] } } });

  it("marks a PB only when earlier history exists and is beaten", () => {
    const logs = { "2026-10-20": day(4), "2026-10-27": day(5) };
    expect(bestSetOfSession(r, logs as never, "2026-10-27")).toMatchObject({ label: "5 reps", isPB: true });
  });

  it("no PB without history, or when not beaten", () => {
    expect(bestSetOfSession(r, { "2026-10-27": day(5) } as never, "2026-10-27")?.isPB).toBe(false);
    const logs = { "2026-10-20": day(6), "2026-10-27": day(5) };
    expect(bestSetOfSession(r, logs as never, "2026-10-27")?.isPB).toBe(false);
  });

  it("a failed prior attempt does not block a PB; nothing lifted gives null", () => {
    const logs = {
      "2026-10-20": { exercises: { "b:pullup": { done: true, sets: [{ weight_kg: null, reps: 9, failed: true }, { weight_kg: null, reps: 4 }] } } },
      "2026-10-27": day(5),
    };
    expect(bestSetOfSession(r, logs as never, "2026-10-27")?.isPB).toBe(true);
    expect(bestSetOfSession(r, {} as never, "2026-10-27")).toBeNull();
  });

  it("omits next session when none planned; shows it when planned", () => {
    expect(nextPlanned({}, "p", "2026-10-27")).toBeNull();
    const sb = { a: { program_slug: "p", state: "planned", actual_date: "2026-10-29", block_template_id: "x" } };
    expect(nextPlanned(sb as never, "p", "2026-10-27")).toEqual({ date: "2026-10-29", blockId: "x" });
  });

  it("renders no PB / ladder / next cards without data", () => {
    render(<SessionDone end="finished" rail={r} date="2026-10-27" slug="first-strict-pullup" />);
    expect(screen.queryByLabelText("Next session")).toBeNull();
    expect(screen.queryByLabelText("Your level")).toBeNull();
    expect(screen.queryByText("New personal best")).toBeNull();
  });
});
