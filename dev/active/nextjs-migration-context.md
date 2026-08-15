# Next.js migration — context (2026-08-06)

## Where we are

- **Current app** (`/index.html` + `/data/*.json`) is unchanged and still deployed at `program-f3r.pages.dev`. P1 fixes (5/6) are live. Multi-set logging was deferred to the new stack.
- **New stack** bootstrapped at `/Users/margussellin/www/program/next-app/`:
  - Next.js 16.3 (App Router), React 19, TypeScript 5 strict
  - Tailwind CSS 4 with editorial design tokens ported from old app (`ground / surface / ink / muted / line` etc.)
  - Zod for runtime schema validation
  - date-fns, lucide-react, clsx, tailwind-merge, cva
  - Vitest + @testing-library/react + happy-dom for unit tests
  - `output: 'export'` — static export for Cloudflare Pages
  - Bottom-tab navigation (per audit research: universal pattern across 10 strength apps)
- **Bootstrap verified**: `npm run build` produces 11 static routes in `out/`. Serving `out/` on localhost renders the layout, Today page loads `program.json`, and the correct strength blocks show up for today.

## File layout

```
next-app/
  src/
    app/
      layout.tsx                # root layout + metadata + BottomNav
      globals.css               # tailwind + design tokens
      page.tsx                  # Today — partly ported (loads program, filters strength blocks)
      week/page.tsx             # stub
      extras/page.tsx           # stub
      check/page.tsx            # stub
      progress/page.tsx         # stub
      history/page.tsx          # stub
      data/page.tsx             # stub
      guide/page.tsx            # stub
    components/
      nav/BottomNav.tsx         # 8-tab bottom nav with lucide icons
      ui/                       # (shadcn-style primitives — empty for now)
      workout/                  # (ExerciseCard, SetRow, SuggestionBox — empty for now)
    lib/
      schemas.ts                # Zod schemas for program/exercises/log
      storage.ts                # loadStore/saveStore with sanitisation + v1 migration
      data-loader.ts            # cached fetches for /data/*.json
      utils.ts                  # cn(), today(), iso()
      engine/                   # (suggest, adapt — empty for now)
  public/
    data/                       # canonical JSON files (copied from ../data/)
    manifest.json
    icons + apple-touch-icon
```

## Design decisions locked in

- **Bottom tabs, 8 max.** Universal across strength apps. Icons + short labels.
- **`entry.sets` array is the schema.** ExerciseLog can still hold legacy `weight_kg`/`reps`/`rpe` fields for backward compat while old app is running.
- **Data flow:** static JSON in `public/data/` for canonical program/exercises/clinical. localStorage for logs, TMs, cycle position. Later: replace localStorage with VPS-backed API — schemas already Zod-defined.
- **Adaptive engine spec captured in `program.json.adaptive_engine`.** Implementation goes in `src/lib/engine/adapt.ts` and will be pure functions with Vitest tests.

## What's left to build (in order)

### Phase A — feature parity (goal: replace current app on program-f3r)

1. Port design tokens fully — verify iPhone SE + Pro viewports don't blow up vitals bar (the P1.1 bug from old app must not regress).
2. **Today page** — full implementation with ExerciseCard component and multi-set logging (from schema day 1).
3. **ExerciseCard** — the workhorse component. Set rows with `prev | weight | reps | RPE | ✓` (industry standard row). Suggestion box computed from TM + prior sets + morning-check state.
4. **useStore hook** — reactive access to localStorage-backed store with save on every change. Consider Zustand or lightweight custom.
5. **Suggestion engine** (`lib/engine/suggest.ts`) — port from old app's `suggestForExercise`, add missing 80% cap enforcement + phase-6 peak percentages + phase-4 week clamp fix (three code bugs the coach caught).
6. **Week page** — 7-day grid, today highlighted, tap a day to see its blocks.
7. **Extras page** — accessory + run blocks, always available.
8. **Morning check page** — symptom sliders + booleans + derived state save.
9. **Progress page** — TM editor + milestone table + stretch-targets button.
10. **History page** — symptom sparklines + day log. Add per-lift weight-progression sparkline (the "no strength app has this" audit finding).
11. **Data page** — export / share / copy / import / wipe. Migration from old localStorage key `program.log.v2`.
12. **Guide page** — full glossary + tab explainer + red flags.

### Phase B — the differentiators

13. **Symptom-vs-load chart** on Progress. Recharts or uPlot. Data already in the store.
14. **Adaptive engine** (`lib/engine/adapt.ts`) — pure functions triggered at cycle end. On green cycle → TM bump. On amber → hold. On red → -10%. On >14-day gap → insert calibration mini-cycle. Unit-tested.
15. **Waypoint accelerator** — beat a milestone by 4+ weeks → surface a UI banner offering to move the whole trajectory forward.
16. **Post-birthday auto-generation** — hit or miss on 2027-04-24, engine generates next waypoint.

### Phase C — infra

17. PWA proper (service worker via Serwist or similar next-16-compatible plugin).
18. VPS + Postgres backend for cross-device sync + Claude-Code cross-chat DB reads.
19. Auth (probably Cloudflare Access in front for zero backend code).

## Two dev-flow decisions to make before Phase A implementation

1. **Where does the new app deploy first?** Options:
   - a) New Cloudflare Pages project `program-v2` for parallel testing, cut over when parity is reached
   - b) Preview branch on the existing project
   - c) Local only until fully ready
2. **Migration policy for logs.** When new stack goes live: import from old `program.log.v2` localStorage automatically (already implemented in `storage.ts`), OR require manual export-then-import? Auto-import is cleaner but risks silent data corruption if the migration has bugs.

## Not touched by the migration
- `data/program.json`, `data/exercises.json`, `data/clinical-context.json`, `data/open-questions.json` — canonical, still master files
- `dev/audits/` reports — synthesis + individual audits stay as reference
- `source-pdfs/` — clinical PDFs, gitignored, out of scope
- Old app files — leave in place until new one takes over

## AGENTS.md warning

Next.js 16 has breaking changes vs. common training data. The `node_modules/next/dist/docs/` tree has the current authoritative docs. When implementing pages, consult that before assuming an older Next pattern works.
