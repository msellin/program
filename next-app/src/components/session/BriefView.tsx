"use client";

import { formatMinutes, sessionMinutes } from "@/lib/session-duration";
import { useState } from "react";
import { cardClass } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { RacePlanCard } from "@/components/session/RacePlanCard";
import { programProgress } from "@/lib/program-progress";
import { programDisplayName, humanBlockName, exerciseListName } from "@/lib/day-format";
import { entrySets } from "@/lib/useStore";
import { ProposalCard } from "@/components/workout/ProposalCard";
import { CycleStartCard } from "@/components/session/CycleStartCard";
import { countLoggedSets, requiredRowCount } from "@/lib/set-progress";
import { OffPlanSheet } from "@/components/session/OffPlanSheet";
import type { RailExercise, SessionSheet } from "@/components/session/DaySession";
import type { Block, Phase, Program, Proposal, Store } from "@/lib/schemas";
import { escalationNoticeFor } from "@/lib/engine/escalation";
import { activeExclusions, exclusionNotices, exclusionsAffectingDay } from "@/lib/engine/intake-exclusions";
import { Button } from "@/components/ui/Button";
import { ExerciseFigure } from "@/components/follow-along/ExerciseFigure";
import { prescriptionChips, prescriptionLine } from "@/lib/prescription-line";
import { figureFor } from "@/lib/figures/exercise-figures";

const ZERO = () => 0;

/** Compact block title: drop the subtitle after an em dash. */
const shortBlockTitle = (name: string) => humanBlockName(name).split(/\s+[—–]\s+/)[0].trim();

/**
 * Screen 4a (single track) from the Day redesign. Never scrolls past one
 * screen in the common case — the exercise-row list is what compresses if
 * it would, not the hero. See dev/active/day-redesign-plan.md.
 *
 * 4b (concurrent-track picker) is NOT built here: `/session/[slug]` is
 * inherently single-program (the slug narrows to one), so the track-
 * choice screen has no route to live at until the `/` Today tab itself
 * becomes the Brief — that's explicitly out of scope for this pass (see
 * plan). The interference banner + "N tracks scheduled" case is still
 * carried on `/` today, unchanged.
 */
