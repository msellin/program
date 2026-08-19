"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadProgram, loadProgramManifest, loadExercises } from "@/lib/data-loader";
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
import { getBlocksForDate, isBlockObjectOn } from "@/lib/engine/block-selectors";
import { migrateLegacyToBlocks, needsBlockMigration } from "@/lib/migrations/legacy-to-blocks";
import { PerProgramActions } from "@/components/workout/PerProgramActions";
import type { Program, Block, Exercise, Phase, Store, ScheduledBlock, ProgramManifest } from "@/lib/schemas";

export default function TodayPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [byId, setById] = useState<Record<string, Exercise>>({});
  const [error, setError] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState(() => todayISO());
  const [programManifest, setProgramManifest] = useState<ProgramManifest | null>(null);
  useEffect(() => {
    void loadProgramManifest().then(setProgramManifest).catch(() => setProgramManifest(null));
  }, []);
  const hydrated = useStore((s) => s.hydrated);
  const override = useStore((s) => s.store.scheduled_overrides?.[activeDate]);

  const activeProgramSlug = useStore((s) => s.store.user_profile?.active_program_id);
  const activeProgramIds = useStore((s) => s.store.user_profile?.active_program_ids);
  const userProfile = useStore((s) => s.store.user_profile);
  const logs = useStore((s) => s.store.logs);
  const store = useStore((s) => s.store);
  // Phase C · block-object rebuild — flag gate + block-object read.
  // See dev/active/block-object-rebuild-2026-08-18.md §5-§7.
  const blockObjectOn = useStore((s) => isBlockObjectOn(s.store));
  const scheduledBlocksMap = useStore((s) => s.store.scheduled_blocks);
  const replaceStore = useStore((s) => s.replaceStore);
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

  // Phase C · run legacy → block-object migration on first render after the
  // flag is enabled. Idempotent — short-circuits once
  // `migrations_applied.includes("blocks_v1")`. See §7 of the plan.
  useEffect(() => {
    if (!blockObjectOn || !programs.length || !hydrated) return;
    const store = useStore.getState().store;
    if (!needsBlockMigration(store)) return;
    const programsBySlug: Record<string, Program> = {};
    for (const p of programs) {
      if (p.slug) programsBySlug[p.slug] = p;
    }
    const migrated = migrateLegacyToBlocks(store, programsBySlug, todayISO());
    replaceStore(migrated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockObjectOn, programs.length, hydrated]);

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
  //
  // Two code paths behind `blockObjectOn`:
  //   OFF (default) — legacy on-read derivation. blocksForDate() walks program
  //     phases + weekly_template each render.
  //   ON — read materialized `scheduled_blocks`, keyed by actual_date. Fixes
  //     the Today-view duplication bug (moved blocks appear ONLY on their
  //     destination date). Enables per-program Skip/Move.
  const groups = programs.map((p, i) => {
    if (blockObjectOn && p.slug) {
      // Block-object path. `getBlocksForDate` filters by actual_date, so a
      // block moved out of today is invisible here — that's the whole point.
      const scheduledForToday = getBlocksForDate(
        { scheduled_blocks: scheduledBlocksMap } as Store,
        activeDate,
        {
          slug: p.slug,
          states: ["planned", "amber_downshifted", "moved", "done"],
        },
      );
      const composed = scheduledForToday
        .map((sb) => p.blocks.find((b) => b.id === sb.block_template_id))
        .filter((b): b is Block => Boolean(b));
      return { program: p, blocks: composed, scheduled: scheduledForToday };
    }
    // Legacy path.
    const overrideBlocks = i === 0 && override
      ? p.blocks.filter((b) => override.blocks.includes(b.id) && (b.category ?? "strength") === "strength")
      : null;
    const phaseForProg = i === 0 ? phase : activePhaseFor(p, activeDate, userProfile);
    const composed = overrideBlocks && overrideBlocks.length
      ? overrideBlocks
      : blocksForDate(p, userProfile, phaseForProg, activeDate, byId, store);
    return { program: p, blocks: composed, scheduled: [] as ScheduledBlock[] };
  });
  const allBlocks = groups.flatMap((g) => g.blocks);
  const groupsWithBlocks = groups.filter((g) => g.blocks.length > 0);
  const multipleProgramsToday = groupsWithBlocks.length >= 2;

  return (
    <div className="space-y-5">
      {/* P1-4 — promoted from sr-only to visible for parity with Week /
          Progress / History / Profile / Programs H1s. The word "Today"
          duplicates the bottom-nav tab, but heading-hierarchy consistency
          wins for SR + sighted-keyboard flow. Same 32 px treatment as
          other top-level routes. */}
      <h1 className="text-[32px] font-semibold tracking-tight text-strong leading-none">
        Today
      </h1>

      {/* Suppress the reveal card once the user has any real log history —
          if they've been using the app, they know what plan they're on.
          Also suppress after graduation. Delta audit 2026-08-19. */}
      {!isPastProgramEnd(primary, activeDate, userProfile) &&
      Object.keys(logs ?? {}).length < 3 ? (
        <YourPlanCard program={primary} />
      ) : null}

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

      {/* Suppress phase readout when the user has already graduated. Prior
          behavior: activePhaseFor returned the LAST phase as fallback, so
          Today showed "Taper + test · week 1 of 3" alongside the graduation
          card — 4 contradictory clocks on rowing per delta audit
          2026-08-19. */}
      {phase && !isPastProgramEnd(primary, activeDate, userProfile) ? (
        <p className="-mt-3 text-[14px] text-muted leading-tight">
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

      {/* Post-graduation, ProposalStack + SignalsStrip + RetestReminder all
          suppressed — the graduation experience is one card, not a menu of
          proposals + signals mixed in with "you finished". CSM delta-2
          2026-08-19 caught "You finished · 8 weeks logged" rendering
          alongside "Not feeling 100% · ×0.95 applied" simultaneously. */}
      {!isPastProgramEnd(primary, activeDate, userProfile) ? (
        <>
          <ProposalStack program={primary} date={activeDate} />
          <HeroStateCard date={activeDate} />
          <SignalsStrip program={primary} date={activeDate} />
          <RetestReminder program={primary} profile={userProfile} activeDate={activeDate} />
        </>
      ) : (
        <HeroStateCard date={activeDate} />
      )}

      {/* Taper phase — surface it prominently so the reduced session duration
          isn't read as an error. Read the phase's is_taper flag which we set
          for test-prep programs (currently just rowing-2k-test-prep). */}
      {phase && (phase as unknown as { is_taper?: boolean }).is_taper ? (
        <div className="rounded border border-slate/40 bg-slate/10 border-l-4 border-l-slate px-3 py-2 text-[14px]">
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
            <div className="rounded border border-amber/40 bg-amber/10 border-l-4 border-l-amber px-3 py-2 text-[14px]">
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
        <div className="rounded border border-amber/40 bg-amber/10 border-l-4 border-l-amber px-3 py-2 text-[14px]">
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
          // `active_program_started_at` is a full ISO string ending in Z.
          // Concatenating "T00:00:00" without stripping first produced
          // `Invalid Date` → "Week NaN" on Today for every multi_dim program.
          // Match schedule.ts:251 + plan-generator.ts:228 with the same guard.
          // Comprehensive audit 2026-08-18.
          const started = new Date(userProfile.active_program_started_at.slice(0, 10) + "T00:00:00");
          const today = new Date(activeDate + "T00:00:00");
          const daysIn = Math.max(0, Math.floor((today.getTime() - started.getTime()) / 864e5));
          const week = Math.floor(daysIn / 7) + 1;
          const mode = week <= 2 ? "blocked practice — drills in the composed order" : "random practice — order shuffled by the seed";
          return (
            <p className="text-[11px] text-muted font-mono">
              Week {week} · {mode}. <span className="text-muted">Shea &amp; Morgan 1979.</span>
            </p>
          );
        })()
      ) : null}

      {multipleProgramsToday ? (
        (() => {
          // Track-specific interference wording. Delta-3 flagged the
          // hardcoded Schumann text fired for every pair including
          // combinations where interference isn't the actual concern
          // (skill + mobility, rehab + anything). Categories come from
          // the manifest entry per program slug.
          const activeCats = new Set<string>();
          for (const g of groupsWithBlocks) {
            const slug = g.program.slug;
            if (!slug) continue;
            const entry = programManifest?.programs.find((p) => p.slug === slug);
            if (entry?.category) activeCats.add(entry.category);
          }
          const has = (c: string) => activeCats.has(c);
          const hasStrengthAndAerobic =
            (has("strength") || has("rehab")) && has("endurance");
          const hasSkill = has("skill") || has("gymnastics");
          const hasMobility = has("asymmetry") || has("mobility");
          const hasRehab = has("rehab");
          let interference: string;
          if (hasStrengthAndAerobic) {
            interference =
              "Concurrent endurance + strength has known interference effects (Schumann 2022). Aim for ≥6 hours between sessions if you do both.";
          } else if (hasSkill && (has("strength") || has("endurance"))) {
            interference =
              "Skill + strength/aerobic on the same day: put the skill work first — motor learning suffers when the CNS is already fatigued (Sadowski 2021 analog).";
          } else if (hasRehab && has("endurance")) {
            interference =
              "Rehab + endurance: watch symptom score after cardio. Any groin / hip flare-up = tomorrow's rehab session is symptom-gated.";
          } else if (hasMobility) {
            interference =
              "Mobility runs alongside the rest without interference. Optional to sequence — do mobility after strength/skill when time permits.";
          } else {
            interference =
              "Multiple tracks today. If it's too much, snooze one from Profile.";
          }
          return (
            <div className="rounded border border-amber/40 bg-amber/10 px-3 py-2.5 text-[14px]">
              <p className="text-amber-strong">
                <span className="font-semibold">
                  {groupsWithBlocks.length} tracks scheduled today.
                </span>{" "}
                If it&apos;s too much, snooze one from{" "}
                <Link href="/profile" className="underline">Profile</Link>.
              </p>
              <p className="text-muted mt-1">{interference}</p>
            </div>
          );
        })()
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
          <div id="log-session" className="cv-auto"><RunSlotCard date={activeDate} /></div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Phase C · Day-header shortcut — only when block-object is on AND
              2+ programs have blocks today. Single-program stays visually
              identical to the legacy path. See §0.2 of the plan. */}
          {blockObjectOn && multipleProgramsToday ? (
            <DayHeaderShortcut date={activeDate} programCount={groupsWithBlocks.length} />
          ) : null}
          {groups.map((g, gi) =>
            g.blocks.length === 0 ? null : (
              <div key={g.program.schema_version + ":" + gi} className="space-y-5">
                {/* Audit 2026-08-18 (a11y P1) — h2 for landmark jumping.
                    Visual styling unchanged. */}
                {groupsWithBlocks.length > 1 ? (
                  <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted -mb-2 font-normal">
                    {programDisplayName(g.program, activeSlugs[gi])}
                  </h2>
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
                {/* Phase C · Per-program Skip / Move menu, ONLY when
                    block-object is on. Legacy path still uses the one
                    SessionActions at the bottom (below). */}
                {blockObjectOn && g.program.slug ? (
                  <PerProgramActions
                    programSlug={g.program.slug}
                    programName={programDisplayName(g.program, activeSlugs[gi])}
                    date={activeDate}
                    scheduledBlocks={g.scheduled}
                  />
                ) : null}
              </div>
            ),
          )}
          <div id="log-session" className="cv-auto"><RunSlotCard date={activeDate} /></div>
          {/* Legacy whole-day actions. Block-object mode drives skip/move
              per program via <PerProgramActions> above. */}
          {!blockObjectOn ? (
            <SessionActions blockIds={allBlocks.map((b) => b.id)} date={activeDate} program={primary} />
          ) : null}
        </div>
      )}
    </div>
  );
}

function programDisplayName(_program: Program, slug: string): string {
  // Slug title-case matches the manifest name for every current program;
  // `program_goal.display_name` is often the target metric ("Loaded
  // overhead shoulder flexion") and reads as a bug. Same anti-pattern
  // reveal-copy.ts + BlockHistorySection.tsx already fix. Multi-track
  // delta-3 caught this leaked in the multi-program h2 render.
  return slug
    .split("-")
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/**
 * Phase C — day-level header that appears ONLY when 2+ programs are
 * scheduled on the same date. Carries a compact "Skip whole day"
 * shortcut so the founder doesn't have to hit Skip on every card
 * individually. See §0.2 of the plan. Single-program state omits this
 * entirely — no chrome tax.
 */
function DayHeaderShortcut({ date, programCount }: { date: string; programCount: number }) {
  const skipWholeDay = useStore((s) => s.skipWholeDay);
  const [confirming, setConfirming] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const humanDate = new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  // Audit 2026-08-18 (a11y + mobile-UX + visual-craft) — was 40px (Apple 44
  // fail); confirm-swap jumped ~50px (Cancel + Confirm pair widened the
  // container in `justify-between`); focus was lost on swap. Fix: bump
  // every button to min-h-[44px]; wrap the swap area in a stable-width
  // container so Confirm lands under the original Skip position; autofocus
  // Confirm after swap.
  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);
  return (
    <div className="rounded border border-line-soft border-l-4 border-l-line bg-surface p-3 flex items-center justify-between gap-3">
      <div className="text-sm">
        <p className="font-semibold text-strong">{humanDate}</p>
        <p className="text-muted text-[14px] mt-0.5">
          {programCount} tracks scheduled today. Skip or move each independently below.
        </p>
      </div>
      <div className="min-w-[176px] flex justify-end items-center gap-2">
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-[12px] mono-caps border border-line rounded px-3 py-2 min-h-[44px] hover:bg-line-soft"
          >
            Skip whole day
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-[12px] mono-caps text-muted hover:text-ink px-3 py-2 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              ref={confirmRef}
              type="button"
              onClick={() => {
                skipWholeDay(date);
                setConfirming(false);
              }}
              className="text-[12px] mono-caps rounded bg-bronze text-ground px-3 py-2 min-h-[44px] hover:bg-bronze-hover"
            >
              Confirm skip
            </button>
          </>
        )}
      </div>
    </div>
  );
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
    <div className="rounded border border-bronze/30 bg-bronze/5 px-3 py-2 text-[14px]">
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

