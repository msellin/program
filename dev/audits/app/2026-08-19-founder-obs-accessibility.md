# Founder observations — Accessibility assessment (post-Batch-28)

**Domain:** accessibility (WCAG 2.2 AA)
**Persona artifacts:** `next-app/tests/e2e/artifacts/personas/{persona-recover,persona-strength,persona-erratic}/dom/*.html` — mtime 2026-08-19 21:19 (post-Batch-28)
**Deploy under review:** https://b4056901.program-v2.pages.dev
**Prior round:** `dev/audits/app/2026-08-19-app-audit-accessibility-batch25.md` (shipped Batch 26)
**PII scan:** none. Fixtures use `@example.test` addresses only.

---

## 0. Regression check — did Batch 26's a11y fixes hold?

Every P1 that landed in Batch 26 remains in place after Batches 27 + 28:

| Batch-26 item | SC | Verified where | Status |
|---|---|---|---|
| P1-56 Skip link | 2.4.1 | `AppShell.tsx:125-130` + `id="main-content"` at `:175` — DOM confirms across all 3 persona `01-today.html` captures | held |
| P1-57 h1→h3 skip fixed | 1.3.1, 2.4.6 | ProposalCard now emits `<h2>` (persona-strength Today: `<h2 id="proposal-tm-bump:…">`), SignalCompletenessCard demoted to `<h2>` | held |
| P1-58 `aria-controls` on SignalsStrip | 4.1.2 | `SignalsStrip.tsx:234` emits `aria-controls="signals-detail"` | held |
| P1-59 `text-red-strong` token | 1.4.3 | `globals.css:34` defines `--color-red-strong: #f28068`; `page.tsx:843` uses `text-red-strong` on `bg-red/20` | held |
| P1-60 `--color-line` bump | 1.4.11 | Token updated globally | held |
| P1-61 Undo underline visibility | 1.4.1, 1.4.11 | `account/page.tsx:206` — `decoration-slate/60`, `min-h-[44px] py-2` | held |
| P1-62 MoveSheet initial focus | 2.4.3 | `MoveSheet.tsx:80-85` — `requestAnimationFrame` + `querySelector('input[type="radio"]:not(:disabled)')` on mount | held |
| P2-23 `<section aria-labelledby>` on /account | 1.3.1 | `account/page.tsx:129, 149, 174, 219` — all four groups | held |
| P2-24 Week row drop `aria-label` override | 4.1.2 | Verified against `week/page.tsx` — visible content computes | held |
| P2-25 `role="alert"` on delete + MoveSheet warning | 4.1.3 | Confirmed at both sites | held |
| P2-26 Route-mount focus to h1 | 2.4.3 | `AppShell.tsx:44` — `document.getElementById("main-content")` focus on route change | held |
| P2-27 Dead `role="gridcell"` removed | 1.3.1 | Heatmap.tsx clean | held |

**No a11y regressions from Batch 27–28.** The five P2 items in Batch 28 (P2-21..30) fixed the tap-target + section-label debt; nothing broke as collateral.

---

## 1. Observation-by-observation assessment

### O11 — Tab-name H1 removal tension

**Founder proposal:** remove `<h1>` on Today / Week / Progress / History (redundant with bottom-nav; causes tab-switch layout jump). Three reconciliation options in queue.

**Facts on the ground.** Every tab-labelled route emits an identical H1:
- `page.tsx:188` → "Today"
- `week/page.tsx:203` → "Week"
- `progress/page.tsx:149` → "Progress"
- `history/page.tsx:95` → "History"
- `profile/page.tsx:97` → "Profile"

All five use `text-[32px] font-semibold tracking-tight text-strong leading-none`. DOM captures across all three personas confirm rendering.

**WCAG bearing on the three options.**

**Option 1 (revert to `sr-only` H1).** Fully WCAG-compliant. `sr-only` H1s satisfy 1.3.1 (Info and Relationships), 2.4.6 (Headings and Labels), and 2.4.10 (Section Headings, AAA — nice to have). Screen-reader users retain the landmark; sighted users lose the redundant chrome. This is what P1-4 (Batch 18) reversed. Reverting is defensible *if* the visible-page-title role is filled by another visible element — which on Today/Week is the date rail, on Progress it's `Week of 17 Aug`, on Profile it's the identity chip.

