# Round 8 — copy lens (2026-10-29)
Seen: all v7 PNGs, both sizes (01, 01-full, 02, 02b, 02c, 03, 04, 05, 06, 06-full). Round-7 applied items (PR once, chips row on Done, "Muted loop" gone) verified.
## Scores (10 = best peer)
- Brief 9.3: "Why these weights" card and unit-explicit rows are peer-best. Loses: "How to run this" unchanged since R6 (G1); "5×5 · 52.5 kg" vs "52.5 kg × 5" elsewhere (G2).
- Player 9.4: "PR at 5" now only where earned; autoplay prompt honest. Loses: strip chips "52.5×5" and "10s" are the last unspaced dialect, and the Done chips already say "52.5 × 5" (G3).
- Rest 9.4: "Reps left in the tank?" plus "May suggest a new training max. You decide." is best in set. Loses: "+30s" unspaced (G4); "Too hard" is the only non-RIR-ish label, accept (it is test-clicked).
- Done 9.4: Best set, chip row, TM row, Next session all clear. Loses: "no change" with no reason on the hero line (G5); "3/30 Sets of plan" reads as a failure on a padded capture only, ignore.
## Changes to 10 (keep test-clicked names: "Log an extra session", "Too hard", "Done — set N")
G1 BriefView.tsx:441 "How to run this" -> "How this session works". Check e2e/unit for the old text first (grep found none in spec/test files).
G2 prescription-line.ts:18,19,25 `${a}×${b}` -> `${a} × ${b}` (incl. "4 × 6 each side"). Grep tests for "5×5" before editing.
G3 SetView.tsx:686 `${w}×${r}` -> `${w} × ${r}`; :684 `${s}s` -> `${s} s` (matches SessionDone.tsx:115). Chip width: check 5 chips still fit at 375.
G4 RestTakeover.tsx:449 "+30s" -> "+30 s" (comments :117,:132,:153,:183 optional). RestTakeover.test.tsx may select on text; check it.
G5 SessionDone.tsx:139-142 when no change and top set met reps, sub-line "Top set was on plan. Changes only when a top set earns it. You decide." (>= 2 lines is fine; else keep the current one).
Q1 (autoplay opt-in): player copy 9.4 -> 9.6 ceiling; the prompt "Play clips automatically? YouTube sees your IP." is already honest. No copy honesty gap remains.
Peers note: no streak/praise strings anywhere in these four screens; keep it that way.
