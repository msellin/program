# Sweep 05: other programs (2026-10-28)

Screens: persona-engine, persona-rowing-mid, persona-muscleup, persona-muscleup-elbow, persona-mobility (mobile, plus desktop for engine and mobility). Only PNGs dated 2026-10-28 were used. Paths below are relative to `next-app/tests/e2e/artifacts/personas/`.

## B (ads-blocker)
- B persona-engine/mobile/06-programs.png — Shipped rowing, engine, muscle-up and mobility show COMING SOON or ACTIVE inconsistently → derive one badge state from manifest.
- B persona-engine/mobile/10-report.png — "sim:" prefix shown on contraindication to users → strip simulator label from user copy.
- B persona-mobility/mobile/10-report.png — Overhead pressing flagged as contraindication in an overhead-mobility program → reconcile flag with prescribed OHS and press.
- B persona-muscleup-elbow/mobile/02-plan.png — Ring dips still planned and "Build 3-5 ring dips" after deferral → honour the deferral in plan rules.
- B persona-muscleup-elbow/mobile/16-session-today.png — Today says "Next session: Friday, Ring dip ladder" despite deferral → remove deferred movement, show substitution reason.
- B persona-muscleup-elbow/mobile/13-check.png — Elbow pre-set to None for a user reporting elbow pain → require an answer, no silent green default.

## H (fix this week)
- H persona-engine/mobile/01-day.png — "YOU FINISHED" and "Keep going" on an unfinished program → show finished state only at program end.
- H persona-engine/mobile/01-day.png — Submax HR row duplicated, labels truncated → dedupe rows, show full label.
- H persona-engine/mobile/16-session-today.png — Wednesday rest day shows program-finished card → show rest-day state for today.
- H persona-engine/flows/session-follow-along/01-brief.png — Future Thursday session offers "Log this session" → block or label future-dated logging.
- H persona-engine/mobile/10-report.png — Retest table overflows right edge, "Tier target: foundation" is jargon → fit table, plain target label.
- H persona-rowing-mid/mobile/05b-record.png — 7-day rolling chart stuck on "Loading chart..." → render chart or show empty state.
- H persona-rowing-mid/flows/plan-move-commit/02-moved.png — Mon marked Skipped while Wed session was moved to it → show destination as receiving, not skipped.
- H persona-muscleup/mobile/10-report.png — Raw identifier "tier_a_prep" shown as tier target → use a player-facing tier name.
- H persona-muscleup/mobile/10-report.png — Strict ring muscle-up target "0 reps · stretch 0 reps" → show a real target or hide the row.
- H persona-muscleup/mobile/10-report.png — "Status: graduated" beside BELOW TARGET tag contradicts itself → reconcile status with target state.
- H persona-muscleup/flows/session-follow-along/05-guided-done.png — "Ring dip ladder done · 0 sets logged" congratulates zero work → show skipped or nothing-logged state.
- H persona-muscleup/flows/plan-move-commit/01-move-filled.png — Why field prefilled "harness: moved for coverage" → remove internal prefix, leave field empty.
- H persona-mobility/mobile/10-report.png — "cm_below_knee" raw unit strings overflow the card → format units, fix wrapping.

## M (soon)
- M persona-engine/mobile/01-day.png — "+0 bpm" and "+0s" in red for no change → neutral grey for zero deltas (also muscle-up 01-day).
- M persona-rowing-mid/mobile/06-programs.png — "More programs land as they're authored" reads as internal copy → remove or rewrite for strangers.
- M persona-muscleup/mobile/19-intake.png — Header truncated "MUSCLE-UP ACQUISITION (STRICT…" and "WHERE YOU ARE …" → shorten intake label.
- M persona-mobility/mobile/10-report.png — +6.0 degrees shoulder gain shown green while "within measurement error" → neutral colour for within-error deltas.
- M persona-muscleup/mobile/07-programs-active.png — "Muscle-Up Acquisition (strict ring)" vs "Muscle-Up" naming → one program name everywhere.
- M persona-muscleup/mobile/19-intake.png — Answer options expose "TIER A / B BOUNDARY" jargon → plain answer labels, tier shown after.
- M persona-engine/mobile/02-plan.png — Sticky nav covers Fri and Sat rows → add scroll padding above nav.
- M persona-engine/flows/session-follow-along/01-brief.png — Sticky nav cuts off Section 2 text on program detail → pad content above nav.
- M persona-mobility/mobile/01-day.png — "Log extra session" card hidden under sticky nav → pad content above nav.
- M persona-engine/desktop/01-day.png — Sticky bar covers rating form and Save at 1280 → constrain nav to content column.
- M persona-mobility/desktop/01-day.png — "Log session / Import GPX" cut off under nav → pad content above nav.
- M persona-muscleup/flows/session-follow-along/03-guided-working.png — "Full tutorial" box is empty placeholder → hide until media exists.
- M persona-muscleup/flows/session-follow-along/03-guided-working.png — Unlabelled "BOTH" pill → say "Both sides" or remove.
- M persona-rowing-mid/mobile/19-intake.png — Yes/no answers lowercase, "yes" orphaned on row two → title case, grid of three.
- M persona-engine/mobile/19-intake.png — "Baseline setup ... on the wizard" jargon in program detail → say "the setup questions".
- M persona-engine/mobile/13-check.png — "The engine reads these" is internal jargon on morning check → say "Your plan reads these".
- M persona-engine/mobile/13-check.png — Sticky "Update check" bar covers region text mid-scroll → pad content above button.
- M persona-engine/mobile/03-account.png — No sign-out visible on account page → verify and add if missing.
- M persona-engine/mobile/05b-record.png — Log rows say "logged", "1 run", "2 done" with no meaning → one consistent label.
- M persona-rowing-mid/mobile/05b-record.png — "Sessions 0 / 0" while an endurance session is logged → recount or label correctly.
- M persona-engine/mobile/06-programs.png — Program carousel card clips right edge, CITED badge cut → fit card or add scroll hint.
- M persona-muscleup/mobile/07-programs-active.png — "Levels: Prep → Transition → First Rep" jargon → plain stage names.
- M persona-mobility/mobile/02-plan.png — "Sotts press" looks misspelt → check spelling of "Sots press".
- M persona-rowing-mid/mobile/05b-record.png — "-2S SECONDS SINCE BASELINE" awkward wording → "2 s faster than baseline".
- M persona-rowing-mid/mobile/10-report.png — "Threshold pace mid-block" tile duplicates current tile → drop duplicate.
- M persona-mobility/mobile/05b-record.png — Retest dots unlabelled and "+12.0" wraps alone → label dots, keep delta on one line.
- M persona-mobility/mobile/01-day.png — "Trending well on turkish get-up hold ti..." truncated → show full line or shorten copy.

## L (polish)
- L persona-engine/mobile/19-intake.png — Step progress bar nearly invisible at 1 of 23 → thicker bar, higher contrast.
- L persona-rowing-mid/mobile/16-session-today.png — Session card floats in a large empty area → anchor card, tighten layout.
- L persona-rowing-mid/mobile/01-day.png — "Import GPX" jargon in extra-session card → "Upload a GPX file".
- L persona-mobility/mobile/13-check.png — "41 green · 19 amber" style tiles wrap mid-value → shorter tile copy.

## Scores (10 = best)
- Text density: 4
- Text size: 6
- Visual richness: 5
- Consistency: 3

Counts: B 6, H 13, M 27, L 4 (50 findings).

Checked: 45 screenshots
