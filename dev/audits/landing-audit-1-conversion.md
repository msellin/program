# Terav landing — Conversion audit (mobile, above the fold)

Scope: first 4 seconds, CTA hierarchy, thumb reach, stat block, first scroll payoff. Files audited: `landing/src/components/sections/Hero.tsx`, `landing/src/components/Nav.tsx`, `landing/src/i18n/dictionaries/en.ts`, `landing/src/app/page.tsx`, `landing/src/app/globals.css`. Screenshots: 10 mobile shots at ~412w Android (Chromium mobile UI visible).

---

## 1. First-4-seconds verdict

**The hero loses the pitch to a metaphor.** A first-time visitor reads "Sharpen your edge" and has no idea what Terav is. The sub-headline (`en.ts:9`) — "Adaptive training that reads your log every session. Every change cites a study. You approve every one." — is where the actual value prop lives, but it is 22 words across three sentences and does not name the category ("training app for whom?"). A first-time mobile visitor scanning for 2–3 seconds walks away knowing the brand feels premium and dark, and nothing else. The chisel-stroke underline (`Hero.tsx:10-45`) is a nice signature but consumes the visual budget that should have carried the "what is this?" answer. Verdict: hero fails the "what / for who" test that Superhuman, Runna and Whoop all nail in one line.

Modern reference: **Superhuman's** "The fastest email experience ever made" answers what+who in seven words. **Runna** post-redesign leads with "Personalised running plans" — noun, then modifier. Terav leads with a verb and a metaphor, and lets the reader hunt for the noun.

---

## 2. Fold analysis (iPhone 15 Pro, 393×852 CSS px, ~800px usable after chrome)

On the shipped Android screenshot the fold sits roughly at the "Browse a program first" link. Mapped to iPhone 15 Pro:

**Above the fold (approx 0–800px):**
- Nav bar with wordmark + Sign in (`Nav.tsx:7-25`) — ~72px
- H1 "Sharpen / your edge." — ~230px at `text-5xl` (`Hero.tsx:53`)
- Sub-headline three lines — ~110px (`Hero.tsx:64-66`)
- Primary CTA "Get started →" — ~56px (`Hero.tsx:69-75`)
- Secondary "See how it works" — ~56px (`Hero.tsx:76-81`)
- Browse link — ~44px (`Hero.tsx:84-89`)
- ~40–60px of empty ground before the stat block

**Below the fold on iPhone 15 Pro:**
- Stat block (5 programs / 100+ / Every session) — `Hero.tsx:91-95`
- Entire phone mockup (`Hero.tsx:98-100`, `TodayMockup`)
- "TODAY · TUESDAY" caption

Discipline is **acceptable** — primary CTA sits in the fold and is thumb-reachable in the lower-third. What is wrong is that the hero has **no visual proof** above the fold. The mockup — the single strongest conversion asset on this page based on how tight the app screenshot is — is entirely below the fold on mobile. Whoop puts the wrist mockup adjacent to the H1; Ladder puts a coach photo. Terav puts nothing.

The 40–60px empty gap between the browse link and the stat block (`Hero.tsx:84–91`, `mt-4` then `mt-10`) is dead space that pushes the mockup further off-fold. Tighten to `mt-6`.

---

## 3. CTA hierarchy problems

- **Primary CTA copy is generic.** `Hero.tsx:73` renders `{t.cta_primary}` = "Get started" (`en.ts:10`). This is the least specific SaaS CTA in existence and does not tell the user what they get. Fix: "Start the intake — 10 min" or "Build my program". This ties the CTA to the actual next screen (the intake, shown in screenshot 3) and inherits credibility from "under ten minutes" copy at `en.ts:39`. Impact: single largest conversion lever on the page.

- **Tertiary link is doing the primary's job.** `Hero.tsx:84-89` "Browse a program first — no signup needed →" is the strongest offer on the page (zero-friction, addresses the exact anxiety a first-time visitor has). It is styled as a small underline (`text-[13px]`, `underline decoration-white/25`), buried below both CTAs. Runna and Noom both put "no signup required" in a badge above the primary CTA. Fix: promote to a pill-style secondary that lives NEXT TO "Get started", and demote "See how it works" (which is a nav-scroll anchor, not a conversion action) to a text link. This is the tell that the site does not trust its own primary.

