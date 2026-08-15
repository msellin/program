# SaaS Launch Plan

**Goal:** Turn the single-user rehab app into a freemium multi-user product that Margus's CrossFit gym members can beta-test within 4-6 weeks.

## 1. Product positioning (locked)

**Tagline direction:** *"Every athlete has one thing that's holding them back. This is the app that fixes it."*

**The app is:**
- A library of focused 8-week programs, each targeting a specific weakness (injury, movement, strength, skill, endurance, mobility).
- Personalized to the user's morning check, symptom trend, RPE, and free-text notes.
- Confirm-first — the engine proposes, the user accepts.
- Ends with a retest and a specialist-ready report.

**The app is NOT:**
- A daily fitness tracker (Strong / Hevy own that).
- A race training app (Runna owns that).
- A class scheduling / WOD tool (SugarWOD / Wodify own that).
- A rehab-only app (Hinge Health owns that).

**The moat:** the composition — weakness-first program design + adaptive engine + confirm-first + specialist-friendly output. Nobody in the market has all four.

## 2. Program catalog — v1 launch scope

Ship **5-6 hand-designed programs**, all 8 weeks, launch batch. Grow from there.

Priority for v1 (in order):

1. **Anterior hip + strength rebuild** — Margus's current program, generalized. Highest confidence because it's tested on user #1.
2. **Deadlift base builder** — most-requested strength target, universal appeal.
3. **First strict pull-up** — clear before/after, viral-shareable, low physical risk, broad audience.
4. **Zone-2 aerobic base (from scratch)** — for the "I want to build engine" crowd. Longevity vocabulary — matches 2026 market trend.
5. **Left/right hip asymmetry** — differentiator no other app has, plays to our unilateral tracking.
6. **Shoulder overhead unlock** — high-demand across CrossFit, HYROX, WL populations.

Deferred to v2 (still map the shape now so program schema supports them):
- Low back — Bertolotti-friendly / non-specific
- Knee — patellar tendinopathy
- Ankle / plantar
- Bench-press L/R symmetry
- Overhead press unlock
- Squat depth + hip mobility
- Pull strength (BW → weighted)
- First strict HSPU, pistol, T2B, muscle-up
- 5k time-drop, rowing 2k engine, HYROX 8-week block, Metcon capacity
- Snatch mobility, clean receiving, split-jerk stability
- General mobility / thoracic / ankle DF

## 3. Program shape (data model)

Every program follows the same shape so the engine treats them uniformly.

```typescript
type ProgramTemplate = {
  id: string;                      // stable, kebab-case
  slug: string;                    // URL: /programs/hip-flexor-recovery
  name: string;                    // display: "Hip flexor recovery"
  category: "rehab" | "strength" | "skill" | "endurance" | "mobility" | "asymmetry";
  weakness_target: string;         // "anterior_hip" | "deadlift_base" | ...
  duration_weeks: 4 | 6 | 8 | 12 | 16;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites?: string[];        // e.g. muscle-up prep requires strict pull-up
  short_description: string;       // one line, catalog card
  who_this_is_for: string;         // 2-3 sentences, program preview
  what_youll_achieve: string;      // 2-3 sentences, includes retest metric
  program_data: Program;           // existing program.json shape
  assessment_pack_id?: string;     // hip pack, shoulder pack, etc.
  default_contraindications: string[];  // pre-populates store.contraindications
};
```

**Program arc (universal):**
- **Week 0:** assessment week — establish baseline, low load
- **Weeks 1-2:** foundation — introduce load / pattern
- **Weeks 3-5:** progression — build capacity
- **Weeks 6-7:** push — peak intensity
- **Week 8:** retest — measure change, decide extend / graduate / switch

Retest week produces the "before/after" that makes the specialist report meaningful and the retention story emotional.

## 4. User model + tiers

```typescript
type UserProfile = {
  uid: string;                       // Clerk user id
  email: string;
  display_name?: string;
  created_at: number;
  weakness_at_signup?: string;       // catalog choice at onboarding
  goal_at_signup?: string;           // optional secondary
  active_program_id?: string;
  active_program_started_at?: string;
  tier: "free" | "trial" | "paid";
  trial_ends_at?: string;
  paddle_customer_id?: string;
  paddle_subscription_status?: string;
};
```

**Tier gating (deliberately generous free tier):**

Free:
- 1 active program at a time
- Full adaptive engine (RPE, notes signals, confirm-first, symptom check)
- 30 days of history
- Cross-device sync via account

