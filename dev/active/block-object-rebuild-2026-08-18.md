# Block-object rebuild — plan (2026-08-18)

**Status 2026-08-18 (end of Sitting 3):** Phase A (persistence adapter), Phase B
(schema + materializer), Phase C (Today view flip), Phase D (Week + SessionActions
flip), Phase E (Heatmap + History + Progress), Phase F (Coach + Report + legacy
removal) — all shipped. Feature flag `block_object` defaulted ON via
StoreHydrator; migration from legacy → blocks runs on first mount for existing
users. Multi-track skip/move works via block identity. Legacy `scheduled_overrides`
+ `skipped` fields retained one release for KV backward-compat; will be removed
in a follow-up.

The bulk of what follows is historical planning. Kept for reference on decisions
locked at Phase 0 and for the migration pattern in §10 (which the future Postgres
adapter will follow).

---


Rebuild the day-plan model from *"per-date derived plan with overrides"* to
*"first-class scheduled_block objects with identity"*. Solves multi-track
skip/move + Today-view duplication (see
[`multi-track-skip-move-research-2026-08-18.md`](./multi-track-skip-move-research-2026-08-18.md))
and unlocks per-block history, per-block coach references, per-block engine
adaptation, and per-block retest deltas.

Storage: **Zustand → KV first, Postgres later.** See §10 for adapter pattern.

Total effort: **20-30h**, ship-able in phases behind a `block_object`
feature flag.

---

## 0 · Founder decisions (2026-08-18, locked)

1. **Full block-object rebuild** — not the intermediate `skipped[date][slug]`
   shape. Reasoning: block identity is the pre-requisite for 4 already-planned
   features (per-block history, coach chat, retest Δ, engine per-block
   adaptation). Intermediate would ship those blocked in 6 weeks.
2. **Today view**: per-program cards with per-card Skip / Move menus. A day
   header appears ONLY when 2+ programs are active on the date; the header
   carries an optional "Skip whole day" shortcut. Single-program day = no
   header, identical to today.
3. **Week view**: dot per program per day, colored by block state (planned /
   done / skipped / moved), capped at 4 dots before collapse-to-"+N". Legend
   sits on the week header.

---

## 1 · Schema

### `scheduled_blocks` — the new source of truth

```ts
store.scheduled_blocks: Record<block_instance_id, ScheduledBlock>

type BlockInstanceId = string;  // "<slug>:<yyyy-mm-dd>:<block_template_id>"

type ScheduledBlock = {
  id: BlockInstanceId;              // stable across moves
  program_slug: string;
  block_template_id: string;        // references program.blocks[].id
  planned_date: string;             // "2026-08-18" — the ORIGINAL date
  actual_date: string;              // where the block currently lives (== planned_date unless moved)
  state: "planned" | "done" | "skipped" | "moved" | "amber_downshifted";

  // Move audit trail — always show the origin so the user can see history
  move_history?: Array<{
    from: string;
    to: string;
    at: string;                     // ISO timestamp
    reason?: string;
  }>;

  // Completion state
  completed_at?: string;            // ISO timestamp when state → "done"
  log_entry_id?: string;            // links to store.logs[]
  notes?: string;

  // Engine adjustments applied to this specific block (not the whole day)
  engine_adjustments?: Array<{
    proposal_id: string;
    applied_at: string;
    kind: "day_adjustment_soften" | "tm_bump" | "readiness_after_layoff" | "tier_advance";
    payload: Record<string, unknown>;
  }>;
};
```

**Why the id shape**: `<slug>:<date>:<template_id>` is human-readable in dev
tools, deterministic (same intake seeds same ids), and stable across moves
because the *original planned_date* stays in the id even when `actual_date`
changes. Retest / history queries key on `id`, not on `actual_date`.

### `program_materialization` — bookkeeping

```ts
store.program_materialization: Record<program_slug, {
  materialized_through: string;     // ISO date — last date we've generated blocks for
  materialized_at: string;          // when we last ran materialization
  materialization_seed: string;     // program_states[slug].generation_trace.seed
}>
```

Tells the materializer *"you've written blocks for handstand-walk up to
2026-11-30 — next rollover, extend."* Prevents double-materialization.

### Legacy → deprecated (kept on hydrate for one release)

```ts
store.skipped                 // legacy, migrator wraps → scheduled_blocks
store.scheduled_overrides     // legacy, migrator wraps → scheduled_blocks
```

