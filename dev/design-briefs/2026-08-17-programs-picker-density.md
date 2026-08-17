# Programs picker — card density call

Owner: product-design-lead
Written: 2026-08-17
Status: draft — awaiting founder review
Related audits:
- `dev/audits/landing/2026-08-17-positioning-focused-vs-full-plan.md`
- `dev/audits/session-2026-08-17/app-landing-alignment.md`
Blocks: none. Blocked by: none — additive card refactor, no schema change required.

---

## The call

**Collapse the card to name + status chips + one-line pitch + one metadata row (duration · load); move levels, `adapts`, prerequisite flag, and `positioning: side_track` to the preview. Keep the two-level IA (chips → grouped sections → cards). Do not go to single-word tiles — that kills the honesty premise Terav is built on.**

**Why (three-line summary):**
- Today's card is doing the preview's job — six informational rows on a browse surface where the reader is scanning for match, not committing to a program.
- Terav's honesty edge is preserved by *one* concrete dose line ("8 wk · ~4-5 hr/week") — the second metadata line, the levels chain, and the `adapts` sentence are all *proof of tailoring* that belongs one tap deeper, when the reader has decided this program might be their focus.
- The category-grouped list (not a flat scroll, not tiles) is the right IA: five programs across five categories is small enough for grouping to read as *curation*, big enough that a flat list would collapse hierarchy.

---

## The problem

The `/programs` page today carries six informational registers per card: (1) name, (2) status chips (PROVISIONAL / active / personal), (3) one-line pitch, (4) `levels[]` progression chain, (5) `adapts` italic sentence, (6) metadata row (weeks · difficulty · load · prereq flag). On Handstand Walk that stacks to a card ~180px tall. Across five to eight visible programs on a 393px viewport, the reader is asked to parse ~35 informational atoms before making a picking decision. That is a preview page rendered as a list item.

The founder's observation is right: the cards feel dense. But the fast fix — reduce to name + one line, like competitors ship — throws out the differentiator. Terav's landing promise, drafted in the positioning audit (`dev/audits/landing/2026-08-17-positioning-focused-vs-full-plan.md`), is *honest scope*. Every program declares dose ("~4-5 hr/week"), prerequisites, and provisional status upfront. A user picking Handstand Walk without wrist tolerance wastes 8 weeks. A user picking Concurrent-Strength Maintenance without knowing it's 5 hours a week signs up for something they can't sustain. Density has a job.

The correct question is not *how much* to strip but *which register does what*. There are two jobs on a picker page:

1. **Scanning job.** Reader wants to answer "is this program relevant to me at all?" in ~2 seconds per card. Answered by: name, one-line pitch, category grouping, dose (hrs/week), duration (weeks). That's it.
2. **Vetting job.** Reader wants to answer "am I qualified to run this? does it match my level? does it adapt?" Answered by: levels, prerequisites, `adapts` sentence, `positioning: side_track`, `intake picks your tier` note. All five belong to the preview page (`ProgramPreviewClient`) — they exist to be read once, when the reader is committing.

The `ProgramCard` today conflates 1 and 2. Everything below the fold on the card is doing job 2 on a surface where job 1 is the only ask. The fix is to give job 1 the whole card and route job 2 through the tap.

Future-scenario proofing this design has to handle:
- A sixth program lands (Hyrox arc) — the current 5-programs-in-5-categories layout must still read as curation, not clutter.
- A user with 15 dismissed proposals lands here (persona-erratic) — the surface must not compete with Today's noise; it should feel like a *decision* place, not a *browse* place.
- A rehab-first user (persona-recover) morning-sensitive — must not accidentally surface the personal `anterior-hip-rebuild` (already handled by `personal: true` filter at `programs/page.tsx:39`), must telegraph "beta" honestly.
- Screen-reader user — the metadata row must have list semantics or a labelled dot separator, not naked `·` characters that read as "middle dot" out loud.
- Reduced-motion user — no card hover animation dependency for meaning.
- Desktop viewport — five cards in a single column feel starved on 1440px; the design should gracefully accept a two-column grid at ≥768px without regressing mobile.

