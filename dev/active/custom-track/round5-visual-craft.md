# Round 5 — visual-craft lens (2026-10-28)
Seen: v4 sheets 375x667 + 393x852, peer sheets. Tokens only; flat bronze; no pre-tap YouTube. Q1 skipped.

## Scores (10 = best peer at that job)
- Brief 8.0 (7.5): "Why these weights" card + one lit row work; rows 2-4 are still text-only next to a lit image row; two tracking values left (BriefView.tsx:283 .1em, :319 .14em).
- Player 8.0 (7.5): figure fills the band, 60px weight and bronze Done are peer-grade; 393 sets 1/3/20 still leave ~90-130px empty between set strip and weight; the set count is a quiet 12px grey line; figure is a drawing, not footage.
- Rest 9.0 (8.5): ring, 72px number, unboxed RPE trio beat every peer; 375 still crowds (RPE helper wraps to 3 lines, +30s/Skip touch "Add a note").
- Done 7.5 (6.5): hero Best set lands, bronze edge; but still three equal stat tiles above it (SessionDone.tsx:~92 DoneStats) so the eye starts on "2 / 1 / 10", not the best set; 90px dead tail at 393.

## Changes to 10
Brief
G1 BriefView.tsx:395 figure box on every row, same `h-12 w-16 rounded-lg bg-ground`; fallback glyph `text-bronze` (not blank). BLOCKED on figure drawings (parallel session) — the only blocker to 10.
G2 BriefView.tsx:389 rows 2-4: `bg-surface` -> `bg-transparent border border-line-soft`; row 1 keeps `bg-surface` + `border-l-[3px] border-l-bronze`.
G3 BriefView.tsx:283,319 -> `tracking-widest` (matches :344,:361).
G4 375x667: add `pb-16` to the scroller so "How to run this" is not half under Start bar; merge the two links in one `divide-y divide-line-soft` list.
Player
G5 SetView.tsx:473/:619 move spacer: weight block gets `mt-6` under the strip, keep `flex-1 min-h-3` spacer BELOW the weight. Weight rises ~100px, Done stays at thumb. (Single biggest remaining fix.)
G6 SetView.tsx:530 "Set N of M" `text-small font-semibold text-strong`; :535 "N left today" stays `text-caption text-muted`.
G7 SetView.tsx:519 Watch demo pill already outlined; keep. Remaining gap to GOWOD/Runna is real footage: BLOCKED by tap-first privacy promise (Q1); ceiling ~8.5-9 without it. Do not fake motion.
Rest
G8 RestTakeover.tsx:393 helper text `text-caption` one line at 375 ("Reps left in the tank. You decide."); drop the parenthetical, keep the training-max explanation in Profile/brief card.
G9 RestTakeover.tsx:319-ish at max-height:700px ring wrapper `w-[148px]`, number `text-[48px]`; add `mt-3` between RPE trio and +30s/Skip row so they stop touching "Add a note".
Done
G10 SessionDone.tsx:~92 delete `<DoneStats>`; replace with one line under h1: `text-small text-muted tabular-nums` "2 sets · 1 exercise · 10 reps". Best set becomes the first block (DoneSections.tsx:19-24 is already right).
G11 DoneSections.tsx:46-48 NextSessionCard: `bg-transparent border border-line-soft`, title `text-body font-semibold`; when a proposal exists it alone takes the bronze edge (one lit card per screen).
G12 SessionDone.tsx training-max block: `rounded-xl border border-line-soft` -> merge into the Best set Card as a `text-small text-ink mt-3 border-t border-line-soft pt-3` footer (one card says what happened and what changed, instead of 4 stacked boxes).
G13 SessionDone.tsx:~139 movements list: keep, but name `text-small text-strong`, right side `text-caption text-muted` — already so; drop its `rounded-xl border` and use only `divide-y divide-line-soft` (fewer outlines = calmer tail).
G14 Optional: a one-line share/“copy session” `text-small text-bronze` link under Back to Today (Runna's share). Not needed for 9; skip if scope-sensitive.

## Blocked outside code
Figures on all brief rows (parallel session). Real footage on player (Q1 owner decision; privacy promise). Nothing else.

## Projected after G2-G6, G8-G13 (figures drawn, no autoplay)
Brief 9.0, Player 9.0 (cap without footage), Rest 9.5, Done 9.0.
Rejected: gradients/glow, confetti, per-exercise colour, week dots.
