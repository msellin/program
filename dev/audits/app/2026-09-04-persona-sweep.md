# Persona sweep — 2026-09-04

23 runs, 31.1 min, **0 behavioural failures**. Artifacts are gitignored and
regenerated, so the numbers are recorded here.

Previous sweep: 2026-09-02, ~20 commits earlier. Those numbers were
measuring an app that no longer existed.

| Dimension | 2026-09-02 | 2026-09-04 | |
|---|---|---|---|
| Routes toured | 100% | 100% | — |
| Surfaces reached | 92.3% | 92.3% | — |
| — unscoped | 77.5% | 77.5% | — |
| Store keys populated | 92.9% | **98.2%** | +5.3 |
| Controls exercised | 91.5% | **90.2%** | −1.3 |
| Behavioural checks passed | 185 | **246** | +61 |
| Behavioural checks failed | 0 | 0 | — |
| Routes / surfaces never reached | none | none | — |

## The controls dip is the number behaving correctly

`SetView` went 14/15 → **15/17**. The miss button was added AND the probe
found two controls that did not exist on Monday. More is covered in
absolute terms; the percentage fell because the app grew. A rising
percentage here after a feature ships would mean the denominator was not
tracking the app.

## Programme coverage

All 9 shipped programmes have at least one persona. The three newest are
covered: `muscle-up` → persona-muscleup, `overhead-mobility` →
persona-mobility, `engine-builder-block-2` → persona-engine-block2.
`first-strict-pullup` has three, `concurrent-strength-maintenance` four.

## New flows, and whether they fired

Added because a sweep that never tries a new control just reports a bigger
denominator.

| Flow | Ran | Skipped |
|---|---|---|
| `session-log-missed-attempt` | 6 (concurrent, erratic, recover, strength, strength-long, strength-slow) | 7 no training max — correct, the control is gated to TM lifts; 9 no session in the ±7-day window |
| `session-cold-reload` | 14 | 9, all "no session prescribed within ±7 days" |

Both assert rather than photograph. The miss flow checks the store holds
`failed: true, reps: 0` and that the pip reads as a miss, not "×0". The
reload flow checks you land back in the session and that a restored rest
resumes where it was rather than from the top.

`session-cold-reload` had **zero predecessor**. Three separate fixes for
app-eviction behaviour have now shipped on founder reports rather than on a
sweep, because nothing here ever reloaded the page mid-session.

## Two things not to read into this

**`RestTakeover` is still 8/14 and is the weakest surface in the fleet.**
The new states did not lift it: `session-rest-extend` skips with "rest
takeover did not open" on the skill and mobility personas, and
`session-cold-reload` only probes the takeover when a rest was actually
running. Six controls there remain unexercised, as they did before today.
Next sweep's most valuable addition.

**A page reload is not an iOS eviction.** It is the closest a headless
Chromium gets, and it catches "nothing was persisted", which is what was
broken. It cannot prove Safari's memory-pressure behaviour. The founder's
real-device check is still the thing that would settle it.

## Two harness defects caught before the run

Worth recording because both would have produced coverage that was not
coverage:

- a check ending in `|| true`, which passes forever while looking green
- the pip assertion read `SetView` through the `RestTakeover` overlay
  covering it — testing whatever the accessibility tree leaked through an
  overlay rather than the thing intended
