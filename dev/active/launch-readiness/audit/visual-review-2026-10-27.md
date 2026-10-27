# Visual review of the ad path (2026-10-27, after wave 1 + sweep 1)

Sonnet reviewer. Inputs: `screens/gaps/A-first-run`, `screens/gaps/C-viewport-375` (393 not opened), persona-pullup /
persona-handstand / persona-strength mobile + flows captures (gitignored, `next-app/tests/e2e/artifacts/personas/`).
Only defects a first-time visitor would notice; not verified in code yet.

| # | Sev | Screen | Finding |
|---|-----|--------|---------|
| V-01 | FIX-TODAY | persona-handstand/pullup `mobile/01-day` | Week numbers contradict: header/ring "Week 3 of 4" (pull-up) / "Week 4 of 6" (handstand) vs mono "Program week 7"; pull-up also "Weeks 5-8" next to 3/4 |
| V-02 | FIX-TODAY | persona-handstand `mobile/01-day` | 5 cards on Today (tier gate, Trending well, shoulder-pain rule, Rest day, Log extra session), breaks max-3; "Tier gate cleared / Advance" beside "Rest day"; Advance tan vs old-style "Not now" |
| V-03 | FIX-TODAY | A-first-run `03-first-screen-after-sign-in` | Two tan primaries ("Browse programs", "Got it — start the day"); tour card wedged above nav; jargon ("training maxes, retests") |
| V-04 | FIX-TODAY | A-first-run `07-today-day-1` | "Start your first session" card not visible in capture (below the fold?); verify placement |
| V-05 | FIX-TODAY | A-first-run `07-today-day-1` | Plan card lines truncated with ellipses; Tier D copy vs footer "Dead hang max seconds at level 4"; "Pullup" vs "Pull-Up" |
| V-06 | FIX-TODAY | A-first-run `08/09-first-session` | First brief shows "Coaching heuristic (Tsatsouline) — flagged as engineering choice…", Karni 1998, Shea 2000 to a beginner; "Start — Follow along"; tier labels C/D vs A/B vs D |
| V-07 | FIX-TODAY | program detail, intake, account, settings | Double back controls (new header Back + old "All programs" / "Cancel intake" / "Profile" / "Back") — header rule half-applied |
| V-08 | FIX-TODAY | A-first-run `06-intake-*` | Intake footer: old outlined Back + muted brown disabled Next beside the new Button; `06-intake-14` step label wraps 3 lines, squeezes progress bar |
| V-09 | FIX-TODAY | C-375 `07-profile-top` | Pull-up user's Profile "What Terav believes" lists strength lifts (front squat, trap-bar DL, …); "Program tier: Hang" vs Today "Interleaved consolidation" (may be sim-seeded TMs — check) |
| V-10 | FIX-TODAY | C-375 `10-off-plan-top` | Extra session page shows "Accessories & Home rehab" to a pull-up user (clinical wording on non-hip user) |
| V-11 | LATER | C-375 `04-record-top` | Record first-visit sheet covers nav, last line cut, heavy tan focus ring on close |
| V-12 | LATER | C-375 `05-check-top` | Sticky "Update check" bar hides Elbow row; "Saved" + "Update" redundant; "Kellmann 2010" chip |
| V-13 | LATER | A-first-run `04-programs` | ~15 lines of CITED/VERIFIED explainer push cards below fold; carousel clips the second card |
| V-14 | LATER | persona-pullup `flows/session-log-set/02-set` | In-session pill says "This hurts", not "Something hurt"; outlined red pill, not new Button; "Programme" vs "Program" |
| V-15 | LATER | persona-pullup `flows/session-stop`, `session-finish-here` | No Done / Stopped screen captured — harness never reaches it (see harness fix) |

Clean: sign-up page, intake steps 1/4/9 (apart from double back), Plan top/bottom, Programs bottom, note sheet.
