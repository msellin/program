# Round 6: strength coach, v5 screens (375x667 + 393x852, peers sheet-player)
Benchmarks GOWOD/Runna/Pliability (media), Hevy/Strong (logging). Scores 1-10, 375 / 393.

| Screen | 375 | 393 | Why not 10 |
|---|---|---|---|
| Brief | 9.0 | 9.2 | rows 2-4 carry no chips (only prescription); count mismatch "3/17" vs 3 done + 15 left = 18 (05); Start CTA fades row 4 on SE |
| Player | 9.0 | 9.3 | weight still 56 px, empty band above it on set 1 (393); chips show no miss and no "Last" per set; "Next: set N" caption redundant; demo (clip) loaded black in 04 |
| Rest | 9.0 | 9.2 | ring now fully visible, good; still no "Last time" under Next up; SE stacks 5 blocks under the ring |
| Done | 8.4 | 8.6 | "Done" with 3 of 5 sets reads as complete; no vs-plan, no volume; stat tile "Exercise 1" is dead weight; wide void on 393 |

Round 5 landed: opt-in autoplay, Hide demo row under frame, "18 sets left", RIR helper, TM row, Next session above CTA. Q1: with autoplay on, Player media parity with GOWOD/Pliability moves from ~9.3 to ~9.7 (the remaining 0.3 is real footage per exercise, not code).

## Changes to 10 (screens only; no load/program change; inside hard limits)
G1 Done: "3 of 5 sets" on the exercise row and best-set card sublabel; title "Session stopped" when required sets are incomplete OR keep "Done" but show "3 of 5". SessionDone.tsx:85, exercise row.
G2 Done: planned-vs-actual line under Best set ("Planned 52.5 x 5, you hit 52.5 x 5" / "On plan"). DoneSections.tsx BestSetCard; needs planned kg/reps passed in (code plumbing, not copy).
G3 Done: replace the "Exercise" tile with volume (kg; "t" at >=1000) when one exercise. DoneSections.tsx:9.
G4 Done 393: close the void: move Next session directly under the exercise list, pin only the button. SessionDone.tsx layout.
G5 Player: weight 56 -> 64 px (48 -> 56 SE) using the dead band on set 1. SetView.tsx:711/719/740.
G6 Player: "Last: Fri 90 x 5" under reps for every working set, same set index. SetView.tsx ~:153 (matching-row logic already exists), render near :719.
G7 Player: chip strip marks a miss (struck weight, muted x) as well as the tick. SetView chip render (~:595-640).
G8 Player SE: hide "Next: set N" caption when the next chip is visible. SetView.tsx:422.
G9 Rest: "Last time 52.5 x 5" under plates line, same source as G6. RestTakeover.tsx ~:339-360.
G10 Rest SE: RIR tiles + helper into one block, +30s / Skip as one row (already), drop "Switch exercise" below fold to the ... menu. RestTakeover.tsx:393+.
G11 Brief: chips + top-set label on rows 2-4 where a load exists; bodyweight rows show reps only. BriefView.tsx card row.
G12 Brief: fix set counter so the in-progress badge and "sets left" use the same total (3/17 vs 18). BriefView.tsx ~:526 split vs SetView.tsx:343 required-sets rule: pick one definition.
G13 Brief 375: leave 12px more bottom padding so row 4 is not half-hidden behind Start. BriefView scroll container.
G14 Player: verify autoplay frame never renders black (04 shows a black frame with "Muted loop"); show the figure until the iframe reports playing. DemoVideo.tsx.

## Blocked outside the code
- Real footage per exercise (hip thrust, SL RDL, hollow hold, figures from the parallel session): ceiling Player ~9.7 until clips exist.
- G2 needs data plumbing; G14 may be a headless-capture artefact (YouTube blocked in the test browser), confirm on device.
