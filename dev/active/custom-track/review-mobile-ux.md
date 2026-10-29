# Mobile UX review: strength brief + set player (2026-10-28)

Lens: thumb reach, 44px targets, fold at 375x667 vs 393x852. Evidence: `shots/before/*`. Code: `BriefView.tsx`, `SetView.tsx`.

## Scores (1-10, 10 best)
- Brief: **6.5**. Clear hierarchy, but the sticky Start bar eats the fold and the hero row is dense.
- Player: **4.5**. Right bones (Done in the bottom third, weight is the hero), but 20 sets is unusable, the 667 layout clips, and the chrome has 34px targets.

## Why Last time / Prescribed are clipped at 667 (03)
`DaySession.tsx:434` is `fixed inset-0 flex flex-col`. SetView's middle region (`SetView.tsx:515`) is `flex-1 min-h-0 justify-center`, and the bottom block (`:608`) is `flex-shrink-0`. The AMRAP grid is 3 rows x 62px + labels + `pb-[22px]`, about 300px, and the top block is about 150px. That leaves about 215px for the middle, which needs about 290px (92px numeral, 5+ reps, card, plates line).
The card (`:581`) has `overflow-hidden`, which sets its automatic min-height to 0, so as a shrinkable flex child it is squashed to the label row. The values vanish while the labels remain. The plate line, with no overflow rule, is pushed into the grid's caption.
At 393x852 there are 185px more, so it fits. The bug is a height budget problem, not a rendering bug.

## Findings (file:line)
1. **P0 safe area.** `DaySession.tsx:434` is `fixed inset-0` with no `env(safe-area-inset-top/bottom)`. Top bar is `pt-1` (`SetView.tsx:354`). In standalone on an island phone the Back/rail/hurt buttons sit under the status bar. Bottom is `pb-[22px]` (`:608`), shorter than the 34px home indicator, so the 40px secondary row (`:670`, `:816`, `:880`) sits in the indicator zone. Fix: `pt-[max(env(safe-area-inset-top),4px)]` and `pb-[max(env(safe-area-inset-bottom),16px)]`.
2. **P0 pips at 20 sets (04).** `flex-1` across 343px with `gap-1` gives (343 - 19x4)/20 = **13px wide x 34px tall**. "77.5x5" truncates to "1 7...", and 19 and 20 collide. At 15 sets they are 19px wide, still under 44. Replace with a vertical row table (Hevy/Strong): `SET | PREV | KG | REPS | check`, rows `h-11` (44px), the active row bronze, the list `overflow-y-auto` with the active row scrolled to center, and a **visible window of 2-3 rows** at 667.
3. **P1 top-bar targets.** Back, ⋯ and "Something hurt" are `34px` (`:360`, `:411`, `:419`). Rail chips are about 40px (py-1.5 plus 2 caption lines). Make all `h-11 min-w-11`. The rail shows about 1.5 chips (active 104px + 74px), so exercise 3+ is invisible. Replace it with a one-line "Exercise 2 of 4 ▾" button that opens a sheet. Move "Something hurt" into ⋯ or an icon-only 44px amber button.
4. **P1 secondary row.** `h-10` (40px), two text-only buttons, no border (`:674`, `:831`, `:884`). Below 44 and with no affordance. Make them `h-11` outlined or tinted buttons. "Missed 102.5 kg" next to "Change the weight" is a destructive-ish action with 8px gap (`gap-2`); give Missed a different tint and 12px+ gap. The Next dev badge covers "Change" in the shots, which is a dev artefact, but real home-indicator overlap is finding 1.
5. **P1 caption.** `:428` truncates the exercise name ("BLOCK PULL, MID-SHIN ..."), and "16 SETS LEFT" is 12px uppercase. With the rail collapsed into the exercise button, drop the name from the caption (it is already in the button) and show "Set 3 of 8".
6. **P2 AMRAP grid.** 62px tiles (`:797`) are fine and well sized, but a wrapped 4-col flex gives an uneven last row ("9" wide, "10+" wide). Use `grid grid-cols-5 gap-2 h-12`, giving 2 rows with 10+ folded into the second row (1-9 plus "10+" fits exactly), which saves 70px.
7. **P2 weight is not adjustable in place.** The 92px number is display-only. Make it a tap target that opens the stepper (`StepperRow` buttons are 58x52, good), or put −2.5/+2.5 flanking the number at 56px. Then the "Change the weight" row is redundant and goes away.

