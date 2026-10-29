# Round 7: design lead (2026-10-29), 1-10, 10 = best of GOWOD/Runna/Pliability at that job
Looked at: v6 PNGs at 393x852 AND 375x667 (01, 02, 02b, 02c, 04, 06), peers sheet-player, code. [B] = blocked outside code.
Scores: brief 9.2 | player 9.1 | rest 9.2 | done 8.9. Mean 9.1 (round 6: 8.8 / 8.8 / 8.9 / 8.2).
Limits held (no YouTube before opt-in/tap, flat bronze, confirm-first, no full plan). Opt-in autoplay is the right call and is built; a live clip now beats GOWOD on honesty.
KEPT-BY-ME-ONLY (every other lens rejected in rounds 5-6): Change weight / Missed as text links; Note / Switch into the ⋯ menu; effort question above Next up; weekly line on Done. Not holding any score down for these (worth about 0.2 on player/rest if ignored).

## Player 9.1 -> 10
G1 SetView.tsx:~700 (667, 02c-demo-open): with the clip open the "PR at 5" badge is clipped behind Done. Hide the badge while the clip is open (the weight is secondary then), or drop the opt-in row once answered. Code-only, must fix.
G2 SetView.tsx:~562 (both, 02c): opt-in row is two lines of copy plus two buttons. One line: "Autoplay demos? Loads from YouTube." (no "IP" jargon). After Yes / Not now it must stay gone (verify it persists in prefs).
G3 SetView.tsx:546-557 (667): "Muted loop of the movement" restates what the user sees. Delete the caption, leave only Hide demo right-aligned; 24 px back on 667.
G4 SetView.tsx:~611 (both): "18 sets left today" shares the row with chips header; fold into the subtitle ("Exercise 1 of 4 · 18 sets left") so the set row is "Set 1 of 5" only.
G5 SetView.tsx:~977-988 (both): the weight area is calm now; the only remaining noise is two boxed h-11 buttons under Done. [KEPT-BY-ME-ONLY, see above.]
G6 [B] YouTube title strip/logo (third party, cropping is against embed terms); figures for hip thrust / SL RDL / hollow hold.

## Rest 9.2 -> 10
G7 RestTakeover.tsx:339-393 (852): Next up sits above the effort question; the product is the question. [KEPT-BY-ME-ONLY]
G8 RestTakeover.tsx:~397: "May suggest a new training max. You decide." fits one line now; fine. No change.
G9 RestTakeover.tsx:477-492 (667): Add a note + Switch exercise are two full rows under Skip rest, and Switch sits under the dev badge. Collapse the two into one row of two half-width quiet buttons. Code-only, does not need the ⋯ menu, so it is not the kept item.
G10 [B] 40 px figure beside Next up (Runna next-card).

## Done 8.9 -> 10
G11 SessionDone.tsx:85 (852, 06): heading is "Session done" but names no context. Add a subtitle "Thursday · front squat day" from the plan day.
G12 SessionDone.tsx (852): ~250 px void under the stats strip. Space-above-result was a deliberate thumb call, but 250 px reads empty at 852 vs Runna's filled summary. Put the log signal there: "Last time: 52.5 × 5. Today: 52.5 × 5." (one line, from history). Code-only.
G13 DoneSections.tsx:30 BestSetCard (both): on a single exercise, the best set and the stats strip repeat reps (15 reps / 52.5 × 5). Acceptable; no change.
G14 SessionDone.tsx (667): all four cards fit above Back to Today now. Pass.
G15 [B] 40 px figure on Best set card.

## Brief 9.2 -> 10
G16 BriefView.tsx session list (01, both): rows 2-4 still have no load ("4×6 each side"). Append last-log top-set weight where one exists ("4×6 each side · 20 kg"). Code-only.
G17 BriefView.tsx hero (01): add "Last Thursday: 52.5 × 5" under the title (names the log signal; the card says it, the hero does not).
G18 BriefView.tsx:441-458 (667): How to run / Log extra are under Start at 667; collapse into one "More" row only if G17 pushes them off. Otherwise none.
G19 BriefView.tsx:207: make 69% bronze semibold. Optional polish.
Blocked summary: G6, G10, G15 figures / third party. Everything else code-only.
