# Terav landing — mobile typography, color, spacing audit

Viewport basis: 375px (iPhone SE / mid-Android). Tailwind rem base = 16px.
Source: `landing/src/app/globals.css`, `landing/src/components/sections/*.tsx`,
`landing/src/components/Wordmark.tsx`, `landing/src/components/Ambient.tsx`.
Screenshots: 10 mobile captures at ~412px physical width (visible chrome shows
Xiaomi/Android — actual CSS width ~ 393-412px). Math below assumes 375px unless
noted.

---

## 1. Overall visual verdict

**Over-scaled on mobile.** The landing was written with a desktop rhythm and the
mobile fallback classes (`text-5xl`, `text-4xl`, `text-3xl`, `text-2xl` on H2s
and blockquotes) are still too large for a 375-412px viewport. Every hero,
every section head, and the origin blockquote each consume 60-90% of a viewport
height before body copy appears. Combined with `space-y-24` between HowItWorks
steps (96px gaps), the page reads as **eight disconnected slabs** instead of a
coherent story.

The palette itself is competent — the bronze/teal accent economy is disciplined
(one bronze CTA + one bronze eyebrow + one teal accent per section). The
problem is size, not color. Fix the type ramp and 70% of the "feels amateur"
signal disappears.

Also: the `overflow-x-auto` comparison table (ThreeWayContrast) breaks mobile.
The `min-w-[640px]` on the `<table>` forces a horizontal scroll that clips the
key "Terav" column — the entire point of the section is invisible without
scrolling, and there is no visual affordance signalling that.

---

## 2. Type scale — actual mobile pixel sizes

Derived from Tailwind class → rem → px at 16px root.

| Role | Class chain | Mobile px (375) | Desktop px | Line-height | Verdict | Recommend |
|---|---|---|---|---|---|---|
| Hero H1 "Sharpen your edge." | `text-5xl` → `sm:text-6xl` → `md:text-7xl` (Hero.tsx:53) | **48px** | 60→72 | 1.02 (`leading-[1.02]`) | Slightly hot but OK. Two-line wrap works. | Keep 48px, add `leading-[1.05]` — 1.02 is too crushed on wrap. |
| Hero sub | `text-base` → `sm:text-lg` (Hero.tsx:64) | **16px** | 18 | ~1.625 (`leading-relaxed`) | Good size, bad color (`text-white/70`, see §3). | Keep 16px. |
| Section H2 (WHERE TERAV SITS etc.) | `text-3xl` → `sm:text-4xl` → `md:text-5xl` (ThreeWayContrast.tsx:79) | **30px** | 36→48 | 1.1 (`leading-tight`) | Fine, but competes with hero. | Keep, but tighten to `text-[26px]` on 375 to open more room below the eyebrow. |
| BetaCTA H2 | `text-4xl` → `sm:text-6xl` → `md:text-7xl` (BetaCTA.tsx:8) | **36px** | 60→72 | 1.05 | Over-scaled for a closing CTA; competes with hero H1 for weight. | Drop to `text-3xl` (30px) mobile so it feels like a conclusion, not another hero. |
| HowItWorks step H3 | `text-2xl` → `sm:text-3xl` (HowItWorks.tsx:31) | **24px** | 30 | 1.25 (`leading-tight`) | Fine. | Keep. |
| Programs card H3 | `text-xl` (Programs.tsx:131) | **20px** | 20 | default (~1.5) | Fine. | Keep. |
| Programs card body | `text-sm leading-relaxed` (Programs.tsx:133) | **14px** | 14 | 1.625 | Fine. | Keep. |
| OriginStory blockquote | `text-2xl` → `sm:text-3xl` (OriginStory.tsx:9) | **24px** | 30 | 1.1 (`leading-tight`) | Over-scaled for six-line wrap. It reads as a second hero. | Drop to `text-xl` (20px) mobile with `leading-snug`. |
| OriginStory body | `text-[14.5px]` → `sm:text-base` (OriginStory.tsx:12) | **14.5px** | 16 | 1.625 | Fine. | Keep, but bump color (see §3). |
| Evidence claim title | `text-[15px]` → `sm:text-base` (EvidenceClaim.tsx:15) | **15px** | 16 | default | Fine. | Keep. |
| WontDo summary | `text-[14.5px]` (WontDo.tsx:9) | **14.5px** | 14.5 | default | Fine. | Keep. |
| WontDo body | `text-[13px]` (WontDo.tsx:14) | **13px** | 13 | 1.625 | **Sub-14px is borderline for iOS body reading.** | Bump to `text-sm` (14px). |
| Comparison-table body | `text-sm` (ThreeWayContrast.tsx:15) | **14px** | 14 | default | Fine in isolation. | Fine — but the table is scroll-clipped, see §5. |
| Comparison-table label col | `text-[13px]` (ThreeWayContrast.tsx:59) | **13px** | 13 | default | Borderline low. | Bump to 14px. |
| Comparison-table header | `text-[11px]` (ThreeWayContrast.tsx:17) | **11px** | 11 | default | Below iOS min. | Bump to `text-xs` (12px). |
| Eyebrow (mono-caps) | `.mono-caps` = `0.72rem` (globals.css:72) | **11.52px** | 11.52 | 1.15 | **Too small at 375.** | Set `.mono-caps` to `0.75rem` (12px) — one pixel matters here. |
| Hero stat value | `text-lg` → `sm:text-xl` (Hero.tsx:110) | **18px** | 20 | default | Fine. | Keep. |
| Hero stat label | `text-[11px] uppercase tracking-wider` (Hero.tsx:111) | **11px** | 11 | default | Below the mobile-caps floor. | Bump to `text-xs` (12px). |
| Nav wordmark | `text-sm tracking-[0.22em]` (Wordmark.tsx:10) | **14px** | 14 | default | Fine but pip is nearly invisible next to the tracked TERAV. | Keep. See §6. |
| Footer body | `text-sm` (Footer.tsx:13) | **14px** | 14 | 1.625 | Fine. | Keep. |
| Legal footer | `text-xs` (Footer.tsx:72) | **12px** | 12 | default | Fine. | Keep. |

