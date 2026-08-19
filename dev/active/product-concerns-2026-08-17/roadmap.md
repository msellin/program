# Combined roadmap — F track + remaining P tiers

**Synth date:** 2026-08-17 · **Last audit:** 2026-08-19
**Bottom line up front:** F1 Path 1 and F2 Phase A both shipped. The whole P-tier polish backlog is closed. Beta stack is on Postgres, on `terav.fit`, on 9 programs (up from 5), with an 8-persona harness catching regressions. F4 (wearable ingest) and F5 (trend + correlation) remain the paid-tier keystones on deck; F6 (concurrent tracks) is half-shipped as free multi-track and just needs paid-gating when billing lands.

---

## Recently shipped (since 2026-08-17)

Major items only. Task-level detail lives in `dev/active/*/tasks.md`.

- **F1 Path 1 · Signal-completeness surface** — free-tier "engine reads these" enumeration + notes micro-copy landed (`9b9a15c`, `17b4815`).
- **F2 Phase A · Note-keyword surfacing** — admin-only weekly scan queue shipped (`4bff8cc`).
- **Postgres migration end-to-end** — Phases 2A–2F all landed, KV retired, migrations auto-apply via GH Actions (`8edde7c` → `8c3ffc9`). Storage is Postgres for all users; KV path deleted.
- **Domain migration** — live on `terav.fit` + `app.terav.fit` with Google OAuth on both auth pages (`d2b511d`, `76d6efe`).
- **Catalog 5 → 9 programs** — First Strict Pull-Up, Muscle-Up Acquisition, Engine Builder Block 2 promoted; Overhead Mobility motor-learning wired (`ff2ce64`, `e044463`).
- **Block-object rebuild** — Phases A–F shipped; Week/Today/Heatmap/History/Progress all block-object aware, feature flag default-ON (`1ee18ce` → `03f57a5`).
- **HERITAGE non-responder gate** — schema + classifier + proposal wiring + retest scheduler + idempotent retest logging (`274cf76` → `ba1a00f`).
- **Multi-track / concurrent programs (free-tier)** — Profile multi-track, Week dot-per-program, Report/Progress/Extras extras-strip, Delta-3 graduation, repeat-arc option (Batches 9–15).
- **Batch 12 · Graduation + repeat-arc** — end-of-arc feedback capture + one-tap re-enrol (`99e6cb8`).
- **Batch 15 · Week compact-by-default** — collapse-per-day rows + Profile sign-out at bottom (`210c373`).
- **Batch 16 · GOWOD-scale visual system** — oversized H1s, identity chip on Profile, generous card padding across all primary routes (`fa348d0`).
- **Intake wizard rebuild** — declarative program-agnostic intake, quiet-form pattern, physical-test split, wizard a11y, rehydration (`cefeabe` → `4714707`, plus batches).
- **Beta ops** — Delete-account cascade + Sentry User Feedback widget; GDPR-hardened legal pages (`553f254`, `5d2b8e4`).
- **Persona harness scaled to 8 personas** — multi-track + graduation + concurrent + 4 archetype variants; catalog-coverage assertion (`8047cf5`, `5e91397`, `12727f6`).
- **Auditor infrastructure** — canonical competitor peer set (`competitor-refs.md`) + GOWOD steal-vs-leave brief; audit agents now benchmark against a stable peer list.

---

## F track (research-validated, ranked)

### F1 · Signal-completeness surface

**Status: Path 1 SHIPPED 2026-08-18.** Free-tier enumeration live on Progress with per-signal upgrade paths. Path 2 (named tiers) still deferred behind F4 evidence.

### F4 · Wearable ingest (Garmin FIT + Whoop HRV + Oura HR/sleep)

**Status: OPEN — the paid-tier keystone.** FIT spec at `dev/active/saas-launch/future-features.md`. Object storage EU region still the blocker for real ingest. Feeds F1 Path 1's "connect wearable" upgrade path.

Estimated: **~3-4 weeks solo**.

### F5 · Multi-year trend + symptom-load correlation view

**Status: OPEN — paid-tier pillar 2.** Blocked on 90+ days of real log data from beta users. Correlation math + chart component still ~1-2 weeks when data volume warrants.

