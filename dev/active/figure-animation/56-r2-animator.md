# 56 Rescore 2, animator lens (2026-10-29, live 597bfef)
Evidence: strips sled and pullup_band read, lane notes 40-43 read, r1 file 35. Other clips judged from lane numbers and rig logic, so unchanged figures keep their r1 score and nothing unseen exceeds 8. Bar: as human-like as a flat figure can be.

## Scores (60 figures)
- Strength: squat 8, frontsquat 8, goblet 8, airsquat 8, deadlift 8 (+1: block start, plate behind leg), bridge2 7, hipthrust 7, splitsquat 8 (+1), slrdl 8, nordic 9 (+1: hands push to straight, no one-frame release), sled 8 (+1: 1.0 s step, 46 px stride, ticks follow stance), suitcase 8, farmer 8 (swing foot lift now 6 px, breath), pallof 7
- Rehab: hipflex 7, adductor 7, adductor_ext 7, bridge 7, deadbug 7, kneel 7, ninety 7, pullover 8, roller 7, hollow 7, hollowpull 8, hollowtuck 7, amarch 7 (+1: back arm 40 deg), legswing 7
- Pull: hang 7, pullup 8, pullup_single 8, pullup_slow 8, pullup_band 8 (+1: loop widened, 4 px band), pullup_band_light 8, pullup_partial 7, pullup_negative 8, pullup_negative5 8, pullup_top 7, pullup_mid 7, scappull 7, activehang 7, rowflat 7, rowincline 8, rowfeet 7, pullapart 7
- Handstand: wristprep 7, wristback 7 (new: clean 3 s up / 1 s back, body static), fingerraise 7, downdog 7, child 7, wallhs 8 (+1: toe-press sway), wallhs_90 7, wallhs_lean 7, wallhs_shrug 8 (+1: 13 px rise), wallhs_taps 7, hsfree 8 (+1: second harmonic), hstuck 8 (+1: tuck-then-fold order), hswalk 8 (+1: hip drift, hand lifts), kickup 8, wallwalk 8 (+1: one pair at a time)
Count at 9 or above: 1 (nordic). Mean about 7.6 (was 7.3). 59 figures are under 9.

## What changed that I checked
- Sled strip: legs now read as a push (trailing shin long, knee under hip), ground ticks scroll; still no arm or trunk counter-motion, still a single gait loop.
- pullup_band strip: band loop is a clear wide cradle under the feet and no longer collides with the forearms; the pull itself is unchanged. Reset pop gone (frame 0 == last frame test, fades on negatives): shared [H] from r1 is CLOSED.
- Not changed by any lane: phase beats, squat hip-lead, roller ball travel, deadbug reach timing, rowing top squeeze, hstuck entry lean. These are what keep most figures at 7-8.

## Remaining issues (all figures under 9)
- [H] Phase beats are still absent on loaded lifts and the pull family (squat, deadlift, pullup, rows, hswalk): rest, effort, hold, return differ only in tempo → one 150 ms dwell at the key pose plus a 4 px settle after lockout/top; can reach 9 inside the rig (build-level easing only). Without it the squat/deadlift/pull families cap at 8.
- [H] Squat family ascent: shoulder and hip still rise together out of the bottom hold → hip leads 5-8% of p before the shoulder; reachable, a single easing offset in build.
- [M] Toe-off and touchdown of swing legs start and end at zero velocity (sled, farmer, suitcase, amarch, hswalk) → swing speed at the ends equals stance speed, about 3 px/frame at 30 fps; reachable in stride().
- [M] No arm swing or trunk counter-rotation in unloaded gaits (amarch has the arm, hswalk is planted); sled/farmer/suitcase correctly locked. Accepted.
- [M] roller: ball stays under the shoulder blades → 6 px ball travel opposite the trunk, reachable.
- [M] deadbug / hipflex / kneel / adductor / ninety / hollowtuck / legswing: ranges 3-20 px, near-static at 56x40. Hip never past 90 is a safety rule, so the range is capped by the owner's rule, not a defect. Arrow pulse at the effort could lift to 8; 9 would need larger motion and is not reachable.
- [M] bridge2 / hipthrust: shin versus knee numbers conflict (lane 40, biomechanist arbitrated); a motion cap of 7-8 is geometry and safety, an owner decision.
- [M] kickup: trunk 83 deg (not 68) is geometric; the dip is added. 8 is the ceiling short of a squash-and-stretch the rig does not draw.
- [M] rows: add a 0.4 s squeeze at the top; reachable, +1.
- [L] pullup_top / pullup_mid / wallhs_lean / pullup_partial / hang / activehang / child / downdog: single poses with 0.8 px breath. A pose cannot exceed 7 on motion; they only need to read as alive and do.

## What a 10 would take (flat figure)
Dwell beats on every key pose, hip-first ascents, overlapped follow-through (heel after hip, head after shoulder; dropped at these tempos as under 1 px), and a limb that rotates in depth. None of the last two fits a flat rig, so 9 is the realistic ceiling and the first two items get there.
