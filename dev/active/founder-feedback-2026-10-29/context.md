# Founder feedback build: context

- Plan: `plan.md`. Panel: `00-summary.md` + `01..05-*.md`. Screens: `shots/`.
- **L4 done (lead):** root cause was units. `SetView.tsx` passed `ExerciseFigure` a seconds clock; every other caller
  passes milliseconds (`TodayHero`, `ProgramFigure`, `FollowAlong`). A 5 s rep ran 1000× slow (80 min), so the figure
  looked frozen. Fixed the clock; documented the unit on the prop. Reduced motion was not the cause (Today used the
  same gate and moved). The coach's "freeze once logging" idea was a minority vote; not built.
- L1/L2/L3/L5 run as Sonnet lanes; none commit. Lead reviews diffs, runs verify + personas, commits, pushes.
- Next: rescore by the same five lenses on a live re-shoot.
- **Built (all lanes in):** L1 guided Back review (FollowAlong), L2 Today trims (HeroStateCard no-check row, tracks caption,
  RunSlotCard advisory line, "Hip check due", no "1 block ·"; phase renamed "Cycles 3 and 4 · includes a strength test"
  because the phase is ~week 12, not 7–10), L3 all-done brief, L4 figure clock fix, L5 insights + rep-max signal.
- **Coach's "stale working max" was wrong under the app's own rule:** TM = 85% of est. 1RM; 115×3 → 126.5 → 107.5 = the
  current TM. The new rep-max-test signal (≤3 reps, RPE ≥9, any exercise with a TM) proposes from ~117.5×3.