- **Secondary CTA is a scroll anchor, not a conversion path.** `Hero.tsx:77` `href="#how-it-works"` — this is navigation. It burns the second-most-valuable button real estate on the page. Modern SaaS reserves the secondary slot for the second conversion path (demo, pricing, or "watch 60s video"). Superhuman does exactly this: primary = Get started, secondary = Watch the film.

- **Sign-in in nav competes with primary at first glance.** `Nav.tsx:18-23` uses a pill with border and backdrop-blur — visually it reads at similar weight to the outlined secondary CTA in the hero, and sits directly above eye level. On mobile it should be a text link (as Whoop does), reserving pill styling for the primary conversion path only.

- **CTA vertical stack on mobile eats fold budget.** `Hero.tsx:68` `flex-col … sm:flex-row` stacks the two buttons vertically on mobile. Each button is 56px + 12px gap = ~120px consumed for a redundant CTA. See fix P0-3 below.

- **No CTA in nav on mobile.** `Nav.tsx:12-14` hides "Evidence" behind `hidden sm:inline`. Fine. But there is no sticky "Get started" as the user scrolls down five screens of content. Standard pattern on Whoop, Runna, Levels: sticky mini-CTA appears after 1 scroll. Terav has none.

---

## 4. Stat block review

Rendered at `Hero.tsx:91-95` from `en.ts:13-18`.

| Stat | Verdict | Reasoning |
|---|---|---|
| **5 programs / in three domains** | **KEEP but rework** | This is mechanical description, not social proof. "5 programs" reads as small on a page that has to compete with template apps offering 1000+ workouts. Reframe as a strength: "5 programs / cited before shipped" (steals the line from `en.ts:49`). Or replace with "8 weeks / typical program". Numbers are not the point — **the specificity is**. |
| **100+ / cited studies** | **KEEP — this is the strongest stat** | This is the only line on the hero that differentiates from AI-slop competitors. It should be BIGGER, not equal-weight with the other two. Consider promoting to an inline chip above the H1 ("100+ cited studies · beta · Tartu") — this is exactly the pattern Levels uses ("100k+ members" chip). |
| **Every session / adapts to your log** | **KILL** | This is not a stat. It is a rewording of the sub-headline (`en.ts:9` "reads your log every session"). Two labels saying the same thing eats scan time. A visitor reading top-to-bottom hits the same claim three times in 15 seconds. |

Bigger problem: the stat block sits **below** the fold on iPhone 15 Pro, so as social proof it does not fire in the first-4-seconds window at all. On desktop it is redundant with the sub. Either move a single distilled stat chip **above** the H1, or accept the block is a below-fold anchor and pick three numbers that reward scrolling (e.g. `8 weeks avg`, `100+ studies`, `5 domains` — mechanical facts that reduce buyer risk).

Reference: **Whoop** uses a floating stat card overlaid on the phone mockup ("your recovery: 87%") — the stat is diegetic to the product, not an abstract counter. Terav's mockup already contains diegetic stats (HR 182, RPE 8, "load ×0.90 proposed"). **Reject** the abstract stat row and let the mockup be the proof.

---

## 5. First scroll payoff

Screenshot 2 shows what appears after the fold: the phone mockup ("2 updates from yesterday", "Aerobic base · Norwegian 4×4", the Accept/Skip note detection). **This is the single strongest asset on the page** — it shows Adaptive-training-that-cites-a-study as a rendered UI, not a claim. A first-time visitor who scrolls once sees the product working.

Screenshot 4 (second scroll) hits "Templates. Trainers. Then us." — the comparison table that overflows horizontally on mobile (`ThreeWayContrast.tsx:14` `overflow-x-auto` with `min-w-[640px]`). The user sees "TEMPLATE APPS", a partial "A T" column cut off, and has to horizontally scroll to see the Terav column. **This is a conversion killer.** Nobody horizontally scrolls a comparison table on mobile. And critically, the Terav column — the ONLY column that matters — is the one hidden off-screen right.

