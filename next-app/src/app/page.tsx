"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProgram, loadExercises } from "@/lib/data-loader";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { HeroStateCard } from "@/components/workout/HeroStateCard";
import { SessionActions } from "@/components/workout/SessionActions";
import { DateNav } from "@/components/workout/DateNav";
import { FirstRunBanner } from "@/components/FirstRunBanner";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { YourPlanCard } from "@/components/workout/YourPlanCard";
import { SignalsStrip } from "@/components/workout/SignalsStrip";
import { RunSlotCard } from "@/components/workout/RunSlotCard";
import { MissedSessionPrompt } from "@/components/workout/MissedSessionPrompt";
import { ProposalStack } from "@/components/workout/ProposalStack";
import { Day1EmptyState } from "@/components/workout/Day1EmptyState";
import { ConfirmSheet } from "@/components/ConfirmSheet";
import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import {
  activePhaseFor,
  isPastProgramEnd,
  RACE_DATE,
  HOLIDAY_GAP,
} from "@/lib/engine/schedule";
import { evaluateRetestMetrics, formatMetric, deltaFromBaseline } from "@/lib/engine/retest-evaluator";
import { blocksForDate } from "@/lib/engine/plan-generator";
import type { Program, Block, Exercise, Phase, Store } from "@/lib/schemas";

