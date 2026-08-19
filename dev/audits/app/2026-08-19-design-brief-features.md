# Four features, one story — F2 · F5 · F6 · F7

Owner: product-design-lead
Written: 2026-08-19
Status: draft — awaiting founder review
Related audits: `dev/audits/app/2026-08-19-master-task-list.md` (§E), `dev/audits/app/2026-08-19-gowod-visual-system.md`, `dev/audits/app/competitor-refs.md`
Blocks: Batch 23 (F2 + F5 + F7 co-ship), Batch 24 (F6 MoveSheet), Batch 25 (F1 extend hook into `/account`)

---

## Bottom line — the story that connects all four

The four features are the four **hand-offs** a Terav user meets after the intake wizard. F2 catches them the first time they land on Today; F5 catches them at the *end* of a block when the arc has done its job; F6 catches them every time they scan the week and want to shuffle without lying to the engine; F7 catches them when they finally need to *do* something to the account (delete, export, switch primary, change email). Ship the four together and you close every hand-off in the app besides the intake wizard itself. Ship them ad-hoc and each one bolts onto the wrong surface — the tutorial fires over graduation copy, retest hand-off has nowhere to send "take a break," MoveSheet writes overrides that graduated arcs still respect, `/account` re-implements Profile.

**The call, in one sentence per feature:**

- **F2** — a **one-shot, five-line hero card** at the top of Today on first Today-mount only, dismissable, that names the five tabs. Not a spotlight overlay. Not a modal. Not multi-step.
- **F5** — a **post-retest "Where you land" card** on Today (replaces the current GraduationCard flow at `page.tsx:692-888`) with four verbs — **Repeat this arc · Extend +N weeks · Take a break · Pick your next focus** — where "Take a break" and "Extend" are new, and the surface reads as *hand-off*, not "you finished, bye."
- **F6** — collapsed rows keep the Batch 15/20 shape; tap-row = expand; expanded row shows the block names + logs + a horizontal action row with three explicit verbs (**Open in Today · Move… · Skip**). MoveSheet is a bottom sheet listing the other six days with a one-line "why?" field so the engine gets an override reason.
- **F7** — `/account` is a **thin route** owning identity, email-change, program-switching (primary swap), Export, Delete. Profile keeps program *cards* + Guide + Sign out. Identity chip on Profile deep-links to `/account`.

The connecting thread: every one is confirm-first, every one is *reversible within a session*, none of them silently mutates state.

---

## F2 — First-run tutorial on Today

### The call

**One-shot hero card at the top of Today**, rendered above `ProposalStack` on the *first* mount of `/` after auth, dismissed by an "X" or by tapping "Got it — start the day." Same visual chassis as the existing `FirstRunBanner` (`next-app/src/components/FirstRunBanner.tsx:33-57`) — this feature is essentially FirstRunBanner promoted from "already exists but unloved" to "the first-run tutorial we've been talking about."

**Why hero-card, not spotlight overlay:**

1. **Confirm-first.** A spotlight overlay is an interstitial modal that grabs the whole screen and forces four+ dismisses to reveal the app. That is the *opposite* register of confirm-first. Rejected.
2. **Krug — if it needs explaining, it isn't done.** Terav's Today isn't complicated enough to warrant an overlay tour. Five tabs, one card explaining them, dismiss. The user teaches themselves the rest by tapping.
3. **Redundant with OnboardingRunner.** `OnboardingRunner` (`next-app/src/components/onboarding/OnboardingRunner.tsx:33`) is already the "app-is-unusable-until-dismissed" modal for scale-anchor / life-load / symptom-primer capture. Adding a *second* modal for "here are five tabs" replays the deleted-Batch-17 sin (two modals in sequence — session-audit backlog item B1).
4. **Persona coherence.** `persona-erratic` skims fast and closes anything modal on reflex. A hero card at the top of Today gets ~2 seconds of attention and is skipped harmlessly. A modal gets one aggressive dismiss + a slightly annoyed user before they ever see Today. `persona-recover` at 6am reading the same overlay reads it as friction, not help.

### Placement + trigger

- **Route:** Today (`next-app/src/app/page.tsx`).
- **Position in the render tree:** *above* the Day1EmptyState / HeroStateCard / ProposalStack region. Currently `FirstRunBanner` doesn't render in `page.tsx` at all — the component exists but was never mounted after the AppShell refactor. Fix: mount it in `AppShell` right below the OnboardingRunner (only on `/`) so ordering is: OnboardingRunner (if not dismissed) → FirstRunBanner (if not dismissed AND OnboardingRunner is done) → route content.
- **Trigger condition:** `hydrated && logsCount === 0 && tmCount === 0 && !localStorage["program.firstrun.dismissed"]`. Same as today's `FirstRunBanner:30-31`. Add one more gate: `&& !localStorage["program.onboarding.done.*"]` false ≡ OnboardingRunner has NOT run — otherwise F2 fires while the intake modal is still up.
- **One-shot:** once dismissed, never again. localStorage key `program.firstrun.dismissed` (already in place).
- **Skippable:** X icon top-right + "Got it — start the day" primary at bottom. Both write the same dismiss key.

