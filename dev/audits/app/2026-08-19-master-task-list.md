# Master open-task list — Terav app

**Synth date:** 2026-08-19  ·  **Sources reconciled:** every 2026-08-17 / 08-18 / 08-19 audit + `dev/active/session-audit-2026-08-17/backlog.md` + `dev/active/post-audit-p0s/tasks.md` + `dev/active/product-concerns-2026-08-17/roadmap.md` + persona harness manifests.
**Batch 16 filter applied:** items about Profile identity chip, footer collapse + Danger zone, Week padding + Programs pill off header, or 32px H1s were shipped and removed from the open list — see the closed-items appendix at the bottom.
**Harness state:** persona artifacts refreshed 2026-08-19 15:02-15:12 (post-Batch-22, 15/15 personas passed against app.terav.fit). Cross-references reflect current UI.

---

## How to use this list

These are **IDEAS, not action items**. The engine + rehab-first positioning overrides "cleaner is better," so Margus picks what to ship. Batches ship in 6-12h chunks — don't try to close the whole list in one sitting, and respect the "no UI churn between audits" rule (each shipped batch should stand on its own before the next audit re-scans). Real bugs go first because they're broken code the audits happened to surface; everything else is prioritized by user-visible ROI. Sizing (S/M/L/XL) is per item.

**Counts by bucket (post-Batch-28):**

- **Bugs:** 0 open
- **P0:** 0 open
- **P1:** 0 open
- **P2:** 0 open — 10/10 shipped in Batch 28
- **Features on-deck:** 0 open
- **Strategic (founder decision):** 2 items (S3, S4 — S2 closed via walk-through)
- **Rejected:** 12 items — do not ship

Total open surface: **2 strategic + 12 rejected = 14 line items** (down from 110 pre-Batch-17). **Every audit finding shipped or explicitly rejected.** Only S3 (billing timing) + S4 (F5 correlation trigger) remain — both are founder decisions gated on future user counts.

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
- [~] **BUG-11** — SPLIT: (a) csm-amber-week body branch ALREADY RENDERED at `SignalsStrip.tsx:371-388` before S5 pass ("phantom fix. CSM delta-2 caught" comment); (b) amber-week schedule swap (4×4→recovery) remains a real engine feature — promoted to **F12** since it's authoring the block-substitution primitive, not fixing a bug. Advisory in the current expanded body honestly names the deferred state.

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
- [ ] **P1-74** — O9 program-preview hierarchy pass. Section H2 to `text-[16px] font-semibold tracking-tight leading-snug`; add mono-caps eyebrow ("Section 1 of 3") on top-3 sections; reorder Adapts-to-you AFTER Who/What/Retest (currently top-loaded); mono-numeric treatment on retest metrics. Source: `2026-08-19-founder-obs-visual-craft.md` O9. Files: `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx:172-357`. Size: M
- [x] **P1-75** — Programs catalog category treatment via DashboardBlock shipped 2026-08-19 (`b68812f`) as part of F9 first push. Each category = DashboardBlock with accent stripe. Inter-section `space-y-5` → `space-y-8`. ProgramCard dropped its own border (block owns container). O8 palette collision resolved on this surface as a side effect.

### Landing→app (post-Batch-25 round + founder-obs round)

- [x] **P1-76** — Landing verb drift shipped 2026-08-19 (`82d62f0`). `how.step_03_body` + `beta.body` in `landing/src/i18n/dictionaries/en.ts` now say "apply the change or ignore it" / "apply each change — or ignore it" to match the app's context-specific APPLY verbs.

### Copy clarity (post-Batch-25 round + founder-obs round)

