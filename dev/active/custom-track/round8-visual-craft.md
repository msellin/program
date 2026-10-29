# Round 8 — visual-craft lens (2026-10-29)
Seen: all 20 v7 PNGs' sheets plus 01/02/02b/06 individually at 375x667 and 393x852; peer sheets. 10 = best peer at that job.
## Scores (round 7 in brackets)
Brief 9.5 (9.2) · Player 9.0 (8.7) · Rest 9.5 (9.4) · Done 8.9 (8.6)
## Q1 autoplay opt-in: player 9.0 -> 9.5. Not 10: YouTube title/logo/link badge sit on the frame (02c) = BLOCKED (embed terms).
## Changes to 10
Brief
G1 BriefView.tsx:389 rows 2-4 `bg-surface` -> `bg-transparent` for non-main rows (`isMain && !isDone` keeps bg-surface + `border-bronze`, :391 is now applied): row 1 must be the only lit card.
G2 BriefView.tsx:283 `tracking-[.1em]`, :319 `tracking-[.14em]` -> `tracking-widest` (third round open).
G3 BriefView.tsx:207-208 "Why these weights" line wraps to a one-word widow ("max") at 393; copy lens shortens to "69% of your 76.5 kg max".
Player
G4 SetView.tsx:704 `flex-1 min-h-3` -> `flex-1 min-h-0`; keep :774 spacer. At 375 02 there is ~90px dead above the weight and ~50px below; at 393 02/03 the weight block sits 60px low then jams against Done. Cap the spacers: `flex-[1]` above and `flex-[2]` below so the weight rises under the strip.
G5 SetView.tsx:618 "27 sets left today" at set 17 of 17 (04) counts the whole day, not remaining; count unlogged planned rows only. :612 `text-ink` -> `text-strong`.
G6 SetView.tsx:908, :1013 `tracking-[.14em]` -> `tracking-widest`.
G7 375x667 04 (and 393 04): "Next: Bulgarian split squat" line is clipped by Done at 393 (04) — SetView.tsx:772 move into the spacer-free zone or drop `mt-2`; at 375 the strip overflows left edge ("12" cut) — SetView.tsx:~622 strip needs `scroll-px-4` + start-aligned scrollIntoView on active tile.
Rest
G8 RestTakeover.tsx:385 `gap-3.5` -> `gap-3.5 [@media(max-height:700px)]:gap-3`; :492 "Switch exercise" is an outlined full-width button as loud as Skip rest: -> text link `text-small text-muted underline-offset-2` (one lit CTA).
G9 393 02b has ~80px void between "Per side" and "Reps left": RestTakeover timer block `flex-1` centring (not top-weighted).
Done
G10 SessionDone.tsx:94 drop `<DoneStats>` (3/30 · 1 · 15 reads before the result; "3/30" is capture padding); one line under h1 :84: `<p className="text-small text-muted tabular-nums">3 sets · 1 exercise · 15 reps</p>`. Third round open.
G11 DoneSections.tsx:48 `text-h1` -> `text-metric`; the result is the hero, and the 393 void (~190px) shrinks.
G12 DoneSections.tsx:72 `text-h3` -> `text-body`; NextSessionCard `<Card>` -> `bg-transparent border-line-soft` so only Best set is lit.
G13 SessionDone.tsx:135 training-max `rounded-xl border px-3.5 py-3` -> `border-t border-line-soft pt-3` inside the Best set card (four boxes -> two).
## Blocked outside code
YouTube title strip/logo/badge (embed terms); missing figures for new exercises (parallel session); Q1 opt-in needs owner sign-off on the privacy copy.
## Projected after G1-G13: Brief 9.8, Player 9.4 (9.7 autoplay), Rest 9.8, Done 9.5.