/**
 * F5 (Batch 23) — one-tap verb row with caption. Vertical stack replaces
 * the prior horizontal chip row on GraduationCard; the caption is the
 * load-bearing "what does this do" affordance for a rare-frequency
 * end-of-arc decision.
 */
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
      {/* P1-63 (Batch 27) — button labels migrated from 11 px mono-caps
          to 14 px sentence-case font-semibold. Mono-caps stays for
          eyebrows + pills + row-meta; button-labels want the same
          weight/scale as body text so verbs read as verbs, not chips. */}
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

function GraduationCard({ program }: { program: Program }) {
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

  // Slug title-case — same anti-pattern reveal-copy / BlockHistorySection
  // / programDisplayName already avoid. Multi-track + graduation delta-3
  // both caught the metric-name leak.
  const programName = program.slug
    ? program.slug
        .split("-")
        .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" ")
    : program.program_goal?.display_name ?? "Your program";

  // Follow-on program pointer. Programs authored as `block_1_of_N` can
  // declare `next_block_slug` in JSON to link to Block 2. Falls back to
  // a generic Programs catalog CTA. Graduation delta-3 2026-08-19.
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
            <span
              className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                arcVerdict.tone === "green"
                  ? "bg-green/20 text-green"
                  : arcVerdict.tone === "amber"
                    ? "bg-amber/20 text-amber"
                    : "bg-red/20 text-red-strong"
              }`}
            >
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
        {/* F5 (Batch 23) — 4-verb vertical stack replaces the prior chip
            row. Each verb has a caption to disambiguate — this is a rare-
            frequency decision, so density < clarity. Order: Repeat is
            the primary (bronze fill); Extend / Take a break / Pick next
            are secondary. */}
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

function RetestReminder({
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
      {/* F10 (Batch 24) — retest-window Monday hand-off. Fires on the
          Mon of a week that hits a cadence (weeksIn % cadence === 0).
          "Not this week" dismisses to localStorage under the ISO-week
          key; re-fires next Monday. */}
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
      {/* P1-63 (Batch 27) — RetestReminder CTAs migrated to sentence-case
          14 px font-semibold. Reads as verbs, not chips. */}
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
        <h2 className="font-mono text-[14px] font-semibold uppercase tracking-widest">
          {humanBlockName(block.name)}
        </h2>
        <span className="font-mono text-[11px] text-muted">{meta}</span>
      </header>
      {block.note ? (
        <p className="rounded border border-line-soft border-l-4 border-l-slate bg-surface px-3 py-2 text-[14px] text-muted">
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

