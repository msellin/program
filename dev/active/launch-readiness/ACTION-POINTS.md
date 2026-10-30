# Terav: master action-point register (2026-10-27)

<!-- SUPERSEDED-BY: dev/active/ROADMAP.md -->
> **Not maintained since 2026-10-30.** The one task list is `dev/active/ROADMAP.md`. Every open item here was
> checked against the code (`dev/active/roadmap-reconcile/`) and the live ones moved there. Statuses below are history.


Every action found by the launch-readiness audit, in one place, de-duplicated.
- **When:** **H** = 1-day hackathon (before ads) · **S** = before scaling ad spend · **L** = later.
- **Who:** **A** = agent · **O** = owner only · **A+O** = agent does it once the owner provides a token or approval.
- **Effort:** S <1h · M 1–3h · L >3h.
- **Source** = the file in this folder with the evidence.

## 0. Done during prep (2026-10-27, before the hackathon)
| ID | Action | Status |
|----|--------|--------|
| X-01 | CI had been failing since 2026-10-20 (`tsc` error in `BriefView.test.tsx:289`); nothing deployed, BUG-48 included | ✓ fixed |
| X-02 | `npm run verify` now runs `tsc --noEmit` + vitest (pre-commit catches type errors before CI) | ✓ |
| X-03 | Task index regenerated (the `task-index.test.ts` staleness failure) | ✓ |
| X-04 | `tests/e2e/launch-gaps.spec.ts`: stranger first run, red day, 375/393 viewports; baseline in `screens/gaps/` | ✓ |
| X-05 | `dev/scripts/hackathon-auth-config.sh` (not run), `LANES.md`, `ads/ad-spec-draft.md`, `owner-questions.md` | ✓ |

## 1. Personal track and privacy (the owner's clinical data and the hip track)
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| P-01 | Remove `public/data/{log,program,open-questions}.json`, plus the dead seed function | H | A | S | HANDOVER B1 | ✓ 81d4b5d |
| P-02 | `clinical-context.json`: delete it, or serve it via an auth-checked function; gate `loadClinicalContext` to the hip slug | H | A | M | B1 | ✓ 81d4b5d |
| P-03 | Gate the "First hip check" banner (`SignalsStrip.tsx:425`) to the hip slug | H | A | S | app #6 | ✓ bf64bd2 |
| P-04 | Guard `/check/hip` (redirect unless the hip program) | H | A | S | app #5 | ✓ bf64bd2 |
| P-05 | Report: hide "Rehab days", the clinical footer and the clinical section for non-hip programs | H | A | S | app #9 | ✓ bf64bd2 |
| P-06 | Drop the personal slug from `generateStaticParams` | H | A | S | compliance | ✓ bf64bd2 |
| P-07 ✓ 5fe464a | Landing: replace the hip mock (`TodayMockup.tsx:21`); the founder story without hip naming | H | A | S | product 3 |
| P-08 | Move the hip-clinical triggers out of the shared `deriveState`, into a personal rule set; add a test | S | A | M | personal-separation P5 |
| P-09 | Remove the LEGACY_REGIONS and `DEFAULT_PROGRAM_SLUG` hip fallbacks | S | A | S | P6 |
| P-10 | `guide/page.tsx:155` hip case study; the personal note in `anterior-hip-rebuild.json`; fixture "groin" note | S | A | S | P8, P10, P11 |

## 2. Safety in the session
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| SF-01 | "Something hurt" as an always-visible top-row chip → Note / Swap or skip / Stop | H | A | S–M | app #4, design §4 ✓ 8a245f0 |
| SF-02 | A real Stop for every program (not only handstand), with a stopped screen + symptom prompt | H | A | M | app #1-2 ✓ 8a245f0 |
| SF-03 | Public programs: a one-tap "How do you feel today?" on the brief replaces the required morning check (fallback: drop "Check first" as a blocker) | H | A | M | personal-separation | (fallback only ✓ 362d271)
| SF-04 ✓ 6f58787 (+ lane 2a 9964a2a) | Concurrent-strength-maintenance red state: "resume at 3×4" missing. Fix it or drop the promise | H | A | M | roadmap B12 |
| SF-05 ✓ a2613fa (promise dropped; entry gate live) | Handstand-walk `retest_gate` / bail-out gates nothing. Fix it or drop the promise | H | A | M | roadmap B12 |
| SF-06 | Capture red-day screens + the CSM red state with the harness (never captured) | S | A | S | app §3 |

