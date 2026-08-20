/**
 * StatusPill — v1.1.1 §2.12
 *
 * The chip pattern. Semantic state (readiness, program status, proposal
 * state, retest waypoint). Not a CTA — bronze is never a pill tone.
 *
 * Role rules (a11y §3 + §4 convergence):
 *   - Non-interactive state pills: role="status" + aria-live="polite" on a
 *     container that persists across mounts. SR misses live-region
 *     announcements from freshly-mounted nodes, so the parent should own
 *     the aria-live boundary.
 *   - Interactive pills (filter chip, selector): role="button".
 *   - The dot is aria-hidden — full label is the accessible name.
 *
 * Score-hero ARIA hooks: on Today's readiness composition, the StatusPill
 * itself is role="status" (never role="button" — cleaner semantics). The
 * "Why this?" ExplainSheet trigger is a SEPARATE adjacent button. Two
 * focusable elements, two distinct accessible names.
 *
 * Interactive rule (mobile-UX 2.12): pills are NEVER independently
 * interactive tap targets when embedded in a row where the whole row
 * handles the tap. If interactive=true, the pill is standalone (a filter
 * chip, tier selector, etc.).
 */

"use client";

import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type StatusPillTone = "green" | "amber" | "slate" | "muted" | "red";

export type StatusPillProps = {
  label: string;
  tone: StatusPillTone;
  dot?: boolean;
  interactive?: boolean;
  ariaRole?: "status" | "button";
  ariaLive?: "polite" | "off";
  onClick?: () => void;
  className?: string;
};

const TONE_STYLES: Record<StatusPillTone, { border: string; bg: string; text: string; dot: string }> = {
  green: {
    border: "border-green/40",
    bg: "bg-green/[0.08]",
    text: "text-green",
    dot: "bg-green",
  },
  amber: {
    border: "border-amber/40",
    bg: "bg-amber/[0.08]",
    text: "text-amber-strong",
    dot: "bg-amber",
  },
  red: {
    border: "border-red/40",
    bg: "bg-red/[0.08]",
    text: "text-red-strong",
    dot: "bg-red",
  },
  slate: {
    border: "border-slate/40",
    bg: "bg-slate/[0.08]",
    text: "text-slate",
    dot: "bg-slate",
  },
  muted: {
    border: "border-line-strong",
    bg: "bg-transparent",
    text: "text-muted",
    dot: "bg-muted",
  },
};

const BASE_CLASSES =
  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 " +
  "font-mono text-[10px] font-medium uppercase tracking-widest whitespace-nowrap";

export const StatusPill = forwardRef<HTMLElement, StatusPillProps>(function StatusPill(
  { label, tone, dot = true, interactive = false, ariaRole, ariaLive, onClick, className },
  ref,
) {
  const styles = TONE_STYLES[tone];

  // Role computation per §2.12 role rules. Explicit override wins; otherwise:
  //   interactive=true → role=button (element must be <button>)
  //   interactive=false → role=status (element is <span>, parent owns aria-live)
  const role = ariaRole ?? (interactive ? "button" : "status");
  const live = role === "status" ? (ariaLive ?? "polite") : undefined;

  const content = (
    <>
      {dot ? <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} /> : null}
      <span>{label}</span>
    </>
  );

  if (interactive) {
    const buttonProps: ButtonHTMLAttributes<HTMLButtonElement> = {
      type: "button",
      onClick,
      "aria-label": label,
    };
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        {...buttonProps}
        className={cn(
          BASE_CLASSES,
          "border cursor-pointer min-h-[44px] px-2.5 py-1 hover:brightness-110 active:brightness-95",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2",
          styles.border,
          styles.bg,
          styles.text,
          className,
        )}
      >
        {content}
      </button>
    );
  }

  const spanProps: HTMLAttributes<HTMLSpanElement> = {
    role,
    ...(live ? { "aria-live": live } : {}),
    "aria-label": label,
  };
  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      {...spanProps}
      className={cn(BASE_CLASSES, "border", styles.border, styles.bg, styles.text, className)}
    >
      {content}
    </span>
  );
});
