# Master open-task list — Terav app

**Synth date:** 2026-08-19  ·  **Sources reconciled:** every 2026-08-17 / 08-18 / 08-19 audit + `dev/active/session-audit-2026-08-17/backlog.md` + `dev/active/post-audit-p0s/tasks.md` + `dev/active/product-concerns-2026-08-17/roadmap.md` + persona harness manifests.
**Batch 16 filter applied:** items about Profile identity chip, footer collapse + Danger zone, Week padding + Programs pill off header, or 32px H1s were shipped and removed from the open list — see the closed-items appendix at the bottom.
**Harness caveat:** persona artifacts at `next-app/tests/e2e/artifacts/personas/*/manifest.json` were generated ~24h before Batch 16 (mtime 2026-08-19 11:30). Every cross-reference to persona screenshots reflects pre-Batch-16 state until the harness reruns via `dev/scripts/run-app-audit.sh` (item A4).

---

## How to use this list

These are **IDEAS, not action items**. The engine + rehab-first positioning overrides "cleaner is better," so Margus picks what to ship. Batches ship in 6-12h chunks — don't try to close the whole list in one sitting, and respect the "no UI churn between audits" rule (each shipped batch should stand on its own before the next audit re-scans). Real bugs go first because they're broken code the audits happened to surface; everything else is prioritized by user-visible ROI. Sizing (S/M/L/XL) is per item.

**Counts by bucket:**

- **Bugs (fix regardless):** 4 items, ~1.5h
- **P0 (biggest ROI):** 4 items, ~8-12h
- **P1 (visible quality gap):** 55 items, ~30-40h
- **P2 (defensible polish):** 19 items, ~8-12h
- **Features on-deck:** 9 items, ~30-50h
- **Strategic (founder decision):** 4 items — decision, not build
- **Rejected:** 11 items — do not ship

Total open surface: **95 open ideas + 4 strategic + 11 rejected = 110 line items**. If shipped as batches of 6-12h, that's ~10-12 more batches to complete the visible backlog before the F-track paid features (F4/F5) become top-of-stack. Accessibility (P1-1 through P1-7) is a natural batch on its own — five of seven items carried from 2026-08-17.

---

## Status marker convention (multi-agent contract)

This file is the single source of truth across chat sessions and agents. Every task line is a Markdown checkbox — mutate it as work moves through the lifecycle:

- `- [ ]` **OPEN** — nobody has started. Default state.
- `- [~]` **IN PROGRESS** — someone is actively working on it. Append ` — @agent-name YYYY-MM-DD` so the next agent sees who claimed it. Example: `- [~] **P0-1** Reposition Coach... — @claude 2026-08-19`.
- `- [x]` **DONE** — shipped. Append ` — done YYYY-MM-DD, {commit-sha or "Batch N"}` and MOVE the line to the closed-items appendix at the bottom. Never leave a `[x]` in the open sections — it clutters priority scanning.
- `- [!]` **BLOCKED** — cannot proceed. Append ` — blocked: {why}`. Common reasons: awaiting founder decision (see Section F), needs data (N users × 90 days), or an upstream dependency.

**Protocol before starting work:**
1. Read the open sections (A → F) to check nothing you plan to touch is already `[~]` claimed.
2. Flip the item to `[~]` with your handle + date BEFORE editing code.
3. Ship, commit, then flip to `[x]` and move to the closed-items appendix in the same push.

**Protocol for new findings:**
- Add to the correct section with a fresh ID and `- [ ]`. Do NOT renumber existing IDs — they are stable references used in commit messages, PR descriptions, and future audits.
- If an item becomes obsolete (code refactored, finding no longer applies), strike in place with `~~- [ ] **P1-N** ...~~ obsolete: {why}` and move to the appendix.

Keep the convention terse — the four markers cover every state. Don't invent new ones.

---

## Section A — Real bugs (fix regardless)

- [ ] **A1** `text-bronze-hi` on Profile avatar initial is an undefined token; renders as inherited `text-ink`. Define `--color-bronze-hi` (target `#e2b686`) in `globals.css` or delete the class. Source: `2026-08-19-open-task-list.md` (A1). Files: `next-app/src/app/profile/page.tsx:154`. Size: S
- [ ] **A2** `text-amber-strong` on interference banner heading — same undefined-token bug. Target `#f0b854`, or drop the class. Source: `2026-08-19-open-task-list.md` (A2). Files: `next-app/src/app/page.tsx:386`. Size: S
- [ ] **A3** `PerProgramAdherenceCard` tri-color bar leaks a purple segment (likely `--color-lat-right` reused outside laterality). Remove or document the semantic. Source: `2026-08-19-open-task-list.md` (A3). Files: `next-app/src/components/PerProgramAdherenceCard.tsx`. Size: S
- [ ] **A4** Persona harness artifacts predate Batch 16 by ~24h. Re-run `dev/scripts/run-app-audit.sh` before the next audit round so cross-references reflect current UI. Source: `2026-08-19-open-task-list.md` (A4). Files: `dev/scripts/run-app-audit.sh`, `next-app/tests/e2e/artifacts/personas/`. Size: S

---

## Section B — P0 (highest ROI)

