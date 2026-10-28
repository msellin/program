# Custom track pass: plan (2026-10-28)

Trigger: the founder's own screenshots (anterior-hip-rebuild, set-by-set player) on 2026-10-28. These screens were never
in any P0–P3 rescore: the rescore evidence was the pull-up guided path plus a page sweep.

## What is wrong (founder + lead read)
Brief (`session/BriefView.tsx`, set-flow day):
- Main lift's prescription is listed twice (card line "100 × 5 · 117.5 × 5 · 132.5 × 5+ · 5 × 100 kg", then the
  "Today's top set" card repeats it).
- Uneven detail: one figure + full prescription on the main lift, "4 sets" with no reps/load on the rest.
- Jargon subtitle ("Cycles 3 + 4 (with 1RM test)"); Start label repeats the exercise name; sticky bar cuts the top-set card.
Set player (`session/SetView.tsx`):
- Top row crushed: exercise tabs truncate ("Block pull, m…", "Barbel 0/4") beside "Something hurt" and ⋯.
- The caption truncates the exercise name and loses "set 1 of 8" (SetView.tsx:429).
- Set pips are one non-wrapping row (SetView.tsx:443): 15 sets → ~20px pips, below target size.
- Weight floats in empty space; "Last time 130 × 3" lacks context; "Change the weight" / "Missed" read as captions.
- No figure and no demo clip — the 39 curated clips are wired only into the guided player (`follow-along/DemoVideo`);
  the set player only has the full YouTube video behind ⋯ (OverflowSheet).
Media coverage for this program: 12 of 20 exercises have no figure (Bulgarian split squat, single-leg RDL, Pallof
press, hip thrust, hollow hold, Nordic curl, sled push, suitcase and farmer carries, air squat, goblet squat); only the
two squats have curated clips.

## Steps
1. Review: design lead, mobile-UX, visual-craft, copy and a strength-coach lens on fresh captures of a strength
   persona (brief, player at 8 and 15 sets, done), benchmarked against Hevy / Strong / Fitbod. Output: one agreed
   layout per screen, scored 1–10.
2. Build (lanes, disjoint files): brief; player top bar + set list that scales; figure + "Watch demo" (tap-to-load,
   trimmed loop) in the set player; new figures for the 12 exercises (coach-reviewed before shipping); curated clips
   for block pull, hip thrust, single-leg RDL (official embeds only).
3. Verify (unit, personas incl. a 15-set day), deploy, re-shoot, rescore.

## Constraints
Screens only: no change to anterior-hip-rebuild loads, gates, provocative-position rules or `symptom-state.ts`;
confirm-first unchanged; figures for this program must respect `clinical-context.json` provocative positions; shared
`exercises.json` copy stays general.
