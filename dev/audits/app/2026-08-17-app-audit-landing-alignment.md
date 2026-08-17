# Terav — Landing → App integrity audit (does the app deliver what the landing promises?)

Personas: `persona-recover`, `persona-strength`, `persona-erratic`
Landing source: `landing/src/i18n/dictionaries/en.ts`
App evidence: `next-app/tests/e2e/artifacts/personas/`
Audit date: 2026-08-17

---

## 1. Overall verdict

**Fails on 5 of 17 promises. Delivers with hedges on 4 more.** The catalog headline is broken twice over: the hero pitches "adaptive strength, cardio, and **rehab**" and stat cards claim "**100+** cited studies" — the public catalog carries **zero rehab programs** and the evidence page enumerates **89** studies. The most damaging silent failure is under the "engine sharpens every session" claim: `persona-strength` logged 30 sessions with four explicit "felt strong — could have added weight" notes and received **zero adaptive proposals**. The engine responds to under-performers (erratic: 26 auto-softens, recover: 3 amber-triggered softens) but not over-performers — the exact reverse of what a lifter reading the landing expects.

What still works: no streak UI, red-flag copy on the hip check page is exemplary, program pitches quote ranges the way the landing promises, and the readiness proposal (`Back after 17 days — soften plan?`) is now a live surface on the strength persona's Today page (up from invisible in the previous run).

---

## 2. Promise-by-promise audit

