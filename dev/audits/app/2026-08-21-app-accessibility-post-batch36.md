# Terav app — Accessibility audit (WCAG 2.2 AA, post-Batch 36)

Personas audited (14): persona-strength, persona-recover, persona-erratic,
persona-multitrack, persona-graduate, persona-handstand, persona-mobility,
persona-rowing, persona-engine, persona-concurrent, persona-strength-slow,
persona-rowing-erratic, persona-engine-fast, persona-handstand-fast.
Artifacts: `next-app/tests/e2e/artifacts/personas/` (captured 2026-08-20 20:51 UTC).
Baseline for regression: `next-app/tests/e2e/artifacts/personas.baseline-pre-batch-36/`.
Palette: `next-app/src/app/globals.css` (Batch 36 Step 1 token bumps).
Viewport: 393×852 mobile, 1280×800 desktop cross-check.

---

## 1. Overall verdict

**Verdict: VIOLATIONS FOUND (2 P0 regressions, otherwise substantially compliant).**

The Batch 36 accessibility deliverables that were designed hold up: the
BottomNav three-signal active indicator resolves SC 1.4.1; the muted-token
bump (`#8a8f9a → #93989f`) and the line-token bump (`#4d525d → #5f6570`,
plus new `--color-line-strong #6b717d`) push muted body copy from 4.19:1
to 6.12:1 on `bg-surface` and focusable-boundary lines from 2.27:1 to
3.03:1 — both cross their thresholds cleanly. Skip link renders on every
authenticated route as the first focusable node, `<html lang="en">` is
present, exactly one `<h1>` and one `<main id="main-content">` per working
route across all 14 personas, and no heading levels are skipped.
StatusPill and ArcProgressBar carry the mandated ARIA per §2.6/§2.12.

The systemic failure is elsewhere and it is not a subtle finding: **the
/progress and /report routes crash to Next.js's "This page couldn't load"
default error UI on all 14 personas post-Batch 36**, while the same
routes rendered clean H1 + main on the pre-Batch 36 baseline. Every
downstream SC on those two routes (landmarks, headings, focus order,
live regions, contrast) is moot until the render is restored. Second,
DOM order on Today inverts H1 and ArcProgressBar: the progressbar (with
an aria-label repeating the program name) precedes the H1 title in
source, producing duplicate SR announcements and inverting the expected
"headings before subordinate widgets" flow (SC 2.4.3 / 2.4.6).

One thing done especially well: symptom sliders on `/check` carry
complete `role="slider"` semantics — `aria-label`, `aria-valuemin`,
`aria-valuemax`, `aria-valuenow`, and `aria-valuetext` ("0 out of 10")
on every range input. That is the correct implementation of SC 4.1.2
for rehab-critical inputs and is worth preserving verbatim as the pattern.

---

## 2. Systemic issues (fire across ≥2 personas)

### 2.1 /progress and /report crash on client render (P0 REGRESSION)

- **SC:** WCAG 4.1.1 (Parsing → deprecated but still speaks to render
  correctness); functionally every SC that requires a rendered DOM
  (2.4.1 landmarks, 1.3.1 info-and-relationships, 2.4.2 title,
  2.4.6 headings) cannot pass because the route doesn't render.
- **Where:** persona-strength:/progress, persona-strength:/report,
  and 26 other captures — every persona × {/progress, /report} pair
  (28 total captures) crashes to Next.js's default `__next_error__`
  UI ("This page couldn't load. Reload to try again, or go back.").
- **Evidence:** Baseline
  `next-app/tests/e2e/artifacts/personas.baseline-pre-batch-36/persona-strength/dom/05-progress.html`
  renders `<main id="main-content">` + `<h1>Progress</h1>`. Current
  `next-app/tests/e2e/artifacts/personas/persona-strength/dom/05-progress.html`
  emits `<html id="__next_error__">` + Next.js system H1
  `This page couldn't load`.
