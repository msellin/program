"use client";

import type { OnboardingStep } from "@/lib/schemas";

type ScaleAnchorStepPayload = Extract<OnboardingStep, { kind: "scale_anchor" }>;

/**
 * B3 primitive. Explains the 0-10 scale used across log inputs and morning
 * checks. Information-only — nothing is written. The three anchors ({low, mid,
 * high}) come from the program JSON so the wording can match each program's
 * domain (rehab uses "wrecked / mild / severe"; strength uses "fresh / gritty
 * / cooked").
 *
 * The tiles used to look like buttons — founder reported clicking them and
 * nothing happening. Softened to non-interactive info cards, added the
 * "How the scale reads" label so the intent is clear.
 *
 * The bands are the gate's, never the reverse (G-12): `deriveState` goes amber
 * at 4 and red above 5. They read 4-6 / 7-10 until 2026-10-30, so a new user
 * learned that a 6 was amber on the screen that teaches the scale.
 * `ScaleAnchorStep.test.ts` pins each band against `deriveState`.
 */
export const SCALE_BANDS = {
  low: [0, 3],
  mid: [4, 5],
  high: [6, 10],
} as const;

const band = ([a, b]: readonly [number, number]) => `${a}-${b}`;

export function ScaleAnchorStep({ step }: { step: ScaleAnchorStepPayload }) {
  return (
    <div className="space-y-4 text-center">
      <h2 id="onboarding-title" className="text-h2 text-strong tracking-tight">
        {step.title}
      </h2>
      <p className="text-small text-muted whitespace-pre-line">{step.body_md}</p>
      <p className="text-eyebrow uppercase tracking-widest text-muted mt-1">
        How the scale reads
      </p>
      <ul className="grid grid-cols-3 gap-2 text-left">
        <li className="rounded-lg bg-line-soft/40 p-3">
          <p className="text-eyebrow uppercase tracking-widest text-slate">{band(SCALE_BANDS.low)}</p>
          <p className="text-small text-strong mt-0.5">{step.anchors.low}</p>
        </li>
        <li className="rounded-lg bg-line-soft/40 p-3">
          <p className="text-eyebrow uppercase tracking-widest text-amber">{band(SCALE_BANDS.mid)}</p>
          <p className="text-small text-strong mt-0.5">{step.anchors.mid}</p>
        </li>
        <li className="rounded-lg bg-line-soft/40 p-3">
          <p className="text-eyebrow uppercase tracking-widest text-red">{band(SCALE_BANDS.high)}</p>
          <p className="text-small text-strong mt-0.5">{step.anchors.high}</p>
        </li>
      </ul>
    </div>
  );
}
