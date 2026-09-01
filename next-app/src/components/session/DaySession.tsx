"use client";

import { useEffect, useMemo, useState } from "react";
import { loadProgram, loadExercises, applyProgramExerciseOverrides } from "@/lib/data-loader";
import { useStore, entrySets } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import { activePhaseFor, isPastProgramEnd, isAwayOn, HOLIDAY_GAP } from "@/lib/engine/schedule";
import { blocksForDate, composeBlockForUser } from "@/lib/engine/plan-generator";
import { getBlocksForDate, isBlockObjectOn, DAY_VISIBLE_BLOCK_STATES } from "@/lib/engine/block-selectors";
import { migrateLegacyToBlocks, needsBlockMigration } from "@/lib/migrations/legacy-to-blocks";
import { suggestForExercise, type Suggestion } from "@/lib/engine/suggest";
import { selectProposals } from "@/lib/proposals/select";
import { dedupeItems, humanBlockName } from "@/lib/day-format";
import { RestDayCard, GraduationCard } from "@/components/session/shared/StatusCards";
import { BriefView } from "@/components/session/BriefView";
import { SetView } from "@/components/session/SetView";
import { RestTakeover } from "@/components/session/RestTakeover";
import { nextAfterSet } from "@/components/session/shared/advance";
import { NoteSheet } from "@/components/session/NoteSheet";
import { countLoggedSets } from "@/lib/set-progress";
import { RunSlotCard } from "@/components/workout/RunSlotCard";
import type { Block, Exercise, Program, Store } from "@/lib/schemas";

/**
 * Day redesign (2026-08-23) — the /session/[slug] shell.
 *
 * Two states of one shell (README's framing): Brief (what am I doing
 * today, never scrolls) and Set (one set at a time, rail always
 * reachable). Rest is a full-screen takeover layered on top of Set, not
 * a third routed state, so switching exercise mid-rest doesn't lose
 * position.
 *
 * Local UI state lives here (per the README's interaction spec) and is
 * threaded down as props — BriefView/SetView/RestTakeover are pure
 * render + callback components, no store access of their own beyond
 * what they need to read/write a set.
 */

export type RailExercise = {
  key: string; // `${blockId}:${exerciseId}` — matches the store's exercise-log key
  blockId: string;
  blockName: string;
  exercise: Exercise;
  item: NonNullable<Block["items"]>[number];
  rowCount: number;
  suggestion: Suggestion | null;
  // Ported from the old ExerciseCard's isLoadable gate — mobility/cardio
  // exercises don't carry a weight. SetView hides the weight row when
  // false. Every Day session exercise is loadable (blocksForDate only
  // ever selects strength blocks); OffPlanSession's accessory/run rail
  // is where this actually varies.
  isLoadable: boolean;
};

export type SessionSheet = "off-plan" | "overflow" | "note" | "jump" | "details" | null;

