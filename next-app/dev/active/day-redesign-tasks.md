# Day redesign — task checklist

Status markers: `[ ]` open · `[~]` in progress · `[x]` done · `[!]` blocked

## 0. Setup
- [x] Read design spec (README + t4/t5/t6 mockups) from Claude Design project
- [x] Explore existing codebase (TodaySession, ExerciseCard, SetRow,
      RestTimer/Host, useTimer, plates, pr, useStore, proposals, sheets,
      AppShell, globals.css, plan page)
- [x] Write plan, get user approval
- [x] Write dev docs (plan/context/tasks)

## 1. Four quick wins
- [x] No strikethrough on completed exercise names — new rows never had it
- [x] No raw enum keys rendered — new rows always display exercise.name /
      humanized labels, never internal keys
- [x] Accent surface audit: globals.css already matches the README's
      token table — no globals.css edit needed. Enforced via "one bronze
      per screen" discipline in the new components (bronze reserved for
      Start / Done / Save; teal=slate for rest/info; green=PR only).
- [x] Body-copy contrast: new components use `text-ink` for
      meaning-carrying copy, `text-muted`/`text-line` for labels only

## 2. Architecture split
- [x] Extracted `src/lib/day-format.ts` (programDisplayName,
      humanPhaseName, humanBlockName, phaseProgress, phaseWeekPair,
      dedupeItems, restSecondsFor)
- [x] Extracted `src/components/session/shared/StatusCards.tsx`
      (RestDayCard, RetestReminder, GraduationCard, GraduationFeedback,
      VerbRow)
- [x] Trimmed `TodaySession.tsx`: removed `slugOverride` prop, all
      slugOverride-gated branches, the dead inline-workout render branch
      (BlockSection/PerProgramActions/SessionActions/DayHeaderShortcut/
      RowingPersonalisedTargets/LogSessionShortcut). 1727 → 684 lines.
- [x] Created `src/components/session/DaySession.tsx` — shell owner
      (mode, activeKey, activeSetIndex, editingLoad, sheet, resting,
      effortAnswered; railExercises computed via useMemo)
- [x] Pointed `SessionClient.tsx` at `DaySession` instead of
      `TodaySession`
- [x] Verified `/` dashboard mode unaffected — code path unchanged,
      only dead branches removed

## 3. Brief (4a)
- [x] `BriefView.tsx` — H1+eyebrow, summary, hero card, exercise rows
      (Main/Held/Done tags), footer (off-plan line, progress eyebrow,
      Start)
- [x] Exercise-row tap → jumps straight into that exercise (Set mode)
- [x] `ProposalBanner` (inline in BriefView) — compact collapsed
      proposal rows, tap → expands to full `ProposalCard` (verified live:
      a `day_adjustment_soften` proposal rendered and expanded correctly)
- [x] `CycleStartCard.tsx` (6c) — tm_bump-pending + zero-sets-today gate;
      disables Start until Accept/Adjust; Adjust opens per-lift steppers
      (code-reviewed; NOT manually verified live — the test account never
      accumulated the green-streak history `evaluateOverperformer`
      requires to fire a tm_bump proposal. Logic verified by inspection:
      onAccept-then-apply-override ordering fixed after finding the
      original ordering would have clobbered adjusted values.)
- [!] 4b (concurrent-track picker) — determined out of scope during
      planning: `/session/[slug]` is inherently single-program, so 4b's
      screen has no route to live at until `/` itself becomes the Brief
      (explicitly out of scope this pass). Interference banner + N-tracks
      case stays on `/` unchanged.
- [ ] Readiness one-liner — explicitly not built (confirmed decision,
      see context.md); `/check` remains the sole readiness surface

## 4. Set (4a work state / 6b)
- [x] `SetView.tsx` — rail (per-exercise flex/count), centre stage (big
      weight/reps, Last time / Prescribed reference pair, plate line) —
      verified live end-to-end
- [x] Confirm button (Done — N kg) → `updateSet`, starts rest — verified
      live