- **What:** Something in Batch 36 broke `/progress/page.tsx` (which
  imports `WeeklyHeatmap`, `WorkoutHero`, and the store's
  `buildTwelveWeekCells` helper — see `src/app/progress/page.tsx:16`,
  `src/app/progress/page.tsx:790`, `src/app/progress/page.tsx:856`)
  and `/report/page.tsx`. Console log captures don't surface the runtime
  exception; render fails during hydration, not on server.
- **Fix:** Root-cause the client-side exception. Suspect list from the
  Batch 36 diff:
    - `WeeklyHeatmap` `contentVisibility` inline style shape
      (`src/components/ui/WeeklyHeatmap.tsx:79-83`).
    - `WeeklyHeatmapCellState` enum drift between
      `src/components/ui/WeeklyHeatmap.tsx:34` and the
      `buildTwelveWeekCells` producer in `src/app/progress/page.tsx:865`.
    - `WorkoutHero` `headingLevel` prop on a route that renders it with
      `headingLevel=2` after Batch 36 (`src/app/progress/page.tsx:790`
      references `ProgressReadinessSection` — verify it renders the
      hero with a legal headingLevel).
  Add a Playwright assertion in `run-app-audit.sh` that fails the run
  if any persona × route DOM matches `id="__next_error__"`. A crash on
  a shipping route should never make it through a green audit.

### 2.2 DOM order inverts H1 and ArcProgressBar on Today

- **SC:** WCAG 2.4.3 Focus Order (A), 2.4.6 Headings and Labels (AA),
  1.3.2 Meaningful Sequence (A).
- **Where:** persona-strength:/, persona-recover:/, persona-erratic:/,
  persona-multitrack:/, persona-handstand:/, persona-mobility:/,
  persona-rowing:/, persona-engine:/, persona-concurrent:/ — every
  Today capture (10/10 personas — persona-graduate excluded because
  its Today collapses to graduation-CTA state).
- **What:** In DOM order:
  1. ArcProgressBar renders first with
     `<div role="progressbar" aria-label="Concurrent Strength Maintenance
     progress: week 3 of 4.">`.
  2. Then `<h1>Concurrent Strength Maintenance</h1>`.
  SR users hear the program name twice back-to-back (once as
  progressbar name, once as H1). And a page-level widget precedes the
  page's H1, which reverses the standard "landmark → heading → controls"
  reading pattern.
- **Evidence:** `next-app/src/components/session/TodaySession.tsx:228-260`
  (ArcProgressBar block ends line 234, `<header>` with H1 begins line
  250). Captured verbatim in
  `next-app/tests/e2e/artifacts/personas/persona-strength/dom/01-today.html`
  (progressbar block appears ~800 chars before the H1).
