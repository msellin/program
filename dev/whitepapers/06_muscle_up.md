# Muscle-Up Acquisition — Primary Source Evidence Base

*Source report for the Muscle-Up Acquisition program (`DRAFT/muscle-up.draft.json`). Multi-dimensional skill program reusing pull-up + handstand-adjacent drill libraries. 22 primary studies + 3 flagged pending verification.*

## Executive summary

**The strict ring muscle-up has essentially no direct primary-source literature.** This is a real research gap and the program is honest about it in `outcome_evidence`. What we can cite is:

- Pull-up variant EMG (Youdas 2010, Dickie 2017) — informs the drill library grip choices
- Ring dip EMG data (Dickie 2017 pull-variant work + Youdas 2010 dip variants where documented) — informs the ring dip ladder
- Eccentric-vs-concentric strength gains (Roig 2009 meta) — anchors the transition-negative-from-support as the highest-transfer drill for the elbow-travel mechanic
- Shoulder loading analogs (Sadowski 2021 straight-arm press to handstand — 3× BW shoulder moment — is the closest kinetic analog for ring support end-range shoulder load)
- Motor learning fundamentals (Wulf 1998/2013, Shea 1979, Karni 1998, Chiviacowsky & Wulf 2002)
- Coach commentary (Sommer 2008 GymnasticBodies, Low 2016 Overcoming Gravity) explicitly flagged as coach reference not evidence

The drill order is therefore inferred from analog literature + coach consensus. Every non-empirical choice ships in `engineering_choices_flagged`.

## The pillars

### 1. Pull variant EMG — inherited from First Strict Pull-Up whitepaper
- `youdas_2010` — pull-up EMG hierarchy; anchors false-grip as separate capability
- `dickie_2017` — pull-up + potential dip variant EMG (verification pending)

### 2. Eccentric-vs-concentric — anchors transition negatives
- **Roig 2009 (BJSM 43(8):556-568)** — meta. Eccentric > concentric-only for matched work. The muscle-up transition negative (starting from ring support, lowering slowly through the transition to a low false-grip hang) is the highest-transfer drill for the elbow-travel mechanic. This is the empirical anchor for the entire Tier B/C transition ladder.

### 3. Shoulder loading analog — Sadowski
- `sadowski_2021` (EXISTS in library) — straight-arm press to handstand: 3× BW shoulder moment. Ring support lockout under bodyweight sees lower peak moments but similar joint position. Anchors the shoulder-pain-stops-session rule for the muscle-up.

### 4. Rotator cuff / scapular kinematics — from library
- `kibler_2013` — scapular dyskinesis in overhead loading
- `reinold_2007` — supraspinatus EMG. Both anchor pre-session shoulder prep.

### 5. False-grip forearm loading — new, small sample
- **Vidal-Rovira R et al. 2024** — Forearm activation patterns in false-grip vs standard grip on gymnastic rings. Small-sample preprint / conference. Documents higher forearm activation in false-grip vs standard hang. Supports the false-grip-as-separate-capability framing but flagged as pending verification. Founder science-advisor review required before commit.
  - Citation status: **NEW** — pending verification
  - The program does NOT lean on this citation load-bearing. It's directional supporting evidence for a claim that also has coach-consensus backing.

### 6. Motor learning fundamentals — reused from library
All exist in citations.json:
- `wulf_1998`, `wulf_2013`, `wulf_shea_2002`
- `shea_morgan_1979`
- `karni_1998`, `walker_2003`, `shea_2000`
- `henry_1968`, `proteau_1992`, `newell_1985`
- `chiviacowsky_wulf_2002` — video review as button
- `potdevin_2018` — KP after ~5 reps not every rep
- `schmidt_1975` — schema theory
- `sands_2000` — prerequisite gating

### 7. Prerequisite gating
- `sands_2000` (EXISTS) — skill-readiness assessment + prerequisite gating as injury-mitigation heuristic. Anchors the 3-strict-pullup + 3-strict-ring-dip gate.
- Coach consensus: Sommer 2008 (GymnasticBodies), Low 2016 (Overcoming Gravity) — cited as coach references NOT evidence.

### 8. Individual variation
- `ackerman_1988`, `wu_2014` — psychomotor + visuomotor variance.

## Engineering choices — must flag

Per program's `engineering_choices_flagged`:

- 3-5 strict pull-up + 3-5 ring dip prerequisite gate — coach consensus (Sommer 2008, Low 2016), not RCT.
- False grip volume cap (3 min accumulated in weeks 1-2) — Wiesinger 2019 tendon-adaptation mechanism basis, no direct dose-response.
- Seated-band → low-ring → jump-assist → strict progression — coach convention.
- Weekly max-rep retest cadence — engineering.
- First strict rep attempt from week 6-8 in Tier B — pragmatic.
- Weighted preview (+2.5 kg) at Tier C — coach convention.
- Ring dip support hold as Tier A entry drill — pragmatic; exact hold-time doses are engineering.
- 3-4 sessions/week — daily-short-beats-long inference; no direct muscle-up frequency RCT.

## The prerequisite gate (safety-critical decision)

The intake safety_gates fire if:
- `strict_pullup_max_reps < 3` → routes user to First Strict Pull-Up
- `ring_dip_max_reps < 3` → the Tier A phase of this program becomes a ring-dip build (or the user can choose to run a dedicated dip program first)

