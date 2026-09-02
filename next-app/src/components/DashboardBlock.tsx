"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * F9 Batch 30 · DashboardBlock primitive.
 *
 * Design-lead brief 2026-08-19: one primitive, five surfaces. Consolidates
 * a card pattern that had drifted across 15+ places. Container:
 *   rounded border border-line-soft bg-surface px-4 py-4
 *
 * Layout (top to bottom):
 *   1. EYEBROW (mono-caps, optional accent) + right-side status slot
 *   2. Title (16-18px semibold strong)
 *   3. Lede (14px muted, optional)
 *   4. Slot content (children)
 *   5. Primary CTA (single bronze, optional)
 *
 * Accent economy locked: one bronze accent per block max — either the CTA
 * or a bronze eyebrow, never both.
 */

type EyebrowTone = "default" | "amber" | "red" | "bronze" | "green" | "slate";

type PrimaryCta = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type DashboardBlockProps = {
  eyebrow?: string;
  eyebrowTone?: EyebrowTone;
  /** Optional left-edge color stripe (category color, semantic). */
  accent?: EyebrowTone;
  title: string;
  lede?: string;
  /** Right-side status: readiness dot, progress %, chip, etc. */
  status?: ReactNode;
  children?: ReactNode;
  primaryCta?: PrimaryCta;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  /** Extra outer classes for one-off adjustments (rarely needed). */
  className?: string;
};

const EYEBROW_TONE: Record<EyebrowTone, string> = {
  default: "text-muted",
  amber: "text-amber",
  red: "text-red-strong",
  bronze: "text-bronze",
  green: "text-green",
  slate: "text-slate",
};

const ACCENT_STRIPE: Record<EyebrowTone, string> = {
  default: "",
  amber: "border-l-4 border-l-amber",
  red: "border-l-4 border-l-red",
  bronze: "border-l-4 border-l-bronze",
  green: "border-l-4 border-l-green",
  slate: "border-l-4 border-l-slate",
};

export function DashboardBlock({
  eyebrow,
  eyebrowTone = "default",
  accent,
  title,
  lede,
  status,
  children,
  primaryCta,
  collapsible = false,
  defaultExpanded = true,
  className,
}: DashboardBlockProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const showBody = !collapsible || expanded;
  const bodyId = collapsible
    ? `db-body-${title.replace(/\s+/g, "-").toLowerCase()}`
    : undefined;

  return (
    <section
      className={cn(
        // Batch 33 · M1 · surface-2 activates the two-tier hierarchy so
        // DashboardBlocks don't sit at the same visual weight as inline
        // cards below them. Token already declared at globals.css:12,
        // zero call sites until now.
        // Batch 33 · M8 · shadow-plus-line elevation. Two-part shadow:
        // 0/1/2 rgba(0,0,0,0.4) tight rim + 0/4/12/-6 halo for float.
        // Reads as a genuine surface, not a bordered rectangle.
        "rounded-lg border border-line-soft bg-surface-2 px-4 py-4",
        "shadow-[0_1px_2px_rgba(0,0,0,0.4),0_4px_12px_-6px_rgba(0,0,0,0.5)]",
        accent ? ACCENT_STRIPE[accent] : null,
        className,
      )}
    >
      <header
        className={cn(
          "flex items-start justify-between gap-3",
          collapsible ? "cursor-pointer select-none" : null,
        )}
        onClick={collapsible ? () => setExpanded((v) => !v) : undefined}
        onKeyDown={
          collapsible
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpanded((v) => !v);
                }
              }
            : undefined
        }
        role={collapsible ? "button" : undefined}
        tabIndex={collapsible ? 0 : undefined}
        aria-expanded={collapsible ? expanded : undefined}
        aria-controls={bodyId}
      >
        <div className="min-w-0 flex-1 space-y-1">
          {eyebrow ? (
            <p
              className={cn(
                "font-mono text-[10px] uppercase tracking-widest",
                EYEBROW_TONE[eyebrowTone],
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-[18px] font-semibold text-strong tracking-[-0.02em] leading-snug">
            {title}
          </h2>
          {lede && showBody ? (
            <p className="text-[14px] text-muted leading-relaxed">{lede}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {status}
          {collapsible ? (
            expanded ? (
              <ChevronUp size={16} className="text-muted" aria-hidden />
            ) : (
              <ChevronRight size={16} className="text-muted" aria-hidden />
            )
          ) : null}
        </div>
      </header>
      {/* Batch 34 · M3 · smooth expand/collapse via grid-template-rows
          0fr↔1fr transition. Works without needing measured heights.
          Non-collapsible blocks stay at 1fr so the transition is a
          no-op. `motion-reduce:transition-none` gates for prefers-
          reduced-motion users. Children stay mounted across
          collapse cycles so form state / expanded exercise notes /
          etc. don't lose position. */}
      {children || primaryCta ? (
        <div
          id={bodyId}
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
            showBody ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
          aria-hidden={collapsible && !showBody ? true : undefined}
        >
          <div className="overflow-hidden">
            <div className="mt-3 space-y-3">
              {children}
              {primaryCta ? (
                /* Batch 33 · M5 · bronze CTA elevation. rounded-lg instead
                   of rounded; inset-highlight + drop-shadow pair so the
                   button reads as pressed/pressable; :active token
                   (--color-bronze-active at globals.css:43, previously
                   unused) fires on tap so touch users get real feedback. */
                primaryCta.href ? (
                  <Link
                    href={primaryCta.href}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-bronze bg-bronze text-ground px-3.5 py-2 text-[14px] font-semibold hover:bg-bronze-hover active:bg-bronze-active min-h-[44px] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.4)]"
                  >
                    {primaryCta.label}
                    <ChevronRight size={14} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={primaryCta.onClick}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-bronze bg-bronze text-ground px-3.5 py-2 text-[14px] font-semibold hover:bg-bronze-hover active:bg-bronze-active min-h-[44px] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.4)]"
                  >
                    {primaryCta.label}
                    <ChevronRight size={14} />
                  </button>
                )
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

// Re-export the chevron used inside for consumers who need the same icon set.
export { ChevronDown as DashboardChevronDown };
