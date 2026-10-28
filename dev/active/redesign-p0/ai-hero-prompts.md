# AI hero loops: prompt pack (2026-10-28)

**What these are for.** Short, silent, looping clips of a person training. They give each program a visual identity,
which every peer has (GOWOD, Pliability, Thenx) and Terav doesn't. They are **mood, not instruction**. Exercise
technique stays with the CrossFit embeds and, later, the owner's own filmed demos. A loop can be slightly imperfect;
a technique demo cannot.

**Where they go.**
1. The program page hero band.
2. The catalog card.
3. The landing program pages.
4. Ad creatives: Meta and Google (vertical).

## Tool and licence check (owner)
Use any one tool and keep to it, so the look stays consistent: Google Veo (Gemini or Flow), OpenAI Sora, Runway or Kling.

Before using output commercially, confirm on that tool's current terms page:
- (a) Commercial use is allowed on your plan.
- (b) Generated people are not a real person's likeness.
- (c) Ad platforms may require AI-content disclosure. Meta labels "AI info"; keep a note of which clips are generated.

## Shared spec: paste it at the top of every prompt
```
Style: cinematic but natural sports documentary, real gym, shallow depth of field,
soft directional key light from the left, deep charcoal background (#0e0f12 feel),
one warm bronze rim light. Muted, desaturated colours; no neon, no logos, no text,
no watermarks, no brand names on clothing or equipment.
Athlete: the same person in every clip — athletic woman, early 30s, dark hair in a
low bun, charcoal fitted training top, black shorts, bare forearms, chalked hands.
(Alt set: athletic man, early 30s, short dark hair, charcoal t-shirt, black shorts.)
Camera: locked-off tripod, no zoom, no cuts. Real-time speed, no slow motion.
Duration 6 seconds. The last frame must match the first frame so it loops seamlessly.
```

## Shots (generate 2–3 takes each, keep the best one)
| # | Program | Shot | Prompt (after the shared spec) |
|---|---|---|---|
| 1 | Pull-up | Hero, 16:9 | `Side view, waist-up framing. The athlete hangs from a black steel pull-up bar with straight arms, then pulls smoothly until the chin clears the bar, pauses one beat, lowers slowly under control back to a straight-arm hang. Legs straight together, no swinging, no kicking. One repetition only, ending in the same hang as the start.` |
| 2 | Pull-up | Ad, 9:16 | Same as 1, vertical, full body, bar at the top third of the frame. |
| 3 | Pull-up | Mood, 16:9 | `Close-up of the athlete's hands chalking up, then gripping a black steel bar; chalk dust drifts in the bronze rim light. Hands stay on the bar at the end.` |
| 4 | Handstand walk | Hero, 16:9 | `Wide side view on a rubber gym floor. The athlete is already in a straight handstand, body in one line, toes pointed, and takes four small controlled hand-steps forward, then holds still. Arms straight, shoulders open.` |
| 5 | Handstand walk | Ad, 9:16 | `Front-on view against a plain dark wall: the athlete holds a still chest-to-wall handstand, body in a straight line, breathing calmly.` |
| 6 | Handstand walk | Mood, 16:9 | `Low angle: the athlete's hands press flat into the floor, fingers spread, as their weight shifts onto them; slow and deliberate.` |
| 7 | Strength + cardio | Hero, 16:9 | `Side view: the athlete performs one controlled high-bar back squat with a loaded black barbell in a squat rack, hips below parallel, chest up, then stands tall and re-sets. One repetition only.` |
| 8 | Strength + cardio | Ad, 9:16 | `The athlete rows on an indoor rowing machine at an easy steady pace, seen from the side, then the frame pans gently to a loaded barbell in a rack behind them.` (camera exception: one slow pan) |
| 9 | Brand / landing | Mood, 16:9 | `Empty dark gym at dawn, a single pull-up bar and gymnastics rings lit by a warm bronze light; dust in the air; very slow drift.` |

**Negative prompt** (tools that accept one): `extra fingers, hands passing through the bar, bent or broken limbs, kipping, swinging, jumping, cuts, text, logos, watermark, slow motion, crowd, mirror reflections.`

## Review checklist: reject a clip if any of these fails
- Hands stay on the bar, and the fingers look normal (count them).
- Elbows and knees bend only the natural way. No limb stretches or melts.
- Pull-up: a strict pull-up with no kip, legs quiet, chin over the bar.
- Handstand: arms straight, body in one line, no floating.
- Squat: the bar stays on the back, heels down, a sane depth.
- No text, logo or watermark anywhere. The face is generic, not a celebrity.
- The loop is seamless. Play it three times in a row.

## Export and hand-off
Make 2 files per shot, plus a poster image:
- **Video:** MP4 (H.264) and WebM (VP9). Width 1280 for 16:9, 720 for 9:16. No audio track. Under 2 MB each, ideally.
- **Poster:** the first frame as a JPG.

Put them in `dev/active/redesign-p0/hero-clips/`, named `<program>-<shot>.mp4` (for example `pullup-hero.mp4`).

Claude then:
1. Moves them to `next-app/public/media/`.
2. Wires them as `<video autoplay muted loop playsinline poster>` in the program hero and catalog card. The SVG figure stays as
   the fallback.
3. Shows the still poster under `prefers-reduced-motion`.
4. Lazy-loads them below the fold.
5. Records each clip's origin (tool, date) in `public/media/CREDITS.md`.
