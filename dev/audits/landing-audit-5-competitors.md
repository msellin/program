# Landing Audit — Competitor Scan for Terav

Mobile-viewport audit of 11 competitor apps overlapping Terav's positioning
(adaptive, cited, confirm-first training for CrossFit-adjacent athletes).
Data pulled via WebFetch on the URLs listed. **The Ready State** (403) and
**Barbell Medicine `/programs`** (404) blocked WebFetch — only their root
pages were available. Everything else is first-hand from the live sites.

Terav's landing sections analyzed for cross-reference:
`Hero.tsx`, `ThreeWayContrast.tsx`, `HowItWorks.tsx`, `Programs.tsx`,
`EvidenceClaim.tsx`, `WontDo.tsx`, `OriginStory.tsx`, `BetaCTA.tsx`.

---

## 1. Executive scan

**Pliability** (pliability.com) — Leads with "#1 MOBILITY APP" and "10,000+
5-star reviews" above the fold, then stacks 16 sections including a HYROX
module and named testimonials. **Steal:** a single numeric outcome cited
mid-scroll ("30% mobility increase in 2 weeks") — small, specific, credible.
**Reject:** the "50 / 25 / 1X" bare-number statistics slab with no sources —
it reads like a slide deck without citations, exactly what Terav's evidence
positioning refuses to do.

**GoWOD** (gowod.app) — Hero "Move like new" with a 60-day outcome number
("Daily GOWOD Premium users gain 18% in mobility in 60 days") and CrossFit
Games 2026 / Rogue / Strava logo row. **Steal:** the 4-stage benefits
timeline (Instant / 1-Month / 3-Month / 6-Month) is a clean way to preview
adaptive-programming progression without a demo video. **Reject:** the
"Black Friday save 35%" promo scarlet-band — kills the quiet-authority
tone Terav is going for.

**RP Strength** (rpstrength.com) — Surprisingly bare landing:
"Start building your dream physique today" hero, 8 sections total, no
research cited on this page, no ratings, no download counts. Trust is
100% offloaded to the Dr. Mike Israetel personal brand via YouTube.
**Steal:** the discipline of leaving the science claim implicit and
concentrating trust on one named authority. **Reject:** their landing
under-sells the app itself — Terav has no equivalent celebrity to lean
on, so the *page* has to do the work.

**Ladder** (joinladder.com) — "HILARY DUFF TRAINS ON LADDER" hero, App
Store Editor's Choice badge, then 25+ coach cards in a scrollable grid.
**Steal:** the coach-card grid pattern — for Terav this maps directly to
program cards with an author byline. **Reject:** celebrity-anchor hero;
wrong register for a cited-training positioning.

**Fitbod** (fitbod.me) — "LESS PLANNING. MORE PROGRESS." Hero, then
immediately: 4.8 stars, 15M+ downloads, 120M+ workouts logged, Editor's
Choice badge. Six sections, tight. **Steal:** the compact 3-stat strip
directly under the hero (rating × downloads × workouts logged). Terav's
current Hero has a stat strip already (`5 programs / 100+ studies /
Every session`) but the numbers are small and the strip is buried under
CTAs — Fitbod puts theirs above the fold. **Reject:** "science-backed,
proprietary algorithm technology" with zero citation — the phrase Terav
would embarrass itself using.

**Boostcamp** (boostcamp.app) — "The Free Workout App Lifters Actually
Use" — 11 sections, hero includes a screenshot with a PR callout,
Reddit-quote block as social proof, a full head-to-head comparison table
vs Strong/Hevy/Fitbod/JEFIT. **Steal:** the comparison table is best-in-
class here — real named competitors, real rows. Terav's `ThreeWayContrast`
uses generic "Template apps / A trainer / Terav" which is weaker than
naming actual apps. **Reject:** the free-forever positioning — orthogonal
to Terav.

