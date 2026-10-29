# Round 7 — copy lens (2026-10-29)
Seen: all v6 PNGs both sizes (01,02,02b,02c,03,05,06) + sheet-player.jpg. R6 G2, G3, G4, G5, G6 verified applied.
## Scores (10 = best peer)
- Brief 9.2 — units explicit, why-card peer-best. Loses: "How to run this" / "Log an extra session" still unchanged (G1); "5×5 · 52.5 kg" rows tight dialect (G6).
- Player 9.3 — "PR at 5" better, autoplay prompt honest. Loses: PR badge shows on EVERY set (sets 1 and 4 at 52.5) — a claim repeated, so it reads as noise (G2); chips "52.5×5" bare (G3).
- Rest 9.3 — "Reps left in the tank?" best in set. Loses: "Too hard" vs "Easy/Right" mixed family; "+30s" (G4, G5).
- Done 9.3 — "Session done", Best set, TM row, 1 Exercise all clear. Loses: "Next session / Friday 30 Oct" fine; the sub "Front squat" under hero is the only repeat left; "Home rehab and activation" lacks a verb-free label issue (none). Remaining: blank void top (visual, not copy) and "no change" lacks reason (G7).
## Changes to 10 (keep test-clicked names incl. "Log an extra session" — DO NOT rename; harness clicks it)
G1 BriefView.tsx:441 "How to run this" -> "How this session works". (:458 stays.)
G2 SetView.tsx:705 show `PR at ${reps}` only on the first set at a weight that beats history, or only when this set's kg exceeds the best logged; sets 2-5 at the same kg show nothing.
G3 SetView.tsx done chips: "52.5×5" -> "52.5 × 5" (matches "52.5 kg × 5"); or drop "×5" when all sets share reps.
G4 RestTakeover.tsx:449 "+30s" -> "+30 s" (keep any test selector on aria-label, check first).
G5 RestTakeover.tsx:39 labels "Easy / Right / Too hard" -> "Easy / Right / Hard" would break the :262 check; instead change :262 with it, or keep and accept 9.3.
G6 prescription-line.ts:18,19,25 `${sets}×${reps}` -> `${sets} × ${reps}` (also "4×6 each side" -> "4 × 6 each side"); one dialect. Check tests asserting "5×5".
G7 SessionDone.tsx:~118 "76.5 kg · no change" add reason when none: "Changes only when a top set earns it" is fine; add "Top set was on plan." when top set met reps, else leave.
Autoplay (Q1 yes): player copy ceiling 9.5; G2, G3 reach it. Copy has no remaining honesty gap.