export default function TodayPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [byId, setById] = useState<Record<string, Exercise>>({});
  const [error, setError] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState(() => todayISO());
  const hydrated = useStore((s) => s.hydrated);
  const override = useStore((s) => s.store.scheduled_overrides?.[activeDate]);

  const activeProgramSlug = useStore((s) => s.store.user_profile?.active_program_id);
  const activeProgramIds = useStore((s) => s.store.user_profile?.active_program_ids);
  const userProfile = useStore((s) => s.store.user_profile);
  const logs = useStore((s) => s.store.logs);
  const hasHistory = useStore(
    (s) => Object.keys(s.store.logs).length > 0 || Object.keys(s.store.training_maxes).length > 0,
  );
  const setActiveProgram = useStore((s) => s.setActiveProgram);

  // Effective list of programs Today should render. Legacy path: fall back to
  // just the primary. Multi-program: use the full active_program_ids list,
  // ordering primary first so its phase drives the header.
  const activeSlugs: string[] = (() => {
    if (activeProgramIds && activeProgramIds.length) {
      const ordered = activeProgramSlug
        ? [activeProgramSlug, ...activeProgramIds.filter((s) => s !== activeProgramSlug)]
        : activeProgramIds;
      return ordered;
    }
    return activeProgramSlug ? [activeProgramSlug] : [];
  })();
  const activeSlugsKey = activeSlugs.join("|");

  useEffect(() => {
    if (!activeSlugs.length) {
      setPrograms([]);
      void loadExercises().then((x) => setById(x.byId));
      return;
    }
    void Promise.all([
      Promise.all(activeSlugs.map((slug) => loadProgram(slug))),
      loadExercises(),
    ])
      .then(([ps, x]) => {
        setPrograms(ps);
        setById(x.byId);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlugsKey]);

  // Legacy accounts: if there's real history but no explicit program pick,
  // route to the catalog instead of silently stamping anterior-hip. Multi-track
  // users would otherwise be forced into the hip case study every time their
  // active_program_id failed to persist. Only auto-stamp the hip default when
  // the history clearly *is* the hip program (hip_flexor logs or hip TMs).
  useEffect(() => {
    if (!hydrated || activeProgramSlug || !hasHistory) return;
    // No-op — let the guard below render <NoActiveProgram /> which points at
    // /programs. Historical hip users still keep working because their
    // active_program_id was stamped when they set up. If theirs is missing,
    // /programs will remember their preference on next pick.
  }, [hydrated, activeProgramSlug, hasHistory, setActiveProgram]);

  if (error) {
    return (
      <div className="mt-8 rounded border border-red bg-surface p-4">
        <h2 className="mb-2 text-lg font-semibold">Couldn&apos;t load program data</h2>
        <p className="text-sm text-muted">{error}</p>
      </div>
    );
  }
  if (!programs.length || !hydrated) {
    if (!activeProgramSlug && hydrated) return <NoActiveProgram />;
    return <div className="mt-8 text-sm text-muted">Loading…</div>;
  }

  // Primary program: drives the phase header, SignalsStrip, RestDayCard variant,
  // and receives any scheduled_override (overrides are single-program by design).
  const primary = programs[0];
  const phase = activePhaseFor(primary, activeDate, userProfile);

  // Compose per-program block groups. Each group carries its own program pointer
  // so BlockSection can resolve `program.blocks` correctly and TM proposals stay
  // scoped. Overrides apply to primary only.
  const groups = programs.map((p, i) => {
    const overrideBlocks = i === 0 && override
      ? p.blocks.filter((b) => override.blocks.includes(b.id) && (b.category ?? "strength") === "strength")
      : null;
    const phaseForProg = i === 0 ? phase : activePhaseFor(p, activeDate, userProfile);
    const composed = overrideBlocks && overrideBlocks.length
      ? overrideBlocks
      : blocksForDate(p, userProfile, phaseForProg, activeDate, byId);
    return { program: p, blocks: composed };
  });
  const allBlocks = groups.flatMap((g) => g.blocks);
  const groupsWithBlocks = groups.filter((g) => g.blocks.length > 0);
  const multipleProgramsToday = groupsWithBlocks.length >= 2;

  return (
    <div className="space-y-5">
      {/* Big top slab is gone. Screen-title H1 was showing the same word ("Today")
          the bottom-nav tab already highlights. Phase context now rides under
          the DateNav as a single compact line. Reclaims ~120px of fold. */}
      <h1 className="sr-only">Today</h1>

      <YourPlanCard program={primary} />

      <FirstRunBanner />

      {activeDate === todayISO() ? (
        <MissedSessionPrompt
          program={primary}
          todayISO={todayISO()}
          onLogYesterday={() => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            setActiveDate(d.toISOString().slice(0, 10));
          }}
          onSkipYesterday={() => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            const iso = d.toISOString().slice(0, 10);
            setActiveDate(iso);
            // SessionActions Skip flow will surface via the standard controls
            // once the user is viewing yesterday.
          }}
        />
      ) : null}

      <DateNav date={activeDate} onChange={setActiveDate} />

      {phase ? (
        <p className="-mt-3 text-[13px] text-muted leading-tight">
          <span className="text-strong">{humanPhaseName(phase.name)}</span>
          {phaseProgress(phase, activeDate) ? (
            <span className="text-slate"> · {phaseProgress(phase, activeDate)}</span>
          ) : null}
        </p>
      ) : null}

      {(() => {
        // Day-1 empty-state gate (Bug #3 fix from 2026-08-17 flow-review).
        // Fresh user with no morning check today AND no history anywhere —
        // one CTA card owns the "start here" attention. Existing HeroStateCard
        // full-tile still renders below for non-day-1 no-check cases; this
        // just short-circuits the day-1 fresh case.
        const noCheckToday = !logs[activeDate]?.symptoms;
        if (!hasHistory && noCheckToday && activeDate === todayISO()) {
          return <Day1EmptyState />;
        }
        return null;
      })()}

      <ProposalStack program={primary} date={activeDate} />

      <HeroStateCard date={activeDate} />

      <SignalsStrip program={primary} date={activeDate} />

      <RetestReminder program={primary} profile={userProfile} activeDate={activeDate} />

      {/* Taper phase — surface it prominently so the reduced session duration
          isn't read as an error. Read the phase's is_taper flag which we set
          for test-prep programs (currently just rowing-2k-test-prep). */}
      {phase && (phase as unknown as { is_taper?: boolean }).is_taper ? (
        <div className="rounded border border-slate/40 bg-slate/10 border-l-4 border-l-slate px-3 py-2 text-[13px]">
          <p className="font-semibold text-slate">Taper week.</p>
          <p className="text-muted mt-0.5">
            Volume drops ~45%, intensity holds. This is where the ~3% peak uplift comes from — resist the urge to add sessions.
          </p>
        </div>
      ) : null}

      {/* Concurrent programs — flag when yesterday's log includes a hard
          aerobic session AND today has a strength block. The interference
          model wants ≥6h between the two; a same-day or next-day pairing
          risks the classic Wilson-Loenneke interference cost. Non-blocking:
          just a callout so the athlete can plan the day. */}
      {/* Concurrent programs — flag when yesterday's log includes a hard
          aerobic session AND today has a strength block. Widened to any
          program that declares a `concurrent_strength_policy` — Engine
          Builder does, not just CSM. */}
      {primary.slug === "concurrent-strength-maintenance" ||
      (primary as unknown as { concurrent_strength_policy?: unknown }).concurrent_strength_policy ||
      (primary.goals as { concurrent_strength_policy?: unknown } | undefined)?.concurrent_strength_policy ? (
        (() => {
          const y = new Date(activeDate + "T00:00:00");
          y.setDate(y.getDate() - 1);
          const yesterday = logs[y.toISOString().slice(0, 10)];
          const hardTypes = new Set(["threshold", "race_pace", "vo2max_intervals", "2k_test"]);
          const hardYesterday = (yesterday?.runs ?? []).some(
            (r: { intensity?: string; session_type?: string }) =>
              r.intensity === "hard" || (r.session_type ? hardTypes.has(r.session_type) : false),
          );
          const strengthToday = allBlocks.some((b) => (b.category ?? "strength") === "strength");
          if (!(hardYesterday && strengthToday)) return null;
          return (
            <div className="rounded border border-amber/40 bg-amber/10 border-l-4 border-l-amber px-3 py-2 text-[13px]">
              <p className="font-semibold text-amber">Interference window.</p>
              <p className="text-muted mt-0.5">
                Yesterday had a hard aerobic session. The concurrent-training
                model wants ≥6h between hard cardio and heavy strength — space
                today&apos;s lift accordingly, or accept a small strength cost.
              </p>
            </div>
          );
        })()
      ) : null}

      {/* Skill programs (handstand-walk, etc.) — non-negotiable safety rule:
          shoulder pain stops the session. Surface it on Today so it's not just
          buried in intake. */}
      {primary.slug === "handstand-walk" ? (
        <div className="rounded border border-amber/40 bg-amber/10 border-l-4 border-l-amber px-3 py-2 text-[13px]">
          <p className="font-semibold text-amber">Shoulder pain stops the session.</p>
          <p className="text-muted mt-0.5">
            Any sharp shoulder pain during handstand work — end the block, log it on
            the check page, take rest. Non-negotiable.
          </p>
        </div>
      ) : null}

      {/* Contextual interference legend — for multi_dim programs, skill users
          who know the CI literature would otherwise read the deterministic
          shuffle in weeks 3+ as a bug. */}
      {primary.generation_strategy === "multi_dimensional" && userProfile?.active_program_started_at ? (
        (() => {
          const started = new Date(userProfile.active_program_started_at + "T00:00:00");
          const today = new Date(activeDate + "T00:00:00");
          const daysIn = Math.max(0, Math.floor((today.getTime() - started.getTime()) / 864e5));
          const week = Math.floor(daysIn / 7) + 1;
          const mode = week <= 2 ? "blocked practice — drills in the composed order" : "random practice — order shuffled by the seed";
          return (
            <p className="text-[11px] text-muted font-mono">
              Week {week} · {mode}. <span className="text-muted/70">Shea &amp; Morgan 1979.</span>
            </p>
          );
        })()
      ) : null}

      {multipleProgramsToday ? (
        <div className="rounded border border-amber/40 bg-amber/10 px-3 py-2.5 text-[13px]">
          <p className="text-amber-strong">
            <span className="font-semibold">Two programs scheduled today.</span>{" "}
            If it&apos;s too much, snooze one from{" "}
            <Link href="/profile" className="underline">Profile</Link>.
          </p>
          <p className="text-muted mt-1">
            Concurrent endurance + strength has known interference effects (Schumann 2022).
            Aim for ≥6 hours between sessions if you do both.
          </p>
        </div>
      ) : null}

      {isPastProgramEnd(primary, activeDate, userProfile) && activeDate === todayISO() ? (
        <GraduationCard program={primary} />
      ) : !allBlocks.length ? (
        <>
          {(() => {
            // Rowing test day = the user's target_test_date (post-shift).
            // Renders as a "race" variant with rowing-appropriate copy.
            const userTargetTestDate =
              userProfile?.program_states?.[primary.slug ?? ""]?.intake_answers
                ?.target_test_date;
            const isRowingTestDay =
              primary.slug === "rowing-2k-test-prep" &&
              userTargetTestDate === activeDate;
            const variant =
              primary.slug === "anterior-hip-rebuild" && activeDate === RACE_DATE
                ? "race"
                : isRowingTestDay
                  ? "test"
                  : activeDate < primary.phases[0]?.starts
                    ? "before"
                    : primary.slug === "anterior-hip-rebuild" &&
                        activeDate >= HOLIDAY_GAP.start &&
                        activeDate <= HOLIDAY_GAP.end
                      ? "holiday"
                      : "rest";
            return (
              <RestDayCard
                variant={variant}
                programName={primary.program_goal?.display_name}
                firstSessionDate={primary.phases[0]?.starts}
                programSlug={primary.slug}
              />
            );
          })()}
          <div id="log-session"><RunSlotCard date={activeDate} /></div>
        </>
      ) : (
        <div className="space-y-6">
          {groups.map((g, gi) =>
            g.blocks.length === 0 ? null : (
              <div key={g.program.schema_version + ":" + gi} className="space-y-5">
                {groupsWithBlocks.length > 1 ? (
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted -mb-2">
                    {programDisplayName(g.program, activeSlugs[gi])}
                  </p>
                ) : null}
                {g.blocks.map((b) => {
                  // Apply the primary program's phase.duration_multiplier when
                  // present — used by test-prep programs' taper phase to
                  // visually shrink the session card without duplicating every
                  // block. Only applies to the primary program; secondary
                  // programs use their own phase progression.
                  const groupPhase = gi === 0 ? phase : undefined;
                  const mult =
                    ((groupPhase as unknown as { duration_multiplier?: number } | undefined)
                      ?.duration_multiplier) ?? 1;
                  return (
                    <BlockSection
                      key={`${activeSlugs[gi]}:${b.id}`}
                      block={b}
                      byId={byId}
                      program={g.program}
                      date={activeDate}
                      durationMultiplier={mult}
                    />
                  );
                })}
              </div>
            ),
          )}
          <div id="log-session"><RunSlotCard date={activeDate} /></div>
          <SessionActions blockIds={allBlocks.map((b) => b.id)} date={activeDate} program={primary} />
        </div>
      )}
    </div>
  );
}

