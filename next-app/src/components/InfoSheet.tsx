"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { cn } from "@/lib/utils";

/**
 * InfoSheet — v1.1.1 §2.11 "ExplainSheet" contract.
 *
 * Bottom sheet for "read more" prose. Same interaction pattern as
 * VideoModal and ExerciseDetailsSheet — tap outside or × to dismiss,
 * focus is trapped inside the panel, Escape closes.
 *
 * v1.1.1 upgraded per the 8 sheet rules landed by three juries:
 *   1. safe-area-inset-bottom padding on the panel
 *   2. Drag handle 24×4px (visual) + explicit X close button
 *   3. Backdrop tap-dismiss with 40px safety zone (via panel padding)
 *   4. role="dialog" + aria-modal + aria-labelledby (existing)
 *   5. Focus trap (useFocusTrap — existing, robust A3 fix included)
 *   6. Keyboard Escape closes (useFocusTrap — existing)
 *   7. Body copy rules (documented; enforced by copy-clarity jury at
 *      per-caller-site review, not runtime)
 *   8. sheet-slide 300ms with reduced-motion collapse
 *
 * Extended API for the ExplainSheet semantics (§2.11):
 *   - `trigger` prop: which "why this?" affordance opened the sheet
 *     (proposal-citation | metric-explain | engine-signal | status-pill
 *      | readiness-trail | status-composite)
 *   - `citation` prop: optional {study, threshold} pair rendered as a
 *     structured block below the body so callers cite the threshold
 *     inline per §2.11 rule 7.
 *   - `logSignal` prop: optional {signal, source} pair rendered similar
 *     to citation. Cite threshold + logSignal, not sentiment (§2.11).
 *
 * Legacy callers (progress, programs, HeritageClusterChip, RunSlotCard)
 * pass only {title, children, onClose} — unchanged behavior.
 */

export type ExplainSheetTrigger =
  | "proposal-citation"
  | "metric-explain"
  | "engine-signal"
  | "status-pill"
  | "readiness-trail"
  | "status-composite";

export type ExplainSheetCitation = {
  /** Human-readable study reference, e.g. "Helms et al 2018, JSCR 32:1". */
  study: string;
  /** The threshold that fires the rule, e.g. "TM +2.5% at cycle end". */
  threshold: string;
};

export type ExplainSheetLogSignal = {
  /** Log-derived signal name, e.g. "Groin symptom ≥ 4/10 for 3 days". */
  signal: string;
  /** Data source, e.g. "morning check" or "session log". */
  source: string;
};

export type InfoSheetProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  /** Semantic trigger context. Optional — legacy callers omit. */
  trigger?: ExplainSheetTrigger;
  /** Structured citation block. Rendered below children when present. */
  citation?: ExplainSheetCitation;
  /** Structured log-signal block. Rendered below children when present. */
  logSignal?: ExplainSheetLogSignal;
};

export function InfoSheet({
  title,
  children,
  onClose,
  trigger,
  citation,
  logSignal,
}: InfoSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = `info-${title.replace(/\W+/g, "-")}`;
  useFocusTrap(panelRef, onClose);

  // v1.1.1 §2.11 rule 8 — sheet-slide 300ms with reduced-motion collapse.
  // Two-frame mount to trigger the slide-in transition from off-screen.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-trigger={trigger}
      onClick={onClose}
      className={cn(
        "fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4",
        "bg-ground/85 transition-opacity duration-200 ease-out motion-reduce:transition-none",
        entered ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "bg-surface border border-line rounded-t-lg sm:rounded-lg",
          "w-full max-w-xl max-h-[85vh] overflow-auto",
          // v1.1.1 §2.11 rule 8 — sheet-slide 300ms.
          "transition-transform duration-300 motion-reduce:transition-none",
          entered ? "translate-y-0" : "translate-y-full sm:translate-y-4",
        )}
        style={{
          transitionTimingFunction: "var(--ease-out-terav, cubic-bezier(0.2, 0.8, 0.2, 1))",
          // v1.1.1 §2.11 rule 1 — safe-area-inset-bottom padding.
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* v1.1.1 §2.11 rule 2 — drag handle. Visual only; the primitive
            doesn't support drag-to-dismiss yet (tap X or backdrop are the
            documented affordances). Handle communicates sheetness at a
            glance. Hidden on sm+ where sheet becomes a centered dialog. */}
        <div className="flex justify-center pt-2 sm:hidden" aria-hidden>
          <div className="h-1 w-10 rounded-full bg-line-strong" />
        </div>
        <header className="sticky top-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-line bg-surface">
          <h3 id={titleId} className="text-[15px] font-semibold text-strong">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-ink w-11 h-11 -my-2 flex items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2"
          >
            <X size={18} />
          </button>
        </header>
        <div className="p-4 text-sm leading-relaxed space-y-3">
          {children}
          {citation ? <CitationBlock citation={citation} /> : null}
          {logSignal ? <LogSignalBlock logSignal={logSignal} /> : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Structured citation block — rendered inside ExplainSheet body when the
 * caller passes `citation`. Style locked so every "why this?" sheet cites
 * the threshold consistently. §2.11 rule 7.
 */
function CitationBlock({ citation }: { citation: ExplainSheetCitation }) {
  return (
    <aside
      aria-label="Cited study"
      className="rounded-md border border-line-soft bg-surface-2 p-3 space-y-1"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-bronze">Cited</p>
      {/* Batch 36 P0 (visual-craft audit) — bumped 13px → 14px to stay on the
          v1.1.1 §1 typography ramp (10/11/12/14/15/20/26/32). */}
      <p className="text-[14px] leading-snug text-ink">{citation.study}</p>
      <p className="text-[12px] leading-snug text-muted">
        Threshold: <span className="font-mono">{citation.threshold}</span>
      </p>
    </aside>
  );
}

/**
 * Structured log-signal block — rendered inside ExplainSheet body when
 * the caller passes `logSignal`. Cite the signal not the sentiment.
 */
function LogSignalBlock({ logSignal }: { logSignal: ExplainSheetLogSignal }) {
  return (
    <aside
      aria-label="Log signal"
      className="rounded-md border border-line-soft bg-surface-2 p-3 space-y-1"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-slate">Signal</p>
      {/* Batch 36 P0 — same 13px → 14px ramp compliance as CitationBlock. */}
      <p className="text-[14px] leading-snug text-ink">{logSignal.signal}</p>
      <p className="text-[12px] leading-snug text-muted">Source: {logSignal.source}</p>
    </aside>
  );
}
