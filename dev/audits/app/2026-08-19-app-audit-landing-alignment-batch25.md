# Terav — Landing → App integrity audit (post-Batch-25)

Auditor: landing-alignment
Personas: persona-recover, persona-strength, persona-erratic (core three), full harness has 14 personas
Landing source: `landing/src/i18n/dictionaries/en.ts` + `landing/src/components/sections/*.tsx` + `landing/src/app/evidence/page.tsx` + `landing/src/app/roadmap/page.tsx`
App evidence: `next-app/tests/e2e/artifacts/personas/*` (regenerated 2026-08-19 15:52–15:54)
Code trawled: `next-app/src/app/page.tsx`, `.../evidence/page.tsx`, `.../programs/[slug]/ProgramPreviewClient.tsx`, `.../programs/[slug]/intake/IntakeClient.tsx`, `.../components/workout/{ProposalCard,ProposalStack,ProposalStickyActionBar,MoveSheet,RetestLoggingSheet}.tsx`, `.../lib/engine/proposal-citations.ts`, `.../lib/proposals/{useProposalActions,select}.ts`

---

## 1. Overall verdict

**Delivers with two named caveats.**

The app honors every load-bearing promise the landing makes: 5 REFERENCED programs + 3 PROVISIONAL land exactly at "Five programs live. Three more in build." Every proposal captured in the three core personas carries a Source line (Rhea 2003, ACSM 2002, Halson 2014, Bouchard 1999, etc.). The confirm-first mechanic ships across every surface — Today proposals, MoveSheet, GraduationCard's 4-verb, RetestReminder. Coach is fully gone (`/coach` returns 404; landing never promised a coach surface, so no gap). Adaptivity is proven three ways: recover has 4 day_adjustments + 10 skipped with TMs at ~99 kg; strength has 0/0 with TMs at 115 kg; erratic has 17/15 with TMs at 110 kg — same schema, three divergent states.

The two caveats:

1. **Citation count mismatch.** Landing headline: "92 primary studies" (`hero.stat_studies_value`) and evidence-page title: "92 primary studies. Every session cites its research." The in-app `/evidence` route (P1-54) loads `citations.json` and displays **126 unique citations**. This isn't a broken promise — the app over-delivers — but a first-time skeptic clicking "See what every step cites →" from landing to app after signup sees a different number in the same voice. Either raise the landing to 126 or gate the app-side to the 92 sources cited in the landing group breakdown.
2. **Cites-strip pointer stale.** `ProgramPreviewClient.tsx:349` sends users to `/guide` for the full bibliography, but the walled-garden bibliography moved to `/evidence` in P1-54 and is wired into `HeaderQuickLinks`. Guide has terminology; Evidence has the list. Two places to look for what the landing framed as one promise.

Everything else — Accept/Ignore visible, red-flag banner without diagnosis, no streak UI, under-10-min intake, 5-live/3-in-build, per-log divergence, "not a full plan" honored in Extras + Today's "Nothing here changes the plan" — passes.

---

## 2. Promise-by-promise audit

