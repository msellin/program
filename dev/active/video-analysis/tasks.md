# Video analysis — tasks

Status markers follow the master-task-list contract: `[ ]` open, `[~]` in
progress (append ` — @agent YYYY-MM-DD`), `[x]` done (append ` — done DATE, sha`),
`[!]` blocked (append ` — blocked: why`).

**Phase 0 verdict recorded 2026-09-01: PASS. Phase 1 is unblocked.**
Remaining Phase 0 items (V0-5, V0-6) are measurements, not gates.

---

## Phase 0 — Spike · GO/NO-GO (~1 day, throwaway code)

- [x] **V0-1** — done 2026-09-01. Bare page + MediaPipe tasks-vision@0.10.14. Stand up a bare HTML page that loads MediaPipe Pose Landmarker
      (WASM) and runs it over a picked video file. No framework, no app
      integration. Just keypoints to the console.
- [x] **V0-2** — done 2026-09-01. 66.4% detection, core 0.525 — framing-limited, not model-limited. Run it over `~/Downloads/VID_20260831_161314.mp4` (back squat,
      side view, 59 s, partial occlusion from a squat-stand upright). Record mean
      visibility for hip / knee / ankle, and the % of frames where any of the
      three drops below 0.5.
- [x] **V0-3** — done 2026-09-01. HSPU clip: **100% detection, core 0.912, nothing below 0.71.** Get a handstand clip from the founder. Run the same measurement.
      **This is the actual decision point.**
- [x] **V0-4** — done 2026-09-01. **PASS.** Inversion closed; framing is the real risk. Record the verdict in `context.md`:
      - upright ≥0.7 mean visibility on hip/knee/ankle → proceed
      - inverted ≥0.6 → handstand ships in v1
      - inverted <0.6 → handstand needs a non-skeleton fallback (track feet +
        wall line), and **strict pull-up becomes movement #1**
- [ ] **V0-5** Time a full 59 s clip at 10 fps sampling on a real phone, not a
      laptop. Confirms the "about 30 seconds" claim in the UX copy is honest.
- [x] **V0-6** — done 2026-09-01. float16 sizes: **lite 5.5 MB, full 9.0 MB,
      heavy 29.2 MB.** Service-worker caching still to verify.
- [ ] **V0-7** Verify each model variant caches cleanly in the existing service
      worker, and that a 29 MB `heavy` fetch is not triggered on first run.

---

## Phase 1 — Headless pipeline (no UI)

- [ ] **V1-0** **Model escalation ladder.** Run `lite` first; if detection over
      the clip < ~85%, re-run with `heavy` and keep the better result. Measured
      2026-09-01: on the founder's squat clip `full` got 60-66% while `heavy` got
      99%, and on the HSPU clip `full` beat `heavy` on visibility. No single
      variant wins everywhere, so the variant must be chosen at runtime from
      measured detection rate — not hard-coded, and not keyed to orientation.
- [ ] **V1-1** `lib/video/worker.ts` — Web Worker hosting the WASM runtime.
      Message protocol: `{frames} → {landmarks[]}` plus progress events.
      **All inference off the main thread. Non-negotiable** — main-thread
      inference freezes the bottom nav and makes the app feel broken.
- [ ] **V1-2** `lib/video/decode.ts` — `<video>` + `canvas` +
      `requestVideoFrameCallback`, sampling at 10 fps (not 30 — 3× cheaper and
      ample for rep counting, depth and hold timing).
- [ ] **V1-3** `lib/video/calibrate.ts` — px→m. Largest detected circle = 450 mm
      bumper; fallback to body height from landmarks; else `null` and velocity
      measures degrade out rather than lying.
- [ ] **V1-4** `lib/video/segment.ts` — rep segmentation from a 1-D signal, with
      hysteresis and a minimum amplitude so a shuffle or a re-grip is not a rep.
      Emits `{repIndex, tStart, tBottom, tEnd}`.
- [ ] **V1-5** `lib/video/analyse.ts` — orchestrates decode → worker → calibrate
      → segment → measures. Emits `VideoAnalysis`.
- [ ] **V1-6** **Ground-truth set: ~10 clips, reps hand-counted, depth
      hand-measured.** Pipeline must hit **100% on rep count** before any UI work
      starts. Rep count is the feature's credibility; get it wrong once and the
      user never trusts a number again.
- [ ] **V1-7** Unit tests over recorded landmark fixtures (JSON, not video) so
      the analyser tests run in CI without media.

---

## Phase 2 — Rubric engine + first three movements

- [ ] **V2-1** `videoRubricSchema` in `schemas.ts`; `video_rubric` as an optional
      block on the exercise object.
- [ ] **V2-2** `lib/video/rubric-eval.ts` — the `when` expression evaluator.
      **Closed grammar, no `eval`, no arbitrary code from data.** Copy the
      discipline in `retest-evaluator.ts`: unsupported forms return null and the
      fault renders as "not evaluated", never throws.
      Grammar v1: `measure[.first|.last|.max|.min] (op) number`, plus binary
      `a - b (op) number` and `a / b (op) number`.
