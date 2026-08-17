"use client";

import { useState } from "react";
import { useStore } from "@/lib/useStore";
import type { OnboardingStep } from "@/lib/schemas";

type LifeLoadStepPayload = Extract<OnboardingStep, { kind: "life_load" }>;

/**
 * B3 primitive. Explains life-load and captures a first 0-10 value.
 *
 * Consent-first: life_load is a self-reported general-stress signal, NOT
 * Article 9 medical data. Persisted only when the user picks a value. Skipping
 * the step writes nothing.
 */
export function LifeLoadStep({ step, onWritten }: { step: LifeLoadStepPayload; onWritten: string }) {
  const setDaySymptoms = useStore((s) => s.setDaySymptoms);
  const existing = useStore((s) => s.store.logs[onWritten]?.symptoms ?? null);
  const [value, setValue] = useState<number | null>(existing?.life_load ?? null);

  const handlePick = (n: number) => {
    setValue(n);
    if (!step.write_on_complete) return;
    const symptoms = { ...(existing ?? {}), life_load: n };
    // Preserve any existing derived_state — don't overwrite based on life_load alone.
    const derived = useStore.getState().store.logs[onWritten]?.derived_state ?? null;
    setDaySymptoms(onWritten, symptoms, derived);
  };

  return (
    <div className="space-y-4 text-center">
      <h2 id="onboarding-title" className="text-2xl font-semibold text-strong tracking-tight">
        {step.title}
      </h2>
      <p className="text-[13px] text-muted whitespace-pre-line">{step.body_md}</p>
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: 11 }).map((_, n) => {
          const isActive = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => handlePick(n)}
              aria-label={`Life-load ${n} out of 10`}
              aria-pressed={isActive}
              className={
                isActive
                  ? "aspect-square rounded font-mono text-base font-semibold bg-bronze text-ground"
                  : n >= 7
                    ? "aspect-square rounded font-mono text-base font-semibold border border-red/40 text-red hover:bg-red/10"
                    : n >= 4
                      ? "aspect-square rounded font-mono text-base font-semibold border border-amber/40 text-amber hover:bg-amber/10"
                      : "aspect-square rounded font-mono text-base font-semibold border border-line text-muted hover:bg-surface-2 hover:text-ink"
              }
            >
              {n === 0 ? "—" : n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
