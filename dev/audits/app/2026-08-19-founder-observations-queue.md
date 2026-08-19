# Founder observations queue — 2026-08-19

Founder-in-the-app notes captured live. **These are raw inputs, not tasks.**
Once the queue is populated, audit agents assess each item to decide:
- Real finding → new master-task-list ID (bug / P0 / P1 / P2)
- Already covered → close with ref to shipped batch
- Rejected on Terav constraints → adds to Section G with rationale
- Needs design brief → dispatch product-design-lead

Deploy under review: https://b4056901.program-v2.pages.dev (Batch 28,
app.terav.fit alias). Fresh persona artifacts at 15:02-15:12 mtime.

## Protocol

Each observation is an item with a fresh ID `O1`, `O2`, ... The founder
writes the raw observation; the assessing agents attach:
- **Verdict:** real / already-shipped / misreading / rejected / needs-brief
- **New master-list ID** if verdict = real
- **Ref** if verdict = already-shipped
- **Rationale** if verdict = rejected

Nothing in this file gets code-changed directly. Everything flows through
the master task list once assessed.

---

## Observations

### O1 — TERAV wordmark: bronze in app, white on landing; bullet on landing but not in app

Founder-in-app 2026-08-19. TERAV wordmark treatment differs between the
two surfaces:
- **App top nav** — bronze color, no bullet/dot next to the mark
- **Landing header** — white, with a circle/bullet accent next to the mark

Founder read: reads as two different brands. Feels inconsistent.

**Question:** is this intentional? If yes, why? If not, which surface
is the reference — landing (bronze the wrong choice) or app (bullet
the wrong choice)?

**Files to check when assessing:**
- App: `next-app/src/components/AppShell.tsx:~124-127` (TERAV Link + ReadinessDot)
- Landing: `landing/src/components/` wordmark render

**Assessment:** _pending audit-agent pass_

### O3 — Today should be a Garmin-style dashboard; Morning-check + Events restructure

Founder-in-app 2026-08-19. Substantial IA proposal — three connected
sub-parts:

#### O3a — Morning check off the top-nav strip, into a Today "block"

The Morning-check stethoscope icon in the header runs a full daily
action from a single icon slot. Founder read: it's a daily-frequency
task, but it deserves a *content* home, not a *chrome* home. Move it
into Today as a block/section.

#### O3b — Today becomes a dashboard (Garmin Connect model)

Restructure Today from "expanded session view" → "dashboard of
blocks/summaries":
- **Morning check block** — status + tap to log
- **Extras block** — surface today's optional accessories/rehab
- **Workout block** — one per active plan (multi-track shows N blocks)
- Each block is compact: what it is + primary metric + CTA. Tap to
  expand into the actual detail view.
- The current model — full session content expanded on Today — moves
  behind a tap.

Peer reference: Garmin Connect home dashboard cards (single-metric +
label + one-tap into detail). Founder cited this pattern 2026-08-17
in the concurrent-tracks brief too.

Cross-references to weigh:
- **R6 (rejected)** — "Filling Coach empty-state fold — absence is
  honest." Not directly overturning this, but Today-dashboard changes
  the mental model of what "empty" looks like.
- **R9 (rejected)** — "Pliability one-arc-per-day." Multi-track blocks
  ARE the anti-Pliability move; the dashboard model REINFORCES this.
- **P1-63 (Batch 27)** — button labels migrated 11 px mono-caps →
  14 px sentence-case. A dashboard model may need a third text
  register (block-heading semibold 15-16 px?) — visual-craft would
  need to weigh in.
- **F6 (shipped)** — Week already restructured to collapse-by-default
  with 3-verb expanded action row. Today dashboard would mirror the
  same pattern — consistency win.

This is a **product-design-lead brief** the moment it's accepted.
Won't ship as a one-shot batch; needs a real design pass.

#### O3c — Events: hide for now

Events (`/events`) is already gated `superAdminOnly: true` in
`HeaderQuickLinks.tsx:22` — free users don't see the ⋮ entry. Route
still exists but shows "Not available. Events are in private beta"
for non-admins. Founder read: given how thin the feature is, consider
either hiding fully (remove from HeaderQuickLinks LINKS array
entirely, delete the /events route) OR promoting to real feature.
Middle ground of "gated placeholder" leaks intent.

**Files to check when assessing:**
- App shell: `next-app/src/components/AppShell.tsx:127-146`
  (top-nav icons — Programs, Stethoscope, ⋮)
- Today: `next-app/src/app/page.tsx` (currently ~1200 lines; needs
  full restructure for O3b — biggest scope item in this queue)
- Extras: `next-app/src/app/extras/page.tsx`
- MoveSheet + Week: `next-app/src/app/week/page.tsx` (F6 pattern
  reference for dashboard consistency)
- Events: `next-app/src/app/events/page.tsx`,
  `next-app/src/components/nav/HeaderQuickLinks.tsx:22`

**Assessment questions for the audit agents:**
- Does the dashboard model justify the scope (Today rewrite is ~L-XL)?
- Peer count for dashboard-vs-detail-page at Today root:
  Pliability, GOWOD, Runna, Whoop, Hevy — which do which?
- What does the multi-track dashboard look like when 3 programs are
  active? Density stress-test.
- What happens to today's SignalsStrip, ProposalStack,
  RetestReminder, GraduationCard in the dashboard model? Do they
  become dashboard blocks or stay overlays?
- Is Events worth keeping as a super-admin surface OR does it need
  a founder decision to kill/promote?

**Assessment:** _pending audit-agent pass — product-design-lead brief
recommended for O3b_

### O4 — Kill top-nav icon strip, add Settings; move Evidence into Profile

Founder-in-app 2026-08-19. Direct continuation of O2 + O3a — takes
the header trim to its logical conclusion: **no icon strip at all**,
just Settings.

#### O4a — Move Evidence link into Profile

Guide already lives on Profile ("More" section). Evidence should live
next to it — same "reference / how it works" family. Removes one of
the ⋮ menu entries.

#### O4b — Kill the whole ⋮ menu + all top-nav icons; add Settings

