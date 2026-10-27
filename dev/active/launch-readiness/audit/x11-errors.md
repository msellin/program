# X11 error sweep, persona artifacts (2026-10-27)

## 1. Console
- [LATER] 23x `[pageerror] Cannot clear timer: requestIdleCallback...` on /, /record, /evidence across 19 personas. Playwright clock-mock noise, IGNORED per brief. No console.error or console.warn lines in any persona.

## 2. Network (64,598 x 200, 1,150 x 308, 0 x 4xx/5xx)
- [LATER] 1,150 x 308 on legacy routes (/week, /plan, /settings, /progress, /report, /record, /programs, /profile, /reset-password, /off-plan, 46 each). Expected alias redirects.
- [BEFORE-SCALE] ~30 requests with no recorded response: `/feedback/` and `/off-plan/` RSC `__next._tree.txt` prefetches (about 2 per persona), `/programs/*/intake/` tree fetches, a Sentry envelope tail per run, and one Supabase `user_states` upsert with no response (persona-erratic). Probably aborted on navigation, not confirmed. Check that the Supabase write landed.
- [HACKATHON] `/data/clinical-context.json` is 200 in all 23 personas. The same public tree holds `open-questions.json`, `program.json` and `log.json` (`next-app/public/data/`). Only key names were read: clinical-context has `clinical_exam`, `history`, `findings`, `provocative_positions`. Health-record content is served as static runtime data to every user, against CLAUDE.md's de-identification rule.
- [HACKATHON] `/data/programs/anterior-hip-rebuild.json` (`personal: true`) is fetched by persona-concurrent, persona-multitrack and persona-recover. Concurrent and multitrack load it while running non-hip programs.

## 3. Flows (23 results.json, 667 rows)
- 442 ok, 225 skipped, 0 failed. Skip reasons:
  - 108 no session within +-7 days (harness date window) [LATER]
  - 28 no exercise has two sets left; 9 miss control gated to TM; 7 no logged set; 6 first off-plan drill not hold-based [LATER]
  - 20 no retest-due proposal open; 17 drill library off for persona; 17 off-plan off for persona [LATER]
  - 13 `session-log-set`: "no confirm control on the set screen". Core logging flow untested in 13 personas. Either the control is missing or the selector is wrong. [BEFORE-SCALE]
- persona-muscleup-elbow: no coverage.json written (test aborted, see 4).

## 4. Muscle-up deferral failure (personas.spec.ts:465)
- The captured Brief drops `mu_ring_dip_full` from the set list. The guided block "Follow along · Ring dip ladder" (`block_ring_dip_ladder`, muscle-up.json:656) and the authored prose "Support hold -> ... full dip" still render, and the spec's haystack check catches them.
- `applyIntakeExclusions` (`src/lib/engine/intake-exclusions.ts:42-60`) only filters block items. Its own comment (`plan-generator.ts:329-346`) says deferrals cannot be reintroduced by composition. Likely a real leak for an elbow-pain user, not only a test false positive. [HACKATHON] Read from code and artifacts, not run.

Not checked: screenshots and DOM dumps; re-running the spec or the app; whether the Supabase write succeeded; the de-identification content of public/data files beyond key names; whether the Ring dip ladder renders for real users versus only in this capture; whether the 13 confirm-control skips are a selector bug.
