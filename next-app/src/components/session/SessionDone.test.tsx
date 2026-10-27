import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { SessionDone, summarizeSession } from "./SessionDone";
import type { RailExercise } from "./DaySession";

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

  it("Finish shows Done with no symptom prompt", () => {
    render(<SessionDone end="finished" rail={rail} date="2026-10-27" slug="first-strict-pullup" />);
    expect(screen.getByRole("heading", { name: "Done" })).toBeTruthy();
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