export function BriefView({
  program,
  phase,
  activeDate,
  blocks,
  railExercises,
  store,
  proposals,
  cycleGateProposal,
  onStart,
  onFinishSession,
  onSelectExercise,
  followBlocks = [],
  onFollowAlong,
  sheet,
  onOpenSheet,
  onCloseSheet,
}: {
  program: Program;
  phase: Phase | null | undefined;
  activeDate: string;
  blocks: Block[];
  railExercises: RailExercise[];
  store: Store;
  proposals: Proposal[];
  cycleGateProposal: Proposal | null;
  onStart: (key?: string) => void;
  /** Ends the session on the Done screen. Offered once something is logged. */
  onFinishSession?: () => void;
  onSelectExercise: (key: string) => void;
  /** Blocks the guided follow-along player can run (all unloaded work). */
  followBlocks?: { id: string; name: string; count: number }[];
  onFollowAlong?: (blockId: string, startKey?: string) => void;
  sheet: SessionSheet;
  onOpenSheet: (s: SessionSheet) => void;
  onCloseSheet: () => void;
}) {
  const [expandedProposalId, setExpandedProposalId] = useState<string | null>(null);
  // Exercises in a follow-along block live INSIDE its card, not again in the
  // session list (founder, 2026-10-20: "1 item that starts the flow and then
  // all 6 items duplicate"). The hero and the Start CTA describe the set-flow
  // work; a day that is all follow-along gets a follow-along Start instead.
  const followIds = new Set(onFollowAlong ? followBlocks.map((b) => b.id) : []);
  const listRail = railExercises.filter((r) => !followIds.has(r.blockId));
  const allFollow = followIds.size > 0 && listRail.length === 0;
  const hero = listRail[0];
  const heroShape: SetShape = hero ? setShape(hero) : { kind: "none" };
  const totalMinutes = formatMinutes(sessionMinutes(blocks));
  // Count REQUIRED exercises (2026-09-03). "5 exercises" when two of them
  // are a taper week's optional backoff overstates the session and makes
  // the day look heavier than it is — the exact thing the taper is for.
  // Optional work is named separately rather than hidden from the count.
  const requiredRail = railExercises.filter((r) => requiredRowCount(r) > 0);
  const optionalCount = railExercises.length - requiredRail.length;
  const optionalSuffix = optionalCount ? ` · +${optionalCount} optional` : "";
  const exWord = requiredRail.length === 1 ? "exercise" : "exercises";
  // "0 exercises · about 40 min" for a threshold row is a count of the
  // wrong thing. When a session prescribes in prose rather than sets, the
  // duration IS the summary.
  const summary =
    railExercises.length === 0 && totalMinutes
      ? totalMinutes.charAt(0).toUpperCase() + totalMinutes.slice(1)
      : totalMinutes
        ? `${requiredRail.length} ${exWord} · ${totalMinutes}${optionalSuffix}`
        : `${requiredRail.length} ${exWord}${optionalSuffix}`;

  // P-06: week N of M comes from the same whole-program selector as Today and Plan.
  const prog = program.phases?.length ? programProgress(program, activeDate, store.user_profile) : null;
  const escalation = escalationNoticeFor(program, store, activeDate);

  const gateUnresolved = !!cycleGateProposal;

  // README: the Start CTA reads "Continue — Bench press, set 4" once
  // progress exists, never re-announcing "Start" for a session already
  // under way. Mirrors DaySession's own resume-to-first-unfinished-set
  // logic so the label always matches where tapping it actually lands.
  const heroLoggedCount = hero
    ? countLoggedSets(
        entrySets(store.logs[activeDate]?.exercises[hero.key] ?? null),
        hero.isLoadable,
      )
    : 0;
  // Guided days (2026-10-28). A day that is all follow-along has no `hero`,
  // so heroLoggedCount stayed 0: Start re-opened block 1 after it was done and
  // "Finish session" never appeared — a finished guided session had no way to
  // end. Track progress per follow-along block instead.
  const loggedFor = (r: (typeof railExercises)[number]) =>
    countLoggedSets(entrySets(store.logs[activeDate]?.exercises[r.key] ?? null), r.isLoadable);
  const anyLogged = railExercises.some((r) => loggedFor(r) > 0);
  const nextFollow = followBlocks.find((b) =>
    railExercises.some((r) => r.blockId === b.id && requiredRowCount(r) > 0 && loggedFor(r) < requiredRowCount(r)),
  );
  const guidedAllDone = allFollow && anyLogged && !nextFollow;
  // Prescription-only sessions (2026-08-26).
  //
  // Rowing's six blocks author ZERO items — they are described by a `note`
  // and `duration_min`, not by a list of exercises. The Brief only knew how
  // to render a session as exercise rows, so a rowing user saw "0 exercises
  // · about 40 min", an empty "The whole session", and a Start button that
  // started nothing. The prescription was in the data the whole time:
  // block_threshold_row's note is "4×8 min @ ~5-10 sec/500m over 2K pace,
  // 2 min rest. HR 82-88%".
  //
  // Same shape for any block that prescribes work in prose rather than
  // sets — this is not rowing-specific.
  // Any block the set flow cannot represent: run-category work (logged as
  // an activity) or a block that authors no items at all. Both are
  // described in prose, and both were previously invisible.
  const prescriptionBlocks = blocks.filter(
    (b) =>
      ((b.category ?? "strength") === "run" || (b.items?.length ?? 0) === 0) &&
      (b.note ?? "").trim().length > 0,
  );
  // "Log this session" replaces Start only when there is nothing to step
  // through. A mixed day — strength blocks plus a run — keeps Start and
  // shows the run's prescription alongside the exercise rows.
  const isPrescriptionSession = prescriptionBlocks.length > 0 && railExercises.length === 0;
  // Blocks that carry guidance AND exercises — the prescription-only ones
  // already render their note as the session itself, so exclude them here
  // to avoid printing the same text twice.
  const guidanceBlocks = blocks
    .filter((b) => !prescriptionBlocks.includes(b))
    .map((b) => ({ ...b, note: plainNote(b.note) }))
    .filter((b) => b.note.length > 0);

  const startLabel = isPrescriptionSession
    ? "Log this session"
    : allFollow
    ? anyLogged ? "Continue session" : "Start session"
    : !hero
    ? "Start"
    : heroLoggedCount > 0
      ? `Continue — set ${Math.min(heroLoggedCount + 1, hero.rowCount)}`
      : "Start session";

  return (
    <div className="flex flex-col min-h-[calc(100dvh-64px-env(safe-area-inset-bottom))]">
      <div className="flex-1 space-y-5 pb-28 [@media(max-height:700px)]:pb-32">
        {/* Program name as the eyebrow above the day (same order as Today):
            beside a 32px day name it ran off the edge at 375. */}
        <header className="space-y-1">
          {program.slug ? (
            <p className="text-eyebrow uppercase text-bronze">
              {programDisplayName(program, program.slug)}
            </p>
          ) : null}
          <h1 className="text-h1 tracking-[-0.035em] text-strong leading-none">
            {dayName(activeDate)}
          </h1>
        </header>
        {/* One plain line (2026-10-28). The phase name ("Cycles 3 + 4 (with
            1RM test)") was programme-author jargon on the day card; the week
            is what a person tracks. */}
        <p className="-mt-3 text-small text-muted">
          {summary}
          {prog ? ` · week ${prog.weekN} of ${prog.totalWeeks}` : ""}
        </p>
        {/* Why these numbers — Terav's core: every load names its basis.
            This line was the bottom of the deleted top-set card, under the
            sticky bar where nobody saw it. */}
        {hero && basisLine(hero, store) ? (
          <a
            href="/plan/"
            className="-mt-1 flex min-h-[48px] items-center justify-between gap-3 rounded-2xl border border-line-soft bg-surface px-3.5 py-2 text-small text-ink"
          >
            <span>
              <span className="block text-caption text-muted">Why these weights</span>
              {heroShape.kind === "top_set" ? "Top set at " : "Working sets at "}
              {basisLine(hero, store)}
            </span>
            <span className="flex-shrink-0 text-muted" aria-hidden="true">›</span>
          </a>
        ) : null}

        {cycleGateProposal ? (
          <CycleStartCard proposal={cycleGateProposal} date={activeDate} />
        ) : null}

        {proposals.length ? (
          <div className="space-y-2">
            {proposals.map((p) =>
              expandedProposalId === p.id ? (
                <ProposalCard key={p.id} proposal={p} date={activeDate} />
              ) : (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setExpandedProposalId(p.id)}
                  className={toneClasses(p.kind) + " w-full text-left rounded-lg border px-3 py-2 text-small"}
                >
                  {p.reason}
                </button>
              ),
            )}
          </div>
        ) : null}

        {onFollowAlong && followBlocks.length > 0 ? (
          <div className="space-y-2">
            {followBlocks.map((b) => {
              const moves = railExercises.filter((r) => r.blockId === b.id);
              return (
                <div key={b.id} className={cardClass({ flush: true }) + " overflow-hidden"}>
                  <button
                    type="button"
                    onClick={() => onFollowAlong(b.id)}
                    className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-bronze" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#0e0f12"><polygon points="8 5 19 12 8 19 8 5" /></svg>
                    </span>
                    <span className="min-w-0 flex-grow">
                      <span className="block truncate text-body font-semibold text-strong">
                        <span className="sr-only">Follow along · </span>
                        {shortBlockTitle(b.name)}
                      </span>
                      <span className="block text-caption text-muted">
                        {b.count} {b.count === 1 ? "move" : "moves"} · with a timer
                      </span>
                    </span>
                  </button>
                  <ul className="border-t border-line-soft">
                    {moves.map((r) => {
                      const logged = countLoggedSets(entrySets(store.logs[activeDate]?.exercises[r.key] ?? null), r.isLoadable);
                      const isOptional = requiredRowCount(r) === 0;
                      return (
                        <li key={r.key}>
                          <button
                            type="button"
                            onClick={() => onFollowAlong(b.id, r.key)}
                            aria-label={`Follow along from ${exerciseListName(r.exercise)}`}
                            className="flex w-full items-center gap-3 px-3.5 py-2 text-left"
                          >
                            {figureFor(r.exercise.id) ? (
                              <span className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-md bg-ground" aria-hidden="true">
                                <ExerciseFigure figure={figureFor(r.exercise.id)!} side="B" playing={false} getElapsed={ZERO} />
                              </span>
                            ) : null}
                            <span className="min-w-0 flex-grow">
                              <span className="block truncate text-small text-strong">{exerciseListName(r.exercise)}</span>
                              <span className="block text-caption text-muted">{railScheme(r)}</span>
                            </span>
                            <span className="flex-shrink-0 text-caption uppercase tracking-[.1em] text-muted">
                              {logged >= r.rowCount ? "Done" : logged > 0 ? "Held" : isOptional ? "Optional" : ""}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : null}
        {/* Test-day pacing. Rendered above "how to run this" because on the
            day the user opens this screen to find four numbers, not prose.
            The card returns null unless the session actually contains the 2K
            test AND the user has a baseline to compute against. */}
        {blocks.some((b) => b.id === "block_open_2k") ? (
          <div className="mb-4">
            <RacePlanCard program={program} store={store} />
          </div>
        ) : null}
        {/* Intake deferrals sit outside the session list, which a guided-only
            day hides: the reason for a swap must show on every day it applies. */}
        <div className="space-y-[7px] empty:hidden">
          {exclusionNotices(
            exclusionsAffectingDay(
              program,
              blocks.map((b) => b.id),
              activeExclusions(program, store.user_profile),
            ),
          ).map((note) => (
            <div
              key={note}
              className={cardClass()}
            >
              <p className="text-caption uppercase tracking-widest text-slate mb-1">
                Adjusted for you
              </p>
              <p className="text-small leading-snug text-ink">{note}</p>
            </div>
          ))}
        </div>
        <div className={allFollow && prescriptionBlocks.length === 0 && !escalation ? "hidden" : undefined}>
          <p className="text-small font-semibold text-ink mb-2">
            {isPrescriptionSession ? "Today's session" : allFollow ? "Also today" : "The whole session"}
          </p>
          <div className="space-y-[7px]">
            {prescriptionBlocks.map((b) => (
              <div
                key={b.id}
                className={cardClass()}
              >
                <p className="text-body font-semibold text-strong tracking-[-.01em] mb-0.5">
                  {humanBlockName(b.name)}
                </p>
                {b.duration_min ? (
                  <p className="text-caption uppercase tracking-[.14em] text-muted mb-1">
                    {Array.isArray(b.duration_min)
                      ? `${b.duration_min[0]}–${b.duration_min[1]} min`
                      : `${b.duration_min} min`}
                  </p>
                ) : null}
                <p className="text-small leading-snug text-ink">{b.note}</p>
              </div>
            ))}
            {/* Movements deferred because of an intake answer.
                The intake told the user this would happen ("we defer ring dip
                work and use band-assisted dip only"), so the session has to
                show it happening. A substitution the user cannot account for
                reads as the plan being wrong rather than the plan listening,
                and confirm-first only means anything if the user can see why
                the plan looks the way it does. (2026-09-02) */}
            {/* The programme's own escalation rule, shown at the moment it
                applies rather than only inside a collapsed accordion on
                /plan. Verbatim — the app does not paraphrase a stop-rule.
                Not enforced: the engine proposes, the user decides, same as
                every other adaptive change here. See lib/engine/escalation.ts
                for why executing these six prose rules would be worse than
                surfacing them. (2026-09-07) */}
            {escalation ? (
              <div className={cardClass({ status: "amber" })}>
                <p className="text-caption uppercase tracking-widest text-amber mb-1">
                  {escalation.streak} red days in a row — your programme&rsquo;s rule
                </p>
                <p className="text-small leading-snug text-ink">{escalation.text}</p>
              </div>
            ) : null}
            {listRail.map((r) => {
              const entry = store.logs[activeDate]?.exercises[r.key] ?? null;
              const loggedCount = countLoggedSets(entrySets(entry), r.isLoadable);
              // Not `entry?.done` — the store flips that flag true on the
              // FIRST logged set of any exercise (existing behaviour used
              // elsewhere for a manual "mark done" checkbox), which would
              // tag a 1-of-5 exercise "Done" here. "All rows logged" is
              // the honest signal for this row's tag.
              const isDone = loggedCount >= r.rowCount;
              const isMain = r === hero;
              // A fully-optional exercise is offered, not owed. Dashed
              // border and a tag instead of removal, so a good day can
              // still opt in — see dev/active/optional-items/plan.md.
              const isOptional = requiredRowCount(r) === 0;
              const hasOptionalTail = !isOptional && (r.optionalRows ?? 0) > 0;
              const chips = isMain ? prescriptionChips(r) : [];
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => onSelectExercise(r.key)}
                  className={
                    "w-full rounded-2xl bg-surface px-3.5 py-3 text-left " +
                    (isOptional ? "border border-dashed border-line-soft" : "border border-line-soft") +
                    (isMain && !isDone ? " border-bronze" : "")
                  }
                >
                  <span className="flex items-center gap-3">
                    {figureFor(r.exercise.id) ? (
                      <span className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-ground" aria-hidden="true">
                        <ExerciseFigure figure={figureFor(r.exercise.id)!} side="B" playing={false} getElapsed={ZERO} />
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-grow">
                      <span className="block text-body font-semibold text-strong tracking-[-.01em]">
                        {exerciseListName(r.exercise)}
                      </span>
                      <span className="block text-small text-muted tabular-nums">
                        {prescriptionLine(r, store, activeDate)}
                        {hasOptionalTail ? ` · last ${r.optionalRows} optional` : ""}
                      </span>
                    </span>
                    {isDone || loggedCount > 0 || isOptional ? (
                      <span className="ml-auto flex-shrink-0 text-caption text-muted">
                        {isDone ? "Done" : loggedCount > 0 ? `${loggedCount}/${r.rowCount}` : "Optional"}
                      </span>
                    ) : null}
                  </span>
                  {chips.length ? (
                    <span className="mt-2.5 -mr-3.5 flex gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap pr-3.5">
                      {chips.map((c, i) => (
                        <span key={i} className="flex-shrink-0 rounded-full border border-line-soft px-2.5 py-1 text-caption font-medium tabular-nums text-ink">
                          {c}
                        </span>
                      ))}
                    </span>
                  ) : null}
                  {/* A7 (2026-08-26): notes were WRITE-ONLY — an invisible note
                      is a lost engine input (note-signals.ts), not just prose. */}
                  {entry?.notes?.trim() ? (
                    <span className="block text-caption italic text-slate mt-1.5 line-clamp-2">
                      “{entry.notes.trim()}”
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
        {/* One quiet list for the two secondary links (round 6). */}
        <div className="rounded-2xl border border-line-soft divide-y divide-line-soft px-3.5">
        {guidanceBlocks.length > 0 ? (
          <details className="group">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between text-small text-muted [&::-webkit-details-marker]:hidden">
              <span>How to run this</span>
              <span className="transition-transform group-open:rotate-90 motion-reduce:transition-none" aria-hidden="true">›</span>
            </summary>
            <div className="space-y-2 pb-3">
              {guidanceBlocks.map((b) => (
                <p key={b.id} className="text-small leading-relaxed text-ink whitespace-pre-line">
                  {b.note}
                </p>
              ))}
            </div>
          </details>
        ) : null}
        <button
          type="button"
          onClick={() => onOpenSheet("off-plan")}
          className="flex min-h-[44px] w-full items-center justify-between gap-2.5 text-left"
        >
          <span className="text-small text-muted">Log an extra session</span>
          <span className="flex-shrink-0 text-small text-muted" aria-hidden="true">›</span>
        </button>
        </div>
      </div>

      <div className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] z-10 flex-shrink-0 border-t border-line-soft bg-ground pt-2 pb-2 mt-4">
        {/* Fade, so a card scrolling under the bar dissolves instead of being cut. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-ground to-transparent" />
        {gateUnresolved ? (
          <p className="mb-1.5 text-caption text-muted">Accept the numbers to start</p>
        ) : null}
        <div className="flex gap-2">
          {(heroLoggedCount > 0 || (allFollow && anyLogged)) && onFinishSession && !guidedAllDone ? (
            <Button variant="secondary" onClick={onFinishSession} className="flex-shrink-0">
              Finish session
            </Button>
          ) : null}
          {guidedAllDone && onFinishSession ? (
            <Button type="button" onClick={onFinishSession} block>
              Finish session
            </Button>
          ) : null}
          {guidedAllDone ? null : (
          <Button
            type="button"
            disabled={gateUnresolved}
            onClick={() => {
              // A prescription-only session has no sets to step through —
              // the row IS the session, recorded as an activity (the retest
              // metric reads `runs[]`). Starting the set flow opened an empty shell.
              if (isPrescriptionSession) onOpenSheet("off-plan");
              else if (allFollow) onFollowAlong?.((nextFollow ?? followBlocks[0]).id);
              else onStart();
            }}
            block
            className="min-w-0 flex-1"
          >
            {!isPrescriptionSession && !allFollow && heroLoggedCount === 0 ? (
              <span aria-hidden="true" className="mr-2 text-caption">▶</span>
            ) : null}
            <span className="truncate">{startLabel}</span>
          </Button>
          )}
        </div>
      </div>

      {sheet === "off-plan" ? (
        <OffPlanSheet program={program} date={activeDate} onClose={onCloseSheet} />
      ) : null}
    </div>
  );
}

function toneClasses(kind: Proposal["kind"]): string {
  if (kind === "day_adjustment_soften") return "border-amber/40 bg-amber/10 text-amber-strong";
  if (kind === "tier_advance" || kind === "readiness_after_layoff") return "border-slate/40 bg-slate/10 text-slate";
  return "border-line-soft bg-surface text-ink";
}

/**
 * The rail's one-line scheme summary. BUG-29 (founder, 2026-08-30): this read
 * "6 sets · 93.5 kg" on a 5/3/1 day, where only set 1 is at the top weight and
 * sets 2-6 are FSL at 65-75% TM. It overstated the working load on the one
 * screen a user scans before loading a bar, and the real FSL weight was
 * discoverable only by stepping into set 2.
 *
 * `rowCount` is `fsl.sets + 1` whenever FSL exists (see `useMemoRail` in
 * DaySession), so the split below always totals the same number of sets the
 * old label claimed — it just stops attributing the top weight to all of them.
 */
export function railScheme(r: RailExercise): string {
  const shape = setShape(r);
  if (!r.suggestion || shape.kind === "none") return `${r.rowCount} sets`;
  if (shape.kind === "straight") return `${shape.sets} × ${shape.kg} kg`;
  if (shape.kind === "ladder") return `${shape.kgs.length} sets · ${shape.kgs.join(" / ")} kg`;
  const { top_set, fsl } = r.suggestion;
  // With ramp sets every row before the back-offs differs, so each is
  // spelled weight × reps: "85 × 3 · 97.5 × 3 · 110 × 3+ · 5 × 85 kg".
  if (shape.ramp.length) {
    const sets = [...shape.ramp, top_set].map((w) => `${w.kg} × ${w.reps}`);
    return [...sets, ...(fsl ? [`${fsl.sets} × ${fsl.kg} kg`] : [])].join(" · ");
  }
  if (fsl) return `1 × ${top_set.kg} kg · ${fsl.sets} × ${fsl.kg} kg`;
  return `${r.rowCount} sets · ${top_set.kg} kg`;
}

/**
 * Does today have a top set at all? (BUG-38, founder 2026-10-01)
 *
 * A suggestion carries `top_set` + `fsl` for three different days, and the
 * Brief rendered all three as 5/3/1:
 *   - top set + back-offs (5/3/1)  → one heavy set, then lighter ones;
 *   - straight sets (variant/volume) → every set at one weight, no top set;
 *   - a ladder (`working_sets`, the deload) → ascending sets, no top set.
 * The Thursday front squat, 5 × 75 kg, read "TODAY'S TOP SET 75 × 5" above a
 * rail line "1 × 75 kg · 5 × 75 kg" — six sets and a top set, on a day with
 * five sets and none. The founder could not tell what was prescribed.
 */
export type SetShape =
  | {
      kind: "top_set";
      kg: number;
      reps: string;
      /** The 5/3/1 working sets before the top set, lightest first. */
      ramp: { kg: number; reps: string }[];
      backoff: { sets: number; kg: number } | null;
    }
  | { kind: "straight"; sets: number; kg: number; reps: string }
  | { kind: "ladder"; kgs: number[]; reps: string }
  | { kind: "none" };

export function setShape(r: RailExercise): SetShape {
  const sug = r.suggestion;
  if (!sug) return { kind: "none" };
  if (sug.working_sets?.length) {
    return { kind: "ladder", kgs: sug.working_sets.map((w) => w.kg), reps: sug.working_sets[0].reps };
  }
  if (sug.fsl && sug.straight_sets) {
    return { kind: "straight", sets: sug.fsl.sets, kg: sug.fsl.kg, reps: String(sug.fsl.reps) };
  }
  return {
    kind: "top_set",
    kg: sug.top_set.kg,
    reps: sug.top_set.reps,
    ramp: sug.ramp_sets ?? [],
    backoff: sug.fsl ? { sets: sug.fsl.sets, kg: sug.fsl.kg } : null,
  };
}

function basisLine(r: RailExercise, store: Store): string | null {
  const tm = store.training_maxes[r.exercise.id];
  if (!tm || !r.suggestion) return null;
  const ladder = r.suggestion.working_sets;
  if (ladder?.length) {
    const lo = Math.round((ladder[0].kg / tm) * 100);
    const hi = Math.round((ladder[ladder.length - 1].kg / tm) * 100);
    return `${lo}\u2013${hi}% of your ${tm} kg training max`;
  }
  const pct = Math.round((r.suggestion.top_set.kg / tm) * 100);
  if (!Number.isFinite(pct) || pct <= 0) return null;
  return `${pct}% of your ${tm} kg training max`;
}

function dayName(dateISO: string): string {
  const d = new Date(dateISO + "T12:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "long" });
}

/**
 * A block note as a beginner should read it. Authors tag notes with their own
 * provenance ("Coaching heuristic (Tsatsouline) — flagged as engineering
 * choice…", "Consistent with Karni 1998…"); that belongs on /evidence, not in
 * the first brief someone sees (V-06). Drops those sentences and parentheticals,
 * keeps the instruction.
 */
export function plainNote(note: string | undefined): string {
  const stripped = (note ?? "").replace(/\s*\([^()]*engineering choice[^()]*\)/gi, "");
  return stripped
    .split(/(?<=[.!?])\s+/)
    .filter((s) => !/^coaching heuristic/i.test(s) && !/\b[A-Z][a-z]+(?: et al\.?)? (?:19|20)\d{2}\b/.test(s))
    .join(" ")
    .trim();
}
