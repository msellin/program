# Round 3 — copy lens (2026-10-28)

## 1. Scores (10 = best peer)
- Brief 7.0 — plain, no jargon; competes with Pliability/GOWOD on clarity, loses on "why this session" (only a link-row) and on duplicated load language.
- Player 7.5 — best of the three: set name on button, Per side, Last top set. Competes. Weak: "Set 1 of 8 · Set", "Programme asks for", "18 sets left" vs "of 8".
- Rest 6.5 — "How was that?" asks a coaching question mid-recovery with jargon outcome ("sets your training max"). Does not yet compete with Runna/Whoop-level calm.
- Done 6.0 — correct but flat; "2 sets across 1 movement" + three stat tiles repeat each other.

## 2. Gaps, most important first
1. Brief card "8 sets · top set 102.5 kg × 5+" then chips "77.5×5 90×5 102.5×5+ 5×77.5": same fact twice in two dialects ("sets/top set/kg" vs bare "×"). Chips lack kg and the "5×77.5" is reps-first, the reverse of its siblings (BriefView.tsx:538 vs chips). Pick one.
2. Player "Programme asks for {dose}" (SetView.tsx:656): British "Programme" (app elsewhere says "plan"/"session"), "asks" personifies; and it shows when no comparison exists, i.e. when the dose is the only info. Say what it is.
3. "Set 1 of 8 · Set" (SetView.tsx:518): role word "Set" repeats itself. "18 sets left" next to "of 8" reads as a bug (harness padding, but a real Extra-set user sees it too).
4. "Next · set 2 · 90 × 5" (SetView.tsx:390): no unit, "·" soup, third line of grey under Per side. Add kg.
5. Rest "How was that?" + "How many more could you have done? This sets your training max." (RestTakeover.tsx:370-374): "training max" undefined at first use; "Easy / Right / Too hard" labels vs "4+ more / ~2 more / 0-1 more" mixes two scales. No confirm-first reassurance: it implies silent change.
6. Rest "Do something else next" (RestTakeover.tsx:470): vague, floating, unlabelled as a link. "Add a note" fine.
7. Done: "Done" H1 + "2 sets across 1 movement." + tiles SETS/MOVEMENT/REPS repeat. "Movement" vs "exercise" (Brief: "4 exercises"). "Thu — front squat + unilateral" is internal shorthand. Stopped state "Good call." is right tone, keep.
8. "Something hurt" chip + "Missed 77.5 kg": fine, plain. "Change weight" good.

## 3. Fixes
- F1 BriefView.tsx:538/chips: card "8 sets · top 102.5 kg × 5+" ; chips "77.5 × 5", "5 × 77.5" -> "77.5 × 5 · 90 × 5 · 102.5 × 5+ · back-offs 5 × 77.5" (or drop chips; keep one).
- F2 SetView.tsx:656: "Programme asks for {dose}" -> "Plan: {dose}".
- F3 SetView.tsx:518: "Set 3 of 8 · Top set"; drop role when it is plain "Set".
- F4 SetView.tsx:390: "Next: set 2 · 90 kg × 5".
- F5 RestTakeover.tsx:370-374: "How did that feel?" / "Reps left in the tank. Terav suggests a weight change; you accept it." First use of the term: "training max (the weight your sets are based on)". Chips: "Easy · 4+ left", "Right · ~2 left", "Hard · 0–1 left".
- F6 RestTakeover.tsx:470: "Switch exercise".
- F7 SessionDone.tsx:83: "2 sets of Block pull logged." (one movement) / "10 sets, 3 exercises logged."; keep "Back to Today". Say "exercise" everywhere (not "movement").
- F8 "Start session" keep; Continue: "Continue — set 3" good.

## 4. Votes
- X1 APPROVE: figure band helps recognition; AMRAP pill fine.
- X2 APPROVE: 72 px inside ring reads calmer; keep contrast.
- X3 APPROVE: stays-open is plain and saves a tap; clear label "Hide demo" needed.
