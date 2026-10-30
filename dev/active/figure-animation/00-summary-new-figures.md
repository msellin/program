# New figures for drills reachable through drill_library (2026-10-30)

Founder: thread-the-needle reached Today with no figure; "draw those" for the ad path; "all animated figures should
follow the latest improved version". `rig.test.ts` now fails on any reachable drill with no figure that is not on
the named `FIGURE_BACKLOG`.

**Drawn (11):** threadneedle (om_quadruped_thoracic_rotation), arch (pu_arch_hold, hs_arch_hold), dbrow, pulldown,
fingertaps, hollowrock, elbowstand, crowroll, matfall (rebuilt as a front-view side exit onto a mat after the
hand-balance [B]: the first draft bailed backward into a back-bend), cartwheel. **Reused:** pu_isometric_chin_over_bar
→ pullup_top, pu_farmers_carry → farmer. **No figure by design:** the three video-review drills.

Process: two Sonnet drawing lanes → five lenses (62 hand-balance, 63 calisthenics, 64 physics, 65 animator,
66 illustrator) → two fix lanes → rescore.

| Figure | Hand-bal / Calis | Physics | Animator | Illustrator |
|---|---|---|---|---|
| threadneedle | (physio 8, file 60) | 9 | 8 | 8 |
| arch / dbrow / pulldown | 9 / 9 / 9 | 9 / 9 / 9 | 8 / 8 / 7 | 8 / 9 / 8 |
| fingertaps / hollowrock / elbowstand | 8 / 8 / 9 | 9 / 9 / 9 | 6* / 6* / 7 | 8 / 8 / 7 |
| crowroll / matfall / cartwheel | 8 / 8 / 8 | 9 / 8† / 8† | 8 / 7 / 7 | 8 / 7 / 7 |

\* The animator could not see the motion on the sheet (it samples the zero crossings). Measured: fingertaps peel
7.6 px, hollowrock up to 48 px vertex travel, so the animator's own condition for ~8 is met.
† The physics [H] "planted hands drift" was checked in the slot output: hand A sits at (166,168) until its release
at ~p 0.45 and hand B lifts at p 0.12 by design; the measured "creep" is the planned release swing. Not a defect.

No [B] remains. Open [M]/[H-visual]: matfall and cartwheel share a start pose, so their single-moment tiles look
alike (in the app the tile animates); mat wider and nearer the landing foot; hollowrock trunk has no rib-down curve
(two-point trunk); elbowstand forearm reads as a leg; 56x40 thumbs of the front-view figures are small.

## Round 2-4: "improve until all score 10" (2026-10-30)

Four lane rounds (`80`-`87-lane-new-*.md`) and three rescores by six lenses (`90`-`95-new-r2/r3/r4-*.md`; briefs
`BRIEF-LANES-NEW-R2..R4.md`, `BRIEF-RESCORE-NEW-R2..R4.md`). First fix was the review tool: the sheet sampled gaits
on their zero crossings, which is why earlier lenses could not see the rock or the taps; gaits now sample the
quarters, the tile shows the poster, and `FRAMES=N` renders an even N-frame strip. Every lens claim was measured
before acting (`new-r2/jumps.mjs`; figures outside the 11 verified byte-identical to pre-round main).

Final scores (r4; C = ceiling the reviewer named, with its reason in the lens file):

| Figure | Trainer | Physics | Animator | Illustrator |
|---|---|---|---|---|
| threadneedle | physio 9 C (side view cannot draw rib rotation) | 10 | 9 C (arm crosses trunk) | 9 C (fixed rehab pose, thumb) |
| hipflex | physio 10 | 10 | 9 C (isometric rehab hold) | 9 C (fixed seated pose) |
| arch | calis 10 | 10 | 9 C (thumb scale) | 9 C (prone figure in 1.4:1 thumb) |
| dbrow | calis 9 C (flat back + plumb bench arm impossible with real arm:thigh) | 10 | 10 | 9 C (dumbbell ~3 px at 56x40) |
| pulldown | calis 10 | 10 | 10 | 9 C (figure ~10 px at 56x40) |
| fingertaps | hand-bal 9 C (finger peel at 56x40) | 10 | 9 C (same) | 9 C (same) |
| hollowrock | hand-bal 10 | 10 | 10 | 9 C (prone pose in thumb) |
| elbowstand | hand-bal 9 C (side view shows straddle as pike) | 10 | 10 | 8 (see open) |
| crowroll | hand-bal 10 | 10 | 10 | 9 C (tuck ~15 px at 56x40) |
| matfall | hand-bal 9 C (rounded landing needs depth) | 10 | 10 | 9 C (front view narrow in thumb) |
| cartwheel | hand-bal 9 C (front view, no depth for hands past hips) | 10 | 9 (open) | 9 C (~12 px wide in thumb) |

Physics 11/11 at 10. 13 trainer/animator 10s. No [H] in any lens; every jump <= 5.9 px/33 ms (was up to 7.8).

Still open (not ceilings), for the owner:
- **elbowstand, illustrator 8:** head ball the same grey as the hip at 56x40 -> 1 px darker head outline. Not done:
  the outline comes from the one shared `shapeEdge` rule for every figure. Hand-balance 9 also names a route: a
  front-view variant would show the straddle (and lose the L). Owner's call.
- **cartwheel, animator 9:** wants the turn peak <= 5.2 px (now 5.4 at 1419 ms). A longer turn moved the peak to the
  stand-up (5.7) and was reverted; needs the stand-up and swing eased together.
- The illustrator's 9s are almost all 56x40 thumb-size limits; a larger thumb in the brief is a product change.

**Backlog left (33):** overhead-mobility 8 (wall slides, prone Y, KB arm bar, half-kneeling dowel press,
bottom-up KB press, empty-bar OHS, snatch-grip Sotts, TGU hold), muscle-up 17, engine aerobic sessions 8.
