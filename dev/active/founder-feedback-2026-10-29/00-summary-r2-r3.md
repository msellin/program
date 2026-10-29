# Founder feedback rounds 2–3: panel consensus (2026-10-29 evening)

## Round 2 — set screens (coach, design lead, copy: `08`–`10-r2-*.md`)
Unanimous.
- **Logging kind per exercise** (BUILD): optional `logging` in `exercises.json` — `load_reps` (default for
  strength/unilateral) · `bodyweight_reps` · `load_optional` · `distance_load` · `time_hold` — replaces the category
  proxy at `DaySession.tsx:598`; a data-integrity test requires it where the default is wrong. Never parse the plan's
  free-text scheme.
- **Never "0 kg".** Nordic: "5 reps", Done "Done · set 1 · 5 reps", no kg stepper (coach: variant chip Full / Band /
  GHR as the progression signal). Sled: "20 m · 40 kg" with `distance_m` on the program item; first time "— kg",
  then last load prefilled; the engine never suggests a sled load. Optional-load lifts show "Bodyweight" + "Add weight".
- Coach's library scan: distance+load `sled_push`, `farmer_carry`, `pu_farmers_carry`; bodyweight `nordic_curl`,
  `hs_wrist_pushups_floor`, `hs_wall_supported_shrugs`; time `copenhagen_short`; band `banded_march_standing`;
  optional load `split_squat_rfe`, `single_leg_rdl`, `bulgarian_split_squat_db`, `weighted_pullup`, `dip_weighted`.
- **Guided figure loops before Start** (CHANGE ×3), resets at Start, still only under reduced motion
  (`FollowAlong.tsx:216`).
- Copy: title "Nordic curl" + quiet "Or: GHR, slider leg curl"; "Change weight" only when there is a weight.

## Round 3 — Profile and Plan (design lead, mobile UX, copy, visual: `11`–`14-r3-*.md`)
Scores: Plan 6 → 8.5 (lead, mobile, visual), copy 6 → 8; Profile 6 → 8 (lead).

**Plan — all four:** drop the intro line, drop "2 TRACKS" from every row, merge the phase into the week switcher;
first day row at ~20% of the screen instead of ~36% (mobile measured ~330px → ~130px). Legend out of the header
(popover, or the week strip doubles as legend).
**Plan dots — split:** visual: one shape per day (done ring / partial / planned / skipped / moved, today bronze) and a
7-ring week strip; lead: stable hue per program, fill = state, no dots with one program; mobile: one status dot per
row, per-program detail when expanded. All agree today's bronze must not be a fifth unexplained colour.

**Profile — all four:** Programs first; stop showing INTAKE PENDING on programs in use (`profile/page.tsx:227`);
Away days off Profile for the MVP (lead + mobile: becomes a Plan day action; copy: one "Time off" row with a
plainer explainer; visual: cut); MORE trimmed — Extra session to Today, Report to Record, Evidence into Guide,
Re-run intake into a per-program sheet ("Update my answers"); keep Send feedback + Guide. Hide Working maxes when
empty; show a skill program's level on its program row. Copy: drop the STAFF chip; End/Remove behind a program sheet.
