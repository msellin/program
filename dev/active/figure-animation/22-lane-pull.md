# Lane note: pull family (2026-10-29)
Base: this worktree lacked the uncommitted shared helpers (TEMPO, ARM80, ground...), so rig.ts here is main's working copy
plus my pull edits. Merge: take my hunks only (pullFig, PULL_SY0, hang, ringRow, rowincline line, pullapart, timings).
Arms: ARM80 (62) on every bar figure and ring row; ARM86 on pullapart. Test: rig-pull.test.ts (10 tests); rig.test.ts untouched.

- pullup family: shoulder joint y by phase: straight arms to h=0.12 (scap start: trunk rises 6, elbow 178), 90 deg at h=0.35, top
  shoulders 11 under bar, elbow ~38 (was ~44 with chin AT the bar). Top chin ~16 px over the bar top (was chin = bar).
  Neck short (21) until h=0.4, so pullup_mid head top 33 (was 27.7, on the bar). During the pull the head passes the bar line
  once the face is a head-height from it (front view, bar in front): geometric at a 22 px head, not fixable.
- pullup_single 6.0 -> 7.0 s, lowering 1.5 -> 2.4 s, label "then hang and rest". pullup_slow pause 0.63 -> 1.0 s, lower 4.0 s.
- scappull: 4.0 -> 4.5 s, up 1 s / hold 1 s / down 2 s, lift 12 -> 7, head 3+ px clear of the bar; activehang lift 7, head clear.
- hang: arms straight (elbow ~180), shoulder joints fixed, trunk stays joined, shrug 4 -> 7 (head sinks).
- bands: loop over the bar at x 148/210 outside the arms, under the knees; thins 22% and straight when stretched (bottom),
  slackens bowing outward near the top. Not done: knee bend (front view; band under the knees only).
- negatives: lowering 8.0/4.5 s -> 10.0/5.0 s (control tempo); start chin clearly over. NOT done: 80 ms fade on the reset cut,
  needs a shared drawFigure opacity hook (build only sees q). Reset stays a 7 ms cut.
- rows: elbow chosen on the feet side, so the upper arm runs back along the ribs (elbow 173 -> 40, shoulder <= 80; was overhead,
  shoulder 108 -> 174). Bottom elbow 173 -> ~179. Rope anchor tilts toward the feet (anchor x = hand + 0.32*height).
  rowincline: feet x 268 -> 228, rings y 36 -> 42 (hand-foot 164, was 197 unreachable): elbow 174 -> 40, chest reaches the rings.
- pullapart: hands start ~shoulder width, end 2.5x+ (arm foreshortening 2 -> 67), shoulders squeeze 3 each side, band straight
  hand to hand at y 80, thinner stretched, sag only below 30 deg.
Shared change needed: the reset-cut fade. No change needed in rig.test.ts.
