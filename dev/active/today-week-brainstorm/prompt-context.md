# Today + Week + Session UX brainstorm — shared context for expert agents

## Founder's own framing

**2026-08-21 message that started this:**
> "one bug i found, when in today view i move to tomorrow to see tomorrow plan, then from there i click on one session, i get empty session as it probably looks at todays date. i think the whole today week and sessions and how i can look for previous days and coming days etc, this needs a big refactor"

**Follow-up on process:**
> "before we move to today and week tabs with the redesign works, we should also let the expert agents to brainstorm how to make the UX experience also better and less duplicated and more intuitive"

**Follow-up on scope:**
> "the design should work first for all the public programs"

## Current architectural state

**Date context propagation (the specific bug):**
- `activeDate` lives ONLY as component-local `useState` in `TodaySession.tsx`. NOT in the Zustand store.
- `Extras` page has its OWN parallel local `activeDate` — could drift from Today.
- `Session`, `Progress`, `History`, `Check`, `Report`, `Week` all read `todayISO()` directly with no way to inherit an active date from a caller.
- Tactical fix already shipped (2026-08-21 commit `8edfe46`): "Open session" href now carries `?date=YYYY-MM-DD` and SessionClient reads it. THIS BRAINSTORM IS ABOUT THE DEEPER PROBLEM, NOT THAT TACTICAL FIX.

**Surface responsibilities today:**
| Surface | Purpose | Date behavior |
|---|---|---|
| **Today (`/`)** | Dashboard — "what's my plan RIGHT NOW" | Has DateNav; users use it to browse days |
| **Week (`/week`)** | Weekly plan overview | Own week navigation (not shared with Today) |
| **Session (`/session/[slug]`)** | Focused single-program workout view | Same TodaySession component under a slug override |
| **Extras (`/extras`)** | Cross-modal / off-plan session logging | Own DateNav (parallel state) |
| **Check (`/check`, `/check/hip`)** | Morning check form | Always today (correct — check is morning-of) |
| **Progress (`/progress`)** | Long-view analytics | Range surface (not date-scoped) — collapsing into Record surface per Cut C |
| **History (`/history`)** | Log heatmap + past-session drill-in | Range surface — collapsing into Record surface per Cut C |
| **Programs (`/programs`)** | Catalog | Not date-scoped |
| **Report (`/report`)** | Specialist-share PDF-style snapshot | Always today (as-of-now snapshot) |

**Duplication + friction concerns:**
1. Today has DateNav. Week has its own day navigation. They don't sync — if you set Today to tomorrow via DateNav then jump to Week, Week shows current week with today highlighted (not tomorrow).
2. Session route inherits nothing from the caller's view context. Even after the option-A fix, there's no shared date primitive across the app.
3. "Open session" is a link that pulls the user off Today into a narrower version of the SAME component (TodaySession with slugOverride). Users may feel like they left the surface but the URL and header changed. Semantic ambiguity.
4. When a user has multiple programs (concurrent), Today shows a stack of DashboardBlock cards, one per program, each with its own "Open session →". Which one is the primary? Are they meant to open them all sequentially?
5. Week's day cells expand/collapse but tapping a session inside a day doesn't open that day's session — it may or may not, depending on state (untested).
6. Log an extra session (`/extras`) is on a separate route with a separate DateNav, but the founder observed it's basically a variant of Today's session card.

## The 5 public programs the redesign must serve

Order of beta priority:
1. **Engine Builder** (aerobic — Terav's beta launch program). Data: avg HR at easy runs, weekly Z2 minutes, mid-block + end-block retests. 8-week arc.
2. **Concurrent Strength Maintenance** (concurrent). Data: top-set kg (5/3/1-family), aerobic sessions (4×4 rows, Z2). Multi-track — user could see BOTH strength + aerobic blocks in a single day.
3. **Handstand Walk** (skill). Data: freestand hold time, walk distance attempts, wrist/shoulder symptom checks. Skill assessments (episodic, not continuous).
4. **Overhead Mobility** (mobility). Data: range-of-motion retests, drill compliance, external-focus practice.
5. **Rowing 2K Test Prep** (race-anchored). Data: threshold pace/500m, weekly volume, race target date + taper phase.

Personal (out of catalog): **Anterior Hip Rebuild** — one-user personal program. NOT the priority; only relevant if the design accidentally breaks for rehab-primary users.

## Cut C Record redesign context (already in review, not yet coded)

The `Record` surface (collapsed Progress + History) is currently in mockup review at `dev/active/redesign-progress/`. Key decisions locked:
- 5 tabs → 4 tabs (delete `/progress`, unified surface at `/record`)
- Three sections: Now / Trend / Log
- Slate rolling-avg curve, tri-color retest event pins, monthly-total bars
- Data-viz palette approved (state tokens only; R2 bronze CTA-only preserved)
- 2 R-rules locked: retests supersede PRs (R-CutC-1), export supersedes share (R-CutC-2)

Record only touches Progress + History. **This brainstorm is a DIFFERENT surface pair: Today + Week + Session.**

## What the brainstorm must produce

**NOT another audit.** Not another spec. This is generative work. Each agent should propose 3-5 alternative UX models for how Today + Week + Session + date-context could work, with tradeoffs. Not "what's wrong with the current" but "here are new shapes worth considering."

## Rejected patterns (still apply — cannot be undone)

- **R2:** bronze CTA-only in UI chrome
- **R5:** no streaks / XP / gamification
- **R7:** no drag-to-reschedule (confirm-first only)
- **R8:** no autonomous score-hero (Whoop-style)
- **R-CutC-1:** retests supersede PRs
- **R-CutC-2:** export supersedes share
- Focused-improvement positioning: ONE weakness, sharpened per session — not a full training plan

## Peer references (from the competitive matrix)

Most relevant peers for THIS brainstorm:
- **Runna** — daily-plan + reschedule affordance. 26-step onboarding. "Move today's run to tomorrow" pattern.
- **Hevy** — calendar-with-year-zoom for progress; workout log as separate flow (start workout → live UI → post-workout summary).
- **TrainingPeaks** — dashboard with today's workout card + upcoming stack + week strip.
- **Whoop** — Today home (single number score) + Overview (aggregation). No calendar.
- **Oura** — Home (today's snapshot) + Trends (over-time). Home is the identity.
- **Peloton** — Home + Calendar + Class library. Calendar shows scheduled classes.
- **Apple Fitness+** — Summary (today rings) + For You (recommendation) + no long calendar.
- **Freeletics AI Coach** — Adaptive weekly plan. Week view is primary; day drill-in inline.
- **Zwift** — Companion app is date-scheduled workouts; the game IS the workout.

## Explicit constraints on what any proposed refactor MUST preserve

- Confirm-first mechanic (engine proposes, user Accepts)
- Cite-per-adjustment first-class UI
- Multi-program support (a user can have concurrent programs)
- Personal-program firewall (rehab track never in aggregate math)
- Warm-dark visual identity, bronze CTA-only
- Static export to Cloudflare Pages (any change must work with no server-side dynamic routing)
