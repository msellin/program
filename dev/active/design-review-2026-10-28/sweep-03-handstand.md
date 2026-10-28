# Sweep 03: handstand personas (2026-10-28)

Scope: `persona-handstand` (all 33 mobile and all 69 flow screens), plus the screens that differ in
`persona-handstand-fast`, `-d2` and `-wrist` (12 each, chosen by what changed), and the .txt extracts of
all four. Screens were judged as 4-up contact sheets to stay in the image budget. Tall pages were judged
from their top 1,700px and their .txt (`mobile/20-evidence.png`, `21-legal-privacy.png`, `22-legal-terms.png`).

## Cross-persona

- [B] persona-handstand/mobile/05-progress.png — Retest figures conflict: Progress "No readings yet", Record 1:52, Report 12s to 19s → one retest source feeding all three; same also in persona-handstand-fast/mobile/05-progress.png and persona-handstand-wrist/mobile/10-report.png (16s vs Record 1:40).
- [B] persona-handstand/flows/hip-check/02-answered.png — Personal rehab check (groin at rest, SLR, hanging leg raise) reachable from catalog program → gate to the personal program only.
- [H] persona-handstand/mobile/01-today.png — Week counters disagree (7/9, 4/6, 9/9, 1/6 for one program) → derive week and progress from one source.
- [H] persona-handstand/mobile/08-profile.png — Program "8 weeks" but Today says "Week 7 of 9" → one duration everywhere.
- [H] persona-handstand/mobile/01-day.png — Brand header is big "terav." here, small "TERAV" on 01-today → one lockup in the app header.
- [H] persona-handstand/mobile/01-day.png — Bottom tab reads "DAY" here, "TODAY" on 01-today → one tab label.
- [H] persona-handstand/mobile/10-report.png — Internal id "tier_a_foundation" shown (also 05-progress.png) → show "Tier A foundation" or drop the line.
- [H] persona-handstand/mobile/10-report.png — "sim:" seed tag in "Overhead pressing — sim: shoulder flagged" → drop tag; write plain intake note.
- [H] persona-handstand/flows/programs-info-sheet/01-info-sheet.png — "author's own clinical context" and a long VERIFIED essay shown to every user → cut to one line.
- [H] persona-handstand/flows/program-preview/02-expanded.png — Phase dates read 2026-01 to 2026-03 for a program running now → recompute dates from the start date.
- [M] persona-handstand/mobile/06-programs.png — Heading "3 PROGRAMS · LIVE NOW" while list shows COMING SOON items → count live programs only.

## persona-handstand: mobile (33)

