"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/useStore";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useSession } from "@/lib/supabase/session";
import { today as todayISO } from "@/lib/utils";
import type { Symptoms } from "@/lib/schemas";

const DISMISS_KEY = "program.onboarding.done";

type Answers = {
  low_back: number;
  groin_left: number;
  hours_slept: number;
};

/**
 * Three-question onboarding shown only on truly fresh installs.
 * Doesn't gate access — user can dismiss any question and land on Today.
 * Saves the symptom answers to today's morning check.
 */
export function Onboarding() {
  const session = useSession();
  const hydrated = useStore((s) => s.hydrated);
  const setDaySymptoms = useStore((s) => s.setDaySymptoms);
  const [dismissed, setDismissed] = useState(true);
  const [everSeen, setEverSeen] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ low_back: 0, groin_left: 0, hours_slept: 7 });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    // Consider "ever seen" as either the onboarding-done flag OR any explicit interaction
    // (dismissed banner, etc.). If neither is set, this is a genuine first visit.
    const seen =
      localStorage.getItem(DISMISS_KEY) === "1" ||
      localStorage.getItem("program.firstrun.dismissed") === "1" ||
      // seeded from repo doesn't count as "ever seen" — user still deserves onboarding
      false;
    setEverSeen(seen);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  // Onboarding writes symptom data to the user's store — guests + loading
  // states have no store to write to. Only render for authenticated users.
  // Also fixes the guest-visits-/programs bug where the modal would pop over
  // the public catalog.
  const isAuthed = session.status === "authenticated";
  // The three questions are hip-flavoured ("low back", "hip/groin") because
  // they were authored for the anterior-hip-rebuild case. Firing this modal
  // for a fresh signup — before they've picked a program — is confusing and
  // misleading. Gate to users who explicitly picked anterior-hip-rebuild.
  const activeSlug = useStore((s) => s.store.user_profile?.active_program_id);
  const isHipProgram = activeSlug === "anterior-hip-rebuild";
  const active =
    hydrated && !dismissed && !everSeen && isAuthed && isHipProgram;
  useFocusTrap(panelRef, dismiss, active);

  const finish = (a: Answers) => {
    const symptoms: Symptoms = {
      groin_left: a.groin_left,
      low_back: a.low_back,
      buttock_left: 0,
      shoulder_right: 0,
      morning_stiffness_min: 0,
      click_present: false,
      click_painful: false,
      night_pain: false,
      gait_change: false,
    };
    const peak = Math.max(a.groin_left, a.low_back);
    const state = peak > 5 ? "red" : peak >= 4 ? "amber" : "green";
    setDaySymptoms(todayISO(), symptoms, state);
    dismiss();
  };

  if (!hydrated || dismissed || everSeen || !isAuthed || !isHipProgram) return null;

  const steps = [
    {
      key: "back" as const,
      question: "How's the low back this morning?",
      subtitle: "0 = nothing, 4 = mild, 10 = severe",
      max: 10,
      current: answers.low_back,
      set: (v: number) => setAnswers((a) => ({ ...a, low_back: v })),
    },
    {
      key: "groin" as const,
      question: "How's the left hip / groin?",
      subtitle: "Same scale.",
      max: 10,
      current: answers.groin_left,
      set: (v: number) => setAnswers((a) => ({ ...a, groin_left: v })),
    },
    {
      key: "sleep" as const,
      question: "Slept how many hours?",
      subtitle: "Tap the number, adjust with buttons.",
      max: 12,
      current: answers.hours_slept,
      set: (v: number) => setAnswers((a) => ({ ...a, hours_slept: v })),
    },
  ];

  const currentStep = steps[step];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 bg-ground/95 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div ref={panelRef} className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <p className="mono-caps">Setup · {step + 1} of {steps.length}</p>
          <h2 id="onboarding-title" className="text-2xl font-semibold text-strong tracking-tight">
            {currentStep.question}
          </h2>
          <p className="text-[13px] text-muted">{currentStep.subtitle}</p>
        </div>

        {currentStep.key === "sleep" ? (
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => currentStep.set(Math.max(0, currentStep.current - 1))}
              aria-label="Fewer hours"
              className="w-14 h-14 rounded-full border border-line text-2xl hover:bg-surface-2"
            >
              −
            </button>
            <span
              className="font-mono text-6xl font-semibold text-strong tabular-nums w-24 text-center"
              aria-live="polite"
            >
              {currentStep.current}
            </span>
            <button
              type="button"
              onClick={() => currentStep.set(Math.min(12, currentStep.current + 1))}
              aria-label="More hours"
              className="w-14 h-14 rounded-full border border-line text-2xl hover:bg-surface-2"
            >
              +
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-1.5">
            {Array.from({ length: 11 }).map((_, n) => {
              const active = n === currentStep.current;
              const label = n === 0 ? "—" : String(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => currentStep.set(n)}
                  aria-label={`Select ${n} out of 10`}
                  aria-pressed={active}
                  className={
                    active
                      ? "aspect-square rounded font-mono text-base font-semibold bg-bronze text-ground"
                      : n >= 6
                        ? "aspect-square rounded font-mono text-base font-semibold border border-red/40 text-red hover:bg-red/10"
                        : n >= 4
                          ? "aspect-square rounded font-mono text-base font-semibold border border-amber/40 text-amber hover:bg-amber/10"
                          : "aspect-square rounded font-mono text-base font-semibold border border-line text-muted hover:bg-surface-2 hover:text-ink"
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={dismiss}
            className="px-4 py-3 min-h-[44px] border border-line text-strong rounded font-mono text-[11.5px] uppercase tracking-wider hover:bg-line-soft"
          >
            Skip setup
          </button>
          <button
            type="button"
            onClick={() => {
              if (step < steps.length - 1) setStep(step + 1);
              else finish(answers);
            }}
            className="px-6 py-3 min-h-[44px] bg-bronze text-ground rounded font-semibold text-sm hover:bg-bronze-hover"
          >
            {step < steps.length - 1 ? "Next" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}
