# Iter 2 — Multi-set logging, PR detection, TM auto-suggest, plates + bar viz

**Target:** https://program-v2.pages.dev
**Anchor date:** 2026-08-31 (Mon, phase_2_cycle_1, `block_squat_heavy`)
**Viewport:** 414×900, Europe/Tallinn
**Harness:** `/tmp/pw-audit/iter2-logging.js` + `debug-addset2.js`, `debug-remove.js`, `debug-typing2.js`
**Screenshots:** `iter2-logging-shots/`
**Raw findings:** `iter2-findings.json`

## Summary

- 47 checks total: **40 PASS**, **1 FAIL**, 6 informational NOTEs.
- One HIGH-severity UX bug: "Add set" is silently a no-op until logged sets exceed the prescribed count.
- Two LOW-severity behaviour observations that are worth explicit policy decisions (see #B2 and #B3).
- PR heuristic in `lib/pr.ts` is fully consistent — it also flags case #16 (heavier weight, fewer reps) as a PR because the rule is literally "no prior set with weight≥current AND reps≥current". The audit brief predicted "NOT a PR"; the code disagrees, and IMO the code is right. Flagged as a spec/doc gap.
- All 6 plate-calculator scenarios pass; `loadFor(1000)` completes in <100 ms with 20 plates, no loop risk.
- All 9 PR-detection scenarios (12–20) pass, including legacy top-level fields and 30-day history scan.
- Video modal (scenario 9) implements focus trap, Escape close, and focus return correctly.
- TM auto-suggest chip threshold logic is correct at Δ=2 kg (hidden) vs Δ=5 kg (shown). Δ=2.5 is unreachable through integer reps and 0.5-step RPE — see NOTE below.

---

## Bugs

### B1 — HIGH — "Add set" button is a silent no-op until `sets.length > defaultSets`

**Repro:**
1. Load Today on a heavy squat day (`block_squat_heavy`, `back_squat_highbar`, defaultSets=5 from item.sets).
2. Log Set 1 (60 kg × 5).
3. Tap "Add set". Nothing appears to change — still 5 rows.
4. Tap "Add set" 3 more times. Still 5 rows.
5. Tap "Add set" 5th time. Now 6 rows appear.

**Instrumented:**
```
click 1: UI rows=5, store sets.length=2
click 2: UI rows=5, store sets.length=3
click 3: UI rows=5, store sets.length=4
click 4: UI rows=5, store sets.length=5
click 5: UI rows=6, store sets.length=6
```

**Root cause:** `ExerciseCard.tsx:64`
```ts
const rowCount = Math.max(sets.length, defaultSets);
```
When the prescription lists 5 sets, the UI always renders at least 5 rows using prescribed slots. Every "Add set" click *does* push a `{null,null,null}` set into the log, but until the log has more sets than the prescription the visible rowCount is unchanged. The button appears broken.

Secondary consequence: the extra empty entries end up persisted in localStorage even though the user didn't intentionally create them, so exported logs may include junk `{weight_kg:null, reps:null, rpe:null}` sets that were the residue of failed "Add set" clicks.

**Fix suggestions (pick one):**
- Only render `defaultSets` empty rows when the user hasn't touched the exercise. Once `entrySets(entry).length > 0`, treat `sets.length` as authoritative and let "Add set" always append.
- OR: disable the "Add set" button while `sets.length < defaultSets` and change its label to reflect that (e.g., "Fill prescribed sets first").
- OR: track a `userAddedCount` explicitly and use `rowCount = defaultSets + userAddedCount`.

**Files:** `src/components/workout/ExerciseCard.tsx:59–64` and how `addSet` is wired to the button at :175–182.

---

### B2 — LOW — Multiple same-day PR badges when higher sets follow lower sets

**Repro:**
1. Seed prior day back squat 80×5.
2. Log Set 1 today at 90×5 → PR badge on Set 1. Correct.
3. Log Set 2 today at 95×5 → PR badge on Set 2. Also correct.
4. Set 1's PR badge is *still* showing alongside Set 2's badge.

**Why:** `pr.ts:isSetPR` only compares against prior *dates* (`date >= ownDateISO` skips the current day). Same-day sets don't invalidate each other. So the user sees "PR · 90 × 5" and "PR · 95 × 5" simultaneously.

**Impact:** Cosmetically noisy. Someone doing three ramp-up sets (all above the previous PR) will get three PR badges. That dilutes the signal. Compare against Strong / Hevy where PR is only granted to the best set of the day.

**Fix:** In `isSetPR`, also short-circuit if there is a *sibling* set on the same day that meets-or-beats. Or filter badges in `ExerciseCard.tsx:145–150` so only the heaviest same-day PR set displays the badge.

**Files:** `src/lib/pr.ts:13–37`, `src/components/workout/ExerciseCard.tsx:145–150`.

---

### B3 — LOW — Sticky `done` after clearing all set fields

**Repro:**
1. Log a set: weight=70, reps=5. Checkbox flips to done. ✓
2. Clear the weight field. Checkbox stays checked. Store still has `done: true`.

**Why:** `useStore.ts:138` sets `done: hasAnyLoggedSet(sets) || ex.done`. Once true, `ex.done` sticks. Undoing an accidental log is not possible from the input row alone — user must uncheck manually.

**Impact:** Marginal. The audit's own "expected" answer was "yes, sticky" and the code matches. Documenting as a policy choice worth confirming: is done-on-log meant to be revocable or only via manual uncheck?

**Files:** `src/lib/useStore.ts:131–141`.

---

### B4 — INFO — TM auto-suggest threshold Δ=exactly 2.5 kg is unreachable via UI

**Observation:** The chip's visibility rule is `if (Math.abs(delta) < 2.5) return null`. The audit asked to test Δ=exactly 2.5. In practice, `inferTMFromSet` uses Epley `w·(1 + maxReps/30)`, `maxReps = reps + max(0, 10 − rpe)`, and `suggestedTM = round(est1RM · 0.85, 0.5)`. With integer reps and 0.5-step RPE, no combination lands the rounded suggestedTM exactly 2.5 above or below the current TM=100 (tested TMs 100 and 110). Δ=2 kg cases hide the chip; Δ=3.5 or 5 cases show it.

**Impact:** None. Threshold behaviour is correct (`<` not `<=`, so exactly 2.5 would render). Just note this in test docs so future contributors don't chase a construction that doesn't exist.

**Files:** `src/lib/engine/suggest.ts:234–245`, `src/components/workout/ExerciseCard.tsx:381`.

---

### B5 — INFO — Spec disagrees with code on scenario 16 (heavier weight, fewer reps)

**Setup:** Prior 90×5, today 92.5×4. Audit brief says "NOT a PR by my heuristic".

**Actual code behaviour:** `isSetPR` iterates prior sets and returns false only if there is a prior set with `weight_kg >= 92.5 AND reps >= 4`. Prior 90 is not ≥ 92.5, so no prior beats today's set → **PR = true**.

**Which is right?** The code is defensible: 92.5×4 is heavier than anything logged before at any rep count. A "no-prior-set-with-weight>=X-AND-reps>=Y" heuristic naturally catches this. If the intent was "PR only when we can prove estimated 1RM went up", that requires a different comparator (e.g., Epley cross-comparison). The current heuristic is simple and reasonable.

**Recommendation:** Update the doc comment on `isSetPR` (currently at `pr.ts:11-12`) to include this case explicitly: "New heaviest weight, even at fewer reps than the prior best, → PR."

**Files:** `src/lib/pr.ts:1–37`.

---

### B6 — INFO — Extra-set-side indicator is passive; no per-set laterality tag

**Observation:** Bulgarian split squat has `default.extra_set_side: "left"`. The laterality spine (aside column) tints L accordingly (`ExerciseCard.tsx:74-88`). But the actual set rows have no L/R annotation — the user is expected to remember "the extra set is left" and log accordingly. Also, the prescribed row count = `item.sets = 3`, so the visual doesn't include the extra 4th (left-only) row.

**Impact:** For a hip-focused rehab program where left–right balance is explicit, this is worth revisiting. A dedicated per-set side field or a 4-row layout with the last row labelled "L" would make the intent unmissable.

**Files:** `src/components/workout/ExerciseCard.tsx:56–88`, `src/lib/schemas.ts:139-144` (SetLog has no side field).

---

## Passes worth calling out

- **PR detection** — all 9 scenarios (12–20) match code intent, including legacy `weight_kg`/`reps` at the top of `ExerciseLog` (scenario 19) and 30-day history scanning (scenario 18). `pr.ts:20–34` correctly walks every prior day and both structured sets and legacy top-level fields.
- **Plate calculator** — `loadFor(1000, 20)` returns 20 plates in 0 ms; greedy has no loop risk. Under/over selection is deterministic and prefers under on ties (scenario 24, `21.25 kg → plates: []` because |−1.25| == |+1.25| and code returns under). `platesLabel` output is human-readable and unambiguous.
- **Rapid typing** — burst of 10 digits fills the weight input, clamps to the 500 cap in `SetRow.tsx:157–159`, and does not lose focus.
- **Tab order** — Set 1 weight → reps → RPE → **note-button** → Set 2 weight. Note button interleaves but is expected per SetRow layout order. Remove button is *not* reached via Tab in the first 8 steps because clicks on it are non-form-critical; that's a reasonable choice.
- **Notes toggle** — content survives closing and reopening the per-set note.
- **Video modal** — dialog opens, Escape closes, focus returns to Watch demo trigger. Focus trap in `useFocusTrap` is functioning.
- **Auto-mark done** — logging weight+reps auto-checks the exercise checkbox.
- **TM chip** — shows only above 2.5 kg |Δ|; tapping "Set TM" mutates `training_maxes[exId]` correctly (verified via `readStore`).
- **Rest timer** — auto-starts when a set flips from unfilled to filled (visible in `s2-set2-95x5.png` screenshot: a 3:00 timer floating panel). Not in this audit's scope but worth noting the interaction.

---

## Untested / out of scope

- Scenario 5 sub-case: intermediate typed value "92." (with trailing dot before the "5") momentarily reads back as empty from the controlled input while the store holds 92. This is a well-known React `<input type="number">` quirk and doesn't cause data loss — final "92.5" is stored correctly. Not flagged.
- Scenario 27 bar-viz alignment inspected by screenshot only (`s27-today-baseline.png`). Rendering looks correct: heaviest plate (25 kg red) nearest to the bar on both sides, 1.25 kg slate outermost. No visual glitch.
- Scenario 28 verified by source inspection only — `BarVisualizer.tsx:12` returns null early when `targetKg <= barKg`, so there is no partial-render possibility.

---

## Screenshots (in `iter2-logging-shots/`)

- `s1-set1-90x5.png` — first-set PR badge visible.
- `s2-set2-95x5.png` — both sets show PR badges (see B2). Rest timer overlay also visible.
- `s3-add-remove.png` — after the add/remove sequence.
- `s9-video-modal.png` — video modal open on first strength exercise with video_search.
- `s27-today-baseline.png` — Today page baseline with suggestion box + bar viz + plate label.

---

## Critical / High counts

- **Critical: 0**
- **High: 1** (B1 — Add set silent no-op)
- **Low/Info: 5** (B2–B6)
