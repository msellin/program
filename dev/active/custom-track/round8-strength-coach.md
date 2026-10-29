# Round 8: strength coach, v7 screens (375x667 + 393x852)
Scores 375 / 393. Benchmarks GOWOD/Runna/Pliability (media), Hevy/Strong (logging).

| Screen | 375 | 393 | Why not 10 |
|---|---|---|---|
| Brief | 9.3 | 9.5 | rows 2-4 still no load chips ("4x6 each side" gives no kg); card "3/17" vs player "18 sets left"; SE row 4 faded behind Start (sled row unreadable) |
| Player | 9.3 | 9.5 | no "Last: 52.5 x 5" per set (Hevy/Strong's core); chips show no miss mark; 375 set 1 figure is a 20vh strip; 375 02c clip open: weight is a clipped sliver behind Done; "Per side" line hugs Done at 393 |
| Rest | 9.4 | 9.5 | no "Last time" under Next up; SE stacks RIR + helper + 30s/Skip + note + Switch below the ring; Switch exercise is a full-width button |
| Done | 9.1 | 9.2 | "3/30 Sets of plan" tile + "Session done" for a stopped day; "1 Exercise" tile dead weight; no volume/vs-plan; 393 void between Training max and Next session |

Q1: opt-in autoplay (Yes / Not now row is built and reads well) lifts Player media ~9.4 -> ~9.8. Last 0.2 is real per-exercise footage.

## Changes to 10 (screens only, no load/program change)
G1 Done: title "Session stopped" (or Best set sublabel "3 of 5 sets") when required sets are incomplete; tile "3/30" -> "3 of 5 sets" for a one-lift day. SessionDone.tsx, DoneSections.tsx.
G2 Done: replace the "Exercise 1" tile with volume (kg, "t" from 1000) on single-lift days; keep Reps.
G3 Done 393: pin only the button and move Next session up under Training max so no void; same on 375.
G4 Done: "On plan" / "Planned 52.5 x 5" under Best set. BLOCKED: planned kg/reps not plumbed into BestSetCard (data wiring).
G5 Player: "Last: Fri 52.5 x 5" under the reps line for each working set (matching-row logic in SetView.tsx).
G6 Player: chip strip marks a miss (struck weight) as well as the tick.
G7 Player 375 clip open: hide the weight/PR block's overlap, i.e. shrink clip frame or collapse the autoplay prompt after one answer so the 52.5 kg is fully above Done.
G8 Player 375 set 1: lift band 20vh -> ~26vh (slack exists above the PR chip).
G9 Player: keep figure visible until the iframe reports playing. BLOCKED: needs on-device check (YouTube blocked in test browser; black frame may be capture-only).
G10 Rest: "Last time 52.5 x 5" under the plates line (same source as G5).
G11 Rest SE: RIR tiles + helper as one block; Switch exercise into the "..." menu.
G12 Brief: top-set chip on rows 2-4 with a load; bodyweight rows reps only.
G13 Brief: one set count for the card badge and "sets left" (3/17 vs 18).
G14 Brief 375: ~12px more bottom padding so row 4 clears Start.
Not scored: shot 04 "Set 17 of 17 / 27 left" is the padded fixture.
## Blocked outside code
Real per-exercise footage (Player ceiling ~9.8); G4 data plumbing; G9 device check.
