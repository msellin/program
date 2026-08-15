# Naming — Round 4, Agent 3: Evocative one-word brand

Angle: **Strava / Whoop / Notion / Peloton style.** Names that *feel* like
something before you know what they mean — short, memorable, invented or
Latin-rooted, no subtitle required. Sibling agents cover descriptive names and
BYD-style acronym-slogans; this one owns the pure brand-mark angle.

---

## App-feeling audit (before naming)

Eight bullets on the emotional territory the product actually occupies, each
tied to a file so the read is grounded.

- **Patient craft, not hustle.** The whole product opposes streak-culture:
  *"Not a streak game. Skip a week. The plan sharpens against that too."*
  (`landing/src/i18n/dictionaries/en.ts:73-74`). Whatever the name is, it must
  not read like a habit tracker.
- **The engine proposes, the user accepts.** Confirm-first is philosophical,
  not incidental: *"You log a note. Engine proposes. You Accept or Ignore."*
  (`landing/src/i18n/dictionaries/en.ts:43`). This is a two-hander, not an
  autopilot — the name should sound consultative, not commanding.
- **Cited before shipped.** *"100+ primary studies. Every session cites its
  research."* (`landing/src/i18n/dictionaries/en.ts:62`). There's a quiet
  scholarly seriousness underneath the sweat.
- **Symptom-aware, not fragile.** The rehab lineage (`CLAUDE.md`, "Exercise
  demonstrably worked once. Do not treat this user as fragile") gives it a
  clinical texture without ever being clinical. Warm precision.
- **Every session refines the last.** Cycle-end evaluation is the heart:
  `next-app/src/lib/engine/adapt.ts:46-95` reads four weeks of logs, compares
  AMRAP performance to expected, proposes a TM delta. This is measurement +
  small correction — not transformation, not overhaul.
- **A blade against something harder than itself.** The origin quote is a
  craftsman's aphorism, not a slogan (`landing/src/components/sections/OriginStory.tsx:9-11`
  via `en.ts:78-79`). Metal, tool, patient work, resistance.
- **Bronze × teal, warm-dark palette.** The Hero's ChiselStroke fades bronze
  → teal (`landing/src/components/sections/Hero.tsx:16-23`). This is not a
  Strava-orange product. The name should tolerate a warm, quiet colour world.
- **A cast of individually-authored programs.** The manifest reads like a
  small studio's back-catalogue — Engine Builder, Concurrent-Strength
  Maintenance, Rowing 2K Test Prep, Handstand Walk, Overhead Mobility
  (`next-app/public/data/programs/manifest.json`). The parent brand should
  feel like a house, not a feature.

**Emotional territory:** *quiet, precise, tactile, slightly scholarly,
warm-serious.* A tool that respects you. Not a coach in your ear.

---

## Prior-round zones to avoid

Read of `naming-round-2-agent-2-sharpen-family.md` confirms the following are
exhausted: **Sharpen, Hone, Whet, Edge, Temper, Notch, Forge, Fettle, Sharpn,
Whettr, Carve, Prime, Peak, Dial, Lock, Aim, Refine, Tune, Calibrate.** The
blade / sharpen / edge lexical field is closed. Same for peak/apex/summit and
sync/align.

Push zones this agent explored: **craft nouns** (jig, plane, gauge), **music/
time** (cadence, meter, bar), **measurement** (arc, mark, span, index),
**patient work** (tend, mend, form, shape), **Latin-rooted English** (praxis,
vector, opus).

---

## Candidates (14)

### 1. Cadence

- **Etymology.** Latin *cadere* = to fall; English "cadence" = rhythm of
  falling steps, musical resolution, rower's stroke rate.
- **Rationale.** The product is *rhythm made honest* — every session against
  yesterday's log, every four weeks a cycle-end review
  (`next-app/src/lib/engine/adapt.ts`). Rowers already own the word (see the
  Rowing 2K Test Prep program). The rehab arc is also a cadence: Phase 1 →
  Phase 4 in `next-app/public/data/programs/manifest.json`.
- **Sonic.** Two syllables, dactyl-ish (CA-dence), liquid opens, soft
  close. Sits well on a hoodie.
- **Domains.** cadence.com — almost certainly gone (large software brand).
  cadence.fit — check needed. Getcadence.com — check needed.
- **Risk.** Cadence Design Systems (semiconductors, big). Category-distant
  but a real trademark presence.

### 2. Praxis

