# X12 program-promise audit (2026-10-27)
Read-only. Sources: persona text/json/store artifacts, manifest, program JSON. Images: 2 of 8 viewed.

## Cross-cutting
- [HACKATHON] Store retest_readings (pullup 100-118 reps, dead hang 107-125s; handstand wall hold 100-118s) contradict UI: pullup-fast 01-day shows baseline "0 reps / 11s"; handstand 05-progress shows "No readings yet". Either sim seed bug or UI/gates read different sources.
- [HACKATHON] One screen, three end dates (handstand 01-today "ENDS 6 SEPT", 01-day "ENDS 13 NOV", plan 26 Oct-1 Nov); week counters disagree (4/6 vs "program week 7").

## first-strict-pullup
- [HACKATHON] Zero-rep persona (45d) sees "Weeks 5-8 ... Post-acquisition" and tier_a_hang. Promised negative/band progression (Tier B, "first strict rep from a 10s negative") never appears in any plan or logged session.
- [HACKATHON] No-hang content is sensible: dead-hang ladder, active hang, scap pulls, ring rows, shoulder prep. No kipping found.
- [BEFORE-SCALE] Hang-ladder sets logged but done=false in all three pullup personas, so adherence reads wrong.
- [BEFORE-SCALE] pullup-fast: "YOU FINISHED, 8 weeks" after 60 logged days, summary ignores 8 retests. Overperformer focus ("hang times jump early") not shown.
- [BEFORE-SCALE] pullup-elbow: intake stored (elbow_tendon_pain: current), but only visible effect is "x0.95" load; plan identical to uninjured persona. Scap substitution not visible. Header 4/4 vs plan 3/4.

## handstand-walk
- [HACKATHON] Week-4 card "TIER GATE CLEARED, ADVANCE TO TIER B" for a beginner with 0/51 done and no readings in UI. Plan still shows Tier A drills, so the advance is cosmetic. Visible effect of retest_gate gating nothing.
- [HACKATHON] Phase 0 bail-out prep (block_bail_* ) never appears; no intake bail_out_readiness stored, so run_if outcome unknown. Fall-safety content absent.
- [HACKATHON] Same 2 session patterns for 45-60 days (Kinoshita ladder or wall hold + wrist prep + recovery flush). No freestand or walk attempts in prescribed plan; freestand only in off-plan list. Promise "freestand attempts" partly unmet.
- [BEFORE-SCALE] Progress metric "Handstand walk (max continuous) Target 0 m, stretch 0 m" is a meaningless target.
- [LATER] Shoulder-stop copy present on every session: good.

## concurrent-strength-maintenance
- [HACKATHON] No artifact exercises CSM. persona-concurrent is anterior-hip-rebuild + engine-builder. Red-state "resume 3x4" (progression_rules.states[2]) and the 2.5 kg TM promise are unobserved.
- [HACKATHON] Same Today shows "FATIGUE OR PAIN FLAGGED" beside "ADVANCE TO 5/3/1" (AHR persona). Conflicting signals on one screen.

Not checked: CSM sessions and red-state runtime (no persona); pullup/handstand gate code (artifacts only); 6 images; console/vitals; root cause of store readings; citation validity (evidence-verifier); landing copy beyond manifest and catalog grep.
