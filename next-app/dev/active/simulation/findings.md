# Simulation + audit findings

Auto-populated by e2e runs and multi-agent audits. Newest at the top.

## UX / naming

### F-001 · Program name inconsistency: "Anterior hip + strength rebuild" vs "Anterior Hip Rebuild"
**Severity:** minor
**Source:** baseline.spec.ts

The manifest entry for the hip program is `"Anterior hip + strength rebuild"` (long form), but throughout the codebase, CLAUDE.md, and marketing copy it's called `"Anterior Hip Rebuild"`. Users see the long form in the catalog, then the short form elsewhere. Pick one.

**Fix:** normalise the manifest name to match the canonical short form ("Anterior Hip Rebuild") or update all references to the long form.

### F-002 · New users can't reach Extras / Report / Data / Guide from top-right
**Severity:** should-fix
**Source:** baseline.spec.ts

When a signed-in user has no active program, Today renders the `NoActiveProgram` welcome screen without a header row. That means the `⋮` overflow menu (which is the only path to Extras / Check / Report / Data / Guide from Today) is missing. New users are effectively stuck between "Browse programs" and nothing else until they pick one.

**Fix:** either mount `HeaderQuickLinks` at the layout level (always available), or add it to `NoActiveProgram` too.

### F-003 · Bottom tab bar overlaps page content on every scrollable screen
**Severity:** blocker
**Source:** baseline 02-week.png, 03-progress.png, 05-profile.png, 06-programs-catalog.png, 08-preview-engine-builder.png, 12-check.png, 15-guide.png

The fixed bottom tab bar (TODAY / WEEK / PROGRESS / HISTORY / PROFILE) sits directly on top of page content on almost every screen that has enough content to reach it. Concrete examples:

- **Week**: the Fri row is completely hidden behind the bar (Thu → Sat visible, Fri gone).
- **Progress**: the Front squat milestone row is bisected by the bar; "Roadmap 0%" from row above and the next milestone below are covered.
- **Profile**: the tab bar cuts through the middle of the `Coach` card, hiding its status/CTA and the top edge of `Help`.
- **Programs catalog**: the entire "Engine & endurance" program tile (title + description hidden) sits under the bar.
- **Preview – Engine Builder**: the primary `START THIS PROGRAM` CTA is directly beneath / behind the tab bar — potentially unclickable and definitely obscured.
- **Morning check**: covers the "Morning stiffness" label; only the slider is visible.
- **Guide**: covers the middle of the Cues section.

