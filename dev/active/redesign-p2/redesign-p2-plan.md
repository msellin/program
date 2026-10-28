# Redesign P2: plan (2026-10-28)

Source: `dev/active/design-review-2026-10-28/rescore-p1-00-summary.md` (6 consensus items) + the harness gaps found in P1.
Constraints as P1 (`../redesign-p1/redesign-p1-plan.md`): symptom-state untouched, red = rest only, safety gates and
consent semantics unchanged, Card/type scale/cn, lanes don't commit or run the dev server/typegen.

| Lane | Item | Owns |
|---|---|---|
| L1 Today | 1, 6b (debug copy) | `session/TodaySession.tsx`, `today/*`, `session/FirstSessionOfferCard.tsx`, `workout/HeroStateCard.tsx`, `workout/SignalsStrip.tsx`, `workout/ProposalCard.tsx`, `ui/ProposalCard.tsx` |
| L2 Brief | 2, 3 (brief) | `session/BriefView.tsx` (+test), `follow-along/*` |
| L3 Sticky + targets + borders | 3, 6a | `app/check/page.tsx`, `components/check/*`, `workout/RedRestCard.tsx`, `ui/*` except ProposalCard |
| L4 Quick start | 4 | `app/programs/[slug]/intake/*`, `program/LevelLadder.tsx`, intake copy in program JSON |
| L5 Duration | 5 | new `lib/session-duration.ts` (+test), `app/plan/page.tsx`, manifest/program duration fields |
| L6 Harness | coverage | `tests/e2e/**` — session-done capture on the first-run path, the stale "Log a run, row, or class" selector, recheck the rest-day "Skipped" claim |

Lead wires `lib/session-duration.ts` into BriefView / TodayHero / TodaySession after L1, L2 and L5 land.
