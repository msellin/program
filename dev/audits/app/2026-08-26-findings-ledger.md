# Findings ledger — 2026-08-24 → 2026-08-26

Everything discovered across three days: the founder's live-workout report,
the fixes that report led into, the off-plan investigation, the persona-harness
rebuild, and the bugs the improved harness then found on its own.

**64 findings. 10 reported by the founder; 54 found while working.**

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
| F6 | **A 45-minute Zone 1 run showed a rep counter reading 0.** Aerobic, skill and mobility exercises author neither reps nor `hold_seconds` — `aerobic_z1_steady` is `{minutes: 45}`, `om_wall_slides` has no default at all. Found by the harness across nine personas, not by a person | Fixed — timed mode covers minutes |

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
| G8 | MoveSheet's destination days are `<input type="radio">`, not buttons — the selector matched none, `selected` stayed null, and the commit button stayed disabled. Presented as "found but click timed out" |
| G9 | `"Skip"` names both the day row and the sheet's confirm, so the tap resolved to the row behind the scrim |
| G10 | The move commit relabels to `"Confirm — stack the session"` and needs a SECOND tap when the destination already has a session — which the first enabled day usually is |
| G11 | The adjacent-duplicate check flagged `overhead-mobility`'s Sat/Sun `block_daily_reset` — a five-minute pre-bed routine doing exactly what it should. False positive; the concern is consecutive LOADED sessions |
| G12 | A raw `.click()` that cannot land throws and kills the whole flow, where `tap` records one missed control and carries on. Nine flow errors across the fleet came from one such click |
| G13 | `session-edit-past-set` had accumulated so much exploration that its own assertion had no clean state left to assert against. Split into an assertion flow and a control sweep |

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
| I2 | ~~Control coverage stalled at 61.4%~~ **Resolved.** The cause was never one thing: dynamic labels inflating the denominator, page chrome in the count, probe and tap deriving labels differently, anchored regexes, and inputs unreachable by tap. Fleet control coverage now 75%+, best persona 85% |

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


---

## Closing state (2026-08-27)

Final production sweep, 17 personas, 16.9 min, **146 behavioural checks,
zero failures**.

| Dimension | Session start | Close |
|---|---|---|
| Routes toured | 63% | **100%** |
| Interactive surfaces | **0%** | 93.3% on nine personas |
| Controls within surfaces | not measured | **81.2%** mean |
| Store keys populated | 35% | **81.7%** |
| Behavioural assertions | **0** | **146, all passing** |
| Sweep wall-clock | ~40 min serial | **16.9 min** |

The eight personas sitting at 53.3% surfaces are cardio-only or graduated
programs — engine-builder is entirely run blocks, and rowing has no set
flow on any day. After F3 that is the correct answer, not a gap: those
sessions are logged as activities, so the set-flow flows have nothing to
reach and skip with a reason.

## Four more harness faults, all self-inflicted this session (G14-G17)

Worth recording as a class. Each time an app fix changed what the UI
offered, the harness read the change as reduced COVERAGE rather than as a
fault of its own:

| # | Finding |
|---|---|
| G14 | The rowing CTA rename to "Log this session" made `openBrief` walk past sessions that had started working |
| G15 | Prescription sessions made every set-flow flow die in bounded timeouts, blowing the 900s persona budget and cascading a closed context through all 24 flows — reported as fifteen skips |
| G16 | The guard for G15 sampled once after a flat 700ms and over-fired on slow paints, dropping twelve personas from 93.3% to 53.3% |
| G17 | F3 made cardio days legitimately flowless, so a persona whose sweep day was a cardio day skipped every set-flow flow — correct behaviour reading as a regression |

The lesson the instrumentation encodes: **a skip and a death must never
look the same in a report**, and a coverage number that moves has to say
why it moved.

---

## J · Pre-beta program-lifecycle audit (2026-08-27)

