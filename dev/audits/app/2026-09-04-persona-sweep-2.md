# Persona sweep #2 — 2026-09-04

23 runs, 29.7 min, **0 behavioural failures**. Second sweep of the day.

| Dimension | sweep #1 | sweep #2 |
|---|---|---|
| Routes | 100% | 100% |
| Surfaces | 92.3% | 92.3% |
| Store keys | 98.2% | 98% |
| Controls | 90.2% | 90.9% |
| Checks passed | 246 | 246 |
| Failures | 0 | 0 |
| RestTakeover | 8/14 | **9/14** |

---

## The premise was wrong, and the new instrument is what proved it

I opened this task claiming "six controls on RestTakeover that no persona
has ever driven". That is not what 8/14 meant.

The per-surface table reports the **best single persona** (`Math.max`), not
the fleet union. The new "Controls no persona ever drove" section
intersects across all 22 personas — and **RestTakeover does not appear in
it**. Every one of its 14 controls is driven by some persona; no single
persona reaches all of them, because several are mutually exclusive within
one rest (picking an effort commits an RPE, jumping switches exercise).

So there was no six-control hole. There was a statistic I misread.

**The genuinely never-driven controls, fleet-wide, are three:**

- `ExerciseDetailsSheet` — Close
- `OverflowSheet` — Close
- `RetestLoggingSheet` — LOG READING

The two Closes are trivia. `RetestLoggingSheet: LOG READING` is not — it is
the commit button on retest logging, and no persona has ever pressed it.
That is the real gap, and it is worth more than everything I did to
RestTakeover today.

## THE HARNESS RUNS AGAINST PRODUCTION

`tests/e2e/playwright.config.ts:9` —
`baseURL: process.env.E2E_BASE_URL ?? "https://app.terav.fit"`.

Not a local build. This is a strong property — a green sweep means
PRODUCTION works — but it has a consequence nobody had written down:

**an app-side change cannot be seen by the sweep until it is deployed.**

Found the hard way. The `data-control` alias added to `RestTakeover`'s jump
sheet this session read as a complete no-op: the probe still recorded raw
drill names ("High-bar back squat", "Block pull, mid-shin height") and the
jump-row locator matched zero elements, so the flow silently fell through
to Cancel. Nothing was wrong with the change; it was not deployed yet.

Test-side changes (flows, coverage) take effect immediately. App-side
changes need a deploy first. Sequence accordingly, or a correct change
looks broken.

## Two flow defects the artifacts exposed

Both had the same shape — a control that read as uncovered was really a
control the flow had put out of its own reach:

1. **`/^Solid/` "no element matched".** Grind opens the note sheet over the
   takeover, and its scrim swallowed the `change` tap that reopens the
   picker. Recorded as "clicked change but probe never saw it", then a 15s
   timeout, then Solid unreachable. Fixed by moving Grind last — the same
   ordering lesson already written above the +30s step, applied to the
   effort loop.
2. **Jump rows were only ever cancelled out of.** The flow now clicks one,
   asserts it opens a set, and recovers the state the rest of the flow
   needs.

## Still unverified

The `data-control` alias and the jump-row drive have NOT been observed
working — they need a deploy and a third sweep. The RestTakeover
denominator should fall from 14 once the alias lands.

---

## Follow-up, same day: the three "never driven" controls

All three turned out to be measurement faults, not untested paths. Naming
the gap paid for itself immediately.

**`RetestLoggingSheet` — LOG READING.** Not untested. The flow deliberately
abstains (committing a reading closes the retest window and the next sweep
would find no proposal), and files a held-back note for it — under the name
`"Save reading"`. The button says "Log reading", and the probe reads
`innerText`, which returns the CSS-uppercased "LOG READING". Two
mismatches, so the abstention never cancelled the miss.

This is fault #1 of that same flow, already documented in its own comment —
`/^Log reading$/` vs rendered "LOG READING" — fixed for the tap and not for
the note. **Fixed.**

**`ExerciseDetailsSheet` — Close** and **`OverflowSheet` — Close.** Real
failures, and not naming: both record
`click failed: locator.click: Timeout 15000ms exceeded` on EVERY persona.
The details sheet's Close is a proper `aria-label="Close"` and the flow does
tap it, so the locator resolves and then never becomes actionable — most
likely a stacked sheet or a scrim, since ExerciseDetailsSheet is opened
FROM OverflowSheet.