Fix: on mobile, restack the comparison as three cards (Template / Trainer / Terav) with Terav bronze-outlined last. This is a 20-line change and doubles the payoff of scroll 1→2.

Overall the first scroll rewards the swipe (mockup lands correctly). The second scroll actively punishes it.

---

## 6. Fold discipline

Adequate. The primary CTA sits at roughly y=650 on Android — solidly in the natural thumb zone (bottom-third). On iPhone 15 Pro the primary CTA lands ~y=680 which is still reachable. Nothing critical is below the fold **except the mockup** — which is exactly the wrong thing to hide.

The dead space between the browse link and the stat block (`Hero.tsx:84 mt-4` then `Hero.tsx:91 mt-10`) plus the border-top with `pt-6` adds ~60px that could have been used to lift the mockup ~half a viewport higher on larger phones.

---

## 7. Trust signals in the first two scrolls

**Present:**
- "100+ cited studies" in the stat block (below fold) — good but under-weighted
- The mockup itself, which cites `Norwegian 4×4` (a real HIT protocol) and shows the Accept/Skip mechanic — this is credibility by demonstration, and it's the strongest signal on the page

**Missing in first two scrolls:**
- No badge/pill above the H1. `en.ts:6` has `beta_badge: "Beta · Tartu, then everywhere"` — **this string is defined but never rendered.** Not referenced anywhere in `Hero.tsx`. This is the single easiest trust win on the page.
- No founder photo, no CrossFit box photo, no "built by" credit until the footer (scroll 8, screenshot 10 shows it: "Built by athletes at a real CrossFit box")
- No press logos, no testimonial, no user count. Fine for pre-launch — the mockup carries this.

The "not another AI slop app" signal lands at scroll 4–5 with the "Evidence claim" and "What Terav is not" sections. That is too late. The `beta_badge` string that already exists is a 5-minute fix that would signal "small, real, human" from second one.

---

## 8. Bounce risk

**The sentence that bounces distracted users:** the H1. "Sharpen your edge" combined with the metaphor animation is beautiful but semantically empty. A user scrolling Instagram, tapping the ad, seeing "Sharpen your edge" on a dark background with a bronze underline — this reads as a knife brand, a razor DTC, or a productivity app. Not fitness. Not rehab-aware. Not evidence-based.

**The sentence that would make them scroll:** the sub-headline's clause **"Every change cites a study. You approve every one."** — this is genuinely differentiated in a market of AI fitness apps that silently mutate plans. It is buried at position 3 of the sub. Promote it. Consider making it the sub-eyebrow above the H1: `en.ts` add `hero.eyebrow: "Every change cites a study. You approve every one."` and render it in mono-caps above the H1.

**Second bounce risk:** the horizontal-scroll comparison table (screenshot 4). A user who committed to scroll once, hits a broken layout, bounces harder than one who never scrolled.

---

## Top 8 concrete fixes (ranked by conversion impact)

### P0 — do this week

**1. Rewrite the H1 sub-eyebrow to answer "what is this / for who" in ≤10 words.**
File: `en.ts:5-9`. Add `hero.eyebrow` above H1 rendered at ~`Hero.tsx:52` in mono-caps. Suggested: `"Training app for lifters. Cited every session."` or `"Adaptive training. Every session. Cited."`. Rationale: fixes the metaphor-only H1 problem without killing the "Sharpen" brand line.

**2. Change primary CTA copy from "Get started" to intake-specific.**
File: `en.ts:10`. Change `cta_primary: "Get started"` to `"Start the intake — 10 min"` or `"Build my program"`. Rationale: turns the button into a specific next-step promise; "10 min" defuses commitment anxiety, matching `en.ts:39` copy.

**3. Swap the secondary CTA and the tertiary link.**
Files: `Hero.tsx:76-89`, `en.ts:11-12`. Promote "Browse a program first — no signup needed" to the pill-outlined secondary CTA position. Demote "See how it works" to the tertiary text link (or delete — the same section is one scroll away). Rationale: the zero-friction offer is the strongest secondary conversion path and is currently invisible.

