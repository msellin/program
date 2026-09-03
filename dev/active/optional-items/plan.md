# Optional session items — soft-hide instead of removal

**Accepted 2026-09-03.** Founder has a box competition Sat 2026-09-12 (two
cardio/stamina WODs). Wants the Sep 6-12 week trimmed so he arrives fresh,
WITHOUT the app silently deciding for him.

## Why not just swap the blocks

The first plan pointed comp-week days at shorter blocks via
`phase.weekly_overrides`. Founder pushed back: he wants a *soft* hide —
if Monday feels great he should be able to opt back into the volume. He is
right, and it matches confirm-first: the engine proposes, the user decides.

## What we found

1. `blockItemSchema.optional` (schemas.ts:128) **already exists and is read
   by nothing.** `block_a_home` marks `hip_switch_9090` optional and
   `block_daily_skill` marks `goblet_squat` optional — both have been
   rendering as mandatory cards this whole time. Fourth instance of the bug
   class CLAUDE.md documents for `daily_log_schema` and
   `progression_rules.states[]`.
2. **FSL is not an item.** `block_squat_heavy` authors `back_squat_highbar`
   twice (A1 top set, A2 FSL) but `dedupeItems` collapses them to one rail
   entry, and the 5 FSL sets come from `suggestForExercise` →
   `Suggestion.fsl`, with `rowCount = fsl.sets + 1`. So "make FSL optional"
   cannot be an item flag — it is rows 1..N of one exercise.

Both blocks in (1) are used only by `anterior-hip-rebuild`, so making the
flag live cannot regress another program's rendering today.

## Two mechanisms, one visual language

**A. Item-level** — `item.optional: true` marks a whole exercise optional
(the accessories: Bulgarian split squat, hip thrust, single-leg RDL, Pallof).

**B. Row-level** — `Suggestion.fsl.optional: true` marks the trailing FSL
rows of one exercise optional, keeping the top set required.

Shared semantics, both mechanisms:
- Still rendered, still reachable, still loggable. Nothing disappears.
- Excluded from "sets left" — that counter means *required* work left.
- Excluded from the Brief's exercise count (shown as "+N optional").
- `nextAfterSet` does not auto-advance INTO optional work; the rail is how
  you opt in. If you are already in it, it advances normally.

## Phases

1. Schema + engine: `Suggestion.fsl.optional`, `TAPER_BLOCKS` in suggest.ts.
2. Rail: `RailExercise.optional` / `.optionalRows` (both `?`, so
   `OffPlanSession` — which builds the same type — compiles untouched).
3. Render: BriefView chip + muted row + summary; SetView pips + counter.
4. Advance: `nextAfterSet` skips optional rails.
5. Program data: `block_squat_taper` + `block_pull_taper`, added to
   `phase_2_cycle_1.blocks[]` (schedule.ts filters blocks not in the phase),
   plus a `weekly_overrides` entry for 2026-09-06 → 2026-09-12.
6. Tests + `npm run verify`.

## Risks

- **Adding blocks not listed in `phase.blocks[]` silently renders nothing.**
  schedule.ts:325 filters on it. Must update phase_2.
- **JSON that parses is not JSON that validates** — the CLAUDE.md failure.
  `npm run verify` before commit, no exceptions.
- Engine safety checked and clear: TMs move only through confirm-first
  proposals (adapt.ts/suggest.ts), never derived from sets completed;
  `suggest.ts` reads the block scheme, not completion history; graduation
  keys off `graduated_at`. A short week cannot move a number on its own.
