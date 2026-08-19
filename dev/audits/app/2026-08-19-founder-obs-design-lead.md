# Founder observations synthesis — design-lead calls (2026-08-19)

Owner: product-design-lead
Written: 2026-08-19
Status: draft — awaiting founder review
Related audits:
- `dev/audits/app/2026-08-19-founder-observations-queue.md` (17 raw observations)
- `dev/audits/app/2026-08-19-master-task-list.md` (28 batches shipped; §G rejected list)
- `dev/audits/app/2026-08-19-design-brief-features.md` (prior F2/F5/F6/F7 brief — Batches 23-25)
- `dev/audits/app/2026-08-19-gowod-visual-system.md` (Batch 16 visual system)
- `dev/audits/app/competitor-refs.md`
- Fresh 2026-08-19 persona artifacts (`next-app/tests/e2e/artifacts/personas/*`)

Blocks: Batch 29 (Decision 1 — IA), Batch 30 (Decision 2 — visual system v2), Batch 31 (Decision 3 — readiness ladder), Batch 32 (Decision 4 — tier explain-back).

---

## TL;DR — four decisions, four calls

1. **IA restructure (O2 + O3 + O4).** SHIP the header collapse (TERAV left · Settings right) AND the Today-dashboard AND the Settings-v1 route in **one batch (29)**. Sequencing them is worse than shipping together — the header and Today are a single mental model; splitting introduces two IA moments the user has to relearn. Settings v1 = sound, haptic, theme (deferred toggle-only), language (row present, disabled). Events dies (delete route + link). Evidence moves to Profile → More. Morning check re-homes as the top block on Today's dashboard, header dot dies with it (closes O13).

2. **Consolidated visual system v2 (O7 + O9 + O14 + O15 + O17).** ONE brief, ONE batch, ONE deploy. The primitive that answers all five observations is the **"named block card"** — a bordered surface with a mono-caps eyebrow, an H3 semibold title, a one-line lede, and slotted body content. Applies to Today's dashboard blocks, workout blocks inside a session, exercise cards, program-preview info sections, and program catalog "All" view groupings. **Programs "All" view stays list-first, NOT GOWOD category-tiles** — 5 public programs is too few for tiles to earn their pixels. Revisit at N≥10 programs.