- **Fix:** Move the ArcProgressBar below the H1 in TodaySession.tsx so
  source order matches the "title-first" reading model, or set its
  `ariaLabel` to drop the program name (use "Program progress: week 3
  of 4" so it isn't duplicative). Prefer moving — the visual eyebrow +
  H1 stack should read before the progress rail regardless.

### 2.3 `border-line` on `hover:bg-surface-2` drops below 3:1

- **SC:** WCAG 1.4.11 Non-text Contrast (AA).
- **Where:** Ghost buttons ("Ignore", "Cancel", "Skip") across
  workout/SessionActions, workout/ProposalCard, workout/MoveSheet,
  workout/PerProgramActions. Fires on all personas that reach a
  proposal or a session card.
- **What:** `border-line #5f6570` on `bg-surface #16181c` computes
  3.03:1 (passes 3:1). On the hover state `hover:bg-surface-2
  #20232a` the same border computes 2.68:1 (fails). The border is
  a meaningful focusable-boundary (it defines the Ignore button's
  hit region against the card).
- **Evidence:** `next-app/src/components/workout/SessionActions.tsx:55,63,71,210,286,405,477`,
  `next-app/src/components/workout/PerProgramActions.tsx:96,104` — all
  use `border-line bg-surface hover:bg-surface-2`.
- **Fix:** For any interactive `border-line` on a container that
  transitions to `bg-surface-2` on hover/active, promote the border to
  `border-line-strong #6b717d` (3.21:1 on surface-2, 3.63:1 on
  surface). The new `--color-line-strong` token was added precisely
  for "focusable-input outline, StatusPill outline when interactive,
  MetricStripCluster cell dividers" — extend it to hoverable ghost
  buttons.

### 2.4 `focus:*` uses instead of `focus-visible:*` on nav icons and DateNav arrows

- **SC:** WCAG 2.4.7 Focus Visible (AA), 2.4.11 Focus Not Obscured
  Minimum (AA).
- **Where:** AppShell Settings icon (`src/components/AppShell.tsx:158`
  — `focus:text-ink focus:bg-line-soft`), DateNav prev/next arrows
  (rendered in TodaySession — DOM emits `focus:bg-surface-2
  focus:text-ink`).
- **What:** `focus:` fires on mouse-click focus too. On touch users
  who tap a nav icon, the persistent focus-state bg change looks like
  a stuck hover. The global `*:focus-visible` bronze outline is the
  correct affordance, and these components redundantly re-style
  `focus:` without gating on `-visible`.
- **Evidence:**
  `next-app/tests/e2e/artifacts/personas/persona-strength/dom/01-today.html`
  (search "Previous day") — `focus:bg-surface-2 focus:text-ink` on
  the arrow.
- **Fix:** Rename `focus:bg-*` / `focus:text-*` to
  `focus-visible:bg-*` / `focus-visible:text-*` on non-input
  interactives. Inputs may keep `focus:` because form-field focus is
  expected on click. Cheap sweep — a `grep -rn "focus:bg\|focus:text"
  src/components/` covers it.

### 2.5 Coach and events routes 404 (existing, informational only)

- **Where:** persona-strength:/coach, persona-strength:/events, all
  variants.
- **Status:** Pre-Batch 36 behavior — /coach was folded into Profile
  per the IA audit, /events is not built. Audit harness still crawls
  the URLs and captures the 404 shell.
- **Fix:** Remove `/coach` and `/events` from the harness route list
  in `dev/scripts/run-app-audit.sh` (or the persona simulator's
  route map), or accept these as expected 404s in the manifest. Not
  a WCAG issue; noise in the artifact set.

---

## 3. Per-persona findings (route-specific)

Only routes with findings distinct from §2 are listed. Every route not
listed is clean or fails only by inheritance from §2.

### persona-recover (rehab archetype, hip-rebuild, day 30)

| Route | SC | Severity | Finding | Fix |
|-------|----|----|---------|-----|
| /check | 4.1.2 | pass | Symptom range sliders carry `aria-valuemin/max/now/valuetext` + `aria-label`. Reference implementation. | Keep. |
| /check | 2.5.8 | pass | Wrapped-label checkboxes have `<label class="px-3 py-3">` — tap area ≥44×44 via the label, not the 16×16 `<input>`. | Keep. |
| /check-hip | — | — | Only Start button rendered in capture; full form not exercised by harness. Not a finding — coverage gap. | Add a persona-recover hip-check DOM capture with the form open. |
| /progress | — | P0 | See §2.1 (crash). | See §2.1. |
| /report | — | P0 | See §2.1 (crash). | See §2.1. |

### persona-strength (overperformer, engine-builder, day 30)

| Route | SC | Severity | Finding | Fix |
|-------|----|----|---------|-----|
| / | 2.4.3 / 2.4.6 | P1 | See §2.2 (DOM order H1↔ArcProgressBar). | See §2.2. |
| / | 4.1.2 | pass | StatusPill "Workout ready" emits `role="status" aria-live="polite" aria-label="Workout ready"`. | Keep. |
| /programs | 2.4.1 | pass | Two named `<nav>` landmarks — "Program category filter" + "Primary". | Keep. |
| /progress | — | P0 | See §2.1. | See §2.1. |

### persona-erratic (concurrent-strength, day 45, dismissed proposals)

| Route | SC | Severity | Finding | Fix |
|-------|----|----|---------|-----|
| /history | 1.3.1 | P2 | Legacy activity heatmap uses per-cell `<button aria-label="2026-06-29: no activity">` (see `04-history.html`). WeeklyHeatmap primitive at `src/components/ui/WeeklyHeatmap.tsx` uses row-tap. Inconsistent pattern between routes. | Migrate history's activity heatmap to `WeeklyHeatmap` with `onRowTap`, or accept the divergence (per-cell button is not a violation — 44×44 met via grid `minmax(44px, 1fr)` + `aspect-square`). |
| /progress | — | P0 | See §2.1. | See §2.1. |

### persona-multitrack, persona-graduate, persona-handstand, persona-mobility, persona-rowing, persona-engine, persona-concurrent

No route-unique findings. All inherit §2.1 (progress+report crash) and
§2.2 (Today DOM order). Landmark and heading structure clean on every
working route.

### persona-strength-slow, persona-rowing-erratic, persona-engine-fast, persona-handstand-fast

Variant personas produce identical DOM to their parents on the audited
routes; no additional findings.

---

## 4. Contrast ratio table (post-Batch 36 tokens)

Computed via WCAG 2.x relative-luminance on sRGB, no gamma tricks.
Ground `#0e0f12`, surface `#16181c`, surface-2 `#20232a`.

| Token | Hex | On BG | Ratio | Role | Need | Pass |
|-------|-----|-------|-------|------|------|------|
| `ink` | #d6d9de | ground | 13.54:1 | body-primary | 4.5 | YES |
| `ink` | #d6d9de | surface | 12.56:1 | body on card | 4.5 | YES |
| `ink` | #d6d9de | surface-2 | 11.11:1 | body on tint | 4.5 | YES |
| `strong` | #f4f5f7 | ground | 17.57:1 | title | 4.5 | YES |
| `strong` | #f4f5f7 | surface | 16.29:1 | title on card | 4.5 | YES |
| `muted` (post-bump) | #93989f | ground | 6.60:1 | body-secondary | 4.5 | YES |
| `muted` (post-bump) | #93989f | surface | 6.12:1 | body-secondary on card | 4.5 | YES |
| `muted` (post-bump) | #93989f | surface-2 | 5.42:1 | body-secondary on tint | 4.5 | YES |
| `muted` (pre-bump ref) | #8a8f9a | surface-2 | 4.19:1 | (was failing 1.4.3) | 4.5 | NO |
| `line` (post-bump) | #5f6570 | ground | 3.27:1 | focusable-boundary | 3.0 | YES |
| `line` (post-bump) | #5f6570 | surface | 3.03:1 | boundary on card | 3.0 | YES |
| `line` (post-bump) | #5f6570 | surface-2 | 2.68:1 | boundary on tint (hover) | 3.0 | **NO** |
| `line` (pre-bump ref) | #4d525d | surface | 2.27:1 | (was failing 1.4.11) | 3.0 | NO |
| `line-strong` (new) | #6b717d | surface | 3.63:1 | input outline / interactive pill | 3.0 | YES |
| `line-strong` (new) | #6b717d | surface-2 | 3.21:1 | on tint | 3.0 | YES |
| `line-soft` | #24272f | surface | 1.14:1 | divider-only (decorative) | — | n/a |
| `green` | #5fb37a | ground | 7.50:1 | state text | 3.0 | YES |
| `green` | #5fb37a | surface-2 | 6.15:1 | state on tint | 3.0 | YES |
| `amber-strong` | #f0b854 | surface-2 | 8.75:1 | amber state text on tint | 4.5 | YES |
| `red-strong` | #f28068 | surface-2 | 6.04:1 | red state text on tint | 4.5 | YES |
| `bronze` | #c89666 | ground | 7.31:1 | CTA fill + citation chip | 4.5 | YES |
| `bronze` | #c89666 | surface | 6.78:1 | on card | 4.5 | YES |
| `bronze-hi` | #e2b686 | surface-2 | 8.44:1 | on tint | 4.5 | YES |
| `slate` | #79b8c4 | ground | 8.64:1 | accent / "Why?" | 4.5 | YES |
| `slate` | #79b8c4 | surface | 8.01:1 | on card | 4.5 | YES |
| `lat-left` | #4a8894 | surface | 4.44:1 | laterality left | 4.5 | **NO** (just under) |
| `lat-right` | #a279a8 | surface | 4.94:1 | laterality right | 4.5 | YES |
| Bronze focus ring | — | ground | 7.31:1 | focus indicator | 3.0 | YES |

**StatusPill tint pairings (label text on `bg-{tone}/[0.08]` tint over ground):**

| Tone | Tint hex | Text | Ratio | Need | Pass |
|------|----------|------|-------|------|------|
| red | #1f1516 | #f28068 | 6.85:1 | 4.5 | YES |
| amber | #1e1b15 | #f0b854 | 9.56:1 | 4.5 | YES |
| green | #141c1a | #5fb37a | 6.79:1 | 4.5 | YES |
| slate | #161c20 | #79b8c4 | 7.75:1 | 4.5 | YES |

Batch 36 muted + line bumps land cleanly against 1.4.3 and 1.4.11 on
`ground` and `surface`. The one remaining problem is `line` on
`surface-2` (2.68:1) — see §2.3.

`lat-left #4a8894` at 4.44:1 on surface is a hair under 4.5 for body-text
use. Not a new regression, but if it renders as a text color anywhere
(not just as a laterality band fill), it fails 1.4.3.

---

## 5. Charts & data-viz

- **ReadinessTrail (Today + History)**: `role="img"` + descriptive
  `aria-label` ("Readiness, past 14 days: 14 green, 0 amber, 0 red.
  Latest reading green. Trend: flat."). Inner SVG dots are
  `aria-hidden`. Passes 1.1.1. Continue this pattern.
- **ArcProgressBar (Today, /progress when it renders)**:
  `role="progressbar"` + `aria-valuenow/valuemin/valuemax` +
  `aria-label`. Correct per §2.6. See §2.2 for its DOM position on Today.
- **WeeklyHeatmap (primitive, row-tap)**: `role="group"` +
  computed weekly summary as button `aria-label` ("Week of 2026-06-29:
  3 done, 1 amber, 0 red, 2 rest, 1 missed"). Correct per §2.9. Not
  observable in current /progress captures because those routes crash.
- **Activity heatmap (legacy on /history)**: `role="img"` + summary +
  per-cell `<button aria-label="2026-06-29: no activity">`. Not
  broken; pattern differs from the WeeklyHeatmap primitive. §3
  persona-erratic table lists as P2 consistency fix.

---

## 6. Forms

- **Morning check** (`/check`, `src/components/*` — inputs rendered
  from route file): 11 inputs, 6 sliders with full `aria-valuemin/max
  /now/valuetext`, 4 checkboxes wrapped in `<label>` (implicit label —
  valid per HTML spec), 1 numeric input with `<label for="sym-morning-
  stiffness">`. Zero unlabeled inputs. Reference-quality forms.
- **Hip flexor check** (`/check/hip`): DOM capture shows only the
  Start CTA; the questionnaire itself isn't in-frame. Not a violation;
  a harness coverage gap.
- **Onboarding**: Not captured (dismissed pre-persona-run). Verify
  separately.
- **Sign-in / sign-up / reset-password**: Public routes, not in the
  persona harness. Manual audit needed.

---

## 7. Priorities

**P0 (blocking — must fix before user-facing ship):**

- **[§2.1] /progress and /report crash on all 14 personas post-Batch 36.**
  This is a regression against the pre-Batch 36 baseline. Every SC on
  those routes is unverifiable until the render is restored. Root-cause
  the client exception (likely WeeklyHeatmap, WorkoutHero, or
  buildTwelveWeekCells shape drift). Add a harness assertion that fails
  on `__next_error__` shells. — `next-app/src/app/progress/page.tsx`,
  `next-app/src/app/report/page.tsx`.

**P1 (fix this cadence):**

- **[§2.2] Today DOM order** — move ArcProgressBar below the H1 (or
  drop the program-name duplication from its aria-label). SC 2.4.3 /
  2.4.6 / 1.3.2. — `next-app/src/components/session/TodaySession.tsx:225-260`.
- **[§2.3] `border-line` on hover-surface-2** — promote to
  `border-line-strong` on any interactive with a bg-hover to surface-2.
  SC 1.4.11. — `next-app/src/components/workout/SessionActions.tsx:55,63,71,210,286,405,477`,
  `PerProgramActions.tsx:96,104`, `ProposalCard.tsx` (workout/), `MoveSheet.tsx`.
- **[§2.4] Convert `focus:*` to `focus-visible:*`** on non-input
  interactives (AppShell Settings icon, DateNav arrows, any button that
  changes bg or text on focus). SC 2.4.7 / 2.4.11. —
  `next-app/src/components/AppShell.tsx:158`, DateNav (find in
  TodaySession or its wrapper).
- **[Contrast] `lat-left #4a8894`** — if used for text anywhere (not
  just as a fill band), bump to a hex above 4.5:1 on `bg-surface`.
  Suggest `#5a9aa6` (≈5.4:1). SC 1.4.3.
- **[Coverage]** Wire `WorkoutHero` primitive onto the shipping Today /
  Session / Preview surfaces. It's defined and validated in
  `src/components/ui/WorkoutHero.tsx` but only rendered on
  `/dev/primitives`. The Batch 36 workout-name-tallest guardrail
  therefore doesn't run in production. — `TodaySession.tsx:254` still
  emits an inline `<h1>` bypassing the primitive.

**P2 (nice to have):**

- **[§2.5]** Drop /coach and /events from harness route list, or accept
  them as expected 404s in the manifest. Reduces noise.
- **[§3 erratic]** Migrate legacy activity heatmap on /history to the
  `WeeklyHeatmap` primitive (row-tap) for pattern consistency.
- **[Coverage gap]** Capture /check/hip with the questionnaire open.
- **[Sanity]** `hover:bg-surface-3` in `CategoryTileGrid.tsx:80` — no
  such Tailwind class resolves (only `surface` and `surface-2` exist
  in `globals.css`). Hover state silently does nothing. Not a WCAG
  fail; visual polish.
- **[Motion]** Only 7 files use `motion-reduce:` classes. Global
  `prefers-reduced-motion` rule in `globals.css:201-207` covers
  keyframe animations but not per-component `transition-*` classes.
  Sweep `src/components/` for `transition-` without
  `motion-reduce:transition-none`. SC 2.3.3 is AAA (not required for
  AA), but the effort is trivial.
- **[Clinical/data-model, non-WCAG]** `radicular_flavor` red-flag flag
  is present in `data/program.json` progression rules but still absent
  from `data/clinical-context.json.red_flags`. Cross-file drift; not
  a WCAG issue but relevant to the Batch 36 checklist. Fix by adding
  the entry to `red_flags` in clinical-context.json.

---

## WCAG 2.2 AA verdict

**VIOLATIONS FOUND.**

- 1 P0 SC failure (functional): SC 2.4.1, 1.3.1, 2.4.2, 2.4.6 unverifiable
  on /progress and /report because the routes crash.
- 3 P1 SC failures at the "obvious to a keyboard-only or SR user" tier:
  SC 2.4.3 / 2.4.6 (Today DOM order), SC 1.4.11 (line on surface-2 hover),
  SC 2.4.7 (`focus:` vs `focus-visible:`).
- 1 P1 contrast edge case: `lat-left` at 4.44:1 (needs 4.5 for text).

Batch 36's intended a11y deliverables all land cleanly against their
stated SCs. The two regressions above are the gating items — the crash
is the shipping-blocker, the DOM inversion is the reviewer-catches-in-
production item.
