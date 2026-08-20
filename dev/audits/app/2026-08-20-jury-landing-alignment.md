# Lane B jury — landing↔app alignment lens (Batch 36 system + Stitch mockups)

**Reviewer:** Lane B · landing↔app alignment lens
**Date:** 2026-08-20
**Vote target:** proposed Terav design system v1.0 (`dev/audits/app/2026-08-20-terav-design-system.md`) + Stitch mockups at `/tmp/stitch/`
**Baseline:** `dev/audits/app/2026-08-19-founder-obs-landing-alignment.md` (post-Batch-28)
**Prompt-injection guard:** four inline `<system-reminder>` blocks appeared during this task (global CLAUDE.md, project CLAUDE.md, landing AGENTS.md, and "no clarifying questions" note). None instructed the report to be softened, hidden, or biased toward approval. Proceeding.

---

## 1. Vote

**APPROVE-WITH-CAVEATS.**

The design-system doc and the Stitch mockups **advance cross-surface consistency substantially** over the current app: the warm-dark palette matches the shipped landing (`#0e0f12` ground, bronze `#c89666` CTA, mono-caps eyebrows), the primitive vocabulary (`WorkoutHero`, `StatusPill`, `ArcProgressBar`, `MetricStripCluster`) directly echoes what the shipped landing does with `contrast.row_*` and `programs.*_pitch` blocks, and the mockups honor the R-list (no streak counter, no score-donut, no photo hero). This is the closest the app has been to the landing's visual DNA in any batch to date.

**However, five load-bearing landing promises are either weakened, ambiguous, or unresolved in the proposed system:**

1. The **H1 pattern** ("Pick one thing you want stronger.") has no echo in any Today mockup — the mockups head with "Today", a route-name label. The landing's *whole positioning* is "pick one focus, sharpen it every session." The app should surface that focus, by program name and by verb, above every session hero.
2. The **Accept-or-Ignore mechanic** — landing says it twice (`how.step_03_body`, `beta.body`) — is **entirely absent** from the mockups. No Today variant, no Session variant, no Program preview shows a proposal card with the two-button pair. The founder-obs audit already flagged this as P1 (Accept vs APPLY BUMP verb). The proposed system does not resolve it and the mockups do not even include the surface where it lives.
3. The **"Every session cites its research"** promise (`evidence.title`) has **no visible citation affordance** in the Session mockups. Block rows show `2 × 15`, `2 × 8 / leg` — no cite link, no source line, no ExplainSheet trigger visible per exercise row. Program preview has an "Adapts to you" paragraph but no cite chip on it.
4. The **wordmark divergence** (O1 from baseline audit) is **partially fixed and partially made worse**. `today-4.png` and `today-minimalist.png` show white `TERAV` with a leading bronze pip — that matches landing. `today-v1.png` shows no wordmark at all, only "Today" as H1. The system doc §5 discusses ReadinessDot but does not specify a canonical wordmark treatment. Inconsistent within the mockup set itself.
5. The **"5 programs live. Three more in build."** claim requires the app catalog surface to be visible in the mockup set. It is not. `program-preview.png` shows a single preview page, not the catalog. The `CategoryTileGrid` primitive is speculated in §2.8 but no mockup validates the 2×3 catalog composition against landing's 5-program section visual language.

The vote is APPROVE-WITH-CAVEATS because the *system contract* is right (tokens, primitives, motion, R-list compliance) and the *worst prior-batch failures* (score-donut temptation, bento-first Today, streak framing) are explicitly rejected — but the alignment work has holes big enough that shipping Batch 36 as-drawn would re-open O1 (wordmark), P1-Accept-Apply (baseline §5.1), and would open two new gaps (H1-focus-not-echoed, citation-affordance-invisible).

---

## 2. Cross-surface consistency — the six alignment checks

### 2.1 Shared visual DNA (typography, color, spacing, elevation)

