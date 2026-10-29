# Brainstorm: where Claude API credit could make Terav better (2026-10-29)

**Budget:** about **$100 / month** of Claude API credit, starting now. Mostly **Claude Haiku 5.5**
(`claude-haiku-5-5`): **$0.10 per 1M input tokens, $0.50 per 1M output** (prompts ≤100K tokens). For comparison
Claude Sonnet 5.5 (`claude-sonnet-5-5`) is $2 / $10. Batch API halves the price (async, not latency-sensitive);
prompt-cache reads cost ~0.1× input. Rough scale: $100 of Haiku ≈ 1B input tokens or 200M output tokens a month.
For a beta with tens to low hundreds of users, money is not the constraint; **trust, privacy and correctness are**.

**The app:** Terav (`CLAUDE.md` at repo root; app in `next-app/`, Next.js static export on Cloudflare Pages,
server code only in `next-app/functions/`, Supabase auth + per-user JSON state). A focused-improvement training app:
one focus (a lift, a skill, an engine, a joint), runs alongside the user's week. Not a full plan.

**Non-negotiables (any idea that breaks one is out):**
- Confirm-first: the engine proposes, the user accepts. AI never silently changes loads, plans or gates.
- Every suggested change cites a study (`citations.json`) or names its log signal. No free-text claims the data
  can't back. The founder-feedback panel (`dev/active/founder-feedback-2026-10-29/`) rejected LLM-written session
  insights for v1 for exactly this reason; templates fill numbers from code.
- Safety: `lib/symptom-state.ts` and the red/amber/green gate are never LLM-decided. Not medical advice.
- Health data is GDPR Art. 9 special-category data: sending a user's log or symptom notes to a third-party API
  needs a legal basis, consent wording, a DPA and a privacy-page line. Ideas that use no user data are cheaper to ship.
- Focused, not full-plan: no "AI coach that writes your whole week".

**Your job:** read enough of the repo to ground ideas in what exists (programs JSON, exercises.json, citations.json,
the morning check's free-text note + keyword parser, feedback endpoint, intake, Record/report, persona harness,
audit agents in `dev/`). Propose concrete uses. For each: what it does, user-facing or internal, which data it
sends, model + rough monthly cost at 100 active users, the risk, and a 1–10 value score (10 = best).

Write `dev/active/claude-api-ideas/<NN>-<lens>.md`, at most 40 lines. End with your top 3. Reply with the top 3
only. Don't edit code. Don't call the API.
