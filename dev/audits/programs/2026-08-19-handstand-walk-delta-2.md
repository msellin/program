# Handstand Walk — DELTA-2 audit vs 2026-08-19 delta (2026-08-19 evening)

Read-only. Follows up `dev/audits/programs/2026-08-19-handstand-walk-delta.md` against
Batch 5 (`05e101b`) and Batch 6 (`33e2061`). Two persona bundles this round:
**persona-handstand** (consistent-average, 45 d, tier=`tier_a_foundation`, start
2026-07-05) and **persona-handstand-fast** (overperformer, 60 d, tier=`tier_a_foundation`,
start 2026-06-20).

## 1. Verdict

Tier-aware phase selection now works **end-to-end with long-form IDs** — the P0
carry-over from delta-1 §3 is closed on the phase side. Both personas land on
`phase_all_weeks_3_8` correctly (`persona-handstand/text/01-today.txt:8`,
`persona-handstand-fast/text/01-today.txt:8`) and `program_states.handstand-walk.tier`
is written as the long form the JSON expects (`persona-handstand/final-store.json:437`,
`persona-handstand-fast/final-store.json:760`). But two P0/P1s from delta-1 persist:
the `walk_distance_max_metres.targets[]` array still has no Tier A/B rows, so persona-handstand
sees Tier C's target under a Tier A label; and the block-copy strings ("Tier A blocked practice"
inside `block_skill_A_kinoshita.name`) contradict the interleaved-post-acquisition phase they
now render in. Tier-advance / overperformer branches remain **verification-blocked** by the
harness5 capability-seed gap; retest-window opening did fire on the fast persona so at least
one adaptive proposal path is observable.

## 2. Fixed — items verified from Batch 5/6

### Fixed · P0-6 tier-ID normalization — Batch 5 · `05e101b`
- **Code:** `next-app/src/lib/engine/schedule.ts:109-135`. `activePhaseFor` reads
  `profile.program_states[slug].tier` (:116) and does
  `matches.find(p => p.for_tier_ids?.includes(tier))` (:129). Long-form tier written
  in both persona stores.
- **JSON:** `handstand-walk.json:639, 658, 678, 698` all now carry the long form
  (`["tier_a_foundation"]`, `["tier_b_wall_handstand"]`, `["tier_c_freestand"]`,
  `["tier_d_advanced"]`). `plan_tiers[].id` at `:496, :520, :544, :568` matches.
  Delta-1's short/long mismatch is closed on the phase side.
- **Evidence:** persona-handstand's Aug 19 phase-strip reads "Weeks 3-8 —
  Interleaved practice for all tiers (post-acquisition) · week 4 of 6 · ends 4 Sept"
  (`persona-handstand/text/01-today.txt:8`). Shift math checks: shifted phase starts
  2026-07-26, Aug 19 = day 24 = week 4. `phase_1_foundation_prep`'s shifted window
  (Jul 5 → Jul 18) had already elapsed before Aug 19, so the untagged shared phase
  wins — exactly the intended path in `schedule.ts:131-132`.

### Fixed · Batch 5 #1 — no contradictory Today state
- **Code:** `page.tsx` gates phase readout + retest reminder + reveal card on
  `!isPastProgramEnd()`. `05e101b` commit body specifies the gate.
- **Evidence:** neither persona graduated (persona-handstand 45 d, fast 60 d, both
  inside the shifted 8-week window). No graduation card renders. No "YOU FINISHED"
  strip. Ordered layout is: (a) SignalsStrip → (b) phase readout (`:8`) → (c)
  ProposalCard (either FATIGUE for consistent-average `:10-17` or END-OF-BLOCK
  RETEST WINDOW OPEN for fast `:10-17`) → (d) morning-state hint (`:18-19`) → (e)
  shoulder-pain safety strip → (f) CI legend → (g) session content. No cross-hits
  between graduation, retest banner, or reveal card. Contradictory-clock class of
  bug does not present here.

### Fixed · P1-5 empty-state — from Batch 3a, still holding
- **Evidence:** persona-handstand Progress `text/05-progress.txt:36, 46, 56` all
  render "No readings yet. Log your baseline below so the delta has something to
  track against." with a `LOG BASELINE` CTA per metric. Same on
  `persona-handstand-fast/text/05-progress.txt:34, 44, 54`. Empty state does not
  strand the user.