However: **`sr-only` H1s that duplicate the tab-name serve almost no SR user** either. NVDA/JAWS/VO users already know they're on the Today tab because `<a aria-current="page">` in the bottom nav announces it, and page-title (`<title>`) is announced on route change. A tab-name-only H1 is landmark-theater — it satisfies the axe rule but adds no navigation value.

**Option 2 (H1 carries information, not tab name).** Strongest option a11y-wise. `<h1>Wednesday 19 Aug</h1>` on Today gives SR users the temporal anchor first, matches 2.4.6 ("headings…describe topic or purpose"), and eliminates the redundant announcement chain (tab-name → h1 same-tab-name → date-rail-same-date). Same principle for Week (`17 Aug → 23 Aug`) and Progress (`Week of 17 Aug`). Profile's H1 is trickier because the surface is identity, not a temporal scope — leave Profile as-is.

**Option 3 (keep + standardize spacing).** WCAG-neutral. Doesn't add or remove semantics. But it doesn't answer the founder's real complaint: the H1 tells the user nothing they don't already know from the tab.

**a11y verdict on O11.** Option 2 is defensible; Option 1 is defensible with a caveat; Option 3 papers over the diagnosis without addressing it. **My call is Option 2** — the H1 stays visible (protects P1-4's parity intent + sighted-keyboard flow), but its *content* becomes the temporal or scope anchor. Specifically:

| Route | Current H1 | Proposed H1 | Rationale |
|---|---|---|---|
| `/` | `Today` | `Wednesday 19 Aug` | Also lets the current `<p>Wednesday 19 Aug<br/>Today</p>` under the date-rail collapse to just `Today` (or vanish) |
| `/week` | `Week` | `17 Aug → 23 Aug` | Range is what the page is about |
| `/progress` | `Progress` | `Week of 17 Aug` | Already the sub-header at `progress/page.tsx` — promote it |
| `/history` | `History` | `History` OR `All logged sessions` | Least redundancy pressure — history isn't tab-name-dominant in perception |
| `/profile` | `Profile` | keep (or drop entirely — see design-lead) | Not temporal, not scope-driven. If founder wants it gone, `sr-only` is fine here |

**Do not adopt Option 1 across all five tabs.** Reverting the H1 to sr-only regresses P1-4 without adding value for SR users, and hands the visual-parity call back to Whoop/Runna/Hevy defaults where the H1 is treated as the page-title anchor.

**SC citations:**
- WCAG 2.4.6 (Headings and Labels, AA) — supports Option 2
- WCAG 1.3.1 (Info and Relationships, A) — satisfied by all three options
- WCAG 2.4.4 (Link Purpose, A) — Option 2 improves it (tab links now don't have the same accessible name as the H1 they lead to)

---

### O10b — Intake progress indicator sizing + semantics

**Founder complaint:** the `INTAKE · FIRST STRICT PULL-UP` + `SCREENING · STEP 1 OF 14` rail is 10-11 px mono-caps; wants bigger / more prominent.

**a11y verdict on the current implementation.** The semantics are already correct at `IntakeClient.tsx:828-832`:

```tsx
<div role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={total}>
```

This satisfies WCAG 4.1.2 (Name, Role, Value). A native `<progress>` element would be marginally more idiomatic (browser announces "progressbar" natively without `role=`), but the current implementation is WCAG-compliant and doesn't need to be swapped. **No a11y bug in the current code.**

**Is there a WCAG size floor?** No — WCAG 1.4.4 (Resize Text) requires the UA to zoom text without loss of function, not a specific px value. WCAG 1.4.12 (Text Spacing) is about *user overrides*, not defaults. The 10-11 px mono-caps IS legible on the two mtime-fresh 2026-08-19 captures (verified as `SCREENING · STEP 1 OF 14`), but 10 px is Terav's technical-eyebrow scale (`font-mono text-[10px] uppercase tracking-widest`) — a scale intentionally-sub-body per the type ramp locked in Batch 20 (P0-4: 32/20/15/14/12/10).

**Where a11y touches the founder's concern.** If the founder scales the *counter* up (Duolingo-style hero counter: `1 / 14` at 24 px), keep the surrounding container's `role="progressbar" aria-valuenow / aria-valuemin / aria-valuemax`. Do not fragment the semantics across two separate elements (bar vs. counter) — that produces two announcements for the same signal.

**Contrast note.** `text-muted` (foreground) on `bg-ground` (background) is 5.91:1 per the batch-25 palette table — passes AA at any size. The `text-strong` accent inside the counter is 17.57:1. Both scales up fine.

**Verdict.** No a11y intervention required for the semantic layer. Visual-craft owns the "make it bigger" call. **If bigger is chosen: keep the `role="progressbar"` wrapper intact; do NOT add a second `role="progressbar"` on the numerical counter (creates duplicate announcements).**

**SC citations:**
- WCAG 4.1.2 (Name, Role, Value) — currently satisfied
- WCAG 1.4.4 (Resize Text) — no size-floor issue

---

### O14b — Exercise-card chevron reveals only "Add note" for skill/mobility

**Founder observation:** tapping the chevron on Active hang / Band shoulder prep reveals only "Add note" — the affordance implies more.

**Root cause confirmed.** `ExerciseCard.tsx:71` defines `isLoadable = ["strength", "unilateral"].includes(exercise.category)`. Line 236 wraps the entire sets-grid + rest-timer + suggestion in `{isLoadable ? (...) : null}`. For a `skill` / `mobility` / `warmup` / `activation` exercise, the expanded body renders **only** the notes textarea + "Add note" button (lines 320-348) plus (if present) an adaptive suggestion box.

**Is this a WCAG 3.2.4 (Consistent Identification) fail?** Marginal. 3.2.4 says "components that have the same functionality within a set of Web pages are identified consistently." The chevron IS identified consistently (same glyph, same aria-controls target-id pattern). But the *behavior* differs — a strength-exercise chevron reveals set logging + rest timer; a skill-exercise chevron reveals only notes. 3.2.4 lives in Guideline 3.2 (Predictable), and this arguably fails predictability because a user learning the pattern on their first strength card develops a mental model that breaks on the next skill card.

**Verdict: not a strict WCAG 3.2.4 fail** — the SC's test is about UI *components* being identified the same way (glyph, label, position) rather than yielding *identical content*. But it IS a WCAG 3.2.4 *nudge*: the founder's complaint validates that the reveal is unpredictable to a first-time user.

**More load-bearing SC: WCAG 2.4.4 (Link Purpose, In Context).** The chevron button's accessible name computes to the exercise name (via nested `<h3>`) plus the `aria-expanded` state. A screen-reader user hears "Active hang, collapsed button" — expands it — and finds only "Add note". The purpose ambiguity is real.

**a11y fix options (ranked by defensibility):**

1. **Do not render the chevron button when `isLoadable=false` AND no adaptive suggestion is present.** Move the "Add note" affordance to a persistent secondary-action button next to the Play/Details buttons at line 201-227. Chevron becomes an "expand" affordance ONLY when there's actual body content beyond a single note field. Best 3.2.4 outcome; also cheapest.
2. **Rename the accessible name** — add `aria-label={isLoadable ? "Toggle set log" : "Toggle notes"}` on the button at line 166. Sacrifices the exercise-name-as-name pattern (currently good) for behavior clarity. Weaker.
3. **Actually expand the body content for skill/mobility** — surface last-session recall + cue text + form-check video link. Product decision, not an a11y-only call — flag as design-lead territory.

**a11y-preferred: option 1.** It removes the misleading affordance rather than papering over it.

**Screen-reader label for the chevron button (present state).** Currently the button has no explicit `aria-label`. Its accessible name is computed from the visible `<h3>{exercise.name}</h3>` plus optional cue / preview `<p>` inside — SR announces the exercise name + `aria-expanded="true|false"`. This is fine when the reveal is substantive (loadable), fails 2.4.4 (Link Purpose) when the reveal is only notes.

**SC citations:**
- WCAG 2.4.4 (Link Purpose, In Context, A) — Weak fail. The purpose of activating the control isn't discoverable from name + context when the reveal is just a note field.
- WCAG 3.2.4 (Consistent Identification, AA) — Not a strict fail (same component, same identification). But the behavior mismatch is a design/copy problem that maps to the *spirit* of 3.2.4.

**Also affects O14a truncation.** The `truncate` class on `<h3>` at line 176 doesn't affect the accessible name computation — SR gets the full exercise-name string. But the visual truncation ("Active hang (scap-en…") IS a WCAG 2.4.6 (Headings and Labels) concern: the visible heading no longer accurately describes the exercise. **Recommend `line-clamp-2`** (already flagged in queue) — restores label accuracy without breaking SR.

---

### O10c — Tier-recommendation "How this was picked" disclosure

**Founder question:** verify the disclosure is keyboard-reachable and SR-readable.

**Implementation:** `IntakeClient.tsx:539-544`:

```tsx
<details className="text-[12px] text-muted">
  <summary className="cursor-pointer hover:text-ink">
    How this was picked
  </summary>
  <p className="mt-1">Based on: {formatVars(inferred.vars)}</p>
</details>
```

**Verdict: WCAG-clean.** Native `<details>`/`<summary>` gives:
- Keyboard: Tab focuses `<summary>`; Enter/Space toggles. Built into the UA.
- SR: NVDA reads "How this was picked, button, collapsed" → expanded state announced on toggle → `<p>` content read via subsequent Tab or Read All.
- No `role=` needed. No `aria-expanded` needed. UA handles it.

**Passes:**
- WCAG 2.1.1 (Keyboard, A)
- WCAG 4.1.2 (Name, Role, Value, A)
- WCAG 2.4.3 (Focus Order, A) — natural DOM order

**Two nits (P2, don't block):**

1. **Contrast.** `text-[12px] text-muted` at 12 px on `bg-ground` — the batch-25 ratio table computes `text-muted` at 5.91:1 (`#a2a7b1` over `#0f1114`). Passes 1.4.3 for both regular (≥4.5:1) and any size below the AAA large-text threshold. Fine.

2. **Content quality.** `formatVars(inferred.vars)` returns something like `"strict_reps: 3-5, hang_seconds: unknown, physical_tests: skipped"`. This is engineering vocab leaking to the user (see O10c root cause 3 — miscalibration means the SR user hears a raw variable dump). Doesn't fail an SC, but doesn't earn a 3.3.2 (Labels or Instructions) win either. **Copy-clarity owns this.** → see app-copy-clarity.

**No a11y regression risk in the O10c disclosure.**

---

## 2. Cross-cutting nits noticed while verifying

None of these promote to master-list tasks — all are already tracked or fine.

- **`aria-live="polite"` announcer** at `<div id="app-status" aria-live="polite" aria-atomic="true" class="sr-only">` — present at load on every persona × route DOM. Continues to satisfy 4.1.3 (Status Messages).
- **`<html lang="en">`** on every capture. 3.1.1 continues to pass.
- **Skip link target `<main id="main-content" tabIndex={-1}>`** — verified in DOM at line-1 of every Today capture across all three personas.
- **ExerciseCard chevron button `aria-controls={ex-body-${blockId}-${exercise.id}}`** — good, `aria-expanded` present, matches SignalsStrip / Week-row pattern.

---

## 3. Verdicts by observation ID

| Obs | Verdict | New task ID? | Notes |
|---|---|---|---|
| O11 | **Real** — a11y-informed; recommend **Option 2** (H1 becomes date/scope, not tab name) | Yes (P1) | Design-lead brief before code — coordinate with F6 Week action-row work already shipped |
| O10a (buttons) | Not in accessibility scope → see app-mobile-ux + app-visual-craft | — | Full-width answer buttons don't hit a WCAG SC |
| O10b (progress size) | Not an a11y bug. `role="progressbar"` semantics correct. Visual-craft owns "bigger". Nudge: if scaling, do NOT duplicate the role onto a companion counter | No a11y task | Advisory-only |
| O10c (tier logic) | Disclosure is a11y-clean. Root-cause is engine, not a11y. → see engine / copy-clarity | No a11y task | Passing |
| O14a (truncation) | Real 2.4.6 nudge — visible label no longer accurately describes exercise when truncated. Fix: `line-clamp-2` | Yes (P2) | Bundled with visual-craft — Add to master list |
| O14b (chevron reveals only Add note) | Weak 2.4.4 fail — link purpose ambiguous when reveal is single note field. **Fix:** hide chevron when `!isLoadable && !suggestion`, promote "Add note" to secondary-action button row | Yes (P1) | `ExerciseCard.tsx:166-199` + `:319-348` |
| Regression check | Zero a11y regressions from Batches 27–28. All 12 Batch-26 items verified in place | — | No action |

---

## 4. Proposed master-task-list additions

**Section C (P1) — Accessibility follow-ups:**

- **P1-70 (accessibility, O11)** — H1 content refactor on tab-labelled routes. Today's H1 → date string; Week's H1 → range; Progress's H1 → `Week of {monday}`. History + Profile stay as-is (or Profile drops the H1 to `sr-only` if design-lead decides). Preserves P1-4's visible-parity intent while resolving the redundancy the founder called out. Files: `next-app/src/app/page.tsx:188`, `next-app/src/app/week/page.tsx:203`, `next-app/src/app/progress/page.tsx:149`. Coord with design-lead brief on layout jump — spacing pass same-batch. Size: M.

- **P1-71 (accessibility, O14b)** — ExerciseCard chevron on non-loadable exercises reveals only a notes field, violating link-purpose predictability (WCAG 2.4.4 nudge). Fix: when `isLoadable=false` AND no `suggestion` present, do NOT render the chevron button. Promote the "Add note" affordance to a persistent secondary-action button in the row at `ExerciseCard.tsx:201-227` (alongside Play + Details). Files: `next-app/src/components/workout/ExerciseCard.tsx:71, 166-199, 230-348`. Size: S.

**Section D (P2) — Accessibility polish:**

- **P2-31 (accessibility, O14a)** — ExerciseCard `<h3 className="truncate">` at `:174-181` truncates parenthetical modifiers on skill/mobility exercise names ("Active hang (scap-en…"). Visible label no longer accurately describes the exercise (WCAG 2.4.6 nudge). Swap `truncate` → `line-clamp-2`; verify layout doesn't shift when name wraps. Files: `next-app/src/components/workout/ExerciseCard.tsx:176`. Size: S.

**No P0s from this observation batch.** O10c is not a11y-territory (engine). O10b is visual-craft. O11 is P1 because it's a shipped promoted-visible H1 being asked to reverse — needs the design call before code, so P1 pace not P0.

---

## 5. What NOT to do (rejected reconciliations for O11)

- **Do not adopt Option 1 (revert all five H1s to `sr-only`) blanket.** Regresses P1-4 without adding SR value. The SR announcement chain of `bottom-nav a[aria-current="page"]="Today" → h1="Today" → date-rail="Wednesday 19 Aug"` is redundant BUT harmless for sighted users; making the H1 invisible-only makes the sighted-keyboard user lose the anchor without any SR benefit gained (both audiences already know the tab).
- **Do not remove `<h1>` entirely.** A route without any `<h1>` fails WCAG 2.4.6 for AT users who navigate by heading — `H` shortcut in JAWS/NVDA jumps between H1s. Losing the H1 loses navigation.
- **Do not resize the progress-indicator progressbar and then also add `role="progressbar"` to a companion `Step N of M` counter.** Two `role="progressbar"` announcements for the same signal are a 4.1.2 fail (duplicate names for the same role). If visual-craft wants a big counter, it must be `aria-hidden="true"` OR the current wrapper progressbar becomes `role="none"` and the counter carries the role — pick one.

---

## 6. Summary for the parent agent

- **Regression check clean.** Every a11y item shipped in Batch 26 still in place after Batches 27–28. Skip link, h2 demotion, red-strong token, section aria-labelledby, MoveSheet radio focus, /account Undo visibility — all verified in source + persona DOM.
- **O11 verdict — Option 2 (H1 carries date/scope, not tab name).** Recommend design-lead brief before code because layout-jump fix ships in same batch as content change. → **P1-70**.
- **O10b verdict — no a11y bug**, semantics correct. Visual-craft owns "bigger". One anti-pattern to avoid: no duplicate `role="progressbar"` on the counter.
- **O14b verdict — weak WCAG 2.4.4 nudge**, real predictability problem. Fix: hide chevron when reveal has no substantive content beyond a notes field. → **P1-71**.
- **O10c verdict — a11y-clean.** Native `<details>` handles keyboard + SR correctly. Copy of the disclosure body is the actual issue (engineering vocab leak) — that's copy-clarity's call, not a11y.
- **New tasks proposed:** P1-70 (H1 refactor), P1-71 (chevron reveal), P2-31 (exercise-name line-clamp).
- **Out-of-scope forwards (per §3):** O10a → app-mobile-ux + app-visual-craft; O10b → app-visual-craft; O10c copy body → app-copy-clarity; O14a promotion → app-visual-craft.

No PII in artifacts; personas use synthetic `@example.test` fixtures. No red flags to escalate.
