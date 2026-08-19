# GOWOD visual system — steal-vs-leave for Terav

Owner: product-design-lead
Written: 2026-08-19
Status: draft — awaiting founder review
Related audits: `dev/audits/app/2026-08-18-profile-design-review.md`, `dev/audits/app/2026-08-18-profile-visual-craft.md`, `dev/audits/app/2026-08-18-mobile-ux-sweep.md`
Screens studied: 11 GOWOD JPEGs in `~/Downloads/` (filenames anchored inline) + 3 Terav screenshots in `~/Desktop/` (Week × 2, Profile × 1)

---

## TL;DR

GOWOD's UI reads "bigger, cleaner" for three reasons that are stealable without photography, without blue, and without a full-plan promise: **oversized H1s that own the header band**, **an identity chip that anchors the top of Profile**, and **generous vertical rhythm inside surface cards** (24–32 px of internal padding, one idea per card). Everything else in GOWOD — the athlete photography, the blue "Let's go" CTA, the Daily/Activate/Recover carousel — is off-brand for a focused-improvement, confirm-first, cite-the-paper product. Steal the *scale, restraint, and single-purpose card discipline*. Reject the photography, the aspirational copy, and the carousel-of-sessions IA.

The single highest-impact move is a **Week-tab redesign** to Runna-style compact rows with tap-to-expand and a small "move" menu. That change alone answers the founder's "too dense and polluted" note and unlocks the multi-track future without ballooning the surface.

---

## 1. What Terav should STEAL — ordered by impact

### 1.1 Oversized H1 that owns the header band (highest impact)

**GOWOD reference:** every screen (`3cd0ec8b`, `5575eaed`, `9316b7dc`) opens with a header band that dedicates ~140 px to just two things — the wordmark centered up top and a single left-aligned H1 (`Dashboard`, `Profile`, `Daily`) at roughly 34–40 px, tight tracking, generous white space below. No subtitle, no chips fighting for attention. It is a **breath** before content.

**Why it works:** it tells the eye "this is where you are, everything below is one topic." Refactoring UI rule 4 (hierarchy through size AND weight): a 34 px semibold H1 next to 13 px muted body creates a hierarchy ratio of ~2.6:1, which reads instantly. Our current Week header at `next-app/src/app/week/page.tsx:125` is `text-2xl` (24 px), and it sits crammed against a subtitle and a "PROGRAMS" pill on the same row. Too much on one line.

**How Terav applies it (under our constraints):**
- Bump the H1 on Week and Today (and every top-level route) from `text-2xl` (24 px / semibold) → `text-[32px]` (32 px / semibold, tracking-tight). Not 40 px — we still need to fit "Progress" and "History" without wrapping on 360 px viewports, and we're not throwing a background photo behind it so we don't need as much presence.
- Move the "Programs" pill *off* the header row entirely on Week. It belongs in the top-nav action row (per your saved memo `feedback_top-nav-action-row.md`) or at the bottom of the empty-state, not shoulder-to-shoulder with the H1.
- Keep the subtitle ("The 7-day rhythm, with your skips and moves applied.") but drop it one row and give it `mt-2` breathing room instead of the current `mt-1`.

**Where to implement:** `next-app/src/app/week/page.tsx:123-136`, `next-app/src/app/page.tsx` (Today), `next-app/src/app/profile/page.tsx:139` (replace `sr-only` with a real H1 — see §4).

**→ delegate to `app-visual-craft`** for the exact type ramp: verify 32 / 13 pairing against the existing tokens ladder in `next-app/src/app/globals.css`.

### 1.2 Identity chip at the top of Profile

**GOWOD reference:** `3cd0ec8b` — Profile opens with a rounded surface card, ~72 px tall, containing a 56 px circular avatar (initial "M" on a purple fill) beside the display name at ~22 px semibold + a tiny caption "GOWOD member since February 2020" at ~13 px muted. On the Profile tab (`5575eaed`) the same chip exists standalone with a chevron affordance because it deep-links to account details.

