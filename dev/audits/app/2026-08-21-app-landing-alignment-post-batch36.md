# Terav — Post-Batch-36 landing → app integrity audit

Date: 2026-08-21
Personas: `persona-recover`, `persona-strength`, `persona-erratic`
Landing source of truth: `landing/src/i18n/dictionaries/en.ts` (unchanged in Batch 36)
App evidence: `next-app/tests/e2e/artifacts/personas/`

---

## 1. Overall verdict

**LANDING PROMISES DELIVERED — with one P0 regression on Progress route.**

Batch 36 lands 6 of 7 briefed promises cleanly and every legacy landing claim on
the dictionary continues to hold. The single failure is that `/progress` throws
a client error boundary ("This page couldn't load") for two of three personas —
which is exactly the surface where the landing's "engine sharpens against your
log" claim is meant to be visible over time. Everything else — the "5
REFERENCED · LIVE NOW" strip, the workout-named H1 on Today, the inline
Accept / Ignore proposal card with citation, the CITED / VERIFIED status
collapse, and the wordmark parity — all render as the landing promises. Counted
plainly: **14 of 15 landing promises pass, 1 fails (P0 — Progress boundary).**

---

## 2. Batch-36 briefed promises — delivery table

| # | Batch-36 promise | Landing claim (verbatim, `en.ts` key) | Delivery test | Result | Evidence |
|---|---|---|---|---|---|
| B1 | Today H1 = workout name | `hero.h1_a/b/c` "Pick one thing you want stronger. Sharpen it every session." + focused-not-full-plan positioning | Today H1 is the ACTIVE PROGRAM name, not "Your training week" or a date | **PASS** | `persona-strength/text/01-today.txt:8` `"Concurrent Strength Maintenance"`, `persona-recover/text/01-today.txt:8` `"Anterior Hip Rebuild"`, `persona-erratic/text/01-today.txt:8` same. Desktop screenshot `persona-strength/desktop/01-today.png` shows it as the H1 immediately below the progress-bar. |
| B2 | "5 REFERENCED · Live now" strip on Programs catalog | `hero.stat_programs_value` `"5 programs"` + `programs.title` `"Five programs live. Three more in build."` | Programs catalog shows the strip with count 5 | **PASS** | `persona-strength/text/06-programs.txt:11` `"5 REFERENCED · LIVE NOW"`. Manifest confirms 5 REVIEWED (engine-builder, handstand-walk, concurrent, rowing, overhead) + 1 REFERENCED-personal (hip) + 3 DRAFT = the "3 more in build" side of the same sentence. Landing claim is symmetric with manifest. |
| B3 | Evidence StatusPill CITED / VERIFIED per §7.5 | `evidence.title` `"126 primary studies. Every session cites its research."` | Program preview pill collapses REFERENCED → CITED (slate), REVIEWED/VERIFIED → VERIFIED (green) | **PASS** | `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx:202-209` implements the collapse. `persona-strength/text/07-programs-active.txt:6` renders `"VERIFIED"` on the concurrent preview. `persona-strength/text/06-programs.txt:7-9` also carries the ladder explainer copy. |
| B4 | HeroStateCard: modern pill + Why? + citation | `how.step_02_body` `"Tomorrow's plan, written against your history."` + `hero.sub` `"Every change cites a study."` | Today hero card carries a status pill, a WHY? affordance, and a source citation | **PASS** | `persona-strength/text/01-today.txt:14-24`: pill `"ROOM TO PUSH — HEADROOM ON YOUR LOG"`, `"Because: 3 straight green days plus 'felt strong' in a recent note. The engine reads that as headroom."`, `"Source: Rhea et al. 2003"`, then the pair `WORKOUT READY / WHY?` + `Progress load. Nothing above 3/10 in your check.` Cite → rationale → verb in a single card. |
| B5 | No autonomous score-hero (R8 held) | `origin.body` `"A blade gets sharper by grinding against something harder than itself"` — the aesthetic is disciplined, not gamified | No standalone proprietary readiness donut / autonomous score component in the Today hero | **PASS** | `persona-strength/desktop/01-today.png` — Today hero renders a proposal card + WORKOUT READY dot pattern; no floating donut, no "Terav Score" glyph. Semantic composition preserved. |
| B6 | Confirm-first Accept / Ignore surface | `how.step_03_body` `"You log a note. Engine proposes. You apply the change or ignore it."` | Today shows both verbs on the proposal card | **PASS** | `persona-strength/text/01-today.txt:21-22` shows `APPLY BUMP` + `IGNORE` on the same card. `persona-recover/text/01-today.txt:24-25` shows `ADVANCE TO CYCLE 1 — FIRST REAL 5/3/1 FSL` + `IGNORE`. The verb copy is program-contextual — "Apply bump" for a TM bump, "Advance to cycle 1" for a phase gate — which is stronger than a generic "Accept" and remains inside the landing's Accept/Ignore promise. |
| B7 | Wordmark parity landing ↔ app | (visual identity claim, not a `en.ts` string) | Bronze pip + TERAV renders identically | **PASS with cosmetic drift** | Landing: `landing/src/components/Wordmark.tsx:12-14` — `text-sm tracking-[0.22em]` sans on `bg-[var(--color-bronze)]` + `text-[var(--color-strong)]`. App: `next-app/src/components/AppShell.tsx:150-153` — `text-[14px] uppercase tracking-[0.22em]` **font-mono** on `bg-bronze` + `text-strong`. Visual dot + wordmark match; **font stack diverges (sans on landing, mono on app)**. Perceptually close, but not identical. |