**4. Render the beta badge that already exists.**
File: `Hero.tsx:52` (insert above H1), string exists at `en.ts:6`. Render as a small pill with the bronze dot: `● Beta · Tartu, then everywhere`. Rationale: 5-minute fix, adds trust signal above the fold, matches Runna / Levels launch-badge pattern.

### P1 — do this sprint

**5. Restack the comparison table as three mobile cards.**
File: `ThreeWayContrast.tsx:14-40`. Below `md:` breakpoint, render three stacked cards instead of a `min-w-[640px]` table. The Terav card should be the last one and bronze-outlined. Rationale: current state hides the Terav column off-screen right on mobile — the second-scroll payoff is broken. This is a P0 for anyone whose device is <640px wide, which is every phone.

**6. Kill the "Every session / adapts to your log" stat.**
File: `en.ts:17-18` + `Hero.tsx:94`. Replace with a program-length or user-count metric ("8 weeks / typical program" or "beta / by invite"). Rationale: stat block currently repeats the sub-headline claim; wastes a scan slot.

**7. Add a sticky mini-CTA on scroll (mobile).**
New: sticky bar in `Nav.tsx` or a new `StickyCta.tsx` that appears after 400px scroll. Copy: "Start intake →". Rationale: page is 8 scrolls long; primary CTA is only reachable in the hero and the final beta section (`en.ts:87 beta.cta_primary`). Whoop, Runna, Noom all do this.

### P2 — do this quarter

**8. Move the phone mockup partially above the fold on mobile.**
Files: `Hero.tsx:50-101`. On mobile, either (a) shrink the H1 to `text-4xl` for viewports <400px so the mockup peeks in at ~y=750, or (b) show a cropped strip of the mockup with the "2 updates from yesterday" pill visible above the stat block. Rationale: the mockup is the strongest proof asset and is currently entirely below fold; giving even 100px of mockup above fold changes the "what is this" answer instantly.

---

## Where I disagree with the current copy

- **`en.ts:9` sub:** "Adaptive training that reads your log every session. Every change cites a study. You approve every one." — three sentences, 22 words. A modern SaaS audit would flag this as three claims fighting for the same slot. The winning claim is #3 ("You approve every one") because it is unique to Terav's confirm-first mechanic. Lead with it: `"You approve every change. Every change cites a study. Adaptive training built on your log."` — or split it: promote the confirm-first line to eyebrow, keep "Adaptive training that reads your log" as the sub.

- **`en.ts:7-8` H1 "Sharpen / your edge."** — I would not kill this, but it needs an eyebrow above it doing the semantic work. "Edge" is dangerously abstract for a fitness app (reads as productivity SaaS). Superhuman gets away with abstraction because "email" is nailed later in the same sentence. Terav's H1 has no anchor noun.

- **`en.ts:12` browse_link "Browse a program first — no signup needed →"** — best-written line on the page. Do not touch the copy. Change the container.

- **`en.ts:14 stat_programs_label "in three domains"`** — "three domains" is jargon that reads as internal-team language. A prospect does not know what a "domain" means yet (defined at scroll 3 in the Programs section). Consider "aerobic, skill, concurrent" spelled out, or drop the label entirely.

- **The chisel-stroke SVG animation** (`Hero.tsx:10-45`) — brand-defensible, but it fires at 0.4s + 1.2s duration, meaning the visual weight peak lands right when a first-time visitor is trying to read the sub. Consider dropping the delay to 0.1s so the animation completes before the user's eye reaches the sub. Or accept the current timing as brand signature and move on — this is a P3 quibble, not a conversion blocker.

---

## Things the current design gets right (don't touch)

- Primary CTA color contrast is excellent (bronze gradient on near-black). Meets WCAG AA for the button label.
- CTA thumb-zone position is fine on standard phones.
- Font stack via `--font-sans` is loading quickly (no visible FOUT in the screenshots).
- The Ambient blob / grid background is restrained and doesn't compete with the CTA.
- Nav is minimal (wordmark + Sign in) — no menu clutter, correct for a landing page.
- The mockup on scroll 1 is genuinely load-bearing proof — do not replace it with a video or a 3D render.

Word count: ~1750.