Both removed after Phase F (see §9).

### Zod

New schema at `next-app/src/lib/schemas.ts` after `program_states`:

```ts
scheduled_blocks: z
  .record(z.string(), scheduledBlockSchema)
  .optional(),
program_materialization: z
  .record(z.string(), z.object({
    materialized_through: z.string(),
    materialized_at: z.string(),
    materialization_seed: z.string(),
  }))
  .optional(),
```

---

## 2 · Materialization strategy

### When blocks get written

**On program start** (in intake `commit()`):
- Materialize N=8 weeks of blocks from `program.phases[]` × `week_pattern`.
- Write to `scheduled_blocks` in one batch.
- Set `program_materialization[slug].materialized_through = today + 8 weeks`.

**On rollover** (weekly, checked on Today load):
- If `materialized_through - today < 2 weeks`, extend by 4 more weeks.
- Idempotent — same seed produces same block ids.

**On program change** (tier promotion, phase advance):
- Old blocks past `today` get regenerated. `done` / `moved` / `skipped` blocks
  with `actual_date <= today` are preserved (history). `planned` blocks with
  `actual_date > today` are rewritten.

### The materializer function

New: `next-app/src/lib/engine/materialize-blocks.ts`

```ts
export function materializeBlocks(
  program: Program,
  startDate: string,
  endDate: string,
  seed: string,
): ScheduledBlock[] {
  // walks program.phases, expands each phase's week_pattern, honors
  // phase_shift_days, applies plan_generator strategy (correlated_tier,
  // etc.) — same math as the current on-read derivation, materialized
  // into concrete blocks.
}
```

Deterministic given the seed → intake_answers → tier chain.

---

## 3 · Store action inventory

### Replacements (legacy → new)

| Legacy | New | Signature |
|---|---|---|
| `skipDay(date, reason?)` | `skipBlock(blockInstanceId, reason?)` — per block. `skipWholeDay(date, reason?)` — convenience wrapper that skips every planned block on that date. |
| `moveSession(from, to, blockIds[])` | `moveBlock(blockInstanceId, newDate, reason?)` — moves ONE block. `moveWholeDay(from, to)` — convenience wrapper. |
| `clearSkip(date)` | `restoreBlock(blockInstanceId)` — un-skips, un-moves. |
| `unskipDay(date)` | `restoreDay(date)` — restores every skipped/moved block that originated on that date. |

### New actions

| Action | Purpose |
|---|---|
| `completeBlock(blockInstanceId, logEntryId?)` | Mark done, link to log if provided. |
| `applyBlockProposal(blockInstanceId, proposal)` | Attach an accepted engine proposal to the specific block, not the whole day. |
| `getBlocksForDate(store, date, opts?)` | Selector — returns blocks whose `actual_date === date`, optionally filtered by slug. |
| `getBlocksForProgram(store, slug, range)` | Selector — history queries. |

### Store shape

Every action is a straight write to `scheduled_blocks[blockInstanceId]` + a
commit(). No cross-record cascades unless legacy compatibility demands them
(see Phase F below).

---

## 4 · Persistence adapter — the Postgres-later escape hatch

**Problem**: block-object generates more writes than the current model. Each
block state change → whole-blob KV write, currently. That scales badly at
100+ DAU.

**Solution**: introduce a thin adapter interface between the Zustand store
and the persistence layer. Current implementation = KV whole-blob. Future =
Postgres per-block writes. Domain model doesn't know or care.

```ts
// next-app/src/lib/persistence/adapter.ts
export interface PersistenceAdapter {
  read(userId: string): Promise<Store>;
  writeWholeStore(userId: string, store: Store): Promise<void>;
  // Later, Postgres adapter adds:
  // writeBlock(userId: string, block: ScheduledBlock): Promise<void>;
  // writePatch(userId: string, patch: Partial<Store>): Promise<void>;
}
```

Two implementations:

- `KVAdapter` (existing behavior, wraps `/api/state`)
- `PostgresAdapter` (future — added when scale demands, see §10)

The Zustand `commit()` function calls `adapter.writeWholeStore()` today.
When we add Postgres, we switch to `adapter.writePatch()` for hot paths.
Domain model + views don't change.

**This ships in Phase A.** Even before block-object work, we introduce
the adapter and route existing commits through it. Zero behavior change,
opens the future migration.

---

## 5 · Reader migration order

Views migrate one at a time behind the feature flag. Order matters — start
with the surface that has the highest value from the rebuild, and let the
legacy shape keep working for everything else during transition.

