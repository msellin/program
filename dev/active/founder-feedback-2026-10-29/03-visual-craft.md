# 03 Visual craft lens (2026-10-29)

**A. Figure motion — CHANGE (keep it moving; make it readable and honest).**
- Code does animate (SetView.tsx:534 playing={!demoOpen}; ExerciseFigure.tsx:121 loop). Two likely reasons he sees stillness:
  (1) `usePrefersReducedMotion` (ExerciseFigure.tsx:51,121) hard-returns before the rAF loop. Android "Remove animations" / battery saver sets this, and the screenshot (73% battery, 4G) is a frozen mid-pose. Today's tile uses the same component, so check whether Today really moves on his device; if it does, this is not the cause.
  (2) `figureIsStatic` (:128) stops the loop once holds settle, so a slow-tempo lift reads as a pose.
- Fix: under reduced motion do not freeze; show a 2-pose toggle (start/end, 1 s cross-fade) or a small "Motion off" tap-to-play chip. Add a thin tempo cue (arc/ghost of end pose at 25% opacity) so even a still frame implies direction.
- Only lead lifts animate by design; brief thumbnails (40px) stay still, correct. Keep Watch demo as the clip layer; motion is the glance layer, video is the proof. Do not cut either.

**B. Today below the fold — CUT/CHANGE.** Shot 3 is four boxes of near-equal weight (bordered card, strip, amber slab, bordered card); nothing says "this one matters".
- "No check yet" card (HeroStateCard): 3 lines at h-card weight for an absence. Collapse to one 48px row: dot + "Morning check · not yet" + chevron/Start. Full card only after a check exists.
- "First hip check +1 more" is the only well-weighted element (36px strip). Keep, but it must stay hip-program-only (SignalsStrip.tsx:425).
- "2 tracks scheduled" amber slab (TodaySession.tsx:623): amber = warn, this is not a warning. Make it a muted one-line caption under the hero cards ("2 tracks today · snooze in Profile"); drop the second paragraph (Mobility runs alongside...) to the "How to run this" sheet. Show once, then dismiss for good.
- "Heavy squat day — keep conditioning light" (RunSlotCard.tsx:907): 6-line body, icon floats mid-card, no title/body separation. Not main-screen material on a day with no conditioning scheduled. Move into the strip (as an item under "+N more") or a single line of caption. Rule: max one boxed card below hero; everything else is a row.
- Target: below-the-fold in 2 rows + 1 card, not 4 cards.

**C. Progress — BUILD insights, not a ring.**
- A ring needs a defensible 0–100; mobility has no validated composite, so it would be a made-up number (confirm-first, cite-or-log-signal). GOWOD's works because it is a test battery.
- Build a "Session recap" card on the done screen: 2–3 rows, each a log signal. Icon-less, one accent for "up", muted for "flat". E.g. "Front squat 5×5 @ 80 kg, all Easy (4+ left)" -> "Room to add: propose +2.5 kg?" (Accept/Dismiss, same card grammar as Coach). Templated, no Haiku needed; revisit LLM prose only for the free-text sentence.
- Per-track visual: a small progress ring only where a denominator exists (week 10 of 10, sessions done/planned) — that is adherence, true and cheap. 64px, 6px stroke, bronze on surface, number tabular-nums inside.

**D. Done brief — CHANGE.** Empty is fine; a 600px void above a lone CTA is not. Done state should celebrate lightly: top card gets a check mark and "Done · 2 of 2" (replace per-row "DONE" mono text with a check icon at 20px). "Log an extra session" is a power action: demote to the "..." menu or a text link under Finish. Keep "How to run this". Finish session stays the single bronze CTA.

**E. Going back in guided set — BUILD (visual side).** Back should enter a read-only "review" state: finished set's result shown with a bronze "Back to set N" bar replacing Skip set; ready-to-redo only via an explicit "Redo" secondary button. Never mutate on Back (FollowAlong.tsx:485).

**Top 3:** 1) E review-state, no destructive Back. 2) B demote the three below-fold boxes to rows (one boxed card max). 3) A reduced-motion check first, then 2-pose fallback + tempo ghost.
