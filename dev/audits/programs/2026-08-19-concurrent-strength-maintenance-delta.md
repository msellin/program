# CSM delta audit — 2026-08-19

Delta against `dev/audits/programs/2026-08-18-concurrent-strength-maintenance-comprehensive.md`.
Three fresh persona bundles from harness4 (~00:30):

- **persona-strength** — overperformer, 30 days, no tier
- **persona-erratic** — erratic (40% skip / dismiss), 45 days
- **persona-strength-slow** — underperformer, 60 days, `tier: foundation`

Cross-referenced against tonight's five shipped commits (`65a397b`, `cccd609`,
`df9b3a0`, `c70feba`, `ccbaa6d`). Read-only.

## 1. Verdict

**P0-5 is delivered.** All three personas render Wednesday's front-squat card at
exactly the maintenance percentage `MAINTENANCE_BLOCK_PCTS.block_strength_moderate`
prescribes (65 %) — `persona-strength/text/01-today.txt:46` shows `58.5 kg × 5` on
TM 90 (65 %); `persona-erratic/text/01-today.txt:46` shows `55.5 kg × 5` on TM 85
(65 %); `persona-strength-slow/text/01-today.txt:36` shows `40.5 kg × 5` on TM 69
(amber state × day-adjustment = 65 × 0.95 × 0.95 = 58.7 % → 40.5 kg). The cold-
start 55 % fall-through path (`suggest.ts:273`) is no longer reachable for CSM.
**P0-7 also landed cleanly** — the "Welcome back — you've been away X days" banner
now correctly requires lifted-session-or-run history and no longer false-fires on
morning-check-only days (`adapt.ts:248-254`). The remaining gap is the CSM-authored
"≥3 amber days → drop 4×4 next week" hook (P1-11): persona-erratic and
persona-strength-slow both produce the exact input pattern the JSON promises will
trigger a schedule change, and neither Week view shows the drop.

## 2. Fixed — items from tonight's audit that landed

### P0-5 · CSM 5/3/1 maintenance percentages now render (65a397b)

`next-app/src/lib/engine/suggest.ts:95-99` adds `MAINTENANCE_BLOCK_PCTS` with
`block_strength_heavy → 0.75 (squat) / 0.78 (pull/dl)` and
`block_strength_moderate → 0.65`. The path at `suggest.ts:157-173` intercepts CSM
strength days before the autoreg cold-start and returns
`Maintenance day: 5×N @ Y% TM, RPE cap 7`. Evidence per persona:

- persona-strength, front squat TM 90 → `58.5 kg × 5` (`persona-strength/text/01-today.txt:44-46`). 90 × 0.65 = 58.5. ✓
- persona-erratic, front squat TM 85 → `55.5 kg × 5` (`persona-erratic/text/01-today.txt:44-46`). 85 × 0.65 = 55.25, rounds to 55.5. ✓
- persona-strength-slow, front squat TM 69, amber + 0.95 day-adj → `40.5 kg × 5` (`persona-strength-slow/text/01-today.txt:34-36`). 69 × 0.65 × 0.95 × 0.95 = 40.5. ✓ Combined state × day-adjustment path (`suggest.ts:151`) working correctly.

