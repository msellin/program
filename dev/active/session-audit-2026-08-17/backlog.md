# Post-audit backlog (2026-08-17)

Consolidated from 10 specialist audits at `dev/audits/session-2026-08-17/`. All findings ranked by beta-blast-radius. Fix cost: S = ≤1h, M = 1-4h, L = ≥4h.

**Reconciliation pass 2026-08-18:** After three sittings of engine + UX work, tick these off — status verified against current codebase:
- B1 STALE (IntroGallery deleted; onboarding consolidated into OnboardingRunner)
- B2, B3, B6, B7 DONE (all four commits landed 2026-08-17 / 2026-08-18)
- M1 DONE (min-h-dvh sweep applied to landing sub-pages)
- M7 DONE (X-icon dismiss removed from ProposalCard, Ignore button is the semantic verb)
- A3 IntroGallery references STALE (component removed)
- A5 partial (Progress rebuild folded standalone card into WeeklyNarrativeTile)

Real open work count: from 44 unchecked → ~27 that are still real. B4 CLS, B5 empty-state copy, A1 sr-only h3 refactor, A2 contrast test, A6-A8 landing accessibility, M2-M6 mobile, and all P3-P5 items remain.

**None of these are ship-blockers.** Consensus verdict across all 10 audits was **go-with-caveats**. The list below is what would move the beta from "works" to "super smooth."

Grouped by theme, ordered within by impact. Check items off as you ship them.

---

## P0 · First-two-minutes user perception (fix batch first)

**~4h total. If you fix nothing else from this list, fix these seven.**

