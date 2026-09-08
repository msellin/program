import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const ARTIFACTS = path.resolve(__dirname, "../../../tests/e2e/artifacts/personas");

type Store = {
  proposal_history?: Array<{ kind?: string; outcome?: string; synthetic?: boolean }>;
  user_profile?: {
    capability_profile?: Record<string, unknown>;
    program_states?: Record<string, { baseline_capabilities?: Record<string, unknown> }>;
  };
};

const SIMULATOR = path.resolve(__dirname, "../../../tests/e2e/harness/simulator-v2.ts");

/**
 * Artifacts older than the harness that produced them cannot be evidence
 * about it.
 *
 * These two defects were fixed in `simulator-v2.ts` on 2026-09-08; the
 * artifacts on disk are from sweep #8, which ran before it. Asserting against
 * them would fail for the one reason that is not a defect — and a test that is
 * red for a legitimate reason gets muted, which is worse than not having it.
 *
 * So the artifact checks run only when the artifacts are NEWER than the
 * simulator. The next sweep arms them automatically.
 */
function artifactsPostdateHarness(): boolean {
  if (!fs.existsSync(ARTIFACTS) || !fs.existsSync(SIMULATOR)) return false;
  const harness = fs.statSync(SIMULATOR).mtimeMs;
  const anyStore = fs
    .readdirSync(ARTIFACTS)
    .map((p) => path.join(ARTIFACTS, p, "final-store.json"))
    .filter((f) => fs.existsSync(f));
  if (anyStore.length === 0) return false;
  return anyStore.every((f) => fs.statSync(f).mtimeMs > harness);
}

function stores(): Array<{ persona: string; store: Store }> {
  if (!fs.existsSync(ARTIFACTS)) return [];
  return fs
    .readdirSync(ARTIFACTS)
    .map((persona) => ({ persona, file: path.join(ARTIFACTS, persona, "final-store.json") }))
    .filter((x) => fs.existsSync(x.file))
    .map((x) => ({
      persona: x.persona,
      store: JSON.parse(fs.readFileSync(x.file, "utf8")) as Store,
    }));
}

/**
 * What the persona fleet is and is not evidence of.
 *
 * Two findings on 2026-09-08, both about the instrument rather than the app,
 * and both of which had been quietly weakening every sweep result quoted all
 * week:
 *
 * 1. The simulator FABRICATES proposal history. It writes a literal
 *    `{kind: "day_adjustment_soften", outcome: "ignored"}` and never invokes
 *    `selectProposals`, `selectTMBump` or `evaluateOverperformer`. All 271
 *    entries across all 23 personas were that one shape: zero accepted, zero
 *    `tm_bump`, zero `tier_advance`.
 *
 * 2. `CAPABILITY_SEEDS` covers handstand-walk and overhead-mobility, and
 *    `capability_profile` was EMPTY in all 23 stores anyway — including both
 *    of those programmes. The seed was written at setup and lost before day
 *    one, so every baseline-dependent surface went unexercised.
 *
 * The tour and flows do drive the real app in a real browser, so what RENDERS
 * is genuine. It is the simulated store that is synthetic. This test holds that
 * boundary in place: fabricated rows must stay labelled, and the seeded
 * programmes must actually carry their baselines.
 *
 * Skips cleanly when no artifacts are present — the suite must not depend on a
 * 28-minute production sweep having been run.
 */
describe("persona artifacts are honest about what they prove", () => {
  const all = stores();

  /**
   * The source-level half, which is green immediately and is what actually
   * holds the fix in place. The artifact-level checks below confirm it reached
   * production, and only once a sweep has run since.
   */
  it("the simulator labels what it fabricates and re-seeds every day", () => {
    const src = fs.readFileSync(SIMULATOR, "utf8");
    expect(src, "the fabricated proposal row must carry `synthetic: true`")
      .toContain("synthetic: true");
    expect(
      src.includes("baseline_capabilities: { ...capabilitySeed }"),
      "the capability seed must be re-applied inside the day loop — writing it " +
        "only at setup is how it came to be empty in all 23 stores",
    ).toBe(true);
  });

  it("does not invoke the real proposal engine, and says so", () => {
    // Guards the honest framing rather than a behaviour: if someone wires the
    // engine in, this fails and the comments claiming fabrication must go.
    const src = fs.readFileSync(SIMULATOR, "utf8");
    const invokes = /selectProposals|selectTMBump|evaluateOverperformer/.test(
      src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, ""),
    );
    expect(invokes, "the simulator now calls the engine — update the synthetic labelling").toBe(false);
  });

  it.runIf(artifactsPostdateHarness())("fabricated proposal rows are labelled synthetic", () => {
    const unlabelled: string[] = [];
    for (const { persona, store } of all) {
      for (const p of store.proposal_history ?? []) {
        // The simulator only ever fabricates this exact shape.
        if (p.kind === "day_adjustment_soften" && p.outcome === "ignored" && !p.synthetic) {
          unlabelled.push(persona);
          break;
        }
      }
    }
    expect(
      unlabelled,
      "these carry simulator-written proposal history with no `synthetic` flag. " +
        "An unlabelled fabricated row is indistinguishable from engine output, " +
        "which is how proposal-selection claims came to rest on a constant.",
    ).toEqual([]);
  });

  it.runIf(artifactsPostdateHarness())("a programme with a capability seed actually carries baselines", () => {
    // Mirrors CAPABILITY_SEEDS in simulator-v2.ts. If a seed is added there and
    // not here, this test says nothing — which is why the list is short and the
    // failure message names the file.
    const SEEDED = ["handstand-walk", "overhead-mobility"];
    const empty: string[] = [];
    for (const { persona, store } of all) {
      const states = store.user_profile?.program_states ?? {};
      const seededSlug = SEEDED.find((s) => s in states);
      if (!seededSlug) continue;
      const baselines = states[seededSlug]?.baseline_capabilities ?? {};
      const profile = store.user_profile?.capability_profile ?? {};
      if (Object.keys(baselines).length === 0 && Object.keys(profile).length === 0) {
        empty.push(`${persona} (${seededSlug})`);
      }
    }
    expect(
      empty,
      "CAPABILITY_SEEDS in simulator-v2.ts covers these programmes, yet the " +
        "persona finished with no baselines at all — the seed is being written " +
        "and then lost, and every baseline-dependent surface is unexercised.",
    ).toEqual([]);
  });
});