3. **Readiness ladder — REVIEWED gets a real process; PROVISIONAL stops leaking.** SHIP: (a) rename PROVISIONAL → **DRAFT** internally, HIDE from public catalog (matches `personal:true` behavior). (b) REFERENCED stays the entry-level public state. (c) REVIEWED requires a **`reviewed_by` schema field** with reviewer identity, date, and scope; the first program to get REVIEWED is anterior-hip-rebuild (Margus's orthopaedist is the only real specialist review the beta can afford). (d) VERIFIED gates on `beta_completions >= 5` — same class of trigger as R11. If REVIEWED is unreachable for engine/skill/mobility programs in beta, be honest: **drop the REVIEWED tier from the legend copy** and ship a two-tier ladder (REFERENCED → VERIFIED) with a fourth "specialist-reviewed" pill that only lights up when the field is populated. Cleaner than a promise we can't keep.

4. **Tier-recommendation bug (O10c) — it IS a bug, ship the fix AND the explain-back copy.** A user who reported "3-5 strict reps" and skipped physical tests should NOT land on Tier A. The safety-first fallback is a real design pattern, but the **fallback should be Tier B, not Tier A**, and the placement page's "How this was picked" disclosure MUST name the signal used ("You said 3-5 strict reps · we couldn't verify with a physical test · started at Tier B — tap Tier C if you're already there"). Provide both flavors of copy below so engineering picks the branch that matches root-cause.

---

# Decision 1 — The IA restructure (O2 + O3 + O4)

## The call

Ship all three IA changes in **one batch (29)**, in this order of the render tree: header collapse → Today-dashboard skeleton → Settings v1 route. Don't sequence — the user's mental model of "where does this action live" needs to shift once, cleanly.

### Sub-calls

| Item | Call | Rationale |
|------|------|-----------|
| **O2** — Programs off top nav | KILL. Move to Profile → Programs list (already exists) + fresh empty-state CTA on Today. | Free users have 1 program; multi-program is paid. Slot serves paid users; costs everyone. |
| **O3a** — Morning-check as Today block | KILL header icon. Promote to top block of Today dashboard. | Frequency ≠ chrome-worthy. Morning check IS content — status card with tap-to-log. |
| **O3b** — Today = dashboard of blocks | SHIP. See dashboard skeleton below. | The single biggest interaction-model win in the queue. Aligns with F6 (Week collapse), F5 (retest hand-off card), signals-strip pattern. |
| **O3c** — Events | DELETE ROUTE. Remove `/events` entirely, drop from HeaderQuickLinks. | Placeholder leaks intent; super-admin can hit dev branch. Middle ground rots. |
| **O4a** — Evidence → Profile More | SHIP. Add Evidence row to Profile "More" section next to Guide. | Reference material family. |
| **O4b** — Header = TERAV + Settings | SHIP. Kill icon strip + ⋮ menu entirely. | Whoop / Runna / Pliability model. Bottom nav owns tab-switching, top owns identity + preferences. |
| **O4c** — Settings v1 scope | SHIP: sound toggle · haptic toggle · theme (present but disabled with "coming soon" caption) · language (row present, disabled). Add-to-home-screen row moves here. Data & privacy stays on /account. | Ship the primitives. Theme + language are placeholder rows so users know they're coming without demanding a light-mode palette pass this batch. |

## Rejected-list implications

- **R5 (gamification)** — dashboard blocks tempt "streak count" or "% complete" widgets. Do NOT bake completion counters into blocks. Blocks show *state* + *next action*, not *history achievement*. If completion needs to appear it goes on Progress, not Today.
- **R6 (Coach empty-state fold)** — dashboard model *does* answer R6's tension (blocks can render empty gracefully — the Extras block is empty on rest days, the Workout block is empty on Sunday). But do NOT auto-add filler blocks; empty Today is honest. R6 stands.
- **R9 (one arc per day)** — dashboard reinforces multi-track. Multiple Workout blocks stack (one per active plan) — see sketch below. Anti-Pliability by design.

## Dashboard skeleton (mobile 393px)

```
+---------------------------------------------------------+
| TERAV ●                                        [ ⚙ ]    |  <- header collapse (O4b)
+---------------------------------------------------------+
| < Tue 18   Wed 19 Aug   Thu 20 > · [ ⌂ ]                |  <- DateNav (fixed O12 slot)
+---------------------------------------------------------+
|                                                         |
| ┌─── MORNING CHECK ──────────────────────────┐          |
| │ ● green · nothing above 3/10                │          |  <- morning-check block (O3a
| │ Log symptoms · 30-second check          [›] │          |     absorbs header dot O13)
| └─────────────────────────────────────────────┘          |
|                                                         |
| ┌─── PROPOSAL · AMBER SOFTEN ────────────────┐          |
| │ ⚠ Groin trend up. Ease Wed loads by 5%.    │          |  <- proposals surface as blocks
| │ Source: Halson 2014                         │          |     (was: ProposalStack, keep
| │        [ Accept ]   [ Not this time ]       │          |     the component, restyle
| └─────────────────────────────────────────────┘          |     to block chrome)
|                                                         |
| ┌─── TODAY · ANTERIOR HIP REBUILD ───────────┐          |
| │ Barbell reintro · Zone 1/2 steady-state    │          |
| │ 5 exercises · ~48 min                       │          |  <- Workout block, one per
| │        [ Open session → ]                   │          |     active program
| └─────────────────────────────────────────────┘          |
|                                                         |
| ┌─── TODAY · ENGINE BUILDER BLOCK 1 ────────┐          |
| │ Long aerobic · Z2 · 45 min                 │          |  <- multi-track: second block
| │        [ Open session → ]                   │          |     stacks below the first
| └─────────────────────────────────────────────┘          |
|                                                         |
| ┌─── EXTRAS ─────────────────────────────────┐          |
| │ 2 optional accessories today               │          |
| │ Ankle rocker · Thoracic opener          [›] │          |  <- Extras block collapsed
| └─────────────────────────────────────────────┘          |     by default, tap to expand
|                                                         |
+---------------------------------------------------------+
| Today · Week · Progress · History · Profile             |
+---------------------------------------------------------+
```

### Interaction contract per block

| Block type | Default state | Tap target | Expanded reveals | Persistence |
|------------|---------------|------------|------------------|-------------|
| **Morning check** | Collapsed 1-line status + chevron | Whole card | Routes to `/check/` — full flow lives on its own route (don't inline the 5-question form) | Status persists in `logs[date].symptom_score` |
| **Proposal** | Full card (no collapse — proposals ARE the primary action) | Verbs stay inline: Accept · Not this time | n/a | Confirm-first ConfirmSheet on Accept |
| **Workout** | Collapsed 2-line (block name + count/duration) + primary CTA | "Open session →" routes to `/session/[program-slug]` (new route OR extend `/` behavior with `?program=slug`) | Full session content lives on the session route — dashboard block does NOT inline the exercises | Session-open state doesn't persist |
| **Extras** | Collapsed 1-line count + chevron | Whole card | Expands inline to show optional accessory list; tap accessory routes to `/extras/[id]/` | Expansion state ephemeral |

**Key design call:** Workout block **does NOT inline-expand into the full session**. It's a hand-off, not a container. The current `page.tsx` inlines HeroStateCard + all block content — that's ~1200 lines of "Today IS the session." The dashboard model **splits Today from Session**: Today is a dashboard; Session is `/session/[slug]` or (cheaper) `/?program=slug&open=true` toggling the current inline mode. Recommendation: **new `/session/[slug]` route** for clarity + deep-linkability + browser-back semantics. Cost: ~M size on top of the dashboard skeleton itself. See file-level notes below.

### Cross-persona coherence check

| Persona | Today dashboard state | Holds? | Notes |
|---------|----------------------|--------|-------|
| `persona-recover` | 3 blocks: MorningCheck (amber), Proposal (soften), Workout (anterior-hip) | Yes | Amber dot on MorningCheck block reads faster than the current green banner + header dot double-signal (O13 closed). |
| `persona-strength` | 4 blocks: MorningCheck (green), Workout (5/3/1), Workout (Engine Builder), Extras | Yes | Multi-track blocks stack cleanly. No visual noise. |
| `persona-erratic` | 2 blocks: MorningCheck (unlogged), Workout (paused) | Yes | Absence is honest — no Proposal block means no proposal today. R6 preserved. |
| `persona-graduate` | 1 block: GraduationCard-as-block (retest hand-off from F5) | Yes | GraduationCard already fits the block treatment; wrap it in the block chrome and it's done. |

### Modern-standard checks

- **iOS HIG**: Session opens as a **route** (`router.push('/session/[slug]')`), not a sheet — session is a destination, not a modal task. Correct semantics.
- **Material 3**: Blocks use state layers — hover/press elevation via `bg-surface hover:bg-surface-hover`, existing tokens.
- **Refactoring UI**: One primary action per block. Only ONE bronze CTA visible at rest per dashboard render (the topmost non-completed block's action).
- **`prefers-reduced-motion`**: Block expand uses `max-height` transition; reduced-motion path renders instant.
- **Fitts's law**: Chevrons ≥ 44×44; primary CTAs sit right-edge of card in thumb zone.

## File-level implementation notes (Decision 1)

- `next-app/src/components/AppShell.tsx:155-171` — DELETE the `<Link href="/programs/">` + `<Link href="/check/">` + `<HeaderQuickLinks />`. REPLACE with a single `<Link href="/settings/">` (aria-label "Settings", 44×44, `Settings` icon from lucide, 18px stroke 1.75). `ReadinessDot` at `:153` stays (persona at-a-glance signal, single semantic use).
- `next-app/src/components/nav/HeaderQuickLinks.tsx` — DELETE the file entirely once Evidence + Report + Extras are relocated to Profile More.
- `next-app/src/app/profile/page.tsx` (More section, existing at ~line 275) — ADD rows: Evidence · Report · Extras. Each row uses the existing Guide row treatment (icon + label + chevron). Guide stays.
- `next-app/src/app/page.tsx:1-1364` — MAJOR refactor. Extract from the current monolithic file:
  - New: `next-app/src/components/today/DashboardBlock.tsx` — the block primitive (see Decision 2 for props shape).
  - New: `next-app/src/components/today/MorningCheckBlock.tsx` — replaces the current inline HeroStateCard "readiness = green" band.
  - New: `next-app/src/components/today/WorkoutBlock.tsx` — collapsed block; primary CTA routes to `/session/[slug]`.
  - New: `next-app/src/components/today/ExtrasBlock.tsx` — collapsed by default.
  - EXISTING: `ProposalStack.tsx` — restyle each card as a DashboardBlock (component change, not delete).
  - EXISTING: `GraduationCard.tsx`, `RetestReminder.tsx` — wrap in DashboardBlock chrome. No logic changes.
- New: `next-app/src/app/session/[slug]/page.tsx` — hosts the full session view (currently inline on Today). Move `HeroStateCard`, `BlockSection`, `ExerciseCard` composition here. `/` becomes the dashboard.
- New: `next-app/src/app/settings/page.tsx` — Settings v1 (see rows below).
- DELETE: `next-app/src/app/events/page.tsx` + any references.

### Settings v1 row inventory

```
+---------------------------------------------------------+
| ‹ Back                                                  |
|                                                         |
| Settings                                                |
|                                                         |
| SOUND                                                   |
| ┌───────────────────────────────────────────────┐       |
| │  Sound effects            [ on   / off ]      │       |
| │  Timer complete, Accept confirm.              │       |
| └───────────────────────────────────────────────┘       |
|                                                         |
| HAPTICS                                                 |
| ┌───────────────────────────────────────────────┐       |
| │  Haptic feedback          [ on   / off ]      │       |
| │  Buzz on tap, accept, skip.                   │       |
| └───────────────────────────────────────────────┘       |
|                                                         |
| APPEARANCE                                              |
| ┌───────────────────────────────────────────────┐       |
| │  Theme                    Dark (default)    › │       |
| │  Light theme coming soon.                     │       |
| └───────────────────────────────────────────────┘       |
|                                                         |
| LANGUAGE                                                |
| ┌───────────────────────────────────────────────┐       |
| │  Language                 English           › │       |
| │  Estonian, Finnish coming soon.               │       |
| └───────────────────────────────────────────────┘       |
|                                                         |
| INSTALL                                                 |
| ┌───────────────────────────────────────────────┐       |
| │  Add to home screen                          › │       |
| └───────────────────────────────────────────────┘       |
+---------------------------------------------------------+
```

- Sound + Haptic write to `localStorage["terav.pref.sound"]` and `terav.pref.haptic` (booleans, default `true`). Gate `hapticTap()` in `next-app/src/lib/utils.ts` via a new `useHapticPref()` hook. Sound gating requires a new `useSoundPref()` hook wrapping any `new Audio()` calls (none currently exist — sound is *forward-looking*; ship the toggle now so it's a real feature when timer-complete sounds land).
- Theme + Language rows are **inactive** but visible with a "coming soon" caption. Marketing honesty: users see the roadmap without a broken toggle.
- Install row absorbs `useInstallPrompt` from Profile More (was P2-8).

### Rejected alternatives

- **Sequenced ship (header first, then Today, then Settings)** — rejected. Three IA moments the user has to relearn. Users don't audit changelogs; they open the app and get confused.
- **Keep Programs in top nav "just for the founder"** — rejected. Founder can navigate to `/programs/` directly; every other user pays for the founder's convenience.
- **Settings as a section inside `/account`** — rejected. Preferences (sound/haptic/theme) are session-persistent; account is identity + billing + destructive. Different mental model, different route.
- **Kill the ⌂ home button on DateNav to save space** — rejected. Bug O12 (Home slot shifts) is a genuine layout fix; solved by `invisible pointer-events-none` on today-view (see Week's Batch 18 fix).

## What specialists still own after this brief

- **app-mobile-ux** — verify all block chevrons ≥ 44×44 in the new DashboardBlock component; verify session route back-nav restores scroll position on Today.
- **app-visual-craft** — final type ramp for block eyebrow/title/lede triad (Decision 2 spec below is the input).
- **app-accessibility** — new `/settings/` and `/session/[slug]/` routes need landmark + h1 audit; MorningCheck block state (green/amber/red) needs an `aria-label` beyond the visual dot.
- **app-copy-clarity** — block eyebrow strings ("MORNING CHECK", "TODAY · ANTERIOR HIP REBUILD", "PROPOSAL · AMBER SOFTEN") need a copy pass — verify tense + parallel construction.

**Batch:** 29. **Cost estimate:** 12-16h (L-XL). Biggest scope item in the queue post-Batch-28.

---

# Decision 2 — Consolidated visual system v2 (O7 + O9 + O14 + O15 + O17)

## The call

Introduce ONE new visual primitive — the **DashboardBlock** — and unify five surfaces onto it: Today dashboard blocks, workout blocks inside a session, exercise cards, program-preview info sections, and program catalog category groupings. Ship as **one batch (30) after Decision 1 lands**. No four-way skin patch.

**The primitive:**

```
+-------------------------------------------------+
| EYEBROW · CONTEXT                     [status]  |   <- 10-11px mono uppercase muted
|                                                 |
| Block Title Here                                |   <- 16-18px semibold strong
| One-line lede describing what this is.          |   <- 14px muted
|                                                 |
| [slot content]                                  |   <- optional; varies per surface
|                                                 |
| [ Primary CTA → ]                               |   <- one bronze primary MAX per block
+-------------------------------------------------+
```

**Props shape:**
```ts
type DashboardBlockProps = {
  eyebrow: string;              // "TODAY · ANTERIOR HIP REBUILD"
  eyebrowTone?: "default" | "amber" | "red" | "bronze";  // semantic accent, uses O8 fix
  title: string;                // "Barbell reintro session"
  lede?: string;                // "Zone 1/2 steady-state · 5 exercises"
  status?: ReactNode;           // right-side chip (readiness dot, progress %, etc.)
  children?: ReactNode;         // slot content (proposal verbs, exercise list, retest metrics)
  primaryCta?: { label: string; onClick: () => void; href?: string };
  collapsible?: boolean;        // if true, chevron on right; body/CTA hidden until expand
  defaultExpanded?: boolean;
};
```

**Container:** `rounded border border-line-soft bg-surface px-4 py-4`. Matches existing card idiom (Week rows, Profile programs). Not a new visual language — a **consolidation** of the pattern already used inconsistently across 15+ surfaces.

## The five surfaces

### Surface 1 — Today dashboard blocks (O3b)

Already sketched in Decision 1. Each block is a DashboardBlock with the eyebrow naming the *domain* ("MORNING CHECK", "TODAY · {program}", "EXTRAS", "PROPOSAL"). This is the primary use case — everything else follows the same primitive.

### Surface 2 — Workout blocks inside a session (O15, HWPO reference)

Fetched the HWPO Run reference (per O17). What HWPO does: colored block header ("BLOCK 1: WARM-UP") + collapsible body with drills. Terav can't use photography (R1), but the **block chrome + typographic weight** is directly stealable.

Session view (route: `/session/[slug]`):

```
+---------------------------------------------------------+
| ‹ Today · Anterior hip rebuild                          |
|                                                         |
| Barbell reintro session                                 |   <- 32px H1
| ~48 min · 5 exercises across 3 blocks                   |   <- 14px muted lede
|                                                         |
| ┌─── BLOCK 1 · SCAPULAR PULL LADDER ─────────┐          |
| │ Prime the lats before load.                 │          |   <- DashboardBlock,
| │ 2 exercises · 12 min                        │          |     collapsible: true,
| │                                         [⌵] │          |     defaultExpanded: true
| │   ┌───────────────────────────────────┐    │          |     for the current block,
| │   │ 1. Active hang (scap-engaged)     │    │          |     false for subsequent
| │   │    3 × 20s                        │    │          |     blocks (respects R6 —
| │   └───────────────────────────────────┘    │          |     no auto-expand-all)
| │   ┌───────────────────────────────────┐    │          |
| │   │ 2. Scap pulls (banded)            │    │          |
| │   │    3 × 8                          │    │          |
| │   └───────────────────────────────────┘    │          |
| └─────────────────────────────────────────────┘          |
|                                                         |
| ┌─── BLOCK 2 · SHOULDER + GRIP PREP ────────┐          |
| │ 3 exercises · ~18 min                  [›] │          |   <- collapsed by default,
| └─────────────────────────────────────────────┘          |     tap to expand
|                                                         |
| ┌─── BLOCK 3 · ROW STRENGTH ────────────────┐          |
| │ 2 exercises · ~18 min                  [›] │          |
| └─────────────────────────────────────────────┘          |
+---------------------------------------------------------+
```

The prose intro (currently a `<p>` above the exercise list) becomes the block **lede**. Removes the "prose-first, exercises-second" visual dissonance the founder flagged.

### Surface 3 — Exercise cards (O14)

Each exercise sits inside its block as a **nested surface** — same border-radius, muted background (`bg-surface-2` if we introduce it, or reuse the current `bg-surface`). NOT a DashboardBlock — that would be over-nesting. It's a **row primitive** with:

```
+-----------------------------------------------------+
| Active hang (scap-engaged)                          |   <- 15px semibold, LINE-CLAMP-2
| 3 sets × 20 seconds · scapular retract               |   <- 12px muted, mono for numerics
|                                                     |
| Set 1  [ 20s ] [ done ]                             |   <- log rows unchanged (Batch 24)
| Set 2  [ 20s ] [ done ]                             |
| Set 3  [ 20s ] [ - ]                                |
|                                                     |
| Notes (0)                                        [›]|   <- notes as an EXPLICIT row,
+-----------------------------------------------------+     not a hidden expand
```

**O14a fix (name truncation):** replace `truncate` with `line-clamp-2`. Names wrap to 2 lines max; parenthetical modifier stays visible.

**O14b fix (expand affordance):** the chevron that today "opens notes" is REPLACED with an explicit "Notes (N)" row at the bottom of the card. If notes exist, the row shows the count. Tap opens the notes editor as a sheet (mirror MoveSheet pattern). This kills the "chevron promised expansion, delivered notes" surprise.

**O14c (partial sets):** out of scope for this brief — data-completeness question, not visual. Note in the Section E backlog.

### Surface 4 — Program preview page (O9)

The current preview is 6 sections of prose in a flat visual. Restructure with DashboardBlock and **info hierarchy** — top-two prose sections escalate visually; specs (duration, phases) demote:

```
+---------------------------------------------------------+
| ‹ Programs                                              |
|                                                         |
| First Strict Pull-Up                                    |   <- 32px H1
| Hang → Assisted → First Rep → Volume                    |   <- 14px muted lede (the chain)
| [ REFERENCED ]                                          |   <- status chip (O5a — no more
|                                                         |     PROVISIONAL leak after
|                                                         |     Decision 3)
|                                                         |
| ┌─── WHO THIS IS FOR ────────────────────────┐          |
| │ Adults who can hang for 15+ seconds but... │          |   <- top priority — DashboardBlock
| └─────────────────────────────────────────────┘          |     eyebrow "WHO THIS IS FOR"
|                                                         |
| ┌─── WHAT YOU'LL ACHIEVE ────────────────────┐          |
| │ One clean strict pull-up in 8-10 weeks...  │          |   <- second priority
| └─────────────────────────────────────────────┘          |
|                                                         |
| ┌─── COMMITMENT ─────────────────────────────┐          |
| │ 8-10 weeks · 3 sessions/week · 20-30 min   │          |   <- specs demoted to a
| │ Requires: pull-up bar, resistance band     │          |     compact row
| └─────────────────────────────────────────────┘          |
|                                                         |
| ┌─── ADAPTS TO YOU ──────────────────────────┐          |
| │ Rep counts scale to your weekly log...     │          |   <- keep the bronze accent
| │ [ bronze accent border ]                    │          |     ONLY here (adaptive is
| └─────────────────────────────────────────────┘          |     the differentiator)
|                                                         |
| ┌─── HOW WE PROVE IT WORKS ──────────────────┐          |
| │ Retest windows at week 4 and week 8.       │          |   <- was "Retest"; renamed
| │ Baselines: dead hang time, band-assist rep │          |     to a benefit not a mechanic
| └─────────────────────────────────────────────┘          |
|                                                         |
| ┌─── PROGRAM SHAPE ──────────────────────  [›]          |   <- collapsible; peek-inside
| │ (collapsed by default)                      │          |     stays but demoted
| └─────────────────────────────────────────────┘          |
|                                                         |
| [ Make this my focus → ]                                |   <- primary CTA, 14px semibold
|                                                         |     (P1-63 sentence-case)
+---------------------------------------------------------+
```

**Info hierarchy call:** the six sections reorder from (title/desc → chain → adapts → duration → who → what → retest → baseline → CTA → shape) to (title/chain → who → what → commitment → adapts → proves-it-works → shape → CTA). First-time visitor answers "is it for me?" → "what do I get?" → "what does it cost me?" → "why should I trust it?" in that order.

### Surface 5 — Programs catalog (O7)

**REJECT the GOWOD category-tile pattern for now.** Rationale: 5 public programs is too few. Category tiles need N ≥ 2-3 programs per category to earn their pixels; Terav has 1-2 per category. Tiles with a single program inside read as "empty room."

Instead, apply the **DashboardBlock treatment to each category header** — the section becomes a mini-block with title + count + programs listed as flat rows underneath. Cleaner than the current flat h2/p treatment, no wasted-taps problem.

```
+---------------------------------------------------------+
| Pick your focus.                                        |
| Each program is one focus arc...                        |
| REFERENCED = ... REVIEWED = ... VERIFIED = ...          |   <- legend (Decision 3 updates)
|                                                         |
| [ All ] [ Strength ] [ Endurance ] [ Skill ] [ Rehab ]  |
| Sort: [ Curated ▾ ]                                     |
|                                                         |
| ┌─── STRENGTH · 2 programs ──────────────────┐          |
| │ Barbell arcs with confirm-first progression.│          |
| ├─────────────────────────────────────────────┤          |
| │  ● 5/3/1 anterior-hip                    › │          |
| │    12 weeks · intermediate · REFERENCED     │          |
| ├─────────────────────────────────────────────┤          |
| │  ● Rowing 2K test prep                   › │          |
| │    8 weeks · intermediate · REFERENCED      │          |
| └─────────────────────────────────────────────┘          |
|                                                         |
| ┌─── ENDURANCE · 1 program ──────────────────┐          |
| │ Aerobic engine — Norwegian 4×4, Z2 base.    │          |
| ├─────────────────────────────────────────────┤          |
| │  ● Engine Builder Block 1                › │          |
| │    8 weeks · beginner · REFERENCED          │          |
| └─────────────────────────────────────────────┘          |
| ...                                                     |
+---------------------------------------------------------+
```

Category card = one DashboardBlock. Programs inside = flat rows (same as today's `ProgramCard`) but WITHOUT the individual card border — the category block owns the container. Solves both **O7 (density)** and **O8 (color collision)** simultaneously: category color moves to the block's left-edge stripe (single semantic use) and program status chips become neutral outlined pills (see O8 fix option 2 from the raw observation).

**Revisit at N ≥ 10 programs** — then GOWOD-style tiles earn their pixels.

## Modern-standard checks

- iOS HIG: block chrome respects safe-area padding on the main container; nothing sticky.
- Material 3: state layers on block hover/press (`bg-surface hover:bg-surface-hover`).
- Refactoring UI: **accent economy locked**. One bronze accent per block (either the primary CTA border OR a bronze eyebrow — never both). Status chips go neutral (outline + text-only).
- `prefers-reduced-motion`: block expand is `max-height` + opacity; reduced-motion path renders instant.
- Fitts's law: chevron ≥ 44×44; primary CTA min-h 44.

## File-level implementation notes (Decision 2)

- New: `next-app/src/components/DashboardBlock.tsx` — the primitive. Props shape above. ~120 lines.
- `next-app/src/app/page.tsx` — restructure Today around DashboardBlock (already scoped in Decision 1).
- New: `next-app/src/app/session/[slug]/page.tsx` — new route hosting the workout block treatment. Extract from current Today inline.
- `next-app/src/components/workout/ExerciseCard.tsx` — replace `truncate` with `line-clamp-2` on the exercise-name span; replace the chevron-opens-notes with an explicit "Notes (N)" row at the bottom.
- `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx:1-707` — restructure sections around DashboardBlock; reorder per hierarchy call above.
- `next-app/src/app/programs/page.tsx:180-214` — wrap each category section in a DashboardBlock; drop the per-program card border (borrowed by the block); apply O8 color fix (neutral status chips + category color as block left-edge stripe).
- Token: consider adding `--color-surface-2` (`#1c1e23` or similar) for nested surfaces (exercise cards inside blocks). One new token, well-justified.

## What specialists still own after this brief

- **app-visual-craft** — final type ramp for the eyebrow/title/lede triad (10-11px mono / 16-18px semibold / 14px muted). Verify against WCAG 1.4.3 on all four palette contexts (surface, surface-2, ground, bronze accent). Also compute the exact `bronze/8` tint for the "adaptive" block accent so it reads as bronze but doesn't compete with primary CTA bronze fill.
- **app-mobile-ux** — verify block chevron hit area ≥ 44×44 in nested contexts (block inside category block); verify session route back-nav restores scroll on Today; ergonomics of the exercise-card "Notes (N)" row placement.
- **app-accessibility** — verify DashboardBlock's `aria-expanded` + `aria-controls` pattern for collapsible variants; verify heading semantics (block title = `<h2>` or `<h3>` depending on nesting depth).
- **app-copy-clarity** — the 5 new block-eyebrow strings on program preview ("WHO THIS IS FOR", "WHAT YOU'LL ACHIEVE", "COMMITMENT", "ADAPTS TO YOU", "HOW WE PROVE IT WORKS", "PROGRAM SHAPE"). Verify parallel construction; refine "HOW WE PROVE IT WORKS" — might read as marketing; alternatives: "HOW IT EARNS YOUR TRUST", "RETEST WINDOWS", or keep original "RETEST".

## Rejected alternatives

- **GOWOD category tiles** — rejected. N < 10 programs. Revisit trigger set.
- **Photography anywhere** — R1, stays rejected. HWPO uses hero photos; we do not.
- **Second primary accent (e.g. teal for endurance category)** — R2, stays rejected. Category color is a *token accent*, not a primary CTA color.
- **Skinning four surfaces individually across four batches** — rejected explicitly by founder's "no ad-hoc UI churn" rule.

**Batch:** 30 (post-Decision-1). **Cost estimate:** 14-18h (L). Creates one component, refactors five surfaces, adds one route.

---

# Decision 3 — Programs readiness ladder (O5a + O5b)

## The call

Two-part fix:

### Part A — Stop the PROVISIONAL leak (O5a)

Rename PROVISIONAL → **DRAFT** internally (schema field: `status: "DRAFT"`) and **hide DRAFT programs from the public catalog** exactly like `personal: true` programs. Founder toggles a `?draft=1` query param to see them for authoring/review. Match `manifest.programs.filter((p) => p.status !== "DRAFT" && !p.personal)` pattern.

**Why not "add PROVISIONAL to the legend"** (option 2 from the raw observation): committing PROVISIONAL to the public copy locks it in as a permanent tier. It's authoring machinery, not a user-facing state. Hide it.

**Why not "promote all three to REFERENCED"** (option 1): premature. `first-strict-pullup`, `muscle-up`, `engine-builder-block-2` aren't harness-verified yet. Promoting them to public visibility without the harness pass violates the REFERENCED contract ("every claim cites a paper, simulator harness passes").

### Part B — Real REVIEWED + VERIFIED processes (O5b)

Add a `reviewed_by` schema field to each program manifest entry:

```ts
// next-app/src/lib/schemas.ts — extend ProgramManifestEntry
type ProgramManifestEntry = {
  // ... existing (slug, name, category, personal, status, etc.)

  /**
   * O5b (Batch 31) — REVIEWED tier gate. Populated when a named
   * domain specialist has audited the citations against the current
   * literature. Presence of a non-empty reviewer list + valid dates
   * is REQUIRED for status to be "REVIEWED".
   */
  reviewed_by?: Array<{
    reviewer_name: string;        // "Dr. K. Tammiste, MD" — pseudonymous or fictitious allowed pre-launch
    reviewer_role: string;        // "Orthopaedist" | "Physiotherapist" | "Sports scientist"
    reviewed_at: string;          // ISO date "2026-08-19"
    scope: string;                // "Clinical positions + progression rules" — free-form
    disclosures?: string;         // optional COI note
  }>;

  /**
   * O5b (Batch 31) — VERIFIED tier gate. Populated by the beta-completion
   * counter. When >= 5, status auto-promotes REFERENCED → VERIFIED at
   * build time OR runtime.
   */
  beta_completions?: number;
};
```

**Promotion process:**

1. **DRAFT → REFERENCED** (author-driven): all citations resolve; harness passes across archetypes. Manual flip.
2. **REFERENCED → REVIEWED** (specialist-driven): one entry in `reviewed_by`. Recommendation: **anterior-hip-rebuild goes first** since Margus has real specialists on record.
3. **REFERENCED → VERIFIED** (data-driven): `beta_completions >= 5` with subjective-success >= 3/5. Matches R11's N>1000 pattern at a lower threshold (this is per-program, not cross-user aggregation, so 5 is honest).

**The honesty question:** if REVIEWED is unreachable for engine/skill/mobility programs in beta (no specialists on file), does the three-tier ladder oversell? **Recommendation: keep the three-tier ladder for now**, but add REVIEWED-status programs a **specialist attribution row** on the program preview page:

```
+---------------------------------------------------------+
| Anterior Hip Rebuild                                    |
| [ REVIEWED ]                                            |
| Reviewed by Dr. K. Tammiste, MD — Orthopaedist — 2026-08-19 |
| Scope: clinical positions + progression rules            |
+---------------------------------------------------------+
```

Turns REVIEWED from a chip into a **transparent attribution**. If a program can't earn that row, it stays REFERENCED — no shame, no oversell.

### Fallback if founder rejects the specialist-attribution path

Drop REVIEWED entirely from the legend. Ship a **two-tier public ladder** (REFERENCED → VERIFIED) with a fourth "specialist-attributed" pill that renders **only** when `reviewed_by` is populated. The pill is not a status; it's a marker. This is the cleaner-if-more-radical option — recommend it if founder decides beta scale can't credibly produce specialist reviews across categories.

## Legend copy update

Current (`programs/page.tsx:127-129`):
> REFERENCED = every claim cites a paper, simulator harness passes.
> REVIEWED = domain specialist has audited the citations against literature.
> VERIFIED = ≥5 users completed the arc with subjective success.

Proposed:
> **REFERENCED** = every claim cites a paper. Simulator harness passes across our test archetypes.
> **REVIEWED** = a named specialist audited the citations. Their name and scope appear on the program page.
> **VERIFIED** = ≥5 beta users completed the arc with 3+/5 subjective success.

Adds specificity to REVIEWED (name + scope visible) and VERIFIED (score threshold explicit) — matches the confirm-first, cite-the-paper voice.

## File-level implementation notes (Decision 3)

- `next-app/public/data/programs/manifest.json` — for each PROVISIONAL entry, change `status: "PROVISIONAL"` → `status: "DRAFT"`. Optional: for anterior-hip-rebuild, add a `reviewed_by` entry with Margus's specialist attribution (founder decision — do we have permission to name them?).
- `next-app/src/app/programs/page.tsx:104-105` — extend the filter: `manifest.programs.filter((p) => p.status !== "DRAFT" && !p.personal)`.
- `next-app/src/app/programs/page.tsx:127-129` — update legend copy per above.
- `next-app/src/app/programs/page.tsx:228-260` — REMOVE the `PROVISIONAL` map entry (no longer a public state). Keep REFERENCED/REVIEWED/VERIFIED and `stable` legacy alias.
- `next-app/src/lib/schemas.ts` — extend `ProgramManifestEntry` with `reviewed_by` + `beta_completions`.
- `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx` — render the specialist-attribution row when `reviewed_by` is populated.
- Runtime VERIFIED promotion: engine-side, `computeProgramStatus(manifestEntry, betaCompletionsFromKV)` returns the effective status. Cost: small.

## Cross-persona coherence

| Persona | Sees | Holds? |
|---------|------|--------|
| First-time catalog visitor | 5 REFERENCED programs (anterior-hip may show REVIEWED with attribution row). No PROVISIONAL noise. | Yes — honest, no debug leak. |
| Founder in super-admin | Toggles `?draft=1`, sees the three DRAFT programs. | Yes — authoring channel preserved. |
| Persona-recover (anterior-hip user) | Sees "Reviewed by Dr. X — 2026-08-19 — Clinical positions". | Yes — trust anchor is visible where it matters. |

## Rejected alternatives

- **Keep PROVISIONAL as a public state with legend entry** — rejected. Cements authoring machinery as user-facing. Every future audit will re-litigate.
- **Delete DRAFT programs from the manifest entirely** — rejected. Founder is actively authoring them; delete breaks the authoring workflow.
- **Auto-promote all PROVISIONAL → REFERENCED with a note** — rejected. Violates the REFERENCED contract (harness must pass).

## What specialists still own

- **app-copy-clarity** — verify legend copy + attribution row copy against the strings budget.
- **app-visual-craft** — status chip neutralization (per O8 fix option 2 in the raw observation) should ship in this batch too; the "specialist reviewed" pill needs its own visual treatment (recommendation: outlined bronze pill, not filled).

**Batch:** 31. **Cost estimate:** 4-6h (S-M). Schema addition + filter change + copy + one attribution component.

---

# Decision 4 — The tier-recommendation bug (O10c)

## The call

**It IS a bug AND the placement page's "How this was picked" disclosure is silent about signal-completeness.** Ship both flavors of copy so engineering picks based on root-cause investigation:

### Root-cause investigation prompt (for engineering)

Grep target: `next-app/src/app/programs/first-strict-pullup/intake/IntakeClient.tsx` + `next-app/public/data/programs/first-strict-pullup.json` (intake block). Two questions to answer:

1. Does the intake question "How many strict pull-ups can you do today?" (or similar) have `answers[].tier_hint: "A" | "B" | "C" | "D"` fields wired?
2. Does the placement logic READ those `tier_hint` fields when physical-test signals are absent, or does it fall through to `default_tier: "A"`?

If (1) is yes and (2) is no → **real bug**, ship the engine fix.
If (1) is no → the intake answer has no tier signal weight; ship the intake schema fix + placement fix together.

### Design call on the safe fallback

Regardless of root-cause: **the safety-first fallback should be Tier B, not Tier A**, and the placement page must EXPLAIN which signal was used. Tier A ("No hang yet") is a manifestly wrong default for a user who can articulate "I do 3-5 strict reps" — even conservatively-adjusted, "3-5 strict reps" bounds out Tier A on any reasonable reading. Tier B ("hang established, no strict rep yet") is closer AND asks the user to correct upward, which is honest.

### Copy — Flavor A (safety-first fallback is by design)

Ships if engineering confirms the placement is intentional conservatism:

> **How we picked this tier**
>
> You told us you can do 3-5 strict pull-ups today — that's Tier C territory. But you skipped the hang test and the assisted-rep test, so we don't have an independent verification. We started you at **Tier B** to leave room for the tests when you're ready.
>
> If you're at 3-5 strict reps today, tap **Tier C** below — you know your body better than a form does.

### Copy — Flavor B (it was a bug, now fixed)

Ships if engineering confirms the placement logic didn't read the intake answer:

> **How we picked this tier**
>
> You told us you can do 3-5 strict pull-ups today. That places you at **Tier C — one strict rep, building the second → 3-5 strict pull-ups unbroken by week 8.**
>
> If you'd rather start from further back to nail the mechanics, tap **Tier B** below. If you're already past 5 strict reps and want the volume tier, tap **Tier D**.

Both flavors:
- Name the intake signal used ("You told us…").
- Name the tier picked and *why*.
- Offer the user an explicit override ("tap Tier X below") — confirm-first, user in control.
- Do NOT hide the reasoning; the current "Recommended" pill is opaque.

## Design call — the placement page structure

Regardless of copy branch, restructure the placement page section that currently reads "Recommended" into:

```
+---------------------------------------------------------+
| Choose your starting tier                               |
|                                                         |
| ┌─── HOW WE PICKED THIS ─────────────────────┐          |
| │ You said 3-5 strict reps today.            │          |
| │ You skipped hang + assist tests.            │          |
| │ Started at Tier B; tap Tier C if you're    │          |
| │ already there.                              │          |
| └─────────────────────────────────────────────┘          |
|                                                         |
| ○ Tier A — No hang yet                                  |
| ○ Tier B — Hang established, no strict rep    ← default |
| ○ Tier C — One strict rep, building the second          |
| ○ Tier D — Multiple reps, adding volume                 |
|                                                         |
| [ Start with Tier B → ]                                 |
+---------------------------------------------------------+
```

Explain-back is a DashboardBlock (Decision 2) — one primitive, five surfaces, this is the sixth. Radios below; primary CTA reflects the user's final selection (not the default).

## File-level implementation notes (Decision 4)

- `next-app/src/app/programs/first-strict-pullup/intake/IntakeClient.tsx` (or wherever the placement page renders — grep for "Recommended" + "Tier A") — insert the explain-back block above the tier radios.
- `next-app/public/data/programs/first-strict-pullup.json` — verify the intake question for strict-rep count has answer-level `tier_hint` fields. If missing, add them: `{ "value": "3-5", "tier_hint": "C" }`.
- Engine placement logic — grep the codebase for `recommend`, `tier`, `physical_tests`, `default_tier`. Wire the fallback: `if !physicalTestsCompleted && intakeAnswer.tier_hint) → intakeAnswer.tier_hint`.
- Default `default_tier` from "A" to "B" as a safety net if intake_hint is also missing.

## Rejected alternatives

- **Silent fix (no explain-back)** — rejected. Users who got Tier A once will not trust the placement again without transparency.
- **Recompute placement on the fly when the user overrides** — rejected. Placement is a one-shot commit; overriding writes the user's choice. Don't second-guess after the user picks.
- **Add a "why did I get Tier A?" disclosure that's collapsed by default** — rejected. Placement transparency should be default-visible; it's not an edge case, it's the primary trust anchor.

## Cross-persona coherence

| Persona | Sees | Holds? |
|---------|------|--------|
| Skipped physical tests + answered 3-5 reps | Tier B default + explain-back naming "you skipped tests" | Yes — honest, easy override to Tier C |
| Skipped intake + did all physical tests | Tier from physical-test score; explain-back names test scores | Yes — same pattern |
| Answered intake AND did physical tests | Tier from combined signal; explain-back names both | Yes — richest signal, most confident placement |
| Skipped everything | Tier B default; explain-back says "we didn't get enough signal — pick where you are" | Yes — degrades gracefully |

## What specialists still own

- **Engineering (not a specialist audit — the actual owner)** — root-cause the tier-picker logic; wire `tier_hint` fields; change `default_tier` to B.
- **app-copy-clarity** — pick between Flavor A and Flavor B copy once engineering confirms root-cause; refine wording.
- **app-accessibility** — the explain-back block is a `<section aria-labelledby>` above the tier radios; verify SR order (explain-back read first, radios read second).
- **app-visual-craft** — the "recommended" label above one radio should visually anchor without shouting; recommend a small bronze dot next to the label, not a filled pill.

**Batch:** 32 (can ship alongside 31 if scoped tight — both are program-page-only). **Cost estimate:** 3-5h (S). Engine touch is small; UI is a copy + block wrap.

---

# Cross-decision coherence

The four decisions touch three shared components:

1. **DashboardBlock** primitive (Decision 2) is the substrate for Decisions 1, 3, 4. Ships in Batch 30 but design it once, use it four times.
2. **Status chip neutralization** (O8 fix) referenced in Decisions 2 and 3. Ship in Batch 30 as part of the visual system update; Decision 3 relies on it.
3. **Explain-back copy pattern** (Decision 4) generalizes — it's the same "here's why" pattern the retest hand-off (F5) and Extend +N weeks affordance already touch. Consider extracting an `<ExplainBack>` component that wraps the block chrome with a "why this?" prefix; adds ~10 min per surface.

## Batching order

| Batch | Contents | Cost | Depends on |
|-------|----------|------|------------|
| **29** | Decision 1 — Header collapse + Today dashboard skeleton + Settings v1 + Events delete + Evidence/Report/Extras → Profile More. Bug O12 (DateNav Home slot) fixed inline. Bug O13 (readiness-dot double-signal) closed by dashboard model. | 12-16h | none — ships first |
| **30** | Decision 2 — DashboardBlock primitive + session route + exercise-card fixes (O14a, O14b) + program-preview restructure + catalog category-block treatment + O8 status-chip neutralization. | 14-18h | Batch 29 |
| **31** | Decision 3 — DRAFT hide + `reviewed_by` schema + attribution row + legend copy. | 4-6h | Batch 30 (uses DashboardBlock) |
| **32** | Decision 4 — Tier bug fix + explain-back block + copy per root-cause. | 3-5h | Batch 30 (uses DashboardBlock) |

Batches 31 + 32 can ship as a single batch (7-11h) since both are program-page-only and don't touch each other's surfaces. Founder call.

**Not covered by these four decisions:**
- O1 (TERAV wordmark bronze-vs-white cross-surface consistency) — small visual-craft item, ship inline with Batch 29.
- O6 (native `<select>` sort control) — visual-craft item; ship inline with Batch 30 (catalog restructure) as a custom sheet component.
- O11 (H1 tab-name redundancy + tab-switch jump) — H1 layer resolution once Today becomes a dashboard (Decision 1) reframes this; revisit in a followup after Batch 29.
- O16 (height/weight/sex fields) — deferred per the raw observation; no engine use case.
- O17 peer research already folded into Decisions 1 + 2.

---

# What specialists still need to do AFTER these four decisions land

Each decision names the specialist scope. Consolidated view for the follow-up audit orchestrator:

**app-mobile-ux** (after Batch 29 + 30):
- Verify block chevron hit areas ≥ 44×44 in nested contexts.
- Verify `/session/[slug]` back-nav restores scroll on Today dashboard.
- Verify Settings v1 toggle tap targets and thumb-zone placement.
- Ergonomics of the exercise-card "Notes (N)" row placement.

**app-visual-craft** (after Batch 30):
- Final type ramp for DashboardBlock eyebrow/title/lede triad.
- Compute `--color-surface-2` token if introduced; verify contrast on all four palette contexts.
- Category color as block left-edge stripe — verify against R2 (single primary accent).
- Bronze `/8` tint for the "adaptive" block accent — must read as bronze without competing with primary CTA fill.
- "Specialist reviewed" outlined bronze pill treatment.
- Native `<select>` → custom sheet for programs sort (O6).

**app-accessibility** (after Batch 29 + 30 + 31):
- `/settings/`, `/session/[slug]/`, updated `/programs/[slug]/` — landmark + h1 audit.
- MorningCheck block state (green/amber/red) `aria-label`.
- DashboardBlock's `aria-expanded` + `aria-controls` collapsible variant.
- Heading semantics inside nested blocks (h2 or h3 by depth).
- Placement-page explain-back block SR reading order.

**app-copy-clarity** (after Batch 29 + 30 + 31 + 32):
- Block eyebrow strings across Today dashboard (7-10 strings).
- Block eyebrow strings on program preview (5-6 strings).
- Settings v1 row captions ("coming soon" language).
- Updated legend copy for readiness ladder.
- Specialist attribution row copy.
- Placement-page explain-back — pick Flavor A vs Flavor B based on root-cause; refine.

**landing-conversion-strategist** — not touched by these four decisions; O1 wordmark consistency is a landing↔app coherence check, worth a small note in the followup.

**app-motion-perf** — new surfaces (dashboard blocks, session route) need entry-choreography audit; verify `prefers-reduced-motion` paths on the new collapse/expand animations.

---

# What these decisions do NOT solve

- **Progress tab restructure** — deferred. Progress is a heavy visualization surface; DashboardBlock isn't obviously the right primitive there. Separate brief.
- **History tab structure** — untouched. Current calendar heatmap + row-log pattern stands.
- **Multi-language i18n extraction** — Settings row is a placeholder; the actual extraction is a multi-day pass. Separate brief when a second language is on-deck.
- **Light-theme palette authoring** — Settings row is a placeholder; theme toggle without a light palette is worse than no toggle. Separate multi-day brief.
- **Sound design** — Settings row wires a preference; no actual audio ships this batch. When timer-complete + accept-confirm sounds are authored, the toggle already works.
- **Onboarding wizard polish (O10a full-width buttons + O10b progress-bar hero)** — deferred to a wizard-focused brief. Not blocking these four decisions.
- **/report mobile layout follow-up** — closed as P0-6 Batch 26, no further design work needed unless a fresh audit surfaces regressions.

---

# Estimated implementation cost (all four decisions)

**33-45h** total across four batches (or three if 31+32 combine). Highest-confidence items are Decisions 3 and 4 (small, well-scoped). Highest-risk item is Decision 1 (dashboard rewrite + new session route = biggest interaction-surface unknown since Batch 24's MoveSheet).

**Recommend the founder ship Batch 29 first, run the persona harness against it, then commit to Batch 30 with harness feedback in hand.** Respects the "no UI churn between audits" rule and gives the biggest interaction change (Today dashboard) its own audit cycle.