Asked before opening the app to friend testers: can they break it in the
first week? The founder has only ever driven his own track, so the audit
targeted the lifecycle surfaces he has never used — switching, ending,
and finding a program at all.

| # | Finding | Status |
|---|---|---|
| J1 | **A user mid-arc could not quit.** "End this program" lives only on the GraduationCard, which renders after the arc completes. Profile's "Remove" required `activePrograms.length > 1 && !isPrimary` — unreachable under the single-main cap, where there is exactly one row and it is always primary. The only exit was starting a different program | Fixed — every non-paused row now offers an exit, labelled "End this program" on the primary |
| J2 | **Switching focus was silent.** `startAlone` routed into intake BEFORE the switch-warning ConfirmSheet could fire. Every catalog program declares an intake, so the warning never fired for anything a tester can reach: they answered the wizard and their current focus vanished from Day and Plan unasked | Fixed — the confirm runs before the intake hand-off; confirming continues into the wizard |
| J3 | That sheet's copy was **false under the cap** — it promised the prior program "will move to your secondary track" and that "the others ride alongside", which describes `MULTI_MAIN_ENABLED=true`. The code replaces | Fixed — copy now says it stops appearing on Day and Plan, and that re-picking resumes the arc |
| J4 | **`away_periods` selector re-introduced React #185.** `useStore((s) => s.store.user_profile?.away_periods ?? [])` returns a new array reference on every read; zustand compares with `Object.is`, so the subscriber refires forever. Crashed **/profile for every account with no away period saved — i.e. every new tester**. Shipped same-day in `05fe8b1`, after the last persona sweep. Identical to the RetestMetricsPanel bug fixed in Batch 36 (2026-08-21) | Fixed — raw select, fallback derived outside the subscription |
| J5 | The single-main cap had **no test of any kind**. The one spec that touched it (`handstand-walk-flow.spec.ts`) asserted "Add alongside" was visible — written before that button moved behind the super-admin allowlist — and is in no npm script, so it never ran and never failed | Fixed — 10 unit tests in `useStore.program-lifecycle.test.ts`; the stale spec rewritten to assert the shipping contract |
| J6 | `AuthGate` carves out `/programs` as public, but `AppShell` gates first and its own PUBLIC_ROUTES list does not include it. The carve-out is dead code and program browsing is auth-only | Open — cosmetic for beta; matters if the landing ever deep-links a logged-out visitor into a program preview |
| J7 | Programs is not in the bottom nav (Day / Plan / Record / Profile). Reachable only via Profile rows, empty-state CTAs, and the GraduationCard. In an installed PWA there is no URL bar to fall back on | Open — founder decision, see the master task list |
| J8 | F2 ("every rowing block has zero items") was still marked Open. Those blocks are `category: "run"`; F3 made run-modality work log as activities | Closed — resolved by F3, ledger line was stale |

**What did NOT break.** The cap itself holds: all five catalog programs
declare an intake (7-18 questions), so every switch a tester can perform
routes through `addSecondaryProgram`, hits the `MULTI_MAIN_ENABLED=false`
branch, and replaces. The "+ Add alongside" bypass is gated to the
super-admin email allowlist. Switching is reversible — `program_states`
survives the swap and `ensureProgramStateEntry` never overwrites an
existing `started_at`, so the arc resumes rather than restarting.

J4 is the one that would have hit on day one, and it was found only by
driving the app rather than by reading it — the same lesson as the
2026-08-26 postscript. The sweep that would have caught it ran the day
before the commit that introduced it.

---

## K · Two prod sweeps before the beta invite (2026-08-27)

Run 1 was a baseline against prod at `0477614`, unchanged. Run 2 followed
a round of harness work. The app was asked to break twice and did not.

**Run 1 found nothing.** 17 personas, 146 behavioural checks, **zero
failures, zero flow errors, zero console errors, zero non-2xx
responses**. The three lifecycle fixes and the `away_periods` crash fix
hold on production.

Every finding below is therefore about the harness, not the app — the
same class as the G-series, found again in six new places.

