# Iter 1 — Session-flexibility audit

Live URL: **https://program-v2.pages.dev** (Cloudflare Pages, program-v2 build)
Test date: 2026-08-07 (auditor)
Test harness: Playwright at `/tmp/pw-audit/iter1-flows.js`
Browser tz: **Europe/Tallinn** (UTC+3) — matches the user's real timezone. Rerun with
`PW_TZ=UTC node iter1-flows.js` to compare.
Screenshots: `dev/audits/iter1-flows-shots/`
Raw findings JSON: `/tmp/pw-audit/iter1-findings.json`

## Executive summary

**5 critical, 5 high, 3 med, 4 low = 17 findings.**

The biggest one is not any single scenario — it's a **UTC/Europe-tz off-by-one bug** in
`lib/useStore.ts` that pushes almost every skip/shift/move date backwards by one day in
the user's own timezone. The comment on `lib/utils.ts:15` explicitly warns that
`toISOString().slice(0, 10)` will break date keys for any tz east of UTC. The store
code forgot to heed its own warning — `computeWeekShift` (line 82) and `skipWholeWeek`
(lines 253, 267) both call `.toISOString().slice(0, 10)` on a local-midnight Date. Under
Tallinn tz, "Mon 10 Aug 00:00 EEST" serialises as "2026-08-09". Every downstream key —
skipped[date], scheduled_overrides[date] — lands on the wrong calendar day.

For a repro so obvious it doesn't need Playwright, in DevTools console (tz=EEST):

```js
new Date("2026-08-10T00:00:00").toISOString().slice(0, 10);
// "2026-08-09"   ← writes the WRONG date key
```

This one fix would resolve **five** of the reported findings (S0-tz-shift,
S0-tz-week, S0-tz-week-ov, S9-boundary-data, S14-cross-week) and would silently
correct the S2 cascade rendering on the Week view too.

The other high-value fixes:
- **clearSkip doesn't clean up paired overrides** (S1b-undo, S11-orphan). Undo on a
  moved or shift-and-skipped day leaves orphan `scheduled_overrides` entries that
  reappear on future dates without any way to see or clear them. **clearShift is defined
  but never wired to any UI**, so users cannot ever fully undo a "Skip + shift week".
- **Silent overwrite** on any action that writes to a date with an existing entry
  (S3 whole-week, S4 move onto scheduled, S5 move onto skipped). No warning, no toast.
- **Phase-cross bug** (S2-phase-cross): Phase-1 users get shift overrides in
  block_squat_heavy / block_pull_heavy / block_squat_variant, which don't exist in Phase 1
  (Phase 1 uses `block_reintro`). The cascade blindly follows `weekly_template` (Phase 2+
  layout).

## Findings

### CRIT-1 · S0-tz-shift · UTC off-by-one in `computeWeekShift`
- **File:** `lib/useStore.ts:82` (`slotDate.toISOString().slice(0, 10)`)
- **Repro:** Set browser TZ = Europe/Tallinn. Seed empty store. `?today=2026-08-10`.
  Tap "Skip today" → "Skip + shift week" (default). Read
  `localStorage["program.log.v2"].scheduled_overrides`.
- **Expected:** keys `2026-08-12`, `2026-08-13`, `2026-08-15` (Wed/Thu/Sat).
- **Actual:** keys `2026-08-11`, `2026-08-12`, `2026-08-14` (Tue/Wed/Fri). Every date
  is one day earlier than intended.
