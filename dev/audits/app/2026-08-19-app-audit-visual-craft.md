# Terav app — Visual craft audit (type / color / rhythm, 3 personas, post-Batch-16)

Personas: `persona-recover`, `persona-strength`, `persona-erratic`
Artifacts: `next-app/tests/e2e/artifacts/personas/{persona}/mobile/`
Palette source: `next-app/src/app/globals.css`
Viewport basis: 393 px mobile, 1280 px desktop capped at `max-w-[760px]` (`AppShell.tsx:116`)
Peer set: `dev/audits/app/competitor-refs.md` (Pliability, GOWOD, Runna, Whoop, Strava, Hevy, Ladder)
Deployment referenced: `https://4df8a948.program-v2.pages.dev` (Batch 16 — H1s → 32 px, Profile identity chip, Danger-zone disclosure, Week `px-4`, "Programs" pill removed)

**Framing** — findings are IDEAS, not action items. Terav has deliberate constraints (confirm-first engine, rehab-not-fragile positioning, one bronze accent + three semantic colors, cite-the-paper voice) that override "cleaner is better" in several places below. Each finding names what to steal, what to reject, and why against those constraints.

**Artifact drift** — the persona screenshots on disk still show the pre-Batch-16 UI: Profile with baseline-flex email + `sr-only` H1, Week header with the "PROGRAMS" pill, all H1s at `text-2xl` (24 px). The persona harness has not been re-run since the batch shipped. I audit against the *source code* as the truth and mention what the artifacts still show only where the delta matters. **Recommend re-running `dev/scripts/run-app-audit.sh` so the next audit compares against Batch 16 pixels.**

**PII check** — persona artifacts contain fixture emails (`e2e-persona-recover@example.test`) and no real client data. No warning required.

---

## 1. Overall visual verdict

Batch 16 was the right call on the right routes: promoting the H1 from 24 → 32 px (`page.tsx`, `week/page.tsx:128`, `history/page.tsx:95`, `progress/page.tsx:149`, `profile/page.tsx:143`, `programs/page.tsx:89`, `report/page.tsx:175`, `extras/page.tsx:66`) is the single largest legibility gain of the last three audits. The Profile identity chip (`profile/page.tsx:152-180`) finally answers "who am I signed in as," and moving Delete under a Danger zone disclosure (`profile/page.tsx:336-357`) removed the "misfire and rage-quit" tap-target from the same visual weight as Privacy. The `px-4 py-4` bump on Week (`week/page.tsx:355`) does what GOWOD's cards do — one idea per row, breath around it.

**The top failure mode that remains: the body-text floor is still 13 px, not 14–15.** `text-[13px]` appears 212 times across `src/` — it's the dominant body-copy size for every "Because" reason line, every "Optional light finisher" hint, every muted subtitle in Progress/Week/Profile. For a rehab tracker read on the couch at 6 am with morning eyes, 13 px is a red flag. Pliability, GOWOD, and Whoop all sit at 15–17 px for equivalent secondary body copy. If you keep only one recommendation from this audit, promote body from 13 → 14 px system-wide.

**The one thing done exceptionally right:** accent economy is holding. One primary (bronze), one secondary (slate/teal), three semantic (green/amber/red), zero rogue hex. Grep for `bg-[#` and `text-[#` returns zero hits. That is Refactoring UI rule 33 executed cleanly — better than any other health/training app in the peer set except Whoop.

Verdict headline: **Batch 16 went in the right direction but not far enough on body size, and slate has begun to accumulate too many jobs.** Details below.

---

## 2. Type scale — actual px per role

Rendered at Tailwind default `--font-size` (16 px root) via `layout.tsx:63` `className="h-full antialiased"` on `<html>`. No custom root font-size override; `html { font-feature-settings: "ss01", "cv11", "tnum" }` at `globals.css:60` is stylistic-set + tabular figures — good, keep.

