# Concurrent-track Today-view density

Owner: product-design-lead
Written: 2026-08-17
Status: draft — awaiting founder review
Related audits: `dev/active/concurrent-tracks-audit/plan.md` (persona harness gap + open questions), `dev/design-briefs/2026-08-17-a5-accept-ignore-visibility.md` (ProposalStack surface — precondition), `dev/design-briefs/2026-08-17-b3-program-agnostic-onboarding.md` (per-program state model), memory `feedback_top-nav-action-row.md`, `feedback_focused-not-full-plan.md`, `feedback_confirm-first.md`
Blocked by / blocks: **blocks** the paid-tier concurrent-tracks storefront (memory `project_saas-track-model.md`). **Blocked by** persona-concurrent harness build (plan.md scope §1) for empirical validation — the brief ships now on reasoned defaults; harness re-runs verify.

---

## The call

**Ship a "SessionColumn" IA where each concurrent program is a self-contained collapsible section under a shared TopActionRow, with the primary program open and the secondary collapsed to a one-line summary; promote the interference advisory into ProposalStack as `kind: "interference_warning"`; kill the repeated prose intro on every render.** Five decisions ride together and cannot be shipped one-by-one without regressing the founder screenshots.

**Why (three-line summary):**
- The current Today view mixes global verbs, per-program verbs, and per-block verbs in the same content column — Garmin's move (global verbs top, content stays content) is the only pattern that survives 2+ programs without stacking six action-fields into the thumb zone.
- A collapsed secondary program is the smallest reversible bet — it defends screen fold for the 80% case (one focus at a time; memory `feedback_focused-not-full-plan.md`) and still gives paid users an obvious expand affordance for the 20% "I'm doing both today" case.
- The interference callout is *already* a proposal in shape: it says "here is a situation, here is what to do about it, ack it or ignore it." Making it a `Proposal` with a real Accept/Ignore closes the confirm-first loop (memory `feedback_confirm-first.md`) and stops the callout from re-firing every scroll.

---

## The problem

The founder captured three screenshots at 18:25 on 2026-08-17 with an admin-added second program. Reading them cold:

1. **The Today landing view** (`40dbc64d`): the fold under DateNav crams a phase line, a green readiness strip, a SignalsStrip pill ("Ready to leave reintro +1 more"), an amber interference advisory box (three lines of prose), and finally the first program's header — before any exercise. There is no top action row; global verbs are 3 scrolls down.
2. **The mid-scroll view** (`71e08709`): two colored left-border stripes (orange for hip, green for engine) run vertically alongside exercise cards that are visually identical. The "L/R" side-caps on unilateral rows are the only non-color signal. The engine block re-renders its full prose intro ("Modality chosen at intake. Weeks 1-4 low-impact only …") every time it hits the fold — three lines of body text the user has read on every previous day of the phase.
3. **The bottom-scroll view** (`45dc64d7`): three peer action buttons (Move day / Skip today / Whole week) at the bottom. They are scoped to *the primary program only* by implementation (`next-app/src/app/page.tsx:340` passes only `primary` to `SessionActions`) but the visual gives no signal of that. A paid user with two programs will read this row and assume it acts globally. It does not.

**Why the fast fix does not work.** The fast fix is "tighten the padding, move the interference box up, done." That defends this one screenshot but breaks the moment a third program is added (paid-tier future — memory `project_saas-track-model.md`), or the moment the engine has one green + one amber program (which action row applies to which?), or the moment a persona-erratic user has skipped both programs three days running and needs an at-a-glance state (both are amber, both should offer un-skip inline). The pattern has to be right, not the pixels.

**Future scenarios the design must handle.**
- 3rd program shipping (paid tier): tier-picker with 2+ concurrent focuses.
- New proposal kind lands (e.g. `interference_warning`, `retest_due`): must fit the same stack.
- Dense-log user with 2 programs both mid-phase: 6 exercises × 2 programs = 12 cards + 2 headers + 2 prose intros.
- Symptomatic morning (persona-recover): elevated hip check pushes rehab urgent, but engine still schedules — how do we signal "prioritize the rehab today"?
- Offline PWA: the collapsed secondary must not defer-fetch. All program content must be in the render tree already, just visually hidden.
- Screen-reader: two `<section>`s with equal-weight headers, both landmarked, one collapsed by default (`aria-expanded="false"`, `aria-controls`).
- GDPR-honest: no silent write when the user expands/collapses a program — layout preference is a session-level persistence, not a medical event.

