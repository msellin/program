# Handstand Walk intake wizard — audit (post-refactor, commit 294f6f3)

Owner: product-design-lead
Written: 2026-08-18
Status: audit — actionable
Related: `dev/design-briefs/2026-08-17-intake-visual-craft.md` (SUPERSEDED),
`.claude/projects/-Users-margussellin-www-program/memory/feedback_wizard-intake.md`
Files audited: `next-app/src/app/programs/[slug]/intake/IntakeClient.tsx`,
`next-app/src/components/nav/BottomNav.tsx`,
`next-app/public/data/programs/handstand-walk.json`

---

## Top 3 changes to ship this hour

1. **Chip primitive is the wrong shape for wizard.** In a stacked form, small
   chip-pills read as "pick from many". In a wizard where the chip row IS the
   screen's answer surface, they read as tags, not choices. Convert the chip
   row to **full-width outlined option rows** (label left, radio-dot right).
   One row per option, stacked vertically, 56–64px tall, `border-line` default,
   `border-bronze bg-bronze/8` selected. This aligns with the review-screen's
   own tier picker (`IntakeClient.tsx:513-543`) which already uses this
   pattern — the wizard is currently inconsistent with the surface it hands
   off to. Keep chips ONLY on `boolean` Yes/No (two chips, side-by-side is
   correct) and `days_per_week` (2–7 is a natural chip strip).
2. **Split the physical-tests screen into 5 wizard steps.** Five numeric
   inputs inline on one screen (`WizardPhysicalTestsScreen`, `:882-931`) is
   the exact density the wizard was chosen to avoid — one form crammed into
   step 11 while every other step gets a single question. Each test carries
   `instructions` copy 60–120 words long; that copy deserves the wizard's
   breathing room. Ship as `11 / 15` through `15 / 15`, each with a "Skip"
   secondary in the footer that advances without a value.
3. **Fixed footer needs `env(safe-area-inset-bottom)` + a visible divider on
   short desktop content.** `WizardFooter` (`:997`) uses
   `fixed bottom-0 ... pb-3` with no safe-area padding — will clip under the
   iOS home indicator on notched devices (BottomNav has `pb-[env(...)]` at
   `BottomNav.tsx:39`; intake footer must match). On desktop where content is
   short (age band screen, ~200px of content) the footer floats over an empty
   viewport, which reads like a floating tab bar. Add a `max-w-2xl mx-auto`
   content column shell so the footer visually closes a card, not a page.

---

## Screen-by-screen shape

### Steps 1–5 (Screening: wrist_pain_12mo, shoulder_pain_overhead, osteoporosis_dx, hypertension_uncontrolled, acute_wrist_injury)

- **Too sparse.** Big question label + a wrap-flow of 2–3 short chips leaves
  60–70% of the viewport empty, especially on desktop (1280×800). The
  question doesn't feel weighty enough for its stakes — three of these five
  can hard-block. The chip row hanging in space reads like a poll, not a
  medical intake gate.
