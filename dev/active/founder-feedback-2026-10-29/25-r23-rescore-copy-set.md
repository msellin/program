# R23 rescore, COPY lens, set screens

Scores: set-sled 7, set-nordic 7.5, set-bulgarian 7, hip-brief 7. Round-2 fixes landed: no "0 kg", " · " in Done, "Change load/reps" by kind.

- [H] Nordic title still "Nordic curl (or GHR, or slider leg curl)" (set-nordic, hip-brief card wraps to 2 lines) -> title "Nordic curl", quiet line "Or: GHR, slider leg curl"; add `alternatives` to exercises.json.
- [H] Sled shows "— kg" under "20 m": reads as a missing field -> "Light to moderate, then add" (round-2 spec) until a load is logged.
- [H] Bulgarian: "Bodyweight × 6" is the big line, so the rep count is demoted and "× 6" wraps alone -> big "6 reps", small "Bodyweight" (same as Nordic). Title "…, dumbbells" contradicts "Bodyweight"; drop ", dumbbells" or use "Add dumbbells" as the button.
- [M] Sled Plan line "Plan: 6 sets" omits the distance; "Plan: 6 × 20 m" is clearer.
- [M] hip-brief: "Signal: stiff/sore. Consider trimming 5% from the top set." has no Accept/Ignore and no "why"; the confirm-first promise is not visible here -> add "Why?" link or the log signal name.
- [L] "Continue — set 4" still uses a long dash; use "Continue · set 4".
