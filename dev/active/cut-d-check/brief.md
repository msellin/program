# Cut D · Morning Check redesign · brief

**Date:** 2026-08-21
**Scope:** `/check` (generic + hip + skill program variants) only. `/check/hip`
   subroute inherits the same primitives.
**Positioning check:** Confirm-first mechanic depends on the check firing —
   if this surface is heavy, users skip → engine can't propose → whole
   differentiator dies. This is the highest-leverage surface outside the tab
   redesign.

---

## Problem framing (100 words)

Current `/check` is a data-collection form: 4-8 zero-to-ten sliders + 3-5
checkboxes + a stiffness minutes slider + a life-load slider + a text field.
~12-14 form controls, all requiring precise slider drags on a phone. Peer
morning-check surfaces (Whoop, Oura, Freeletics) land at 30 seconds with
3-5 taps. Terav's current surface is heavier because it treats symptom
gradation as a metric-log problem rather than a state-declaration problem.
Users can't sustain morning check as a daily habit if it takes >60s. They
skip → engine has no readiness signal → today's session doesn't adapt →
confirm-first mechanic breaks.

---

## Design goal

**Land the check in 30 seconds when unfilled. Land it in 5 seconds when
yesterday's is fresh.**

---

## Peer references (from 2026-08-21 competitive matrix §D-1 morning check)

| Peer | Their morning check |
|---|---|
| **Whoop** | 3 questions (recovery, illness, injury) — tap-scale, ring flip visual, ~30s |
| **Oura** | Auto-populates from ring biometrics + 2 subjective taps + free-text note |
| **Freeletics** | Pre-workout only: "How's your body?" 3-option tap (fresh / normal / tired) |
| **TrainingPeaks** | Optional daily wellness (sleep, stress, fatigue, mood, soreness) — 5 sliders, opt-in not required |
| **Hevy / StrongLifts / Fitbod** | No morning check equivalent |
| **Pliability / GOWOD** | No morning check equivalent |

**Terav's differentiator:** the check is REQUIRED for confirm-first
mechanic (the read gates every proposal). Nobody else has this coupling.
That's why it must be fast: the confirm-first machinery breaks silently
if users skip.

---

## Load-bearing vs polish (per current `derive()` logic)

**Load-bearing (drives green/amber/red state):**
- Peak region score → amber if ≥4, red if >5
- `night_pain` boolean → forces red
- `gait_change` boolean → forces red
- `click_present && click_painful` → forces red (hip only)
- `morning_stiffness_min > 30` → amber
- `life_load ≥ 5` → amber, ≥ 8 → red

**Polish (persisted, informs weekly-narrative but not state):**
- Outside training free text
- Morning stiffness minutes (as continuous — only >30 threshold matters)
- Clicking (non-painful)

---

## Proposed design (v1)

### Component tree (top-down)

```
/check  (CheckPage)
├── Header — "Morning check" + eyebrow "Wednesday · 5:47am"
├── LiveVerdictBar (NEW · sticky-top or above form)
│   ├── Big state chip: WORKOUT READY / CHECK FIRST / BACK OFF
│   ├── Sub: "Green — all below 3/10 · nothing flagged"
│   └── Cited (inline): "Kellmann 2010 · pain-provocation thresholds →"
├── Regions block
│   ├── Region row × 4-8 (compact tap-scale, no slider)
│   │   ├── Label (e.g. "Groin (L)")
│   │   ├── 4-option tap-scale [ • None · Mild · Notable · Severe ]
│   │   │   Values map to numbers via {None:0, Mild:2, Notable:5, Severe:8}
│   │   └── Selected chip highlights + subtle bronze underline
│   └── (each row 56-64px tall — 8 rows fit in 500px, fits in one screen)
├── FlagsRow (NEW · chip toggles)
│   ├── "Woke me at night" · "Shortened stride" · "Clicking (hip only)"
│   │   Each tap-to-toggle · amber-outlined when on
├── ContextRow (NEW · 2 compact selectors on one row)
│   ├── Morning stiffness · [None · <15min · 15-30 · >30]
│   └── Life load · [Fresh · Normal · Cooked]
├── OutsideTrainingRow (kept · text input, single line)
│   "Outside training yesterday: e.g. 90 min padel"
├── PrefillCard (conditional · shown if yesterday's check <7d ago)
│   "Same as yesterday? [ Yes, save → ]"
└── StickyCta "Save check →"
```

### Interaction targets

- **Row height ≥56px** for tap comfort (region rows + flag chips + selectors)
- **4-option tap-scale**: 4 chips per row, ~80px each, 12px gap between rows
- **Live verdict** updates as user taps — no "save to see" delay
- **Total DOM** at rest: ~8 region rows + 3 flag chips + 2 selectors + text
  input + verdict + Save. Fits in ~700-800px vertical — one scroll on 393px

### Data mapping

- Region tap → { None:0 · Mild:2 · Notable:5 · Severe:8 } written to
  `symptoms[region_key]` (backward-compatible with existing 0-10 storage)
- Stiffness bucket → { None:0 · <15:10 · 15-30:20 · >30:45 } to `morning_stiffness_min`
- Life load bucket → { Fresh:0 · Normal:4 · Cooked:8 } to `life_load`
- Flags stay boolean, same keys

