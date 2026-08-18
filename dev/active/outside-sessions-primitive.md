# Outside-sessions primitive — investigation

**Status:** future work. Founder request 2026-08-18 during Postgres migration.

## Context

Today the `runs[]` array on the day log carries all non-programmed activity —
runs, HYROX, cycle, row, ski erg, walk, CrossFit class. The activity type
picker on `RunSlotCard` supports 8 kinds including `crossfit_class`, and the
"+ Log session" button below the run list lets a user add a second, third,
Nth entry per day. This works today.

However: `runs[]` is misnamed. A CrossFit class isn't a "run." A yoga class,
a boxing session, or a pickleball match all sit awkwardly under `runs[]`.
Founder observed the UI copy is confusing — the card shows a footprints
icon + "Log an extra session" title, but the schema still says `runs`. The
mental model doesn't line up.

## Proposal (not scheduled)

Split `runs[]` into two arrays on the day log:

```ts
// legacy — kept for backward compat one release
runs?: RunLog[];

// new
outside_sessions?: OutsideSession[];
```

Where `OutsideSession` covers non-endurance activity:

```ts
{
  kind: "crossfit_class" | "yoga" | "climbing" | "sport" | "class_other";
  duration_min?: number;
  rpe?: number;      // 0-10
  intensity?: "easy" | "moderate" | "hard";
  notes?: string;
  started_at?: string;
}
```

Endurance-native activity (run/row/cycle/ski_erg/walk/hyrox) stays in `runs[]`
because programs like `rowing-2k-test-prep` and `engine-builder` query
`runs where activity_type == "row" AND session_type == "z2"` for retest
metrics.

## UI

Two chip rows on Today:
- `+ Log endurance` (run, row, cycle, ski erg, walk, HYROX) — current RunSlotCard
- `+ Log class` (crossfit, yoga, climbing, sport, other) — new OutsideSessionCard

Both live under the strength/skill block. Both optional.

## Engine wiring — the real work

1. **life_load contribution:** CrossFit class at RPE 8 for 45 min ~= elevated
   life_load. The morning check already asks for life_load 0-10; the outside
   session should soften today's programmed block without asking twice.
2. **Interference detection:** CrossFit class the day before a heavy squat
   session — the engine should propose a load reduction. Same logic as
   day_adjustment_soften but seeded by prior-day intensity rather than
   morning check state.
3. **Retest metric fairness:** a HERITAGE non-responder classification that
   ignores 4 CrossFit classes per week is dishonest — the athlete IS
   working, just not in a way the program measures. Surface this on Progress
   when the classifier fires: "Consider whether the outside sessions may be
   consuming the adaptation budget."
4. **Notes-signal wiring** (product-concerns roadmap F2): today's plaintext
   note "CrossFit class 45 min, felt strong" should be parseable into an
   `OutsideSession` retroactively when we ship the Worker cron. That extractor
   feeds the same engine surfaces.

## Cost estimate

- Schema addition + Zod: 15 min
- `logOutsideSession` / `removeOutsideSession` store actions: 30 min
- OutsideSessionCard component (fork of RunSlotCard): 1 h
- Today wiring + copy: 30 min
- Backward-compat migration (existing `activity_type: crossfit_class` runs
  auto-move to `outside_sessions[]` on next load, or stay per-user opt-in):
  30 min
- life_load + interference engine changes: 2-3 h
- Tests: 30 min
- **Total:** ~5-6 h

## Alternatives considered

- **Add a `crossfit_class` retest metric to programs** — pollutes program
  authoring; unclear how it maps to a retest window.
- **Rename `runs` → `sessions` with no split** — cheap, but every downstream
  consumer (retest metrics, weekly narrative, coach chat) needs to be
  audited for whether it means endurance-specifically or activity-generally.
  The split is clearer.

## Decision

Not scheduled. Note lives here for future prioritization.
