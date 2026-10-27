# Terav: master action-point register (2026-10-27)

Every action found by the launch-readiness audit, in one place, de-duplicated.
- **When:** **H** = 1-day hackathon (before ads) · **S** = before scaling ad spend · **L** = later.
- **Who:** **A** = agent · **O** = owner only · **A+O** = agent does it once the owner provides a token or approval.
- **Effort:** S <1h · M 1–3h · L >3h.
- **Source** = the file in this folder with the evidence.

## 1. Personal track and privacy (the owner's clinical data and the hip track)
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| P-01 | Remove `public/data/{log,program,open-questions}.json`, plus the dead seed function | H | A | S | HANDOVER B1 |
| P-02 | `clinical-context.json`: delete it, or serve it via an auth-checked function; gate `loadClinicalContext` to the hip slug | H | A | M | B1 |
| P-03 | Gate the "First hip check" banner (`SignalsStrip.tsx:425`) to the hip slug | H | A | S | app #6 |
| P-04 | Guard `/check/hip` (redirect unless the hip program) | H | A | S | app #5 |
| P-05 | Report: hide "Rehab days", the clinical footer and the clinical section for non-hip programs | H | A | S | app #9 |
| P-06 | Drop the personal slug from `generateStaticParams` | H | A | S | compliance |
| P-07 | Landing: replace the hip mock (`TodayMockup.tsx:21`); the founder story without hip naming | H | A | S | product 3 |
| P-08 | Move the hip-clinical triggers out of the shared `deriveState`, into a personal rule set; add a test | S | A | M | personal-separation P5 |
| P-09 | Remove the LEGACY_REGIONS and `DEFAULT_PROGRAM_SLUG` hip fallbacks | S | A | S | P6 |
| P-10 | `guide/page.tsx:155` hip case study; the personal note in `anterior-hip-rebuild.json`; fixture "groin" note | S | A | S | P8, P10, P11 |

## 2. Safety in the session
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| SF-01 | "Something hurt" as an always-visible top-row chip → Note / Swap or skip / Stop | H | A | S–M | app #4, design §4 |
| SF-02 | A real Stop for every program (not only handstand), with a stopped screen + symptom prompt | H | A | M | app #1-2 |
| SF-03 | Public programs: a one-tap "How do you feel today?" on the brief replaces the required morning check (fallback: drop "Check first" as a blocker) | H | A | M | personal-separation |
| SF-04 | Concurrent-strength-maintenance red state: "resume at 3×4" missing. Fix it or drop the promise | H | A | M | roadmap B12 |
| SF-05 | Handstand-walk `retest_gate` / bail-out gates nothing. Fix it or drop the promise | H | A | M | roadmap B12 |
| SF-06 | Capture red-day screens + the CSM red state with the harness (never captured) | S | A | S | app §3 |

