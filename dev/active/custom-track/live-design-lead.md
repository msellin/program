# Live rescore, design lead (2026-10-29), 1-10
Looked at: shots/live sheet-393x852.png and sheet-375x667.png (all six screens each).
Scores: brief 9.3 | player 9.3 | rest 9.4 | done 9.2. Mean 9.3, level with round 9.
Live vs approved local: same structure, copy, controls and hierarchy; no regression. Loads are 50 not 52.5 (new day), so not a diff.
Rest 9.3 -> 9.4: at 667 Switch exercise now clears the bottom edge; still two stacked rows (Add a note / Switch), not one half-width pair.
Player 667 set 1: the figure shrinks to a ~40 px sliver in a short band (393 is fine); weight, Done, Change/Missed all visible. Clip is still letterboxed (grey side bars) at 667. Check this matches v8 667; if v8 had a bigger figure it is a live-only regression.
Done 852: ~180 px void under Next session, Back to Today not pinned above the tab bar; at 667 it fits. No "Last time" shown (no history), still unproven.
Brief: rows 2-4 still carry no load next to row 1 "50 kg", no "Last Thursday" line.
Nothing here blocks; the open items are the round 9 P1/D1 asks plus the 667 figure size.