- [ ] **V2-3** Validator: `cue_ref` in range of that exercise's `cues[]`;
      `retest_fills.metric_id` resolves against the program's `retest_metrics`.
      Joins the existing referential-integrity check that fails loudly on load.
- [ ] **V2-4** Author `video_rubric` for **`back_squat_highbar`** (strength,
      side view, plate calibration — founder can test daily).
- [ ] **V2-5** Author for **`strict_pullup`** (gymnastics, front view, cleanest
      rep definition; kip detection = hip-angle variance, which also makes the
      "strict" retest gate honest for the first time).
- [ ] **V2-6** Author for **`wall_handstand_hold`** (isometric hold, timer only,
      no rep segmentation) — proves the schema generalises across kinds.
- [ ] **V2-7** Fault → cue → regression binding, with `sets_rir` writing
      reps-in-reserve from velocity decay.

---

## Phase 3 — Capture UX (file pick only)

- [ ] **V3-1** Entry point on `SetView` / exercise row: "Analyse a video",
      rendered **only** when that exercise has a `video_rubric` and the flag is on.
- [ ] **V3-2** Framing guide screen shown before filming: illustration +
      `video_rubric.framing` text. This is how quality is recovered without
      owning the camera.
- [ ] **V3-3** `<input type="file" accept="video/*">` pick + client-side size
      guard.
- [ ] **V3-4** **Import validation gate.** Pose over the first ~2 s; if mean
      confidence < `min_landmark_confidence` or the view looks wrong, reject with
      a specific reason ("we can't see your hips — film from the side, whole body
      in frame"). **A wrong number is worse than no number.**
- [ ] **V3-5** Progress UI. Copy: **"Analysing on your phone. Nothing is
      uploaded."** Never the word "uploaded" for the processing itself — it spends
      the privacy promise and the storage saving in one sentence.
- [ ] **V3-6** Cancel / retry, and a graceful path when the worker dies.

---

## Phase 4 — Results surface

- [ ] **V4-1** Result view: per-rep table (depth, tempo, velocity), 3-4 keyframes
      (first-rep bottom, last-rep bottom, worst fault frame).
- [ ] **V4-2** Faults render using the exercise's **own `cues[]` text**. No new
      coaching copy anywhere in this feature.
- [ ] **V4-3** Faults → proposals via `selectProposals`; Accept / Ignore.
- [ ] **V4-4** `retest_fills` → `capability_profile[testId].measured_value`
      **as a proposal, never silently.** An auto-filled retest that promotes a
      tier without the user agreeing is the exact failure confirm-first exists to
      prevent.
- [ ] **V4-5** Persist `VideoAnalysis` + keyframes to
      `logs[date].exercises[key].video`. ~250 KB; syncs like any other log field.
- [ ] **V4-6** Week-over-week comparison: this analysis against the last one for
      the same exercise.

---

## Phase 5 — No storage phase

Deleted by the 2026-08-31 decision that the app never stores the clip. Kept as a
heading so nobody re-adds it without reading `plan.md` first.

- [x] **V5-1** ~~OPFS blob store, quota handling, eviction fallback~~ — **not
      built, by decision.** The video stays in the user's camera roll and their
      own cloud backup; a second copy buys nothing.
- [x] **V5-2** ~~Retention sweep, last-3-per-movement, 30-day delete~~ — **not
      built.** Nothing to retain.
- [x] **V5-3** ~~"Delete all clips" settings row~~ — **not built.**
- [ ] **V5-4** Settings/privacy copy: "Your video isn't saved or uploaded. We
      keep the measurements and a few still frames."

---

## Phase 6 — Paywall + founder beta

- [ ] **V6-1** Gate behind `feature_flags.video_analysis` using the existing
      tri-state pattern (`undefined` hides the Settings row entirely).
- [ ] **V6-2** Enable on the founder account only. Minimum two weeks of real use
      before anyone else sees it.
- [ ] **V6-3** Decide what the free tier gets — nothing, or rep count with faults
      paywalled. Open question in `plan.md`.
- [ ] **V6-4** Persona-harness coverage: every catalog/UI change needs a persona
      review in the same commit. A video-capable persona is required before ship.
- [ ] **V6-5** Update `landing/src/i18n/dictionaries/en.ts` if the landing makes
      any claim about this — landing↔app alignment is audited.

---

## Adjacent bug, worth fixing regardless

- [ ] **V-ADJ-1** RPE picker floor is 7 (`Easy/Solid/Grind` = 7/8/9) and
      `inferTMFromSet` derives `rir = 10 - rpe`. A genuinely easy top set is
      unrecordable and the engine under-reads the training max — 5 kg on the
      founder's 31 Aug set. Also: the effort buttons only render when
      `upNext.kind !== "done"`, so the **final set of a session never gets an RPE
      prompt**. Proposed fix: after an AMRAP ask reps-in-reserve directly
      (0/1/2/3/4/5+) and store `rpe = 10 - answer`; keep Easy/Solid/Grind for
      fixed-rep sets.
