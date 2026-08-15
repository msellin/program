# Iteration 2 — Cross-tab consistency + modals + PWA audit

Target: https://program-v2.pages.dev
Source: /Users/margussellin/www/program/next-app/src/
Date: 2026-08-07 (local, EEST)

## 3-line summary

- Two critical PWA-shell bugs: service worker never activates (stuck "installing") so offline serving fails even after 60s of waiting; and the History heatmap grid ends the previous Sunday, so today's entries are literally not renderable in the widget.
- One high-severity data-integrity bug in the skip/move interaction: `skipDay` after `moveSession` on the same day leaves an orphaned `scheduled_overrides` entry on the target date, so Week keeps showing a "moved-in" session even after the user re-skipped the source.
- All modal focus traps (Skip / Move / Whole week / Video) behave correctly; Onboarding is the exception — it declares `role="dialog"` + `aria-modal="true"` but never installs a focus trap and Escape does not close it.

## Severity counts

- critical: 2
- high: 3
- medium: 3
- low: 2

---

## Findings

### CRITICAL

#### C1 — Service worker never activates; offline reload fails

**Repro**
1. Open https://program-v2.pages.dev in a fresh browser context (Playwright, `serviceWorkers: "allow"`).
2. Poll `navigator.serviceWorker.getRegistrations()[0].installing?.state` every 1s for 60s.
3. Attempt `location.reload()` after `network.setOffline(true)`.

**Observed**
- SW registration remains in `installing` state indefinitely (60s+, cache is fully populated: `serwist-precache-v2-…` has 60 entries).
- `active` state never reached, `navigator.serviceWorker.controller` stays null.
- Offline reload rejects with `net::ERR_INTERNET_DISCONNECTED`.

**Expected**
SW activates within a few seconds and serves the app shell offline (Serwist config has `skipWaiting: true` and `clientsClaim: true` in `sw.ts:17-18`).

**Where**
`/Users/margussellin/www/program/next-app/src/app/sw.ts:15-46`
`/Users/margussellin/www/program/next-app/src/components/ServiceWorkerRegister.tsx:12-14`

**Notes**
- The Serwist controller install handler appears to hang. Likely candidates: the `navigationPreload` activate event, or a `defaultCache` runtime handler awaiting a promise that never settles under Playwright's SW harness. Reproduce in a real browser to confirm scope — it may present differently in Chrome desktop vs. headless.
- Because the SW never activates, the guarantee "no accidental cross-domain leak" for scenario 20 is trivially satisfied but not for the right reason.

**Screenshot**: `iter2-consistency-shots/s17-verify-offline.png`

---

#### C2 — History heatmap grid does not include today

**Repro**
1. Seed `store.logs[today] = { …, derived_state: "green" }` via `localStorage.setItem("program.log.v2", …)`.
2. Load `/history`.
3. Query `document.querySelectorAll('[role="gridcell"]')` and read `title` attributes.

**Observed**
- Grid has 84 cells (12 weeks × 7 days), ending on the most recent Sunday. On Fri 7 Aug the last visible cell is `2026-08-02`, five days in the past.
- Today's activity is completely invisible in the heatmap — no cell exists for `2026-08-07`.

**Root cause**
`Heatmap.tsx:43-48` computes the grid start as `today - 83 days`, aligned **back** to Monday. That produces a grid ending on the Sunday of the week that started 83 days ago, not the Sunday of the current week. When today is not Sunday, the current week is chopped off.

**Fix sketch**
Anchor to the *end* of the current week (`today + (7 - jsDow) % 7` to reach Sunday) then walk `DAYS - 1` back — or replace with a rolling grid whose last column is the current week.

**Where**
`/Users/margussellin/www/program/next-app/src/components/charts/Heatmap.tsx:39-88`

**Screenshot**: `iter2-consistency-shots/s3-verify-heatmap.png`

---

### HIGH

#### H1 — `skipDay` after `moveSession` leaves orphaned scheduled_override

