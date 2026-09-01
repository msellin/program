# Adversarial technical review — measurement & pipeline design

**Reviewer:** Dr. Nadia Okonkwo-Reinhardt
**Background:** 11 years shipping markerless motion capture. Led the pose pipeline at a
barbell-velocity company (IMU + video fusion, ~200k lifts analysed); built the movement-screen
product at a physiotherapy software vendor where depth and valgus numbers went into clinical
decisions and were reviewed by sports-medicine clinicians. Shipped BlazePose/MediaPipe, OpenPose
and a custom HRNet pipeline to production on consumer phones.

**Scope of review:** measurement and pipeline design only. `plan.md`, `context.md`, `tasks.md`,
`CLAUDE.md` read in full. Reviewed 2026-09-01. Nothing else in the repo was modified.

**Headline:** the *architecture* is unusually well-judged — one video / one exercise, no movement
classification, no LLM in the judgement path, degrade-don't-throw, confirm-first on retest writes.
I have little to add there. The **measurement layer**, however, contains at least four defects that
would ship confidently wrong numbers, and the empirical section reads two-clip anecdotes as
established thresholds. The strongest engine claim (velocity → RIR) survives, but for a reason the
plan has not noticed, and the thing the plan currently treats as the product-blocking gap
(calibration, V1-3) is the claim that does *not* survive. Those priorities are inverted.

Findings ranked Critical / Major / Minor. Each gives the problem, why it bites, and a concrete
change.

---

## CRITICAL

### C1 — `depth_ratio` is dimensionally wrong. So is the hip-travel discriminator.

**Where:** `plan.md:154` (`{ "id": "depth_ratio", "kind": "ratio", "of": ["hip_y","knee_y"] }`),
`plan.md:161` (`"when": "depth_ratio > 1.02"`), `context.md:198` (hip travel "% of frame").

**Problem.** `hip_y / knee_y` in MediaPipe *normalized image* coordinates is a ratio of two
distances-from-the-top-of-frame. It is neither translation-invariant nor scale-invariant. Same
athlete, same squat, framed 15% higher in the sensor:

- centred: hip_y 0.50, knee_y 0.70 → ratio 0.714
- higher in frame: hip_y 0.35, knee_y 0.55 → ratio 0.636

An 11% swing in the flagship measure from moving the tripod. The `> 1.02` threshold is therefore
meaningless as written, and `depth_drift > 0.08` across a set (`plan.md:162`) will fire on any clip
where the athlete drifts vertically in frame — which is every clip where someone walks the bar out
and settles.

The identical error is in the movement-ID discriminator: hip travel expressed as **"% of frame"**
(`context.md:198`). Press 2.1% vs squat 12.7% is not a property of the movement, it is a property of
the movement *times how much of the frame the athlete fills*. A squat shot from 6 m in portrait can
read 6%; a press shot from 1.5 m with a slight knee bend can read 5%. The two "wholly separable"
distributions (`tasks.md:148`) are separable on two clips shot from one tripod position.

The plan's author already knows the right pattern — `min_amplitude_frac` is explicitly *"of standing
height"* (`plan.md:150`). The discipline just did not propagate.

**Why it bites.** Depth is the single most-recognised metric a lifter will check against their own
eyes. Getting it framing-dependent means the same set scores differently on Tuesday and Thursday,
which is precisely the "confidently wrong number" the whole design argument exists to avoid.

**Change.**
1. Ban raw normalized-coordinate ratios from the schema. Every positional measure must be expressed
   as a **difference normalized by an intrinsic body scale** measured on the same frame — femur
   length (`hip→knee` 2-D distance), or standing shoulder-to-ankle length. Depth becomes
   `(hip_y - knee_y) / femur_length_px`, which is invariant to translation, zoom and subject size.
2. Same for hip travel: `Δhip_y / standing_shoulder_to_ankle_px`, not `Δhip_y / frame_height`.
3. Add a schema-level rule and a validator check: a `kind: "ratio"` measure must declare a
   `normalize_by` landmark pair. Reject rubrics without it. This is a one-line guard that prevents
   the whole class.
4. Better still for angles and depth: use MediaPipe's **`worldLandmarks`** (metric-ish, hip-origin,
   roughly scale-normalized) rather than image landmarks — see M8. The plan never mentions them.

---

### C2 — Frame timing is assumed uniform. It is not. Every tempo and velocity number is silently wrong on a large class of clips.

**Where:** `plan.md:107` ("frames @ 10 fps"), `tasks.md:49-51` (V1-2), `plan.md:156`
(`concentric_ms`), `plan.md:157` (`concentric_vel`).

**Problem.** Nothing in the plan reads the **actual presentation timestamp** of each decoded frame.
Real camera-roll video violates the uniform-grid assumption constantly:

- **iOS slow-motion.** A 240 fps capture is stored as 240 fps with a 0.25× playback rate, or as
  variable-rate with a slo-mo segment. Sampling "every 100 ms of playback time" against a clip the
  user shot in slo-mo gives concentric durations **4-8× too long** and velocities correspondingly
  too slow — and the number looks entirely plausible.
- **Variable frame rate.** Phones drop frame rate in low light. A gym at 30 fps nominal frequently
  delivers 24-27 fps with irregular spacing.
- **Trimming in Photos** rewrites edit lists; `currentTime` and frame cadence diverge.
- **Container fps ≠ actual fps** in re-encoded/AirDropped clips.

The spike ran on two clips from one phone in one lighting condition, so this never surfaced.

**Why it bites.** This is worse than a noisy number — it is a *silently biased* number, systematic,
large, and invisible to the user. A slo-mo clip would produce a beautiful, internally consistent,
completely fictional velocity profile. It would also break the velocity-decay RIR claim, because the
biasing factor can change *within* a clip if the user recorded a slo-mo segment.

**Change.**
1. `requestVideoFrameCallback` already hands you `mediaTime` and `presentedFrames`. **Timestamp every
   sample with the real `mediaTime`**, carry it through the landmark timeseries, and compute all
   durations from timestamp differences. Never from a sample index × 100 ms.
2. Reject or flag the clip if measured inter-sample intervals have a coefficient of variation above
   ~15%, or if the derived native frame rate is above ~60 fps (slo-mo detection) — the latter should
   be an *advisory*, not a refusal, because slo-mo is analysable once you know the real timebase.
3. Read and honour the **rotation/display matrix**. Portrait video with a rotation flag drawn to a
   canvas without applying it yields a rotated skeleton — which silently swaps your y-axis rep signal
   and inverts `r_hip.x - l_hip.x`, corrupting both segmentation and view detection at once.
4. Add two adversarial clips to the V1-6 ground-truth set: one slo-mo, one trimmed-in-Photos.

---

### C3 — The `wrist.z - shoulder.z` front-rack discriminator got the right answer for the wrong reason, and was validated with no negative control.

**Where:** `context.md:200-203`, `tasks.md:143-146` (V3-7).

**Problem.** Two separate defects, either of which sinks it.

**(a) There is no negative control.** Both clips were front-rack. Both scored +0.38. The document
presents agreement between two positives as validation. A discriminator tested only on positives is
not tested. The question that matters — *what does a back squat score?* — was never asked. If back
squats also score positive, or straddle zero, the check is worthless. That is not a hypothetical:
in a high-bar back squat the hands sit roughly in or slightly behind the frontal plane, so the true
anatomical Δz is small and the model's regressed Δz has no reason to be reliably negative.

**(b) MediaPipe's `z` cannot bear this weight.** BlazePose's normalized `z` is a *regressed* depth,
scaled like `x`, with the hip midpoint as origin. It is not triangulated and it is not metric. The
model has no depth cue from a single frame; it predicts z from a learned pose prior — essentially
"given this 2-D arm configuration, where does a human's wrist usually sit in depth?" The value
**+0.38** should have been the tell: 0.38 in x-normalized units is a substantial fraction of the
image width, far larger than any physically plausible wrist-vs-shoulder depth offset at that framing.
That is a prior speaking, not a measurement.

The plan's stated reasoning — *"Camera is behind, so positive means the hands are farther away"*
(`context.md:202`) — assumes the model knows where the camera is. It does not. z is camera-relative
only insofar as the network has correctly resolved the subject's front/back orientation from the
image, and single-camera front/back ambiguity is the textbook failure mode of monocular pose. The
whole chain is: prior → orientation resolution → sign. Three places to break, one of them famously
brittle.

You got a correct answer here. You got it because the model's *2-D* arm configuration was
unambiguous (elbows high, hands at clavicle), and the z output was a downstream echo of that. So use
the 2-D signal directly and stop laundering it through z.

