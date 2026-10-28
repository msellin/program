# Rescore 03 Copy density (after redesign P0, e6f1139)
Evidence: A-first-run 05-09, C-viewport-375 02-plan-top and 04-record-top. Note: the A-first-run filenames are offset. 06-intake-03 is the "Your plan" screen and 06-intake-04 is Today day 1.

Scores (round 1 -> now): text density 6 -> 8 | text size 8 -> 8 | visual richness 6 -> 8 | consistency 6 -> 7

## What improved
- Program page above the fold: figure, "CITED" pill, title, one-line pitch (14 words), 3 stat tiles and Start free. Round 1 had about 250 words. Section copy now sits below the fold or collapsed.
- Quick start is 3 steps: "Step 1 of 3 / Where are you today?" Answers are plain ("No hang yet"). "TIER A/B" is gone, and so is the 41-word ring-row question.
- Safety: "None of these" comes first. "This is screening, not a diagnosis." is one line and fits the tone.
- Your plan: a level stepper with the user's level highlighted, which is the visual I asked for. Weeks, minutes and days are tiles.
- The "Four tabs" card is gone. Today day 1 is one card with one CTA, "Start your first session", plus a quiet "Do a morning check first". The setup copy is 20 words.
- One step counter ("Step 1 of 3") replaces the doubled "3 / 16".

## Still wrong
- [H] 06-intake-02 Safety: the screen has an elbow question and a shoulder question stacked (3+ questions at about 25 words each) under "None of these". → Show 1 line per region ("Shoulder pain, last 12 months?") with a chip. Keep "None of these" pinned on top.
- [H] 06-intake-03 Your plan: the two consent checkboxes total about 55 words ("I understand this is a training template, not medical advice. I'll consult a clinician for shoulder or elbow pain that persists past a session."). → One checkbox, 14 words: "I get it: this is training, not medical advice. I'll stop if my shoulder hurts."
- [H] 06-intake-03 Your plan: the title "First Strict Pull-Up" is small and grey, and the page has no H1 or "Your plan" heading in view. → Add an H1, "Your plan", and make the title the second line.
- [H] 06-intake-03 Your plan: the stepper labels are 3-4 lines of centred 10px text. "Hang established, no strict rep.." is truncated with ".." and the 4th label wraps in 4 lines. → Use short stepper labels: "No hang", "Hang", "1 rep", "Reps". Keep the long form in the selected-level line.
- [M] 06-intake-03: "Typically by week 8: 25-45 second dead hang, first clean scapular pulls, and 5-10 strict feet-elevated ring rows." uses jargon (scapular pulls, ring rows) for a beginner. → "By week 8: a 25-45 s hang and your first clean pulls."
- [M] 08-first-session: "HOW TO RUN THIS" still shows three unlabelled cards with bare sentences. "Feet-elevated ring row / inverted row." and "The neuromuscular precursor to a pull-up." are unchanged. → Label each card with its exercise name, or delete the section. The exercise list is below it.
- [M] 08/09 session brief: the footer "HANG, SCAP, ROW BASE · WEEK 1 OF 8 · ENDS 22 DEC" is still monospace jargon, 2 lines, sitting above Start session. "guided, one at a time, with a timer" repeats on each Follow along block. → Delete the footer. Say "guided with a timer" once.
- [M] 375 Plan: "Mixed practice · Post-acquisition: engine interleaves 2-3 drills per session across the weakest capabilities." is unchanged jargon. The "7/8" line shows "FIRST STRICT PULLUP", where the program page says "Pull-Up". The Plan intro is a 2-line explainer. → "Each session mixes 2-3 drills on your weakest areas." Fix the name drift.
- [M] 375 Plan: "Mon 26 Oct Skipped / Rest / accessory day" struck through, with an Unskip link, is a tone risk. The session name has no value when it is a rest day. → Show "Rest day" with no strike-through.
- [L] 375 Record: "1 green · 2 amber" still reads as a jargon pair. The legend "DONE / AMBER / RED-FLAG / REST OR MISSED" mixes two scales (completion and symptom). → Dots only in the row. Split the legend into "Session" and "Check".
- [L] Program page: the "CITED" pill is still unexplained on cards and detail (05-program-detail). → Show it only on proposals.
- [L] The 06-intake-01 and 06-intake-03 footer link "Detailed setup (about 5 min)" repeats on every step. → Show it on step 1 only.

## P1 should do first (copy lens)
1. Trim the Your plan screen: the consent to one checkbox, short stepper labels, an H1, and plain-language expectations.
2. Cut the session-brief jargon: label the "How to run this" cards or remove them, and delete the monospace footer.
3. Sweep the user-facing terms (engine, capability, post-acquisition, arc, tier) from Plan and the coach cards. Fix "Pull-Up" vs "Pullup".
