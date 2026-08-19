# Visual-craft assessment — founder observations queue (2026-08-19)

Personas verified: `persona-recover`, `persona-strength`, `persona-erratic` (mobile artifacts under `next-app/tests/e2e/artifacts/personas/`, 15:02-15:12 mtime, post-Batch-28).

Palette source: `next-app/src/app/globals.css:8-55`.

## Executive verdict — the queue is 80% real in visual-craft, 20% mis-classified

The queue is honest and specific. Most items either **have already been designed** (the two prior briefs — GOWOD system + F2/F5/F6/F7 — cover them, sometimes explicitly) or **need one small, tokened fix**. Only two items in this queue actually need a fresh visual brief (O9 and O15). The rest resolve into palette-discipline moves (O8), one-line fixes (O14a), or ordering claims that already have a landed answer.

The single most repeated failure the queue reveals is **overloaded palette tokens** — bronze/slate/green/amber each do 3-4 semantic jobs (category, status, laterality, block-type, symptom state). O8 is the tip; a full audit finds it in five more places. This is the P0.

---

## O1 — TERAV wordmark inconsistency (bronze in app, white+bullet on landing)

**Verdict: real — needs a small brand call.**

Evidence:
- App wordmark: `next-app/src/components/AppShell.tsx:150` — `className="flex items-center gap-2 font-mono text-[14px] uppercase tracking-[0.22em] text-bronze hover:text-ink"`. Renders `TERAV` in bronze `#c89666`, followed by a `<ReadinessDot />` (conditional 8×8 colored dot) at line 153. No bullet in front, the dot is state-not-brand and only visible when `derived_state` is set.
- Landing wordmark: `landing/src/components/Wordmark.tsx:7-17` — bronze bullet `bg-[var(--color-bronze)]` at 8×8 then `TERAV` in `text-[var(--color-strong)]` (which is `#f4f5f7`, near-white). The bullet is decorative/brand, always shown.

**Founder's read is correct — reads as two brands** because two independent decisions have been made:
1. Landing "bronze pip + white wordmark" was authored as brand identity (comment at `Wordmark.tsx:2-4` calls out the "sharpening" metaphor).
2. App "bronze wordmark + conditional readiness dot" was authored as function (the dot is Whoop/Ultrahuman readiness signal).

Neither is wrong on its own. Together they look like two different wordmarks because **the dot in the app is on the RIGHT and only sometimes present; the pip on landing is on the LEFT and always present**. The eye reads presence/absence and left/right, not shade of color.

**Fix — pick one, ship in both surfaces (P1, ~20 min):**

Recommendation: **align on the landing pattern** (bronze pip left, white wordmark), because:
- Landing sets the brand impression that carries into the app; app should honor it.
- White wordmark reads as chrome, not chrome-that-competes-with-content — the current bronze `TERAV` at 14px in `text-[0.22em]` tracking is the loudest element in the top bar.
- The readiness dot can move to the right of the wordmark as a **secondary function** dot without conflict — two distinct micro-affordances.

Specific edit at `AppShell.tsx:147-154`:
```tsx
<Link href="/" aria-label="Terav — Today"
  className="flex items-center gap-2 font-mono text-[14px] uppercase tracking-[0.22em] text-strong hover:opacity-80">
  <span className="inline-block h-2 w-2 rounded-full bg-bronze" aria-hidden />
  TERAV
  <ReadinessDot />
</Link>
```

**Cross-check against R2** (no second primary accent): the brand pip is bronze, same primary token. No violation.

---

## O7 — Programs "All" view stacked prose density

**Verdict: real; deferred by founder ("not the biggest atm"); already partially addressed by prior briefs; new evidence on category ordering.**

Evidence:
- Programs page render: `programs/page.tsx:180-213` — categories are grouped, sorted by `manifest.categories[a[0]]?.order`. Category headers are `text-[15px] font-semibold text-strong` at :188 with a `text-[15px]` icon glyph + count `· N` in mono at :191. Programs are `<ul class="space-y-2">` of cards.
- Card render: `programs/page.tsx:303-351` — `rounded border border-line border-l-4 ${cat.borderClass} bg-surface px-4 py-3.5` — 14px `text-sm` title + 14px muted 2-line description clamp + 11px mono meta row.

