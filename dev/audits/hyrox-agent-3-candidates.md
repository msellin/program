# HYROX programme candidates for Terav — Agent 3 report

Author perspective: concrete Terav programme proposals — what we should
actually build, in what order, and what each one's tier structure +
retest metric looks like.

Anchored to the brief in `hyrox-research-brief.md`. Reference programmes
studied for schema fidelity: `rowing-2k-test-prep.json` (6-week race
prep, tapered, threshold-anchored, 28 citations) and
`concurrent-strength-maintenance.json` (8-week hybrid, 32 citations,
Schumann-2022 explosive-strength discipline).

---

## Executive summary

1. **Build three programmes, not one.** The catalog already has an
   ordered path — Engine Builder → CSM → Rowing 2K Test Prep — that
   maps cleanly onto a HYROX athlete's development. HYROX-specific
   programming should mirror that ladder:
   `HYROX Base` → `HYROX Race Prep` → `HYROX Doubles/Peaking`. Each
   answers a distinct question and each has its own retest metric.
2. **HYROX should be its own catalog category, not a variant tag.** The
   manifest already has the `hyrox` slot (order 5). The evidence
   justifies dedicated programmes: the race is not "CrossFit but
   different" — it is a running-dominant hybrid event where the biggest
   performance lever (VO2max, ρ = −0.71 in Brandt 2025) is not what
   most athletes train. A tag on Engine Builder or CSM would hide this.
3. **The Base programme is where Terav has the strongest edge.** Most
   HYROX plans on the market rush athletes into race-simulation work
   before their aerobic base can absorb it. Base = 8 weeks of Z2
   running + station-technique + threshold introduction, positioned
   downstream of Engine Builder. Retest = compromised-1km run time at
   fixed post-station HR.
4. **Race Prep is a 6-week block, tapered, closely modelled on
   Rowing 2K Test Prep.** It assumes a Base (either HYROX Base or
   equivalent) is already in place. Programmed around one Compromised
   Long session, one threshold run, one strength maintenance day, and
   Z2 volume. Taper is Bosquet 2007 (2-week exponential fast-decay,
   volume −41 to −60%, intensity held).
5. **Evidence base is available — anchor programme is Brandt 2025.** The
   first peer-reviewed HYROX physiology paper (Frontiers in Physiology,
   DOI 10.3389/fphys.2025.1519240) documents the exact HR / lactate /
   RPE profile of a full race and identifies VO2max, endurance training
   volume, and body-fat % as the significant performance predictors —
   grip strength and resistance-training volume did *not* correlate.
   That single paper is worth 6-8 citations across all three
   programmes. Everything else layers on standard endurance +
   concurrent + taper literature we already own (Seiler, Joyner &
   Coyle, Helgerud, Robineau, Schumann, Wilson, Mujika, Bosquet).

---

## 1 · Catalog positioning — category or tag?

### Recommendation: dedicated `hyrox` category

The manifest already declares it (`categories.hyrox`, order 5). Populate
it. Reasons:

- **Distinct retest metrics.** Engine Builder retests submax HR + 5min
  test. CSM retests 5RM + submax HR. Rowing 2K retests the 2K time.
  HYROX programmes retest race-specific compound metrics — compromised
  1km, projected finish time, station repeatability — that don't
  belong on any of the existing programme cards.
- **Distinct prerequisites narrative.** A HYROX athlete needs to know
  "you should complete Engine Builder or an equivalent Z2 base first"
  — that story is muddled if HYROX is a tag on Engine Builder itself.
- **Marketing / discovery.** HYROX is a sport people search for by
  name. A category surfaces the three programmes as a coherent ladder.
- **Adaptive engine hooks differ.** HYROX programmes must respond to a
  race date (deterministic taper anchor) — none of the current
  categories model that except Rowing 2K.

Variant tags could be layered on top later — e.g. tag CSM with
`hyrox-compatible-block` for athletes who want to strength-maintain
inside a longer HYROX arc — but the primary content lives in the
category.

### Stepping stones

```
Engine Builder (8 wk, Z1/Z2 base)
        │
        ▼
HYROX Base (8 wk, running + station tech + threshold intro)
        │
        ▼
HYROX Race Prep (6 wk, race-specific, tapered)
        │
        ▼   (optional, only if a specific event)
HYROX Doubles / Peaking layer
```

Every arrow honours the same principle Rowing 2K Test Prep does: the
downstream block *assumes* the upstream one, and refuses to start
without it (safety gate or intake question — same pattern as
"Do you have a current back-squat 5RM you'd rather not lose?" in CSM).

---

## 2 · Programme candidates

Three candidates below. Each includes name, pitch, audience,
prerequisites, duration, phase structure, tier structure, retest metric,
block list, and evidence-base anchors.

