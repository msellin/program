# Terav roadmap: to the first paying user (2026-10-30)

**This is the one task list.** Every open item from every older list was checked against the code on 2026-10-30
(evidence per item in `roadmap-reconcile/01..05-*.md`). Older lists carry a banner pointing here and are not
maintained. **New review rounds add rows here; they do not start their own list.**

Owner (O) / agent (A). IDs are kept from the source lists: `A-UX`, `P`, `G`, `L`, `M-0x`/`B`/`O`/`R`/`SG` from
`launch-readiness/ACTION-POINTS.md`, `M-0xx` from `design-review-2026-10-28/MASTER-LIST.md`.

Decided order (owner 2026-10-30): **ad test → read it → billing → first paying user → marketing at scale.**
The €150 test measures cold sign-ups, activation (first day logged) and cost per sign-up. It cannot measure
conversion to paid: paid conversion is first read from the trial cohort after Stripe is live (stage 4).

## Stage 1: before the €150 spend

### Owner
- [ ] O-02 + SG-08: a real phone sign-up with a real inbox; switch Supabase captcha on (`CAPTCHA=1`)
- [ ] Run `dev/scripts/activation.sql` once on that sign-up to prove UTM attribution lands
- [ ] M-04 open calls in `launch-readiness/ads/` (#1, #3, #10; #9 phone-frame creative needs L-12)
- [ ] M-05: Meta + Google accounts, payment, auto-tagging off, replace the `{meta|google}` / `{ad}` UTM placeholders

### Agent: trust and safety a stranger would hit (small, do first)
- [x] M-069 privacy (2026-10-30: "birthday" labels removed, dates kept; `data-integrity.test.ts` guards public/data): `public/data/programs/anterior-hip-rebuild.json:11,55,60,93` ships the founder's birthday
      (24 Apr) and birthday goals, and everything under `public/` can be downloaded
- [x] G-12 (2026-10-30: bands 0-3/4-5/6-10, pinned to `deriveState` by `ScaleAnchorStep.test.ts`): `ScaleAnchorStep.tsx:34-38` teaches amber 4-6 / red 7-10; the gate reds at >5. Align the copy to the gate
- [x] M-011 (2026-10-30: red day leads with the rest card; list opens via "Log something you already did"): the extra-session list offers hangs on a red shoulder day (`OffPlanSession.tsx`, no symptom filter)
- [x] M-033 (2026-10-30: saved line per state; only red claims a change): the check says "Saved. Today's plan is adjusted." when Today is unchanged (`check/page.tsx:291`)
- [x] M-026 (2026-10-30: plain lines, personal-program sentences removed): "simulator harness", "archetypes" on the programs page (`programs/page.tsx:183,372`)
- [x] M-022: review line replaced with "Applies to the Terav beta." (2026-10-30); privacy table stacks as one labelled card per row below `sm`, table from `sm` up (2026-10-30, checked at 393 px, no horizontal scroll; `legal/privacy/page.test.tsx`)
- [x] M-049: hurt-sheet Stop is now a secondary outline (2026-10-30); stopped state checked 2026-10-30: the planned session already landed on "Session stopped" with sheets closed; the extra session dropped back onto the drill list, and now lands on the same stopped screen from the hurt sheet and the note sheet's stop offer (`OffPlanSession.test.tsx`)
- [x] RECHECK-new-4 (2026-10-30: one line, "Shoulder R is 8/10, above the 5/10 line.", from `reasonForState` on Today's rest card and the check; `RedRestCard.test.tsx`): "Shoulder 8/10" vs "above 5/10" wording mismatch on the red card
- [x] P-09 (2026-10-30: `loadProgram` requires a slug and rejects without one, every caller already guarded; fallback regions are the general unsided set, legacy ids still resolve for history; `data-loader.test.ts`, `symptom-state.test.ts`): `DEFAULT_PROGRAM_SLUG` = hip in `data-loader.ts:11`; `LEGACY_REGIONS` fallback
- [x] P-10 (2026-10-30: guide line now general; harness note "nothing sore" instead of "no groin pain"; `personal-copy.test.ts` guards both. P11, the hip override note, stays in the personal program by design and goes behind sign-in with the row below): `guide/page.tsx:160` hip case study
- [ ] Personal program behind sign-in: `anterior-hip-rebuild.json` (clinical overrides, lift history) is a public
      static file; serve it through an auth-checked function like the removed clinical files (follow-up to M-069)

### Agent: ad-path clarity
- [ ] O-06: Playwright spec signed-out → sign-up → quick-start intake → day-1 session (the ad visitor's path)
- [ ] A-UX-10: `/reset-password` without a token waits forever; add expired-link state
- [ ] M-006: proposal copy "Advance to Tier B — …", "Apply bump", "Do it" (`useProposalActions.ts:171-185`)
- [ ] M-008 / P-18: brief still renders the "How to run this" prose (`BriefView.tsx:452`)
- [ ] Copy batch: M-047 "3th" (`OverflowSheet.tsx:82`), M-075 "Cooked" preset, M-068 "More programs land as
      they're authored", M-053 "I-Y-T" / "scap CARs" in shipped JSON, M-023 "engine reads"
- [ ] Live-render sweep for the items only a screenshot can settle: M-037/038/039/041/043/050/051/054/058, M-029,
      M-035, A-UX-11/12/17, G-13, RECHECK-new-8 (pull-up user offered deadlifts off-plan). One persona run, then
      tick or file each
- [ ] L-12: re-shoot real app screens for the landing and a phone-frame creative (from the harness, never the
      founder's account)

## Stage 2: the ad test runs (5-7 days)
- [ ] M-05 spend €150 (Meta €100 / Google €50) (O)
- [ ] M-06 read on day 3-5: sign-ups, activation, cost per sign-up per ad set; apply the pause rule (A+O)
- [ ] In parallel (A): O-04 Sentry in `functions/` + rate limits (A-UX-16 feedback endpoint too); confirm the
      Supabase plan and backups (O)
- [ ] In parallel (A): L-09 citation verification → VERIFIED badges (includes M-025 placeholder-looking entries,
      `kilding_2012` withdrawal, R-03 Das)

## Stage 3: billing (after M-06 is read)
- [ ] B-01 Stripe account + Stripe Tax (O, can start now)
- [ ] B-05 accountant on EU VAT / OSS (O, can start now)
- [ ] Decide: trial length 7 vs 14 days (`market/pricing-trials.md` has no evidence either way); free tier = 1
      program? (`free-tier-design.md`) (O)
- [ ] B-02 products/prices (€9.99 / €89), Customer Portal, webhook (test mode) (A+O)
- [ ] B-03 `entitlements()`, 14-day Pro reverse trial at sign-up, webhook → `tier` (`schemas.ts:1917` has `tier` /
      `trial_ends_at` unread), per-user multi-focus, history/report gates, trial-end email (A, ~1.5 d)
- [ ] Emails: welcome + trial-ending + receipt (only feedback/admin mail exists today) (A)
- [ ] Report is a Pro surface, so fix what a payer would see: M-017 raw tier id, M-018 "Target 0, stretch 1",
      M-019 hardcoded "graduated" (A)
- [ ] B-04 upgrade moments: trial day 12, program end (R-01 "next focus" as the Pro hook), history >30 d (A)
- [ ] SG-07 paid terms (renewal, EU 14-day withdrawal, VAT) + R-07 lawyer review incl. Art. 9 consent (A + lawyer, O)
- [ ] M-015: sign-up consent (three ticks + bot check before any tick; intake asks consent again): decide with
      the lawyer (O)
- [ ] End-to-end test: sign-up → trial → charge → cancel → downgrade, Stripe test mode (A)

## Stage 4: first paying user
- [ ] Owner flips Stripe to live (O)
- [ ] Read the first trial cohort: trial → paid, by campaign (A+O)
- [ ] L-11 a real beta quote with consent (O)

## Ads and marketing at scale (after M-06; runs alongside stages 3-4)
- [ ] Scale paid ads by the measured cost per sign-up; keep the ad sets that activate (O+A)
- [ ] M-07 Consent Mode v2 + consent banner, then Meta pixel / Google conversion tags (never health events);
      only when moving beyond UTM-only measurement, after the Art. 9 legal review (A)
- [ ] M-08 marketing channels, in order (`launch-readiness/marketing-channels.md`):
  - [ ] Comparison pages + cited guides (one per advertised program) (A)
  - [ ] One free calculator (2k split) (A)
  - [ ] Daily figure posts (the figure library is the asset; finish overhead-mobility figures first) (A+O)
  - [ ] Directories (O, ~1 h each)
  - [ ] Coach / newsletter outreach (O)
  - [ ] Paid niche placements and creators, sized by the measured cost per sign-up (O)
- [ ] Traffic basics: Search Console, structured data (sitemap/robots shipped) (A+O)
- [ ] L-10 named expert reviewer (O)

## Later (not on the path to the first payer)
- Engine (R-02): off-plan strength and external load into proposals; load softening on 7/9 programs (prescription
  call); UTC date sites (`utc-date-keys.test.ts` baseline); `starting_values_kg` gate; dead data keys
  (`retest_gate`, `shoulder_pain_stop_rule`, muscle-up tier keys, handstand orphan keys, `block_smolov_jr_squat`)
- P-08: move the hip-clinical triggers (`gait_change`, painful click, morning stiffness) out of the shared
  `deriveState`. Touches the safety gate, so the owner decides first
- Figures: 33 drills without a figure (overhead-mobility 8 first, muscle-up 17, engine 8); MediaPipe reference idea
- Design polish: remaining MASTER-LIST PARTIAL/LATER rows (`roadmap-reconcile/01`, `02`), A-UX-09 (fold
  Account/Settings into Profile, drop the gear), A-UX-19, M-027 one date format, M-028 programme→program
- Claude API: citation drift checker, data-copy lint, screenshot triage (`claude-api-ideas/00-summary.md`)
- Product: R-04 HYROX + Concept2, R-05 video coach / video-analysis (V0-5 phone gate), PANEL-P-30 WOD ingest
- Docs: R-06 README still says "Personal hip / lumbosacral tracker"
- Owner calls carried from `OPEN-TASKS.md`: Android background mid-set, overhead-mobility Push targets, pull-up
  Tier B ramp, muscle-up false grip, Resend second key (O-05), consent-first `setDaySymptoms`

## Closed by this reconcile (were still marked open somewhere)
All four MASTER-LIST blockers M-001..M-004; A-UX-09 tabs (partial: gear remains); A-UX-04 citations behind Why
(panel P-12); the launch-readiness hackathon and build sprint; redesign P0-P2 rescores (11edb06, 7fb23c6,
d92e032); plan-tab follow-ups (7979f19, 631ce62); OPEN-TASKS "bench press has nowhere to go" (`bench_press` and
off-plan exist); saas-launch Clerk/Paddle items (superseded by Supabase auth and Stripe).
