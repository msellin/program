# Video analysis — plan (2026-08-31)

**Status:** Phase 0 **PASSED 2026-09-01** — see `context.md` for measured results.
Phases 1-6 not built.
**Positioning:** paid-tier feature. On-device only in v1. Founder account tests first.

---

## The one-line version

Point the camera at a set, and the app measures it — reps, tempo, depth, bar
velocity, hold time — then maps what it measured to cues and regressions that
**already exist in `exercises.json`**, and proposes them through the same
confirm-first mechanic as everything else.

Not "AI form check". A **sensor for the metrics the engine already reads.**

---

## Why this is not a new product surface

Three findings from the existing codebase decided the shape of this.

**1. The skill tracks are already 100% self-reported numbers that a camera
measures deterministically.**

| Program | Retest metric | `source` | Captured today |
|---|---|---|---|
| handstand-walk | `wall_hold_max_seconds` | `physical_test` | user types it |
| handstand-walk | `freestand_hold_max_seconds` | `physical_test` | user types it |
| handstand-walk | `walk_distance_max_metres` | `physical_test` | user types it |
| first-strict-pullup | `strict_pullup_max_reps` | `physical_test` | user types it |
| first-strict-pullup | `dead_hang_max_seconds` | `physical_test` | user types it |
| muscle-up | `strict_ring_muscle_up_reps` | `physical_test` | user types it |
| muscle-up | `false_grip_hang_max_seconds` | `physical_test` | user types it |
| muscle-up | `ring_dip_max_reps` | `physical_test` | user types it |

Seconds are a timer. Reps are a keypoint crossing a threshold. Distance is
horizontal displacement. **Every one of these is a measurement we are currently
asking the user to remember.**

**2. `exercises.json` already contains the coaching content.**

Each exercise carries `cues[]` (the corrective cue), `avoid` (the fault in
prose), `flags[]` (e.g. `monitor:click`, `approaches_provocative:resisted_slr`),
and `regression` (what to do instead when it is too hard). A rubric therefore
does not author coaching — it **binds a measurement to an existing cue index and
to the existing regression.** This keeps the feature cheap to extend and stops
the movement library and the video feature drifting apart.

**3. The category mix favours it.** 133 exercises: `gymnastics` 40, `skill` 25,
`strength` 20, `mobility` 18, `trunk` 8, `conditioning` 6, `isometric` 4,
`activation` 4, `unilateral` 3, `primer` 3, `run` 2. **65 of 133 are gymnastics
or skill** — the category where a camera beats a text field by the widest margin,
and the category flagged on 2026-08-17 as the higher-demand direction.

---

## Founder constraint: one video, one exercise

**A video is always attached to a single `exercise_id`.** This is the load-bearing
decision, and it is what makes the whole thing tractable:

- The rubric is selected by `exercise_id`. No movement classification, no "what
  is this person doing" model, no general-purpose vision problem.
- The framing instructions are per-exercise ("side view" for a squat, "front" for
  a pull-up, "wide, camera low" for a handstand walk).
- The faults are a closed set. So is the remediation, because it is `cues[]` and
  `regression` on that same object.
- Analysis attaches to `logs[date].exercises["${blockId}:${exerciseId}"]`, the
  key that already exists.

Corollary: **a video with no exercise attached is not accepted.** There is no
"upload a video and we'll figure it out" path. That is the feature that would
need an LLM per video; this one does not.

---

## Cost model — why on-device, restated with numbers

The founder's own 31 Aug squat clip: 59 s, 1080×1920, 30 fps, **150 MB**
(~20 Mbps).

| What we keep | Per video |
|---|---|
| Original | 150 MB |
| Re-encoded 720p @ 3 Mbps | ~22 MB |
| **Metrics JSON only (synced)** | **~2 KB** |
| Metrics + 4 keyframes (keyframes stay on-device) | ~250 KB |

At 1,000 users × 4 videos/month, storing originals in R2 is ~$9 in month one and
~$108/month after a year and climbing. Storing metrics + keyframes is ~$0.02/month,
flat. **600× difference for data the engine never reads.**

Decision: **v1 uploads nothing.** Cloud storage is a documented v2 option
(see "Deferred"), not a v1 scope item.

---

## Architecture

