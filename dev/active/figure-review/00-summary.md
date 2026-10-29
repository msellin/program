# Figure review — 2026-10-28

The first panel (2026-10-19) reviewed 9 of the then-36 figures. This pass reviewed **all 36**, fixed what the
panel flagged, and added **14 figures** for `anterior-hip-rebuild` (it had none for 14 of its exercises; the brief
listed 11, and the script also found `glute_bridge`, `a_march` and `leg_swing_controlled`). Every hip figure
was coach-reviewed before shipping. Scores are 1–10 (10 = best).

| report | lens | before |
|---|---|---|
| [01-coach.md](01-coach.md) | positions, range, props, variants | 12 PASS / 24 FIX, avg 5.8 |
| [02-motion.md](02-motion.md) | easing, holds, loop timing, limb integrity | 19 PASS / 17 FIX, avg 6.3 |
| [03-visual.md](03-visual.md) | silhouette at 56x40 and 144px, stroke, contrast | 5 PASS / 31 FIX, avg 4.2 (thumb) / 6.1 (tile) |
| [04-coach-new-figures.md](04-coach-new-figures.md) | the 14 hip-rebuild figures | 10 PASS / 4 FIX (all applied), 0 safety issues |

No existing figure taught a provocative position (`data/clinical-context.json`).

## What changed (all in `next-app/src/lib/figures/` + `ExerciseFigure.tsx`)

**Cross-cutting (all three lenses agreed):**
- **Fitted frame.** `figureBounds` fits the viewBox to the figure's whole cycle (floor, bar and wall are
  excluded and run past the edge). Before, the fixed 358x201 box left a standing figure about 26px tall in a
  brief thumbnail and 46% of the Today tile.
- **Strokes in screen px for the size drawn** (`strokePx`, `vector-effect: non-scaling-stroke`, measured with
  a ResizeObserver). A limb is 2.75px in a thumbnail, 5px on the tile and ~8px in the player. The working limb is
  1.25x heavier. Below 64px the L/R badges are hidden.
- **Poster pose for still figures.** Brief thumbnails and QuickStart show the drill's defining frame (chin over
  the bar, squat bottom, ring row chest-to-rings), not the rest pose. Before, all 9 pull-up variants were the
  same dead hang.
- **4-key timing** `k=[rest, end, hold, return]`: up ~1.3 s / down ~2.3 s / ~1 s bottom pause. Squats were
  inverted (down faster than up). A negative now RESETS to the top in one cut; before, its return looked like a
  fast pull-up. Hold entry is cosine (no first-frame jolt). In reduced motion the poster is shown solid and the
  other extreme as an outline.
- **Palette** ≥3:1 on the card AND on the tile tint (#2a231f). PROP and FLOOR failed on the tile before. The
  body went from #9aa0a8 to #c9ced6. Equipment is drawn as an outline (boxes on a dark fill; plates, balls and
  bells as rings), so a bar end no longer reads as a second head.

**Per-figure fixes (coach):**
- **Pull-ups:** shoulders now sit below the bar at the top, with the head up on the neck. Mid and partial holds
  are at 90° elbows.
- **Band:** moved outside the torso.
- **New pull-up figures:** 5 s and 10 s negatives are now separate figures, and grease-the-groove has its own
  single-rep-then-rest loop.
- **Scap work:** scap pull and active hang keep the arms at full length while the trunk rises; they used to
  shrink 19%. The scap retraction hold now maps to the pull-up top.
- **Ring rows:** the three variants differ by body angle (flat, steep incline, level on the box), with straight
  arms at the bottom.
