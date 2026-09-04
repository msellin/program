"use client";

import { useEffect, useRef } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";

/**
 * Day redesign (2026-08-23) — shared bottom-sheet chrome for the new
 * session sheets (overflow, note, off-plan, jump). Same scrim/focus-trap/
 * escape/body-scroll-lock convention as `ConfirmSheet.tsx`, just anchored
 * to the bottom edge with the README's radius (`16px 16px 0 0`) instead
 * of ConfirmSheet's centered-on-desktop modal — matches every sheet
 * mockup (6b/6c/6d, off-plan, jump) in the design package.
 */
export function BottomSheet({
  titleId,
  onClose,
  children,
  surface,
}: {
  titleId: string;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * Component name, stamped as `data-surface` (2026-08-26). Every sheet
   * shares `role="dialog"`, so the harness could not tell one from
   * another: probing `[role="dialog"]` for the exercise-details sheet
   * read back the overflow sheet's rows, and within-surface control
   * coverage was measuring the wrong sheet. Test-only affordance; it
   * changes nothing a user sees.
   *
   * REQUIRED since 2026-09-04. It was optional, and exactly one caller
   * omitted it — NoteSheet's main variant, while its own stop-variant
   * twelve lines earlier passed one.
   *
   * The cost of that single omission: the persona harness derives a tap's
   * scope from `data-surface` and otherwise falls back to the whole PAGE.
   * NoteSheet opens from OverflowSheet, which stays mounted underneath and
   * has a "Close" of its own, so `/^Close/` matched two buttons and took
   * the one under the scrim — a 15-second actionability timeout on twelve
   * personas. The note sheet then never closed, so the overflow sheet's
   * own Close was scrimmed too: another twelve.
   *
   * Identical to the ExerciseDetailsSheet bug fixed hours earlier the same
   * day. Two instances of one mistake is the shape this repo keeps
   * producing, so the type now refuses the third.
   */
  surface: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, onClose);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-surface={surface}
      aria-labelledby={titleId}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-ground/70 flex flex-col justify-end"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[760px] mx-auto bg-surface border-t border-line-strong rounded-t-[16px] px-5 pt-[18px] pb-[calc(22px+env(safe-area-inset-bottom))] max-h-[85vh] overflow-y-auto"
      >
        {children}
      </div>
    </div>
  );
}
