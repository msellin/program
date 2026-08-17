# Terav app — Visual craft audit (type/color/rhythm, 3 personas)

Personas: persona-recover, persona-strength, persona-erratic
Artifacts: `next-app/tests/e2e/artifacts/personas/`
Palette source: `next-app/src/app/globals.css`
Layout / shell: `next-app/src/app/layout.tsx`, `next-app/src/components/AppShell.tsx`, `next-app/src/components/nav/BottomNav.tsx`
Viewport basis: 393 mobile / 1280 desktop (root font-size 16px)

---

## 1. Overall visual verdict

The palette itself is genuinely disciplined — one bronze primary, one slate secondary, three semantic tones (green/amber/red), two laterality accents. Sitting on a warm-dark ground (`#0e0f12`) with a properly separated surface stack (`#16181c` / `#20232a`) the whole system is closer to Whoop / Oura than to a webapp. The chisel-stroke bronze wordmark at 13px tracking 0.22em reads as a real brand mark, not a placeholder.

The failure mode is **the type ramp**. There are 16 distinct arbitrary pixel sizes in active use — `text-[9px]` through `text-[15px]` in 0.5px increments — replacing what should be a 5-step app scale. `text-[13px]` (115 hits) has become the body default, but everything a user actually reads on Today rides at `text-[12.5px]` or `text-[13px]` (the Coach cited body, phase-progress line, banners), and captions have collapsed to `text-[10px]`–`text-[11px]`. On a rehab-tracker read on the couch, 12.5px muted-grey (`--color-muted #8a8f9a`) is below the fatigue threshold, and the ~1.15× ratio between "body" (13px) and "section title" (`text-[13px] uppercase font-mono`) means there is no type hierarchy inside cards — just weight and case. Type discipline is where this app has the biggest cheap win.

Second failure mode is **section-title convention**: every H2 across History, Progress, ExerciseCard blocks, and Coach is rendered `font-mono text-[13px] uppercase tracking-widest`. That's a caption weight doing an H2 job. On the History screen (`persona-erratic/mobile/04-history.png`), "ACTIVITY HEATMAP", "SYMPTOMS — LAST 30", "LOG — 45 DAYS" all shout at the same volume as the page-level H1 "History" — the H1 wins only on size because the mono caps have larger perceived weight.

One thing done right: **the semantic-color economy holds under stress**. persona-erratic's amber-only heatmap (45 sparse amber squares) versus persona-strength's mono-green wall versus persona-recover's tri-colour rehab arc — all three read as the same product. The team resisted the urge to introduce a 4th semantic tone.

---

## 2. Type scale — actual px per role

Root: 16px. Mobile viewport basis 393px, desktop 1280px. Font: Inter for sans, JetBrains Mono for mono. Both loaded via `next/font/google` in `next-app/src/app/layout.tsx:12-22`. Tabular numerics on globally (`globals.css:48-61`) — good, this app is mostly numbers.

