"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/useStore";
import { daySignals, proposedLoadMultiplier } from "@/lib/engine/note-signals";
import { assessReintroReadiness } from "@/lib/engine/readiness";
import { isDue } from "@/lib/engine/assessment-engine";
import { activePhaseFor } from "@/lib/engine/schedule";
import { blocksForDate } from "@/lib/engine/plan-generator";
import { HIP_FLEXOR_PACK } from "@/lib/assessments-data";
import { DayAdjustmentProposal } from "./DayAdjustmentProposal";
import { ReadinessProposal } from "./ReadinessProposal";
import { AssessmentDueBanner } from "../AssessmentDueBanner";
import { iso } from "@/lib/utils";
import type { Program } from "@/lib/schemas";

/**
 * One-line summary of everything the app wants to tell the user right now.
 *
 * Before: red-state warning + override strip + DayAdjustmentProposal +
 * ReadinessProposal + AssessmentDueBanner could each render as their own card,
 * stacking up to five separate blocks between HeroStateCard and the first
 * ExerciseCard. Fold. Above. Full.
 *
 * After: a single strip with the strongest-tone border and an "N updates"
 * count. Tap → expands to reveal every active signal inline (using the same
 * underlying components, so nothing is lost). Red-state gets a red border on
 * the strip itself so the safety signal keeps its visual weight even when
 * collapsed — that was the non-negotiable in the design brief.
 *
 * Reasoning for the pattern: Strong's single coach-message pill; every mobile
 * fitness UX convention on the ~5-item-above-fold budget.
 */
