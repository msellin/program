import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { programSchema } from "@/lib/schemas";
import { useStore } from "@/lib/useStore";
import { QuickStart } from "./QuickStart";
import {
  applyNoneOfThese,
  levelCopy,
  outcomeLine,
  planStats,
  safetyQuestions,
  stripTierPrefix,
} from "./quick-start-model";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
  usePathname: () => "/programs/x/intake",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/lib/announce", () => ({ announce: vi.fn() }));

const dataDir = path.join(process.cwd(), "public", "data", "programs");
function load(slug: string) {
  return programSchema.parse(JSON.parse(readFileSync(path.join(dataDir, `${slug}.json`), "utf-8")));
}
const manifest = JSON.parse(readFileSync(path.join(dataDir, "manifest.json"), "utf-8")) as {
  programs: Array<Record<string, unknown> & { slug: string }>;
};
const SLUG = "first-strict-pullup";
const program = load(SLUG);
const entry = manifest.programs.find((p) => p.slug === SLUG) as never;

function renderQS() {
  return render(<QuickStart slug={SLUG} program={program} manifestEntry={entry} />);
}
function pickLevel(title: string) {
  fireEvent.click(screen.getByRole("radio", { name: new RegExp(title, "i") }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

beforeEach(() => {
  push.mockReset();
  window.localStorage.clear();
});
afterEach(cleanup);

describe("quick start: model", () => {
  it("strips the Tier X prefix and reads the condition in plain words", () => {
    expect(stripTierPrefix("Tier A — No hang yet")).toBe("No hang yet");
    const t = program.plan_tiers![0];
    expect(levelCopy(program, t).title).toBe("No hang yet");
    expect(levelCopy(program, t).reading).toMatch(/under 15/i);
  });

  it("phrases the outcome as a tendency, never a promise", () => {
    const t = program.plan_tiers![0];
    expect(outcomeLine(t, 8)).toMatch(/^Typically by week 8: /);
  });

  it("defaults days to the tier's own value, inside the program's range", () => {
    const stats = planStats(program, program.plan_tiers![3], 8);
    expect(stats.defaultDays).toBe(4);
    expect(stats.dayOptions).toEqual(["2", "3", "4", "5"]);
    expect(stats.minutes).toBe("25");
  });

  it("every plan-tier program yields a level title for every tier and no raw 'Tier X'", () => {
    for (const p of manifest.programs) {
      let prog;
      try {
        prog = load(p.slug);
      } catch {
        continue;
      }
      for (const t of prog.plan_tiers ?? []) {
        expect(levelCopy(prog, t).title).not.toMatch(/^Tier\s/i);
      }
    }
  });

  it("'None of these' sets screening answers only where a safe value exists", () => {
    const qs = safetyQuestions(load("muscle-up"));
    const out = applyNoneOfThese(qs, {});
    expect(out.acute_shoulder_injury).toBe("false");
    expect(out.cervical_radiculopathy).toBe("no");
    expect(out.elbow_tendon_pain).toBe("no");
    // Prerequisite counts have no "none": they must still be answered.
    expect(out.strict_pullup_count).toBeUndefined();
  });
});

describe("quick start: flow", () => {
  it("persists tier, consents and intake_answers in the full intake's shape", () => {
    renderQS();
    pickLevel("No hang yet");
    fireEvent.click(screen.getByRole("button", { name: "None of these" }));
    // Warn gates need no ack once everything is "no".
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    for (const box of screen.getAllByRole("checkbox")) fireEvent.click(box);
    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    const st = useStore.getState().store.user_profile?.program_states?.[SLUG];
    expect(st?.tier).toBe("tier_a_hang");
    expect(Object.values(st?.consents ?? {}).every((v) => v === true)).toBe(true);
    expect(Object.keys(st?.consents ?? {}).sort()).toEqual(
      (program.intake!.consent ?? []).map((c) => c.id).sort(),
    );
    expect(typeof st?.consents_at).toBe("number");
    expect(st?.intake_answers?.acute_shoulder_injury).toBe("false");
    expect(st?.intake_answers?.shoulder_pain_overhead).toBe("false");
    expect(st?.intake_answers?.elbow_tendon_pain).toBe("no");
    expect(st?.intake_answers?.days_per_week).toBe("3");
    expect(st?.started_at).toBeTruthy();
    expect(st?.baseline_training_maxes).toBeDefined();
    expect(push).toHaveBeenCalledWith("/");
  });

  it("a blocking gate answer still blocks and cannot be continued past", () => {
    renderQS();
    pickLevel("No hang yet");
    fireEvent.click(screen.getByRole("button", { name: "None of these" }));
    const row = screen.getByText(/acute shoulder/i).closest("li")!;
    const yes = Array.from(row.querySelectorAll("button")).find((b) => b.textContent === "Yes")!;
    fireEvent.click(yes);
    expect(screen.getByRole("alert")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Continue" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("a warning gate holds Continue until acknowledged", () => {
    renderQS();
    pickLevel("No hang yet");
    fireEvent.click(screen.getByRole("button", { name: "None of these" }));
    const row = screen.getByText(/numbness|radiat|cervical|neck/i, { selector: "p" }).closest("li")!;
    const unsure = Array.from(row.querySelectorAll("button")).find((b) => /unsure/i.test(b.textContent ?? ""))!;
    fireEvent.click(unsure);
    const cont = screen.getByRole("button", { name: "Continue" }) as HTMLButtonElement;
    expect(cont.disabled).toBe(true);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(cont.disabled).toBe(false);
  });

  it("'None of these' passes every gate, so Continue is enabled", () => {
    renderQS();
    pickLevel("No hang yet");
    const cont = () => screen.getByRole("button", { name: "Continue" }) as HTMLButtonElement;
    expect(cont().disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "None of these" }));
    expect(cont().disabled).toBe(false);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
