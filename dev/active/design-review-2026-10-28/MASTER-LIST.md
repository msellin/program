# MASTER LIST: design/defect review (2026-10-28)

<!-- SUPERSEDED-BY: dev/active/ROADMAP.md -->
> **Not maintained since 2026-10-30.** The one task list is `dev/active/ROADMAP.md`. Every open item here was
> checked against the code (`dev/active/roadmap-reconcile/`) and the live ones moved there. Statuses below are history.


Merged from the lead verdict, reviewers 01-06 and sweeps 01-05 (~494 raw findings). Severity: B ads-blocker, H fix this week, M soon, L polish. Status: VERIFIED (checked in code or extracts), CORROBORATED (2+ independent sources, not code-traced), UNVERIFIED, PARTIAL, DESIGN-DECISION. Kind: D = defect, VG = visual-gap (needs imagery or charts), D+VG both. Screens use the sweeps' paths (A = launch-readiness/screens/gaps/A-first-run, C = .../C-viewport-375|393, P = next-app/tests/e2e/artifacts/personas).

**Read first: capture freshness.** 497 of the 3,438 persona PNGs predate Oct 2026 (Aug captures of retired routes) and ~895 predate Oct 28. About 70 raw sweep findings, including two raw B, cite Aug files. They sit under 'Needs recapture' and are not in the counts. The harness should delete orphaned captures (01-today, 02-week, 03-coach, 04-history, 05-progress, 12-extras, 15-events) so the next sweep cannot read them.

## Counts (kept items)

| Severity | Today | Session | Intake | Plan | Record | Report | Programs | Profile | Check | Nav/global | Copy | Data-consistency | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| B | 1 | 1 | 1 | - | - | - | 1 | - | - | - | - | - | 4 |
| H | 3 | 4 | 4 | - | 1 | 3 | 2 | - | - | 1 | 6 | 7 | 31 |
| M | 4 | 11 | 4 | 5 | 4 | 2 | 6 | 2 | 3 | 4 | 4 | - | 49 |
| L | - | 1 | 1 | - | 1 | - | 1 | - | - | 1 | 1 | - | 6 |
| **All** | 8 | 17 | 10 | 5 | 6 | 5 | 10 | 2 | 3 | 6 | 11 | 7 | 90 |

Visual-gap items (need imagery or charts): 3. Rejected/not-defect clusters: 11. Needs-recapture clusters: 3 (~70 raw findings).

## Blockers (B)

### Today

- **M-001** [B] [D] Day-1 Today: 'Four tabs' tour card and a Setup card push the first session below the fold at 375.  
  Screens: A-first-run/07-today-day-1  
  Fix: Delete `FirstRunBanner` (mounted at `session/TodaySession.tsx` L304); the nav labels already say it.  
  Status: VERIFIED (`components/FirstRunBanner.tsx` L52)

### Session

- **M-002** [B] [D+VG] Session player media box is ~25% of the screen and shows only a text line when a drill has no figure.  
  Screens: persona-pullup/flows/session-follow-along/02,03; session-log-set/02-set; persona-muscleup, persona-handstand follow-along  
  Fix: When `step.figure` is absent, collapse the box (name + cue move up, 'Full tutorial' becomes a link). Then add figures to the ~8 pull-up and ~8 handstand drills.  
  Status: VERIFIED (`follow-along/FollowAlong.tsx` L329-343: always-rendered `aspect-video` box with text fallback)

### Intake

- **M-003** [B] [D] Intake answers print 'TIER A / A-B / B-C' hints; questions run 40+ words; 16 steps with no time estimate.  
  Screens: A-first-run/06-intake-01,03; persona-pullup/19-intake; handstand, muscleup, csm-red 19-intake  
  Fix: Do not render `opt.hint` on the ad programs; one-line question + helper of at most 12 words; show '~3 min' on step 1.  
  Status: VERIFIED (`intake/IntakeClient.tsx` L1098-1110 renders `opt.hint` for calibration steps)

### Programs

- **M-004** [B] [D] Program detail: ~250 words in four 'Section n of 4' cards and no Start button in the first viewport.  
  Screens: A-first-run/05-program-detail; persona-pullup/07-programs-active; handstand 07  
  Fix: Sticky 'Start free' bar; cut to ~80 words, 'How it works' collapsed; drop 'Section n of 4'.  
  Status: VERIFIED (`programs/[slug]/ProgramPreviewClient.tsx`: Start buttons are in-flow at L557+, no sticky)

## Fix this week (H)

### Today

- **M-005** [H] [VG] Today and the first post-sign-in screen have no hero: title, bar and prose; ~60% blank on first screen. No image of a person, movement or program anywhere on the stranger path (all 6 reviewers).  
  Screens: A-first-run/01,03,04,05,07; persona-*/01-day  
  Fix: One cover image per advertised program on card, detail and day-1 header; Today hero card = today's focus + figure + one metric (Whoop/Runna pattern).  
  Status: CORROBORATED (all reviewers, 4 sweeps). Owner decision on assets

- **M-006** [H] [D] Proposal copy: 'Advance to Tier B - Wall handstand established' and 'Your latest retest clears Tier B - Wall handstand established's threshold' (broken grammar); 8-word button; three different accept/dismiss pairs ('Apply bump/Ignore', 'Do it/Not now', 'Apply 5% lighter/Not now').  
  Screens: persona-handstand/01-day; persona-strength/01-today (Aug); lead verdict  
  Fix: Build the sentence from a level name, not the tier label (`lib/proposals/select.ts` L315); one pair 'Accept / Not now'; button 'Move up'.  
  Status: VERIFIED (select.ts L315 interpolates `tierLabel` containing an em-dash phrase)

