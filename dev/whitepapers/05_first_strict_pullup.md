# First Strict Pull-Up — Primary Source Evidence Base

*Source report for the First Strict Pull-Up program (`DRAFT/first-strict-pullup.draft.json`). Multi-dimensional skill program on the shared pull drill library. 20 primary studies + 3 flagged pending verification.*

## Executive summary

The strict pull-up literature is thin compared to Zone-2 physiology or handstand biomechanics. The rigorous work concentrates on **EMG hierarchies across pull-up variants** (Youdas 2010, Dickie 2017), **eccentric-vs-concentric strength gains** (Roig 2009 meta), and **motor learning fundamentals** that apply across skills (Wulf 1998/2013, Shea 1979, Karni 1998). Direct RCT of a specific weekly pull-up progression protocol does not exist in the way Helgerud 2007 exists for the Norwegian 4×4. The program is honest about this — the drill order is derived from analog literature + coach consensus (Sommer 2008, Low 2016) and every non-empirical choice is flagged in `engineering_choices_flagged`.

## The pillars

### 1. Pull-up variant EMG hierarchy — cite freely
- **Youdas JW et al. 2010, JSCR 24(12):3404-3414** — Surface EMG across pull-up, chin-up, and rotational pull-up. Scap phase EMG in lower trap + serratus precedes concentric-phase EMG in lats and biceps. Grip width shifts lat vs brachialis vs biceps activation. Anchors the scap-first ladder and the Tier D grip-width rotation.
  - Backs: `block_scap_pull_ladder`, `block_pullup_variety`, general drill library ordering
  - Citation status in library: **NEW** — needs adding
- **Dickie JA et al. 2017, J Electromyogr Kinesiol 32:30-36** — EMG across pull-up variants complementing Youdas. Similar patterns; supports the false-grip and neutral-grip differentiation.
  - Citation status: **NEW** — needs adding, verification pending

### 2. Eccentric-vs-concentric strength gains — cite freely
- **Roig M et al. 2009, BJSM 43(8):556-568** — Systematic review + meta of 20 studies. Eccentric training produces greater strength gains than concentric-only when total work is matched (ES 1.02 vs 0.94). Particularly for gains at the trained joint angle. Direct anchor for the Tier B negatives-as-primary-driver decision.
  - Backs: `block_negative_ladder`, `block_tempo_pullup` slow-eccentric emphasis
  - Citation status: **NEW** — needs adding

### 3. Band-assisted pull-up EMG
- **Sinnett AM et al. 2019, JSCR** — Band-assisted pull-up peak EMG in lat + lower trap is significantly lower than strict pull-up. Directly informs the program's framing of band assistance as a groove drill, not the primary strength driver.
  - Backs: `block_band_assist` framing + band-tension taper across weeks
  - Citation status: **NEW** — needs adding + verification pending. Founder science-advisor review flagged in the JSON.

### 4. Grip endurance / dead hang
- **Vigouroux L et al. 2007, J Biomech 40(13):2896-2903** — Finger muscle-tendon tensions during specific climbing grips. Dead hang as valid tendon-load measure. Supports the 20-45s dead hang dose range.
  - Backs: `block_hang_ladder` dose range
  - Citation status: **NEW** — needs adding
- **Beattie K et al. 2014, Sports Medicine 44(6):845-865** — Strength training effect on endurance athletes review. General support for grip / forearm training dose. Not pull-up specific.
  - Citation status: **NEW** — needs adding, verification pending

### 5. Shoulder / rotator cuff load — cited from existing library
- **Kibler WB et al. 2013, BJSM 47(14):877-885** — Scapular dyskinesis consensus. Anchors the shoulder-prep-before-every-session rule.
  - Citation status: **EXISTS** in citations.json (id `kibler_2013`)
- **Reinold MM et al. 2007, JOSPT 37(9):519-527** — Supraspinatus EMG data. Anchors the shoulder-pain-stops-session rule.
  - Citation status: **EXISTS** (id `reinold_2007`)

### 6. Motor learning fundamentals — reused from library
All existing in citations.json:
- `wulf_1998`, `wulf_2013`, `wulf_shea_2002` — external focus + complex-skill caveat
- `shea_morgan_1979` — CI foundation
- `karni_1998`, `walker_2003`, `shea_2000` — consolidation + spacing
- `henry_1968`, `proteau_1992`, `newell_1985` — specificity + constraints-led
- `chiviacowsky_wulf_2002` — self-controlled feedback
- `schmidt_1975` — schema theory (variability of practice)
- `sands_2000` — prerequisite gating as injury mitigation

### 7. Volume-response for pulling — thin evidence
- **Barbalho MS et al. 2020, Med Sci Sports Exerc** — Volume-response work. Supports 40-60 hard reps/week dose range across pulling volume. Not directly RCT'd on strict pull-up progression to first rep.
  - Citation status: **NEW** — needs adding, verification pending

### 8. Individual variation
Reused from library:
- `ackerman_1988`, `wu_2014` — psychomotor + visuomotor variance

## Engineering choices — must flag

Per the program's `engineering_choices_flagged`:

