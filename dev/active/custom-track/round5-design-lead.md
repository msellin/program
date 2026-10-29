# Round 5: design lead (2026-10-28), 1-10, 10 = best of GOWOD/Runna/Pliability at that job
Looked at: v4 393x852 + 375x667 individual shots (01,02,02b,03,06), peers sheet-player, round4-applied, code.
Scores: brief 8.2 | player 8.0 | rest 8.3 | done 7.6 (round 4: 7.5 / 7.0 / 7.5 / 6.5). Honesty + logging beat peers; richness/"video-led workout" feel trails.
[B] = blocked outside code. Limits respected: no YouTube pre-tap, flat bronze, confirm-first, no full-plan features.

## Player 8.0 -> 10
G1 SetView.tsx:~518-536 (393x852): ~90px void between chip rail and the number remains (02-player-set1). Make the number block
   `justify-center` in a flex-1 region, or grow band to 44vh on set 1-2 (top set keeps 22vh). Done button stays pinned.
G2 SetView.tsx:~440 header: 4 grey dashes still unfilled-looking at set 1. Bronze fill per finished exercise + 3px height, full width above header row.
G3 SetView.tsx:959-966: Change weight / Missed still two equal outlined buttons under Done (375x667 crowded, dev badge overlaps). Make both h-11 text links,
   no border, Done the only boxed object. Frees ~20px at 667.
G4 SetView.tsx:~530: "18 left today" stays a second line; fold into the exercise subtitle ("Exercise 1 of 4 . 18 sets left") and drop a row at 667.
G5 SetView.tsx:~505 (667): on the top-set screen the figure shrinks to a 40px thumb + separate Watch demo row (03). Put the pill inside the thumbnail
   row's right edge ("Demo >") so one row, not two. Rep grid 2x5 not 5+5 is already tight; keep.
G6 [B] Real motion: peers play video/loops; our figure is the ceiling. Remaining +1.5 needs finished figures for hip thrust, SL RDL, hollow hold (parallel
   session) and, only if the owner says yes, Q1. Without both: player caps ~9.0.

## Rest 8.3 -> 10
G7 RestTakeover.tsx:339-405: effort question is below Next up; move "How did that feel?" directly under the ring (effort is the product), Next up under it.
G8 RestTakeover.tsx:~397: helper is 3 lines at 375 (02b). Cut to one: "Sets your next training max. You decide." Gains ~34px so +30s/Skip sit higher.
G9 RestTakeover.tsx:339: 40px figure left of "Set 2 of 8 . 90 kg x 5" (Runna next-card); nothing when no figure. [B] figure coverage.
G10 RestTakeover.tsx:480-495: Add a note + Switch exercise are two full-width rows under Skip; move both into the "..." menu <760px (Skip rest alone owns the thumb zone).
    Also dev badge overlaps Switch exercise only in dev; ignore.

## Done 7.6 -> 10
G11 DoneSections.tsx:6 DoneStats: three bordered boxes still the heaviest object while Best set is the hero. Borderless trio, 32px numerals, hairline dividers.
G12 SessionDone.tsx:94-96: merge BestSetCard into the movement list: one card, best set promoted as row 1 headline, remaining rows "2 sets . best 90 x 5".
    Today four stacked cards (stats, best, TM line, next) + a fifth thin row; target two: result card, next session.
G13 SessionDone.tsx:~113: TM line is correct but wordy (3 lines). "Block pull training max stays 126 kg. Nothing changes without you." (2 lines); pair with a log signal when one exists.
G14 SessionDone.tsx movement rows: 40px figure per row. [B] figures.
G15 Empty band between list and button on 852 (06): not a defect per se; add a week-so-far line ("2 of 3 sessions this week", from the log) in that space. Names the log signal.

## Brief 8.2 -> 10
G16 BriefView.tsx cards 2-4 (01-brief): bare title + "4x8". Add top-set line ("4x8 . 60 kg", from last log) and 40px figure. [B] figure; the line is code-only, do now.
G17 BriefView.tsx hero: "Last week: 100 x 5, 2 left" under the title on card 1 (names the log signal). Week dots remain rejected.
G18 BriefView.tsx:439-456: "How to run this" + "Log an extra session" are two 56px rows; merge into one "More" row (~40px) so Start has air at 667 and the list is the page.
G19 BriefView.tsx:207: "Why these weights" card is fine; make the % ("81%") a bronze-weight numeral, not same-weight text.

## Q1 skipped per brief. Blocked summary: G6, G9, G14, G16 (figure part) = figures; G6 remainder = owner Q1. All others are code-only.