- **M-007** [H] [D] Brand lockup differs between screens (big 'terav.' vs spaced 'TERAV').  
  Screens: persona-pullup session-controls/05; handstand 01-today vs 01-day  
  Fix: One header component.  
  Status: UNVERIFIED (Aug capture 01-today predates the D-02 header rule; Oct-27 flows still show 'TERAV')

### Session

- **M-008** [H] [D] Session brief: three unlabeled 'how to run this' prose cards before the exercises; 2-line mono phase footer; sticky footer (extra-session link + caption + Start) takes ~28% of 375x667; 'guided, one at a time, with a timer' repeated 3x; nested scroll regions clip rows.  
  Screens: A-first-run/08,09; persona-pullup/session-log-set/01-brief; persona-handstand/16-session-today  
  Fix: Start button + nav only in the footer; fold cues into each exercise; phase line into header; one line '5 exercises, ~32 min'; show 3 rows then '+N more' without inner scroll.  
  Status: CORROBORATED (01,02,03,04,06 + sweeps 01-04, Oct-28 captures)

- **M-009** [H] [D] 'N SETS LEFT' under an exercise is the session-wide total, so a 5-set exercise reads 9/10/17 left.  
  Screens: persona-csm-red session-log-set/02-set, session-controls/01-set; persona-recover, persona-strength (Oct 27/Aug)  
  Fix: Show per-exercise 'Set 2 of 5' there; keep the session total in the header only.  
  Status: VERIFIED (`session/SetView.tsx` L292-299 sums `railExercises`)

- **M-010** [H] [D] Finish screens congratulate zero work ('Dead-hang ladder done - 0 sets logged', 'Home rehab done - 34 skipped') and give no payoff; the Plan/Today state after finish still offers Start.  
  Screens: persona-pullup-fast, persona-muscleup, persona-handstand, persona-recover session-follow-along/05-guided-done; session-finish-here/02  
  Fix: Show counts, a neutral 'Nothing logged' state and a real summary; hide Start once the day is done.  
  Status: UNVERIFIED in code (4 personas, mixed Oct 27/28 captures)

- **M-011** [H] [D] Extra session (off-plan) offers dead hang and active hang on a red shoulder day, directly under a rest card that says 'No hanging'.  
  Screens: C-viewport-375/10-off-plan-top, C-viewport-393/10-off-plan-top (+bottom)  
  Fix: Filter drill-library rows by the active red-flag region (reuse `lib/symptom-state`), or show a one-line warning on matching rows.  
  Status: VERIFIED (`offplan/OffPlanSession.tsx` has no symptom filtering). Downgraded B to H: it logs work already done, not a prescription

### Intake

- **M-012** [H] [D] Intake is 16-23 steps (pull-up 16, handstand 19, engine/graduate 23): four screening questions, then five physical tests with paragraph instructions, before any value; 'Skip physical tests' is the only escape and is low contrast.  
  Screens: A-first-run/06-intake-04..15; persona-handstand/19-intake; persona-graduate/19-intake  
  Fix: Skip tests by default and retest in week 1; cut ad-path intake to ~7 steps; one step counter.  
  Status: VERIFIED (tests optional in code, `IntakeClient.tsx` L1484; step counts from captures). Product call

- **M-013** [H] [D] Intake result: recommends 'Tier D' though answers only define A to C+; explain-back text hides under the sticky Start bar; 'By week 8: 8-10 strict pull-ups unbroken' on the result sits beside 'not guarantees' on the landing.  
  Screens: A-first-run/06-intake-17  
  Fix: One level vocabulary; bottom padding above the sticky bar; drop or cite the outcome number.  
  Status: VERIFIED (outcome string in `first-strict-pullup.json` L496; 'hidden under bar' from capture only)

- **M-014** [H] [D] Intake header labels truncate at 375 ('WHERE YOU ARE...', 'PHYSICAL TES...', 'INTAKE - CONCURRENT-STRENGTH MAINTENAN...') and the step count appears twice (header + footer); program page promises 11 questions while intake says 16.  
  Screens: A-first-run/06-intake-01,11-15; persona-*/19-intake  
  Fix: Shorten labels, keep one counter, make the counts agree.  
  Status: CORROBORATED (6 personas, Oct 28)

- **M-015** [H] [D] Sign-up gates every button behind three consent ticks plus a bot check that runs before any tick; step 16 of intake then asks consent again.  
  Screens: A-first-run/02-sign-up-page-not-submitted; 06-intake-16  
  Fix: Owner option (SG-02): merge terms + 16+ into one tick; Art. 9 health consent stays separate. Start the captcha on submit; merge intake-16 consent wording.  
  Status: DESIGN-DECISION (compliance; kept as H for the owner, not an ads-blocker)

### Record

- **M-016** [H] [D] Record history is 30+ tiny mono rows with mixed 'logged / done / 1 run'; progress is a status grid not a line; strength story not the hero.  
  Screens: persona-pullup 05b-record, 04-history-redirect; C-viewport-393/04-record-*  
  Fix: Progress line as hero; collapse history by week; one status word.  
  Status: CORROBORATED (01, 02, 05)

### Report

- **M-017** [H] [D] Report prints the raw tier id: 'Tier target: tier_a_hang / tier_a_foundation / tier_a_prep'.  
  Screens: persona-pullup, handstand, muscleup, engine, csm-red mobile/10-report  
  Fix: Map id to the tier label before printing.  
  Status: VERIFIED (`components/progress/RetestMetricsPanel.tsx` L56 prints `${userTier}`)

