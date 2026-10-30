# Separate the owner's personal features from the product (2026-10-27)

**Owner idea:** pull out the parts that were custom to me, including the morning check.
**Verdict:** **yes.** Move every hip and clinical feature behind the personal program, and replace the daily morning
check for public programs with a **one-tap "How do you feel today?"** on the session brief, plus an always-visible
**"Something hurt"** in the session. Keep **one** audited safety gate (CLAUDE.md: a program declares what feeds the
gate, not how lenient it is).

## Why
- **Approachable:** a daily pain questionnaire before a pull-up session is friction, and it reads as medical. The
  "Check first" pill and the sticky check bar are among the worst-rated Today elements (x01, owner on device).
- **Less health data:** if public programs only record pain when the user reports it, Terav stops collecting daily
  Art. 9 data from most users. That shrinks the consent, DPIA and ad-policy surface (`findings-compliance.md`). It
  still needs a lawyer's view (O6), because a pain report is still health data.
- **Correctness:** the shared gate still carries hip-clinical signals for everyone: `deriveState` reads
  `night_pain`, `gait_change`, `click_present && click_painful` and `morning_stiffness_min`
  (`lib/symptom-state.ts`). Those belong to the hip track.

## Inventory of owner-specific parts (all → personal program only)
| # | Where | What | Source |
|---|-------|------|--------|
| P1 | `next-app/public/data/{clinical-context,open-questions,log,program}.json` | The owner's clinical record, served publicly | compliance 1, B1 |
| P2 | `components/workout/SignalsStrip.tsx:425`, `AssessmentDueBanner.tsx` | "First hip check" banner for everyone | app #6 |
| P3 | `app/check/hip/page.tsx:20` | Hip check (groin, SLR, hanging leg raise) reachable by all | app #5 |
| P4 | `app/report/page.tsx:275,810-811,761` | "Rehab days", orthopaedist/physiatrist footer, clinical section | app #9 |
| P5 | `lib/symptom-state.ts` deriveState | Hip-clinical red/amber triggers in the shared gate | this file |
| P6 | `app/check/page.tsx:169` LEGACY_REGIONS, data-loader `DEFAULT_PROGRAM_SLUG` | Fallbacks to the hip regions and program | compliance §4 |
| P7 | `app/programs/[slug]/page.tsx:9-17` | Personal slug prerendered publicly | compliance §4 |
| P8 | `app/guide/page.tsx:155` | Hip case study in the guide (fixed 2026-10-30, ROADMAP P-10) | compliance §4 |
| P9 | `landing/.../TodayMockup.tsx:21`, `en.ts:93-95` | "Left hip stiffness" mock; founder hip story | product 3 |
| P10 | persona fixtures | "no groin pain" note on the pull-up persona (fixed 2026-10-30, ROADMAP P-10) | app §2 |
| P11 | `anterior-hip-rebuild.json` (~`:293`) | Personal clinical override note | compliance 1 |

## New safety flow for public programs
1. **Session brief:** one optional row, "How do you feel today? Good · A bit off · Something hurts".
   - Good → normal session.
   - A bit off → the existing amber easing ("Eased today because you felt off").
   - Something hurts → pick a region (the program's `symptom_regions[]`) and a 0–10 score → the existing gate.
     Red = "Hold today" + an alternative, never a dead end.
2. **In the session:** a "Something hurt" chip in the top action row (design §4) → Note it / Swap or skip / Stop.
   This feeds the same gate.
3. **The morning check screen** stays reachable from You ("Daily readiness check, optional"). It is the default only
   for the personal hip program.
4. **Stored data:** only what the user reports. No daily scores unless they opt in.

## Effort and placement
- **HACKATHON (lane A):** P1–P4, P7, P9; remove the sticky check/suggestion bar and the floating feedback button
  from the bottom edge.
- **HACKATHON (lane D), if time allows:** the one-tap readiness row and the "Something hurt" chip (M). Fallback: drop
  the "Check first" hero state for public programs, so a check is never required to start (S).
- **BEFORE-SCALE:** P5 (move the hip triggers into a personal-program rule set without loosening the general gate;
  needs a test: an elbow 7/10 still reds a pull-up user), P6, P8, P10, P11; a lawyer view on pain-report data (O6).
- **Guardrail (memory):** accepted adjustments never touch the rehab track, and nothing here changes the
  anterior-hip-rebuild experience for the owner.