```
 ┌─ capture ──────────────────────────────────────────────┐
 │  file pick (<input accept="video/*">) from camera roll │  ← v1, ONLY
 │  in-app camera + framing overlay                       │  ← v2, quality upgrade
 └────────────────────────────────────────────────────────┘
                          │  frames @ 10 fps
                          ▼
 ┌─ Web Worker (WASM) ────────────────────────────────────┐
 │  MediaPipe Pose Landmarker (BlazePose, 33 landmarks)   │
 │  → per-frame keypoints + visibility                    │
 └────────────────────────────────────────────────────────┘
                          │  keypoint timeseries
                          ▼
 ┌─ analyser (pure TS, deterministic, unit-testable) ─────┐
 │  1. calibrate px→m (plate 450 mm, or body height)      │
 │  2. segment reps from a 1-D signal                      │
 │  3. compute rubric.measures per rep                     │
 │  4. evaluate rubric.faults → fault ids                  │
 └────────────────────────────────────────────────────────┘
                          │
                          ▼
 ┌─ output ───────────────────────────────────────────────┐
 │  metrics → logs[date].exercises[key].video[]  (~2 KB)  │  durable, synced
 │  keyframes → on-device only (IndexedDB/OPFS)           │  best-effort
 │  faults  → proposals (Accept / Ignore)                 │  existing mechanic
 │  retest  → capability_profile[testId].measured_value   │  auto-fill
 │  clip    → NOT STORED. Stays in the user's camera roll │  never ours
 └────────────────────────────────────────────────────────┘
```

**Zero LLM tokens in the hot path.** The rubric is authored once per movement.
Video #1 and video #100,000 cost the same: nothing.

---

## Rubric schema (draft)

A new optional block on an exercise object in `exercises.json`. Absent = no video
support for that movement, and the capture entry point does not render.

```jsonc
"video_rubric": {
  "view": "side",                       // side | front | rear | either
  "framing": "Full body in frame, phone at hip height, 3 m back, landscape.",
  "calibration": "plate_450mm",         // plate_450mm | body_height | none
  "min_landmark_confidence": 0.6,
  "rep_signal": {
    "landmark": "shoulder_mid",         // what oscillates
    "axis": "y",
    "min_amplitude_frac": 0.12          // of standing height, rejects fidget
  },
  "measures": [
    { "id": "depth_ratio",       "kind": "ratio",    "of": ["hip_y","knee_y"], "at": "bottom" },
    { "id": "torso_angle_min",   "kind": "angle",    "of": ["shoulder","hip","vertical"], "unit": "deg" },
    { "id": "concentric_ms",     "kind": "duration", "phase": "concentric" },
    { "id": "concentric_vel",    "kind": "velocity", "unit": "m/s", "needs": "calibration" },
    { "id": "knee_valgus_max",   "kind": "angle",    "view": "front", "optional": true }
  ],
  "faults": [
    { "id": "shallow",       "when": "depth_ratio > 1.02",              "severity": "warning", "cue_ref": 0 },
    { "id": "depth_drift",   "when": "depth_ratio.last - depth_ratio.first > 0.08", "severity": "hint", "cue_ref": 0 },
    { "id": "torso_collapse","when": "torso_angle_min.last - torso_angle_min.first > 12", "severity": "warning", "cue_ref": 1 },
    { "id": "near_failure",  "when": "concentric_vel.last / concentric_vel.first < 0.7", "severity": "hint", "sets_rir": 1 }
  ],
  "retest_fills": [
    { "measure": "hold_seconds_max", "metric_id": "wall_hold_max_seconds" }
  ]
}
```

Notes:

- `when` expressions stay **machine-evaluable — conditions, not prose**, per
  CLAUDE.md. Same narrow-parser discipline as `retest-evaluator.ts`'s
  `source_ref`: a small closed grammar, no arbitrary code from data.
- `cue_ref` is an **index into that exercise's existing `cues[]`**. No new copy.
- `sets_rir` lets a velocity fault write the reps-in-reserve the RPE picker
  currently cannot express (see "Why this matters for the engine").
- `retest_fills` is what closes the loop with `physical_test` metrics.
- Referential integrity (`cue_ref` in range, `metric_id` resolves) gets checked
  by the validator alongside the existing `program.json` ↔ `exercises.json` check.

---

## Output contract — what the user actually sees

Decided 2026-09-01. The schema above says how a fault is *detected*; this says
what is *rendered*. Both halves are produced with no LLM: a verdict is a filter
over fired faults, and the improvement text is the exercise's own `cues[]`.