**Why it bites.** V3-7 is the gate that stops the app emitting depth statistics for an overhead lift.
If it is built on z, the gate will pass and fail unpredictably on movements nobody tested, and the
failure is invisible — you get a confident wrong classification, not an error.

**Change.**
1. **Remove `z` from the discriminator set entirely.** Treat MediaPipe `z` as non-load-bearing
   everywhere in this feature, and write that into the rubric schema as a hard rule so a future
   rubric author cannot reintroduce it.
2. Replace front-rack detection with 2-D geometry that is view-robust: **elbow height relative to
   shoulder** (front rack keeps `elbow_y` at or above `shoulder_y`; a back rack keeps elbows well
   below), plus **elbow flexion angle** and **wrist–shoulder 2-D separation normalized by shoulder
   width**. All computable from the highest-visibility landmarks in the set.
3. Before V3-7 ships, run the negative controls: back squat, high-bar and low-bar, from front, rear
   and side; report the *distributions*, not the means. If the distributions overlap at all, the
   discriminator does not ship.
4. Generally: every discriminator threshold in V3-7 must be **declared per-rubric**, not as a global
   constant, and each must ship with its measured separation on ≥5 clips per class including
   negatives. Two clips is a demo, not a threshold.

---

### C4 — `visibility` is the wrong signal for the V2-8 confidence gate. It measures the wrong thing, and the one case it caught was luck.

**Where:** `tasks.md:107-115` (V2-8.2), `plan.md:145` (`min_landmark_confidence`),
`context.md:236-239` (the bar-tilt case).

**Problem.** BlazePose's `visibility` is a learned per-landmark score for *"is this landmark present
in frame and unoccluded"*. It is a presence/occlusion classifier output. It is **not** a positional
error estimate, it is not calibrated, and it carries no information about whether the returned
coordinates are correct. The failure mode you must defend against is exactly the one visibility
cannot see: **an occluded landmark that the model confidently hallucinates from its pose prior, and
reports at visibility 0.9.**

The bar-tilt case (`context.md:236`) is being read as proof the signal works. It is proof the signal
*sometimes* works: wrists were genuinely out of view, the model said so, the number was garbage.
Fine. But building the gate on that generalises from the friendly half of the distribution. The
dangerous clip is the one where a rack upright crosses the far knee, the model fills it in from
prior, visibility stays at 0.88, and V2-8 waves through a valgus number computed on an invented
landmark. Your own squat clip at 66% detection is exactly the population where this happens.

**Why it bites.** V2-8 is the designated defence against confident wrong numbers. If the gate's
sensor is blind to the primary failure mode, the defence is decorative — and worse, it manufactures
false assurance, because a suppressed-measure count of zero will read as "the clip was clean".

**Change.** Build the per-measure trust gate from signals that actually correlate with positional
error, none of which need ground truth:

1. **Rigid-segment length stability.** `‖elbow − wrist‖`, `‖hip − knee‖`, `‖knee − ankle‖`,
   normalized by shoulder width, should have low coefficient of variation across a clip (modulo
   foreshortening, which is slow-varying). A CV above ~10-12% on a segment means one endpoint is
   being invented. This is the single best free accuracy proxy in monocular pose and it is ~20 lines
   of code.
2. **Temporal plausibility.** Per-landmark velocity and jerk against a physiological ceiling
   expressed in body-lengths/s. A landmark that teleports is wrong regardless of its visibility.
3. **Bilateral segment-length symmetry** on a squared-up standing frame — left/right femur pixel
   lengths within ~5%, else no asymmetry measure is permitted at all. This is the honest gate for
   the founder's hip-asymmetry case (`context.md:293-296`), and it is stronger than "both sides
   visible".
4. **Test-time-augmentation agreement** for the measures that matter. Re-run the horizontally
   flipped frame (or a second input scale) on the **rep-bottom frames only** — a handful of frames
   per clip — and measure landmark disagreement. Disagreement is a genuine uncertainty estimate and
   it is the thing that would have killed the bar-tilt number without depending on visibility being
   informative. Cost: negligible, because it applies to ~4-8 frames, not 600.
5. Use `visibility` only as a *third*, weakest filter. Suppress on `low visibility **OR** high
   instability`, never on visibility alone.
6. **Evaluate the gate at the frames the measure is taken at, not clip-wide.** `context.md:238`
   quotes clip-mean wrist visibility of 0.30/0.38. What matters for bar tilt at the bottom is the
   trust in the ±3 samples around each bottom. A clip mean hides the concentrated-dropout case,
   which is the common one — occlusion peaks at the bottom of a squat, exactly where depth is read.

Also verify empirically what `visibility` even does in `tasks-vision@0.10.14` — across MediaPipe
versions this field has been variously well-populated, near-constant, or effectively unimplemented
in the Tasks API. Do not build a gate on a field whose behaviour in your pinned version is unverified.

---

### C5 — Detection rate is the wrong escalation trigger, and "keep the better result" is undefined in the one case your own data documents.

**Where:** `context.md:130-136`, `tasks.md:39-44` (V1-0).

**Problem.** "Detection rate" is the fraction of frames returning *a pose object*. MediaPipe returns
a pose whenever its person detector fires; the difference between 60% and 99% is overwhelmingly
about detector recall, not landmark accuracy. It is a **presence** metric being used as a **quality**
metric.

Your own data shows the two diverge and can *anti*-correlate: on the HSPU clip `full`@480 scored core
visibility 0.912 while `heavy`@720 scored 0.739 (`context.md:126`). So the ladder says "escalate,
keep the better result" — better by what? If "better" means detection rate again, you will
systematically select the model that returns more frames with worse landmarks. That is the HSPU case,
and the ladder as written would get it wrong.

And the case the ladder cannot see at all: a clip at **100% detection and 0.95 visibility where the
skeleton is flipped 180°, locked onto a bystander, or hallucinating the far leg.** Nothing in the
ladder — or anywhere else in the plan — detects confidently-wrong. The escalation trigger and the
quality gate are the same blind spot.

The 85% threshold is a number derived from n=2 clips (`context.md:116`), and it is the wrong *shape*
of threshold regardless of its value: a clip average. Rep counting tolerates 70% detection with gaps
in the easy parts. Depth needs near-continuous hip/knee **specifically in the ±0.3 s around each
rep's bottom**. A clip that is 95% detected with the missing 5% concentrated at every bottom passes
an 85% average gate and cannot support the measure it was gated for.

Separately, `context.md:114-116`: `full`@720 scoring **65.5%** while `lite`@720 scores **78.7%** on
the same clip is anomalous. A larger model markedly underperforming a smaller one on identical input
is more likely a rig artifact — input scaling, aspect/letterbox handling, delegate difference —
than a real capability inversion. That anomaly is currently load-bearing for the entire
"no single variant wins everywhere" architecture. Root-cause it before it becomes an architecture.

**Why it bites.** The ladder is the mechanism that is supposed to rescue hard clips. Built on the
wrong metric, it will sometimes make clips worse, will burn a 29 MB download and double the wait to
do so, and will never catch the failure that actually damages user trust.

**Change.**
1. **Escalate on a composite quality score computed over the rubric's *required* landmarks only**,
   combining: gap statistics (longest run of missing samples, and gaps inside rep windows
   specifically), segment-length CV, jerk outliers, and left/right label-swap events. Detection rate
   can be one term; it must not be the term.
2. **Select the winning variant by the same score**, and define it in code. "Keep the better result"
   is not a specification.
3. Replace the single clip-wide 85% with **per-measure, per-rep-window gates**: a measure evaluates
   only if its required landmarks have ≥N consecutive good samples in the window it is read from.
   This subsumes V2-8.2 and makes the two gates one mechanism.
4. Add explicit **confidently-wrong detectors** independent of the model: segment-length violation,
   left/right swap (detect a sign flip of `r_hip.x − l_hip.x` mid-clip and treat it as a hard fail,
   not a view change), and subject-identity continuity (below, M6).
5. Make the ladder `lite → full → heavy`. It currently jumps from 5.5 MB straight to 29.2 MB
   (`context.md:128`), skipping the 9 MB rung, on the strength of a single clip. On a phone on
   cellular that is a bad default, and it doubles the "about a minute" claim the copy makes.
6. Consider escalating **only the rep windows**, not the whole clip. That is typically 30-40% of
   frames — 1.3× total compute instead of 2×.

---

## MAJOR

### M6 — There is no subject tracking. A spotter, a training partner, or a mirror breaks everything silently.

**Where:** absent from `plan.md`, `tasks.md`, `context.md`.

**Problem.** MediaPipe Pose Landmarker with `numPoses: 1` returns *a* person per frame, chosen by
detector score. It does not guarantee the *same* person across frames. In a real gym: a spotter steps
in on the last rep; a partner walks behind the rack; a mirror (present in most commercial gyms)
provides a second full-body human that the detector will happily lock onto. The skeleton can jump
mid-clip, and the resulting 1-D signal contains a discontinuity that looks exactly like a rep.

