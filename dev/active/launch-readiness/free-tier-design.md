# Free tier + Pro: design and verdict (2026-10-27)

**Owner idea:** a fully free tier like GOWOD's, where Pro adds more and free users want to switch.
**Verdict:** **yes, do it, as a free tier plus a reverse trial.** Every new account gets Pro free for 14 days
with no card, then drops to Free unless the user upgrades. Evidence: moderate on the conversion numbers
(RevenueCat), weak on everything specific to Terav.

## Why this shape
- **Ads can say "Free" truthfully, every day,** not "free beta" now and a paywall later. Free sign-ups are also
  cheaper to buy.
- **Freemium alone converts poorly:** a 2.1% median vs 10.7% for a hard paywall at day 35 (RevenueCat 2026, in
  `market/pricing-trials.md`). The reverse trial gets the first-weeks experience of Pro without a card wall,
  then makes "keep what you had" the reason to pay.
- **Peers do the same:** GOWOD (free tier, free assessment, 7-day Premium trial), Hevy (free, with caps on volume
  and history, not features), Calisteniapp and Thenx (free with in-app purchase). A free tier is the norm here;
  a 14-day card trial is not.
- **It's already half-designed:** `saas-launch/plan.md` §4 drew this split, and `MULTI_MAIN_ENABLED` already
  limits everyone to one active focus.

## The line (draft; owner picks)
**Free, forever.** Must be genuinely useful, or the free users never trust the paid offer:
- One active focus at a time, from the full catalog.
- Full sessions, logging and the adaptive engine, **including the proposals with their reason and Accept**.
  That is the hook, so don't hide it.
- **All safety features: the morning check, red/amber gate and red flags. Never paywalled.**
- The last 30 days of history and progress.

**Pro (€9.99/month, €89/year; the 14-day reverse trial at sign-up):**
1. **More than one focus at once** (for example pull-up plus engine), with the interference handling.
   `MULTI_MAIN_ENABLED` per user, not global.
2. **Full history and long-range progress:** every retest, trend charts, multi-year view.
3. **Retest and assessment reports**, plus a shareable coach or physio report (the specialist-report idea).
4. **"Next focus" planning when a program ends.** This targets goal-reached churn (`market/retention-churn.md`).
5. **Imports:** Concept2 and Garmin/FIT, so off-plan work counts (roadmap: off-plan visibility P1).
6. **Later:** video feedback (`findings-video-coach.md`) and new programs first.

**Moments that prompt an upgrade** (shown once, dismissable, never during a session):
- Day 12 of the trial: "2 days left of Pro. Here's what you used."
- The trial ends while a second focus is active: keep both, or choose one.
- Opening history older than 30 days.
- Finishing a program: "Plan your next focus" is Pro.
- A retest completes: the full report is Pro.

## Risks
- **Free users who never pay** still cost Supabase rows and email sends. Fine at beta scale; watch the plan limits.
- **Gating the second focus** only works if people want two. Unproven. The ad test plus Pro clicks will tell.
- **Don't gate the core loop** (proposal + reason + Accept). Gate depth and breadth, not the thing ads promise.
- **Copy:** "Free" in ads must mean the free tier above. The 14-day Pro trial is a bonus, not the offer.

## Build (Stripe, before scale; not today)
- `tier` + `trial_ends_at` in the profile: they exist but nothing reads them (`saas-launch/plan.md` §4).
- One `entitlements()` helper that every gate calls. Start the trial when the account is created.
- Stripe Checkout and Customer Portal, plus a webhook Pages Function → `tier`.
- Replace the global `MULTI_MAIN_ENABLED` (`next-app/src/lib/useStore.ts:1064`) with an entitlement check.
- Gate the history range and report export. Trial-end email via Resend.
- Effort: about 1–1.5 days, including tests. It doesn't block today's ads: a free beta is the free tier with
  every gate open.