---

## Options considered

### Option A — Tabbed switcher (Program A | Program B)
- **Shape:** DateNav gets a segmented control underneath: `[Anterior hip] [Engine builder]`. Tap to swap. Only one program's content column ever visible.
- **Sketch:**
```
+----------------------------------+
| < Monday 17 Aug >                |
| [ Anterior hip ] [ Engine ]      |
| —— content of active tab only —— |
+----------------------------------+
```
- **Pros:** dramatic density reduction; zero interference visually because only one program is ever rendered.
- **Cons:** hides the interference reality (both are scheduled today; user has to swap tabs to see it); breaks the "one glance at Today = your whole day" mental model; makes the interference advisory ambiguous ("aim for 6h between sessions" is meaningless if you can only see one at a time); paid tier's core value prop is "we help you balance concurrent programs" — hiding half the day undermines the pitch.
- **Verdict:** rejected. Solves density by lying about scope.

### Option B — Fast fix (tighten spacing, move interference above the fold)
- **Shape:** current DOM shape. Tighten paddings; move interference callout above the SignalsStrip; strengthen the left-border color from `border-l-4` to `border-l-8`.
- **Pros:** ships in 2 hours; keeps every current invariant.
- **Cons:** does not address repeated prose; does not address SessionActions scope ambiguity; does not survive a third program; leaves interference as a passive callout that re-fires every scroll; leaves per-program verbs (Move / Skip) globally-styled but functionally primary-only.
- **Verdict:** rejected. Founder specifically called out density as "really messy" and the future paid-tier context. The fast fix defers the problem by one release cycle at most.

