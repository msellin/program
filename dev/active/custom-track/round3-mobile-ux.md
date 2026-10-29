# Round 3 — mobile-UX lens (2026-10-28), built shots 375x667 + 393x852 vs peer sheets

## 1. Scores (10 = best peer) and does it compete
- Brief 8.0 — hero + rows + sticky Start above the tab bar; Start sits at y~571/667, in the thumb zone. Competes with Pliability/GOWOD overview.
- Player 7.5 — Done is the largest bronze target at the bottom (y~540-598 @375, y~724-783 @393), 44px secondary row, safe-area padding present (SetView:662). Peers show the clip as the hero; ours does it only on tap. Competes on logging speed, loses on "watch while you lift".
- Rest 8.0 — ring + 3-way RIR + Skip/+30s all in the bottom 40%, safe-area (RestTakeover:362). Clean. Competes with Runna's timer screens.

## 2. Gaps, most important first
1. 02c @375: "Close video" pill (DemoVideo:122, top-2 right-2) lands on YouTube's own mute/CC/gear row; two overlapping control clusters, the real mute and settings are hidden or mis-tappable. Worst thumb-reach bug in the build.
2. 02-player @393: ~110px dead gap between the set strip (y~383) and the weight (y~570), caused by `flex-1 min-h-3` spacer (SetView:~597). The primary number floats; Done is reachable but the eye travels. Wasted band could host the figure larger or the Per-side line.
3. 02 @375: the dev "N" badge overlaps "Change weight" (ignore — harness), but the set strip clips chip 6 at both sizes with no fade/peek cue other than the cut chip; fine, it scrolls.
4. Set chips: min-w 56 x h-44 (SetView:559) pass 44 but gap between chips is small; a mis-tap edits a logged set (destructive-ish). Confirm gap >= 8px.
5. Done + Change weight + Missed stack uses ~125px at the bottom at 375x667; no overflow, passes SE. Brief at SE: Start sits flush on tab bar, ok.
6. Rest 393: "Do something else next" is a bare text link at y~808, inside the home-indicator band (~34px) — min-h-11 but visually unframed (RestTakeover:468).
7. Rest "How was that?" RIR chips are 66px tall, good; +30s 24px-wide fine (w-24).

## 3. Fixes (keep core idea; no new features)
F1. DemoVideo.tsx:122 — move Close to bottom-left of the frame (`left-2 bottom-2`) or below the frame as a full-width 44px row; never over the top-right YouTube controls.
F2. SetView.tsx:~597 — replace the dead spacer: on >=760px tall, grow the figure band (aspect-[4/3] or flex-1 with max-h) instead of `flex-1 min-h-3`.
F3. SetView.tsx:559 — chip `gap-2` on the strip container, and add a right-edge mask-image fade so the clipped chip reads as scroll.
F4. RestTakeover.tsx:468 — give "Do something else next" a visible 44px outline/ghost treatment and keep it out of the bottom 34px (pb already safe-area, verify).
F5. SetView.tsx:662 — keep `pb-[max(env(safe-area-inset-bottom),16px)]`; make Done sticky to this container (already) — no change, confirm in landscape.
F6. SetView.tsx:507 — the Watch demo pill (h-11) is top-left of the figure = ouch zone; acceptable only because it is a rare action. Add whole-figure tap as hit-slop so the thumb finds it.
F7. DemoVideo — on first open, scroll nothing; stay open per X3 but expose the Close row so rest/next-set transitions never leave a playing clip behind unmuted.
F8. BriefView.tsx:460 — sticky Start already clears the tab bar; add `shadow`/fade above it so rows slide under visibly at 375x667.

## 4. Votes
- X1 (figure band on short phones, AMRAP excepted): AMEND — show the band, but cap at ~130px at <700px tall so Done and the strip never move below the fold; AMRAP exception APPROVED (rep grid needs the room).
- X2 (rest number 104 -> 72px to sit in the ring): APPROVE — in 393 shot the digits fill the ring cleanly; still ~5x body size, glanceable at arm's length.
- X3 (clip stays open per exercise, in memory): AMEND — approve persistence, but only after F1 (Close must not collide with YouTube controls) and the clip must be muted/paused when Rest takes over.
