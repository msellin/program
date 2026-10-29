# 03 - Risk, privacy and architecture critic (2026-10-29)

## 1. Where Terav must NOT use an LLM
- **Safety gate** (`lib/symptom-state.ts`, red/amber/green, "don't train today"): never. Must stay deterministic, auditable, testable.
- **Load/TM/progression decisions and proposals**: never decided or worded by a model; Accept/Ignore stays on engine output with study or log-signal citation.
- **Anything that reads as a health claim** (diagnosis, "this sounds like X", red-flag triage, sacroiliitis-type escalation): never. Free-text claims can't cite `citations.json`.
- **Free-form chat on symptoms**: out. Invites medical-advice use; user in pain gets a confident wrong answer.
- **Citation checking**: not LLM-final (evidence-verifier already needs retrieval + human).

## 2. If it calls Claude: architecture
- New `next-app/functions/api/ai-*.ts` (Pages Function). Key = `ANTHROPIC_API_KEY` runtime binding (never `NEXT_PUBLIC_`). `check-runtime-bindings.sh` derives the list from `env.*`, so it is covered automatically; add to the CLAUDE.md runtime list and `runtime-env.test.ts`. Preview env has no bindings: fine (main-only).
- Auth like `feedback.ts`: verify Supabase JWT, uid from token not body. Server builds the prompt from a fixed template; client sends only an allow-listed field set, never raw store.
- **Consent gate server-side**: refuse unless a separate `ai_processing` consent timestamp exists in the profile (not bundled with symptom consent). Default off.
- Rate limit per user (e.g. 20/day) + global monthly cap, counters in Supabase (or KV). Hard stop at ~$80, alert at $50; also set the Anthropic console workspace spend limit as the backstop.
- Logging: ids, model, token counts, latency, status only. No prompt/response text in logs, Sentry or Resend. Sentry scrubber must cover the function.
- **Injection**: notes are untrusted data. Put in a delimited block, tell the model it is data; output = strict JSON schema (enum fields, max lengths), validated by Zod; model has no tools, no URLs, no write access. Output can only *suggest* a value the user then confirms; never feeds the gate.
- Failure: 8s timeout, one retry, then silently fall back to the existing keyword parser / template. Feature must be optional; app works with the API down or key missing.
- Anthropic side: check zero-data-retention/no-training terms for API; sign DPA, add SCCs (US processor).

## 3. Privacy page, consent, DPA
- Add Anthropic to "Where it lives" and sub-processor list; add to International transfers (US, SCCs). Add table row: what is sent, retention at Anthropic (none/30d per terms), not used for training.
- Lawful basis section: separate Art. 9(2)(a) explicit consent for AI processing; withdrawable toggle in settings; withdrawal stops sending, no feature loss besides the AI one.
- Sign-up currently has one `consentSymptom` checkbox and consent timestamps; do NOT reuse it. New in-context opt-in with timestamp.
- Controller is a natural person: DPA with Anthropic, update records of processing; DPIA-lite note (Art. 35, health data at scale is borderline) before launch. Policy already says "lawyer-reviewed before public launch": do it with this change.
- Policy today claims error reports are scrubbed of health content; keep the same promise for AI logs.

## Idea risk scores (1 = safe, 10 = dangerous) and value (1-10)
| Idea | Data sent | Risk | Value | Verdict |
|---|---|---|---|---|
| Internal content QA (JSON lint, cue/copy review, personal-language leak in exercises.json) | none (repo content) | 1 | 6 | Ship first, no user data, run in CI/laptop |
| Exercise Q&A grounded in exercises.json/program text | question only, no log | 3 | 4 | OK if retrieval-only, refuse medical, no user context |
| Morning-note parsing -> suggested region tags | note text = Art. 9 | 6 | 5 | Only with AI consent; suggestions only; keyword parser stays and is fallback |
| Session summaries | log + notes | 7 | 3 | Panel already rejected; templates cover it |
| Specialist report draft (Record/report) | whole history = Art. 9 | 8 | 6 | Highest value but highest risk; user-triggered, per-use consent screen, preview before send, "not medical advice" and no interpretation, v2 |

## Top 3
1. Internal content QA/linting with Haiku (batch API) - zero user data, catches personal-language and unresolved-copy defects.
2. Consent-gated morning-note tag suggestion behind the deterministic parser - only if the full architecture above lands first.
3. Specialist report draft as explicit opt-in per-use v2, restating the user's own logged facts, never interpreting.
