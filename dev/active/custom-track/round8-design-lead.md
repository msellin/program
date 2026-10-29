# Round 8: design lead (2026-10-29), 1-10, 10 = best of GOWOD/Runna/Pliability at that job
Looked at: all v7 PNGs at 393x852 AND 375x667 (01, 02, 02b, 02c, 03, 04, 05, 06), peers sheet-player.jpg, code. [B] = blocked outside code.
Scores: brief 9.3 | player 9.0 | rest 9.3 | done 8.9. Mean 9.1 (round 7: 9.2 / 9.1 / 9.2 / 8.9). Player dips: a 667 regression (G1).
Limits held. Q1: with opt-in autoplay the player is already past GOWOD's blurred static frame and Pliability's looping video on honesty; it stays 9.x not 10 until G1-G3 land. Without autoplay it would be ~8.6. Demo-open is the best state on the screen.
Every item below is held by other lenses too, or is code-only; none is mine alone. (Still unapplied and not holding a score down: Change weight/Missed as links, Note/Switch into the menu, effort above Next up.)

## Player 9.0 -> 10
G1 SetView.tsx:~704,724 (667, 02c): REGRESSION. With the clip open the weight is cut to a 15 px sliver ("52.5" half hidden behind Done) because the flex-1 spacer is 0. The PR chip fix hid the chip but the clip still eats the weight. With the clip open at max-height 700: cap the clip at ~max-h-[26vh] (it is ~190 px now) or hide the opt-in row until the clip has played once. Weight must show whole at 667. Must fix.
G2 SetView.tsx:570 (both, 02c): copy is still "Play clips automatically? YouTube sees your IP." (I asked for "Autoplay demos? Loads from YouTube."). Single line, no jargon. After Yes / Not now confirm it is gone on reopen (useUserPrefs).
G3 SetView.tsx:~606 (both): "18 sets left today" shares the row with "Set 1 of 5"; move to the subtitle ("Exercise 1 of 4 · 18 sets left"). Gives the 667 shot one row back.
G4 [B] YouTube title strip/logo overlay (third party). Figures for hip thrust / SL RDL / hollow hold (parallel session).
## Rest 9.3 -> 10
G5 RestTakeover.tsx:~470-492 (667, 02b): Add a note and Switch exercise are two stacked full-width rows under Skip rest; Switch sits under the dev badge. One row, two half-width quiet buttons (saves ~50 px, the 667 shot is full to the edge). Code-only.
G6 [B] 40 px figure beside Next up (Runna's next-card).
## Done 8.9 -> 10
G7 SessionDone.tsx:~85 (both): "Session done" names no context. Subtitle from the plan day: "Thursday · front squat day". Code-only.
G8 SessionDone.tsx:188 (852, 06): the flex-1 spacer leaves ~230 px of void between Training max and Next session. Fill it with the log signal, one line under Best set: "Last time 52.5 × 5 · today 52.5 × 5" (history.ts has it). Runna's summary is filled; ours reads empty at 852. Code-only.
G9 [B] 40 px figure on the Best set card.
## Brief 9.3 -> 10
G10 BriefView.tsx:~532 (both, 01): rows 2-4 carry no load ("4x6 each side", "3x5", "6 sets") while row 1 says 52.5 kg. Append last-log top-set weight where one exists ("4x6 each side · 20 kg"). Code-only.
G11 BriefView.tsx hero (both): add "Last Thursday: 52.5 x 5" under the meta line; names the log signal in the hero, not only in the card.
G12 BriefView.tsx:~207: the 69% in "Why these weights" as bronze semibold. Polish.
Blocked summary: G4, G6, G9 (third party / figures). Everything else code-only.