**Why it works:** identity is a load-bearing anchor for a "who am I" tab. It answers "am I signed in as the right account?" in one glance without hunting for a truncated email. The current Terav profile puts the email at 14 px muted on the top-left with a "STAFF" pill next to it and a "JOINED AUG 2026" caption pushed right — the founder correctly read this as "empty and weird" because there is no identity anchor, only metadata.

**How Terav applies it:**
- New identity card at top of Profile, ~76 px tall, `rounded border border-line-soft bg-surface px-4 py-3` (matches our card idiom in `program-list` at `profile/page.tsx:166`).
- Left: 48 px circular avatar using the first letter of the email, bronze fill (`bg-bronze/20`) with bronze-500 letter. Not purple. We don't have uploaded avatars so a deterministic initial-chip is honest.
- Center: display name `sellinmargus@gmail.com` at 16 px semibold text-strong (no truncation — allow wrap on tiny viewports; the current 14 px truncated read is the "weird" the founder called out).
- Right: `STAFF` pill (only when `isSuperAdmin`) and joined-date caption stacked, muted, 10 px mono uppercase. Chevron only if the chip becomes a link to a real account-detail page — for now, it's non-interactive.

**Where to implement:** `next-app/src/app/profile/page.tsx:140-161`. Replace the current flex-baseline row entirely.

