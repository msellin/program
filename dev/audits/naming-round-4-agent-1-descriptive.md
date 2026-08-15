# Naming Round 4 — Agent 1: Descriptive

Angle: **the name describes what the app does.** A prospective user hears the
name and understands the product. No metaphor to translate, no explainer
needed. Verbs and nouns from the domain of adaptive coaching, retesting,
prescription, and calibration.

---

## What past rounds explored (so this round doesn't repeat)

- **Round 1 — three angles:** positioning (tool/edge metaphors: Hone, Whet,
  Temper, Whetstone), linguistic feel, verb-first. Landed on `Hone` in every
  top 3.
  (`naming-agent-1-positioning.md`, `-2-linguistic-feel.md`, `-3-verb-first.md`)
- **Round 2 — sharpen family + CrossFit vocab:** derivatives of "sharpen,"
  and box-floor slang like "dial in," "lock in," "engine," "threshold." Tested
  whether anything beat plain `Sharpen`.
  (`naming-brief-round-2.md`)
- **Round 3 — bilingual problem:** Estonian roots (`Lihv`, `Sätt`, `Serv`)
  vs. English loans that survive both languages.
  (`naming-brief-round-3.md`)

**None of the prior rounds hit the "describes what the app does" register
directly.** They were all evocative — tool metaphors, sharpen-family verbs,
Estonian roots. This round fills that gap: names that read as *functional
labels* for an adaptive, retest-gated, evidence-cited training coach.

---

## Audit — what makes this app distinctively itself

Not marketing fluff. Mechanical distinctives, each grounded in a file I read.

- **Every program cites peer-reviewed studies inside its own JSON.** The
  concurrent-training policy in `engine-builder.json` names Hickson 1980,
  Wilson & Loenneke 2012, Docherty & Sporer 2000 — in-line, in the schema.
  The landing carries an `EvidenceClaim` slot as its own section.
  (`public/data/programs/engine-builder.json`,
  `landing/src/components/sections/EvidenceClaim.tsx`)
- **Retest metrics are declarative and machine-evaluable.** Programs declare
  `retest_metrics[]` with a `source_ref` mini-query language
  (`training_maxes.<lift>`, `runs[].<field> where …`). The retest evaluator
  parses these, computes current vs. baseline vs. target, and gates the next
  phase. This is not a template with retest suggestions in prose — it's a
  gate the code enforces. (`src/lib/engine/retest-evaluator.ts`)
- **Cycle-end evaluation is an actual function, not a screen.** After each
  4-week cycle the engine reads AMRAP performance + symptom state and
  proposes training-max adjustments. It never mutates — it *proposes*, user
  confirms. (`src/lib/engine/adapt.ts`, and the confirm-first rule in the
  user's `MEMORY.md`)
- **Multi-tier programs pick your tier from an honest intake.** Handstand
  Walk has four tiers (Foundation, Wall, Freestand, Advanced); Overhead
  Mobility has three. The intake sets the tier and the drill pace adapts to
  the user's ROM / capability. Not one-size-fits-all.
  (`public/data/programs/manifest.json`)
- **Rehab-native but not rehab-only.** Origin was one lifter's anterior-hip
  rebuild; catalog now spans endurance (Engine Builder, Rowing 2K), skill
  (Handstand Walk, Overhead Mobility), concurrent strength, and rehab
  (Anterior Hip). Provocative positions are respected in the rehab track;
  concurrent-interference windows are surfaced on Today for the endurance
  ones. (`src/app/page.tsx` lines 175-215, `manifest.json`)
- **Daily log drives the plan, not the other way round.** Morning check
  produces a green/amber/red state; Today caps or drops the suggested load
  accordingly; the cycle-end evaluator weighs it against AMRAP data. The log
  is the input, not a passive record. (`src/lib/engine/adapt.ts` state
  aggregation, `synthesis.md` §P1 item 4)
- **Three-step user model, in order: Intake → Today → Progress.** Landing's
  `HowItWorks` names exactly these three, and each renders its own mockup.
  Not "browse workouts, tap start" — "answer honestly, do today, see the
  retest move." (`landing/src/components/sections/HowItWorks.tsx`)
- **Non-negotiable safety rules are surfaced inline, not buried in a
  policy page.** Handstand shoulder-pain rule and concurrent interference
  windows render as banners on Today when the schedule triggers them.
  (`src/app/page.tsx` lines 176-214)

The through-line: **it's a coach that reads what you logged, checks the
retest gate, and calibrates today's session to you specifically — with the
paper it's built on named in the schema.**

That is the surface the name should describe.

---

## Candidates

### 1. Retune

- **Rationale.** Every session retunes the plan against yesterday's log —
  exactly what `adapt.ts::evaluateCycleEnd` does when it proposes new TMs
  from the last 28 days of data. "Retune" reads as ongoing calibration, not
  a one-time setup.
- **Domains.** retune.com — check needed (short common English word, likely
  taken). retune.fit — check needed.
- **Sounds like:** precise, mechanical, honest.
- **Risk.** Adjacent to music/audio, which is a heavy semantic field.

### 2. Retest

- **Rationale.** Retest is the actual gate the code enforces —
  `retest-evaluator.ts` parses every program's `retest_metrics[]` and decides
  when the user is allowed to progress. The name IS the mechanic.
- **Domains.** retest.com — check needed (probably parked/held). retest.fit
  — check needed.
- **Sounds like:** clinical, scientific, exact.
- **Risk.** Reads slightly QA/software-testing (retest a build); needs a
  visual context to snap into fitness meaning.

### 3. Calibr

- **Rationale.** Calibrate is what the intake does (sets baselines) and
  what cycle-end evaluation does (adjusts TMs). Drop the -ate to shorten;
  the truncation reads as a modern brand mark (like `Retro`, `Linear`).
  Ties to the `manifest.json` load hints and phase-progression logic
  where every parameter is fit to the user.
- **Domains.** calibr.com — likely taken. calibr.fit — check needed.
- **Sounds like:** engineered, professional, deliberate.
- **Risk.** "Calibr" without the -e looks like a typo to some readers; also
  Calibre e-reader owns adjacent SEO.

### 4. Prescribr

- **Rationale.** Every program prescribes today's session from your
  answers — the intake sets your tier, `blocksForDate` composes the actual
  blocks (`src/app/page.tsx` line 114). "Prescribe" is the verb;
  Prescribr as a mark keeps it short and coined.
- **Domains.** prescribr.com — likely open. prescribr.fit — check needed.
- **Sounds like:** medical-adjacent, authoritative, precise.
- **Risk.** Medical connotation the founder specifically wanted to avoid
  (naming-brief.md excludes MedTrack / ClinicPath vibes). Prescribr may fall
  on the wrong side of that line.

### 5. Retest Gate → **Gatecheck**

- **Rationale.** Programs progress only when the retest gate passes; the
  gate check IS the loop. `retest-evaluator.ts` is literally the gate. One
  word, two syllables, spellable, no ambiguity.
- **Domains.** gatecheck.com — check needed (probably a security tool).
  gatecheck.fit — likely open.
- **Sounds like:** disciplined, mechanical, gym-competent.
- **Risk.** Reads slightly airport/security; may not carry warmth.

### 6. Logbook

- **Rationale.** The daily log drives the whole system: morning check →
  today's cap → cycle-end proposal (`adapt.ts` + `synthesis.md` P1 item
  4). "Logbook" is the honest label — it's a logbook that reads itself and
  suggests changes.
