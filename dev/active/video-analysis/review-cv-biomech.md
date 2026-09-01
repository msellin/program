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
