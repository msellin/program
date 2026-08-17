# Overhead Mobility — specialist review

**Reviewer:** shoulder mobility / overhead kinematics specialist
**Date:** 2026-08-17
**Program file:** `next-app/public/data/programs/overhead-mobility.json`
**Current status:** REFERENCED
**Bar reviewed against:** `dev/active/program-reviews-2026-08-17/context.md`

## 1. Verdict

**CONDITIONAL** — the kinematic reasoning is sound and the citations largely resolve, but two references are mis-attributed in ways that touch the program's actual claims (Sadowski 2021, Walker 2003), one has a wrong year (Kibler 2013 vs. 2010), and the "load early for cuff activation" Phase 2 rationale (Reinold 2007) is a drift, not a broken claim. Fix the four items in section 7 and this passes to REVIEWED.

## 2. Program scope reviewed

A correlated-tier, 10-week overhead-mobility arc (Foundation → Progression → Push) built around three principles: scap-first sequencing, kinematic base before load, daily-short over long-infrequent. Retest metrics are supine shoulder flexion (goniometer), OHS depth relative to knee crease, and Turkish get-up hold. Explicit non-goals: not a snatch PR programme, not shoulder-pathology rehab. Positioning is "supplement to physio for people with clean shoulders who want more usable overhead range."

## 3. Citation-by-citation audit

