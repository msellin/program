# HANDOVER: launch-readiness → launch sprint (2026-10-27)

For the session that runs the build sprint (new account). Read in this order:
1. This file.
2. `launch-plan.md`: what to build, in order, the cut line, and the owner decisions (section D). **Get the D
   answers from the owner before B3, B5 and B11.**
3. Repo `CLAUDE.md`. Non-negotiables: run `cd next-app && npm run verify` before every commit; the pre-commit
   hook (`git config core.hooksPath .githooks`); push to main, and CI deploys both Pages projects; clinical data
   stays de-identified; the shared `exercises.json` stays general; nothing is medical advice.
4. Detail only when an item needs it: `findings-compliance.md` (safe ad wording, privacy fixes),
   `findings-money-tech.md` (sign-up and measurement path), `findings-product.md` (hero, catalog, file:line list).

## State at handover
- **Audit:** read-only, finished. No product code was changed in this phase.
- **Committed and pushed to main:** brief, plan, context, tasks, `market/` (26 notes), `audit/` (18 notes),
  `screens/` (14 live shots), and the findings and plan files.
- **Confirmed live:** `app.terav.fit/data/{clinical-context,open-questions,log,program}.json` and
  `programs/anterior-hip-rebuild.json` return 200 publicly. That is the owner's own clinical record, so do B1 first.
- **Not checked by anyone:** Supabase dashboard (sign-up toggle, SMTP, captcha), Cloudflare Analytics toggle, ad
  accounts, and whether Meta classes Terav as health and wellness.
- **Weak spots:** the Haiku audits make mistakes. The Sonnet findings say what they re-checked (section 5 of
  each). Fix only what you have verified.

## How the owner works (keep it)
- Owner-only steps: dashboards, provider sign-ups, ad spend, approvals, sending messages.
- Use cheap models: Haiku for sweeps and search, Sonnet for judgement, no Opus agents unless asked. All outputs go
  in the repo under `dev/active/<task>/`.
- Anything public (ads, landing copy, pricing page) goes through a review panel of at least 3 lenses on Sonnet.
  State the token cost first. Today's lean variant is decision D8.
- Owner ideas are hypotheses: research them, give a verdict, then ask.
- Agent briefs name the files, the question, the done condition and an output cap.

## Known tool quirk
Sonnet general-purpose subagents in this run had their file writes refused ("subagents return findings as
text"). Haiku agents could write. Plan for the orchestrator saving Sonnet output itself.