## 3. App bugs and clarity (confirmed in code)
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| A-UX-01 | Nothing sticky except the nav: suggestions inline under the hero; the feedback button moves into You | H | A | M | owner, design §3 | ✓ 362d271
| A-UX-02 | Session Done screen (summary + "Back to Today" + suggestion); split the Finish and Stop handlers; fix the stale "Continue" CTA | H | A | M–L | app #3,13 ✓ 8a245f0 |
| A-UX-03 | Today: at most 3 cards, one hero state; no "Workout ready" over "Rest day"; one week number | H | A | M | app #8,10 | ✓ 362d271
| A-UX-04 | One name per concept: "Extra session", "Suggestion" (Accept / Not now), "reps left", "working max"; citations behind "Why?" | H | A | S–M | app #12,18, h04 | ✓ 4308e73 (partial: citations behind Why? not moved) |
| A-UX-05 | Plan: one status per day; the skip toast counts visible sessions; a visible Unskip | H | A | M | app #11 | ✓ e1ecbf6 (status/Unskip; toast text unchanged) |
| A-UX-06 | A hold logged with 0 s counts as logged: require held>0 or a confirm | H | A | S | app #7 ✓ 8a245f0 |
| A-UX-07 | Gate `/dev/primitives` and `/admin/keywords` to dev/admin | H | A | S | app #15 | ✓ bf64bd2 |
| A-UX-08 | A friendly error instead of the raw `{error}` on Today | H | A | S | design §3 | ✓ 362d271
| A-UX-09 | Tabs Today / Plan / Record / You; fold Account and Settings into You; remove the header gear; Record absorbs progress/history/report | H (cuttable) | A | M | design §1 |
| A-UX-10 | reset-password with no token: a timeout, "link expired, request new" | S | A | S | app #14 |
| A-UX-11 | Record tile vs timeline disagree: one shared selector | S | A | M | app #16 |
| A-UX-12 | Rest rail: no reorder after "Jump to"; untruncated labels | S | A | M | design §4 |
| A-UX-13 | First-run end: a post-first-workout next step; no amber "Morning check overdue" on day 2 | H | A | S | g1 | ✓ 362d271
| A-UX-14 | Welcome expectation copy shown for the 3 advertised programs | H | A | S | g1 | ✓ 43048ef
| A-UX-15 | Delete account in ≤2 taps; no raw JSON on failure | H | A | S | g2 | ✓ 6e89b95
| A-UX-16 | Feedback endpoint: a visible error, a rate limit | S | A | S | g2 |
| A-UX-17 | Off-plan: duplicate rows in the pull-up drill list; the contradictory "changes the plan" copy | S | A | S | x09 |
| A-UX-18 | muscle-up "Ring dip ladder" title when the item is excluded | S | A | S | app #17 |
| A-UX-19 | Desktop: the bottom tab bar spans the full width; the programs carousel clips | S | A | S | x10 |
| A-UX-20 | Intake split: at most 5 up-front questions, the rest later; the preview's question count matches | S | A | L | design §6, x05 |

## 4. Design system
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| D-01 | One `ui/Button` (tan rect, sentence case); swap the primaries on the 6 ad-path screens | H | A | M | design §5a | ✓ 57c5a85 |
| D-02 | One header rule: the wordmark on tab roots, back + H1 on sub-pages | H | A | S–M | design §5b | ✓ 0b8b667 |
| D-03 ✓ 2026-10-28 (`ui/Card`, guarded by `type-scale.test.ts`) | One card style; the accent bar means status only | S | A | M | design §5c |
| D-04 | Type scale; shared tokens for landing + app; cut the 1,552 hardcoded styles. **Shared tokens done 2026-10-27** (`brand/tokens.css`, guarded by `brand.test.ts`) with the brand Direction B assets (`dev/active/brand/`); **type scale + purge done 2026-10-28**: 8-step scale in `brand/tokens.css`, ~1,000 `text-[Npx]` → 6 timer digits, radii named; `type-scale.test.ts` guards it | S | A | L | design §5d-e, h06 |

