# Founder feedback round 4: Record — panel consensus (2026-10-29 evening)

Design lead, visual, coach, copy (`15`–`18-r4-*.md`). **Record 3/10 now; 7–7.5 after.** Unanimous on the shape.

1. **Headline = this week.** Sessions done / planned as rings or a bar (visual: three bronze rings — sessions, focus
   sessions, check-ins), a neutral "on track / N behind" line (coach: count, don't scold; a red-day skip is not a
   miss), new bests. Exercise names, never raw ids (`WeeklyNarrativeTile.tsx:112` shows `block_pull_midshin`).
   Copy: "Heaviest set", "New bests: 3".
2. **One 12-week grid, not two.** Readiness and Activity are the same picture; keep one (done / missed / flagged).
3. **One focus-metric card** replaces "Rolling 84-day avg" + "Retests · 0 events": first → latest, change, sparkline,
   fed by each program's `retest_metrics` (works for all 9 programs); hidden until it has 2+ readings. Cut the
   30D / 90D / 1Y / ALL tabs from the default view.
4. **Hide every empty card** (trend, retests, monthly check, rehab 0/30); one plain empty state:
   "Your week shows up here after your first session."
5. **History behind a tap** ("All sessions" / its own screen, with Export); at most the last 7 days on Record.
   Drop the "logged" fallback rows.
6. **Hip-only views go to the bottom, collapsed** (still only for that program): "Check due" stays visible; the
   load-vs-symptom chart one tap deep and split into two single-axis charts (visual); the 0/30 rehab card and the
   clinical paragraphs cut. Symptoms surface as a one-line note only after amber/red in the last 7 days (coach).
7. **Copy:** drop the NOW / TREND / LOG dividers and the "Tap a point…" intro; Export moves to the history screen or
   Profile. Page ~3 phone screens → ~1.5.
