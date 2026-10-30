"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, ChevronRight, Minus, MoreHorizontal } from "lucide-react";
import { loadProgram, loadProgramManifest } from "@/lib/data-loader";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { useStore } from "@/lib/useStore";
import { today as todayISO, iso, cn } from "@/lib/utils";
import { humanPhaseName, humanBlockName } from "@/lib/day-format";
import { programProgress } from "@/lib/program-progress";
import { activePhaseFor, activePhaseForWeek } from "@/lib/engine/schedule";
import { blocksForDate } from "@/lib/engine/plan-generator";
import { getBlocksForDate, isBlockObjectOn, DAY_VISIBLE_BLOCK_STATES } from "@/lib/engine/block-selectors";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { MoveSheet } from "@/components/workout/MoveSheet";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { dayTracks, TRACK_STATE_LABEL, type TrackState } from "@/lib/plan-day-tracks";
import { ArcProgressBar } from "@/components/ui/ArcProgressBar";
import { humanizeExerciseId } from "@/lib/humanize-metrics";
import { detectMissedWeek } from "@/lib/engine/missed-week";
import { WeekRecoveryCard } from "@/components/plan/WeekRecoveryCard";
import type { DayLog, Phase, Program, RunLog, ScheduledBlock, Store } from "@/lib/schemas";
import { Card, cardClass } from "@/components/ui/Card";