### F2 · Self-learning-notes

**Status: Phase A SHIPPED. Phase B/C/D open.**
- Phase A · admin queue landed 2026-08-18. Founder reviews surfaced keywords weekly.
- Phase B · correlation lift on existing keywords, founder-approves rule weight — ~1-2d when Phase A has 30+ days of data.
- Phase C · per-user vocabulary calibration (paid) — ~1 week, ships after B.
- Phase D · reshaped per D-brief — becomes founder-side batch LLM review, NOT a user-facing LLM in prod. Cross-user path deferred until N > 1000 weekly note-writers.

### F6 · Concurrent tracks

**Status: FREE-TIER SHIPPED; paid gate pending.** Multi-track Profile/Week/Report/Progress/Extras landed across Batches 10–14. The concurrent-tracks Today-view design brief (`dev/design-briefs/2026-08-17-concurrent-tracks-density.md`) is largely implemented. Remaining: paid-gate to "only 1 active program on free tier" when Phase 3 billing ships.

### F3 · Coach chat — included, not the pitch

**Status: DEFERRED, unchanged.** Worker at `worker/src/index.ts` still env-var-gated OFF in prod. Coach route now super-admin-only in the More menu (`9eba1fa`). Turn-on ~1 week when billing hookup is real.

### F-KILL · Video form analysis as paid pillar

**REJECTED, unchanged.** Concern C evidence stands. Ship exercise demo videos free-tier only (see research queue F).

---

## Ranked F-track roadmap

| # | Feature | Free/Paid | Status | Blocked by |
|---|---|---|---|---|
| ~~1~~ | ~~**F1 Path 1** — Signal-completeness surface~~ | Free | **SHIPPED 2026-08-18** | — |
| ~~2~~ | ~~**F2 Phase A** — Note-keyword surfacing~~ | Backend | **SHIPPED 2026-08-18** | — |
| 3 | **F4** — Garmin FIT ingest | **Paid** | Open · 3-4wk | Object storage EU region |
| 4 | **F5** — Trend + correlation view | **Paid** | Open · 1-2wk | 90d log history from real users |
| 5 | **F2 Phase B** — Correlation lift (founder-review) | Backend | Open · 1-2d | Phase A data volume |
| ~~6~~ | ~~**F6** — Concurrent tracks (free)~~ | Free | **SHIPPED as free-tier**; paid gate pending Phase 3 billing | — |
| 7 | **F2 Phase C** — Per-user vocabulary calibration | **Paid** | Open · ~1wk | F2 A+B shipped |
| 8 | **F3** — Coach chat (included, not the pitch) | Free (bundled with paid) | Deferred · ~1wk to productionize | Rate limiting + billing |
| — | ~~Video form analysis as paid pillar~~ | KILLED | — | Concern C evidence |

---

## P-tier polish — CLOSED

All P0/P1/P2/P3/P4/P5/X items from the 2026-08-17 audit backlog shipped between `9135bc5` and Batch 16. What remains is either (a) waiting on billing (paid gates), (b) waiting on real beta signal (F5 correlation), or (c) new items surfaced by post-Batch-16 competitor audits (see next section).

---

## On deck — new items surfaced post-audit

Founder-explicit or competitor-benchmark ideas that arose from Batches 9–16 and the GOWOD brief. Not F-track pillars — polish + UX depth.

- **Extend-by-N-weeks at graduation** — Batch 12 shipped feedback + repeat-arc; extending an existing arc without full re-enrol is the natural next affordance.
- **First-run tutorial overlay on Today** — carried from Phase 4 SaaS-launch tasks; still open, skippable, one-shot.
- **Switch-program warning** — Phase 2 catalog UI gap; multi-program is live, but explicit "switch primary" confirmation is missing.
- **Sort catalog by difficulty / duration** — Phase 2 catalog UI gap; filter shipped, sort didn't.
- **Retest-week UX polish** — HERITAGE Phase 5 shipped scheduler, but the "you're at the end" state + post-retest actions (extend / switch / take break / graduate) still need tightening.
- **Runna-style Week collapse+expand full impl** — Batch 15 shipped collapse-by-default; the expanded state, Move-sheet, and per-row "Open in Today / Move… / Skip" verbs from the GOWOD brief §3 are still open (~6-8h).
- **/account deep-link route for Delete** — Batch 16 removed Delete from the Profile footer's equal-weight row; the interim Danger-zone disclosure works, but the identity-chip-tap destination `/account` is the proper home.
- **CSM amber-week drop-4×4 hook (P1-11)** — engine consumer for a rule already documented in `concurrent-strength-maintenance.json`; ~3-4h engine feature, founder-decision whether to ship for first CSM paid user or defer.
- **Skill/mobility exercise logging in simulator** — blocks adaptation verification for handstand-walk + overhead-mobility retest windows.

