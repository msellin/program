# Round 3: design lead (2026-10-28), scores 1-10, 10 = best of GOWOD/Runna/Pliability at its own job

Scores: brief 6.5, player 6.5, rest 6.0 (done screen 5.5). Competes: NO on richness, YES on honesty/logging.
Looked at: 393x852 + 375x667 brief, set1, rest, 15-sets, done; four peer sheets; peers-visual-language.md.

## Gaps, most important first
1. Player is a spreadsheet with a stick figure on top: set chips and 77.5 kg dominate; no sense of "workout" (peers: media + one clear card + next-up list).
2. Dead 60-80px void between chip rail and the number (393x852) while the figure is a dim grey square: the stage is under-lit, not a hero.
3. Rest screen leads with a timer; the one thing Terav owns (RIR "How was that?" = log signal) is a bordered form card below the fold on 667. Next-up is text only, no figure.
4. Brief: card list is generic; only the first card has figure/chips; no week dots, no trio stats, no visible "why this load" besides one chevron row.
5. Done: three equal stat boxes, then "Back to Today"; nothing says what the engine learned from your log (the core promise).
6. 375x667: bottom row crowded; "Missed 77.5 kg" and "Change weight" are equal weight to a destructive-feeling action.

## Fixes (keep core idea; flat bronze, existing tokens)
F1 SetView.tsx:518 + chip rail: collapse "Set 1 of 8 . Set" and "18 sets left" into one line; drop the 'Set' role word when role is plain; shrinks the void.
F2 SetView.tsx:470-500 figure band: lift stage to surface-raised with bronze 10% floor glow, full-bleed (no border/radius at edges), so it reads as stage.
F3 SetView.tsx:~900-950: demote Missed to a text-style tertiary; Change weight as a small pill beside Done only on >=760px.
F4 RestTakeover.tsx:370-405: move "How was that?" ABOVE +30s/Skip as a single row of 3 chips with no card border/paragraph (one-line caption "Sets your training max"). It is the product; make it the hero under the ring.
F5 RestTakeover.tsx:~330: Next up shows the 40px line figure + "Set 2 of 8 . 90 kg x 5" (weight, not just name); fill the same slot Runna uses for the next card.
F6 BriefView.tsx (cards ~lines 200-300): give every exercise card the 40px figure thumbnail (not only the first) and a one-line "why" under the top-set row, citing the log signal ("last week 100 x 5, 2 left").
F7 SessionDone.tsx:76: add one engine line above the trio: "Next block pull: 105 kg. Proposed because last top set was Right (~2 more)." with an Accept/Later pair (confirm-first). Replace 3 boxes by Runna-style trio without borders.
F8 SetView.tsx header (~410-430): segmented progress bar to 3px, one segment per exercise with filled bronze for done (GOWOD); the bar must not sit beside the Something hurt chip.

## Votes
X1 AMEND: show the figure band on <760 px only until Done is tapped once for that exercise, then collapse to the thumbnail; the band costs ~150px of 667 that the number and Done button need. Keep AMRAP rule.
X2 APPROVE: 72px inside the ring is correct (peer ring with seconds inside); the 104 overflowed. Keep the 60px short-phone step.
X3 APPROVE: in-memory only is right, no storage, no consent issue; reset when exercise changes.
