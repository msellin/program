# Design-review call — Batches 33-35 verdict + what to do next

Owner: product-design-lead
Written: 2026-08-20
Status: draft — awaiting founder review
Related audits:
- `dev/audits/app/2026-08-19-founder-observations-queue.md` (O1-O21)
- `dev/audits/app/2026-08-20-visual-refresh-brief.md` (the 8-move brief that drove Batches 33/34/35)
- `dev/audits/app/2026-08-20-post-ship-design-lead.md` (my prior four-decision brief — this is the honest self-assessment)
- `dev/audits/app/2026-08-19-master-task-list.md` §G Rejected (HARD CONSTRAINT)
- Fresh persona artifacts 2026-08-20 mtime — `persona-strength/mobile/01-today.png`, `persona-recover/mobile/01-today.png`, `persona-multitrack/mobile/01-today.png`

Blocks: Batch 36 shape, any UI-visible commit, S3 (billing).

---

## Executive verdict

**Stop shipping. Design first, code second.** Batches 33-35 shipped every move in the visual-refresh brief and the founder still sees "1995." The problem is not that the moves were wrong — the problem is that the moves were **tokens and primitives**, not **compositions**. Adding a surface-2 token, a bronze CTA affordance, and a sparkline component doesn't change what a screen looks like if the *arrangement* of the screen is still "stack of equal-weight bordered rectangles with the primary action buried below the fold." Founder is right — this can't be fixed by another polish batch, and no combination of specialist auditor agents will fix it, because none of them own composition.

The next unit of work is not a batch. It is a **mockup batch**: Stitch mockups of Today, Session, and Programs, produced *before code*, approved by the founder against a written aesthetic north-star, then implemented in a single hero-surface push. The persona-harness screenshot diff is retired as the success gate — it measures "did the pixels change?" not "does it feel modern?" Replace it with founder-approved mockup parity.

**Recommendation in one sentence:** pause all UI-visible commits, produce three Stitch mockups (Today, Session, Programs preview), get founder written approval, then implement Today only as the benchmark surface.

---

# Call 1 — What went wrong with Batches 33-35

Honest self-assessment. My prior brief (`2026-08-20-post-ship-design-lead.md`) recommended shipping the visual-craft brief as three batches with a persona-harness gate. Founder followed it. Founder verdict is that it didn't move the needle. Here is what I missed, ranked by causal weight.

## 1.1 The moves were correct in isolation and wrong in aggregate

Every move in `2026-08-20-visual-refresh-brief.md` was individually defensible. Surface-2 token, bronze CTA elevation, typography bump, motion vocabulary, sparklines, DashboardBlock accent stripes, 14-day readiness trail, shadow-and-line depth — each of these is a real move you can point to in Linear, Vercel, Whoop, Garmin, or Runna. All eight of them together on the *same page layout* still produce a stack of bordered rectangles, because the page layout itself was never the subject of the brief. The layout is "vertical scroll of full-width cards with equal visual weight," and no amount of token polish rewrites that.

Look at the persona-strength fresh capture. Header (TERAV + settings). H1 "Thursday 20 Aug" 32 px. DateNav card. Bronze-tinted proposal card ("Room to push"). Big vertical gap. "No check yet" hero card. Sticky Apply Bump / Ignore action bar bisecting the screen. Workout summary DashboardBlock (the *primary object*) partially visible below the sticky bar. Bottom nav. That's the composition. Bumping the block-title from 16 to 18 px does not fix the fact that the load-bearing block is below the fold on a 393 × 852 device.

Persona-multitrack is worse: the workout summary reads "1 block · 0 exercises" — the *headline* on the primary block is a null-content string, because multitrack has one program with a session skeleton and one with nothing yet. The DashboardBlock primitive doesn't know how to represent that; it just renders the count. No token bump saves a card whose headline is "0 exercises."

**What I should have specified:** a composition-level design for Today (dashboard vs. session-inline), with the DashboardBlock primitive as the low-level ingredient. Instead I specified the ingredient and let the composition inherit from whatever `TodaySession.tsx:481-577` was already doing. That was the miss.

## 1.2 Wrong sequencing — typography can't lift the feel until layout is right