- [ ] **P0-1** Reposition coach-proposal Accept/Ignore out of the ouch zone (~y=420 on 393×852). Sticky bottom-of-viewport action row above the nav for the active proposal's Accept/Ignore — Terav's most differentiated surface must land in the thumb zone. Source: `2026-08-19-app-audit-mobile-ux.md` §2.1. Files: `next-app/src/components/workout/ProposalCard.tsx:236-251`. Size: M *(prev B1)*
- [ ] **P0-2** Lazy-import Sentry Replay + Feedback — eager `import * as Sentry` at `sentry.client.config.ts:19` ships ~100 KB gz whether DSN is set or not. Wrap in `if (DSN) { const Sentry = await import(...) }`. Projected Today LCP delta on 4G cold: **-500-800 ms** (2.6s → 1.9-2.1s). Source: `2026-08-19-open-task-list.md` (B2), `2026-08-18-motion-perf-sweep.md` §5. Files: `next-app/src/sentry.client.config.ts:19,47,59`. Size: M *(carried from 2026-08-18)*
- [ ] **P0-3** ProposalStack CLS reserve on Today. `ProposalStack.tsx:28` returns `null` before `syncStable`, pushes HeroStateCard down when mounted. Fix: `<div className="min-h-[120px]">` while `!syncStable` or a tinted skeleton. Projected CLS 0.08-0.15 → 0.00-0.02. Source: `2026-08-19-open-task-list.md` (B3), `2026-08-18-motion-perf-sweep.md` §3. Files: `next-app/src/components/workout/ProposalStack.tsx:28`. Size: S *(carried from 2026-08-18)*
- [ ] **P0-4** Bump body copy `text-[13px]` → `text-[14px]` system-wide (176-212 hits in `src/`). Largest legibility gain remaining for a rehab app read at 6am. Also `text-[11px]` → `text-[12px]` on multi-line captions; kill `text-[9px]`. One `sed`-driven batch. Target ramp: 32/20/15/14/12/10. Source: `2026-08-19-open-task-list.md` (B4), `2026-08-18-app-audit-visual-craft.md` P0-2. Files: `src/**/*.tsx`. Size: M *(carried from 2026-08-18)*

---

## Section C — P1 (ship this month)

### Accessibility (5 items carried from 2026-08-18 — WCAG 2.2 AA)

- [ ] **P1-1** Coach `<textarea>` has no accessible name — 4.1.2 / 3.3.2 P0 in the a11y sweep. Add `aria-label="Message coach"`. Source: `2026-08-18-accessibility-sweep.md` §3, `2026-08-17-app-audit-accessibility.md` §2.10. Files: `next-app/src/app/coach/page.tsx:309`. Size: S *(carried from 2026-08-17)*
- [ ] **P1-2** SetRow placeholder `text-line` (1.66:1) doubles as the prescription hint — 1.4.3 + 1.3.3 fail. `placeholder:text-line` → `placeholder:text-muted` + add `aria-describedby` sr-only prescription. Source: `2026-08-18-accessibility-sweep.md` §2.1, `2026-08-17-app-audit-accessibility.md` §2.8. Files: `next-app/src/components/workout/SetRow.tsx:73,95`. Size: S *(carried from 2026-08-17)*
- [ ] **P1-3** SliderRow visible `<label>` at `check/page.tsx:219` lacks `htmlFor` — mouse-tap on the word "Groin" doesn't focus the slider. 4.1.2. Add `htmlFor` or nest the input. Source: `2026-08-18-accessibility-sweep.md` §3, `2026-08-17-app-audit-accessibility.md` §6. Files: `next-app/src/app/check/page.tsx:219`. Size: S
- [ ] **P1-4** Today (`page.tsx:181`) and Profile (`profile/page.tsx:178`) h1s should be visible for parity with Coach/Week/Progress/History/Check. 2.4.6. Promote `sr-only` → visible `text-3xl` (or the ramp head token). Source: `2026-08-18-accessibility-sweep.md` §2.2. Files: `next-app/src/app/page.tsx:181`, `next-app/src/app/profile/page.tsx:178`. Size: S
- [ ] **P1-5** Events form (6 inputs), auth forms (sign-in / sign-up / reset-password — 6 inputs) — no `<label htmlFor>`. 4.1.2. Add. Source: `2026-08-18-accessibility-sweep.md` §3,6. Files: `next-app/src/app/events/page.tsx:111,119,134,146,157,168`, `next-app/src/app/(auth)/sign-in/page.tsx:147,158`, `(auth)/sign-up/page.tsx:167,181`, `reset-password/page.tsx:87,99`. Size: M
- [ ] **P1-6** Heatmap row headers (`Heatmap.tsx:135-144`) are `<span aria-hidden>` while wrapper has `role="grid"` — no row-header context for SR. Replace with `role="rowheader"` or drop the grid role. 1.3.1. Source: `2026-08-18-accessibility-sweep.md` §3. Files: `next-app/src/components/charts/Heatmap.tsx:135-144`. Size: S
- [ ] **P1-7** RestTimer `role="status" aria-live="polite"` wraps the per-second countdown — SR gets "1:30… 1:29…" 90×. Remove the outer live region; fire single `announce()` calls at start / 30s / 0. 4.1.3. Source: `2026-08-18-accessibility-sweep.md` §2.4. Files: `next-app/src/components/workout/RestTimer.tsx:60-64`. Size: S

### Mobile UX (thumb reach + tap targets)

