# Video analysis — context

## Where this came from

Founder session 2026-08-31. He filmed a squat set and asked me to analyse it. I
extracted frames with Swift/AVFoundation, looked at them, and **got the weight
wrong** — called 95 kg as 75 kg by reading the plate face, when the load was
10+10+10+5+2.5 per side. Same-diameter bumpers stack into what looks like one
disc from a camera pointed at the plate face.

That failure is the whole design argument. **The deterministic part (frame
timing, rep cadence, which frame is a true bottom) was reliable. The vision-model
part is what failed.** So: measure geometrically, don't ask a model to judge.

Second driver, same session: his top set logged `rpe: null`, and the RPE picker's
floor is 7 (`Easy/Solid/Grind` = 7/8/9). He was at roughly RPE 5. The engine
would have under-read his training max by ~5 kg. Velocity from video is an
objective substitute for that field.

## Key files (existing, to integrate with)

- `next-app/public/data/exercises.json` — 133 exercises. Already carries `cues[]`,
  `avoid`, `flags[]`, `category`, `regression`. **`video_rubric` goes here.**
  Categories: gymnastics 40, skill 25, strength 20, mobility 18, trunk 8,
  conditioning 6, isometric 4, activation 4, unilateral 3, primer 3, run 2.
- `next-app/public/data/programs/*.json` — `retest_metrics[]` with
  `source: "physical_test"` are the self-reported numbers video would fill.
- `next-app/src/lib/engine/retest-evaluator.ts` — the **precedent for the rubric
  expression parser**. Narrow closed grammar over a `source_ref` string,
  unsupported forms degrade to "not yet trackable" rather than throwing. Copy
  this discipline exactly.
- `next-app/src/lib/schemas.ts` — `setLogSchema` (~line 785), `runLogSchema`
  (~line 822). A `videoAnalysisSchema` belongs alongside these.
- `next-app/src/lib/features.ts` — tri-state feature-flag pattern
  (`undefined` hides the Settings row entirely). Use for the paid gate.
- `next-app/src/lib/proposals/select.ts` — faults become proposals here.
- `next-app/src/components/session/SetView.tsx` — where a capture entry point
  would live, next to the note/overflow sheet.
- `next-app/src/lib/engine/suggest.ts:382` — `inferTMFromSet`, the consumer of
  the RIR that velocity would supply.

## Decisions made

- **One video = one exercise_id.** Founder constraint, 2026-08-31. Rubric is
  selected by exercise, so there is no movement-classification problem and no
  general-purpose vision problem. A video with no exercise attached is refused.
- **On-device only. Nothing uploaded.** Metrics + keyframes ≈ 250 KB vs a 150 MB
  clip; cloud storage costs ~600× for data the engine never reads.
- **The app does not store the clip at all** (founder, 2026-08-31, revising an
  earlier plan for a 2-week on-device cache). The video is already in the user's
  camera roll and their own cloud backup. Keeping a second copy buys nothing and
  costs quota handling, eviction fallbacks, a retention sweep, a deletion UI and
  a GDPR surface. Re-analysis is a re-pick.
- **File pick only in v1.** No `getUserMedia`, no recording UI. This is also the
  easiest path by a wide margin. In-app camera is a v2 quality upgrade.
- **Framing quality is recovered by a guide + an import validation gate**, not by
  owning the camera. Reject a badly framed clip with a specific reason rather
  than emitting a wrong number.
- **Faults bind to existing `cues[]` by index and to the existing `regression`.**
  The rubric authors no coaching copy.
- **No face recognition, ever.** Hard architectural constraint — it is the line
  that keeps this out of GDPR Art. 9 special-category data.
- **Retest auto-fill goes through confirm-first**, never silently. An auto-filled
  `physical_test` that promotes a tier without the user agreeing is exactly the
  failure the mechanic exists to prevent.

## Phase 0 verdict — RUN 2026-09-01. **PASS. Inversion is not the risk.**

Ran MediaPipe Pose Landmarker (`tasks-vision@0.10.14`, `pose_landmarker_full`,
GPU delegate) over two real clips at 10 fps sampling, in Chrome.