- [H] persona-handstand/mobile/01-today.png — Sticky "Apply 5% lighter / Ignore" bar covers the shoulder-pain card → add bottom padding above the bar.
- [H] persona-handstand/mobile/01-today.png — "Week 4 of 6, ends 6 Sept" contradicts 01-day "Week 7 of 9" → one week counter.
- [H] persona-handstand/mobile/01-today.png — Footer "order shuffled by the seed. Shea & Morgan 1979." is internal copy → plain sentence, citation to Evidence.
- [M] persona-handstand/mobile/01-today.png — Progress-load dot row has no label or legend → label it or remove the dots.
- [M] persona-handstand/mobile/01-day.png — "Advance to Tier B — Wall handstand established" is jargon → "Move up: wall handstand".
- [H] persona-handstand/mobile/02-week.png — Week of 17 to 23 Aug labelled "This week" → label only the current week.
- [H] persona-handstand/mobile/02-plan.png — "Interleaved practice (post-acquisition)… plan generator… capabilities" paragraph is dense jargon → one plain sentence.
- [H] persona-handstand/mobile/04-history.png — "45 active days" with every row "0 done"; heatmap all green → define active; green only for done days.
- [M] persona-handstand/mobile/04-history.png — Symptom sparkline "LOW BACK" has no axis or scale → label it or hide when empty.
- [M] persona-handstand/mobile/04-history-redirect.png — Chart captured stuck on "Loading chart..." → show a skeleton that resolves, or an empty-state line.
- [M] persona-handstand/mobile/04-history-redirect.png — Deltas unitless ("+12.0", "Avg 1:49 +9.0") beside times → show units, e.g. "+12s".
- [H] persona-handstand/mobile/05-progress.png — Card "Week of 17 Aug / This week so far" is a stale week → use the current week.
- [H] persona-handstand/mobile/05-progress.png — "Target 0 m · stretch 0 m" for handstand walk → set a real target or hide the card.
- [M] persona-handstand/mobile/05-progress.png — "Sessions 0 / 0" beside "0/51 done · 0%" → one adherence definition.
- [H] persona-handstand/mobile/05-progress.png — Retest cards say "No readings yet" while Record shows readings → see cross-persona B.
- [M] persona-handstand/mobile/06-programs.png — Engine & endurance group gets a green left bar → drop it; bars are status-only.
- [M] persona-handstand/mobile/06-programs.png — "~1.5-2 hr/week (5 sessions/wk, 4 on Foundation…)" wraps raggedly in mono → duration on its own line.
- [H] persona-handstand/mobile/07-programs-active.png — Four long "Section 1-4 of 4" prose cards before any action → one short summary and a CTA.
- [M] persona-handstand/mobile/07-programs-active.png — "a few minutes on the wizard" is jargon → "Answer 14 questions and do 5 short tests".
- [M] persona-handstand/mobile/08-profile.png — Away-day dates in dd.mm.yyyy inside English UI → use one locale for dates.
- [M] persona-handstand/mobile/10-report.png — "Load progression: nothing logged" dead section for a skill program → hide when empty.
- [H] persona-handstand/mobile/11-guide.png — 4,500px glossary of strength and endurance terms for a handstand user → show only terms this program uses.
- [H] persona-handstand/mobile/11-guide.png — "9 = one rep left" contradicts example "could have done 5 more" → correct the worked example.
- [H] persona-handstand/mobile/11-guide.png — "These are the bottom-nav labs" typo → "tabs".
- [H] persona-handstand/mobile/12-extras.png — "Friday 21 Aug · Today" wrong date label → date defaults to real today.
- [M] persona-handstand/mobile/12-off-plan.png — "Extra drills live in your sessions now" reads as a dead end → add a link to today's session.
- [H] persona-handstand/mobile/14-check-hip.png — Hip-check route renders Today, not the check → fix the route or remove the link.
- [M] persona-handstand/mobile/13-check.png — Sticky "Update check" bar covers the Low back row → add bottom padding.
- [M] persona-handstand/mobile/13-check.png — "Saved. Today's plan is adjusted." with no visible change → show what moved.
- [H] persona-handstand/mobile/03-coach.png — Route renders a white 404 with an older nav → dark 404 with app nav and home link.
- [H] persona-handstand/mobile/15-events.png — White 404 page with nearly invisible header → dark 404 with home link.
- [M] persona-handstand/mobile/15-settings.png — Theme and language rows say "coming soon" → hide until shipped.
- [M] persona-handstand/mobile/16-session-today.png — "Wrist extension prep on floor" listed twice on one screen → show once, marked MAIN.
- [M] persona-handstand/mobile/16-session-today.png — "ENDS 14 NOV" eyebrow wraps to three mono lines → shorten the eyebrow.
- [M] persona-handstand/mobile/16-session-today.png — Three prose "How to run this" cards sit above the sets → collapse behind a disclosure.
- [H] persona-handstand/mobile/17-session-past.png — Past "Sunday" session offers "Start" like today → show a missed state and log-missed option.
- [M] persona-handstand/mobile/18-session-future.png — Rest-day card cut off at the top with no header → fix top padding and add a title.
- [H] persona-handstand/mobile/19-intake.png — Answers carry internal labels "TIER A / B BOUNDARY" → drop labels; ask in plain words.
- [M] persona-handstand/mobile/19-intake.png — Progress label "WHERE YOU ARE …" truncated → shorten it.
- [M] persona-handstand/mobile/19-intake.png — 19 steps before the first session → cut to essentials or allow skipping.
- [M] persona-handstand/mobile/20-evidence.png — "CITED" pill repeated on every row → state the status once in the header.
- [H] persona-handstand/mobile/21-legal-privacy.png — "will be lawyer-reviewed before public launch" visible to ad visitors → finish review or drop the line.
- [M] persona-handstand/mobile/21-legal-privacy.png — Retention column so narrow that words wrap one per line → widen or stack rows.
- [M] persona-handstand/mobile/22-legal-terms.png — "What you agree to" and "What we agree to" are near-duplicate headings → merge into one.

## persona-handstand: flows (69)

