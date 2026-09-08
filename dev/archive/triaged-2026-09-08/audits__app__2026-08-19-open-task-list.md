# Open tasks — synthesis of 2026-08-19 audit round

Aggregated from four parallel agents run 2026-08-19:

- `2026-08-19-app-audit-visual-craft.md` (P0-P2)
- `2026-08-19-app-audit-mobile-ux.md` (P0, P1, P2)
- `2026-08-19-app-audit-motion-perf.md` (P0, P1, P2)
- `dev/active/product-concerns-2026-08-17/roadmap.md` (synced)

**Framing:** findings are **IDEAS**, not action items. Margus picks what to ship. Terav's confirm-first engine + rehab-not-fragile positioning override "cleaner is better."

---

## Section A — Real bugs (fix these regardless)

These are not "ideas" — they're broken code the audits happened to surface.

- [ ] **A1** `text-bronze-hi` on Profile avatar initial is an undefined token; renders as inherited `text-ink`. Either define `--color-bronze-hi` (target `#e2b686`) in `globals.css` or delete the class. `profile/page.tsx:154`
- [ ] **A2** `text-amber-strong` on interference banner heading — same undefined-token bug. Target `#f0b854`. `page.tsx:386`
- [ ] **A3** `PerProgramAdherenceCard` tri-color bar leaks a purple segment (likely `--color-lat-right` reused outside laterality). Remove the purple segment or add a documented semantic.
- [ ] **A4** Persona harness artifacts predate Batch 16 by ~24h. Re-run `dev/scripts/run-app-audit.sh` before the next audit so cross-references reflect current UI.

---

## Section B — P0 ideas (highest ROI)

### Mobile-UX (single P0, biggest impact of the round)

- [ ] **B1** **Reposition coach-proposal Accept/Ignore out of the ouch zone.** Currently at ~y=420 on 393×852 — all three personas. Terav's most differentiated surface — the confirm-first ceremony — needs the fingers to reach the buttons. Fix: sticky bottom bar above the nav for the active proposal's Accept/Ignore. `ProposalCard.tsx:236-251`

### Motion + perf (both carried over from 2026-08-18)

- [ ] **B2** **Lazy-import Sentry Replay + Feedback.** `sentry.client.config.ts:19` eager-imports even when DSN unset — ~100 KB gz shell tax. Wrap init in `if (DSN) { const Sentry = await import("@sentry/nextjs"); ... }`. Projected Today LCP delta on 4G cold: **-500-800 ms** (from ~2.6 s to ~1.9-2.1 s). Same fix flagged 2026-08-18 P0-1.
- [ ] **B3** **ProposalStack CLS reserve on Today.** `ProposalStack.tsx:28` returns `null` before `syncStable`, pushes HeroStateCard down when mounted. Fix: `<div className="min-h-[120px]">` while `!syncStable` or a transparent-tinted skeleton. Projected CLS: 0.08-0.15 → 0.00-0.02. Same fix as 2026-08-18 P0-4.

### Visual-craft (body-copy legibility)

- [ ] **B4** **Bump body copy `text-[13px]` → `text-[14px]` system-wide.** 212 hits in `src/`. Largest legibility gain remaining for a rehab app read at 6am. Also `text-[11px]` → `text-[12px]` on multi-line captions. Kill `text-[9px]`. Ship as one `sed`-driven batch. Target sizes: 32/20/15/14/12/10.

**Combined P0 batch estimate: 6-10h if bundled.**

---

## Section C — P1 ideas (this month)

### Mobile-UX

- [ ] **C1** Bottom-nav active-tab indicator — 4 px top-border in `bg-bronze` on active `<li>` (currently color + weight only).
- [ ] **C2** `HeaderQuickLinks` More button `w-9 h-9` (36 px) → `w-11 h-11` (44 px). `HeaderQuickLinks.tsx:73`
- [ ] **C3** Session-row icon buttons `w-8-9` → `w-11 h-11` (multiple files: `YourPlanCard.tsx:84`, `RunSlotCard.tsx:254, 303`, `RestTimer.tsx:85, 103, 114`).
- [ ] **C4** Heatmap cell min 44 px OR reduce to 6 columns for thumb-tappability.
- [ ] **C5** Week collapsed-row expand affordance (chevron) — currently the tap-target is discoverable only by trying.
- [ ] **C6** Legal-row link `min-h-[44px]` enforcement on Profile footer (post-Batch 16 collapse).
- [ ] **C7** Add `active:` / `focus-visible:` twins to top 20 `hover:` sites, or ship a `.tap-feedback` utility class. Systemic: 98 `hover:` usages, only 1 has a focus/active twin in `src/components/`.

### Motion + perf

- [ ] **C8** Coach caret `motion-safe:animate-pulse`. `coach/page.tsx:404`
- [ ] **C9** Profile skeleton `motion-safe:animate-pulse`. `profile/page.tsx:161`
- [ ] **C10** RestTimer `transition-[width]` + `motion-reduce:transition-none` (currently `transition-all duration-500`). `RestTimer.tsx:70`
- [ ] **C11** Coach smooth-scroll — read `prefers-reduced-motion` before setting `behavior: "smooth"`. `coach/page.tsx:193`
- [ ] **C12** Sentry Feedback widget position — currently floats over BottomNav. Either `{ autoInject: false }` + mount from Profile, or reposition. `sentry.client.config.ts:47`
- [ ] **C13** Drop `tracesSampleRate: 0.1` → `0.05` in prod (will burn free tier at beta scale).
- [ ] **C14** Lucide-react tree-shake verify — chunk `598-*` is suspiciously large. Run `next build --profile` before Batch 17.

### Visual-craft

