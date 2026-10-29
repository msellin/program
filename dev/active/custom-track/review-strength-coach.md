# Strength-coach review: Wednesday pull brief and set player

Scope: screens only. No change to loads, gates, thresholds or program. Evidence: 393x852 shots 01-04, SetView.tsx L102-115 (prev row), L585-605 (Last time / plates).
Benchmarks: Hevy / Strong / Fitbod show a set table (set | previous | kg | reps | tick) with the current row highlighted, warm-ups tagged W, and a rest timer on tick.

## Scores (lifter's view, 1-10)
- Brief: **6.5**. Clear hero, honest "whole session" list, one-line top-set summary with %TM. Loses points: the main-lift row is a run-on string that wraps ("77.5 x 5 . 90 x 5 . 102.5 x 5+ . 5 x 77.5 kg"); accessories say "4 sets" with no reps or load; the top-set card repeats the same numbers a third time.
- Player: **6.0**. Big weight/reps is right for a barn-floor glance and plate math is genuinely useful. Loses points: "Last time" is wrong for most sets (below), the 8-tile rail truncates ("77...."), and there is no rest cue or set list to see what comes next.

## (a) Brief, priority order
1. What is the main lift today and at what top-set weight (have it: 102.5 x 5+, 81% TM).
2. The ramp, as a compact ladder: "77.5 / 90 / 102.5+ x 5, then 5x77.5". Prefer plain "x5" once, not "x 5" four times. Showing every set weight of the main lift is right ONLY for this 3-step ramp + FSL; do not list 8 sets. Compact form wins: weights as a ladder, reps stated once, FSL as one "then 5 x 77.5 (FSL)" chip.
3. Accessory dose: "4 x 8", "3 x 8 per side", "3 x 30 s" (reps are authored: 4x8, 3x8/side). Last used weight beside it if logged ("last 60 kg"). "4 sets" tells a lifter nothing about whether to load the bar.
4. Time/length ("about 60 min") fine. Cycle label "Cycles 3 + 4 (with 1RM test)" is noise on a day card; move to Plan.
Noise: the third restatement (Today's top set card) duplicates row 1+2. Keep ONE: either the hero row or the card, not both. MAIN pill is fine; thumbnail on a barbell lift is decoration at 32px.

## (b) Set screen, priority order
1. Weight, reps, and a state tag (WARM-UP / TOP SET / FSL / BACKOFF). Today set 1 and set 3 are both just "SET"; only the padded 20-set shot says TOP SET and it is at 90 kg: label must follow the role of the set, not the position.
2. Plates per side (25 + 2.5 + 1.25 /side): USEFUL on barbell lifts, keep, one quiet line as now. Noise on hip thrust only if it hides the bar-only loads; it is fine there too. Never show it for bodyweight/DB.
3. Previous, correctly matched (below).
4. Rest timer after Done (not seen in any shot; the single biggest gap versus Hevy/Strong).
5. Next set preview ("Next: 90 x 5") so the lifter can pre-load plates during rest.
6. RPE: only on the top/AMRAP set, as an optional post-set chip. Not on warm-ups.
Noise: "Something hurt" + overflow in the top bar compete with exercise tabs on 375 wide; fine to keep (safety) but it takes the space the exercise name needs ("Block pull, m...").

## "Last time" semantics (the real defect)
Now: same set index last session, else the last logged row. Shot 02: set 1 is 77.5 kg, Last time says 101 x 5, i.e. last time's TOP set shown against this warm-up; shot 03 identical. A lifter reads it as "I did 101 last time, today's 77.5 is a drop". Misleading, and it undermines the REP PR tag trust.
Recommendation, in order of what a 5/3/1 lifter wants:
- Warm-up and FSL sets: compare to last time's set at the SAME WEIGHT (or same role), label "Last at 77.5: 5 reps". If none, say nothing rather than a wrong number.
- Top/AMRAP set: compare to last session's top set, label "Last top set: 101 x 5" and add the target to beat ("beat 5 reps" or the rep that makes a PR). Do not show it on warm-ups.
- Do not use plain index matching as the primary rule: padded or reordered sets make index meaningless (shot 04 shows set 20 matching a 101 x 5 row).
- Label must say what it is: "Last top set" / "Last at this weight", never bare "Last time".
Prescribed vs logged side by side (Hevy Previous column): yes, as a compact set table under the big numbers (rows: 77.5 x5 done, 90 x5 done, 102.5 x5+ now, then FSL), replacing the unreadable truncated tile rail. Tiles at 8 sets already truncate; at 20 (shot 04) they are illegible, 9px text.

## AMRAP "+"
"5+ reps" and the rep grid "REPS YOU GOT ON SET 3" are mostly clear; the "10+" tile is ambiguous (does it open a stepper?). Add one-line hint under the title: "As many clean reps as you can; stop 1-2 short of a grind". Keep the green REP PR tag, it is the best motivation on screen. Keep "+" in the brief too.

## Accessory with no prescribed load (hip thrust, single-leg RDL, hollow hold)
Show in this order: dose (4 x 8), last weight used and its reps ("last 80 kg x 8"), then the weight stepper pre-filled with that. Per-side lifts say "per side" in the headline, not only in the list. Hollow hold shows time and a timer, not reps. If no history: "Pick a load you can do 8 clean" in one line.

## Quick wins (UI only)
1. Re-key "Last time" per rules above and rename the label.
2. Tag every set by role (WARM-UP, TOP SET, FSL).
3. Brief: reps+load on accessory rows; drop the duplicated top-set card or the row.
4. Replace tile rail with a small set table; add rest timer and "Next:" line.
