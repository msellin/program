# Handstand Walk — Motor Learning + Skill Acquisition Review

**Reviewer:** motor-learning + skill-acquisition specialist
**Date:** 2026-08-18
**Program:** `next-app/public/data/programs/handstand-walk.json`
**Whitepapers:** `dev/whitepapers/03_motor_learning.md`, `dev/whitepapers/04_handstand_walk.md`
**Citations:** `next-app/public/data/citations.json`

---

## 1. Verdict

**CONDITIONAL.** Motor-learning scaffolding is unusually good — external-focus cues are actually external (not internal in disguise), self-controlled feedback is implemented as Chiviacowsky & Wulf describe, and the blocked→interleaved timing is defensible with the caveats the program itself flags. But three citations do not resolve cleanly: **Sadowski 2021 is misattributed** (DOI e0253951 belongs to Mizutori et al. 2021, and the 3× BW moment claim applies only to parallel bars, not floor); **Vidal-Torija 2025 is misattributed** (PMC12550924 is Martonovich et al. 2025 in J Functional Morphology and Kinesiology, same data); and **Ferrari 2021** and **Sci Reports 2026 handstand-shoulder** cannot be located from the given metadata. Fixes are cheap; nothing in the phase or drill logic needs rework.

---

## 2. Program scope

Handstand Walk, Block 1 of a multi-block arc (24-36 wks total). Four intake tiers (A never handstanded → D walks 10 m+). Multi-dimensional generation: eight capability domains tracked independently. Weeks 1-2 blocked practice; week 3+ interleaved. 33 references.

---

## 3. Citation audit