- **Etymology.** Greek *praxis* = practice, the doing itself (vs *theoria*).
- **Rationale.** Every program is theory (`100+ cited studies`) turned into
  today's session (`landing/src/components/sections/EvidenceClaim.tsx` via
  `en.ts:62`). Praxis names exactly that translation. Reads like Notion —
  intellectually serious, warm not cold.
- **Sonic.** Two syllables, plosive /pr/ open, sibilant close.
- **Domains.** praxis.com — long taken. praxis.fit / praxishq.com — check
  needed.
- **Risk.** Multiple education/coding brands (Praxis bootcamp, Praxis exam).
  Category-distant but recognisable.

### 3. Arc

- **Etymology.** Latin *arcus* = bow, curve. In training, "the arc" is the
  long shape of a program — Margus's is described as a *"12-month strength
  arc"* (`manifest.json:15`).
- **Rationale.** The product literally sells arcs. Programs run 6-34 weeks
  with named phases. "Arc" captures the shape without moralising it. Warm
  and open — no clinical or gym-bro overtones.
- **Sonic.** One syllable, plosive close on /k/. Airport-clean.
- **Domains.** arc.com dead (Arc browser). arc.fit — check needed.
  arclabs / arcpro / usearc — check needed.
- **Risk.** The Browser Company's Arc has consumed a lot of "Arc" oxygen in
  the last two years. Fresh brand collision.

### 4. Meter

- **Etymology.** Greek *metron* = measure; also poetic/musical meter.
- **Rationale.** The engine is a measurement instrument — reads your log,
  compares against expected, proposes delta (`adapt.ts:87-95`). "Meter" is
  gentler than "measure" and carries the music/poetry connotation the
  landing's warm-scholarly tone already has.
- **Sonic.** Two syllables, trochee (ME-ter), soft.
- **Domains.** meter.com blocked (networking/enterprise). meter.fit — check
  needed. metercoach — check needed.
- **Risk.** Meter Inc. (networking-as-a-service, ~200 employees). Distant
  category; still a trademark presence.

### 5. Vector

- **Etymology.** Latin *vector* = "one who carries" — direction with
  magnitude.
