# Terav landing — Conversion audit (mobile, above the fold)

Scope: pitch, category naming, CTA hierarchy, attention ratio, information order, section verdicts. Files audited: `src/app/page.tsx:14-33`, `src/components/Nav.tsx:5-27`, `src/components/sections/Hero.tsx:47-123`, `src/components/sections/ThreeWayContrast.tsx:15-130`, `src/components/sections/EvidenceClaim.tsx:4-25`, `src/components/sections/YourFirstWeek.tsx:9-109`, `src/components/sections/Programs.tsx:71-172`, `src/components/sections/WontDo.tsx:3-31`, `src/components/sections/OriginStory.tsx:3-15`, `src/components/sections/BetaCTA.tsx:4-37`, `src/components/sections/HowItWorks.tsx:7-51` (orphaned — not imported), `src/components/mockups/TodayMockup.tsx:9-81`, `src/i18n/dictionaries/en.ts:3-90`. Screenshots: live Playwright captures against `http://localhost:3050/` at iPhone 15 Pro (393×659 usable), iPhone SE (375×570), desktop 1280×720; fold contents extracted via `getBoundingClientRect()`, not eyeballed.

---

## 1. First-3-seconds verdict

The pitch fails the "what / for whom" test. The H1 is "Sharpen your edge." (`en.ts:7-8`) — a verb + possessive metaphor with no category-noun in the first 30 words. At 3 seconds a visitor cannot tell if this is a knife brand, a Notion clone, a razor, a language app, or a training tracker. The eyebrow "Beta · adaptive, cited, confirm-first" (`en.ts:6`) is a three-word jargon triple that only lands after you know the product. The subhead uses "training" (`en.ts:9`) but never names the domain (strength? running? rehab?) or the user. Basecamp anchors on "project management" in six words. TrainerRoad names category and mechanism in one line: "Get Faster with Cycling's #1 Training App." Runna wins in three: "Running made simple." Terav gives an abstract verb the visitor has to translate. Failure mode: metaphor-first hero from a founder attached to the product name, forgetting the visitor does not yet know what "Terav" is.

Second failure: on iPhone 15 Pro the entire product visual — `TodayMockup`, the phone-frame proof with a real Norwegian 4×4 session (`TodayMockup.tsx:9-81`) — sits below the fold at scroll=0. The visitor sees copy, badges, and buttons; no evidence a product exists. Runna, TrainerRoad, and Hevy all put a screenshot above the fold on mobile. Terav's `TodayMockup` is the strongest single proof asset on the page (a real cited proposal with Accept/Skip buttons and real HR data) and it is invisible on the primary device.

## 2. Fold analysis (iPhone 15 Pro, 393×659 usable, chrome accounted)

Above the fold, measured live at scroll=0:

- `nav`: 0→74 — Wordmark + Sign in (`Nav.tsx:7-26`)
- Beta badge: ~88→118 (`Hero.tsx:53-58`)
- H1 "Sharpen your edge.": 156→260 (`Hero.tsx:60-69`)
- Subhead paragraph: 284→362 (`Hero.tsx:71-73`)
- Primary CTA "Start the intake — 10 min →": 394→442 (`Hero.tsx:76-82`)
- Secondary CTA "Browse programs — no signup": 454→504 (`Hero.tsx:83-88`)
- Tertiary "See how it works ↓": 520→539 (`Hero.tsx:91-96`)
- Stat strip: starts 625, cut mid-glyph at 659 (`Hero.tsx:98-102`)

Below fold: full stat strip, `TodayMockup` (starts ~800+ per `Hero.tsx:105-107`), and every downstream section (`ThreeWayContrast` starts y=1464 by live measurement).

Verdict: the fold delivers three CTAs and zero product proof. The stat strip peeks as an orphan "5 programs" glyph with no label. Worse than not showing it. iPhone SE (375×570) is worse: "See how it works" ends at y=539 in a 570 viewport; stat strip fully off. Desktop (1280×720) is the only viewport where the mockup lands above the fold — and that is the viewport the target user is *not* on.

## 3. CTA hierarchy problems