| ID | Program's claim | Verdict |
|---|---|---|
| **kinoshita_2022** | Four-position ladder (90°→135°→elbow/straddle-L→wall), EMG-validated | **Match, not independently verifiable.** Not indexed in PubMed/Scholar for these keywords. Journal is real. Add DOI/PubMed ID or downgrade to "coach-cited". |
| **kerwin_trewartha_2001** | Wrist-torque-dominated balance | **Match.** MSSE 33(7):1182-1188 correct. |
| **blenkinsop_2017** | Wrist strategy under perturbation | **Match.** RSOS 4:161018. |
| **sobera_2019** | Elite vs novice — medial-lateral CoP + stiffening | **Match.** |
| **baker_2025_review** | Current best synthesis of handstand biomechanics | **Match — verified.** PMC12745452 fetched: 21 studies, Nov 1988-Aug 2025, wrist strategy dominant, less-skilled use hip strategy. This is a real paper and the whitepaper's flagship. |
| **rohleder_vogt_2018** | Combined tactile-verbal + visual feedback | **Match, assumed.** |
| **potdevin_2018** | Video KP after ~5 reps in child gymnasts | **Match.** |
| **chiviacowsky_wulf_2002** | Self-controlled feedback beats forced | **Match — verified.** RQES 73:408-15. Study conclusion supports the video-review button design directly. |
| **sadowski_2021** | 3× BW shoulder moment during straight-arm press to handstand; used to argue against early press programming | **BROKEN.** DOI 10.1371/journal.pone.0253951 resolves to **Mizutori et al. 2021**, not Sadowski. And the >3× BW moment applies **only to parallel bars**; floor moments are <1.5 Nm/kg. Program uses parallel-bars data for a floor program. Directional argument (less-skilled → higher moments) still holds. Fix: correct first author and apparatus qualifier. |
| **barlow_2020** | Wrist WB tolerance drops from age 45 | **Match, assumed.** |
| **vidal_torija_2025** | n=321, 56.7% chronic wrist pain, no volume association | **BROKEN — misattributed.** PMC12550924 is **Martonovich et al. 2025**, J Functional Morphology and Kinesiology (Israeli cohort, same numbers: 321 practitioners, 56.7%, p=0.758 duration, p=0.455 frequency). Numbers correct; byline and journal wrong. Fix in citations.json. |
| **difiori_2006** | Distal radial fracture-site data underpinning osteoporosis contraindication | **Drift.** DiFiori is about **young gymnast physeal (growth plate) injury**, not adult osteoporotic fracture. Mechanism (load through hand → wrist injury) is analogous but populations differ. Add a "mechanism analog" hedge. |
| **wiesinger_2019** | Tendon adaptation ~8-12 wks collagen turnover; mechanism for wrist volume cap | **Drift.** Cannot verify a 2019 Wiesinger tendon-adaptation paper in German J Sports Med via Scholar. Wiesinger HP publishes tendon work (2017, 2020, 2021, 2024) but not this specific 2019 review. The ~8-12 wk figure is broadly correct in wider tendon literature (Magnusson, Kjaer, Bohm). Verify DOI or replace source. |
| **ludewig_cook_2000** | Serratus/trap endurance for 170° prerequisite | **Match.** |
| **reinold_2007** | RC/deltoid EMG in rehab | **Match.** |
| **karni_1998** | Fast/slow learning phases, M1 remapping ~3 wk | **Match.** PNAS 95:861-868. |
| **walker_2003** | Sleep-dependent motor consolidation; daily-short exposure | **Drift.** Program's inline block cites "Nature 425:616-620 (Dissociable stages)"; citations.json has "Neuroscience 133(4):911-917 (Sleep-dependent motor memory plasticity)". Two different real Walker 2003 papers; both support the same claim. Pick one and wire both files to the same DOI. |
| **shea_morgan_1979** | Blocked > interleaved in acquisition; underpins weeks-1-2 blocked / weeks-3+ interleaved | **Match** — see §4. |
| **sci_reports_2026_handstand_shoulder** | 237 stance phases, pain-associated technique | **Cannot verify.** Nature.com URL fails (303/error); Scholar returns nothing for these keywords. The DOI format s41598-026-51612-w is plausible for a 2026 paper but no independent confirmation. Fix: confirm the paper exists. The "shoulder pain stops session" rule survives on general motor-learning principle even without this study; the "237 stance phases" specifics must go if the paper isn't confirmable. |
| **ferrari_2021** | Walking initiation CoP shift precedes step | **Cannot verify — BROKEN.** Citations entry has no volume/pages/DOI. Scholar returns nothing for a 2021 Ferrari paper on walking initiation in Gait & Posture. The underlying biomechanics claim is standard (Winter 1995, Yiou 2017); the drill design does not need this specific citation. Fix: replace with a real reference or drop the attribution. |
| **simunkova_2024** | UQYBT/CKCUEST show no predictive relationship with handstand E-score | **Match, assumed.** Used correctly as a null-result argument for NOT gating on upper-quadrant screens — good pattern. |
| **wulf_1998** | External > internal focus | **Match.** |
| **wulf_2013** | 15-yr review, ~100 studies confirming external focus | **Match.** |
| **wulf_shea_2002** | Simple-skill CI principles don't fully generalize; reduce challenge early | **Match.** |
| **henry_1968** | Specificity hypothesis | **Match.** |
| **proteau_1992** | Learning specific to sensory conditions | **Match.** |
| **newell_1985** | Constraints-led framework | **Match.** |
| **shea_2000** | Spacing across days > massing within day | **Match.** |
| **robertson_2004** | 4-6h post-practice interference window | **Match.** |
| **schmidt_1975** | Schema theory / variability | **Match.** |
| **sands_2000** | Skill-readiness as injury mitigation | **Match**, and honestly flagged as coach heuristic. |
| **ackerman_1988** | Individual variance in psychomotor learning | **Match.** |
| **wu_2014** | 3× variance in visuomotor rotation learning | **Match.** |

---

## 4. Phase / block structure

**Blocked → interleaved timing (weeks 1-2 blocked, week 3+ interleaved).** Highest-attention area per brief. Shea & Morgan 1979 established blocked > interleaved for acquisition, interleaved > blocked for retention. Program:

- Simple-skill CI evidence supports the transition direction.
- Complex-skill literature (Wulf & Shea 2002; Brady 2004 meta d=0.19 for applied/sport vs d=0.57 lab) supports LATE switching. Two-week floor is a defensible engineering choice for a Tier A user; program flags it as such.
- Tier D users skip blocked entirely — justified by Fitts & Posner autonomous stage; Tier D demonstrably walks 10 m+, so past-cognitive is a reasonable read.

**Verdict:** timing is defensible and not overstated.

**Daily short > infrequent long (4-6 sess/wk).** Karni 1998 + Walker 2003 + Shea 2000 support direction; no direct handstand-frequency RCT. Program flags as engineering.

**Multi-dimensional generation, "weakest capability first" (Henry 1968 / Proteau 1992).** Specificity supports independent tracking. The **weakest-first scheduling rule** is theoretically compatible but not directly RCT'd; program treats it as evidence-based rather than as a specificity-theory extension. Only the Tier D obstacles-vs-turns instance is flagged in `engineering_choices_flagged`. The general rule should be flagged too.

---

## 5. External-focus cue quality (Wulf 2013 definition)

Sampled six drill cues from exercises.json:

