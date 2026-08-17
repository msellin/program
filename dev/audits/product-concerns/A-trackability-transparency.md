# Concern A — Trackability transparency

Research brief. 2026-08-17. Prepared for Terav founder decision on whether to build
"Sharpness A/B/C/D" grade per program.

## 1. The question, restated

Terav's adaptive engine is genuinely uneven. For 5/3/1 it sees training-max math,
AMRAP reps, RPE, symptom score — enough to close a real feedback loop. For handstand
walk it sees a self-reported drill score and not much else. The founder wants to
declare that unevenness on the surface, per program, with a letter grade
("Sharpness A/B/C/D") and a checklist of user actions that raise the grade ("log HR
+1", "connect wearable +1", "video the retest +1").

The instinct is anti-marketing: instead of pretending the engine is equally smart
across all programs, show the seams and turn them into a to-do list.

Question: has anyone shipped this shape of transparency in fitness, rehab, or
productivity SaaS? Does it work? Or is the industry norm — hide the seams, market
as omniscient — actually the correct answer?

## 2. Comparable apps studied

**Whoop.** Ships a Recovery score every morning (0–100, green/yellow/red). Own
materials call Recovery "directional, not diagnostic," but the UI shows one
confident number with no confidence interval; strap-off days just disappear from
the timeline. What Whoop *does* ship that's on-shape: the Journal + Monthly
Performance Assessment. Users tag 300+ behaviours (alcohol, caffeine, read before
bed) and after 5 yes-days + 5 no-days in a 90-day window Whoop reports the
correlation with Recovery/Strain/Sleep. That's a per-behaviour "we have enough
data to say something" gate — the closest industry analog to the founder's idea.
Reviewer reaction is positive; the Journal is treated as the power-user feature
that retains engaged users. Whoop still doesn't grade the underlying algorithm's
confidence — only whether it has enough journal entries to correlate.

**MacroFactor.** No adherence score, no coaching quality grade. Deliberate — the
app is explicit that its algorithm works regardless of adherence and refuses to
shame or gamify it. Weekly the coach re-tunes calories from trend weight vs.
logged intake. The transparency it offers is different: it shows the inferred
expenditure and derives the calorie target from it visibly. Signal is "here's
the math we ran on your logs" not "here's how good your logs are." Reviewers
credit the no-shame stance for retention. Instructive counter-example: deliberately
does not grade the user, and users love it.

**TrainerRoad Adaptive Training.** Ships Progression Levels — one number per
power zone (Endurance / Tempo / Sweet Spot / Threshold / VO2 / Anaerobic / Sprint)
that moves up on successful completion above current level and down on failure.
Exactly Terav's per-program shape, but inverted: TR grades the athlete per
discipline, not the engine per program. Users implicitly see where the engine has
real data (zones they train) vs. inferred (zones they don't). Reception broadly
positive; common criticism is that AT is too conservative — symptom of the engine
overtrusting sparse data. Nobody complains the seven-zone breakdown itself is
confusing.

**Runna.** Medium/TechRadar/Trustpilot reviews converge on one criticism: even
following the plan perfectly with a HR monitor, Runna won't tell you if the
prescribed easy pace is actually easy or threshold is threshold. HR is displayed
for user interpretation and does not influence the plan. Opposite pattern to what
Terav is considering — Runna hides that its engine is pace-only, reviewers
notice, holds it against them. Strongest existence proof that *not* declaring
engine limits gets punished at review time.

**Strava Premium (Fitness & Freshness).** Requires Relative Effort (HR or
perceived exertion) or Training Load (power). With neither, the chart is blank for
that activity — but Strava documents the fallback: with 10+ rides having both
metrics, a per-athlete best-fit fills gaps. UX quiet, help pages explicit. Gates
the feature on data quality without a letter grade — silent unavailability +
documented fallbacks.

**Duolingo.** Two cautionary case studies. (1) The original Skill Strength bar
decayed with time and refilled with practice — explicit per-skill confidence.
Removed in the 2018 Crown update; a third-party Chrome extension exists because
users missed it. (2) The 2022 Path rollout removed the tree entirely for a
linear path. Massive backlash — HN threads, Change.org petitions, one-star review
campaigns. Users *want* per-unit progress transparency; hiding it is punished.
Duolingo removed the strength bar because time-decay felt punitive, then had to
re-invent unit visibility differently. Directly relevant to Terav: the risk is
not "will users understand a per-program grade" but "will a low grade feel like
scolding."

**Kneesovertoesguy ATG Online.** Coaches per-user asynchronously via video
review. No engine grade — human coaching + program library. Reviewers praise
"regress or progress every exercise, no rush to next phase." ATG never claims to
know how ready you are — hands judgement to user and coach. Terav's equivalent
move: don't fake omniscience, hand ambiguity back with structure.

**LinkedIn Profile Strength.** Canonical case for "here's what we don't know,
here's how to close it." Reported 55% lift in completion. Pattern: named states
(Beginner → Intermediate → All-Star), specific-action checklist, immediate
visible progression per action. Closest structural analog to the founder's
Sharpness proposal.

**Notion / Linear AI connector.** Publishes exact retrieval limits: last year of
issues, latest 50 comments/labels per issue, no milestones. Transparency of
retrieval scope, surfaced in documentation, not UI. Tool graded, not user.
Debugging happens in support forums.

## 3. What the industry has learned

**Pattern that works: grade the *data*, not the *user*.** LinkedIn Profile
Strength, Whoop Journal Monthly Assessment, TrainerRoad Progression Levels,
Strava's transparent fallback math all share one property — the number reflects
what the system knows, and improvement is a mechanical action the user takes
(add a job, log a behaviour 5 times, complete a zone workout, add a HR strap).
None of them frame the number as "you are a B-grade user."

**Pattern that backfires: hidden limits.** Runna's pace-only engine, Oura's
opaque readiness weights, Whoop Recovery presented without confidence interval —
these all draw the same criticism ("I don't trust it, I don't know when it's
wrong"). The critics are the exact people fitness apps want to keep: engaged,
data-literate users who will churn if they conclude the algorithm is faking
certainty.

**Pattern that backfires harder: grade the user's compliance.** Duolingo's
decayed Skill Strength felt punitive because time-since-practice made the bar
go down. MacroFactor explicitly rejects adherence scoring and gets credit for
it. The signal is asymmetric — showing "we know less about you than we'd like"
is fine; showing "you have been bad" is not.

**Surprising finding: gap-transparency is a retention feature, not an honesty
feature.** LinkedIn's 55% completion lift is the standard result. Whoop
Journal correlations lock power users in. The framing "here's what we don't
know, here's how to help us know it" is a Zeigarnik-effect-driven engagement
mechanic. The honest-marketing benefit is a bonus; the primary value is that
each grade-raising action is a discrete on-ramp to deeper engagement.

**One meta-finding across every case:** the surface that surfaces the gap has
to be *specific and actionable*. A generic "your data quality is low" makes
users feel scolded and helpless. "Connect a HR monitor to unlock threshold
pace calibration" gives them the exact click to make. LinkedIn's checklist,
Whoop's Journal 5-yes-5-no gate, TR's per-zone level all follow this rule.
"Sharpness B, log HR to raise" follows this rule. "Sharpness C because we
don't have wearable data" does not — because "wearable data" is not a click.

## 4. What this suggests for Terav

Three defensible paths, one anti-pattern to avoid.

**Path 1 — Per-program engine confidence, no letter grade.** Show a small
"the engine sees" line per program: "5/3/1 — TM math, AMRAP, RPE, symptom" vs.
"Handstand walk — self-reported drill score." No A/B/C/D, just literal
enumeration of the signals. Below it, a "the engine would additionally use"
line with actionable connections. Closest to how Strava documents Fitness &
Freshness fallbacks and how MacroFactor shows its inferred expenditure. Low
risk, honest, no scolding possible. Weakest gamification pull.

**Path 2 — Sharpness grade as proposed, but frame it as *program-level*
engine capability, not user compliance.** Bind the letter to the program's
current signal set, not to the user's logging behaviour. "5/3/1 is at
Sharpness A because we see all four inputs. Handstand walk is at C because
this discipline currently only has drill-score input; that's a program
limit, not yours." Then a checklist: "video the retest → raises this
program to B for you specifically." This threads the LinkedIn pattern
(specific action = visible level bump) through the Runna cautionary tale
(don't hide the engine's ceiling). Highest engagement upside if the copy
is right.

**Path 3 — No public grade, but a private "would you get more from Terav if
you did X" nudge triggered on real signal.** Whoop's Journal pattern —
correlate silently, surface the recommendation when the correlation is real.
"You've logged HR three times and each time your RPE was 2 points lower than
predicted. Log HR every session and 5/3/1 will start using it." This is
harder to build (needs Concern B's rule-tuning first) but has the deepest
long-term moat because the nudges are earned from that user's own data.

**Anti-pattern: a Sharpness grade that decays.** Do not build a bar that
goes down because the user hasn't logged in three days. This is the exact
mistake Duolingo made with Skill Strength and MacroFactor deliberately
refuses. Grade the signal set, not the recency of use.

**Copy risk to name explicitly.** The letter "D" is toxic in an English-
speaking market and reads as failing. If Path 2 is chosen, use tier names
that are neutral or additive — "Baseline / Calibrated / Full" or the
existing sword/edge metaphor from the Terav brand ("Blunt / Honed / Sharp
/ Razor") — anything except A/B/C/D. The founder is Estonian, the market is
international; the letter grade would need translation review anyway.

## 5. What we still don't know

- **Would Terav users perceive Sharpness as clarity or as scolding?** No
  research surveyed answers this for a *voluntary supplemental* training
  app (Terav's positioning). Duolingo/LinkedIn evidence is from apps
  users treat as their primary tool. Users running Terav alongside CrossFit
  might read a "C grade" as "why bother."
- **Does per-program transparency actually differentiate at the top of the
  funnel, or only after signup?** LinkedIn's 55% lift is post-signup. No
  public case study shows "we told the market our engine is uneven and it
  won us signups." Founder's honesty-as-marketing bet is unvalidated.
- **What's the minimum data set at which each program's Sharpness would
  *plateau*?** Handstand walk may genuinely have no path to A no matter
  what the user logs, because the underlying skill has no HR / velocity
  correlate that matters. Grading it C forever might be honest but
  demotivating. Needs a per-program ceiling map before shipping.
- **Does the mechanic conflict with confirm-first?** If the engine's
  proposal is only as good as its Sharpness, does a low-Sharpness
  proposal need a stronger citation? Or a "low confidence" tag on the
  Accept button? Not answered by prior art.

## 6. Recommendation

**Worth-building — as Path 1 or Path 2, not the founder's original A/B/C/D
draft.**

The transparency instinct is correct. The prior art strongly supports
grading data over grading users, using specific actions to close visible
gaps (LinkedIn / TrainerRoad / Whoop Journal), and paying a penalty for
hiding engine limits (Runna, Oura). The risk zone is entirely in
execution: the letter A/B/C/D scale carries school-grade baggage, and
any grade that decays with inactivity replicates Duolingo's mistake.

Ship Path 1 first — the literal "engine sees" enumeration — because it's
cheap, honest, and unblocks marketing copy without any risk of scolding.
If early users click on the "would use" line to close gaps, that's the
signal to promote it to Path 2 with named tiers (not letters) and per-user
progression. If they ignore it, the founder's honesty-as-differentiator
premise is falsified and the answer is "keep the enumeration in
documentation, drop the UI surface." Either way, cost of learning is one
sprint, not the full grade system.

Do not ship the founder's A/B/C/D as drafted.