**Fresh observations the queue missed:**
1. **Section headers are 15px semibold** — same as body copy. Hierarchy ratio 1.07× against 14px body. Cards below the header get more visual attention than the section header itself because they have borders + border-l-4 tint.
2. **Category icons (◆ ▮ △ ○ ☰ ◇ ·) at `text-[15px]`** — barely readable at 15px. Nine unicode glyphs where four are duplicates. The "same 4 tokens for two axes" problem O8 identifies, worse because two glyphs are near-identical too.

**Fix — three moves (P1, ~45 min total):**
1. **Bump section headers to `text-[18px] font-semibold text-strong tracking-tight`** at `programs/page.tsx:188`.
2. **Add `text-[22px] leading-none` on the category glyph**, muted (`text-muted/70`) instead of category-colored. Decouples glyph from status-color (see O8 fix). `programs/page.tsx:187`.
3. **Bump inter-section spacing** — `space-y-5` at :115 → `space-y-8`.

**Reject: GOWOD-style category blocks** — prior GOWOD brief rejected the carousel pattern, same reasoning applies here: 5 public programs in 4 buckets = 4 tiles each with 1-2 items, visually loud + structurally empty.

**Reopen when:** program count > 12 and multiple categories have ≥3 programs each.

---

## O8 — Category ↔ status color collision

**Verdict: real, high impact, P0 for visual-craft. Directly overloads the palette.**

