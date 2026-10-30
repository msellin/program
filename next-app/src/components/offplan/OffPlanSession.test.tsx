import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import { programSchema } from "@/lib/schemas";
import { today } from "@/lib/utils";
import { OffPlanSession } from "./OffPlanSession";

/**
 * M-011: on a red shoulder day the extra-session list offered dead hangs right
 * after Today said "Rest today. No hanging." The list now waits behind the
 * same hold Today reads, and opens only to record work already done.
 */
vi.mock("@/lib/sound", () => ({ playTimerComplete: vi.fn(), playConfirm: vi.fn() }));
vi.mock("@/lib/announce", () => ({ announce: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/off-plan",
}));

const read = (f: string) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, "../../../public/data", f), "utf8"));
const program = { ...programSchema.parse(read("programs/first-strict-pullup.json")), slug: "first-strict-pullup" };
const exercises = read("exercises.json").exercises as { id: string }[];
const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));

vi.mock("@/lib/data-loader", async (orig) => ({
  ...((await orig()) as Record<string, unknown>),
  loadProgram: vi.fn(async () => program),
  loadExercises: vi.fn(async () => ({ exercises, byId })),
}));

let logs: Record<string, unknown> = {};
vi.mock("@/lib/useStore", async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return {
    ...actual,
    useStore: (sel: (s: unknown) => unknown) =>
      sel({
        store: {
          version: 2,
          logs,
          training_maxes: {},
          feature_flags: { off_plan: true },
          user_profile: { active_program_id: "first-strict-pullup" },
        },
        hydrated: true,
      }),
  };
});

const dayLog = (state: "green" | "red", shoulder: number) => ({
  [today()]: { date: today(), exercises: {}, symptoms: { shoulder_right: shoulder }, derived_state: state },
});

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe("extra session on a red day", () => {
  it("leads with rest and hides the drill list until asked", async () => {
    logs = dayLog("red", 8);
    render(<OffPlanSession />);
    await waitFor(() => expect(screen.getByText("Rest today.")).toBeDefined());
    expect(screen.queryByText(/dead hang/i)).toBeNull();

    fireEvent.click(screen.getByText("Log something you already did"));
    await waitFor(() => expect(screen.queryAllByText(/hang/i).length).toBeGreaterThan(0));
  });

  it("shows the list straight away on a green day", async () => {
    logs = dayLog("green", 0);
    render(<OffPlanSession />);
    await waitFor(() => expect(screen.queryAllByText(/hang/i).length).toBeGreaterThan(0));
    expect(screen.queryByText("Rest today.")).toBeNull();
  });
});
