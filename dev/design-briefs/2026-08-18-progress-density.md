# Progress page — density cut

Owner: product-design-lead
Written: 2026-08-18
Status: draft — awaiting founder review
Related audits:
- `dev/design-briefs/2026-08-17-flow-grade-full-journey.md`
- `dev/audits/2026-08-18-full-sweep/visual-craft.md`
- `dev/audits/2026-08-18-full-sweep/mobile-ux.md`
- `dev/active/heritage-non-responder-gate-plan.md`

Blocks: `app-visual-craft` typography ramp on the new milestone row.

---

## The call

Collapse the 10 sections into **five stacked blocks** — Engine banners → Weekly summary → Retest metrics → Milestones (bar-first, tap for detail) → Rehab strip (hip only) — kill the Training-Maxes editor and the collapsed data-as-table, promote HERITAGE cluster into the Weekly Summary header, and split the "engine reads" list into three labelled sub-lists.

**Why (three-line summary):**
- The founder's principle is right: **a bar answers "how am I doing?" faster than a chart.** Every surface that can express itself as one horizontal bar per lift/goal must do so; time-series stays only where direction is the point (90d symptom trend).
- **The engine owns TMs.** Rendering them as editable number inputs invites the user to fight the machine that just recomputed them from Week-3 AMRAP + accepted cycle-end. Read-only current, history link for the paranoid, coach-chat to propose a manual override.
- **Progress is a review surface, not a control panel.** Anything the user *does* (accept, retest, edit) belongs on Today or in Coach; Progress renders *what happened*.

---

## The problem

Progress grew section-by-section. Every new engine feature earned a card. There is no editorial hand. Ten sections stacked without a shape means every one is equally load-bearing, which is another way of saying none of them is. Persona screenshots make it obvious: `persona-erratic` scrolls past the strongest content (retest metrics) to hit the training-max editor, then bounces because "why is it asking me for numbers?".

The 5-signal list at `SignalCompletenessCard.tsx:63-101` mixes three categories into identical bullets: performance math (TM formula, per-set RPE), symptom logs (morning check), qualitative logs (session notes). A user glancing at the list can't tell which signals are automatic (accrued as they train) from which require behaviour (log a note). The category difference *is* the information.

The symptom-vs-load chart + data-as-table expander at `progress/page.tsx:265-282` (chart) plus HipProgressTile's own sparklines (`HipProgressTile.tsx:96-108`) means the same 90-day symptom signal renders twice on one page for `persona-recover`, at different granularities. Duplicate data at different fidelities is worse than either alone.

The training-max editor at `progress/page.tsx:295-323` is the biggest violation of confirm-first. The `evaluateCycleEnd` engine banner at `progress/page.tsx:195-218` proposes a delta ("110 → 115 kg (+5)") with an "Apply all TM changes" button. Directly below, four editable number inputs let the user overwrite the engine's number silently. If the user types 115 into the input before tapping the banner's Apply button, or vice versa, the second action's meaning is ambiguous. This is a bug shaped like a UI.

Milestones at `MilestoneLiftGroup` (`progress/page.tsx:401-557`) already have the right bones — bar + roadmap % + tap-to-expand — but the tap-target header renders four independent facts on one row ("TM 110 kg · next 120 kg in 40d · +5.0 · final 165 kg by 2027-04-24"), which is dense. Cut to two lines: headline number, and one comparator line.

Future scenarios the design must handle:
1. `persona-strength` on `concurrent-strength-maintenance` after Bug #4 fix — will get TM-bump proposals + retest deltas + weekly PRs. No hip section.
2. `persona-recover` on `anterior-hip-rebuild` — 4-year symptom log, weekly rehab adherence, monthly hip-check score, no strength milestones (currently).
3. `persona-erratic` on any program — 15 skips, mostly amber morning checks, wants one glance to say "you skipped a lot, engine paused, resume?".
4. Multi-program user (post `block_object`) — running Engine Builder + rowing prep in parallel. Per-track adherence bar (`PerProgramAdherenceCard`) is the whole story here.
5. HERITAGE Phase 2 user — Week 4 mid-block retest logged, Week 8 pending; classifier says Cluster A/B/C.
6. Screen-reader user — every bar needs `role="img" aria-label` with the numeric summary (already done in `PerProgramAdherenceCard.tsx:104-108`; extend pattern).

---

## Options considered

