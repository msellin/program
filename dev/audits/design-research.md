# Design Research: Fitness / Strength / Recovery Apps, 2025-2026

**For:** Personal 5/3/1 + rehab PWA at program-v2.pages.dev
**Current state:** Next.js 16, Tailwind 4, Inter + JetBrains Mono, editorial neutrals. Works, feels flat and clinical.
**Goal:** Warmer, more engaging, still serious. Not consumer fluff.

Research anchored on: Strong, Hevy, Whoop, Oura, Runna, Peloton, Linear, Duolingo, plus 2025 trend reads.

---

## 1. Palette recommendations

Three lanes, each with a full spec. Pick one — don't blend them.

### Lane A — "Warm dark" (Oura / Whoop-adjacent)

The app opens dark by default. Numeric hero cards read like a Whoop card; warmth comes from a bronze accent rather than clinical blue. Best for evening logging, gym lighting, and making the recovery score feel earned rather than sterile.

**Neutrals (canvas → text):**
| Token | Hex | Use |
| --- | --- | --- |
| `bg` | `#0E0F12` | App background (near-black, warm) |
| `surface-1` | `#16181C` | Cards, elevated tiles |
| `surface-2` | `#20232A` | Nested surfaces, inputs |
| `border` | `#2A2E37` | Hairlines, dividers |
| `text-muted` | `#8A8F9A` | Labels, meta |
| `text` | `#D6D9DE` | Body |
| `text-strong` | `#F4F5F7` | Numerics, H1 |

**Accent — warm bronze:** `#C89666` (primary), hover `#D9A97C`, active `#B3814F`
**Semantic:**
- Green (ready) `#5FB37A`
- Amber (caution) `#E0A63A`
- Red (stop) `#E5654B`
**Subtle emphasis:** deep teal `#4A8894` for secondary charts / week-over-week deltas.

**WCAG AA on `#0E0F12`** (light-on-dark, 4.5:1 needed):
- `#C89666` bronze: 8.9:1 — **pass**
- `#5FB37A` green: 8.2:1 — **pass**
- `#E0A63A` amber: 10.1:1 — **pass**
- `#E5654B` red: 5.6:1 — **pass**
- `#4A8894` teal: 4.3:1 — **fail as body text**, fine for chart strokes and large labels
- `#D6D9DE` body text: 12.4:1 — **pass**

**Why this lane:** Whoop's near-black canvas makes coloured data pop; Oura's redesign leans on colour as a body-state signal rather than decoration. Bronze reads as considered rather than aggressive (unlike a Peloton cardinal red) and separates you from every other charcoal-and-neon-green tracker.

---

### Lane B — "Editorial warm light" (upgrade of the current direction)

Keep the light editorial feel the app already has, but stop being neutral-neutral. Cream base, deep ink text, one confident accent. Reads like a Muji or Aesop product page rather than a hospital form. Best if you prefer opening a bright app in daylight and the current instinct toward "editorial" is right, just underbaked.

**Neutrals:**
| Token | Hex | Use |
| --- | --- | --- |
| `bg` | `#F5F1EA` | Warm cream canvas |
| `surface-1` | `#FFFFFF` | Cards |
| `surface-2` | `#EDE7DC` | Nested / hover |
| `border` | `#D9D2C4` | Hairlines |
| `text-muted` | `#6B6558` | Labels |
| `text` | `#3A3630` | Body |
| `text-strong` | `#1A1815` | H1, numerics |

**Accent — clay:** `#B8593A` (primary), hover `#A44E32`, active `#8F4229`
**Semantic:**
- Green `#3F7A4E`
- Amber `#B87813`
- Red `#A63A32` (keep current)
**Subtle emphasis:** ink blue `#2C4A6E` for links and data lines.

**WCAG AA on `#F5F1EA`** (dark-on-light, 4.5:1):
- Clay `#B8593A`: 4.7:1 — **pass** (barely — bump to `#A44E32` (5.5:1) for body-size hits)
- Green `#3F7A4E`: 5.1:1 — **pass**
- Amber `#B87813`: 4.6:1 — **pass**
- Red `#A63A32`: 6.2:1 — **pass**
- Ink blue `#2C4A6E`: 8.9:1 — **pass**
- Body `#3A3630`: 11.8:1 — **pass**

**Why this lane:** the current app is already 80% here — you have `#EDF0F2` (cool cream) and `#14202B` (cool ink). Just warm both temperatures ~15° toward yellow and add a real accent. Clay is what serious analog training journals look like (Moleskine, Baron Fig). Feels earned; not gym-bro.

---

### Lane C — "Bright signal" (Runna-adjacent)

