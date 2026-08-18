# Program audit tracks (2026-08-18)

Founder request: audit every shipped program in three independent vectors.
Right now the app has 9 programs live; nothing has been formally audited beyond
citation-drift checks. This track defines what a real audit looks like.

## Motivating observations

- 2026-08-18: founder queried the 5/3/1 squat template showing 71.5 kg × 5 sets
  × 5 reps. Turns out correct — it's the FSL (First Set Last) supplemental at
  65% TM, canonical Wendler pattern — but the confusion (was it the main set
  or the supplemental?) surfaced a broader question: are the schemes we
  render on Today clear enough for a user to know what they're doing? And is
  the underlying program JSON authored correctly for every phase / week?
- Every program has been shipped as PROVISIONAL. None have been graduated to
  REVIEWED status via specialist audit (see manifest.json `status` field on
  each program).

## The three vectors

### Vector A · Setup audit (data + engine correctness)

**Goal:** every field in every program JSON does what the code expects.

For each program (there are 9):
1. `blocks[].items[].scheme` — parse the prose, verify the number rendered
   on Today matches. Especially the % / TM math (5/3/1, Smolov Jr., FSL,
   BBB, tempo notation).
2. `phases[].starts` / `ends` — do they cover the calendar cleanly?
   Overlapping phases (like Handstand Walk's tier-anchored phases) — is
   the phase resolver picking the right one for the user's tier?
3. `weekly_template.week[]` vs `reference_week_tier_X` — does every day-of-
   week map to a real block? Rest days correctly rendered?
4. `retest_metrics[].source_ref` — does the source-ref resolve? On the
   RetestMetricsPanel, does the current value populate correctly for the
   user's tier?
5. `non_responder_classifier` (HERITAGE programs) — does the rule DSL
   evaluate without runtime errors?
6. `intake.safety_gates` — every gate triggers when it should. Every gate
   `unsafe_values` matches the intake schema's declared answer set.
7. `plan_tiers[].condition` — every condition is machine-evaluable and
   evaluates to sensible tier assignment across the persona matrix.
8. `onboarding_steps[]` — every step's `cta_href` resolves to a real
   route; every `body_md` renders correctly.
9. `signal_completeness.currently_reads` / `would_additionally_use` —
   accurate against the engine.

**Cost:** ~2h per program × 9 = 18h. Or dispatched as a specialist agent
per program — ~15 min agent + 30 min human review.

### Vector B · Literature audit (claims ↔ studies)

**Goal:** every citation in the program actually supports the claim it's
attached to.

For each program:
1. Load `program.outcome_evidence[]` + inline citation refs.
2. For each citation, fetch the abstract from PubMed / DOI / preprint
   server.
3. Verify: does the paper's finding actually support the claim as
   written? Or is it selectively quoted / misapplied?
4. Verify: does the paper's population match the target user? (A meta-
   analysis of trained cyclists doesn't automatically transfer to a
   rehab patient.)
5. Check the whitepaper (`dev/whitepapers/*.md`) matches the citations
   used in the program JSON. Any drift?
6. Check any `evidence_refs` on individual drills — do they match the
   drill's mechanism?
7. Output a per-citation verdict: `verified` / `mismatch` / `weak_evidence`.

**Cost:** ~2-4h per program × 9 = 18-36h. Or dispatched as a specialist
agent per program with WebFetch + WebSearch — ~30 min agent + 1 h human
review of contested calls.

### Vector C · Test-user walkthrough (end-to-end lived experience)

**Goal:** a real athlete completes each program's full arc (or a
simulated version) with realistic logging and validates the engine
behaves.

Per program:
1. Simulator harness runs the full arc (8-16 weeks depending on program)
   with:
   - Realistic morning-check patterns per persona
   - Notes with keyword variety ("felt strong", "hip tight", "class
     yesterday")
   - Logging behaviors: complete, skip, partial, backdate
2. Capture: does the engine propose reasonable things? Does HERITAGE
   classification fire when expected? Does the retest window open on
   the right day? Do proposals actually help or just add noise?
3. Capture: does the copy on Today read naturally at every phase?
4. Capture: does Progress show a coherent story at week 4 / 8 / 12 / end?
5. Manual walkthrough by the founder or a designated beta athlete on 1-2
   programs alongside simulator runs on all 9.

**Cost:** ~30-60 min simulator run per program (already built for
5 archetype × N programs matrix — see
`next-app/tests/e2e/simulate-matrix-v2.spec.ts`); real athlete = weeks
of calendar time per program.

## Dispatch strategy

Once we're ready to move on this:

1. **Setup audit (Vector A)** — dispatch 9 parallel specialist agents,
   one per program. Reports land in `dev/audits/programs/setup/<slug>.md`.
2. **Literature audit (Vector B)** — dispatch 9 parallel research agents
   with WebFetch access, one per program. Reports land in
   `dev/audits/programs/literature/<slug>.md`.
3. **Simulator matrix (Vector C)** — re-verify + expand the existing
   `simulate-matrix-v2` (post-audit-p0s G3 flagged this needs a re-run
   anyway). Add new archetypes if needed for the new programs
   (first-strict-pullup, muscle-up, engine-builder-block-2).
4. **Reconcile findings** — cross-reference A + B + C outputs. Flip
   `manifest.json` program status from PROVISIONAL → REVIEWED when all
   three vectors pass. Programs that fail any vector go back to the
   authoring queue.

## What this replaces

- Ad-hoc citation-drift checks (already run once, results in
  `dev/archive/citations-under-review-2026-08-17.md`).
- The founder eyeballing the app and catching a "wait, is this 71.5 × 5 × 5
  right?" question. Systemic audit prevents that.

## Not scheduled

Waiting on:
- Beta launch to real users (Vector C real-athlete component becomes
  organic)
- Founder decision on WHEN to do Vector A + B — could be immediate
  (during current sprint) or after beta polish is done.

Filed as active track for future prioritization.
