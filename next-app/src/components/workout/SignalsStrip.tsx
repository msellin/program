"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/useStore";
import { isDue } from "@/lib/engine/assessment-engine";
import { activePhaseFor } from "@/lib/engine/schedule";
import { blocksForDate } from "@/lib/engine/plan-generator";
import { HIP_FLEXOR_PACK } from "@/lib/assessments-data";
import { evaluateCycleEnd, detectPauseResume } from "@/lib/engine/adapt";
import { evaluateRetestMetrics } from "@/lib/engine/retest-evaluator";
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

    // Read today's derived state — used below for the overdue-check gate,
    // even though the "Red" pill itself is now suppressed (surfaced by
    // HeroStateCard's compact strip with an inline Escalate → link).
    const derived = store.logs[date]?.derived_state ?? null;

    // Scheduled override / moved-in session.
    // Phase F · read from both legacy `scheduled_overrides` AND block-object
    // state so the "Rescheduled session" chip shows regardless of which
    // surface wrote the move.
    const legacyOverride = store.scheduled_overrides?.[date];
    const blockObjectMovedIn = Object.values(store.scheduled_blocks ?? {}).some(
      (b) => b.actual_date === date && b.state === "moved" && b.planned_date !== date,
    );
    if (legacyOverride || blockObjectMovedIn) {
      list.push({ id: "override", tone: "slate", label: "Rescheduled session" });
    }

    // A5 (Phase 3): day-adjustment PROPOSAL now lives in ProposalStack.
    // We only show the ACCEPTED-adjustment confirmation strip here (passive
    // info) so the user can still see "×0.90 applied today" at a glance.
    const accepted = store.day_adjustments?.[date];
    if (accepted) {
      list.push({ id: "day-adj-active", tone: "slate", label: `Not feeling 100% · ×${accepted.load_multiplier.toFixed(2)} applied` });
    }

    // Anterior-hip: monthly hip check assessment cadence stays as a signal
    // strip chip. Reintro-graduation readiness moved to ProposalStack.
    if (program.slug === "anterior-hip-rebuild") {
      const dueStatus = isDue(store, HIP_FLEXOR_PACK.id, date);
      if (dueStatus.due) {
        // "Monthly" is misleading on day 1 when the pack has never been done.
        const label = dueStatus.lastDate ? "Monthly hip check due" : "First hip check";
        list.push({ id: "hip-check-due", tone: "slate", label });
      }
    }

    // Cycle-end proposal — signal only, action lives on Progress. Fires when
    // the adaptive engine has TM changes to propose. Users on Today shouldn't
    // wonder if they missed something; Progress owns the "Apply all" flow.
    const cycleEval = evaluateCycleEnd(program, store, date);
    if (cycleEval && cycleEval.recommendation.length) {
      list.push({
        id: "cycle-end",
        tone: cycleEval.worstState === "red" ? "red" : cycleEval.worstState === "amber" ? "amber" : "slate",
        label: `Cycle end — ${cycleEval.recommendation.length} TM change${cycleEval.recommendation.length === 1 ? "" : "s"} proposed`,
      });
    }

    // Pause-detected proposal — 14+ day gap → the engine wants to soften on
    // return. Same pattern: signal on Today, action on Progress.
    const pause = detectPauseResume(store, date);
    if (pause && pause.gapDays >= 14) {
      list.push({ id: "pause", tone: "amber", label: `Back after ${pause.gapDays} days — soften plan?` });
    }

    // Positive-adaptation surface for aerobic programs. Overperformer
    // path was silent on Today per delta audit 2026-08-19 — no branch
    // in note-signals for "you look ready to push". Reads retest
    // metrics; if the primary trend is at least halfway to target in
    // the metric's direction, surfaces a slate advisory ("Trending
    // well — consider a tier-up"). Real Accept flow lives on Progress
    // where the tier-advance proposal + retest card already are.
    const slug = program.slug;
    const userTier = slug
      ? store.user_profile?.program_states?.[slug]?.tier
      : undefined;
    if (userTier) {
      try {
        const retestVals = evaluateRetestMetrics(program, store, userTier);
        for (const m of retestVals) {
          if (!m.supported || m.current == null || m.baseline == null || m.target == null) continue;
          // Skip mid-block copies to avoid double-signaling on the same metric.
          if (m.metric_id.endsWith("__mid_block")) continue;
          const rawDelta = m.current - m.baseline;
          const targetDelta = m.target;
          if (!Number.isFinite(rawDelta) || !Number.isFinite(targetDelta)) continue;
          // Improvement is direction-aware. For "lower_is_better", a
          // negative rawDelta AND negative target is progress.
          const goodDir = m.direction === "higher_is_better"
            ? rawDelta > 0 && targetDelta > 0
            : rawDelta < 0 && targetDelta < 0;
          if (!goodDir) continue;
          const ratio = Math.abs(rawDelta) / Math.abs(targetDelta);
          // Threshold at 25% of target progress — original 50% was too
          // strict; a persona-engine-fast with real −2 bpm drift against
          // a −8 bpm target scored 0.25 and stayed silent. Engine
          // delta-2 caught this. Signal is advisory, not proposal;
          // firing early is fine.
          if (ratio >= 0.25) {
            list.push({
              id: "positive-adaptation",
              tone: "slate",
              label: `Trending well on ${m.display_name.toLowerCase()} — consider a tier-up on Progress`,
            });
            break;
          }
        }
      } catch {
        /* non-fatal — retest evaluator errors don't break Today */
      }
    }

    // CSM amber-week 4×4 drop signal. Program authors this hook at
    // concurrent-strength-maintenance.json:541 ("≥3 amber days in a week
    // → drop 4×4 next week"). Delta audit 2026-08-19 P1-11 flagged that
    // no engine code consumed it. Signal-strip advisory here — actual
    // scheduled-block replacement is a follow-up (needs Accept flow).
    if (program.slug === "concurrent-strength-maintenance") {
      const t0 = new Date(date + "T00:00:00");
      let amberCount = 0;
      for (let back = 0; back < 7; back++) {
        const d = new Date(t0);
        d.setDate(t0.getDate() - back);
        const key = iso(d);
        if (store.logs[key]?.derived_state === "amber") amberCount++;
      }
      if (amberCount >= 3) {
        list.push({
          id: "csm-amber-week",
          tone: "amber",
          label: `${amberCount} amber days this week — plan will drop 4×4 next week`,
        });
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
        aria-controls="signals-detail"
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
        <div id="signals-detail" className="space-y-3">
          {/* Red-state expansion body deleted — HeroStateCard now owns this
              signal (compact strip with an inline Escalate → link). */}

          {/* Override / moved-in. */}
          {signals.some((s) => s.id === "override") ? (
            <div className="rounded border border-line-soft border-l-4 border-l-slate bg-surface p-3 text-sm">
              <p className="font-semibold text-strong">Rescheduled session</p>
              <p className="text-[14px] text-muted mt-0.5">
                {(() => {
                  // Phase F · prefer the block-object move_history's most-recent
                  // reason when available, fall back to legacy overrides.
                  const movedInBlock = Object.values(store.scheduled_blocks ?? {}).find(
                    (b) => b.actual_date === date && b.state === "moved" && b.planned_date !== date,
                  );
                  const blockReason = movedInBlock?.move_history?.[movedInBlock.move_history.length - 1]?.reason;
                  return (
                    blockReason ??
                    store.scheduled_overrides?.[date]?.reason ??
                    "Moved from another day"
                  );
                })()}
              </p>
            </div>
          ) : null}

          {/* Morning-check overdue nudge. */}
          {signals.some((s) => s.id === "check-overdue") ? (
            <div className="rounded border border-amber/40 border-l-4 border-l-amber bg-amber/10 p-3 text-sm">
              <p className="font-semibold text-strong">Morning check overdue</p>
              <p className="text-[14px] text-muted mt-1">
                Load adjustment, red-state gating, and the notes engine all key off the
                morning check. A minute of tapping now makes the rest of the day&apos;s
                recommendations mean something.
              </p>
              <Link
                href="/check/"
                className="inline-block mt-2 text-[14px] text-amber border-b border-amber hover:opacity-80"
              >
                Log check now →
              </Link>
            </div>
          ) : null}

          {/* Cycle-end proposal — signal chip on Today, action on Progress. */}
          {signals.some((s) => s.id === "cycle-end") ? (
            <div className="rounded border border-slate/40 border-l-4 border-l-slate bg-slate/10 p-3 text-sm">
              <p className="font-semibold text-strong">Cycle-end evaluation ready</p>
              <p className="text-[14px] text-muted mt-1">
                The engine has TM changes to propose based on the last cycle&apos;s AMRAP + symptom pattern. Review and Apply on Progress; nothing changes until you tap Apply.
              </p>
              <Link
                href="/progress/"
                className="inline-block mt-2 text-[14px] text-slate border-b border-slate hover:opacity-80"
              >
                Review on Progress →
              </Link>
            </div>
          ) : null}

          {/* Pause / soften proposal — same pattern. */}
          {signals.some((s) => s.id === "pause") ? (
            <div className="rounded border border-amber/40 border-l-4 border-l-amber bg-amber/10 p-3 text-sm">
              <p className="font-semibold text-strong">Back after a break</p>
              <p className="text-[14px] text-muted mt-1">
                14+ days without a logged strength session. The engine can soften your first week back to protect against a compressed-return spike.
              </p>
              <Link
                href="/progress/"
                className="inline-block mt-2 text-[14px] text-amber border-b border-amber hover:opacity-80"
              >
                Review on Progress →
              </Link>
            </div>
          ) : null}

          {/* CSM amber-week 4×4 advisory. Signal-computed at
              SignalsStrip.tsx:154; expanded body was missing a render
              branch so the label never showed — phantom fix. CSM delta-2
              (2026-08-19) caught. */}
          {signals.some((s) => s.id === "csm-amber-week") ? (
            <div className="rounded border border-amber/40 border-l-4 border-l-amber bg-amber/10 p-3 text-sm">
              <p className="font-semibold text-strong">Amber week detected</p>
              <p className="text-[14px] text-muted mt-1">
                {signals.find((s) => s.id === "csm-amber-week")?.label ??
                  "Multiple amber days this week — plan will drop 4×4 next week"}
                .{" "}
                Program authors: `concurrent-strength-maintenance.json:541` says
                &quot;drop 4×4 for a week&quot;. Scheduled-block swap is coming
                — until then, feel free to substitute an easy Z2 recovery on
                Thu.
              </p>
            </div>
          ) : null}

          {/* Positive-adaptation advisory — mirror of the pause pattern. */}
          {signals.some((s) => s.id === "positive-adaptation") ? (
            <div className="rounded border border-slate/40 border-l-4 border-l-slate bg-slate/10 p-3 text-sm">
              <p className="font-semibold text-strong">Trending well</p>
              <p className="text-[14px] text-muted mt-1">
                {signals.find((s) => s.id === "positive-adaptation")?.label}. Progress → Retest lets you log the reading + review the tier-advance proposal.
              </p>
              <Link
                href="/progress/"
                className="inline-block mt-2 text-[14px] text-slate border-b border-slate hover:opacity-80"
              >
                Review on Progress →
              </Link>
            </div>
          ) : null}

          {/* Delegated components — each renders null when inactive. */}
          <AssessmentDueBanner date={date} />
        </div>
      ) : null}
    </section>
  );
}