| Role | Class chain (file:line) | Mobile px | Desktop px | Line-height | Verdict | Recommend |
|------|--------------------------|-----------|------------|-------------|---------|-----------|
| Page H1 — Today "Pick a program" | `text-2xl font-semibold tracking-tight` (`src/app/page.tsx:353`) | 24 | 24 | 1.5 (default) | fine | keep |
| Page H1 — Coach / History / Progress / Morning check | `text-3xl font-semibold tracking-tight` (`src/app/coach/page.tsx:247`, `src/app/history/page.tsx:74`, `src/app/progress/page.tsx:178`) | 30 | 30 | 1.5 | fine but not scaled | consider `text-3xl md:text-4xl` for desktop breathing room |
| Section H2 (everywhere) | `font-mono text-[13px] uppercase tracking-widest` (`src/app/history/page.tsx:81, 100, 124, 137`, `src/app/page.tsx:709`) | 13 | 13 | 1.15 (mono-caps) | **caption doing H2 work** | switch to `text-[13.5px] font-semibold text-strong tracking-normal` OR keep mono-caps but demote page-title H1 responsibility to these labels |
| Section H2 (Progress body) | `text-[15px] font-semibold text-strong` (`src/app/progress/page.tsx:260, 272, 297, 337`) | 15 | 15 | 1.5 | good — this is the right H2 | **promote to app-wide H2 standard** |
| Block name inside Today session | `font-mono text-[13px] font-semibold uppercase tracking-widest` (`src/app/page.tsx:709`) | 13 | 13 | 1.15 | same caption-shout, competes with H1 | demote to `text-[11.5px] font-mono uppercase tracking-wider` and add a colored border-left (already present) as its differentiator |
| Exercise card title | `font-semibold tracking-tight truncate` — implicit `text-base` = 16 (`src/components/workout/ExerciseCard.tsx:167-172`) | 16 | 16 | 1.5 | good — most important card element is a real 16px | keep |
| Exercise card preview line ("57.5 kg × 5") | `font-mono text-[12px] text-slate` (`src/components/workout/ExerciseCard.tsx:176`) | 12 | 12 | 1.5 | **12px on the primary data readout is too small** — this is the number the user has to eyeball mid-set | `text-[13.5px]` or `text-sm` = 14 |
| Exercise cue line | `text-[12.5px] text-muted italic leading-snug` (`src/components/workout/ExerciseCard.tsx:179`) | 12.5 | 12.5 | 1.375 | crushed muted italic at 12.5 | `text-[13px] not-italic` |
| Coach proposal cited-body / "You finished" body | `text-[13px] text-ink` / `text-[12.5px] text-muted` (`src/app/page.tsx:494, 506`, `src/components/workout/ReadinessProposal.tsx:58`) | 12.5–13 | 12.5–13 | 1.5 | tolerable, but the app's body baseline should be 14 not 13 | promote to `text-[14px]` for `.text-ink` roles, keep 13 for `.text-muted` captions |
| Today card body ("Save a morning check to calibrate today's load") | `text-[14px] text-muted` (`src/app/page.tsx:354`) | 14 | 14 | 1.5 | **this is the correct body px** — one of the only 14px body strings in the app | **make this the universal body** |
| YourPlanCard body — headline / schedule line / tier line | `text-[15px] font-semibold` / `text-[13px] text-ink` / `text-[13px] text-muted` (`src/components/workout/YourPlanCard.tsx:95, 99, 100`) | 15 / 13 / 13 | same | 1.5 | mixed — 15 headline is right, 13 body ties itself to caption density | promote 13 → 14; keep headline 15 |
| HeroStateCard state title ("Green" / "Amber" / "Red") | `text-2xl font-semibold` (`src/components/workout/HeroStateCard.tsx:91`) | 24 | 24 | 1.5 | good | keep |
| HeroStateCard sub-copy (compact) | `text-[12.5px]` (`src/components/workout/HeroStateCard.tsx:52`) | 12.5 | 12.5 | 1.5 | crushed | 13 or 14 |
| SignalsStrip primary label ("Back after 17 days — soften plan?") | `text-[14px] font-semibold text-strong` (`src/components/workout/SignalsStrip.tsx:195`) | 14 | 14 | 1.5 | **this is the right pattern** — 14px semi-bold on a semantic-tone strip | keep. Model app-body px on this. |
| SignalsStrip "+1 more" | `text-[12px] font-normal text-muted` (`src/components/workout/SignalsStrip.tsx:198`) | 12 | 12 | 1.5 | fine as a badge | keep |
| Phase progress line ("Rebuild + evaluate · week 2 of 4 · ends 29 Aug") | `text-[12.5px] text-muted leading-tight` (`src/app/page.tsx:158`) | 12.5 | 12.5 | **1.25 (leading-tight)** | **12.5 + leading-tight = crushed**. This is meta text the user reads once a day. | `text-[13px] text-muted leading-normal` |
| Amber / slate / bronze banner body (interference, taper, retest reminder) | `text-[12.5px]` (`src/app/page.tsx:178, 210, 226, 671`) | 12.5 | 12.5 | 1.5 | consistent, but too small for warning banners | promote to `text-[13.5px]` — an interference warning is not a caption |
| History log-row date | `font-mono text-[12px]` (`src/app/history/page.tsx:299`) | 12 | 12 | 1.15 | dense list item — barely acceptable | consider `text-[12.5px]` to breathe |
| History log-row exercise set line ("100 kg × 5 @ RPE 8") | `font-mono text-[11.5px] text-muted` (`src/app/history/page.tsx:376`) | 11.5 | 11.5 | 1.5 | **11.5 for numeric data is a nope** | `text-[13px] font-mono` — tabular-nums already on globally |
| History symptom-spark region label | `font-mono text-[11px] text-muted uppercase tracking-wider` (`src/app/history/page.tsx:163`) | 11 | 11 | 1.15 | fine as a chart caption | keep |
| Progress milestone lift name | `font-medium text-sm text-strong` — sm = 14 (`src/app/progress/page.tsx:460`) | 14 | 14 | 1.5 | good | keep |
| Progress milestone TM line | `text-[11.5px] text-muted` (`src/app/progress/page.tsx:465`) | 11.5 | 11.5 | 1.5 | too small for the meta line under a lift name | `text-[13px]` |
| Progress milestone roadmap % ("Roadmap 11% · 54% of final 165 kg") | `text-[10.5px] text-muted font-mono` (`src/app/progress/page.tsx:628`) | 10.5 | 10.5 | 1.15 | **10.5 mono muted grey — invisible on iPhone SE. This line carries the actual progress %.** | `text-[12px]` minimum |
| Progress `<input type=number>` — TM editor | `font-mono text-sm` (`src/app/progress/page.tsx:688`) | 14 | 14 | native | ok | keep |
| Bottom-nav label | `text-[9px] font-medium tracking-wide uppercase` (`src/components/nav/BottomNav.tsx:42`) | **9** | 9 | 1.5 | **9px is only defensible because the icon carries the label** — but Cal.com / Linear / any respectable app bottom tab is 10–11px | `text-[10.5px]` and rely on `truncate` — 5 tabs will still fit on 393px |
| TERAV wordmark (header) | `font-mono text-[13px] uppercase tracking-[0.22em]` (`src/components/AppShell.tsx:122`) | 13 | 13 | 1.5 | **great** — chisel-stroke lock-up at 13px reads as a wordmark, not a link | keep |
| Coach bubble text | `text-[14px] whitespace-pre-wrap` (`src/app/coach/page.tsx:382`) | 14 | 14 | 1.5 | good | keep — this is another data point that 14 is the right body px |
| Coach starter prompt buttons | `text-[13px]` (`src/app/coach/page.tsx:359`) | 13 | 13 | 1.5 | interactive text at 13px is on the low side | `text-[14px]` |
| Coach textarea | `text-sm px-3 py-2 min-h-[48px]` (`src/app/coach/page.tsx:315`) | 14 | 14 | 1.5 | good — matches iOS zoom-avoidance threshold | keep |

