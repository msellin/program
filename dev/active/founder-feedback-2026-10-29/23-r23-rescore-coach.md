# R23 rescore, coach lens (set screens)

Scores (1-10): set-sled 7.5, set-nordic 8, set-bulgarian 6.5, hip-brief 7. (R2 baseline: no "0 kg" fix existed; the 0 kg problem is gone.)

What landed: sled shows `20 m · — kg`, no fake 0; Nordic is reps only with a matching Done label; guided figure loops are in; the set-chip row and the Done label read clearly.

- [H] Bulgarian split squat (dumbbells) shows "Bodyweight × 6" on set 1. The exercise is named for a dumbbell load, so the lifter reads it as "no weight needed". Show the DB load per hand (prefill last, else "— kg per hand") and keep "Bodyweight" only for the unloaded exercises (split_squat_rfe, single_leg_rdl) → `SetView.tsx` load_optional label; give bulgarian_split_squat_db `logging: load_reps`.
- [H] Done label drops the load on weighted sets (`Done · set 1 · 6 reps`, sled `20 m` without the kg). Once a load exists it belongs in the label (`Done · set 1 · 20 m · 40 kg`) so the log is confirmed at the tap → `SetView.tsx` done-label builder.
- [H] Hip-brief rows lose the prescription: sled shows "6 sets" with no distance, though `default.distance_m` is 20. Show `6 × 20 m` → `DaySession.tsx` row subtitle, same source as the set screen.
- [M] Blank-load sled button says "Change load"; with nothing set it should say "Add load" (same rule as "Add weight"), plus a one-line helper "Load depends on your sled". → `SetView.tsx`.
- [M] Nordic has no variant chip (Full / Band-assisted / Slider). The title offers the regressions but the log can't record which one was done, so the real progression signal is lost. → `SetView.tsx` variant row for `bodyweight_reps` exercises with variants.
- [L] The signal banner, "Why these weights" and the rows are fine; the front squat "3/6" progress badge has no label, and the sled and Nordic rows show no completion state.
