# Redesign P1: plan (2026-10-28)

Source: the 8 consensus items in `dev/active/design-review-2026-10-28/rescore-00-summary.md`, specced per screen in
`REDESIGN-TARGET.md`. Goal: lift visual richness (6.0) toward the peers without touching safety logic.

## Lanes (parallel, disjoint files, Sonnet)
| Lane | Items | Owns |
|---|---|---|
| L1 Brief | 1 | `components/session/BriefView.tsx` (+ test) |
| L2 Figures | 2 | `lib/figures/rig.ts`, `components/program/ProgramFigure.tsx`, figure render sites' styling only |
| L3 Today hero | 3 | `components/session/TodaySession.tsx`, new `components/today/TodayHero.tsx` |
| L4 Check + nav | 4, 5 (nav, borders) | `app/check/page.tsx`, `components/check/*`, `components/nav/BottomNav.tsx` |
| L5 Copy + plan screen | 6, 7 | `app/programs/[slug]/intake/QuickStart.tsx`, `components/program/LevelLadder.tsx`, `app/plan/page.tsx`, `components/plan/*` |
| L6 Session done | 8 | `components/session/SessionDone.tsx` (+ test) |
| L7 Mono sweep | 5 (rest) | runs after L1–L6, files no lane owned |

## Fixed constraints
- `lib/symptom-state.ts` untouched; red days stay rest-only; safety gates and the check's scoring unchanged.
- Card / `cardClass()`, the type scale, `cn()`; type-scale.test.ts guards stay green.
- Lanes do not commit, do not run the dev server or `next typegen`; lead runs `npm run verify`.
- Accessible names of existing buttons stay stable (the persona harness clicks them); e2e specs are lead-owned.

## Risks
- Persona harness selectors drifting with layout changes → lead runs launch-gaps + personas before deploy.
- Mono sweep touching many files → runs last, alone.
