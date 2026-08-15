# Persona 1 — Anterior hip rebuild, fresh user

## Persona recap

I am a 38 y.o. lifter, 6 years training, 2 years CrossFit. Anterior-hip / groin
irritation flared 4 months ago and my physio cleared me to try structured strength.
I found `anterior-hip-rebuild` by direct URL (it is `personal: true` — not in the
public catalog) and I need to decide if I trust this thing enough to run 34 weeks.

## Blockers

**B-1. Program marked `personal: true` but I can still start it, with no gate.**
`ProgramPreviewClient.tsx:159-165` shows one italic disclaimer ("Authored for one
specific clinical context… Use only if your situation resembles the author's") but
the CTA is a live "Start this program" button. There is no confirmation modal, no
"my situation resembles" checkbox, no "this is not for you" fork. For a fresh user
who arrived via a shared link, this is the biggest safety failure in the app —
they can start Margus's shoulder-instability + Bertolotti + L5 pseudoarthrosis
program without ever seeing those constraints. The disclaimer needs to be a
one-tap acknowledgement, not italic body text below the fold.

**B-2. Hip program has no `intake`, so the Reveal card renders effectively blank.**
`anterior-hip-rebuild.json` has no `intake` block. In
`ProgramPreviewClient.tsx:84`, `routeThroughIntake = hasIntake`, so hip goes
straight to Today. Then `YourPlanCard` calls `buildRevealCopy(program, undefined,
undefined, undefined)` — `reveal-copy.ts:36` yields
`headline = "Your Anterior hip + strength rebuild plan is built."`,
`schedule_line = "Weekly rhythm shown in Week view."` (fallback because there is
no `days_per_week`, no `modality`), `tier_line = "Adapts as you log."` and
`attribution_line = "Adapts as you log every session."` — same string twice, with
no personalisation content whatsoever. The card promises "Your plan" and then
delivers a generic paragraph. This is the flagship first-run moment and it is
empty on the flagship program.

**B-3. TMs default to nothing and the user has no idea what to enter on day 1.**
The program declares `starting_values_kg.back_squat_highbar = 110`
(`anterior-hip-rebuild.json:284-289`) as an informed guess. But `ProgressPage`
seeds nothing — `store.training_maxes[id]` is empty. So on the first Today
render, `ExerciseCard` cannot compute a suggested load. There is no on-boarding
that says "we've pencilled you in at 110 kg squat / 130 kg pull, adjust or run
week 1 as a ramp" — the numbers exist in the JSON, they just never surface. A
first-time user opens Today, sees the exercise cards, and is stranded.

## Bugs

**BUG-1. FirstRunBanner claims "Nothing sent anywhere" while the store
auto-syncs.** `FirstRunBanner.tsx:40-42`: "The app runs entirely on your device.
Nothing sent anywhere." But `useStore.ts:5,13` explicitly calls
`pushRemoteDebounced(s)` on every save (and there is a signed-in session on
Supabase). For an unauthenticated first-run this is technically true; for the
common case (I sign up first, then land on Today) it is misleading. Either scope
the claim ("stays on your device unless you sign in") or remove it.

**BUG-2. Hip check due signal fires on day 1 with confusing copy.**
`AssessmentDueBanner.tsx:19-27`: when `status.lastDate == null` the headline is
"First hip check" and the sub-line says "Six short self-tests…". But in
`SignalsStrip.tsx:91-94`, the top-line label for a due assessment is "Monthly hip
check due" — for a user who has never opened the app, "monthly" is not accurate.
It's a first-time onboarding step, not a monthly recurrence.

**BUG-3. Reveal card shows phase names but tier line lies.**
`reveal-copy.ts:48-51`: because hip has no `plan_tiers`, `tier_line` falls back
to "Adapts as you log." That is a slogan, not information — and it is the same
sentence as `attribution_line`'s fallback. Two consecutive lines say the same
thing.

**BUG-4. `check-overdue` signal fires on the same day the user is about to do
their morning check.** `SignalsStrip.tsx:99-125` checks that today has no
`derived_state` AND there is a strength session today AND last check ≥ 3 days ago
(or never). "Never" fires on day 1 the moment the user opens Today — before they
have had any chance to log a check. So a brand new user sees "Morning check
overdue" as an amber banner on their first ever Today view. Grace period should
be ≥ 1 day of app usage.

**BUG-5. `blocksForDate(...)` called without `byId` in `SignalsStrip.tsx:103`.**
`plan-generator.ts` signature accepts an optional `byId`; here the call passes
only 4 args. Works, but inconsistent with `page.tsx:113` where `byId` is passed.
Low severity.

## UX gaps

**UX-1. 34 weeks is huge and the app never gives me a "you are here" map.**
Today shows "week N of M · ends dd Mon" for the current phase (`page.tsx:130-136,
372-384`). But there are 7 phases spanning Aug 2026 → beyond Apr 2027. Nowhere
does the app show me phase 3 of 7, or a horizontal timeline of where I sit in
the year. Milestones on Progress get me lift-by-lift, but no phase-level view.
At week 10 (phase 3 cycle 2), I have no way to see "how far in am I? how much
more?" without opening the program JSON.

**UX-2. Signals strip collapses hip-critical signals under a single amber pill.**
`SignalsStrip.tsx` folds every signal into one collapsed pill titled by the first
signal. Order matters: for a fresh hip user, we're likely to get "First hip
check" (slate) + "Morning check overdue" (amber) + "Reintro readiness" (later,
slate). The dominant-tone pill's primary label is the first item in the list,
not the strongest signal. If red-state ever coincides with hip-check-due, the
red is the border colour but the text is whatever came first in `list`. Tap
target is correct; the informational hierarchy is not.

