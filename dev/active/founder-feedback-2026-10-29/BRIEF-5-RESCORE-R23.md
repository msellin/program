# Rounds 2–3 rescore after the build (live cd5abde)

Your round-2/3 reports (`08`–`14-r*-*.md`) and the consensus (`00-summary-r2-r3.md`) are what was built. Evidence:
ONLY the live captures in `shots/r23/` (412×915; full-page captures show the fixed bottom nav mid-page — ignore
that). Persona data is synthetic (hip persona `e2e-persona-recover`, strength persona `e2e-persona-strength`).

**Set screens** (`set-sled.png`, `set-nordic.png`, `set-bulgarian.png`, `hip-brief.png`). Built: per-exercise
`logging` kind in `exercises.json` (`load_reps` / `bodyweight_reps` / `load_optional` / `distance_load` /
`time_hold`); never "0 kg" — Nordic shows reps only, sled shows "20 m · — kg" first time, optional-load lifts show
"Bodyweight" + "Add weight"; "Change weight" only when there is a weight; guided figure loops before Start.
Code: `components/follow-along/SetView.tsx`, `FollowAlong.tsx`, `app/session/DaySession.tsx`.

**Plan + Profile** (`plan.png`, `plan-row-open.png`, `profile.png`, `profile-full.png`). Built: Plan intro line
and "2 TRACKS" chips gone, phase merged into the week switcher, one status dot per day row, legend out of the
header; Profile programs first, no INTAKE PENDING on programs in use, Away days off Profile, MORE trimmed, Working
maxes hidden when empty, STAFF chip gone. Code: `app/plan/page.tsx`, `app/profile/page.tsx`. Round-3 baseline:
Plan 6, Profile 6.

Score each screen you were given 1–10 now. What is still wrong, as `- [B/H/M/L] issue → fix` (B = blocks the ad
test, H = fix now, M/L = later), max 6, with file:line where you can. Write `<NN>-r23-rescore-<lens>.md`
(≤ 20 lines) in `dev/active/founder-feedback-2026-10-29/`. Reply with scores and your [B]/[H] items only.
Don't edit code.