**Roll-up.** 22 distinct sizes actively used across the app (grepped total). This is Wathan's "one ratio" nightmare. The type ramp needs a discovery pass and a cull to 6 values: 30 / 24 / 18 / 16 / 14 / 12. Everything below 12 is either genuinely a chart tick (`Heatmap.tsx:122` DOW letters at 9px, fair use) or a leftover density optimisation from an earlier era.

**Tabular-nums.** Set globally on `html, body` at `globals.css:48` and reinforced via `font-feature-settings: "ss01" "cv11" "tnum"` on `html:60`. Progress TM inputs, History set rows, and Heatmap counts all inherit it. No `variant-numeric` violation anywhere. **This is the single most correctly-executed typographic decision in the app.**

---

## 3. Color system

### Palette in use — everything resolved

Enumerated from `next-app/src/app/globals.css:8-44` and grepped across `src/`.

**Surfaces (3 real, 1 alias)**
- Ground `#0e0f12` (`--color-ground`) → applied on `body` at `globals.css:63`, and used explicitly via `bg-ground` on buttons (`src/app/page.tsx:361` bronze CTA). This is the canvas.
- Surface `#16181c` (`--color-surface`) → the standard card background (`src/app/history/page.tsx:82, 103, 127, 140`, ExerciseCard, Coach textarea, all rest-day cards).
- Surface-2 `#20232a` (`--color-surface-2`) → the bottom nav (`src/components/nav/BottomNav.tsx:28`), Coach assistant bubble, sub-nested list backgrounds (History `LogRow` open state).
- 3 surfaces is the right count. No `bg-neutral-*`, no `bg-black`, no `bg-zinc-*` sneaking in. **Discipline: A.**

**Ink stack (3 real)**
- Strong `#f4f5f7` (`--color-strong`) → H1/H2 titles, active nav (`text-strong` = 148 uses).
- Ink `#d6d9de` (`--color-ink`) → body copy, most set values (`text-ink` counts inside body default).
- Muted `#8a8f9a` (`--color-muted`) → 611 uses. Captions, meta, banner sub-copy, sub-nav.
- **Only 3 muted levels**, no `text-white/70` / `text-white/60` opacity ladder anywhere (grep for `text-white/` returned 0). This is uncommon and correct. Landing pages routinely reach for 4–5 opacity muted levels; this app has 3 named tokens.

**Lines**
- Line `#2a2e37` (`--color-line`) → card borders (`border-line`), sub-nav divider.
- Line-soft `#20232a` (`--color-line-soft`) → nested dividers, subtle backgrounds (`bg-line-soft/50` in the exercise-card set-grid header at `ExerciseCard.tsx:233`).
- Two-tier line hierarchy — appropriate for dense list surfaces (History log rows, TM editor divide-y).

**Accents (2 real, both bronze-family + slate)**
- Bronze `#c89666`, bronze-hover `#d9a97c`, bronze-active `#b3814f` (`globals.css:31-32`) — one primary accent with hover/active variants. Used on: TERAV wordmark, bronze CTAs ("Log yesterday now" on persona-recover Today; "Retest — log your numbers" on persona-strength `01-today.png`), Sparkles icon on YourPlanCard, focus ring (`globals.css:104-113`), progress-bar fill (`src/app/progress/page.tsx:610`), active heatmap ring (`Heatmap.tsx:154`).
- Slate `#79b8c4` (post-a11y bump from `#4a8894`) — one secondary accent. Used on: "Advance to Cycle 1"-style secondary CTAs, Coach cited-source italics, retest info-links, heatmap-related nav.
- **2 accents. Cited & disciplined.** This is the Refactoring UI target.

**Semantic (3, all correctly scoped)**
- Green `#5fb37a` — readiness-green, PR-beaten badge, top-set trend line on SymptomLoadChart, active-heatmap fill.
- Amber `#e0a63a` — hold-load banner, interference/taper warnings, heatmap amber cells, soon-milestone badge.
- Red `#e5654b` — red-state banner, symptom Bar on SymptomLoadChart, missed-milestone badge, delete confirm-clear button (Coach `Trash2`), end-program underline.
- **No 4th semantic tone.** No orange, no coral, no purple flag. `--color-red` is genuinely red-orange, warm-tuned to the palette — an important detail. Red-on-warm-dark can read as pink or bright cherry; `#e5654b` reads as coral-red and holds visual seniority.

**Laterality (2 diagnostic-only)**
- Lat-left `#4a8894`, lat-right `#a279a8` — used exclusively as tiny L/R stamps on Check-page symptom sliders (`src/app/check/page.tsx:224`), History symptom-spark labels (`src/app/history/page.tsx:167`), ExerciseCard side spine (`ExerciseCard.tsx:117-127`). These are correctly quarantined: never used as an accent, never used on a CTA. The right-side purple is the only place purple exists in the entire product.
- **Verdict: correct role isolation.** The tokens read as clinical diagnostics, not brand colors.

### Accent economy verdict

**Discipline is real.** In-view accent count per persona:route (accents counted as bronze / slate / green / amber / red / lat):