- **Rationale.** The adaptive engine has a direction (the program arc) and a
  magnitude (today's proposed load). "Vector" reads athletic-scientific
  without slipping into AI-tech territory. Programs like Overhead Mobility
  and Engine Builder are literal vectors from a baseline (`manifest.json`).
- **Sonic.** Two syllables, plosive open, hard /k/ mid, /r/ close.
- **Domains.** vector.com blocked. vector.fit — check needed.
  vectorstrength — check needed.
- **Risk.** Vector is heavily used (Vector Marketing, Vector Robotics, Vector
  as a marketing/SEO term). Distinctiveness low without the .fit save.

### 6. Span

- **Etymology.** Old English *spann* = the distance from thumb-tip to
  little-finger-tip, and by extension any measured stretch.
- **Rationale.** A program spans weeks; a symptom log spans years — the
  README pitch says the multi-year symptom+load history is the thing no
  clinical note contains (`CLAUDE.md:78-80`). "Span" carries the horizon
  view the product secretly cares about.
- **Sonic.** One syllable, /sp/ cluster, nasal close. Quiet and clean.
- **Domains.** span.com blocked (electrical panels). span.fit — check
  needed. usespan — check needed.
- **Risk.** Span.io (home electrical panels, well-funded consumer brand).
  Distant category but visible.

### 7. Jig

- **Etymology.** English *jig* = a custom guide/fixture that holds a
  workpiece in the right position while you cut or drill it. Also a lively
  dance rhythm.
- **Rationale.** The double meaning is the product: a **jig** guides
  precision work (the engine holds you to the plan against your log) and
  it's the rhythm you dance to (every session, every four weeks). Nobody in
  fitness owns it.
- **Sonic.** One syllable, /dʒ/ open + /g/ close. Percussive, playful — a
  small counterweight to the app's seriousness.
- **Domains.** jig.com — check needed. jig.fit — check needed. Very short,
  likely contested.
- **Risk.** "Jig" has minor pejorative slang risk in older AmE usage;
  survivable, but a diligence hit for a diligence-heavy brand. Also small
  fitness-adjacent uses (Jig The Rig, etc.).

### 8. Plane

- **Etymology.** Old French *plaine* — the woodworker's tool that shaves
  thin, exact passes off a surface. Also a flat reference surface.
- **Rationale.** The engine takes thin, exact passes (small TM adjustments,
  small phase-boundary decisions — `adapt.ts`) off a rough plan. That is
  literally what a plane does. "Plane" also reads as *level* — the
  progression rules produce green/amber/red states which sit on a plane.
- **Sonic.** One syllable, /pl/ liquid open, long vowel, /n/ close.
- **Domains.** plane.com blocked (aviation-adjacent SaaS). plane.fit —
  check needed.
- **Risk.** Aviation collision at first glance ("plane" reads *airplane*
  before it reads *tool* to most English speakers). Requires visual
  disambiguation.

### 9. Gauge

- **Etymology.** Old Northern French *gauge* — a measuring instrument set
  to a standard.
- **Rationale.** The product gauges — reads state, compares to program
  standard, produces green/amber/red (`CLAUDE.md:75-76`,
  `next-app/src/app/page.tsx:151-153`). Precision-instrument connotation,
  warm rather than clinical.
- **Sonic.** One syllable, /g/ plosive open, affricate close. Compact and
  American-mouth-friendly.
- **Domains.** gauge.com blocked (multiple brands). gauge.fit — check
  needed. gaugetraining — check needed.
- **Risk.** Gauge is a common word in analytics/dashboards; discoverability
  fight.

### 10. Tend

- **Etymology.** Latin *tendere* = to stretch, to attend to; English "tend"
  = to look after with regular attention.
- **Rationale.** The product tends — the rehab log spanning 2020 → 2023
  (`CLAUDE.md:10-13`) is exactly the shape of tending. Warm, slightly
  domestic; deliberately un-macho. Runs counter to CrossFit's shout
  register — which is a *feature*, not a bug, given the brief's aversion to
  hype.
- **Sonic.** One syllable, /t/ plosive open, nasal-plosive close (/nd/).
- **Domains.** tend.com blocked (dental brand). tend.fit — check needed.
  tendcoach — check needed.
- **Risk.** Tend (dental care, well-funded) is a category-adjacent
  wellness brand. Real collision risk.

### 11. Ply

- **Etymology.** Old French *plier* = to fold, bend, layer. "Ply your
  trade" = practice your craft, patiently.
- **Rationale.** "Ply the plan tonight" reads native craft. The four-week
  cycle is a fold — same shape re-passed with a small correction each time.
  Two-letter monogram (Terav's chisel-T translates: the P has a similar
  vertical stroke).
- **Sonic.** One syllable, /pl/ liquid open, /aɪ/ long vowel. Reads
  Anglo-Saxon.
- **Domains.** ply.com blocked. ply.fit / plytraining — check needed.
- **Risk.** Small — "ply" is a common English word; hard to trademark
  the mark alone. Needs distinctive typography.

### 12. Mark

- **Etymology.** Old English *mearc* = a boundary, a target, a sign left by
  a tool.
- **Rationale.** The program marks — cycle-end evaluations, phase
  boundaries, retest dates (`manifest.json` every entry has a `retest`
  field). "Hit the mark" is native athletic English. "Every session leaves a
  mark" fits the log-forever thesis (`CLAUDE.md:78-80`).
- **Sonic.** One syllable, nasal open, hard /k/ close.
- **Domains.** mark.com blocked. mark.fit — check needed. usemark — check
  needed.
- **Risk.** Fatally common as a first name and as an SEO term. Distinct-
  iveness very low.

### 13. Opus

- **Etymology.** Latin *opus* = a work, a piece of finished labour;
  musicologists number a composer's works Opus 1, 2, 3.
- **Rationale.** Each program is an opus — a finished, numbered piece of
  serious work. "Engine Builder — Block 1: Base" (`manifest.json:33`) reads
  Opus 1. Warm-scholarly register that matches the "cited before shipped"
  ethos. Reads like Notion, Linear — a brand that respects its user's
  taste.
- **Sonic.** Two syllables, front vowel open (/oʊ/), sibilant close.
- **Domains.** opus.com blocked (multiple large brands). opus.fit — check
  needed. opustraining — check needed.
- **Risk.** Opus is heavily used (Opus One wine, Opus Bank, Opus Energy).
  Category-distant but crowded.

### 14. Kiln

- **Etymology.** Old English *cyln* = the oven where clay is fired into
  finished ceramic. The place where a rough thing becomes a stable thing.
- **Rationale.** Rehab-to-strength is a firing — the CLAUDE.md context is
  literally about a body that came out of injury and needed to be re-fired
  into training shape. Programs turn rough intake into a finished session
  (`landing/src/i18n/dictionaries/en.ts:37-44`). Nobody in fitness owns it.
- **Sonic.** One syllable, /k/ plosive open, /ln/ liquid-nasal close.
  Unusual — memorable.
- **Domains.** kiln.com — check needed (Kiln.fi is a large crypto brand).
  kiln.fit — check needed.
- **Risk.** Kiln.fi (crypto staking, well-funded) owns a lot of "Kiln" SEO.
  Category-distant but visible.

---

## Portmanteaus (3)

### P1. Calibr

- **Construction.** Truncated *calibrate*; drops the "ate" the round-2 brief
  called stiff and clinical. Reads as its own English-shaped word —
  *cal-i-ber*, close to *caliber*, close to *calibrate*, close to *libra*.
- **Rationale.** Calibration is the app's honest verb (`adapt.ts` proposes
  small deltas against a standard). "Calibrate" itself lost round 2 for
  being three syllables of admin. "Calibr" — two syllables — keeps the
  meaning and shifts the register from lab to craft.
