# Terav — 2026 warm-dark visual refresh brief

**Founder complaint (2026-08-20):** "Visuals seem very 1995, not 2026." After P0-8 (palette collision fix), F9 (`DashboardBlock` primitive), P1-74 (program-preview reorder), and F8-second (Today dashboard/session split) all shipped, the app still reads data-first, experience-second. Not Garmin/Whoop-modern.

**Constraint set (Section G of master list):** R1 (no photography), R2 (no second primary accent — bronze is it), R3 (no H1 > 32 px, no Whoop score-donut), R4 (mono-caps stay — Terav's technical identity), R5 (no gamification/streak counters), R6 (Coach empty state stays honest), R7 (no drag-to-reschedule), R8 (no autonomous score-hero), R9 (no one-arc-per-day), R11 (no cross-user aggregation).

**Rule of the game:** the palette, typography, and rhythm are all "correct" — the problem is that they are all correct at the same neutral, low-contrast, motion-less level. Modern doesn't require decoration; it requires *hierarchy that reads at a glance*, *data visualization instead of text-only numbers*, and *acknowledgment that the user tapped* (motion). The refresh has to add those three without importing photography, streaks, or a score-hero.

Artifacts referenced: `next-app/tests/e2e/artifacts/personas/persona-strength/mobile/01-today.png`, `.../persona-recover/mobile/01-today.png`, `.../persona-multitrack/mobile/01-today.png` (multitrack still shows pre-F8-second render), `05-progress.png`, `07-programs-active.png`.

---

## 1. Verdict — what makes Terav feel 1995

The three visual signatures of "1995 web software" are all present, and none of them are the palette:

**1. Everything is a bordered rectangle at the same visual weight.** Every DashboardBlock is `rounded border border-line-soft bg-surface px-4 py-4` (`DashboardBlock.tsx:91`). Every ExerciseCard, every RetestCard (`RetestMetricsPanel.tsx:120`), every SignalsStrip advisory (`TodaySession.tsx:313, 345, 361`), and every info sheet share the same 1-pixel `#24272f` outline on `#16181c` surface. There is no visual difference between "this is a primary object" and "this is a supporting detail" — every card competes for equal attention. Founder's persona-strength Today screenshot is a stack of three near-identical borders (readiness strip → dashboard summary → RunSlotCard) with no visual pull toward any of them.

**2. Data is presented as text.** The Progress screen (`persona-strength/mobile/05-progress.png`) shows "Baseline — · Current 115 kg · Δ —" as three columns of monospace numerals (`RetestMetricsPanel.tsx:151-168`). That's a spreadsheet. Modern fitness apps — Whoop, Garmin, Runna, Hevy — bind at least one visual (a sparkline, a ring, a bar) to *every* trend number, because the eye reads shape 10× faster than digits. Terav has one bar (Per-track adherence at `progress/page.tsx`), and it's the exception.

**3. Nothing moves when the user acts.** `globals.css:129-133` gives buttons a 60 ms scale-down on `:active`. That's the entire motion budget. Mark-done and pulse-accept animations exist (`.mark-done-flash`, `.pulse-accept` at `:151-163`) but they're the only "the app noticed you" cues in the product. There's no expand/collapse ease on `DashboardBlock`'s collapsible mode (`DashboardBlock.tsx:82-83` — instant state flip), no tick on block-complete outside the mark-done flash, no fade on route change beyond a 150 ms opacity fade (`:141`). The dashboard block collapses INSTANTLY when you tap the header, which reads exactly like a 2003 accordion widget.

**One thing done right:** the palette itself. `#0e0f12` ground / `#16181c` surface / `#c89666` bronze is a mature warm-dark system with Whoop/Oura DNA. It doesn't need to be replaced. It needs a **tier of visual hierarchy layered on top of it** so that a primary object looks primary, a supporting object looks supporting, and a piece of data has a shape as well as a value.

---

## 2. The moves

### Move 1 — Nested surface token `--color-surface-2` for compact cards inside DashboardBlocks

**Current state:** `globals.css:12` already defines `--color-surface-2: #20232a` but *nothing uses it*. Grep confirms zero call sites for `bg-surface-2` in the app. Meanwhile inside a DashboardBlock (e.g. the summary block on Today, `TodaySession.tsx:500-532`), any nested content — the block list `<ul>` at `:522` — sits on the same `bg-surface` (#16181c) as the block itself. A nested card cannot look like it's *inside* another card because they share the same fill.

**Proposed new state:** Elevate DashboardBlock to `bg-surface-2` (#20232a, +2.4% luminance) for the "primary card" tier, keeping neutral `bg-surface` for compact cards that live *inside* a DashboardBlock (RetestCard's `bg-surface` at `RetestMetricsPanel.tsx:120`, ExerciseCard row, block-list item). Also introduce `--color-surface-3` (#292d36) reserved for the CTA press-target contour on the primary CTA (see Move 4).

```css
/* globals.css @theme */
--color-surface: #16181c;     /* base cards (unchanged, used inside blocks now) */
--color-surface-2: #20232a;   /* DashboardBlock outer container */
--color-surface-3: #292d36;   /* primary CTA hover / active bg */
```

Then in `DashboardBlock.tsx:91`, swap `bg-surface` → `bg-surface-2`. Every nested compact card keeps `bg-surface` and now has visible elevation contrast.

**Why it moves the needle:** two-tier surface is the single cheapest device that separates "container" from "contents." Every 2020+ dashboard (Linear, Notion, Whoop, Garmin) uses at least two surface tiers. Terav has the token authored, so the ship is trivial — one CSS change plus one class swap.

**Ship cost:** S (30 min — one class rename, verify all DashboardBlock consumers).

**R-list compliance:** clean. Doesn't touch photography (R1), accents (R2), or gamification (R5).

---

### Move 2 — Typography scale bump on the primary hierarchy (with tracking discipline)

**Current state:** Today's H1 is `text-[32px] font-semibold tracking-tight leading-none` (`TodaySession.tsx:218`). DashboardBlock title is `text-[16px] font-semibold text-strong tracking-tight leading-snug` (`DashboardBlock.tsx:128`). Progress "Retest metrics" H2 is `text-[15px] font-semibold` (`RetestMetricsPanel.tsx:51`). Everything at the block-title level sits within 1 px of the body copy (14 px), so titles don't *lead*.

Look at `persona-strength/01-today.png`: "Thursday 20 Aug" (32 px H1) → "Today" caption (14 px) → readiness strip (14 px) → "No check yet" (24 px inside the amber card) → "1 block · 0 exercises" (16 px DashboardBlock title). The 24 px "No check yet" is currently louder than the 16 px workout summary, but the workout summary is the primary action on the page. Titles need to differentiate the primary object from every supporting one.

**Proposed new state:**
- Today H1 stays 32 px (R3 cap) but gains `letter-spacing: -0.02em` (currently `tracking-tight` = `-0.025em`, keep it) and moves to `font-weight: 700` (from 600). Rationale: heavier weight at 32 px reads bolder without growing the type. Weight, not size, is the R3-compliant knob.
- DashboardBlock title bumps **16 → 18 px** (`DashboardBlock.tsx:128`) with `tracking-tight` (`-0.015em`) — enough to feel like a heading, not a bold sentence.
- Retest / section H2 lands at **17 px semibold** (currently 15 px) so it has a rung between DashboardBlock title (18) and body (14).
- Numeric readouts on Progress: bump the "Current" value from `text-[14px] font-semibold` (`RetestMetricsPanel.tsx:158-159`) to **`text-[20px] font-semibold`** with `font-variant-numeric: tabular-nums` (already inherited from `html` at `globals.css:59`). The current value is the load-bearing number on that surface; it deserves a hero-tier treatment inside the small card. Baseline + Δ stay 14 px.

**Type ramp after the bump:**

| Role | Before | After | Notes |
|------|--------|-------|-------|
| Today H1 | 32/600, `-0.025em` | 32/**700**, `-0.025em` | Weight, not size |
| DashboardBlock title | 16/600 | **18/600**, `-0.015em` | Real block heading tier |
| Section H2 | 15/600 | **17/600** | New rung between block title and body |
| Body (unchanged) | 14/400 | 14/400 | |
| Retest "Current" value | 14/600 mono | **20/600** mono, tabular-nums | Data as hero within the card |
| Mono-caps eyebrow | 10/500 | 10/500 | Unchanged — R4 |

**Why it moves the needle:** the current ramp has 5 sizes all within 4 pt of body. That's the reason "everything reads at the same weight." Adding a real 4 pt gap between block-title (18) and section-H2 (17) and body (14) creates the visual staircase that says "I am important — I support — I am detail." Bumping the load-bearing Progress number to 20 px lets a user scan a card in one glance instead of reading three columns of 14 px monospace.

**Ship cost:** S-M (2-3 h — Today H1, DashboardBlock title, RetestMetricsPanel, and a grep pass for `text-[15px]` / `text-[16px]` section headings across ~10 sites to keep the ramp consistent).

**R-list compliance:** clean. H1 stays ≤ 32 px (R3), mono-caps untouched (R4).

---

### Move 3 — Motion pass: 200 ms ease on state changes, `prefers-reduced-motion` fallback

**Current state:** `globals.css` has three animations — `route-in` (150 ms opacity + 2 px translate on `<main>`), `pulse-accept` (500 ms bg tint), `mark-done-flash` (450 ms bg + scale). `DashboardBlock.tsx:82-83` collapses instantly (`useState` + conditional render, no transition). ExerciseCard done-flip is not animated. Ignore/Accept on proposals fires haptic + green pulse (`.pulse-accept`) but the card doesn't visually acknowledge dismissal. Every route transition uses the same 150 ms fade regardless of context.

**Proposed new state — a motion vocabulary, four verbs:**

```css
/* globals.css — motion tokens */
:root {
  --motion-quick: 120ms;    /* micro — press, hover */
  --motion-base:  200ms;    /* mid — expand/collapse, tick */
  --motion-slow:  360ms;    /* macro — block complete, retest reveal */
  --ease-out:     cubic-bezier(0.22, 0.61, 0.36, 1);   /* Material standard-out */
  --ease-inout:   cubic-bezier(0.4, 0, 0.2, 1);
}
```

Then:

1. **DashboardBlock expand/collapse** (`DashboardBlock.tsx:146-170`) — wrap the body `<div>` in a `<div style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}>` grid-row-transition trick with `transition: grid-template-rows var(--motion-base) var(--ease-out)`. Zero JS beyond current state; smooth height animation with no library.
2. **ExerciseCard mark-done tick** — when a set is marked done, animate a check icon in via `@keyframes tick-in { from { transform: scale(0.6); opacity: 0 } to { transform: scale(1); opacity: 1 } }` at `var(--motion-slow)`. Currently `.mark-done-flash` fires but the checkmark itself just appears.
3. **Proposal Accept/Ignore card dismiss** — 200 ms `opacity: 0 → 1, translateY(-4px → 0)` on Accept confirmation (currently instant DOM removal).
4. **Route transition** — keep `route-in` at 150 ms but bump the translate from 2 → 6 px so tab switches actually *feel* like tab switches. Consumers report the current 2 px is invisible.

**All four gated by** `@media (prefers-reduced-motion: reduce)` which already exists at `globals.css:168-174` — extend the block to include the new transitions:

```css
@media (prefers-reduced-motion: reduce) {
  main { animation: none; }
  .pulse-accept, .mark-done-flash { animation: none; }
  [data-transition] { transition: none !important; }  /* opt-in kill-switch */
  button:active, [role="button"]:active { transform: none; }
}
```

**Why it moves the needle:** motion is the #1 tell of "2020s app" vs. "web page." A 200 ms grid-row expand on the DashboardBlock isn't decoration — it says "the app noticed you tapped and is responding." Users interpret motion as responsiveness even when the underlying operation is instant. Zero motion reads as static text.

**Ship cost:** M (4-5 h — 4 sites, plus reduced-motion QA on each).

**R-list compliance:** clean. Motion isn't gamification (R5) — a 200 ms expand isn't a streak-day dopamine payload; it's basic interaction feedback. `prefers-reduced-motion` respected everywhere.

---

### Move 4 — Sparklines on Progress retest deltas + Today's Morning-check strip

**Current state:** Progress' RetestMetricsPanel (`RetestMetricsPanel.tsx:151-168`) renders three columns per metric: Baseline / Current / Δ. All three are text-only. The user's history is right there in `capability_profile[metric_id]` (an array of `{ observed_at, value }` readings) — the data is available; it's just being formatted as digits. Same on Today: the Morning-check "GREEN" strip at `HeroStateCard.tsx:51-66` shows current state as a colored dot + label, but the trailing 14 days of state history (also in the store) don't render at all.

**Proposed new state:** a 60 × 20 px inline sparkline component using pure SVG (no Recharts — Recharts is 45 KB for one chart type; SVG is 500 bytes). Placed:

1. **Progress RetestCard, right of the Δ column** (`RetestMetricsPanel.tsx:162-167`). Line color = `text-green` when trend is improving in metric direction, `text-amber` when regressing, `text-muted` when flat. Fill under the line at 10 % opacity in the same hue. Shows the last 12 readings.
2. **Today Morning-check strip** (`HeroStateCard.tsx:51-66`) — 14 dots representing the last 14 days' state (green/amber/red/muted), rendered inline right of the "Progress load…" caption. Micro-heatmap; no numbers. Empty days = ring only.

Sparkline component (~30 lines):

```tsx
export function Sparkline({ values, direction = "up", width = 60, height = 20 }: {
  values: number[]; direction?: "up" | "down"; width?: number; height?: number;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(" ");
  const last = values.at(-1)!, first = values[0];
  const improving = direction === "up" ? last > first : last < first;
  const stroke = improving ? "var(--color-green)" : "var(--color-amber)";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

**Why it moves the needle:** the founder's own reference — "seeing how much I have completed also helps mentally" (O17) — is exactly this. A number without a trend is a data cell; a number with a sparkline is a story. This is the single highest-impact move for the "1995 → 2026" perception delta because the eye reads shape before digits. Whoop and Garmin do this on *every* metric; Terav does it on none.

**Ship cost:** M (5-6 h — Sparkline component, capability_profile → sparkline data selector in `progress/page.tsx`, 14-day dot strip on HeroStateCard, alignment QA at 393 px).

**R-list compliance:** clean. Trend visualization ≠ gamification (R5) — a sparkline shows honest history, not a streak count or challenge score. No autonomous score (R8) — the numbers next to the sparkline still come from the user's own log, not an algorithmic "readiness score." Actually strengthens the "confirm-first, cite the paper" positioning because users can *see* the log the engine is reading.

---

### Move 5 — Bronze CTA elevation: from bordered-bronze to filled-bronze with a real press state

**Current state:** DashboardBlock's primary CTA (`DashboardBlock.tsx:153, 162`) renders as `border border-bronze bg-bronze text-ground px-3 py-2 text-[14px] font-semibold hover:opacity-90 min-h-[44px]`. It's a filled bronze rectangle with `hover:opacity-90` — a mobile-first PWA has no hover, so 100 % of touch users see zero press state beyond the global 60 ms scale (`globals.css:129-133`). The bronze "Open session →" CTA in `persona-strength/01-today.png` looks like a colored panel, not a button that will *respond* when tapped.

**Proposed new state:**

```tsx
// DashboardBlock CTA
className={cn(
  "inline-flex items-center gap-1.5 rounded-lg",
  "bg-bronze text-ground",
  "px-4 py-2.5 text-[14px] font-semibold",
  "min-h-[44px]",
  "shadow-[0_1px_0_0_var(--color-bronze-hover)_inset,0_-1px_0_0_var(--color-bronze-active)_inset]",  // 1px top highlight + 1px bottom shadow — physical button
  "transition-[transform,background] duration-[120ms] ease-out",
  "hover:bg-bronze-hover",
  "active:bg-bronze-active active:shadow-none",
  "focus-visible:outline-2 focus-visible:outline-bronze focus-visible:outline-offset-2",
)}
```

Key changes:
- `rounded` (4 px) → `rounded-lg` (8 px) — every modern app CTA is 8-12 px rounded, 4 px reads as 2010s Bootstrap.
- Add an inset shadow pair: 1 px top `bronze-hover` (highlight) + 1 px bottom `bronze-active` (shadow). This is the "physical button" trick used by iOS 17 and Material 3 — 2 pixels of cost, feels 3-dimensional.
- Genuine `:active:bg-bronze-active` — the token exists at `globals.css:43` and is unused. Pressing the button visibly darkens + flattens the shadow (removes the inset), telling the user "you pressed me."
- `duration-[120ms]` — snappy, not draggy.

Same treatment on Ignore/secondary buttons but with `border border-line` instead of the filled bronze.

**Why it moves the needle:** the bronze CTA is *the* commercial moment in the app. It's the "Open session," "Accept," "Save reading" surface. Right now it looks like a colored `<div>`. Adding 2 pixels of inset shadow + a real `:active` state makes it feel tactile without adding a shadow-heavy skeuomorphic layer. The visual delta between "flat panel" and "physical button" is the difference between "this is a web form" and "this is an app."

**Ship cost:** S (2 h — one component change in `DashboardBlock.tsx`; grep for other bronze CTA sites — `ExerciseCard`, `IntakeClient`, `ConfirmSheet` primary buttons — and apply the same class pattern via a shared `.btn-bronze` utility in `globals.css`).

**R-list compliance:** clean. Physical CTA affordance isn't a second accent (R2 — still bronze), isn't gamification (R5), isn't a score-hero (R8).

---

### Move 6 — DashboardBlock accent-stripe on Today (category color from Programs catalog, extended)

**Current state:** `DashboardBlock.tsx:60-67` already ships an `accent` prop that maps to a `border-l-4 border-l-{tone}` stripe (bronze/green/amber/red/slate). It's used on the Programs catalog category sections (P1-75). It is **not** used on Today. The workout summary block on `TodaySession.tsx:500-532` has no `accent` prop set, so persona-strength Today (`persona-strength/01-today.png`) renders the CSM DashboardBlock as a plain neutral card with no category signal.

**Proposed new state:** Pass `accent` to every DashboardBlock on Today based on the program's category. Mapping already established in Programs catalog (`programs/page.tsx:274-282`):

```tsx
// TodaySession.tsx:500 — add accent based on primary category of the program
const categoryAccent: Record<string, EyebrowTone> = {
  strength: "bronze",
  endurance: "green",
  concurrent: "bronze",           // strength is the higher-value axis
  skill: "slate",
  gymnastics: "slate",
  mobility: "slate",
  rehab: "slate",                 // rehab uses slate too — matches Programs catalog
  hyrox: "amber",
};

<DashboardBlock
  eyebrow={...}
  accent={categoryAccent[g.program.category] ?? "default"}
  title={...}
>
```

Same treatment on Extras block (slate = mobility/accessory) and RunSlotCard.

**Why it moves the needle:** the workout summary card *knows* what kind of workout it is; showing that knowledge as a 4 px colored spine is the cheapest possible category signal. It also creates a visual through-line between the Programs catalog (where the user picked the category) and Today (where they see it every morning). Continuity of visual language across surfaces is a hallmark of modern apps.

**Ship cost:** S (1 h — one prop pass in TodaySession, extend the accent map to cover all program categories, verify against O8 palette-collision resolution — the accent stripe was the *outcome* of O8, so this stays inside that discipline).

**R-list compliance:** clean. Multiple accents on category stripes ≠ second primary CTA accent (R2 — bronze is still THE CTA color across every surface; the stripe is a category signal, not a competing CTA). Category color coding was the whole point of the P0-8 palette-collision fix — this move extends its shipped discipline.

---

### Move 7 — Compact readiness *state* strip on Today (NOT a score, NOT a donut)

**Move 7 as originally scoped (compact 60 px donut ring) — REJECTED.** A donut ring showing readiness green/amber/red is a Whoop-style score-hero — even without a numeric score in the middle, a circle-filled-to-a-percentage IS the score. That's R8. Rejecting.

**Proposed alternative:** replace the current HeroStateCard "compact strip" (single line at `HeroStateCard.tsx:51-66`) with a **14-day readiness dot row** — the last 14 days' derived_state rendered as small 8 px dots inline right of the state label. Muted dot = no check. Green/amber/red = the state that day. Tap opens `/check`.

```tsx
// HeroStateCard.tsx — compact-mode replacement
<Link href="/check/" className="flex items-center gap-3">
  <span className={`w-2 h-2 rounded-full ${dotColour}`} />
  <span className={`font-mono uppercase tracking-wider text-[13px] ${textColour}`}>{copy.title}</span>
  <span className="text-muted text-[13px] flex-1 truncate">· {copy.sub}</span>
  <ReadinessTrail days={14} className="flex-shrink-0" />
</Link>
```

`<ReadinessTrail>` = 14 dots in a horizontal row, each 6 px, spacing 3 px. Colored per that day's `store.logs[date].derived_state`. Zero decoration.

**Why this and not the donut:** the donut gives the user a *score to look at.* The 14-dot trail gives them their own honest log to look at. That's the difference between Whoop (score-driven) and Terav (log-driven). It's a data-viz upgrade, not a score-hero import.

**Why it moves the needle:** shows the founder's log-visualization ask (O17) in the space above the fold *every day*. Currently a green-state user sees a single line ("GREEN · Progress load. Nothing above 3/10.") and no context. With the trail, they see "today is green, and it follows a green-green-amber-green-green-green-amber-green sequence" — that's honest coach data. Also inverts nicely for red-flag users: a run of red dots is more alarming (correctly so) than a single red pill.

**Ship cost:** S-M (3 h — one small component, one 14-day derived-state selector, one prop pass; motion pass on the dot row uses the same reduced-motion gate).

**R-list compliance:** clean. Log honesty, not score autonomy (R8). No streak counter — "8 green in a row" is not surfaced; only the raw dots. No gamification (R5).

---

### Move 8 — Kill the plain 1 px border in favor of a shadow-plus-line for DashboardBlock only

**Current state:** DashboardBlock is `rounded border border-line-soft` (`DashboardBlock.tsx:91`). `border-line-soft` = `#24272f` — a 1 px hairline on the surface color. Every card has the same hairline. The primary/secondary hierarchy that Move 1 introduces via `surface-2` is helped, but hairlines everywhere still flatten the visual field.

**Proposed new state:** replace the outer hairline on DashboardBlock **only** with a shadow-and-line combo:

```css
/* DashboardBlock outer container */
box-shadow:
  0 0 0 1px var(--color-line-soft),           /* the hairline, now as a shadow */
  0 1px 2px 0 rgba(0, 0, 0, 0.35),            /* subtle 2 px drop */
  0 4px 12px -6px rgba(0, 0, 0, 0.5);         /* deeper 12 px halo, negative spread */
```

Inner cards (RetestCard, ExerciseCard, block-list) keep their plain `border-line-soft` hairline. This creates a **real** elevation difference: primary blocks *float*, contents *sit inside*.

**Why it moves the needle:** on warm-dark backgrounds a 4 px negative-spread shadow reads as physical depth, not as a "shadow" per se — the ground itself is dark, so the shadow just makes the card look closer to the viewer. This is the Refactoring UI / Rauno Freiberg move: shadows exist to signal depth on dark surfaces, not for decoration. Combined with Move 1's `surface-2` fill, the primary tier now (a) is a different color, (b) casts a soft shadow, (c) has an accent stripe from Move 6. Three subtle cues, one strong hierarchy.

**Ship cost:** S (30 min — CSS change in DashboardBlock, verify on both iOS Safari and Chrome that the shadow renders identically on `#0e0f12` ground).

**R-list compliance:** clean. Shadows aren't accents (R2), aren't photography (R1), aren't gamification (R5).

---

## 3. Rejected moves

- **Compact 60 px donut readiness ring (originally Move 7).** Rejected: it *is* a Whoop score-donut without the number in the middle. R8. The 14-day dot trail is the compliant alternative.
- **Full-bleed hero image behind Today H1** (not proposed by user, but tempting for "2026 feel"). Rejected on R1 — no photography, ever.
- **Streak indicator on the readiness trail** ("8 green in a row"). Rejected on R5 — a dot trail is honest history; a "streak" caption is gamification.
- **Recharts-based sparklines** (using the existing Recharts install). Rejected in favor of hand-rolled SVG (Move 4) — Recharts is 45 KB gzipped and Terav needs one chart primitive it can render inline in 14 sites. Custom SVG is 30 lines.
- **Removing mono-caps on eyebrows** (would "modernize" typographically but R4 says mono is Terav's identity). Rejected. Mono-caps stay.
- **A "readiness ring" progression at the top of Programs preview** (bar-fill showing "you're 6 of 8 weeks in"). Interesting but overlaps with the PerProgramAdherenceCard already on Progress. Deferred — revisit if the "completion progress" ask from O17 doesn't feel served by Move 4 sparklines + existing adherence bar.
- **Skeuomorphic press states on every button** (raised bezel, gradient fills). Rejected — the Move 5 bronze CTA elevation is bounded to the *primary* CTA. Every button being physical is 1998 not 2026.

---

## 4. Ordered ship plan (impact-per-hour)

| # | Move | Cost | Impact | Ship order |
|---|------|------|--------|------------|
| 1 | Surface-2 for DashboardBlock outer | S (30 min) | H | **First** — enables everything else |
| 2 | Bronze CTA elevation (Move 5) | S (2 h) | H | **Second** — most visible per-tap moment |
| 3 | DashboardBlock accent stripe on Today (Move 6) | S (1 h) | M-H | **Third** — bundles with surface-2 in the same PR |
| 4 | Typography scale bump (Move 2) | S-M (3 h) | H | **Fourth** — cross-file, but blocks nothing |
| 5 | Sparklines + 14-day trail (Move 4 + 7) | M (7 h) | **Highest** | **Fifth** — new component; ship after visual base settled |
| 6 | Motion pass (Move 3) | M (5 h) | H | **Sixth** — polish after data-viz lands |
| 7 | Shadow-and-line elevation (Move 8) | S (30 min) | M | **Seventh** — final flourish; needs surface-2 in place |

**Total effort:** ~19 h across 7 shippable pushes. Fits inside two work-days at Batch cadence.

**Recommended batching:**
- **Batch 33 — "surface tier + CTA":** Moves 1 + 5 + 6 + 8 (surface-2, bronze CTA, accent stripes on Today, shadow elevation). ~4 h. Ships as one commit; the founder should see the "1995 → 2026" jump immediately after this batch.
- **Batch 34 — "type + motion":** Moves 2 + 3. ~8 h. Refines the hierarchy and adds interaction feedback.
- **Batch 35 — "data-viz":** Moves 4 + 7. ~7 h. The Sparkline + ReadinessTrail primitives that give trend numbers a shape.

Ship Batch 33 first — it's the smallest total effort with the largest first-impression delta.

---

## 5. Files to touch

**`next-app/src/app/globals.css`**
- `:12` add `--color-surface-3` token (Move 1).
- `@theme` add `--motion-quick/base/slow` + `--ease-out/inout` tokens (Move 3).
- Extend `@media (prefers-reduced-motion: reduce)` block to include `[data-transition]` opt-in kill (Move 3).
- Add `.btn-bronze` utility class encapsulating Move 5's shadow-plus-active pattern.

**`next-app/src/components/DashboardBlock.tsx`**
- `:91` swap `bg-surface` → `bg-surface-2` (Move 1).
- `:91` replace `border border-line-soft` with `box-shadow` block (Move 8).
- `:128` bump title size 16 → 18 px, add `tracking-tight` (Move 2).
- `:146-170` wrap body in grid-row transition wrapper for smooth expand/collapse (Move 3).
- `:153, :162` replace primary CTA classes with the new `.btn-bronze` utility (Move 5).

**`next-app/src/components/session/TodaySession.tsx`**
- `:218` bump H1 weight 600 → 700 (Move 2).
- `:500-532` pass `accent={categoryAccent[g.program.category]}` to workout summary DashboardBlock (Move 6).
- `:551-576` pass `accent="slate"` to Extras block (Move 6).

**`next-app/src/components/workout/HeroStateCard.tsx`**
- `:51-66` compact mode: replace inline layout with the 14-day `<ReadinessTrail>` row (Move 7).
- `:85` bump the "No check yet" title inside the full card from `text-2xl` to `text-[24px] font-semibold` (typography ramp consistency — Move 2).

**`next-app/src/components/progress/RetestMetricsPanel.tsx`**
- `:51` bump section H2 15 → 17 px (Move 2).
- `:158-159` bump "Current" value 14 → 20 px, keep tabular-nums (Move 2).
- `:151-168` add `<Sparkline values={history} direction={metric.direction} />` component to the right of the Δ column (Move 4).

**New file — `next-app/src/components/charts/Sparkline.tsx`**
- 30-line SVG-only sparkline (Move 4).

**New file — `next-app/src/components/workout/ReadinessTrail.tsx`**
- 14-day dot row from `store.logs[*].derived_state` (Move 7).

**`next-app/src/components/workout/ExerciseCard.tsx`** (not read in this pass, but ships with Move 3)
- Mark-done set completion: add tick-in keyframe on the appearing checkmark (Move 3).

---

## Summary — what "2026 warm-dark" means in one paragraph

Terav's palette is already 2026. What's still 1995 is the **flatness of hierarchy** (every card the same border/fill), the **absence of data visualization** (numbers stand naked, no shapes), and the **silence of interaction** (nothing acknowledges the tap beyond a 60 ms scale). The 8 moves in this brief do not import photography, gamification, or a score-hero. They introduce (a) a second surface tier so primary objects look primary, (b) a real physical CTA affordance so the bronze button feels like a button, (c) a heavier weight ramp so titles lead body, (d) a 200 ms motion vocabulary so state changes acknowledge the user, (e) a sparkline primitive so trend numbers have shape, and (f) a 14-day readiness trail so today's state sits in log context. Every move is grounded in the tokens already declared in `globals.css` and the primitives already shipped in `DashboardBlock.tsx`. Nothing on the Rejected list is violated. Total ship cost: ~19 h across three batches.

Ship Batch 33 first (surface + CTA + accent + shadow, ~4 h). If it doesn't move the founder's "1995 → 2026" needle, none of the rest will.