function programDisplayName(program: Program, slug: string): string {
  return program.program_goal?.display_name ?? slug.replace(/-/g, " ");
}

function NoActiveProgram() {
  return (
    <>
      <EmptyStateCard
        title="Pick your focus."
        body="Each program starts with a short intake so the plan is calibrated to your baseline, not a template with your name on it."
        cta={{ href: "/programs/", label: "Browse programs" }}
      />
      {/* Fresh-signup privacy pitch — the FirstRunBanner would otherwise never
          show for a signed-in user landing on this state (the earlier code
          short-circuited to render this component before mounting the banner). */}
      <FirstRunBanner />
    </>
  );
}

/**
 * For rowing programs, derive a personal target pace from the user's intake
 * `current_2k_time` answer. Renders below the block note so a user reads
 * "4×8 min @ 1:53 target split" instead of "5-10 sec/500m over 2K pace".
 */
function RowingPersonalisedTargets({
  block,
  program,
}: {
  block: Block;
  program: Program;
}) {
  const userProfile = useStore((s) => s.store.user_profile);
  if (program.slug !== "rowing-2k-test-prep") return null;
  const answer =
    program.slug
      ? userProfile?.program_states?.[program.slug]?.intake_answers?.current_2k_time
      : undefined;
  if (!answer) return null;
  // Prefer exact mm:ss format ("7:52") over the legacy enum midpoints. Falls
  // back to the enum map for existing users who answered before the input
  // switched to text.
  let twoKSec: number | null = null;
  const mmss = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(answer);
  if (mmss) {
    const mins = Number(mmss[1]);
    const secs = Number(mmss[2]);
    if (Number.isFinite(mins) && Number.isFinite(secs) && secs < 60) {
      twoKSec = mins * 60 + secs;
    }
  }
  if (twoKSec == null) {
    const map: Record<string, number> = {
      sub_7: 400,
      "7_8": 450,
      "8_9": 510,
      "9_10": 570,
      over_10: 630,
    };
    twoKSec = map[answer] ?? null;
  }
  if (twoKSec == null) return null;
  const paceSec = Math.round(twoKSec / 4);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const targets: Array<{ label: string; pace: string }> = [];
  // Match on block id to keep this precise; each rowing block has an intended
  // pace derived off 2K time.
  if (block.id === "block_threshold_row") {
    targets.push({ label: "Threshold split", pace: fmt(paceSec + 8) });
    targets.push({ label: "Target HR zone", pace: "82-88% max" });
  } else if (block.id === "block_race_pace_row") {
    targets.push({ label: "Race-pace split", pace: fmt(paceSec) });
  } else if (block.id === "block_z2_row") {
    targets.push({ label: "Z2 split (approx.)", pace: fmt(paceSec + 20) });
  } else if (block.id === "block_open_2k") {
    targets.push({ label: "Target 2K split", pace: fmt(paceSec - 2) });
  }
  if (!targets.length) return null;
  return (
    <div className="rounded border border-bronze/30 bg-bronze/5 px-3 py-2 text-[13px]">
      <p className="mono-caps mb-1 text-bronze">Your target</p>
      {targets.map((t) => (
        <p key={t.label} className="text-ink">
          <span className="text-muted">{t.label}:</span>{" "}
          <span className="font-mono font-semibold">{t.pace}</span>
        </p>
      ))}
      <p className="mt-1 text-[10px] text-muted italic">
        Derived from your intake&apos;s current 2K. Update on Progress to refine.
      </p>
    </div>
  );
}

