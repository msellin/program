# X05 onboarding and program choice audit (2026-10-27)

Paths relative to A = next-app/tests/e2e/artifacts/personas. Info sheet is byte-identical across personas, so reported once.

- CONFUSING · persona-pullup/flows/onboarding-first-run/01-first-run.png · not located · [HACKATHON] Today shows a "WORKOUT READY" badge and a "Rest day." card on the same screen. Contradictory status on first view.
- CONFUSING · persona-pullup/flows/onboarding-first-run/01-first-run.png · [HACKATHON] Daily screen leads with research jargon: "Shea & Morgan 1979", "random practice, order shuffled by the seed", "Progress load", "3/10".
- CONFUSING · persona-pullup/mobile/06-programs.png · app/programs/page.tsx:176, 217 · [HACKATHON] Two dense paragraphs on CITED / VERIFIED / "simulator harness" sit above the first program card. A stranger reads methodology before any choice.
- CONFUSING · persona-pullup/mobile/06-programs.png · app/programs/page.tsx:428 and ProgramPreviewClient review banner · [HACKATHON] Banner says "Reviewed by Terav specialist audit agent", while the info sheet says no independent specialist has signed off. "Specialist" reads as a clinician.
- CONFUSING · persona-pullup/flows/programs-info-sheet/01-info-sheet.png · [LATER] Ladder explainer runs about 6 KB of text ("How programs earn each status"). It is honest but reads as a document, not a choice aid.
- CONFUSING · persona-pullup/flows/program-preview/01-program-detail.png · [HACKATHON] Tier vocabulary ("Levels: Hang → Assisted → First Rep → Volume", "multi-tier") is unexplained. A stranger cannot tell which level they start at.
- CONFUSING · persona-pullup/text/06-programs.txt vs 19-intake.png · ProgramPreviewClient.tsx:441-449 · [HACKATHON] Preview promises "11 short questions and 5 benchmark tests". Intake shows "STEP 1 OF 16". Mismatch on the length promise. The "11" string was not located in source.
- CONFUSING · persona-pullup/mobile/19-intake.png · IntakeClient.tsx:65-90 (tone badges "gate", "calibration", "engine") · [BEFORE-SCALE] Internal section-tone labels are defined; whether they render to users was not confirmed. If they do, they are jargon.
- POLISH · persona-pullup/mobile/19-intake.png · [HACKATHON] Intake Q1 is clear and gives a plain effect ("we bias the plan toward..."). Good. Back and Next footer is reasonable.
- POLISH · persona-pullup/flows/program-preview/01-program-detail.png · ProgramPreviewClient.tsx · [LATER] "END PROGRAM" sits beside "GO TO TODAY" with no visible confirm in the capture. Pick-wrong recovery path is unverified.
- POLISH · persona-pullup/mobile/06-programs.png · app/programs/page.tsx · [LATER] Sort and filter row ("Curated / Shortest first") is hidden under the bottom nav in the capture.
- POLISH · persona-mobility/mobile/07-programs-active.png (not opened) · [LATER] Carousel cards cut off at the right edge with no swipe affordance text. Not confirmed on screen.

Hip program: correctly absent from the catalog (programs/page.tsx:100-109 filters personal:true). Its personal-acknowledgement gate sits at ProgramPreviewClient.tsx:164-168 and 732. Not visible to a stranger, as intended.

Good:
1. Honest evidence ladder: "CITED" and "VERIFIED" are defined with what they do not mean.
2. Program cards show weekly time commitment (for example "~1.5 hr/week, 3-4 sessions/wk") so the choice has a cost.
3. Intake first question explains what each answer changes, and the disambiguation "Not for kipping pull-ups" helps a stranger pick.

Not checked: a true stranger sign-up path (all four personas already have an active program, so onboarding-first-run captures show existing-user Today, not first run); intake steps 2-16; handstand, strength and mobility 19-intake and 07-programs-active; 02-expanded captures; END PROGRAM confirmation; desktop layout; live copy versus data for the "11 questions" claim.
