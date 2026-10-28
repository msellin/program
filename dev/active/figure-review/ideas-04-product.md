# Figures: the product-level next step (2026-10-28)

Owner: product-design-lead. Scores are the design reviewers' 1-10 "visual richness" (now 7.7 mean; figures are the
named gap in `rescore-p3-00-summary.md` "Still open" #2). Fine-grained technique is left to the other three experts.

## The call

**Keep the procedural SVG rig as the permanent system. Do not move to Lottie/Rive or an illustrated character.
Spend the next effort on "coaching signal around the figure" (cue overlay, view toggle, muscle tag, the player
surface), then replace figures with the founder's real clips, one drill at a time, once users exist.**

Why:
- Peers that win on imagery (GOWOD, Thenx) use real coach video. Hevy, the one with figures, uses small anatomical
  icons plus a worked-muscle highlight, and nobody buys Hevy for them. Imagery is table stakes; the
  *information attached to it* is what reads as coaching.
- The rig is machine-checked: provocative positions are tests in `rig.test.ts`, strokes are px-fitted, 54 figures
  exist with a contrast test. Lottie/Rive/character art would throw that away and make every new program (9 and
  growing, skill programs favoured) an art commission for a solo founder. A hand-drawn character is an art
  pipeline, not a feature.
- AI video was tested and paused (`dev/active/exercise-media/`): L/R mirroring, first-frame misuse, morphing.
  In a rehab product a wrong-limb clip is a safety defect, not a polish issue. Keep the character sheet; revisit
  only if a model holds L/R reliably.
- Real clips are the endgame. The SVG figure must therefore be a *poster/fallback*, designed to be swapped per
  `exercise_id` without a layout change (same 16:9 slot, same poster still).

## Ranked ideas

| # | Idea | Effort | Gain (richness) | Notes |
|---|------|--------|-----------------|-------|
| 1 | **Cue overlay in the player.** 1-2 coaching cues (already in `exercises.json` `cues_external_focus`) fade in over the figure at the right phase of the loop ("ribs down" at the bottom, "drive the floor away" on the up). Tap to pause. Reduced motion: static caption. | S | +0.3 | Cheapest way to look like coaching rather than a diagram. Data already exists. The figure becomes a visual for a sentence. |
| 2 | **Worked-muscle tag on the player and program page.** Not an anatomical body: one chip row ("Glutes, hamstrings") plus the working limb already accented. Hevy's red anatomy is the part users remember; we get 80% with text from a `muscles[]` field (shared library, general copy). | S-M | +0.2 | Data addition to `exercises.json`; must pass `data-integrity.test.ts` (general copy only). |
| 3 | **Tap-to-scrub / slow in the player.** Tap = pause; drag across the figure scrubs the cycle (p=0..1); long-press = 0.5x. A visible "0.5x" pill, not a hidden gesture (PWA, no hover). Reduced motion starts paused with the scrub on. | M | +0.3 | Rig already exposes p and 4-key timing, so scrubbing is nearly free. Highest "this is a real tool" effect for the form-checking user. |
| 4 | **Figures on the surfaces that have none:** session-done "next session" card, extra-session list, QuickStart. | S | +0.3 | Open items #5 and #7 in the rescore. Reuses the poster pose. Best gain per hour of any figure work, because it adds imagery where there is currently text only. |
| 5 | **Front/side toggle for the few figures where it matters** (squat, deadlift, bridge, pull-up). Only 2-segment control where a second view is authored; hidden otherwise. | M-L | +0.1 | Rig already has front views for pallof/suitcase/farmer. Author per figure; do not generalise to a 3D rig. Do after #1-4. |
| 6 | **Tapered limbs and a filled torso at tile/player size only** (thumbs stay stroked, see 03-visual "do not fill torso"). | M | +0.2 | Real but modest. The visual reviewer set the constraint: filled shapes collide with limb overlap at 2.75px. Tile + player only. |
| 7 | **"Real clip" slot** in the player: if `media/<exercise_id>.mp4` exists, play it (muted, looped, poster = the SVG pose); else the figure. First 3 clips: the drills the founder does himself (dead bug, glute bridge, hip hinge). | M, then S per clip | +0.8 once 10+ clips, 0 before | Do the slot now (cheap) and film after launch as planned. A mix of real and SVG is fine if the SVG is labelled nothing; do not label either "demo" or "illustration". |
| 8 | **Cut `ninety` top-down view and merge identical `hswalk` drill figures** or give them a distinct key pose. | S | +0.1 | The coach flagged both; a figure that cannot be read does more damage than none. |

## Per-surface payoff (per hour of figure work)

1. **Follow-along player (16:9)**: the only surface where the figure is the product. Ideas 1, 3, 7 land here. Highest return.
2. **Session-done / extra-session list / QuickStart**: imagery is absent (idea 4). Cheapest visible change.
3. **Today hero (144px)**: already improved in P3; remaining gain is the filled body (6) only.
4. **Brief rows (56x40)**: lowest return. At 1.5-2.75px strokes it is an icon; stop investing after the poster-pose fix.
5. **Program page**: low; a thumbnail grid is enough.

## What makes a stranger believe it is real coaching

Not realism. Strangers judge a coach by specificity: (a) the right cue at the right moment (idea 1), (b) the figure
shows the *variant* correctly (done: 5s negative, band, incline rings), (c) "why this result?" citing a study or
a log signal (exists), (d) a named, plausible stance on what NOT to do (the provocative-position tests), (e) later,
a real human in a clip. A prettier stick figure with generic cues reads as a placeholder; a plain one with exact
cues does not. Never add a fake coach name, face or "AI coach" avatar.

## Cross-persona

- recover: slow/scrub and cue overlay help form checking; hold the "to about parallel, pain-free" copy fix first
  (cue says full depth, figure stops at parallel: a live contradiction).
- strength: wants speed and density; overlays must be dismissible and remembered (one tap, per user).
- erratic: nothing here depends on history; no streak/calendar framing.

## What NOT to do

- No Lottie/Rive migration, no per-exercise hand animation, no 3D rig, no pose-from-video ML. Maintenance cost
  scales with 9 programs; the procedural rig does not.
- No illustrated "athlete" character for the in-app figures. The Gemini character sheet is for marketing stills
  at most.
- No AI video in the app until L/R correctness is reliable and reviewed clip-by-clip (rehab safety).
- No anatomical muscle-map drawings: they cost illustration time, read as medical claims, and the shared
  `exercises.json` must stay general copy.
- No new nav/IA for exercises ("library" tab). It violates focused-improvement; figures live inside the session.
- No gamified overlays (rep counters on the figure, streak badges). No auto-playing sound.
- Do not film before there are users: until a program's drills are stable, clips go stale (each cue/variant change
  invalidates one).

## Sequencing

Now (about 1 week): 4, 1, 8, then the `mp4` slot in 7. Next: 3, 2. After launch with users: film clips, highest-use
drills first (usage from the log), then 6 and 5 only where a drill is still SVG and heavily used.
Expected richness: 7.7 to about 8.5 with 1-4; 9 requires real clips on the most-used 10-15 drills.