### Prefill logic

- If `yesterday.symptoms` exists AND date-diff ≤ 7 days, PREFILL current
  form with yesterday's values on mount
- Show a subtle "prefilled from Tue's check · [ start fresh ]" hint
- User taps ANY field → hint disappears + form is user-authored

---

## What we're keeping

- `derive()` state logic — unchanged (backward-compatible mapping preserves
  existing green/amber/red algorithm)
- Existing store schema — no migration needed (bucketed values map to same
  0-10 numeric fields)
- Sticky Save CTA (Batch 36 keyboard-aware pattern)
- Program-variant support (hip / skill / generic — same conditional flags)
- Kellmann 2010 citation (surfaced live per matrix rec #4)

## What we're killing

- **0-10 sliders** — replaced by 4-option tap-scale. Continuous value not
  visually parseable at a glance, hard to nudge on a small screen.
- **Save-then-see-verdict** — verdict now renders live above the form.
- **Morning stiffness raw-minutes slider** — replaced by 4-bucket
  segmented selector. The `> 30` threshold is what matters.
- **Life load raw slider** — 3-option bucket.

## What we're adding

- **Live verdict bar** dramatizes the "check → gates today's session"
  linkage (matrix rec #4 · cite-per-adjustment as first-class UI)
- **Prefill from yesterday** — the 5-second-return path
- **Inline "Cited" line under verdict** — same pattern as LatestRetestTile

---

## Non-goals (do not scope creep)

- New symptom regions or new flag types — this is UX compression, not
  content redesign
- Sensor integration (HRV, sleep) — deferred to future device-pairing cycle
- Web-app version — mobile-first, same as everywhere
- Skill program variant refactoring — inherits the same primitives with
  same conditional flags

---

## Constraints preserved

- R2 · bronze CTA-only (verdict chip uses green/amber/red state color, not
  bronze; Save button remains bronze)
- R5 · no gamification (no streaks for "consecutive checks", no XP)
- R7 · no fragility tone (rehab-safe — check is a state read, not a
  triage question; matches copy-clarity's "Red-flag patterns surface a
  banner, not a diagnosis" from FLAG-2a)
- R8 · no autonomous score-hero (verdict shows STATE + threshold, not a
  composite readiness number)
- Batch 37 useStore-selector trap avoided (props over selectors)

---

## Wireframe (day-with-yesterday-prefill state · 393px)

```
┌─────────────────────────────────────┐
│ ← Back to Day                       │
│                                     │
│ Morning check                       │
│ WEDNESDAY · Aug 21                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ WORKOUT READY                   │ │
│ │ Progress load — nothing flagged │ │
│ │ Cited · Kellmann 2010 →         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ─ REGIONS ────────────────────────  │
│                                     │
│ Groin (L)                           │
│ [•None][ Mild ][ Notable ][ Sev. ]  │
│                                     │
│ Low back                            │
│ [•None][ Mild ][ Notable ][ Sev. ]  │
│                                     │
│ Buttock (L)                         │
│ [•None][ Mild ][ Notable ][ Sev. ]  │
│                                     │
│ Shoulder (R)                        │
│ [•None][ Mild ][ Notable ][ Sev. ]  │
│                                     │
│ ─ FLAGS ──────────────────────────  │
│                                     │
│ [ Woke me at night ] [ Stride ↓ ]   │
│ [ Painful click ]                   │
│                                     │
│ ─ CONTEXT ────────────────────────  │
│                                     │
│ Stiffness · [•None][<15][15-30][>30]│
│ Life load · [•Fresh][ Normal ][Cook]│
│                                     │
│ Outside training yesterday:         │
│ [ padel 90 min, walked to work ]    │
│                                     │
│ Prefilled from Tue's check.         │
│ [ Start fresh ]                     │
│                                     │
│                                     │
│ ══════════════════════════════════  │
│ [       Save check →       ] STICKY│
└─────────────────────────────────────┘
```

---

## Success metrics

- **Time-to-save on unfilled state**: 30s target (vs current ~60-90s)
- **Time-to-save on prefill state**: 5s target
- **Users don't skip morning check because it's heavy** — measurable via
  daily-check-completion rate once FLAG-5 analytics ships
- **Verdict is user-obvious BEFORE save** — no "wait, what happened?" moment

---

## Files this cycle will touch

- `next-app/src/app/check/page.tsx` — main rewrite
- `next-app/src/app/check/hip/page.tsx` — inherit same primitives
- New: `next-app/src/components/check/CheckRegionRow.tsx` (4-option tap-scale)
- New: `next-app/src/components/check/CheckFlagChip.tsx` (toggle chip)
- New: `next-app/src/components/check/CheckSelectorRow.tsx` (segmented picker)
- New: `next-app/src/components/check/CheckLiveVerdict.tsx` (top verdict bar)
- Keep: `StickyCta`, `EngineReadsNotesHint`, existing `derive()` logic

---

## Estimate

- HTML mockup: ~30 min (this session)
- 2 audit agents review (visual-craft + mobile-UX): parallel, ~10 min
- Fold audit findings: ~15 min
- Code rewrite: ~1.5 days
- Persona harness verify: ~15 min
- Total: **~2 days** (below original 3-4d estimate because the current file
  is only 314 lines and the primitives are simple)