## 3. App bugs and clarity (confirmed in code)
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| A-UX-01 | Nothing sticky except the nav: suggestions inline under the hero; the feedback button moves into You | H | A | M | owner, design §3 |
| A-UX-02 | Session Done screen (summary + "Back to Today" + suggestion); split the Finish and Stop handlers; fix the stale "Continue" CTA | H | A | M–L | app #3,13 |
| A-UX-03 | Today: at most 3 cards, one hero state; no "Workout ready" over "Rest day"; one week number | H | A | M | app #8,10 |
| A-UX-04 | One name per concept: "Extra session", "Suggestion" (Accept / Not now), "reps left", "working max"; citations behind "Why?" | H | A | S–M | app #12,18, h04 |
| A-UX-05 | Plan: one status per day; the skip toast counts visible sessions; a visible Unskip | H | A | M | app #11 |
| A-UX-06 | A hold logged with 0 s counts as logged: require held>0 or a confirm | H | A | S | app #7 |
| A-UX-07 | Gate `/dev/primitives` and `/admin/keywords` to dev/admin | H | A | S | app #15 |
| A-UX-08 | A friendly error instead of the raw `{error}` on Today | H | A | S | design §3 |
| A-UX-09 | Tabs Today / Plan / Record / You; fold Account and Settings into You; remove the header gear; Record absorbs progress/history/report | H (cuttable) | A | M | design §1 |
| A-UX-10 | reset-password with no token: a timeout, "link expired, request new" | S | A | S | app #14 |
| A-UX-11 | Record tile vs timeline disagree: one shared selector | S | A | M | app #16 |
| A-UX-12 | Rest rail: no reorder after "Jump to"; untruncated labels | S | A | M | design §4 |
| A-UX-13 | First-run end: a post-first-workout next step; no amber "Morning check overdue" on day 2 | H | A | S | g1 |
| A-UX-14 | Welcome expectation copy shown for the 3 advertised programs | H | A | S | g1 |
| A-UX-15 | Delete account in ≤2 taps; no raw JSON on failure | H | A | S | g2 |
| A-UX-16 | Feedback endpoint: a visible error, a rate limit | S | A | S | g2 |
| A-UX-17 | Off-plan: duplicate rows in the pull-up drill list; the contradictory "changes the plan" copy | S | A | S | x09 |
| A-UX-18 | muscle-up "Ring dip ladder" title when the item is excluded | S | A | S | app #17 |
| A-UX-19 | Desktop: the bottom tab bar spans the full width; the programs carousel clips | S | A | S | x10 |
| A-UX-20 | Intake split: at most 5 up-front questions, the rest later; the preview's question count matches | S | A | L | design §6, x05 |

## 4. Design system
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| D-01 | One `ui/Button` (tan rect, sentence case); swap the primaries on the 6 ad-path screens | H | A | M | design §5a |
| D-02 | One header rule: the wordmark on tab roots, back + H1 on sub-pages | H | A | S–M | design §5b |
| D-03 | One card style; the accent bar means status only | S | A | M | design §5c |
| D-04 | Type scale; shared tokens for landing + app; cut the 1,552 hardcoded styles | S | A | L | design §5d-e, h06 |

## 5. Sign-up, onboarding and legal
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| SG-01 | Carry `?next=` (the chosen program) through sign-up, email confirm and Google, into intake | H | A | M | h05, money-tech |
| SG-02 | Google sign-up disabled until the terms + health-consent boxes are ticked; a 16+ age tick | H | A | S | compliance 3,6 |
| SG-03 | Remove "no signup wall", "closed beta", "two minutes"; review the `auth-errors.ts` invite remap | H | A | S | compliance 8 |
| SG-04 | Privacy truth pass (`:75,80,97,114,117,121,135`): Stripe not Paddle; name Google OAuth, Cloudflare Analytics, Resend | H | A | M | compliance 4, roadmap 3 |
| SG-05 | Landing legal pages mirror or link the app's; terms consistent (beta/pricing) | H | A | S | compliance 5 |
| SG-06 | Branded Supabase email templates (confirm, reset) | H | A+O | S | g3 |
| SG-07 | Paid terms: renewal, EU 14-day withdrawal, VAT; a consent-withdrawal path | S | A (+lawyer) | M | compliance §4 |

## 6. Landing, claims and evidence
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| L-01 | Strip withdrawn numbers (`manifest.json` ~41,101,128,263; "125 primary studies"; "Six weeks to a 2K PR"; "Every change cites a study"); check `programs-catalog.ts` | H | A | S–M | h18, compliance 7 |
| L-02 | Remove withdrawn citations from advertised programs: Sadowski (handstand, muscle-up), `kilding_2012` | H | A | S | roadmap 2 |
| L-03 | Hero: outcome-first, one "Start free" CTA everywhere, the mockup under the headline on phone, a sticky CTA on program pages | H | A | M | product §1,5 |
| L-04 | Catalog: advertise pull-up, handstand walk, strength + cardio; engine/rowing/overhead "coming soon" (+ persona-harness review) | H | A | M | product §2, roadmap |
| L-05 | OG image + title per program page (ad and link previews); fix the home meta description ("stubborn joint") | H | A | S | g3, Lighthouse |
| L-06 | Landing 404 page; iOS "add to home screen" hint | H | A | S | g3 |
| L-07 | Programs page: no "specialist" review claim; methodology below the fold | H | A | S | x05 |
| L-08 | Evidence line, stage 1: "Built on published sport science. Every change shows its reason and source." | H | A | S | evidence-angle |
| L-09 | Close the citation hold: evidence-verifier on all 125 → VERIFIED badges; publish the whitepapers as pages | S | A | L | evidence-angle |
| L-10 | Named expert reviewer ("Reviewed by …") | L | O | — | evidence-angle |
| L-11 | Real beta quote with consent (social proof) | S | O | S | product §4 |