| | HSPU (fully inverted, 21.6 s) | Back squat (upright, 59.3 s) |
|---|---|---|
| Frames sampled | 216 | 592 |
| **Pose detected** | **100%** | **66.4%** |
| **Core visibility** (hip/knee/ankle) | **0.912** | **0.525** |
| ms/frame | 82 | 53 |

Per-landmark on the inverted clip: nose 1.00, shoulders 1.00/1.00, hips
1.00/1.00, knees 0.76/0.97, ankles 0.79/0.95, elbows 0.71/0.99, wrists
0.75/0.99. **Nothing below 0.71.**

**The handstand clip beat the squat clip on every measure.** BlazePose being
trained on upright humans did not matter — the model tracked a fully inverted
body essentially perfectly.

The squat clip underperformed for reasons that have nothing to do with pose:
the athlete is small in a wide portrait frame, a squat-stand upright crosses his
body for much of the set, and he is absent from ~15 s of the 59 s clip.

### What this changes

1. **Inversion risk: closed.** Handstand ships in v1. The "track feet + wall
   line" fallback is not needed. Strict pull-up no longer has to go first for
   safety reasons (it may still go first for other reasons — cleanest rep
   definition).
2. **Framing risk: confirmed, and it dominates.** The upright clip did worse
   than the inverted one purely on framing. The framing guide and the import
   validation gate move from "nice mitigation" to **the core quality mechanism**.
3. **Timing claim in the UX copy was optimistic.** 51-109 ms/frame on a laptop
   with GPU delegate. A 60 s clip at 10 fps is roughly 35 s on `lite` and 75 s on
   `heavy`, and a phone will be slower. Say "about a minute", and only escalate
   to `heavy` when `lite` underperforms. Measure on a real phone (V0-5).

### Follow-up run 2026-09-01 — model variant is the lever, not orientation

The 66% on the squat clip was not a floor. Same clip, same code, only the model
variant and input width changed. Squat, set window only (t=17-48), 310 frames:

| Config | Detected | Core visibility | ms/frame |
|---|---|---|---|
| `full` @ 480 | 60.3% | 0.486 | 51 |
| `full` @ 720 | 65.5% | 0.522 | 60 |
| `full` @ 1080 | 62.6% | 0.473 | 69 |
| `lite` @ 720 | 78.7% | 0.608 | 57 |
| **`heavy` @ 720** | **99.0%** | **0.640** | 75 |

Three things fall out:

1. **`heavy` fixes the hard clip.** 60% → 99% detection for ~25% more compute.
   The squat clip is not unusable; it was under-modelled.
2. **Resolution barely matters.** 480 → 1080 moved nothing, and 1080 was worse
   than 720. Do not pay for pixels; pay for model.
3. **The ranking is clip-dependent, not monotonic.** `lite` (78.7%) beat `full`
   (65.5%) on this clip. And on the HSPU clip `full` @480 scored core 0.912 while
   `heavy` @720 scored 0.739. **No single config wins everywhere.**

Model download sizes (float16): **lite 5.5 MB · full 9.0 MB · heavy 29.2 MB.**

### Design consequence: escalation ladder, not a fixed model

Do not hard-code one variant. Run `lite` first — small download, fast. If
detection rate over the clip falls below a threshold (~85%), re-run with
`heavy` and keep the better result. Cache each variant in the service worker on
first use, so most users never download the 29 MB one.

This also answers "different models for different movement types" — the right
axis is **difficulty of the clip, measured at runtime**, not orientation of the
athlete. A rubric may still pin a minimum variant when it is known to need one.

### Rig lessons worth keeping

- **Decode from a Blob, not a streamed URL.** The first run reported 0% on the
  squat clip. Cause: Python's `http.server` ignores HTTP Range requests, so the
  browser could not seek inside a 150 MB file and silently re-drew the same early
  frame. `fetch → blob → createObjectURL` fixed it. The real app takes a `File`
  from an input, which is already a Blob, so this matches production.
- `detectForVideo` requires **strictly increasing timestamps across all calls**,
  not per-video. Analysing a second clip restarted at t=0 and threw. Use a
  monotonic counter, or `runningMode: "IMAGE"` with `detect()` as the spike did.
- Spike harness lived at `scratchpad/spike/index.html` with a
  `.claude/launch.json` entry, both since removed.

## CORRECTION 2026-09-01 — keyframes must NOT go in the synced store

