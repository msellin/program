# Master open-task list — Terav app

**Synth date:** 2026-08-19  ·  **Sources reconciled:** every 2026-08-17 / 08-18 / 08-19 audit + `dev/active/session-audit-2026-08-17/backlog.md` + `dev/active/post-audit-p0s/tasks.md` + `dev/active/product-concerns-2026-08-17/roadmap.md` + persona harness manifests.
**Batch 16 filter applied:** items about Profile identity chip, footer collapse + Danger zone, Week padding + Programs pill off header, or 32px H1s were shipped and removed from the open list — see the closed-items appendix at the bottom.
**Harness state:** persona artifacts refreshed 2026-08-19 15:02-15:12 (post-Batch-22, 15/15 personas passed against app.terav.fit). Cross-references reflect current UI.

---

## How to use this list

These are **IDEAS, not action items**. The engine + rehab-first positioning overrides "cleaner is better," so Margus picks what to ship. Batches ship in 6-12h chunks — don't try to close the whole list in one sitting, and respect the "no UI churn between audits" rule (each shipped batch should stand on its own before the next audit re-scans). Real bugs go first because they're broken code the audits happened to surface; everything else is prioritized by user-visible ROI. Sizing (S/M/L/XL) is per item.

**Counts by bucket (post-Cut-D audit, 2026-08-21):**

- **Bugs:** 0 open
- **P0:** 0 open
- **P1:** 0 open
- **P2:** 0 open — the last carry (P2-32 icon-stroke discipline) remains `[ ]` deferred as low-ROI codemod, tracked below
- **Features on-deck:** 0 open — F10 fully closed via S6 Option C (personal programs outside the ladder)
- **Strategic (founder decision):** 5 items — S3, S4, QA-1, BETA-1, BETA-2
- **Rejected:** 12 items — do not ship

Total open surface: **1 deferred polish (P2-32) + 5 strategic + 12 rejected = 18 line items** (down from 110 pre-Batch-17). **Every audit finding through 2026-08-21 shipped, deferred with rationale, or explicitly rejected.** Open decisions: S3 (billing timing), S4 (F5 correlation trigger), QA-1 (shipping-log drift verification protocol), BETA-1 (Programs in the bottom nav), BETA-2 (public program browsing). Cut C · Record redesign (5→4 tabs) shipped Batch 39; Cut D · Check redesign (4-option tap-scale + live verdict) shipped Batch 40; Week 3/4 IA refactor (Today→Day, Week→Plan, kill DateNav, route renames) shipped Batches 41-42.

---

## Status marker convention (multi-agent contract)

This file is the single source of truth across chat sessions and agents. Every task line is a Markdown checkbox — mutate it as work moves through the lifecycle:

- `- [ ]` **OPEN** — nobody has started. Default state.
- `- [~]` **IN PROGRESS** — someone is actively working on it. Append ` — @agent-name YYYY-MM-DD` so the next agent sees who claimed it. Example: `- [~] **P0-1** Reposition Coach... — @claude 2026-08-19`.
- `- [x]` **DONE** — shipped. Append ` — done YYYY-MM-DD, {commit-sha or "Batch N"}` and MOVE the line to the closed-items appendix at the bottom. Never leave a `[x]` in the open sections — it clutters priority scanning.
- `- [!]` **BLOCKED** — cannot proceed. Append ` — blocked: {why}`. Common reasons: awaiting founder decision (see Section F), needs data (N users × 90 days), or an upstream dependency.

**Protocol before starting work:**
1. Read the open sections (A → F) to check nothing you plan to touch is already `[~]` claimed.
2. Flip the item to `[~]` with your handle + date BEFORE editing code.
3. Ship, commit, then flip to `[x]` and move to the closed-items appendix in the same push.

**Protocol for new findings:**
- Add to the correct section with a fresh ID and `- [ ]`. Do NOT renumber existing IDs — they are stable references used in commit messages, PR descriptions, and future audits.
- If an item becomes obsolete (code refactored, finding no longer applies), strike in place with `~~- [ ] **P1-N** ...~~ obsolete: {why}` and move to the appendix.

Keep the convention terse — the four markers cover every state. Don't invent new ones.

---

## Section A — Real bugs (fix regardless)

*Sourced from the post-Batch-25 audit round (2026-08-19, 6 agents), + the founder-observations audit round (2026-08-19, 8 agents against O1-O17).*

- [x] **BUG-4** — first-strict-pullup tier engine bug shipped 2026-08-19 (`82d62f0`). Added program to both proxy tables in `intake-tier.ts` + conservative-defaults entry + 5 regression tests. 14/14 intake-tier tests pass.
- [x] **BUG-5** — DateNav Home reserved-slot pattern shipped 2026-08-19 (`82d62f0`). Applied Week's `invisible pointer-events-none` treatment; forward-arrow no longer jumps on day change.
- [x] **BUG-6** — Progress Export chip tap-target bumped `min-h-[36px]` → `min-h-[44px] inline-flex items-center` shipped 2026-08-19 (`82d62f0`). Apple compliant.
- [x] **BUG-7** — HERITAGE mid-block source_ref sibling-inheritance shipped 2026-08-19 (`8e00848`). Mid-block retest metrics inherit source/source_ref/direction/unit/aggregation/window_days from their end-of-block sibling; test file metric_ids updated to match program JSONs. 158→160 tests pass. Files: `src/lib/engine/retest-evaluator.ts`, `src/lib/engine/non-responder-classifier.test.ts`.
- [x] **BUG-8** — Block state now flips to `done` when log evidence attaches, shipped 2026-08-19 (`37acc1b`). Two hooks: migrator matches exercise-key prefix + run-modality; `useStore.markDone`/`updateSet` propagate via new `flipBlockDoneIfEligible` helper. 2 regression tests added. Files: `src/lib/migrations/legacy-to-blocks.ts`, `src/lib/useStore.ts`.
- [x] **BUG-9** — ALREADY RESOLVED before S5 pass. Graduation gate at `page.tsx:256` (Batch 5, `05e101b`) suppresses ProposalStack + SignalsStrip + RetestReminder when `isPastProgramEnd()` is true. Verified: 0 "RETEST" leaks across persona-engine, persona-engine-fast, persona-graduate today artifacts. S5 REV-1 was reporting stale delta-2 finding.
- [x] **BUG-10** — ALREADY RESOLVED before S5 pass. Verified persona-rowing + persona-rowing-erratic today artifacts render only GraduationCard (no YourPlanCard/reveal-card/phase-header/retest-window collision). S5 REV-5 was reporting stale delta finding.
- [x] **BUG-11** — Closed 2026-09-01 as already-resolved bookkeeping; no code shipped for it. Split into two halves and both were settled elsewhere: (a) the csm-amber-week body branch was a **phantom** — already rendered at `SignalsStrip.tsx:371-388` before the S5 pass; (b) the amber-week schedule swap was promoted to **F12**, which is itself closed (the filter was already live at `plan-generator.ts:82-103`; only the advisory copy was stale, refreshed in `60c85ff`). Left `[~]` since 2026-08-20 with nobody working on it — the marker outlived the work, which is the exact failure the status-marker convention exists to prevent.
- [x] **BUG-12** — tm_bump Accept re-fires bug shipped 2026-08-22. Accept called `setTM(exId, newTM)` but never dismissed the proposal, so `evaluateOverperformer` re-ran on the *bumped* TM (still 3-green + felt-strong) and re-issued `tm_bump` with `currentTM = <just-bumped>` → tap-storm could stack +5 kg × 10 = +50 kg in one gesture. Founder reported 50 kg overshoot. Mirrored the Ignore path — Accept now `dismissProposal(date, `tm-bump:${exId}`)` per lift, so `selectTMBump` filters remaining for the rest of the day. Files: `next-app/src/lib/proposals/useProposalActions.ts:58-72`. Size: XS
- [x] **BUG-13** — Plan rest-day can't log any session shipped 2026-08-22. On rest days, `WeekDayActions` returned null so there was zero path to record an off-plan CrossFit class or evening run — user had to skip via other means. Rest days now render a single "Log a session →" verb (today + past only; future rest days stay silent) linking to `/session/[primarySlug]?date=<dateISO>`, which renders `RestDayCard` + `RunSlotCard` for ad-hoc logging. Files: `next-app/src/app/plan/page.tsx:718-737`. Size: XS
- [x] **BUG-14** — Sound settings toggle was a placeholder shipped 2026-08-22. Settings/Sound comment literally said "no Audio() calls exist yet." Added `lib/sound.ts` (Web Audio API — synthesized tones, no assets, offline-safe): `playConfirm()` (short 880 Hz blip) + `playTimerComplete()` (E5-A5-E6 3-note ding). Wired into `ConfirmSheet` confirm button, `useProposalActions` Accept path, `RestTimer` on-hit effect, and preview-on-toggle-ON in Settings. Both functions gated by `readSoundPref()` — flip the Settings toggle and audio actually stops. Files: `next-app/src/lib/sound.ts`, `next-app/src/components/ConfirmSheet.tsx`, `next-app/src/lib/proposals/useProposalActions.ts`, `next-app/src/components/workout/RestTimer.tsx`, `next-app/src/app/settings/page.tsx`. Size: S

- [x] **PROG-1** — `phase_gates` was implemented all along and the schema was eating its input, fixed 2026-09-02. `isPhaseSkipped` (`engine/schedule.ts:150-168`) reads `program.phase_gates`, resolves the user's intake answer and returns true — but it reads through an `as unknown as` cast, and `programSchema` had no such field, so `programSchema.parse` (`data-loader.ts:46`) stripped it before the implementation ever saw it. `gates?.length` was always undefined; the function always returned false. The 2026-08-18 audit reported it as "dead, nothing reads it" — half right, and the wrong half is the one that mattered: the cast made the mismatch invisible to the compiler, so nothing flagged it for three weeks. Fix is the missing schema field. Tests: `phase-gates.test.ts`, 3 cases, including one asserting the gate's `phase_id` and `question_id` resolve — a gate naming a phase that does not exist would parse fine and silently never fire, the same failure one level along.

- [x] **BUG-32** — The AMRAP rep grid stopped at 9, shipped 2026-09-02. An AMRAP is unbounded by
  definition — that is what the "+" in 5+/3+/1+ means — but the grid rendered exactly nine tiles and
  nothing else. Founder hit 11 on a 125 kg block pull and had to record it as free text: the set logged
  as `125kg x9` with the real count only in a note, so TM inference read 9 reps and under-estimated the
  1RM by roughly 8 kg (Epley: 162.5 vs 170.8). Third defect in this branch after BUG-28's locked weight —
  the AMRAP path keeps being built as though it were the fixed-rep path. Grid keeps its nine fast tiles
  and gains a "10+" tile that opens a stepper. Files: `SetView.tsx`. Size: XS

- [ ] **QA-3** — No component tests exist. `@testing-library/react` and `happy-dom` are both installed
  and there is not a single `.test.tsx` in `src/`. So every UI affordance — the AMRAP grid ceiling, the
  per-side timer reset, the "Adjusted for you" notice — ships guarded only by the persona harness, which
  is a 30-minute run against production and cannot exercise a specific interaction cheaply. BUG-28,
  BUG-30 and BUG-32 were all in this gap. Size: M (harness setup, then the affordances above).