Both spike sessions were solo clips filmed in a home rack. This class of failure is structurally
invisible to the evidence collected so far.

**Why it bites.** Rep count is the credibility metric (`tasks.md:62`). A phantom rep from an
identity switch is the single most visible way to lose a user's trust, and V1-6's 100%-on-10-clips
bar will not catch it because those 10 clips will be founder clips.

**Change.** Set `numPoses: 2-3`, and track the subject explicitly across frames by bounding-box IoU
and scale continuity. Pick the subject on the first confident frame (largest, most central, highest
score) and hold that track. Emit a **blocking** capture fault `multiple_people` when a second pose
persists near the subject for more than ~1 s, or when the track is lost and re-acquired. Add to the
V4-8 enum. Add a two-person clip and a mirror clip to the ground-truth set.

### M7 — Camera motion is undetected, and the 1-D rep signal is an absolute image coordinate.

**Where:** `plan.md:146-150` (`rep_signal.landmark: "shoulder_mid", axis: "y"`), `tasks.md:55-57`.

**Problem.** An absolute image-space y coordinate conflates athlete motion with camera motion and
zoom. A phone propped on a plate that gets nudged, a clip where someone hands the phone over, or an
athlete who walks the bar out and drifts in frame, all inject signal that hysteresis and minimum
amplitude cannot distinguish from a rep. Nothing in the plan detects camera motion at all — it is
not in the capture-quality table (`plan.md:244-252`) either.

**Change.**
1. Make the rep signal **intrinsically relative**: `(hip_y − ankle_y) / (shoulder_y − ankle_y)` or
   an equivalent body-internal ratio. This cancels camera translation and zoom for free and removes
   the need to detect them for segmentation purposes.
2. Still detect camera motion for the *velocity* path, where a relative signal is not available:
   frame-differencing on a static border region, or global translation of the landmark cloud not
   explained by within-body geometry. Emit an advisory (`camera_moved`) and suppress velocity
   measures for the affected window.

### M8 — Rep segmentation has no specification for the cases that actually occur.

**Where:** `plan.md:319` and `tasks.md:55-57` (V1-4).

The family (1-D signal, hysteresis, min amplitude, min phase durations) is the right one. Say so and
move on. What is missing is every case that is not a clean rep:

| Case | What breaks | Required behaviour |
|---|---|---|
| **Failed rep / grinder** | Partial excursion may fall under min-amplitude and vanish from the count | Classify as `partial` and **report it**, never drop it. A dropped rep is a wrong rep count |
| **Rest-pause / cluster** | Long top dwell reads as one set with weird tempo | Detect intra-clip gaps > ~10 s; emit `cluster` segments |
| **Two sets in one clip** | Same | Set-window detection; analyse the longest, advise the user |
| **Touch-and-go vs dead-stop** | Bottom dwell of 0.2-0.3 s = 2-3 samples at 10 fps | Detectable but marginal — needs the 30 fps rep-window pass (M9) |
| **Re-grip, chalk, bow, bar pickup** | Squat-amplitude excursion that is not a rep | Add a **rep-shape validity** test: monotone eccentric, monotone concentric, duration within a factor of the modal rep. Reject outliers |
| **Clip starts mid-set / in the hole** | No standing baseline → every normalization is undefined | Explicit baseline estimation with a robust-percentile fallback, and a **blocking** `no_standing_baseline` fault when neither is available |
| **Landmark dropout inside a rep** | Undefined. At 66% detection this is the norm, not the exception | Explicit gap policy: interpolate ≤2 consecutive missing samples; beyond that the rep is `not measurable`, not silently interpolated |

The dropout policy is the one that is genuinely absent and genuinely common. A 5-sample gap at a
squat bottom on a 66%-detection clip destroys depth, and nothing currently says what happens.

### M9 — 10 fps is fine for reps, holds and depth. It is not fine for velocity, and it does not support the sticking-region finding at all.

**Where:** `plan.md:107`, `plan.md:411`, `tasks.md:49-51`, `context.md:224`.

- **Rep count, hold timing:** 10 fps is ample. Correct call.
- **Depth:** near-zero velocity at the turnaround means a ≤50 ms sampling offset costs
  ~½·a·t² ≈ **1-2.5 cm** at typical turnaround accelerations. Acceptable. Correct call.
- **Mean concentric velocity:** *not* acceptable. MCV = ROM / duration, and duration is the problem.
  Phase-boundary detection at 10 fps carries roughly ±1-1.5 samples of ambiguity at *each* end, so
  ±100-150 ms. On a 0.6 s submaximal concentric that is **±17-25%**, and on a 1.2 s grinder ±8-12%.
  Note this error does *not* cancel in the rep-to-rep ratio, which is the RIR signal (see C10).
  `context.md:220` reports a 15% slowdown from 1.30 s → 1.50 s. At 10 fps those are 13 and 15
  samples: the decay is **15% ± ~11%**. It is barely distinguishable from quantization and it is
  reported as an established finding.
- **Peak velocity and the sticking region:** unsupportable. `context.md:224` claims a repeatable
  sticking region from a velocity sequence of `0.14 → 0.05 → 0.13`, and defends it with *"lasts
  0.3-0.4 s across 3-4 samples, so not a smoothing artifact"*. Three to four samples is the bare
  minimum to assert a feature exists, and these velocities are **first differences of noisy
  positions divided by 0.1 s**, which amplifies landmark jitter by 10×. Normalized-coordinate jitter
  of ±0.005 becomes ±0.05 units/s of velocity noise — the same magnitude as the claimed dip. Two
  reps agreeing is not independent confirmation when both come from the same clip, same lighting,
  same occlusion pattern. Duration is not evidence against noise; noise is not smoothing.

**Change.** Decouple the sampling rates. **10 fps for the whole clip** (rep counting, depth, holds,
view, capture QC), then a **second pass at native frame rate inside rep windows only** for phase
boundaries and velocity. That is ~1.3× total compute, not 3×. Fit velocity by regressing position
over the concentric window rather than first-differencing, and attach a confidence interval to every
velocity number the UI shows. Drop the sticking-region finding until it can be reproduced at 30 fps
on a clip that is not the one it was discovered on.

### M10 — The capture-quality table: three entries are unreliable as specified, one is factually wrong, and the important failures are missing.

**Where:** `plan.md:244-252`.

Working as specified: `absent`, `too_short`. Both trivially derivable. Fine.

**`cropped` is wrong as written.** "Landmarks pinned at a frame edge" — MediaPipe **extrapolates
landmarks outside the image**, returning normalized coordinates below 0 or above 1. They are not
clamped to the edge. As specified this detection will simply miss. The correct test is
`x ∉ [0,1] || y ∉ [0,1]` sustained over a fraction of frames, combined with a limb-group visibility
collapse. Small fix, but it is the kind of thing that ships silently broken.

**`off_centre` is under-specified for the job it is given.** Bounding-box centre-x vs 0.5 detects
"subject not centred in frame". The thing that manufactured the phantom valgus (`context.md:230-232`)
is *camera off the plane of motion* and *camera height* — a subject can be perfectly centred in a
frame shot from an oblique angle or from hip height on a chair. The stated guarantee — "required
before any left/right measure is trusted" — is not delivered by this test. Replace with a **standing
bilateral-symmetry pre-check**: left/right segment pixel lengths within ~5% on a standing frame, else
no asymmetry measure evaluates. That test measures the thing you care about directly.

**`occluded` is unreliable** for the reason in C4: it is built on visibility, and hallucinated
occluded landmarks keep high visibility. Rebuild on temporal discontinuity + segment-length
violation.

**`subject_too_small`** works but uses the wrong quantity. Bbox height varies 30%+ through a squat
and flips with orientation. Use **standing shoulder-to-ankle pixel length**, and state the real
requirement in physical terms: depth needs a hip-to-knee separation of tens of pixels to be
meaningful. Derive the threshold from pixels-per-metre, not from a frame fraction.

**`wrong_view`** — see M11.

**Missing entirely, in rough order of how often they will occur:**

1. **Slow-motion / variable frame rate** (C2) — silent, large, systematic.
2. **Multiple people in frame** (M6).
3. **Camera motion / handheld** (M7).
4. **Rotation-metadata mishandling** (C2.3) — inverts view detection and the rep signal together.
5. **Motion blur / rolling shutter** — landmark noise scales with limb speed, which is exactly where
   the velocity measure lives. Detect with Laplacian variance on the subject crop; advisory only.