---

## Options considered

### Option A — Terse tiles (the founder's competitor reference)
- **Shape:** Name + one chip. Preview holds everything else. Cards ~56px tall, four visible per screen.
- **Sketch:**
```
+---------------------------------+
| Handstand Walk       [prov] >   |
+---------------------------------+
| Overhead Mobility    [prov] >   |
+---------------------------------+
| Engine Builder — B1  [prov] >   |
+---------------------------------+
```
- **Pros:** Extremely scannable. Matches Nike Training Club's per-program tile pattern. Founder gets what he asked for.
- **Cons:** Kills the honesty differentiator on the surface that needs it most. A user picks "Concurrent-Strength Maintenance" without seeing "~4-5 hr/week" and bounces after week 2. Terav's peer set (per positioning audit §4) is Whoop / Runna / Squat University — all of which name the scope on the tile, not just the noun. Also collapses the category grouping to a flat scroll list, which we don't need — five programs across five categories is exactly the right size for a grouped IA.
- **Verdict:** Rejected. Fast option that misreads the brand.

### Option B — Expandable card with chevron (progressive disclosure via inline expand)
- **Shape:** Compact card by default (name, chips, one-line, duration + load). Chevron rotates on tap → card grows in place to reveal levels chain, `adapts`, prereq bullet. Second tap on the card body routes to preview.
- **Sketch:**
```
+---------------------------------+                +---------------------------------+
| Handstand Walk       [prov]     |     tap →      | Handstand Walk       [prov]  ^  |
| Multi-tiered handstand walk pr… |                | Multi-tiered handstand walk pr… |
| 8 wk · ~1.5-2 hr/week         v |                | 8 wk · ~1.5-2 hr/week           |
+---------------------------------+                | ────────────────────────────    |
                                                    | Foundation → Wall → Freestand   |
                                                    | Intake picks your tier; drills… |
                                                    | Read full brief →               |
                                                    +---------------------------------+
```
- **Pros:** Reader controls disclosure. Feels crafted.
- **Cons:** Two interactions for one decision (expand, then commit) is exactly the double-tap penalty Rauno's patterns exist to avoid. The preview page already IS the disclosure layer — building a second one inside the list is a fetish, not a solution. Also breaks Link semantics: is the card a link or a disclosure? Every affordance ambiguity costs a beat of trust.
- **Verdict:** Rejected. Over-engineered. If the vetting job needs more space, that's what the preview is for.

### Option C — Compact card, two-level IA preserved, vetting fields moved to preview (the winner)
- **Shape:** Card carries name + chips + one-line pitch + one metadata row (`8 wk · ~4-5 hr/week`). Nothing else. Preview page absorbs `levels[]`, `adapts`, `positioning: side_track` badge, and the `requires prereq` amber flag (rendered as a stronger banner inside preview, not as a bare word on the card).
- **Sketch:** see full wireframe below.
- **Pros:** Preserves the two-level IA (chips → sections → cards) that gives five programs the *feel of curation*. Halves card height. Keeps the *dose* line — the one honesty atom that must survive on the browse surface. Every removed field has a natural home one tap deeper.
- **Cons:** The `requires prereq` amber flag no longer catches the eye on the browse page. Mitigation: on preview, the prereq section is already an amber-bordered card (`ProgramPreviewClient.tsx:245-257`) — the warning is louder in context, and it's fired at the moment the user is about to commit.
- **Verdict:** Winner.

---

## Chosen: Option C — Compact card, vetting moves to preview

### Full wireframe (393px mobile)

