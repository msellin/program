# Domain specialist agents — plan

Founder, 2026-09-05, across three messages: why don't we have clinician /
S&C agents; a well-researched one could beat a single human; and we could
iterate them against tasks with known answers until they are ready.

All three are right. This is the plan that follows from them.

## What we are building and what we are NOT

**Building:** finders. Agents that surface candidates, cite sources, and
classify their own findings.

**Not building:** sign-off. A credentialed human's value is not that they
know more than the literature — it is that they are regulated, insured and
answerable. No amount of research transfers that. The VERIFIED badge tension
is exactly this confusion, and it is a COPY decision, not an agent one.

## The design constraint, learned the hard way today

Five times in one session a "finding" was an assertion made before checking.
On the CSM item specifically: claimed a six-set render, corrected it, then
re-confirmed it — three confident claims, in a codebase readable with perfect
fidelity and checkable with a test.

Clinical content has no `npm run verify`. A fabricated-but-plausible
mechanism is indistinguishable from a real one to everyone in the loop. So:

> **Every clinical claim must trace to a citation mechanically verified to
> exist and to say what it is cited for.**

That is why `evidence-verifier` is not merely first in the queue — it is what
makes the other four trustworthy. Without it they are four more confident
voices.

## Two rules the UI agents do not need

1. **Self-classification, verified not trusted.** Every finding declares
   itself `code-defect` | `data-defect` | `prescription-change` |
   `needs-credentialed-human`. §C of the SR panel proves why: the CSM finding
   was REAL and got filed "clinical, NOT actioned", so nobody looked again
   for two days. It was a one-line rendering bug.
2. **Conservative asymmetry, in the prompt.** Recommendations that tighten a
   gate, reduce a dose, or weaken a claim are actionable. Recommendations
   that loosen, increase or strengthen are flagged `needs-credentialed-human`
   by construction.

## The §G lesson — tool access is a correctness issue

SR-4 reported rowing-2k offers `days_per_week: 2` against a minimum of 4 with
"nothing acting on the mismatch". FALSE — the gate is in `IntakeClient`. The
panel had only the JSON. Every domain agent gets `Read, Grep, Glob, Bash`
so behaviour claims are checked against code, not inferred from data.

## Phases

1. **Eval set** from repo ground truth — cases with documented verdicts,
   both polarities. `domain-agents-evalset.md`.
2. **`evidence-verifier`**, run on the eight §D citations.
3. **Four finders** — rehab-clinician, strength-conditioning,
   gymnastics-skill, endurance-physiology. Distinct named lineages so they
   can disagree with each other; a lone reviewer has one house style.
4. **Iterate against the eval** until precision, recall AND classification
   accuracy hold. Only then point them at unreviewed content.

## Risk

The eval set is derived from findings this repo already resolved, so an agent
could in principle "pass" by reading the audit docs rather than the code.
Eval runs must exclude `dev/audits/` from the agent's reachable context, or
the score is theatre.

---

## First run — evidence-verifier, 2026-09-05

8 citations. 3 SUPPORTS, 3 OVERSTATED, 1 MISATTRIBUTED, 1 NOT_FOUND.
Report: `dev/audits/programs/2026-09-05-citation-verification.md`.

**The agent works, and it is not infallible — both matter.**

I independently re-checked its most consequential claims before reporting
them, which is the discipline the whole design rests on:

- `astorino_2013` MISATTRIBUTED — **verified independently.** JSCR 2012
  26(1):138-145, not 2013 27(1). N=20 active young men and women, six
  sessions of repeated Wingate tests over 2-3 weeks. Cited for "threshold-pace
  shift of 3-6% in 4-8 wk measured in trained cyclists": no threshold
  measured, no cyclists, wrong duration. Every element wrong.
- `brandt_2025` two bylines — **verified.** citations.json says
  "Brandt N, Ebel K, Lebahn K, Schmidt A"; CSM says "Brandt K, Krieger K,
  Kerner J" with a different title. Two papers, one id, and no test compares
  a programme reference against its citations.json entry.
- `verification_status` dead key — **verified.** Zero reads in `src`, absent
  from `schemas.ts`, so Zod strips it. 3 citations assert "verified", 4
  "pending", to nobody.
- **`kim_2013` "carries verification_status: verified" — FALSE.** Its status
  is absent. The agent asserted a field value it had not read.

That last one is the useful data point. **First run, one fabricated detail**,
in an agent whose primary instruction is not to do that — and it was caught
in seconds by grepping. It is the exact failure this design anticipates, and
the reason the output contract demands a quoted retrieval per claim.

Eval implication: add a case for it. An agent must not assert a field value
without reading it, and the eval should score fabricated specifics as
FALSE POSITIVES, not as harmless noise.

---

## Integrity agent, first run — 2026-09-06

Two runs across all nine programmes. ~28 declared surfaces dead, unenforced,
invisible or mislabelled against ~28 live, plus 21 findings in the skill arcs
against 25 live mechanisms.

Acted on, worst first:

1. **Intake deferrals never ran in production** (`ee1dbc3`). The single worst
   defect of the whole exercise.
2. **Two blocks composed zero exercises for everyone, always** (`2660e2a`).
3. **A promise handstand-walk cannot keep.** Its required shoulder question
   said "we defer inversions this block and route the plan to shoulder-safe
   positions first". The programme has ZERO `intake_exclusions`, and
   `shoulder_pain_overhead` appears exactly once in the whole file — the
   question itself. Meanwhile first-strict-pullup gates the SAME question id
   properly, so this is the sibling pattern again.

   Fixed the honest way rather than the flattering one. A handstand arc
   cannot route around a shoulder: wall hold, freestanding hold and walk all
   load it overhead, so there is no substitute to give. Added a `warn` gate
   matching the wrist one already in that file, which names the two real
   options (build overhead tolerance first, or work with a clinician
   alongside) and asks for an acknowledgement. Help text corrected to say
   what actually happens.
4. **Escalation rules were dead AND invisible.** Six programmes author
   back-off and stop conditions in `progression_rules.escalation` — "two red
   days in a week, skip the heavy session", "persistent shoulder or elbow
   pain over three days, stop, see a clinician". Nothing read them, and the
   /plan panel renders `principles[]`, not this. Now displayed.

## The asymmetry worth naming

The engine counts **three green days in a row** to propose ADDING load. That
is implemented, tested and shipping. It counts **nothing** to propose backing
off — there is no consecutive-red mechanism anywhere in `src`; the only
"consecutive" in the engine is the green streak.

So the app has a mechanism for optimism and none for caution, while six
programmes declare exactly what caution should look like.

## Still open, and why

**Enforcing the escalation rules** is the obvious next step and is NOT mine.
It means the app telling someone to stop training and consult a clinician on
a counter it computed. The thresholds are already authored by the founder, so
implementing them invents nothing — but automating that sentence is a
decision about what the product says to a person having a bad week. Showing
him the rule he wrote is not the same act as acting on it for him.

Remaining from the reports: rowing's `is_taper` stripped by Zod (taper banner
never renders, taper swap never fires), EB2's Push tier unreachable via the
condition tokenizer's missing `-` case, EB2's overlapping phase dates,
`plan_tiers[].program_adjustments` dead in every programme, the HERITAGE
classifier unable to emit a verdict, and muscle-up's `ring_dip_count`
hard-blocking users its own copy invites to continue.
