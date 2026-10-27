# H16 roadmap audit (2026-10-27, read-only)

## (1) Open items that matter for ads
- [BLOCKS-ADS-TODAY] Beta vs public signup is undecided. saas-launch/tasks.md:14 and :131 still say "invite mechanism" (Clerk allowlist, now unbuilt). legal/terms/page.tsx:27 says "closed beta, free of charge". Paid ads open public signup.
- [BLOCKS-ADS-TODAY] Ad copy must not promise price or trial. €9.99/€89 and 14-day trial are unbuilt: saas-launch/context.md:18; master-task-list S3 (Paddle 0% done, line 383).
- [BLOCKS-ADS-TODAY] Withdraw kilding_2012 claim. Still at next-app/public/data/citations.json:620; OPEN-TASKS.md "Yours" table (P2).
- [BLOCKS-ADS-TODAY] Traffic citation hold. See (4). Any ad that links the evidence page inherits the open citation defects.
- [BEFORE-SCALE] Lawyer review of TOS and privacy. saas-launch/tasks.md:39; legal pages say "lawyer-reviewed before public launch". Paid acquisition likely counts as public launch: owner call.
- [BEFORE-SCALE] Off-plan strength and external load P1s. OPEN-TASKS.md "Mine" (2026-09-09): a new user's barbell work and runs are invisible to the engine.
- [BEFORE-SCALE] Load softening fires on 7 of 9 programmes. OPEN-TASKS.md "Found but not triaged" (select.ts nextLoadedDay).
- [BEFORE-SCALE] 13 UTC date display sites, incl. IntakeClient start date. Same table, "LIVE BUG CLASS".
- [LATER] Android background-mid-set real-device proof. OPEN-TASKS.md "Yours" P1; matters only if Android installs are the ad target.

## (2) Docs contradicting the code now
- saas-launch/plan.md: no supersession banner; still specifies Clerk (:119), KV (:129), PostHog (:148), Clerk allowlist (:245). context.md has the banner; plan.md does not.
- saas-launch/tasks.md:131: "Clerk allowlist mode" in Phase 4. Supabase is live (context.md:12).
- README.md:32: "Logs live in localStorage ... Nothing leaves the browser." Pre-app single-file tracker; app syncs to Supabase.
- NEXT.md:23 (export via localStorage) and :36 (sync backend "only if needed") predate the Supabase migration.
- traffic/traffic-plan.md:49-52: "~25 overstatements, ~13 unfindable" frozen at 2026-09-06; no closure record.

## (3) Decisions to reuse, not re-decide
- Positioning: focused-improvement, one focus, runs alongside the week (saas-launch/context.md:37; memory).
- Price and trial: €9.99/mo, €89/yr, 14-day card trial (saas-launch/plan.md:108,115). Reuse the numbers; billing still unbuilt.
- Free tier: one active programme, enforced by MULTI_MAIN_ENABLED (schemas.ts:1875), not the inert tier field.
- Provider: Supabase Auth and Postgres, Cloudflare Pages, Resend, Sentry (shipped). Paddle is the intended billing provider with no comparison done.
- Evidence labels: VERIFIED is derived from citation verification; all programmes are CITED (OPEN-TASKS.md:986). Ads must not say VERIFIED.
- Beta cohort: "10 gym members" (saas-launch/plan.md:237). Mechanism still undecided; do not treat as settled.

## (4) Traffic hold: still open
Yes. Commits 0d5de05 (44 overstatements fixed) and cad0b3f/f9a3fd8 (phantom and search-box links) landed 2026-09-06/07. But batch5 still lists NOT_FOUND verdicts (robertson_2004, salmoni_schmidt_walter_1984), the catalog has 0 VERIFIED and 9 CITED (programs-catalog.ts), and OPEN-TASKS.md:23 still says P4 is blocked. No doc marks the hold closed.

Not checked: full OPEN-TASKS.md (grep only) and master list (grep only); per-citation status of the ~13 unfindable items; landing copy beyond pricing and badge greps; no tests or npm verify run; no git blame on doc dates.
