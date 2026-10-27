# Gap A: first run, ad click to first workout (375x667, fresh account, sign-up not submitted)
Scope: notes.md + 14 PNGs. Times and counts are estimates from captures, not timed runs. 09 is byte-identical to 08.
| Screen | Time / answers | Verdict |
|---|---|---|
| 01 landing | ~1 min scroll, 0 answers | CONFUSING: citation wall above the fold; CTA not visible in capture |
| 02 sign-up | ~30s, email/password + 2 checkboxes (or Google) | CONFUSING: consent implied by clicking Google |
| 03 first screen after confirm | 1 tap ("Got it") | CONFUSING: "Pick your focus" empty state under a tab-explainer overlay |
| 04-05 programs, detail | ~2 min, 0 answers | CONFUSING: CITED/VERIFIED lecture before the list; "reviewed by audit agent" |
| 06 intake 1-10 (screening + about you) | ~3 min, 10 required (9 single-tap, 1 kg number) | CONFUSING: 4 medical-sounding screening Qs |
| 06 intake 11-15 (physical tests) | ~2 min, 5 optional number fields | UGLY/BROKEN: clipped header, horizontal overflow on all 5 |
| 06 intake 16 (consent) | ~30s, 2 required checkboxes | CONFUSING: second medical disclaimer after sign-up |
| 06 intake 17 (result) | ~1 min read, 1 tap | BROKEN: Tier D recommended on a 3-second hang |
| 07 Today day 1 (= 06-intake-18 text) | ~30s | BROKEN: "Advance to Tier D" contradicts "Starting at Tier A" |
| 08-09 first session | 0, "Rest day." | BROKEN: no workout reachable on day 1 |
Totals: ~24 screens landing to Today; ~13 required answers + 5 optional; ~8-12 min to result. First workout NOT reached; the morning check (required before Day, per copy) was not captured.

Findings:
1. BROKEN · 06-intake-17, 07 · [HACKATHON] Result says Tier D on a 3s dead hang, 3 scap pulls, 3 ring rows ("confident pick"); Today says Tier A. Check the tier function with these inputs before fixing; it may be a test-data artifact.
2. BROKEN · 07 · [HACKATHON] Today cites "Your latest retest clears Tier D" for a brand-new user. Sticky "Advance to Tier D" bar covers "Ignore" and the morning-check card, so the one next action is obscured.
3. BROKEN · 08, 09 · [HACKATHON] "Day" on week 1 of 4 shows "Rest day." and offers Import GPX to a beginner. Show the next scheduled session or say why today is off.
4. BROKEN · 06-intake-11 to 15 · [HACKATHON] Header clipped ("OPTIONAL · S"), horizontal overflow on all five physical-test screens at 375px.
5. CONFUSING · 06-intake-11 · [HACKATHON] Tests labelled optional, but result says "physical tests carry the most weight". Skip is a tiny underlined link; NEXT reads as primary.
6. CONFUSING · 06-intake-02, 03, 04 · [BEFORE-SCALE] Clinical wording ("rotator cuff tear, labral tear", "radicular", "contraindicated", "diagnosed high blood pressure"). Q2 says "contraindicated" with no visible stop path; Yes branches untested. Option order differs (Yes/No vs No/Unsure/Yes). Needs clinical-language review.
7. CONFUSING · 02, 06-intake-16 · [BEFORE-SCALE] Consent three times: implied by Google click, checkboxes on sign-up, disclaimer at intake 16. Implied consent to store symptom data is weak; legal review.
8. CONFUSING · 01, 04, 05, 03 · [HACKATHON] Jargon above the fold (YOUDAS, ROIG, HERITAGE non-response, EMG, "scope: 21 refs, 1 removed"). "Short intake" is 16 screens. Landing "3-4x/week" vs Today "2 sessions/wk". "Got it, start the day" dismisses a card; no day exists yet.
9. CONFUSING · 07, 06-intake-01, 14 · [HACKATHON] Unexplained terms (scap, CARs, kip, negative, grease-the-groove, Tier, Retest, "Composed for", "Intake steps walked: 18"). Landing says bar + band, but the plan needs rings; barbell substitute only in help text.
10. UGLY · 01, 02, 05, 06-intake-01, 07 · [HACKATHON] Floating feedback button covers CTAs and body text on most screens.
11. UNVERIFIED · 01, 05 · Start CTA on program detail not in capture; "Eccentric training produce" truncation may be capture truncation (notes cut at ~2000 chars). Re-capture before filing.
Good: 1) Intake is one question per screen with a step label, Back, and plain options (Q6 is concrete). 2) Result shows the pick, the reasons, and "Don't agree? pick a different tier". 3) Honest ranges, stop-if-pain consent, and a clear rest-day empty state.
