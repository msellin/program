# Flow-grade — full journey after Phases 1-4

Owner: product-design-lead
Written: 2026-08-17
Status: draft — awaiting founder review
Related briefs: `dev/design-briefs/2026-08-17-a2-study-citations-on-proposals.md`, `dev/design-briefs/2026-08-17-a5-accept-ignore-visibility.md`, `dev/design-briefs/2026-08-17-b3-program-agnostic-onboarding.md`
Related audits: `dev/audits/app/2026-08-17-app-audit-*.md`

---

## The verdict

**Go with two-caveat fixes before beta.** The arc holds together. From signup to second-day loop the product reads as one product — the landing promise ("You log a note. Engine proposes. You Accept or Ignore.", `landing/src/i18n/dictionaries/en.ts:48`) is now literally the mechanic that runs on Today. The two things that make it hold: (a) `ProposalStack` (`next-app/src/components/workout/ProposalStack.tsx:19`) collapses to `null` when the engine is quiet, so the fold never carries dead furniture; (b) `OnboardingRunner` (`next-app/src/components/onboarding/OnboardingRunner.tsx:33`) is program-scoped by dismiss key, so the intake surface stays honest across program switches.

The two things that break — both compositional, both invisible to the per-decision briefs — are the **LifeLoad-7-to-instant-soften-proposal handoff** and the **ProposalStack duplicated on Today AND Progress**. Both need to be fixed before a beta user sees Today for the first time. Neither is a rebuild; both are ~4-6h of surgical edits.

---

## Per-transition grade table

| # | Transition | Grade | Finding (one line) | Fix cost |
|---|-----------|-------|---------------------|----------|
| 1 → 2 | Signup → `/programs` catalog | pass | `AuthGate` (`AuthGate.tsx:22-40`) + `NoActiveProgram` (`app/page.tsx:351`) both push to `/programs`; consistent entry. | — |
| 2 → 3 | Program pick → onboarding fires on next Today visit | pass | `OnboardingRunner` gated to `isTodayRoute` in `AppShell.tsx:110`; per-program dismiss key at `OnboardingRunner.tsx:43`. Correct. | — |
| 3 → 4 | Onboarding dismiss → first Today paint | **broken** | LifeLoad ≥ 7 → immediate `day_adjustment_soften` proposal on the very screen the user just unblocked. Reads as a bug. See Bug #1. | S (2h) |
| 4 → 5 | Today (empty) → `/check` | friction | Empty Today shows `HeroStateCard` full-card CTA into `/check` (`HeroStateCard.tsx:93-99`), but `SignalsStrip`'s "morning check overdue" is suppressed on day 1 (`SignalsStrip.tsx:94-98`) — good; **but** `ProposalStack` and `HeroStateCard` render one under the other with no headline, so a fresh user gets a colour-strip on `HeroStateCard` and, if their LifeLoad flagged, a competing amber proposal above it. Two amber cards, one problem. | S (1h) |
| 5 → 6 | `/check` save → back to Today, first proposal Accept | friction | Save button doesn't route back to Today (`app/check/page.tsx:185-191`) — the Verdict banner renders inline. User has to tap the bottom-nav Today tab manually. Fine for a repeat user, cold for a first one. | S (1h) |
| 6 → 7 | Proposal Accept → first session | pass | `ProposalCard.onAccept` (`ProposalCard.tsx:27-67`) mutates through the correct action per kind, records outcome, announces via `announce()` (`lib/announce.ts:16`) into the shell-level `#app-status` region (`AppShell.tsx:160`). SR announcement fires **before** the card unmounts because `announce()` writes synchronously before `recordProposalOutcome` triggers the next store select. | — |
| 7 → 8 | Session done → next day | friction | Overperformer TM-bump ineligible on 5 of 6 programs (`adapt.ts:367-373`) — only anterior-hip-rebuild ever fires A1. Intent may be right but nothing tells the user that. See Bug #4. | M (3h) |

---

## Top 5 compositional bugs

### Bug #1 — LifeLoad-7 → immediate soften-proposal on first-ever Today paint

