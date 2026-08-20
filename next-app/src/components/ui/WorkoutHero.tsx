/**
 * WorkoutHero — v1.1.1 §2.2 · the primary anchor primitive.
 *
 * The one hero on the page. Renders on:
 *   - Today (`title` = workout name, h1-display 32px, headingLevel=1)
 *   - Session (`title` = workout name, h2-hero 26px, headingLevel=1
 *     semantically page-scoped)
 *   - Program preview (`title` = program name, h2-hero, headingLevel=1)
 *   - Progress retest-week Monday (`title` = workout name, h2-hero,
 *     headingLevel=2 — page has its own H1 "Progress")
 *
 * MULTIPLE WorkoutHeros on one route = system failure. This primitive
 * earns its cost by being THE primary emphasis.
 *
 * ## H1 pattern (landing C1 + copy §7.2 + design-lead synthesis)
 *
 * The workout name is ALWAYS the tallest strong-white element on Today.
 * The route name "Today" is NEVER an H1 — it lives above the H1 in a
 * mono-caps eyebrow tier (10px, tracking-widest, uppercase). This
 * overturns commit 100760b which reverted H1 to scope label.
 *
 * Runtime guardrail: dev-mode console.warn if any sibling text-strong
 * element has computed font-size ≥ the title's. Cheap sanity check.
 *
 * ## Sticky CTA rule (mobile-UX P0-6)
 *
 * When `stickyCTA=true`, the primary CTA is NOT rendered inline. Instead
 * it renders inside a <StickyCta> fixed bottom container above the nav
 * with safe-area padding. Applies to Session, Preview, Intake.
 * NOT Today (cradle-zone already handles reach).
 *
 * ## Citation chip per block (landing C3)
 *
 * Each block in `blocks[]` may include `citationCount`. If present AND
 * `onBlockCite` handler passed, renders a bronze `[cited]` chip that
 * calls the handler when tapped. Parent owns the ExplainSheet state.
 * If `citationCount` undefined, no chip renders (do not fabricate).
 */

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusPill, type StatusPillProps } from "@/components/ui/StatusPill";
import { MetricStripCluster, type MetricStripClusterItem } from "@/components/ui/MetricStripCluster";
import { StickyCta } from "@/components/ui/StickyCta";

export type WorkoutHeroScope = "today" | "tomorrow" | "session" | "retest" | "preview";

export type WorkoutHeroBlock = {
  /** 1-indexed. Rendered as "A · ", "B · ", "C · " (letter, not digit). */
  number: number;
  /** Block name, e.g. "Warm-up · dynamic mobility ladder". */
  name: string;
  /** Sets label, e.g. "3 × 10" or "4 × 4 min at Z4". */
  setsLabel: string;
  /** Optional citation count. If present + onBlockCite provided, renders chip. */
  citationCount?: number;
};

export type WorkoutHeroPrimaryCta = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export type WorkoutHeroProps = {
  scope: WorkoutHeroScope;
  /** Mono-caps eyebrow above title, e.g. "TODAY · WEEK 3 OF 6". */
  eyebrow: string;
  /** Workout name — the LOAD-BEARING string. */
  title: string;
  /**
   * REQUIRED per a11y §4. On Today: 1. On Session/Preview: 1 (page-scoped).
   * On Progress retest hero: 2 (page has its own H1 "Progress").
   */
  headingLevel: 1 | 2;
  /** One-line caption below title. */
  lede?: string;
  /** Status pill in top-right of the pill row (below title). */
  status?: StatusPillProps;
  /** 2-3 metric cells (duration/blocks/target). */
  metrics?: MetricStripClusterItem[];
  /** Ordered block list. Rendered as <ol>. */
  blocks?: WorkoutHeroBlock[];
  /** Called when user taps a block's [cited] chip. Parent opens ExplainSheet. */
  onBlockCite?: (blockNumber: number) => void;
  /** Composite "Why this?" trigger next to StatusPill. Parent opens ExplainSheet. */
  onExplain?: () => void;
  primaryCta: WorkoutHeroPrimaryCta;
  /**
   * When true, primaryCta renders in <StickyCta> (fixed bottom above nav)
   * instead of inline. Session/Preview/Intake use true. Today uses false.
   */
  stickyCTA?: boolean;
  /**
   * When true, sticky CTA is keyboard-aware (Intake, Check). Only
   * meaningful when stickyCTA=true.
   */
  stickyCtaKeyboardAware?: boolean;
  className?: string;
};