The plan originally put metrics **and 3-4 keyframes (~250 KB)** into
`logs[date].exercises[key].video`. That is wrong and would have broken the app.

`schemas.ts:839` records the hard constraint: **the store has an overall ~1 MB
PUT limit**, which is why `raw_gpx` is capped at 600 KB and the GPX uploader
rejects files over 500 KB. Measured on the founder's live account 2026-09-01:
the entire store is **75 KB — 7.3% of budget** after a month of dense logging.

At 250 KB per analysis, **three videos would exceed the limit** and every
subsequent sync would fail.

Corrected split:

- **Metrics only in the synced store — ~2 KB per analysis.** ~500 analyses of
  headroom, which is more than anyone will produce.
- **Keyframes on-device (IndexedDB/OPFS), best-effort.** Lost on a device change;
  that is acceptable, because the *measurements* survive and they are what the
  engine reads. Consistent with the rest of the design: the video is already
  local, so its stills can be too.

Add a store-size assertion to the analysis writer so this cannot regress
silently.

## Run 2026-09-01 (second session) — two clips, unprompted movement ID

Founder supplied two unlabelled clips and asked what could be read off them
without being told the movement. Both 1080x1920 portrait, rear view, filmed in
a rack. Rebuilt spike (server + page) under the session scratchpad.

**Movements identified from geometry alone, both correct:**

| | Clip A (23.4 s) | Clip B (21.4 s) |
|---|---|---|
| Movement | **barbell strict press** | **front squat** |
| Reps | 2 | 2 |
| `lite` detection | **100%** | **99.5%** |
| Core visibility | 0.948 | 0.960 |
| ms/frame | 31 | 29 |

Discriminators, all cheap arithmetic over landmarks:
- **Press vs squat**: hip travel inside the rep window — 2.1%/1.7% of frame
  (press, no leg drive) vs 12.7% (squat). Also separates strict press from push
  press, since a dip would show as hip travel before the drive.
- **Overhead vs racked**: wrist mid-y rising above nose y.
- **Front rack vs back rack**: mean `wrist.z - shoulder.z` = **+0.38** on both.
  Camera is behind, so positive means the hands are farther away than the
  shoulders — bar in front. This is the check that rules out a back squat.
- **Front vs rear view**: sign of `r_hip.x - l_hip.x`. MediaPipe labels are
  anatomical, so a rear camera puts subject-right at higher x. Free view
  detection — became V1-8.

**The escalation ladder never fired.** `lite` cleared the ~85% threshold on both
clips at roughly half the ms/frame recorded on 2026-08-31. Reinforces the
existing verdict that framing, not model variant, is the dominant variable:
these were well-framed clips and the small model was sufficient.

### Form findings that survived scrutiny

Four, from two clips. Deliberately not more.

1. Press was genuinely strict (hip travel 2%) — i.e. the movement matched what
   would have been selected. This is the movement-class check working.
2. Press rep 2 was **15% slower** (concentric 1.30 s -> 1.50 s) and stalled early
   rather than mid-range. The velocity-decay RIR signal, working as intended.
3. Front squat depth consistent and deep (hip-vs-knee 0.95, 0.97); eccentric
   *lengthened* rep 1 -> rep 2 (0.70 -> 0.90 s) while concentric held — controlled
   descent under fatigue, no dumping.
4. **Repeatable mid-ascent sticking region**, same phase both reps, deeper on
   rep 2 (velocity 0.14 -> 0.05 -> 0.13, then 0.13 -> 0.03 -> 0.15). Lasts 0.3-0.4 s
   across 3-4 samples, so not a smoothing artifact.

### Findings discarded, and why — this is the more useful half

- **Knee valgus**: both knees moved the *same* direction (+0.43, +0.65
  stance-widths). Common-mode shift is body translation or perspective, not one
  knee caving. Rear view plus an off-centre tripod manufactures this.
- **Lateral hip shift**: hips travel toward a rear camera during a squat, so
  depth change amplifies any off-centre x offset. Standing-baseline correction
  cancels the static bias but not this.
- **Heel rise**: 3-9 px of change. Below landmark resolution.
- **Bar tilt (front squat)**: a plausible, repeatable 3.5% tilt — computed from
  wrists at **0.30/0.38** visibility on a clip whose core visibility was 0.96.
  A clip-wide confidence threshold does not catch this. Became V2-8.
