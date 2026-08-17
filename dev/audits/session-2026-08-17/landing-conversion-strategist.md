# Terav landing — Conversion audit (mobile, above the fold)

Date: 2026-08-17.
Scope: hero clarity, CTA hierarchy, above-the-fold economy, information order, social proof placement, friction, section-sequence narrative flow. Files audited: `landing/src/app/page.tsx`, `landing/src/components/sections/Hero.tsx`, `landing/src/i18n/dictionaries/en.ts`, `landing/src/components/sections/ThreeWayContrast.tsx`, `landing/src/components/sections/YourFirstWeek.tsx`, `landing/src/components/sections/EvidenceClaim.tsx`, `landing/src/components/sections/Programs.tsx`, `landing/src/components/sections/WontDo.tsx`, `landing/src/components/sections/OriginStory.tsx`, `landing/src/components/sections/BetaCTA.tsx`, `landing/src/components/mockups/TodayMockupMobile.tsx`, `landing/src/components/Nav.tsx`. Live: https://terav.fit (HTTP 200; `<title>` confirms Option B copy).

---

## Verdict: GO-WITH-CAVEATS (for beta)

The positioning rewrite is a net win. "Pick one thing you want stronger. Sharpen it every session." (`en.ts:7-9`) with the "Pick my focus" CTA (`en.ts:11`) is materially clearer than the pre-shift "A training plan that sharpens every session / Build my plan" — it kills the HWPO-lookalike misread the prior audit called load-bearing. The Scope row landing FIRST in ThreeWayContrast (`ThreeWayContrast.tsx:20-28`) does real work: it re-anchors any reader still picturing a full-week plan within the first section below the fold. YourFirstWeek's "The other four days are yours" (`YourFirstWeek.tsx:51`) closes the loop honestly.

BUT — you softened the promise in the process, and the three-line H1 composition (H1_a / H1_b chisel / H1_c small) is over-crowded on desktop and gets worse at md-breakpoint. Ship for beta. Do not ship this hero unchanged for a paid launch. The five findings below are ranked by beta-blast-radius.

---

## Top 5 findings (ranked by beta-blast-radius)

### 1. H1 is now a three-line stanza where it used to be a two-line promise. Desktop suffers most. (fix cost: S)

`Hero.tsx:59-72`. At `md:text-6xl` (~60px) the composition renders as:

```
Pick one thing
[BREAK] you want stronger.        ← chiseled, gradient
Sharpen it every session.         ← smaller 3xl subordinate
```

Three lines, three type sizes, one gradient sweep, one animated stroke. The chisel/gradient span (`h1_b`) is visually the loudest thing on the page, so the eye reads "YOU WANT STRONGER" as the pitch — not "Pick one thing you want stronger." The imperative verb ("Pick") is buried in normal weight on line 1, and the payoff verb ("Sharpen") is demoted to a smaller trailing paragraph on line 3.

Compare to Linear's `linear.app` hero: one line, one weight, one accent. Compare to Cal.com: two lines max, no third subordinate line. Runna: one line + subhead, never a third emphasis-tier inside the H1 itself.

On mobile at 393px (iPhone 15 Pro), the `<br className="hidden sm:inline">` at `Hero.tsx:61` collapses so line 1 and line 2 flow together — mobile actually reads better than desktop here. Desktop is where the crowding is worst because the visual weight of the chisel + gradient span makes the third line feel like an afterthought.

Fix: kill H1_c as a separate `<p>` and fold it into the H1 as a second-line finisher, matching the two-line pattern in `BetaCTA.tsx:8-14` (`h2_a` + gradient span `h2_b`). Either:
- **(a)** `H1: "Pick one thing you want stronger.\nSharpen it every session."` — chisel under "stronger" OR under "Sharpen," not both. Two lines, one accent, one hero-tier weight.
- **(b)** Keep three lines but drop the size of H1_a and H1_b so H1_c reads as equal-weight — a stanza, not a hero-plus-subhead-plus-tagline.

Recommend (a). It's the pattern your own BetaCTA already uses successfully.

Impact: HIGH. This is the first 3 seconds. Every downstream section inherits this hierarchy.

### 2. "Pick my focus" is the right CTA verb, but the primary button doesn't tell you what happens next. (fix cost: S)

`en.ts:11` — `cta_primary: "Pick my focus"`. Rendered at `Hero.tsx:80-85` linking to `${APP_URL}/sign-up`.

