"use client";

/**
 * Cut C · Record surface · Trend-section RetestTimeline.
 *
 * Horizontal scrolling strip of retest events with:
 * - Tri-color pins by outcome (hit/hold/back — NEVER red per R8)
 * - Milestone size-modulation for cycle-end retests
 * - Date labels every ~3rd pin at 44px hitbox for tap
 * - Base → Now → Delta summary line (tabular-nums)
 * - Terminal ▲today marker
 * - Tap on any pin → per-event citation sheet (Phase 3 wiring)
 *
 * See dev/active/redesign-progress/DESIGN-cut-c.md · RetestTimeline
 * See mockup: dev/active/redesign-progress/record-mockup-day400-v3.png
 *
 * This IS Terav's tenure-identity artifact — no peer in the 31-app
 * matrix has this pattern (TrainingPeaks compliance dots live inside
 * workout view, Peloton milestones are counters not events, Whoop
 * year-in-review is annual bounded). Category vacancy Terav owns.
 *
 * Retest events supersede PRs per R-CutC-1 — no "achievement" copy.
 * Batch 37 pattern reminder: no `?? []` inside a useStore selector.
 * Data flows via props.
 */

import { useMemo } from "react";
import type { Program, Store } from "@/lib/schemas";
import {
  evaluateRetestMetrics,
  formatMetric,
  type RetestValue,
} from "@/lib/engine/retest-evaluator";
import { cn } from "@/lib/utils";

export type CutCRetestTimelineProps = {
  program: Program;
  store: Store;
  className?: string;
  /**
   * Callback when a pin is tapped. Parent opens a bottom sheet with
   * the per-event citation. Optional — no-op if omitted.
   */
  onPinTap?: (metricId: string, observedAt: string) => void;
};

/**
 * Outcome direction per reading — compared to the *previous* reading
 * in that metric's series, respecting the metric's direction
 * ("higher_is_better" for kg / distance, "lower_is_better" for pain /
 * HR-at-effort).
 */
type Outcome = "hit" | "hold" | "back";

function outcomeFor(
  m: RetestValue,
  value: number,
  prev: number | null,
): Outcome {
  if (prev == null) return "hold"; // first reading = neutral baseline
  const diff = value - prev;
  if (Math.abs(diff) < 0.001) return "hold";
  const higherBetter = m.direction === "higher_is_better";
  const improved = higherBetter ? diff > 0 : diff < 0;
  return improved ? "hit" : "back";
}

/**
 * Build the flat event list to render — one pin per reading, ordered
 * by observed_at. Picks the metric with the most readings (the
 * "primary" retest metric for this program).
 */
function buildEvents(
  program: Program,
  store: Store,
): { metric: RetestValue | null; events: Array<{ observed_at: string; value: number; outcome: Outcome; isMilestone: boolean }> } {
  const userTier = program.slug
    ? store.user_profile?.program_states?.[program.slug]?.tier
    : undefined;
  const values = evaluateRetestMetrics(program, store, userTier);
  const withData = values.filter((v) => v.current != null);
  if (withData.length === 0) return { metric: null, events: [] };

  const readings = store.retest_readings ?? [];
  // Pick the metric with the most readings — that's the "primary"
  // tenure metric for the current program. Multi-metric programs
  // (Rowing 2K has both threshold pace + weekly volume) would need
  // a metric selector; deferred to Cut A.
  let primary: RetestValue = withData[0];
  let primaryCount = 0;
  for (const v of withData) {
    const count = readings.filter((r) => r.metric_id === v.metric_id).length;
    if (count > primaryCount) {
      primaryCount = count;
      primary = v;
    }
  }

  const primaryReadings = readings
    .filter((r) => r.metric_id === primary.metric_id)
    .sort((a, b) => a.observed_at.localeCompare(b.observed_at));

  const cadenceWeeks = primary.cadence_weeks ?? 4;
  const events = primaryReadings.map((r, i) => {
    const prev = i > 0 ? primaryReadings[i - 1].value : null;
    // Milestone = every cycle-end (matches at_week or cadence_weeks boundary).
    // Simple heuristic: every 3rd reading is a milestone (matches Cut C mockup).
    // Refined per-program logic ships in Cut A.
    const isMilestone = (i + 1) % 3 === 0 || i === primaryReadings.length - 1;
    void cadenceWeeks; // reserved for future refinement
    return {
      observed_at: r.observed_at,
      value: r.value,
      outcome: outcomeFor(primary, r.value, prev),
      isMilestone,
    };
  });

  return { metric: primary, events };
}