export function WorkoutHero({
  scope,
  eyebrow,
  title,
  headingLevel,
  lede,
  status,
  metrics,
  blocks,
  onBlockCite,
  onExplain,
  primaryCta,
  stickyCTA = false,
  stickyCtaKeyboardAware = false,
  className,
}: WorkoutHeroProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  // v1.1.1 §5 workout-name-tallest guardrail. Dev-mode only.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (!titleRef.current) return;
    const titleSize = parseFloat(getComputedStyle(titleRef.current).fontSize);
    // Walk the document for any text-strong element with a computed font-size ≥ title's.
    const strongEls = document.querySelectorAll<HTMLElement>(".text-strong, [data-text-strong]");
    for (const el of Array.from(strongEls)) {
      if (el === titleRef.current) continue;
      const s = parseFloat(getComputedStyle(el).fontSize);
      if (s >= titleSize) {
        console.warn(
          `[WorkoutHero] Sibling strong element font-size ${s}px >= title ${titleSize}px. ` +
            `v1.1.1 §5 rule: workout name must be visually tallest. Element:`,
          el,
        );
        return;
      }
    }
  }, [title, headingLevel]);

  const Heading: "h1" | "h2" = headingLevel === 1 ? "h1" : "h2";
  const titleClasses =
    scope === "today"
      ? "text-[32px] leading-[1.05] tracking-[-0.03em] font-bold"
      : "text-[26px] leading-[1.15] tracking-[-0.02em] font-semibold";

  const ctaButton = <PrimaryCtaButton primaryCta={primaryCta} />;

  return (
    <>
      <section
        aria-labelledby={`workout-hero-title-${scope}`}
        className={cn(
          "rounded-lg border border-line-soft bg-surface-2 p-4 space-y-3",
          className,
        )}
      >
        {/* Eyebrow row — scope + status pill + optional "Why this?" trigger */}
        <header className="flex items-start justify-between gap-3">
          <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted">
            {eyebrow}
          </p>
          {(status || onExplain) && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {status && <StatusPill {...status} />}
              {onExplain && (
                <button
                  type="button"
                  onClick={onExplain}
                  aria-label="Why this?"
                  className={cn(
                    "font-mono text-[11px] uppercase tracking-widest text-slate hover:text-ink active:text-strong",
                    // Batch 36 P0 (visual-craft audit) — bumped from min-h-[24px]
                    // to min-h-11 per §2.0 invariant 2 (44×44 tap target).
                    "min-h-11 min-w-11 py-1 px-2 rounded flex items-center justify-center",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2",
                  )}
                >
                  Why?
                </button>
              )}
            </div>
          )}
        </header>

        {/* Title — the load-bearing element */}
        <Heading
          ref={titleRef}
          id={`workout-hero-title-${scope}`}
          className={cn("text-strong", titleClasses)}
        >
          {title}
        </Heading>

        {lede && <p className="text-[14px] text-muted leading-snug">{lede}</p>}

        {metrics && metrics.length > 0 && (
          <div className="rounded border border-line-soft bg-surface p-3">
            <MetricStripCluster items={metrics} ariaGroupLabel={`${scope} metrics`} />
          </div>
        )}

        {blocks && blocks.length > 0 && (
          <ol className="space-y-2 pt-1" aria-label="Workout blocks">
            {blocks.map((block) => (
              <li
                key={block.number}
                className="flex items-start gap-3 border-t border-line-soft pt-2 first:border-t-0 first:pt-0"
              >
                <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted mt-0.5 flex-shrink-0 w-8">
                  {blockLetter(block.number)}
                </span>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-[14px] font-medium text-ink leading-snug">
                    {block.name}
                  </p>
                  <p className="font-mono text-[12px] text-muted tabular-nums">
                    {block.setsLabel}
                  </p>
                </div>
                {block.citationCount != null && block.citationCount > 0 && (
                  onBlockCite ? (
                    <button
                      type="button"
                      onClick={() => onBlockCite(block.number)}
                      aria-label={`Show ${block.citationCount} citation${block.citationCount === 1 ? "" : "s"} for ${block.name}`}
                      className={cn(
                        "font-mono text-[10px] uppercase tracking-widest text-bronze hover:text-bronze-hi active:text-bronze-active",
                        // Batch 36 P0 (visual-craft audit) — 44×44 tap target
                        // per §2.0 invariant 2. Visual chip stays 10px inline;
                        // hit-slop provided by flex-centered min-h-11 wrapper.
                        "min-h-11 min-w-11 px-2 py-1 rounded flex-shrink-0 flex items-center justify-center",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2",
                      )}
                    >
                      [cited]
                    </button>
                  ) : (
                    <span
                      aria-hidden
                      className="font-mono text-[10px] uppercase tracking-widest text-bronze flex-shrink-0"
                    >
                      [cited]
                    </span>
                  )
                )}
              </li>
            ))}
          </ol>
        )}

        {!stickyCTA && <div className="pt-1">{ctaButton}</div>}
      </section>

      {stickyCTA && <StickyCta keyboardAware={stickyCtaKeyboardAware}>{ctaButton}</StickyCta>}
    </>
  );
}

function PrimaryCtaButton({ primaryCta }: { primaryCta: WorkoutHeroPrimaryCta }) {
  const classes = cn(
    "inline-flex w-full items-center justify-center gap-2 rounded-lg",
    "bg-bronze text-ground font-semibold text-[14px]",
    "hover:bg-bronze-hover active:bg-bronze-active",
    "min-h-[44px] px-4 py-2",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.4)]",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-strong focus-visible:outline-offset-2",
  );
  const inner: ReactNode = (
    <>
      <span>{primaryCta.label}</span>
      <ChevronRight size={16} strokeWidth={2.25} aria-hidden />
    </>
  );
  if (primaryCta.href) {
    return (
      <Link href={primaryCta.href} className={classes}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={primaryCta.onClick} className={classes}>
      {inner}
    </button>
  );
}

/**
 * Block number 1..26 → uppercase letter A..Z. Block ordering across
 * routines uses letters (not digits) per convention — "A block," "B
 * block" reads more naturally than "block 1, block 2."
 */
function blockLetter(n: number): string {
  return String.fromCharCode("A".charCodeAt(0) + Math.max(0, Math.min(25, n - 1)));
}
