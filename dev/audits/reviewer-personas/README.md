# Simulated reviewer personas

**No human has reviewed any Terav program.** Everything in this directory is a
simulated reviewer, run because the founder has no clinician or coach to send a
packet to at this project's scale.

## The rule these exist under

Output is recorded as an **agent review** (`reviewed_by`), NEVER as
`specialist_review`. That field is reserved for a named human, and populating
it makes `data-integrity.test.ts` fail until the "no outside specialist has
signed off" sentence is removed from /programs. A simulated reviewer must not
move that claim — otherwise the app tells users something false.

Designations (SR-1, SR-2, …) are deliberately not plausible human names. A repo
whose recurring failure is claims that were true when written and misread later
should not contain a realistic byline attached to a clinical sign-off.

## Calibration, from five rounds of agent panels

**Agents are good at noticing metadata and structure, and unreliable at
deciding what a paper says.** Every finding that has survived independent
checking was of the first kind. So every persona must:

- Attach a confidence to each judgement: `certain` / `likely` / `needs-paper`.
- Treat `needs-paper` as a correct and useful answer, never a failure.
- Separate framing/terminology findings from prescription findings from
  screening findings — different costs, different severities.
- Complete the sign-off honestly, including what they did NOT review.

The orchestrator verifies every checkable claim against the shipped JSON before
acting on it. SR-1's run produced three blocking findings, all verified, all
real — and two claims elsewhere in the same series that turned out to be false.