| Persona:Route | Bronze | Slate | Green | Amber | Red | Lat |
|---------------|--------|-------|-------|-------|-----|-----|
| recover:today | 3 (wordmark, banner CTA, plan reveal Sparkles) | 1 (log-shortcut pill) | 0 | 1 (missed-session border) | 0 | 2 (Bulgarian L/R spines) |
| strength:today | 2 (wordmark, retest CTA) | 1 (pick next program) | 0 | 2 (retest banner, pause banner) | 0 | 0 |
| strength:progress | 2 (progress bar, export report subtle) | 1 (line-soft divider text) | 1 (delta) | 1 (banner) | 1 (delta negative) | 0 |
| erratic:history | 1 (heatmap today ring) | 1 (symptom sparks) | 0 | 1 (heatmap dominant amber) | 0 | 0 |
| erratic:coach | 1 (wordmark, empty-state header caps) | 0 | 0 | 0 | 0 | 0 |
| recover:history | 1 | 1 (symptom sparks) | 1 (heatmap greens) | 1 (heatmap ambers) | 1 (heatmap reds, few) | 1 (L stamp on Groin/Buttock) |

Max in-view accent variety is on `recover:history` — bronze, slate, three semantic, and one lat = **6 distinct hues in one viewport**. That's the palette hitting its ceiling. The heatmap is what pushes it there, and that's defensible: it's the only surface where all three semantic tones need to coexist to communicate the model. Anywhere else in the app, in-view count is 3–4, which is right.

### Semantic role coherence

- **Bronze = "the app's decision / primary action"**: CTA text on ground, brand wordmark, progress fill, focus ring, plan-reveal accent. Consistent.
- **Slate = "here's a related destination"**: secondary CTAs, chart tooltip-reference squares, cited-body text on Coach preview, "Log this session" pill, retest cited-source line. Consistent.
- **Green = "state good / trend up / beaten"**: readiness green, PR badge, delta-positive, heatmap green day, done-mark flash animation. Consistent.
- **Amber = "hold / warning / soft-limit"**: hold-load banner, taper, interference, missed-session `border-l-4 border-l-amber`, soon-milestone. Consistent.
- **Red = "back off / warning / regression"**: red state, symptom bar, missed milestone, delete/clear button. **One rogue:** `ReadinessProposal.tsx:92` renders the primary accept button `bg-green text-ground` — a large green button as a primary CTA. Everywhere else in the app, primary CTAs are bronze. Green here reads "state good," not "action." **Move to bronze** or introduce `bg-green` as a documented "advance / confirm-progress" pattern (`ReadinessProposal`) and use it in exactly one other place with the same semantic. Right now it's a one-off.

### Rogue colors

Grepped `bg-\[#|text-\[#|border-\[#` across `src/` — **zero hits**. No inline hex anywhere. Every color goes through a token. **This is the strongest palette discipline I've audited on a mid-stage web app in recent memory.**

The only "arbitrary color" surfaces are:
- SymptomLoadChart passes token hexes as raw hex to Recharts because Recharts doesn't take CSS variables (`src/components/charts/SymptomLoadChart.tsx:77-83`). The values match the tokens exactly (`#2A2E37 = --color-line`, `#D6D9DE = --color-ink`, `#E5654B = --color-red`, `#C89666 = --color-bronze`, `#5FB37A = --color-green`). Legitimate — but if a token ever drifts, this file will silently disagree. **Extract to a shared const** and import from both.

---

## 4. Spacing & rhythm

### Tokens observed (grepped across app-router pages)

```
py-2 (15)  px-3 (17)  space-y-3 (11)  gap-2 (7)  space-y-2 (6)  gap-3 (6)
space-y-5 (3)  space-y-4 (3)  space-y-6 (2)  space-y-1 (1)
```

Spacing follows the Tailwind 4-based scale: 2/3/4/5/6. **No ad-hoc `mt-[27px]` or `py-[13px]` anywhere** — grep returned zero px-arbitrary spacing values, only text-arbitrary. This is the second big discipline win. **Rhythm is genuinely on a scale.**

| Route / Card | Vertical padding | Between-item gap | Verdict |
|---|---|---|---|
| Today outer container | `space-y-5` (`page.tsx:126`) — 20px | 20px between top-level cards (YourPlan, MissedSession, DateNav, Hero, Signals, sessions) | 20px is tight for the number of blocks stacking on persona-strength (banner + banner + card + banner + hero + signals + graduation card). Consider `space-y-6` (24px). |
| Today session block | `space-y-3 pl-3 border-l-4` (`page.tsx:707`) | 12px between block name, note, exercises | 12 works for dense block contents |
| ExerciseCard internal | `p-3 space-y-3 min-w-0` (`ExerciseCard.tsx:130`) | 12px between header / suggestion / sets / notes | good, matches block rhythm |
| Coach outer | `pt-4 pb-4` + `mb-3` (`coach/page.tsx:244-245`) — 16/12 | 12px between header, empty-card, footnote | fine |
| Coach chat window | `p-3 mb-3` + inner `space-y-3` (`coach/page.tsx:280-281`) | 12 between bubbles | correct |
| Coach bubbles | `max-w-[85%] rounded-lg px-3 py-2 text-[14px]` (`coach/page.tsx:382`) | pill rhythm | inconsistent with card rhythm (12/12 vs 12/8), but bubble pattern needs less vertical | keep |
| History activity heatmap | `p-3 space-y-3` (`history/page.tsx:82`) | 12/12 | good |
| History symptom sparks | `p-3 space-y-2` (`history/page.tsx:103`) | 8 between region rows | 8 is right for one-line rows |
| History log-row header | `px-3 py-2.5 min-h-[44px]` (`history/page.tsx:299`) | 44px tap target | good — matches iOS HIG |
| History log-row open body | `px-3 pb-3 pt-1 space-y-2` (`history/page.tsx:327`) | 8 between sub-items | good |
| Progress outer | `space-y-5 pt-4` (`progress/page.tsx:176`) | 20px between banners, insights, TM section | ok |
| Progress TM editor divide | `divide-y divide-line-soft`, rows `px-3 py-3` (`progress/page.tsx:319`) | rows @ 12+12 with 1px divider | good, this is the app's tightest correctly-executed list |
| BottomNav | `py-2 px-0.5 gap-0.5 min-h-[52px]` (`BottomNav.tsx:42`) | 2px gap between icon and label | tight but 52px min-height compensates. Icon size 20, label 9 → total ~44 of content in 52 = 8px vertical padding. Fine. |

