# Round 2, COPY lens

Principle: the big number is what the lifter does, not a field the app needs. "0 kg" is a data-model leak; on a bodyweight move it reads as a bug or a missing weight. Show only what exists.

**Mechanism (smallest correct):** one `logging` field per exercise in `exercises.json`: `load_reps` (default) | `bodyweight_reps` | `added_load_reps` | `distance_load` | `time`. Not scheme-text parsing: "6 × 20 m heavy" and "3×5 eccentric" are free prose and break on the next author. Category stays for the engine; `logging` drives only the set screen. Default keeps every unmarked exercise as today. A test requires `logging` on every `strength`/`unilateral` exercise, so the set player cannot silently guess kg again.

**Big number + unit + Done, by kind**
- bodyweight_reps (Nordic, pull-up, single-leg bridge): big "5 reps", small "Bodyweight". Done: "Done: set 1". No kg and no "Change weight". Secondary "Change reps".
- added_load_reps (dip, pull-up when loaded): big "5 reps", small "Bodyweight" or "+10 kg". Done: "Done: set 1 · +10 kg". Secondary "Add weight" (becomes "Change weight" once set). Never print "+0 kg".
- load_reps (squat): unchanged, "60 kg × 5". The 0 case (no max, no log) shows "Pick a weight" with the field open, not "0 kg × 5".
- distance_load (sled, carries): big "20 m", small "60 kg". Done: "Done: set 1 · 20 m · 60 kg". Secondary "Change load". Sets by distance, so "× 1" disappears. Distance parsed once at author time into `prescription.distance_m`, not from text.
- time (planks, holds): big "30 s", Done "Done: set 1 · 30 s", secondary "Change time".
Use the existing separator " · "; stop using the long dash in Done labels ("Done — set 1").

**Labels:** secondary button names what changes: "Change weight" only when a weight exists; else "Change reps" (already exists at SetView.tsx:1056, extend by kind). "Hide" is fine.

**Title:** "Nordic curl (or GHR, or slider leg curl)" puts the alternatives in the name. Make the title "Nordic curl" and move the options to a quiet line below: "Or: GHR, slider leg curl". Same for any "(or ...)" title; add an `alternatives` array, not parenthetical names.

**Sled with no weight:** with no log, show "Light to moderate, then add" rather than 0; the first logged set becomes the suggestion (engine proposes, user confirms).

**Guided figure before Start:** loop it. A still figure on a "Watch demo" tile looks broken, and the demo is the point of the tile. Keep the ring/timer idle until Start.

**Votes**
A. Guided figure loops before Start: CHANGE.
B. Sled distance + load ("20 m · 60 kg"): BUILD (`logging: distance_load` + `distance_m`).
C. Nordic bodyweight copy ("5 reps · Bodyweight", no kg): BUILD (`bodyweight_reps`).
Change weight label by kind: CHANGE.
Title "(or GHR...)": CHANGE (alternatives line).
Dash in Done label: CHANGE (" · ").
Scheme-text parsing: KEEP OUT.

**Top 2:** 1) `logging` kind in `exercises.json` with the integrity test. 2) Set-screen copy driven by that kind (no "0 kg" ever).