## Height budget: player at 375x667 (island phones: subtract safe-top about 47)
| Zone | px | Note |
|---|---|---|
| Safe top | 0 (SE) / 47 | `env()`, not constant |
| Top bar | 52 | 44 targets + 8 gap: Back, Exercise N of M ▾, hurt, ⋯ |
| Caption | 24 | "Set 3 of 8 · 16 left" |
| Set list | 132 | 3 rows x 44 visible, scrolling, active centered (AMRAP: 88 = 2 rows) |
| Figure/demo | 0 at 667 / 120 at 852 | At 667, a 56px thumbnail inside the weight row, tap to load |
| Weight + reps | 120 | numeral shrinks to 64px; reps line 28 |
| Context line | 24 | one line: `Last 101×5 · Rx 90×5`, replaces the card |
| Done | 56 | `size-lg`, thumb zone |
| Secondary | 44 | Change weight / Missed |
| Safe bottom + pad | 16 (SE) / 34+8 | |
| Gaps (7 x 8) | 56 | |
| **Total** | **~524** | about 143px slack at 667. AMRAP swaps Done 56 for a 2-row grid 112 (+56), which still fits |

At 852, the extra 185px goes to the figure (120) and 2 more set rows. The Done button's vertical reach from the cradle origin (195, 790) is under 60px, which is good. Do not move it.

## Brief (01, 05)
- Sticky Start bar (`BriefView.tsx:525`) is about 60px plus the 64px nav: 124px of 667 (19%) is chrome. It covers the next card at the fold (01), and the "Start — Block pull, mid-shin height" label is long. Short label ("Start") is already decided. The fixed Start bar also has no scroll-fade, so the cut is hard. Add `pb-28` to the scroll area and a `bg-gradient-to-t` fade.
- Hero row's prescription line wraps to 2 lines of 12px text ("77.5 × 5 · 90 × 5 · 102.5 × 5+ · 5 × 77.5 kg"). Collapse to "5/3/1 · top set 102.5 × 5+" with the ladder behind a tap. The MAIN tag is the only row-level hint of weight, and it is truncated to the right edge.
- Row targets are fine (full-width cards >44px). Thumbnails `h-10 w-14` / `h-12 w-[68px]` are small but non-interactive.
- 100dvh is used correctly (`BriefView.tsx:178`).

## Benchmark (competitor-refs.md: Hevy; Strong from general knowledge)
- Both show **all sets as rows** (SET / PREVIOUS / KG / REPS / ✓), each about 44-48px, with the input in the row. Previous is a column, not a card. Rest timer is a bottom pill, not a takeover. Do this: it replaces pips, the caption, the Last time card and most of the stepper.
- Reject: Hevy's in-row numeric inputs force the keyboard up. Terav's prefilled-weight Done (one tap per set) is faster; keep it. Use the row table for navigation and history, and keep the hero for the active set.

## Top 5 fixes
1. Safe-area insets on the player shell (finding 1).
2. Replace pips with a 44px row table, 3 rows visible (finding 2).
3. Collapse the rail into one "Exercise N of M" button, make all chrome 44px (finding 3).
4. Merge Last/Prescribed into a one-line caption, remove `overflow-hidden` shrink (clip bug), and shrink the numeral to 64px at <700px height via `[@media(max-height:700px)]`.
5. 44px outlined secondary buttons with Missed separated; AMRAP grid as `grid-cols-5` 2 rows.