### Rhythm breaks

- **None on `px` spacing.** No ad-hoc values.
- The only sub-scale spacing anywhere: `space-y-0.5` and `gap-0.5` (2px) used in BottomNav labels, dropdown chevrons, and dropdown-menu lists. That's the 2px "adjacency" rhythm — fine as long as it stays on adjacency. `gap-0.5` appears 4× in `AppShell.tsx:127`, `BottomNav.tsx:41`, `ExerciseCard.tsx:194`, `Heatmap.tsx:118`. Consistent purpose. ✓
- The only bespoke padding value: `pb-[calc(64px+env(safe-area-inset-bottom))]` on body (`src/app/layout.tsx:57`) and `paddingBottom: "calc(64px + env(safe-area-inset-bottom) + 1rem)"` on `<main>` (`AppShell.tsx:149`). Correct — 64px bottom-nav height + iOS safe area + 16px breathing = a real bottom rhythm unit, not the "60px of nothing" failure mode.

### Card-internal rhythm coherence

| Card | Internal padding | Verdict |
|---|---|---|
| YourPlanCard | `px-4 py-4` = 16/16 | `YourPlanCard.tsx:78` |
| HeroStateCard (full) | `p-4` = 16 | `HeroStateCard.tsx:97` |
| ExerciseCard | `p-3` = 12 | `ExerciseCard.tsx:130` |
| Coach empty-state card | `p-5` = 20 | `coach/page.tsx:401` |
| History heatmap card | `p-3` = 12 | `history/page.tsx:82` |
| MissedSessionPrompt | (persona-recover Today) inherits `px-4 py-4` from banner class | 16/16 |
| Retest / interference / taper banners | `px-3 py-2` = 12/8 | `page.tsx:178, 210, 226, 671` |
| GraduationCard "You finished" | `p-4` = 16 | `page.tsx:489` |

**The card padding rhythm is a bit of a shrug.** 12, 16, and 20 all appear. Banners drop to 12/8. Rehab-adjacent apps benefit from one card-internal rhythm — either all 16 or all 12. Bronze/amber/slate banners at 12/8 read as "compressed alert" (fine), but Coach's `p-5` = 20 for the marketing empty-state card is bigger than every other card and reads as "marketing card in a product." **Pull Coach empty state to `p-4`** to match the app-native card rhythm.

---

## 5. Grid & alignment

- **Container widths.** All routes use `max-w-[760px] mx-auto w-full px-4 sm:px-6` — public routes in `AppShell.tsx:33`, authed in `AppShell.tsx:117, 147`. **Consistent max-width across every route.** No "History full-width, Today capped" schism. This includes the bottom-nav `<ul>` (`BottomNav.tsx:30`). ✓
- **Left-edge alignment of card titles.** All top-level cards on Today (YourPlanCard, MissedSessionPrompt, HeroStateCard, SignalsStrip, BlockSection, banners) rely on the `<main>` container's `px-4 sm:px-6` + the card's own outer margin. There's a small break: `BlockSection` uses `pl-3 border-l-4` (`page.tsx:707`), meaning session block titles are indented 12px + 4px border relative to card headers. **On persona-recover Today, "BARBELL REINTRO SESSION" is visually 16px right of "First hip check +2 more"**. Intentional — the border-left is the block visual anchor — but the offset is uncomfortable enough that on `persona-recover/mobile/01-today.png` the block header slightly disagrees with the ExerciseCard body which then goes 12px right of the block border. **Consider dropping the block-section left border and instead using a leading colored bar of `w-1 rounded` that doesn't consume the horizontal alignment budget.**
- **BottomNav grid.** 5 `<li flex-1>` (`BottomNav.tsx:36`), so each tab claims 20% of `max-w-[760px]`. Icons centered inside their `flex flex-col items-center` at each tab-cell centerline — on 393px that's tab centers at 39/117/196/275/353px. No misaligned icons in any persona screenshot.
- **Baseline alignment on Progress numeric readouts.** The TM editor uses `grid-cols-[1fr_90px_40px]` (`progress/page.tsx:319`) with `items-center` — the lift name and the number align on their vertical centers, not baselines. Because the input is a bigger box with `min-h-[44px]` and the lift name is 14px, the number sits ~2px higher optically than the label. Baseline-aligning would fix it but the `items-center` choice is a tap-target legibility trade — I'd keep as-is.
- **Milestone table alignment on Progress** (persona-recover `05-progress.png`): "TM 89 kg · next 120 kg in 41d (-31.0) · final 165 kg by 2027-04-24" — this metadata line wraps and the tabular-nums save it. The 4px indented list children (`pl-10`) are correctly offset for the collapsed chevron.

