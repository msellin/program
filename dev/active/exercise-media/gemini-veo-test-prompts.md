# AI demo clips — Gemini / Veo test prompts (2026-10-19)

Goal: test whether Gemini (Veo for video, Gemini image for stills) can produce the
SAME character doing Terav exercises correctly, as 8 s silent loops for the
follow-along player. Replaces both self-filming and the SVG illustrations if it works.

## How to run the test

1. **Step 0, once:** paste the *character reference sheet* prompt into Gemini as an
   **image** request. Regenerate until you like the person, then keep that image.
   It is the identity anchor for every future clip.
2. **Steps 1a / 2a (image):** attach `terav-athlete-01-sheet.jpg` and paste the
   start-frame prompt. Check the still: one person, correct pose, and the correct colour
   nearest the camera.
3. **Steps 1b / 2b (video):** attach the checked still and paste the clip JSON. Gemini
   uses the attached image as the first frame, which is what we want here.
4. Download the clips and drop them in a folder. Claude trims, loops, strips audio
   and puts them into the canvas player.

## Result of test 1 (2026-10-19) and what changed

- **The character works.** The sheet gave one consistent person, and the 10 s video kept her identical
  throughout: same face, hair and clothes.
- **Left and right were mirrored in every view** (teal on her right). Fixed by flipping the
  sheet horizontally: `terav-athlete-01-sheet.jpg` in this folder is the corrected one. **Use it
  for everything from now on**, and keep checking L/R in each new still, because the model
  may mirror again.
- **Gemini used the attached image as the FIRST FRAME**, not as a character reference, so it
  animated the sheet itself (arm raises and kicks) instead of the dead bug. It also added sound.
  → New workflow: **1a/2a** make a start-frame still from the sheet, check it, then **1b/2b**
  animate that still. The video prompts below now say the attached image is the first frame.

## Scorecard (fill per clip)

| Check | Pass? |
|---|---|
| Same person as the reference (face, build, hair) | |
| Teal = left, purple = right, never swaps mid-clip | |
| Correct limbs move (dead bug: OPPOSITE arm + leg) | |
| Form: low back flat (dead bug) / no arching at the top (bridge) | |
| Slow tempo, no jerks, no morphing, correct finger and limb count | |
| Start pose ≈ end pose (loopable) | |
| Background and floor match the app (dark charcoal, no props) | |
| Visible watermark? | |

---

## Step 0 — character reference sheet (IMAGE)

```json
{
  "task": "character_reference_sheet",
  "purpose": "Identity anchor reused for every exercise video. Same person, same clothes, every time.",
  "output": { "type": "image", "aspect_ratio": "16:9", "style": "photorealistic studio photography, natural skin texture, not illustrated, not CGI-looking" },
  "character": {
    "id": "TERAV_ATHLETE_01",
    "identity": "a fit adult woman in her early 30s, athletic but not bodybuilder build, medium height, light olive skin, dark brown hair tied in a low bun, calm focused neutral expression, no tattoos, no jewelry, no visible makeup",
    "wardrobe": {
      "top": "fitted plain charcoal grey short-sleeve t-shirt, no logos",
      "bottom": "plain matte black knee-length training shorts, no logos",
      "left_wrist": "TEAL (#4a8894) terry-cloth wristband on the LEFT wrist only",
      "right_wrist": "MUTED PURPLE (#a279a8) terry-cloth wristband on the RIGHT wrist only",
      "left_foot": "TEAL (#4a8894) ankle sock on the LEFT foot only",
      "right_foot": "MUTED PURPLE (#a279a8) ankle sock on the RIGHT foot only",
      "shoes": "none"
    }
  },
  "layout": "four views side by side on one sheet: front view standing, left side view standing, back view standing, right side view standing; plus one head-and-shoulders close-up in the top-right corner",
  "pose": "relaxed neutral standing, arms slightly away from the body so both wristbands are clearly visible, feet hip-width so both socks are visible",
  "environment": "seamless matte charcoal studio background (#16181c), dark grey matte floor (#24272f), no props, no text, no labels",
  "lighting": "soft even key light from front-above, gentle rim light separating the silhouette from the dark background, no harsh shadows",
  "must": [
    "teal items are ONLY on the person's LEFT side, purple items ONLY on the RIGHT side, in every view",
    "identical person, face and clothing across all views"
  ],
  "avoid": ["text", "labels", "logos", "extra people", "props", "mirrors", "jewelry", "patterned clothing", "shoes"]
}
```

## Step 1a — Dead bug start frame (IMAGE, attach `terav-athlete-01-sheet.jpg`)