- **M-018** [H] [D] Report shows 'Target 0 reps, stretch 1' for a pull-up program (and 0 m / 0 kg elsewhere).  
  Screens: persona-pullup, muscleup, handstand 10-report  
  Fix: Render 'first rep' for 0-targets or hide the target when it is 0.  
  Status: VERIFIED (`first-strict-pullup.json` retest_metrics[0]: tier_a_hang target 0, stretch 1)

- **M-019** [H] [D] 'Status: graduated' is printed beside a red 'Below target' chip on the same card.  
  Screens: persona-pullup-fast, persona-muscleup 10-report  
  Fix: Derive the status line from the same verdict, or drop it.  
  Status: VERIFIED (`report/page.tsx` L885 hardcodes 'graduated')

### Programs

- **M-020** [H] [D] Programs catalog is text-only cards with CITED pills, a native unstyled sort select and a chip row for three open programs; reads as a directory, not a shelf.  
  Screens: A-first-run/04-programs; C-viewport-*/06-programs  
  Fix: Cover art per program; drop sort and filter while fewer than ~6 open programs.  
  Status: CORROBORATED (visual-gap, 01, 05, 06)

- **M-021** [H] [D] 'END PROGRAM' sits beside 'GO TO TODAY' at equal weight.  
  Screens: persona-pullup 07-programs-active; csm-red program-preview/02  
  Fix: Demote to a text link away from the primary.  
  Status: PARTIAL: a confirm sheet exists (`ProgramPreviewClient.tsx` L709), so the 'no confirm' half is false; placement stands

### Nav/global

- **M-022** [H] [D] Legal pages: privacy table crushed at 393 (three columns); 'will be lawyer-reviewed before public launch' visible to ad visitors.  
  Screens: persona-pullup 21-legal-privacy, 22-legal-terms; handstand, csm-red  
  Fix: Stack rows as cards; remove or soften the review line before ad traffic.  
  Status: CORROBORATED (3 personas, Oct 28)

### Copy

- **M-023** [H] [D] Internal vocabulary reaches users: tier, multi-tier, arc, engine, capability, sub-capability, wizard, closed-chain, proxy, 'PR-banned', 'Post-acquisition: engine interleaves...', 'The engine reads these...', 'Cooked'.  
  Screens: A-first-run/01,04,05,06; C-viewport-375/02,05; persona-*/06-programs, 02-plan, 13-check  
  Fix: One glossary: 'level' for tier; delete arc/engine/capability/wizard from UI copy; plain rewrites listed in 03-copy-density.  
  Status: VERIFIED (strings present, e.g. `EngineReadsNotesHint`, plan banner; 10+ screens)

- **M-024** [H] [D] Mono overuse and 11px eyebrows carry sentences: phase footer, chips, 'LOAD 30 MORE', Levels line, overflow descriptors, bottom-nav labels.  
  Screens: A-first-run/08,09; C-viewport-375/04-record-bottom, 04-programs; session overflow sheets  
  Fix: Mono only for numbers, dates, <=3-word eyebrows; sans 13px for sentences, chips, buttons.  
  Status: CORROBORATED (01, 04, 05, 03)

- **M-025** [H] [D] Evidence page ships placeholder and unverified citations ('Int J Exerc Sci 16(x)', 'Scientific Reports 16, s4159', 'Preprint - verification required'), 125 repeated CITED rows, duplicates.  
  Screens: persona-csm-red 20-evidence; persona-pullup 20-evidence  
  Fix: Verify or drop entries (evidence-verifier); show CITED once in the header; dedupe.  
  Status: UNVERIFIED against citations.json (needs evidence-verifier before ads)

- **M-026** [H] [D] Info sheet leaks internals: 'simulator harness, archetypes, author's own clinical context' and a long VERIFIED essay shown to every user.  
  Screens: persona-handstand, persona-pullup, persona-csm-red programs-info-sheet/01  
  Fix: One plain evidence line per program.  
  Status: CORROBORATED (3 personas)

- **M-027** [H] [D] Dates in six formats: '26 Oct', '28.10.2026', '2026-10-10', '2026-01 to 2026-03', 'Sept', raw ISO in 'Moved to...' toasts.  
  Screens: C-viewport-375/04, 07; persona-*/08-profile; plan-move-commit; retest sheets  
  Fix: One `formatDate` helper; recompute phase dates from start date.  
  Status: CORROBORATED (Away-days 28.10.2026 on 4 personas, Oct 28)

- **M-028** [H] [D] 'Programme' vs 'program' mixed ('PROGRAMME ASKS FOR', legal disclaimer, 'prior programme').  
  Screens: persona-pullup session-cold-reload; 23-legal-disclaimer; persona-graduate, recover  
  Fix: Use 'program' everywhere.  
  Status: VERIFIED in code (grep 'programme' in session UI and `IntakeClient.tsx` L1484)

### Data-consistency

- **M-029** [H] [D] Report retest baseline/current (0 reps, 12s to 19s) disagrees with Record (112 reps, 1:52): two code paths read retest data.  
  Screens: persona-pullup, pullup-fast, handstand, handstand-wrist, graduate 10-report vs 05b-record/04-history  
  Fix: Feed Report from the same retest event list as Record.  
  Status: UNVERIFIED (report uses `evaluateRetestMetrics` over log sources, Record uses retest events; seed may explain part)

- **M-030** [H] [D] Plan header progress reads 7/8 while Today reads 1/8 in the same week.  
  Screens: C-viewport-375/02-plan-top  
  Fix: One selector (`lib/program-progress.ts`).  
  Status: UNVERIFIED (week counter itself is unified, see Rejected; the 7/8 may be a session count)

- **M-031** [H] [D] Plan still shows Row strength on Wed 28 Oct after the morning check turned the day to rest.  
  Screens: C-viewport-375/02-plan-top  
  Fix: Apply the day's adjustment in the Plan row.  
  Status: UNVERIFIED

