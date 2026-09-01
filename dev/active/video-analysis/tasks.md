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
- [!] **V0-5** **GATE on Phase 1 — do this before authoring any rubric.** Time a
      full clip on a real phone, not a laptop, at **both** rates: 10 fps across
      the clip, and 30 fps inside rep windows (60 fps for a muscle-up turnover).
      Skill measures need 3-6× the barbell plan's compute; if a phone cannot
      afford it, the rubrics cannot be authored as written. Was a measurement,
      promoted to a gate 2026-09-01.
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
- [x] **V1-3** ~~`lib/video/calibrate.ts` — px→m from plate diameter~~ —
      **DELETED 2026-09-01, not built.** The Hough detector carries 13-27%
      out-of-plane scale error → absolute velocity at ±15-30%, too loose for
      load-velocity anchors. And the RIR claim that justified it is a *within-clip
      ratio*, so the scale factor cancels exactly and never needed calibrating.
      Handstand-walk distance has a calibration-free construction (cadence ×
      stride-in-body-lengths × user height, ±10-15%). Budget moved to V1-9.
- [ ] **V1-9** **Two-rate sampling.** Scan the clip at 10 fps to locate rep
      windows, then re-sample *inside* those windows at the rate the rubric's
      `sample_fps` demands (30 fps for pull-up/HSPU/handstand-walk cadence, 60
      for muscle-up turnover). Whole-clip 30 fps is unaffordable and unnecessary.
      Hand cadence at 1.5-3 Hz aliases below 30 fps into a **confident wrong**
      frequency, not into noise.
- [ ] **V1-10** **Real frame timestamps.** Take time from
      `requestVideoFrameCallback`'s `mediaTime` and honour the rotation matrix;
      never assume uniform frame spacing. Detect and flag variable frame rate and
      slow-motion capture — skill users deliberately shoot slo-mo, and an
      unnoticed 8× factor makes every tempo and cadence silently wrong with no
      visible symptom.
- [ ] **V1-11** **Body-scale normalisation, enforced by the validator.** No
      positional measure may be a raw ratio of normalised image coordinates:
      `hip_y/knee_y` gives 0.714 or 0.750 for the identical posture depending on
      where the athlete sits in frame. Every positional measure declares
      `normalize_by` (femur, shoulder-to-ankle, hip width) and is rejected
      without it. Skill measures are almost entirely body-internal ratios, so
      this is the measurement layer, not a fix for one bad example.
- [ ] **V1-12** **Subject tracking across frames.** A spotter, a mirror
      reflection, or someone walking through must not switch the skeleton
      mid-clip. Both founder clips had a second person in frame.
- [ ] **V1-4** `lib/video/segment.ts` — rep segmentation from a 1-D signal, with
      hysteresis and a minimum amplitude so a shuffle or a re-grip is not a rep.
      Emits `{repIndex, tStart, tBottom, tEnd}`.
- [ ] **V1-5** `lib/video/analyse.ts` — orchestrates decode → worker → calibrate
      → segment → measures. Emits `VideoAnalysis`.
- [~] **V1-6** **Ground-truth set: ~10 clips, reps hand-counted, depth
      hand-measured.** Pipeline must hit **100% on rep count** before any UI work
      starts. Rep count is the feature's credibility; get it wrong once and the
      user never trusts a number again.
      **Progress 2026-09-01: 4/4 correct** — band bar-MU 4 and 2 (labelled by the
      founder), ring-MU attempts 0 and 0 (negative controls, never completed).
      Rep boundary is decided **structurally**, not by a time gap: a new rep
      requires the shoulder to descend between supports (0.85 vs -0.71 torso — a
      1.5-torso separation, insensitive to threshold). Still needed: strict
      pull-up, HSPU, handstand walk, a failed-rep-mid-set case, and a clip with
      two people overlapping. All four current clips are muscle-ups, whose rep
      boundary is unusually crisp.
- [ ] **V1-7** Unit tests over recorded landmark fixtures (JSON, not video) so
      the analyser tests run in CI without media.

