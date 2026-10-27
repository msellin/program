# X03 — core workout session (persona-pullup, persona-handstand), 2026-10-27
Paths relative to A = next-app/tests/e2e/artifacts/personas. Code relative to next-app/src.
- BROKEN · pullup flows/session-rest-extend/02d-after-jump.png · components/session/RestTakeover.tsx:446-454 · after "Jump to" the rail shows Dead hang / Active hang, which were not in the 02c sheet (session content changed under the user; verify) · [HACKATHON]
- BROKEN · pullup flows/session-stop/02-session-stopped.png · NoteSheet.tsx:53 · stop is offered only when program==handstand-walk (DaySession.tsx:446). Pullup "Pain or tweak" just saves a note and the session continues, no stop path · [HACKATHON]
- BROKEN · no completion state anywhere · DaySession.tsx:451-456, BriefView.tsx:149 · Stop and Finish here both return to brief; no "done" or "stopped" state exists (grep: none) · [HACKATHON]
- CONFUSING · pullup flows/session-finish-here/02-finished-here.txt · BriefView.tsx:149 · after Finish here the CTA still reads "Continue — Ring row, set 3" and Ring row shows "4 sets" (was 3 on brief) · [HACKATHON]
- CONFUSING · OverflowSheet.tsx:131 vs :215 · "Finish here" and "Stop here" (under Something hurt) run the same handler (onFinishHere); "Stop" does not stop the session · [HACKATHON]
- CONFUSING · handstand flows/session-log-set/02-set.png · SetView.tsx:649,671 · hold screen has three competing actions: "Start the hold · 30s" (primary), "Change the time", "Log it now" (14px text, h-10 = 40pt target) · [HACKATHON]
- CONFUSING · pullup jump sheet, rail · RestTakeover.tsx:446-454 · three identical "Ring row" rows, rail labels truncated ("Ring row (inclin…") so exercises can't be told apart · [HACKATHON]
- CONFUSING · pullup flows/session-rest-extend/01-rest-before.txt vs session-log-set/03-rest.txt · RestTakeover.tsx:35-39 · effort labels differ across captures ("Very easy 4-5+" vs "5+ more"); capture looks stale vs code · [BEFORE-SCALE]
- CONFUSING · pullup/mobile/… session-log-set/01-brief.txt · BriefView header · "WEEKS 5-8 … WEEK 3 OF 4" is contradictory · [BEFORE-SCALE]
- CONFUSING · handstand brief (flows/session-finish-here/02-finished-here.png) · BriefView.tsx "How to run this" · citations and jargon on the first screen ("Wiesinger 2019 mechanism basis", "Kinoshita position 1", "Tier B", "scap") for a first-time athlete · [LATER]
- CONFUSING · handstand brief note "harness: felt solid, no groin pain" shown in Today's sets · persona fixture or real personal note in shared view; confirm and scrub · [BEFORE-SCALE]
- UGLY · handstand flows/session-log-set/02-set.png · header "DOWNWARD-DOG WRIST RECOVERY · SE…" truncated, chips "Downward-dog ..." cut · [LATER]
- POLISH · pullup mobile/16-session-today.png · this capture is a Rest day (no session), so the persona's "today" check did not test a session · capture-day mismatch · [HACKATHON]
- Good:
  1. Set logging is one tap: "Done — set 1" under a large "10 reps" (pullup 02-set.png); reps stepper is hidden behind "Change the reps" (stepper-used.png).
  2. Rest screen is clear: big 2:00 countdown, "NEXT UP Set 2 of 3", +30s and Skip rest as large targets (pullup 03-rest.png).
  3. Brief CTA names the next exercise and set ("Continue — Ring row, set N", BriefView.tsx:149), and the note sheet explains why ("The engine reads this when it plans next week").
- Not checked: session-hold and session-rest-jump folders are empty; handstand mobile/16-session-today.png not viewed; handstand session-controls pips/rail images not viewed; tap sizes measured by eye, not in devtools; persona-pullup stop note-sheet image (01) not viewed.
