# Follow-along: "11 sets logged" but nothing in the store

Verdict: (c)-ish but REAL app bug. updateSet is never called; no write, no overwrite, no sync involved.

## Root cause
FollowAlong.tsx ~L330-520 (player body): the rep controls row (-1 / +1 / "Log all N", ~L423-445) is
overlapped by the "Something hurts" row (L~460, `flex-shrink-0 ... pt-1`) and the bottom Back/primary/Skip row,
when the viewport is short. The content column (L332 `flex min-h-0 flex-grow flex-col`) holds fixed-height
children (aspect-video figure, h-7 chip row, h-[53px] title, 176px ring, h-11 controls) and overflows its box
instead of shrinking, so the controls paint under the hurt row.
- Probe: at 375x667, elementFromPoint at the centre of +1, -1 and Log all (y=485..529) returns the "Something hurts"
  wrapper div, not the button -> `click({force:true})` hits the div: no onClick, count stays 0; the primary "Set done"
  (bottom row, not covered) runs completeSet(0) -> `if (reps > 0) log()` skipped, results[idx]="skip" (L~146-148).
  Done screen text at 667 reads "done 0 sets logged" (the "11" is Step x/11 of the block, not logged sets).
- Probe at 393x852: all three buttons hit-testable (ok:true), same spec sequence writes
  logs["2026-10-28"].exercises["block_row_strength:pu_ring_row_incline"] immediately after Set done. 
  At 393x740: still overlapped (ok:false). So the threshold is somewhere 740-852 tall.
- No setItem of program.log.v2 and no Supabase request occurred at 667 during the loop => not an overwrite/hydration race.

## Prod impact
Real: any phone whose visible viewport is < ~800px tall (iPhone SE, 15 Pro in Safari with toolbars ~660-750px,
small Androids, landscape-less PWAs with keyboards) cannot tap +1 / Log all in the player; Set done then
logs nothing. A user gets a session with no Done tags and no Finish. The harness only exposed it because 375x667 is SMALL.
(The existing `[@media(max-height:700px)]` tweaks shrink the figure/ring only; not enough.)

## Proposed fix
1. Make the middle column shrink: give the figure `min-h-0 flex-shrink` / drop aspect-ratio under max-height:800px,
   `overflow-y-auto` on the column, and keep the controls row + hurt row + bottom row `flex-shrink-0` outside the scroll area.
2. Add a Playwright/RTL guard: at 375x667 and 393x740 assert elementFromPoint(+1 / Log all) === button.
3. Harness: replace `click({force:true})` with a normal click so overlap fails loudly (Playwright reports "intercepts pointer events").
4. Optional hardening: summary "N sets logged" should count store writes, not local `results`.