- **Fix:** stacked option rows (see change #1 above) plus a small
  `SCREENING` mono label (already present, good) and the `help` text
  **above** the answers, not deferred. `shoulder_pain_overhead` has 40 words
  of help copy at `handstand-walk.json:255` that the current layout renders
  quietly below the label — for a wizard, that context is the point of the
  screen. Move `q.help` between the H2 and the answers with tighter leading
  and slightly reduced opacity so it reads as scaffolding, not a wall.
- **Regression from quiet-form:** In quiet-form all 5 gates were visible at
  once. The wizard hides steps 2–5 behind step 1. Trust asset — "we're
  screening you honestly, look how many things we ask" — is now paced, not
  presented. Preserve it by naming the screening arc at step 1 with a single
  line: `SCREENING · 5 safety questions before we start.` Currently only
  `SCREENING` renders; add the count so the user knows the arc's shape.

### Steps 6–8 (Skill self-report: wall_hold, freestand_hold, walk_distance)

- **Pictogram tiles at 2× scale.** Verdict: **downplay, don't cut**. The
  `PictogramTile` (`:1039-1080`) is a 96×96 border-and-dot construction that
  reads on-brand at 1× (as originally shipped) but at `scale(2)` inside a
  `w-24 h-24` container it centers a tiny stick figure inside a huge empty
  tile. It looks like a placeholder for a missing image. Options:
  - Cut `large` prop, ship at 56×56 inline-left of the question label (like
    an icon, not a hero). Restores the anchoring purpose without the
    "here's where the illustration will go" feeling.
  - Keep centered but shrink the frame to 64×64 and drop the outer border —
    the pictogram becomes typographic ornament, not a tile.
  - **Recommended:** the first option. Inline-left, 40×40, aligned with the
    question label baseline. Delegate exact dimensions to `app-visual-craft`.
- **"Why the tiers?" placement:** correct location (below chips, collapsed).
  Copy is fine. No change.

### Steps 9–10 (About-you: days_per_week, age_band)

- Screen shape is fine. `days_per_week` chips (2–7) are the one place chip
  primitives read correctly — six short numeric labels, natural strip.
  `age_band` is 4 options; convert to stacked rows per change #1.
- **Under-designed feeling** the founder mentioned lives here most: for
  `age_band` on desktop, the screen shows an H2, four chips, and 900px of
  empty space. Add a footer-anchored `~2 min left` mono label to reward
  momentum without adding chrome.

### Step 11 (Physical tests, currently a single screen with 5 tests inline)

- **Break into 5 steps.** See change #2. Reasons:
  - Each test's `instructions` (60–120 words at `handstand-walk.json:342-378`)
    is where the trust math happens. Cramming five of them into one screen
    forces users to skim, which defeats the purpose of documenting the
    protocol.
  - "Optional" on a dense scrollable screen reads as "skip me". "Optional"
    on a per-step wizard screen with a clear Skip button reads as "your
    call, we're not blocking you". Different psychological weight.
  - The `duration_days: 3` field at `handstand-walk.json:91` means the user
    is expected to do these across three days anyway. The wizard should
    reflect that: one test per screen, save progress, come back.
- **If not splitting today:** at minimum, add an `optional — skip anytime`
  chip inline in the header AND add a `Skip tests` link in the footer next
  to Finish. Right now Finish/Next just advances even with zero values but
  gives no signal that skipping was intended.

### Step 12 (Consent)

- Shape is correct. Two checkboxes, big touch targets (5×5 at `:958`, good).
- **Regression risk:** consent copy at `handstand-walk.json:382-390` reads
  clinical. In quiet-form it sat at the bottom of a page and felt like a
  final honesty pass. In wizard mode it becomes an isolated screen and lands
  colder. Delegate to `app-copy-clarity` to warm the intro line above the
  checkboxes: something like "Two things you're agreeing to" — currently
  just says "Consent" with a `required` badge.

### Review screen (post-Finish)

- Sticky "Start program with this tier" button at `:547-556` uses
  `sticky bottom-2` — will collide with the removed BottomNav's absence.
  Verify visually: sticky bottom offset should match the wizard footer's
  height (`~64px`) not `bottom-2`. Otherwise the button floats mid-space.

---

## Button system: chip vs. option-card vs. list-row

**Recommendation: stacked outlined option rows for `select` questions with 3+
options with any label longer than 12 chars. Chips only for `boolean` (Yes/No)
and short numeric strips (`days_per_week` 2–7).**

Concretely:

```
Current (all selects):
[ No ] [ Occasional / mild ] [ Yes — persistent or limiting ]

Proposed (3+ options, long labels):
+-------------------------------------------------+  ○
| No                                              |
+-------------------------------------------------+
+-------------------------------------------------+  ○
| Occasional / mild                               |
+-------------------------------------------------+
+-------------------------------------------------+  ●
| Yes — persistent or limiting                    |
+-------------------------------------------------+
```

Why not keep chips:

- Chips wrap unpredictably at 393px on labels like
  `Yes — persistent or limiting` (23 chars). Currently wraps to a 2-line
  chip which breaks the row rhythm.
- The review-screen tier picker at `:513-543` is already stacked rows with
  radio dots. Users see chips → chips → chips → then a rows list. Visual
  inconsistency at the moment of highest tension (choosing the tier).
- Fitts's law: full-width row = 375px × 56px target. Chip = ~120px × 48px.
  For a wizard where each screen has exactly one interaction, the row wins.

Keep the semantic-red-when-picked-and-unsafe treatment (`:789-794`); on rows
it becomes `border-red/40 bg-red/8`, still not shouty. The block-body panel
at `:866-877` remains the loud channel.

---

## Wizard footer craft

- **Shape reads as advance, not options.** ✅ Bronze primary right +
  quiet-grey Back left + centered mono `N / M` = form footer, not tab bar.
- **iOS safe area:** ❌ missing. Add `pb-[env(safe-area-inset-bottom)]` to
  the outer `fixed` div at `IntakeClient.tsx:997`. Ship this hour.
- **Desktop empty-below concern:** valid. When the current screen has ~200px
  of content (age_band), the footer is 500px+ below the last input.
  Recommendation: constrain the wizard body to `max-w-2xl mx-auto` AND give
  the fixed footer the same max-width visually via a subtle top border that
  matches. Delegate exact treatment to `app-visual-craft`. Do not remove the
  fixed positioning — it's correct for mobile and correct in spirit for
  desktop (predictable location).
- **`Next →` glyph:** the ASCII arrow reads fine on the bronze button but
  compare with `Finish` on step 12 (no arrow). Consider dropping the arrow
  from Next for consistency — the button being on the right is directional
  signal enough. Delegate to `app-copy-clarity`.

---

## Progress signal

Single bronze rail + `Step 1 of 12` mono label at `:709-733` is **correct
for now**. Discrete section dots (5 + 3 + 2 + 1 + 1) would require the user
to decode a legend and adds chrome for a benefit that mono N-of-M already
delivers.

However: add a **section label** in the rail zone. Currently the rail shows
overall progress but the section label sits below the rail (`:653-657`) in a
separate paragraph. Merge: `SCREENING · Step 3 of 12` in the sticky rail
itself. Users get section context AND overall progress in one glance,
mono-uppercase, no chrome added.

Also: on Finish, the rail hits 100% before the review screen renders. Add a
50–100ms hold on the width transition so the user sees "complete" before the
route swaps.

---

## Copy at friction moments

The gate-trip block panel at `:866-877` — `ShieldAlert` icon +
red-tinted card + `Change your answer above to continue` — reads as a wall
right now. In the stacked form it landed at the bottom of the scroll and
felt like a stop sign. In the wizard where the user just tapped one chip,
it appears as an inline modal-below-the-chips. That's actually better — but
the italic caption `Change your answer above to continue.` sits BELOW the
block body which itself is 2–3 sentences long. On a 393px viewport with the
chip row, the label, and this block, the user has to scroll to see the
"how to fix" line. Move it directly under the block title as the second
line, so the fix instruction is co-located with the title.

Also: `Next` button at `:1013-1024` is disabled but has NO visible
`disabled` state beyond `opacity-40`. Add the `title` tooltip content
(`secondaryTitle`, `:991-995`) as a visible mono caption above the footer
when blocked. Users on mobile can't hover to see the tooltip.

---

## Regression from quiet-form

Yes — one asset is lost, one is preserved, one is neutral:

- **Lost: "all safety questions visible at once" trust posture.** Quiet-form
  showed 5 gates stacked; user saw the interrogation shape. Wizard hides it.
  Compensate by (a) naming the arc on step 1 ("5 safety questions before
  we start") and (b) adding a *review-my-answers* affordance on the consent
  step: a collapsible showing the 5 gate answers with edit-jump links.
  Restores the "we've been transparent about all of this" beat before Finish.
- **Preserved: the CSS pictogram + `Why the tiers?` disclosure.** These
  survived the redirect and land well in wizard mode. Do not cut.
- **Neutral: rationale rules from the quiet-form brief.** Wizard gives every
  question its own screen, so the "always visible / collapsible" split is
  moot — every `help` line has room now. Just ship all `help` visible.

---

## What the founder will hate in 24h (if not fixed)

- **Focus is not moved to the new question on step-change.** After clicking
  Next, keyboard focus stays on the Next button. Screen-reader users hear
  nothing about the new question. Add `useEffect` on `stepIndex` change:
  focus the H2 (add `tabIndex={-1}` + `ref`) and announce via a polite
  live-region. Delegate to `app-accessibility`.
- **Scroll position doesn't reset on step change.** If step N is long
  (physical-tests) and user scrolls to the bottom, then Next → step N+1
  begins mid-scroll. Add `window.scrollTo(0, 0)` in the step-change effect.
- **iOS pinch-zoom on the fixed footer** — `<meta viewport>` should already
  handle this at the app shell, but verify no `user-scalable=no` is set.
- **Draft persistence works but `stepIndex` persists too** (`:174-179`). If
  founder ships a schema change adding a new question, returning users
  land at their old `stepIndex` which now points at a different question.
  Add a `steps.length` guard: if `stepIndex > steps.length - 1`, clamp to
  the last unanswered required question. Currently only clamps to
  `steps.length - 1` at `:608`, which lands them at consent even if
  screening changed underneath.
- **The Back link at the very top (`Back to program`, `:634-637`) plus the
  Back button in the footer (`:1000-1009`) is two Backs on one screen** with
  different destinations. Reads confusing. Kill the top link during the
  wizard (or convert it to `Exit intake` mono uppercase, muted, top-right).
- **`Finish` button doesn't have loading state.** `commit()` writes to
  KV; if the user is on a flaky connection, Finish triggers a router push
  immediately with no feedback that anything is happening. The review
  screen already has a `Starting…` state for the commit button
  (`:552-556`); the wizard's Finish needs the same treatment when it lands
  on review.

---

## Delegate-to-specialist

- **Visual craft** → `app-visual-craft`: exact row height, radio-dot
  weight, and border ramp for the new option-row component; final size of
  the inline pictogram (40 vs 48); footer max-width visual close on desktop.
- **Mobile UX** → `app-mobile-ux`: verify option-row height ≥ 52px in
  actual viewport (chin-in-thumb-zone check); safe-area footer padding math
  on notched vs non-notched; verify option rows don't clash with iOS
  reachability mode.
- **Accessibility** → `app-accessibility`: focus management on step change,
  live-region announcement of new question, keyboard operability of the
  option rows (arrow-key nav within a `role="radiogroup"`), tooltip →
  visible caption swap.
- **Copy clarity** → `app-copy-clarity`: consent screen intro line, arc-name
  on step 1 ("5 safety questions before we start"), physical-tests skip
  affordance copy, drop the `→` from Next.

---

## What this audit does NOT solve

- Whether to add per-question video demos on the skill self-report screens.
  Deferred — the founder redirect notes wizard was chosen partly to make
  room for this, but this audit takes it as future work, not this-hour work.
- The review screen's tier-picker interaction (already stacked rows;
  audited only for consistency with the wizard, not re-designed).
- The `duration_days: 3` copy contract — should the wizard tell the user
  "you can pause and come back within 3 days"? Draft persistence supports
  it (`:110-180`) but no UI communicates it. Separate brief.
- Whether Overhead Mobility / Rowing 2K intakes reuse this exact wizard
  shape or introduce variation. Design decision deferred until those
  programs enter the queue.
