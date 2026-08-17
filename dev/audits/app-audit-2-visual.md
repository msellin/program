# Terav — Visual & Interaction Audit

Lane: color, motion, touch, feedback, micro-interactions, dark-theme depth.
Reference apps cited: Whoop 4.0, Duolingo, Headspace, Peloton, Ultrahuman, Strava, Apple Fitness, Runna.

Screenshots requested at `/Users/margussellin/Downloads/d36fb209…`, `9be7fb07…`, `b7e896e2…` are **not present** on disk. Findings below are grounded in the source only.

---

## 1. The dark theme verdict

**The depth is real, but shallow.** The palette has three surface layers — `--color-ground #0E0F12`, `--color-surface #16181C`, `--color-surface-2 #20232A` (`globals.css:10-12`). That's the right shape: canvas → card → elevated. Compared to Whoop 4.0's four-layer stack and Ultrahuman's near-obsessive tint-per-elevation, Terav is under-utilising the tokens it already owns.

Concrete symptoms:

- `bg-ground` (the darkest) is only used on the body + on the bronze/amber button text. It's not used as recessed inset (input wells, sunken tabs) the way Whoop uses its darkest tone.
- `surface-2` (the lightest) is used for hover / active states on top-nav icons only (`AppShell.tsx:126`, `DateNav.tsx:31`), never as a resting elevated surface. Peloton and Runna both lift bottom-nav / hero card off canvas with a distinct tone — Terav uses one flat `bg-surface` for everything from ExerciseCard to BottomNav to the sticky top.
- No pure `#000` in the app UI (found only in a modal scrim `bg-black/60` on `ProgramPreviewClient.tsx:517` — fine).
- No inner shadow / hairline highlight on cards. Ultrahuman + Whoop both apply a 1-2 % white top-inset to imply lifted glass. Terav's cards read as flat rectangles because the border `#2a2e37` is only ~4 % lighter than `surface`.

**Verdict:** two elevation levels are working; the third is unused. This is the biggest single fix — see P0 #2 below.

---

## 2. Color semantic model

Accent inventory as it stands:

| Token | Hex | Current uses | Implied meaning |
|---|---|---|---|
| bronze | #C89666 | Primary CTAs, wordmark, PR chip, streak (pending), focus ring, retest reminder, TERAV logo, "cue" tag on ExerciseCard, Home icon in DateNav, phase progress "week X of Y", block category "strength", checkbox accent | brand / primary action / PR / heat |
| slate (mislabelled "teal") | #79B8C4 | Suggested TM, prescribed set text, ambient nudges ("Rescheduled", "Ready to leave reintro" label), Not today buttons, "logged" chevrons, phase-context accents, block category "accessory" | informational / neutral-positive |
| green | #5FB37A | Ready state, PR advance banners, TM delta positive, block category "run", set-complete underline | good / progress |
| amber | #E0A63A | Warnings, "Load with care", interference window, morning-check overdue, day-adjust proposal | caution |
| red | #E5654B | Ease off, escalate to clinician, TM regression | stop / danger |
| lat-left | #4A8894 | Left-side laterality tag | left |
| lat-right | #A279A8 | Right-side laterality tag | right |

**Broken references:** `text-teal` and `border-l-teal` at `programs/page.tsx:163-164` and `SetRow.tsx:143` doesn't resolve — the token in `globals.css` is `--color-slate`, not `--color-teal`. Tailwind v4 will silently no-op these classes; on skill / gymnastics category cards you're getting *no accent color at all*. **Clearly broken.**

**Semantic problems (matter of taste, but load-bearing):**
- Bronze is doing eight jobs. Whoop keeps its red-accent for one thing (strain). Duolingo owns green for "correct", never used for a chrome button. Bronze right now means: brand, primary action, PR celebration, retest reminder, focus, phase context. When a user sees bronze, they don't know if they're supposed to *tap* it or admire it.
- Slate (the "teal" secondary) is doing dismiss + prescribed + informational + rescheduled + suggestion. In `TMSuggestionInline` (`ExerciseCard.tsx:379`) slate marks the *suggested value*, in `DayAdjustmentProposal` slate is *dismiss*, in `HeroStateCard`… slate is absent. No pattern the user can internalise.