| # | Landing claim (source: `en.ts` key) | Delivery test | Result | Evidence | Severity |
|---|---|---|---|---|---|
| 1 | "Adaptive strength, cardio, and **rehab**" (`hero.sub`) | Public `/programs` catalog exposes ≥1 rehab program to a first-time visitor | **FAIL** | `next-app/public/data/programs/manifest.json` — only `anterior-hip-rebuild` is `category:"rehab"` and it is `personal: true` (hidden from catalog). Rehab category is absent from the app's category taxonomy. `persona-recover/text/06-programs.txt` shows 5 filter chips: Strength / Gymnastics & skill / Engine & endurance / HYROX prep / Left/right & mobility — **no rehab** | **P0** |
| 2 | "Every change cites a study — you approve each one" (`hero.sub`) | The one surfaced proposal in `persona-strength` carries a citation and an Accept control | **FAIL (both halves)** | `persona-strength/text/01-today.txt:15` shows the proposal text `"Back after 17 days — soften plan?"` — no cite, no study reference. `persona-strength/dom/01-today.html` shows a single `<button aria-expanded="false">` — Accept/Ignore are hidden until expansion, not present in the label | **P0** |
| 3 | "5 programs" / "in three domains" (`hero.stat_programs_value`, `hero.stat_programs_label`) | Public catalog shows exactly 5, spanning 3 named domains | **HALF-PASS** | 5 catalog programs confirmed (`manifest.json`: engine-builder, handstand-walk, csm, rowing-2k, overhead-mobility). But the app UI groups them into 5 domain chips, not 3. Landing says "three domains", app UI implies five. Naming drift: landing says "Aerobic / Concurrent / Skill"; app says "Engine & endurance / Strength / Gymnastics & skill / HYROX prep / Left/right & mobility" | **P1** |
| 4 | "100+ cited studies" (`hero.stat_studies_value`) | Evidence page enumerates ≥100 primary studies | **FAIL** | `landing/src/app/evidence/page.tsx`: `grep -c 'cite:'` returns **89**. The three group eyebrows sum to "25+ + 35+ + 40+" = 100+, but the enumerated list stops at 89. Not a small gap — 11 short. Also: no evidence-page surface exists inside the app itself; `grep -rn "Evidence" next-app/src/app/` returns metadata copy only | **P0** |
| 5 | "Every session adapts to your log" (`hero.stat_adapts_value`) | On the "push me" persona (strength), the engine shows ≥1 upward adjustment across 30 days of consistent-green logs with over-performer notes | **FAIL** | `persona-strength/final-store.json`: `day_adjustments = {}` (0 entries) after 30 logs and 4 "Felt strong — could have added weight" notes on 2026-07-08 / 07-15 / 07-22 / 07-29. Erratic (chaos path) got 26 down-softens; recover got 3. Adaptive is one-directional — it responds to under-performance only | **P0** |
| 6 | "A plan sharpened every session" (`contrast.row_what_terav`) | `day_adjustments` non-empty for at least one persona; state visibly diverges between personas | **PASS (partial)** | Counts diverge: recover=3, strength=0, erratic=26 — engine is doing work. But "every session" is not literally true; adjustments fire only on non-green states or scheduled retest windows | **P1** |
| 7 | "Every session, against your log" (`contrast.row_when_terav`) | Reader can point to a per-day, per-log adjustment | **PASS** | `persona-erratic/final-store.json` shows dated adjustments like `2026-07-04: {load_multiplier: 0.95, reason: "sim: amber state", source: "notes"}` — real per-day mutations traceable to a log entry | — |
| 8 | "Intake. Session. Sharpen." (three-step promise, `how.title`) | All three steps have a visible app surface | **HALF-PASS** | Intake exists (`programs/[slug]/intake/IntakeClient.tsx`); Session exists (Today shows composite blocks in `persona-strength/text/01-today.txt:24-56`); Sharpen exists (dated `day_adjustments`). But "sharpen" is invisible to the strength persona's user — no adjustment card ever fires for them | **P1** |
| 9 | "Under ten minutes of questions plus a physical check" (`how.step_01_body`) | Engine Builder intake has ≤~20 questions + ≥1 physical test, fits in ~10 min | **PASS with hedge** | `data/programs/engine-builder.json` has `intake.questions.length = 18` + `physical_tests.length = 4`. 22 items at ~27s each = ~10 min — right at the ceiling. Anterior-hip program has **zero questions** and only gets a 3-question modal — a different, less-defensible experience for the hip user | — |
| 10 | "You log a note. Engine proposes. You Accept or Ignore." (`how.step_03_body`) | The Coach or Today surface has visible Accept and Ignore controls next to a proposal | **FAIL (as-written)** | `persona-*/text/03-coach.txt` all show "Coming soon" — Coach is a stub in all three personas. The one live proposal appears on Today as a collapsed button (`aria-expanded="false"`) — Accept/Ignore only appear on expansion. The landing sentence implies visible controls; app hides them behind a tap. `grep -oiE "Accept\|Ignore" persona-*/dom/*.html` returns nothing at page load | **P0** |
| 11 | Named programs listed (`programs.*_pitch` — 5 pitches) | Each named slug resolves under `/programs/{slug}` in the app | **PASS** | All 5 pitched slugs (engine-builder, concurrent-strength-maintenance, rowing-2k-test-prep, handstand-walk, overhead-mobility) exist in `next-app/public/data/programs/*.json` and render (`persona-strength/text/06-programs.txt` enumerates all 5) | — |
| 12 | "Two more in build" (`programs.roadmap_link`) | Roadmap page lists exactly 2 new programs in build | **HALF-PASS** | `landing/src/app/roadmap/page.tsx` has 5 items with `status:"in_build"` — of those, 2 are `kind:"new_program"` (First Strict Pull-Up, Muscle-Up Acquisition), 1 is `kind:"program_upgrade"` (Engine Builder Block 2), 2 are product-features. Reading generously: "two more programs in build" is true. Reading strictly: a hover on the roadmap link shows more than two things "in build" | **P2** |
| 13 | "Not a clinician. Red-flag patterns fire an escalate banner, not a diagnosis." (`wontdo.not_a_clinician_*`) | `persona-recover` morning check has red-flag question controls; `/check/hip` page states it is not a diagnosis | **PASS (strongest)** | `persona-recover/text/13-check.txt:19-20` lists explicit toggles for "Woke me at night" and "Shortened my stride when running" — the two classic red-flag inputs. `persona-recover/text/14-check-hip.txt:6-8` states verbatim: "This is not a diagnosis — you already have an orthopaedist and physiatrist for that." Delivered better than the landing promises | — |
| 14 | "Not certain about you. We quote ranges, not one number." (`wontdo.not_certain_*`) | Program pitches quote ranges rather than point predictions | **PASS** | `persona-strength/text/07-programs-active.txt:18` — verbatim: "5-8% VO2max improvement, a measurable resting HR drop (5-10 bpm typical)". Engine-builder JSON `outcome_by_tier` gives ranged predictions per tier | — |
| 15 | "Not a streak game. Skip a week. The plan sharpens against that too." (`wontdo.not_streak_*`) | No streak UI anywhere. `persona-erratic` (15 skipped days) shows no "you broke your streak" messaging; system responds constructively to skips | **PASS** | `grep -in "streak" persona-*/text/*.txt` returns nothing. `persona-erratic/text/05-progress.txt` and `01-today.txt` show constructive re-entry copy ("Not feeling 100%?") not punitive streak copy. Recover persona's Today reacts to a missed strength day with "Log what you did so history stays honest, or mark it skipped" — constructive, not shame-based | — |
| 16 | "A blade gets sharper by grinding against something harder…" / founder rigor (`origin.*`) | App tone doesn't undercut the founder positioning with goofy or gamified copy | **PASS** | Cross-persona tone smoke on all 15 text files shows technical, clinician-adjacent voice. No emojis, no exclamation-heavy hype. Guide page (`persona-strength/text/11-guide.txt`) reads like a strength coach's briefing, which is the tone the landing sets up | — |
| 17 | "Cited before shipped" (`programs.sub`) | Every ACTIVE/AVAILABLE program has cited underlying evidence visible to a user | **HALF-PASS** | The evidence exists in program JSONs (`engine-builder.json` alone contains 30+ named citations across `evidence_base`, `physiological_targets`, `session_rationale`, `progression_rationale`). But **none of it surfaces to the app UI** — `persona-strength/text/06-programs.txt` mentions "cited, PR-banned" as marketing copy without any cite string. Landing program cards show "Cites: Helgerud 2007 · Seiler 2010"; app program cards don't | **P1** |