| # | Landing claim (source: `en.ts` key) | Delivery test | Result | Evidence | Severity |
|---|------|--------------|--------|----------|----------|
| 1 | "Pick one thing you want stronger. Sharpen it every session." (`hero.h1_*`) | App presents ONE focus arc per active program, not a full week; Extras drains non-programmed work | pass | `persona-strength/text/01-today.txt` L33-35: "Log an extra session … Optional. Nothing here changes the plan." | — |
| 2 | "An engine, a skill, a lift, a stubborn joint" (`hero.sub`) | Catalog covers all four categories | pass | manifest.json + `/programs` — Endurance (engine), Skill (handstand, pullup, muscle-up), Strength (concurrent), Mobility (overhead), Rehab (hip-personal) | — |
| 3 | "Every change cites a study" (`hero.sub`) | Every proposal kind in `proposal-citations.ts` resolves to a citation OR is documented log-cited | pass with 1 exception | `next-app/src/lib/engine/proposal-citations.ts` — 6 of 7 kinds resolve; `missed_session` returns null by design (log-cited only). Captured proposals in persona-strength cite Rhea 2003; persona-recover cites ACSM 2002. | — |
| 4 | "Start free — pick my focus" (`hero.cta_primary`) | Signup → intake flow exists and works | pass | `next-app/src/app/(auth)/*` + IntakeClient.tsx present | — |
| 5 | "Browse programs — no signup" (`hero.browse_link`) | `/programs` renders without auth | pass | ProgramPreviewClient reveals for anonymous users; personas capture without impersonation gate | — |
| 6 | "5 programs" / "strength, skill, engine" (`hero.stat_programs_*`) | Catalog shows exactly 5 REFERENCED across domains | pass | persona-strength/text/06-programs.txt: 1 Strength (Concurrent) + 1 Skill (Handstand) + 2 Endurance (EB1, Rowing) + 1 Mobility (Overhead) = 5 REFERENCED. Note: label says "strength, skill, engine" — mobility (Overhead) is a fourth active domain not named on landing. | P2 (undersell) |
| 7 | "92 cited studies" (`hero.stat_studies_value`) | Underlying corpus has 92 sources | fail (over-delivers) | `next-app/public/data/citations.json` has 126 unique citation IDs. Landing `evidence/page.tsx` enumerates exactly 92. In-app `/evidence` displays 126. | P1 |
| 8 | "Your focus adapts every session" (`hero.stat_adapts_*`) | Three personas' final-stores diverge on same schema | pass | recover d/a=4, skipped=10, TMs~99; strength d/a=0, skipped=0, TMs~115; erratic d/a=17, skipped=15, TMs~110. Three archetypes → three states. | — |
| 9 | "Templates. Trainers. Then us." + "A plan sharpened every session" (`contrast.*`) | day_adjustments non-empty for at least the responder + the erratic user | pass | recover (4) + erratic (17) both non-empty; strength unchanged because no red/amber days triggered a soften — that's semantically correct, not a gap | — |
| 10 | "Intake. Session. Sharpen." (`how.title`) | Three-step flow exists in-app | pass | IntakeClient.tsx (§Screening → Skill → Consent → Physical → Result), Today session, log→propose cycle | — |
| 11 | "Under ten minutes of questions plus a physical check" (`how.step_01_body`) | Longest intake ≤20 questions with typical 20–30s per answer | pass | Engine Builder: 18 Q + 4 PT (worst case); Handstand: 12+5; Overhead: 8+3; Rowing: 9+0; Concurrent: 7+0. All within claim. | — |
| 12 | "A session, cited. Tomorrow's plan, written against your history" (`how.step_02_*`) | Today card visibly shows session + citation on top proposal | pass | persona-strength/text/01-today.txt L14-17 (Rhea 2003); persona-recover/text/01-today.txt L14-19 (ACSM 2002) | — |
| 13 | "You log a note. Engine proposes. You Accept or Ignore." (`how.step_03_body`) | Today has visible primary-Accept + secondary-Ignore verbs; verb text is proposal-specific | pass | `useProposalActions.ts:120-135` verb library: "Apply bump" / "Advance to {tier}" / "Apply {N}% lighter" / "Acknowledge" / "Log reading"; Ignore is universal. Captured: "APPLY BUMP" / "IGNORE" and "ADVANCE TO CYCLE 1 — FIRST REAL 5/3/1 FSL" / "IGNORE". | — |
| 14 | "See what every step cites →" (`how.evidence_link`) | Landing evidence page and in-app `/evidence` both resolve and enumerate | pass with pointer bug | Landing `/evidence` = 92 entries in three groups. App `/evidence` (P1-54) = 126 entries alphabetical. ProgramPreviewClient's Cites-strip footer still points to `/guide`, not `/evidence`. | P1 (pointer) |
| 15 | "Five programs live. Three more in build." (`programs.title`) | Roadmap lists 5 shipped + 3 in_build | pass | `landing/src/app/roadmap/page.tsx` items: shipped × 5 (EB1, Concurrent, Rowing 2K, Handstand, Overhead) + in_build × 3 (First Pull-Up, Muscle-Up, EB2). Catalog manifest matches (REFERENCED × 5 + PROVISIONAL × 3, hip-personal excluded). | — |
| 16 | Program-by-name pitches (`programs.*_pitch`) | Each named slug resolves to a live route with matching pitch | pass | `/programs/engine-builder`, `/concurrent-strength-maintenance`, `/rowing-2k-test-prep`, `/handstand-walk`, `/overhead-mobility` all resolve in ProgramPreviewClient | — |
| 17 | "Three more in build — see the roadmap →" (`programs.roadmap_link`) | Roadmap route exists on landing (in-app roadmap not required) | pass | `landing/src/app/roadmap/page.tsx` — 349 lines, item-level status pills | — |
| 18 | "Engine / Strength / Skill" domain labels (`programs.domain_*`) | Program cards on catalog use these labels or their engine equivalents | mixed | Catalog uses "Strength / Gymnastics & skill / Engine & endurance / Left/right & mobility" — matches Landing's simplified "Engine/Strength/Skill" for three of four, but adds Mobility as a fourth on-catalog domain. Not a broken promise; a landing understatement. | P2 |
| 19 | "92 primary studies. Every session cites its research." (`evidence.title`) | 100% of live proposals in captures carry a Source line | pass | 2/2 captured proposals (persona-strength, persona-recover) have `Source: ...`. persona-erratic Today shows an AMBER soften card without an inline Source line, but the underlying kind `day_adjustment_soften` is wired to Halson 2014 in `proposal-citations.ts` — a rendering audit for that card is warranted but the wiring is honest. | P1 (render check) |
| 20 | "Not a clinician. Red-flag patterns fire an escalate banner, not a diagnosis." (`wontdo.not_a_clinician_*`) | Red-flag copy exists; no diagnostic language; escalate action present | pass | persona-recover/text/10-report.txt: "Pain that wakes you at night — action: escalate to clinician"; persona-*/text/11-guide.txt: "RED FLAGS — STOP THE APP, CALL A CLINICIAN" and "Real red flags = clinician, not the app." Zero diagnostic strings. | — |
| 21 | "Not certain about you. We quote ranges, not one number." (`wontdo.not_certain_*`) | App outputs use range language for outcomes | pass | Program pitches (in-app catalog): "5-8% VO2max improvement", "5-10 bpm typical", "3-30 seconds by tier", "2K down 3-6%", "3-5 continuous walk steps". No point predictions on outcomes; concrete numbers only for logged actuals. | — |
| 22 | "Not a streak game. Skip a week. The plan sharpens against that too." (`wontdo.not_streak_*`) | No streak counter UI; skipping doesn't trigger negative-framed copy | pass | `grep -i streak` across all persona text/*: 0 hits. persona-erratic (45 logs, 15 skipped, 17 soften-adjustments) captures no "you broke a streak" copy; the AMBER card frames it as "Hold load" not "you fell off." | — |
| 23 | "Where the rigor comes from … built the engine against my own log" (`origin.*`) | App tone matches founder-honesty, no goofy voice | pass | Tone smoke across 14 personas: consistent — mono-caps eyebrows, terse prose, "engineering-choice, not cited" tag in `/evidence` matches origin honesty. | — |
| 24 | "One intake. Then your focus sharpens every session." (`beta.h2_*`) | Post-intake, Today shows a focus session; log→propose loop lives | pass | persona-strength d30 Today shows a proposal grounded in the log: "3 straight green days plus 'felt strong' in a recent note" | — |
| 25 | "Ten minutes of questions and a short physical check. Tomorrow your first focus session lands" (`beta.body`) | See #11 + Day-1 has a session | pass | Every persona's `01-today.txt` renders a scheduled session on day 1 of the simulated cycle | — |
| 26 | "Talk to the founder" (`beta.cta_secondary`) | Contact path exists | pass (out of persona scope) | Landing wires this in `BetaCTA.tsx`; app has no obligation to duplicate | — |