- **Fix:** Replace `toISOString().slice(0, 10)` with the `iso()` helper already exported
  from `lib/utils.ts:15` (it's *right there* and its comment predicts this exact bug).

### CRIT-2 · S0-tz-week · UTC off-by-one in `skipWholeWeek` (skipped dates)
- **File:** `lib/useStore.ts:253` (`d.toISOString().slice(0, 10)`)
- **Repro:** Same setup. Tap "Whole week" → "Shift whole week".
- **Expected:** `skipped` keys `2026-08-10, 08-12, 08-13, 08-15`.
- **Actual:** `skipped` keys `2026-08-09, 08-11, 08-12, 08-14`. Sunday of the previous
  week gets skipped instead of Mon; the whole week is offset backwards.
- **Fix:** Same as CRIT-1 — use `iso()` helper.

### CRIT-3 · S0-tz-week-ov · UTC off-by-one in `skipWholeWeek` (+7d override keys)
- **File:** `lib/useStore.ts:267` (`next.toISOString().slice(0, 10)`)
- **Repro:** Same as CRIT-2, then read `scheduled_overrides`.
- **Expected:** override keys `2026-08-17, 08-19, 08-20, 08-22`.
- **Actual:** `2026-08-15, 08-17, 08-18, 08-20`. The whole "shift +7d" slid a day backward.
- **Fix:** Same.

### CRIT-4 · S3-silent-overwrite · Whole-week clobbers pre-existing overrides
- **File:** `lib/useStore.ts:268` (`s.scheduled_overrides[nextISO] = ...`)
- **Repro:** Seed `scheduled_overrides["2026-08-17"] = { blocks: ["block_manual_probe"], reason: "planned makeup" }`.
  Go to `?today=2026-08-10`. Tap Whole-week → Shift whole week.
- **Expected:** either refuse (with a "conflict" toast), OR merge blocks (keeping both),
  OR preserve prior and warn.
- **Actual:** `scheduled_overrides["2026-08-17"]` silently becomes
  `{"blocks":["block_pull_heavy"],"reason":"shifted +7d from 2026-08-11"}`. The user's
  planned makeup evaporates with no acknowledgement.
- **Fix:** Before assignment, check for an existing entry; if present, prompt or bail.

### CRIT-5 · S11-orphan · `clearSkip` on a moved day leaves the override orphaned
- **File:** `lib/useStore.ts:326` (`clearSkip`) vs `moveSession` at line 314-323
- **Repro:** Empty store. Tap "Move day" → "Move" (default = tomorrow). This writes
  `skipped[today] = { moved_to: tomorrow }` AND `scheduled_overrides[tomorrow]`. Tap
  the "Undo" button on the resulting "Session skipped today · Moved to 2026-08-08" card.
- **Expected:** the paired override on the target date is also removed.
- **Actual:** `skipped[today]` is deleted, but `scheduled_overrides["2026-08-08"] = { blocks: […], reason: "moved from 2026-08-07" }` remains. The user now has an invisible
  session waiting for them tomorrow (from cancelled Move). Also visible on the Week view
  as a "moved-in" badge with no way to get rid of it (no UI to clear a raw override).
- **Fix:** In `clearSkip`, inspect `skipped[date].moved_to` — if set, also delete the
  paired `scheduled_overrides[moved_to]` when its reason matches `moved from <date>`.

### HIGH-1 · S1b-undo-orphan · Undo after "Skip + shift week" orphans the shift overrides
- **File:** `components/workout/SessionActions.tsx:39` (Undo → `clearSkip(active)`)
- **Repro:** Skip + shift on `?today=2026-08-10`. Tap Undo on the skipped card.
- **Expected:** the whole shift (3 overrides) is reversed.
- **Actual:** `skipped[2026-08-10]` cleared; `scheduled_overrides` for Wed/Thu/Sat all
  remain. The user sees "Undo → done" but the shifted week persists silently. On the
  Week view, those days still show "moved-in" and swapped block names.
- **Fix:** Persist the shift metadata on `skipped[today]` (e.g. `.shift = { overrides: [...] }`).
  On Undo, if `.shift` is present, run `clearShift` semantics; else run plain `clearSkip`.
  This also fixes S12-unreachable.

### HIGH-2 · S12-unreachable · `clearShift` is defined but never called by any component
- **File:** `lib/useStore.ts:293` (`clearShift`) — used **nowhere** in `src/`.
- **Repro:** `grep -rn clearShift src/` → 1 hit (the definition itself).
- **Expected:** the "Undo" button on a shift-flavoured skipped card should route through
  `clearShift`.
- **Actual:** it uses `clearSkip`. `clearShift` sits as an unreachable well-tested
  utility.
- **Fix:** Same fix as HIGH-1.

### HIGH-3 · S2-phase-cross · Cascade in Phase 1 writes Phase-2-only block IDs
- **File:** `lib/useStore.ts:73-83` (`computeWeekShift` reads `weekly_template` blindly)
- **Repro:** `?today=2026-08-10` (Mon, still Phase 1: Aug 6-29). Skip + shift.
- **Expected:** Phase-1 users get overrides that reference Phase-1 blocks (`block_reintro`,
  possibly `block_evaluate` in week 2).
- **Actual:** overrides reference `block_squat_heavy`, `block_pull_heavy`, `block_squat_variant`
  — Phase-2 blocks that are gated on `phase_gated: phase_2_cycle_1`. On the Week view
  these render (because Week trusts overrides), but on the Today view for those dates,
  the phase logic in `app/page.tsx:229-281` may or may not accept them. Result: cross-phase
  data pollution.
- **Fix:** In `computeWeekShift`, don't take blocks from `weekly_template` — derive per
  date via a helper equivalent to `strengthBlocksForDate(program, phase, date)`. The Today
  page has this logic; extract it into `lib/engine/` and share.

### HIGH-4 · S4-silent · Move silently overwrites an existing override
- **File:** `lib/useStore.ts:317` (`overrides[toDate] = { … }`)
- **Repro:** Seed `scheduled_overrides["2026-08-08"] = { blocks: ["block_reintro"], reason: "already scheduled" }`.
  `?today=2026-08-07`. Tap Move day → Move (default target = 08-08).
- **Expected:** warn / merge / refuse.
- **Actual:** `2026-08-08` overwritten to `{ blocks: [today's blocks], reason: "moved from 2026-08-07" }`. Prior "already scheduled" gone.
- **Fix:** Same guard as CRIT-4. Prompt on conflict.

### HIGH-5 · S5-conflict · Move to a skipped date leaves the day skipped (moved-in invisible)
- **File:** precedence in `app/page.tsx:52-56` + early-return in `SessionActions.tsx:26`.
- **Repro:** Seed `skipped["2026-08-08"] = { reason: "…" }`. Move today (08-07) onto 08-08.
- **Expected:** either un-skip 08-08 (move takes precedence), or refuse the move.
- **Actual:** `skipped[08-08]` stays. `scheduled_overrides[08-08]` is also written.
  Navigating to 08-08 renders the "Session skipped today" card — the moved-in session
  is invisible. `SessionActions.tsx:26` early-returns as soon as `skipped[date]` is
  truthy, ignoring any override.
- **Fix:** In `moveSession`, delete `skipped[toDate]` if present. Alternatively, refuse
  and toast.

### MED-1 · S6-past · Move-to-past accepted with no UX affordance
- **File:** `components/workout/SessionActions.tsx:395` + `lib/useStore.ts:314`.
- **Repro:** Programmatically set the date-picker to a past date (`2026-08-06`) and tap Move.
  The input's `min` uses `new Date().toISOString().slice(0, 10)` (a real "today", ignoring
  `?today=` and tz), but this only affects the picker's client-side floor — the store
  method doesn't validate.