### Option A — Delete + demote (minimal)
- **Shape:** Drop TM editor and data-as-table expander. Keep everything else. Renumber sections.
- **Pros:** 2h. Ships tomorrow.
- **Cons:** Doesn't solve the "10 identical cards" perception problem. Signal card still reads as one uncategorised list. Milestones stay dense.
- **Verdict:** rejected — the founder's stated principle ("bars are easy to understand or some graphs where user sees incline or decline") demands structural change, not deletion.

### Option B — Tabs (Lifts / Health / Signals)
- **Shape:** Bring back the 3-tab surface the page was flattened from.
- **Pros:** Less scroll per view.
- **Cons:** The flow-grade audit already killed tabs here for a reason (`progress/page.tsx:159-161`): tab-swap hid the strongest content behind an extra tap. Adding tabs back re-buries the retest deltas. Aerobic + skill programs have empty tabs.
- **Verdict:** rejected — solves scroll density by paying a discoverability tax we've already refused once.

### Option C — Five blocks, bar-first (winner)
- **Shape:** Engine banners → Weekly summary (with HERITAGE chip in header when active) → Retest metrics → Milestones (bar-first row per lift) → Rehab strip (hip only). Signal card becomes categorised sub-lists inside Weekly summary tap-to-expand. TM editor deleted. Data-as-table deleted.
- **Pros:** Aligns with founder's bar-first principle. Halves visible cards. Every remaining card answers one question. HERITAGE has a designated home. Confirm-first re-established (engine owns TMs).
- **Cons:** ~6h engineering. Requires migration story for users who typed TMs directly (few — cycle-end is authoritative).
- **Verdict:** **winner**.

---

## Chosen: Option C — Five blocks, bar-first

### Section inventory

| # | Current section | Decision | Reason |
|---|---|---|---|
| 1 | Engine banners (pause / cycle-end / accelerate) | **KEEP AS-IS** | Correct pattern — top of surface, prospective action with Accept. `persona-recover` and `persona-strength` both need this. |
| 2 | Weekly narrative tile | **KEEP AS-IS**, add HERITAGE cluster chip in header | Load-bearing "how did the week go" summary. Deterministic, already correct shape. |
| 3 | "5 signals" engine-reads list | **SIMPLIFY TO** categorised 3-list (perf / symptom / notes) inside Weekly summary tap-to-expand | Same information, honest structure. Removes standalone card. |
| 4 | Symptom-vs-load chart | **KEEP AS-IS** — hip programs only | Founder rule allows charts where direction is the point. This IS the direction. Time-series stays. |
| 5 | Data-as-table expander | **KILL** | Duplicate data. A11y wins via chart's `aria-label` summary + Export report route already covers precise-number needs. Persona-check: no persona clicked the expander in artefacts. |
| 6 | Training maxes editor | **KILL** the inputs; **SIMPLIFY TO** read-only "Current TM" line inside each Milestone row | Engine owns TMs. Cycle-end banner is the write path. Coach chat is the exception path. Persona-check: `persona-strength` needs to *see* the TM trajectory — the milestone row shows current TM already. |
| 7 | Cycle rule note (`tmMeta.progression_rule`) | **MERGE INTO** Weekly summary tap-to-expand as one line under "How the engine updates" | Reference material, not front-page news. |
| 8 | Milestones | **SIMPLIFY TO** one-row-per-lift bar + one-line comparator + tap-to-expand for roadmap | Founder note verbatim: "Bar-plus-tap-to-expand would land the message faster." |
| 9 | Hip section (`HipProgressTile`) | **SIMPLIFY TO** two-tile strip (monthly-check headline number + rehab-adherence bar); kill the 90d symptom sparkline INSIDE this tile because #4 already renders it | Deduplicate. `persona-recover` sees rehab adherence bar as its own row, big and loud. |
| 10 | 90d symptom trend | **MERGED into #4** | Same signal, higher fidelity in the chart. |

Post-cut: **5 visible blocks**, down from 10.

### Chart-vs-bar per remaining surface

| Surface | Shape | Justification |
|---|---|---|
| Sessions done this week | inline "3 / 4" text with tone color | Bar unnecessary — the fraction *is* the bar. |
| Per-track adherence (multi-program) | stacked bar (done/upcoming/skipped/moved) — **already correct** | `PerProgramAdherenceCard.tsx:104-129` is the canonical pattern; other bars in this brief should copy it. |
| Retest metric delta | **single number + arrow** (baseline → current, Δ colored green/amber) — **already correct** | Delta *is* direction. A bar would add zero. |
| Milestone roadmap per lift | **horizontal progress bar with milestone ticks** — **already correct**, promote to primary | Founder's stated preferred shape. |
| Symptom vs load (hip) | **line chart, kept** | Direction over 90 days across two axes — the one place a bar cannot express the same thing. |
| Rehab adherence (30d) | **horizontal bar, promoted** | Was buried in HipProgressTile grid; deserves its own row. |
| HERITAGE cluster (Phase 2+) | **inline chip in Weekly Summary header** ("Cluster A — responding") | Categorical, not directional. A chip is the right primitive; a bar would misrepresent it. |