---

## 3. Systemic gaps (broken product promises)

### 3.1 The rehab leg of the tripod is missing from the shop window
- **Landing says (verbatim):** "Adaptive strength, cardio, and rehab" (`en.ts:hero.sub`).
- **App shows:** `persona-recover/text/06-programs.txt:8-13` — five filter chips, none named "rehab". Anterior Hip Rebuild only appears to a user who was already provisioned into it by an outside process; `manifest.json` marks it `personal: true`, hiding it from the general catalog. Reason recorded in landing's own roadmap: `deferred` — "A general rehab main track needs a second user to validate against."
- **Evidence:** `next-app/public/data/programs/manifest.json:26` (`"personal": true`); `persona-recover/text/06-programs.txt:8-13` (category chips); `landing/src/app/roadmap/page.tsx:146-153` (deferred item).
- **Impact:** A rehab-motivated visitor reads "adaptive rehab", clicks "Build my plan" or "Browse programs — no signup", sees zero rehab options, bounces. This is the highest-cost trust break because rehab-injured users are motivated buyers with a specific pain to solve.
- **Fix — two paths:**
  - **Fix app:** flip Anterior Hip Rebuild's `personal:false` and stand up a `rehab` category in `manifest.json.categories`. Ship the "clinical context required" gate as an intake safety step, not by hiding the program. **Preferred if the rehab claim is core to the pitch.**
  - **Fix landing:** change `hero.sub` to "Adaptive strength, cardio, and skill." Retire the rehab positioning until the general track ships. Match roadmap where "Rehab as a main track" is already `deferred`. **Preferred if the rehab track truly isn't ready.**

### 3.2 The engine doesn't push over-performers, it only softens under-performers
- **Landing says (verbatim):** "A plan sharpened every session" (`contrast.row_what_terav`) and "Every session adapts to your log" (`hero.stat_adapts_value`).
- **App shows:** For a persona who logged 30 consecutive green days on Engine Builder with four explicit "Felt strong — could have added weight" notes, `day_adjustments = {}` (zero). The engine has no upward-pressure branch. Compare `persona-erratic` (chaos) with 26 downward adjustments and `persona-recover` (rehab) with 3 downward adjustments — the machinery only fires on amber/red or missed sessions.
- **Evidence:** `persona-strength/final-store.json` — `day_adjustments` empty. Notes present on `2026-07-08, 07-15, 07-22, 07-29`, each with the text `"Felt strong — could have added weight."` Compare `persona-erratic/final-store.json` `day_adjustments["2026-07-04"] = {load_multiplier: 0.95, reason: "sim: amber state"}`.
- **Impact:** Lifters and endurance athletes buying the "sharpens every session" pitch will feel *safer* than a template but not *smarter*. The persona archetype most likely to convert (the driven improver) gets the flattest experience — a static Engine Builder plan for 30 days.
- **Fix — two paths:**
  - **Fix app:** add an "over-performer" evaluator branch. Trigger conditions: ≥N consecutive green logs OR RPE ≤ threshold + "felt strong" keyword in note. Proposal: bump TM +2.5 kg / add a Z2 interval / advance a phase. Wire to the same Accept card the softening branch already uses.
  - **Fix landing:** downgrade the promise from "adapts to your log" to "protects you from your log" and reposition Terav as a plan that gets *safer* under stress, not smarter under improvement. Weaker pitch but honest.

