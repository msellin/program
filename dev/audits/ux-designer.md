# UX audit — program-f3r.pages.dev

**Reviewer lens:** senior mobile product designer. Device: iPhone 14 Pro (390×844), PWA, one hand, gym floor.
**Build tested:** live at https://program-f3r.pages.dev, on 2026-08-06.
**Screenshots:** `/Users/margussellin/www/program/dev/audits/ux-screenshots/`

---

## 1. Verdict

**No.** A returning user gets there in ~20 seconds. A first-time user drops out at the vitals row. On first load an iPhone 14 Pro shows only: the eyebrow "REHAB & LEG STRENGTH", the title "Program", the date, a 300px-tall vitals block whose "Phase" column has broken the phase name into a six-line vertical stack ("Rebuild + evaluat (race prep sub- goal)"), and a two-row wrapping tab bar. **Zero exercise content is above the fold.** See `06-first-fold.png` and `07-vitals-detail.png`. The density issue the user flagged is not just card-level — it's that the app spends the entire first screen telling you *about* today before showing you today.

---

## 2. Top 5 UX wins to ship next (impact × ease)

### 1. Fix the vitals row height — it eats the whole first fold
- **Where:** `index.html:41-52` `.vitals`, `index.html:247-252`
- **What changes:** the `.vitals` flexbox has `align-items:stretch`, so the tallest column (Phase name wrapping to 6 lines) forces the other three chips to 297px. Shorten `phase.name` to a 1-2 word label in `v-phase` (e.g. "Phase 1" or "Rebuild"), move the long description into a smaller line below the row, or set `align-items:flex-start` and cap phase text with `line-clamp:2`. Also set `min-width` on each column so the phase doesn't compress to ~55px wide either. Target height: ≤ 60px.
- **Why:** frees ~230px vertically. The first fold could then show the header, vitals, nav, "Today — Thursday" heading, and at least the top of the first card. That reframes the app from "static status page" to "here's what you do." See `07-vitals-detail.png`.

### 2. Move the "Today N/M" completion counter to be scoped to actual today
- **Where:** `renderVitals` (grep for `v-done`); `todaysScheduledBlocks()` at `index.html:581`
- **What changes:** the counter reads "0/23" on a day that only has ~7 strength items in the Today tab. It counts every checkbox across all blocks (Today+Extras). Change denominator to items rendered on the Today tab, and add a separate "extras" counter if you want it. Right now the number is dispiriting (staring at 0/23 with no way to hit 23) and misleading (7 items done, still shows e.g. 7/23 as if incomplete).
- **Why:** for a returning user this is *the* progress signal. Wrong denominator = broken signal.

### 3. Tab bar wraps to 2 rows and taps are 40px tall — collapse or grow it
- **Where:** `nav` styling at `index.html:54-60`
- **What changes:** the tabs total ~540px wide; the viewport is 390. So on any iPhone in the current lineup, nav wraps to 2 rows (see `07-nav-detail.png`), consuming 80px. Also each tab is only 39.5px tall — below the 44px Apple HIG minimum. Two fixes: (a) reduce to 5 top-level tabs by combining low-frequency ones — e.g. merge Data + Guide into a settings drawer, and let History live inside Progress; (b) increase `padding` to hit 44px and let the row scroll horizontally instead of wrap (add `overflow-x:auto; flex-wrap:nowrap` + `scroll-snap-type:x mandatory`).
- **Why:** wrapped 2-row tab bars read as "everything is equally important" and cost 80px of prime real estate. Horizontal scroll is a familiar mobile idiom for tab overflow.

### 4. The always-visible rest-timer is oversized and mistargeted
- **Where:** `.timer` at `index.html:207-238`; markup `index.html:290-305`
- **What changes:** the timer sits fixed at bottom, 111px tall (13% of viewport), on **every** tab. On Progress/Data/History/Guide it's noise; on Today most of the movement library is strength (2-3 min rest, not 20-60s). Convert to a collapsed pill that expands on tap (e.g. small "Timer 0:00 ▶" chip 44px tall), and hide it entirely on non-Today/Extras/Check tabs. Also make presets user-configurable — CrossFitters do EMOMs, ~90s squat rests, etc. Preset "20s/30s/45s/60s" is a mismatch for a strength program.
- **Why:** current design chose "always available" over "useful when needed." A one-tap expand gives back 65px of screen and stops signalling that this program is about isometric holds.

### 5. Fix the phase description so "Rebuild + evaluate (race prep sub-goal)" isn't the running phrase
- **Where:** upstream in `program.json` phase names, consumed at `index.html:392-395` and `index.html:622-624`
- **What changes:** whoever authored the phase name chose a compound label meant for a JSON doc, not a UI. Rename to something scannable: "Phase 1 — Rebuild" as the display label, keep "race prep sub-goal" as a subtitle. Every tab currently repeats this phrase in the block-meta chip AND the block-note. Massive duplication cost — see all of `02-*-top.png` screenshots.
- **Why:** this string is repeated visibly ~4 times per view. Every character costs cognition when you're mid-set.

