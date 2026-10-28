# Redesign P3: plan (2026-10-28)

Source: `dev/active/design-review-2026-10-28/rescore-p2-00-summary.md`, items 2–7. Item 1 (sign-up consents,
`next=`) stays with the owner's phone test (O-02); consent semantics are not touched here.

## Fixed constraints (as P1/P2)
- `lib/symptom-state.ts` untouched; red days stay rest-only; safety gates, consent semantics and the check's scoring
  unchanged; confirm-first (no copy claims an unaccepted change).
- Card / `cardClass()`, the type scale, `cn()`; type-scale.test.ts guards stay green (no `text-[Npx]`, `rounded-[Npx]`).
- `exercises.json` copy stays general (data-integrity test).
- Lanes do not commit, do not run the dev server or `next typegen`; the lead runs `npm run verify`.
- Accessible names of existing buttons and links stay stable (the persona harness clicks them).

| Lane | Item | Owns |
|---|---|---|
| L1 Today | 2, 3 (check link) | `components/today/*`, `session/TodaySession.tsx` |
| L2 Done | 4 | `session/SessionDone.tsx`, `session/done/*` |
| L3 Check + eyebrow | 6, 3 (meta labels) | `app/check/**`, `components/check/*`, `--text-eyebrow` in `brand/tokens.css` |
| L4 Quick start | 7a, 3 (Detailed setup) | `app/programs/[slug]/intake/*`, `program/LevelLadder.tsx` |
| L5 Brief + extra session | 3 (sticky Start), 7b | `session/BriefView.tsx` (+test), `session/OffPlanSheet.tsx`, `app/extras/page.tsx`, `offplan/*` |
| L6 Copy + harness | 5, 7c | program JSON block titles / tier outcomes, `app/plan/page.tsx` intro, `quick-start-model.ts` copy, `tests/e2e/**` (Record chart capture) |

Lead: review each lane's diff, verify, launch-gaps A/C + personas, deploy, re-shoot from live, rescore with the six
lenses (1–10).