**Overall grid discipline: strong.** One max-width, one edge, one baseline convention. The only alignment quirk is the BlockSection border-l inset.

---

## 6. Iconography

- **Icon set: pure lucide-react.** 32 files import from `lucide-react` (grep `from "lucide-react"`). Zero imports from `@heroicons`, `react-icons`, or custom SVG files under `src/`. ✓
- **Stroke widths in use.** 7× `strokeWidth={1.75}`, 2× `{2}` (defaults), 2× `{3}` (Chevron bold accents), 1× `{2.25}` (active nav bold), 1× `{1.9}` (warning triangle in ExerciseCard), 2× `{0.5}` (in Heatmap SVG-related, non-lucide contexts). **The workhorse is 1.75**, which is a hair thinner than lucide default 2 — this is what gives the app its slightly-softer visual weight. Consistent. The bold 2.25 on the active bottom-nav tab (`BottomNav.tsx:48`) and 3 on the collapse chevrons are documented state-change accents. ✓
- **Icon sizes in use.** `size={16}` (33×), `{14}` (26×), `{18}` (12×), `{15}` (6×), `{12}` (5×), `{13}` (4×), `{11}` (3×), `{20}` (1×, bottom nav).
- **Verdict on sizes: three too many.** 6 sizes in play, when it should be 3: `20` for bottom-nav + top-nav utility, `16` for inline card icons, `14` for tight-inline (in-text) icons. Cull `15/13/12/11`.
  - `size={15}` at `ExerciseCard.tsx:203, 215, 218` (play, warning, info) — bump to 16, matches "primary inline card icon."
  - `size={13}` at `ExerciseCard.tsx:329` (MessageSquare in "Add note" link), `SignalsStrip.tsx:205-207` (chevrons) — bump to 14.
  - `size={12}` at `history/page.tsx:303-305` (chevrons) — bump to 14.
  - `size={11}` — 3 hits in charts / dropdowns, low blast radius.

Do this and every icon in the app renders at 14, 16, or 20. Landing-app peer bar hit.

---

## 7. Charts

### Heatmap (`src/components/charts/Heatmap.tsx`)

- **Cell size:** `gridAutoColumns: minmax(14px, 1fr); gap: 0.5` (`Heatmap.tsx:132-136`). On 393px viewport with 12 weeks in 328px available column, cell renders at ~24×24px. Not 14×14 — the min-width was set defensively; the actual size is larger. Verdict: **too large** — at 24px the grid overwhelms the card and starts eating a lot of space (persona-erratic `04-history.png` shows this — the 12-week grid is almost the entire above-fold on that screen). A GitHub-style contrib graph runs 11–14px on desktop and scales down on mobile. Cap the column at `max(14, min(20, ...))`.
- **Radius:** `rounded-[2px]` (`Heatmap.tsx:147, 165`). Correct — big-cell + subtle radius is the recognized pattern. Nothing more, nothing less.
- **Empty vs filled treatment.** `bg-line-soft` for empty (`Heatmap.tsx:153, 171`) vs full color for filled — good contrast. Skipped state uses `bg-line-soft border border-dashed border-line` (`Heatmap.tsx:152, 169`) — a dashed border is legible even at 14px, another correct call. Today's cell adds `ring-1 ring-bronze` (`Heatmap.tsx:154, 172`) — appropriate use of the brand accent as a "you are here."
- **Row labels ("M T W T F S S")** at `mono-caps h-4 leading-4 font-size: 9px` (`Heatmap.tsx:122-127`) — 9px is defensible as a chart tick label; day-of-week initials on a 14px grid don't need to be bigger.
- **Legend at 11px** (`Heatmap.tsx:202`) — fine.

### SymptomLoadChart (`src/components/charts/SymptomLoadChart.tsx`)

- Recharts axis / grid / tick — all overridden with palette tokens (`SymptomLoadChart.tsx:78-83`). Default Recharts axis is gray-500 (`#6b7280`) which would clash with the warm-dark on `#16181c`. The override to `#D6D9DE` for tick color (matches `--color-ink`) is correct.
- Grid line at `#2A2E37` (matches `--color-line`) with `strokeDasharray="3 3"` — reads as a subtle guide, not competing with data. ✓
- Bar `fillOpacity={0.55}` on `#E5654B` (symptom) — this is the load-bearing viz decision. persona-recover's chart (`05-progress.png`) shows why: symptom bars decay left-to-right from ~5.5 → 0, and the reduced fill lets the two overlaid line series (squat top, pull top) show through. Right call.
- **Legend at 11px** (`SymptomLoadChart.tsx:113`) — fine.
- **Y-axis label "kg" and "pain"** at `fontSize: 10` (`SymptomLoadChart.tsx:101, 110`). 10 is on the low side but it's an axis label, not body copy. Legible in the persona-recover screenshot.
- **The one issue:** the "Squat top set kg" and "Pull top set kg" line strokes are 2px (`SymptomLoadChart.tsx:128, 138`) — this is fine for the bronze line but the green line at 2px sits on top of a red bar at 55% fill and, in some cells, disappears into it. Would consider `strokeWidth={2.5}` for both lines, or introduce a 1px darker outline stroke to lift them off the bars.

