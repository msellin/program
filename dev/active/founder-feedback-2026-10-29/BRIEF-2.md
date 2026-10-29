# Founder feedback round 2 (2026-10-29 evening): brief

The founder trained the Thursday hip block on the live app after the round-1 build and sent three phone screenshots
(not on disk; described here):
1. **Guided player, single-leg glute bridge.** Figure tile with "Watch demo"; LEFT chip; "Set 1/4 · Step 17/34";
   title; one cue line; big ring "10 reps"; "Next: right side"; "Something hurts"; Back / Start / Skip set.
2. **Set player, "Heavy sled push or drag", exercise 4 of 4.** Figure (pushing a sled); "Set 1 of 6", six set
   tiles; big "0 kg × 1"; primary "Done — set 1 · 0 kg"; secondary "Change weight". No metres anywhere.
3. **Set player, "Nordic curl (or GHR, or slider leg curl)", exercise 3 of 4.** Figure (kneeling); "Set 1 of 3";
   big "0 kg × 5"; "Done — set 1 · 0 kg"; "Change weight".

## His questions
A. **Motion.** One screen's figure moves, the other's doesn't. Intentional?
B. **Sled push.** No kg suggested. "× 1" is OK, but how much is one: how many metres?
C. **Nordic curl.** What does "0 kg" mean? Why 0, why kg? It's a bodyweight exercise.

## Facts the lead established in code
- A: the guided player (`components/follow-along/FollowAlong.tsx:216`) draws the figure still until Start
  (`getElapsed` returns 0 outside the work phase); it moves during a set. The set player (`SetView.tsx`) loops the
  figure all the time since today's fix (it had a seconds/ms bug that made it look frozen).
- B/C: `DaySession.tsx:598` marks a rail item loadable when the exercise's `category` is `strength` or `unilateral`.
  `nordic_curl` and `sled_push` are both `strength` in `public/data/exercises.json`, so both get the kg counter, and
  with no working max or previous log the suggestion is 0. The plan's prescriptions are free text:
  Nordic "3×5 eccentric", sled "6 × 20 m heavy" (`programs/anterior-hip-rebuild.json`, block_squat_variant). The
  app has no distance unit, so the sled reads as six sets of "× 1" with no metres anywhere on the set screen.
  Other loadable-by-category but really bodyweight or carry/distance work likely exists across the library
  (suitcase/farmer carries, single-leg work, ring/bar skills).

## Your job (your lens only)
Per point: what a lifter needs on that screen, what Terav should show (exact wording for the main number and the
Done button), and the smallest correct mechanism — e.g. a per-exercise logging kind in `exercises.json`
(load × reps / bodyweight reps / added-load optional / distance + load / time) vs. parsing the scheme text. Say
whether the guided figure should loop before Start. Peers (Hevy, Strong, Fitbod) as idea sources only. Shared
`exercises.json` copy stays general; the engine stays confirm-first.

Write `dev/active/founder-feedback-2026-10-29/<NN>-r2-<lens>.md`, ≤ 30 lines, ending with a vote per point
(BUILD / CHANGE / KEEP) and your top 2. Reply with the votes and top 2 only. Don't edit code.