- [ ] **P1-8** Bottom-nav active-tab indicator — add 4-px top-border in `bg-bronze` on active `<li>` (currently color + weight only). WCAG 1.4.1 + peripheral-vision affordance. Source: `2026-08-19-open-task-list.md` (C1), `2026-08-19-app-audit-mobile-ux.md` §2.3. Files: `next-app/src/components/nav/BottomNav.tsx:57-59`. Size: S
- [ ] **P1-9** `HeaderQuickLinks` More button `w-9 h-9` (36 px) → `w-11 h-11` (44 px). Apple 44. Source: `2026-08-19-open-task-list.md` (C2), `2026-08-18-mobile-ux-sweep.md` §2.2. Files: `next-app/src/components/nav/HeaderQuickLinks.tsx:73`. Size: S
- [ ] **P1-10** Session-row icon buttons `w-8-9` → `w-11 h-11` across YourPlanCard, RunSlotCard, RestTimer (7+ sites). Apple 44. Source: `2026-08-19-open-task-list.md` (C3), `2026-08-18-mobile-ux-sweep.md` §2.2. Files: `YourPlanCard.tsx:84`, `RunSlotCard.tsx:254,303`, `RestTimer.tsx:85,103,114`. Size: M
- [ ] **P1-11** RunSlotCard "Log session" / "Import GPX" links are `text-[13px]` with no min-height (~20px tall). Only extras entry point on 4/5 programs. Add `min-h-[44px] py-2`. Source: `2026-08-18-mobile-ux-sweep.md` §2.3. Files: `next-app/src/components/workout/RunSlotCard.tsx:578-593`. Size: S
- [ ] **P1-12** Heatmap cell min 44px OR reduce to 6 columns for thumb-tappability (currently 32px, 8 cols). Source: `2026-08-19-open-task-list.md` (C4), `2026-08-18-mobile-ux-sweep.md` §2.5. Files: `next-app/src/components/charts/Heatmap.tsx:135`. Size: M
- [ ] **P1-13** Week collapsed-row expand affordance — chevron on collapsed day rows; currently discoverable only by trying. Source: `2026-08-19-open-task-list.md` (C5). Files: `next-app/src/app/week/page.tsx`. Size: S
- [ ] **P1-14** Legal-row link `min-h-[44px]` enforcement on Profile footer (post-Batch 16 collapse). Currently ~16px hits; wrap inline links in `inline-flex items-center min-h-[44px] py-2`. Source: `2026-08-19-open-task-list.md` (C6), `2026-08-18-profile-mobile-ux.md` P0.1. Files: `next-app/src/app/profile/page.tsx:250-272`. Size: S
- [ ] **P1-15** Add `active:` / `focus-visible:` twins to top 20 `hover:` sites, or ship a `.tap-feedback` utility. 174 `hover:` app-wide, only 1 has a focus/active twin. iOS sticky-hover on first-tap. Source: `2026-08-19-open-task-list.md` (C7), `2026-08-18-mobile-ux-sweep.md` §2.1. Files: cross-cutting (`src/**`). Size: M
- [ ] **P1-16** Profile row residual `hover:` states — switch to `active:` on nav rows so iOS doesn't leave rows tinted after tap. Source: `2026-08-18-profile-mobile-ux.md` P1.2. Files: `next-app/src/app/profile/page.tsx:212,223,250,258,269`. Size: S
- [ ] **P1-17** ConfirmSheet body scroll lock on iOS Safari — page scroll behind the sheet is still active; rubber-band shifts the underlying Profile page. Add `document.body.style.overflow = 'hidden'` on open + `overscroll-behavior: contain`. Source: `2026-08-18-profile-mobile-ux.md` P1.4. Files: `next-app/src/components/ConfirmSheet.tsx:59-70`. Size: S
- [ ] **P1-18** ConfirmSheet close-X `-m-2` collides with wrapped-title baseline — tapping last character of a wrapped title cancels the sheet. Remove `-m-2`; add `pr-11` to title container. Source: `2026-08-18-profile-mobile-ux.md` P1.5. Files: `next-app/src/components/ConfirmSheet.tsx:75-82`. Size: S

### Motion + perf (mostly carried from 2026-08-18)

- [ ] **P1-19** Coach caret needs `motion-safe:animate-pulse` — unguarded Tailwind `animate-pulse`. Source: `2026-08-19-open-task-list.md` (C8), `2026-08-18-motion-perf-sweep.md` §2. Files: `next-app/src/app/coach/page.tsx:404`. Size: S
- [ ] **P1-20** Profile skeleton `motion-safe:animate-pulse`. Same class of gap. Source: `2026-08-19-open-task-list.md` (C9). Files: `next-app/src/app/profile/page.tsx:161`. Size: S
- [ ] **P1-21** RestTimer `transition-[width]` + `motion-reduce:transition-none` (currently `transition-all duration-500`). Source: `2026-08-19-open-task-list.md` (C10). Files: `next-app/src/components/workout/RestTimer.tsx:70`. Size: S
- [ ] **P1-22** Coach smooth-scroll — read `prefers-reduced-motion` before setting `behavior: "smooth"`. Source: `2026-08-19-open-task-list.md` (C11). Files: `next-app/src/app/coach/page.tsx:193`. Size: S
- [ ] **P1-23** Sentry Feedback widget position — floats over BottomNav on iPhone. Either `{ autoInject: false }` + mount from Profile, or reposition. Source: `2026-08-19-open-task-list.md` (C12), `2026-08-18-motion-perf-sweep.md` §5. Files: `next-app/src/sentry.client.config.ts:47`. Size: S
- [ ] **P1-24** Drop `tracesSampleRate: 0.1` → `0.05` in prod — will burn free tier at beta scale. Source: `2026-08-19-open-task-list.md` (C13), `2026-08-18-motion-perf-sweep.md` §5. Files: `next-app/src/sentry.client.config.ts`. Size: S
- [ ] **P1-25** Lucide-react tree-shake verify — chunk `598-*` is suspiciously large. Run `next build --profile` before Batch 17. Source: `2026-08-19-open-task-list.md` (C14), `2026-08-18-motion-perf-sweep.md` §4. Files: `next-app/package.json`, bundle. Size: S
- [ ] **P1-26** next/font weight explosion — no `weight: [...]` on Inter or JetBrains Mono → 13 woff2 files, ~305 KB. Set `weight: ["400","500","600"]` + `["400"]`. Cuts to ~90-110 KB. Source: `2026-08-18-motion-perf-sweep.md` §4. Files: `next-app/src/app/layout.tsx:11-21`. Size: S

