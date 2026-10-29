# Lane 21: rehab family (2026-10-29). Code: rig.ts builders, tests: rig-rehab.test.ts (12 new, rig.test.ts untouched, all green)
Numbers are included angles from measure-angles.mjs (before -> after). New constant `ARMLY = 94` (lying arm = 0.78 x leg 120); standing figures use ARM86.

- hipflex: hip 81..87 -> 90..93 (never past 90 flexion), work knee 82 -> 93, support knee 97 -> 94. Legs 64+54 -> 44+42, trunk upright. The hand no longer moves (thigh 3 deg into a fixed hand; effort by arrow).
- adductor: knee 66 -> 92, hip 129 -> 140, shin 26 -> 41. adductor_ext: knee 103 -> 122, hip 145 -> 154, shin 47 -> 57. Filled ball disc between the knees (r 12 -> 9.5 at the squeeze, knees 3 px closer). Arms 76 -> 94.
- bridge: knee 56..72 -> 82..95, hip still ends 180, shin 19..5 -> 35..25. Foot moved out to x 281.6, computed from the straight-line condition. Top pause was already 1.6 s.
- deadbug: extending leg hip 168 / knee 180 -> hip 148 / knee 112, heel just touches the floor (bent-knee heel tap, no straight leg anywhere). Arms 78 -> 94 reaching to 168 flexion. No gate needed: no straight-leg variant is drawn.
- kneel: front leg 64+56 -> 44+42; front hip 31 -> 97..92, front knee 119 -> 111..97, shin 33 -> 14..3 from vertical. Rear hip 180 -> 172 (hip travels 8 px), rear thigh now keeps its length. Hands on hips with ARM86.
- ninety: knee sweep +-55 -> +-38 deg (thigh +-23 either side of the hip-foot line, never crosses its hip); hands drawn straight, back-lateral on the floor.
- pallof: 3D arm solve (35+32) with depth drawn as an oblique offset: hands travel ~35 px, elbow 72 -> ~173, anchor fixed at y 54, band thins 4.5 -> 2.5 (was thicker), legs 44+42 with knees ~170 and hip-width feet, own legs instead of frontBody. Dur 5 -> 7 s, hold ~2.2 s.
- amarch: arm shoulder 40 -> 65 forward, elbow 110 -> 90, back arm 28 behind (ARM86); H/S moved up 2 so stance ankle is on the floor and the stance shin is 42 (was 40).
- legswing: still frame was mid-swing (legs overlap, ~3 px): poster now the forward end. Range unchanged (30 front / 15 back, knee 164); arm to the rail uses ARM86.
- hollowtuck: hip included 66 -> 84..100 (flexion 114 -> 96 max). Arm 70 -> 94.
- hollow / hollowpull: arm now a = trunk angle minus flexion: pull goes 90 -> 175 monotonic (was lerp through the feet), 3 s out / 3 s back (dur 6 -> 9 s). Hold arm at 172.
- pullover: knee 74 -> 90, arm 78 -> 94 to 170 flexion, hold 4 s -> 2 s (k = .06/.34/.56/.96).
- roller: upper segment now turns 22 deg past the lower-back line (was 28 deg already, but the measured lower segment never moved). Upper segment drawn first so angles.md reads it: trunk 62 -> 84 from vertical.

Could not fix / disagree:
- Adductor and bridge: trainer's knee, hip and shin numbers cannot all hold with feet on the floor (hip 129 + knee 95 + shin 20 is impossible). I chose the knee targets; shin is 41 / 25 not 15-25, hip 140 not 129. Bridge shin cannot be vertical while the knee is 95 at a straight shoulder-hip-knee line.
- Kneel hip travel capped at 8 px, so rear-hip extension is ~10 deg, not 15 (trainer asked both).
- legswing front flexion 30 not 35-40: rig.test.ts asserts thigh >= 59.5 deg. Raising it needs that test changed.
- roller: trainer wrote "62 -> 45-50 from vertical"; head toward the floor makes the chord flatter (84), so I followed the physical direction. Elbow measures ~15 deg (hands tucked behind head).
- amarch stance heel lift skipped: leg length 86 fixes ankle height.
- pallof start elbow 72, not 90 (a 90 start leaves only ~25 px of travel at this arm length).
