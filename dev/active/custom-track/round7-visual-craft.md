# Round 7 — visual-craft lens (2026-10-29)
Seen: all v6 PNGs at 375x667 and 393x852, four peer sheets. Tokens only, flat bronze, no pre-tap YouTube.
## Scores (10 = best peer at that job; round 6 in brackets)
Brief 9.2 (9.0) · Player 8.7 (8.5) · Rest 9.4 (9.3) · Done 8.6 (8.3)
## Q1 autoplay opt-in: player 8.7 -> 9.4 (GOWOD/Runna-class footage). Not 10: YouTube title/logo/link badge sit on the frame (02c) = BLOCKED outside code (embed terms). The ask row ("Play clips automatically? YouTube sees your IP.") is correctly one row, Yes/Not now; keep.
## Changes to 10
Brief
G1 BriefView.tsx:391 `border-bronze/70` -> `border-bronze`: at 70% the main-card border is near-invisible in 01 (row 1 reads like rows 2-4).
G2 BriefView.tsx:389 rows 2-4 `bg-surface` -> `bg-transparent` (row 1 keeps it). Round-6 G2, still unapplied.
G3 BriefView.tsx:283 `tracking-[.1em]`, :319 `tracking-[.14em]` -> `tracking-widest`. Round-6 G1, unapplied.
G4 BriefView.tsx:178 `pb-20` -> `pb-28`: 375x667 last row is under the fade/Start bar.
G5 BriefView.tsx:204 "Why these weights" wraps to a one-word widow ("max") at 393; shorten line to "69% of your 76.5 kg max" (copy lens decides wording).
Player
G6 SetView.tsx:694 `flex-1 min-h-3` spacer sits above the weight: 90-130px dead at 375 (02, 04) and under the strip at 393 02c. Replace with `min-h-0`; wrapper :697 `pb-3` -> `mt-auto pb-3` is not enough; instead add `flex-1` spacer AFTER the weight block so weight rises under the strip and Done stays pinned. Round-6 G4, third round open.
G7 SetView.tsx:705 375x667 02c: "PR at 5" chip is clipped behind the set strip when the clip is open (weight shrinks to text-metric but block overflows). Hide chip while `demoOpen` on `[@media(max-height:700px)]` (`hidden` + `[@media(min-height:700px)]:inline-flex`) or let the weight block drop `mb-1`.
G8 SetView.tsx:606/611: "27 sets left today" at set 17 of 17 (04) is the whole-day count not remaining; show `totalRemaining` of unlogged planned rows only; and :606 `text-ink` -> `text-strong`, :611 `text-small` -> `text-caption`.
G9 SetView.tsx:897/1002 `tracking-[.14em]` -> `tracking-widest`.
Rest
G10 RestTakeover.tsx:436 row +30s/Skip to :473 note row gap is 12px (375 touches): :385 `gap-3.5` -> `gap-3.5 [@media(max-height:700px)]:gap-3`, and `mt-1` on :473. At 375 "Switch exercise" sits under the dev badge; no code fix.
Done
G11 SessionDone.tsx:94 drop `<DoneStats>`; one line under h1 :84 `<p className="text-small text-muted tabular-nums">3 sets · 1 exercise · 15 reps</p>`. Three stats read before the result; round-6 G11, unapplied.
G12 393 06: ~260px void between stats and Best set. Keep the cards low but make the result the hero: DoneSections.tsx:60 `text-h1` -> `text-metric` (40px, token). With G11 the void shrinks to ~190px; drop :82 `gap-4` -> `gap-5`.
G13 DoneSections.tsx:56 NextSessionCard `<Card>` -> `className="bg-transparent border-line-soft"`, `text-h3` -> `text-body` (:58). Only Best set stays lit.
G14 SessionDone.tsx:111 training-max `rounded-xl border` -> `border-t border-line-soft pt-3` inside the Best set card (four boxes become two).
## Blocked outside code
YouTube title strip/logo/link badge (embed terms). Missing figures for new exercises (parallel session).
## Projected after G1-G14: Brief 9.7, Player 9.4 (autoplay) / 9.2 (tap), Rest 9.6, Done 9.4.