### Visual craft

- [ ] **P1-27** Rehab safety copy at 13-muted is wrong — bump to 14 px minimum regardless of P0-4 sweep. Applies to skill safety, interference, taper blocks. Source: `2026-08-19-open-task-list.md` (C15). Files: `next-app/src/app/page.tsx:315-321, 299-307, 267-273`. Size: S
- [ ] **P1-28** Icon size sprawl → 4 sizes. Kill 15 px, bump to 16 in ExerciseCard and RunSlotCard. Source: `2026-08-19-open-task-list.md` (C16), `2026-08-19-app-audit-visual-craft.md`. Files: `ExerciseCard.tsx:209,222,224`, `RunSlotCard.tsx:256`. Size: S
- [ ] **P1-29** Slate demotion on non-interactive left-borders — `border-l-slate` on DayHeaderShortcut and RestDayCard variants → `border-l-line`. Slate reserves for interactive/marker roles. Source: `2026-08-19-open-task-list.md` (C17). Files: `next-app/src/app/page.tsx:538,999,1023,1033`. Size: S
- [ ] **P1-30** Kill `text-muted/70` (6 usages). Two muted levels max; currently three. Source: `2026-08-19-open-task-list.md` (C18). Files: 6 cross-cutting sites. Size: S
- [ ] **P1-31** Profile body-copy size collision — `text-sm` and `text-[14px]` used side-by-side for the same role. Delete `text-[14px]` in `profile/page.tsx`, use `text-sm` uniformly. Source: `2026-08-18-profile-visual-craft.md` P0-1. Files: `next-app/src/app/profile/page.tsx:140,181,214,225`. Size: S
- [ ] **P1-32** Profile card frame weight — Programs list + "More" nav use `border-line-soft` with no `bg-surface`, so containers read one z-layer below Progress/Today cards. Promote to `border-line-soft bg-surface`. Source: `2026-08-18-profile-visual-craft.md` P0-2. Files: `next-app/src/app/profile/page.tsx:171,208`. Size: S

### Copy clarity (post-2026-08-18)

