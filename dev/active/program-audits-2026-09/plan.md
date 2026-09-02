# Comprehensive audits — the three CITED programs (2026-09-02)

## Goal

Bring `first-strict-pullup`, `muscle-up` and `engine-builder-block-2` from
`REFERENCED` (badge: CITED) to `REVIEWED` (badge: VERIFIED) by putting them
through the same documented audit pass the other five programs had.

## Why now

They shipped to real users on 2026-09-01 and have never had this pass. The
equivalent audit on handstand-walk (2026-08-18) found **six P0s**, including
every user landing on "YOU FINISHED" on day one and Tier B/C/D users silently
receiving Tier A's programming. The three new programs are the same shape
(multi-dimensional, tiered, slot-composed) and have had no equivalent scrutiny.

## What the gate actually is

Per the ladder copy as rewritten 2026-09-01, VERIFIED means: citations
re-audited against current literature in a documented second pass, with
reviewer, date, scope and evidence files recorded in the program JSON. It does
**not** mean an outside clinician (EVID-1) or five field completions (EVID-2) —
both are openly disclosed as unmet by every program.

So the deliverable per program is:
1. `dev/audits/programs/2026-09-02-<slug>-comprehensive.md`
2. P0 fixes shipped
3. Delta audit until clean
4. `status` → `REVIEWED` with `reviewed_by` / `reviewed_at` / `review_evidence` /
   `status_history`
5. Landing `review: "verified"` (a data-integrity test enforces agreement)

## Highest-yield checks, from what the previous audits actually caught

- **Declared-but-dead JSON keys.** handstand's `phase_gates[]` was read by no
  code. Enumerate every key in the program files and grep `src/` for each.
- **`status_note` claims that are false.** handstand's claimed the generator
  remapped phase dates on activation; no such code existed at the time.
- **Contradictory state on one screen.** Three "where am I" summaries rendering
  together (week number vs phase vs graduation).
- **Silent composition failures.** `capability_slot` resolving to zero drills,
  tier logic picking the wrong phase. Partly covered by
  `data-integrity.test.ts` now; the rest needs artifact reading.
- **Clinical/personal copy leaking into a general program.**

## Non-goals

Group C polish. EVID-1 (human specialist). EVID-2 (completion counting).
