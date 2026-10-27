# X09 off-plan / extras / activity log (pullup, concurrent, strength)

- CONFUSING · persona-pullup/flows/activity-log-sheet/03-activity-options.png · src/components/session/BriefView.tsx:491, src/components/workout/RunSlotCard.tsx:85 · [BEFORE-SCALE] · One idea, 6+ names: "Off-plan", "Extras", "Accessory work", "Log a run, row, or class", "Log an activity", "Log extra session →", "Log this session", "Cross-modal work"
- CONFUSING · persona-concurrent/mobile/12-off-plan.png · src/components/offplan/OffPlanSession.tsx:250-251 · [HACKATHON] · Off-plan stub (flag off) names "Log a run, row, or class" but offers only "Back to Day"; no link to the logging sheet
- CONFUSING · persona-pullup/flows/activity-log-sheet/03-activity-options.png (also strength 03) · src/components/workout/RunSlotCard.tsx (sheet footer copy) · [HACKATHON] · Same card says "Nothing here changes the plan" and "feed today's proposal"; contradictory, and "keyword parser / no LLM" is internal jargon
- CONFUSING · persona-pullup/mobile/12-off-plan.png · src/components/offplan/OffPlanSession.tsx (~line 103 note) · [BEFORE-SCALE] · "Log the weights — the engine reads them for your training maxes" overpromises against confirm-first; verify no silent TM change
- CONFUSING · persona-pullup/mobile/12-off-plan.png · list data (not traced to a file) · [HACKATHON] · "First strict pull-up attempt" and "Partial-ROM pull-up (top half)" each appear twice, differing only by ladder subtitle
- CONFUSING · persona-pullup/mobile/12-off-plan.png · list data · [BEFORE-SCALE] · 40+ flat "Lifts you did elsewhere" rows, no search or filter; to log a CrossFit class or 5k you scroll past all of them
- CONFUSING · persona-pullup/mobile/12-off-plan.png · "Copenhagen plank, short lever" in shared lifts list · [BEFORE-SCALE] · CLAUDE.md lists Copenhagen as a provocative position for this user; route to programme-integrity before launch
- UGLY · persona-pullup/mobile/12-off-plan.png · list data · [LATER] · Tier jargon in subtitles ("Dead-hang ladder (Tier A/B)", "Grease the groove — sub-max singles (Tier C/D)"); "1 sets" grammar in text captures
- CONFUSING · persona-concurrent/mobile/12-extras.png, persona-strength/mobile/12-extras.png · src/app/extras/page.tsx:16-24 · [HACKATHON] · Captures show the pre-rename "Extras" page; source now redirects /extras to /off-plan. Capture is stale
- CONFUSING · all persona captures · artifact dates · [HACKATHON] · Clock drift: "Tuesday 27 Oct", "Friday 21 Aug", "Friday, Oct 30", "Oct 28", "Oct 29" in the same run. Evidence is hard to trust
- CONFUSING · persona-strength/flows/activity-log-commit/01-activity-logged.png · persona-concurrent/flows/activity-log-commit/01-activity-logged.png · [HACKATHON] · "Logged" captures still show the open form with SAVE SESSION. No saved state or toast is captured, so "does logged outside load change the plan" is unverified
- POLISH · persona-concurrent/flows/activity-log-sheet/03-activity-options.png · [LATER] · Sheet title switches between "Log an activity", "Optional easy session" and "Log extra session" depending on context

Good:
1. Type chips include CrossFit class, HYROX, Ski erg, Row, Bike; effort is one tap (Easy/Moderate/Hard); the optional note placeholder "WOD name, felt like..." suits a CrossFit athlete.
2. The off-plan route degrades gracefully: /extras redirects to /off-plan (12b capture shows the page), and a flag-off account gets a clear stub with a way back.
3. The "Around your session" warm-up sheet carries an explicit "no aggressive static stretching" note, consistent with the rehab positioning.

Not checked: no runtime run; no image or capture of the saved/confirmed state; the drill-library list build and the logged-activity effect on Day/proposal were not traced in code; 12b image was viewed only for the pullup persona; no desktop captures; concurrent/strength 12-extras viewed only as captures, not against a live build.
