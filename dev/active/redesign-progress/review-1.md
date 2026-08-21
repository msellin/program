---
name: Review package · Cut C Record — day 400 mockup
date: 2026-08-21
state: pending founder review + audit-agent consolidation
---

# Review 1 — Record surface at day 400

The founder-verification state. This is the surface I'm proposing to REPLACE the current `/progress` + `/history` two-tab pair with. If day-400 lands right, I generate day-90 and day-14 mockups next and then move to code.

## BEFORE (current shipping state)

Two separate tabs, each rebuilt for its own scale story:

- **`/progress`** — current implementation renders WeeklyHeatmap + WeeklyNarrativeTile + RetestMetricsPanel + SignalCompletenessCard + PerProgramAdherenceCard + HeritageClusterChip + HipProgressTile + SymptomLoadChart + engine banners (cycle-end / accelerate / pause).
  - Persona artifact: `next-app/tests/e2e/artifacts/personas/persona-strength/mobile/05-progress.png`
- **`/history`** — current implementation renders Heatmap + BlockHistorySection + ReadinessTrail + per-region symptom sparklines + per-lift top-set sparklines.
  - Persona artifact: `next-app/tests/e2e/artifacts/personas/persona-strength/mobile/04-history.png`

Founder's observation (2026-08-21): "progress vs history seems like duplicated stuff at some point or in some time frames, or maybe it just feels like that in our app."

Matrix finding: the peer set mostly collapses these into ONE surface with zoom controls (Oura Trends, Hevy History, Whoop Overview, Peloton Profile, Apple Fitness+ Summary). Only feature-heavy power-user apps (Garmin, TrainingPeaks) keep them split.

## AFTER (Cut C proposal — day 400 state)

**`/record`** — a single collapsed surface with three stacked sections and zoom controls.

- Mockup HTML: `dev/active/redesign-progress/record-mockup-day400.html`
- Mockup screenshot: `dev/active/redesign-progress/record-mockup-day400.png` (393 × 2400 mobile viewport, deviceScaleFactor 2)
- Rendered with the exact v1.1.1 tokens (hex values from `DESIGN-cut-c.md`); no Stitch interpretation, no AI-generated approximation

Three sections stacked on ONE surface:

**NOW** — how am I doing this week?
- 12-week readiness heatmap (existing `WeeklyHeatmap` primitive)
- Weekly narrative card (existing pattern)
- LatestRetestTile — NEW, with 4px left rail, inline citation, next-retest chip

**TREND** — am I getting better?
- WindowTierControl segmented [ 30d ] [ 90d ] [ 1y ] [ All ] — active state is strong-ink underline, NOT bronze
- ProgramCurveCard — NEW, rolling-avg curve in neutral warm-gray (NOT bronze), retest event pins as filled circles, raw points hidden at 1y default with `[ show raw ]` toggle
- RetestTimeline — NEW, horizontal event row, `Base · Current · Delta` summary

**LOG** — what have I done?
- Activity year-heatmap — NEW, 12-month × 2-year re-projection of the existing Heatmap primitive
- Accordion log rows (existing pattern, 30-per-page pagination)

## What changed

| Change | Detail |
|---|---|
| **IA** | 5 tabs → 4 tabs. `/progress` route dies; `/history` renamed to `/record`. |
| **New components** | ProgramCurveCard, WindowTierControl, RetestTimeline, LatestRetestTile, ActivityHeatmap year-column mode. Coded with `CutC-` prefix in source until stabilised. |
| **Kept** | WeeklyHeatmap (12-week), WeeklyNarrativeTile, HipProgressTile, SymptomLoadChart, existing 30-per-page LogList pagination. |
| **Deleted** | MilestoneTable (curve replaces it), engine banners (moved to Today — "Today is *do*, Record is *see*"), 30-day ReadinessTrail (redundant with 12-week heatmap on the same surface), PerProgramAdherenceCard (merged into WeeklyNarrativeTile), HeritageClusterChip (still available inline in narrative). |
| **Palette discipline** | Bronze stays CTA-only. Chart curve is neutral warm-gray. WindowTierControl active state is strong-ink underline, NOT bronze. Only bronze use on the surface is the bottom-nav Record tab active indicator (existing v1.1.1 pattern). |
| **Tenure identity** | Retest events replace streaks/XP. LatestRetestTile in Now + RetestTimeline in Trend carry the "you're 400 days in" story. No streak counter, no year-in-review badge, no gamification. |