### Content (5 lines + 1 tail)

```
+---------------------------------------------------------+
| Five tabs, one flow                                [X]  |
|                                                         |
| Today       — the session you're prescribed right now.  |
| Week        — the 7-day rhythm.                         |
| Progress    — training maxes, retests, trends.          |
| History     — every logged session, replayable.         |
| Profile     — account, active plans, menu.              |
|                                                         |
| More sits behind the ⋮ menu (top right):                |
| Programs · Check · Extras · Coach · Report · Guide.     |
|                                                         |
|                          [ Got it — start the day ]     |
+---------------------------------------------------------+
```

Copy is already in `FirstRunBanner.tsx:36-55` — keep it verbatim, only add the primary CTA at the bottom (the current banner has no primary; users only find the X). One line, one tap, one dismiss.

### Cross-persona coherence

| Persona | State on first Today mount | Holds? |
|---------|---------------------------|--------|
| `persona-recover` | Anterior-hip intake done → OnboardingRunner dismissed → FirstRunBanner renders above HeroStateCard | Yes — reads the tab map, then hits Check for morning symptoms |
| `persona-strength` | 5/3/1 fresh signup → OnboardingRunner dismissed → FirstRunBanner + a TM-bump proposal below | Yes — the card doesn't compete with the proposal, it's a header |
| `persona-erratic` | Signs up, dismisses OnboardingRunner mid-flow (already possible), lands on Today → FirstRunBanner | Yes — one tap to close, no lockout |

### Implementation notes (F2)

- `next-app/src/components/AppShell.tsx:109` — after `{isTodayRoute ? <OnboardingRunner /> : null}`, mount `{isTodayRoute ? <FirstRunBanner /> : null}`. FirstRunBanner already gates itself on logs/TM count so it won't leak onto non-fresh accounts.
- `next-app/src/components/FirstRunBanner.tsx` — add the primary "Got it — start the day" button below the `<ul>`. Reuse the mono-uppercase bronze button pattern used across `ProposalCard.tsx:136`. Keep the top-right X.
- No new schema. No new component file. Roughly **2h implementation** including a Playwright fresh-signup test that lands on Today + asserts the banner + dismisses + reloads + asserts the banner is gone.
- **→ delegate to `app-copy-clarity`** — the tail line "More sits behind the ⋮ menu" reads slightly awkward; ask copy for a shorter variant.
- **→ delegate to `app-accessibility`** — ensure the dismiss X has `aria-label="Dismiss five-tab tour"` and the whole card is inside a `<section aria-labelledby>` pointing at the "Five tabs, one flow" heading.

---

## F5 — Retest-week + end-of-block hand-off

### The call

**GraduationCard becomes the retest hand-off surface** — a single card on Today with a top row of retest metric deltas, then a *four-verb* action row. Everything that today reads as "you finished, pick another program" gets rewritten as "the arc did its job; here is what you do next." The four verbs are the future-scenario matrix; every retest hand-off state resolves to exactly one of these:

1. **Repeat this arc** — restart from today; keep intake + baselines.
2. **Extend +N weeks** — F1's target. Keep the arc going for N more weeks before the next retest window. Adds `extension_weeks: N` to `program_states[slug]`.
3. **Take a break** — a soft dismiss. Program stays in the list (not removed), but the current-arc rendering suppresses on Today. Adds `paused_at: dateISO` to `program_states[slug]`. Resumes with a Profile-row "Resume" chevron.
4. **Pick your next focus** — the existing `Browse programs` or `Next block` link. Removes the current program from Today; log history stays.

Three of these already exist in some form; the two new verbs are **Extend +N weeks** (F1) and **Take a break**. This is the design's key call: **Take a break is missing today and it is the correct answer for `persona-recover` post-retest** when hip pain is amber and the honest move is neither "restart" nor "quit." Without it, the user either lies to the engine (restart when they're not going to train) or drops out (remove program → log history feels lost).

### Sketches — collapsed vs expanded

**"You're at the end of the block" state (fires the Monday of the retest window):**

```
+---------------------------------------------------------+
| RETEST WINDOW OPEN                                      |
| End of Block 1 · Barbell reintro + Zone 1/2             |
|                                                         |
| You've logged 8 weeks. The retest catches whether the   |
| arc actually moved the numbers.                         |
|                                                         |
| Log these on Progress → Insights:                       |
|   · Front-squat 5RM              (baseline 92.5 kg)     |
|   · 5K time trial                (baseline 24:40)       |
|                                                         |
|              [ Log retest → ]     [ Not this week ]     |
+---------------------------------------------------------+
```

