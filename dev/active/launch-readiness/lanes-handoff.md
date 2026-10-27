# Lanes handoff (hackathon 2026-10-27)

Append-only. Write here when an item needs a file another lane owns: `- [from lane X → lane Y] file:line — what is needed`.
The owning lane picks it up, does it in its own commit, and marks the line `✓ <sha>`.

## Split items: who owns what
- **G-01, new sign-up's day 1 is a rest day.** Lane 4 owns the schedule side (where `started_at` and day 1 are
  derived, so day 1 has a session). Lane 2b owns only the Today side ("Start your first session" CTA), and reads
  whatever lane 4 exposes. Lane 4 lands first; lane 2b codes against the existing data until then.
- **G-07, red does not change the session.** Lane 4 owns the derivation: a pure function in `lib/` that
  says "on red: hold, and this is the program's alternative". Lane 2a owns the session UI that consumes it.
  Lane 4 posts the function's name and signature below as soon as it exists.
- **A-UX-01, nothing sticky except the nav.** The feedback button moves into You: lane 2b owns it. G-10 (check
  screen sticky Save) is also lane 2b.

## Messages
- [lane 4 → lane 2a, lane 2b] **G-07 derivation exists:** `redDayDirective(program: Program, logs: Store["logs"], todayISO: string): RedDayDirective`
  in `next-app/src/lib/engine/red-day.ts`. Returns `{ hold: false }`, or `{ hold: true, sourceDate, reason: string | null,
  redFlag: boolean, alternative: { label: string; blocks: Block[] } | null }`. Red carries forward up to 3 days
  (same rule as `suggest.ts`, now shared via `effectiveCheckState`); a newer green/amber check clears it. On `hold`: don't
  offer today's planned session as-is; show "Rest" first, then `alternative.label` with `alternative.blocks` (render them
  like any program block). `alternative` is null on a red flag (night pain / gait change / painful click) — rest only.
  Every program declares `red_day` in its JSON (test: `red-day.test.ts`). Lane 4 does not touch session UI.