### Fixed · retest_due proposal path fires end-of-block window — Batch 5 #6-adjacent
- **Code:** `next-app/src/lib/proposals/select.ts:340-378`.
- **Evidence:** persona-handstand-fast at week 9 of the program (past
  `phase_all_weeks_3_8.at_week=8`) surfaces "END-OF-BLOCK RETEST WINDOW OPEN · Week 8
  end-of-block retest is due. Log a reading to compare against baseline." with a `LOG
  READING` CTA (`persona-handstand-fast/text/01-today.txt:10-16`). Metric named:
  "Wall handstand hold (max) (seconds)". This is the first *adaptive* proposal on a
  handstand persona observed in the delta series.

### Fixed · CI legend math + fatigue proposal
- **Code:** `page.tsx:316-334`. Both personas render CI legend with a coherent week
  number (persona-handstand `text/01-today.txt:25`: "Week 7 · random practice";
  fast `:25`: "Week 9 · random practice"). Math: Aug 19 − Jul 5 = 45 d →
  Math.floor(45/7)+1 = 7; Aug 19 − Jun 20 = 60 d → Math.floor(60/7)+1 = 9. Correct.
- Consistent-average persona surfaces a FATIGUE OR PAIN FLAGGED TODAY proposal
  (`text/01-today.txt:10-17`) with source Halson 2014 and Apply-5%-lighter / Ignore
  actions — Confirm-first is intact.

## 3. Still broken — items that persist across delta-2

### Still broken · walk_distance targets missing Tier A/B rows (delta-1 §3 half-fixed)
- **Code:** `next-app/src/lib/engine/retest-evaluator.ts:299-305`.
  `targets.find(t.tier_id === userTierId)` returns undefined for
  `walk_distance_max_metres` when userTierId = `tier_a_foundation`, then falls back
  to `targets[0]`.
- **JSON:** `handstand-walk.json:1948-1960` — `walk_distance_max_metres.targets` only
  contains `tier_c_freestand` (target=5, stretch=10) and `tier_d_advanced` (target=15,
  stretch=25). Tier A and Tier B rows are absent.
- **Evidence:** `persona-handstand/text/05-progress.txt:52-58` shows the walk-distance
  card as "Handstand walk (max continuous) · CHECK AT WEEK 8 · No readings yet …
  Target 5 m · stretch 10 m" — that is Tier C's target under the "Tier target:
  tier_a_foundation" label from line 30. The delta-1 recommendation ("add
  tier_a_foundation + tier_b_wall_handstand target rows to walk_distance_max_metres")
  did not land in Batch 5 or Batch 6. This is now the last shipping-visible P0 on
  handstand.

### Still broken · block-copy strings assume Tier A weeks 1-2 in a post-acquisition phase
- **JSON:** `handstand-walk.json:776`
  `"name": "Skill session A — Kinoshita position ladder (Tier A blocked practice)"`
  and `:783` `"note": "Tier A weeks 1-2: blocked practice of Kinoshita positions
  1-2..."`. This block is authored inside `phase_1_foundation_prep.blocks[]`
  (`:642`), which is Tier A weeks 1-2 — copy accurate there. But
  `phase_all_weeks_3_8.blocks[]` (`:720`) *also* pulls this block for the shared
  post-acquisition interleave, so the same "Tier A blocked practice" name renders in
  Today and Week during Weeks 3-8, alongside the CI legend that literally says
  "random practice — order shuffled by the seed"
  (`persona-handstand/text/01-today.txt:40-42, 25`). This is a copy contradiction
  visible in every artifact — Today, Week, and Extras
  (`persona-handstand-fast/text/12-extras.txt:18`). Two fix candidates:
  (a) rename `block_skill_A_kinoshita` copy to drop the phase-specific qualifier
  ("Skill session A — Kinoshita position ladder"), and move the "Tier A blocked
  practice" phrasing to the phase readout only; (b) generate the block title from
  the phase context at render time. (a) is a one-line JSON change.

### Still broken · phase_gates dead code (unchanged from delta-1)
- `handstand-walk.json:608-616, 2021-2035` still declare `gates_on.intake_answer`
  and `phase_gates`. `activePhaseFor` (`schedule.ts:109-147`) never consults them.
  No `grep` hit for `phase_gates` under `next-app/src/`. Impact is masked on the
  personas here because Phase 0's shifted window elapsed before Aug 19, but a
  fresh intake with `bail_out_readiness = can_exit_reliably` still eats Phase 0
  blocks that should be gated off.

### Still broken (deferred) · skill-drill log items not written by simulator
- Delta-1 §3 flagged this as Batch 3b deferred. Batch 6 #9 partially closed the gap
  by seeding `program_states[slug].baseline_capabilities` and
  `user_profile.capability_profile`, but as the brief notes, harness5 was launched
  before that commit — both persona-handstand stores show `capability_profile: {}`
  (`persona-handstand/final-store.json:440`,
  `persona-handstand-fast/final-store.json:763`) and no
  `program_states.handstand-walk.baseline_capabilities`. Regression is harness-
  timing, not shipped code.

