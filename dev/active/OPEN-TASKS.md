# Open tasks — as of 2026-09-07

Live register. Supersedes the task lists inside the handovers, which are
snapshots. 39 commits on 2026-09-05/07; tests 674 -> 805.

## Mine

| P | Task | Est | Status |
|---|---|---|---|
| P2 | Persona sweep #8 — prove the deferral check finally runs | 31 min | **open** — the fix is dry-run green against sweep #7's artifacts, which is not the same as having run. Three sweeps in a row reported this path verified-by-nothing; the first sweep printing "2/2 verified" is the first evidence it works |
| P4 | Traffic: content, structured data, Search Console | days | **open, blocked** on the VERIFIED badge and the evidence page settling — see `dev/active/traffic/` |

## Yours — decisions only I cannot make

| P | Task | Est | Status |
|---|---|---|---|
| P1 | **VERIFIED badge is a live public overclaim** | 30 min | **open** — all 8 public programmes carry `status: "REVIEWED"` → green VERIFIED on the app catalog and `review: "verified"` hardcoded on the landing, while all 124 citations render CITED (none carries a `status`). 45% verified clean. The app already contradicts itself. Blocks my traffic work |
| P1 | **Overhead-mobility retest targets are inside measurement noise** | 1 h | **open, new 2026-09-07** — best-case supine goniometry MDC is 7–11° (Muir 2010, PMID 21589666). Push target is `+5-10`, Progression `+5-15`. The Push tier cannot detect its own success. Absolute targets 185/190° also exceed the measured healthy supine mean (177°, SD 6) |
| P1 | Escalation rules: enforce or leave as guidance? | 30 min | **open** — six programmes declare "three red days → take a week off and consult a clinician". Read by one line, rendered in a default-collapsed accordion on `/plan` only. Nothing counts reds. Three *greens* is a counted trigger that adds load, and `select.ts:513` drops the caution proposal in favour of it. Delivery could reuse the proposal pipeline; the trigger needs new code and the six rules are prose |
| P1 | **Background the app mid-set on Android** | 2 min | **open** — still the only real-device proof for four eviction fixes |
| P1 | `ring_dip_count`: `warn` or `block`? | 10 min | **open, and now the only question left in it** — the "Tier A unreachable" half was FALSE and is struck |
| P2 | Withdraw `kilding_2012` and its claim — do not re-source | 20 min | **open, new 2026-09-07** — the rowing literature argues against it. Possamai 2022: critical power 37% above MLSS in rowing, "much larger than in running and cycling"; Beneke 1995: 4 mmol and IAT "do not represent MLSS workload". The programme never measures lactate — it prescribes a 2K-pace offset. `kilbey_2025` (PMID 40019691) is the honest replacement for a *differently worded* claim |
| P2 | `kim_2013` → adopt `muir_2010`? | 20 min | **open, new 2026-09-07** — adding a citation adds a claim, so it is yours. Muir supports the reliability half and supplies the MDC that undermines the targets above |
| P2 | Build `SELF_REPORT_TO_TEST_VAR` for muscle-up + overhead-mobility | 30 min | **open** — without it a skipper's test vars are 0, `tier_b_transition` is unreachable, and everyone lands in the lowest tier. Needs your call on what "3-5 ring dips" maps to. Intake copy no longer promises a proxy in the meantime |
| P2 | Capability slots that yield nothing | 1 h | **open, and the reported symptom was the wrong one** — foundation never gets an empty block because `reference_week_foundation` never schedules loaded work at all (phases 2 and 3 are named for it). The block that DOES ship empty is `block_thoracic_prep` for **push** users, 4 days/week, all 3 phases. Three gaps pinned by a guard test |
| P2 | Pull-up Tier B eccentric volume | 20 min | **narrowed** — evidence settled (Spudic & Nosaka 2025: no advantage for a concentric goal), citation corrected. What remains is the entry-intensity ramp, which no study specifies |
| P2 | Muscle-up false-grip from Tier A | 20 min | **narrowed** — needs a coach, not a clinician. Walker 2023 suggests bar-before-rings |
| P3 | Log Friday's two activities | 3 min | **open — checked, not stale** — 2026-09-04 has the hip drills (dead bug 3×6, 90/90 hip switch 3×12) and no `runs[]`. You logged a hyrox on Sep 6, so the mechanism works; Friday was never backfilled |
| P3 | `starting_values_kg`: wire up or delete? | 20 min | **open** — pinned by a test. `Boolean(tms.starting_values_kg)` gates the whole TM-bump engine while none of its values are read; deleting it silently kills progression |
| P3 | Resend key — is a second one live? | 2 min | **still unchecked** — the permission classifier blocked the connector's key listing. Needs you, or a permission grant |
| P4 | SR-panel §C remainder, EVID-1, QA-1, S4, S3 billing | — | **open** — admin and prescription decisions |

## Found but not yet triaged (from the 2026-09-07 integrity audit)

| Item | Where | Class |
|---|---|---|
| muscle-up tier `starting_capability_levels`: 4 of 5 keys match no domain | `muscle-up.json` ↔ `plan-generator.ts:555` | DEAD — the 2026-09-06 rename moved block slots and not tier keys |
| CSM amber rule enforced in code by hardcoded slug, and its data key is dead | `plan-generator.ts:83-102`, `CSM.json:502` | LIVE(code)/DEAD(data); the "resume at 3×4" half is unimplemented, and it may not fire on the production read path at all |
| `shoulder_pain_stop_rule` consent recorded, never enforced or resurfaced | `muscle-up.json:382` | Same family as `shoulder_pain_stops_session` |
| `authoring_note` is stripped by Zod | `schemas.ts:508-531` | DEAD — author-facing only, invisible to tooling |

## Blocked on data or infrastructure

| Task | Blocker |
|---|---|
| F2 Phase B | needs 30 days of data |
| F4 | EU object storage |
| FLAG-5 | analytics decision |

## Closed 2026-09-05/07

**Sweeps and harness:** sweep #6 · sweep #7 (24 passed, checks 263→319, controls
98%, 0 never-driven) · the 6-check drop explained (stale reports, not a
regression) · `SWEEP_ID` stamping · `OffPlanSheet` + `NoteSheet` coverage ·
`offplan-drill-library` flow · flow→surface map completed and guarded ·
deferral check date fragility.

**Engine:** failed-attempt logging · wall-clock timers ×3 · session cursor ·
rest restore · Android `resume` listener · `true_non_response` suppressed ·
intake deferrals reaching production · "Adjusted for you" scoped to the day ·
`buildMetricCtx` delta · tier base level · taper phase schema · negative
numbers in tier conditions · per-capability independence · starting phase ·
HERITAGE compliance forwarding · 50 invisible rules.

**Evidence:** 44 overstatements · 7 wrong-paper URLs · 3 contradicting
citations · duplicate ids merged · 5 phantoms labelled · `ferrari_2021`
withdrawn · `billat_2001` corrected (2001→2003, PMID 12744715) · 6 programme
references that linked to search boxes · self-report proxy promise made honest.

**Infra:** sitemap + robots · 14 agent definitions tracked.