## What to review — specific questions

Not "does it look right." Please answer these 6:

1. **Naming — "Record" as the tab.** Reads as archive + personal-best + verb. Matrix showed none of 31 peers use this word. Comfortable with it, or want to swap to "Trends" (Oura parity) or "History" (Hevy parity, minimal change)?
2. **Section order — Now → Trend → Log.** Is this the right hierarchy? Alt: Trend first (which is Oura's actual order), or Log first (which is Hevy's).
3. **Chart curve color.** I've made it neutral warm-gray to keep bronze CTA-only (R2). Some peers (TrainingPeaks) use color on the CTL line for readability. Are you comfortable with the discipline, or does the neutral read as under-emphasized?
4. **Retest event pins as tenure identity.** The 14-event timeline + "Base 112.5 · Current 137.5 · +25.0" summary is the "you're 400 days in" moment. Does this feel like enough tenure identity, or do you want something more affirming (year-in-review, milestone card)? Note: peer streaks/XP explicitly rejected per R5.
5. **Activity year-heatmap.** The 12-column × 2-row grid at scale. Legible? Overwhelming? Wrong axes (should year be columns instead of rows)?
6. **What's missing.** Anything you expected to see at day 400 that isn't there? (e.g. PRs list, per-exercise drill-in, weekly narrative for past weeks, program-changeover markers, deload periods)

## Audit-agent feedback (v1 mockup)

Four agents reviewed `record-mockup-day400.png` in parallel. All 4 findings folded into `record-mockup-day400-v2.png` (see "V2 patch" section below).

### app-visual-craft — palette / rhythm / typography / spacing

**Verdict:** APPROVE-WITH-NITS

**What lands well:** Bronze economy holds — grep confirmed `#d97e5b` appears only in the token declaration and the bottom-nav Record active indicator. Chart curve is `#F0F1F3` (strong-ink), all 7 retest pins are strong-ink, WindowTierControl active underline is strong-ink, Export button is transparent-fill + `border-line-strong`. **R2 satisfied.** Numeric discipline is total — every readout uses `font-variant-numeric: tabular-nums`. Type hierarchy at 393px is disciplined: 32/20/14/10 ramp matches spec. LatestRetestTile does exactly what the brief asked for — 4px `border-l-strong` rail signals tenure without invoking bronze; inline citation on-card; muted `next retest in 27d` chip.

