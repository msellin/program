# Session duration (lane L5)

Rule (lib/session-duration.ts): `sessionMinutes(blocks)` sums authored `duration_min` of REQUIRED blocks
(block duration, else segments; `optional:true` skipped); ranges stay ranges (lo+lo, hi+hi).
`formatMinutes` rounds to 5: "about 30 min" if ends meet, else "25–35 min"; null if nothing authored.

## Prescribed (blocks the engine places via weekly_template layout; sessions <10 min excluded from envelope)
| program | prescribed envelope | old claims | new claims |
|---|---|---|---|
| first-strict-pullup | 18–35 (A 20–30, B/C 20–35, D 20–35) | range 15–30, tiers 15/20/20/25, load_hint 15-30, landing 15-30, brief "about 32" | range 20–35, tiers 25/25/25/30, load_hint + landing 20-35 |
| muscle-up | 18–32 (20–30 rounded) | range 20–35, tiers 25/30/30, load_hint 20-35, landing 20-35 | range 20–30, tiers 25/25/25, load_hint "~1.5-2 hr/week ... 20-30", landing 20-30 |
| handstand-walk | 20–28 (20–30) | tiers 12/15/15/18, load_hint 15-18, notes "12-minute", "10-18 min" | tiers 20/25/25/25, load_hint 20-30, notes updated |
| overhead-mobility | 5 (reset days) – 30 | range 10–20 | range 5–30 |
| engine-builder, -block-2, rowing, CSM | endurance/strength, ranges author-level; not changed | | |
Not changed: engine-builder(+b2), rowing-2k, CSM, anterior-hip (ranges are per-block authored, consistent with their manifests).

## Call sites for the lead to switch
- session/BriefView.tsx ~84 (`totalMinutes`: uses upper bound) -> `formatMinutes(sessionMinutes(blocks))`
- today/TodayHero.tsx `estimatedMinutes` (also sums upper bound) -> same function
- session/TodaySession.tsx ~607 `prescriptionMinutes` -> same function
- programs/[slug]/intake/quick-start-model.ts ~131: tier `session_length_min` (now data-fixed: 25/25/25/30 etc.) shows a bare number; fine, or render `~25`. Falls back to range.
- programs/[slug]/ProgramPreviewClient.tsx ~195 uses `session_length_min_range` (data now matches layouts).
- app/plan/page.tsx: shows no block-duration anywhere (only a logged run's own minutes, ~1110) -> nothing to wire.
Note: first-strict Mon tier A now reads "20–25 min" (was 32 in brief, 15 in plan, 15–30 on program page).
