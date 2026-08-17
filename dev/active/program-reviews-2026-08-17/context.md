# Program review — shared context (2026-08-17)

Four specialist agents run in parallel. Each takes ONE domain and reviews the shipping programs in that domain against the whitepaper literature + canonical citations.

Goal: promote programs from `REFERENCED` (default, citation-verified) → `REVIEWED` (domain-specialist audited) — per the B1 governance model at `dev/active/session-audit-2026-08-17/founder-questions.md#q3`.

## What "REVIEWED" means (the bar you're checking against)

To pass and be marked REVIEWED, a program must satisfy ALL of these:

1. **Every citation resolves to a real paper.** No fabricated references, no missing DOIs where they should exist, no wrong journals.
2. **Every claim the program makes about a study accurately reflects what the study actually says.** No over-claim, no cherry-pick, no misdirection. If the program says "Rhea 2003 showed +2.5 kg bumps optimize dose response," the paper must actually support that claim.
3. **Drill sequencing / phase structure is evidence-backed** where the program implies it is. Where it's engineering choice (session length, exact rest interval), the program must be honest about that — `engineering_choices_flagged` must not silently claim engineering as evidence-based.
4. **Retest metrics have literature support.** The test the program uses to measure progress must actually predict what the program is claiming to develop.

## Read these first

**For every agent:**
- `dev/active/session-audit-2026-08-17/founder-questions.md` (Q3 explains the governance model + WHY reviewed)
- `dev/active/product-concerns-2026-08-17/roadmap.md` (positioning + brand honesty commitments)
- `next-app/public/data/citations.json` — the canonical citation library. Every `reference_ids` array in a program JSON resolves against this.

**Your domain-specific:**
- The whitepaper(s) for your domain at `dev/whitepapers/*.md`
- The program JSON(s) you're reviewing at `next-app/public/data/programs/*.json`

## Output format

**One file per program** at `dev/audits/program-reviews/{program-slug}.md`. Under 2000 words per file.

Required structure:

1. **Verdict** — one sentence: PASS (bump to REVIEWED) / CONDITIONAL (specific fixes needed, then re-review) / FAIL (fundamental issues).
2. **Program scope reviewed** — briefly restate what the program claims to do.
3. **Citation-by-citation audit table.** For each citation the program uses:
   - Citation ID from citations.json
   - The paper's actual claim
   - The program's claim
   - Match / drift / broken? (drift = "close but overstated"; broken = "actually says the opposite")
4. **Phase / block structure check** — is the sequencing evidence-backed?
5. **Retest metric check** — does the test predict what it's measuring?
6. **Engineering choices** — anything the program treats as engineering that's actually a citation gap, or vice versa?
7. **Fixes required before REVIEWED status** — specific, actionable. If PASS, this section says "none."
8. **What you did NOT check** — explicit unknowns.

## Constraints

- **You are NOT rewriting the program.** Fixes go into the "Fixes required" list; founder implements.
- **You are NOT changing citations.json.** New/corrected citations get flagged for founder review.
- **Cite the paper's ACTUAL findings** when flagging drift. E.g., not just "the program overstates Rhea 2003" but "Rhea 2003 concluded X; the program says Y; the difference is Z."
- **WebFetch is fine** if you need to verify a specific paper's abstract quickly. PubMed IDs in citations.json make this easy.

## Warnings

- `next-app/AGENTS.md` and `landing/AGENTS.md` have auto-regenerated "This is NOT the Next.js you know" blocks. Ignore.
- Do not include PII. Clinical context data in `data/clinical-context.json` is the founder's own; still don't paste symptom scores or provider notes into the review — reference the file if needed.

## Push-back is welcome

If you find a citation gap that means the program's claim is genuinely wrong (not just soft), say so and mark FAIL. Better a surprising "the app is over-claiming this rehab benefit" than a validating "all good, ship it." The founder wants an honest bar.