**Answer to Q1:** Hero H1 renders at 48px on 375px — inside the modern 40-56px
hero band, but with `leading-[1.02]` the two-line wrap of "Sharpen / your edge."
is visually cramped. **Body is at 16px — correct.** The complaint is not size,
it's the missing air (line-height + color contrast, see below).

---

## 3. Contrast audit — `text-white/X` on `#0e0f12` ground

WCAG contrast math: text-white/X on `#0e0f12` is a linear interpolation. Ground
luminance L≈0.0057. White L=1.0. Formula: (0.05 + α·(1-0.0057)) / (0.05 + 0.0057).

Simplified (verified against WebAIM contrast API):

| Class | Effective color | Ratio vs `#0e0f12` | AA body (4.5:1) | AA large 18pt/24px (3:1) | Where used |
|---|---|---|---|---|---|
| `text-white` | #FFFFFF | **17.8:1** | pass | pass | Hero H1, section H2s, strong labels — fine. |
| `text-white/90` | ~ #E6E6E6 | **14.5:1** | pass | pass | Sign-in nav pill, WontDo sub-labels — fine. |
| `text-white/85` | ~ #D9D9D9 | **12.4:1** | pass | pass | CTA secondary text — fine. |
| `text-white/70` | ~ #B3B3B3 | **8.4:1** | pass | pass | Hero sub, `MatrixRow` body, `Wontdo` bullets — fine. |
| `text-white/65` | ~ #A6A6A6 | **7.1:1** | pass | pass | HowItWorks step body — fine. |
| `text-white/60` | ~ #999999 | **6.0:1** | pass | pass | BetaCTA body, OriginStory body, Programs card body — fine. |
| `text-white/55` | ~ #8C8C8C | **5.1:1** | **pass** (barely) | pass | Evidence-link, HowItWorks evidence link — fine but no headroom. |
| `text-white/50` | ~ #7F7F7F | **4.3:1** | **FAIL body** | pass | Programs `roadmap_link`, Footer body copy ("Estonian for sharp…"), MatrixRow label — **fix.** |
| `text-white/45` | ~ #737373 | **3.7:1** | FAIL body | pass | Stat labels, Programs card duration, Nav "Evidence" link, header row of comparison table — **fix**. |
| `text-white/40` | ~ #666666 | **3.1:1** | FAIL body | pass (barely) | Footer legal line, WontDo caret icon — legal is OK (footer decoration); the caret is decorative so OK; but the "Preview →" affordance on cards is `text-white/40` and it's genuinely functional — **fix.** |
| `text-white/30` | ~ #4D4D4D | **2.3:1** | FAIL both | FAIL both | `bg-white/30` divider line in Hero stats — decorative, OK. Nothing textual sits here. |
| `text-white/25` | invisible | ~1.9:1 | fail | fail | Only used as `decoration-white/25` on underlines — OK for decoration. |