```
+─ 393px ─────────────────────────────────────+
| TERAV                     [☰][⚕][⋮]         |
|                                              |
| Pick your focus.                             |
| Each program is one focus arc — an engine,   |
| a skill, a lift, a stubborn joint. The rest  |
| of your week stays yours.                    |
|                                              |
| PROVISIONAL = beta, not clinically reviewed. |
|                                              |
| (All) Strength  Gym&skill  Engine  HYROX  L/R|
|                                              |
| ▮ Strength · 1                               |
| ─────────────────────────────────────────    |
| ┌──────────────────────────────────────────┐ |
| │ Concurrent-Strength Maint.  [prov]    >  │ |
| │ For lifters adding cardio without losing │ |
| │ the squat. Cost bounded, cited, PR-      │ |
| │ banned.                                  │ |
| │ 8 wk · ~4-5 hr/week                      │ |
| └──────────────────────────────────────────┘ |
|                                              |
| △ Gymnastics & skill · 2                     |
| ─────────────────────────────────────────    |
| ┌──────────────────────────────────────────┐ |
| │ Handstand Walk              [prov]    >  │ |
| │ Multi-tiered handstand walk program from │ |
| │ wall-supported beginner to advanced turns│ |
| │ 8 wk · ~1.5-2 hr/week                    │ |
| └──────────────────────────────────────────┘ |
| ┌──────────────────────────────────────────┐ |
| │ Overhead Mobility           [prov]    >  │ |
| │ Shoulder + thoracic + scap sequence for  │ |
| │ stronger snatch, OHS, and press.         │ |
| │ 10 wk · ~90 min/week                     │ |
| └──────────────────────────────────────────┘ |
|                                              |
| ○ Engine & endurance · 2                     |
| ─────────────────────────────────────────    |
| ┌──────────────────────────────────────────┐ |
| │ Engine Builder — Block 1    [prov] [★] > │ |
| │ Block 1 of a 3-block, ~6-month engine    │ |
| │ transformation. Eight weeks of Zone 1/2  │ |
| │ base.                                    │ |
| │ 8 wk · ~3-4 hr/week                      │ |
| └──────────────────────────────────────────┘ |
|                                              |
| [ TODAY  WEEK  PROGRESS  HISTORY  PROFILE ]  |
+──────────────────────────────────────────────+
```

Card height goes from ~180px (Handstand Walk today) to ~110px. Five cards fit above the fold on a 393×852 viewport instead of three. The one-line pitch is allowed to wrap to two lines but not three — enforce with `line-clamp-2` on the description.

Featured programs (currently just Engine Builder — Block 1) get a subtle star or "featured" pin in the chip row. Do NOT reorder to promote featured — the category grouping is the primary IA, and Engine Builder is already the only endurance program the reader will see.

### Cross-persona coherence check

| Persona | State | Does the design hold? | Notes |
|---------|-------|-----------------------|-------|
| persona-recover | Rehab, morning symptomatic, browsing for something gentle | y | `anterior-hip-rebuild` is filtered out (`personal: true`); mobility cards read as low-load (`~90 min/week`). PROVISIONAL chip is honest. |
| persona-strength | Overperformer, cycle-end, wants to layer strength on engine | y | Sees Concurrent-Strength Maintenance dose upfront (`~4-5 hr/week`). Prereq gate on preview page catches him if he's underprepared. Does lose the amber `requires prereq` browse hint — accepted tradeoff. |
| persona-erratic | 15 dismissals, life-load noisy, considering starting fresh | y | Compact cards feel less demanding than dense ones. Fewer atoms per card = less friction to decide. Five programs across five sections still reads as *curation*, not a store. |

### Modern-standard checks

