# Round 4 — mobile-UX lens (2026-10-28), v3 shots both sizes + peers sheet-player

## Scores (10 = best peer at that job)
- Brief 8.5 (was 8.0) — hero, rows, fade above Start now visible (BriefView:460-462). Start y~571@375, in thumb zone.
- Player 8.0 (was 7.5) — Done 44+ bronze at bottom, safe-area ok (SetView:674), figure band now shown. Loses to Runna/GOWOD on clip-as-hero and on dead band.
- Rest 8.5 (was 8.0) — ring 72px, RIR chips 66px, Skip/+30s in bottom 40%. Loses on the unframed footer link.
- Done 7.5 — summary reads well, but "Back to Today" floats mid-screen (y~506@375, ~504@393), not in the primary zone, and the tab bar sits under a blank 100px band.

## Changes to 10 (inside hard limits)
G1. Player dead band @393x852: strip ends y~372, weight starts y~565 (~190px empty), from `flex-1 min-h-3` (SetView:609). Fix: give the figure the slack — SetView:481 change `aspect-video` to `aspect-[4/3]` and `[@media(min-height:760px)]:max-h-[34vh]` to `max-h-[40vh]` (~340px); keep `flex-1 min-h-3` as remainder. At <700px keep 17vh (AMRAP/rep grid at 375 stays unclipped).
G2. Player @375x667: strip chip 6 still cut (SetView:539); fade exists (line ~602). Add `scroll-px-4` + `scrollIntoView({inline:"center"})` on current chip so the active set is never the clipped one; chips `gap-2` already, keep (8px ok).
G3. Player: whole figure tap opens demo (hit-slop for the 44px Watch demo pill at SetView:513, ouch zone). Wrap figure (481) in a `<button>` with the same aria-label; pill becomes decoration.
G4. DemoVideo Close (DemoVideo.tsx:~122): verify moved to `left-2 bottom-2` per F1; on rest start, pause+mute (X3). Check 02c in both sizes before claiming done.
G5. Rest @375: "Switch exercise" is bare text at y~622/667, inside the bottom 45px (RestTakeover:493). Make it `min-h-11 w-full rounded-lg border border-line-soft text-small text-ink` and keep container pb at 385 (safe-area already). Same for "Do something else next" (F4, was :468).
G6. Rest: "Add a note" row ~40px @375 (y~492). Make `min-h-11`.
G7. Brief @375x667: Start bar (BriefView:460) covers the last card ("Hollow hold", "How to run this") and the main lift's chips wrap to two lines (`flex flex-wrap gap-1.5`, BriefView:415: "77.5x5 / 90x5 / 102.5x5+" then "then 5 x 77.5 kg" alone). Fix: (a) at <700px tall render chips as a single `flex-nowrap overflow-x-auto no-scrollbar` row with the "then…" chip merged to text under the row; or shorten to the first 3 chips + "+1"; (b) raise `pb-6` at BriefView:178 to `pb-[calc(72px+16px)]` so the last row scrolls fully above Start. Row of chips must stay `py-1` (non-tappable, so no 44 needed).
G8. Done (SessionDone:~146 button, container ~385/~507 equivalent): make the footer `sticky bottom-[calc(64px+env(safe-area-inset-bottom))] bg-ground border-t border-line-soft pt-2 pb-2` with "Back to Today" `min-h-12 w-full`, mirroring the Brief Start bar so the primary action lives in the same thumb spot every time. Summary scrolls above it.
G9. Done: when the training-max proposal slot is empty, collapse it entirely (no blank band); when present, Accept/Keep go in the sticky footer's row above Back to Today, so confirm-first stays reachable.
G10. Landscape: Done/Start/Skip all sticky or flex-shrink-0 — confirm one screenshot at 667x375 before scoring 10.

## Q1 — autoplay muted after one-time opt-in
Player 8.0 -> 9.0 (to 9.5 with G1+G3). Peers (GOWOD, Runna) make the clip the hero; looped muted clip over the figure band turns "watch while you lift" on, and removes the Watch-demo pill from the ouch zone. Must haves: opt-in stored per device, off by default (privacy promise kept), copy "Load from YouTube" in that dialog, pause on Rest/background/reduced-motion/Data Saver, no sound ever, and static figure remains the fallback. Does not change confirm-first/core. Without it the ceiling here is ~9.
