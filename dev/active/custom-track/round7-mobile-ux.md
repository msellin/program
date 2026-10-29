# Round 7 — mobile-UX lens (2026-10-29), v6 shots both sizes + peers sheet-player.jpg. Autoplay opt-in is in.

## Scores (10 = best peer at that job)
Brief 9.4 (9.3) · Player 9.0 (8.7; 9.3 once a clip autoplays on device) · Rest 9.5 (9.4) · Done 9.0 (8.8)

## Brief 9.4
393: Start y~756, all 4 rows + links visible, ~55px gap above Start. 375: row 4 is a faded sliver under Start (01-brief).
G1 BriefView:178 `pb-20` -> `pb-24` and "Why these weights" card py -> `py-2` at `[@media(max-height:700px)]` so row 4's title clears the fade (466). Acceptable 9.4 without.

## Player 9.0
Fails: 02c@375 hides the target — "x 5", "PR at 5" and the weight sit under Done; only the rep grid shows. 03@375 has a ~135px void (thumb row + grid, then nothing until the weight).
G2 (SetView:543-585, 02c@375) while `demoOpen` at `[@media(max-height:700px)]` drop the "Muted loop of the movement" caption (547) and put Hide demo on the ask row (one 44px row, ask text 2 lines left, Yes / Not now / Hide). Saves ~56px; weight 40px (714) then clears Done.
G3 (SetView:714) on 375 + demoOpen render "52.5 kg x 5" on one line, Per side below the plate row; the target must read without scrolling.
G4 (03@375, SetView:409,519) `shortBandGone` hides the band after set 1 on short phones: allow it when sets <= 6 (grid fits one row) so the figure (max-h 20vh = 133px) fills the void; keep it hidden for >6 sets (04).
G5 (SetView:570) "Not now" -> `border border-line-strong` (still a ghost, reads as text).
G6 (393 02c) ~30px dead above PR: second `flex-1 min-h-3` before 700 not needed; fine, skip.
Blocked: YouTube title/CC/gear/Watch-on-YouTube overlay on 02c both sizes (embed terms); clip autoplay and `playsinline=1` (DemoVideo:14) only verifiable on a real iPhone; 04 shows black frame in headless. Ceiling ~9.4.

## Rest 9.5
393: ring 256, chips 66px, Skip 58px, all in the bottom 45%; ~100px void between "Per side" and the question (y~445-520). 375: Switch exercise ends y~645 of 667, 22px from edge but inside the safe-area padding (385).
G7 (RestTakeover:288) `justify-center` -> `justify-evenly` on the top block at min-height:800px so the ring + next-up sits mid-gap; or ring 272. Nothing else.

## Done 9.0
393: 250px black void between the stats row (y~130) and BEST SET (y~388), the information is thin for a single lift. 375: tight and clean, NEXT SESSION fully visible above the bar.
G8 (SessionDone:97-99) when one exercise: under BEST SET add a row of set chips ("52.5 x 5" x3, same chip as the player's grid) — real data, fills ~50px, no new plumbing. 
G9 (SessionDone, BestSetCard) hero `text-[44px]` at `[@media(min-height:760px)]` so the card owns the void (~+16px).
G10 (SessionDone:94-96) at min-height:760 move the stats row down under the spacer, above BEST SET, so the empty space sits below the title (reads as air, not a hole).
Blocked: "vs plan" + volume need data plumbing; landscape 667x375 still unscreened for Done/Start/Skip (one screenshot before any 10).
