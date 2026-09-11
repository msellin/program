import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * A required consent has to reach the user more than once.
 *
 * Four programmes make the user tick "I agree to stop the session if shoulder
 * pain appears during a hang, transition, or support hold — no training
 * through it." It is `required: true`, so nobody starts first-strict-pullup,
 * muscle-up, handstand-walk or overhead-mobility without agreeing to it.
 *
 * It was then never mentioned again. Intake consents are written at intake and
 * read nowhere afterwards — a commitment about the user's own mid-session
 * behaviour, shown to them exactly once, on the screen where they were trying
 * to get started and clicking through.
 *
 * Same shape as the escalation rule and `shoulder_pain_stops_session` before
 * it: the rule existed, was correct, and reached the user through no channel.
 * This repo has now found that pattern often enough that it deserves a guard
 * rather than another discovery.
 *
 * NOT enforcement, and the distinction matters. The app cannot detect shoulder
 * pain during a set. All four programmes declare a `shoulder` symptom region,
 * so the MORNING check can see it and the ordinary green/amber/red gate
 * applies — but the consent is specifically about pain appearing mid-session,
 * which the morning check cannot reach. An in-session symptom input is a
 * design change, not a sentence, and is logged on its own.
 */
const DATA = path.resolve(process.cwd(), "public", "data", "programs");
const PLAN = path.resolve(process.cwd(), "src", "app", "plan", "page.tsx");

type Consent = { id?: string; label?: string; required?: boolean };

function programsWithStopConsent(): Array<{ slug: string; ids: string[] }> {
  const out: Array<{ slug: string; ids: string[] }> = [];
  for (const f of fs.readdirSync(DATA)) {
    if (!f.endsWith(".json") || f === "manifest.json") continue;
    const raw = JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8")) as {
      intake?: { consent?: Consent[] };
    };
    const ids = (raw.intake?.consent ?? [])
      .filter((c) => c?.required && /stop_rule|stops_session/.test(c.id ?? ""))
      .map((c) => c.id!)
      .filter(Boolean);
    if (ids.length) out.push({ slug: f.replace(/\.json$/, ""), ids });
  }
  return out;
}

describe("required stop-rule consents are resurfaced after intake", () => {
  const withConsent = programsWithStopConsent();

  it("there are still programmes carrying one", () => {
    // Guards the guard: if the consents are renamed or removed, every
    // assertion below passes over an empty list and proves nothing.
    expect(withConsent.length, "no stop-rule consents found — has the id changed?").toBeGreaterThan(0);
  });

  it("each carries a label a user could act on", () => {
    for (const { slug } of withConsent) {
      const raw = JSON.parse(
        fs.readFileSync(path.join(DATA, `${slug}.json`), "utf8"),
      ) as { intake?: { consent?: Consent[] } };
      for (const c of raw.intake?.consent ?? []) {
        if (!/stop_rule|stops_session/.test(c.id ?? "")) continue;
        expect(c.label, `${slug}/${c.id} has no label to show`).toBeTruthy();
        expect((c.label ?? "").length, `${slug}/${c.id} label is too short to mean anything`).toBeGreaterThan(20);
      }
    }
  });

  it("Plan reads intake consent and renders it in the rules surface", () => {
    // Source-mirror: the defect is that a surface does not READ the field, and
    // a behavioural test on the component would pass while the data never
    // arrives. Losing this read is silent by construction — the accordion goes
    // on rendering the other rules.
    const src = fs.readFileSync(PLAN, "utf8");
    expect(src, "Plan no longer derives consentRules from intake.consent").toContain(
      "intake?.consent",
    );
    expect(src, "consentRules must reach the accordion, not just be computed").toMatch(
      /principles=\{\[\s*(\/\/[^\n]*\n\s*)*\.\.\.consentRules/,
    );
    expect(src, "the disclaimer must stay filtered out — it is not a training rule").toContain(
      "stop_rule|stops_session",
    );
  });
});
