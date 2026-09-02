import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import CheckPage from "./page";

/**
 * The check is the highest-frequency screen in the app and, until 2026-09-02,
 * asked every user of every program about one person's hip: `groin_left`,
 * `buttock_left`, `shoulder_right`, plus two hip-labral red flags. A pull-up
 * user's elbow had nowhere to go and the engine saw green.
 *
 * Regions and flags are now declared by the program. These assert the declared
 * set actually reaches the rendered form — the part `regionsForProgram` unit
 * tests cannot see.
 */
vi.mock("@/lib/sound", () => ({ playTimerComplete: vi.fn(), playConfirm: vi.fn() }));
vi.mock("@/lib/announce", () => ({ announce: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/check",
}));

let activeSlug: string | undefined = "first-strict-pullup";
const program: Record<string, unknown> = {
  slug: "first-strict-pullup",
  symptom_regions: ["shoulder", "elbow", "low_back"],
  symptom_flags: ["night_pain"],
};

vi.mock("@/lib/data-loader", () => ({
  loadProgram: vi.fn(async () => program),
}));

vi.mock("@/lib/useStore", async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return {
    ...actual,
    useStore: (sel: (s: unknown) => unknown) =>
      sel({
        store: {
          version: 2,
          logs: {},
          training_maxes: {},
          user_profile: { active_program_id: activeSlug },
        },
        setDaySymptoms: vi.fn(),
        hydrated: true,
      }),
  };
});

beforeEach(() => {
  localStorage.clear();
  activeSlug = "first-strict-pullup";
});
afterEach(() => cleanup());

describe("the morning check asks what the program declares", () => {
  it("renders the pull-up program's regions, including the elbow", async () => {
    render(<CheckPage />);
    await waitFor(() => expect(screen.getByText("Elbow")).toBeDefined());
    expect(screen.getByText("Shoulder")).toBeDefined();
    expect(screen.getByText("Low back")).toBeDefined();
  });

  it("does not ask a pull-up user about someone else's hip", async () => {
    render(<CheckPage />);
    await waitFor(() => expect(screen.getByText("Elbow")).toBeDefined());
    for (const gone of ["Left groin", "Left buttock", "Right shoulder"]) {
      expect(screen.queryByText(gone), gone).toBeNull();
    }
  });

  it("asks about night pain, which every program declares", async () => {
    render(<CheckPage />);
    await waitFor(() => expect(screen.getByText(/woke me at night/i)).toBeDefined());
  });

  it("does not show hip-labral flags to a pull-up user", async () => {
    render(<CheckPage />);
    await waitFor(() => expect(screen.getByText("Elbow")).toBeDefined());
    expect(screen.queryByText(/shortened stride/i)).toBeNull();
    expect(screen.queryByText(/painful click/i)).toBeNull();
  });

  it("shows the hip program its own regions and flags", async () => {
    program.slug = "anterior-hip-rebuild";
    program.symptom_regions = ["groin_left", "low_back", "buttock_left", "shoulder_right"];
    program.symptom_flags = ["night_pain", "gait_change", "painful_click"];
    activeSlug = "anterior-hip-rebuild";
    render(<CheckPage />);
    await waitFor(() => expect(screen.getByText("Left groin")).toBeDefined());
    expect(screen.getByText(/shortened stride/i)).toBeDefined();
    expect(screen.getByText(/painful click/i)).toBeDefined();
    // restore for the other cases
    program.slug = "first-strict-pullup";
    program.symptom_regions = ["shoulder", "elbow", "low_back"];
    program.symptom_flags = ["night_pain"];
  });
});
