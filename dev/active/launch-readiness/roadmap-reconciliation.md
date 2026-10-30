# Roadmap reconciliation (2026-10-27)

<!-- SUPERSEDED-BY: dev/active/ROADMAP.md -->
> **Not maintained since 2026-10-30.** The one task list is `dev/active/ROADMAP.md`. Every open item here was
> checked against the code (`dev/active/roadmap-reconcile/`) and the live ones moved there. Statuses below are history.


**Coverage:** a full pass this time, by 5 Haiku agents: `roadmap/r1` (OPEN-TASKS), `r2` (master list A–D), `r3`
(master list E–H), `r4` (saas-launch, traffic, README, NEXT, whitepaper roadmap) and `r5` (in-flight
workstreams). Code status was checked by grep, not by running tests.

**Bottom line:** the roadmap is mostly closed or stale. Six items matter for today and are folded into
`HANDOVER.md` §3. Everything else is before-scale or later.

## BLOCKS-ADS-TODAY (added to the sprint)
1. **Gates in the advertised programs that do nothing** (B12). Fix them, or drop the promise text, before advertising:
   - concurrent-strength-maintenance: the "resume at 3×4" half of its red state is missing (OPEN-TASKS:46).
   - handstand-walk: `retest_gate` / bail-out gates nothing (OPEN-TASKS:55).
2. **Withdrawn citations still in advertised programs** (B4): Sadowski in `handstand-walk.json` and `muscle-up.json`
   (CONTENT-1, master:359); `kilding_2012` at `citations.json:620`; Engine Builder copy promises a `block_3_polarise`
   that is "NOT SHIPPED".
3. **The privacy page names Paddle** (`legal/privacy/page.tsx:121,135`). Billing is now Stripe (B7).
4. **"Close beta: sign-ups off"** (OPEN-TASKS:138) contradicts the open beta. Resolved by O1 (turn sign-ups on);
   mark it superseded.
5. **Runtime env bindings** (OPEN-TASKS:708): covered by CI gate 4 (`check-runtime-bindings.sh`). Confirm the last
   deploy passed it.
6. **The old beta plan said "Engine Builder alone"** (saas-launch memory). Today's D2 advertises pull-up, handstand
   walk and strength + cardio instead, because the Engine Builder copy carries withdrawn numbers. D2 settles it.

## BEFORE-SCALE
- **Engine gaps a new user will hit:** off-plan strength and external load never reach proposals (OPEN-TASKS:20-21);
  load softening cannot fire on 7 of 9 programs (:51); 16 UTC date sites (`toISOString().slice(0,10)`, :49);
  handstand-walk orphan tier keys (:54); `starting_values_kg` wire or delete (:37).
- **Billing:** S3 (master:383) is 0% built. Provider: Stripe. Design in `free-tier-design.md`.
- **Analytics:** FLAG-5 / saas-launch tasks:130 is replaced by cookieless analytics today; a consent banner and tags
  come later.
- **Lawyer review of terms and privacy** (saas-launch tasks:39). The legal pages themselves say "before public launch".
- **QA-1 drift:** dropped citations still present (H-3 Ferrari in handstand-walk, R-3 Das in rowing).
- **Android mid-set eviction:** real-device proof (owner).
- **Harness personas:** any catalog change (hiding programs, "coming soon") needs a persona-harness review in the
  same commit (owner rule).

## LATER (PRO? = candidate for the paid tier)
- **PRO?** video form analysis; FIT/Garmin and wearable ingest; multi-program stacking; injury-profile extras; coach
  view; S4 correlation view; R12 Coach chat (rejected, revive only by a fresh decision).
- Not Pro: v2 multi-dimensional engine; referral credits; community; ET/FI language; native shells; digest/push.
- Content gaps: empty capability slots, pull-up Tier B ramp, muscle-up false grip, SELF_REPORT_TO_TEST_VAR,
  shoulder_pain_stop_rule, block_smolov_jr_squat, ProposalStack vs ProposalCard, undo.
- **Revoke the unused Resend key** (owner).

## Stale: drop or banner
- **Docs to rewrite or banner:**
  - `README.md` (describes the retired localStorage tracker) and `NEXT.md`.
  - `saas-launch/plan.md` (Clerk, KV, PostHog, Paddle; no supersession banner), `tasks.md`, `architecture-v2.md`.
  - `traffic/traffic-plan.md` (assumes no promotion).
- **Items:** Clerk allowlist / invite mechanism; Paddle; V0-7, V5-4; T21 data-driven amber rule (CLAUDE.md rules it
  out); daily-plan.ts (already gone).
- **Workstreams finished or stale** (r5): founder-bugs-2026-10-01, personal-cue-separation, program-audits-2026-09,
  postgres-migration.
- **Paused:** exercise-media, video-analysis.
- **Live, and overlaps B1:** follow-along (it edited `programs/anterior-hip-rebuild.json`).