The verb is honest (matches "Pick one thing you want stronger"), but "Pick my focus" without a friction disclosure lands in the same trust-gap as "Build my plan" did: click, land on a signup wall. The Fitzpatrick "so what?" test: what actually happens when I click? Do I pick right now, or do I have to sign up first before I get to pick?

The secondary link — `"Browse programs — no signup"` at `en.ts:13` — is doing the trust work that the primary should share. That's why it's rendered smaller and to the right of primary at `Hero.tsx:86-91`. But conversion research (Julian Shapiro; Unbounce case studies) is consistent: the no-friction affordance belongs adjacent to the primary and equal in prominence, or the primary is doing double duty and losing.

Fix: append a micro-line under the primary CTA (not inside the button) — `"10 minutes. Cancel anytime."` or `"Free through beta."` — whichever is honest. Or make "Browse programs — no signup" the visible frictionless path and demote "Pick my focus" one tier until the beta gate is off. Cal.com does this well: "Sign up" primary, "Book a demo" secondary of equal visual weight.

Impact: HIGH. Sign-up conversion on cold traffic is dominated by the "what am I committing to" question at the button.

### 3. Above-the-fold economy on iPhone 15 Pro is tight but survivable. Stats got demoted below the fold, which is correct — but the mockup competes with copy for the same eye. (fix cost: M)

Rough fold math on iPhone 15 Pro (393×852 CSS, ~800px usable after Safari chrome):

- Nav (`Nav.tsx:7`, `py-5`) — ~76px
- Hero section `pt-8` (`Hero.tsx:51`) — 32px
- Beta badge (`Hero.tsx:55-57`) — ~36px + mb-5 (20px)
- H1 three-line stanza @ text-5xl (~48px, `leading-[1.08]`) — ~180px (three lines) + mt-3 for H1_c (12px)
- Subhead paragraph `mt-6` (`Hero.tsx:74-76`) — ~90px
- Primary + secondary CTA row `mt-8` (`Hero.tsx:78-92`) — ~70px + 32px

Running total before mockup: ~658px. The `TodayMockupMobile` sits at `Hero.tsx:107-109` in mobile order 2 (between copy and stats). That leaves ~142px of the phone-frame visible above the fold — enough to peek the phone chrome and the top of the signals strip, not enough to see "Note detected → Accept." The confirm-first money shot (`TodayMockupMobile.tsx:42-58`) sits below fold on mobile.

Verdict: the fold barely holds. This is defensible for beta — the fold does show H1 + sub + CTA + mockup peek, which is more than most landing pages achieve. But the "aha" — the Accept/Skip confirm-first mechanic that differentiates Terav — lives below the fold. Whoop puts the wrist visual adjacent to H1 at ~450px, not 700px. Runna puts the pace-graph phone tight against the H1 with barely 100px of copy above it.

Fix (M-cost): (a) tighten the H1 to two lines per finding #1 — saves ~60px; (b) drop the beta badge `mb-5` to `mb-3` (`Hero.tsx:55`) — saves ~8px; (c) drop the subhead to `mt-5` — saves ~4px. That gets Note-detected surface into the fold. Or reorder mobile so the mockup renders immediately after H1 before the sub-paragraph — trades explanatory text for visual proof, which is the right trade in the first 3 seconds.

Impact: MEDIUM. Fold is currently passing; can be great.

### 4. Attention Ratio above the fold on mobile is 4 (badge is decorative but counts visually) — inside Gardner's ≤3 limit for the fold. Total page AR is 11+. Fine. But the Nav sign-in link competes with the hero primary. (fix cost: S)

Distinct clickable actions above the mobile fold: `Nav > Sign in` (`Nav.tsx:18-23`), primary CTA (`Hero.tsx:79`), `Browse programs — no signup` (`Hero.tsx:86`), `See how it works ↓` (`Hero.tsx:94`). That's 4 on the fold, one conversion goal (sign up). The `Sign in` link in nav is the odd one out — it's for returning users, but it renders at the same visual weight as an outline-button and directly next to it visually there's the primary CTA.

Nathan Barry's ConvertKit hero learned this: nav sign-in on a landing meant for cold traffic pulls click volume from primary. His fix — either hide "Sign in" behind a hamburger, or make it plain-text small type. Terav's Nav renders it as a bordered pill (`Nav.tsx:19-22`) — same shape as an outline CTA. Reads as competing.

Fix: demote `Nav > Sign in` to plain-text `text-sm` with no border, no `bg-white/[0.03]`. Same behavior, less visual weight.

Impact: LOW-MEDIUM. Not a beta blocker. Real once traffic scales.

