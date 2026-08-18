# Multi-track skip / move · research + fix proposal

Surfaced by founder 2026-08-18 while testing:

1. **Per-track skip/move**: with 2+ programs active on Monday, want to
   skip or move each track independently (Runna's block-level pattern),
   not skip the whole day.
2. **Today view duplication after day move**: after moving Friday's
   workout to Saturday, Today view apparently shows the same plan on
   BOTH days. Week view correctly marks Friday as moved/skipped.

Both issues share one root cause.

---

## The root cause: skip/move is keyed by DATE only

Current model (`next-app/src/lib/useStore.ts`, `next-app/src/lib/schemas.ts`):

```ts
store.skipped:              Record<dateISO, { reason?: string; moved_to?: string }>
store.scheduled_overrides:  Record<dateISO, { blocks: string[]; reason?: string }>
```

Neither dimension knows about `program_slug`. `moveSession(from, to, blockIds)`
persists:

```
scheduled_overrides[to]   = { blocks: [...blockIds], reason: "moved from <from>" }
skipped[from]             = { moved_to: to }
```

Consequences:

- **Skipping is per-day, not per-track.** `skipDay(date)` blanks the whole
  date for every active program. With one program that reads as "skip today."
  With two programs it reads as "skip everything," which is not what the user
  wants when they can do their engine session but not their handstand session.
- **Today view duplication is likely a downstream symptom.** If Today reads
  each active program's plan via `scheduled_overrides[activeDate]?.blocks`
  but does NOT check whether the *source* date's skip erased the block from
  its origin, the block appears in BOTH slots. Week view respects
  `skipped[from]` because it renders per-day state; Today view derives blocks
  from program phases first and then may not consult `skipped[from]`.

### Where the model is read (all of these need to grow the program dimension)

| Reader | Path | Currently reads |
|---|---|---|
| Week view | `src/app/week/page.tsx:39` | `store.skipped` (date-keyed) |
| Heatmap | `src/components/charts/Heatmap.tsx:63` | `store.skipped?.[dateISO]` |
| SessionActions | `src/components/workout/SessionActions.tsx:23` | `store.skipped?.[active]` |
| MissedSessionPrompt | `src/components/workout/MissedSessionPrompt.tsx:68` | `store.skipped?.[yesterdayISO]` |
| Coach client | `src/lib/coach-client.ts:34` | `store.skipped` (whole map) |

### The Runna reference the founder invoked

Runna treats each *block* (their word for a scheduled workout) as a
first-class object with an id, a scheduled date, and a state
(planned / done / skipped / moved). Users drag blocks between days. The
data model looks approximately like:

```
blocks: [
  { id, program_id, planned_date, actual_date?, state: "planned" | "done" | "skipped" | "moved" }
]
```

Our current model is closer to *"one plan per date, mutated in place"* — no
block identity. That's why we can't do per-track moves and why moved blocks
show up twice.

---

## Proposed fix — grow the skip/move maps by one dimension

Cheapest path that solves both issues without adopting Runna's whole
block-object model.

### Schema

```ts
// Legacy:
store.skipped: Record<dateISO, { reason?, moved_to? }>
store.scheduled_overrides: Record<dateISO, { blocks: string[]; reason? }>

// New:
store.skipped: Record<dateISO, {
  "*"?: { reason?, moved_to? },
  [program_slug: string]: { reason?, moved_to? }
}>
store.scheduled_overrides: Record<dateISO, {
  "*"?: { blocks: string[]; reason? },
  [program_slug: string]: { blocks: string[]; reason? }
}>
```

`"*"` means whole-day (all active programs). Backwards-compatible migration:
existing `skipped[date] = { moved_to: "..." }` becomes
`skipped[date] = { "*": { moved_to: "..." } }`.

### Store actions

Both actions take an optional `slug` parameter:

```ts
skipDay(date: string, opts?: { slug?: string; reason?: string })
moveSession(fromDate: string, toDate: string, opts: {
  slug?: string;                // undefined = whole day
  blockIds: string[];
})
```

Omit `slug` → operation writes under `"*"` (current behavior). Pass
`slug` → operation writes under that program only.

### Read-side changes

Every reader in the table above becomes a helper:

```ts
function isDaySkipped(store, date, slug?): SkipState | null {
  const day = store.skipped?.[date];
  if (!day) return null;
  if (day["*"]) return day["*"];               // whole-day skip wins
  if (slug && day[slug]) return day[slug];     // per-track skip
  return null;
}
```

Today view derives its per-program plan via `isDaySkipped(store, today, slug)`
for each active program. Week view aggregates: if any program shows a state
on that date, show a chip; if two programs disagree, show both.

### Fixing the duplication bug specifically

Today view's block-source function needs to check the ORIGIN date, not just
the destination:

```
for each activeProgramSlug:
  if skipped[today]?.[slug] || skipped[today]?.["*"]:  hide today's plan
  if scheduled_overrides[today]?.[slug]:               show overridden blocks
  else:                                                show phase-derived plan
```

Right now step 1 is missing at the Today-view layer, so the plan renders on
its origin date AND on its move-to date.

---

## Migration cost

- **Schema**: add the intermediate record layer. Backwards-compat requires a
  one-time hydration migration on the store.
- **Store actions**: `skipDay` and `moveSession` grow an optional `slug`
  parameter. `clearSkip` becomes `clearSkip(date, slug?)`.
- **Readers**: introduce `isDaySkipped(store, date, slug?)` helper; replace
  all 5 direct reads.
- **UI**: Today view + Week view + SessionActions need per-track buttons
  when there are 2+ active programs. When only 1 program is active, the UI
  stays exactly as today (calls `skipDay(date)` — implicit `"*"`).

Total effort estimate: **6-10h**. Cross-cutting but each touch is small.

## Tests to add

- `store.skipDay(date)` → `skipped[date]["*"]` shape.
- `store.skipDay(date, {slug: "handstand-walk"})` → `skipped[date]["handstand-walk"]` shape.
- `store.moveSession(from, to, {slug, blockIds})` → correct origin skip + destination override.
- Today view: for each active program, hidden if `isDaySkipped(store, today, slug)`.
- Today view: origin-date hide when block was moved out (regression test for the
  founder's bug).
- Week view: two programs, different states on same day → both chips render.

## What we're NOT doing (deferrals)

- **Full Runna-style block-object model** with drag-and-drop between days —
  a bigger rebuild. The proposed fix delivers per-track skip/move without it.
- **Reordering blocks within a day** — different UX problem.
- **Historical migration of legacy `skipped[date]` entries in prod** — the
  schema is Zod-parsed on hydrate; add a normalizer that wraps legacy entries
  in `{ "*": ... }`.

## Founder decision needed

1. Do you want the intermediate `skipDay(date, {slug})` model above, or the
   full block-object rebuild? Recommendation: **intermediate**. Ships this
   week, delivers what you asked for, doesn't lock us out of the block-object
   model later.
2. When 2+ programs are active, should the Today view show one card per
   program (current shape) and each card gets its own Skip / Move menu? Or
   consolidate into one day-header with per-program rows? Recommendation:
   **one card per program with per-program menu** — matches the current
   `AlongsideCard` treatment.
3. Should Week view aggregate ("2 workouts today, 1 skipped, 1 done") or
   split (show both program dots)? Recommendation: **split dots** — matches
   how founders read Runna's calendar.

## Files that will change

- `next-app/src/lib/schemas.ts` — grow `skipped` + `scheduled_overrides`.
- `next-app/src/lib/useStore.ts` — 5 actions + 1 new helper.
- `next-app/src/lib/coach-client.ts` — pass through the new shape.
- `next-app/src/components/workout/SessionActions.tsx` — per-track menu.
- `next-app/src/components/workout/MissedSessionPrompt.tsx` — per-track prompt.
- `next-app/src/components/charts/Heatmap.tsx` — dot per program.
- `next-app/src/app/week/page.tsx` — per-track chip.
- `next-app/src/app/(today)/page.tsx` — origin-date hide + per-track cards.
- Migration helper: `next-app/src/lib/migrations/skipped-per-track.ts`.

## Related

- Memory: `feedback_confirm-first.md` — engine proposes, user Accepts.
  Move / Skip must stay explicit user actions, not silent engine reshuffles.
- Memory: `feedback_focused-not-full-plan.md` — focused-improvement, not
  full training plan. Multi-track support ≠ full HWPO-style week planning.
- `dev/active/product-concerns-2026-08-17/roadmap.md` — F6 concurrent tracks
  UI. This is the concrete opening move for that surface.
