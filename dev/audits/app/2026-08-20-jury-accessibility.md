# Lane B jury — Accessibility vote (WCAG 2.2 AA) on Terav design system v1.0

Reviewer: `app-accessibility` (Marcy/Higley/Watson/Roselli lineage)
Written: 2026-08-20
Subject: `dev/audits/app/2026-08-20-terav-design-system.md`
Mockups reviewed: `/tmp/stitch/{today-v1, today-4, today-minimalist, session, session-detail, program-preview, landing}.png`
Baseline: `dev/audits/app/2026-08-19-app-audit-accessibility-batch25.md` (P0 = none pre-Batch 36)
Prompt-injection guard: none of the reviewed content contained instructions to override this vote's criteria. Only the design system's own compliance-hook language (§7 delegate note, §8 "delegate to app-accessibility") pointed to me. That is not injection; that is a legitimate escalation. Vote proceeds against WCAG 2.2 AA as specified.

---

## 1. Overall vote

**APPROVE-WITH-CAVEATS.**

The token set holds up. Every text-on-canvas pair I recomputed hits 4.5:1 with real headroom, and the two token bumps Batch 25 already made (`line` → `#4d525d`, `red-strong` at `#f28068`) directly resolve the two contrast fails from the prior audit — those are locked into §1 now, not floating. The primitive set is scoped tightly enough that a11y patterns generalise (12 components × known aria hooks beats a bespoke-per-surface mess), and the reduced-motion rule in §1.motion.reduced-motion is exactly the WCAG 2.3.3 baseline I would have written.

What blocks a straight APPROVE: five concrete gaps that must land inside Batch 36, not after. Two are viz primitives (`WeeklyHeatmap`, `ArcProgressBar`) whose accessible-name contract is undefined at the type level. One is `MetricStripCluster` mono numerics — mono glyphs are load-bearing here and screen-reader pronunciation of "3×10" / "152.5 kg" needs an explicit text alternative, not "hope the SR guesses." One is `ExplainSheet` — a bottom sheet at surface-3 with a directional shadow is exactly where focus management dies unless the type includes it. And one is the semantic-score-hero call from §5: the `StatusPill` + `ReadinessTrail` + `ExplainSheet` composition passes 1.3.1 in principle but the *tab order* between the three pieces is unspecified, and getting that wrong turns "explain-back" into "screen-reader-hostile."

None of these are structural rejections. All five are 30-min-to-4h fixes that fit inside the ~121h Batch 36 appetite. Miss them and Terav ships a11y regressions dressed as a systemisation win.

---

## 2. Token contrast — recomputed against §1 palette

Every text token against every surface. `Pass` = WCAG 1.4.3 body threshold 4.5:1. Non-text tokens against threshold 3:1 (WCAG 1.4.11).

| Fg token | vs ground #0e0f12 | vs surface #16181c | vs surface-2 #20232a | vs surface-3 #2a2e37 | Verdict |
|---|---:|---:|---:|---:|---|
| strong #f4f5f7 | 17.57 | 16.29 | 14.42 | 12.46 | pass everywhere |
| ink #d6d9de | 13.54 | 12.56 | 11.11 | 9.61 | pass everywhere |
| muted #8a8f9a | 5.91 | 5.48 | 4.85 | **4.19** | fails 4.5:1 on surface-3 (sheets/modals) |
| bronze #c89666 | 7.31 | 6.78 | 6.00 | 5.19 | pass everywhere (CTA text) |
| bronze-hi #e2b686 | 10.28 | 9.54 | 8.44 | 7.30 | pass everywhere |
| slate #79b8c4 | 8.64 | 8.01 | 7.09 | 6.13 | pass everywhere |
| green #5fb37a | 7.50 | 6.95 | 6.15 | 5.32 | pass everywhere |
| amber #e0a63a | 8.84 | 8.20 | 7.25 | 6.27 | pass everywhere |
| red #e5654b | 5.74 | 5.33 | 4.71 | **4.08** | fails 4.5:1 on surface-3 |
| red-strong #f28068 | 7.36 | 6.82 | 6.04 | 5.22 | pass everywhere |
| lat-left #4a8894 | 4.78 | 4.44 | 3.92 | 3.39 | **fails as body on surface + surface-2 + surface-3** |
| lat-right #a279a8 | 5.33 | 4.94 | 4.37 | 3.78 | fails on surface-2 + surface-3 |
| **line #4d525d** | 2.45 | 2.27 | 2.01 | 1.74 | **fails 1.4.11 as focusable border on every surface** |
| line-soft #24272f | 1.28 | 1.19 | 1.05 | 1.10 | expected — divider only, not interactive |

