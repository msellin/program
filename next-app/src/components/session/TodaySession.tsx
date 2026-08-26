"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProgram, loadProgramManifest, loadExercises } from "@/lib/data-loader";
import { HeroStateCard } from "@/components/workout/HeroStateCard";
import { FirstRunBanner } from "@/components/FirstRunBanner";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { DashboardBlock } from "@/components/DashboardBlock";
import { YourPlanCard } from "@/components/workout/YourPlanCard";
import { SignalsStrip } from "@/components/workout/SignalsStrip";
import { RunSlotCard } from "@/components/workout/RunSlotCard";
import { ProposalStack } from "@/components/workout/ProposalStack";
import { Day1EmptyState } from "@/components/workout/Day1EmptyState";
import { ArcProgressBar } from "@/components/ui/ArcProgressBar";
import { useStore } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import {
  activePhaseFor,
  isPastProgramEnd,
  RACE_DATE,
  HOLIDAY_GAP,
} from "@/lib/engine/schedule";
import { blocksForDate, composeBlockForUser } from "@/lib/engine/plan-generator";
import { getBlocksForDate, isBlockObjectOn, DAY_VISIBLE_BLOCK_STATES } from "@/lib/engine/block-selectors";
import { migrateLegacyToBlocks, needsBlockMigration } from "@/lib/migrations/legacy-to-blocks";
import { RestDayCard, RetestReminder, GraduationCard } from "@/components/session/shared/StatusCards";
import { programDisplayName, humanPhaseName, humanBlockName, phaseProgress, phaseWeekPair } from "@/lib/day-format";
import type { Program, Block, Exercise, Phase, Store, ScheduledBlock, ProgramManifest } from "@/lib/schemas";
/**
 * F8-second (2026-08-19/20), trimmed for the Day redesign (2026-08-23) —
 * this component now powers ONLY the `/` Today dashboard (compact
 * DashboardBlock summary per active program + "Open session →" CTA).
 * `/session/[slug]` moved to its own dedicated shell,
 * `src/components/session/DaySession.tsx` — the old shared-component-via-
 * `slugOverride` approach tangled two very different render trees (a
 * compact dashboard vs. the full Brief/Set/Rest session UI) in one file.
 * Empty/end-state cards (RestDayCard, RetestReminder, GraduationCard) and
 * display-formatting helpers moved to `@/components/session/shared/
 * StatusCards` and `@/lib/day-format` so both this file and DaySession.tsx
 * reuse the identical logic instead of forking it.
 */
