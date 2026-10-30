# Roadmap reconcile: verifier brief (2026-10-30)

Goal: one roadmap to Terav's FIRST PAYING USER. Many task lists have stale status marks. Your job: for each
item assigned to you, establish its real status in the CURRENT code on main (repo /Users/margussellin/www/program,
app code in next-app/src, data in next-app/public/data, landing in landing/src).

Rules
- Read-only except your one output file. Do not edit code, do not commit, do not run e2e or deploys.
- Evidence = a file:line you read, or a commit (git log --oneline -S / --grep / -- <path>). Never infer from a title.
- Screenshots in the lists may be stale; judge against code, not the capture.
- Privacy: never read .env, never touch Supabase.

Verdicts: DONE (fixed, evidence) · PARTIAL (say what's left) · OPEN (still true, evidence) · SUPERSEDED (the screen/
feature it refers to no longer exists or a later decision replaced it) · OWNER (needs the owner, not code) · UNKNOWN
(could not establish in ~3 min; say why).

Relevance to first paying user: ADS = hurts a stranger from an ad (sign-up → intake → day 1 → first week) ·
PAY = needed to take money (billing, terms, tiers, upgrade path) · TRUST = safety/privacy/claims a payer would see ·
LATER = not on the path.

Output: a markdown table `| ID | Verdict | Relevance | Evidence (file:line or commit) | Note ≤15 words |`, one row
per item, then ≤10 lines of summary (counts, anything surprising). Nothing else.
