# Round 3 audit — fresh signup, empty-state coverage

## The gap this round exists to close

Round 2 personas were all "user X on program Y" — each agent started
mid-flow with an active_program_id already set. Nobody tested:

- The empty account (signed in, no program)
- The first-tap of every page BEFORE a program is picked
- Signup → Today → Programs → Preview → Intake → first-session flow as
  a genuine first-time user
- The transitions between routes (does Today's empty state match Week's
  match Progress's match Extras's?)

Result: real bugs shipped that any first-time user hits on day 1:
- Week showed anterior-hip's default schedule for users with no program
- Progress showed squat / bench / deadlift TM rows for users who never
  picked a strength program
- Extras rendered anterior-hip's home rehab block
- Report tried to render a summary

Those bugs are fixed now. This round audits whether **any other empty-
state or transition bug** is still lurking.

## Coverage requirements — non-negotiable

Every persona in this round starts with a **brand new Supabase account**.
No local data, no active_program_id, no logs, no TMs. You test the
sequence:

1. Land on `/sign-up`
2. Sign up (or simulate the successful state)
3. Land on `/` (Today)
4. Tap through EVERY route in order:
   - `/` — should show "Pick a program" empty state
   - `/week` — should show empty state
   - `/extras` — should show empty state
   - `/check` — should render (regions may or may not be relevant)
   - `/coach` — should show "coming soon" copy
   - `/progress` — should show empty state
   - `/report` — should show empty state
   - `/guide` — should render (program-agnostic content)
   - `/data` — should render (allows import/export)
   - `/profile` — should render
5. Also tap through `/programs` → `/programs/[slug]` for at least 2
   programs (one strength / one aerobic).
6. Complete an intake (whichever program the persona picks).
7. Now you have an active program. Re-tap through every route from step 4
   and verify the routes now render program content correctly.
8. Log 2-3 sessions on Today for 2-3 different dates.
9. Re-tap every route and verify the data flows.

## What to specifically look for

Bug categories that WERE MISSED in round 2:

- **Silent fallback to a default program** when active_program_id is null
- **Hardcoded strings referencing the founder's context** (squat, hip,
  deadlift, Tallinn run) that render for users on other programs
- **Empty-state visual regressions** — pages that render but with broken
  layout because they expected data
- **Onboarding modals firing when they shouldn't** — modal was hip-gated
  today but there may be others
- **Route transitions leaking state** — e.g. clicking "Skip" on Today,
  then Week's phase indicator being wrong
- **Sign-up → Today loading spinner never resolving** if there's a race
- **Text that says "your plan" before a plan is picked**
- **CTAs that point to routes that don't exist for new users**
- **Any trace of "Terav teritab" or Estonian text** on the app UI (we
  killed Estonian in the app for now)
- **Buttons that appear disabled or greyed out with no explanation**
- **"Loading…" states that hang forever**
- **Recharts loading a bundle for zero data points**

## Test personas — 3 agents, distinct starting decisions

### Persona A — "The Cautious Browser"
- Signs up, doesn't pick a program immediately
- Wanders every tab first to see what's there
- Reads /guide before choosing
- Uses /coach expecting some intelligence
- Eventually picks Engine Builder
- Simulates 2 weeks of use

### Persona B — "The Committed Rower"
- Signs up specifically to prep for a 2K test
- Goes straight to /programs
- Picks Rowing 2K
- Enters `target_test_date = 2026-11-15` (10 weeks out from typical Aug run)
- Completes intake
- Simulates the first 2 weeks including 1 GPX-imported session

### Persona C — "The Skeptical Powerlifter"
- Signs up planning to try CSM
- Reads the intake safety_gates carefully
- Answers `days_per_week = 3` (fewer than the min 4) to verify the
  capacity gate stops them
- Then goes back and answers 4 to pass
- Completes intake
- Logs their existing lift PRs manually via Progress
- Simulates 2 weeks

## Read first

- `/Users/margussellin/www/program/CLAUDE.md`
- `/Users/margussellin/www/program/next-app/CLAUDE.md`
- Both AGENTS.md files
- The round-2 reports at `/Users/margussellin/www/program/dev/audits/round-2/` — DO NOT re-file bugs those already caught. Focus on NEW findings.

## Report format

Structured markdown. Max 2000 words. Sections:

1. **Persona recap** — 2 sentences
2. **Empty-account tour findings** — bugs / UX gaps found while tapping
   every route BEFORE picking a program
3. **Intake + first-session findings** — bugs / UX gaps during intake and
   the transition from "no program" to "has program"
4. **Post-intake / mid-arc findings** — bugs / UX gaps after 2 weeks of
   simulated use
5. **Regression check** — did any round-2 fix break something new?
6. **Copy issues** — any text that reads wrong for your persona
7. **Priority fix list** — top 10 ranked
8. **Positive callouts** — what worked

Be specific. `file:line` references win over "the UI is confusing".

Save your report to
`/Users/margussellin/www/program/dev/audits/round-3/persona-{A|B|C}.md`
and return the full report as your final message.