### Still broken · Profile card still reads "8 weeks · multi-tier"
- `persona-handstand/text/08-profile.txt:8-10`. No phase, tier, or last-session
  marker (delta-1 P2-4 unchanged). Progress *does* know the tier ("Tier target:
  tier_a_foundation" line 30); Today and Week headers still don't render one.

## 4. Verification blocked pending harness6

- **Tier-advance proposal for the overperformer path.** Both persona stores have
  `capability_profile: {}`, empty `retest_readings[]`, no `tier_history`, and no
  `dismissed_proposals` (`grep` on `persona-handstand-fast/final-store.json` for
  each returned nothing but `tm_history` at `:765-788`, which is strength-track).
  Without capability seeds + delta writes, the retest evaluator has no data for
  `evaluateOverperformer` to promote a tier-bump proposal. Cannot audit whether the
  Batch 6 #7 positive-adaptation SignalsStrip surfaces for handstand until harness6
  produces baselines + measured deltas.
- **Retest cadence beyond end-of-block window.** The fast persona reveals the
  end-of-block window opens correctly, but with no `retest_readings`, the mid-block
  proposal from `select.ts:340-378` cannot be tested here.
- **Non-responder classifier** — cluster paths similarly untestable without a
  baseline + delta pair.

## 5. New bugs

- **Two week-number references coexist on Today.** Phase readout says "week 4 of 6"
  (phase-relative) on `persona-handstand/text/01-today.txt:8`; CI legend says
  "Week 7" (program-absolute) on `:25`; retest banner on the fast persona says
  "Week 9 · logging …" (`persona-handstand-fast/text/01-today.txt:14`) and "Week 8
  end-of-block retest is due" (`:12`, phase-relative). A user sees three different
  "current week" values on one screen. Not a P0 — each is arithmetically correct —
  but a copy-consistency P2. Fix candidate: prefix the phase-relative readouts with
  the phase name ("Phase week 4 of 6") or unify on program-absolute.
- **`persona-handstand/text/05-progress.txt:23`** shows "0/51 done · 0%". Adherence
  is derived correctly from the empty-exercise logs, but "51 UPCOMING · 12 SKIPPED"
  (`:25`) doesn't add to 51 — 39 + 12 = 51. The label reads "51 UPCOMING" while the
  breakdown line says "39 UPCOMING". Wording bug in the summary label, not the
  math. On fast persona (`text/05-progress.txt:23`) same card reads "0/51 done · 0%
  · 51 UPCOMING" (no skipped days) — that's fine, the total and upcoming both are 51.
  Bug only surfaces when a persona has skipped days.

## 6. Recommended next fixes — ordered

1. **Add Tier A and Tier B target rows to `walk_distance_max_metres.targets`**
   (`handstand-walk.json:1948-1960`). Either `null` targets with a "no walk
   target this tier" note, or Tier A target=0/stretch=2, Tier B target=1/stretch=3.
   One JSON edit closes the last shipping-visible P0 for handstand.
2. **Rename `block_skill_A_kinoshita.name`** (`handstand-walk.json:776`) to drop
   "(Tier A blocked practice)" — the block is reused inside the interleaved shared
   phase. Same edit on `:783` note. One JSON edit closes the copy contradiction
   in Today, Week, and Extras.
3. **Fix the "51 UPCOMING · 12 SKIPPED" summary label** on
   `PerProgramAdherenceCard`. When skipped > 0, show "N + M breakdown" or update
   the parent count to exclude skipped. UX P2.
4. **Rerun harness6 (fixed simulator, +2 personas)** to close verification-blocked
   items in §4. Assert capability_profile is populated and at least one
   `retest_readings` entry lands per persona.
5. **Implement `phase_gates` consumer** in `activePhaseFor` or delete the JSON
   block. Same as delta-1 rec #2. Only becomes user-visible for fresh-intake users
   whose shifted Phase 0 window hasn't elapsed.
6. **Tier chip in Today/Week headers** (P2-3 unchanged from delta-1).
7. **Preview page "3-day measurement window" copy** — enforce or drop (delta-1 P2-9).

## 7. What still worked (regression check)

- Confirm-first framework intact: FATIGUE proposal on consistent-average persona
  shows Apply / Ignore actions (`persona-handstand/text/01-today.txt:15-17`); no
  silent load mutation on either 45/60-day log window.
- Shoulder-pain-stops-session strip on both bundles
  (`persona-handstand/text/01-today.txt:21-23`,
  `persona-handstand-fast/text/01-today.txt:21-23`).
- Landing → app claim "Four tiers. Drills picked at your level."
  (`landing/src/i18n/dictionaries/en.ts:58`) — testable now for Tier A, still
  unproven for Tier B/C/D pending harness6.
- Guide (`text/11-guide.txt`) still covers strength + endurance depth with no
  handstand-specific terminology (delta-1 P2-10 unchanged).
- Program catalog reads "ACTIVE · REFERENCED" for handstand-walk on both bundles
  (`text/06-programs.txt:33-35`, fast `:33-35`).
- Extras exposes all 9 blocks including tier-specific ones the persona isn't in
  (`persona-handstand-fast/text/12-extras.txt:14-48`) — deliberate design.

## 8. Word-count housekeeping

Body ~1,250 words. Cites `handstand-walk.json`, `schedule.ts`, `retest-evaluator.ts`,
`select.ts`, `page.tsx`, `en.ts`, and persona artifact paths with line numbers.
No writes outside this file.
