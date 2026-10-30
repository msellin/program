# Lane B r4: fingertaps, threadneedle (2026-10-30)
Measured through drawFigure every 33 ms (jumps.mjs); sheet rendered and read. vitest figures 93/93, typegen + tsc clean.

- fingertaps: set-down 0.17 -> 0.22 s (c .56-1.0). Rise now 0.15 s and near-linear (85% linear / 15% ease) so the faster rise does
  not become the new peak (a pure ease rise at 0.15 s gave 6.7 px). Dwell at the top is 0.13 s (was 0.15): the 0.5 s tap cannot hold
  0.15 + 0.15 + 0.22 s. Max jump 6.1 -> 4.8 px (rise, 99 ms); set-down peak 3.8-4.6 px.
- threadneedle: head [26,-6] -> [23,-6] (shoulder-to-head gap 27 -> 23 px); wrist rest S0+[5,-1] (was [6,-3]), W0 offset from head
  [-18,5]. Wrist to head centre 18.7 px at 0 ms and at 5400 ms (needs >= 18). Elbow interpolation and seam kept (0 and 5400 poses
  identical). Max jump 4.9 -> 5.9 px (4752 ms, elbow/forearm). Hip-rehab limits untouched (hand, knee, hip planted).
