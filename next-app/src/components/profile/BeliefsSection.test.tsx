import { describe, it, expect, vi, beforeEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { BeliefsSection } from "./BeliefsSection";
import type { Store } from "@/lib/schemas";

/**
 * The warning has to reach a screen. A plausibility check nobody sees is the
 * same as no check — and the reason this one exists is that the founder's
 * front-squat TM sat above his demonstrated single for weeks with nothing
 * anywhere saying so.
 */
const mockStore = vi.hoisted(() => ({ current: null as unknown as Store }));
vi.mock("@/lib/useStore", () => ({
  useStore: (sel: (s: { store: Store; setTrainingMax: () => void }) => unknown) =>
    sel({ store: mockStore.current, setTrainingMax: () => {} }),
}));

function storeWith(tms: Record<string, number>, sets: Array<[string, number, number]>): Store {
  const logs: Record<string, unknown> = {};
  sets.forEach(([lift, kg, reps], i) => {
    const date = `2026-08-${String(10 + i).padStart(2, "0")}`;
    logs[date] = {
      date, notes: "", symptoms: null, derived_state: null,
      exercises: { [`b:${lift}`]: { done: true, weight_kg: null, reps: null, notes: "",
        sets: [{ weight_kg: kg, reps, rpe: null }] } },
    };
  });
  return { version: 2, logs, training_maxes: tms, cycle: {} } as unknown as Store;
}

describe("BeliefsSection — training-max warnings", () => {
  beforeEach(() => {
    // Auto-cleanup is not on in this project's vitest config, so without this
    // the previous test's DOM is still mounted and a "stays silent" assertion
    // finds the PREVIOUS case's warning. It failed exactly that way once.
    cleanup();
    mockStore.current = storeWith({}, []);
  });

  it("warns when a training max is above the user's demonstrated single", () => {
    mockStore.current = storeWith({ front_squat: 110 }, [["front_squat", 80, 9]]);
    render(<BeliefsSection />);
    expect(screen.getByLabelText(/may not match your log/i)).toBeTruthy();
  });

  it("stays silent when the training max is where convention puts it", () => {
    // A warning that fires on a correct number trains the user to ignore it.
    mockStore.current = storeWith({ block_pull_midshin: 145 }, [["block_pull_midshin", 140, 5]]);
    render(<BeliefsSection />);
    expect(screen.queryByLabelText(/may not match your log/i)).toBeNull();
  });

  it("stays silent for a lift with no logged history", () => {
    mockStore.current = storeWith({ front_squat: 110 }, []);
    render(<BeliefsSection />);
    expect(screen.queryByLabelText(/may not match your log/i)).toBeNull();
  });
});