---

### 2.1 · Candidate A — HYROX Base

**Pitch (one sentence):** Eight weeks that turn a Z2 aerobic base into
a HYROX-shaped engine — station technique, compromised running,
threshold — so the race-prep block six months later isn't the first
time you push a sled.

**Target audience:** Athletes who can hold Z2 pace 45 min without
HR runaway (Engine Builder graduate or equivalent) and who intend to
race HYROX within the next 6-12 months. Explicitly *not* for
race-week prep.

**Prerequisites (honest):**

- Aerobic base of ≥4 weeks Z2 in the last quarter (or Engine Builder
  Block 1 completed).
- Access to sled (or heavy sled-analog — reverse-drag Prowler, resisted
  march), wall ball, kettlebells or dumbbells (farmer's carry loading),
  a rowing erg, and preferably a ski erg. If missing 2+, defer to
  Engine Builder + CSM combo instead.
- No unmanaged hypertension, no exertional syncope history, no acute
  low-back / knee / achilles flare.

**Duration:** 8 weeks. Not shorter — 8 weeks is the minimum window
concurrent-training literature (Schumann 2022, Wilson 2012 meta) needs
to detect a submax HR shift *while* preserving strength.

**Phase structure (3 phases):**

| Phase | Weeks | Focus | Cited rationale |
|---|---|---|---|
| **P1 · Base + Introduction** | 1-3 | 4 Z2 sessions/wk + 1 strength maintenance + 1 station-technique circuit. No station load-cost yet. | Seiler 2010 polarised 80/20 anchor. Brandt 2025: endurance training volume was the second-strongest predictor after VO2max. |
| **P2 · Threshold + Compromised** | 4-6 | Add 1 threshold run/wk + 1 compromised block/wk. Strength held at RPE ≤ 7. | Helgerud 2007 (4×4 dose gives +7.2% VO2max in 8 wk at 3×/wk; we prescribe 1×/wk for concurrent compatibility per Robineau 2016). Compromised-run block cites Fyfe 2016: intensity doesn't mediate interference, volume does — so we can afford one compromised session/wk. |
| **P3 · Consolidation + Retest** | 7-8 | Deload week 7. Retest submax HR at fixed pace + compromised-1km at fixed post-station HR. | Coyle 1984 detraining timeline informs deload depth. Retest = the honest signal that the block worked. |

**Tier structure:**

| Tier | Entry condition | Typical outcome (Week 8) | Confidence |
|---|---|---|---|
| **Foundation** | No previous HYROX exposure OR self-reported 5km run > 27 min | Submax HR −8 to −15 bpm at fixed pace. Sled push technique locked in at prescribed load. First unbroken 50 wall balls without form breakdown. | Realistic |
| **Progression** | 5km 24-27 min, occasional sled/wall-ball work | Submax HR −5 to −10 bpm. Compromised-1km within 15-25 sec of open 1km. Full-load sled push repeatable 3× in a session. | Realistic |
| **Push** | 5km < 24 min, prior HYROX finisher or CrossFit competitor | Submax HR −3 to −6 bpm. Compromised-1km within 10-15 sec of open 1km. VO2max ceiling in view — HERITAGE non-response distribution begins to dominate (Bouchard 1999). | Stretch |

**Program goal metric:**
`compromised_1km_seconds` — 1km run performed immediately after a
50m sled push at prescribed HYROX Open load. Cited under "compromised
running" as the highest-face-validity HYROX-specific retest short of a
full race sim. Direction: lower is better.

**Retest cadence:** Baseline in Week 1; retest in Week 4; final in
Week 8. Reported alongside `submax_hr_pace5_bpm` as secondary metric.

**Blocks (7 total):**

1. `block_z2_run` — 2×/wk, 40-60 min. Nose breathing where possible.
   Wilson 2012 modality-interference note: running has more
   interference cost than row/bike; we accept it here because HYROX
   *is* the running-dominant sport (Brandt 2025 — running = 59% of
   race time). No modality substitution for this block.
2. `block_z2_row_or_ski` — 1×/wk, 40 min. Adds Z2 volume without
   running impact-cost. Brandt 2025 authors explicitly recommend
   substituting some running with rowing/skiing "to reduce injury
   risk."
3. `block_station_technique` — 1×/wk, 45 min. Untimed. Sled push at
   50-70% Open load, wall balls (unbroken sets of 10-20), sandbag
   lunges (bodyweight sandbag), farmer's carry (moderate load, focus
   on gait). Purpose: neural pattern lay-down before load-cost is
   layered on. Cites Proteau 1992 / Henry 1968 (task specificity).