---

## 3. Papercuts (bulleted)

- **First card sits at y≈854px** on the Today tab — user must scroll past header (0-421), nav (443-523), phase-header block (~700), and phase-note block before hitting exercise #1. Compress the two `.block-note` items at top of Today (`index.html:623-624`) into a single line. `01-today-full.png`.
- **"Program" as the app title is meaningless.** Consider "Squat Rebuild" or the user's actual goal ("180kg by June '27"). Right now the H1 tells you nothing you didn't know from the app icon. `06-first-fold.png`.
- **"REHAB & LEG STRENGTH" eyebrow** takes a line for a fact the user already knows. Consider hiding after first launch, or replacing with today's cycle/week context (which is currently buried in `.block-meta`). `06-first-fold.png`.
- **Datestamp shows every day** ("Thursday, 6 August 2026") in monospace under the title. Redundant with device chrome status bar in PWA mode. Move to a smaller position or fold into vitals.
- **Vitals column "STATE — —"** is empty on first load, showing an em-dash. Feels like broken data. Either hide until data exists or replace with "Log check" as a CTA. `07-vitals-detail.png`.
- **Vitals column "STREAK 0d"** is demotivating on install. Consider hiding until first entry exists.
- **Log inputs (weight/reps/RPE) are 3 columns** on a 390px screen. Each input ends up ~85-100px wide with 14px monospace. Sweaty fingers, small target. Also `type=number` on iOS launches a numeric-symbol keyboard, but `.5` steps need decimal — verify `inputmode="decimal"` is used to avoid keyboard-hunt. See `05-today-scroll-1200.png`.
- **"Notes" field defaults to 1 row** with placeholder "How did it feel? Anything to flag?" — placeholder is longer than the field, so it truncates. Set `rows="2"` or shorten the placeholder to "How did it feel?" (`index.html:960`).
- **"+ CUES" summary is 17px tall** (below any tap-target guideline). The `.videolink` "Watch demo →" inside is 14px tall — impossible to tap reliably. `index.html:100-107`, `index.html:120`.
- **Flag pills like `HISTORICAL PROVOCATEUR SHOULDER LOAD:GRIP`** at the bottom of a card look like tags but aren't tappable, aren't explained inline, and are the same visual weight as the meta chips at top. `05-today-scroll-1200.png`.
- **"Suggested today" green box** (great feature) is where the eye lands, but the reasoning text is 11.5px italic muted — the *why* is the smallest thing on the card. Promote it to 13px, drop the italic. `index.html:931`.
- **Card left "spine" column** is 26px of colored L/R text that adds visual noise without payoff on non-unilateral exercises (just a bullet). Consider dropping on non-lateral items, or merging with the checkbox. `index.html:73-81`.
- **The green "you are ahead" verdict** on Progress uses two buttons stacked: "Push targets forward" is primary style but "Keep as is" is secondary. Fine — but there's no confirmation of what "stretch forward" means until you tap and get an `alert()`. Preview the delta ("+2.5 kg on all 4 remaining milestones") before commit. `stretchTargets` at `index.html:858-882`.
- **`alert('Remaining targets stretched forward. See Progress tab.')`** — you are already on the Progress tab, and browser alerts feel like errors on iOS. Toast/inline banner instead.
- **Data tab buttons wrap to 3 rows** (Share, Download, Copy, Import…), and "Copy to clipboard" gets truncated as "Copy to clipboa" mid-word in the button. `02-data-top.png`.
- **History tab shows sparklines that are 34px tall** with ~1 px wide bars. Impossible to read individual days on 30-day range. Give the user a tap-to-inspect or widen bars. `02-history-full.png`.
- **Morning-check sliders** default to 0. Fine — but the "0" value indicator to the right of each slider is 15px monospace with no highlight. If the user drags to 6, the number changes but not to any coloured emphasis. `02-check-full.png`, `05-check-full.png`.
- **"Save check" primary button** appears at the bottom of a long form. On iPhone, hidden behind the fixed timer bar. `02-check-full.png`. Add bottom padding of `140 + env(safe-area-inset-bottom)` to check tab, or make the button also fixed.
- **Guide tab is 4186px tall** — that's ~5 iPhone screens of prose (`index.html:480-575`). No jump-links, no collapse. Consider `<details>` sections keyed by topic.
- **Muted text (`#64757F`) on ground (`#EDF0F2`) is 4.18:1 contrast** — barely passing AA at 14px, fails at 11-12px. The `.ex-dose`, `.block-meta`, `.datestamp` classes at 11-13px all fall below AAA. Deepen to something like `#4A5A66` for at least the small-size uses.

---

## 4. Onboarding gap

A first-time user on this URL sees no explanation of what to do next. Concrete missing pieces:

