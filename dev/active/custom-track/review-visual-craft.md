# Review: visual craft (type, accent, rhythm, set table), strength day

Scores (1-10, 10 best): Brief 6.0, Player 5.5. Evidence: shots/before/393x852 01, 02, 04.

## Findings (current)
- Brief: the hero row says "Main" in bronze, the eyebrow is bronze, the CTA is bronze (BriefView.tsx:184, 419-429, 543). Three bronze marks plus the active tab = accent used as decoration, not as "do this next".
- Brief: the hero row (`text-caption` run-on scheme, :393-401, wraps to 2 lines at 393) and the "Today's top set" card (:437-498) say the same thing twice. Decided: drop the card.
- Uppercase + tracking in 6 places on one Brief screen (:293 .16em, :439 .16em, :270 .1em, :418 .1em, :184). Section labels are quieter than the content they label but tracking is wide enough to read as shouting at 13px. Player: :429/:433 at .14em, :516 .18em, :573/584/595 .14em, :754 .14em. Four different tracking values (.1/.12/.14/.16/.18) = no system.
- Player: 92px weight (:535) + 32px "5 reps" + 40px-wide card = three competing heroes, floating in ~280px of empty centre (shot 02). Weight is 380px above the Done button it belongs to. 92px is off-scale (largest token is metric 40px).
- Player: "Top set" eyebrow fires on the last row of ANY count (:519): padded set 20 of 20 reads "Top set" in shot 04. Wrong, not just ugly.
- Player pips (:443-511): at 15+ sets each pip is ~14px wide, text collides ("1 7.", "2 9."), 34px tall. Unusable; replace with table.
- Secondary buttons (:674, :884) are bare `text-ink text-small` text; the Missed link sits under the dev "N" badge zone and reads as a caption, not a control.
- Header strip: rail tabs (min-w 74/104) + "Something hurt" in amber + back + more = 4 bordered chips in 34px row; amber on a non-warning action dilutes amber's "pain" meaning. Keep it but demote (below).

## Type decisions (existing tokens only)
- Weight anchor: `text-metric` (40px) is the ceiling for numbers; do not use 92px. Use `text-metric font-semibold tabular-nums tracking-[-.04em] text-strong` (BriefView already does this at :454). If more presence is wanted, keep 92px ONLY for the one current-weight numeral directly above Done, nothing else on screen above 20px.
- Eyebrows: one style only, `text-eyebrow uppercase text-muted` (token already has .06em tracking; delete every `tracking-[.1-.18em]`). Bronze eyebrow only for the programme name on the Brief; player eyebrow becomes `text-muted`.
- Sentence-case everything that is a label of a value ("Last time", "Prescribed"): `text-caption text-muted`, no uppercase. Reserve uppercase for exactly one thing per screen (section label).
- Tags ("Main", "Done", "Held", "Optional"): no uppercase; `text-caption text-muted`. Drop the "Main" tag; first-in-list + CTA already say it.

## Accent economy (one bronze per screen state)
- Brief: bronze = CTA only. Programme eyebrow -> `text-muted`. "Main" removed. Resulting: 1 bronze element.
- Player: bronze = Done button + the current row's left rule (`border-l-2 border-bronze`). Active rail tab: `border-line-strong bg-surface-2 text-strong` (no bronze fill); rail counter `text-muted`. Rep-PR stays green, Missed stays text (see table). "Something hurt": `border-line-soft bg-surface text-ink` with amber only on its icon/dot, or move into the ... overflow if the owner agrees (safety control: keep visible, just not amber-bordered).

## Brief card rhythm
- One row per exercise, uniform: `rounded-lg border border-line-soft bg-surface px-3.5 py-3` (replace py-[13px]); title `text-body font-semibold text-strong`, ONE prescription line `text-small text-muted tabular-nums mt-0.5` (not caption/ink; 14px beats 13px for numbers read at arm's length). Between rows `space-y-2` (8px, replacing space-y-[7px]); section label to list `mb-2`.
- Header block: `space-y-1` then summary `text-small text-muted`, phase line `text-caption text-muted` is fine. Replace `-mt-3 space-y-0.5` hack (:192) by putting all three inside the `<header className="space-y-1">`.
- Optional rows: dashed border (exists) + "Optional" tag text; done rows: `text-muted` title + check glyph "✓" before "Done" so state survives without colour.

## Set table spec (player body, replaces pips + floating hero for list)
Scrolling region `flex-1 overflow-y-auto px-4`; container `rounded-lg border border-line-soft bg-surface divide-y divide-line-soft`. Header row `grid grid-cols-[2.5rem_1fr_1fr_5rem] px-3 py-2 text-caption text-muted` with labels "Set | kg | Reps | " (sentence case). Every row: `grid grid-cols-[2.5rem_1fr_1fr_5rem] items-center min-h-11 px-3 text-body tabular-nums`; set # `text-muted`, kg/reps `text-strong`, state cell `text-caption text-right`. Auto-scroll current row into view (`scrollIntoView({block:"center"})`).
States, none colour-only:
- Logged: values `text-ink`, state cell "✓" + `bg-surface` (flat), tap to edit. Sets-logged weight differing from prescription gets no extra mark.
- Current: `bg-surface-2 border-l-2 border-bronze font-semibold`, values `text-strong`, set # shown as "▸ 3" (glyph + position); kg/reps are the editable inputs (`border-b border-dashed border-line-strong` as StepperRow input). State cell "Now".
- Pending: `text-muted` values showing prescribed numbers, state cell empty (dot "·" is gone).
- Optional: pending style + `border-dashed` bottom edge replaced by label "Optional" in state cell, set # in parentheses "(5)".
- Missed: reps cell "Missed" (word, `text-strong`), kg kept, row `line-through` on reps is NOT used; state cell "✕". Never red; this is data, not danger.
- Rep PR: state cell "PR" `text-ground bg-green rounded-md px-1.5` (existing), plus word.
Weight anchor: below the table, above Done, one line `flex items-baseline justify-center gap-1.5`: `text-metric font-semibold text-strong tabular-nums` kg + `text-h2 text-muted` "× 5", with − / + steppers flanking (`w-[58px] h-[52px]` existing). Last time: `text-small text-muted` line under it: "Last time 101 × 5 · set 3 of 5" (add set index context). Plates line `text-caption text-muted`. Done = existing `Button size="lg" block`; secondary row: `flex gap-2 mt-2` with two `h-11 flex-1 rounded-lg border border-line-strong bg-surface-2 text-ink text-small` buttons (Change weight, Missed). Watch demo: same secondary style with figure at left in the top region, `h-12 w-[68px]` (same crop as Brief row).

## Top 5 fixes
1. Replace pips with the set table; kills 15+ collision and gives state without colour.
2. Anchor weight at metric size above Done; delete the 92px floating hero and the empty centre.
3. Bronze = CTA (+ current-row rule) only; drop Brief eyebrow/Main/active-tab bronze.
4. Strip all `tracking-[.1-.18em]` and most uppercase; one eyebrow style, sentence-case labels.
5. Fix "Top set" label logic (SetView.tsx:519) for padded/added rows and give secondary buttons real borders (`h-11`, :674/:884).
