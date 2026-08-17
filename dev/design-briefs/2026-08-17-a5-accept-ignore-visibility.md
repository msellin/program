# A5 — Accept / Ignore visibility at rest

Owner: product-design-lead
Written: 2026-08-17
Status: draft — awaiting founder review
Related audits:
- `dev/audits/app/2026-08-17-app-audit-landing-alignment.md` (§3.5)
- `dev/audits/app/2026-08-17-app-audit-mobile-ux.md` (§2.1, §3.persona-strength `/` — auto-expand SignalsStrip)
- `dev/audits/app/2026-08-17-app-audit-accessibility.md` (§2.4 — live region on accept)
- `dev/active/post-audit-p0s/tasks.md` — A5 (deferred with reason)
Blocked by / blocks:
- Blocks A1 (over-performer TM-bump proposal) — the surface it renders on lands here.
- Blocks A2 (citations on proposals) — the citation slot is defined by this component.
- Blocks a follow-on brief on the Coach → Today deep-link (proposal focus target).

---

## The call

**Promote proposals to a single first-class Today surface — a `<ProposalStack>` that renders directly under the DateNav / phase line and above `HeroStateCard`, always expanded, showing Accept + Ignore inline, one card visible at a time with a "1 of N" pager, and completely absent (renders `null`, no placeholder) when the engine has nothing to say.** `SignalsStrip` shrinks to a passive one-line "engine noticed X" ribbon for signals that are NOT yet proposals; the moment a signal becomes actionable, it graduates into the ProposalStack and leaves the strip.

**Why (three-line summary):**

- The landing verbs "you Accept or Ignore" appear in three keys (`hero.sub`, `how.step_03_body`, `beta.body`) and the primary DOM state today is `aria-expanded="false"` with the verbs hidden — the promise fails at the first paint of the persona-strength Today capture. Fixing the wrapping accordion is not enough; the proposal needs the visual weight the landing gives it, and it needs to live where the thumb lives.
- A single `<ProposalCard>` component that accepts a typed payload is the only shape that survives A1 (TM-bump proposal), A2 (citations), and the two future proposal types the roadmap already implies (Cycle-end apply, Pause-return soften). Building three near-identical components today would ossify the surface right before it doubles in variants.
- The empty state must NOT be a placeholder card — a proposals surface that reserves space when the engine is silent teaches the user that the engine is always talking, which is exactly the opposite of the "confirm-first, quiet-when-quiet" mechanic the founder committed to in memory `feedback_confirm-first.md`. When there is nothing to say, the space collapses; `HeroStateCard` and the session content take the fold.

---

## The problem

Today's proposal surface fails on four axes at once.

**1. Landing promise vs. shipping DOM.** `landing/src/i18n/dictionaries/en.ts:9` promises "Every change cites a study — you approve each one." `en.ts:43` promises "You log a note. Engine proposes. You Accept or Ignore." `en.ts:86` promises "You Accept or Ignore each change." The shipping app renders the proposal as `next-app/src/components/workout/SignalsStrip.tsx:180` — a `<button aria-expanded="false">` with the label "Back after 17 days — soften plan?". Accept and Ignore never appear in the DOM until the user taps to expand. `dev/audits/app/2026-08-17-app-audit-landing-alignment.md` §3.5 confirms: `grep -oiE "Accept|Ignore" persona-*/dom/*.html` returns nothing at page load. The verbs the landing repeats seven ways are, as of today, invisible at rest.

**2. Two overlapping surfaces trying to do the same job.** `SignalsStrip` at `next-app/src/components/workout/SignalsStrip.tsx:38` collapses seven distinct signal types into one accordion. Two of those seven (`day-adj-proposal`, `readiness`) are *actual proposals with Accept/Ignore actions* — they render inside `SignalsStrip.tsx:277-278` as delegated children when expanded. The other five are notifications, links to Progress, or informational chips. Meanwhile `TierAdvanceProposal` at `next-app/src/app/page.tsx:172` renders as its own card immediately after `SignalsStrip`, so a strength user with a tier-clear proposal AND a day-adjustment proposal today sees the day-adjustment behind an accordion and the tier proposal as an already-expanded card — the exact same shape of signal, two different presentations. That is the audit's SignalsStrip vs. ProposalCard overlap named in `dev/active/post-audit-p0s/tasks.md` A5.

**3. Position undermines the promise.** `next-app/src/app/page.tsx:168-172` renders (in order): `HeroStateCard` → `SignalsStrip` → `TierAdvanceProposal`. On persona-strength's 393×852 capture (`dev/audits/app/2026-08-17-app-audit-mobile-ux.md` §2.1), the readiness proposal-strip lands at page-y 305, and Accept/Ignore (only reachable after expansion) parks below the visible fold at ~500-600. The mobile-UX audit's Hoober cradle-grip primary zone is y=568..852 on a 393×852 device. The proposal is not just hidden behind a tap — it is *scrolled out of thumb reach* even after expansion.