- **Depth as an absolute**: geometry said hip ~ knee (0.95); the frame is clearly
  well below parallel. Rear view foreshortens. Depth is a side-view measure.

Only surviving asymmetry candidate: right shoulder lower at the bottom on both
reps, **growing 1.25% -> 1.99%** with fatigue, on the two landmarks at 1.00
visibility. Not a finding — a reason to ask for a squared-up rear clip.

### The vision-model layer failed three times; the arithmetic never did

1. Read the thumbnails, called both clips back squats. Wrong on both.
2. Read the stall keyframes, saw a forward-pitched torso, was ready to call a
   good-morning fault. **The measurement refuted it**: hip-rise/shoulder-rise
   ratio stayed at 0.80-0.92 through both ascents — never above 1.0, so the
   shoulders rose *faster* than the hips and the torso was becoming more upright
   at the exact moment it looked like it was collapsing. Torso vertical extent
   recovered monotonically (0.090 -> 0.119 against a 0.120 standing value). The
   sticking point is leverage, not technique.
3. (2026-08-31, prior session) Read the plate faces, called 95 kg as 75 kg.

Same lesson as the original design argument, now with three data points. Keep
the model out of the runtime judgement path. If an LLM is ever added to phrase
coaching output, give it the metrics and **never the keyframes**.

### Cost, since it came up

Runtime marginal cost per analysis is **~EUR 0.00**: inference is on-device
(~7 s of phone compute for a 23 s clip), the model is a one-time 5.5 MB
service-worker-cached download, no video is uploaded, and ~2 KB of metrics goes
to the existing store. An optional LLM phrasing pass over the metrics blob
(~6 k in / 500 out) would be ~USD 0.002 on Haiku, ~0.02 on Sonnet, ~0.04 on
Opus — affordable, but rejected above on correctness grounds, not cost.

### Rig notes

Spike lived at `<session scratchpad>/spike/` — a no-dep Node server (serves
`~/Downloads` under `/vid/`, accepts POSTed frames and JSON under `/save`) plus
a module page exposing `probe / thumbs / frames / runClip` to drive from the
browser tools. Range support in the server matters; the 2026-08-31 lesson about
`python3 -m http.server` silently redrawing one frame is why it is hand-rolled.
`.claude/launch.json` gained a `pose-spike` entry during the run and was
restored afterwards.

## Direction change 2026-09-01 — skill-first, margins not verdicts

Two expert reviews (`review-cv-biomech.md`, `review-coaching-product.md`, two
rounds each) plus a founder decision. `plan.md` and `tasks.md` rewritten to match.

**The pivot: skill-first, not barbell-first.** Founder: *"most things why people
want personal trainer is to have someone look how they perform some movements and
then correct them."* Both reviewers, working independently, endorsed it — most of
their hardest round-1 objections were barbell-specific and invert on skills (no
load to gate on, skill retries are free so re-filming is cheap, and the user
genuinely cannot see what their body did upside down).

**The demand evidence was already in the repo and nobody had looked.**
`pu_video_review`, `mu_video_review` and `hs_video_review` ship in the
first-strict-pullup, muscle-up and handstand-walk programs. All three are
`feedback_type: self_controlled` citing `chiviacowsky_wulf_2002`;
`hs_video_review` is annotated *"Never auto-shown"* and carries the retest metric
`video_review_self_select_frequency`. The catalog already prescribes this feature
as a manual drill **and already decided the user must ask for it.** Pull, never
push — see V4-9.

**Build order:** strict pull-up → HSPU → handstand walk → bar muscle-up (reduced
fault set) → double unders separately or never.

### What was refuted, with the arithmetic

- **Kip detection by hip-angle variance does not work.** Verified: a ramp has
  std 0.289·E, a sine 0.354·E — 1.22× apart — so an honest 50° tuck (14.44°) and
  a real 40° kip (14.14°) are 2% apart. It catches the obvious kip nobody
  disputes and misses the borderline cheat the strict gate exists for. This was
  the single technical claim the pull-up-first argument rested on.
- **`depth_ratio` as `hip_y/knee_y` is dimensionally invalid.** The identical
  posture scores 0.714 or 0.750 depending on frame position. Same error ran
  through the "% of frame" hip-travel discriminator above. Normalised against
  shoulder-to-ankle the press/squat separation *widens*: 5-6.5% vs 44.4%.