- [H] persona-handstand/flows/activity-log-sheet/02-activity-form.png — "no LLM, just a keyword parser, all done on-device" explains internals to users → one plain sentence.
- [M] persona-handstand/flows/activity-log-sheet/02-activity-form.png — "Optional note — WOD name" is CrossFit jargon → "Optional note".
- [M] persona-handstand/flows/activity-log-sheet/03-activity-options.png — "Session-specific primer + cool-down" is jargon → "Warm-up and cool-down".
- [M] persona-handstand/flows/cold-load-resume/03-day-tab-respected.png — "Random practice… Shea & Morgan 1979" citation note in live UI → move to Guide.
- [H] persona-handstand/flows/onboarding-first-run/01-first-run.png — First-run capture shows Week 7 of 9 and a tier-up nudge → verify seed; show a real first-run state.
- [H] persona-handstand/flows/plan-move-commit/02-moved.png — "Moved to 2026-10-26" raw ISO date → "Moved to Mon 26 Oct".
- [H] persona-handstand/flows/plan-skip-commit/01-skipped.png — Toast "Skipped 3 sessions on 2026-10-28" after one skip → count one session, format date.
- [M] persona-handstand/flows/plan-skip-confirm/01-skip-confirm.png — "The engine reads that as an intentional off-day" → "Counts as a planned rest day".
- [M] persona-handstand/flows/program-preview/02-expanded.png — "Yiou 2017 CoP-shift work informs" is jargon in a phase note → plain summary, citation to Evidence.
- [M] persona-handstand/flows/program-preview/01-program-detail.png — "wizard" and "Personalised" copy in setup card → "Answer 14 questions and 5 short tests".
- [M] persona-handstand/flows/session-cold-reload/01-mid-set.png — Top rail labels truncate ("Downward-…", "Child's") with "Something hurt" crowding them → shorter labels, move the hurt button.
- [H] persona-handstand/flows/session-edit-past-set/02-editing-past-set.png — Timed 30s hold edited as "1 rep" → show seconds for timed sets.
- [H] persona-handstand/flows/session-edit-past-set/03-stepper-open.png — Stepper "STEPS OF 1 REP" on a hold → step in seconds.
- [M] persona-handstand/flows/session-edit-past-set/07-back-to-brief.png — "How was that? Easy RPE 7 / Solid RPE 8" is jargon → "How hard was that?" with plain labels.
- [H] persona-handstand/flows/session-exercise-details/01-exercise-details.png — "3th at prescription" ordinal bug → "3rd"; fix the ordinal helper.
- [H] persona-handstand/flows/session-overflow-sheet/01-overflow-sheet.png — Same "3th" ordinal bug in overflow → same fix.
- [H] persona-handstand/flows/session-finish-here/02-finished-here.png — After Finish here, Today still offers Start with no done state → show a session-complete state.
- [M] persona-handstand/flows/session-follow-along/02-guided-ready.png — Tutorial area is an empty black box with one line → hide it or add a still frame.
- [M] persona-handstand/flows/session-follow-along/02-guided-ready.png — "BOTH" pill has no explanation → label it or hide it for this move.
- [L] persona-handstand/flows/session-follow-along/02-guided-ready.png — "Something hurts" here, "Something hurt" in top bar → one label.
- [M] persona-handstand/flows/session-follow-along/05-guided-done.png — "flush done · 0 sets logged" reads as success with nothing done → show count or drop the line.
- [M] persona-handstand/flows/session-hurt-stop/02-hurt-sheet.png — "Stop session" in yellow, not the bronze primary → use the app's stop style.
- [M] persona-handstand/flows/session-note-sheet/01-note-sheet.png — "Save to Downward-dog wrist recovery" wraps to two lines → "Save note".
- [M] persona-handstand/flows/session-note-sheet/01-note-sheet.png — "The engine reads this when it plans next week" → "Used to plan next week".
- [M] persona-handstand/flows/session-overflow-sheet/04-video.png — "Watch the lift" opens "No embedded demo yet" → hide the row when no demo exists.
- [M] persona-handstand/flows/session-overflow-sheet/05-form-cues.png — "Form cues and warnings" opens a sheet titled "Setup" → rename it or show cues.
- [M] persona-handstand/flows/session-video/01-video-modal.png — Video modal is only a YouTube search link → embed a demo or hide the entry.

## persona-handstand-fast (12 changed screens, plus text)