| ID | Paper's actual claim | Program's claim | Verdict |
| --- | --- | --- | --- |
| `ludewig_cook_2000` | Impingement subjects showed **decreased** scap upward rotation and **decreased** posterior tilt during humeral elevation vs. controls (Phys Ther 80(3):276-291). | "Impingement risk rises when scap upward rotation lags shoulder flexion under load." | **Match.** Program's phrasing is looser than the paper's kinematic language ("lags" ≠ "reduced amplitude/timing") but the direction and mechanism are what Ludewig actually reported. |
| `ludewig_reynolds_2009` | Systematic review: scap kinematic alterations (decreased upward rotation, decreased posterior tilt, increased internal rotation) are associated with SIS, RC tears, GH instability. | "Scap dyskinesis (upper-trap dominance) is the most common single kinematic cause of shoulder impingement in athletes." | **Drift.** Ludewig & Reynolds document *association*, not *cause*, and do not single out upper-trap dominance as "the most common" driver. That framing is Kibler/Sciascia territory, not this paper. Soften to "scap kinematic alterations are associated with impingement" or move the causal-language load onto Kibler. |
| `reinold_2007` | Narrative review of EMG activity across common GH and scapulothoracic exercises; provides drill-by-drill activation rankings and rehab progression logic (e.g., ER at 0°, side-lying ER, prone Y/T/W). | (a) "Active rotator-cuff engagement should precede end-range positioning; ballistic end-range invites impingement." (b) "Rotator-cuff activation is greater under light load than at bodyweight." | (a) **Match** — the paper does argue for controlled cuff engagement over ballistic end-range. (b) **Drift.** Reinold 2007 is not a load-titration RCT. Some individual drills studied use light load (e.g., 1–2 lb dumbbells, bands) and produce meaningful cuff EMG, but the paper does not conclude "light load > bodyweight" as a general principle. Rewrite as "Reinold-catalogued drills use light external load to bias cuff activation" rather than "greater than bodyweight." |
| `sadowski_2021` | Kinematic/kinetic analysis of straight-arm press to handstand (PLOS One 16(7):e0253951). Reported peak shoulder moments **under 1.5 Nm·kg⁻¹** in floor exercise; the "3× BW" figure is quoted from prior work (Prassas, parallel-bars). Also: less-skilled performers relied more on shoulder-flexion moment. | "3× BW shoulder moment reference — informs no-heavy-load-early rule." | **Broken.** The 3×BW figure is not what Sadowski measured — it is what an earlier Prassas paper reported on parallel bars, cited by Sadowski for context. The `used_for` field mis-attributes the number. Also, WebFetch of e0253951 returned the paper as authored by Mizutori et al., not Sadowski; the DOI/authors need verification. This is the only outright *broken* citation in the set. |
| `wulf_1998` | Stabilometer / ski-simulator: external focus outperforms internal focus for motor skill retention. | "External-focus cue foundation." | **Match.** Direct use. |
| `wulf_2013` | 15-year review across ~100 studies: external focus reliably better for skill acquisition & retention. | "External-focus cue meta — cited on every drill card." | **Match at the citation level; soft stretch on scope.** External focus for *mobility gain* specifically has thin RCT evidence (Wulf's corpus is skill acquisition, force production, balance). The program's principle names the cue standard, not "external focus produces ROM." That framing is defensible. Do not weaken it, but do not extend it either. |
| `karni_1998` | fMRI + behavioural: motor skill consolidation has fast (within-session) and slow (across-session, sleep-dependent) phases. | "Motor patterns consolidate with sleep between sessions. Short daily > long infrequent." | **Match on mechanism; drift on prescription.** Karni supports consolidation-with-sleep. "Short daily beats long infrequent for mobility acquisition" is an extrapolation from motor-skill consolidation to ROM, which is a different adaptation substrate. Acceptable as an engineering inference; ideally flagged in `engineering_choices_flagged` (it currently is not). |
| `walker_2003` | Sleep-dependent motor memory plasticity. The Walker/Stickgold sequential-finger-tapping paper commonly cited from 2003 is in **Learning & Memory 10(4):275-284**, not "Neuroscience 133(4):911-917" as the citations.json records. Whitepaper 04 correctly lists it as Learning & Memory 10:275-284. | Same use as Karni — sleep-dependent consolidation supports daily-short scheduling. | **Match on the science; citation metadata is wrong.** `citations.json` needs the journal fixed. |
| `chiviacowsky_wulf_2002` | Self-controlled KR beats yoked schedule for retention. | "Self-controlled feedback in drill acquisition." | **Match**, though this reference is listed but not obviously used in any block or drill description — the program does not describe a self-controlled feedback loop. If it's truly not driving any content, drop it. |
| `wulf_shea_2002` | Principles from simple lab skills do not fully generalize to complex skills — reduce challenge early, add later. | "Informs blocked-then-random session structure." | **Match** on general principle. The weekly template does not visibly instantiate blocked→random progression, so this is currently a rationale claim without a corresponding programme feature. Either wire it in or downgrade the reference to "philosophical." |
| `shea_morgan_1979` | Contextual interference: high CI hurts acquisition, helps retention. | "Blocked-first, random after." | Same status as Wulf-Shea 2002 above. |
| `kibler_2013` | Kibler & Sciascia "Current concepts: scapular dyskinesis" is **BJSM 44(5):300-305, 2010** — not 2013. There is a *separate* 2013 Kibler paper (BJSM 47(14):877-885, the 2013 "Scapular Summit" consensus). The program/citations.json entry conflates them. | "SICK scapula screening pattern." | **Broken metadata (year); claim is fine.** Either fix year to 2010 (if citing the "Current concepts" paper) or change source/pages to BJSM 47(14):877-885 (if citing the 2013 consensus). Both are legitimate references; the current record is neither. |
| `kim_2013` | J Phys Ther Sci 25(11):1435-1438 — reports reliability of supine shoulder ROM goniometry. | "Supine flexion goniometer reliability — the retest anchor." | **Match.** Reliability ≠ construct validity, but the program uses Kim for reliability specifically. Correct scope. |
| `escamilla_2009` | Sports Med review of EMG-guided drill selection for shoulder rehab. | "EMG-guided drill selection — informs scap-activation block content." | **Match.** Standard use. |
| `bullock_2019` | J Athl Train review linking shoulder ROM (esp. GIRD/ER) to throwing performance in baseball. | "Thoracic mobility → shoulder function." | **Drift.** Bullock 2019 is about *shoulder* rotational ROM in throwers, not thoracic mobility. Thoracic-mobility-to-shoulder-function has separate literature (e.g., Barrett 2016, Otoshi 2014). Either replace with a thoracic-specific ref or rewrite `used_for` to "shoulder ROM predicts throwing performance," and flag thoracic-prep as engineering. |
| `manske_2010` | Sports Health 2(2):94-100 — sleeper stretch + posterior GH mobilization vs. stretch alone for posterior capsule tightness. | "Sleeper stretch effectiveness reference." | **Match.** Correctly used as an engineering-choice reference. |
| `difiori_2006` | AJSM 34(5):840-849 — young gymnast wrist injuries, distal radial physis. | "Wrist-tolerance considerations if program includes handstand-adjacent work." | **Match**, but this program has no handstand block and no wrist-tolerance gate. The reference is defensible only via the wall-walk / TGU reach cross-over. Consider removing if not doing operational work. |
| `sands_2000` | Sports Med 30(5):359-373 — women's gymnastics injury prevention, prerequisite/skill readiness framework. | "Skill-readiness assessment framework — informs prerequisite gating." | **Match at concept level; not visibly wired.** Program does have safety gates (RC tear, dislocation, cervical) but these are clinical contraindications, not "prerequisites" in the Sands sense. Keep or drop, but don't overstate. |
| `salmoni_schmidt_walter_1984` | Guidance hypothesis — reduced KR frequency benefits retention. | "Feedback frequency in mobility drill acquisition." | **Match at concept level.** No visible feedback-frequency feature in the program. Same "listed but unused" pattern. |

## 4. Phase / block structure check

**Phase logic is sound.**
- Phase 1 (kinematic base) → 2 (light-loaded) → 3 (consolidation + retest) mirrors the Ludewig/Reinold clinical reasoning: fix scap sequence and passive ROM first, layer active + light load second, retest under load.
- Scap-first-then-shoulder in every session honours Ludewig 2000/2009 and Reinold 2007.
- Daily thoracic prep + daily reset is defensible as engineering + Karni/Walker consolidation.

**Two structural notes:**
1. The weekly template does not obviously implement the blocked → random progression that Wulf-Shea 2002 and Shea-Morgan 1979 are cited for. Either those citations are decorative, or the block/drill card system implements CI somewhere I did not audit (drill card generation is out of the JSON I read).
2. "Snatch balance to 60% snatch 1RM without sequencing errors" as a `push` tier outcome is a technique-under-load metric, not a mobility metric. It borrows a load prescription without a citation. Note in engineering flags.

## 5. Retest metric check

- **`shoulder_flexion_supine_deg`** — supine goniometer for shoulder flexion has documented intra-rater reliability (Kim 2013 and multiple others). Reliability check passes. Note: this is *passive* supine ROM. Predicting *loaded overhead* function from passive supine is engineering inference; the program acknowledges this by also retesting OHS depth. Fine.
- **`ohs_hip_below_knee_cm`** — no citation attached. This is a coach-standard measure but has no validated norm in the citation set. Acceptable as an engineering choice — should be listed in `engineering_choices_flagged`.
- **`tgu_hold_max_seconds`** — the program itself flags this as coaching-consensus (Tsatsouline lineage) and not RCT-validated. Honest.

All three metrics are self-consistent with the goal (loaded overhead range). The concern is that only the goniometer has a reliability citation; the other two rest on face validity.

## 6. Engineering choices

**Silently taking evidence credit for engineering:**
- Karni 1998 / Walker 2003 support consolidation-with-sleep but not "10–15 min daily beats 45 min biweekly for shoulder mobility." That specific dose-response for ROM is not in either paper. Should be moved to (or duplicated in) `engineering_choices_flagged`.
- The "why_load_early" rationale attributes a load-titration claim to Reinold 2007 that Reinold did not test. Should be reframed as engineering + drill-EMG consensus.

**Correctly flagged as engineering:**
- 10-week duration, Sotts as primary loaded drill, TGU as endurance metric, PVC pass-through as passive-flexion drill, supine goniometer → loaded overhead inference. All appropriate.

## 7. Fixes required before REVIEWED status

1. **Fix Sadowski 2021 attribution.** Verify DOI `10.1371/journal.pone.0253951` — WebFetch returned this as Mizutori et al., not Sadowski. Either the DOI in citations.json is wrong or the author list is. Whichever is correct, the "3× BW shoulder moment" claim did not come from that paper's own measurements — it was cited *from* Prassas. Change `used_for` to reflect what Sadowski (or the correct source) actually reports (peak shoulder moment <1.5 Nm·kg⁻¹ in floor press-to-handstand; less-skilled performers rely more on shoulder-flexion moment). Founder to review.
2. **Fix Walker 2003 journal.** `citations.json` records "Neuroscience 133(4):911-917" — the paper the program actually leans on ("Sleep-dependent motor memory plasticity") is Walker MP, Brakefield T, Hobson JA, Stickgold R (2003) **Learning & Memory 10(4):275-284** (as whitepaper 04 lists it). Update citations.json. Founder to review.
3. **Fix Kibler 2013 year/pages.** BJSM 44(5):300-305 is the **2010** "Current concepts: scapular dyskinesis" paper. If the intent is the 2013 "Scapular Summit" consensus, change source to BJSM 47(14):877-885 and keep the year. If the intent is the current-concepts paper, change year to 2010. Founder to review.
4. **Soften the Reinold 2007 load claim.** In `session_rationale.why_load_early`, replace "rotator-cuff activation is greater under light load than at bodyweight" with a factually accurate paraphrase — Reinold catalogued cuff EMG across drill variants (many of which use light external load or bands to bias cuff activation) but did not RCT light-load vs. bodyweight. Add to `engineering_choices_flagged`.
5. **Soften the Ludewig-Reynolds 2009 "cause" language.** Replace "the most common single kinematic cause" with "the most consistently documented association" or move the causal framing to a Kibler citation, which is closer to that phrasing.
6. **Decide on the motor-learning references that don't drive program content** (Chiviacowsky-Wulf 2002, Wulf-Shea 2002, Shea-Morgan 1979, Salmoni 1984, Sands 2000). Either wire blocked→random and self-controlled feedback into the drill card / weekly template, or drop them from `reference_ids`. The current state — listed but not visibly operationalized — is the "reference-count theatre" the REVIEWED bar is designed to catch.
7. **Rewrite Bullock 2019 `used_for` or replace the reference.** The paper is about shoulder rotational ROM in throwers, not thoracic mobility → shoulder function.

## 8. What I did not check

- The drill card layer — external-focus cues on each drill are asserted in the principles but not present in the JSON I audited. If the drill card generator lives elsewhere and does implement Wulf-compliant cues + blocked→random CI, that would neutralize fix #6.
- Full-text of Ludewig 2000, Reinold 2007, Kim 2013 — PubMed cookie walls blocked direct verification during this session. Verdicts on those three rest on well-known findings and paper-title matching, not fresh full-text reading.
- Cross-tier progression logic (Foundation → Progression → Push condition strings). Assumed the front-end evaluates the `condition` predicates as written.
- Interaction with other programs (`handstand-walk`, `engine-builder`) beyond the compatibility list.
- Whether `physical_test.shoulder_flexion_supine_deg` in the intake actually renders / stores as a number the retest can compare against — this is a code-path concern out of audit scope.

---

**Summary for the founder:** the program is well-reasoned and the phase logic is honest. Four citation-metadata fixes and two claim-softening edits will get it across the REVIEWED bar. Sadowski is the only "broken" reference in the strict sense; Walker and Kibler are metadata errors; Reinold, Ludewig-Reynolds, Karni, Bullock are drift-level fixes. None of the fixes require re-architecting the program.
