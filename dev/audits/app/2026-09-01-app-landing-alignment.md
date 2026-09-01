# Terav — Landing → App integrity audit (does the app deliver what the landing promises?)

Date: 2026-09-01
Personas: 21 bundles; primary evidence from persona-recover, persona-strength, persona-erratic, persona-pullup, persona-pullup-fast, persona-muscleup, persona-engine-block2, persona-handstand, persona-mobility
Landing source: `landing/src/i18n/dictionaries/en.ts`, `landing/src/lib/programs-catalog.ts`, `landing/src/app/roadmap/page.tsx`, `landing/src/app/evidence/page.tsx`
App evidence: `next-app/tests/e2e/artifacts/personas/`, `next-app/public/data/`

---

## 1. Overall verdict

**Fails on 4 of 19 promises — and the failures are all on the landing side of the compact, not the app side.**

The app is the honest half of this product. It ships 8 public programs, it labels three of them `CITED` rather than `VERIFIED` and explains exactly what that ladder means, every captured proposal carries a `Because:` note-context, a `Source:` citation and an Apply/Ignore pair, and there is no streak anywhere in the UI. The catalog promotion executed today is real: `/programs` renders **8 CITED · LIVE NOW**.

The landing did not keep up. The hero stat was bumped to "8 programs" but **`landing/src/lib/programs-catalog.ts` still contains 5 entries**, so `terav.fit/programs/first-strict-pullup`, `/muscle-up` and `/engine-builder-block-2` are 404s. Worse, two strings on the same page contradict the hero: `programs.title` still reads "Five programs live. Three more in build." and the roadmap still files all three newly-live programs under **In build**. A friend clicking through this week sees a hero claiming 8, a section claiming 5, and a roadmap claiming the three they just used in the app are unbuilt. That is not a rounding error; it is the landing calling the app a liar.

Secondary and real: the landing carries no equivalent of the app's `CITED` vs `VERIFIED` ladder, so the three promoted-today programs are presented at the same review level as the five specialist-audited ones.

---

## 2. Promise-by-promise audit