### 5. Information order is right. Social proof is thin, and the beta-tone lets you get away with it — for now. (fix cost: L to fully fix; S to patch)

Current order (`page.tsx:22-29`): Hero → ThreeWayContrast → EvidenceClaim → YourFirstWeek → Programs → WontDo → OriginStory → BetaCTA.

Narrative reading: "Here's the pitch. Here's where we sit vs. templates/trainers. Here's our evidence claim (link). Here's what week 1 of Engine Builder actually looks like, cited. Here are the five programs. Here's what we're NOT (collapsed by default). Here's why the founder built it. Now sign up."

This is a defensible narrative for a founder-led beta. The Scope-first row inside ThreeWayContrast (`ThreeWayContrast.tsx:20-28`) is doing the "so what container is this" work. YourFirstWeek's cited Mon/Wed/Fri (`YourFirstWeek.tsx:17-41`) is the concrete-example move Amy Hoy would applaud — "one concrete cite beats 100+ cited studies for conviction" as the codebase's own comment at `YourFirstWeek.tsx:5-6` already knows.

What's missing: social proof of any kind. No named humans, no logos, no "5 beta users are running Engine Builder this week." The OriginStory (`OriginStory.tsx:1-19`) attributes the founder's rigor to his own log — that's honest and it does trust work, but it's still the founder vouching for himself. The BetaCTA (`BetaCTA.tsx:1-37`) leans on "One intake. Then your focus sharpens every session." with a mailto secondary — no proof between hero and final CTA that anyone else has actually used this.

For beta: acceptable. The beta badge (`en.ts:6`) sets reader expectations that this is pre-social-proof. But: the "88 cited studies" stat (`en.ts:15`) and the `EvidenceClaim` (`EvidenceClaim.tsx:15-17`) are your trust surrogates. That's Ladder's move (research-backed) and Runna's (research-team-vetted). It's a valid substitute — but ONLY if the reader believes the citation practice is real. Right now the citation payoff sits behind two clicks: EvidenceClaim → /evidence page. The `YourFirstWeek` cites at `YourFirstWeek.tsx:23,28,33` are the ONE inline proof point on the landing. Keep them; consider adding one more citation-in-context somewhere in Programs cards (currently at `Programs.tsx:26,36,46,56,66` — already there, good).

Fix (S patch for beta): Add one named quote-block above BetaCTA. Even one. "I ran Engine Builder Week 1 alongside my box and PR'd my 5k in week 6 — Anna, physio, Tallinn." A single named human beats 88 anonymous citations for the "does anyone actually use this" objection.

Fix (L, post-beta): three-user photo/quote row with one specific outcome claim per person. Nathan Barry's playbook — specificity beats logos.

Impact: MEDIUM. For beta traffic this is survivable. For paid traffic post-beta it's the objection blocker.

---

## What I did NOT cover

- **Typography scale, color contrast, spacing rhythm.** The chisel gradient stroke (`Hero.tsx:11-46`) and the three-line H1 hierarchy raise visual-craft questions I'm not the right auditor for. → see landing-visual-craft.
- **Thumb-reach math on the mobile CTA row.** The two-button `flex-col sm:flex-row` (`Hero.tsx:78`) with the tertiary "See how it works ↓" link (`Hero.tsx:94-99`) beneath is a three-target vertical column at mobile — reachability and tap-target spacing (min-h-44px is set on the tertiary at line 96) is mobile-UX scope. → see landing-mobile-ux.
- **Chisel-stroke animation performance and reduced-motion respect.** The `<style>` block at `Hero.tsx:34-43` uses a 1.2s cubic-bezier with no `prefers-reduced-motion` guard. Not my scope. → see landing-motion-perf.
- **Screen-reader flow of the three-line H1 stanza** — H1 semantics with an animated SVG child plus a `<p>` sibling read as separate landmarks. Not my scope. → see landing-accessibility.
- **Sign-up funnel after CTA click.** The audit stops at the primary button. What happens on `${APP_URL}/sign-up` — that's app-audit scope, not landing scope.
- **Persona-artifact fold captures.** Per session context.md, matrix-v2 bundles are stale. I computed the fold arithmetically from the code rather than trust a screenshot. If a specific fold claim above needs pixel-perfect confirmation, regenerate personas at 393×852 and re-check finding #3.
- **Copy of `/programs`, `/evidence`, `/roadmap` sub-pages.** Landing home only.
- **Banned-word scan of the site's copy.** For the record, I found no instances of "elevate," "unleash," "empower," "seamless," or "leverage" in `en.ts`. Clean.
