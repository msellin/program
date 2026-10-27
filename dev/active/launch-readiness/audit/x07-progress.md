# x07 progress and records audit (mobile, 2026-10-27 artifacts; A = tests/e2e/artifacts/personas)
BROKEN · persona-erratic/mobile/05b-record.png · latest retest "139 bpm −0.7 vs previous 119 bpm" (implies +20); baseline reads 141, 142, 139 across cards · [HACKATHON]
BROKEN · persona-strength-long/mobile/05b-record.png · headline "139 bpm −1.9" but footer "Base 142 · Now 269 · +127.0 (direction check)"; ALL-range chart climbs to ~260 · [HACKATHON]
BROKEN · persona-graduate/mobile/05b-record.png · "0.0 bpm since baseline" with latest 140, footer "Base 141 · Now 118 · −23.0" · [HACKATHON]
CONFUSING · persona-erratic/mobile/05-progress.png · Progress page bottom nav is TODAY/WEEK/PROGRESS/HISTORY/PROFILE; Record page nav is DAY/PLAN/RECORD/PROFILE: two IAs for one user · [BEFORE-SCALE]
CONFUSING · persona-erratic/mobile/05-progress.png · "Concurrent training indicators" caption overlaps the week card; readiness dot grid is mostly empty for a sparse user with no explanation · [HACKATHON]
CONFUSING · /history and /progress are client redirect stubs showing "Redirecting…" (app/history/page.tsx:22, app/progress/page.tsx) · persona-graduate/mobile/04-history-redirect.png · on arrival the "Every change here cites its source" sheet opens over Record (components/record/CutCRecordOnboardingBeacon.tsx:59) · [HACKATHON]
CONFUSING · persona-graduate/mobile/10-report.png · arc strip "BELOW TARGET" badge next to status "graduated"; retest delta rows clipped on right ("R 58 bpm", "Submax HR —…") · [HACKATHON]
CONFUSING · persona-retest/flows/retest-logging/01-retest-proposal.png · "Rest day. Engine Builder has no session scheduled" sits under a retest-window card and a Run z2 prompt; jargon "unlock the classifier", "×0.95 applied" · [HACKATHON]
CONFUSING · persona-retest/flows/retest-logging/02-retest-sheet.png · "Submax HR — easy-effort avg (bpm)" with no plain explanation of the metric or where to measure it; "(you hit ~90% of the prescribed...)" placeholder assumes knowledge · [LATER]
CONFUSING · persona-strength-long/mobile/10-report.png · "Back squat 5RM … target 0 kg" with baseline "—"; "TM 145 kg" (training max) never defined · [HACKATHON]
CONFUSING · report footer "orthopaedist and physiatrist" and "Rehab days 0" render for every program (app/report/page.tsx:275, :810-811) · persona-graduate/mobile/10-report.png, persona-strength-long/mobile/10-report.png · clinical framing leaks to non-hip users · [HACKATHON]
CONFUSING · persona-retest/mobile/10-report.png · "RETEST — LOG NEW READING" CTA inside a printable report; duplicate "Submax HR · mid-block" card · [LATER]
CONFUSING · "Personal contraindications: Overhead pressing — sim: shoulder flagged" on three personas' reports (app/report/page.tsx:747) · "sim:" reads as a test artifact; verify it is seed text, not user data · [HACKATHON]
UGLY · persona-retest/mobile/10-report.png · aerobic rows wrap "avg HR / 139" mid-value in monospace; dense tables with no hierarchy · [LATER]
POLISH · persona-strength-long/mobile/05b-record.png · "Next retest in 20d" and "Signal-cited · no study reference" stacked in small italic; target (-5 bpm) absent from Record, so "am I progressing" needs the report · [LATER]
Good:
1. Record's citation sheet explains the citation model in plain words and includes an Export button.
2. Old /history and /progress links are kept alive via redirect stubs with visible "moved to Record" text.
3. Report has range tabs (4W/12W/26W/3Y), a print/save action, and a clear footnote on baseline vs current vs delta direction.
Not checked: desktop captures; 00-no-proposal images; 05-progress-redirect and 04-history images for graduate/retest; erratic 04-history "Symptom trends" copy (no src match, likely stale capture); origin of classifier copy in program JSON; no live interaction (text and screenshots only).