- **Sonic.** Two syllables, plosive open, liquid close.
- **Domains.** calibr.com — check needed. calibr.fit — check needed. Very
  likely available given the dropped vowel.
- **Risk.** Reads slightly startup-tech (dropped final vowel is the
  Grindr/Flickr tell the round 2 brief flagged). Manageable if the mark
  is set in classical type rather than sans-serif.

### P2. Attuna

- **Construction.** *Attune* + Latin feminine ending; also a near-anagram
  of *nautical* particles. Reads like a name (Athena / Adina / Adina).
- **Rationale.** The engine attunes the plan to today's log. "Attune"
  itself is a two-syllable verb with a soft close; "Attuna" gives it a
  three-syllable brand cadence with a warm final vowel — like Adidas,
  Zumba, Peloton — while keeping the meaning legible on first read.
- **Sonic.** Three syllables, /ə-TU-nə/. Front-light, warm.
- **Domains.** attuna.com — check needed. attuna.fit — check needed.
- **Risk.** Two-syllable brand names outperform three in the fitness
  category (Whoop, Strava, Peloton is the exception, not the rule). Also
  reads slightly feminine, which is fine for the brand but worth flagging
  for a founder pitching to CrossFit gyms.

### P3. Marka

- **Construction.** *Mark* + open-vowel brand ending. Reads Nordic (Marka
  is a real place-name and an actual Norwegian word for the forested belt
  around Oslo). The vowel warms the plosive-heavy root.
- **Rationale.** *Mark* alone (candidate 12) is too generic; *Marka* is
  distinctive, still parses as English-adjacent, and quietly carries the
  Estonian founder's Nordic geography without needing an explainer.
- **Sonic.** Two syllables, trochee (MAR-ka). Percussive open, warm close.
- **Domains.** marka.com — likely taken (common surname/place). marka.fit
  — check needed.
- **Risk.** Real word in several Nordic and Slavic languages (Norwegian
  forest, Serbian/Croatian currency, Estonian for "mark/postage stamp").
  Some of those readings are inert; the currency reading in the Balkans
  could confuse.

---

## Cheque pick

If I had to choose one from this angle: **Cadence.**

It carries every emotional territory bullet from the audit — rhythm not
hustle (matches "not a streak game"), musical/scholarly warmth (matches the
cited-studies backbone), rower-native (matches the Rowing 2K program), and
the arc reading (a program's cadence, a life's cadence, a rehab's cadence).
It's two syllables, airport-clean, and the CTA rewrites don't lose anything:
*"Find your cadence."* / *"Cadence — the plan learns your rhythm."* The
trademark risk (Cadence Design Systems) is category-distant enough to
survive with a fitness-Class-9 registration and a chisel-stroke monogram.

Second choice: **Arc** — shortest, warmest, matches the product's own copy
("12-month strength arc" is already in the manifest). Loses on Browser
Company Arc collision, which is fresh and consumer-facing.

Third choice: **Opus** — best for the warm-scholarly / catalogue-of-works
feel a multi-program studio has. Loses on domain crowding.

If the founder wants pure invented brand-mark energy (Notion / Whoop / Strava
without any dictionary tether), **Attuna** is the highest-upside portmanteau
here — meaning legible on first read, warm three-syllable cadence, no
existing fitness collision I can find.
