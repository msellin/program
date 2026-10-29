# Claude API credit (~$100/month): panel summary (2026-10-29)

Three Sonnet lenses (`01-in-app`, `02-ops`, `03-risk`) on `BRIEF.md`. Haiku 5.5 is $0.10 / $0.50 per 1M tokens, so
money is not the limit; trust, privacy (GDPR Art. 9 health data) and correctness are.

## Agreed: build first (no user data leaves; ~$5–12/month together)
1. **Citation drift checker** (ops 8/10, risk low). Code fetches each cited work's abstract; Haiku via the Batch API
   grades it against the `used_for` claim; report-only, weekly from GitHub Actions. Complements `evidence-verifier`.
2. **Copy lint on changes to `public/data/`** (ops 8, risk 1). Haiku flags personal clinical language in the shared
   library, medical-advice phrasing and jargon that the `data-integrity.test.ts` regexes miss. Advisory in CI.
3. **Screenshot triage** (ops 7). Haiku vision over persona / launch-gaps captures: truncation, overlap, empty
   states, flagged for a human or a Sonnet lens. Cheap first pass, not a replacement for the scored rescores.

## Later, only with a legal basis (separate AI consent, DPA, privacy-page line naming Anthropic as sub-processor)
4. **Morning-note tag suggestion** (in-app 6, risk top-3). The model picks from the existing signal list; the user
   taps to confirm; the keyword parser stays as fallback; the safety gate never reads model output. Worth it mainly
   for Estonian, slang and typos. Build only if logs show real notes the parser misses. Offline first step with
   zero user data: Haiku proposes parser additions from the counts-only unmatched-token list (in-app idea 3).
5. **Specialist report draft** (risk 8): per-use opt-in, preview, no interpretation. v2 at the earliest.

## Split vote
- **Exercise Q&A grounded only in the app's cues and citations:** in-app 6, risk "low value". Park.

## Rejected by all three
LLM session insights (the founder-feedback panel already chose templates), anything that changes load or plan
without Accept, the red/amber/green gate, free-form symptom chat, AI "coach that writes your week", nutrition.

## Architecture, when anything calls Claude at runtime (03-risk)
A Pages Function in `next-app/functions/` with `ANTHROPIC_API_KEY` as a runtime binding (gate 4 derives it
automatically), JWT check, per-user and monthly caps, logs without health text, strict JSON output validated with
Zod, no tools. Internal jobs (1–3) run from Actions with a repo secret and never touch the app.