export function SignalsStrip({ program, date }: { program: Program; date: string }) {
  const [expanded, setExpanded] = useState(false);
  const store = useStore((s) => s.store);

  const signals = useMemo(() => {
    const list: Array<{ id: string; tone: "red" | "amber" | "slate"; label: string }> = [];

    // Red-state morning check.
    const derived = store.logs[date]?.derived_state ?? null;
    if (derived === "red") {
      list.push({ id: "red-state", tone: "red", label: "Red-state morning check" });
    }

    // Scheduled override / moved-in session.
    if (store.scheduled_overrides?.[date]) {
      list.push({ id: "override", tone: "slate", label: "Rescheduled session" });
    }

    // Day-adjustment proposal (or already-accepted adjustment). Fires for any
    // program — the underlying multiplier only affects TM_EXERCISES so an
    // aerobic-only day silently no-ops it while the user still gets the useful
    // "we noticed yesterday's load" copy.
    const accepted = store.day_adjustments?.[date];
    if (accepted) {
      list.push({ id: "day-adj-active", tone: "slate", label: `Not feeling 100% · ×${accepted.load_multiplier.toFixed(2)} applied` });
    } else {
      let sig = daySignals(store.logs[date]);
      if (!(sig.fatigue === "high" || sig.pain)) {
        const t = new Date(date + "T00:00:00");
        for (let back = 1; back <= 2 && sig.matches.length === 0; back++) {
          const d = new Date(t);
          d.setDate(t.getDate() - back);
          sig = daySignals(store.logs[iso(d)]);
        }
      }
      const proposal = proposedLoadMultiplier(sig);
      const proposalId = proposal ? `load-${proposal.multiplier}` : null;
      const dismissed = store.dismissed_proposals?.[date] ?? [];
      if (proposal && proposalId && !dismissed.includes(proposalId)) {
        list.push({ id: "day-adj-proposal", tone: "amber", label: "Not feeling 100%?" });
      }
    }

    // Reintro readiness + monthly hip check — anterior-hip only. Both check
    // hip-specific signals (reintro phase, HIP_FLEXOR_PACK cadence) that make
    // no sense for other programs.
    if (program.slug === "anterior-hip-rebuild") {
      const readiness = assessReintroReadiness(store, program, date);
      const dismissedFor = store.dismissed_proposals?.[date] ?? [];
      if (readiness.ready && !dismissedFor.includes("reintro-graduation")) {
        list.push({ id: "readiness", tone: "slate", label: "Ready to leave reintro" });
      }
      const dueStatus = isDue(store, HIP_FLEXOR_PACK.id, date);
      if (dueStatus.due) {
        // "Monthly" is misleading on day 1 when the pack has never been done.
        const label = dueStatus.lastDate ? "Monthly hip check due" : "First hip check";
        list.push({ id: "hip-check-due", tone: "slate", label });
      }
    }

    // Morning check overdue: today has no derived_state AND the plan wants a strength
    // session AND the last saved check was ≥ 3 days ago. Nudge to /check so the
    // load-adjustment rules have something to base themselves on. Suppressed on
    // day 1 — a fresh user seeing "Morning check overdue" as their first signal
    // is disorienting.
    const todayHasCheck = derived !== null;
    const hasAnyHistory =
      Object.keys(store.logs ?? {}).length > 0 ||
      Object.keys(store.training_maxes ?? {}).length > 0;
    if (!todayHasCheck && hasAnyHistory) {
      const phase = activePhaseFor(program, date, store.user_profile);
      const blocksToday = blocksForDate(program, store.user_profile, phase, date);
      if (blocksToday.length > 0) {
        // Walk back to find the last day with a derived_state.
        const t = new Date(date + "T00:00:00");
        let daysSince = 0;
        let found = false;
        for (let back = 1; back <= 14; back++) {
          const d = new Date(t);
          d.setDate(t.getDate() - back);
          const key = iso(d);
          if (store.logs[key]?.derived_state != null) {
            daysSince = back;
            found = true;
            break;
          }
        }
        if (!found || daysSince >= 3) {
          const label = found
            ? `Morning check overdue (${daysSince}d)`
            : "Morning check overdue";
          list.push({ id: "check-overdue", tone: "amber", label });
        }
      }
    }

    return list;
  }, [store, program, date]);

  if (signals.length === 0) return null;

  const strongestTone = signals.some((s) => s.tone === "red")
    ? "red"
    : signals.some((s) => s.tone === "amber")
      ? "amber"
      : "slate";

  const toneClasses = {
    red: "border-red/50 border-l-red bg-red/10",
    amber: "border-amber/40 border-l-amber bg-amber/10",
    slate: "border-line-soft border-l-slate bg-surface",
  } as const;

  const iconColor = {
    red: "text-red",
    amber: "text-amber",
    slate: "text-slate",
  } as const;

  const primary = signals[0];
  const restCount = signals.length - 1;

  return (
    <section aria-label="Today's signals" className="space-y-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={cn(
          "w-full text-left border border-l-4 rounded-md px-3 py-2.5 flex items-center gap-2.5 min-h-[44px]",
          toneClasses[strongestTone],
        )}
      >
        {strongestTone === "red" ? (
          <AlertTriangle size={16} className={iconColor.red} aria-hidden />
        ) : (
          <Info size={16} className={iconColor[strongestTone]} aria-hidden />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-strong truncate">
            {primary.label}
            {restCount > 0 ? (
              <span className="ml-1.5 text-[12px] font-normal text-muted">
                +{restCount} more
              </span>
            ) : null}
          </p>
        </div>
        {expanded ? (
          <ChevronUp size={14} className="text-muted flex-shrink-0" aria-hidden />
        ) : (
          <ChevronDown size={14} className="text-muted flex-shrink-0" aria-hidden />
        )}
      </button>

      {expanded ? (
        <div className="space-y-3">
          {/* Red-state — needs its full explanation and escalation link. */}
          {signals.some((s) => s.id === "red-state") ? (
            <div className="rounded border border-red/40 border-l-4 border-l-red bg-red/10 p-3 text-sm">
              <p className="font-semibold text-strong">Red-state morning check</p>
              <p className="text-[13px] text-muted mt-1">
                {Object.keys(store.training_maxes).length > 0
                  ? "The plan reduces load by 10% today, but skipping is a valid — often better — call. The Skip button below marks the day without breaking your trajectory. TM stays where it is."
                  : "Skipping is a valid — often better — call. The Skip button below marks the day without breaking your trajectory."}
              </p>
              <Link
                href="/guide/#red-flags"
                className="inline-block mt-2 text-[13px] text-red border-b border-red hover:opacity-80"
              >
                When to escalate to a clinician →
              </Link>
            </div>
          ) : null}

          {/* Override / moved-in. */}
          {signals.some((s) => s.id === "override") ? (
            <div className="rounded border border-line-soft border-l-4 border-l-slate bg-surface p-3 text-sm">
              <p className="font-semibold text-strong">Rescheduled session</p>
              <p className="text-[13px] text-muted mt-0.5">
                {store.scheduled_overrides?.[date]?.reason ?? "Moved from another day"}
              </p>
            </div>
          ) : null}

          {/* Morning-check overdue nudge. */}
          {signals.some((s) => s.id === "check-overdue") ? (
            <div className="rounded border border-amber/40 border-l-4 border-l-amber bg-amber/10 p-3 text-sm">
              <p className="font-semibold text-strong">Morning check overdue</p>
              <p className="text-[13px] text-muted mt-1">
                Load adjustment, red-state gating, and the notes engine all key off the
                morning check. A minute of tapping now makes the rest of the day&apos;s
                recommendations mean something.
              </p>
              <Link
                href="/check/"
                className="inline-block mt-2 text-[13px] text-amber border-b border-amber hover:opacity-80"
              >
                Log check now →
              </Link>
            </div>
          ) : null}

          {/* Delegated components — each already renders null when inactive. */}
          <DayAdjustmentProposal date={date} />
          <ReadinessProposal program={program} date={date} />
          <AssessmentDueBanner date={date} />
        </div>
      ) : null}
    </section>
  );
}