- [ ] **V1-8** `lib/video/detect-view.ts` — **derive the camera view from the
      landmarks, never trust the rubric's declared view.** MediaPipe labels are
      anatomical, so the sign of `r_hip.x - l_hip.x` separates front from rear
      (positive = rear, camera behind); shoulder/hip x-spread collapsing toward
      zero separates side from both. Verified 2026-09-01: correctly returned REAR
      on both founder clips. This is the input that makes per-measure `view`
      enforceable rather than decorative, and it costs three comparisons.

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
- [ ] **V2-0** **Author `cues_corrective[]`.** The field does not exist and
      neither does its content. `cues[]` is populated on 39 of 133 exercises and
      **0 of 40 gymnastics**; 87 exercises use `cues_external_focus[]`. Existing
      strings are pre-lift instructions and do not survive repurposing as
      post-hoc feedback ("Move like the bar is soft" → "You did not move like the
      bar was soft"). ~11 strings covers a three-movement v1. **Blocks every
      other Phase 2 task.**
- [ ] **V2-4** Author `video_rubric` for the **strict pull-up** — movement #1.
      Resolve the real exercise id first (`strict_pullup` does not exist; the
      library uses `pu_*` prefixes). 30 fps inside the rep window.
- [ ] **V2-5** Author for the strict pull-up (gymnastics, cleanest rep
      definition). **NOTE: `strict_pullup` is not a real exercise id** — the
      library uses prefixed ids (`pu_negative_pullup_5s`, `pu_slow_tempo_pullup`,
      …); resolve the target before authoring.
      **Kip detection by hip-angle variance does not work — do not build it.**
      Refuted 2026-09-01: variance confounds shape with magnitude. A linear ramp
      has std 0.289·E, a sine 0.354·E — only 1.22× apart — so an honest 50° tuck
      (14.44°) and a genuine 40° kip (14.14°) are 2% apart and inseparable. It
      catches the obvious kip nobody disputes and misses the borderline cheat the
      strict gate exists for, while occasionally failing an honest hard rep.
      Replace with phase/shape measures at 30 fps inside the rep window: pre-pull
      hang oscillation, sign of hip-angle change, hip-vs-vertical lead-lag, and
      ankle horizontal excursion.
- [ ] **V2-6** Author for the **handstand walk** (`hs_*`) — locomotion, not reps,
      so the rep segmenter does not apply. Proves the schema generalises across
      kinds. Measures: cadence, steps, time inverted, hip-over-shoulder
      alignment, lateral drift; distance via the calibration-free construction.
      **Do not transfer the Phase 0 numbers here** — that 100% / 0.912 clip was a
      *stationary* handstand push-up, not a walk. Locomotion is untested.
- [ ] **V2-9** Author the **bar muscle-up** with a **reduced fault set**: pull
      height and turnover timing, side view, 60 fps in the turnover window.
      Chicken-wing / arm asymmetry is in the non-goals — geometrically impossible
      with one camera (side view resolves the turnover but shows one arm; front
      or rear shows both but the bar occludes the shoulder line and the arms
      foreshorten along the optical axis at that exact instant).
- [ ] **V2-7** Fault → cue → regression binding, with `sets_rir` writing
      reps-in-reserve from velocity decay.

- [ ] **V2-8** **Suppress measures the clip cannot support.** Two gates, both
      discovered by running real clips 2026-09-01:
      1. **View gate.** A measure declaring `view: front` must not evaluate on a
         side clip, and vice versa. From a rear view the founder's knee-tracking
         numbers were pure perspective artifact — both knees moved the *same*
         direction (+0.43, +0.65 stance-widths), which is body translation, not
         one knee caving. Shipped as-is that renders a confident valgus fault
         from a tripod placed off-centre.
      2. **Per-measure landmark confidence.** `min_landmark_confidence` is
         currently one clip-wide number. Each measure must also declare the
         landmarks it depends on and be suppressed when *those* are weak, even
         when the clip passes overall. Concrete case: front-squat bar tilt is
         computed from wrists, which scored **0.30 / 0.38** visibility on a clip
         whose overall core visibility was 0.96. The measure produced a
         plausible-looking 3.5% tilt built on the worst landmarks in the set.
      A suppressed measure renders as "not measurable from this angle" and its
      dependent faults do not evaluate — same degrade-don't-throw discipline as
      `retest-evaluator.ts`.

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

- [ ] **V3-7** **Movement-class verification in the import gate.** The user
      picks the exercise (confirmed founder decision — classification is not the
      app's problem), but a mis-pick must be caught rather than measured. Three
      thresholds over signals the pipeline already computes: hip travel across
      the rep window, whether wrists rise above the nose, and the sign of
      `wrist.z - shoulder.z` (bar in front of vs behind the body). Measured
      2026-09-01 — strict press: hip travel 2.1%/1.7%, wrists above nose, bar in
      front. Front squat: hip travel 12.7%, wrists never above nose, bar in
      front. Wholly separable. Rejects "you picked front squat, this looks like a
      press" instead of emitting depth statistics for an overhead lift.
      **Verification, not classification** — one rubric to check against, not 133
      to choose between, which is why it needs no model and no training data.

---

## Phase 4 — Results surface

- [ ] **V4-1** Result view: per-rep table (depth, tempo, velocity), 3-4 keyframes
      (first-rep bottom, last-rep bottom, worst fault frame).
- [ ] **V4-2** Faults render using the exercise's **own `cues[]` text**. No new
      coaching copy anywhere in this feature.
- [ ] **V4-7** **Margins, not verdicts**, per `plan.md` "Output contract".
      Supersedes the Good/OK/Needs-work scale drafted earlier the same day and
      rejected by both expert reviews. Report the margin with its error band
      ("chin finished about 3 cm under the bar — closest of the set"), never a
      bare pass/fail. **No boolean is ever written into `capability_profile`.**
      Asymmetric confidence: a generous confirmation may auto-write, a
      disconfirmation must go through Accept/Ignore — the app may say "that
      counted" on its own, never "that didn't". The unit is the **attempt**, not
      the rep. Load-gating is retired with the barbell framing.
- [ ] **V4-9** **Pull, never push.** The analysis is only ever shown when the
      user taps for it. `hs_video_review` is annotated "Never auto-shown";
      `pu_video_review` / `mu_video_review` / `hs_video_review` all carry
      `feedback_type: self_controlled` and cite `chiviacowsky_wulf_2002` —
      self-controlled feedback schedules outperform forced ones, and
      `hs_video_review` tracks `video_review_self_select_frequency` as a retest
      metric. Auto-surfacing after every set contradicts the evidence the drill
      rests on.
- [ ] **V4-8** **Capture feedback**, per `plan.md` "Output contract". Closed enum
      owned by the app (`wrong_view`, `subject_too_small`, `cropped`,
      `off_centre`, `occluded`, `absent`, `too_short`), each detected from
      landmark geometry, each with app-owned i18n copy — the rubric contributes
      only `view` and `framing`. Two tiers: **blocking** (refuse with the specific
      reason, never a generic failure) and **advisory** (analysis succeeded, say
      what was suppressed and what fixing the framing would unlock). Every
      measure suppressed by V2-8 must emit an advisory.
- [ ] **V4-3** Faults → proposals via `selectProposals`; Accept / Ignore.
- [ ] **V4-4** `retest_fills` → `capability_profile[testId].measured_value`
      **as a proposal, never silently.** An auto-filled retest that promotes a
      tier without the user agreeing is the exact failure confirm-first exists to
      prevent.
- [ ] **V4-5** Persist **metrics only** (~2 KB) to
      `logs[date].exercises[key].video`. **Keyframes go to on-device storage, NOT
      the synced store** — the store has a ~1 MB PUT limit (`schemas.ts:839`) and
      the founder's whole account is 75 KB today, so 250 KB of keyframes per
      analysis would break sync after three videos. Add a size assertion in the
      writer so this cannot regress.
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