- **The `wrist.z - shoulder.z` front-rack check was right by the wrong
  mechanism.** +0.38 is 3.1× shoulder width — an implied 124 cm bar-to-shoulder
  offset, physically absurd. MediaPipe `z` is a regressed pose prior, not depth,
  and no back-squat negative control was ever run. `z` is now banned from rubrics.
- **"Rep 2 was 15% slower" was over-precise.** At 10 fps each boundary is ±0.1 s,
  so 1.30 s and 1.50 s put the ratio anywhere in 1.00-1.33.
- **The Phase 0 numbers were over-read twice.** 100% / 0.912 was a *stationary*
  handstand push-up. Transferring it to the handstand **walk** is unjustified —
  locomotion is untested.
- **`visibility` is the wrong confidence signal.** It scores presence and
  occlusion, not positional accuracy. The failure that matters is an
  occluded-but-hallucinated landmark at visibility 0.9.

### What changed structurally

- **Calibration (V1-3) deleted.** The RIR claim is a within-clip ratio, so scale
  cancels exactly. Budget moved to two-rate sampling (V1-9).
- **V0-5 promoted from measurement to gate.** Skill measures need 30 fps inside
  rep windows, 60 for a muscle-up turnover — 3-6× the barbell assumption.
- **Verdict scale replaced by margins with error bands.** Both reviewers landed
  there independently: a boolean flips catastrophically at threshold, a
  verification is a *ruling* not an opinion, and BlazePose has no chin and no bar
  landmark, so "chin over bar" would rest on the weakest landmarks in the frame.
  Nothing boolean is written into `capability_profile`.
- **"No new coaching copy" is retired as false.** 0 of 40 gymnastics exercises
  have `cues[]`. `cues_corrective[]` must be authored (V2-0) and blocks Phase 2.
- **Muscle-up asymmetry and double unders moved to non-goals**, each with the
  geometric or signal-processing reason recorded so nobody re-adds them.

### Unowned and still live

`back_squat_highbar.cues[0]` names the founder's shoulder retroversion and
`cues[2]` his right shoulder; `front_squat.cues[2]` likewise. Both exercises are
used by `concurrent-strength-maintenance`, which is catalog-public in
`manifest.json` (only `anterior-hip-rebuild` is `personal: true`). Any beta user
on CSM sees one person's clinical notes as generic coaching copy today. This
predates the video feature and is not fixed — a spawned task for it was deleted.

## Ring muscle-up clips 2026-09-01 — sampling rate quantified, completion measure refuted

Two ring-MU clips (9.3 s and 12.9 s, 1080x1920, side view, athlete on boxes).
First ring data in the project, and first data on a *failed* attempt.

| | clip A | clip B |
|---|---|---|
| `lite` detection | 100% | 99.2% |
| Core visibility | 0.852 | 0.884 |
| **Left elbow / wrist visibility** | **0.20 / 0.22** | **0.18 / 0.20** |

**The far arm is unusable.** On a side-view ring muscle-up the left elbow and
wrist sit at 0.15-0.25 across both clips while the right side runs 0.87-0.98.
This is the muscle-up asymmetry non-goal confirmed empirically, and it now covers
**rings as well as bar** — the non-goal was written from the bar geometry, but the
occlusion is just as total on rings. Any per-side comparison is impossible from
this view, at any frame rate.

### Sampling rate: 10 fps under-reads the peak by 4-10 cm

Ran the transition window at 60 fps and compared against the 10 fps whole-clip
pass. Same clip, same model, same code — only the rate changed.

| | 10 fps peak | 60 fps peak | Under-read |
|---|---|---|---|
| clip A | 0.017 torso @ 7.50 s | 0.194 torso @ 7.40 s | **0.177 torso (~9.7 cm)** |
| clip B | 0.099 torso @ 9.10 s | 0.175 torso @ 10.12 s | **0.077 torso (~4.2 cm)** |

An order of magnitude on clip A. Any threshold sitting between those two values
flips the verdict on the rate alone — the catastrophic-flip argument for
reporting margins instead of booleans, now demonstrated rather than asserted.
**V0-5 as a gate and V1-9 two-rate sampling are both justified by measurement.**