export function CutCRetestTimeline({ program, store, className, onPinTap }: CutCRetestTimelineProps) {
  const { metric, events } = useMemo(() => buildEvents(program, store), [program, store]);

  if (!metric || events.length === 0) {
    return (
      <div className={cn("rounded border border-line-soft bg-surface p-3", className)}>
        <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted mb-1">
          Retests · 0 events
        </p>
        <p className="text-[12px] text-muted italic">
          Your retest history builds here — each reading tied to the study or log signal that triggered it.
        </p>
      </div>
    );
  }

  const first = events[0];
  const last = events[events.length - 1];
  const baselineStr = formatMetric(first.value, metric.unit);
  const nowStr = formatMetric(last.value, metric.unit);
  const rawDelta = last.value - first.value;
  const higherBetter = metric.direction === "higher_is_better";
  const isImprovement = higherBetter ? rawDelta > 0 : rawDelta < 0;
  const deltaSign = rawDelta > 0 ? "+" : rawDelta < 0 ? "−" : "";
  const deltaAbs =
    metric.unit === "seconds"
      ? `${Math.round(Math.abs(rawDelta))}s`
      : Math.abs(rawDelta).toFixed(1);

  return (
    <div
      role="group"
      aria-label={`${events.length} retest events for ${metric.display_name} · overall delta ${deltaSign}${deltaAbs} ${metric.unit}`}
      className={cn("rounded border border-line-soft bg-surface p-3", className)}
    >
      <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted mb-2">
        Retests · {events.length} events
      </p>

      {/* Pin row — horizontal scroll with 44px hitbox per pin, scroll-snap
          for tap-then-scroll comfort. */}
      <div
        className="flex items-center gap-0 overflow-x-auto pb-2 pl-5 -ml-5"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {events.map((ev, i) => {
          const pinBg =
            ev.outcome === "hit"
              ? "bg-[var(--dv-retest-hit)]"
              : ev.outcome === "back"
                ? "bg-[var(--dv-retest-back)]"
                : "bg-[var(--dv-retest-hold)]";
          const pinSize = ev.isMilestone ? "w-3 h-3" : "w-2.5 h-2.5";
          return (
            <div key={ev.observed_at + i} className="flex items-center flex-none" style={{ scrollSnapAlign: "center" }}>
              <button
                type="button"
                aria-label={`Retest on ${ev.observed_at} · outcome ${ev.outcome} · value ${formatMetric(ev.value, metric.unit)}`}
                onClick={() => onPinTap?.(metric.metric_id, ev.observed_at)}
                className="min-h-[44px] w-[22px] flex items-center justify-center focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2 rounded"
              >
                <span
                  aria-hidden
                  className={cn(
                    "rounded-full border border-strong",
                    pinSize,
                    pinBg,
                  )}
                />
              </button>
              {i < events.length - 1 ? (
                <span aria-hidden className="w-3 h-px bg-line-strong flex-none" />
              ) : (
                <span aria-hidden className="ml-1 text-strong text-[14px]">▲</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Date range labels */}
      <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted">
        <span>{first.observed_at}</span>
        <span>today</span>
      </div>

      {/* Base · Now · Delta summary — tabular-nums */}
      <p className="mt-2 font-mono text-[12px] text-ink tabular-nums">
        Base {baselineStr} · Now {nowStr} · {deltaSign}
        {deltaAbs} {isImprovement ? "" : "(direction check)"}
      </p>

      {/* Tap hint — points to Phase 3 wiring for per-event citation sheet */}
      <p className="mt-1 text-[11px] text-muted italic">
        Tap any pin for the source behind that retest →
      </p>
    </div>
  );
}