- **M-032** [H] [D] Skip/move/past/future day states conflict: Mon 'Skipped' and '1 logged' together, moved session sitting under a Skipped day, Start offered on a skipped day, 'Trained anyway? Log it' on a future rest day, Start on a past session.  
  Screens: persona-pullup elbow/02-plan, plan-move-commit/02, session-future 18, session-past 17  
  Fix: One state per day on Plan, Today and session pages; hide Start for skipped/past days.  
  Status: UNVERIFIED (mixed Oct 27/28 captures, flow-specific state)

- **M-033** [H] [D] Morning check says 'Saved. Today's plan is adjusted.' while Today is unchanged and the banner never names the shoulder.  
  Screens: persona-pullup-erratic-shoulder 01-day; handstand, handstand-wrist 13-check  
  Fix: Show what moved; name the region in 'CHECK FIRST'.  
  Status: UNVERIFIED

- **M-034** [H] [D] Finished or unfinished program state wrong in places: 'YOU FINISHED / Keep going' on an unfinished engine program; finished program still shows a live plan and Friday Start.  
  Screens: persona-engine 01-day, 16-session-today; persona-pullup-fast 02-plan, cold-load-resume  
  Fix: Gate on `isPastProgramEnd` everywhere (Today already does).  
  Status: UNVERIFIED (Today guard exists in `TodaySession.tsx` L441-455; seeded personas may sit past program end)

- **M-035** [H] [D] Today shows 'Rest today' while the session page shows Thursday's session; 'Fatigue flagged - applies to Wednesday' on a Thursday session; brief says Zone 1/2 while Today says Norwegian 4x4.  
  Screens: persona-csm-red cold-load-resume, persona-retest follow-along/01-brief  
  Fix: One resolved plan per date for Today and session.  
  Status: UNVERIFIED

## Soon (M)

### Today

- **M-036** [M] [D] Red-day Today is one card plus ~300px void; 'Log how it feels' is an 18px underlined link; no next step or why-red link.  
  Screens: C-viewport-375/01-today-top; persona-csm-red 01-day  
  Fix: Full-width secondary button; add 'Next session Thu' + Plan link.  
  Status: CORROBORATED

- **M-037** [M] [D] Day-1 Today repeats the program name three times and shows two progress meters (1/8 and WEEK 1 OF 8); 15-dot row and 'Progress load - nothing above 3/10' have no legend.  
  Screens: 06-intake-18; persona-pullup 01-day  
  Fix: One title, one meter, a labelled legend.  
  Status: CORROBORATED

- **M-038** [M] [D] Zero deltas shown in red ('+0 bpm', '+0s', '+0 reps'); 'YOU FINISHED' with no change; duplicate 'Submax HR' rows with truncated labels.  
  Screens: persona-engine, persona-muscleup, persona-pullup-fast 01-day  
  Fix: Neutral grey for 0; dedupe rows.  
  Status: CORROBORATED (Oct 28)

- **M-039** [M] [D] Accent leak: teal eyebrow on the bronze Advance card; teal Back/Export/Levels links beside bronze CTAs; green rule on Engine group.  
  Screens: persona-handstand 01-day; A-first-run/06-intake-01; 06-programs-bottom  
  Fix: Eyebrow in bronze-hi/muted; one link colour; group accent from palette.  
  Status: CORROBORATED (01, sweeps 01, 03)

### Session

- **M-040** [M] [D] Pain control has four names: 'This hurts', 'Something hurts', 'Something hurt', 'Pain or tweak'.  
  Screens: session-log-set/02-set; session-follow-along/02; overflow sheets  
  Fix: One label, one flow.  
  Status: CORROBORATED

- **M-041** [M] [D] Exercise chip rail truncates ('Downward-...', 'High-bar ba...') and the hurt button crowds it.  
  Screens: persona-pullup, csm-red, handstand session-cold-reload/01, session-controls/01  
  Fix: Shorter names or horizontal scroll with fade.  
  Status: CORROBORATED

- **M-042** [M] [D] Unexplained badges: 'BOTH', 'HELD', 'TOP SET' on set 3 of 3, 'OPTIONAL' tiny mono, 'Set 1/3 - Step 1/11'.  
  Screens: session-follow-along/02-guided-ready; 10-off-plan-top  
  Fix: Say 'Both sides', 'Set 3 of 3'; legend or drop HELD.  
  Status: CORROBORATED

- **M-043** [M] [D] Rest-day and future/past session screens have no app header, repeat the Today card, and leave half the screen empty.  
  Screens: C-viewport-375/03-session-top, 393/03; persona-*/17,18  
  Fix: Reuse app chrome; add next session / plan link.  
  Status: CORROBORATED

- **M-044** [M] [D] Video entry points dead-end: 'Watch the lift' opens 'No embedded demo yet'; modal is a YouTube search link.  
  Screens: session-overflow-sheet/04-video; session-video/01  
  Fix: Hide when no demo; ties to M-001 media work.  
  Status: CORROBORATED

- **M-045** [M] [D] Wrist extension prep appears twice on one brief; duplicate 'Log extra session' card inside the sheet; 'Import GPX' offered on pull-up rest days.  
  Screens: persona-handstand 16-session-today; activity-log-sheet; persona-pullup 17  
  Fix: Dedupe; show GPX only for endurance programs.  
  Status: CORROBORATED

- **M-046** [M] [D] Off-plan list: 15-40 'Lifts you did elsewhere' rows (squats/deadlifts) for pull-up users, internal drill names, duplicates, '1 sets'.  
  Screens: C-viewport-*/10-off-plan-bottom; persona-pullup 12-off-plan  
  Fix: Group by area, collapse by default, plain names, fix plural.  
  Status: VERIFIED (list built from whole library, `OffPlanSession.tsx` L134-146)