- [ ] **P1-33** "HERITAGE" leaks into ProposalCard eyebrow — internal codename in a user-facing string. `Signal · HERITAGE non-responder pattern` → `Signal · not responding to current dose`. Source: `2026-08-18-app-audit-copy-clarity.md` §9 P0. Files: `next-app/src/components/workout/ProposalCard.tsx:320`. Size: S
- [ ] **P1-34** Cluster A/B/C chip labels — clinical prefix, drop to `Responding` / `Under-dosing` / `Not responding`. Cluster nomenclature moves to tooltip. Source: `2026-08-18-app-audit-copy-clarity.md` §3. Files: `next-app/src/components/HeritageClusterChip.tsx:60-66`. Size: S
- [ ] **P1-35** "Idempotent — resubmitting today overwrites, not duplicates" — engineering vocabulary. Rewrite: `Re-submitting today updates this entry — it won't duplicate.` Source: `2026-08-18-app-audit-copy-clarity.md` §4. Files: `next-app/src/components/workout/RetestLoggingSheet.tsx:73-76`. Size: S
- [ ] **P1-36** `Got it` accept verb on `non_responder_recommendation` breaks the accept-verb family (Apply/Advance/Log). Rewrite: `Acknowledge` or `See options`. Source: `2026-08-18-app-audit-copy-clarity.md` §2. Files: `next-app/src/components/workout/ProposalCard.tsx:342`. Size: S
- [ ] **P1-37** Citation IDs on `day_adjustment_soften` and `retest_due` proposals — engine paths don't populate `citationId` for these two kinds. Landing's "every change cites a study" claim still leaks unless engine wires them up. Source: `2026-08-18-app-audit-copy-clarity.md` §0, §9 (carryover from 2026-08-17). Files: engine adapt paths, `proposal-citations.ts`. Size: M
- [ ] **P1-38** Empty-state CTA on Profile — `Pick a program →` → `Pick your focus →`. Matches landing's `beta.cta_primary`. Source: `2026-08-18-profile-copy-clarity.md` §1. Files: `next-app/src/app/profile/page.tsx:204`. Size: S
- [ ] **P1-39** Delete-account body — 31-word comma-list. Rewrite: `Everything goes — logs, training maxes, morning checks, server copies. This cannot be undone.` (14 words). Source: `2026-08-18-profile-copy-clarity.md` §2. Files: `next-app/src/app/profile/page.tsx:293`. Size: S
- [ ] **P1-40** Per-metric verdict debug-dump on `non_responder_recommendation` — humanize metric names, drop `role`, map underscore-verdicts to phrases (`true_non_response` → `not responding`). Source: `2026-08-18-app-audit-copy-clarity.md` §2, §9 P1. Files: `next-app/src/components/workout/ProposalCard.tsx:184-195`. Size: S
- [ ] **P1-41** "compliance" in RetestLoggingSheet reads coach-speak. Label → `How closely did you hit the prescribed intensity? (optional)`. Placeholder → `e.g. 90 (you hit ~90% of the prescribed intensity). Blank = skip.` Source: `2026-08-18-app-audit-copy-clarity.md` §4, §9 P1. Files: `next-app/src/components/workout/RetestLoggingSheet.tsx:99-101,112`. Size: S
- [ ] **P1-42** WeeklyNarrativeTile expanded disclosure — double-header collision. In `inline` mode, drop `SignalCompletenessCard`'s "The engine sees" eyebrow; rename "Would additionally use" → `To sharpen more, add:`. Source: `2026-08-18-app-audit-copy-clarity.md` §6. Files: `next-app/src/components/SignalCompletenessCard.tsx:45-47,61-63`. Size: S
- [ ] **P1-43** Milestone header edge cases — no-TM state reads `TM —`; missed-milestone collides two parenthetical shapes; `🎉` emoji reads gamified. Rewrite: `No TM yet · next 140 kg in 40d`; `— missed Nd ago`; drop emoji. Source: `2026-08-18-app-audit-copy-clarity.md` §7. Files: `next-app/src/app/progress/page.tsx:409-425`. Size: S
- [ ] **P1-44** `retest_due` sub-line — `logging {metric}` is present-participle gerund. Change to `log {metric}`. Source: `2026-08-18-app-audit-copy-clarity.md` §2. Files: `next-app/src/components/workout/ProposalCard.tsx:178-181`. Size: S
- [ ] **P1-45** muscle-up short_description — drop the "reuses pull-up + handstand drill libraries" sentence (engineering-facing). Source: `2026-08-18-app-audit-copy-clarity.md` §8. Files: `next-app/public/data/programs/muscle-up.json`. Size: S
- [ ] **P1-46** engine-builder-block-2 short_description — 47 words with 3 technical concepts. Trim to first ~20 words for the catalog card; keep detail on program-detail page. Source: `2026-08-18-app-audit-copy-clarity.md` §8. Files: `next-app/public/data/programs/engine-builder-block-2.json`. Size: S
- [ ] **P1-47** `admin` badge label — internal word exposed. Change label to `staff`; tooltip drops "unlocked" gaming verb. Source: `2026-08-18-profile-copy-clarity.md` §3. Files: `next-app/src/app/profile/page.tsx:151`. Size: S
- [ ] **P1-48** `primary` badge — database-column noun leaking into UI. Change to `driving today` (or short `today's`). Source: `2026-08-18-profile-copy-clarity.md` §4. Files: `next-app/src/app/profile/page.tsx:185`. Size: S
- [ ] **P1-49** `since Aug 2025` — no verb, reads debug. Change to `joined Aug 2025`. Source: `2026-08-18-profile-copy-clarity.md` §5. Files: `next-app/src/app/profile/page.tsx:156`. Size: S
- [ ] **P1-50** `How this app works` nav label — dev language. Change to `Guide` (matches route + H1). Source: `2026-08-18-profile-copy-clarity.md` §6. Files: `next-app/src/app/profile/page.tsx:227`. Size: S
- [ ] **P1-51** Sign-out ConfirmSheet body — em-dash flourish reads over-warm. Rewrite: `Your data is synced. Sign in from any device to pick back up.` Source: `2026-08-18-profile-copy-clarity.md` §7. Files: `next-app/src/app/profile/page.tsx:282`. Size: S

### Landing→app promise gaps (still open from 2026-08-17)

- [ ] **P1-52** Match "three domains" hero label to app's actual 5-category taxonomy (or vice-versa). Landing says "Aerobic / Concurrent / Skill"; app says 5 category chips. Source: `2026-08-17-app-audit-landing-alignment.md` §2 row 3, §6. Files: `landing/src/i18n/dictionaries/en.ts`, `next-app/public/data/programs/manifest.json`. Size: S
- [ ] **P1-53** Surface each program's cited studies in the app program card (landing shows "Cites: Helgerud 2007 · Seiler 2010"; app doesn't). Data lives in program JSONs — rendering gap only. Source: `2026-08-17-app-audit-landing-alignment.md` §6, row 17. Files: `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx`, `programs/page.tsx`. Size: M
- [ ] **P1-54** Wire an in-app Evidence link — Guide lists studies in prose; a dedicated `/evidence` inside the app honours landing's evidence claim inside the walled garden. Source: `2026-08-17-app-audit-landing-alignment.md` §6. Files: `next-app/src/app/evidence/page.tsx` (new). Size: M
- [ ] **P1-55** Unify intake experience — hip program's 3-question modal is a different beast than the 17-step wizard. Either promote hip to wizard or the landing "under ten minutes" claim doesn't apply uniformly. Source: `2026-08-17-app-audit-landing-alignment.md` §6. Files: hip intake flow, `IntakeClient.tsx`. Size: L

---

## Section D — P2 (defensible polish)