export function TodaySession({
  initialDate,
}: { initialDate?: string } = {}) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [byId, setById] = useState<Record<string, Exercise>>({});
  const [error, setError] = useState<string | null>(null);
  // Week 4a (2026-08-21) — DateNav removed from Day per D2 (Plan tab owns
  // date browsing). activeDate is read-only inside this component; the
  // setter remains only because React's useState pattern returns it.
  // Session route seeds via `initialDate` from SessionClient's ?date=
  // param.
  const [activeDate] = useState(() => initialDate ?? todayISO());
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

  // Effective list of programs to render. Legacy path: fall back to
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
          states: DAY_VISIBLE_BLOCK_STATES,
        },
      );
      const composed = scheduledForToday
        .map((sb) => p.blocks.find((b) => b.id === sb.block_template_id))
        .filter((b): b is Block => Boolean(b))
        // Template ID → authored block, which for slot-based programs has no
        // items until they're composed per user. See composeBlockForUser.
        .map((b) => composeBlockForUser(p, b, userProfile, activeDate, byId, { onlyIfEmpty: true }));
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
    <div className="space-y-6 pt-4">
      {/* Batch 36 Step 10 · H1 inversion per v1.1.1 §5 + landing C1
          (Aug 2026). The workout name is the H1; the route scope moves to
          a mono-caps eyebrow above. Multi-track: primary program's
          display name is the H1; concurrent tracks render below in their
          own DashboardBlock groups. */}
      <header className="space-y-1">
        <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted">
          {todayEyebrow(activeDate, phase)}
        </p>
        <h1 className="text-[32px] font-bold tracking-[-0.03em] text-strong leading-none">
          {primary.slug ? programDisplayName(primary, primary.slug) : "Day"}
        </h1>
      </header>

      {programs.length === 1 && phase && phaseWeekPair(phase, activeDate) ? (
        (() => {
          const pair = phaseWeekPair(phase, activeDate)!;
          const programName = primary.slug ? programDisplayName(primary, primary.slug) : "Program";
          return (
            <ArcProgressBar
              programName={programName}
              weekCurrent={pair.current}
              weekTotal={pair.total}
              ariaLabel={`Program progress: week ${pair.current} of ${pair.total}.`}
            />
          );
        })()
      ) : null}

      {/* Suppress the reveal card once the user has any real log history —
          if they've been using the app, they know what plan they're on.
          Also suppress after graduation. Delta audit 2026-08-19. */}
      {!isPastProgramEnd(primary, activeDate, userProfile) &&
      Object.keys(logs ?? {}).length < 3 ? (
        <YourPlanCard program={primary} />
      ) : null}

      <FirstRunBanner />

      {/* MissedSessionPrompt removed 2026-08-23 — its job (a single-day
          "yesterday was missed" nudge) is superseded by WeekRecoveryCard
          on /plan, which generalizes it to the whole week and is where
          the README's own capability table says it belongs. See
          dev/active/week-recovery-plan.md. */}

      {/* Week 4a (2026-08-21) — DateNav removed from the Day surface per
          locked decision D2 (Plan tab owns date browsing). The Day tab
          is fixed to today structurally; a user who wants to browse
          tomorrow's plan or yesterday's log goes to the Plan tab.
          This is the fix-by-policy for the tomorrow→session date bug:
          Day literally cannot render a non-today state now, so there is
          no caller-date to inherit.
          Session route seeds activeDate via SessionClient's initialDate
          from ?date= query param — no DateNav visual either; sessions
          are single-day focused views. */}

      {/* Suppress phase readout when the user has already graduated. Prior
          behavior: activePhaseFor returned the LAST phase as fallback, so
          Today showed "Taper + test · week 1 of 3" alongside the graduation
          card — 4 contradictory clocks on rowing per delta audit
          2026-08-19. */}
      {/* Phase readout — shown on rest days (allBlocks.length === 0).
          Dashboard mode's workout DashboardBlock lede already carries the
          phase name on workout days, so showing it here too would repeat
          the same info twice. */}
      {phase &&
      !isPastProgramEnd(primary, activeDate, userProfile) &&
      allBlocks.length === 0 ? (
        <p className="-mt-3 text-[14px] text-muted leading-tight">
          <span className="text-strong">{humanPhaseName(phase.name)}</span>
          {phaseProgress(phase, activeDate) ? (
            <span className="text-slate"> · {phaseProgress(phase, activeDate)}</span>
          ) : null}
        </p>
      ) : null}

      {(() => {
        const noCheckToday = !logs[activeDate]?.symptoms;
        if (!hasHistory && noCheckToday && activeDate === todayISO()) {
          return <Day1EmptyState />;
        }
        return null;
      })()}

      {!isPastProgramEnd(primary, activeDate, userProfile) ? (
        <>
          <ProposalStack program={primary} date={activeDate} />
          <HeroStateCard date={activeDate} />
          <SignalsStrip program={primary} date={activeDate} />
          <RetestReminder program={primary} profile={userProfile} activeDate={activeDate} />
        </>
      ) : null}
      {/* Batch 38 (2026-08-21) — HeroStateCard no longer renders on
          graduated programs. Prior branch surfaced "WORKOUT READY ·
          Progress load. Nothing above 3/10 in your check." above the
          GraduationCard's "YOU FINISHED · 6 weeks logged. Nice."
          which was a direct workflow contradiction (Rowing 2K REV-5
          §e). GraduationCard is the single anchored state for a
          finished arc; the daily readiness readout has no meaning
          without a prescribed session to gate. */}

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

      {/* Multi-track interference banner. */}
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
        /* Today's dashboard mode: a compact DashboardBlock summary per
           active program + "Open session →" CTA. Users scan today's
           workout at a glance and dive into the focused session
           (/session/[slug], DaySession.tsx) only when ready to work. */
        <>
          {groups.map((g, gi) => {
            if (g.blocks.length === 0) return null;
            const groupPhase = gi === 0 ? phase : activePhaseFor(g.program, activeDate, userProfile);
            const totalExercises = g.blocks.reduce(
              (n, b) => n + (b.items?.length ?? 0),
              0,
            );
            const blockWord = g.blocks.length === 1 ? "block" : "blocks";
            const exWord = totalExercises === 1 ? "exercise" : "exercises";
            // Blocks that prescribe in prose rather than sets — every
            // rowing block is one — counted as zero exercises, so Day
            // announced "1 block · 0 exercises" for a 40-minute threshold
            // row. Give the duration those blocks actually author.
            const prescriptionMinutes = g.blocks.reduce((n, b) => {
              if ((b.items?.length ?? 0) > 0) return n;
              const d = (b as unknown as { duration_min?: number | number[] }).duration_min;
              if (Array.isArray(d)) return n + (d[1] ?? d[0] ?? 0);
              return n + (typeof d === "number" ? d : 0);
            }, 0);
            const summary =
              totalExercises === 0 && prescriptionMinutes > 0
                ? `${g.blocks.length} ${blockWord} · about ${prescriptionMinutes} min`
                : `${g.blocks.length} ${blockWord} · ${totalExercises} ${exWord}`;
            // Batch 33 · M6 · category accent stripe on the workout summary
            // block. Same DashboardBlock `accent` prop already used on the
            // Programs catalog. Mapping cribbed from CATEGORY_ACCENT in
            // src/app/programs/page.tsx — rehab/skill/mobility=slate,
            // strength=bronze, endurance=green, hyrox=amber. Falls back
            // to "default" (no stripe) for unknown categories.
            const category = programManifest?.programs.find(
              (p) => p.slug === g.program.slug,
            )?.category;
            const accent: "slate" | "bronze" | "green" | "amber" | "default" =
              category === "strength"
                ? "bronze"
                : category === "endurance"
                  ? "green"
                  : category === "hyrox"
                    ? "amber"
                    : category === "rehab" ||
                        category === "skill" ||
                        category === "asymmetry"
                      ? "slate"
                      : "default";
            return (
              <DashboardBlock
                key={`summary:${g.program.schema_version}:${gi}`}
                accent={accent}
                eyebrow={
                  groupsWithBlocks.length > 1
                    ? `Today · ${programDisplayName(g.program, activeSlugs[gi])}`
                    : "Today"
                }
                title={summary}
                lede={
                  groupPhase
                    ? `${humanPhaseName(groupPhase.name)}${phaseProgress(groupPhase, activeDate) ? " · " + phaseProgress(groupPhase, activeDate) : ""}`
                    : undefined
                }
                primaryCta={
                  g.program.slug
                    ? {
                        label: "Open session",
                        // 2026-08-21 fix — pass activeDate so tomorrow /
                        // yesterday navigation on Today is preserved when
                        // opening the session. Was `/session/${slug}`
                        // which always landed on todayISO() regardless
                        // of what the user was browsing.
                        href: `/session/${g.program.slug}?date=${activeDate}`,
                      }
                    : undefined
                }
              >
                <ul className="text-[13px] text-muted space-y-0.5">
                  {g.blocks.slice(0, 5).map((b) => (
                    <li key={b.id} className="truncate">
                      · {humanBlockName(b.name)}
                    </li>
                  ))}
                  {g.blocks.length > 5 ? (
                    <li className="text-muted/60">+ {g.blocks.length - 5} more</li>
                  ) : null}
                </ul>
              </DashboardBlock>
            );
          })}
          {/* Day's off-plan card removed 2026-08-24. It was the third
              surface for the same thing (Profile row + the Brief's
              activity footer being the others), and it advertised
              "N drills available" for work the plan already schedules on
              specific days — so tapping it was a route to double-logging.
              Activity logging (a run, a row, a class) is unaffected and
              still lives in the RunSlotCard below + the session Brief. */}
          <div id="log-session" className="cv-auto"><RunSlotCard date={activeDate} /></div>
        </>
      )}
    </div>
  );
}

/**
 * Batch 36 Step 10 — mono-caps eyebrow above the Today H1 per v1.1.1 §5.
 *
 * "TODAY" or "TODAY · WEEK 3 OF 6" (when phase carries a week progress).
 * On date-nav browsing: "MON · AUG 18" style short-form.
 *
 * Purpose: solve the DateNav duplication without inverting hierarchy.
 * The eyebrow tier gives just enough scope + progress that the H1 can
 * carry the workout name unchallenged.
 */
function todayEyebrow(
  activeDate: string,
  phase: Phase | null | undefined,
): string {
  const iso = todayISO();
  const scopeToken = activeDate === iso ? "TODAY" : shortDateToken(activeDate);
  const progressToken = phase ? phaseProgressToken(phase, activeDate) : null;
  return progressToken ? `${scopeToken} · ${progressToken}` : scopeToken;
}

function shortDateToken(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d
    .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
    .toUpperCase();
}

function phaseProgressToken(phase: Phase, activeDate: string): string | null {
  const raw = phaseProgress(phase, activeDate);
  if (!raw) return null;
  // phaseProgress returns "week 3 of 6" style; upper-case for the eyebrow tier.
  return raw.toUpperCase();
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
