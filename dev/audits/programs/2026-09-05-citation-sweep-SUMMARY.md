# Citation sweep — all 126 records

Run 2026-09-05 by seven parallel `evidence-verifier` agents. Per-batch detail
in `2026-09-05-citation-verification.md` and
`2026-09-05-citation-sweep-batch{1..7}.md`.

**This is the number the VERIFIED badge decision needs.** Not "we found
problems" — what fraction of the evidence layer is sound.

## Result

| Verdict | ~count | Meaning |
|---|---|---|
| SUPPORTS | ~56 | The paper says what it is cited for |
| OVERSTATED | ~25 | Related, but the claim is stronger than the finding |
| MISATTRIBUTED | ~23 | Real paper, wrong claim — or the identifier points elsewhere |
| NOT_FOUND | ~13 | Could not be retrieved after documented searches |
| CONTRADICTS | 3 | The paper argues AGAINST the claim |

**Roughly 45% verifies clean.** Neither "it's fine" nor "it's all broken".

Every verdict rests on retrieved and quoted text. Where a paper could not be
reached (paywalled, no OA mirror), the agents returned NOT_FOUND rather than
asserting contents — which is the behaviour the role was written for.

## Three citations argue against their own claim

- **`butcher_2015`** — concludes CrossFit benchmark performance *"cannot be
  predicted by VO2max"*. Cited in engine-builder for "VO2max still
  contributes".
- **`hardy_1996_catastrophe`** — a null result (*"the results do not offer
  any clear evidence for the superiority of either… model"*, eight golfers
  putting). Cited for "anxiety above threshold causes performance collapse".
- **`ronnestad_hansen_2020`** — engine-builder says short intervals were
  superior for VO2max; the paper says *"there was no group difference in
  change of V̇O2max."*

## Seven links on /evidence open the wrong paper

`src/app/evidence/page.tsx:101-105` renders `url` as a live anchor. Four
independently re-verified by me via Europe PMC, marked ✓.

| id | opens |
|---|---|
| `mujika_padilla_2000` ✓ | Genetic and epigenetic interactions in allopolyploid **plants** |
| `docherty_sporer_2000` ✓ | The role of **hyperbaric oxygen therapy** in sports medicine |
| `ross_2015` ✓ | Resequencing of the common **marmoset genome** |
| `vigouroux_2007` | **Pesticide residues** (per batch 7) |
| `steinacker_1998` | PMID off by one |
| `perry_2010` | A different study by an overlapping group |
| `bishop_2019` | A different Bishop paper, whose abstract says *"a consensus has not been reached"* |

## Claims that reach the user and are not supported

1. **`SignalsStrip.tsx:388`** — at the moment the 4×4 is pulled from the
   week: *"Bouchard 1999 HERITAGE variance says a hard aerobic stimulus on
   top of amber symptoms doesn't pay back."* HERITAGE is a heritability study
   in 481 sedentary adults. No symptom finding, no session-withholding
   finding. The swap is real; the reason given is invented.
2. **`handstand-walk` age band 46-60** — *"Barlow 2020: wrist WB tolerance
   drops from age 45 — extra ramp built in."* `age_band` appears **zero
   times** in `src/`. The protection does not exist.
3. **`engine-builder-block-2:1178, :1195`** — "+2-5% over 8-12 weeks",
   "+3-6% (Push)" threshold-magnitude, attributed to Joyner & Coyle, who
   publish no magnitude at all. Same defect as rowing-2k's, fixed there this
   afternoon and missed here.
4. **`overhead-mobility:889`** — *"scap upward-rotation timing is the
   dominant driver of subacromial space"*, a causal-magnitude claim in
   neither Ludewig abstract, contradicting the association framing 400 lines
   above it in the same file.
5. **`ExerciseDetailsSheet`** renders Bandura as the rationale for
   `deliberate_mat_falls`. The mechanism IS Bandura's; the *transfer* step
   the programme asserts — efficacy from mat falls carrying to the walk — is
   evidenced by nothing retrieved.

## Two safety rules that are neither enforced nor displayed

`plan/page.tsx:708` renders `weekly_template.principles`. handstand-walk's is
**null** — its rules live under a top-level `principles` key that nothing
reads. So `shoulder_pain_stops_session` and `wrist_volume_capped` exist only
as data. Same dead-key family as `daily_log_schema`.

## Duplicate ids inflate the study count

`butcher_2015`/`butcher_2015_crossfit`, `fyfe_2014`/`fyfe_bishop_stepto_2014`,
`wilson_2012`/`wilson_loenneke_2012` are three papers entered six times.
`/evidence`'s count is asserted against the landing at
`data-integrity.test.ts:435`, so the landing overstates too.

## What the schema tests can and cannot see

Fixed today: the title-overlap threshold (a real collision passed by one
word), one shared `isConflict` instead of two copies, a full-byline check.

**Structurally out of reach of any repo-vs-repo test:**
- `pilegaard_2000`, `rohleder_vogt_2018`, `sadowski_2021`, `youdas_2010`,
  `fyfe_2016` — the programme and citations.json **agree with each other and
  are both wrong**. Consistency is not correctness.
- Prose citation. `adkin`, `carpenter`, `hardy`, `bandura`, "Coyle 1984",
  "Brooks & Mercier 1994" are invoked by surname inside rationale strings,
  never by id. That is the route a CONTRADICTS-grade citation took into a
  shipped programme.
- No test dereferences a `url`, which is why seven point at other papers.

These need the verifier on a cadence, not a schema rule.

## Corrections the agents got wrong

- Batch 1 (first run) reported `kim_2013` "carries `verification_status:
  verified`". The field is absent. One fabricated detail in eight, caught by
  grep — the reason every consequential claim here was re-checked before
  being written down.

## Recommended order

1. The seven wrong URLs — mechanical, and they are live.
2. The three CONTRADICTS — a citation arguing the opposite is worse than none.
3. The five user-facing unsupported claims above.
4. Deduplicate the six ids, then re-assert the landing's study count.
5. Everything OVERSTATED — reword to what the paper supports.
6. The ~13 NOT_FOUND — decide per case: find, replace, or withdraw the claim.
