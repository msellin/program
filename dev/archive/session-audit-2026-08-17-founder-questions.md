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

## Q5 · Video demos for physical test movements — beyond pictograms

**Surfaced by:** founder, 2026-08-17, viewing Physical tests block on Handstand Walk intake.

**Founder observation:** the physical test descriptions ("Kneel with palms flat, fingertips pointing toward knees. Slowly rock weight forward…") would benefit from actual video demos, not just text.

**Q4 brief's recommendation:** CSS-only 56×40 pictogram tiles per movement question. That ships in the 6-8h intake polish. Real videos are a separate feature scope.

**Real-video roadmap (when we go beyond pictograms):**
1. Dispatch the F-brief research (`dev/audits/product-concerns/F-video-demo-library.md`) to answer: build vs. embed vs. license, hosting costs, WCAG captions, storage overhead
2. Once F-brief lands, extend `intakeQuestionSchema.option` and `physicalTestSchema` with an optional `demo_video_url` field (same shape both places)
3. Author videos per program (~1-2 days per program if founder shoots on iPhone)
4. Ship behind a feature flag; test with beta before default-on

**Priority:** medium. Pictograms are the beta-appropriate first step (6-8h). Real videos are a beta-plus feature (~3-4 days once F-brief lands and hosting decided).

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

## Q6 · Fear of falling / bail-out drills as pre-requisite to handstand walk

**Surfaced by:** founder, 2026-08-18. Personal lived experience + friend
report the same day.

**Verbatim founder quote:**
> "one thing i had myself when started to learn handstand walk and what one of
> my friends told me today..is that she is afraid...to fall. and so was I...and
> i took one lesson from coach where 1.5 hours i just learned on how to fall or
> how to either oll or wolfbike or get out of the position when started to
> fall...to lose the fear."

**Observation:** the Handstand Walk intake asks about wrist pain, shoulder
pain, self-reported wall/freestand seconds, walk distance. It never asks
"can you exit an over-tipped handstand safely?" — arguably the highest-signal
question of the set. For self-taught users the *fear* of falling gates
progress more than physical capacity does.

**Literature (short list):**
- Adkin, Frank et al. (2000, 2002) — postural threat alters muscle activation
  and co-contraction *before* the fall event.
- Carpenter, Frank et al. (2001) — anxiety shifts strategy from ankle to hip
  control; degrades balance.
- Hardy catastrophe model (1996) — anxiety above threshold causes performance
  *collapse*, not linear degradation.
- Bandura self-efficacy — mastery experiences on *bail-outs* reduce threat
  perception on the primary skill (walking). You don't reduce fear by
  walking more.
- Gymnastics + circus pedagogy (USA Gymnastics manuals, NICA syllabi, Emmet
  Louis, Yuval Ayalon) — cartwheel exit, pirouette, koala roll (tuck
  forward roll), wolfbike are pre-requisite to freestanding, not optional.
- Wulf external focus (2007, 2013) — external cues ("reach for the far wall")
  reduce anxiety and improve acquisition vs. internal cues ("don't fall").

**Proposed 4-layer plan (in order of cost):**

1. **Intake question** (cheap, this sprint if unblocked):
   > "If your handstand tips past vertical, what happens?"
   > — never inverted / would fall onto back or head / can step or twist out
   > but haven't drilled it / can cartwheel or pirouette out reliably
   Answers below "reliably" gate the walking phase — engine will not schedule
   walking attempts until Phase 0 completes.

2. **Phase 0 "Exits before line" block** (medium): Week 1 authored content =
   wall cartwheel exit → quarter-turn pirouette from wall → tuck forward roll
   from crow → deliberate mat falls with breath control. Retest:
   `bail_out_confidence: high` OR video-log evidence.

3. **`bail_out_confidence` log field** (medium): add to
   `program.json.daily_log_schema`. When it drops, engine softens the day
   and holds walking progression — same mechanic as amber-day on pain, but
   for fear.

4. **Video demos of each exit** (later): text + pictogram can point but not
   replace tactile learning. Belongs in F-brief video library queue.

**Priority:** MEDIUM — real barrier to Handstand Walk delivery, but requires
authored content (Phase 0) that changes tier eligibility for real users. Needs
founder validation before shipping.

**Status update 2026-08-18** — layers 1-3 shipped. See
`git log --oneline | grep "Q6"` for the commit. Layer 4 (video demos)
deferred to the F-brief video library queue.

- L1 · Intake question `bail_out_readiness` added with 4 options, gates Phase 0
- L2 · Phase 0 `phase_0_bail_out_prep` added with 4 blocks + 4 exercises
  (wall cartwheel exit, quarter pirouette, tuck forward roll, deliberate mat
  falls). Existing phases shifted 7 days.
- L3 · `bail_out_confidence` (0-10) added to `daily_log_schema`; the
  `derived_state_rule` now defers walking attempts when the score ≤ 3.

Founder validates + iterates on the drill prescriptions before we tell
beta users about Handstand Walk more broadly.

**Cross-references:** `next-app/public/data/programs/handstand-walk.json`
(intake + phases), `dev/whitepapers/04_handstand_walk.md` (add
literature block), F-brief video library queue for Layer 4.

## How to add more Qs

Just append a new `## Q{N} · {short title}` section below. Each new question should have: route, observation, verbatim quote if useful, question for agent, cross-references, priority.