- **Expected:** either reject (`toDate < fromDate` invalid), or explicitly present it as
  "backfill a session I did earlier".
- **Actual:** override on 2026-08-06 written. Data model has no notion of "log this in the past".
- **Fix:** In `moveSession`, validate `toDate >= fromDate`. If backfill is a legitimate use case,
  add a distinct code path/UI ("Log a past session").

### MED-2 · S7-week-render · Future skips on next week not immediately visible
- **File:** `app/week/page.tsx` (offset state initialised to 0 = this week).
- **Repro:** Skip a future date > 7 days out. Land on Week view.
- **Expected:** either the week nav auto-jumps to the week containing the future skip, or
  a small "1 event in Week +1" hint appears.
- **Actual:** the future skip only shows if you manually navigate to that week.
- **Fix:** Show a badge on the "Next week" arrow when the target week has skips/overrides.

### MED-3 · S9-no-session-actions-sun · SessionActions hidden on rest days (Sundays)
- **File:** `app/page.tsx:96-101` (only renders when `blocks.length > 0`)
- **Repro:** `?today=2026-08-09` (Sun). No Skip / Move / Whole-week bar visible.
- **Expected:** at least "Whole week" should always be reachable — a user recovering on
  Sunday who realises "I need to sit this week out" has no button.
- **Actual:** the entire SessionActions component is absent. Also affects S10.
- **Fix:** Render SessionActions unconditionally, but hide "Skip today" when the day has no
  strength block. Keep "Whole week" always visible.

### LOW-1 · S6-min-attr-tz · Move date-picker `min` uses UTC toISOString
- **File:** `components/workout/SessionActions.tsx:395`
- **Fix:** Use `iso(new Date())` — small, aligned with the other UTC fixes.

### LOW-2 · EXT-no-edit-reason · Cannot edit reason on a skipped day
- **File:** `components/workout/SessionActions.tsx:37`
- **Fix:** Add inline edit; low priority but adds journal value.

### LOW-3 · EXT-move-confirm-copy · Move confirm button says only "Move"
- **File:** `components/workout/SessionActions.tsx:409`
- **Fix:** Show the target date: e.g. `Move → Sat 8 Aug`.

### LOW-4 · EXT-default-shift-on · Skip sheet defaults `shift = true`
- **File:** `components/workout/SessionActions.tsx:277`
- **Fix:** Consider defaulting to false — shift week is the destructive-est of the three
  variants. A user tapping "Skip today" and reflexively hitting the primary CTA gets a
  full week rewrite. The default should be the least surprising action.

## Interactions that FELT wrong even when functionally correct

1. **The "Skip + shift week" primary CTA (LOW-4) is a big commitment for one tap.** On a
   normal Skip flow the modal briefly explains what shift does — but the primary button
   is coloured `bg-accent` and reads `Skip + shift week`. If the user is stressed / tapping
   fast, they nuke the week when they meant to skip today only. Making the default
   opt-in (unchecked) would slow this down.

