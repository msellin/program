# Round 6: design lead (2026-10-29), 1-10, 10 = best of GOWOD/Runna/Pliability at that job
Looked at: v5 individual PNGs at 393x852 AND 375x667 (01, 02, 02b, 02c, 03, 04, 06), peers sheet-player/sheet-overview, code.
Scores: brief 8.8 | player 8.8 | rest 8.9 | done 8.2 (round 5: 8.2 / 8.0 / 8.3 / 7.6). Mean 8.7.
[B] = blocked outside code. Limits held: no YouTube before opt-in/tap, flat bronze, confirm-first, no full-plan features.
Q1 settled: autoplay opt-in is built; it is what moved player 8.0 -> 8.8. A live clip beats GOWOD's loops on honesty, not on polish (YouTube chrome, title overlay).

## Player 8.8 -> 10
G1 SetView.tsx ~518-536 (852): ~90px void between chip strip and number on set 1 (02-player-set1) is still there. Put the number block in a flex-1 region with justify-center.
G2 SetView.tsx:971,982,1035,1042 (both): Change weight / Missed are still two boxed h-11 buttons under Done; at 667 they are the dev badge's neighbours and crowd Done. Make them text links (no border), Done the only boxed object.
G3 SetView.tsx autoplay frame (667, 04-player-15-sets): frame renders solid black until the clip loads. Keep the figure visible beneath the iframe until the player reports "playing", then cross-fade (instant under reduced motion).
G4 SetView.tsx:~594-597, 667 demo-open (02c): opt-in row ("Play demo clips automatically?") + Hide demo + chips + Done leave no air. After Yes/Not now the row must disappear; Hide demo shares the caption row (already). Cap opt-in to one line: "Autoplay demos? Loads from YouTube."
G5 SetView.tsx:611: fold "18 sets left today" into the subtitle ("Exercise 1 of 4 . 18 sets left") so the set row is only "Set 1 of 5". [667 gains one row.]
G6 [B] Figures for hip thrust / SL RDL / hollow hold; without them the thumbnail-less rows read unfinished. YouTube overlay chrome (channel title, CC) is third-party, not fixable; cropping the iframe 8% top is allowed and hides the title bar.

## Rest 8.9 -> 10
G7 RestTakeover.tsx:339-350 vs effort block (852, 02b): Next up still sits above the effort question with an empty band between them. Order: ring, "Reps left in the tank?" (the product), then Next up, then +30s/Skip.
G8 RestTakeover.tsx:~397 helper: shorten to "May set your next training max." (one line at 375; it is two now with the headline).
G9 RestTakeover.tsx:477-492: Add a note and Switch exercise are still two full-width rows under Skip rest. Move both into the "..." menu below 760px; keep the existing-note preview as a caption under the ring when a note exists.
G10 [B] 40px figure beside Next up (Runna next-card); needs figure coverage.

## Done 8.2 -> 10
G11 SessionDone.tsx:~96 + DoneSections BestSetCard (both): single-exercise day shows Best set card AND a one-row movement list saying the same "52.5 x 5". When movements.length === 1 drop the list row; with 2+ fold best set into row 1.
G12 SessionDone.tsx (375, 06): Next session card is clipped under the pinned Back to Today and the heading "Done" is bare. Reduce stacked cards to stats, best set, TM line, next; make the TM section a two-line row (label + value on line 1, shortened helper "Changes only when a top set earns it." on line 2) so Next session shows above the fold at 667.
G13 SessionDone.tsx heading: "Done" -> "Session done" with the day ("Thursday . front squat day"). Names the log context.
G14 SessionDone.tsx (852 void): a week-so-far line ("2 of 3 sessions this week", from the log) in the empty band. Log signal, no new plumbing beyond counting log days.
G15 [B] 40px figure per movement row; figures.

## Brief 8.8 -> 10
G16 BriefView.tsx session list rows 2-4 (01): "4x6 each side" with no load. Add the top-set weight from the last log ("4x6 each side . 20 kg"). Code-only.
G17 BriefView.tsx hero (01): add "Last Thursday: 52.5 x 5, 2 left" under the title; names the log signal (card says it, hero does not).
G18 BriefView.tsx:441-458 (852): the bordered "How to run this / Log an extra session" list is right; at 667 it is below the fold behind Start. Acceptable; if more room is needed, collapse into one "More" row. Do only if G17 pushes the list off.
G19 BriefView.tsx "Why these weights" (both): make "69%" a bronze semibold numeral.
Blocked summary: G6 figures, G10, G15 = figures; YouTube chrome = third party. Everything else code-only.