---

## 3. Systemic gaps (broken product promises)

### 3.1 Landing "92 studies" vs app "126 studies" — same voice, different number
- **Landing says (verbatim):** `hero.stat_studies_value` = "92"; landing `evidence/page.tsx:167-172`: "The primary sources / Terav is built on" with subtotals "28 Aerobic + 26 Concurrent + 37 Motor learning" = 91 (title displays 92; 92 individual `{ cite: ...}` entries in the file).
- **App shows:** `/evidence` header (in `next-app/src/app/evidence/page.tsx:60`): "{citations.length} cited studies — the full bibliography behind every program, proposal, and progression rule in the app." Loads 126 IDs from `citations.json`.
- **Evidence:** `python3 -c` count of `citations.json` = 126; landing regex count of `{ cite:` = 92.
- **Impact:** The credibility axis on landing is a specific number. A user who signs up expecting to see 92 studies enumerated and finds 126 will either think landing is stale (small trust dent) or think the app inflated its own count (bigger trust dent). Either way the numbers don't tie out.
- **Fix (two paths):**
  - **App-side:** Ship `/evidence` with a "92 primary sources + 34 supporting" split, or tag 34 entries as "supporting / non-primary" in `citations.json` so the primary count in the app matches landing.
  - **Landing-side:** Raise `hero.stat_studies_value` to "126" and add 34 more rows to `landing/src/app/evidence/page.tsx` groups.