- **M-047** [M] [D] 'Add a set' hint reads '3th at prescription' (ordinal bug).  
  Screens: persona-handstand session-overflow-sheet, exercise-details  
  Fix: Use a real ordinal helper.  
  Status: VERIFIED (`session/OverflowSheet.tsx` L82 `${rowCount+1}th`)

- **M-048** [M] [D] Rest/effort chips: 11px labels, 'Very easy' wraps, 'Right ~2 more' ambiguous, 'Steady' option missing on some rest screens; '+15 s' vs '+30s' spacing.  
  Screens: session-log-set/03-rest; session-rest-extend/01  
  Fix: One five-step scale, 13px labels.  
  Status: CORROBORATED (Oct 27 flows)

- **M-049** [M] [D] Stop and hurt sheets: 'Stop session' in yellow/gold as primary; stopped state keeps the note sheet open.  
  Screens: session-hurt-stop/02; session-stop/02  
  Fix: Secondary style; confirm stop lands on a stopped screen.  
  Status: UNVERIFIED

- **M-050** [M] [D] Timed holds shown as reps ('1 rep', stepper 'STEPS OF 1 REP') and cardio shows set/rep UI.  
  Screens: handstand session-edit-past-set; pullup rest-extend/02d; persona-retest  
  Fix: Show seconds for holds; cardio-specific actions.  
  Status: UNVERIFIED (captures are Aug or Oct 27; see Needs recapture)

### Intake

- **M-051** [M] [D] Screening questions (neck numbness, blood pressure) in a four-step run feel clinical for a pull-up app.  
  Screens: 06-intake-04..07  
  Fix: Move to a single 'Anything we should know?' step.  
  Status: TASTE (06)

- **M-052** [M] [D] Intake controls: Yes/No pills, option cards and a 2x2 grid mixed; Yes/No small with a void below; checkboxes ~18px; 'yes' orphaned on row two; unit floats far from input; disabled Next too dim; progress bar 1px.  
  Screens: 06-intake-04,05,12,16; persona-rowing-mid, csm-red 19-intake  
  Fix: One control per question type; 44px targets; thicker bar.  
  Status: CORROBORATED

- **M-053** [M] [D] Intake helper copy: 'scap CARs', 'pull-aparts', 'scapulae', 'I-Y-T', 'medial elbow', 'negatives', 'closed-chain scap work'.  
  Screens: 06-intake-04,09,11,12; 09-first-session-bottom  
  Fix: Plain cues; one short cue plus demo link.  
  Status: CORROBORATED

- **M-054** [M] [D] Intake steps 12-15 show an enabled Next with blank input and no Skip; ring-row step lacks the demo link steps 12 and 15 have.  
  Screens: 06-intake-12,13  
  Fix: Gate Next like step 11 or add Skip.  
  Status: UNVERIFIED

### Plan

- **M-055** [M] [D] Plan header pile (title, description, progress, week switcher, 'Mixed practice' card) puts the first day row at ~66% of the viewport; descriptions truncated with ellipsis; two row treatments.  
  Screens: C-viewport-375/02-plan-top,bottom; 393/02-plan-bottom  
  Fix: Drop description, merge bar and card, allow two lines.  
  Status: CORROBORATED (02, 01, 05)

- **M-056** [M] [VG] No day-type icon or duration on Plan rows.  
  Screens: C-viewport-*/02-plan  
  Fix: Day-type icon + minutes per row (Runna pattern).  
  Status: VISUAL-GAP

- **M-057** [M] [D] Skipped rows strike through body text; 'Unskip' is a tiny underlined link; row buttons wrap ('Move...' truncated, 'Log session ->').  
  Screens: persona-csm-red 02-plan; plan-skip-commit/01; plan-expand-day/02  
  Fix: Muted label; real button; shorter labels.  
  Status: CORROBORATED

- **M-058** [M] [D] Move sheet offers logged and skipped days as targets and a logged session can be moved.  
  Screens: persona-pullup-elbow plan-move-sheet; persona-csm-red  
  Fix: Exclude logged/skipped.  
  Status: UNVERIFIED

- **M-059** [M] [D] 'Mixed practice' week banner and 'Interleaved practice (post-acquisition)' paragraph are dense jargon.  
  Screens: C-viewport-375/02-plan-top; persona-handstand 02-plan  
  Fix: One plain sentence (see the jargon item).  
  Status: VERIFIED (string present)

### Record

- **M-060** [M] [D] '1 green - 1 amber - 1 red' wraps leaving 'red' orphaned; 'Sessions 0 / 0' reads as empty and disagrees with logged sessions.  
  Screens: C-viewport-375/04-record-top; persona-pullup 05b; rowing-mid 05b  
  Fix: Coloured dots; 'No sessions this week'; fix count.  
  Status: CORROBORATED (partly UNVERIFIED for count)

- **M-061** [M] [D] '112 reps +12.0' shows a decimal on a rep count; deltas unitless ('Avg 1:49 +9.0'); trend chart with one reading shows 'Avg 1:40 0.0'; chart sticks on 'Loading chart...'; trend tabs cut at fold.  
  Screens: C-viewport-393/04-record-top; persona-handstand 04-history-redirect; rowing-mid 05b  
  Fix: Whole numbers, units, hide trend until two points, skeleton that resolves.  
  Status: CORROBORATED (Oct 28)

- **M-062** [M] [D] Heatmaps lack text equivalent and legends (history/readiness grid, activity heatmap); '45 active days' with every row '0 done'.  
  Screens: 04-record-top; persona-recover, strength 04-history; handstand 04  
  Fix: Legend + aria summary; define 'active'.  
  Status: CORROBORATED (04 + sweeps)