4. `block_threshold_row_or_ski` — 1×/wk from Week 3, 35 min. 4×8 min
   at threshold pace / 2 min rest. Erg preferred over run for cited
   modality-interference reasons (Wilson 2012, Doma 2019). Threshold
   pace shift 3-6% expected in 4-8 weeks (Astorino 2013).
5. `block_compromised_short` — 1×/wk from Week 4, 30-40 min. 5 rounds
   of (2 min sled push simulation at 60% Open load) + (400m run at
   threshold-ish pace). Cites Brandt 2025 (post-station HR 173 bpm,
   lactate 8.5 mmol/L — replicate the metabolic profile in training).
6. `block_strength_maintenance` — 1×/wk, 45 min. Front squat +
   Romanian deadlift + push press. RPE ≤ 7. Follows CSM's Schumann
   2022 explosive-strength discipline verbatim. No wall-ball loading
   here — station work does that.
7. `block_deload_recovery` — Week 7. Volume −50%, intensity held.
   Mujika 2000 (Part II) taper physiology applied at maintenance
   scale.

**Evidence base — anchor citations (18):**

1. **Brandt 2025** — First HYROX physiology paper. DOI 10.3389/fphys.2025.1519240. Frontiers in Physiology 16:1519240. Anchor for: race demands profile, VO2max as #1 predictor, station-vs-run HR/lactate/RPE difference, wall balls as highest-demand station.
2. **Seiler 2010** — Polarised 80/20 distribution. IJSPP 5(3):276-291. Anchor for Z2 dominance.
3. **Helgerud 2007** — 4×4 protocol, +7.2% VO2max at 3×/wk × 8 wk. MSSE 39(4):665-671. Anchor for threshold interval dose.
4. **Joyner & Coyle 2008** — Threshold > VO2max as trainable metric. J Physiol 586(1):35-44.
5. **Astorino 2013** — 3-6% threshold shift in 4-8 wk. JSCR 27(1):138-145.
6. **San-Millán & Brooks 2018** — Z2 anchor (blood lactate < 2 mmol/L). Sports Med 48:467-479.
7. **Wilson 2012** — Concurrent training meta. Modality interference (run > cycle ≈ row). JSCR 26(8):2293-2307.
8. **Robineau 2016** — 6h separation rule for same-day concurrent. JSCR 30(3):672-683.
9. **Eddens 2018** — Lift-first same-day (+6.91% lower-body dynamic strength). Sports Med 48(1):177-188.
10. **Schumann 2022** — Concurrent meta update. Explosive-strength SMD −0.28 (p = 0.007). Sports Med 52(3):601-612. Anchor for RPE ≤ 7 ceiling.
11. **Fyfe 2016** — Endurance intensity does NOT mediate interference; volume does. Front Physiol 7:487. Anchor for permitting 1 compromised session/wk without breaking strength floor.
12. **Doma 2019** — Bidirectional damage; running impairs subsequent squat 24-48h. Sports Med 49(5):669-682.
13. **Proteau 1992** — Specificity of practice. QJEP 44A:557-575. Anchor for station-technique block.
14. **Henry 1968** — Task specificity foundation.
15. **Coyle 1984** — Detraining timeline. J Appl Physiol 57(6):1857-1864. Anchor for deload depth.
16. **Ross 2015** — Non-response drops from 50% to 0% between intensity brackets. Mayo Clin Proc 90(11):1506-1514. Push-tier honesty.
17. **Bouchard 1999** (HERITAGE) — Individual response variance. J Appl Physiol 87(3):1003-1008.
18. **Rønnestad & Mujika 2014** — Optimising strength training for endurance performance. Scand J Med Sci Sports. Anchor for `block_strength_maintenance` design.

---

### 2.2 · Candidate B — HYROX Race Prep

**Pitch (one sentence):** Six weeks, race-anchored, tapered — sharpen
compromised running and full-race pacing without ruining recovery.

**Target audience:** Athletes with a HYROX event within 6-8 weeks,
who have completed HYROX Base (or equivalent — 8+ weeks of
running-dominant hybrid work in the last quarter) and have all-station
familiarity.

**Prerequisites (honest, gated at intake):**

- A confirmed race date (or approximate window). Without one, the
  taper anchor is arbitrary — the programme refuses to start and
  routes the athlete to HYROX Base.
- HYROX Base completed OR self-reported ability to complete a full
  race simulation (all 8 runs + 8 stations at any pace) within the
  last 8 weeks.
- No unmanaged hypertension, no exertional syncope history, no acute
  flare of any station-loading joint.

**Duration:** 6 weeks. Identical shape to Rowing 2K Test Prep because
that shape is validated (Mujika 2000, Bosquet 2007 — 2-week taper is
the effective sweet spot).