**The bug.** A fresh user picks Engine Builder, lands on Today, and `OnboardingRunner` fires. Step 2 is `LifeLoadStep` (`OnboardingRunner.tsx:106-107`). If the user taps `7`, `LifeLoadStep.handlePick` (`LifeLoadStep.tsx:22-28`) writes `symptoms.life_load = 7` to today's log via `setDaySymptoms` — with `derived_state` preserved as `null` because there's no other symptom data yet. User taps Next → Start → the modal dismisses. Today re-renders. `ProposalStack` runs `selectProposals` → `selectDayAdjustment` → `daySignals(today)` sees `life_load: 7 ≥ 7` (`note-signals.ts:161-164`), sets `fatigue: "high"`, `proposedLoadMultiplier` returns `{ multiplier: 0.9, reason: "High fatigue / outside load detected..." }` (`note-signals.ts:239-246`). **First proposal the user ever sees, one second after they finished onboarding, is "Apply 10% lighter today?" — before they've done a single session on the app.** For Engine Builder specifically, there is no strength load to soften: it's a Z1-2 aerobic program. The proposal is nonsensical against the program.

**Reproduction.** Fresh signup → `/programs` → pick `engine-builder` → land on Today → onboarding modal → step 2 → tap 7 → Start. Observe: amber "Not feeling 100%?" proposal card as first thing on empty Today.

**Recommended fix.** Two-part, do both:
1. **Suppress the same-day soften proposal when the only signal is a life_load value the user just wrote in onboarding.** In `selectDayAdjustment` (`next-app/src/lib/proposals/select.ts:38-69`), add a guard: if today's log has `life_load` set but **no other logged notes, exercises, or runs**, and no other days in the last 3 have signals either, return `null`. Rationale: a first-tap onboarding value is not "evidence the day is going sideways" — it's baseline calibration. Real signals need at least one training day OR a stiffness/pain checkbox to substantiate.
2. **Scope `day_adjustment_soften` to programs with strength load to soften.** Engine Builder, Rowing 2K, Handstand Walk, Overhead Mobility have no strength target for a 0.9 multiplier to apply to. Multiplier proposal against these programs is category-error. Add a `SOFTEN_INELIGIBLE_PROGRAMS` mirror of `TM_BUMP_INELIGIBLE_PROGRAMS` at `adapt.ts:367`, or bake it into `selectDayAdjustment`.

**Cost.** S — 2h. One guard clause + one Set constant. Ship in the same commit.

### Bug #2 — `ProposalStack` renders on Today AND Progress simultaneously

**The bug.** Phase 3 (A5) wired `<ProposalStack>` into `next-app/src/app/page.tsx:168` **and** `next-app/src/app/progress/page.tsx:246`. When a proposal is live, the same card renders on both surfaces. If a user Accepts on Today, the store mutates and the card disappears on both — that part is fine. But: the composition is incoherent. Progress is the "review + apply cycle-end TM changes" surface (see `EngineBanner` at `progress/page.tsx:200-223` — this is where "Apply all TM changes" lives). Today is the "one screen, today's action" surface. Duplicating proposal cards means a user tapping Progress sees the same amber "Not feeling 100%?" they already ignored on Today. Or, worse, sees a `tm_bump` card on **both** surfaces while `EngineBanner`'s Cycle-End banner also fires on Progress with **different** TM math. The user can't tell which one to trust.

**Reproduction.** `next-app/src/app/page.tsx:168` (Today mount) + `next-app/src/app/progress/page.tsx:246` (Progress mount). Any active `Proposal` from `selectProposals` renders in both DOM trees.