/**
 * Small "Log this session" affordance shown under aerobic block cards — opens
 * the same RunSlotCard on the same date. Cuts a scroll for rowing / engine
 * users whose primary interaction is logging the run they just did.
 */
function LogSessionShortcut({ date }: { date: string }) {
  void date;
  return (
    <a
      href="#log-session"
      className="inline-flex items-center gap-1.5 rounded-full border border-slate/40 bg-slate/[0.08] px-3 py-1.5 text-[12px] font-mono uppercase tracking-wider text-slate hover:bg-slate/15"
    >
      ↓ Log this session
    </a>
  );
}

function GraduationCard({ program }: { program: Program }) {
  const store = useStore((s) => s.store);
  const removeActiveProgram = useStore((s) => s.removeActiveProgram);
  const [confirmEnd, setConfirmEnd] = useState(false);
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

  const programName = program.program_goal?.display_name ?? program.slug ?? "your program";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-bronze/40 border-l-4 border-l-bronze bg-bronze/[0.06] p-4 space-y-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-bronze">You finished</p>
          <h2 className="text-lg font-semibold text-strong mt-1">{programName}</h2>
          {weeksIn ? (
            <p className="text-[13px] text-muted mt-0.5">
              {weeksIn} weeks logged. Nice.
            </p>
          ) : null}
        </div>
        {displayable.length ? (
          <div className="rounded border border-line-soft bg-surface p-3 space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Where you landed</p>
            <ul className="space-y-1.5">
              {displayable.map((m) => {
                const delta = deltaFromBaseline(m);
                return (
                  <li key={m.metric_id} className="flex items-baseline justify-between gap-2 text-[13px]">
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
          <p className="text-[13px] text-muted italic">
            No retest metrics recorded — head to Progress to log your final numbers.
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/progress"
            className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze text-ground hover:bg-bronze-hover min-h-[36px]"
          >
            Retest — log your numbers
          </Link>
          <Link
            href="/programs"
            className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded border border-slate/60 text-slate hover:bg-slate/10 min-h-[36px]"
          >
            Pick your next program →
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setConfirmEnd(true)}
          className="text-[12px] text-muted underline decoration-muted/40 hover:text-red hover:decoration-red pt-1"
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

function RestDayCard({
  variant = "rest",
  programName,
  firstSessionDate,
  programSlug,
}: {
  variant?: "rest" | "before" | "race" | "holiday" | "test";
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
  if (variant === "race") {
    return (
      <div className="rounded border border-bronze/30 border-l-4 border-l-bronze bg-bronze/10 p-4 text-sm">
        <p className="font-semibold text-strong">Race day.</p>
        <p className="mt-1 text-muted">
          Race day. No strength today. Reach the start line healthy.
        </p>
      </div>
    );
  }
  if (variant === "holiday") {
    return (
      <div className="rounded border border-line-soft border-l-4 border-l-slate bg-surface p-4 text-sm">
        <p className="font-semibold">Holiday / light period.</p>
        <p className="mt-1 text-muted">
          Documented light window between Phase 4 (test) and Phase 5 (Hatch). No prescribed strength session.
          Optional 60% TM movement work; see the Extras tab.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded border border-line-soft border-l-4 border-l-slate bg-surface p-4 text-sm">
      <p className="font-semibold">Rest day.</p>
      <p className="mt-1 text-muted">
        {programName ? `${programName} has no session on the schedule today. ` : "No session on the schedule today. "}
        Optional work (accessories, mobility, easy movement) lives on the Extras tab and still logs to today.
      </p>
    </div>
  );
}

function RetestReminder({
  program,
  profile,
  activeDate,
}: {
  program: Program;
  profile: Store["user_profile"] | undefined;
  activeDate: string;
}) {
  const metrics = (program as unknown as { retest_metrics?: Array<{ cadence_weeks?: number; display_name?: string }> }).retest_metrics;
  if (!metrics?.length) return null;
  const cadences = metrics
    .map((m) => (typeof m.cadence_weeks === "number" ? m.cadence_weeks : null))
    .filter((c): c is number => c != null && c > 0);
  if (!cadences.length) return null;
  const startedRaw =
    profile?.program_states?.[program.slug ?? ""]?.started_at ??
    profile?.active_program_started_at;
  if (!startedRaw) return null;
  const startedISO = startedRaw.slice(0, 10);
  const startMs = new Date(startedISO + "T00:00:00").getTime();
  const nowMs = new Date(activeDate + "T00:00:00").getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(nowMs)) return null;
  const daysIn = Math.floor((nowMs - startMs) / 864e5);
  if (daysIn < 7) return null; // never in first week
  const weeksIn = Math.floor(daysIn / 7);
  // Fire on the exact week (dow 0-6 within the week) that hits any cadence
  // milestone. Only when at least one cadence divides the current whole-week
  // count and today is Mon (start of a fresh week — hits once per cycle).
  const dow = new Date(activeDate + "T12:00:00").getDay(); // 0 Sun, 1 Mon
  if (dow !== 1) return null;
  const dueThisWeek = cadences.some((c) => weeksIn > 0 && weeksIn % c === 0);
  if (!dueThisWeek) return null;
  return (
    <div className="rounded border border-bronze/30 border-l-4 border-l-bronze bg-bronze/10 px-3 py-2 text-[13px]">
      <p className="font-semibold text-bronze">Retest window this week.</p>
      <p className="text-muted mt-0.5">
        You&apos;re {weeksIn} weeks in. Progress → Insights shows your current retest metrics against baseline and target.
      </p>
    </div>
  );
}

function BlockSection({
  block,
  byId,
  program,
  date,
  durationMultiplier = 1,
}: {
  block: Block;
  byId: Record<string, Exercise>;
  program: Program;
  date: string;
  durationMultiplier?: number;
}) {
  const scaleDur = (d: number) => Math.round(d * durationMultiplier);
  const meta = [
    block.frequency ?? (block.frequency_per_week ? `${block.frequency_per_week}×/week` : ""),
    block.duration_min
      ? Array.isArray(block.duration_min)
        ? `${block.duration_min.map(scaleDur).join("–")} min`
        : `${scaleDur(block.duration_min)} min`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const items = block.items ?? [];
  const categoryColor = block.category === "run" ? "border-l-green" : block.category === "accessory" ? "border-l-slate" : "border-l-bronze";
  return (
    <section className={`space-y-3 pl-3 border-l-4 ${categoryColor}`}>
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="font-mono text-[13px] font-semibold uppercase tracking-widest">
          {humanBlockName(block.name)}
        </h2>
        <span className="font-mono text-[11px] text-muted">{meta}</span>
      </header>
      {block.note ? (
        <p className="rounded border border-line-soft border-l-4 border-l-slate bg-surface px-3 py-2 text-[13px] text-muted">
          {block.note}
        </p>
      ) : null}
      <RowingPersonalisedTargets block={block} program={program} />
      {block.category === "run" ? <LogSessionShortcut date={date} /> : null}
      <div className="space-y-2">
        {dedupeItems(items).map((it, i) => {
          if (!it.exercise_id) return null;
          const ex = byId[it.exercise_id];
          if (!ex) return null;
          return (
            <ExerciseCard
              key={`${it.exercise_id}-${i}`}
              blockId={block.id}
              item={it}
              exercise={ex}
              program={program}
              date={date}
            />
          );
        })}
      </div>
    </section>
  );
}

// Strip only obvious dev / phase-scope suffixes. Keep em-dash context intact:
// "Week 1 — pure Z1 introduction" is the phase's actual intent and the user
// wants to see it. Only kill parentheticals that look like phase-scope hints
// ("(Phase 1 weeks 0-1)") or explicit developer tags ("(sub-goal)").
function humanPhaseName(name: string): string {
  return name
    .replace(/\s*\((?:Phase|weeks?|week|sub-goal|dev|internal)\b[^)]*\)\s*$/i, "")
    .trim();
}

// Same idea for block names: the source data carries phase-scope hints like
// "(Phase 1 weeks 0-1)" which are misleading when read literally by a user
// looking at Today (they imply the phase is only 2 weeks long).
function humanBlockName(name: string): string {
  return name.replace(/\s*\((?:Phase|weeks?|week)\b[^)]*\)\s*$/i, "").trim();
}

/**
 * Turn a phase and today's date into a "week N of M · ends dd Mon" line.
 * That way the user always sees where they are in the phase, and never has
 * to infer duration from a misleading block-name parenthetical.
 */
function phaseProgress(phase: Phase, dateISO: string): string | null {
  if (!phase.starts || !phase.ends) return null;
  const start = new Date(phase.starts + "T00:00:00");
  const end = new Date(phase.ends + "T00:00:00");
  const today = new Date(dateISO + "T00:00:00");
  if (today < start || today > end) return null;
  const daysIn = Math.floor((today.getTime() - start.getTime()) / 864e5);
  const totalDays = Math.floor((end.getTime() - start.getTime()) / 864e5) + 1;
  const currentWeek = Math.floor(daysIn / 7) + 1;
  const totalWeeks = Math.max(1, Math.ceil(totalDays / 7));
  const endsShort = end.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `week ${currentWeek} of ${totalWeeks} · ends ${endsShort}`;
}

// Merge duplicate exercise entries in the same block (e.g. squat "main" + squat "volume"),
// keeping the first occurrence but appending secondary schemes so the card still shows both.
function dedupeItems<T extends { exercise_id?: string | null; scheme?: string }>(
  items: T[],
): T[] {
  const seen = new Map<string, number>();
  const out: T[] = [];
  for (const it of items) {
    if (!it.exercise_id) {
      out.push(it);
      continue;
    }
    const idx = seen.get(it.exercise_id);
    if (idx == null) {
      seen.set(it.exercise_id, out.length);
      out.push(it);
    } else if (it.scheme) {
      // Merge scheme text so the card indicates both roles in one card
      const existing = out[idx];
      const merged: T = {
        ...existing,
        scheme: existing.scheme ? `${existing.scheme} · then ${it.scheme}` : it.scheme,
      };
      out[idx] = merged;
    }
  }
  return out;
}