**Phase structure (3 phases):**

| Phase | Weeks | Focus | Cited rationale |
|---|---|---|---|
| **P1 · Base check** | 1-2 | Establish baseline: full compromised-1km, full race-simulation quarter (2 runs + 2 stations at target pace). Sharpen transitions. | Same principle as Rowing 2K "Base check": you can't adapt from an unknown starting point. |
| **P2 · Threshold + Race-pace build** | 3-4 | 1× threshold run + 1× race-pace compromised session per week. Add half-race sim in Week 4. | Joyner & Coyle 2008 threshold-centric prep. Task-specificity (Proteau 1992) requires race-pace exposure; half-sim is Mujika's "specific overload" phase. |
| **P3 · Taper + Race** | 5-6 | Volume −45%, intensity held. One race-pace tune-up mid-week 5, easy recovery only in Week 6 leading to race day. | Bosquet 2007: 2-week exponential fast-decay taper, volume −41 to −60%, intensity held → mean performance uplift 2.14% (95% CI 1.5-2.7). Mujika 2000. |

**Tier structure:**

| Tier | Entry condition | Typical outcome (race day) | Confidence |
|---|---|---|---|
| **Foundation** | Prior HYROX finish > 1:35 OR first-time racer with Base completed | Finish 5-15 min faster than baseline sim, or first legal finish for first-timers. Sub-90 not promised. | Realistic |
| **Progression** | Prior finish 1:15-1:35 | Finish −3 to −7 min. Compromised-1km down 5-15 sec. | Realistic |
| **Push** | Prior finish < 1:15 (approx. 90th percentile for Open) | Finish −1 to −4 min. HERITAGE non-response distribution begins to dominate — the 2-3% Bosquet taper uplift is the primary lever. | Stretch |

Outcome ranges are **projected finish time deltas relative to a
Week-1 race simulation**, not absolute finish-time promises. This
mirrors the honesty of Rowing 2K's tier ranges ("2K down 15-30
seconds", not "you will run 8:00").

**Program goal metric:**
`projected_hyrox_finish_seconds` — computed from Week 1 half-sim
extrapolated to full race, then re-measured at end of Week 5. The
retest is not a full race sim (would break taper) — instead, sum of
best 4 individual station times + best 4 individual km run times from
recent log.

**Retest cadence:** Baseline in Week 1 (half-sim). Mid-check in Week
4 (half-sim). Final in Week 5 (assembled projection, no full sim
during taper).

**Blocks (8 total):**

1. `block_z2_run` — 2×/wk. Aerobic maintenance.
2. `block_threshold_run` — 1×/wk in P2. 4×6 min at threshold pace,
   90 sec jog rest.
3. `block_race_pace_compromised` — 1×/wk in P2 and Week 5. 4 rounds
   of (station work at Open load, 2 min) + (1km run at target race
   pace, ~4-5 min). Cites Brandt 2025 station profile.
4. `block_half_race_sim` — Weeks 2 and 4. 4 runs + 4 stations at
   target pace. Not full effort. Documents pacing discipline.
5. `block_transition_practice` — 1×/wk, 20 min. Race-day-legal
   transitions (jog into station, chalk / grip, first-rep timing).
   Under-cited in the literature but coaching-consensus (flagged).
6. `block_strength_holding` — 1×/wk in P1-P2 only, dropped in taper.
   RPE ≤ 6. Front squat + press pattern. Purpose: preserve neural
   drive without adding recovery cost. CSM's Schumann 2022 discipline.
7. `block_easy_recovery` — 1×/wk. 25-30 min easy. Elevated in taper.
8. `block_race_day_activation` — Race morning only. 10 min warm-up
   template: 3 min Z2 row, 2 min dynamic drills, 5×(15 sec sled push
   at 40% load), 2 sets of 10 wall balls. Cites Bishop 2003
   post-activation potentiation for hybrid prep — flagged as
   coaching-consensus in taper context.

**Evidence base — anchor citations (18):**

