# Round 6 — visual-craft lens (2026-10-29)
Seen: all v5 PNGs at 375x667 and 393x852, peer sheets. Tokens only, flat bronze, no pre-tap YouTube (autoplay is now opt-in).

## Scores (10 = best peer at that job; round 5 in brackets)
Brief 9.0 (8.0) · Player 8.5 (8.0) · Rest 9.3 (9.0) · Done 8.3 (7.5)
Brief: figures on all four rows, one lit row, merged link list. Player: figure band and 56px weight are peer-grade, but the round-5 G5 spacing fix was never applied. Rest: clean. Done: Best set is first-read now, tail still weak.

## Q1 (opt-in autoplay): player 8.5 -> 9.5 once the YouTube chrome is cut
Footage makes it GOWOD/Runna-class, but 02c/03 show YouTube's own title card, CC/gear/fullscreen, link badge and "Front Squa" overlaid on the frame. That clutter caps it at ~9.0. See G6.

## Changes to 10
Brief
G1 BriefView.tsx:283 `tracking-[.1em]` and :319 `tracking-[.14em]` -> `tracking-widest` (same as :344,:361). Two stray tracking values left.
G2 BriefView.tsx:389 rows 2-4 `bg-surface` -> `bg-transparent`, row 1 (isMain && !isDone, :391) keeps `bg-surface`. All four rows now look equally lit besides the bronze edge.
G3 375x667 01-brief: the last row is cut under Start by a fade. BriefView.tsx:178 `pb-20` -> `pb-28` so the bottom row clears the bar when scrolled; no change at 393.
Player
G4 SetView.tsx:695 spacer sits above the weight: 90-130px dead at 393 between set strip and weight (02, 04). Move weight block's `flex-1 min-h-3` spacer BELOW it (:699 wrapper `pb-3` -> `mt-6 pb-3`; delete :695 or make it `min-h-0`). Weight rises ~90px, Done stays on thumb.
G5 SetView.tsx:606 `text-small font-semibold text-ink` -> `text-small font-semibold text-strong`; :611 `text-small text-muted` -> `text-caption text-muted`. "27 sets left today" at Set 17 of 17 (04) reads wrong: count only remaining sets, not row total (totalRemaining logic, not a style fix).
G6 DemoVideo.tsx:14 add `controls: "0", modestbranding: "1", disablekb: "1", iv_load_policy: "3", fs: "0"` to the URLSearchParams. Removes CC/gear/fullscreen/annotations. Title bar and "watch on YouTube" logo cannot be removed; at the frame's top, scale the iframe `scale-[1.12] origin-bottom` inside the existing `overflow-hidden rounded-2xl` (SetView.tsx:510) to crop the title strip. Check against ToS before shipping; YouTube-owned chrome is BLOCKED outside code.
G7 SetView.tsx:513 375x667 band `max-h-[17vh]` = 113px: figure is ~60px tall, a thumbnail (02). Raise to `max-h-[20vh]` when the rep grid is absent (`!compactMedia`); the "Done" thumb zone at 667 still holds (weight at 375 is 48px).
G8 SetView.tsx:513 04 shows a solid black frame while the clip loads. Keep `bg-surface` under the iframe and fade the iframe in (`opacity-0 -> opacity-100` on load) so figure/bg never reads as a black hole.
Rest
G9 RestTakeover.tsx:436 `gap-2.5` row +30s/Skip sits 12px from "Add a note" (:473); at 375x667 they touch. Give :385 container `gap-3` at `[@media(max-height:700px)]` and put `mt-1` on :473.
G10 RestTakeover.tsx:395 helper wraps at 375? No — one line in v5. Done. 02b at 393: ~110px gap between "Per side" and "Reps left in the tank?" is air, not dead; leave.
Done
G11 SessionDone.tsx:94 delete `<DoneStats>`; add one line under h1 (:84): `<p className="text-small text-muted tabular-nums">3 sets · 1 exercise · 15 reps</p>`. Three stats above Best set still read before it. DoneSections.tsx:17 stays for the stopped case only.
G12 DoneSections.tsx:56 NextSessionCard `<Card>` -> `className="bg-transparent border-line-soft"`, :58 `text-h3` -> `text-body`. Only Best set keeps the lit surface.
G13 SessionDone.tsx:111 training-max `rounded-xl border` -> plain row (`border-t border-line-soft pt-3`) INSIDE the Best set card (pass as children). Four boxes become two.
G14 SessionDone.tsx:125 movements list: remove `rounded-xl border`, keep `divide-y divide-line-soft`. With one movement it is a stray pill (06).
G15 SessionDone.tsx:80 `min-h-[calc(100dvh…)]` + `gap-4` leaves ~170px void at 393 (06). Replace with `gap-5` and drop `flex-1`-less min-height so Next session follows the list; keep Back to Today pinned.

## Blocked outside code
YouTube's own title/logo chrome (G6 residual); figure drawings for rows still blank in future programs. Nothing else.

## Projected after G1-G15
Brief 9.7, Player 9.5 (with autoplay), Rest 9.6, Done 9.3. Rejected: gradients, confetti, per-exercise colour.
