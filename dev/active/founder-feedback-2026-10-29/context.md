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
- **Live (afa3e4e, CI green).** Live re-shoot (`launch-gaps`, 3/3 pass) after a harness fix: path A visited
  `/session/` before tapping Today's day-1 offer, so the app's resume-last-screen took Today straight back to the
  session (a rest card on a Thursday). The spec now taps "Start your first session now" right after the first Today
  shot; on live the tap pulls the session to today (`07b-today-after-start-now.png`). Not an app bug.
- Insights line capped at two missing names + "and N more" (the stranger run listed four).
- Not done: the five-lens rescore. The captures cover the pull-up stranger path, not the founder's two-track hip Today;
  his phone is the real check.
- **Queued (owner 2026-10-29):** after rounds 2–4 are built, an animation round: 3–4 experts (animator, biomechanist /
  coach, illustrator, front-end engineer) on more human-like, step-by-step motion with excellent form; consider
  open-source options (e.g. Google MediaPipe pose data, mocap-driven rigs) vs the current rig. Experts decide what and
  whether; owner sees the recommendation before any build. Owner likes the current figures: "really precise and nice".

## Handover (2026-10-29 ~19:45, context limit)
**Live on main (CI green):** 2de491e Plan Move/Unskip fix · 1e18ab0 + 7afcd3f + 425dd10 Record redesign (rescored
3 → 7–7.5, fixes applied) and bottom-nav padding fix · cd5abde rounds 2–3 (logging kinds, guided figure before
Start, Plan header + one dot/day, Profile MVP trim). G-14 done (b6197f1).
**Live captures for the next rescore:** `shots/r23/` — set-sled.png (20 m · — kg · Done · set 1 · 20 m), set-nordic,
set-bulgarian, hip-brief, plan.png + plan-row-open.png (hip persona), profile.png + profile-full.png.
**Next steps (owner approved "build all", then animations):**
1. Rescore rounds 2–3 with the same lenses (coach/design lead/copy for set screens `BRIEF-2.md`; design lead/mobile
   UX/copy/visual for Profile + Plan `BRIEF-3.md`) on `shots/r23/` only; fix any H items; deploy; re-shoot.
2. Known small leftovers: Record "Check due" shows twice when the hip section is open; long names wrap in Heaviest
   set; `contributingProgramCount` unused in plan/page.tsx (lint warning); Guide still has an "Extra session" row.
3. Animation expert round (queued above): 3–4 experts (animator, biomechanist/coach, illustrator, front-end) on
   more human-like step-by-step motion with excellent form; consider open-source (e.g. MediaPipe pose data,
   mocap-driven rigs) vs the current rig in `lib/figures/rig.ts`; experts decide; owner sees the recommendation
   before any build.

## R23 rescore (2026-10-29 ~20:30)
Seven lenses rescored `shots/r23/` (`23`–`29`, consensus `00-summary-r23-rescore.md`): Plan 6 → 6–7, Profile
6 → 7.5–8, set screens 6.5–9, no [B]. All [H] items and the four leftovers built; re-shoot to `shots/r23b/`.
