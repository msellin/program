"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import { StatusPill, type StatusPillTone } from "@/components/ui/StatusPill";
import { InfoSheet } from "@/components/InfoSheet";
import { ReadinessTrail } from "./ReadinessTrail";

/**
 * HeroStateCard — Batch 36 modernized. Now composes v1.1.1 primitives
 * (StatusPill + composite "Why this?" trigger + ReadinessTrail) per §5
 * semantic score-hero rules.
 *
 * Two modes:
 *   - COMPACT (check saved): StatusPill "WORKOUT READY / CHECK FIRST /
 *     BACK OFF" + single "Why this?" icon button that opens ExplainSheet
 *     with the state rationale + ReadinessTrail 14-day trail beneath.
 *     Whole strip is not itself tappable — StatusPill is role="status",
 *     the Why? button is the only interactive element on the row.
 *   - FULL (no check yet): Simple CTA card linking to /check. Distinct
 *     from a state display — this is an invitation to log a check.
 *
 * Design-lead condition 2 (v1.1.1 §5): the score-hero composition uses
 * a SINGLE merged "Why this?" trigger (not two adjacent Why buttons).
 * StatusPill remains non-interactive (role="status" aria-live="polite").
 */

type Copy = {
  title: string;
  sub: string;
  tone: "green" | "amber" | "red" | "neutral";
  pillLabel: string;
  pillTone: StatusPillTone;
  citation: { study: string; threshold: string } | null;
  logSignal: { signal: string; source: string } | null;
};

const COPY: Record<string, Copy> = {
  green: {
    title: "Green",
    sub: "Progress load. Nothing above 3/10 in your check.",
    tone: "green",
    pillLabel: "Workout ready",
    pillTone: "green",
    citation: {
      study: "Kellmann 2010 · Scand J Med Sci Sports",
      threshold: "All symptom scores ≤ 3/10 → progress load",
    },
    logSignal: {
      signal: "Morning check clean · all regions ≤ 3/10",
      source: "morning check",
    },
  },
  amber: {
    title: "Amber",
    sub: "Hold load. A 4-5/10 or morning stiffness over 30 min.",
    tone: "amber",
    pillLabel: "Check first",
    pillTone: "amber",
    citation: {
      study: "Kellmann 2010 · Scand J Med Sci Sports",
      threshold: "Any score 4-5/10 or stiffness > 30 min → hold load",
    },
    logSignal: {
      signal: "Symptom score crossed 4/10 threshold or morning stiffness > 30 min",
      source: "morning check",
    },
  },
  red: {
    title: "Red",
    sub: "Back off. Something above 5/10 or a red flag noted.",
    tone: "red",
    pillLabel: "Back off",
    pillTone: "red",
    citation: {
      study: "Kellmann 2010 · Scand J Med Sci Sports",
      threshold: "Any score > 5/10 or red-flag symptom → back off, see specialist",
    },
    logSignal: {
      signal: "Symptom score > 5/10 or red-flag symptom present",
      source: "morning check",
    },
  },
  none: {
    title: "No check yet",
    sub: "Save a morning check to calibrate today's load.",
    tone: "neutral",
    pillLabel: "No check",
    pillTone: "muted",
    citation: null,
    logSignal: null,
  },
};

export function HeroStateCard({ date }: { date: string }) {
  const derived = useStore((s) => s.store.logs[date]?.derived_state ?? null);
  const symptoms = useStore((s) => s.store.logs[date]?.symptoms ?? null);
  const logs = useStore((s) => s.store.logs);
  const isToday = date === todayISO();
  const state = derived ?? (symptoms ? "green" : "none");
  const copy = COPY[state] ?? COPY.none;

  const [sheetOpen, setSheetOpen] = useState(false);

  // COMPACT mode — check exists. Composes StatusPill + Why? + ReadinessTrail
  // per v1.1.1 §5 semantic score-hero pattern. Whole strip is chrome above
  // the block list; the workout name remains the H1 on the parent surface.
  if (isToday && state !== "none") {
    const escalate = state === "red";
    return (
      <>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusPill label={copy.pillLabel} tone={copy.pillTone} />
              {(copy.citation || copy.logSignal) ? (
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  aria-label={`Why ${copy.pillLabel.toLowerCase()}?`}
                  className="font-mono text-[11px] uppercase tracking-widest text-slate hover:text-ink active:text-strong min-h-11 min-w-11 px-2 py-1 rounded flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2"
                >
                  Why?
                </button>
              ) : null}
              <span className="text-[14px] text-muted">{copy.sub}</span>
            </div>
            {escalate ? (
              <Link
                href="/guide/#red-flags"
                className="font-mono text-[11px] text-red border-b border-red/50 hover:opacity-80 whitespace-nowrap"
              >
                Escalate →
              </Link>
            ) : null}
          </div>
          <ReadinessTrail logs={logs} activeDate={date} />
        </div>
        {sheetOpen && (copy.citation || copy.logSignal) ? (
          <InfoSheet
            title={`Why ${copy.pillLabel.toLowerCase()}?`}
            trigger="status-composite"
            citation={copy.citation ?? undefined}
            logSignal={copy.logSignal ?? undefined}
            onClose={() => setSheetOpen(false)}
          >
            <p>{copy.sub}</p>
          </InfoSheet>
        ) : null}
      </>
    );
  }

  // FULL card — only when today has no check yet, OR when viewing another day.
  const toneRing =
    copy.tone === "green"
      ? "ring-1 ring-green/30 bg-green/10"
      : copy.tone === "amber"
        ? "ring-1 ring-amber/30 bg-amber/10"
        : copy.tone === "red"
          ? "ring-1 ring-red/30 bg-red/10"
          : "ring-1 ring-line bg-surface";

  const dotColour =
    copy.tone === "green"
      ? "bg-green"
      : copy.tone === "amber"
        ? "bg-amber"
        : copy.tone === "red"
          ? "bg-red"
          : "bg-muted";

  const content = (
    <>
      <div className="flex items-center gap-2 text-[14px] text-muted">
        <span className={`w-2 h-2 rounded-full ${dotColour}`} />
        <span>{isToday ? "Today" : formatShort(date)}</span>
      </div>
      <p className="text-2xl font-semibold mt-2 text-strong">{copy.title}</p>
      <p className="text-[14px] text-muted mt-1">{copy.sub}</p>
    </>
  );

  if (!isToday) {
    return <div className={`block rounded-lg p-4 ${toneRing}`}>{content}</div>;
  }
  return (
    <Link
      href="/check/"
      className={`block rounded-lg p-4 ${toneRing} transition-colors active:scale-[0.98]`}
    >
      {content}
    </Link>
  );
}

function formatShort(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
