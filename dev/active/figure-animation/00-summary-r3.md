# Figure round: status after rescore 3 (2026-10-29, live 5a72c64)

Owner bar: every MOVEMENT score ≥ 9 (trainers, physicist, biomechanist).

| Lens | ≥ 9 | Under 9 |
|---|---|---|
| Biomechanist (75) | 60/60 | — |
| Physics (74) | 60/60 | — |
| S&C (70) | 13/13 | — |
| Calisthenics (72) | 17/17 | — |
| Physio (71) | 14/15 | bridge 8: start hip 137 (geometry cap; physio recommends the owner accepts it) |
| Hand-balance (73) | 12/15 | hswalk 8 [H], wallwall 8 [H], fingerraise 8 [L] → handstand lane, round 3 pass 3 |
| Illustrator (77) | 47/60 | 13 at 7-8, all drawing-only (nordic/kickup key frames, splitsquat clutter, pull thumbs) |
| Animator (76) | 2/60, mean 7.8 | phase beats; ceiling of a flat rig |

Rejected again: animator's "deadlift hips lead the shoulders on the ascent" (the "hips shoot up" fault; S&C +
biomechanist: hips and shoulders rise together until the bar passes the knees).
The nordic "tile reads lying down" partly a review-sheet artifact (the sheet's tile column samples 4240 ms; the
app's tile animates).

## Final (after round 3 pass 3, live 3ab1cca)
Movement lenses ≥ 9 on 58/60 figures for every lens. The two exceptions are caps the reviewers name, not defects:
- bridge (physio 8): start hip 137; a flatter start breaks the knee rule. Physio recommends accepting it.
- fingerraise (hand-balance 8): the finger lift is < 2 px at thumbnail size; the coach accepts 8 as a scale cap.
Visual lenses (optional polish): illustrator 47/60 ≥ 9 (13 drawing-only items in 77), animator mean 7.8 (phase
beats; flat-rig ceiling). Strips were re-rendered to span whole cycles (they had covered only the first 2 s).

## Visual polish (owner: "also polish visuals", live 30090f9)
Still thumbnails are framed to their poster pose (`figureBounds(id, side, "poster")` for still figures under
64 px); filled kettlebell; end-on dumbbell plate on the split squat. Illustrator: 47 → 56/60 at ≥ 9. The four at 8
are drawing limits: pullup / pullup_single / pullup_slow are one movement at different tempos (a still can't show
tempo; the glyph carries it), and the wall-handstand shrug's 13-unit rise is below thumbnail resolution.
Owner accepted the bridge (start hip 137) and finger-raise (scale) caps. Figure round closed.