Combined with O2 (Programs off), O3a (Stethoscope off), O3c (Events
hidden), and O4a (Evidence into Profile), the ⋮ overflow menu is
almost empty. Header becomes:
- Left: **TERAV** wordmark
- Right: **Settings** icon (⚙︎ or lucide `Settings`)
- Middle: nothing

Extras, Report, Guide, Evidence — all reachable from Profile "More"
section (Guide is already there; add the other three).

#### O4c — Settings surface — what belongs there?

Founder-brainstormed candidates:
- **Sound on/off** — timer complete sound, Accept/confirm sound
- **Sound choice** — which sounds (whoosh, chime, etc.)
- **Vibration on/off** — currently `hapticTap` fires unconditionally
- **Theme** — light + dark (currently dark-only; palette work required)
- **Language** — future (currently en-only)

Founder note: **needs research on what personalization other apps
offer** before scoping — don't just build "settings" as a dumping
ground.

#### Peer research questions (for audit agents)

- Pliability, GOWOD, Runna, Whoop, Hevy — what does each offer under
  Settings? Screenshot the settings pages if reachable via peer's
  marketing site or App Store shots.
- Which peers have sound? Vibration toggles? Theme?
- Which peers have Settings as a top-level route (like proposed here)
  vs. buried inside Profile?

#### Considerations to weigh

- **P2-8 (shipped)** — `useInstallPrompt` hook + "Add to home screen"
  row in Profile More. Settings could re-home this too, OR keep it
  in Profile More.
- **Motion + haptic gating** — `prefers-reduced-motion` already
  handled globally (`globals.css:161-167`). Sound-off would be
  additive; would need a `useSoundPref` hook and a `usePrefersSound`
  gate around any new `new Audio()` calls.
- **Theme** — the whole app is authored dark-first with token
  discipline (`--color-*` in `@theme` block). Light theme is a
  multi-day palette-authoring pass, not a toggle-and-done change.
  Probably strategic-scope, not tactical-scope.
- **Language** — every user-facing string would need i18n extraction.
  Landing already has an i18n dictionaries dir; app doesn't. Not
  small.
- **R4 (rejected)** — "Softer mono-caps everywhere." Doesn't touch
  Settings directly but Settings uses row-labels which are
  currently 11 px mono-caps.

#### The bigger picture — O2 + O3 + O4 together

Header IA collapses to: TERAV / (nothing) / Settings.

Bottom-nav 5 tabs stay: Today / Week / Progress / History / Profile.
Everything else moves to Profile → More.

This is Batch-27-scope-worth of pure IA restructure. **Needs
product-design-lead brief** for consistency with O3b (Today
dashboard). Won't ship as ad-hoc edits.

**Files to check when assessing:**
- `next-app/src/components/AppShell.tsx:127-146` (top-nav icon strip)
- `next-app/src/components/nav/HeaderQuickLinks.tsx` (⋮ menu — likely
  dies entirely under O4b)
- `next-app/src/app/profile/page.tsx:~275` ("More" nav section — Guide
  row → add Evidence + Extras + Report)
- New route: `next-app/src/app/settings/page.tsx` (would need to be
  created)
- `next-app/src/lib/utils.ts` (has `hapticTap` — where sound-gating
  would live)
- `next-app/src/app/globals.css` `@theme` block (theme-toggle scope)

**Assessment:** _pending audit-agent pass — product-design-lead brief
recommended, ideally bundled with O3b so header + Today restructure
ship coherently_

### O5 — Programs catalog: PROVISIONAL chip fires but not in legend; and how do we earn REVIEWED?

Founder-in-app 2026-08-19 on `/programs`. Two connected issues.

#### O5a — PROVISIONAL leaks past the legend

Legend at `programs/page.tsx:127-129` documents three states:
`referenced` (amber), `reviewed` (slate), `verified` (green).

But the manifest currently ships **three programs with `PROVISIONAL`**
status: `engine-builder-block-2`, `first-strict-pullup`, `muscle-up`.
Chip renders "provisional" (see `page.tsx:230-234`) but the user has
no legend entry to interpret it. Reads as debug-leaked state.

Fix options (for the audit-agent pass to weigh):
1. **Promote all three programs to REFERENCED** — verify their
   citation coverage and simulator-harness passes; flip status. Cost:
   authored-effort review per program.
2. **Add PROVISIONAL to the legend** — treat it as the fourth
   published state ("early draft, evidence being gathered"). Cost:
   copy-only change; but PROVISIONAL is a legacy migration alias per
   the comment at `page.tsx:225` — adding it back to public copy
   locks it in as forever-legit rather than migrated-out.
3. **Hide PROVISIONAL programs from the catalog** — match the
   existing `personal:true` filter. Users only see REFERENCED+.
   Cost: three programs disappear until promoted.

Founder implicitly prefers (1) — "how do we get plans to reviewed".
But (1) presumes REVIEWED is possible; see O5b.

#### O5b — How does a program earn REVIEWED (or VERIFIED)?

Legend defines the three states:
- **REFERENCED**: every claim cites a paper, harness passes
- **REVIEWED**: domain specialist has audited the citations against
  literature
- **VERIFIED**: ≥5 users completed the arc with subjective success

But the app has no *process* for either promotion. Zero programs are
REVIEWED. Zero are VERIFIED. Founder wants at least one program to
hit REVIEWED — asks what that takes.

Assessment questions for the audit-agent pass:
- Do we have an internal domain-specialist review pipeline? (Founder
  has orthopaedist + physiatrist per user memory — could they be the
  reviewers for the hip program? What about engine / strength /
  skill / rowing programs?)
- Do we track "reviewed by whom, on what date, against which
  references"? No schema field for it currently — needs one, or a
  separate doc.
- If REVIEWED is not going to happen at beta scale, is the three-tier
  ladder honest, or does it oversell?
