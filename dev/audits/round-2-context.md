# Round 2 audit — shared context for all persona agents

Every persona agent MUST read this before starting.

## The product

**Terav** — an adaptive strength / rehab / aerobic training tracker.
- Live app: https://program-f3r.pages.dev
- Marketing landing: https://program-v2.pages.dev
- Source tree: `/Users/margussellin/www/program`
  - `next-app/` — the actual product (Next.js 16, App Router, Cloudflare Pages)
  - `landing/` — marketing site
  - `data/` — legacy personal data (not in production)

## Why we're here

The first round of agents ran deep on 3 programs (Engine Builder / CSM / Rowing 2K) but missed:
- Copy quality across every page
- Empty vs filled states
- Sub-tab audit (Progress has Lifts / Hip / Insights)
- Visual density issues (some pages feel crowded)
- The Coach page as a first-time visitor
- Long-arc feel — 4-week sims don't catch fatigue in the UX

This round is broader coverage. Each of you takes a DIFFERENT persona, simulates several weeks
of use, and reports issues across every route.

## Brand voice

- Direct. No hype. No exclamation marks.
- "Every session sharpens the plan" — the core promise.
- Never claims to be a doctor. Always positions as supplement to clinical care.
- No pricing language yet ("Free during beta" was removed on purpose).
- Estonian copy exists on the landing but the switcher is hidden right now.

## Target audience

Primarily CrossFit / strength-training athletes who want programming that reads their data.
Second: rehab-adjacent lifters (like the founder).
The typical user:
- 25-45 yo
- 3-10 years training
- Knows what RPE means, may or may not know what LT2 / MLSS mean
- Uses a Garmin / Coros / Wahoo for cardio
- Has an Instagram, uses their phone in the gym

## Known feature flags / constraints

- `MULTI_MAIN_ENABLED = false` — one main track at a time
- Estonian language switcher hidden from UI (ET routes still exist)
- Coach LLM backend not deployed yet — page renders "coming soon" instead
- Anterior-hip-rebuild program is `personal: true` and hidden from public catalog
- Publishable Supabase key + KV binding on `program` project both fixed today

## Forbidden claims / edges to protect

- No medical diagnosis language ever ("this could be X" = no)
- No overreach on outcome claims ("guaranteed 5% VO2max gain" = no)
- Symptom checks are self-reports, not measurements
- The AI Coach warning stays visible until it ships

## Routes to cover — EVERY agent must touch each

Public (unauth):
- /sign-in
- /sign-up
- /reset-password
- /legal/privacy
- /legal/terms
- /legal/disclaimer

Authed:
- / (Today) — with active program AND without
- /week — all 4 corners: past week / current / future / far-future
- /extras
- /check — with hip regions AND generic regions
- /coach — "coming soon" state (unless coach configured, then chat)
- /progress — every sub-tab: Lifts, Hip (if hip user), Insights
- /report — full page + print preview
- /guide — every section
- /data — import / export / raw store view
- /profile — Data & privacy, Contraindications, Coach, Help, Legal
- /programs — catalog, all filters
- /programs/[slug] — for at least 2 programs
- /programs/[slug]/intake — the wizard

## How to simulate multi-week use

Two options — use whichever is more productive for your persona:

**Option A — run the harness:**
`next-app/tests/e2e/harness/simulator-v2.ts` exists. Review whether it supports your program.
If it does, run it in your worktree for the number of weeks your persona covers.

**Option B — code-level walkthrough with week-by-week narration:**
For each key session across your persona's arc (e.g. weeks 1, 3, 6, 8, 10), read the code that
would render that day and describe what the user would see. Watch for stale copy, wrong
categories, broken visualisations at low-log-count vs high-log-count states.

Ideal: do BOTH. The sim gives you data; the walkthrough catches UX gaps.

## Report format

Structured markdown. Cap at 2000 words. Sections:

1. **Persona recap** — 2 sentences on who you're being
2. **Blockers** — user cannot proceed. file:line references.
3. **Bugs** — wrong behavior. file:line references.
4. **UX gaps** — works but confusing / high-friction.
5. **Copy issues** — bad text, jargon, tone violations, empty-state emptiness.
6. **Visual / graph issues** — crowded layouts, broken charts at low N, contrast, tap targets.
7. **Sub-tab specific findings** — Progress sub-tabs get their own subsection here.
8. **Positive callouts** — genuine wins. Be honest.
9. **Priority fix list** — top 10 in ranked order.

Be **specific**. "Report page hip table overflows on iPhone SE" is useful.
"Report page is broken" is not.

## Sharing

Save your report to `dev/audits/round-2/persona-{N}-{name}.md` in your worktree, then return
the full report as your final message.