Heavy-day math verified out-of-band (Today captured on a Wednesday so Heavy card
isn't visible): 115 × 0.75 = 86.25 → would round to 86.5 kg on Monday's back squat
for persona-strength; 89 × 0.75 = 66.75 for persona-strength-slow; block pull at
0.78 (`suggest.ts:97` pull-pattern branch) would render on Mon 17 Aug's session.
Ten log-days of persona-strength strength sessions (`final-store.json:26-72,
113-165, 245-296, 331-383, 405-461, 509-561, 585-618, 689-740, 764-796`) confirm
the simulator is now writing block-strength lifts.

**Landmark result: CSM's core "keep the squat" promise is now mechanically delivered
instead of silently falling through to a 55 % cold-start ramp.** The tonight-audit's
biggest single P0 is closed.

### P0-7 · `detectPauseResume` no longer false-fires on morning-check-only history (65a397b)

`adapt.ts:241-254` now counts activity as `Object.values(day.exercises).some((e) =>
e.done) || (day.runs && day.runs.length > 0)`. `day.symptoms != null` was dropped.
Evidence: persona-strength-slow logs Mon Aug 18's Z2 bike run and no session on
Tue Aug 18. Aug 19 minus last-activity Aug 18 = 1-day gap → no banner
(`persona-strength-slow/text/05-progress.txt:1-15` — Progress opens straight into
"This week so far", no calibration copy). persona-erratic's last activity Aug 15
(`final-store.json` scan) is 4 days back, still under the 14-day threshold — no
banner (`persona-erratic/text/05-progress.txt:1-15`). persona-strength IS getting
the banner (`persona-strength/text/05-progress.txt:5-7`), but its last activity
was 2026-07-30 (20-day gap) — this is the correct, honest firing case. The false-
fire pathway is closed.

### P1-7 · manifest ↔ JSON cadence contradiction closed (65a397b)

`next-app/public/data/programs/manifest.json:102` now reads `"retest": "Cycle-end
5RM confirm + submax HR at row pace-5. At week 8 (end of block)."`. Preview echoes
the same at `persona-strength/text/07-programs-active.txt:26`,
`persona-strength-slow/text/07-programs-active.txt:26`. The old "Every 4 weeks"
copy that clashed with `concurrent-strength-maintenance.json:902 (cadence_weeks:
8)` is gone.

### P0-4 · Week NaN — swept clean

Zero occurrences of `NaN`, `Invalid Date`, or `undefined` across all 42 text files
(`persona-strength`, `persona-erratic`, `persona-strength-slow` × 14 routes each).

### P1-9 · Report garbled morning-check glyph — sweep

`persona-strength/text/10-report.txt:38-40` reads cleanly `MORNING CHECK · 30 green`;
no more `30g · 1065?` glyph fallback. Report now legitimately surfaces `STRENGTH
SESSIONS 10 · ENDURANCE SESSIONS 13` (`text/10-report.txt:26-32`) and a full
per-lift load-progression table (`text/10-report.txt:133-160`). Report page is now
substantive for the persona this program was designed to test.

### P0-M · persona simulator writes strength + runs (c70feba + ccbaa6d)

Ten strength log-days on persona-strength; 40 amber day-adjustments plus real
heavy-day sets on persona-strength-slow (`persona-strength-slow/final-store.json:
1273-1312` — back squat 86 kg RPE 9/9.5/10, block pull 109.5 kg RPE 9/9.5/10 on
Aug 17). `runs[]` present on Z2 and hard-interval days (`persona-strength/final-
store.json:15-24, 90-99, 573-583, 749-761` — cycle Z2 avg-HR entries and threshold
row sessions). The block-picker date-shift fix at `ccbaa6d` is what unblocks these
— confirmed that authored `phase_1_intro: 2026-08-12` no longer starves the
simulator's July-1 personas.

## 3. Still broken

### P1-11 · amber-week drop-4×4 hook remains authored, not implemented

`concurrent-strength-maintenance.json:541` promises `"amber week detection (≥3
amber days) → drop 4×4 next week"`. Grep on `adapt.ts`, `suggest.ts`,
`schedule.ts`, `plan-generator.ts` for `amber_week`, `drop_4x4`, `4x4_drop`, or
`3 amber` returns zero matches. Persona-erratic ISO wk 30-33 all show 6-7 amber
days (`persona-erratic/final-store.json` scan; each week produces `week: {amber:
7, red: 0, green: 0}` from Jul 20 through Aug 16). persona-strength-slow shows
7-amber weeks Jul 6 through Aug 17. Week view for the next scheduled interval
still lists `Norwegian 4×4 · Row / Ski · Thu 20 Aug`
(`persona-erratic/text/02-week.txt:37`; identical on `persona-strength-slow`
`text/02-week.txt`). The hook does not fire on the exact input pattern it was
authored to catch.

### P1-10 · `store.cycle.phase_id` still stuck at null on all three personas

`persona-strength/final-store.json:842`, `persona-erratic/final-store.json:858`,
`persona-strength-slow/final-store.json:1618` all show `"phase_id": null`.
Meanwhile the Today header correctly names `Retest · Weeks 7–8 · week 2 of 2 ·
ends 24 Aug` on all three (`text/01-today.txt:29 / :29 / :22`). Display is
computed live from `program.phases[].starts` — persisted state never updates on
phase change. Any downstream reader that trusts `store.cycle.phase_id` as source
of truth will read the initial value forever. Not surfaced as a bug on these
fresh personas because no visible feature reads it directly, but the invariant
"persisted state and computed state agree" is broken. Not fixed by cccd609.

### P2-4 · `PR-banned` catalog jargon

`persona-strength/text/06-programs.txt:23`, `persona-strength-slow/text/06-
programs.txt:23`, and `manifest.json:97` all still read
`"…PR-banned."`. Landing at `landing/src/lib/programs-catalog.ts:77` uses the
warmer `"Add cardio. Keep the squat."` The catalog card mismatch persists.

### P1-5 · retest empty-state UX (`baseline —`) still surfacing for CSM

`persona-strength/text/05-progress.txt:36-48` shows `BASELINE — · CURRENT 115 kg
· Δ —` for Back squat 5RM. df9b3a0's fix targets physical-test metrics with no
readings at all (rowing 2K, TGU seconds) — CSM's baseline is expected to come
from `program_states[slug].baseline_training_maxes` written at intake commit. The
persona harness skips intake commit so this state won't surface for a real
intake-completed user, but the presence of `CURRENT 115 kg` without a baseline
still reads as an unfilled slot. Not regressed — pre-existing gap.

### P1-8 · Report defaults to 3Y range

`persona-strength/text/10-report.txt:10` still reads `"Range: 21 Aug 2023 → 19
Aug 2026"` with `DAYS IN RANGE 1095` on a program that started 6 weeks ago
(`text/10-report.txt:18-20`). Not touched by any of tonight's commits.

## 4. New from archetype variety

### persona-strength (overperformer, 30 days, no tier)

- **TM-bump proposal does not fire — correctly.** The persona logs stop at
  2026-07-31, capture-date is 2026-08-19. `evaluateOverperformer`
  (`adapt.ts:416-423`) requires `recent.length ≥ 3` in the last-7-days window;
  the last log is 20 days old, so no logs qualify and the guard returns null
  before green-streak / easy-signal checks. That means the intended "golden
  dataset" for A1 still can't run — for the wrong reason now. The tonight-audit
  said "empty exercises"; that's fixed. The new reason is "last log is outside
  the 7-day window." The persona's `logs_count: 30` covers July 2-31 only.
  **Persona-harness gap:** simulator should extend log-days up to today or
  bracket the capture window (either backfill through capture date, or capture at
  the last-log date + 1).
- **`felt strong — could have added weight` notes on Jul 8, 15, 22, 29**
  (`final-store.json:219, 437, 616, 795`) are the exact `daySignals().easy`
  hits the overperformer path is designed to consume. Once the harness closes
  the log-window gap, A1 should fire.
- **Reveal card still shows `First up: anchor the strength floor. Introduce Z2
  volume`** (`text/01-today.txt:10`) even though the user is displayed as being
  in Retest (week 8). Gated by `program_states[slug].reveal_seen`
  (`YourPlanCard.tsx:31`); persona-strength has no `program_states` entry (see
  §3.new) so revealSeen is false forever. On the real app the ensureProgramStateEntry
  path (`useStore.ts:842`) writes the entry, so real users hit the 3-view auto-
  dismiss. Copy is still stale for anyone whose intake predates cccd609 or was
  onboarded via a code path that bypassed setActiveProgram — worth an idempotent
  post-hydration back-fill.

### persona-strength-slow (underperformer, 60 days, tier foundation)

- **Engine correctly HOLDS TM** — CSM's JSON says "no cycle-end TM proposal
  (maintenance block; TMs held by design)"
  (`concurrent-strength-maintenance.json:542`). Store shows `training_maxes:
  {back_squat_highbar: 89, ...}` unchanged across 60 days, with no
  `tm_history` entry, no `dismissed_proposals`. There is also no
  `evaluateUnderperformer` in the engine — CSM doesn't drop TM automatically
  either, matching the maintenance-block intent. Confirms the design.
- **40 amber day-adjustments across 60 days** all at `load_multiplier: 0.95,
  reason: "sim: amber state", source: "notes"`, all `accepted_at` timestamped
  (`final-store.json:1642-1820ish`). The state-mod × day-adj stacking
  (`suggest.ts:151`) is producing exactly the compound 0.9025 modifier the
  underperformer path implies (65 % × 0.95 × 0.95 = 58.7 % → 40.5 kg on TM 69
  — matches Today's `40.5 kg × 5`).
- **Underperformer archetype triggers RPE 9-10 at ~96 % TM** (Mon Aug 17's back
  squat 86 kg on TM 89, block pull 109.5 kg on TM 113.5). Simulator writes
  values much higher than the engine would prescribe (0.75 × 89 × 0.95 = 63.4
  kg for the same session). This is honest to the underperformer archetype
  (user grinds through at RPE 10) but note that the simulator's written weights
  are NOT the engine's suggestion — a persona-verification harness that
  compares "simulator wrote X" vs "engine suggested Y" would find them
  inconsistent by design for the underperformer path.
- **`Tier target: foundation`** surfaces on Progress (`text/05-progress.txt:36`)
  and Report (`text/10-report.txt:44`), and the tier chip drives the reveal
  copy `"Starting at Foundation — your intake put you here"`
  (`text/01-today.txt:10`) via `reveal-copy.ts:52`. **However CSM's JSON has
  ONE set of phases with no `for_tier_ids`** — the tier label surfaces as
  advisory-only, not as a block-selection modifier. Users choosing foundation
  get the same phases + blocks as any other tier. UX consistency issue rather
  than an engine bug: don't advertise tier tailoring if the program's phases
  don't gate on tier.

### persona-erratic (erratic, 45 days, 40% skip rate)

- **Skips and day-adjustments persist correctly.** 15 skipped days
  (`final-store.json:513-573`), 24 day-adjustments (`persona.json:12`), 0
  dismissed proposals. Progress reports adherence honestly: `text/05-
  progress.txt:19-21` "0/25 done · 0% · 18 UPCOMING · 7 SKIPPED".
- **No spurious "welcome back" banner** — confirmed. Last activity Aug 15
  → gap 4 days → no calibration banner (`text/01-today.txt` and
  `text/05-progress.txt` both clean). One legitimate `Morning check
  overdue (4d)` at `text/01-today.txt:37` from the SignalsStrip (Aug 15 was
  the last symptom day). That's the correct, distinct nudge from the pause-
  resume banner.
- **Amber-week hook does not fire** despite 6-7 amber days in each of the last
  five ISO weeks (see §3 P1-11). Norwegian 4×4 still on Thu 20 Aug.

## 5. New adaptation evidence — with real strength lifts logged now

The tonight-audit could only speculate about `evaluateOverperformer` firing
because artifacts were empty. Fresh evidence:

- **Overperformer path is one persona-harness fix away** from being verifiable.
  All prerequisites (green-streak, easy-signal notes, worked-lift sets with
  weight+reps+rpe) are now written to the store. The blocker is the 20-day gap
  between last simulated log and capture date. `evaluateOverperformer` at
  `adapt.ts:416-423` filters `recent` to the last 7 days — extend the
  simulator's log window or ratchet the capture date and this fires.
- **Green-streak on persona-strength is genuine.** All 30 daily
  `derived_state` entries are `green`. Would satisfy `adapt.ts:427-430` if the
  window overlap were fixed.
- **`hasStrengthProgression(program)` returns true for CSM** because
  `concurrent-strength-maintenance.json:369` declares
  `training_maxes.starting_values_kg`. Guard at `adapt.ts:398-399` does not
  gate CSM out — the overperformer path IS reachable in principle.
- **Underperformer maintenance path is verified holding TM as intended.** 60
  days, 40 amber days, RPE 9-10, no automatic TM drop. Matches JSON
  authoring's "TMs held by design" promise. Confirms design over 60 days of
  archetype pressure.

## 6. Landing → app residual gap

Landing's CSM promise is now honestly delivered on Today for the moderate
strength card. Verified:

- `landing/src/i18n/dictionaries/en.ts:56` `csm_pitch: "Add cardio without
  losing the squat."` → Today prescribes 65 % (moderate) / 75 % (heavy) with
  RPE-7 gating, matching JSON's `"5×5 @ 75% TM, RPE ≤ 7"` scheme
  (`concurrent-strength-maintenance.json:286-298`).
- `landing/src/lib/programs-catalog.ts:91` "Two lift days + three-to-four
  low-intensity aerobic sessions + one hard interval" → Week view renders
  exactly that layout (`persona-strength/text/02-week.txt:16-56` — Mon heavy,
  Tue Z2 bike, Wed moderate, Thu 4×4, Fri Z2 row, Sat rest, Sun Z2 bike).

Residual gap is minor:

- **Catalog card jargon ("PR-banned")** (P2-4) still reads harder than
  landing's warmer "Add cardio. Keep the squat."
- **Reveal card copy** on Today does not age past the first phase — a Retest-
  week user still sees "First up: anchor the strength floor." Minor copy
  drift, not a promise break.

## 7. Recommended next fixes — ordered

1. **P1-11 · Amber-week 4×4 drop hook.** Wire the schedule-side path that reads
   `≥3 amber days in prior 7d` and swaps Thu's `block_4x4_row` for a
   `block_z2_row` or rest, gated to CSM. `adapt.ts` produces the amber count;
   consumption belongs in `schedule.ts`/`plan-generator.ts`. Persona-erratic
   and persona-strength-slow both produce the exact firing pattern.

2. **Persona-harness log-window fix.** Extend `simulator-v2.ts` so the last
   log-day aligns with (or overlaps by ≥7 days) the tour-capture date. Today's
   personas stop logging weeks before capture, which starves
   `evaluateOverperformer` (7-day recency filter). Alternatively, capture on
   `last_log_date + 1` per persona. Would unblock A1 verification for
   persona-strength.

3. **P1-10 · Persist `store.cycle.phase_id`.** Add a phase-transition writer
   — on hydrate or on nightly rollover — so persisted state matches computed
   state. Either the writer or a "recompute on read" wrapper; pick one. Not
   surfaced as a visible bug today but the invariant break makes future
   engine work harder to reason about.

4. **Idempotent `program_states[slug]` back-fill on hydrate.** Any user whose
   store predates cccd609 and never went through setActiveProgram after it
   (persona-strength, persona-erratic, and any pre-fix production user) has
   no `program_states[slug]` entry. Add a hydration step that runs
   `ensureProgramStateEntry` when `active_program_id` is set but the entry is
   missing. Would close the reveal-card-forever behaviour and any downstream
   readers that assume the entry exists.

5. **CSM tier semantics.** Either (a) delete the `"Starting at Foundation"`
   copy for CSM (since no phase actually gates on tier), or (b) add
   `for_tier_ids`-tagged phase variants to CSM's JSON. Foundation currently
   surfaces as an advisory-only label with no behavioral consequence.

6. **P2-4 · Catalog card copy.** Replace `PR-banned` with `no PRs this block`
   or match landing's "Add cardio. Keep the squat." Minor.

7. **P1-8 · Report default range** — `LAST 4W` or `SINCE PROGRAM START` on an
   active 6-8 week program instead of `3Y`. Trivial UI default.

8. **Reveal-card aging.** After N weeks or once user has passed phase 1, either
   auto-suppress or swap `First up: …` for a `Now: <current phase goal>`
   headline. Prevents stale first-phase copy from persisting.

---

Total delta: 4 audit items fixed cleanly (P0-4, P0-5, P0-7, P1-7, P1-9),
1 harness gap closed (P0-M partial via ccbaa6d), 3 items still broken (P1-10,
P1-11, P1-8), 2 new observations from archetype variety (reveal-card staleness
across 8 weeks; tier label is advisory-only for CSM). Zero regressions surfaced.
The biggest engine gap (P0-5) is closed; the biggest authoring-vs-engine gap
(P1-11) remains.
