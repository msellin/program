# Handstand Walk — DELTA audit vs 2026-08-18 comprehensive (2026-08-19)

Read-only. Follows up `dev/audits/programs/2026-08-18-handstand-walk-comprehensive.md`
against tonight's shipped fixes (Batch 1 · `65a397b`, Batch 2 · `cccd609`, Batch 3b · `c70feba`,
block-picker · `ccbaa6d`). Two persona bundles this round: **persona-handstand**
(consistent-average, 45 d, tier_a) and **persona-handstand-fast** (overperformer, 60 d, tier_a
starting).

## 1. Verdict

Handstand Walk went from "renders `YOU FINISHED · Week NaN` on day 1" to a coherent,
in-progress Today screen. Three of the four handstand-hitting P0s from tonight's audit
(phase-remap fallback, Week NaN, tier-aware phase selection) are shipping and observable in
both persona bundles; the retest empty-state prompt (P1-5) also landed. What is **not** yet
fixed and remains the leading integrity risk is a JSON-authored tier-ID naming inconsistency
that only became visible now that tier selection actually runs — phase `for_tier_ids` use
short IDs (`tier_a`), retest metric `targets[].tier_id` use long IDs (`tier_a_foundation`), so
whichever the intake writes, half the tier-gated features silently mis-route. Skill-drill
signal and phase_gates enforcement remain deferred, both pre-known.

## 2. Fixed — items that landed with persona evidence

### Fixed · P0-1 (phase remap on activation) — Batch 2 · `cccd609`
- **Code:** `next-app/src/lib/engine/schedule.ts:63-90`. `shiftedPhases` now falls back to
  `Math.round((startedAt - phases[0].starts) / 864e5)` when
  `program_states[slug].phase_shift_days` is absent, provided the slug is not
  `anterior-hip-rebuild`.
- **Evidence:** persona-handstand started 2026-07-01
  (`persona-handstand/final-store.json:433`). Authored `phase_all_weeks_3_8` runs
  2026-01-26 → 2026-03-08 (`handstand-walk.json:713-716`). Today (Aug 19) now reads
  "Weeks 3-8 — Interleaved practice for all tiers (post-acquisition) · week 5 of 6 · ends
  31 Aug" (`persona-handstand/text/01-today.txt:23`). That is the shifted phase window —
  not the authored one, not "YOU FINISHED." Same on the overperformer bundle
  (`persona-handstand-fast/text/01-today.txt:23`).
- **Before:** `text/01-today.txt:38-42` in 2026-08-18 bundle read
  "YOU FINISHED · Handstand composite (Block 1) · 6 weeks logged."
- **Note:** `program_states[handstand-walk].started_at` is NOT populated on either bundle
  (`persona-handstand/final-store.json:435-439`, `persona-handstand-fast/final-store.json:758-762`)
  — only `active_program_started_at` at the profile root. The fallback in
  `schedule.ts:69-71` handles both, so `ensureProgramStateEntry` from `useStore.ts` did not
  need to fire for the persona harness (which writes state directly). If any writer in the
  app relies on `program_states[slug].started_at` specifically, it would still see undefined
  for these bundles — worth spot-checking outside this audit.

### Fixed · P0-3 / P0-6 (tier-aware phase selection) — Batch 2 · `cccd609`
- **Code:** `schedule.ts:109-147`. `activePhaseFor` filters overlapping phases to those whose
  `for_tier_ids` includes the user's stored tier, falling back to untagged (shared) phases,
  then the first candidate.
- **JSON:** `handstand-walk.json:639, 658, 678, 698` tag phases 1-4 with `for_tier_ids:
  ["tier_a"]` / `["tier_b"]` / `["tier_c"]` / `["tier_d"]`. `phase_all_weeks_3_8`
  (`handstand-walk.json:713-729`) is intentionally left untagged as the shared post-acquisition
  block. All four tier-specific phases carry a `for_tier_ids` array so the fallback path
  fires correctly.
- **Evidence:** persona-handstand.tier = `tier_a`
  (`persona-handstand/final-store.json:437`). Both bundles land on phase_all_weeks_3_8 on
  Aug 19 (which is the correct choice — that window is 2026-07-22 → 2026-09-01 after shift,
  and it is the untagged shared phase, so it wins over any expired tier-specific phase).
  Week view confirms: `persona-handstand-fast/text/02-week.txt:14` reads "Weeks 3-8 —
  Interleaved practice for all tiers (post-acquisition)". No cross-tier drill bleed observed.