| Role | Class chain | Mobile px (393) | Desktop px (1280) | Line-height | Verdict | Recommend |
|---|---|---|---|---|---|---|
| Top-level route H1 (Today/Week/Progress/History/Profile/Programs/Report/Extras) | `text-[32px] font-semibold tracking-tight leading-none` (`profile/page.tsx:143`, `week/page.tsx:128`, +5 more) | 32 | 32 | 1.0 | **Batch 16 win.** 32 px reads as "you are here" at arm's length. Not 40 like GOWOD — because we don't hero-photo the header, we don't need the extra scale. | Hold. Do not push to 36+. |
| Card H2 title (block header, "Barbell reintro session") | `font-mono text-[13px] font-semibold uppercase tracking-widest` (`page.tsx:1115`) | 13 | 13 | 1.5 | Mono-caps H2 shouts "server-log admin" at 13 px. Only acceptable because it's a block *category label*, not a real section title. | Consider dropping to `text-[12px]` and `tracking-wider` (not `widest`) to soften. Or migrate to sentence-case 14 px semibold (matches Progress section rebuild). Pick one and hold. |
| Programs list card H2 ("Concurrent-Strength Maintenance") | `text-sm font-semibold text-strong` (`profile/page.tsx:221`) | 14 | 14 | 1.5 | 14 px semibold as a section-header inside a card is thin. GOWOD gives its equivalent 16-17 px. | Bump to `text-[15px]`. |
| Card body — "Because" reason, block notes, symptom-check sub | `text-[13px] text-muted` (`page.tsx:226, 267, 299`) | 13 | 13 | 1.5-tight | **Below the floor.** Refactoring UI + iA + Vignelli all: body on mobile ≥ 14 px. Whoop = 15, Pliability = 16, GOWOD = 15. 212 instances of `text-[13px]` in src/ — this is the dominant body token and it is one notch small. | **Bump `text-[13px]` → `text-[14px]` system-wide** (or, cleaner, introduce a `body` and `body-sm` token and stop using `text-[13px]` arbitrary at all). |
| Numeric readout — "119 kg × 5", "45 min", TM values | `font-mono` inside a `text-[13px]` container (`page.tsx:243, 799`) | 13 | 13 | 1.5 | Numbers inherit `tabular-nums` from `html` (`globals.css:47`) — columns align. Good. But at 13 px, on JetBrains Mono at RPE/reps, the digit width is 8 px — tight against the `×` glyph. | If body goes 14, this comes with it. Do not track down separately. |
| Caption / mono-caps eyebrow ("YOUR PROGRAMS", "MORE", "COMING SOON") | `font-mono text-[10px] uppercase tracking-widest text-muted` (`profile/page.tsx:186`, ProposalCard, +32) | 10 | 10 | 1.15 | 10 px uppercase mono is at the app's caption floor. Reads because tracking + uppercase compensate for the small counter-forms. | Hold at 10 px. Do not proliferate below. There are 2 hits at `text-[9px]` — kill those. |
| Small pill ("STAFF", "TODAY'S", "intake pending", "graduated") | `font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded` (`profile/page.tsx:172, 232, 237, 242, 224`) | 10 | 10 | 1.15 | Correct treatment — matches the mono-caps eyebrow. Pill has enough weight from `px-1.5 py-0.5` bg-fill to survive at 10. | Hold. |
| Bottom-nav label ("TODAY", "WEEK") | `text-[10px] font-medium tracking-[0.08em] uppercase` (`BottomNav.tsx:57`) | 10 | 10 | 1.15 | Fine. Nav labels below icons at 10 px is peer-consistent (Runna, Whoop, Strava all in this range). | Hold. |
| Wordmark ("TERAV") | `font-mono text-[13px] uppercase tracking-[0.22em] text-bronze` (`AppShell.tsx:123`) | 13 | 13 | 1.15 | 13 px + 0.22em tracking = optical-30 px feel. Correct restraint — the wordmark is a persistent anchor, not a hero. Matches GOWOD's tiny-logo pattern. | Hold. |
| Symptom-log input value (SetRow numeric field) | `font-mono text-sm px-2 py-2 min-h-[44px]` (`SetRow.tsx:73, 95`) | 14 | 14 | 1.5 | 14 px inside a 44 px tap target is fine. Not `tabular-nums` explicit at the input level — inherits from html. Verify Safari inherits into `<input>` (some builds don't). | If we care about column alignment inside the input on iOS Safari specifically, add `font-variant-numeric: tabular-nums` on the input directly. Otherwise hold. |
| Legal footer ("Privacy · Terms · Medical disclaimer") | `text-[11px] text-muted` (`profile/page.tsx:313`) | 11 | 11 | 1.15 | 11 px muted is legally reachable — WCAG 1.4.4 zoom is unblocked (`layout.tsx:53-58` intentionally didn't disable pinch). Below body floor by design — this is *quiet*, not primary. | Hold. |
| Rehab / medical disclaimer body | `text-[13px]` inside `text-muted` (banners at `page.tsx:267-303`) | 13 | 13 | 1.5-tight | Same "below body floor" issue. On a 6-am morning read, this is the *most important* line ("Any sharp shoulder pain — end the block"). | **Bump these specifically to 14 px, even if we don't do system-wide.** Safety copy at 13 muted is exactly wrong. |

**Sizes in play (dedupe'd):** 32, 15, 14, 13, 12, 11, 10, 9 — eight sizes with an anti-pattern at 9. GOWOD's ramp is 34/24/16/14/12/10 — six sizes. Whoop is 40/22/18/14/12/10 — six sizes. **You are one to two sizes over budget** even after last week's cleanup that killed the fractional-px anti-pattern.

**Recommend converging on:** 32 (H1), 20 (H2 on empty-state hero), 15 (card title), 14 (body), 12 (secondary body / muted supporting), 10 (caption / eyebrow / pill). Six sizes. Kill 13 and 11 as arbitrary tokens (fold both up to 14 and up to 12 respectively). Kill 9 outright.

---

## 3. Line-height / tracking

`leading-tight` (1.25) appears 34 times across `src/`. Most instances are on H1 or empty-state hero — fine because the H1 is at 32 px where 1.25 leaves 8 px of leading, plenty. `leading-none` on the 32 px H1 (`profile/page.tsx:143`) is a hair aggressive if the H1 ever wraps — H1s never wrap in current copy at 393 px viewport, but "History" and "Progress" are short by luck. If we ever change the label ("Training summary" at `report/page.tsx:175` uses `text-[32px] leading-none`), a two-line wrap would touch. **Recommend swapping `leading-none` → `leading-[1.05]`** for all H1s — negligible visual difference at 32 px, safe if copy grows.

**Body at 13 px with default leading = 1.5 = 19.5 px line-box.** OK for one-line reason strings. For the 3-line "Because" paragraphs at `page.tsx:267-273` and `page.tsx:299-307`, 1.5 leading on 13 px reads as "cramped academic." Whoop uses 1.55 on 15 px body — that's the target. If body promotes to 14, drop leading to `leading-relaxed` (1.625) on any 3+ line block. Or use `leading-[1.55]`.

Numeric readouts inherit `tabular-nums` from the `html` element (`globals.css:47`) — good, this is exactly the Refactoring UI rule for financial/rep/weight columns. Verified working in the Progress "115 kg / 141 bpm" alignment (persona-strength screenshot `05-progress.png`).

`tracking-widest` (`0.1em`) on 10 px mono-caps is *pushing* the tracking beyond what iA would tolerate. The pattern reads because uppercase counter-forms are already square. But `tracking-[0.22em]` on the TERAV wordmark (`AppShell.tsx:123`) is optical-only — that's fine because the wordmark is a logo, not text. **Do not proliferate 0.22em anywhere else.**

---

## 4. Font pairing

`layout.tsx:11-23` loads **Inter (sans)** and **JetBrains Mono** via `next/font/google` with `display: "swap"` and 4/2 weight subsets respectively.

**Verdict: correct pairing, correct restraint.** Inter is the workhorse for a rehab-adjacent product — humanist geometric, high x-height, huge glyph coverage. JetBrains Mono is the technical-log tell — RPE, kg, weight × reps, session timestamps. The two faces sit together without fighting because both are neutral-modern.

**One nit:** the app uses `font-mono` 271 times across `src/`. Half of those are for numeric readouts (correct). The other half are for `mono-caps` eyebrows / pills / block-category labels / "COMING SOON" chips (also correct — this is Terav's typographic identity for "structured status label"). But some of the `font-mono uppercase tracking-wider` labels — e.g. the "TODAY'S" and "intake pending" pills on Profile (`profile/page.tsx:232, 242`) — read as *code* to a non-technical user. That's fine for the founder, staff, and CrossFit-adjacent user base; it may push a rehab-only user toward "this feels engineering-heavy." Peer comparison: **Pliability uses zero mono; GOWOD uses zero mono; Whoop uses mono only for numbers.**

**Do NOT change the mono usage** — Terav's positioning is "we cite the paper, we read the log." The mono is *load-bearing* for the confirm-first, evidence-first identity. This is where you deliberately reject cleaner-is-better. Just note: if the target user ever shifts from CrossFit-athletic to general-clinical-rehab, mono-caps pills are the first thing to soften.

Landing (terav.fit) vs. app (app.terav.fit) — landing is more display-forward; the app deliberately shrinks the wordmark to a 13 px mono anchor at the top-left. That's Vignelli-correct: chrome recedes, content dominates. Hold.

---

## 5. Palette discipline — the warm-dark system

**Tokens defined in `globals.css:8-38`:**

- Ground: `#0e0f12` (`--color-ground`) → `body` bg via `globals.css:63`
- Surface: `#16181c` (`--color-surface`) → primary card bg
- Surface-2: `#20232a` (`--color-surface-2`) → bottom-nav bg, elevated card bg
- Ink: `#d6d9de` (`--color-ink`) → default body text
- Strong: `#f4f5f7` (`--color-strong`) → titles, hero text
- Muted: `#8a8f9a` (`--color-muted`) → secondary text
- Line: `#3a3f4a` (`--color-line`) → visible borders
- Line-soft: `#24272f` (`--color-line-soft`) → whisper dividers
- Green: `#5fb37a` (`--color-green`) → derived-state green, done
- Amber: `#e0a63a` (`--color-amber`) → derived-state amber, warning
- Red: `#e5654b` (`--color-red`) → derived-state red, danger
- Bronze: `#c89666` (`--color-bronze`) + hover `#d9a97c` + active `#b3814f` → primary accent, CTA
- Slate: `#79b8c4` (`--color-slate`) → secondary accent, "verified/marker/proposal"
- Lat-left: `#4a8894` (`--color-lat-left`) — used on ExerciseCard laterality spine
- Lat-right: `#a279a8` (`--color-lat-right`) — same

**Role coherence audit:**

| Role | Token | Consistent? |
|---|---|---|
| App ground (page bg) | `--color-ground` | Yes. No `bg-black` anywhere in `src/`. |
| Card ground | `--color-surface` | Mostly. `bg-surface-2` used on bottom-nav (`BottomNav.tsx:39`) and inside elevated readouts (Progress adherence bar). Two-surface hierarchy is deliberate and correct. |
| Primary body | `text-ink` via `body` (`globals.css:64`) | Yes. |
| Muted / secondary | `text-muted` | Yes, 148+ usages, one token. |
| Titles / strong | `text-strong` | Yes. Used on all H1/H2. |
| Primary CTA | `bg-bronze text-ground` | Yes. "Advance to Cycle 1" (`page.tsx:837`), "Apply bump", "Confirm skip" (`page.tsx:570`), "Retest — log your numbers" — all bronze fill on ground. One CTA style, one meaning. |
| Secondary CTA | `border border-line` / `border-slate/60 text-slate` | Two variants (see below §5.1). |
| Danger | `text-red` + `border-red` | Yes. Used only for delete / red morning-check state / red banner. |
| Warn | `text-amber` + `bg-amber/10` | Yes. Interference banner, non-100% amber applied, skill-safety pain callout. |
| Success | `text-green` + `bg-green/20` | Yes. Graduation "Targets hit", "done" log count, ready-to-advance. |

**Rogue color grep (`bg-[#`, `text-[#`, `border-[#` across `src/`):** zero hits. Clean.

**Undefined-token grep:**

- `text-bronze-hi` appears in `profile/page.tsx:154` — **the token `--color-bronze-hi` is NOT defined in `globals.css`.** This renders as `color: currentColor` fallback (inheriting `text-strong` or `text-ink` depending on cascade). The intent was clearly "brighter bronze for the avatar initial on the `bg-bronze/20` chip." **Fix: either define `--color-bronze-hi: #e2b686` in `globals.css:@theme` or change the class to `text-bronze` (which is #c89666 — should have enough contrast on `bg-bronze/20` because the bg is ~20% of the same hue over a #16181c surface).** Right now the initial "P" on the persona-recover avatar is rendering as `text-ink` (#d6d9de), not bronze. Minor but a real bug.
- `text-amber-strong` appears in `page.tsx:386` — **same issue, undefined token.** Intent: "loud amber for interference-banner header." Falls back to inherited color. Fix: either define `--color-amber-strong: #f0b854` or change to `text-amber` (which is the base #e0a63a). This is the "multiple tracks scheduled today" banner heading — currently rendering muted-inherited. Also a real bug.

**Accent economy verdict:** discipline holds at the token level. **The two undefined-hi/strong references are the only real cracks.** No fourth accent has snuck in. Zero rogue hex.

### 5.1 Slate is doing too many jobs (carrying forward from Aug 18)

Slate (`#79b8c4`) currently means all of:
1. Secondary CTA border (`border-slate/60 text-slate` — Graduation "Browse other programs" at `page.tsx:843`)
2. "Verified" category chip on programs
3. Retest-due proposal accent
4. Waypoint milestone marker on Progress
5. Left-border on non-CTA callout boxes (`border-l-slate` at `page.tsx:267, 538, 999, 1023, 1033`)
6. LogSessionShortcut pill (`page.tsx:681` — `border-slate/40 bg-slate/[0.08] text-slate`)
7. Tier label pill on Profile (`profile/page.tsx:237`)

Seven semantics under one color. In Refactoring UI terms, slate has become "the not-primary, not-danger, not-warning color" — a leftover bin. Compare to bronze which only means "primary interactive action."

**Idea (not action):** demote slate on non-interactive markers to `text-muted` or `--color-line`. Specifically:
- LogSessionShortcut (`page.tsx:681`) is a *link* — that's the correct slate use. Keep.
- Left-border callouts (interference warning, day-header shortcut, rest-day card) don't need color — a plain `border-l-4 border-l-line` reads as "structured callout" without borrowing slate's accent meaning. **Recommend: swap `border-l-slate` → `border-l-line` on the DayHeaderShortcut and Rest/Holiday cards.** Keep it on the Bronze-adjacent variants for consistency.

**Why this matters to Terav's constraints:** slate proliferation dilutes the "we're deliberate about signal" story. If the interference banner (amber) and the day-header shortcut (slate) and the taper-week callout (slate) all look like "structured info," the user can't tell warning from marker.

**Why to REJECT going harder:** slate is also load-bearing on Progress as the "marker/waypoint" hue. Aggressive demotion breaks the progress-tab identity. Leave the Progress-tab slate alone — it's the destination color for that surface.

### 5.2 Muted-level count

`text-muted` alone — the single muted token — is 148 usages. `text-muted/70` and `text-muted/60` appear 6 times combined. That's disciplined. **Recommend:** kill `text-muted/70` on `SuggestionBox.tsx:38`, `page.tsx:341`, `SetRow.tsx:73, 95` — the fourth-level muted opacity is invisible on `#16181c`. Either the info matters (use `text-muted`) or it doesn't (delete it).

Two muted levels max is the target. You have three if you count `/70`. Kill the `/70` — you're one level over budget.

---

## 6. Contrast for hierarchy

At 393 px viewport on the Today page (persona-recover `01-today.png`):

- H1 (sr-only, doesn't render) → 0
- DateNav header ("Wednesday 19 Aug / Today") at ~15 px semibold → primary anchor
- Phase readout ("Rebuild + evaluate · week 2 of 4 · ends 29 Aug") at 13 px muted → secondary
- HeroStateCard "GREEN · Progress load…" at 13 px inline → tertiary
- Card H2 ("BARBELL REINTRO SESSION") at 13 px mono-caps → *should be* primary but reads at same weight as body due to being muted-adjacent

**Ratio math:** primary anchor 15 px vs. body 13 px = **1.15× ratio**. Vignelli's minimum for readable hierarchy is 1.33× (typographic third). Refactoring UI recommends 1.25× minimum for adjacent text. **Terav's H2 / body ratio fails both.** This is the "everything looks the same size" complaint.

**Idea:** if body promotes to 14, DateNav header can go 16 semibold (`text-base font-semibold`) and block-category H2 can go 15 mono-caps. Ratio becomes 16/14 = 1.14 — still too tight — OR promote block H2 to 15 sentence-case semibold, drop the uppercase mono treatment there specifically, and the ratio becomes 15 vs. 14 with a *weight* differentiator (600 vs. 400). Weight change compensates for size closeness.

**Ideal target ratio system (Vignelli-adjacent):**
32 → 20 → 15 → 14 → 12 → 10. Ratios: 1.6, 1.33, 1.07, 1.17, 1.2. The 15→14 gap is the small one, resolved by weight (semibold vs. regular).

**Reject going further with this:** Terav is intentionally dense compared to Pliability. A rehab user *wants* to see program-context + phase + state on the fold. A dramatic hero-per-screen would lose that context. Hold the density; sharpen the hierarchy via weight and space, not scale.

---

## 7. Spacing & rhythm

Grep tally on top-level route files:

| Class | Count | Verdict |
|---|---|---|
| `gap-3` (12 px) | 20 | Dominant gap. Good — matches internal card padding. |
| `gap-2` (8 px) | 19 | Second-most. Icon-to-label pairing. Correct. |
| `gap-1` (4 px) | 11 | Icon-to-text-in-baseline. Correct. |
| `space-y-3` (12 px) | 11 | Card-list rhythm. |
| `space-y-2` (8 px) | 7 | Inline-list rhythm. |
| `space-y-5` (20 px) | 5 | Page-section rhythm. |
| `space-y-6` (24 px) | 4 | Page-section rhythm. |
| Ad-hoc `mt-[27px]` etc. | 0 | Zero arbitrary spacing. Clean. |

**Rhythm base = 4 px.** Every spacing token maps to a multiple: 4/8/12/16/20/24. No 6/10/14 outliers. **Excellent discipline.** This is where Terav is already peer-competitive with Linear / Cal / Anthropic-console. Hold this — do not introduce arbitrary `space-y-[X]`.

**Per-card rhythm verdict:**

| Card | Padding | Between-child gap | Verdict |
|---|---|---|---|
| Today card ProposalCard | `p-4` (16 px) via `ProposalCard.tsx` | `space-y-2` internal | Right rhythm. Matches GOWOD's 24 internal — one notch tighter, which is on-brand for Terav's higher density. |
| Today card ExerciseCard | Zero outer padding + child rows with `px-3 py-2` | 8 px between rows | Wall-of-text risk. See §7.1. |
| Coach empty-state | `p-4` (16 px) | `space-y-3` | Correct. |
| Week day row | `px-4 py-4` (16/16) — Batch 16 bump | `gap-3` header | Correct. Reads exactly like GOWOD after the batch. |
| Profile identity chip | `px-4 py-3` (16/12) | `gap-3` | Slightly under GOWOD's 76 px — chip is 72 px effective. Fine. |
| Profile programs list row | `px-3 py-3` (12/12) | Divider | 12/12 is one notch tight vs. the Week `16/16`. **Recommend bumping to `px-4 py-3.5`.** |

### 7.1 ExerciseCard density

`ExerciseCard.tsx:111-125` renders as `article` with `bg-surface border border-line rounded-md overflow-hidden`. Zero outer padding on the article — children (header row, set-list, notes) set their own. Consequence: the visual gutter between the article edge and the first set-row is inconsistent (0 px in some states, 12 px in others) because different children have different padding.

**Idea:** add `p-3` outer padding to the article and remove per-child edge padding. Or the reverse — standardize on per-child `px-3` and set outer to `p-0`. Pick one. Right now: mixed.

**Why to REJECT restructuring:** ExerciseCard is the single most-touched component in the app. Any refactor risks regressing sets-log input UX, which is the primary interaction. **This is a follow-up brief, not a batch-17 item.**

### 7.2 Between-card gap on Today (persona-strength)

Persona-strength Today shows: ProposalCard → HeroStateCard strip → SignalsStrip → BlockSection with 4 ExerciseCards → SessionActions → RunSlotCard. That's a 7-block scroll. Top-level rhythm is `space-y-5` (20 px) via `page.tsx:182`. **20 px gap between semantic blocks reads correctly.** Compare Runna, which uses 24 px — Terav is one notch tighter, on-brand.

---

## 8. Grid & alignment

Container: `max-w-[760px] mx-auto w-full px-4 sm:px-6` at `AppShell.tsx:116` and `:148`. Every route inherits this. **Consistent.** Header, main, and bottom-nav all share the 760 px cap.

**Left-edge alignment check** (persona-strength Today at 393 px viewport):
- Wordmark "TERAV" left-edge: 16 px from viewport left (`px-4`)
- DateNav card left-edge: 16 px
- Phase readout left-edge: 16 px (via container `px-4`)
- Proposal card left-edge: 16 px
- HeroStateCard strip green-dot: 16 px
- BlockSection has `pl-3` inside (`page.tsx:1113`) — so the block category label sits at 16 + 12 = 28 px from viewport left. **Different from every other card.** By design — the left-border spine is the block-category color indicator.

**Verdict: intentional misalignment.** The block spine is a load-bearing category cue (bronze = strength, green = run, slate = accessory — `page.tsx:1111`). Keep. This is Refactoring UI's rule for meaningful color-as-structure.

**Baseline alignment on numbers:** Progress page (persona-strength `05-progress.png`) — the "115 kg / 141 bpm / 32 min" column right-aligns via `text-right` in the RetestMetricsPanel row grid. Tabular-nums inherit → columns line up. Verified reading.

**Bottom-nav icon alignment to grid:** BottomNav `ul` uses `flex items-stretch` with `flex-1` per item and `justify-center` internal. On a 393 px viewport / 5 items = ~78.6 px per item. Icons are `size={20}` centered. **Alignment holds** because each `<li>` is equal-width flex-1.

---

## 9. Whitespace — dead vs. breathing

**Bottom-nav gutter** — `main` at `AppShell.tsx:148` sets `paddingBottom: calc(64px + env(safe-area-inset-bottom) + 1rem)`. The 1 rem (16 px) is the breathing gap between last content and the fixed nav. Correct — one rhythm unit. No dead 60 px zone.

**Header top padding** — `header` at `AppShell.tsx:116-119` uses `paddingTop: env(safe-area-inset-top)` then `pt-3` (12 px) on the inner div. Total on iPhone 14 Pro at 393×852 with 59 px safe-area-inset-top = **71 px from screen edge to wordmark baseline.** GOWOD uses ~44 px (safe-area + 8 px). **Idea:** on-brand for Terav (we're deliberately denser). Not a change. But be aware: another 12 px of top-margin on the H1 will feel plush.

**Between-section vertical rhythm** — `space-y-5` (20 px) between top-level sections on Today. Between H1 and next section on Progress/History: header has `mt-1` on subtitle (`history/page.tsx:100`), then next section takes over. **The H1 → next-section gap is defined only by the `space-y-6` on the top-level `<div>` in Progress (`progress/page.tsx:120`, not shown but standard).** Verify visual: from screenshot `05-progress.png`, the "Progress" H1 to "Week of 17 Aug" card gap is ~28 px. That's `space-y-5` + a little padding — clean.

**Empty-state whitespace** — persona-erratic Coach (`03-coach.png`) shows the Coach empty-state card taking ~40% of the fold, then ~60% of the fold is empty. The Coach page correctly renders nothing else because the feature is "Coming soon." **This is correct restraint.** Do not fill the fold. iA rule: absence is a design element.

---

## 10. Iconography

- **Icon set:** lucide-react everywhere. Zero Heroicons, zero custom SVG inline in components (verified via grep on `<svg`). Clean.
- **Stroke widths in use:** 1.5, 1.75, 2, 2.25, 3.
  - `strokeWidth={1.5}` on `BarVisualizer.tsx:77, 100` (2 hits) — decorative visual for weight bars
  - `strokeWidth={1.75}` — the dominant stroke, matches Terav's "quiet chrome" tone (11 hits across AppShell / HeaderQuickLinks / ExerciseCard / RunSlotCard / progress/page.tsx)
  - `strokeWidth={2}` on `SymptomLoadChart.tsx:142, 152` — Recharts default, intentional
  - `strokeWidth={active ? 2.25 : 1.75}` on nav icons (`BottomNav.tsx:63`, `HeaderQuickLinks.tsx:98`) — active-state weight bump, correct pattern
  - `strokeWidth={3}` on checkmark inside a `Check` icon (`ProgramPreviewClient.tsx:377`, `IntakeClient.tsx:575, 976`) — 3 hits — needed for the `size={11}` micro-check to be visible; correct exception
- **Icon sizes:** 11 (checkmark), 15 (inline actions), 16 (nav utility, section-header inline), 18 (top-nav utility), 20 (bottom-nav primary). **Five sizes.** Peer target is 3-4. **Recommend:** kill 15 (bump to 16 across `ExerciseCard.tsx:209, 222, 224` and `RunSlotCard.tsx:256`). Four sizes is enough.

**Verdict: near-discipline.** Stroke-width story (1.5 for viz, 1.75 quiet, 2.25 active) is intentional and coherent. Size sprawl to 5 is one notch loose.

---

## 11. Charts

### 11.1 Heatmap (`components/charts/Heatmap.tsx`)

- 8 weeks × 7 days visible grid. Cell rendered with fixed row-height derived from container.
- **Fill colors:** green (`--color-green`), amber (`--color-amber`), red (`--color-red`), bronze-for-accessory-only, empty-line for none. Legend rendered below (`04-history.png` shows this correctly).
- **Persona-erratic (`04-history.png`):** 45 days sparse, mostly amber. The visual signal reads because empty cells are `bg-line-soft` (very quiet) and amber cells fill without shouting.
- **Persona-strength (`04-history.png`):** 30 days dense green — reads as "consistent." Even one red cell (visible in the recover 30-day heatmap `04-history.png`) draws the eye immediately.

**Verdict: the heatmap is Terav's strongest chart moment.** GitHub-contribution pattern is well-established, the color mapping is one-color-one-meaning, empty vs. filled distinction is subtle-vs-loud correctly. Hold.

**Nit:** cell corner-radius not set explicitly — inherits browser default 0. Compare GitHub which uses 2 px rounded. **Idea:** add `rounded-[2px]` on cell — softens the grid without losing crispness. Minor.

### 11.2 SymptomLoadChart (`components/charts/SymptomLoadChart.tsx`)

- Recharts `ComposedChart` (Bar + Line) with dark-theme palette declared in-file at lines 72-77.
- Grid: `#2A2E37` (custom, not from tokens). Axis line: `#3A3F4A` (`--color-line`, correct). Axis tick text: `#D6D9DE` (`--color-ink`, correct).
- Symptom red: `#E5654B` (`--color-red`, correct). Squat/pull lines: token colors.
- Grid color `#2A2E37` is between `--color-line-soft` (#24272f) and `--color-line` (#3a3f4a) — **rogue hex**, not one of the tokens.

**Idea:** swap the grid to `--color-line-soft` (#24272f) so grid is quieter than axis. Right now grid is close-to-axis in weight, which reads as "double-line noise" on persona-recover Progress chart (`05-progress.png`, visible in bottom half). Grid should be a whisper; axis should carry the structure.

**Reject the counter-move (adding more chart chrome):** Recharts default grays are too heavy for warm-dark. Terav's custom-declared palette is the right instinct. Just clean the one rogue hex.

### 11.3 Small progress bar (Per-track adherence)

`persona-strength/05-progress.png` bottom half shows "concurrent strength maintenance · 23/25 done · 92%" with a fill bar that mixes green and purple/gray segments. That's an old "green done / purple upcoming / gray skipped" tri-color pattern. **Reads confused at 393 px** — the purple segment implies a fourth semantic that isn't documented anywhere. Verify what "purple" means here (`PerProgramAdherenceCard.tsx`) — if it's "upcoming/skipped delta," swap to `bg-muted` / `bg-line`. If it's an actual accent, add it to the token palette formally. Right now: unaccounted color = chaos.

**Related grep verify:** the two documented laterality tokens `--color-lat-left` (`#4a8894`) and `--color-lat-right` (`#a279a8` — purple) are the two rogue-feeling tokens. `lat-right` purple may be leaking into the adherence bar. If so — laterality colors should NOT be used for adherence semantics. Different domain.

---

## 12. Wordmark & chrome

`AppShell.tsx:123` — "TERAV" wordmark at `font-mono text-[13px] uppercase tracking-[0.22em] text-bronze` with a readiness-dot (`h-2 w-2 rounded-full`) right of it.

**Reads as:** a tiny, tight, technically-typeset anchor. Consistent across every authenticated route. **Correct restraint.** Peer comparison: GOWOD's wordmark is centered at ~13 px; Whoop's is off-screen entirely (bottom-nav only); Pliability's is a wordmark at ~15 px top-left.

Terav's is smaller than all three peers except Whoop. **That's on-brand** — Terav is a coach, not a hero. The user should think about their session, not the product name.

**Nit:** the readiness dot to the right of the wordmark (`AppShell.tsx:170-186`) is a load-bearing status indicator (green/amber/red/none). At `h-2 w-2` (8 px), on `text-[13px]` wordmark baseline — the dot is slightly off-baseline (mono cap-height is ~9 px). **Not a real issue** — the dot is decorative anchor, not a text glyph — but if we ever redo the header, align the dot to the wordmark's optical center by shifting `mt-[1px]`.

---

## 13. Sparse-vs-dense stress test

### Today

- **persona-recover Today (`01-today.png`):** dense — ProposalCard ("advance to Cycle 1"), HeroStateCard strip, ProposalStack banner, BlockSection with 4 ExerciseCards, SessionActions, RunSlotCard. Reads *scannable* because the block-color spine (bronze) is doing structural work and card-internal rhythm is consistent.
- **persona-strength Today (`01-today.png`):** medium density — ProposalCard "Room to push", HeroStateCard, one Strength block with 1 exercise (front squat crossed-out done), SessionActions, RunSlotCard. **Holds.**
- **persona-erratic Today (`01-today.png`):** amber morning-check state, downshift banner, one strength block, actions. **Holds.**

**Verdict: dense state holds because color spine + `space-y-5` rhythm carry the structure.** No card looks orphaned; no card looks nested-inside-another.

### Coach empty-state

- **All three personas** see the same "Coming soon" card + one-line meanwhile-text. **Correct.** No attempt to fill the fold. Aggressively minimal. Peer: Whoop would put a photo hero here; Pliability would put a curated-content strip. Terav puts nothing. On-brand.

**Reject the peer pressure:** do NOT fill the Coach empty-state fold. When Coach ships, replace the whole page. Until then, absence is honest.

### Week

- **persona-recover Week (`02-week.png`):** dense — phase-banner + 7 day-rows with block-name lines + conditioning italics + logged-lift roll-ups.
- **persona-strength Week:** less dense — retest phase, fewer conditioning branches.
- **persona-erratic Week (not read but inferable):** many skip states.

**Post-Batch-16 verdict** (from source, not artifact): `px-4 py-4` internal padding + collapsed default (`expandedDays` starts empty, `week/page.tsx:36`) means the collapsed one-line-per-day reads correctly. Tap to expand shows the rest. **This is the Runna-style compression the GOWOD study recommended and it landed correctly.**

### History heatmap

- **persona-recover:** 30 days of amber (rehab-appropriate) with clean grid.
- **persona-strength:** 30 days of green — reads as consistency.
- **persona-erratic:** 45 days sparse amber — the heatmap's sparse-tolerance is *good*. Empty cells stay quiet; filled cells announce.

**Verdict: heatmap is the app's strongest visual moment for sparse-vs-dense stress.** Holds at both ends.

### Progress

- **persona-recover Progress (`05-progress.png`):** Symptom vs. load chart with 3 data lines (peak symptom, pull top, squat top) + bar for symptom + rehab-consistency 0/30. Dense but structured. Chart is the anchor; textual milestones follow.
- **persona-strength Progress (`05-progress.png`):** Concurrent-strength weekly summary + retest metrics table. Table is the anchor.
- **persona-erratic Progress (`05-progress.png`):** similar to persona-strength but with amber morning-check counts.

**One issue in all three:** the adherence-bar mixed-color segment (green + purple + gray) — see §11.3. Fix that one token misuse.

---

## 14. Batch 16 verdict — direction, size, gaps

The Aug 19 batch bumped H1s to 32 px, added the identity chip on Profile with a bronze 48 px avatar, moved Delete under a "Danger zone" disclosure, bumped Week card padding `px-3 → px-4`, and removed the "Programs" pill from the Week header.

**Judgment against the peer set:**

| Change | Direction | Size | Peer echo |
|---|---|---|---|
| H1 → 32 px on all 7 top-level routes | **Right direction.** | Right size — GOWOD is 34-40, Whoop is 40. 32 gives Terav the anchor without landing-page hero-scale. | GOWOD, Whoop, Pliability all ≥ 32. Match. |
| Profile identity chip w/ 48 px bronze avatar | **Right direction.** | Right size — GOWOD is 56 px avatar in a 72 px chip; Terav went 48/76. Slightly leaner. On-brand for the denser Terav idiom. | GOWOD, Linear, Ladder all chip-based Profile top. Match. |
| Delete → Danger zone disclosure | **Right direction.** | Right compromise — full-remove would have shipped later, disclosure is the 1-hour version. | Github/Linear pattern: destructive under `<details>`. Match. |
| Week card padding `px-3 → px-4` | **Right direction.** | One notch. Could arguably go `py-4` more aggressive (matches GOWOD 24). Current `py-4` = 16 px is on-brand for Terav density. Hold. | GOWOD 24 / Runna 20 / Terav 16. Terav is intentionally denser. Match. |
| "Programs" pill removed from Week header | **Right direction.** | Right full-remove. The pill was redundant — Programs is one bottom-nav tap away. | GOWOD, Pliability, Runna never put a nav-adjacent CTA on the H1 row. Match. |

**Where Batch 16 stopped too early:**

1. **Body copy is still 13 px.** All the H1-scale gains are undone by the fact that the paragraph the user actually *reads* is one notch under the readable floor. This should have been the *primary* change, not a corollary. **Highest recommend: bump `text-[13px]` → `text-[14px]` in a follow-up batch.**
2. **`text-bronze-hi` on the avatar initial is undefined.** The avatar looks fine because the `bg-bronze/20` chip is visible, but the letter inside is rendering `text-ink` (fallback). Bug.
3. **`text-amber-strong` on the interference banner is undefined.** Same class of bug — the "N tracks scheduled today" heading is rendering inherited color, not the intended loud-amber.
4. **The "Coming soon" Coach page has an oversized (18 px) semibold title inside a card.** After H1 promotion to 32 px, the Coach card title at 18 px reads mid-scale — competes with the tab's implicit "page = Coach" identity. If we do a Coach H1 at 32 px, the card title should go 20 (`text-xl`). Current `text-lg` inside the card = 18 px is the Batch 16 blindspot.

**Where Batch 16 got the size right by choosing NOT to go further:**

1. Did NOT go 40 px on H1 → correct. Terav is not GOWOD; no photography behind the header.
2. Did NOT introduce photos on Profile or Today → correct. iA rule: don't add what isn't load-bearing.
3. Did NOT increase card padding to 24 → correct. Terav is intentionally denser than Pliability.
4. Did NOT change the mono-caps pill idiom → correct. Mono is Terav's typographic identity.

**Batch 16 verdict overall: right direction, correct restraint on Terav constraints, one notch short on body-copy size, two undefined tokens leaked in.**

---

## 15. Competitive visual research

Peer set per `dev/audits/app/competitor-refs.md`. Web-fetch pull worked on GOWOD homepage only (Pliability + Runna + Whoop bounced 404 / marketing-only / 403). Peer detail is drawn from (a) the GOWOD study `dev/audits/app/2026-08-19-gowod-visual-system.md` (11 GOWOD JPEG screenshots analyzed), (b) the canonical `competitor-refs.md` file, and (c) direct knowledge of these apps' current UI (Pliability, Runna, Whoop are personally familiar).

### 15.1 Pliability

- **What to steal:** the "one arc per day" identity is the closest peer positioning to Terav. Their Today surface is a single hero card + one CTA. Pliability's hero card at ~180 px tall, one dominant word, one action. **Terav's Today has 4-6 cards** — that's the correct difference (we're a coach, not a mobility routine). But Pliability's *body copy is 16 px*. If Pliability's body is 16, Terav at 13 is two notches short.
- **What to reject:** Pliability's aggressive white space (they sit at `--color-ground` #F5F0E8 warm-cream, not warm-dark). Their palette is off-brand for evidence-first tone. Do NOT lighten the ground.
- **Cite:** competitor-refs.md line 20; earlier Aug-18 mobile-ux sweep captured Pliability's spacious card interaction.

### 15.2 GOWOD

- **What to steal:** oversized H1 (Batch 16 did this correctly). Identity chip (Batch 16 did this correctly). One-idea-per-card rule (Batch 16's `px-4` bump began this). See prior study `2026-08-19-gowod-visual-system.md`.
- **What to reject:** photography, blue "Let's go" CTA, Daily/Activate/Recover carousel, "Become Premium" upsell bar, the athlete-hero on every screen. Full list at prior study §2.
- **Cite:** `dev/audits/app/2026-08-19-gowod-visual-system.md` §1.1, §1.2, §1.3, §2.

### 15.3 Runna

- **What to steal:** the compressed weekly plan (collapsed one-line default, tap to expand, explicit `Move…` menu). Post-Batch-16 Week is doing this. **The batch nailed the Runna-shape without copying its colors.**
- **What to reject:** Runna's per-workout-type color system (blue easy, red intervals, purple long) is too loud for a rehab-adjacent product. Their color budget is 5-6 accents. Terav's is 1 primary + 3 semantic. Do not adopt Runna's color-per-workout pattern for Terav's Week rows.
- **Cite:** competitor-refs.md line 28; GOWOD study §3 mirrors Runna pattern.

### 15.4 Whoop

- **What to steal:** the single-metric hero card (recovery %, strain %). Whoop compresses dense biometric data into one number confidently. **Terav's HeroStateCard (green/amber/red) is the Whoop-analog and it's the strongest small card in the app.** Hold it.
- **What to reject:** the proprietary strain/recovery scores as a mental model. Whoop's core UX is "trust our number." Terav's is "we cite the paper." Different contracts.
- **Cite:** competitor-refs.md line 30.

### 15.5 Hevy — strength/logging peer

- **What to steal:** ghost-text-of-last-session inside the set-log input. Hevy pioneered this pattern; ExerciseCard already does it via `prevSets` (`ExerciseCard.tsx:68`). Verify visual: currently the placeholder is `placeholder:text-muted/70` — kill the `/70` per §5.2.
- **What to reject:** Hevy's dense multi-lift session hero — they overpack every log surface with plate visualizers, PR flags, timer bars. Terav's ExerciseCard is intentionally quieter; SessionActions carries the Move/Skip verbs. Do not bring Hevy's plate visualizer forward unless a founder-user explicitly asks for it.

### 15.6 Ladder

- **What to steal:** "one program at a time" positioning + program-detail hero. Ladder's program-preview page is Terav's `/programs/[slug]` peer. Both do a "here's the arc, here's the intake, then commit" flow.
- **What to reject:** Ladder's coach-photo-per-program pattern. Same rejection as Pliability/GOWOD photography.

### 15.7 Overall peer-set direction check

Batch 16 pushed Terav toward the *Pliability/GOWOD scale* on chrome (H1, identity chip, card padding) while holding the *Hevy/Ladder density* on content (still dense, still evidence-tagged, still cite-the-paper voice). **This is the correct fork.** Do not converge on Pliability's spaciousness (loses the density that makes the log useful) and do not converge on Hevy's plate-visualizer noise (loses the calm that keeps the app read-at-6am).

---

## 16. Priorities

**P0 (this week, if a batch-17 lands):**

1. **Bump body copy `text-[13px]` → `text-[14px]` system-wide.** 212 hits in `src/`. This is the single largest legibility gain remaining. Do NOT one-file at a time — do it as a `sed`-driven token migration and ship as one batch. Also promote `text-[11px]` → `text-[12px]` on captions where the copy is >1 line. Kill `text-[9px]` outright. Target sizes: 32/20/15/14/12/10.
2. **Define `--color-bronze-hi` and `--color-amber-strong` in `globals.css`, or delete the classes.** Two undefined-token bugs. Bronze-hi target: `#e2b686` (bright bronze for on-tint use). Amber-strong target: `#f0b854`.
3. **Kill `text-muted/70` (6 usages).** Two muted levels max. Currently three.

**P1 (this month):**

4. **Rehab safety copy (`page.tsx:315-321` skill safety, `:299-307` interference, `:267-273` taper) — bump body to 14 px minimum regardless of system-wide.** Safety copy at 13 muted is exactly wrong.
5. **Icon size sprawl → 4 sizes.** Kill 15, bump to 16 in `ExerciseCard.tsx:209, 222, 224` and `RunSlotCard.tsx:256`.
6. **Slate demotion on non-interactive left-borders.** `border-l-slate` on DayHeaderShortcut (`page.tsx:538`) and RestDayCard variants (`page.tsx:999, 1023, 1033`) — swap to `border-l-line` so slate reserves its meaning for interactive/marker roles.
7. **PerProgramAdherenceCard's tri-color bar (§11.3) — remove the purple segment or add it to tokens.** Rogue color leaking.
8. **Heatmap cell `rounded-[2px]`.** GitHub-tier polish. 30-second change.
9. **SymptomLoadChart grid color `#2A2E37` → `--color-line-soft` (#24272f).** One rogue hex; unify grid quietness against axis structure.

**P2 (nice to have, when a redesign brief lands):**

10. **ExerciseCard padding standardization.** Pick per-child `px-3` or outer `p-3`; not both.
11. **Programs list row `px-3 py-3` → `px-4 py-3.5`.** Aligns to Week card rhythm post-Batch-16.
12. **Block-category H2 mono-caps → sentence-case 15 px semibold.** Softens the "server-log admin" tell where the mono-caps H2 sits between two body-copy paragraphs (Coach card, block notes). Rejectable — mono-caps IS Terav's identity; only revisit if a rehab-only user cohort emerges.
13. **Re-run persona harness (`dev/scripts/run-app-audit.sh`).** Current artifacts predate Batch 16 by ~24h. Next audit needs the updated pixels.

**Do not ship (rejected on Terav constraints):**

- Photography anywhere in the app.
- A second primary accent (nothing that competes with bronze for CTA).
- A larger H1 than 32 px (we don't need Whoop-scale without the score-donut hero).
- Softer mono-caps everywhere (mono is Terav's technical identity; keep it for numeric readouts, block-category labels, and pills).
- Streak/challenge/gamification counters (violates the confirm-first, cite-the-paper contract).
- Filling the Coach empty-state fold (absence is honest).

---

## Appendix — files touched by this audit

- `next-app/src/app/globals.css` — palette tokens read; two missing tokens (`bronze-hi`, `amber-strong`) named.
- `next-app/src/app/layout.tsx` — font pairing (Inter + JetBrains Mono via `next/font/google`) verified.
- `next-app/src/components/AppShell.tsx` — header + wordmark + main container.
- `next-app/src/components/nav/BottomNav.tsx` — nav labels + icon sizes.
- `next-app/src/app/page.tsx` (Today) — Batch 16 H1 promotion verified across ProposalStack, HeroStateCard, BlockSection, RestDayCard, GraduationCard.
- `next-app/src/app/week/page.tsx` — Batch 16 `px-4 py-4` + expandedDays default-collapsed verified.
- `next-app/src/app/history/page.tsx` — H1 promotion + heatmap render verified.
- `next-app/src/app/progress/page.tsx` — H1 promotion + PerProgramAdherenceCard tri-color flagged.
- `next-app/src/app/profile/page.tsx` — Batch 16 identity chip + Danger zone disclosure verified; `text-bronze-hi` bug flagged.
- `next-app/src/app/coach/page.tsx` — empty-state card acceptable; card title fold to 20 px flagged for post-H1-32-px.
- `next-app/src/components/workout/ExerciseCard.tsx` — padding inconsistency + last-session-ghost pattern.
- `next-app/src/components/workout/ProposalCard.tsx` — Accept/Ignore button pattern (bronze primary CTA).
- `next-app/src/components/charts/Heatmap.tsx` — 8×7 layout, corner-radius nit.
- `next-app/src/components/charts/SymptomLoadChart.tsx` — grid color rogue hex flagged.
- `next-app/tests/e2e/artifacts/personas/{recover,strength,erratic}/mobile/*.png` — 12 mobile screenshots read; note predate Batch 16.
- `dev/audits/app/competitor-refs.md` — canonical peer set.
- `dev/audits/app/2026-08-19-gowod-visual-system.md` — GOWOD study (11 JPEGs) drawn upon.
- `dev/audits/app/2026-08-18-app-audit-visual-craft.md` — prior audit; carry-forward P0-2 body-size gap unresolved.
