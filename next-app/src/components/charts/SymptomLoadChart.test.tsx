import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SymptomLoadChart } from "./SymptomLoadChart";
import type { DayLog, Program } from "@/lib/schemas";

/**
 * Recharts renders through a ResponsiveContainer that measures to 0x0 in
 * jsdom, so the SVG series are not assertable here. The chart's data table
 * and its aria-label summary carry the same numbers by design (P2-14), and
 * those ARE assertable — so this file tests the accessible surface, which is
 * also the one a screen-reader user and a keyboard user actually get.
 *
 * What it pins: the load axis reflects the program's declared signals. Before
 * 2026-09-03 it was three squat and four deadlift ids for everyone, so seven
 * of nine programs showed a symptom line against an empty load line.
 */

const rowingProgram = {
  slug: "rowing-2k-test-prep",
  load_signals: ["aerobic_minutes"],
} as unknown as Program;

const strengthProgram = {
  slug: "anterior-hip-rebuild",
  load_signals: ["squat_top_kg", "pull_top_kg"],
} as unknown as Program;

function day(date: string, extra: Partial<DayLog>): DayLog {
  return {
    date,
    exercises: {},
    symptoms: null,
    derived_state: null,
    notes: "",
    ...extra,
  } as DayLog;
}

describe("SymptomLoadChart load axis", () => {
  it("shows a rowing user their session minutes, not an empty barbell column", () => {
    render(
      <SymptomLoadChart
        program={rowingProgram}
        days={[
          day("2026-09-01", { runs: [{ minutes: 40 }] } as Partial<DayLog>),
        ]}
      />,
    );
    expect(screen.getByRole("columnheader", { name: /session minutes \(min\)/i })).toBeTruthy();
    expect(screen.queryByRole("columnheader", { name: /squat/i })).toBeNull();
    expect(screen.getByText("40")).toBeTruthy();
  });

  it("still shows a strength user both barbell columns", () => {
    render(
      <SymptomLoadChart
        program={strengthProgram}
        days={[
          day("2026-09-01", {
            exercises: {
              "b:back_squat_highbar": { sets: [{ weight_kg: 120, reps: 3 }] },
            } as unknown as DayLog["exercises"],
          }),
        ]}
      />,
    );
    expect(screen.getByRole("columnheader", { name: /squat top set \(kg\)/i })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: /pull top set \(kg\)/i })).toBeTruthy();
  });

  it("names the program's own load in the screen-reader summary", () => {
    render(
      <SymptomLoadChart
        program={rowingProgram}
        days={[day("2026-09-01", { runs: [{ minutes: 40 }] } as Partial<DayLog>)]}
      />,
    );
    // Recharts also emits role="img" nodes; pick the chart wrapper by its
    // summary text rather than assuming there is only one.
    const label =
      screen
        .getAllByRole("img")
        .map((el) => el.getAttribute("aria-label") ?? "")
        .find((l) => l.startsWith("Symptom vs load")) ?? "";
    expect(label).toMatch(/session minutes 40 min/i);
    expect(label).not.toMatch(/squat/i);
  });

  it("keeps the empty state when a program has neither load nor symptoms", () => {
    render(<SymptomLoadChart program={rowingProgram} days={[day("2026-09-01", {})]} />);
    expect(screen.getByText(/log a session or morning check first/i)).toBeTruthy();
  });
});

// ResponsiveContainer warns loudly at 0x0 in jsdom; the warning is expected
// and unrelated to what is asserted above.
vi.spyOn(console, "warn").mockImplementation(() => {});