- "Push the floor away — grow an inch taller against the wall" — **external, effect-directed.**
- "Point toes at the ceiling and squeeze a coin between the heels" — **mixed.** "Toes at ceiling" is external, "squeeze coin between heels" is a body-proximal cue with imagined-external dressing (McNevin 2003 says farther-external is better; this is close-external at best). Not fatal but worth swapping.
- "Fingertips press small circles on the floor to steer" — **external, movement-effect.** Consistent with Kerwin & Trewartha wrist-strategy framing.
- "Aim toes at one fixed spot on the ceiling" — **external, target-directed.**
- "Send the crown of your head toward the wall in front of you" — **external.**
- "Lean the shape toward the far wall so the step happens on its own" — **external.**

Overall passes external-focus definition. Coin-squeeze is the outlier — swap to a distal target.

---

## 6. Wrist-load / progressive-position check

- Kinoshita 2022 four-position ladder — cited correctly by the program, but not independently verifiable in PubMed/Scholar. Non-blocking; verify DOI.
- Wiesinger 2019 — cannot verify at the claimed source; mechanism is broadly correct from wider tendon literature; program honestly flags 20-30 min/wk cap as engineering.
- Vidal-Torija 2025 — misattributed as above (numbers correct, byline wrong).
- Barlow 2020 age-45 threshold — not independently verified in this review.

---

## 7. Retest metric check

- `wall_hold_max_seconds`, `freestand_hold_max_seconds` — Sobera 2019 supports hold time as a valid novice-to-elite discriminator (CoP variability drops). OK.
- `walk_distance_max_metres` — direct outcome metric. Face-valid; the Ferrari 2021 rationale attached to it should be severed until the citation is fixed.
- Simunkova 2024 used correctly to reject Y-balance/CKCUEST as a gating screen — good honest use of a null result.

---

## 8. Engineering-choice honesty

`engineering_choices_flagged` (ten items) is the strongest evidence the program understands the bar. It correctly names the 20-30 min cap, 10 %/wk increment, 170° prerequisite, 60 s wall-hold gate, 15 s pirouette gate, session length, blocked-week floor, and Tier D obstacles-vs-turns rule as engineering — not evidence.

**Missing:** the general weakest-capability-first scheduling rule (used every session) is treated as evidence-based; it's an extension of specificity, not a directly tested scheduling algorithm. Add it to the flagged list.

---

## 9. Fixes required before REVIEWED

1. **sadowski_2021 → mizutori_2021** in `citations.json`. DOI 10.1371/journal.pone.0253951 belongs to Mizutori. Note "3× BW" is a parallel-bars finding; floor moments are lower.
2. **vidal_torija_2025 → martonovich_2025** in `citations.json`. PMC12550924 is Martonovich et al. in J Functional Morphology and Kinesiology. Numbers correct; byline/journal wrong.
3. **Resolve ferrari_2021.** Either add real DOI/volume, or replace with a verified walking-initiation reference (Yiou 2017, canonical Winter work). The drill design doesn't need this specific citation.
4. **Resolve sci_reports_2026_handstand_shoulder.** Confirm the paper exists at the claimed URL. If it doesn't, drop the "237 stance phases" and "shorter effective arm length / axial torsional work" specifics; the "shoulder pain stops session" rule survives on general principle.
5. **Reconcile walker_2003.** Program's reference block cites Nature 425:616-620; citations.json has Neuroscience 133(4):911-917. Pick one.
6. **Add DOI / PubMed ID to kinoshita_2022 and wiesinger_2019.** If unlocatable, downgrade rhetoric or swap.
7. **Add the general weakest-capability-first rule to `engineering_choices_flagged`** (currently only Tier D obstacles-vs-turns is flagged).
8. **Swap the "squeeze a coin between the heels" cue** for a farther external target (e.g., "point toes at the light fixture overhead"). Minor.
9. **Optionally hedge the DiFiori 2006 use** with "young-gymnast literature; mechanism analog for adult low-BMD".

After 1-6 are addressed, this program passes REVIEWED. 7-9 are polish.

---

## 10. What I did NOT check

- Rohleder & Vogt 2018, Barlow 2020, Ludewig & Cook 2000, Reinold 2007, Ludewig & Reynolds 2009, Simunkova 2024, Blenkinsop 2017, Sobera 2019 — accepted whitepaper alignment; abstract-level WebFetch was blocked (403 / redirect issues).
- Full exercises library (30 hs_* drills). Sampled six for cue quality; did not audit prerequisites on the remaining 24.
- Adaptive engine hook implementation — reviewed the described intent, not the code.
- Cross-program citation reuse (e.g., whether Wulf 2013 or Karni 1998 are used consistently across other program JSONs).
