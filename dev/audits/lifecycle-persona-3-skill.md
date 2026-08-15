# Lifecycle audit — Persona 3 (skill / multi-tier)

**Persona:** Tomás, 27, industrial designer. CrossFit 4 yr. Freestand hold 8–10s, wall walk 2m, freestand walk 0m. Wants a freestanding 15m walk. Values understanding *why*.
**Under test:** `handstand-walk` (multi_dimensional, 4 tiers: Foundation → Wall → Freestand → Advanced).
**Method:** Landing promises → code paths a real Tomás hits: signup → catalog → preview → intake → tier inference → Today → 15 session logs → retest → tier promotion → end of plan.

---

## 1 · Promise ledger

| # | Where | Promise |
|---|-------|---------|
| P1 | `landing/Programs.tsx:52` | "Multi-tier" duration |
| P2 | `programs-catalog.ts:230` | Drill selection reads weakest sub-skill, 2-3 drills per session at your level |
| P3 | `programs-catalog.ts:236` | CI switches on at week 3: blocked→random |
| P4 | `programs-catalog.ts:245` | Retest every 4 weeks; tier gates unlock on measured thresholds |
| P5 | `Hero.tsx:94` | "Every session adapts to your log" |
| P6 | `manifest.json:65` | "Intake picks your tier; drills + phase pace adapt to capability" |
| P7 | `handstand-walk.json:60` principles | "Every drill card renders an external-focus cue" (Wulf 1998/2013) |
| P8 | `handstand-walk.json:64` | Video review is a button, not a schedule (Chiviacowsky & Wulf 2002) |
| P9 | `handstand-walk.json:70` | Blocked weeks 1-2, interleaved from week 3 |
| P10 | `handstand-walk.json:1253` | Freestand-hold retest improved → advance capability_profile |
| P11 | `programs/[slug]/page.tsx:97` | Tier-scoped outcomes on marketing preview |
| P12 | `HowItWorks.step_03` | You log. Engine proposes. You Accept |
| P13 | `Programs.tsx card` | 4-tier chain visible on catalog card |
| P14 | `manifest.json:70` | Weekly freestand-hold retest |
| P15 | `handstand-walk.json:1367` | Engine proposes; nothing mutates silently |

---

## 2 · Walkthrough

### 2.1 Catalog

Filter to "Gymnastics & skill" (`programs/page.tsx:32-49`) works. Handstand card renders `Foundation → Wall → Freestand → Advanced` (`programs/page.tsx:219-229`) + `adapts` line — **P13 kept.** But it also shows `8 wk` (`programs/page.tsx:237`) even though the landing markets "Multi-tier · 8-16 weeks" and the full arc is 24-36 weeks (`handstand-walk.json:46`). Tomás thinks he's buying an 8-wk plan when Block 1 of 3 is 8 weeks.

### 2.2 Preview

`hasIntake=true` → `routeThroughIntake=true` → `requiresTierPick=false` (`ProgramPreviewClient.tsx:82-92`). Tier picker doesn't show; Start routes to intake. Good.

But the marketing preview's "Honest outcome ranges" (`programs/[slug]/page.tsx:97`) reads `p.outcomes` from `programs-catalog.ts:246-250`, which uses a generic Foundation/Progression/Push template — 3 bins for a 4-tier program. Tomás can't see what Freestand tier means. **F-2, P11 half-broken.** Also the retest cadence is quoted differently: catalog says "every 4 weeks" (`programs-catalog.ts:245`); manifest says weekly + monthly (`manifest.json:70`). **F-1.**

### 2.3 Intake