**Composite (tint chips, alpha 20% over ground):**

| Chip | Ratio | Verdict |
|---|---:|---|
| green on green/20 | 5.51 | pass |
| amber on amber/20 | 6.21 | pass |
| amber-strong on amber-strong/20 | 7.18 | pass |
| red on red/20 | **4.50** | pass at boundary (was 4.12 pre-Batch 25 — token bump earned it) |
| red-strong on red-strong/20 | 5.47 | pass |
| slate on slate/20 | 6.12 | pass |
| bronze on bronze/20 | 5.36 | pass |

**Contrast findings (must fix inside Batch 36):**

- **C1 (SC 1.4.11 Non-text Contrast):** `line #4d525d` reaches only 2.45 on ground and 2.27 on surface. This is 0.55–0.73 short of 3:1. The Batch 25 bump moved it from 1.82 to 2.45 — closer, but still non-compliant. If `line` is used as an *interactive-boundary* (input border, StatusPill outline, MetricStripCluster cell divider that carries meaning), it fails. **Fix:** raise `line` to `#5f6570` (computes ~3.16 on ground, ~2.93 on surface — still marginal on surface, so pair with the "inputs sit on ground" rule from batch 25 §4). Alternative: keep `line` as pure decoration and introduce `line-strong #6b717d` (~4.0 on ground) for anywhere a border carries semantic weight (input, StatusPill outline, arc-progress rest color).

- **C2 (SC 1.4.3 Text Contrast):** `muted` on `surface-3` computes 4.19, below 4.5:1. `surface-3` is exclusively `ExplainSheet` + modals per §1 elevation. If muted body copy is used inside ExplainSheet (source-attribution, timestamps, log-signal captions — very likely per §2.11), it fails. **Fix:** either forbid `muted` on `surface-3` (spec it in ExplainSheet primitive — captions must resolve to `ink`, not `muted`), or bump `muted` one step to `#93989f` (~4.60 on surface-3, ~5.18 on surface-2 — validate does not collapse into ink).

- **C3 (SC 1.4.3 Text Contrast):** `red` on `surface-3` is 4.08. Same fix pattern — inside ExplainSheet, red text must be `red-strong` (5.22 on surface-3), not `red`. Add an explicit doc line in §2.11: *"ExplainSheet on-tint colors escalate to `-strong` variants."*

- **C4 (SC 1.4.3 Text Contrast):** `lat-left` `#4a8894` fails as body on `surface` (4.44) and every surface above. Documented use is "L/R visual marks in rehab tracks" — so if `lat-left` is only ever a dot/mark and never body text, this is compliant. **Fix (doc-only):** §1 must say `lat-left` and `lat-right` are non-text-only tokens (SC 1.4.11 3:1 target, which they meet on ground and surface). If any surface uses "L" / "R" as a text glyph in one of these colors, promote the text to `slate`/`bronze-hi` and keep the dot in `lat-*`.

Everything else in the token set is comfortable. The palette is well-behaved on ground and surface. surface-3 is the risky elevation because it's darker than most dark UI expects (`#2a2e37` still carries less luminance than `#333` which most systems target for modal), so text tokens against it need extra vigilance — the fix is captured in C2 + C3.

---

## 3. Semantic-score-hero (§5) — 1.3.1 + 4.1.2 verdict

The composition (ReadinessTrail sparkline + WorkoutHero with StatusPill in eyebrow + ExplainSheet tap-target) is **the correct anti-Whoop pattern for a11y**, provided the DOM and ARIA relationships below are wired. If they aren't, this collapses into a decorative pill next to some decorative dots.

