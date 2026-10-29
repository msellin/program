# Round 3 — visual-craft lens (2026-10-28)

## 1. Scores (1-10; 10 = best peer)
- Brief 6.5 — clean, but one lit card and three identical grey slabs; no figure on rows 2-4; ~120px empty band above Start.
- Player 7.0 — set weight (77.5 at ~60px) and bronze Done are strong; stick figure is the weakest pixel (peers use real footage/photo); ~90px dead band between set rail and number.
- Rest 7.5 — ring plus 72px number is the best-composed screen; RPE card under it is heavy, three equal outlined boxes.
- Done 6.0 — three identical stat tiles, no visible progress; the screen with the least to remember.
- Competes? Not yet with GOWOD/Pliability on richness (they sell footage, we draw a figure). Does compete with Runna/Hevy on clarity. "Dull" = flat hierarchy, not missing colour.

## 2. Gaps, most important first
1. Hierarchy flat on Brief: cards 2-4 same weight as card 1, no figure/chips, so the list reads as a table (BriefView.tsx:389).
2. Done screen shows no outcome: Best set and Next session are equal-weight cards; nothing says "what moved" (the core idea: the log changed something).
3. Dead bands: Player between rail and weight (~90px at 852), Brief above Start (~120px), Done bottom (~220px).
4. "THE WHOLE SESSION" label: 12px caps, tracking .16em, muted on dark; competes with title case everywhere else (BriefView.tsx:305). Four tracking values in one file (.1/.14/.16/widest).
5. Progress bar: h-1 line-soft #24272f on #0e0f12 is ~1.3:1 (SetView.tsx:416) — present but unreadable.
6. Chips (77.5×5): surface-2 at 12px, five-plus near-identical pills; they look like buttons, are not (BriefView.tsx:417).
7. Rest "Next up" label and "Rest" teal label are two caps eyebrows around the ring; one is enough.
8. Stick figure on card 1 thumbnail (56x40) is too small to read.

## 3. Fixes (existing tokens only)
- F1 Progress pips: SetView.tsx:416 `bg-line-soft` -> `bg-surface-3`; filled stays bronze; `h-1` -> `h-1.5`.
- F2 Brief label: BriefView.tsx:305 `uppercase tracking-[.16em]` -> `text-small font-semibold text-ink normal-case tracking-normal`, "Today's session / The whole session" in sentence case.
- F3 Brief rows 2-4: add the same 56x40 figure at line 274 pattern to every row so all four share one anatomy; keep the bronze left border (line 390) as the only "next" cue.
- F4 Chips: BriefView.tsx:417 `rounded-md bg-surface-2` -> `rounded-full border border-line-soft bg-transparent` so they read as data, not buttons; keep tabular-nums.
- F5 Done: SessionDone.tsx — Best set card `bg-surface` -> `border-l-[3px] border-l-bronze` and `text-h2 text-strong` for "90 kg x 5"; add one line "Training max stays 126 kg until you accept" (confirm-first, names log signal). Drop the 3-tile stats to one `text-small text-muted tabular-nums` line.
- F6 Dead band on Player: SetView.tsx rail->weight container `justify-center` -> `justify-start pt-8` with Done/Change buttons pinned `mt-auto` (weight sits nearer the figure, bottom stays thumb-reach).
- F7 Rest: RestTakeover.tsx RPE block `rounded-2xl bg-surface` card -> no card, buttons only (`border-line-strong bg-surface-2` kept); removes one container level.
- F8 Brief spacing: Start bar `pt-2 pb-2 mt-4` -> `pt-3 pb-3`; fill the empty band by moving "How to run this" / "Log an extra" into one `divide-y divide-line-soft` list (saves ~50px).
Rejected: gradients, glow, new colour per exercise, streak confetti (dilute flat bronze / core idea).

## 4. Votes
- X1 APPROVE — figure on short phones is the only richness we have; the AMRAP exemption is right.
- X2 APPROVE — 72px inside the ring is better composed than 104 floating; keep the 60px short-phone step.
- X3 APPROVE — in-memory only is right; no persisted preference, no new setting.
