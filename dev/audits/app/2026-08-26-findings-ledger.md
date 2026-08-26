# Findings ledger — 2026-08-24 → 2026-08-26

Everything discovered across three days: the founder's live-workout report,
the fixes that report led into, the off-plan investigation, the persona-harness
rebuild, and the bugs the improved harness then found on its own.

**48 findings. 10 reported by the founder; 38 found while working.**

Of those 38, **11 were found only because the harness was improved**, and
**3 of those were invisible on localhost and only appeared against production.**

---

## A · Founder-reported (7)

Live workout, 2026-08-24.

| # | Finding | Status |
|---|---|---|
| A1 | Completed sets unreachable — no way back to a previous set | Fixed — set pips |
| A2 | Completed sets uneditable — a mis-logged weight was permanent | Fixed — same |
| A3 | Day showed one track where Plan showed two | Fixed — shared source + materialization keeper |
| A4 | Session rail too dense on off-plan (~11px tap targets) | Fixed — scrolling rail |
| A5 | Rest completion sound too short to notice mid-workout | Fixed — ~1.3s chime + audible 3-2-1 |
| A6 | `+30s` reset the rest timer instead of extending it | Fixed |
| A7 | Notes far less visible after the redesign | Recorded, unscheduled |
| A8 | **Phase 1 put two heavy days back to back.** `block_reintro` is one session containing both squat and pull, scheduled Mon/Wed/Thu/Sat — Wed and Thu were a heavy squat 24h apart, contradicting the program's own "48h between heavy squat days" principle | Fixed — Mon/Wed/Sat |
| A9 | `dead_bug` (and every mobility drill in a session) showed a weight selector — `isLoadable` was hardcoded `true` in DaySession | Fixed |
| A10 | Backgrounding the PWA lost your place — iOS relaunches cold at `start_url`, and nothing remembered the route | Fixed — ResumeLastRoute |

Root cause behind A1/A2: `activeSetIndex` only ever moved forward, and
`ExerciseCard` — the app's only per-set editable UI — was orphaned when
off-plan moved onto SetView. Nothing rendered it any more.

---

## B · Found while fixing those (8)

| # | Finding | Severity |
|---|---|---|
| B1 | `materializeLookahead` had **zero callers**. `scheduled_blocks` was written once by a migration; every track would have silently emptied at migration + 28 days | High |
| B2 | Plan derived days from phase math while Day read `scheduled_blocks` — two sources for one question | High |
| B3 | `resolveActiveTier` read `active_program_id` rather than the program passed in, so a second track resolved the primary's tier | Medium |
| B4 | Write race: the block migration and the grandfather check both `replaceStore` from stale snapshots, each clobbering the other's `migrations_applied` | Medium |
| B5 | Accessory reps seeded 0 and Done committed the zero — corrupted two real sets in the founder's own log | High |
| B6 | Accessory work displayed no prescribed dose at all | Medium |
| B7 | Four e2e specs depended on the weekday; all broke when the date rolled over mid-session | Medium |
| B8 | A test asserted behaviour the app never produces — its loader didn't stamp `program.slug`, which the real loader always does | Low |

---

## C · Off-plan investigation (4)

| # | Finding |
|---|---|
| C1 | **No program has off-plan-only content.** Every accessory/run block in all nine is already scheduled onto a day — `/off-plan` was a second door into prescribed work, and a live double-logging path |
| C2 | Off-plan is anterior-hip-shaped by construction (`schedule.ts:457`) — it is the only program that routes non-strength blocks off Day |
| C3 | Activity logging is the **retest data source for four programs**. Cutting it would have gone dark on half the catalog's evidence loop |
| C4 | 42 call sites across 18 files treat `reps != null` as "this set is logged" — the constraint that shaped the time-based logging design |

---

## D · Persona-harness audit (11)

The harness was a state-fabricator plus a screenshot walker. It never clicked
anything, which is why every founder-reported bug sat in its blind spot.

| # | Finding |
|---|---|
| D1 | The tour never clicked anything — **0 of 17 interactive surfaces** ever opened |
| D2 | `/session/[slug]` — the app's most-used screen — was never toured at all |
| D3 | `/events` was toured and **does not exist**; every persona captured a 404 at two viewports |
| D4 | Three personas logged **nothing** across 150 simulated days — three independent gates, each sufficient alone |
| D5 | **Zero mid-session states** across 1,064 simulated days: 117 fully-logged exercises, 0 partial |
| D6 | `dismissed_proposals` never written — including for the persona whose declared focus *is* dismissed proposals |
| D7 | `retest_readings` never written, though 10 source files read it |
| D8 | `scheduled_blocks` / `scheduled_overrides` never simulated |
| D9 | `persona-strength-long` simulates 400 days and produces 25 exercise entries |
| D10 | `daily_plans` is dead code (zero callers); `stretch_targets` has no writer — both inflating the coverage denominator |
| D11 | Flow coverage depended on the weekday: 7 of 13 personas skipped every session flow |

