"use client";

import type { OnboardingStep } from "@/lib/schemas";

type CustomCopyStepPayload = Extract<OnboardingStep, { kind: "custom_copy" }>;

/**
 * B3 primitive. Escape hatch — any step that doesn't fit the other four
 * primitives renders as a title + free-form body. Writes nothing.
 *
 * Prefer a purpose-built primitive when a pattern repeats across programs.
 */
export function CustomCopyStep({ step }: { step: CustomCopyStepPayload }) {
  return (
    <div className="space-y-4 text-center">
      <h2 id="onboarding-title" className="text-2xl font-semibold text-strong tracking-tight">
        {step.title}
      </h2>
      <p className="text-[14px] text-muted whitespace-pre-line leading-relaxed">
        {step.body_md}
      </p>
    </div>
  );
}