6. **No standing baseline** (clip trimmed to start mid-set) — every normalization depends on it.
7. **Zoom or camera repositioned mid-clip** — invalidates calibration and the rep signal.
8. **Mirror in frame** — a second full human; gyms are full of them.

### M11 — View detection: no mirroring handling, no oblique case, no temporal voting.

**Where:** `tasks.md:68-73` (V1-8), `context.md:204-206`.

The `sign(r_hip.x − l_hip.x)` trick is clever and free, and it is the right primitive. Three gaps:

1. **Mirroring.** Front-camera capture is mirrored by default in many capture paths, and some editors
   preserve the mirror. A mirrored front-view clip reports **rear**. This inverts the verdict for the
   whole clip, and there is no signal in the landmarks alone to detect it — you would need text/logo
   orientation or a user prompt. At minimum: when the rubric declares `front` and detection says
   `rear`, the message must not confidently say "you filmed from behind"; and never use view
   detection to authorize a left/right-specific claim (that is what the symmetry pre-check in M10 is
   for).
2. **Obliqueness is not a three-way enum.** Real clips are 20-60° off axis. A sign test returns a
   crisp `front` for a 40° oblique clip whose depth measures are already badly foreshortened —
   `context.md:243` documents exactly this foreshortening problem and then the design encodes view as
   a categorical. Compute a **continuous view angle** from `shoulder_x_spread / expected_shoulder_
   width` and let each measure declare an angular tolerance band.
3. **Single-frame decision.** Require agreement across ≥90% of confident frames plus a magnitude gate
   (`|Δx|` above a fraction of shoulder width); near a true side view the sign is pure noise. A
   mid-clip sign flip is a **left/right label swap** — a hard model failure — not a camera move, and
   must be treated as such.

---

## MINOR

### m12 — The V1-6 bar is stated as strong and is weak.

`plan.md:322` / `tasks.md:61-63`: "100% on rep count" over ~10 clips. Ten founder-filmed clips is a
best case, and a pass/fail on that set will read as validation it has not earned. Require the set to
include, explicitly: a failed rep, rest-pause, a re-grip, a spotter entering frame, a handheld clip,
a mid-set start, a slo-mo clip, a mirror-visible clip, and one clip at each of the three view angles.
Report per-clip results, not a pass/fail. 100% on adversarial clips is a real bar; 100% on easy ones
is a demo.

### m13 — `worldLandmarks` are never mentioned.

MediaPipe returns metric-ish, hip-origin world landmarks alongside image landmarks. They solve most
of C1 for free (joint angles and depth ratios become scale- and translation-invariant with no
normalization discipline required) and are strictly better for anything angular. They are hip-centred,
so they remove global translation and are therefore **useless for absolute bar velocity** — but that
split is exactly what you want: `worldLandmarks` for angles and depth, image landmarks for
translation and velocity. Evaluate them in Phase 1.

### m14 — The escalation ladder's user-facing cost is unaccounted.

`context.md:102-104` already softened the timing claim to "about a minute". Escalation doubles the
inference *after* the user has already waited, and can trigger a 29 MB download on cellular
mid-analysis. There is no design for what the user sees during that. Decide now: escalate silently
with a progress bar that does not reset, escalate only on Wi-Fi, or escalate rep-windows only (C5.6).

### m15 — `context.md`'s narrative over-reads its own data. Several specific cases.

The document's instinct — write down what you discarded and why — is genuinely good practice and the
discarded-findings section (`context.md:228-244`) is the most valuable half of the file. But:

- **`context.md:222`** — "eccentric *lengthened* rep 1 → rep 2 (0.70 → 0.90 s) ... controlled descent
  under fatigue, no dumping." That is 7 samples vs 9 samples, on rep 2 of 2. There is no fatigue at
  rep 2, and a two-sample difference is not a behaviour. Delete the interpretation, keep the number.
- **`context.md:244`** — "right shoulder lower ... **growing 1.25% → 1.99% with fatigue**". 0.7
  percentage points across two reps. The document correctly concludes "not a finding" — but the words
  "with fatigue" should not be in the sentence at all. Naming a mechanism for noise is how noise
  becomes a feature three months later.
- **`context.md:200`** — "+0.38 on both" presented as confirmation. No negative control (C3).
- **`context.md:186-193`** — two clips, 100%/99.5%, used to conclude framing dominates. The
  conclusion is probably right, but these are two clips of one athlete, one rack, one camera
  position, one session. That is n=1 *setup*, not n=2.
- **`context.md:243`** — "geometry said hip ~ knee (0.95); the frame is **clearly** well below
  parallel". The refutation here is a human eyeballing a keyframe — the same visual judgement the
  document elsewhere insists is unreliable. The defensible statement is stronger and simpler: *depth
  is not measurable from a rear view*. Full stop. Not "it read 0.95 and the truth was deeper".
- **`context.md:246`** — "The vision-model layer failed three times; **the arithmetic never did**."
  This is selection bias, and it is the most consequential over-read in the file. In the same session
  the arithmetic produced knee valgus, lateral hip shift, heel rise and bar tilt — **four wrong
  results** — every one of which was caught by a human applying judgement, not by the pipeline. The
  arithmetic failed at least as often as the model. What it did better was fail *auditably*. That is
  the real and genuinely important lesson, and it argues for exactly the instability/plausibility
  checks in C4, because in production there is no human auditing each number. As currently phrased,
  the sentence licenses trusting geometric outputs nobody checked.

**Credit where due:** the good-morning refutation (`context.md:250-255`) is the best piece of analysis
in either document. Using the hip-rise/shoulder-rise **ratio** was the correct instinct — it is
robust to the very foreshortening the document had just diagnosed, because both numerator and
denominator are affected alike. Keep that instinct; it is the same instinct that saves the RIR claim
in C10. It should still carry error bars: it is a ratio of small differences at 10 fps.

---

## C10 — Calibration and the RIR claim. (Filed last because it is the finding that changes the plan's priorities.)

**Severity: Critical.** **Where:** `plan.md:319` and `tasks.md:52-54` (V1-3), `plan.md:277-293`,
`context.md:286-289`.

### The calibration plan as written will not work.

**"Largest detected circle = 450 mm bumper"** has four independent problems:

1. **There is no circle detector in this pipeline, and one bullet does not scope one.** Hough circles
   in-browser means either OpenCV.js (another ~8 MB WASM payload, on top of a 5.5-29 MB model) or a
   hand-rolled gradient Hough over decoded frames. This is the largest single piece of non-MediaPipe
   CV work in Phase 1 and it is one line in `tasks.md`.
2. **The largest circle in a gym frame is frequently not the plate.** A wall clock, a fan, a Swiss
   ball, a plate on a storage tree behind the lifter, the bumper on the far end of the bar. Any of
   these at a different depth from the plane of motion produces a scale error proportional to the
   depth ratio, silently.
3. **Diameter is not a constant.** 450 mm holds for competition bumpers and 20 kg iron, but 15/10/5
   kg iron plates are 400/325/250 mm, and change plates are smaller still. The founder's own 31 Aug
   set was 10+10+10+5+2.5 per side (`context.md:8`) — the exact configuration where "largest circle"
   only lands on 450 mm if a full-diameter plate happens to be loaded.
4. **A single px→m factor is only valid in one plane, perpendicular to the optical axis.** The plate
   sits on the bar end, typically 0.4-0.8 m nearer a side camera than the athlete's midline. At 3 m
   working distance that is a **13-27% scale error** on anything measured at the body. A perspective
   camera's px/m also varies across the frame.

The body-height fallback is weaker still: it requires a full-body, squarely-framed, feet-flat
standing frame — precisely what a poorly framed clip lacks — plus a user height the app does not
appear to hold. Realistically ±5-8% at best.

### The error budget, honestly

| Source | Contribution to **absolute** MCV |
|---|---|
| Timing quantization / phase-boundary ambiguity at 10 fps | ±8-25% (M9) |
| Scale from an out-of-plane plate | 13-27% |
| Plate-diameter misidentification | 0 or ~15-45% (discrete) |
| Out-of-plane bar motion (lost to projection) | 0-10% |
| Landmark noise on the tracked point | ±2-4%, partly cancelling over full ROM |

Realistic total on absolute mean concentric velocity: **±15-30%**, with a fat discrete tail. Published
load-velocity and velocity-loss anchors need roughly ±0.03-0.05 m/s (5-8%) to mean anything. **The
absolute-velocity claim does not survive its own error budget, and cross-session comparison — which
`context.md:288` calls "the gap that blocks the feature being a product" — is the *first* thing this
budget kills.**

### But the RIR claim survives — and the plan has not noticed why.

