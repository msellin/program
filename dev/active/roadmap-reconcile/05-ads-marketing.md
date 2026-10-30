# 05 Ads + marketing workstream (verified 2026-10-30, read-only)

## 1. Item table
| ID | Verdict | Who | Evidence | Note |
|----|---------|-----|----------|------|
| M-01 | DONE | A+O | ACTION-POINTS row (Pages Web Analytics on both projects 2026-10-28); CSP allows static.cloudflareinsights.com (`next-app/public/_headers:6`); landing privacy names it (`landing/src/app/privacy/page.tsx:30`) | No beacon in code (dashboard-injected); never seen a live reading |
| M-02 | DONE | A | 6e89b95; `next-app/src/lib/attribution.ts` (utm_*/fbclid/gclid, first-touch, into user metadata); `landing/src/components/CtaLink.tsx` forwards utm_*; `dev/scripts/activation.sql` | Not run on real data. Activated = any day log in user_states. CtaLink forwards only utm_*, not gclid/fbclid (fine: auto-tag is off) |
| M-03 | DONE | A | ec8f21b; `ads/ad-spec.md`; 6 PNGs in `ads/creatives/` (3 sets x 1080x1080 and 1080x1920) | Creatives are text cards, no product |
| M-04 | DONE (7 of 14 findings still owner calls) | A | 7f78fb3, c6e3bd6, e316425, 8e4ea9d, 5cd03f8; `ads/review-panel.md` | Open: #1, #3, #4, #7, #8, #9, #10, #13, #14 |
| M-05 | OWNER | O | No code. Ad accounts, payment and upload unverifiable | The gate to spending the €150 |
| M-06 | OPEN | A+O | Needs M-05 traffic; `activation.sql` ready | Read after 3-5 days; decision rule in ad-spec |
| M-07 | OPEN, intentionally deferred | A | grep landing/src + next-app/src: no fbq/gtag/CMP, only first-party consent for health data. CSP has no ad hosts | Not needed for UTM-only test. Needed before any pixel/conversion tag |
| M-08 | OPEN | A+O | `marketing-channels.md` (15 ideas, ordered after M-06); no code | Nothing started |
| L-01..L-08 | DONE | A | commits per ACTION-POINTS (5fe464a, 47a66ca, 1231f42, 1220b53); program page has sticky mobile CTA (`landing/src/app/programs/[slug]/page.tsx:233-240`); per-program OG `programs/[slug]/opengraph-image.tsx`; `not-found.tsx` | Landing AVAILABLE = pullup, handstand, strength+cardio; 6 COMING (`programs-catalog.ts`) |
| L-09 | OPEN | A | ACTION-POINTS; M-04 #12 asks to verify the "Baker 2025" review before traffic lands | evidence-verifier run; not blocking ads |
| L-10 | OWNER | O | Named reviewer needs a person | Later |
| L-11 | OWNER | O | Needs real beta quote with consent | Later; no testimonials in ads anyway |
| L-12 | OPEN | A | Landing uses coded mockups; creatives text-only (review-panel #9) | Waits on app redesign; biggest click lever |
| B-01 | OWNER | O | No Stripe code anywhere in next-app/functions (only delete-account, feedback, admin) | Separate Terav Stripe account, Stripe Tax |
| B-02 | OPEN | A+O | No price/webhook code | €9.99/€89 products, Portal, webhook |
| B-03 | OPEN (deferred by owner until M-06 read) | A | `tier`/`trial_ends_at` only in `schemas.ts:1917`; `MULTI_MAIN_ENABLED` global flag (useStore); no `entitlements()` | 1-1.5 d |
| B-04 | OPEN | A | Nothing built | After B-03 |
| B-05 | OWNER | O | `owner-questions.md` accountant list | Before Stripe live |
| SG-07 | OPEN | A+lawyer | Paid terms absent (`legal/terms`) | Before charging |
| Lawyer Qs | OWNER | O | `owner-questions.md` | Not blocking free test; blocking scale and paid |
| Channels #1-15 | OPEN | mixed | `marketing-channels.md`; none exist | Start only after M-06 |

Landing vs manifest: DONE. The 3 AVAILABLE landing programs and 6 COMING all exist in `manifest.json` (9 slugs; hip is `personal: true` and absent from the landing catalog). The test at `data-integrity.test.ts:791-808` enforces it. Note manifest `status` is "REFERENCED" for all, so open/coming is a landing-only field.

## 2. Ad test readiness (before the €150)
- UTMs forwarded and stored at sign-up: YES (`CtaLink.tsx`, `attribution.ts`, 6e89b95).
- Sign-ups-by-campaign SQL: YES written (`dev/scripts/activation.sql`), NOT yet run on real data (owner must run in SQL editor).
- Landing pages for the 3 sets with H1, sticky CTA, OG image: YES (`programs/[slug]/page.tsx`).
- Ad copy passed banned-word grep and review panel: YES; 9 judgement calls left as owner options.
- Creatives exist: YES, text cards only (6 PNGs). They are valid to upload.
- No pixel/consent banner needed for UTM-only test: YES (none in code, privacy pages match).
- Cloudflare Web Analytics on: PARTIAL (reported on 2026-10-28; no reading checked).
- Turnstile captcha on sign-up: PARTIAL (widget in code; Supabase-side `CAPTCHA=1` is owner, SG-08).
- Real phone sign-up end to end (O-02): NO (OWNER).
- Meta and Google accounts, payment, auto-tagging off, placeholders replaced: NO (OWNER, M-05).
- Honest "free" wording vs paid later: PARTIAL (review-panel #10 open; privacy names Stripe).
- Stranger first-run (sign-up to intake to day 1) tested: NO (O-06 harness gap).

## 3. Path to first paying user (ads/marketing side)
1. O: real phone sign-up with real inbox, incl. Turnstile enabled in Supabase (O-02/SG-08), ~30 min.
2. O: run `activation.sql` once on the test sign-up to prove attribution works; A fixes if the row is wrong, ~30 min.
3. O: decide the open M-04 calls (#1, #3, #10, optional #9 phone-frame creative), ~30 min. A applies, ~1-2 h.
4. O: Meta + Google accounts, auto-tagging off, literal UTMs, upload, spend €150, 5-7 days (M-05), ~2 h + 24 h review.
5. A+O: day 3-5 read (M-06): sign-ups, activation, cost per sign-up per set; apply the pause rule, ~1 h.
6. A (parallel while ads run): fix the stranger first run (O-06) and L-09 verify "Baker 2025", ~1 d.
7. O: Stripe account + Tax, accountant on VAT/OSS (B-01/B-05), ~1-2 h + wait. Can start now.
8. A: billing build (B-02, B-03, B-04): Checkout, webhook to `tier`, `entitlements()`, 14-day Pro reverse trial, Portal, trial-end email, ~1.5 d. Owner chose to start after M-06.
9. A + lawyer: paid terms (renewal, 14-day withdrawal) SG-07, ~0.5 d + review. Gates going live.
10. O: flip Stripe to live; first paying user possible here; set the trial length (7 vs 14 is unresolved in `market/pricing-trials.md`, so choose one and note it).
11. A+O: after M-06, in order: comparison + cited guide pages, one calculator (2k), daily figure posts, directories, coach outreach; paid niche placements sized by the measured sign-up cost (`marketing-channels.md`). Directories and outreach need ~1 h of owner time each.
12. A+O: M-07 (consent banner + Consent Mode) only when moving to Meta pixel / Google conversion tags, after lawyer review of Art. 9 design.

Measurement caveat: with UTM-only, the unit is activation (first day log), not conversion to paid. €150 buys about 4-30 sign-ups, so it shows cold-traffic viability and cost per sign-up, not payer conversion. Paid conversion is read first from the trial cohort after step 10.