- **M-063** [M] [D] Retest dots unlabelled; '+12.0' wraps alone; '-2S SECONDS SINCE BASELINE' awkward; ISO 'vs previous (2026-10-10)'; 'Next test in 24 days' tiny.  
  Screens: persona-mobility, rowing-mid 05b; C-viewport-393/04  
  Fix: Label, units, human dates.  
  Status: CORROBORATED

### Report

- **M-064** [M] [D] Report layout: retest table overflows the right edge, 'target 0 kg / -5 bp' and 'cm_below_knee' clip; two stacked back links; 'Load progression: nothing logged' dead section; '12 - 0 km' for endurance.  
  Screens: persona-engine, strength-long, graduate, mobility, csm-red 10-report  
  Fix: Wrap/stack values, format units, hide empty sections.  
  Status: CORROBORATED (Oct 28)

- **M-065** [M] [D] Report contraindication and flag copy: 'sim:' prefix (seed value, see Rejected) and 'Provocateur incidents'; overhead pressing listed for an overhead program; elbow flag absent for elbow persona.  
  Screens: persona-mobility, persona-pullup-elbow, persona-recover 10-report  
  Fix: Plain 'Painful movements' heading; derive flags from intake.  
  Status: UNVERIFIED (reasons come from `store.contraindications`, report L744-751; programs involved are coming soon)

### Programs

- **M-066** [M] [D] Carousel cards clip mid-word with CITED badge cut at the edge; two-row ACTIVE/CITED pills; meta wraps raggedly ('8 wks/8 wk/8 weeks').  
  Screens: A-first-run/04; 393/06; persona-pullup 06,07  
  Fix: Peek with fade, one-line pills, one duration format.  
  Status: CORROBORATED

- **M-067** [M] [D] Program detail copy: 'multi-tier skill program on the shared pull drill library', 'Personalised sessions target your weakest sub-capability', 'a few minutes on the wizard', 'Levels: Prep -> Transition -> First Rep'; third person 'Some athletes'.  
  Screens: A-first-run/05; persona-handstand, muscleup 07  
  Fix: Plain one-liner; stepper for levels.  
  Status: CORROBORATED (merges into M-004 cut)

- **M-068** [M] [D] Placeholder-ish copy: 'More programs land as they're authored'; 'Muscle-Up Acquisition (strict ring)' vs 'Muscle-Up' naming; 'FIRST STRICT PULLUP' vs 'Pull-Up'.  
  Screens: persona-rowing-mid 06; persona-muscleup 07; C-viewport-375/02,07  
  Fix: One name from the manifest.  
  Status: CORROBORATED

- **M-069** [M] [D] Shipped personal program JSON (anterior-hip-rebuild: 'birthday_2027', 'pre_birthday' waypoint) is fetchable under /data/programs/.  
  Screens: persona-recover program-preview/02  
  Fix: Strip personal milestones from the shipped file or serve behind auth.  
  Status: VERIFIED (strings in `public/data/programs/anterior-hip-rebuild.json` L11, L27, L55; program is `personal: true` so not listed)

- **M-070** [M] [D] Hip program copy assumes a clinician ('you already have an orthopaedist and physiatrist'), 'Bertolotti', 'this user', 'Provocateur' chips.  
  Screens: persona-recover 14-check-hip, session-overflow-sheet/03  
  Fix: Conditional on intake; use 'you'.  
  Status: UNVERIFIED (personal program only; low reach)

- **M-071** [M] [D] Coming-soon programs in use by personas show hold/deferral defects: muscle-up-elbow plan still schedules ring dips after deferral and Today names 'Ring dip ladder'; mobility 'Overhead pressing' contraindication on an overhead program.  
  Screens: persona-muscleup-elbow 02-plan, 16-session-today; persona-mobility 10-report  
  Fix: Fix before muscle-up/mobility open (both `coming_soon: true` in manifest).  
  Status: UNVERIFIED in code; downgraded B to M: not reachable by ad visitors

### Profile

- **M-072** [M] [D] Raw email used as account name and truncated mid-domain; 'FOUNDATION' tier chip; ISO/'28.10.2026' away-days; 'Re-run intake' and 'Report' unexplained; red Delete directly under Export; email row has a chevron but no edit; finished program still listed active.  
  Screens: C-viewport-375/07,08; persona-*/08-profile, 03-account  
  Fix: Display name, plain labels, confirm Re-run, spacing for danger zone.  
  Status: CORROBORATED (Oct 28)

- **M-073** [M] [D] Settings: 'Theme' and 'Language' rows 'coming soon'; 'Accept confirm' internal voice; no sign-out visible on persona-engine account page.  
  Screens: 09-settings-top; persona-engine 03-account  
  Fix: Hide until shipped; 'Confirm plan changes'; verify sign-out.  
  Status: CORROBORATED (sign-out UNVERIFIED)

### Check

- **M-074** [M] [D] Sticky 'Update check' bar hides chip rows mid-scroll and sits above the flags; severity chips ~30px tall.  
  Screens: C-viewport-375/05-check-top, 393/05; persona-csm-red, engine, handstand 13-check  
  Fix: Move the CTA to the form end (in-flow); 44px chips.  
  Status: PARTIAL: `check/page.tsx` L274 already has `pb-28`, so the end-of-page overlap in the lead verdict is handled; mid-scroll hiding and chip height stand