**UX-3. `/check` and `/check/hip` are two different flows with no cross-link.**
`/check` is the daily 0-10 sliders; `/check/hip` is the monthly 6-item
self-scored pack. From `SignalsStrip` and `AssessmentDueBanner`, "Monthly hip
check" points to `/check/hip`. But on `/check`, there is no link to "the other
one" and no explanation that these coexist. A new user could easily do the
morning-check and think they are done with "hip stuff".

**UX-4. Skip session — copy claims "trajectory continues" but does not say what
that means.** `SessionActions.tsx:304-306`: "No TM change. Streak pauses but
doesn't break. Trajectory continues from your last completed session." OK — but
if I am in reintro (block_reintro), which is week-driven by `phase.starts`
(`schedule.ts:210-219`), a skip does not shift `phase.starts`. So skipping day 5
of week 1 means when I open Today on day 6, I'm still on week 1 by calendar.
That is actually fine, but the copy makes no distinction between calendar-drive
and progression-drive. A hip user needs to know: this program is calendar-locked
in Phase 1 (race prep date), and calendar-loose in Phases 2+.

**UX-5. Move session date picker allows moving into the past.**
`SessionActions.tsx:396-401`: `<input type="date" min={iso(new Date())}>` — but
`iso(new Date())` is only computed once when the picker renders, and it uses the
device's date without offset guarantees. Cosmetic; the `moveSession` action does
not validate.

**UX-6. "Whole week" skip in `SessionActions.tsx:118-189` slides the week — but
during Phase 1 (`phase_1_rebuild_evaluate`, gated by dates), this may push
`block_evaluate` outside the phase window entirely, leaving the eval session
orphaned. Nothing in the confirmation copy warns the user.

**UX-7. Report page range presets default to 12w. On day 1, 12w is empty — I
get "No symptom or load data in this range." on every section, which is a very
sad first impression. Default `all` on new accounts.

## Copy issues

**COPY-1. Guide `/guide/page.tsx:107-110` — Coach tab.** "AI training coach
that reads your full log, TMs, milestones, and clinical context each turn."
This is present-tense on a page describing "How to use the tabs" — but the coach
page renders "Coming soon" (`coach/page.tsx:258`). Guide describes what will
exist, coach page admits it doesn't. Fix by adding "(beta — see Coach tab)".

**COPY-2. `NoActiveProgram` (`page.tsx:230`)** — "Every athlete has one thing
that's holding them back." That is a very confident marketing claim and it does
not match brand voice ("Direct. No hype."). A cleaner alternative:
"Pick a program. Each is calibrated to your baseline once you finish the
intake."

**COPY-3. Programs footer (`programs/page.tsx:138-139`):** "Have a weakness you
don't see here? Tell me (Data → feedback)." — "me" first person breaks brand
tone. Also there is no "feedback" affordance on /data — that's a broken
callout.