1. **Brandt 2025** — Anchor for race demands, VO2max primacy, station HR/lactate profile.
2. **Bosquet 2007** — Taper meta-analysis. MSSE 39(8):1358-1365. DOI 10.1249/mss.0b013e31806010e0. Anchor for taper shape.
3. **Mujika & Padilla 2000 Part I** — Detraining. Sports Med 30(2):79-87.
4. **Mujika & Padilla 2000 Part II** — Taper mechanisms. Sports Med 30(3):145-154. Anchor for the ~3% performance uplift.
5. **Seiler 2010** — Polarised distribution held even in race prep.
6. **Joyner & Coyle 2008** — Threshold-centric racing physiology.
7. **Helgerud 2007** — Interval dose. Not the primary tool in race prep, but referenced for P2 threshold session design.
8. **Astorino 2013** — Threshold shift range.
9. **Proteau 1992** — Task specificity → race-pace work.
10. **Henry 1968** — Specificity foundation.
11. **Buchheit & Laursen 2013 Part I** — HIIT programming variables. Sports Med 43(5):313-338. Interval work:rest ratio design.
12. **Buchheit & Laursen 2013 Part II** — Anaerobic programming. Sports Med 43(10):927-954.
13. **Wilson 2012** — Modality interference — informs P3 shift toward run-first sessions.
14. **Schumann 2022** — Explosive-strength SMD −0.28. Anchor for dropping strength in Week 5-6.
15. **Ross 2015** — Non-response. Push-tier honesty.
16. **Bouchard 1999** (HERITAGE) — Response variance.
17. **Rønnestad & Mujika 2014** — Strength training for endurance performance. Anchor for tapering strength before endurance.
18. **Blazevich 2003** — Neural facilitation via short strength exposure pre-race. J Strength Cond Res. Flagged as coaching-consensus for `block_race_day_activation`.

---

### 2.3 · Candidate C — HYROX Doubles Prep

**Pitch (one sentence):** Six weeks for two athletes racing together —
partner transitions, pace-matching within the 15-second HYROX doubles
rule, and station splits chosen to bank on complementary strengths.

**Target audience:** Two athletes registering for HYROX Doubles or
Mixed Doubles. At least one has completed HYROX Base or Race Prep;
the second is at least Engine-Builder-graduate level.

**Prerequisites (honest, gated at intake):**

- Race date confirmed.
- Both athletes' current 5km run time — used to enforce pace-match
  discipline (the 15-second per-km rule is where doubles teams blow
  up most often).
- Both athletes' current sled-push, wall-ball, and rowing capability
  at Open load. Used to auto-generate a station split proposal.

**Duration:** 6 weeks. Same shape as Race Prep, taper included.

**Why this exists as a separate programme:** Doubles is not "Race
Prep, but shorter." The programming problem is different — half the
attention goes to *partner mechanics* (transitions, pace-matching,
station splits) that solo Race Prep doesn't touch. The Terav adaptive
engine has a specific opportunity here: the intake collects both
athletes' capability data and can propose an optimal station split
(who does more wall balls, who does more sled) based on their
relative strengths. Nothing else in the catalog does two-user
programming.

**Phase structure (3 phases):** Same shape as Race Prep — Base
check (2 wk) → Race-pace build (2 wk) → Taper + Race (2 wk). Details
in the block list below.

**Tier structure:**

| Tier | Entry condition | Typical outcome | Confidence |
|---|---|---|---|
| **Foundation** | Neither has raced HYROX before; first-time doubles team | Clean legal finish. Established station split held under fatigue. | Realistic |
| **Progression** | At least one prior HYROX (solo or doubles) finish; combined 5km avg 22-26 min | Finish −3 to −6 min vs Week-1 half-sim. Transitions under 5 sec average. | Realistic |
| **Push** | Both athletes prior HYROX finish (< 1:20 solo equivalent) | Finish −1 to −3 min. Split optimisation is the primary lever, not physiology gains. | Stretch |

**Program goal metric:**
`projected_doubles_finish_seconds` — same computation approach as
Race Prep, adjusted for the doubles format's per-station allocation.

**Blocks (8 total):**

1. `block_z2_run_solo` — 2×/wk, individually. Each athlete runs at
   own Z2 HR, not paired.
2. `block_paired_pace_run` — 1×/wk, 30-40 min. Both athletes run
   Z2/threshold-adjacent side by side. Purpose: neurological
   pace-matching for race day.
3. `block_transition_drill` — 1×/wk, 25 min. Timed handoffs at each
   station type. Not physiologically loading — pattern lay-down.
4. `block_split_race_pace` — 1×/wk in P2. Each partner completes
   their allocated portion of a station at target race pace, then
   the other picks up mid-station. Sums to a race-pace station
   completion.
5. `block_half_race_sim_doubles` — Weeks 2 and 4. 4 runs + 4
   stations, doubles rules, at ~85% target pace.
6. `block_strength_holding` — 1×/wk in P1-P2 each athlete, dropped
   in taper.
7. `block_easy_recovery` — 1×/wk. Recovery.
8. `block_race_day_activation_doubles` — Race morning. Same as
   solo, plus a first-transition drill so the opening handoff is
   automatic.

**Evidence base — anchor citations (16):**

Reuses the Race Prep evidence base almost verbatim. Doubles-specific
citations:

- HYROX Rulebook — pace-match ≤ 15 sec constraint. Not peer-reviewed;
  cited as the rule.
- Farmer's-walk unilateral-load research (Holmstrup et al.) — informs
  when to split farmer's carry vs alternate.
- **New for Doubles:** Loaded-carry EMG literature (McGill 2010 style
  core stabilisation citations) for the farmer's-carry allocation
  decision — a lighter partner can *still* do farmer's carry if the
  loaded torso mechanics are trained.

Doubles-specific practice literature is thin. Most citations flagged
`coaching_consensus` for partner-mechanics blocks. This is the
weakest evidence base of the three programmes and should be
acknowledged in the programme's `engineering_choices_flagged`
section.

---

## 3 · Recommended build order

1. **Ship HYROX Base first.** Highest-leverage, cleanest evidence base,
   longest tail (many athletes will spend 8-16 weeks here across
   multiple race cycles). It also reveals what the adaptive engine
   needs to do for HYROX-shaped athletes — station-technique
   progressions, running + station load interactions — which unblocks
   the other two programmes.
2. **Ship HYROX Race Prep second.** Reuse ~70% of the retest and
   taper machinery from Rowing 2K Test Prep. Add race-date-anchored
   phase generation. The engine work here is genuinely reusable —
   any future race-prep programme benefits.
3. **Ship HYROX Doubles Prep third.** The two-athlete intake and
   split-recommendation engine is genuinely new territory and
   deserves its own iteration cycle. Consider betaing with a single
   team before generalising.

Doubles is the *most differentiated* programme (nobody in the market
programs it well) but also the *thinnest evidence base*. Sequencing
Base → Race Prep → Doubles builds credibility before pushing into
the ambiguous zone.

---

## 4 · What HYROX Base is genuinely new territory that existing 5 don't cover

- **Compromised running.** No existing Terav programme trains running
  under station-induced fatigue. Engine Builder is aerobic-clean;
  CSM is intervals-adjacent; Rowing 2K is erg-only. Compromised
  running is the highest-face-validity HYROX skill and the biggest
  physical differentiator between novice and Push-tier HYROX
  finishers (Brandt 2025, Redbull 2026 practitioner review).
- **Load-cost of specific stations.** The sled push (metabolic + high
  horizontal-force cost), wall balls (highest measured HR / lactate /
  RPE station in Brandt 2025), and sandbag lunges (unilateral gait
  under axial load) don't map onto any existing block. Each needs
  its own progression logic that the adaptive engine can drive.
- **Race-date-anchored taper.** Rowing 2K has this. CSM does not.
  Engine Builder does not. HYROX Race Prep needs it too, but the
  Base programme benefits from the athlete declaring a race date
  early so that Base itself can be timed to end 6-8 weeks before
  the event.
- **Two-athlete intake (Doubles only).** No existing programme
  requires paired capability data. Adaptive-engine implication:
  the intake schema needs a `partner` variant.

---

## 5 · Retest metrics — what actually gets measured

Following the Rowing 2K + CSM pattern of one primary + one secondary
retest per programme:

### HYROX Base

- **Primary:** `compromised_1km_seconds` — 1km run immediately after
  a 50m sled push at prescribed load. Direction: lower is better.
  Cadence: Weeks 1, 4, 8.
- **Secondary:** `submax_hr_pace5_bpm` — 5 min at fixed run pace
  (e.g. 5:30/km), record steady-state HR. Same protocol as CSM.

### HYROX Race Prep

- **Primary:** `projected_hyrox_finish_seconds` — sum of best 4
  station times + best 4 km run times from recent log, extrapolated
  to full race. Direction: lower is better.
- **Secondary:** `threshold_pace_run_seconds_per_km` — from the
  weekly threshold run, running-specific analog of Rowing 2K's
  threshold-pace metric.

### HYROX Doubles Prep

- **Primary:** `projected_doubles_finish_seconds` — computed from
  the paired half-race sims.
- **Secondary:** `paired_1km_pace_delta_seconds` — the per-km pace
  difference between the two athletes over the paired-pace runs.
  Direction: closer to zero is better (must stay under 15 sec/km
  per rules).

---

## 6 · Open questions — where the evidence runs out

1. **How much strength maintenance survives the taper?** Bosquet
   2007 is endurance-athlete data. Schumann 2022 concurrent data
   doesn't cover a 2-week no-lift block. Dropping strength entirely
   in Weeks 5-6 is engineering inference — acceptable for a race
   prep block but should be flagged.
2. **Is 1×/wk the right dose for compromised running?** Practitioner
   consensus is 1-2×/wk. No RCT of "compromised running" as a
   distinct dose vs plain interval work at matched physiological
   load. Should default to 1×/wk in Base and 2×/wk peak in Race Prep,
   flagged `coaching_consensus`.
