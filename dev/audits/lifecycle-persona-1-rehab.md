# Lifecycle audit — Persona 1: Kalev (rehab)

**Persona.** Kalev, 38, ex-CrossFit, anterior-hip (groin) irritation since a disc-golf incident 18 mo ago. Back-squat 140/bench 100/DL 180 pre-injury, none re-tested since flare. Runs 5km/24min. 3–4 sessions/wk, home gym (no sled, no wall balls). Wants strength ceiling back without provoking the hip. Reads fine print.

---

## 1. Promise ledger (from landing)

From `landing/src/app/page.tsx` and children:

- **P1.** "The training plan with an edge." Hero H1 — `Hero.tsx:53`.
- **P2.** "Your coach writes it every two weeks. Terav sharpens it every session." Hero sub — `en.ts:9`.
- **P3.** "5 programs in three domains." Hero stat — `en.ts:13-14`.
- **P4.** "100+ cited studies." Hero stat — `en.ts:15-16`.
- **P5.** "Every session adapts to your log." Hero stat — `en.ts:17-18`.
- **P6.** "Browse a program first — no signup needed." Hero — `en.ts:12`.
- **P7.** "A session, cited." Step 02 — `en.ts:41`.
- **P8.** "You log a note. Engine proposes. You Accept or Ignore." Step 03 — `en.ts:43` (matches "confirm-first" arch memory).
- **P9.** "Every session cites its research." Evidence claim — `en.ts:62`.
- **P10.** "Not a clinician. Red-flag patterns fire an escalate banner, not a diagnosis." WontDo — `en.ts:67-69`.
- **P11.** "Not certain about you." (quotes ranges) — `en.ts:70-72`.
- **P12.** "Not a streak game. Skip a week. The plan sharpens against that too." — `en.ts:73-74`.
- **P13.** "Built at a CrossFit box in Tartu, out of a multi-year rehab log for one lifter with a hip that wouldn't quit." Origin — `en.ts:81`.
- **P14.** "Read the 34-week case study." Origin CTA → `/case-study/anterior-hip` — `OriginStory.tsx:16`.
- **P15.** Case study: symptom-gated progression, provocative-position ban, notes-signal detection, specialist-facing report — `case-study/anterior-hip/page.tsx:117-149`.
- **P16.** Case study explicitly says "**not a program in the catalog**" — `case-study/anterior-hip/page.tsx:67, 154-165`.
- **P17.** "Sign up on the app, complete the intake, and your first session is on Today within two minutes." Program preview — `programs/[slug]/page.tsx:138-141`.
- **P18.** "Nine questions, one profile." — `en.ts:38`.
- **P19.** "Two more in build — see the roadmap." — `en.ts:55`.
- **P20.** Hero CTA "Get started" → `${APP_URL}/sign-in` (not sign-up) — `Hero.tsx:70`.

---

## 2. Journey walkthrough (as Kalev)

### Phase 0 — Landing (Sat evening, 21:15)
Kalev clicks the Origin block. The case study reads like his life — labral question mark, bilateral FADIR positive. He scrolls to the "not a catalog program" box, reads it twice. He's confused: the Hero just told him "the plan that built Terav" is available, but the very page it links to says it isn't. He hits back and looks at Programs — five tiles. No rehab tile. He clicks the "◆ Rehab & recovery" filter mentally, but no such filter exists on the landing.

### Phase 1 — Signup (Sun 07:40)
He clicks Hero "Get started". Lands on `/sign-in`, not `/sign-up` (`Hero.tsx:70`). Small paper-cut: he tries to sign up here, gets confused, clicks the sign-up link, then confronts two required checkboxes (terms + health-data). Both make sense to him. He signs up as `kalev@…`. Email confirmation flow works.

### Phase 2 — Empty Today (Sun 07:48)
Post-confirm he lands on `/`. Because `activeProgramSlug` is null and `hydrated=true`, `NoActiveProgram` renders (`app/page.tsx:326-348`): "Pick a program → Browse programs". No context of what to pick. He clicks.

### Phase 3 — Program discovery (Sun 07:49)
Catalog shows: Rehab & recovery (empty — anterior-hip is hidden by `p.personal` filter at `programs/page.tsx:39`), Strength (CSM), Skill (Handstand, Overhead), Endurance (Engine Builder, Rowing). Because Rehab has 0 items and `CATEGORY_META.rehab` was tolerantly rendered, he actually sees NO Rehab section at all (only groups with entries render, `programs/page.tsx:107-146`). **He has no path to any hip program.** The landing case study told him the plan exists; the app filters it out.

He tries the URL `/programs/anterior-hip-rebuild` (from the case study URL guess). It loads — because `generateStaticParams` at `programs/[slug]/page.tsx:9-20` builds params for ALL manifest entries, personal or not. He sees the "personal" badge and the slate italic disclaimer (`ProgramPreviewClient.tsx:176-182`). He decides against it.