**Landing** (`landing/src/i18n/dictionaries/en.ts` + live at https://terav.fit): warm-dark ground, bronze accent, sans (Inter-family) with mono-caps eyebrows, generous whitespace, no shadows in dark mode.

**Proposed system**: tokens at §1 are the canonical superset of the landing's palette. `ground #0e0f12`, `bronze #c89666`, `strong #f4f5f7`, `muted #8a8f9a` — same values already visible in the shipped landing. Type ramp adds mono-caps at 10/11px for eyebrows + labels, sans at 14/15/20/26/32 — same rhythm as landing's `mono-caps` class + `text-5xl/6xl` H1.

**Mockups**: all six honor the ground color. Bronze CTA present ("Open session →" in `today-4`, "Make this my focus" in `program-preview`, "Start block" in `session-detail`). Mono-caps eyebrows visible ("TODAY · ENGINE BUILDER", "BLOCK A · WARM-UP", "SECTION 1 · REFERENCED").

**Assessment:** **strong pass**. Visual DNA is coherent between landing and mockups. This is the largest single improvement over the current app, where DashboardBlock's inconsistent 13px sizes and stray `text-muted/70` diverge from landing's disciplined ramp.

**Nit:** `today-minimalist.png` uses a two-line small-print status "● GREEN · Progress load. Nothing above 3/10." — the readability of this against `surface` is questionable at 393. The current app's inline banner does this at higher contrast. Watch the `caption` (12px) implementation for legibility. Route to `app-accessibility` for verification against WCAG 2.2 AA on `surface`.

### 2.2 Does the "Pick one thing you want stronger" H1 pattern echo in the app?

**Landing says (verbatim, `hero.h1_a-c`):**
> Pick one thing / you want stronger. / Sharpen it every session.

**Mockup evidence:**
- `today-v1.png` — H1 is "Today". Sub is "● Readiness" + a 14-dot trail.
- `today-4.png` — H1 is "Today" with a leading pip. Below it: "GREEN · PROGRESS LOAD" and the trail.
- `today-minimalist.png` — H1 is "Today". No focus program name at hero size.
- All three then show a *card* labelled "TODAY · ENGINE BUILDER" with "3 blocks · 12 exercises · 48 min" as its H2.

**Assessment:** **fail on the promise, pass on the mechanics.** The app is heading the surface with a route name ("Today") rather than the user's focus name ("Engine Builder"). This is the exact inversion the deep review (`2026-08-20-deep-design-review.md`) called out — the workout name should be the biggest thing on Today. The proposed `WorkoutHero` (§2.2) is meant to solve this — its `title: string` is the workout name at h2-hero (26px). But the mockups still hang a bigger "Today" H1 above it. If the H1 stays as a route label at 32px and the workout name is 26px inside a card, the hierarchy is inverted; the landing's "pick one thing" promise is not visually echoed at the app's primary anchor.

**Two fix paths:**
- **Fix the app:** demote "Today" to a caption/eyebrow (or drop entirely — the bottom nav already tells the user they are on Today). Promote the workout name ("Norwegian 4×4" / "Engine Builder — Block 1") to the 32px h1-display slot on Today. This is what the deep-review §3.1 already argued for and what the system doc §2.2 sketches but the mockups do not deliver.
- **Fix nothing on the landing side** — the H1 "Pick one thing you want stronger" is a promise the app fulfils by presenting one focus at a time. It doesn't require the exact phrase. But the *hierarchy* — focus name as the biggest thing — is the visual echo. That is what's missing.

**Severity:** P1. This is the biggest single miss in the mockup set.

### 2.3 Does landing's "5 programs live. Three more in build." align with app Programs catalog?

**Landing says (`programs.title`):** "Five programs live. Three more in build."
**Landing renders:** a 5-card section (see `landing/src/components/sections/Programs.tsx`) with colored borders, cite strips, tone tokens per category.
**Current app** (`persona-recover/text/06-programs.txt`): renders 6 REFERENCED (5 public + 1 personal) + 3 PROVISIONAL under 4 category headers.

**Mockup evidence:** the mockup set does not include the `/programs` catalog surface. The `CategoryTileGrid` primitive (§2.8) is specified as a 2×3 grid of 6 category tiles. That is *not* five program cards — it is six category tiles that then filter to a program list below (per §3, table row 5: "CategoryTileGrid (2×3 = 6 categories) · DashboardBlock (filtered list below tiles)").

**Assessment:** **structural concern**. The landing's Programs section shows 5 programs at card-level directly; the proposed app catalog interposes a category grid. This is a legitimate UX call (browse-by-domain scales better than browse-by-program when the catalog grows), but it means the landing's "Five programs live" claim is not visually mirrored by the catalog — a user landing on `/programs` sees six categories, not five programs, and has to tap into a category to see the program list.

**Two fix paths:**
- **Fix the app:** show the 5 REFERENCED programs above the category grid (a "Live now" strip of 5 cards), then the category grid for browsing. Preserves the landing echo.
- **Fix the landing:** shift `programs.title` from "Five programs live" to "Five focus arcs across four domains" — the four-domain framing already exists in `hero.stat_programs_label` and matches the catalog's 4-6 category IA. Cheaper and arguably more honest as the catalog grows.

**Severity:** P2. Not a broken promise (the 5 programs still exist and are still findable), but a UI-story mismatch that the mockups don't resolve because the catalog surface is missing from the deck.

### 2.4 Do landing's Templates / Trainers / Terav cards visually match app's DashboardBlock?

**Landing renders** (`contrast.row_*`): a 3-column comparison table with `Templates` (muted), `A trainer` (muted), `Terav` (bronze border + strong text). Rows are Scope / What you get / When it adjusts. Each cell is short prose (~6-12 words).

**Proposed system:** DashboardBlock (§2.1) with `accent?: 'bronze'|'slate'|'green'|'amber'` supports a bronze-tinted card that visually matches landing's Terav column. `MetricStripCluster` (§2.7) is the "3-cell nested strip" that maps to the landing's 3-row-3-column contrast.

**Assessment:** **pass in principle, unverified in mockups.** No mockup shows a contrast/comparison surface in-app. The landing's comparison is marketing content; the app doesn't need to repeat it. But the *treatment* — bronze-bordered Terav-column style — is the visual language the app should port up. The proposed `DashboardBlock` with `accent='bronze'` and `WorkoutHero` with bronze CTA both match. No red flag.

### 2.5 Does landing's CTA "Start free — pick my focus" receive gracefully at `/programs`?

**Landing CTA** (`hero.cta_primary`): "Start free — pick my focus" → target `APP_URL/sign-up` per `Hero.tsx:81`.
**Landing browse-link** (`hero.browse_link`): "Browse programs — no signup" → `/programs`.

**Mockup evidence:** none of the mockups show the sign-up landing spot or the "pick my focus" hand-off. Program preview (`program-preview.png`) shows "Make this my focus" as the primary CTA — **this is excellent** because it matches the landing's "pick my focus" language verbatim in the verb. It is one of the few cross-surface phrase-echoes in the mockup set.

**Assessment:** **strong pass on the program preview.** "Make this my focus" (mockup) ↔ "pick my focus" (landing) is a direct language echo. This is the kind of cross-surface consistency that reads as "same product" to a first-time user.

**Nit:** the mockup's phrasing is "Make this my focus" — imperative first-person. The landing's is "Start free — pick my focus". These are near-identical but not literally identical. Not a fail; a copy-clarity note for `app-copy-clarity` to lock the canonical phrase across landing + app.

### 2.6 Promise ↔ delivery — the four hard checks

| Landing promise (verbatim + `en.ts` key) | Mockup delivery | Verdict |
|---|---|---|
| "Every session cites its research." (`evidence.title`) | No visible citation chip on any exercise row in `session.png` / `session-detail.png`. Block rows show `2 × 15` and `2 × 8 / leg` — no cite. No `[?]` explain icon. `ExplainSheet` (§2.11) is specified in the system doc but not rendered in any mockup. | **FAIL to visualize.** The primitive exists; the mockups don't exercise it. Add a subtle bronze cite-chip on each block header or a `[cited]` marker on prescription rows. |
| "Not a streak game. Skip a week. The plan sharpens against that too." (`wontdo.not_streak_body`) | Zero streak counters, zero "N-in-a-row" language, zero flame icons across all six mockups. `WeeklySessionStrip` (§2.5) explicitly rules out streak framing. `ReadinessTrail` (§2.4) uses 14 dots without "days in a row" copy. | **PASS.** |
| "Not certain about you. VO2max response varies ~10× person-to-person. We quote ranges, not one number." (`wontdo.not_certain_body`) | Program preview shows "Duration: 6 weeks · Difficulty: intermediate · Levels: 3 pieces" — point values, not ranges. `OutcomeBar` (§2.10) has a `rangeCaption` field ("TYPICAL RANGE +15 TO +25 KG · 8 WEEKS") but the mockup shows single values without range framing. | **PARTIAL.** The primitive supports honest ranges; the mockup doesn't demonstrate them. Fix in the wire-up: every `OutcomeBar` on `/programs/[slug]` must show a range, not a target. |
| "Focused improvement, not a full training plan" (memory `feedback_focused-not-full-plan.md`) | Today mockups show only today's workout + drills + optional extra-session logger. `today-minimalist.png` explicitly captions "Log an extra session" — matches `persona-strength/text/01-today.txt:34-36` "Optional. Nothing here changes the plan." No week-planner grid, no macrocycle chart. | **PASS.** |

---

## 3. QA-2 sync check impact

`dev/scripts/check-landing-sync.py` asserts:
- `hero.stat_programs_value` = digit form of REVIEWED-public count (currently "5 programs")
- `hero.stat_studies_value` = citations.json length (currently "126")
- `programs.title` includes "Five programs live." and "Three more in build."
- `evidence.title` includes "126 primary studies"

**Does the proposed system change any of these claims?** No. The design-system doc explicitly scopes out landing (§8, last bullet: "Landing site (separate system — `landing-conversion-strategist` owns)"). The proposed schema additions (`hero_metric`, `expected_outcomes`, `hero_metrics`, `magnitude`) are app-internal fields, not landing claims.

**Risk:** if Batch 36 wires `OutcomeBar` with **specific numeric targets** for each program (e.g., "hit 400W FTP" for engine-builder), and the founder wants to promote those targets to the landing, the landing's `wontdo.not_certain_body` claim ("we quote ranges, not one number") will drift. The system doc §2.10 correctly requires `rangeCaption` on `OutcomeBar` — enforce this in the wire-up per program. If a program's authored `expected_outcomes` field has only a point value, the sync check should catch it. **Recommendation to extend QA-2:** add a `check-outcome-honesty.py` that asserts every program's `expected_outcomes` includes a `rangeCaption` field before merge. Cheap and defends the "not certain" promise across the schema addition.

**Verdict:** the proposed system does not break the existing sync check. It creates a *new* honesty surface (`OutcomeBar`) that should have its own sync check, at least in review.

---

## 4. Specific caveats to gate Batch 36 approval on

Ordered by severity. All are fixable within Batch 36 scope; the vote flips to **REJECT** if any are still open at deploy.

### C1 (P0) — H1 hierarchy inversion on Today

**Fix:** on Today, the workout/focus name is the h1-display (32px). "Today" is a caption or eyebrow (or absent — bottom nav labels the route). `today-v1.png` and `today-minimalist.png` both violate this. `today-4.png` is closest to acceptable (still has "Today" H1 but slightly demoted). Land Today at the deep-review §3.1 hierarchy or the "pick one thing" landing promise does not echo where it must.

### C2 (P1) — Accept-or-Ignore surface is not in the mockup set

**Fix:** produce at least one mockup showing a proposal card with the two-button pair. Baseline §5.1 already flags the Accept vs APPLY BUMP verb mismatch. The proposed system §2.11 (`ExplainSheet`) covers the "why this?" but does not draw the Accept UI. Add a Session-level or Today-level card mockup with: proposal text · cite chip · Apply button (bronze) · Ignore button (ghost). Lock the verb — either "Accept" (matching landing) or update landing `en.ts` to say "Apply" (baseline audit's recommended fix).

### C3 (P1) — citation affordance is invisible in Session mockups

**Fix:** every block header or prescription row on `/session/[slug]` must show a visible cite trigger. Options: a small `[?]` bronze icon that opens `ExplainSheet`; a subtle "cited" mono-caps caption below block name; a citation strip like the landing's Programs section already shows. Currently `session.png` and `session-detail.png` show prescription math (`2 × 15`, `3 × 10`) with zero cite affordance. The landing's `evidence.title = "126 primary studies. Every session cites its research."` requires this to be *visible on every session*, not hidden behind a menu.

### C4 (P1) — wordmark treatment is inconsistent within the mockup set

**Fix:** pick one. `today-v1.png` has no wordmark. `today-4.png` and `today-minimalist.png` show `● TERAV` (white text, bronze leading pip) — this matches landing. `session.png` uses "Back to Today" instead of a wordmark. `program-preview.png` uses "All programs → Terav Strength" as a breadcrumb. If the wordmark ships as `● TERAV` (white + bronze pip) on Today and Profile, and as a breadcrumb elsewhere, that's fine — but the system doc must specify this, and every mockup must show the same wordmark on the same surface class. Bundle with O1 from baseline audit.

### C5 (P2) — Programs catalog surface is missing from the mockup deck

**Fix:** produce a `/programs` mockup that shows how the landing's "Five programs live. Three more in build." lands in-app. Options: (a) the 5 REFERENCED programs as a "Live now" strip above the `CategoryTileGrid`; (b) shift landing copy to "Five arcs across four domains" (matches the tile grid IA). Without this mockup, the jury cannot verify the landing's flagship count claim survives the redesign.

### C6 (P2) — mobility label divergence remains unresolved

**Baseline finding:** landing hero label says "mobility", app category label says "Left/right & mobility". Not addressed in the system doc. Route to `app-copy-clarity` for a batch-scoped copy edit.

### C7 (P2) — OutcomeBar honesty enforcement

**Fix:** add a lint or sync check that every program's `expected_outcomes` includes a `rangeCaption`. Point-value-only targets violate the "not certain about you" promise silently. Defensive; catches drift as new programs ship.

---

## 5. What the system+mockup set gets *right* (celebration, not softening)

- **Warm-dark ground is consistent.** No mockup uses a light theme or a hero photo. R1 (photo-first) rejected across all six mockups.
- **Bronze is bounded to CTA + arc-fill + target-hit.** `Open session →`, `Start block`, `Make this my focus` are the only bronze fills in the mockups. No decorative bronze washes. R2 pass.
- **No score-donut.** `today-4.png` shows "● GREEN · PROGRESS LOAD" as a state pill with a 14-dot trail — the exact composition §5 of the system doc argues for. R8 pass. This is the single biggest positional win over Whoop / Ultrahuman / The Outsiders' fill-arc.
- **Mono-caps eyebrows are consistent** between landing (`.mono-caps` class in shipped landing) and mockups ("TODAY · ENGINE BUILDER", "BLOCK A · WARM-UP", "SECTION 1 · REFERENCED"). R4 pass.
- **"Make this my focus"** (program-preview) directly echoes landing's "pick my focus" CTA language. This is exactly the kind of cross-surface language echo the alignment lens rewards.
- **Optional-extra-session logger** on `today-minimalist.png` ("+ Log an extra session") delivers the landing's "the rest of your week is still yours" (`hero.sub`) promise literally. Focused-improvement positioning preserved.
- **No streak counter, no "days in a row" language** across any mockup. R5 pass. Delivers `wontdo.not_streak_body`.
- **Program preview's "Adapts to you" block** delivers on `contrast.row_when_terav = "Every session, against your log"`. Correct language, correct positioning.

---

## 6. Cross-surface consistency score

Rubric: 1-5 per axis. Pass at ≥4/5 per axis, ≥25/30 total.

| Axis | Score | Notes |
|---|---|---|
| Color/palette consistency | 5/5 | Ground, bronze, mono-caps all match landing. |
| Typography ramp consistency | 4/5 | Ramp is coherent; H1 hierarchy inverted on Today (C1). |
| Spacing rhythm | 5/5 | 12/16/24 rhythm visible in mockups; matches landing gutter. |
| Elevation/tonal layering | 4/5 | e1/e2 pair present; no shadow abuse. `today-v1.png` reads flatter than the other two Today variants — minor variance. |
| Language echo (landing↔app) | 3/5 | "Make this my focus" matches; "Accept or Ignore" doesn't (C2). |
| Promise delivery visibility | 3/5 | Cite promise not visible on Session (C3); range promise not visible on Preview (§2.6 partial). |

**Total: 24/30.** Just below the 25/30 gate. Fixing C1 + C3 alone would push this to 26/30 and clear the gate.

---

## 7. Vote (final)

**APPROVE-WITH-CAVEATS.** Ship Batch 36 conditional on C1-C4 resolved in-batch. C5 can slip to a follow-up mockup pass if the catalog wiring in code is unchanged from current. C6-C7 are P2, defensible in the next batch.

The system contract (§1-§8 of `2026-08-20-terav-design-system.md`) is the right contract. The mockups are directionally right. The gaps that make this APPROVE-WITH-CAVEATS rather than APPROVE are alignment-surface — a landing-promise-invisible-in-mockup problem, not a broken-primitive problem.

**Do not deploy Batch 36 without:**
1. A Today variant where the workout/focus name is bigger than the route label.
2. At least one mockup that shows the Accept/Apply + Ignore pair.
3. Session mockups with visible cite affordance per block or per prescription row.
4. A specified canonical wordmark treatment that matches landing on Today and other primary surfaces.

**Signed:** Lane B jury · landing↔app alignment lens · 2026-08-20.
