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

## Q4 · Intake questionnaire visual craft — feels like reading a book

**Surfaced by:** founder, 2026-08-17, viewing `/programs/handstand-walk/intake`.

**Founder observation (verbatim):**
> "Questions look OK, but the UI looks like reading a book without any pics. Bit dull. Maybe my subjective opinion but something I would like some UI/UX agents to review."

**Route:** `next-app/src/app/programs/[slug]/intake/page.tsx`

**Screenshots referenced:** `~/Desktop/Screenshot 2026-08-18 at 00.00.{08,14,20}.png` — full-scroll view of Handstand Walk intake (screening + skill self-report + About you + consent + submit).

**Action:** product-design-lead dispatched 2026-08-17 to produce a design call. Brief will land at `dev/design-briefs/2026-08-17-intake-visual-craft.md` covering answer-chip hierarchy, section anchoring, progress motivation, rationale-paragraph disclosure, and whether CSS-only geometric illustrations are worth adding.

**Priority:** medium. Intake is the highest-stakes conversion moment in the funnel — every fresh user hits it. Worth polishing before wider beta but not blocking.

## Q3 · PROVISIONAL status — what does it mean, when does it graduate?

**Surfaced by:** founder, 2026-08-17. Every catalog program shows the `PROVISIONAL` chip. The legend reads *"beta, evidence and prescription drafted but not clinically reviewed."*

**Two problems:**
1. "Clinically reviewed" is the wrong bar. Terav's positioning is explicitly *not a clinical device* — landing origin body says work with a clinician if you have a medical issue. Waiting for clinician sign-off is a category error.
2. There's no defined graduation path. Every program stays PROVISIONAL forever unless we invent a target state.

**Proposed governance model (founder to confirm):**

| Status | Meaning | Cost per program |
|---|---|---|
| **Referenced** (default) | All citations verified against source papers; simulator harness produces expected outcome curves across archetypes | ~2h founder review |
| **Reviewed** | A domain-specialist agent audited: cited studies match claims, drill sequencing matches literature, phase gates evidence-backed, retest metrics defensible | ~1h agent per domain per program |
| **Verified** | ≥5 beta users completed the arc with subjective success | Real elapsed time |

**Retire the phrase "clinically reviewed" from copy.**

**Specialist agents for the middle bar (Reviewed):**
- **Motor-learning specialist** — audits skill programs (Handstand Walk, First Pull-Up, Muscle-Up, HSPU, other gymnastics)
- **Aerobic-physiology specialist** — audits engine programs (Engine Builder Block 1 + 2, Rowing 2K)
- **Concurrent-training specialist** — audits CSM
- **Rehab / hip-flexor specialist** — audits anterior-hip-rebuild (personal-only but worth flagging any citation drift)

Each agent's job: read the whitepaper for that domain (`dev/whitepapers/`) + the program JSON + cite each claim; flag any citation that doesn't say what the program claims. Deliverable: per-program review doc: pass / conditional-pass / fail-with-fixes.

**Priority:** medium. Not blocking beta, but the "PROVISIONAL forever" state undermines the honesty positioning long-term. Should decide the graduation policy before shipping the next 3 in-build programs.

**Blocked-by:** founder decision on graduation model + copy rewrite for the `/programs` page legend.

## How to add more Qs

Just append a new `## Q{N} · {short title}` section below. Each new question should have: route, observation, verbatim quote if useful, question for agent, cross-references, priority.
