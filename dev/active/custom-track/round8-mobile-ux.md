# Round 8 — mobile-UX lens (2026-10-29): v7 shots, all 20 PNGs at 375x667 + 393x852, peers sheet-player.jpg

Scores (10 = best peer at that job): Brief 9.5 (9.4) · Player 9.1 (9.0) · Rest 9.5 (9.5) · Done 9.4 (9.0)
Peers (GOWOD, Runna, Pliability) give the clip 40-50% of the screen and put the timer/controls in the bottom third; Terav matches the controls, loses on clip-first.

## Brief 9.5
375 01-brief: row 4 still a faded sliver under Start; 393 clean (all rows + links, Start y~756).
G1 BriefView:178 `pb-28` -> `pb-32` at `[@media(max-height:700px)]` only so row 4's title clears the fade (reads as scrollable, not cut).

## Player 9.1
393 02/03: right. 393 04: "Next: Bulgarian split squat" is cut by the Done button (y~715) -> bug. 375 02c: the weight is still under Done (only a "52.5" sliver y~515); the target does not read. 375 03: centred, void acceptable.
G2 SetView:552-596 on 375 while demoOpen put "Hide demo" on the ask row (one 44px row) — saves ~52px so the weight clears Done. Last round's G2/G3 not applied.
G3 SetView:708-735 on 375 + demoOpen render "52.5 kg x 5" on one line (text-[40px]); Per side below.
G4 SetView:418 `shortBandGone`: allow the band after set 1 on 375 when sets <= 6 (03 void ~100px under the strip would hold the figure).
G5 SetView:~708-760 (04@393) hide the "Next:" line when it collides: `[@media(max-height:900px)]:hidden` while sets > 6, or add `mb-2` before the Done bar.
Blocked outside code: YouTube title/CC/Watch-on-YouTube overlay on 02c (embed terms); autoplay/playsinline only verifiable on a real iPhone. Q1: autoplay opt-in -> player ~9.4 (clip becomes the hero like GOWOD/Runna); ceiling stays 9.4 with the YouTube overlay.

## Rest 9.5
393: ~90px void between Per side and the question (y~445-520); 375 full, Switch exercise 22px off the edge inside safe-area.
G6 RestTakeover:288 `justify-center` -> `justify-evenly` at `[@media(min-height:800px)]`, or ring 272px (303). Nothing else.

## Done 9.4
Chips under Best set work and fill the one-lift day; 375 is full and NEXT SESSION is visible. 393: ~200px void (y~385-598) between Training max and Next session.
G7 SessionDone:94-102 at `[@media(min-height:760px)]` move DoneStats below the spacer / BestSetCard hero `text-[44px]` (DoneSections:42) so the card owns the void.
G8 weekly line / "vs plan" / volume need data plumbing (blocked in code, not design). "3/30" is the capture's padding artefact.
Landscape 667x375 still unscreened for Done/Start/Skip: one screenshot is needed before any 10.