### Training maxes — the call

**Read-only current-state per lift, rendered inline in each Milestone row. History via `/history` link. Manual override lives in Coach chat as a proposal ("I hit 122 last night — bump front squat TM").**

Reasoning: the engine already recomputes TMs from cycle-end +5/+2.5 rule and Week-3 AMRAP overperformance. The user has one legitimate write path today (accept the engine banner) and one edge-case write path (Coach chat proposal that lands as an EngineBanner). Editable inline inputs create a third path that fights both. `persona-strength` wants a TM trajectory display, not an input — the milestone row's "TM 110 kg → next 115 kg" line delivers that. `persona-erratic` doesn't touch TMs at all. `persona-recover` doesn't have TMs on the hip program.

Migration: on first render post-ship, any user with typed TMs sees them preserved (the store keeps them; only the editor disappears). No data loss. If a founder-level power user wants to reset a TM, `/coach` is one tap away.

### Milestones — single-row shape

```
+------------------------------------------------------------+
|  Back squat (highbar)                            2/5 ▸    |
|  TM 110 kg  ·  next 120 kg in 40d                          |
|  [██████████░░░░░░░░░░░░░░░░░░░░]  Roadmap 42%             |
+------------------------------------------------------------+
```

Two lines above the bar, one comparator, one bar. Tap to expand → today's `MilestoneLiftGroup` detail list (per-milestone dates, beaten/soon/missed chips, notes). The stretch/final language moves into the expanded state. That reduces the visible header from 4 facts to 2 without losing anything on tap.

### "Engine reads" list — the call

**Three sub-lists with monospace category headers.** Not icons per row (accent-economy noise), not a horizontal rule between rows in one long list (unclear grouping).

```
The engine sees
─── PERFORMANCE ────────────────────
  · TM formula      — cycle-end +5/+2.5 rule
  · Week-3 AMRAP    — overperformance detection
  · Per-set RPE     — regression detection
─── SYMPTOM ────────────────────────
  · Morning check   — green/amber/red gating
─── NOTES ──────────────────────────
  · Session notes   — qualitative context

Would additionally use
  { unchanged from today's card }
```

Lives inside Weekly Summary tap-to-expand — this is reference material, not surface content. Persona-check: `persona-erratic` will never open it; `persona-strength` opens it once to understand the engine and never again; `persona-recover` opens it when a specialist appointment nears.

### Data-as-table expander — the call

**KILL from Progress. Route users needing precise numbers to Export report (already linked top-right, `progress/page.tsx:175-179`).** A11y need is met by the chart's `aria-label` summary describing the trend — see `app-accessibility` delegate below to verify.

### HERITAGE non-responder chip — placement

**Inside Weekly Summary header, right of the week label.** Chip renders only when both Week-4 and Week-8 baselines are logged (per `heritage-non-responder-gate-plan.md`). Three states:

```
Week 32 (this week so far)     [ Cluster A · responding ]
Week 32 (this week so far)     [ Cluster B · under-dosing ]
Week 32 (this week so far)     [ Cluster C · non-responder ]
```

Tap opens a sheet with the classifier reasoning + recommendation-key text. This slots into the space the deleted TM editor freed, without adding another card the day after we thinned the page.

### Full wireframe (post-cut, mobile 393px)

