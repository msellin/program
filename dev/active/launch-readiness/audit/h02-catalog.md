# H02 catalog ad-readiness (2026-10-27, read-only). Public catalog = 8 (page.tsx:109 hides personal and DRAFT/PROVISIONAL)
| id | wk | diff | intake req/total | one-line outcome (quote, yes/no) | personal / half-built | ad? |
|---|---|---|---|---|---|---|
| anterior-hip-rebuild | 34 | intermed | none | "For lifters with a history of anterior-hip / groin irritation..." (21w, no) | personal:true; phases 35.5 vs 34 | no, hidden/clinical |
| engine-builder | 8 | beginner | 13/19 | "Block 1 of a 3-block, ~6-month engine transformation" (no, jargon) | promises unshipped Block 3 | no until copy fixed |
| handstand-walk | 8 | multi | 14/14 | "from wall-supported beginner to advanced turns and obstacles" (yes) | citation authors "placeholder" (fixed 09-05) | yes, heavy intake |
| concurrent-strength-maintenance | 8 | intermed | 9/9 | "For lifters adding cardio without losing the squat" (9w, yes) | needs known 5RM | yes, best fit |
| rowing-2k-test-prep | 6 | intermed | 10/11 | "For rowers chasing the 2K PR" (yes, niche) | needs Z2 base | yes, niche |
| overhead-mobility | 10 | multi | 10/10 | "Shoulder + thoracic + scap sequence..." (no, jargon) | none | no |
| first-strict-pullup | 8 | multi | 11/11 | "Grip → scap → negative → band → unassisted" (process, partial) | status_history only | yes, name is outcome |
| muscle-up | 10 | multi | 12/12 | "Multi-tier strict ring muscle-up program" (yes) | gated: 3 pull-ups + 3 dips | yes, narrow |
| engine-builder-block-2 | 10 | multi | 11/15 | "Block 2 of the 3-block engine transformation" (no) | needs Block 1 first | no |

Top 3 to advertise: 1) concurrent-strength-maintenance (shortest intake, clear quote). 2) first-strict-pullup (broad demand, 11 questions). 3) handstand-walk (clear outcome, 14 required questions, 5 physical tests).

Issues:
- [BLOCKS-ADS-TODAY] 7 of 9 short_descriptions exceed 15 words or are process-speak; write ad headlines by hand.
- [BLOCKS-ADS-TODAY] engine-builder says "3-block, ~6-month" but status_note says Block 3 does not exist.
- [BLOCKS-ADS-TODAY] Never mention anterior-hip-rebuild in any ad (personal, clinical).
- [BEFORE-SCALE] engine-builder intake is 19 questions (13 required) before first value; expect paid drop-off.
- [BEFORE-SCALE] Prereq gates (5RM, Z2 base, 3 pull-ups) are absent from ad copy; expect mismatched clicks.
- [LATER] PROVISIONAL/DRAFT strings in first-strict-pullup, muscle-up, block-2 are status_history only; live status is REFERENCED.

Not checked: live catalog render, landing copy, citation validity, app intake/gating logic, conversion or CPA data, Supabase state.
