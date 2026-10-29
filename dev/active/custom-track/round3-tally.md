# Round 3 tally: built screens vs peers (2026-10-28)

Files: `round3-{design-lead,mobile-ux,visual-craft,copy,strength-coach}.md`.

| Lens | Brief | Player | Rest | Done | Competes? |
|---|---|---|---|---|---|
| Design lead | 6.5 | 6.5 | 6.0 | 5.5 | No on richness; yes on honest logging + confirm-first |
| Mobile UX | 8.0 | 7.5 | 8.0 | — | Yes on logging speed; player loses on "watch while you lift" |
| Visual craft | 6.5 | 7.0 | 7.5 | 6.0 | Not with GOWOD/Pliability (footage vs a drawn figure); yes with Runna/Hevy on clarity |
| Copy | 7.0 | 7.5 | 6.5 | 6.0 | Player yes; rest and done not yet |
| Strength coach | 7.5 | 7.5 | 6.0 | 5.5 | Brief and player yes; rest and done not vs Hevy/Strong |
| **Mean** | **7.1** | **7.2** | **6.8** | **5.8** | **No consensus that it competes** |

## Unvoted build calls
- X1 band on short phones: 2 approve, 3 amend → **amended**: on short phones the band shows until the first logged
  set of that exercise (DL, SC), capped lower under 700 px (MX), then a thumbnail; AMRAP keeps the thumbnail.
- X2 rest number 72 px: 5 approve.
- X3 clip stays open: 3 approve, 2 amend → **amended**: Close video moves off YouTube's controls (MX), the clip is
  unmounted while resting (MX), per exercise only (DL).

## Fixes adopted (≥ 2 lenses, or a plain defect)
1. Rest "Next up" shows the next set's weight × reps and plates (SC, DL).
2. Drop the plain "· Set" role word (SC, DL, CP).
3. "18 sets left" → "18 sets left today" (SC, CP).
4. Dead gap between the set strip and the weight on tall phones: the band grows instead (DL, VC, MX).
5. Progress bar readable: `h-1.5`, `bg-surface-3` track (VC, DL).
6. Brief chips read as data, not buttons: outlined pills, units on the back-off chip "then 5 × 77.5" (VC, CP).
7. Done screen shows what the log changed: the engine's pending load proposal with Accept (confirm-first) and its
   reason; "movement" → "exercise"; drop the sentence that repeats the tiles (DL, SC, VC, CP).
8. Rest "How was that?": card container removed, copy names confirm-first (DL, VC, CP). SC's "only on top sets"
   rejected — effort on every set is an engine input.
9. "Do something else next" → "Switch exercise", 44 px, out of the home-indicator band (CP, MX).
10. "Next: set 2 · 90 kg × 5" with the unit (CP).
11. Set strip `gap-2` and a right-edge fade (MX; a scroll affordance defect).
12. "The whole session" in sentence case (VC).

Not adopted (single lens, or against round 2's vote): Missed as tertiary text (DL), "Plan:" instead of
"Programme asks for" (CP; the harness reads it), merged brief links (VC), effort only on top sets (SC).

## What none of this closes
DL and VC both put the remaining gap on media: peers lead with real footage that plays on its own; Terav promises
nothing loads from YouTube until a tap, so the band shows a drawn figure until then. Closing that needs an
owner decision (e.g. a setting "Play demo clips automatically", off by default) — consent semantics are out of
this task's scope.
