# Visual review of the ad path (2026-10-27, after wave 1 + sweep 1)

Sonnet reviewer. Inputs: `screens/gaps/A-first-run`, `screens/gaps/C-viewport-375` (393 not opened), persona-pullup /
persona-handstand / persona-strength mobile + flows captures (gitignored, `next-app/tests/e2e/artifacts/personas/`).
Only defects a first-time visitor would notice; not verified in code yet.

| # | Sev | Screen | Finding | Status |
|---|-----|--------|---------|---|
| V-01 | FIX-TODAY | persona-handstand/pullup `mobile/01-day` | Week numbers contradict: header/ring "Week 3 of 4" (pull-up) / "Week 4 of 6" (handstand) vs mono "Program week 7"; pull-up also "Weeks 5-8" next to 3/4 | ✓ 3bd92da (phase-name "Weeks 5-8" prefix stripped; "Program week N" and the third week line removed) |
| V-02 | FIX-TODAY | persona-handstand `mobile/01-day` | 5 cards on Today (tier gate, Trending well, shoulder-pain rule, Rest day, Log extra session), breaks max-3; "Tier gate cleared / Advance" beside "Rest day"; Advance tan vs old-style "Not now" | ✓ 3bd92da (Trending-well card hidden while the tier suggestion shows; Suggestion eyebrow, Accept/Not now as ui/Button). Handstand still has 4 cards on a rest day: the shoulder-pain rule is kept |
| V-03 | FIX-TODAY | A-first-run `03-first-screen-after-sign-in` | Two tan primaries ("Browse programs", "Got it — start the day"); tour card wedged above nav; jargon ("training maxes, retests") | ✓ 3bd92da (banner dropped from the no-program state, "Got it" secondary, tab names Today/Plan/Record/You, no jargon; Browse programs is ui/Button) |
| V-04 | FIX-TODAY | A-first-run `07-today-day-1` | "Start your first session" card not visible in capture (below the fold?); verify placement | ✓ 3bd92da (on day 1 the plan card no longer sits above the CTA, so Start your first session is the first card). Needs screenshot to confirm |
| V-05 | FIX-TODAY | A-first-run `07-today-day-1` | Plan card lines truncated with ellipses; Tier D copy vs footer "Dead hang max seconds at level 4"; "Pullup" vs "Pull-Up" | ✓ 3bd92da (lines wrap instead of truncating; "Pull-Up" name; "level 4" dropped from the attribution) |
| V-06 | FIX-TODAY | A-first-run `08/09-first-session` | First brief shows "Coaching heuristic (Tsatsouline) — flagged as engineering choice…", Karni 1998, Shea 2000 to a beginner; "Start — Follow along"; tier labels C/D vs A/B vs D | ✓ 3bd92da (citation sentences filtered from the brief note; "Start session"; "(Tier …)" stripped from block names) |
| V-07 | FIX-TODAY | program detail, intake, account, settings | Double back controls (new header Back + old "All programs" / "Cancel intake" / "Profile" / "Back") — header rule half-applied | ✓ 2b825b7 (removed page-level Back/All programs/Cancel intake/Profile; AppShell back remains) |
| V-08 | FIX-TODAY | A-first-run `06-intake-*` | Intake footer: old outlined Back + muted brown disabled Next beside the new Button; `06-intake-14` step label wraps 3 lines, squeezes progress bar | ✓ 2b825b7 (WizardFooter and Start button use ui/Button; step label truncates, counter nowrap). Disabled Next stays dimmed by design |
| V-09 | FIX-TODAY | C-375 `07-profile-top` | Pull-up user's Profile "What Terav believes" lists strength lifts (front squat, trap-bar DL, …); "Program tier: Hang" vs Today "Interleaved consolidation" (may be sim-seeded TMs — check) | not a bug for the lifts: simulator-v2 seeds training_maxes for every persona (real pull-up user has none). Tier row did read "Hang" for tier_a_hang, ✓ ab7b59d now "Tier A" |
| V-10 | FIX-TODAY | C-375 `10-off-plan-top` | Extra session page shows "Accessories & Home rehab" to a pull-up user (clinical wording on non-hip user) | ✓ ab7b59d (non-hip programs see "Accessory work") |
| V-11 | LATER | C-375 `04-record-top` | Record first-visit sheet covers nav, last line cut, heavy tan focus ring on close | |
| V-12 | LATER | C-375 `05-check-top` | Sticky "Update check" bar hides Elbow row; "Saved" + "Update" redundant; "Kellmann 2010" chip | |
| V-13 | LATER | A-first-run `04-programs` | ~15 lines of CITED/VERIFIED explainer push cards below fold; carousel clips the second card | |
| V-14 | LATER | persona-pullup `flows/session-log-set/02-set` | In-session pill says "This hurts", not "Something hurt"; outlined red pill, not new Button; "Programme" vs "Program" | |
| V-15 | LATER | persona-pullup `flows/session-stop`, `session-finish-here` | No Done / Stopped screen captured — harness never reaches it (see harness fix) | |

Clean: sign-up page, intake steps 1/4/9 (apart from double back), Plan top/bottom, Programs bottom, note sheet.
