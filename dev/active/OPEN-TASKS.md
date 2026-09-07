# Open tasks — as of 2026-09-07 (afternoon)

Live register. Supersedes the task lists inside the handovers, which are
snapshots. 33 commits on 2026-09-05/06; tests 674 -> 798.

## Mine

| P | Task | Est | Status |
|---|---|---|---|
| P1 | Persona sweep #6 | 31 min | **done** 2026-09-06 — 23 passed, 0 failures, 28.2 min. Controls 95.5% → 96.2%. Behavioural checks 269 → 263 (predicted ≥269; unexplained, see below). Never-driven still exactly `NoteSheet — Not now` |
| P1 | Intake-deferral coverage was a coin flip | 45 min | **done** 2026-09-06 — `persona-pullup-elbow` was the fleet's ONLY persona with intake answers and landed on a rest day for two sweeps running, so the deferral fix stayed unverified end-to-end while the report read green. Added `persona-muscleup-elbow` (different programme, different day count), made the rest-day skip record `deferralCheck` + warn instead of passing silently, and the fleet summary now prints "N/M verified end-to-end" |
| P2 | Explain the 6-check drop in sweep #6 | 30 min | **done** 2026-09-06 — not a regression. Sweep #5 had one FAILED persona, which aborts before writing coverage, and the fleet summary read its previous sweep's file off disk. 269 counted 21 personas that ran plus one that did not. Runs now stamp `SWEEP_ID`; stale reports are dropped and named, and the summary says "N of M defined" |
| P2 | Label the 5 remaining phantom citations | 45 min | **done** 2026-09-06 — three labelled `not_found` (kim_2013, kilding_2012, ferrari_2021), two `record_verified_claim_unverified` (robertson_2004, salmoni — real papers, content unretrievable) with their DOIs/PMIDs added. Guard test pins all five. NOT a withdrawal: the three phantoms still render on /evidence |
| P3 | `sorted[1]` vs `last - first` in `buildMetricCtx` | 20 min | **done** 2026-09-06 — and it had stopped being harmless: compliance forwarding landed the same day, so `under_dosing` can fire and this was its input. Three-plus readings were judged on the first retest forever |
| P3 | `OffPlanSheet` 4/6, `NoteSheet` "Not now" | 30 min | **done and proven in sweep #7** (NoteSheet 6/7, OffPlanSheet 5/6, both fully accounted; 0 never-driven fleet-wide) 2026-09-06 — both were REAL gaps, not measurement faults (the run of five ends). "Not now" is a dismiss nothing had walked; "N drills available" is a real `<Link>` to the drill library nothing had followed. Added `offplan-drill-library` (terminal) and a discard-vs-save assertion on the note sheet |
| P2 | Persona sweep #7 | 31 min | **done** 2026-09-06 — 24 passed, 0 failures, 27.9 min. Checks 263 → **319**, controls 96.2% → **98%**, never-driven **0**. Both new flows ran. Predicted ≥300 / 0 never-driven / ≥1 deferral verified: two hit, one **missed** |
| P1 | Deferral check was date-fragile for three sweeps | 45 min | **done** 2026-09-06 — 0/2 verified in #7. Adding a second persona did NOT decorrelate: pull-up and muscle-up both rest on Sunday. Now asserts against the first non-rest capture of today/past/future; dry-run green on both personas. Found two more defects doing it — see below |
| P1 | "Adjusted for you" claimed adjustments that never happened | 30 min | **done** 2026-09-06 — the notice rendered off `activeExclusions` (a property of the USER, true every day), so a muscle-up user saw "ring dip work is band-assisted only" above a session with no dip work at all. The original defect reversed. `exclusionsAffectingDay` scopes it to the day; undecidable cases keep the notice |
| P2 | Persona sweep #8 — prove the deferral check finally runs | 31 min | **open** — the fix is dry-run green against sweep #7's artifacts, which is not the same as having run. Three sweeps in a row reported this path verified-by-nothing; the first sweep that prints "2/2 verified" is the first evidence it works |
| P4 | Traffic: content, structured data, Search Console | days | **open, and blocked on the evidence page settling** — see `dev/active/traffic/` |

## Yours

| P | Task | Est | Status |
|---|---|---|---|
| P1 | **Background the app mid-set on Android** | 2 min | **open** — still the only real-device proof for four eviction fixes |
| P1 | `ring_dip_count`: `warn` or `block`? | 10 min | **open, and now the ONLY question left in it** — the "Tier A unreachable" half was FALSE and is struck. The gate reads `ring_dip_count` (a select); the tiers read `ring_dip_max_reps` (a test). Nothing joins them |
| P2 | Build `SELF_REPORT_TO_TEST_VAR` for muscle-up + overhead-mobility | 30 min | **open** — without it, a skipper's test vars are 0, `tier_b_transition` is unreachable, and everyone lands in the lowest tier. Needs your judgement on what "3-5 ring dips" maps to. Intake copy no longer promises a proxy in the meantime (done) |
| P1 | Escalation rules: enforce or leave as guidance? | 30 min | **open** — six programmes declare "three red days -> take a week off and consult a clinician". Now displayed, not enforced. The engine has a mechanism for optimism (green streak -> add load) and none for caution |
| P2 | Capability slots that yield nothing | 1 h | **open, and the reported symptom was the wrong one** — foundation never gets an empty block because `reference_week_foundation` never schedules loaded work AT ALL (phases 2 and 3 are named for it). The block that DOES ship empty is `block_thoracic_prep` for **push** users, 4 days/week, all 3 phases — both drills are level 1, push reads level 3. Three gaps pinned by a guard test |
| P1 | VERIFIED badge | 30 min | **open, and it is a live public overclaim** — all 8 public programmes carry `status: "REVIEWED"` → green VERIFIED on the app catalog AND `review: "verified"` hardcoded on the landing, while every one of the 124 citations renders CITED (none carries a `status`). 45% verified clean. The app already contradicts itself |
| P2 | Pull-up Tier B eccentric volume | 20 min | **narrowed** — the evidence question is settled (Spudic & Nosaka 2025: no advantage for a concentric goal) and the citation corrected. What remains is the entry-intensity ramp, which no study specifies |
| P2 | Muscle-up false-grip from Tier A | 20 min | **narrowed** — needs a coach, not a clinician. Walker 2023 suggests bar-before-rings |
| P3 | Log Friday's two activities | 3 min | **open — checked, not stale.** Your 2026-09-04 has the hip drills (dead bug 3×6, 90/90 hip switch 3×12) and no `runs[]`. You logged a hyrox on Sep 6, so the mechanism works; Friday was never backfilled |
| P3 | `starting_values_kg`: wire up or delete? | 20 min | **open** — pinned by a test. Deleting silently kills TM bumps |
| P3 | Resend key — is a second one live? | 2 min | **still unchecked** — I tried the Resend connector and the permission classifier blocked the key listing. Needs you, or a permission grant |
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
