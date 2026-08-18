# SaaS Launch — Tasks

Checkbox list per phase. Mark done as we ship.

**Reconciliation pass 2026-08-18:** Doc originally written when the plan was to
use Clerk. We use **Supabase** instead. Phase 0 items relating to Clerk are
STALE — the Supabase-equivalent items are marked done inline. Roughly ~60% of
Phase 0 shipped, ~95% of Phase 1, ~70% of Phase 2, 0% of Phase 3, ~20% of Phase 4.

## Prerequisites (before Phase 0)

- [x] Confirm app name + domain availability — **Terav** + terav.fit / app.terav.fit purchased 2026-08-17
- [ ] Confirm free tier = 1 program (or 2)
- [ ] Confirm beta invite mechanism (was "Clerk allowlist"; now Supabase-based)
- [ ] Confirm migration approach for Margus's existing data
- [ ] Budget approval for legal review (€300-800)

## Phase 0 — Auth foundation (Week 1-2)

**Deliverable:** anyone can sign up, get an authenticated session, land on a "no active program" screen. Their data is isolated by uid. **STATUS: shipped via Supabase.**

- [x] ~~Clerk account~~ **STALE** → Supabase project live, keys in env
- [x] ~~Install `@clerk/nextjs`~~ **STALE** → uses `@supabase/supabase-js` + `@supabase/ssr`
- [x] ~~`<ClerkProvider>` in `layout.tsx`~~ **STALE** → client-side sessions via `StoreHydrator` + `useSession()`
- [x] AuthGate.tsx (client) replaces `middleware.ts` for route protection
- [x] `functions/api/state.ts` reads Supabase JWT → uid → KV key
- [x] `src/lib/sync.ts` sends Supabase access token as Authorization header
- [x] `user_profile` fields on `Store` schema (uid, email, tier, active_program_id, program_states)
- [x] `/sign-in` and `/sign-up` pages using Supabase auth
- [x] Consent checkbox on `/sign-up`
- [x] Privacy policy → `/legal/privacy` (dated 2026-08-11, "Beta — lawyer review pending")
- [x] Terms of service → `/legal/terms`
- [x] Medical disclaimer → `/legal/disclaimer`
- [x] Legal disclaimer footer link (LegalLayout)
- [ ] **"Delete my account" cascade** (~M) — `/data` has local wipe; needs Supabase auth user deletion + KV cascade
- [x] ~~One-time script: migrate `user:margus:v2` → `user:${margus_clerk_uid}:v2`~~ **STALE**
- [x] Test: sign up fresh email → sign out → sign back in → data persists
- [x] Test: two accounts see fully isolated data (verified via session-binding logic 2026-08-18 refresh-loss fix)
- [ ] **Lawyer review of TOS + privacy policy**
- [x] Deploy Phase 0 — live at app.terav.fit

## Phase 1 — Onboarding + first program (Week 2-3)

**Deliverable:** new user picks a program from a catalog, starts it, lands on Today with a working program. **STATUS: ~95% shipped.**

- [x] Design onboarding flow — per-program intake wizard (screening / self-report / physical tests / consent / tier result)
- [x] `/programs/[slug]/intake` route with sticky progress rail (IntakeClient.tsx)
- [x] Skip intake if `user_profile.program_states[slug].intake_answers` already set
- [x] Programs live in `public/data/programs/*.json` (9 as of 2026-08-18)
- [x] `data-loader.ts` fetches program by slug
- [x] `/programs` catalog page with 9 programs listed
- [x] `/programs/[slug]` preview page with intake CTA
- [x] "Start this program" writes to `user_profile.active_program_id` + calls `commitImmediate` (refresh-loss fix 2026-08-18)
- [x] Today shows current week/phase for the active program
- [x] "No active program" state with CTA to catalog (EmptyStateCard on Today)
- [x] Test: fresh signup → catalog → start program → Today shows week 1

## Phase 2 — Program catalog expansion (Week 3-5)

**Deliverable:** 5 more programs live, all with retest weeks. **STATUS: ~85% shipped — 9 programs in catalog, catalog UI polish + pricing gates remain.**

Per-program design pattern (used across all shipped programs):
- [x] Core exercises picked per weakness
- [x] Multi-week arc: assessment / foundation / progression / push / retest
- [x] Retest metrics via `retest_metrics[]` + retest evaluator engine
- [x] `program.json`-shaped files at `public/data/programs/*.json`
- [x] Catalog copy authored (name, category, weakness_target, tags, short_description, etc.)
- [x] Contraindications on skill programs (Handstand Walk, First Strict Pull-Up, Muscle-Up all declare prerequisites)
- [x] Assessment pack pattern reused across hip-rebuild + skill programs

Programs shipped:
- [x] Anterior Hip Rebuild (Margus's own)
- [x] Engine Builder (aerobic base, block 1)
- [x] Rowing 2K Test Prep (race-anchored, HERITAGE-classified)
- [x] Concurrent Strength Maintenance (aerobic + strength interleave)
- [x] Handstand Walk (skill, motor-learning, 4 tiers)
- [x] Overhead Mobility (mobility, motor-learning wired 2026-08-18)
- [x] First Strict Pull-Up (skill, multi-tier, added 2026-08-18)
- [x] Muscle-Up Acquisition (skill, multi-tier, added 2026-08-18)
- [x] Engine Builder Block 2 (threshold expansion, added 2026-08-18)
- [ ] Deadlift base builder (not built — was in the original plan)
- [ ] Zone-2 aerobic base (subsumed by Engine Builder)
- [ ] Left/right hip asymmetry (not built)

Catalog UI:
- [x] Filter by category
- [ ] **Sort by difficulty / duration** — not visible in UI
- [x] Preview page per program (`/programs/[slug]`)
- [ ] **"Switch program" flow with warning** — multi-program is enabled, but no explicit warning on switch
- [ ] **"Only 1 active program on free tier" gate** — tier field exists in schema, no feature gate implemented (needs Phase 3 billing to be meaningful)

Assessment packs:
- [x] Hip flexor pack (existing)
- [ ] Shoulder overhead pack (5-6 items) — deferred, Overhead Mobility has retest_metrics inline
- [ ] Low back pack (deferred to v2)
- [ ] Aerobic baseline pack (deferred to v2)

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
