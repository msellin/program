# Handover — video analysis, as of 2026-09-01

Written to merge two parallel sessions on this project. Read this, then
`context.md` (the evidence), then `tasks.md` (the checklist). `plan.md` is the
design and is long — skim its "Output contract" and "Phases" sections first.

---

## What this feature is

Film a set, pick which exercise it was, get measurements back. Everything runs
**on-device** (MediaPipe Pose Landmarker, WASM). No upload, no clip storage —
the app never holds the video, only ~2 KB of metrics. Marginal cost per analysis
is effectively zero, and that is an architectural consequence, not an
optimisation.

## The direction changed today — this is the most important thing to absorb

The plan was **barbell-first** (squat, velocity, training max). It is now
**skill-first**: strict pull-up → handstand push-up → handstand walk → bar
muscle-up (reduced) → never double unders.

Why: the founder's position is that people want a coach to *watch them move and
correct them*, and the product is skill programs. Two expert reviews (two rounds
each, in `review-cv-biomech.md` and `review-coaching-product.md`) initially
recommended dropping form feedback for a velocity/RIR feature — then, on being
shown the skill-first framing, both endorsed the pivot. Most of their hardest
objections were barbell-specific and invert on skills: there is no load to gate
on, skill retries make re-filming cheap, and nobody can see what their own body
did upside down.

**The demand evidence was already in the repo and nobody had looked.**
`pu_video_review`, `mu_video_review` and `hs_video_review` ship in the
first-strict-pullup, muscle-up and handstand-walk programs. All three are
`feedback_type: self_controlled`, cite `chiviacowsky_wulf_2002`, and
`hs_video_review` is annotated *"Never auto-shown"* with a retest metric tracking
how often the user chooses to review. **The catalog already prescribes this
feature by hand and already decided the user must ask for it. Pull, never push.**

## The output contract — margins, never verdicts

A Good / OK / Needs-work scale was drafted and then **rejected within hours** by
both reviewers independently. Do not reintroduce it.

Report the margin with its error band: *"chin finished about 3 cm under the bar —
closest of the set"*, never *"kipped ✗"*. Three reasons that hold together:

1. A boolean flips catastrophically at the threshold. **Demonstrated**: on ring
   clips, 10 fps and 60 fps disagree on the peak by up to 10 cm, so a threshold
   between them flips the verdict on frame rate alone.
2. A verification is a *ruling*, not an opinion. It writes `capability_profile`,
   gates a tier, and lands on the rep the user has chased for months. Told they
   kipped when they believe they did not, they conclude the app is calling them a
   liar, and the numbers lose trust with the verdict.
3. BlazePose has 33 landmarks and **no chin and no bar**. "Chin over bar" would be
   an inferred chin against an inferred bar built from wrists — the weakest
   landmarks in the frame.

**Asymmetric confidence**: a generous confirmation may auto-write; a
disconfirmation must go through Accept / Ignore. The app may say "that counted"
on its own, never "that didn't". **No boolean ever reaches `capability_profile`.**

---

## THE RULE — read this before writing any measure

Five measures were built and confounded in a single session. One rule separates
the survivors from the failures:

> A measure must be **a difference normalised by an intrinsic body scale**, and
> cross-checked against **at least one independent second condition**.

Every measure built as a single scalar comparison in raw image coordinates was
wrong. Every measure built to the rule survived a negative control.

### Refuted — do not rebuild

| Measure | Why it failed |
|---|---|
| MediaPipe `z` for front/back rack | +0.38 = 3.1× shoulder width, an implied 124 cm offset. `z` is a regressed pose prior, not depth. Right answer, wrong mechanism, no negative control run |
| `hip_y / knee_y` depth ratio | Not translation-invariant: identical posture scores 0.714 or 0.750 by frame position |
| Hip-angle **variance** for kip detection | Confounds shape with magnitude: ramp 0.289·E vs sine 0.354·E, so an honest 50° tuck (14.44°) and a real 40° kip (14.14°) are 2% apart |
| Accumulated path length for distance | 69% landmark tremor on a real clip — would have reported 12 m where net displacement was 2.5 m |
| Time gap as "the athlete came back down" | Measure the descent directly; the time version got a rep count wrong |
| Shoulder-above-hand alone for support | Fires on standing with arms down, on dropping off the bar, and on a horizontal swing |

---

## What is measured and validated

**Rep counting: 4/4 correct**, including two clips that must return **zero**.

| Clip | Detected | Truth |
|---|---|---|
| Band bar-MU A | 4 | 4 |
| Band bar-MU B | 2 | 2 |
| Ring-MU attempts ×2 | 0, 0 | 0, 0 |

The zeros matter as much as the fours: a counter validated only on successful
reps is never tested against attempts, and "you did 3" when the answer is 0 is
the most trust-destroying output this feature could produce.

**Support detection** (`harness/measures.js`): three independent conditions —
shoulders above hands > 0.55 torso, torso within 45° of vertical, shoulder risen
> 0.3 torso from hang. The torso-angle condition is what rejects a horizontal
swing; the rise condition rejects the drop-off.