Paid (€9.99/mo or €89/yr):
- Multiple concurrent programs (e.g. hip + shoulder in parallel)
- Full multi-year history
- Specialist report PDF export
- AI-augmented weekly narrative (when built)
- Priority access to new programs

Trial: **14 days full access, credit card required.** Runna pattern — reduces window-shoppers, high conversion. First 7 days of any program are always previewable without a card (no data-saving).

## 5. Infra + stack changes

### Auth: Clerk

- Free up to 10,000 MAU. Beta with 10-50 CrossFit members is comfortably free.
- Next.js SDK, React components, drop-in.
- OAuth (Google, Apple), email/password, magic links — beta users get their pick.
- Session cookies handled by Clerk; our Pages Function reads Clerk JWT via middleware.
- GDPR-compliant, SOC 2 Type II. Legal footing sorted.

**Alternative considered:** Cloudflare Access (too limited for self-signup), WorkOS (enterprise-priced), custom (do not build).

### Data: KV per-user, migrate to D1 when needed

- **Now:** swap hardcoded `user:margus:v2` → `user:${clerk_uid}:v2`. Pages Functions read the Clerk JWT and use its subject as the key. Zero KV schema change.
- **Later (v2+):** move to Cloudflare D1 when we need cross-user queries (leaderboards, box owner dashboards, community programs). D1 is SQLite; migrations are straightforward.
- **Do NOT** stand up Postgres / Supabase for MVP. YAGNI. Every hour we spend on ops burden is an hour we don't spend on programs.

### Billing: Paddle (not Stripe)

- **Merchant of record model.** Paddle handles VAT collection + remittance across the EU (Estonia = EU = mandatory VAT registration once you cross €10k EU-wide sales). Stripe forces you to handle VAT yourself.
- Subscription lifecycle webhooks — Paddle → Pages Function → updates tier in KV.
- Estonia-friendly (Paddle supports EE / EEA compliance out of the box).
- **Cost:** 5% + $0.50 per transaction. Higher than Stripe's ~2.9%, but VAT handling saves ~20% overhead + hours of compliance work.

### Email: Resend

- Transactional email (welcome, trial ending, receipt, retest reminder).
- React email templates.
- Cheap ($20/mo for 50k emails).

### Analytics: PostHog (self-hosted or EU cloud)

- Product analytics (funnel, retention).
- GDPR-compliant with EU cloud region.
- Free up to 1M events/mo.

### Error tracking: Sentry

- Free tier handles beta.

### Marketing site: skip for beta

- Invite link → Clerk signup → in-app onboarding.
- Marketing site (`weakness.app` or whatever) comes when we open public signup.

### Domain: not required for beta

- `program-v2.pages.dev` works for beta.
- Buy a real domain (`weaknesses.app`, `weakpoint.app`, `holdyouback.app`, etc.) when we're ready to open publicly.

## 6. Legal + policy

**Estonia = EU = GDPR strict. Health data = special category = extra care.**

Required before opening beta signup:

1. **Privacy policy** — what we store (symptom scores, notes, exercise logs, contraindications), where (KV in Cloudflare EU DCs), how long, right to delete + export.
2. **Terms of service** — standard SaaS TOS, medical disclaimer prominent.
3. **Medical disclaimer** — top of every page:
   > This app is a training log, not medical advice. It does not diagnose, treat, or replace a clinician. If a red-flag pattern appears, escalate to a physio or physician.
4. **DPA + sub-processors list** — Clerk, Paddle, Resend, Cloudflare (KV + Pages), PostHog. Public page listing them.
5. **Explicit consent for symptom data** — checkbox at signup, separate from general TOS acceptance.
6. **Right to delete** — one-click account deletion; wipes KV key + Clerk user + Paddle customer.
7. **Right to export** — already have (Data page → JSON download); wire it to per-user data.

**Cost estimate:** €0 in tooling (using free tiers). €300-800 one-off for a lawyer to review the TOS + privacy policy for Estonia-specific requirements. Non-negotiable — I would not skip this.

## 7. Iteration plan

### Phase 0 — Foundation (Week 1-2)

**Deliverable:** anyone can sign up, get a Clerk-authenticated session, land on a "no active program" screen. Their data is isolated by uid.

- [ ] Clerk integrated in Next.js (Clerk provider + middleware)
- [ ] Pages Function `/api/state` reads Clerk JWT, uses `user:${uid}:v2` as KV key
- [ ] Migrate Margus's existing `user:margus:v2` → `user:${margus_clerk_uid}:v2` (one-time script)
- [ ] Legal pages: privacy, TOS, medical disclaimer
- [ ] Consent checkbox at signup for symptom data
- [ ] "Delete my account" flow in Data page
- [ ] Basic email-verify signup flow