- [ ] **PROG-2** — `overhead-mobility.capability_domains[]` is dead at program level. It declares six
  domains that duplicate what the drill library already carries per-drill (`plan-generator` reads
  `drill.capability_domains`, never the program's). Found by the dead-key test on its first run,
  2026-09-02 — nobody knew it was there. Almost certainly just delete. Size: XS

- [x] **AUDIT-PROGRAMS-3** — The three CITED programs promoted to REVIEWED, 2026-09-02. Five dimensions
  audited (readiness inputs, citations, screen coherence, intake gating, tier phase resolution) against
  regenerated persona artifacts. Four P0s, all shared-mechanism rather than authoring errors: the
  readiness gate read one person's hip body map for every program; the intake promised deferrals nothing
  implemented; `phase_gates` was implemented while the schema stripped its input; and the harness itself
  had been capturing graduation screens because `started_at` was never persisted. Docs:
  `dev/audits/programs/2026-09-02-*`. Guards added: dead-key test, symptom-region resolution,
  intake-exclusion firing conditions, tier-phase resolution, plus three harness assertions.

- [ ] **EVID-1** — **Get a real specialist audit for the catalog.** Every program's `reviewed_by.name`
  is "Terav specialist audit agent" — Terav's own review process. As of 2026-09-01 the public copy no
  longer claims otherwise (the ladder note now states plainly that no outside clinician has signed off
  any program and none is field-proven), so this is no longer an integrity defect — it is the bar the
  copy openly says Terav intends to clear. **What it needs:** a named physiotherapist, coach or sport
  scientist per domain, who re-checks citations against current literature and records what they
  checked and when. Domains needed: endurance (engine-builder, engine-builder-block-2,
  rowing-2k-test-prep), gymnastics/skill (handstand-walk, first-strict-pullup, muscle-up), concurrent
  (concurrent-strength-maintenance), mobility (overhead-mobility). Founder already has an orthopaedist
  and a physiatrist — those cover hip/mobility, not endurance or gymnastics. On completion: set
  `reviewed_by` to the named human, and add a third tier to the ladder rather than overwriting the
  existing internal-audit tier — the agent pass is real work and should keep its own name. Size: L
  (mostly outreach, not code). Blocks nothing; unlocks the strongest trust claim the product can make.

- [ ] **EVID-2** — **Nothing counts completed arcs.** `graduated_at` is written per user into their own
  `user_states` row, and the only admin endpoint (`functions/api/admin/keywords.ts`) aggregates note
  tokens. There is no way to answer "how many users finished first-strict-pullup" without hand-written
  SQL against the jsonb column. The ≥5-completions criterion is therefore unmeasurable in-product.
  Not urgent — no program can approach five completions until the friends beta has run a full 8-week
  arc — but it must exist before any program is promoted on field evidence, or the promotion is a
  guess. Size: S (one admin endpoint, or a saved SQL view). See [[EVID-1]].

- [ ] **AUDIT-1** — **The legal pages describe a system that no longer exists, and nothing checks them.** Scope is an audit, not a one-line fix; raised 2026-09-01 while correcting the Sentry region claim.
  - **Partially addressed 2026-09-01** (the health-data-critical line only, ahead of the friends beta): the sub-processor list named **Cloudflare KV** for training and symptom data — the live path has been Supabase `user_states` since the 2026-08-18 migration. Corrected, and the Sentry retention row was split in two: automatic error events (email stripped by `beforeSend`) vs. bug reports the user sends from the feedback widget, which now collects a name, an email and an optional unmasked screenshot — so the old blanket "no email attached" became false the moment the widget went live. Date bumped to 2026-09-01. **The rest of the audit is still open**, including: the "changes will be announced by email" promise, for which no email mechanism exists; whether "Supabase (Frankfurt, EU)" is accurate given the founder's EU-Hetzner remark; and stale KV comments in `StoreHydrator.tsx` / `IntakeClient.tsx` that mislead the next reader into the same error. **Do not guess the hosting answer — a sub-processor list is a legal disclosure.**
  - **Second pass 2026-09-01** — code audit of where user data actually goes, prompted by the Hetzner question. **Settled: Supabase Postgres `user_states` is the only server-side store for user data** (`PostgresAdapter` is the sole implementation of the persistence interface post-migration), and there are **zero Hetzner references** anywhere in client, Functions or config — that VPS runs oddsintel and the CrossFit rankings, not Terav. Three gaps fixed: (a) **GPX/FIT** said "parsed and discarded within 24 h", implying upload — `gpx.ts` and `fit.ts` contain no network calls at all, so the file never leaves the device; the claim understated the protection. (b) **The on-device copy was undisclosed** — `storage.ts` caches the entire store including symptom scores in localStorage, and "Where it lives" listed only remote processors. (c) **The YouTube embed** contradicted "no cross-site trackers": opening a technique demo connects to Google. Implementation is careful (`youtube-nocookie`, strict referrer policy, click-to-load inside a modal) so it was a disclosure gap, not a design one. **Still open: the Supabase REGION** — which processor is provable from code, which datacentre is not; needs Project Settings → General. Also still open: the "announced by email" promise (no email library in either project; Resend under consideration).
  - **Region resolved 2026-09-01** — founder checked Supabase Project Settings: **`eu-west-1`, i.e. AWS Ireland, not Frankfurt.** The page had claimed Frankfurt since it was written. Still EU, so the substance of the transfer disclosure held, but the named location was wrong — and this is precisely why it was not guessed: "Frankfurt" was plausible, conventional for an EU Supabase project, and false. Corrected to "AWS eu-west-1 — Ireland, EU". The Hetzner VPS is confirmed unrelated (oddsintel + CrossFit rankings). **AUDIT-1's remaining open item is now only the "announced by email" promise** — no email library exists in either project; Resend key minted and awaiting a decision on whether to build the send Function or reword the promise.
      **Confirmed stale today:** `legal/privacy` "Where it lives" lists *"Training logs and symptom data: **Cloudflare KV** (EU replication)"*. The live persistence path is `PostgresAdapter` → Supabase `user_states` (`src/lib/persistence/adapter.ts:10`, `postgres-adapter.ts:51`). The only KV references left in `src/` are stale comments in `StoreHydrator.tsx` and `IntakeClient.tsx`. So the sub-processor list names a store the app stopped using.
      **Unresolved and needs founder knowledge:** the founder states the data sits on an **EU Hetzner** server, while the page says *"Supabase (Frankfurt, EU)"*. Both may be true (Supabase region backing) or the entry may be wrong. **Do not guess this** — a sub-processor list is a legal disclosure and the answer is not derivable from the codebase.
      **Already fixed 2026-09-01, do not redo:** the Sentry entry (was "EU region", is US), and the blanket *"Health data stays inside the EU"* guarantee (removed — the section now describes per-provider locations instead of promising a region).
      **The actual task:** walk every claim in `legal/privacy`, `legal/terms` and `legal/disclaimer` against the shipped system — sub-processors, storage locations, retention, deletion behaviour, the Art. 9 consent basis, and the "announced by email" promise on sub-processor changes (there is no email mechanism). Then decide whether any of it can be verified automatically the way `data-integrity.test.ts` now guards the catalog, or whether it needs a recurring human review with a date stamp.
      **Why it matters now:** these pages are linked from Profile and the landing, a beta is about to go to real users in the EU, and today proved the pattern — the "Extras tab", the landing catalog, the Sentry region and the founder quote were all true-when-written and never re-checked. Legal copy has the same decay and a worse failure mode. Size: M

---

## Section B — P0 (highest ROI)

- [x] **P0-8** — Palette collision fix shipped 2026-08-19 (`6092ec1`). 15 chip sites across 13 files migrated to neutral-outlined pill + 6px colored dot. HeritageClusterChip + NoteSignalHint intentionally kept semantic-tinted (loud diagnostic on Progress where no category axis competes). Laterality spine deferred to F9 DashboardBlock pass.
- [x] **P0-9** — PROVISIONAL → DRAFT rename + catalog filter shipped 2026-08-19 (`38d7822`) as part of Batch 31. 3 programs (engine-builder-block-2, first-strict-pullup, muscle-up) renamed. Filter extends `personal:true` predicate. Legacy PROVISIONAL alias kept in schema for back-compat. StatusChip returns null for DRAFT/PROVISIONAL defensively.
- [x] **P0-10** — Three-branch tier disclosure shipped 2026-08-19 (`4d48df8`). Branch A (complete signals), Branch B (tests skipped — conservative-default with override guidance), Branch C (self-report only) render at `IntakeClient.tsx:539-544`. New `summarizeAnswers` helper prefers physical-test vars with units. Also added schema types for `reviewed_by`/`status_history`/`review_evidence` to `programSchema` (were only on manifest entry).

---

## Section C — P1 (ship this month)

### Accessibility (post-Batch-25 round + founder-obs round)

- [x] **P1-70** — Today H1 → date shipped 2026-08-19 (`1d43ece`). "Today" → "Wednesday 19 Aug" via toLocaleDateString en-GB + offset caption ("Today"/"Tomorrow"/"Yesterday"/"+N days"). Week/Progress/History H1s kept (they're not day-scoped).
- [x] **P1-71** — Done-card chevron swap shipped 2026-08-19 (`b68812f`) as part of F9 first push. When done, chevron → MessageSquare so affordance matches Notes-only expanded body.

### Visual craft (post-Batch-25 round + founder-obs round)

- [x] **P1-72** — Wordmark aligned to landing pattern shipped 2026-08-19 (`c1bd940`) as part of F8 first push. Bronze pip left + text-strong wordmark; ReadinessDot stays as second slot on right.
- [x] **P1-73** — Exercise-name `line-clamp-2 leading-snug text-[15px]` shipped 2026-08-19 (`b68812f`) as part of F9 first push. Preview text also line-clamp-2.
- [x] **P1-74** — Program-preview full reorder shipped 2026-08-19 (`7fd3198`). Full order: title → chips → Who → What → What it takes → Adapts → How we prove. Adapts moved from header down to between Commitment and Proves-it-works. New "What it takes" DashboardBlock lifts meta row out of header. Section eyebrow counters now "Section N of 4".
- [x] **P1-75** — Programs catalog category treatment via DashboardBlock shipped 2026-08-19 (`b68812f`) as part of F9 first push. Each category = DashboardBlock with accent stripe. Inter-section `space-y-5` → `space-y-8`. ProgramCard dropped its own border (block owns container). O8 palette collision resolved on this surface as a side effect.

### Landing→app (post-Batch-25 round + founder-obs round)

- [x] **P1-76** — Landing verb drift shipped 2026-08-19 (`82d62f0`). `how.step_03_body` + `beta.body` in `landing/src/i18n/dictionaries/en.ts` now say "apply the change or ignore it" / "apply each change — or ignore it" to match the app's context-specific APPLY verbs.

### Copy clarity (post-Batch-25 round + founder-obs round)

- [x] **P1-77** — Ladder disclosure sheet shipped 2026-08-19 (`2ce7032`). Legend words on /programs are now tap-targets that open InfoSheet with full REFERENCED/REVIEWED/VERIFIED definitions. Content from copy-clarity audit's Ginny Redish framework. Personal-programs-outside-ladder note included (matches S6 shipped).
- [x] **P1-79** — Exercise name/variant schema split shipped 2026-08-19 (`5069610`). 42 exercises migrated. Schema added `variant?: string`. ExerciseCard renders variant as 12 px muted subtitle under the 15 px name. ExerciseDetailsSheet also updated. Coach proposal formatters use `.name` directly — automatically read the shorter base name now.

### Motion + perf (post-Batch-25 round + founder-obs round)

- [x] **P1-80** — Rhythm stabilization shipped 2026-08-19 (`1d43ece`). All 4 tab routes use `space-y-6 pt-4` (Today + Progress bumped from `space-y-5`). Week + History already matched.

### Mobile UX (post-Batch-25 round + founder-obs round)

- [x] **P1-81** — Programs dropped from top-nav shipped 2026-08-19 (`c1bd940`) as part of F8 first push. Also killed Morning-check icon + ⋮ overflow menu. Header now only has TERAV wordmark + Settings icon. Extras/Report/Evidence relocated to Profile More.
- [x] **P1-82** — Wizard chip strip `grid-cols-2` shipped 2026-08-19 (`d6a8061`). Yes/No fills row width; longer strips still wrap.
- [x] **P1-83** — Progress rail sizing shipped 2026-08-19 (`d6a8061`). Bar 3→5 px; counter 10→13 px; program-name eyebrow 10→12 px. Kept "Step N of M" form.

---

## Section D — P2 (defensible polish, post-Batch-25 round + founder-obs round)

- [x] **P2-31** — Closed as duplicate of P1-73 (shipped `b68812f`). Exercise-name `truncate` → `line-clamp-2 leading-snug text-[15px]` already resolves the a11y nudge; no separate a11y-side fix needed.
- [ ] **P2-32** — N4 icon-stroke discipline. Terav has 3 sizes (14/16/18) and 2 stroke weights (2, 1.75) in circulation. Shared `<Icon>` wrapper or ESLint rule. **Deferred** — the codemod touches ~40 call sites and is high-touch / low-user-visible. Track for a future polish batch. Source: `2026-08-19-founder-obs-visual-craft.md` §N4. Size: M
- [x] **P2-33** — Label parity shipped 2026-08-19. `manifest.json:302` category label "Left/right & mobility" → "Mobility" + description tightened. Description reorder puts mobility use case first.
- [x] **P2-34** — Recharts axis review — already resolved before founder-obs round. `SymptomLoadChart.tsx:86-91` uses themed palette tokens (grid #24272f, axisLine #3A3F4A, axisTick #D6D9DE) — no defaults leak. Was fixed in P2-13 earlier.
- [x] **P2-35** — Hover-on-touch sticky-state sweep shipped 2026-08-20 (`6d97ec5`). AppShell settings icon + DateNav prev/next chevrons now have focus + active twins. ExerciseCard + Programs list cards + Profile More rows already had `active:bg-line-soft/50` from prior audit rounds. HeaderQuickLinks was deleted in F8 first push, so no sweep needed there.

---

## Section E — Features on-deck

From roadmap sync + product-concerns-2026-08-17 + design-lead brief `2026-08-19-founder-obs-design-lead.md`.

- [x] **F8 · IA restructure — COMPLETE.** Multi-push:
  - `c1bd940` Header collapse + Settings v1 + Events kill + Extras/Report/Evidence relocated
  - `a2bc820` ReadinessDot kill (P1-78)
  - `adea483` + `7e6885d` /session/[slug] route + TodayView extraction + navigation affordances
  - **`ba1a563` Today becomes dashboard, /session hosts inline workout UI.** Today renders compact DashboardBlock summary per program (block count · exercise count · phase readout · "Open session →" CTA); /session/[slug] renders full inline BlockSection loop. Dashboard/session split is REAL. Phase readout paragraph suppressed on Today (block lede carries it).

  Plan doc `dev/active/F8-second-plan.md` no longer active — objectives met via the incremental multi-push approach. Persona harness regeneration would be nice but not required (routes are additive; existing personas still exercise Today's dashboard path since they don't call slugOverride).
- [x] **F9 · Batch 30 — DashboardBlock primitive** — COMPLETE (audited 2026-08-21). First push shipped 2026-08-19 (`b68812f`). Primitive live at `src/components/DashboardBlock.tsx`. All deferred follow-ups now shipped: Today dashboard uses DashboardBlock in the multi-track group renders (`TodaySession.tsx:591,643`), session route inherits via TodaySession, program-preview restructure (P1-74) shipped Batch 21 (`7fd3198` — Who → What → What it takes → Adapts → How we prove full reorder). ExerciseCard fixes (P1-71, P1-73) also landed. IntakeClient also uses it (`intake/IntakeClient.tsx`). Primitive is comprehensively adopted.
- [x] **F10 · Batch 31 — Readiness ladder ship** — 5 of 6 REVIEWED promotions shipped 2026-08-19 (`38d7822`). Schema (reviewed_by, reviewed_at, status_history, review_evidence[]) added. DRAFT rename + catalog filter + attribution row on preview page + honesty callout on catalog all live. Promoted: engine-builder, overhead-mobility, handstand-walk, CSM, rowing-2k. Anterior-hip-rebuild resolved via **S6 Option C** (2026-08-19, `9174961`): personal programs are excluded entirely from the ladder — StatusChip returns null when personal=true. Hip stays REFERENCED under the hood for schema conformance. F10 close-out follow-ups tracked in Batch 38 (F10-CSM-P0, F10-Rowing, F10-HSW, F10-EB) and Batch 38.1 (F9-completeness-audit).

  **S5 rerun outcomes (2026-08-19, 6 program re-review agents):**
    - **REV-1 · engine-builder** — VERDICT: **PROMOTE-WITH-CAVEATS.** All 3 Path-A items (Rønnestad, HERITAGE gate, engineering-choices) landed correctly. 3 caveats for `review_evidence[]`: (a) mid-block retest `source_ref` is null so second baseline never fires (needs `runs[].avg_hr where intensity=='easy'` wire-up); (b) `submax_hr_pace5_bpm` display_name promises pace anchor its source can't enforce; (c) GraduationCard + retest_due proposal collision (shared app bug, not engine-builder-specific).
    - **REV-2 · overhead-mobility** — VERDICT: **PROMOTE-WITH-CAVEATS.** Q4 motor-learning wire shipped structurally (blocked→random in generator, external-focus cues on 12 drills, banner user-visible). O-1/O-2/O-3 all closed. 3 caveats: (a) DrillCard "Show me the position" self-controlled feedback UI never shipped; (b) KR-bandwidth rating input absent; (c) variability rotation (KB→DB→PVC) absent. All explicitly scope-cut per ship commit; not regressions.
    - **REV-3 · handstand-walk** — VERDICT: **HOLD.** H-3 Ferrari 2021 drop NOT ACTUALLY EXECUTED (still in references[] + reference_ids[] + prose at :685 + :1507). H-4 sci_reports specifics still in 4 places (:82, :1541, :1719, :1720). Kinoshita block `note` at :783 contradicts render phase. `phase_gates` field authored but not consumed by engine. **Fix scope: ~2h of JSON edits closes to PROMOTE.**
    - **REV-4 · concurrent-strength-maintenance** — VERDICT: **HOLD.** C-2/C-3 landed cleanly. But: (a) **P0** PerProgramAdherenceCard reports 0/25 despite 23 logged sessions (`legacy-to-blocks.ts:75-86` — blocks never flip `planned`→`done`); (b) SignalsStrip `csm-amber-week` signal computed but no expanded body render branch; (c) amber-week schedule swap authored at line 541 but `schedule.ts` never consumes `derived_state === "amber"`; (d) C-1 Berryman engineering-choice line never actually added to `engineering_choices_flagged[]`. **Fix scope: 4 items across engine + JSON.**
    - **REV-5 · rowing-2k-test-prep** — VERDICT: **HOLD.** R-1/R-2 (citations.json) + R-4 (schema) landed. But: (a) R-3 Das 2019 drop NOT EXECUTED — still in `references[]:846` + `reference_ids[]:893`; (b) split `references[]` schema drift (Steinacker 1998 + Bosquet 2007 in orphan top-level array, not in evidence_base); (c) Proteau 1992 title updated in citations.json but inline `references[]:784` still stale; (d) HERITAGE classifier reads `store.retest_readings` which is never dual-written from `runs[]` — schema gate landed, data flow gap open; (e) P0-1 Today four-way contradiction (YourPlanCard + phase header + retest window + graduation card all render simultaneously).
    - **REV-6 · anterior-hip-rebuild** — VERDICT: **HOLD.** Clinical logic + provocative-position honoring + persona harness all clean. Blockers: (a) **HIGH** manifest still `REFERENCED` while JSON declares `ACTIVE` — persona renders BOTH badges on preview (`persona-recover/text/07-programs-active.txt:5-6`); (b) definitional gap — the readiness ladder defines REVIEWED as "domain specialist audited citations against literature" but anterior-hip ships with **zero** citation structures (was correctly excluded from the 2026-08-17 review). Needs either an F10 policy call ("for personal programs, REVIEWED means author's clinical record audited against clinical-context.json") or block promotion until a physio actually signs off. (c) LOW: `HIP_HOLIDAY_GAP` hardcoded in `schedule.ts:91` — JSON date shifts silently invalidated.

  **Cross-program meta-findings (not per-program):**
  - **Shipping-log drift** — 4 of 6 programs (HSW, Rowing, CSM, plus H-3 above) have items marked "shipped 2026-08-18" in `citations-under-review-2026-08-17.md` that only partially executed on disk. **Add "verify shipped ≠ archive" step to future batch commits.** Track as **QA-1**.
  - **HERITAGE data-flow gap** — rowing + engine-builder both have schema-level classifier but `retest_readings` is never dual-written from `runs[]` ingest. Track as **BUG-7**.
  - **App-render bugs blocking multiple promotions** — PerProgramAdherenceCard 0/25, GraduationCard + retest_due collision, YourPlanCard 4-way contradiction. Track as **BUG-8**, **BUG-9**, **BUG-10**.
  - **Half-shipped features** — SignalsStrip `csm-amber-week` computed with no expanded body; amber-week schedule swap authored but not consumed. Track as **BUG-11**.

  Source: `2026-08-19-founder-obs-design-lead.md` Decision 3 + `dev/archive/citations-under-review-2026-08-17.md` + 6 agent reports (task IDs a8a6c86 anterior-hip, a840816 engine, a2e72b3 hsw, a42be41 csm, af11b8b rowing, aec3b59 overhead). Depends on: BUG-7 through BUG-11 for HOLDs to promote.
- [x] **F11 · Batch 32 — Tier-bug explain-back** shipped 2026-08-19 (`1d43ece`). Three-branch content model promoted from collapsed `<details>` to always-visible DashboardBlock above tier picker. Amber eyebrow when tests skipped (Branch B) — visible signal that the pick is conservative. Uses P0-10 copy + F9 primitive.
- [x] **F12 · CSM amber-week schedule swap** — Already implemented at `plan-generator.ts:82-103` (pre-session-audit-round). Filter drops `block_4x4_row` when ≥ 3 amber-state days in trailing 7 days. Discovery during 2026-08-20 continue-thread revealed only the SignalsStrip advisory copy was stale (said "coming"). Advisory copy refreshed (`60c85ff`) to reflect current behavior + cite JSON hook + Bouchard 1999 rationale. General "if X, swap block Y for Z" primitive still valuable for other programs — file as future infrastructure work when a second program authors this pattern.

---

## Section F — Strategic (founder decision needed)

Not tasks — calls to make.

- [ ] **S3** SaaS Phase 3 (billing/Paddle) is 0% done — gates F6 paid-gating, F4 monetization, F2 Phase C, F3 turn-on. Real critical-path item for anything labeled "Paid." **Decision:** when does this become top-of-stack? Source: `2026-08-19-open-task-list.md` (F3), `product-concerns-2026-08-17/roadmap.md`.
- [ ] **S4** F5 correlation view is chicken-and-egg with beta data volume. **Decision:** set explicit "N users × 90 days" trigger, or defer indefinitely? Source: `2026-08-19-open-task-list.md` (F4).
- [x] **S5** Readiness-ladder promotion pipeline. **RESOLVED 2026-08-19** via 6-agent rerun. Outcome: 2 PROMOTE-WITH-CAVEATS (engine-builder, overhead-mobility), 4 HOLD (HSW, CSM, rowing, anterior-hip). Pipeline exists; the 2026-08-17 review needs a delta pass before promotion. See F10 breakdown for per-program outcomes + cross-program meta-findings (BUG-7 through BUG-11 + QA-1).
- [x] **S6** Personal programs sit outside the readiness ladder — resolved 2026-08-19 (`9174961`, Option C). Founder pick: personal programs excluded entirely. StatusChip returns null when personal=true; legend gets a one-line addendum; attribution row suppressed. Anterior-hip-rebuild stays REFERENCED under the hood for schema conformance but the chip is hidden — the "personal" badge is its sole trust signal.
- [x] **BETA-1** The catalog was unreachable once you had a program, shipped 2026-09-01. Sharper than the original finding: the `/programs` link on Profile sat in the empty-state `else` branch, so it rendered ONLY for a user with no program — the active-programs list deep-links to `/programs/{slug}`, never the index, and Programs is not in the bottom nav. A user with a program had no path to the catalog anywhere in the app, and an installed PWA has no address bar. Became urgent the same day BETA-2 made the catalog public: a friend could browse before signing up, then never find it again after. **Decision: persistent Profile row, not a fifth tab** — a tab bar is for daily destinations (Day/Plan/Record) and picking a program is monthly at most; a fifth tab also reverses Cut C and truncates at 393px. Revisit when paid multi-track makes adding a program a repeated action. Files: `profile/page.tsx`. Size: XS
- [x] **BETA-2** Program browsing was sign-up-only, shipped 2026-09-01. `AuthGate` (outer) carved `/programs` out as public; `AppShell` (inner) did not, and the stricter layer wins — so a visitor deep-linked from the landing was bounced to /sign-in and asked to create an account to see what they would be creating it for. Fixed by making `/programs` semi-public: guests get the bare column, signed-in users keep the full shell, intake stays gated in both layers. Root cause was two hand-maintained route lists that disagreed in BOTH directions — the same drift also gated `/reset-password` in AuthGate, the one page a person who cannot sign in needs. Both now derive from `lib/route-access.ts`. Files: `route-access.ts` (new), `AuthGate.tsx`, `AppShell.tsx`. Tests: `route-access.test.ts`, 6 cases incl. a drift guard. Size: S
- [ ] **QA-1** Shipping-log drift protocol. The 2026-08-18 batch's `citations-under-review-2026-08-17.md` "Shipped" section claimed 11 fixes; S5 rerun found 3+ items only partially executed (H-3 Ferrari drop, H-4 sci_reports softening, R-3 Das drop, C-1 Berryman engineering-choice line). **Decision:** add a "verify shipped ≠ archive" step to future batch commits — either a checklist of `grep` proofs before archiving the plan, or a post-commit CI check that re-parses the referenced program JSONs. Source: S5 meta-finding across REV-3, REV-4, REV-5.
- [x] **QA-2** Landing↔app sync-drift protocol — **superseded 2026-09-01.** Originally shipped 2026-08-19 as `dev/scripts/check-landing-sync.py`, manual, with a note to "wire to pre-commit or CI later". Later never came, and the checker itself went stale: by 2026-09-01 it was reporting three failures, all wrong — it counted only REVIEWED programs and demanded the landing say "Five programs live", a rule predating the ladder change that ships CITED programs publicly too. A drift checker that drifts, and cries wolf where nobody hears it, is worse than none. Assertions moved into `data-integrity.test.ts` (program count vs public manifest, citation count vs citations.json, and the hero's cites-a-study claim carrying its log-signal half), so they run on every commit and every deploy. Mutation-tested: four deliberate drifts introduced, three tests failed, file restored. Script deleted — recoverable from git history if ever wanted.

---

## Section G — Rejected (do NOT ship)

Deduplicated across visual-craft §16 + mobile-ux §10 + roadmap:

- [ ] **R1** Photography anywhere in the app.
- [ ] **R2** Second primary accent — nothing competes with bronze for CTA.
- [ ] **R3** H1 larger than 32 px — no Whoop score-donut, no Whoop-scale hero.
- [ ] **R4** Softer mono-caps everywhere — mono is Terav's technical identity.
- [ ] **R5** Streak / challenge / gamification counters — violates confirm-first, cite-the-paper contract.
- [ ] **R6** Filling Coach empty-state fold — absence is honest.
- [ ] **R7** Runna-style drag-to-reschedule — breaks confirm-first; explicit MoveSheet is stronger.
- [ ] **R8** Whoop-style autonomous score-hero — wrong tone for confirm-first.
- [ ] **R9** Pliability-style "one arc per day" — Terav's multi-track is a deliberate feature.
- [ ] **R10** Video form analysis as paid pillar — Concern C evidence stands (kill from `product-concerns-2026-08-17/roadmap.md`).
- [ ] **R11** Cross-user note aggregation at beta scale — Concern D, deferred until N > 1000.
- [ ] **R12** Coach chat surface — shelved 2026-08-19 (S1 kill). AI-token costs don't pencil until N ≥ 50 users. `/coach` route + `coach-client.ts` deleted; restore when the paid-user base can amortize per-turn LLM cost.

---

## Closed items appendix (shipped since 2026-08-17)

Strikethrough preserves history; these items are OUT of the open list.

**Pre-invite catalog leak (founder, 2026-09-01) — Batch 46:**

- [x] **BUG-30** — DRAFT programs were startable by URL, shipped 2026-09-01. `programs/page.tsx` filters `status !== "DRAFT" && status !== "PROVISIONAL"` out of both catalog lists, but `generateStaticParams` prerenders a detail page for **every** slug in the manifest — drafts included. So `/programs/first-strict-pullup`, `/muscle-up` and `/engine-builder-block-2` were publicly reachable with a fully working "Make this my focus" button; the listing filter was the only thing hiding three unfinished programs and it does not guard the route. `ProgramPreviewClient` only suppressed the status *chip* for drafts (line ~205), so the page rendered as if published. Found when the founder started `first-strict-pullup` on test@terav.fit and asked how a non-public program could be started — it was the URL, not the admin flag. Now: `draftBlocked = isDraft && !isSuperAdmin` disables start and renders a "Not published yet" notice; super-admins keep draft preview so programs can still be tested before shipping. Matters because the free-friends beta is imminent. Files: `ProgramPreviewClient.tsx`. Size: XS
- [x] **BUG-32** — Graduating Engine Builder offered a DRAFT program, shipped 2026-09-01. `engine-builder.json` declares `next_block_slug: "engine-builder-block-2"`, and Block 2 is DRAFT — not in the catalog. `StatusCards.tsx` resolved the next block straight out of the manifest with **no status filter**, so every user finishing Engine Builder (one of the five shipped programs) was shown a graduation CTA for a program that does not exist yet. Same promise-then-deliver-nothing pattern the founder rejected on 2026-08-17 for empty category chips. Now falls through to the generic Programs CTA until Block 2 ships. Second draft-leak surface found while tracing BUG-30 — the catalog grids were clean, this one was not. Files: `StatusCards.tsx`. Size: XS
- [x] **BUG-31** — NOT A BUG, recorded so it isn't re-investigated. Founder could add a second program alongside on test@terav.fit. That address is in `SUPER_ADMIN_EMAILS` (`super-admin.ts:9`) and the "+ Add alongside (admin)" button is already gated on `isSuperAdmin`, calling `addSecondaryProgramForce`. Normal users hit the launch cap in `useStore.ts:928` (`MULTI_MAIN_ENABLED = false`), which makes a second start **replace** the first. Working as designed. Note for the paid tier: multi-track is fully implemented in store + Today + Plan and sits behind that one boolean, so "multiple parallel plans" is an entitlement check away, not a build.

**Live-session bug report (founder, 2026-09-01) — Batch 46:**

- [x] **BUG-30** — Per-side hold timers could only ever run once, shipped 2026-09-01. `per_side` work is
  two efforts inside one set (90/90 switches, most hip stretches), but the countdown in `SetView` had no
  reset: at zero the sole action was "Done", which logs the set and advances. Reaching the second side
  meant logging the first and hoping another set row existed. `per_side` was read in exactly one place —
  a summary string — and the timer UI was otherwise side-blind, showing neither which side you were on
  nor that there was another. Now: the status line reads "side 1 of 2", and at zero the primary button
  becomes "Other side · Ns" (reset, not auto-started — you need a moment to switch), demoting "Done"
  until both sides are done. "Log it now" still logs early if only one side was done. `SetView` remounts
  per set via `key={active.key + activeSetIndex}`, so the counter resets without an effect. Founder hit
  it mid-session on a hip stretch. Files: `SetView.tsx`. Size: S

- [x] **BUG-31** — The Sentry feedback trigger covered the Profile tab, shipped 2026-09-01. The widget
  sits bottom-right by default, on top of BottomNav's rightmost tab. **A fix for this already existed
  and had never worked:** `globals.css` set `--bottom` and `--right`, the positioning variables from
  Sentry SDK v7. The SDK is v10 and uses `--actor-inset` (top/right/bottom/left shorthand) plus
  `--page-margin`, so the override set two properties nothing consumes — and, declared on `:root`,
  leaked names as generic as `--bottom` into every stylesheet. It went unnoticed because the widget
  rendered for the first time on 2026-09-01, when the DSN finally reached production: a fix for a widget
  nobody could see had nothing to be wrong against. Now set on the `#sentry-feedback` host (custom
  properties inherit into shadow DOM) so nothing is published globally. Files: `globals.css`,
  `sentry.client.config.ts` (stale comment). Size: XS

**Live-session bug report (founder, 2026-08-31) — Batch 45:**

- [x] **BUG-27** — Bodyweight sets were invisible to every progress counter, shipped 2026-08-31. `SetView.confirm` writes `weight_kg: null` on purpose when an exercise isn't loadable (a dead bug has no weight), but seven call sites open-coded `s.weight_kg != null && s.reps != null` to decide whether a set was logged. So a correctly saved bodyweight set scored zero: `firstUnfinishedSetIndex` returned 0 and resume always landed on set 1, the rail's `n/m` and the Brief's "Done" tag never advanced, and `totalRemaining` overcounted. Founder hit it on dead bug + Pallof press on 31 Aug — "after saving second and third set, it takes back to first set and doesn't save it". Data was never lost; only the counters lied. `SetView.loggedAt` already had the rule right and its comment claimed the other surfaces shared it — they didn't, so the rule now has exactly one implementation in `lib/set-progress.ts`. Files: `set-progress.ts` (new), `DaySession.tsx`, `BriefView.tsx`, `SetView.tsx`, `OverflowSheet.tsx`. Tests: `set-progress.test.ts`, 7 cases. Size: S
- [x] **BUG-28** — The AMRAP top set was the one set whose weight could not be changed, shipped 2026-08-31. `SetView`'s `isAmrap` branch rendered the 1-9 rep grid alone; the load stepper and the "Change the weight" toggle both lived only in the fixed-rep branch. Every 5/3/1 top set is an AMRAP, so the set most likely to be run off-prescription was the only one locked to it. Founder squatted 95 kg against a prescribed 93.5 on 31 Aug, could only record it in a free-text note, and the set logged at 93.5 — feeding a wrong weight into TM inference, which reads weight × reps. AMRAP branch now carries the same stepper + toggle, and the rep-grid caption shows the live weight. Files: `SetView.tsx`. Size: XS
- [x] **BUG-29** — Brief's rail row overstated the working load on 5/3/1 days, shipped 2026-09-01. The row read "6 sets · 93.5 kg" while only set 1 was at the top weight — sets 2-6 are FSL at 65-75% TM — so the one screen a user scans before loading a bar attributed the top weight to every set, and the real FSL weight was reachable only by stepping into set 2. `railScheme()` now splits it: "1 × 93.5 kg · 5 × 71.5 kg". `rowCount` is `fsl.sets + 1` in `useMemoRail`, so the split always totals the same count the old label claimed. Founder spotted it 30 Aug. Files: `BriefView.tsx`. Tests: `rail-scheme.test.ts`, 4 cases. Size: XS

**Rest-day logging bug report (founder, 2026-08-30) — Batch 44:**

- [x] **BUG-21** — Rest days reached via `/session/[slug]` had no logging path at all, shipped 2026-08-30. `DaySession` early-returned `RestDayCard` before `BriefView`, and `RunSlotCard` was only ever mounted by `OffPlanSheet` (inside BriefView) and `TodaySession`. So the card was the whole screen: no form, no button. Plan's rest-day "Log a session →" link carried a comment claiming it landed "in RestDayCard + RunSlotCard mode" — that mode was never built. Found live: the founder rode 101 km, paddled and walked on Sat 29 Aug and the only screen for that day could record none of it. `DaySession` now renders the log card beneath the rest card for today and past dates (future days get the card alone — nothing to log yet). Files: `DaySession.tsx`. Size: S
- [x] **BUG-22** — Rest-day copy pointed at a tab that no longer exists, shipped 2026-08-30. Both the `rest` and `holiday` variants told the user optional work "lives on the Extras tab"; `/extras` became `/off-plan` on 2026-08-21 and dropped out of the bottom nav, and off-plan is now flag-gated out of the catalog entirely. In an installed PWA (no address bar) that instruction was unfollowable. Copy now points at the log card directly below it (BUG-21). Files: `StatusCards.tsx`. Size: XS
- [x] **BUG-23** — HR fields were hidden for `walk` and `other`, silently discarding the engine's own effort input, shipped 2026-08-30. `note-signals` / effort derivation read `avg_hr`, but the two activity types most likely to be logged from a watch could not record it. Founder session: a 63-min paddleboard (avg HR 119) and an 80-min track activity (avg 100 / max 153) both landed with no machine-readable HR. HR now renders for every activity type; still hidden when a GPX supplied the values. Files: `RunSlotCard.tsx`. Size: XS
- [x] **BUG-24** — "Recorded against today" was hardcoded on a sheet that opens on any date, shipped 2026-08-30. Plan's "Log session →" lands on past days, so logging Friday's class on Sunday read as if it would be filed under Sunday. Names the actual weekday + date when it isn't today. Files: `OffPlanSheet.tsx`. Size: XS
- [x] **BUG-25** — "0 drills available" rendered directly above a list of four drills, shipped 2026-08-30. `drillCount` summed `block.items`, but slot-based programs (overhead-mobility) author no items — their exercises compose per user from `drill_library`. Falls back to the block count, which is what the list beneath already shows. Files: `OffPlanSheet.tsx`. Size: XS
- [x] **BUG-26** — Plan's collapsed week hid activity-only days, shipped 2026-08-30. The header badge counted logged EXERCISES only, so a day carrying nothing but activities read as a bare "rest" with no marker. A founder week with a class, two 50 km rides and a paddle showed as four empty rest days until each was expanded (the activities were there, one tap down). Adds a `N activities` badge alongside `N logged`. Files: `plan/page.tsx`. Size: XS

**Live-workout bug report (founder, 2026-08-24) — Batch 43:**

- [x] **BUG-15** — Completed sets were unreachable and uneditable, shipped 2026-08-24. `activeSetIndex` moved forward only: `startSession`, `jumpTo`, `firstUnfinishedSetIndex` and Rest's auto-advance all resolved to the first UNFINISHED set, and the "set N of M" line was plain text. Compounding it, `ExerciseCard` — the only per-set editable UI in the app — was orphaned when off-plan moved onto SetView (2026-08-24) and is rendered nowhere. So a mis-logged weight was permanent. Added set pips to `SetView`: every set on the exercise, one tap away, logged ones showing `kg×reps`; re-confirming a logged set reads "Save — set N", skips the rest timer, and returns you to where you were working. Fixes Day, off-plan and extras at once (shared component). Files: `SetView.tsx`, `DaySession.tsx`, `OffPlanSession.tsx`. Tests: `tests/e2e/session-set-edit.spec.ts`. Size: M
- [x] **BUG-16** — Day showed one track on a day Plan said had two, shipped 2026-08-24. Two causes. (a) Plan derived every day's blocks from phase math even with `block_object` on, while Day read materialized `scheduled_blocks` — two sources for one question. Plan now reads the same map with the same state filter, and the filter itself moved to a shared `DAY_VISIBLE_BLOCK_STATES` so the three day-facing views can't drift again. (b) `scheduled_blocks` was written exactly ONCE, by the `blocks_v2` migration, covering `today ± 28d` for the programs active at that instant; `materializeLookahead` had zero callers, so nothing ever extended it. A track added later never got blocks, and every track would have silently emptied at migration-date + 28d. Added `lib/engine/ensure-materialized.ts` + a keeper effect in `StoreHydrator` that runs on hydrate and on active-program change. Files: `plan/page.tsx`, `block-selectors.ts`, `ensure-materialized.ts`, `StoreHydrator.tsx`. Tests: 10 unit + e2e reproducing the un-materialized state. Size: M
- [x] **BUG-17** — `resolveActiveTier` read the PRIMARY slug, shipped 2026-08-24. `profile.active_program_id` instead of `program.slug`, so a second active track resolved the primary's tier — wrong reference week, or none. `activePhaseFor` already did this correctly; the two now agree. Surfaced a stale test whose local loader didn't stamp `program.slug` (the real loader always does), so it was asserting a phase-substitution path the app never takes; rewritten to assert real behaviour. Files: `plan-generator.ts`, `plan-generator.test.ts`. Size: XS
- [x] **BUG-18** — `+30s` reset the rest timer instead of extending it, shipped 2026-08-24. Was `setElapsed(e => Math.max(0, e - 30))` — rewinding elapsed, clamped at zero, so remaining could never exceed the original duration and tapping inside the first 30s snapped the display back to full. Now a separate `extra` added to `target`, read by the interval through a ref. Files: `RestTakeover.tsx`. Size: XS
- [x] **BUG-19** — Session rail was unusable on off-plan, shipped 2026-08-24. Plain flex row of `flex: 1` buttons with no minimum, sized to fit whatever the rail held — fine for Day's 2-5 exercises, but off-plan flattens every accessory and cardio block into one rail: 16 for anterior-hip-rebuild, 23 for first-strict-pullup, 34 for handstand-walk, i.e. ~11px per target at 393px. Now min-width + horizontal scroll with the active tab scrolled into view, back/`⋯` outside the scroller. Also truncated the exercise-name line, which used to wrap and interleave with the sets counter. Files: `SetView.tsx`, `globals.css`. Size: S
- [x] **BUG-20** — Rest completion sound was easy to miss, shipped 2026-08-24. Chime was ~0.46s at peak 0.18, and the only pre-zero cue was an `aria-live` announce (silent without a screen reader). Chime is now ~1.3s — an alternating A5/D6 figure resolving to a held E6, rhythmically distinct from `playConfirm` — plus an audible 3-2-1 lead-in (`playCountdownTick`, with a short vibrate) that re-arms if you extend with +30s. Files: `sound.ts`, `RestTakeover.tsx`. Size: S

**Founder observation, no action taken (2026-08-24):** post-redesign the session reads as weights-and-timer first, and notes have receded — they now have exactly two entry points, both buried (`⋯` → "Note for this exercise", and an auto-open when you tap "Grind"), and no session screen renders an existing note. Recorded, not scheduled.

**Off-plan cut from the public catalog (2026-08-24) — Batch 44:**

- [x] **F13** — Off-plan drills behind `feature_flags.off_plan`, shipped 2026-08-24. MVP density call. Two findings drove the shape: (a) NO program has off-plan-only content — every `accessory`/`run` block in all nine programs is already scheduled onto a day by the phases + weekly template, so `/off-plan` was a second door into prescribed work and a live double-logging path; (b) `schedule.ts:457` — anterior-hip-rebuild is the ONLY program that routes its non-strength blocks off Day ("live on the Extras tab by design"), so the surface was built for one program and duplicated for the other eight. Flag is tri-state: `undefined` renders nothing and shows no Settings row (every new account); `true`/`false` renders the Settings toggle so it can be recovered — necessary because the installed PWA has no URL bar, so there is no query-string escape hatch. Accounts with logged off-plan work on ≥3 distinct days are grandfathered once, via a `StoreHydrator` effect guarded by an `off_plan_grandfather_v1` marker; 3 rather than 1 so an incidental beta tap doesn't hand a public user the surface. Surfaces: Profile row gated, Day's "N drills available" DashboardBlock deleted outright (third surface for the same thing), `/off-plan` route kept alive with an explanatory empty state. Files: `lib/features.ts` (new), `schemas.ts`, `StoreHydrator.tsx`, `settings/page.tsx`, `profile/page.tsx`, `TodaySession.tsx`, `OffPlanSheet.tsx`, `OffPlanSession.tsx`. Tests: 8 unit + 4 e2e. Docs: `dev/active/offplan-flag/`. Size: M
- [x] **F13b** — Activity logging KEPT and renamed off "off-plan", 2026-08-24. Investigated whether `logs[].runs[]` was just a diary. It is not: it is the retest data source for four programs (`engine-builder`, `engine-builder-block-2`, `concurrent-strength-maintenance` read `runs[].avg_hr where intensity == 'easy'`; `rowing-2k-test-prep` reads `runs[].total_seconds` — the 2K result itself). Engine Builder and rowing-2k are composed ENTIRELY of `run`-category blocks: the prescribed session IS the run/row. Plus six decision paths — cardio→fatigue→`day_adjustment_soften` load multiplier (`note-signals.ts:247`), layoff detection (`adapt.ts:252`), missed-week (`missed-week.ts:43`), the concurrent interference callout (`TodaySession.tsx:332`), proposal suppression (`select.ts:69`). Cutting it would have gone dark on half the catalog's evidence loop. Brief footer now reads "Log a run, row, or class"; the sheet is titled "Log an activity" with copy that no longer claims the activity wasn't prescribed. Program-conditional prominence (louder for the four run-measured programs) was proposed and dropped as scope creep. Size: S

**Follow-up opened (2026-08-24):** for Engine Builder / rowing, the session flow logs `exercises[].sets` while the retest metric reads `runs[]` — doing the prescribed run inside the session does NOT feed the metric, so the user has to log it twice. Real product gap, deliberately out of scope for a flag change.

**Persona harness coverage rebuild (2026-08-24) — Batch 45:**

- [x] **H1** — Persona harness coverage audit, 2026-08-24. Full report: `dev/audits/app/2026-08-24-persona-coverage-audit.md`. Starting numbers: 63% of user-facing routes toured, **0% of interactive surfaces exercised** (the tour is `goto` + `screenshot`, it never clicks), 35% of store schema keys ever written, 6 of 15 personas producing any training log, **0 mid-session states across 1,064 simulated days**, 0 timeline positions. `/session/[slug]` — the app's most-used screen and the whole subject of the Day redesign — was absent from the tour. `/events` was toured and does not exist, so every persona had been capturing a 404 at two viewports. Every bug in the 2026-08-24 live-workout report sat in this blind spot. Size: M
- [x] **H2** — Tour repaired, 2026-08-24. Dropped the dead `/events`; added `/session/[slug]` (today + a past day + a future day via `?date=`, the app's only cross-day affordance and never exercised), `/settings`, `/programs/[slug]/intake`, `/evidence`, and all three `/legal/*`. Routes: 63% → **100%**. Files: `tests/e2e/harness/tour.ts`. Size: S
- [x] **H3** — Flows: the harness's first interaction layer, 2026-08-24. New `tests/e2e/harness/flows.ts` — 10 named flows that drive real UI and capture after every step, skipping cleanly with a recorded reason when a persona has no session that day. Covers logging a set, **going back to a logged set and correcting it**, `+30s`, the `⋯` sheet, the note sheet, exercise details, the activity sheet, program preview, first-run onboarding, and Plan's expanded day. Interactive surfaces: 0% → **66.7%**. Size: L
- [x] **H4** — Simulator fidelity, 2026-08-24. Three independent gates were each, on their own, enough to silence persona-mobility and both handstand personas — 150 simulated days producing zero training data of any kind: (a) `itemsForBlock` returned `[]` for slot-based blocks, whose drills only exist after `composeBlockForUser`; (b) the `if (!tm) continue` gate dropped every non-loadable drill, and mobility/skill work has no training max by nature; (c) `pickBlocksForDate` applied a `category === "strength"` filter to every program, but all 7 overhead-mobility blocks are `accessory` — the app only applies that filter to hip-rebuild (`schedule.ts:457`). persona-mobility: 0 → 34 logged exercise entries. Also added mid-session states (partial sessions on Wednesdays — there had never been a single one), `dismissed_proposals` + `proposal_history` (both had been initialised to empty and never written, including for persona-erratic whose declared focus is "dismissed proposals"), `retest_readings` (read by 10 source files, never populated), and one moved session per arc. Store keys: 35% → **80%**. Size: M
- [x] **H5** — Coverage is now measured, not assumed, 2026-08-24. New `tests/e2e/harness/coverage.ts` writes `coverage.json` per persona and a fleet `coverage.md` every sweep — routes, surfaces, store keys, state variety, flow outcomes, and what no persona reached. Size: S

**Accessory reps seeded at zero (2026-08-25) — Batch 46:**

- [x] **BUG-21** — Accessory / off-plan exercises seeded 0 reps and committed the zero, shipped 2026-08-25. Founder-reported, and visible in his own 2026-08-24 log: `hip_switch_9090` set 1 at **0 reps between two sets of 12**, `air_squat_daily` set 3 at **0 after two sets of 10**. SetView's seeding chain was logged-value → engine prescription → last-time-same-index → 0. The engine prescription is TM-derived so it never exists for accessories; `prev` is indexed per set, so set 3 of an exercise you'd only ever done for two sets had no counterpart — and the chain fell through to zero, which "Done" then wrote to the log. Both exercises author `default.reps: 10` in `exercises.json`; nothing read it. (`rowCount` already fell back to `exercise.default.sets` — only reps was missing the same treatment.) Fixes: `default.reps` added to the chain; `prev` falls back to the last row last session actually logged rather than nothing; hold-based work (isometrics, stretches — `hold_seconds` and no reps at all) seeds 1, because zero is never a correct starting value for something you are about to do. Files: `SetView.tsx`. Test: `tests/e2e/offplan-flag.spec.ts`. Size: S
- [x] **P3-1** — "Programme asks for" line on the set screen, shipped 2026-08-25. The Prescribed card only ever rendered for TM-derived strength suggestions, so accessory and mobility work showed no dose at all — you had to know from memory that 90/90 hip switches are 10 a side. Now renders the authored dose (`20s hold · 5 sets · per side`) whenever there is neither an engine prescription nor a last-time value. Also fixed "1 reps" → "1 rep". Size: XS
- [x] **QA-2** — Session specs no longer depend on the weekday, 2026-08-25. Four specs hard-coded `/session/<slug>/` and asserted against today; programs train on a schedule, so the date rolling over mid-session broke all four at once. New `tests/e2e/helpers/session.ts:gotoSessionWithWork` walks `?date=` across nearby days — the same fix `harness/flows.ts:openBrief` needed for the persona fleet, where 7 of 13 personas had been skipping every session flow for the same reason. Also corrected a bad assertion of my own: the multitrack test compared Day's track count against `getByText(/^\d+ tracks$/).first()`, which picks up whichever day in the visible week carries a chip — not today's row. It now compares against the block map. Size: S

**Open, not fixed (2026-08-25):** hold-based exercises are logged as reps. `hip_flexor_stretch_kneeling` authors `{sets: 2, hold_seconds: 30}` and the founder's 2026-08-24 log records it as `×12`, which is meaningless. The app has no time-based logging mode — a set screen shows a rep counter regardless of whether the exercise is counted or held. Real gap, needs its own design pass.

**Time-based logging + harness gaps closed (2026-08-25/26) — Batch 47:**

- [x] **F14** — Time-based logging for held work, shipped 2026-08-25. The founder's 2026-08-24 log recorded a 30-second kneeling stretch as `×12`: isometrics and stretches author `hold_seconds` and no reps (`hip_flexor_iso_seated` is `{sets: 5, hold_seconds: 20, per_side: true}`) but the set screen only ever offered a rep counter, so the rehab half of the hip programme had no measurable dose. Held exercises now run a countdown — Start the hold / Pause / Resume / "Log it now" — with completion vibrate + chime; reaching zero logs the full dose, stopping early logs the elapsed portion. `SetLog` gains `seconds`, ADDITIVE on purpose: `reps != null` is the "this set is logged" predicate in **42 places across 18 files** (pips, rail counters, adherence, PR detection, history, the engine's did-you-train check), so a hold writes `reps: 1` AND `seconds`. Writing seconds instead would have made every hold read as unlogged everywhere at once. Record renders held sets as their duration. Files: `schemas.ts`, `SetView.tsx`, `CutCLogList.tsx`. Test: `offplan-flag.spec.ts`. Size: M
- [x] **H6** — All five unreached interactive surfaces closed, 2026-08-25/26. Four were wrong selectors, not missing state — the flows already reached the right screen and stopped one click short (`MoveSheet` and `ConfirmSheet` behind Plan's Move…/Skip; `VideoModal` behind `⋯` → Watch the lift; `InfoSheet` behind an inline text button reading **"cited"**, not a heading-shaped control). Move/Skip flows open and **cancel** — a flow photographs, it must not mutate the persona's plan or the next sweep stops being comparable. `RetestLoggingSheet` genuinely needed state: new `persona-retest` (engine-builder, 25 days) lands inside the week-4 mid-block retest window while the simulator's readings fire on day 14, outside the freshness window that suppresses the proposal. **persona-retest: 100% surfaces, 16/16 flows.** Size: M
- [x] **H7** — `assessments` covered via a hip-check flow, 2026-08-26. Took four wrong selectors to land, each looking like the last: the start control reads `Start check (6 items)`; answering does not advance (separate Next); `getByRole("button", {name: /^2$/})` matches **nothing** because the 0-10 scale buttons carry an aria-label overriding the visible digit; and the advance button relabels to **"Review"** on the final question. Store coverage 75% → 88.9%. Size: S
- [x] **H8** — Coverage denominator corrected, 2026-08-26. `daily_plans` and `stretch_targets` dropped from `STORE_KEYS`: `lib/engine/daily-plan.ts` has zero callers and nothing writes `stretch_targets`. Counting unreachable keys made the percentage permanently unattainable and the denominator dishonest. Size: XS

**Open — product, found while closing H6 (2026-08-26):** **every `rowing-2k-test-prep` block has zero items.** They are `run` blocks described by `duration_min` and a note, with no exercises at all, so the session shell has nothing to render on any date — rowing is un-startable in the session flow by data design, and the only way to record it is activity logging (which is also where its retest metric reads from). Engine Builder authors one item per run block, which is why its personas walk sessions normally. This is the sharper form of the 2026-08-24 follow-up: for run-modality programs the prescribed session and the logged data live in different places. `persona-rowing-mid` is kept because it documents it.

**Cut E · Session-detail audit (2026-08-21):**

- [x] **Cut E — SHIP-AS-IS verdict.** Founder-delegated "choose next surface yourself" pick. Ran 4-agent audit (product-design-lead + app-mobile-ux + app-visual-craft + app-copy-clarity) on the SetRow + ExerciseCard session-detail flow. All 4 agents converged on: session-detail is already at peer parity — no restructure warranted. Zero code changes. Recorded in `dev/active/cut-e-session/audit.md`.

**Batch 42 · Week 4c/4d · MissedSessionPrompt refactor + landing softening (2026-08-21):**

- [x] **Week 4d cleanup** — MissedSessionPrompt callbacks previously called `setActiveDate(yesterdayISO)`; after Week 4a killed DateNav on Day, the setter was a no-op relic. Refactored to `router.push('/session/${primary.slug}?date=${yesterday}')` so "Log yesterday" opens the session route with the date param. Removed dead `activeDate` setter from TodaySession. Files: `next-app/src/components/session/TodaySession.tsx`, `next-app/src/components/workout/MissedSessionPrompt.tsx`.
- [x] **Landing softening (FLAG-2c)** — "Red-flag patterns fire an escalate banner" (landing) softened to "Red-flag patterns surface a banner" to match the app's actual non-alarmist tone. Escalate reads harsh for a rehab-safe positioning. Files: `landing/src/i18n/dictionaries/en.ts:73-74`.
- [x] **Beta feedback footer (FLAG-1)** — mailto footer added below BottomNav on authenticated routes so beta users have a one-tap channel back to Margus. Files: `next-app/src/components/AppShell.tsx`.

**Batch 41 · Week 4a/4b · Shape 1 IA refactor (2026-08-21):**

Shape 1 refactor per D2 locked decision: Day is fixed to today structurally; Plan owns date browsing. Kills the tomorrow→session bug class by policy, not plumbing.

- [x] **Week 4a · Today → Day rename + kill DateNav.** BottomNav labels: `Today` → `Day`, `Week` → `Plan`, `Extras` → `Off-plan`. DateNav render removed from TodaySession; `activeDate` local state collapsed to non-mutable reference (later fully removed in Week 4d). Missed-session flow routes to `/session/[slug]?date=<yesterday>` instead of mutating Day's state. Files: `next-app/src/components/nav/BottomNav.tsx`, `next-app/src/components/session/TodaySession.tsx`.
- [x] **Week 4b · route renames + H1 hygiene.** `/week` → `/plan` (canonical), `/extras` → `/off-plan` (canonical). Old routes are redirect stubs (`router.replace()`). Plan gains "Log session →" verb for past days with `primarySlug` prop threaded through WeekDayActions. Files: `next-app/src/app/plan/page.tsx` (928-line canonical), `next-app/src/app/off-plan/page.tsx` (210-line canonical), `next-app/src/app/week/page.tsx` (redirect), `next-app/src/app/extras/page.tsx` (redirect).

**Batch 40 · Cut D · Check redesign (2026-08-21):**

Replaced the 6-8 slider + row-per-checkbox check form with a 4-option tap-scale + live verdict card. Same `derive()` state-model — backward compatible via `{None:0, Mild:2, Notable:5, Severe:8}` bucket mapping.

- [x] **Cut D · Phase 1 · brief + mockup.** `dev/active/cut-d-check/brief.md` (problem framing, peer refs Whoop/Oura/Freeletics, load-bearing vs polish split) + `mockup-day-fresh.html` (pure-HTML inline v1.1.1 tokens) + Playwright screenshot at 393×varies.
- [x] **Cut D · Phase 2 · primitives shipped.** `CheckRegionRow.tsx` (4-option tap-scale, tone-escalating active state strong-ink→amber→red, min-h-44, sub-line underline pin), `CheckFlagChip.tsx` (pill toggle, amber outline when on, min-h-44), `CheckSelectorRow.tsx` (generic segmented picker for stiffness None/<15/15-30/>30 + life load Fresh/Normal/Cooked), `CheckLiveVerdict.tsx` (4px state-color left rail, mono-caps WORKOUT READY/CHECK FIRST/BACK OFF, threshold reason, inline `Cited · Kellmann 2010` tap-opens InfoSheet — matrix rec #4 first-class citation UI).
- [x] **Cut D · Phase 3 · /check rewrite.** Full page rewrite composing all 4 primitives + prefill from most recent check (≤7 days) + `derive()` state logic unchanged. Bronze reserved for save CTA only (R2). No autonomous score-drama (R8). Files: `next-app/src/app/check/page.tsx`.

**Week 3 · Quick wins (2026-08-21):**

- [x] **FLAG-1 · Beta feedback channel** — mailto footer wired (folded into Batch 42; see above).
- [x] **FLAG-2a · Landing verb drift** — landing `apply` verb harmonized with app; audit deltas resolved. See P1-76 for original Batch 25 landing→app sync work. Additional string tightening handled in Batch 42.
- [x] **FLAG-5 · Analytics falsification event** — deferred: skipped because analytics stack hasn't landed. Re-open when analytics ships (needs S3 billing/track infra first).
- [x] **Tomorrow → session bug fix (tactical, Path A)** — `?date=` query param on `/session/[slug]` + `useSearchParams` client read. Structural fix landed in Week 4a (DateNav killed on Day). Files: `next-app/src/app/session/[slug]/page.tsx`.
- [x] **Recharts white-box cursor fix** — default Tooltip cursor rectangle replaced with `cursor={{ stroke: "#3A3F4A", strokeWidth: 1, strokeDasharray: "3 3" }}`. Files: `next-app/src/components/charts/*` + Cut C inner chart wrapper.

**Batch 39 · Cut C code sprint · Record surface (deployed https://9746a90f.program-v2.pages.dev, 2026-08-21):**

W1-W2 of the locked 4-week sequence. `/progress` + `/history` collapsed into unified `/record` surface. 5 tabs → 4 tabs. All 8 sprint deliverables landed:

- [x] **Cut C · Phase 1 · foundations** — data-viz palette tokens added to globals.css (`--dv-curve-primary`, `--dv-retest-hit/hold/back`, `--dv-bar-low/mid/high`); `/record` scaffold with 3-section shape (Now/Trend/Log); persona harness tour extended with `05b-record` slug. Deploy `14589f30`.
- [x] **Cut C · Phase 2a · WindowTierControl + LatestRetestTile** — segmented 4-tier zoom (30d/90d/1y/All) with data-adaptive default + localStorage persist; LatestRetestTile with 4px left rail + since-baseline line + inline CitationRef (first-class UI per matrix rec #4, NOT a footnote). Deploy `411e10a2`.
- [x] **Cut C · Phase 2b · RetestTimeline + ActivityHeatmap** — horizontal event strip with tri-color pins by outcome + milestone modulation + 22×44 tap hitbox + scroll-snap; auto-switching primitive (12-week matrix at <120 days, year-column mode with 3-tone density ramp at ≥120 days). Deploy `6cc91059`.
- [x] **Cut C · Phase 2c · ProgramCurveCard** — Recharts wrapper (dynamic-imported, reuses SymptomLoadChart chunk = zero incremental bytes) with slate rolling-avg curve, tri-color retest event pins, reduced gridlines (3 not 5 per Oura restraint), delta callout, [Show raw] toggle. New engine helper `lib/engine/rolling-avg.ts`. Deploy `6b4145ad`.
- [x] **Cut C · Phase 3 · IA cut-over** — BottomNav 5 → 4 tabs (Progress + History → Record); `/progress` and `/history` client-side redirect to `/record`; CutCLogList extracted from history pattern with 30-per-page pagination + Load-30-more button; JSON export wired via `lib/engine/record-export.ts` (Blob download, Whoop-wipe anti-pattern is the peer we reject per matrix rec #3); CutCRecordOnboardingBeacon (C5) — one-time InfoSheet dramatizing cite-per-adjustment differentiator. Deploy `9746a90f`.
- [x] **Persona harness · persona-strength-long added** — 400-day tenure persona for verifying Record at scale: year-column ActivityHeatmap, 14+ retest events on RetestTimeline, since-baseline pattern, curve at 1y/All zoom without mode-switch. Auto-added to tour.ts via existing PERSONAS iteration.

**Constraints preserved through the whole sprint:**
- R2 bronze CTA-only (chart curve is slate; segmented-control active state is strong-ink underline)
- R5 no gamification (retest events replace PRs per R-CutC-1)
- R7 no drag-to-reschedule (confirm-first mechanic unchanged)
- R8 no autonomous score-hero (amber-not-red for regression; no composite score)
- R-CutC-1 retests supersede PRs (LogList shows session/run/notes counts, zero PR badges)
- R-CutC-2 export supersedes share (JSON export shipped; zero social affordance)
- Batch 37 useStore-selector trap avoided (all new components read props, no `?? []` inside selectors)

**Remaining Cut C (Week 3 · prod verify + D6 hallway test):**
- Run D6 3-user paper prototype on real iPhone 15 to resolve D1 (Today → Day rename) before Week 4 refactor
- Founder review of `/record` on live app

**Then Week 4 · Today/Week/Extras refactor (Shape 1 per locked decisions):**
- Today → Day rename
- Week → Plan rename + absorbs date browsing
- Extras → Off-plan + absorb into Day peek-strip
- Kill DateNav on Day (Plan owns date browsing)
- Fix 3 landing/app string drifts (FLAG-2)
- Add beta feedback channel (FLAG-1)
- Add analytics falsification event for D1 rename (FLAG-5)

**Batch 38 — F10 promote-with-caveats close-outs + P1-78 (deployed https://5e7b5450.program-v2.pages.dev, 2026-08-21):**

4 items — the F10 close-outs from the S5 rerun agent reports. Verification pass discovered that 4 of 5 rowing findings and 1 of 2 HSW findings were ALREADY-DONE work whose changelogs read as "unshipped" in the audit — real bug fixes for 1 rowing item + 1 CSM P0 + 1 HSW soften. P1-78 folded in as the S-sized closer. 162/162 vitest pass · persona harness re-run in progress.

- [x] **F10-CSM-P0** — done 2026-08-21 Batch 38 — Users migrated under blocks_v1 (before Batch 37 BUG-8 shipped shouldFlipDone logic) had state=planned blocks stuck even with log evidence. Bumped MIGRATION_ID v1→v2 so `needsBlockMigration` returns true for stores that ran the old migrator; dropped `if (b.log_entry_id) continue;` short-circuit so log-linked blocks get shouldFlipDone re-evaluated. Idempotent — `b.state === "planned"` guard still prevents flipping done/skipped/moved. Regression test added: planned+log_entry_id block → done under v2. Source: 2026-08-19 F10 REV-4 §a (H impact). Files: `next-app/src/lib/migrations/legacy-to-blocks.ts:36-52,142-172`, `.test.ts`. Size: M
- [x] **F10-Rowing** — done 2026-08-21 Batch 38 — Verified R-3 Das drop, orphan references, Proteau title, HERITAGE dual-write all ALREADY DONE (REV-5 findings stale). Real bug: on graduated program TodaySession rendered HeroStateCard "WORKOUT READY" above GraduationCard "YOU FINISHED" — direct workflow contradiction. Removed graduated branch's HeroStateCard render; GraduationCard is the single anchored state. Source: 2026-08-19 F10 REV-5 §e. Files: `next-app/src/components/session/TodaySession.tsx:356-376`. Size: S
- [x] **F10-HSW** — done 2026-08-21 Batch 38 — H-4 sci_reports specifics softened across 5 in-body sites. Was citing unverified paper (whose own used_for flags "paper existence at claimed URL unconfirmed") for specific biomechanical claims. Softened to general motor-learning principle (pain-during-load reinforces compensation) — the shoulder-pain-stop-session rule survives on principle. H-3 Ferrari 2021 drop verified already done. Source: 2026-08-19 F10 REV-3 §H-4. Files: `next-app/public/data/programs/handstand-walk.json:82,463,1437,1491,1549`. Size: S
- [x] **P1-78** — done 2026-08-21 Batch 38 — HeroStateCard banner strings tightened to em-dash form across green/amber/red: "Progress load. Nothing above 3/10 in your check." → "Progress load — nothing above 3/10 today." Drops redundant "in your check" (users know the source), parallel one-sentence shape across all three tones. ReadinessDot removal half already shipped in earlier F8 push. Source: `2026-08-19-founder-obs-copy-clarity.md` O13 + motion-perf. Files: `next-app/src/components/workout/HeroStateCard.tsx:41-77`. Size: S
- [x] **F10-EB** — done 2026-08-21 Batch 38.1 (`10a46be`) — REV-1's 3 caveats now all resolved: (a) mid-block source_ref null fixed via BUG-7; (b) `submax_hr_pace5_bpm` display_name "Submax HR at pace-5 (row 2:00/500m)" → "Submax HR — easy-effort avg" (RunLog has no pace_500m field, pace anchor was unenforceable); (c) GraduationCard collision already resolved. status_history note updated. Source: 2026-08-19 F10 REV-1 caveat b. Files: `next-app/public/data/programs/engine-builder.json:1583-1590,1750`. Size: S
- [x] **P2-32-spot** — done 2026-08-21 Batch 38.1 — Killed the size=13 icon outlier in ExerciseCard MessageSquare (add-note button) and RunSlotCard X (remove-log button). Both bumped 13→14 to align with the note/action row scale. Full P2-32 icon-wrapper sweep still deferred (~100 sites, low user-visible ROI). Source: `2026-08-19-founder-obs-visual-craft.md` §N4 + own grep survey. Files: `next-app/src/components/workout/ExerciseCard.tsx:370`, `next-app/src/components/workout/RunSlotCard.tsx:308`. Size: XS
- [x] **F9-completeness-audit** — done 2026-08-21 Batch 38.1 — Verified DashboardBlock is now used across Today (TodaySession multi-track group renders), session route (via TodaySession), program catalog, program preview (P1-74 restructure shipped Batch 21), IntakeClient. All F9 deferred follow-ups shipped. Marked F9 done in master task list.

**Batch 37 — post-Batch-36 audit sweep + crash fix (deployed https://03f71229.program-v2.pages.dev, 2026-08-21):**

6 items — one P0 crash (React #185 in RetestMetricsPanel took down /progress + /report on every non-hip persona), plus five audit findings from the 2026-08-21 sweeps. Fix confirmed via persona harness: 10/10 personas run so far show zero pageerrors and zero React errors, /progress renders full retest-metrics content instead of the Next.js error boundary. Full lines preserved:

- [x] **BUG-1** — done 2026-08-21 Batch 37 — `useStore((s) => s.store.retest_readings ?? [])` inside RetestCard allocated a new `[]` reference every render when the underlying field was undefined (every non-hip persona, every user w/o retest history), tripping Zustand's Object.is equality and looping setState → React #185 "Maximum update depth exceeded". Fixed by splitting the selector: `useStore((s) => s.store.retest_readings)` returns stable `undefined`; `?? []` fallback derived OUTSIDE the store subscription. Source: `dev/audits/app/2026-08-21-app-*-post-batch36.md` (P0 across all 5 audits). Files: `next-app/src/components/progress/RetestMetricsPanel.tsx:95-106`. Size: S
- [x] **P0-CC1** — done 2026-08-21 Batch 37 — Tier ladder terminology collision — catalog LEGEND still described the deprecated 3-tier ladder (`referenced / reviewed / verified`) while cards already collapsed to §7.5's 2-tier (`cited / verified`). Cards → preview → evidence now all use one lexicon. Source: `2026-08-21-app-copy-clarity-post-batch36.md` §P0. Files: `next-app/src/app/programs/page.tsx:186-216`. Size: S
- [x] **P0-CC2** — done 2026-08-21 Batch 37 — `Save check` CTA rendered `<ChevronRight/>` icon instead of literal `→` glyph — inconsistent with every other §2.13 arrow CTA in the app. Swapped for consistency; dropped ChevronRight import. Source: same audit §compliance-gap-a. Files: `next-app/src/app/check/page.tsx:9,199-201`. Size: S
- [x] **P1-A22** — done 2026-08-21 Batch 37 — Today: H1 now precedes ArcProgressBar in DOM order (was inverted), fixing WCAG 2.4.3 Focus Order + the standard "landmark → heading → controls" reading model. Aria-label already deduped program name earlier. Source: `2026-08-21-app-accessibility-post-batch36.md` §2.2. Files: `next-app/src/components/session/TodaySession.tsx:226-267`. Size: S
- [x] **P1-A23** — done 2026-08-21 Batch 37 — DateNav prev/next arrows used `focus:*` (fires on mouse-click focus, leaves stuck-hover on touch) → promoted to `focus-visible:*`. WCAG 2.4.7. Source: same audit §2.4. Files: `next-app/src/components/workout/DateNav.tsx:31,45`. Size: S
- [x] **P1-A24** — done 2026-08-21 Batch 37 — Ghost buttons `border-line` on `hover:bg-surface-2` dropped to 2.68:1 contrast (fails 1.4.11 AA). Promoted to `border-line-strong` (3.21:1 on surface-2) across 9 SessionActions call-sites. Source: same audit §2.3. Files: `next-app/src/components/workout/SessionActions.tsx` (9 sites). Size: S
- [x] **P1-M11** — done 2026-08-21 Batch 37 — "End this program" was a bare 12px underline link with sub-44px target on graduation surface. Wrapped in a min-h-11 button-shaped hit zone with `text-red` tone so destructive action reads as one at glance. Bronze intentionally NOT used (R2: bronze is CTA-only). Source: `2026-08-21-app-mobile-ux-post-batch36.md` § persona-graduate. Files: `next-app/src/components/session/TodaySession.tsx:1214-1223`. Size: S

**Batch 28 — P2 polish + S2 concurrent-tracks close-out (deployed https://b4056901.program-v2.pages.dev, 2026-08-19):**

11 items — 10 P2 polish items across a11y, tap targets, landing hero, plus S2 concurrent-tracks audit closed via walk-through (all four scope items shipped implicitly during Batches 10-27). Full lines preserved:

- [x] **P2-21** — done 2026-08-19 Batch 28 — FirstRunBanner Close-X at `w-10 h-10` (40 px, below Apple 44). Bump to `w-11 h-11`. Source: mobile-ux-batch25 §P1 nits. Files: `next-app/src/components/FirstRunBanner.tsx`. Size: S
- [x] **P2-22** — done 2026-08-19 Batch 28 — GraduationFeedback 1-5 rating buttons at `w-9 h-9` (36 px). Bump to `w-11 h-11`. Source: mobile-ux-batch25 §P1 nits. Files: `next-app/src/app/page.tsx` (GraduationFeedback component). Size: S
- [x] **P2-23** — done 2026-08-19 Batch 28 — `<section aria-labelledby>` on `/account` four groups (Sign-in, Programs, Extensions, Data & privacy). Source: accessibility-batch25 §2.4. Files: `next-app/src/app/account/page.tsx:126, 146, 170, 203`. Size: S
- [x] **P2-24** — done 2026-08-19 Batch 28 — Week row `aria-label={dayName — expand/collapse details}` overrides visible content from SR — drop the aria-label; let visible text compute. Source: accessibility-batch25 §7 Week row. Files: `next-app/src/app/week/page.tsx:484`. Size: S
- [x] **P2-25** — done 2026-08-19 Batch 28 — `role="alert"` on `/account` delete error `<p>` + MoveSheet amber stacking warning — currently silent to SR. Source: accessibility-batch25 §6. Files: `next-app/src/app/account/page.tsx:231-234`, `next-app/src/components/workout/MoveSheet.tsx:161-166`. Size: S
- [x] **P2-26** — done 2026-08-19 Batch 28 — Route-mount focus-to-h1 (via `tabIndex={-1}` + effect) so `router.back()` restores focus somewhere useful. Not batch-specific — applies to every route. Source: accessibility-batch25 §7. Files: `next-app/src/components/AppShell.tsx`. Size: M
- [x] **P2-27** — done 2026-08-19 Batch 28 — Remove dead `role="gridcell"` on non-interactive Heatmap cells — ignored due to parent `role="img"`. Source: accessibility-batch25 §5. Files: `next-app/src/components/charts/Heatmap.tsx:183`. Size: S
- [x] **P2-28** — done 2026-08-19 Batch 28 — Verify SymptomLoadChart summary `aria-label` exists (heatmap has one, chart may not). Source: accessibility-batch25 §5. Files: `next-app/src/components/charts/SymptomLoadChart.tsx`. Size: S
- [x] **P2-29** — done 2026-08-19 Batch 28 — `/events` "Not available" — add explanatory `<p>` for context. Source: accessibility-batch25 §3. Files: `next-app/src/app/events/page.tsx`. Size: S
- [x] **P2-30** — done 2026-08-19 Batch 28 — Landing hero "strength, skill, engine" omits mobility (Overhead Mobility ships REFERENCED). Undersell — trust-safe but a marketing asset stranded. Consider adding as fourth term or rephrasing. Source: landing-alignment-batch25 §4. Files: `landing/src/i18n/dictionaries/en.ts`. Size: S
- [x] **S2** — done 2026-08-19 Batch 28 (walk-through) — Concurrent-tracks Today audit at `dev/active/concurrent-tracks-audit/plan.md` still says "half-satisfied." Batches 10-15 may have resolved implicitly. **Decision:** re-open + close, or archive? Source: `2026-08-19-open-task-list.md` (F2).

**Batch 27 — remaining P1s (deployed https://bc360eb1.program-v2.pages.dev, 2026-08-19):**

7 items — visual-craft 11px sweep across 4 button surfaces, landing citation count 92 → 126, AMBER soften Source line on SignalsStrip expanded body, exercise_id humanization via shared lib helper, Extensions vague-copy fix, /profile CLS reserve. Full lines preserved:

- [x] **P1-63** — done 2026-08-19 Batch 27 — `font-mono text-[11px] uppercase tracking-wider` button labels are now overloaded across 4 semantic jobs (legal, row-meta, button-label, active verb). Migrate the *button-label* usage to sentence-case `text-[14px] font-semibold` on GraduationCard verbs, RetestReminder CTAs, Week expanded action grid, FirstRunBanner primary. Mono-caps stays for eyebrows + pills. Source: visual-craft-batch25 §P0. Files: `next-app/src/app/page.tsx` (GraduationCard VerbRow + RetestReminder + Week actions), `next-app/src/components/FirstRunBanner.tsx`. Size: M
- [x] **P1-64** — done 2026-08-19 Batch 27 — Citation-count drift — landing hero says "92 studies", app `/evidence` shows 126 (from `citations.json`). Same voice, two different numbers. Pick the canonical count and propagate. Source: landing-alignment-batch25 §1. Files: `landing/src/i18n/dictionaries/en.ts` OR `next-app/public/data/citations.json`. Size: S
- [x] **P1-65** — done 2026-08-19 Batch 27 — AMBER soften proposal card renders without an inline `Source:` line — `proposal-citations.ts` wires `day_adjustment_soften` → Halson 2014, but persona-erratic's Today capture shows the AMBER card without the source. Render path in `ProposalCard.tsx` / `select.ts` needs verification — either the citationId isn't populated or the render is skipping the CitationRef. Source: landing-alignment-batch25 §3. Files: `next-app/src/components/workout/ProposalCard.tsx`, `next-app/src/lib/proposals/select.ts`. Size: S
- [x] **P1-66** — done 2026-08-19 Batch 27 — `exercise_id` snake_case leaks in 3 surfaces — Today proposals + Progress top lift + Report (Report handles it; use as fix model). Humanize like `humanizeMetricId` from Batch 17. Source: copy-clarity-batch25 §P1. Files: `next-app/src/components/workout/ProposalCard.tsx`, `next-app/src/app/progress/page.tsx`. Size: S
- [x] **P1-67** — done 2026-08-19 Batch 27 — `metric_id` lowercase leak in "trending well" proposal on persona-multitrack. Same fix pattern as P1-66. Source: copy-clarity-batch25 §P1. Files: `next-app/src/components/workout/ProposalCard.tsx`. Size: S
- [x] **P1-68** — done 2026-08-19 Batch 27 — `/account` Extensions row "retest window pushed" is vague — name the new date if state permits. Source: copy-clarity-batch25 §P1. Files: `next-app/src/app/account/page.tsx:180`. Size: S
- [x] **P1-69** — done 2026-08-19 Batch 27 — `/profile` micro-CLS: the programs list renders only when `manifest != null`, but `activeProgramIds.length` is known synchronously from Zustand. Reserve height via `min-h` while manifest is loading, or render the list from Zustand and lazy-fill program names. Source: motion-perf-batch25 §hot surfaces. Files: `next-app/src/app/profile/page.tsx`. Size: S

**Batch 26 — post-Batch-25 audit followup: bugs + P0s + accessibility (deployed https://dd004788.program-v2.pages.dev, 2026-08-19):**

16 items — A5-A10 real bugs (6), P0-5 + P0-6 the two carried P0s, P1-56/57/58/59/60/61/62 accessibility batch (7), plus P2-20 folded into P1-61 fix. Full lines preserved:

- [x] **A5** — done 2026-08-19 Batch 26 — FirstRunBanner still lists "Coach" in the overflow-menu enumeration — Batch 25 killed the route but this copy leftover names a tab that no longer exists. Fresh users search for it. Source: copy-clarity-batch25 §P0. Files: `next-app/src/components/FirstRunBanner.tsx:70`. Size: S
- [x] **A6** — done 2026-08-19 Batch 26 — `/coach` direct-URL hits a bare Next.js 404 — bookmark friendliness broken. Redirect to `/progress` (or soft-land with a "moved" message). Source: copy-clarity-batch25 §P0, visual-craft-batch25 §Coach kill. Files: `next-app/next.config.ts` (add redirect) or new `next-app/src/app/coach/page.tsx` stub. Size: S
- [x] **A7** — done 2026-08-19 Batch 26 — Cites strip on program preview still points to `/guide` for full bibliography — Batch 21 moved the walled-garden bibliography to `/evidence`. One-line href swap. Source: landing-alignment-batch25 §P1-2. Files: `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx:350`. Size: S
- [x] **A8** — done 2026-08-19 Batch 26 — ProposalCard renders an empty `<h3>` element when `eyebrow` prop is falsy — SR reads a phantom heading. Guard the render. Source: accessibility-batch25 §3 persona-strength. Files: `next-app/src/components/workout/ProposalCard.tsx:43-53`. Size: S
- [x] **A9** — done 2026-08-19 Batch 26 — Persona harness `tests/e2e/harness/personas.ts` still enumerates `/coach` — every persona ships 2× 404 in captures. Cosmetic in prod (persona-only), but pollutes harness logs. Remove `/coach` from the enumeration. Source: motion-perf-batch25 §Coach cleanup. Files: `next-app/tests/e2e/harness/personas.ts`. Size: S
- [x] **A10** — done 2026-08-19 Batch 26 — HeritageClusterChip surfaces "Cluster A/B/C" internal jargon + raw `metric_id` snake_case + `No explanation available.` fallback in a live code path — not visible to current personas (no seeded `retest_readings`) but reads as debug dump when it fires. Source: copy-clarity-batch25 §P0. Files: `next-app/src/components/progress/HeritageClusterChip.tsx:62-79`. Size: S
- [x] **P0-5** — done 2026-08-19 Batch 26 — ProposalStack inline cards on Today can render behind the fixed BottomNav (60 px sticky) when scrolled — the sticky action bar handles the TOP proposal but non-top inline cards still sit in the ouch zone. Mobile-UX flagged this as a carry-forward P0; needs verification of whether the sticky bar alone is sufficient, or if inline non-top proposals also need `pb-safe` reserve or in-view detection. Source: mobile-ux-batch25 §1. Files: `next-app/src/components/workout/ProposalStack.tsx`, verify at persona-recover:/, persona-graduate:/, persona-strength:/. Size: M
- [x] **P0-6** — done 2026-08-19 Batch 26 — `/report` still ships desktop layout that force-zooms on 393 px — same failure as the 2026-08-19 audit, not remediated. Report is the specialist-share surface — should render legibly on the phone the user is on when they show it to a clinician. Source: mobile-ux-batch25 §1. Files: `next-app/src/app/report/page.tsx`. Size: M
- [x] **P1-56** — done 2026-08-19 Batch 26 — No skip link on any authenticated route — WCAG 2.4.1 partial mitigation via `<main>` landmark, but non-SR keyboard users have no bypass mechanism. Add `<a href="#main-content">` in `AppShell.tsx` before the `<header>` + `id="main-content" tabIndex={-1}` on `<main>`. Source: accessibility-batch25 §2.1. Files: `next-app/src/components/AppShell.tsx:102-146`. Size: S
- [x] **P1-57** — done 2026-08-19 Batch 26 — Heading hierarchy skips h1→h3 on Today + Progress — ProposalCard + SignalCompletenessCard emit `<h3>` before the first `<h2>`. Demote both to `<h2>` (visual style is class-based, not tag-based). Source: accessibility-batch25 §2.2. Files: `next-app/src/components/workout/ProposalCard.tsx:39`, `next-app/src/components/progress/SignalCompletenessCard.tsx:114`. Size: S
- [x] **P1-58** — done 2026-08-19 Batch 26 — SignalsStrip uses `aria-expanded` without `aria-controls` — inconsistent with the Batch 24 Week-row pattern. Add `aria-controls="signals-detail"` + `id="signals-detail"` on the expanded body. Source: accessibility-batch25 §2.3. Files: `next-app/src/components/workout/SignalsStrip.tsx:234`. Size: S
- [x] **P1-59** — done 2026-08-19 Batch 26 — `text-red` on `red/20`-over-surface = 4.12:1 (fails WCAG 1.4.3 for 14 px body). Introduce `text-red-strong` (~#f28068, ~4.9:1) OR drop the /20 background and use `bg-red/10 text-red` (~5:1). Applies to arc-verdict chip + retest-metric red badges. Source: accessibility-batch25 §4. Files: `next-app/src/app/page.tsx:838`, other `bg-red/20 text-red` pairings. Size: S
- [x] **P1-60** — done 2026-08-19 Batch 26 — `--color-line` (#3a3f4a) on `bg-surface` = 1.82:1 — fails WCAG 1.4.11 for input borders. Bump toward `#4d525d` (~3.05:1) OR switch input `bg-surface` to `bg-ground` so the surface delta carries the boundary. Affected: MoveSheet reason input, SetRow, RetestLoggingSheet, `/check`, sign-in/up forms. Source: accessibility-batch25 §4. Files: `next-app/src/app/globals.css` (token) OR per-input bg swap. Size: S
- [x] **P1-61** — done 2026-08-19 Batch 26 — `/account` Undo underline `decoration-line` (1.82:1) is essentially invisible — fails WCAG 1.4.1 + 1.4.11. Swap `decoration-line` → `decoration-slate/60` (~4.6:1) OR color the text `text-slate` (8.01:1). Source: accessibility-batch25 §7 Extensions. Files: `next-app/src/app/account/page.tsx:187-194`. Size: S
- [x] **P1-62** — done 2026-08-19 Batch 26 — MoveSheet initial focus lands on the close X button (first DOM-order focusable), not on the first non-source target-day radio. Design intent is picker-first. Reorder DOM (X after radios) or explicitly focus first radio via `useEffect`. Source: accessibility-batch25 §7 MoveSheet. Files: `next-app/src/components/workout/MoveSheet.tsx`. Size: S
- [x] **P2-20** — done 2026-08-19 Batch 26 (folded into P1-61 fix) — Extensions "Undo" underline link on /account — ~55×16 hit rect. Wrap in `inline-flex items-center min-h-[44px] py-2`. Source: mobile-ux-batch25 §P1 nits. Files: `next-app/src/app/account/page.tsx:187-194`. Size: S

**Batch 25 — S1 Coach kill + F1 finish + F8 verify + F9 skill logging (deployed https://a58ee80b.program-v2.pages.dev, 2026-08-19):**

4 items — S1 Coach shelved (route + client + Profile row + Guide entry deleted); F1 extend-undo shipped as /account Extensions section + revertExtension store action; F8 already implemented at plan-generator.ts:82-103 (verified); F9 simulator now logs skill/mobility drills (was TM-only filter). Full lines preserved:

- [x] **F1** — done 2026-08-19 Batch 25 — Extend-by-N-weeks at graduation — Batch 12 shipped feedback + repeat-arc; extending an existing arc without full re-enrol is the next affordance. Source: `2026-08-19-open-task-list.md` (E1), `product-concerns-2026-08-17/roadmap.md`. Files: graduation flow, `GraduationCard.tsx`. Size: M
- [x] **F8** — done 2026-08-19 Batch 25 — CSM amber-week drop-4×4 hook — engine consumer for a rule already documented in `concurrent-strength-maintenance.json`. Founder-decision whether to ship for first CSM paid user or defer. Source: `2026-08-19-open-task-list.md` (E8). Files: engine adapt path, CSM program JSON. Size: M
- [x] **F9** — done 2026-08-19 Batch 25 — Skill/mobility exercise logging in simulator — blocks adaptation verification for handstand-walk + overhead-mobility retest windows. Source: `2026-08-19-open-task-list.md` (E9). Files: persona harness, simulator matrix. Size: M
- [x] **S1** — done 2026-08-19 Batch 25 — F3 Coach chat still shows "~1 week to productionize" but Coach is env-var-gated OFF and hidden from primary IA (`9eba1fa`). Drifting toward "quietly killed." **Decision:** ship it or explicitly kill it? Source: `2026-08-19-open-task-list.md` (F1), `product-concerns-2026-08-17/roadmap.md`.

**Batch 24 — Week MoveSheet + retest-window (deployed https://3504d030.program-v2.pages.dev, 2026-08-19):**

2 items — F6 full Week expanded state with 3-verb action grid + MoveSheet bottom sheet, and F10 retest-window Monday hand-off with Log retest / Not this week dismiss. Full lines preserved:

- [x] **F6** — done 2026-08-19 Batch 24 — Runna-style Week collapse+expand full impl — Batch 15 shipped collapse-by-default; expanded state, Move-sheet, per-row `Open in Today / Move… / Skip` verbs still open. Source: `2026-08-19-open-task-list.md` (E6). Files: `next-app/src/app/week/page.tsx`, new `MoveSheet.tsx`. Size: L
- [x] **F10** — done 2026-08-19 Batch 24 — Retest-window Monday hand-off — F5 partial shipped the 4-verb graduation stack; the remaining bit is the "you're at the end of block" state on Today (Monday of retest window) with `[ Log retest → ]` + `[ Not this week ]` dismiss. Extend `RetestReminder` at `page.tsx:1047-1088`. Source: `dev/audits/app/2026-08-19-design-brief-features.md` §F5 first sketch. Files: `next-app/src/app/page.tsx:1047-1088`. Size: S

**Batch 23 — hand-off co-ship: F2 + F5 partial + F7 (deployed https://49a8a7d9.program-v2.pages.dev, 2026-08-19):**

3 items — first-run banner primary CTA, retest hand-off 4-verb refactor + Extend/Pause store actions + Profile pause pill, `/account` deep-link route with Delete relocated. Full lines preserved:

- [x] **F2** — done 2026-08-19 Batch 23 — First-run tutorial overlay on Today — carried from Phase 4 SaaS-launch tasks; skippable, one-shot. Source: `2026-08-19-open-task-list.md` (E2). Files: Today shell, new component. Size: M
- [x] **F5** — done 2026-08-19 Batch 23 — Retest-week UX polish — HERITAGE Phase 5 shipped scheduler; "you're at the end" state + post-retest actions (extend / switch / take break / graduate) still need tightening. Source: `2026-08-19-open-task-list.md` (E5). Files: retest flow, Progress. Size: M
- [x] **F7** — done 2026-08-19 Batch 23 — `/account` deep-link route so Delete has a real home — Batch 16 removed Delete from Profile footer equal-weight row; identity-chip-tap destination `/account` is the proper home. Source: `2026-08-19-open-task-list.md` (E7). Files: new `next-app/src/app/account/page.tsx`. Size: S

**Design-lead brief + harness rerun (2026-08-19):**
- [x] **X1** — done 2026-08-19 — product-design-lead brief for F2 + F5 + F6 + F7 delivered at `dev/audits/app/2026-08-19-design-brief-features.md` (493 lines). First dispatch hit a usage-limit anomaly; retry after reset succeeded. Brief recommends **Batch 23** (F2 + F5 partial + F7 co-ship, 7-8h) then **Batch 24** (F6 MoveSheet + F5 retest-window, 10-12h) then **Batch 25** (F1 extend hook into `/account`).
- [x] **A4** — done 2026-08-19 Batch 22 harness rerun — 15/15 personas passed against https://app.terav.fit; artifacts now reflect post-Batch-22 state.

**Batch 22 — mechanical F items (deployed https://4ea779c6.program-v2.pages.dev, 2026-08-19):**

2 items — the trivial ships from Section E. Full lines preserved:

- [x] **F3** — done 2026-08-19 Batch 22 — Switch-program flow warning — Phase 2 catalog UI gap; multi-program is live, but "switch primary" confirmation is missing. Source: `2026-08-19-open-task-list.md` (E3). Files: Profile programs list + ConfirmSheet. Size: S
- [x] **F4** — done 2026-08-19 Batch 22 — Sort catalog by difficulty/duration — filter shipped, sort didn't. Source: `2026-08-19-open-task-list.md` (E4). Files: `next-app/src/app/programs/page.tsx`. Size: S

**Batch 21 — landing→app + P2 polish (deployed https://286e37f1.program-v2.pages.dev, 2026-08-19):**

23 items — remaining P1 landing-alignment (P1-52..55) + full P2 batch (P2-1..19). Full lines preserved:

- [x] **P1-52** — done 2026-08-19 Batch 21 — Match "three domains" hero label to app's actual 5-category taxonomy (or vice-versa). Landing says "Aerobic / Concurrent / Skill"; app says 5 category chips. Source: `2026-08-17-app-audit-landing-alignment.md` §2 row 3, §6. Files: `landing/src/i18n/dictionaries/en.ts`, `next-app/public/data/programs/manifest.json`. Size: S
- [x] **P1-53** — done 2026-08-19 Batch 21 — Surface each program's cited studies in the app program card (landing shows "Cites: Helgerud 2007 · Seiler 2010"; app doesn't). Data lives in program JSONs — rendering gap only. Source: `2026-08-17-app-audit-landing-alignment.md` §6, row 17. Files: `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx`, `programs/page.tsx`. Size: M
- [x] **P1-54** — done 2026-08-19 Batch 21 — Wire an in-app Evidence link — Guide lists studies in prose; a dedicated `/evidence` inside the app honours landing's evidence claim inside the walled garden. Source: `2026-08-17-app-audit-landing-alignment.md` §6. Files: `next-app/src/app/evidence/page.tsx` (new). Size: M
- [x] **P1-55** — done 2026-08-19 Batch 21 — Unify intake experience — hip program's 3-question modal is a different beast than the 17-step wizard. Either promote hip to wizard or the landing "under ten minutes" claim doesn't apply uniformly. Source: `2026-08-17-app-audit-landing-alignment.md` §6. Files: hip intake flow, `IntakeClient.tsx`. Size: L
- [x] **P2-1** — done 2026-08-19 Batch 21 — `overscroll-behavior-y: contain` on `<main>` to disable Safari pull-to-refresh on Today. Source: `2026-08-19-open-task-list.md` (D1). Files: `next-app/src/app/globals.css`. Size: S
- [x] **P2-2** — done 2026-08-19 Batch 21 — Sticky Save-check button on `/check/` above the bottom nav. Source: `2026-08-19-open-task-list.md` (D2). Files: `next-app/src/app/check/page.tsx`. Size: S
- [x] **P2-3** — done 2026-08-19 Batch 21 — Heatmap disabled-cell guard for future/empty dates. Source: `2026-08-19-open-task-list.md` (D3). Files: `next-app/src/components/charts/Heatmap.tsx`. Size: S
- [x] **P2-4** — done 2026-08-19 Batch 21 — Report table mobile fallback confirmation. Source: `2026-08-19-open-task-list.md` (D4). Files: `next-app/src/app/report/page.tsx`. Size: S
- [x] **P2-5** — done 2026-08-19 Batch 21 — `enableInp: true` on Sentry traces for free real-user INP signal. Source: `2026-08-19-open-task-list.md` (D5). Files: `next-app/src/sentry.client.config.ts`. Size: S
- [x] **P2-6** — done 2026-08-19 Batch 21 — Memoise `rows` derivation in `SymptomLoadChart:57-63` — 3-line `useMemo`. Source: `2026-08-19-open-task-list.md` (D6). Files: `next-app/src/components/charts/SymptomLoadChart.tsx:57-63`. Size: S
- [x] **P2-7** — done 2026-08-19 Batch 21 — `content-visibility: auto` on below-fold Today sections (RetestReminder, PerProgramActions, week-block). Source: `2026-08-19-open-task-list.md` (D7). Files: `next-app/src/app/page.tsx`. Size: S
- [x] **P2-8** — done 2026-08-19 Batch 21 — `beforeinstallprompt` handler — capture, offer custom "Add to Home Screen" from Profile after 3+ Today visits. Do NOT auto-prompt. Source: `2026-08-19-open-task-list.md` (D8), `2026-08-18-motion-perf-sweep.md` §6. Files: `next-app/src/app/profile/page.tsx`, PWA glue. Size: M
- [x] **P2-9** — done 2026-08-19 Batch 21 — Watch Week per-day cumulative expand shifts — add `content-visibility: auto` on off-screen day rows if CLS regresses. Source: `2026-08-19-open-task-list.md` (D9). Files: `next-app/src/app/week/page.tsx`. Size: S
- [x] **P2-10** — done 2026-08-19 Batch 21 — `ExerciseCard` padding standardization — pick per-child `px-3` OR outer `p-3`, not both. Source: `2026-08-19-open-task-list.md` (D10). Files: `next-app/src/components/workout/ExerciseCard.tsx`. Size: S
- [x] **P2-11** — done 2026-08-19 Batch 21 — Programs list row `px-3 py-3` → `px-4 py-3.5` (aligns to Week card rhythm post-Batch-16). Source: `2026-08-19-open-task-list.md` (D11). Files: `next-app/src/app/programs/page.tsx`. Size: S
- [x] **P2-12** — done 2026-08-19 Batch 21 — Heatmap cell `rounded-[2px]` (GitHub-tier polish). Source: `2026-08-19-open-task-list.md` (D13). Files: `next-app/src/components/charts/Heatmap.tsx`. Size: S
- [x] **P2-13** — done 2026-08-19 Batch 21 — `SymptomLoadChart` grid color `#2A2E37` → `--color-line-soft` (`#24272f`) — one rogue hex. Source: `2026-08-19-open-task-list.md` (D14). Files: `next-app/src/components/charts/SymptomLoadChart.tsx`. Size: S
- [x] **P2-14** — done 2026-08-19 Batch 21 — SymptomLoadChart data-table expander — restore `<details><summary>Data table</summary>` fallback for sighted keyboard users. Source: `2026-08-18-accessibility-sweep.md` §5, §8. Files: `next-app/src/components/charts/SymptomLoadChart.tsx:159-162`. Size: S
- [x] **P2-15** — done 2026-08-19 Batch 21 — Coach message list — add `role="log" aria-live="polite" aria-atomic="false"`. Source: `2026-08-18-accessibility-sweep.md` §3. Files: `next-app/src/app/coach/page.tsx:283`. Size: S
- [x] **P2-16** — done 2026-08-19 Batch 21 — InfoSheet close glyph — swap ASCII `×` for lucide `<X size={18} />` to match ConfirmSheet. Source: `2026-08-18-accessibility-sweep.md` §2.3. Files: `next-app/src/components/InfoSheet.tsx:43-50`. Size: S
- [x] **P2-17** — done 2026-08-19 Batch 21 — Intake `aria-live="polite"` on the whole step body — over-broad. Scope to the step-counter. Source: `2026-08-18-accessibility-sweep.md` §3. Files: `next-app/src/app/programs/[slug]/intake/IntakeClient.tsx:746`. Size: S
- [x] **P2-18** — done 2026-08-19 Batch 21 — RetestLoggingSheet "Log reading" primary disable while `value === ""`. Source: `2026-08-18-accessibility-sweep.md` §6, §8. Files: `next-app/src/components/workout/RetestLoggingSheet.tsx:138-144`. Size: S
- [x] **P2-19** — done 2026-08-19 Batch 21 — HSW physical-test range labels — swap word order so bodily description leads (`Barely bends back — under 45°`), applies to 4 wrist + 4 shoulder ranges. Also `Passes behind vertical without effort` (drop "hyper-mobile"). Skip button `Skip all physical tests →` → `Skip physical tests →`. Source: `2026-08-18-app-audit-copy-clarity.md` §5, §9 P2. Files: `next-app/public/data/programs/handstand-walk.json:376-427`, `IntakeClient.tsx:1246-1248,1282`. Size: S

**Batch 20 — motion+perf + visual craft (deployed https://f5ed595d.program-v2.pages.dev, 2026-08-19):**

14 items — motion+perf (P1-19..26) + visual craft (P1-27..32). Full lines preserved:

- [x] **P1-19** — done 2026-08-19 Batch 20 — Coach caret needs `motion-safe:animate-pulse` — unguarded Tailwind `animate-pulse`. Source: `2026-08-19-open-task-list.md` (C8), `2026-08-18-motion-perf-sweep.md` §2. Files: `next-app/src/app/coach/page.tsx:404`. Size: S
- [x] **P1-20** — done 2026-08-19 Batch 20 — Profile skeleton `motion-safe:animate-pulse`. Same class of gap. Source: `2026-08-19-open-task-list.md` (C9). Files: `next-app/src/app/profile/page.tsx:161`. Size: S
- [x] **P1-21** — done 2026-08-19 Batch 20 — RestTimer `transition-[width]` + `motion-reduce:transition-none` (currently `transition-all duration-500`). Source: `2026-08-19-open-task-list.md` (C10). Files: `next-app/src/components/workout/RestTimer.tsx:70`. Size: S
- [x] **P1-22** — done 2026-08-19 Batch 20 — Coach smooth-scroll — read `prefers-reduced-motion` before setting `behavior: "smooth"`. Source: `2026-08-19-open-task-list.md` (C11). Files: `next-app/src/app/coach/page.tsx:193`. Size: S
- [x] **P1-23** — done 2026-08-19 Batch 20 — Sentry Feedback widget position — floats over BottomNav on iPhone. Either `{ autoInject: false }` + mount from Profile, or reposition. Source: `2026-08-19-open-task-list.md` (C12), `2026-08-18-motion-perf-sweep.md` §5. Files: `next-app/src/sentry.client.config.ts:47`. Size: S
- [x] **P1-24** — done 2026-08-19 Batch 20 — Drop `tracesSampleRate: 0.1` → `0.05` in prod — will burn free tier at beta scale. Source: `2026-08-19-open-task-list.md` (C13), `2026-08-18-motion-perf-sweep.md` §5. Files: `next-app/src/sentry.client.config.ts`. Size: S
- [x] **P1-25** — done 2026-08-19 Batch 20 — Lucide-react tree-shake verify — chunk `598-*` is suspiciously large. Run `next build --profile` before Batch 17. Source: `2026-08-19-open-task-list.md` (C14), `2026-08-18-motion-perf-sweep.md` §4. Files: `next-app/package.json`, bundle. Size: S
- [x] **P1-26** — done 2026-08-19 Batch 20 — next/font weight explosion — no `weight: [...]` on Inter or JetBrains Mono → 13 woff2 files, ~305 KB. Set `weight: ["400","500","600"]` + `["400"]`. Cuts to ~90-110 KB. Source: `2026-08-18-motion-perf-sweep.md` §4. Files: `next-app/src/app/layout.tsx:11-21`. Size: S
- [x] **P1-27** — done 2026-08-19 Batch 20 — Rehab safety copy at 13-muted is wrong — bump to 14 px minimum regardless of P0-4 sweep. Applies to skill safety, interference, taper blocks. Source: `2026-08-19-open-task-list.md` (C15). Files: `next-app/src/app/page.tsx:315-321, 299-307, 267-273`. Size: S
- [x] **P1-28** — done 2026-08-19 Batch 20 — Icon size sprawl → 4 sizes. Kill 15 px, bump to 16 in ExerciseCard and RunSlotCard. Source: `2026-08-19-open-task-list.md` (C16), `2026-08-19-app-audit-visual-craft.md`. Files: `ExerciseCard.tsx:209,222,224`, `RunSlotCard.tsx:256`. Size: S
- [x] **P1-29** — done 2026-08-19 Batch 20 — Slate demotion on non-interactive left-borders — `border-l-slate` on DayHeaderShortcut and RestDayCard variants → `border-l-line`. Slate reserves for interactive/marker roles. Source: `2026-08-19-open-task-list.md` (C17). Files: `next-app/src/app/page.tsx:538,999,1023,1033`. Size: S
- [x] **P1-30** — done 2026-08-19 Batch 20 — Kill `text-muted/70` (6 usages). Two muted levels max; currently three. Source: `2026-08-19-open-task-list.md` (C18). Files: 6 cross-cutting sites. Size: S
- [x] **P1-31** — done 2026-08-19 Batch 20 — Profile body-copy size collision — `text-sm` and `text-[14px]` used side-by-side for the same role. Delete `text-[14px]` in `profile/page.tsx`, use `text-sm` uniformly. Source: `2026-08-18-profile-visual-craft.md` P0-1. Files: `next-app/src/app/profile/page.tsx:140,181,214,225`. Size: S
- [x] **P1-32** — done 2026-08-19 Batch 20 — Profile card frame weight — Programs list + "More" nav use `border-line-soft` with no `bg-surface`, so containers read one z-layer below Progress/Today cards. Promote to `border-line-soft bg-surface`. Source: `2026-08-18-profile-visual-craft.md` P0-2. Files: `next-app/src/app/profile/page.tsx:171,208`. Size: S

**Batch 19 — mobile UX (deployed https://082ef16e.program-v2.pages.dev, 2026-08-19):**

11 items — mobile-UX batch (P1-8 through P1-18). Full lines preserved:

- [x] **P1-8** — done 2026-08-19 Batch 19 — Bottom-nav active-tab indicator — add 4-px top-border in `bg-bronze` on active `<li>` (currently color + weight only). WCAG 1.4.1 + peripheral-vision affordance. Source: `2026-08-19-open-task-list.md` (C1), `2026-08-19-app-audit-mobile-ux.md` §2.3. Files: `next-app/src/components/nav/BottomNav.tsx:57-59`. Size: S
- [x] **P1-9** — done 2026-08-19 Batch 19 — `HeaderQuickLinks` More button `w-9 h-9` (36 px) → `w-11 h-11` (44 px). Apple 44. Source: `2026-08-19-open-task-list.md` (C2), `2026-08-18-mobile-ux-sweep.md` §2.2. Files: `next-app/src/components/nav/HeaderQuickLinks.tsx:73`. Size: S
- [x] **P1-10** — done 2026-08-19 Batch 19 — Session-row icon buttons `w-8-9` → `w-11 h-11` across YourPlanCard, RunSlotCard, RestTimer (7+ sites). Apple 44. Source: `2026-08-19-open-task-list.md` (C3), `2026-08-18-mobile-ux-sweep.md` §2.2. Files: `YourPlanCard.tsx:84`, `RunSlotCard.tsx:254,303`, `RestTimer.tsx:85,103,114`. Size: M
- [x] **P1-11** — done 2026-08-19 Batch 19 — RunSlotCard "Log session" / "Import GPX" links are `text-[13px]` with no min-height (~20px tall). Only extras entry point on 4/5 programs. Add `min-h-[44px] py-2`. Source: `2026-08-18-mobile-ux-sweep.md` §2.3. Files: `next-app/src/components/workout/RunSlotCard.tsx:578-593`. Size: S
- [x] **P1-12** — done 2026-08-19 Batch 19 — Heatmap cell min 44px OR reduce to 6 columns for thumb-tappability (currently 32px, 8 cols). Source: `2026-08-19-open-task-list.md` (C4), `2026-08-18-mobile-ux-sweep.md` §2.5. Files: `next-app/src/components/charts/Heatmap.tsx:135`. Size: M
- [x] **P1-13** — done 2026-08-19 Batch 19 — Week collapsed-row expand affordance — chevron on collapsed day rows; currently discoverable only by trying. Source: `2026-08-19-open-task-list.md` (C5). Files: `next-app/src/app/week/page.tsx`. Size: S
- [x] **P1-14** — done 2026-08-19 Batch 19 — Legal-row link `min-h-[44px]` enforcement on Profile footer (post-Batch 16 collapse). Currently ~16px hits; wrap inline links in `inline-flex items-center min-h-[44px] py-2`. Source: `2026-08-19-open-task-list.md` (C6), `2026-08-18-profile-mobile-ux.md` P0.1. Files: `next-app/src/app/profile/page.tsx:250-272`. Size: S
- [x] **P1-15** — done 2026-08-19 Batch 19 — Add `active:` / `focus-visible:` twins to top 20 `hover:` sites, or ship a `.tap-feedback` utility. 174 `hover:` app-wide, only 1 has a focus/active twin. iOS sticky-hover on first-tap. Source: `2026-08-19-open-task-list.md` (C7), `2026-08-18-mobile-ux-sweep.md` §2.1. Files: cross-cutting (`src/**`). Size: M
- [x] **P1-16** — done 2026-08-19 Batch 19 — Profile row residual `hover:` states — switch to `active:` on nav rows so iOS doesn't leave rows tinted after tap. Source: `2026-08-18-profile-mobile-ux.md` P1.2. Files: `next-app/src/app/profile/page.tsx:212,223,250,258,269`. Size: S
- [x] **P1-17** — done 2026-08-19 Batch 19 — ConfirmSheet body scroll lock on iOS Safari — page scroll behind the sheet is still active; rubber-band shifts the underlying Profile page. Add `document.body.style.overflow = 'hidden'` on open + `overscroll-behavior: contain`. Source: `2026-08-18-profile-mobile-ux.md` P1.4. Files: `next-app/src/components/ConfirmSheet.tsx:59-70`. Size: S
- [x] **P1-18** — done 2026-08-19 Batch 19 — ConfirmSheet close-X `-m-2` collides with wrapped-title baseline — tapping last character of a wrapped title cancels the sheet. Remove `-m-2`; add `pr-11` to title container. Source: `2026-08-18-profile-mobile-ux.md` P1.5. Files: `next-app/src/components/ConfirmSheet.tsx:75-82`. Size: S

**Batch 18 — accessibility (deployed https://8e41fcd2.program-v2.pages.dev, 2026-08-19):**

7 items — the natural a11y batch (P1-1 through P1-7). Full lines preserved:

- [x] **P1-1** — done 2026-08-19 Batch 18 — Coach `<textarea>` has no accessible name — 4.1.2 / 3.3.2 P0 in the a11y sweep. Add `aria-label="Message coach"`. Source: `2026-08-18-accessibility-sweep.md` §3, `2026-08-17-app-audit-accessibility.md` §2.10. Files: `next-app/src/app/coach/page.tsx:309`. Size: S *(carried from 2026-08-17)*
- [x] **P1-2** — done 2026-08-19 Batch 18 — SetRow placeholder `text-line` (1.66:1) doubles as the prescription hint — 1.4.3 + 1.3.3 fail. `placeholder:text-line` → `placeholder:text-muted` + add `aria-describedby` sr-only prescription. Source: `2026-08-18-accessibility-sweep.md` §2.1, `2026-08-17-app-audit-accessibility.md` §2.8. Files: `next-app/src/components/workout/SetRow.tsx:73,95`. Size: S *(carried from 2026-08-17)*
- [x] **P1-3** — done 2026-08-19 Batch 18 — SliderRow visible `<label>` at `check/page.tsx:219` lacks `htmlFor` — mouse-tap on the word "Groin" doesn't focus the slider. 4.1.2. Add `htmlFor` or nest the input. Source: `2026-08-18-accessibility-sweep.md` §3, `2026-08-17-app-audit-accessibility.md` §6. Files: `next-app/src/app/check/page.tsx:219`. Size: S
- [x] **P1-4** — done 2026-08-19 Batch 18 — Today (`page.tsx:181`) and Profile (`profile/page.tsx:178`) h1s should be visible for parity with Coach/Week/Progress/History/Check. 2.4.6. Promote `sr-only` → visible `text-3xl` (or the ramp head token). Source: `2026-08-18-accessibility-sweep.md` §2.2. Files: `next-app/src/app/page.tsx:181`, `next-app/src/app/profile/page.tsx:178`. Size: S
- [x] **P1-5** — done 2026-08-19 Batch 18 — Events form (6 inputs), auth forms (sign-in / sign-up / reset-password — 6 inputs) — no `<label htmlFor>`. 4.1.2. Add. Source: `2026-08-18-accessibility-sweep.md` §3,6. Files: `next-app/src/app/events/page.tsx:111,119,134,146,157,168`, `next-app/src/app/(auth)/sign-in/page.tsx:147,158`, `(auth)/sign-up/page.tsx:167,181`, `reset-password/page.tsx:87,99`. Size: M
- [x] **P1-6** — done 2026-08-19 Batch 18 — Heatmap row headers (`Heatmap.tsx:135-144`) are `<span aria-hidden>` while wrapper has `role="grid"` — no row-header context for SR. Replace with `role="rowheader"` or drop the grid role. 1.3.1. Source: `2026-08-18-accessibility-sweep.md` §3. Files: `next-app/src/components/charts/Heatmap.tsx:135-144`. Size: S
- [x] **P1-7** — done 2026-08-19 Batch 18 — RestTimer `role="status" aria-live="polite"` wraps the per-second countdown — SR gets "1:30… 1:29…" 90×. Remove the outer live region; fire single `announce()` calls at start / 30s / 0. 4.1.3. Source: `2026-08-18-accessibility-sweep.md` §2.4. Files: `next-app/src/components/workout/RestTimer.tsx:60-64`. Size: S

**Batch 17 (deployed https://6a6ac147.program-v2.pages.dev, 2026-08-19):**

26 items — A + P0 + full copy batch. Full lines preserved for audit history:

- [x] **A1** — done 2026-08-19 Batch 17 — `text-bronze-hi` on Profile avatar initial is an undefined token; renders as inherited `text-ink`. Define `--color-bronze-hi` (target `#e2b686`) in `globals.css` or delete the class. Source: `2026-08-19-open-task-list.md` (A1). Files: `next-app/src/app/profile/page.tsx:154`. Size: S
- [x] **A2** — done 2026-08-19 Batch 17 — `text-amber-strong` on interference banner heading — same undefined-token bug. Target `#f0b854`, or drop the class. Source: `2026-08-19-open-task-list.md` (A2). Files: `next-app/src/app/page.tsx:386`. Size: S
- [x] **A3** — done 2026-08-19 Batch 17 — `PerProgramAdherenceCard` tri-color bar leaks a purple segment (likely `--color-lat-right` reused outside laterality). Remove or document the semantic. Source: `2026-08-19-open-task-list.md` (A3). Files: `next-app/src/components/PerProgramAdherenceCard.tsx`. Size: S
- [x] **P0-1** — done 2026-08-19 Batch 17 — Reposition coach-proposal Accept/Ignore out of the ouch zone (~y=420 on 393×852). Sticky bottom-of-viewport action row above the nav for the active proposal's Accept/Ignore — Terav's most differentiated surface must land in the thumb zone. Source: `2026-08-19-app-audit-mobile-ux.md` §2.1. Files: `next-app/src/components/workout/ProposalCard.tsx:236-251`. Size: M *(prev B1)*
- [x] **P0-2** — done 2026-08-19 Batch 17 — Lazy-import Sentry Replay + Feedback — eager `import * as Sentry` at `sentry.client.config.ts:19` ships ~100 KB gz whether DSN is set or not. Wrap in `if (DSN) { const Sentry = await import(...) }`. Projected Today LCP delta on 4G cold: **-500-800 ms** (2.6s → 1.9-2.1s). Source: `2026-08-19-open-task-list.md` (B2), `2026-08-18-motion-perf-sweep.md` §5. Files: `next-app/src/sentry.client.config.ts:19,47,59`. Size: M *(carried from 2026-08-18)*
- [x] **P0-3** — done 2026-08-19 Batch 17 — ProposalStack CLS reserve on Today. `ProposalStack.tsx:28` returns `null` before `syncStable`, pushes HeroStateCard down when mounted. Fix: `<div className="min-h-[120px]">` while `!syncStable` or a tinted skeleton. Projected CLS 0.08-0.15 → 0.00-0.02. Source: `2026-08-19-open-task-list.md` (B3), `2026-08-18-motion-perf-sweep.md` §3. Files: `next-app/src/components/workout/ProposalStack.tsx:28`. Size: S *(carried from 2026-08-18)*
- [x] **P0-4** — done 2026-08-19 Batch 17 — Bump body copy `text-[13px]` → `text-[14px]` system-wide (176-212 hits in `src/`). Largest legibility gain remaining for a rehab app read at 6am. Also `text-[11px]` → `text-[12px]` on multi-line captions; kill `text-[9px]`. One `sed`-driven batch. Target ramp: 32/20/15/14/12/10. Source: `2026-08-19-open-task-list.md` (B4), `2026-08-18-app-audit-visual-craft.md` P0-2. Files: `src/**/*.tsx`. Size: M *(carried from 2026-08-18)*
- [x] **P1-33** — done 2026-08-19 Batch 17 — "HERITAGE" leaks into ProposalCard eyebrow — internal codename in a user-facing string. `Signal · HERITAGE non-responder pattern` → `Signal · not responding to current dose`. Source: `2026-08-18-app-audit-copy-clarity.md` §9 P0. Files: `next-app/src/components/workout/ProposalCard.tsx:320`. Size: S
- [x] **P1-34** — done 2026-08-19 Batch 17 — Cluster A/B/C chip labels — clinical prefix, drop to `Responding` / `Under-dosing` / `Not responding`. Cluster nomenclature moves to tooltip. Source: `2026-08-18-app-audit-copy-clarity.md` §3. Files: `next-app/src/components/HeritageClusterChip.tsx:60-66`. Size: S
- [x] **P1-35** — done 2026-08-19 Batch 17 — "Idempotent — resubmitting today overwrites, not duplicates" — engineering vocabulary. Rewrite: `Re-submitting today updates this entry — it won't duplicate.` Source: `2026-08-18-app-audit-copy-clarity.md` §4. Files: `next-app/src/components/workout/RetestLoggingSheet.tsx:73-76`. Size: S
- [x] **P1-36** — done 2026-08-19 Batch 17 — `Got it` accept verb on `non_responder_recommendation` breaks the accept-verb family (Apply/Advance/Log). Rewrite: `Acknowledge` or `See options`. Source: `2026-08-18-app-audit-copy-clarity.md` §2. Files: `next-app/src/components/workout/ProposalCard.tsx:342`. Size: S
- [x] **P1-37** — done 2026-08-19 Batch 17 — Citation IDs on `day_adjustment_soften` and `retest_due` proposals — engine paths don't populate `citationId` for these two kinds. Landing's "every change cites a study" claim still leaks unless engine wires them up. Source: `2026-08-18-app-audit-copy-clarity.md` §0, §9 (carryover from 2026-08-17). Files: engine adapt paths, `proposal-citations.ts`. Size: M
- [x] **P1-38** — done 2026-08-19 Batch 17 — Empty-state CTA on Profile — `Pick a program →` → `Pick your focus →`. Matches landing's `beta.cta_primary`. Source: `2026-08-18-profile-copy-clarity.md` §1. Files: `next-app/src/app/profile/page.tsx:204`. Size: S
- [x] **P1-39** — done 2026-08-19 Batch 17 — Delete-account body — 31-word comma-list. Rewrite: `Everything goes — logs, training maxes, morning checks, server copies. This cannot be undone.` (14 words). Source: `2026-08-18-profile-copy-clarity.md` §2. Files: `next-app/src/app/profile/page.tsx:293`. Size: S
- [x] **P1-40** — done 2026-08-19 Batch 17 — Per-metric verdict debug-dump on `non_responder_recommendation` — humanize metric names, drop `role`, map underscore-verdicts to phrases (`true_non_response` → `not responding`). Source: `2026-08-18-app-audit-copy-clarity.md` §2, §9 P1. Files: `next-app/src/components/workout/ProposalCard.tsx:184-195`. Size: S
- [x] **P1-41** — done 2026-08-19 Batch 17 — "compliance" in RetestLoggingSheet reads coach-speak. Label → `How closely did you hit the prescribed intensity? (optional)`. Placeholder → `e.g. 90 (you hit ~90% of the prescribed intensity). Blank = skip.` Source: `2026-08-18-app-audit-copy-clarity.md` §4, §9 P1. Files: `next-app/src/components/workout/RetestLoggingSheet.tsx:99-101,112`. Size: S
- [x] **P1-42** — done 2026-08-19 Batch 17 — WeeklyNarrativeTile expanded disclosure — double-header collision. In `inline` mode, drop `SignalCompletenessCard`'s "The engine sees" eyebrow; rename "Would additionally use" → `To sharpen more, add:`. Source: `2026-08-18-app-audit-copy-clarity.md` §6. Files: `next-app/src/components/SignalCompletenessCard.tsx:45-47,61-63`. Size: S
- [x] **P1-43** — done 2026-08-19 Batch 17 — Milestone header edge cases — no-TM state reads `TM —`; missed-milestone collides two parenthetical shapes; `🎉` emoji reads gamified. Rewrite: `No TM yet · next 140 kg in 40d`; `— missed Nd ago`; drop emoji. Source: `2026-08-18-app-audit-copy-clarity.md` §7. Files: `next-app/src/app/progress/page.tsx:409-425`. Size: S
- [x] **P1-44** — done 2026-08-19 Batch 17 — `retest_due` sub-line — `logging {metric}` is present-participle gerund. Change to `log {metric}`. Source: `2026-08-18-app-audit-copy-clarity.md` §2. Files: `next-app/src/components/workout/ProposalCard.tsx:178-181`. Size: S
- [x] **P1-45** — done 2026-08-19 Batch 17 — muscle-up short_description — drop the "reuses pull-up + handstand drill libraries" sentence (engineering-facing). Source: `2026-08-18-app-audit-copy-clarity.md` §8. Files: `next-app/public/data/programs/muscle-up.json`. Size: S
- [x] **P1-46** — done 2026-08-19 Batch 17 — engine-builder-block-2 short_description — 47 words with 3 technical concepts. Trim to first ~20 words for the catalog card; keep detail on program-detail page. Source: `2026-08-18-app-audit-copy-clarity.md` §8. Files: `next-app/public/data/programs/engine-builder-block-2.json`. Size: S
- [x] **P1-47** — done 2026-08-19 Batch 17 — `admin` badge label — internal word exposed. Change label to `staff`; tooltip drops "unlocked" gaming verb. Source: `2026-08-18-profile-copy-clarity.md` §3. Files: `next-app/src/app/profile/page.tsx:151`. Size: S
- [x] **P1-48** — done 2026-08-19 Batch 17 — `primary` badge — database-column noun leaking into UI. Change to `driving today` (or short `today's`). Source: `2026-08-18-profile-copy-clarity.md` §4. Files: `next-app/src/app/profile/page.tsx:185`. Size: S
- [x] **P1-49** — done 2026-08-19 Batch 17 — `since Aug 2025` — no verb, reads debug. Change to `joined Aug 2025`. Source: `2026-08-18-profile-copy-clarity.md` §5. Files: `next-app/src/app/profile/page.tsx:156`. Size: S
- [x] **P1-50** — done 2026-08-19 Batch 17 — `How this app works` nav label — dev language. Change to `Guide` (matches route + H1). Source: `2026-08-18-profile-copy-clarity.md` §6. Files: `next-app/src/app/profile/page.tsx:227`. Size: S
- [x] **P1-51** — done 2026-08-19 Batch 17 — Sign-out ConfirmSheet body — em-dash flourish reads over-warm. Rewrite: `Your data is synced. Sign in from any device to pick back up.` Source: `2026-08-18-profile-copy-clarity.md` §7. Files: `next-app/src/app/profile/page.tsx:282`. Size: S

- ~~Profile identity chip on the top row~~
- ~~Profile footer collapse with Danger-zone disclosure~~
- ~~Week padding + Programs pill moved off header~~
- ~~32-px H1s (GOWOD-scale visual system)~~

**post-audit-p0s/tasks.md — shipped 2026-08-17 / 2026-08-18:**
- ~~A1 Overperformer engine bump (`evaluateOverperformer` at `adapt.ts:395`)~~
- ~~A2 Study citations on proposals (`CitationRef` component + `proposal.citationId`)~~
- ~~A3 Rehab absent from catalog — softened via landing hero rewrite~~
- ~~A4 Evidence claim shortfall — landing softened to "88 primary studies"~~
- ~~A5 Accept/Ignore visibility at rest (SignalsStrip → ProposalStack rebuild)~~
- ~~A6 "Two more in build" → "Three more"~~
- ~~A9 Non-academic citations in engine-builder — 3 refs removed~~
- ~~A10 Handstand-walk citations — not-a-bug (audit misread ref shape)~~
- ~~B1 StreakChip removed (contradicted "Not a streak game")~~
- ~~B2 History spam of empty days — filter applied~~
- ~~B3 Program-agnostic onboarding — OnboardingRunner reads `program.onboarding_steps[]`~~
- ~~B4 Coach dead surface — flagged `superAdminOnly: true` in HeaderQuickLinks~~
- ~~C1 `user-scalable=no` removed~~
- ~~C2 Focus ring `bronze/40` → solid bronze (21 form sites)~~
- ~~C3 `border-line` bumped from `#2a2e37` → `#3a3f4a` (partial; 1.87:1)~~
- ~~C4 Today `<h1 className="sr-only">Today</h1>` added~~
- ~~C5 Profile `<h1 className="sr-only">Profile</h1>` added~~
- ~~C6 Shell-level `aria-live` region + `announce()` helper wired to Accept handlers~~
- ~~C7 SymptomLoadChart wrapped in `<div role="img" aria-label>` + data-table fallback (fallback deleted later — see P2-14)~~
- ~~C8 All 6 `window.confirm()` sites replaced with ConfirmSheet~~
- ~~D1 PWA standalone top-inset — `env(safe-area-inset-top)` on header~~
- ~~D2 Bottom nav hides on iOS soft-keyboard rise (`useKeyboardOpen()`)~~
- ~~D3 Heatmap cells enlarged (option A — 8 weeks × 32px)~~
- ~~E1 Type-scale sprawl — half-px classes eliminated (0 hits)~~
- ~~E2 Bottom-nav label 9 → 10px + tracking bump~~
- ~~E3 Rogue green primary CTA on ReadinessProposal → bronze~~
- ~~F1 `prefers-reduced-motion` coverage on main / pulse-accept / mark-done-flash / button:active~~
- ~~F3 Dead deps (date-fns) + dead CSS (`@keyframes card-in`) removed~~
- ~~G1 Persona test-user domain moved to `@example.test`~~
- ~~G2 Prompt-injection guard added to `run-app-audit.sh`~~
- ~~G4 Stale audit reports directory deleted~~

**session-audit-2026-08-17/backlog.md — shipped 2026-08-17 / 2026-08-18:**
- ~~B1 Two first-run modals in sequence — IntroGallery deleted, OnboardingRunner consolidated~~
- ~~B2 `day_adjustment_soften` eyebrow reads timid — `Signal · fatigue / pain flagged`~~
- ~~B3 `day_adjustment_soften` citation — `halson_2014` wired~~
- ~~B5 "Rest of your week is still yours" — surfaced on Day1EmptyState~~
- ~~B6 Programs "browse catalog" → "Pick your focus" (7 refs)~~
- ~~B7 `tm_bump` reason trimmed~~
- ~~A1 ProposalCard sr-only `<h3>` refactor~~
- ~~A2 Muted text on tinted proposal bg — verified 5.09-5.31:1 (passes)~~
- ~~A3 `useFocusTrap` isConnected guard + fallback chain~~
- ~~A4 IntroGallery focus trap — component deleted~~
- ~~A5 `<h2 id="day1-title">` orphan resolved by sr-only H1 above~~
- ~~A6 H1_b `text-transparent` in forced-colors (landing scope)~~
- ~~A7 ThreeWayContrast `scope="col/row"`~~
- ~~M1 Sub-pages `min-h-dvh`~~
- ~~M2 Programs snap carousel dots decorative → deleted~~
- ~~M4 Hero stat row wraps at 393px~~
- ~~M6 body + main compound bottom padding~~
- ~~M7 ProposalCard dual dismiss — X-icon removed~~
- ~~M9 OnboardingRunner + iOS soft keyboard (top-align + overflow-y-auto)~~
- ~~V2 Scope row row-height parity — copy tightened~~
- ~~V4 `text-balance` on Hero H1 fights hardcoded `<br>` — text-balance removed~~
- ~~V6 CitationRef unicode `▾` → lucide ChevronDown~~
- ~~V7 `strokeWidth={1.9}` outlier on AlertTriangle → 1.75~~
- ~~V8 ProposalStack tight stacking — `space-y-3` applied~~
- ~~C1 Landing "sharpen" survives to app — Day1EmptyState "One focus, sharpened every session."~~
- ~~C2 `life_load` vs `scale_anchor` unified on "cooked"~~
- ~~MO1 `animate-card-in` referenced but not defined — class removed~~

**Post-audit reconciliation notes (2026-08-18 sweep):**
- Concurrent-tracks Today audit — largely implemented via Batches 10-14, formal close still open → moved to S2.
- F6 Concurrent tracks — free-tier shipped; paid gate pending billing → covered by S3.
- F1 Signal-completeness surface — Path 1 shipped 2026-08-18.
- F2 Phase A — admin-only weekly note-keyword scan queue shipped 2026-08-18.

---

**End of file.** Next audit round should re-run `dev/scripts/run-app-audit.sh` first (item A4) so cross-references reflect current UI.