- **No first-run empty state on Today.** "Set your training maxes to see suggested weights →" as an inline prompt, deep-linked to Progress tab.
- **No "have you done today's morning check?" prompt.** State shows "—" and streak is "0d"; a badge/dot on the Check tab would prime the sequence.
- **No idea what tab does what.** "Today, Week, Extras, Check, Progress, History, Data, Guide" reads as engineer's site map. On first load, a 1-line explainer under the nav or a tiny "?" chip that surfaces a bottom-sheet with a two-word gloss per tab would fix it.
- **No indication of where the user is in the plan.** The Progress tab has milestones; a "next milestone in Xd" chip in the header would give purpose. Right now the app looks the same every day.
- **No welcome / provenance context.** Every subsequent screen references "Phase 1 / cycle 1 / week 2 / 5RM" without ever having earned those terms. If Guide is the onboarding, then Guide should be *first* — not the 8th tab.
- **PWA install prompt.** No "Add to Home Screen" hint. Users on Safari need this manually; a soft-shown banner on session 1 or 2 helps.

---

## 5. Mobile-specific issues

- **Tap targets < 44px:** all 8 nav tabs are 40px tall, timer preset chips (20s/30s/45s/60s) are 28px tall (`index.html:214-220`), exercise checkbox is 20×20px (`index.html:85`), `.videolink` and `<summary>` are ~14-17px tall (`index.html:100-107`, `index.html:120`), modal close is 28×28px (`index.html:183`). All fail Apple HIG's 44pt minimum.
- **Nav wraps to 2 rows on iPhone 14 Pro** (390px) because 8 tabs × ~68px average = 540px > 390. See `07-nav-detail.png`.
- **Vitals row breaks to ~300px tall** because of `align-items:stretch` on the flex row and no `min-width` on `.vitals div`. `07-vitals-detail.png`.
- **Fixed timer covers "Save check" primary CTA** on the Check tab at default iPhone height. `02-check-top.png`.
- **iOS keyboard behaviour** — when a number input in the log row is focused, the on-screen keyboard covers the fixed timer and the input itself if the input is in the bottom third of the viewport. `scrollIntoView` on focus isn't implemented (`index.html:975-988`). Add `input.addEventListener('focus', () => input.scrollIntoView({block: 'center', behavior: 'smooth'}))`.
- **`inputmode` not set on numeric inputs.** `type="number"` alone on iOS gives an ambiguous keyboard. Add `inputmode="decimal"` for weight/RPE and `inputmode="numeric"` for reps.
- **No `autocomplete="off"` on log inputs** — iOS will offer to autofill weight fields from contacts phone numbers etc. Minor annoyance.
- **No safe-area padding on the top edge.** `header{padding:28px 0 0}` (`index.html:33`) but no `env(safe-area-inset-top)`. On iPhones with notch/Dynamic Island in landscape, this can clip.
- **No horizontal scroll hazards** detected — the flexible 4-col vitals correctly wraps to full width when needed, and cards are single-column. Good.
- **PWA offline** — `apple-mobile-web-app-capable` is set but no service worker registered. Cold-open at the gym on flaky 5G will fail the `fetch('data/...')` calls and hit the "Can't load the data files" fatal error, which reads like a broken app. Ship an SW or at least persist last-known-good data.

---

## 6. What's actually good

- **Editorial visual language.** The mono-caps eyebrow / large serif-adjacent H1 / thin dividers style is genuinely tasteful — this doesn't look like every other fitness app, and the restraint fits the "supplement to clinical care" positioning stated in CLAUDE.md.
- **The Suggested Today green box.** For an actual returning user with TMs set, this is the whole point of the app: "here's what to put on the bar right now." Concrete weight, warm-up ramp, reasoning line. Once vitals stop stealing the fold, this box is the win. See `05-today-scroll-1200.png`.
- **Morning check → derived Green/Amber/Red state** is the right abstraction — one tap saves the state, drives the header, and the verdict banner explains what it means. Better than most rehab apps that make you journal freeform.
- **Auto-mark exercise done on log input** (`index.html:982-984`) — small touch, huge time-saver mid-session. Keep.
- **Inline TM inference** ("→ implies 1RM ~X, suggested TM Y, tap to accept") is genuinely clever — turns the log into a self-adjusting system without a settings page.

---

**Screenshot index (all in `/Users/margussellin/www/program/dev/audits/ux-screenshots/`):**
- `06-first-fold.png` — what a new user sees on load
- `07-vitals-detail.png` — the 300px vitals block, close-up
- `07-nav-detail.png` — 2-row wrapping tab bar
- `07-timer-detail.png` — always-visible timer
- `02-{tab}-top.png` — top of each of 8 tabs
- `02-{tab}-full.png` — full-page for each tab
- `05-today-scroll-1200.png` — first exercise card with Suggested Today box
- `05-check-full.png` — morning check form full
- `04-partial-checked.png` — 3 items checked, vitals now says 3/23