### Fixed · P0-4 (Week NaN) — Batch 1 · `65a397b`
- **Code:** `page.tsx:310` now `new Date(userProfile.active_program_started_at.slice(0, 10) +
  "T00:00:00")`. Comment at `:305-309` cites the audit.
- **Evidence:** `grep -c "NaN" persona-handstand*/text/*.txt` = 0 on every route for both
  bundles. Contextual-interference legend line reads "Week 8 · random practice — order
  shuffled by the seed. Shea & Morgan 1979." (`persona-handstand/text/01-today.txt:37`,
  `persona-handstand-fast/text/01-today.txt:32`).

### Fixed · P1-4 (program name derivation) — Batch 1 · `65a397b`
- **Code:** `next-app/src/lib/personalization/reveal-copy.ts:119-130`. `deriveProgramName`
  now title-cases the slug first, falling back to `program_goal.display_name`.
- **Evidence:** Line 6 of `persona-handstand/text/01-today.txt` and
  `persona-handstand-fast/text/01-today.txt` reads "Your Handstand Walk plan is built." —
  not "Your Handstand composite (Block 1) plan is built." as it did in the 2026-08-18 bundle
  (`2026-08-18-handstand-walk-comprehensive.md:13`).

### Fixed · P1-5 (retest cards render `— · — · —` with no baseline prompt)
- **Evidence:** All three retest cards on Progress now show a working empty-state.
  `persona-handstand/text/05-progress.txt:32-46` reads "No readings yet. Log your baseline
  below so the delta has something to track against. · Target 15s · stretch 30s · LOG
  BASELINE" for each of wall_hold, freestand_hold, walk_distance. Same on
  `persona-handstand-fast/text/05-progress.txt:32-58`. Users are no longer stranded by
  three blank cards.

### Fixed · P0-2-adjacent (contradictory Today state)
- **Evidence:** Today no longer renders the five-way state salad from the 2026-08-18
  audit (§P0-2). Both bundles now show: your-plan-card (`text/01-today.txt:4-15`),
  ordered phase readout (`:12-15`), current-phase strip (`:23`), CI legend (`:37`), and
  session content (`:39+`). No "YOU FINISHED" card, no "Week NaN", no simultaneous
  Week 1 opener + Week 8 legend. This is a downstream benefit of P0-1 + P0-4 both landing.

### Fixed · block-picker for handstand's skill blocks — `ccbaa6d`
- Not directly verifiable from these bundles because the persona simulator still doesn't
  write skill-drill items (Batch 3b deferred gap). But `text/02-week.txt` on both bundles
  resolves the Mon/Wed/Fri/Sun sessions to Kinoshita + wall_hold + wrist_prep + recovery
  block names — matching the layout that `plan-generator.ts:121-150` produces after
  phase-aware substitution. No regressions from the block-picker change.

## 3. Still broken — items that persist

### Still broken · phase_gates dead code
- `handstand-walk.json:2021-2035` still declares a phase_gates entry for
  phase_0_bail_out_prep with skip/run rules. `grep -rn "phase_gates"
  next-app/src/` returns zero hits (verified). `activePhaseFor` in `schedule.ts:109-147`
  consults `for_tier_ids` and never touches `phase_gates`, so a user who answers
  `bail_out_readiness = can_exit_reliably` in intake still gets Phase 0 blocks scheduled
  (the phase's `gates_on.intake_answer` at `handstand-walk.json:608-616` is also
  authored but unused). Same as tonight's P0-5 (Vector A). Confirmed unchanged.
- Impact today is low because in these persona bundles the shifted Phase 0 window (Jun
  30 → Jul 6 for a Jul 1 start) is already past on Aug 19, so the user renders the
  correct phase anyway. But an intake-fresh user with `can_exit_reliably` still eats
  bail-out drills for a week they shouldn't.

