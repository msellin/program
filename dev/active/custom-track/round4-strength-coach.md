# Round 4: strength coach, v3 screens (375x667 + 393x852, peer sheet-player)
Lifter's seat, chalk on hands, loaded bar. Benchmarks GOWOD/Runna/Pliability (media) and Hevy/Strong (logging).

## Scores (1-10)
| Screen | 375x667 | 393x852 | Why not 10 |
|---|---|---|---|
| Brief | 8.5 | 8.5 | chips unmarked as top set; no "why 81%" visible; no per-set status once started |
| Player | 8 | 8.5 | 56px weight (48 on SE) is smaller than Hevy's; no previous-session line on every set; band vs Done on SE |
| Rest | 8.5 | 8.5 | next-up weight now there (good); effort card still crowds the ring; no "last time" |
| Done | 6.5 | 6.5 | still thin: no volume, no top set vs plan, no TM verdict row; 2 sets look like a 1-line receipt |
Beats Hevy/Strong on plate maths and the confirm-first effort line; loses to GOWOD/Runna only on footage.

## Changes to reach 10 (screens only, no load/program changes)
G1 Done: add a "vs plan" line under Best set: "Top set 102.5 x 5+ planned, you hit 102.5 x 7" (or "Plan 90 x 5, hit 90 x 5"). done/DoneSections.tsx:19-26 (BestSetCard) + session-stats BestSet gets planned kg/reps.
G2 Done: add total volume tile (kg, tonnes if >=1000) as a 4th tile or replace "Exercise" when 1 exercise. DoneSections.tsx:6-15 (DoneStats).
G3 Done: always show a Training max row, never an empty slot: "Training max 126 kg: no change" / "Proposal waiting: review". SessionDone.tsx near :146 (above Back to Today). This is Terav's core line; an empty slot reads as a bug.
G4 Done: per-exercise rows show best set, not only "2 sets": "Block pull 90 x 5 . 2 sets". SessionDone.tsx exercise list row.
G5 Done: skipped/unlogged planned sets shown as "2 of 8 sets" so a stopped session is honest. Same row.
G6 Player: weight 56px -> 64px (48 -> 56 on max-height:700) by taking the gap above it; SetView.tsx:~629 and :~647 text-[56px]/[48px]. Hevy's number is the biggest thing on screen; ours is equal to "Done" button weight.
G7 Player: top set marker on chips: tiny bronze dot or "TOP" caption under 102.5 chip (strip at SetView.tsx ~590-604). Also the same on brief chips (BriefView.tsx chip row: "102.5x5+" gets a bronze dot).
G8 Player: "Last top set . Fri . 101 x 5" show for EVERY working set of a loaded lift (previous result for this set index), not only top. SetView.tsx:~664 (comparison). Strong's single most-used column.
G9 Player SE (375x667): after set 1 the band is already a thumbnail (good); also hide the "Next: set 2" caption when it duplicates the chip strip's next chip; frees ~18px for Done. SetView.tsx:~670 nextLine.
G10 Rest: move "How was that?" tiles below Skip/+30s only on SE (max-height:700) or collapse to one row "Easy / Right / Too hard" 44px; ring stays >=190px. RestTakeover.tsx ~ :37 tiles and layout order.
G11 Rest: show "Last time: 90 x 5" under Next up plates line (same source as G8). RestTakeover.tsx:373.
G12 Brief: "Top set at 81% of your 126 kg training max" gets a visible "Why?" affordance label (chevron alone is ambiguous). BriefView.tsx top-row.
G13 Brief in progress (05): per-exercise status "2 of 8 done . 90 kg" on the active card. BriefView.tsx exercise card.
G14 Player: "Change weight" + "Missed 77.5 kg" row is correct; "Missed" is the only place a failed set exists, keep, but label the failed state on the chip with a strike or "x" so strip shows hit/miss at a glance (SetView.tsx chip, ~:595).

## Q1 (autoplay muted after opt-in)
Player 8.5 -> 9.5 on 393x852, 9 on SE. Looping muted footage beside the weight is exactly what GOWOD/Pliability do, and for a barbell lift the bar path is the cue; but I would still want it only on set 1 of an exercise and frozen on the Done-button press so it never steals attention mid-set. Opt-in must be one sheet in Profile plus the first-play prompt; default off. A drawn figure is fine for a rep-5 lifter; footage matters for new movements (hip thrust, SL RDL).