**Primary CTA is a friction primary, not a value primary.** `Hero.tsx:76-82` renders `en.ts:10` "Start the intake — 10 min". The primary conversion asks for a 10-minute form as the first act. Julian-Shapiro violation: the offer is a signup flow, not a taste of the product. Secondary "Browse programs — no signup" (`en.ts:12`) is the actual no-friction offer — order inverted. TrainerRoad's primary is "Start Getting Faster" (outcome verb). Terav's is a time-cost estimate. Fix: primary becomes "See a real session — no signup" pointing to `/programs/engine-builder`; the intake demotes to secondary. Impact: **high** — this is the top conversion lever. First-visit intent to fill a 10-min form on a page where value has not landed is near zero on cold traffic.

**Tertiary link points to a phantom section.** `Hero.tsx:91-96` links `#how-it-works`. `HowItWorks.tsx` is not imported in `page.tsx` (see `page.tsx:1-13`). The `id="how-it-works"` on the landing is actually attached to `YourFirstWeek.tsx:48` — a rowing week, not a "how it works" mental model. Tapping "See how it works" lands the visitor on "Engine Builder Week 1 / Norwegian 4×4" for a program they never chose. Fix: either restore `HowItWorks` in `page.tsx`, or rewire the link to `#your-first-week` and rename to "See a real session ↓". Impact: **high** — broken promise plus a missing mental-model bridge.

**BetaCTA copy-clones the hero primary.** `BetaCTA.tsx:20-27` renders the exact same "Start the intake — 10 min" as the hero (`Hero.tsx:80`). Two copy-identical primaries carry information only when the top one is validated — Terav's isn't. Hero differentiates ("See a real session"); BetaCTA carries the intake ask after the case has been made. Impact: **medium**.

**Nav adds an in-fold third goal on desktop.** `Nav.tsx:12-17` renders an "Evidence" link plus "Sign in". Combined with three hero CTAs, that is 5 destinations on the desktop fold: Evidence, Sign in, Start intake, Browse programs, See how it works. Mobile correctly hides "Evidence" via `hidden sm:inline`. Fix: hide it on desktop too, or inline the citation into hero copy. Impact: **medium** — Gardner Attention Ratio inflation; page reads as marketing site with a nav.

**"Talk to the founder" is a `mailto:` with pre-filled subject.** `BetaCTA.tsx:28-33` — `mailto:hello@terav.fit?subject=Terav%20beta`. Fine as fallback; a Cal.com booking link should be primary. Impact: **low**.

## 4. Attention Ratio

Distinct clickable destinations across the page (deduped by URL):