- **iOS HIG:** Cards are 44px+ tap targets (`min-h-[110px]`), chevron affords route change semantically. Chips row uses `min-h-[36px]` per current impl — passes 44px if we bump padding one step. → delegate to `app-mobile-ux`.
- **Material 3:** Category divider uses a state-layer opacity when a card is pressed (existing hover pattern extends to `active:` state). Motion is only route transition, no bespoke card motion. Pass.
- **Refactoring UI:** One accent per card (bronze border-left for strength, slate for skill, green for endurance, amber for HYROX). Status chips are the only color inside the card — pitch text is muted, dose text is mono-muted. Accent economy holds. Pass.
- **`prefers-reduced-motion`:** No card-level motion. Category headers do not animate. Pass by default.
- **Fitts's law:** Primary action = tap the card = ~180-400px from thumb cradle depending on card position. Chevron is decorative-only — the whole card is the target, per existing `<Link>` wrapping pattern. Pass.

---

## What stays on the list card / what moves to preview — field-by-field call

| Field (source) | Card today | Card proposed | Preview today | Preview proposed |
|---|---|---|---|---|
| `name` | yes | yes | yes | yes |
| `status: PROVISIONAL` chip | yes | **yes** | yes | yes |
| `isActive` chip | yes | **yes** | yes | yes |
| `personal` chip | yes (but hidden by filter) | keep (defensive) | yes | yes |
| `personal` italic warning paragraph | yes | **remove from card** | yes | yes |
| `short_description` | yes | **yes** (`line-clamp-2`) | yes (as sub) | yes |
| `levels[]` chain (Foundation → Wall → …) | yes | **remove from card** | yes | yes |
| `adapts` italic bronze sentence | yes | **remove from card** | yes (bronze card block) | yes |
| `duration_weeks` (`8 wk`) | yes | **yes** | yes | yes |
| `difficulty` (`intermediate`) | yes | **remove from card** | yes | yes |
| `load_hint` (`~4-5 hr/week`) | yes | **yes** | yes | yes |
| `positioning: side_track` (`layers on any main`) | yes | **remove from card** | no (missing) | **add to preview** |
| `prerequisites?.length` amber `requires prereq` | yes | **remove from card** | yes (full amber block) | yes |
| `featured: true` badge | no | **add as small star in chip row** | no (implicit) | no |

**Net result on card:** 4 registers — name row (with chips), pitch (`line-clamp-2`), metadata row (`{weeks} wk · {load}`), chevron affordance. Nothing else.

**Net result on preview:** absorbs `levels[]`, `adapts` sentence, `positioning: side_track` (new — needs a one-line addition where the metadata row is), `difficulty` (already there), amber prereq block (already there), full `personal` warning (already there).

---

## Data shape changes

**None.** All fields on `ProgramManifestEntry` already exist in `next-app/src/lib/schemas.ts`. This is a rendering-side decision only. No migration.

The only *addition* is a preview-side render for `positioning: side_track` — one string, one conditional, no schema field:

```tsx
// next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx — new block near line 209
{entry.positioning === "side_track" ? (
  <div className="text-[12px] text-slate italic">
    Side track — layers on top of any main program you're running.
  </div>
) : null}
```

---

## Component tree

Current (`next-app/src/app/programs/page.tsx:180-277`):
```
ProgramCard
├── Link (whole card)
│   └── flex row
│       ├── content
│       │   ├── name row (chips inline)
│       │   ├── personal italic warning (conditional)
│       │   ├── short_description
│       │   ├── levels chain (conditional)
│       │   ├── adapts italic (conditional)
│       │   └── metadata row (5 atoms)
│       └── ChevronRight
```

Proposed:
```
ProgramCard
├── Link (whole card)
│   └── flex row
│       ├── content
│       │   ├── name row (chips inline; +featured star)
│       │   ├── short_description (line-clamp-2)
│       │   └── metadata row (2 atoms: {weeks} wk · {load})
│       └── ChevronRight
```

### File-level changes (implementation notes)