```json
{
  "task": "single_start_frame_from_reference",
  "reference": "The attached character sheet shows the person to use. Same face, hair, build and clothing. Use ONE person only, NOT a sheet, NOT multiple views.",
  "output": { "type": "image", "aspect_ratio": "16:9", "style": "photorealistic studio photography, same look as the reference" },
  "pose": "dead bug start position: lying on her back on a dark grey exercise mat; both arms pointing straight up to the ceiling directly above the shoulders; hips and knees bent 90 degrees, knees stacked directly above the hips, shins parallel to the floor; lower back flat on the mat; head resting on the mat",
  "camera": "low at mat level, perpendicular to the body, on her RIGHT side. Her head is on the LEFT of the image and her feet on the RIGHT. Full body visible with margin. Locked-off.",
  "side_check": "Because the camera is on her right side, the PURPLE wristband and PURPLE sock are on the limbs nearest the camera; the TEAL wristband and TEAL sock are on the far limbs, partly hidden behind.",
  "environment": "seamless matte charcoal background (#16181c), dark grey matte mat and floor (#24272f), nothing else",
  "lighting": "soft even key light from above, subtle rim light, same as the reference",
  "avoid": ["multiple people", "multiple views", "character sheet layout", "inset close-up", "text", "props", "shoes"]
}
```

**Check before animating:** purple is nearest the camera, there's one person, the pose is right. If teal is nearest, regenerate or flip the still horizontally; flipping also moves the head to the right, which is fine.

## Step 1b — Dead bug, slow (VIDEO, attach the 1a still) — the hard test

```json
{
  "task": "exercise_demo_clip",
  "exercise": "Dead bug, slow — one repetition: RIGHT arm with LEFT leg",
  "first_frame": "The attached image IS the first frame. Keep this exact person, clothing, camera angle, framing, background and lighting for the whole clip. Animate only the movement in action_timeline. Do not cut away, do not add other views or other people.",
  "output": {
    "type": "video", "duration_seconds": 8, "aspect_ratio": "16:9", "fps": 24,
    "audio": "none — completely silent, no music, no voice, no sound effects",
    "on_screen_text": "none", "cuts": "none — one continuous shot",
    "loop": "the pose at 0.0 s and at 8.0 s must be identical so the clip loops seamlessly"
  },
  "character": {
    "id": "TERAV_ATHLETE_01",
    "identity": "a fit adult woman in her early 30s, athletic but not bodybuilder build, medium height, light olive skin, dark brown hair tied in a low bun, calm focused neutral expression, no tattoos, no jewelry, no visible makeup",
    "wardrobe": "fitted plain charcoal grey short-sleeve t-shirt; plain matte black knee-length training shorts; TEAL (#4a8894) wristband on LEFT wrist and TEAL ankle sock on LEFT foot; MUTED PURPLE (#a279a8) wristband on RIGHT wrist and PURPLE ankle sock on RIGHT foot; no shoes"
  },
  "environment": "seamless matte charcoal studio background (#16181c), dark grey matte exercise mat on a dark floor (#24272f), nothing else in frame",
  "lighting": "soft even key light from above, subtle rim light so the limbs read clearly against the dark background, no flicker",
  "camera": {
    "position": "low, at mat level (about 40 cm high), perpendicular to the body, on the person's RIGHT side",
    "framing": "entire body visible with margin; head on the LEFT of frame, feet on the RIGHT of frame",
    "movement": "locked-off tripod, no pan, no zoom, no shake",
    "consequence": "the person's RIGHT arm (purple wristband) and RIGHT leg (purple sock) are nearest the camera; LEFT arm (teal) and LEFT leg (teal) are on the far side"
  },
  "start_pose": "lying on the back on the mat; both arms pointing straight up to the ceiling directly above the shoulders; hips and knees bent at 90 degrees with knees stacked directly above the hips and shins parallel to the floor (tabletop); lower back pressed flat into the mat; head resting on the mat",
  "action_timeline": [
    { "t": "0.0-0.5 s", "action": "hold the start pose, still" },
    { "t": "0.5-3.5 s", "action": "SLOWLY and at the same time: the RIGHT arm (purple wristband) lowers overhead behind the head toward the floor, stopping just above the mat; the LEFT leg (teal sock) straightens and lowers until it hovers about 10 cm above the mat. The LEFT arm stays pointing at the ceiling. The RIGHT leg stays in tabletop." },
    { "t": "3.5-4.5 s", "action": "hold the extended position; lower back stays flat on the mat" },
    { "t": "4.5-7.5 s", "action": "SLOWLY return the RIGHT arm and LEFT leg to the start pose" },
    { "t": "7.5-8.0 s", "action": "hold the start pose, identical to 0.0 s" }
  ],
  "must": [
    "OPPOSITE arm and leg move together: RIGHT arm with LEFT leg — never the same side",
    "lower back never arches off the mat",
    "smooth, slow, controlled tempo with no jerks",
    "teal stays on the LEFT side and purple on the RIGHT side for the entire clip",
    "anatomically correct body: two arms, two legs, five fingers per hand"
  ],
  "avoid": ["same-side arm and leg moving together", "both legs moving", "lifting the head or shoulders", "fast or bouncy movement", "morphing or changing face", "camera movement", "text", "music", "extra people", "props"]
}
```

## Step 2a — Glute bridge start frame (IMAGE, attach `terav-athlete-01-sheet.jpg`)