**Additional collision sites** (grep-verified across `next-app/src/`):
- Multi-track dot cluster on Week — `week/page.tsx:334-343` — green=done, amber=skipped, slate=moved. That's **the same slate that's now Rehab category and REVIEWED status**. Three semantic jobs on one token.
- Laterality spine on ExerciseCard — `ExerciseCard.tsx:125-131` — `text-lat-left` (#4a8894 — near slate) and `text-lat-right` (#a279a8 — purple).
- Symptom state dot on AMBER banner — `page.tsx:319` — `bg-amber/10 border-l-amber`. Amber = symptom state, REFERENCED chip, HYROX category, "skipped" in Week dot cluster.
- Bronze — CTA primary, "active" pill, brand pip (proposed in O1 fix), category=Strength.

**The rot** — the palette started as: bronze (primary CTA), slate (secondary), amber (warning), green (success), red (danger). 5 tokens for 5 roles. Now 5 tokens for ~18 roles.

**Fix — Option 2 from the queue with a small twist (P0, ~2h):**
1. **Category becomes a shape/glyph + border-color** only. Categories keep border-l-4 tint but the *chip* below the card title drops.
2. **Status becomes a neutral-outlined pill with a tiny colored dot** — replace `bg-amber/20 text-amber` etc. with `border border-line-soft text-muted` + a `w-1.5 h-1.5 rounded-full bg-{semantic}` dot inside the pill.
3. **Introduce two on-tint text tokens** (`text-amber-strong` `#f0b854`, `text-red-strong` `#f28068` from Batch 26) where status HAS to be tinted (retest badges, symptom state banners).
4. **Neutralize the laterality spine** — reduce `text-lat-left/right` opacity in header context.

Specific edits:
- `programs/page.tsx:230-254` — status chip map. Replace all `bg-{color}/20 text-{color}` with `border border-line-soft text-muted flex items-center gap-1.5` + inline `<span className="h-1.5 w-1.5 rounded-full bg-{color}" />`. Same at `ProgramPreviewClient.tsx:194-210`.
- Cross-app sweep: grep `bg-.*\/20 text-` — includes `HeritageClusterChip`, `PerProgramAdherenceCard`, Week per-track pill. Apply "dot in a neutral pill" pattern for every "chip" role. Leave `bg-{semantic}/10 border-l-{semantic}` **banners** alone — one-per-view, chips are many-per-view.

**Cross-check against R2**: fix removes accents from chips; primary CTA bronze untouched. In fact, *strengthens* R2 — right now amber and green compete with bronze; neutralizing chips lets bronze CTAs pop again.

---

## O9 — Program preview page: hierarchy + monotony

**Verdict: real; two problems, one fix pattern. Needs a small visual brief (bundled).**

**The core issue:** **five consecutive H2 sections use the same treatment** — `text-[14px] font-semibold text-strong` — with `<p className="text-sm">` body. Hierarchy ratio 1.0× between section header and body. Only semibold weight separates them.

Compare the block-header pattern the app uses on Today (`page.tsx:1267`): `font-mono text-[14px] font-semibold uppercase tracking-widest`. That treatment reads as a heading because mono + uppercase + widetrack collectively add ~3 differentiators against body.

**Type-scale audit for the preview page:**

| Role | Class chain | px | Verdict |
|---|---|---|---|
| Title | `text-2xl font-semibold tracking-tight` | 24 | OK — 1.71× |
| Short desc | `text-sm text-muted` | 14 | OK |
| Levels label | `text-[12px] font-mono text-muted` | 12 | OK |
| Adapts-to-you body | `text-[14px] text-strong leading-snug` | 14 | OK |
| Meta row | `text-[12px] font-mono text-muted` | 12 | OK |
| **Section H2** | `text-[14px] font-semibold text-strong` | **14** | **FAIL — same size as body** |
| Section body | `text-sm leading-relaxed text-ink` | 14 | Conflicts with H2 |
| Cites strip label | `font-mono text-[10px] uppercase tracking-widest` | 10 | OK |
| Program shape summary | `text-[14px] text-slate font-semibold` | 14 | Similar problem |

**Fix — one-shot hierarchy pass (P1, ~40 min):**

1. **Bump section H2s to `text-[16px] font-semibold text-strong tracking-tight leading-snug`** — `ProgramPreviewClient.tsx:287, 292, 298`.
2. **Add an `<h2>`-adjacent eyebrow on the top-3 sections** using the app's mono-caps eyebrow pattern:
```tsx
<p className="font-mono text-[10px] uppercase tracking-widest text-muted">Section 1 of 3</p>
<h2 className="text-[16px] font-semibold text-strong">Who this is for</h2>
```
3. **Reorder** to match founder's implicit ranking: title → short description → **Who this is for** → **What you'll achieve** → **Adapts to you** (currently at top, move down) → **Retest** → **Baseline setup** → **Cites** → **CTA** → **Peek inside**.
4. **Vary the section-body treatment** — for "Retest" specifically, use the mono-numeric treatment for the "baseline X → target Y" fragments. Extract "baseline 92.5 kg" into `<span className="font-mono text-slate">92.5 kg</span>` inline.

**Persona check** — `persona-recover/mobile/07-programs-active.png` shows this preview page for anterior-hip-rebuild. The retest section is cut off at the bottom fold. Under the fix, moving Adapts-to-you down + tightening the header gets the top-3 sections above the fold.

**Reject: hero imagery, mockup screens, "block visual" cards for each section.** Per R1 (no photography).

**Cross-check O5a:** the PROVISIONAL chip at `:195` still leaks — same fix as O8 (neutral-outlined pill) resolves both.

---

## O14 — Exercise cards: truncation + expand affordance mismatch

**Verdict: O14a is real and trivial; O14b is real and reveals an IA gap, not visual.**

Evidence:
- `ExerciseCard.tsx:174-181`:
```tsx
<h3 className={cn("font-semibold tracking-tight truncate", done && "line-through decoration-1 opacity-60")}>
  {exercise.name}
</h3>
```
- No explicit text-size class → inherits `body` (16px on mobile). Uses `truncate` (single-line ellipsis).

**O14a fix (P0-bug-size, ~10 min):** Replace `truncate` with `line-clamp-2` on `<h3>`.

Specific edit at `ExerciseCard.tsx:176`:
```tsx
className={cn("font-semibold tracking-tight line-clamp-2 leading-snug text-[15px]", done && "line-through decoration-1 opacity-60")}
```

**O14b — the chevron reveals "Add note" only** — not primarily visual; it's the info architecture of the expanded state. When card is `done`, expanded state contains only "Add note" affordance — rest is contextual on `!done`.

**Visual-craft partial fix** (~15 min): when the card is `done`, replace the chevron with a note-icon (`MessageSquare` from lucide, matching the "Add note" button at `:345`).

Specific edit at `ExerciseCard.tsx:194-198`:
```tsx
{done ? (
  <MessageSquare size={16} className="text-muted flex-shrink-0" aria-hidden />
) : expanded ? (
  <ChevronDown size={16} className="text-muted flex-shrink-0" aria-hidden />
) : (
  <ChevronRight size={16} className="text-muted flex-shrink-0" aria-hidden />
)}
```

---

## O15 — Workout block visual (HWPO Run reference)

**Verdict: real; needs a small visual brief; bundled with the Today-dashboard scope from O3.**

HWPO Run reference (fetched, rendered):
- **Two-block phone mockup**, one light theme, one dark theme.
- Block card treatment: **circular tick-mark on the left of each block header** (~24px), block name in **UPPERCASE bold**, entire block enclosed in a card with rounded corners and generous padding (~24px vertical).
- Inside each block: "WARM UP:", "MAIN SET:", "NOTES:" as **all-caps labels**, body content at ~16px regular. No color-coded categories. No photography.
- Bottom: **"NOTES" collapsible bar** with a filled circle affordance.
- Header: **"HWPO RUN"** wordmark centered with left-back-chevron; date "DECEMBER 2, 2024" in small caps.

**What to steal (all typography, all token-compatible):**

1. **Circular tick-mark on block headers.** Terav's BlockSection (`page.tsx:1266-1271`) uses `pl-3 border-l-4 border-l-{color}`. Add a `flex items-center gap-3` header with a leading circle (24px, `border border-line rounded-full flex-shrink-0`) that fills bronze when all exercises in the block are done.

```tsx
<header className="flex items-center gap-3">
  <span className={cn(
    "w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center",
    blockDone ? "bg-bronze border-bronze" : "border-line"
  )}>
    {blockDone ? <Check size={12} className="text-ground" strokeWidth={3} /> : null}
  </span>
  <h2 className="font-mono text-[14px] font-semibold uppercase tracking-widest flex-1">
    {humanBlockName(block.name)}
  </h2>
  <span className="font-mono text-[11px] text-muted">{meta}</span>
</header>
```

2. **Drop the category-color left border on blocks.** HWPO has no category coloring. Terav's current `categoryColor` (run=green, accessory=slate, else=bronze) at `page.tsx:1263` is another instance of O8's palette overload — a green-bordered run block with 0/3 exercises complete reads as "done". Kill it.

3. **Explicit sub-labels ("WARM UP:", "MAIN SET:")** — if future programs author warm-up sections within a block.

4. **Generous block spacing** — HWPO cards have ~24px internal breathing room. Terav's BlockSection uses `space-y-3` (12px). Bump to `space-y-4`.

**Reject (per R1):** photography.

**Reject (per R5):** "completion count 2/3 blocks done" streak counter. **BUT** a per-block filled circle when done is not a streak counter; it's transparency (per O17's aside).