- [x] Change-the-weight stepper panel — verified live (+/- both fields,
      live-updating Done label and PR badge)
- [x] AMRAP / counting-state rep-choice grid — built, NOT manually
      verified live (needs a prescribed rep string ending "+", which
      needs a training max the test account never set)
- [x] PR badge via `isSetPR`, awarded on confirm only — verified live
      ("REP PR" badge appeared correctly on a qualifying set)
- [x] `OverflowSheet.tsx` (⋯) — verified live: Add a set, Finish here,
      I already did this, Note, Watch the lift, Form cues all render;
      Note flow verified live end-to-end (chip select → save → banner
      appeared on Brief). Add a set / Finish here / I already did this /
      Watch the lift / Form cues code-reviewed, not each individually
      click-tested this pass.
- [x] Jump sheet (rest-only, inside RestTakeover) — built, not manually
      verified live this pass (code-reviewed)
- [x] Rail-tap mid-session (switch exercise without losing progress) —
      verified live

## 5. Rest takeover
- [x] `RestTakeover.tsx` — full-screen, ports RestTimer's interval/
      vibrate/playTimerComplete/announce logic — verified live
      (countdown ran, "Next up" showed the next exercise correctly)
- [x] Effort card (Easy/Solid/Grind → RPE 7/8/9+) writes via `updateSet`
      — verified live. **Bug found + fixed during testing:** the
      "Solid" button was hardcoded to always render as selected
      regardless of tap; fixed to key off actual `selectedEffort` state.
- [x] Timer controls: +30s, Skip rest — verified live (Skip rest
      triggered auto-advance correctly). Long-press +30s for a custom
      target — built as a plain tap only; long-press NOT implemented
      (README mentions it as a stretch behavior; flagging as a known gap
      rather than silently dropping it).
- [x] Auto-advance to next set at zero / on skip — verified live (set 1
      → set 2, rail count updated, weight/reps reset for the fresh set)
- [x] **Bug found + fixed:** the full-screen takeover wasn't actually
      covering `BottomNav` (both z-40, BottomNav wins the DOM-order
      tiebreak) — bumped `DaySession`'s Set/Rest wrapper to z-50.

## 6. Note sheet (6d)
- [x] `NoteSheet.tsx` — verified live via the overflow-menu path (chip
      select, save, note correctly fed the `day_adjustment_soften`
      proposal engine — proves the whole loop: note → engine reads it →
      proposal renders on Brief)
