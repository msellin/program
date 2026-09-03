# SR-1 review — overhead-mobility (SIMULATED, 2026-09-03)

**No human clinician has reviewed this or any Terav program.** SR-1 is a
simulated reviewer (`dev/audits/reviewer-personas/shoulder-overhead-SR1.md`),
run because the founder has no shoulder physiotherapist to send the packet to.
Recorded as an agent review. It must NOT populate `specialist_review`, and the
"no outside specialist has signed off" sentence on /programs stays.

**Verdict: do not ship until fixed** — scoped to three screening items, then
"ships with the changes flagged".

## Verified by the orchestrator against shipped JSON

Every blocking finding was checked before being recorded. All three hold.

1. **`rotator_cuff_dx` offers `unsure` and only `yes` blocks.** "Unsure" is the
   honest answer of someone with shoulder pain and no diagnosis. They enrol.
2. **`shoulder_pain_flexion` has no safety gate at all.** The question is
   "Does anything hurt in the last 30 degrees of overhead reach?", it is
   `required: true`, and answering `yes` enrols you in a programme whose entire
   content is end-range flexion. This is the most consequential gap.
3. **Two documented contraindications have no question that could detect
   them** — adhesive capsulitis and active AC-joint irritation are named in
   `evidence_base.contraindications`. The authors decided those people should
   not be here; nothing asks.

**It generalises.** Seven of eight catalog programmes let a risk answer
through: five pass `hypertension_unmanaged: "unsure"`, `handstand-walk` has an
ungated `wrist_pain_12mo` and two more `unsure` values, and contraindications
outnumber gates almost everywhere — `first-strict-pullup` documents five and
gates one.

Guarded in `data-integrity.test.ts` with an explicit baseline: new gaps fail,
and fixing one without delisting it also fails, so the list cannot become
decoration. Mutation-tested both directions. **The baseline is not approval.**

## Not verified — for a human, or for the founder

**Terminology (SR-1's highest value-per-minute item).** The programme sells
"snatch, OHS, and press without impingement" and its `kinematics_before_load`
principle cites Ludewig & Cook 2000 for impingement risk rising when scapular
upward rotation lags flexion under load. JOSPT's 2025 recommendation is that
"impingement" be avoided in favour of *rotator cuff-related shoulder pain*;
meta-analytic work finds no constant kinematic difference between symptomatic
and asymptomatic shoulders. SR-1's point: **the drills are broadly reasonable,
the story told about them is out of date** — and separately, a training app
cannot promise the absence of a painful condition. Suggested replacements are
in the review. This is a copy decision on health-adjacent claims: founder's.

**Prescription items.** Drop the 190° stretch target (measuring scapular tilt
and lumbar extension, not glenohumeral flexion); gate empty-bar OHS on the
flexion retest rather than the calendar for Foundation tier; push snatch-grip
Sotts press to phase 3 for non-Push entrants. Clinical judgement: founder's.

**Citation mismatches.** Several `evidence_refs` point at drills the paper
does not cover — `wulf_shea_2002` on passive bar hang, `reinold_2007` as sole
reference on KB arm bar / Sotts press / TGU hold; `manske_2010` is cited for a
sleeper stretch that is not in the library; `bullock_2019` justifies a
rotational retest the programme does not have. SR-1 notes these are
machine-checkable and should be checked by machine, not by a reviewer. Not yet
actioned.

**Marked `needs-paper` by SR-1** — `kim_2013` (the retest anchor),
`sands_2000`, `sadowski_2021`. The reviewer explicitly declined to guess.

## Method finding

SR-1 had to open the program JSON to find four of its results, and said so:
"the packet describes the program at a level of abstraction that hides the
errors most worth catching." A real reviewer sent only the packet would have
missed the screening gaps. **The packet should surface the full intake
question set and its gates, not just the three block rules.** Not yet actioned.
