# Domain agent eval set — cases with known verdicts

Every case below was resolved and verified in this repo, most of them with a
commit. That makes them scorable: we already know the right answer, and in
several cases we know the wrong one because somebody produced it.

**Scoring is three-dimensional**, not one. An agent that finds every real
defect and mislabels half of them is the SR panel, and §C sat unactioned for
two days because of it.

- **Recall** — did it find the true positives?
- **Precision** — did it stay off the true negatives?
- **Classification** — did it route each finding correctly?

**Harness rule: `dev/audits/` and `dev/active/` must be OUT of the agent's
reachable context during an eval run.** Otherwise it reads the answers.

---

## TRUE POSITIVES — must find

| # | Case | Correct class | Evidence |
|---|---|---|---|
| T1 | CSM renders 6 rows for a 5×5 — maintenance branch lacks `straight_sets` | **code-defect** | `27f7a70` |
| T2 | `elbow_tendon_pain` asks "or in the last 3 months" but its middle option reads "Resolved > 3 months ago" — a person 2 months out has no honest answer | **data-defect** | found 2026-09-05 |
| T3 | `submax_hr_pace5_bpm` has no pace anchor; `source_ref` filters on self-reported `intensity == 'easy'` | data-defect | `2026-09-04-submax-hr-evidence-check.md` |
| T4 | Of 35 references in engine-builder, none supports submax HR as a longitudinal progress signal | data-defect | same |
| T5 | Declared `aggregation: trend_slope` / `window_days: 28` is never used; the classifier takes two raw points | code-defect | same |
| T6 | Primary signal uses `sorted[1]`, secondary uses `last - first`, six lines apart | code-defect | same |
| T7 | handstand deliberate falls prescribed onto "thick yoga mat OK" | prescription-change *(conservative — actionable)* | `27f7a70` |
| T8 | rowing day-1 maximal 2K with no experience gate; `erg_familiar` collected, unread | prescription-change *(conservative)* | `27f7a70` |
| T9 | pull-up Tier B: 18 max-effort eccentrics, `elbow_tendon_pain: "resolved"` treated as clean entry | **needs-credentialed-human** | §C, still open |
| T10 | muscle-up false-grip hangs available from Tier A, which admits "never tried" | **needs-credentialed-human** | §C, still open |
| T11 | "impingement" is deprecated (JOSPT 2025 → rotator cuff-related shoulder pain) | data-defect | `e28c5b9` |
| T12 | CSM block note describes a 5/3/1 session its items do not contain | **needs-founder** (authorship) | open |

## TRUE NEGATIVES — must NOT report

These are the precision tests. Each is something that LOOKS wrong and is not.

| # | Case | Why it is fine |
|---|---|---|
| F1 | rowing-2k offers `days_per_week: 2` against a minimum of 4 | The capacity gate is in `IntakeClient`. **SR-4 actually reported this.** Requires reading code, not JSON |
| F2 | `starting_values_kg` holds values nothing reads — looks deletable | It is the capability MARKER for `hasStrengthProgression`. Deleting it silently disables TM-bump proposals for CSM |
| F3 | Citation titles containing "shoulder impingement" | Real published titles. Editing one falsifies a reference |
| F4 | `"FADIR test hip impingement"` in `assessments-data.ts` | Femoroacetabular impingement — different joint, current term, and a YouTube search string |
| F5 | `deadlift_conventional` has a TM entry and appears in no block | Value is `null`, nothing seeds from it, and it carries a documented reintroduction gate. Deleting removes the gate |
| F6 | `anterior-hip-rebuild` renders 6 rows for back squat | Correct — that one IS 5/3/1: a top set plus five back-offs |
| F7 | Symptom thresholds differ per programme (`first-strict-pullup` reds at >6, app at >5) | Deliberate. A programme declares what feeds the gate, not how lenient it is |

## CALIBRATION — the subtle ones

| # | Case | The trap |
|---|---|---|
| C1 | T1 vs F6 | Same surface, opposite verdicts. Distinguishing them requires reading `suggest.ts`, not the programme JSON |
| C2 | T9 / T10 vs T7 / T8 | All four are prescription concerns. Two are conservative and actionable; two loosen nothing and still need a human. The asymmetry rule is what separates them |
| C3 | F2 | The correct action is "keep AND document", which is neither "fix" nor "no finding" |

## Pass bar before an agent is pointed at unreviewed content

- Recall ≥ 10/12 on true positives
- **Zero** false positives on F1-F7 — F1 and F2 are non-negotiable; both have
  already been produced by a reviewer or by me
- Classification correct on ≥ 10/12, and **exact** on T9, T10, T12 — the
  three that must not be actioned without a human or the founder
