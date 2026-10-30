# Redesign P1: tasks

<!-- SUPERSEDED-BY: dev/active/ROADMAP.md -->
> **Not maintained since 2026-10-30.** The one task list is `dev/active/ROADMAP.md`. Every open item here was
> checked against the code (`dev/active/roadmap-reconcile/`) and the live ones moved there. Statuses below are history.


- [x] L1 Session brief: exercises first, one compact "how this runs" line, footer ≤ ~15% of 375×667, no nested scroll
- [x] L2 Figures: bronze accent on working limb/bar, tinted ground, heavier stroke
- [x] L3 Today hero card: figure, focus, duration, Start; then week strip + readiness
- [x] L4 Check: sticky bar no longer covers severity chips; chips ≥ 44px; nav labels 12–13px; line-strong on surface-2
- [x] L5 Quick-start plan screen: H1, consent ≤ 25 words, ladder labels not truncated; Plan jargon, Pull-Up spelling, rest days not "Skipped"
- [x] L6 Session done: best set / PB, ladder tick, next session
- [x] L7 Mono sweep: sans for chips, footers, descriptions
- [x] Verify, deploy, confirm live
- [x] Re-shoot ad path from live, rescore (1–10) (7fb23c6)

## Notes (2026-10-28)
- L5 had bundled every consent into one generic checkbox; reverted. Health-data consent and each program's stop rule stay
  separate checkboxes; their labels were shortened in the program JSON instead (red flags kept).
- L5's render-time regex rewrite of the pull-up phase goal replaced by a data fix in `first-strict-pullup.json`.
- Local run: vitest 1245/1245; launch-gaps + personas 33 passed, 1 skipped.
- Pre-existing harness gap (not P1): flows.ts looks for a "Log a run, row, or class" button; the Brief has called it
  "Log an extra session" since before P1, so activity-log-sheet / offplan-drill-library / activity-log-commit skip for
  every persona.