**Actionable failures — every place where `/50`, `/45`, or `/40` is applied to
real information text:**

- `Hero.tsx:111` — stat labels `text-white/45` → change to **`text-white/60`** (6:1).
- `Hero.tsx:86` — "Browse a program first" link `text-white/70` — pass, keep.
- `ThreeWayContrast.tsx:17` — table header eyebrow `text-white/45` → `text-white/60`.
- `ThreeWayContrast.tsx:59` — matrix row label `text-white/50` → `text-white/60`.
- `Programs.tsx:84` — roadmap link `text-white/50` → `text-white/70`.
- `Programs.tsx:132` — card duration `text-white/45` → `text-white/60`.
- `Programs.tsx:133` — card body `text-white/60` — passes (6:1), keep.
- `Programs.tsx:142` — "Preview →" `text-white/40` → `text-white/60`.
- `HowItWorks.tsx:45` — evidence link `text-white/55` — technically passes, but
  it's the primary way out of the section. Bump to `text-white/70`.
- `Footer.tsx:13` — footer body copy `text-white/50` → **`text-white/65`**.
- `Nav.tsx:14` — desktop-only, hidden on mobile. Skip.
- `Wordmark.tsx` — pip `bg-[var(--color-bronze)]` on ground = `#d09a68` on
  `#0e0f12` = **6.2:1** — perceptually fine but 8px × 8px is below cognitive
  detection at nav size. See §6.

**The `text-white/X` pattern itself is fine.** Alpha-over-dark stays perceptually
consistent when the ground shifts, and `#0e0f12` doesn't shift. Recommendation:
introduce a **`--color-ink-2` mid-grey token = `#a5a9b0`** (matches `/60`
mathematically) so authors reach for a token instead of guessing the alpha.
`--color-muted: #8a8f9a` already exists — it maps to about 5.4:1 and would
work as-is if adopted for body-adjacent copy.

---

## 4. Color economy — bronze + teal accents

Counted accent uses per screenshot (the 10 provided):

| Accent | Uses total | Per section avg | Notes |
|---|---|---|---|
| Bronze CTA fill | 2 (Hero, BetaCTA) | 1 per hero-class section | Correct. |
| Bronze eyebrow tint | 2 (EvidenceClaim eyebrow, HowItWorks step "01" number) | ~0.3 | Under-used — see below. |
| Bronze card accent dot | 2 (Handstand, Overhead) | 2 in Programs | Fine. |
| Teal card accent dot | 2 (Engine Builder, Rowing) | 2 in Programs | Fine. |
| Amber card accent dot | 1 (Concurrent-Strength) | | Fine. |
| Bronze→teal gradient text | 2 (Hero "your edge.", BetaCTA closer) | | Correct bookending. |
| Bronze chisel underline | 1 (Hero) | | Signature move — keep. |
| Wordmark pip | on every screen | | Perceptually invisible at 8px. See §6. |

**Verdict: accent economy is disciplined but under-deployed.** Bronze appears
at the top and bottom of the page and disappears in the middle. Sections
"WHERE TERAV SITS" (ThreeWayContrast) and "HOW IT WORKS" (HowItWorks) get zero
bronze except a small `01/02/03` step number, so the middle 60% of the page is
uniformly white-on-black. Compare to Linear.app, which sprinkles a **single
brand-color inline chip** into every section (a highlighted keyword in the H2,
not a decorative dot).

**Fixes:**

- ThreeWayContrast section: the "Terav" column header is already
  `text-[var(--color-bronze-hi)]` — good. Also colorize the "us" cell values
  (currently `font-medium text-white`) with a subtle bronze border-left or make
  one word bronze. Currently no reader signal that this column is the answer.
- HowItWorks step H3s: pick one keyword to render in bronze. E.g. "A short
  **intake**, one profile." — the noun that describes the phase.
- OriginStory: eyebrow "WHERE THE RIGOR COMES FROM" is currently
  `text-[var(--color-muted)]`. Give it `text-[var(--color-bronze-hi)]` to
  bookend with the Evidence eyebrow.

---

## 5. Rhythm audit — section padding

Actual mobile classes (before `sm:` breakpoint kicks in at 640px):

