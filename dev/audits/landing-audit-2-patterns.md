# Landing audit 2 — patterns

Scope: mobile pattern selection per section. Sibling audits own copy length, typography, above-fold conversion. This one asks: for each block, is the current UI pattern (stack, table, accordion, etc.) the right pattern in 2025?

Source of truth: `/Users/margussellin/www/program/landing/src/app/page.tsx` composes eight sections in order — `Hero`, `ThreeWayContrast`, `HowItWorks`, `Programs`, `EvidenceClaim`, `WontDo`, `OriginStory`, `BetaCTA`.

---

## 1. Overall length verdict

**Too long on mobile, and the length is in the wrong place.**

Rough mobile scroll budget (viewport is ~900px tall on the reference device):
- Hero: ~1.5 screens (fine)
- ThreeWayContrast (the table): ~1 screen, and it overflows horizontally (broken)
- HowItWorks: ~3.5 screens — three copies of a ~750px `PhoneFrame` mockup (`/Users/margussellin/www/program/landing/src/components/mockups/PhoneFrame.tsx:17` sets `max-w-[340px]`, rendered ~600–780px tall depending on content)
- Programs: ~4 screens of stacked cards (5 cards, no filtering, no carousel)
- EvidenceClaim: ~0.4 screens (tight, good)
- WontDo: ~0.3 screens collapsed (great)
- OriginStory: ~1 screen (fine)
- BetaCTA: ~1.3 screens (fine)

That's roughly **12 viewport-heights** on mobile, and ~60% of it is `HowItWorks` + `Programs`. Founder's instinct is right: the middle of the page is where a carousel earns its keep. Kill scroll fatigue on the two mockup-heavy sections, and the page is the right length.

---

## 2. Section-by-section pattern audit

### Hero (`landing/src/components/sections/Hero.tsx`)
**Current:** two-column on desktop (`lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]`), stacked on mobile with `TodayMockup` beneath copy. **Verdict: keep.** This is the modern default. Reference: **Linear** (`linear.app`), **Vercel** (`vercel.com`) — hero copy left / product visual right on desktop, stacked on mobile. Only mobile fix worth doing: the mockup below the fold on mobile duplicates the first mockup shown again inside `HowItWorks` step 02 (also `TodayMockup`). That's a real problem — user sees the same phone twice within one scroll session. Swap Hero's phone for a lighter static frame (e.g. `PlanMockup` or a partial `TodayMockup` with just the SignalsStrip) so the "aha" moment isn't burned before How It Works.

### ThreeWayContrast (`landing/src/components/sections/ThreeWayContrast.tsx`)
**Current:** HTML `<table>` with `min-w-[640px]` inside `overflow-x-auto`. Confirmed broken in screenshot `a377caee`: "Trainers" column shows "A t..." and "Terav" is fully offscreen. **Verdict: replace pattern.** See section 3 below for the three treatments.

### HowItWorks (`landing/src/components/sections/HowItWorks.tsx`)
**Current:** three-step vertical stack, each step a `grid-cols-2` on desktop that collapses to stacked column on mobile, each with a full `PhoneFrame` mockup (`IntakeMockup`, `TodayMockup`, `ProgressMockup`). Each mockup is 340px wide on screen and 600–780px tall. **Verdict: change to swipeable carousel with sticky step chip.** See section 4. Reference: **Superhuman** (`superhuman.com`) uses sticky-visual scroll on desktop and horizontal snap-carousel on mobile with 1-of-3 dots.

### Programs (`landing/src/components/sections/Programs.tsx`)
**Current:** `grid gap-4 md:grid-cols-2 lg:grid-cols-3` — on mobile it's a stack of five ~450px cards. Total ~2200px. **Verdict: horizontal snap carousel with dot indicators + a "Domain" segmented control above.** With 5 items across 3 domains (Aerobic, Concurrent, Skill), the natural filter is domain. On mobile show three thumb chips (`All · Aerobic · Concurrent · Skill`) plus a horizontally scrolling row with `snap-x snap-mandatory` and 85%-viewport-width cards, dots underneath. Reference: **Airbnb category picker** (top of `airbnb.com`) for the chip rail, **Apple product cards** on `apple.com/iphone` for the horizontal snap of 3-up cards. This is a native CSS-scroll-snap pattern — no library needed.

### EvidenceClaim (`landing/src/components/sections/EvidenceClaim.tsx`)
**Current:** single tappable card, one line. **Verdict: keep.** This is the textbook 2025 "big claim + arrow" pattern (Stripe, Notion, Framer all use one-liner cards linking to a detail page). Nothing to do.

### WontDo (`landing/src/components/sections/WontDo.tsx`)
**Current:** `<details>` accordion with three items, collapsed by default. **Verdict: keep — this is exactly right for a de-risk block on a beta.** Reference: **Notion FAQ** (`notion.so/pricing`), **Stripe FAQ** (`stripe.com/pricing`). Native `<details>` is 0 KB of JS and does the job. The founder brief mentions four cards; the code has three items — worth double-checking with copy.