**Nits (folded into v2):**
- Section spacing 32px → 24px (`space-y-6` per spec)
- Body line-height 1.4 → 1.5 (bump for the Basis line where inline `<code>` bumps effective row height)
- Palette drift flagged: mockup declares `--strong: #F0F1F3` but shipping `globals.css` is `#f4f5f7`, and `--bronze: #d97e5b` vs shipping `#c89666` — **reconciled at code time**, not yet in mockup
- Year-heatmap loses green/amber signal that the 12-week has — legitimate design decision per R2 at year scale; flagged for founder question 5 (now moot per design-lead's rework)

**Comparison to BEFORE:** density drops without content loss because MilestoneTable + 30-day ReadinessTrail absorb into ProgramCurveCard + RetestTimeline. Tenure story ("400 days in, 14 retests, +25 kg since Q1'24") lands on-card rather than requiring cross-tab synthesis.

### app-mobile-ux — 393px tap targets / thumb reach / safe area

**Verdict:** BLOCK (in v1); fixes all folded into v2.

**Tap-target blocks (all fixed in v2):**
- Export button 40px → 44px min-height ✅
- WindowTierControl segments 40px → 44px min-height ✅
- `Show raw` toggle 26px → 44px min-height + full padding ✅
- Retest timeline pins wrapped in 22×44 flex hitbox with scroll-snap ✅
- Log-row min-height → 44px ✅
- Load-more button min-height → 44px ✅

**Safe-area (both fixed in v2):**
- `body` top padding → `max(16px, env(safe-area-inset-top))` ✅
- `.bottomnav` bottom padding → `max(24px, env(safe-area-inset-bottom))` ✅

**Other (all fixed in v2):**
- RetestTimeline `scroll-snap-type: x mandatory` + `scroll-snap-align: center` on each pin ✅
- 12-week heatmap given `role="img"` + aria-label; decorative cells inherit `aria-hidden` from container ✅
- Year-heatmap fills marked `aria-hidden` (parent carries aria-label) ✅

**Comparison to BEFORE:** big ergonomic upgrade — single scrollable surface replaces two-page context switch, primary retest data now sits in reachable middle third rather than being buried, sticky bottom-nav genuinely respects safe-area.

### app-copy-clarity — labels / copy / mono-caps discipline

**Verdict:** APPROVE-WITH-NITS (all 7 folded into v2)

- `Cited · Wendler 5/3/1 slow-mode` → `Cited · Wendler 5/3/1 · slow-mode variant` ✅
- `400 days in` → `Day 400` ✅
- `Longest amber streak this cycle: 0.` → `No amber weeks this cycle.` ✅
- `▸ signal completeness 7/7` → `▸ Signals logged 7/7` ✅
- `Latest retest — cycle-14 top-set` → `Latest retest · cycle 14 top-set` ✅
- `1-year rolling top-set vs 12-week baseline` → `1-year rolling top-set · 12-week baseline` ✅
- `Base 112.5 · Current 137.5 · +25.0` → `Base 112.5 kg · Now 137.5 kg · +25.0` ✅
- Timeline hint rewritten: `scroll for per-event citations →` → `tap any pin for the study behind that retest →` (clearer interaction affordance)

**Citation discipline verification:** Passes. LatestRetestTile carries both halves of the landing contract — `Basis` line names the log signal (`top-set-hit-target @ 100%`), `Cited` line names the study/method (`Wendler 5/3/1 · slow-mode variant`).

**Gamification check:** Clean. No streaks, XP, PRs, milestones, badges. "streak" word removed entirely in v2.

**Comparison to BEFORE:** massive improvement — kills wall of full-caps section titles ("READINESS — PAST 12 WEEKS") + explainer paragraphs. Collapses entire retest verdict into one tile with basis + citation inline.

### product-design-lead — does the design match the brief's intent?

**Verdict:** APPROVE-WITH-NITS (2 must-fix, 1 should-fix; all folded into v2)

**Delivery scorecard on the 7 core brief promises:**

| # | Promise | Verdict | Note |
|---|---------|---------|------|
| 1 | Same surface at day 30 and day 400 | ✅ | Structure holds; only content density changes |
| 2 | Retest events as tenure identity | ⚠️→✅ | LatestRetestTile now includes `+25.0 kg since Q1'24 · 14 retests` since-baseline line — massive tenure payoff for one row |
| 3 | Cite-per-adjustment first-class | ❌→✅ | **Was the miss.** Citation was mono-caps footnote (12px body + 10px muted prefix). v2 promotes it to 13px ink strong on its own line with `→` chevron affordance. The differentiator now reads as differentiator, not disclaimer |
| 4 | Rehab firewall | ⚠️ | Passes by omission — day-400 mockup is persona-strength, no rehab. Need day-90 persona-recover mockup next to verify |
| 5 | Rolling-avg curve + zoom tiers | ✅ | Clean |
| 6 | IA collapse 5→4 tabs | ✅ | Bottom nav shows `Today · Week · Record · Programs` |
| 7 | Bronze reserves CTA slot | ✅ | Bronze only on bottom-nav active indicator |

**Where the mockup outperforms the brief (kept in v2):**
- Section anchors as horizontal rules with mono-caps eyebrow — warm-editorial rhythm without chrome
- 12-week heatmap density (12×7, 3px gap) reads at-a-glance as "one adult year quarter"
- LatestRetestTile left-rail (`border-l-4 border-l-strong`) — tenure marker without a badge

**Where the mockup underdelivered on the brief (fixed in v2):**
- **Cite-per-adjustment was timid** → citation promoted to body content with chevron affordance ✅
- **RetestTimeline pins were informationless** → date labels every 3rd pin, size-modulated milestone pins (5 milestone events at cycle boundaries render larger), tap-hint rewritten ✅
- **Log year-heatmap density lie** (12 months × 4 cells = 48 cells, ≠ 365 days) → replaced with honest monthly-total mini-bars ✅

**Adjacent design questions still open for founder review** (v2 doesn't resolve these; needs founder call):
1. **Now → Trend → Log section order** — Oura goes Trend-first, Hevy goes Log-first. Terav went Now-first. Design-lead stands by it (WeeklyNarrativeTile as differentiator belongs above fold). Verify at code time whether iPhone SE fold lands mid-Trend.
2. **RetestTimeline as horizontal-scroll** — fine at 14 events; at 40+ events (year 3) becomes scrubbing chore. Consider stacked-recent list (last 3 with per-event citation) with `See all 14 →` link. Defer to a Cut A future.
3. **Category vacancy under-dramatized** — nothing in the mockup TELLS a new user "every change here cites a source." Consider a first-visit InfoSheet or a hairline "Every change cites its source" mono-caps line in header. Defer to onboarding cycle.

**Recommendation on next step:** APPROVE v2. Proceed to day-90 mockup with persona-recover state to prove Rehab firewall is structural, not absent.

## V2 patch — what changed since first render

Screenshot: `record-mockup-day400-v2.png`. All 4 audits folded in.

**Visual system (visual-craft):**
- Body line-height 1.4 → 1.5
- Section spacing 32px → 24px
- Palette drift flagged (mockup uses `#F0F1F3` / `#d97e5b`; shipping `globals.css` has `#f4f5f7` / `#c89666`) — resolve at code time

**Mobile-UX (block → fixed):**
- 7 tap-target sites promoted to 44×44
- `env(safe-area-inset-top)` added to body padding
- `env(safe-area-inset-bottom)` added to bottom-nav
- RetestTimeline: `scroll-snap-type: x mandatory`; pins wrapped in 22×44 flex hitbox with `scroll-snap-align: center`
- Decorative heatmap cells given `aria-hidden` (containers carry `aria-label`)

**Copy-clarity (7 rewrites):**
- `Day 400` (was "400 days in")
- `No amber weeks this cycle` (was "Longest amber streak this cycle: 0")
- `Signals logged 7/7` (was "signal completeness 7/7")
- `Latest retest · cycle 14 top-set` (was "cycle-14")
- `Cited · Wendler 5/3/1 · slow-mode variant` (was "Wendler 5/3/1 slow-mode")
- `1-year rolling top-set · 12-week baseline` (was "vs")
- `Base 112.5 kg · Now 137.5 kg · +25.0` (was "Base 112.5 · Current 137.5")
- Timeline hint: `tap any pin for the study behind that retest →`
- Button: `Show raw` (dropped bracket-notation)

**Product-design-lead (must-fix):**
- **Citation promotion.** `.cited` promoted from 12px + mono-caps prefix to 13px ink strong on its own line with `→` chevron. Bold visual weight, tab-focus + role=button. Category-vacancy differentiator now reads as differentiator.
- **Since-baseline tenure line.** Added `+25.0 kg since Q1'24 · 14 retests` mono-caps line inside LatestRetestTile. Massive tenure payoff for one row.
- **RetestTimeline glanceability.** Date labels every 3rd pin (Q1'24, Q2'24, Q3'24, Q4'24, Q1'25). 5 milestone pins (cycle boundaries) render at 10px vs 8px for regular retests. Container gets `role="group"` + full aria-label describing the tenure story.
- **Year-heatmap honesty.** Replaced 4-cells-per-month-block layout (48 cells claiming to be 365 days) with 12 vertical monthly-total mini-bars per year. Each bar height maps to sessions logged that month. No false density.

## Next step

Awaiting your review of the v2 mockup. Two paths:

1. **Approve v2 → generate day-90 mockup with persona-recover state** — verifies rehab firewall is structural. Then day-14 for empty state. Then code.
2. **Redirect on any of the 6 review questions at the top of this doc** — I re-render before day-90.

## Not yet decided (I want to flag these before committing to code)

- The `[ show raw ]` toggle behavior: at 1y and All zoom, raw points are hidden by default (Oura decimation split). When user taps `[ show raw ]`, does the persistence stick per-user, per-program, or per-session?
- Rehab firewall on Trend: the current mockup at day-400 doesn't include a rehab sub-section because the sample program (5/3/1) has no rehab track. The design MD specifies a conditional RehabSection under Trend. Should we add a mockup variant showing a concurrent user's rehab firewall to review that pattern separately?
- Export button placement: currently top-right of the header. Peer references vary — Hevy has it in an overflow menu, Garmin in the sidebar. Keep it visible or push into overflow?

## Next step if this lands

1. Founder answers questions 1-6 above + reviews audit-agent consolidations
2. If go: generate day-90 mockup (mid-tenure, non-empty but not-yet-scaled) to verify the same surface works at that state
3. Then day-14 (near-empty) to verify empty state
4. Then code the actual React components (with `CutC-` prefix) and the `/record` route
5. Playwright verification at synthetic day-400 persona before deploy
