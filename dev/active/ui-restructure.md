# UI restructure — Today tab is too dense

**Reported:** 2026-08-06 by user, after first session using the app.
**Status:** Captured, not yet actioned. User will send workout results first, then we'll implement.

## The problem

Current "Today" tab renders **every** active block for the current phase in a single scroll:
- Barbell strength blocks (`block_squat_heavy`, `block_pull_heavy`, etc.)
- Home rehab / activation (`block_a_home` — hip flexor iso, adductor iso, glute bridge, dead bug, hip flexor stretch, 90/90 hip switches)
- Daily skill (`block_daily_skill` — air squats, goblet squats)
- Around-runs blocks (`block_runs` — pre-run primer, post-run mobility)

User's take: the strength session is what "today" should mean. The accessory / rehab / run blocks aren't calendar-driven — they're "do them when you do them." Bundling them all together makes the strength card hard to find and pushes the actual scheduled work off the fold.

## What the user wants

1. **Today** = the scheduled strength/calendar work only.
   - One clear block per day (or none, if it's a rest day).
   - Weight / reps / RPE / notes inputs prominent, uncluttered.

2. **Accessories** (working name — could be "Rehab" or "Daily") = separate page.
   - Home rehab + daily skill + any hip/glute/trunk work.
   - Always available — the user opens this page when they want to do the work, not because the calendar says so.
   - Completion still logs to today's date so History/streak accounting works.

3. **Runs** = separate page.
   - Pre-run primer + post-run.
   - Tied to running sessions, not to weekdays.
   - Completion also logs to today's date.

## Design decisions to make

- Should "Accessories" and "Runs" be top-level tabs, or a single "Extras" tab with sub-sections?
- Should Today show a small footer like "3 accessories logged today" to remind that the other page's work is happening?
- Should the vitals bar "X/Y done" counter split into "Barbell X/Y, Accessories A/B" or stay unified?
- What about `block_evaluate` in phase 1 — it's calendar-scheduled but light. Keep on Today or put on Extras?

## What NOT to change

- Weight/reps/RPE/notes logging works fine — user didn't complain about the card itself.
- TM auto-suggest works.
- Storage schema is fine — no data migration needed.
- Home block, daily skill, run blocks stay in `program.json` as-is. This is a UI-layer routing change, not a data change.

## Implementation sketch (deferred until after workout results)

1. Categorise each block: `category: "strength" | "accessory" | "run"` — either infer from block id or add a field in `program.json`.
2. `renderToday()` filters to `category === "strength"` blocks scheduled for today's weekday.
3. New tab: `Extras` with two sections (Accessories, Runs). Render always, regardless of phase.
4. Vitals counter: keep unified for now, add a tooltip explaining what it counts.
5. Guide tab: update the "How to use the tabs" section.

## Open user request (parallel work item)

User will send results from first session. Then:
- Update TMs based on inferred numbers or user-provided actuals.
- Look at what he ate, how it felt, RPE — feed into the next session's targets.
- Then do this UI restructure.

## Follow-up feedback 2026-08-06 (after sending results)

Direct quote: *"i dont understand the schedule, thats the thing, it should be more organized, like some real fitness tracker with calendar and daily workouts and should see days also that dont have leg workouts and i can move the workout between days, lets say i cant do it on tuesday, i can move it to wednesday"*

Additional requirements on top of the density concern:

1. **Calendar-first interface.** Not tab-first. Like Strong, Hevy, Nike Training Club — the user opens the app and sees a scrollable calendar of days. Each day shows the scheduled session at a glance. Tap a day → session detail.

2. **Rest days visible.** Not just absent. A day with no scheduled workout should read "Rest day" (or "Light day / accessories only") so the user knows the app didn't just fail to load.

3. **Workouts are movable.** If Tuesday's squat day gets missed, the user should be able to drag it (or long-press → move) to Wednesday. Downstream days shift accordingly, or overwrite — user chooses.

4. **Days without leg workouts visible in-context.** Currently the app pretends only strength days exist. User wants to see the full week including runs, rest, class-only days.

Storage schema implication:
- Session assignments become per-date, not just per-weekday-template.
- Introduce `STORE.scheduled[YYYY-MM-DD]` = block_id (or list of block_ids).
- On first load, seed from `weekly_template.week` based on the user's start date, then let the user override.
- Moving a workout = updating that map.

Log observation from today's session (2026-08-06):
- Reintro block was too dense — user completed 4 items (squat, split squat, goblet, dead bug), skipped 3 (block pull, single-leg RDL, extra home block items).
- All the block_a_home items appeared on Today alongside block_reintro AND block_daily_skill AND block_runs — that's why it felt overwhelming.
- TM auto-suggest inline hint likely didn't get noticed / tapped (TM still at 110 default in the log).

## Revised implementation priority

1. **Split Today into Today (strength only) + Extras (accessories + runs).** Density fix. Fast to ship.
2. **Add per-date schedule override** (`STORE.scheduled`). Move a workout between days.
3. **Calendar view** replacing / supplementing Week tab. Scrollable month with dots for scheduled sessions.
4. **Rest day cards** on calendar and Today.
5. Later: pinch/drag reordering, session moving via long-press.

Don't ship 1-3 together. Ship 1 first (biggest UX gain per line of code), then 2, then 3.