Batch 34 (typography + motion) was the middle batch of three, but typography is the *last* thing you polish, not the second. A 4 pt gap between block-title and body only reads as hierarchy if there is a hero object, a supporting object, and a detail object. On Today there are five near-equal objects — proposal, morning check, workout summary, extras, run-slot. Type-scale on five equal objects is five objects at five sizes; no visual pull toward any of them. Typography is a **finishing** move; it needs a **skeleton** to finish. Batches 33-35 never authored a skeleton.

## 1.3 Right execution, wrong benchmark

The persona-harness screenshot diff was my proposed success gate. That gate measures pixel change, not perception change. If I ship a 32 → 40 px H1 bump the diff is 100 % green, and it can still read as 1995 to the founder. The screenshot diff is a *regression* gate (did we break something), not a *quality* gate (did we improve something). I asked it to be both. It can't be.

The founder's own words were the gate we needed: *"like full design review."* We should have run a founder pre-approval on a static mockup before writing a single line of TSX. That is the process gap.

## 1.4 What I got right

- Rejecting the score-donut variant of Move 7 (14-day dot trail instead) — R8 held.
- Rejecting inline logging on Today (Call 2) — confirm-first held.
- Not moving to S3 billing — monetizing the "meh" version would have compounded the perception problem.
- Rejecting a 3-column dashboard restructure — mobile-first single-column rhythm held.

The strategic calls in the prior brief hold. The tactical call (ship the visual brief as three batches with a screenshot-diff gate) was wrong.

---

# Call 2 — Redesign, overhaul, or design-first?

## The call

**Option (d) — Design first (Stitch mockups + founder approval) THEN implement.** Not (a), not (b), not (c). And the mockup batch is bounded to Today, Session, and Programs preview only. The rest of the app inherits the language, doesn't get a mockup.

## Why not (a) — continue with more polish moves

Batches 33-35 already exhausted the polish budget. There are no more tokens to introduce that don't violate the rejected list. If I recommend Batch 36 polish it will be: bigger H1 (already at R3 ceiling of 32), more motion (already have the vocabulary shipped), more color (violates R2), photography (violates R1), streaks (violates R5), score donut (violates R8). We've spent the levers we have. Further polish IS the drip-of-small-PRs failure mode I already named and rejected in the prior brief.

## Why not (b) — bounded redesign of one hero surface (code-first)

Tempting because it's what Julie Zhuo would call "the ship-something-real bias." Ship a redesigned Today, benchmark it, iterate. Two problems:

1. **We already tried this shape.** Batches 33-35 were bounded to Today + Programs + Session. The founder walked those surfaces. Verdict was 1995. Doing another bounded push code-first repeats the same experiment with the same variables.
2. **The composition is what's wrong.** Composition changes are cheap in Figma/Stitch (drag rectangles) and expensive in code (Zustand selectors, plan-generator wiring, motion budgets, persona artifacts). Discovering the composition is wrong *after* implementing it is the exact failure mode of Batches 33-35.

Bounded code-first redesign spends 20-30h of engineering on a composition that isn't approved. Reject.

## Why not (c) — full app redesign under a "Terav 2026" pass

30h of new tokens + new components + cross-app rollout is the honest cost estimate. Three problems:

1. **Scope inflation risk.** "New design system" always drifts to 60h. Ryan Singer's rule: appetite decides scope; scope does not decide quality. A 30h appetite for a full-system pass is not enough to actually change the system, so it becomes 60h, then 90, then abandoned.
2. **Nothing is wrong with the tokens.** `#0E0F12` warm-dark ground, `#C89666` bronze accent, `#79B8C4` slate secondary — these are the correct palette. Batch 33 already added surface-2. The tokens are fine. Redoing them is redoing work that isn't broken.
3. **What's actually broken** — composition — is a surface-by-surface problem, not a system-wide problem. Progress can inherit whatever Today's new composition proves; History can inherit that too; Profile is already fine (it's a list; lists are hard to get wrong).

Full system pass is a 30h answer to a 10h question. Reject.

## Why (d) — design first

Three qualifying arguments:

1. **The founder said so.** Verbatim: *"maybe do a proper deep research and design some visuals, use google stitch or something."* When the founder tells you the process is wrong, the process is wrong. Continuing to code first is disrespect for their read on the product.
2. **Composition problems live in composition tools.** Stitch mockups let us produce and iterate on 4-6 candidate compositions of Today in the time it takes to code one. Bill Buxton's rule holds: sketch alternatives before committing. Batches 33-35 committed before sketching.
3. **Stitch access exists** (`mcp__stitch__*` tools). We already have the tool. The failure was not tool availability; it was process. Formalize the process.

**Cost:** ~3h of mockup work + founder review + ~15-20h implementation on the approved composition. Total appetite 20h across two work-sessions. Compare to another failed batch cycle of 12h + zero perception delta.

**Trade-off named:** design-first delays shipping. Founder is a fast-ship builder; asking them to wait for mockup approval is a culture friction. Counter-argument: they *already* waited three ship cycles (Batches 33, 34, 35) and the perception didn't move. Two more days for a mockup pass is cheaper than three more failed batches.

**Rejected counter-argument to (d):** *"mockups don't respect state — production reality diverges from the mockup."* True in the abstract, false here. Terav's state variance on Today has three modes: session-scheduled, session-empty, multi-track. Stitch can mock all three side by side. If the mockups can't hold up against those three states, the composition is wrong and we discover that in Stitch, not in code.

---

# Call 3 — Mockup batch scope

## The ranking — changing this changes perceived quality most

Ranked by "if a first-time visitor sees this surface at fresh-signup, does the app read as modern?"

1. **Today (dashboard mode)** — 100 % of authenticated sessions land here. It's the first-impression surface *daily*, not just at signup. If Today is 1995, the app is 1995. **Highest impact.**
2. **Session view** — Where the user does the actual work. If Today is the storefront, Session is the workshop. Founder said Session "seems just a duplicate of what today page was — this wasn't the idea behind it at all." That's a composition problem, and it's the second-most-viewed surface after Today.
3. **Programs preview page** — The trust surface. Where a user decides to *start a program*. It's the conversion moment. Currently a vertical stack of prose blocks (O9). Bumping it doesn't help daily usage but does help onboarding conversion, which matters as beta signups start.
4. **Progress** — Second-tier importance; users check it weekly not daily.
5. **Settings, Profile, Check** — Supporting. Get right by inheritance, not by mockup.

## The pick — top 3: Today, Session, Programs preview

Three mockups. One per surface. Each carries one representative state:
- **Today**: multi-track with one active session + one paused track (the persona-strength composition that fails today).
- **Session**: full session with 3 blocks, ~10 exercises, one block completed, one active, one upcoming.
- **Programs preview**: First Strict Pull-Up (mid-complexity — has who-this-is-for, adaptive card, phase list).

Progress + rest of the app inherit the language from these three. If Today's composition proves out a hero-block pattern with a specific typographic ramp and a specific density rhythm, Progress inherits the same rhythm without needing its own mockup.

## The Stitch prompts

Written to Terav's design constraints: warm-dark `#0E0F12` ground, `#16181c` surface, `#20232a` surface-2, bronze `#C89666` accent, slate `#79B8C4` secondary, muted `#8b8f98`. Font stack Inter + JetBrains Mono for numerics. No photography. No streak counters. No score donut. iPhone 393 × 852 viewport.

### Prompt 1 — Today (dashboard mode)

> Mobile-first fitness app dashboard, warm-dark theme, 393px wide iPhone viewport. Background `#0E0F12` warm-dark, base card `#16181c`, elevated card `#20232a`, primary accent bronze `#C89666`, secondary slate `#79B8C4`, muted text `#8b8f98`. Inter font, JetBrains Mono for numerals only. Layout top-to-bottom: (1) TERAV wordmark small mono-caps left, settings gear icon right, 44px header. (2) Compact 14-day readiness dot row inline with today's state — "GREEN · progress load" label plus 14 small colored dots showing state history, no calendar frame. (3) HERO PRIMARY BLOCK — the workout summary, `#20232a` elevated surface, 4px left bronze accent stripe, small subtle shadow. Inside: mono-caps eyebrow "TODAY · CONCURRENT STRENGTH", 24px semibold title "Rebuild + evaluate — week 3", 32px JetBrains Mono hero metric "48 min · 3 blocks", 14px muted phase caption, three block-name rows with 12px subtle icons, single bronze filled CTA "Open session →" with soft inset highlight for physical-button feel. (4) SECOND BLOCK — extras summary, `#16181c` base surface (visually lower tier), same 4px slate accent stripe, muted "6 drills available" numeric, tap chevron, no CTA. (5) Optional AMBER proposal card inline above the hero (if a suggestion is pending) with sentence-case Accept + Ignore buttons — bronze filled + neutral outline; NOT a sticky bar. (6) 60px bottom nav — 5 tabs with 22px lucide icons + 10px mono-caps labels. Focus on hierarchy: the hero block is visibly the largest, most elevated, most-accented object; extras is visibly secondary; readiness dots are ambient. No photography, no streaks, no score donut, no gradient washes. Studious, coach-like, technical-quiet. Reference visual language: Linear + Whoop dark + Anthropic console.

### Prompt 2 — Session view (the workshop)

> Mobile fitness session detail, warm-dark theme, 393px iPhone. Same palette as Today (`#0E0F12` ground, `#16181c` surface, `#20232a` elevated, bronze `#C89666`). Layout: (1) 44px top bar with left arrow back button + centered session title "Rebuild + evaluate" small mono-caps + right timer icon showing elapsed time in JetBrains Mono. (2) Sticky sub-header with three block chips as a horizontal segmented control — "SCAP LADDER" (completed, slate filled with checkmark), "SHOULDER PREP" (active, bronze outline), "ROW STRENGTH" (upcoming, muted outline). Tapping a chip scrolls to the block. (3) Content — the active block, rendered as a large elevated `#20232a` card with a 4px bronze left stripe: block name 20px semibold, one-line intent caption 14px muted, then three exercise rows. Each exercise row is a compact `#16181c` inner card (not full-bleed), showing exercise name 16px, prescribed sets in JetBrains Mono at 18px "3 × 8 @ RPE 7", one-tap set-tick checkboxes as a horizontal row of 3 pill-shaped buttons, an optional "add note" ghost affordance. Between blocks, a subtle 12px muted "◇ break • 60s" divider — no card, just a small rest marker. (4) Bottom sticky action row — single bronze filled primary CTA "Complete block →" that appears only when the current block's exercises are all logged. Focus: this must NOT look like Today — different information density, different rhythm. The eye should immediately know "I am in the doing screen, not the planning screen." No decorative imagery. Reference: Hevy's active workout screen (compact set rows) crossed with Linear's issue detail (elevated primary content on darker ground).

### Prompt 3 — Program preview (First Strict Pull-Up)

> Mobile program detail page, warm-dark theme, 393px iPhone. Palette same. Layout: (1) 44px top bar with back arrow, small mono-caps "STRENGTH · SKILL" category chip in slate. (2) HERO — 32px semibold program title "First strict pull-up", one-line 14px muted lede caption. Below the title, a horizontal row of three JetBrains Mono numeric stats each with small mono-caps eyebrow: "8-12 WEEKS · DURATION" / "3-4 HRS · PER WEEK" / "REFERENCED · STATUS". No image, no illustration. (3) VISUAL LEVEL LADDER — a horizontal 4-step chain "Hang → Assisted → First rep → Volume" rendered as pill-connected nodes with a bronze filled node marking the entry level. Small, subtle, informational — not decorative. (4) TWO ELEVATED `#20232a` CARDS side-by-side (or stacked if too tight) — "Who this is for" and "What you'll achieve" — each ~140px tall, with a small icon at top-left and 3-line prose body. These are the load-bearing decision content, so they get visual priority over the phase list. (5) A single wider elevated `#20232a` card "How this adapts to you" with a 4px bronze left stripe — one paragraph on adaptive engine, one small "cites Rhea 2003" pill link. (6) A subtle muted "Baseline setup" row (16px + secondary text) that reads as a checklist item — not a hero card. (7) A `Program shape (peek inside)` collapsible with a small chevron — collapsed by default. (8) STICKY BOTTOM — bronze filled CTA "Make this my focus →" full-width with soft inset shadow. Focus: hierarchy must escalate the who/what/adaptive content and demote the phase list. No photography. No hero image. Reference: Anthropic console pricing pages (numeric-forward hero stats, elevated content cards on darker ground), Linear roadmap pages.

## Not in the mockup batch

- Progress, History, Profile, Settings, Check, Extras, Report, Events, Guide, Evidence — inherit from the three heros. If the language holds, we don't need to mock the rest.
- Motion — Stitch is static. Motion tokens live in the visual-craft brief and are already shipped; they get reused on the new composition without re-authoring.
- Copy — mockups use placeholder-quality strings; `app-copy-clarity` refines strings during implementation.

**Cost:** ~2h to generate + iterate 3 mockups. ~1h founder review. **3h total** before any implementation begins.

---

# Call 4 — The design-review-first protocol

Formalize what triggers a design-first review, who approves, and how mockups feed the master task list. This is the process founder said we need.

## 4.1 What triggers a "design-first" review

A design-first review is REQUIRED before code ships if the change is any of:

1. **Any change to Today, Session, Programs preview, or Progress.** These are the four "hero surfaces" — quality of the app is largely their quality.
2. **Any change that touches typography or motion tokens.** Ramp changes and motion vocabulary changes ripple across the app; they need a composed preview.
3. **Any new top-level route or bottom-nav tab.** IA changes are inherently composition changes.
4. **Any change that touches ≥ 3 files under `next-app/src/components/`.** Rule of thumb: if a diff spans three components, it's a composition, not a component.
5. **Any change that a specialist audit agent flags as "visual-craft" or "product-design-lead" scope.**

A design-first review is NOT required for:

- Bug fixes (visual or logical) that restore a previously-shipped design.
- Copy changes.
- A11y fixes (ARIA, focus order, contrast bumps within an existing token).
- Backend / engine / adapt-rule changes.
- Single-component changes that don't alter the component's outer shape or hierarchy signaling.
- Landing changes (landing has its own conversion-strategist).

**Rule of thumb:** if you cannot commit the change without also updating a persona artifact, it needed a design review first.

## 4.2 Who approves before code ships

Two-signature protocol:

1. **Product-design-lead (this agent)** produces the mockup brief with Stitch mockups + written aesthetic north-star + explicit R-list compliance check. Delivered as a `dev/design-briefs/YYYY-MM-DD-{decision-slug}.md` file.
2. **Founder** signs off with an explicit "approved" comment in the brief file (edit the "Status" line from `draft` to `approved YYYY-MM-DD`). No signature, no ship.

If founder is not available for sign-off within 48h of brief delivery, the default is **not** to ship. Wait, not proceed. This is the deliberate-ship discipline that fast-ship failed to enforce.

## 4.3 How Stitch mockups + founder approval feed the master task list

**Current flow:** master-task-list has ~110 items across P0/P1/P2/F/S buckets. Items get pulled into batches ad-hoc based on the ship-fast rhythm.

**New flow for design-scope items:**

1. Item is identified (audit, founder observation, or design-lead call).
2. If item touches a hero surface (§4.1 triggers), item is marked `needs-mockup` in the master list.
3. Product-design-lead produces `dev/design-briefs/YYYY-MM-DD-{slug}.md` with Stitch mockups + aesthetic north-star + R-list check + implementation-notes.
4. Founder reviews. Approves in the brief file itself.
5. Once approved, item flips to `mockup-approved` in the master list. Only then does implementation start.
6. Implementation follows the mockup — visual-craft + mobile-ux + a11y + motion-perf + copy-clarity agents review the *implementation* against the *mockup*, not against the persona artifact.
7. After implementation, persona-harness regenerates. Persona-harness now serves *regression* detection, not quality-gate. If the artifact matches the mockup, ship. If not, iterate on implementation, not on mockup.

## 4.4 The success criterion — what replaces the persona-harness screenshot diff

**Retire:** persona-harness screenshot diff as a quality gate. It stays as a regression gate — if a persona changes from pre-approved artifact by more than a bounded pixel-delta, engineering flags it. That's the only job the diff does now.

**Adopt:** **mockup parity** as the quality gate. The founder-approved Stitch mockup IS the specification. Implementation is graded against the mockup by three questions:

1. **Composition parity:** does the implemented persona artifact have the same block hierarchy, ordering, and density as the mockup?
2. **Typographic parity:** does the ramp (H1, block-title, section-h2, body, mono-caps, hero-metric) match the mockup within ±1 px per tier?
3. **Chromatic parity:** does the elevation (surface, surface-2), accent (bronze, slate), and stripe treatment match the mockup?

If all three pass, ship. If any fails, that failure is a bug against the mockup and gets a bug ID against the implementation batch, not a re-audit of the design decision.

**Why this works:** it separates "did the designer make the right call" (mockup approval) from "did engineering execute the call" (mockup parity). Batches 33-35 conflated these — the persona-harness diff can't tell them apart, so failure was interpreted as either. Now failure has a clear ownership axis.

## 4.5 What "make X nicer" means going forward

When founder says "make X nicer" (or the 2026-08-20 equivalent, "make it actually pretty"):

1. Product-design-lead identifies the composition scope. Not "which tokens to bump," but "which surface's composition is failing."
2. Produce a Stitch mockup for the *smallest* surface that carries the composition problem — usually one hero surface.
3. Include in the mockup brief a written **aesthetic north-star**: 3-4 sentences describing what "nicer" *means*, in language the founder can agree or disagree with. E.g. "hero surface should read as *studious and confident*, like Anthropic's console — one primary object per view, numeric-forward, elevated on a darker ground, one accent color, no motion decoration."
4. Founder signs off on the north-star + mockup together. This closes the "we didn't know what nicer meant" gap that killed Batches 33-35.
5. Implement to the mockup. Grade to parity. Ship.

This protocol WILL be slower than fast-ship. That is intentional. Fast-ship produced 1995 in three cycles.

---

# What this decision does NOT solve

- **Whether the Stitch mockups will be good enough.** I have Stitch access but not a guarantee that a first-pass mockup lands right. Founder should reserve at least one iteration cycle on each mockup.
- **The Session-view "duplicates Today" problem structurally.** The mockup will propose a solution (different density, different block-chip nav, different sticky pattern) but the actual composition question — "what makes Session Session, not Today" — is a real product-design question. My proposed answer in the Stitch prompt is: **Session = doing (elapsed timer, block-progress, set-ticks, sticky Complete)**, **Today = planning (readiness, hero summary, extras)**. If the founder doesn't agree with that framing, the Session mockup needs to iterate on the *framing*, not the pixels.
- **S3 billing.** Still deferred until Batch 36 (post-mockup implementation) lands and beta users see the refreshed app.
- **F5 correlation view.** Still data-gated. Defer.
- **Light theme, i18n, sound settings.** Placeholder items in Settings, still deferred.
- **Whether Progress needs its own mockup.** I'm betting inheritance from Today's mockup is enough. If it isn't, add a Progress mockup as a follow-on.

---

# Estimated cost

- **Stitch mockup batch (Call 3):** ~3h (2h generation + 1h founder review + iteration budget).
- **Implementation of approved Today composition (Batch 36):** ~15h (composition changes, DashboardBlock v2 with hero variant, HeroStateCard replacement with dot trail, sticky-proposal-bar redesign — the founder-hostile sticky Apply/Ignore has to move — inline session block-list, etc.). Medium-high confidence.
- **Implementation of Session redesign (Batch 37):** ~12h if the mockup is approved.
- **Implementation of Programs-preview redesign (Batch 38):** ~10h.

**Total appetite for the design-first cycle: ~40h across 4 shippable batches.** Compare to the 12h/batch × 3 = 36h already spent on Batches 33-35 with zero perception delta. Same order of magnitude, delivered against an approved specification rather than an unwritten one.

---

# The three files that need to exist next

1. **`dev/design-briefs/2026-08-21-today-hero-composition.md`** — Stitch mockup + aesthetic north-star for Today. Produced by product-design-lead. Signed by founder.
2. **`dev/design-briefs/2026-08-21-session-workshop-composition.md`** — Stitch mockup + aesthetic north-star for Session. Signed by founder.
3. **`dev/design-briefs/2026-08-21-program-preview-composition.md`** — Stitch mockup + aesthetic north-star for Programs preview. Signed by founder.

No code ships until at least brief #1 is signed. That is the protocol.

---

## One-paragraph summary

The last three batches shipped every polish move the visual-craft brief specified, and the founder still reads the app as 1995. That is because polish is not the layer that decides perceived modernity — composition is. Composition problems live in Stitch, not in a persona-harness screenshot diff. Pause code, produce three mockups (Today, Session, Programs preview), get founder signature on each, then implement against approved specifications. Retire the screenshot diff as a quality gate; it stays only as a regression detector. Replace it with mockup parity. Formalize a design-review-first protocol so future "make X nicer" asks flow through mockup → approval → implementation → parity check, not observation → batch → ship → founder-sighs → repeat. Fast-ship failed here; deliberate-ship is the correction. Ship the mockup brief first.
