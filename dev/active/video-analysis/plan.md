# Video analysis — plan (2026-08-31)

**Status:** PROPOSED. Nothing built. Phase 0 is a go/no-go spike.
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
| **Metrics JSON + 4 keyframes** | **~250 KB** |

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
 │  metrics → logs[date].exercises[key].video[]           │  durable, synced
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

- Worker + WASM harness, 10 fps sampling.
- Calibration: detect the largest circle → 450 mm; fallback to body height.
- Rep segmentation from a 1-D signal, with hysteresis so a shuffle is not a rep.
- Emit `VideoAnalysis` JSON.
- **Ground truth set**: ~10 clips, hand-counted reps and hand-measured depth.
  Pipeline must hit 100% on rep count before any UI is built.

### Phase 2 — Rubric engine + first three movements

- `video_rubric` added to schema + validator.
- Expression evaluator for `when` (closed grammar, unit-tested, no eval).
- Author rubrics for **`back_squat_highbar`**, **`strict_pullup`**,
  **`wall_handstand_hold`** — one strength, one gymnastics, one isometric hold,
  to prove the schema generalises.
- Fault → cue → regression binding.

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
| BlazePose unreliable inverted | **High** — handstand is the flagship | Phase 0 decides. Fallback: feet + wall-line tracking, no skeleton |
| Main-thread jank kills the app feel | High | Worker + WASM, non-negotiable |
| Poor framing from an uncontrolled camera | **High** — replaces the getUserMedia risk | Framing guide before filming + hard import-validation gate. Reject rather than emit a wrong number |
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

1. **Does BlazePose survive inversion?** Phase 0. Everything downstream assumes yes.
2. Which movement ships first — squat (founder can test daily) or strict pull-up
   (cleanest rep definition, best framing, and it feeds a `physical_test` metric)?
   Leaning **pull-up** for the shipped feature, **squat** for the spike.
3. Does velocity-derived RIR replace the RPE picker on AMRAP sets, or sit
   alongside it? Related: the RPE floor of 7 is a live bug regardless of this
   feature.
4. Per-video or per-set? A set has one video; does a session with 6 sets get 6?
   Storage is no longer the constraint (we keep ~250 KB either way), so this is
   now a UX question. Proposal: **one analysis per exercise per day**, the top
   set, with re-pick overwriting it.
5. What does the free tier see — nothing, or the rep count with faults paywalled?
