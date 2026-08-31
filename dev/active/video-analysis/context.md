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

## Open / next steps

1. **Phase 0 spike is the gate.** Does BlazePose survive an inverted body?
   Handstand-walk is the flagship skill track and the worst case for a model
   trained on upright humans. Everything downstream assumes yes.
2. Test clip already on disk: `~/Downloads/VID_20260831_161314.mp4` — 59 s,
   1080×1920, 30 fps, back squat, side view, partial occlusion from a squat-stand
   upright. Good hard case.
3. Need a handstand clip from the founder for the inversion test.
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
