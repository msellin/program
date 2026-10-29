# Round 5 — mobile-UX lens (2026-10-28), v4 shots both sizes + peers sheet-player. Q1 skipped.

## Scores (10 = best peer at that job)
- Brief 9.0 (was 8.5) — hero + chips + Start in thumb zone (393 y~756, 375 y~571); last card now scrolls clear; main-lift chips single row.
- Player 8.4 (was 8.0) — whole-figure tap, "Hide demo", "N left today" good. Still: ~110px dead band @393 (strip ends y~460, weight starts y~570); @375 figure 113px tall; demo-open is broken at 375 (see G1).
- Rest 9.0 (was 8.5) — ring, 66px RIR chips, Skip/+30s all in bottom 45%, Add a note and Switch exercise now 44px outlined.
- Done 9.0 (was 7.5) — Back to Today sticky above nav (SessionDone:178), hero best set, quiet-day max line. Left: dead band @393 y~580-710 above the bar; @375 a row peeks under the bar.

## Changes to 10 (inside hard limits)
G1 (Player, demo open @375x667): band is 343x113, so the 16:9 YouTube frame is cropped: title bar cut, timestamp/progress overlaps, Hide demo (DemoVideo:122, bottom-2 left-2) sits on YouTube's scrubber. SetView:481 — when `demoOpen`, drop the `max-h-[17vh]`/`22vh` caps and use plain `aspect-video` (343x193); content column (473) already scrolls and Done is outside it (684). @393 same: when open use aspect-video so YouTube's own chrome is not squeezed by the 4:3 box.
G2 (Player, Hide demo vs YT chrome): move pill to `top-2 left-2` (DemoVideo:122) — YT's top bar is title/avatar, its bottom is the scrubber; top-left collides less with the thumb-tapped controls (CC/gear are top-right). Verify in 02c both sizes; failing that, put "Hide demo" as a 44px row directly under the frame (outside the iframe) so it never overlaps YT.
G3 (Player dead band @393x852): SetView:619 `flex-1 min-h-3` still leaves ~110px. Raise `[@media(min-height:760px)]:max-h-[38vh]` (486) to `max-h-[44vh]` (375px) for non-compact; the 4:3 box at 361 wide is 481 so the cap is the limiter. Compact (top set) stays 22vh.
G4 (Player @375 figure 113px, figure legs/bar tiny): raise the base `max-h-[17vh]` (481) to `max-h-[20vh]` (133px) on 667; check the rep grid on 03/04 shots still clears Done.
G5 (Player strip @375): chip 6 still clipped at 40-60% (SetView:545). Add `scroll-px-4`, `scrollIntoView({inline:"nearest"})` on current chip, keep the fade (606).
G6 (Rest): "Switch exercise" bottom at y~830/852 and ~644/667 — bottom edge inside the 34px home-indicator band is avoided by pb-[calc(22px+safe)] (RestTakeover:385), ok; remaining gap is 8px between Add a note and Switch exercise -> `gap-3.5` is fine; nothing to fix beyond making "Switch exercise" `text-ink` not dim (RestTakeover:495). Rest @375: helper copy wraps to 3 lines and pushes chips to y~392: cut to "Reps left in the tank. Terav may suggest a new training max; you decide." (RestTakeover helper, copy lens).
G7 (Done @393): ~130px empty between last card and bar (SessionDone:177 `flex-1`). Fine as quiet space, but peers fill it with the next-session CTA; move NEXT SESSION card to sit just above the bar (flip order, spacer before it) so the thumb zone shows what's next. @375: add `pb-3` on scroll so the last row is not half-cut under the bar (it shows a sliver at y~522).
G8 (Brief @375): last card ("Hollow hold") is still half under Start in the unscrolled shot (01-brief); it is scrollable, but the fade at BriefView:460 makes the cut look intended. Acceptable; at 10 show a "How to run this" row peek instead — blocked by the figure thumbnails for rows 2-4 (parallel session): rows 2-4 are flat text, block pull alone has art.
G9 (Landscape 667x375): unverified for Done/Start/Skip — one screenshot needed before any 10.

## Blocked outside the code
- Figure thumbnails on brief rows 2-4 and player bands for hip thrust / SL-RDL (parallel session) — gates Brief 10 and the Player hero.
- YouTube iframe chrome (title, CC, gear, scrubber, "Watch on YouTube") cannot be removed; only `controls=0`/`modestbranding` params soften it. Player ceiling ~9.0 without Q1 (clip-as-hero is what Runna/GOWOD do; the static figure is Terav's tap-first privacy trade).
- Peer sheet-player.jpg is blurred, so GOWOD control placement is inferred (bottom ring + stop, clip in the top 40%).