**Overall chart craft: A-.** Both charts respect the token palette, use tabular-nums (inherited globally), avoid Recharts default gray. The Heatmap cell-size should shrink; the SymptomLoadChart line strokes could beef up. Everything else is right.

---

## 8. Sparse-vs-dense stress test

### Coach page — persona-strength (dense-should-be) vs. persona-erratic (dense-should-be) vs. persona-recover

All three Coach captures (`{persona}/mobile/03-coach.png`) render **exactly the same layout** — H1 "Coach", subtitle, "Coming soon" card, italic footer. The starter-prompt personalisation (`STARTER_PROMPTS_BY_PROGRAM` at `coach/page.tsx:15-51`) is bypassed here because Coach isn't configured in test — `coachConfigured()` returns false and `<NotConfigured />` renders.

What that gives us is a **negative** stress test: with no dense data on Coach, the empty-state card is the entire experience. And that empty state at 20px padding + 20px font-headline + a single 13.5px paragraph reads as marketing copy dropped into an app tab. Compare persona-recover Today (`01-today.png`) where the same-width 393px viewport packs a MissedSessionPrompt with two CTAs, a DateNav, a phase-progress line, HeroState, SignalsStrip, a block header, block note, and three ExerciseCards above the fold — that's the app's native density.

**Verdict: the visual system's dense mode is genuinely strong; the sparse Coach mode reads as "we haven't shipped this yet."** That's more of a copy/product issue than a visual one, but the marketing card treatment (large padding, marketing-headline sizing) makes it worse. **Recommendation:** pull `<NotConfigured />` to card padding `p-4` and headline `text-lg` — match app density. Currently `p-5` and `text-xl` (`coach/page.tsx:401, 403`).

### History heatmap — persona-recover (30 days, tri-color) vs. persona-erratic (45 days sparse amber) vs. persona-strength (30 days green-only)

The heatmap holds under all three. Persona-erratic (`04-history.png`) is the acid test: a wall of amber Saturday–Sunday cells with everything else empty. The `bg-line-soft` for empty cells doesn't disappear into `bg-surface` because line-soft (`#20232a`) is one step lighter than the card surface (`#16181c`). If they'd been the same value, the empty cells would vanish. They're not, and they don't. ✓

The symptom-spark section (`SymptomSpark` at `history/page.tsx:154-193`) correctly filters out zero-value regions (`history/page.tsx:91-97`) — persona-erratic shows only "LOW BACK" spark (single active region), and persona-recover shows two ("GROIN L" + "LOW BACK"). Persona-strength has none, so the whole "Symptoms — last 30" section vanishes. **Absence is handled cleanly at the section level, not by rendering empty flat lines.** This is the single most important sparse-vs-dense discipline call in the visual system, and the team made it right.

### Progress page — persona-strength dense (TMs, retest, milestones, banners) vs. persona-erratic sparse (banners only)

Persona-strength Progress (`05-progress.png`) shows the maximal state: welcome-back banner, week narrative, retest metrics with baseline/current/delta, "You finished — 6 weeks logged" graduation card, TM editor with 5 lifts, milestone table. All aligned to the same 12-column grid, all cards on the same `bg-surface` with `border border-line`. **Density holds.** The one visual crowding is the "Aerobic base indicators — HR trend, weekly minutes, retest deltas" italic muted line (`progress/page.tsx:243`) — at 12.5px muted italic that's supposed to be a section-explaining caption, but it competes with the H1 "Progress" and doesn't get read.

### Today page — persona-strength (dense with retest + graduation + engine banners)

persona-strength Today (`01-today.png`) shows the "You finished — Engine composite (Block 1)" GraduationCard, plus the "Retest window this week" banner, plus the "Back after 17 days — soften plan?" SignalsStrip strongest-signal + "+1 m..." truncation. **The dense card stack works** — the border-l color coding (bronze for graduation, amber for retest, amber for soften banner) gives the eye a scanning ladder. Same page collapsed on persona-erratic (`01-today.png`) shows a lean stack (DateNav, phase, No check yet, SignalsStrip, one STRENGTH HEAVY block).

---

## 9. Competitor benchmark

Attempted `WebFetch` against Linear was denied by workspace policy (scope escalation guard), so this section relies on committed peer-benchmark reference material in the same audit dir (`dev/audits/app/app-audit-4-competitors.md`, `dev/audits/design-research.md`), plus the memory-committed context that the warm-dark palette was derived Whoop/Oura-adjacent.

**Peer bar the app is measured against, based on committed research:**

