# x04 Session secondary interactions (persona-pullup, persona-strength)
Screenshots relative to A = next-app/tests/e2e/artifacts/personas
- CONFUSING · persona-pullup/flows/session-overflow-sheet/01-overflow-sheet.png · src/components/session/OverflowSheet.tsx:132,153 · "Something hurt" (pain report) sits 4th in a 9-item overflow menu; "Finish here: Logs 2 of 3, moves on" and "I already did this: Mark all 3 as prescribed" have unclear consequences · [BEFORE-SCALE]
- CONFUSING · persona-strength/flows/session-overflow-sheet/01-overflow-sheet.png · OverflowSheet.tsx:132 · jargon: "6th at prescription", "Takes the empty row out", "Logs 2 of 5, moves on" · [HACKATHON]
- CONFUSING · persona-strength/flows/session-log-missed-attempt/02-after-miss.png · src/components/session/RestTakeover.tsx:340 · after "Missed 57.5 kg" the rest sheet still asks "How many more could you have done?" and says "This sets your training max" · [HACKATHON]
- CONFUSING · persona-strength/flows/session-edit-past-set/03-stepper-open.png · RestTakeover.tsx:340 (rating chips) · two rating scales for one prompt: rep-count chips ("~4 more") on the rest sheet vs "Easy RPE 7 / Solid RPE 8" elsewhere in the same flow (03b/07 text) · [BEFORE-SCALE]
- CONFUSING · persona-strength/flows/session-edit-past-set/03-stepper-open.png · stepper hint "25 + 2.5 kg /side → 75 kg (-1.00)" shows plate math with an unexplained "(-1.00)"; editing a past set is reachable only by tapping a set pip, with no visible Edit affordance · [LATER]
- BROKEN? persona-pullup/flows/session-cold-reload/02-after-cold-reload.txt · dead-hang set 2 reads "0s" after reload and the rating sheet opens for it; the unlogged mid-hold state from 01-mid-set.txt is gone; verify whether a 0s hold is auto-saved on reload · [HACKATHON]
- CONFUSING · persona-strength/flows/session-cold-reload/02-after-cold-reload.png · rest timer restarts at full length after reload (3:00) and the view jumps back to "SET 2 OF 5" rating · [BEFORE-SCALE]
- CONFUSING · persona-pullup/flows/session-video/01-video-modal.png · src/components/VideoModal.tsx:92-97 · Ring row has no demo; placeholder "Search YouTube for 'ring row incline beginner'" opens a new tab, while squat shows an embedded video (strength 01-video-modal.png) · [BEFORE-SCALE]
- CONFUSING · persona-pullup/mobile/18-session-future.png · HOW TO RUN THIS cards quote study jargon ("Fahs 2015 style", "Youdas 2010 EMG", "engineering choice — no direct dose-response study") and "Tier A/B", "I-Y-T" to a first-time athlete · [LATER]
- CONFUSING · persona-pullup/mobile/18-session-future.png · future Friday shows a full-width "Start — Dead hang" CTA with no "not today / date" context · [BEFORE-SCALE]
- CONFUSING · persona-pullup/mobile/17-session-past.png · a past Saturday (Oct 24) renders as "Rest day." with "Log extra session" and the term "Cross-modal work"; nothing says the date is past · [BEFORE-SCALE]
- CONFUSING · persona-pullup/flows/cold-load-resume/02-after-cold-load.txt · a clinical-style note "harness: felt solid, no groin pain" renders on a non-rehab persona's session; not found in src, so likely fixture or seeded data, verify · [BEFORE-SCALE]
- POLISH · persona-pullup/flows/session-exercise-details/01-exercise-details.png · the Dead hang sheet is clear (passive, 4 sets · 20s hold, plain "Setup" cue) but the sheet sits under a dim overlay with the set row still visible · [LATER]
- POLISH · persona-pullup/flows/session-note-sheet/01-note-sheet.png · "Not now" and "Save to Ring row" compete as near-equal buttons; "Pain or tweak" lives only in this optional sheet · [LATER]

Good:
1. Exercise details sheet: plain "Setup" cue, clear "4 sets · 20s hold" summary, one close control.
2. Editing a past set: tapping the pip reopens it with a LAST TIME / PRESCRIBED comparison, so the context is visible.
3. Video failure is at least handled: the modal states "no embedded demo" and offers a search, not a blank frame.

Not checked: pullup session-video/session-edit-past-set beyond text; strength session-note-sheet and session-exercise-details images (text only); mobile 375px and desktop; whether YouTube embed loads in production; cold-reload root cause (code not traced); the "harness" note source in data files.