**Repro** (via reducer sequence)
```js
// Same date A, target date B
skipDay(A)                        // → skipped[A] = { reason }
moveSession(A, B, blockIds)       // → skipped[A] = { moved_to: B }; scheduled_overrides[B] = { blocks, reason: "moved from A" }
skipDay(A, "second reason")       // → skipped[A] = { reason: "second reason" }
                                  //   scheduled_overrides[B] REMAINS — orphan.
```

**Effect**
Week tab keeps showing the `moved-in` badge on date B even though the user cancelled the move by re-skipping A. `undoSkip` would clean it up, but plain `skipDay` doesn't.

**Where**
`/Users/margussellin/www/program/next-app/src/lib/useStore.ts:210-217` (`skipDay`), `352-362` (`moveSession`)

**Fix sketch**
Before writing `skipped[date]` in `skipDay`, look for a prior `moved_to` on that date and (if present) delete `scheduled_overrides[moved_to]` when its `reason === "moved from ${date}"`.

**Screenshot**: `iter2-consistency-shots/s4-week-moved-in.png` (baseline for what the "moved-in" state looks like)

---

#### H2 — Onboarding modal has no focus trap and does not close on Escape

**Repro**
1. Clear `program.onboarding.done` and `program.firstrun.dismissed` from localStorage.
2. Load `/`.
3. Onboarding modal renders. Verify:
   - Initial focus is on `<body>`, not the first focusable inside the dialog.
   - Tabbing works only because all interactive elements happen to be before other page content — there is no explicit trap.
   - Press Escape — the dialog stays open.

**Observed**
```json
{
  "initial focus": "BODY/Setup · 1 of 3How's the low back…",
  "escape closes dialog": false
}
```

**Where**
`/Users/margussellin/www/program/next-app/src/components/Onboarding.tsx:102-113`
- Declares `role="dialog"` + `aria-modal="true"` but does NOT call `useFocusTrap` (the utility is used by every other modal at `src/lib/useFocusTrap.ts`).

**Fix sketch**
Wire `useFocusTrap(panelRef, dismiss)` on the outer container and set `initialFocus` to the "Skip setup" button (or the first "0" grade button).

**Screenshot**: `iter2-consistency-shots/s15-verify-onboarding.png`

---

#### H3 — Coach chat history not shown when backend is "not configured"

**Repro**
1. Set `localStorage["program.coach.history.v1"] = JSON.stringify([{role:"user",content:"audit ping"},{role:"assistant",content:"audit pong"}])`.
2. Load `/coach` on prod (where `NEXT_PUBLIC_COACH_URL` is unset — currently the case).
3. Verify UI.

**Observed**
- Data persists in localStorage across reloads (confirmed).
- The rendered page shows only the "Coach backend not configured" block. Prior messages are hidden. No way to view or clear them from the UI.

**Where**
`/Users/margussellin/www/program/next-app/src/app/coach/page.tsx:125-127`
- The `!configured` branch replaces the entire chat surface with `NotConfigured` — no listing of past messages, no clear button when the trash-icon header condition (`messages.length > 0`) is true because the icon only appears in the header, which does render, but the messages themselves do not.

**Recommendation**
- Show a read-only conversation history + Clear button even when unconfigured, so users can review prior turns and clean up.

**Screenshot**: `iter2-consistency-shots/s9-verify-coach.png`

---

### MEDIUM

#### M1 — Heatmap issue for skipped days (subsumed by C2)

Same root cause as C2 — a skip on today's date does not render in the heatmap because today is off-grid. Cell state logic (`Heatmap.tsx:77`) correctly maps `skipped[date]` → state `"skip"`, but the cell for today does not exist yet, so the state has nowhere to appear.

**File**: `/Users/margussellin/www/program/next-app/src/components/charts/Heatmap.tsx:39-88`

---

#### M2 — Move/skip cancellation is inconsistent

Cancelling a move via Undo (`undoSkip` at `useStore.ts:314-350`) cleans up scheduled_overrides. Cancelling a move by pressing Skip again on the same day does not (see H1). Two paths, two behaviours. Users likely don't distinguish them.

**File**: `/Users/margussellin/www/program/next-app/src/lib/useStore.ts:210,314,352`

---

#### M3 — DateNav "next" button label mismatch with keyboard expectation

