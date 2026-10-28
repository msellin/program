# Exhaustive defect sweep, round 2 (2026-10-28)

The owner wants **every possible item that is wrong**, not a top 10. Round 1 (files `01`–`06` and the
lead verdict `00`) is already written, so don't limit yourself to its findings. Repeat a round-1 item only
if you can add a screen it missed.

**App.** Terav (app.terav.fit) is a mobile PWA for focused training. Ads send strangers to pull-up,
handstand-walk and strength programs.
- Design spec: `dev/active/visual-system/visual-system-plan.md`, tokens: `brand/tokens.css`.
- Code: `next-app/src/`.
- Peers: `dev/audits/app/competitor-refs.md`.

## Evidence (live captures of the new design)
- `dev/active/launch-readiness/screens/gaps/{A-first-run,C-viewport-375,C-viewport-393}/`
- `next-app/tests/e2e/artifacts/personas/<id>/{mobile,desktop,flows}/`. Each PNG may have a `.txt` text extract
  next to it; use it for copy checks. `persona.json` describes the user.
- Old-design captures: the `A-first-run/08-first-session.png` header clip was fixed in cb83e26.
- Seed data: implausible numbers (100+ reps, 269 bpm, squat maxes on a pull-up user) come from the simulator.
  Flag the UI showing them badly, not the values.

## Flag everything
Layout, copy, logic and visuals:
- clipping, truncation, overflow, overlap, a sticky bar covering content, an awkward wrap;
- off-scale sizes, mono misuse, inconsistent buttons, cards, chips or radii, accent misuse, contrast;
- typos, grammar, jargon (tier, arc, engine, capability), duplicated or contradictory info, numbers that disagree
  across screens;
- dead ends, missing next step, confusing state, an empty state with no help, a wrong default;
- anything a stranger, a coach or a designer would wince at.

## Output
Write `dev/active/design-review-2026-10-28/<file named in your task>`, one line per finding:

`- [SEV] screen-path — what is wrong → fix (≤12 words)`

SEV is one of:
- **B**: ads-blocker
- **H**: fix this week
- **M**: soon
- **L**: polish

End with:
- a 1–10 score (10 = best) for text density, text size, visual richness and consistency;
- `Checked: N screenshots`.

No length cap on the findings list. Every finding names a screenshot. Don't edit code.
Reply to the lead with only the counts per SEV, the score line, and the 5 worst items.