Tomás answers: 5 d/wk, wall over_60s, freestand 5_15s, walk never, no wrist/shoulder pain, 18-30, no osteo/HTN/acute. Skips physical tests (they're gated behind "optional" `<details>` and read as work).

Because tests are skipped, `SELF_REPORT_TO_TEST_VAR` (`intake-tier.ts:284-296`) maps selects → the physical-test vars via `SELF_REPORT_TO_NUMERIC`:
- wall_hold_max_seconds := 90 (over_60s)
- freestand_hold_max_seconds := 10 (5_15s midpoint)
- walk_distance_max_metres := 0

Tiers:
- A `wall<5 && free<1` false
- B `wall>=15 && free<5` false (free=10)
- C `free>=5 && walk<5` **true**
- D `walk>=10` false

**Tier C — Freestand.** Honest. Review screen renders `typical_outcome` and a "How this was picked" details fold — legible.

Two intake issues:
- Wizard hint reads "you'll re-test on Day 3" (`IntakeClient.tsx:439`). No Day-3 retest is ever scheduled. **F-3.**
- Capacity gate (`IntakeClient.tsx:86-96`) reads `program.schedule_constraints.session_count_per_week_range`; handstand-walk.json doesn't declare it. Tomás could pick 2 d/wk against a tier that authors 5 and get no warning. **F-4.**

Coverage gap in tier conditions: `wall=10, free=3` fails A/B/C/D — falls through to default A. Not Tomás's case, but a real hole. **F-tierGaps.**

### 2.4 First Today

`blocksForDate` (`app/page.tsx:114`) → `multiDimensionalBlocksForDate` (`plan-generator.ts:83-128`). Tier `tier_c_freestand`, Monday → `block_skill_A_freestand_hold`, wrap = wrist_prep + recovery. `composeSlotDrills` runs (block has `capability_slot: handstand_hold_static`); candidates from `drill_library` filtered by `capability_domains` and `level ± 1`. The composer attaches the first external cue as `item.note` (`plan-generator.ts:268`).

**But `item.note` never renders.** `ExerciseCard.tsx` has zero references to `item.note`. `ExerciseDetailsSheet.tsx:99` renders `exercise.cues`, and all 31 `hs_*` exercises carry only `cues_external_focus`, not `cues` (verified 31/31 via `public/data/exercises.json`). So Tomás sees no cues on any handstand drill — no Wulf cue, no external-focus phrasing, nothing. **P7 broken. F-P7.**

Also: `composeSlotDrills` REPLACES the block's items with 2-3 composed drills (`plan-generator.ts:263-270`), dropping the authored `hs_video_review` feedback row. Video-review button disappears entirely from any composed session. **P8 broken. F-composeDropsFeedback.**

### 2.5 8-week arc — sample logs

Using the schema at `handstand-walk.json:1256-1286`:

- **S1 Mon w1** freestand attempts 5×0:30, best 9s. Wrist 1/10. No cue rendered.
- **S2 Tue w1** single-step 6×3; 2 clean singles. Free 10s.
- **S3 Thu w1** free hold 6×0:30, best 11s. Note: "far wall not floor."
- **S4 Fri w1** walk shuttle 6×1; 3× 2-step shuttles. Free 12s.
- **S5 Sun w1** free PR 13s. Videoed 1 set — but no review button on the composed session, saved to camera roll instead.
- **S6 Mon w2** free 12s. Kick-up frustration: 4/6 missed.
- **S7 Wed w2** free PR 14s. Note: belly-to-wall shrugs feel like the piece.
- **S8 Thu w2** shuttle 3×2; 1×3 steps.
- **S9 Fri w2** **failed** — warm-up wrist 4/10, stopped kick-ups. Schema says amber; nothing in the UI computes or shows amber for skill users (F-5).
- **S10 Mon w3** wrist 2/10. CI kicks in (`applyContextualInterference`, `plan-generator.ts:181`) — drill order changes. App doesn't say why.
- **S11 Wed w3** free PR 15s! First 3 continuous walking steps.
- **S12 Fri w3** free 13s. 4 steps. Wrist 2/10.
- **S13 Mon w4** free 14s. 3 steps. Note: hips collapsing.
- **S14 Tue w4** Mid-block retest per manifest. **No retest prompt.** Panel shows "Not yet trackable" — see F-6.
- **S15 Fri w4** free PR 16s. 4 clean steps.

### 2.6 Retest / tier promotion

`RetestMetricsPanel` calls `evaluateRetestMetrics` → `parseSource` (`retest-evaluator.ts:46-67`) which only recognises `training_maxes.<id>` or `runs[]…`. Handstand `retest_metrics[]` use bare identifiers (`wall_hold_max_seconds`, `freestand_hold_max_seconds`, `walk_distance_max_metres`) with `source: "physical_test"`. All three fall to `{ kind: "unsupported" }` → "Not yet trackable in the app." for the whole 8 weeks. **F-6. P4, P14 broken.**

Tier promotion: `multi-dim.ts:22-39` is a documented Phase B stub — `shouldEvaluate=false`, `evaluate=null`, `suggest=null`. `capability_profile` is seeded once at intake commit (`IntakeClient.tsx:170-194`) and never mutates. `progression_rules.week_end_rule` in the JSON is unread. Even if Tomás manually retested and logged 20m of walk, no code path advances him from Tier C to Tier D. No "advance tier" button exists on preview or Today. **F-7. P10, P15 broken.**

### 2.7 Multi-tier drill swap (the honest part)

`weekly_template.reference_week_tier_a/b/c/d` do specify different primary blocks per tier. Tier C Monday = `block_skill_A_freestand_hold`; Tier D Monday = `block_skill_A_variability`. Different blocks, different `capability_slot`, different candidates. So IF a promotion happened, drills genuinely change (not just labels). **P2 correct in principle** — but blocked by F-7. And composed sessions always drop the feedback drill (F-composeDropsFeedback).

### 2.8 Progress / report / end

Retest panel is three placeholders. Tomás's real PRs (free 8→16s, walk 0→4 steps) live only in free-text session notes. Report is empty (F-6 downstream).

Phase windows are hardcoded (`handstand-walk.json:529-620`, `starts: 2026-01-05` etc.). The `status_note` at line 5 claims "generator remaps to real start date on activation" — no such remap code was found in the multi-dim path (rowing-2k has a `phase_shift_days` at `IntakeClient.tsx:138-149`; handstand does not use it). At Week 9 there's no "Block 1 complete → Block 2" surface. **F-8.**

---

## 3 · Findings

Severity: SEV-1 breaks the promise. SEV-2 confuses materially. SEV-3 cosmetic.

### F-P7 (SEV-1) External-focus cues never render for any handstand drill
`ExerciseDetailsSheet.tsx:99` reads `exercise.cues`; all 31 `hs_*` drills in `public/data/exercises.json` carry only `cues_external_focus`. The composer attaches a cue as `item.note` (`plan-generator.ts:268`) but `ExerciseCard.tsx` never renders `item.note`. Kills Wulf 1998/2013 — the most-cited principle of the program is invisible to the persona who cares most about "why." **Fix:** in `ExerciseDetailsSheet.tsx`, read `exercise.cues_external_focus` (fallback to `cues`); OR render `item.note` on `ExerciseCard.tsx` as a first-class cue chip.

### F-6 (SEV-1) Retest metrics never surface for skill programs
`retest-evaluator.ts:46-67` `parseSource` supports only `training_maxes.<id>` and `runs[]…`. Handstand's three `retest_metrics` use bare `wall_hold_max_seconds` etc. with `source: "physical_test"`. All fall to unsupported → "Not yet trackable" for the whole block. P4/P14 broken and the tier-promotion trigger has no observable input. **Fix:** extend `parseSource` to handle `physical_test.<id>` (or bare `<id>` when `source==="physical_test"`); resolve from `store.logs[date].skill_session.freestand_best_seconds` / `walk_best_metres_or_steps`.

### F-7 (SEV-1) No tier-promotion path — manual or automatic
`adapters/multi-dim.ts:22-39` is a Phase B stub. `capability_profile` never mutates post-intake. Intake wizard offers no re-run. `progression_rules.week_end_rule` is data-only. Direct contradiction of `manifest.json:65` and `programs-catalog.ts:245`. **Fix (short):** manual "advance tier" button on preview once a `retest_metrics.targets.target` is crossed. **Fix (long):** ship the Phase C multi-dim evaluator.

### F-8 (SEV-1) Hardcoded phase dates, no end-of-block surface
`handstand-walk.json:529-620` phases carry literal 2026-01-05 anchors. `status_note` promises a remap on activation; no remap code path was found for `generation_strategy === "multi_dimensional"` (contrast `IntakeClient.tsx:138-149`'s `phase_shift_days` for date-anchored programs). End-of-Week-8 has no "next block / retest to advance" prompt. **Fix:** wire phase-anchor remap at commit; add end-of-block CTA.

### F-4 (SEV-2) Dose/capacity gate silently disabled
`IntakeClient.tsx:86-96` reads `program.schedule_constraints.session_count_per_week_range`; handstand-walk.json omits it. A user picking 2 d/wk on a tier that authors 5 gets no warning. **Fix:** add `schedule_constraints.session_count_per_week_range: [4, 6]`.

### F-3 (SEV-2) "You'll re-test on Day 3" hint has no matching UI
`IntakeClient.tsx:439` telegraphs a Day-3 retest; nothing schedules or surfaces one. **Fix:** drop the copy, or schedule the retest off `intake.duration_days`.

### F-1 (SEV-2) Retest cadence quoted three ways
Landing: "every 4 weeks" (`programs-catalog.ts:245`). Manifest: "weekly + monthly" (`manifest.json:70`). JSON: weekly single-KPI + 4-weekly battery (`handstand-walk.json:602-624`). **Fix:** align once F-6 lands.

### F-2 (SEV-2) Landing preview shows 3 tier bins for a 4-tier program
`programs-catalog.ts:246-250` uses the Foundation/Progression/Push template. Tomás doesn't see what Freestand tier means on marketing. **Fix:** data-drive `outcomes` from `plan_tiers[].typical_outcome`.

### F-5 (SEV-2) `derived_state` never computed for skill sessions
`handstand-walk.json:1283-1285` declares the amber/red rule from `wrist_symptom_score` / `shoulder_symptom_score`. No component reads `daily_log_schema.skill_session.*`. The adaptive_engine_hooks proposal path (P15) never fires — engine never proposes reducing wrist-load drills on a 4/10 wrist day. **Fix:** ship the skill-flavour amber/red path (schema is already precise enough to implement).

### F-composeDropsFeedback (SEV-2) Composer replaces block items, dropping `hs_video_review`
`plan-generator.ts:263-270` replaces `block.items` entirely. Authored `role: "feedback"` items disappear on every composed skill session — the whole self-controlled-feedback affordance vanishes. **Fix:** re-append preserved `role === "feedback"` items from the authored block after compose.

### F-tierGaps (SEV-3) Tier conditions have gaps
E.g. `wall=10, free=3` fails all four tiers, defaults to A. **Fix:** rewrite as monotonic ladder on `walk_distance_max_metres` primary, `freestand_hold_max_seconds` tiebreak.

---

## 4 · Tomás's emotional narrative

Intake earns his trust — tier picked from real inputs, "how this was picked" line legible, science claims land on the marketing preview. He starts Week 1 believing he bought what the landing page promised: cues, feedback button, adaptive drill selection, weekly retests, tier gates.

By Week 2 no drill card shows a cue. He shrugs — maybe beta. He records himself anyway; he's a craftsman.

By Week 4 the retest metrics still read "Not yet trackable." His PRs live only in session-note text. He starts to suspect the app is a tracker with a story bolted on. He still trains — the block layout genuinely differs from a template app.

By Week 8 the same Tier C blocks generate. No "you finished, here's next" moment. He compares Week 8 note to Week 1 note (free 8→16s, first 4 steps) — real progress, unsurfaced. He wonders whether he needs Terav for Block 2 or whether a spreadsheet would do the same.

**Renewal probability:** ambivalent. Programming is real; surfacing is broken. Two of the three things this persona cares about most — external-focus cues and measurable progression — are shipped in data but invisible in UI. Fix F-P7, F-6, F-7 and Tomás becomes a promoter. Ship as-is and he leaves after Block 1 with the correct instinct that the app didn't do what it said.

---

## 5 · Load-bearing files

- `next-app/src/lib/engine/intake-tier.ts:305` — tier inference (works)
- `next-app/src/lib/engine/plan-generator.ts:83-128` — multi-dim composition entry
- `next-app/src/lib/engine/plan-generator.ts:223-271` — `composeSlotDrills` (drops feedback item)
- `next-app/src/lib/engine/adapters/multi-dim.ts:22-39` — Phase B stub (F-7)
- `next-app/src/lib/engine/retest-evaluator.ts:46-67` — `parseSource` (F-6)
- `next-app/src/components/workout/ExerciseDetailsSheet.tsx:99` — cue render path (F-P7)
- `next-app/src/components/workout/ExerciseCard.tsx` — no `item.note` renderer
- `next-app/src/components/progress/RetestMetricsPanel.tsx:33` — where "Not yet trackable" is emitted
- `next-app/src/app/programs/[slug]/intake/IntakeClient.tsx:86-228` — intake commit + tier seed
- `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx:82-92` — routing decision
- `next-app/public/data/programs/handstand-walk.json` — tiers, phases, retest_metrics, principles
- `next-app/public/data/exercises.json` — all 31 `hs_*` have `cues_external_focus`, not `cues`
- `landing/src/lib/programs-catalog.ts:220-260` — landing pitch, outcomes template
- `landing/src/components/sections/Programs.tsx:48-57` — home card