**→ delegate to `app-visual-craft`** for the exact bronze-tint on the avatar (needs to be visible on `--color-surface` #16181c without clashing with the bronze accent used for CTAs).

### 1.3 Card discipline — one idea per card, generous internal padding

**GOWOD reference:** `3cd0ec8b` (Dashboard) shows two cards side-by-side ("Mobility time" 69h43 with a gradient bar + "Mobility score" 61% with a donut). Each card is ~180 × 240 px, `bg-surface-2` on `bg-ground`, ~24 px internal padding, and holds *one* metric plus its supporting visual. Even the crowded second card (`e13a8bd5` Mobility levels: CrossFit 5.1/10 + Running 7.4/10) gives each program its own row with 44 px of vertical space and a segmented bar.

**Why it works:** users can *read* the page without parsing it. Refactoring UI rule 12 (hierarchy through weight not layout crowding): if every card carries one idea, you never have to hunt for the primary meaning.

**How Terav applies it — this is what fixes the "too dense and polluted" Week complaint:**
- Increase card internal padding on Week from `px-3 py-3` (`next-app/src/app/week/page.tsx:358`) to `px-4 py-4` (12→16 px). That alone lifts the Week card away from the "server log" density.
- Keep one card = one week. Never combine the phase header with the day rows or add a summary strip inside the same card (a recurring risk when we start rendering block-object states in Phase D).
- When a day row expands (see §3), the expanded content lives *inside* the same row card, not in a new nested card. GOWOD demonstrates this by never nesting cards more than one level.

### 1.4 Small quiet caption under the H1 — mono, sentence case

**GOWOD reference:** `3cd0ec8b` — "GOWOD member since February 2020" under the identity name, 12 px, muted, non-mono but similar in role. Terav already has the `mono-caps` idiom in `globals.css:77-84` for this exact "quiet supporting caption" role and it's under-used on primary routes.

**How Terav applies it:**
- Under the H1 on every top-level route, put a single sentence-case body line (already done on Week — keep it, just fix the spacing per §1.1). On Profile, add: `Account · sync active · KV synced 12s ago` as an option later, but not now.
- Do **not** switch these captions to uppercase mono — that would re-introduce the "server log" tell the palette work already killed.

### 1.5 Semantic accent for status — micro-bars and dots stay muted

**GOWOD reference:** `e13a8bd5` — the "Mobility levels" rows use dashed segmented bars (yellow for CrossFit at 5.1/10, green for Running at 7.4/10). The color earns its place because it *conveys the value*. No decorative color anywhere else. Same in the donut (`3cd0ec8b`): a single green ring for the 61 % mobility score, gray for the remainder.

**Why it works:** accent economy (Refactoring UI rule 33). One color = one job.

**How Terav applies it:** we already do this well — the block-object state dots in Week (`next-app/src/app/week/page.tsx:334-343`) map amber → skipped, green → done, slate → moved. Keep the current mapping. Extend it to compact Week rows (§3) *without* introducing decorative color on rest/planned days.

### 1.6 Bottom-nav simplicity — 3 items, iconic, no labels

**GOWOD reference:** every screen — 3 icons (grid, play, avatar) at the bottom, no labels, ~64 px tall. Fitts's-law heaven.

**Why Terav does NOT copy this directly:** we have 5 tabs (Today / Week / Progress / History / Profile) and users can't hold that in memory without labels. The current 5-tab labelled nav in `next-app/src/components/BottomNav.tsx` (implied from the screenshot) is right for our scope. What we *can* steal: bump the nav bar height by ~4 px and give the active tab a slightly higher-contrast icon fill (already partially done — visible in the screenshots where "PROFILE" is stronger). No further change needed.

### 1.7 Progress-bar aesthetic — thin, gradient, calm

**GOWOD reference:** `3cd0ec8b` Mobility-time card — the "69h43 / next milestone 70h" bar is a 6 px-tall linear gradient, blue-to-cyan, occupying the full card width with the milestone label right-aligned below.

**How Terav applies it:** we don't have this pattern yet, but Progress will need it when we ship the milestone-progress feature. When it comes: 6 px tall, bronze gradient (`--color-bronze` → `--color-bronze-hover`), full-width, with the current-value at 22 px semibold to the left and the target as a muted mono suffix. **Deferred to the Progress tab redesign brief** — not for this batch.

---

## 2. What Terav should LEAVE

### 2.1 The Daily / Activate / Recover carousel (`fd3e5ca7`, `734fbc38`, `b68dbcf2`)

**Why it looks great:** three photo-hero cards, swipeable, one verb each ("Daily · At home", "Activate · Before training", "Recover · After training"). Cinematic, obvious.

**Why we reject it:** it is the *anti-pattern* of focused improvement. GOWOD's core promise is "we'll fit around your training as mobility support." Ours is "you picked one arc; we sharpen it." The carousel invites the user to pick a session type per moment, which is exactly the full-plan promise your saved memo `feedback_focused-not-full-plan.md` explicitly resists. We already have Today for the day's session and Programs for the picker — a session-type carousel would compete with both. Future PMs reading this: don't reopen this. The category is saturated and the promise is different.

### 2.2 All athlete photography (every card that uses a human photo)

**Why it looks great:** high production values, aspirational, sells the app instantly.

**Why we reject it:**
1. We don't own a photo library, and stock never survives contact with rehab positioning — you cannot photograph an "asymptomatic morning" or "amber-downshift day."
2. Aspirational photography implies "you'll look like this," which is the opposite of "we cite the paper and respect your log." It shifts the emotional register from *clinician-adjacent* to *lifestyle*.
3. Photos require CDN + weight budget we haven't spent. The current app is ~40 KB of critical CSS and text — photos would 10× the page-weight budget for a marginal aesthetic gain on desktop.

If we ever need imagery, the correct move is *diagrammatic* (anatomy dots, position sketches on the exercise detail page — matching the tone of `data/exercises.json`), not photographic.

### 2.3 The blue "Let's go!" CTA (`9316b7dc`)

**Why it looks great:** loud, hard to miss, gradient blue.

**Why we reject it:** off-brand. Our primary accent is bronze (`--color-bronze` #c89666), and every CTA in the app already uses it. Introducing a second primary would break accent economy. The landing page uses a teal secondary; the app deliberately doesn't. Leave blue where it belongs — the landing hover states and the sync-status dot in the header. Not the CTA.

### 2.4 The "Become Premium" bronze bar

**Why it appears everywhere in GOWOD:** freemium conversion is their business model.

**Why we reject it:** Terav is a beta with an all-programs-included promise. No freemium bar. Never let a "Become Premium" or "Unlock X" persistent banner near the app — the founder's positioning is "focused improvement, honestly priced," and a persistent upsell is the opposite of honest.

### 2.5 The GOWOD Challenge counter (`9bbf9097`)

**Why it looks great:** big number (3h32 / 8h00), progress bar, trophy icon, gamified.

**Why we reject it:** Terav's engine is confirm-first with cited proposals, not a streak/challenge system. Gamified counters bias toward *volume of interactions*, which for a rehab user is directly counterproductive. If we ever ship anything challenge-like, it belongs on the Handstand Walk skill program (skill-first pivot signal, per `project_skill-first-pivot-signal.md`) as a *movement mastery* meter, not a global counter.

### 2.6 The "Sports · Equipment · Goals" segmented control on Profile (`5575eaed`)

**Why it looks great:** compact, quick-switch, clean.

**Why we reject it:** GOWOD needs three tabs because Profile carries preferences that shape their personalization engine (equipment gates content, sports gate protocols). Terav's user preferences are already captured *inside each program's intake* — they belong there, not on Profile. Profile stays a switchboard, not a settings hub.

---

## 3. Week-tab redesign — Runna-style compact per-day

Founder request: **collapsed one-line default, tap to expand, small "move" menu**.

### 3.1 Where the current density lives

The current Week card renders four eager blocks per day:
- Day header + name + logged count + tracks pill (`next-app/src/app/week/page.tsx:401-421`)
- One-line block names or "Rest / accessory day" (`page.tsx:422-429`)
- Override reason `↳` line, skip reason line (`page.tsx:430-438`)
- Conditioning italic (`page.tsx:439-441`)
- Logged runs list (`page.tsx:447-464`)
- Top-logged-lift roll-up (`page.tsx:465-474`)

Every day renders every branch. On a 7-day week with 2 concurrent tracks, that's ~30 vertical lines of content — the "polluted" the founder called out.

### 3.2 Collapsed state target (default on load)

Every day is a single 56 px row. One line, one truth, no expandable content shown.

```
┌─────────────────────────────────────────────────────┐
│ ● Mon 17 Aug     Barbell reintro + Zone 1/2       › │  ← tap chevron OR row → expand
├─────────────────────────────────────────────────────┤
│ ● Tue 18 Aug     Rest / accessory day             › │
├─────────────────────────────────────────────────────┤
│ ● Wed 19 Aug ✓   Barbell reintro session          › │  ← today: bronze row-tint, ✓ if any logs
├─────────────────────────────────────────────────────┤
│ ● Thu 20 Aug     Barbell reintro + Block 1 retest › │
├─────────────────────────────────────────────────────┤
│ ⊘ Fri 21 Aug     Rest / accessory day             › │  ← ⊘ = skipped, row 70% opacity
├─────────────────────────────────────────────────────┤
│ ● Sat 22 Aug     Rest / accessory day             › │
├─────────────────────────────────────────────────────┤
│ ● Sun 23 Aug     Long aerobic (Z2)                › │
└─────────────────────────────────────────────────────┘
```

- Left dot: existing status color (`page.tsx:334-343`, keep as-is).
- Day name + date: 15 px semibold + 11 px mono muted (same pairing as today, no change).
- Block name(s) or "Rest / accessory day" or `↳ Moved-in session`: 13 px muted, truncated to one line with `overflow-hidden text-ellipsis`.
- Chevron right: 14 px muted, rotates 90° on expand (motion-safe respects `prefers-reduced-motion`).
- No conditioning line, no run list, no top-lift roll-up in collapsed mode. All of that moves inside expand.
- Multi-track days: still show the multi-dot cluster (existing behavior at `page.tsx:363-393`) but cap at 2 dots visible before "+N" — the collapsed line has no room for 4.
- Today's row: bronze row-tint (`bg-bronze/8`, unchanged from `page.tsx:359`).

### 3.3 Expanded state target (after tap)

```
┌─────────────────────────────────────────────────────┐
│ ● Wed 19 Aug ✓   Barbell reintro session          ⌵ │  ← chevron rotates
│   ┌───────────────────────────────────────────┐     │
│   │  Barbell reintro · Zone 1/2 steady-state  │     │
│   │  Optional light CrossFit finisher.        │     │
│   │                                            │     │
│   │  ✓ block pull midshin · 132.5 kg × 5       │     │
│   │  ✓ 5.2 km run · easy                       │     │
│   │                                            │     │
│   │  [ Open in Today ]   [ Move… ]  [ Skip ]   │     │
│   └───────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

- Inner content sits at `pl-6` (aligns with the dot column above).
- Block names get their own 13 px line, one per block, semibold-strong (so "which sessions" is scannable inside the expand).
- Conditioning italic reappears here.
- Logged runs and top-lift roll-up reappear here — same components as `page.tsx:447-474`, unchanged.
- Three actions at the bottom of the expand, thumb-zone-aligned:
  1. **Open in Today** — deep-links to `/` if `isToday`, or `/history?date=YYYY-MM-DD` for past, or no-op (hidden) for future.
  2. **Move…** — opens a sheet listing the other 6 days with "Move to Thu 20 Aug" affordances. The Runna pattern.
  3. **Skip** — existing skip mutation, confirm-first.
- Expand animates open with a 200 ms `max-height` + opacity transition, capped at `prefers-reduced-motion: reduce` (instant open).

### 3.4 Interaction rules

- Only one day expanded at a time. Tapping a second day collapses the first. Rationale: mental load — the founder's complaint was density; multi-expand recreates it.
- Today defaults to expanded on first mount if `offset === 0`. Everything else stays collapsed. Rationale: the primary "what am I doing right now" signal remains one-tap-fast.
- Long-press on the row: does nothing (no discovery cost, no accidental fires). Move happens via the explicit "Move…" action in the expanded footer.
- Swipe-left on a row is *deferred* — it's a nice future affordance but forcing swipe as the only "Move" gesture violates the discoverability principle (Krug — if it needs explaining, it isn't done).

### 3.5 What to keep from the current Week tab

- The week nav row (`page.tsx:144-191`) with prev/now/next: unchanged, already right.
- The phase banner (`page.tsx:193-206`): unchanged.
- The legend for multi-dot mode (`page.tsx:218-233`): unchanged.
- The rules-of-the-week accordion (`page.tsx:486-508`): unchanged.

### 3.6 Persona coherence check

| Persona | Collapsed reads as | Expanded reads as | Holds? |
|---------|--------------------|-------------------|--------|
| `persona-recover` (rehab morning, amber) | Row shows `⊘ Wed · Barbell reintro session` — skipped visible from dot alone | Tap → sees the amber-downshift reason + `[Move…]` to reschedule | Yes |
| `persona-strength` (overperformer) | Every day is a single line — feels controlled, not "too much app" | Tap → sees the top-lift and can plan the next attempt | Yes |
| `persona-erratic` (15 skips, noisy engine) | Skip dots visible at a glance — pattern is legible | Tap → the reason string appears in-context, not shouting from the collapsed row | Yes |

---

## 4. Profile-tab redesign

Founder's calls: **sign out at bottom, quieter Export/Delete/legal, GOWOD-scale identity chip, larger H1**.

### 4.1 Target IA order (top → bottom)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Profile                                            │  ← 32 px H1, semibold, tracking-tight
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  ⚫ S   sellinmargus@gmail.com          STAFF │  │  ← identity chip, 76 px, avatar 48 px
│  │        joined Aug 2026                        │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  YOUR PROGRAMS                                      │  ← 10 px mono uppercase muted, 24 px above list
│  ┌───────────────────────────────────────────────┐  │
│  │  Anterior hip + strength rebuild           › │  │
│  │  34 weeks · intermediate · TODAY'S · INTAKE   │  │
│  ├───────────────────────────────────────────────┤  │
│  │  Engine Builder — Block 1: Base            › │  │
│  │  8 weeks · beginner · INTAKE PENDING          │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  MORE                                               │
│  ┌───────────────────────────────────────────────┐  │
│  │  📖  Guide                                 › │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  (vertical gap ~48 px — Fitts separation)           │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │              →  SIGN OUT                      │  │  ← full-width, bordered, muted
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ─────────────────────────────────────────────────  │  ← divider
│                                                     │
│  Privacy · Terms · Medical disclaimer               │  ← 11 px muted, one row
│  Export my data                                     │  ← 11 px muted underline, hangs alone
│                                                     │
└─────────────────────────────────────────────────────┘
```

Note the deliberate omissions: **no "Delete my account"** in this footer.

### 4.2 Section-by-section calls

**H1 "Profile":** promote from `sr-only` (currently `profile/page.tsx:139`) to a visible 32 px semibold. This is the single biggest reason the tab reads "empty and weird" — there is no page title anchoring the top. Add it. That's the smallest, highest-impact change in the entire brief.

**Identity chip:** as §1.2 — replace the current baseline-flex row at `profile/page.tsx:140-161` with the full chip. 48 px circular avatar (bronze-tint, initial "S"), name at 16 px semibold, STAFF pill + joined-date on the right stacked. The email visible, not truncated inside a `truncate` span.

**Programs list:** unchanged from current `profile/page.tsx:166-239`. The recent audit-brief work here is already good — chevrons, deep-link, quiet remove-link on non-primary rows. Don't touch. Just add a `YOUR PROGRAMS` mono-caps label above it (10 px mono muted uppercase, `mt-6 mb-2` spacing).

**Guide "More" nav:** unchanged, keep as `profile/page.tsx:249-272`. Add a `MORE` label above it, same treatment.

**Sign out:** as-is at `profile/page.tsx:278-287` — full-width bordered, mono uppercase, Fitts-separated. The founder's request is already implemented; the reason it looks "weird" in the current screenshot is that everything *below* sign out (Privacy / Terms / Export / Delete) reads as equal-weight to sign out. That's the real problem, addressed in the next section.

**Footer — the founder's real questions:**

The founder asked *"is export my data really needed? are privacy and terms etc also needed there? isnt enough when they are on landing?"*

The answer, brief-by-brief:

- **Privacy, Terms, Medical disclaimer:** yes, keep them in the app footer. Legal reason: consent-first defaults require the user to be able to reach these *while signed in and using the product*. Landing-only isn't enough — GDPR expects the current TOS to be reachable from within the authenticated surface. Move them to a **single quiet row** (11 px muted, comma-separated, no underline until hover), not the current wrapping flex layout.

- **Export my data:** yes, keep. GDPR Article 20 (right to portability) makes this mandatory for a service that stores personal training data on servers. It stays. Move it to its own single-line row under the legal links, same 11 px muted underline treatment.

- **Delete my account:** **remove from Profile footer entirely.** Move it inside the account-details deep link when we build the identity-chip-tap destination. Deleting an account is a destructive rare action and does not belong 44 px away from the same-styled "Privacy" link. Keeping it here is a "user misfires and rage-quits" hazard. The `confirmDelete` flow at `profile/page.tsx:59-92` stays wired up — it just moves to a `/account` route later.
  - **Interim ship:** if we don't want to build `/account` yet, put Delete under a "Danger zone" collapsed disclosure at the very bottom, one tap to reveal. That's the ~1-hour version.

### 4.3 File-level implementation notes

- `next-app/src/app/profile/page.tsx:138-145` — replace `<h1 className="sr-only">Profile</h1>` with visible H1.
- `next-app/src/app/profile/page.tsx:140-161` — replace baseline-flex identity row with card + avatar.
- `next-app/src/app/profile/page.tsx:293-340` — collapse footer to single-row Legal + Export; remove Delete or hide behind disclosure.

**→ delegate to `app-visual-craft`** for the H1 type-scale + identity-chip specs.
**→ delegate to `app-copy-clarity`** for the "Danger zone" copy if we go with the disclosure interim.
**→ delegate to `app-accessibility`** for the new H1 (currently `sr-only` — verify SR-order still lands correctly with a visible H1).

### 4.4 Persona coherence check

| Persona | Reads Profile as | Holds? |
|---------|------------------|--------|
| `persona-recover` (needs disclaimer visible) | Medical disclaimer still in footer, one tap | Yes |
| `persona-strength` (skims fast) | Identity chip + program list is the first two things they see, sign-out ~1 scroll below | Yes |
| `persona-erratic` (rage-quit risk) | Delete is NOT in footer — no accidental account death | Yes (this is the fix) |

---

## 5. Shift-forward priority — what ships in the next 2–4 hour batch

Ordered by user-facing impact per implementation hour.

### Ship this batch (~3–4 h total)

1. **Profile H1 promotion + identity chip** (~45 min).
   - `profile/page.tsx:139` + `:140-161`.
   - Highest impact-per-minute in the brief. Founder called it out first.
2. **Profile footer collapse** (~30 min).
   - Move Delete under a `<details>` "Danger zone" disclosure OR remove it (keep API wired). Legal row single-line. Export alone.
   - Small edit, resolves the "everything is equal weight" problem.
3. **Week H1 bump + subtitle spacing** (~15 min).
   - `week/page.tsx:125` → `text-[32px]`. Same for Today.
4. **Week card padding bump** (~15 min).
   - `week/page.tsx:358` → `px-4 py-4`. Removes ~30 % of the perceived density with one edit.
5. **Move "Programs" pill off the Week header row** (~30 min).
   - Drop it to a subtle text-link `text-[11px] font-mono text-bronze` sitting to the *right of the subtitle*, or remove entirely (Programs is a bottom-nav step away — the pill is redundant).

### Next batch (~6–10 h, own sprint)

6. **Runna-style Week collapse + expand** (~6–8 h).
   - New `<WeekDayRow>` component owning collapsed/expanded state.
   - Move actions (`Open in Today`, `Move…`, `Skip`) surfaced only in expand.
   - Move-sheet component (new) — a `ConfirmSheet`-adjacent variant listing the other 6 days.
   - Reduced-motion path.
   - E2E test covering "tap → expand → move-to-Thu → row reflects override reason."
7. **Delete-account → `/account` route** (~4 h).
   - New route, host the identity-chip deep-link, host destructive actions.
   - Only ship this if step 2 chose the "remove Delete from footer entirely" path.

### Do not ship — kill on sight

- Photography anywhere.
- Blue "Let's go" CTA anywhere.
- Persistent premium/upsell bar.
- Session-type carousel on Today.
- Streak/challenge counters.

---

## Peer benchmarks (for the record)

- **Runna (iOS)**: their weekly plan is the reference for §3 — one-line-per-day default, tap to reveal splits + pace. What to steal: the compactness and the fact that "Move" is *always* an explicit menu, never a swipe-only gesture. What to reject: their color-per-workout-type system is too loud for rehab.
- **Linear**: identity chips and card discipline. What to steal: the 48 px avatar + name pattern and the single-purpose card rule. What to reject: nothing — Linear's restraint is directly compatible with ours.
- **Whoop**: warm-dark palette and stat-donut treatment. What to steal: the single-color-per-metric discipline (§1.5). What to reject: their proprietary strain/recovery scores as a mental model — our engine cites papers, not opaque numbers.
- **GOWOD itself** (all screenshots): steal the scale and card discipline; reject everything else per §2.

---

## What this decision does NOT solve

- The Progress tab's milestone visualization — deferred to its own brief.
- The Today tab's session card composition — deferred (referenced but not redesigned here).
- The `/account` deep-link destination if we choose to relocate Delete — deferred to a follow-up.
- Onboarding flow visual language — deferred; the intake screens have their own dedicated brief scope.
- Dark-mode ↔ light-mode parity — we are dark-only, no branch.

---

## Estimated implementation cost

- Ship-this-batch items (1–5 above): **3–4 h, high confidence** — all are token/layout edits inside two files (`profile/page.tsx`, `week/page.tsx`).
- Runna-style Week expand (item 6): **6–8 h, medium confidence** — the Move sheet is the unknown (interaction test surface).
- `/account` deep-link route (item 7): **4 h, high confidence** — additive route, wires existing delete flow.

Total to close the founder's three questions completely: **~13–16 h across two sprints**.