---

## O17 — Peer research batch

**HWPO Run** (primary reference for O15) — described above.

**GOWOD app** — dark palette, cyan/green accent, Mobility Time card with a **radial score donut** (74%), workout view has photography + play button + "Stimulus" label. Confirms prior GOWOD brief calls: their donut is a hero pattern, their workout view uses photography. Steal the numeric readout for score-like progress, reject the photography.

**"Software for CrossFit 2026" mockup image** — AI-generated CrossFit-app mockup with garbled bottom nav labels ("Sopte", "Bege", "Stants"). **Ignore as design source.** But the completion-donut *pattern* is worth noting.

**Additional peers checked:**
- **Whoop** — recovery-score donut is signature. Terav rejects R8 (no autonomous score-hero).
- **Runna** — weekly plan collapse already imported (F6, Batch 24).
- **Pliability** — one-arc-per-day rejected (R9).
- **Hevy** — set-log row treatment is closest peer to `SetRow.tsx`.
- **Ladder** — coach + confirm-first, closest analogue.

**Consolidated steal list for next visual-craft brief (bundled O9 + O15 + O7):**
1. Circular completion glyph on block headers (HWPO).
2. Numeric completion signal (arc progress %, "session 3/8", *not* streaks).
3. Neutral-outlined status pills with tiny colored dots (Linear, Vercel).
4. Section-header size bump (16px semibold) + eyebrow (10px mono uppercase) on prose-heavy pages.

**Consolidated reject list confirmed:**
- Photography (R1)
- Score-donut as autonomous hero (R8)
- Streak counters (R5) — reject completion counters that guilt; ship completion signals that celebrate honestly.
- Blue CTA (prior GOWOD brief) — bronze stays primary.

---

## New findings the queue missed (persona artifacts)

### N1 — Bottom-nav gutter has ~60px of nothing on Today (persona-erratic)

