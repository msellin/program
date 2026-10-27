# HANDOVER: launch-readiness → launch sprint (2026-10-27)

For the session that runs the build sprint (new account). **This file holds every action. The other files are
detail.** Read this, then the repo `CLAUDE.md`, then open a findings file only when an item points to it.

Non-negotiables from `CLAUDE.md`:
- Run `cd next-app && npm run verify` before every commit. Enable the hook once with
  `git config core.hooksPath .githooks`.
- Push to main; CI deploys both Pages projects.
- Clinical data stays de-identified, the shared `exercises.json` stays general, and nothing is medical advice.

## 0. Where things stand
- **Audit done; no product code changed.** Everything is committed under `dev/active/launch-readiness/`.
- **Verdicts:**
  - Market: keep it as built, no pivot; the evidence is weak.
  - Today: a free open beta. Billing: **Stripe** (owner's existing account).
  - Model: free tier + 14-day Pro reverse trial (`free-tier-design.md`).
  - Video coach: build later.
- **Confirmed live:** `app.terav.fit/data/{clinical-context,open-questions,log,program}.json` and
  `programs/anterior-hip-rebuild.json` are public. That is the owner's clinical record. **Do B1 first.**
- **Never checked:** Supabase dashboard, Cloudflare Analytics toggle, ad accounts, Meta's health classification.
- **The Haiku audits make mistakes.** Fix only what you verified; the Sonnet findings say what they re-checked.

## 1. Owner decisions: get the answers before B3, B5 and B11 (recommendation first)
| # | Decision | Recommendation |
|---|----------|----------------|
| D1 | Today's offer | Free open beta; paid comes with Stripe |
| D2 | Programs to advertise | First strict pull-up, handstand walk, strength + cardio (concurrent-strength-maintenance), once B12 is fixed. This replaces the old "Engine Builder alone" beta plan, since Engine Builder carries withdrawn numbers |
| D3 | Say "CrossFit"? | Landing yes ("CrossFit and functional-fitness athletes"); ads no, say "functional fitness" (trademark unchecked) |
| D4 | Hero headline | "Get better at one thing. Keep your training." (ads); landing may use "Improve your weakest area. Keep your training." |
| D5 | Founder hip story on the landing | Keep the story, remove the hip naming |
| D6 | Email confirmation at sign-up | On, once Resend SMTP is set (O1) |
| D7 | Budget | €150: Meta €100, Google €50 |
| D8 | Review panel before publishing | One round, 3 Sonnet lenses on the ad copy + landing (~150k tokens) |
| D9 | Billing timing | Stripe (decided). Free beta today, Stripe straight after (rec), or paid trial from the first click (+3–5 h today)? |
| D10 | Free/Pro line | As drafted in `free-tier-design.md` (free = one focus + full engine + safety; Pro = more focuses, full history, reports, next-focus, imports) |

## 2. Owner-only steps: start now, some wait on approvals
| # | Step | Blocks ads? |
|---|------|-------------|
| O1 | Supabase: sign-ups ON; custom SMTP via Resend; captcha (Turnstile) + auth rate limits; confirm-email per D6 | yes |
| O2 | Cloudflare Web Analytics ON for terav.fit and app.terav.fit | yes |
| O3 | Meta Business + Google Ads accounts; 18+; interests/keywords only; **no** custom audiences, remarketing or Customer Match | yes |
| O4 | One real sign-up from your phone after the sprint deploys | yes |
| O5 | Stripe: a **separate Terav account** under your existing login; Stripe Tax on; ask the accountant about EU VAT/OSS (home-country VAT under €10k/year of EU cross-border consumer sales, OSS above) | no |
| O6 | Lawyer: Art. 9 consent design + DPIA; is cookieless analytics OK without consent; subscription terms | before scale |

Meta ad review can take up to 24 h. Submit as soon as B1–B8 are live.

## 3. Build sprint, in order (S <1h · M 1–3h). Parallel lanes on separate files: B1–B3 | B4–B5 | B6–B8.
| # | Item | Effort | Detail |
|---|------|--------|--------|
| B1 | **Take the owner's clinical files off public.** Checked 2026-10-27. **(a)** `log.json` is used only by `seedFromRepoLogIfEmpty` (`storage.ts:139`), which is disabled (`useStore.ts:466-472`): delete the file and the dead function. **(b)** `program.json` and `open-questions.json` have no runtime caller (comments only): delete them. The author copies stay in the repo-root `data/`. **(c)** `clinical-context.json` is loaded by `loadClinicalContext` (`data-loader.ts:125`) for the report's hip section (`report/page.tsx:761`). It returns null on 404, so deleting is safe, but the owner's report loses that section. To keep it, serve it from an auth-checked Pages Function (`ADMIN_EMAILS`) or the owner's Supabase row. Persona network logs show it fetched for non-hip users too, so also gate the call to the hip slug. **(d)** `programs/anterior-hip-rebuild.json` stays (it is the program), but strip any personal clinical note (~`:293`). The follow-along work edited this file recently, so pull first. Run `npm run verify`. | M | compliance 1, r5 |
| B2 | **Gate the hip UI:** `AssessmentDueBanner` at `components/workout/SignalsStrip.tsx:425` → hip slug only (as the chip at `:69` does). Drop the personal slug from `programs/[slug]/page.tsx:9-17` | S | compliance 2 |
| B3 | **Landing:** change `TodayMockup.tsx:21` "Left hip stiffness" to a pull-up example; founder story `en.ts:93-95` per D5 | S | product 3 |
| B4 | **Strip withdrawn numbers:** `manifest.json` ~41, 101, 128, 263; "125 primary studies"; "Every change cites a study" → "Every change shows its reason"; "Six weeks to a 2K PR"; check `landing/src/lib/programs-catalog.ts`; the kilding_2012 claim (`citations.json:620`) | S–M | compliance 7, h18 |
| B5 | **Hero and catalog:** hero per D3/D4; one "Start free" label (`Hero.tsx:81`, `BetaCTA.tsx:22`, program pages, sign-up); Today mockup under the headline on phone; sticky CTA on program pages; engine, rowing and overhead marked "coming soon" or de-emphasised | M | product 1-2, 5 |
| B6 | **Sign-up path:** carry `?next=` end to end (`(auth)/sign-up/page.tsx:37,76`, GoogleAuthButton, `sign-in/page.tsx:215`); Google button disabled until terms + health-consent are ticked; 16+ age tick; remove "no signup wall", "closed beta" (`legal/terms:27`) and "two minutes" (`BetaCTA.tsx`); review the `lib/auth-errors.ts:26-33` remap | M | money-tech, compliance 3/6/8 |
| B7 | **Privacy and terms truth pass** (`legal/privacy/page.tsx:75,80,97,114,117`); name Google OAuth and Cloudflare Web Analytics; landing legal pages mirror or link the app's | M | compliance 4-5 |
| B8 | **Measurement:** capture UTMs on landing → pass through sign-up → user metadata; commit an SQL query for sign-ups and activation (first session logged) by utm_campaign | M | money-tech |
| B12 | **Fix the gates in the advertised programs, or drop the promise text:** concurrent-strength-maintenance red-state "resume at 3×4" is missing (OPEN-TASKS:46); handstand-walk `retest_gate` / bail-out gates nothing (OPEN-TASKS:55). Remove Sadowski from `handstand-walk.json` and `muscle-up.json` (CONTENT-1). Run `npm run verify` + the persona harness for those programs | M | roadmap 1-2 |
| B13 | **Privacy page names Paddle** (`legal/privacy/page.tsx:121,135`) → Stripe. Do it in B7 | S | roadmap 3 |
| B9 | **App jargon,** top 7 copy edits | S–M | `audit/h04-app-copy.md` |
| B10 | **Fresh phone screenshots** of the new-user path; check the Today action-bar overlap | S | product 9 |
| B11 | **Ads:** 3 ad sets → each program page with UTMs; wording only from the safe list below; review panel per D8 | M | compliance §2 |

**Cut line:** B1–B8, B11, B12 and B13 are the minimum; B9–B10 can slip. If B12 can't be done today, advertise only the pull-up program. Total about 14–18 hours of work, so it needs the
parallel lanes.

**Safe ad wording** (from `findings-compliance.md` §2):
- **Headlines:** "Train one skill until it sticks" · "Sharpen a single lift" · "A focused plan for your engine" ·
  "Pull-up progressions, with sources" · "Muscle-up practice, structured" · "Training that adapts to your log".
- **Banned:** pain, injury, rehab, recover, heal, treat, symptoms, hip, "your weakness/problem", "stuck", "in N
  weeks", guaranteed, proven, clinically, any %/bpm/seconds gain, "125 studies", before/after images,
  testimonials, "CrossFit" in ad text, "AI form check".

**Read the test after 3–5 days:**
- Sign-ups and activations per utm_campaign, and cost per sign-up.
- €150 buys roughly 4–30 sign-ups. That shows whether cold traffic signs up and what it costs; it cannot pin
  down conversion rates.

## 4. Straight after the ads (before scaling)
1. **Stripe billing + free/Pro tier,** per `free-tier-design.md` (about 1–1.5 days):
   - `entitlements()` helper; reverse trial at account creation.
   - Checkout and Customer Portal; webhook Pages Function → `tier`.
   - Per-user `MULTI_MAIN_ENABLED`; history and report gates; trial-end email.
   - Paid terms: renewal and EU 14-day withdrawal.
2. **Tracking:** Consent Mode v2 + a consent banner, then conversion tags. Never send health or symptom events.
3. **Product:** "next focus" offer at program end; intake cut to about 5 up-front questions; a real beta quote,
   with consent.
4. **Design:** one shared token file + a `<Button>` set across the landing and the app (`audit/h06`).
5. **Citations:** close the traffic-plan hold (overstated and unfindable items, `audit/h16`, `h18`).
6. **Hip leftovers:** `/check` hip fallback, `DEFAULT_PROGRAM_SLUG`, `guide/page.tsx:155`.
7. **Ops:** Sentry in functions; function rate limits; confirm the Supabase plan and backups.
8. **Video coach:** pull-up first, validated on the owner's clips (`findings-video-coach.md`).
9. **Roadmap items** from section 5.

## 5. Roadmap reconciliation
See `roadmap-reconciliation.md` (merged from `roadmap/r1-r5`). Its BLOCKS-ADS-TODAY items are folded into
section 3 above; everything else is tagged there.

## 6. How the owner works (keep it)
- **Owner-only:** dashboards, provider sign-ups, ad spend, approvals, sending messages.
- **Cheap models:** Haiku for sweeps and search, Sonnet for judgement, no Opus agents unless asked. Outputs go
  in the repo under `dev/active/<task>/`.
- **Review panels:** anything public (ads, landing, pricing) gets a panel of at least 3 lenses on Sonnet. State
  the token cost first.
- **Owner ideas are hypotheses:** research them, give a verdict, then ask.
- **Agent briefs:** files, one question, done condition, output cap.
- **Tool quirk in this run:** Sonnet general-purpose subagents had file writes refused, while Haiku agents could
  write. Save Sonnet output yourself.

## File map
- `launch-plan.md`: the plan this handover expands.
- `findings-{market,video-coach,compliance,money-tech,product}.md`
- `free-tier-design.md` · `roadmap-reconciliation.md`
- `audit/h01-h18` · `market/` (26 notes) · `roadmap/r1-r5` · `screens/` (14 live shots, 2026-10-27)
