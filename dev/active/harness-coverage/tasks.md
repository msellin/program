# Harness coverage — tasks

- [x] Phase 1 · tour: drop dead `/events`
- [x] Phase 1 · tour: add session / settings / intake / evidence / legal
- [x] Phase 1 · tour: `?date=` past + future session variants
- [x] Phase 2 · `harness/flows.ts` with 6 flows + per-step capture
- [x] Phase 2 · wire flows into `personas.spec.ts`
- [x] Phase 3 · compose slot drills in the simulator
- [x] Phase 3 · partial sessions (mid-session states)
- [x] Phase 3 · populate dismissed_proposals
- [x] Phase 4 · coverage.json + coverage.md per run
- [x] Verify: run the sweep locally, confirm coverage numbers move
- [x] Docs + commit

## Fixed along the way (found while implementing)

Three independent gates, all silencing the same three personas:

1. `itemsForBlock` returned `[]` for slot-based blocks — their drills only
   exist after `composeBlockForUser`. Now draws `slot_drill_count` ids off
   `drill_library`.
2. The TM gate (`if (!tm) continue`) dropped every non-loadable drill.
   Mobility drills and skill holds have no training max by nature; the app
   logs them reps-only and the simulator now does too.
3. `pickBlocksForDate` applied a `category === "strength"` filter to EVERY
   program. All 7 overhead-mobility blocks are `accessory`, so the
   candidate list was empty every day. Now mirrors `schedule.ts:457` —
   hip-rebuild filters, nothing else does.

Result for persona-mobility: 0 → 34 logged exercise entries.

Two bugs in my own additions, caught by checking the artifacts rather than
trusting the code:

- `retest_metrics` entries key on `metric_id`, not `id` — the map produced
  `[undefined, undefined]` and wrote nothing.
- The moved-session day was pinned to `day === days/3`, which silently did
  nothing whenever that landed on a rest day. Now a 7-day window that
  no-ops once one override exists.
- `proposal_history` entries were written with `proposal_id`/`recorded_at`;
  the schema wants `id`/`at`. An invalid entry fails the store's zod parse,
  which sends `loadLocal` to its empty default and hands the whole store to
  the remote copy — a silent, total data loss that presents as "my seeding
  does nothing".

## Round 2 — 2026-08-27

- [x] R2-1 · RetestLoggingSheet reached — NOT the persona's window. Three stacked faults: case-sensitive regex vs uppercase accessible name, a flat wait shorter than hydration, and ResumeLastRoute redirecting goto("/")
- [x] R2-2 · applicability-scoped surface coverage, raw reported alongside
- [x] R2-3 · normalise rail tabs out of SetView's denominator
- [x] R2-4 · tap the steppers before the rail walk
- [x] R2-5 · drive the Close controls + RestTakeover trio
- [x] R2-6 · seed contraindications (in the daily loop — seedStore is pre-hydration and gets clobbered); widen the dismissed/proposal_history gate
- [x] R2-7 · CONSISTENT_AVERAGE's life_load was hardcoded flat, one point under amber — its own lifeLoad(d) was dead code
- [x] Re-run the sweep against prod — surfaces 92.3%, store 97.7%, controls 91.7%, 148 checks / 0 failures
- [ ] Docs + commit