```json
{
  "task": "single_start_frame_from_reference",
  "reference": "The attached character sheet shows the person to use. Same face, hair, build and clothing. Use ONE person only, NOT a sheet, NOT multiple views.",
  "output": { "type": "image", "aspect_ratio": "16:9", "style": "photorealistic studio photography, same look as the reference" },
  "pose": "single-leg glute bridge start position: lying on her back on a dark grey exercise mat, arms flat on the mat alongside the body, palms down; LEFT knee bent with the LEFT foot (teal sock) planted flat about 30 cm from the buttocks; RIGHT leg (purple sock) held straight and lifted so the right thigh is in line with the left thigh; hips resting on the mat",
  "camera": "low at mat level, perpendicular to the body, on her LEFT side. Her head is on the RIGHT of the image and her feet on the LEFT. Full body visible with margin. Locked-off.",
  "side_check": "Because the camera is on her left side, the TEAL sock (planted foot) and TEAL wristband are nearest the camera; the PURPLE straight leg is on the far side.",
  "environment": "seamless matte charcoal background (#16181c), dark grey matte mat and floor (#24272f), nothing else",
  "lighting": "soft even key light from above, subtle rim light, same as the reference",
  "avoid": ["multiple people", "multiple views", "character sheet layout", "inset close-up", "both feet planted", "text", "props", "shoes"]
}
```

**Check before animating:** the planted foot wears the teal sock and is nearest the camera.

## Step 2b — Single-leg glute bridge, left foot planted (VIDEO, attach the 2a still)

```json
{
  "task": "exercise_demo_clip",
  "exercise": "Single-leg glute bridge — working leg LEFT (left foot planted)",
  "first_frame": "The attached image IS the first frame. Keep this exact person, clothing, camera angle, framing, background and lighting for the whole clip. Animate only the movement in action_timeline. Do not cut away, do not add other views or other people.",
  "output": {
    "type": "video", "duration_seconds": 8, "aspect_ratio": "16:9", "fps": 24,
    "audio": "none — completely silent, no music, no voice, no sound effects",
    "on_screen_text": "none", "cuts": "none — one continuous shot",
    "loop": "the pose at 0.0 s and at 8.0 s must be identical so the clip loops seamlessly"
  },
  "character": {
    "id": "TERAV_ATHLETE_01",
    "identity": "a fit adult woman in her early 30s, athletic but not bodybuilder build, medium height, light olive skin, dark brown hair tied in a low bun, calm focused neutral expression, no tattoos, no jewelry, no visible makeup",
    "wardrobe": "fitted plain charcoal grey short-sleeve t-shirt; plain matte black knee-length training shorts; TEAL (#4a8894) wristband on LEFT wrist and TEAL ankle sock on LEFT foot; MUTED PURPLE (#a279a8) wristband on RIGHT wrist and PURPLE ankle sock on RIGHT foot; no shoes"
  },
  "environment": "seamless matte charcoal studio background (#16181c), dark grey matte exercise mat on a dark floor (#24272f), nothing else in frame",
  "lighting": "soft even key light from above, subtle rim light so the limbs read clearly against the dark background, no flicker",
  "camera": {
    "position": "low, at mat level (about 40 cm high), perpendicular to the body, on the person's LEFT side",
    "framing": "entire body visible with margin; head on the RIGHT of frame, feet on the LEFT of frame",
    "movement": "locked-off tripod, no pan, no zoom, no shake",
    "consequence": "the working LEFT leg (teal sock) is nearest the camera and fully visible"
  },
  "start_pose": "lying on the back on the mat, arms resting flat on the mat alongside the body, palms down; LEFT knee bent with the LEFT foot (teal sock) planted flat on the mat about 30 cm from the buttocks; RIGHT leg (purple sock) held straight, lifted so the right thigh is in line with the left thigh; hips resting on the mat",
  "action_timeline": [
    { "t": "0.0-0.5 s", "action": "hold the start pose, still" },
    { "t": "0.5-2.0 s", "action": "drive through the LEFT heel and lift the hips until shoulders, hips and LEFT knee form one straight line; the RIGHT leg stays straight and keeps its angle relative to the thigh" },
    { "t": "2.0-4.0 s", "action": "hold the top position with a visible glute squeeze; hips level, no rotation" },
    { "t": "4.0-6.5 s", "action": "SLOWLY lower the hips back to the mat" },
    { "t": "6.5-8.0 s", "action": "hold the start pose, identical to 0.0 s" }
  ],
  "must": [
    "only the LEFT foot (teal sock) is on the mat; the RIGHT foot (purple sock) never touches the mat",
    "at the top: shoulders, hips and knee in one straight line — NO arching of the lower back, ribs stay down",
    "shoulders and head stay on the mat throughout",
    "slow, controlled tempo with no jerks",
    "teal stays on the LEFT side and purple on the RIGHT side for the entire clip",
    "anatomically correct body: two arms, two legs, five fingers per hand"
  ],
  "avoid": ["both feet planted", "lower back hyperextension", "hips rotating or dropping to one side", "bouncing", "morphing or changing face", "camera movement", "text", "music", "extra people", "props"]
}
```
