# Founder review notes / questions for agents

Founder's own observations while testing on `test@terav.fit`. Filed here so any future auditor agent can address these questions alongside their own findings. **Most don't need immediate action** — they're prompts for agents to reason about, not tickets.

## Q1 · Programs picker density (LIST view) — /programs

Being addressed now by product-design-lead. Brief will land at `dev/design-briefs/2026-08-17-programs-picker-density.md`.

Founder observation: card layout may show too much per-program metadata for list view. Other apps use single-word tiles ("HSPU", "Handstand Walk"). Terav's honesty principle argues for showing dose upfront. What's the right shape?

## Q2 · Program PREVIEW page — "Program shape (peek inside)" phases display — /programs/[slug]

**Route:** `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx` (or wherever this section renders — grep "Program shape" or "peek inside").

**Founder observation (2026-08-17, viewing Handstand Walk):**

The "Phases" section shows phase entries with dates like `2026-01-05 → 2026-01-18` and text `Weeks 1-2 — Wrist prep + Kinoshita...`. The confusion:
1. Dates read as if the user is committing to a fixed calendar; but multi-tier programs generate a schedule *from* the user's intake, not fixed dates
2. Multiple phases have the SAME start date `2026-01-05`, suggesting they run in parallel
3. Actually only ONE phase applies per user tier (A vs. B vs. C vs. D) — the parallel visual is misleading

Verbatim founder quote:
> "the dates here don't help, they confuse. at first sight it seems like i have multiple tracks running through weeks 1 to 2, like all these at the same time"

**Question for a future agent:**

*"For multi-dimensional programs (Handstand Walk, First Strict Pull-Up in-build, Muscle-Up in-build), how should the /programs/[slug] preview page communicate PHASE STRUCTURE without misleading the user into thinking they'll run all phases simultaneously? Options include: (a) show only the CURRENTLY-RELEVANT tier's phase once user has taken intake; (b) always show phase-per-tier grouping instead of phase-per-week grouping; (c) collapse to a single "how the schedule adapts" explainer sentence without dates on the preview page; (d) other pattern from Runna, TrainerRoad, Ladder that we should steal."*

**Cross-references:** the multi-dimensional generator lives in the engine at `next-app/src/lib/engine/plan-generator.ts`. Each program's phases are declared in the program JSON. Cross-reference to `dev/whitepapers/04_handstand_walk.md` for the intended tier-based execution model.

**Priority:** medium. Doesn't block beta but does confuse first-time preview viewers on multi-tier programs.

## How to add more Qs

Just append a new `## Q{N} · {short title}` section below. Each new question should have: route, observation, verbatim quote if useful, question for agent, cross-references, priority.
