# 42 Lane R2: pull family (2026-10-29)
- Grip (illustrator [H] elbows hidden): hands 152/206 -> 149/209 and PULL_SY0 90.4 -> 89.6 (hang stays straight, arm 62). A true 1.4x
  widening is not reachable: ARM80 (62) from a wider grip is out of reach at a dead hang, and at the top the elbow opens (146/212 gave 48 deg
  vs the 42 limit). Retraction 3 -> 2 px; top elbow ~41, hang elbow 180.
- Thumbnails (illustrator [H]): variant glyph cut to ~60% (W 9 -> 6, shorter arrows, smaller ticks/dot), moved to x 224 clear of the body.
  Discriminators per variant: arrow up / +ticks (slow) / +dot (single) / short (partial) / down+ticks (negatives) / bars (holds) /
  chevron (scap); poster frames: top (pullup*, band), mid (partial, mid), mid-lowering (negatives).
- Band (calisthenics [M]): loop x 148/210 -> 138/220, loop floor 6 px below the knee line, light band 3 -> 4 px, uniform opacity.
- pullup_top label: dropped "elbows tucked in" (not visible from the front).
- pullup_single reset pop (animator [H]): none exists, p returns to 0 at 0.6 and holds the hang; new test asserts frame 0 == last frame
  for pullup/single/slow/band. Negatives already carry Fig.fade [0.97, 0.975].
- Not done: draw-order change for elbows (head stays in front; the wider forearm flare keeps elbows visible at 144 px); knee bend (front view).
