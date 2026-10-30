# Lane A r3: matfall, cartwheel, crowroll (2026-10-30)

Measured through drawFigure every 33 ms (scripts in new-r2/: jumps, seg, who, foot, trace). Rendered and read the sheet + thumbs.

- cartwheel: knees bend from psi 15 (bend .40, was .78), swing 96, wheel T .12/.58/.82. First foot lands 63 px from hand A
  (was ~87; target 55-65). Final stance 52 px (was 44, +8). 2 px lateral hip drift sin(pi p). Hand-B lift stretched .14 -> .18.
  Max jump 6.2 px (was 7.4); 1.0-1.5 s window 6.0 px. Straddle V and difference from matfall kept (matfall bend .45, swing 70).
- matfall: 90 -> 180 span p .45-.66 (was .62), accelerating (t^1.6) tip, soft settle via the foot-contact hold;
  poster p .36 (one leg still in the air, mat visible in the thumb). Swing 80 -> 70. Max jump 7.4 px (was 7.8). Misses the
  <= 6 aim: it is the free-leg swing in the 0 -> 90 turn at ~1.25 s; not chased further.
- both: second-foot swing ease is a flatter mix (half linear).
- crowroll: roll-over leg p .5 -> .84 (was .74), knee settle .84 -> .92, hand ease .42 wide; max jump 5.0 px (was 6.7).
  Poster p .08 -> .42 (hips over shoulders, rolling; reads at 56x40).
- Not done: mat line thickness (left at current; shared box stroke).
Tests: vitest src/lib/figures 93/93, typegen + tsc clean.