```
┌─────────────────────────────────┐
│ Progress          [Export ↗]    │
├─────────────────────────────────┤
│ ▲ Engine banners (when firing)  │
│   pause / cycle-end / accelerate│
├─────────────────────────────────┤
│ Week 32 — this week so far      │
│                    [Cluster A]  │
│ Sessions      3 / 4             │
│ Top lift      squat 100×5       │
│ Weekly bests  2 lifts           │
│ Rehab         5 of 7 days       │
│ ▸ How the engine reads you      │
├─────────────────────────────────┤
│ Retest metrics                  │
│ ┌─ 2K row time                ─┐│
│ │ Baseline 8:12  Current 7:48  ││
│ │ Δ −24s  (Target 7:30)        ││
│ └──────────────────────────────┘│
│ ┌─ Submax HR at 200W          ─┐│
│ │ ...                           ││
│ └──────────────────────────────┘│
├─────────────────────────────────┤
│ Milestones            → target  │
│ Back squat            2/5 ▸    │
│ TM 110 · next 120 in 40d        │
│ [████████░░░░░░░]  Roadmap 42%  │
│ Front squat           1/4 ▸    │
│ [████░░░░░░░░░░░]  Roadmap 22%  │
├─────────────────────────────────┤
│ Hip flexor  (hip program only)  │
│ Monthly check 3.2  −0.4 ↓       │
│ Rehab 22/30  [███████████░░░]   │
│ Symptom vs load  ─────╱╲──────  │
│ [ 90d line chart ]              │
└─────────────────────────────────┘
```

### Cross-persona coherence check

| Persona | State | Does the design hold? | Notes |
|---|---|---|---|
| persona-recover | rehab, symptomatic morning, `anterior-hip-rebuild` | y | Rehab-adherence bar is now its own row, taller and louder than before. Symptom-vs-load chart preserved. Monthly-check delta with arrow — direction at a glance. |
| persona-strength | overperformer, cycle-end, `concurrent-strength-maintenance` | y | Weekly best count + Top lift line in Weekly Summary carries the "weekly wins" density. Milestone rows carry TM trajectory. Engine banner carries the +5/+2.5 write path. No editable input to fight. |
| persona-erratic | 15 skips, engine noisy, any program | y | One-glance answer: Weekly Summary sessions ratio (tone-colored) + engine banner if pause fired. Everything below is optional scroll. Signal card no longer occupies prime real estate. |

### Modern-standard checks

- iOS HIG: sheet used for signal-list expand (bottom sheet, `InfoSheet` pattern). Tap targets ≥44×44 on the milestone row (already 48 in current impl, `progress/page.tsx:449`). Safe area on the export button. Pass.
- Material 3: state layer on milestone tap (already `hover:bg-line-soft/50`). Motion bucket "small-emphasized" for chevron rotate. Pass.
- Refactoring UI: accent economy — bronze on milestone bar fill, green on positive delta, amber on skipped-session warn, slate on cluster chip. One primary tone per row. Pass.
- `prefers-reduced-motion`: chart animations already off in Recharts default; bar-fill `transition-[width]` needs `motion-reduce:transition-none` added. → delegate to `app-motion-perf`.
- Fitts's law: primary tap targets (milestone rows, week nav) in bottom two-thirds of viewport after the fold. Pass.

---

## Data shape changes

None. All decisions are additive or subtractive on the render layer. The `training_maxes` store field remains — engine + Coach chat still write to it. HERITAGE cluster chip reads from the fields defined in `heritage-non-responder-gate-plan.md` §"non_responder_classifier".

---

## Component tree

Current (`next-app/src/app/progress/page.tsx`):
```
ProgressBody
├── EngineBanner × 3 (pause / cycle-end / accelerate)
├── WeeklyNarrativeTile
├── PerProgramAdherenceCard
├── SignalCompletenessCard        ← standalone
├── RetestMetricsPanel
├── SymptomLoadChart (hip only)   ← duplicate of HipProgressTile's chart
├── Training maxes editor         ← inline number inputs
├── MilestoneTable
│   └── MilestoneLiftGroup × N    ← 4 facts on tap header
└── HipProgressTile (hip only)
    ├── Monthly check sparkline
    ├── 90d symptom trend         ← duplicate of SymptomLoadChart
    └── Rehab adherence bar
```

Proposed:
```
ProgressBody
├── EngineBanner × 3
├── WeeklyNarrativeTile
│   ├── header: label + HERITAGE cluster chip (when present)
│   ├── summary lines
│   └── expandable: SignalCompletenessCard (categorised)
├── PerProgramAdherenceCard
├── RetestMetricsPanel
├── MilestoneList (renamed from MilestoneTable)
│   └── MilestoneRow × N            ← 2-line header + bar; expand for detail
└── HipProgressStrip (hip only)
    ├── Monthly-check delta         ← headline + arrow
    ├── Rehab adherence bar
    └── SymptomLoadChart            ← moved here; single home for the chart
```

### File-level changes