**COPY-4. Program card meta on `/programs`** shows `personal` badge for
anterior-hip but the description "For lifters with a history of…" reads as if
it were universal. The `personal` badge title tooltip
(`programs/page.tsx:173`) says "Authored for one specific user's clinical
context. Not a general-purpose evidence-backed program." That warning should
show as a subheading on the card, not as a tooltip only.

**COPY-5. HeroStateCard / SignalsStrip red-state copy** (`SignalsStrip.tsx:192-203`)
says "The plan reduces load by 10% today, but skipping is a valid — often better
— call." That is well-written and I flag it as a positive. But when there is no
plan yet (day 1, no TMs), "reduces load by 10%" is nonsense because there is no
load to reduce from. The message should be conditioned on TMs existing.

**COPY-6. Extras page tone slip** (`extras/page.tsx:47-50`): "Accessory work,
home rehab, around-runs." The list omits Oxford commas inconsistently across
the app. Minor.

**COPY-7. `data/page.tsx:192`:** "Wiping affects only this browser — your
synced data on the server is untouched." This is the truthful counterpart to
BUG-1 in the FirstRunBanner. Inconsistency in what the app says about privacy
depending on which page you land on.

**COPY-8. Reveal card fallback (`reveal-copy.ts:47`):** "Weekly rhythm shown in
Week view." — for a fresh hip user, this is the only concrete sentence they
see. It reads like a stub. Even a hip-specific line like "4 leg sessions/week —
2 squat, 1 pull, 1 variant/unilateral" would land 100× better and is derivable
from `weekly_template.week`.

## Visual / graph issues

**VIS-1. Report page hip check table** — the `<table>` at `report/page.tsx:332-375`
has 7 name-truncated columns (`.slice(0, 24)`). On iPhone SE (375 px), even the
mobile card variant (`report/page.tsx:291-330`) puts 2 columns of dt/dd side by
side, and question labels are also truncated to 22 chars. So "Hanging leg
raise — click during the lowering phase" becomes "Hanging leg raise". This is
the specific test that matters most in the hip workup; truncating it kills the
signal.

**VIS-2. HipProgressTile sparklines** (`HipProgressTile.tsx:139-153`) render a
CSS-bars sparkline with `bg-line-soft/40` when there are zero points. Silent
empty state. A first-time user seeing this on Progress → Hip has no idea if
the box is broken or intentionally empty.

**VIS-3. Milestone progress bar** in `progress/page.tsx:541-583` — 14 milestones
in a single row of ticks with `w-px` dividers. At iPhone SE, the ticks are
~2 px apart. Illegible. Consider collapsing to 5-6 major milestones or using
a vertical timeline.

**VIS-4. Symptom-vs-load chart on `/progress` → Insights** loads Recharts (`~112 kB gz`
per the code comment `progress/page.tsx:18`) just to render "no data" at N=0.
`SymptomLoadChart` isn't gated on `days.length > 0` in the tab body (`page.tsx:290-294`)
— it is on Report page but not on Progress. Loads 112 kB for nothing.

**VIS-5. Report print stylesheet** (`report/page.tsx:561-599`) hides `.fixed`
which is the modal / drawer overlay. Good. But it does not force
`page-break-inside: avoid` on the mobile hip-check card `<ul>`, so if the
user has 4-5 check entries they may split across pages. Minor.

**VIS-6. Signals strip primary label truncates on narrow screens** — `truncate`
class on `p.text-[14px]` (`SignalsStrip.tsx:171`) collapses "First hip check
(never logged)" to "First hip check…". Since this is the main information,
consider two lines or a smaller font.

## Sub-tab findings — Progress: Lifts / Hip / Insights

**Lifts (empty)** — TM editor renders correct, milestone table renders correct;
but with no TMs, `MilestoneLiftGroup.tsx:389-393` shows `TM —` and `next 120 kg
in 45d`, plus `overallPct = 0`. Progress bar is empty — no way to tell whether
"empty" means "not started" or "you're falling behind". Add a "Set your TM to
see progress" affordance right on the empty bar.

