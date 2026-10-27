# R3: master task list E / F / H reconciliation (2026-10-27)
Source: dev/audits/app/2026-08-19-master-task-list.md. "Open" = `- [ ]` only.

## E (Features on-deck): no open items
- F8-F12 all [x]. Nothing to tag.

## F (Strategic): open items
- CONTENT-1 (master:359) user-facing content defects. Code: engine-builder.json:12 `block_3_polarise` "NOT SHIPPED" yet promised in copy; Sadowski present in muscle-up.json and handstand-walk.json. Tag [BLOCKS-ADS-TODAY] for the Block 3 promise and rowing pacing/taper copy (ads send people to the public catalog); rest [BEFORE-SCALE]. No founder decision needed.
- S3 (master:383) SaaS billing/Paddle. Code: 0% built; no checkout or webhook in next-app/functions/api (only admin, delete-account, feedback). DECIDED ELSEWHERE: provider is Stripe (launch-plan.md:30, :57, :80, 2026-10-27); Paddle superseded (findings-money-tech.md:39). STILL OPEN: free beta now vs paid trial from day one (launch-plan.md:80). Tag [BEFORE-SCALE]; becomes [BLOCKS-ADS-TODAY] if a paid trial is chosen.
- S3 tiers: free vs Pro line is not decided or built. plan.md:83 lists it as open. Pro-tier candidate features below.
- S4 (master:413) F5 correlation view gate. Code: no dedicated correlation view found (only data-readiness.ts mentions it). Decision still open (N users x 90 days trigger vs defer). Tag [LATER]. PRO?
- QA-1 (master:418) shipping-log drift protocol. Code: H-3 Ferrari still in handstand-walk.json (2 hits) and R-3 Das still in rowing-2k-test-prep.json (2 hits), so the drops never executed. Tag [BEFORE-SCALE] (protocol). Citation drops are [BLOCKS-ADS-TODAY] only if those programs are advertised.

## H (carried forward): open items
- H1 (master:429) simulator never seeds baselines. Code: capabilitySeed writer in next-app/tests/e2e/harness/simulator-v2.ts; no persona defines it. Tag [LATER]. Test-only, not Pro.

## G (Rejected): do NOT resurrect
- R1 photography; R2 second accent; R3 H1 over 32px; R4 softer mono; R5 streak/gamification; R6 fill Coach empty state; R7 drag-to-reschedule; R8 Whoop score-hero; R9 one-arc-per-day; R10 video analysis as paid pillar; R11 cross-user aggregation before N>1000.
- R12 Coach chat: shelved; its own text says restore when the paid base can amortise per-turn LLM cost. PRO? (only via a fresh decision).

Not checked: whether Sadowski is actually forbidden in code (only presence grepped); S4 F5 view not fully searched; Stripe-matching src hits not confirmed as billing; persona coverage beyond grep; no tests run; no items added to master after 2026-08-19 checked.