### Still broken (deferred) · skill-drill logging gap (Batch 3b known)
- `persona-handstand/final-store.json` has 45 days of `exercises: {}` (representative:
  `:402, :406`). No `capability_profile.wall_hold_max_seconds.measured_value`, no
  `retest_readings[]`, no `intake_answers`. Same on persona-handstand-fast (60 days,
  `exercises: {}` throughout, `:406, :418, :431`). The harness's Batch 3b deferred gap
  means every retest metric renders "No readings yet · LOG BASELINE" (see fix P1-5), which
  is now graceful — but adaptation verification for wall_hold / freestand_hold /
  walk_distance can't happen until the harness starts writing `wall_hold_seconds`,
  `freestand_hold_seconds`, `walk_distance_max_metres` items.

### Still broken · tier-ID naming inconsistency in handstand-walk.json (NEW-visible)
- This bug is not a regression from tonight, but it is now *observable* for the first
  time because tier selection actually runs.
- Two authored ID spaces coexist in `handstand-walk.json`:
  - Long-form on `plan_tiers`: `tier_a_foundation`, `tier_b_wall_handstand`,
    `tier_c_freestand`, `tier_d_advanced` (`:496, :520, :544, :568`).
  - Long-form on `retest_metrics[].targets[].tier_id`: `tier_a_foundation`,
    `tier_b_wall_handstand`, `tier_c_freestand`, `tier_d_advanced` (e.g. `:1886, :1892,
    :1898, :1918, :1924, :1930, :1950, :1956`).
  - **Short-form** on `phases[].for_tier_ids`: `["tier_a"]`, `["tier_b"]`, `["tier_c"]`,
    `["tier_d"]` (`:639, :658, :678, :698`).
- Consequences for a real intake commit (which writes the long form via
  `intake-tier.ts:442` = `plan_tiers[i].id`):
  - Phase selection: `for_tier_ids.includes("tier_a_foundation")` returns false for
    every phase → tier match fails → falls back to `!p.for_tier_ids` → first shared
    phase (phase_all_weeks_3_8) → in weeks 1-2 the user still lands on phase_1
    because it is `matches[0]` when phase_all_weeks_3_8 hasn't started yet. In
    weeks 3-8 shared phase wins, correct. **But Tier B / C / D users never actually
    receive their tier-specific phase's block list.** Vector A P0-6 is only *half*
    fixed — Tier A benefits because it happens to be the first match; Tiers B-D
    still get Tier A's phase blocks for the whole intake-through-week-2 window.
  - Retest targets: persona-handstand.tier = `"tier_a"` (harness short form,
    `final-store.json:437`) → `retest-evaluator.ts:217` searches
    `targets.find(t.tier_id === "tier_a")` → undefined → falls back to `targets[0]`
    (`:218`). For wall_hold and freestand_hold, `targets[0]` happens to be
    `tier_a_foundation`, so the target reads correctly. But for `walk_distance_max_metres`
    the `targets` array only lists tier_c and tier_d
    (`handstand-walk.json:1948-1960`) — so `targets[0]` is
    `tier_c_freestand`, target=5, stretch=10. `persona-handstand/text/05-progress.txt:54`
    reads "Target 5 m · stretch 10 m" and labels the card "Tier target: tier_a"
    (`:26-28`). **The persona is being shown Tier C's walk-distance target under a Tier A
    label.** For a real user going through intake as `tier_a_foundation`, `.find` also
    fails and the same fallback fires → same wrong number.
- Fix candidate: pick one ID form and normalise. Cheapest is JSON: rename
  `for_tier_ids` entries to the long form (`["tier_a_foundation"]`, etc.). Also add
  explicit `tier_a_foundation` / `tier_b_wall_handstand` target rows to
  `walk_distance_max_metres` (either `null` targets with a "no walk target yet" note, or
  progression-flavoured targets like target=0/stretch=2 for Tier A).

### Still broken · Coach placeholder, Guide skill glossary, tier chip in header
- P1-9 (`text/03-coach.txt:6-11`), P2-3 (no tier chip on Today/Week/Progress headers),
  P2-4 (Profile shows "8 weeks · multi-tier" with no phase/tier/last-session marker,
  `text/08-profile.txt:8-11`), P2-10 (Guide covers strength + endurance depth, no
  handstand-specific terminology) all unchanged from tonight.

## 4. New from archetype variety — persona-handstand-fast (overperformer path)