**1.3.1 Info & Relationships (Level A):**

- ReadinessTrail must render as `role="img"` with `aria-label` computed from the reading window ("30-day readiness trail: 4 red, 8 amber, 18 green — improving trend"). Do NOT render as a bare SVG. This is `Heatmap.tsx:{live}` precedent from batch 25.
- StatusPill must render as `role="status"` with `aria-live="polite"` on the container that persists across mounts. Do NOT inject the pill fresh each render — SR misses live-region announcements from freshly-mounted nodes. The primitive spec at §2.12 does not say `role="status"` — add it.
- The ExplainSheet trigger must be `<button>`, not the pill itself if the pill is `role="status"`. Two options: (a) pill is `role="button"` with `aria-live="polite"` (compound and lint-warned but permitted by ARIA 1.2), or (b) an adjacent icon-only "why this?" button next to the pill. Recommend (b) — cleaner semantics, keyboard-affordance is unambiguous.

**4.1.2 Name, Role, Value:**

- Pill accessible name = full label ("WORKOUT READY", "CHECK FIRST", "MOVED FROM TUE"). Do not compress to abbreviations for SR.
- Pill value = the tone conveys nothing to SR without name; a green dot inside the pill needs `aria-hidden="true"` on the dot itself so the pill's name isn't announced twice ("green dot workout ready").
- Sparkline value = the `ariaLabel: string` in `SparklineProps` is required per §2.3 — good. But it must include the numeric summary ("readings 4 3 3 5 6 6 7 — trending up"), not a lede ("your recent readiness").

**Tab order:**

- The §5 composition renders sparkline **above** WorkoutHero in the visual layout. DOM order (and therefore tab order) must match: sparkline first, then WorkoutHero eyebrow row (pill + why-this button), then title, then metric strip, then primary CTA. Getting this backwards puts the CTA in the tab flow before the state indicator that governs whether the user should tap it — hostile.
- StatusPill's why-this button and the ReadinessTrail's tap-to-open both open the same ExplainSheet with different `trigger` values. That means two focusable elements go to the same sheet. Fine — but the SR user needs distinct accessible names ("Why workout ready?" vs "Open readiness trail history"). Do not label both "Why this?"

**Verdict on §5:** the composition passes 1.3.1 and 4.1.2 **only if** §2.12 StatusPill spec adds `role="status"`, §2.4 ReadinessTrail spec adds `role="img"` + required `ariaLabel`, and the ExplainSheet trigger is a separate button element. Add these to the primitive type contracts before Batch 36 wires anything.

---

## 4. Per-primitive verdict

Each of the 12 primitives, plus can-it-be-accessible-with-current-design.

