# Concern D — Cross-user note-signal learning

Research brief, 2026-08-17. Prior art on aggregating free-text health notes
across an entire user base to improve a shared engine. Superset of Concern B
(per-user rule tuning), which was validated as worth-building. This brief
asks whether the population-wide version is defensible too.

## 1. The question, restated

Should Terav aggregate parsed note-signals — and possibly raw anonymized
note text — across the whole user base to discover novel keywords, compute
population-scale keyword lift, cluster co-occurring bundles, and feed the
findings back into `note-signals.ts` for everyone? Founder intuition:
population signal makes a "huge difference" vs. per-user. Founder guardrail:
human review before any rule promotion. Founder known concern: ToS and
GDPR consent.

The real question isn't "should Terav learn from notes" — Concern B said
yes, per-user. It's "should Terav learn from *other people's* notes to
help you." Different privacy contract, different legal exposure, different
technical shape.

## 2. Comparable apps and patterns studied

**Whoop Journal (behavior insights).**
The closest live precedent. Users log ~300 behaviors from a fixed catalog
("alcohol," "caffeine," "reading before bed") plus free-text notes. Whoop
publishes population-level findings from aggregated Journal data ("alcohol
→ RHR +6 bpm, HRV -15 ms, Recovery -16%"). Individual insight requires
5 yes / 5 no per behavior in a 90-day window. Two choices matter: taxonomy
is fixed by Whoop, and aggregation is over structured toggles, not free
text. Even with millions of users, Whoop still compares each user to their
own 14-day baseline, not a cohort. Cross-user aggregation is used for
marketing and taxonomy discovery, not individual scoring.

**Strava Metro (aggregated behavioral data as product).**
Opt-in only, city-level aggregation, personal identifiers removed, cannot
be resold, cannot power ads. GDPR/CCPA compliant by construction because
outputs are aggregate statistics, not user records. This is the gold
standard for "we aggregate user behavior to build a shared product" — and
it took Strava years of privacy work to earn it.

**Strava heatmap 2018 (the counter-example).**
"Anonymized" activity heatmap exposed the perimeters and patrol routes of
undisclosed military bases including CIA black sites in Iraq, Syria, and
Afghanistan. The individual records were stripped of names and dates.
Aggregation itself became the disclosure vector. Strava had to rebuild
privacy settings, review every feature for adversarial misuse, and publish
a public apology. Text notes carry the same structural risk: aggregation
reveals patterns whose sensitivity the original per-record de-identification
missed.

**MyFitnessPal food database (crowdsourced, low-moderation).**
20.5M entries, 23.1% error rate by audit — vs. 0.4% (PlateLens) and 0.9%
(Cronometer). Cautionary tale for "let user input flow into a shared
resource without moderation." MFP eventually paid for Nutritionix as a
verified overlay. Terav parallel: unmoderated population keyword promotion
would import every user's idiosyncrasy into everyone's engine.

**Flo Health (FTC settlement, 2021).**
Flo told users their period/pregnancy data was private, then shipped events
labeled "Pregnancy" to Facebook, Google, and other analytics SDKs. FTC
required: an independent privacy review, explicit consent before any
health-data sharing, notification to affected users, and destruction orders
sent to every downstream recipient. The lesson isn't "don't share data" —
it's "the gap between what your privacy policy says and what your pipeline
does is the enforcement surface." Any "we aggregate notes to improve the
engine" line in a Terav ToS creates a matching operational obligation.

**23andMe (breach + bankruptcy, 2023-25).**
Not a cross-user aggregation failure per se, but the destination case
study. Company holds Article-9-adjacent data on ~7M users. Credential
stuffing → 14K account compromise → 7M downstream exposure. Multiple state
AG lawsuits, $50M settlement, $18M NY settlement, then bankruptcy raised
the question of *what happens to the data trove in a sale*. AGs and the
FTC formally objected. The lesson for a beta-stage founder: any centrally
stored corpus of free-text health notes is an asset with a negative option
value — you can't destroy it fast enough if things go sideways, and
acquirers/creditors have their own view on what it's worth.

**Oura's aggregation policy.**
Uses aggregated de-identified data for product improvement and community
statistics. Two safeguards: no cohort statistic is published if the group
is too small to preserve anonymity ("thousands of users or more" —
k-anonymity in practice), and consent is withdrawable via settings with a
stated processing-stop SLA. Every business use is opt-in.

**MacroFactor.**
Uses population data only at cold start (formulas from population studies
seed the initial TDEE estimate) and then abandons it — every subsequent
recalculation is from your own data. Its 2024 v3 revision made the algorithm
"structurally more robust," not "trained on more users." This is a
deliberate architectural choice: the population improves the *default*,
not the *ongoing prediction*.

**TrainerRoad Adaptive Training.**
The one honest ML-on-population example in this space. Trained on millions
of activities plus per-workout surveys to classify workouts into seven
energy systems and derive Progression Levels. Works because the input is
structured (power files) not free text, and the output is bounded
(pass/fail/super-pass). Even so, users complain the classifier is blunt and
early-plan workouts feel too easy. Two lessons: population ML pays off when
the input is structured and the output is bounded, and even a well-executed
version doesn't eliminate user friction.

**Clinical NLP re-identification research.**
The academic verdict on "anonymized free text" is uncomfortable: state-of-
the-art autoregressive infillers can re-identify de-identified clinical
notes at meaningful rates, and membership-inference attacks work against
NLP models trained on private text. The 2025 survey concludes de-identified
free-text notes remain a residual-risk asset — anonymization reduces
disclosure risk, it doesn't eliminate it. Free-form notes with life detail
("father died," "hangover," "job stress") are exactly the class of text
that resists safe anonymization.

## 3. What the industry has learned

**Aggregation-as-product only works when the aggregate is the product.**
Strava Metro succeeds because urban planners want city-level trip counts,
not user records. Whoop's Journal population trends succeed because they
publish "alcohol → -16% Recovery," not "here are Sarah's notes." The
moment aggregate signal is fed back into individual scoring, the
justification for aggregation weakens — you now need per-user data
anyway.

**Structured toggles beat free text for cross-user signal.** Every
successful cross-user learning system in this list (Whoop behavior tags,
Strava activity types, TrainerRoad power files, MacroFactor weights)
consumes structured inputs. Free text is aggregated for *taxonomy
discovery* (what should the next toggle be?), never as the raw input to a
population model. This is a strong pattern.

**"Anonymized" is a description of intent, not a technical guarantee.**
Strava heatmap, 23andMe breach, clinical-NLP re-identification research
all point the same way: stripped-identifier text still leaks, and
aggregate stats over small-N text still leak. The regulatory posture
under GDPR Article 9 assumes it: health data requires explicit consent
even in de-identified secondary use, and DPAs have started treating
"anonymized health data" as a claim to be audited, not an exemption to be
invoked.

**Cross-user signal at beta scale is thin.** Whoop still needs 5-yes/5-no
per user per 90 days *at their scale*. TrainerRoad needed millions of
activities. MacroFactor, Fitbod, and Runna all stabilize on individual
data, not cohort. The founder's "huge difference" premise is empirically
weakest at Terav's current N (tens of users) and only starts paying off
at 4-5 figures of weekly note-writers.

**The consent-gap problem is the actual failure mode.** Flo Health
wasn't sued for bad ML; it was sued for the gap between its privacy
policy and its pipeline. Concern B, done as a per-user founder-review
dashboard, has zero consent gap. Cross-user aggregation opens one the
moment any user's note text or parsed signal moves off their account
into a shared corpus.

**Life-detail contamination is inevitable in free text.** Users write
"hangover," "father's funeral," "up with the baby," "kidney stone
passed today." That is Article 9 sensitive data on health, family, and
mental state — regardless of whether Terav was designed to elicit it.
The regex extractor strips a token and moves on; a shared corpus for
founder review means the founder is now custodian of mental-health and
bereavement data on identifiable users.

## 4. What this suggests for Terav

**Defensible path 1 — Aggregate the *unmatched keywords*, not the notes.**
Weekly job on each user's device (or in their scoped worker) emits *token
counts* of words that didn't match the regex list, plus the label they
co-occurred with (red/amber/green). No note text leaves the user's
storage. The founder reviews a global histogram of "words we're missing,
ranked by co-occurrence with red days." This is exactly Concern B's
Phase A pattern, but with population-level frequency counts as the input
signal — enough to catch "cooked" or "wrecked" trending across many
users, without shipping any note text or any user attribution. This is
Strava-Metro-shaped: the aggregate is the deliverable.

**Defensible path 2 — Whoop-style *behavior insight*, not note learning.**
If the founder wants a population-scale differentiator, the honest move
is to graduate frequent free-text tokens into *structured toggles* over
time. "Slept < 5h," "travelled," "alcohol yesterday," "period week,"
"back tweaked." Users tap toggles; toggles feed the engine; toggle stats
aggregate cleanly and consent cleanly. Free text stays as the discovery
channel for the next toggle, not as the substrate of the learning.

**Defensible path 3 — Publish the aggregate as marketing, not as engine
input.** Whoop's "alcohol → -16% Recovery" line does more for its brand
than any per-user learning ever will. Terav could compute, once, quarterly,
population-level lift for a small number of pre-consented structured tags,
publish it as content ("what Terav users learned this quarter"), and use
that as a positioning artifact. Aggregate is output, not input.

**Anti-pattern to avoid — shipping raw or lightly-anonymized note text
into a shared corpus for founder review or model tuning.** This is the
highest-risk single decision on Terav's roadmap: GDPR Article 9 requires
explicit consent, notes will contain bereavement / mental-health / substance-
use signal the app didn't ask for, free-text anonymization has no
defensible technical guarantee, and one breach turns it into Terav's
23andMe moment. Concern B's Phase C (per-user rolling table of that user's
own token lift) delivers most of the differentiator with none of this
risk. And the human-in-the-loop guardrail from B becomes structurally
impossible to enforce at population scale — the founder can't review the
provenance of every corpus entry once N grows.