- **No tier-advance proposal fires.** `persona-handstand-fast/final-store.json` has zero
  `retest_readings`, zero `capability_profile`, zero `tier_history` entries, zero
  `dismissed_proposals` (`grep` for each returned no output). Store contains
  `tm_history` (strength TM step-ups from the persona simulator's strength writer path,
  `:764-786`) but nothing skill-specific.
- **No Today card, no proposal stack entry** on Aug 19 that references tier advance.
  `persona-handstand-fast/text/01-today.txt` mentions no proposal, no advance banner
  (`grep -in "advance\|tier B\|proposal"` returns only the Guide/Preview/Check
  descriptive lines, not any live proposal).
- **Consequence:** the "does the overperformer path fire?" audit question **cannot be
  answered from these artifacts.** Blocking dependency: the handstand harness path must
  write at least one `retest_readings` entry per cadence (e.g. wall_hold at day 28)
  and a per-drill signal for the `evaluateOverperformer` classifier to have anything to
  chew on. Same underlying gap as tonight's P0-M / P0-6-harness.
- **P1-5 empty state UX validates.** For the overperformer persona, all three retest
  cards land with the "Log your baseline below" prompt
  (`persona-handstand-fast/text/05-progress.txt:32-58`). The overperformer archetype
  isn't proving retest velocity; it's proving the empty-state doesn't strand a user.
- **Notes field reads honestly.** Days like 2026-08-05 log
  "Felt strong — could have added weight."
  (`persona-handstand-fast/final-store.json:426`). If a future tier-advance classifier
  reads notes, this bundle now carries the right substrate.

## 5. New adaptation evidence — with tier + phase correct

- Both bundles render `Weeks 3-8 — Interleaved practice for all tiers (post-acquisition)
  · week 5 of 6 · ends 31 Aug` (`persona-handstand/text/01-today.txt:23`,
  `persona-handstand-fast/text/01-today.txt:23`). The 5-of-6 count matches: shifted
  phase_all_weeks_3_8 starts ~Jul 22, week 5 covers Aug 19 → Aug 25. Phase math is
  internally consistent.
- Week view resolves the correct Tier A layout (Mon/Wed/Sun Kinoshita, Fri wall-hold):
  `persona-handstand/text/02-week.txt:19, 31, 43, 55` — cross-checked against
  `handstand-walk.json` `reference_week_tier_a.layout` (Mon primary =
  `block_skill_A_kinoshita`, Fri = `block_skill_A_wall_hold`, per the audit's earlier
  block-resolution). `plan-generator.ts:121-150`'s phase-aware substitution kept the
  Kinoshita primary because `phase_all_weeks_3_8.blocks` explicitly lists it
  (`handstand-walk.json:720`).
- CI legend fires correctly: `text/01-today.txt:37` reads "Week 8 · random practice"
  because current shifted week is >2, which matches the `page.tsx:314` condition
  `week <= 2 ? "blocked" : "random"`.
- Green-state morning-check banner on the fast persona (`text/01-today.txt:25-26`,
  "GREEN · Progress load. Nothing above 3/10 in your check.") — engine successfully
  read consecutive 0-symptom days and rendered a state hint. Consistent-average bundle
  shows "No check yet · Morning check overdue (4d)"
  (`persona-handstand/text/01-today.txt:27-31`) because that persona's last logged
  check was Aug 15 vs. today Aug 19. Both branches of the check-nudge path fire
  correctly.

## 6. Landing → app residual gap

- **Landing dictionary claim "Four tiers. Drills picked at your level."** (from tonight's
  audit) is now finally *testable* — a Tier A persona lands on Tier A's Kinoshita layout,
  and the phase-aware substitution keeps drills tier-appropriate. But because of the
  tier-ID mismatch (§3), a *real intake* user would fail the phase-tier match and land on
  `matches[0]` = still Tier A's phase. So the visible outcome for tier_a users is
  correct, but for Tier B/C/D the promise is only half-honored. Same-shape residual to
  Vector A P0-6.
- **Landing claim "Every proposal cites a study"** — no live proposal fires on either
  bundle (no skill signal to react to). The baked-in Today safety strip
  (`text/01-today.txt:33-35`, "Shoulder pain stops the session") + Shea & Morgan CI
  legend (`:37`) do cite. The claim survives at the baked-copy level; the live-proposal
  version is unproven.
