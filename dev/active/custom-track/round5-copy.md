# Round 5 — copy lens (2026-10-28)
Seen: v4 both sizes (01/02/02b/06), peers sheet-player. R4 applied: Plan:, N left today, Hide demo, effort chips, reps-left helper, Best set hero, TM line.
Not landed yet (still in shots): G1 chip/card dialect, G7 "Done", G8 "Thu —", G9 twin rows.

## Scores (10 = best peer at the job)
- Brief 8.4 - "Why these weights" card is the best why-line in the set. Loses: chip dialect "77.5×5", "top 102.5 kg × 5+", twin grey rows.
- Player 8.7 - "Done — set 1 · 77.5 kg", "Per side", "Next: set 2 · 90 kg × 5" all clear. Loses: "18 left today" beside "of 8"; bare "90 / 102.5" chips; no motion (Q1).
- Rest 8.5 - calm, one question, confirm-first stated. Loses: "How did that feel?" + parenthetical TM; "Easy/Right/Too hard" vs "left" mix scales.
- Done 7.8 - hero best set + TM line good. Loses: "Done" bare H1, "Thu — front squat + unilateral", TM line repeats exercise name twice-ish.

## Changes to reach 10
G1 prescription-line.ts:21 "top 102.5 kg × 5+" -> "top set 102.5 kg × 5+". :32-37 chips `${w.kg}×${w.reps}` -> `${w.kg} kg × ${w.reps}`; "then 5 × 77.5 kg" -> "back-offs 5 × 77.5 kg". Chip scroll row already handles width.
G2 SetView.tsx:534-535 keep "Set 1 of 8" but "{totalRemaining} left today" -> "{totalRemaining} sets left today" (count spans exercises; names the unit, ends the 8-vs-18 puzzle).
G3 RestTakeover.tsx:393 "How did that feel?" -> "Reps left in the tank?"; :395-397 helper -> "Pick one. Terav may suggest a new training max (the weight your sets are based on). You decide." Chips :37-39 labels Easy/Right/Too hard -> "Easy" "Right" "Hard" keep, but sub-labels "4+ left/~2 left/0–1 left" fine.
G4 SessionDone.tsx:81 "Done" -> "Session done" ("Session stopped" parallel).
G5 SessionDone.tsx:113-115 "{name} training max stays 126 kg." -> "Training max stays 126 kg." (name is the card's Best-set subject; when >1 lift keep "{name} training max stays"). Caption :119 ok.
G6 DoneSections.tsx:47-48 focus line "Thu — front squat + unilateral" -> "Front squat + unilateral" (strip "Thu — "; date is the line above). Check source of `focus` in SessionDone.tsx (~l.75 nextFocus = block.name; the "Thu —" prefix is in the program data day label).
G7 BriefView.tsx:439 "How to run this" -> "How this session works"; :456 "Log an extra session" -> "Add an extra session".
G8 SetView.tsx:521 "Watch demo" keep; Hide demo verified in 02c by round-4 notes.
G9 prescription-line.ts:97 "Last top set · Fri · 101 kg × 5" ok (units landed); on a non-top set it must not show (already handled).
Keep unchanged: Back to brief, More options, Done — set N · X kg, Missed X kg, Something hurt, Skip rest, Switch exercise, Start session, Back to Today.

## Q1 autoplay after opt-in
Player copy +0.4 (8.7 -> ~9.1): motion is the one gap vs GOWOD/Pliability/Runna that no string closes. Opt-in line "Play demo clips automatically? They load from YouTube." [Yes] [Not now], asked once on first "Watch demo" tap, default off, mirrored in Profile. Brief/rest/done unchanged. Without it, copy ceiling for player ~9.