The fault that carries the whole engine argument is
`concentric_vel.last / concentric_vel.first < 0.7` (`plan.md:164`). **That is a ratio within one
clip.** Same camera, same subject, same plane, same session — the scale factor is a *constant
multiplier* and it **cancels exactly**. Plate-diameter error: cancels. Out-of-plane depth error:
cancels. Body-height error: cancels. Lens scale: cancels.

So the strongest engine argument in the plan (`plan.md:277-293`) **needs no calibration at all.**

What does *not* cancel is timing quantization (M9), which is per-rep and independent. On a 0.6-0.8 s
concentric at 10 fps, a measured 30% decay carries roughly ±15-20 percentage points of noise. The
`< 0.7` threshold is therefore *marginal at 10 fps and solid at 30 fps* — which is the entire
argument for the rep-window native-rate pass in M9.

### Recommended change: invert the priority.

1. **Cut V1-3 (plate calibration) from Phase 1.** Do not build a circle detector. It buys only
   cross-session absolute velocity, which the error budget does not support anyway.
2. **Ship the RIR signal uncalibrated, in frame-relative units, as a within-clip ratio.** State this
   explicitly in the schema: velocity-*ratio* measures are calibration-free; velocity-*absolute*
   measures require calibration and, until it exists, degrade out (which `tasks.md:54` already gets
   right as a mechanism — apply it to the whole absolute path).
3. **Spend the saved effort on the 30 fps rep-window pass (M9)**, which is what actually makes the
   RIR number trustworthy. Higher value, less code, no extra download.
4. If cross-session comparison is later wanted, do not use a plate. Use a scale reference **in the
   plane of motion**: the athlete's own standing shoulder-to-ankle pixel length plus a one-time
   user-entered height. Require it to agree within ±10% of previous clips for the same exercise, and
   refuse the comparison otherwise. That is far more robust than any object in the background, and it
   is ~30 lines instead of a Hough transform.
5. **Never render an absolute m/s number without a confidence interval.** A velocity shown to two
   decimal places at ±25% is a lie told precisely.

Finally, a note on the motivating story: the 5 kg training-max error (`plan.md:277-291`) is caused by
the RPE picker's floor of 7, and V-ADJ-1 (`tasks.md:224-231`) fixes it with a UI change and no
computer vision at all. Video-derived RIR is a genuinely good *second* source for that field, but it
is not the cheapest fix for the problem the plan uses to justify it. Fix the picker first; it costs
an afternoon, and it removes the risk of the video feature being judged on whether it rescues a bug
that a dropdown could have prevented.

---

## Verdict

The architecture is sound and several of the instincts here are better than what most funded teams
ship — measure geometrically rather than asking a model to judge, one exercise per video, closed
fault grammar, degrade-don't-throw, and a written record of discarded findings. Keep all of that.

The measurement layer is not ready. Four defects would ship confidently wrong numbers: a
dimensionally invalid depth measure, an unvalidated timebase, a depth-based discriminator that cannot
support its own claim, and a trust gate built on a signal that is blind to the failure mode it exists
to catch. All four are fixable inside Phase 1 without changing the architecture, and none require a
different model or a different vendor.

Fix C1-C5 and C10 before writing V1-4. Do not start UI work — and do not treat V1-6's 100% as
meaningful — until the ground-truth set contains clips that were chosen to break the pipeline rather
than to demonstrate it.


---
---

# Round 2 — skill-first

**Reviewer:** Dr. Nadia Okonkwo-Reinhardt. Appended 2026-09-01, second pass.
**Prompt:** the product direction has moved from barbell-first to skill-first (strict pull-up, bar
muscle-up, handstand walk, HSPU, double unders). Round 1's measurement findings are being adopted;
what is in dispute is movement order, and whether skill-first is measurably easier or harder.

**Scope note:** Round 1 reviewed a barbell feature — Phase 2 opened with `back_squat_highbar`
(`tasks.md:90-92`) and the plan's strongest internal argument was training-max inference
(`plan.md:277-293`). That was the right review of the wrong document. Round 2 re-runs the same
adversarial pass against the skill catalog.

**Headline.** The coordinator is substantially right, and right for better reasons than the ones
given. Skill-first **removes three of the four ways Round 1 found to ship a confidently wrong
number.** But it is not a free win: it **raises the required sampling rate by 3-6× across the board**,
which converts M9 from Major to Critical and makes C2 (timebase) a hard blocking dependency rather
than a defect. One named movement (bar muscle-up asymmetry) is **geometrically impossible** with one
camera and should be dropped from its own rubric. One (double unders) belongs to a different
subsystem and should not be in this plan at all.

Net: **skill-first is measurably easier to be correct and measurably harder to be fast.** That is a
good trade, because correctness was what was failing.

---

## Concessions first — where the coordinator is right, and where the argument is stronger than stated

### Argument 4 is the strongest one and it is undersold.

*"Re-filming is cheap in skill practice (20 attempts per session) in a way it is not for a heavy
double."*

This is the most important sentence in the pushback and it is buried at position 4. It is not a
convenience argument, it is a **precision/recall argument at the import gate**, and it changes the
whole risk profile.

Round 1's dominant risk was confidently-wrong output. The cheapest defence against that is a strict
refusal gate — but a strict gate is only affordable when refusal is cheap. Refusing a heavy double
costs the user a session they cannot repeat; you are therefore forced to a permissive gate and a
large "advisory / degraded" surface, which is exactly where wrong numbers leak out. Refusing a
handstand attempt costs 30 seconds.

**Concrete consequence to bank:** under skill-first you can set the gate to refuse ~20-25% of clips
and still have a good product. Under barbell-first you could not have refused 5%. That single fact
does more to reduce confidently-wrong risk than any measurement fix in Round 1. Design for it
explicitly: **shrink the advisory tier, widen the blocking tier**, and stop treating a refusal as a
product failure. `plan.md:254-262`'s two-tier design was tuned for the expensive-refilm case and
should be re-tuned.

### Argument 2 is right but needs one correction, and the correction is in his favour.

Load-awareness in its hard form — "the verdict must know how heavy the set was" (`plan.md:227-231`)
— does disappear. There is no training max, no `inferTMFromSet` coupling, no %1RM.

But it does not vanish entirely; it **changes into a form the app can already satisfy**. Rep 8 of a
max-effort strict pull-up set looks like a technique failure and is not — the same correctness
requirement, restated as *proximity to failure* rather than *load*. The difference is that the app
**already holds the denominator**: `strict_pullup_max_reps` and friends live in `capability_profile`
(`plan.md:31-36`). So the gate becomes `rep_index / known_max`, computable, no user input, no
inference. Under barbell-first that denominator was the thing being inferred and was the source of
the 5 kg error. Under skill-first it is a stored number.

So: requirement survives, satisfaction gets *easier*. Concede and sharpen.

One thing that does need carrying: skills have a load analog that varies — **band assistance, foot
assistance, incline, box height**. A band-assisted pull-up and a strict pull-up are not comparable
and must not share a rep history. That is a metadata problem, not a vision problem, but it must be
in the log key or the week-over-week comparison (V4-6) will silently mix conditions.

### Argument 3 is right and stronger than stated. Delete V1-3, do not defer it.

Round 1 (C10) recommended cutting plate calibration from Phase 1. Under skill-first, cut it
permanently. Every measure I would specify for pull-up, HSPU and muscle-up is a body-internal ratio;
scale cancels identically. There is exactly one survivor — `walk_distance_max_metres`
(`plan.md:34`) — and section C below gives a calibration-free construction for it. **C10 drops from
Critical to Minor under skill-first, and `tasks.md:52-54` (V1-3) should be deleted rather than
deferred.** That is the largest single engineering saving in this review.

---

## Where the coordinator is hand-waving

### R2-1 (Major) — "discrete vs continuous" is the wrong axis, and discrete measures carry a new failure mode.

*"2D pose is bad at continuous, anthropometry-confounded judgements and good at discrete geometric
ones. Is that actually true, or am I hand-waving?"*

Half hand-waving. The conclusion is right; the stated mechanism is not, and the wrong mechanism will
lead to wrong rubric authoring.

**The real axis is body-internal vs world-referenced.** Squat depth is hard because it needs a
sagittal-plane comparison confounded by femur/tibia proportion and by camera obliquity — not because
it is continuous. Chin-over-bar is easy because it compares two landmarks on the same body in the
same image, and the reference object (the bar) is inferable from a high-visibility landmark
(`bar_y ≈ mean(wrist_y)` — the hands are on it). Discreteness is incidental. Plenty of continuous
skill measures are easy (hip-over-shoulder offset / torso length), and plenty of discrete ones are
hard (any *contact* event — head-touches-floor, hand-leaves-ground).