| # | Landing claim (`en.ts` key) | Delivery test | Result | Evidence | Severity |
|---|---|---|---|---|---|
| 1 | "An engine, a skill, a lift, a stubborn joint" (`hero.sub`) | app catalog serves all four archetypes | **pass** | manifest: endurance ×3, skill ×3, strength ×1, asymmetry ×1, rehab ×1 (personal) | — |
| 2 | "Every change cites a study." (`hero.sub`) | every proposal in captured persona text carries a source | **pass, with a caveat** | 7 distinct proposal blocks across personas; all carry `Source:` (Rhea 2003, Halson 2014, ACSM 2002). But the app's own evidence page says "if a claim can't be traced back here, it's engineering-choice, not cited" — the landing's absolute has no hedge | P1 |
| 3 | "8 programs" (`hero.stat_programs_value`) | count non-personal manifest entries; count app `/programs` render | **pass** | `manifest.json` = 9 entries, 1 `personal: true` → 8 public. `persona-strength/text/06-programs.txt`: "8 CITED · LIVE NOW" | — |
| 4 | "strength, skill, engine, mobility" (`hero.stat_programs_label`) | label describes the real mix | **fail** | Real mix: 3 skill, 3 engine, 1 strength, 1 mobility. Label leads with the thinnest domain and gives equal billing to two singletons | P1 |
| 5 | "126" / "cited studies" (`hero.stat_studies_value`) | `citations.json` holds 126 resolvable, distinct studies | **fail (marginal)** | 126 entries, but 2 duplicate pairs (`butcher_2015`/`butcher_2015_crossfit`, `wilson_2012`/`wilson_loenneke_2012`) → **124 unique**. 4 entries (`adkin_frank_2000`, `bandura_1997_self_efficacy`, `carpenter_frank_2001`, `hardy_1996_catastrophe`) are referenced by no program and no engine source file | P1 |
| 6 | New programs' refs resolve into the corpus | walk every `reference_ids` array against `citations.json` | **pass** | 118 distinct program refs, **0 unresolved**. first-strict-pullup 21, muscle-up 22, engine-builder-block-2 32 — all resolve | — |
| 7 | No retracted references remain | grep corpus + programs for retracted work | **pass** | "Barbalho" appears only in two documented removal notes in `first-strict-pullup.json` (`outcome_evidence`, `status_history` 2026-09-01) and in the `used_for` field of its replacement, `rhea_2003`. No live citation to it | — |
| 8 | "126 primary studies. Every session cites its research." (`evidence.title`) | landing evidence page enumerates the corpus | **fail** | `landing/src/app/evidence/page.tsx` enumerates **91** (28+26+37). Zero of the pull-up/muscle-up distinctives are present: Youdas 2010, Vigouroux 2007, Sinnett 2019, Roig 2009, Kibler 2013, Reinold 2007, Beattie 2014 all absent. The app's `/evidence` lists all 126 | P1 |
| 9 | "Your focus adapts every session" (`hero.stat_adapts_*`) | persona final-stores diverge on comparable days | **pass** | See §4. day_adjustments 3 / 21 / 10 / 12 / 6, dismissals 6-12, skips 0-15, TMs diverge | — |
| 10 | "A plan sharpened every session" (`contrast.row_what_terav`) | adjustments present for over- and under-performers | **pass** | persona-erratic 21 day_adjustments over 45 logs; persona-muscleup 12 over 60 | — |
| 11 | "Every session, against your log" (`contrast.row_when_terav`) | proposal text names the log signal | **pass** | `persona-strength/text/01-day.txt:11` "Because: 3 straight green days plus 'felt strong' in a recent note." `persona-erratic:11` "High fatigue / outside load detected." | — |
| 12 | "Under ten minutes of questions plus a physical check" (`how.step_01_body`) | intake step count is tractable; a physical check exists | **pass, with a caveat** | 7 steps (CSM), 11 (mobility), 14 (pull-up, muscle-up), 18 (engine block 2). All single-tap or single-number. But pull-up and muscle-up intake is entirely **self-report** (`dead_hang_seconds_selfreport`, `false_grip_hang_seconds_selfreport`) — no in-app physical check screen | P2 |
| 13 | "You log a note. Engine proposes. You apply the change or ignore it." (`how.step_03_body`) | Apply and Ignore controls present with note-context | **pass** | `persona-strength/text/01-day.txt:16-17` `APPLY BUMP` / `IGNORE`; `persona-erratic:15-16` `APPLY 10% LIGHTER` / `IGNORE`; `persona-recover:22-23` `ADVANCE TO CYCLE 1` / `IGNORE` | — |
| 14 | "Five programs live. Three more in build." (`programs.title`) | matches the catalog | **fail — P0** | Catalog is 8 live, 0 of the named three in build. Contradicts `hero.stat_programs_value` on the same page | **P0** |
| 15 | Named programs resolve at `/programs/{slug}` (`programs.*_pitch`, `PUBLIC_PROGRAMS`) | every live slug has a landing preview | **fail — P0** | `programs-catalog.ts` holds 5 slugs. `/programs/first-strict-pullup`, `/programs/muscle-up`, `/programs/engine-builder-block-2` do not exist. `generateStaticParams` returns 5 | **P0** |
| 16 | "Three more in build — see the roadmap →" (`programs.roadmap_link`) | roadmap matches shipped state | **fail — P0** | `roadmap/page.tsx:126,134,141` — First Strict Pull-Up, Muscle-Up Acquisition, Engine Builder Block 2 all `status: "in_build"`. All three shipped today | **P0** |
| 17 | "Cited before shipped." (`programs.sub`) + implied uniform review | landing distinguishes review levels the app distinguishes | **fail — P0** | App: "CITED = every claim references a study, harness passes. VERIFIED = specialist-audited AND ≥5 users completed the arc." Landing has one status enum: `AVAILABLE`. The three programs promoted today are `REFERENCED`, explicitly "no specialist audit yet" (`first-strict-pullup.json` status_history) — the landing gives no way to know that | **P0** |
| 18 | "Not a clinician. Red-flag patterns surface a banner, not a diagnosis." (`wontdo.not_a_clinician_body`) | red-flag path escalates, never names a condition | **pass** | `persona-recover/text/10-report.txt:168-175` red-flag rules, each "action: escalate to clinician". `11-guide.txt:93` "RED FLAGS — STOP THE APP, CALL A CLINICIAN". `23-legal-disclaimer.txt:3` "not a diagnosis". No diagnostic label anywhere in persona-recover | — |
| 19 | "We quote ranges, not one number." (`wontdo.not_certain_body`) | outcome copy uses ranges | **pass** | `persona-engine-block2/text/07-programs-active.txt:27` "Threshold pace / power shift 2-5% by tier. Additional VO2max +4-9%… -3 to -8 bpm." Pull-up tier outcomes are ranges ("25-45s dead hang", "3-5 strict") | — |
| 20 | "Not a streak game. Skip a week." (`wontdo.not_streak_body`) | no streak UI for the persona who skipped 15 sessions | **pass** | Zero user-facing "streak" in any of 21 personas' text captures. "streak" appears only in source comments enforcing the rule (`check/page.tsx:25`, `ReadinessTrail.tsx:24`). persona-erratic (15 skips) shows no penalty copy | — |
| 21 | Founder rigor tone (`origin.body`) | app copy does not undercut | **pass, with a wart** | Tone is consistent and unjokey. But raw identifiers leak into user-facing surfaces: `persona-recover/text/05-progress.txt` renders "block_pull_midshin · 101 kg × 5" as the Top lift | P2 |