### OriginStory (`landing/src/components/sections/OriginStory.tsx`)
**Current:** single blockquote card, ~1 viewport. **Verdict: keep.** The pullquote pattern is timeless. Reference: **Linear** changelog headers, **Basecamp Shape Up** section intros. If anything, consider adding a small mono-caps byline ("Margus, founder — Tartu") to give the quote a face without pulling in a photo.

### BetaCTA (`landing/src/components/sections/BetaCTA.tsx`)
**Current:** big gradient headline + two rounded pill buttons stacked on mobile, centered. **Verdict: keep.** Reference: **Cal.com**, **Resend** (`resend.com`) — same footer-CTA convention. The `mailto:` fallback for "Talk to the founder" is founder-appropriate and honest.

---

## 3. The comparison table specifically

Screenshot `a377caee` shows the table breaking: 640px minimum width inside a ~380px viewport with `overflow-x-auto`. Users get a scroll hint (the little bar visible under the table) but comparison tables don't work when you can't see all columns at once — the whole point is side-by-side.

Three treatments, ranked:

**Treatment A — Segmented control switches "Us" against one competitor at a time (RECOMMENDED).**
Replace the 4-column table with a two-column table + a segmented control at the top: `[ vs. Templates ] [ vs. Trainers ]`. Only one comparison shown at a time, with Terav always in the right column. Zero horizontal overflow. Reference: **Linear vs. Jira** on `linear.app/vs/jira` uses this exact pattern.
- Cost: no new deps. Just a `useState` and two column renders. ~40 lines.
- Tradeoff: user has to tap to see the second comparison. Fair — they get more information density than they can currently read.

**Treatment B — Vertical comparison cards (one row per attribute, stacked columns).**
For each row (`WHAT YOU GET`, `WHEN IT ADJUSTS`), stack three labeled tiles vertically on mobile: "Templates: A session from a library" / "Trainers: A plan they wrote…" / "Terav: …". Row label as an eyebrow. Fully thumb-friendly, no interaction required. Reference: **Vercel vs. Netlify** blocks in `vercel.com/blog` posts.
- Cost: pure CSS restructure, no JS.
- Tradeoff: loses side-by-side visual scan. Reader has to hold "Templates" and "Trainers" in their head to appreciate the "Terav" tile. Less punchy.

**Treatment C — Swipeable column stack (mobile-only).**
Keep the table on desktop; on mobile show one column at a time (Templates → Trainers → Terav) with `snap-x` scroll and dot indicators. Reference: **Stripe pricing** on narrow viewports.
- Cost: CSS scroll-snap, no dep.
- Tradeoff: same issue as the current overflow — user might not know to swipe, and the "Terav" column is buried third.

**Recommendation: A.** Segmented control is what Linear, Cal.com, Retool all do for comparison content. On a fitness/rehab founder-led beta with two competitors framed, it also lets Margus write a sharper differentiator per foe.

---

## 4. HowItWorks — the mockup fatigue problem

Three steps, three mockups, ~2400px of scroll. On mobile this is where the page loses people — by mockup #3 the reader has scrolled past two hero-sized phone frames already, and the story hasn't advanced (all three phones show the same app, same status bar, same phone chrome).

Three viable patterns:

**Option 1 — Horizontal snap carousel of the three steps (RECOMMENDED for mobile).**
One mockup visible at a time inside a `snap-x snap-mandatory` container, step title/body above the mockup, `01 / 02 / 03` dots below. Height drops from ~2400px to ~800px. On desktop keep the current alternating side-by-side layout — the reveal works there because the eye can hold two columns.
- Reference: **Apple's iPhone feature carousels** on `apple.com/iphone`, **Whoop's "How it works"** on `whoop.com`.
- Deps: none required — CSS scroll-snap does 90% of the job. If you want programmatic dots and keyboard nav, `embla-carousel-react` is the modern pick (~4KB gzipped, no Framer Motion needed). If you already have Framer Motion for animation, you can skip Embla.
- Risk: users don't know it's swipeable. Mitigation: peek — show 5% of the next slide so the affordance is visible.

**Option 2 — Sticky-scroll (mockup pins while text scrolls through three states).**
One phone stays sticky on the right/center; text and mockup content cross-fade through the three steps as the user scrolls. Reference: **Superhuman**, **Retool**, **Arc Browser** all use this.
- Deps: framer-motion (~35KB gzipped) or manual IntersectionObserver.
- Verdict: **skip for beta.** This is a 2025 pattern but it's expensive to build and hard to get right on mobile (sticky on short viewports fights the browser chrome). Solo dev, ship the carousel.

**Option 3 — Tab-switcher (`[Intake] [Session] [Sharpen]`).**
Same 3 mockups, one at a time, but tab labels instead of swipe. Reference: **Notion feature tabs** on `notion.com/product`.
- Deps: none.
- Verdict: worse than Option 1 on mobile — tabs steal a row of vertical space that dots don't. Fine if analytics show swipe adoption is poor and you want to add discoverability later.

