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

## Open / next steps

1. **Phase 0 is done and passed** (see verdict above). Phase 1 is unblocked.
2. Next real question is **bilateral occlusion**, not inversion. On the HSPU clip
   the far-side limbs sat at 0.71-0.79 while near-side sat at 0.95-0.99 — fine
   for single-side measures, not fine for left/right asymmetry. Any rubric
   measuring asymmetry (the founder's hip case) needs `view: front` or `rear`,
   and the validation gate must check **both sides are visible**, not just mean
   confidence.
3. Benchmark on a real phone before writing the progress copy (V0-5).
4. Unrelated but blocking-adjacent: **the RPE floor of 7 is a live bug.** Worth
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
