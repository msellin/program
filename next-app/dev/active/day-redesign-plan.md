# Day (session) redesign — Brief / Set / Rest

## Context

`/session/[slug]` today is powered by the same 1727-line `TodaySession.tsx` that
also renders the `/` Today dashboard, sharing branches via a `slugOverride`
prop. In session mode it still renders the old scrolling stack: ~20 components,
five always-open textareas, three readiness cards, `ExerciseCard` → `SetRow`
grids, a bottom-fixed `RestTimer` widget. A design package
(`design_handoff_day_redesign/` in the linked Claude Design project) specifies
a full replacement: two states of one shell — **Brief** (what am I doing today,
never scrolls) and **Set** (one set at a time, rail always reachable, full-
screen **Rest** takeover). Nothing is ever added to the lifting screen itself;
effort/notes/progression move into dead time (rest, or before the first set).

Design references read directly from the Claude Design project (`get_file` on
project `ae875ff7-990a-4c68-8673-11442c37996a`): `README.md` (full spec: colors,
type scale, spacing, screen-by-screen layout, the four decisions, the "what
moves off Day" table, interactions/state), and the coverage matrix + all state
mockups (`4a`, `4b`, `6a`–`6d`) from `Terav Day Redesign.dc.html`. These are
prototypes to recreate in Next.js/Tailwind/Zustand, not markup to port.

Confirmed decisions (this session, verbally, not to be re-asked):
- **6c gate** = tm_bump proposal pending AND no sets logged yet today (not a
  new `week_in_cycle` detector — reuses `selectProposals`/`useProposalActions`
  as-is).
- **Other pending proposals** (readiness_after_layoff, tier_advance,
  day_adjustment_soften, non_responder, retest_due) render as a compact
  collapsed banner per proposal above the hero card; tapping opens the
  existing `ProposalCard` sheet for Accept/Ignore. Keeps Brief to one screen.
- **Readiness one-liner**: NOT built this pass — no copy/placement was
  specified in the README and it explicitly says not to invent unshown copy.
  `/check` remains the sole readiness surface. Left as a noted gap, not silently
  dropped.

Scope is exactly what the user ordered: the four quick wins, then Brief, then
Set, then Rest + effort, then the note sheet, then 6c. The `/` Today dashboard
route (`app/page.tsx`) and `TodaySession.tsx`'s dashboard-mode branches are
**out of scope** — they keep working exactly as today.

## Architecture decision: split session route into its own component

`TodaySession.tsx` currently serves both `/` (dashboard mode) and
`/session/[slug]` (`slugOverride` set) via scattered `!slugOverride` /
`slugOverride` conditionals. Rebuilding session mode in place would leave the
dashboard branches tangled with a totally different render tree.

**Plan:** create `src/components/session/DaySession.tsx` — a new component
that owns the whole Brief/Set/Rest shell for one program. `SessionClient.tsx`
renders `<DaySession slug={slug} initialDate={initialDate} />` instead of
`<TodaySession slugOverride .../>`. `TodaySession.tsx` loses the `slugOverride`
prop and every `slugOverride`-gated branch (dashboard mode only from here on);
`app/page.tsx` is unaffected (no prop passed there today). This is a
consequence of replacing the session-mode render tree wholesale, not a
drive-by refactor — leaving the dead conditional branches in place would be
worse than removing them.

`DaySession.tsx` owns local UI state per the README's interaction spec:
`mode: 'brief' | 'set' | 'rest'`, `activeExerciseId`, `activeSetIndex`,
`editingLoad: boolean`, `sheet: null | 'off-plan' | 'overflow' | 'note' |
'jump' | 'details'`, `effortAnswered: boolean`.

## Component inventory — Delete / Keep / Create

Checked against the README's "What moves off Day" table and the turn-5
coverage matrix (`t5` in `Terav Day Redesign.dc.html`).

**Deleted from the session route** (still exist/used elsewhere where noted):
| Component | Fate |
|---|---|
| `ExerciseCard.tsx` | Replaced by Set screen's centre-stage + rail. Not deleted from repo — still used nowhere else, so file itself is deleted once nothing imports it. |
| `SetRow.tsx` | Replaced by Set screen weight/rep display + stepper panel. Deleted (only consumer is ExerciseCard). |
| `RestTimer.tsx` (bottom-fixed widget) | Replaced by the full-screen Rest takeover. **Its logic (interval, vibrate, `playTimerComplete`, `announce` at 30s/complete) is ported into the new takeover**, not thrown away. File deleted once the new Rest UI owns that logic. |
| `HeroStateCard.tsx`, `SignalsStrip.tsx`, `ReadinessTrail.tsx` | Already suppressed on session route (`!slugOverride` guards) — confirmed staying suppressed. Not touched (still used on `/`). |
| `YourPlanCard.tsx`, `FirstRunBanner`, `MissedSessionPrompt.tsx`, `Day1EmptyState.tsx` | Already suppressed on session route. Not touched (still used on `/`). |
| `SessionActions.tsx`, `PerProgramActions.tsx` | **Currently NOT guarded by `slugOverride`** — they render on `/session/[slug]` today. This is the actual bug the README's "moved to Plan" row is describing. `/plan/page.tsx` already has Move…/Skip via `MoveSheet` + `ConfirmSheet` — confirmed built and working. Cut entirely from `DaySession.tsx`. |
| `NoteSignalHint.tsx`, `EngineReadsNotesHint.tsx` | Only consumed inside `ExerciseCard`'s always-open textarea. Cut with it (per-exercise + per-set note UI is replaced by the contextual note sheet, decision 2). |
| `DateNav.tsx` | Already removed from Day (confirmed, not present in current session render). No action. |
| Inline `RestDayCard`, `GraduationCard`, `RetestReminder`, taper/interference/skill-safety banners (currently free functions inside `TodaySession.tsx`) | Ported (not deleted) into `DaySession.tsx`'s Brief-state empty/banner handling — "Carried over unchanged" list explicitly names rest-day/graduation/taper states and the skill-program safety rule. |

**Kept, reused as-is (no changes):**
| Component / lib | Role in new design |
|---|---|
| `useTimer.ts` | Timer state (`active`/`autoStart`/`start`/`stop`) — Rest takeover reads/drives it exactly as `SetRow` does today. |
| `lib/plates.ts` (`platesLabel`) | Plate-maths line under the big number. |
| `lib/pr.ts` (`isSetPR`) | Rep-PR badge, awarded on confirm. |
| `useStore.ts`: `updateSet`, `addSet`, `setNotes`, `setDayNotes`, `markDone` | Set confirm, add-a-set, per-exercise note save. `updateSet` already carries `rpe` on `SetLog` — effort answer (Easy/Solid/Grind → RPE 7/8/9) maps onto it. |
| `lib/proposals/select.ts` (`selectProposals`), `lib/proposals/useProposalActions.ts` | Drives both the compact banners and the 6c gate. |
| `ExerciseDetailsSheet.tsx`, `VideoModal.tsx` | Reused unmodified inside the new overflow (`⋯`) sheet — same props, same components. |
| `ConfirmSheet.tsx`, `useFocusTrap.ts` | Pattern for the new bottom sheets (off-plan, overflow, note, jump) — same focus-trap/escape/scrim convention already used app-wide. |
| `announce.ts`, `sound.ts` (`playConfirm`, `playTimerComplete`) | SR announcements + timer-complete chime, ported into Rest takeover. |
| `lib/engine/suggest.ts`, `lib/engine/history.ts` (prescription + last-session lookup) | Feed the hero card / reference strip's "Last time" / "Prescribed" pair. |
| `RunSlotCard.tsx` | Not embedded directly in the new shell, but its activity-type list/logic backs the off-plan sheet's "Log an activity" row (open the same form, not rebuilt). |
| `MoveSheet.tsx`, `SessionActions.tsx`, `PerProgramActions.tsx` | Stay exactly as-is on `/plan` — that's where Move/Skip already lives. Zero changes needed there. |

**Created:**
| File | Purpose |
|---|---|
| `src/components/session/DaySession.tsx` | Shell owner: mode state, sheet state, data loading (program/exercises via existing `data-loader.ts`), renders Brief/Set/Rest. |
| `src/components/session/BriefView.tsx` | Screen `4a`/`4b`: H1 + eyebrow, summary, hero card, exercise-row list, footer (off-plan line, progress eyebrow, Start CTA). Handles single-track and concurrent-track (two `DashboardBlock`-style track cards + interference banner) layouts. |
| `src/components/session/SetView.tsx` | Screen `4a` work state / `6b`: rail, centre stage (weight/reps/reference-pair/plates), footer (confirm + change-weight), stepper panel, AMRAP rep-grid variant. |
| `src/components/session/RestTakeover.tsx` | Screens `4a` resting / `6a`: full-screen countdown (ports `RestTimer.tsx`'s interval/vibrate/sound/announce logic), effort card (Easy/Solid/Grind → RPE), timer controls (+30s incl. long-press custom target, skip, jump). |
| `src/components/session/OverflowSheet.tsx` | Screen `6b`'s `⋯` sheet: Add a set / Finish here / I already did this / Note / Watch the lift / Form cues — wraps existing `ExerciseDetailsSheet`/`VideoModal`. "Remove a set" cut per the design (Finish here replaces it). |
| `src/components/session/NoteSheet.tsx` | Screen `6d`: three chips (Felt heavy / Form broke down / Pain or tweak) + textarea, offered unprompted after Grind or reachable from `⋯`. `Pain or tweak` flags the exercise and, on skill programs, offers to stop (existing shoulder-pain rule). |
| `src/components/session/OffPlanSheet.tsx` | Off-plan/log-another-activity sheet replacing the `/off-plan` dashboard block + `RunSlotCard` entry point on Day. |
| `src/components/session/CycleStartCard.tsx` | Screen `6c`: progression card, gated per the confirmed 6c-trigger decision above. Renders inside `BriefView` above the hero when the gate condition is true; disables the Start CTA until Accept/Adjust. |
| `src/components/session/ProposalBanner.tsx` | Compact collapsed-proposal row (confirmed decision 2) — tap opens existing `ProposalCard` in a sheet. |

## Screen-by-screen plan (implementation order — matches user's ordering)

1. **Four quick wins** (independent, ship first, touch existing files only):
   - Strikethrough on completed exercise names → gone; keep `#93989f`/muted
     text + mono "Done" tag. (Touches `ExerciseCard.tsx` — but that file is
     being deleted for session mode; apply the fix in whatever still renders
     exercise-done state, i.e. the new `BriefView`/`SetView` rows themselves,
     since old `ExerciseCard` won't exist post-migration. Confirmed: build the
     new rows without strikethrough from the start rather than fixing then
     deleting.)
   - Raw enum keys (`shoulder_l` etc.) never rendered — grep for direct
     symptom-key interpolation, route through the existing
     `humanize-metrics.ts`/display-name lookups already used elsewhere
     (`humanizeExerciseId` etc.) instead of a new lookup table.
   - Collapse accent surface in `globals.css` to the README's token table —
     audit actual accent usages (`grep -rn "bronze\|amber\|green\|slate" src/app/globals.css`)
     against the ~9-value table; consolidate, don't just alias.
   - Body-copy contrast: promote meaning-carrying `text-muted` (#93989f) to
     `text-ink` (#d6d9de) where it's not a label — scoped to the new
     components as they're built; a global find/replace across unrelated
     screens is explicitly not in scope.

2. **Brief** (`BriefView.tsx` + `DaySession.tsx` data wiring) — single-track
   (`4a`) first, then concurrent-track (`4b`) with the interference banner and
   per-track skip/move `⋯` (reads `store.scheduled_blocks`/existing
   block-selectors, no new engine logic).

3. **Set** (`SetView.tsx`) — weight/reps prefilled from `suggestForExercise`,
   editable via the stepper panel; PR badge via `isSetPR`; plate line via
   `platesLabel`; rail built from the block's exercise list with per-exercise
   set-count/progress.

4. **Rest takeover** (`RestTakeover.tsx`) — ports `useTimer` + the
   interval/vibrate/sound logic off `RestTimer.tsx`; effort card writes `rpe`
   via `updateSet`; auto-advances to next set at zero (per `4a`'s drawn
   behavior).

5. **Note sheet** (`NoteSheet.tsx`) — offered after Grind only; writes via
   `setNotes`; `Pain or tweak` reuses the existing skill-program stop-session
   rule (currently inline in `TodaySession.tsx` — ported, not rebuilt).

6. **6c — Cycle-start progression card** (`CycleStartCard.tsx`) — per the
   confirmed trigger: `selectProposals` returns a `tm_bump` kind AND today's
   log has zero sets recorded yet. Accept applies via `useProposalActions`'
   existing `onAccept` (already does `setTM` per lift + dismiss); Adjust opens
   inline steppers (new, small — per-lift +/- reusing the Set screen's
   stepper visual pattern).

## Verification

- `npm run lint` and `npm run test` (vitest) in `next-app/` after each major
  step — existing `useStore.block-actions.test.ts` /
  `useStore.retest-readings.test.ts` must keep passing since `updateSet`/
  `addSet`/`setNotes` are reused unmodified.
- Manual pass via the `run` skill: load `/session/<a-strength-slug>` (e.g.
  `anterior-hip-rebuild` or a 5/3/1-style program) at 390×844, walk
  Brief → Start → log a set → Rest → effort → next exercise via rail → off-plan
  sheet → `⋯` → Finish here, confirming no scroll past one screen on Brief.
- Re-check every row in the turn-5 coverage matrix against the shipped UI
  before calling this done — each row must land as "covered" or be an
  explicit, stated cut (matches the doc's own acceptance bar).
- Confirm `/plan` still owns Move/Skip (unchanged) and `/` dashboard mode is
  pixel-identical to before (no `slugOverride` regressions).
