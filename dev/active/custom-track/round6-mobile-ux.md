# Round 6 — mobile-UX lens (2026-10-29), v5 shots both sizes + peers sheet-player.jpg. Q1 settled: opt-in autoplay YES.

## Scores (10 = best peer at that job)
- Brief 9.3 (was 9.0) — figures on all 4 rows, merged link list, Start at y~756 (393) / ~571 (375). Gaps: 375 row 4 + links sit under Start, only a faded sliver; 393 ~55px dead gap above Start.
- Player 8.7 (was 8.4) — Hide demo now a 44px row under the frame, 16:9 unclipped at both sizes, autoplay ask sits in the same row. Gaps: 393 dead band y~470-570 (the 4:3 box stops at 270px, not the 44vh cap); 375 demo-open pushes "x 5" and "Per side" out of view; Hide demo is replaced by the ask until answered.
- Rest 9.4 (was 9.0) — ring, 66px RIR chips, Skip rest/+30s/Add a note/Switch exercise all in the bottom 45%, helper one line at 375. Gaps: ~100px empty between "Per side" and "Reps left" @393; Switch exercise ends y~830, 22px from the bottom edge.
- Done 8.8 (was 9.0 rescored) — hero best set, labelled max row, Next session now above the bar. Gaps: 393 ~180px void y~420-600; 375 NEXT SESSION card is cut by the bar (only the label and "Friday 30 Oct" top show).

## Q1 (autoplay) — Player 8.7 -> 9.3
Clip-as-hero is what GOWOD/Runna do; autoplaying muted loop in the 44vh band removes the "Watch demo" tap and the YouTube-chrome clutter. Ceiling stays ~9.4: YouTube title/CC/gear overlays (02c both sizes) cannot be removed by us.

## Changes to 10 (inside hard limits)
G1 (Player @393 dead band): SetView:518 `aspect-[4/3]` -> `aspect-square` (361px, under the 44vh=375 cap) so the figure/clip band eats ~90 of the 110px void. Keep the compact (top set) 22vh branch (517).
G2 (Player @393 demo open): the 16:9 box is 203px, leaving the void bigger. Add a second `<div className="flex-1 min-h-3" />` above the target block (before 700) so the weight centres in the leftover space (void splits ~55/55).
G3 (Player @375 demo open): "x 5" and "Per side" fall below the fold (02c shows 52.5 kg then Done). At `[@media(max-height:700px)]` while `demoOpen`, render weight and reps on one line ("52.5 kg x 5", SetView:711-743, 48px -> 40px) and drop the Per-side line behind the plate row; target must read without scrolling.
G4 (Player ask row, SetView:543-585): keep a 44px "Hide demo" reachable while asking — put the ask on its own line above and keep Hide demo right (two rows only if height >= 760). "Not now" (570) gets `border border-line-strong` so it reads as a button.
G5 (Player @375 base figure 113px, SetView:512): `max-h-[17vh]` -> `max-h-[20vh]` (133px); verify 03/04 rep grid still clears Done. (carried from R5 G4; still open)
G6 (Rest @393): RestTakeover:303 ring 232 -> 256 when `min-height:800px` to take ~24px of the void; leave 184 under 700. "Switch exercise" (490) -> `text-strong`? no, already ink; leave.
G7 (Done @393): SessionDone:164 spacer + 175 bar leave a 180px void. Move the `flex-1` (164) above the Training-max/ladder block so the stack hugs the bar, or raise hero best-set to `text-[44px]`; Next session card stays above the bar.
G8 (Done @375): SessionDone:178 `pb-20` -> `pb-28` on the scroll column so NEXT SESSION is not half-hidden under the bar when scrolled; one scroll-end screenshot to confirm.
G9 (Brief @375): BriefView:466 fade makes the cut look intended; 10 needs row 4 peeking as a whole title line: reduce the "Why these weights" card padding (about 12px) so row 4's title clears Start. Acceptable at 9.3 without it.
G10 (Landscape 667x375): still unverified for Done/Start/Skip; one screenshot needed before any 10.

## Blocked outside the code
- YouTube chrome (title, CC, gear, scrubber, Watch on YouTube) cannot be removed; `controls=0`/`modestbranding` only soften it. Player ceiling ~9.4 even with autoplay.
- 04-player-15-sets shows a black 16:9 frame in headless (iframe not loaded; not a UI bug; recheck on device).
- Peer sheet-player.jpg is blurred/low-res; GOWOD control placement is inferred.
- Real-device iOS check of autoplay muted-inline (needs `playsinline=1` in the embed URL, DemoVideo:15-19 — verify the param is set; unverifiable in headless).
