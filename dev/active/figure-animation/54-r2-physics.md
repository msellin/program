# Rescore 2, physics lens (2026-10-29, live 597bfef)
Method: lane notes 40-43 checked against angles.md and strip-kickup/strip-wallwalk PNGs. COM numbers are the lanes' own, not re-simulated. Strip shows only early frames of the wallwalk and kickup cycles.

## Scores
At 9 or more: 56 of 60 (kickup, wallwalk, bridge2, hipthrust below). Under 9: kickup 8, wallwalk 8, bridge2 8, hipthrust 8 (see below).
Changed vs r1: sled 9, deadlift 9 (block pull, plate on 14 px block), splitsquat 7 -> 9, nordic 9, goblet 8 -> 9, hswalk 9 (arm 171, drift +3), pullup_negative 7 -> 9, pullup_negative5 7 -> 9, wallwalk 7 -> 8, kickup 6 -> 8, wristback (new) 9, hollowtuck 9, pullup_single/slow/band reset seam closed (test frame0 == last) 9. All other figures unchanged from r1: 9.

## Under 9
- kickup 8 [M]: push foot now under hip (x 120 vs hip ~127) with a 6 px dip, release by p 0.09, knee 112. Strip shows the start posture balanced on hands plus rear foot. Not verified frame by frame: hip-to-foot distance vs leg length 80 during the first 0.5 s, and swing-leg decel at the top. Trunk 83 at start is forced by geometry (62 px arm, hip height >= 100 vs shoulder 108): accept. CAN reach 9: confirm hip-foot <= 80 over p 0.05..0.15 and that the other leg arrives with a drift, not a stop.
- wallwalk 8 [M]: one pair at a time is now asserted by a test (no hand/foot move in the same 20 ms), which closes the glide. Start trunk 70 (r1 asked 80-88, impossible with a 62 px arm), end 20. Remaining: the test checks simultaneity, not that the planted pair stays at constant x through the whole other slot. CAN reach 9 with a test asserting hand x constant across each foot slot (<= 0.5 px) and foot x constant across each hand slot.
- bridge2 8 [L]: top shin 15 / knee 84 vs trainer 5-8 and 88-92 together. Shoulder-on-floor plus shoulder-hip-knee line forces knee ~68 at a vertical shin. Geometry cap, owner decision, not a defect. CANNOT reach 9 on both numbers.
- hipthrust 8 [L]: foot 268 gives top knee 95 / shin 6, bottom knee 77 vs 90-110. Bench plus fixed shoulder cap it; no top squeeze because a hip rise past the line breaks the no-extension rule (safety, keep). Reaches 9 only if the owner accepts bottom knee 77.

## Confirmed fixed, no action
- splitsquat: rear share ~45 -> ~34% (<= 35 target), front shin 5 (max 12), hip 40 behind front foot, both knees long at top (178).
- pullup_negative / negative5: Fig.fade [0.97, 0.975] marks the reset, label says "step back up to the top". Teleport is declared, not hidden.
- sled: step 1.0 s, stride 46, hips 91, trailing shin 56, ground ticks at stance speed. Carries: swing foot 6 px, single support under COM at sway +-7.
- hollowtuck: hip included 90..106 (<= 90 flexion, FADIR-safe). Safety rule held.
- nordic: hands pinned until the arm is straight, release over 15% of p; no elbow jump.
- wallhs family: ladder lean 0 / 27 / 45 monotonic; toe-press sway +-0.5 deg from the clock, loops close.

## Open [L], not blocking
- hswalk: opposite-hip counter drift still not added (animator's +3 px toward the step used). Accept.
- goblet: parallel depth is a repo rule; COM now 3 px more forward. Accept.
- pullup_band, pullup family: knee bend not drawn (front view). Accept.
- Not physics: label wording on wallhs_90/lean, breathing under load.

## What a 10 would take
Frame-by-frame COM over base for every standing/inverted frame (done by the lanes only at start/mid/end), measured contact slip in px for the wallwalk and kickup, and a continuous decelerating kick-up with a verified peak leg speed of 300-500 deg/s.