**And discreteness introduces a risk continuous measures do not have: catastrophic failure at the
threshold.** A boolean flips on ±1 landmark-noise unit. Concretely, chin-over-bar: MediaPipe has no
chin landmark. It has nose (0), eyes, ears, and mouth corners (9, 10). Chin must be extrapolated as
`mouth_y + k·head_scale`, where head scale comes from ear-to-ear or nose-to-ear. That extrapolation
carries roughly **±2-3 cm** of anthropometric error, plus landmark noise. The disputed range on a
pull-up *is* the last 2-3 cm. So the measure is better than squat depth but **not free**, and a naive
boolean will be wrong on precisely the reps that are argued about.

**Change — and this applies to every skill rubric:**
1. **Report the margin, not the boolean.** "Chin cleared the bar by 4 cm" / "by 1 cm". Carry the
   error band with it.
2. **Refuse to adjudicate inside the band.** If the margin is within the measurement uncertainty, the
   rep is `not measurable` (`plan.md:213` already has this verdict — use it here), not "failed".
3. This matters most where a boolean feeds `capability_profile` through V4-4 (`tasks.md:176-179`).
   Telling someone their strict pull-up did not count, on a 1 cm margin, is the single worst output
   this feature can produce.

### R2-2 (Critical) — kip detection by hip-angle *variance* is not clean, and it false-positives on exactly the reps that matter.

*"Is kip detection via hip-angle variance as clean as the plan claims, and what is the false-positive
rate on a slow grindy strict rep that involves some hip flexion?"*

**Where:** `tasks.md:92-94` (V2-5), which also says this "makes the 'strict' retest gate honest for
the first time".

**The choice of variance over absolute angle is correct** — many people do strict pull-ups with knees
bent and ankles crossed, hip angle ~140° and static, so any absolute-angle threshold breaks
immediately. Credit for that. The problem is that variance does not distinguish the two things you
need to distinguish.

Run the numbers. Take hip-angle excursion `E` over a rep.

- A **monotonic** change (the involuntary tuck-and-crunch on a grindy honest rep) is approximately
  uniform over the rep: `std = E/√12 = 0.289·E`.
- An **oscillation** (a kip) over a cycle: `std = E/(2√2) = 0.354·E`.

The two statistics differ by a factor of only **1.22**. So:

| Rep | Excursion | std |
|---|---|---|
| Grindy strict rep, 30° monotonic tuck | 30° | **8.7°** |
| Small "body english" half-kip, 25-35° oscillation | 30° | **10.6°** |
| Obvious kipping pull-up, 60-90° swing | 75° | 26.5° |
| Grindy strict rep with a big 50° tuck | 50° | **14.4°** |
| Modest kip, 40° swing | 40° | **14.1°** |

Two conclusions, both bad:

1. **The borderline cheat and the honest hard rep are not separable by variance.** 8.7° vs 10.6° is
   inside the noise. And the borderline half-kip is *precisely* the cheat the strict gate exists to
   catch — the obvious kip was never in doubt.
2. **A big honest tuck (14.4°) is indistinguishable from a real kip (14.1°).** Wherever you place the
   threshold, you either miss the cheat or fail an honest rep — and failing an honest rep is worse,
   because it writes into `capability_profile`.

Add: hip angle requires the **knee**, which is the weakest of the relevant landmarks (0.76/0.97 on
the Phase 0 clip, `context.md:80`), and in a front-view pull-up the legs are together so one knee
occludes the other. You are computing a marginal statistic from the worst available landmark.

**Change — replace the statistic, not the threshold.** Three signals, all stronger and two of them
cheaper:

1. **Pre-pull hip oscillation in the hang.** A kip is *initiated* from a swing: hip angle and ankle
   position oscillate during the bottom dwell, before the pull starts. A strict rep does not oscillate
   at all before the pull. Near-zero false-positive rate, and it needs no knee — use ankle x. **This
   is the cleanest single discriminator and it is nearly free.**
2. **Sign of hip-angle change during the concentric.** A kip *extends* the hip to drive the rise; a
   grindy strict rep *flexes* it. Opposite signs. Variance throws this away by squaring.
3. **Hip/vertical lead-lag.** In a kip, peak hip extension velocity **precedes** peak vertical
   shoulder velocity by ~100-200 ms (that lead *is* the energy transfer). In a strict rep hip motion
   is concurrent or lagging. Cross-correlate the two velocity traces and threshold on the lag.
   **Note: at 10 fps a 150 ms lead is 1.5 samples. This measure requires 30 fps.** It is one of the
   several skill measures that force M9.
4. Also use **ankle horizontal excursion normalized by body length** as a bulk kip magnitude — in a
   kip the feet swing 0.5-1 m horizontally; in a strict rep they hang. Large, robust, avoids the knee
   entirely.

**And tune for precision on "kip", not recall.** Default to strict unless clearly kipping, report the
margin, and let a borderline rep be `not measurable` rather than "kipped".

---

## A. Tractability ranking, with required sampling rates

Ranked with the pipeline as specified post-C1-C5 (body-scale normalization, real timestamps,
composite quality gate, stability-based confidence, no `z`, no calibration).

| # | Movement | Tractability | Whole-clip | Rep/event windows | Why |
|---|---|---|---|---|---|
| **1** | **Strict pull-up** | **High** | 10 fps | **30 fps** | Cleanest rep definition in the catalog. Every measure body-internal. Highest-visibility landmarks. Feeds two `physical_test` metrics. Only hard part is the kip discriminator (R2-2) |
| **2** | **Handstand push-up** | **High** | 10 fps | **30 fps** | Best empirical numbers in the project (100% / 0.912). Body-internal rep signal. Weakness: ROM is a near-contact judgement with a ~2 cm tolerance |
| **3** | **Handstand walk** | **Medium** (split) | 10 fps | **30 fps** (cadence) | Two of its measures are the easiest in the whole feature; its own catalog retest metric (distance in m) is the hardest. Scope carefully — see C |
| **4** | **Bar muscle-up** | **Low-Medium** | 10 fps | **60 fps** for turnover; **120 fps** for asymmetry (i.e. not shippable) | Transition is 150-300 ms. One named fault is geometrically impossible with one camera. 1-3 reps per clip means no across-rep signal |
| **5** | **Double unders** | **Not with pose** | n/a | n/a — **audio, ≥30 fps pose only for cadence** | Different subsystem. Defer. See D |

**Read the sampling column carefully — this is the cost of the pivot.** Under barbell-first, 10 fps
was adequate for everything except velocity (Round 1, M9). Under skill-first, **10 fps is inadequate
for the majority of the measures**: kip lead-lag needs 30, HSPU concentric (~0.4-0.6 s) needs 30,
handstand-walk hand cadence at 1.5-3 Hz needs 30 (10 fps gives 3-6 samples/cycle — Nyquist-adjacent,
and aliasing produces a *confident wrong frequency*), muscle-up turnover needs 60.

Per-movement notes:

**1. Strict pull-up.** Rep signal `(nose_y − mean(wrist_y)) / torso_length` — body-internal, so
camera motion and zoom cancel for free (Round 1 M7 solved by construction). Measures: rep count;
chin-over-bar **margin** with error band (R2-1); bottom extension (elbow angle, or
`shoulder_y − wrist_y` at maximum); kip via the four signals in R2-2; concentric-duration decay
across reps as the proximity-to-failure signal. Dominant framing failure: **the head leaves the top
of frame** — universal in pull-up footage, and it destroys the chin measure specifically. Caught by
Round 1's corrected `cropped` test (M10: MediaPipe extrapolates outside [0,1], it does not pin to the
edge). **This ships first.**

**2. Handstand push-up.** Rep signal `(nose_y − mean(wrist_y)) / arm_length`; the hands are on the
floor, so `wrist_y` conveniently *is* the floor line — no ground-plane estimation needed. Measures:
rep count; ROM margin; lockout (elbow angle, but far elbow ran 0.71 on the Phase 0 clip — apply the
C4 stability gate per-side and report from the better side only); kipping vs strict (HSPU kip is a
large hip flex/extend, far bigger signal than the pull-up case); tempo. The weakness is that "head
touches floor" is a **contact event at ~0 cm with ±2 cm measurement error** — tighter than
chin-over-bar. Report margin, refuse inside the band, and expect a meaningful `not measurable` rate.

**3. Handstand walk.** See section C. Rank depends entirely on scope: time-inverted and alignment are
trivial and high-value; distance in metres is the hard one and it is the metric the catalog already
promises.

**4. Bar muscle-up.** See section B. Also: 1-3 reps per clip means no across-rep decay signal, so the
proximity-to-failure mechanism that carries pull-up and HSPU does not exist here — and the population
that can perform them is the smallest of the five. Least product value per unit of engineering.
**Ship it fourth, with a reduced fault set.**

**5. Double unders.** See D.

---

