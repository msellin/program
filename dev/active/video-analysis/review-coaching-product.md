# Video analysis — product & coaching review

**Reviewer:** Tomás Lindqvist-Bahri
**Date:** 2026-09-01
**Scope:** product and coaching design only. Not the vision pipeline, not the storage
model, not the privacy architecture — those are well argued and I have nothing to add.

**Background, so you know what my objections are worth.** Fifteen years coaching:
six in a barbell gym (competitive powerlifting and weightlifting), then head of
coaching at a remote-coaching platform where I reviewed roughly 40,000 uploaded
lifting videos and built the internal review tooling. Five years since as product
lead on movement-feedback features at two fitness apps. The first shipped
automated form feedback and killed it twelve months later — not because it was
inaccurate, but because it was *confidently* wrong often enough that users
stopped reading it. The second worked, because it never used the word "form".

I have been in the room for this exact feature twice. Both times the engineering
was the easy half.

---

## The one-paragraph verdict

The measurement half of this plan is excellent and the discipline behind it —
geometry over vision models, closed grammar, degrade-don't-throw, confirm-first,
nothing uploaded — is better than anything I shipped at either company. The
**coaching output layer is not ready and rests on a factual error about the
data**. The single strongest argument in the plan (velocity → RIR → training max)
is not a form-feedback argument at all, and the product that follows from it is a
different, smaller, better product. Ship that one. Do not ship per-rep verdicts.

---

# CRITICAL

## C1. The cue-binding foundation does not exist in the data. Verified.

**Problem.** `plan.md` states: "`exercises.json` already contains the coaching
content. Each exercise carries `cues[]`… A rubric therefore does not author
coaching — it binds a measurement to an existing cue index." `context.md` repeats
it. `tasks.md` V4-2 says "No new coaching copy anywhere in this feature."

I checked `next-app/public/data/exercises.json`. Of 133 exercises:

| | count |
|---|---|
| have a populated `cues[]` | **39** |
| have `cues_external_focus[]` instead (different field, different purpose) | **87** |
| have neither | **7** |
| have `cues[]` with exactly one entry (so `cue_ref` can only ever be 0) | 6 |

Broken out by category — and this is the part that matters:

| category | with `cues[]` | without |
|---|---|---|
| gymnastics | **0** | 40 |
| skill | 4 | 21 |
| strength | 11 | 9 |
| mobility | 2 | 16 |