```jsonc
{
  "status": "analysed" | "refused",
  "capture":  { "blocking": [...], "advisory": [...] },   // how to film better
  "set":  { "verdict": "ok", "faults": [...], "rir": 2 }, // across-rep faults
  "reps": [ { "index": 1, "verdict": "good", "faults": [], "measures": {...} } ]
}
```

### The verdict scale — derived, never authored

There is no per-movement quality scale, and there must not be one. `depth_ratio
0.95` and `hold_seconds 42` share no units, so nothing can rank them against each
other. What *is* comparable across every movement is **which faults fired and at
what severity** — and `severity` already exists on the fault object.

| Verdict | Rule |
|---|---|
| **Good** | No faults fired |
| **OK** | Only `hint`-severity faults fired |
| **Needs work** | One or more `warning`-severity faults fired |
| **Not measurable** | The rep exists but its measures were suppressed (see V2-8) |

Movement-agnostic by construction: a handstand hold and a front squat both land
on it, because each rubric declares its own faults and the scale only reads
severity. Adding a movement adds faults, never a new scale.

Two rules that fall out and are easy to get wrong:

- **Per-rep and per-set verdicts are separate.** Depth is a property of one rep.
  Velocity decay only exists as a comparison *across* reps and has no per-rep
  value. Do not project set-level faults onto individual reps — the 2026-09-01
  front squat should read *rep 1 good, rep 2 good, set-level hint: slowed 15%
  through the same point both reps*, not *rep 2 needs work*.
