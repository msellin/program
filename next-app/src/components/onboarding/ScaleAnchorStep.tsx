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
 */
export function ScaleAnchorStep({ step }: { step: ScaleAnchorStepPayload }) {
  return (
    <div className="space-y-4 text-center">
      <h2 id="onboarding-title" className="text-2xl font-semibold text-strong tracking-tight">
        {step.title}
      </h2>
      <p className="text-[13px] text-muted whitespace-pre-line">{step.body_md}</p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
        How the scale reads
      </p>
      <ul className="grid grid-cols-3 gap-2 text-left">
        <li className="rounded bg-line-soft/40 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate">0-3</p>
          <p className="text-[13px] text-strong mt-0.5">{step.anchors.low}</p>
        </li>
        <li className="rounded bg-line-soft/40 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-amber">4-6</p>
          <p className="text-[13px] text-strong mt-0.5">{step.anchors.mid}</p>
        </li>
        <li className="rounded bg-line-soft/40 p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-red">7-10</p>
          <p className="text-[13px] text-strong mt-0.5">{step.anchors.high}</p>
        </li>
      </ul>
      <p className="text-[11px] text-muted italic">
        You'll see this when you log a session — nothing to pick right now.
      </p>
    </div>
  );
}