- **`next-app/src/app/programs/page.tsx:180-277` (`ProgramCard`)** — Delete lines 221-226 (personal italic warning), lines 228-239 (levels chain), lines 240-244 (`adapts` italic block). In the metadata row (lines 245-271), delete the `difficulty` conditional (247-252), the `positioning: side_track` conditional (259-264), and the `requires prereq` conditional (265-270). Retain only `{p.duration_weeks} wk` and `{p.load_hint}`.
- **`next-app/src/app/programs/page.tsx:197` (name row)** — Add a `featured` star chip conditional after the existing `personal` chip: `{p.featured ? <span className="text-bronze text-[11px]" title="Featured">★</span> : null}`. Keep the visual weight muted — this is a nudge, not a shout.
- **`next-app/src/app/programs/page.tsx:227` (`short_description`)** — Add `line-clamp-2` and `overflow-hidden` to prevent cards from re-inflating on longer pitches (the CSM pitch and Handstand Walk pitch will both hit two lines; that's fine).
- **`next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx:209-225`** — Add a one-line `positioning: side_track` render below the metadata row, using the string above. No other change to preview — the levels, adapts, prereq, and personal warning are already all rendered.
- **`next-app/src/app/programs/page.tsx:85-88` (page sub-header)** — Leave as-is. The "Each program is one focus arc" line already carries the framing; the compact cards below now deliver on it visually.

### Delegate-to-specialist

- **Type scale / palette:** → `app-visual-craft` — verify the compact card's type ramp (name at `text-sm font-semibold`, pitch at `text-[13px]`, meta at `text-[11px] font-mono`) still reads as a three-step hierarchy after the middle rows are removed. May need one nudge on line-height.
- **Ergonomics:** → `app-mobile-ux` — confirm the chip filter row (`min-h-[36px]`) hits 44px total including padding, verify the whole card is a valid tap target at compact height, sanity-check that five compact cards stacked don't create thumb-reach dead zones near the top of the list on 393px.
- **A11y:** → `app-accessibility` — verify metadata row separators (`·`) have `aria-hidden` or the row is a `<dl>`. Confirm the `line-clamp-2` doesn't hide critical info from screen readers (it doesn't — the full string is still in the DOM).
- **Copy:** → `app-copy-clarity` — confirm each program's `short_description` reads honestly in two lines, since `line-clamp-2` will cut anything longer. Handstand Walk (`Multi-tiered handstand walk program from wall-supported beginner to advanced turns and obstacles.`) is right at the edge — may need trimming to `Wall-supported beginner to advanced turns. Personalised to your capability.`

---

## What NOT to do (anti-patterns rejected)

- **Do not go to single-word tiles** ("HSPU", "Handstand Walk"). Founder cited this as a competitor pattern, but Terav is not a movement library. A user picking "Handstand Walk" without seeing "8 wk · ~1.5-2 hr/week" is being sold a movement, not a program. Kills the honesty premise.
- **Do not remove `PROVISIONAL` from the card.** It's a trust-load-bearing chip. Every program is provisional today; the chip is the visible receipt for the intake-page disclosure that these are beta. Remove when the first program flips to stable, not before.
- **Do not remove category grouping.** Five programs across five categories is exactly the size where grouping reads as curation. Flat list on a small catalog collapses hierarchy. If the catalog grows to 20+ programs, revisit.
- **Do not build an inline expand-in-place card** (Option B). Preview page is the disclosure surface — building a second one inside the list item is over-engineering that costs a beat of Link-semantic clarity.
- **Do not add a "quick start" button on the card.** The commit path is preview → intake → start. Shortcutting that on the card bypasses the tier picker and the prereq amber block, both of which the audit found to be essential for the safety-critical case (persona-strength picking CSM without prereq check).
- **Do not remove the `active` chip.** It's the only signal a returning user has that they're already committed to a program. Must stay on both card and preview.
- **Do not compact the category headers.** They're already at `text-[15px]`; going smaller collapses the visual break between sections and the list starts to read as flat.

---

## Migration

Additive on the visible-fields side; subtractive on the card. No data migration.