- **Wall walk:** starts as a plank.
- **Kick-up:** separate swing and push legs.
- **Handstand walk:** one hand steps while the other is planted.
- **Tuck handstand:** goes in and out of the tuck.
- **Squats:** shin at ~25°, hands on the bar, front-rack elbows high, a foot drawn under the ankle.
- **Block pull:** start reads as a pull, not an RDL.
- **Adductor:** both knees drawn with the ball between them, plus an extended-lever variant.
- **Others:** wrist prep keeps the knees planted; child's pose arm length fixed.
- **New variants:**
  - wall handstand shrugs, shoulder taps and the 90° hold
  - finger raises
  - hollow-body pullover (it was mapped to the dowel pullover)

**New hip-rebuild figures:** `bridge2`, `hipthrust`, `splitsquat`, `slrdl`, `pallof` (front view), `nordic`,
`sled`, `suitcase` and `farmer` (front views), `airsquat`, `goblet`, `amarch`, `legswing`, `hollowtuck`.
The provocative positions are encoded as tests in `rig.test.ts`:
- squats never go below parallel
- the A-march stops at a level thigh
- leg swings stay at ≤30° with a soft knee
- the hip thrust and bridge finish in line, never arched
- `hollow_hold` is drawn TUCKED (no straight-leg-raise hold)

## Files
- `before/`, `after/`, `after-hip/`: contact sheets (frames through a cycle, reduced motion, Today tile and
  brief thumb at 2x), plus `thumbs-actual-size.png`.
- `before-after.png`, `before-after-hip-rebuild.png`: the founder's comparison at real sizes.
- `render-figures.mjs` (`cd next-app && node ../dev/active/figure-review/render-figures.mjs <out> [fig…]`) and
  `compare-figures.mjs` (needs `.old/rig.ts` from `git show`; see its header).

## Not done / follow-ups
- **Copy conflict (data, out of scope here):** `air_squat_daily` and `goblet_squat` cue "full depth", but the
  figures stop at about parallel for this program's provocative positions. The copy should say "to about
  parallel, pain-free", ideally in `anterior-hip-rebuild`'s `exercise_overrides`.
- **Left as is:**
  - `ninety` is still the top-down view, which the coach called hard to read.
  - The handstand sway is a single lean, not the irregular sway motion asked for.
  - Several `hswalk` drills (cones, plate, marker path) share one figure.
- **No in-app screenshots of signed-in screens:** sign-in needs a CAPTCHA. The public program page was checked
  in the dev server: fitted viewBox, measured height and px strokes all live.

## Round A: body v2 (2026-10-28, same day)

The founder asked for round A from [ideas-00-synthesis.md](ideas-00-synthesis.md).

- **Flesh over the skeleton.** Every figure still builds the same joint skeleton. Poses, limb-length rules and
  every earlier test are unchanged. `flesh()` in `rig.ts` then draws filled shapes over it:
  - **Tapered limbs.** Thigh radius 0.12T tapers to 0.055T at the ankle; upper arm 0.085T to 0.048T. Knees and
    elbows are pinched a little.
  - **Trunk.** A pelvis, waist and ribcage shape. It is flatter when the trunk is near horizontal, so bridges
    and hollows don't read as an arched back. Front views get their own wide shape with shoulders.
  - **Head.** Radius 0.21T.
  - **Contact shadow.**

  Roles (trunk, shoulder end, arm vs leg) are read from the skeleton, so no figure needed annotating. T is the
  figure's trunk length.
- **One set of proportions.** The floor figures had a trunk ~40% too long and short arms. Trunk went 100 → 78
  and arms 60 → 78 on the bridge, glute bridge, dead bug, pullover, adductor and hip thrust; the hollow legs went
  100 → 120. The bridge's in-line top angle was re-solved (19.7° → 22.7°).
- **Edges.** On the tile and in the player, a thin near-black edge separates overlapping parts: near over far
  limb, arm over trunk, head over arms. In thumbnails the edge is the part's own colour, so it thickens the shape
  instead of eating into it.
- **Draw order and accents.**
  - Pull-up and hang: the head is drawn in front of the arms and the bar in front of the head, so chin over the
    bar reads.
  - Hollow tuck: the accent moved from the trunk to the reaching arms.
  - Hip thrust: the head is lower, so it no longer reads as neck flexion.