- [x] **P1-77** — Ladder disclosure sheet shipped 2026-08-19 (`2ce7032`). Legend words on /programs are now tap-targets that open InfoSheet with full REFERENCED/REVIEWED/VERIFIED definitions. Content from copy-clarity audit's Ginny Redish framework. Personal-programs-outside-ladder note included (matches S6 shipped).
- [ ] **P1-78** — O13 kill ReadinessDot in header + refine banner en-dash polish. `AppShell.tsx:199-215` — remove the dot (redundant with HeroStateCard banner). Refine banner strings at `HeroStateCard.tsx:9-18` to en-dash form: `"Progress load — nothing above 3/10 today."` (drop "in your check", tighten with en-dash). Micro-CLS ~0.03 also disappears. Source: `2026-08-19-founder-obs-copy-clarity.md` O13 + motion-perf. Files: `next-app/src/components/AppShell.tsx:199-215` (delete), `next-app/src/components/workout/HeroStateCard.tsx:9-18` (polish). Size: S
- [ ] **P1-79** — O14a schema split: exercise `name` → `name + variant` field. `"Active hang (scap-engaged)"` → `{ name: "Active hang", variant: "scap-engaged" }`. Renders as two-line card (base + variant · sets). ~20-30 exercises follow the parenthetical pattern in `exercises.json`. Coach proposal line "block pull (midshin) · 147.5 → 152.5 kg (+5)" becomes "block pull · midshin · 147.5 → 152.5 kg (+5)". Source: `2026-08-19-founder-obs-copy-clarity.md` O14a. Files: `next-app/public/data/exercises.json` (schema + grep for `(` in name), `next-app/src/components/workout/ExerciseCard.tsx` (render), `next-app/src/lib/engine/*` (proposal formatters). Size: M

### Motion + perf (post-Batch-25 round + founder-obs round)

- [x] **P1-80** — Rhythm stabilization shipped 2026-08-19 (`1d43ece`). All 4 tab routes use `space-y-6 pt-4` (Today + Progress bumped from `space-y-5`). Week + History already matched.

### Mobile UX (post-Batch-25 round + founder-obs round)

- [x] **P1-81** — Programs dropped from top-nav shipped 2026-08-19 (`c1bd940`) as part of F8 first push. Also killed Morning-check icon + ⋮ overflow menu. Header now only has TERAV wordmark + Settings icon. Extras/Report/Evidence relocated to Profile More.
- [x] **P1-82** — Wizard chip strip `grid-cols-2` shipped 2026-08-19 (`d6a8061`). Yes/No fills row width; longer strips still wrap.
- [x] **P1-83** — Progress rail sizing shipped 2026-08-19 (`d6a8061`). Bar 3→5 px; counter 10→13 px; program-name eyebrow 10→12 px. Kept "Step N of M" form.

---

## Section D — P2 (defensible polish, post-Batch-25 round + founder-obs round)

