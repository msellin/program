# Launch readiness: brief (2026-10-27)

Written by a Claude session in `~/www/mensmindset` (Plain Words) to hand Terav's next phase to a session here.
Read this first, then this repo's `CLAUDE.md`.

## Why this exists

On 2026-10-27 the owner (Margus) decided where to put his time next. There were three options:
- **A fun character page** (animals/characters on Instagram and Shorts). Rejected as a business: low pay
  (Shorts ~$0.03–0.10 per 1,000 views), a viral lottery.
- **A new B2B product** from `~/www/research/software-demand/FINAL-TOP15.md` (venue quote-and-book engine,
  AI order intake for wholesalers). The evidence is strong, but these sell by contacting businesses, not by ads.
- **Terav (terav.fit).** **Chosen.** It already exists, the owner uses it, it is self-serve and global, and
  it can be advertised on Meta and Google.

**The lesson from Plain Words**, the social page this replaces:
- About 40 Reels were correct, careful and safety-reviewed. Each reached roughly 100–170 people, with 0 shares
  and 4 followers.
- **Correct is not enough. People have to understand and want it in one look.**
- Terav has the same risk. Its wording is dense and expert-facing (confirm-first engine, capability domains,
  126 citations). The owner's word for the goal is **approachable**.

**The owner's goal, in his words:** make the existing product able to "self live" (stand on its own). Today it
is still rough:
- his own personal tracks are mixed in with the programs users can take;
- there are many different design approaches across the app;
- there is no billing, and the free vs paid tier has not been thought through.

He wants a **proper full audit** of the product, its roadmap, the actual visuals and everything else. The audit
must answer: what is needed before we can safely advertise it?

## What a quick look found (2026-10-27, not a full audit)

**What exists:**
- About 500 commits since August.
- The landing page (terav.fit) and the app (app.terav.fit) run on Cloudflare Pages.
- Supabase auth and Postgres `user_states`; Resend email and Sentry are wired in.
- 9 programs in `next-app/public/data/programs/manifest.json`. `anterior-hip-rebuild` is the owner's own
  (`personal: true`, 34 weeks, built from his clinical record).

**What's missing or stale:**
- **Billing:** none. The plan said €9.99/month or €89/year with a 14-day trial through Paddle, but only one line
  of rationale was ever written. The account `tier` field does nothing; the free tier is effectively a launch
  flag (`MULTI_MAIN_ENABLED`). See `dev/active/saas-launch/context.md` and its "superseded" table.
- **Analytics:** none. The privacy page says so, so there is nothing for an ad pixel or conversion tracking to
  report to.
- **Sign-ups:** invite-only, with about 3 beta users (`dev/active/OPEN-TASKS.md`).
- **Docs:** many planning docs disagree with the code. Saas-launch context, NEXT.md and README.md still describe
  the single-user localStorage era.
- **Traffic:** the plan (`dev/active/traffic/`) holds promotion until the evidence-page citations are corrected.

## Core idea

Turn Terav from **"the owner's training lab with a public door"** into **a self-serve product**:
- one clear promise per program, led by the outcome rather than the engine ("Your first strict pull-up in
  8 weeks");
- one design system across the landing page and the app;
- the owner's personal tracks separated from the public catalog;
- a deliberate free/paid line, billing, consent-based analytics and open sign-ups;
- then a small, cheap ad test before any big spend.

**Ad angle:**
- Lead with outcomes that are safe to advertise: pull-up, muscle-up, handstand walk, engine, rowing 2k.
- **Keep rehab and hip content out of ads.** Meta and Google restrict health claims, and health data is GDPR
  Article 9 data.
- The Plain Words pipeline (Reel renderer, publisher, approvals in `~/www/mensmindset`) and Terav's own figure
  rig (`dev/active/exercise-media`) could make the ad and organic creative later.

## Suggested next steps (the session refines these)

1. **Full audit, read-only, before any change.** Each area ends in a short findings file under
   `dev/active/launch-readiness/`:
   - **Product and catalog:** which programs are public-ready, which are personal or half-built, and the quality
     and consistency of each. Is the "pick one focus, runs alongside your week" promise understandable in one read?
   - **UX and visuals:** screenshot every screen of the landing page and the app (desktop and phone). Inventory
     the competing design approaches (type, colour, components, tone), using `dev/design` and
     `dev/design-briefs`. Check onboarding length and the first five minutes.
   - **Roadmap reconciliation:** OPEN-TASKS, the saas-launch plan, the whitepapers, NEXT.md and the traffic plan.
     What is done, what is stale, what still matters for launch.
   - **Monetisation:** what's free and what's paid, the price, the trial, Paddle vs Stripe vs Lemon Squeezy
     (merchant of record and EU VAT), and how cancellation and refunds work.
   - **Compliance and safety:** health-data consent, the medical disclaimer, ad-platform policy on fitness and
     health claims, and terms and privacy fit for paying users and open sign-ups.
   - **Tech readiness:** open sign-ups, onboarding, analytics with consent, the ad pixel and conversion events,
     error handling, load, backups.
   - **Ad readiness:** the landing-page message per outcome, what we can truthfully claim, and the creative format.
2. **One launch-readiness plan from the audit.** It is a major plan, so it follows the owner's process below.
   It must say what blocks advertising, what can wait, the order and rough effort.
3. **Owner decisions,** each asked as one line: positioning; launch catalog; free/paid line and price; billing
   provider; ad budget for the smoke test.
4. **Build in phases:**
   - separate personal tracks from the catalog;
   - unify the design;
   - simplify onboarding;
   - open sign-ups, billing and analytics;
   - one ad landing page per outcome;
   - a €100–200 Meta/Google smoke test, judged on sign-up and trial-start rate.

## How the owner works (apply here too)

- **Major plans:** 3 independent planners from one evidence brief, judged blind, then a red team, then a final
  panel. Say plainly what a review did and didn't establish; never call a plan "best" from one panel.
- **Review panels before anything public**, including ads, landing copy and pricing pages:
  - at least 3 distinct lenses (for example a skeptical target user, a beginner, a coach or physio, plain
    English for a non-native reader, growth);
  - aim for unanimous 10/10 with delta rounds; after round 3, remaining 9s go to the owner as one-line calls;
  - reviewers run on Sonnet; state the token cost when proposing a panel.
- **Owner ideas are hypotheses:** research them, give a verdict, then ask which to build.
- **Owner-only steps:** approvals, payments and provider sign-ups, ad-account spend, sudo, sending messages.
- **Keep agents small:** each brief names the files, the question, the done condition and an output cap
  (≤ 20–40 lines). Mechanical steps run as one shell command.
- **Git:** push to main and commit docs with code (global `~/.claude/CLAUDE.md`). This repo's `CLAUDE.md` rules
  apply: clinical data stays de-identified, the shared exercise library stays general, and nothing is
  presented as medical advice.

## Not in scope

- Plain Words. It finishes its Reel test on autopilot until 2 Nov (read on 4 Nov) and will probably be paused
  after that, which is a separate decision.
- OddsIntel.
