# 02 — Internal ops, content and quality (no user health data)

Grounding: 125 citations in `citations.json` (112 KB), 9 programs + shared `exercises.json` (158 KB), landing
dictionary `landing/src/i18n/dictionaries/en.ts` (EN only today), `functions/api/feedback.ts` (Resend mail to founder,
context = route/programme/version, no store), `dev/scripts/run-app-audit.sh` (6 Sonnet-agent audits by hand),
persona/launch screenshots in `dev/active/launch-readiness/screens/`. Nothing below sends user data. Costs at 100 users.

1. **Nightly citation drift checker** (internal). GitHub Action fetches each citation URL/DOI/PMID (code, not LLM),
   Haiku Batch compares abstract vs `used_for`, emits SUPPORTS/OVERSTATED/NOT_FOUND as a PR/issue. Complements
   `evidence-verifier`; never edits data. Sends: public abstracts. ~$1/mo (125 x ~3K tokens, weekly full, nightly diff).
   Risk: false confidence; Haiku flags, a human or Sonnet adjudicates OVERSTATED. Value 8.

2. **Shared-library copy lint** (internal). Per PR touching `public/data/`, Haiku reads changed exercise/program copy and
   flags personal language, named side/diagnosis, medical-advice phrasing, jargon, tone drift. Extends
   `data-integrity.test.ts` regexes with semantic cases regexes miss. Sends: shipped public JSON. ~$1/mo. Risk: noisy
   flags; report-only, non-blocking first. Value 8.

3. **ET/FI translation drafts + back-translation check** (user-facing copy, no user data). Haiku Batch translates
   landing dictionary and in-app microcopy; second pass back-translates to EN and diffs meaning (esp. "not medical
   advice", consent, symptom wording). Human native review before ship. Sends: static strings. ~$2 one-off, <$1/mo
   upkeep. Risk: safety/legal wording; legal pages stay human-translated. Value 7 (depends on market decision).

4. **Persona-screenshot reviewer** (internal). Haiku vision on persona-harness and launch-readiness captures with a
   checklist per screen (overflow, clipped text, contrast, wrong program leaking, empty-state copy, PII-looking
   strings in seeded data). Replaces the cheap half of the six Sonnet `app-*` agents; Sonnet stays for judgement.
   Sends: screenshots of test personas only (verify seeds, never real accounts). ~$3/mo (~200 imgs x ~1.5K tokens x
   weekly + per PR). Risk: vision misses subtle layout bugs; use as triage, not gate. Value 7.

5. **Feedback triage in the Resend flow** (internal, with a caveat). Feedback mail body is free text and can contain
   health detail. Haiku would tag (bug/proposal-nonsense/feature/praise), dedupe, and draft a founder digest.
   Needs privacy-page line + DPA before enabling, and a "don't paste symptoms" hint in the form. Sends: user message
   text. ~$0.50/mo. Risk: Art. 9 leakage; tag-only, never auto-reply. Value 5 until the legal basis exists.

6. **Landing/ad copy variants** (internal). Haiku generates 10 headline/CTA variants per audience from `en.ts`
   positioning (focused-improvement, not full plan) plus a checker rejecting claims the app does not deliver
   (feeds `app-landing-alignment`). Sends: public copy. <$1/mo. Risk: overpromise; every variant must pass the
   claim checker and `verify-shipped-claims.py`. Value 5.

7. **Audit-agent offload**. Move mechanical audit tasks (heading hierarchy, contrast tables, empty-state inventory) to
   scripted Haiku batch jobs in `run-app-audit.sh`, nightly in Actions; Sonnet only for the weekly synthesis. Cuts
   founder hand-run sessions. ~$5/mo. Risk: audit theatre; follows "no UI churn between audits" memory. Value 6.

8. **Master-task-list hygiene** (internal). Haiku checks `2026-08-19-master-task-list.md` markers against git log and
   flags stale in-progress items. Overlaps `task-index.py`. <$0.50/mo. Value 3.

Total if 1-4 and 7 ship: about $10-12/mo, a tenth of the budget.

Top 3: (1) Nightly citation drift checker, 8. (2) Shared-library copy lint on PRs, 8. (3) Persona-screenshot reviewer, 7.
