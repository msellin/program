# Custom track pass: agreed layout (2026-10-28)

Synthesised from `review-design-lead.md`, `review-mobile-ux.md`, `review-visual-craft.md`, `review-copy.md`,
`review-strength-coach.md`. Baseline scores (1–10):

| Lens | Brief | Player |
|---|---|---|
| Design lead | 5.5 | 4.5 |
| Mobile UX | 6.5 | 4.5 |
| Visual craft | 6.0 | 5.5 |
| Copy | 6.0 | 6.5 |
| Strength coach | 6.5 | 6.0 |
| **Mean** | **6.1** | **5.4** |

Where the lenses disagreed, the call and why:
- **Set list**: always-on row table (visual, coach, mobile) over the design lead's collapsible strip. A strip hides
  the thing the founder asked for; capping the table at 3 visible rows (4 at ≥ 760 px tall) and scrolling it
  internally keeps the height constant at any set count, which was the design lead's reason for the strip.
- **Main lift on the brief**: the compact ladder (coach, copy) over "8 sets · up to 102.5 kg" (design lead). A lifter
  loads the bar from this line; the founder's complaint was the duplicate, not the ladder.
- **Demo**: a single row under the table, figure thumbnail + "Watch demo"; the clip opens in a bottom sheet so Done
  never moves (design lead). The tap that opens the sheet is the tap that loads YouTube — nothing before it.

## Brief
```
ANTERIOR HIP REBUILD
Wednesday
4 exercises · about 60 min · week 3 of 8
┌ [fig] Block pull, mid-shin height ─────────┐
│ 77.5×5, 90×5, 102.5×5+, then 5×77.5 kg     │
├ [fig] Barbell hip thrust ──────────────────┤
│ 4×8 · last 60 kg   (no history: 4×8 · pick a weight)
├ [fig] Single-leg Romanian deadlift ────────┤
│ 3×8 each side · last 16 kg                 │
├ [fig] Hollow hold ─────────────────────────┤
│ 3×20 s hold                                │
How to run this ›     Log an extra session ›
[ Start session ]   (in progress: [Finish] [Continue — set 4])
```
- One helper builds the line for both brief and player (`lib/prescription-line.ts`).
- "Today's top set" card deleted. Phase name dropped from the subtitle; week N of M kept.
- "Main" tag goes (bronze economy); "Done"/"Held" tags stay, muted.

## Player (every set kind shares one frame)
```
[‹] [Block pull, mid-shin height  ] [Something hurt] [⋯]     44 px
    [Exercise 1 of 4 ▾            ]
┌ Set 3 of 8                              16 sets left ┐  table header
│ 2   90 kg     5        ✓                             │  44 px rows,
│▌3   102.5 kg  5+       Now                           │  3 visible,
│ 4   77.5 kg   5                                      │  scrolls
└──────────────────────────────────────────────────────┘
[fig] ▶ Watch demo                                       only if figure or clip
            (flex space)
TOP SET                         ← role: Set / Top set / Back-off / Extra set / Editing set N
102.5 kg × 5+                   ← 64 px numeral under 700 px tall, 80 px above
Per side 25 + 15 + 1.25 kg
Last top set · Mon · 101 × 5    ← same-weight match, top set ↔ last top set, else nothing
[ Done — set 3 · 102.5 kg ]  or the AMRAP rep grid (5 columns × 2 rows)
[ Change weight ] [ Missed 102.5 kg ]   44 px, bordered
```
- Exercise switcher replaces the rail: one button, opens a sheet listing every exercise with n/m.
- Table rows keep the pip accessible names ("Set 3, logged 90 kilos by 5 reps. Edit.") — harness walks them.
- Safe-area insets on the top bar and bottom cluster.
- Hold/timed: same frame, the clock is the hero, the Start/Done button sits where Done is.

## Clips
`demo-clips-strength.md`: block pull 103–114 s (APPROVED, ±5 s storyboard → trimmed inward), single-leg RDL 374–384 s
(CLOSE-VARIANT), hip thrust none — its linked video is a podcast with no hip thrust in it (follow-up: replace the link).