Not a real bug but noted for completeness: the arrow uses `aria-label="next day"` and moves `activeDate` forward by one day. Consistent with a11y patterns. No fix needed.

**File**: `/Users/margussellin/www/program/next-app/src/components/workout/DateNav.tsx`

---

### LOW

#### L1 — Four uses of native `window.confirm()` — inaccessible and unstyleable

Native browser confirm dialogs are used for:
- Wipe local log (`/data`)
- Import replace via file (`/data`)
- Import replace via paste (`/data`)
- Clear coach conversation (`/coach`)

**Where**
- `/Users/margussellin/www/program/next-app/src/app/data/page.tsx:87, 166, 216`
- `/Users/margussellin/www/program/next-app/src/app/coach/page.tsx:95`

**Recommendation**
- The codebase already has three custom sheets (`SkipSheet`, `MoveSheet`, `WeekSheet`) plus `ConfirmSheet` (defined but not used) in `SessionActions.tsx:191-266`. Reuse `ConfirmSheet` for these four confirmations to get consistent styling, focus trap, and Escape handling.

---

#### L2 — Video modal iframe caveat is not triggered in current data

Zero exercises in `/data/exercises.json` currently have `video_url`. All have `video_search` only, which renders a `<a>` link, not an iframe. The "does the iframe steal Tab focus?" concern from the audit checklist is moot for now. When `video_url` is added to any exercise, the iframe will need explicit handling (Tab keys forwarded to the YouTube embed cannot be intercepted from the parent frame).

**File**: `/Users/margussellin/www/program/next-app/src/components/workout/ExerciseCard.tsx:307-315`

---

## Confirmed passing

- S1 TM edit on Progress reflects in Today (tested with 115 kg, no stale 110 shown).
- S2 Red morning-check displays "Red-state morning check" banner + "reduces load by 10%" copy on today's Hero card and page banner (only shows for `activeDate === today` — future dates correctly don't show red modifier since red is per-date).
- S4 Move session shows `moved-in` badge on Week tab target date.
- S5 Skip today renders `skipped` badge + line-through label on Week tab.
- S6 Skip + shift renders `moved-in` on future days in same week.
- S7 Wipe from `/data` empties `logs`, `training_maxes`, `skipped`, `scheduled_overrides` — all tabs render empty state after wipe.
- S8 Progress/History are scoped to the actual store, not the DateNav position on Today.
- S10 Coach "not configured" placeholder renders correctly with 4-step setup instructions.
- S11-13 Skip/Move/WeekSheet modals: initial focus lands inside dialog, Tab stays within, Shift+Tab cycles, Escape closes, focus returns to trigger.
- S14 Video modal (with `video_search` only): opens, Escape closes, focus lands on Close button. iframe path is dead code in prod.
- S18 Offline write to localStorage persists; no sync-back on reconnect (correct — local-only app).
- S19 SW re-registers after manual `unregister()` + reload (attempted; timed out because of C1, but the mechanism in `ServiceWorkerRegister.tsx` re-runs on every mount).
- S20 Cross-domain state leak impossible by design (`program-f3r.pages.dev` and `program-v2.pages.dev` are separate origins).
- S21 Sets logged in order end up in `store.logs[date].exercises[key].sets` in insertion order.
- S22 (with reducer sequence) — the *shape* of `skipped[today]` is coherent after skip → move → skip; the *bug* is the orphan `scheduled_overrides[target]` (see H1).
- S23 Notes are per-exercise, not per-set — deleting a set has no set-scoped notes to strip. Consistent by design.
- S24 Clearing a TM to null: Today falls back to phase-based fallback ("No prior log. Start moderate: ~55% TM"). Progress shows blank TM row without crashing. Initial audit finding was a false positive — the "undefined" regex matched Next.js hydration script text, not visible UI.

## Notes on the earlier `iter2-findings.json`

An older `iter2-findings.json` exists in this directory from `iter2-logging.js`; it covers set-logging scenarios (1-28) and is unrelated to this iteration 2. Merged findings for cross-tab consistency live in `iter2-consistency-findings.json`.

## Screenshots

Full set under `iter2-consistency-shots/` — 33 images covering per-scenario captures and verification passes.