Root cause looks like the scroll container is missing `padding-bottom` equal to tab-bar height (or the bar isn't compositing above with a safe-area gutter). It's not a one-off — it happens on every route that scrolls, so this is a global layout bug rather than per-page.

**Fix:** add `padding-bottom: calc(56px + env(safe-area-inset-bottom))` (or whatever the bar height is) to the app shell content container, or make the bar reserve layout space instead of floating.

### F-004 · Onboarding "Setup 1 of 3" modal blocks Today indefinitely across the multi-day sim
**Severity:** blocker
**Source:** matrix/consistent-average_anterior-hip-rebuild/day-7..90.png, matrix/overperformer_anterior-hip-rebuild/day-14.png, matrix/consistent-average_engine-builder/day-*.png (all sims that get past sign-in)

The 3-step "How's the low back this morning?" onboarding modal (Setup · 1 of 3) appears at day 7 in every archetype and never advances — the identical Setup 1-of-3 screen is captured at day 7, day 14, day 30, day 60 and day 90. Because the modal is a fullscreen overlay dimming Today underneath, the sim can't reach or interact with Today at all after it appears.

Two problems together:

1. The modal is being re-shown every session/day rather than dismissed after being answered or skipped. Either the "seen" flag isn't persisting to storage, or the appearance rule fires on every mount.
2. `Skip setup` is a small underlined text link in the bottom-left, visually equal weight to a footnote. Given the modal is fullscreen and blocking, `Skip setup` should be a real button (or at least a visible secondary button), not text.

**Fix:** persist a `symptom_setup_completed_at` (or `_dismissed_at`) on save/skip and gate the modal on it. Promote `Skip setup` to a labelled button. Consider capping re-appearance to "once ever" rather than "once per session/day."

### F-005 · Onboarding low-back question is program-agnostic — asked to Engine Builder and Handstand Walk users too
**Severity:** should-fix
**Source:** matrix/overperformer_engine-builder/day-7.png, matrix/consistent-average_handstand-walk_tier_a_foundation/*

Every archetype gets the same "How's the low back this morning?" question at Setup 1 of 3, including athletes on Engine Builder (aerobic base program) and Handstand Walk (gymnastics skill). Low back symptoms are relevant to the Anterior Hip Rebuild rehab track but arbitrary for an engine block. Meanwhile the setup skips shoulder for handstand-walk users, where wrist / shoulder would be the relevant self-report.

**Fix:** the 3-step setup should pull its regions from the active program's clinical-context / catalog metadata, not a hardcoded list. Rehab-tagged programs → the joints they target. Non-rehab programs → either skip the setup entirely or ask generic readiness (sleep, life load) instead.

### F-006 · "Loading…" placeholder never resolves on Profile → account card
**Severity:** should-fix
**Source:** baseline 05-profile.png

The account card at the top of the Profile screen shows `Loading…` for the user's name/handle even after the page has finished rendering (all other sections are hydrated). For a signed-out or offline auth state it should render "Signed in" or an email; for a still-fetching state the whole card should show a shimmer, not the literal word `Loading…` next to the tier badge (`Free · beta`).

**Fix:** make the placeholder a proper skeleton, or fall back to the email / a generic label. If auth stays pending after N seconds, surface it as an error rather than a permanent word.

### F-007 · Session appears lost mid-sim — Today shows the sign-in page at day 7/14/30/60/90
**Severity:** blocker
**Source:** matrix/consistent-average_engine-builder/day-7.png, matrix/overperformer_engine-builder/day-30.png, matrix/injured-recovery_anterior-hip-rebuild/day-14.png, matrix/erratic_anterior-hip-rebuild/day-30.png, matrix/overperformer_handstand-walk_tier_d_advanced/day-60.png, matrix/underperformer_anterior-hip-rebuild/day-90.png, matrix/consistent-average_handstand-walk_tier_a_foundation/day-30.png

Multiple sim runs, across every archetype and program, capture the `Sign in / Continue your training.` page at snapshots deep into the sim (day 7 onwards). Since result.json for these runs still reports `logs_count: 79` etc., the sim seems to keep running while the UI is stuck on sign-in — meaning either (a) sessions are being invalidated during the sim's date advancement (likely: a session cookie whose max-age is real wallclock while the sim jumps days), or (b) the harness reloads the page without preserving auth. Either way, users hitting this pattern in production (leaving the app open across a token refresh boundary) will be dumped back to sign-in with no in-app recovery cue.

**Fix:** verify session refresh survives a page reload; if the sim runner is the problem, add auth persistence to the harness. Either way, in-app: after silent auth failure, redirect through a "signed out" toast rather than the raw sign-in form so returning users understand what happened.

### F-008 · Program catalog claims "8 weeks by default" but Anterior Hip is 34 wk
**Severity:** minor
**Source:** baseline 06-programs-catalog.png, 07-preview-anterior-hip.png

Catalog header: "Each program targets one weakness. **8 weeks by default.** Personalised to your baseline…" — but the very first tile beneath is `Anterior hip + strength rebuild · 34 wk · intermediate`, and its preview page repeats "34 weeks" and describes a 12-month arc with three 5/3/1 cycles + Hatch block + peak test. The header copy is factually wrong or the hip program's duration is wrong.

**Fix:** drop "8 weeks by default" from the catalog header — programs vary in length. Replace with something honest like "Length varies by program. Personalised to your baseline."

### F-009 · Data & privacy exposes developer-facing copy to end users
**Severity:** should-fix
**Source:** baseline 14-data.png

The Data & privacy panel says: *"Export — download or share the full log as JSON. Save it to `data/log.json` in the repo so Claude Code sessions can read it in future chats."* and *"Coming from the old app at program-f3r.pages.dev? Open it, tap Data → Copy to clipboard, paste here."* This is Margus-and-Claude-only instruction leaking into general beta UI. Non-owner beta users will be confused by "the repo" and "Claude Code sessions."

**Fix:** move dev-only import path to a hidden/admin flow. Public copy should just say "Download JSON to back up your log" without the internal repo mechanics. The `program-f3r.pages.dev` migration note is fine but should be worded as a generic "old version" migration.

### F-010 · Intake wizard renders all sections on one long scroll instead of stepping
**Severity:** should-fix
**Source:** baseline 10-intake-wizard.png (page is 1967px tall at 1280 wide — even taller on mobile)

The route is called "intake wizard" but the screen presents every section — Screening, You, Where you are now, About you, Physical tests, Consent — stacked on a single scrollable page with all form controls exposed at once. There's no per-step progress, no ability to save between sections, and error handling (any required field missed anywhere on the page) will be discovered only at the bottom. For a "5-day intake" this is a lot to face on first open.

**Fix:** either rename to "Intake form" and accept the single-page pattern (adding save-and-resume and top-of-page validation summary), or actually chunk into steps with a top progress indicator. The preview screens already promise "Starts with a 3/5-day intake" — users expect stepping.

### F-011 · Report and Guide are unreadable at mobile width — dense layouts not adapted for 390px
**Severity:** should-fix
**Source:** baseline 13-report.png (2085 tall), 15-guide.png (2230 tall)

Both Report and Guide are captured as very tall pages with tiny type, code-block-heavy content, and multi-column-looking tables. At 390×844 (the mobile target the audit brief mentions) users will get a wall of ~10px text. The tap targets around "info" affordances and links are also too close together for finger use.

**Fix:** for Report — collapse each section by default with expand-on-tap, and use a proper responsive stacked layout for the summary cards (currently they read as if a 3-col grid was squeezed). For Guide — chunk into an accordion or a table-of-contents-first pattern rather than a scroll-to-find document.

### F-012 · No multi-program behaviour visible — all sims run one program at a time
**Severity:** minor
**Source:** matrix/* (9 archetype × program combos)

The sim matrix directory names pair one archetype with one program (e.g. `overperformer_engine-builder`, `consistent-average_handstand-walk_tier_a_foundation`). No sim has two programs active concurrently, so day-60 and day-90 Today snapshots don't answer the audit question about how Today handles 2+ active programs. Whether that's a product intent ("only one active program at a time") or a gap in the sim harness isn't clear from the screenshots alone.

**Fix:** if the app supports multiple active programs, add a matrix cell that starts a second program mid-sim. If it doesn't (one-at-a-time by design), the catalog / preview flow should surface this explicitly ("Switching program will archive your current one"), and this becomes a copy fix on the catalog, not a rendering fix.

### F-013 · Overflow menu (`⋮`) missing from top-right on every audited screen
**Severity:** should-fix
**Source:** baseline 01–15 (none of the 15 baseline screenshots show a `⋮` button)

The audit brief calls the overflow menu the only path to Extras / Report / Data / Guide (as per F-002). Yet none of the 15 baseline screens actually shows a visible `⋮`. The Week screen has a `PROGRAMS` button in the top-right; Progress has `EXPORT REPORT`; Today (welcome state) has nothing; Profile has nothing. So either the overflow menu is only visible on Today's populated state (not captured), or it isn't rendering. If it exists but requires having an active program, then F-002 is even worse than described: with no program picked, none of the "extras" surfaces are reachable at all.

**Fix:** verify the `⋮` menu is mounted at the layout level and present regardless of program state; screenshot it in the baseline set so we can audit label / target size.

### F-014 · Visual hierarchy on Today (welcome) buries the primary CTA below body copy
**Severity:** minor
**Source:** baseline 01-today.png

On the Welcome state, the eye lands first on the H1 `Welcome`, then the two-sentence intro paragraph, then a boxed "Pick your first program" card with a `BROWSE PROGRAMS →` button. That's three layers before the action. Given this is a single-CTA screen, the primary action could be promoted to be the first thing scanned (e.g. a large button under a one-line hook), especially since the trailing footnote about beta feedback also competes for attention.

**Fix:** flatten. One headline, one sentence, one big button. The context ("targets one weakness, personalised to baseline") can move to the catalog page where the choice actually happens.

### F-015 · "Setup 1 of 3" number palette conflicts with meaning
**Severity:** minor
**Source:** matrix/*/day-7..90.png (any modal appearance)

In the 0–10 pain scale, `4` and `5` render in a yellow/amber colour and `6–10` in red — implying severity thresholds. But the label says "0 = nothing, 4 = mild, 10 = severe", so `4` being amber and `5` being amber-going-red suggests mild is already dangerous. For a user with baseline low back at, say, 3 or 4, the colouring will feel alarmist.

**Fix:** shift the ramp — keep 0–2 neutral, 3–5 as a single "mild" tint, 6–8 amber, 9–10 red. Or drop colour entirely and rely on the numeric labels. Match to whatever the engine actually treats as green / amber / red.