- **M-075** [M] [D] Check copy: 'The engine reads these...', 'Cooked', 'A heavy week outside training', 'life load', stiffness options mix '<15 min', '15-30', '>30'; elbow preset 'None' for an elbow-pain persona; selected-state styles differ (red vs white ring).  
  Screens: C-viewport-375/05-check-bottom; persona-muscleup-elbow 13-check  
  Fix: Plain scale words with units; show last value; one selected style.  
  Status: CORROBORATED (default is `DEFAULT_VALUES`, `check/page.tsx` L195)

- **M-076** [M] [D] 'WHY?' links are tiny mono; 'Update check' not visibly saved; 'Hip-check' route silently shows Today.  
  Screens: 05-check-top; persona-pullup 14-check-hip  
  Fix: Readable link; show note 'no hip check in this program'.  
  Status: CORROBORATED

### Nav/global

- **M-077** [M] [D] Dead routes render unstyled white 404 with an older nav; current not-found copy still says 'Today became Day, Week became Plan'.  
  Screens: persona-handstand 03-coach, 15-events (Aug); `app/not-found.tsx` L25  
  Fix: Update copy to Today/Plan/Record/Profile; keep dark 404.  
  Status: VERIFIED (copy in code; white 404 captures are Aug, current component is styled)

- **M-078** [M] [D] Bottom-nav labels and eyebrows at 11px mono uppercase; disabled controls at opacity-30.  
  Screens: C-viewport-375/01-today-top; plan/page.tsx L313,334,962  
  Fix: 12-13px, sans for labels.  
  Status: CORROBORATED (04)

- **M-079** [M] [D] `--color-line` borders on surface-2 are 2.7:1; red text on surface-3 is 4.08:1; 'why' copy in muted not ink.  
  Screens: brand/tokens.css; 04-accessibility  
  Fix: Use `line-strong` for interactive borders, red-strong for text, ink for safety sentence.  
  Status: VERIFIED by contrast calc in 04

- **M-080** [M] [D] Capture-page chrome: sticky nav covers last rows on Plan/Today/program detail; at 1280 the bar spans full width over the form.  
  Screens: persona-engine 02-plan, desktop/01-day; persona-mobility 01-day  
  Fix: Content bottom padding = nav height; constrain bar to content column.  
  Status: CORROBORATED (Oct 28)

### Copy

- **M-081** [M] [D] Mixed unit and wording: 'Sept' vs 'Oct', 'Nice.' / 'Keep going 4 more weeks' streak tone, '1 sets', 'RETESTS 1 EVENTS', 'Norwegian 4x4' vs '4×4', en dashes in ranges, 'SAVE NEW PASSWORD' caps, '8 WEEKS' vs '8 wks'.  
  Screens: persona-*; A-first-run/01  
  Fix: Copy lint pass.  
  Status: CORROBORATED

- **M-082** [M] [D] Guide page: 4,500px glossary of strength/endurance terms for a handstand/pull-up user; 'bottom-nav labs' typo; '9 = one rep left' contradicts example; effort scale mismatch with rating buttons.  
  Screens: persona-handstand, csm-red 11-guide  
  Fix: Show only terms the program uses; fix typo and example.  
  Status: CORROBORATED (typo from persona-handstand Oct 28)

- **M-083** [M] [D] Citation notes in live UI ('order shuffled by the seed. Shea & Morgan 1979', 'Yiou 2017 CoP-shift work informs'); activity sheet 'no LLM, just a keyword parser', 'WOD name', 'Session-specific primer + cool-down'.  
  Screens: persona-handstand cold-load-resume, program-preview/02, activity-log-sheet  
  Fix: Citations behind Why; plain privacy line; 'Optional note'.  
  Status: CORROBORATED

- **M-084** [M] [D] Plan/rest copy: 'Progress load...', 'Order isn't sacred', 'Right ~2 more', 'Mark all as prescribed' (writes fake data) unclear; 'Trending well on turkish get-up hold ti...' truncated; 'Sotts press'.  
  Screens: persona-strength session-rest-extend; persona-mobility 01-day, 02-plan  
  Fix: Rewrite; check spelling 'Sots press'.  
  Status: CORROBORATED (mobility items are coming-soon program)

## Polish (L)

### Session

- **M-085** [L] [D] 'Log an extra session' link above Start; video modal has no 'external video' line; Next.js dev 'N' overlay on a capture.  
  Screens: A-first-run/08; session-overflow-sheet/04; recover 03  
  Fix: Link below CTA; context line; ignore dev overlay (harness).  
  Status: CORROBORATED

### Intake

- **M-086** [L] [D] Em dashes in every option label; 'Back to answers' teal link; answer option 5 cut under the footer with no fade.  
  Screens: 06-intake-01,17  
  Fix: Plainer labels; fade over footer.  
  Status: CORROBORATED

### Record

- **M-087** [L] [D] Finish screen and Record offer no return hook (no push, streak or summary).  
  Screens: 05-guided-done; 06 stranger  
  Fix: After first session: summary card + next session date.  
  Status: VISUAL-GAP/product

### Programs

- **M-088** [L] [D] Coming-soon rows keep chevrons and dim descriptions below AA.  
  Screens: A-first-run/04-programs  
  Fix: Raise description contrast (rows stay tappable by design).  
  Status: PARTIAL: tappable is intentional (`ProgramPreviewClient.tsx` L542-546)

### Nav/global

- **M-089** [L] [D] Heading order, 'WHY?' tap size, 'joined Oct 2026' casing, 'ACTIVE' pill style; verify one H1 per route.  
  Screens: 04-accessibility; 08-account-top  
  Fix: Audit DOM.  
  Status: UNVERIFIED

### Copy

- **M-090** [L] [D] Landing: hyphen ranges, 'MULTI-TIER' eyebrow, mono labels low contrast, 'What it's for' bullets duplicate program detail.  
  Screens: A-first-run/01-landing-pullup  
  Fix: Skill - 8 weeks; en dashes; keep one version.  
  Status: CORROBORATED