export function DaySession({ slug, initialDate }: { slug: string; initialDate?: string }) {
  const [program, setProgram] = useState<Program | null>(null);
  const [byId, setById] = useState<Record<string, Exercise>>({});
  const [error, setError] = useState<string | null>(null);
  const [activeDate] = useState(() => initialDate ?? todayISO());

  const hydrated = useStore((s) => s.hydrated);
  const userProfile = useStore((s) => s.store.user_profile);
  const store = useStore((s) => s.store);
  const override = useStore((s) => s.store.scheduled_overrides?.[activeDate]);
  const blockObjectOn = useStore((s) => isBlockObjectOn(s.store));
  const scheduledBlocksMap = useStore((s) => s.store.scheduled_blocks);
  const replaceStore = useStore((s) => s.replaceStore);

  useEffect(() => {
    void Promise.all([loadProgram(slug), loadExercises()])
      .then(([p, x]) => {
        setProgram(p);
        setById(applyProgramExerciseOverrides(x.byId, p));
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [slug]);

  useEffect(() => {
    if (!blockObjectOn || !program || !hydrated) return;
    const s = useStore.getState().store;
    if (!needsBlockMigration(s)) return;
    const migrated = migrateLegacyToBlocks(s, { [slug]: program }, todayISO());
    replaceStore(migrated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockObjectOn, !!program, hydrated]);

  // Session-shell UI state (README interaction spec).
  const [mode, setMode] = useState<"brief" | "set">("brief");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [editingLoad, setEditingLoad] = useState(false);
  const [sheet, setSheet] = useState<SessionSheet>(null);
  const [resting, setResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(120);
  const [effortAnswered, setEffortAnswered] = useState(false);

  // Hooks must run unconditionally on every render, so `phase`/`blocks`
  // are computed defensively here (program may still be null on the
  // first render) and `useMemoRail` — which wraps `useMemo` — is called
  // before any early return below.
  const phase = program ? activePhaseFor(program, activeDate, userProfile) : undefined;
  const blocks: Block[] = !program
    ? []
    : (() => {
        if (blockObjectOn) {
          const scheduledForToday = getBlocksForDate(
            { scheduled_blocks: scheduledBlocksMap } as Store,
            activeDate,
            { slug: program.slug, states: DAY_VISIBLE_BLOCK_STATES },
          );
          return scheduledForToday
            .map((sb) => program.blocks.find((b) => b.id === sb.block_template_id))
            .filter((b): b is Block => Boolean(b))
            // `scheduled_blocks` stores template IDs, so what comes back is
            // the AUTHORED block. Slot-based programs (overhead-mobility)
            // author no items at all — their exercises are composed per user
            // from `drill_library` — so without this the rail was empty and
            // the Brief had nothing to start. Legacy path gets the same
            // treatment inside blocksForDate.
            .map((b) => composeBlockForUser(program, b, userProfile, activeDate, byId, { onlyIfEmpty: true }));
        }
        const overrideBlocks = override
          ? program.blocks.filter((b) => override.blocks.includes(b.id) && (b.category ?? "strength") === "strength")
          : null;
        if (overrideBlocks && overrideBlocks.length) return overrideBlocks;
        return blocksForDate(program, userProfile, phase, activeDate, byId, store);
      })();
  const railExercises: RailExercise[] = useMemoRail(blocks, byId, program, store, activeDate);

  if (error) {
    return (
      <div className="mt-8 rounded border border-red bg-surface p-4">
        <h2 className="mb-2 text-lg font-semibold">Couldn&apos;t load program data</h2>
        <p className="text-sm text-muted">{error}</p>
      </div>
    );
  }
  if (!program || !hydrated) {
    return <div className="mt-8 text-sm text-muted">Loading…</div>;
  }

  if (isPastProgramEnd(program, activeDate, userProfile) && activeDate === todayISO()) {
    return <GraduationCard program={program} />;
  }

  if (!blocks.length) {
    const userTargetTestDate =
      userProfile?.program_states?.[program.slug ?? ""]?.intake_answers?.target_test_date;
    const isRowingTestDay = program.slug === "rowing-2k-test-prep" && userTargetTestDate === activeDate;
    const variant =
      isAwayOn(userProfile, activeDate)
        ? "away"
        : isRowingTestDay
          ? "test"
          : activeDate < program.phases[0]?.starts
            ? "before"
            : program.slug === "anterior-hip-rebuild" &&
                activeDate >= HOLIDAY_GAP.start &&
                activeDate <= HOLIDAY_GAP.end
              ? "holiday"
              : "rest";
    // 2026-08-30 — this used to return the card alone, and BriefView (which
    // carries the "Log a run, row, or class" footer) never rendered. So every
    // rest day reached through /session/[slug] was a dead end: no form, no
    // button, and copy pointing at a tab that no longer exists. Plan's own
    // "Log a session →" link for rest days carried a comment claiming it
    // landed "in RestDayCard + RunSlotCard mode" — that mode was never built.
    // It is now. RunSlotCard writes to logs[activeDate], so a past rest day
    // records correctly too. TodaySession pairs these the same way on `/`.
    // Future days get the card only — there is nothing to log yet.
    return (
      <>
        <RestDayCard
          variant={variant}
          programName={program.program_goal?.display_name}
          firstSessionDate={program.phases[0]?.starts}
          programSlug={program.slug}
        />
        {activeDate <= todayISO() ? (
          <div id="log-session" className="cv-auto mt-3">
            <RunSlotCard date={activeDate} />
          </div>
        ) : null}
      </>
    );
  }

  const activeIdx = activeKey ? railExercises.findIndex((r) => r.key === activeKey) : -1;
  const active = activeIdx >= 0 ? railExercises[activeIdx] : null;

  // README: "Back from Set returns to Brief without discarding progress;
  // the CTA then reads Continue — Bench press, set 4." Landing on set 0
  // regardless of what's already logged would silently re-prompt for
  // sets the user already did (harmless — Done just re-writes the same
  // values — but not what Continue means). Land on the first unfinished
  // set instead; if every set is already logged, land on the last one.
  const firstUnfinishedSetIndex = (key: string): number => {
    const r = railExercises.find((re) => re.key === key);
    if (!r) return 0;
    const entry = store.logs[activeDate]?.exercises[key] ?? null;
    const logged = countLoggedSets(entrySets(entry), r.isLoadable);
    return Math.min(logged, r.rowCount - 1);
  };

  const startSession = (key?: string) => {
    const target = key ?? railExercises[0]?.key ?? null;
    setActiveKey(target);
    setActiveSetIndex(target ? firstUnfinishedSetIndex(target) : 0);
    setEditingLoad(false);
    setMode("set");
  };

  // Reached from both shells: the Brief's exercise rows (where it must
  // also open Set — tapping a row from the Brief did nothing before,
  // because mode stayed "brief" and the Brief is what renders) and
  // SetView / RestTakeover's rail (where mode is already "set", so the
  // last line is a no-op). Mirrors OffPlanSession's jumpTo.
  const jumpTo = (key: string) => {
    setActiveKey(key);
    setActiveSetIndex(firstUnfinishedSetIndex(key));
    setEditingLoad(false);
    setResting(false);
    setSheet(null);
    setMode("set");
  };

  // Auto-advance target: the next unfinished set on this exercise, or the
  // next exercise in the rail once its rows are full.
  const upNext = nextAfterSet(
    railExercises,
    activeIdx,
    active
      ? countLoggedSets(
          entrySets(store.logs[activeDate]?.exercises[active.key] ?? null),
          active.isLoadable,
        )
      : 0,
  );

  const proposals = selectProposals(store, program, activeDate);
  const tmBump = proposals.find((p) => p.kind === "tm_bump") ?? null;
  // Walk the rail rather than the raw log so each entry is judged with its
  // own `isLoadable` — a bodyweight set carries no weight by design.
  const loggedSetsToday = railExercises.some(
    (r) => countLoggedSets(entrySets(store.logs[activeDate]?.exercises[r.key] ?? null), r.isLoadable) > 0,
  );
  const cycleGateActive = !!tmBump && !loggedSetsToday;

  if (mode === "brief" || !active) {
    return (
      <BriefView
        program={program}
        phase={phase}
        activeDate={activeDate}
        blocks={blocks}
        railExercises={railExercises}
        store={store}
        proposals={proposals.filter((p) => p.kind !== "tm_bump" || !cycleGateActive)}
        cycleGateProposal={cycleGateActive ? tmBump : null}
        onStart={startSession}
        onSelectExercise={jumpTo}
        sheet={sheet}
        onOpenSheet={setSheet}
        onCloseSheet={() => setSheet(null)}
      />
    );
  }

  return (
    // z-50: must clear BottomNav's z-40 (and win its DOM-order tiebreak —
    // BottomNav renders after <main> in AppShell) so the "full-screen
    // takeover" the README specifies actually hides the tab bar, not just
    // the content behind it.
    <div data-surface="SetView" className="fixed inset-0 z-50 flex flex-col bg-ground">
      <SetView
        key={`${active.key}:${activeSetIndex}`}
        railExercises={railExercises}
        active={active}
        activeSetIndex={activeSetIndex}
        editingLoad={editingLoad}
        onEditingLoad={setEditingLoad}
        onSelectExercise={jumpTo}
        onSelectSetIndex={(i) => {
          setEditingLoad(false);
          setActiveSetIndex(i);
        }}
        onBackToBrief={() => setMode("brief")}
        onConfirmed={(secs) => {
          setRestSeconds(secs);
          setResting(true);
        }}
        onEdited={() => {
          // A correction, not a set — no rest. Put the user back where
          // they were actually working rather than leaving them parked
          // on the set they just fixed.
          setEditingLoad(false);
          setActiveSetIndex(firstUnfinishedSetIndex(active.key));
        }}
        sheet={sheet}
        onOpenSheet={setSheet}
        onCloseSheet={() => setSheet(null)}
        date={activeDate}
      />
      {resting ? (
        <RestTakeover
          active={active}
          justLoggedSetIndex={activeSetIndex}
          targetSeconds={restSeconds}
          railExercises={railExercises}
          upNext={upNext}
          effortAnswered={effortAnswered}
          onEffortAnswered={setEffortAnswered}
          date={activeDate}
          onDone={() => {
            setResting(false);
            setEffortAnswered(false);
            setEditingLoad(false);
            // Same `upNext` the rest screen just showed — label and
            // landing can't drift apart.
            if (upNext.kind === "set") {
              setActiveSetIndex(upNext.setIndex);
            } else if (upNext.kind === "exercise") {
              setActiveKey(upNext.rail.key);
              setActiveSetIndex(0);
            } else {
              setMode("brief");
            }
          }}
          onJump={(key) => {
            setResting(false);
            setEffortAnswered(false);
            jumpTo(key);
          }}
          onOpenNoteSheet={() => setSheet("note")}
        />
      ) : null}
      {sheet === "note" ? (
        <NoteSheet
          active={active}
          date={activeDate}
          isSkillProgram={program.slug === "handstand-walk"}
          onClose={() => setSheet(null)}
          onStopSession={() => {
            setSheet(null);
            setResting(false);
            setMode("brief");
          }}
        />
      ) : null}
    </div>
  );
}

function useMemoRail(
  blocks: Block[],
  byId: Record<string, Exercise>,
  program: Program | null,
  store: Store,
  activeDate: string,
): RailExercise[] {
  return useMemo(() => {
    const out: RailExercise[] = [];
    if (!program) return out;
    for (const block of blocks) {
      // Run-category blocks are logged as ACTIVITIES, not as sets
      // (2026-08-26). Engine Builder authors one vestigial item per run
      // block, which made the app draw a set screen for a 45-minute Zone 1
      // run and write reps and kilos into `exercises[]` — where nothing
      // reads them. Its only log-based metric is
      // `runs[].avg_hr where intensity == 'easy'`, so a diligent user could
      // log every session and show zero progress. CSM's run blocks already
      // author zero items; rowing's do too. Route by category so all three
      // behave the same.
      if ((block.category ?? "strength") === "run") continue;
      const items = dedupeItems(block.items ?? []);
      for (const item of items) {
        if (!item.exercise_id) continue;
        const exercise = byId[item.exercise_id];
        if (!exercise) continue;
        const suggestion = suggestForExercise(exercise.id, block.id, program, store, activeDate);
        const defaultSets =
          (typeof item.sets === "number" ? item.sets : undefined) ??
          (typeof exercise.default?.sets === "number" ? (exercise.default.sets as number) : undefined) ??
          3;
        const schemeRowCount = suggestion?.fsl ? suggestion.fsl.sets + 1 : defaultSets;
        out.push({
          key: `${block.id}:${exercise.id}`,
          blockId: block.id,
          blockName: humanBlockName(block.name),
          exercise,
          item,
          rowCount: schemeRowCount,
          suggestion,
          // Was hardcoded `true` with the comment "blocksForDate only ever
          // selects strength blocks". That is false: a strength BLOCK
          // contains items of any category, so dead_bug (trunk), planks
          // and every mobility drill in a session were rendering a 92px
          // kilo counter and a 2.5 kg stepper for work that is never
          // loaded. Founder hit it on 2026-08-26. Same rule OffPlanSession
          // has always used.
          isLoadable: ["strength", "unilateral"].includes(exercise.category),
        });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, byId, program, store.logs, store.training_maxes, activeDate]);
}