### 3.2 Cites-strip on program-preview points to `/guide`, not `/evidence`
- **Landing implicit promise:** landing evidence link + hero "cites a study" and app evidence route (P1-54, wired into HeaderQuickLinks) create the expectation that the Cites strip drills into the full list.
- **App shows:** `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx:348-353`: "Full bibliography lives in Guide."
- **Evidence:** grep for `"Cites"` in ProgramPreviewClient; line 350 links `/guide`.
- **Impact:** Cognitive break — the app has a dedicated bibliography surface at `/evidence`, and the Cites strip should send readers there. Guide contains terminology + red-flag content, not the citation list.
- **Fix:** Change ProgramPreviewClient.tsx:350 `<Link href="/guide">` → `<Link href="/evidence">`. One-line.

### 3.3 Landing domain triplet omits Mobility
- **Landing says (verbatim):** `hero.stat_programs_label` = "strength, skill, engine".
- **App shows:** Catalog has a fourth active domain — "Left/right & mobility" — with 1 shipped program (Overhead Mobility, REFERENCED). Persona captures show it prominently.
- **Impact:** The landing sells three domains; the app delivers four. Undersell, not oversell — trust-safe but a marketing asset left on the floor. Overhead Mobility ships as REFERENCED, is featured on the roadmap as shipped, but doesn't get a name in the hero stat label.
- **Fix (two paths):**
  - **Landing:** `hero.stat_programs_label` = "strength, skill, engine, mobility" — matches four-category reality. Same fix in `programs.eyebrow` if needed.
  - **App:** Fold Overhead Mobility under Skill for catalog display (it's kinematic more than mobility). Feels wrong — the program pitch is explicitly "Kinematic base before load" and its purpose is different from a skill acquisition arc.

### 3.4 AMBER soften proposal doesn't render inline citation (persona-erratic)
- **Landing says:** "Every change cites a study."
- **App shows:** persona-erratic/text/01-today.txt L10-11: "AMBER · Hold load. A 4-5/10 or morning stiffness over 30 min. / Not feeling 100% · ×0.95 applied+1 more" — no inline `Source:` line.
- **Wiring:** `proposal-citations.ts:38` — `day_adjustment_soften: "halson_2014"`. The citation is wired but doesn't appear in the captured Today text.
- **Evidence:** grep `Source:` in persona-erratic/text/01-today.txt returns nothing; grep `Source:` in persona-strength/text/01-today.txt shows "Source: Rhea et al. 2003".
- **Impact:** Small — the softening is a safety response, not an ambition-facing change, so the user reads it as protection not aggression. But the landing promise is universal ("every change"), and a captured proposal without a rendered Source line is a factual miss.
- **Fix:** Verify `ProposalCard.tsx` renders `citationId` for `day_adjustment_soften`. If it currently only renders `evidence[]` and this proposal ships with an empty `evidence` array, patch selection in `next-app/src/lib/proposals/select.ts` (softenSelector) to attach the citation resolved from `citationIdForKind`. This was flagged as a Phase-1 fix on 2026-08-17 (comment in proposal-citations.ts) — verify it landed on the render path.

---

## 4. Cross-persona proof of the "adaptive" claim

For "your focus adapts every session" to be true, three personas' Today state on the same simulated calendar day must diverge. Comparison from `final-store.json`:

| Metric | persona-recover d30 | persona-strength d30 | persona-erratic d45 |
|--------|---------------------|-----------------------|----------------------|
| logs count | 30 | 30 | 45 |
| day_adjustments count | 4 | 0 | 17 |
| skipped count | 10 | 0 | 15 |
| tm_history entries | 1 | 1 | 0 |
| training_maxes back_squat | 99 | 115 | 110 |
| training_maxes block_pull | 126 | 147.5 | 140 |
| training_maxes front_squat | 76.5 | 90 | 85 |
| Today proposal | "Advance to Cycle 1" (readiness_after_layoff, ACSM 2002) | "Apply bump — +5/+2.5 kg" (tm_bump, Rhea 2003) | AMBER soften (day_adjustment_soften, Halson 2014) |

**Verdict:** Divergent. The three archetypes drove three genuinely different engine states — one graduates into real training, one adds load with a study citation, one softens to hold ground. Adaptivity is not theatre.

---

## 5. Suggested landing edits (if a claim is out of alignment)

- `hero.stat_studies_value` — currently `"92"`. App enumerates 126. Either raise to `"126"` and top up landing evidence page to match, or clarify in-app to say "92 primary + 34 supporting" (needs a schema tag in `citations.json`).
- `hero.stat_programs_label` — currently `"strength, skill, engine"`. Add `mobility` or restructure as `"four domains"` so Overhead Mobility isn't stranded.
- `evidence.title` — currently `"92 primary studies. Every session cites its research."` — should match whichever citation-count decision above lands.

App copy is not being asked to change here except the one pointer bug at #3.2.

---

## 6. Priorities

**P0 (broken promises — fix app OR fix landing):**
- None. No landing promise ships broken. The delivery is honest across the three personas.

**P1 (weakly delivered — sharpen either side):**
- **#3.1 Citation-count mismatch (92 vs 126).** Ship in the same batch: pick one canonical number, propagate.
- **#3.2 Cites-strip pointer to `/guide`.** One-line fix in ProgramPreviewClient.tsx. Ship next batch.
- **#3.4 AMBER soften card missing rendered Source line.** Verify Halson 2014 renders on `day_adjustment_soften` proposals in the ProposalCard render path.

**P2 (undersell / nice-to-have):**
- **#3.3 Landing hero stat_programs_label omits mobility.** Overhead Mobility is a shipping REFERENCED program; landing gets three domains, catalog gets four.
- Persona-erratic captures no Source line inline on the AMBER card — visual audit only; wiring is honest.

---

## 7. Batch-25 sanity check (what the user asked)

- **Does landing still claim anything about "AI coach"?** No. `grep -niE "\bAI\b|artificial intel|smart coach|virtual coach"` across `landing/src/i18n/dictionaries/` and `landing/src/components/sections/`: zero hits. The word "coach" appears twice — both times as a third-party trainer ("your box, your coach, your own week"), never as a Terav feature. Batch-25 (Coach killed) creates zero landing debt.
- **Does `/coach` route return 404 in-app?** Yes. persona-strength/text/03-coach.txt: "404 / This page could not be found." Persona harness still calls the route but the app correctly rejects.
- **"Every change cites a study" holds?** Yes with one render caveat (#3.4). The wiring in `proposal-citations.ts` covers 6/7 proposal kinds; `missed_session` is documented log-cited-only (a legitimate carve-out); captures show inline Sources on tm_bump and readiness_after_layoff. Verify AMBER card renders its Halson 2014 citation.
- **"You Accept or Ignore" holds?** Yes across three surfaces: (a) Today proposal — verb library at `useProposalActions.ts:120-135`, captured as "APPLY BUMP / IGNORE" and "ADVANCE TO CYCLE 1 / IGNORE"; (b) MoveSheet — confirm-first with sticky primary ("Move session" / "Confirm — stack the session"); (c) GraduationCard — 4-verb stack (Repeat this arc primary, Extend, Take a break, Pick your next focus) at `page.tsx:894-938`, all accept-first (no destructive Ignore because a completed arc doesn't reject); (d) RetestReminder — `Log retest →` primary + `Not this week` secondary at `page.tsx:1214-1226`.
- **"Under ten minutes" intake holds post-Batch-25?** Yes. Longest intake (Engine Builder: 18 Q + 4 PT) fits under 10 min at realistic answer rates. No intake bloat in the 2026-08-19 program set.
- **"5 programs" matches catalog?** Yes. Manifest = 5 REFERENCED (Engine Builder Block 1, Concurrent, Rowing 2K, Handstand Walk, Overhead Mobility) + 3 PROVISIONAL (First Strict Pull-Up, Muscle-Up, Engine Builder Block 2) + 1 personal (Anterior Hip Rebuild, excluded from public catalog per P1-55). Roadmap lines up.
- **Any new landing claims made obsolete by Batch 22–25?** No obsolete claims. Landing was scoped tightly enough that the coach kill leaves nothing dangling. The 92-vs-126 mismatch predates Batch 25 (it's a P1-54 side effect that shipped without a landing bump).
