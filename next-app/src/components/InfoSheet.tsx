"use client";

import { useRef } from "react";
import { useFocusTrap } from "@/lib/useFocusTrap";

/**
 * Generic bottom sheet for "read more" prose. Same interaction pattern as the
 * VideoModal and ExerciseDetailsSheet — tap outside or × to dismiss, focus is
 * trapped inside the panel.
 *
 * Used to move context strips (TM formula, evaluation-week protocol, milestone
 * targets note) off the primary reading surface without deleting them.
 */
export function InfoSheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `info-${title.replace(/\W+/g, "-")}`;
  useFocusTrap(panelRef, onClose);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-ground/85 flex items-end sm:items-center justify-center p-2 sm:p-4"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-line rounded-t-lg sm:rounded-lg w-full max-w-xl max-h-[85vh] overflow-auto"
      >
        <header className="sticky top-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-line bg-surface">
          <h3 id={titleId} className="text-[15px] font-semibold text-strong">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-ink w-11 h-11 -my-2 flex items-center justify-center text-xl leading-none rounded"
          >
            ×
          </button>
        </header>
        <div className="p-4 text-sm leading-relaxed space-y-3">{children}</div>
      </div>
    </div>
  );
}