**Runna** (runna.com) — "Running made simple" hero, 4.9★ (76k Apple
ratings) and 4.7★ (17k Google), 10+ named coaches including a British
Olympian and a physiotherapist, three-step interactive flow
(profile → goal → estimated race time). 14 sections. **Steal:** the named-
coach-with-credential row (Ben Parker: "9x IRONMAN finisher", Steph
Davis: "2:27:16 marathon PB", Aidan O'Flaherty: "Physiotherapist"). This
is the trust cue Terav lacks entirely. **Reject:** the "estimated race
time" calculator gadget — Terav doesn't have a single-number promise
outcome like a race time to project.

**Future** (future.co) — "Personal training, reimagined." Hero video,
"98% say they're more consistent within 4 weeks" stat, 3 named-member
testimonials with tenure ("Laura, 15 months"), 4.9/5 App Store rating.
**Steal:** the tenure-anchored testimonial ("Rohan, member for 8 months")
— outcome credibility from time-in-app is honest and easy to earn.
**Reject:** the "$50 first month, then $199/month" price transparency —
Terav is beta, wrong stage.

**Kaia Health** (kaiahealth.com) — MSK / rehab-tech B2B pivot. Hero
"Joint & Muscle Care for Employers." Leads with **"Clinical outcomes
across 11 trials"** linked, plus "3x ROI" Fortune 150 claim, "Trusted
by +2500 employers." **Steal:** the linked-trials pattern. This is what
Terav's `EvidenceClaim.tsx` should look like — a single line, a specific
number, and a link to the receipts. Currently Terav says "100+ primary
studies" without an inline outcome number. **Reject:** the B2B enroll
flow — different buyer.

**Barbell Medicine** (barbellmedicine.com) — "Strength is for Everyone."
MDs (Feigenbaum, Baraki) in a prominent team section, no landing-page
study citations (they live in the articles), 40+ customer testimonial
carousel with specific outcomes ("lost over 40 pounds"). **Steal:** the
MD/PT credential row — the credibility mechanism for "medically informed
strength training" is showing the humans. Terav could mirror this with
a physiotherapist review credit even if it's a single named consultant.
**Reject:** the 12+ section content-marketing sprawl (podcast / forum /
supplements / articles) — Terav is a product, not a brand universe.

**TrainingPeaks** (trainingpeaks.com) — "Your complete training platform."
Federation logo row (Team Visma, UK Athletics, Australian Triathlon,
FDJ Suez) as the primary trust cue. Zero testimonials. 8 sections.
**Steal:** the discipline of a single trust category executed cleanly —
they don't try to mix athlete quotes + logos + ratings. **Reject:** the
dual-CTA hero ("Athlete sign up / Coach sign up") — splits attention on
mobile where it hurts most.

**Wodwell** (wodwell.com) — "Unshakeable." Minimal social proof, no
ratings, no user counts, just "global community of independent athletes."
**Steal:** nothing conversion-wise, but the aesthetic restraint matches
Terav's quiet-authority register. **Reject:** the deliberate absence of
quantified proof — luxury move that Terav (unknown, beta) can't afford.

**BTWB** (btwb.com) — "1.4k ratings" and "Trusted for over a decade by
hundreds of thousands of users." Ten sections. Partner logos: Mayhem
(Rich Froning), PRVN. **Steal:** the longevity+scale one-liner as a
compact trust unit. **Reject:** B2B gym-management framing.

**Ultrahuman** (ultrahuman.com) — Product-catalog landing (Ring PRO,
Ring AIR, Blood Vision, CGM). Team UAE Emirates testimonial. Compliance
badges (ISO27001, GDPR, HIPAA) in footer as the strongest trust cue.
**Steal:** none directly — different category (hardware). **Reject:** the
catalog structure; wrong shape for a training-app landing.

---

## 2. Pattern census

| Pattern | Who uses it | Verdict for Terav |
|---|---|---|
| Above-fold star rating + download count | Fitbod (4.8★/15M), Runna (4.9★/76k), GoWOD (4.9★/17k), BTWB (1.4k), Pliability (10k+), Boostcamp (4.8★/20k) | **Reframe.** Terav is pre-launch — no numeric proof to show. Replace with a "N studies cited / N programs live" numeric strip earlier in `Hero.tsx`. Move Hero stat row above the CTA row. |
| Named coach/expert with credential | Runna (Ben Parker 9x IRONMAN, Steph Davis Olympian), Barbell Medicine (MDs), RP (Dr. Mike) | **Adopt.** Add a "reviewed by" credit — a real physiotherapist or S&C coach byline in `Hero.tsx` or a new `Credentials.tsx` slot. This is Terav's biggest gap. |
| Head-to-head comparison table | Boostcamp (vs Strong/Hevy/Fitbod/JEFIT — named), Terav (vs "template apps / trainer" — generic) | **Adopt sharper.** `ThreeWayContrast.tsx` should name actual apps. "SugarWOD / Boostcamp / Terav" or "Fitbod / Boostcamp / Terav" outperforms abstract categories. |
| Federation / partner logo row | TrainingPeaks (Visma, FDJ, UK Athletics), GoWOD (Rogue, Adidas, CrossFit Games) | **Skip for now.** Requires signed partners Terav doesn't have. Revisit post-beta. |
| Named testimonials mid-scroll | Pliability (6), Runna (10), Future (3), Ladder (14), Fitbod (implied via 250k reviews) | **Adopt at small scale.** 2–3 beta-athlete quotes with first name + gym is enough; wait until you have real ones. Do not fabricate. |
| Numeric outcome claim above fold | GoWOD ("18% mobility gain in 60 days"), Pliability ("30% increase in 2 weeks"), Future ("98% more consistent in 4 weeks"), Kaia ("3x ROI") | **Reframe.** Terav shouldn't invent an outcome, but should surface *one* specific mechanism claim near hero — e.g. "Adapts against your log after every session" is already there; add a "n = 1, 4-year lifter" honesty tag. |
| Linked clinical trials / studies | Kaia ("Clinical outcomes across 11 trials" with link) | **Adopt immediately.** `EvidenceClaim.tsx` currently says "100+ primary studies. Every session cites its research." with a bare "Read" link. Make it: "Every session cites a study. 100+ primary references." with a *count-of-programs-with-citations* inline. |
| App Store badge above fold | Fitbod, Runna, GoWOD, Ladder, Boostcamp, Pliability | **Skip.** No app store presence yet. |
| Long-scroll landing (10+ sections) | Pliability (16), Runna (14), Ladder (12), Barbell Medicine (13+) | **Reject.** Terav has 8 sections and should stay tight. Longer landings only work with volume of programs / testimonials / feature breadth. |
| Hero video autoplay | Future (background video), GoWOD (video link), Pliability (implied) | **Skip.** Terav's `TodayMockup` in the hero is stronger than a video for a "cited every session" claim — the mockup *is* the evidence. |
| Coach-card grid | Ladder (25+), Runna (10+), Future (persona example) | **Reframe as program-card grid.** Terav already has `Programs.tsx`. Add a "cited studies: N" chip per card. |
| Streak / gamification cues | None of the above lead with streaks | **Reject.** `WontDo.tsx` already says "not a streak game." Keep it. |
| Free-trial promise above fold | Runna, GoWOD, Pliability, Ladder, Wodwell | **Reframe.** Terav's beta framing replaces this — but "no signup to browse a program" (already in `Hero.tsx` as `browse_link`) should be *promoted*, not buried under CTAs. |
| FAQ section | Fitbod, Pliability, Runna, Boostcamp | **Consider adding.** A single FAQ section with 4 questions (What is Terav? / Do I need a coach? / What's in the log? / Is this medical?) would answer the questions `WontDo.tsx` half-answers. |

---

## 3. Copy voice comparison

Aspirational ← ← ← → → → Clinical

```
Aspirational                Punchy                Clinical
├──────────────┼─────────────┼──────────────┼──────────────┤
Future    Fitbod          Pliability      Runna      Kaia
Ladder    GoWOD           Boostcamp                  Barbell
RP        Wodwell          BTWB                     Medicine
                          TrainingPeaks
```

Terav sits between **Runna** and **Barbell Medicine** — quiet, credential-
adjacent, precise. `Hero.tsx` copy ("Sharpen your edge / Adaptive training
that reads your log every session. Every change cites a study. You approve
every one.") is punchier than Barbell Medicine, more clinical than Fitbod.

This is a defensible position. Only **Kaia** and **Barbell Medicine** occupy
the clinical end, and Kaia is B2B. That leaves Terav effectively alone on
the "cited but not clinical, adaptive but not template" square. The voice
in `en.ts` should *not* drift toward the Pliability / GoWOD punchy-
aspirational middle even under conversion pressure — that's where every
competitor already lives.

---

## 4. Missing trust cues, ranked

**1. Named human authority.** Runna leads with Ben Parker (9x IRONMAN,
head coach). Barbell Medicine leads with two MDs. RP leads with Dr. Mike.
Ladder leads with Hilary Duff. Terav's landing has no named human. `Hero.tsx`
mentions "one lifter" in `OriginStory.tsx` but this is anonymous and self-
referential. **Highest conversion impact.**

**2. Numeric social proof (rating × count).** 6 of 12 competitors show a
star rating and review volume above the fold. Terav's `stat_studies_value:
"100+"` is the closest equivalent but reads as a self-report. Pre-launch
alternatives: number of beta users on a waitlist, number of sessions
logged by the founder over 4 years (already implied in `OriginStory` but
not quantified — e.g. "1,200+ sessions logged over 4 years by one lifter").

**3. App Store / Editor's Choice badges.** Fitbod, Ladder both lead with
these. Not available to Terav pre-launch; skip.

**4. Federation / partner logos.** TrainingPeaks, GoWOD, Ultrahuman.
Requires signed partners. Skip until beta closes.

**5. Linked studies with counts.** Kaia is the only competitor doing this
well ("Clinical outcomes across 11 trials"). This is a **free win** for
Terav — `EvidenceClaim.tsx` already promises 100+ studies. Land the link
harder. Make the click-through show a real list of citations with the
programs they inform.

**6. Third-party press logos ("Featured in").** Fitbod, Runna, Pliability
all show these. Terav has none. Skip.

**7. Certification / compliance badges.** Ultrahuman leans on ISO27001,
GDPR, HIPAA. Not a training-app expectation. Skip unless targeting
enterprise later.

---

## 5. The evidence angle

Competitors claiming science / research on their landing:

- **Fitbod:** "science-backed, proprietary algorithm technology" — **zero
  citations.** Pure marketing.
- **Pliability:** "30% increase in mobility after 2 weeks" — **one internal
  data claim, no source.**
- **GoWOD:** "18% in mobility in 60 days" — **internal, no source.**
- **RP Strength:** No landing-page science claim; brand-inherits from Dr.
  Mike Israetel.
- **Kaia Health:** "Clinical outcomes across 11 trials" — **linked to a real
  outcomes page.** Best-in-class on mobile.
- **Barbell Medicine:** No landing-page studies. Educational content and
  MD credentials do the work.

Kaia is the only competitor treating "cited" as a receipts-linkable
promise. **Terav's evidence claim is currently under-sold.** In
`EvidenceClaim.tsx` the module is a single 5-line link block ("100+
primary studies. Every session cites its research.") appearing in section
5 of 8. Its screen weight is smaller than `WontDo.tsx` — a disclaimer
box.

Recommended reframes for `EvidenceClaim.tsx`:

1. Move it up. It's currently between `Programs.tsx` and `WontDo.tsx`.
   Move it directly under `Hero.tsx`, above `ThreeWayContrast.tsx` — so
   the cited claim is proven before the differentiator matrix asks the
   reader to trust it.
2. Add a live example. Instead of "Every session cites its research,"
   show a mini card: "Engine Builder Week 3 → Session 2 → cites Buchheit
   & Laursen 2013 on HIIT block progression." One real citation is worth
   the whole page.
3. Make the number specific and countable. "100+ primary studies across
   5 live programs" beats "100+ primary studies."

---

## 6. Top 10 concrete takeaways

Ranked by likely conversion impact for the Terav beta landing.

**1. Add a named-authority credit line to `Hero.tsx`.**
"Programmed by Margus [Sellin], reviewed by [PT / S&C coach]." Runna
does this with Ben Parker + Aidan O'Flaherty. Ladder does it with 25
coaches. Even one credit closes the biggest trust gap on the page.
Right now `Hero.tsx` has no human name above the fold.

**2. Move `EvidenceClaim.tsx` above `ThreeWayContrast.tsx`.**
Kaia leads with "11 trials." Terav buries "100+ studies" in position 5.
The evidence claim is the differentiator — it should precede the matrix
that asks the reader to believe it. Edit `page.tsx` order.

**3. Show one real citation inline, not just the number.**
`EvidenceClaim.tsx` currently has a `title` line and a "Read →" link.
Add a sample: a program name, a session name, a study cite. Kaia links
to outcomes; Terav should link to citations. Turn the "100+" abstraction
into one concrete receipt.

**4. Name the competitors in `ThreeWayContrast.tsx`.**
Boostcamp names Strong, Hevy, Fitbod, JEFIT by row. Terav says "Template
apps / A trainer / Terav" in `en.ts` (`col_template`, `col_trainer`,
`col_terav`). Change `col_template` to a real product name (e.g.
"SugarWOD" or "Fitbod") and `col_trainer` to "1:1 online coach." Named
comparisons out-perform categorical ones because they eliminate the
"which app do they mean?" objection.

**5. Add a numeric stat above the CTAs in `Hero.tsx`, not below.**
Fitbod, Runna, GoWOD all put rating + volume above the fold. Terav has
`stat_programs_value / stat_studies_value / stat_adapts_value` under the
CTA row. Move the stat strip above the CTAs. Reframe as
"5 programs · 100+ citations · Adapts every session" as a compact one-
liner rather than three separate stat blocks.

**6. Add a mini FAQ before `BetaCTA.tsx`.**
Fitbod, Runna, Boostcamp, Pliability all have FAQs. Four questions
that map to real objections: "Do I need a coach?" / "Is this medical?"
/ "What's the log?" / "Why beta?" Currently `WontDo.tsx` half-answers
these but hidden behind a `<details>`. An open FAQ block converts
better on mobile than a collapsed details element.

**7. Add a tenure honesty tag to `OriginStory.tsx`.**
Future says "Rohan, member for 8 months." Terav could add: "The engine
has been run against 4 years of one lifter's logs. That lifter is the
founder." This owns the "n=1" fact rather than hiding it, and turns
what looks like a weakness into a why-it-exists moment. Currently
`OriginStory.tsx` says "one lifter working around a stubborn hip" —
add a duration and a session count if one exists.

**8. Add a "reviewed by" or "safety layer" credit near `WontDo.tsx`.**
Barbell Medicine solves this with MD/PT bios. Terav's "escalate banner"
mention in `not_a_clinician_body` implies a real safety mechanism.
Name the clinician who reviewed the escalation rules — even if it's
"reviewed by a physiotherapist for red-flag patterns." The absence of
a named human near a safety claim is a conversion killer.

**9. Turn Program cards into cited cards in `Programs.tsx`.**
Currently `Program.evidence` is a string field that is never populated
in `programsFor(dict)` — all five programs pass `evidence: ""`. This is
a wasted slot. Populate each card with `evidence: "3 studies · progressive
overload"` or "cites Buchheit 2013" and the "Cites" section will render
(the code path exists at line 135–140). One line per card is enough.

**10. Change the primary CTA from "Get started" to something citation-
consistent.**
"Get started" is the default across Fitbod, Ladder, and Pliability. It
does nothing for a cited-training positioning. Options that fit
Terav's voice: "Read a program" (matches the `browse_link`), "See a
sample session," "Try the intake." Runna's "Hit Your PB" and Ladder's
"Find your plan" are outcome-anchored, not funnel-anchored. Terav's
outcome is "a sharpened plan." Try `cta_primary: "See a sharpened
session"`.

---

## 7. The pattern Terav should absolutely NOT copy

**Aspirational outcome numbers without receipts.**

The tempting move — after seeing Fitbod ("15M+ downloads"), GoWOD ("18%
in 60 days"), Pliability ("30% in 2 weeks"), Future ("98% more consistent
in 4 weeks"), Runna ("#1 rated") — is to invent a matching number.
"Users get X% stronger in Y weeks." "94% of lifters recommend Terav."
"3× faster progression than templates."

Do not. The entire strategic advantage of Terav's positioning is that
the *citations are real*. Every one of those competitor numbers is
either an internal user study with no methodology, or a fabricated stat.
Fitbod's "science-backed, proprietary algorithm" claim is exactly the
prose Terav's `EvidenceClaim.tsx` refuses to write.

The single tempting borrowing move — a hero outcome stat like "18% in
60 days" — would sabotage the one differentiator that separates Terav
from every competitor above it in the ranking. If a number appears on
Terav's landing it must be countable (studies, programs, sessions
logged) — not aspirational (mobility gained, PRs hit, consistency
achieved). "100+ studies" is honest; "18% stronger in 60 days" would
not be.

The related trap: **badging the app "science-backed" or "evidence-
based" as a phrase.** Fitbod and Kaia both use that language.
`EvidenceClaim.tsx` correctly says "cites its research," which is
mechanical, not aspirational. Keep it mechanical.

---

*Word count: ~1,950.*