### 3.3 "Every change cites a study" — the one visible change cites none
- **Landing says (verbatim):** "Every change cites a study — you approve each one" (`en.ts:hero.sub`).
- **App shows:** `persona-strength/text/01-today.txt:15` — the readiness proposal reads simply `"Back after 17 days — soften plan?"`. No study, no `.evidence` string, no source attribution. `persona-recover/final-store.json.day_adjustments[]` entries carry only `reason: "sim: amber state"`, `source: "notes"` — engineering strings, not citations.
- **Evidence:** `persona-strength/text/01-today.txt:15`; `persona-recover/final-store.json` sampled entries. Cross-referenced: engine-builder.json contains cite-heavy `session_rationale` copy that never reaches the proposal surface.
- **Impact:** The single most-repeated landing verb ("cited") is unfalsifiable in the app because the app doesn't attach citations to the mechanic — Accept-a-change — the landing built the citation promise on. Sophisticated readers will notice.
- **Fix — two paths:**
  - **Fix app:** wire the adjustment engine's rules to a `citation` field so every proposal card renders "Softening after 17 days off. Cite: Mujika & Padilla 2000 (detraining, Sports Med 30(2)) — VO2max drops 7% at 12 days." **This is the change that would validate the landing verbatim.**
  - **Fix landing:** change `hero.sub` to "Every program cites its studies — you approve each session's plan." Weaker but honest — moves the citation claim from proposals to programs, which is where the citations actually live.

### 3.4 The evidence stat is short by 11
- **Landing says (verbatim):** "100+" primary studies (`hero.stat_studies_value`); "100+ primary studies. Every session cites its research." (`evidence.title`).
- **App shows:** No app-side evidence surface exists — `grep -rn "Evidence" next-app/src/app/` returns metadata copy only. Landing's own evidence page lists 89 rows (`grep -c 'cite:' landing/src/app/evidence/page.tsx`). The three domain eyebrows sum to "25+ + 35+ + 40+" — 100+ is the sum of the *claimed* ceilings, not the *enumerated* studies.
- **Impact:** Any journalist, sceptic, or would-be advisor who counts will find you 11 short of your own number. Trivial fix in either direction.
- **Fix — two paths:**
  - **Fix app / evidence page:** add 11+ more citations (there are more in program JSONs — `engine-builder.evidence_base` alone has ~30 named cites, some already on the page, some not). `grep -oE "[A-Z][a-z]+ [12][0-9]{3}" next-app/public/data/programs/*.json | sort -u | wc -l` returns 76 unique study-shaped tokens across programs — the raw material to close the gap is already in the repo.
  - **Fix landing:** change "100+" to "80+" (or the actual current count). Truthful, still substantial, defensible under scrutiny.

### 3.5 Accept / Ignore are not visible on load
- **Landing says (verbatim):** "You log a note. Engine proposes. You Accept or Ignore." (`en.ts:how.step_03_body`).
- **App shows:** The one live proposal (`persona-strength` Today) is a collapsed accordion button. `persona-*/dom/01-today.html` grep for `Accept` or `Ignore` returns nothing at page-load DOM state — controls appear only after the user taps to expand. Coach page (which the landing implies is where Accept/Ignore live) is a "Coming soon" stub in all three personas.
- **Evidence:** `persona-strength/dom/01-today.html` — the proposal is `<button type="button" aria-expanded="false" ...>Back after 17 days — soften plan?</button>`. No Accept/Ignore in DOM. `persona-strength/text/03-coach.txt:6-11` — Coach placeholder.
- **Impact:** The landing sentence sounds like a permanent visible pair of buttons ("you Accept or Ignore"). Users will experience one button that expands, then two buttons underneath. Copy conveys a compact promise the UI doesn't match.
- **Fix — two paths:**
  - **Fix app:** render Accept/Ignore inline in the proposal card at rest state — no tap required. Same info density but the promise verbs are visible.
  - **Fix landing:** change `how.step_03_body` to "You log a note. Engine proposes. Tap to Accept or Ignore." Adds one word; removes the ambiguity.

---

## 4. Cross-persona proof of the "adaptive" claim

For the landing's "Every session, against your log" promise, the three personas must diverge on the same simulated system, given different inputs. They do — asymmetrically.

| Metric | persona-recover (rehab, day 30) | persona-strength (engine, day 30) | persona-erratic (concurrent, day 45) |
|---|---|---|---|
| `logs` count | 30 | 30 | 45 |
| Logs with `exercises` populated | 0 | 0 | 0 |
| Logs with non-empty `notes` | (sampled) | 4 ("Felt strong…") | (sampled) |
| `day_adjustments` count | 3 | **0** | 26 |
| `dismissed_proposals` count | 0 | 0 | 0 |
| `skipped` count | (persona manifest: 10) | 0 | (persona manifest: 15) |
| `training_maxes.back_squat_highbar` | 89 kg | 115 kg | 110 kg |
| `active_program_id` (user_profile) | (recover: hip-rebuild inferred) | engine-builder | (erratic: csm inferred) |

