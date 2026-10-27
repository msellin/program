# H04: first-5-minutes jargon (read-only, 2026-10-27)
Paths under next-app/src unless noted. Line numbers at HEAD 34d4ff2.

Top 12 (plain replacement after the arrow):
1. [BLOCKS-ADS-TODAY] programs/page.tsx:175 "one focus arc — an engine, a skill, a lift, a stubborn joint" → "one goal: build running/rowing stamina, learn a skill, get stronger at a lift, or fix a stiff joint"
2. [BLOCKS-ADS-TODAY] app/programs/[slug]/ProgramPreviewClient.tsx:270 "Authored for one specific clinical context" (shown on a catalog-public detail page) → hide the personal program from public catalog, or "Built for one person's injury history. Not for general use."
3. [BLOCKS-ADS-TODAY] app/programs/[slug]/intake/IntakeClient.tsx:783 section "Screening" → "About your health"; :988 heading "Intake · {name}" → "Setup questions · {name}"
4. [BLOCKS-ADS-TODAY] IntakeClient.tsx:644 eyebrow "Explain-back" → "Why this level"
5. [BLOCKS-ADS-TODAY] components/session/RestTakeover.tsx:338,341 "How was that?" / "This sets your training max." → "This sets your starting weight next time."
6. [BLOCKS-ADS-TODAY] RestTakeover.tsx:35-39 effort tiles "~4 more" (reps in reserve, RPE in comments) → "~4 reps left in the tank"
7. [BLOCKS-ADS-TODAY] components/session/BriefView.tsx:619,623 "% of your 100 kg training max" → "% of your working weight (100 kg)"
8. [BEFORE-SCALE] BriefView.tsx:193,230; SetView.tsx:503 "Top set" / "No top set today" → "Heaviest set" / "Every set is the same weight today"
9. [BEFORE-SCALE] ProgramPreviewClient.tsx:667,695 "Phases" / "Blocks" → "Stages" / "Weeks"; :500-501 "until the retest gate passes" → "after a re-test"
10. [BEFORE-SCALE] programs/page.tsx:467,472 pill labels "cited" / "verified" → "Sourced" / "Re-checked" (disclaimer "not field-proven" sits in tooltip 469-482)
11. [BEFORE-SCALE] public/data/programs: engine-builder.json:340 "submax HR at chosen easy pace" → "heart rate after 5 easy minutes"; concurrent-strength-maintenance.json:156 "back-squat 5RM" → "5-rep max back squat", :128 "(Z1/Z2 combined)" → "(easy pace)"; overhead-mobility.json:332 "OHS depth" → "overhead squat depth"
12. [BEFORE-SCALE] IntakeClient.tsx:258-259 "the evidence base doesn't back the outcome we promise — the dose is too small" → "This program works best at N sessions a week. You said X."

Also seen [LATER]: ProposalCard.tsx:249-256 "Tier gate cleared", "Not responding to current dose"; lib/symptom-regions.ts:135-136 "Shortened stride", "Painful click"; ExerciseDetailsSheet.tsx:174-175 "Near-provocative"; TodaySession.tsx:457 "Schumann 2022" (multi-track only).

Steps before first working set: 10 distinct screens or steps. Sign-up (form + 3 consents), check-email, sign-in (only if no auto-login), programs picker, program detail (+ switch-focus sheet), intake (10-19 items per program: questions plus optional physical tests), tier result, Today with first-run card and 3 onboarding cards, morning check (pushed by Day1EmptyState; enforcement not checked), session brief, then set view.

Verdict: items 1-7 are copy-only edits. Paid traffic lands on the picker and intake, where 1-4 sit.
Not checked: no browser run (rendering of RIR tiles, helper strings in BriefView, and the picker's personal badge assumed from code); auto-login after confirm; anon catalog filtering of the personal program; HeroStateCard (its citation strings are not rendered in code); non-English strings; landing copy.