| # | Finding |
|---|---|
| K1 | **`RetestLoggingSheet` was never unreachable.** The proposal renders on persona-retest's Day in every sweep ever taken — its own tour capture reads "MID-BLOCK RETEST WINDOW OPEN / LOG READING". Three faults stacked: `/^Log reading$/` is case-SENSITIVE while Playwright derives the accessible name from RENDERED text, and the button is `font-mono uppercase`, so its name is "LOG READING"; a flat 1500ms wait is shorter than this account's KV hydration, and proposals are derived from the store; and `goto("/")` does not land on Day, because `ResumeLastRoute` (the A10 fix) redirects a cold "/" to wherever the PREVIOUS flow finished — this one runs after `hip-check`, and its own failure capture is a screenshot of the hip check |
| K2 | The first diagnosis of K1 was **wrong**: engine-builder's end-of-block targets are `at_week: 8` and the persona runs 25 days, so it looked mis-positioned. It also declares a mid-block metric at `at_week: 4`, which is exactly where the persona sits. Recorded because the wrong answer was plausible enough to act on |
| K3 | Fixing K1 made the flow stop skipping and start **failing**, which re-triggered G15: an 8-15s wait plus a 15s click timeout blew the 900s persona budget and cascaded a closed context. Every timeout in a flow that begins doing real work has to be re-budgeted — the standing cost of coverage going up |
| K4 | `SetView`'s denominator grew with session content. Rail tabs were filed under exercise names, and the tap regex was built from `textContent`, which glues the label to its set counter ("High-bar back squat2/6") and never matches the accessible name. G6, one surface over |
| K5 | `kg` and `reps` were tapped two lines after `Hide` closed the editor that contains them. `probe` saw them (it runs while the editor is open); `tap` reported "no element matched". A measurement fault wearing a coverage gap's clothes |
| K6 | RestTakeover's "Add a note", "Solid" and "Do something else next" were driven AFTER the effort scale, which commits the RPE and takes the surface down with it. Three controls the flow had dismissed before reaching for them |
| K7 | `contraindications` seeded in `seedStore` never survived: that runs before sign-in, the account's remote copy carries no such key and wins the `updated_at` comparison on hydration. The H1 pattern, presenting as "my seeding does nothing" |
| K8 | `CONSISTENT_AVERAGE` hardcoded `life_load: 4` in its symptom payload while its own `lifeLoad(d)` returned 3-5 — dead code, and a flat 4 sits one point under the amber threshold. An archetype promising an "occasional life event" had zero elevated days in 25, so the engine never proposed a softening and `day_adjustments` was empty in 13 of 17 personas |
| K9 | Surface coverage counted sheets that cannot exist. Six surfaces hang off a set flow; engine-builder is entirely run blocks and rowing has no set flow on any day. Eight personas were marked down for sheets their program cannot render — G17's lesson at the surface level. Now scored against what the program can produce, with the unscoped figure reported alongside |

### Result

| Dimension | Run 1 | Run 2 |
|---|---|---|
| Routes toured | 100% | 100% |
| Interactive surfaces | 74.5% | **92.3%** (75.3% unscoped) |
| Store keys populated | 81.4% | **97.7%** |
| Controls within surfaces | 82% | **91.7%** |
| Behavioural checks | 146 / 0 failed | **148 / 0 failed** |
| Surfaces never reached | RetestLoggingSheet | **none** |

The first sweep in this harness's history where every surface is reached
by at least one persona.

### Still open

One bug, three symptoms: **`Close` on a STACKED sheet times out at 15s.**
ExerciseDetailsSheet (still 0/1), OverflowSheet and NoteSheet each open
over another sheet, and the one underneath still owns the scrim, so the
press is swallowed without failing. Nine personas × three attempts is
also why wall-clock went 16.9 → 22.9 min: fixing it should buy time back.
Tracked as R3-1 in `dev/active/harness-coverage/plan.md`.
