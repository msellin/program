# F8-second REAL — Today → dashboard + /session/[slug] route split

**Status:** planned. Not started. Est 5-10h focused work.

## Goal

Today becomes a dashboard-only route. Session UI moves to a new
`/session/[slug]` route. Users see morning-check + workout summary +
extras + proposals on Today; tap "Open session →" to enter the focused
workout view.

Per design-lead brief `dev/audits/app/2026-08-19-founder-obs-design-lead.md`
§Decision 1 (IA restructure) — Today-dashboard skeleton portion. First
push of F8 (header collapse + Settings v1 + Events kill) already shipped
in `c1bd940`. This plan covers the deferred Today refactor + route split.

## Scope

### 1 · Extract session state into a shared component

Today's `page.tsx` has ~20 useStore hooks + several derived values
(`activeSlugs`, `programs`, `groups`, `byId`, `primary`, `phase`,
`blockObjectOn`, etc.) that both the dashboard and the session view
need. Options:

**Option A (preferred):** create a shared `SessionModel` hook that
returns all the derived state:

```ts
// next-app/src/lib/useSessionModel.ts
export function useSessionModel(dateISO: string) {
  const activeProgramSlug = useStore((s) => s.store.user_profile?.active_program_id);
  const activeProgramIds = useStore((s) => s.store.user_profile?.active_program_ids);
  // ... consolidate ~20 hooks + derivations
  return { activeSlugs, programs, groups, byId, primary, phase, blockObjectOn, ... };
}
```

Both Today's dashboard and `/session/[slug]` call this hook. Session
render is duplicated between the two initially — that's OK; the
consolidation lets them diverge cleanly later.

**Option B:** keep Today as-is, create `/session/[slug]` as a straight
Next.js redirect to `/?date={date}`. Route exists, no UX change.
Rejected — no user value.

### 2 · Route file skeleton

```tsx
// next-app/src/app/session/[slug]/page.tsx
"use client";
import { useSearchParams } from "next/navigation";
import { SessionView } from "@/components/session/SessionView";

export default function SessionPage({ params }: { params: { slug: string } }) {
  const search = useSearchParams();
  const date = search?.get("date") ?? new Date().toISOString().slice(0, 10);
  return <SessionView slug={params.slug} date={date} />;
}
```

`SessionView` hosts:
- `HeroStateCard` (post-graduation banner OR the readiness band)
- `DateNav` — session-scoped date picker
- Taper info banner
- The block/exercise rendering loop (currently `page.tsx:440-499`)
- `RunSlotCard` (log an extra session)
- `SessionActions` OR `PerProgramActions` per block-object flag

### 3 · Today refactor into dashboard blocks

Replace the current session-rendering block on Today with:

```
[MorningCheck DashboardBlock]  — when no check today
  eyebrow: "Morning check"
  title: "Log today's state"
  lede: "Symptoms, mood, sleep — 30 seconds."
  CTA: "Start check →"  route: /check

[Workout DashboardBlock]  — when workout scheduled
  eyebrow: "TODAY · {primary.name}"
  title: {block-list summary}   e.g. "Barbell reintro · 3 blocks · ~48 min"
  lede: {phase + week readout}
  CTA: "Open session →"  route: /session/{primary.slug}?date={activeDate}

[Extras DashboardBlock]  — always visible when active_program_ids > 1
  eyebrow: "Extras"
  title: "Layer in a side track"
  CTA: "Log an extra session →"  route: /extras

[Proposals / Signals stays as-is]
```

### 4 · Kill dead code from Today

Once session UI moves to /session/[slug]:
- Remove `BlockSection` inline render on Today
- Remove `SessionActions` / `PerProgramActions` inline render
- Remove RunSlotCard inline (moves to /session)
- Simplify hooks — Today only needs primary + hydration + logs for the
  morning-check state + workout summary

## Risks

- **State duplication:** if both Today and /session call `useSessionModel`,
  hooks fire on both routes. Keep the model cheap (no heavy derivations
  in the shared hook — memoize).
- **Deep-link back-navigation:** `/session/{slug}` must have a back link
  to Today (browser back is unreliable when landing via URL).
- **Persona harness:** all 15 persona flows currently exercise Today.
  Need a new capture per persona for /session/{slug} to keep coverage.
  Adds ~30-45 exercise steps to the harness.
- **Tests:** none of the existing 160 tests touch the session-vs-dashboard
  split; likely no test regressions but need e2e smoke tests for the
  new route.

## Preconditions

- F9 DashboardBlock primitive shipped ✓ (2026-08-19 `b68812f`)
- ReadinessDot killed ✓ (2026-08-19 `a2bc820`) — dashboard blocks
  provide the state signal now.
- Header collapsed ✓ (2026-08-19 `c1bd940`).

## What NOT to do

- Do NOT redirect /session/{slug} → / (no user value).
- Do NOT duplicate the BlockSection component into a second file — use
  the SAME component from both routes via the shared hook.
- Do NOT ship without adding /session/{slug} to the persona harness (or
  the audit round can't catch regressions).

## Estimated split

- ~1h · SessionModel hook extraction + shared derivations
- ~2h · /session/[slug]/page.tsx + SessionView component + tests
- ~2h · Today refactor — dashboard blocks + kill inline session UI
- ~1h · Persona harness — add /session/{slug} capture per persona
- ~1h · e2e smoke tests + regression check
- ~2h · buffer for edge cases (post-graduation, block-object flag off,
  multi-track, taper phase, day1-empty state)

**Total: 7-9h focused. Do NOT continue-thread — needs a dedicated session.**
