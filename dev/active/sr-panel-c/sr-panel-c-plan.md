# SR-panel §C — the three that were never clinical decisions

Founder, 2026-09-05: *"so we have programmes that are not fixed...why dnt we
fix them?"* Fair. §C was filed wholesale as "clinical, NOT actioned" and at
least three of its six entries are not coaching judgements at all.

## Scope

| § C item | Verdict | Here? |
|---|---|---|
| CSM note contradicts items | Engine defect, not a prescription question | **yes** |
| handstand deliberate falls onto "thick yoga mat OK" | Safety requirement — tightening needs less justification than loosening | **yes** |
| rowing day-1 maximal 2K before technique | Ordering, not opinion | **yes** |
| pull-up Tier B 18 eccentric reps | A volume number | no — founder |
| muscle-up false-grip from Tier A "never tried" | A tier gate | no — founder |
| Terminology | Done 2026-09-04 (`e28c5b9`) | done |

The governing principle, same as the `true_non_response` call: **weakening a
claim or tightening a safety requirement needs no clinical credential;
strengthening a claim or loosening a gate does.**

## 1. CSM — the engine ignores the programme

Verified, and bigger than the panel said. An earlier claim of mine that CSM
"renders six sets" was WRONG — its phases are not in `MAIN_PHASE_IDS`, so it
never reaches the 5/3/1 path. What actually happens:

`suggestForExercise` falls through to the autoregulate-from-last-set branch,
written for hip rehab. So:

- front squat **5×5 @65%** renders **3 sets** (`exercises.json` default)
- block pull **5×3 @78%** renders 5 sets of **5 reps**
- every weight is autoregulated and capped at **"80% TM (reintro)"** —
  rehab-reintroduction logic and copy in a strength-MAINTENANCE programme
- the block note promises "top set + FSL 5×5 @ 65%", a 5/3/1 session that
  does not exist in the items

`VOLUME_BLOCKS` / `VARIANT_BLOCKS` (`suggest.ts:109`) hold only
`anterior-hip-rebuild` block ids. The `straight_sets` fix from 2026-09-03 was
applied to one programme and not its sibling. Scanned all nine: **CSM alone**,
3 items, 2 blocks.

**Fix: declarative, not another hardcoded set.** A block item may author
`prescription: { sets, reps, pct_tm }`; `suggestForExercise` honours it and
returns `straight_sets`. Any future programme gets it without a code change —
the alternative is a third hardcoded id list, which is how this happened.

Risk: Zod strips unknown keys. The field must be in the schema, read by the
engine, and covered by a test that fails if any link breaks.

## 2. handstand-walk — deliberate falls

Prescribed onto "thick yoga mat OK". Tighten the surface requirement. Not a
programming change: the drill stays, its stated minimum equipment does not.

## 3. rowing-2k — day-1 maximal 2K

A self-declared novice can be given a maximal 2K on day 1 with technique
taught afterwards. Reorder so technique precedes the maximal effort.

## Out of scope

Whether CSM's NOTE or its ITEMS is the authoritative prescription. They
disagree; the engine currently honours neither. This makes the engine honour
the ITEMS, because they are the machine-readable half — and flags the note
for the founder rather than rewriting a prescription.