- **The verdict must know how heavy the set was.** A grinding final rep at 95%
  is what a maximal rep looks like, not a technique failure. Labelling it "needs
  work" is wrong and it punishes the user for training hard — the opposite of
  what a focused-improvement app should do. Either gate `warning` severity on set
  intensity, or carry it in the copy ("form held to the last rep — expected at
  this load"). **This is a correctness requirement, not a tone preference.**

`"Not measurable"` is a first-class verdict, not an error state. The 2026-09-01
run showed it will be common: a rear-view clip cannot support depth or torso
angle no matter how good the lift was.

### Capture feedback — telling the user how to film better

Measured 2026-09-01: framing is the dominant quality variable, and it is fully
diagnosable from the landmarks themselves. Every issue below is detectable
without asking a model to judge a picture.

| Issue | Detection | What the user is told |
|---|---|---|
| `wrong_view` | `detect-view` (V1-8) disagrees with `video_rubric.view` | "Film from the side for this one" |
| `subject_too_small` | landmark bounding-box height < ~45% of frame | "Move closer, or turn the phone" |
| `cropped` | landmarks pinned at a frame edge, or a limb group's visibility collapses while the rest stays high | "Get your whole body in — your feet are cut off" |
| `off_centre` | bounding-box centre x far from 0.5 | "Centre the phone on you" — required before any left/right measure is trusted |
| `occluded` | intermittent visibility drops on some landmarks while others hold | "Something is blocking the view — move the rack upright out of the line" |
| `absent` | frames with no pose inside the set window | "You stepped out of frame partway through" |
| `too_short` | fewer than one full rep segmented | "Start filming before the first rep" |

Two tiers, and the second tier is the one that makes this a feature rather than
an error dialog:

- **Blocking** — the clip cannot be analysed. Refuse with the specific reason.
  Never a generic "couldn't analyse this video".
- **Advisory** — the analysis succeeded, but something was suppressed. Say what
  was lost and what fixing it would unlock: *"We measured tempo and rep count.
  Film from the side next time and you'll also get depth and torso angle."*
  A suppressed measure (V2-8) should always produce an advisory, so the user
  learns why a number is missing instead of assuming the feature is broken.

**Capture messages are a closed enum owned by the app, not per-rubric prose.**
The rubric authors no copy — that rule holds here too. A finite list is
translatable, testable, and cannot drift per movement. The rubric contributes
only its `view` and `framing` string; the diagnosis and the wording are the
app's.

Advisories are also the honest answer to a limitation this project cannot
engineer away: with one phone and one angle, some measures are simply
unavailable. Saying so — and saying what would fix it — is better than silently
returning a shorter list of faults.

---

## Why this matters for the engine (not just for the user)

On 2026-08-31 the founder ran the top set at 95 kg × 9 with roughly five reps in
reserve. The log recorded `rpe: null`. The RPE picker's floor is **RPE 7**
(`Easy / Solid / Grind` = 7/8/9), so even a perfect log entry could not have
expressed it. `inferTMFromSet` derives `rir = 10 - rpe`, so the engine would have
read 3 RIR instead of 5 — a **5 kg error in the proposed training max**, on the
single number the whole strength track is built from.

Recovering that took a video, a frame extractor, two wrong calls, and six
messages.

**Mean concentric velocity is an objective proxy for proximity to failure.** A
rubric that writes `rir` from velocity decay removes the most error-prone field
in the app. That is the strongest single argument for building this, and it is an
*engine* argument, not a coaching one.

---

## Phases

### Phase 0 — Spike (throwaway, ~1 day) · GO/NO-GO

Decides whether anything else happens.

- Run MediaPipe Pose Landmarker over the founder's existing 31 Aug squat clip.
- Run it over a handstand clip. **This is the real test.** BlazePose is trained
  overwhelmingly on upright humans; handstand-walk is the flagship skill track
  and the worst case.
- Measure: mean landmark visibility, dropout frames, hip/knee/ankle stability.
- Also test the founder's clip specifically for **occlusion** — the squat-stand
  upright crosses the body in roughly half the frames.

**Exit criteria.** Upright ≥0.7 mean visibility on hip/knee/ankle → proceed.
Inverted ≥0.6 → handstand ships in v1. Inverted below that → handstand falls back
to a non-skeleton method (track the feet and the wall line) or ships later, and
**strict pull-up becomes movement #1**.

### Phase 1 — Headless pipeline (no UI)

**Gated by V0-5.** The phone benchmark is now a gate, not a measurement. Skill
measures need 30 fps inside event windows (60 fps for a muscle-up turnover),
which is 3-6× the compute the barbell plan assumed. If a real phone cannot
afford that, the rubrics cannot be authored as specified.

- Worker + WASM harness. **Two-rate sampling**: 10 fps across the clip to find
  the rep windows, then re-sample *inside* those windows at the rate the rubric
  demands. Whole-clip 30 fps is unaffordable and unnecessary.
- **Real frame timestamps** from `requestVideoFrameCallback`'s `mediaTime`, plus
  the rotation matrix. Never assume uniform spacing. Detect and flag variable
  frame rate and slow-motion capture — skill users deliberately shoot slo-mo, and
  an unnoticed 8× factor makes every tempo silently wrong with no symptom.
- **Body-scale normalisation for every positional measure.** No measure may be a
  raw normalised-image-coordinate ratio; each declares `normalize_by` (femur,
  shoulder-to-ankle, hip width) and the validator enforces it.
- Subject tracking across frames — a spotter, a mirror, or a partner walking
  through must not switch the skeleton mid-clip.
- Rep segmentation from a 1-D signal, with hysteresis so a shuffle is not a rep.
- View detection from landmark geometry (never trust the declared view).
- Emit `VideoAnalysis` JSON.
- **Ground truth set**: ~10 clips, hand-labelled. **Chosen to break the pipeline,
  not to demonstrate it** — borderline reps, failed reps, bad framing, two people
  in frame, slow-motion capture. 100% on rep count over a friendly set is not
  validation.

**Not in Phase 1: calibration.** Deleted outright (was V1-3). The plate-diameter
Hough detector carries a 13-27% out-of-plane scale error, putting absolute
velocity at ±15-30% — too loose for load-velocity anchors. And the RIR claim that
motivated it is a *within-clip ratio*, so the scale factor cancels exactly and
never needed calibrating. Handstand-walk distance has a calibration-free
construction (cadence × stride-in-body-lengths × user height, ±10-15%). The
budget goes to the native-frame-rate pass instead.

### Phase 2 — Rubric engine + first movements (skill-first)

- `video_rubric` added to schema + validator.
- Expression evaluator for `when` (closed grammar, unit-tested, no eval).
- **Author `cues_corrective[]` first.** It does not exist, and neither does its
  content: 0 of 40 gymnastics exercises have `cues[]`, 87 of 133 exercises use
  `cues_external_focus[]` instead. The "no new coaching copy" rule is false under
  skill-first and must be retired honestly rather than worked around. Roughly 11
  strings covers a three-movement v1.
- Author rubrics in this order: **strict pull-up → handstand push-up → handstand
  walk**. Then bar muscle-up with a reduced fault set. Never double unders.
- Fault → cue → regression binding.

**Build order and why:**

| # | Movement | Event-window rate | Note |
|---|---|---|---|
| 1 | Strict pull-up | 30 fps | Cleanest rep definition, cleanest capture. Earns the sign-up |
| 2 | Handstand push-up | 30 fps | Inverted tracking is the project's best measured case |
| 3 | Handstand walk | 30 fps | Locomotion, not reps — proves the schema generalises. Biggest information asymmetry: you cannot see yourself inverted |
| 4 | Bar muscle-up | 60 fps | Reduced fault set only — pull height and turnover timing |
| 5 | Double unders | — | Not with pose. Separate feature, separate sensor |

**Exercise ids must be resolved before authoring.** `strict_pullup`,
`wall_handstand_hold` and `strict_press` do not exist in the library; the real
ids are prefixed (`pu_negative_pullup_5s`, `mu_false_grip_pullup`, …).

**Kip detection by hip-angle variance does not work.** Variance confounds shape
with magnitude — a ramp is 0.289·E, a sine 0.354·E, only 1.22× apart, so an
honest 50° tuck (14.44°) and a real 40° kip (14.14°) are 2% apart. Use phase and
shape measures at 30 fps instead: pre-pull hang oscillation, sign of hip-angle
change, hip-vs-vertical lead-lag, ankle horizontal excursion.

### Phase 3 — Capture UX (file pick only)

- **`<input type="file" accept="video/*">` from the camera roll. That is the
  whole capture story in v1.** No camera permission, no recording UI, no
  orientation handling, no `getUserMedia`.
- **Framing guide** shown *before* they go and film: a static illustration plus
  the exercise's own `video_rubric.framing` string. This is how we recover most
  of the quality we give up by not owning the camera.
- **Import validation gate.** Run pose over the first ~2 s on import. If mean
  landmark confidence is below `min_landmark_confidence`, or the view is wrong,
  **reject with a specific, actionable reason** — "we can't see your hips, film
  from the side with your whole body in frame" — rather than emitting a garbage
  analysis. A wrong number is worse than no number.
- All inference in a Worker. Main-thread inference would freeze the bottom nav
  and is the most likely way to make the app feel broken.
- Copy: **"Analysing on your phone. Nothing is uploaded."** Never the word
  "uploaded" for the processing itself.

### Phase 4 — Results surface

- Per-rep table + 3-4 keyframes (bottom of first rep, bottom of last, worst fault).
- Faults render with the exercise's own cue text.
- Faults become **proposals** — Accept / Ignore — reusing `selectProposals`.
- `retest_fills` writes `capability_profile[testId].measured_value` **as a
  proposal, not silently.** Confirm-first is non-negotiable here: an
  auto-filled retest that promotes a tier without the user agreeing is exactly
  the failure mode the mechanic exists to prevent.

### Phase 5 — Keyframes only (there is no storage phase)

**Decision 2026-08-31 (founder): the app never stores the clip at all.**

The video already lives in the user's camera roll and, for most people, their own
iCloud or Google Photos backup. Terav storing a second copy adds cost, quota
management, eviction handling, a retention policy, a deletion UI and a GDPR
surface — to duplicate a file the user already has and can re-pick at any time.

What this deletes from the build:

- No OPFS / IndexedDB blob store, no quota handling, no eviction fallback.
- No retention rule, no "last 3 per movement", no 30-day sweep.
- No "delete all clips" settings row.
- No storage-permission or space-pressure edge cases.

What we keep, in the synced store, permanently:

- The `VideoAnalysis` metrics (~2 KB).
- **3-4 extracted keyframes** as compressed JPEGs (~100-250 KB total) — enough
  for the week-over-week comparison view, and small enough to sync like any other
  log field.

Re-analysis is a re-pick. Nothing is lost that the user cannot restore in two
taps from their own library.

Copy: **"Your video isn't saved or uploaded. We keep the measurements and a few
still frames."**

### Phase 6 — Paywall + founder beta

- Gate behind a feature flag using the existing `feature_flags` tri-state pattern
  (`lib/features.ts`), so it can ship dark and be enabled on one account.
- Founder account only, ≥2 weeks, before any wider exposure.

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| ~~BlazePose unreliable inverted~~ | **CLOSED 2026-09-01** | Spike measured 100% detection and 0.91 core visibility on a real HSPU clip. Inversion is a non-issue; handstand ships in v1 |
| Main-thread jank kills the app feel | High | Worker + WASM, non-negotiable |
| Poor framing from an uncontrolled camera | **High — now the #1 risk, measured** | The upright squat clip scored 66% detection / 0.53 core against the inverted clip's 100% / 0.91, purely on framing. Framing guide + hard import-validation gate is the core quality mechanism, not a nicety |
| Bilateral occlusion in side views | Medium | Far-side limbs ran 0.71-0.79 vs near-side 0.95-0.99. Fine for single-side measures; any asymmetry measure needs `view: front`/`rear` and a both-sides-visible gate |
| `getUserMedia` flaky in iOS Home Screen PWAs | — | **Removed from v1 scope.** Only returns if in-app camera ships in v2 |
| Occlusion (rack uprights, rings out of frame) | Medium | Framing overlay; reject clips below landmark-confidence floor rather than emit garbage |
| Calibration error → wrong velocity | Medium | Require a plate in frame for velocity measures; degrade gracefully to tempo-only |
| Scope creep into "AI coach" | **High** | One video = one exercise. No movement classification. No LLM in the hot path |
| Model download (~6-9 MB) on mobile data | Low | Service-worker cache, fetch on first use behind a prompt |
| Battery / thermals | Low | 10 fps sampling, not 30 |

---

## Non-goals (v1)

- No cloud upload, no account-linked video storage, **and no on-device clip
  storage either** — the app never holds the video, only metrics + keyframes.
- No in-app camera / recording UI (v2).
- No face recognition or identity matching — **hard architectural constraint.**
  It is the line that keeps this outside GDPR Art. 9 special-category data.
- No movement classification from video.
- No LLM per video.
- No real-time coaching *during* a rep (rep counter on screen is fine).
- No sharing / social.
- **No muscle-up chicken-wing / arm-asymmetry detection.** Geometrically
  impossible with one camera: a side view resolves the turnover but shows one
  arm; a front or rear view shows both but the bar occludes the shoulder line and
  the arms foreshorten along the optical axis at exactly that instant. No frame
  rate fixes this. Author the muscle-up side-view with pull height and turnover
  timing only.
- **No double-unders analysis.** There is a pose-only discriminator in principle
  (wrist oscillation frequency: singles ≈1 Hz, doubles ≈2 Hz) but it fails three
  ways: the hand travels 3-8 cm against 5-15 px of landmark noise, so SNR ≈ 1;
  hand oscillation at 3-5 Hz aliases below 30 fps into a *confident wrong*
  frequency; and low-contrast hands pinned to the torso are the worst case for
  hallucinated landmarks at high `visibility`. Audio onset detection is the
  correct and cheaper sensor. Different subsystem, different feature.
- **No boolean pass/fail written into `capability_profile`.** See the output
  contract.

---

## Deferred to v2 (decided, not forgotten)

**Cloud clip storage behind an explicit opt-in.** The analysis showed it costs
600× the storage plus a DPA, a retention policy, deletion plumbing, privacy-page
changes and a consent flow — to buy one thing: clips surviving a phone change.
Nobody has asked for that. Ship on-device, see whether anyone complains.

If built: default off, not bundled with using the feature, granular, withdrawable
in one tap with deletion, consent recorded. Cloudflare R2 with EU jurisdiction
restriction and an Art. 28 DPA. Legal pages updated in the same commit as the
code. Get a qualified review — EU consumer product, video of identifiable people.

Also deferred: LLM narrative layer (send metrics + 3 frames, never video);
side-by-side week-over-week comparison view; coach/physio share link.

---

## Open questions

1. ~~Does BlazePose survive inversion?~~ **CLOSED** — Phase 0, 100% detection.
2. ~~Which movement ships first?~~ **CLOSED 2026-09-01: strict pull-up**, under a
   skill-first direction. Both expert reviews converged on it independently.
3. Does velocity-derived RIR replace the RPE picker on AMRAP sets, or sit
   alongside it? **Now a barbell-only, later question** — it is not what this
   feature is for. Related and unblocked: the RPE floor of 7 is a live bug that
   should be fixed on its own merits, first and alone. It recovers most of the
   engine value for a fraction of the effort, and it is the only way to learn
   whether video actually beats a working picker.
4. Per-video or per-set? A set has one video; does a session with 6 sets get 6?
   Storage is no longer the constraint (we keep ~250 KB either way), so this is
   now a UX question. Proposal: **one analysis per exercise per day**, the top
   set, with re-pick overwriting it.
5. What does the free tier see — nothing, or the rep count with faults paywalled?
