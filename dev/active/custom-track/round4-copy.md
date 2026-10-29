# Round 4 — copy lens (2026-10-28)
Seen: both v3 sheets (375/393), peers sheet-player. Round-3 fixes landed: F2-F4 (Plan/Set N of 8/Next kg), F5 partly, F6.
Still open from R3: F1 (chips), F7 (Done), "Programme", "training max" undefined.

## Scores (10 = best peer at the job)
- Brief 8.0 — plain, "Top set at 81% of your 126 kg training max" is the best "why" line in the set. Loses on dialects and "How to run this" / "Log an extra session" as twin grey rows.
- Player 8.3 — set name on button, Per side, Plan line all work. Loses on bare "101 × 5", "Programme", "16 sets left today" beside "of 8".
- Rest 7.5 — calm 3:00, one question, confirm-first now stated. Loses: "How did that feel?" sits below Next-up with a jargon scale; "more" chips ambiguous.
- Done 7.0 — correct, three tiles + best set + next session; loses on "Done" as a whole headline and the shorthand "Thu — front squat + unilateral".

## Changes to reach 10
G1 prescription-line.ts:21 + :36-37 (brief card + chips, BriefView chips): one dialect, units everywhere.
   Card "8 sets · top 102.5 kg × 5+" -> "8 sets · top set 102.5 kg × 5+" (spell "top set", matches player "Top set").
   Chips "77.5×5","90×5","102.5×5+", "then 5 × 77.5 kg" -> "77.5 kg × 5","90 kg × 5","102.5 kg × 5+","back-offs 5 × 77.5 kg". (Chips wrap to 2 rows; drop the card's duplicate if too tall.)
G2 SetView.tsx:668 "Programme asks for {authoredDose}" -> "Plan: {authoredDose}" (R3 F2 not applied here).
G3 prescription-line.ts:97 "Last top set · Fri · 101 × 5" -> "Last time · Fri · 101 kg × 5" ("top set" is redundant on a top-set screen; add kg).
G4 SetView.tsx:529 "16 sets left today" -> "{n} to go" when the row count and total differ is confusing; use "16 left today" and show "Set 3 of 8" only; for Extra sets show "Extra set 20" not "Set 20 of 20 · Extra set" (SetView.tsx:524-525).
G5 RestTakeover.tsx:393-396: "How did that feel?" -> "Reps left in the tank?"; helper -> "Terav may suggest a new training max (the weight your sets are based on). You decide." First use only; later "We'll use it next week." stays. 
G6 RestTakeover.tsx:37-39 chips: "4+ more" -> "4+ left", "~2 more" -> "~2 left", "0-1 more" -> "0–1 left" (en dash). Labels Easy / Right / Too hard keep. Move the question above "Next up" only if height allows; else leave.
G7 SessionDone.tsx:81: H1 "Done" -> "Session done" (stopped state "Session stopped" stays, parallel). Tiles: DoneSections.tsx:6-12 "Movement" -> "Exercise" already; drop nothing else.
G8 DoneSections.tsx:46-: "Thu — front squat + unilateral" -> "Front squat + unilateral work" (drop weekday prefix; the date is the line above).
G9 BriefView.tsx:438,455: "How to run this" -> "How this session works"; "Log an extra session" -> "Add an extra session" ("Log" collides with set logging).
G10 BriefView.tsx:515-area / SetView.tsx:515 "Watch demo" keep; open state label must read "Hide demo" (verify in 02c).
Keep unchanged (tests click them): Back to brief, More options, Done — set N · X kg, Missed X kg, Something hurt, Skip rest, Switch exercise, Start session, Back to Today.

## Q1 (autoplay muted after one-time opt-in)
Player copy score +0.3 to +0.5: peers (GOWOD, Pliability, Runna) show motion on the player; a still figure with "Watch demo" is the biggest gap to a 10 against them. The opt-in line is plain and honest, and fits the privacy promise if it is asked once, defaults off, and lives in Profile too. Wording: "Play demo clips automatically? They load from YouTube. [Yes] [Not now]". Do not show it mid-set; ask on first "Watch demo" tap. Copy impact on brief/rest/done: none.