**Recommended fix.** Delete the Progress mount. Progress owns the **retrospective** engine surface (Cycle end evaluation, pause detection, waypoint accelerate — see `progress/page.tsx:193-230`). Today owns the **prospective** proposal surface (soften today's load, advance phase, TM bump). Keep the split clean:
- `next-app/src/app/progress/page.tsx:246` — remove `<ProposalStack ...>`.
- Optionally, add a one-line hint at the top of Progress: "Today's proposals live on Today →" if any are active. But the hint is a nice-to-have; the delete is the load-bearing fix.

**Rationale.** Refactoring UI: one primary surface per view. Linear does not put issue-create in both the sidebar and the header. Cal.com does not put the booking widget in both the dashboard and the availability editor. One place, discovered, done.

**Cost.** S — 30 min. Remove one line + the import.

### Bug #3 — Empty-Today has three cards competing for the same "start here" attention

**The bug.** Fresh user post-onboarding, no morning check saved, no logs. Today renders:
1. `YourPlanCard` (program header)
2. `FirstRunBanner`
3. `DateNav` + phase progress line
4. `ProposalStack` (empty or LifeLoad-triggered — see Bug #1)
5. `HeroStateCard` full variant with "No check yet" title and full-tile tap into `/check` (`HeroStateCard.tsx:79-100`)
6. `SignalsStrip` (empty on day 1 because "morning check overdue" is suppressed for day-1 users, `SignalsStrip.tsx:94-98`)
7. `RestDayCard` (rest variant — because no phase blocks yet for this date probably)
8. `RunSlotCard`

The `HeroStateCard` full-tile IS the primary CTA on day 1 — it's the one action that unlocks everything else. But it's competing with the "Browse programs" link (already served on the previous screen), the `FirstRunBanner` privacy pitch, and `RestDayCard`'s "Rest day / no session on the schedule" copy. **The user doesn't know that tapping HeroStateCard is the load-bearing next step.** They came in expecting "your first focus session lands" (landing dictionary, `en.ts:91`). They see "Rest day."

**Recommended fix.** Compose an explicit day-1 empty state. When `!hasHistory` and `!store.logs[today]?.symptoms`, render **one** card above the fold:
```
+-------------------------------------------+
| ○ Start with a morning check              |
|                                           |
| One minute of tapping calibrates today's  |
| load. After that, the engine has          |
| something to work with.                   |
|                                           |
| [ Open morning check → ]                  |
+-------------------------------------------+
```
Suppress `RestDayCard` on day-1-no-check. Suppress the "week X of Y · ends dd Mon" phase line — irrelevant before day 1. Keep `YourPlanCard` (program identity) and this one CTA. Everything else stacks below.

Implementation: gate a new `<Day1EmptyState />` at `next-app/src/app/page.tsx:168` (before `ProposalStack`), and short-circuit the rest of the render when it fires. Replace `HeroStateCard` full-variant's empty branch usage with this — the compact strip variant continues to render on every subsequent day.

**Cost.** S — 2h. New component + one branch in `page.tsx`.

### Bug #4 — Overperformer (A1) fires on exactly 1 of 6 programs, silently

**The bug.** `TM_BUMP_INELIGIBLE_PROGRAMS` at `adapt.ts:367-373` lists every program **except** `anterior-hip-rebuild`. `evaluateOverperformer` no-ops for the other five (`adapt.ts:396`). Intent may be defensible: aerobic + skill + mobility + concurrent progression happens through retest and tier-advance, not TM bump. But this creates a compositional oddity: a beta user picks Concurrent Strength Maintenance — which literally has "strength" in the name — trains hard for 6 weeks with a green streak + easy notes, and the engine never proposes a bump. Their equivalent friend on the (hidden, personal) anterior-hip program **does** get bumps. The landing promise ("Every retest gate, symptom rule, and confirm-first mechanic proved itself on that log", `en.ts:86`) reads as apply-to-any-program, but A1 in fact applies to none of the public programs, because `anterior-hip-rebuild` is `personal: true` in the manifest and hidden from the catalog (`programs/page.tsx:38-42`).

**Reproduction.** `adapt.ts:367-373` (the Set) intersected with `public/data/programs/manifest.json`'s `personal: true` on anterior-hip. Result: 0 catalog programs where `evaluateOverperformer` returns non-null.

**Recommended fix.** Two options — pick one before beta:
- **Option A (recommended).** Expand A1 eligibility to any program with `training_maxes.starting_values_kg` defined. That's `concurrent-strength-maintenance` at minimum, and any strength program that lands next. Cost: replace the hard-coded set with a program-shape check at `adapt.ts:390-396`. `if (!program.training_maxes?.starting_values_kg) return null` — declarative, forward-compat.
- **Option B.** Ship as-is with a documented note in Progress ("TM bumps require a strength-progression program. Your program uses retest gates instead — see below."). Weaker; feels apologetic.

Option A. Any beta user on Concurrent Strength Maintenance who overperforms deserves the bump.

**Cost.** M — 3h. Change the guard + add a unit test in `adapt.test.ts` for the concurrent case + verify persona artifact for `overperformer_concurrent-strength-maintenance` (doesn't exist yet — see "What this DOES NOT cover").

### Bug #5 — OnboardingRunner dismiss returns focus to a live ProposalCard button

**The bug.** `useFocusTrap` (`useFocusTrap.ts:14-52`) restores focus to `previouslyFocused.current` on unmount (line 50). When a legacy user (returning session, engine-builder just picked) opens Today, `<StoreHydrator>` mounts, hydration writes the store, and Today paints. `ProposalStack` may render an existing accepted-or-pending proposal from a prior session — if `dismissed_proposals[today]` doesn't cover it. In that render pass, `OnboardingRunner` also mounts and grabs focus (`useFocusTrap.ts:24-25`). But `previouslyFocused.current` at that moment is `document.activeElement`, which — if the user had already tapped a ProposalCard's Accept button in the microseconds before onboarding painted — is a button that will be **removed from the DOM** during onboarding dismissal (because Accept mutated the store and the proposal is gone).

Actual current risk is low because `OnboardingRunner` gates on `hydrated && isAuthed && !dismissed` (`OnboardingRunner.tsx:72`) and hydration typically completes before any user tap. But the design permits it. The failure mode is: user dismisses onboarding, focus tries to return to a button that no longer exists, and (per browser) either drops to `<body>` (SR user loses their place completely) or focuses an ancestor.

**Recommended fix.** Add a `try/catch` and a fallback focus target in `useFocusTrap.ts:50`:
```
previouslyFocused.current?.focus?.() ?? document.querySelector<HTMLElement>('main h1')?.focus();
```
Or, cleaner: on OnboardingRunner dismiss, explicitly focus the Today `<main>` element or the first `<h1>`. The onboarding is a page-level entry point; focus should land back at page top, not at whatever the user happened to be touching underneath.

**Cost.** S — 1h. Add a `defaultFocusOnRestore?: HTMLElement | (() => HTMLElement | null)` opt-in to `useFocusTrap`, and pass a page-top ref from `OnboardingRunner`.

---

## Cross-persona coherence check

| Persona | Journey holds? | Notes |
|---------|----------------|-------|
| **persona-recover** (rehab, symptomatic morning) | y, with Bug #1 fixed | Journey: fresh signup → `/programs` → anterior-hip-rebuild (personal, only accessible via direct link — this persona already has it stamped). Onboarding step 2 is `symptom_primer` (`anterior-hip-rebuild.json`), NOT `life_load`, so Bug #1 doesn't fire — LifeLoad step is engine-builder / concurrent / rowing only. `HeroStateCard` full variant with "No check yet" is exactly right for a rehab user; the CTA into `/check` is the entire product for this persona. **Journey passes as-is** for the rehab persona. |
| **persona-strength** (overperformer, wants to be pushed) | **n** — Bug #4 breaks this | Journey: fresh signup → `/programs` → picks concurrent-strength-maintenance because it's the most strength-y catalog option → onboarding runs (scale_anchor + life_load + custom_copy) → picks a healthy 3 on LifeLoad (so Bug #1 doesn't fire either). Trains for six weeks. Every day is green. Notes read "felt strong", "grooved". A1 (overperformer TM bump) **silently no-ops** because concurrent-strength-maintenance is in `TM_BUMP_INELIGIBLE_PROGRAMS`. The user hits Progress expecting a "you look ready to bump" nudge; nothing. The landing promise is broken for this persona. Bug #4 fix (Option A) resolves. |
| **persona-erratic** (skips, dismissed proposals, life-load noise) | y, with Bug #2 fixed | Journey: signs up, picks a program, skips onboarding via "Skip setup" button (`OnboardingRunner.tsx:118-122`) — dismiss stamps localStorage key, no state written. Returns 3 days later. Missed-session prompt fires (`app/page.tsx:138-155`). Ignores every proposal. `dismissed_proposals` accumulates. Persona lives entirely on the `SignalsStrip` "morning check overdue" nudge (`SignalsStrip.tsx:96-124`), which is correctly gated (needs history AND blocks today AND ≥3 days since last check). But: because ProposalStack renders on both Today AND Progress (Bug #2), an erratic user sees the same dismissed-nag on two surfaces. Bug #2 fix resolves. |

---

## Modern-standard checks (arc-level)

- **iOS HIG standalone PWA.** Bottom nav is fixed (`AppShell.tsx:162`); top header scrolls with content (`AppShell.tsx:117`) — matches Whoop / Strava convention. Safe-area padding via `env(safe-area-inset-top)` (`AppShell.tsx:119`) and `env(safe-area-inset-bottom)` (`AppShell.tsx:152`). Pass.
- **Refactoring UI accent economy.** Bronze = primary action (Accept, TM apply). Amber = safety / soften. Slate = passive info. Green = ready-to-progress. Red = escalate. All four proposal kinds map cleanly through `toneFor` (`ProposalCard.tsx:185-211`). Pass, but note: `HeroStateCard` full variant uses `bg-{green,amber,red}/10` tinted card backgrounds (`HeroStateCard.tsx:70-77`), which stack under ProposalStack. Two amber tiled surfaces on empty day. See Bug #3.
- **prefers-reduced-motion.** `pulse-accept` classname applied at `ProposalCard.tsx:29-31`. `→ delegate to app-motion-perf` to verify the CSS class has a `@media (prefers-reduced-motion: reduce)` branch. If it doesn't, ship one.
- **Focus order.** `CitationRef` (`CitationRef.tsx:38-52`) has its own `<button aria-expanded>`. Tap on that button does NOT bubble to `ProposalCard`'s Ignore because Ignore has its own click handler on a separate button (`ProposalCard.tsx:149-156`); there is no `onClick` on the `<section data-proposal-card>` wrapper. Pass. Tab order: Accept, Ignore, X-close-Ignore, CitationRef expand, then out. Reads correctly.
- **Fitts's law.** Primary Accept action bottom-left of the card (`ProposalCard.tsx:159-165`), thumb-zone-native on a 393px viewport. Pass.

---

## Consent-first check (arc-level)

- **No silent writes on onboarding skip.** `OnboardingRunner.tsx:62-70` — dismiss stamps a localStorage key; no store writes. Confirmed. Pass.
- **LifeLoadStep only writes when user picks a value.** `LifeLoadStep.tsx:22-28` — `handlePick` writes only after tap. Pass.
- **`derived_state` preserved on LifeLoad write.** `LifeLoadStep.tsx:26-27` — reads existing `derived_state` and passes through. Correct — a self-reported life_load slider should not silently overwrite a symptom-derived medical field.
- **Accept is explicit.** Every kind in `ProposalCard.onAccept` (`ProposalCard.tsx:27-67`) requires a bronze button tap. No silent progression. Pass.
- **Ignore records the outcome.** `recordProposalOutcome(proposal, "ignored", date)` on every kind branch (`ProposalCard.tsx:69-86`) — the audit trail exists even for negative feedback. GDPR-honest.

Consent-first holds across the whole arc. This is the design's strongest property post-Phases-1-4 and it must not regress.

---

## What this DOES NOT cover

- **Coach.** Deferred; auto-generated content sits behind a feature flag today and has its own upcoming brief.
- **Profile flows other than program-switch.** Data export, delete-account, sign-out mid-session — all present but not walked in this brief.
- **History detail view.** The multi-year symptom + load record is the app's single load-bearing differentiator per project CLAUDE.md but is not walked here — it's a Progress subsurface, and the arc grades stop at "second day loop closes."
- **Multi-program (concurrent tracks) grading.** `activeProgramIds` shows the plumbing exists (`app/page.tsx:38, 49-57`) but this brief walks only single-program journeys. See `dev/design-briefs/2026-08-17-concurrent-tracks-density.md` for that decision.
- **Persona sanity for `overperformer_concurrent-strength-maintenance`.** No such persona artifact exists yet (`tests/e2e/screenshots/matrix-v2/` has 5 personas, all against anterior-hip). Bug #4 fix should add one to the persona harness before beta.
- **Offline PWA behavior.** Every screen we walked assumes online; offline mode is not audited here.
- **A11y contrast ratios on the new HeroStateCard compact-strip variant.** → delegate to `app-accessibility`.

---

## Recommendation on beta-launch readiness

**Go with caveats.** Ship Bugs #1, #2, #3, #4 fixes as a single "flow-glue" PR (est. 6-8h). Bug #5 is edge-case-only and can slip a beta cycle. Nothing in the arc is architecturally wrong. Every fix listed above is additive — a guard clause, a component split, an eligibility widening. No data-shape migration required.

The product IS the mechanic the landing promises: log-note → engine proposes → Accept or Ignore. Phase 1 (citations) makes proposals defensible. Phase 2 (A1 overperformer) makes them offensive rather than defensive — assuming Bug #4 fix lands. Phase 3 (A5 stack) makes them discoverable in one first-class surface. Phase 4 (B3 onboarding) makes intake honest per program. The seams between them are tight enough that a beta user's first hour reads as one product, not four.

The load-bearing risk is Bug #1. A first-time user seeing "Apply 10% lighter today?" as their first-ever engine proposal — before touching a barbell, before saving a check, based only on a slider they tapped 90 seconds ago in onboarding — is not the impression to ship. Two-hour fix. Do it first.

---

## Estimated implementation cost

- Bug #1 (LifeLoad → soften suppression + program-scope guard): 2h, high confidence.
- Bug #2 (delete ProposalStack from Progress): 30 min, high confidence.
- Bug #3 (Day-1 empty state): 2h, medium confidence — component design straightforward; landing-verb copy needs `→ delegate to app-copy-clarity`.
- Bug #4 (A1 eligibility widening): 3h including test + persona artifact.
- Bug #5 (focus-trap fallback): 1h, low priority.

**Total for beta-blockers (#1-#4): 7-8h.** One PR. Ship together — they interact.