- **DashboardBlock (§2.1)** — Passable. `title` is the accessible name of the block; must render as `<section aria-labelledby={id}>` with the `<h3>` (or `<h2>` per heading hierarchy) getting the `id`. The `primaryCta` needs `aria-describedby` pointing to `lede` if lede is present (SR context). Spec addition: `headingLevel?: 2|3` prop so hierarchy stays flat where DashboardBlock is nested inside WorkoutHero. **Verdict: accessible.**
- **WorkoutHero (§2.2)** — Passable but under-specified. Missing: `<h2>` or `<h1>` for `title` (which level depends on surface — on Today it's the h1, on `/session/[slug]` it's the h1, on Progress retest-week it's an h2, on Preview it's an h2). Add `headingLevel` prop. `blocks` prop renders a list — `<ol>` with `<li>` per block, do not use `<div role="list">`. **Verdict: accessible with headingLevel prop + ordered-list markup.**
- **Sparkline (§2.3)** — Type already requires `ariaLabel: string`. Good. Must render `role="img"`. `targetValue` when shown must appear in the aria-label ("target 5 crossed at day 4"). **Verdict: accessible as spec'd.**
- **ReadinessTrail (§2.4)** — Type spec requires `ariaLabel`. Good. Must render `role="img"`. If cells are individually tappable (they are — §7 mentions tap-to-open per-cell), each cell must be a `<button>` inside the `role="img"` container OR the whole component escalates to `role="group"` with per-cell `<button aria-label="{date}: {state}">`. Design system doc does not currently specify per-cell interactivity for ReadinessTrail — clarify: interactive or not? If interactive, cells need 44×44 (see mobile-ux) *and* individual accessible names. **Verdict: accessible only after the interactive/non-interactive decision is made.**
- **WeeklySessionStrip (§2.5)** — 7 cells is the whole thing. If `onCellTap` is defined, each cell is `<button aria-label="Tuesday: completed" aria-current={isToday?'date':undefined}>` with pressed state via `aria-pressed` for completed. If `onCellTap` is undefined, wrap in `role="img" aria-label="Week strip: Mon done, Tue done, Wed rest, Thu today, Fri scheduled, Sat scheduled, Sun rest"`. **Verdict: accessible.**
- **ArcProgressBar (§2.6)** — This is the one primitive whose type spec has **no aria-label field at all**. Every progress-bar-shaped element must be `role="progressbar"` with `aria-valuenow={weekCurrent} aria-valuemin={0} aria-valuemax={weekTotal} aria-label="{programName} progress"`. Diamond retest waypoints per §3 Progress must also carry accessible names — either as siblings inside `role="group"` or via `aria-describedby`. **Verdict: current spec CANNOT be made accessible. Fix in primitive contract before build.**
- **MetricStripCluster (§2.7)** — Three cells of label + value + optional hint. Semantic markup: `<dl>` with three `<dt>` (label, mono-caps) + `<dd>` (value, mono-numeric) pairs, OR a `role="group" aria-label="Session metrics"` with each cell semantically `<div>` containing label + value. `<dl>` is cleanest. **Mono numeric text alternative:** an SR reads "3 × 12" as "three times twelve" — usually correct. "48 min" as "forty eight minute" — correct. "152.5 kg" as "one hundred fifty two point five kilograms" — correct. Do NOT abbreviate to "3×12" using the × glyph (U+00D7) — some SRs (JAWS default) read "3 X 12". Use "3 × 12" with the glyph and ADD an `aria-label="3 sets of 12"` on the cell as a text alternative. Same for "×" separators anywhere. **Verdict: accessible with `<dl>` markup + explicit aria-label on cells containing × glyphs.**
- **CategoryTileGrid (§2.8)** — 2×2 or 2×3 grid of `<button>` tiles. Each tile's accessible name = "{name}: {pitch}, {count} available". Do not rely on `glyph` — glyph is decorative, aria-hidden. `role="grid"` is NOT correct here (grid ≠ tile grid semantically) — use `<ul>` with `<li>` per tile. **Verdict: accessible.**
- **WeeklyHeatmap (§2.9)** — 84 cells. Precedent from batch 25 (`Heatmap.tsx:{live}`) is `role="img"` + summary aria-label + interactive cells as `<button aria-label>`. Type spec at §2.9 has no `ariaLabel` field. **Fix in primitive contract:** add `ariaLabel: string` (required), spec the summary format ("12 weeks of session state: 45 done-good, 12 amber, 8 red, 19 missed, 2 rest scheduled"). Per-cell button `aria-label="{date}: {sessionState}"`. **Verdict: current spec CANNOT be made accessible without ariaLabel prop.**
- **OutcomeBar (§2.10)** — Baseline → target visualization. `role="img" aria-label="{metricName}: baseline {baselineValue}, target {targetValue}. {rangeCaption}"`. Static, no interaction, so no focus concern. **Verdict: accessible.**
- **ExplainSheet (§2.11)** — Bottom sheet at e3 (surface-3). Must implement dialog semantics: `role="dialog" aria-modal="true" aria-labelledby={titleId}`, focus trap on open (use existing `useFocusTrap` per batch 25), focus restore to invoking element on close, Escape closes, dismiss button labeled "Close" (not "×"). Type spec at §2.11 has no `onClose` or focus-management field. **Fix in primitive contract:** add `onClose: () => void` + document dialog contract. **Verdict: accessible only after focus-management + dialog contract added to primitive spec.**
- **StatusPill (§2.12)** — Already covered in §3 above. Add `role="status"` when the pill represents a state (readiness), OR `role="button"` when the pill is a filter chip / interactive selector. Type spec must reflect: `interactive?: boolean`. **Verdict: accessible with role clarification.**

