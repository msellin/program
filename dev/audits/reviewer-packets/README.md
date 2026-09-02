# Specialist review — how to run it (EVID-1)

Every program's `reviewed_by` reads "Terav specialist audit agent". The app says
so plainly on `/programs`: no physiotherapist, coach or sport scientist has
independently signed off anything in the catalog. This is the apparatus for
changing that.

## The packets

Generated from the shipping data — regenerate before sending, never edit by hand:

```bash
python3 dev/scripts/build-reviewer-packet.py
```

| Packet | Programs | Unique papers | Ask |
|---|---|---|---|
| `gymnastics-skill.md` | first-strict-pullup, muscle-up, handstand-walk | 41 | ~90 min |
| `endurance-engine.md` | engine-builder, engine-builder-block-2 | 43 | ~90 min |
| `endurance-race-concurrent.md` | rowing-2k-test-prep, concurrent-strength-maintenance | 51 | ~60 min |
| `mobility.md` | overhead-mobility | 19 | ~40 min |

Citations are deduplicated per domain: a reviewer meets Wulf 1998 once, not
three times, with every claim any program hangs on it listed underneath. That
grouping is also the cheapest way to spot a paper stretched across two claims —
which is exactly how `beattie_2014` came to back a grip-dose claim it says
nothing about.

## Who to approach

- **Gymnastics/skill** — a gymnastics or calisthenics coach, or a physio who
  works with overhead athletes. The hardest gap: nobody in the founder's current
  clinical circle covers this.
- **Endurance** — an exercise physiologist or endurance coach. Threshold and
  VO2max programming, plus the concurrent-interference literature.
- **Mobility** — a physiotherapist in shoulder rehab. **Closest to hand:** the
  founder's existing physiatrist plausibly covers this and hip.

The hip program is `personal: true` and sits outside the catalog ladder. It does
not need this, and the founder's orthopaedist and physiatrist already see it.

## What we ask for, and what we must not

Three closed questions: does each paper support the claim attached to it, is
anything prescribed here you would not prescribe, and is anything missing from
the screening.

**Not endorsement.** The packet says so, and the recorded result must too. The
distinction is the product's whole position — "audited, not endorsed. They flag
anything they'd change."

## Recording the result

Into the program file as `specialist_review` (schema in `lib/schemas.ts`):

```json
"specialist_review": {
  "name": "…", "credential": "…", "date": "2026-09-…",
  "scope": "what they actually checked",
  "not_reviewed": "what they explicitly did not",
  "verdict": "ships_as_is | ships_with_changes | do_not_ship",
  "changes": [
    { "finding": "…", "our_response": "…", "applied": true }
  ]
}
```

`changes[]` records what we did about each finding **including where we
declined**. A review that publishes only the findings we agreed with is
marketing. `data-integrity.test.ts` fails on an anonymous sign-off, and on a
"ships with changes" verdict that lists none.

## The thing that must not be forgotten

The ladder copy currently states no outside specialist has reviewed anything.
**The moment one has, that sentence is false.** A test pins them together: if any
program carries a `specialist_review`, the suite fails until the disclosure is
updated. That is deliberate — copy which was true when written and never
re-checked is this project's most reliable defect, and this one would drift in
the flattering direction.
