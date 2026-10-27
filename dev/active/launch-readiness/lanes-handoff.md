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
- [lane 4 → lane 2b] **G-01 schedule side exists:** `firstSessionOffer(store: Store, slug: string, todayISO: string): FirstSessionOffer | null`
  in `next-app/src/lib/engine/first-session.ts` → `{ fromDate, blockInstanceIds, blockTemplateIds }`. Non-null only when the
  program started < 7 days ago, nothing is done yet, today has nothing on it, and a planned session exists within 7 days.
  **Today CTA should read: "Start your first session now"** (sub-line: "Your plan's first session is <weekday of fromDate>.
  Do it today instead?"). On tap: `moveWholeDay(offer.fromDate, todayISO, FIRST_SESSION_MOVE_REASON)` (existing store
  action), then open today's session. Pulling only the first session forward never tightens spacing to the next one.
  No change to existing users' calendars.
- [from lane 3 → lane 5] landing `CtaLink` (landing/src/components/CtaLink.tsx) appends any `utm_*` params from the landing URL to every sign-up link, so `terav.fit/programs/x?utm_campaign=y` arrives at `app.terav.fit/sign-up?next=/programs/x&utm_campaign=y`. The app's sign-up page needs to read `utm_*` from its own query string and save them (M-02). `dev/scripts/activation.sql` is not in the repo yet; the ad spec points to it.
- [from lane 3 → lane 4] The landing now marks only first-strict-pullup, handstand-walk and concurrent-strength-maintenance as open; the other five (engine-builder, block 2, rowing, overhead, muscle-up) show "Coming soon" with no sign-up button. Landing slugs still equal the manifest's public slugs (data-integrity test). If you hide any of them in the manifest, tell lane 3 so the catalog entry goes too. Also: `dev/scripts/check-landing-sync.sh` calls a `.py` that no longer exists; the vitest suite replaced it (I did not touch the script).
- [from lane 3 → anyone] I edited the "landing headline numbers match the app" block in `next-app/src/lib/data-integrity.test.ts`: it used to require the 125 / "Eight programs live" figures, which are withdrawn; it now requires the landing to print no study or program count. Rebase carefully if you touch that block.
