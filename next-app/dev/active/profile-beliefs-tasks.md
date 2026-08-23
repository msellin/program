# Profile beliefs + Plan preview — task checklist

## Profile: "what Terav believes about you" (screen 2b, scoped)
- [x] `src/components/profile/BeliefsSection.tsx` — training max rows
      (editable, `setTM`) + tier row (read-only by design, live why from
      `tier_history`, "See Progress →" pointer to the real path)
- [x] Wired into `src/app/profile/page.tsx` after the identity chip
- [x] tsc clean, eslint unchanged from baseline (71 problems, verified
      via git stash diff), vitest 167/167
- [x] Live-verified on the sandboxed e2e test account: tier row renders,
      expands, shows correct "Your intake answers put you here." (no
      tier_history yet) + the Progress link, no console errors. TM rows
      not visually confirmed — this account has no training max set and
      manufacturing one needs a multi-step log-and-accept flow judged
      not worth chasing; the edit interaction is the identical stepper
      pattern already proven live elsewhere this session (SetView,
      CycleStartCard), and `setTM` is an existing, already-used action.

## Plan: "Preview →" for future scheduled days
- [x] Real gap, not a nice-to-have — surfaced by the user pointing out
      the app is used as an installed PWA (no address bar), so my
      earlier "just visit this URL" suggestion for viewing a future
      day's session wasn't actually usable. See
      [[feedback_pwa-no-url-bar]] in the memory system.
- [x] `src/app/plan/page.tsx`'s `WeekDayActions` — future days with a
      scheduled session now get a "Preview →" link (same
      `/session/[slug]?date=` pattern as the existing past-day "Log
      session →" verb) instead of an empty grid placeholder
- [x] tsc/eslint clean (pre-existing baseline unchanged), vitest 167/167
- [x] Live-verified: expanded a real future strength day (Wed 26 Aug,
      "Front squat"), tapped Preview →, landed correctly on the new
      Brief screen for that date, no console errors

## Both
- [ ] Commit + push
- [ ] Confirm Cloudflare Pages auto-deploy