- **Domains.** logbook.com — taken (aviation / dive). logbook.fit — check
  needed.
- **Sounds like:** trustworthy, analog, no-BS.
- **Risk.** Too generic; sold as a category noun, hard to trademark; also
  under-sells the adaptive engine.

### 7. Coachfile

- **Rationale.** The program JSON is your coach's file on you — every
  program in `manifest.json` carries `who_this_is_for`, `retest`,
  `prerequisites`, adaptive rules. Coachfile names that artifact.
- **Domains.** coachfile.com — check needed. coachfile.fit — likely open.
- **Sounds like:** professional, personal, documentary.
- **Risk.** "Coach" is over-saturated in the market (though the brief only
  banned "fit", "gym", "train", "flex" alone, not "coach"); risks reading as
  a corporate coaching CRM.

### 8. Adjustd

- **Rationale.** The confirm-first engine's job is to propose adjustments
  the user accepts — `adapt.ts::TMAdjustment` is literally the type name.
  Trailing-e drop gives a spellable brand mark.
- **Domains.** adjustd.com — likely open. adjustd.fit — likely open.
- **Sounds like:** minimal, engineered, mobile-first.
- **Risk.** Silent-e drop feels 2015-startup; also verbs "adjust" and
  "adjusted" both stay flat rather than pointing to progression.
- Note: overlaps in shape with `Prescribr` above; pick one of the two if
  going the coined-trailing-consonant route.

### 9. Retestly

- **Rationale.** Same retest-gate mechanic as candidate 2, with the -ly
  suffix that says "the retest way" or "regularly retested." Coined but
  pronounceable; -ly names sit familiar in SaaS (Calendly, Grammarly).
- **Domains.** retestly.com — likely open. retestly.fit — likely open.
- **Sounds like:** friendly-SaaS, scientific, contemporary.
- **Risk.** The -ly suffix pattern is over-fished; also softens the
  "clinical rigor" the retest concept is meant to project.

### 10. Cited

- **Rationale.** The most distinctive product fact: every program cites
  studies inline in the JSON. `EvidenceClaim.tsx` is a dedicated landing
  section; Wilson & Loenneke, Schumann, Shea & Morgan appear in the
  runtime UI (`src/app/page.tsx` lines 194, 226). "Cited" is the promise
  as a name.
- **Domains.** cited.com — taken (academic citation tool). cited.fit —
  likely open.
- **Sounds like:** honest, academic, evidence-forward.
- **Risk.** Reads academic first, athletic second; also .com collision is a
  real problem for a name that IS a common English word.

---

## Recommendation

If forced to pick one from this angle, **Retest** or **Gatecheck**. Retest
is the honest mechanic name — it's what the retest evaluator does, it's what
gates progression, and it's spellable and pronounceable in one pass. It sits
next to `Whoop` and `Strava` on the shelf without needing a category. The
one caveat is the QA/software connotation, which shows up in .com search
results but not on a lifter's ear.

**Gatecheck** is the descriptive fallback if Retest's .com is blocked —
same mechanic, less clinical, slightly more athletic register.

The rest of the list is the honest breadth of the descriptive register:
`Retune` and `Adjustd` describe the daily-log-driven side, `Calibr` and
`Coachfile` describe the intake/prescription side, `Cited` describes the
evidence side, `Logbook` describes the input side. Any of them will read as
"functional label" the first time a user hears it — which was the brief.