**Summary — 3 of 12 primitives currently CANNOT be made accessible with the type spec as written:** ArcProgressBar (missing progressbar role + aria-valuenow), WeeklyHeatmap (missing ariaLabel), ExplainSheet (missing dialog contract). Fix in primitive contract before build.

---

## 5. Per-surface a11y walk (mockups)

### Today (`today-v1.png`, `today-4.png`, `today-minimalist.png`)

Focus visibility: the mockups render no focus states (Stitch limitation). Assume the shipped `focus-visible:` ring from globals.css carries (bronze on ground = 7.31, comfortably 3:1 for non-text). **Cannot verify from mockup — flag for post-Batch 36 verification.**

Heading hierarchy per mockup:
- `today-v1.png`: "Today" (h1, 32px strong) → "3 blocks · 12 exercises · 48 min" (h3-card, appears to be h2 semantically per WorkoutHero title) → "8 drills available" (h3? h2?). Order looks correct if WorkoutHero title is h2 and Extras title is h2. Confirm in code.
- `today-minimalist.png`: adds a "GREEN — Progress load. Nothing above 3/10." Row — this is the StatusPill + explain composition. Correct visual, requires the aria-wiring from §3.
- `today-4.png`: pill reads "GREEN · PROGRESS LOAD" directly under "Today" h1. Reasonable — pill needs `role="status"` per §3.

Sparkline in `today-v1.png` shows dots in the top-right corner (readiness trail). SR needs the ariaLabel summary — required by §2.3, will pass if wired.

Bottom nav in all three mockups shows "Today / Week / Progress / Profile" with icons above labels. Icons must be `aria-hidden="true"`; nav must be `<nav aria-label="Primary">` (batch 25 confirmed present, keep). Active tab needs `aria-current="page"` (batch 25 confirmed present).

44×44 tap targets — delegate to `app-mobile-ux`, but the "Open session →" bronze CTA in `today-v1.png` looks ~48px tall on 393px viewport — pass. WorkoutHero block list rows (`A Primary Strength` etc.) — if tappable, must be 44×44; if not tappable, no requirement. Not clear from mockup which they are.

### Session (`session.png`, `session-detail.png`)

`session.png` — "Back to Today" is a back-nav link (should be `<a href>` not `<button>` unless it triggers `router.back()` — in which case `<button>`). Accessible name "Back to Today" is complete. Pass.

"Focus session" h1 followed by "Engine Builder — Block 1" caption. Correct hierarchy.

Block cards with mono-numeric "3:00 / Z2", "2 × 15", "2 × 8 / leg" — every one of these needs a text alternative per §4 MetricStripCluster (aria-label="3 minutes at Zone 2", "2 sets of 15", "2 sets of 8 per leg"). Do not rely on SR to parse "×" and "/" correctly.

Checkbox-shaped completion circles on the right — if these are `<input type="checkbox">`, the label must be the exercise name + set-rep spec (Cassock Squats: 2 sets of 8 per leg). If they're custom `<button aria-pressed>`, same accessible name. Do not render as unlabeled circles.

`session-detail.png` — "SKIP SESSION" and "MOVE DAY" buttons at bottom are text-only outline buttons. Must have visible focus rings + accessible names (they have text — pass). "START BLOCK" bronze CTA — same.

### Programs preview (`program-preview.png`)

Back arrow ("arrow_back") next to compressed "All programs Strength" label — this reads like a Material Icons string leaked through. If that's the shipped composition, it's an a11y failure — icon name must not be rendered as text. Likely a Stitch export artifact, not the shipped intent. Flag to visual-craft to verify.

"REFRESHED" StatusPill with slate tone — role="status" per §3. Good.

"First Strict Pull-Up" — h1. "Hang → Assisted → First Rep → Volume" — progression breadcrumb, should be `<ol aria-label="Program progression">` with `<li>` per step. Do not render as inline text with arrows if the progression is semantically ordered.