**Not fixed — deliberately.** Two wrong guesses earlier today each cost a
30-minute run, and this needs the trace rather than a hypothesis. Worth
doing: 2 controls × 15s × 22 personas is roughly ELEVEN MINUTES of a
thirty-minute sweep spent on two clicks that cannot succeed.

Next session: `npx playwright show-trace` on
`persona-strength/…session-exercise-details`, find what is over the button,
then fix. Do not shorten the timeout to hide it.

---

## Sweep #3 (post-fix) — and a regression I caused

23 runs, 31.1 min, 0 failures.

| | #1 | #2 | #3 |
|---|---|---|---|
| ExerciseDetailsSheet | 0/1 | 0/1 | **1/1** |
| RestTakeover | 8/14 | 9/14 | **10/11** |
| RetestLoggingSheet | 1/3 | 1/3 | **1/2 +1 held** |
| Never-driven controls | (not reported) | 3 | **1** |
| Behavioural checks | 246 | 246 | **229** |

**The three fixes landed.** `data-control` cut RestTakeover's denominator
14 → 11 once deployed, confirming the alias. The details sheet's Close now
works. The `LOG READING` abstention now files correctly, so it shows as
held-back rather than never-driven.

**And I broke something.** Checks fell 246 → 229. Cause: the jump-row drive
I inlined into `session-rest-extend`. Jumping closes the takeover, so the
flow had to log another set to recover one — and on five personas the
exercise it landed on had nothing left to log, so it aborted and took the
+30s, effort and skip-rest checks with it.

Seventeen behavioural checks lost fleet-wide, to add one control. **A
coverage addition must not be able to cost coverage.** Moved to its own
terminal flow, `session-rest-jump`, where ending early costs nothing.

## Still open

`OverflowSheet — Close` and `NoteSheet — Close` still record
`locator.click: Timeout 15000ms` on 12 personas each. The
ExerciseDetailsSheet fix did not reach them, so the layering problem has at
least one more instance. Same investigation, not yet done.

---

## Sweep #4 — regression recovered, two predictions wrong

23 runs, 32.4 min, 0 failures.

| | #1 | #2 | #3 | #4 |
|---|---|---|---|---|
| Controls exercised | 90.2% | 90.9% | 91.2% | **94.9%** |
| Behavioural checks | 246 | 246 | 229 | **259** |
| ExerciseDetailsSheet | 0/1 | 0/1 | 1/1 | 1/1 |
| RestTakeover | 8/14 | 9/14 | 10/11 | **11/11 +1 held** |
| NoteSheet | 4/5 | 4/5 | 4/5 | **5/7** |
| Never-driven | — | 3 | 1 | 2 |

The regression is recovered — 229 → 259, past the 246 baseline, with
`session-rest-jump` added on top. NoteSheet's denominator GREW 5 → 7
because it is now correctly scoped and sees its own controls instead of
misattributing them.

**Two predictions I made and got wrong. Both stated in advance, so both
count.**

1. *"Never-driven will be zero."* It is 2. `OverflowSheet — Close` survived
   and `NoteSheet — Not now` appeared (a real, newly-visible gap: the flow
   saves the note rather than dismissing it).
2. *"Runtime drops ~11 minutes."* It rose, 31.1 → 32.4. Twelve NoteSheet
   timeouts did go, worth about three minutes — and `session-rest-jump`
   plus a fourth effort rung more than spent it. The prediction ignored
   what I was adding while subtracting.

## The OverflowSheet Close was my own doing

Timeouts left: `OverflowSheet /^Close/` ×13, `RestTakeover /^change/` ×9.

In fixing the details sheet I replaced a `hasText` locator that matched
NOTHING with an unscoped `getByRole("button", {name: /^Close$/})` that
matched TOO MUCH — the overflow sheet underneath has a Close with the same
accessible name — and then called `ctx.record()` unconditionally, filing a
success whichever button it hit.

So the details sheet read as covered while the overflow sheet's Close kept
timing out: the flow was closing the wrong sheet and reporting it in the
wrong place. Both errors were mine, on the same line, hours apart.

Now just `ctx.tap`, which scopes to the `data-surface` the sheet finally
has.

`/^change/` was the effort loop reaching for the picker after the LAST
rung, where nothing needed it and Grind's note sheet was over the takeover.
Guarded.

Neither is verified. That needs sweep #5.