**4. The empty state is silently expensive.** Because `SignalsStrip.tsx:155` returns `null` when there are no signals, today's Today already has a "no placeholder" shape — good. But it means the ordering `HeroStateCard → SignalsStrip → TierAdvanceProposal` visually shifts by ~120px depending on whether the engine has anything to say, and the persona-strength capture shows that shift happening at the exact position the founder wants the proposal to live. The design has to hold two contradictions at once: "always land in the top-third thumb zone when there IS a proposal" and "vanish completely when there isn't". Reserving space fails both promises.

**Future-scenario enumeration.** The design must survive:

- A1 shipping — a TM-bump proposal for overperformers (`bg-green` accept, "Bump squat TM +2.5 kg", Accept mutates `training_maxes`).
- A2 shipping — every proposal renders a citation line (log-cited OR study-cited).
- Multi-proposal density on `persona-recover` (day-adjustment + monthly hip check + readiness, three concurrent).
- `persona-erratic` (15 skips, layoff proposal, symptoms low) — dense-state coherence.
- Coach deep-link back to Today "you have a proposal" — focus target.
- Offline / PWA — cached proposal generated last session still renders.
- Screen reader — Accept mutation announced via existing `next-app/src/lib/announce.ts` (already wired at `DayAdjustmentProposal.tsx:117`, `ReadinessProposal.tsx:92`, `TierAdvanceProposal.tsx:71`).
- `prefers-reduced-motion` — entry animation degrades.
- Desktop viewport (PWA installed on a laptop; the founder's own testing surface).

---

## Options considered

### Option A — "Un-collapse the accordion"

- **Shape:** Change `SignalsStrip.tsx:184` to render `expanded=true` by default when there is exactly one proposal-shaped signal in the list. Keep every other structural choice.
- **Sketch:**
```
+--------------------------------------------------+
| DateNav / phase                                  |
+--------------------------------------------------+
| HeroStateCard (state strip or ring card)         |
+--------------------------------------------------+
| SignalsStrip (auto-expanded when 1 proposal)     |
|  [!] Back after 17 days — soften plan?  ^        |
|  Because you logged 17 skipped days.             |
|  [ Apply 10% lighter ] [ Not today ]             |
+--------------------------------------------------+
| TierAdvanceProposal (still a separate card)      |
+--------------------------------------------------+
| Barbell block …                                  |
```
- **Pros:** Cheapest change — one boolean flip in `SignalsStrip.tsx`. Preserves the existing code path for informational signals (Rescheduled session, Morning check overdue) that don't have Accept/Ignore.
- **Cons:** Doesn't solve the position problem (proposal still at page-y 305, below HeroStateCard). Leaves the `SignalsStrip` vs. `TierAdvanceProposal` split intact — persona-recover in a busy state still sees two structurally different card presentations for signals that carry identical semantics. Doesn't solve the "no ProposalCard primitive" gap A1 and A2 will crash into. Doesn't touch the ordering rule when 2+ proposals fire. Fails the "future-proof" bar the founder asked for.
- **Verdict:** rejected. This is the soften-the-landing-copy path with fewer keystrokes — it clears the audit line item and locks in the debt.

### Option B — "One `<ProposalStack>` above HeroStateCard, one-at-a-time pager"

- **Shape:** Delete `TierAdvanceProposal` from Today's direct render. Extract a single `<ProposalCard>` component that accepts a discriminated-union `Proposal` payload. Render a new `<ProposalStack>` container at `next-app/src/app/page.tsx:159` (directly under DateNav / phase, above `HeroStateCard`) that: (a) returns `null` when no proposals, (b) renders one `<ProposalCard>` at a time with a "1 of N →" pager when 2+, (c) orders by priority: rehab-safety > engine-cited > opportunistic. `SignalsStrip` shrinks to a passive one-line ribbon for signals that are NOT proposals (Rescheduled, Morning-check overdue, Cycle-end link, Pause-return link).
- **Sketch:** See "Full wireframe" below.
- **Pros:** Single component handles every proposal type — A1's TM-bump, A2's citation slot, DayAdjustment, Readiness, Tier — no new component per type. Position lands in the top thumb-zone third when the engine has something to say. Vanishes completely when it doesn't. Consent-first is structural: Accept always requires the button press, Ignore is a peer action, both are undoable via toast. Pager keeps info density constant regardless of proposal count (never a stack of five accordion cards). Passes the "future-proof" test — proposals will multiply.
- **Cons:** Requires a schema addition (a `Proposal` union type) and refactoring three existing components into instances of one. Deletes `TierAdvanceProposal` as a Today-slot — its logic moves into the ProposalStack payload generator. Pager UX for 2+ proposals is a new pattern in this app; users must learn "1 of 3 →".
- **Verdict:** **winner.**

### Option C — "Sticky bottom-sheet FAB — Whoop pattern"

- **Shape:** Render a fixed-bottom pill at `bottom-[calc(52px+env(safe-area-inset-bottom)+12px)]` (just above BottomNav) that reads "1 proposal — review" and opens a bottom sheet with the full Accept/Ignore card. Empty state: no pill.
- **Sketch:**
```
+--------------------------------------------------+
| Today's content …                                |
|                                                  |
|  [Barbell block, exercises, …]                   |
|                                                  |
+--------------------------------------------------+
|            [ 1 proposal — review ↑ ]             |  ← fixed pill
+--------------------------------------------------+
| [Home] [Progress] [History] [Programs] [More]    |  ← BottomNav
+--------------------------------------------------+
```
- **Pros:** Primary action in the primary thumb zone. Never scrolls out of reach. Whoop-native pattern many users already know.
- **Cons:** Hides the reason line behind a tap (same failure as today's accordion, different wrapper). Landing promises the Accept/Ignore verbs are visible; a pill labeled "review" is still one tap of hiding. Collides with the BottomNav keyboard-open logic added in D2 (`BottomNav.tsx` `useKeyboardOpen`) — now two fixed elements to coordinate. Adds a persistent-chrome surface for a fundamentally spontaneous UI — most days there is no proposal, and the pill's absence becomes its own signal ("nothing to do") that's ambiguous with "not yet computed". Worst: it re-hides the citation the landing promises to make visible.
- **Verdict:** rejected. This is a strong pattern for "start workout" (always relevant) but wrong for confirm-first proposals (occasional, per-day, information-first).

---

## Chosen: Option B — `<ProposalStack>` above `HeroStateCard`, one-at-a-time pager

### Full wireframe

**393px mobile, proposal present (persona-strength — pause-return soften):**
```
+--------------------------------------------------+
| ⚡ TERAV       [layers] [stethoscope]  (header)  |
+--------------------------------------------------+
| < Wed 19 Aug >                                   |
|   Base — Block 1 · week 3 of 6 · ends 6 Sep      |
+--------------------------------------------------+   ← primary zone starts here
| ┌ Proposal · because you logged 17 skipped days ┐ |
| │ Soften back into it                           │ |
| │                                                │ |
| │ 10% lighter top sets for today only. Rehab &  │ |
| │ mobility stay as prescribed.                   │ |
| │                                                │ |
| │ Source: Mujika & Padilla 2000 (Sports Med).    │ |
| │                                                │ |
| │ [ Accept lighter ]  [ Ignore ]                 │ |
| └────────────────────────────────────────────────┘ |
+--------------------------------------------------+
| ● Green · Progress load · [state strip]          |  ← HeroStateCard compact
+--------------------------------------------------+
| Signals: Morning check overdue (2d)  →           |  ← SignalsStrip (passive)
+--------------------------------------------------+
| Barbell reintro session                          |
| Squat  92.5 × 5  [ log ]                         |
| …                                                |
+--------------------------------------------------+
| [ Move day ] [ Skip today ] [ Whole week ]       |
+--------------------------------------------------+
```

**393px mobile, no proposal (persona-strength, day 30 green streak, pre-A1):**
```
+--------------------------------------------------+
| < Wed 19 Aug >                                   |
|   Base — Block 1 · week 3 of 6 · ends 6 Sep      |
+--------------------------------------------------+
| ● Green · Progress load · [state strip]          |  ← HeroStateCard rises to fill
+--------------------------------------------------+
| Barbell block …                                  |  ← session content takes fold
```
No placeholder. No "quiet day" microcopy. The absence IS the design.

**393px mobile, two proposals (persona-recover — amber morning + monthly hip check):**
```
+--------------------------------------------------+
| < Fri 22 Aug >                                   |
|   Reintro — Phase 1 · week 2 of 4 · ends 5 Sep   |
+--------------------------------------------------+
| ┌ Proposal 1 of 2 · Needs your ok              ┐ |
| │ Not feeling 100%?                              │ |
| │                                                │ |
| │ Groin score 4/10 and morning stiffness > 30    │ |
| │ min. Apply 15% lighter today?                  │ |
| │                                                │ |
| │ Source: your log (past 2 days).                │ |
| │                                                │ |
| │ [ Apply 15% lighter ]  [ Not today ]           │ |
| │                                                │ |
| │           1 of 2  ●○   →                       │ |  ← pager
| └────────────────────────────────────────────────┘ |
+--------------------------------------------------+
| ● Amber · Hold load · [state strip]              |
+--------------------------------------------------+
| Signals: Rescheduled session · Extras open   →   |
+--------------------------------------------------+
| Reintro session — 80% TM cap                     |
| …                                                |
```

**Cross-persona coherence check**

| Persona | State | Does the design hold? | Notes |
|---------|-------|-----------------------|-------|
| persona-recover | rehab, symptomatic morning, 2 proposals (day-adj + hip-check-due) | y | Pager shows "1 of 2 →". Rehab-safety-first ordering puts day-adjustment first (that's the load-mutating one; hip-check is a nav link). Amber HeroStateCard follows below unchanged. Verified against `next-app/tests/e2e/screenshots/matrix-v2/injured-recovery_anterior-hip-rebuild/`. |
| persona-strength | overperformer, post-A1 TM-bump proposal | y | Same card, `bg-bronze` accent (not `bg-green` — matches E3's rogue-green fix). Reads "Bump squat TM +2.5 kg — 4 straight sessions above prescribed reps with RPE ≤ 7. Source: Wathan 1994 (repetition-max estimation)." Accept mutates `training_maxes`. Anticipates A1 shipping. |
| persona-erratic | 15 skips, pause-return soften proposal, amber symptoms | y | Single proposal (pause-return). Reason cites log ("17 days without a strength session"). No study cite required. Accept applies the soften multiplier via existing `acceptDayAdjustment` action. Verified against `next-app/tests/e2e/screenshots/matrix-v2/erratic_anterior-hip-rebuild/`. |
| persona-strength | green streak, pre-A1 | y (empty state) | ProposalStack returns null. HeroStateCard rises. No dead space. Matches `next-app/tests/e2e/screenshots/matrix-v2/overperformer_anterior-hip-rebuild/` today. |

**Modern-standard checks**

- iOS HIG: Card is a `<section>` inline with content, not a modal or sheet — proposals are decisions on the primary surface, not modal interruptions. Safe-area handled by parent `<main>` padding. Tap targets ≥ 44×44 via existing `min-h-[44px]` on all buttons in the current proposal components. Pass.
- Material 3: State layer on the accent button uses existing `hover:bg-bronze-hover` + `active:scale-[0.98]`. Motion duration for card-in is 150ms (matches the app's `main` route-in in `globals.css`). Pass.
- Refactoring UI: One primary action per card (Accept). Ignore is styled as `border border-line` outlined — hierarchy through weight, not color. Accent stays bronze; no rogue greens (E3 already caught the ReadinessProposal case at `ReadinessProposal.tsx:94`). Pager dots are `text-muted`, not accented. Pass.
- `prefers-reduced-motion`: New proposal enters with `animate-card-in` (150ms fade + 4px translateY). Under reduced-motion, `animate-card-in` degrades to opacity-only per the F1 wrapper already added to `globals.css`. Accept `pulse-accept` also already wrapped. Pass.
- Fitts's law: Card lands at page-y ~200 (below DateNav ~130, above HeroStateCard ~360). Accept button center at ~y=350 on a 393×852 viewport — top edge of the primary thumb zone. Reachable from cradle grip (thumb origin y=790) with a 440px stretch. Not perfect (a sticky-bottom pattern would be better on Fitts alone), but Fitts is not the only law; the citation line and reason must be readable in the same frame as the buttons, and a bottom-anchored pill sacrifices that. Documented tradeoff.

---

## Interaction contract

**Position:** ProposalStack renders at `next-app/src/app/page.tsx:159`, immediately after the phase-progress line, before `<HeroStateCard>`. `TierAdvanceProposal` is removed from `page.tsx:172` (its logic moves inside ProposalStack). `SignalsStrip` at `page.tsx:170` stays where it is but is refactored to strip out proposal-shaped signals (see "Relationship to SignalsStrip" below).

**Default state:** Always expanded. Reason line wraps up to 3 lines then clips with `line-clamp-3` and a `<button>` "Read the whole reason" that expands in place (no route change). At 393px, the reason budget is ~180 characters at 3 lines of 14px/leading-snug — enough for every current proposal's reason string plus one citation.

**Accept interaction:**

1. Tap Accept → `hapticTap("medium")` fires (already wired).
2. Card gets `.pulse-accept` class (existing 400ms animation, already reduced-motion-safe).
3. Store mutation via existing action (`acceptDayAdjustment`, `promoteTier`, `advancePhase`, or new `bumpTrainingMax` for A1).
4. `announce()` writes to `#app-status` live region (already wired).
5. Card unmounts. **A `<Toast>` renders in its place for 6 seconds with the text "Lighter session applied. Undo" — tap Undo → mirror mutation reverts, card returns.** This is the consent-first "undoable within a session" rule from the founder's memory `feedback_confirm-first.md`. Undo window: 6 seconds because that's the WCAG timeout floor per §2.2.1 (long enough to react to a mis-tap without being nagged).
6. After the toast expires, the mutation is durable. The user can still see and reverse the change on Progress (existing `clearDayAdjustment` for load, or a Progress-side undo for TM).
7. Accepted proposals log to a NEW `proposal_history[]` field on the store (see "Data shape changes") so History can render "Accepted 15% lighter · Fri 22 Aug" as a first-class row.

**Ignore interaction:**

1. Tap Ignore → no haptic (ignore is a low-cost dismiss).
2. `dismissProposal(date, proposalId)` writes to existing `dismissed_proposals` map.
3. Card unmounts. Toast renders "Ignored. Undo" for 6 seconds.
4. **Ignored proposals appear in History with a timestamp** — same `proposal_history[]` field, kind: `ignored`. This is transparency, not a nag. User can see "Ignored 'Soften plan?' on Wed 20 Aug" — useful when reviewing why they had a bad week.
5. Ignored proposals do NOT re-fire the same day (existing `dismissed_proposals` semantics). They CAN re-fire on subsequent days if the underlying condition still holds — this is the erratic-persona pattern (15 skips means the pause-return proposal keeps re-firing until the user gets back to it).

**Consent-first defaults observed:**

- Explicit action required to write — no silent mutation on card mount.
- Undoable within 6 seconds via toast; durable-undoable via Progress after that.
- Persistence transparency: `day_adjustments` and new `proposal_history` are localStorage/KV-persisted (existing `commit()` pipeline in `useStore.ts:562`). No auth-server writes on proposal accept.
- GDPR-honest for medical: rehab-adjacent proposals (day-adjustment on hip-rebuild) show "Rehab & mobility work stays as prescribed" as an inline reassurance — same string already in `DayAdjustmentProposal.tsx:106`.

**Multiple proposals — ordering rule:**

Priority sort (descending):

1. **Rehab safety** — any proposal that softens load on a symptomatic day. Concretely: day-adjustment proposals when today's `derived_state === "amber"` or `"red"`.
2. **Engine-cited** — proposals with a study citation (post-A2): TM-bump, tier-advance, pause-return-soften.
3. **Opportunistic** — hip-check-due, ready-to-leave-reintro (informational, not mutation-shaped).

Within the same tier, most-recent-signal-first (the underlying `generatedAt` timestamp).

**Serialized, not stacked.** One card visible at a time with a "1 of N ●○○ →" pager. Rationale: three expanded proposal cards on a 393px viewport is 500px+ of prompts before HeroStateCard shows up — the surface stops feeling like a plan and starts feeling like an inbox. Serial pager keeps card content dense and readable while making count-transparency explicit ("Two more to review"). Accept/Ignore advances the pager to the next card automatically. When there is exactly one proposal, no pager renders.

**Empty state — the space collapses.** When ProposalStack has zero proposals, it renders `null`. `HeroStateCard` moves up to fill the position. This is not "let HeroStateCard take the position" — it IS HeroStateCard's position when there's no proposal. The founder rule from the prompt ("do NOT let it stay a placeholder card") is honored structurally.

**Relationship to SignalsStrip.**

`SignalsStrip` does NOT die. It shrinks role: it becomes the passive "engine noticed X (no proposal yet)" ribbon. Concretely:

- Signals that carry Accept/Ignore verbs graduate OUT of SignalsStrip into ProposalStack:
  - `day-adj-proposal` (currently `SignalsStrip.tsx:76`)
  - `readiness` (currently `SignalsStrip.tsx:87`)
  - `cycle-end` (currently a nav link at `SignalsStrip.tsx:102`) — becomes a proposal with Accept="Apply all cycle changes", Ignore="Review on Progress" (deferred to A1's session, but the surface is ready).
  - `pause` (currently a nav link at `SignalsStrip.tsx:113`) — becomes a proposal with Accept="Soften this week", Ignore="Not today".
- Signals that stay in SignalsStrip (no verbs, just information):
  - `override` (rescheduled session — this is state, not a decision).
  - `hip-check-due` (a nav link to `/check/hip`).
  - `check-overdue` (a nav link to `/check`).

SignalsStrip's collapsed-strip form (`SignalsStrip.tsx:180-209`) stays as-is for these informational signals. Its expanded body drops the four "delegated component" slots at lines 214-279. This is a simplification of a component that had accumulated seven responsibilities; it now has three.

**Argue-and-commit:** SignalsStrip could have died entirely, with the three residual signals promoted to their own top-of-page ribbons. Rejected: three separate ribbons for three low-frequency informational signals is worse than one collapsible strip for the same signals. The strip pattern earns its keep for "engine has non-actionable observations" — which is a real category and will grow.

---

## Data shape changes

New: a discriminated `Proposal` union and a `proposal_history` field on the store. Additive; no migration required for existing users (fields default to `undefined`).

```ts
// next-app/src/lib/schemas.ts — append near line 695 (after dismissed_proposals)

/**
 * Materialized proposal payload the ProposalStack renders. Generated on every
 * store change by a pure derivator (`selectProposals(store, program, date)`),
 * not persisted — the store persists the *outcome* of the accept/ignore
 * (day_adjustments, dismissed_proposals, proposal_history), never the
 * proposal candidates themselves.
 */
export type Proposal =
  | {
      kind: "day-adjustment";
      id: string;              // stable per-day, e.g. "load-0.85"
      priority: "rehab-safety" | "engine-cited" | "opportunistic";
      title: string;           // "Not feeling 100%?"
      reason: string;          // "Groin 4/10, stiffness > 30 min. Apply 15% lighter?"
      citation:
        | { kind: "log"; text: string }         // "Because: your log (past 2 days)."
        | { kind: "study"; text: string; href?: string };  // "Source: Mujika & Padilla 2000"
      acceptLabel: string;     // "Apply 15% lighter today"
      ignoreLabel: string;     // "Not today"
      multiplier: number;      // payload for the accept action
    }
  | {
      kind: "readiness";
      id: string;
      priority: "engine-cited";
      title: string; reason: string;
      citation: { kind: "log"; text: string };
      acceptLabel: string;     // "Advance to Cycle 1"
      ignoreLabel: string;     // "Not yet"
      targetPhaseId: string;
    }
  | {
      kind: "tier-advance";
      id: string;
      priority: "engine-cited";
      title: string; reason: string;
      citation: { kind: "log"; text: string } | { kind: "study"; text: string };
      acceptLabel: string;
      ignoreLabel: string;
      programSlug: string;
      targetTierId: string;
    }
  | {
      kind: "tm-bump";   // A1's future payload — declared here now
      id: string;
      priority: "engine-cited";
      title: string; reason: string;
      citation: { kind: "study"; text: string; href?: string };
      acceptLabel: string; ignoreLabel: string;
      exerciseId: string;
      deltaKg: number;
    }
  | {
      kind: "pause-return-soften";
      id: string;
      priority: "engine-cited";
      title: string; reason: string;
      citation: { kind: "study"; text: string };
      acceptLabel: string; ignoreLabel: string;
      multiplier: number;
    };

// Add to storeSchema (next-app/src/lib/schemas.ts near line 695):
proposal_history: z
  .array(
    z.object({
      date: z.string(),              // date the proposal was shown
      proposal_id: z.string(),       // matches Proposal.id
      kind: z.string(),              // matches Proposal.kind
      outcome: z.enum(["accepted", "ignored", "undone"]),
      at: z.number(),                // unix ms
      snapshot: z.object({
        title: z.string(),
        reason: z.string(),
        citation_text: z.string().optional(),
      }),
    }),
  )
  .optional(),
```

No migration for existing users. `proposal_history` defaults `undefined` → History renders zero proposal rows for legacy accounts, which is correct.

---

## Component tree

**Current:**
```
TodayPage (page.tsx)
├── YourPlanCard
├── FirstRunBanner
├── MissedSessionPrompt
├── DateNav
├── (phase progress <p>)
├── HeroStateCard
├── SignalsStrip
│   ├── collapsed strip button
│   └── expanded body
│       ├── override info
│       ├── check-overdue nudge
│       ├── cycle-end nudge (link to Progress)
│       ├── pause-return nudge (link to Progress)
│       ├── <DayAdjustmentProposal>
│       ├── <ReadinessProposal>
│       └── <AssessmentDueBanner>
├── TierAdvanceProposal
├── RetestReminder
├── … taper/interference/skill banners
└── BlockSection(s)
```

**Proposed:**
```
TodayPage (page.tsx)
├── YourPlanCard
├── FirstRunBanner
├── MissedSessionPrompt
├── DateNav
├── (phase progress <p>)
├── ProposalStack                   ← NEW; renders null when empty
│   └── ProposalCard (paged)        ← ONE component, discriminated Proposal payload
├── HeroStateCard
├── SignalsStrip                     ← REFACTORED; passive-only
│   ├── collapsed strip button
│   └── expanded body
│       ├── override info
│       ├── check-overdue nudge
│       └── <AssessmentDueBanner>
├── RetestReminder
├── … taper/interference/skill banners
└── BlockSection(s)
```

### File-level changes (implementation notes)

- `next-app/src/lib/schemas.ts:695` — append the `Proposal` union export and `proposal_history` field to `storeSchema` (both additive).
- `next-app/src/lib/proposals/select.ts` — NEW. Pure function `selectProposals(store, program, date): Proposal[]`. Consolidates the logic currently spread across `SignalsStrip.tsx:42-152`, `DayAdjustmentProposal.tsx:30-72`, `ReadinessProposal.tsx:38-48`, `TierAdvanceProposal.tsx:21-23`, plus `note-signals.ts` (`daySignals`, `proposedLoadMultiplier`), `readiness.ts` (`assessReintroReadiness`), `tier-promotion.ts` (`nextEligibleTier`), and `adapt.ts` (`evaluateCycleEnd`, `detectPauseResume`). Returns a sorted array by the priority rule above.
- `next-app/src/components/workout/ProposalStack.tsx` — NEW. Reads `selectProposals()`, renders `null` if empty, else `<ProposalCard>` with pager. Owns the pager state (`useState` for `currentIdx`). Handles undo toast via a portal / existing `<Toast>` pattern (need one — currently the app has no toast primitive; simplest option is a `role="status"` region inline with the ProposalStack that shows for 6 seconds after Accept/Ignore).
- `next-app/src/components/workout/ProposalCard.tsx` — NEW. Renders one `Proposal`. Owns Accept/Ignore button wiring per `.kind`. Uses `announce()` from `next-app/src/lib/announce.ts`. Emits `data-proposal-kind={kind}` for e2e assertions.
- `next-app/src/lib/useStore.ts` — add `recordProposalOutcome(entry)` action + `undoLastProposalOutcome()`. Both are pure list mutations on `proposal_history[]` plus a mirror of the underlying data mutation. For Accept-of-day-adjustment: existing `acceptDayAdjustment` stays; the new action wraps it. For Undo of an accepted day-adjustment: call `clearDayAdjustment(date)` and pop the last `proposal_history` entry.
- `next-app/src/app/page.tsx:159` — insert `<ProposalStack program={primary} date={activeDate} />` between the phase progress `<p>` (line 166) and `<HeroStateCard>` (line 168).
- `next-app/src/app/page.tsx:172` — remove the `<TierAdvanceProposal>` line; its logic now flows through `selectProposals` → ProposalStack.
- `next-app/src/components/workout/SignalsStrip.tsx:42-153` — strip out four signal branches (`day-adj-proposal`, `readiness`, `cycle-end`, `pause`) plus the associated expanded-body sections at lines 214-279. Keep `override`, `hip-check-due`, `check-overdue`, and the `<AssessmentDueBanner>` delegate.
- `next-app/src/components/workout/DayAdjustmentProposal.tsx` — DELETE. Logic absorbed by `selectProposals` and rendered by `ProposalCard`.
- `next-app/src/components/workout/ReadinessProposal.tsx` — DELETE. Same.
- `next-app/src/components/workout/TierAdvanceProposal.tsx` — DELETE. Same.
- `next-app/src/app/history/page.tsx` — render `proposal_history[]` as a first-class row group ("Proposals · this week"). Deferred to a follow-up brief; the shape is defined here so the row group can land later without a schema change.

### Delegate-to-specialist

- **Type scale / palette:** → `app-visual-craft` — apply the current type ramp (E1's `10 / 12 / 14 / 16 / 18 / 24-30`) to ProposalCard. Confirm accent economy: bronze for Accept on log-cited proposals, bronze for Accept on study-cited proposals; `border-line` outlined for Ignore. NEVER green primary (E3 caught this in ReadinessProposal; do not re-introduce). Priority-tier signal color: rehab-safety = amber left-border, engine-cited = bronze left-border, opportunistic = slate left-border.
- **Ergonomics:** → `app-mobile-ux` — verify Accept + Ignore ≥ 44×44 (existing `min-h-[36px]` on the current components must be bumped to `min-h-[44px]` — this is a real change from what's shipping now). Pager tap target: full-width 44px strip at the card foot. Verify Fitts distance from cradle-grip (thumb origin y=790) to the Accept button center — target ≤ 480px.
- **A11y:** → `app-accessibility` — verify:
  - `<section aria-labelledby>` on ProposalCard, with an `id`-linked `<h2>` (visually the title, semantically the label).
  - `announce()` wired for both Accept AND Ignore ("Accepted", "Ignored — you can undo for 6 seconds").
  - Pager arrow buttons carry `aria-label="Previous proposal"` / `"Next proposal"`.
  - Focus after Accept: jumps to the next proposal's Accept if one exists, else to `<HeroStateCard>`'s state link.
  - Deep-link from Coach: `page.tsx` reads `?focus=proposal` search param; if present, scrolls to `#proposal-stack` and moves focus to the first card's title.
- **Copy:** → `app-copy-clarity` — write the strings:
  - Priority-tier eyebrow copy: "Because your log …" (log-cited) vs. "Because the research …" (study-cited).
  - Accept button verb per kind: "Apply lighter", "Advance", "Bump TM", "Soften the week".
  - Ignore button verb: single string "Ignore" (matches landing) — reject the current mixed "Not today" / "Not yet" / "Dismiss".
  - Toast strings: "Applied. Undo" / "Ignored. Undo".
  - Empty state has NO copy (structural absence).
- **Motion:** → `app-motion-perf` — confirm `animate-card-in` timing (150ms fade + 4px translateY), reduced-motion fallback (opacity only), pager slide (150ms translateX). Pulse-accept already reduced-motion-safe per F1.

---

## Migration

Additive change to the store. No user-visible migration.

- Step 1: Ship the `Proposal` union + `proposal_history` field (schema).
- Step 2: Ship `selectProposals` and `ProposalStack` behind a `NEXT_PUBLIC_FEATURE_PROPOSAL_STACK` env flag defaulted off. Old `SignalsStrip` + `DayAdjustmentProposal` + `ReadinessProposal` + `TierAdvanceProposal` continue to render.
- Step 3: Regenerate personas with the flag ON; confirm `persona-recover`, `persona-strength`, `persona-erratic` DOMs contain `>Accept<` and `>Ignore<` (or the resolved verbs — "Apply", "Advance") at page-load state, NOT behind `aria-expanded="false"`.
- Step 4: Flip the flag on; delete `DayAdjustmentProposal.tsx`, `ReadinessProposal.tsx`, `TierAdvanceProposal.tsx`; refactor `SignalsStrip.tsx` to passive-only.
- Rollback plan: If ProposalStack ships and users report confusion, flip the env flag off — the deleted components come back via git revert on `next-app/src/components/workout/{DayAdjustment,Readiness,TierAdvance}Proposal.tsx` and the `SignalsStrip` restore. `proposal_history[]` remains on the store even after rollback (additive field, no read-side dependency in the rolled-back state).

---

## Peer benchmarks

- **Linear** (linear.app inbox): proposal-like cards for merge conflicts and blocked issues render inline in the primary feed, expanded by default, with Accept-shaped verbs ("Resolve", "Snooze") visible without a click. Ignore is a peer action, not a hidden overflow. **Steal:** default-expanded, peer-verb hierarchy. **Reject:** their multi-proposal density (stacked, not paged) works for a triage inbox; wrong shape for a training app where "3 proposals today" reads as micromanagement.
- **Cal.com dashboard** ("upcoming bookings" + "pending confirmations"): the confirm surface is a card at the top of the feed with Accept/Decline visible at rest; when there are none, the space collapses and today's calendar rises to fill. **Steal:** the empty-state collapse (no placeholder card). **Reject:** their two-column desktop layout — doesn't translate to the 393px thumb-first constraint.
- **Anthropic console** (permission-request modals): confirm-first with a citation of what the change does and a Reject verb. **Steal:** citation line as a first-class field of the card, not an afterthought. **Reject:** modal presentation — training proposals are not blocking; a modal here would break Fitts and interrupt the flow of a lifter opening the app between sets.
- **Whoop** (readiness recommendation): a top-of-home card with a colored border and a single accept-shaped action. **Steal:** priority-tier color coding (their red-recovery card is unmistakable). **Reject:** their opaque scoring — Whoop doesn't cite anything; the whole point of A2 is to fix that.

---

## What this decision does NOT solve

- **Coach → Today deep-link.** The interaction contract names `?focus=proposal` but the Coach side of the round-trip (a coach reply says "you have a proposal — review") is deferred to the Coach-shipping brief (B4 / post-launch).
- **`proposal_history[]` on History.** Schema is defined; the History-page row group is a follow-up brief.
- **Multi-day proposal digest.** If a user misses the app for 3 days and 3 proposals stacked, do we show today's only, or all three? Deferred — for now, `selectProposals` runs on today's date only. Erratic-persona's pause-return proposal already covers the "you've been away" case.
- **Desktop-optimized layout.** The design is mobile-first and works on desktop because the desktop layout is just the mobile layout in a max-w-container. If desktop earns a dedicated grid, ProposalStack lives in the same left column.
- **Toast primitive.** This brief assumes a `<Toast>` for 6-second undo. The app has no shared toast component today. The simplest path is an inline `role="status"` div rendered by ProposalStack itself; if the app grows other toast needs (mark-done confirmations, error banners) a shared `<Toast>` component becomes worth extracting. Deferred.
- **A1 rule + A2 citation-mapping.** The `Proposal.citation` slot is defined; what strings the engine puts in it for TM-bump (A1) and for each proposal type (A2) is those briefs' work.

---

## Estimated implementation cost

**10-14h, high confidence.**

- Schema addition + `selectProposals` extraction: 3-4h.
- `ProposalStack` + `ProposalCard` (with pager, undo toast, focus management): 3-4h.
- `SignalsStrip` refactor + deletion of three old proposal components: 2h.
- Wiring `page.tsx`, `useStore` actions (`recordProposalOutcome`, `undoLastProposalOutcome`): 1-2h.
- Persona test regeneration + Playwright assertions ("Accept" and "Ignore" visible at page load): 1-2h.

Risk factors:
- The Undo toast is the least-familiar pattern in the app; if it grows a shared primitive, that's another 1-2h.
- The A1 TM-bump proposal payload is declared in the union here but its generator is A1's work. This brief will ship without live `kind: "tm-bump"` proposals; that's fine — the union tolerates it.
- The pager UX on 2+ proposals is untested with real users; if it reads as "hidden nag", a stacked-cards fallback is 1-2h.