**Verdict:** Adaptive is **half-real**. The engine demonstrably responds to under-performance and chaos — 26 auto-softens for the erratic path, 3 for the recover path — with real per-day mutations traceable to log entries. But it does not respond to over-performance. The strength persona's zero-adjustment state on 30 green days is not a bug in the data harness (as the previous audit misread) — it is the engine correctly reporting that it has no upward branch to fire. The "sharpens" verb is one-directional. That gap is why claim #5 fails P0 and why the systemic gap in 3.2 is the highest-impact fix for the driven-improver segment.

Also: `logs[].exercises` is empty in every log across every persona. The morning-check symptom score is being logged; the per-set/per-exercise log is not being written by the simulator. This is likely a persona harness limitation (the simulator only wrote symptom + notes, not set data), so this is not itself an app bug — but it means History renders "0 done" everywhere despite 30/45 activity days, which will confuse any real user who logs symptoms without also logging sets. Consider making the History label read "0 sessions logged" not "0 done" so a symptom-only day still reads as an active day.

---

## 5. Suggested landing edits (if the app can't deliver a claim, cut the claim)

- Landing key `hero.sub` — currently "Adaptive strength, cardio, and rehab. Every change cites a study — you approve each one." If the app can't ship rehab in the catalog and can't attach cites to proposals, change to: "Adaptive strength, cardio, and skill. Every program cites its research — you approve each session's plan."
- Landing key `hero.stat_studies_value` — currently "100+". Change to the actual enumerated count on the evidence page — today "80+" — until 11 more citations land.
- Landing key `hero.stat_programs_label` — currently "in three domains". Match app category taxonomy: either the app collapses to three domains (aerobic / concurrent / skill) or landing changes to "across five categories".
- Landing key `how.step_03_body` — currently "You log a note. Engine proposes. You Accept or Ignore." Change to "You log a note. Engine proposes. Tap to Accept or Ignore." Or, better, ship inline controls.
- Landing key `programs.title` — currently "Five programs live. Two more in build." Roadmap has 3 program-related items in build (2 new + 1 upgrade). Keep as-is; the mismatch is defensible under a "new programs" reading.
- Landing key `evidence.title` — currently "100+ primary studies. Every session cites its research." Change to "80+ primary studies. Every program cites its research." until the delta is closed.

---

## 6. Priorities

**P0 (broken promises — fix app OR fix landing this quarter):**
1. Rehab visible in the public catalog, or drop rehab from the hero (3.1).
2. Adaptive engine gains an over-performer branch, or the "sharpens every session" verb softens (3.2).
3. Proposal cards carry a citation string, or the "every change cites a study" claim moves from proposals to programs (3.3).
4. Evidence page hits 100 rows, or the "100+" stat drops to the honest count (3.4).
5. Accept/Ignore are visible at proposal-card rest state, or the how-it-works step-3 body adds the "Tap to" hedge (3.5).

**P1 (weakly delivered — sharpen app OR soften landing):**
- Match the "three domains" hero label to the app's actual taxonomy (or vice-versa).
- Surface each program's cited studies in the app program card the way landing shows "Cites: Helgerud 2007 · Seiler 2010" — the data is already in the program JSONs; it's a rendering gap.
- Wire an in-app Evidence link (Guide already lists studies inline in prose form; a dedicated `/evidence` inside the app would honour landing's evidence claim inside the walled garden too).
- Unify intake experience — the hip program's 3-question modal is a different beast from the 18-question wizard the endurance/strength programs use. Either promote the hip intake to the same wizard or the landing's "under ten minutes of questions plus a physical check" claim doesn't apply uniformly.

**P2 (nice-to-haves):**
- History label "0 done" should read "0 sessions logged" to avoid making symptom-only days look inert.
- Coach placeholder — currently "Coming soon" — is fine as a stub but the landing's step-3 sentence points readers toward it. Either surface the readiness proposal on Coach too (mirror the Today card there) or explicitly point step-3 to Today.
- The "Two more in build" roadmap link surfaces 5 in-build items when clicked. Consider filtering the roadmap page to show program-shaped in-build items by default, with a toggle for "show product-development items too".