- [H] persona-handstand-fast/mobile/01-today.png — "Week 6 of 6, ends 22 Aug" (a past date) beside "Week 8 retest due" → one week counter, future end date.
- [H] persona-handstand-fast/mobile/01-today.png — Sticky "Log reading / Ignore" bar covers the shoulder card → same bottom-padding fix.
- [H] persona-handstand-fast/mobile/01-today.png — Retest card says "Week 9 · log Wall handstand hold (seconds)" → match the metric the retest uses.
- [H] persona-handstand-fast/mobile/04-history.png — "60 active days" in the list, "54 active total" in the heatmap, rows "0 done" → one count and definition.
- [H] persona-handstand-fast/flows/retest-logging/01-retest-proposal.png — Header "Week 9 of 9" over "Week 8 end-of-block retest is due" → match the week.
- [H] persona-handstand-fast/flows/retest-logging/01-retest-proposal.png — Retest card and tier-up card stack two primary CTAs → one primary action at a time.
- [H] persona-handstand-fast/flows/retest-logging/02-retest-sheet.png — "Recorded 2026-10-28" raw ISO date → "Recorded today, 28 Oct".
- [M] persona-handstand-fast/flows/retest-logging/02-retest-sheet.png — Intensity placeholder cut off at "prescri…" → shorter placeholder.
- [H] persona-handstand-fast/flows/plan-skip-commit/01-skipped.png — "Skipped 3 sessions on 2026-10-26" after one skip → count one, format date.
- [H] persona-handstand-fast/flows/plan-move-commit/02-moved.png — Wednesday is skipped and moved, yet Today still offers Start → hide Start on skipped days.
- [H] persona-handstand-fast/flows/cold-load-resume/03-day-tab-respected.png — "Week 6 of 6" and "6/6" beside "9/9" elsewhere → one progress source.
- [M] persona-handstand-fast/flows/activity-log-sheet/03-activity-options.png — Sheet title and body say "Around your session" for a primer list → use "Warm-up and cool-down".

## persona-handstand-d2 (12 changed screens, plus text)

- [H] persona-handstand-d2/mobile/01-day.png — "Week 0 — Exits before line" phase shown as "Week 1 of 9" → show phase and week as separate labels.
- [H] persona-handstand-d2/flows/cold-load-resume/03-day-tab-respected.png — "Week 1 of 1 · ends 31 Oct" with "Start your first session now" above "Rest day" → one state per day.
- [H] persona-handstand-d2/mobile/01-day.png — Plan card says "4 sessions/wk" while profile and programs say 5 → one number.
- [M] persona-handstand-d2/mobile/16-session-today.png — Single-exercise session leaves a large empty area → tighten the layout or add context.
- [M] persona-handstand-d2/flows/session-follow-along/02-guided-ready.png — "LEFT · Set 1/5 · Step 1/10" mixes sets and steps → "Side 1 of 2" or drop step.
- [M] persona-handstand-d2/mobile/02-plan.png — "Wall cartwheel exit" repeated on Mon, Fri and Sun with no variation → show the exit once with a count.

## persona-handstand-wrist (12 changed screens, plus text)

- [H] persona-handstand-wrist/mobile/01-day.png — "Consider a tier-up on Progress" but Progress has no tier-up control → add the control or drop the advice.
- [H] persona-handstand-wrist/flows/cold-load-resume/03-day-tab-respected.png — "Eased today by 5% because you felt of…" with "felt off+1 more" garbled elsewhere → fix the copy template.
- [H] persona-handstand-wrist/mobile/10-report.png — Wall hold 12s to 16s here, Record "Base 1:40 · Now 1:40" → one retest source.
- [H] persona-handstand-wrist/mobile/04-history-redirect.png — Trend chart shows "Avg 1:40 0.0" from one event → hide trend until two readings exist.
- [M] persona-handstand-wrist/mobile/13-check.png — "Saved. Today's plan is adjusted." with no visible change → show what moved.
- [M] persona-handstand-wrist/mobile/16-session-today.png — "Week 4 of 9" today beside "Week 3 of 9" on the past session → one counter per date.

## Scores (10 = best)

- Text density: 3
- Text size: 6
- Visual richness: 3
- Consistency: 3

Checked: 138 screenshots (persona-handstand 102, plus 12 changed screens each in fast, d2 and wrist), in 35 image views.