- [ ] **P2-31** — O14a a11y-side truncation nudge (mirrors P1-73 fix). Track only if P1-73 doesn't ship. Source: `2026-08-19-founder-obs-accessibility.md` §O14a. Files: `next-app/src/components/workout/ExerciseCard.tsx:176`. Size: XS
- [ ] **P2-32** — N4 icon-stroke discipline. Terav has 3 sizes (14/16/18) and 2 stroke weights (2, 1.75) in circulation. Shared `<Icon>` wrapper with defaults `strokeWidth={1.75}` + `xs=14/sm=16/md=18`, then codemod call sites. Or ESLint rule against bare `size={n}` on lucide imports. Source: `2026-08-19-founder-obs-visual-craft.md` §N4. Size: M
- [x] **P2-33** — Label parity shipped 2026-08-19. `manifest.json:302` category label "Left/right & mobility" → "Mobility" + description tightened. Description reorder puts mobility use case first.
- [x] **P2-34** — Recharts axis review — already resolved before founder-obs round. `SymptomLoadChart.tsx:86-91` uses themed palette tokens (grid #24272f, axisLine #3A3F4A, axisTick #D6D9DE) — no defaults leak. Was fixed in P2-13 earlier.
- [ ] **P2-35** — S-6 hover-on-touch sticky-state sweep. `hover:` classes without `focus:`/`active:` twins across ExerciseCard, AppShell, DateNav, HeaderQuickLinks. Source: `2026-08-19-founder-obs-mobile-ux.md` §S-6. Size: M

---

## Section E — Features on-deck

From roadmap sync + product-concerns-2026-08-17 + design-lead brief `2026-08-19-founder-obs-design-lead.md`.

- [~] **F8 · Batch 29 — IA restructure** — First push shipped 2026-08-19 (`c1bd940`). Header collapsed (TERAV wordmark + Settings only), /settings v1 route live with sound/haptic/theme/language rows + install prompt, Extras/Report/Evidence relocated to Profile More, /events + HeaderQuickLinks deleted. **DEFERRED to second push:** Today → DashboardBlock dashboard, `/session/[slug]` route, P1-78 kill ReadinessDot. Both need F9's DashboardBlock primitive to land first. Source: `2026-08-19-founder-obs-design-lead.md` Decision 1.
- [~] **F9 · Batch 30 — DashboardBlock primitive** — First push shipped 2026-08-19 (`b68812f`). Primitive live at `src/components/DashboardBlock.tsx`. Applied to Programs catalog category sections (closes P1-75) + ExerciseCard fixes (closes P1-71 + P1-73). **DEFERRED to follow-up pushes:** Today dashboard use (needs F8 second push), session route use, program-preview restructure (P1-74 still open).
- [~] **F10 · Batch 31 — Readiness ladder ship** — 5 of 6 REVIEWED promotions shipped 2026-08-19 (`38d7822`). Schema (reviewed_by, reviewed_at, status_history, review_evidence[]) added. DRAFT rename + catalog filter + attribution row on preview page + honesty callout on catalog all live. Promoted: engine-builder, overhead-mobility, handstand-walk, CSM, rowing-2k. **REMAINING:** anterior-hip-rebuild promotion blocked on **S6** decision (personal-program REVIEWED policy).

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
- [ ] **F12 · CSM amber-week schedule swap.** Author a block-substitution primitive so `csm.json:435-436` ("≥ 3 amber days → drop 4×4 for a week; resume next week at 3×4") becomes machine-executable. Currently the SignalsStrip advisory + prose in the expanded body tell the user to substitute manually. Requires: (a) detect amber-week in `plan-generator.ts` or a scheduled_block post-processor; (b) substitute `block_4x4_row` with `block_easy_recovery` (or delete) for the next week; (c) record the substitution in `engine_adjustments[]` on the block so history is honest. Related: opens the door for other JSON-authored "drop N for a week" rules across programs. Source: S5 REV-4 P1 promoted from BUG-11 (b). Size: L (3-5h).

---

## Section F — Strategic (founder decision needed)

Not tasks — calls to make.

- [ ] **S3** SaaS Phase 3 (billing/Paddle) is 0% done — gates F6 paid-gating, F4 monetization, F2 Phase C, F3 turn-on. Real critical-path item for anything labeled "Paid." **Decision:** when does this become top-of-stack? Source: `2026-08-19-open-task-list.md` (F3), `product-concerns-2026-08-17/roadmap.md`.
- [ ] **S4** F5 correlation view is chicken-and-egg with beta data volume. **Decision:** set explicit "N users × 90 days" trigger, or defer indefinitely? Source: `2026-08-19-open-task-list.md` (F4).
- [x] **S5** Readiness-ladder promotion pipeline. **RESOLVED 2026-08-19** via 6-agent rerun. Outcome: 2 PROMOTE-WITH-CAVEATS (engine-builder, overhead-mobility), 4 HOLD (HSW, CSM, rowing, anterior-hip). Pipeline exists; the 2026-08-17 review needs a delta pass before promotion. See F10 breakdown for per-program outcomes + cross-program meta-findings (BUG-7 through BUG-11 + QA-1).
- [x] **S6** Personal programs sit outside the readiness ladder — resolved 2026-08-19 (`9174961`, Option C). Founder pick: personal programs excluded entirely. StatusChip returns null when personal=true; legend gets a one-line addendum; attribution row suppressed. Anterior-hip-rebuild stays REFERENCED under the hood for schema conformance but the chip is hidden — the "personal" badge is its sole trust signal.
- [ ] **QA-1** Shipping-log drift protocol. The 2026-08-18 batch's `citations-under-review-2026-08-17.md` "Shipped" section claimed 11 fixes; S5 rerun found 3+ items only partially executed (H-3 Ferrari drop, H-4 sci_reports softening, R-3 Das drop, C-1 Berryman engineering-choice line). **Decision:** add a "verify shipped ≠ archive" step to future batch commits — either a checklist of `grep` proofs before archiving the plan, or a post-commit CI check that re-parses the referenced program JSONs. Source: S5 meta-finding across REV-3, REV-4, REV-5.
- [x] **QA-2** Landing↔app sync-drift protocol shipped 2026-08-19 (`dev/scripts/check-landing-sync.py`). Verifies hard claims on landing (program counts, citation counts, "N programs live", "N more in build") match manifest.json + citations.json. Currently manual (`python3 dev/scripts/check-landing-sync.py`) — wire to pre-commit hook or CI later if drift-catch cadence isn't tight enough. Source: founder observation 2026-08-19 (landing/app catalog list out-of-sync intuition).

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
