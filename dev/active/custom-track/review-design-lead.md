# Custom track review: design lead (2026-10-28)

Evidence: shots/before/375x667 01-04 read; 393x852 not re-read (same structure, more air). Scores 1-10, 10 best.

## Scores
- Brief: **5.5**. Clear hierarchy and a real Start button, but main lift is shown twice, detail is uneven (figure+full line vs "4 sets"), jargon subtitle, sticky Start covers the duplicate card.
- Player: **4.5**. Big weight + Done is right. Everything above it is broken: crushed tab row, truncated caption without "set N of M", 20px pips at 20 sets, a grid that pushes Last time/Prescribed to empty boxes (03: both boxes blank), nav-bar "N" badge overlaps "Change the weight" text, no figure.

## Core calls
1. Set table = **inline collapsible under the caption, collapsed by default to a one-line strip; expands in place** (not a sheet). A sheet hides the weight you are about to lift and costs a tap + dismiss mid-set; an always-on table eats 150+ px at 15 sets on a 667 screen. Strip = "Set 3 of 8 · 2 done" with a chevron; tap expands a row table (Set | Target | Done) that scrolls internally, max-height 40% viewport, current row sticky-highlighted and auto-scrolled into view. Collapses again on Done (no state to manage).
2. Top bar becomes **one row, 3 items**: back chevron (44), centre exercise switcher "Block pull, mid-shin height  2 of 4 v" (tap opens the 4-item list as a sheet; swipe not required), right "Something hurt" (kept as labelled button, 44 high) and ⋯. Tabs are removed: 4 exercises with 20-char names can never fit, and per-exercise progress lives in the sheet ("0/4", "2/8"). Name wraps to 2 lines rather than truncating; "2 of 4" never wraps off.
3. Caption row below the bar is dead: its content moves into the strip ("Set 3 of 8"). Exercise name appears once (switcher).
4. Weight stays the hero, directly above Done. Order top to bottom: bar, strip, figure+Watch demo (compact), weight, reps, context line, Done, secondary buttons. Figure is a 72px thumbnail to the left of the weight-unit block? No: rejected (steals width from a 5-digit hero). Figure = **64px thumbnail + "Watch demo" text button on one 64px row** between strip and weight; tap loads the clip inline (tap-to-load) as a bottom sheet so Done stays put. Exercises without a figure render no row (no placeholder; the 12 missing do not leave a hole).
5. Last time + Prescribed: **one line, not two boxes**: "Last time 12 Oct · 101 × 5" and (only if differs from the hero) "Plan 77.5 × 5". Boxes go (they blank out and cost 70px).
6. Secondary actions: two real 44px outlined buttons side by side under Done: "Change weight" and "Missed". Raise the bottom padding so the nav badge never overlaps (safe-area + 56px nav).
7. Confirm-first / hurt: unchanged semantics; "Something hurt" stays top-right one tap. Logging a set writes only on Done/rep tap, with the existing undo.

## Mockups (375px)

### Brief (set-flow day)
```
ANTERIOR HIP REBUILD
Wednesday
4 exercises · about 60 min · Strength day
THE WHOLE SESSION
+-----------------------------------+
| [fig] Block pull, mid-shin    MAIN|
|       5 sets · 5, 5, 5+ reps      |
|       77.5 to 132.5 kg            |
+-----------------------------------+
| [fig] Barbell hip thrust          |
|       4 sets · 8 reps · 60 kg     |
+-----------------------------------+
| [fig] Single-leg RDL              |
|       3 sets · 8 reps · 20 kg     |
+-----------------------------------+
| [fig] Hollow hold                 |
|       3 sets · 30 s               |
+-----------------------------------+
(scroll space = sticky bar + nav)
[  Start session                  ]
```
Every row: figure slot (placeholder-free: if absent, row is just text, left-aligned identically), name, ONE line "N sets · reps · load". Main lift gets only the MAIN tag. Ramp (77.5 / 90 / 102.5...) shown only in the player. Done: drop duplicate top-set card.

### Player, fixed reps (set 1 of 8)
```
[<]  Block pull, mid-shin  2 of 4 v  [Something hurt][...]
Set 1 of 8 · 0 done                    v
[fig] Watch demo
         77.5 kg            <- hero
         5 reps
 Last time 12 Oct · 101 x 5
 25 + 2.5 + 1.25 kg /side
[ Done - set 1 . 77.5 kg ]
[ Change weight ] [ Missed ]
```
Fits 667 with ~60px spare.

### Player, AMRAP set
Same frame. Hero "102.5 kg / 5+ reps". Rep grid replaces the Done button position (it IS the Done): 2 rows of 5 (1-5 / 6-9, 10+) at 52px, not 3 rows at 70px; kept inside the Done zone so Change weight/Missed stay on screen. "Rep PR" chip sits in the strip row, right-aligned, not on its own line.
```
Set 3 of 8 · 2 done          [REP PR]  v
 102.5 kg   5+ reps
 Reps you got:
 [1][2][3][4][5]
 [6][7][8][9][10+]
[ Change weight ] [ Missed ]
```

### Player, 15+ sets (strip expanded shown)
```
[<] Block pull, mid-shin  2 of 4 v [Hurt][...]
Set 3 of 20 · 2 done                   ^
+ Set  Target     Done              +
| 1    77.5 x 5   77.5 x 5   ok     |
| 2    90 x 5     90 x 5     ok     |
| 3 >  102.5 x 5+  .                |  (scrolls)
| 4    ...                          |
+-----------------------------------+
(hero + Done pushed down: expanded state is an overview, auto-collapses after 4s idle or on Done; Done stays sticky above nav)
```
Collapsed state is identical to the 8-set screen: no pips at all at any set count. This is the scaling answer: the strip is constant-size.

### Hold / timed set (hollow hold, 30 s)
```
[<] Hollow hold  4 of 4 v  [Hurt][...]
Set 1 of 3 · 0 done                    v
[fig] Watch demo
        30 s              <- hero
 Last time 12 Oct · 25 s
        [  00:00  ring-free big timer  ]
[ Start hold ]  -> becomes [ Done - 30 s ]
[ Change time ] [ Skipped ]
```
Same slots; hero shows target time, timer replaces nothing (it is the Done button's pre-state). No weight line when bodyweight.

## File:line changes
- `BriefView.tsx:354-435` rows: single `PrescriptionLine` helper for all exercises (sets, reps, load); figure slot optional; remove ramp text.
- `BriefView.tsx:437-499` delete "Today's top set" card (the ramp belongs to the player).
- `BriefView.tsx` subtitle: plain "Strength day" replaces "Cycles 3 + 4 (with 1RM test)"; ~525 Start label "Start session"; add bottom padding = bar height so nothing is cut.
- `SetView.tsx:354-423` top bar: remove tabs, add switcher + sheet (reuse OverflowSheet pattern), keep Something hurt/⋯ at 44px.
- `SetView.tsx:428-436` caption: delete; content moves into the strip.
- `SetView.tsx:443-512` pips: replace with `SetStrip` (collapsed line) + `SetTable` (expanded). No pips.
- `SetView.tsx:515-606`: add figure/demo row above weight; replace Last time/Prescribed boxes with one context line (date from last log); AMRAP grid to 5+5 columns.
- `SetView.tsx:608-897`: Change weight / Missed become side-by-side bordered 44px buttons; add padding-bottom for nav badge.

## Not solved here
Figures for 12 exercises (coach review; respect provocative positions); desktop layout (centre column max-w 480 is enough); copy strings -> copy agent; type ramp -> visual-craft.
