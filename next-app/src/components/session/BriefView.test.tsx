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

describe("the day says whether there is a top set (BUG-38)", () => {
  // Founder, 2026-10-01: Thursday's 5 × 75 kg front squat read "TODAY'S TOP
  // SET 75 × 5" above a rail line "1 × 75 kg · 5 × 75 kg" — a top set and six
  // sets, on a day with neither. This is the shape the engine actually
  // returns for a variant day: `fsl` AND `straight_sets`.
  const straight = {
    rowCount: 5,
    suggestion: { top_set: { kg: 75, reps: "5" }, fsl: { kg: 75, sets: 5, reps: 5 }, straight_sets: true, reasoning: "" },
  } as Partial<RailExercise>;
  const ladder = {
    rowCount: 3,
    suggestion: {
      top_set: { kg: 92.5, reps: "5" },
      fsl: null,
      working_sets: [
        { kg: 62.5, reps: "5" },
        { kg: 77.5, reps: "5" },
        { kg: 92.5, reps: "5" },
      ],
      reasoning: "",
    },
  } as Partial<RailExercise>;

  it("a straight-sets day reads as five sets at one weight, with no top set", () => {
    renderBrief({ rails: [rail(straight)] });
    expect(screen.getByText("5 × 75 kg")).toBeDefined();
    expect(screen.queryByText(/1 × 75 kg/)).toBeNull();
    expect(screen.queryByText(/today.s top set/i)).toBeNull();
    expect(screen.getByText(/No top set today/)).toBeDefined();
    expect(screen.getByText(/working sets/i)).toBeDefined();
  });

  it("a deload ladder reads as its three weights, with no top set", () => {
    renderBrief({ rails: [rail(ladder)] });
    expect(screen.getByText("3 sets · 62.5 / 77.5 / 92.5 kg")).toBeDefined();
    expect(screen.queryByText(/today.s top set/i)).toBeNull();
  });

  it("a 5/3/1 day still says top set, and names the back-offs", () => {
    renderBrief();
    expect(screen.getAllByText(/top set/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Then 5 × 71.5 kg.")).toBeDefined();
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

describe("optional work is visible as optional (comp-week taper)", () => {
  /**
   * Monday 2026-09-07 is the first session that renders optional FSL
   * back-offs: `block_squat_taper` holds the 5/3/1 top set and demotes the
   * five back-offs to optional. The treatment shipped with render tests on
   * SetView and NONE on BriefView, and the handover that shipped it said
   * plainly it had never been looked at in a browser.
   *
   * The founder then asked where the optional marks were on a day that had
   * none, which is how we learned the answer had never been checked on a day
   * that did.
   */
  const taperRail = () =>
    rail({
      rowCount: 6,
      suggestion: {
        top_set: { kg: 93.5, reps: "5+" },
        fsl: { kg: 71.5, sets: 5, reps: 5, optional: true },
        reasoning: "Comp week. Top set holds; the back-off is yours to take.",
      },
      optionalRows: 5,
    });

  it("says how many of the sets are optional", () => {
    renderBrief({ rails: [taperRail()] });
    expect(screen.getByText(/last 5 optional/i)).toBeTruthy();
  });

  it("does not say it on a normal day", () => {
    renderBrief({ rails: [rail()] });
    expect(screen.queryByText(/optional/i)).toBeNull();
  });

  it("marks a wholly-optional exercise Optional rather than Main", () => {
    // `requiredRowCount === 0` — every row optional. This is the goblet squat
    // and 90/90 hip switch case the founder did without knowing they were
    // optional.
    renderBrief({
      rails: [
        rail({
          exercise: exercise("goblet_squat", "Goblet squat"),
          key: "block_daily_skill:goblet_squat",
          rowCount: 3,
          optionalRows: 3,
          suggestion: undefined,
          item: { exercise_id: "goblet_squat", optional: true },
          isLoadable: true,
        }),
      ],
    });
    expect(screen.getByText("Optional")).toBeTruthy();
    expect(screen.queryByText("Main")).toBeNull();
  });

  it("still calls required work Main", () => {
    renderBrief({ rails: [rail()] });
    expect(screen.getByText("Main")).toBeTruthy();
  });
});