**Recommended model:**

| Meaning | Color | Rule |
|---|---|---|
| Primary action / CTA | bronze | Only on filled buttons + the wordmark. Kill the bronze on retest reminder, home icon, phase context. |
| Prescribed / engine says | slate | All engine-generated numbers (`SetRow` prescribed, TM suggestion, phase progress). |
| Achieved / progress | green | PR underline, set-complete underline, positive delta, streak-active. **Move PR chip from bronze to green.** |
| Caution | amber | Load-care, overdue, interference, provisional badge. |
| Stop | red | Red-state, escalation, delete confirmation. |
| Laterality | lat-left / lat-right | Never used for anything else. |

The single largest semantic-clarity win is **giving green the PR celebration** (Strava's own rule — orange = KOM, but *your* PR is the celebratory event, and green is what the app currently owes you). Bronze then becomes brand + primary action only. See P0 #1.

---

## 3. Touch target audit

Targeted findings:

- **Broken:** BottomNav tab has `min-h-[52px]` and `py-2` — 52 px is fine. But the tab's icon `size={20}` and 9 px label at `text-[9px]` (`BottomNav.tsx:42, 47`) is too small on cheap Android and far below Apple Fitness's 12-13 px minimum. **Legibility problem, not target problem.**
- **Below spec:** HeaderQuickLinks `⋯` overflow trigger is `w-9 h-9` = 36 px (`HeaderQuickLinks.tsx:65`). Apple HIG minimum is 44. This is the *primary access to Programs, Extras, Coach, Report, Data, Guide* — 7 destinations behind an undersized tap.
- **Below spec:** Sticky-nav Stethoscope link `w-11 h-11` at `AppShell.tsx:126` is 44 px — correct.
- **Fine:** ExerciseCard checkbox is `w-11 h-11 -my-1` (`ExerciseCard.tsx:133`) — 44 px, correct. Contents is a `w-5 h-5` checkbox visually but the label is the hit area.
- **Below spec:** ExerciseCard Play/Info secondary buttons are `w-9 h-9` (`ExerciseCard.tsx:189, 199`). 36 px. On the row where PR chip, checkbox, name button and two icon buttons compete, `w-9` icons make the two secondaries **the smallest priority thing in the row that isn't a static label** — correct information hierarchy but wrong touch spec.
- **Below spec:** SetRow's Note + Trash buttons are `w-11 h-11 -my-2` (`SetRow.tsx:119, 134`) — 44 px, fine. But the row is 7 columns; the note + trash sit at the far right of a 44-px-tall row. On a 390-px viewport the row's actual gesture area is tighter than 44 because the weight/reps inputs claim `minmax(70px,80px)` and `minmax(60px,70px)`.
- **Fine:** SetRow inputs all `min-h-[44px]` (`SetRow.tsx:73, 95, 111`).
- **Fine:** DateNav prev/next/home are `w-11 h-11` (`DateNav.tsx:31, 45, 54`).
- **Not broken but ambiguous:** ExerciseCard `Play` (video) and `Info` (details) icons sit *side by side* at 36 px each with 2 px gap (`gap-0.5`, `ExerciseCard.tsx:183`) — the two hit boxes are effectively touching. Users will mis-tap.
- **Broken:** DayAdjustmentProposal Apply / Not today buttons — `px-3 py-2` with `text-[11.5px]` (`DayAdjustmentProposal.tsx:110, 117`). Vertical size ≈ 32 px. Same on `ReadinessProposal`. This is the *confirm-first commit interaction* and the buttons are the smallest tap targets in the flow.

**Play/Info distinguishability on ExerciseCard:** Play uses a filled play triangle (lucide Play), Info uses an outlined `i`. Warning replaces Info with `AlertTriangle` in amber. This is correct — two shapes, distinct colors when semantic. Fine.

---

## 4. Micro-interaction inventory

**What exists:**

1. `card-in` keyframe: `translateY(4px) → 0, opacity 0 → 1`. Declared in `globals.css:109` but **not applied anywhere I could find** — declared and orphaned.
2. `tag-in` keyframe: `scale(0.9) → 1`. Used exactly once — the PR chip on `SetRow.tsx:143`. Nice moment; buried in a set row where it competes with 6 other elements.
3. `HeroStateCard` has `active:scale-[0.98]` (`HeroStateCard.tsx:69`). Good iOS-native pattern; the only place in the app.
4. `RestTimer` has a `transition-all duration-500` on progress bar width (`RestTimer.tsx:70`). Vibrates on hit — 3 real haptic pulses (`RestTimer.tsx:48`). This is a delightful moment nobody sees unless they scroll to it.
5. `IntroGallery` — `transition-all` on pagination dot (`IntroGallery.tsx:175`). Correct.
6. `Heatmap` cells — `transition-colors` on hover (`Heatmap.tsx:145`). Desktop-only real payoff.

**That's the whole motion budget.** Six transitions across the whole app; two of them are keyframes; one keyframe is orphaned; no shared motion language.

**Missing, ranked by payoff:**

| Rank | Missing | Where it belongs | Reference |
|---|---|---|---|
| 1 | Set-complete flash | `SetRow` when both weight+reps first fill | Strava's KOM flash; Duolingo's XP shine |
| 2 | Save-check confirmation | `check/page.tsx` after `save()` — the state Verdict box slides in but there's no "committed" moment | Headspace's session-end fade |
| 3 | Accept proposal ack | `DayAdjustmentProposal`, `ReadinessProposal`, `TierAdvanceProposal` after `Apply` — button just disappears, no ack that ×0.90 is now active | Runna's plan-adjust card collapse |
| 4 | Streak advance | `StreakChip` — `count` changes silently. Duolingo's tumbling flame is the gold standard here | Duolingo |
| 5 | Card-in on Today load | The orphan `card-in` keyframe applied to `ExerciseCard`, `SignalsStrip`, `HeroStateCard` in a 30 ms cascade | Linear-style stagger |
| 6 | Checkbox check anim | ExerciseCard done — checkbox uses native `accent-bronze`, no bounce/tick draw | Apple Fitness ring close |
| 7 | Rest timer entrance | `RestTimer` appears bottom-3 — slide up from bottom + subtle glow when a set fills | Peloton set logging |
| 8 | Long-press feedback | None anywhere. Long-press to delete a set instead of the trash icon would clean up SetRow | Instagram / Ultrahuman |

**Verdict:** motion is not merely restrained — it is functionally absent. Two keyframes in `globals.css`, one applied, one dead. The app is all snap-cut render. This is the second highest-leverage fix after depth.

---

## 5. The sticky nav bar

Composition: `TERAV | Stethoscope | ⋯` (`AppShell.tsx:113-133`).

**Right composition? Mostly, but the ⋯ menu is doing too much.**

`HeaderQuickLinks` hides 7 destinations behind one 36-px icon: Programs, Check, Extras, Coach, Report, Data, Guide (`HeaderQuickLinks.tsx:18-26`). Check is *also* pinned to the stethoscope. That's a double-dip: the stethoscope AND the menu both go to `/check/`.

The 7-item menu includes **Programs** — arguably the most important secondary destination in the app (it's how a user swaps their active program). Programs deserves a home outside a hamburger. Sessions / Plan aren't currently in the nav at all, and don't need to be — Today already contains "the plan" for the day, and `/week` is a bottom-nav tab.

Recommended shape:

- **TERAV** (left) — wordmark, links to `/` ✓
- **Programs** (middle-right) — Layers icon, direct link. Elevates the "switch program" job to be discoverable.
- **⋯** (right) — Extras / Coach / Report / Data / Guide only. Drop Check (redundant with stethoscope) and Programs (promoted out).
- **Stethoscope**: reconsider. It's a nice bit of clinical semiotics but on mobile at 18 px it's an ambiguous glyph. Peloton would use a heart icon; Runna uses "Recovery". A labelled tab-style pill "Check" — no icon — would be clearer, and the wordmark on the left already carries all the brand.

The stethoscope is a "matter of taste" call. The Programs-in-the-menu problem is clearly broken UX for a multi-program app.

---

## 6. Empty states — each tab

- **/programs** on empty account (`programs/page.tsx:108-110`): shows filter chips + "Nothing in this category yet. Try another…". Fine when a category is empty, but on a truly-empty catalog no invite exists. This won't happen in production, but on a "personal" hidden-program flag it can. Ok.
- **/week** on empty account (`week/page.tsx:68-83`): "Pick a program to see the weekly rhythm here" + bronze CTA "Pick your program →". **Good.** Direct, action-first, no motivational fluff.
- **/progress** on empty account (`progress/page.tsx:82-95`): "Pick a program to see your training maxes, milestones, and trends here" + "Start a program →". **Good, same pattern.**
- **/report** on empty account: `initialLogCount >= 28 ? "12w" : "all"` (`report/page.tsx:43`) — clever default but the empty-state itself is a chart placeholder inside RetestMetricsPanel. A user landing on `/report` with zero data sees empty sections everywhere; there's no single "log a session to fill this" invite. **Weakest of the five.**
- **/history** on empty account (`history/page.tsx:52-60`): "No entries yet. Log a session or save a morning check." dashed border, centered. Functional, but the *only* one with dashed-border styling. Inconsistent.

**All five tell you nothing is here. None invite an action with more than a text link.** Duolingo's empty state has an illustration + a button + a copy hook. Runna's has "Add a race to start" with a preview of what the tab will look like when populated. Terav's are correct-but-cold. The single fix: bring Week / Progress's pattern (bronze pill CTA) to History + Report, and make each empty state show a **muted preview of what will populate** (a ghost sparkline, a greyed-out heatmap, a placeholder card) — Strava, Whoop, and Ultrahuman all do this.

---

## 7. The bronze accent — where it lives, where it's overused

**Overused:** TERAV wordmark + bronze CTA + PR chip + streak pending + phase progress + retest reminder + focus ring + cue tag + Home icon + block-strength category. Ten uses.

**Missing:** No bronze on the checkbox tick-completion moment (it's `accent-bronze` on native which is fine, but the *event* isn't celebrated). No bronze on session-complete. No bronze on TM-set moment on the `TMSuggestionInline` — the accept button is `border-slate` there (`ExerciseCard.tsx:388`), which reads as neutral.

**Recommendation:** restrain bronze to two roles — brand mark + primary filled CTA — plus one *earned* role: PR-fired chip. Move phase-progress accent to slate (informational). Move retest-reminder accent to slate. Move Home-icon to muted. This gives bronze rarity, which is the whole point of a warm accent in a dark palette.

---

## 8. Ambient / grid overlay

**Not found in code.** No `bg-grid`, no `Ambient` component, no radial-gradient overlay in `globals.css`, no SVG grid pattern in the source. If the design brief mentions it, it's not shipped. This is either a good call (mobile OLED noise on dark-grid patterns hurts contrast; Ultrahuman removed theirs in 2024) or an unshipped intent. Either way — nothing to critique. If it were introduced later, cap opacity at ≤ 3 % and clip to the top viewport heights only.

---

## 9. Empty states — the invite question

Covered in §6. Verdict: they inform, they don't invite. History + Report are the weakest.

---

## 10. Morning-check flow — slider + accept feedback

The flow (`check/page.tsx:100-195`):

1. User drags one of ~7 sliders. Slider uses native `input[type=range]` with `accent-bronze` (`globals.css:81`). **No haptic on drag. No value pop.** The value renders in a static column on the right (`check/page.tsx:247-250`).
2. User taps "Save check". Button is `bg-bronze` with `hover:bg-bronze-hover active:bg-bronze-active transition-colors` (`check/page.tsx:185-191`).
3. `Verdict` box appears below (`check/page.tsx:277-300`). No enter animation, no scroll-to, no confetti. It just... exists on the next paint.

**This is the "confirm-first" flagship interaction and it feels invisible.** Compared to:
- Whoop's Recovery slider: value pops on drag, haptic tick every 10 %, save fades into a recovery-color background wash.
- Runna's morning check: save collapses the form and animates a coloured banner in.
- Headspace's mood check: entire background hue shifts to the mood colour.

Minimum viable fixes for Terav (P0):
1. `navigator.vibrate(15)` on slider `input` event throttled to once per 200 ms.
2. `Save check` — on click, disable + swap to "Saved ✓" for 800 ms, then fade Verdict card in with the existing (dead) `card-in` keyframe.
3. Verdict's top border tint (`border-l-green/amber/red`) — animate the border-color transition over 400 ms so the state change reads as a *decision* the app made.

None of these are exotic. They are the difference between "app processed my input" and "app understood".

---

## Top 10 fixes — ranked

| # | Priority | Change | File:line | Rationale |
|---|---|---|---|---|
| 1 | P0 | Wire `card-in` keyframe into `HeroStateCard`, `SignalsStrip`, `ExerciseCard` root with staggered `animation-delay` — 30 ms cascade | `HeroStateCard.tsx:63,69`, `SignalsStrip.tsx:159`, `ExerciseCard.tsx:105` + `globals.css:109` | Today feels dead-flat on first paint. Orphan keyframe → live. |
| 2 | P0 | Introduce third elevation. `bg-surface-2` for sticky top-nav + bottom-nav + HeroStateCard resting state; keep `bg-surface` for cards | `AppShell.tsx:113`, `BottomNav.tsx:28`, `HeroStateCard.tsx:35` | Depth exists in tokens, not in render. |
| 3 | P0 | Add on-save micro-feedback to Morning Check — button state change + Verdict `card-in` + border-color transition | `check/page.tsx:185-193, 277-300` | Flagship interaction currently invisible. |
| 4 | P0 | Rename `text-teal` / `border-l-teal` to `text-slate` / `border-l-slate` OR add `--color-teal` token. Currently broken. | `programs/page.tsx:163-164` | Skill + gymnastics program cards render with no accent color. |
| 5 | P0 | Move PR celebration from bronze → green. Bronze reserved for brand + CTA. | `SetRow.tsx:143,145`, `ExerciseCard.tsx:191` (checkbox `accent-bronze`) | Ten uses of bronze dilutes it. Green owes you the "you did it" signal. |
| 6 | P1 | Bump ExerciseCard Play/Info from `w-9 h-9` (36 px) to `w-11 h-11` (44 px). Add ≥ 4 px gap. | `ExerciseCard.tsx:189, 199, 183` | Below iOS HIG; two adjacent 36-px targets = mis-tap. |
| 7 | P1 | Promote **Programs** out of the ⋯ menu into the sticky nav (labelled or Layers-icon button). Drop Check from menu. | `AppShell.tsx:122-131`, `HeaderQuickLinks.tsx:18-26` | 7 destinations behind one 36-px icon; program-switching is a top-3 job in a multi-program app. |
| 8 | P1 | Empty states on `/history` and `/report` — add ghost-preview + bronze CTA to match `/week` and `/progress` | `history/page.tsx:52-60`, `report/page.tsx` (add empty guard) | Empty states inform, don't invite. |
| 9 | P1 | Bump ⋯ overflow trigger from 36 px → 44 px | `HeaderQuickLinks.tsx:65` | Primary access to 7 destinations; must meet HIG. |
| 10 | P2 | Confirm-first proposals need an accept ack. On `Apply`, replace card with a 1-sec "×0.90 applied · Undo" strip using existing `card-in` | `DayAdjustmentProposal.tsx:108-113`, `ReadinessProposal.tsx:76-97`, `TierAdvanceProposal.tsx:60-75` | Currently the card just vanishes. No sense the app committed. |

Bonus — not top-10 but worth queuing:
- Add haptic `vibrate(10)` on all slider `input` events in `check/page.tsx` (throttled).
- The BottomNav 9-px label is a legibility risk on cheap Android; consider 10.5 px + slightly heavier `strokeWidth` on the icon in active state (currently `2.25`, could go `2.5`).
- The dashed-border in `history/page.tsx:56` is the only dashed border in the app — kill or replicate consistently across empty states.

---

## Closing take

The system has good tokens and a legitimate 3-tier surface stack it isn't using. Motion is functionally absent — two keyframes, one applied. The color model is aspirational but bronze is overloaded and one token (`teal`) is broken outright. Touch targets are within spec on the primary loop (SetRow inputs, DateNav, checkbox) but slip below 44 px on every secondary control including the overflow menu that hides half the app.

The single biggest craft delta between Terav today and Whoop / Ultrahuman is not palette — it's the felt weight of state changes. Fixes 1, 2, 3, and 10 together turn "app renders" into "app responds." Everything else is cleanup.
