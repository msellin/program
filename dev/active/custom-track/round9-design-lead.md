# Round 9: design lead (2026-10-29), 1-10, 10 = best of GOWOD/Runna/Pliability
Looked at: v8 PNGs at 393x852 AND 375x667 (02c, 06 closely; 01, 02b at 667).
Scores: brief 9.3 | player 9.4 | rest 9.3 | done 9.2. Mean 9.3 (round 8: 9.3 / 9.0 / 9.3 / 8.9).
Player 9.0 -> 9.4: 667 regression gone; weight whole, Done and Change/Missed visible with clip open; autoplay is one short line. At 667 the clip is letterboxed (black side bars) and the Change/Missed row sits flush on the bottom edge.
 P1 SetView 667: clip height cap is right, but give the clip 16:9 width-fit (no black bars) by cap ~22vh and bottom padding >= 12 px under Change weight/Missed. Hide-demo + autoplay rows: after Yes/Not now confirm the autoplay row is gone. Remaining 0.6 is [B] YouTube overlay and figures.
Rest 9.3 (not changed): RestTakeover ~470-492: Add a note and Switch exercise still two stacked full-width rows, Switch flush at the 667 edge. One row, two half-width quiet buttons. [B] 40 px figure by Next up.
Done 8.9 -> 9.2: subtitle works, stats below chips works, button follows content. At 852 there is still ~180 px of void between button and tab bar; it is the lowest-density screen and "Last time" was not in the shot (no history), so it is unproven.
 D1 SessionDone: pin Back to Today above the tab bar (sticky bottom, as the brief does) so no mid-screen button floats in void; add a history-seeded shot proving "Last time 52.5 x 5 . today 52.5 x 5". [B] figure on Best set.
Brief 9.3 (not changed): BriefView ~532 rows 2-4 carry no load while row 1 says 52.5 kg; append last-log weight. Add "Last Thursday: 52.5 x 5" under the hero meta line.