3. **Station-technique block frequency in Base.** No literature on
   how often to practice sled push / wall balls for
   neurological-pattern lay-down. 1×/wk is a coaching-consensus
   engineering choice.
4. **Doubles split-recommendation algorithm.** No literature on
   optimal station allocation between two athletes. First version
   should be a simple relative-strength weighted split — but this
   should be an editable proposal, not a fixed prescription.
5. **How does the model handle athletes with prior HYROX PRO
   experience?** Both current-catalog Push-tier examples (CSM,
   Rowing 2K) end at intermediate-advanced. HYROX PRO (heavier
   loads: 200kg sled, 30lb wall ball) is a separate physiological
   domain. Decision needed: is PRO a fourth tier, or a separate
   programme entirely? Recommendation: keep the three programmes
   Open-focused, add a "PRO variant" tag on Race Prep in a later
   iteration.
6. **Does HYROX Base replace or complement CSM for a HYROX
   athlete?** Both share concurrent-training DNA. Should they be
   mutually exclusive (interference_hints.incompatible_with)?
   Recommendation: yes — running an athlete through both
   simultaneously breaks the strength floor guarantee that CSM
   makes. HYROX Base *is* the concurrent block for HYROX athletes.
7. **What if the athlete has no sled access?** Recovery-drag with a
   heavy prowler or resisted-sprint band is a partial substitute
   (Morin 2015 horizontal-force literature supports the analog).
   But wall balls, sandbag lunges, and rowing/skiing lack good
   substitutes. Programme should refuse to start if 2+ station
   analogs are missing.

---

## 7 · Adaptive-engine hooks specific to HYROX programmes

Cribbed from CSM's pattern (`adaptive_engine_hooks` array) and
extended:

- **Race-date anchor.** Race date collected at intake drives phase
  end-dates. If the athlete pushes the race date, taper shifts.
- **Compromised-run trend slope.** If Weeks 1-4 `compromised_1km`
  trend is flat or worsening, drop a Z2 session and add a technique
  session (fatigue may be masking a mechanics problem).
- **HR at fixed sled-push load.** If HR at prescribed sled load
  stays > 90% max for > 3 sessions, load is too high — auto-propose
  a 10% deload on the sled prescription.
- **Life-load signal.** If athlete logs 3+ high-life-load days in a
  week during Race Prep P2 (highest-load phase), swap one
  compromised session for a Z2 session next week. Cost-bounded
  discipline is non-negotiable for a race-anchored block.
- **Cross-programme interference guard.** If athlete has an active
  CSM block or Engine Builder block, HYROX Base is blocked from
  starting (interference_hints.incompatible_with). Same rule as
  Rowing 2K.

---

## 8 · Summary — the three-programme HYROX catalog

| Programme | Duration | Primary retest | Best-fit athlete | Positioned after |
|---|---|---|---|---|
| **HYROX Base** | 8 wk | Compromised-1km | HYROX athlete with Z2 base, race 3-6 months out | Engine Builder |
| **HYROX Race Prep** | 6 wk | Projected finish time | HYROX athlete with race in 6-8 weeks | HYROX Base (or equivalent) |
| **HYROX Doubles Prep** | 6 wk | Paired projected finish | Two athletes racing doubles together | Each has HYROX Base or equivalent solo experience |

All three:

- Multi-tier (Foundation / Progression / Push) with honest,
  literature-anchored outcome ranges.
- Cite Brandt 2025 as the anchor race-physiology paper.
- Use the CSM Schumann 2022 explosive-strength discipline for their
  strength blocks.
- Use the Rowing 2K taper machinery (Mujika 2000, Bosquet 2007) where
  a race date is declared.
- Refuse to run alongside Engine Builder or CSM (interference guard).

Ship in the order listed.

---

## Literature cited — verifiable sources

Peer-reviewed (verifiable URLs / DOIs):

- Brandt T, Ebel C, Lebahn C, Schmidt A (2025). *Acute physiological
  responses and performance determinants in Hyrox©.* Frontiers in
  Physiology 16:1519240.
  https://doi.org/10.3389/fphys.2025.1519240
  [Primary HYROX physiology anchor — VO2max ρ = −0.71, mean race HR
  170.9 bpm, lactate 8.5 mmol/L, wall balls = highest-demand
  station.]
- Seiler S (2010). *What is best practice for training intensity and
  duration distribution in endurance athletes?* IJSPP 5(3):276-291.
- Helgerud J, Høydal K, Wang E, et al. (2007). *Aerobic high-intensity
  intervals improve VO2max more than moderate training.* MSSE
  39(4):665-671.
