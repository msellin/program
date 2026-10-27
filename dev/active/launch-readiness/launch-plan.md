# Terav launch plan: ads live, lean version (2026-10-27)

**Goal:** a €100–200 Meta + Google smoke test running by end of day. It sends CrossFit / functional-fitness
athletes to a free open beta and measures sign-ups and first sessions per program and per ad.

**How this plan was made:**
- **Inputs:** 23 Haiku market notes, then 18 Haiku first-pass audits (`audit/`), then 3 Sonnet deep-dives
  (`findings-{compliance,money-tech,product}.md`), plus `findings-market.md` and `findings-video-coach.md`.
- **Written by:** the orchestrator, from those findings. The owner's 3-planner / blind-judge / red-team process was
  skipped for speed, on the owner's instruction. So nothing here was independently challenged.
- **Live checks:** most code claims were spot-checked by the Sonnet agents. Supabase, Cloudflare and ad-account
  dashboard state was not checked by anyone.

## Verdicts
- **Market:** keep it as built. No pivot. The evidence is weak, and only the ad test can answer demand.
- **Today:** a **free open beta, not a paid trial.** There is no billing code, and same-day merchant-of-record
  approval is unconfirmed. Price for later: €9.99/month, €89/year, 14-day trial (in market range; 7 days is the
  norm, so test it).
- **AI video coach:** build later. Don't advertise it or put it in the paid tier yet.
- **Tracking:** cookieless Cloudflare Web Analytics plus UTMs stored at sign-up. No Meta Pixel or gtag today
  (privacy pages, CSP, health-data rules).

