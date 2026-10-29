# Animator check, motion round (2026-10-29)
Method: read git diff of rig.ts, strips squat and sled viewed, remaining figures checked by tracing the maths (joint continuity at stance/swing, trunk angle solves, phase of the weight shift).

- Squat / front / air / goblet: SHIP. Hip lead plus straight shoulder line reads as a real hinge-then-sink; control down / drive up has no drop and no bottom bounce; trunk angle is monotone, no pop.
- Deadlift: SHIP. Bar stays vertical over the foot (S.x holds about 180 to 172), hips and shoulders rise within a few percent of each other, so the hips-shoot-up fault is not present; the sticking point lands at the knee pass.
- Sled: SHIP, one nit (rig.ts:830, stride()). Stance is a constant-speed slide, swing starts and ends with ease() at zero velocity, so the foot visibly stops at toe-off and touchdown (a kink about 1 px per frame). No sliding during stance, both-down overlap of 20% is right. Optional fix: velocity-matched swing curve (start and end speed equal to the stance speed).
- Farmer / suitcase: SHIP. Weight shift goes over the standing foot (right swing at phi .8, shift toward the left foot), the rise at mid stance is correct, stance feet never move in front view, loop seam is clean (cos terms are whole cycles).
- Handstand walk: SHIP, same toe-off ease nit as the sled (rig.ts:610). Lean over the planted hand is the right cause for the step.
- Holds (breathing): SHIP. Starts at zero after the 0.9 s ease so no pop. Width change is only about 0.8 px at the card size, so it is subtle: it reads as life, not as breathing. Do not raise above 8 percent.
- Bridge / hip thrust / split squat / RDL / nordic tempos: SHIP, unseen in strips, only reasoned.

Score now: 7.5 / 10 (was 5.5). The remaining 2.5 is foot-stop at the gait transitions, no arm swing in the gaits, and the limits of a stick rig, not defects.