type WeekDayEntry = {
  dateISO: string;
  label: string;
  hasSession: boolean;
  summary: string;
  isSource: boolean;
  isLogged: boolean;
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/**
 * How far ahead / behind Week lets you jump.
 *
 * Design call: we know exactly what's scheduled for the next few weeks
 * because phase dates are baked into program.json. But real training changes
 * — a skip cascades, life happens, the engine will propose adjustments after
 * cycles, and the plan itself will be revised as milestones hit or slip.
 *
 * So we let the user see roughly one cycle ahead / behind, not the full year.
 * If they want the whole timeline they can consult the milestones on Progress.
 */
const FUTURE_WEEKS = 6;
const PAST_WEEKS = 12;

type Wt = {
  week?: Array<{ day: string; session: string; conditioning?: string }>;
  principles?: string[];
  note?: string;
};

/**
 * A programme's standing rules — top-level `principles[]`, distinct from
 * `weekly_template.principles` (scheduling guidance, a plain string[]).
 */
type ProgramRule = { id?: string; rule: string; detail?: string };

export default function WeekPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [offset, setOffset] = useState(0);
  // One day open at a time, today on load (plan-tab-review 2026-10-29: every
  // opened day stayed open, and a few opened days filled the screen with
  // buttons). Tapping the open day closes it.
  const [openDay, setOpenDay] = useState<string | null>(() => todayISO());
  const toggleDay = (dateISO: string) => {
    setOpenDay((prev) => (prev === dateISO ? null : dateISO));
  };
  const hydrated = useStore((s) => s.hydrated);
  const store = useStore((s) => s.store);
  const skipped = useStore((s) => s.store.skipped);
  const clearSkip = useStore((s) => s.clearSkip);
  const overrides = useStore((s) => s.store.scheduled_overrides);
  const logs = useStore((s) => s.store.logs);
  const userProfile = useStore((s) => s.store.user_profile);
  const primarySlug = useStore((s) => s.store.user_profile?.active_program_id);
  const activeProgramIds = useStore((s) => s.store.user_profile?.active_program_ids);
  // Phase D · block-object rebuild — flag gate + block-object read.
  // See dev/active/block-object-rebuild-2026-08-18.md §5.
  const blockObjectOn = useStore((s) => isBlockObjectOn(s.store));
  const scheduledBlocksMap = useStore((s) => s.store.scheduled_blocks);
  const dismissProposal = useStore((s) => s.dismissProposal);
  const dismissedProposals = useStore((s) => s.store.dismissed_proposals);

  const activeSlugs: string[] = activeProgramIds && activeProgramIds.length
    ? primarySlug
      ? [primarySlug, ...activeProgramIds.filter((s) => s !== primarySlug)]
      : activeProgramIds
    : primarySlug
      ? [primarySlug]
      : [];
  const activeSlugsKey = activeSlugs.join("|");

  useEffect(() => {
    if (!activeSlugs.length) {
      // No program picked — don't fall back to the founder's default. Render
      // the empty state below instead of leaking anterior-hip's schedule.
      setPrograms([]);
      return;
    }
    void Promise.all(activeSlugs.map((s) => loadProgram(s))).then(setPrograms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlugsKey]);

  const program = programs[0] ?? null;

  const [manifestNames, setManifestNames] = useState<Record<string, string>>({});
  useEffect(() => {
    void loadProgramManifest()
      .then((m) => setManifestNames(Object.fromEntries(m.programs.map((p) => [p.slug, p.name]))))
      .catch(() => {});
  }, []);

  if (!hydrated) return <div className="mt-8 text-small text-muted">Loading…</div>;
  if (!activeSlugs.length) {
    return (
      <EmptyStateCard
        title="Your week starts once you pick a focus."
        body="The weekly rhythm shows up here once you pick a program — one session per row, colored by domain, with skipped-day cascade visible at a glance."
        cta={{ href: "/programs/", label: "Browse programs" }}
      />
    );
  }
  if (!program) return <div className="mt-8 text-small text-muted">Loading…</div>;

  const wt = program.weekly_template as Wt | undefined;
  const programRules = ((program as unknown as { principles?: ProgramRule[] }).principles ?? [])
    .filter((p) => typeof p?.rule === "string" && p.rule.trim().length > 0);
  /**
   * Required intake consents that describe a STOP behaviour (2026-09-11).
   *
   * Four programmes make the user tick "I agree to stop the session if
   * shoulder pain appears during a hang, transition, or support hold — no
   * training through it." It is `required: true`, so nobody starts these
   * programmes without agreeing to it.
   *
   * And then it was never mentioned again. Intake consents are captured once
   * and read nowhere afterwards — a commitment the user made about their own
   * mid-session behaviour, shown to them exactly once, on the screen where
   * they were trying to get started.
   *
   * This is the same defect the escalation rule above had, fixed the same
   * way: the rule already existed and simply reached the user through no
   * channel. It is NOT enforcement — the app cannot detect shoulder pain
   * during a set, and an in-session symptom input is a larger design change
   * than resurfacing a sentence. Logged separately rather than implied here.
   */
  const consentRules = (
    (program as unknown as {
      intake?: { consent?: Array<{ id?: string; label?: string; required?: boolean }> };
    }).intake?.consent ?? []
  )
    .filter((c) => c?.required && typeof c.label === "string")
    // `not_medical_advice` is a disclaimer, not a training rule — it belongs on
    // the disclaimer page, and repeating it here would bury the one that tells
    // someone to rack the bar.
    .filter((c) => /stop_rule|stops_session/.test(c.id ?? ""))
    .map((c) => `You agreed at intake — ${c.label}`);
  /**
   * The programme's escalation rule (2026-09-06).
   *
   * `progression_rules.escalation` is where six of the nine programmes put
   * their back-off and stop conditions — "two red days in a week, skip the
   * heavy session", "persistent shoulder pain over three days, stop and see
   * a clinician". Nothing read it and nothing rendered it, so those rules
   * reached the user through no channel at all.
   *
   * It is NOT enforced. There is no consecutive-red counter anywhere in the
   * app: the engine counts three GREEN days in a row to propose adding load
   * and counts nothing at all to propose backing off. Automating a "take a
   * week off and consult a clinician" recommendation is a decision about
   * what the app tells people, and it stays with the founder. Showing him
   * the rule he already wrote does not.
   */
  const escalation = (
    program as unknown as { progression_rules?: { escalation?: string } }
  ).progression_rules?.escalation;

  const now = new Date(todayISO() + "T00:00:00");
  const jsDow = now.getDay();
  const daysBackToMon = (jsDow + 6) % 7;
  const thisMon = new Date(now);
  thisMon.setDate(now.getDate() - daysBackToMon);
  const viewedMon = new Date(thisMon);
  viewedMon.setDate(thisMon.getDate() + offset * 7);

  const rangeLabel = `${viewedMon.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} → ${
    new Date(viewedMon.getTime() + 6 * 864e5).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    })
  }`;

  // Determine the dominant phase for the viewed week (use Mon; falls back to sample days if unset).
  const weekPhase = activePhaseForWeek(program, iso(viewedMon), userProfile);

  const atFutureEdge = offset >= FUTURE_WEEKS;
  const atPastEdge = offset <= -PAST_WEEKS;

  // F6 (Batch 24) — MoveSheet needs a full 14-day catalog (this week +
  // next week) to render its target-day radio list. Compute once per
  // Week render.
  const weekDaysCatalog: Array<{
    dateISO: string;
    label: string;
    hasSession: boolean;
    summary: string;
    isSource: boolean;
    isLogged: boolean;
  }> = [];
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const d = new Date(viewedMon);
    d.setDate(viewedMon.getDate() + dayOffset);
    const iSO = iso(d);
    const label = d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const catSkip = skipped?.[iSO];
    const catOverride = overrides?.[iSO];
    const catLog = logs?.[iSO];
    const logged = !!(
      catLog &&
      (Object.values(catLog.exercises).some((e) => e.done) ||
        (catLog.runs?.length ?? 0) > 0)
    );
    let hasSession = false;
    let summary = "Rest day";
    if (catOverride) {
      hasSession = true;
      summary = "Moved-in session";
    } else if (!catSkip) {
      const dayPhase = activePhaseFor(program, iSO, userProfile);
      const blocks = blocksForDate(
        program,
        userProfile,
        dayPhase,
        iSO,
        undefined,
        store,
      );
      if (blocks.length > 0) {
        hasSession = true;
        summary = blocks.map((b) => b.name).join(" + ");
      }
    } else if (catSkip.moved_to) {
      summary = `Moved to ${catSkip.moved_to}`;
    } else {
      summary = "Skipped";
    }
    weekDaysCatalog.push({
      dateISO: iSO,
      label,
      hasSession,
      summary,
      isSource: false,
      isLogged: logged,
    });
  }

  return (
    <div className="space-y-4 pt-4">
      {/* Design-lead brief 2026-08-19 §1.1: H1 promoted to 32 px semibold
          + Programs pill dropped off the header row (redundant with the
          bottom-nav Programs tab a step away). Subtitle gets mt-2
          breathing room. */}
      <header>
        <h1 className="text-h1 tracking-tight text-strong leading-none">
          Plan
        </h1>
      </header>

      {/* Batch 36 Step 14e · ArcProgressBar above the week nav when a
          single-program user with a resolvable phase week is on the
          current week. Multi-track suppressed (same reason as Today).
          Also suppressed when browsing past/future weeks — the
          progress bar represents "current phase week", not the
          browsed range. */}
      {offset === 0 && programProgress(program, todayISO(), userProfile) ? (
        (() => {
          const prog = programProgress(program, todayISO(), userProfile)!;
          const pair = { current: prog.weekN, total: prog.totalWeeks };
          const programName =
            (program.slug ? manifestNames[program.slug] : undefined) ??
            (program.slug
              ? program.slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
              : "Program");
          return (
            <ArcProgressBar
              programName={programName}
              weekCurrent={pair.current}
              weekTotal={pair.total}
              ariaLabel={`${programName} progress: week ${pair.current} of ${pair.total}.`}
            />
          );
        })()
      ) : null}

      {/* Bug fix 2026-08-18 (#71) — the forward arrow used to shift left when
          the "Now" affordance appeared on offset !== 0. Founder principle:
          containers must not shift. Now the "Now" button occupies a
          permanently-reserved slot (invisible on offset === 0). The row width
          stays constant across all offsets, so arrows and range label never
          move. */}
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface p-1">
        <button
          type="button"
          onClick={() => setOffset(offset - 1)}
          disabled={atPastEdge}
          aria-label="Previous week"
          className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-surface-2 text-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ‹
        </button>
        <div className="flex-1 text-center">
          <p className="text-small font-semibold text-strong leading-tight">
            {rangeLabel}{" "}
            <span className="font-normal text-muted">
              · {offset === 0
                ? "This week"
                : offset === 1
                  ? "Next week"
                  : offset === -1
                    ? "Last week"
                    : `${offset > 0 ? "+" : ""}${offset} weeks`}
            </span>
          </p>
          {/* One line: the phase wrapped to two in the switcher (r23). */}
          <p className="mt-0.5 text-caption font-medium text-muted truncate">
            {weekPhase
              ? humanPhaseName(weekPhase.name)
                  .replace(/interleaved consolidation/i, "Mixed practice")
                  .replace(/\s+for all tiers$/i, "")
              : "No phase this week"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOffset(offset + 1)}
          disabled={atFutureEdge}
          aria-label="Next week"
          className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-surface-2 text-muted hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ›
        </button>
        <button
          type="button"
          onClick={() => setOffset(0)}
          disabled={offset === 0}
          aria-label={offset === 0 ? "Currently on this week" : "Jump to this week"}
          aria-hidden={offset === 0}
          tabIndex={offset === 0 ? -1 : 0}
          className={cn(
            "w-11 h-11 flex items-center justify-center rounded-lg text-eyebrow",
            offset === 0
              ? "invisible pointer-events-none"
              : "hover:bg-surface-2 text-bronze",
          )}
        >
          Now
        </button>
      </div>

      {atFutureEdge ? (
        <p className="text-small text-muted italic">
          Looking further ahead than {FUTURE_WEEKS} weeks isn&apos;t useful — the plan will have
          adapted by then. See milestones on Progress for the year-long shape.
        </p>
      ) : null}

      {/* Design package t3/3b ("the week going wrong"), 2026-08-23 —
          dismissible banner above the day-list, current week only. Present-
          tense nudge, not archaeology on browsed weeks — see
          dev/active/week-recovery-plan.md for why this is a banner rather
          than the mockup's full-page replacement, and why it supersedes
          MissedSessionPrompt (removed from the Day dashboard). */}
      {offset === 0
        ? (() => {
            const signal = detectMissedWeek(program, store, userProfile, todayISO());
            if (!signal) return null;
            if (dismissedProposals?.[signal.weekStartISO]?.includes("week-recovery")) return null;
            return (
              <WeekRecoveryCard
                program={program}
                signal={signal}
                onDismiss={() => dismissProposal(signal.weekStartISO, "week-recovery")}
              />
            );
          })()
        : null}

      {/* Bug fix 2026-08-18 · founder reported empty Week view on Handstand
          Walk. Cause: the prior top-level bail on `!wt?.week` skipped
          rendering for any program whose weekly_template uses tier-specific
          reference weeks (multi_dimensional strategy — HSW, First Pull-Up)
          or per-week overrides (engine-builder's week_1 / week_2 shape).
          The per-day loop below already handles missing `templateEntry`
          gracefully — no bail needed. */}
      <Card flush className="divide-y divide-line-soft">
          {DAY_NAMES.map((dayName, i) => {
            const dateForDay = new Date(viewedMon);
            dateForDay.setDate(viewedMon.getDate() + i);
            const dateISO = iso(dateForDay);
            const templateEntry = wt?.week?.[i];
            // Legacy day-state readers. Block-object mode overrides these
            // via `blocksTodayByProgram` below, but `skip` / `override` are
            // still consulted for the reason string + line-through styling
            // until Phase F removes the legacy fields.
            const skip = skipped?.[dateISO];
            const override = overrides?.[dateISO];
            // Phase D · block-object per-program read for this day.
            const blocksTodayByProgram: Record<string, ScheduledBlock[]> = {};
            if (blockObjectOn) {
              const blocksForThisDay = getBlocksForDate(
                { scheduled_blocks: scheduledBlocksMap } as Store,
                dateISO,
              );
              for (const b of blocksForThisDay) {
                (blocksTodayByProgram[b.program_slug] ??= []).push(b);
              }
            }
            const isToday = dateISO === todayISO();
            const dayLog = logs?.[dateISO];
            // One status per day: legacy skip map OR every block skipped.
            const dayBlocks = Object.values(blocksTodayByProgram).flat();
            const rawSkipped = !!skip || (dayBlocks.length > 0 && dayBlocks.every((b) => b.state === "skipped"));
            const doneCount = dayLog
              ? Object.values(dayLog.exercises).filter((e) => e.done).length
              : 0;
            // 2026-08-30 — the collapsed header counted logged EXERCISES only,
            // so a day carrying nothing but activities read as a bare "rest"
            // with no marker at all. A founder week with a CrossFit class, two
            // 50 km rides and a paddle showed as four empty rest days until
            // each was expanded. Activities are logged work; count them.
            const runCount = dayLog?.runs?.length ?? 0;
            const totalPrescribed = dayLog
              ? Object.keys(dayLog.exercises).length
              : 0;
            const complianceRatio =
              totalPrescribed > 0 ? doneCount / totalPrescribed : 0;
            const dayPhase = activePhaseFor(program, dateISO, userProfile);
            const isPast = dateISO < todayISO();

            // Per-day phase-correct block list — iterated over every active
            // program. Blocks get tagged with their source program so the row
            // can show a "×N programs" hint when multiple contribute.
            let displayBlocks: { id: string; name: string; programSlug?: string }[];
            let displayLabel: string;
            if (override) {
              displayBlocks = override.blocks
                .map((id) => program.blocks.find((b) => b.id === id))
                .filter((b): b is NonNullable<typeof b> => !!b)
                .map((b) => ({ id: b.id, name: b.name }));
              displayLabel = "Moved-in session";
            } else {
              // 2026-08-24 — Plan used to derive every day's blocks from
              // phase math even when `block_object` was on, while Day read
              // materialized `scheduled_blocks`. Two sources, one question:
              // Plan would count "2 tracks" for a day Day rendered as one.
              // Read the same map Day reads, with the same state filter.
              const perProgram = programs.map((p, pi) => {
                const slug = activeSlugs[pi];
                if (blockObjectOn) {
                  const scheduled = (blocksTodayByProgram[slug] ?? []).filter((sb) =>
                    DAY_VISIBLE_BLOCK_STATES.includes(sb.state),
                  );
                  return {
                    slug,
                    blocks: scheduled
                      .map((sb) => p.blocks.find((b) => b.id === sb.block_template_id))
                      .filter((b): b is NonNullable<typeof b> => !!b),
                  };
                }
                return {
                  slug,
                  blocks: blocksForDate(
                    p,
                    userProfile,
                    activePhaseFor(p, dateISO, userProfile),
                    dateISO,
                    undefined,
                    store,
                  ),
                };
              });
              displayBlocks = perProgram.flatMap((g) =>
                g.blocks.map((b) => ({ id: b.id, name: b.name, programSlug: g.slug })),
              );
              displayLabel = displayBlocks.length ? "" : "Rest / accessory day";
            }

            // The row already says the day: "Mon — heavy squat day" under
            // "Mon" said it twice (copy, r23).
            const blockNames = displayBlocks.map((b) => withoutDayPrefix(humanBlockName(b.name)));
            const names = blockNames.join(" + ");
            // Collapsed, the line clamp cut mid-phrase ("pre-bed +…"); name the
            // first block and count the rest instead (plan-tab-review r2).
            const collapsedNames =
              blockNames.length > 1 ? `${blockNames[0]} + ${blockNames.length - 1} more` : names;
            const isRest = displayBlocks.length === 0 && !override;
            // A skip on a day with nothing scheduled is a rest day, not a skipped session.
            const daySkipped = rawSkipped && !(isRest && dayBlocks.length === 0);
            // A skipped training day is not a rest day, even though its blocks are gone from the list.
            if (daySkipped && displayLabel === "Rest / accessory day") displayLabel = "Skipped session";

            // Pick a single status the leading dot represents. Priority order picks
            // the most action-relevant state; the rest goes into the subline text.
            // TrainingPeaks-style compliance colouring: partial completion gets
            // its own shade, missed-past-day gets muted red.
            const blockDone = dayBlocks.some((b) => b.state === "done");
            const tracks = dayTracks({
              activeSlugs,
              displayBlocks,
              blocksByProgram: blocksTodayByProgram,
              dayLog,
              isPast,
              names: manifestNames,
            });
            // The day reads Done only when every track it shows is settled.
            // Logged work that belongs to no track (an off-plan session) made
            // today a filled check over two "Planned" lines (rescore r2).
            const tracksOpen = tracks.some((t) => t.state === "planned" || t.state === "notLogged");
            const loggedStatus =
              complianceRatio >= 1 || (totalPrescribed === 0 && dayBlocks.every((b) => b.state === "done"))
                ? tracksOpen
                  ? "logged-partial"
                  : "logged-full"
                : "logged-partial";
            const status:
              | "skipped"
              | "moved"
              | "logged-full"
              | "logged-partial"
              | "missed"
              | "rest"
              | "planned" =
              skip && daySkipped
                  ? "skipped"
                  : override
                    ? "moved"
                    : doneCount > 0 || blockDone
                      ? loggedStatus
                      : isRest
                        ? "rest"
                        // A log row with no set done is still not logged (Wed, r2).
                        : isPast && displayBlocks.length > 0
                          ? "missed"
                          : "planned";

            // One aggregate status dot per row; the per-track breakdown
            // lives in the expanded detail. Today is marked by tint + chip.
            const dayLogged = status === "logged-full" || status === "logged-partial" || tracks.some((t) => t.state === "done");
            // With 2+ tracks on a day the track lines are the entry points;
            // the single button exists only where there is one thing to open
            // (today, or a one-track day). A day never offers both.
            const trackEntries = tracks.length >= 2 && !isToday && !daySkipped && !override;
            // Move or Skip on a partly logged day would drag the done track too.
            const canMove = !isRest && !daySkipped && !override && !dayLogged;
            const canSkip = !isRest && !daySkipped && !dayLogged;
            const dayLabel = `${dayName} ${dateForDay.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
            const statusLabel = {
              skipped: "Skipped",
              moved: "Moved",
              "logged-full": "Done",
              "logged-partial": "Partly done",
              missed: "Not logged",
              rest: "Rest",
              planned: "Planned",
            }[status];

            const isExpanded = openDay === dateISO;
            return (
              <div
                key={dayName + i}
                className={cn(
                  "px-4 py-4 flex items-start gap-3",
                  isToday && "bg-bronze/8",
                )}
              >
                <DayMarker status={status} />
                <span className="sr-only">{statusLabel}</span>
                {/* F6 (Batch 24) — the row is a <div> so the expanded
                    content can contain interactive buttons (Open in
                    Today / Move… / Skip) without nesting them inside
                    the toggle button. The toggle now wraps only the
                    header + summary line. */}
                <div className="flex-1 min-w-0">
                  {/* P2-24 (Batch 28) — dropped the `aria-label` override
                      that was reading as "Mon — expand details". Visible
                      content (day name + date + chevron) is expressive
                      enough; aria-expanded announces the state. Letting
                      the accessible name compute from visible text keeps
                      SR + visible content in sync. */}
                  <div className="flex items-start gap-1">
                  <button
                    type="button"
                    onClick={() => toggleDay(dateISO)}
                    className="flex-1 min-w-0 text-left"
                    aria-expanded={isExpanded}
                    aria-controls={`weekday-${dateISO}`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="font-semibold flex items-baseline gap-2 flex-wrap">
                        <span className="inline-block w-9">{dayName}</span>
                        <span className="text-eyebrow text-muted font-normal">
                          {dateForDay.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                        {isToday ? (
                          <span className="text-eyebrow uppercase tracking-wider px-2 py-0.5 rounded-full bg-bronze/15 text-bronze font-normal">
                            Today
                          </span>
                        ) : null}
                        {runCount > 0 && !isToday ? (
                          <span className="text-eyebrow text-green font-normal">
                            · {runCount} {runCount === 1 ? "activity" : "activities"}
                          </span>
                        ) : null}
                      </div>
                      <span className="text-eyebrow text-muted text-right flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                        {daySkipped ? (
                          <span className="text-amber">Skipped</span>
                        ) : status === "missed" ? (
                          <span className="text-amber">Not logged</span>
                        ) : isRest ? "Rest" : names ? "" : "—"}
                        <ChevronDown
                          size={14}
                          aria-hidden
                          className={cn(
                            "transition-transform text-muted flex-shrink-0",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-small mt-1",
                        skip && daySkipped ? "line-through text-muted" : "text-muted",
                        !isExpanded && "line-clamp-1",
                      )}
                    >
                      {(isExpanded ? names : collapsedNames) || displayLabel}
                    </p>
                  </button>
                  {/* Move / Skip live behind "⋯" on the open day, not in the
                      content column (plan-tab-review D3). */}
                  {isExpanded && (canMove || canSkip) ? (
                    <DayMenu
                      dateISO={dateISO}
                      dayLabel={dayLabel}
                      sessionSummary={names || displayLabel}
                      canMove={canMove}
                      canSkip={canSkip}
                      blockIds={displayBlocks.map((b) => b.id)}
                      weekDaysCatalog={weekDaysCatalog}
                    />
                  ) : null}
                  </div>
                  {daySkipped && !isExpanded ? (
                    <button
                      type="button"
                      onClick={() => clearSkip(dateISO)}
                      className="mt-1 min-h-[44px] text-caption text-slate underline underline-offset-4 hover:text-ink"
                    >
                      Unskip
                    </button>
                  ) : null}
                  {isExpanded ? (
                    <div id={`weekday-${dateISO}`}>
                      {tracks.length >= 2 ? (
                        <ul className="mt-2 space-y-0.5" aria-label="Tracks">
                          {tracks.map((t) => {
                            const line = (
                              <>
                                <TrackMarker state={t.state} />
                                {/* The state is the point of the row: the name
                                    wraps, the state never clips (rescore r2). */}
                                <span className="min-w-0 flex-1 text-ink">{t.name}</span>
                                <span
                                  className={cn(
                                    "flex-shrink-0 whitespace-nowrap",
                                    t.state === "done" ? "text-green" : "text-muted",
                                  )}
                                >
                                  {TRACK_STATE_LABEL[t.state]}
                                </span>
                              </>
                            );
                            const opens = trackEntries && t.state !== "skipped" && t.state !== "moved";
                            return (
                              <li key={t.slug}>
                                {opens ? (
                                  <Link
                                    href={`/session/${t.slug}?date=${dateISO}`}
                                    className="flex items-center gap-2 min-h-[44px] text-small hover:bg-line-soft rounded-lg -mx-2 px-2"
                                  >
                                    {line}
                                    <ChevronRight size={16} aria-hidden className="text-muted flex-shrink-0" />
                                  </Link>
                                ) : (
                                  <p className="flex items-center gap-2 py-1 text-small">{line}</p>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                      {override?.reason ? (
                        <p className="text-caption text-slate italic mt-1">↳ {override.reason}</p>
                      ) : null}
                      {skip?.moved_to ? (
                        <p className="text-caption text-muted italic mt-1">Moved to {skip.moved_to}</p>
                      ) : null}
                      {templateEntry?.conditioning && !skip && !override ? (
                        <p className="text-caption text-muted italic mt-1">{templateEntry.conditioning}</p>
                      ) : null}
                      {dayLog?.runs?.length ? (
                        <ul className="mt-1 space-y-0.5">
                          {dayLog.runs.map((r, idx) => (
                            <li
                              key={idx}
                              className="text-caption text-green flex items-baseline gap-1.5"
                            >
                              <span aria-hidden>✓</span>
                              <span>
                                {prettyRun(r)}
                                {r.note ? (
                                  <span className="text-muted italic font-sans"> · {r.note}</span>
                                ) : null}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {(() => {
                        const topLift = topLoggedLift(dayLog);
                        if (!topLift) return null;
                        return (
                          <p className="mt-1 text-caption text-green flex items-baseline gap-1.5">
                            <span aria-hidden>✓</span>
                            <span>{topLift}</span>
                          </p>
                        );
                      })()}

                      <WeekDayActions
                        dateISO={dateISO}
                        dayLabel={dayLabel}
                        isToday={isToday}
                        isPast={isPast}
                        hasSession={!isRest}
                        isSkipped={daySkipped}
                        isOverride={!!override}
                        isLogged={dayLogged}
                        openSlug={trackEntries ? undefined : (tracks[0]?.slug ?? primarySlug)}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </Card>

      {/* The key reuses the row markers themselves (r23b: the old coloured
          dots no longer matched the rows). */}
      <p className="flex items-center gap-x-3 gap-y-1.5 flex-wrap text-eyebrow text-muted">
        {(
          [
            ["planned", "Planned"],
            ["logged-full", "Done"],
            ["missed", "Not logged"],
            ["skipped", "Skipped"],
            ["moved", "Moved"],
          ] as const
        ).map(([st, label]) => (
          <span key={st} className="inline-flex items-center gap-1.5">
            <DayMarker status={st} className="" /> {label}
          </span>
        ))}
      </p>

      {/* Programme rules — BOTH arrays (2026-09-05).
          `weekly_template.principles` is scheduling guidance ("48h between
          heavy squat days") and is a plain string[]. Top-level `principles`
          is the programme's standing rules — objects with a `rule` and a
          `detail` — and it was rendered NOWHERE.

          Six of the nine shipped programmes have an EMPTY
          weekly_template.principles, so this whole panel simply never
          appeared for them, while every one of the nine authors five to
          seven top-level rules. Roughly fifty authored rules were invisible.

          Two of them are safety rules: handstand-walk's
          `shoulder_pain_stops_session` ("any shoulder pain during a
          handstand attempt ends the session") and `wrist_volume_capped`.
          Neither is enforced in code, and until now neither was shown
          either — so a rule the programme states as a hard stop reached the
          user through no channel at all.

          Found by the citation sweep, which went looking for what a shaky
          citation underwrote and discovered the claim it underwrote was
          never displayed. */}
      {escalation || programRules.length || consentRules.length || wt?.principles?.length ? (
        <RulesAccordion
          principles={[
            // Consented stop-rules lead. Everything else here is guidance; this
            // is the one the user personally agreed to, and it is the one that
            // ends a session.
            ...consentRules,
            ...(escalation ? [`When to back off — ${escalation}`] : []),
            ...programRules.map((p) => (p.detail ? `${p.rule} — ${p.detail}` : p.rule)),
            ...(wt?.principles ?? []),
          ]}
        />
      ) : null}
    </div>
  );
}

/**
 * The one action inside an open day (plan-tab-review 2026-10-29). It used to
 * be a 3-column grid (open / Move… / Skip) plus a full-width "Log <track> →"
 * per secondary track: four buttons on a past two-track day, "Log session →"
 * wrapping to three lines. Now:
 *
 *   today            — "Open day" (bronze)
 *   past, one track  — "Log", or "Edit log" once something is logged
 *   future, one track — "Preview" (PWA: no URL bar, so this is the only way
 *                      to reach a future day's brief)
 *   two+ tracks      — nothing here; the track lines open each session
 *   rest day         — "Log a session" today or earlier (off-plan work)
 *   skipped / moved  — "Unskip" / "Undo move" (clearSkip inverts both)
 *
 * Move / Skip moved to DayMenu ("⋯" on the open day's header).
 */
function WeekDayActions({
  dateISO,
  dayLabel,
  isToday,
  isPast,
  hasSession,
  isSkipped,
  isOverride,
  isLogged,
  openSlug,
}: {
  dateISO: string;
  dayLabel: string;
  isToday: boolean;
  isPast: boolean;
  hasSession: boolean;
  isSkipped: boolean;
  isOverride: boolean;
  isLogged: boolean;
  /** The programme whose session the button opens; undefined when the track lines are the entry points. */
  openSlug: string | undefined;
}) {
  const clearSkip = useStore((s) => s.clearSkip);
  const buttonClass =
    "inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg text-small font-semibold";
  const outline = "border border-line-strong text-ink hover:bg-line-soft";

  if (isSkipped || isOverride) {
    return (
      <div className="mt-3">
        <button type="button" onClick={() => clearSkip(dateISO)} className={cn(buttonClass, outline)}>
          {isOverride ? "Undo move" : "Unskip"}
        </button>
      </div>
    );
  }

  if (!hasSession) {
    // Rest days: a path to log ad-hoc off-plan work (founder report
    // 2026-08-22). Future rest days have nothing to log yet.
    if (!(isToday || isPast) || !openSlug) return null;
    return (
      <div className="mt-3">
        <Link href={`/session/${openSlug}?date=${dateISO}`} className={cn(buttonClass, outline)}>
          Log a session
        </Link>
      </div>
    );
  }

  if (isToday) {
    return (
      <div className="mt-3">
        <Link
          href="/"
          aria-label={`Open day, ${dayLabel}`}
          className={cn(buttonClass, "bg-bronze text-ground hover:bg-bronze-hover")}
        >
          Open day
        </Link>
      </div>
    );
  }

  if (!openSlug) return null;
  // Past days open the session editable for that date (SessionClient reads
  // ?date=); future days open the same route as a preview.
  const label = isPast ? (isLogged ? "Edit log" : "Log") : "Preview";
  return (
    <div className="mt-3">
      <Link
        href={`/session/${openSlug}?date=${dateISO}`}
        aria-label={`${label}, ${dayLabel}`}
        className={cn(buttonClass, outline)}
      >
        {label}
      </Link>
    </div>
  );
}

/**
 * "⋯" on the open day's header: a small sheet with Move… and Skip
 * (plan-tab-review D3 — session verbs stay out of the content column).
 * Focus moves into the sheet, Esc closes it, focus returns to "⋯".
 */
function DayMenu({
  dateISO,
  dayLabel,
  sessionSummary,
  canMove,
  canSkip,
  blockIds,
  weekDaysCatalog,
}: {
  dateISO: string;
  dayLabel: string;
  sessionSummary: string;
  canMove: boolean;
  canSkip: boolean;
  blockIds: string[];
  weekDaysCatalog: WeekDayEntry[];
}) {
  const skipDay = useStore((s) => s.skipDay);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeMenu = () => setMenuOpen(false);
  useFocusTrap(panelRef, closeMenu, menuOpen);
  const itemClass =
    "w-full text-left min-h-[48px] px-3 rounded-lg text-body text-ink hover:bg-line-soft";

  return (
    <>
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label={`More for ${dayLabel}`}
        aria-haspopup="dialog"
        className="w-11 h-11 -my-2.5 -mr-2 flex items-center justify-center rounded-lg text-muted hover:text-ink hover:bg-line-soft flex-shrink-0"
      >
        <MoreHorizontal size={20} aria-hidden />
      </button>

      {menuOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={dayLabel}
          onClick={closeMenu}
          className="fixed inset-0 z-50 bg-ground/80 flex items-end sm:items-center justify-center p-3"
        >
          <div
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-surface-2 border border-line rounded-lg p-2"
          >
            <p className="px-3 pt-2 pb-1 text-caption text-muted">{dayLabel}</p>
            {canMove ? (
              <button
                type="button"
                className={itemClass}
                onClick={() => {
                  closeMenu();
                  setMoveOpen(true);
                }}
              >
                Move…
              </button>
            ) : null}
            {canSkip ? (
              <button
                type="button"
                className={itemClass}
                onClick={() => {
                  closeMenu();
                  setConfirmSkip(true);
                }}
              >
                Skip
              </button>
            ) : null}
            <button type="button" className={cn(itemClass, "text-muted")} onClick={closeMenu}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmSheet
        open={confirmSkip}
        title={`Skip ${dayLabel}'s session?`}
        body="Marked as skipped. The engine reads that as an intentional off-day, not a missed one."
        confirmLabel="Skip"
        cancelLabel="Keep it"
        onCancel={() => setConfirmSkip(false)}
        onConfirm={() => {
          setConfirmSkip(false);
          skipDay(dateISO);
        }}
      />

      <MoveSheet
        open={moveOpen}
        fromDate={dateISO}
        fromLabel={dayLabel}
        sessionSummary={sessionSummary}
        blockIds={blockIds}
        weekDays={weekDaysCatalog}
        onClose={() => setMoveOpen(false)}
      />
    </>
  );
}

function RulesAccordion({ principles }: { principles: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-small text-slate hover:text-ink"
      >
        <span aria-hidden>{open ? "▾" : "▸"}</span>
        {open ? "Hide" : "Show"} rules of the week
      </button>
      {open ? (
        <ul className={cardClass() + " mt-2 space-y-2 list-disc pl-6 text-small"}>
          {principles.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function TrackMarker({ state }: { state: TrackState }) {
  const status: DayStatus =
    state === "done" ? "logged-full" : state === "notLogged" ? "missed" : state;
  return <DayMarker status={status} className="scale-75" />;
}

/**
 * Compact single-line summary of a logged run/class for the Week view.
 * e.g. "5.2 km run · easy" or "45 min CrossFit class" or "row 2K · 7:35".
 * Matches the info-density budget of the surrounding session names.
 */
function prettyRun(r: RunLog): string {
  const activity =
    r.activity_type === "crossfit_class"
      ? "CrossFit class"
      : r.activity_type === "ski_erg"
        ? "ski erg"
        : (r.activity_type ?? "run");
  const parts: string[] = [];
  if (r.session_type === "2k_test") parts.push(`${activity} · 2K test`);
  else if (r.distance_km != null && r.distance_km > 0) {
    parts.push(`${r.distance_km} km ${activity}`);
  } else if (r.minutes != null && r.minutes > 0) {
    parts.push(`${Math.round(r.minutes)} min ${activity}`);
  } else {
    parts.push(activity);
  }
  if (r.total_seconds != null && r.session_type === "2k_test") {
    parts.push(
      `${Math.floor(r.total_seconds / 60)}:${String(r.total_seconds % 60).padStart(2, "0")}`,
    );
  } else if (r.intensity) {
    parts.push(r.intensity);
  }
  return parts.join(" · ");
}

/**
 * Roll up the day's logged exercises into one "heaviest working set"
 * headline. Nothing if the user logged no sets. Founder request: Week
 * view should show what actually got done, not just what was scheduled.
 */
function topLoggedLift(day: DayLog | undefined): string | null {
  if (!day) return null;
  let best: { name: string; weight: number; reps: number } | null = null;
  for (const [key, entry] of Object.entries(day.exercises)) {
    const sets = entry.sets ?? [];
    for (const s of sets) {
      if (s.weight_kg == null || s.weight_kg <= 0 || s.reps == null || s.reps <= 0) continue;
      if (!best || s.weight_kg > best.weight) {
        const exId = key.split(":")[1] ?? key;
        // P1-66 (Batch 27) — was `replace(/_/g, " ")` which produced
        // "back squat highbar" (lossy). Shared humanize helper knows
        // the pretty forms like "back squat (high bar)".
        best = { name: humanizeExerciseId(exId), weight: s.weight_kg, reps: s.reps };
      }
    }
  }
  if (!best) return null;
  return `${best.name} · ${best.weight} kg × ${best.reps}`;
}

function withoutDayPrefix(name: string): string {
  const stripped = name.replace(/^(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?\s*[—–-]\s*/i, "");
  return stripped === name ? name : stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

type DayStatus = "skipped" | "moved" | "logged-full" | "logged-partial" | "missed" | "rest" | "planned";

/**
 * A day's state by SHAPE, not hue alone (r23 rescore: grey "planned" and
 * hollow "missed" dots were indistinguishable and nothing explained them).
 * Done is a filled check, planned an empty ring, missed a dashed amber ring
 * that the row also names, skipped a minus, moved an arrow, rest a dash.
 */
function DayMarker({ status, className = "mt-0.5" }: { status: DayStatus; className?: string }) {
  const base = cn(className, "w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center");
  if (status === "logged-full") {
    return (
      <span aria-hidden className={cn(base, "bg-green text-ground")}>
        <Check size={12} strokeWidth={3} />
      </span>
    );
  }
  if (status === "logged-partial") {
    return (
      <span aria-hidden className={cn(base, "border-2 border-green text-green")}>
        <Check size={11} strokeWidth={3} />
      </span>
    );
  }
  if (status === "skipped") {
    return (
      <span aria-hidden className={cn(base, "border-2 border-amber text-amber")}>
        <Minus size={12} strokeWidth={3} />
      </span>
    );
  }
  if (status === "moved") {
    return (
      <span aria-hidden className={cn(base, "border-2 border-slate text-slate")}>
        <ArrowRight size={11} strokeWidth={3} />
      </span>
    );
  }
  if (status === "missed") return <span aria-hidden className={cn(base, "border-2 border-dashed border-amber")} />;
  if (status === "rest") {
    return (
      <span aria-hidden className={cn(base, "text-muted")}>
        <Minus size={12} />
      </span>
    );
  }
  return <span aria-hidden className={cn(base, "border-2 border-line-strong")} />;
}
