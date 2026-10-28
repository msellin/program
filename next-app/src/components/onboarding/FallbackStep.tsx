"use client";

/**
 * B3 fallback splash. Renders when the active program declares zero
 * `onboarding_steps`. Never leave the user with silence on first visit —
 * that was the bug that let engine-builder and concurrent-conditioning users
 * skip onboarding entirely.
 */
export function FallbackStep({ programName }: { programName: string }) {
  return (
    <div className="space-y-4 text-center">
      <h2 id="onboarding-title" className="text-h2 text-strong tracking-tight">
        Welcome to Terav.
      </h2>
      <p className="text-small text-muted leading-relaxed">
        You&apos;ve picked <span className="text-strong">{programName}</span>. Terav sharpens one
        focus at a time — sessions land on Today, you log what happens, and the engine proposes
        adjustments you Accept or say not now. Nothing changes without your call.
      </p>
      <p className="text-eyebrow text-muted italic">
        Every adjustment shows its reasoning — a log signal or a cited study.
      </p>
    </div>
  );
}
