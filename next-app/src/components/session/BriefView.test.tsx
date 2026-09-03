import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { BriefView } from "./BriefView";
import type { RailExercise } from "./DaySession";
import type { Program, Store, Exercise } from "@/lib/schemas";

vi.mock("@/lib/sound", () => ({ playTimerComplete: vi.fn(), playConfirm: vi.fn() }));
vi.mock("@/lib/announce", () => ({ announce: vi.fn() }));

const exercise = (id: string, name: string): Exercise =>
  ({ id, name, category: "strength", targets: ["general"] }) as Exercise;

const rail = (over: Partial<RailExercise> = {}): RailExercise =>
  ({
    key: `b:${over.exercise?.id ?? "back_squat_highbar"}`,
    blockId: "b",
    blockName: "Heavy",
    exercise: exercise("back_squat_highbar", "Back squat"),
    item: { exercise_id: "back_squat_highbar" },
    rowCount: 6,
    suggestion: {
      top_set: { kg: 93.5, reps: "5+" },
      fsl: { kg: 71.5, sets: 5, reps: 5 },
      reasoning: "",
    },
    isLoadable: true,
    ...over,
  }) as RailExercise;

const emptyStore = (over: Partial<Store> = {}): Store =>
  ({ version: 2, logs: {}, training_maxes: {}, ...over }) as Store;

function renderBrief(opts: {
  rails?: RailExercise[];
  program?: Partial<Program>;
  store?: Store;
} = {}) {
  const program = { slug: "anterior-hip-rebuild", name: "Hip", ...opts.program } as Program;
  render(
    <BriefView
      program={program}
      phase={null}
      activeDate="2026-09-02"
      blocks={[]}
      railExercises={opts.rails ?? [rail()]}
      store={opts.store ?? emptyStore()}
      proposals={[]}
      cycleGateProposal={null}
      onStart={() => {}}
      onSelectExercise={() => {}}
      sheet={null}
      onOpenSheet={() => {}}
      onCloseSheet={() => {}}
    />,
  );
}

afterEach(() => cleanup());

describe("the exercise rail's scheme line (BUG-29)", () => {
  it("splits a 5/3/1 day instead of claiming the top weight for every set", () => {
    // Read "6 sets · 93.5 kg" while sets 2-6 are FSL at 65-75% TM — the one
    // screen a person scans before loading a bar.
    renderBrief();
    expect(screen.getByText("1 × 93.5 kg · 5 × 71.5 kg")).toBeDefined();
    expect(screen.queryByText(/6 sets · 93\.5 kg/)).toBeNull();
  });

  it("shows one weight for a straight-sets day, where every set is at it", () => {
    renderBrief({
      rails: [rail({ rowCount: 5, suggestion: { top_set: { kg: 60, reps: "5" }, fsl: null, reasoning: "" } })],
    });
    expect(screen.getByText("5 sets · 60 kg")).toBeDefined();
  });

  it("falls back to a bare count when there is no suggestion", () => {
    renderBrief({ rails: [rail({ rowCount: 3, suggestion: null })] });
    // The hero and the rail row both render this, correctly — scope to the
    // rail row rather than loosening the assertion to "appears somewhere".
    const row = screen
      .getAllByRole("button")
      .find((b) => b.textContent?.includes("Back squat"));
    expect(row?.textContent).toContain("3 sets");
  });
});

describe("intake-driven deferrals are shown, not applied silently", () => {
  const program: Partial<Program> = {
    slug: "muscle-up",
    intake_exclusions: [
      {
        id: "elbow_current",
        question_id: "elbow_tendon_pain",
        when_value_in: ["current"],
        exclude_exercise_ids: ["mu_ring_dip_full"],
        substitute_with: "mu_band_assisted_ring_dip",
        reason: "Ring dip work is band-assisted only while your elbow is symptomatic.",
      },
    ],
  };
  const storeWith = (answer: string) =>
    emptyStore({
      user_profile: {
        program_states: { "muscle-up": { intake_answers: { elbow_tendon_pain: answer } } },
      },
    } as Partial<Store>);

  it("tells the user why the session changed", () => {
    // The intake promised this in its help text; a substitution the user cannot
    // account for reads as the plan being wrong rather than the plan listening.
    renderBrief({ program, store: storeWith("current") });
    expect(screen.getByText(/band-assisted only while your elbow is symptomatic/i)).toBeDefined();
    expect(screen.getByText(/adjusted for you/i)).toBeDefined();
  });

  it("stays quiet when the answer does not trigger a rule", () => {
    renderBrief({ program, store: storeWith("no") });
    expect(screen.queryByText(/adjusted for you/i)).toBeNull();
  });

  it("stays quiet for a user who never completed intake", () => {
    renderBrief({ program, store: emptyStore() });
    expect(screen.queryByText(/adjusted for you/i)).toBeNull();
  });
});

describe("optional work reads as offered, not owed (2026-09-03)", () => {
  const squat = () => rail();
  const optionalAccessory = () =>
    rail({
      key: "b:bulgarian_split_squat_db",
      exercise: exercise("bulgarian_split_squat_db", "Bulgarian split squat"),
      item: { exercise_id: "bulgarian_split_squat_db", optional: true },
      rowCount: 3,
      suggestion: null,
      optional: true,
    });

  it("tags a wholly-optional exercise", () => {
    renderBrief({ rails: [squat(), optionalAccessory()] });
    expect(screen.getByText("Optional")).toBeTruthy();
  });

  it("still RENDERS it — soft hide, not removal", () => {
    renderBrief({ rails: [squat(), optionalAccessory()] });
    expect(screen.getByText("Bulgarian split squat")).toBeTruthy();
  });

  it("counts only required exercises, and names the optional ones", () => {
    renderBrief({ rails: [squat(), optionalAccessory()] });
    expect(screen.getByText(/1 exercise · \+1 optional/)).toBeTruthy();
  });

  it("says how many trailing sets of a taper lift are optional", () => {
    renderBrief({ rails: [rail({ optionalRows: 5 })] });
    expect(screen.getByText(/last 5 optional/)).toBeTruthy();
  });

  it("a normal session is unchanged — no optional language anywhere", () => {
    renderBrief({ rails: [squat()] });
    expect(screen.queryByText("Optional")).toBeNull();
    expect(screen.queryByText(/optional/)).toBeNull();
  });
});
