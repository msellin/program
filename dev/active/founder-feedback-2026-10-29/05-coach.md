# 05 Coach lens (strength and conditioning), 2026-10-29

## A. Figure motion in the set player: CHANGE
Verdict: mid-set a lifter is under a bar or dumbbells and looks at the screen for about 1 s. They do not study
an animation. What helps is a clear still pose at the hard position (BSS: bottom, shin vertical, front knee
over mid-foot; the dashed vertical in shot 1 already does this) plus ONE external cue line. The figure in
shot 1 is a good still. A loop only earns its place in the pre-set window, before the first rep, when the lifter
is reading "how do I do this".
Rec: keep motion, but only while the set is idle (before Done is tapped for set 1, and while resting), and
freeze at the bottom pose once the lifter has logged set 1. `SetView.tsx:534` `playing={!demoOpen}` should also
turn false after the first logged set, which saves battery and removes distraction. Watch demo stays the
answer for "show me the real movement"; do not try to replace it with a figure.
If it looks static on his device: check the amplitude. BSS depth change in a stick figure is small, and if
the loop is slow it reads as still. Check `prefers-reduced-motion` on his Android first; that is the most
likely cause of "does not move" when the code says it plays.
Only lead lifts animating is fine and intentional, since those are the movements where form errors cost
most. Mobility thumbnails stay still (they are list art, not instruction).

## B. Today messages: CHANGE (cut to what changes a decision)
Needed before training: (1) the readiness check, as a single line or chip, not a card; (2) any red/amber
state. Everything else is skippable.
- "No check yet / Save a morning check" (`HeroStateCard`): shrink to a one-line row. Only 1 check in 14 days
  says the card is being ignored, so making it bigger or louder is not the fix; make it one tap and small.
- "First hip check +1 more" (`SignalsStrip.tsx:425`): a coach would say this is a one-time onboarding tip.
  Show once, then never; collapse the rest into Profile. Keep hip-only.
- "2 tracks scheduled today... snooze from Profile": CUT as a persistent banner. The lifter can see two
  cards. Show only on the first day a second track starts. Its sequencing advice (mobility after strength)
  is useful but belongs in the mobility card subtitle, one line.
- "Heavy squat day, keep conditioning light": the advice is correct and useful, but it is only useful on the
  strength card, before sessions. It sits below an unrelated card and reads as an empty-slot notice ("the
  plan doesn't schedule anything here"). Move it into the front squat card as a single line ("Keep
  conditioning easy today"), and drop the card.
Target: below the fold goes from five blocks to one row plus any red/amber item.

## C. Progress and insight signals: BUILD (small, honest set; no ring score)
A single "mobility score" ring invents a number the data cannot back and invites gaming. Prefer session
insight lines that quote the log, each naming its signal:
- Honest and useful: sets done vs planned (13 vs 13); reps in reserve per set against the target ("all five
  sets Easy, 4+ left" is signal); load vs last time of the same lift; working-max trend as a small line of
  top-set load with date, no estimated 1RM unless reps <= 5 from a real top set.
- Weak or gimmicky: overall readiness ring, streak flames, "quality score", AI praise. Skip the LLM text;
  templated lines from log fields are more trustworthy and need no Haiku.
Rec: a finished-session card, 2-4 rule-based lines, each cites its signal ("5x5 at 80 kg, all rated Easy:
the plan target was 65-75% of 107.5 kg, so you left load on the table; propose raising?"). The raise goes
through confirm-first. Not medical: do not interpret symptoms, only report them.

## Today's data, coach reading
- 5x5 at 80 kg is about 74% of the stale 107.5 kg max (hand-set 1 Oct), inside plan, but all Easy (4+ left)
  while last week was 115x3 (about 107% of that max). The working max is stale low by roughly 7%+, so the
  plan prescribes below his real capacity. Engine should PROPOSE a new front squat working max after the
  115x3 (Accept/Ignore); the missing proposal is a gap. Do not auto-apply.
- BSS 12.5 kg x6 shown in the player: low and probably a test weight; fine.
- BSS / Nordic / sled not logged: 3 of 4 exercises missing. The app cannot tell "skipped" from "forgot to
  log". Ask at Finish: "Not logged: Nordic, sled. Mark skipped or log now?" Do not infer compliance.

## D. Empty done-state brief: CHANGE
"Log an extra session" is not needed after completion; it competes with Finish session. Move it behind
"..." or to Plan. Empty space is fine in a finished state, but fill the top with a one-line result
("2 of 2 done, 5 min") and let Finish be the only primary action. Vote CHANGE (remove extra-session link).

## E. Going back in a guided set: BUILD
Lifters go back to check what they actually held or lifted (hang time, last load) or to see whether a set
logged. Redo and Skip are destructive; the missing verb is "view". Rec: Back opens the finished set read-only
(its result and a single "Back to current set" button); redo is a separate explicit action. `FollowAlong.tsx:485`.

## Top 3
1. E: read-only view of finished sets with "Back to current" (a trap that costs data).
2. C + working max: finished-session insight lines and a confirm-first front squat max proposal.
3. B: collapse below-the-fold to one row; move "keep conditioning light" into the strength card.
