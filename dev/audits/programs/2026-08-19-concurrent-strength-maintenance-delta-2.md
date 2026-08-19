# CSM delta-2 audit — 2026-08-19 (post Batch 5 / Batch 6)

Delta against `dev/audits/programs/2026-08-19-concurrent-strength-maintenance-delta.md`.
Three fresh persona bundles captured today (~00:30 harness4):

- **persona-strength** — overperformer, 30 days, no tier (currentWeek 5)
- **persona-erratic** — erratic 40 % skip / dismiss, 45 days (currentWeek 7)
- **persona-strength-slow** — underperformer, 60 days, `tier: foundation` (currentWeek 9)

Read-only, cross-referenced against the Batch 5 (`05e101b`) and Batch 6 (`33e2061`)
commits.

## 1. Verdict

**CSM's core "keep the squat, don't lose the engine" promise is now delivering
end-to-end for the golden overperformer.** The overperformer TM-bump proposal
fires on persona-strength with both lifts, a real citation, and Accept / Ignore
verbs (`persona-strength/dom/01-today.html` around `Room to push` block; store
still shows starting TMs 115 / 147.5 → proposal persists as designed). The
amber-week 4×4 signal (Batch 5 #4) IS being pushed to the SignalsStrip list on
persona-erratic and persona-strength-slow but ships with no dedicated expanded
render — the label never becomes visible copy, only contributes to the amber
tone and the "+1 more" counter. Two new bugs surface from archetype variety: a
per-track adherence card that reports `0/25 done · 0%` for a persona with 23
logged sessions, and a graduation card ("YOU FINISHED") that leaves an amber
day-adjustment banner ghost-rendered above it.

## 2. Fixed — verified from Batch 5 / Batch 6

### Batch 5 #4 · CSM amber-week SignalsStrip signal is COMPUTING correctly

`next-app/src/components/workout/SignalsStrip.tsx:144-160` gates on
`program.slug === "concurrent-strength-maintenance"`, walks back 7 days, and
pushes `{id: "csm-amber-week", tone: "amber", label: "N amber days this week —
plan will drop 4×4 next week"}` when `amberCount >= 3`. Confirmed:

- persona-erratic has `derived_state: "amber"` on all 7 of the last 7 days
  (`final-store.json` — every day 2026-08-13 … 08-19 amber). List's amber-tone
  contribution is visible: SignalsStrip's border-l is `border-l-amber` on the
  persona-erratic strip (`persona-erratic/dom/01-today.html` — search
  "Today's signals"). Primary label is `Not feeling 100% · ×0.95 applied` with
  `+1 more` — that "+1 more" IS the csm-amber-week signal.
- persona-strength-slow same pattern (`persona-strength-slow/dom/01-today.html`)
  — amber strip, `+1 more`, 7 amber days confirmed
  (`persona-strength-slow/final-store.json` line samples 900-1000 `derived_state:
  "amber"`).
- persona-strength: 0 amber days last 7 → correctly no csm-amber-week signal
  (`persona-strength/dom/01-today.html` — strip's border is `border-l-bronze`
  from a different pathway, not amber).

However — see §3 below — the signal label itself never renders as visible copy.

### Batch 5 #7 & #4 · TM-bump proposal end-to-end on persona-strength

`persona-strength/text/01-today.txt:19-27` renders:

```
ROOM TO PUSH — HEADROOM ON YOUR LOG
Because: 3 straight green days plus 'felt strong' in a recent note. …
block_pull_midshin · 147.5 → 152.5 kg (+5)
back_squat_highbar · 115 → 117.5 kg (+2.5)
Source: Rhea et al. 2003
APPLY BUMP
IGNORE
```

DOM (`persona-strength/dom/01-today.html` around "Room to push") confirms:

- Two lifts rendered inside a `<ul>` (`ProposalCard.tsx` around line 220 shows
  the block_pull_midshin and back_squat_highbar entries).
- Citation link is a real `<button aria-expanded="false" aria-controls>` with
  chevron; tapping it reveals the study title + external URL
  (`components/citations/CitationRef.tsx:37-77`).
- Both verbs render: `<button>Apply bump</button>` and `<button>Ignore</button>`
  (48px+ tap targets, `min-h-[44px]`, correctly WCAG 2.5.5 compliant).

Store confirms the proposal persists across the sim: `training_maxes` still
shows the pre-bump values (`back_squat_highbar: 115, block_pull_midshin: 147.5`)
and `tm_history[]` has only one entry with `source: "sim:cycle_end_accept"`
predating this proposal (`persona-strength/final-store.json:1273-1290`
equivalent — sole tm_history entry). No `dismissed_proposals`, no
`accepted_proposals`. Proposal correctly persists on every render because it's
recomputed from readiness signals, not stored — exactly what the confirm-first
mechanic promises. Accept branch at `ProposalCard.tsx:65-70` writes each lift's
newTM via `setTM` and announces the summary; wired end-to-end.

### Batch 5 #1 · No false pause-detection on persona-strength-slow

60 consecutive days of morning checks plus lifts on ≥18 days (`10-report.txt:28`
STRENGTH SESSIONS 18). Progress opens straight into "This week so far"
(`persona-strength-slow/text/05-progress.txt:7-16`). Zero occurrences of
"Welcome back", "days away", or "Back after" across all three personas' text
AND DOM. `SignalsStrip.tsx:92-95` gates pause banner on `pause.gapDays >= 14`
which now correctly can't fire for a user who logs every day, and
`detectPauseResume` still filters by lifted-session-or-run activity (delta-1
verified).

### Batch 5 #6 · Mid-block retest metrics merged into evaluateRetestMetrics

`retest-evaluator.ts:224-249` reads both `program.retest_metrics` and
`program.retest_metrics_mid_block`, tags mid-block copies with `__mid_block`
suffix. CSM has no `retest_metrics_mid_block` in its JSON (grep for
`retest_metrics_mid_block` in `concurrent-strength-maintenance.json` = 0
matches). Not applicable to CSM specifically — no regression, no evidence-of-fix
either.

### Batch 5 #2 · retest-evaluator aggregation-aware

`retest-evaluator.ts:174-181` handles `trend_slope` (used by CSM's
`submax_hr_pace5_bpm`, `concurrent-strength-maintenance.json:958`). Confirmed
rendering:

- persona-erratic Progress: Submax HR baseline 139 · current 142 · Δ +2.5 bpm
  (`persona-erratic/text/05-progress.txt:56-66`).
- persona-strength-slow: baseline 140 · current 138 · Δ −2.0 bpm
  (`persona-strength-slow/text/05-progress.txt:56-64`).
- persona-strength: baseline 140 · current 141 · Δ +1.0 bpm
  (`persona-strength/text/05-progress.txt:60-70`).

All three deltas are consistent with the `trend_slope` mean-of-first-third vs
mean-of-last-third computation. The prior "point-sample noise dominates" bug
would have produced wilder numbers; the trend surfaces are stable and directional.

The audit prompt asserted CSM used `best_of_last_n`; the JSON actually declares
`aggregation: "latest"` for `back_squat_5rm_kg` and `aggregation: "trend_slope"`
for `submax_hr_pace5_bpm` (`concurrent-strength-maintenance.json:927, 958`). No
`best_of_last_n` metric on CSM. The aggregation-aware code paths exist and are
correct; the specific "best-of-window vs first-of-window" test the prompt asked
about is not exercised by CSM.

### Batch 6 #8 · personas.spec.ts computeStartDate

Sim end-date aligns with capture: persona-strength last log 2026-08-19,
persona-erratic last log 2026-08-19, persona-strength-slow last log 2026-08-19.
The 20-day gap flagged in delta-1 (which starved `evaluateOverperformer`) is
closed — persona-strength now has 3 consecutive green days ending today, which
is exactly what "Room to push" needs (`adapt.ts:416-430` recency filter). This
is what unblocked the golden TM-bump case.

### Batch 5 #5 · HeritageClusterChip runs[] fallback — not applicable to CSM

`HeritageClusterChip.tsx:42` returns null unless `program.non_responder_classifier`
is declared. CSM's JSON has NO `non_responder_classifier` (grep 0 matches).
Chip cannot render for CSM personas — this is engine-builder / rowing-2k only.
The "Room to push" / "Not responding" tint the prompt asked about is unrelated
to CSM's Progress; it lives on those two aerobic programs' Progress panels.

## 3. Still broken

### P1-11 · Amber-week 4×4 drop hook — signal without action, and label invisible

Two half-fixes stacked into one bad UX:

1. **The SignalsStrip label never renders as visible copy.**
   `SignalsStrip.tsx:154-159` pushes the `csm-amber-week` signal into the
   `signals[]` list. But the expanded body block
   (`SignalsStrip.tsx:257-336`) has branches for `override`, `check-overdue`,
   `cycle-end`, `pause`, and `AssessmentDueBanner` — none for
   `csm-amber-week`. So when a user taps the collapsed strip open, they see
   nothing about amber-week. The only affordance the user has to notice
   this signal exists is the "+1 more" counter and the amber tint. That's
   invisible IA. The whole point of surfacing the signal was to preview
   the schedule change — a preview with no visible copy is a phantom.

2. **The actual schedule change still isn't wired.**
   `concurrent-strength-maintenance.json:541` still promises "≥3 amber days
   → drop 4×4 next week". Persona-erratic's next Thursday still shows
   `Norwegian 4×4 · Row / Ski · Thu 20 Aug`
   (`persona-erratic/text/02-week.txt:41`). Persona-strength-slow same
   (`persona-strength-slow/text/02-week.txt:37`). Neither `schedule.ts` nor
   `plan-generator.ts` consumes `derived_state === "amber"` runs. The
   `block_4x4_row → block_easy_recovery` swap the JSON authoring implies
   never happens.

### NEW · PerProgramAdherenceCard reports 0/25 despite 23 logged sessions

`persona-strength/text/05-progress.txt:27-31`:

```
concurrent strength maintenance
0/25 done · 0%
· 25 UPCOMING
```

But persona-strength has 23 log-days with either a completed exercise or a
run in the last 28 days. The fallback path added in Batch 5 #3
(`PerProgramAdherenceCard.tsx:68-88`) is bypassed because `getBlocksForProgram`
returns 25 blocks — all in state `"planned"`. Root cause:
`legacy-to-blocks.ts:75-86` materializes blocks in `state: "planned"` at hydrate
time and never flips them to `done` even when a matching log entry exists.
The migrator DOES set `log_entry_id` (line 145 attaches the day-log key as
the block's log entry pointer) but never mutates `state`. So downstream
readers see 25 planned blocks with 0 done, and the fallback's `blocks.length > 0`
guard sends control past the log-count path
(`PerProgramAdherenceCard.tsx:45-66`).

Persona-erratic hits the same bug (`0/25 done · 0% · 18 UPCOMING · 7 SKIPPED`
at `persona-erratic/text/05-progress.txt:23-27`), and persona-strength-slow
(`0/25 done · 0% · 25 UPCOMING` at
`persona-strength-slow/text/05-progress.txt:23-27`). All three personas.
Every CSM user with logs but no explicit "Mark done" block-action taps hits
this. This regressed CSM Progress in a very visible way — the entire
adherence bar reads red.

### NEW · Graduation ("YOU FINISHED") does not suppress ghost day-adjustment

persona-strength-slow crossed the 8-week mark, so Today renders the "You
finished" bronze card (`page.tsx:657-666`). But ABOVE it, the AMBER pill
"Not feeling 100% · ×0.95 applied+1 more" still renders
(`persona-strength-slow/text/01-today.txt:23-26`). A user who's just
finished the block is being shown a load-adjustment for a session that no
longer exists. The graduation card includes `PICK YOUR NEXT PROGRAM →` and
`End this program` — the SignalsStrip should suppress once the graduation
card fires, or at minimum the accepted-day-adjustment for a
"you-just-graduated" day should not render.

### P1-10 · `store.cycle.phase_id` still stuck at null

`persona-strength/final-store.json` around `cycle` key, `persona-erratic`
same, `persona-strength-slow` same — all `phase_id: null` while the Today
header derives the phase (Retest weeks 7-8 / Intervals weeks 3-6) live from
`program.phases[].starts`. Persisted state and computed state disagree.
Unchanged from delta-1.

### P1-5 · Retest empty-state (`BASELINE —`) unchanged for CSM

All three personas show `BASELINE —` for Back squat 5RM (`5-progress.txt:38`
across all). CSM baseline should come from
`program_states[slug].baseline_training_maxes` written at intake commit; the
harness skips intake commit. Not a regression, pre-existing gap.

## 4. New bugs from archetype variety

### persona-strength-slow · underperformer archetype

- **Amber pill and graduation card both render simultaneously** (as above).
  User sees "Hold load" AND "You finished" on the same screen.
- **`Tier target: foundation` still surfaces as advisory-only** — no phase
  in CSM's JSON gates on `for_tier_ids`, so foundation label has no
  behavioral consequence. `persona-strength-slow/text/05-progress.txt:30`.
- **60 amber morning checks, 18 strength sessions, 24 endurance sessions**
  logged over 60 days (`10-report.txt:20-32`). Report renders substantively;
  no regressions on Report itself.

### persona-erratic · 40 % skip archetype

- **Skipped sessions show as skipped in the adherence card
  (`7 SKIPPED`)**, but done sessions still read `0` — see PerProgramAdherenceCard
  bug above.
- **AMBER state + `Not feeling 100% × 0.95 applied` + `+1 more` invisible signal**
  is the entire above-fold summary for this persona
  (`persona-erratic/text/01-today.txt:10-14`). Signals strip is doing its
  job of consolidation, but the "+1 more" is unrenderable — the amber-week
  signal has no expanded card body. Same bug as strength-slow.

### persona-strength · overperformer archetype

- **TM-bump proposal fires cleanly with a real citation and Accept verb.**
  Golden path confirmed working.
- **`Fatigue or pain flagged today · Consider trimming 5% from the top set`**
  ALSO fires (`persona-strength/text/01-today.txt:10-18`) on the SAME day
  the TM-bump fires (line 19-27). Two contradicting proposals on the same
  screen: engine says "5 % lighter" AND "add weight". Both cite different
  sources (Halson 2014 for the trim, Rhea 2003 for the bump). Confusing to
  see both simultaneously. The overperformer path should suppress the
  day-adjustment softening when it also detects headroom, OR a single
  proposal-selector should pick the higher-priority one and hide the other.

## 5. Recommended next fixes — ordered

1. **PerProgramAdherenceCard 0/25 bug.** Highest visibility, most immediate
   trust break. Fix in `legacy-to-blocks.ts` — when `log_entry_id` is
   attached and the day's log has a `done` exercise or a `runs[]` entry,
   flip the block's `state` from `planned` to `done`. Idempotent because
   the migration already short-circuits on `migrations_applied`. Same
   commit could add a live-hydrate hook that also flips state on future
   log writes so the card stays honest as sessions land.

2. **SignalsStrip csm-amber-week expanded body.** Add a branch mirroring
   `check-overdue` / `pause` at `SignalsStrip.tsx:317` that renders the
   "N amber days this week — plan will drop 4×4 next week" copy plus a
   `Review on Progress →` or `Adjust Thursday →` link. Even a passive text
   block would make the signal visible. Without an expanded body the
   signal is functionally invisible.

3. **P1-11 amber-week 4×4 swap — schedule side.** Wire the actual
   `block_4x4_row → block_easy_recovery` (or rest) swap in
   `schedule.ts` / `plan-generator.ts`. Read `store.logs[key].derived_state`
   for the trailing 7 days; if `amberCount >= 3` and the slug is CSM,
   swap the next Thursday's `block_4x4_row` for `block_easy_recovery`. This
   is what the JSON promises and what the SignalsStrip is (should be)
   previewing.

4. **Suppress contradicting proposals on Today.** Persona-strength shows
   both "5 % lighter" and "Add weight" on the same screen. The proposal
   selector (`proposals/select.ts`) should either priority-rank or use
   mutually-exclusive gates. Overperformer + fatigue-signal is a signal
   contradiction and only one should surface.

5. **Suppress SignalsStrip when the graduation card renders.** On the
   "You finished" branch (`page.tsx:657`), do not render
   `<SignalsStrip>` — a day-adjustment for a session that no longer
   exists is noise. Alternatively, filter `day-adj-active` out when the
   date is on-or-past the current phase's `starts` for the graduation
   phase.

6. **P1-10 · Persist `store.cycle.phase_id`.** Deferred item from delta-1.
   Not surfaced as a visible bug today but any future adaptation reader
   that trusts persisted state over live computation will be wrong.

7. **CSM tier semantics.** Either delete the "Tier target: foundation"
   copy from CSM's Progress / Report surface, or add `for_tier_ids`-gated
   phase variants. Currently the tier chip is advisory-only. Two personas
   show it (`persona-strength-slow`).

---

Total delta: 5 batch items landed with verified positive evidence (TM-bump
end-to-end, amber-week signal computes, no false pause detection,
aggregation-aware retest deltas, sim-end date aligns with capture);
1 batch item lands broken (amber-week label has no rendered body); 2 items
still deferred (schedule-side 4×4 swap, `store.cycle.phase_id` persist);
2 new bugs from archetype variety (0/25 adherence, graduation + amber
pill collision). The single most visible regression is the adherence
card showing 0/25 when 23 sessions are logged — that's what a first-time
Progress visitor will see and it undoes the honesty the rest of the
Report page delivers.