### Option C — Winner: **SessionColumn IA with collapsible per-program cards + TopActionRow + interference-as-proposal**
- **Shape:**
  - **TopActionRow** under DateNav: one strip carrying session-scoped global verbs (Move day / Skip today / Whole week). Scoped-to-day, not scoped-to-program. Icon-only on mobile with labels-on-tap-and-hold; icon+label on ≥sm.
  - **Program sections** below: each program is a self-contained `<ProgramSection>` with its own header (program name + phase progress + one-tap collapse toggle), its own prose intro (shown once, then collapsed under an `i` chip), and its own exercise column.
  - **Primary open, secondary collapsed** by default when 2+ programs schedule today. Collapsed state renders a one-line summary card: `[dot] Engine Builder · Zone 1/2 · 40-90 min · 1 exercise · Expand →`.
  - **Row-level program identity:** each exercise card gets a small program badge in the checkbox corner (a 6px dot in the program's semantic color, top-right of the checkbox). Left-border stripe stays but weakens to a hairline (color as identity signal, not the load-bearing thing).
  - **Interference advisory** promoted to `Proposal` (kind `"interference_warning"`) rendered in `ProposalStack`. Accept = dismiss for today. Ignore = dismiss for today (identical mutation; UX difference is intent-logged to `recordProposalOutcome` for future analytics).
  - **Prose intro** ("Modality chosen at intake…") collapses to a single `i`-chip after first-view-per-phase; taps back open on demand.
- **Sketch:** see full wireframe below.
- **Pros:** solves all five open decisions with one coherent pattern; scales to N programs (each is a self-contained card); leaves ProposalStack as the single first-class engine-speaks surface (A5 invariant preserved); Garmin-pattern-parity on top action row (founder validated); reversible per-session (expand/collapse is not persisted globally — session-level layout, no medical write).
- **Cons:** more implementation surface than Option B (~10-14h); requires a new `Proposal` variant and its selector logic; requires a new `<ProgramSection>` composite. Risk: if the secondary collapses too aggressively (persona-recover with a symptomatic hip morning who has forgotten to skip engine), the user misses that engine is on today. Mitigation: the collapsed summary is a full row with the modality and duration visible, and it's tap-to-expand, not hidden.
- **Verdict:** **winner.**

---

## Chosen: Option C — SessionColumn IA

### Full wireframe

```
+------------------------------------------------------------+
| TERAV •              [layers]  [stethoscope]  [•••]        |  <- existing top nav
+------------------------------------------------------------+
| <   Monday 17 Aug     Today                        >       |  <- DateNav (unchanged)
+------------------------------------------------------------+
| Rebuild + evaluate · week 2 of 4 · ends 29 Aug             |  <- phase line
| • GREEN · Progress load. Nothing above 3/10.               |  <- HeroStateCard compact
+------------------------------------------------------------+
| [ Move day ]  [ Skip today ]  [ Whole week ]               |  <- TopActionRow (new)
|                                          Applies to today  |     scope-scoped
+------------------------------------------------------------+
| (i) Ready to leave reintro    +1 more            ▾         |  <- SignalsStrip (unchanged)
+------------------------------------------------------------+
| PROPOSALS                                                  |  <- ProposalStack
| ┌────────────────────────────────────────────────────────┐ |
| │ ⚠ Two programs today — interference window            │ |
| │ Aim for ≥6 h between hard cardio and heavy strength. │ |
| │ (Schumann 2022)                                       │ |
| │                            [ Ignore ]  [ Acknowledge ]│ |
| └────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------+
| ● ANTERIOR HIP REBUILD                                     |  <- ProgramSection (primary)
| Barbell reintro session · 4×/week · 45 min       ▾ open   |     dot uses program color
| ┌────────────────────────────────────────────────────────┐ |
| │ i  Empty bar → moderate load. RPE cap 7. …            │ |  <- prose intro collapses
| └────────────────────────────────────────────────────────┘ |     to (i) after 1st view
|                                                            |
|  [•] High-bar back squat                    112.5 kg × 5   |
|      (dot = program color)                                 |
|  [•] Block pull, mid-shin                   132.5 kg × 5   |
|  L R Bulgarian split squat                  3 sets         |
|  L R Single-leg Romanian DL                 3 sets         |
|  [•] Dead bug, slow                         3 sets         |
+------------------------------------------------------------+
| ● ENGINE BUILDER                                           |  <- ProgramSection (secondary)
| Zone 1/2 steady-state · 40-90 min           ▸ collapsed   |     tap chevron to expand
| 1 exercise · Log session                                   |
+------------------------------------------------------------+
| ▓▓▓▓▓  TODAY  WEEK  PROGRESS  HISTORY  PROFILE            |  <- bottom nav (unchanged)
+------------------------------------------------------------+
```

**States on the ProgramSection:**
- Open (primary default): header + prose (once-per-phase) + all exercise cards.
- Collapsed (secondary default): header + one-line summary + Expand chevron.
- Empty (this program has no session today, but has session tomorrow): header + "Rest today · Next: Wed" (no expand chevron).

**States on the interference proposal:**
- Green day (single program only): proposal never surfaces.
- Amber (both scheduled): proposal renders. Acknowledge dismisses for today. Never re-fires same day. Re-fires the next day both are scheduled unless the user has explicitly declared a preferred split time in profile (future).

### Cross-persona coherence check

| Persona | State | Does the design hold? | Notes |
|---|---|---|---|
| persona-recover | Hip rehab, elevated morning symptoms (amber check) | **y** | Interference proposal escalates naturally alongside a `day_adjustment_soften` from the engine — user sees "back off + space sessions" as two proposals stacked. Rehab program renders open; engine collapsed. |
| persona-recover | Hip rehab morning; engine also on today; user forgot engine was scheduled | **partial** | Collapsed engine summary is one-line but visible above the fold. Risk: user scrolls past. Mitigation: TopActionRow "Skip today" applies to *both* — logging a skip clears engine too. Verified by copy: the sheet reads "Skip both programs today?" |
| persona-strength | Green streak, both programs on today, wants to be pushed | **y** | Both sections visible (primary open); secondary tap-to-expand is one-thumb. Interference proposal Acknowledge takes 1 tap, gone. Fast path unchanged. |
| persona-erratic | 15 skips deep, both programs amber, dismissed proposals | **y** | Same skip cascade as today; TopActionRow's Move/Skip/Week apply to the whole day, which matches erratic's mental model ("I'm not doing anything, move it"). Per-program skip is deferred (see "what this does not solve"). |
| persona-strength | 3rd program added (paid future) | **y — extension safe** | ProgramSection is compositional. Third program renders same shape. Default state per §2 below decides which is open. |

### Modern-standard checks

- **iOS HIG:** TopActionRow is not a modal, not a sheet — it's a persistent inline strip under DateNav. Safe-area unaffected (bottom-nav owns the safe-area padding). Tap targets 44×44 minimum on the 3 verbs and the collapse chevron. **pass**
- **Material 3:** ProgramSection collapse animation uses `duration-short-4` (250ms) with `ease-standard`. State layer on the chevron matches the existing chip surface layer. **pass**
- **Refactoring UI:** accent economy — the two program-color dots are the only place program color appears at row density (the left border weakens to hairline). Primary action per view stays one: the topmost proposal's primary CTA if a proposal exists, otherwise the first exercise's checkbox. **pass**
- **`prefers-reduced-motion`:** collapse/expand becomes instant (display swap) instead of animated height transition. Chevron rotates from 90deg to 0deg with `transition: none` under the media query. **pass**
- **Fitts's law:** TopActionRow verbs sit ~180px from the bottom of the thumb cradle (bottom-nav is ~90px, gap ~90px). Within the "reachable middle" for a one-handed thumb on a 393px viewport. Chevron on collapsed secondary is right-edge but 44×44, matches nav conventions. **pass** — `→ verify: app-mobile-ux`

---

## Data shape changes

### 1. New proposal kind

```ts
// next-app/src/lib/schemas.ts:1170 — add to Proposal union
export type InterferenceWarningProposalPayload = ProposalBase & {
  kind: "interference_warning";
  date: string;
  programSlugs: [string, string]; // the two colliding programs
  spacingHoursRecommended: number; // 6 by default
  hardCardioYesterday?: boolean;   // for tuning copy
};

export type Proposal =
  | ReadinessProposalPayload
  | DayAdjustmentProposalPayload
  | TierAdvanceProposalPayload
  | TMBumpProposalPayload
  | InterferenceWarningProposalPayload; // + this
```

### 2. Layout preference (session-only; not persisted to KV/Supabase)

```ts
// next-app/src/lib/useStore.ts — add ephemeral (in-memory) slice
type UiSessionState = {
  programSectionExpanded: Record<string /* programSlug */, boolean>;
  // Missing key => default (primary=open, secondary=collapsed).
};
```

**Consent note:** this is deliberately in-memory only. Collapse state is a viewing preference, not a medical/training decision. Nothing writes to localStorage or KV. On next app open the default returns. GDPR-honest per `feedback_confirm-first.md`.

### 3. No changes to program.json / exercises.json / logs shape.

---

## Component tree

**Current:**
```
TodayPage
├── YourPlanCard
├── DateNav
├── phase line (inline)
├── ProposalStack
├── HeroStateCard (compact)
├── SignalsStrip
├── RetestReminder
├── interference callout (inline JSX in page.tsx:256-267)
├── groups.map(g =>
│     <p>PROGRAM NAME</p>
│     <BlockSection /> × N
│   )
├── RunSlotCard
└── SessionActions
```

**Proposed:**
```
TodayPage
├── YourPlanCard
├── DateNav
├── phase line (inline)
├── HeroStateCard (compact)                     ← moved above TopActionRow
├── TopActionRow                                ← NEW: hoists SessionActions
│   ├── Move day  (opens MoveSheet)
│   ├── Skip today (opens SkipSheet — now day-scoped)
│   └── Whole week (opens WeekSheet)
├── SignalsStrip
├── ProposalStack                               ← now hosts interference_warning
├── RetestReminder
├── groups.map(g =>
│   <ProgramSection                             ← NEW composite
│     program
│     blocks
│     defaultExpanded={gi === 0}
│   >
│     <ProgramHeader />                         ← dot + name + phase + chevron
│     {expanded && <ProseIntro collapsible />}
│     {expanded && <BlockSection /> × N}
│     {!expanded && <CollapsedSummary />}
│   </ProgramSection>
│ )
└── RunSlotCard
```

### File-level changes (implementation notes)

- `next-app/src/app/page.tsx:126-344` — reshape the return tree per the proposed component tree. HeroStateCard moves above TopActionRow; SessionActions is removed from the bottom and replaced by a TopActionRow render (new import). The inline `multipleProgramsToday` amber callout at lines 255-267 **deletes** — its logic moves into a proposal selector.
- `next-app/src/components/workout/TopActionRow.tsx` — **new file.** Composes the three existing sheet-openers from `SessionActions.tsx:78-119` (MoveSheet, SkipSheet, WeekSheet). Same store actions (`skipDay`, `skipAndShiftWeek`, `skipWholeWeek`, `moveSession`). Behavioral change: `SessionActions.tsx:83-87`'s `skipDay(active, reason)` becomes day-scoped — currently the `skipped` map is already keyed by date (`useStore.ts` skipped shape), so this is already correct semantically; the label just needs to read "Skip today" not "Skip session". Skipped state banner (`SessionActions.tsx:27-47`) migrates into the TopActionRow so the row swaps to the "Session skipped today · Undo" strip.
- `next-app/src/components/workout/ProgramSection.tsx` — **new file.** Owns `<ProgramHeader>`, `<ProseIntro>` (collapsible), collapsed `<CollapsedSummary>`, and the mapped `<BlockSection>`s. Reads `programSectionExpanded` from the ephemeral store slice. Fires `announce()` on expand/collapse for SR.
- `next-app/src/lib/schemas.ts:1170` — extend `Proposal` union with `InterferenceWarningProposalPayload` (see data shape).
- `next-app/src/lib/proposals/select.ts` — add selector that emits the interference proposal when: `groupsWithBlocks.length >= 2` AND at least one is `category === "strength"` AND at least one is `category === "run"` (or the primary declares `concurrent_strength_policy`). Priority 40 (below `day_adjustment_soften` at 60, above `tm_bump` at 20 — order: readiness > softening > interference > tm_bump; interference is contextual not corrective).
- `next-app/src/components/workout/ProposalCard.tsx:33-64` — extend the `switch (proposal.kind)` to handle `"interference_warning"`. Accept and Ignore both just `recordProposalOutcome`; no state mutation. `announce("Interference window acknowledged.")` on Accept.
- `next-app/src/components/workout/BlockSection.tsx` (currently defined inline in `page.tsx:687-747`) — extract to its own file (`next-app/src/components/workout/BlockSection.tsx`) so `ProgramSection` can import it cleanly. Zero logic change.
- `next-app/src/components/workout/ExerciseCard.tsx` — add optional `programColor` prop that renders a 6px dot at the top-right of the checkbox. Default undefined = no dot (single-program case). Passed from ProgramSection.
- `next-app/src/lib/useStore.ts` — add the ephemeral `programSectionExpanded` slice + `setProgramSectionExpanded(slug, expanded)`. **Do not** put it in the persisted `store` — put it in the same shell as `hydrated`.

### Delegate-to-specialist

- **Type scale / palette:** `→ app-visual-craft` — assign program-color dots at ExerciseCard checkbox (which existing palette tokens map to hip=amber-warm, engine=green-cool, +N for future programs — need a 6-slot semantic palette that scales); audit accent economy after change (currently we have bronze primary + green + amber + red + slate + line — adding two program dots inside the same view is at the limit).
- **Ergonomics:** `→ app-mobile-ux` — verify TopActionRow tap targets ≥44×44; verify collapse chevron is 44×44; verify primary program's first exercise checkbox is within thumb zone on 393px viewport; verify the collapsed secondary summary tap area extends across the whole card (not just the chevron).
- **A11y:** `→ app-accessibility` — `<section aria-labelledby>` on each ProgramSection; `aria-expanded` on the chevron; focus order (TopActionRow → ProposalStack → primary program → secondary program → RunSlotCard); ensure `announce()` fires on expand/collapse with program name.
- **Copy:** `→ app-copy-clarity` — write the interference proposal reason string (currently three sentences of prose, needs to be one line under proposal title + one line body); write the CollapsedSummary summary format; write the "Skip today" sheet copy that now scopes to "both programs today"; write the ProseIntro `i`-chip label. String budget: no more than 6 new strings across the whole change.
- **Motion:** `→ app-motion-perf` — measure the section-expand height transition against `prefers-reduced-motion`; ensure the ProposalStack Accept `pulse-accept` interaction still fires on the interference variant; measure whether stacking 4 sections deep on the collapsed→expand transition drops a frame.

---

## Migration

Additive-only in the persisted store — no schema migration needed for existing users. All existing behaviors preserve:

- Users with a single active program: TopActionRow renders, ProposalStack behaves identically (no interference warning ever fires), no ProgramSection collapsibility (single section renders open, chevron hidden), and the removed inline `multipleProgramsToday` callout was never showing for them anyway.
- Users with two programs: interference proposal supersedes the deleted inline callout on the first render after upgrade. The `recordProposalOutcome` audit trail starts fresh; there is no back-migration of "user has already seen this callout today."

Steps:
1. Ship `InterferenceWarningProposalPayload` schema type + selector behind a feature flag `NEXT_PUBLIC_FEATURE_INTERFERENCE_PROPOSAL` for one release cycle. Toggle on in Vercel/CF for founder account first.
2. Ship `ProgramSection` + `TopActionRow` + ExerciseCard `programColor` prop. Behind `NEXT_PUBLIC_FEATURE_CONCURRENT_LAYOUT`. Founder account first, then all superadmin-multi-program accounts.
3. After 1 week of persona-concurrent artifact runs (see plan.md §2), flip both flags default-on.
4. **Rollback plan:** flip both flags off. The old `SessionActions` inline render + inline `multipleProgramsToday` callout at `page.tsx:255-267` is preserved behind the flag check for one cycle, then deleted in the following release.

---

## Peer benchmarks

- **Garmin Connect (Home + Calendar screenshots, founder-provided):** top action row carries global icons (`+`, refresh, sync, notifications). Content column stays pure content. "Today's Activity" section uses one-line summary rows (icon + label + primary metric on one line), tap-to-expand. **Steal:** the row-summary shape for our CollapsedSummary; the top-icons-for-global-actions pattern. **Reject:** Garmin's density of six data cards per screen — this is a fitness watch companion, not a coaching surface. Rehab context needs the *why* behind each block, not just the number.
- **Linear (Inbox pattern, https://linear.app/):** stacked "cards" where each card is a self-contained work item with its own actions inline; collapsed until the user expands. **Steal:** the "primary open, rest collapsed" default; the ephemeral-not-persisted collapse state. **Reject:** Linear's aggressive keyboard-shortcut model — our thumb-first mobile PWA cannot lean on `j/k` navigation.
- **Whoop (Daily view):** single "Recovery" hero at top, then stacked stat cards below, each one summarizing (score + one-line context) and expanding on tap to reveal the sub-metrics. **Steal:** the summary-then-expand affordance for our ProgramSection. **Reject:** Whoop's opacity into *why* a score is what it is — our brand promises the reasoning is visible, not gated behind an expand.
- **Anthropic console (workspace switcher):** primary workspace open by default; other workspaces collapse to a name-only strip in the sidebar. **Steal:** default-primary-open convention; workspace-color dot as identity signal. **Reject:** their sidebar-based composition — we are mobile-first, sidebar-second.

---

## What this decision does NOT solve

- **Per-program Skip.** Today's Skip is day-scoped ("skip both programs today"). A paid-tier user will eventually want "skip only the engine session; keep hip." Deferred to a future brief once persona-concurrent evidence shows the need. Current call: 90% of skips are "the day sucked, punt everything" — day-scope is right for now.
- **Program priority when both are urgent.** If the hip is amber AND the engine has a fatigue-flagged proposal, which one gets to be the "primary" that's expanded by default? Current call: whichever was set as `active_program_id` in profile (i.e., derived from user's own primary declaration). Formalize later.
- **>2 concurrent programs.** Design accepts N programs shape-wise; there is no explicit design for "which one collapses vs. which is open" beyond "primary open, rest collapsed." Enough for now; refine when the third program lands.
- **Session-level time hints.** The interference proposal says "aim for ≥6 h between." It does not offer to *schedule* the split. A future proposal kind could offer "Do hip at 09:00, engine at 17:00 [Accept schedule]." Explicitly deferred.
- **Collapsed secondary content for screen readers.** Content is present in the DOM (not lazy) but is `hidden` when collapsed. If persona-recover audit shows SR users prefer the always-visible flat list, add a `prefers-linear-navigation` variant. Deferred until a11y audit.
- **Landing-page positioning of concurrent-tracks as a paid feature.** Out of scope; separate positioning brief.
- **Per-program primary-color assignment UI.** Program colors are semantic (hip=amber-warm, engine=green-cool) but there's no user-facing picker. Not needed for MVP.

---

## Estimated implementation cost

**12-14h, medium-high confidence.**

- Schema + selector for `interference_warning`: 1h
- `TopActionRow` component + wiring (mostly rearrangement of existing SessionActions): 2h
- `ProgramSection` composite + collapse state slice: 3h
- Extract `BlockSection` to its own file + `programColor` prop on ExerciseCard: 1h
- `ProposalCard` extension + copy for new kind: 1h
- Wiring the new sub-tree into `page.tsx` + feature flags: 1.5h
- Cross-browser mobile pass (iOS Safari standalone, Android Chrome): 1h
- Persona-concurrent harness build (`plan.md` §1) — parallel work: 3h
- Buffer for delegate-specialist iterations (visual-craft palette, copy revs, motion tuning): 2h

Confidence downgraded from "high" to "medium-high" solely because persona-concurrent doesn't exist yet — we will discover state combinations at persona time that shift the collapsed-summary format. The core IA call and the interference-as-proposal call are safe.
