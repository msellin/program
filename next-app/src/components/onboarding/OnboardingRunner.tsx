"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/useStore";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useSession } from "@/lib/supabase/session";
import { loadProgram } from "@/lib/data-loader";
import { today as todayISO } from "@/lib/utils";
import type { Program, OnboardingStep } from "@/lib/schemas";
import { ScaleAnchorStep } from "./ScaleAnchorStep";
import { LifeLoadStep } from "./LifeLoadStep";
import { SymptomPrimerStep } from "./SymptomPrimerStep";
import { ScanAnchorStep } from "./ScanAnchorStep";
import { CustomCopyStep } from "./CustomCopyStep";
import { FallbackStep } from "./FallbackStep";

/**
 * B3 (Phase 4). Replaces the hardcoded hip-only Onboarding component.
 *
 * Reads `program.onboarding_steps[]` from the active program's JSON and
 * renders each step in sequence via a primitive component per `.kind`.
 * When a program declares no steps, shows the shared `<FallbackStep>` — never
 * silent, never zero.
 *
 * Consent-first: no step writes symptom data. LifeLoadStep is the only step
 * that writes anything, and it only writes `life_load` (a self-reported
 * 0-10 stress signal, not medical). The old `setDaySymptoms` write on hip
 * completion is gone — symptom capture lives on /check.
 *
 * Per-program dismissal: localStorage key = `program.onboarding.done.<slug>`.
 * Switching programs replays the new program's onboarding once.
 */
export function OnboardingRunner() {
  const session = useSession();
  const hydrated = useStore((s) => s.hydrated);
  const activeSlug = useStore((s) => s.store.user_profile?.active_program_id);
  const [dismissed, setDismissed] = useState(true);
  const [program, setProgram] = useState<Program | null>(null);
  const [step, setStep] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const isAuthed = session.status === "authenticated";
  const dismissKey = activeSlug ? `program.onboarding.done.${activeSlug}` : null;

  useEffect(() => {
    if (typeof window === "undefined" || !dismissKey) return;
    setDismissed(localStorage.getItem(dismissKey) === "1");
    setStep(0);
  }, [dismissKey]);

  useEffect(() => {
    let cancelled = false;
    if (!activeSlug || dismissed || !isAuthed || !hydrated) return;
    loadProgram(activeSlug).then((p) => {
      if (!cancelled) setProgram(p);
    });
    return () => {
      cancelled = true;
    };
  }, [activeSlug, dismissed, isAuthed, hydrated]);

  const dismiss = () => {
    if (!dismissKey) return;
    try {
      localStorage.setItem(dismissKey, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  const active = hydrated && isAuthed && !dismissed && program != null;
  useFocusTrap(panelRef, dismiss, active);

  if (!active || !program) return null;

  const steps: OnboardingStep[] = program.onboarding_steps ?? [];
  const usingFallback = steps.length === 0;
  const totalSteps = usingFallback ? 1 : steps.length;
  const current = usingFallback ? null : steps[step];
  const isLast = step >= totalSteps - 1;

  const advance = () => {
    if (isLast) dismiss();
    else setStep(step + 1);
  };

  // M5 fix (2026-08-17): z-[60] beats the z-50 baseline used by ConfirmSheet,
  // InfoSheet, VideoModal, ExerciseDetailsSheet, SessionActions sheets.
  // OnboardingRunner is the "app is unusable until dismissed" modal on fresh
  // signup and must always win the z-race — prevents the IntroGallery-ate-
  // OnboardingRunner-clicks class of bug from recurring.
  //
  // M9 fix (2026-08-17): items-start + overflow-y-auto on mobile so the iOS
  // soft keyboard doesn't push modal content off-screen. Desktop still
  // vertically centers via sm:items-center. Padding-top adjusted so content
  // sits closer to the top on small screens.
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-[60] bg-ground/95 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 pt-12 sm:items-center sm:pt-4"
    >
      <div ref={panelRef} className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <p className="mono-caps" aria-live="polite">
            Setup · {step + 1} of {totalSteps}
          </p>
        </div>

        {usingFallback ? (
          <FallbackStep programName={program.slug ?? "your program"} />
        ) : current?.kind === "scale_anchor" ? (
          <ScaleAnchorStep step={current} />
        ) : current?.kind === "life_load" ? (
          <LifeLoadStep step={current} onWritten={todayISO()} />
        ) : current?.kind === "symptom_primer" ? (
          <SymptomPrimerStep step={current} />
        ) : current?.kind === "scan_anchor" ? (
          <ScanAnchorStep step={current} />
        ) : current?.kind === "custom_copy" ? (
          <CustomCopyStep step={current} />
        ) : null}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={dismiss}
            className="px-4 py-3 min-h-[44px] border border-line text-strong rounded font-mono text-[11px] uppercase tracking-wider hover:bg-line-soft"
          >
            Skip setup
          </button>
          <button
            type="button"
            onClick={advance}
            className="px-6 py-3 min-h-[44px] bg-bronze text-ground rounded font-semibold text-sm hover:bg-bronze-hover"
          >
            {isLast ? "Start" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