1. Wordmark → `/` (`Nav.tsx:8-10`)
2. Nav → `/evidence` (desktop-only, `Nav.tsx:12-17`)
3. Nav → `/sign-in` (`Nav.tsx:18-23`)
4. Hero primary → `/sign-up` (`Hero.tsx:76-82`)
5. Hero secondary → `/programs` (`Hero.tsx:83-88`)
6. Hero tertiary → `#how-it-works` (broken, `Hero.tsx:91-96`)
7. EvidenceClaim → `/evidence` (`EvidenceClaim.tsx:9-22`, duplicates #2)
8. Five program cards → `/programs/{slug}` (`Programs.tsx:137-171`)
9. Programs → `/roadmap` (`Programs.tsx:110-116`)
10. BetaCTA primary → `/sign-up` (duplicates #4)
11. BetaCTA secondary → `mailto:` (`BetaCTA.tsx:28-33`)
12. Footer (assumed multi)

On the mobile fold: 3 actions (Sign in, primary, secondary) + tertiary + wordmark = 4-5. Page total: 12+. Gardner ≤3-on-fold rule violated; a private-beta landing should sit closer to 3-5 destinations total (primary, secondary, one proof click, one legal). Kill: nav `/evidence`; kill the `EvidenceClaim` banner section entirely; move mailto to footer.

## 5. Information order

Current (`page.tsx:19-30`): Nav → Hero → ThreeWayContrast → EvidenceClaim → YourFirstWeek → Programs → WontDo → OriginStory → BetaCTA → Footer.

Recommended, with one-line reason per move:

1. `Nav` — unchanged.
2. `Hero` — with a category-noun H1 (see §7) and mockup pulled into the mobile fold.
3. `YourFirstWeek` — moves from position 5 to 3. This is the "aha": three concrete sessions with named citations (Seiler 2010, Helgerud 2007, Joyner & Coyle 2008 at `YourFirstWeek.tsx:26,32,40`). It should back the pitch immediately, not sit five sections down.
4. `ThreeWayContrast` — after "Your first week" proves the format, the contrast has something to compare against. "A plan sharpened every session" (`en.ts:29`) is stronger once the reader has seen the plan.
5. `EvidenceClaim` — dissolved. Merge "100+ studies" into the `YourFirstWeek` strap. Currently a 176px fold-taker that links to another page with zero on-page persuasion (see §7).
6. `Programs` — unchanged position, copy, and mobile carousel.
7. `OriginStory` — kill the blade blockquote (`en.ts:78-79`); promote the body copy (`en.ts:80-81`) with founder name attached. The blockquote is metaphor talking to itself; the body is the actual moat.
8. `WontDo` — keep, expand-by-default on desktop.
9. `BetaCTA` — differentiated primary (see §3).
10. `Footer` — unchanged.

## 6. Social proof & trust

Placement: zero named-person testimonials anywhere. `OriginStory` (`en.ts:78-81`) references "one lifter working around a stubborn hip" in third person — that lifter is founder Margus. This is a first-person origin story hiding behind third-person prose. Nathan Barry pattern: named person + specific claim beats logos of unfamiliar companies. Runna leans on 9,200+ App Store ratings; TrainerRoad on 30M workouts; Hevy on 15M+ athletes. Terav has none of that yet and shouldn't fake it — but it *does* have a founder-scientist story with specific pathology (hip labral finding), specific training log, and specific engine proved on it. That is the moat. Surface it.

Specificity: `en.ts:15` claims "100+ cited studies". `YourFirstWeek.tsx:26,32,40` names six of them (Seiler, Brooks, Helgerud, Wisløff, Joyner, Coyle). `Programs.tsx:26-66` names ten more per-program. Good. The problem: "100+ cited studies" lives in the stat strip at `Hero.tsx:99-101` (off-fold on mobile) and the concrete six live 2229px down. Fix: put one named citation ("Norwegian 4×4 — Helgerud 2007") on the hero next to the mockup label. Amy Hoy: "one concrete cite beats 100+ cited studies for conviction."

Missing objection: the highest-friction objection isn't "will it work" — it's "am I the right shape of athlete." CLAUDE.md names the model: track picker (CrossFit / Strength / Running / Custom). None of that surfaces on the landing. The catalog names five programs; the *track* mental model is missing. Fix: replace the killed `EvidenceClaim` banner with a "Who this is for" strap: "For lifters, runners, and rehab-return athletes. Beta." That closes the Fried "for whom" gap.

## 7. Section-by-section: kill / keep / rework

- `Nav` (`Nav.tsx`): **rework.** Kill desktop `Evidence` link (`Nav.tsx:12-17`); one nav destination (Sign in) is enough on a landing page.
- `Hero` (`Hero.tsx`): **rework hard.** Kill "Sharpen your edge." (`en.ts:7-8`), replace with a category-noun H1 (see §9 P0). Move `TodayMockup` (`Hero.tsx:105-107`) into the mobile fold — stack below H1+CTA or shrink to fit above the stat strip. Fix broken anchor `#how-it-works` (`Hero.tsx:92`). Rewrite `en.ts:11` "See how it works ↓" → "See a real session ↓". Keep the `ChiselStroke` SVG (`Hero.tsx:10-45`) only after the pitch is fixed; craft-level polish on a broken pitch is spend without return.
- `ThreeWayContrast` (`ThreeWayContrast.tsx`): **keep, move.** Content and mobile segmented-control pattern (`ThreeWayContrast.tsx:39-99`) are strong. Move to position 4 (after `YourFirstWeek`).
- `EvidenceClaim` (`EvidenceClaim.tsx`): **kill as a section.** Currently a 176px banner that says "100+ primary studies. Every session cites its research." and links to `/evidence` (`en.ts:62`). Fold-taker with zero persuasion. Dissolve the claim into the `YourFirstWeek` strap and delete from `page.tsx:23`.
- `YourFirstWeek` (`YourFirstWeek.tsx`): **keep, promote to position 3.** Strongest section on the page. Mon/Wed/Fri prescription + citation is exactly the format Amy Hoy would ship. One caveat: the example is aerobic (Engine Builder), but the "for whom" is CrossFit-adjacent lifters. Add a strap line: "This is the aerobic track. Strength, skill, and rehab tracks each show the same shape."
- `Programs` (`Programs.tsx`): **keep.** Mobile snap carousel with 82vw cards (`Programs.tsx:83-100`) is the right call. Copy is dense and specific (`en.ts:50-54`), status pills are honest ("Five programs live. Two more in build.", `en.ts:48`).
- `WontDo` (`WontDo.tsx`): **rework.** The three items (`en.ts:66-74`) are the objection handling this page needs — currently hidden behind `<details>` (`WontDo.tsx:7-27`), a wrong container for content this important. Open by default on desktop; keep collapse as a mobile-only affordance. "Not a streak game. VO2max response varies ~10× person-to-person. We quote ranges, not one number." is the single most differentiated line on the entire page and it requires a tap to see.
- `OriginStory` (`OriginStory.tsx`): **rework.** Kill the blade metaphor blockquote (`en.ts:78-79`) — the hero chisel visual is already the same metaphor. Promote `en.ts:80-81` to a first-person paragraph with founder name: "I built the engine against my own training log while working around a hip labral finding. Every retest gate, symptom rule, and confirm-first mechanic was proved on that log first. — Margus." Nathan Barry construction.
- `BetaCTA` (`BetaCTA.tsx`): **keep, rework copy.** "Free during beta. Your call after." (`en.ts:84-85`) is good. Differentiate primary CTA from the hero (see §3). Replace `mailto:` on "Talk to the founder" (`BetaCTA.tsx:29`) with a real booking link.
- `HowItWorks` (`HowItWorks.tsx`): **restore or delete.** Currently orphaned — imported nowhere, referenced by broken anchor from Hero. Recommended: restore into `page.tsx` between Hero and YourFirstWeek. The mental-model → concrete-example pairing is textbook Fitzpatrick.

Banned-word scan: no instances of "elevate," "unleash," "empower," "seamless," or "leverage" in `en.ts` or section source. Copy discipline holds.

## 8. Competitor scan (steal / reject)

**Runna** — `https://www.runna.com/`. H1 "Running made simple." Primary "Start Your Free Trial." Hero: app screenshot. Proof: 4.9 stars · 9,200+ ratings.
- **Steal**: category-noun in three words. If Runna wins with three words containing "running," Terav can win with "Adaptive training. Cited every session."
- **Reject**: "Take your running to the next level" register. Terav's brand voice is "quiet authority + cited evidence." Do not import consumer-app hype tone.

**TrainerRoad** — `https://www.trainerroad.com/`. H1 "Get Faster with Cycling's #1 Training App." Subhead "TrainerRoad AI finds the right workout for every ride and adjusts to you in real time." Primary "Start Getting Faster." Proof: 30M+ workouts, 4.8/5.0.
- **Steal**: outcome-verb primary. "Start Getting Faster" is the anti-pattern to "Start the intake — 10 min." Also steal the subhead structure — read it as "Terav reads your log every session and cites its adjustment to a study."
- **Reject**: "#1 Training App" ranking and the 30-day money-back guarantee. Terav is a private beta; those proofs would be fabricated.

**Basecamp / 37signals** — `https://basecamp.com/`. H1 "The refreshingly straightforward project management system that's rock-solid and easy to use." Primary "Sign up free." Category-noun in the first six words.
- **Steal**: category-noun front-loading. Fried pattern: "The [adjective] [category-noun] [that differentiator]." Applied: "The training app that cites every change to a study" or "The adaptive strength & rehab tracker that sharpens against your log."
- **Reject**: the "refreshingly straightforward" chattiness. Basecamp is confidently casual; Terav is clinical-quiet.

**Linear** — `https://linear.app/`. H1 "The product development system for teams and agents." Subhead "Purpose-built for planning and building products. Designed for the AI era." Hero: three stacked product screenshots.
- **Steal**: "The X for Y" sentence pattern. Terav variant: "The training system for lifters who log." Also steal the multi-screenshot hero — Terav has `IntakeMockup` and `ProgressMockup` alongside `TodayMockup` in `components/mockups/`, all currently unused on the landing after `HowItWorks` was pulled. Put all three in the hero as a stacked reveal.
- **Reject**: 9-link enterprise nav. Terav must not become a marketing site with a nav.

**Superhuman** — `https://superhuman.com/`. H1 "AI that works where you do." Named-person: "Jonathan Linke, Marketing Manager." Numeric: "Save 4+ hours each week."
- **Steal**: named-person + concrete-claim block. Terav has a real founder story (`en.ts:80-81`) — surface it with name and specific claim.
- **Reject**: Superhuman can afford post-category abstraction ("AI that works where you do") because the brand is established. Terav cannot. Copy the trust construction, not the abstraction level.

## 9. Priorities

**P0 — the pitch fails the 3-second test.**

- Rewrite H1 `en.ts:7-8` (rendered `Hero.tsx:60-69`) from "Sharpen your edge." to a category-noun H1. Two candidates to test: (a) "The training app that cites every change to a study." (b) "Adaptive strength, cardio, and rehab. Sharpened every session, cited every change." Expected effect: closes the "what is this" gap without translation. Highest-lift change on the page.
- Rewrite subhead `en.ts:9` to name the user: "For lifters, runners, and rehab-return athletes. Beta." Closes the "for whom" gap; makes the CrossFit-adjacent + rehab niche visible.
- Rewrite primary CTA `en.ts:10` from "Start the intake — 10 min" to a no-friction primary such as "See a real session — no signup" pointing to `/programs/engine-builder`. Demote intake to secondary. Primary conversion becomes the value taste, not the signup form.
- Fix broken anchor `Hero.tsx:92` (`href="#how-it-works"`). Either restore `HowItWorks` in `page.tsx` between Hero and YourFirstWeek, or rewire to `#your-first-week` and change `en.ts:11` to "See a real session ↓". Closes the copy-anchor mismatch.

**P1 — the mockup is invisible on mobile.**

- Pull `TodayMockup` (`Hero.tsx:105-107`) into the mobile fold. Either stack a scaled-down mockup between subhead and CTA, or place a narrower version above the H1 as a "here is what a Tuesday looks like" strap. The strongest proof asset stops being invisible on the primary device.
- Kill nav `Evidence` link on desktop (`Nav.tsx:12-17`). Attention ratio down by 1 sitewide.
- Kill `EvidenceClaim` section (`page.tsx:23`, `EvidenceClaim.tsx`) and merge "100+ studies" into the `YourFirstWeek` strap. -176px of fold-taking chrome, +1 cite per visible claim.
- Reorder `page.tsx:19-30` to `Nav → Hero → YourFirstWeek → ThreeWayContrast → Programs → WontDo → OriginStory → BetaCTA → Footer`. Concrete plan proves the pitch before the abstract comparison table.
- Expand `WontDo` (`WontDo.tsx:7-27`) by default on desktop. The "VO2max response varies ~10×" line stops requiring a tap to see.

**P2 — trust and hygiene.**

- Rework `OriginStory` (`OriginStory.tsx:3-15`, `en.ts:76-81`) to first person with founder name and specific claim. Kill the blade blockquote — the H1's chisel visual is already the same metaphor. Nathan Barry trust construction becomes visible.
- Replace `mailto:` on `BetaCTA.tsx:28-33` with a Cal.com booking link. -1 friction step to qualified-lead conversations.
- Differentiate the two `/sign-up` CTAs. Hero primary becomes "See a real session — no signup"; BetaCTA primary keeps "Start the intake — 10 min". Funnel has two logical steps instead of the same ask twice.
- Delete or restore `HowItWorks.tsx`. Recommended: restore into `page.tsx` between Hero and YourFirstWeek — the mental-model bridge Fitzpatrick calls for.
- Kill or inline the stat strip (`Hero.tsx:98-102`). It peeks half-cut on iPhone 15 Pro and is fully off-fold on SE. If P1 mockup work pushes it further down, replace with a single-line strap under the subhead: "5 programs live · 100+ cited studies · every session adapts to your log."

Out-of-scope findings (one line each):

- `ChiselStroke` SVG animation (`Hero.tsx:10-45`) — 1.2s draw at 400ms delay; potential CLS/motion timing concern. → see landing-audit-N-motion-perf.
- Primary CTA button `Hero.tsx:76-82` — `text-black` on bronze gradient may fail WCAG AA against `--color-bronze-lo`. → see landing-audit-N-accessibility.
- Wordmark bronze pip (`Wordmark.tsx:13`) vs. `TodayMockup` neutral dot (`PhoneFrame.tsx:31`) — identity-color inconsistency. → see landing-audit-N-visual-craft.
- `<details>` in `WontDo.tsx:7` — summary needs a focus style; native `<details>` handles ARIA. → see landing-audit-N-accessibility.
- Stat labels `Hero.tsx:118-120` at `text-[11px]` — tap-target-adjacent. → see landing-audit-N-mobile-ux.