## 5. What we still don't know

- **Note volume per week.** Under ~500 note-writing sessions/week
  cross-user, population lift is dominated by noise; Path 1 becomes
  redundant with Concern B's per-user version.
- **Vocabulary overlap across users.** If Jaccard on token sets is >0.5,
  a global list catches almost everything and aggregation adds nothing.
  If <0.2, per-user calibration dominates. Either way, cross-user is the
  weaker option; we don't know how weak.
- **Whether beta users would consent.** Estonia's medical culture is
  privacy-cautious; the founder's own `CLAUDE.md` constraint ("no name /
  isikukood / provider names") suggests he already knows the answer for
  the current cohort.
- **Founder time budget.** Concern B Phase A already estimated ~30 min/week
  at beta scale for one user's data. Cross-user multiplies review surface
  without proportionally improving decisions.

## 6. Recommendation

**Almost-certainly-a-mistake at current scale.** The founder's premise —
that cross-user aggregation makes a "huge difference" — is not supported
by the evidence. Whoop, MacroFactor, Fitbod, Runna, and TrainerRoad all
extract most of their adaptive value from *per-user* signal, use
population data mainly to seed defaults and generate marketing content,
and aggregate free text only for taxonomy discovery. Beta-scale N makes
cross-user statistics too noisy to act on, while the regulatory,
reputational, and operational cost of a shared note corpus is high and
front-loaded.

