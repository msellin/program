# Founder feedback 2026-10-29: panel consensus

Five Sonnet lenses (`01-design-lead`, `02-mobile-ux`, `03-visual-craft`, `04-copy`, `05-coach`) on the founder's
four live screenshots and points A–E (`BRIEF.md`).

| Point | Votes | Consensus |
|---|---|---|
| E. Back in the guided player redoes the set | BUILD ×5 | **#1 for all five.** Back opens the finished set read-only, with "Back to set N"; Redo becomes an explicit secondary action; Back never changes a result (`FollowAlong.tsx:485`). |
| B. Today below the fold | CHANGE/CUT ×5 | Check card → one row. "2 tracks scheduled" banner → cut (copy, coach) or one-line caption / shown once (lead, mobile, visual). "Heavy squat day" card → out of the main column: into the hero / strip as a line (mobile, visual, coach), Plan (lead), or cut (copy). "First hip check" kept (copy: rename "Hip check due"). At most one boxed card below the hero. |
| C. Progress / insights | BUILD ×5 | Templated session insights on the done screen, each line naming its log signal; confirm-first proposals (coach: front squat working max after 115×3). **No composite ring** (no valid score; visual allows an adherence ring only where a denominator exists). **No Haiku in v1** (free text can assert what no log row backs; copy: at most rephrase a template whose numbers code fills and checks). |
| D. Brief with everything done | CHANGE ×4, KEEP ×1 | Remove "Log an extra session" from the all-done state (lead, copy, coach; visual: demote to ⋯ or a text link; mobile: keep). Add a done line ("Both moves done. Finish to save.") and check icons instead of the "DONE" text. Empty space is fine. |
| A. Set-player figure not moving | CHANGE ×4, KEEP ×1 | Keep motion in the set player; brief thumbnails stay still. Coach: animate before set 1 and in rests, freeze once logging. Visual: 2-pose fallback + tempo ghost. **Verify on device first.** |

## Lead notes
- A: reduced motion (suggested by three lenses) does not explain it: Today's hero uses the same `ExerciseFigure`
  and the same `usePrefersReducedMotion` gate, and it moved on the same phone. Needs a device repro.
- Copy extras: hero subtitle "Cycles 3 + 4 (with 1RM test)" → "Weeks 7–10 · includes a strength test"; drop
  "1 block ·" and the repeated week text on the mobility card.
- Coach, from today's log: front squat working max is stale (107.5 kg set by hand 1 Oct; 115×3 on 22 Oct; 80 kg
  5×5 all Easy). The engine never proposed a bump: a rep-max test does not feed a working-max proposal.

## Proposed order
1. E (guided player review state). 2. B + D (Today and brief trims, one pass). 3. A device repro → fix.
4. C (templated insights + front squat working-max proposal; engine gap on rep-max tests).