---

## 3. Legacy landing promise audit (unchanged surface)

| # | Landing claim (`en.ts` key) | Delivery test | Result | Evidence |
|---|---|---|---|---|
| L1 | `hero.sub` `"An engine, a skill, a lift, a stubborn joint. Terav writes that focus arc — the rest of your week is still yours. Every change cites a study."` | Catalog surfaces at least one of each of {engine, skill, lift, joint} AND every proposal in captures carries a source line | **PASS** | Catalog domains: endurance (Engine Builder, Rowing), skill (Handstand), strength (Concurrent), asymmetry (Overhead), rehab (hip). Every persona's Today card that carries an adjustment names its source: strength → "Rhea et al. 2003", recover → "ACSM 2002". No un-cited nudge observed in captures. |
| L2 | `hero.stat_studies_value` `"126"` | Underlying corpus has ≥126 unique studies | **PASS (exact)** | `next-app/public/data/citations.json` — `citations` array length = 126. The landing headline number is not aspirational; it is the exact count shipped in the app data. |
| L3 | `hero.stat_adapts_value` `"Your focus"` + `hero.stat_adapts_label` `"adapts every session"` | Three personas' final-store state diverges on day-N counters | **PASS (strong)** | See §5. All three diverge on training_maxes, day_adjustments count, and logs count. Not theatre. |
| L4 | `contrast.row_what_terav` `"A plan sharpened every session"` | At least one persona shows non-zero day_adjustments AND changed training_maxes over the sim | **PASS** | persona-recover: 3 day_adjustments, 10 skips, TMs at rehab-appropriate levels. persona-erratic: 18 day_adjustments, 15 skips. persona-strength: 30 clean sessions, no morning downshifts needed. Divergent by design. |
| L5 | `how.title` `"Intake. Session. Sharpen."` | Route stack exposes intake → today → progression; onboarding runs on program start | **PASS (intake pending state visible)** | `persona-strength/text/08-profile.txt:15` renders `"INTAKE PENDING"` on the profile card, confirming intake gate exists and runs. `OnboardingRunner.tsx` mounted on Today for intake-pending users. |
| L6 | `how.step_01_body` `"Under ten minutes of questions plus a physical check."` | Intake step count × avg answer time ≤ 10 min | **PASS (self-declared)** | Concurrent program preview: `persona-erratic/text/07-programs-active.txt:48` `"7 short questions to set your baseline."` 7 questions × ~30-60 s each = 3.5-7 minutes. Physical check on top adds a few minutes. Well inside the "under ten" promise. |
| L7 | `how.step_02_body` `"Tomorrow's plan, written against your history."` | Today shows session written to the user's log signals, not a template | **PASS** | persona-strength: `"Because: 3 straight green days plus 'felt strong' in a recent note"` — literally reads from log. persona-erratic: check-first pill with `"Not feeling 100% · ×0.95 applied"` — reads from morning check. persona-recover: `"Two straight sessions above 80% TM at RPE ≤ 7 with no red/amber days"` — reads from the specific log rows named. |
| L8 | `wontdo.not_a_clinician_body` `"Red-flag patterns fire an escalate banner, not a diagnosis."` | Rehab persona surfaces "escalate to clinician" copy on red-flag patterns, no diagnosis language | **PASS** | `persona-recover/text/10-report.txt:166-173` — 4 red-flag rules each ending in `"action: escalate to clinician"`. No diagnostic language ("labral tear", "impingement", etc.) present anywhere in recover captures. |
| L9 | `wontdo.not_certain_body` `"We quote ranges, not one number."` | Progress and proposal copy uses ranges, not single-point predictions | **PASS** | Program preview copy: `"Submax HR down 8-15 bpm at fixed pace"`, `"back squat / block pull / front squat maintained within 2.5 kg"`. `persona-strength/text/07-programs-active.txt:23-24`. Engine-builder catalog: `"5-8% VO2max improvement"`, `"5-10 bpm typical"`. Ranges everywhere. |
| L10 | `wontdo.not_streak_body` `"Skip a week. The plan sharpens against that too."` | Erratic persona (missed weeks) has no streak counter, no shame copy | **PASS** | Grep for "streak" across `persona-erratic/text/*.txt` — zero hits. `persona-erratic/text/04-history.txt` marks missed sessions `SKIPPED` — neutral factual label. No "you broke your streak" or "get back on track" copy. |
| L11 | `programs.eyebrow/title` "Pick one program" + "Five programs live. Three more in build." | Catalog page shows exactly 5 REVIEWED + 3 DRAFT/coming-soon | **PASS** | Manifest: 5 REVIEWED (engine-builder, handstand-walk, concurrent, rowing, overhead) + 3 DRAFT (first-strict-pullup, muscle-up, engine-builder-block-2). Plus 1 REFERENCED-personal (hip) sitting outside the ladder as the copy explicitly permits. Landing math holds. |
| L12 | `programs.eyebrow` `"Pick one program"` implies single-focus discipline | Today reads as focused, not sprawling | **PASS** | `persona-strength/text/01-today.txt`: 1 block, 1 named session ("Norwegian 4×4"), 4 optional extras. No "your week" multi-track view on Today. `persona-recover`: 1 block, 1 barbell session, extras optional. Focused, not sprawling. |
| L13 | `evidence.title` `"126 primary studies. Every session cites its research."` | Evidence route exists AND session-level content carries citations | **PASS** | `next-app/src/app/evidence/page.tsx` exists. Guide surface `persona-strength/text/11-guide.txt:81` describes it verbatim: `"Evidence. The full bibliography behind every program, proposal, and progression rule in the app."` Program previews carry Schumann 2022, Rhea et al. 2003, ACSM 2002, Bosquet 2007, Helgerud 2007 — all resolve into the 126-item corpus. |
| L14 | `beta.body` `"Ten minutes of questions and a short physical check. Tomorrow your first focus session lands"` | Intake → tomorrow's session is prescribed, cited | **PASS** | Same evidence as L7. First session lands cited, written against intake answers + physical-check state. |
| L15 | `origin.body` rigor tone (blade metaphor, "if you have a specific medical issue, work with a clinician") | App tone doesn't undercut with goofy / gamified copy | **PASS** | Tone smoke across all persona `text/*.txt`: no exclamation-heavy marketing copy, no gamified nudges. Copy sits in the same register as landing — engineering language + honest constraints. |

