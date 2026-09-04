"use client";

import { useEffect, useMemo, useState } from "react";
import { loadProgram, loadExercises, applyProgramExerciseOverrides } from "@/lib/data-loader";
import { useStore, entrySets } from "@/lib/useStore";
import { today as todayISO } from "@/lib/utils";
import { suggestForExercise } from "@/lib/engine/suggest";
import { composeBlockForUser } from "@/lib/engine/plan-generator";
import { dedupeItems, humanBlockName } from "@/lib/day-format";
import { DateNav } from "@/components/workout/DateNav";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { isOffPlanOn } from "@/lib/features";
import { SetView } from "@/components/session/SetView";
import { useSessionCursor, reconcileCursor } from "@/lib/session-cursor";
import { RestTakeover } from "@/components/session/RestTakeover";
import { nextAfterSet } from "@/components/session/shared/advance";
import { NoteSheet } from "@/components/session/NoteSheet";
import type { RailExercise, SessionSheet } from "@/components/session/DaySession";
import type { Exercise, Program } from "@/lib/schemas";

/**
 * Off-plan redesign (2026-08-24) — brings /off-plan onto the same
 * Brief/Set/Rest pattern as /session/[slug], rather than the pre-
 * redesign ExerciseCard/SetRow/RestTimer stack it used to run.
 * Consistency-sweep finding: this was the one screen left behind.
 *
 * Sibling to DaySession.tsx, not a modification of it — off-plan blocks
 * aren't schedule-gated (no blocksForDate/activePhaseFor; blocks are
 * filtered straight from program.blocks by category) and there's no
 * single "top set" hero, so the browsing state here is a grouped list
 * rather than Brief's hero-card layout. Once an exercise is tapped,
 * everything downstream (SetView/RestTakeover/OverflowSheet/NoteSheet)
 * is the exact same, already-tested components Day uses. See
 * dev/active/offplan-redesign-plan.md.
 */
