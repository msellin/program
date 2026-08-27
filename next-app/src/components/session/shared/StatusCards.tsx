"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProgramManifest } from "@/lib/data-loader";
import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import { evaluateRetestMetrics, formatMetric, deltaFromBaseline } from "@/lib/engine/retest-evaluator";
import { programDisplayName } from "@/lib/day-format";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import type { Program, ProgramManifest, Store } from "@/lib/schemas";

/**
 * Day redesign (2026-08-23) — extracted verbatim from `TodaySession.tsx`
 * (RestDayCard, RetestReminder, GraduationCard, GraduationFeedback,
 * VerbRow) so `DaySession.tsx` (the new /session/[slug] shell) can reuse
 * the exact same empty/end-state logic instead of re-deriving it. The
 * README's "carried over unchanged" list names rest-day/graduation/taper
 * states explicitly — this file is that carry-over. Dashboard mode (`/`,
 * via TodaySession.tsx) imports these too; behavior for `/` is
 * unchanged, just relocated.
 */

export function RestDayCard({
  variant = "rest",
  programName,
  firstSessionDate,
  programSlug,
}: {
  variant?: "rest" | "before" | "away" | "holiday" | "test";
  programName?: string;
  firstSessionDate?: string;
  programSlug?: string;
}) {
  if (variant === "test") {
    return (
      <div className="rounded border border-bronze/30 border-l-4 border-l-bronze bg-bronze/10 p-4 text-sm">
        <p className="font-semibold text-strong">Test day.</p>
        <p className="mt-1 text-muted">
          The 2K test is on. Warm-up 15-20 min including 2-3 short race-pace pieces.
          Log the result via the session card below — the retest metric picks it up.
        </p>
      </div>
    );
  }
  if (variant === "before") {
    const humanDate = firstSessionDate
      ? new Date(firstSessionDate + "T00:00:00").toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        })
      : null;
    const isRowing = programSlug === "rowing-2k-test-prep";
    return (
      <div className="rounded border border-line-soft border-l-4 border-l-bronze bg-surface p-4 text-sm">
        <p className="font-semibold text-strong">
          {humanDate ? `First session on ${humanDate}.` : "Before the program starts."}
        </p>
        <p className="mt-1 text-muted">
          {isRowing
            ? "You've scheduled your test date further out than the program's 6-week arc. Use the intervening weeks to keep easy Z2 volume — log any sessions via the card below and they'll anchor your baseline."
            : "You're looking at a day before Phase 1 begins. Log any training you do via the card below — it counts toward your history."}
        </p>
      </div>
    );
  }
  if (variant === "away") {
    return (
      <div className="rounded border border-bronze/30 border-l-4 border-l-bronze bg-bronze/10 p-4 text-sm">
        <p className="font-semibold text-strong">Away today.</p>
        <p className="mt-1 text-muted">
          No prescribed session. If you do something anyway — a ride, a run, a
          class — log it below; the engine still reads it.
        </p>
      </div>
    );
  }
  if (variant === "holiday") {
    return (
      <div className="rounded border border-line-soft border-l-4 border-l-line bg-surface p-4 text-sm">
        <p className="font-semibold">Holiday / light period.</p>
        <p className="mt-1 text-muted">
          Documented light window between Phase 4 (test) and Phase 5 (Hatch). No prescribed strength session.
          Optional 60% TM movement work; see the Extras tab.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded border border-line-soft border-l-4 border-l-line bg-surface p-4 text-sm">
      <p className="font-semibold">Rest day.</p>
      <p className="mt-1 text-muted">
        {programName ? `${programName} has no session on the schedule today. ` : "No session on the schedule today. "}
        Optional work (accessories, mobility, easy movement) lives on the Extras tab and still logs to today.
      </p>
    </div>
  );
}