Cost is reassuring: 120 frames at 60 fps over a 2 s window ran at ~30 ms/frame,
about 3.6 s of compute. Skill clips are also short (9-13 s here vs 21-59 s for
the barbell clips), so the two-rate pass is affordable.

### The completion measure was confounded by body orientation — refuted

Built "did the transition complete" as `wrist_y - shoulder_y > 0` — shoulders
above the hands, i.e. the athlete is over the rings. It reported **completed for
both clips at both frame rates.** It is wrong.

Two false positives found before the real one:
1. Fired at the end of clip A while the athlete stood on the box with his arms
   down. Fixed by gating on hands-still-at-ring-height.
2. Fired during the drop off the rings in clip B. Fixed by requiring the body to
   be elevated (shoulder rise > 0.30 torso).

The third one is fatal. The frame at clip A t=7.40 — the 60 fps peak, margin
+0.194 torso — shows the athlete in a **horizontal swing**, body parallel to the
floor, feet out, hands on the rings to one side. The shoulder is higher than the
wrist *in image y* because the body is horizontal, not because he cleared the
rings. Neither clip reaches a genuine support position: a ring support needs the
shoulder roughly a full torso above the hands, and the best either clip shows is
0.19.

**So I cannot say from this data whether either attempt completed.** The measure
has to be gravity-aligned and orientation-aware — a scalar comparison in image
coordinates cannot distinguish "above the rings" from "lying sideways".

**Fourth instance of the same failure mode**, after the plate misread, the
back-squat thumbnails, and the forward-lean read. Every measure built from a
single scalar comparison in raw image coordinates has been confounded. The ones
that survived were differences normalised by an intrinsic body scale *and*
cross-checked against a second independent condition. That is the rule, and V1-11
should be read as enforcing it rather than as a formatting requirement.

### Consequence for the plan

Rings are not bar. The plan's Phase 2 lists bar muscle-up at #4 with a reduced
fault set; ring MU needs its own rubric and its completion criterion is an open
problem, not an authoring task. Keep it at #4 or later.

## Band-assisted bar muscle-ups 2026-09-01 — a working detector, and a framing gate that is too strict

Two band-assisted bar-MU clips (22.9 s, 18.6 s), a different athlete from the
earlier clips, with a child moving in the background. First **positive controls**
in the set — the ring clips gave only attempts.

`lite` detection 99.1% / 97.3%, core visibility 0.868 / 0.895. Near arm (left)
0.95-0.99, far arm 0.58-0.72 — better than the rings' 0.20 but still not enough
for per-side comparison.

### The support detector, rebuilt to the rule and validated against negatives

The refuted ring measure used one scalar in image coordinates. Rebuilt with three
independent conditions, all body-scale normalised:

1. `(wrist_y - shoulder_y) / torso > 0.55` — shoulders above the hands
2. **torso angle from vertical < 45°** — the condition that was missing
3. `shoulder rise from hang > 0.3 torso` — the athlete is actually elevated

| Clip | Support periods found |
|---|---|
| band MU A | **5** (one boundary ambiguous — likely 4) |
| band MU B | **2** |
| ring A (negative control) | **0** |
| ring B (negative control) | **0** |

The naive one-condition version fired on 4 ring-A frames and 26 ring-B frames.
**Condition 2 is what rejects the horizontal swing; condition 3 rejects the
drop-off.** Verified visually: band A t=18.70 s is a genuine full support — arms
locked out, torso upright, athlete above the bar, band under the foot.

This is the first measure in the project built to the rule derived from four
failures — a body-scale-normalised difference plus a second and third
*independent* condition — and the first one that survives a negative control.

### Hysteresis is not optional

A plain threshold split single supports into three (short / long / short,
11 "reps" in a 22.9 s clip) because the margin dips momentarily at the top.
Hysteresis (enter 0.55, exit 0.25) plus an 0.8 s merge gap gives 5 and 2. One
boundary in clip A sits at a 0.9 s gap — just outside the merge window — so the
true count is 4 or 5 and **the pipeline cannot resolve it without ground truth**.
Exactly V1-6's point, and a reason not to tune thresholds against unlabelled
clips: that is fitting, not validating.

### The `subject_too_small` threshold is wrong