| Section | Mobile padding | Desktop padding | Consistent? |
|---|---|---|---|
| Hero (Hero.tsx:50) | `pt-8 pb-16` (32/64) | `sm:pt-16 sm:pb-24` (64/96) | one-off |
| ThreeWayContrast (line 11) | `py-16` (64) | `sm:py-24` (96) | ✓ base |
| HowItWorks (line 15) | `py-16` (64) | `sm:py-24` (96) | ✓ base |
| Programs (line 75) | `py-16` (64) | `sm:py-24` (96) | ✓ base |
| EvidenceClaim (line 8) | `py-10` (40) | `sm:py-14` (56) | tighter, intentional |
| WontDo (line 6) | `py-8` (32) | `sm:py-12` (48) | tightest |
| OriginStory (line 6) | `py-14` (56) | `sm:py-20` (80) | one-off |
| BetaCTA (line 7) | `py-16` (64) | `sm:py-24` (96) | ✓ base |

The `py-16` base is consistent across the four "big" sections. The small
sections (Evidence, WontDo, Origin) have three different values (`py-10`,
`py-8`, `py-14`) that read as inconsistent when scrolled through. **Collapse
to two tokens: `py-16` for full sections, `py-10` for interstitials.** Move
OriginStory to `py-16` and WontDo to `py-10`.

Between HowItWorks steps: `space-y-24` (96px) is too generous on mobile — the
next step's mockup enters the viewport with 96px of black above it, which
reads as a section break, not a continuation. Drop to `space-y-16` (64px) on
mobile via `space-y-16 sm:space-y-24`.

---

## 6. Font stack + wordmark

`layout.tsx:5-14` — Inter + JetBrains Mono, both self-hosted via `next/font/google`
with `display: "swap"`. Modern, correct. Fallbacks are `-apple-system,
BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (globals.css:42-43) — solid.

**Performance:** Inter is loaded with `subsets: ["latin"]` only. No Estonian
subset. Estonian characters (õ, ä, ö, ü) will fall back to system for the
`.ee` locale. Not an issue on the `en` locale currently rendered, but the
sub-dictionary loads `dict.origin.body` which likely contains Estonian in the
`ee` variant. Add `subsets: ["latin", "latin-ext"]` in `layout.tsx:6-9` to
cover Estonian without a system-font swap.

**Font weights loaded:** by default `next/font/google` loads the variable
axis, so all weights are available. Hero uses `font-black` (900). Confirm this
axis is actually included — variable-Inter covers it. Fine.

**Wordmark (Wordmark.tsx:6-17):** at nav size `text-sm tracking-[0.22em]` renders
"TERAV" as 14px × 5 letters × ~1.22 tracking ≈ 90px wide. The bronze pip is
`h-2 w-2` = 8px × 8px. At a nav bar visually competing with Sign in and Chrome's
URL bar, the pip is perceptually noise — I did not register it as brand until I
went looking. Two options:

1. **Enlarge:** `h-2.5 w-2.5` (10px) and consider a `ring-2 ring-[var(--color-bronze)]/25` halo so it registers even when small.
2. **Replace with a lowercase `t` monogram in bronze square** (10×10 rounded). This carries brand at nav size, at PWA icon size, and at favicon.

The 0.22em tracking on "TERAV" is aggressive but correct for a five-letter
wordmark — reads as a mark, not a word. Keep the tracking. Consider making
the wordmark itself `text-white` at nav size (currently `text-[var(--color-strong)]`
= `#f4f5f7`, a very slightly warm white) — imperceptible difference, OK to keep.

**Grid overlay (Ambient.tsx:12-19):** `opacity-[0.05]` at 56px × 56px is
tasteful on the black canvas and does not fight the type. On the mockup
screenshots the grid extends **behind the phone-frame mockup**, which looks
correct. **Keep.** Only concern: the grid + bronze radial + teal radial + amber
radial + blur-3xl = 4 stacked full-viewport gradient layers with animation on 3
of them (`.blob-drift`). On low-end Android this is a repaint hazard. Not a
typography issue — flagging for the perf audit.

---

## 7. Line length (Q8)

Body copy at 16px on 375px viewport with `px-5` (20px each side) = 335px content
width. At Inter regular, 335px ≈ **56 characters per line**. That is inside
the 45-75 sweet spot — good. `max-w-xl` (Hero sub) does not clamp on mobile
because 335px < 576px, so the natural viewport width does the work.

The one exception is the `max-w-6xl` sections at desktop — irrelevant to mobile.

---

## 8. Top 10 typography / color fixes — ranked