**65 of 133 exercises are gymnastics or skill.** The plan cites that number as the
core justification for building the feature ("the category where a camera beats a
text field by the widest margin"). Those 65 exercises contain **four** populated
`cues[]` arrays between them. `cue_ref` is unresolvable for essentially the entire
flagship category. The validator in V2-3 ("`cue_ref` in range of that exercise's
`cues[]`") will pass by vacuously refusing to let you author a rubric at all.

**Why it bites.** The whole "cheap to extend, no new copy" argument is the reason
this feature looks affordable. It isn't. Either you author 90+ new cue arrays —
which is exactly the coaching-copy project the plan claims to have avoided — or
video analysis silently covers only strength movements, which is the category
where a camera adds the least and where a $200 barbell velocity tracker already
exists.

Worse: the two Phase 2 movements named in `tasks.md` V2-5 and V2-6,
**`strict_pullup` and `wall_handstand_hold`, are not IDs in `exercises.json`.**
Neither is `strict_press` — one of the two clips the 2026-09-01 empirical run was
built on. The founder cannot attach that video to anything in the app. Phase 2 is
specified against a movement library that does not exist.

**Recommendation.** Before any Phase 2 work:
1. Rename the plan's claim honestly: the rubric *does* author coaching, or the
   feature covers ~39 exercises.
2. Reconcile `cues[]` and `cues_external_focus[]` into one addressable vocabulary,
   or make `cue_ref` a `{field, index}` pair. Right now the schema cannot even
   point at the cues that do exist for 87 exercises.
3. Fix the phantom IDs in V2-5/V2-6 or drop them.
4. Add to the validator: *a `video_rubric` may not be added to an exercise whose
   referenced cue field is empty.* Fail loudly on load, per CLAUDE.md.

---

## C2. The plan's own worked example produces a confidently wrong cue.

**Problem.** The draft rubric in `plan.md` maps:

```jsonc
{ "id": "shallow", "when": "depth_ratio > 1.02", "severity": "warning", "cue_ref": 0 }
```

The rubric is for `back_squat_highbar`. Here is that exercise's `cues[0]`, verbatim
from the file:

> "Bar sits on the traps, not the rear delts — low-bar rack position is OFF the
> menu due to shoulder retroversion"

So: the user squats high, the app grades the rep **Needs work**, and the
improvement point it offers is a note about rear delts and a shoulder condition
the user does not have. `cue_ref: 1` — "Upright torso, knees out, controlled
descent" — is a three-cue compound that also does not mention depth.
`cues[2]` is about lifting straps.

**There is no cue in this exercise that addresses squat depth.** The plan's
flagship worked example, on the plan's flagship movement, cannot produce a correct
line of feedback from the data it says it will use.

**Why it bites.** This is the exact failure mode that killed the feature at my
first company, and it kills it on rep one, not rep one hundred. A lifter who gets
one obviously-irrelevant cue does not conclude "the cue library is thin." They
conclude the app does not know what it is looking at, and then they discount the
rep count and the velocity numbers too — which were *correct*. You lose the good
half of the feature to the bad half.

**Recommendation.** Kill index-based binding. It couples a fault to a position in
an array that was written for a different purpose and has no stable meaning.
Replace with an explicit, validated fault→text map authored *per fault*, and treat
that text as a first-class deliverable with a word budget. It is maybe 40 strings
for three movements. That is an afternoon, and it is the difference between the
feature working and not.

Also: `back_squat_highbar.cues` and `front_squat.cues[2]`, and the whole
`bulgarian_split_squat_db` array ("Left side gets the extra set — documented left
glute-max and left hip-flexor deficit"), are **the founder's personal rehab
notes**. `hip_thrust_barbell`, `glute_bridge_single`, `deadlift_conventional`
likewise. This library was seeded from one person's clinical record — CLAUDE.md
says so. Piping those strings into a paid feature for strangers ships one user's
medical history as coaching to another. That is not a copy problem, it is a
correctness and a privacy problem, and index-binding is what makes it invisible.

---

## C3. "Needs work" is the wrong label, and the load caveat cannot be implemented.

**Problem, part one — the word.** "Needs work" is not a coaching register. It is a
performance-review register. When a coach says it, it is softened by the fact that
a human said it, in a gym, about a specific thing, with a fix attached. When an app
says it under a rep number, it reads as a grade, and a grade invites two responses:
argue with it, or stop filming. Nobody has ever gotten better at squatting because
an app said "Needs work."

The scale also has a structural defect: it is **monotonically negative**. "Good"
means the app found nothing. There is no verdict for *this was better than last
time*, which is the only judgement a focused-improvement app should be making.
Terav's entire premise is an arc against your own log. A three-point absolute
scale has no memory. It will tell a lifter who went from 40% depth to 85% depth
that they Need Work, forever, until they cross a threshold — and then say nothing
at all.

**Problem, part two — the caveat is not implementable.** `plan.md` correctly
identifies that a grinding rep at 95% is not a fault, and calls the fix a
"correctness requirement, not a tone preference." Agreed, and well spotted. But
the proposed fix — "gate `warning` severity on set intensity" — requires knowing
set intensity. For `back_squat_highbar` you have a TM and can compute it. For the
65 gymnastics/skill exercises there is no load, no %1RM, and no intensity field:
a handstand hold, a strict pull-up, a muscle-up. A near-limit set of pull-ups
looks *exactly* like a technically poor set of pull-ups, because at RIR 0 it *is*
a technically poor set of pull-ups, and that is fine and normal and not a fault.

So the correctness requirement holds on strength (where it is implementable) and
fails on skill (where it is not) — which inverts the plan's own category argument.

**Recommendation.** Drop the four-point verdict. Replace with:

- **Per set, one sentence, no grade.** State what was measured and what changed.
  Example replacement copy for the 2026-09-01 front squat:

  > **Front squat · 2 reps · depth held**
  > Both reps below parallel. Rep 2 descended slower (0.70 s → 0.90 s) with the
  > drive unchanged — that reads as control, not fatigue.

  No verdict token. The user grades it themselves in half a second, which is what
  they were going to do anyway.

- **Where a genuine fault fires, name the fault and the fix, and never the
  quality.** "Rep 3 was your shallowest — about 4 cm above where reps 1–2 sat"
  beats "Rep 3: Needs work" on every axis: it is specific, it is falsifiable, it
  is actionable, and it does not judge.

- **If you must keep tokens** (I would not), the set is: `Measured` /
  `Something changed` / `Couldn't measure`. Note there is no bad option. The app
  is a sensor. Sensors do not have opinions.

- **Rename "Not measurable" → "Not visible from this angle."** "Not measurable"
  sounds like the app failed. "Not visible from this angle" is a fact about the
  camera and it tells the user what to do. The plan is right that this is a
  first-class state; it just needs a first-class name.

---

## C4. Per-rep is the wrong unit. Nobody has ever wanted a rep graded.

**Problem.** The output contract's primary array is `reps[]`, each with a verdict.
In 40,000 reviewed videos I never once wrote a per-rep grade, and no lifter ever
asked for one. Lifters ask three questions, in this order:

1. **Did that count?** (rep count, depth standard met, was it strict)
2. **How close was I?** (RIR — the question that decides the next set, *in the next
   90 seconds*)
3. **Is this better than last week?** (the only question that matters over a month)

Per-rep verdicts answer none of these. They answer "which of these five reps was
worst", which is a question a coach asks *themselves* while forming an opinion —
it is working-out, not output. Showing working-out is how you get five verdict
chips where one sentence belonged, and five chances to be wrong instead of one.

The plan half-knows this. Its own worked reading —

> *rep 1 good, rep 2 good, set-level hint: slowed 15% through the same point both
> reps*

— has the entire information content in the set-level line. The two rep verdicts
are noise that had to be printed to justify the array.

**Why it bites.** Per-rep grading is what makes an app feel like it is marking
you. It is also the format that makes over-reporting inevitable: five reps × four
faults = twenty chances to say something, and the plan has no cap on how many
things it says. Most detected "faults" are within normal variation or are a
consequence of load, not technique errors — the 2026-09-01 discard list proves the
team already knows this — but a per-rep table has 20 empty cells begging to be
filled.

**Recommendation.** The unit is **the set**, with the rep detail available on tap
and never surfaced by default. Structure:

```
Set summary   ← one line. Always shown.
Trend         ← vs. the last analysed set of this movement. Shown from session 2.
Rep detail    ← table. Behind a disclosure. No verdicts, just numbers.
```

Keep `reps[]` in the data model — the analyser should absolutely compute it, and
V4-6's week-over-week view needs it. Do not render verdicts on it.

---

## C5. The most likely way this feature dies: the third bad capture. Nothing in the plan prevents it.

**Problem.** The plan's failure analysis is about wrong numbers. That is the right
thing to worry about *technically* and the wrong thing to worry about
*commercially*. Features like this die from **zero output**, not wrong output.

Trace the real path. The founder's own squat clip — filmed by someone who knew a
camera would be pointed at it — scored 66% detection and needed the `heavy` model.
The 2026-09-01 clips were both **rear view**, and the plan says depth is a
side-view measure and rear-view knee tracking is perspective artifact. So of the
three real clips this project has, **the founder filmed the wrong angle twice.**

Now a paying user, in a commercial gym, phone leaned against a dumbbell rack, one
minute of rest before the next set:

- Attempt 1 → blocking refusal: "Get your whole body in — your feet are cut off."
- Attempt 2 → they re-rack the phone, film the next set → advisory: "We measured
  tempo and rep count. Film from the side next time and you'll also get depth."
- Attempt 3 → they do not film a third time. They finish their session.

**Nobody re-films a set.** A set is not repeatable — it costs a real warm-up, real
fatigue, and real time, and the user is not going to redo a top single so an app
can see their hips. Re-filming means *next session*, which means the feedback loop
is a week long, which means it is not coaching, it is a report card that arrives
after the exam. A cue given at the wrong moment makes lifters worse; a cue that
arrives seven days late is not a cue at all.

The blocking/advisory split itself is well designed and the closed-enum decision is
right — I would ship that copy nearly as written. The defect is that **the plan has
no model of the user's patience budget.** There is no counter, no degradation path,
no "we keep failing you, here is what to do about it," and no off-ramp.

**Recommendation.**
1. **Never fully block.** A blocking refusal must still return whatever *was*
   measurable, even if that is only rep count and tempo. Rep count from a badly
   framed clip is still worth more than an error dialog, and it is the one number
   the user can verify against their own memory — which is how trust gets built in
   the first place.
2. **Instrument the capture-failure streak.** After two consecutive
   blocking-or-advisory results on the same movement, change the intervention
   entirely: not another tip, but *"Filming this one is fiddly. Want us to just
   count reps and time them? That works from any angle."* Degrade the feature
   rather than the user.
3. **Move the framing guide out of the pre-filming screen and into the gym.** V3-2
   shows an illustration before they go and film. They will read it once and never
   again. What actually works — I have shipped this — is a saved-per-movement
   *camera position card* the user sets up once, plus a one-line reminder in the
   session view at the moment they are resting: "Filming this? Phone at hip height,
   3 m back, from the side."
4. Ship a real answer to "what happens on the third bad clip" before Phase 3
   starts. This is the highest-value unwritten section of the plan.

---

# MAJOR

## M1. Yes — build the load-prescription version, and never say "form".

**Question 7, directly: does the user care about the engine argument?** Not as
stated. "This makes our training-max inference more accurate" is an internal
concern. But the *user-facing* version of it is the strongest fitness-product pitch
of the last decade, and it is not a form pitch:

> **Terav reads how fast the bar moved and tells you what to lift next.**

That is velocity-based training. It has thirty years of literature, a devoted
audience, and a hardware category (Enode, Vitruve, GymAware) selling €300–1,200
units to do exactly what an on-device phone pipeline can now do for free. It is
also, unlike form feedback, **something a phone genuinely does better than a
mirror**, which is the only defensible reason for a camera to exist in a training
app.

Now check the fit against Terav's own mechanic, which is the real test:

| Terav requires | Form verdicts | Velocity |
|---|---|---|
| Engine proposes, user Accepts | A verdict is not a proposal; there is nothing to accept | "Bar slowed 22% on rep 9 — that's ~2 RIR. Raise the training max to 100 kg?" **Accept / Ignore.** Perfect fit. |
| Every change cites a study or names its log signal | A cue cites nothing | Names its log signal exactly: mean concentric velocity, this set |
| Focused improvement on ONE arc | Diffuse quality commentary | One number, one arc, one lift |
| Not a full training plan | Form check across 133 movements *is* the full-plan surface | Load prescription only |

Form feedback fails all four. Velocity passes all four. **The version of this
feature that never mentions form is not a compromise — it is the version that is
actually Terav-shaped.** Everything else in the plan is scope creep wearing the
same pipeline.

**Recommendation.** Reframe v1 as **"Bar speed"** (or "Set check"), not "video
analysis". It measures reps, tempo, velocity, and hold time. It outputs one
proposal: an RIR / training-max adjustment. It says nothing about technique. The
faults that survive are the two the plan has already empirically validated
(velocity decay, tempo change). Everything under the "form" heading defers to v2,
gated on whether anyone asks for it.

This also collapses C1 — a load-prescription feature needs *zero* cue strings.

## M2. Ship V-ADJ-1 first, alone, this week.

The RPE picker bug is described in `tasks.md` V-ADJ-1 and `plan.md`: floor of 7,
`rir = 10 - rpe`, effort buttons don't render on the final set. That is a 5 kg
training-max error on the founder's own data, and the fix is a picker change.

The video feature exists, per the plan's own strongest argument, to route around
a broken input field. **Fix the field first.** If asking "how many reps left in
the tank? 0/1/2/3/4/5+" recovers 80% of the value for 0.5% of the effort, then the
honest engine case for the video feature is not "it replaces a broken RPE picker",
it is "it is more objective than an accurate RPE picker" — a much weaker claim
that deserves to be tested against a working picker before you build a vision
pipeline to beat it. Shipping the picker fix first is also the only way to ever
know whether video velocity actually beats self-report for this user base.

## M3. Which of the four empirical findings I would surface — and the honest answer on insight density.

**Is four findings from two clips enough?** Framed as "form findings", no — and
worse, it is *too many*, because three of the four are things the user already
knew. But that framing undersells the run. Three of the four are not form findings
at all; they are measurements, and measurements do not need to be surprising to be
valuable. A bathroom scale tells you nothing new either.

The real threshold, from shipping this twice: **one non-obvious, act-on-it-now item
per upload, plus a number the user can check against their own memory.** The
checkable number (rep count, and it must be right — V1-6's 100% bar is correct and
non-negotiable) buys the credibility that lets the one insight land. Two insights
is a good day. Three is over-reporting, and over-reporting is how you get
discounted: a lifter who reads four things and finds one of them dumb stops
reading all four.

Now, specifically, from `context.md`'s four:

| # | Finding | Verdict |
|---|---|---|
| 1 | Press was genuinely strict (hip travel 2%) | **Suppress entirely.** This is the app validating its own input — V3-7 verification. It is plumbing. Telling the user "we confirmed you did the exercise you said you did" is the app congratulating itself and it makes the user wonder what else it was unsure about. Use it silently to gate; surface it only when it *fails*. |
| 2 | Press rep 2 was 15% slower, stalled early | **Surface — this is the feature.** But not as "15% slower". As the decision it implies: *"Bar slowed 15% on rep 2. You had about 2 more in you."* Acted on before the next set, cites its own signal, becomes an Accept/Ignore proposal. |
| 3 | Front squat: eccentric lengthened 0.70→0.90 s, concentric held | **Surface, as a positive, once.** This is genuinely good coaching — it is the observation that distinguishes control from decay, and lifters almost never get told when they did something *right*. Copy: *"Rep 2 came down slower but drove up the same. That's control under fatigue, not fatigue."* This single line does more for retention than every fault in the rubric. But do not repeat it every session; a compliment on loop is wallpaper. |
| 4 | Repeatable mid-ascent sticking region, deeper on rep 2 | **Suppress in v1. Surface in v3, as a pattern, never as a fault.** This is real and the analysis behind it is excellent — including the discipline of *refuting* the good-morning read with the hip/shoulder rise ratio, which is the single best piece of work in either document. But a sticking region is leverage, as the analysis itself concludes. It is not a fault, there is no cue for it, and the only correct response is a programming change (pause squats, pin work) — which is a *coach's* call over weeks, not an app's call over one set. Telling a lifter "you have a sticking point at mid-ascent" is telling them something they felt more clearly than you measured it. Surface it only after it appears across ≥3 sessions, only in a trend view, and only with a programming suggestion attached — which is a v3 feature at best. |

Net: of four defensible findings, **one belongs in v1** (#2), one belongs in v1 as
occasional positive reinforcement (#3), and two should never be shown. That ratio
is normal and healthy, and it is also a direct argument for M1 — because #2 is a
velocity finding and #3 is a tempo finding. **Neither is form.**

## M4. Automatic feedback contradicts the library's own `feedback_type` field.

`exercises.json` already carries `feedback_type`, populated on 87 exercises:
**44 `self_controlled`, 39 `KP`, 4 `KR`.** Every handstand progression is
`self_controlled` — including `hs_wall_hs_hold_belly`, which cites
Kerwin & Trewartha 2001 and friends.

Self-controlled feedback means *the learner decides when to receive it*, and the
motor-learning literature that field encodes is unambiguous that it outperforms
experimenter-scheduled feedback on retention. The video feature as designed pushes
a verdict at the user after every upload, on every movement, regardless. It
contradicts a field the library already declares, on the exact category the plan
says it is for.

**Recommendation.** Honour the field. On `self_controlled` movements, the analysis
completes and shows only the measurements; the interpretation sits behind an
explicit *"What did you see?"* tap. On `KP` movements, one performance observation
may be pushed. This costs a conditional and buys both a defensible coaching stance
and a citation, which is exactly the currency Terav trades in.

## M5. Cues written as pre-lift instructions do not survive repurposing. Checked.

Answering question 3 directly: **it is a trap, and the data proves it.** Real
examples from the file, read as post-hoc feedback:

| Cue as written (pre-lift) | Read back after the set |
|---|---|
| "Point the toes at the light fixture overhead, not at your own heels" | Fine as an instruction before a hold. As a verdict on a hold you already finished: it is an imaginary light fixture you no longer have. External-focus imagery is *prospective by construction* — it works by giving attention somewhere to go **during** the movement. Retrospectively it is meaningless. |
| "Move like the bar is soft and you don't want to break it" (`pu_slow_tempo_pullup`) | "You did not move like the bar was soft." Insulting and unactionable. |
| "Pretend the floor is 10 seconds away and you have to land soft" (`pu_negative_pullup_10s`) | Same. Pure imagery. Zero diagnostic content. |
| "This is technique work and joint nutrition, NOT stimulus — do not chase fatigue" (`air_squat_daily`) | Not a cue at all — it is a programming note. Would render as an improvement point. |
| "Only if the block pull has been symptom-free at ~150 kg for at least 4 weeks" (`deadlift_conventional`) | An eligibility gate rendered as feedback on a rep. |
| "Left side gets the extra set — documented left glute-max and left hip-flexor deficit" | Another user's clinical record, as your form correction. |

**The general rule, and it is not close:** external-focus cues are the *best* cues
to give before a rep and the *worst* text to show after one, because their entire
mechanism is anticipatory attention. The library is full of good external-focus
cues — that is a credit to whoever wrote them — and almost none of them survive
inversion into feedback.

**Recommendation.** Post-hoc feedback needs its own field. Add
`cues_corrective[]`, authored specifically as after-the-fact copy, and bind faults
to that. Roughly 3 strings × 3 movements for the v1 scope. The "authors no new
copy" rule was good discipline aimed at a real risk (rubric/library drift), but it
was applied to the wrong artefact — the thing that must not drift is the
*movement library*, not the feedback strings.

## M6. Positioning: the measurement is focused-improvement; the form check is not.

Question 9. Split the answer:

- **Measurement (reps, hold seconds, distance, velocity) is squarely on-strategy.**
  The `physical_test` table in `plan.md` is the best page in the document: eight
  retest metrics currently typed from memory, all of which a camera measures
  deterministically. That is not a new surface — it is a better input to the arc
  the user already picked. Ship it.

- **Form verdicts across the catalogue are scope creep, and of the specific kind
  CLAUDE.md and the memory note `feedback_focused-not-full-plan` reject.** "Film
  any set, get a technique grade" is a horizontal capability across all 133
  movements. It has no focus. It competes with a saturated category and it
  overpromises — the exact failure the project already diagnosed in HWPO-style
  full plans. The plan's own risk table lists "Scope creep into 'AI coach'" as
  **High** and mitigates it with "one video = one exercise". That mitigation is
  architectural, not product-level: it stops the *classification* problem, not the
  *positioning* problem. A confidently-graded rep is an AI coach regardless of how
  the rubric was selected.

- **The paid-tier framing makes this sharper, not softer.** A paid feature that
  says "Needs work" is a paid feature that criticises you. Every renewal decision
  now runs through "do I like being told this?"

---

# MINOR

- **M-a. "Advisory" copy is nearly right.** *"We measured tempo and rep count. Film
  from the side next time and you'll also get depth and torso angle."* Ship close
  to as-is — it is honest, specific, and sells the next attempt. One edit: put the
  unlock first. *"Film from the side next time and you'll get depth and torso
  angle too. This clip gave us tempo and rep count."* Users read the first clause.

- **M-b. The free-tier question (V6-3) answers itself under M1.** Rep count free,
  velocity/RIR proposal paid. Rep count is the trust-builder and it should be
  given away; the load prescription is the thing worth money.

- **M-c. "one analysis per exercise per day, top set, re-pick overwrites"** (open
  question 4) is correct. Don't reopen it. It also matches the set-as-unit
  recommendation in C4.

- **M-d. Sequencing.** V4-7 (verdict scale) is currently a peer of V4-1/V4-2 in
  Phase 4. It should be blocked on a written copy deck, reviewed as copy, before
  any of it is built. Copy is the deliverable in this feature; treating it as a
  render detail of the rubric is what produced C2.

---

## Summary table

| # | Severity | Finding |
|---|---|---|
| C1 | Critical | 94/133 exercises have no `cues[]`; 0 of 40 gymnastics do. `cue_ref` binding is unimplementable for the flagship category. Phase 2 names three exercise IDs, two of which don't exist. |
| C2 | Critical | The plan's own example maps a shallow-squat fault to a cue about rear delts and shoulder retroversion. Also pipes the founder's personal rehab notes to paying strangers. |
| C3 | Critical | "Needs work" is a grade, not coaching; the scale is monotonically negative and has no memory of the user's own arc. The load-awareness gate is unimplementable on the 65 bodyweight movements. |
| C4 | Critical | Per-rep verdicting is the wrong unit. The set is the unit; the trend is the payoff. Per-rep grading is 5× the chances to be wrong for 0× the added decision value. |
| C5 | Critical | The feature dies on the third bad capture, not the first wrong number. Nobody re-films a set. No streak handling, no degradation path, no off-ramp in the plan. |
| M1 | Major | The velocity/load-prescription version passes all four Terav mechanic tests; the form version fails all four. Build "Bar speed", never say "form". |
| M2 | Major | Fix the RPE floor bug (V-ADJ-1) first and alone. It recovers most of the engine value and is the only way to know if video actually beats a working picker. |
| M3 | Major | Of four empirical findings: surface velocity decay, surface the eccentric-control positive occasionally, suppress the movement-class confirmation and the sticking region. One insight per upload is the target. |
| M4 | Major | `feedback_type: self_controlled` on 44 exercises — pushed automatic verdicts contradict the library's own cited motor-learning stance. |
| M5 | Major | External-focus cues are prospective by construction and read as nonsense or insult retrospectively. Verified against six real strings. Needs a `cues_corrective[]` field. |
| M6 | Major | Measurement is on-strategy; horizontal form grading is the scope creep the project already rejected. The "one video = one exercise" mitigation solves classification, not positioning. |

---

## What I would ship

Phase 1 and the analyser exactly as planned — that work is sound and the empirical
discipline behind it (three vision-model failures, zero arithmetic failures) is the
best evidence in the file. Then:

1. **V-ADJ-1**, standalone, now.
2. **Rep count + hold seconds → retest auto-fill as a proposal.** Highest value,
   zero coaching copy, zero verdicts, directly serves the eight `physical_test`
   metrics currently typed from memory.
3. **Velocity → RIR → training-max proposal.** The Accept/Ignore mechanic fits it
   natively. This is the product.
4. **Capture feedback**, with the never-fully-block and streak-degradation changes
   from C5.
5. **Nothing about form.** Revisit in v2 if — and only if — users ask, at which
   point you will have earned the trust to be believed and will have real clips to
   author `cues_corrective[]` against.

The pipeline you have specified supports all of that. It just doesn't need to have
an opinion about anybody's squat.
