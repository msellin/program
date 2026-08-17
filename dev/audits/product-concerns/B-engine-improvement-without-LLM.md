# Concern B — Engine improvement without LLM

Research brief, 2026-08-17. Prior art on adaptive rule-tuning in fitness / health SaaS.

## 1. The question, restated

Can Terav's engine get materially smarter over time by mining production logs
(free-text notes + timestamps + subsequent-day outcomes) and using them to
tune its own rules, without introducing an LLM in the hot path or a full ML
training pipeline?

The founder's proposed staircase:

- **Phase A** — surface new keywords users are writing that `note-signals.ts` doesn't match.
- **Phase B** — correlation lift: which keywords predict red-state days.
- **Phase C** — per-user calibration: each user has their own vocabulary and their own baselines.
- **Phase D** — LLM only as a fallback for genuinely novel phrasing.

The implicit claim is that Phases A-C can deliver most of the value with a
maintenance job (weekly cron, humans-in-the-loop), not a model.

## 2. Comparable apps studied

**MacroFactor (nutrition, adaptive TDEE).**
Clearest public precedent for "adaptive without ML." Trexler and Nuckols
publish the algorithm openly. It reverse-solves the energy-balance equation:
observed weight trend minus reported intake equals true expenditure, smoothed
with a rolling weighted average. Deterministic maths, not a model. V3 (2024)
was made "structurally more robust," not retrained on more data. What works:
transparency, self-correction, user trust. What breaks: garbage in / garbage
out — depends entirely on logging accuracy. Coaching mode ignores
user-flagged anomaly weeks (holiday, illness) — the same phase-gate pattern
Terav uses. Paid.

**TrainerRoad Adaptive Training (cycling).**
Counter-example. They explicitly ship ML: a classifier grades every workout
fail / pass / super-pass using power data plus a post-workout survey, feeding
per-energy-system Progression Levels. They built it because rules alone
couldn't respond fast enough to individual variance. Their forum documents
what ML doesn't fix: one bad day propagates, four-button surveys are too
coarse, early-plan workouts feel too easy. Lesson for Terav: even the best
team in this niche went past rules → ML classifier and users still complain
it's blunt. Paid.

**Fitbod (strength).**
Rules engine dressed as AI. Scores 800+ exercises per session against
weighted factors (goal, equipment, muscle freshness, past performance,
estimated 1RM). Muscle freshness is a decay curve — 100% after seven days
rest, decremented by volume/intensity/recency. Exactly the kind of engine
Terav already runs. What works: feels responsive, exercise-swap is popular.
What breaks: their docs concede it "can't account for external stress —
poor sleep, illness, life demands." That is the gap Terav's note-signals
targets. Fitbod closed it not with rule learning but with Apple Health /
Whoop ingest. Paid.

**Whoop (readiness).**
Per-user calibrated by design. Compares nightly HRV, RHR, respiratory rate,
sleep against your own 14-day rolling baseline — never a population norm.
Cold start is a 4-day window. Phase C done well: cheap rolling statistics,
defensible framing ("we compare you to you"). What breaks: the 14-day
window is opinionated; users with non-stationary lifestyles (shift work,
new parents) complain the score never stabilises. Paid.

**Strava Fitness & Freshness.**
Textbook Bannister impulse-response from 1975. Fitness = long EWMA of
training load. Fatigue = short EWMA. Form = fitness minus fatigue. Zero
learning. Personalisation comes entirely from user's own history. What
works: interpretable, cheap. What breaks: single scalar for a
multidimensional reality — sprint vs. endurance, strength vs. skill all
collapse. Users ignore it during hard blocks. Free + Premium.

**Runna (running).**
Adapts pace targets from completed workouts plus rules for interruptions,
heat/humidity, self-reported illness. The 2025-26 "Adapt for Heat" release
is the tell: they hand-coded a rule, not a model. Manage-Plan UI where the
user picks the adjustment — confirm-first, same mechanic as Terav. Paid.

**Peloton PRs (negative result).**
PRs are a UI feature. No published adaptive scheduling algorithm using
them. For a company Peloton's size, "we don't ship adaptive planning"
is itself a signal about how hard it is.

**Clinical NLP (adjacent).**
Rule-based keyword extraction with association-rule mining — lift as
selection criterion, exactly Phase B — is established practice for
drug-symptom links and heart-failure surveillance. Known failure mode:
manually-tuned regex pipelines overfit fast and rot as vocabulary
drifts. Field consensus: periodic human-in-the-loop drift review, never
autonomous rule mutation.

## 3. What the industry has learned

**Deterministic maths beats "learning" wherever there is a physiological
identity.** MacroFactor (energy balance), Strava (impulse-response),
Whoop (rolling z-score against personal baseline) all get away without
ML because the underlying model is a physics identity plus a smoother.
Terav's TM math + AMRAP progression is in this camp; it does not need
learning to be adaptive.

**Rule-tuning from logs is real but is done by humans on a review
cadence, not autonomously.** The chatbot / NLU literature is explicit:
production log analysis produces "un-handled intents" reports that a
human then triages — add sample, merge intent, retire intent. Nobody
credible ships autonomous rule editing from correlation alone; the
false-positive risk is too high. Phase A (surface unmatched keywords)
is a well-worn pattern. Phase B (correlation lift → rule promotion) is
where discipline is required.

**The classifier upgrade path is real and expensive.** TrainerRoad is
the honest case: they hit the ceiling of rules and moved to a
survey-plus-power ML classifier. That took a team, years, and it is
still visibly imperfect in their own forum. If Terav's rules ceiling
turns out to be low, the successor is not "add an LLM" — it is a
small classifier per outcome (e.g. red-day prediction) trained on
per-user data. That is Phase C+, and it is far cheaper than an LLM,
but it is not free.

