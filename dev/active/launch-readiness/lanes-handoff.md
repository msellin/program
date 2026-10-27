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
- [from lane 5 → lane 3] `landing/src/components/sections/Hero.tsx:81`, `BetaCTA.tsx:22` — the app's sign-up captures `utm_*`/`fbclid`/`gclid` from ITS OWN query string (`next-app/src/lib/attribution.ts`); storage does not cross origins. The landing must read them (and persist first-touch in its own storage) and append them to every `${APP_URL}/sign-up?next=...` CTA, else M-02 captures nothing. Hero/BetaCTA also still link bare `/sign-up` (no `?next=`).
- [from lane 5 → lane 2b/profile owner] `app/profile/page.tsx` — audit g2: delete account takes 4 taps from Today (Profile tab, identity chip, Delete, Delete forever). Add a direct "Delete account" row linking `/account` in Profile to make it 3. The `/account` page itself is already 2 taps.
- [from lane 5 → coordinator] Supabase Redirect URLs allow-list must include `https://app.terav.fit/**` (confirm email now redirects to `/sign-in?next=...`). Templates in `supabase/templates/` (README lists API fields). Turnstile: set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` secret in GitHub Actions, THEN enable Supabase captcha; widget is on sign-up and sign-in (sign-in/resend/reset also send tokens). Google OAuth is not captcha-checked by Supabase.
- [lane 4 → lane 2b] `next-app/src/app/plan/page.tsx:216` — **G-09 needs a one-line swap in your file:**
  `const weekPhase = activePhaseFor(program, iso(viewedMon), userProfile);` →
  `const weekPhase = activePhaseForWeek(program, iso(viewedMon), userProfile);` (import from `@/lib/engine/schedule`).
  The function exists on main (tested in `phase-for-week.test.ts`): first day of the week any phase covers decides it, so a
  mid-week starter's week 1 stops saying "No phase covers this week". Please mark ✓ <sha> here when done.
- [lane 4 → lane 2a] `next-app/src/components/session/DaySession.tsx` ~line 158 (the `if (blockObjectOn)` branch of
  `plannedBlocks`) — **SF-04 needs the CSM softening on the session path.** That branch returns scheduled blocks without
  `applyProgramSoftening`, so Today shows the 4×4 withdrawn / at 3×4 while the session still serves full 4×4 (the legacy
  branch gets it via `blocksForDate(..., store)`). Fix: wrap the branch's result —
  `return applyProgramSoftening(<the mapped array>, program, activeDate, store);` (import from `@/lib/engine/plan-generator`;
  TodaySession.tsx:216 does exactly this). Lane 4 made red days count toward the rule (only amber did).
- [from lane 2a → lane 4] DaySession.tsx: blockObjectOn branch now wrapped in applyProgramSoftening (SF-04 request) ✓
- [from lane 1 → owner] Edge cache still serves `app.terav.fit/data/{clinical-context,log,program,open-questions}.json` as 200 at the plain URL (age ~2h; `?x=1` gives 404). Files are gone from the deploy; purge those 4 URLs in the Cloudflare cache (needs a zone token Lane 1 does not hold).
- [from lane 1 → owner] Report's "Clinical constraints on file" section was deleted with clinical-context.json (owner's hip report loses it); restore later via an auth-checked function if wanted.