- Joyner MJ, Coyle EF (2008). *Endurance exercise performance: the
  physiology of champions.* J Physiol 586(1):35-44.
- Astorino TA, Allen RP, Roberson DW, Jurancich M (2013). *Effect of
  high-intensity interval training on cardiovascular function,
  VO2max, and muscular force.* JSCR 27(1):138-145.
- San-Millán I, Brooks GA (2018). *Assessment of metabolic
  flexibility.* Sports Med 48:467-479.
- Wilson JM, Marin PJ, Rhea MR, et al. (2012). *Concurrent training:
  a meta-analysis.* JSCR 26(8):2293-2307.
- Robineau J, Babault N, Piscione J, et al. (2016). *Specific training
  effects of concurrent aerobic and strength exercises depend on
  recovery duration.* JSCR 30(3):672-683.
- Eddens L, van Someren K, Howatson G (2018). *The role of
  intra-session exercise sequence in the interference effect.*
  Sports Med 48(1):177-188.
- Schumann M, Feuerbacher JF, Sünkeler M, et al. (2022).
  *Compatibility of concurrent aerobic and strength training.*
  Sports Med 52(3):601-612.
- Fyfe JJ, Bishop DJ, Zacharewicz E, et al. (2016). *Concurrent
  exercise incorporating high-intensity interval or continuous
  training modulates mTORC1 signaling.* Front Physiol 7:487.
- Doma K, Deakin GB, Bentley DJ (2019). *Implications of impaired
  endurance performance following single bouts of resistance
  training.* Sports Med 49(5):669-682.
- Mujika I, Padilla S (2000, Part I + II). *Detraining.* Sports Med
  30(2):79-87 and 30(3):145-154.
- Bosquet L, Montpetit J, Arvisais D, Mujika I (2007). *Effects of
  tapering on performance: a meta-analysis.* MSSE
  39(8):1358-1365. DOI 10.1249/mss.0b013e31806010e0.
- Rønnestad BR, Mujika I (2014). *Optimizing strength training for
  running and cycling endurance performance: a review.* Scand J Med
  Sci Sports 24(4):603-612.
- Buchheit M, Laursen PB (2013, Part I + II). *High-intensity
  interval training, solutions to the programming puzzle.* Sports
  Med 43(5):313-338 and 43(10):927-954.
- Coyle EF, Martin WH, Sinacore DR, et al. (1984). *Time course of
  loss of adaptations after stopping prolonged intense endurance
  training.* J Appl Physiol 57(6):1857-1864.
- Proteau L, Marteniuk RG, Lévesque L (1992). *A sensorimotor basis
  for motor learning.* QJEP 44A:557-575.
- Henry FM (1968). *Specificity vs generality in learning motor
  skill.*
- Bouchard C, An P, Rice T, et al. (1999). *Familial aggregation of
  VO2max response to exercise training: HERITAGE Family Study.*
  J Appl Physiol 87(3):1003-1008.
- Ross R, de Lannoy L, Stotz PJ (2015). *Separate effects of
  intensity and amount of exercise on interindividual
  cardiorespiratory fitness response.* Mayo Clin Proc
  90(11):1506-1514.
- Morin JB, Petrakos G, Jiménez-Reyes P, et al. (2015). *Very
  heavy sled training for improving horizontal-force output in
  soccer players.* IJSPP 12(6):840-844. [Sled-push horizontal-force
  citation for compromised running block.]
- Holmstrup ME, Kelley MR, Calhoun KR, Kiess JP (2018). *Fat-Free
  Mass and BESS Predict Maximal Load in the Unilateral Farmer's
  Walk.* JSSM 17:167-173. [Farmer's-walk loading standards.]

Practitioner (attributed, not peer-reviewed):

- Warrior Performance Lab — HYROX stations anatomy + neuromuscular
  demands review.
- HyroxDataLab — 700K+ race results dataset, tier percentile
  benchmarks.
- Roxlyfe — HYROX Elite 15 (2026) athlete profiles and training
  volumes.
- Hunter McIntyre / HAOS training — 3× HYROX PRO world champion
  training template.
- Longitudinal PRO/ELITE performance analysis (Frontiers in
  Physiology 2026, DOI 10.3389/fphys.2026.1847569) — evolution of
  ELITE median times from 1:06:24 to 0:57:17 over seven seasons.
  Anchor for "Push tier realistic outcome" bounds.

Sources also cited practitioner-level (in Race Prep engineering
choices only):

- Compromised Running (compromisedrunning.com) — practical
  compromised-run session templates.
- Redbull HYROX Academy — "Train smarter not harder" research
  digest 2025.
- FORMD "Running is 60% of your race" — race-time-share analysis.