2. **No optimistic-lock or warning around any write to `scheduled_overrides`.** Move,
   whole-week, and (once we fix HIGH-1) undo all step on each other. A conflict-detecting
   layer would prevent CRIT-4, CRIT-5, HIGH-4, HIGH-5 in one go.

3. **The MoveSheet's confirm button just says "Move".** It doesn't remind you which date
   you're moving *to*. Compared to WeekSheet ("Shift whole week"), the target date could
   be surfaced in the button label. See LOW-3.

4. **The DateNav labels are consistent (`Previous day`, `Next day`)** — audit found and
   used them successfully. Not a bug, just noting.

5. **The Skip sheet shows "TMs don't change" + "streak pauses but doesn't break"** — good
   copy. But the same reassurance is missing on WholeWeekSheet. That's the *scarier*
   action and it deserves louder reassurance.

6. **`Undo` reads too soft on a shift.** It's tiny text in the top-right of the skipped card.
   For a "Skip + shift week" undo, the user might reasonably expect a
   confirmation ("Undo skip and restore the week?") given the size of the reversal. As-is,
   they tap Undo and nothing visible changes (because Undo doesn't actually undo the shift
   — see HIGH-1).

7. **`Sunday` renders "Full rest day. No barbell." with zero controls.** Fine as a
   messaging choice, but combined with MED-3, it means a Sunday visit has no way to
   plan the coming week off. Suggest: even on rest days, always show a small "This week
   off" pill.

8. **Phase-1 cascade blocks aren't Phase-1 blocks.** HIGH-3 is a data bug, but it also
   feels wrong to the user staring at the Week view: their upcoming days show block names
   they've never trained (`block_squat_heavy` doesn't render in Phase 1). This will be
   very confusing once the user is actually using this before Aug 30.

## What was NOT reproduced

- **S8 rapid tapping (Skip↔Undo)** — coherent state; ended with 1 `skipped` entry after
  5 Skip/Undo cycles. Store operations are idempotent for the same date key.
- **S10 shift with no days remaining** — because S9 blocked it. When the SessionActions
  bar is visible on a Sunday (i.e. once MED-3 is fixed), this needs re-testing.
- **S13 refresh mid-modal** — safe. Modal state is local; no orphan writes.
- **S14 phase boundary (Mon Aug 31, first Phase-2 strength day)** — cascade writes to
  Sep 1 / 2 / 4, which is the correct Wed/Thu/Sat of that week under the tz off-by-one.
  Once CRIT-1/2/3 are fixed this should land on Sep 2 / 3 / 5.

## Suggested fix order

1. **CRIT-1/2/3 first**. One PR: replace all `.toISOString().slice(0, 10)` in
   `lib/useStore.ts` with `iso()`. Add a unit test that mocks `TZ=Europe/Tallinn` and
   asserts date keys. This fix will implicitly repair the visible-on-week rendering for
   several scenarios.
2. **CRIT-5 + HIGH-1 + HIGH-2 together**. Add a `history` slice to `skipped[date]`
   recording which action produced it. Route Undo through the correct clear function.
3. **CRIT-4 + HIGH-4 + HIGH-5**: shared conflict-detection helper —
   `wouldConflict(store, date, kind)` — used by `moveSession`, `skipWholeWeek`, and any
   future writer. On conflict, throw a typed error the UI surfaces as a toast.
4. **HIGH-3** (phase-cross): extract the phase-aware `strengthBlocksForDate` from
   `app/page.tsx` into `lib/engine/` and use it inside `computeWeekShift`.
5. **MED-3** (SessionActions hidden on rest days): render unconditionally, hide inner
   buttons contextually.
6. **LOW-x**: batch after.

## Test-artefact / harness notes

- Playwright browser context uses `timezoneId: "Europe/Tallinn"` explicitly. Rerun with
  `PW_TZ=UTC` for a comparison. Under UTC the tz off-by-ones disappear (`.toISOString`
  happens to align), which is likely why the bug wasn't caught during local dev.
- All UI probes go through `text=…` selectors + a hand-rolled `clickMoveConfirm` /
  `clickSkipConfirm` / `clickWholeWeekConfirm` helper that finds the modal's `.bg-accent`
  button. The original attempt to click `button:has-text("Move")` matched both the
  launcher tile and the confirm — worth noting the strings collide.
- Store seeding happens via
  `page.evaluate((s) => localStorage.setItem("program.log.v2", JSON.stringify(s)), store)`
  followed by a reload — matches the "faster than clicking through" note in the brief.