Evidence: `persona-erratic/mobile/01-today.png` — after "Log an extra session" card ends, ~60px empty ground color before bottom-nav. `<main>` carries `paddingBottom: "calc(64px + env(safe-area-inset-bottom) + 1rem)"` (`AppShell.tsx:179`), intentional and correct for the last content card. **No change** — solved by O3b (dashboard model brings blocks up).

### N2 — Font weight discipline holds, but leading-tight lurks on section H2s

Evidence: `ProgramPreviewClient.tsx:287, 292, 298` — no `leading-*` class → inherits Tailwind default (`1.5`). Fine for prose. If size bumps to 16-18px per O9, add `leading-snug`. Baked into O9 fix.

### N3 — `<h1>` on Today at `text-[40px]` but truncates on 360px

Evidence: `persona-erratic/mobile/01-today.png` — "Today" H1 visually reads ~40-48px. Prior GOWOD brief sized this at 32px; actual render is larger. Investigate Today's H1 class. If >32px, R3 violation.

### N4 — Icon stroke-width inconsistency

Evidence:
- `AppShell.tsx:161, 168` — top-nav icons at `size={18} strokeWidth={1.75}`.
- `programs/page.tsx:348` — ChevronRight `size={16}` (default strokeWidth = 2).
- `ExerciseCard.tsx:195-197, 209, 223, 224, 305, 345` — mix of `size={16}` no-stroke and explicit `strokeWidth={1.75}`.

Terav has 3 sizes (14/16/18) and 2 stroke weights (2, 1.75) in circulation. Prior audits landed on 1.75 as identity but not enforced. **Fix (P2, ~30 min):** shared `<Icon>` wrapper or ESLint rule.

### N5 — Recharts default axis on Progress (unverified but predictable)

Not reviewed. Flag for a Progress-specific sweep.

---

## Priority queue (visual-craft only)

**P0 (this week):**
- **O8 palette-collision fix** — status chips neutral-outlined + colored dot, cross-app to every `bg-*/20 text-*` pill (~15-20 sites). ~2h.

**P1 (this batch):**
- **O1 wordmark alignment** — brand pip in app + kept readiness dot. ~20 min. `AppShell.tsx:147-154`.
- **O14a exercise-name line-clamp-2** — ~10 min. `ExerciseCard.tsx:176`.
- **O9 program-preview hierarchy pass** — H2 to 16px, add eyebrow, reorder Adapts-to-you. ~40 min.
- **O7 catalog polish** — section headers to 18px, larger glyphs, more spacing. ~45 min.

**P1-B (needs a small brief — bundle with O3b/dashboard):**
- **O15 block-visual pass** — circular completion glyph on BlockSection header, drop category-color border, bump internal spacing. Bundle with Today-dashboard product-design-lead brief. ~2-3h.

**P2 (nice, not urgent):**
- **O14b done-card icon swap** — chevron → MessageSquare when done. ~15 min.
- **N4 icon-stroke discipline** — codemod or ESLint rule. ~30 min.

**Rejected on Terav constraints:**
- Category-block "GOWOD tiles" for O7 — too few programs.
- Photography / HWPO imagery lift for O15 — R1 remains.
- Completion streak counters — R5 remains.
- Autonomous score donut hero — R8 remains.

---

## Files referenced

- `next-app/src/components/AppShell.tsx` (O1 wordmark, ReadinessDot)
- `next-app/src/app/globals.css` (palette tokens)
- `next-app/src/app/programs/page.tsx` (O7 catalog, O8 status/category chip map)
- `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx` (O9)
- `next-app/src/components/workout/ExerciseCard.tsx` (O14)
- `next-app/src/app/page.tsx` (BlockSection at 1238-1298, O15)
- `next-app/src/app/week/page.tsx` (multi-track dot palette, O8 crossref)
- `landing/src/components/Wordmark.tsx` (O1 landing reference)
- `next-app/tests/e2e/artifacts/personas/persona-recover/mobile/{01-today.png,06-programs.png,07-programs-active.png}`
- `next-app/tests/e2e/artifacts/personas/persona-strength/mobile/{01-today.png,02-week.png,03-account.png,06-programs.png}`
- `next-app/tests/e2e/artifacts/personas/persona-erratic/mobile/{01-today.png,06-programs.png}`
