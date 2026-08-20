# Terav app — Deep design review (post-Batch 33/34/35)

**Reviewer:** app-visual-craft
**Date:** 2026-08-20
**Verdict cadence:** post-ship, founder verdict "still 1995, feels reactive"
**Rules of engagement:** this is a review, not a fix list. Deliverable is diagnosis + 3-5 concrete redesign proposals + Stitch prompts. No code changes in this pass.

**Personas walked (mtime 2026-08-20):**
`persona-strength`, `persona-recover`, `persona-multitrack`, `persona-mobility`, `persona-graduate`. Screenshots viewed as images at 393 px mobile: `01-today`, `02-week`, `05-progress`, `06-programs`, `07-programs-active`, `08-profile` where present.

**Constraints (Section G, non-negotiable):**
R1 no photography · R2 no second primary accent · R3 no H1 > 32 px · R4 mono-caps stays · R5 no gamification · R6 empty state stays honest · R7 no drag-reschedule · R8 no autonomous score-hero · R9 no one-arc-per-day · R10 no video form analysis · R11 no cross-user aggregation · R12 no coach chat.

**What shipped in Batches 33/34/35** (verified against files):
- `--color-surface-2: #20232a` now used on `DashboardBlock` outer (`DashboardBlock.tsx:98`)
- Two-part box-shadow float on the block outer (`DashboardBlock.tsx:99`)
- Bronze CTA with inset highlight + real `active:bg-bronze-active` press (`DashboardBlock.tsx:182, 191`)
- Category accent stripe on Today workout blocks (`TodaySession.tsx:529-540`)
- Today H1 bumped to `font-bold` at 32 px with `tracking-[-0.03em]` (`TodaySession.tsx:218`)
- Grid-row expand/collapse motion on collapsible blocks (`DashboardBlock.tsx:165`)
- Sparkline SVG primitive (`Sparkline.tsx`) — 30 lines, direction-tinted
- 14-day ReadinessTrail dot row on the compact hero (`ReadinessTrail.tsx`, wired at `HeroStateCard.tsx:72`)

**And yet — the founder still says 1995.** This document explains why.

---

## Section 1 — Honest verdict on the live state