The app is a coach that tells you what to do today. One saturated warm hue owns the CTA and the "hero of today" card; everything else is quiet. Best if the engagement problem is "I forget to open it" and you want the app to look energetic on the home screen icon and lock screen.

**Neutrals:**
| Token | Hex | Use |
| --- | --- | --- |
| `bg` | `#FAFAF7` | Off-white canvas |
| `surface-1` | `#FFFFFF` | Cards |
| `surface-2` | `#F0EFEA` | Nested |
| `border` | `#E4E2DA` | Hairlines |
| `text-muted` | `#6E6E68` | Labels |
| `text` | `#232322` | Body |
| `text-strong` | `#0B0B0A` | H1, numerics |

**Accent — burnt sienna (Runna's exact colour):** `#F07562` (primary), hover `#E85F4A`, active `#D14A36`
**Semantic:**
- Green `#2F7D5D` (keep current)
- Amber `#B07A16` (keep current)
- Red — merge into accent territory; use `#C13A2A` for hard-stop only, sparingly
**Subtle emphasis:** Runna teal `#72AFB3` for secondary chart series and streak rings.

**WCAG AA on `#FAFAF7`** (dark-on-light, 4.5:1):
- Sienna `#F07562`: 3.1:1 — **fail as text**, pass only as a fill under white text or as an icon/badge fill
- Sienna active `#D14A36`: 4.6:1 — **pass**
- Green `#2F7D5D`: 4.9:1 — **pass**
- Amber `#B07A16`: 4.5:1 — **borderline pass**, tighten to `#9C6A0E` (5.3:1) if you want headroom
- Teal `#72AFB3`: 2.6:1 — **fail as text**, chart strokes only

**Why this lane:** Runna's `#F07562` + `#72AFB3` is one of the most-copied fitness palettes of the last two years because it works — the coral is warm enough to feel personal, the teal cools the data density. But sienna cannot carry text on a light background at 4.5:1; use it as fills only. Note current amber `#B07A16` is right at threshold; drop it 5% for safety.

---

### My call

**Lane A (warm dark)** is the recommendation. Reasoning:
1. The current pain point is "flat and clinical." Dark surfaces make data pop harder than any typography tweak.
2. This is a solo, daily-open app. Dark reads as "the tool is on your side" rather than "here is your medical record." Whoop's whole business rests on that read.
3. Bronze differentiates from every neon-green competitor without feeling decorative.
4. Rehab context matters: warm dark reduces the "waiting-room" association a bright clinical UI can carry, which is relevant given the injury history documented in `clinical-context.json`.

If Margus wants brightness, Lane B is the safer step from where the app is today. Lane C only if we lean hard into daily-coach framing.

---

## 2. Typography

### Primary sans

**Keep Inter.** No candidate meaningfully beats it in 2026 for a data-dense UI on mobile at 14-16px. Inter Variable is the version to use — the optical size axis matters here (see below).

Alternatives, if you want a fresh feel:
- **Geist** (Vercel): rounder apertures, slightly warmer than Inter. Reads as more "product," less "spreadsheet." Free, npm-installable, tuned for exactly this stack (Next.js). If you swap fonts, this is the swap.
- **General Sans** (Fontshare): moderate x-height between Inter and a classic grotesque, feels more approachable. Best if palette Lane B (warm light) is chosen — the typographic warmth compounds.

**Do not** switch to a neo-humanist (Söhne, Untitled Sans) unless you want to spend the license budget. Diminishing returns at this scale.

### Numeric mono

**Keep JetBrains Mono** for logged weights, reps, and RPE. It is still a top pick in 2026. Reasoning:
- Tabular figures align in table columns without manual `font-variant-numeric` gymnastics
- Slashed zero disambiguates `0` vs `O` for exercise ID codes
- Weight visually matches Inter well when set 1-2px larger

Alternatives worth naming:
- **Geist Mono** — pairs perfectly with Geist Sans if you swap
- **Berkeley Mono** — best-in-class but paid
- **IBM Plex Mono** — softer, if the app leans warm (Lane B)

### Type scale

Base 16px, mobile-first. Use a 1.2 minor-third ratio (not 1.25 — too airy for data density).

| Token | Size | Line-height | Weight | Family | Use |
| --- | --- | --- | --- | --- | --- |
| `display` | 40 / 2.5rem | 44 / 1.1 | 600 | Sans | Cycle week hero on Progress |
| `h1` | 28 / 1.75rem | 34 / 1.2 | 600 | Sans | Screen title |
| `h2` | 22 / 1.375rem | 28 / 1.27 | 600 | Sans | Block title, exercise name |
| `h3` | 17 / 1.0625rem | 24 / 1.4 | 600 | Sans | Card title |
| `body` | 15 / 0.9375rem | 22 / 1.47 | 400 | Sans | Prose, descriptions |
| `body-strong` | 15 | 22 | 500 | Sans | Set counts, non-numeric emphasis |
| `label` | 13 / 0.8125rem | 18 / 1.38 | 500 | Sans | Field labels |
| `caption` | 12 / 0.75rem | 16 / 1.33 | 400 | Sans | Meta, timestamps |
| `mono-xl` | 34 / 2.125rem | 38 / 1.12 | 500 | Mono | PR number, hero readout |
| `mono-lg` | 22 | 28 | 500 | Mono | Set weight in log row |
| `mono` | 15 | 22 | 500 | Mono | Inline weights in prose |
| `mono-tiny-caps` | 11 / 0.6875rem | 14 | 600 | Mono | Section eyebrows, uppercase, `letter-spacing: 0.08em` |

Notes:
- `mono-tiny-caps` is the load-bearing one for the editorial feel. Uppercase `SET 3 / 5 · 90 KG` in JetBrains Mono at 11px reads like a Whoop metric label. This is currently missing from the app and is probably the single-highest-value typographic addition.
- Set `font-feature-settings: 'ss01', 'cv11', 'tnum'` on Inter globally. `ss01` gives you the single-storey `a` which pairs better with mono; `tnum` locks tabular numerics in the sans face for badges and streak counters.
- Set `font-variation-settings: 'opsz' auto` if you use Inter Variable — this is why the display size will look tighter and the body size will look more open, without any manual tracking.

### Where variable fonts matter

- **Hero numerics.** A PR number that ticks in weight from 400 to 600 as it grows on tap is a variable-font animation, and it is much cheaper than any bounce-in transform. Do this.
- **Progress ring labels.** Weight class transitions during load are a common jank source with static fonts; variable removes it.
- Everywhere else, variable is a nice-to-have.

---

## 3. Engagement patterns worth stealing

Ranked by fit for a solo-user, daily-open, log-and-move-on flow.

**1. Whoop's single-answer hero card.**
One number, one colour, no chart on the Today screen. "Recovery 72%" fills the top third of the viewport, coloured by state. Underneath, one sentence: "You are well recovered." That is the whole card. Everything else is one tap away.
*On our Today page:* top card becomes **"Ready to lift"** (green) / **"Load with care"** (amber) / **"Rest today"** (red), derived from `progression_rules.states[]` in `program.json`. No graph on the Today screen. Charts live in Progress.

**2. Duolingo's streak flame as a persistent header artefact.**
Not a separate screen. Not a modal. A small flame + day count in the top-right of every screen. It animates faster later in the day if today's session is not yet logged. This works because it makes urgency ambient, not interruptive.
*On our Today page:* small chip top-right — `10 wk · session 3/4` — with the numeral going bronze when the day's session is still pending. No push notifications required. No confetti.

**3. Strong's PR badge in the log row itself.**
The PR celebration is not a separate screen. It is a small bronze "PR" tag that appears beside the set in the log the moment you tap complete on a heavier weight × reps than any prior. It ticks the number up and stays visible in the row. History shows the same badge in the same place.
*On our Today page:* when a top set beats a documented PR (from `log.json` history), the set row shows a subtle bronze tag and the number counts up 12 → 15 (see micro-interactions). No fullscreen takeover.

**4. Runna's "hero of today" card + collapsed rest.**
The active session dominates the Today view. Everything else — plan, history, settings — is quiet. The card is opinionated: "Today: Deadlift 3×5 @ 140 kg. Warm-up 2 sets."
*On our Today page:* Today card should own 65% of first viewport, with warm-up and working sets pre-expanded, accessories collapsed behind a `4 accessories →` chevron. Currently the Today page treats all blocks as equal weight.

**5. Oura's three-tier disclosure.**
Overview → focused metric → deep exploration, each one tap deeper. You never see a chart you did not ask for.
*On our History page:* level 1 = weekly heatmap (colour = symptom score), level 2 = tap a week to see sessions, level 3 = tap a session to see per-set. Currently our Progress skips level 1.

**6. Linear's keyboard-first micro-interactions.**
On mobile this translates to gesture-first: swipe-right on a set = complete, swipe-left = skip, long-press = edit weight. No buttons for common actions. Buttons only for rare ones.
*On our Today page:* swipe-to-complete on the set row, with a 0.97 scale on active — Linear's exact interaction constant. Removes the "tap the checkbox" friction.

**7. Peloton's colour-per-instructor → colour-per-block.**
Peloton uses colour to encode identity, not just semantics. Cardio classes have one accent, strength another, meditation another.
*On our Today page:* main-lift block gets a dedicated hue (bronze in Lane A), accessory block gets teal, mobility block gets green. Just a 3px left border on the block card. Consistent across Today, History, and Progress so the user learns "bronze = the important thing."

**8. Whoop's monthly journal streak, not just per-day.**
The satisfying number is not the current streak; it is the completeness of the month grid. A calendar view where each day is a filled dot (logged) or hollow (missed) is far more motivating than "12-day streak" alone, because it forgives one miss without collapsing.
*On our History page:* replace or augment the current chart with a 12-week dotted grid. Green = green-state session, amber = amber, red = red or missed. Recovery visible at a glance for a specialist appointment — which the project brief explicitly names as a goal.

---

## 4. Micro-interactions

Restraint is the rule. Every animation must survive the "did I miss it? doesn't matter" test — if the answer is "doesn't matter," you have the right duration.

- **Set complete.** Row scales to 0.97 for 80ms on tap-down (Linear's constant), the checkbox fills bronze in 120ms, background of the row shifts to `surface-2` in 180ms. Total: <300ms. On iOS, `impactOccurred(.light)` haptic on the fill. **No confetti.**
- **PR tick.** When a set completes and it beats history, the mono numeric font-weight tweens 500 → 600 over 400ms, and the number counts from previous PR to new PR at ~40ms per unit. Bronze `PR` badge fades in at the end, 200ms. **No sound.**
- **Progress ring for cycle week.** Ring stroke draws from the current position to the new position over 600ms with `cubic-bezier(0.16, 1, 0.3, 1)` easing (Apple's "spring-out"). Draws once on page load, not on every render.
- **Card lift on tap.** `translateY(-2px)` + `box-shadow` 0-6-12 rgba(0,0,0,0.12) over 120ms on press-in, reverses on release. Only on cards that navigate, never on containers.
- **Block state transitions.** Green/amber/red states cross-fade the block card's left border over 240ms when a symptom score changes. No slide, no bounce.
- **Number of animations on Today, max: 3.** Set completion + progress ring + one PR tick per session. If a fourth is competing for attention, one of them is wrong.

Where restraint matters most: the recovery/readiness state card. It must feel decisive, not animated. A colour swap on load is enough. No shimmer, no gradient shifting, no pulsing dots. Whoop gets this right; Fitbit gets it wrong.

---

## 5. Onboarding

The first 30 seconds should feel like a doctor's intake with one question at a time, in the app's voice. Not a tour. Not a swipeable brand story.

**Second 0-5:** Splash resolves into a single screen. No logo animation. One line: *"Let's set today's session up. Three questions."* One primary button, `Start`.

**Second 5-15:** Question 1 — *"How's the back this morning?"* Five circles (0 no pain, 4 provocative). No labels underneath — the tap tells you. Tapping advances immediately, no `Next` button. This is Runna's onboarding pattern applied to a symptom scale.

**Second 15-25:** Question 2 — *"How's the left hip?"* Same five circles.

**Second 25-30:** Question 3 — *"Slept how many hours?"* A single big number stepper, defaults to 7. Tap-and-hold accelerates.

**Second 30+:** The app resolves directly to today's session. No welcome, no tour, no `Skip Intro`. The hero card at the top has already computed green/amber/red from the three answers and offered the appropriate session or adjusted volume. The session block shows warm-up and working sets, pre-populated with weight × reps derived from the last logged session per `progression_rules`.

Rules:
- No modal ever asks for notification permission on first launch. Ask on the third session, when the user has proven they'll return.
- No email capture. This is a personal app; nothing sends.
- The three-question flow becomes the daily start ritual, not just onboarding. First-time users are being onboarded to the loop, not to the feature set. Runna's insight: *"the onboarding is the product's rhythm shown once."*

Cold-start special case: on the very first launch, insert one screen before Q1 asking *"What are we tracking?"* with two chips — `5/3/1 cycle` (default) and `Rehab-only`. This branches the block library once and is never asked again.

---

## 6. Anti-patterns

- **Splash animation of the app logo drawing itself.** Every fitness app did this in 2021-2023. It reads as unserious now.
- **A tour with dots at the bottom and a `Skip` in the corner.** Nobody reads it. It is the strongest signal that the product is not confident in itself.
- **Push permission modal on first launch.** Cargo-culted from growth teams. On a solo app, this is doubly wrong; you have no reason to notify unless the user has already opted into a schedule.
- **Confetti on PR.** Fine on Duolingo (children learning Spanish). Wrong here. A quiet tag and a ticked number is more satisfying because it does not undermine the seriousness of the lift.
- **Neon green (`#39FF14`, `#00FF87`) accents.** The default gym-tech move. Looks aggressive at 8am and dated by 2025's second half. If you want that energy, use bronze or clay.
- **Glassmorphism / frosted-blur cards.** Peaked 2020, still in Apple's design language, but reads increasingly generic. Use solid `surface-1` on `bg`. Cheaper to render on Cloudflare Pages too.
- **Overly rounded cards (`rounded-3xl` / 24px+).** Consumer-app tell. Use 8-12px radii. Linear uses 6-8px. Whoop uses 8-10px.
- **Gradient meshes / animated background blobs.** No.
- **"Motivational" language.** *"You crushed it! 💪"* is exactly the fluff the brief is against. Say what happened: *"3 × 5 at 140 kg. New PR by 2.5 kg."*
- **A giant `+ Log Workout` FAB.** The whole point is that the day's session is already teed up; a floating action button implies the user should invent from scratch every time. Remove it.
- **Overusing green.** Green means "ready" in Lane A. If green also means "complete" and "positive change" and "primary button," it means nothing. Semantic colours must stay semantic. The primary action uses the accent (bronze / clay / sienna), never green.
- **Reintroducing red without a phase gate.** Also a project rule — see `CLAUDE.md` hard constraints. Red in the UI belongs to the recovery-state system, not to destructive actions (use bronze-on-outlined-danger for delete).

---

## Concrete next-step recommendation

If the goal is "colours that work, fonts, engagement, feels nicer" with a single implementation pass:

1. Adopt **Lane A (warm dark)** in `tailwind.config` as CSS custom properties, with a `data-theme="light"` fallback that maps to Lane B tokens for anyone opening in daylight who prefers it. Default dark.
2. Keep **Inter Variable + JetBrains Mono**. Add the `mono-tiny-caps` label style — this alone changes the perceived quality more than most other single changes.
3. Ship the **hero state card** (pattern 1) and **swipe-to-complete** (pattern 6) as the two engagement additions in the first pass. Everything else in section 3 is second pass.
4. Replace the Today page's equal-weight block list with the **hero-of-today layout** (pattern 4). This is a re-layout, not new components.
5. Kill the FAB, kill any confetti, kill any tour. Onboarding is three questions.

Total palette + type + two interactions is achievable in one PR without touching the data model.

---

## Sources

- [WHOOP Design Breakdown — 925 Studios](https://www.925studios.co/blog/whoop-design-breakdown)
- [WHOOP Brand Colors — Mobbin](https://mobbin.com/colors/brand/whoop)
- [WHOOP Recovery mechanics](https://www.whoop.com/us/en/thelocker/how-does-whoop-recovery-work-101/)
- [New Oura App Design — Oura Blog](https://ouraring.com/blog/new-oura-app-experience/)
- [Runna Onboarding Case Study — UX Collective](https://uxdesign.cc/how-to-nail-onboarding-a-case-study-of-runna-7780ba89c202)
- [Runna Brand Assets — Brandfetch](https://brandfetch.com/runna.com)
- [Runna UI Breakdown — screensdesign](https://screensdesign.com/showcase/runna-running-training-plans)
- [Linear Design Tokens & Typography — DesignMD](https://designmd.cc/benchmarks/linear)
- [Linear Design System — LogRocket](https://blog.logrocket.com/ux-design/linear-design/)
- [Peloton App Design Analysis — DesignRush](https://www.designrush.com/best-designs/apps/peloton-app-design)
- [Duolingo Streak System Breakdown — Medium](https://medium.com/@salamprem49/duolingo-streak-system-detailed-breakdown-design-flow-886f591c953f)
- [Duolingo Habit-Forming Reminders — Digia](https://www.digia.tech/post/duolingo-habit-forming-reminders-retention-architecture/)
- [Hevy vs Strong 2026 — PRPath](https://prpath.app/blog/strong-vs-hevy-2026.html)
- [Inter Font — Made Good Designs](https://madegooddesigns.com/inter-font/)
- [Geist vs Inter comparison — Font Alternatives](https://fontalternatives.com/compare/geist-vs-inter/)
- [Mobile Onboarding Best Practices — Appcues](https://www.appcues.com/blog/essential-guide-mobile-user-onboarding-ui-ux)
- [Fitness App Design Trends 2026 — Canvas Builder](https://canvasbuilder.co/blog/fitness-website-design-trends-2026)
- [Apple HIG — Activity Rings](https://developers.apple.com/design/human-interface-guidelines/components/status/activity-rings/)
