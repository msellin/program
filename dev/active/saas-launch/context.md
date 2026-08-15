# SaaS Launch — Context

## State right now

**App is live at:** https://program-v2.pages.dev
**Deployed via:** Cloudflare Pages (`program-v2` project, `main` branch)
**Deploy command:** `cd next-app && npm run build && wrangler pages deploy out --project-name=program-v2 --branch=main --commit-dirty=true`
**Data:** single user (Margus), KV key `user:margus:v2`, ~5 KB of state

**Everything is single-user hardcoded.** No auth, no billing, no user table, no multi-tenancy. But: the engine, notes signals, morning check, hip pack, weekly narrative, specialist report, and confirm-first pattern are all **user-agnostic pure functions** operating on a `Store` object. Multi-user is a wrapper concern, not an engine change.

## Locked-in decisions

- **Positioning:** "The app for people who have something specific to fix." Weakness-first program library. Not competing with Strong / Runna / Fitbod.
- **Program duration:** 8 weeks standard, 4-6 for skill quick-wins, 12-16 for deep tracks.
- **Pricing:** freemium subscription. €9.99/mo or €89/yr. 14-day trial requiring credit card.
- **Free tier:** 1 active program, full adaptive engine, 30d history.
- **Paid tier:** multi-program, full history, PDF export, AI narrative (when built).
- **Auth:** Clerk (Next.js SDK, free < 10k MAU, EU-compliant).
- **DB:** stay on KV per-user for MVP, migrate to D1 when cross-user queries needed.
- **Billing:** Paddle (merchant-of-record, handles EU VAT).
- **Email:** Resend.
- **Analytics:** PostHog EU cloud.
- **Error tracking:** Sentry free tier.
- **No marketing site for beta.** Signup by invite.

## Files that will change

Foundation (Phase 0):
- `src/app/layout.tsx` — add `<ClerkProvider>`
- `src/middleware.ts` — new, Clerk auth on protected routes
- `functions/api/state.ts` — read Clerk JWT, use `user:${uid}:v2` key
- `src/lib/sync.ts` — sends Clerk session to state endpoint
- `src/lib/schemas.ts` — add `UserProfile` schema (or store user meta inside existing Store)
- New page: `src/app/(auth)/sign-in/page.tsx`
- New page: `src/app/(auth)/sign-up/page.tsx` (with consent checkbox)
- New page: `src/app/legal/privacy/page.tsx`
- New page: `src/app/legal/terms/page.tsx`
- New page: `src/app/legal/disclaimer/page.tsx`

Onboarding (Phase 1):
- New page: `src/app/onboarding/page.tsx` — weakness / goal / experience
- New page: `src/app/programs/page.tsx` — catalog
- New page: `src/app/programs/[slug]/page.tsx` — program preview
- New file: `src/lib/program-templates.ts` — loader for `programs/*.json`
- Move `public/data/program.json` → `public/data/programs/anterior-hip-rebuild.json`

Program authoring (Phase 2):
- 5 new files under `public/data/programs/`, one per program

Billing (Phase 3):
- New page: `src/app/settings/billing/page.tsx`
- New Pages Function: `functions/api/webhooks/paddle.ts`
- Store extension: `tier`, `paddle_customer_id`, `trial_ends_at`

## Files NOT to change

- `src/lib/engine/*` — all engine code is user-agnostic. Do not touch during Phase 0.
- `src/components/workout/*` — UI components read from Zustand, they'll just receive different data per user.
- `data/exercises.json`, `data/clinical-context.json` — static content, unchanged.
- `data/program.json` at the repo root — stays as Margus's canonical source, becomes template #1.

## Dependencies between phases

- Phase 1 (onboarding) requires Phase 0 (auth) — otherwise no user to onboard.
- Phase 2 (catalog) requires Phase 1 (loading a program).
- Phase 3 (billing) is independent of 1 + 2 — could ship in any order once Phase 0 done. But without programs, nothing to pay for.
- Phase 4 (polish) requires all prior phases.

## Where things live at the end of Phase 0

Per-user KV state stays the same shape:

```
KV: user:{clerk_uid}:v2 → Store
```

`Store` gets extended with:

```typescript
{
  version: 2,
  user_profile?: {                   // new, optional so migration is clean
    weakness_at_signup?: string,
    goal_at_signup?: string,
    active_program_id?: string,
    active_program_started_at?: string,
    consent_symptom_data_at?: number,
    tier?: "free" | "trial" | "paid",
    ...
  },
  ...  // existing fields: logs, training_maxes, cycle, contraindications, etc.
}
```

Billing tier is authoritative in Paddle. KV mirror is a cache for fast reads.

## Open questions (must answer before Phase 0)

1. **App name.** Placeholder is "Program". Real name candidates:
   - `weakpoint.app` — direct, memorable
   - `weakness.app` — most literal
   - `holdyouback.app` — matches the tagline
   - `movecoach.app` — softer
   - `strand.app` — abstract, available domains
   - **My pick if pushed:** `weakpoint.app` if domain is free.
2. **Free tier program count.** 1 or 2?
   - **My pick:** 1. Keeps paid pull strong. Users with multiple weaknesses upgrade for parallel tracks.
3. **Beta invite mechanism.**
   - Option A: Clerk allowlist mode, Margus invites via email.
   - Option B: invite codes, distribute at gym.
   - **My pick:** A. Zero code to write.
4. **Margus's data migration.**
   - Wipe fresh under new auth uid, or import current state to `user:${margus_clerk_uid}:v2`?
   - **My pick:** import. Continuity matters.

## What Margus is committing to

- Being user #1 of the multi-user version.
- Program design collaboration (5 programs × ~20 hours = ~100 hours of design work).
- Legal review budget: €300-800 one-off.
- Domain purchase (~€15/yr).
- 4-6 weeks of build time before beta.
