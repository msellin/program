# Lane A r4: matfall, cartwheel, crowroll (2026-10-30)

Measured through drawFigure every 33 ms (new-r2/jumps.mjs). Rendered and read the sheet + thumbs.

- wallExit (shared by matfall, cartwheel): the 0 -> 90 turn is a flatter ease (LIN: matfall 70% linear, cartwheel 40%);
  after the first foot contact the rig runs at 0.85x (landing and stand-up ~18% longer); stand-up window .22 -> .25;
  second-foot swing mix 70% linear.
- matfall: free-leg swing 70 -> 58 deg, turn span p .12-.48 (was .45), tip span .48-.67 (still quicker than cartwheel .58-.82).
  Max jump 7.4 -> 5.9 px (stand-up, 4719 ms; the 1.25 s swing is now below that).
- cartwheel: max jump 6.2 -> 5.5 px (now at 1452 ms, far-leg swing; stand-up below it). First foot ~65 px from hand A (was 63).
- crowroll: hand ease 40% linear, leg kf 20% linear. Max jump 5.0 -> 4.3 px. Scale 1.1 -> 1.26 (+15%); the cycle
  still fits the tile and the 56x40 thumb (rendered, figure visibly larger).
Tests: vitest src/lib/figures 93/93, typegen + tsc clean.
