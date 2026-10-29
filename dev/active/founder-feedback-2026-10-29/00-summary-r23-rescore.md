# Rounds 2–3 rescore (live cd5abde, `shots/r23/`): consensus and what was built

Lenses: coach `23`, design lead `24` (set) / `26` (Plan+Profile), copy `25` / `28`, mobile UX `27`, visual `29`.

| Screen | Coach | Lead | Copy | Mobile | Visual |
|---|---|---|---|---|---|
| set-sled | 7.5 | 8 | 7 | | |
| set-nordic | 8 | 9 | 7.5 | | |
| set-bulgarian | 6.5 | 6.5 | 7 | | |
| hip-brief | 7 | 7.5 | 7 | | |
| Plan (was 6) | | 6.5 | 6 | 7 | 7 |
| Profile (was 6) | | 7.5 | 8 | 8 | 8 |

No [B] items. "0 kg" is gone everywhere.

## [H] built (agreed by 2+ lenses unless noted)
- **Optional load leads with reps** (lead, copy, coach): "6 reps" big, "Bodyweight" / "+ 10 kg" under it; Done
  reads "Done · set 1 · 6 reps · 10 kg" once a load is set (coach). Coach's alternative (Bulgarian DB → `load_reps`)
  not taken: it would bring back "0 kg" on first use. `SetView.tsx`.
- **Empty sled load** (lead, copy): "— kg" → "No load logged yet"; button "Add load" until a load exists. No
  suggested load (engine never proposes a sled weight; copy's "Light to moderate" not taken).
- **Brief names the distance** (coach): "6 × 20 m", not "6 sets". `lib/prescription-line.ts` (+ test).
- **Set title = name; variant on the caption line** (copy; round-2 consensus): "Nordic curl", then
  "Or GHR, or slider leg curl · Exercise 3 of 4".
- **Plan missed-week card collapsed** (all four): one amber line "2 of 3 missed this week · 1 day left ·
  Fix the week ›", expanding to the three options; the grey explainer box and the long paragraph cut.
- **Plan day markers by shape** (lead, visual): filled check done, ringed check partial, empty ring planned,
  dashed amber ring + "Missed" word, amber minus skipped, slate arrow moved, dash rest.
- **Plan switcher** (lead, copy): "This week" muted after the range, phase on one truncated line. Copy's
  rename of "Cycles 3 and 4" left as data (the rename was deliberate in round 1; see context.md) — [M].
- **Day rows drop the repeated day** (copy): "Mon — heavy squat day" → "Heavy squat day".
- **Profile working-max warning named** (copy): "Doesn't match your log" under the lift, not a bare triangle.

## Leftovers fixed
Record "Check due" hidden on the summary once the hip section is open; Heaviest-set name truncates instead of
wrapping; unused `contributingProgramCount` removed (lint); Guide's "Extra session" row moved into Today's row
(it sat under "the rest live under Profile") and the stale Record row rewritten.