---

## 3. Systemic gaps (broken product promises)

### 3.1 The landing catalog was never updated with the catalog

- **Landing says (verbatim):** hero — `"8 programs"`; section title — `"Five programs live. Three more in build."`; roadmap — First Strict Pull-Up / Muscle-Up Acquisition / Engine Builder Block 2, `status: "in_build"`, "In build".
- **App shows:** `"8 CITED · LIVE NOW"` with all three rendered, tapped through, and personas driven to day 45-60 on them.
- **Evidence:** `landing/src/lib/programs-catalog.ts` (5 entries, `PUBLIC_PROGRAMS` derived from it); `landing/src/app/roadmap/page.tsx:126-146`; `next-app/tests/e2e/artifacts/personas/persona-strength/text/06-programs.txt`; `next-app/public/data/programs/manifest.json`.
- **Impact:** Three dead URLs on the marketing site for programs the beta is about to hand to friends. A visitor who reads the hero, scrolls one screen, and reads "Five programs live" concludes the site is stale — and if the site is stale, so is the science claim next to it. Precision claims only work when they're all precise.
- **Fix (app path):** none needed; the app is correct.
- **Fix (landing path — do this):** add the three entries to `programs-catalog.ts` with slug, duration, category, pitch and 3 representative cites; change `programs.title` to `"Eight programs live. Two more in build."`; change `programs.roadmap_link` to `"Two more in build — see the roadmap →"`; move the three roadmap items to `status: "shipped"`. First Strict HSPU and HYROX remain the two in build/planned, which makes "two more" true.

### 3.2 The landing has no review ladder; the app does

- **Landing says (verbatim):** `programs.sub` — "Cited before shipped." Every card renders `status: "AVAILABLE"`.
- **App shows:** "CITED = every claim references a study, simulator harness passes. VERIFIED = specialist-audited AND ≥5 users completed the arc with subjective success." Five programs carry VERIFIED; First Strict Pull-Up, Muscle-Up and Engine Builder Block 2 carry CITED. `first-strict-pullup.json` status_history 2026-09-01: *"REFERENCED not REVIEWED — no specialist audit yet."*
- **Evidence:** `persona-strength/text/06-programs.txt` lines 6-12 and per-card badges; `persona-pullup/text/07-programs-active.txt:6`.
- **Impact:** The app is more honest than the landing. That is a strange and fixable failure. A friend who signs up because "cited before shipped" and then reads the app's own definition of CITED learns the landing withheld a distinction the product itself considers important enough to badge. This is the exact gap this audit exists to catch: the landing implies a review level three programs have not had.
- **Fix (landing path):** port the two-tier badge to `programs-catalog.ts` (`tier: "CITED" | "VERIFIED"`), render it on the card next to the category dot, and add one sentence to `programs.sub`: "Every program ships cited. VERIFIED means a specialist has audited it and five people finished the arc."
- **Fix (app path):** none.

### 3.3 "Every change cites a study" is stronger than the product's own standard

- **Landing says (verbatim):** `hero.sub` — "Every change cites a study."
- **App shows:** `/evidence` — "If a claim in the app can't be traced back to something here, it's engineering-choice, not cited." `first-strict-pullup.json` labels grease-the-groove singles as "Coaching heuristic (Tsatsouline), flagged as engineering choice" and the 40-60 hard-reps/week dose as "coaching-consensus range, not an RCT result".
- **Evidence:** `persona-pullup/text/20-evidence.txt:7`; `next-app/public/data/programs/first-strict-pullup.json:1175,1180`.
- **Note:** the *proposals* themselves do all cite — 7/7 captured. The gap is that the app's honest third category (engine choice / named log signal) has no representation in the landing's absolute. The project's own charter says "every change cites a study **OR names its log signal**"; the landing dropped the second clause.
- **Impact:** low blast radius today, high if a sharp beta user finds an uncited engineering choice and posts it. Restore the clause and the claim becomes unbreakable.
- **Fix (landing path):** `hero.sub` → "Every change cites a study or names the signal in your log." Costs six words, buys immunity.

