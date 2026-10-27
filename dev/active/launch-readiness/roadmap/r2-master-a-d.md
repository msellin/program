# R2 — Master task list, Sections A-D: open items (2026-10-27)

Source: dev/audits/app/2026-08-19-master-task-list.md lines 1-210. Read-only check.
Result: only two `[~]` markers are open in A-D (both EVID-1). Everything else is `[x]`.

## [BLOCKS-ADS-TODAY]
- (none) — no open A-D item gates the three advertised programs.

## [BEFORE-SCALE]
- AUDIT-1 (doc:115, marked [x] but body has open work) — legal page names **Paddle** as payment processor at next-app/src/app/legal/privacy/page.tsx:121 and :135, while commit ca4d3e2 says billing is **Stripe**. Code check: OPEN (no Stripe string in next-app/src). Fix before paid tier; the processor list is a legal disclosure.
- AUDIT-1 (doc:154) — founder says data sits on EU Hetzner; page says Supabase Frankfurt (now eu-west-1 Ireland). Code check: no Hetzner string in next-app/src or landing/src. OPEN, founder decision — do not guess.
- AUDIT-1 (doc:156) — recurring re-read of legal pages against the shipped system. Code check: next-app/src/lib/legal-disclosure.test.ts exists (partly DONE-in-code). OPEN, recurring/human.

## [LATER]
- EVID-1 (doc:92, `[~]`, no @handle or date) — reviewer packets sendable. Code check: DONE-in-code (dev/audits/reviewer-packets/ has 4 packets, README, outreach-email.md). Send is founder's. Marker is stale: should be `[!] blocked: founder send`.
- EVID-1 (doc:109, `[~]`, duplicate ID) — outreach/specialist review. Code check: OPEN. Also listed open in dev/active/OPEN-TASKS.md:39. Any review flips ladder copy (guard at doc:109), so ads must not claim "reviewed".

## [STALE-drop]
- (none open). Stale text to fix in the doc: doc:13-23 counts say P2-32 is `[ ]`, but doc:207 marks it `[x]`.

## Doc hygiene (not open items)
- Duplicate ID EVID-1 at doc:92 and doc:109.
- AUDIT-1 is `[x]` while its body lists open work; either reopen or split the residual into a new ID.

Not checked: Section E onward (F-items, S3/S4/QA-1/BETA); whether legal-disclosure.test.ts pins Paddle or Stripe; landing/ privacy copy; whether the reviewer packets cover first-strict-pullup, handstand-walk, concurrent-strength-maintenance; whether the EVID-1 claims match the files in dev/active/program-audits-2026-09/tasks.md.