---

## Design-system ideas (from competitor benchmarks — IDEAS, not decisions)

Surfaced by the GOWOD visual-system brief and the competitor-refs canonical peer set. **Founder is deliberate about not auto-implementing every audit finding** — these live here until an explicit "yes ship it" call.

- **Runna-style row-expand with in-line Move sheet** — one-line-per-day default, tap to expand, always-explicit Move menu (never swipe-only). Reference: Runna weekly view. Partially begun in Batch 15.
- **Whoop-style single-metric hero cards** — one color = one job, big number + tiny caption. Reference for the upcoming Progress milestone visualization when F5 correlation lands.
- **Pliability-scale identity chip** — Batch 16 shipped GOWOD-scale on Profile; Pliability-scale card discipline (single idea per card, 24-32px internal padding) could extend to Progress and History.
- **Hevy set-log + rest-timer patterns** — reference for any future strength-log input surface (currently non-blocking, we're not a logging-first app).
- **GMB tier-progression visual metaphor** — reference for Handstand Walk and Muscle-Up skill programs when tier-progression gets its own screen.
- **Deliberately rejected (kept as reminders):** photography anywhere, blue CTA, persistent premium/upsell bar, session-type carousel on Today, streak/challenge counters.

---

## Research queue (agent-dispatchable, not on the F track)

Unchanged from the 2026-08-17 synth. Still queued, still not built.

- **E · Diagnostic intake — bilateral self-report battery** (GoWOD-shaped, zero-AI). Deliverable at `dev/audits/product-concerns/E-diagnostic-intake-battery.md`. Do NOT build without the brief; scope creep risk is high.
- **F · Video demo library** (free tier). Hosting/delivery/WCAG trade-offs. Deliverable at `dev/audits/product-concerns/F-video-demo-library.md`.
- **G · Founder personal video-vision experiment.** ~30 min sanity-check with Gemini/Claude on a training clip. Confirms or reinforces Concern C's kill. Deliverable at `dev/active/product-concerns-2026-08-17/G-video-vision-experiment.md`.
- **Wearable ingest deep-dive** — competitive analysis before F4 starts. Spec at `dev/active/saas-launch/future-features.md`.
- **Community / social layer** — validated NEGATIVE by Concern C, documented explicitly for future "why not."

---

## Auth polish

- **Resend confirmation email** — shipped 2026-08-17 (`20e04ef`).
- **Google sign-in** — shipped 2026-08-18 (`76d6efe`).
- **Apple sign-in** — deferred until Google demand signal is real.

---

## What NOT to do (rejected explicitly)

- ~~Sharpness A/B/C/D letter grades~~ — Concern A
- ~~Video form analysis as paid pillar~~ — Concern C
- ~~Re-paywalling any currently-free feature~~ — Strava/Whoop churn warning
- ~~Marketing coach chat as a paid pillar~~ — dilutes "engine-not-content" positioning
- ~~Cross-user note aggregation at beta scale~~ — Concern D; deferred until N > 1000
- ~~Streak/challenge counters (StreakChip)~~ — removed 2026-08-17 (`B1` in post-audit-p0s/tasks.md)

---

## Immediate next action

**F4 (wearable ingest) OR the on-deck polish set.** F4 is the paid-tier keystone but a 3-4 week solo lift; the on-deck items (extend-by-N-weeks, sort catalog, switch-program warning, retest UX polish, Week expand + Move sheet) collectively close ~10-15h of founder-visible gaps and unblock the "concurrent tracks paid-gate" story when billing lands. Founder call.
