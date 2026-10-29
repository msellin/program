# Founder feedback build: plan (2026-10-29)

Owner: "Yes, build all", in the panel's order (`00-summary.md`). Lanes own disjoint files, do not commit;
the lead reviews, runs `npm run verify` + personas, commits and pushes to main.

| Lane | Scope | Files owned | Model |
|---|---|---|---|
| L1 | Guided player: Back opens a finished set read-only, "Back to set N" primary, Redo explicit secondary; Back never changes a result | `components/follow-along/FollowAlong.tsx` (+test) | Sonnet |
| L2 | Today trims: check card → one row; "2 tracks" banner → one muted line; "Heavy squat day" card out of the column (one line in the strength hero); hero subtitle plain ("Weeks 7–10 · includes a strength test" via the phase display, not a new claim); mobility card drops "1 block ·" / repeated week | `components/session/TodaySession.tsx`, `components/workout/{HeroStateCard,RunSlotCard,SignalsStrip}.tsx`, `components/AssessmentDueBanner.tsx`, `components/today/*` (+tests) | Sonnet |
| L3 | Done brief: all items done → "All done" line + check icons, no "Log an extra session", no "How to run this" | `components/session/BriefView.tsx` (+test) | Sonnet |
| L4 | Set-player figure not moving on the founder's phone: reproduce, fix; coach: still once logging, moving before set 1 and in rests | `components/session/SetView.tsx`, `components/follow-along/ExerciseFigure.tsx` | lead |
| L5 | Session insights on the done screen (templated, each line names its log signal, no LLM, no score ring) + a rep-max test (e.g. 115×3) feeds a confirm-first working-max proposal | `components/session/SessionDone.tsx` (+test), `components/session/done/*`, `lib/engine/*`, `lib/proposals/*`, new `lib/insights/*` | Sonnet |

## Constraints
`lib/symptom-state.ts` untouched; safety gates and consent unchanged; red days rest-only; confirm-first (engine
proposes, never auto-applies TM); no personal clinical copy in shared code or `exercises.json`; Tailwind tokens only
(no `text-[Npx]`); `npm run verify` green.

## Then
Verify, persona run, commit, deploy, live re-shoot of Today / guided player / done screen, rescore by the same five lenses.