export function RetestReminder({
  program,
  profile,
  activeDate,
}: {
  program: Program;
  profile: Store["user_profile"] | undefined;
  activeDate: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  const metrics = (program as unknown as { retest_metrics?: Array<{ cadence_weeks?: number; display_name?: string }> }).retest_metrics;
  const cadences = (metrics ?? [])
    .map((m) => (typeof m.cadence_weeks === "number" ? m.cadence_weeks : null))
    .filter((c): c is number => c != null && c > 0);
  const startedRaw =
    profile?.program_states?.[program.slug ?? ""]?.started_at ??
    profile?.active_program_started_at;
  const startedISO = startedRaw?.slice(0, 10);
  const startMs = startedISO ? new Date(startedISO + "T00:00:00").getTime() : NaN;
  const nowMs = new Date(activeDate + "T00:00:00").getTime();
  const daysIn = Number.isFinite(startMs) && Number.isFinite(nowMs)
    ? Math.floor((nowMs - startMs) / 864e5)
    : 0;
  const weeksIn = daysIn > 0 ? Math.floor(daysIn / 7) : 0;
  const dow = new Date(activeDate + "T12:00:00").getDay(); // 0 Sun, 1 Mon

  // ISO week key so the "Not this week" dismiss re-fires next Monday.
  const isoWeekKey = (() => {
    const d = new Date(activeDate + "T12:00:00");
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weeks = Math.ceil(((d.getTime() - yearStart.getTime()) / 864e5 + yearStart.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(weeks).padStart(2, "0")}`;
  })();
  const dismissKey = program.slug ? `retest.dismissed.${program.slug}.${isoWeekKey}` : null;

  useEffect(() => {
    if (typeof window === "undefined" || !dismissKey) return;
    setDismissed(localStorage.getItem(dismissKey) === "1");
  }, [dismissKey]);

  if (!metrics?.length || !cadences.length) return null;
  if (!startedISO || !Number.isFinite(startMs) || !Number.isFinite(nowMs)) return null;
  if (daysIn < 7) return null;
  if (dow !== 1) return null;
  const dueThisWeek = cadences.some((c) => weeksIn > 0 && weeksIn % c === 0);
  if (!dueThisWeek) return null;
  if (dismissed) return null;

  const displayMetrics = metrics.slice(0, 4);

  const onDismiss = () => {
    if (!dismissKey) return;
    try {
      localStorage.setItem(dismissKey, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="rounded border border-bronze/30 border-l-4 border-l-bronze bg-bronze/10 p-4 text-[14px] space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-widest text-bronze">
        Retest window open
      </p>
      <p className="font-semibold text-strong">
        End of week {weeksIn} · {program.program_goal?.display_name ?? program.slug}
      </p>
      <p className="text-muted leading-snug">
        You&apos;ve logged {weeksIn} weeks. The retest catches whether the arc
        actually moved the numbers.
      </p>
      {displayMetrics.length > 0 ? (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
            Log these on Progress → Insights
          </p>
          <ul className="mt-1 space-y-0.5">
            {displayMetrics.map((m, idx) => (
              <li key={idx} className="text-[13px] text-ink flex items-baseline gap-1.5">
                <span aria-hidden className="text-muted">·</span>
                <span>{m.display_name ?? "Metric"}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2 pt-1">
        <Link
          href="/progress"
          className="text-[14px] font-semibold px-4 py-2 rounded bg-bronze text-ground hover:bg-bronze-hover min-h-[44px] inline-flex items-center"
        >
          Log retest →
        </Link>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[14px] font-semibold px-4 py-2 rounded border border-line text-ink hover:bg-line-soft min-h-[44px]"
        >
          Not this week
        </button>
      </div>
    </div>
  );
}

function VerbRow({
  label,
  caption,
  variant,
  onClick,
}: {
  label: string;
  caption: string;
  variant: "primary" | "secondary";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        variant === "primary"
          ? "w-full text-left rounded bg-bronze text-ground active:bg-bronze-active px-3 py-2.5 min-h-[52px]"
          : "w-full text-left rounded border border-line-soft bg-surface active:bg-line-soft/60 px-3 py-2.5 min-h-[52px]"
      }
    >
      <p
        className={
          variant === "primary"
            ? "text-[14px] font-semibold"
            : "text-[14px] font-semibold text-ink"
        }
      >
        {label}
      </p>
      <p
        className={
          variant === "primary"
            ? "text-[12px] text-ground/80 mt-0.5"
            : "text-[12px] text-muted mt-0.5"
        }
      >
        {caption}
      </p>
    </button>
  );
}

export function GraduationCard({ program }: { program: Program }) {
  const store = useStore((s) => s.store);
  const removeActiveProgram = useStore((s) => s.removeActiveProgram);
  const markGraduated = useStore((s) => s.markGraduated);
  const restartProgram = useStore((s) => s.restartProgram);
  const extendProgram = useStore((s) => s.extendProgram);
  const pauseProgram = useStore((s) => s.pauseProgram);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [manifest, setManifest] = useState<ProgramManifest | null>(null);
  const userTier = program.slug
    ? store.user_profile?.program_states?.[program.slug]?.tier
    : undefined;
  const metrics = evaluateRetestMetrics(program, store, userTier ?? undefined);
  const startedAt =
    (program.slug && store.user_profile?.program_states?.[program.slug]?.started_at) ||
    store.user_profile?.active_program_started_at ||
    undefined;
  const weeksIn = (() => {
    if (!startedAt) return null;
    const start = new Date(startedAt.slice(0, 10) + "T00:00:00").getTime();
    const now = Date.now();
    const days = Math.floor((now - start) / 864e5);
    return days > 0 ? Math.floor(days / 7) : null;
  })();

  const displayable = metrics.filter((m) => m.supported && m.current != null);

  const programName = program.slug
    ? programDisplayName(program, program.slug)
    : program.program_goal?.display_name ?? "Your program";

  // Follow-on program pointer. Programs authored as `block_1_of_N` can
  // declare `next_block_slug` in JSON to link to Block 2. Falls back to
  // a generic Programs catalog CTA.
  const nextBlockSlug =
    (program as unknown as { next_block_slug?: string }).next_block_slug ??
    (program.goals as unknown as { next_block_slug?: string })?.next_block_slug ??
    null;
  const nextBlockEntry = nextBlockSlug
    ? manifest?.programs.find((p) => p.slug === nextBlockSlug) ?? null
    : null;

  // Arc-verdict chip — compare current-vs-baseline against block_1_targets.
  const blockTargets =
    (program.goals as unknown as { block_1_targets?: Record<string, number[]> })
      ?.block_1_targets ?? null;
  const arcVerdict = (() => {
    if (!displayable.length || !blockTargets) return null;
    let hit = 0;
    let total = 0;
    for (const m of displayable) {
      const delta = deltaFromBaseline(m);
      if (!delta) continue;
      total++;
      if (delta.isImprovement) hit++;
    }
    if (total === 0) return null;
    if (hit === total) return { tone: "green" as const, label: "Targets hit" };
    if (hit > 0) return { tone: "amber" as const, label: `${hit}/${total} on track` };
    return { tone: "red" as const, label: "Below target" };
  })();

  // Load manifest for next-block preview + write graduated_at once.
  useEffect(() => {
    void loadProgramManifest().then(setManifest).catch(() => setManifest(null));
    if (program.slug) {
      const already = store.user_profile?.program_states?.[program.slug]?.graduated_at;
      if (!already) markGraduated(program.slug, todayISO());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program.slug]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-bronze/40 border-l-4 border-l-bronze bg-bronze/[0.06] p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-bronze">You finished</p>
            <h2 className="text-lg font-semibold text-strong mt-1">{programName}</h2>
            {weeksIn ? (
              <p className="text-[14px] text-muted mt-0.5">
                {weeksIn} weeks logged. Nice.
              </p>
            ) : null}
          </div>
          {arcVerdict ? (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-line-soft text-muted inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${
                  arcVerdict.tone === "green"
                    ? "bg-green"
                    : arcVerdict.tone === "amber"
                      ? "bg-amber"
                      : "bg-red"
                }`}
              />
              {arcVerdict.label}
            </span>
          ) : null}
        </div>
        {displayable.length ? (
          <div className="rounded border border-line-soft bg-surface p-3 space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Where you landed</p>
            <ul className="space-y-1.5">
              {displayable.map((m) => {
                const delta = deltaFromBaseline(m);
                return (
                  <li key={m.metric_id} className="flex items-baseline justify-between gap-2 text-[14px]">
                    <span className="text-ink truncate">{m.display_name}</span>
                    <span className="font-mono flex items-baseline gap-2 flex-shrink-0">
                      <span className="text-strong">{formatMetric(m.current, m.unit)}</span>
                      {delta ? (
                        <span className={delta.isImprovement ? "text-green" : "text-red"}>
                          {delta.value >= 0 ? "+" : ""}
                          {formatMetric(delta.value, m.unit)}
                        </span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <p className="text-[14px] text-muted italic">
            No retest metrics recorded — head to Progress to log your final numbers.
          </p>
        )}
        {nextBlockEntry ? (
          <Link
            href={`/programs/${nextBlockEntry.slug}`}
            className="block rounded border border-slate/40 bg-slate/[0.06] p-3 hover:bg-slate/10 transition-colors"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate">Next block</p>
            <p className="text-sm font-semibold text-strong mt-0.5">{nextBlockEntry.name}</p>
            <p className="text-[12px] text-muted mt-1 line-clamp-2">
              {nextBlockEntry.short_description ?? "The next arc in this program family."}
            </p>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate mt-1.5">
              Preview →
            </p>
          </Link>
        ) : null}
        <div className="space-y-2 pt-1">
          {program.slug ? (
            <VerbRow
              variant="primary"
              label="Repeat this arc"
              caption="Restart · keep intake + baselines"
              onClick={() => {
                if (!program.slug) return;
                restartProgram(program.slug, todayISO());
              }}
            />
          ) : null}
          {program.slug ? (
            <VerbRow
              variant="secondary"
              label="Extend +4 weeks"
              caption="Push the retest date · keep the arc going"
              onClick={() => {
                if (!program.slug) return;
                extendProgram(program.slug, 4);
              }}
            />
          ) : null}
          {program.slug ? (
            <VerbRow
              variant="secondary"
              label="Take a break"
              caption="Pauses Today · stays in your programs list"
              onClick={() => {
                if (!program.slug) return;
                pauseProgram(program.slug, todayISO());
              }}
            />
          ) : null}
          <Link
            href="/programs"
            className="block rounded border border-slate/40 bg-surface active:bg-slate/10 px-3 py-2.5 min-h-[52px]"
          >
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate">
              Pick your next focus →
            </p>
            <p className="text-[12px] text-muted mt-0.5">
              {nextBlockEntry ? "Preview the next block or browse the catalog" : "Browse the catalog"}
            </p>
          </Link>
        </div>
        <GraduationFeedback slug={program.slug ?? null} />
        <button
          type="button"
          onClick={() => setConfirmEnd(true)}
          className="self-start min-h-11 inline-flex items-center px-3 -mx-3 text-[12px] text-red hover:text-red-strong hover:bg-line-soft rounded"
        >
          End this program
        </button>
      </div>
      <ConfirmSheet
        open={confirmEnd}
        title={`End "${programName}"?`}
        body="Your log history stays. You'll return to the catalog to pick another."
        confirmLabel="End program"
        danger
        onConfirm={() => {
          setConfirmEnd(false);
          if (program.slug) removeActiveProgram(program.slug);
        }}
        onCancel={() => setConfirmEnd(false)}
      />
    </div>
  );
}

function GraduationFeedback({ slug }: { slug: string | null }) {
  const stored = useStore((s) =>
    slug ? s.store.user_profile?.program_states?.[slug]?.graduation_feedback : undefined,
  );
  const saveGraduationFeedback = useStore((s) => s.saveGraduationFeedback);
  const [rating, setRating] = useState<number | null>(stored?.rating ?? null);
  const [note, setNote] = useState<string>(stored?.note ?? "");
  const [open, setOpen] = useState(!stored);
  if (!slug) return null;

  if (!open && stored) {
    return (
      <p className="text-[12px] text-muted italic pt-1">
        You rated this arc {stored.rating}/5.{" "}
        <button
          type="button"
          className="underline decoration-muted/40 hover:text-ink"
          onClick={() => setOpen(true)}
        >
          Change
        </button>
      </p>
    );
  }

  return (
    <div className="rounded border border-line-soft bg-surface p-3 space-y-2">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
        How was this arc?
      </p>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={`Rate ${n} of 5`}
            className={`w-11 h-11 rounded font-mono text-sm ${
              rating === n
                ? "bg-bronze text-ground"
                : "border border-line text-muted hover:text-ink"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional — what worked, what didn't, what surprised you"
        className="w-full text-[14px] px-2 py-1.5 border border-line rounded bg-ground focus:outline-none focus:ring-2 focus:ring-bronze focus:border-bronze resize-none"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={rating == null}
          onClick={() => {
            if (rating == null) return;
            saveGraduationFeedback(slug, rating, note.trim() || undefined);
            setOpen(false);
          }}
          className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground hover:bg-bronze-hover disabled:opacity-40 disabled:cursor-not-allowed min-h-[36px]"
        >
          Save
        </button>
        {stored ? (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-line text-muted hover:text-ink min-h-[36px]"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}
