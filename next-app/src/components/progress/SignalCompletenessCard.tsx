"use client";

import { useState } from "react";
import { Eye, Plus, ChevronDown, ChevronUp } from "lucide-react";
import type { Program } from "@/lib/schemas";

/**
 * Progress rebuild 2026-08-18 — SignalCompletenessCard now supports an
 * `inline` mode. When `inline`, it renders without the outer card chrome
 * or its own expand toggle (the parent WeeklyNarrativeTile owns the
 * disclosure). Standalone mode is preserved for other callers if any
 * appear later.
 */

/**
 * F1 Path 1 — signal-completeness surface.
 *
 * Renders on Progress. Reads `program.signal_completeness` (added in the
 * 2026-08-17 roadmap). NOT a letter grade — research (Concern A brief)
 * showed A/B/C/D reads as failing, especially cross-culturally. Instead:
 * literal enumeration of what the engine sees today + what it would
 * additionally use if the user gave it more.
 *
 * When `would_additionally_use` is empty, we show only the "engine sees"
 * list — the program is at ceiling and there's nothing punitive to say.
 */
export function SignalCompletenessCard({
  program,
  inline = false,
}: {
  program: Program;
  inline?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const sc = program.signal_completeness;
  if (!sc) return null;

  const reads = sc.currently_reads ?? [];
  const wouldUse = sc.would_additionally_use ?? [];
  const hasGaps = wouldUse.length > 0;

  // P1-42 — the "engine sees" eyebrow duplicates the tile header when
  // this card is embedded in `WeeklyNarrativeTile` (inline mode). Hide
  // it in that case; the header context makes the eyebrow noise.
  const body = (
    <div className="space-y-4">
      <div className="space-y-2">
        {inline ? null : (
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted flex items-center gap-1.5">
            <Eye size={12} aria-hidden="true" />
            The engine sees
          </p>
        )}
        <ul className="space-y-1.5 pl-1">
          {reads.map((r) => (
            <li key={r.label} className="text-[14px] leading-snug">
              <span className="text-ink">{r.label}</span>
              {r.detail ? <span className="text-muted"> — {r.detail}</span> : null}
            </li>
          ))}
        </ul>
      </div>

      {hasGaps ? (
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted flex items-center gap-1.5">
            <Plus size={12} aria-hidden="true" />
            To sharpen more, add:
          </p>
          <ul className="space-y-3 pl-1">
            {wouldUse.map((w) => (
              <li key={w.label} className="space-y-1">
                <p className="text-[14px] font-semibold text-strong">{w.label}</p>
                <p className="text-[12px] text-muted leading-snug">
                  {w.why_it_matters}
                </p>
                <p className="text-[12px] text-ink leading-snug">
                  <span className="text-muted">Log it: </span>
                  {w.user_action_free}
                </p>
                {w.user_action_paid ? (
                  <p className="text-[12px] text-slate leading-snug">
                    <span className="text-muted">Or auto: </span>
                    {w.user_action_paid}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );

  // Inline mode: the parent (WeeklyNarrativeTile expandable slot) owns the
  // reveal + card chrome. Just render the body content.
  if (inline) return body;

  return (
    <section
      aria-labelledby="signal-completeness-title"
      className="rounded border border-line bg-surface p-4 space-y-3"
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            What the engine reads
          </p>
          <h3
            id="signal-completeness-title"
            className="text-[15px] font-semibold text-strong mt-0.5"
          >
            {hasGaps
              ? `${reads.length} signals active · ${wouldUse.length} could be added`
              : `${reads.length} signals active — at engine ceiling for this program`}
          </h3>
          <p className="text-[12px] text-muted mt-1">
            {hasGaps
              ? "Adding any of the below sharpens what the engine can propose."
              : "This program uses everything the engine can consume. Nothing to add here."}
          </p>
        </div>
        <span aria-hidden="true" className="text-muted flex-shrink-0 mt-1">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {expanded ? <div className="pt-1">{body}</div> : null}
    </section>
  );
}