| Order | Surface | Path | Why first / why later |
|---|---|---|---|
| 1 | **Today** | `src/app/(today)/page.tsx` | Highest bug incidence (the duplication issue). Immediate visible fix. Multi-track card layout ships here. |
| 2 | **Week** | `src/app/week/page.tsx` | Dot-per-program requires block-state per day per slug. Read straight from `getBlocksForDate`. |
| 3 | **SessionActions + MissedSessionPrompt** | `src/components/workout/*.tsx` | Menus that write. Skip / Move buttons switch to per-block actions. |
| 4 | **Heatmap** | `src/components/charts/Heatmap.tsx` | Per-day density → per-program density. Colored slices per program. |
| 5 | **History** | `src/app/history/page.tsx` | Block-level history unlocks — "handstand-walk over 8 weeks." |
| 6 | **Progress** | `src/app/progress/page.tsx` | Adherence trend per program becomes trivially derivable. |
| 7 | **Coach / Report** | `src/app/report/page.tsx`, `src/lib/coach-client.ts` | Weekly narrative reads blocks directly. Coach chat gains per-block references. |

Each surface, when it flips, stops reading legacy `skipped` /
`scheduled_overrides` entirely. Once the last surface flips, legacy fields
get removed from the schema (Phase F).

---

## 6 · Feature-flag plan

```ts
store.feature_flags: {
  block_object: boolean;            // OFF by default
  block_object_writes: boolean;     // OFF by default (dual-write when ON)
}
```

- `block_object = false` (default): legacy readers, legacy writers, no
  materialization. Zero behavior change.
- `block_object = true` + `block_object_writes = false`: readers use blocks
  if present, fall back to legacy. Materialization runs. Writes still go
  to both legacy AND new. Founder-only for testing.
- `block_object = true` + `block_object_writes = true`: block-object is
  authoritative. Legacy readers turned off. Beta users, then everyone.

Founder flips flags on their own account first, tests, then flips per-user
via KV writes.

---

## 7 · Migration script

`next-app/src/lib/migrations/legacy-to-blocks.ts`

Runs once, on `StoreHydrator` mount, when `store.migrations_applied.includes("blocks_v1")` is false.

Steps:
1. For each `active_program_id` + `active_program_ids`, load the program JSON.
2. For each active program, materialize 8 weeks of blocks starting from
   the earlier of (a) `program_states[slug].started_at` (b) `today - 4 weeks`.
3. Walk `store.scheduled_overrides` — for each entry, find the matching
   materialized block by `(actual_date, template_id)` and mark it `moved`
   with `actual_date = <override date>`, populate `move_history`.
4. Walk `store.skipped` — for each entry:
   - If `moved_to` present: the corresponding block is already `moved`.
   - Else: mark the matching block on that date as `skipped`.
5. Walk `store.logs` (existing) — link each log entry to its block by
   `(date, program_slug)` → set `log_entry_id`.
6. Mark migration applied.

**Idempotent** — running it twice is a no-op after the first run. Safe to
run on every hydrate; short-circuits at step 0.

---

## 8 · Test plan

New: `src/lib/engine/materialize-blocks.test.ts`

- Deterministic materialization: same seed + program → same block ids.
- Rollover extension: idempotent when called twice within the same window.
- Phase-shift days: honored in `planned_date`.

New: `src/lib/store/block-actions.test.ts`

- `skipBlock` → block state = "skipped".
- `moveBlock` → `actual_date` updated, `move_history` appended.
- `moveBlock` twice → history has 2 entries, current `actual_date` is the latest.
- `restoreBlock` after skip → back to "planned".
- `moveWholeDay(from, to)` when 2 programs on `from` → both blocks moved.
- `skipWholeDay(date)` when 2 programs → both blocks skipped independently.

New: `src/lib/migrations/legacy-to-blocks.test.ts`

- Legacy `skipped[date] = { moved_to: to }` + `scheduled_overrides[to] = {...}` → one block with state "moved", `actual_date = to`, `move_history` has one entry.
- Legacy `skipped[date] = { reason: "..." }` → one block with state "skipped".
- Migration is idempotent.

New: `src/lib/engine/block-selectors.test.ts`

