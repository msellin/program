# Recheck of P-01..P-29 against gap screens (2026-10-28)

Paths are relative to screens/gaps/. Captures are the post-fix screens in B-red-day, A-first-run and C-viewport-375.

| P-id | screen file | PASS/FAIL/NOT-VISIBLE | one-line evidence |
|---|---|---|---|
| P-01 | B-red-day/04-today-red.png; 06-session-on-red-day.png | FAIL | Today shows one rest card with no Open session (04). But /session page still shows Start session and Follow along on red (06, 07). | ✓ ba992ea
| P-02 | B-red-day/06-session-on-red-day.png | FAIL | "Log an extra session" still shown on the red day's session page. | ✓ ba992ea
| P-03 | B-red-day/04-today-red.png | NOT-VISIBLE | No load-adjust card on red Today or Check. Proposal list not captured. |
| P-04 | none | NOT-VISIBLE | No Stopped or Done screen captured. |
| P-05 | C-viewport-375/04-record-top.png | NOT-VISIBLE | Record shows full readiness chart. No empty state or retest card captured. |
| P-06 | A-first-run/07-today-day-1.png; A-first-run/08-first-session.png; B-red-day/06 | FAIL | "WEEK 1 OF 8" in header, "WEEK 1 OF 4 · ENDS 24 NOV" in session footer. Red-day Plan says 7/8, session says WEEK 3 OF 4. | ✓ ba992ea
| P-07 | C-viewport-375/07-profile-top.png | FAIL | "YOUR WORKING MAXES" heading with no lifts under it. "GRADUATED" chip still on program row. | ✓ ba992ea
| P-08 | C-viewport-375/06-programs-top.png; A-first-run/04-programs.png | PASS | No "Reviewed by" line. Only CITED badge plus "How we check programs" disclosure. |
| P-09 | A-first-run/08-first-session.png; 09-first-session-bottom.png | FAIL | Day 1 shows "Your latest retest clears Tier D" and "TIER A" footer. The user has no retest. | ✓ ba992ea
| P-10 | none | NOT-VISIBLE | No normal rest-day Today captured (only red card). |
| P-11 | none | NOT-VISIBLE | Handstand plan card not captured. |
| P-12 | A-first-run/08-first-session.png | PASS | No citation names in Day body. No Why? needed on Day captures. |
| P-13 | none | NOT-VISIBLE | No suggestion card captured. |
| P-14 | C-viewport-375/05-check-top.png; 05-check-bottom.png | PASS | "Saved. Today's plan is adjusted." and "Also happened:" field present. Severity key shown once. Life-load selected state not captured. |
| P-15 | B-red-day/02-check-red-selected.png | PASS | Selected chips show check plus border ("None", "Severe"). Focus ring not seen. |
| P-16 | C-viewport-375/02-plan-top.png; 03-session-top.png | FAIL | Today row labelled. But Day still says "INTERLEAVED CONSOLIDATION FOR ALL TIERS". Plan says "Mixed practice · Post-acquisition". Move sheet not captured. |
| P-17 | B-red-day/07-session-started-on-red.png | FAIL | "Something hurts" pill sits above the ring, not in the bottom cluster. No "+1" visible. |
| P-18 | B-red-day/06-session-on-red-day.png | FAIL | Start session is sticky above nav. "How to run this" prose cards still fully expanded. |
| P-19 | none | NOT-VISIBLE | Font sizes cannot be measured from these captures. |
| P-20 | none | NOT-VISIBLE | Sheet and rest announcements not captured. |
| P-21 | B-red-day/07-session-started-on-red.png | PASS | Set view says "Something hurts". "Pain or tweak" not seen. |
| P-22 | B-red-day/07-session-started-on-red.png | FAIL | Empty tutorial panel shows "Open the full tutorial for this move." Not the first cue line. |
| P-23 | none | NOT-VISIBLE | No FAB visible. Decision marks it not-a-bug. |
| P-24 | C-viewport-375/04-record-top.png | PASS | No blocking sheet, no Basis/Signal chips. Subtitle still says "Every change cites a study". |
| P-25 | A-first-run/06-intake-01.png | FAIL | Screening "STEP 1 OF 16" comes first, before the ability questions. | ✓ ba992ea
| P-26 | C-viewport-375/06-programs-top.png; 06-programs-bottom.png | PASS | Second card peeks at right edge. "8 wk" on one line. Coming-soon cards greyed. |
| P-27 | A-first-run/07-today-day-1.png; C-viewport-375/10-off-plan-top.png | FAIL | Nav reads PROFILE, but coach-mark says "You". Off-plan header still says "ACCESSORY WORK". | ✓ ba992ea
| P-28 | C-viewport-375/07-profile-bottom.png; 10-off-plan-top.png | PASS | Profile clears nav. No events link. Off-plan has Back (destination not verified). |
| P-29 | none | NOT-VISIBLE | End-of-cycle screen not captured. |

## New defects

1. B-red-day/06-session-on-red-day.png: red-day session page is still startable (see P-01/P-02). BLOCKER. ✓ ba992ea
2. A-first-run/08-first-session.png: day-1 user sees "Your latest retest clears Tier D" with no retest on record. TONIGHT.
3. B-red-day/07-session-started-on-red.png: "Something hurts" pill overlaps the "Next: Ring row" text. TONIGHT. ✓ ba992ea
4. B-red-day/04-today-red.png vs 02-check-red-selected.png: "Shoulder is 8/10" on Today, "Shoulder is above 5/10" on Check. TONIGHT.
5. C-viewport-375/04-record-top.png: "Week of 26 Oct, Sessions 0 / 0" while Plan says "1 logged". TONIGHT. ✓ ba992ea
6. C-viewport-375/02-plan-top.png: new jargon "Post-acquisition" in Mixed practice card. TONIGHT.
7. C-viewport-375/07-profile-top.png: empty "YOUR WORKING MAXES" heading. LATER. ✓ ba992ea
8. C-viewport-375/10-off-plan-bottom.png: pull-up user offered Trap-bar and Romanian deadlifts as extra work. LATER.
9. B-red-day/06, C-viewport-375/03-session-top.png: "FIRST STRICT PULL-UP" header clipped at right edge. LATER.
10. C-viewport-375/06-programs-bottom.png: "10 wk" meta line wraps mid-phrase. LATER.