- [x] "Offered unprompted after Grind" path — wired
      (`RestTakeover`'s Grind selection calls `onOpenNoteSheet`), not
      manually triggered live this pass (would need a Grind tap, not
      separately re-tested after the overflow-path test already proved
      the sheet itself works)
- [x] `Pain or tweak` → flags exercise; skill-program stop-session offer
      code-reviewed (gated on `program.slug === "handstand-walk"`), not
      live-tested (test program wasn't the skill program)

## 7. Off-plan sheet
- [x] `OffPlanSheet.tsx` — verified live: "Log an activity" embeds the
      real `RunSlotCard` correctly; drill-count link to `/off-plan`
      renders (drill count itself reads `0` for this program's cardio
      blocks — matches the pre-existing `/off-plan` dashboard block's
      identical counting logic, not a new bug)

## 8. Cleanup / deletion
- [x] **Correction, caught before deleting anything:** `ExerciseCard.tsx`
      / `SetRow.tsx` / `RestTimer.tsx` / `SuggestionBox.tsx` /
      `BarVisualizer.tsx` / `NoteSignalHint.tsx` /
      `EngineReadsNotesHint.tsx` are **NOT orphaned** — the plan's
      original inventory was wrong. `app/off-plan/page.tsx` has its own
      independent `BlockSection`/`ExerciseCard` render tree, completely
      separate from the one deleted out of `TodaySession.tsx`. None of
      these files are deleted. `SessionActions.tsx`/`PerProgramActions.tsx`
      ARE correctly unused off `/session/[slug]` now (still used on
      `/plan`, untouched) — that part of the original plan held.
- [x] **Real bug found from the correction above, and fixed:** `/off-plan`'s
      `SetRow` still drives the OLD global bottom-fixed timer via
      `lib/useTimer.ts`'s shared store (`RestTimerHost`, mounted app-wide
      in `AppShell`, not route-scoped). The new `SetView`/`RestTakeover`
      were originally wired to that SAME shared store — meaning logging a
      set on `/session/[slug]` would have started BOTH the new full-screen
      takeover AND the old bottom widget simultaneously (hidden behind the
      new one's z-50, but still mounted and firing its own vibrate/sound/
      SR-announce independently — double of each, silently, on every set).
      Fixed by decoupling: `SetView` no longer touches `lib/useTimer.ts`
      at all; it carries the rest duration up via `onConfirmed(seconds)`,
      `DaySession` holds it in local state, and `RestTakeover` takes it as
      a plain `targetSeconds` prop with a fully self-contained countdown.
      Re-verified live after the fix — Rest takeover still works
      correctly, no console errors, no duplicate widget.

## 9. Verification
- [x] `npm run lint` (`npx eslint src/`) — 71 problems (25 errors, 46
      warnings) vs. 75 on main before this change (27/48) — net fewer,
      zero new issues introduced (verified via git stash diff)
- [x] `npx tsc --noEmit` — clean
- [x] `npm run test` (vitest) — 162/162 passing, before and after
- [x] Manual walk via Chrome automation, signed in as the sandboxed
      `e2e-baseline@margus.dolmit.dev` test account (never the real
      account): Brief → Start → stepper → log a set → PR badge → Rest →
      effort → skip → auto-advance to set 2 → rail-jump to 2nd exercise
      → ⋯ → Note (chip+save) → back to Brief → proposal banner appeared
      → expanded to full ProposalCard → off-plan sheet → Log an activity
      (RunSlotCard embedded) → close. No console errors at any point.
      Found and fixed 3 real bugs in the process (see sections above).
- [ ] Re-check every row of the turn-5 coverage matrix explicitly,
      row by row, against the shipped UI — not done as a formal pass;
      the manual walk above covers most "Covered in 4a/4b" rows but
      wasn't cross-checked against the matrix line-by-line
- [x] `/plan` Move/Skip unchanged (not modified this pass);
      `/` dashboard verified logically unchanged (only dead
      slugOverride branches removed, the live dashboard-mode code path
      is untouched)
- [x] Re-ran tsc/eslint/vitest after the timer-decoupling fix — still
      clean, still 162/162, still fewer lint issues than main baseline
- [x] Commit + push

## Post-ship regression pass (user asked: anything left over / broken?)

Went back through with fresh eyes specifically hunting for regressions
and dead code, beyond what the original ship already covered:

- [x] **Fixed:** dead code — `DaySession.tsx` imported `useDayExercise`
  from `useStore` and re-exported it (with `entrySets`) at the bottom of
  the file for no reason; nothing ever imported it (every consumer only
  imports the `RailExercise`/`SessionSheet` *types*). Removed the import
  and the re-export.
- [x] **Fixed:** Start/Continue now resumes at the first unfinished set
  instead of always landing on set 1. Was a real gap against the
  README's interaction spec ("Continue — Bench press, set 4"), not
  data-destructive (prior sets stayed logged and pre-filled correctly
  either way) but confusing — re-entering a session with 1-of-5 logged
  used to always show "Start — squat" with set 1 blank... no, set 1
  pre-filled, but positioned as if nothing had happened. `DaySession`'s
  `startSession`/`jumpTo` now land on `min(loggedCount, rowCount-1)`;
  `BriefView`'s CTA label switches to "Continue — X, set N" once any
  progress exists. Verified live: after logging set 1, Brief showed
  "Continue — High-bar back squat, set 2" and tapping it landed
  correctly on a fresh Set 2.
- [x] Re-verified `/` (Today dashboard) live — unaffected, renders
  identically (DashboardBlock summaries, Open session link, off-plan
  block, extras block all intact). This route was never visually
  re-checked during the original ship, only reasoned about via diff +
  tsc/eslint/vitest.
- [x] Re-verified `/off-plan` live — unaffected. This is the page that
  revealed the timer-store conflict (see below); confirmed it still
  loads and navigates cleanly with the old ExerciseCard/SetRow/RestTimer
  stack, no console errors.
- [x] Re-verified `/plan` live — unaffected, no console errors.
- [x] Re-ran tsc/eslint/vitest after all of the above — still clean,
  still 162/162, still 71 problems (vs 75 on main) with zero new issues.

## Known gaps / follow-ups (not silently dropped)
- Long-press on `+30s` for a custom rest target is not implemented
  (plain tap only).
- 6c (cycle-start gate) and the AMRAP rep-grid are built and
  code-reviewed but not exercised live — need a test account with
  either a real training max + AMRAP-scheme exercise, or a green-streak
  history, to verify visually.
- Readiness one-liner in Brief: intentionally not built (see context.md
  decision log).
- Turn-5 coverage-matrix row-by-row sign-off not yet done as a discrete
  pass.

## Post-ship bug batch — 2026-08-24 ("can't start a block")

Founder report: "when I open session from Day tab, then I can see the
blocks but I can't seem to start a block." Two independent causes, both
reproduced against a signed-in browser with persona state, both fixed.

- [x] **Brief's exercise rows were dead.** `DaySession.jumpTo` set
  `activeKey` but never `setMode("set")` — it was written for the Set
  view's rail, where mode is already "set", then reused as BriefView's
  `onSelectExercise`. Tapping any row from the Brief re-rendered the
  Brief and nothing happened; only the bottom CTA could open Set (and
  that CTA is disabled whenever the cycle-start gate is up, so a user
  with a pending TM bump had no way in at all). `OffPlanSession.jumpTo`
  already had the line — this was a gap, not a design choice.
  Regression test: `tests/e2e/day-brief-start.spec.ts` (fails on the
  parent commit, passes here).
- [x] **Slot-based programs rendered zero exercises everywhere.**
  `scheduled_blocks` stores template IDs, and the block-object read path
  (Today, the session shell, off-plan) resolved them with a bare
  `program.blocks.find(...)` — the AUTHORED block, skipping the drill
  composition that `blocksForDate` runs. `overhead-mobility` authors no
  items at all (all seven blocks are `capability_slot` +
  `slot_drill_count`, composed per user from `drill_library`), so every
  session read "0 exercises · about 15 min" with a Start button that did
  nothing, and off-plan read "0 drills available". Every real account has
  `feature_flags.block_object === true`, so the composition path was dead
  code in production. Extracted `composeBlockForUser` from
  `multiDimensionalBlocksForDate` and called it at all four read sites.
  Verified live: Overhead Mobility now renders a 4-exercise session and
  10 off-plan drills.
- [x] Scoped that fix with `onlyIfEmpty: true` at the UI call sites —
  strictly additive, blocks with authored items pass through untouched.
  First pass composed over authored items too (matching the legacy path)
  and regressed handstand-walk: the composer has no cross-block dedupe,
  so eight distinct authored movements became "Kinoshita position 1"
  three times and "Wall walk" twice. Prerequisite pruning is also left
  off for authored blocks — it never ran on this path either, and
  enabling it silently dropped a drill (Kinoshita position 2) out of a
  session a live user is mid-way through. Personas re-checked
  before/after: handstand-walk and anterior-hip-rebuild render
  identically, overhead-mobility goes from empty to real.
- [x] tsc clean, vitest 170/170 (3 new `composeBlockForUser` cases),
  eslint unchanged at 4 problems in the touched files (all pre-existing).

### Follow-up worth doing separately
- The composer picks the same low-level drill for several slots in one
  session (handstand-walk, when composition is allowed to run). It needs
  cross-block dedupe before composition can be trusted over authored
  items. Until then `onlyIfEmpty` is load-bearing, not a nicety.