- Step 1: Land the `ProgramCard` render cut in `programs/page.tsx` — remove the four blocks named above.
- Step 2: Add the `positioning: side_track` line to `ProgramPreviewClient.tsx` so the affordance still lives *somewhere*.
- Step 3: Add `line-clamp-2` to the `short_description` render and QA each program's pitch at 393px to confirm no bad clips.
- Step 4: Add the `featured` star to the name row (single conditional).
- Rollback plan: revert `programs/page.tsx` and `ProgramPreviewClient.tsx` — no schema, no data, no cache to unwind.

Rollout: ship in one commit, on main, no feature flag needed. The change is UI-only on a beta surface.

---

## Peer benchmarks

- **Linear — issue list** (linear.app). Compact rows: title + one-line description + status pill + assignee avatar. Everything else (labels, priority, cycle, project) lives in the detail panel. Steal: the ruthless "list is scanning, detail is committing" split. Reject nothing — this is the pattern.
- **Cal.com — event types list**. Cards carry name + duration + one-line description. Availability, questions, integrations all live inside the event editor. Steal: the *duration* line as the one mandatory scannable atom. Terav's equivalent is `{weeks} wk · {load}`.
- **Runna — training plans picker**. Each plan card carries name, goal ("5K in 20 min"), duration, sessions/week — and nothing else. Detail page holds the rest. Steal: the sessions/week atom (Terav's `load_hint` covers this). Reject: Runna's use of stock-photo cover imagery — Terav is text-first and should stay so.
- **Whoop — journal / stress monitor pickers**. Uses card sections with a "learn more →" chevron, never inline expansion. Steal: category-grouped IA with muted section headers. Terav already does this — the refactor keeps it.
- **Nike Training Club — programs picker**. Terse tiles with cover imagery. This is what the founder saw. Reject for Terav: NTC's tiles are visual because their programs are branded (celebrity trainer, Nike aesthetic). Terav has no such shortcut — words carry the meaning.

---

## What this decision does NOT solve

- **The featured/star treatment is a nudge, not a hierarchy shift.** If Engine Builder should be the *default* recommendation for new users (which the SaaS launch plan implies), the picker needs a "Recommended for you" section above the categories. Deferred to a separate brief.
- **Empty-category messaging tone.** Current copy ("Nothing in this category yet. Try another…") is fine but generic. If the founder wants each empty category to have a one-line "here's what's coming" hint (per persona-recover expecting mobility content), that's a separate copy call — flag for `app-copy-clarity`.
- **Desktop layout at ≥1024px.** The single-column card stack looks starved on desktop. A two-column grid at `md:grid-cols-2` is defensible but not in this brief's scope — the founder's question was mobile density. Ship this brief first; do the desktop grid as a small follow-up.
- **Chip filter overflow.** Once a sixth category populates (HYROX ships), the filter row will wrap to two rows on 393px. Not a problem yet, but the wrap will make the chip row eat more vertical space than intended. Revisit when it happens.
- **The `personal` filter is silent.** Non-owner users don't see `anterior-hip-rebuild` at all. That's correct behavior, but a super-admin viewing the catalog also doesn't see it — worth confirming with the founder whether super-admin should see personal programs in the browse list.
- **`browse and add` vs `pick your focus` H1** — already resolved per the invoker's constraint (H1 is "Pick your focus.", CTA on preview is "Make this my focus"). Not reopened.

---

## Estimated implementation cost

**~1.5-2 hours, high confidence.**

Breakdown:
- `programs/page.tsx` `ProgramCard` render cut: 20 min.
- `line-clamp-2` + `featured` star: 15 min.
- `ProgramPreviewClient.tsx` side_track line addition: 5 min.
- Mobile visual pass at 393px + 375px, verify no card wraps ugly, verify chevron alignment stays put: 30 min.
- One honest re-scan of the full picker with all five programs to confirm the scanning job is cleanly served: 15 min.
- Optional: light copy trim on Handstand Walk's `short_description` if it clips awkwardly: 10 min.

No schema change. No engine change. No test change (persona artifacts are stale per the invoker's note; regenerate is a separate task). Ship on main in one commit.