## Visual-gap summary

Items that need assets, not code: hero/cover imagery (Today, Programs), exercise figures for the empty media box (rig exists in `components/follow-along/ExerciseFigure.tsx`; list which pull-up and handstand drills lack a `figure`), Plan day-type icons, Record progress line as hero, finish-screen payoff. Everything else here is a defect or copy change.

## Rejected (not defects)

- **FALSE-POSITIVE**: Hip check shows personal clinical items to non-hip users (3 raw 'B': persona-pullup, persona-handstand, persona-strength hip-check/02-answered). Already fixed. `check/hip/page.tsx` L46 `if (!hydrated || !isHip) return null;` plus the redirect effect, added in bf64bd2 (2026-10-27 13:07). The captures are dated 2026-10-27 11:54, before the guard, so the brief's 'content renders before redirect' no longer holds. Re-run the hip-check flow to confirm; nothing to build.
- **FALSE-POSITIVE**: Programs page badges inconsistent for engine/rowing/muscle-up/mobility (raw 'B', persona-engine 06-programs). Manifest sets `coming_soon: true` for engine-builder, engine-builder-block-2, rowing-2k-test-prep, overhead-mobility and muscle-up. COMING SOON vs ACTIVE is the intended L-04 behaviour; ACTIVE shows only on the persona's own started program.
- **FALSE-POSITIVE**: 'sim:' prefix leaks into the report (raw 'B' persona-engine; raw H persona-handstand, persona-csm-red). Values such as 'sim: shoulder flagged during intake' are seed `reason` strings the simulator writes into `store.contraindications` (found only in tests/e2e/screenshots/matrix-v2 stores). No app code writes 'sim:'. Harness artefact.
- **FALSE-POSITIVE**: Week counters disagree ('Week 3 of 4' vs 'week 7 of 8', 7/9 vs 4/6 vs 9/9; ~14 raw H across pullup, elbow, erratic, handstand, csm-red, retest, strength). Unified in 5aade6f (P-06, 2026-10-27 23:52): one `programProgress()` over the whole program; `phaseProgress` has no production caller. The flagged captures predate it (cold-load-resume/03 dated Oct 27 18:10; Aug files). Fresh Oct-28 cold-load captures show one counter.
- **FALSE-POSITIVE**: Bottom tab reads DAY vs TODAY; tab set changes per page (DAY/PLAN/RECORD/PROFILE vs TODAY/WEEK/PROGRESS/HISTORY); 'Back to Day'. `BottomNav.tsx` L29-32 is Today/Plan/Record/Profile. The old labels come from Aug captures of retired routes. Residual: `not-found.tsx` L25 still says 'Today became Day' (kept as an M item).
- **FALSE-POSITIVE**: '3 PROGRAMS - LIVE NOW' counts coming-soon programs. `programs/page.tsx` L152-153 counts only `!coming_soon`.
- **FALSE-POSITIVE**: 'Skipped 3 sessions on 2026-10-28' toast after one skip. String does not exist in `src/`; it is from an older build's capture.
- **FALSE-POSITIVE (partial)**: 'END PROGRAM' has no confirmation. A ConfirmSheet 'End this program?' exists (`ProgramPreviewClient.tsx` L709). Only the equal-weight placement stands (kept as H).
- **HARNESS**: 'FIRST STRICT PULL-' clip; next= lost after sign-in; C-viewport-393/01-today-top showing Extra session; 'harness:' text in forms; seed values (100+ reps, 269 bpm, squat maxes on pull-up personas, Week 7 of 9 on first-run captures, '3 sec hang -> Tier D'). As briefed. The first-run 'Week 7 of 9' / tier-up nudge in persona-handstand and csm-red onboarding-first-run is the same seed artefact.
- **DESIGN-DECISION**: Sign-up three ticks as ADS-BLOCKER (06, sweep-01 B). Compliance design SG-02 (lead verdict). Kept as H for the owner's merge option; not a blocker.
- **DOWNGRADED**: B items for coming-soon programs (muscle-up-elbow ring-dip deferral x2, elbow preset None, mobility contraindication). Programs are `coming_soon`, so unreachable from ads; moved to M. Elbow 'None' default is the check's design (`DEFAULT_VALUES`), not a bug.

## Needs recapture (stale evidence, not counted)

- persona-handstand/mobile and persona-strength/mobile 01-today, 02-week, 03-coach, 04-history, 05-progress, 12-extras, 15-events (also desktop/ of concurrent, engine, engine-fast): Aug 2026 captures of retired routes. ~70 raw findings in sweeps 02-04 cite them, including the handstand 'retest figures conflict' raw B ('Progress: No readings yet'), 'Week of 17 Aug is This week', 'Target 0 m', white 404 pages and 'Hip-check route renders Today' (still true on current routes, kept as M). Those routes now redirect (`02b-week-redirect`, `05-progress-redirect` are Oct 28).
- Flows last run Aug or Oct 27: session-edit-past-set, session-rest-extend, session-rest-jump, session-overflow-sheet, session-controls, retest-logging (block2): Hold-as-reps, cardio set/rep labels, plate math (88 vs 87.5 kg), 'Step 1/34' stuck counter, '17 SETS LEFT'. Re-run the flows, then re-triage. The 'SETS LEFT' mislabel was confirmed in code regardless (H).
- Recover personal-program Today CTA 'Advance to Cycle 1' without a physio check (raw B, persona-recover/mobile/01-today.png, Aug capture): Not on the ad path (personal program). UNVERIFIED in code; recapture before judging. If real it is an H for the founder's own program.