- `next-app/src/app/progress/page.tsx:229-284` — remove standalone `<SignalCompletenessCard>` and standalone `<SymptomLoadChart>`. Signal card is passed into WeeklyNarrativeTile as an `expandableSlot` prop.
- `next-app/src/app/progress/page.tsx:295-323` — delete TM editor block and `DebouncedTMInput` helper (`progress/page.tsx:637-687`).
- `next-app/src/app/progress/page.tsx:401-483` — rewrite `MilestoneLiftGroup` header: drop the "final X kg by Y" line from the collapsed state; keep it in the expanded list. Two-line header only.
- `next-app/src/components/WeeklyNarrativeTile.tsx` — add optional `heritageCluster?: 'A' | 'B' | 'C' | null` prop rendered as a chip in the header; add optional `expandableSlot?: ReactNode` rendered below summary via disclosure.
- `next-app/src/components/progress/SignalCompletenessCard.tsx:59-105` — split `reads` into three sub-lists by category (add `category: 'performance' | 'symptom' | 'notes'` to `SignalCompleteness` schema, default `'notes'` for legacy entries).
- `next-app/src/components/HipProgressTile.tsx` — rename to `HipProgressStrip.tsx`; consolidate the 90d symptom sparkline into a wrapper that renders the shared `SymptomLoadChart` (single home).
- `next-app/src/lib/schemas.ts` — add `category` field to `SignalCompletenessEntry`. Additive, backward-compatible.

### Delegate-to-specialist

- **Type scale / palette** → `app-visual-craft` — apply type ramp to the new 2-line milestone row (headline sm-semibold, comparator xs-muted, bar 8px). Verify bronze bar contrast on `line-soft` track.
- **Ergonomics** → `app-mobile-ux` — verify milestone-row tap area still ≥48px after cutting header height; verify HERITAGE chip is not a tap target if the sheet trigger is the header itself.
- **A11y** → `app-accessibility` — chart `aria-label` summary must describe symptom-vs-load trend numerically (else killing the table breaks screen readers). Verify categorised signal sub-lists use `<h4>` headers not styled `<p>`.
- **Copy** → `app-copy-clarity` — cluster chip labels ("Cluster A · responding" reads clinical; alternative like "On track / needs push / try a different arc" may land warmer for `persona-strength`).

---

## Migration

- Step 1: Ship SignalCompleteness `category` field with a migration adding `category: 'notes'` to any entry lacking it. Program JSON authors then re-categorise existing entries per program (batch — one commit).
- Step 2: Ship WeeklyNarrativeTile prop-plumbing behind default-null cluster.
- Step 3: Delete TM editor + data-as-table + standalone SignalCompletenessCard + standalone SymptomLoadChart from Progress. Same PR.
- Rollback: revert the render layer; no data migration to undo.

---

## Peer benchmarks

- **Whoop weekly view** — a single top card ("Recovery 68%") with a bar, then a stack of one-liners with sparklines. Steal: bar-per-signal density; the fact that every row is one number + one direction indicator. Reject: they gate everything behind a subscription — never withhold information the user logged.
- **Strava weekly summary** — headline metric (weekly km) with a bar chart against a target line, then rest broken into cards each with one number and one delta. Steal: the "one number + one delta" card shape used here for Retest metrics. Reject: their emphasis on social comparison — irrelevant for rehab context.
- **Linear cycle report** — issues completed, target, velocity, all as horizontal progress bars stacked with monospace deltas. Steal: monospace numerals for delta lines (`font-mono tabular-nums` already in use). Reject: their density is too high for a mobile-first user; keep spacing looser than Linear's desktop-first defaults.

---

## What this decision does NOT solve

- **Coach-chat TM override path.** Named as the manual escape hatch; the Coach implementation is a separate brief.
- **HERITAGE cluster sheet content.** Chip placement decided; copy + tap-target for the sheet is a `app-copy-clarity` brief.
- **Multi-program milestone view.** Milestones today assume one program. When Concurrent Strength Maintenance runs alongside Engine Builder, milestone rows may need program-prefix chips. Defer.
- **Retest scheduling UI.** RetestCard "Retest — log new reading" stays as-is; the mid-block cadence UX from HERITAGE plan will change the shape of the "retest due" chip — defer to HERITAGE Phase 1 brief.
- **Empty-state design for zero-log new signup.** Current copy is fine; a proper empty-state ramp is a separate brief.

---

## Estimated implementation cost

**6–8h, high confidence.** Two file rewrites (`progress/page.tsx`, `WeeklyNarrativeTile.tsx`), one component rename + trim (`HipProgressTile.tsx` → `HipProgressStrip.tsx`), one schema field add (`SignalCompletenessEntry.category`), one bulk program-JSON migration (batch-categorise existing signal entries). No data migration. No engine changes.
