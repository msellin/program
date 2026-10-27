# X06 check and safety-state audit (2026-10-27)

- BROKEN · flows/hip-check/01-check-start.png (also pullup/14-check-hip.png, handstand/14-check-hip.png, pullup-elbow/14-check-hip.png, muscleup-elbow/14-check-hip.png) · src/app/check/hip/page.tsx:20 (no program guard; route reachable by URL) · [HACKATHON]. Non-hip users get the full "Hip flexor + balance check" with groin, SLR and hanging-leg-raise items.
- BROKEN (latent, not seen in capture) · persona-pullup/text/01-day.txt shows no hip card · src/components/workout/SignalsStrip.tsx:425 renders AssessmentDueBanner, which is ungated by program (src/components/AssessmentDueBanner.tsx:12-22). A first-time user with no hip entry gets "First hip check" on Today if that branch renders. Verify. [HACKATHON]
- CONFUSING · persona-pullup-elbow/mobile/13-check.png · src/lib/symptom-state.ts:77 · amber reason "Life load in the middle-high range." is jargon with no action. Buttons write 0/4/8 (src/app/check/page.tsx:84-86), so the 5-7 band is only reachable from legacy data. [BEFORE-SCALE]
- CONFUSING · persona-pullup-elbow/mobile/01-day.png · src/components/workout/HeroStateCard.tsx:62 · "CHECK FIRST / Hold load" gives no link to the check and no next step. "Shea & Morgan 1979" under the rest-day card is unexplained. [BEFORE-SCALE]
- CONFUSING · persona-pullup/mobile/13-check.png, persona-muscleup-elbow/mobile/13-check.png · CITED line "Kellmann 2010 · pain-provocation thresholds" appears on the GREEN state too, implying a threshold was applied when none fired. Source line not located. [LATER]
- CONFUSING · persona-concurrent/mobile/13-check.png · src/app/check/page.tsx:165-181 loads only the primary program's regions. Hip track is legitimate here (personas.ts primary = anterior-hip, secondary = engine-builder), but engine-builder's knee/achilles fields are never offered. [BEFORE-SCALE]
- POLISH · persona-pullup/mobile/13-check.png · sticky "Update check" bar covers the flags row and context block. [LATER]

Good:
1. Per-program regions work: pull-up shows Shoulder/Elbow/Low back, muscle-up shows Shoulder/Elbow/Wrist, with no hip labels (src/lib/symptom-regions.ts:91-98).
2. Flags are per-program: pull-up sees only "Woke me at night"; the hip-only flags do not appear (src/lib/symptom-regions.ts:170-175).
3. Green and amber states are plain-language with a one-line reason and "Saved. Today's prescription adjusts to this read."

Not checked: red-state screens (persona-recover/mobile/13-check.png and 01-day.png are green, not red; no red capture found for the three named personas); handstand 13-check; concurrent 14-check-hip; live app run (all findings from artifacts and code); whether AssessmentDueBanner renders for a pull-up user (finding 2 unverified).