- **Preview page copy "Baseline setup — a few minutes on the wizard + a 3-day
  measurement window"** (P2-9) still unchanged: `text/07-programs-active.txt:35`. Wizard
  still commits synchronously with no enforced 3-day window.

## 7. Recommended next fixes — ordered

1. **Normalise tier IDs in `handstand-walk.json`.** Either (a) rename `for_tier_ids` on
   phases 1-4 to the long form (`["tier_a_foundation"]` … `["tier_d_advanced"]`), or (b)
   rename `plan_tiers[].id` and every `targets[].tier_id` to the short form and update
   `intake-tier.test.ts:70,242` and `plan-generator.test.ts:57,89,104` accordingly. (a)
   is smaller-blast-radius and matches what real intake writes. Same JSON pass adds
   `tier_a_foundation` + `tier_b_wall_handstand` target rows to
   `walk_distance_max_metres` (either `null` targets with a "no walk target this tier"
   note, or Tier A target=0 / stretch=2, Tier B target=1 / stretch=3). This one JSON PR
   closes the last shipping-visible P0 for handstand and completes Vector A P0-6 for the
   remaining three tiers.

2. **Implement `phase_gates` consumer** (or delete the field). One code change to
   `activePhaseFor`: before falling into the tier / shared preference, filter phases
   whose `phase_gates[?phase_id == p.id].skip_if_value_in` intersects the user's
   `intake_answers[question_id]`. Also fixes Vector A P0-5. If not implementing, delete
   the block from JSON — currently misleads any reader auditing the program's
   behaviour from JSON alone.

3. **Persona harness — write skill-drill items.** `simulator-v2.ts` needs a
   handstand-branch write path that populates
   `store.logs[date].exercises.wall_hold_seconds.done = true` +
   `.actual = <archetype-scaled>`, ditto freestand_hold_seconds / walk_distance_max_metres,
   plus one `retest_readings[]` entry per cadence (weekly for freestand, every 4 weeks
   for wall / walk). Without this, tier-advance / non-responder / overperformer paths
   remain unfalsifiable for handstand + overhead + muscle-up + pullup.

4. **Populate `program_states[slug].started_at`** on all intake / activation paths that
   set `active_program_id`. `ensureProgramStateEntry` was added tonight; audit that
   every writer routes through it and that the harness's direct-store push either mimics
   the writer or bypasses is limited to test-only bundles. Currently persona bundles
   have `active_program_started_at` at root but empty `program_states.handstand-walk.started_at`
   — the `schedule.ts:69-71` fallback compensates, but any consumer that reads only the
   per-program row would still see undefined.

5. **Tier chip in Today/Week/Progress headers** (P2-3 unchanged). Progress already
   knows the tier — line 26 of `persona-handstand/text/05-progress.txt` reads "Tier
   target: tier_a" — but Today and Week omit any tier signal. Adds one chip to
   `AppShellHeader` reading `program.plan_tiers.find(t => t.id === profile.tier)?.label`.

6. **Preview copy pass** (P2-9): drop "3-day measurement window" or actually enforce
   one.

7. **Coach placeholder → hide entirely OR ship the wall→free graduation query.** P1-9
   unchanged; the Progress card and retest form now hold enough shape for a first
   Coach answer to work against. Not blocking.

## 8. What still worked (regression check)

- Extras tab still exposes all block choices for logging
  (`persona-handstand/text/12-extras.txt`, verified 14 routes ok on manifest,
  `persona-handstand/manifest.json:16-156`).
- Confirm-first framework still in place — no silent mutations observed on either
  persona's 45/60-day log windows.
- Shoulder-pain-stops-session strip still renders on Today
  (`text/01-today.txt:33-35`).
- Morning-check overdue nudge fires when the last check is >3 days stale
  (`persona-handstand/text/01-today.txt:31`) and is suppressed when checks are fresh
  (`persona-handstand-fast/text/01-today.txt:25-26` shows the green state hint instead).

## 9. Word-count housekeeping

Body ~1,600 words. Cites `handstand-walk.json`, `schedule.ts`, `page.tsx`,
`plan-generator.ts`, `intake-tier.ts`, `retest-evaluator.ts`, `reveal-copy.ts`, and
persona artifact paths with line numbers. No writes outside this file.