- [ ] **P2-1** `overscroll-behavior-y: contain` on `<main>` to disable Safari pull-to-refresh on Today. Source: `2026-08-19-open-task-list.md` (D1). Files: `next-app/src/app/globals.css`. Size: S
- [ ] **P2-2** Sticky Save-check button on `/check/` above the bottom nav. Source: `2026-08-19-open-task-list.md` (D2). Files: `next-app/src/app/check/page.tsx`. Size: S
- [ ] **P2-3** Heatmap disabled-cell guard for future/empty dates. Source: `2026-08-19-open-task-list.md` (D3). Files: `next-app/src/components/charts/Heatmap.tsx`. Size: S
- [ ] **P2-4** Report table mobile fallback confirmation. Source: `2026-08-19-open-task-list.md` (D4). Files: `next-app/src/app/report/page.tsx`. Size: S
- [ ] **P2-5** `enableInp: true` on Sentry traces for free real-user INP signal. Source: `2026-08-19-open-task-list.md` (D5). Files: `next-app/src/sentry.client.config.ts`. Size: S
- [ ] **P2-6** Memoise `rows` derivation in `SymptomLoadChart:57-63` — 3-line `useMemo`. Source: `2026-08-19-open-task-list.md` (D6). Files: `next-app/src/components/charts/SymptomLoadChart.tsx:57-63`. Size: S
- [ ] **P2-7** `content-visibility: auto` on below-fold Today sections (RetestReminder, PerProgramActions, week-block). Source: `2026-08-19-open-task-list.md` (D7). Files: `next-app/src/app/page.tsx`. Size: S
- [ ] **P2-8** `beforeinstallprompt` handler — capture, offer custom "Add to Home Screen" from Profile after 3+ Today visits. Do NOT auto-prompt. Source: `2026-08-19-open-task-list.md` (D8), `2026-08-18-motion-perf-sweep.md` §6. Files: `next-app/src/app/profile/page.tsx`, PWA glue. Size: M
- [ ] **P2-9** Watch Week per-day cumulative expand shifts — add `content-visibility: auto` on off-screen day rows if CLS regresses. Source: `2026-08-19-open-task-list.md` (D9). Files: `next-app/src/app/week/page.tsx`. Size: S
- [ ] **P2-10** `ExerciseCard` padding standardization — pick per-child `px-3` OR outer `p-3`, not both. Source: `2026-08-19-open-task-list.md` (D10). Files: `next-app/src/components/workout/ExerciseCard.tsx`. Size: S
- [ ] **P2-11** Programs list row `px-3 py-3` → `px-4 py-3.5` (aligns to Week card rhythm post-Batch-16). Source: `2026-08-19-open-task-list.md` (D11). Files: `next-app/src/app/programs/page.tsx`. Size: S
- [ ] **P2-12** Heatmap cell `rounded-[2px]` (GitHub-tier polish). Source: `2026-08-19-open-task-list.md` (D13). Files: `next-app/src/components/charts/Heatmap.tsx`. Size: S
- [ ] **P2-13** `SymptomLoadChart` grid color `#2A2E37` → `--color-line-soft` (`#24272f`) — one rogue hex. Source: `2026-08-19-open-task-list.md` (D14). Files: `next-app/src/components/charts/SymptomLoadChart.tsx`. Size: S
- [ ] **P2-14** SymptomLoadChart data-table expander — restore `<details><summary>Data table</summary>` fallback for sighted keyboard users. Source: `2026-08-18-accessibility-sweep.md` §5, §8. Files: `next-app/src/components/charts/SymptomLoadChart.tsx:159-162`. Size: S
- [ ] **P2-15** Coach message list — add `role="log" aria-live="polite" aria-atomic="false"`. Source: `2026-08-18-accessibility-sweep.md` §3. Files: `next-app/src/app/coach/page.tsx:283`. Size: S
- [ ] **P2-16** InfoSheet close glyph — swap ASCII `×` for lucide `<X size={18} />` to match ConfirmSheet. Source: `2026-08-18-accessibility-sweep.md` §2.3. Files: `next-app/src/components/InfoSheet.tsx:43-50`. Size: S
- [ ] **P2-17** Intake `aria-live="polite"` on the whole step body — over-broad. Scope to the step-counter. Source: `2026-08-18-accessibility-sweep.md` §3. Files: `next-app/src/app/programs/[slug]/intake/IntakeClient.tsx:746`. Size: S
- [ ] **P2-18** RetestLoggingSheet "Log reading" primary disable while `value === ""`. Source: `2026-08-18-accessibility-sweep.md` §6, §8. Files: `next-app/src/components/workout/RetestLoggingSheet.tsx:138-144`. Size: S
- [ ] **P2-19** HSW physical-test range labels — swap word order so bodily description leads (`Barely bends back — under 45°`), applies to 4 wrist + 4 shoulder ranges. Also `Passes behind vertical without effort` (drop "hyper-mobile"). Skip button `Skip all physical tests →` → `Skip physical tests →`. Source: `2026-08-18-app-audit-copy-clarity.md` §5, §9 P2. Files: `next-app/public/data/programs/handstand-walk.json:376-427`, `IntakeClient.tsx:1246-1248,1282`. Size: S

---

## Section E — Features on-deck

From roadmap sync + product-concerns-2026-08-17. All pre-Batch-17 and founder-surfaced.

