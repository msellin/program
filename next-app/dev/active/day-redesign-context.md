# Day redesign — context

Started 2026-08-23. Plan: `day-redesign-plan.md` (same dir). Checklist:
`day-redesign-tasks.md`.

## Where the design spec lives

Not a local folder — a Claude Design project, read via the `DesignSync`
MCP tool (`get_file` / `list_files`), project id
`ae875ff7-990a-4c68-8673-11442c37996a`. Key paths inside it:
- `Terav Day Redesign.dc.html` — the design. Turn `t5` = coverage matrix
  (every capability Day has today + where it lands). Turn `t6` = the four
  decisions + states `6a`–`6d`. Turn `t4` = Brief/Set/Rest states `4a`
  (single track) / `4b` (concurrent tracks).
- `design_handoff_day_redesign/README.md` — full written spec: color/type/
  spacing tokens (already match `globals.css` almost exactly), screen-by-
  screen layout prose, the four decisions with reasoning, "what moves off
  Day" table, carried-over-unchanged list, interactions/state mapping.

Full README content and the `t4`/`t5`/`t6` HTML sections were fetched and
read in full during planning (2026-08-23 session) — if context is lost,
re-fetch via `DesignSync get_file` rather than guessing at the spec.

## Key existing files (read during planning, understand before touching)

- `src/components/session/TodaySession.tsx` (1727 lines) — currently serves
  both `/` (dashboard) and `/session/[slug]` (`slugOverride` prop). Being
  split: dashboard-only branches stay here; session-mode is a full rebuild
  in a new file.
- `src/app/session/[slug]/SessionClient.tsx` — thin wrapper, reads `?date=`,
  renders the session component. Will point at the new `DaySession`
  instead of `TodaySession`.
- `src/components/workout/ExerciseCard.tsx`, `SetRow.tsx` — the old set-
  logging UI being replaced. `SetRow` starts the rest timer via
  `useTimer().start()` on a `weight+reps` transition — same trigger point
  the new Set screen's confirm button uses.
- `src/components/workout/RestTimer.tsx` — bottom-fixed widget. Its
  interval/vibrate/`playTimerComplete`/`announce(30s, complete)` logic is
  ported into the new full-screen `RestTakeover`, not rewritten from
  scratch.
- `src/lib/useTimer.ts` — tiny zustand store (`active`, `autoStart`, `seq`,
  `start`, `stop`). Reused unchanged.
- `src/lib/plates.ts` (`platesLabel`), `src/lib/pr.ts` (`isSetPR`) — reused
  unchanged.
- `src/lib/useStore.ts` — `updateSet(blockId, exId, setIndex, patch, date)`
  already carries `rpe` on `SetLog`; `addSet`, `setNotes`, `setDayNotes`,
  `markDone` all reused unchanged. `updateSet` impl at ~line 468.
- `src/lib/proposals/select.ts` (`selectProposals`), `useProposalActions.ts`
  — proposal engine. `tm_bump` comes from `evaluateOverperformer` in
  `lib/engine/adapt.ts` (a green-streak/easy-signal heuristic, NOT a
  cycle-week detector — `store.cycle.week_in_cycle` exists in the schema
  but nothing reads it for TM progression). This is why 6c's gate was
  redefined during planning (see decisions below).
- `src/components/workout/ExerciseDetailsSheet.tsx`, `VideoModal.tsx`,
  `src/components/ConfirmSheet.tsx`, `src/lib/useFocusTrap.ts` — reused
  unmodified inside new sheets.
- `src/app/plan/page.tsx` — already has Move…/Skip via `MoveSheet` +
  `ConfirmSheet`, confirmed working. This is why `SessionActions`/
  `PerProgramActions` are cut from the session route entirely rather than
  ported.
- `src/components/AppShell.tsx` — shell chrome. `BottomNav` is
  `position: fixed; z-40`; the new full-screen `RestTakeover` must use a
  higher z-index (`z-50`+) to cover it, matching "full-screen takeover."
- `src/app/globals.css` — palette already matches the README's token table
  almost exactly (ground `#0e0f12`, surface `#16181c`, bronze `#c89666`,
  slate `#79b8c4` = the README's "teal", etc). Quick-win #3 (collapse
  accent surface) is about pruning extra values, not introducing new ones.

## Decisions made during planning (do not re-litigate)

1. **6c gate**: tm_bump proposal pending AND zero sets logged today (not a
   new cycle-boundary detector). User explicitly signed off on this after
   I flagged the engine gap and gave my recommendation as architect.
2. **Other proposal kinds** (readiness_after_layoff, tier_advance,
   day_adjustment_soften, non_responder, retest_due): compact collapsed
   banner per proposal above the hero card, tap → existing `ProposalCard`
   sheet. Keeps Brief to one screen.
3. **Readiness one-liner** ("morning check, then one line in the brief"
   per the coverage matrix): explicitly NOT built this pass — no copy or
   placement was specified anywhere in the design package, and the README
   says not to invent unshown copy. `/check` stays the only readiness
   surface. Flag if this becomes a problem in review.

## Architecture

New file: `src/components/session/DaySession.tsx` owns the whole shell
(mode: brief/set/rest, activeExerciseId, activeSetIndex, editingLoad,
sheet: null|off-plan|overflow|note|jump|details, effortAnswered).
`TodaySession.tsx` loses the `slugOverride` prop and all
`slugOverride`-gated branches once `DaySession` ships — dashboard mode
(`/`) keeps working unchanged throughout.

## Next steps

See `day-redesign-tasks.md` for the live checklist. Work proceeds in the
order the user specified: quick wins → Brief → Set → Rest → Note sheet →
6c.