Grading 1-10 with no curve. Reference floor: a well-crafted authenticated dashboard from 2024 (Linear, Notion mobile, Runna's post-2024 refresh) sits at 8-9. Terav's ceiling is bounded by R1/R5/R8 which is a real handicap but not the excuse it's being used as.

### 1.1 Today dashboard (`/`) — **4/10**

The load-bearing surface. It's what the founder walks daily. The visual verdict is that it reads as a **stack of near-identical bordered containers on an even darker ground**, with the eye pulled to the wrong thing.

Concrete failures, cited:

- **The proposal card outranks the workout.** In `persona-strength/01-today.png`, "↑ ROOM TO PUSH — HEADROOM ON YOUR LOG" (`ProposalStack` render) is a full-width tinted bronze-outlined block with a monospace inline diff (`147.5 → 152.5 kg`). Below it, "1 block · 0 exercises" — the actual workout summary — sits at `text-[18px] font-semibold` (`DashboardBlock.tsx:136`) with the ThreeLine `Norwegian 4×4 · Row / Ski` truncated. Reading top-down, the eye lands on the proposal (loud, has data, has diff numbers), then wanders to the same-weight but smaller "No check yet" (24 px inside amber card at `HeroStateCard.tsx:93`), then finally to the workout — which is the primary action of the day. Hierarchy is inverted.
- **"No check yet" full card is louder than the workout summary.** `HeroStateCard.tsx:93` renders the state title at `text-2xl font-semibold text-strong` (24 px, weight 600). The workout DashboardBlock title is `text-[18px] font-semibold text-strong` (`DashboardBlock.tsx:136`). The "haven't done the check yet" prompt is 33% taller than the primary action. That's exactly backward.
- **The workout summary is a spec-sheet, not a hero.** Title is `"1 block · 0 exercises"` — a *count*, not a label. Lede is `"Norwegian 4×4 · Row / Ski"` in `text-[14px] text-muted` (`DashboardBlock.tsx:140`). The user has to combine the eyebrow ("TODAY") + title (a count) + lede (a phase name + workout type) to reconstruct what today is. Modern fitness dashboards give you the *thing you're doing* as the loudest element on the card. Terav gives you an arithmetic sum.
- **Category accent stripe is 4 px on the left edge — barely readable.** Move 6 shipped the stripe (`TodaySession.tsx:529-540`) but at 4 px `border-l-slate` on a `#20232a` surface at 20 % lightness, the color reads as a hairline artifact, not a category signal. On persona-strength (a *bronze* category) it *is* visible; on persona-recover (slate rehab) it's almost invisible against surface-2. The stripe is doing category-color work but at 4 px width and the specific slate hex, it's not earning the pixels.
- **The Extras block has zero visual differentiation from the workout block.** Same surface-2, same shadow, same 18 px title, same bronze CTA. On persona-multitrack (`01-today.png`) the two DashboardBlocks stack visually as if they were the same thing. There is no visual signal that "workout = primary, extras = optional" — both cards read as peers competing for the tap.
- **Bronze CTA elevation shipped but is invisible without a hover state.** `DashboardBlock.tsx:182` has `shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.4)]` on a bronze fill. On the persona screenshots, this shipped correctly — but on a `#0e0f12` ground, a 1 px `rgba(0,0,0,0.4)` drop shadow is invisible. The inset highlight barely reads because bronze on ground has almost no contrast for a 15 %-white line. The button correctly renders as pressable *in code*; visually it still reads as a colored panel because the shadow tokens don't fight the ground hard enough.
- **Empty vertical between proposal and workout is dead space.** In `persona-strength/01-today.png` there's roughly 240 px of pure `bg-ground` between the "Source: Rhea et al. 2003" line at the bottom of the proposal (~y=380) and the "No check yet" card starting at ~y=580. That is not "breathing room" — it's the visual equivalent of a stall. The eye scans up and back down looking for the next thing. On a 393 × 852 device that's ~28 % of the fold dedicated to nothing. Founder read as "1995" is partially THIS — old sites had giant gaps between "sections."
- **The bottom-nav interpolates the fold at ~ y=650.** Persona-strength screenshot shows the bottom-nav (`BottomNav`) sitting right in the middle of the workout DashboardBlock — the block title "1 block · 0 exercises" is above the nav, "· Norwegian 4×4 · Row / Ski" is below it, and the "Open session" CTA is only reachable by scrolling. The primary action is below the fold on the primary route. That's a mobile-ux issue but it *reads* as visual: the fold shows a stack of chrome (wordmark, date-nav, morning-check reminder, proposal) with no clear "here's your workout, tap here." → see app-audit-N-mobile-ux for the fold math.

**One thing done right:** the palette itself is genuinely 2026 grade. `#0e0f12` ground + `#20232a` surface-2 + `#c89666` bronze is a warm-dark system with real Whoop/Oura DNA. The colors aren't the problem.

### 1.2 Session view (`/session/[slug]`) — **6/10**

Not viewed in a fresh persona artifact (the harness captures Today at `/`, not session route), but the code path in `TodaySession.tsx` under `slugOverride` branches to the full inline workout render — same `BlockSection` + `ExerciseCard` cascade that used to be on Today before F8-second. That means the same shipped visual language: bordered cards, 14 px muted body, category stripes.

Predicted failures based on source:
- ExerciseCard truncates names (O14a from the queue — `truncate` class instead of `line-clamp-2`)
- Chevron expand affordance only reveals "Add note" (O14b — wasted disclosure)
- Set-row logging is monospace numerals in a small grid; no visual anchor per set

The session route is *better* than Today because it's a single-focus surface (no dashboard chrome, no proposals, no morning check) — that's the F8-second split working correctly. But the internals are inherited from the pre-refresh era. **Grade held at 6 pending fresh session-route captures.**

### 1.3 Programs catalog (`/programs`) — **5/10**

`persona-strength/06-programs.png` shows the "Pick your focus." H1 at 32 px, then a legend paragraph with three inline pill-buttons (referenced/reviewed/verified), then a filter chip row, then a native `<select>` sort dropdown, then category DashboardBlocks stacked vertically.

Failures:
- **Category DashboardBlocks visually indistinguishable from Today's DashboardBlocks.** Same surface-2, same shadow, same 18 px title, same border-l accent stripe. There is no visual difference between "you have a workout today" and "here is a category of programs you could pick." Primitive reuse has collapsed the semantic categories into one visual class. The user learns that "block-shaped thing = something to look at" and can't distinguish "action" from "browse."
- **Each category has 1-2 programs.** On `persona-strength/06-programs.png` I count Strength (1: Concurrent-Strength Maintenance), Gymnastics & skill (2: Handstand Walk + implied second), Engine & endurance (2: Engine Builder Block 1, Rowing 2K Test Prep), Mobility (1: Overhead Mobility). Four DashboardBlocks with 6 programs total — the DashboardBlock container overhead (title + eyebrow + lede) is > the actual per-program row height. This is the "PG&E bill" pattern — envelope larger than contents.
- **Per-program rows inside are `bg-line-soft/30` with a 2 px left border** (`programs/page.tsx:428`). That fill is `rgba(36,39,47,0.3)` = extremely close to the surface-2 fill of the container. There's no perceptible nested-elevation — the rows look like the container ate them. Contrast should carry the nesting; instead surface-2 outside + line-soft/30 inside are within 1 % luminance.
- **The status chip is a neutral outlined pill with a 6 px colored dot.** P0-8 fixed the palette collision (correct) but the resulting chip is so quiet it doesn't earn its slot on the row. On persona-strength the "REVIEWED" chip on Concurrent-Strength Maintenance would render as `border-line-soft text-muted` + a slate dot — reads as "grey with a dot." A user scans the catalog and gets no signal about which programs are the strongest citations.
- **The `<select>` sort control is OS chrome.** Native select at `programs/page.tsx:223-232` renders with OS font, OS popup positioning, doesn't respect the type ramp. Founder called this out in O6. Still shipped.
- **The GOWOD-scale visual identity that O7 asks for isn't present.** Categories have text labels + a description lede — no icon glyphs, no color-forward tile treatment. `persona-strength/06-programs.png` looks like a linear catalog of prose blocks, exactly the "dense text list rather than a browse experience" founder called out.

### 1.4 Program preview (`/programs/[slug]`) — **5/10**

`persona-strength/07-programs-active.png` (Concurrent-Strength Maintenance preview). Renders top-to-bottom:
1. Back link ("All programs") — 14 px slate
2. H1 "Concurrent-Strength Maintenance" — 24 px semibold (that's `text-2xl` at `ProgramPreviewClient.tsx:183` — smaller than the Today H1 at 32 px, which is inverted for a page that's more informational)
3. ACTIVE chip + REVIEWED chip
4. Short description prose
5. "Reviewed by Terav specialist audit agent" card (slate, bordered)
6. Section 1 of 4 · Who this is for — DashboardBlock
7. Section 2 of 4 · What you'll achieve — DashboardBlock
8. Section 3 of 4 · What it takes — DashboardBlock (with amber "Recommended background" reference)
9. Section 4 of 4 · How we prove it works — DashboardBlock
10. Recommended background — amber-bordered card
11. Baseline setup — bordered card
12. "This is your current program" green card + `GO TO TODAY` / `END PROGRAM` twin CTAs
13. Program shape (peek inside) — collapsible

Failures:
- **H1 24 px on a page dense with prose is too small** relative to Today's 32 px H1. Founder complained about this in O11. A page with 8+ sections of content should have a stronger anchor than the tab-name page. Reversed.
- **"Section 1 of 4" mono-caps eyebrow is used on all four sections.** That's the correct pattern for content ordering but the counter itself steals identity from the section — the user is scanning "Section 1", "Section 2", "Section 3" instead of "Who this is for" / "What you'll achieve" / "What it takes" / "How we prove it works". The section names *are* the load-bearing labels; the counter is bureaucratic.
- **Every section is the same DashboardBlock.** Section 1 (who this is for — trust content) looks visually identical to Section 4 (how we prove it works — trust content) looks visually identical to Section 3 (what it takes — spec content). The preview should escalate the trust content and de-escalate the spec content, or vice versa — the point is *differentiate*. Currently four bordered rectangles stack.
- **The two color-tinted callouts collide.** Amber "Recommended background" card at the bottom + slate "Reviewed by Terav specialist audit agent" card near the top + green "This is your current program" card at the bottom = three semantic colors carrying three semantic messages, but the visual grammar is "each callout is a colored bordered block" — which is exactly the pattern the neutral DashboardBlock uses. So the callouts don't feel more urgent than the sections; they just feel differently-colored.
- **`GO TO TODAY` and `END PROGRAM` share identical treatment** at 11 px mono-caps in bordered pills. Founder called out mono-caps CTA in O9 (P1-63 was meant to migrate away from this — check whether the twin got the treatment). Currently reads as two chip options, not "here's your primary + here's your escape."

### 1.5 Progress (`/progress`) — **6/10**

`persona-strength/05-progress.png` and `persona-recover/05-progress.png` show a genuinely dense surface — this route has more content to visualize than any other, and the visual system holds up better here than on Today.

The good:
- **Symptom vs. load chart on recover** (`SymptomLoadChart` at `05-progress.png` for persona-recover). Recharts line + bar combo with green/orange series, red-ish orange peak-symptom bars. This is the *only* real data-viz in the app that reads as data-viz. It's exactly what Today lacks.
- **Per-track adherence bar** on recover renders as a full-width filled bronze/bronze-lighter bar with `15/15 done · 100%` label — a real completion visualization, not a text stat.
- **Retest metrics cards** on persona-strength (`05-progress.png`) render a compact three-column grid: BASELINE / CURRENT / Δ. Numeric values in mono, tabular-nums. Clean.

The bad:
- **Sparkline shipped but not visible in these captures.** `Sparkline.tsx` exists as a primitive but the retest metric cards on `persona-strength/05-progress.png` show *no* inline sparkline next to the Δ column. Move 4 of the visual refresh brief specified adding it to `RetestMetricsPanel.tsx:151-168`. Either the wiring landed elsewhere or the persona-strength doesn't have enough retest history to trigger. Grep for `Sparkline` usage would clarify — but from the captures, the retest cards are still text-only.
- **"Weekly bests" and "Top lift" rows on persona-strength** at ~y=200 use `block_pull_midshin · 125 kg × 5` as the value. That's a raw exercise_id + rep-scheme string in mono. Reads as debug output. Compare to Whoop, which formats "Block pull • 125 kg × 5" or gives you a small icon + human name. The engine has the name; the UI is showing the id.
- **"How the engine reads you" disclosure is 11 px mono-caps** — same tier as row-meta, same tier as chip labels, same tier as button labels used to be pre-P1-63. Mono-caps sprawl reads as "everything is a caption."
- **Milestones section on recover** (`05-progress.png`, `y≈1150+`) shows two lift entries with target progression bars — but the bars are `bg-bronze/... rounded-full` at a fixed width, with the fill being `bg-bronze` at % of range. Reads as a stat pill, not a progress bar in the modern sense. No animation, no motion on load, no visual hierarchy that says "this is your progress toward the goal."
- **"Rehab · last 30d · 0/30 · 0%"** at the bottom of persona-recover — this is a "you didn't do the rehab" state that renders as a normal card, not as an alert. If the whole point of the rehab track is daily consistency, showing 0/30 with the same visual weight as "Retest metrics" is a UX crime. Should read as a red-tinted intervention card, not neutral.

### 1.6 Settings — **N/A (route doesn't exist)**

`/settings` page not implemented per O4c. Header currently shows the gear icon (`AppShell.tsx`) but wiring is either to `/account` or unresolved. Skipping.

### 1.7 Profile (`/profile`) — **5/10**

`persona-recover/08-profile.png` shows:
1. TERAV wordmark (bronze) + gear icon
2. H1 "Profile" (32 px semibold)
3. Avatar circle "E" + `e2e-persona-recover@example.test` + `JOINED AUG 2026` — clean identity chip
4. YOUR PROGRAMS section — one bordered row with "Anterior hip + strength rebuild · 34 weeks · intermediate · INTAKE PENDING" chip
5. MORE section — Extras / Report / Guide / Evidence four rows
6. Privacy · Terms · Medical disclaimer — three inline links
7. SIGN OUT button
8. Bottom nav

Failures:
- **The identity chip is well-designed** — that's the best treatment of a specific block in the app. Circle avatar + name + secondary line. Compact, has personality without violating R1. This is the treatment other blocks should copy, not the DashboardBlock.
- **"INTAKE PENDING" chip on the program row** is amber outlined + amber text — good semantic use. But right below it, the four "MORE" rows are all identical: icon + label + chevron. Extras, Report, Guide, Evidence read as peers. Are they peers? Extras is a daily-frequency action, Report is a rare specialist-share, Guide is documentation, Evidence is reference. Same treatment for four different frequencies of use.
- **PII in the persona artifact:** the visible email `e2e-persona-recover@example.test` is dummy data, no real PII. Flagging preemptively per organization policy — this is fake test data, not a real user.
- **`YOUR PROGRAMS` / `MORE` are 11 px mono-caps section labels.** Same tier as row-meta everywhere else. Section labels want a small size-up (12 px sentence-case would land better) — currently reads as "yet more caps." Section G's R4 keeps mono-caps but that rule was about the eyebrow tier; section headers are a different job.
- **"Privacy · Terms · Medical disclaimer" separator dots** are `·` middot with muted color. Fine, but the whole line is 12 px muted italic. On a Profile route this is honest chrome; on Today it would be too muted. Consistent enough here.

### 1.8 Summary grid

| Surface | Grade | Load-bearing failure |
|---|---|---|
| Today | 4/10 | Proposal outranks the workout; "No check" outranks primary action; workout title is a count not a label |
| Session | 6/10* | Not directly captured; predicted OK-ish |
| Programs catalog | 5/10 | Category blocks indistinguishable from Today blocks; native select breaks system |
| Program preview | 5/10 | H1 too small; four identical sections; three color callouts share visual grammar |
| Progress | 6/10 | Best route by data density; sparklines missing; exercise_id leaks; 0/30 rehab card is neutral |
| Settings | N/A | Route doesn't exist |
| Profile | 5/10 | Identity chip is best card in the app; MORE rows are undifferentiated peers |

**Average: ~5.2/10.** That's the founder's "1995" verdict grounded in specific evidence. It's not a hallucination; it's an accurate read of the current visual system.

---

## Section 2 — Root-cause the "1995 feel"

Batches 33/34/35 addressed the *palette level* (surface-2, shadow, bronze CTA elevation) and the *primitive level* (DashboardBlock accent stripe, ReadinessTrail dots). What they did **not** address is the *composition level* — how the primitives combine into a surface, and how the eye moves across that surface. The result is that each individual card is now nicer than it was, but the *page* still reads as flat.

Four structural causes rank-ordered by impact.

### 2.1 One primitive, many jobs (the "primitive monopoly" problem)

**Evidence:**
- `DashboardBlock` renders the workout summary (`TodaySession.tsx:542`), the Extras block (`TodaySession.tsx:594`), Programs category groups (`programs/page.tsx:248`), and by inference likely other surfaces too. It's used as: primary daily action container, secondary optional-content container, browse-category container, and info container.
- Every one of these gets the same `bg-surface-2 rounded-lg shadow-[...] border` treatment (`DashboardBlock.tsx:98-99`).
- The primitive supports `accent` (left stripe), `eyebrow` (mono-caps), `title` (18 px), `lede` (14 px muted), a status slot, children, and an optional bronze `primaryCta`. Every consumer picks from the same menu.

**Why this reads as 1995:** in the mid-2000s "cards" as a UI pattern hadn't matured. Sites used the same bordered box for everything — an article, a widget, a sidebar. Modern apps have visual grammar that's *specific to the job of a container* — Runna's workout hero doesn't look like Runna's session list which doesn't look like Runna's calendar cell. Terav has consolidated to one primitive and now the surface hierarchy is flat because every important block looks like every unimportant block.

**Refactoring UI language:** "one primary emphasis per view." Terav has ZERO primary emphases — everything is emphasis-neutral. When everything is emphasized, nothing is.

**Confidence:** 95 %. This is the single biggest driver.

### 2.2 Data-as-text (no visual anchors for the eye)

**Evidence:**
- Workout summary title on Today: `"1 block · 0 exercises"` (persona-strength `01-today.png`) or `"1 block · 5 exercises"` (persona-recover `01-today.png`). The title is arithmetic.
- Progress' retest cards: three text columns (BASELINE / CURRENT / Δ). `Sparkline.tsx` exists but isn't visible in the captures. `RetestMetricsPanel` is the target file per the Batch 35 brief.
- Milestones on Progress: `TM 99 kg · next 120 kg in 38d (-21.0)` — that's a full week of engine work compressed into a single line of mono text. The engine *has* the trajectory data; the UI shows the arithmetic.
- Symptom-vs-load chart on Progress persona-recover: this is the ONE place in the entire app where data has a shape. It's the strongest visual moment in the product.

**Why this reads as 1995:** legacy dashboards printed numbers in tables. Modern apps bind at least one visual to every trend — a sparkline, a bar, a ring, even a two-cell heatmap. The eye reads shape 10× faster than digits. Terav has one chart (Symptom vs. load) and puts it *inside* Progress under a fold. Every other trend is text.

**Confidence:** 90 %. Second-biggest driver.

### 2.3 The wrong thing is the tallest thing on the fold

**Evidence:**
- `persona-strength/01-today.png` fold order top-to-bottom: TERAV wordmark → H1 "Thursday 20 Aug" → DateNav card ("Thursday 20 Aug · Today") → ProposalCard (bronze-outlined, ~200 px tall) → 240 px of empty space → HeroStateCard "No check yet" (24 px hero title, ~150 px tall) → workout summary "1 block · 0 exercises" (bottom edge partially cut by bottom nav).
- The proposal card + the "No check yet" card together consume ~65 % of the fold. The workout — the primary action — is at the very edge or below.
- The empty 240 px vertical gap is `pt-4 space-y-6` container spacing (`TodaySession.tsx:198`) accumulating between HeroStateCard (session mode) and the proposal-stack render path.

**Why this reads as 1995:** old sites had "sections" with big margins between them. Modern apps optimize the fold — the top of the page IS the primary interaction, and it's tuned so a user knows what they're doing in the first 200 px. Terav's first 200 px is a wordmark + a redundant date. The workout is somewhere in the middle.

**Confidence:** 85 %. Fixable by re-ordering + trimming, not just visual polish.

### 2.4 Motion is technically present but perceptually absent

**Evidence:**
- `globals.css:137-141`: `route-in` keyframe fires on `<main>` mount for 150 ms opacity + 2 px translate. That's the ENTIRE global motion budget for route transitions. Two pixels of translate at 150 ms is genuinely invisible.
- `.pulse-accept` (`:151-155`) and `.mark-done-flash` (`:157-163`) fire on user actions — good — but 500 ms and 450 ms respectively, then done. No sustained visual feedback.
- `DashboardBlock` grid-row expand/collapse at 200 ms `ease-out` (`DashboardBlock.tsx:165`) — this DID ship. Users see it on collapsible blocks. But almost no blocks are collapsible; the primary Today blocks are all `collapsible: false` (default).
- No motion on Sparkline draw. No motion on ReadinessTrail dot render. No motion on category accent stripe render. No motion on DashboardBlock initial mount beyond the global 150 ms fade.

**Why this reads as 1995:** modern apps use motion to say "the app is alive." A 300 ms stagger on a list of cards mounting, a 200 ms sparkline stroke draw, a subtle scale-in on a completion tick — none of these are gamification (R5). They're the app breathing. Terav breathes once (route-in) and then holds still.

**Confidence:** 60 %. Motion helps but isn't the primary cause. The founder wouldn't say "1995" purely because the app doesn't animate.

### 2.5 Not the cause (rejected root causes)

- **Palette monotony.** Palette is fine. Warm-dark + bronze + slate is 2026.
- **Typography scale absolutely too small.** 14 px body, 18 px block title, 24 px hero, 32 px H1 — that's a workable ramp. It could differentiate more but the sizes aren't wrong per se.
- **Icons wrong.** Lucide throughout, mostly 14-16 px, appears disciplined.
- **Brand shape missing.** TERAV wordmark chisel-stroke is fine. Bronze dot next to it is fine. Not a driver of the "1995" verdict.

---

## Section 3 — Redesign proposals

Following the founder's directive: bias toward ONE big move, not five polish moves. I propose **one load-bearing move plus three supporting moves**. The load-bearing move is a hero variant for the workout DashboardBlock that establishes primary emphasis on Today. The supporting moves fix the composition + data-viz gaps.

All moves R1/R5/R8 compliant. All moves cite `file:line`. Ship costs estimated honestly (worst-case × 1.4 buffer, since 33/34/35 already blew past their estimates).

### Move A — **Workout hero card** (the load-bearing move)

**Current state:** the workout summary on Today renders as a `DashboardBlock` with title = arithmetic count, lede = phase, unordered list of block names, bronze CTA. Every Today block looks the same. See `TodaySession.tsx:542-576`.

**Proposed state:** introduce a **`WorkoutHero`** component. Not a `variant` prop on `DashboardBlock` (that route was proposed and the temptation to add another primitive-config axis is precisely what got us here). A dedicated component means it can have a genuinely different composition without polluting the shared primitive.

**Visual composition (mobile 393 px, cited to the founder's HWPO Run reference and Whoop's session card, adapted to Terav constraints):**

```
+---------------------------------------------------------+
|                                                         |
|  THURSDAY · WEEK 3 OF 6            [◕ workout ready]    |  <- 11px mono eyebrow (left) + status pill (right)
|                                                         |
|  Norwegian 4×4                                          |  <- 26px semibold, tracking-[-0.02em] — THE workout name
|  Row / Ski · concurrent strength maintenance            |  <- 14px muted lede
|                                                         |
|  ┌─────────────┬─────────────┬─────────────┐            |  <- 3-col metric strip on a NESTED bg-surface (surface-2 outer, surface inner)
|  │ 45 min      │ 4 blocks    │ RPE 7      │            |  <- 20px mono numeric per cell, 10px mono-caps eyebrow above
|  │ DURATION    │ SESSION     │ TARGET      │            |
|  └─────────────┴─────────────┴─────────────┘            |
|                                                         |
|  1  Scapular pull ladder                    5 sets      |  <- 14px body + 13px mono right-aligned per row
|  2  Shoulder + grip prep                    3 sets      |
|  3  Row strength                            4 sets      |
|  4  Row conditioning                        1 block     |
|                                                         |
|  [  Start session  →  ]                                 |  <- filled bronze CTA, sentence-case, 14px semibold
|                                                         |
+---------------------------------------------------------+
```

Key deltas from the current DashboardBlock:
- **Title is the workout name, not a count.** "Norwegian 4×4" at 26 px is the load-bearing element (still ≤ 32 px H1 per R3). This is the visual anchor the current design lacks.
- **Three-cell metric strip** in a nested `bg-surface` inside `bg-surface-2`. The primitives already exist (surface + surface-2 tokens). The math is the metric strip — duration + block count + target intensity (RPE for strength, Z-zone for aerobic, "form-focus" for skill). Numeric at 20 px mono, tabular-nums (already inherited from `html` at `globals.css:59`). This is Move 4 (sparkline) generalized: data as shape via typographic scale + spatial grouping.
- **Block list is numbered, not bulleted.** `· Scapular pull ladder` reads as an unordered list of things you might do; `1  Scapular pull ladder    5 sets` reads as a sequenced program. Sets count on the right aligns to a column via tabular-nums.
- **Status pill on the right eyebrow row** — "workout ready" / "check first" / "moved from tomorrow" / "in progress" / "done" — a real state affordance instead of the invisible category stripe. Left stripe REMOVED for the WorkoutHero because the status pill carries the semantic weight; the stripe was doing weak category work that a pill does better.
- **CTA moves *inside* the card, full-width at bottom.** `Start session →` at `w-full` reads as a real action button, not a chip. Bronze filled, sentence-case, 14 px semibold — matches P1-63's post-mono-caps direction.

**Ship cost:** M (6-8 h — new component `WorkoutHero.tsx`, wire in `TodaySession.tsx:511-577` in place of the `DashboardBlock`, program → hero-metrics deriver, layout QA at 393/430/iPhone SE).

**R-list compliance:**
- R1 ✓ no photography
- R2 ✓ bronze is still the only CTA color; status pill uses semantic tokens (green/amber/slate) which are for state, not for competing CTAs
- R3 ✓ 26 px title ≤ 32 px H1 cap
- R4 ✓ mono-caps stays on eyebrow + metric-strip captions
- R5 ✓ no streak, no gamification — "workout ready" is a state, not a game score
- R8 ✓ no autonomous score-hero — the metric strip shows engine-known facts (duration, count, target RPE from the program JSON), not a computed "readiness" score

**File:line to change:**
- New: `next-app/src/components/workout/WorkoutHero.tsx`
- Replace: `next-app/src/components/session/TodaySession.tsx:541-576` (the DashboardBlock render for the workout summary)
- Optional program schema: add `hero_metric` field per program.json for the third-cell label (RPE / Z-zone / form-focus)

### Move B — **Dashboard density: strip the empty-fold chrome**

**Current state:** Today fold order = wordmark → H1 "Today" → DateNav card → ProposalStack (when present) → 200-240 px empty → HeroStateCard → workout. The wordmark + H1 + DateNav consume ~180 px of fold. The dead vertical between proposal and hero-state consumes ~240 px. That's ~420 px of chrome + emptiness before the workout starts. On a 852-px tall device that's ~50 % of the viewport dedicated to non-workout.

**Proposed state:** collapse the top chrome and remove the dead vertical.

- **Merge H1 + DateNav into one row.** `TodaySession.tsx:217-226` currently renders `<h1>Today</h1>` then DateNav below. Combine: `<h1>Today</h1>` sits at 20 px inline with an arrow-nav ("‹ Thu 20 Aug ›") — total ~48 px tall instead of ~120 px. This is the Linear / Cal.com pattern for "route header + date scope."
- **Suppress `DateNav` when active date === today** on the Today route. The user is already on today; showing "Thursday 20 Aug · Today" as its own card is redundant. Only render the DateNav card when the user has arrow-nav'd away from today (existing `isToday` check inline in the H1 row is enough for the today-case; the full DateNav card appears only when off-today).
- **Compact the proposal card.** ProposalCard is currently ~200 px tall for a single proposal. Alternative: 90 px tall compact card with title + one-line evidence, tap to expand full evidence. Ship the space back to the workout.
- **Remove the empty vertical gap.** `TodaySession.tsx:198` uses `space-y-6` = 24 px between children. The 240 px gap in the persona screenshot suggests there's a `min-h`, a `content-visibility: auto` intrinsic (see `globals.css:208-211` — `contain-intrinsic-size: 0 400px`), or a suppressed component reserving fold space. Find and fix. The 400 px `.cv-auto` reserve is likely the culprit — it reserves fold space for below-fold content that's then invisible until scrolled.

**Ship cost:** S (2-3 h — H1 + DateNav merge, DateNav conditional render, ProposalCard compact-mode audit, `.cv-auto` reserve reduction to `0 200px` or elimination on primary Today blocks).

**R-list compliance:** all clean. Density work doesn't touch photography, gamification, or hero score.

**File:line to change:**
- `next-app/src/components/session/TodaySession.tsx:217-226` (H1 + subtitle → inline H1 with date)
- `next-app/src/components/session/TodaySession.tsx:270-272` (DateNav render — add `activeDate !== todayISO()` guard)
- `next-app/src/components/workout/ProposalCard.tsx` (compact mode — not read in this pass; audit + shrink)
- `next-app/src/app/globals.css:208-211` (`.cv-auto` intrinsic size — 400 → 200 px, or add `.cv-auto-compact` variant)

### Move C — **Progress data-viz: land the sparkline + kill the exercise_id leaks**

**Current state:** `Sparkline.tsx` exists but appears unwired to `RetestMetricsPanel` (not present in persona-strength `05-progress.png`). Progress renders exercise_ids as raw snake_case (`block_pull_midshin · 125 kg × 5`). Milestones show target progression as text (`TM 99 kg · next 120 kg in 38d (-21.0)`).

**Proposed state:**

1. **Wire `<Sparkline>` into every retest metric card.** Right of the Δ column, `width={96} height={24}`. Direction = "improving" | "worsening" | "flat" based on the metric's authored `direction` field (per `program.json`). Green sparkline for improving, amber for worsening, muted for flat. Data source: `store.capability_profile[metric_id]` reading array.
2. **Humanize the exercise_id everywhere it renders on Progress.** Same helper used elsewhere (`humanizeMetricId` per Batch 17 P1-66/67 — already exists in `src/lib`). Grep for `block_pull_midshin` or any `block_` prefix in `progress/page.tsx` and route through the helper.
3. **Milestone progress: replace text with a proper progress bar.** Currently `TM 99 kg · next 120 kg in 38d (-21.0)` reads as arithmetic. Proposal: 200 × 8 px bar with bronze fill at % of range, current-position tick mark, mono numeric `99 → 120 kg` label above. Motion: 400 ms `ease-out` fill on mount (motion-safe respected). This is the ONE hero-motion moment the app is missing.

**Ship cost:** M (5-6 h — sparkline wiring per metric, humanize-id sweep on Progress, milestone progress-bar component).

**R-list compliance:**
- R5 ✓ progress toward a program-authored target is *the metric the program committed to*, not a gamification streak. Bar fills toward a threshold the engine already knows; no external "you're 3 days in a row" contract.
- R8 ✓ no autonomous score — target is authored, current is logged, delta is arithmetic. No computed "wellness" number.

**File:line to change:**
- `next-app/src/components/progress/RetestMetricsPanel.tsx` (add `<Sparkline>` after the Δ cell)
- `next-app/src/app/progress/page.tsx` (grep + humanize the exercise_id renders — top lift row, weekly bests row, milestones)
- New: `next-app/src/components/progress/MilestoneBar.tsx` (200 × 8 px progress bar component)

### Move D — **Category tile treatment for `/programs`** (the GOWOD-style browse)

**Current state:** `programs/page.tsx:248-266` renders each category as a `DashboardBlock` with the programs stacked as `<li>` rows inside. Same visual language as the workout DashboardBlock on Today. See failure 1.3 above.

**Proposed state:** categories become **tiles** — a distinct 2-column grid on mobile, each tile carrying category icon + name + count + short pitch, tapping a tile filters the catalog to that category (which then renders the program list below).

Visual language of a tile:
- ~180 × 140 px on 393 px viewport (2 tiles per row with 12 px gap)
- Warm surface-2 fill with a colored gradient overlay in the top-left corner at 8-12 % opacity — bronze for strength, green for endurance, slate for skill/mobility/rehab, amber for hyrox
- Category glyph (Unicode geometric — already used in `CATEGORY_META`) at 32 px in the corner, colored per category
- Category name at 18 px semibold
- "N programs" at 12 px mono-caps muted
- One-line pitch (line-clamp-1) at 13 px muted

Tapping a tile: `setFilter(catId)` and scrolls down to the program list which then renders in the existing DashboardBlock pattern (or as a flat list, both work). The current all-filter view becomes tiles first, then optional program list below.

**Why this is R1-compliant:** the "colored gradient overlay" is a CSS `linear-gradient(135deg, transparent, var(--color-bronze) 12%)` — pure math. No photography. It's the category tile treatment that Notion uses for template categories, Linear uses for cycle overviews. Warm subtle color-forward tile, zero imagery.

**Ship cost:** M (5-6 h — new `CategoryTile` component, 2-col grid layout on mobile, filter-on-tap wiring, list-below-tiles conditional render).

**R-list compliance:**
- R1 ✓ zero photography, gradient math only
- R2 ✓ bronze CTA discipline preserved (tiles are not CTAs; they're filter chips at scale)
- R7 ✓ no drag; taps only

**File:line to change:**
- `next-app/src/app/programs/page.tsx:139-273` (replace the vertical DashboardBlock stack with a CategoryTile grid + conditional filtered list)
- New: `next-app/src/components/programs/CategoryTile.tsx`

### Move E (optional, lower priority) — **Program preview info-hierarchy escalation**

**Current state:** four "Section N of 4" DashboardBlocks stack visually identical. See failure 1.4 above.

**Proposed state:** escalate Section 1 (Who this is for) and Section 2 (What you'll achieve) — these are the trust-carrying "is this for me" content the founder identified as the primary conversion signal. De-escalate Section 3 (What it takes — spec) and Section 4 (How we prove it works — trust but detail).

Concrete pattern:
- Sections 1 + 2: promoted to hero variant of the DashboardBlock — 22 px title, `bg-surface-2` container with 4 px bronze left border, "Section N of 4" mono-caps DROPPED (section title carries identity), one-line pull-quote treatment for the first paragraph
- Sections 3 + 4: demoted to a two-column meta grid — "8 weeks / ~4-5 hr/week / intermediate" as three metric cells on one card; "Cycle-end 5RM confirm + submax HR at row pace-5 at week 8" as a second card
- Remove the "Section N of 4" counter — the section names ARE the labels
- H1 bumped from 24 px to 30 px (still ≤ 32 R3 cap) so the page anchor matches the content weight

**Ship cost:** S-M (4-5 h — ProgramPreviewClient refactor, two new variant renders, section content re-mapping).

**R-list compliance:** clean.

**File:line to change:**
- `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx:183` (H1 bump)
- `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx` (sections 1-4 render — locate via "Section 1 of 4" copy strings)

### 3.6 Not proposed and why

- **A new accent color for "primary."** Rejected — R2. Bronze is the CTA color; adding a "warm orange for daily action" makes bronze less special. The workout-hero's status pill uses green/amber/slate for STATE which is a different job than a CTA.
- **A photographic hero on Today.** R1.
- **A "you're 3 sessions into a 6-week block" progress ring** on Today. Rejected — R8 and Founder-review-of-R5 (Move E on Milestone is different because it's target-driven, not streak-driven; Today doesn't need a program-adherence ring because that already lives on Progress' PerProgramAdherenceCard).
- **Full 3-column dashboard restructure.** Rejected per prior product-design-lead brief — fights mobile single-column and R8.
- **Score-donut readiness card.** Rejected — R8.
- **Removing mono-caps eyebrows to "modernize."** Rejected — R4, mono is Terav's identity.
- **Streak counter on ReadinessTrail.** Rejected — R5.

### 3.7 Impact-per-hour ranking

| Move | Cost | Impact | Reason |
|---|---|---|---|
| A — WorkoutHero | 6-8 h | **Very high** | Fixes primary-emphasis inversion; single change founder sees first |
| B — Dashboard density | 2-3 h | High | Trims 300+ px of dead chrome from the fold |
| C — Progress data-viz | 5-6 h | High | Land the sparkline that shipped as a primitive but never wired; humanize the id leaks |
| D — Programs category tiles | 5-6 h | Medium | Founder's O7 explicitly deferred; ship AFTER A/B/C move the "1995" needle |
| E — Preview escalation | 4-5 h | Medium | Founder's O9; ship after A/B/C |

**Recommended batching:** Batch 36 = A + B (8-11 h). Ship. Screenshot personas. If the founder still says 1995 after A+B, none of the rest will move the needle. If A+B lands, Batch 37 = C + E, Batch 38 = D.

Do NOT ship all five as one batch. That's the pattern the founder called out ("ship one thing, miss the next thing"). Ship A+B, take a breath, measure, then decide.

---

## Section 4 — Stitch prompts

Each prompt targets a mockup at 393 × 852 mobile (iPhone SE class). All prompts include the shared design constraints so a Stitch mockup honors the palette + type + rejected-list.

**Shared constraints block (paste in every prompt):**

```
Design system:
- Warm-dark background #0E0F12 (ground) with elevated surfaces at #16181C (base card) and #20232A (elevated container). NO photography anywhere.
- Primary accent: bronze #C89666 — used ONLY for primary CTAs and one small identity mark. Never for large decorative fills.
- Semantic tokens: green #5FB37A (success/improving), amber #E0A63A (caution/warning), red #E5654B (error/red-flag), slate #79B8C4 (rehab/skill/mobility category).
- Text: strong white #F4F5F7 for titles, ink #D6D9DE for body, muted #8A8F9A for secondary. Two muted levels max.
- Type: IBM Plex Mono for eyebrows and numeric captions (10-11 px uppercase tracking-widest). System sans-serif (SF Pro Text / Inter) for body and titles.
- No streak counters, no gamification, no autonomous score-donuts, no photography.
- Corner radius: 8 px for cards, 8 px for buttons, 4 px for inline pills.
- Motion is subtle — 200 ms ease-out on state changes, 400 ms ease-out on data-viz reveals.
```

### Prompt for Move A (WorkoutHero on Today)

```
{{shared constraints}}

Design a mobile fitness app "Today" screen at 393 × 852 px, warm-dark theme. The primary visual anchor is a "workout hero card" — a large elevated container at #20232A occupying roughly 60% of the fold.

Layout of the hero card, top to bottom:
1. A small horizontal row: on the left, a mono-caps eyebrow "THURSDAY · WEEK 3 OF 6" in muted grey. On the right, a pill-shaped status chip with a green dot and the label "WORKOUT READY" in mono-caps.
2. The workout name: "Norwegian 4×4" at 26 px semibold in strong white with tight letter-spacing.
3. A one-line lede in muted grey: "Row / Ski · Concurrent-Strength Maintenance"
4. A nested 3-cell metric strip inside the card on a slightly darker surface (#16181C). Each cell shows: a 10 px mono-caps eyebrow label (DURATION / SESSION / TARGET) and a 20 px mono-numeric value below (45 MIN / 4 BLOCKS / RPE 7). Cells separated by 1 px vertical hairlines.
5. A numbered list of 4 workout blocks — each row shows: the number (1, 2, 3, 4) in mono, the block name in 14 px body ("Scapular pull ladder"), and a right-aligned set-count in 13 px mono ("5 sets").
6. A full-width bronze filled button at the bottom of the card with the label "Start session →" in 14 px sentence-case semibold.

Above the hero card, a tight header row: the wordmark "• TERAV" in bronze at 14 px on the left, a settings gear icon on the right. Below the header row, a slim inline route label: "Today" as a 20 px semibold H1 with a subtle "< Thu 20 Aug >" date-nav arrow control inline to the right of it — total header height under 60 px.

Below the workout hero card, an "Extras" secondary block (much simpler — just a title + a two-line preview + a bronze text-link, NO filled button). Extras must read as clearly secondary to the workout.

At the bottom, a bottom-nav with 5 tabs (Today, Week, Progress, History, Profile). The active tab (Today) has a bronze top-border 3 px tall.

NO photography. NO large decorative gradients. Warm-dark, disciplined, quiet. The eye should land on "Norwegian 4×4" as the loudest thing on screen.
```

### Prompt for Move B (dashboard density)

```
{{shared constraints}}

Design a mobile "Today" screen at 393 × 852 px showing the tightest possible fold above the primary workout. Compare-and-contrast intent: this is the "compressed chrome" version — every pixel of chrome must earn its space, and the workout card must start within the first 200 px of vertical.

Layout, top to bottom:
1. A 44 px tall header row: bronze "• TERAV" wordmark on the left, a settings gear icon on the right. Nothing else.
2. A 40 px combined route+date row: "Today" as a 20 px semibold H1 on the left, an inline "< Thursday 20 Aug >" date navigator on the right — chevrons + date text at 14 px, all in one row aligned to the H1 baseline.
3. Optional single-line proposal strip (only if a proposal is active): 40 px tall, one horizontal line — small bronze icon on the left, one-line proposal title in 14 px, a right-aligned "•••" tap-to-expand affordance. Full expanded proposal opens as a bottom sheet on tap. No 200 px tinted block.
4. Immediately below (no gap): the WorkoutHero card starts at y ≈ 130. All the primary emphasis is on the workout.
5. Small ReadinessTrail dot row (14 dots, 6 px each, 3 px gaps) as an inline strip UNDER the workout hero card — 20 px tall total. NO separate "readiness state" full card.
6. Extras block below workout hero.
7. Bottom nav.

Design should feel dense but not cramped — every visible pixel is either the workout, evidence for the workout, or navigation. Zero decorative padding, zero empty "section" gaps, zero redundant date labels.

NO photography. Warm-dark palette. Motion where it happens is 200 ms and quiet.
```

### Prompt for Move C (Progress data-viz)

```
{{shared constraints}}

Design a mobile "Progress" screen at 393 × 852 px focused on data visualization. This is the retest metrics + milestones view — the strongest data surface in a rehab / strength / cardio focus app. Every trend number should have a visual shape next to it.

Layout, top to bottom:
1. Header row: bronze "• TERAV" wordmark, settings gear.
2. "Progress" as 30 px semibold H1, with a small "Export report" outlined button on the right.
3. A "Week of 17 Aug — This week so far" summary card: bronze-outlined at the top border, 4 rows of week stats. Each row shows: label on left (Sessions / Top lift / Weekly bests / Morning check), value on right in mono-numeric with a small sparkline (60 × 16 px) between the label and the value. Sparkline is a subtle green polyline when improving, amber when worsening, muted grey when flat.
4. Per-track adherence card: full-width progress bar (bronze fill on a line-soft track), 15/15 DONE label on the right in mono-caps, small "moved sessions don't count as misses" caption below.
5. "Retest metrics" section header at 18 px semibold. Below it, 2-3 metric cards each showing: metric name at 16 px semibold, "CHECK AT WEEK 8" mono-caps eyebrow on the right, a horizontal row with three cells (BASELINE / CURRENT / Δ) each in a small elevated cell — and to the right of the Δ cell, an INLINE SPARKLINE at 96 × 24 px showing the last 12 readings colored green if the trend is in the improving direction.
6. "Milestones" section: 2-3 milestone cards each with the lift name, a horizontal progress bar (200 × 8 px) filling bronze to indicate current vs. target, current value → target value in mono-numeric above the bar, and a small "38 days to target" caption below.

Every trend that has more than 1 data point gets a visual: sparkline for continuous, progress bar for target-oriented, colored delta arrow for point-in-time. No naked number in the layout.

NO photography, NO gamification streaks (no "3 days in a row" callouts). Trends and targets only. Warm-dark palette.
```

### Prompt for Move D (Programs category tiles)

```
{{shared constraints}}

Design a mobile "Programs" catalog screen at 393 × 852 px using a GOWOD-style category-tile-first layout. This replaces a vertical stack of prose cards with a 2-column grid of visual category tiles that filter the catalog when tapped.

Layout, top to bottom:
1. Header row: bronze "• TERAV" wordmark, settings gear.
2. "Pick your focus." 30 px semibold H1 followed by a two-line description in 14 px ink: "Each program is one focus arc — an engine, a skill, a lift, a stubborn joint. Adaptive to how you respond."
3. Legend row (small 12 px ink caption): three colored inline dots + labels "referenced · reviewed · verified" with the dots being amber / slate / green.
4. A 2-column grid (12 px gutter) of category tiles. Each tile is ~180 × 140 px, warm-dark elevated surface #20232A with rounded corners and a subtle colored gradient overlay in the top-left corner (bronze for Strength, green for Endurance, slate for Skill / Gymnastics / Mobility / Rehab, amber for Hyrox). The gradient is at 8-12% opacity — subtle, no photography, no illustration.
5. Inside each tile: a category glyph (Unicode geometric — square, triangle, circle, hexagon, chevron) at 28 px in the top-left, colored in the category's tone. Below it, category name at 18 px semibold. Below that, "N programs" in 12 px mono-caps muted. At the bottom of the tile, a 13 px muted one-line pitch describing the category.
6. Categories to display: Strength (bronze, ▮ glyph), Endurance (green, ○ glyph), Skill (slate, △ glyph), Mobility (slate, ◇ glyph), Rehab (slate, ◆ glyph), Hyrox (amber, ☰ glyph). 6 tiles total in a 2 × 3 grid.
7. Below the tile grid, a small "Sort" control on the right side — a chip-style button, NOT a native <select> — labeled "Curated ▾".

Feels curated, browsable, distinct — each tile has visual identity via glyph + color, but the treatment is warm-dark and disciplined. NO photography. The 2-col mobile grid works down to iPhone SE at 375 px width.
```

### Prompt for Move E (Program preview info escalation)

```
{{shared constraints}}

Design a mobile "Program preview" screen at 393 × 852 px for a strength program called "Concurrent-Strength Maintenance." The visual goal is to escalate the trust-carrying content (who this is for, what you'll achieve) and de-escalate the spec content (duration, retest protocol).

Layout, top to bottom:
1. Back-link "← All programs" in 14 px slate.
2. Program name "Concurrent-Strength Maintenance" as 30 px semibold H1 with tight letter-spacing.
3. Chip row: "ACTIVE" (bronze filled chip) + "REVIEWED" (neutral outlined chip with a small slate dot).
4. One-line description in 14 px ink.
5. FIRST hero section — Who this is for. Rendered as an elevated card #20232A with a 4 px bronze left border, "Who this is for" as 22 px semibold title (NO "Section 1 of 4" eyebrow), and 2-3 lines of 15 px body copy in ink. This card is the visual anchor of the page.
6. SECOND hero section — What you'll achieve. Same treatment as Who this is for — elevated card, bronze left border, 22 px title, body copy. These two sections carry the trust.
7. Two-column meta grid — What it takes / How we prove it works. Rendered as a compact 2-column card showing 3 metrics (8 weeks / ~4-5 hr/week / intermediate) on the left, and a single retest-protocol paragraph on the right. Smaller visual weight, muted tone.
8. Amber-bordered "Recommended background" callout with the required prerequisites.
9. Bronze-bordered "Baseline setup" card with "7 questions" and a "Start intake" primary CTA.
10. Green-tinted "This is your current program" footer card with a "Go to Today" primary CTA and a text-link "End program".

Hierarchy must be legible: the two hero sections at the top clearly outrank the meta grid, which clearly outranks the callouts, which clearly rank at similar level as the current-program footer. NO four-identical-sections stack.

NO photography. Warm-dark palette. All bronze usage bounded to the two CTAs (Start intake, Go to Today).
```

---

## Coda — why Batches 33/34/35 didn't move the needle

The founder's read is correct but the diagnosis is subtler than "the shipped visual work was bad." The shipped visual work is *individually* good — surface-2 is a real hierarchy device, the bronze CTA elevation is a real physical-button move, the ReadinessTrail is a real data-viz addition. Each moves the primitive forward.

What the batches did NOT do is address the **composition problem** — how the primitives combine on a *surface* (a specific page) to create *primary emphasis*. Every Today block is now individually nicer AND they all look like each other. Nicer sameness is still sameness. The eye still has nowhere to land.

The load-bearing insight from this review: **Terav needs a dedicated "hero card" for the primary action on each surface**, not a variant prop on the shared primitive. On Today, the hero is the WorkoutHero. On Progress, the hero is the retest metric with a sparkline. On Programs, the hero is the category tile grid. On Program preview, the hero is the "Who this is for" section escalated above spec content. The shared DashboardBlock stays for secondary content — Extras, Signals, sub-tracks, meta grids.

That's the pattern this document proposes and the pattern the Stitch mockups will test. Ship Move A + Move B in Batch 36. If the founder walks the app after Batch 36 and still says 1995, we are wrong about the composition thesis and need to take a much bigger swing. If they don't — that's the signal to ship C, D, E over the next two batches and let the surface settle.

One rule for the ship: **do not ship all five moves in one batch**. That's the pattern that got us here. Ship A+B, screenshot, measure the founder's response. Then decide.

---

## Files referenced

- `next-app/src/components/session/TodaySession.tsx:198-577`
- `next-app/src/components/DashboardBlock.tsx:82-204`
- `next-app/src/components/workout/HeroStateCard.tsx:53-108`
- `next-app/src/components/workout/ReadinessTrail.tsx:17-68`
- `next-app/src/components/charts/Sparkline.tsx:18-77`
- `next-app/src/app/programs/page.tsx:139-273, 337-476`
- `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx:169-200`
- `next-app/src/app/progress/page.tsx:146-200`
- `next-app/src/app/globals.css:8-55, 129-174, 208-211`
- `next-app/tests/e2e/artifacts/personas/persona-strength/mobile/01-today.png`
- `next-app/tests/e2e/artifacts/personas/persona-strength/mobile/05-progress.png`
- `next-app/tests/e2e/artifacts/personas/persona-strength/mobile/06-programs.png`
- `next-app/tests/e2e/artifacts/personas/persona-strength/mobile/07-programs-active.png`
- `next-app/tests/e2e/artifacts/personas/persona-recover/mobile/01-today.png`
- `next-app/tests/e2e/artifacts/personas/persona-recover/mobile/05-progress.png`
- `next-app/tests/e2e/artifacts/personas/persona-recover/mobile/08-profile.png`
- `next-app/tests/e2e/artifacts/personas/persona-multitrack/mobile/01-today.png`
- `next-app/tests/e2e/artifacts/personas/persona-mobility/mobile/01-today.png`
- `next-app/tests/e2e/artifacts/personas/persona-graduate/mobile/01-today.png`
- `dev/audits/app/2026-08-20-visual-refresh-brief.md` (parallel brief — what Batch 33 shipped from)
- `dev/audits/app/2026-08-20-post-ship-design-lead.md` (product-design-lead's post-ship brief — DashboardBlock v2 hero variant proposal that this review supersedes with a dedicated component)
- `dev/audits/app/2026-08-19-founder-observations-queue.md` (O1-O21 backlog)
- `dev/audits/app/competitor-refs.md` (peer set)