- VERIFIED trigger — ≥5 users. Blocked on user count. Same class of
  strategic gate as **S4** (correlation view) and **R11** (cross-user
  aggregation). Consider making the trigger explicit ("VERIFIED
  unlocks at user #5 completing arc X").

#### Files to check when assessing

- `next-app/src/app/programs/page.tsx:127-129` (legend copy)
- `next-app/src/app/programs/page.tsx:223-260` (status chip map,
  PROVISIONAL alias)
- `next-app/public/data/programs/manifest.json` (per-entry status)
- `next-app/public/data/programs/*.json` — individual program status
  fields (currently drift from manifest — hip's program file says
  ACTIVE, muscle-up says PROVISIONAL, etc. Manifest is source of
  truth for catalog display; program files' status field is dead?)

**Assessment:** _pending audit-agent pass — likely needs a founder
call on which of (1)/(2)/(3) for O5a + a decision doc for O5b
promotion process_

### O6 — F4 sort dropdown: native `<select>` renders with OS chrome, feels off-brand

Founder-in-app 2026-08-19 (desktop screenshot at
`~/Desktop/Screenshot 2026-08-19 at 20.50.14.png`). The sort control
shipped in Batch 22 (F4) as a native `<select>` with 3 options
(Curated / Shortest first / Easiest first).

**What founder sees:**
- Option list text is small (OS-native font, not the app's 14 px body)
- Popup placement is off — opens above the trigger and overlaps the
  "Pick your focus." H1 rather than dropping below
- Overall the dropdown reads as OS chrome, not app UI. Breaks the
  design system's visual register.

**Root cause:** native `<select>` was chosen for "cheap a11y" per the
Batch 22 commit note. Browser owns the popup rendering; there's no
CSS hook to style the option list text size or the popup position.

**Trade-off:**
- Keep native `<select>`: a11y is free (SR reads it, keyboard works),
  but the popup will always look OS-native.
- Replace with a custom dropdown (Radix, HeadlessUI, or hand-rolled):
  full visual control, but need to implement focus trap +
  arrow-key navigation + Escape + click-outside + SR-compat manually.

**Peer reference to check:** how do Pliability, GOWOD, Runna, Whoop
handle sort/filter controls on their catalog pages? Native
`<select>`, custom sheet, or chip-toggle row?

**Files to check when assessing:**
- `next-app/src/app/programs/page.tsx:105-125` (sort control render)
- Batch 22 commit `1fabe4a` for the original decision + rationale

**Assessment:** _pending audit-agent pass — visual-craft + mobile-ux
should weigh in; likely a small custom-sheet component that opens
from the sort button (matches Terav's existing sheet pattern —
ConfirmSheet, MoveSheet, PrimaryPicker). Would keep a11y via
`role="listbox"` + arrow-key handler._

### O7 — Programs "All" view feels dull + dense; GOWOD category-block model

Founder-in-app 2026-08-19 (desktop screenshot at
`~/Desktop/Screenshot 2026-08-19 at 20.51.47.png`).

**What founder sees on `/programs` with "All" filter:**
Long vertical scroll of stacked prose cards. No visual differentiation
between categories beyond a small icon + heading + one-line
description. Reads as a dense text list rather than a browse
experience.

**Peer reference (founder):** GOWOD renders each category as a "nice
block visual" — bigger colored tile with the category name and a
representative image, tap to enter and see programs inside.

**The trade-off founder acknowledges:**
- **Category-block model** (GOWOD): visual hierarchy is stronger,
  category identity is loud, catalog feels curated. Cost: you don't
  see programs at all from "All" — need to open a category to
  discover what's in it. Wasted taps for users who don't already
  know the category taxonomy.
- **Current stacked prose** (Terav): every program is visible from
  All view, users can compare across categories. Cost: dense, dull,
  no category identity above a small text label.
- **Hybrid**: category blocks at top of All view (visual anchors),
  programs stacked below (browseable). Also lets category chips
  double as jump-links to the section.

**Founder's own read:** "maybe not the biggest issue atm."

**Distinct from R9** — R9 rejected Pliability's "one arc per day"
prescription model. O7 is about *catalog browse presentation*, a
different domain. No conflict with R9.

**Considerations to weigh:**
- Only 5 public programs live currently (7 total including the 3
  PROVISIONAL from O5a). Category blocks with 1-2 programs each
  might look empty. GOWOD has 100+ workouts per category.
- The visual scale that "big block visual" implies conflicts with
  **R1** (no photography) and **R3** (no H1 > 32 px, no Whoop-scale
  hero). Block treatment would need to be text-driven, maybe
  colored-border-heavy — not photography.
- **P2-11 (shipped)** — programs list row `px-3 py-3 → px-4 py-3.5`
  bumped padding once already. Further padding wouldn't fix
  perceived density; the fix has to be structural.

**Files to check when assessing:**
- `next-app/src/app/programs/page.tsx` (catalog render — line 155+
  `Array.from(grouped.entries()).map(...)`)
- `next-app/public/data/programs/manifest.json` categories map
  (~line 280+ `categories` block — 5 categories authored,
  populated + unpopulated)

**Assessment:** _pending audit-agent pass — deferred per founder
("not the biggest atm"); flag for the visual-craft + design-lead
brief when catalog-density is next in scope. Should ONLY revisit
after program count grows past ~10 or catalog-conversion becomes a
measured problem._

### O8 — Category color coding collides with status-chip color coding

Founder-in-app 2026-08-19. The Programs catalog uses the same 4 palette
tokens for TWO independent semantic axes, creating visual ambiguity.

**Category identity** (`programs/page.tsx:274-282`):
- Rehab / Skill / Gymnastics / Mobility → slate
- Strength → bronze
- Endurance → green
- HYROX → amber
- Other → muted

**Status chip** (`programs/page.tsx:230-254`):
- PROVISIONAL → amber (bg-amber/20 text-amber)
- REFERENCED → amber (same)
- REVIEWED → slate (bg-slate/20 text-slate)
- VERIFIED → green (bg-green/20 text-green)

**Actual collisions:**
- REFERENCED chip on a HYROX program: amber on amber category — chip
  disappears into category identity
- REVIEWED chip on a Rehab / Skill / Gymnastics / Mobility program:
  slate on slate — **half of all categories** collide with the
  REVIEWED state. Currently zero programs are REVIEWED (see O5b) so
  this is latent, but the moment even one lands it fires.
- VERIFIED chip on an Endurance program: green on green — chip
  disappears
- PROVISIONAL is a legacy alias for REFERENCED per the code comment,
  so it inherits the same amber collision

**Founder's read:** "UI needs to be much cleaner." Correct diagnosis
— accent economy discipline says one token, one job. Here both
category *and* status use the same 4 tokens interchangeably.

**Fix options (for the audit-agent pass to weigh):**

1. **Neutralize the status chip** — drop tinted backgrounds; use
   a monochrome `border border-line-soft text-muted` chip with a
   small colored dot next to it as the only semantic accent. Status
   becomes a shape, category stays the color. Cheapest fix.

2. **Category color stripe, status text-only** — keep the `border-l-4`
   category color on the card left-edge (existing), but strip the
   `bg-*/20` fill from status chips entirely. Status becomes
   text-only inside a neutral outlined pill. Cheap, keeps category
   loud.

3. **Introduce a status-only token family** — e.g. `--color-status-*`
   distinct from the semantic palette (bronze/slate/green/amber/red).
   Higher discipline but adds tokens.

4. **Drop category color entirely** — differentiate categories via
   icon + label only, freeing the palette for status. Would need
   distinctive glyphs (currently ◆ ▮ △ ○ ☰ ◇ · — some duplicate;
   rehab + mobility both use ◇/◆, skill + gymnastics both use △).

**Considerations to weigh:**
- **R2 (rejected)** — "Second primary accent, nothing competes with
  bronze for CTA." O8 doesn't touch CTA (bronze primary stays); this
  is about ambient semantic tokens on chips + borders. No conflict.
- **R4 (rejected)** — "Softer mono-caps everywhere." Status chip is
  currently mono-caps `text-[10px]`. Neutralizing the background
  (option 1 or 2) keeps mono-caps intact.
- **P1-59 (shipped Batch 26)** — introduced `text-red-strong` for
  on-tint pairings. Option 3 could reuse this discipline: introduce
  `text-status-*` variants that are chosen for contrast against
  neutral backgrounds specifically.
- Cross-app impact: the same `bg-{color}/20 text-{color}` pattern
  is used elsewhere (e.g. Week per-track pill, HeritageClusterChip,
  proposal chips). Whichever fix option ships, it should be applied
  consistently across the app, not just Programs.

**Files to check when assessing:**
- `next-app/src/app/programs/page.tsx:230-254` (status chip map)
- `next-app/src/app/programs/page.tsx:274-282` (category color map)
- `next-app/src/app/programs/page.tsx:306` (card border-l-{cat} paint)
- `next-app/src/app/globals.css` `@theme` block (token definitions)
- Cross-app `bg-*/20 text-*` usage (grep — likely 15-25 sites)

**Assessment:** _pending audit-agent pass — visual-craft owns; likely
recommends option (1) or (2) as tactical fix, option (3) as
strategic refactor. Would also close a class of confusion around
color-as-metadata across the app._

### O9 — Program preview page: info hierarchy + visual "boring block" problem

Founder-in-app 2026-08-19, on First Strict Pull-Up preview page.
Screenshots at `~/Desktop/Screenshot 2026-08-19 at 20.54.59.png`,
`20.55.04.png`, `20.55.11.png`.

**What's currently on the preview** (in top-to-bottom order):
1. Title + PROVISIONAL chip (O5a leaks here)
2. Short description (prose)
3. Levels chain: Hang → Assisted → First Rep → Volume
4. "Adapts to you" card (bronze bordered)
5. Duration + hr/week meta
6. **Who this is for** (prose)
7. **What you'll achieve** (prose)
8. **Retest** (prose)
9. **Baseline setup** card
10. **Make this my focus** primary CTA
11. **Program shape (peek inside)** collapsible with phases + blocks

**Founder's read:**
- **Likes:** the who-is-this-for, what-you'll-achieve, retest, and
  adaptiveness content is genuinely useful
- **Questions info hierarchy:** which of these matters most to a
  first-time visitor? "What will I get" and "is it for me" seem
  primary; retest details + phase list seem later-in-conversion
- **Complaint:** same "boring text block" visual as the catalog rows
  — reads as a stack of prose sections without visual anchors
- **Reference:** landing page's program blocks look better; peer apps
  probably have richer preview surfaces

**Distinct from O7:** O7 was about catalog-browse density. O9 is
about the detail-page hierarchy + visual craft.

#### Two connected sub-questions

**O9a — Info hierarchy pass.** What does a first-time visitor
actually need to decide "start this program"? Best-guess ranking:
1. Is it for me? ("Who this is for")
2. What will I get? ("What you'll achieve")
3. What's the commitment? (duration + hr/week)
4. How does it prove it works? (retest — reads as trust/confidence)
5. How does it adapt to me? ("Adapts to you")
6. What's inside? (peek-inside collapsible)

Currently the ordering is close but the *visual weight* is flat — 6
prose blocks in sequence. Reorder + visually escalate the top 2.

**O9b — Visual craft: prose-block monotony.**
- "Adapts to you" card gets bronze accent + border (visual anchor)
- Everything else is `<h2 className="text-[14px] font-semibold">`
  + `<p className="text-sm">` — same treatment across 5 sections
- No visual differentiation between "trust content" (retest,
  adapts-to-you) and "spec content" (duration, phases)
- The Batch 21 P1-53 Cites strip added bronze card visual — but
  that's the shipped list, not this page

**Peer research needed:**
- How do Pliability, GOWOD, Runna, Whoop, Ladder render their
  program preview / detail page?
- Which use hero imagery? (Terav rejects R1 — no photography.)
  Which use hero-metric / stat grids? Which do prose-only?
- What's the info order on their preview pages?

**Cross-refs to consider:**
- **O5a (this queue)** — PROVISIONAL chip renders top-of-page; if
  we promote First Strict Pull-Up to REFERENCED, this specific chip
  goes away
- **O8 (this queue)** — the "Adapts to you" bronze card + Baseline
  setup slate card + status chip use the same overloaded palette;
  fixing O8 tightens the preview page too
- **P1-63 (shipped Batch 27)** — button-labels moved to 14 px
  sentence-case; the CTA "MAKE THIS MY FOCUS" is still 11 px
  mono-caps here (see `ProgramPreviewClient.tsx`) — inconsistency
  with the confirmed system
- **Landing "Cites: Helgerud 2007 · Seiler 2010" strip** — landing
  program blocks (per `landing/src/components/sections/Programs.tsx`)
  have a richer treatment; port that visual language up to
  `ProgramPreviewClient.tsx` — the audit could compare

**Files to check when assessing:**
- `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx`
  (top-to-bottom render — likely 200+ lines)
- Landing reference: `landing/src/components/sections/Programs.tsx`
  (per-program block treatment)
- `next-app/public/data/programs/first-strict-pullup.json` (source
  of prose fields — who_this_is_for, what_youll_achieve, retest)

**Assessment:** _pending audit-agent pass — needs both visual-craft
(monotony fix, hierarchy escalation) and design-lead brief for the
info-priority call. Peer research required. Likely a Batch-scope
item after the header/dashboard restructure (O3b/O4) lands so the
whole app moves together, not surface-by-surface._

### O10 — Intake wizard: UX polish + tier-recommendation logic question

Founder-in-app 2026-08-19, running the First Strict Pull-Up intake
wizard end-to-end. Screenshots at `~/Desktop/Screenshot 2026-08-19
at 20.57.47.png` through `20.59.45.png` (5 captures — step 1, step
1 with Yes selected, step 2 safety-gate fired, step 14 consent, and
the tier-placement page).

**Overall verdict:** founder likes the wizard experience. Real
observations across two independent axes:

#### O10a — Buttons feel small; could be more engaging

Yes/No answer buttons render at natural width (`w-auto`), leaving a
lot of dead space on desktop and even on mobile. Founder's read:
- Answer buttons could be **full-width** (or at least meaningfully
  wider), especially on desktop where the current buttons look
  small against the surrounding container
- The primary/secondary `BACK` / `NEXT` footer buttons at bottom
  could also be **full-width** OR at minimum more visually anchored

**Peer research needed:** how do onboarding-wizard flows in
Duolingo, Runna, Whoop, Ladder handle answer buttons? Full-width is
the modern default (~2020 onward). Full-tap-area is discoverable +
thumb-friendly.

#### O10b — Progress indicator visually small

The `INTAKE · FIRST STRICT PULL-UP` + `SCREENING · STEP 1 OF 14`
rail sits at 10-11 px mono-caps. It's the primary "how far in am I"
signal but reads as chrome. Founder wants **bigger / more
prominent** treatment:
- Larger `N / M` numerals (Duolingo pattern: big filled progress bar
  with the counter as a hero element)
- Or a percentage: `7% · Step 1 of 14`

**Cross-ref:** matches the "engagement" theme — wizards should feel
like progress, not filling out a form. This isn't a game (**R5**
rejects gamification), but progress visibility ≠ gamification —
it's status transparency.

#### O10c — Tier recommendation may be miscalibrated

**Founder reported:** answered "3-5 strict reps" on the intake
question, skipped the physical tests, got **Tier A recommended** on
the placement page.

Per the tier descriptions on the placement page:
- **Tier A — No hang yet**: by week 8 target 25-45 sec dead hang,
  first clean scapular pulls, 5-10 strict feet-elevated ring rows
- **Tier B — Hang established, no strict rep yet**: by week 8-10
  first strict pull-up OR clean 10-sec slow negative + heavy-band
  assisted rep
- **Tier C — One strict rep, building the second**: by week 8 3-5
  strict pull-ups unbroken
- **Tier D — Multiple reps, adding volume**: by week 8 8-10 strict
  pull-ups unbroken, starting 3-5 rep max

Someone doing **3-5 strict reps today** should hit **Tier C** (starting
point) or **Tier D** (if they're at 3-5 rep max already). Tier A
requires "no hang yet" which is manifestly false for a user who can do
3-5 strict pull-ups.

**Root-cause candidates (for the audit agents to investigate):**
1. Physical tests carry the tier-placement signal weight; skipping
   them defaults to the conservative Tier A regardless of intake
   answers (safety-first fallback)
2. Intake answer "3-5 strict reps" is on a different question than
   the tier-picker reads
3. Tier-recommendation rule is broken / missing

Founder question: **"is this ok?"** — genuine uncertainty about
whether the conservative-default is by design or a bug.

If it's by design: the placement page should EXPLAIN why Tier A was
picked ("You skipped physical tests, so we started conservative —
tap Tier C or D if you're already there"). Current copy just says
"Recommended" without justification. There's a "How this was picked"
disclosure — content in that disclosure matters here.

If it's a bug: intake answer signal weight needs a rule to override
the skipped-physical-tests default when the answer is unambiguous.

**Files to check when assessing:**
- `next-app/src/app/programs/[slug]/intake/IntakeClient.tsx` (wizard
  render + step transitions)
- Tier-placement logic — grep for `recommend`, `tier`, `physical_tests`
  in the intake commit path
- `next-app/public/data/programs/first-strict-pullup.json` intake
  block — how are questions weighted?
- `next-app/src/lib/engine/*` — where does the intake write to
  `program_states[slug].tier`?

**Assessment:** _pending audit-agent pass — split into three
verdicts: (a) UX polish is real (button width, progress indicator);
(b) tier-logic needs engine investigation, not visual; (c) at
minimum, the tier-placement page needs a "here's why" that reads
the actual signal used. **O10c is potentially a real bug worth
prioritizing over cosmetic items.**_

**O10c ROOT CAUSE (general-purpose investigation 2026-08-19):**
Confirmed real bug. `first-strict-pullup` is **missing from both
`SELF_REPORT_TO_NUMERIC` and `SELF_REPORT_TO_TEST_VAR` proxy tables**
in `next-app/src/lib/engine/intake-tier.ts:258-327`. Only
`handstand-walk`, `concurrent-strength-maintenance`, and
`rowing-2k-test-prep` are declared.

Effect chain:
1. All four tier `condition` strings (first-strict-pullup.json:344-414)
   reference physical-test variable names (`dead_hang_max_seconds`,
   `strict_pullup_max_reps`).
2. Intake answer `three_five` cannot bind to `strict_pullup_max_reps`
   without a proxy map.
3. `intake-tier.ts:149` — unknown identifiers evaluate to `0`. So
   both tier variables = 0.
4. Tier walk (`intake-tier.ts:438-448`) — only `tier_a_hang`
   (`dead_hang_max_seconds < 15`) matches when both vars = 0.
   Tier A wins deterministically. Not the "no tier matched → default"
   branch — a real, silently-wrong match.
5. Zero regression coverage: `intake-tier.test.ts` has no
   `first-strict-pullup` test cases.

**Fix scope:** JSON-config-like change in `intake-tier.ts`. Add
`first-strict-pullup` to both proxy tables with mappings for
`current_strict_pullups` enum (zero_no_hang→0, one_two→1, three_five→3,
etc.) and `dead_hang_seconds_selfreport` enum. `hint` labels on intake
options are pure display strings — they never enter the engine.

**Adjacent bugs surfaced by this investigation:**
- **Shape-of-code footgun.** Per-slug allowlist proxy tables mean
  every new multi-dim program that forgets to register silently
  falls to first tier. Consider (a) moving `self_report_proxies[]`
  into program JSON, or (b) startup validation that scans
  `plan_tiers[].condition` idents and errors if not derivable.
  The comment at `intake-tier.ts:260` already flags this as known.
- **No signals-used disclosure** on placement page
  (`IntakeClient.tsx:523-555`). Even after fix, the page should say
  "Based on your answers — [reasoning]. Skipped physical tests?
  Numbers can be off. Pick manually if this doesn't feel right."
- **Conservative-defaults map** (`intake-tier.ts:385-391`) only
  defined for `rowing-2k-test-prep`. Add explicit conservative
  defaults for first-strict-pullup for robustness.

**Verdict:** REAL BUG · promote to master-task-list as BUG next batch
· fix is code (add proxy tables + regression tests + optional
placement-page disclosure copy). Coordinates with `product-design-lead`
Decision 4 for the "here's why" copy.

### O11 — Tab-name H1s are redundant with bottom-nav; cause tab-switch jump

Founder-in-app 2026-08-19 (screenshots at `~/Desktop/Screenshot
2026-08-19 at 21.01.14.png`, `21.01.33.png`, `21.02.01.png`,
`21.02.05.png`). Switched Today ↔ Week ↔ Progress tabs and observed:

- Today has H1 "Today", Week has "Week", Progress has "Progress"
- The H1 → next-element spacing differs across pages, so switching
  tabs causes a **visible layout jump** (H1 sits at a slightly
  different vertical position on each tab)
- The bottom-nav already highlights the active tab persistently.
  H1 duplicates that signal and takes ~50 px of fold space per tab.

**Founder's proposal:** drop the H1s on tab-labeled routes. Make the
date-picker (Today/Week) OR the first content block (Progress/
History/Profile) the actual first element. More room for real
content.

**Tension with a11y:** P1-4 (Batch 18) explicitly promoted Today's
H1 from `sr-only` → visible for WCAG 2.4.6 "Headings and Labels"
+ parity with other routes. That was a considered a11y call.

**Reconciliation options (for the audit-agent pass):**

1. **Revert to `sr-only` H1s** on tab-labeled routes. SR users still
   get the landmark (`<h1>Today</h1>` in the DOM, hidden from
   sighted). Sighted users get no redundant chrome. Regresses P1-4's
   visible-parity call but arguably serves both audiences better.

2. **H1 carries information, not tab name.** Change:
   - Today's H1 → `Wednesday 19 Aug` (the date; also removes the
     date-picker's `<p>Wednesday 19 Aug<br/>Today</p>` duplication)
   - Week's H1 → `17 Aug → 23 Aug` (the range)
   - Progress's H1 → `Week of 17 Aug` (or similar)
   - Removes redundancy without regressing a11y (H1 still visible,
     just no longer duplicates tab label)

3. **Keep visible H1s but standardize spacing.** Fixes the jump but
   keeps the redundancy. Cheapest but least product-satisfying.

**Founder's likely preference (implicit):** (1) or (2). Product-
design-lead should call it.

**Files to check:**
- `next-app/src/app/page.tsx` (Today H1)
- `next-app/src/app/week/page.tsx` (Week H1)
- `next-app/src/app/progress/page.tsx` (Progress H1)
- `next-app/src/app/history/page.tsx` (History H1)
- `next-app/src/app/profile/page.tsx` (Profile H1 — was Batch 16's
  Profile identity chip; harder to remove because it doesn't just
  say "Profile", it's a design surface)

**Assessment:** _pending audit-agent pass — visual-craft + a11y
tension. If (2) wins, it's a small ship; if (1) wins, it partially
reverses P1-4 with justification. Not a P0 either way._

### O12 — Today DateNav: Home icon appears/disappears, shifts forward-arrow

Founder-in-app 2026-08-19 (screenshots at `~/Desktop/Screenshot
2026-08-19 at 21.03.54.png` + `21.04.00.png`). On Today, when the
active date === today, no Home icon renders. When date !== today,
a bronze Home button appears in the DateNav — but its slot is NOT
reserved on today-view, so the forward arrow's position **shifts
left** when Home appears.

**Confirmed root cause:** `DateNav.tsx:49-58` conditionally renders
the Home button. Week page has the equivalent fix (bug #71,
2026-08-18) that reserved a permanent "Now" slot; Today's DateNav
component did not receive that fix.

**Fix (straightforward):** apply Week's `invisible
pointer-events-none` pattern. When `isToday`, still render the Home
button element with `className="invisible pointer-events-none"`
so the container width stays fixed and the forward arrow never
shifts.

**Real bug, low complexity.** Should route to the master list as a
Section A bug ID after the audit-agent pass, though tactically it
could also just be fixed inline — but per the founder's stated
protocol, no direct changes.

**Files to check:**
- `next-app/src/components/workout/DateNav.tsx:49-58`
- Compare to `next-app/src/app/week/page.tsx:211` (bug #71 fix
  reference pattern)

**Assessment:** _pending audit-agent pass — will land as a Section
A bug. Trivial fix (~3-line CSS change) once the pass promotes it._

### O13 — Readiness-dot redundancy: header dot + Today green banner both say "green"

Founder-in-app 2026-08-19 (screenshot at `~/Desktop/Screenshot
2026-08-19 at 21.05.30.png`). After completing the morning check
with a green result, the state is signaled in TWO places:
- Small green dot next to the TERAV wordmark in header
  (`AppShell.tsx` ReadinessDot component)
- Full "● GREEN · Progress load. Nothing above 3/10 in your check."
  banner just under the date-picker on Today

Same info, two places, both taking fold real estate.

**Founder's read:** partially solved by O3b (Today becomes a
dashboard of blocks — morning-check block would own the state
display, header dot becomes redundant). Note in queue for when
O3b lands.

**Fix now vs. defer:**
- **Defer** to O3b's Today-dashboard rewrite: the header dot and
  the green banner are both intentional per Batch 12-era decisions.
  Ripping them out separately doesn't buy much; the dashboard model
  restructures both surfaces.
- **Fix now**: pick one. Either drop the header dot (state lives
  in content), or drop the banner (state lives in chrome). Cheapest
  quick-win: drop the banner and let ReadinessDot own it — that's
  what the header dot was designed for.

**Files to check:**
- `next-app/src/components/AppShell.tsx` (ReadinessDot import)
- `next-app/src/app/page.tsx` (Today green banner — grep "GREEN"
  or "derived_state")

**Assessment:** _pending audit-agent pass — recommend deferring to
O3b unless the dashboard model gets pushed back beyond a couple
of batches._

### O14 — Exercise cards: name truncation, expand affordance unclear

Founder-in-app 2026-08-19 (screenshots at `~/Desktop/Screenshot
2026-08-19 at 21.05.30.png`, `21.05.53.png`, `21.06.02.png`). Multiple
exercise-card issues:

#### O14a — Exercise name truncates aggressively
Cards show:
- "Active hang (scap-en..." (should be "scap-engaged" or similar)
- "Band shoulder prep (l..." (should be "light" or similar)

The parenthetical modifier is important context — cutting it off
tells the user "there's more here I can't see." Names should either:
- Wrap to 2 lines (current: `truncate` class — replace with
  `line-clamp-2`)
- Or the card should be tall enough to fit the name at natural
  width. Multi-line is safer.

#### O14b — Chevron/expand affordance is thin
Tapping the `v` chevron on an exercise card reveals... "Add note".
That's it — no expanded exercise detail, just a note-input link.
Founder read: "when I click the down arrow, nothing basically
happens... ok actually add note opened."

The expand-collapse is currently a wasted affordance. Options:
- Rename the chevron / icon to represent "notes" specifically
  (`MessageSquare`?)
- Actually put more content behind the expand — set-by-set logging?
  Notes + last-session recall? Cue + form-check video link?
- If the only revealed content is a Notes field, don't use a
  chevron at all — that pattern signals "there's more"

#### O14c — Two-sets logged of a three-set exercise: what happens?
Founder's aside: "what if I did 2 sets only." The current card
shows `3 sets` as the prescribed count. If a user completes 2 of 3
and stops, does the card look done or unfinished? Set-tracking
completeness is a data question that intersects with the visual
question.

**Founder said this may not be important right now** — flag but
don't rush.

**Files to check:**
- `next-app/src/components/workout/ExerciseCard.tsx` (card render,
  truncation, expand handler)
- `next-app/src/components/workout/SetRow.tsx` (per-set logging)

**Assessment:** _pending audit-agent pass — visual-craft + copy on
O14a (truncation + name-wrap decision); interaction / product-
design on O14b (what "expand" should actually reveal). O14c is
data completeness, out-of-scope for this audit._

### O15 — Workout block visual: HWPO reference, cleaner block-first structure

Founder-in-app 2026-08-19. Building on O14, the founder appreciates
the current **block structure** — session broken into named blocks
(SCAPULAR PULL LADDER, SHOULDER + GRIP PREP, ROW STRENGTH) each
with a prose intro + N exercises inside. Structural win over prior
"flat list of exercises."

But visually the blocks are still text-heavy. Founder reference:
**HWPO Run** program screenshots — https://cdn.prod.website-files.com/69bbcbaa78defa41a5ee08af/6a70c4abb48d1d129c03ba10_HWPO%20Run.webp

HWPO pattern (from founder's description of the image):
- Each block is a visually distinct card
- Block header prominent (color? typographic weight? icon?)
- Tap to expand for full detail

Founder's ask: **can Terav's blocks look more like this?**

Peer research needed:
- HWPO Run reference image (linked above) — audit-agent should
  fetch it and characterize the design language
- Cross-check against R1 (no photography) — HWPO may use imagery;
  Terav can't. Adaptation may be typographic + color-driven
- Cross-check against R3 (no giant H1) — but block headings could
  legitimately be 16-18 px semibold; not violating R3
- Compare Runna workout-block treatment (peer-refs entry)
- Consider Whoop's block treatment on activity summary cards

**Cross-refs from queue:**
- **O3b** — Today-dashboard model where blocks become the primary
  content. This observation lands squarely in that brief's scope.
- **O8** — color-collision problem; block color coding here would
  compound if not resolved first
- **P1-63 (shipped)** — 14 px sentence-case button labels; block
  headings may want their own 15-16 px semibold tier

**Files to check:**
- `next-app/src/app/page.tsx` (BlockSection component render,
  category color + border, block header treatment)
- `next-app/src/components/workout/BlockSection.tsx` (if
  extracted — else inline in page.tsx)

**Assessment:** _pending audit-agent pass — visual-craft + design-
lead brief. Bundle with O3b (Today dashboard). WebFetch HWPO Run
image + Runna workout page for peer language before making the call._

### O16 — Future profile fields: height, weight, sex (deferred)

Founder-in-app 2026-08-19. HWPO reference had height/weight/sex
fields in profile. Terav doesn't currently ask for these.

**Founder's aside:** "maybe things we add some day under profile."
Not asking to build now — logging as a future consideration.

**Why not now:**
- Terav's engine is TM-based (training-max % prescriptions), not
  bodyweight-adjusted absolute loads. Height/weight aren't in the
  prescription math.
- Sex could matter for norms (e.g. Norwegian 4×4 HR max formula
  slightly differs by sex in some literature) but current engine
  uses generic HRmax = 208 − 0.7 × age (Tanaka 2001, sex-agnostic).
- GDPR/health-data implications add friction — asking for these
  fields without a load-bearing engine use case is data
  collection for its own sake.

**When to add:**
- If a future program authored requires bodyweight-scaled loads
  (e.g. gymnastics ring-strength normalization, HRmax refinement,
  wearable-data calibration for HR zones)
- If a signed-in Physio/Coach mode needs these for clinical share
  (Report currently doesn't include them; specialists would ask
  verbally)

**Assessment:** _pending audit-agent pass — flag for
product-design-lead review; likely a "no engine use case, defer"
verdict._

### O17 — Peer-research batch: competitive visual references

Founder-in-app 2026-08-19. Shared a bundle of URLs + asked the
audit-agent pass to do wider peer research beyond these seeds.

#### Founder-curated references

- **CrossFit software landscape article** —
  https://www.fitvizpro.com/blog/software-for-crossfit
- **CrossFit app 2026 visual** —
  https://www.fitvizpro.com/blog-images/software-for-crossfit-2026.jpg
  Founder note: "seeing how much I have completed also helps mentally"
  (i.e. completion-progress visualization is desirable)
- **GOWOD app screenshot** —
  https://i.garagegymreviews.com/563/653/347/gowod-app.webp
- **Strength PR ideas (Instagram post)** —
  https://www.instagram.com/p/DYsF5KJkUiT/
  Founder note: "probably we don't need them anytime soon" —
  aspirational, not required
- **Additional fitness visual** —
  https://cdn.prod.website-files.com/63ac2adedd12792c47e49a8d/665b3864bd3db72ba1e0221a_first.png
- **Garmin app visual** —
  https://lifehacker.com/imagery/articles/01K9WQ102TGXP0046HNXY7AE2M/images-1.fill.size_2000x1125.v1762974638.jpg

#### Direction to the audit agents

**Founder explicitly asks** for wider Google-Image research beyond
this seed list. Query set for the audit-agent pass to run:
- "CrossFit apps UI 2026" / "CrossFit apps screenshots"
- "fitness app UI 2026" / "fitness app onboarding UI"
- "strength app UI" / "strength log UI"
- "mobility app UI" / "mobility app dashboard"
- Individual peer names + "app screenshots":
  Pliability, GOWOD, Runna, Whoop, Hevy, Ladder, HWPO, TrueCoach,
  TrainHeroic, BeYourBestSelf, Freeletics, Fitbod, Strong

For each finding, agents should:
- Fetch + inspect (WebFetch or WebSearch)
- Note the visual language: color, type scale, block treatment,
  hero patterns, completion-progress metaphors
- Cross-check against Terav's existing rejected list (R1-R12) —
  don't propose photography (R1), giant hero (R3), streak counters
  (R5), etc.
- Cite specifically what to steal, what to reject, and WHY —
  matches the pattern the existing `competitor-refs.md` already
  documents

#### Consolidation target

This research feeds THREE existing queue observations that all touch
visual-craft / dashboard / card treatment:
- **O3b** — Today becomes a dashboard of blocks (Garmin Connect
  model)
- **O7** — programs catalog "boring stacked prose" density
- **O9** — program-preview page info hierarchy + visual monotony
- **O15** — block-visual within a session (HWPO Run reference)

Recommend the audit-agent pass produce a SINGLE consolidated
"post-founder-review visual brief" that references O17's peer
research and makes calls on O3b + O7 + O9 + O15 together. Shipping
them as ad-hoc edits repeats the "no UI churn between audits"
failure mode.

#### Related — completion-progress signaling (from fitvizpro comment)

Founder specifically highlighted "seeing how much I have completed
also helps mentally." This is a design signal orthogonal to O3-O15
but worth capturing:
- Terav has adherence data per-program (`PerProgramAdherenceCard`)
- Terav has retest deltas
- Terav does NOT have a "you've completed N of M sessions this week"
  or "you're X% through this arc" progress bar
- **Watch out for R5** — completion progress ≠ streak/gamification.
  A calendar heatmap or arc-percentage is honest transparency, not
  a Duolingo-style guilt counter. Distinction matters.

**Assessment:** _pending audit-agent pass — this is INPUT to the
consolidated visual brief, not a task itself. Route to
product-design-lead + visual-craft when the queue closes. Peer
research is the agents' job; founder curated the seed set._

### O2 — Top-right icon strip: Programs icon may not earn its slot

Founder-in-app 2026-08-19. The top-right of the header currently shows
three icons: Programs (Layers), Morning check (Stethoscope), ⋮ overflow
menu. Founder read:

> Programs is a rare action. Every page has a CTA to programs already.
> Free users can only have one program anyway. Users can remove +
> re-pick from Profile. Putting Programs in the top nav duplicates an
> action they take a few times total — occupies a slot that should
> serve daily use.

Founder specifically asks: **how many other apps in the peer set have
Programs in the top nav?** (Pliability, GOWOD, Runna, Whoop, Hevy.)

**Suggested (by founder) alternatives:**
- Drop Programs from top nav entirely; rely on Profile row + empty-state
  CTAs
- Move Programs into ⋮ overflow (with Report, Guide, Evidence)

**Considerations to weigh:**
- Programs promoted OUT of the ⋮ menu 2026-08-17 per comment at
  `HeaderQuickLinks.tsx:17-19` — "a multi-program app hides the program
  catalog at its peril." That reasoning assumed multi-program was the
  target end-state. If free users are locked to one program (and
  multi-program is paid), Programs' top-nav slot only serves paid users.
- Removing it doesn't hurt the founder (super-admin can still hit
  `/programs` directly) but does affect new-user discovery — is
  Profile's "Pick your focus →" empty-state CTA visible enough on
  first Today load?

**Files to check when assessing:**
- `next-app/src/components/AppShell.tsx:127-141` (top-nav icon strip)
- `next-app/src/components/nav/HeaderQuickLinks.tsx:17-37` (⋮ menu +
  original Programs-promotion comment)
- `next-app/src/app/profile/page.tsx` (Programs list + empty state
  "Pick your focus →" at ~line 285)

**Assessment:** _pending audit-agent pass_
