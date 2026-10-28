# Rescore P1 03 Copy density (after redesign P1, 688de55)
Evidence: A-first-run 06-intake-02/03, 07-today-day-1, 08-first-session; C-viewport-375 02-plan-top, 04-record-top; persona-csm-d2/mobile/01-day.png (15:06, local build). Session-done not scored (not captured). Note: A-first-run 06-intake-04 and 07 are identical.

Scores (round 1 -> P0 -> now): text density 6 -> 8 -> 8 | text size 8 -> 8 -> 8 | visual richness 6 -> 8 -> 8 | consistency 6 -> 7 -> 8

## What improved
- Session brief: the three "How to run this" cards are gone from view. Exercises come first. Header is "5 exercises · about 32 min · +1 optional", and the monospace footer is now a sans line "Hang, scap, row base · week 1 of 8 · ends 22 Dec".
- Your plan: consent is two shorter checkboxes (about 33 words, down from about 55). The H1 "Your plan" exists, with the program name beneath it.
- Plan page: the intro and the Mixed practice card are plain ("each session mixes 2-3 drills for the parts still holding you back"). "Pull-Up" spelling is consistent in the headers. Rest days show as "Rest".
- Today hero card (csm-d2): "1 block · 1 exercise", "about 45 min", week strip, one CTA "Open session". Mono is now only on numbers. Nav labels are title case and match their H1s.

## Still wrong
- [H] 06-intake-03 Your plan: stepper labels are still 3-4 lines of 10px centred text ("Hang estab-lished, no strict rep yet"), and the hyphenation breaks the word. → "No hang / Hang / 1 rep / Reps"; put the long text in a line under the stepper.
- [H] 06-intake-02 Safety: two stacked 20-25-word questions, and the elbow answers wrap onto 2 rows. → "Shoulder pain in the last 12 months?" and "Elbow tendon pain?", each with chips.
- [H] csm-d2 Today: 4 cards before the workout (plan-built, Lighter lifts, Workout ready, Rescheduled), and "Because: Signal: life load 5/10" is awkward and has a double colon. Today has the hero card but it sits below the fold. → Move the hero up, drop "Your plan is built" after the first view, and write "Life load 5/10 this week. Trim the top set 5%?".
- [M] 06-intake-03: "Typically by week 8: 25-45 second dead hang, first clean scapular pulls, and 5-10 strict feet-elevated ring rows." is unchanged jargon. → "By week 8: a 25-45 s hang and your first clean pulls."
- [M] 06-intake-03: two consents are still two checkboxes, and the second repeats the first (shoulder). → One line: "Not medical advice. I'll stop if my shoulder hurts."
- [M] 08-first-session: "Follow along · Row strength — closed-chain pull" and "Scapular pull ladder" are jargon in block titles. → "Rows" and "Scap pull-ups".
- [M] 375 Plan: Mon "Skipped" shows a struck-through "Rest / accessory day" with an Unskip link. It is still a tone risk. → "Rest day", with no strike-through and no Skipped label.
- [M] 375 Plan: the intro is still "The 7-day rhythm. Browse other days, move sessions, skip a day — all from here." → "Move or skip any day."
- [L] 375 Record: the legend mixes the completion and symptom scales (Done/Amber/Red-flag/Rest or missed). "2 amber · 1 red" is still jargon. → Two legends, "Session" and "Check".
- [L] Quick start 06-intake-03: "Detailed setup (about 5 min)" repeats on the final step. → Step 1 only.

## P2 should do first (copy lens)
1. Intake: stepper labels, safety questions, one consent, and a plain week-8 line. This is still the densest screen.
2. Today: cut the stack of cards before the workout and reword the Because/Signal strings.
3. Plan and Record: remove the strike-through, split the legend, and drop the "engine" jargon in block names.