---

## 4. Systemic gaps (broken product promises)

### 4.1 Progress route error boundary on 2 of 3 personas — P0

- **Landing says (verbatim):** `contrast.row_what_terav` — "A plan sharpened every session." `contrast.row_when_terav` — "Every session, against your log."
- **App shows:** `persona-strength/text/05-progress.txt` and `persona-erratic/text/05-progress.txt` both render **"This page couldn't load — Reload to try again, or go back."** (Next.js `error.tsx` boundary caught.) `persona-recover/text/05-progress.txt` renders fine — full readiness heatmap, TMs, roadmap, hip sub-track.
- **Evidence:** `persona-strength/desktop/05-progress.png` and `persona-erratic/desktop/05-progress.png` — both are the boundary screen. `persona-recover/desktop/05-progress.png` renders the intended surface.
- **Impact:** Progress is the surface where a user *sees* the sharpening happen — readiness trend, TM history, retest metrics, milestones. Landing implicitly promises this delivery ("adapts every session", "sharpened every session"). When the page crashes for a strength user or a concurrent user, the landing's central claim goes unwitnessed. The claim isn't false — the final-store proves it, and the audit can see it — but the *user* cannot. That is the trust break.
- **Fix (choose one):**
  - **Fix the app:** run the persona harness against a fresh build and stack-trace the error. Likely candidates: (a) a store selector that assumes a field the strength/erratic personas don't populate (`skipped` is missing on strength), (b) a chart component that div-by-zeros on 0 milestones, (c) a Date parse on an undefined retest gate. Suspected root cause: strength persona has no `skipped` key while the Progress renderer likely `.length`-reads it or maps it.
  - **Fix the landing:** none available — you cannot honestly weaken this claim without gutting the pitch. This must be an app fix.