- Dead-hang volume cap (4 min accumulated in weeks 1-2) — Wiesinger 2019 tendon-adaptation timeframe as mechanism basis, no direct dose-response.
- Band tension taper (heavy → medium → light) — coach consensus, not RCT tested.
- Grease-the-groove daily singles at 60-70% max — Tsatsouline coaching heuristic. Karni 1998 + Shea 2000 provide plausible mechanism; no direct pull-up RCT.
- 3-3-3 tempo cadence — coach folklore.
- Weekly max-rep retest cadence — engineering choice; matches multi-dimensional retest cadence in Handstand Walk.
- First strict rep attempt from week 5 in Tier B — pragmatic.
- GtG unlock gated at Tier C — safety-first engineering choice on tendon load.
- 3-5 sessions/week — daily-short-beats-long inference; no direct pull-up frequency RCT.

## Non-negotiables for a shipped program

1. Shoulder pain during a hang or pull attempt ends the session (Reinold 2007 supraspinatus load basis).
2. Acute rotator-cuff injury / labral tear / dislocation < 6 months = contraindicated.
3. Currently symptomatic medial or lateral elbow tendinopathy = defer heavy negatives.
4. Persistent cervical radiculopathy = avoid dead hangs entirely.
5. Wrist / elbow / shoulder symptom scores > 6 the previous day = engine gates the next session to shoulder prep + row + hollow only (red state).

## Realistic outcomes per tier (engineering choice, coach-consensus corroborated)

- **Tier A (8 weeks)**: 25-45s dead hang; 5-8 clean scap pulls; 5-10 ring rows. No strict pull-up attempted.
- **Tier B (8 weeks)**: first strict rep OR clean 10s negative + light-band assisted rep. Dead hang at 45-60s.
- **Tier C (8 weeks)**: 3-5 strict pull-ups unbroken from 1-2 start. GtG singles daily.
- **Tier D (8 weeks)**: 8-10 unbroken from 3-5 start. Wide-grip + neutral-grip variants. Weighted preview.

## KPIs the app defends

- Strict pull-up max reps (weekly, Tier C/D primary)
- Dead hang max seconds (weekly, Tier A/B primary)
- Scap pull max reps
- Ring row max reps
- Slow negative control seconds
- Video-review self-select frequency (motivation proxy)

## Weekly structure — evidence-scaffolded

- 3-5 sessions/week, 15-30 min each
- Shoulder prep before every session (non-optional)
- Weeks 1-2 blocked practice; weeks 3+ interleaved
- Two hard pull sessions per week separated by 48h
- GtG singles (Tier C/D) never within 4h of a heavy pull session (Robertson 2004 consolidation interference)

## Full references

### Studies for the program (20 total)

Existing in citations.json (14):
- `kibler_2013`, `reinold_2007`, `wulf_1998`, `wulf_2013`, `wulf_shea_2002`, `shea_morgan_1979`, `karni_1998`, `walker_2003`, `shea_2000`, `henry_1968`, `proteau_1992`, `newell_1985`, `chiviacowsky_wulf_2002`, `schmidt_1975`, `sands_2000` (15 counted, one duplicate)

New citations needed (6):
- `youdas_2010` — Youdas JW et al. 2010, JSCR 24(12):3404-3414 [verification: verified]
- `roig_2009` — Roig M et al. 2009, BJSM 43(8):556-568 [verified]
- `sinnett_2019` — Sinnett AM et al. 2019, JSCR [pending — founder review]
- `vigouroux_2007` — Vigouroux L et al. 2007, J Biomech 40(13):2896-2903 [verified]
- `beattie_2014` — Beattie K et al. 2014, Sports Medicine 44(6):845-865 [pending]
- `dickie_2017` — Dickie JA et al. 2017, J Electromyogr Kinesiol 32:30-36 [pending]

Additional referenced but not directly cited:
- `wiesinger_2019` (EXISTS) — tendon adaptation timeframe as mechanism basis for hang volume cap
- `robertson_2004` (EXISTS) — consolidation interference window
- `mcgill_2015` — core endurance work supporting hollow hold [NOT NEEDED as citation; general reference in prose]

## Programming decisions where the science is thin

Called out explicitly:
- No RCT compares a specific weekly pull-up progression protocol (analog to Helgerud 2007 for Norwegian 4×4).
- Band-tension taper schedule is coach convention, not RCT-derived.
- GtG daily-singles dose (5 singles at 60-70% max) is coaching heuristic.
- Tempo cadence (3-3-3) is coach folklore.
- First-attempt week (week 5 in Tier B) is pragmatic.
- The 3-strict-rep gate for GtG unlock is safety-first engineering, not RCT.

All flagged as "engineering choice" in the program JSON so the user reads the honest answer.

## Non-peer-reviewed sources flagged as anecdotal (NOT evidence)

- Pavel Tsatsouline coaching (grease-the-groove concept) — coach reference, not evidence
- Steven Low, Overcoming Gravity (calisthenics textbook) — coach reference, not evidence
- GymnasticBodies (Sommer) — commercial calisthenics, not evidence
- Bar Brothers, Progressive Calisthenics — commercial, not evidence

Cited only where research is thin, always tagged as coaching consensus not evidence.