`plan.md`'s capture table proposes rejecting clips whose landmark bounding box is
under ~45% of frame height. **Both clips measure 0.28 and both analysed fine**
(99.1% / 97.3% detection, core 0.87-0.90). The proposed gate would have refused
two perfectly usable clips.

Torso length was 0.10 of frame here against 0.19-0.21 on the ring clips — the
subject is half the linear size — and it still worked. **Lower the threshold, and
derive it from measured detection rather than from intuition.** A capture gate
that rejects usable footage is worse than no gate, because the user has no way to
tell a real framing problem from a false alarm.

### Incidental

- The assistance band is visible across the frame and did not disturb pose.
- A child moves in the background throughout and the skeleton did not switch —
  encouraging for V1-12, but this is the easy case (small, distant, never
  overlapping the athlete).
- Bystanders in frame are a non-issue architecturally *because* no video is
  uploaded or stored. Worth keeping in the privacy copy.

## Ground truth 2026-09-01 — rep count correct on 4/4 clips

Founder supplied labels: band MU A = **4 reps**, band MU B = **2 reps**. First
labelled entries in the ground-truth set.

| Clip | Time-gap merge | Structural merge | Truth |
|---|---|---|---|
| band MU A | 5 ✗ | **4 ✓** | 4 |
| band MU B | 2 ✓ | **2 ✓** | 2 |
| ring A (neg control) | 0 ✓ | **0 ✓** | 0 |
| ring B (neg control) | 0 ✓ | **0 ✓** | 0 |

### The fix: measure the physical condition, don't proxy it with time

The 5-vs-4 error came from merging fragmented support periods by an **0.8 s time
gap**. Widening the gap would have fixed this clip and broken the next one — it
is a tuned constant standing in for a physical fact.

The physical fact is: **a new rep requires the athlete to come back down.** So
measure that directly — between two candidate supports, take the minimum
shoulder rise. If the athlete never descended, it was one rep with a momentary
margin dip at the top.

    between 4.0 s and 4.9 s : min rise  0.85 torso  -> SAME rep
    between 5.3 s and 7.7 s : min rise -0.71 torso  -> separate rep
    between 10.4 s and 12.7 s: min rise -0.66 torso -> separate rep
    between 15.2 s and 17.8 s: min rise -0.67 torso -> separate rep

**0.85 against -0.71 — a 1.5-torso gap.** Any threshold between -0.5 and 0.8
gives the same answer, so this is structural rather than tuned. Contrast the time
gap it replaced: 0.9 s against 2.3-2.6 s, which is a factor of 2.5 and would drift
with cadence, fatigue, and rep tempo.

**The generalisable rule: never proxy a physical condition with a time heuristic
when the condition itself is measurable.** This is the same class of fix as
adding the torso-angle condition to the support detector — both replace a
plausible-looking scalar with the thing actually being asked about.

### Status against V1-6

V1-6 requires 100% on rep count before UI work. Currently **4/4 including two
negative controls**, on a detector whose thresholds are insensitive over a wide
band. That is not yet the ~10-clip set the task asks for, and all four clips are
muscle-ups — a movement whose rep boundary (return to hang) is unusually crisp.
Pull-ups, HSPU and handstand walk are all still unlabelled and untested.

Two of the four clips are the *hard* cases though: ring attempts that never
complete, which any counter must return zero on. Getting 0 right matters as much
as getting 4 right, and a counter tuned only on successful reps would not have
been tested for it.

## Handstand walks 2026-09-01 — locomotion works, distance does not

Three handstand-walk clips (14.2 s, 17.8 s, 13.9 s). First locomotion data; the
Phase 0 inverted result was a *stationary* handstand push-up, and I had twice
over-read it onto walking. Now measured.

| | HW 1 | HW 2 | HW 3 |
|---|---|---|---|
| `lite` detection | **88.0%** | 97.2% | 94.3% |
| Core visibility | 0.949 | 0.929 | 0.923 |
| Time inverted | 6.7 s | 14.7 s | 9.9 s |
| Median body bend | **8°** | **31°** | **32°** |

**Inversion plus locomotion is fine, and bilateral visibility is the best in the
project** — both wrists 0.78-0.92, both ankles 0.85-0.91, versus 0.20 on the far
arm in the ring muscle-ups. Nothing occludes a limb in a handstand walk. This is
the one movement so far where a left/right asymmetry measure might be honest.