**Rep boundary is structural, not temporal**: a new rep requires the athlete to
descend between supports. Within one rep the minimum rise reads 0.85 torso;
between reps, −0.66 to −0.71. A 1.5-torso gap, so any threshold in [−0.5, 0.8]
agrees.

**Handstand walk**: detection 88–97%, core visibility 0.92–0.95, and the **best
bilateral visibility in the project** (both wrists 0.78–0.92 — nothing occludes a
limb). Time inverted comes free from strict landmark ordering and fills
`wall_hold_max_seconds` and `freestand_hold_max_seconds`. **Body-line
straightness is the best-separating measure found anywhere here**: median 8° vs
31–32° across three clips, fully body-internal. Use the median — one clip's max
was a 129° glitch against a p90 of 53°.

**`walk_distance_max_metres` cannot be auto-filled** and must stay a
self-reported `physical_test`. Accumulated path is tremor, and camera pan is
indistinguishable from subject stillness without background optical flow.

## Sampling rate is the price of the pivot

10 fps was adequate for barbell. It is not for skills. Two-rate sampling is
required: scan the clip at 10 fps to find windows, then re-sample *inside* the
windows (30 fps for pull-up / HSPU / handstand cadence, 60 fps for a muscle-up
turnover). Measured: 10 fps under-read a muscle-up peak by 4–10 cm.

**V0-5 (phone benchmark) is now a GATE on Phase 1**, not a measurement. Cost so
far is encouraging — 120 frames at 60 fps ran ~30 ms/frame — but that was a
laptop.

**Escalation must measure detection over the measurement window, not the whole
clip.** A handstand clip scored 88% overall (near the ~85% trigger) with every
miss in the kick-up and dismount, while the phase actually measured was
near-perfect. Whole-clip rate would fetch a 29 MB model to fix frames nobody reads.

---

## Blockers, in order

1. **V2-0 — `cues_corrective[]` does not exist, and neither does its content.**
   Only 39 of 133 exercises have `cues[]`; **0 of 40 gymnastics do**; 87 use
   `cues_external_focus[]`. The plan's "no new coaching copy" rule is **false**
   under skill-first. Existing cues are pre-lift instructions that do not survive
   repurposing ("Move like the bar is soft" → "You did not move like the bar was
   soft"). ~11 strings covers a three-movement v1. **Blocks all of Phase 2.**
2. **Exercise ids in the plan are wrong.** `strict_pullup`,
   `wall_handstand_hold` and `strict_press` do not exist. Real ids are prefixed
   (`pu_negative_pullup_5s`, `mu_false_grip_pullup`, `hs_*`). Resolve before
   authoring any rubric.
3. **V0-5 phone benchmark** — gates Phase 1.
4. **V1-6 ground truth** — 4/4 so far, but all four clips are muscle-ups, whose
   rep boundary is unusually crisp. Still needed: strict pull-up (the movement
   that ships first, and there is **no data on it at all**), HSPU, a failed rep
   *mid-set*, and two people overlapping in frame.

## Live and unowned, unrelated to this feature

`back_squat_highbar.cues[0]` reads *"…low-bar rack position is OFF the menu due
to shoulder retroversion"* and `cues[2]` names the founder's right shoulder;
`front_squat.cues[2]` likewise. Both exercises are used by
`concurrent-strength-maintenance`, which is **catalog-public** in
`programs/manifest.json` (only `anterior-hip-rebuild` is `personal: true`). Any
beta user on CSM is shown one person's clinical notes as generic coaching copy
today. This predates the video feature. A task was spawned for it and deleted, so
nobody owns it.

## Adjacent, and worth doing first on its own merits

**V-ADJ-1: the RPE picker floor is 7.** Both reviewers flagged it independently.
It recovers most of the engine value for a fraction of the effort, and it is the
only way to learn whether video actually beats a working picker.

---

## Next actions

1. Founder is sending **strict pull-up clips with a borderline rep** and possibly
   a deliberately bad handstand walk. Two filming rules learned the hard way:
   film from the **side with the whole body including feet** (kip lives in the
   sagittal plane), and **start filming while hanging still, before the first
   rep** — every validated measure needs a stationary reference from the opening
   seconds to derive body scale and hang height. That belongs in the framing
   guide (V3-2).
2. Ask for the rep count and the disputed rep **after** analysing, not before.
3. Rebuild kip detection from phase/shape at 30 fps — pre-pull hang oscillation,
   sign of hip-angle change, hip-vs-vertical lead-lag, ankle horizontal excursion.
   **Not variance.**
4. Lower the `subject_too_small` capture threshold. The plan proposed rejecting
   clips under 45% of frame height; two band-MU clips measured **0.28** and
   analysed fine at 97–99%. A gate that refuses usable footage is worse than none.

## Harness

`harness/` — `server.js` + `index.html` (the rig) and `measures.js` (the
validated primitives, with the refuted approaches recorded in comments). See
`harness/README.md`. Landmark fixtures are deliberately not committed; they
regenerate in about a minute per clip.
