# Terav 1-day hackathon: roadmap (to run on the new account)

**Goal by end of day:** strangers from Meta and Google ads land on an honest, approachable landing page. They sign up
to a free open beta, their chosen program carries through, and they get a clean first workout with a safe way to stop
and a clear finish. No owner clinical data is public, and every sign-up and first session is measured by campaign.

**Inputs:** `ACTION-POINTS.md` (IDs below), `HANDOVER.md` (decisions, rules), `findings-design.md` (how it should
look), `findings-app.md` (verified bugs, file:line), `personal-separation.md`.

**Rules:**
- Run `cd next-app && npm run verify` before every commit.
- Commit per item; push to main (CI deploys).
- One lane = one set of files; lanes never edit each other's files.
- A catalog change needs a persona-harness review in the same commit.
- Cheap models: Haiku for sweeps, Sonnet for judgement.

## Before you start (prepared 2026-10-27)
- **Main deploys again.** CI had been failing since 2026-10-20 (a `tsc` error in `BriefView.test.tsx`), so BUG-48
  never reached production. That is fixed, and `npm run verify` now runs `tsc --noEmit` + vitest, so the pre-commit
  hook catches type errors before CI does. The first hackathon push also ships BUG-48: check it on the live site.
- **Paste-ready briefs** for each lane: `LANES.md`. Ad spec draft: `ads/ad-spec-draft.md`. Lawyer and accountant
  questions: `owner-questions.md`.
- **Baseline captures** to compare against: `screens/gaps/` (stranger first run, red day, 375 + 393 viewports) and
  `audit/gap-*.md`. Re-run with `npx playwright test -c tests/e2e/playwright.config.ts launch-gaps.spec.ts --workers=1`
  (from `next-app`, about 2 min).

**Tokens the owner puts in env at kickoff (never in chat or the repo):**
| Env var | Where to get it | Used for |
|---------|-----------------|----------|
| `SUPABASE_ACCESS_TOKEN` | supabase.com/dashboard/account/tokens | `dev/scripts/hackathon-auth-config.sh` (O-01): `show` first, then `apply` |
| `RESEND_SMTP_KEY` | resend.com → API keys (sending access; terav.fit is already verified, since feedback mail sends from notices@terav.fit) | Supabase custom SMTP |
| `CLOUDFLARE_API_TOKEN` (Pages + Analytics + Turnstile edit) | dash.cloudflare.com → My Profile → API Tokens | M-01 Web Analytics; the Turnstile site key/secret for SG-08 |
| `TURNSTILE_SECRET` + site key | Cloudflare → Turnstile → add site terav.fit / app.terav.fit | captcha, enabled **only after** the sign-up widget ships (SG-08), with `CAPTCHA=1` |

## Timeline (about 8 hours)
| Time | Block | What |
|------|-------|------|
| 0:00–0:30 | **Kickoff** | Owner puts tokens in env (Supabase Management, Cloudflare, Resend SMTP). `git pull`; `git config core.hooksPath .githooks`. Agent applies **O-01** (sign-ups ON, SMTP, captcha, rate limits, confirm-email) and **M-01** (Cloudflare Analytics), with the owner approving each change. Start 5 lane sessions |
| 0:30–4:30 | **Lanes 1–5 in parallel** | See below. Each lane ends green on `npm run verify` |
| 4:30–5:30 | **Sweep 1** (one session, after the lanes merge) | **A-UX-04** names and jargon, **D-01** one Button, **D-02** header rule, then **A-UX-09** tabs (cuttable) |
| 5:30–6:30 | **QA** | **O-03** re-run the persona harness + fresh phone screenshots; check the 393 and 375 viewports for sticky overlap; **O-02** owner's real phone sign-up; fix the fallout |
| 6:30–7:30 | **Review panel** | **M-04**: 3 Sonnet lenses (skeptical CrossFit athlete, beginner, ad-policy/compliance) on the landing + ads, 1 round; apply the fixes |
| 7:30–8:00 | **Go live** | **M-05**: the owner uploads 3 ad sets (Meta €100 / Google €50); Google goes live, and Meta reviews for up to 24 h |

## Lanes (each a separate session, with its own files)
**Lane 1: Privacy and personal track** (data files, report, check, signals, route guards). About 3 h.
- P-01, P-02, P-03, P-04, P-05, P-06, A-UX-07.
- Done when: `curl app.terav.fit/data/clinical-context.json` → 404 (or auth); a pull-up persona sees no hip text anywhere.

**Lane 2a: Workout session** (`components/session/*`, `SetView`, `OverflowSheet`, `NoteSheet`, `DaySession`,
new `SessionDone.tsx`). About 4 h.
- SF-01, SF-02, A-UX-02, A-UX-06.
- Done when: every program has a one-tap "Something hurt" → Stop that ends the session; Finish shows a Done screen;
  no 0 s holds.

**Lane 2b: Today and Plan** (`TodaySession`, `HeroStateCard`, `StatusCards`, `ProposalCard/Stack`, feedback button,
`plan/page.tsx`, `FirstRunBanner`, `Day1EmptyState`). About 4 h.
- A-UX-01, A-UX-03, A-UX-05, A-UX-08, A-UX-13, SF-03 (at minimum the fallback: no "Check first" blocker for
  public programs).
- Done when: Today has at most 3 cards, nothing sticky but the nav, one week number, no contradictory pills; a skip
  shows one status.

**Lane 3: Landing, claims, evidence line** (`landing/**`). About 3–4 h.
- L-01 (landing copy part), L-03, L-05, L-06, L-07, L-08, P-07; plus the **M-03** ad spec.
- Done when: the hero is outcome-first with one "Start free"; no withdrawn numbers; every program page has an OG
  image; there is a 404; the ad spec is in `dev/active/launch-readiness/ads/`.

**Lane 4: Programs data** (`public/data/programs/*.json`, `manifest.json`, `citations.json`, engine gate code).
About 3–4 h.
- L-01 (manifest part), L-02, L-04 (catalog flags + persona review), SF-04, SF-05.
- Done when: `npm run verify` passes; the CSM red state and the handstand bail-out work or their promise text is gone;
  no Sadowski or kilding_2012 in the advertised programs.

**Lane 5: Sign-up, legal, measurement** (`(auth)/*`, `GoogleAuthButton`, `auth-errors.ts`, `legal/*`, `welcome`,
`account` delete, Supabase templates, UTM capture). About 4 h.
- SG-01, SG-02, SG-03, SG-04, SG-05, SG-06, M-02, A-UX-14, A-UX-15.
- Done when: a click on `terav.fit/programs/first-strict-pullup?utm_campaign=x` → sign-up → confirm → lands in the
  pull-up intake, with the UTM saved; the privacy page is true (Stripe, Google, Cloudflare, Resend); Google sign-up
  requires the consent ticks.

## If the day runs short, cut in this order
1. A-UX-09 (tabs)
2. D-02 (header)
3. SF-03, down to its fallback only
4. A-UX-05 (plan skip polish)
5. D-01, down to the 3 most-seen screens
6. Advertise only the pull-up program (if lane 4's SF-04/SF-05 aren't done)

**Never cut:** Lane 1, SF-01/SF-02, SG-01, SG-04, L-01, L-02, M-02, O-01.

## Day 2 (after the ads are live)
- B-01..B-04: Stripe account → products → entitlements, reverse trial, upgrade moments. About 1.5 days.
- M-06: read the first numbers after 3–5 days.
- Everything else marked **S** in `ACTION-POINTS.md`, starting with A-UX-20 (intake split), D-03/D-04 (design
  system), L-09 (VERIFIED badges), R-01 (next focus).
