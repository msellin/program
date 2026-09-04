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
