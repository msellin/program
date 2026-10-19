# Follow-along player — plan (2026-10-19)

Founder request: the accessory/mobility work is unmotivating as plain text; wants a guided,
visual, GOWOD-style player with a timer or rep count, plus the home block visible on Today
instead of the Extras tab. Founder authorised: panel review → implement → push to the app.

## Frozen design (from the canvas, "D · Refined A")
Canvas: https://claude.ai/artifact/XbhjixsNZ3oMoACuzLWSf6 (boards D and "All 9 illustrations").

- One exercise per screen. Top bar: End (×), progress bar, **This hurts** (always reachable).
- Media slot 358×201 (16:9): animated SVG illustration; **Full tutorial ↗** opens the existing video.
- Fixed-size side chip (LEFT / RIGHT / BOTH / EACH SIDE), `Set n/m · step x/y`.
- Name and cue: each reserves 2 lines, so the layout never jumps between steps.
- Ring 176px, 64px tabular digits, one short caption word. For reps the ring is the rep counter.
- Aux row (44px, always present): −1 / Log all N (reps), +15 s (rest), or the "Next: …" line.
- Controls: Back · primary (Start → Pause/Resume, Set done, Skip rest) · Skip set.
- Behaviour:
  - nothing auto-starts; Start → a 3-2-1 → work;
  - timers run off wall-clock time;
  - rest length is per exercise;
  - Skip never logs;
  - the done screen counts real sets per side;
  - "This hurts" ends the session and routes to the symptom log;
  - polite `announce()` only on transitions.
- Steps: per-side sets interleave L/R, then the extra left sets (`extra_set_side`).

## Illustrations
- `dev/active/exercise-media/figures-prototype.js` is the reviewed rig: 9 figures, jointed, with
  L/R badges, near/far layering, and a reduced-motion ghost. It's ported to TS as
  `lib/figures/` with tests.
- Panel (coach, visual, motion, a11y) must approve before implementation. At most two fix rounds.

## Home block on Today
- `block_a_home` (and overhead-mobility daily blocks) render on Today as a normal block card with
  a "Follow along" Start, for the founder's programs. Extras keeps working.

## Phases
1. Panel review + fixes (figures).
2. Port the rig to TS (`lib/figures`), with unit tests: lengths are constant, the badge sides, layering.
3. Step builder (`lib/follow-along/steps.ts`), with tests: interleave, the extra-left sets, holds vs reps.
4. FollowAlong screen component plus logging through the existing set writer; Skip never logs.
5. Today: the home block as a block card with an entry point.
6. `npm run verify`, browser check at 393px, master task list + dev docs, commit, push (CI deploys).

## Risks
- The logging shape must match manual logging exactly, or history and the engine break.
- iOS backgrounding: use wall-clock timers.
- The 30 fps SVG re-render cost: use the technique the motion panel picks.
- Showing extra blocks on Today must not change the strength-day logic or proposals.