## 5. Sign-up, onboarding and legal
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| SG-01 | Carry `?next=` (the chosen program) through sign-up, email confirm and Google, into intake | H | A | M | h05, money-tech | ✓ 6e89b95
| SG-02 | Google sign-up disabled until the terms + health-consent boxes are ticked; a 16+ age tick | H | A | S | compliance 3,6 | ✓ 6e89b95
| SG-03 | Remove "no signup wall", "closed beta", "two minutes"; review the `auth-errors.ts` invite remap | H | A | S | compliance 8 | ✓ 6e89b95
| SG-04 | Privacy truth pass (`:75,80,97,114,117,121,135`): Stripe not Paddle; name Google OAuth, Cloudflare Analytics, Resend | H | A | M | compliance 4, roadmap 3 | ✓ 6e89b95
| SG-05 | Landing legal pages mirror or link the app's; terms consistent (beta/pricing) | H | A | S | compliance 5 | ✓ 43048ef
| SG-06 ✓ applied 2026-10-27 | Branded Supabase email templates (confirm, reset) | H | A+O | S | g3 | ✓ 43048ef
| SG-08 | Cloudflare Turnstile widget on sign-up (email + Google), passing `captchaToken`; THEN enable Supabase captcha (`CAPTCHA=1`). Widget "Terav sign-in" (app.terav.fit) created and site key in Actions secrets 2026-10-28; Supabase secret = owner. Once on, the live harness cannot sign in through the UI (follow-up) | H | A+O | M | kickoff kit | ✓ 6e89b95
| SG-07 | Paid terms: renewal, EU 14-day withdrawal, VAT; a consent-withdrawal path | S | A (+lawyer) | M | compliance §4 |

