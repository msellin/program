"use client";

import { useEffect, useRef, useState } from "react";
import { BottomSheet } from "@/components/session/shared/BottomSheet";
import { loadProgram } from "@/lib/data-loader";
import { regionsForProgram, type SymptomRegion } from "@/lib/symptom-regions";
import { useStore } from "@/lib/useStore";

/**
 * The programme's own symptom regions (same resolver as the morning check),
 * so a pull-up user is offered shoulder and elbow, not the hip programme's.
 * A failed load must not leave the user with no way to report pain.
 */
export function useSessionRegions(slug: string | undefined, enabled = true): SymptomRegion[] {
  const [regions, setRegions] = useState<SymptomRegion[]>([]);
  useEffect(() => {
    if (!enabled || !slug) return;
    let live = true;
    void loadProgram(slug)
      .then((prog) => {
        if (live) setRegions(regionsForProgram(prog as { symptom_regions?: string[] }));
      })
      .catch(() => {
        if (live) setRegions(regionsForProgram(null));
      });
    return () => {
      live = false;
    };
  }, [slug, enabled]);
  return regions;
}

/**
 * Where a hurt is recorded in-session: score 5 = AMBER (`deriveState` reds at
 * peak > 5). A single tap with no severity cannot claim the day is unsafe;
 * the morning check remains the place to say how bad. Never weakens the gate.
 */
export const IN_SESSION_HURT_SCORE = 5;

/**
 * "Something hurt" — the always-visible chip in the session's top row opens
 * this. Note it / Skip this exercise / Stop session. It OFFERS the stop
 * (confirm-first): the engine proposes, the user decides.
 */
export function HurtSheet({
  slug,
  date,
  onClose,
  onNote,
  onSkipExercise,
  onStopSession,
}: {
  slug: string | undefined;
  date: string;
  onClose: () => void;
  onNote: () => void;
  onSkipExercise?: () => void;
  onStopSession: () => void;
}) {
  const [step, setStep] = useState<"menu" | "where" | "recorded">("menu");
  const [recorded, setRecorded] = useState<string | null>(null);
  const regions = useSessionRegions(slug, step === "where");
  const reportInSessionSymptom = useStore((s) => s.reportInSessionSymptom);
  const titleRef = useRef<HTMLHeadingElement>(null);
  // Moving on to the next step replaces the control that had focus.
  useEffect(() => {
    if (step !== "menu") titleRef.current?.focus();
  }, [step]);

  return (
    <BottomSheet surface="HurtSheet" titleId="hurt-title" onClose={onClose}>
      <h2
        id="hurt-title"
        ref={titleRef}
        tabIndex={-1}
        className="mb-3 text-[16px] font-semibold tracking-[-.015em] text-strong outline-none"
      >
        {step === "menu" ? "Something hurt" : step === "where" ? "Where did it hurt?" : "Recorded"}
      </h2>
      <p role="status" className="sr-only">
        {step === "recorded" ? `Recorded: ${recorded}.` : ""}
      </p>
      {step === "menu" ? (
        <div className="space-y-2 p-1">
          <MenuButton onClick={() => setStep("where")}>Record where it hurts</MenuButton>
          <MenuButton onClick={onNote}>Note it</MenuButton>
          {onSkipExercise ? <MenuButton onClick={onSkipExercise}>Skip this exercise</MenuButton> : null}
          <button
            type="button"
            onClick={onStopSession}
            className="min-h-[48px] w-full rounded bg-amber px-4 py-3 text-sm font-semibold text-ground"
          >
            Stop session
          </button>
        </div>
      ) : step === "where" ? (
        <div className="space-y-2 p-1">
          <p className="text-sm text-muted">Where? This goes on today&rsquo;s record.</p>
          {regions.map((r) => (
            <MenuButton
              key={r.id}
              onClick={() => {
                reportInSessionSymptom(date, r.id, IN_SESSION_HURT_SCORE);
                setRecorded(r.label.toLowerCase());
                setStep("recorded");
              }}
            >
              {r.label}
            </MenuButton>
          ))}
          {regions.length === 0 ? <p className="text-sm text-muted">Loading…</p> : null}
        </div>
      ) : (
        <div className="space-y-3 p-1">
          <p className="text-sm text-ink">
            Recorded — {recorded}. Today&rsquo;s readiness has been updated, so tomorrow&rsquo;s
            session already knows.
          </p>
          <p className="text-sm text-muted">
            You agreed at intake to stop rather than train through it. That is still the advice.
          </p>
          <button
            type="button"
            onClick={onStopSession}
            className="min-h-[48px] w-full rounded bg-bronze px-4 py-3 text-sm font-semibold text-ink-inverse"
          >
            Stop session
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] w-full rounded border border-line-soft px-4 py-3 text-sm"
          >
            Keep going
          </button>
        </div>
      )}
    </BottomSheet>
  );
}

function MenuButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[48px] w-full items-center justify-between rounded border border-line-soft px-3 py-3 text-left text-sm active:bg-line-soft/50"
    >
      <span>{children}</span>
      <span aria-hidden className="text-muted">›</span>
    </button>
  );
}
