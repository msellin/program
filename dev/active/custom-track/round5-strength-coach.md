# Round 5: strength coach, v4 screens (375x667 + 393x852, peers sheet-player)
Benchmarks GOWOD/Runna/Pliability (media), Hevy/Strong (logging). Q1 skipped.

## Scores (1-10)
| Screen | 375 | 393 | Why not 10 |
|---|---|---|---|
| Brief | 8.7 | 8.8 | only block pull has figure/chips; rows 2-4 bare; no "why 81%" on the card itself; in-progress card lacks per-set status |
| Player | 8.7 | 9.0 | weight 56px (48 SE) still < Hevy; "Last top set" only on top set; chips do not show hit/miss; dead gap above weight on 393 set 1 |
| Rest | 8.6 | 8.8 | tiles + helper still crowd ring on SE (ring clipped at top); no "Last time" under Next up |
| Done | 7.6 | 7.8 | no vs-plan, no volume, TM line is text not a row, 2-set session reads as a receipt |
Round 4 fixes landed well: best-set hero, TM line, Next up with plates, top-set dot.

## Changes to reach 10 (screens only; no load/program change)
G1 Done: "vs plan" line under Best set: "Planned 102.5 x 5+, you hit 102.5 x 7" or "On plan". DoneSections.tsx:17 (BestSetCard) + BestSet gets planned kg/reps (history.ts / session stats).
G2 Done: volume tile (kg, "t" at >=1000) replacing the "Exercise" tile when 1 exercise. DoneSections.tsx:6.
G3 Done: TM line as a labelled row "Training max 126 kg  No change" (bronze "Review" when a proposal waits); keep the "you decide" sentence. SessionDone.tsx:113.
G4 Done: stopped session honest: "2 of 8 sets" on the exercise row; unlogged sets not counted as done. SessionDone.tsx exercise row.
G5 Player: weight 56 -> 64px (48 -> 56 SE), spending the empty gap above it. SetView.tsx:635/643/664.
G6 Player: "Last: Fri 90 x 5" for every working set (same set index), not only top. SetView.tsx ~:664-680 comparison.
G7 Player: chip strip shows miss (strikethrough/red "x" on weight) as well as check. SetView.tsx chip ~:595.
G8 Player SE: drop "Next: set N" caption when next chip is visible in strip. SetView.tsx:680 (nextLine :390).
G9 Rest: "Last time 90 x 5" under plates line, same source as G6. RestTakeover.tsx ~:339-360.
G10 Rest SE: tiles to one row, helper behind "?" or one line, ring stays >=184 and fully visible. RestTakeover.tsx:393.
G11 Brief: every exercise card carries chips/figure + "Top set" label on the 102.5 chip; in-progress card "2 of 8 done". BriefView.tsx chip row / :198 card.
G12 Brief: "Why these weights" card shows one-line basis "81% x 126 kg" plus visible "Why?" label (chevron alone is ambiguous). BriefView.tsx:207.

## Blocked outside the code
- Figures for hip thrust, SL RDL, hollow hold (parallel figure session): G11 brief bareness and player media parity.
- Real footage vs GOWOD/Pliability: needs Q1 owner decision; without it Player ceiling ~9.3, Brief ~9.3.
- Planned-vs-actual (G1) needs planned values passed into session summary data (code, not screens, but not copy-only).