## 7. Measurement and ads
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| M-01 | Cloudflare Web Analytics ON (both domains) | H | A+O | S | compliance §3 |
| M-02 | UTMs captured on landing → sign-up → user metadata; an SQL query for sign-ups and activations by campaign | H | A | M | money-tech |
| M-03 | Ad spec: 3 ad sets, targeting 18+, interests/keywords only, safe wording, UTM links, creatives | H | A | M | compliance §2 |
| M-04 | Review panel: 3 Sonnet lenses, 1 round, on the ads + landing (~150k tokens) | H | A | S | D8 |
| M-05 | Meta Business + Google Ads accounts, payment, upload, spend €150 (Meta €100 / Google €50) | H | O | M | O3 |
| M-06 | Read the test after 3–5 days: sign-ups and activations per campaign | S | A+O | S | launch-plan |
| M-07 | Consent Mode v2 + a consent banner, then conversion tags (never health events) | S | A | M | compliance §4 |

## 8. Infrastructure and ops
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| O-01 | Supabase: sign-ups ON, custom SMTP (Resend), captcha (Turnstile), auth rate limits, confirm-email ON | H | A+O | S | O1 |
| O-02 | A real phone sign-up with a real inbox, after deploy | H | O | S | O4 |
| O-03 | Re-run `npm run e2e:personas` after the sprint; fix the muscle-up-elbow failure (deferral) | H | A | S | x11 |
| O-04 | Sentry in functions; function rate limits; confirm the Supabase plan and backups | S | A+O | M | h17 |
| O-05 | Revoke the unused Resend key | L | O | S | roadmap |
| O-06 | The harness misses a true stranger first run: add a signed-out → sign-up → intake → day-1 spec | S | A | M | app §3 |

## 9. Billing and tiers (Stripe)
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| B-01 | A separate Terav Stripe account under the owner's login; Stripe Tax on | S | O | S | O5 |
| B-02 | Products/prices (€9.99/€89), Customer Portal, webhook endpoint via Stripe CLI (test mode → owner flips to live) | S | A+O | S | O5 |
| B-03 | `entitlements()`, a 14-day Pro reverse trial at sign-up, webhook → `tier`, per-user multi-focus, history/report gates, trial-end email | S | A | L (1–1.5 d) | free-tier-design |
| B-04 | Upgrade moments (trial day 12, program end, history >30 d, retest report) | S | A | M | free-tier-design |
| B-05 | Accountant: EU VAT / OSS | S | O | — | O7 |

## 10. Product, roadmap and docs
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| R-01 | "Next focus" offer at program end (goal-reached churn) | S | A | M | market, free-tier |
| R-02 | Engine gaps: off-plan strength and external load reach proposals; load softening on 7/9 programs; 16 UTC date sites | S | A | L | roadmap |
| R-03 | QA-1 drift: Ferrari (handstand), Das (rowing) still present | S | A | S | roadmap |
| R-04 | HYROX station-focus program; Concept2 import | L | A | L | market |
| R-05 | Video coach, pull-up first, validated on the owner's clips | L | A | L | video-coach |
| R-06 | Banner or rewrite the stale docs: README, NEXT.md, saas-launch plan/tasks/architecture-v2, traffic plan | S | A | S | roadmap |
| R-07 | Lawyer: Art. 9 consent design, DPIA, cookieless analytics, subscription terms | S | O | — | O6 |
