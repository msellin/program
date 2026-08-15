# SaaS Launch — Tasks

Checkbox list per phase. Mark done as we ship.

## Prerequisites (before Phase 0)

- [ ] Confirm app name + domain availability
- [ ] Confirm free tier = 1 program (or 2)
- [ ] Confirm beta invite mechanism = Clerk allowlist
- [ ] Confirm migration approach for Margus's existing data
- [ ] Budget approval for legal review (€300-800)

## Phase 0 — Auth foundation (Week 1-2)

**Deliverable:** anyone can sign up, get an authenticated session, land on a "no active program" screen. Their data is isolated by uid.

- [ ] Create Clerk account, create app, get publishable + secret keys
- [ ] Install `@clerk/nextjs`
- [ ] Add `<ClerkProvider>` to `layout.tsx`
- [ ] Create `middleware.ts` protecting all routes except `/legal/*`, `/(auth)/*`, `/`, `/api/webhooks/*`
- [ ] Update `functions/api/state.ts` to read Clerk JWT → uid → KV key
- [ ] Update `src/lib/sync.ts` to include Clerk session cookie
- [ ] Add `UserProfile` fields to `Store` schema (as optional, back-compat)
- [ ] `/sign-in` and `/sign-up` pages using Clerk components
- [ ] Consent checkbox on `/sign-up` — separate from TOS, required
- [ ] Write privacy policy → `/legal/privacy`
- [ ] Write terms of service → `/legal/terms`
- [ ] Write medical disclaimer → `/legal/disclaimer`
- [ ] Add legal disclaimer as small footer link on every page
- [ ] "Delete my account" flow in Data page (clears KV + Clerk user)
- [ ] One-time script: migrate `user:margus:v2` → `user:${margus_clerk_uid}:v2`
- [ ] Test: sign up with a fresh email, land on onboarding stub, sign out, sign back in, see data persist
- [ ] Test: two separate accounts see fully isolated data
- [ ] Lawyer review of TOS + privacy policy
- [ ] Deploy Phase 0

## Phase 1 — Onboarding + first program (Week 2-3)

**Deliverable:** new user picks a program from a catalog, starts it, lands on Today with a working program.

- [ ] Design onboarding flow: 3 screens (weakness / goal / experience level)
- [ ] Build `/onboarding` route with progress indicator
- [ ] Skip onboarding if `user_profile.active_program_id` already set
- [ ] Extract Margus's current program → `public/data/programs/anterior-hip-rebuild.json` (v1 template)
- [ ] Add `program-templates.ts` loader that fetches by slug
- [ ] `/programs` catalog page — list all v1 programs (initially: 1)
- [ ] `/programs/[slug]` preview page — description, who / achievement / what to expect
- [ ] "Start this program" action — writes to user profile, redirects to Today
- [ ] Today page adjusts to program's week / phase for that user
- [ ] Handle "no active program" state on Today (show CTA to catalog)
- [ ] Test: fresh signup → onboarding → catalog → start program → Today shows week 1 correctly

## Phase 2 — Program catalog expansion (Week 3-5)

**Deliverable:** 5 more programs live, all with retest weeks.

For each program, the design work per program:
- [ ] Pick 3-6 core exercises appropriate to the weakness
- [ ] Design 8-week arc: assessment / foundation / progression / push / retest
- [ ] Write assessment protocol for week 0 baseline
- [ ] Write retest protocol for week 8 measurement
- [ ] Assemble `program.json`-shaped file
- [ ] Write catalog copy (short desc / who-for / what-you'll-achieve)
- [ ] Set default contraindications
- [ ] Link to (or create) an assessment pack if applicable

Programs to build:
- [ ] Deadlift base builder (Margus's own experience is the blueprint)
- [ ] First strict pull-up
- [ ] Zone-2 aerobic base (from scratch)
- [ ] Left/right hip asymmetry
- [ ] Shoulder overhead unlock

Catalog UI:
- [ ] Filter by category (rehab / strength / skill / endurance / mobility)
- [ ] Sort by difficulty / duration
- [ ] Preview modal / page per program
- [ ] "Switch program" flow with warning about losing in-progress state
- [ ] "Only 1 active program on free tier" gate — upgrade CTA when trying second

Assessment packs (extend the hip pack pattern):
- [ ] Shoulder overhead pack (5-6 items)
- [ ] Low back pack (deferred to v2)
- [ ] Aerobic baseline pack (resting HR, comfortable pace test — deferred to v2)

## Phase 3 — Billing (Week 5)

**Deliverable:** users can start a trial, subscribe, and cancel. Feature flags gate paid features.

- [ ] Paddle account, verify EE identity, get sandbox keys
- [ ] Create products in Paddle: monthly (€9.99), annual (€89)
- [ ] Embed Paddle Checkout in `/settings/billing`
- [ ] `functions/api/webhooks/paddle.ts` — listen for subscription lifecycle events
- [ ] Update user tier in KV on webhook receipt
- [ ] Feature-gate: multi-program (paid), full history (paid), PDF export (paid)
- [ ] Trial start on first checkout — 14 days grace before charge
- [ ] "Upgrade" CTA everywhere a paid feature is hit
- [ ] Cancel flow — one click, no dark patterns
- [ ] Resend email templates:
  - [ ] Welcome (post-signup)
  - [ ] Trial ending in 3 days
  - [ ] Payment succeeded / receipt
  - [ ] Payment failed / retry
  - [ ] Cancellation confirmation
  - [ ] Retest week reminder (per-program)
- [ ] Test end-to-end: signup → trial → charge → cancel → downgrade to free

## Phase 4 — Beta polish (Week 5-6)

**Deliverable:** 10 gym members can be invited and successfully complete week 1.

- [ ] In-app feedback form (`/feedback` → email to Margus)
- [ ] Onboarding copy polish — every screen readable in 5 seconds
- [ ] First-run tutorial overlay on Today (skippable)
- [ ] Retest week UX — clear "you're at the end of your program" state
- [ ] Post-retest actions: extend / switch / take break / graduate
- [ ] Sentry SDK integrated
- [ ] PostHog integrated with EU cloud, GDPR consent-gated
- [ ] Beta invite: Clerk allowlist mode enabled
- [ ] "How to use this app" one-pager doc (for Margus to hand out)
- [ ] Buy real domain, point Cloudflare Pages at it
- [ ] Announcement post / DM template for gym members
- [ ] First 3 beta users onboarded
- [ ] First-week check-in with beta users

## Deferred (post-beta)

- [ ] AI features (weekly narrative augment, cross-week patterns, notes expansion, coach memory)
- [ ] More programs (low back, knee, ankle, HYROX prep, etc.)
- [ ] D1 migration (when we need cross-user queries)
- [ ] Community / social features
- [ ] Wearable ingest (Whoop / Garmin / HealthKit)
- [ ] Video form-check
- [ ] Human coach integration
- [ ] Real "move whole week" cascade
- [ ] Per-set L/R log mode
- [ ] iOS / Android native shells

## Nice-to-have during Phase 4 (not blockers)

- [ ] Referral / invite credits (give a free month for each friend that signs up)
- [ ] Gym owner dashboard (aggregated adherence / injury trends across members)
- [ ] Program rating / feedback system
- [ ] Weekly digest email
- [ ] Push notifications for retest week
