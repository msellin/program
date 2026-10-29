# Copy review: strength-day brief and set player

Scores (1-10): brief 6, player 6.5. Evidence: shots/before/393x852/01, 02 (+ code lines in the brief).

## What works
- "Done — set 1 · 77.5 kg" names the set and the load. Keep.
- Ramp line "77.5 × 5 · 90 × 5 · 102.5 × 5+ · 5 × 77.5 kg" is exact; only the separators and the "+" are unexplained.
## What fails
- Brief subtitle "Cycles 3 + 4 (with 1RM test)" is jargon (BriefView ~99-110 progress label).
- Start label "Start — Block pull, mid-shin height" is long and wraps on 375.
- The same prescription appears three times (rail row, top-set card, hero card). One line only.
- "Top set" eyebrow is keyed to the last row index (SetView ~516: `activeSetIndex === rowCount - 1`). Wrong on a back-off or added set (04: set 20 at 90 kg).
- "LAST TIME 101 × 5" has no date, and sits beside "PRESCRIBED" (redundant on set 1).
- "Change the weight" / "Missed 77.5 kg" are tiny text links, and the second one is cryptic.

## (a) Brief
- Subtitle: `4 exercises · about 60 min` (drop the phase line). Optional second line, week context only: `Week 3 of 8 · test day` (use "strength test", not "1RM test").
- Start: `Start`. In progress: `Continue — set 4`. With a hero exercise already logged: `Continue — set 4`. All-follow sessions: `Start` / `Continue`. Prescription sessions: `Log session`.
- Top-set card eyebrow: `Top set today`. Body: `102.5 kg × 5 or more`. Sub: `81% of your 126 kg max`. Delete the "After … Then …" sentence (it repeats the rail).

## (b) One prescription line per exercise (rail row, `railScheme`)
- 5/3/1 ramp + AMRAP + back-offs: `77.5×5, 90×5, 102.5×5+, then 5×77.5 kg`
- 5/3/1 no ramp: `102.5×5+, then 5×77.5 kg`
- Straight: `4×8 · 60 kg`
- Ladder: `5 sets · 60, 70, 80, 90, 100 kg`
- No-TM accessory (hip thrust): `4 sets · your weight` (loadable, no TM: `4 sets · pick a weight`; show last used once logged: `4 sets · last 60 kg`). Never "4 sets" alone.
- Timed hold: `3×30 s hold`
- Per side: `3×8 each side` (with load: `3×8 each side · 20 kg`)
- "+" means "or more": explain once, in the player's AMRAP prompt, not in the rail.

## (c) Player
- Caption: `Block pull · set 1 of 8` (left), `18 left` (right). Drop "sets left", it truncates the name.
- Eyebrow: `Set 1`. `Top set` only when the row is the programme's top set (a flag on the row, not the last index). Added set: `Extra set`. Editing: `Editing set 3`. Back-off: `Back-off`.
- Last time: show `Last time · Mon 101 × 5` (weekday within 6 days, otherwise `12 Oct`). Hide "Prescribed" when it equals the big number (set 1 does).
- Plates line: `Per side: 25 + 2.5 + 1.25 kg` (the current "/side" is unlabeled).
- AMRAP prompt: `How many reps did you get?` Under the top set add: `5 or more. Stop one rep before form slips.` Weight and set number live in the button, so remove `· 102.5 kg` from the prompt.
- Editing prompt: `Fix the reps`.
- Secondary buttons (real, outlined, 44px): `Change weight` (open: `Hide`), `Missed it` (aria: "Missed 77.5 kg"). Unloaded: `Change reps`.
- Keep stable: `Back to brief`, `More options`, `Done — set N · X kg`, `Something hurt`. Editing: `Save — set N · X kg`.

## Priority
1. Fix "Top set" logic (wrong data on screen).
2. Remove subtitle jargon and the triple prescription.
3. Short Start label, dated Last time, real buttons.