"What this is / What you'll achieve / What it takes / Adapts to you" — 4 DashboardBlock instances, each with h2/h3 title and body. Correct pattern.

"Duration 6 weeks · Difficulty Intermediate · Levels 3 phases" — MetricStripCluster. Same aria-label rule per §4 MetricStripCluster verdict.

"Make this my focus" — bronze CTA at bottom. Accessible name complete. Visible from thumb zone. Pass.

### Landing (`landing.png`)

Landing is out of scope per §8 of the design system doc ("Landing site — separate system"). Delegated to `landing-conversion-strategist`. Skipping.

---

## 6. Motion & reduced-motion (SC 2.3.3, 2.2.2)

The §1.motion.reduced-motion block is exactly the WCAG 2.3.3 pattern: duration collapses to 0.01ms (preserves transition-end events, per web.dev), opacity keeps, transforms/scale/auto-play removed, data-viz reveals fall to final frame. This is baseline-correct.

Two additions I want in the doc:

- **M1 (SC 2.2.2 Pause, Stop, Hide):** The market-research §6 "number breathes" pattern (4s slow pulse on primary hero) — if it ships in the reduced-motion block, it collapses. Good. But if it doesn't ship, no problem. If it *does* ship, spec explicitly: "the breathing pulse is opacity-only (no scale), and prefers-reduced-motion halts it at 100% opacity, not mid-cycle." Otherwise reduced-motion users see the pulse frozen at 60% opacity — which reads as "faded UI."
- **M2 (SC 2.2.2):** The `stagger-cascade: 50ms` cascade on card mount — under reduced-motion, this must render all cards instantly at final position. Not "instant with 50ms stagger still" — no stagger at all. Codify in the reduced-motion block explicitly.

The haptic block is a11y-neutral (haptic keeps per §1.motion.reduced-motion — correct, per current guidance).

---

## 7. Focus order & focus visibility

Focus visibility (SC 2.4.7 + 2.4.11 Focus Not Obscured): the token set does not currently define a focus-ring token explicitly. Batch 25 audit confirmed `focus-visible:` rings paired with `outline-none` throughout. The design system doc §1 elevation tokens don't mention focus. **Add a `focus` sub-section to §1:**

```yaml
focus:
  ring-color:  bronze
  ring-width:  2px
  ring-offset: 2px
  ring-style:  solid
  # rule: outline-none is ONLY permitted when :focus-visible replaces it.
  # WCAG 2.4.11: focus indicator must not be clipped by scroll container or sticky element.
```

Also: bronze focus ring at 2px on ground = 7.31 contrast (comfortably above 3:1 for non-text). On surface-3 (sheets) = 5.19 — pass. Good across every elevation.

Focus order per surface — must be top-to-bottom, left-to-right, respecting DOM order = visual order:
- Today: sparkline (if interactive) → StatusPill's why-this button → WorkoutHero title (not focusable) → MetricStripCluster (not focusable) → block list (if not interactive: skip) → primary CTA → Extras tiles → bottom nav.
- Session: back button → session title (not focusable) → block-open buttons → per-exercise complete toggles → SKIP / MOVE / START BLOCK → bottom nav.
- Preview: back → refreshed pill (status, not focusable) → title → progression steps (if interactive) → DashboardBlock content (skimmed by SR reading order) → bronze CTA.

None of these are wildly complex, but the design system doc should specify DOM-order = visual-order as an invariant. Add to §7 fail-states: "Any surface where DOM order and visual order diverge — a11y breach."

---

## 8. Skip link (SC 2.4.1 Bypass Blocks)

Batch 25 P1 finding was "no skip link on any authenticated route." Recommended fix was documented. If Batch 36 does not include the skip link — and the design system doc does not currently mention it — it ships with the same P1 still open. **Add to §2 primitives:** either as part of an AppShell wrapper spec (not currently in the primitive list), or as a required accessory to WorkoutHero on landing surfaces. Prefer AppShell — the skip link is one line of code that lives above the header, not per-primitive.

---

## 9. Fail states from §7 — my a11y additions

The §7 jury fail states list (score-hero as ring, streak language, competing CTAs) is complete on the *design* axis. On the *a11y* axis add:

- Any viz element with no `ariaLabel` prop — a11y breach (currently: ArcProgressBar, WeeklyHeatmap).
- Any interactive primitive with no visible focus state on 393×852 mobile — 2.4.7 breach.
- Any dialog/sheet without focus trap + Escape + focus restore — 2.4.3 breach.
- Any StatusPill or state indicator without `role="status"` on the container that persists across mounts — 4.1.2 + 4.1.3 breach.
- Any mono-numeric composite (`3 × 12`, `152.5 kg`) with no explicit text alternative — 1.1.1 breach.
- Any bottom nav item without `aria-current="page"` on the active — 1.3.1 breach (batch 25 confirmed correct today; must persist).

---

## 10. What to add to the design system doc before Batch 36 ships

Concrete, minimal additions the design system doc needs so accessibility is a contract, not a hope:

1. **§1.motion.reduced-motion** — add "stagger-cascade collapses to 0ms, breathing pulse halts at 100% opacity."
2. **§1** — add a `focus` sub-block with ring-color/width/offset tokens.
3. **§1.color** — add `line-strong` token (~`#6b717d`) OR raise `line` to `#5f6570`; document that `lat-left` / `lat-right` are non-text-only.
4. **§2.4 ReadinessTrail** — declare whether cells are interactive; if yes, per-cell aria-label spec.
5. **§2.6 ArcProgressBar** — add `role="progressbar"` + `aria-valuenow` + `aria-valuemax` + `ariaLabel` to type spec.
6. **§2.9 WeeklyHeatmap** — add `ariaLabel: string` (required) to type spec; document summary format.
7. **§2.11 ExplainSheet** — add `onClose` prop + document dialog contract (role="dialog", aria-modal, focus trap, Escape, focus restore).
8. **§2.12 StatusPill** — add `role="status"` when state, `role="button"` when interactive; add `interactive?: boolean` prop.
9. **§2.7 MetricStripCluster** — spec `<dl>` markup + require aria-label on any cell containing `×` or `/` glyphs.
10. **New primitive AppShell** (or add to existing chrome docs) — skip link contract.
11. **§7** — add DOM-order = visual-order invariant to fail states.
12. **§7** — add the six a11y fail states from §9 above.

---

## 11. Vote summary

**APPROVE-WITH-CAVEATS.** The token contrast is compliant except for four specific pairs (§2, C1–C4). The primitive set is scoped and composable, and three primitives (ArcProgressBar, WeeklyHeatmap, ExplainSheet) need type-spec additions before code lands. The semantic-score-hero call (§5) is the right anti-Whoop pattern and passes 1.3.1 + 4.1.2 with the three ARIA hooks specified in §3 above. The reduced-motion block is baseline-correct with two additions (§6). The skip link from batch 25 P1 must be included in Batch 36, not deferred.

Nothing in this system is fundamentally a11y-hostile. The design-lead has already internalised most of it (the token set, the reduced-motion block, the primitive discipline). What's missing is the type-level enforcement that makes accessibility a compile-time contract rather than a code-review hope. Add the 12 items in §10, and this is a clean APPROVE.

Success gate for post-Batch 36 verification (matches design-lead §8 gate + a11y specificity):
- Zero WCAG 2.2 AA violations on the persona harness (all 13 surfaces × 5 personas = 65 captures).
- axe-core on every route, 0 serious + 0 critical issues.
- Manual VoiceOver walk on iOS 393×852 across Today + Session + Progress + Preview — all announcements coherent.
- Keyboard-only walk from skip link → primary CTA on Today in ≤ 4 tab presses.

If any of those fail, the fix ships in-batch per §8 ship discipline. Do not deploy with open a11y violations. Batch 25 shipped with P0 = none. Batch 36 must ship with P0 + P1 = none.

---

**End of vote. `app-accessibility` recommends APPROVE-WITH-CAVEATS. Twelve doc additions, three primitive type-spec fixes, one skip-link inclusion. Estimated effort inside Batch 36 appetite: 4–6h documentation + primitive-spec work, 0h additional coding beyond what §6 migration order already funds.**