Instead, he goes with **Engine Builder** — his engine feels shot, and he doesn't want to load the hip yet.

### Phase 4 — Intake (Sun 08:05)
Engine Builder intake fires (`ProgramPreviewClient.tsx:91` — `routeThroughIntake=true`). 18 questions (`engine-builder.json`). Kalev's answers:

- days_per_week: **4**
- goal_modality: **run**
- can_sustain_20min_easy: **yes**
- recent_z1_max_minutes: **45**
- joint_issues: **"anterior hip — mild groin tightness after long sits, occasional click on lowering leg raises"**
- joint_issue_severity: **mild**
- flaring_joint_tendon: **no** (it's chronic-tight, not flaring — this is a judgement call)
- strength_sessions_per_week: **2**
- resting_hr_known: **yes**, baseline_resting_hr: **58**
- All medical gates: no.
- consent_symptom_data: ticked.

**No hip-specific safety gate exists** (`engine-builder.json` gates list at `intake.safety_gates`). Because Kalev honestly answers "no" to flaring-joint (his hip is not currently flaring), no gate fires. The intake continues.

Tier inferred: probably Progression. He accepts, program starts. Trace written (`IntakeClient.tsx:215-225`).

### Phase 5 — First session (Sun 08:18)
Today renders. Header shows phase name. `HeroStateCard` prompts a morning check. `SignalsStrip` renders (`SignalsStrip.tsx`) with `DayAdjustmentProposal` slot — nothing yet because no logs. Blocks shown: probably a 30-min Z2 row + a strength session (his 2 strength/wk answer). Cards are informative but **contain zero citations** (P7, P9 violated). ExerciseCard shows sets/reps/notes; no "cites Helgerud 2007" microcopy.

### Phase 6 — Four weeks of realistic use

- **Mon 2026-08-17, Session 1.** Z2 row 40 min. Kalev logs 22:45, HR avg 138. Morning check: hip 2, groin tightness 2, life-load 4. Note: "hip felt sticky by end of day, sat 6h at desk."
- **Wed 08-19, Session 2.** Back squat 5×5 @ 90 kg RPE 6, RDL 3×8 @ 100 kg RPE 7. Morning check: hip 2, groin 3. Note: "click on 2nd hanging leg raise warm-up, ignored it and moved on." Kalev notices no proposal fires despite the pain note — `note-signals.ts` PAIN regex hits "click"? **No** — `click` is not in the PAIN pattern (`note-signals.ts:30`). The `EASY`/`STIFF`/`PAIN` patterns miss "click", "sticky", "provocative-position" language entirely. Signal ignored.
- **Sat 08-22, Session 3.** Norwegian 4×4 not yet scheduled (week 4). Just Z2 55 min. HR drifted +8 bpm. Note: "hip fine, calves cooked, felt heavy". `daySignals` catches "heavy" → STIFF → fatigue=elevated. `DayAdjustmentProposal` may fire tomorrow. Good — this works.
- **Week 2.** Kalev keeps logging. On Mon 08-24 he types "groin twinged on the RDL, backed off". PAIN pattern hits `twinge`. Proposal fires: ×0.85 multiplier for TOMORROW's strength. Kalev Accepts. Behaviour matches P8.
- **Week 3.** Kalev misses two sessions (kid stomach bug). Comes back Mon 09-07. Landing promise P12 said "skip a week, the plan sharpens against that too" — but `activePhaseFor` just returns whichever phase covers today (`schedule.ts:60`). Nothing shifts. The plan lands him on whatever week the phase was authored for. Kalev opens `/history` and sees his gap; the app doesn't offer a "restart week" option.
- **Week 4 retest.** `retest-evaluator.ts` reads `retest_metrics` from the program JSON. Engine Builder has this (verified above). At retest time — does the app SIGNAL him to test? Nothing in `page.tsx` or `SignalsStrip` renders a "retest due" banner tied to the metric cadence. The metric card is on Progress; he has to look for it.

### Phase 7 — Retest & phase advance
Kalev navigates to `/progress`, sees the retest metric card. Logs his 3-morning resting HR average (54, down from 58) and a submax HR: 132 vs 138 baseline. Trends positive. But: **there is no cycle-end proposal for Engine Builder.** `adapt.ts:evaluateCycleEnd` (`adapt.ts:48-60`) requires a phase with `runs_cycle_end_eval` OR a hardcoded hip-legacy phase ID. Engine Builder's phases don't set that flag. So the TM-proposal / "green cycle" narrative on the landing (P8) doesn't fire for Engine Builder — only for the hip program. Kalev doesn't get an "Accept the phase-up" moment.

### Phase 8 — End of plan (week 8)
Phase 4 ends 8 weeks in. `activePhaseFor` (`schedule.ts:80`) returns the last phase indefinitely once past `phase.ends` (Engine Builder's final phase has no `ends`, so this holds). Today just keeps rendering week-8 sessions. **There is no "you finished" screen, no graduation prompt, no "start block 2 / next program" nudge**. Landing implied a 3-block, ~6-month engine transformation; the app doesn't hand off to block 2 because block 2 doesn't exist yet.

### Phase 9 — Specialist report (his primary hope)
P15 says every phase-end produces a "print-ready symptom + load cross-reference the athlete brings to the next physio". `/report` exists (`report/page.tsx`), computes over a range, and shows overview + trends. But it's not tied to phase-end nor auto-generated; the landing case-study language oversells it as a specialist-facing artifact. Kalev opens it, sees graphs, sees no doctor-friendly export or PDF.

---

## 3. Findings

Severity: **P0** landing promise directly not delivered / medical crossing / broken flow · **P1** must-fix friction · **P2** polish.

| # | Sev | Promise vs. reality | Evidence | Fix |
|---|-----|--------------------|----------|-----|
| F1 | **P0** | P13/P14/P16 conflict. Origin block markets the case study as the origin arc and links it; case-study page says "not a catalog program". Kalev arrived expecting a hip-rebuild path and hit a dead-end. | `landing/src/components/sections/OriginStory.tsx:16`, `landing/src/app/case-study/anterior-hip/page.tsx:67,154-165` | Either ship a general anterior-hip rebuild program in the catalog OR reword Origin to "the arc that inspired the engine; your plan will be authored fresh for you" and drop the "34-week case study" CTA from the hero of the origin block. |
| F2 | **P0** | P9 / P7. "Every session cites its research." No citations render in any workout card. | `next-app/src/components/workout/ExerciseCard.tsx` (grep: no `cite/source/citation`), `landing/src/i18n/dictionaries/en.ts:41,62` | Add a "Cites →" microlink per block that opens a modal listing the block's evidence (already present in `landing/src/lib/programs-catalog.ts` per-program). Or soften the landing copy: "each program cites its research" (per-program, not per-session). |
| F3 | **P0** | P8. "You log a note. Engine proposes." Kalev's characteristic complaint ("click on lowering") is not matched by `note-signals.ts`. The rehab-specific vocabulary the case study advertises (P15 "click on lowering, ache post-run") is not in the regex list. | `next-app/src/lib/engine/note-signals.ts:27-31` | Add `\b(click\w*|clunk|catch\w*|pop|snap\w*|giving.?way|sticky)\b` as a `PROVOCATION` category feeding `signals.pain=true`, plus Estonian equivalents. |
| F4 | **P0** | P20. Hero CTA "Get started" lands on `/sign-in`. New users must find the sign-up link inside. | `landing/src/components/sections/Hero.tsx:70`, `landing/src/components/sections/BetaCTA.tsx:22` | Change href to `/sign-up`; sign-in page already links back for returning users. |
| F5 | **P1** | Rehab category renders empty and then hides — no visual signal that Rehab is a promised domain "coming". P19 promises "two more in build" but the roadmap link is buried on the Programs section footer. | `next-app/src/app/programs/page.tsx:107-146` (empty group not rendered) | Always render category headers; show "Nothing here yet — anterior-hip rebuild is authored but personal. See the roadmap for the generalised version." |
| F6 | **P1** | P17. "First session on Today within two minutes." Engine Builder intake has 18 questions. Realistic completion: 6-10 min. Landing under-promises time cost. | `next-app/public/data/programs/engine-builder.json` intake (18 questions), `landing/src/app/programs/[slug]/page.tsx:141` | Correct copy to "under 10 minutes" OR trim intake to a MVP question set with progressive disclosure. |
| F7 | **P1** | P12. "Skip a week. The plan sharpens against that too." App does NOT reschedule the phase around missed sessions; `activePhaseFor` returns whichever phase covers today's absolute date. | `next-app/src/lib/engine/schedule.ts:60-81` | Add a `phase_shift_days` update when the user logs a resume after ≥7 days gap (already the field exists for test-prep — reuse). |
| F8 | **P1** | P8 / cycle-end. Engine Builder phases lack `runs_cycle_end_eval=true` (and aren't in the legacy hip whitelist), so the "TM proposals / Accept" moment never fires for Engine Builder users — only for the hip program. Landing generalises the proposal loop to every user. | `next-app/src/lib/engine/adapt.ts:9-60`, `next-app/public/data/programs/engine-builder.json` | Extend adapt to a per-metric "phase-end proposal" that fires for aerobic gains (submax-HR delta), not just TM bumps. |
| F9 | **P1** | End-of-plan cliff. Once past the last phase's `ends`, Today keeps rendering the last week forever. No graduation screen. | `next-app/src/lib/engine/schedule.ts:80` | Detect `dateISO > lastPhase.ends` and render a "You finished [program]. Retest one more time, then choose the next block." card with links to catalog + report. |
| F10 | **P1** | Retest reminder. Landing implies Terav will tell you *when* to retest ("engine sharpens against your log"). No banner fires when a `retest_metrics.cadence_weeks` window opens. | `next-app/src/lib/engine/retest-evaluator.ts` (no scheduling caller found), grep for "retest" on Today | Add a SignalsStrip banner when `today ≥ last_test_date + cadence_weeks*7`. |
| F11 | **P1** | P10 borderline. The escalate banner exists but only fires on `red` state derived from morning-check scores (`SignalsStrip.tsx:194-207`). Provocation-language in notes (Kalev's actual complaint mode) doesn't lift him to red because his numeric scores stay 2-3. He can log "sharp groin pain on RDL" and get a load-cut proposal, but no escalation-to-clinician banner. | `next-app/src/components/workout/SignalsStrip.tsx:194`, `note-signals.ts:30` | Add a rule: 3+ consecutive days with PAIN match on same body-region tag → escalation banner regardless of numeric state. |
| F12 | **P2** | P18. "Nine questions, one profile." Engine Builder ships 18 questions. This is a copy/floor mismatch that a skeptical reader will notice. | `en.ts:38` vs `next-app/public/data/programs/engine-builder.json` intake | Rewrite as "under a dozen questions" or "seven to twenty depending on the program." |
| F13 | **P2** | Specialist-facing report. Case study P15 sells a "print-ready" specialist-friendly report. The `/report` UI is web-only, dense, no clinician-oriented framing (no findings/goals/loading history summary for a doctor). | `next-app/src/app/report/page.tsx` | Add a `?print=1` variant with a clinician-friendly header, symptom vs load timeline, and a red-flag summary. |
| F14 | **P2** | P3. "5 programs live." Manifest lists 6 (`anterior-hip-rebuild` counted). Landing hides it. Fine as a promise, but the on-brand tension between "5 live" and the case study feels loose. | `landing/src/i18n/dictionaries/en.ts:13`, `manifest.json:3-165` | Keep at 5 public + label anterior-hip as "case-study only" everywhere. |
| F15 | **P2** | P6. "Browse a program first — no signup needed." Works for public programs, but the case-study URL a user might guess (`/programs/anterior-hip-rebuild`) resolves to a startable preview with only a "personal" tag. If Kalev taps Start he sees an ack modal (`ProgramPreviewClient.tsx:385-423`) which is good, but the flow to "no you can't start this" isn't crisp. | `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx:122-134` | Consider `notFound()` for personal programs unless user has a super-admin flag or is Margus. |

---

## 4. Emotional / UX narrative — what would Kalev feel?

**At signup:** Skeptical→curious. He liked that health-data consent is a separate checkbox — it signals the team has thought about GDPR. The `/sign-in` landing when he clicked "Get started" was a small trust-dent. He'd survive it.

**At program pick:** Confused, then resigned. The origin story sold him a rehab-arc app; the catalog offered him an aerobic engine block instead. He'd start Engine Builder anyway because he trusted the reasoning ("you're not detrained, you're deconditioned aerobically"). But the thing that brought him — the anterior-hip story — vanished into a case study that literally says "not for you."

**Week 3:** Neutral. Sessions are clean, the DayAdjustmentProposal fired once on his "twinge" note and asked before doing anything. That matches what the landing promised. He'd probably say "this app is honest" here.

**Week 4-5:** First trust-dent. He typed "click on lowering, hip felt sticky, ache post-desk" — the exact language the case study advertised as a detected signal. Nothing happened. He starts wondering if the "engine" is real or if it's just a pattern-matcher on the word "pain."

**Week 8, end of plan:** Frustration. Today just keeps repeating the last week. No "you're done, here's the block-2 pitch." He hits `/report`, sees his HR trend, thinks "this is useful but the case study promised me a specialist-friendly print-out — this is a dashboard, not a report."

**Would he refer a friend?** To another *aerobic* trainee, cautiously yes — "it's honest, it doesn't lie about tapers, it has a proposal loop that asks before mutating stuff." To another *rehab* athlete like him — no. He'd say "great case study, but the app doesn't have the rehab track yet. Wait a version."

**Highest-leverage single fix:** F1 + F3. Ship a general-purpose anterior-hip rebuild program (even v0.9) AND expand note-signal vocabulary to include the provocation language the case study markets. Together they close the biggest promise-vs-reality gap in the flow.
