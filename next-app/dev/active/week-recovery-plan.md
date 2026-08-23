# Plan tab: "the week going wrong" recovery card

Copied from the approved plan (`/Users/margussellin/.claude/plans/harmonic-crafting-firefly.md`
at time of approval, 2026-08-23). See that file's history if needed;
this is the durable copy per CLAUDE.md's dev-docs convention.

## Context

Follow-up to the Day redesign (`fd0099c`/`a0eca04`). Design package turn
`t3` (screens `3a`/`3b`), read in full this session for the first time.
`3a` (full-week list) is already substantially built in `/plan/page.tsx`
— skipped. `3b` ("the week going wrong") is a genuinely missing state:
no recovery flow exists today when a user falls behind mid-week. The
closest thing, `MissedSessionPrompt.tsx`, is a single-day ("yesterday
only") nudge on the Day dashboard that the README itself says should
move to Plan's broken-week screen. This builds that, generalized from
"yesterday" to "this week," and retires `MissedSessionPrompt`.

## Key finding

`useStore.ts` already has `skipDay`, `skipAndShiftWeek`, `skipWholeWeek`,
`computeWeekShift` — all reason-taking, all already exercised by
`MissedSessionPrompt`'s two-option flow. The mockup's three `recOptions`
map 1:1 onto three existing actions (skip only / shift the week / push
the whole week +7d via the previously-unused-in-UI `skipWholeWeek`).
Zero new store logic needed.

`missed_session` is already a reserved `ProposalKind` in
`proposal-citations.ts` (citation `null` — log-cited only) but has no
`Proposal` payload variant. Decision: build a bespoke component instead
of wiring into the full `Proposal` union — the 3-option + reason-chip UI
doesn't fit `ProposalCard`/`useProposalActions`' binary Accept/Ignore
model, and touching those exhaustive switches would add risk to code
that's live everywhere (`/`, Brief) for no real gain. Still reuse
`citationIdForKind("missed_session")` for copy-convention consistency and
`dismissProposal(date, id)` for cross-device-synced dismissal (it's
generic — two strings, no Proposal typing required).

## Design decision: banner, not full-page replacement

The mockup draws `3b` as replacing Plan's entire day-list. Building it as
a dismissible banner ABOVE the existing day-list instead — hiding the
calendar would remove the "just log what happened" path for the specific
missed day(s), which the existing `WeekDayActions` "Log session →" verb
already provides. Banner handles the week-level decision; day rows
underneath still handle "let me log it."

## Trigger

Plan's current week only (`offset === 0`). Fires when ≥1 past day this
week (Mon..yesterday) was a scheduled strength day, nothing logged, not
already skipped/moved — same per-day check `MissedSessionPrompt.tsx`
already does, generalized across the week. Copy is dynamic ("missed N of
M"), not the mockup's hardcoded "two of three."

## Files

New:
- `src/lib/engine/missed-week.ts` — `detectMissedWeek()`, pure function
- `src/components/plan/WeekRecoveryCard.tsx` — the banner

Modified:
- `src/app/plan/page.tsx` — render the card above the day-list
- `src/components/session/TodaySession.tsx` — remove `<MissedSessionPrompt>`
  (dashboard mode; component file stays, just unused going forward)

Untouched: `useStore.ts`, `schemas.ts`, `ProposalCard.tsx`,
`useProposalActions.ts`, `select.ts`.

## Verification bar

Same as the Day redesign pass: tsc/eslint/vitest clean (net-neutral or
better vs. baseline), live manual walk via the sandboxed e2e test
account, confirm dismiss persists, confirm old Day-dashboard prompt is
gone.
