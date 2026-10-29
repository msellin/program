# Round 7: strength coach, v6 screens (375x667 + 393x852), Q1 answered
Scores 375 / 393. Benchmarks GOWOD/Runna/Pliability (media), Hevy/Strong (logging).

| Screen | 375 | 393 | Why not 10 |
|---|---|---|---|
| Brief | 9.2 | 9.4 | rows 2-4 no load chips; "3/17" (05) vs 18 sets left; row 4 half-faded behind Start on SE |
| Player | 9.2 | 9.4 | 375 set 1: 20vh band is a thumbnail; no "Last 90 x 5" per set, no miss mark on chips; 375 02c "PR at 5" badge cut under Done; clip frame black in capture |
| Rest | 9.4 | 9.5 | no "Last time" under Next up; SE stacks 5 blocks below ring |
| Done | 8.8 | 9.0 | 3 of 5 sets still "Session done"; stat tile "Exercise 1" dead weight; no vs-plan/volume; 393 void between stats and Best set |

Q1: with opt-in autoplay (already built: Yes / Not now row) Player media goes ~9.4 -> ~9.8 (Pliability/GOWOD parity). Last 0.2 is real per-exercise footage, not code.

## Changes to 10 (screens only, no load/program change)
G1 Done: "3 of 5 sets" on the Best set sublabel, or title "Session stopped" when required sets are incomplete. SessionDone.tsx:85, DoneSections.tsx:30.
G2 Done: replace the "Exercise 1" tile with volume (kg; "t" from 1000) on single-lift days. DoneSections.tsx:9.
G3 Done 393: pin only the button; move Next session up under Best set so no void under the stat row. SessionDone.tsx layout.
G4 Done: "On plan" / "Planned 52.5 x 5" line under Best set. Needs planned kg/reps plumbed into BestSetCard.
G5 Player: "Last: Fri 52.5 x 5" under reps for every working set (matching-row logic exists, SetView.tsx:153; render near :755).
G6 Player: chip strip marks a miss (struck weight) as well as the tick. SetView.tsx chip render ~:595-640.
G7 Player 375: PR badge (SetView.tsx:705) collides with Done button when the clip is open; reserve its row or hide the badge while demo is open on short phones.
G8 Player 375 set 1: lift band 20vh to ~26vh now that the weight block has slack (dead band above PR badge, 02/03).
G9 Player: until the iframe reports playing keep the figure visible (DemoVideo.tsx); confirm on a device, black frame may be capture-only.
G10 Rest: "Last time 52.5 x 5" under the plates line (RestTakeover.tsx:373), same source as G5.
G11 Rest SE: RIR tiles + helper as one block; "Switch exercise" (RestTakeover.tsx:492) into the ... menu.
G12 Brief: chips + top-set label on rows 2-4 with a load; bodyweight rows reps only. BriefView.tsx card row.
G13 Brief: one set total for the badge and "sets left" (3/17 vs 18). BriefView.tsx ~:526 vs SetView.tsx:343.
G14 Brief 375: ~12px more bottom padding so row 4 clears Start.
Screenshot note (not a design flaw): 04 shows "Set 17 of 17 · Extra set / 27 left" from the padded fixture, so not scored.

## Blocked outside code
Real footage per exercise (ceiling Player ~9.8 until it exists); G4 needs data plumbing; G9 needs on-device check (YouTube blocked in test browser).
