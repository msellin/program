# Open tasks — as of 2026-09-06

Live register. Supersedes the task lists inside the handovers, which are
snapshots. 25 commits on 2026-09-05/06; tests 674 -> 772.

## Mine

| P | Task | Est | Status |
|---|---|---|---|
| P1 | Persona sweep #6 | 31 min | **done** 2026-09-06 — 23 passed, 0 failures, 28.2 min. Controls 95.5% → 96.2%. Behavioural checks 269 → 263 (predicted ≥269; unexplained, see below). Never-driven still exactly `NoteSheet — Not now` |
| P1 | Intake-deferral coverage was a coin flip | 45 min | **done** 2026-09-06 — `persona-pullup-elbow` was the fleet's ONLY persona with intake answers and landed on a rest day for two sweeps running, so the deferral fix stayed unverified end-to-end while the report read green. Added `persona-muscleup-elbow` (different programme, different day count), made the rest-day skip record `deferralCheck` + warn instead of passing silently, and the fleet summary now prints "N/M verified end-to-end" |
| P2 | Explain the 6-check drop in sweep #6 | 30 min | **open** — skip analysis showed no new skip reasons (`retest-logging` 20, `session-hold` 17, `session-log-set` 10, all pre-existing). Per-flow totals sum to 263. Not yet accounted for; do not assume benign |
| P2 | Label the 5 remaining phantom citations | 45 min | **open** — kim_2013, kilding_2012, ferrari_2021, robertson_2004, salmoni_schmidt_walter_1984. Sourcing agents already produced verdicts and replacements; the records are not yet annotated |
| P3 | `sorted[1]` vs `last - first` in `buildMetricCtx` | 20 min | **open** — primary and secondary signals disagree six lines apart. Harmless while nothing user-facing reads it |
| P3 | `OffPlanSheet` 4/6, `NoteSheet` "Not now" | 30 min | **open** — last coverage questions. Five of five previous "gaps" were measurement faults, so expect the same |
| P4 | Traffic: content, structured data, Search Console | days | **open, and blocked on the evidence page settling** — see `dev/active/traffic/` |

## Yours

| P | Task | Est | Status |
|---|---|---|---|
| P1 | **Background the app mid-set on Android** | 2 min | **open** — still the only real-device proof for four eviction fixes |
| P1 | `ring_dip_count`: `warn` or `block`? | 10 min | **open** — recorded in the gate's `authoring_note`. Either way, `tier_a_prep` is currently unreachable: its condition is exactly the population the gate refuses |
| P1 | Escalation rules: enforce or leave as guidance? | 30 min | **open** — six programmes declare "three red days -> take a week off and consult a clinician". Now displayed, not enforced. The engine has a mechanism for optimism (green streak -> add load) and none for caution |
| P2 | Foundation-tier loaded overhead | 1 h | **open** — every drill in that slot is level 3-4, so foundation users get an empty block. Author entry drills, or gate the block by tier |
| P2 | VERIFIED badge | 30 min | **open, now with a number under it** — 45% of 126 citations verified clean. See `2026-09-05-citation-sweep-SUMMARY.md` |
| P2 | Pull-up Tier B eccentric volume | 20 min | **narrowed** — the evidence question is settled (Spudic & Nosaka 2025: no advantage for a concentric goal) and the citation corrected. What remains is the entry-intensity ramp, which no study specifies |
| P2 | Muscle-up false-grip from Tier A | 20 min | **narrowed** — needs a coach, not a clinician. Walker 2023 suggests bar-before-rings |
| P3 | Log Friday's two activities | 3 min | **open** — `crossfit_class` x2, Sep 4 |
| P3 | `starting_values_kg`: wire up or delete? | 20 min | **open** — pinned by a test. Deleting silently kills TM bumps |
| P3 | Resend key — is a second one live? | 2 min | **unsourced** — carried in two handovers with no backing anywhere in the repo. P0 if a broad-scoped key exists |
| P4 | SR-panel §C remainder, EVID-1, QA-1, S4, S3 billing | — | **open** — admin and prescription decisions |

## Blocked on data or infrastructure

| Task | Blocker |
|---|---|
| F2 Phase B | needs 30 days of data |
| F4 | EU object storage |
| FLAG-5 | analytics decision |

## Closed 2026-09-05/06

Failed-attempt logging · wall-clock timers x3 · session cursor · rest restore
· Android `resume` listener · `true_non_response` suppressed · 44 citation
overstatements · 7 wrong-paper URLs · 3 contradicting citations · duplicate
ids merged · intake deferrals reaching production · 50 invisible rules · tier
base level · taper phase schema · negative numbers in tier conditions ·
per-capability independence · starting phase · HERITAGE compliance
forwarding · sitemap + robots · 14 agent definitions now tracked