- [ ] **F1** Extend-by-N-weeks at graduation — Batch 12 shipped feedback + repeat-arc; extending an existing arc without full re-enrol is the next affordance. Source: `2026-08-19-open-task-list.md` (E1), `product-concerns-2026-08-17/roadmap.md`. Files: graduation flow, `GraduationCard.tsx`. Size: M
- [ ] **F2** First-run tutorial overlay on Today — carried from Phase 4 SaaS-launch tasks; skippable, one-shot. Source: `2026-08-19-open-task-list.md` (E2). Files: Today shell, new component. Size: M
- [ ] **F3** Switch-program flow warning — Phase 2 catalog UI gap; multi-program is live, but "switch primary" confirmation is missing. Source: `2026-08-19-open-task-list.md` (E3). Files: Profile programs list + ConfirmSheet. Size: S
- [ ] **F4** Sort catalog by difficulty/duration — filter shipped, sort didn't. Source: `2026-08-19-open-task-list.md` (E4). Files: `next-app/src/app/programs/page.tsx`. Size: S
- [ ] **F5** Retest-week UX polish — HERITAGE Phase 5 shipped scheduler; "you're at the end" state + post-retest actions (extend / switch / take break / graduate) still need tightening. Source: `2026-08-19-open-task-list.md` (E5). Files: retest flow, Progress. Size: M
- [ ] **F6** Runna-style Week collapse+expand full impl — Batch 15 shipped collapse-by-default; expanded state, Move-sheet, per-row `Open in Today / Move… / Skip` verbs still open. Source: `2026-08-19-open-task-list.md` (E6). Files: `next-app/src/app/week/page.tsx`, new `MoveSheet.tsx`. Size: L
- [ ] **F7** `/account` deep-link route so Delete has a real home — Batch 16 removed Delete from Profile footer equal-weight row; identity-chip-tap destination `/account` is the proper home. Source: `2026-08-19-open-task-list.md` (E7). Files: new `next-app/src/app/account/page.tsx`. Size: S
- [ ] **F8** CSM amber-week drop-4×4 hook — engine consumer for a rule already documented in `concurrent-strength-maintenance.json`. Founder-decision whether to ship for first CSM paid user or defer. Source: `2026-08-19-open-task-list.md` (E8). Files: engine adapt path, CSM program JSON. Size: M
- [ ] **F9** Skill/mobility exercise logging in simulator — blocks adaptation verification for handstand-walk + overhead-mobility retest windows. Source: `2026-08-19-open-task-list.md` (E9). Files: persona harness, simulator matrix. Size: M

---

## Section F — Strategic (founder decision needed)

Not tasks — calls to make.

- [ ] **S1** F3 Coach chat still shows "~1 week to productionize" but Coach is env-var-gated OFF and hidden from primary IA (`9eba1fa`). Drifting toward "quietly killed." **Decision:** ship it or explicitly kill it? Source: `2026-08-19-open-task-list.md` (F1), `product-concerns-2026-08-17/roadmap.md`.
- [ ] **S2** Concurrent-tracks Today audit at `dev/active/concurrent-tracks-audit/plan.md` still says "half-satisfied." Batches 10-15 may have resolved implicitly. **Decision:** re-open + close, or archive? Source: `2026-08-19-open-task-list.md` (F2).
- [ ] **S3** SaaS Phase 3 (billing/Paddle) is 0% done — gates F6 paid-gating, F4 monetization, F2 Phase C, F3 turn-on. Real critical-path item for anything labeled "Paid." **Decision:** when does this become top-of-stack? Source: `2026-08-19-open-task-list.md` (F3), `product-concerns-2026-08-17/roadmap.md`.
- [ ] **S4** F5 correlation view is chicken-and-egg with beta data volume. **Decision:** set explicit "N users × 90 days" trigger, or defer indefinitely? Source: `2026-08-19-open-task-list.md` (F4).

---

## Section G — Rejected (do NOT ship)

Deduplicated across visual-craft §16 + mobile-ux §10 + roadmap:

- [ ] **R1** Photography anywhere in the app.
- [ ] **R2** Second primary accent — nothing competes with bronze for CTA.
- [ ] **R3** H1 larger than 32 px — no Whoop score-donut, no Whoop-scale hero.
- [ ] **R4** Softer mono-caps everywhere — mono is Terav's technical identity.
- [ ] **R5** Streak / challenge / gamification counters — violates confirm-first, cite-the-paper contract.
- [ ] **R6** Filling Coach empty-state fold — absence is honest.
- [ ] **R7** Runna-style drag-to-reschedule — breaks confirm-first; explicit MoveSheet is stronger.
- [ ] **R8** Whoop-style autonomous score-hero — wrong tone for confirm-first.
- [ ] **R9** Pliability-style "one arc per day" — Terav's multi-track is a deliberate feature.
- [ ] **R10** Video form analysis as paid pillar — Concern C evidence stands (kill from `product-concerns-2026-08-17/roadmap.md`).
- [ ] **R11** Cross-user note aggregation at beta scale — Concern D, deferred until N > 1000.

---

## Closed items appendix (shipped since 2026-08-17)

Strikethrough preserves history; these items are OUT of the open list.