**Rationale for the specific numbers.** Not empirically derived. The 3-rep threshold is coach consensus (Sommer 2008 GymnasticBodies, Low 2016 Overcoming Gravity) as the practical floor at which the constituent sub-lifts of a muscle-up are strong enough that the transition drills don't groove a compensation. Below 3 strict pull-ups, users tend to develop a kip / swing pattern that reinforces itself. **This is engineering choice + coach consensus, not evidence.** Flagged as such in the JSON.

## Non-negotiables for a shipped program

1. Shoulder pain during a hang, transition, or support hold ends the session (Reinold 2007, Sadowski 2021 analog).
2. Acute rotator cuff / labral / dislocation < 6 months = contraindicated.
3. Currently symptomatic medial or lateral elbow tendinopathy = defer ring dip work.
4. Acute wrist injury (TFCC, ligament instability) < 6 weeks = false-grip work prohibited.
5. Persistent cervical radiculopathy = avoid false-grip hangs.
6. Kipping muscle-up training is deliberately excluded — Henry 1968 specificity: two different tasks.

## Realistic outcomes per tier

- **Tier A (8 weeks)**: 3-5 strict ring dips, 15s false-grip hang, first false-grip ring rows.
- **Tier B (8-10 weeks)**: first low-ring muscle-up, first jump-assist, first strict attempt at week 8-10.
- **Tier C (8 weeks)**: 2-3 strict ring muscle-ups unbroken.

## KPIs the app defends

- Strict ring muscle-up max reps (weekly, Tier C primary)
- False-grip hang max seconds (weekly, Tier A/B primary)
- Ring dip max reps (weekly, Tier A primary)
- Ring support lockout seconds
- Video-review self-select frequency

## Weekly structure — evidence-scaffolded

- 3-5 sessions/week, 20-35 min each
- Shoulder + wrist prep before every session (non-optional)
- Weeks 1-2 blocked practice; weeks 3+ interleaved
- 48h between the two hardest ring-loaded sessions
- First strict muscle-up attempt is always the first movement of the session (cold, well-rested)
- No overhead press same day (same joint system)

## Full references

### Studies for the program (22 total)

Existing in citations.json (17):
- `roig_2009` (NEW — see below, but shared with First Strict Pull-Up)
- `youdas_2010` (NEW — see below, shared)
- `reinold_2007`, `kibler_2013`, `sadowski_2021`
- `wulf_1998`, `wulf_2013`, `wulf_shea_2002`
- `shea_morgan_1979`, `karni_1998`, `walker_2003`, `shea_2000`
- `henry_1968`, `proteau_1992`, `newell_1985`
- `chiviacowsky_wulf_2002`, `potdevin_2018`
- `sands_2000`, `schmidt_1975`

New citations needed (3 unique to this program; 3 shared with First Strict Pull-Up):
- `youdas_2010` (shared)
- `roig_2009` (shared)
- `sinnett_2019` (shared) — band-assisted EMG framing
- `vidal_rovira_2024` — false-grip forearm activation [pending verification]
- `dickie_2017` (shared) — pull-variant EMG [pending]

## Programming decisions where the science is thin

Called out explicitly:
- No direct RCT for a strict ring muscle-up progression protocol exists. The drill order is derived from analog literature + coach consensus.
- The 3-strict-pullup + 3-strict-ring-dip prerequisite gate is coach convention.
- Seated-band → low-ring → jump-assist → strict progression is coach convention.
- False-grip hang volume cap is Wiesinger 2019 analog mechanism basis, not dose-response.
- Transition negatives from support as the highest-transfer drill — Roig 2009 mechanism basis, no direct muscle-up RCT.
- Weekly retest cadence — engineering.
- Weighted preview at Tier C — coach convention.

All flagged in `engineering_choices_flagged` so the user reads the honest answer.

## Non-peer-reviewed sources flagged as anecdotal (NOT evidence)

- Sommer C (GymnasticBodies) — commercial calisthenics, referenced for prerequisite gating consensus
- Low S 2016 (Overcoming Gravity) — calisthenics textbook, referenced for prerequisite consensus
- Cali Move, Bar Brothers, FitnessFAQs — commercial calisthenics content
- Tsatsouline P (grease-the-groove) — referenced in shared drill library, not in muscle-up-specific rationale

Cited only where research is thin, always tagged as coaching consensus not evidence.

## Reuse from handstand + pull-up whitepapers

This program leans heavily on the shared drill library architecture from Handstand Walk (04_handstand_walk.md) and First Strict Pull-Up (05_first_strict_pullup.md). The three programs share:
- The multi_dimensional generation strategy
- External-focus cue defaults (Wulf 1998, 2013)
- Blocked-then-interleaved CI schedule (Wulf & Shea 2002)
- Self-controlled video-review feedback (Chiviacowsky & Wulf 2002)
- Prerequisite gating as injury-mitigation heuristic (Sands 2000)
- Weekly retest cadence

This is the design elegance the whitepaper `00_master.md` §Part 3 promises: one architecture, three programs. When Sommer 2008 or Low 2016 says "master pull-up and ring dip first, then muscle-up", the program encodes that as prerequisite gates. When Roig 2009 says "eccentric > concentric-only", the transition ladder puts negatives first. When Wulf 1998 says "external focus", every drill card renders one. Nothing here is invented — it's the same principled toolkit applied to a new skill.
