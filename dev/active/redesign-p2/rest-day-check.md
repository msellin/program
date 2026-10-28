# Rest-day check (L6, 2026-10-28)

Verdict: NOT a bug. The "Skipped" + Unskip rows are skipped TRAINING days, not rest days.

Evidence: next-app/tests/e2e/artifacts/personas/persona-concurrent/text/02-plan.txt (and mobile/02-plan.png), week 26 Oct-1 Nov.
Mon 26 Oct and Wed 28 Oct read "anterior hip rebuild: skipped; engine builder: skipped" (scheduled blocks with state=skipped),
then "Skipped / Rest / accessory day / Unskip". final-store.json has skipped{} for 10-20, 10-26, 10-28 ("sim: archetype skipped").
Rule (src/app/plan/page.tsx ~L538): daySkipped = rawSkipped && !(isRest && dayBlocks.length === 0). Skipped blocks are filtered out of
displayBlocks (so isRest is true) but dayBlocks.length > 0, so the day stays "Skipped". A skip on a day with NO scheduled blocks would show "Rest".
Residual copy wart (not a logic bug): the skipped row's subtitle still says "Rest / accessory day" (displayLabel); a reviewer reads that as a struck-through rest day.
Same pattern in persona-csm-red, erratic, handstand, mobility, multitrack, muscleup-elbow, pullup, rowing(-erratic) 02-plan.txt.