## B. Bar muscle-up — timing, faults, and the one that cannot be seen

### Timing

The full transition (peak pull → press-out) is roughly **150-300 ms**; the fast part, the wrist
rotation and elbow-under, is **100-150 ms**.

| Rate | Samples across the fast turnover | What you can do |
|---|---|---|
| 10 fps | 1-2 | Nothing. Not even "did a turnover happen" reliably |
| 30 fps | 3-5 | Detect turnover, locate it in time to ±33 ms, measure pull height at initiation |
| 60 fps | 6-9 | Quantify turnover duration; detect gross (>100 ms) left/right asymmetry |
| 120 fps | 12-18 | Quantify asymmetry at the 30-80 ms scale where it actually lives |

Subtle chicken-wing asymmetry is a **30-80 ms** inter-arm difference. At 30 fps that is 1-2 samples —
you can see a gross one and cannot quantify anything. **60 fps is the floor for a boolean; 120 fps for
a number.** 60 fps is a standard phone mode; 120/240 is slo-mo mode, which the user must deliberately
select — and which is exactly the case that Round 1's C2 (real per-frame timestamps) must handle or
every duration is wrong by 4×. **C2 is a hard prerequisite for muscle-up, not a nice-to-have.**

Also motion blur: hands move at 2-3 m/s during turnover. Indoor gym lighting pushes phones to raise
ISO rather than shorten exposure, so hands smear 15-30 px at the exact instant of interest. Landmark
accuracy on wrists/elbows is worst precisely where the measurement is taken. Round 1's missing blur
detection (M10 item 5) has its worst case here.

### The faults, honestly assessed

| Fault | Measurable? | View | Rate |
|---|---|---|---|
| **Insufficient pull height before transition** | **Yes — and this is the highest-value one.** `(sternum_y − wrist_y) / torso_length` at turnover initiation. Body-internal, no calibration. It is also the #1 reason people fail muscle-ups | Side | 30 fps |
| **Early / late turnover** | **Yes.** Same measure, read at the moment elbow angle starts closing under. Ratio, no calibration | Side | 30 fps |
| **Excessive swing / kip magnitude** | Yes. Ankle horizontal excursion / body length. Trivial | Side | 10 fps |
| **Failure to reach lockout** | Yes, low value. Elbow angle at top | Any | 10 fps |
| **Chicken-wing / turnover asymmetry** | **No. Not with one camera.** | — | — |

### Why asymmetry is not merely hard but impossible

**The view that resolves the fault is the view that occludes half of it.**

- **From the side**, turnover is beautifully visible — but you see **one arm**. The other is directly
  behind it. Asymmetry is by definition a two-arm comparison.
- **From front or rear**, you see both arms — but during turnover the torso is rotating over the bar,
  both arms are severely foreshortened along the optical axis, and **the bar itself occludes the
  shoulder line at the moment of interest.** Foreshortening means the elbow-crossing event you are
  timing is compressed into a few pixels of vertical motion, on landmarks that C4's stability check
  will (correctly) suppress.

This is not a resolution problem or a model problem. It is a projective geometry problem, and no
frame rate or model variant fixes it. Two cameras would; the plan has one, from a camera roll.

**Change:** author the `bar_muscle_up` rubric as **side view, 30 fps, pull-height + turnover-timing +
swing**, and put chicken-wing asymmetry in the non-goals with the reason written down, so nobody
re-adds it in six months. This is more defensible than shipping the fault everyone names and
computing it from suppressed landmarks — which is the exact pattern that produced the phantom knee
valgus (`context.md:230-232`) and the phantom bar tilt (`context.md:236-239`).

---

## C. Handstand walk — which measures survive an uncalibrated single 2D camera

First, a correction the coordinator needs before anything else.

### R2-3 (Major) — the Phase 0 numbers are being transferred to a movement that was not tested.

The prompt cites "100% detection / 0.912 core visibility inverted — best numbers in the project" as
support for handstand walk. `context.md:69-71` records that clip as **HSPU** — *stationary*, inverted,
against a wall, in frame throughout, 21.6 s.

A handstand **walk** adds: subject translation, a camera that must pan, motion blur on the hands
(which are the fastest-moving landmarks and the ones that carry the step signal), and repeated
transits of the frame edges. None of those were present in the tested clip.

This is the same over-read pattern flagged in Round 1 (m15): a good number from one setup being
carried onto a different problem. The evidence supports **HSPU**, which is why I ranked HSPU second
and handstand walk third. It does not yet support handstand walk. Film one and measure it before
authoring the rubric.

### The measures, one at a time

| Measure | Survives? | Construction | Rate |
|---|---|---|---|
| **Time inverted** | **Yes — trivially, exactly** | Inverted state from `sign(shoulder_y − hip_y)` with hysteresis; sum duration. View-independent, scale-independent, pan-independent. ±1 sample | 10 fps |
| **Hip-over-shoulder alignment** | **Yes — the single most defensible form measure in this whole feature** | `(hip_x − shoulder_x) / torso_length` from front/rear. Uses the two 1.00-visibility landmark groups. Body-internal ratio | 10 fps |
| **Banana / arch** (side view) | Yes | Shoulder-hip-ankle angle. Different fault, different view — the rubric must declare which | 10 fps |
| **Lateral drift — hips relative to hands** | **Yes.** This is the real balance measure | `(hip_x − wrist_mid_x) / torso_length`. Body-internal | 10 fps |
| **Lateral drift — off a straight line across the floor** | **No.** Needs a ground plane and a static camera; unrecoverable once the phone pans | — | — |
| **Step count / cadence** | **Yes, via cadence — not via contact detection** | Do **not** try to detect hand contact (a ~0 cm event near an inferred floor plane — worst case for 2D pose). Instead take wrist y-oscillation and wrist x-alternation, get frequency by zero-crossing or FFT. Cadence × time = count. You never need to know *which* step is which | **30 fps** — cadence is 1.5-3 Hz; 10 fps gives 3-6 samples/cycle and aliases |
| **Distance in metres** (`walk_distance_max_metres`) | **Not by px→m. Yes by a different route** | See below | 30 fps |

### Distance without calibration

`walk_distance_max_metres` (`plan.md:34`) is the one skill measure with a physical unit, and it is the
worst possible case for px→m: the subject translates (so scale changes with depth), the camera pans
(so image position is meaningless), and every objection in Round 1's C10 applies with an extra term.

Construct it body-relatively instead:

```
distance ≈ steps × stride_length
steps    = cadence × time_inverted                        (above, 30 fps)
stride   = hand-to-hand separation at contact / body_length   → stride in body-lengths
metres   = stride_in_body_lengths × user_height            (one-time entry, already plausible app data)
```

Everything except the final multiply is a body-internal ratio, so it is **pan-invariant,
zoom-invariant and depth-invariant**. Error is dominated by the user's entered height and by stride
estimation: realistically **±10-15%**. For a "how far did you walk" retest metric that is honest and
useful — report it as "about 6 m", never "6.2 m". It is far better than anything a plate detector
would give on a translating subject, and it costs nothing to build.

**Note the shape of the result:** everything body-internal survives; nothing world-referenced does.
That is a clean, statable rule for the whole skill rubric set, and it is also why the panning camera
— Round 1's M7 — stops being a defect and becomes a design constraint you have already satisfied.

Segmentation: the rep segmenter (V1-4) genuinely does not apply. Handstand walk needs a **state
machine** (upright → inverted → walking → exit), not rep boundaries. That is *less* work than
segmentation, not more, and V2-6 (`wall_handstand_hold`, `tasks.md:95-96`) already establishes the
no-rep-segmentation path. Reuse it.

---

## D. Double unders — the coordinator is right to defer, for a sharper reason than the one he gave

*"I told the founder this one needs audio, not pose. Am I right?"*

**Yes. Defer it.** But "the pose model cannot see the rope" is not quite the reason, and the real
reason is more useful.

**There is a pose-only discriminator, and it is theoretically sound.** You do not need the rope. The
rope passes twice per jump, so the hands must spin at 2× the jump frequency. Discriminator:

```
ratio = wrist_oscillation_frequency / jump_frequency      singles ≈ 1.0, doubles ≈ 2.0
```

Jump frequency from hip or ankle y. Wrist frequency from wrist position relative to hip. Clean in
principle. It fails on three practical grounds, and each one alone is fatal:

1. **SNR ≈ 1.** The hand in a double under travels a **3-8 cm** arc — it is mostly forearm
   pronation. At a typical framing (athlete ~60% of a 1080-tall frame) that is **15-25 px**. Landmark
   noise on wrists in that framing is **5-15 px**. Meanwhile the jump itself is 15-25 cm, 60-100 px.
   **The numerator of the ratio is measured on the weakest signal in the frame and the denominator on
   one of the strongest.**