**Per-user calibration is the single highest-leverage move and it is
often the cheapest.** Whoop's whole differentiator is "compare you to
you." Same idea maps directly onto Terav notes: "the words this
particular user writes on red days" is far more useful than a global
keyword list. The maths is a rolling per-user contingency table plus
a simple lift score — no ML, no LLM, no training.

**The keyword list will rot, and that is the actual maintenance
burden.** Clinical-NLP writeups are unanimous. Vocabulary drift, jargon
adoption ("wrecked" fades, "cooked" arrives), and single-user
idiosyncrasy all erode a static list. This is a recurring janitorial
task, not a one-time build.

**Surprising finding: TrainerRoad and Fitbod both keep asking a
post-workout survey.** Even with power meters and full lift logs, they
still want a self-reported subjective rating because the machine
signals alone don't disambiguate "hard because unfit" from "hard
because sick." Terav's confirm-first Accept mechanic already collects
this; the note is the survey. That is a structural advantage worth
protecting.

## 4. What this suggests for Terav

**Defensible path 1 — Ship Phase A as a founder-facing dashboard, not a
learning system.** Weekly cron produces an "unmatched keyword report":
tokens appearing in notes with frequency above a threshold that the
regex list doesn't catch. The founder reviews it in ~10 minutes,
promotes real signals, ignores noise. This is the chatbot-industry
consensus pattern. Zero user-facing risk, high signal, tiny cost.

**Defensible path 2 — Phase B as *proposal generation*, not
auto-adoption.** Compute lift for each candidate keyword against
red-state days across the population. Rank. Surface the top-N to the
founder with the evidence (co-occurrence counts, sample notes). Founder
promotes to the rule set manually. This is the "correlation lift as
selection criterion" pattern from clinical NLP, kept honest by keeping a
human in the loop. Do not let the engine promote its own rules; the
false-positive risk (spurious correlations with confounds like weekday,
cycle phase, holidays) is enormous at Terav's beta-scale sample size.

**Defensible path 3 — Phase C is a per-user rolling baseline, not a
classifier.** For each user, keep a 30-90 day rolling frequency table
of tokens on red vs green days. Weight the global rule by the
user-specific lift. This is Whoop's playbook applied to text. It is
still deterministic maths; it is per-user; it degrades gracefully with
sparse data.

**Anti-pattern to avoid — autonomous rule mutation from small-N
correlations.** Terav is a beta with maybe tens of users. Any process
that lets the engine silently promote a keyword because lift crossed a
threshold will absolutely learn spurious rules ("padel → red" might
really be "Sunday → red"). Both the clinical-NLP and the chatbot
literature warn against this. Every rule change should require a human
promotion step until N is large enough for cross-validated confidence
intervals to be meaningful. That threshold is probably four figures of
users, not two.

**Where LLMs actually earn their place, if ever.** The founder's Phase D
framing is defensible but slightly off. The best use of an LLM here is
not "novel phrasing fallback" but "quarterly review helper" — feed the
unmatched-keyword report and a sample of raw notes to a batch LLM call,
ask it to cluster and propose candidate rule additions with example
sentences. Cost is bounded (one batch job per quarter), risk is
bounded (founder still approves), and it is not in the hot path. This
is a cheap add whenever Phase A's founder-review time exceeds
~30 min/week.

## 5. What we still don't know

- **Sample size.** Terav's actual note volume per week is unstated. If
  it's under ~200 notes/week, Phase B correlation numbers will be too
  noisy to act on; Phase A alone is the correct scope.
- **User-vocabulary overlap.** We do not know how much users share
  vocabulary. If it's high, a global list is fine. If it's low, Phase C
  becomes critical earlier than expected. A one-week experiment
  computing pairwise Jaccard on user token sets would answer this.
- **Red-state ground truth quality.** All the correlation work depends
  on the red / amber / green label being trustworthy. If red is inferred
  from a symptom-score threshold the user chose, the label is noisy in a
  way lift analysis will amplify.
- **Confound density.** Weekday, session count, phase of programme, and
  external stress will co-vary with keyword occurrence. Whether Terav
  can meaningfully control for these at beta scale is untested.
- **Whether users read the "Because: {log signal}" citations.** If they
  don't, the whole premise that the engine's transparency is a
  differentiator weakens.

## 6. Recommendation

**Phase A: worth building now.** Unmatched-keyword weekly report to the
founder is the highest ROI item in this brief. Chatbot industry
consensus. Days of work, near-zero user-facing risk.

**Phase B: needs more research, then build as founder-facing proposals
only.** The maths is well understood (lift, chi-square, mutual
information). Ship it as a report, never as autonomous mutation.
Revisit the auto-promotion question when N > 1,000 users.

**Phase C: worth building, but only after Phase A shows the global list
is actually incomplete.** Per-user calibration is the strongest
positioning move (Whoop-style "we compare you to you") but implementing
it before the global list is even mature is premature optimisation.

**Phase D (LLM): almost-certainly-not-in-hot-path.** The evidence from
MacroFactor / Strava / Whoop is that deterministic maths beats "smart"
in this space. Reserve LLM for a bounded quarterly review job, not
real-time interpretation.

**Overall verdict: the founder's premise is correct.** Adaptive
rule-tuning from logs, without an LLM in the hot path, is not just
possible — it is what the successful adaptive apps in this space
actually do. The risk is not "will it work" but "will you resist
adding autonomous mutation before you have the sample size to justify
it." Keep the human in the loop until the numbers make that human
unnecessary. That threshold is far away.