**Cross-reference to Concern B:** Concern B validated per-user (Phase C
Whoop-shaped rolling baselines) as the right adaptive-learning move.
This brief argues the population version is not a superset with more
signal — it's a different product with materially worse risk/reward.
Ship Concern B's Phase A-C first. Revisit cross-user aggregation only
after (a) N > ~1,000 active weekly note-writers, (b) explicit opt-in
consent flow is built and audited, (c) structured toggles have been
introduced as the primary aggregation substrate.

**The one narrow path that is defensible now:** *Aggregate parsed
unmatched-token *counts* only — never note text — as a founder-review
dashboard for regex improvements.* This is a strict subset of the
founder's proposal, with the risky surface (text corpus, cluster
analysis, novel-phrase discovery via LLM) removed. It fits inside
Concern B's Phase A guardrail cleanly and adds population frequency as
a ranking signal, nothing more.

## 7. Minimum viable consent language

For the one defensible near-term path (aggregated unmatched-token counts,
no note text leaving the user's account), the following opt-in prompt is
the minimum defensible surface. It is written as a standalone toggle
under Settings → Privacy, unchecked by default, presented once at
onboarding as a skippable step.

> **Help improve Terav's engine (optional)**
>
> Terav reads your training notes locally to detect signals like "tired,"
> "strong," or "pain." If you turn this on, once a week Terav will send
> us a *count* of words in your notes that our engine didn't recognise,
> and whether that day was a green, amber, or red day. Example: `cooked:
> 3 times, 2 on red days`.
>
> **We will not send:** the note itself, the sentence around the word,
> your name, your email, or anything that identifies you or the day.
>
> **We will use this only to:** improve the words Terav's engine
> recognises for everyone. You will see the changes in the next app
> update.
>
> **You can turn this off at any time.** If you turn it off, we will stop
> collecting new counts within 7 days and delete the counts we already
> have within 30 days.
>
> [ ] I agree to share unmatched-word counts with Terav.
>
> This is separate from your Terav account. You can use Terav fully
> without turning this on.

Structural properties this language commits to and Terav must therefore
build:
- Opt-in, unchecked by default (GDPR Article 9 explicit consent)
- Granular (this toggle *only* covers unmatched-token counts, not raw
  text, not parsed signals, not any other future use)
- Separate from the account contract ("You can use Terav fully without
  turning this on")
- Withdrawable with a stated SLA (Flo Health lesson: policy must match
  pipeline)
- Names the *exact* data shape being sent, in a concrete example the
  user can visualise
- Names the *exact* purpose, no "and other product improvements"
  weasel-phrase

If Terav later wants to aggregate *note text* or *parsed signals* for
model training or founder-review corpus building, that requires a
*separate* consent prompt with its own explicit language, its own
opt-in, and — realistically — a DPIA (Data Protection Impact Assessment)
before it ships. Do not stack that on top of this consent later without
re-prompting every user; that is the Flo Health failure mode.

Sources:
- [Whoop Journal — behavior insights and population findings](https://www.whoop.com/us/en/thelocker/a-new-way-to-see-insights-on-which-behaviors-affect-your-recovery/)
- [Whoop 2021 Year in Review — population statistics example](https://www.whoop.com/us/en/thelocker/2021-year-in-review-insights/)
- [Strava Metro — anonymised aggregated data policy](https://www.globenewswire.com/news-release/2020/11/24/2132700/0/en/Strava-Debuted-a-Metro-Service-to-Provide-Anonymous-Data-for-Urban-Planners-and-Transport-Managers.html)
- [Strava heatmap military bases scandal (2018)](https://www.mapulus.com/blog/strava-fitness-tracker-military-secrets-location-data)
- [MyFitnessPal database quality — crowdsourced entries and error rates](https://nutrition-research-review.com/articles/database-quality-nutrition-apps-2024/)
- [FTC — Flo Health settlement (2021)](https://www.ftc.gov/news-events/news/press-releases/2021/01/developer-popular-womens-fertility-tracking-app-settles-ftc-allegations-it-misled-consumers-about)
- [California AG lawsuit — 23andMe data breach](https://oag.ca.gov/news/press-releases/attorney-general-bonta-sues-chrome-holding-co-formerly-known-23andme-over-2023)
- [Oura Ring — privacy policy on aggregation](https://ouraring.com/privacy-policy)
- [MacroFactor algorithm philosophy — Stronger by Science](https://www.strongerbyscience.com/macrofactor-algorithms-philosophy/)
- [TrainerRoad Adaptive Training — machine learning approach](https://www.trainerroad.com/blog/introducing-adaptive-training-the-right-workout-every-time/)
- [Clinical NLP re-identification risk survey (2025)](https://arxiv.org/pdf/2508.21587)
- [Re-identification of de-identified documents via autoregressive infilling](https://arxiv.org/pdf/2505.12859)
- [GDPR Article 9 — legal basis for health-data processing](https://gdpr-text.com/read/article-9/?lang1=en)
- [GDPR consent requirements for fitness apps and health data](https://gdprlocal.com/gdpr-for-wearable-technology/)
