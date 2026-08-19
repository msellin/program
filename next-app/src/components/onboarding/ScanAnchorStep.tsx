"use client";

import Link from "next/link";
import type { OnboardingStep } from "@/lib/schemas";

type ScanAnchorStepPayload = Extract<OnboardingStep, { kind: "scan_anchor" }>;

/**
 * B3 primitive. For programs anchored to a movement scan or a target test date
 * (handstand-walk balance test, first-pullup dead-hang test, rowing-2k target
 * date). Explains the anchor and optionally links to the intake / test page.
 * Writes nothing.
 */
export function ScanAnchorStep({ step }: { step: ScanAnchorStepPayload }) {
  return (
    <div className="space-y-4 text-center">
      <h2 id="onboarding-title" className="text-2xl font-semibold text-strong tracking-tight">
        {step.title}
      </h2>
      <p className="text-[14px] text-muted whitespace-pre-line">{step.body_md}</p>
      {step.cta_href && step.cta_label ? (
        <Link
          href={step.cta_href}
          className="inline-block px-4 py-2 min-h-[44px] border border-bronze text-bronze rounded font-mono text-[11px] uppercase tracking-wider hover:bg-bronze/10"
        >
          {step.cta_label}
        </Link>
      ) : null}
    </div>
  );
}