- **Re-checks.**
  - [05-coach-body-v2.md](05-coach-body-v2.md): 7 → 7.5, no safety issues.
  - [06-visual-body-v2.md](06-visual-body-v2.md): 56x40 4 → 6, tile 6 → 8, player 6.5 → 8, "looks
    professional" 4 → 6.5.
  - All their top fixes were applied afterwards. Those reviews predate the fixes.
- **Sheets.** `after-body-v2/` and `before-after-body-v2.png`.
- **Still open.**
  - Variant distinctness is unchanged by flesh (visual 4.5). Several pull-up and wall-handstand variants still
    look alike; that belongs to round C (cue overlays, ladder ghosts).
  - The 90/90 top view still uses thin far arms.

## Round C: teaching (2026-10-29)

The founder picked round C (three of the four experts ranked it first). Everything is drawn from named joints
(`sc.mark`) and declared per figure as data (`cues`, `ladder`, `glyph`). Cues and ghosts are hidden below 64px;
glyphs show at every size.

- **One cue per drill**, thin bronze, behind the body:
  - **Plumb:** bar over mid-foot on the back squat and block pull; front shin on the split squat; hands on the
    midline on the Pallof press; trunk upright on the suitcase carry.
  - **Level with a hatched limit:** "no deeper than parallel" on all four squats. It is a ceiling, never a target.
  - **Angle arcs:** elbow 90° on the mid and partial pull-up holds; hip on the A-march.
  - **Alignment lines** (dashed until in line, then solid):
    - shoulder–hip–knee on bridges and the hip thrust
    - foot–hip–shoulder on ring rows
    - hand–shoulder–hip–foot on handstands
    - knee–hip–shoulder on the nordic
    - shoulder–hip–rear foot on the single-leg RDL
  - **Pelvis-tuck arrow** on the half-kneeling stretch. A shoulder-over-hip plumb was tried and dropped: leaning
    back into lumbar extension also satisfies it.
- **Variant glyphs** on the pull-up family, so the 13 bar figures no longer share one thumbnail (tested):
  - up arrow: pull; with a rest dot: single; with tempo ticks: slow; short: partial
  - down arrow with 3 or 1 tempo ticks: 10 s or 5 s negative
  - two bars: hold, high or mid
  - chevron: scap pull; chevron with bars: active hang
- **Heavy vs light band** is drawn as band thickness, and `pu_band_pullup_light` has its own figure.
- **Ladder ghosts**: the next-harder rung as a faint dotted outline with no head. Ring rows go
  incline → flat → feet-up; the inclined wall handstand goes → 90° → chest to wall.
- **Shoulders slide in** (retraction) toward the top of a pull-up.
- **Reviews:**
  - [07-coach-round-c.md](07-coach-round-c.md): "teaches correctly" 6 → 7.5. Its three must-fix items are
    applied: the kneel cue, the squat line as a ceiling, and no mid-foot plumb where the bar isn't over
    mid-foot (front and goblet squat).
  - [08-visual-round-c.md](08-visual-round-c.md): distinctness at 56x40 4.5 → 6.5, clutter 7.5, professional 7.
    Its fixes are applied: glyph weight 9 with filled heads, arc r20, plumb and level lines at 2px, ghosts
    0.4 opacity and dotted.
- **Still open:**
  - The `air_squat_daily` and `goblet_squat` cues in `exercises.json` say "full depth", while the figures and
    their new limit line say "no deeper than parallel". Changing the copy is a data edit outside `lib/figures/`.
    The figure's own text alternative now says "to about parallel and no deeper".
  - Alignment lines mostly show the target, not feedback, because the figures are drawn straight.
  - No cue yet for: neutral back on the block pull; shoulder-to-ear distance on the hangs; low back flat on
    the hollow and dead bug.