### Phase 1 — Onboarding + first program migration (Week 2-3)

**Deliverable:** new user picks a program from a catalog, starts it, and lands on Today.

- [ ] Onboarding: 3-question flow (weakness / goal / experience level)
- [ ] Program catalog page with 1 program (Anterior hip) visible
- [ ] "Start this program" writes program to user store + kicks off week 0
- [ ] Extract Margus's current program into `programs/anterior-hip-rebuild.json` as v1 template
- [ ] Program templates loader (`loadProgramTemplate(id)`)
- [ ] Onboarding respects consent (no symptom data before consent)

### Phase 2 — Program catalog expansion (Week 3-5)

**Deliverable:** 5 more programs live. Users can browse and switch.

- [ ] Design + write program 2: Deadlift base builder (with Margus's help — it's what he already did)
- [ ] Design + write program 3: First strict pull-up
- [ ] Design + write program 4: Zone-2 aerobic base
- [ ] Design + write program 5: Left/right hip asymmetry (composition of pack + engine we have)
- [ ] Design + write program 6: Shoulder overhead unlock
- [ ] Each program has: short description, who / what-you'll-achieve, retest protocol
- [ ] Program catalog UI (browse / filter by category / preview / start)
- [ ] Program switching flow (with warning about losing in-progress state)

### Phase 3 — Billing (Week 5)

**Deliverable:** paid users unlock paid features. Trial works. Cancellation works.

- [ ] Paddle account + product setup
- [ ] Paddle checkout embedded in-app
- [ ] Pages Function webhook receiver for subscription lifecycle
- [ ] Tier field on user profile drives feature flags
- [ ] "Upgrade" screen in-app
- [ ] Trial start / end automation
- [ ] Email templates via Resend: welcome, trial ending, receipt

### Phase 4 — Beta polish (Week 5-6)

**Deliverable:** 10 gym members can be invited and successfully complete week 1.

- [ ] In-app feedback form (email → Margus)
- [ ] Onboarding copy polish
- [ ] First-run tutorial (skip-able)
- [ ] Retest week UX — clear "you're at the end of your program" flow
- [ ] Post-retest: extend / switch / take a break / graduate
- [ ] Sentry + PostHog wired up
- [ ] Beta invite flow — Clerk allowlist mode, invite via email
- [ ] One-page "how to use this app" doc for gym members

**Total: 6 weeks realistic. 4 weeks aggressive.**

## 8. Cost estimate — running

Monthly, at 50 beta users, all free tier:

- Cloudflare Pages / KV / Pages Functions: free
- Clerk: free (< 10k MAU)
- Paddle: only paid when we have paid users
- Resend: ~$0-20/mo
- PostHog: free (< 1M events)
- Sentry: free
- Domain (when we buy one): ~€15/yr

**Total: ~€0-20/mo for the whole beta.** Cheap to run wrong for a while.

At 500 users, 10% paid conversion:
- Revenue: 50 × €9.99 = ~€500/mo
- Costs: €50-100/mo (bumping Clerk, Paddle fees, LLM if AI enabled)
- Margin: 80%+ before your time.

## 9. Risks + open questions

**Risks:**
1. **Program design is the real work.** 5 programs × ~20 hours each = 100 hours of careful thought, exercise selection, phase design. Not code. Not delegate-able to an agent without domain expertise. Margus + physio input required.
2. **Legal review costs €300-800 one-off.** Sunk cost of doing this properly.
3. **Trial-to-paid conversion is unknown.** Runna's 30-40% is best-in-class. We might get 5-15%. Model the low case.
4. **Beta feedback might redirect strategy.** Fine — that's why we ship beta.
5. **Health data breach = catastrophic.** Not just PR — GDPR fines are 4% of revenue. Non-negotiable to encrypt at rest (Cloudflare handles), no logging of symptom data, delete-on-request.

**Open questions to resolve before Phase 0:**
- App name / domain choice (`weakpoint.app`? `holdyouback.app`? something else?)
- Do we ship Margus's data into `user:${margus_clerk_uid}:v2` as-is or wipe fresh?
- Beta invite mechanism: allowlist mode or open signup with invite code?
- Free tier — 1 program or 2? (I lean 1 to keep the paid pull strong)
- Estonia-specific: do we need a KMKR VAT number for Paddle, or does merchant-of-record handle everything?

Answer these first, then Phase 0.
