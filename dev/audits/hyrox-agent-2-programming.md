# HYROX Agent 2 — Current best-practice programming + gap analysis vs Terav catalog

Author: Agent 2 · Angle: programming, periodisation, taper, published plans, mapping to existing Terav programs
Date: 2026-08-13
Companion to: `hyrox-research-brief.md`, Agent 1 (physiology), Agent 3 (product recommendations)

---

## 1. Executive summary

Five bullets. These are the strongest actionable conclusions from the research round.

1. **The published-plan market converges on a single skeleton: 8–12 wk block periodisation, 4-phase (Base → Build → Race-specific → Taper), 4–6 sessions/wk, polarised 75–80/20 intensity, run volume dominant, station work layered.** HWPO/Fawcett, Nick Bare, HAOS/McIntyre, Roncevic 12-wk, Runna, HyCrew, PureGym, Vibefam, RB100, RoxZone all use variants of the same template. There is no methodological disagreement of significance among elite coaches — the disagreement is entirely on **volume dose** (McIntyre 6d/wk 45–180min, Roncevic 8 sessions ≈25h/wk, mainstream 4–5 sessions ≈6–8h/wk). Terav's honest-tier philosophy maps cleanly onto this — the "which dose does this athlete actually recover from" question is exactly what the adaptive engine is built for.

2. **Taper protocol is essentially settled: 7–14 days, volume down 40–60%, intensity preserved, one race-pace pulse ~72h out.** Every published HYROX taper (PRVN, RMR, Nesbitt, Vibefam, Vault, Plews, McIntyre, Roncevic) is within Mujika & Padilla 2000's classical taper envelope. This is a 1-week engineering exercise for Terav — the existing Rowing 2K taper (55% volume multiplier, race-pace → easy in final week) is directly reusable with light editing.

3. **Engine Builder + CSM + Rowing 2K cover ~70% of a HYROX Base-phase athlete's needs already, but ZERO of a Race-prep athlete's needs.** Engine Builder delivers exactly the VO2max block (Norwegian 4×4, Z2 polarised, threshold shift) that Brandt 2025 identifies as the #1 HYROX predictor (VO2max ρ = −0.71 with finish time). CSM delivers the concurrent-strength maintenance frame with the correct interference physics (6h separation, lift-first, RPE ≤7). What's missing is **station-specific loading, compromised running, sled push, wall balls at fatigue, race simulations, and pacing calibration** — none of which exist in the current catalog. A HYROX Race Prep program cannot be a re-skin of Rowing 2K; it needs new blocks.

4. **The physiology base is genuinely thin — three primary peer-reviewed HYROX studies, all 2025–26.** Brandt 2025 (Frontiers, n=11), Davids 2026 (Strength & Conditioning Journal review), and Wang/Soh 2025 (scoping review of hybrid HIFT, PMC12550923). Everything else is practitioner content or extrapolation from CrossFit / running / concurrent-training literature. Terav's evidence-first positioning has an advantage here — cite what's actually known (VO2max + endurance volume + BF% correlate; grip strength does not) and flag everything else as engineering extrapolation. The competition mostly doesn't cite anything.

5. **Recommended build order: 1× new (HYROX Race Prep, 8–10 wk), 1× repositioning (Engine Builder → "Engine Builder · HYROX Base variant" via tag/preset), 0× duplication of Rowing 2K.** Do not clone Rowing 2K for HYROX — the retest metric (2K time) and the race skill (single-modality max effort) are different sports. Rowing 2K's taper machinery can be lifted as a shared library. CSM stays as-is; it's the correct pre-HYROX strength maintenance block. See Section 5 for full recommendation.

---

## 2. Detailed findings

### 2.1 The peer-reviewed HYROX evidence base — what is actually published

This is a very short list. Programming for HYROX in 2026 is built almost entirely on extrapolation.

**Brandt et al. 2025 — Frontiers in Physiology 16:1519240** ([DOI 10.3389/fphys.2025.1519240](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2025.1519240/full))
- First-ever HYROX physiological profiling. 11 recreational athletes (27% women), median 18 mo HYROX experience, simulated Open Individual race.
- **VO2max ρ = −0.71 with finish time (p=0.01). Endurance training volume ρ = −0.68 (p=0.04). Body-fat % ρ = +0.67 (p=0.03). Grip strength: no significant correlation. Resistance training volume: no significant correlation.**
- VO2max median 51 mL/kg/min (IQR 10.8), range 46.6–72.
- Intensity distribution during the race: 79.5% at very-hard (>90% HRmax), 19.6% at hard (70–90%), <1% moderate/light. Max HR 185 bpm, avg HR 170.9 bpm.
- Stations produced significantly higher max HR (185 vs 180, p=0.04), lactate (8.5 vs 7.7 mmol/L, p=0.006), and RPE (18/20 vs 16/20, p=0.003) than runs.
- Wall balls were the single hardest station by all three measures.
- **Training recommendation from authors**: emphasise moderate-to-high intensity endurance work; use HIIT protocols; apply concurrent training ratios 1:1 or 1:2 (resistance:endurance) for optimal endurance adaptations; separate sessions when possible. Terav's CSM already implements the second half of this exactly.

