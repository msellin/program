# 02 Mobile UX lens (scroll depth, thumb flow, guided-player controls)

Basis: shots 3 and 4 (412x915 Android PWA), FollowAlong.tsx:470-530 read. Shots 1-2 not re-read; A is judged from code facts in the brief.

**A. Figure motion: KEEP (CHANGE only if device test shows a bug).**
Mid-workout the phone is propped or on the floor, so glanceable motion helps; but reps are counted by eye, not by the figure. Keep lead-lift animation in the set player, keep the brief thumbnails still (they are a list, not a focus surface). Watch demo covers real motion. Before closing: confirm on his Android that SetView.tsx:534 actually animates; if it does and he cannot see it, the amplitude is too subtle, which is a visual-craft call, not a UX one.

**B. Today below the fold: CHANGE.**
Shot 3 shows about 4 stacked blocks, roughly 790px of a 915px screen, before any action. Cuts:
- "No check yet" card is about 260px tall for one prompt. Collapse to a single 56px row with a Check button, same height as the First hip check strip. It is the real primary action and belongs at row 1, not row 2.
- "2 tracks scheduled" banner: about 290px, two paragraphs. Show once (dismissible, persisted) or cut the second paragraph. The "snooze from Profile" instruction points to the ouch zone and is rarely needed.
- "Heavy squat day" card: about 370px of advice on a day he already trained, and the card is clipped by the nav (no bottom padding visible). Make it a 1-line chip with the info icon for detail, or put it in the strength hero card.
- First hip check strip (collapsed, ~100px): fine as is. Strip stays.

**C. Progress overview / insights: BUILD (session insights, not a ring).**
Rings need a track-level score the data cannot back. A post-session "what went well / watch" chip row of 2-3 lines, each citing its log signal (e.g. all sets Easy, so a working-max proposal is available), fits a single screen and goes after the done state, above Finish. Rule-based, no Haiku in v1. Keep it under ~120px so it does not add scroll depth.

**D. Brief after everything is done: CHANGE.**
Shot 4 has about 640px of empty space with Finish session at y~1670/2000, so it is in the thumb zone. Good. But "Log an extra session" is a rare action: leave it, but drop "How to run this" once all moves are DONE. The empty space is fine: the page is finished and the primary action is thumb-reachable. Do not fill it. Add a quiet one-line confirmation ("Both moves done") to make the done state read as intentional.

**E. Back/Skip in guided player: BUILD.**
FollowAlong.tsx:485: Back means redo (sets the previous set to ready), 3-column grid with 56px circles and 72px primary: size is fine, semantics are the trap. Skip (line ~515) marks skipped, so there is no neutral "forward". Recommendation: a "review" mode. Back to a finished set shows its result read-only with a banner "Set 2 done" and the primary becomes "Back to set 3" (not "Redo"); Redo is a secondary text button. Alternatively relabel the right button "Next" when the next set is not skipped-eligible, and show Skip only on the current unfinished set. Tap targets already pass 44px.

**Top 3:**
1. E: add a non-destructive view-then-return path in the guided player (data-loss/trap during a workout).
2. B: compress the check card and the 2-tracks banner, and move the heavy-day card into the hero; cuts ~600px of scroll.
3. C: rule-based session insights on the done screen, citing log signals.
