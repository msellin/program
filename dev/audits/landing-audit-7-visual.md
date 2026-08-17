# Terav landing — Visual craft audit (mobile-first, type/color/rhythm)

Viewport basis: 375px and 393px mobile, 1280px and 1440px desktop. Tailwind rem base = 16px. All pixel sizes verified with Playwright `getComputedStyle` against the running dev server on 2026-08-16, not estimated from Tailwind defaults.

Source: `/Users/margussellin/www/program/landing/src/app/globals.css`, `/Users/margussellin/www/program/landing/src/components/sections/{Hero,ThreeWayContrast,EvidenceClaim,YourFirstWeek,Programs,WontDo,OriginStory,BetaCTA}.tsx`, `/Users/margussellin/www/program/landing/src/components/{Nav,Footer,Wordmark,Ambient}.tsx`, mockups directory.

Screenshots: `/tmp/terav-shots/terav-{375,393,1280,1440}-{fold,full}.png` plus competitor captures at 1440 (`comp-{linear,vercel,stripe,framer,anthropic-docs}-1440.png`).

Prior audits deliberately not read before this pass.

---

## 1. Overall visual verdict

Terav has one of the strongest identity anchors I have seen on an indie fitness landing: the bronze→teal chisel stroke under "your edge." is a real proprietary mark, not a Bootstrap gradient, and the mono eyebrows plus tabular numerals in stats set an editorial tone the category (MyFitnessPal, Fitbod, Hevy) does not touch. But the discipline breaks in two specific places. **First, the mobile type ramp is compressed at the top and flat everywhere else** — H1 lands at 48px, section H2s at 30px, program-card H3s at 20px, and the eyebrow at 11.52px. That is only three real steps between 11.52px and 48px, and the drop from 48→30 is a 37.5% cliff while every other jump is a mush. **Second, the accent economy is broken** — bronze, teal, amber, and green all appear as active accents inside single-viewport regions, sometimes inside the same card (`YourFirstWeek.tsx` uses all three tones as sibling elements). Refactoring UI's rule is one accent in view; Terav uses three in the "your first week" fold and four across the Programs grid. The chisel-stroke identity is doing more brand work than the rest of the palette, and the rest of the palette is fighting it.

---

## 2. Type scale — actual mobile pixel sizes

Values measured with Playwright at each viewport, not inferred. Column "Mobile 375" and "Mobile 393" collapse to a single column since the responsive breakpoints (`sm:` at 640px, `md:` at 768px) mean both mobile widths render identically.

| Role | Location | Class chain | Mobile ≤639 | Desktop ≥768 | Line-height | Weight | Tracking | Verdict |
|---|---|---|---|---|---|---|---|---|
| Hero H1 | `Hero.tsx:60` | `text-5xl sm:text-6xl md:text-7xl` `font-black leading-[1.08] tracking-tight` | **48px** | **72px** | 51.84 / 77.76 (1.08) | 900 | −1.2 / −1.8px | See §2.a |
| Hero sub | `Hero.tsx:71` | `text-base sm:text-lg` `leading-relaxed` | 16px | 18px | 26 / 29.25 | 400 | 0 | OK; leading loose |
| Beta badge | `Hero.tsx:55` | `text-[10.5px] uppercase tracking-wider font-mono` | 10.5px | 10.5px | inherit | 400 | 0.525px | Too small; see §2.b |
| Section eyebrow | globals.css `.mono-caps` | 0.72rem | **11.52px** | 11.52px | 13.25px (1.15) | 500 | 0.23px | Below iOS default 12px; see §2.b |
| Section H2 | `ThreeWayContrast.tsx:144`, `Programs.tsx` via SectionHead, `YourFirstWeek.tsx:51` | `text-3xl sm:text-4xl md:text-5xl` `font-bold leading-tight tracking-tight` | **30px** | **48px** (md+) | 37.5 / 60 (1.25) | 700 | −0.75 / −1.2px | Cliff to H1; see §2.c |
| BetaCTA H2 | `BetaCTA.tsx:8` | `text-3xl sm:text-5xl md:text-6xl` `font-black leading-[1.08]` | 30px | **60px** (md+) | 32.4 / 64.8 (1.08) | 900 | −0.75 / −1.5px | Weight inconsistent with §H2 above |
| Origin quote | `OriginStory.tsx:9` | `text-xl sm:text-2xl` `font-semibold leading-snug` | 20px | 24px | 26 / 31 (1.30) | 600 | −0.5 / −0.6px | Reads as H3, not as pull-quote |
| Program H3 | `Programs.tsx:156` | `text-xl font-bold` | 20px | 20px | 25px | 700 | 0 | Never scales; see §2.d |
| First-Week H3 | `YourFirstWeek.tsx:82` | `text-xl font-bold leading-tight` | 20px | 20px | 25px | 700 | 0 | Same as above |
| HowItWorks H3 (unused) | `HowItWorks.tsx:31` | `text-2xl sm:text-3xl` | 24px | 30px | 28 / 36 | 700 | 0 | Component orphan — see §5 |
| Body prose | ubiquitous | `text-sm` / `text-base` / `text-[13.5px]` / `text-[13px]` / `text-[11px]` | 11–16px | 11–18px | varies | 400 | 0 | Under-fifteens are dangerous; see §2.e |
| Stats value | `Hero.tsx:117` | `font-mono text-lg sm:text-xl` | 18px | 20px | 27 / 28 | 400 | 0 | JetBrains Mono looks small for the meaning of the number |
| Stats label | `Hero.tsx:118` | `text-[11px] uppercase tracking-wider` | 11px | 11px | 15.4px | 400 | 0.28px | Below eyebrow — inconsistent |
| Cite lines | `YourFirstWeek.tsx:93`, `Programs.tsx:163` | `font-mono text-[11px] leading-relaxed` | 11px | 11px | 17.6 | 400 | 0 | Reads as "fine print" instead of "authority" |