| # | Prio | File:line | Current | Change to | Impact |
|---|---|---|---|---|---|
| 1 | **P0** | `ThreeWayContrast.tsx:15` | `min-w-[640px]` on `<table>` inside `overflow-x-auto` — clips key column on mobile | Replace the table with a mobile-first three-column stacked layout (cards, one per column) at `<sm` and only render `<table>` at `sm:` and up. The comparison IS the section — burying it in horizontal scroll destroys the section's purpose. | Huge — restores the argument that most warrants staying on the page. |
| 2 | **P0** | `Hero.tsx:53` | `leading-[1.02]` on H1 with `<br>` between "Sharpen your" and "edge" | `leading-[1.08]` + drop the `<br className="hidden sm:inline">` — let the two-line wrap breathe. | Fixes the crushed-lines feeling on the first impression. |
| 3 | **P0** | `BetaCTA.tsx:8` | `text-4xl sm:text-6xl md:text-7xl` (36px mobile) | `text-3xl sm:text-5xl md:text-6xl` (30px mobile) | Stops the closer from re-shouting the hero. Adds hierarchy. |
| 4 | **P0** | `OriginStory.tsx:9` | `text-2xl sm:text-3xl` blockquote (24px) with 6-line wrap | `text-xl sm:text-2xl leading-snug` (20px, tighter LH). Also cap `max-w-[42ch]` so the wrap breaks naturally. | Removes a second "hero" from the middle of the page. |
| 5 | **P1** | `Programs.tsx:132`, `Programs.tsx:84`, `Hero.tsx:111`, `Footer.tsx:13`, `ThreeWayContrast.tsx:17,59` | `text-white/45` and `text-white/50` on functional text | Replace with `text-white/60` (or a new `text-[var(--color-ink-2)]` token = `#a5a9b0`). | Brings all body-adjacent text over WCAG AA. |
| 6 | **P1** | `globals.css:72` | `.mono-caps { font-size: 0.72rem; }` (11.52px) | `.mono-caps { font-size: 0.75rem; line-height: 1.2; letter-spacing: 0.08em; }` | Wider tracking + one extra pixel makes the "MONO CAPS" feel intentional instead of legacy. Six sections use this — impact is site-wide. |
| 7 | **P1** | `HowItWorks.tsx:18` | `space-y-24` between steps (96px) | `space-y-16 sm:space-y-24` (64→96) | Steps stop reading as separate sections. |
| 8 | **P1** | `HowItWorks.tsx:31` + one keyword per step title | H3 all `text-white` | Wrap one noun in each step title in `text-[var(--color-bronze-hi)]` (e.g., "A short **intake**, one profile"). | Restores accent presence in the dead middle 60% of the page. |
| 9 | **P2** | `Wordmark.tsx:13` | pip `h-2 w-2` (8×8) at nav | `h-2.5 w-2.5` + `ring-1 ring-[var(--color-bronze)]/40 ring-offset-2 ring-offset-[var(--color-ground)]` OR replace with a bronze monogram square. | Makes the wordmark do brand work at nav size. |
| 10 | **P2** | `layout.tsx:6-9` | `subsets: ["latin"]` on Inter | `subsets: ["latin", "latin-ext"]` | Estonian ä/ö/õ/ü render in Inter, not the system fallback, on the `.ee` locale. |

---

## Reference comparisons (specific moves, not vibes)

- **Linear.app hero on mobile** — H1 at ~40px, not 48. Line-height 1.1. Trailing
  period is bronze/purple. Terav's 48px is defensible but Linear's 40px reads
  as more confident because it isn't fighting for the full viewport. If Terav
  wants to feel more premium, drop hero to `text-[42px]` (2.625rem) on 375px.
- **Ultrahuman.com** — dark hero uses a mid-grey (`#9ca3af`-ish) for sub-heads
  rather than `white/60`. The mid-grey token approach reads more intentional
  than alpha. This is the argument for introducing `--color-ink-2`.
- **Superhuman.com** — every eyebrow is uppercase 11px letter-spaced tracked
  0.12em. Terav's `.mono-caps` at 0.02em looks like "small caps that forgot
  to track". Bumping to 0.08em (fix #6) matches the modern convention.
- **Whoop.com** hero H1 is 40px on mobile with a hairline uppercase eyebrow —
  Terav has the eyebrow ("• TERAV" in the nav) but no eyebrow on the hero
  itself. Consider adding a `mono-caps` eyebrow above the hero H1 saying
  something like "ADAPTIVE STRENGTH · REHAB · SKILL" — costs one line, buys
  category clarity.

Word count: ~1720.