**Hip (empty)** — the tile at `HipProgressTile.tsx` has three cards:
Monthly check ("Not logged yet."), Symptom trend ("Nothing logged. Do the
morning check on Today to start the line."), Rehab adherence ("0/30 · 0%"). The
Symptom trend copy is best; the Monthly check copy is worst ("Not logged yet"
with no CTA); the Rehab card shows `0%` with a bronze-empty bar, which reads
as failure rather than emptiness. All three empty states should link out with a
consistent CTA — "Log your first hip check" / "Log a morning check" / "Do
today's rehab block".

**Hip (filled)** — with data, the "vs last" delta (`HipProgressTile.tsx:73-82`)
gets colour-coded green if delta < -0.3, red if > 0.3. Direction is right
(better = lower). But the delta text `+0.4 vs last` on red for a hip user seeing
one check-in after months of quiet is going to feel alarming. Add a floor —
require ≥ 3 datapoints before colour is applied. Otherwise noise vs signal.

**Insights (empty)** — `WeeklyNarrativeTile` on empty state renders week 0. The
symptom-vs-load chart is loaded lazily and shows the loading placeholder even
when there's no data. Adds friction. See VIS-4.

**Progress → Hip tab vs Report → Monthly hip check redundancy** — yes, these
duplicate. HipProgressTile shows the 6-question overall score trend; Report
shows the same 6 questions per check-in in a wide table. Different views of
the same data, arguably justified for different audiences (user vs specialist).
I'd argue: Progress → Hip should have a "See specialist table" link
straight to the Report section anchor.

## Positive callouts

- **`/check/hip` flow is genuinely good.** Step-by-step, one question per screen,
  method + interpretation + video-search link (`check/hip/page.tsx:200-218`).
  Left/right handling on paired tests is clean. Review screen lets you jump to
  any question. This is the single best-executed piece of the app for a hip
  user.
- **Report page framing** (`report/page.tsx:160-163`) — "This is a self-tracked
  training log, not a diagnosis. Symptom scores are the user's own 0-10 ratings
  from a daily morning check. Load values are logged workout data." That's
  exactly right — precise, honest, defensible with a clinician.
- **Print stylesheet exists.** Most apps this early do not think about print.
  `report/page.tsx:561-599` handles it, and I would trust the output.
- **Signals strip pattern** — folding all signals into one pill was the right
  call. Prior N-card stack would be brutal. Execution of the pattern needs
  the tweaks above but the concept is solid.
- **Clinical constraints surfacing in Report** (`report/page.tsx:511-553`)
  reads back the provocative positions and red flags from `clinical-context.json`.
  Silent but valuable — the specialist reads this and knows the constraints
  the program respected.
- **Coach "Coming soon" page** (`coach/page.tsx:254-317`) — new copy is clean.
  "A coach that reads your whole log every time you ask." is a strong lede.
  Not overselling, and the "meanwhile" nudge to keep logging is a good bridge.

## Priority fix list (top 10)

1. **Gate `personal: true` programs behind a one-tap "this is authored for one
   specific clinical context and my situation resembles it" acknowledgement**
   before the Start CTA is active (B-1).
2. **Give the hip program a minimal intake** — 3 questions: current squat 5RM,
   current pull 5RM, current symptoms bilateral 0-10 — so `intake_answers`,
   TMs, and Reveal-card personalisation all get seeded on day 1 (B-2, B-3, COPY-8).
3. **Fix `FirstRunBanner` privacy copy** to match reality when authenticated
   (BUG-1) — align with `data/page.tsx:192`.
4. **Suppress `check-overdue` signal on day 1** — require at least 24h of
   app usage before the amber overdue nudge fires (BUG-4).
5. **Change "Monthly hip check due" to "First hip check" in the strip label**
   when `status.lastDate == null` (BUG-2).
6. **Add a phase-level "you are here" indicator on Today or Week** — a
   horizontal 7-phase progress bar with the current phase highlighted (UX-1).
7. **Report page: `all` range as default on accounts with < 28 days of logs**;
   fall back to `12w` once data exists (UX-7).
8. **Empty-state CTAs on Progress → Hip tile** — three cards, three "Log your
   first X" links (Sub-tab: Hip empty).
9. **Rewrite the Reveal card fallback** for programs without intake — read
   `weekly_template.week` to produce a concrete schedule line even when
   intake_answers is missing (COPY-8).
10. **Report hip table on mobile: replace 22-char truncation with full labels**
    across two rows, or use collapsing accordion per check-in (VIS-1).
