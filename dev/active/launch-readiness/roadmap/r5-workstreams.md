# R5: in-flight workstreams vs today's launch sprint (2026-10-27)

Scope: dev/active entries with commits since 2026-09-15, plus the five older ones in the brief. Read-only; conflicts checked by grep of next-app/src and git show --stat.

- **launch-readiness (the sprint)** [BLOCKS-ADS-TODAY]
  - What: lean ad-test plan, B1–B11 build items, owner decisions D1–D9. Status: in progress; audit done, build not started, D-answers pending.
  - Conflict: B1's deletions break data-loader.ts:128 (clinical-context.json) and storage.ts:154 (log.json seed). Fix both in the same commit.
- **follow-along player (BUG-47, BUG-48)** [BLOCKS-ADS-TODAY]
  - What: illustrated player for hip accessory blocks, hip home block on Today. Status: done (2026-10-19/20). Open: tune figures after founder sessions (not blocking); 403 on user_state_snapshots for e2e account.
  - Conflict: edited public/data/programs/anterior-hip-rebuild.json (+6 lines), the file B1 must edit for the override note. Pull before B1. B2 touches SignalsStrip.tsx only.
- **saas-launch (last touched 2026-09-14)** [BLOCKS-ADS-TODAY]
  - What: plan of record for the beta (96 open, 48 done). Status: in progress. Open: which programmes are advertised.
  - Conflict: memory says "beta: Engine Builder alone"; launch-plan D2 says pull-up, handstand walk, strength + cardio. Settle D2 before B11.
- **OPEN-TASKS.md (index)** [LATER]
  - What: workstream index and founder decision list. Status: in progress; header still reads "as of 2026-09-07". Open P1: off-plan strength logging, external load into proposals; founder-only: Android mid-set backgrounding.
  - Conflict: none with sprint files. Refresh the header after the sprint.
- **exercise-media (Gemini/Veo clip test)** [LATER]
  - What: whether AI video can show one character doing the exercises. Status: paused (test 3 failed movement fidelity). Open: none blocking.
  - Conflict: none. The sheet JPEG is under dev/active, not next-app/public, so it is not served.
- **founder-bugs-2026-10-01 (BUG-38..42; 43..46 same batch)** [STALE-drop]
  - What: founder's 2026-10-01 session bugs. Status: done, closed, deployed. Open: none.
  - Conflict: none. Archive the three task files.
- **video-analysis** [LATER]
  - What: on-device pose measurement from filmed sets. Status: stalled since 2026-09-01; 42 open, gate V0-5 never run.
  - Conflict: none. Not an ads item.
- **harness-coverage** [BEFORE-SCALE]
  - What: persona-harness coverage plan. Status: paused (4 open / 20 done, last touched 2026-09-08).
  - Conflict: memory rule requires a persona review in the same commit as catalog changes; B3 (landing programme copy) and B4 (manifest.json) fall under it.
- **personal-cue-separation** [STALE-drop]
  - What: moved person-specific cues into exercise_overrides. Status: done (11/11). Keep the mechanism B1 relies on; drop the workstream.
  - Conflict: none.
- **program-audits-2026-09** [STALE-drop]
  - What: promoted three programmes to REVIEWED. Status: complete 2026-09-02.
  - Conflict: none.
- **postgres-migration** [STALE-drop]
  - What: KV to Postgres move, plan only (2026-08-18), no task list. Status: not started.
  - Conflict: none. B6 and B8 use Supabase user metadata, not KV.

Not checked: saas-launch task content beyond counts; whether removing public/data/program.json breaks a caller (grep found no src reference, not run); the BUG-40 video URLs; older HANDOVER files; Supabase, Cloudflare and ad-account state.