### 3.4 The landing evidence page backs 91 of 126 studies — and none of the new programs'

- **Landing says (verbatim):** `evidence.title` — "126 primary studies. Every session cites its research."
- **Landing shows:** 91 enumerated sources across three domains. No skill-specific pull references at all (Youdas 2010, Vigouroux 2007, Sinnett 2019, Roig 2009, Kibler 2013, Reinold 2007, Beattie 2014 — 0 hits).
- **App shows:** `/evidence` enumerates all 126, each badged CITED, with links where available.
- **Evidence:** `landing/src/app/evidence/page.tsx` (28+26+37); `persona-pullup/text/20-evidence.txt` (126 CITED badges, Youdas at :509, Vigouroux at :465).
- **Impact:** The evidence page is the landing's proof surface. It proves 72% of the number in the headline above it, and 0% of the two programs most likely to attract signups this week.
- **Fix (landing path):** either add a fourth group ("Skill acquisition and upper-body pulling — 35 primary sources") sourced from `citations.json`, or generate the page from `next-app/public/data/citations.json` at build time so the two can never drift again. The second is the correct fix.

### 3.5 The "126" is 124

- **Evidence:** two duplicate pairs in `next-app/public/data/citations.json` — `butcher_2015` / `butcher_2015_crossfit` (identical authors, year, journal, pages) and `wilson_2012` / `wilson_loenneke_2012` (same). Four further IDs are referenced by no program and no engine source: `adkin_frank_2000`, `bandura_1997_self_efficacy`, `carpenter_frank_2001`, `hardy_1996_catastrophe`. 68 of 126 entries carry no URL or DOI.
- **Impact:** A product whose whole differentiator is citation precision cannot have a bibliography with duplicate entries inflating its headline number. One motivated reader with `Ctrl-F` finds this in ninety seconds.
- **Fix (app path):** dedupe to 124, repoint any references, re-run integrity check, update `hero.stat_studies_value` and `evidence.title` to "124". Optionally drop or use the 4 orphans (that would make it 120 and every one load-bearing — a stronger claim than a bigger number).

### 3.6 Barbell proposal copy renders inside skill and mobility programs

- **Landing says (verbatim):** `hero.sub` — "Terav writes that focus arc"; `how.step_02_body` — "Tomorrow's plan, written against your history."
- **App shows:** in **Handstand Walk** and **Overhead Mobility**, the fatigue proposal reads *"Because: Signal: life load 4/10. Consider trimming 5% from the top set."* Neither program has a top set.
- **Evidence:** `persona-handstand/text/01-today.txt:11-16`; `persona-mobility/text/01-today.txt:11-16`; also `persona-multitrack`.
- **Related:** `persona-mobility/text/01-today.txt` renders **"3 blocks · 0 exercises"** on the day view, and both handstand and mobility print *"Week 7 · random practice"* while the header says week 4. Skill personas also carry seeded barbell training maxes (`back_squat_highbar: 110`) in `final-store.json`.
- **Impact:** breaks the single most differentiating promise — that the plan is written for *your* focus. A handstand user reading about their top set concludes the engine is a barbell app wearing a costume.
- **Fix (app path):** modality-aware copy for the load-softening proposal — "trim 5% from today's hardest set" for barbell, "cut the last set / take the easier tier today" for skill and mobility. Fix the 0-exercise render and the week-number mismatch.

---

## 4. Cross-persona proof of the "adaptive" claim

| Metric | recover (d30) | strength (d30) | erratic (d45) | pullup (d45) | pullup-fast (d60) | muscleup (d60) | engine-block2 (d35) |
|---|---|---|---|---|---|---|---|
| logs | 30 | 30 | 45 | 45 | 60 | 60 | 35 |
| day_adjustments | 3 | absent | **21** | 10 | absent | 12 | 6 |
| dismissed_proposals | 6 | 6 | 9 | 9 | 12 | 12 | 7 |
| proposal_history | 6 | 6 | 9 | 9 | 12 | 12 | 7 |
| skipped | 10 | absent | 15 | 5 | absent | 6 | 3 |
| training_maxes (squat / block pull) | 99 / 126 | 115 / 147.5 | 110 / 140 | 110 / 140 | 120 / 155 | 110 / 140 | 110 / 140 |
| retest_readings | absent | 4 | 6 | 6 | 8 | 8 | 4 |