- [ ] **C15** Rehab safety copy (`page.tsx:315-321` skill safety, `:299-307` interference, `:267-273` taper) — bump to 14 px minimum regardless of C-B4 system-wide. Safety copy at 13 muted is wrong.
- [ ] **C16** Icon size sprawl → 4 sizes. Kill 15, bump to 16 in `ExerciseCard.tsx:209, 222, 224` and `RunSlotCard.tsx:256`.
- [ ] **C17** Slate demotion on non-interactive left-borders — `border-l-slate` on `DayHeaderShortcut` (`page.tsx:538`) and `RestDayCard` variants (`page.tsx:999, 1023, 1033`) → `border-l-line`. Slate reserves for interactive/marker roles.
- [ ] **C18** Kill `text-muted/70` (6 usages). Two muted levels max; currently three.

---

## Section D — P2 ideas (nice to have)

- [ ] **D1** `overscroll-behavior-y: contain` on `<main>` to disable Safari pull-to-refresh on Today.
- [ ] **D2** Sticky Save-check button on `/check/` above the bottom nav (persona-recover P2).
- [ ] **D3** Heatmap disabled-cell guard for future/empty dates (persona-erratic).
- [ ] **D4** Report table mobile fallback confirmation (persona-erratic P2).
- [ ] **D5** `enableInp: true` on Sentry traces for free real-user INP signal.
- [ ] **D6** Memoise `rows` derivation in `SymptomLoadChart` (`:57-63`) — 3-line `useMemo`.
- [ ] **D7** `content-visibility: auto` on below-fold Today sections (RetestReminder, PerProgramActions, week-block).
- [ ] **D8** `beforeinstallprompt` handler — capture, offer custom "Add to Home Screen" from Profile after 3+ Today visits. Do NOT auto-prompt.
- [ ] **D9** Watch Week per-day cumulative expand shifts — add `content-visibility: auto` on off-screen day rows if CLS regresses.
- [ ] **D10** `ExerciseCard` padding standardization — pick per-child `px-3` OR outer `p-3`, not both.
- [ ] **D11** Programs list row `px-3 py-3` → `px-4 py-3.5` (aligns to Week card rhythm post-Batch-16).
- [ ] **D12** Block-category H2 mono-caps → sentence-case 15 px semibold. **Rejectable** — mono-caps IS Terav's identity; only revisit if a rehab-only user cohort emerges.
- [ ] **D13** Heatmap cell `rounded-[2px]` (GitHub-tier polish).
- [ ] **D14** `SymptomLoadChart` grid color `#2A2E37` → `--color-line-soft` (`#24272f`) — one rogue hex.

---

## Section E — Roadmap on-deck (from 2026-08-19 roadmap sync)

Founder-surfaced or previously scoped, all pre-Batch-17:

- [ ] **E1** Extend-by-N-weeks at graduation
- [ ] **E2** First-run tutorial overlay
- [ ] **E3** "Switch program" flow warning (currently silent)
- [ ] **E4** Sort catalog by difficulty/duration
- [ ] **E5** Retest-week UX polish
- [ ] **E6** Runna-style Week collapse+expand full impl (Batch 15 was partial — competitive audit steals: chevron affordance yes, drag-reschedule no)
- [ ] **E7** `/account` deep-link route so Delete has a real home (currently under `<details>` Danger zone)
- [ ] **E8** CSM amber-week hook (surfaces raised in Batch 5)
- [ ] **E9** Skill/mobility simulator logging

---

## Section F — Strategic gaps (founder decision needed)

From roadmap sync. These are not tasks — they're calls that need making.

- [ ] **F1** **F3 Coach chat** still shows "~1 week to productionize" but Coach was env-var-gated OFF and hidden from primary IA (`9eba1fa`). Drifting toward "quietly killed." **Decision:** ship it or explicitly kill it?
- [ ] **F2** **Concurrent-tracks Today audit** at `dev/active/concurrent-tracks-audit/plan.md` still says "half-satisfied." Batches 10-15 may have resolved it implicitly, but no formal close. **Decision:** re-open + close, or archive?
- [ ] **F3** **SaaS Phase 3 (billing/Paddle) is 0% done** — gates F6 paid-gating, F4 monetization, F2 Phase C, F3 turn-on. Real critical-path item for anything labeled "Paid." **Decision:** when does this become the top-of-stack?
- [ ] **F4** **F5 correlation view** is chicken-and-egg with beta data volume. **Decision:** set an explicit "N users × 90 days" trigger, or defer indefinitely?

---

## Section G — Do NOT ship (rejected on Terav constraints)

From visual-craft §16 + mobile-ux §10:

- Photography anywhere in the app.
- Second primary accent (nothing competing with bronze for CTA).
- H1 larger than 32 px (no Whoop score-donut, so no Whoop-scale hero).
- Softer mono-caps everywhere (mono = Terav's technical identity).
- Streak / challenge / gamification counters (violates confirm-first, cite-the-paper contract).
- Filling Coach empty-state fold (absence is honest).
- Runna-style drag-to-reschedule (breaks confirm-first — explicit MoveSheet is stronger).
- Whoop-style autonomous score-hero (wrong tone for confirm-first).
- Pliability-style "one arc per day" (Terav's multi-track is a deliberate feature).

---

## Suggested next-batch shape

If Batch 17 lands, the highest-ROI bundle is **B1 + B2 + B3 + B4 + A1 + A2** — roughly 8-12h of work delivering the biggest legibility, perf, and interaction fix simultaneously. Rest can decompose into a Batch 18 grouped around P1 items.

If the founder wants to pause UI batches and focus on **F1/F3** (strategic), that's also a defensible call — the audit round produced ~35 concrete ideas, and shipping them all vs. deciding on the billing/Coach fork is a real tradeoff.