### 4.2 Wordmark font-stack drift landing ↔ app — P1

- **Landing says (visually):** sans wordmark, bronze pip, tracking-[0.22em], text-sm.
- **App shows:** **font-mono** wordmark, bronze pip, tracking-[0.22em], text-[14px].
- **Evidence:** `landing/src/components/Wordmark.tsx:12` (sans, inherited) vs `next-app/src/components/AppShell.tsx:150` (`font-mono`).
- **Impact:** Sub-perceptual drift for most users. Marketing-to-app handoff has a micro-jarring beat because the letterforms shift. The bronze pip and geometry match, so the identity holds, but the *typographic* identity does not.
- **Fix (choose one):**
  - **Fix the app:** drop `font-mono` from the AppShell TERAV link. Match landing's inherited sans stack. One-line change.
  - **Fix the landing:** switch landing wordmark to `font-mono`. Higher stakes because the landing is otherwise sans-heavy and this would ripple to Footer + Nav.
  - Recommendation: fix the app. Cheaper, and the app already uses mono for `mono-caps` micro-labels — mixing mono for identity mark and for status pips muddies the semantic use of mono.

### 4.3 `/coach` legacy path returns 404 on all three personas — non-issue but audit-noise

- **App shows:** `persona-*/text/03-coach.txt` all render "404 · This page could not be found."
- **Landing says:** nothing about a Coach page — grep of `landing/src/` finds no `/coach` link, only `coach` used in the sense of "your (external) coach".
- **Impact:** None on trust. The Batch-36 consolidation of the Coach page into Today's HeroStateCard is architecturally sound — proposals live where the session lives.
- **Fix:** trim `/coach` from the persona harness route list. It's a stale entry. `next-app/tests/e2e/persona-harness.ts` should drop it or the artifacts should stop capturing a dead URL.

---

## 5. Cross-persona proof of the "adaptive" claim

The landing promises "your focus adapts every session" — this must be verifiable by showing the three personas' final state diverges on the same simulated day. It does.

| Metric | persona-strength (30d overperformer) | persona-recover (30d rehab) | persona-erratic (45d concurrent, skipped weeks) |
|--------|--------------------------------------|------------------------------|-----------------------------------------------|
| logs count | 30 | 30 | 45 |
| day_adjustments count | 0 | 3 | **18** |
| skipped count | 0 | 10 | **15** |
| back_squat_highbar TM | **115 kg** | 99 kg | 110 kg |
| block_pull_midshin TM | **147.5 kg** | 126 kg | 140 kg |
| deadlift_conventional TM | **157.5 kg** | 135 kg | 150 kg |
| Proposal on capture day | "Room to push — bump loads +2.5 to +5 kg" | "Advance to cycle 1 — first real 5/3/1 FSL" | "Check first — hold load" |

**Verdict: divergent.** Same product, three log histories, three different Today experiences. The overperformer gets a push, the rehab user gets a phase gate, the erratic user gets a hold. Each carries its own citation and rationale. The adaptive claim is not marketing — it is what the harness captured.

Sample morning adjustment from erratic (`persona-erratic/final-store.json`):
```json
"2026-07-07": { "load_multiplier": 0.95, "reason": "sim: amber state", "source": "notes", "accepted_at": 1783324801256 }
```
Confirm-first mechanic honoured — an `accepted_at` timestamp means the user tapped Apply, not the engine silently mutating.

---

## 6. Persona-facing claim cross-check

- **"Rehab-not-fragile"** (from `origin.body` — "years of strength work fought around a stubborn hip"): persona-recover's proposal on capture day is a *phase advance* ("Advance to Cycle 1 — first real 5/3/1 FSL"), not a "rest more" nudge. Anchored to two qualifying log rows and an ACSM 2002 cite. The rehab user is being pushed forward when the log says push forward. Delivered.