### 2.a Hero H1 verdict

Mobile 48px works. Desktop 72px is at the very top of the modern SaaS range — Linear is at 64px/64 lh (measured), Vercel at 64px/64 lh, Stripe at 48px/55, Framer at 54px/54, Anthropic docs H1 at 52px/57 (serif). Terav at 72px/77.76 lh with `font-black` (900) is heavier and larger than any of the five references. **Recommend**: drop the desktop step from `md:text-7xl` (72px) to `text-6xl` (60px), and drop the weight from `font-black` to `font-extrabold` (800) or, better, Inter Display 700. Font-black at 72px on Inter has a slightly stodgy density — a warm-dark canvas amplifies it. The chisel-stroke identity already does the "heavy" work; the type does not need to compete. `Hero.tsx:60`.

Line-height on the hero H1 is `leading-[1.08]` = 51.84px on mobile. That is fine for two lines; the hero uses `<br className="hidden sm:inline">` so mobile is two natural lines. Good.

Tracking `-1.2px` on mobile 48px (−0.025em) and `-1.8px` on desktop 72px (−0.025em) is consistent — good. Linear ships around −0.022em on their 64px H1; Terav is in the same neighborhood.

### 2.b Eyebrow and beta badge are at the visual noise floor

`.mono-caps` at 11.52px `Hero.tsx` via `globals.css:70-78`, and the beta badge at 10.5px `Hero.tsx:55`, and the stats label at 11px `Hero.tsx:118` are three different sub-12px sizes that all read as "small mono caps." This is three copies of the same role rendered at three different sizes with no visual reason. **Recommend**: pick one — 11.52px (which is the site's `.mono-caps` token) — and use it everywhere the role is "eyebrow/label/badge." Delete the arbitrary `text-[10.5px]` at `Hero.tsx:55`, `ThreeWayContrast.tsx:80`, `ThreeWayContrast.tsx:88`, and the arbitrary `text-[11px]` at `Hero.tsx:118`. Also: 10.5px in JetBrains Mono uppercase on a dark surface with `tracking-wider` becomes physically hard to parse at arm's length on 393px viewports. iOS system minimum for legible tap-adjacent text is 12px; the beta badge falls under it.

### 2.c The H1→H2 mobile cliff

Mobile: H1 48px → H2 30px. Ratio 1.60. Then H2 30px → H3 20px = 1.50. Then H3 20px → body 16px = 1.25. Then body 16px → eyebrow 11.5px = 1.39. That is a 1.60/1.50/1.25/1.39 sequence — no coherent modular scale. On a modest-major-third (1.25) or perfect-fourth (1.333) it should read as smooth. The 1.60 cliff at the top makes the section H2s feel undersized relative to the hero; screenshotting at 375px confirms — every H2 below the fold reads as an oversized paragraph opener rather than a section anchor. **Recommend on mobile**: H1 44px, H2 30px, H3 22px, body 16px, eyebrow 12px. That gives 1.47/1.36/1.375/1.33 — closer to a coherent 1.333 ramp. Or, if you keep 48px H1, push H2 to 32px (`text-[32px]`) and H3 to 22px for 1.50/1.45/1.38 — still uneven but tighter.

### 2.d Programs H3 and YourFirstWeek H3 never scale

`Programs.tsx:156` uses `text-xl font-bold` with no `sm:` or `md:` variant. Same at `YourFirstWeek.tsx:82`. On a 1440 desktop card the program name sits at 20px next to a 30px `duration`+`body` block — the card headline looks demoted. `HowItWorks.tsx:31` scales H3 correctly `text-2xl sm:text-3xl` — that's the pattern to copy. **Recommend**: `text-xl sm:text-2xl` on both files, moving desktop to 24px. `Programs.tsx:156`, `YourFirstWeek.tsx:82`.

### 2.e Body text under 15px is being asked to do too much

`text-[13.5px]` at `ThreeWayContrast.tsx:83, 91` and `YourFirstWeek.tsx:88` is the comparison-row body. This is the exact copy where readers are supposed to compare "templates vs trainers vs us" — the most persuasion-heavy prose on the page — and it renders at 13.5px on a 375px mobile screen inside a card with `text-white/70` opacity. Both `text-[13px]` (13px) at `Hero.tsx:93`, `EvidenceClaim.tsx:19`, `Programs.tsx:109`, `WontDo.tsx:10-14`, and `text-[11px]` for cites at `Programs.tsx:163` are all under the modern web body floor of 14px. **Recommend**: pull the ThreeWayContrast body up to `text-sm` (14px) minimum. Keep cite lines at 11px if you want the "authority footnote" feel, but bump their opacity from `text-white/60` to `text-white/70` so they actually read.

### 2.f Font pairing

Inter (Google) for sans, JetBrains Mono for mono. Setup at `layout.tsx:5-15`. Two families, both open, both free. This is defensible for beta. But: Inter at font-weight 900 (`font-black` in Hero and BetaCTA H2) does not have a true 900 optical size — Inter's black weight is dense but shares the same drawings as 700. On a marketing hero, Vercel uses Geist at 400 weight for their H1; Linear uses Inter at 510 (custom weight); Stripe uses Söhne at 300. **Every high-craft competitor uses a lighter weight than Terav**. `font-black` is a "shouting" weight — appropriate for a sale banner, not a considered pitch. **Recommend**: drop Hero and BetaCTA H2 from `font-black` (900) to `font-bold` (700), and let the chisel stroke plus the bronze-teal gradient do the emphasis work. This is the single change that would most cleanly move the site from "gym app landing" to "considered software product landing."

---

## 3. Color system

### 3.a Palette by role, from `globals.css:8-46`

| Role | Token | Hex | Where |
|---|---|---|---|
| Ground | `--color-ground` | `#0e0f12` | body bg |
| Ground 2 / surface | `--color-ground-2`, `--color-surface` | `#16181c` | (defined; unused directly in landing sections) |
| Surface 2 | `--color-surface-2` | `#20232a` | (unused directly) |
| Surface 3 / line | `--color-surface-3`, `--color-line` | `#2a2e37` | (unused directly — cards use `white/[0.02]` and `white/[0.08]` overlays instead) |
| Ink | `--color-ink` | `#d6d9de` | body text (via `color: var(--color-ink)`) |
| Strong | `--color-strong` | `#f4f5f7` | Wordmark text only |
| Muted | `--color-muted` | `#8a8f9a` | `.mono-caps` |
| Faint | `--color-faint` | `#5a5f6a` | (defined; unused) |
| Green | `--color-green` | `#5fb37a` | `Programs.tsx:127, 132` |
| Amber | `--color-amber` | `#e0a63a` | `YourFirstWeek.tsx:66, 72`, `Programs.tsx:129, 134`, `TodayMockup.tsx:63`, `IntakeMockup.tsx:28-30, 63-70` |
| Red | `--color-red` | `#e5654b` | (defined; unused on landing) |
| Bronze | `--color-bronze` | `#d09a68` | primary CTA gradient stop; Wordmark pip; Hero badge dot; Footer bronze dot; card accents |
| Bronze-hi | `--color-bronze-hi` | `#e8b988` | primary CTA gradient start; eyebrow accents |
| Bronze-lo | `--color-bronze-lo` | `#a67a4a` | primary CTA gradient end |
| Teal | `--color-teal` | `#7fc4d0` | chisel gradient end; TodayMockup border; YourFirstWeek Monday dot |
| Teal-hi | `--color-teal-hi` | `#a0d8e0` | (defined; unused) |

**Palette hygiene problem 1: the surface tokens are defined and abandoned.** `--color-surface`, `--color-surface-2`, `--color-surface-3`, `--color-line`, `--color-line-soft`, `--color-faint`, `--color-teal-hi`, `--color-red` are all defined at `globals.css:9-38` and never used in the landing sections. Every card in the landing uses `bg-white/[0.02]` (`Hero.tsx:53`, `ThreeWayContrast.tsx:72, 79`, `YourFirstWeek.tsx:76`, `Programs.tsx:142`, `EvidenceClaim.tsx:11`, `OriginStory.tsx:7`, `WontDo.tsx:7`, `BetaCTA.tsx:30`) and `border-white/[0.08]`. That means the surface color is derived from an alpha overlay against the ground, not from a token. If someone changes ground from `#0e0f12` to anything else, every surface changes uncontrolled. **Recommend**: rip out `bg-white/[0.02]` and replace with `bg-[var(--color-ground-2)]` (which is `#16181c`, mathematically the same as `white/[0.02]` on `#0e0f12` to within 1 point). Then the token system means what it says.

**Palette hygiene problem 2: `text-white/60` is the "muted" of the landing, not `--color-muted`.** Grep count: `text-white/60` appears 21 times across sections. `--color-muted` (#8a8f9a) is only ever used by `.mono-caps` in globals.css. The landing has silently redefined muted as `rgba(255,255,255,0.6)` = `#999999` on `#0e0f12` — very close to `#8a8f9a` but not the same. Two muted grays running side by side is a smell. **Recommend**: pick one — the token — and delete `text-white/60` across sections.

### 3.b Accent economy verdict — this is the biggest visual craft problem

Refactoring UI: one accent in view. Terav uses three or four in nearly every fold. Above-the-fold accent inventory at 393px (from `terav-393-fold.png`):

1. **Bronze pip** in wordmark (`Wordmark.tsx:13`)
2. **Bronze dot** in beta badge (`Hero.tsx:54`)
3. **Bronze→bronze gradient** on primary CTA (`Hero.tsx:78`)
4. **Bronze→teal gradient** on the "your edge." chisel-stroke text and stroke (`Hero.tsx:64`, `ChiselStroke` component)
5. **Teal border/tint** on the phone mockup's SignalsStrip card (`TodayMockup.tsx:14`)
6. **Bronze border/tint** on the phone mockup's "Interval" chip (`TodayMockup.tsx:41`)
7. **Amber text** on the phone mockup's fatigue-signal line (`TodayMockup.tsx:63`)
8. **Bronze background** on the phone mockup's "Accept" chip (`TodayMockup.tsx:66`)

**Eight distinct color-signal touchpoints in the fold at 393px.** The chisel stroke is the identity signature and must stay. The primary CTA gradient is the conversion driver and must stay. Everything else has to justify itself. The bronze pip in the wordmark plus the bronze dot in the beta badge is a duplication — pick one. The mockup uses bronze, teal, and amber as sibling accents inside a single ~340px-wide phone frame; that is at least two too many. The mockup is trying to show three product features (proposal card, interval chip, fatigue signal) each with its own color. That is the anti-pattern Refactoring UI names explicitly: "use color to signal one thing per view."

Below the fold the pattern repeats:

- **YourFirstWeek.tsx:60-72** uses teal / bronze / amber as the three days' tones. Three accents in view. `YourFirstWeek.tsx:16` types the `tone` as `"teal" | "bronze" | "amber"` explicitly — this is architected color-per-card. The card's "prescription" line (`YourFirstWeek.tsx:85`) also inherits the tone color. Reads as a color-coded key with no legend. What is "teal"? It is Monday. What is "bronze"? Wednesday. What is "amber"? Friday. The user does not know that. **Recommend**: monotone the three cards, use a single bronze-hi tone across all three prescription lines, and let the day-of-week text carry the difference. `YourFirstWeek.tsx:60-72`.

- **Programs.tsx** uses bronze / teal / green / amber as tones (`Programs.tsx:9`, `123-129`). Green and amber are also the semantic status colors (`AVAILABLE` = green, `PERSONAL` = amber, `Programs.tsx:132-135`). That means green means both "aerobic skill category" (unused right now — no green-toned program) and "AVAILABLE status." Same color, two meanings, adjacent on the same card. **Recommend**: reserve green and amber strictly for semantic states (available/personal/warning). Use only bronze and teal for category tone. `Programs.tsx:9, 123-135`.

- **BetaCTA.tsx:11** repeats the hero's bronze→teal gradient text treatment. This is the correct callback and it works — reinforces the identity at the closer. Keep.

- **OriginStory.tsx:8** uses `text-[var(--color-bronze-hi)]` for the eyebrow. Fine.

- **EvidenceClaim.tsx:14** uses `text-[var(--color-bronze-hi)]` for the eyebrow. Fine.

Total accent voices across the landing: bronze (×3 shades used: hi/base/lo), teal, amber, green. That is five color voices for a beta, on a brand that names two. The audit brief for this task explicitly named the problem: "bronze + teal + wordmark accent = already three color voices. Check whether the site holds discipline." **The site does not.**

### 3.c Semantic role coherence

- Bronze = primary CTA, brand accent, identity. Consistent. Good.
- Teal = secondary brand accent, "aerobic" category, product signal color in mockup. Overloaded.
- Amber = "warning/refusal" in IntakeMockup (correct semantic use, `IntakeMockup.tsx:28-30`), "fatigue signal" in TodayMockup (correct semantic use, `TodayMockup.tsx:63`), but also "Friday" in YourFirstWeek (arbitrary decorative use), and "concurrent-strength maintenance" category in Programs (arbitrary), and "PERSONAL status" in Programs (semantic). Four uses, three of them incompatible.
- Green = "AVAILABLE status" (semantic) and defined as a category tone (unused). Under-fitted so far, but the risk is future use will collide.
- Red is defined but never used on the landing. Fine — save it for real failure states in the app.

**Recommend**: publish a written rule to `globals.css` header comment:
> Bronze = brand + primary CTA. Teal = product-signal + identity gradient companion. Amber = warning/refusal only. Green = success/available only. Red = destructive only. Do not use amber, green, or red decoratively.

---

## 4. Spacing & rhythm

### 4.a Vertical rhythm inventory per section

| Section | File | Mobile `py` | Desktop `sm:py` | Container max-w | Notes |
|---|---|---|---|---|---|
| Hero | `Hero.tsx:50` | `pt-8 pb-16` (32/64) | `sm:pt-16 sm:pb-24` (64/96) | `max-w-6xl` (72rem = 1152px) | Asymmetric top vs. everything else |
| ThreeWayContrast | `ThreeWayContrast.tsx:35` | `py-16` (64) | `sm:py-24` (96) | `max-w-6xl` | System |
| EvidenceClaim | `EvidenceClaim.tsx:8` | `py-10` (40) | `sm:py-14` (56) | `max-w-3xl` (48rem = 768px) | Off-rhythm — see §4.b |
| YourFirstWeek | `YourFirstWeek.tsx:48` | `py-16` (64) | `sm:py-24` (96) | `max-w-6xl` | System |
| Programs | `Programs.tsx:75` | `py-16` (64) | `sm:py-24` (96) | `max-w-6xl` | System |
| WontDo | `WontDo.tsx:6` | `py-8` (32) | `sm:py-12` (48) | `max-w-3xl` | Off-rhythm — see §4.b |
| OriginStory | `OriginStory.tsx:6` | `py-12` (48) | `sm:py-16` (64) | `max-w-3xl` | Off-rhythm |
| BetaCTA | `BetaCTA.tsx:7` | `py-16` (64) | `sm:py-24` (96) | `max-w-4xl` (56rem = 896px) | System |
| Footer | `Footer.tsx:9` | `py-10` (40) | `sm:py-14` (56) | `max-w-6xl` | Fine — closer sections earn less breathing room |

### 4.b Rhythm breaks with `file:line`

The section spacing tries to run on a four-step scale (32/48/64/96 on mobile→desktop) but silently switches to a two-scale system in the three "narrow" sections:

- `EvidenceClaim.tsx:8` uses `py-10 sm:py-14` (40/56) — not on the 32/64/96 grid.
- `WontDo.tsx:6` uses `py-8 sm:py-12` (32/48) — not on the grid.
- `OriginStory.tsx:6` uses `py-12 sm:py-16` (48/64) — not on the grid.

Three sections all off-rhythm, each by a different amount. Reading top-to-bottom on mobile the vertical breath is: 32/64 hero → 64 (contrast) → 40 (evidence) → 64 (first week) → 64 (programs) → 32 (wont-do) → 48 (origin) → 64 (beta). That is seven distinct spacing values in one page. Vignelli called for at most three. Refactoring UI recommends a strict `4, 8, 12, 16, 24, 32, 48, 64, 96, 128` scale and picking your section pacing from within it. Terav respects the scale but picks too many steps. **Recommend**: collapse to two section paces — "major" (`py-16 sm:py-24`) for hero/contrast/YourFirstWeek/Programs/BetaCTA, and "minor" (`py-10 sm:py-16`) for EvidenceClaim/WontDo/OriginStory. Move EvidenceClaim from 40/56 to 40/64, move WontDo from 32/48 to 40/64, move OriginStory from 48/64 to 40/64. Now there are only two paces, both anchored to the same 64 major pulse. `EvidenceClaim.tsx:8`, `WontDo.tsx:6`, `OriginStory.tsx:6`.

Also: Hero's asymmetric `pt-8 pb-16` (`Hero.tsx:50`) makes the beta badge crash into the Nav on 375. The Nav is `py-5` (`Nav.tsx:7`) = 20px; then Hero starts at `pt-8` = 32px. That's only 52px between the wordmark baseline and the beta badge top — feels cramped. **Recommend**: `pt-10 sm:pt-16` on Hero to earn back the room.

### 4.c Internal card spacing rhythm

`YourFirstWeek.tsx:78-96` inside each card:
- `mt-3` (12px) between the day dot row and the H3
- `mt-1` (4px) between H3 and prescription
- `mt-3` (12px) between prescription and detail
- `mt-4` (16px) between detail and the cites divider
- `pt-3` (12px) inside the divider

The 4px `mt-1` between H3 (20px, lh 25px) and the mono-caps prescription line is too tight — visually the prescription touches the H3's descenders. **Recommend**: `mt-1.5` (6px) or `mt-2` (8px). `YourFirstWeek.tsx:85`.

`Programs.tsx` card sequence:
- `mb-5` (20px) between the category row and the H3
- `mb-1` (4px) between H3 and duration
- `mb-3` (12px) between duration and body
- `mt-5` (20px) then `pt-3` (12px) between body and cites divider
- `mt-4` (16px) between cites and "Preview →"

The `mb-5` (20px) followed by `mb-1` (4px) means the top of the card has huge breath and the middle collapses. Compare to YourFirstWeek's 12/4/12 — different sequences for what looks like the same "content card" pattern. **Recommend**: unify. Use `mb-4` (16px) between category-row and H3, `mb-1.5` (6px) between H3 and duration, `mb-3` (12px) before body. `Programs.tsx:144, 156, 157`.

### 4.d Dead space vs breathing room

Hero at 1440 (`terav-1440-fold.png`): the Hero container is `max-w-6xl` = 1152px centered in a 1440 viewport. That leaves 144px of gutter on each side. Fine. But the beta badge → H1 → sub → CTA → stats stack fits vertically in about 480px, leaving another ~200px between the stats block and the fold. The right column with `TodayMockup` (`Hero.tsx:106`) fills more of that space but at 375 the phone mockup is pushed below the fold entirely (see `terav-375-fold.png`: mockup starts about 640px down). The stats grid at `Hero.tsx:98` is fighting the mockup for the below-CTA space. **Recommend on desktop**: nothing — it looks earned. **Recommend on mobile**: keep the stats above the mockup, which the code already does. But tighten `mt-10` on the stats to `mt-8` to bring them closer to the CTA — currently there is 40px between "See how it works" link and the stats hairline divider.

BetaCTA at 393px (`terav-393-full.png` bottom): the CTA H2 → body → button stack has `mt-5` and `mt-10` breaths. The 40px between body and buttons is generous; the 20px between H2 and body is tight given the H2 is 30px with 32.4px line-height (`leading-[1.08]`). **Recommend**: `mt-6` (24px) between H2 and body. `BetaCTA.tsx:16`.

---

## 5. Grid & alignment

Container width discipline: `max-w-6xl` (1152px) used for hero/contrast/first-week/programs/footer/nav. `max-w-3xl` (768px) used for evidence/won't-do/origin. `max-w-4xl` (896px) used for beta CTA. **Three container widths is one too many.** The `max-w-4xl` on BetaCTA (`BetaCTA.tsx:7`) is orthogonal to the rest of the page. Because BetaCTA is `text-center` (`BetaCTA.tsx:7`), the wider container makes the H2 lines wrap differently than the sub — visible in `terav-1440-full.png` where the CTA sits in a wider frame than the origin quote above it, breaking the visual "we are landing this back inside the reading column" motion. **Recommend**: `max-w-3xl` on BetaCTA to match the other center-anchored narrow sections (evidence, origin). `BetaCTA.tsx:7`.

Horizontal padding is consistent: `px-5 sm:px-6` = 20/24px. Good. Nav matches at `px-5 sm:px-6` (`Nav.tsx:7`). Footer matches (`Footer.tsx:9`). One inconsistency: `Programs.tsx:75` has `py-16 sm:py-24` on the section but omits `px-5` — instead the padding is pushed down onto every child (`Programs.tsx:76, 83, 103, 109`). That is because the mobile carousel at `Programs.tsx:83-100` needs to bleed to the edge for the peek behavior. Justified. But the "sm:hidden" carousel container uses `px-5` and the "hidden sm:grid" grid uses `px-6` (`Programs.tsx:103`) — 20 vs 24, which means at exactly 640px the section content shifts 4px right. Minor but noticeable. **Recommend**: `sm:px-6` on both, or lift back to the section.

Grid alignment across the page respects a consistent center axis for the max-w-3xl bands but the max-w-6xl bands do not visually align with them — the max-w-3xl left edge sits at 336px on a 1440 (=(1440−768)/2) versus max-w-6xl at 144px. This is standard, but it means the eyebrow of ThreeWayContrast (left-aligned in max-w-6xl at 144px) and the eyebrow of EvidenceClaim (left-aligned in max-w-3xl at 336px) don't share a vertical line. Not fixable without picking one width family. Live with it, but do not add a fourth width.

`HowItWorks.tsx` is imported but not used in `page.tsx` — verify: `page.tsx:5-11` lists all imports; `HowItWorks` is not in that list. Grep confirms `HowItWorks.tsx` is orphan code. It still ships as compiled output. **Recommend**: delete `/Users/margussellin/www/program/landing/src/components/sections/HowItWorks.tsx` unless it's staged for a future test.

---

## 6. Imagery & mockups

The mockups are pure CSS phone frames — no PNG asset for the "phone." `PhoneFrame.tsx:21-38` uses `rounded-[44px]` outer and `rounded-[36px]` inner with an 8px bezel. That is honest — no plate glass, no dropshadow-on-glass tricks. The status bar at `PhoneFrame.tsx:24-35` shows "9:41 · Terav · 100" which is a good honest signal ("this is the real app, not a stock frame").

`TodayMockup.tsx` is the featured mockup in the hero. It packs seven distinct information surfaces (signals strip, program header, interval card, set table, note-detected sub-card, accept/skip buttons, bottom nav) into a 340px-wide frame at hero position. At 375px viewport that means the phone frame is rendered at `max-w-[340px]` = 340px, and each row inside is around 300px wide after 20px inner padding. The set table (`TodayMockup.tsx:46-56`) uses `text-[10px]` for the SET/TIME/HR/RPE header — 10px is unreadable at arm's length even on a Retina display. **The mockup is designed for someone leaning into a laptop, not someone glancing at a phone.** At 1440 it works. At 375 the density is too high — the reader can't tell what the mockup shows without zooming.

**Recommend**: build a second, simpler mobile-only version of `TodayMockup` that shows only the signals strip + program header + one row from the interval card + Accept/Skip. Or, alternatively, on mobile hide the mockup entirely below the CTA stack and show it as an anchor scroll target further down. `Hero.tsx:105-107`, `TodayMockup.tsx`.

Consistency across mockups: `TodayMockup`, `IntakeMockup`, `ProgressMockup`, `PlanMockup`, `ReportMockup` all use the same `PhoneFrame` shell. Only `TodayMockup` and `IntakeMockup` are referenced from live sections (Hero uses Today, HowItWorks — the orphan — uses all three). ProgressMockup, PlanMockup, ReportMockup are unrendered dead weight. **Recommend**: audit the mockups directory and delete any not referenced from a live route. Currently paying JS/CSS cost for four unused screens.

Iconography: `BottomNavStrip.tsx:11-46` uses lucide-style line icons at strokeWidth 1.75. Consistent, tasteful, matches Linear/Vercel visual density. Good.

---

## 7. Wordmark & brand chrome

`Wordmark.tsx`: bronze pip + "TERAV" in caps at `tracking-[0.22em]` sm size or `tracking-[0.14em]` large. Text uses `--color-strong` (#f4f5f7). The 0.22em tracking on the small variant is aggressive — at 14px (`text-sm`) the letter spacing is 3.08px. For comparison, Linear's wordmark tracks around 0.02em, Vercel's has zero tracking on the triangle+word. Terav's tracked-out approach is a deliberate "editorial" choice; combined with the pip and the ALL CAPS, it reads like a masthead. That's the identity. Ships. But at 393 mobile the tracked-out wordmark plus the "Sign in" button plus the mono uppercase beta badge below it means the top of the page has three separate small-caps typographic voices in the first 100 vertical pixels. Cognitive load is high before the H1 has said anything.

**Recommend nothing on the wordmark itself** — the identity is earned. But reduce competing voices around it: as noted in §2.b, kill the arbitrary `text-[10.5px]` on the beta badge and use `.mono-caps` (11.52px, tracking-widest via Tailwind, which is 0.05em — much less tracked than the wordmark's 0.22em). That way the wordmark's tracking becomes distinctively "wordmark tracking," not "our whole top nav is space-cadet."

The bronze pip in `Wordmark.tsx:13` (h-2 w-2 = 8×8px) is also duplicated by the bronze dot in the beta badge (`Hero.tsx:54`, h-1.5 w-1.5 = 6×6px). Two bronze dots within 100px of each other, doing the same job. **Recommend**: drop the bronze dot from the beta badge — the mono-caps text and pill shape are already enough signal. Or replace with a bronze underline on the "BETA" word only.

Chisel stroke `Hero.tsx:10-45` is the identity's crown jewel. `stroke-dashoffset` animation, bronze→teal gradient, cubic-bezier(0.65, 0, 0.35, 1) 0.4s delay. This is genuinely good work. Do not change. The one nit: the SVG viewBox is `0 0 300 12` with `preserveAspectRatio="none"` — the stroke gets stretched horizontally if the word underneath is longer than expected. On the current English "your edge." it works. If the copy ever swaps to a longer word (Estonian "sinu tera" as the audit brief implies bilingual), the stroke will thicken and the diagonal will flatten. **Recommend**: keep `preserveAspectRatio` but consider setting an explicit width in `em` so the stroke scales with the word.

Background: `Ambient.tsx` — three drifting radial-gradient blobs (bronze top, teal right, deep bronze base) plus a 56×56px grid at 5% opacity. The grid is honest craft — visible in `terav-1440-full.png` as a faint texture. On mobile at 375, the grid is barely perceptible; the blobs read as warm smoke. Good. The top blob at `Ambient.tsx:9` uses `rgba(208,154,104,0.32)` which is the exact bronze token at 32% opacity — token-derived. The middle blob at line 10 uses `rgba(127,196,208,0.22)` = teal token at 22%. The base blob at line 11 uses `rgba(166,122,74,0.18)` = bronze-lo at 18%. All three derived from tokens; consistent. Good.

---

## 8. Competitor benchmark

Measured with Playwright at 1440×900 on 2026-08-16.

### 8.a Linear (linear.app)
- H1: **64px / 64px lh** / weight 510 / Inter Variable, gray-scale white on near-black. Two-line hero: "The product development system for teams and agents."
- Body: **16px / 24px lh** / weight 400.
- Accents in view: **one** — the yellow star in the app-mockup below the hero (semantic "starred"). Nav "Sign up" button is white-on-dark, no color.
- Steal: the H1 line-height at 1.00 (`64/64`) is tighter than Terav's `1.08`. Terav can afford `leading-[1.02]` on the desktop hero for a similar effect.
- Steal: single accent above the fold. Ship.
- Reject: their weight 510 is a custom Inter Variable weight not available via Google Fonts. Terav stuck with Google Inter has to make peace with 500 or 600.

### 8.b Vercel (vercel.com)
- H1: **64px / 64px lh** / weight 400 / GeistSans, dark on white. "Agentic Infrastructure" — two words.
- Body: **16px / 24px lh** / weight 400.
- Accents in view: **zero color accents**. The only "color" above the fold is the black Vercel triangle and the pure-black "Sign Up" button.
- Steal: light H1 weight. Vercel's H1 at 400 on Geist reads as considered and confident. Terav's `font-black` (900) reads shouty by contrast.
- Reject: Vercel has enough brand authority to skip color entirely. Terav in beta cannot — the chisel-stroke identity is doing brand-building work Vercel does not need.

### 8.c Stripe (stripe.com)
- H1: **48px / 55.2px lh** / weight 300 / Söhne, green on white.
- Body: 16px.
- Accents in view: **one primary** — the green H1 word colored to match a decorative wave graphic. Purple sign-up button in nav (out-of-band chrome, not counted in fold economy).
- Steal: the trick of coloring one word of the H1 to introduce the identity color. Terav already does this with the chisel gradient — validated pattern.
- Reject: 300 weight looks great in Söhne (a display sans with a strong 300 weight). Inter at 300 is thin and looks web-safe. Do not chase this weight.

### 8.d Framer, Anthropic docs — brief
- Framer H1: 54px / 54 lh / weight 500 / GT Walsheim on dark. Accents in view: zero above the fold — the hero is monochrome. Below the fold uses gradient tiles heavily. Steal: 500 weight is bang-on for a modern H1 — Terav could ship this instead of 900.
- Anthropic docs H1: 52px / 57.2 lh / weight 300 / anthropicSerif. Serif hero on a docs site. Not directly applicable but note: even Anthropic uses weight 300 for their H1. The industry-wide direction is **lighter H1 weights, not heavier**. Terav is running in the opposite direction.

### 8.e Composite verdict

Every reference site uses fewer accents above the fold than Terav. Every reference site uses a lighter H1 weight. Every reference site (except Stripe) uses larger H1 line-height as a ratio to font-size than the Terav mobile setting. Terav is **denser** and **more saturated** than the modern SaaS bar — which suits the "sharpen" identity, but it means every excess accent hurts more.

---

## 9. Priorities

### P0 (ship this week; identity + hierarchy debt)

1. **Drop Hero H1 weight from `font-black` (900) to `font-bold` (700) or `font-extrabold` (800).** `Hero.tsx:60`. Also drop BetaCTA H2 weight from 900 to 700. `BetaCTA.tsx:8`. Every considered competitor uses 300–500. The chisel stroke is the identity — the type does not need to compete.

2. **Reduce hero desktop H1 from `md:text-7xl` (72px) to `md:text-6xl` (60px).** `Hero.tsx:60`. 72px on Inter Black on dark is the heaviest fold in any of the five references; drop it one notch and the hero breathes.

3. **Enforce accent economy in `YourFirstWeek`.** Kill the per-day tone system. Use bronze-hi on every prescription line. Keep the day-dot color if you must, but the prescription text should not vary by day. `YourFirstWeek.tsx:60-72, 85`.

4. **Kill duplicate mono sizes.** Replace all `text-[10.5px]` and stat-label `text-[11px]` with `.mono-caps` (11.52px) so there is one and only one eyebrow size. `Hero.tsx:55, 118`; `ThreeWayContrast.tsx:80, 88`.

5. **Fix the H1→H2 mobile ramp cliff.** Either bump mobile H2 from `text-3xl` (30px) to `text-[32px]` or drop mobile H1 from `text-5xl` (48px) to `text-[44px]`. `Hero.tsx:60`, `ThreeWayContrast.tsx:144`, `YourFirstWeek.tsx:51`.

### P1 (ship next week; system debt)

6. **Replace `bg-white/[0.02]` cards with `bg-[var(--color-ground-2)]` throughout.** Nine files. Grep list: `Hero.tsx:53`, `ThreeWayContrast.tsx:72, 79`, `YourFirstWeek.tsx:76`, `Programs.tsx:142`, `EvidenceClaim.tsx:11`, `OriginStory.tsx:7`, `WontDo.tsx:7`, `BetaCTA.tsx:30`. The tokens exist. Use them.

7. **Replace `text-white/60` with a `--color-muted`-derived class.** 21 sites. Unify the muted gray.

8. **Collapse section spacing to two paces.** Move `EvidenceClaim.tsx:8`, `WontDo.tsx:6`, `OriginStory.tsx:6` all to `py-10 sm:py-16`. Kill three of the seven vertical rhythms currently in use.

9. **Program H3 and YourFirstWeek H3 need a `sm:text-2xl` variant.** They currently stall at 20px on desktop, undersized. `Programs.tsx:156`, `YourFirstWeek.tsx:82`.

10. **Reserve amber and green for semantic states only.** Remove amber tone from `YourFirstWeek.tsx:16` (Friday), from `Programs.tsx` category tones. Semantic amber = warning/refusal. Semantic green = success/available. Nothing else. `Programs.tsx:9, 123-135`; `YourFirstWeek.tsx:16, 66, 72`.

### P2 (worth doing; polish)

11. **Delete orphan `HowItWorks.tsx` and orphan mockups (`PlanMockup`, `ProgressMockup`, `ReportMockup`).** If they are ever needed again, they are one git-log away. Meanwhile they pay JS cost.

12. **Kill the bronze dot in the beta badge** to end the duplicate-bronze-dot problem between Wordmark pip and Hero badge. `Hero.tsx:54`.

13. **Move BetaCTA to `max-w-3xl`** so the closing section aligns with the narrow reading column of Evidence/Origin. `BetaCTA.tsx:7`.

14. **Tighten Hero H1 line-height on desktop from `leading-[1.08]` (77.76px on 72px) to `leading-[1.02]` (73.44px).** Matches Linear's 64/64. Do this only after the weight is dropped in P0-1 — 900 at 1.02 will crash.

15. **Build a mobile-only condensed `TodayMockup`** or hide it below the CTA stack at 375. The current density is designed for desktop hover, not thumb glance. `Hero.tsx:105-107`, `TodayMockup.tsx`.

16. **Publish an accent-economy rule in `globals.css` header comment.** Bronze = brand + primary CTA. Teal = product signal + identity gradient companion only. Amber = warning only. Green = success only. Red = destructive only. Then hold the line.