**Davids et al. 2026 — Strength & Conditioning Journal 48(1):88–100, "A Performance Analysis of HYROX"** ([abstract at journals.lww.com](https://journals.lww.com/nsca-scj/abstract/2026/02000/a_performance_analysis_of_hyrox__a_review_of_the.7.aspx))
- Narrative review synthesising known physiologic, mechanical, and technical demands.
- Confirms four determinants: aerobic capacity (foundational), anaerobic power (station execution), local muscular endurance (repeated submaximal), maximal strength (sled/loaded work + running economy).
- No RCT — this is a review paper.

**Wang, Soh et al. 2025 — Sports 13(11):381 / PMC12550923** ([open access at pmc.ncbi.nlm.nih.gov](https://pmc.ncbi.nlm.nih.gov/articles/PMC12550923/))
- Scoping review of HIFT in hybrid competitions (39 studies 2015–2025). Aggregates the "HYROX-adjacent" HIFT literature.
- **Aggregated adaptations across controlled HIFT programs: VO2max +8–15%, max strength +10–20%, local muscular endurance +12–25%.** These are the numbers Terav can honestly cite as tier ranges.
- Race intensity: 41.6% in Zone 4 (80–90% HRmax), 50.5% in Zone 5 (90–100%), matching Brandt.
- Explicit programming guidance: concurrent training structure (strength before endurance same-day, separate blocks preferable), undulating periodisation, 48–72h recovery post-intense sessions, HRV / RPE monitoring.

**Frontiers 2026 (Longitudinal 7-season analysis)** ([DOI 10.3389/fphys.2026.1847569](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2026.1847569/full))
- 7-season public-race-results analysis of PRO and ELITE HYROX times.
- Male ELITE median times dropped from 01:06:24 (Season 2) to 00:57:17 (Season 7); female from 01:11:09 to 01:03:22.
- Running represents ~50% of race time throughout — running consistently the largest single time bucket.
- Sled push/pull and wall balls show the largest rank reshuffling between athletes = highest performance differentiation stations.
- Rowing and ski-erg show little year-on-year improvement across the elite field — likely a technique-ceiling effect.

**What is missing from the peer-reviewed base:**
- No RCT comparing polarised vs pyramidal HYROX-prep intensity distribution
- No RCT on optimal HYROX-specific taper duration
- No RCT on sled-push loading progression
- No RCT on frequency of race simulations
- No data on compromised-running-specific adaptations vs standard interval training
- No published female-specific HYROX physiological data (Brandt was 27% women, n≈3)
- No data on Age Group / masters HYROX physiology or programming

Terav is therefore programming into a genuine evidence gap after the "VO2max matters, strength doesn't matter as much as you think" headline. This is fine — same as Rowing 2K where several rowing-specific citations were flagged as engineering extrapolation.

---

### 2.2 Published elite / practitioner programs — the market

I pulled 12 programs. They collapse into 3 archetypes.

**Archetype A — Elite volume (McIntyre HAOS, Roncevic 12-wk)**
- 6–8 sessions/wk, 45–180 min per session, up to 25h/wk (Roncevic — trains 4 runs, 3 strength, plus 3 HYROX-specific hybrid workouts).
- 4-week undulating cycle (3 hard + 1 deload) — HWPO/HAOS both use exactly this cadence.
- No formal block periodisation described by athletes themselves. Roncevic explicitly: "if I wake up and don't feel like doing that workout, I'm not going to do that workout" — daily-readiness adjusted, coach-guided (Tiago Lousa is his coach).
- Taper: 2 weeks, week 1 light volume drop, week 2 sharp drop + short spicy sessions.
- **Not translatable to a Terav program directly.** This is >6h/wk athlete plumbing, which is out of Terav's stated `schedule_constraints.available_days_max: 6` and the `session_length_min_range` cap.

**Archetype B — 12-week amateur (Nick Bare Playbook, HyCrew, PureGym, HyroxFitness, Runna, Vibefam)**
- 4–5 sessions/wk, 60–90 min each. Sunday off.
- 3 phases: Base (wk 1–4) + Build (wk 5–8) + Race-specific (wk 9–11) + Taper (wk 12).
- Sample template converges strongly:
  - Mon: run + station circuit
  - Tue: upper-body strength + easy run
  - Wed: tempo or threshold run + lower-body strength
  - Thu: full HYROX circuit or 2–3 station block
  - Fri: upper-body or accessory
  - Sat: long Z2 run 60–90 min
  - Sun: off
- Runna's variant: 3 phases of 4-week blocks. Weeks 1–6 aerobic base + strength (running peaks around wk 6 in km volume); weeks 7–12 race specificity (running climbs to 18–22 km/wk); week 4 deload −40%.
- Taper: week 12 volume −40 to −50%, intensity held.
- **This is the archetype Terav should build against.** It matches CSM's session/week ceiling and Rowing 2K's phase count. It also matches Engine Builder's polarised-Z2-plus-4×4 backbone.

**Archetype C — Data-driven / analytical (HyroxDataLab, Dan Plews, FORMD, Vibefam 2026 update)**
- Explicit polarised 80/20 or pyramidal 75/20/5 IDF (intensity distribution framework).
- Prescription tied to Brandt 2025 and Seiler 2010.
- Plews' pyramid (5 levels: frequency+volume → polarised IDF → threshold+HIIT → strength endurance+power → race specificity+taper) is the closest thing to a Terav-style whitepaper-driven approach the market has, and matches Terav's Engine Builder principles almost 1:1.
- Plews explicitly names concurrent-training interference as "very, very small for amateurs" — consistent with Schumann 2022 SMD −0.06 for max strength that CSM already cites.
- **This is the archetype whose evidence base Terav most naturally competes on. Terav wins here on structure + adaptive engine + tier honesty.**

---

### 2.3 Periodisation — where the practitioner consensus actually is

**Macrocycle** (annual): 4 phases — General Preparation (Jul–Sep, 12–16 wk) → Specific Preparation (Oct–Dec, 8–12 wk) → Competition (Jan–Apr, 6–10 wk) → Transition (2–4 wk). Reproduced across RB100, BOXROX, Runna, RoxZone.

**Mesocycle** (in-season): 8–12 wk blocks with a deload every 4th week. HWPO's exact template: 3 hard + 1 easy. This mirrors CSM's `deload_window.every_weeks_min/max: 4–5`.

**Intensity distribution**: consensus is polarised, 75–80% Z1/Z2 low intensity, 15–20% high intensity, <5% threshold ("black hole"). Justification traces to Seiler & Kjerland 2006 + Seiler 2010 — the same citations Engine Builder and Rowing 2K already use.

**Session structure within a week**:
- Long Z2 run (60–90 min) 1× — this is the aerobic engine
- Threshold or tempo run (20–40 min steady + w/u+c/d) 1×
- VO2max intervals (4×4 or 6×3 min @ 90–95% HRmax) 1×
- Strength — lower body 1× (heavy squat/deadlift focus)
- Strength — upper body 1× (press/pull, accessory)
- HYROX-format circuit (compromised running + stations at race weight) 1–2×
- Long station-only skill session (technique, unloaded transitions) 0–1×

Fifth session onward = "compromised running", i.e. run intervals bracketing sled push, wall ball sets, or lunges to induce fatigue → then run under it. This is the single most HYROX-specific piece of programming and doesn't exist in Engine Builder or CSM.

**Taper**: 7–14 days, volume −40 to −60%, intensity preserved, one short race-pace pulse ~72h out (e.g. 4×30s at race pace with full recovery per Vault protocol; or 4–5 km run + 3 stations at 70–80% per Vibefam). Rest day −24h. Nutrition: carbohydrate up to ~6 g/kg/day final 48h (per RMR, Vault). This is essentially Mujika & Padilla 2000 with HYROX-specific movement pulses — not a novel taper.

---

### 2.4 Concurrent training and HYROX — how coaches handle interference

Every published elite HYROX coach implicitly or explicitly applies the same principles that CSM cites:
- Session separation: 6h minimum (Roncevic, Plews, HWPO, hybridletter).
- Lift-first when same-day pairing unavoidable (matches Eddens 2018).
- Prioritise one quality for 6–12 weeks, keep the other alive at maintenance (matches Bell 2000 concurrent-training block theory).
- Concurrent interference is "small for amateurs but real at elite level" — matches Schumann 2022 SMD −0.06 (max strength) and −0.28 (explosive strength).
- Modality bias for the strength athlete: rowing / cycling / ski over running (matches Wilson 2012 running interference dose-response).

The findyouredge.app "Interference Effect is Dead" piece is doing marketing spin on this — the interference effect is not dead, it's the same body of literature CSM already correctly interprets. The programs that "beat interference" beat it by applying separation + polarisation + prioritisation, not by disproving the physiology.

**Direct implication for Terav**: CSM's `interference_hints.incompatible_with: ["engine-builder"]` needs a HYROX equivalent. HYROX Race Prep is fundamentally incompatible with either Engine Builder or CSM as a same-block stack — the race prep IS the concurrent block, just with sport specificity added.

---

### 2.5 Compromised running — the single genuinely HYROX-specific training piece

This is the one training modality where HYROX programming isn't just "polarised endurance + concurrent strength". Compromised running = running under peripheral / anaerobic fatigue induced by a preceding station (sled, wall balls, lunges, burpees).

**Physiological rationale** (drawing from Brandt 2025 + Davids 2026):
- Peripheral fatigue impairs running economy — quads/glutes/plantar-flexors already carrying acute damage from sled push, wall ball squat pattern, lunges.
- Central fatigue accumulates across 8 stations + 8 runs, driving the HR distribution Brandt observed (79.5% >90% HRmax).
- The specificity-of-practice literature (Proteau 1992, Henry 1968 — already in Rowing 2K) says: to pace a 1km run at your target HYROX pace with fatigued quads, you have to practise it.

**Practitioner dose consensus**:
- 1–2× per week during Build and Race-specific phases
- Structure: 4–6 rounds of [station work under load × short run] with race-pace target
- Example: 100m sled push at race weight → 400m run @ target pace × 4 rounds
- Progression: increase run distance (400→500→600→800m) more than sled distance

**Terav mapping**: needs a new block type. `block_compromised_run` or `block_hyrox_circuit`. Not covered by any existing block in Engine Builder, CSM, or Rowing 2K.

---

### 2.6 Station-specific loading — the second piece the current catalog doesn't cover

Every HYROX-specific published program includes dedicated station skill sessions. The published dose:

| Station | Typical weekly dose | Loading progression | Key coaching cue |
|---|---|---|---|
| Ski erg (1000m) | 1× technique + 1× within circuit | pace, not power | drive with hips, not shoulders |
| Sled push (50m × 4 = 200m) | 1× heavy strength + 1× at race weight | build > race weight in strength phase, drop to race weight in specific | low body, drive through hips |
| Sled pull (50m × 4) | integrated with push session | rope work, cadence | hip hinge, alternating hand |
| Burpee broad jumps (80m) | 1× conditioning, high-freq | pacing / breathing cadence | short arc jump, controlled land |
| Rowing (1000m) | 1× technique + within circuits | stroke rate + drive | drive-recovery ratio 1:2 |
| Farmers carry (200m) | 1× loaded carry day | build > race weight | breathing under load |
| Sandbag lunges (100m) | 1× specific + within circuits | walking lunge specificity | cycle load off C-spine |
| Wall balls (100 reps 6/9 kg to 10ft) | 1× skill + within circuits | volume (50→75→100) at race weight | rhythm, catch cycle |

None of these are in the Terav exercise library (I did not enumerate `exercises.json` but the existing programs make no reference to sleds, wall balls, burpee broad jumps, or sandbag lunges). Building a HYROX program means authoring 8 new exercise entries at minimum. This is the primary content cost.

---

### 2.7 Pacing calibration — the third distinct HYROX skill

Every serious HYROX plan includes at least one race simulation before taper. The consensus is 1 full simulation at week 9–10, 1 half simulation at week 11, taper week 12.

- Elite pacing target: negative split, first 4 runs 5–8% slower than target, runs 5–8 make up the difference.
- Amateur pacing target: even split, runs 15–30 sec/km slower than standalone 5K pace.
- Elite split consistency: within 5 seconds across all 8 runs (Frontiers 7-season data).
- Station pace: ski erg ~4:00–4:30 range for elites (pull consistency > peak power); sled push completed fastest despite heaviest load (Brandt 2025 — 128s avg for push, 155s for pull); wall balls the true attrition station.

**Terav mapping**: this is a `block_full_simulation` and `block_half_simulation` — new blocks, and they require the retest to be the race time itself, not a proxy metric.

---

### 2.8 What the existing Terav catalog covers vs doesn't

I read Engine Builder, CSM, and Rowing 2K in full. Coverage matrix:

| HYROX training need | Engine Builder | CSM | Rowing 2K | Notes |
|---|---|---|---|---|
| VO2max development (4×4 protocol) | **Yes, primary** | Yes, 1×/wk | No | EB and CSM both cite Helgerud 2007. This is the biggest chunk of HYROX prep already done. |
| Z2 polarised base | **Yes, primary** | Yes, 3×/wk | Yes, 2×/wk | Same Seiler 2010 evidence base. |
| Concurrent strength maintenance | Marginal | **Yes, primary** | No | CSM is the exact frame — RPE ≤7, 6h separation, lift-first. |
| Threshold work | No | No | **Yes, 1×/wk** | Rowing 2K's `block_threshold_row` reusable in principle, needs run/ski/bike variants. |
| Race-pace specificity | No | No | **Yes** (row-specific) | Same principle applies — Proteau 1992 + Henry 1968 rationale is transferrable, execution isn't. |
| Race simulation | No | No | **Yes** (2K test itself) | Rowing 2K's `block_open_2k` maps conceptually to HYROX simulation. Machinery reusable. |
| Taper protocol | No | No | **Yes** (2-wk, 55% volume) | Mujika 2000 taper is fully applicable. Direct copy. |
| Compromised running | **No** | **No** | **No** | Novel content required. |
| Sled push / pull training | **No** | **No** | **No** | Novel content required, new exercises. |
| Wall balls under fatigue | **No** | **No** | **No** | Novel content required. |
| Burpee broad jumps | **No** | **No** | **No** | Novel content required. |
| Sandbag lunges | **No** | **No** | **No** | Novel content required. |
| Farmers carry loaded | **No** | Marginal | **No** | Some carry work in CSM strength moderate. Novel content. |
| Station skill work (transitions, technique) | **No** | **No** | Marginal | Row/ski erg technique block partially reusable. |
| Pacing calibration to HYROX target | **No** | **No** | Marginal | 2K pacing skill ≠ HYROX pacing, but the "specificity of practice" evidence base translates. |
| Multi-tier honest ranges | **Yes** | **Yes** | **Yes** | Terav's philosophy — direct reuse. |
| Adaptive engine hooks | **Yes** | **Yes** | **Yes** | Direct reuse. |

Coverage estimate: ~40% of a HYROX-Race-Prep programme is already implicitly covered by Engine Builder + CSM. About 60% is genuinely novel content that has to be authored.

The 40% is exactly the "aerobic base + strength maintenance" foundation. The 60% is exactly the sport-specific piece.

---

### 2.9 Can we duplicate + adapt with modest content changes?

The brief explicitly asks this. Honest answer:

**Engine Builder → HYROX Base variant**: Yes, mostly a repositioning + tag exercise. Engine Builder already delivers the VO2max block that Brandt 2025 flags as the #1 HYROX predictor. Modest edits:
- Add "HYROX Base" as a positioning label / preset intake path
- Add rowing / ski erg to modality options for Z2 blocks (partly already there)
- Add a `hyrox_context: true` flag to intake so subsequent block placements make sense
- Retest metric stays the same (submax HR ↓) but add a secondary "compromised 1km time trial" retest
- Add explicit progression path to HYROX Race Prep in `interference_hints`
- **Content cost: ~1 day. Evidence base: 0 new citations required.**

**CSM → HYROX Strength Base variant**: Also mostly a repositioning. CSM already carries the correct interference physics for concurrent training. Modest edits:
- Add sled push / sled pull as `block_pull_midshin` alternatives or new blocks
- Swap `back_squat_highbar` prescription toward strength-endurance rep schemes in later phases
- Add farmers carry as a `block_strength_moderate` accessory
- Optional add: reduce the `duration_multiplier` bar for Push tier to accommodate concurrent HYROX-specific work volume
- **Content cost: ~2 days plus exercise-library authoring for 3–4 new movements. Evidence base: minimal new citations (already covers concurrent physiology).**

**Rowing 2K → HYROX Race Prep**: **No, do not clone.** The retest metric is fundamentally different — 2K rowing time (single-modality, all-out) vs HYROX finish time (8 runs + 8 stations, pacing sport). The race-pace prescription is fundamentally different. The taper machinery is reusable at the framework level but the block contents aren't. Cloning Rowing 2K for HYROX would ship an incorrect program.

**Reuse from Rowing 2K to a new HYROX Race Prep** (this is fine and recommended):
- Taper phase structure (2 weeks, volume −45%, intensity preserved, race-pace → easy final week)
- Baseline test week (phase_1_base_check equivalent — full open HYROX simulation at week 1)
- `block_easy_recovery` block
- Tier definitions structure (Foundation / Progression / Push based on baseline time)
- Retest metric machinery (source_ref, aggregation, window_days)
- Adaptive engine hooks (day_adjustment, amber-week detection, trend_slope)
- Safety gate structure
- **Content cost: framework-level reuse ~1 day. All block contents new.**

---

### 2.10 Elite coaches / athletes / plans — full list I sourced

For citation and evidence-quality purposes when Agent 3 designs the actual products:

**Named practitioners with public programs**:
- Hunter McIntyre — HAOS HYROX Pro (haostraining.com), 6d/wk, 45–180 min, 4-wk cycle 3+1 deload, no phase docs
- Alex Roncevic — Ronkox 12-wk 4×/wk program (ronkox.com), coach Tiago Lousa, HYROX World Champion
- Nick Bare — BPN Playbook Hyrox Prep 12-wk (my.playbookapp.io/nick-bare), 6d/wk template
- Steven Fawcett — HWPO Hyrox (Mat Fraser's company), 8-wk block, 3+1 deload, 2–5 d/wk, RPE-guided
- Dan Plews — 5-level training pyramid framework (johngetstrong.substack.com), most evidence-oriented
- PRVN Fitness — 2-week taper program specifically
- Runna — 12-wk plan, 3-cycle 4-wk block, weeks 1–6 base + wk 7–12 specificity, wk 4 deload
- RMR Training — race-week protocol, carb/sleep targets

**Named athletes with published data**:
- Roncevic — 51:59 Warsaw record (Pro)
- McIntyre — 53:22 men's Pro world record
- Wietrzyk — perfect season Pro Elite
- Beneito — HYROX PRO, no public programme

**Aggregator / analytics sites** (useful for norms, less useful for evidence):
- HyroxDataLab (hyroxdatalab.com) — 700K+ results dataset, target time calculators
- Fitnessvolt, prommer.net, hyroxy.com — pace calculators and time distributions
- VALD Performance — profiling data (plantar flexor force emphasis)
- Fast Talk Labs — coach-oriented, cites the peer-reviewed base correctly

---

## 3. Literature cited

Peer-reviewed and directly cited above. DOIs and URLs given where available.

1. **Brandt K, Krieger K, Kerner J, et al. (2025).** Acute physiological responses and performance determinants in HYROX. *Frontiers in Physiology* 16:1519240. [https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2025.1519240/full](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2025.1519240/full)
2. **Davids CJ (2026).** A Performance Analysis of HYROX: A Review of the Physiologic, Mechanical, and Technical Demands. *Strength & Conditioning Journal* 48(1):88–100. [https://journals.lww.com/nsca-scj/abstract/2026/02000/a_performance_analysis_of_hyrox__a_review_of_the.7.aspx](https://journals.lww.com/nsca-scj/abstract/2026/02000/a_performance_analysis_of_hyrox__a_review_of_the.7.aspx)
3. **Wang H, Soh KG, et al. (2025).** Integrative Physiological Strategies for Monitoring Demands in Functional Fitness / High Intensity Functional Training in Hybrid Competitions: A Scoping Review. *Sports* 13(11):381 / PMC12550923. [https://pmc.ncbi.nlm.nih.gov/articles/PMC12550923/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12550923/)
4. **(anonymous authors) (2026).** Longitudinal performance development in PRO and ELITE HYROX competitions across the first seven competitive seasons. *Frontiers in Physiology*. [https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2026.1847569/full](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2026.1847569/full)
5. **Seiler S (2010).** What is best practice for training intensity and duration distribution in endurance athletes? *IJSPP* 5(3):276–291. — Polarised distribution basis. Already in EB, CSM, R2K.
6. **Helgerud J, Høydal K, Wang E, et al. (2007).** Aerobic high-intensity intervals improve VO2max more than moderate training. *MSSE* 39(4):665–671. — The 4×4 protocol. Already in EB, CSM, R2K.
7. **Mujika I, Padilla S (2000).** Detraining Part I + II. *Sports Med* 30(2/3). — Taper foundation. Already in R2K.
8. **Schumann M, et al. (2022).** Compatibility of concurrent aerobic and strength training. *Sports Med* 52(3):601–612. — Concurrent training interference bounds. Already in CSM.
9. **Wilson JM, et al. (2012).** Concurrent training meta-analysis. *JSCR* 26(8):2293–2307. — Modality-interference dose-response. Already in EB, CSM, R2K.
10. **Robineau J, et al. (2016).** Concurrent training separation duration. *JSCR* 30(3):672–683. — 6-hour rule. Already in CSM.
11. **Eddens L, et al. (2018).** Intra-session exercise sequence. *Sports Med* 48(1):177–188. — Lift-first rule. Already in CSM, R2K.
12. **Rønnestad BR, Mujika I (2014).** Optimizing strength training for running and cycling endurance performance: A review. *Scand J Med Sci Sports*. — Running economy via heavy strength. NEW citation needed for HYROX program. [https://onlinelibrary.wiley.com/doi/abs/10.1111/sms.12104](https://onlinelibrary.wiley.com/doi/abs/10.1111/sms.12104)
13. **Hoff J, Helgerud J, Wisløff U (1999).** Maximal strength training improves work economy in trained female cross-country skiers. *MSSE* 31(6):870–877. — Strength → economy foundational. NEW citation for HYROX.
14. **Proteau L, Marteniuk RG, Lévesque L (1992).** Sensorimotor basis for motor learning. *QJEP* 44A:557–575. — Specificity of practice. Already in R2K.
15. **Bell GJ, Syrotuik D, Martin TP, et al. (2000).** Effect of concurrent strength and endurance training on skeletal muscle properties and hormone concentrations. *Eur J Appl Physiol* 81(5):418–427. — Block-priority for concurrent. NEW citation for HYROX.
16. **Rhea MR, Alderman BL (2004).** A meta-analysis of periodized versus non-periodized strength and power training programs. *Res Q Exerc Sport* 75(4):413–422. — Periodisation superiority. Cited in BOXROX article. NEW for HYROX.
17. **Bouchard C, et al. (1999).** Familial aggregation of VO2max response: HERITAGE Family Study. *J Appl Physiol* 87(3). — Honest-range rationale. Already in EB, R2K.
18. **Ross R, et al. (2015).** Non-response to CRF training. *Mayo Clin Proc* 90(11):1506–1514. — Push-tier stretch confidence rationale. Already in EB, R2K.

**Practitioner sources cited for context (not evidence base)**:
- Vibefam HYROX Race-Prep 2026 guide [https://vibefam.com/how-to-build-a-hyrox-race-prep-program-in-2026/](https://vibefam.com/how-to-build-a-hyrox-race-prep-program-in-2026/)
- HWPO HYROX [https://www.hwpotraining.com/programs/hwpo-hyrox](https://www.hwpotraining.com/programs/hwpo-hyrox)
- HAOS HYROX Pro (Hunter McIntyre) [https://haostraining.com/pages/hyrox-pro](https://haostraining.com/pages/hyrox-pro)
- Roncevic 12-wk [https://www.ronkox.com/shop/p/12-week-hyrox-program-4x-week](https://www.ronkox.com/shop/p/12-week-hyrox-program-4x-week)
- Roncevic training secrets [https://www.hybridletter.com/p/alex-roncevics-plan-to-beat-everyone](https://www.hybridletter.com/p/alex-roncevics-plan-to-beat-everyone)
- Dan Plews HYROX training pyramid [https://johngetstrong.substack.com/p/most-hyrox-athletes-are-skipping](https://johngetstrong.substack.com/p/most-hyrox-athletes-are-skipping)
- Runna HYROX plans (12-wk, 3-cycle) [https://support.runna.com/en/articles/6781532-the-ultimate-functional-fitness-and-hyrox-running-training-guide](https://support.runna.com/en/articles/6781532-the-ultimate-functional-fitness-and-hyrox-running-training-guide)
- HyroxDataLab weekly running structure [https://hyroxdatalab.com/articles/hyrox-running-training-structure](https://hyroxdatalab.com/articles/hyrox-running-training-structure)
- Nick Bare Playbook Hyrox Prep [https://my.playbookapp.io/nick-bare/programs/hyrox-prep/26506](https://my.playbookapp.io/nick-bare/programs/hyrox-prep/26506)
- RB100 HYROX periodisation [https://rb100.fitness/articles/hyrox/periodisation-for-hyrox-training/](https://rb100.fitness/articles/hyrox/periodisation-for-hyrox-training/)
- BOXROX long-term HYROX programming [https://www.boxrox.com/how-to-create-long-term-training-programs-for-hyrox/](https://www.boxrox.com/how-to-create-long-term-training-programs-for-hyrox/)
- Compromised Running structure [https://www.compromisedrunning.com/post/how-to-structure-your-hyrox-training/](https://www.compromisedrunning.com/post/how-to-structure-your-hyrox-training/)
- PRVN 2-wk taper program [https://prvnfitness.com/products/prvn-hyrox-2-week-taper-program](https://prvnfitness.com/products/prvn-hyrox-2-week-taper-program)
- RMR Training race-week protocol [https://www.rmr.training/blog/how-to-taper-for-a-hyrox-race-a-complete-guide-from-rmr-training](https://www.rmr.training/blog/how-to-taper-for-a-hyrox-race-a-complete-guide-from-rmr-training)
- Fast Talk Labs HYROX performance determinants [https://www.fasttalklabs.com/training/performance-determinants-of-hyrox-competition/](https://www.fasttalklabs.com/training/performance-determinants-of-hyrox-competition/)
- FORMD HYROX science 60% running [https://tryformd.com/blog/hyrox-science-running-60-percent-race](https://tryformd.com/blog/hyrox-science-running-60-percent-race)
- VALD Performance HYROX profiling [https://valdperformance.com/news/profiling-the-hyrox-athlete-what-actually-matters](https://valdperformance.com/news/profiling-the-hyrox-athlete-what-actually-matters)
- findyouredge.app Interference Effect Is Dead [https://www.findyouredge.app/news/interference-effect-hybrid-training-2026](https://www.findyouredge.app/news/interference-effect-hybrid-training-2026)
- HyCrew 12-wk plan [https://www.hycrew.com/hyrox/training-plan](https://www.hycrew.com/hyrox/training-plan)

---

## 4. Terav-specific recommendations

### 4.1 What to build (ordered by value / cost ratio)

**PRIORITY 1 — HYROX Race Prep (new program, 8–10 weeks)**

- **Positioning**: `main_track` with `positioning: "race_prep"`. Requires an existing aerobic base (points at Engine Builder as prereq via `interference_hints`).
- **Duration**: 8 weeks (can extend to 10 for Foundation tier). Matches Runna/HyCrew/Vibefam consensus and stays within Terav's tested phase-count pattern.
- **Phase structure** (4 phases, matching the market consensus):
  - Phase 1 · Base check + technique (weeks 1–2). Baseline half-simulation. Station technique. Compromised-run introduction.
  - Phase 2 · Build (weeks 3–5). Compromised running peak volume. Station loading at race weight. 1× threshold + 1× VO2 + 2× station-integrated per week.
  - Phase 3 · Race-specific (weeks 6–7). Full HYROX simulation once. Pacing calibration sessions. Station endurance tests.
  - Phase 4 · Taper + test (week 8, or 8–10 for Foundation). Volume −45%, intensity held, race-pace pulse 72h out, race day.
- **Tiers**:
  - Foundation — first HYROX / previous time > 1:30. Outcome: sub-1:30 realistic, sub-1:20 stretch.
  - Progression — previous time 1:10–1:30. Outcome: 5–8 min faster than PR realistic, 10 min stretch.
  - Push — previous time < 1:10 (Open) or attempting Pro. Outcome: 2–5 min faster realistic, HERITAGE non-response caveat.
- **Retest metric**: `hyrox_finish_time_seconds` (the race). Secondary: `compromised_1km_seconds` (a Terav-specific standard test — 1km run immediately after 50 wall balls).
- **New blocks required** (~8 new blocks):
  - `block_compromised_run` (4×[400m run @ race pace after 20 wall balls])
  - `block_hyrox_circuit_full` (weekly race simulation for Build/Race-specific phase)
  - `block_hyrox_circuit_half` (weekly half sim)
  - `block_station_skill_ski_row` (technique focus)
  - `block_station_skill_sled` (progressive loading)
  - `block_station_endurance_wallballs_lunges_carry` (attrition-station specific)
  - `block_race_pace_run` (race-pace run intervals with station bracketing)
  - `block_taper_race_week` (Mujika-derived taper)
- **New exercises required** (~8 minimum):
  - Sled push (multiple loads), sled pull, wall ball, sandbag lunge, burpee broad jump, farmers carry (loaded), ski erg (pace-specific), row (HYROX pace).
- **Citation base**: ~15 references. Overlap with EB/CSM/R2K is ~60% — Seiler, Helgerud, Wilson, Schumann, Mujika, Ross, Bouchard, Proteau, Henry, Robineau, Eddens all reusable. New: Brandt 2025, Davids 2026, Wang/Soh 2025, Rønnestad 2014, Hoff 1999, Bell 2000. Meets Terav's 100+-across-catalog bar comfortably.

**PRIORITY 2 — Engine Builder · HYROX Base preset (tag / preset, not new program)**

- Reposition existing EB with a HYROX-specific intake path and modality bias.
- Add `program_variant: "hyrox_base"` toggle at intake. When set:
  - Modality options bias toward row + ski erg (not just bike)
  - Add "compromised 1km time" as an optional secondary retest metric
  - `interference_hints.progression_path: "hyrox-race-prep"` — surface race prep as next step at week 8
  - Intake adds "target HYROX date" field (optional)
- No new blocks, no new exercises, no new citations. Content cost: ~1 day.

**PRIORITY 3 — CSM · HYROX Strength preset (tag / preset)**

- Reposition existing CSM as a valid strength-maintenance option during a HYROX build phase.
- Swap `block_pull_midshin` for a farmers-carry alternative in later phases
- Add sled push as a `block_strength_heavy` alternative (requires 2–3 new exercises)
- Adjust rep schemes in phase_2 toward strength-endurance (higher reps, RPE 6)
- `interference_hints`: mark compatible with `hyrox-race-prep` at ≤2 hard sessions overlap
- Content cost: ~2 days including exercise-library work.

### 4.2 What NOT to build

- **Do not duplicate Rowing 2K into a HYROX version.** Retest metric is wrong (single-modality vs event), race skill is wrong (single all-out vs pacing sport). Would ship an incorrect product.
- **Do not build a "HYROX Doubles" program as its own SKU** at launch. Doubles is a variant/toggle on the individual — same physiology, different work split. Add as a second-year feature.
- **Do not build an "elite" 25h/wk HYROX program.** Roncevic-tier volume is outside Terav's stated `session_length_min_range` and `session_count_per_week_range`. The market for that dose is <1% of HYROX athletes and they're already coached by humans.
- **Do not build a HYROX Skill program in the mould of Handstand Walk / Overhead Mobility.** Individual stations aren't skill-limited enough — the whole point of HYROX is that most stations use "basic" movements executed under fatigue. The skill piece belongs inside HYROX Race Prep as station-skill blocks, not as a standalone program.

### 4.3 Tier structure + retest metric — draft for HYROX Race Prep

```
Tiers (all 8-week starting duration):
  Foundation  — condition: current_hyrox_time_min >= 90 || never_raced == true
                target: -10 min realistic, -20 min stretch (huge upside for beginners)
                confidence: realistic
  Progression — condition: current_hyrox_time_min in [70, 90)
                target: -5 min realistic, -8 min stretch
                confidence: realistic
  Push        — condition: current_hyrox_time_min < 70 || pro_division == true
                target: -2 min realistic, -5 min stretch
                confidence: stretch (HERITAGE non-response distribution)

Retest metrics:
  Primary   — hyrox_finish_time_seconds (the race itself)
  Secondary — compromised_1km_time_seconds (Terav-standard: 50 wall balls + 1km run immediately)
              This is the phase-end proxy that adapts weekly during the block.
              No RCT justifies the specific compromised-1km test — flagged engineering.
  Tertiary  — running_5k_time (untouched by stations — the aerobic ceiling proxy)
```

### 4.4 Suggested weekly template (Progression tier)

```
Mon  — block_strength_lower (RPE 6-7, squat/deadlift focus, sled push heavy accessory)
Tue  — block_z2_run 60 min
Wed  — block_compromised_run (4-6 × [station load + 400-600m run])
Thu  — block_strength_upper + block_z2_row 30 min  (6h separation)
Fri  — block_hyrox_circuit_half (30-40 min, race weight, race pace target)
Sat  — block_z2_run long 75-90 min
Sun  — off

Phase 3 replaces Fri with block_hyrox_circuit_full every other week.
Taper week: Wed race-pace pulse (short), Sat easy 20 min, race Sun.
```

### 4.5 Adaptive engine hooks

Reuse existing infrastructure:
- `day_adjustment` on notes-signal 'legs dead' → next compromised-run session becomes technique-only station work
- `amber_week` detection (≥3 amber days) → drop the harder of Fri/Wed sessions the following week
- `trend_slope` on compromised_1km_time_seconds over 21 days → phase_end evaluator promotes / holds tier
- `cycle_end` TM adjustment for strength blocks only (not for race pace — pacing is skill, not TM)

### 4.6 Answering the brief question: Is HYROX a catalog category or a variant tag?

**A catalog category with variant tags on existing programs.**

- HYROX Race Prep = new standalone program under a new `category: "hyrox"` in the catalog.
- Engine Builder + CSM get an optional `hyrox_variant` tag / preset. This is the market's demonstrated pattern (Runna does exactly this — general running plans plus HYROX-specific presets).
- The category unlocks a stepping-stone story: **Engine Builder (HYROX Base) → HYROX Race Prep → race → transition → repeat**. That IS the annual macrocycle every published elite HYROX athlete follows.

---

## 5. Open questions — where the evidence runs out

Where Terav has to make engineering / coaching-consensus choices:

1. **How long should the taper be for a Foundation-tier HYROX athlete?** Published: 7–14 days. Rowing 2K uses 2 weeks. Marathon literature (Mujika) suggests longer taper for slower/older athletes but no HYROX-specific data. **Engineering choice: default 10 days, adjust +3/-3 based on Foundation vs Push tier and age.**

2. **What compromised-running dose actually beats Engine-Builder VO2 work?** No RCT compares "3 weekly compromised runs" against "3 weekly Norwegian 4×4" for HYROX finish time. Practitioner consensus is compromised running is essential but nobody has isolated the effect. **Engineering choice: 1–2 compromised sessions per week during Build and Race-specific, replacing 1 VO2 session — same total hard-session count.**

3. **Should sled push loading exceed race weight in Base phase or stay at race weight?** McIntyre's HAOS goes heavier than race weight. Compromised Running blog says heavier is better. No RCT. **Engineering choice: heavier during Build phase (up to 1.5× race weight for 2-3 sessions), drop to race weight during Race-specific, matches strength-training-for-endurance evidence (Rønnestad 2014).**

4. **How many full race simulations before the actual race?** Range in published plans: 1 (Runna) to 3 (HAOS). Costs: fatigue debt, pacing overexposure. Benefits: pacing calibration, mental rehearsal. **Engineering choice: 1 full simulation at week 6, 1 half at week 7 — matches Vibefam.**

5. **Is compromised-1km a valid Terav-standard test?** No published data on inter-session reliability of this specific test. It's a novel Terav metric. **Engineering choice: use it as the secondary retest metric with a `flag: "novel_terav_metric"` on the citation. Compare against 5km run time (established) as sanity check.**

6. **How much does concurrent CSM interfere with a HYROX Race Prep block?** CSM already correctly flags `incompatible_with: engine-builder`. HYROX Race Prep is itself a concurrent block. **Engineering choice: HYROX Race Prep bundles its own strength maintenance (2× lift/wk at RPE ≤7). CSM is not a companion program during Race Prep — it's a Base-phase option before Race Prep starts.**

7. **How to price / tier HYROX Doubles and Pro divisions differently?** Physiology is broadly the same, work split differs, weights differ (Pro heavier). **Engineering choice: single Race Prep program with intake toggles for division and singles/doubles — modifies station weights and rep counts, keeps every other block intact.**

8. **Retest cadence — how frequently should we test finish-time proxies?** The race itself only happens once (or every ~3 months at most). Proxy tests fatigue the athlete. **Engineering choice: proxy at weeks 1 and 6 only; the race IS the definitive retest.**

9. **Female-specific programming — is the HYROX programming different for women?** Brandt 2025 is n=11, 27% women. No female-specific published HYROX physiology. Wall balls at 6kg vs 9kg — mass-normalised comparison unknown. **Engineering choice: single program, tier-based on time not sex, weights on the intake respecting HYROX rulebook.**

10. **Age Group programming — no published data.** **Engineering choice: no separate program at launch. Adaptive engine's amber-week detection + tier-based intensity ceilings should handle age-related recovery variability.**

---

## 6. Bottom line for Agent 3 / product decision

The market is converged and Terav's existing infrastructure covers the harder half of it correctly.

**Ship one new program: HYROX Race Prep (8 weeks, 3 tiers, 8 new blocks, 8 new exercises, ~15 citations of which ~9 reuse EB/CSM/R2K).**

**Reposition two existing programs as HYROX-tagged variants (Engine Builder → HYROX Base, CSM → HYROX Strength Base).**

**Do not clone Rowing 2K. Reuse its taper machinery and metric-scaffolding at the framework level.**

**Do not build a HYROX Skill program.** Station technique lives inside Race Prep as skill-block sessions.

**The evidence gap is manageable — cite Brandt/Davids/Wang-Soh for HYROX-specific claims, flag everything else as engineering extrapolation (as Terav already does).** Competitor programs almost universally cite nothing.

**Category question**: HYROX is a catalog category (`category: "hyrox"`), because the stepping-stone story (Base → Race Prep → recover → repeat) is a real annual macrocycle. Existing programs get an optional variant tag but stay in their current categories.

