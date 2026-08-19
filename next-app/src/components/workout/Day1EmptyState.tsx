"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Day-1 empty-state card. Fix for Bug #3 from the 2026-08-17 flow-review
 * brief.
 *
 * Shows for fresh users with no morning check saved and no logs on record.
 * Owns the "start here" attention — no competing HeroStateCard tile, no
 * SignalsStrip nudge, no RestDayCard.
 *
 * The engine has nothing to work with until this first tap happens; the
 * one-CTA framing makes that call load-bearing rather than one option
 * among many.
 */
export function Day1EmptyState() {
  return (
    <section
      aria-labelledby="day1-title"
      className="rounded-md border border-bronze/30 bg-bronze/5 p-4 space-y-3"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-bronze">
        Setup · one minute
      </p>
      <h2 id="day1-title" className="text-lg font-semibold text-strong leading-snug">
        One focus, sharpened every session.
      </h2>
      <p className="text-[14px] text-muted leading-relaxed">
        Starts with a morning check — one minute of tapping calibrates today&apos;s load.
        Terav writes the focus arc; the rest of your week is still yours.
      </p>
      <Link
        href="/check/"
        className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded bg-bronze text-ground font-mono text-[11px] uppercase tracking-wider hover:bg-bronze-hover"
      >
        Open morning check
        <ArrowRight size={14} />
      </Link>
    </section>
  );
}