- Renders on Today for the week where cadence hits (existing `RetestReminder` at `page.tsx:1047-1088` already does the trigger math — extend it, don't rebuild).
- "Not this week" dismisses for 7 days. If the user hasn't logged by end-of-week, it reappears on Monday. No streak counter. No shame copy.

**Post-retest / graduation state (once all retest metrics have a current value OR the phase clock crosses the last phase's end):**

```
+---------------------------------------------------------+
| ARC COMPLETE                                            |
| Anterior Hip Rebuild · 34 weeks                         |
|                                                         |
| Where you landed:              [ 2/3 on track ]         |
|   Front-squat 5RM   112.5 kg   +20.0                    |
|   Groin pain (avg)  2.1        -3.4                     |
|   FADIR provoc.     mild       (was moderate)           |
|                                                         |
| What next?                                              |
|   [ Repeat this arc ]     Restart · keep intake         |
|   [ Extend +4 weeks   ]   Push the retest date          |
|   [ Take a break      ]   Pauses Today · stays in list  |
|   [ Pick next focus → ]   Browse or preview Block 2     |
|                                                         |
|                       Rate this arc  ★ ★ ★ ★ ☆          |
|                                                         |
|   End this program (destructive, quiet)                 |
+---------------------------------------------------------+
```

Notes on the sketch:

- Four verbs stack vertically because the copy on each right-hand caption disambiguates the state. Horizontal chip row (current implementation at `page.tsx:838-864`) collapses at 393 px and hides the caption; caption is the load-bearing "what does this do" affordance for a rare-frequency decision. Rejected the horizontal chip row.
- **Extend +N weeks defaults to +4.** Founder decision needed on whether to expose a stepper (`+2 / +4 / +6`) or keep it fixed. Recommendation: **fixed +4 for v1**, add a sheet with a 2/4/6/8 picker as F1 v2. Reasoning: the "how many weeks" question is a *proposal*, not user free-input — the engine can propose an extension length based on remaining phase runway. First cut, +4 gets us the affordance.
- Star rating stays where it is (`GraduationFeedback` at `page.tsx:890-...`); it's not a hand-off verb, it's data capture.
- "End this program" stays at the bottom, muted underline (matches current `page.tsx:866-872`).

### Data shape changes (F5)

```ts
// next-app/src/lib/schemas.ts — extend program_states value

type ProgramState = {
  // ... existing fields (tier, intake_answers, baseline_capabilities, started_at, graduated_at, graduation_feedback, phase_shift_days, reveal_seen)

  /**
   * F5 (Batch 23) — user chose "Extend +N weeks" at retest hand-off.
   * Adds N weeks to the phase timeline BEFORE the next retest fires.
   * Engine consumers: `activePhaseFor` in schedule.ts, retest cadence math
   * in RetestReminder + GraduationCard trigger.
   */
  extension_weeks?: number;

  /**
   * F5 (Batch 23) — user chose "Take a break" at retest hand-off.
   * Suppresses program from Today ONLY (still in Profile programs list,
   * still counts as active for /week if user wants to peek). Cleared when
   * user taps "Resume" from Profile.
   */
  paused_at?: string; // ISO date
};
```

Both fields are additive, both are consent-first writes (only on tap of the sticky action), both are reversible from Profile (Resume clears `paused_at`; Extend +4 shows on Today as a passive "Extended +4w · retest week 12" banner and can be undone within the session via a ConfirmSheet).

### Interaction contract (F5)

| Tap | Writes | Reversible? |
|-----|--------|-------------|
| Repeat this arc | `restartProgram(slug, today)` — existing, clears `graduated_at` | Only by taking action — confirm-first sheet before write |
| Extend +4 weeks | `extendProgram(slug, 4)` — NEW action | Yes — undo toast + Profile shows "extended +4w" pill |
| Take a break | `pauseProgram(slug, today)` — NEW action | Yes — Profile row shows "Resume" |
| Pick next focus | `removeActiveProgram(slug)` — existing | Confirm-first sheet |

### File-level implementation notes (F5)

- `next-app/src/app/page.tsx:692-888` (`GraduationCard`) — replace the current chip row (`:838-864`) with the vertical 4-verb stack. Add captions.
- `next-app/src/app/page.tsx:1047-1088` (`RetestReminder`) — extend to render the "retest window open" version of the sketch above, with `[ Log retest → ]` + `[ Not this week ]`. Persist a `retest.dismissed.<slug>.<isoweek>` localStorage key to gate re-appearance.
- `next-app/src/lib/useStore.ts` — add `extendProgram(slug, weeks)` (adds to `program_states[slug].extension_weeks`, `commitImmediate`), `pauseProgram(slug, dateISO)` (sets `paused_at`, `commitImmediate`), `resumeProgram(slug)` (deletes `paused_at`). Mirror the shape of `markGraduated` (`useStore.ts:970`).
- `next-app/src/lib/engine/schedule.ts` — `activePhaseFor` reads `extension_weeks` and shifts phase end-dates forward. This is the smallest engine touch that ships the affordance.
- `next-app/src/lib/engine/plan-generator.ts` — if `program_states[slug]?.paused_at` is set, return `[]` for `blocksForDate` on that program. Multi-track: other programs still render.
- `next-app/src/app/profile/page.tsx:236-253` — active-programs row shows a `paused` pill (mirror the `intake pending` pill at `:249`) and a `Resume` link inline. If `extension_weeks > 0`, show `extended +Nw`.

**→ delegate to `app-copy-clarity`** — verify captions ("Restart · keep intake", "Push the retest date", "Pauses Today · stays in list") don't drift into coach-speak.
**→ delegate to `app-visual-craft`** — the 4-verb vertical stack needs a hierarchy call: primary/secondary/secondary/tertiary weights, or all-equal? Recommendation: primary Repeat, then three tertiary bordered — matches Confirm-first accent economy.
**→ delegate to `app-accessibility`** — retest window state uses live-region announcement when it first appears? Probably yes; keep it polite, not assertive.

---

## F6 — Week collapse + MoveSheet full impl

### The call

Batches 15/19/20 shipped collapse-by-default + chevron + `px-4 py-4` padding + tap-to-expand. What's missing: the **expanded state's explicit action row**. Ship it as-designed in the GOWOD brief (§3.3) with **one refinement**: the primary "Open in Today" verb collapses to a passive "Today" chevron *link* when the day is already today (there is nothing to open — you are already there), and disappears entirely for future dates (there is nothing to open yet — the session doesn't exist).

The MoveSheet is a **bottom sheet, not a modal** (respect iOS HIG sheet semantics for a task the user is *inside a flow* to complete), listing the other six days of the current week + optional "next week" section, each with a tap-to-select radio, and a text field for `override.reason` (optional but recommended). Confirm-first: the sheet does NOT commit on tap-target-date. It commits on the sticky "Move session" primary at the bottom of the sheet.

### Sketches — collapsed, expanded, MoveSheet

**Collapsed row (already shipped, keep):**

```
● Wed 19 Aug ✓   Barbell reintro session          rest › (chevron)
```

**Expanded row (new — this batch):**

```
● Wed 19 Aug ✓   Barbell reintro session          rest ⌵
     Barbell reintro · Zone 1/2 steady-state
     Optional light CrossFit finisher.

     ✓ block pull midshin · 132.5 kg × 5
     ✓ 5.2 km run · easy

     ┌──────────────┬──────────┬──────────┐
     │ Open in Today│  Move…   │  Skip    │
     └──────────────┴──────────┴──────────┘
```

- Actions row: full-width, 3-col grid, `min-h-[44px]`. Primary = bronze fill on "Open in Today"; secondary bordered on "Move…" and "Skip".
- "Open in Today" is hidden when `isPast && !isToday` (the deep-link goes to `/history?date=...` instead — replace the button with a compact `History →` chevron link).
- "Move…" is hidden when the day is `skip`ped OR already `override`n today (in which case the button becomes `Undo move` / `Unskip`).
- "Skip" is hidden when the day is already skipped.
- Expand animates via `max-height` + opacity — motion-safe already handled.

**MoveSheet (new component `next-app/src/components/workout/MoveSheet.tsx`):**

```
┌─────────────────────────────────────────────────────────┐
│ Move Wed 19 Aug's session                          [X]  │
│ Barbell reintro session                                 │
├─────────────────────────────────────────────────────────┤
│ THIS WEEK                                               │
│  ○ Mon 17 Aug   Barbell reintro + Zone 1/2  (logged)    │
│  ● Tue 18 Aug   Rest day                                │
│  — Wed 19 Aug   ← moving from here                      │
│  ○ Thu 20 Aug   Barbell reintro + Block 1 retest        │
│  ○ Fri 21 Aug   Rest day                                │
│  ○ Sat 22 Aug   Rest day                                │
│  ○ Sun 23 Aug   Long aerobic (Z2)                       │
│                                                         │
│ NEXT WEEK                                               │
│  ○ Mon 24 Aug   Rest day                                │
│  ○ Tue 25 Aug   Barbell reintro + Zone 1/2              │
│                                                         │
│ Why? (optional)                                         │
│  [ Family thing came up_____________________________ ]  │
│                                                         │
│                              [ Move session → ]         │
└─────────────────────────────────────────────────────────┘
```

- Only "empty" days (Rest / no logged sessions) are radio-selectable. Days that already have a scheduled block show a warning caption on select ("This will stack two sessions on Thu — confirm you want that?") and require a second tap.
- "Why?" field is a plain text input, max 80 chars, stored in `override.reason`. Optional but the current schema already reads it into the row (`week/page.tsx:449-451`).
- Confirm-first: the sheet does NOT close on radio-tap. It closes only on "Move session" primary or the X.
- Undo: once moved, the source day row (Wed) shows "moved to Thu 20 · Undo" for the rest of the session. Refresh clears the undo affordance; the override persists (that's confirm-first — you already confirmed).

### Interaction contract (F6)

| Gesture | Where | Result |
|---------|-------|--------|
| Tap chevron on row | Any collapsed day | Expand that day; collapse the previously expanded day |
| Tap row body (not chevron) | Any collapsed day | Same as chevron — expand |
| Tap "Open in Today" | Expanded today row | Route to `/` |
| Tap "Open in Today" | Expanded past-day row | Hidden; replaced with `History →` chevron link |
| Tap "Open in Today" | Expanded future-day row | Hidden |
| Tap "Move…" | Expanded row with a session | Open MoveSheet |
| Tap "Skip" | Expanded row with a session | Open ConfirmSheet "Skip Wed's session?" |
| Long-press | Anywhere | No-op (deferred, may become "quick move" later) |
| Swipe-left | Anywhere | No-op (R7 rejected; MoveSheet is the intended alternative) |
| Tap radio in MoveSheet | Empty day | Select target day; enable "Move session" primary |
| Tap radio in MoveSheet | Day with existing session | Select + show warning; require second tap to confirm |

### File-level implementation notes (F6)

- `next-app/src/app/week/page.tsx:399-493` — the current `<button>` wrapping the row is already the tap-to-expand affordance. Add the 3-col action grid *inside* the `{isExpanded ? (...) : null}` block at `:447-492`, below the runs+top-lift section. Move the button out of wrapping the entire content — right now everything is inside one `<button>` which will nest interactive children (the action buttons) inside a button — a11y violation. Refactor: the row is a `<div>` with the day-header + chevron area as the actual `<button aria-expanded>`, and the expanded content is a sibling `<div>` not nested inside.
- **New file:** `next-app/src/components/workout/MoveSheet.tsx` — mirror `ConfirmSheet.tsx` shape (portal + focus trap + `overscroll-behavior: contain` + iOS body-scroll-lock per P1-17). Slot for the day list + why-field + primary CTA.
- `next-app/src/lib/useStore.ts` — new action `moveSession(fromDate, toDate, blockIds, reason)`. Writes to `scheduled_overrides[toDate]` and adds a skip-record on `fromDate` with `moved_to: toDate`. Mirror `skipDay` shape.
- `next-app/src/lib/engine/plan-generator.ts` — verify the `override` path already handles multi-block moves. It does (see `week/page.tsx:283-289`) — this is a wiring change, not a schema change.
- **E2E test:** `next-app/tests/e2e/week-move-session.spec.ts` — mount Week → expand Wed → tap Move → select Thu → type reason → tap primary → assert Wed shows "moved to Thu · Undo" AND Thu shows "↳ Moved-in session · Family thing came up".

### Cross-persona coherence (F6)

| Persona | Interaction | Holds? |
|---------|-------------|--------|
| `persona-recover` | Amber morning → expands Wed → taps Move → picks Fri → reason "hip flared" | Yes — engine reads reason into `override.reason`, surfaces in Week |
| `persona-strength` | Wants to move Thu deadlift to Fri because of a work meeting | Yes — one flow, two taps, done |
| `persona-erratic` | 15 skips, wants to *undo* the skip on Fri (moved to Sat) | Partial — "Undo move" on the collapsed Fri row → clears both override and moved_to. Ship this in the same batch |

**→ delegate to `app-mobile-ux`** — verify MoveSheet radio-row tap targets are 44×44 min, and that the "Move session" primary sits above the safe-area inset.
**→ delegate to `app-accessibility`** — MoveSheet uses `role="dialog" aria-labelledby aria-modal="true"` + focus trap. Radios are grouped in a `<fieldset>` with a legend "Pick a new day."

---

## F7 — `/account` deep-link route

### The call

**`/account` is a thin route** (one page, one component) that owns identity + destructive/rare actions. Profile stays a switchboard focused on **programs + Guide + Sign out** — the things a returning user needs frequently. The identity chip on Profile deep-links to `/account`.

### What lives where — the IA table

| Surface | Item | Rationale |
|---------|------|-----------|
| **Profile** (`/profile`) | H1 · Identity chip (tap → `/account`) · Your programs list · More (Guide, Coach if configured, Add to home screen) · Sign out · Legal footer | Frequent-use switchboard. Everything on this screen is a **navigation** action, not a data-mutating action. |
| **/account** | H1 "Account" · Identity chip (read-only) · **Email** row (tap → change-email flow, deferred) · **Primary program** row (tap → picker sheet, if user has 2+ active programs) · **Data & privacy** section (Export my data · **Delete my account**) · Legal footer link | Rare, high-consequence actions. Users get here by tapping their identity chip on Profile. |
| **ConfirmSheet** (existing) | Sign out · Delete · Remove program | Every destructive verb lands in a ConfirmSheet. No plain `window.confirm`, no unguarded button. |
| **Program page** (`/programs/[slug]`) | Remove *this* program · Switch to primary | Program-scoped destructive lives on the program's own page — mirror pattern. |

**What NOT to add to `/account`:**

- Program-switching from `/account` when the user has only ONE active program. Then it's not an account concern; it's a Programs concern. Hide the row unless `activeSlugs.length >= 2`.
- Notification settings, theme toggles, unit prefs. None of these ship in Batch 23 — the point of F7 is to give Delete a real home, not become a settings dumping ground.
- Coach chat toggle. If Coach is env-var-gated (S1), don't surface it here.

### Sketch — `/account`

```
+---------------------------------------------------------+
| ‹ Profile                                               |
|                                                         |
| Account                                                 |
|                                                         |
| ┌───────────────────────────────────────────────┐       |
| │ ⚫ S   sellinmargus@gmail.com          STAFF │       |
| │        joined Aug 2026                        │       |
| └───────────────────────────────────────────────┘       |
|                                                         |
| SIGN-IN                                                 |
| ┌───────────────────────────────────────────────┐       |
| │  Email       sellinmargus@gmail.com        › │       |
| └───────────────────────────────────────────────┘       |
|                                                         |
| PROGRAMS (only shown when ≥ 2 active)                   |
| ┌───────────────────────────────────────────────┐       |
| │  Primary program   Anterior Hip Rebuild    › │       |
| └───────────────────────────────────────────────┘       |
|                                                         |
| DATA & PRIVACY                                          |
| ┌───────────────────────────────────────────────┐       |
| │  Export my data                              › │       |
| ├───────────────────────────────────────────────┤       |
| │  Delete my account                    (red) › │       |
| └───────────────────────────────────────────────┘       |
|                                                         |
| Privacy · Terms · Medical disclaimer                    |
+---------------------------------------------------------+
```

- Top-left back chevron routes back to `/profile` (respects browser history where applicable — Next.js `router.back()` with a fallback to `router.push("/profile")`).
- Email-change is a deferred detail — the row exists as a placeholder chevron, tapping it opens a ConfirmSheet with "Email change ships soon. Contact sellinmargus@gmail.com to swap addresses in the meantime." That's fine for v1 — it's discoverable, not fake.
- Delete lives here **exclusively**. Remove it from the Profile footer's "Danger zone" disclosure (`profile/page.tsx:369-390`). No more disclosed-secondary-location.

### Interaction contract (F7)

| Tap | Where | Result |
|-----|-------|--------|
| Identity chip on Profile | Profile | Route to `/account` |
| Back on `/account` | `/account` | `router.back()` → Profile |
| Email row | `/account` | Placeholder ConfirmSheet (deferred change flow) |
| Primary program row | `/account` (only if ≥ 2 active) | Opens picker sheet — same picker pattern F3 shipped in Batch 22 |
| Export my data | `/account` | Existing `exportMyData()` handler (`profile/page.tsx:52-64`), moved into `/account` |
| Delete my account | `/account` | Existing `confirmDelete` flow (`profile/page.tsx:66-99`), moved into `/account` |

### File-level implementation notes (F7)

- **New file:** `next-app/src/app/account/page.tsx` — client component, ~200 lines, imports mirror `profile/page.tsx` (createClient for email, useStore for programs, ConfirmSheet). Roughly a **copy-paste of the identity-chip block + Delete flow from `profile/page.tsx`**, refactored into the layout above.
- `next-app/src/app/profile/page.tsx:159` — wrap the identity chip `<div>` in a `<Link href="/account">` so the whole chip is tappable. Add a `<ChevronRight size={16} className="text-muted flex-shrink-0" />` at the right edge of the chip (mirror the program-row chevron pattern at `:255`). Remove the "Danger zone" `<details>` block at `:369-390` — Delete is no longer on Profile.
- `next-app/src/app/profile/page.tsx:52-99` — leave `exportMyData` and `deleteAccount` in-place for now; the `/account` route imports them by extracting into a shared hook (`useAccountActions`). Alternative: cut+paste to the new file. Recommendation: **extract into `next-app/src/lib/account/actions.ts`** — smaller diff, cleanly testable.
- **Route metadata:** `/account` sets a `<title>Account — Terav</title>` and appears in the `HeaderQuickLinks` more-menu (the ⋮) as a fallback nav path. Not in BottomNav.

### Cross-persona coherence (F7)

| Persona | Reads `/account` as | Holds? |
|---------|--------------------|--------|
| `persona-recover` | Rarely visits — but Delete + Export are here when they need them, one hop from identity chip | Yes |
| `persona-strength` | Multi-program (5/3/1 + Engine Builder) → "Primary program" row is *useful*, not vestigial | Yes |
| `persona-erratic` | Rage-quit user — Delete lives *behind two taps* (identity chip → Delete → ConfirmSheet), not one. Structural friction, not shame copy | Yes — this is the fix the GOWOD brief pre-figured |

**→ delegate to `app-copy-clarity`** — "SIGN-IN" section header vs "Email" row inside it: verify the labels don't read redundant. Recommendation: drop the section header, use "Email" as the row name directly, and add a compact caption `Sign-in address` below the value.
**→ delegate to `app-accessibility`** — new route needs `<main>` landmark, `<h1>` visible, focus-restore-on-back-nav pattern (Next.js handles most of this).
**→ delegate to `app-visual-craft`** — the section headers ("SIGN-IN", "PROGRAMS", "DATA & PRIVACY") reuse the 10 px mono-uppercase-muted label pattern the GOWOD brief §1.4 established. Verify contrast.

---

## Cross-feature coherence — where the four features touch

1. **F5 Graduation → F7 `/account` extension flow.** When a user taps "Extend +4 weeks" on the GraduationCard, the write hits `program_states[slug].extension_weeks`. That field is read by three surfaces: Today (retest-window trigger math), Week (phase banner), and — this is the coherence question — Profile's active-programs row. Recommendation: Profile shows `extended +4w` as a pill next to the tier chip (`profile/page.tsx:243-247`), tap = deep-link into `/account` where the user can undo the extension. Do NOT put an "undo extension" button on Today; the graduation card should stay clean and celebratory.

2. **F5 Retest → F6 MoveSheet.** During the retest window (F5's first sketch), the user may want to move Thu's retest session to Sat because of a schedule conflict. The F6 MoveSheet handles this natively — the retest reminder does not need its own reschedule affordance. **Constraint:** if a moved day was the *retest day*, the RetestReminder trigger math (which currently reads Monday-of-week) must respect the override. Fix: `RetestReminder` reads `overrides` for the current week to shift its "log retest" trigger. Add to Batch 24 with F6.

3. **F2 First-run banner → Week vs Today.** The banner sits on Today only. The Batches 15/19/20 chevron affordance on Week is *already* discoverable — persona-erratic finds it in <3s. Don't add a second "here's how Week works" tour. If the founder wants to reinforce, add one 12-word caption under the Week H1 for first-run users only (`logsCount === 0`): "Tap a day to see the session or move it." Delete once user has logged one session. **Recommendation: skip this for Batch 23; revisit if persona harness shows discovery failure.**

4. **F7 `/account` → F5 pause flow.** When a program is `paused_at`, Profile shows "Resume" and `/account` doesn't need to do anything — pause/resume is a Profile concern, not an Account concern. Keep them separate. The rule: **program-state actions live on Profile; identity-state actions live on /account.**

---

## Batching recommendation

**Batch 23 — the coherent hand-off ship (6-10h):**

- F2 (2h) — FirstRunBanner mount + primary CTA + Playwright test.
- F5 partial (3-4h) — GraduationCard 4-verb refactor + `extendProgram` + `pauseProgram` + `resumeProgram` store actions + Profile "paused" pill + Resume affordance. **Skip the retest-window `[ Not this week ]` dismiss for Batch 23 — ship in Batch 24 alongside the MoveSheet override wiring.**
- F7 (2h) — new `/account` route + identity chip Link wrap on Profile + Delete/Export move + extract `useAccountActions` hook.

Ships together because: they all touch small, independent surfaces (banner, GraduationCard, new route). None of them require the MoveSheet component to exist. Total: **~7-8h, medium confidence**. All three land in one push, one deploy, one E2E validation pass.

**Batch 24 — the MoveSheet + retest-window ship (8-12h):**

- F6 full (6-8h) — MoveSheet component + Week expanded action row + `moveSession` store action + E2E tests.
- F5 remainder (2h) — RetestReminder "Not this week" dismiss + override-aware retest trigger + retest window sketch on Today.

Ships together because: RetestReminder cross-references the override map that MoveSheet writes. Shipping them apart risks the trigger going stale for users who move their retest day. Total: **~10-12h, medium confidence**.

**Why not one megabatch?** Because Batch 23 can land Friday, Batch 24 can land the following Monday, and the interim ~48 hours give the persona harness (A4 blocked) a chance to be re-run against Batch 23's changes before Batch 24 introduces new surface. Respects the "no UI churn between audits" rule.

**F1 extend-by-N-weeks (M size, mentioned but not yet decided):** ships **inside Batch 23 as part of F5** via the `[ Extend +4 weeks ]` verb. The stepper picker (2/4/6/8) is Batch 25.

**F8 CSM amber-week + F9 skill/mobility logging:** unchanged from master list; not touched by this brief.

---

## Rejected alternatives

1. **F2 as spotlight overlay tour** — rejected. Modal register wrong for confirm-first. Replays deleted-Batch-17 double-modal sin.
2. **F2 as a per-tab bottom-nav dot pulse** — rejected. Gamification-adjacent; violates R5. Also fights the Batch 19 P1-8 active-tab indicator work.
3. **F5 as a horizontal 4-chip action row** — rejected. Collapses at 393 px; captions are load-bearing for a rare-frequency decision.
4. **F5 without "Take a break"** — rejected. Then `persona-recover` at amber post-retest has to lie to the engine (Repeat) or drop out (End). Both are worse for retention AND for the log integrity.
5. **F5 with a numeric weeks stepper on first ship** — rejected. Speculative; +4 covers the common case; add stepper in Batch 25 if founder or telemetry demands.
6. **F6 swipe-left to Move** — rejected explicitly by R7 (breaks confirm-first) and by the founder-brief 2026-08-19 §3.4 (Krug: hidden-gesture-only violates discoverability).
7. **F6 long-press to Move** — rejected. Same as swipe-left; also a discovery cost with no visible affordance.
8. **F6 MoveSheet without a "Why?" field** — rejected. The engine already reads `override.reason` into Week's expanded state (`week/page.tsx:449-451`); dropping the field means every moved session shows a blank `↳` line. Optional-with-suggestion is the compromise.
9. **F7 `/account` as a settings hub with theme + units + notifications** — rejected. Scope creep. Batch 23 delivers Delete's real home; every future setting earns its own row on its own audit.
10. **F7 Delete on both Profile "Danger zone" AND `/account`** — rejected. Two locations for a destructive action is the ambiguity that made the original Profile footer feel weird. One location.
11. **All four features in one megabatch** — rejected. ~15-20h is too big for a single ship; harness re-run cadence needs breathing room; F6's MoveSheet has the biggest interaction-surface unknown and deserves its own deploy.

---

## Files touched summary

- `next-app/src/components/AppShell.tsx:109` — mount `FirstRunBanner` conditionally on Today (F2).
- `next-app/src/components/FirstRunBanner.tsx:33-57` — add primary CTA "Got it — start the day" (F2).
- `next-app/src/app/page.tsx:692-888` (`GraduationCard`) — rewrite action row to 4-verb vertical stack with captions (F5).
- `next-app/src/app/page.tsx:1047-1088` (`RetestReminder`) — extend to render the "retest window open" state with dismiss + override-aware trigger (F5, Batch 24 remainder).
- `next-app/src/lib/schemas.ts:1200-1229` — add `extension_weeks?: number` + `paused_at?: string` to `ProgramState` (F5).
- `next-app/src/lib/useStore.ts:970-1026` — add `extendProgram`, `pauseProgram`, `resumeProgram`, `moveSession` actions (F5 + F6).
- `next-app/src/lib/engine/schedule.ts` — `activePhaseFor` reads `extension_weeks` (F5).
- `next-app/src/lib/engine/plan-generator.ts` — `blocksForDate` returns `[]` for paused programs (F5).
- `next-app/src/app/profile/page.tsx:159-187` — wrap identity chip in `<Link href="/account">` + append chevron; remove "Danger zone" disclosure at `:369-390` (F7).
- `next-app/src/app/profile/page.tsx:236-253` — add `paused` + `extended +Nw` pills to program rows; add "Resume" inline link on paused rows (F5).
- **New:** `next-app/src/app/account/page.tsx` — thin route hosting identity + email + primary-program picker + Export + Delete (F7).
- **New:** `next-app/src/lib/account/actions.ts` — extract `exportMyData` + `deleteAccount` into a shared hook (F7).
- **New:** `next-app/src/components/workout/MoveSheet.tsx` — bottom sheet listing candidate days + reason field + primary Move CTA (F6, Batch 24).
- `next-app/src/app/week/page.tsx:399-493` — refactor row nesting to unwrap the `<button>` around interactive children; add 3-col action grid inside the expanded block (F6, Batch 24).
- **New:** `next-app/tests/e2e/week-move-session.spec.ts` — E2E for expand → move → verify override rendering (F6, Batch 24).
- **New:** `next-app/tests/e2e/graduation-hand-off.spec.ts` — E2E covering the 4-verb GraduationCard actions including Take a break + Resume (F5, Batch 23).

---

## What this decision does NOT solve

- Email-change flow inside `/account` — placeholder ConfirmSheet only for v1. Real change-email is deferred to a follow-up brief.
- Notification / theme / unit settings — `/account` is deliberately scoped to identity + data-privacy; a settings hub is a future brief.
- F1 stepper (2/4/6/8 weeks for Extend) — Batch 25.
- F8 CSM amber-week drop-4×4 hook and F9 skill/mobility logging in simulator — untouched by this brief.
- Coach chat productionization (S1) — separate founder decision.
- Retest window when a user has *no* baseline (empty `baseline_capabilities`) — the current GraduationCard already shows "No retest metrics recorded"; the retest-window sketch inherits that fallback. If the founder wants a richer "capture baselines late" flow, that's a Batch 25+ brief.
- `/account` as a landing surface for future post-purchase (Paddle) settings — S3 gates that.

---

## Estimated implementation cost

- **Batch 23 (F2 + F5 partial + F7):** 7-8h, high confidence. Two small components, one new route, one store extension. No new interaction surface.
- **Batch 24 (F6 full + F5 remainder):** 10-12h, medium confidence. MoveSheet is the only real interaction unknown. E2E test surface is non-trivial.

Total across the two batches: **17-20h** to close all four features cleanly. If the founder wants a smaller first bite, Batch 23 alone answers the retest hand-off (the highest user-impact gap) and gives Delete a home — both of which are visible-in-the-first-week wins.
