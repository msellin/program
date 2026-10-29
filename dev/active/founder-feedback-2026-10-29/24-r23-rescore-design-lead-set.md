# R23 rescore, design lead: set screens (r2 baseline: no score given; 4 estimated)

Scores: sled 8, nordic 9, bulgarian 6.5, hip-brief 7.5.
Wins: no "0 kg" anywhere; Nordic is reps only; sled leads with "20 m"; figures are the hero.

- [H] Bulgarian: the main number is "Bodyweight" (~16px) with "x 6" smaller; the reps are the thing changed between sets and should be the big number. Spec was `6 reps` big, "Bodyweight" as a quiet chip → SetView load_optional branch.
- [H] Sled: secondary button reads "Change load" while load is empty ("— kg"). Should be "Add load" (same rule as "Add weight" on Bulgarian). "— kg" is also easy to miss; render as a chip "Add load" instead of a dash.
- [M] Bulgarian is per side ("L" on figure, "Plan: ... per side") but Done reads "set 1 · 6 reps" with no side; 4 sets, sides unclear → say "set 1 · L · 6 reps" or show the side in the main label.
- [M] Hip-brief: sled row says "6 sets" while the player says 20 m; show "6 x 20 m" in the row (distance_m exists).
- [M] Hip-brief: "Consider trimming 5%" in an amber note; a call, not a hedge: "Trim the top set 5%" with an apply action (confirm-first).
- [L] "16 sets left today" repeats on every exercise; fine, but it competes with the "Set 1 of N" line.
