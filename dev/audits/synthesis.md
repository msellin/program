# Synthesis — next usability & UX work

**Sources:**
- `ux-designer.md` — 37 screenshots, 18 papercuts
- `strength-coach.md` — code bugs + missing training features
- `qa.md` — 20 bugs across security, data loss, edge cases
- `research-mobility-apps.md` — 13 apps, 4 organising patterns
- `research-strength-apps.md` — 10 apps, industry patterns

---

## Already shipped this session
- Stored XSS in History tab (esc'd `d.date`, `d.derived_state`)
- Developer path leak in fatal-error box removed

---

## Where the research disagrees with earlier product decisions

**User asked for:** a calendar view + drag/move workouts between days.

**Research finding:** *no serious strength app supports drag-and-drop across days* — it undermines fixed programs. Fitbod-style **silent missed-day recalibration** is the industry pattern. If you miss Tuesday, the app just shows what to do now — no red marker, no manual reschedule.

**Recommendation:** replace the "movable workout" ambition with (a) a heatmap calendar showing what's been done (like GitHub contributions) and (b) automatic re-computation so a missed day just becomes today. Cheaper to build, matches how these apps actually work, less cognitive load.

---

## P1 — ship this week (high impact, low effort)

Each is ≤2 hours of work. All together = one focused day.

1. **Fix vitals row collapse on iPhone** *(UX, QA)*
   - Currently 297 px tall because `align-items:stretch` + long wrapping phase name.
   - Fix: shorter phase name in the vitals cell (e.g. "Rebuild" not "Rebuild + evaluate (race prep sub-goal)"), or truncate with ellipsis. Cap the row height to 72 px.
   - Impact: gets the first exercise above the fold on iPhone. Biggest single UX win.

2. **Fix "X/Y done" denominator** *(UX, QA)*
   - Currently counts every block in the phase; user sees "0/23" on a strength-only day that has 7 exercises.
   - Fix: filter to today's strength blocks only. `renderVitals()` uses same list `renderToday()` derives.

3. **Multi-set logging on strength cards** *(Coach)*
   - Right now: one weight, one rep count, one RPE per exercise. Breaks FSL (5×5), AMRAP records, warm-up ramps.
   - Fix: `entry.sets = [{weight_kg, reps, rpe}, ...]`. Card shows a small table: `Set 1, Set 2, Set 3…`. Backward-compatible read: if `entry.sets` missing, synthesise from `weight_kg`/`reps`.
   - Impact: this is the biggest single training-utility gap in the app.

4. **Morning check → session prescription wiring** *(Coach)*
   - Currently: morning check outputs green/amber/red, but the Today tab suggests full weight regardless.
   - Fix: if derived state is amber, cap suggestion at last cycle's TM (hold). If red, drop 10% and add a banner "Symptom flare — reduced load today."
   - Impact: makes the "self-adjusting" promise real.

5. **Numeric input clamps** *(QA)*
   - Weight/reps/RPE accept -9999, 1e10, 12-digit values. TM inference then propagates junk.
   - Fix: `min="0" max="500"` on weight, `min="0" max="50"` on reps, `min="0" max="10"` on RPE. Reject non-numeric.

6. **Store shape sanity check** *(QA)*
   - Currently: any parseable-but-wrong-shape localStorage bricks the app.
   - Fix: after parse, verify `logs` is object, `training_maxes` is object, `cycle` is object. If not, wipe and re-initialise.

## P2 — ship next week (bigger changes, high value)

7. **Rewire Today as hero card + Extras strip** *(UX + both research reports)*
   - Freeletics/Boostcamp pattern. One HERO card = today's session with prescribed weights front and centre. Below: small horizontal strip for accessories/runs ("Do more? Extras →"). Nothing else above the fold.
   - Boostcamp specifically is the 5/3/1 gold standard: %TM + kg + reps shown together on every set, plate calc inline.

8. **In-workout set row: `prev | weight | reps | RPE | ✓`** *(Research)*
   - The industry-standard log row across all 10 apps researched. Previous-session's weights shown next to today's inputs. Checkmark auto-starts rest timer.
   - Depends on P1.3 (multi-set logging) landing first.

9. **Fix cycle-week off-by-one + phase-6 percentage table** *(Coach code bugs)*
   - Phase-4 clamps at deload from week 4 → cycle 4 gets 4 weeks of silent deload.
   - Phase 6 gets 5/3/1 percentages instead of the JSON-defined peak protocol.
   - Both in `suggestForExercise()` in index.html.

10. **Rest timer auto-starts on set check** *(Research)*
    - Currently timer is generic + manual. Wire it: when user checks a set completed, timer starts at the exercise's default rest (2-3 min for main lifts, 60-90 sec for accessories).

11. **Symptom-vs-load chart on Progress tab** *(Research)*
    - The "killer feature no other app has" per the strength research. Overlay symptom scores + top-set load over time. This is what makes the next specialist appointment productive.
    - Data is already there in the log — just needs a chart.

## P3 — ship over following weeks

12. **Bottom tab navigation** *(Research)* — iOS-style bottom tabs, 3-5 max. Current top nav wraps to 2 rows on iPhone with sub-44px tap targets.

13. **Plate calculator inline on strength card** *(Research)* — given weight, show plates per side. Boostcamp does this. 15 minutes of code.

14. **Silent missed-day recalibration** *(Research + user request reframed)* — replaces the "drag workouts between days" idea. If you miss Tue, Wed just becomes what Tue was. No red markers.

15. **Wipe truly wipes** *(QA)* — also clear training_maxes and stretch_targets. Or scope the button (e.g. "Wipe logs / Wipe TMs / Wipe everything").

16. **Auto-seed TMs only on first visit, not every reload** *(QA)* — currently seed re-runs after Wipe, so wipe is a no-op.

17. **Nav tap targets ≥44px + single row** *(UX)* — bump padding, drop long labels, ensure no wrap.

18. **Guide tab updated** *(QA)* — mentions old "TMs" tab that no longer exists; add Extras tab.

19. **PWA service worker for actual offline** *(QA)* — currently no service worker; the app doesn't work offline despite being installable as PWA.

## P4 — backlog

- CSP header
- Focus management in video modal
- Import shape validation (reject files without `logs` field instead of silent data loss)
- Import quota-exceeded surfaces to user
- Juggernaut-style **pre-session readiness check-in** (short symptom prompt when you tap "Start session")
- RP-style **contextual feedback** after provocative exercises (prompt "Anything to flag?" after Bulgarian split squat, not end-of-session)
- Heatmap calendar (GitHub-contribution-style) instead of calendar view
- Push notifications
- Cloud sync (Supabase) — noted in NEXT.md

---

## Concrete "steal this" list from research

Distilled 15 patterns that fit our app:

1. **Bottom tabs, 3-5 max** — universal across all 10 strength apps
2. **Today is a launcher card, not a workspace** — detail lives on the workout screen after tapping "Start"
3. **`prev | weight | reps | RPE | ✓` log row** — universal
4. **Auto rest timer on set check** — Strong, Hevy, Boostcamp
5. **Plate calculator inline** — Boostcamp, Strong
6. **AMRAP → invisible TM bump** — Boostcamp
7. **Warm-up ramps computed from working weight** — Fitbod, Boostcamp
8. **Consistency heatmap** — Strong, Hevy
9. **Silent missed-day recalibration** — Fitbod (steal this over drag-and-drop)
10. **Hero card + Explore strip** — Freeletics
11. **Morning readiness routes today's suggestion** — Whoop, Oura
12. **Attach mobility to workout** — GOWOD Pre/Post-WOD (perfect fit for `block_runs`)
13. **Habit vs prescription as visual weight** — Streaks + Peloton pattern
14. **Pre-session readiness check-in** — Juggernaut
15. **Contextual feedback prompts** — RP Strength

Killer feature none of them have: **symptom-vs-load overlay chart**. This is our differentiator and it's ~3 hours of work.