**Recommendation: Option 1 + sticky step chip.** Keep a small `01/02/03` chip pinned to top of the section as user swipes. Feels 2025.

---

## 5. Carousel vs. scroll — the framework

**Use scroll when:** content is homogeneous *and* every card matters (blog index, changelog, testimonials wall). Landing sections that build a linear argument (hero → problem → solution → CTA) should stay scroll-based because scroll ≡ narrative.

**Use carousel when:**
- Content is **parallel, not sequential** (5 programs, 3 personas, 4 features) — no card is a prerequisite for the next.
- **Each card is heavy** — a full phone mockup, a 400px screenshot, a video. Stacking heavy cards vertically triples the perceived page length without adding information.
- **The count is bounded** (3–7 items). Above 7, use a grid + filter, not a carousel.
- On **mobile specifically**, when the alternative is 3+ viewport-heights of the same visual pattern.

For a **founder-led beta with no analytics stack yet**, the extra rule: prefer patterns that degrade gracefully with zero JS. CSS scroll-snap ships without React state, works on all modern browsers, and Google Search indexes every card equally. A carousel behind `useState` hides content from crawlers until interaction — bad for SEO on a landing that's trying to rank.

Terav's HowItWorks and Programs are both parallel, heavy, bounded — textbook carousel candidates. Hero, OriginStory, EvidenceClaim, WontDo, BetaCTA are linear-argument moments — keep as scroll.

---

## 6. Top 8 pattern changes, ranked

**P0 — ship this week**

1. **Fix ThreeWayContrast overflow.** Replace `<table>` in `landing/src/components/sections/ThreeWayContrast.tsx:15` with segmented-control-driven two-column comparison (Treatment A above). The current state is a visible bug on mobile — third column is offscreen. Zero new deps. **~1 day.**
2. **Convert HowItWorks to horizontal snap carousel on mobile.** `landing/src/components/sections/HowItWorks.tsx:18` — wrap the `steps.map` in a `snap-x snap-mandatory overflow-x-auto flex` on mobile, keep the current alternating grid on `lg:`. Add `01/02/03` dot indicators below. No library needed for v1. **~1 day.**

**P1 — next sprint**

3. **Convert Programs to horizontal snap + domain chips.** `landing/src/components/sections/Programs.tsx:78` — mobile becomes chip rail (`All · Aerobic · Concurrent · Skill`) above `snap-x` row of 85vw-wide cards, dots below. Desktop keeps the 3-col grid. Reference: Airbnb category picker. **~1.5 days.**
4. **Deduplicate Hero and HowItWorks mockups.** Both currently render `TodayMockup` (Hero `Hero.tsx:99`, HowItWorks step 02 `HowItWorks.tsx:11`). Swap Hero to `PlanMockup` or a partial teaser so the user sees new information at each step. **~0.5 day.**
5. **Add peek to the HowItWorks carousel.** Show 5–8% of slide N+1 so the swipe affordance is obvious without a "→ swipe" label. Same file as #2. **~1 hour** if done alongside #2.

**P2 — polish once analytics exist**

6. **Add per-domain chip filter to Programs carousel.** Filter, don't just scroll — chip taps hide non-matching cards. Only worth it if analytics show users engage with domain chips (Airbnb-style). **~1 day.**
7. **Consider Embla or Keen-Slider for the carousels once you need programmatic control** (autoplay pauses on interact, keyboard nav, aria roles). Embla is ~4KB gzipped. `pnpm add embla-carousel-react`. Skip until CSS scroll-snap is proven insufficient.
8. **Add a mono-caps byline to OriginStory pull-quote.** "Margus, founder — Tartu" gives the quote a signature. No pattern change, ~0.2 day. Reference: Basecamp Shape Up section intros.

---

## Trend-fit summary

| Section | Current pattern | 2020 / 2025? | Proposed |
|---|---|---|---|
| Hero | Split hero, gradient headline | 2025 | Keep, swap mockup |
| ThreeWayContrast | HTML table + horizontal scroll | 2016 (broken on mobile) | Segmented control (Linear vs.) |
| HowItWorks | 3-step vertical stack of phones | 2019 | Snap carousel (Apple/Whoop) |
| Programs | 5-card stack, no filter | 2020 | Chip rail + snap carousel (Airbnb) |
| EvidenceClaim | One-liner card link | 2025 | Keep |
| WontDo | `<details>` accordion | 2025 (still ideal for FAQ) | Keep |
| OriginStory | Pull-quote card | Timeless | Keep, add byline |
| BetaCTA | Gradient headline + pill buttons | 2025 | Keep |

Total P0+P1 effort: ~4 days of focused work. Zero new runtime dependencies required — CSS scroll-snap handles both carousels. Add Embla only if the P2 polish reveals a real gap.