- **Linear web app** — body 14px, one violet accent, semantic red/amber/green only, card gap 12–16, card padding 16. **Terav rating vs Linear:** matches on accents, matches on card gap, undershoots body (Terav's dominant body is 12.5–13, Linear is 14). Steal: promote 13 → 14 across all `.text-ink` body roles. Reject nothing — Terav's warmer ground reads better for a health app than Linear's cold gray.
- **Cal.com dashboard** — body 14px, one teal accent, semantic amber only for warnings, event-card padding 16. **Terav rating:** matches accent-count (1 primary + 1 secondary), overshoots on H2 shout (Terav's mono-caps H2 is louder than Cal.com's normal-case `text-lg` H2). Steal: demote H2 shouts to `text-[15px] font-semibold text-strong` normal-case, keep the mono-caps ONLY for chart / list captions. Reject: Cal.com's shadow-heavy card treatment doesn't fit a warm-dark surface.
- **Anthropic console** — body 14–15px, one orange accent, dense list rows at 8–12 vertical, tabular-nums in usage tables. **Terav rating:** matches on tabular-nums (in fact exceeds it — Terav has it global), matches on dense list rhythm on History log-rows. Steal: the console uses one persistent 16px card-title convention. Terav should adopt the same for card titles rather than the current mix of `text-lg`, `text-base font-semibold`, and `font-mono text-[13px] uppercase`.

**Landing-vs-app-side language.** The app should be denser and less display-face than landing. Both use Inter (via `next/font/google`) — same face on both sides is fine, given Inter reads well at both display and body sizes. Rehab / medical UX benefits from one clean sans; a display face would add nothing inside the app, and the team's decision not to introduce one is correct. **No font-pairing change recommended.**

---

## 10. Priorities

### P0 (do this week — visual discipline reset)

1. **Cull the type scale to 6 values.** Map every arbitrary `text-[X.5px]` and `text-[Xpx]` to one of: `text-[12px] / text-[13px] / text-sm (14) / text-[15px] / text-lg (18) / text-2xl (24) / text-3xl (30)`. Delete every intermediate `text-[10.5px]`, `text-[11.5px]`, `text-[12.5px]`, `text-[13.5px]`, `text-[14.5px]`. Grep count today: 22 sizes. Target: 7.
2. **Promote body baseline from 13 → 14.** Every `text-[13px] text-ink` in banner bodies, exercise-card preview lines, YourPlanCard schedule line, Coach starter buttons, milestone TM line → `text-sm` (= 14px). Files: `src/app/page.tsx` (banner strings at lines 178, 210, 226, 254, 671), `src/components/workout/ExerciseCard.tsx:176`, `src/components/workout/YourPlanCard.tsx:99-100`, `src/app/coach/page.tsx:359`, `src/app/progress/page.tsx:465`.
3. **Fix section-H2 shouting.** Replace `font-mono text-[13px] uppercase tracking-widest` used on every History and Today block header with the Progress-style `text-[15px] font-semibold text-strong`. Keep the mono-caps convention ONLY for the Heatmap "Last 12 weeks" caption and the Log — 45 DAYS list header (where it acts as a database-header). Files: `src/app/history/page.tsx:81, 100, 124, 137`, `src/app/page.tsx:709`.
4. **Fix ReadinessProposal accent violation.** Change the Advance CTA from `bg-green` to `bg-bronze text-ground` at `src/components/workout/ReadinessProposal.tsx:92`. Bronze is the app's decision color everywhere else.
5. **Bump BottomNav labels from 9 → 10.5.** `src/components/nav/BottomNav.tsx:42` — `text-[10.5px]` still fits 5 labels on 393px.

### P1 (do this month — icon and rhythm cleanup)

1. **Cull icon sizes to three.** Standardize on `size={20}` for nav, `{16}` for card / inline primary, `{14}` for in-text. Kill `{15}`, `{13}`, `{12}`, `{11}`. Highest-impact files: `ExerciseCard.tsx:203, 215, 218` (15→16), `SignalsStrip.tsx:205-207` (13→14), `history/page.tsx:303-305` (12→14).
2. **Standardize card-internal padding on 16.** Coach empty-state card `p-5` → `p-4` (`coach/page.tsx:401`). Banners stay at 12/8 as an intentional "compressed alert" variant.
3. **Fix phase-progress line leading.** `text-[12.5px] text-muted leading-tight` → `text-[13px] text-muted leading-normal` at `src/app/page.tsx:158`. `leading-tight` on a 12.5px muted line crushes readability.
4. **Shrink Heatmap cell size cap.** `gridAutoColumns: minmax(14px, 1fr)` → `minmax(14px, 20px)` at `src/components/charts/Heatmap.tsx:135`. Right now on 393px each cell renders ~24px, which visually overweights the heatmap.
5. **Extract chart palette constants.** Move the raw hex block at `src/components/charts/SymptomLoadChart.tsx:78-83` to a shared `chart-tokens.ts` that both charts (and any future ones) import. Otherwise a `--color-red` update will silently disagree with the chart.

### P2 (nice to have — polish)

1. **Beef SymptomLoadChart line strokes** to `strokeWidth={2.5}` (`SymptomLoadChart.tsx:128, 138`) so the green pull-top-set line doesn't disappear into the 55%-opacity red symptom bar overlays.
2. **Milestone roadmap % legibility.** `text-[10.5px] text-muted font-mono` at `progress/page.tsx:628` → `text-[12px] text-muted font-mono`. That line carries the actual progress percentage.
3. **Reconsider BlockSection border-l alignment.** The 4px left border + 12px left padding at `src/app/page.tsx:707` inset session content 16px from card headers, breaking left-edge alignment across the Today scroll. Consider `w-1 rounded absolute inset-y-0 left-0` as an overlay bar and drop the padding shift.
4. **Add tabular-nums assertion tests** — the app depends on `font-feature-settings: "tnum"` at `globals.css:60` for every numeric readout to align. If any component ever adds `font-variant-numeric: normal` inline it silently breaks the Progress TM editor and the SetRow grid.
5. **Document the palette contract.** A one-page `dev/design/palette.md` that says: bronze = primary decision, slate = secondary destination, green = state good / advance, amber = hold, red = back off, lat-* = anatomical diagnostic only. This is what's actually followed in code; write it down so it survives a refactor.