## 6. Landing, claims and evidence
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| L-01 ✓ 5fe464a (landing) ✓ 47a66ca (manifest) | Strip withdrawn numbers (`manifest.json` ~41,101,128,263; "125 primary studies"; "Six weeks to a 2K PR"; "Every change cites a study"); check `programs-catalog.ts` | H | A | S–M | h18, compliance 7 |
| L-02 ✓ 1231f42 | Remove withdrawn citations from advertised programs: Sadowski (handstand, muscle-up), `kilding_2012` | H | A | S | roadmap 2 |
| L-03 ✓ 5fe464a | Hero: outcome-first, one "Start free" CTA everywhere, the mockup under the headline on phone, a sticky CTA on program pages | H | A | M | product §1,5 |
| L-04 ✓ 1220b53 | Catalog: advertise pull-up, handstand walk, strength + cardio; engine/rowing/overhead "coming soon" (+ persona-harness review) | H | A | M | product §2, roadmap |
| L-05 ✓ 5fe464a | OG image + title per program page (ad and link previews); fix the home meta description ("stubborn joint") | H | A | S | g3, Lighthouse |
| L-06 ✓ 5fe464a | Landing 404 page; iOS "add to home screen" hint | H | A | S | g3 |
| L-07 ✓ 5fe464a | Programs page: no "specialist" review claim; methodology below the fold | H | A | S | x05 |
| L-08 ✓ 5fe464a | Evidence line, stage 1: "Built on published sport science. Every change shows its reason and source." | H | A | S | evidence-angle |
| L-09 | Close the citation hold: evidence-verifier on all 125 → VERIFIED badges; publish the whitepapers as pages | S | A | L | evidence-angle |
| L-10 | Named expert reviewer ("Reviewed by …") | L | O | — | evidence-angle |
| L-11 | Real beta quote with consent (social proof) | S | O | S | product §4 |
| L-12 | After the app redesign (D-03/D-04, A-UX-09): re-shoot real app screens and rebuild the landing visuals from them. Today the landing uses coded mockups (`TodayMockup` etc.), not screenshots, and the ad creatives are text cards (review panel #9: a phone-frame Today shot is the biggest click lever). Capture from the persona harness, never the owner's account | S | A | M | owner 2026-10-27, M-04 #9 |

## 7. Measurement and ads
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| M-01 ✓ Pages Web Analytics enabled on program-v2 + terav-landing 2026-10-28 | Cloudflare Web Analytics ON (both domains) | H | A+O | S | compliance §3 |
| M-02 | UTMs captured on landing → sign-up → user metadata; an SQL query for sign-ups and activations by campaign | H | A | M | money-tech | ✓ 6e89b95
| M-03 ✓ ec8f21b | Ad spec: 3 ad sets, targeting 18+, interests/keywords only, safe wording, UTM links, creatives | H | A | M | compliance §2 |
| M-04 ✓ 7f78fb3 | Review panel: 3 Sonnet lenses, 1 round, on the ads + landing (~150k tokens) | H | A | S | D8 |
| M-05 | Meta Business + Google Ads accounts, payment, upload, spend €150 (Meta €100 / Google €50) | H | O | M | O3 |
| M-06 | Read the test after 3–5 days: sign-ups and activations per campaign | S | A+O | S | launch-plan |
| M-07 | Consent Mode v2 + a consent banner, then conversion tags (never health events) | S | A | M | compliance §4 |
| M-08 | Marketing channels beyond the ad test: 15 ideas mapped onto Terav (comparison pages, cited guides, one free calculator, daily figure posts, directories, coach outreach, paid niche placements, creators), ordered after M-06 | L | A+O | L | marketing-channels.md (owner 2026-10-30) |

## 8. Infrastructure and ops
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| O-01 ✓ SMTP+limits 2026-10-27 (captcha waits on SG-08) | Supabase: sign-ups ON, custom SMTP (Resend), captcha (Turnstile), auth rate limits, confirm-email ON | H | A+O | S | O1 |
| O-02 | A real phone sign-up with a real inbox, after deploy | H | O | S | O4 |
| O-03 ✓ 2026-10-28 sweep 30/31 + pullup-elbow false positive fixed in the spec; red-day session page confirmed live | Re-run `npm run e2e:personas` after the sprint; fix the muscle-up-elbow failure (deferral) | H | A | S | x11 |
| O-04 | Sentry in functions; function rate limits; confirm the Supabase plan and backups | S | A+O | M | h17 |
| O-05 | Revoke the unused Resend key | L | O | S | roadmap |
| O-06 | The harness misses a true stranger first run: add a signed-out → sign-up → intake → day-1 spec | S | A | M | app §3 |

## 9. Billing and tiers (Stripe)
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| B-01 | A separate Terav Stripe account under the owner's login; Stripe Tax on | S | O | S | O5 |
| B-02 | Products/prices (€9.99/€89), Customer Portal, webhook endpoint via Stripe CLI (test mode → owner flips to live) | S | A+O | S | O5 |
| B-03 (owner 2026-10-30: build after M-06 is read) | `entitlements()`, a 14-day Pro reverse trial at sign-up, webhook → `tier`, per-user multi-focus, history/report gates, trial-end email | S | A | L (1–1.5 d) | free-tier-design |
| B-04 | Upgrade moments (trial day 12, program end, history >30 d, retest report) | S | A | M | free-tier-design |
| B-05 | Accountant: EU VAT / OSS | S | O | — | O7 |

## 10. Product, roadmap and docs
| ID | Action | When | Who | Effort | Source |
|----|--------|------|-----|--------|--------|
| R-01 | "Next focus" offer at program end (goal-reached churn). **Partly exists:** a finished arc shows "You finished" + "Pick your next focus" + repeat/extend (seen on pullup-fast); make it the Pro hook and check its numbers ("0 reps, +0" after 8 weeks under "Nice.") | S | A | M | market, free-tier |
| R-02 | Engine gaps: off-plan strength and external load reach proposals; load softening on 7/9 programs; 16 UTC date sites | S | A | L | roadmap |
| R-03 | QA-1 drift: Ferrari (handstand), Das (rowing) still present | S | A | S | roadmap |
| R-04 | HYROX station-focus program; Concept2 import | L | A | L | market |
| R-05 | Video coach, pull-up first, validated on the owner's clips | L | A | L | video-coach |
| R-06 | Banner or rewrite the stale docs: README, NEXT.md, saas-launch plan/tasks/architecture-v2, traffic plan | S | A | S | roadmap |
| R-07 | Lawyer: Art. 9 consent design, DPIA, cookieless analytics, subscription terms | S | O | — | O6 |

## 11. From the gap captures (stranger first run, red day, 375/393; `audit/gap-A/B/C`)
| ID | Action | When | Who | Effort | Lane | Source |
|----|--------|------|-----|--------|------|--------|
| G-01 ✓ ac82d14 (schedule; Today = 2b 5ee0c66) | **A new sign-up's day 1 is a rest day:** no first workout is reachable. Offer a session on day 1 (start the schedule today, or "Start your first session now") | H | A | M | 2b + 4 | gap-A | (Today side ✓ 362d271)
| G-02 | Placement mismatch: the intake result says Tier D (the walker typed 3 into every test), but Today says Tier A and offers "Advance to Tier D". Verify the placement is saved and applied | H | A | S–M | 5 | gap-A | ✓ walker artifact, see lanes-handoff
| G-03 | Intake physical-test steps (5 screens) overflow horizontally at 375px | H | A | S | 5 | gap-A | ✓ 43048ef
| G-04 | **An untouched morning check saves a green day** (all defaults 0; Save is never disabled; `check/page.tsx:62-74,403`). Unanswered must not mean "fine" | H | A | S | 2b | gap-B | ✓ e2f79b3
| G-05 | After the first check, the "How Terav reads you" onboarding modal covers Today and hides the red verdict (`OnboardingRunner.tsx:72-103`) | H | A | S | 2b | gap-B, gap-C | ✓ e2f79b3
| G-06 ✓ 1fe275a | **A tier-advance suggestion shows on a red day** ("advance to Tier D"); `selectTierAdvance` has no state check (`lib/proposals/select.ts:280-300`) | H | A | S | 4 | gap-B |
| G-07 ✓ 783f977 (derivation; session = lane 2a) | **Red doesn't change the session or plan** ("Open session" ungated; the 10% cut is on the TM path only, `suggest.ts:265-271`). **Confirmed on a real session 2026-10-27** (CSM: a low-back-severe red, and the bike session is unchanged). Make red = hold + the program's alternative | H | A | M | 2a + 4 | gap-B ✓ fbef3c9 (session side; derivation 783f977) |
| G-08 | Red copy has no next step; "see a clinician" exists only inside the Why/Cited sheets; a night-pain red has no referral line | H | A | S | 2b | gap-B | ✓ e2f79b3
| G-09 ✓ edf2908 (+ 2b 2aa81c7) | **Plan says "No phase covers this week" in every new user's first week.** Checked 2026-10-27: `plan/page.tsx:216` resolves the phase for the viewed week's Monday (`activePhaseFor(program, iso(viewedMon))`), which falls before a mid-week `started_at`. The program files' calendar dates are fine (`shiftedPhases` rebases them; Today correctly says Week 1 of 4). Fix: use the later of Monday and started_at, or any scheduled day in the week | H | A | S | 4 | gap-B, verified |
| G-10 | Check screen: the sticky Save covers the last region row at 375; the feedback bubble sits on the CTA (with A-UX-01) | H | A | S | 2b | gap-B, gap-C | ✓ 6a2f1e9
| G-11 | User-facing copy "no LLM, just a keyword parser": cut | H | A | S | 2b | gap-B | ✓ e2f79b3
| G-12 | The scale anchors (4–6 ache, 7–10 pause) disagree with the gate (amber 4–5, red >5) and the chip labels; align the copy to the gate, never the reverse | S | A | S | — | gap-B |
| G-13 | The Record sheet clips the nav icons; "/" at 393 resolved to /off-plan in the capture (a redirect quirk) | S | A | S | — | gap-C |
| G-14 ✓ 2026-10-29 (pull-up session moved to today via Plan → Move…; red = "Rest today" + "No hanging" alternative, physio line; captures in screens/gaps/B-red-day; the run exposed and 2de491e fixed Plan Move not reaching Today) | Red against a real session. **Spec done 2026-10-27:** part B picks the first advertised-program persona with a loadable session that day and dismisses onboarding. **Result on CSM (Zone 2 bike):** Today says "Back off", but the session is unchanged and loggable (confirms G-07). **Still to do:** a loaded pull-up/handstand day, after lanes 2a + 4 | H (QA) | A | S | QA | screens/gaps/B-red-day |