## A. Owner-only steps. Start now; several wait on approvals.
| # | Step | Blocks ads? |
|---|------|-------------|
| O1 | Supabase: sign-ups ON, custom SMTP via Resend, captcha (Turnstile) + auth rate limits, decide confirm-email | yes |
| O2 | Cloudflare Web Analytics ON for terav.fit and app.terav.fit | yes |
| O3 | Meta Business + Google Ads accounts. Targeting 18+, interests/keywords only, **no** custom audiences, remarketing or Customer Match | yes |
| O4 | One real sign-up from your phone after the sprint deploys | yes |
| O5 | Stripe (owner's existing account, as used for OddsIntel): create a **separate Stripe account for Terav** under the same login, turn on Stripe Tax, and ask the accountant about EU VAT/OSS | no (billing next) |

Meta ad review can take up to 24 hours. Submit the ads as soon as B1–B8 are live.

## B. Build sprint, in order. S <1h · M 1–3h. Run `cd next-app && npm run verify` before every commit.
| # | Item | Effort | Source |
|---|------|--------|--------|
| B1 | **Remove the owner's clinical files from public.** `next-app/public/data/{clinical-context,open-questions,log,program}.json` are served at app.terav.fit/data/*. Trace the `data-loader.ts`, `report/`, `storage.ts`, `useStore.ts` and `note-signals.ts` callers first, then remove the files or move them behind auth. Also handle the override note in `programs/anterior-hip-rebuild.json` | M | compliance 1, product 2 |
| B2 | **Gate the hip UI.** `AssessmentDueBanner` at `SignalsStrip.tsx:425` → hip slug only. Drop the personal slug from `programs/[slug]/page.tsx:9-17` | S | compliance 2, product 1 |
| B3 | **Remove the hip from the landing.** Change `TodayMockup.tsx:21` to a pull-up example. Founder story `en.ts:93-95` per D5 | S | product 3 |
| B4 | **Strip withdrawn or unsourced numbers:** `manifest.json` lines ~41, 101, 128, 263; landing "125 primary studies", "Every change cites a study" (→ "Every change shows its reason"), "Six weeks to a 2K PR"; check `landing/src/lib/programs-catalog.ts` | S–M | compliance 7, product 4 |
| B5 | **Landing hero and catalog:** new hero (D3/D4); one "Start free" CTA everywhere; Today mockup under the headline on phone; sticky CTA on program pages; engine, rowing and overhead marked "coming soon" or de-emphasised | M | product 1-2, 5 |
| B6 | **Sign-up path:** carry `?next=` end to end (`sign-up/page.tsx:37,76` emailRedirectTo, GoogleAuthButton, `sign-in/page.tsx:215`); Google button disabled until the terms and health-consent boxes are ticked; 16+ age tick; remove "no signup wall", "closed beta" (`legal/terms:27`) and "two minutes"; review the `auth-errors.ts:26-33` remap | M | money-tech, compliance 3/6/8, product 6-7 |
| B7 | **Privacy and terms truth pass** (`legal/privacy/page.tsx:75,80,97,114,117`), name Google OAuth and Cloudflare Web Analytics; landing legal pages link or mirror the app's | M | compliance 4-5, 9 |
| B8 | **Measurement:** save UTMs on landing arrival, pass them through sign-up into user metadata; commit an SQL query for sign-ups and activations (first session logged) by utm_campaign | M | money-tech |
| B9 | **App jargon,** top 7 copy edits from `audit/h04-app-copy.md` | S–M | product 8 |
| B10 | **Fresh phone screenshots** of the new-user path (check the Today action-bar overlap) | S | product 9 |
| B11 | **Ads:** 3 ad sets (pull-up, handstand walk, strength + cardio), each going to its program page with UTMs. Wording only from the safe list in `findings-compliance.md` §2 | M | compliance 2, product 2 |

**Cut line if the day runs out:** B1–B8 + B11 are the minimum, and B9–B10 can slip. Budget about 14–18 hours of
work. It fits in one day only with parallel sessions on separate files: B1–B3, B4–B5, B6–B8.

**Read the test** after 3–5 days: sign-ups per utm_campaign, activation rate, and cost per sign-up. €150 buys
roughly 4–30 trials. That shows whether cold traffic signs up at all and roughly what it costs. It cannot pin down
conversion rates.

## C. Next, before scaling (not today)
- **Billing (Stripe, owner decision 2026-10-27):** Checkout with a 14-day trial, one Pages Function webhook → `tier`, gate, Stripe Customer Portal for cancellation, trial-end email. About 3–5 h. Stripe is not a merchant of record: Stripe Tax collects VAT, the owner files it (home-country VAT under €10k/year of cross-border EU B2C sales, OSS above that). Plus paid terms (renewal, EU
  14-day withdrawal).
- **Tracking:** Consent Mode v2 + CMP, then conversion tags. A lawyer reviews the Art. 9 consent design and a DPIA.
- **Product:** a "next focus" offer at the end of each program (goal-reached churn). Intake cut to about 5 up-front
  questions.
- **Design:** one shared token file plus a `<Button>` set across the landing and the app (`audit/h06`).
- **Citations:** fix the remaining overstated or unfindable ones (the traffic-plan hold, `audit/h16`, `h18`).
- **Hip leftovers:** `/check` hip fallback, `DEFAULT_PROGRAM_SLUG`, `guide/page.tsx:155`.
- **Ops:** Sentry in functions; function rate limits; confirm the Supabase plan and backups.
- **Video coach:** pull-up first, validated on the owner's clips (`findings-video-coach.md`).

## D. Owner decisions: ALL AGREED 2026-10-27 (see HANDOVER §1 for the final wording)
1. **Today's offer:** free open beta, paid later? *(rec: yes)*
2. **Programs to advertise:** first strict pull-up, handstand walk, strength + cardio? *(rec: yes)*
3. **Say "CrossFit"?** Ads say "functional fitness" (trademark unchecked). Does the landing say "CrossFit and
   functional-fitness athletes"? *(rec: landing yes, ads no)*
4. **Hero headline:** "Improve your weakest area. Keep your training." or "Get better at one thing. Keep your
   training."? *(compliance flags "weakness" wording in ads; rec: the second for ads, either for the landing)*
5. **Founder hip story on the landing:** cut it, or keep it without naming the hip? *(rec: keep it, no hip)*
6. **Email confirmation at sign-up:** on (safer, but depends on SMTP) or off? *(rec: on, once Resend SMTP is set)*
7. **Budget split:** €150 total, Meta €100 / Google €50? *(rec: yes)*
8. **Review panel before publishing:** one round of 3 Sonnet lenses on the ad copy + landing (~150k tokens), or
   skip? *(rec: run it; owner rule for anything public)*
9. **Billing provider:** Stripe (existing account; separate Terav account). Decided 2026-10-27. Still open: free beta today with Stripe straight after *(rec)*, or a paid trial from the first click (+3–5 h today)?