**Verdict: adaptive is real, not theatre.** The under-recovering persona sits at squat TM 99 and 10 skips; the overperformers sit at 115 and 120 with zero skips and an absent `day_adjustments` key (nothing needed softening). persona-erratic accumulates 21 day-level adjustments against 15 skips and still shows no penalty language — the "not a streak game" claim and the "adapts every session" claim are proven by the same artifact.

**One weakness in the proof:** the four skill/engine personas share identical seeded barbell training maxes (110 / 140), which means divergence for the three *new* programs is demonstrated through `day_adjustments` and skips only, not through program-native progression state. persona-pullup-fast — a 60-day overperformer — shows no proposal at all on its captured day. The new programs' adaptivity is under-evidenced relative to the strength programs.

---

## 5. Suggested landing edits (if the app can't deliver a claim, cut the claim)

- `programs.title` — currently "Five programs live. Three more in build." → **"Eight programs live. Two more in build."**
- `programs.roadmap_link` — currently "Three more in build — see the roadmap →" → **"Two more in build — see the roadmap →"**
- `hero.sub` — currently "…Every change cites a study." → **"…Every change cites a study or names the signal in your log."**
- `hero.stat_programs_label` — currently "strength, skill, engine, mobility" → **"skill, engine, strength, mobility"** (descending by count — the same four words, now true to the mix).
- `hero.stat_studies_value` / `evidence.title` — currently "126" → **"124"** after deduping, or **"120"** if the four unused entries are dropped.
- `programs.sub` — append: **"Every program ships cited. VERIFIED means a specialist has audited it and five people finished the arc."**
- Add `programs.pullup_pitch`, `programs.muscleup_pitch`, `programs.engine_block2_pitch` and the three catalog entries.
- `landing/src/app/roadmap/page.tsx` — move the three items from `in_build` to `shipped`.

---

## 6. Priorities

**P0 — broken promises, fix before the beta goes to friends:**
1. Add first-strict-pullup, muscle-up, engine-builder-block-2 to `landing/src/lib/programs-catalog.ts`. Three live programs currently 404 on the marketing site. (§3.1, rows 14-16)
2. Fix `programs.title` and `programs.roadmap_link` — the landing contradicts its own hero one screen down. (§3.1)
3. Move the three roadmap items from "In build" to "Live". (§3.1)
4. Port the CITED/VERIFIED ladder to the landing, or the landing implies a specialist audit the three new programs have not had. (§3.2, row 17)

**P1 — weakly delivered, sharpen the app or soften the landing:**
5. Dedupe `citations.json` (126 → 124) and update both the hero stat and the evidence title. (§3.5)
6. Generate the landing evidence page from `citations.json` — it currently enumerates 91 of 126 and none of the new programs' sources. (§3.4)
7. Restore the "or names the signal in your log" clause to `hero.sub`. (§3.3)
8. Fix `hero.stat_programs_label` word order to match the real mix. (row 4)
9. Modality-aware load-softening proposal copy — no "top set" inside Handstand Walk or Overhead Mobility. (§3.6)
10. Fix "3 blocks · 0 exercises" on the Overhead Mobility day view, and the week-number mismatch ("Week 7" under "week 4 of 4"). (§3.6)

**P2 — nice-to-have:**
11. Give persona-pullup-fast / persona-muscleup a captured proposal so the "adapts every session" claim is evidenced for the new programs, not inferred. (§4)
12. Render exercise display names, not `block_pull_midshin`, on the Progress top-lift tile. (row 21)
13. Reconcile "First Strict Pullup" (day header) with "First Strict Pull-Up" (catalog).
14. Add a real physical-check step to the pull-up and muscle-up intakes, or soften `how.step_01_body` to "questions, plus a physical check where the program needs one". (row 12)
15. Landing program pages render "3 cited studies" per program while the underlying JSON carries 21-35 references — undersells the corpus. (`landing/src/app/programs/page.tsx:119`)

---

## What is genuinely good

Fifteen of nineteen promises hold, and the four that fail all fail on the landing. The app declines to gamify, declines to diagnose, quotes ranges, cites every proposal it makes, exposes the full 126-entry bibliography in-product, badges its own programs by review level, and caught and documented a retracted reference on the day it promoted the program that carried it. That last item is the strongest evidence in this audit that the evidence claim is not marketing. Get the landing to the same standard by Friday.
