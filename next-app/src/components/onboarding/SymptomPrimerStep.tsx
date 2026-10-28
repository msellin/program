"use client";

import type { OnboardingStep } from "@/lib/schemas";
import { cardClass } from "@/components/ui/Card";

type SymptomPrimerStepPayload = Extract<OnboardingStep, { kind: "symptom_primer" }>;

/**
 * B3 primitive. INFORMATION ONLY — tells the user what fields they'll be
 * asked on the morning check for rehab-adjacent programs. Writes nothing.
 *
 * This is the load-bearing consent-first fix: the old Onboarding.tsx quietly
 * called setDaySymptoms with hip fields on completion. That's Article 9
 * medical data written without an explicit opt-in step. Removed.
 * First real capture now happens on `/check` where consent copy is honest.
 */
export function SymptomPrimerStep({ step }: { step: SymptomPrimerStepPayload }) {
  return (
    <div className="space-y-4">
      <h2 id="onboarding-title" className="text-h2 text-strong tracking-tight text-center">
        {step.title}
      </h2>
      <p className="text-small text-muted whitespace-pre-line text-center">{step.body_md}</p>
      <ul className={`${cardClass()} space-y-1.5 text-left`}>
        {step.fields.map((f) => (
          <li key={f} className="text-small text-ink flex items-start gap-2">
            <span aria-hidden="true" className="text-slate mt-0.5">·</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {step.gdpr_note ? (
        <p className="text-eyebrow text-muted italic leading-snug text-center">{step.gdpr_note}</p>
      ) : null}
    </div>
  );
}