### What is measurable

- **Time inverted**, from strict landmark ordering `ankle < hip < shoulder <
  wrist`. Structural, pan-invariant, no thresholds to tune. Fills the program's
  `wall_hold_max_seconds` and `freestand_hold_max_seconds` retest metrics.
- **Body-line straightness** — the angle between shoulder→hip and hip→ankle.
  Median 8° on HW 1 against 31-32° on HW 2 and HW 3: a **4× separation**, the most
  discriminating measure found in this project. Fully body-internal, so
  pan-invariant and scale-invariant. Use the median, never the max — HW 3's max is
  129°, which is a landmark glitch, while its p90 is 53°.

### What is not: distance

`walk_distance_max_metres` is one of the handstand-walk program's three
`retest_metrics`, it is the headline number a user wants, and **it cannot be
derived from pose alone.** Two independent failures:

1. **Accumulated path length is mostly jitter.** Summing per-frame |Δx| gave 4.95
   body-heights on HW 2 against a noise floor of **3.41** — 69% of the "distance"
   was landmark tremor. Net displacement is 1.40 body-heights (~2.5 m). The first
   number would have been reported as ~12 m. Caught before it left the harness,
   unlike the four earlier traps.
2. **Camera pan is indistinguishable from subject stillness.** HW 1's hands stay
   within x = 0.39-0.52 for 6.7 s. That is either a panning camera following a
   walk, or an athlete holding nearly still. **Pose landmarks cannot separate
   those** — it needs background optical flow, a different and much heavier
   computation.

So the handstand rubric may fill two of the program's three retest metrics and
must refuse the third. That refusal is the `retest_fills` validator earning its
place: the alternative is auto-filling a distance PR from a number built out of
tremor.

Product consequence: the movement ranked most likely to earn a subscription
cannot auto-measure its own headline metric. Seconds inverted and body-line
straightness are what video actually offers here; distance stays a self-reported
`physical_test`.

### Escalation should be measured over the window, not the clip

HW 1 detected at **88%** — the lowest in the project and closest to the ~85%
escalation trigger — but the misses cluster at kick-up (2.1-4.6 s) and exit
(13.4 s). Through the inverted phase, detection is near-perfect. A whole-clip
detection rate would escalate to a 29 MB model because of frames nobody measures.
**V1-0 should compute detection over the measurement window**, which is what
`heavy` would be paying to improve. Confirms the round-2 review's call for
window-scoped escalation, now with a clip that demonstrates it.

## Open / next steps

1. **Phase 0 is done and passed** (see verdict above). Phase 1 is unblocked.
2. Three tasks added 2026-09-01 from the second run: **V1-8** (view detection),
   **V2-8** (suppress measures the clip cannot support), **V3-7** (movement-class
   verification). All three exist to stop the feature emitting a confident number
   the camera angle cannot support.
3. **Calibration (V1-3) is now the gap that blocks the feature being a product.**
   Every velocity measured so far is in frame-relative units, so reps within one
   clip are comparable but this week against last week is not.
4. Next real question is **bilateral occlusion**, not inversion. On the HSPU clip
   the far-side limbs sat at 0.71-0.79 while near-side sat at 0.95-0.99 — fine
   for single-side measures, not fine for left/right asymmetry. Any rubric
   measuring asymmetry (the founder's hip case) needs `view: front` or `rear`,
   and the validation gate must check **both sides are visible**, not just mean
   confidence.
5. Benchmark on a real phone before writing the progress copy (V0-5).
6. Unrelated but blocking-adjacent: **the RPE floor of 7 is a live bug.** Worth
   fixing independently of this feature — see plan "Why this matters for the
   engine".

## Prior art in this repo to reuse, not reinvent

- Frame extraction during the 31 Aug session was done with a throwaway Swift +
  AVFoundation script (no ffmpeg on the founder's machine). Scratch scripts are
  gone; the browser path uses `<video>` + `canvas` + `requestVideoFrameCallback`
  instead, so none of it carries over except the method.
- Referential-integrity validation between data files already exists and fails
  loudly on load — `video_rubric.cue_ref` and `retest_fills.metric_id` join that
  check.
