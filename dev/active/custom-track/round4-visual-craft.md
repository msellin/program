# Round 4 — visual-craft lens (2026-10-28)
Seen: both v3 sheets + peer sheets (player, done). Tokens only; flat bronze; no pre-tap YouTube.

## Scores (10 = best peer at that job)
- Brief 7.5 (was 6.5): outlined chips and sentence-case label fixed the table feel; rows 2-4 still bare, one lit card.
- Player 7.5 (was 7.0): 60px weight and bronze Done are peer-grade; figure is a drawing next to GOWOD/Runna footage; 393 still has ~190px dead band between set strip and weight.
- Rest 8.5 (was 7.5): ring + 72px number beats every peer sheet; RPE trio now unboxed. Remaining: two eyebrows, 375 crowding.
- Done 6.5 (was 6.0): still three equal tiles, text-h3 best set, ~220px dead tail. Runna's done = one hero number + share; ours has no hero.
"Dull" now = no peak moment on Done and no image on Brief rows, not colour.

## Changes to 10 (all existing tokens)
Brief
G1 BriefView.tsx:395 — figure on EVERY row, same `h-12 w-16 rounded-lg bg-ground` box (blocked only on the parallel figure drawings; ship the box with a bronze-dim `text-bronze` glyph fallback, not blank).
G2 BriefView.tsx:388 — rows 2-4 `bg-surface` -> `bg-transparent border border-line-soft`; row 1 keeps `bg-surface` + bronze left border. Weight difference = hierarchy without new colour.
G3 BriefView.tsx:282,318,343,360 — caps eyebrows `tracking-[.1em]/[.14em]/widest` -> one value `tracking-widest` (3 values to 1).
G4 BriefView 375x667: Start bar overlays "How to run this" half-clipped; merge the two links into one `divide-y divide-line-soft` list and add `pb-16` to the scroller so nothing sits under the bar.
Player
G5 SetView.tsx:473 container + :609 `flex-1 min-h-3` spacer — put weight block directly under the strip: replace spacer above weight with `mt-6` and keep the spacer BELOW the weight (weight sits ~100px higher, Done stays at thumb).
G6 SetView.tsx:522 — "Set 1 of 8" row `mt-4` -> `mt-3`; set count `text-small font-semibold text-strong` (it is the only anchor on the screen).
G7 Figure card: the `Watch demo` pill is the lone interactive on the card; give it `bg-surface-2 border border-line-strong` so the tile reads as "video lives here", the closest legal thing to GOWOD's footage.
Rest
G8 RestTakeover.tsx:289 — delete "Rest" eyebrow (ring already says it); keep :339 "Next up" but `tracking-widest text-small normal-case`.
G9 RestTakeover.tsx:305-319 — at max-height:700px ring wrapper `w-[148px]` (ring 176 -> 148) so Next up + RPE fit without touching the top edge.
Done
G10 DoneSections.tsx:19-24 — Best set becomes the hero: Card `border-l-[3px] border-l-bronze` always (not only PB), value `text-h3` -> `text-h1 font-semibold tabular-nums tracking-[-0.035em] text-strong`, eyebrow `text-small text-muted normal-case tracking-normal` "Best set".
G11 SessionDone.tsx (~85-110) — three stat tiles -> single line `text-small text-muted tabular-nums` "2 sets · 1 exercise · 10 reps" under the h1.
G12 SessionDone.tsx:79 — `gap-5` -> `gap-4`; Back to Today bar `sticky bottom-0 pb-4` so the tail is not 220px of nothing.
G13 DoneSections.tsx:46-48 — Next session card `bg-transparent border-line-soft`, title `text-body font-semibold`: it supports, the Best set leads. When a proposal exists it takes the bronze border instead (one lit card per screen — same rule as Brief).
G14 Done needs a "what moved" line even without a proposal: `text-small text-ink` "Logged. Training max stays 126 kg until you accept one." (confirm-first, names the signal) under Best set.

## Q1 (autoplay opt-in)
Player 7.5 -> 9.0, Brief +0.5 if the thumbnail becomes a muted loop. Real footage is the single largest peer gap; a drawn figure cannot reach 10 alone. Cost: it needs the one-time sheet, a calm "Off" in Profile, and the privacy copy changes from "nothing loads" to "loads only after you say yes". Without it the ceiling for Player is ~8.5 with G5-G7 plus commissioned figures; I would not ship it pre-launch unless the owner accepts the copy change.

## Rejected
Gradients/glow (Runna's green wash), confetti, per-exercise colour: they dilute flat bronze.