**Batch 16 (deployed https://4df8a948.program-v2.pages.dev):**
- ~~Profile identity chip on the top row~~
- ~~Profile footer collapse with Danger-zone disclosure~~
- ~~Week padding + Programs pill moved off header~~
- ~~32-px H1s (GOWOD-scale visual system)~~

**post-audit-p0s/tasks.md — shipped 2026-08-17 / 2026-08-18:**
- ~~A1 Overperformer engine bump (`evaluateOverperformer` at `adapt.ts:395`)~~
- ~~A2 Study citations on proposals (`CitationRef` component + `proposal.citationId`)~~
- ~~A3 Rehab absent from catalog — softened via landing hero rewrite~~
- ~~A4 Evidence claim shortfall — landing softened to "88 primary studies"~~
- ~~A5 Accept/Ignore visibility at rest (SignalsStrip → ProposalStack rebuild)~~
- ~~A6 "Two more in build" → "Three more"~~
- ~~A9 Non-academic citations in engine-builder — 3 refs removed~~
- ~~A10 Handstand-walk citations — not-a-bug (audit misread ref shape)~~
- ~~B1 StreakChip removed (contradicted "Not a streak game")~~
- ~~B2 History spam of empty days — filter applied~~
- ~~B3 Program-agnostic onboarding — OnboardingRunner reads `program.onboarding_steps[]`~~
- ~~B4 Coach dead surface — flagged `superAdminOnly: true` in HeaderQuickLinks~~
- ~~C1 `user-scalable=no` removed~~
- ~~C2 Focus ring `bronze/40` → solid bronze (21 form sites)~~
- ~~C3 `border-line` bumped from `#2a2e37` → `#3a3f4a` (partial; 1.87:1)~~
- ~~C4 Today `<h1 className="sr-only">Today</h1>` added~~
- ~~C5 Profile `<h1 className="sr-only">Profile</h1>` added~~
- ~~C6 Shell-level `aria-live` region + `announce()` helper wired to Accept handlers~~
- ~~C7 SymptomLoadChart wrapped in `<div role="img" aria-label>` + data-table fallback (fallback deleted later — see P2-14)~~
- ~~C8 All 6 `window.confirm()` sites replaced with ConfirmSheet~~
- ~~D1 PWA standalone top-inset — `env(safe-area-inset-top)` on header~~
- ~~D2 Bottom nav hides on iOS soft-keyboard rise (`useKeyboardOpen()`)~~
- ~~D3 Heatmap cells enlarged (option A — 8 weeks × 32px)~~
- ~~E1 Type-scale sprawl — half-px classes eliminated (0 hits)~~
- ~~E2 Bottom-nav label 9 → 10px + tracking bump~~
- ~~E3 Rogue green primary CTA on ReadinessProposal → bronze~~
- ~~F1 `prefers-reduced-motion` coverage on main / pulse-accept / mark-done-flash / button:active~~
- ~~F3 Dead deps (date-fns) + dead CSS (`@keyframes card-in`) removed~~
- ~~G1 Persona test-user domain moved to `@example.test`~~
- ~~G2 Prompt-injection guard added to `run-app-audit.sh`~~
- ~~G4 Stale audit reports directory deleted~~

**session-audit-2026-08-17/backlog.md — shipped 2026-08-17 / 2026-08-18:**
- ~~B1 Two first-run modals in sequence — IntroGallery deleted, OnboardingRunner consolidated~~
- ~~B2 `day_adjustment_soften` eyebrow reads timid — `Signal · fatigue / pain flagged`~~
- ~~B3 `day_adjustment_soften` citation — `halson_2014` wired~~
- ~~B5 "Rest of your week is still yours" — surfaced on Day1EmptyState~~
- ~~B6 Programs "browse catalog" → "Pick your focus" (7 refs)~~
- ~~B7 `tm_bump` reason trimmed~~
- ~~A1 ProposalCard sr-only `<h3>` refactor~~
- ~~A2 Muted text on tinted proposal bg — verified 5.09-5.31:1 (passes)~~
- ~~A3 `useFocusTrap` isConnected guard + fallback chain~~
- ~~A4 IntroGallery focus trap — component deleted~~
- ~~A5 `<h2 id="day1-title">` orphan resolved by sr-only H1 above~~
- ~~A6 H1_b `text-transparent` in forced-colors (landing scope)~~
- ~~A7 ThreeWayContrast `scope="col/row"`~~
- ~~M1 Sub-pages `min-h-dvh`~~
- ~~M2 Programs snap carousel dots decorative → deleted~~
- ~~M4 Hero stat row wraps at 393px~~
- ~~M6 body + main compound bottom padding~~
- ~~M7 ProposalCard dual dismiss — X-icon removed~~
- ~~M9 OnboardingRunner + iOS soft keyboard (top-align + overflow-y-auto)~~
- ~~V2 Scope row row-height parity — copy tightened~~
- ~~V4 `text-balance` on Hero H1 fights hardcoded `<br>` — text-balance removed~~
- ~~V6 CitationRef unicode `▾` → lucide ChevronDown~~
- ~~V7 `strokeWidth={1.9}` outlier on AlertTriangle → 1.75~~
- ~~V8 ProposalStack tight stacking — `space-y-3` applied~~
- ~~C1 Landing "sharpen" survives to app — Day1EmptyState "One focus, sharpened every session."~~
- ~~C2 `life_load` vs `scale_anchor` unified on "cooked"~~
- ~~MO1 `animate-card-in` referenced but not defined — class removed~~

**Post-audit reconciliation notes (2026-08-18 sweep):**
- Concurrent-tracks Today audit — largely implemented via Batches 10-14, formal close still open → moved to S2.
- F6 Concurrent tracks — free-tier shipped; paid gate pending billing → covered by S3.
- F1 Signal-completeness surface — Path 1 shipped 2026-08-18.
- F2 Phase A — admin-only weekly note-keyword scan queue shipped 2026-08-18.

---

**End of file.** Next audit round should re-run `dev/scripts/run-app-audit.sh` first (item A4) so cross-references reflect current UI.