2. **Nyquist.** Hand oscillation in double unders is **3-5 Hz**. You need >10 Hz sampling, practically
   **≥30 fps and preferably 60**. At 10 fps this aliases — and aliasing does not produce noise, it
   produces a **confident wrong frequency**. That is precisely the failure class this whole feature
   exists to avoid, arriving through the front door.
3. **This is Round 1's C4 hallucination case in its purest form.** Elbows are pinned to the sides, the
   hands are low-contrast against torso and shorts, and the arms barely move. The model has almost no
   evidence and will emit a smooth, plausible, low-amplitude wrist track that is largely pose prior —
   at high `visibility`. Every reason C4 says visibility is the wrong gate applies maximally here.

**Audio is not a fallback, it is the correct sensor.** The rope strike is a sharp, loud, strongly
periodic floor transient. An energy-envelope onset detector over `decodeAudioData` on the same `File`
gives rope passes directly, on-device, with no model, in roughly 50 lines. Two strikes per jump =
double under. It is **cheaper than the pose path as well as better** — which is unusual and worth
noticing.

Refinements when it is eventually built:
- **Fuse, don't choose.** Constrain audio onset periodicity by the pose-derived jump cadence
  (which is a strong, easy signal). Audio alone will pick up gym music, other people's ropes and
  floor variation; audio phase-locked to a measured jump cadence will not. Same fusion argument as
  IMU+video, and it works for the same reason.
- **The most useful double-under measure may not be "was that a double" at all.** It is
  **unbroken-set length and rhythm consistency** — a trip shows as a broken inter-jump interval and a
  long ground contact, both detectable from pose at 30 fps without any rope information.
- Audio adds a privacy surface (voices in a gym). It is processed on-device and never stored, same as
  the video, but it needs one line in the privacy copy (`tasks.md:202-204`, V5-4) and it should not be
  slipped in silently.

**Verdict: defer, and do not put it in the same phase as the other four.** It is a different sensor,
a different subsystem, and a different privacy statement. Treat it as its own feature.

---

## E. Does skill-first reorder C1-C5 + C10?

Yes, substantially. Revised priority:

| Round 1 finding | Barbell-first | **Skill-first** | Why it moved |
|---|---|---|---|
| **C1** — dimensional normalization | Critical | **Critical, now #1** | Skills are *entirely* body-internal ratios. The `normalize_by` schema rule is no longer a fix for one bad example — it **is** the measurement layer. Highest-leverage single change in the plan |
| **C2** — real frame timestamps | Critical | **Critical, now #2** | Skill measures depend on frame rate (30-60 fps). And skill practice is **far more likely to be shot in slo-mo** — people deliberately film handstands and muscle-ups that way. Barbell users shoot normal speed. This is a specific, predictable escalation |
| **M9** — 10 fps too coarse | Major | **Promoted to Critical** | The biggest implication of the pivot, and it goes against the coordinator. 10 fps was adequate for barbell except velocity; under skill-first it is inadequate for the *majority* of measures |
| **C4** — visibility is the wrong gate | Critical | **Critical, rising** | Skills put limbs behind bars, rings and each other, inverted or hanging, where the model leans hardest on prior. The Phase 0 clip's own far-side limbs sat at 0.71-0.79 (`context.md:80`) — and that was the *good* clip |
| **C5** — escalation trigger | Critical | **Critical, unchanged rank** | The "no single variant wins" evidence came from the *inverted* clip (`context.md:126`), so it is the skill case specifically. And higher fps doubles the escalation cost — **rep-window-only escalation moves from recommendation to near-mandatory** |
| **M6** — no subject tracking | Major | **Major, rising** | Skill practice happens in classes and open gyms; walks cross the room past other athletes; a rig has several people on it. Barbell in a rack is comparatively solitary |
| **M7** — camera motion | Major | **Retired as a defect** | The recommended fix (body-internal signals) is now mandatory for other reasons, and every surviving skill measure is pan-invariant by construction. Converts from a bug to a design rule |
| **C3** — the `z` discriminator | Critical | **Specific case retired; general rule kept** | Front-rack vs back-rack is a barbell question. But the *rule* (never branch on MediaPipe `z`; every discriminator needs negative controls) now applies to the harder skill verification problem — see below |
| **C10** — calibration | Critical | **Demoted to Minor. Delete V1-3** | Nothing in skills needs px→m, including handstand-walk distance (section C). Largest engineering saving in the review |

### One thing that gets *harder* that the coordinator has not raised

**V3-7 movement verification (`tasks.md:139-150`) is a nastier problem for skills than for barbell.**

Press vs squat were "wholly separable" — different limbs, different planes. But strict pull-up,
kipping pull-up, chest-to-bar, and bar muscle-up are **the same movement family with the same
landmark signature**, differing only in the details you are trying to measure. Verifying "you picked
strict pull-up and this is a strict pull-up" means using the kip discriminator as a gate — which
Round 2 has just shown is marginal (R2-2).

The good news: verification and measurement collapse into the same computation, so it costs nothing
extra. The bad news: **a marginal discriminator used as a gate produces a marginal gate**, and a
mis-verified clip yields a `capability_profile` write for the wrong movement.

**Change:** for movement families, verification must be **three-way** — `matches` / `does not match` /
`cannot tell`. `cannot tell` refuses the analysis (cheap under skill-first, per argument 4). Do not
force a binary on a signal that does not support one.

---

## F. Occlusion and view — better for two, worse for two, and the framing problem is unchanged

Not a yes/no. It splits cleanly:

**Better than the barbell case:**
- **No rack uprights.** The founder's squat clip failed at 66% detection largely because a squat-stand
  upright crossed his body (`context.md:88`). Pull-up bars and gymnastics rigs are *thin* and
  *horizontal at the top* — they occlude far less body area than a vertical upright at torso height.
- **No barbell across the shoulders** obscuring the shoulder landmarks, which are the highest-value
  landmarks in almost every skill measure.
- **Limbs are separated**, not pressed against the torso. Hanging and inverted positions give better
  limb-background separation and less self-occlusion than a squat with the arms against the body.
- The Phase 0 pair points this way (100%/0.912 inverted vs 66%/0.525 racked barbell). Two clips, so
  weak evidence — but it is his direction.

**Worse:**
- **The bar occludes the shoulder line at exactly the moment of muscle-up turnover** (section B). Not
  a framing problem, a geometry problem.
- **Rings**: straps occlude the forearms and, worse, create strong vertical line features across the
  frame that affect the person detector's bbox, not just landmarks.
- **HSPU against a wall**: the wall behind is *good* (clean background), but the athlete's own body
  occludes the hands and head from most angles, and a low camera puts the floor line through them.

**Unchanged or slightly worse — framing, which Round 1 identified as the dominant quality variable
(`plan.md:404`):**
- Skills go **higher** (head out of the top of frame on pull-ups and muscle-ups — the single most
  common error in pull-up footage, and it kills the chin measure specifically) and **wider**
  (handstand walk transiting the frame). A squat stays in one place at one height.

**Net:** occlusion is **net-better for pull-up and HSPU, clearly worse for muscle-up and rings,
neutral for handstand walk**. Framing is **no better and slightly worse**. So the coordinator gets a
real but partial win here — and the mitigation is unchanged: the framing guide plus a strict import
gate, which skill-first makes affordable (argument 4).

---

## Round 2 verdict

**Skill-first is the right call, and I would make the same call.** It removes three of the four ways
Round 1 found to ship a confidently wrong number: calibration error (gone entirely), anthropometry-
confounded continuous depth (replaced by body-internal ratios), and the hard form of load-awareness
(replaced by a denominator the app already stores). The fourth — hallucinated landmarks passing a
`visibility` gate (C4) — gets *worse*, not better, and remains the top measurement risk.

But it is not cheaper. **It costs 3-6× the sampling rate**, which promotes M9 to Critical, makes C2
(real frame timestamps) a blocking prerequisite rather than a defect, worsens phone thermals and the
"about a minute" claim, and turns **V0-5 (phone benchmark, `tasks.md:28-29`) from a measurement into a
gate**. Run V0-5 before authoring any skill rubric; if a 30 fps rep-window pass on a phone is
prohibitive, the skill measure set shrinks and you need to know that first, not in Phase 4.

**One-line verdict: skill-first is measurably easier to be *correct* and measurably harder to be
*fast* — and since Round 1 found four correctness defects and zero speed defects, that is the right
trade.**

Order I would build: **strict pull-up → HSPU → handstand walk (time + alignment + drift first,
distance second) → bar muscle-up (side view, reduced fault set, asymmetry explicitly out of scope) →
double unders never, or as a separate audio-primary feature.**