export function OffPlanSession() {
  const [program, setProgram] = useState<Program | null>(null);
  const [byId, setById] = useState<Record<string, Exercise>>({});
  const [activeDate, setActiveDate] = useState(() => todayISO());
  const hydrated = useStore((s) => s.hydrated);
  const store = useStore((s) => s.store);
  const offPlanOn = useStore((s) => isOffPlanOn(s.store));
  const userProfile = store.user_profile;
  const primarySlug = store.user_profile?.active_program_id;

  useEffect(() => {
    if (!primarySlug) {
      void loadExercises().then((x) => setById(x.byId));
      return;
    }
    void Promise.all([loadProgram(primarySlug), loadExercises()]).then(([p, x]) => {
      setProgram(p);
      setById(applyProgramExerciseOverrides(x.byId, p));
    });
  }, [primarySlug]);

  const [mode, setMode] = useState<"brief" | "set">("brief");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [editingLoad, setEditingLoad] = useState(false);
  const [sheet, setSheet] = useState<SessionSheet>(null);
  const [resting, setResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(90);
  const [effortAnswered, setEffortAnswered] = useState(false);

  // Same category → group labels the pre-redesign page used. Run-category
  // copy depends on the primary program (hip-rebuild users read these as
  // around-run accessory work; aerobic-program users read them as the
  // actual cardio sessions).
  const groupDefs = useMemo(() => {
    const runTitle = primarySlug === "anterior-hip-rebuild" ? "Around runs" : "Cardio & conditioning";
    const runNote =
      primarySlug === "anterior-hip-rebuild"
        ? "Attach these to your run sessions. Log to today."
        : "Aerobic + conditioning blocks from your program.";
    return [
      { cat: "accessory" as const, title: "Accessories & home rehab", note: "Do these when you can — no calendar constraint." },
      { cat: "run" as const, title: runTitle, note: runNote },
      // Barbell work done somewhere else — a class, another gym, a friend's
      // garage. This group did not exist until 2026-09-03, so off-plan
      // offered accessories and cardio and NO lifts: there was literally no
      // way to record a front squat you did outside your own session.
      //
      // The founder front-squatted to a 115 single in a CrossFit class on a
      // Tuesday. Nothing about it reached the app, so his front-squat
      // training max stayed wrong, the engine prescribed front squats two
      // days later knowing nothing about it, and the number that would have
      // fixed it only surfaced because he mentioned it in conversation.
      // "Runs alongside your existing week" is the product's own claim; the
      // existing week is mostly barbell work in a class.
      {
        cat: "strength" as const,
        title: "Lifts you did elsewhere",
        note: "Class, another gym, a session that wasn't on the plan. Log the weights — the engine reads them for your training maxes.",
      },
    ];
  }, [primarySlug]);

  // Rail: flattened across both groups, so mid-set rail-tap and Rest's
  // "next up" work the same way Day's cross-block rail already does.
  // Not schedule-gated — off-plan blocks are always available, filtered
  // straight from program.blocks by category rather than via
  // blocksForDate/activePhaseFor.
  const railExercises: RailExercise[] = useMemo(() => {
    if (!program) return [];
    const out: RailExercise[] = [];
    for (const def of groupDefs) {
      const blocks = program.blocks
        .filter((b) => (b.category ?? "strength") === def.cat)
        // Slot-based programs author no items — their drills are composed
        // per user from `drill_library`. Without this the off-plan rail read
        // "0 drills available" for overhead-mobility. See composeBlockForUser.
        .map((b) => composeBlockForUser(program, b, userProfile, activeDate, byId, { onlyIfEmpty: true }));
      for (const block of blocks) {
        const items = dedupeItems(block.items ?? (block.segments ?? []).flatMap((s) => s.items));
        for (const item of items) {
          if (!item.exercise_id) continue;
          const exercise = byId[item.exercise_id];
          if (!exercise) continue;
          const suggestion = suggestForExercise(exercise.id, block.id, program, store, activeDate);
          const isLoadable = ["strength", "unilateral"].includes(exercise.category);
          const defaultSets =
            (typeof item.sets === "number" ? item.sets : undefined) ??
            (typeof exercise.default?.sets === "number" ? (exercise.default.sets as number) : undefined) ??
            3;
          out.push({
            key: `${block.id}:${exercise.id}`,
            blockId: block.id,
            blockName: humanBlockName(block.name),
            exercise,
            item,
            rowCount: suggestion?.fsl ? suggestion.fsl.sets + 1 : defaultSets,
            suggestion,
            isLoadable,
          });
        }
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, byId, groupDefs, userProfile, store.logs, store.training_maxes, activeDate]);

  /**
   * Same cursor restore as DaySession — see `lib/session-cursor.ts`. Off-plan
   * needs it at least as much: its rail can run to 34 items, so "first
   * unfinished in rail order" after a cold load is more likely to be
   * somewhere you have never been than the drill you were actually on.
   *
   * Scoped separately from the day cursor, so backgrounding out of off-plan
   * cannot drop you into a programme session or the reverse.
   */
  useSessionCursor(
    "offplan",
    activeDate,
    { mode, activeKey, activeSetIndex },
    (c) => {
      const next = reconcileCursor(c, (k) => railExercises.some((r) => r.key === k));
      setActiveKey(next.activeKey);
      setActiveSetIndex(next.activeSetIndex);
      setMode(next.mode);
    },
    Boolean(program) && hydrated && railExercises.length > 0,
  );

  if (!hydrated) return <div className="mt-8 text-sm text-muted">Loading…</div>;
  // Off-plan ships dark for the public catalog (2026-08-24). The route
  // stays alive rather than 404ing — a bookmark or an installed-PWA
  // shortcut should explain itself, not break. Nothing is lost: every
  // accessory and mobility block in every program is already scheduled
  // onto a specific day, which is where they now live exclusively.
  if (!offPlanOn) {
    return (
      <EmptyStateCard
        title="Accessory work lives in your sessions now."
        body="Mobility drills, activation and around-run work are scheduled into the days your plan puts them on, so there's no separate list to keep up with. To log a run, a row or a class, use “Log a run, row, or class” at the bottom of any session."
        cta={{ href: "/", label: "Back to Day" }}
      />
    );
  }
  if (!primarySlug) {
    return (
      <EmptyStateCard
        title="Accessory work lives here — once you have a focus."
        body="Accessory work, mobility drills, and around-session blocks show up here once you pick a program. Optional — the plan's core sessions live on Today."
        cta={{ href: "/programs/", label: "Browse programs" }}
      />
    );
  }
  if (!program) return <div className="mt-8 text-sm text-muted">Loading…</div>;

  const activeIdx = activeKey ? railExercises.findIndex((r) => r.key === activeKey) : -1;
  const active = activeIdx >= 0 ? railExercises[activeIdx] : null;

  // Mirrors DaySession's helper — the set to LAND on when entering an
  // exercise: the first unfinished one, or the last if every row is
  // logged. Backwards movement is the set pips' job, not this.
  const firstUnfinishedSetIndex = (key: string): number => {
    const r = railExercises.find((re) => re.key === key);
    if (!r) return 0;
    const entry = store.logs[activeDate]?.exercises[r.key] ?? null;
    const logged = entrySets(entry).filter((s) => s.reps != null).length;
    return Math.min(logged, r.rowCount - 1);
  };

  const jumpTo = (key: string) => {
    setActiveKey(key);
    setActiveSetIndex(firstUnfinishedSetIndex(key));
    setEditingLoad(false);
    setResting(false);
    setSheet(null);
    setMode("set");
  };

  const upNext = nextAfterSet(
    railExercises,
    activeIdx,
    active
      ? entrySets(store.logs[activeDate]?.exercises[active.key] ?? null).filter(
          (s) => s.reps != null,
        ).length
      : 0,
  );

  if (mode === "set" && active) {
    return (
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
              // Same `upNext` the rest screen just showed.
              if (upNext.kind === "set") {
                setActiveSetIndex(upNext.setIndex);
              } else if (upNext.kind === "exercise") {
                setActiveKey(upNext.rail.key);
                setActiveSetIndex(0);
              } else {
                setMode("brief");
              }
            }}
            onJump={jumpTo}
            onOpenNoteSheet={() => setSheet("note")}
          />
        ) : null}
        {sheet === "note" ? (
          <NoteSheet
            active={active}
            date={activeDate}
            isSkillProgram={primarySlug === "handstand-walk"}
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

  return (
    <div className="space-y-6 pt-4">
      <header>
        <h1 className="text-[32px] font-semibold tracking-tight text-strong leading-none">Off-plan</h1>
        <p className="mt-1 text-sm text-muted">
          Accessory work, home rehab, around-runs.{" "}
          {activeDate === todayISO() ? "Logging to today." : "Logging to the selected date."}
        </p>
      </header>

      <DateNav date={activeDate} onChange={setActiveDate} />

      {(() => {
        const rendered = groupDefs
          .map((def) => {
            const rows = railExercises.filter((r) => {
              const block = program.blocks.find((b) => b.id === r.blockId);
              return (block?.category ?? "strength") === def.cat;
            });
            if (!rows.length) return null;
            return (
              <section key={def.cat} className="space-y-3">
                <header>
                  <h2 className="font-mono text-[14px] uppercase tracking-widest">{def.title}</h2>
                  <p className="mt-1 text-[14px] text-muted">{def.note}</p>
                </header>
                <div className="space-y-[7px]">
                  {rows.map((r) => {
                    const entry = store.logs[activeDate]?.exercises[r.key] ?? null;
                    const loggedCount = entrySets(entry).filter((s) => s.reps != null).length;
                    const isDone = loggedCount >= r.rowCount;
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => jumpTo(r.key)}
                        className="w-full flex items-center justify-between gap-3 rounded border border-line-soft bg-surface px-3.5 py-[13px] text-left"
                      >
                        <span className="min-w-0">
                          <span className="block text-[15px] font-semibold text-strong tracking-[-.01em] mb-0.5">
                            {r.exercise.name}
                          </span>
                          <span className="block text-[13px] text-ink">{r.blockName} · {r.rowCount} sets</span>
                        </span>
                        <span
                          className={
                            "flex-shrink-0 font-mono text-[10px] uppercase tracking-[.1em] " +
                            (isDone ? "text-muted" : loggedCount > 0 ? "text-bronze" : "text-muted")
                          }
                        >
                          {isDone ? "Done" : loggedCount > 0 ? "Held" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })
          .filter(Boolean);
        if (rendered.length === 0) {
          return (
            <div className="rounded border border-line-soft bg-surface p-4 text-sm text-muted">
              This program has no extras — every prescribed session lives on Day. You can still log
              cross-modal work (cardio, class attendance, walks) from Day&apos;s off-plan sheet if you
              want it in your history.
            </div>
          );
        }
        return rendered;
      })()}
    </div>
  );
}