- `getBlocksForDate(store, "2026-08-18")` — returns blocks whose actual_date matches.
- `getBlocksForDate(store, "2026-08-18", { slug: "handstand-walk" })` — filtered.
- The founder's specific bug: block planned on Fri, moved to Sat → `getBlocksForDate(Fri)` returns nothing, `getBlocksForDate(Sat)` returns 1.

Existing suites (82 tests) run unchanged; they hit the legacy path when
`block_object = false`.

---

## 9 · Phased ship

Each phase is independently deployable. Feature flag stays off until Phase E.

| Phase | Scope | Effort | Ships |
|---|---|---|---|
| **A** | PersistenceAdapter interface + KVAdapter implementation. Route existing commits through adapter. Zero behavior change. | 3h | Immediately. |
| **B** | `scheduled_blocks` schema + materializer + tests. Feature flag added, defaults OFF. Migration script written but not run. | 6h | Immediately (dark). |
| **C** | Today view flip behind flag + per-program card layout + day-header shortcut. Founder flips flag on their own account, tests. | 5h | Founder validates for a day. |
| **D** | Week view + SessionActions + MissedSessionPrompt flip behind flag. Multi-track skip / move works end-to-end for founder. | 5h | Founder validates for a day. |
| **E** | Heatmap + History + Progress flip. Migration script runs on hydrate for all users with the flag. Beta invite users flip. | 5h | Beta users. |
| **F** | Coach / Report flip. Legacy fields removed from schema. Flag becomes default-ON. | 4h | Public. |

Total: **28h**, phase-boundaried so we can pause between any two.

---

## 10 · Postgres notes — for future us

When we eventually add `PostgresAdapter`, the changes are:

- Schema mapping — `scheduled_blocks` → `blocks` table (one row per block).
  Composite index on `(user_id, actual_date)` + `(user_id, program_slug)`.
- Hot writes (state changes, log linking) become
  `adapter.writeBlock(userId, block)` instead of whole-store push.
- Reads use SQL joins for cross-program queries (coach chat, history
  aggregation, cohort analytics).
- Legacy Zustand `commit()` fallback stays as periodic backup even after
  Postgres is authoritative — a JSON-blob snapshot every ~10 minutes gives
  us a disaster-recovery lane.
- Dual-write period: 1-2 weeks where both KV and Postgres get every write,
  read from Postgres, KV as canary. Then flip.

**None of this is on the critical path for block-object.** It's the follow-on
project.

---

## Files

**Created:**
- `src/lib/schemas.ts` — add `scheduledBlockSchema` + fields
- `src/lib/engine/materialize-blocks.ts`
- `src/lib/engine/block-selectors.ts`
- `src/lib/store/block-actions.ts` — new action bundle
- `src/lib/persistence/adapter.ts` — interface
- `src/lib/persistence/kv-adapter.ts`
- `src/lib/migrations/legacy-to-blocks.ts`
- Tests for each of the above (5+ new spec files)

**Modified:**
- `src/lib/useStore.ts` — replace legacy skip/move with block actions,
  route through adapter, add materialization trigger on hydrate.
- `src/app/(today)/page.tsx` — per-program cards + optional day-header
- `src/app/week/page.tsx` — dot-per-program
- `src/components/workout/SessionActions.tsx` — per-block Skip/Move
- `src/components/workout/MissedSessionPrompt.tsx` — per-block prompt
- `src/components/charts/Heatmap.tsx` — per-program density
- `src/app/history/page.tsx` — block-history queries
- `src/app/progress/page.tsx` — adherence per program
- `src/app/report/page.tsx` — weekly narrative from blocks
- `src/lib/coach-client.ts` — pass block state instead of skipped map
- `functions/api/state.ts` — no changes yet (still whole-blob), just plumb
  through adapter.

**Removed** (Phase F):
- `store.skipped` field + all readers
- `store.scheduled_overrides` field + all readers
- `skipDay` / `moveSession` / `clearSkip` legacy actions

---

## Rejected during planning

- **Intermediate `Record<date, Record<slug, state>>` shape** — locks us out
  of per-block features we already care about. See intermediate research doc.
- **Postgres migration before block-object** — locks the block-object model
  into a SQL schema before we've iterated on it. Bad ordering.
- **Full Runna drag-and-drop UI** — separate UX project. This plan gives us
  the data model that makes drag-and-drop trivial later.
- **Migrating history entries retroactively into `scheduled_blocks`** — logs
  stay in their own store, `log_entry_id` on the block links them. Cheaper.

---

## Change log

- 2026-08-18 — plan written. Founder locked decisions §0.1–3.