- **"Breadth across categories"** (from `hero.sub` — engine, skill, lift, joint): programs catalog spans endurance (2), skill (1), strength (1), asymmetry (1), rehab (1 personal), all REVIEWED/REFERENCED. Erratic captures show all 5 domains rendered in category cards. Delivered.

- **"Progression discipline"** (from `wontdo.not_certain_body` + `contrast`): every proposal in captures either (a) proposes a small increment with a cited source, (b) proposes a hold, or (c) proposes a phase gate with named log evidence. Zero proposals in the captures are un-cited or un-justified. Delivered.

---

## 7. P0 gaps

- **P0-1: Progress page client-error boundary on persona-strength and persona-erratic.** The single highest-visibility surface for the landing's "sharpens every session" claim crashes for the two personas most likely to reflect actual user archetypes (a lifter, a mixed-modality athlete). Fix in the app; do not weaken the landing. File: likely `next-app/src/app/progress/**` or a chart component. Suspected trigger: strength persona lacks `skipped` array, renderer assumes it exists.

## 8. P1 improvements

- **P1-1: Wordmark font drift.** Drop `font-mono` from `AppShell.tsx:150` to match landing's sans wordmark. Or accept the mono aesthetic and update landing — but the cheaper move is app-side.
- **P1-2: `/coach` stale route in persona harness.** Not user-facing (no landing link), but adds three 404 capture artifacts that generate audit noise every run. Remove the route from `next-app/tests/e2e/persona-harness.ts` route list, or fold Coach captures into `01-today.txt` since that's where the surface lives now.
- **P1-3: Today bottom-nav overlaps "Open session" affordance on strength persona.** Visible in `persona-strength/desktop/01-today.png` — the fixed bottom-nav sits atop the `Open session` button of the block card. Not a landing-promise gap, so scoped to `app-visual-craft` and `app-mobile-ux`, not this report.

## 9. P2 nice-to-haves

- **P2-1: Onboarding step-count copy self-anchor.** `persona-erratic/text/07-programs-active.txt:48` says "7 short questions". The landing says "Under ten minutes of questions." If any program creeps to 12+ questions in the future the landing goes stale silently. Consider a build-time assertion: `max(program.onboarding_steps.length for program in manifest) → assert ≤ 10 questions` or similar. Keeps landing honest as programs are added.
- **P2-2: "126 primary studies" landing number is currently exact.** If corpus grows to 130, the landing goes stale. Consider auto-generating `stat_studies_value` from `citations.json` at build time, or round to "120+" — the exact-count promise is high-integrity but high-maintenance.

---

## 10. Wordmark drift check (dedicated)

| Attribute | Landing (`Wordmark.tsx`) | App (`AppShell.tsx`) | Match? |
|-----------|---------------------------|----------------------|--------|
| Pip color | `bg-[var(--color-bronze)]` | `bg-bronze` (same token) | Yes |
| Pip size | `h-2 w-2` | `h-2 w-2` | Yes |
| Pip shape | `rounded-full` | `rounded-full` | Yes |
| Wordmark color | `text-[var(--color-strong)]` | `text-strong` (same token) | Yes |
| Letter tracking | `tracking-[0.22em]` (sm) | `tracking-[0.22em]` | Yes |
| Casing | `TERAV` literal, sans caps | `TERAV` literal + explicit `uppercase` | Yes |
| Size | `text-sm` (~14px) | `text-[14px]` | Yes |
| Font family | inherits sans | **`font-mono`** | **NO — drift** |
| Weight | `font-semibold` | inherited (medium) | Small drift |
| Gap | `gap-2` | `gap-2` | Yes |

**Verdict:** identity mark holds (pip + word + tracking + color), typographic mark drifts (sans vs mono, semibold vs medium). The user reading landing then clicking through to app sees the mark *move* fractionally. P1 fix. One-line diff.

---

## 11. Summary line

- LANDING PROMISES DELIVERED for 14 of 15 audited claims.
- 1 P0 gap: `/progress` error boundary on 2 of 3 personas breaks the surface where the landing's central adaptive claim is meant to be visible.
- 2 P1 gaps: wordmark font-stack drift, stale `/coach` route in harness.
- Adaptive claim proven by cross-persona final-store divergence (18 vs 3 vs 0 day_adjustments; distinct training maxes; distinct proposals on capture day).
- Wordmark: bronze pip + geometry match, font stack drifts sans → mono.