D4's three gates: `itemsForBlock` returned `[]` for slot-based blocks; the
`if (!tm) continue` gate dropped every non-loadable drill; and
`pickBlocksForDate` applied a strength-category filter to every program though
all 7 overhead-mobility blocks are `accessory`.

---

## E · Found only against production (3)

Invisible on localhost, because the persona accounts carry different
server-side state there.

| # | Finding |
|---|---|
| E1 | The confirm-first gate hung the harness for the full 900s test budget on a permanently-disabled Start button, then cascaded a closed context into eight downstream flows |
| E2 | `program-preview` used the wrong selector and skipped on 14 of 15 personas — `ProgramPreviewClient` had never been reached |
| E3 | Stale session cookies made `/sign-in/` redirect away, so the form never rendered and the persona died at step one — two consecutive sweeps |

---

## F · Product findings (5)

| # | Finding | Status |
|---|---|---|
| F1 | Hold-based work logged as reps — a 30-second stretch recorded as `×12` | Fixed — countdown + `seconds` |
| F2 | **Every `rowing-2k-test-prep` block has zero items.** Rowing is un-startable in the session flow by data design | Open |
| F3 | For run-modality programs the prescribed session and the logged data live in different places — doing the run in the session doesn't feed the retest metric | Open |
| F4 | Off-plan's session header read "121 sets left" — the whole program's accessory inventory presented as one session | Fixed by the off-plan cut |
| F5 | No persona had ever exercised off-plan: 0 off-plan days across all 15 | Corroborated the cut |

---

## G · Bugs in the harness's own measurement (7)

Each made coverage read lower or higher than the truth.

| # | Finding |
|---|---|
| G1 | `probe` derived labels from `aria-label ?? innerText`, `tap` from `textContent` — the same control filed under two strings, so everything driven still counted as missing |
| G2 | Page chrome (bottom nav, dev-tools button) counted as surface controls, putting a floor under the miss rate |
| G3 | Every sheet shares `role="dialog"`, so probing the details sheet read back the overflow sheet's rows |
| G4 | Every tap regex was anchored (`/^Add a set$/`) but rows carry a hint line, so the accessible name is `"Add a set4th at prescription"` — nothing matched |
| G5 | `tap`'s input fallback wrapped `getByLabel` in `.filter({hasText})`, which excludes inputs — the steppers were unreachable |
| G6 | Dynamic labels (`"Save — set 1 · 79.5 kg"`) inflated the denominator without bound |
| G7 | The fleet summary raced under parallel workers — a module-scoped array only ever saw one worker's share |

---

## H · Test-infrastructure findings (3)

| # | Finding |
|---|---|
| H1 | A `DayLog` fixture missing required fields fails zod, which invalidates the **whole store**, which sends `loadLocal` to its empty default, which loses the `updated_at` comparison — the remote copy silently wins and the injected data is simply absent. Presents as "my seeding does nothing" |
| H2 | The persona sweep was `serial` from the days when every persona shared one account; each now has its own user. Parallelising took a sweep from 40+ minutes to ~11 |
| H3 | An assertion of mine compared Day's track count against the first "N tracks" chip anywhere in the visible week, not today's row |

---

## I · Open, unclassified (2)

| # | Finding |
|---|---|
| I1 | The check "Skip rest closes the rest takeover" fails. Not yet determined whether the app fails to close it or the harness fails to tap it |
| I2 | Control coverage has stalled at 61.4%. Scoping `tap` to the surface root — the hypothesis that page-wide `getByRole` was resolving to the Brief behind the overlay — made no difference. SetView sits at 7 of 17 and the cause is not yet known |

---

## What the improvement bought

The harness moved from **0% of interactive surfaces** to every surface reached
by at least one persona, from 63% to 100% of routes, and from no behavioural
assertions at all to eight. It then found E1–E3 and I1 on its own — bugs that
existed before any of this work and that nothing would otherwise have caught.


---

## Postscript: what the harness still missed (2026-08-26)

A8, A9 and A10 were all found by the founder in a gym, not by the sweep —
and all three are visible on surfaces the harness now reaches:

- **A8** shows on Plan as two identical day rows. The tour screenshots Plan
  every run; nothing asserts that heavy days are spaced.
- **A9** shows on the set screen as a kilo counter on a trunk exercise. The
  flows drive that screen; nothing asserts that a non-loadable exercise has
  no weight control.
- **A10** needs a lifecycle the harness never simulates — background the
  app, wait, cold-load.

Reaching a surface is not the same as knowing what should be true on it.
The next checks write themselves:

    no two barbell days are consecutive          (already added, unit)
    a non-loadable exercise offers no kg control (flow check)
    two day rows in a week are never identical   (flow check)
    a cold load restores the last route          (flow check)