- [x] **B1 · Two first-run modals fire in sequence** (M) — ~~OnboardingRunner (2-4 program steps) then IntroGallery~~ **STALE 2026-08-18** IntroGallery deleted; onboarding consolidated into OnboardingRunner (which auto-dismisses on intake completion per #69 fix).

- [x] **B2 · `day_adjustment_soften` eyebrow reads timid** (S) — **DONE** ProposalCard.tsx now reads `"Signal · fatigue / pain flagged"` (verified proposal-citations map).

- [x] **B3 · `day_adjustment_soften` has `citationId: null`** — **DONE** proposal-citations.ts:26 → `day_adjustment_soften: "halson_2014"`. Halson 2014 wired as the training-load monitoring anchor.

- [ ] **B4 · CLS at first paint on Today** (S) — ProposalStack + Day1EmptyState mount post-hydration (~200-500ms), causing visible content shift. **PARTIAL** ProposalStack now gates on `updated_at > 0` (see ProposalStack.tsx:28), reduces first-paint shift. Full `min-height` reserve still open.

- [x] **B5 · "Rest of your week is still yours" appears in-app in exactly 1 place** (S) — **DONE** Day1EmptyState.tsx:32 now carries the line ("Terav writes the focus arc; the rest of your week is still yours.").

- [x] **B6 · Programs page frames as "browse catalog" not "pick your focus"** (S) — **DONE** verified: 7 refs to "Pick your focus" across programs page + EmptyStateCard + landing.

- [x] **B7 · `tm_bump` reason is 45 words** (S) — **DONE** adapt.ts shortened; "Small step; if it feels heavy…" removed.

---

## P1 · Accessibility (WCAG 2.2 AA gaps)

**~3h total. Non-blocking but each is a real fail.**

- [ ] **A1 · `sr-only <h3>` in ProposalCard duplicates visible eyebrow** (S) — Screen reader reads the section title twice. Delete the `sr-only` header; use the eyebrow as `aria-labelledby` target. → `app-accessibility #1` · `ProposalCard.tsx`

- [ ] **A2 · Muted body text on tinted proposal backgrounds** (S) — `text-muted` (~55% ground) on `bg-amber/10` / `bg-green/10` / `bg-slate/10` may drop below WCAG 4.5:1. Test contrast; bump to `text-ink` if failing. → `app-accessibility #2`

- [ ] **A3 · `useFocusTrap` restores focus to stale button** (M) — When OnboardingRunner dismisses, focus tries to return to `previouslyFocused.current` which may have unmounted. Falls through to `<body>`. Add fallback: focus `<h1>` or first `<a>` in `<main>`. Bug #5 from Phase 6, still open. → `app-accessibility #3` · `useFocusTrap.ts:50`

- [x] **A4 · IntroGallery lacks focus trap + `aria-labelledby`** (S) — **STALE 2026-08-18** IntroGallery deleted, no dialog to fix.

- [ ] **A5 · `<h2 id="day1-title">` orphaned without route `<h1>` above it** (S) — Day1EmptyState is the only heading on Today when it fires; page has no `<h1>Today</h1>` visible sibling. Either promote Day1EmptyState heading to `<h1>` when it's the only content, or ensure `sr-only <h1>` exists. → `app-accessibility #5`

- [ ] **A6 · H1_b `text-transparent` invisible in Windows Forced Colors mode** (S) — Gradient clip on H1_b breaks under `forced-colors: active`. Add `@media (forced-colors: active)` block in `globals.css`. → `landing-accessibility #1`

- [ ] **A7 · ThreeWayContrast desktop `<table>` missing `scope="col"` / `scope="row"`** (S) — With the new Scope row leading, screen readers can't associate cell → header on desktop. Add `scope` attrs. → `landing-accessibility #3` · `ThreeWayContrast.tsx:106-113`

- [ ] **A8 · H1_c is a `<p>`, not sibling to `<h1>`** (S) — Splits the hero utterance for NVDA/JAWS. Fold H1_c into the `<h1>` as a block-styled span. → `landing-accessibility #2`

---

## P2 · Mobile UX (beyond the Hero CTA fix)

**~3h total.**

- [x] **M1 · Sub-pages use `min-h-screen` not `min-h-dvh`** (S) — **DONE** min-h-dvh applied across evidence/roadmap/programs/programs-slug/LegalLayout.

- [ ] **M2 · Programs snap carousel dots are decorative** (S) — Five identical `bg-white/25` dots below the 5-card carousel with no active-state binding. Delete the dots (peek alone is affordance) OR wire `IntersectionObserver` on snap children. → `landing-mobile-ux #3` · `Programs.tsx:91-99`

- [ ] **M3 · Interactive cards are hover-only** (M) — 83 `hover:border` / `hover:bg` classes without `focus-visible:` / `active:` twins. Mobile visitors see no tap affordance. Add a `.card-interactive` utility in `globals.css`. → `landing-mobile-ux #4`

- [ ] **M4 · Hero stat row wraps at 393px** (S) — "5 programs" wraps to two lines at `font-mono text-lg`. Change to `text-base sm:text-xl leading-tight`. → `landing-mobile-ux #5` · `Hero.tsx:116-133`

- [ ] **M5 · Modal-stacking fragility is systemic** (S to patch, M to fix right) — The z-index issue we just patched (OnboardingRunner vs IntroGallery) can recur with `RestTimerHost`, `ConfirmSheet`. Introduce a modal-registry pattern OR normalize to a `z-modal-{n}` scale in globals. → `app-mobile-ux #1`

- [ ] **M6 · body + `<main>` compound bottom padding** (S) — Both apply `pb-[calc(64px+env(safe-area-inset-bottom))]`. Double-padding on iOS. Remove from one. → `app-mobile-ux #2`

- [x] **M7 · ProposalCard has two dismiss affordances** (S) — **DONE 2026-08-17** X-icon dismiss removed; Ignore button is the semantic verb (matches the landing promise).

- [ ] **M8 · 83 `hover:` classes without `focus-visible:` twins app-wide** (M) — Systemic. Same class of fix as M3 but scoped to the app. → `app-mobile-ux #4`

- [ ] **M9 · OnboardingRunner modal + iOS soft keyboard** (M) — When LifeLoadStep number picker steals focus, keyboard rises, modal doesn't reposition. → `app-mobile-ux #5`

---

## P3 · Visual craft

**~2h total.**

- [ ] **V1 · Chisel underline detaches from H1_b when line wraps** (S) — At 375px H1_b wraps to 2 lines; the `ChiselStroke` SVG stays anchored to the last line. Either constrain H1_b to one line via `whitespace-nowrap` on the span, or move the chisel into H1_b's flow. → `landing-visual-craft #1` · `Hero.tsx:62-68`

- [ ] **V2 · Scope row breaks row-height parity in mobile 2-col grid** (S) — "Your focus arc. The rest is still yours." is 41 chars, wraps to 3 lines while What/When rows are 2. Tighten to `"A focus arc. Rest stays yours."` (30 chars, 2 lines). → `landing-visual-craft #2` · `en.ts:30`

- [ ] **V3 · H1_c at 24px competes with sub for hierarchy weight** (S) — H1_c is `text-2xl` (24px), sub is `text-lg` (18px). H1_c should either grow (become primary emphasis line) or shrink (subordinate to H1). → `landing-visual-craft #3`

- [ ] **V4 · `text-balance` on H1 fights hardcoded `<br>`** (S) — Remove `text-balance` from the H1; rely on the manual `<br className="hidden sm:inline">` for the intended sm+ break. → `landing-visual-craft #4` · `Hero.tsx:59`

- [ ] **V5 · Slate token does three jobs in app** (M) — Slate is used for passive info + engine-cited proposals + opportunistic proposals. Ambiguous. Split into `slate-info` and `slate-cta` OR pick one job for slate. → `app-visual-craft #1`

- [ ] **V6 · CitationRef unicode `▾` vs lucide inconsistency** (S) — Every other expand affordance uses `<ChevronDown from lucide-react />`. CitationRef uses the unicode `▾` glyph. Switch to lucide. → `app-visual-craft #2` · `CitationRef.tsx`

- [ ] **V7 · `strokeWidth={1.9}` outlier in ExerciseCard** (S) — Every other lucide icon in the app uses `strokeWidth={1.75}` (default). Change to `1.75`. → `app-visual-craft #3` · `ExerciseCard.tsx`

- [ ] **V8 · ProposalStack tight stacking** (S) — `space-y-2` between stacked proposals feels crowded when two proposals fire simultaneously. Bump to `space-y-3`. → `app-visual-craft`

- [ ] **V9 · Primary-CTA convention collision** (S) — Bronze mono-caps buttons (`Apply lighter`) AND bronze sentence-case buttons (`Open morning check`) coexist. Pick one convention. → `app-visual-craft`

---

## P4 · Copy craft

**~2h total.**

- [ ] **C1 · Landing hero verb "sharpen" doesn't survive to app** (S) — App metadata title fixed; but `Day1EmptyState.tsx:32` says `"nothing before it means anything to sharpen"` (verb without object). Rewrite: `"One focus, sharpened every session — starts with today's check."` → `app-copy-clarity #4` · `Day1EmptyState.tsx:30`

- [ ] **C2 · `life_load` label conflicts with `scale_anchor` anchor words** (S) — Check page label says `"Life load (0=fresh, 10=wrecked)"`. Engine-builder onboarding says `"Cooked / running on fumes"`. Rowing says `"Cooked — pull is a grind"`. Four synonyms for one scale. Unify to `"Cooked"` at high anchor across all `scale_anchor.anchors.high` and the `/check` label. → `app-copy-clarity #5` · 6 JSONs + `check/page.tsx:156`

- [ ] **C3 · `"Pick my focus"` CTA lacks friction disclosure** (S) — Users don't know what happens after tap. Add micro-copy under CTA: "no card, no signup wall — email + password, 30 sec." → `landing-conversion-strategist #2`

- [ ] **C4 · Landing sub-pages don't reference the focused-improvement frame** (M) — `/evidence`, `/roadmap`, `/programs` all use pre-shift copy language. Sweep for "training plan" / "adaptive strength" refs. → cross-cutting

- [ ] **C5 · Landing says 88 studies; canonical library is 112** (S) — Kept at 88 because evidence page displays 88 selected. To honestly bump to 91: add the 3 new cites (Halson 2014, Rhea 2003, ACSM 2002) to `/evidence` display, then update the number. → `app-landing-alignment #5`

---

## P5 · Motion + perf

**~1h total. Mostly good post-Phase-1-6.**

- [ ] **MO1 · `animate-card-in` referenced in ProposalCard code but not defined** (S) — Class doesn't exist in the tree. Add a 120ms opacity+translateY keyframe with `prefers-reduced-motion` guard, OR remove the class name. → `app-motion-perf #1`

- [ ] **MO2 · Service-worker cache-key after domain migration** (S) — Users who visited `program-v2.pages.dev` may have the old SW cached, causing stale assets at `app.terav.fit`. Bump SW version to force re-fetch. → `app-motion-perf`

- [ ] **MO3 · Landing loads Inter + JetBrains Mono via `next/font/google`** (S) — Verify subset filter is Latin-only (not full CJK), verify `display: swap`. Both configured — verify no font-file bloat in build. → `landing-mobile-ux → motion-perf handoff`

---

## Cross-cutting engineering

- [ ] **X1 · CLAUDE.md line 6-7 still says "personal tracker for one user"** (S) — Stale post-SaaS-launch. Flagged twice now (positioning audit + this session). Update to reflect focused-improvement multi-user model.

- [ ] **X2 · Old `program` Cloudflare Pages project still 301-redirects to `program-v2.pages.dev`** (S) — Should now redirect to `app.terav.fit` instead. Repurpose as a proper canonical redirect. Alternative: delete once nothing references it.

- [ ] **X3 · Icons for iOS PWA splash** (M) — No custom splash images. Default Safari splash on Add-to-Home-Screen install. Build the ~15 sizes iOS wants for each device.

---

## Deferred with reason (do not fix now)

- **In-build programs shipping** — Draft JSONs at `next-app/public/data/programs/DRAFT/`. Waiting on founder review of research trail + 4 pending citations + Muscle-Up prerequisite framing.
- **Concurrent-tracks IA redesign** — Design brief at `dev/design-briefs/2026-08-17-concurrent-tracks-density.md`. Lowest priority per founder call (superadmin-only today).
- **FIT file ingestion** — Post-beta. Spec in `dev/active/saas-launch/future-features.md`.
- **Simulator matrix v2 actual re-run** — Analytical pass done. Full playwright rerun deferred to a fresh session.

---

## Suggested execution order

1. **P0 batch (~4h)** — first-two-minutes user perception fixes. Ship as one PR.
2. **P1 batch (~3h)** — accessibility. Ship as one PR.
3. **P2 batch (~3h)** — mobile UX. Ship as one PR.
4. **P3 + P4 + P5** — cosmetic polish. Ship as time permits.
5. Deferred items — separate sessions.

**Total P0+P1+P2 = ~10h of focused work to get the app from "works" to "polished."**
