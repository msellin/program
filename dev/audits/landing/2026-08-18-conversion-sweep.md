# Terav landing — Conversion audit (2026-08-18)

Scope: hero pitch clarity, CTA hierarchy, above-the-fold economy at 375–393px, section-sequence narrative, social-proof placement, signup friction. Files audited: `landing/src/app/page.tsx:14-35`, `landing/src/components/sections/Hero.tsx:48-142`, `landing/src/components/sections/ThreeWayContrast.tsx:15-146`, `landing/src/components/sections/EvidenceClaim.tsx:4-25`, `landing/src/components/sections/YourFirstWeek.tsx:9-91`, `landing/src/components/sections/Programs.tsx:71-113`, `landing/src/components/sections/WontDo.tsx:3-31`, `landing/src/components/sections/OriginStory.tsx:3-19`, `landing/src/components/sections/BetaCTA.tsx:4-37`, `landing/src/i18n/dictionaries/en.ts:1-95`, `landing/src/components/Nav.tsx:5-27`, `landing/src/components/mockups/TodayMockupMobile.tsx:18-63`, `next-app/src/app/(auth)/sign-up/page.tsx:123-242`.

---

## 1. First-three-seconds verdict

The founder's read — "looks nice and engaging" — is half right. The visual system (bronze→teal chisel gradient, condensed 3-surface mockup adjacent to H1, quiet stats row, mono eyebrows) is tasteful and honest, and above-the-fold economy on 393px is now genuinely competitive. **But the pitch itself still fails the Mom Test on the first line.** The H1 reads `Pick one thing` / `you want stronger.` / `Sharpen it every session.` (`landing/src/i18n/dictionaries/en.ts:7-9`). Three seconds in, a cold visitor knows this is a fitness product, knows it wants them to pick something, does *not* know **what category of app this is**. No category noun ("training app," "focused-improvement app," "coach") appears until the sub. Jason Fried's Basecamp rule — category noun in the first six words — is violated. Amy Hoy's "can the user repeat back what you sell after 3 seconds" — the user can repeat "pick one thing… sharpen"; they cannot repeat "what tool is this."

Modern references: **Runna** — "The #1 running app, personalized for you" — noun in word 5. **Whoop** — "Unlock your best self" is bad, but the hero image (band + strain ring) supplies the noun instantly; Terav's mobile mockup does supply that noun (Norwegian 4×4, Engine Builder header) and is doing more work than the H1 is. **Linear** — "Linear is a purpose-built tool for planning and building products" — full sentence, no metaphor. This site does the *opposite*: pure metaphor ("sharpen"), no anchor. The chisel gradient on `you want stronger` and the "sharpen" verb are earning their keep as a visual signature, but they are branding, not pitch.

---

## 2. Fold analysis (iPhone 15 Pro, 393×852 CSS, ~800px usable after Safari chrome)

Above the fold (approx 0–800px on mobile, single-column stack per `Hero.tsx:52`):
- Nav row (`Nav.tsx:7`, ~72px including py-5)
- Section top padding (`Hero.tsx:51`, pt-8 = 32px)
- Beta badge pill (`Hero.tsx:55-57`, ~44px including mb-5)
- H1 three-line stack: `Pick one thing / you want stronger. / Sharpen it every session.` — at 393px `text-5xl` (48px) leading-[1.08] wraps H1_a to one line, H1_b to one line, H1_c is `text-2xl` on its own block. Approx 48+48+30 = ~150–170px inc. margins (`Hero.tsx:59-73`)
- Sub (~72px, three lines at text-base) (`Hero.tsx:75-77`)
- Primary CTA "Pick my focus" (~52px, py-3.5) (`Hero.tsx:80-86`)
- Secondary CTA "Browse programs — no signup" (~52px, gap-3) (`Hero.tsx:87-92`)
- Friction disclosure "Email + password. No card, no signup wall. Beta is free." (~28px) (`Hero.tsx:94-97`)
- Secondary link "See how it works ↓" (~44px min-height) (`Hero.tsx:99-104`)

Running total ~640px. TodayMockupMobile then loads at 340px width, ~360px tall (`TodayMockupMobile.tsx:18-63`). It **starts above the fold at ~660px, but ~85% of it (Norwegian 4×4 header, note-detected card, Accept/Skip row) falls below 800px**. The stats row (`Hero.tsx:121-125`) lives another ~140px down, well below fold.

Below the fold on iPhone 15 Pro:
- Bottom half of mockup — the "Note detected → Accept/Skip" surface, which is the *actual differentiator* (`TodayMockupMobile.tsx:43-59`)
- Stats row: 5 programs / 92 cited studies / Your focus (`Hero.tsx:121-125`)
- Everything else

Verdict: **mixed, leaning fail.** The first-visible mockup surface is "2 updates from yesterday · Left hip stiffness noted 2× · load ×0.90 proposed." That's a strong signal — adaptivity in one glance. But the confirm-first mechanic (the *only* thing that separates Terav from every other adaptive-training app) is below the fold. Runna and Whoop put their money shot (progress ring / today's run card) adjacent to the H1 at the top. Ladder puts a coach's face at eye level. Terav puts an adaptivity signal at eye level and buries the Accept button. The stats row being off-fold matters less — "92 cited studies" is a proof asset that reads better after skim.

**Fix priority: move the friction disclosure and "See how it works" link *below* the mockup (reorder mobile grid), or shorten the H1 stack by folding H1_c into the sub. Either buys ~80px, which brings the Accept surface above the fold.**

Desktop (1280×720): H1 sits left, mockup sits right and centers vertically per `lg:self-center` (`Hero.tsx:111`). Fold is fine — mockup surfaces all visible. No action.

---

## 3. CTA hierarchy problems

- **Primary CTA "Pick my focus" is a verb-object with no destination clue.** `landing/src/i18n/dictionaries/en.ts:11`. Click takes user to `${APP_URL}/sign-up` (`Hero.tsx:81`) — a full signup form with two consent checkboxes. The friction disclosure below (`Hero.tsx:94-97`) mitigates but the *button* still promises a lightweight action ("pick a focus") and delivers signup. This is a Fitzpatrick "so what?" trap in reverse — it under-promises the action cost. Fix: change primary CTA to **"Start free — pick my focus"** and keep the disclosure. Impact: medium — reduces bounce at click-through by aligning expectation with reality.

- **Secondary CTA "Browse programs — no signup" is doing too much.** `landing/src/i18n/dictionaries/en.ts:13`. Two competing frames — "browse" (verb) and "no signup" (friction claim). Reads confused at a glance. Fix: split — button label becomes **"Browse programs"** and the "no signup" claim moves under it as micro-copy paralleling the primary CTA's disclosure. Impact: low but improves scannability.

- **Tertiary "See how it works ↓" competes with the primary group.** `Hero.tsx:99-104`. It has `min-h-[44px]`, which makes it look like a third button at first glance even though it's underline-only. It also targets `#how-it-works` which is the YourFirstWeek section (`YourFirstWeek.tsx:44`) — good target, wrong pitch. That section is titled "This is Engine Builder, Week 1" — it's not "how it works," it's a concrete week preview. Fix: change link text to **"See a real week ↓"** and drop `min-h-[44px]` so it visually recedes to text-link weight. Impact: low, but eliminates the "three CTAs stacked" attention-ratio hit.

- **Nav "Sign in" pill competes with hero primary CTA above the fold.** `Nav.tsx:18-23`. On mobile it's the rightmost element in the nav row and reads as an action even though returning users are ~0% of landing traffic in beta. Impact: low. Acceptable trade-off for returning users, no fix required.

- **BetaCTA primary + Talk to founder mailto.** `BetaCTA.tsx:21-33`. `"Talk to the founder"` mailto is a soft-friction CTA that Nathan Barry would applaud. Keep. But its label paired with the founder's first name in OriginStory ("— Margus, founder", `OriginStory.tsx:15`) would specify further — **"Email Margus"** beats "Talk to the founder." Impact: low.

---

## 4. Attention Ratio

Distinct clickable actions on the page (mobile): Nav Sign-in + Hero primary + Hero browse + Hero "how it works" jumplink + EvidenceClaim card link + YourFirstWeek (none — passive) + 5 Program cards + roadmap link + WontDo details disclosure + BetaCTA primary + BetaCTA mailto + Footer links. **~15 distinct actions page-wide.**

Above the fold on 393px: 4 (Nav Sign-in, primary CTA, browse, jumplink). **This violates Gardner's ≤3 rule by one, and that one is the jumplink.** Kill the min-height on the jumplink per §3 and the fold reads as 3 actions with clear hierarchy: sign-in (recessive), pick-my-focus (primary), browse programs (secondary). Passes.

Conversion goals: **primary = signup, secondary = email founder.** Two goals, correctly weighted. No fix.

---

## 5. Information order

Current order: Hero → ThreeWayContrast → EvidenceClaim → YourFirstWeek → Programs → WontDo → OriginStory → BetaCTA (`page.tsx:22-29`).

Narrative reading: *"I pick one thing I want stronger. Here's how it's different from templates and trainers. 92 studies back it. Here's Engine Builder Week 1 concretely. Five programs live. What it won't do. Where the founder came from. Now pick your focus."*

That order is defensible and largely correct. The `Contrast → Evidence → YourFirstWeek → Programs` middle sequence is doing real work: it kills the "smart-plan app" misread (Contrast/Scope row per `en.ts:27-30`), stakes the trust anchor (Evidence's "92 primary studies"), makes the abstract concrete (YourFirstWeek's Mon/Wed/Fri with citations), then lets the visitor browse (Programs). That's Amy Hoy's promise-then-proof arc.

Problems:
- **EvidenceClaim between Contrast and YourFirstWeek is a speedbump, not a section** (`EvidenceClaim.tsx:8-25`, one thin banner-link). At 40–60px total height it interrupts the argument's momentum without adding weight. Either promote it (add a mini-strip: 3 named studies from the program library, e.g. "Helgerud 2007 · Seiler 2010 · Schumann 2022") or demote it to a footer trust-anchor. Right now it earns a click but not conviction.
- **WontDo (`WontDo.tsx:6`) is a `<details>` collapsed by default.** Its whole job is objection handling (clinician? uncertainty? streak-game?) and it hides behind a summary. Anyone who trusts you enough to open it already trusts you. Open by default on desktop, keep collapsed on mobile — or, better, break it into a 3-column strip that reads at a glance without a click.
- **OriginStory before BetaCTA is correct** (Nathan Barry / ConvertKit rule: named human before ask). Keep.
- **Programs section is heavy for its position.** 5 program cards on mobile snap-carousel (`Programs.tsx:83-95`). After YourFirstWeek has already shown Engine Builder Week 1, the Engine Builder card in Programs restates the pitch. Slight redundancy — acceptable trade-off. Keep.

Recommended order: **Hero → ThreeWayContrast → YourFirstWeek → Programs → EvidenceClaim (promoted, with 3 named studies) → WontDo (open on desktop) → OriginStory → BetaCTA.** One move: EvidenceClaim drops one slot so the concrete-week proof sits directly after the contrast, and the evidence banner reads as a trust footer to the Programs list, not a mid-argument interrupt.

---

## 6. Social proof & trust

Placement audit: **The strongest trust asset is the citation strings on Program cards** (`Programs.tsx:26,36,46,56,66`) — "Helgerud 2007 · Seiler 2010" reads as receipts, not marketing. Second-strongest: YourFirstWeek's per-day Cites row (`YourFirstWeek.tsx:74-79`). Third: the "92 cited studies" stat in the Hero. That's a good trust ladder — specific studies before aggregate count, aggregate count before founder story.

Specificity audit: **Zero anonymous logos, zero user testimonials, one named human (Margus, `OriginStory.tsx:15`).** In beta this is honest. Post-beta you need one specific user outcome ("Rowed a 2K in 6:48 after 6 weeks of Rowing 2K Test Prep — Erik, Tallinn") in the Programs section or as a floating card near BetaCTA. Nathan Barry's rule — one named human with a specific claim beats ten unnamed logos.

Missing objection: **the primary buyer objection is not "does it work" — it's "will I actually use it alongside my current training?"** The Hero sub says "the rest of your week is still yours" (`en.ts:10`) and ThreeWayContrast Scope row says "A focus arc. Rest stays yours." (`en.ts:30`) — good. But the objection *"three sessions a week is a lot on top of my box"* is not explicitly answered. YourFirstWeek says "Three sessions a week. The other four days are yours" (`YourFirstWeek.tsx:51`) — this is the right place, and the copy is fine. Keep.

Second missing objection: **why should I trust an unnamed engine to sharpen against my log?** OriginStory answers ("I built the engine against my own log — years of strength work fought around a stubborn hip," `en.ts:86`) but it's the second-to-last section. Consider surfacing "built against a founder's own multi-year log" as an eyebrow or micro-line under the H1 sub. High-signal, unfaked.

---

## 7. Section-by-section: kill / keep / rework

- **Hero.tsx** — **rework.** H1 lacks category noun; primary CTA copy doesn't match action cost; mockup Accept surface below fold at 393px. Fixes in §1, §2, §3.
- **ThreeWayContrast.tsx** — **keep.** Scope-first row order (`ThreeWayContrast.tsx:21-28`) is the right call. Mobile segmented control is honest ARIA (`aria-pressed`, not fake tablist). No change.
- **EvidenceClaim.tsx** — **rework.** Promote from banner-link to a 3-study strip *or* demote to footer. Currently a speedbump (`EvidenceClaim.tsx:8-25`). See §5.
- **YourFirstWeek.tsx** — **keep.** This is the highest-conviction section on the page. Named protocols (Norwegian 4×4, Threshold row), named studies (Helgerud 2007, Wisløff 2007, Joyner & Coyle 2008), concrete prescriptions (`YourFirstWeek.tsx:17-40`). Rob Fitzpatrick would nod. Do not touch.
- **Programs.tsx** — **keep.** Snap carousel with peek (`Programs.tsx:83-95`) is right for mobile; dots correctly removed per M2. One nit: `Cites` row (`Programs.tsx:155-159`) is the biggest single trust win on the card — consider moving it above the "Preview →" affordance for scan order. Not urgent.
- **WontDo.tsx** — **rework.** Collapsed `<details>` hides the objection-handling that's doing the trust work. Open on desktop; consider inline 3-column strip on mobile.
- **OriginStory.tsx** — **keep.** Founder-named, single quote, no photo puffery. Nathan Barry pattern executed cleanly. Position could move up (see §5) but content is right.
- **BetaCTA.tsx** — **keep.** Gradient mirrors Hero, primary + soft-friction mailto. Change "Talk to the founder" → "Email Margus" per §3. Small.

---

## 8. Competitor scan

- **Runna** (runna.com) — **Steal:** category noun in H1 word 5 ("running app"). Terav should do the same — "training app" or "focused-improvement app" belongs in H1 or the beta badge. **Reject:** "The #1" superlative is unearnable and would kill the trust ladder Terav has built.
- **Whoop** (whoop.com) — **Steal:** the wrist mockup adjacent to the H1 at eye level — Terav does this with TodayMockupMobile but the Accept surface falls below the fold. Fix per §2. **Reject:** anonymous "Trusted by pros" logos strip. Kills specificity.
- **Cal.com** (cal.com) — **Steal:** the "no signup wall" claim is *in* the primary CTA context, not tacked on after. Terav's disclosure text (`Hero.tsx:94-97`) is good; consider making it a chip *inside* the primary CTA area (e.g., a tiny "Free · no card" tag). **Reject:** the multi-persona toggle above the fold — Terav's audience is singular (people who train and want to sharpen one thing), don't fake segmentation.
- **Ladder** (joinladder.com) — **Steal:** named-coach photo at eye level. Terav has no equivalent yet, but "Margus, founder" (`OriginStory.tsx:15`) could become a named face in a small avatar next to the H1 sub. Trust unlock. **Reject:** their subscription-first squeeze after 5 seconds — Terav's beta-free positioning is stronger.
- **Linear** (linear.app) — **Steal:** the crisp single-utterance H1. "Linear is a purpose-built tool for planning and building products." No metaphor. Terav's H1 buries the tool-identity behind "pick one thing… sharpen." **Reject:** Linear's aggressive keyboard-shortcut chrome — wrong audience.

---

## Backlog verification (V-items claimed DONE)

Cross-referenced against `dev/active/session-audit-2026-08-17/backlog.md`:

- **V2 (scope-row parity)** — DONE, verified. `en.ts:30` reads "A focus arc. Rest stays yours." (30 chars). No parity break in the 2-col mobile grid.
- **V4 (`text-balance` fight with `<br>`)** — DONE, verified. `Hero.tsx:59` has no `text-balance` on the H1 — only `leading-[1.08] tracking-tight`. The break lives at `Hero.tsx:62` (`<br className="hidden sm:inline" />`) and is now unopposed.
- **V6, V7, V8** — app-side, not landing. Out of scope.
- **B5 stat "92 primary studies"** — Landing shows `"92"` + `"cited studies"` in Hero (`en.ts:16-17`) and `"92 primary studies. Every session cites its research."` in EvidenceClaim (`en.ts:67`). Consistent. **But C5 in the backlog notes canonical library is 112 and evidence page shows 88.** The Hero+EvidenceClaim now say 92 — that means C5 was resolved by picking 92 and (per C5's note) presumably adding 3 new cites to `/evidence`. Verify `/evidence` displays 92 to keep the honesty chain intact. Not audited here — flag only.
- **B6 Programs page framing** — landing side confirmed: "Pick one program" eyebrow (`en.ts:52`), "Five programs live. Three more in build." title (`en.ts:53`). Consistent with "Pick my focus" primary CTA.
- **Google OAuth live** — DONE, verified. `next-app/src/app/(auth)/sign-up/page.tsx:132` renders `<GoogleAuthButton />` above the email divider; disclosure micro-copy at `:134-148`; email divider at `:150-156`. Signup-side friction genuinely dropped. Post-tap experience now matches the "Beta is free" promise on the landing.

Open landing-side items still real: **V1** (chisel detach on wrap), **V3** (H1_c weight competition — see below), **V9** (CTA convention collision — app-side), **A2** (contrast), **A8** (H1_c is a `<p>` not a heading sibling), **C3** (this audit is C3's follow-through), **C4** (sub-pages copy sweep — deferred), **C5** (evidence-page number verification — flagged above).

---

## 9. Priorities

**P0 (conversion-blocking, do this week):**
- **Category noun in the H1 or beta badge.** `landing/src/i18n/dictionaries/en.ts:6` currently reads `beta_badge: "Beta"`. Change to `"Focused-improvement training · Beta"` (or `"Training app · Beta"` if the "focused-improvement" language is too founder-jargon). Expected effect: cold visitors identify the product category in <3 seconds; direct fix for the Fried/Hoy rule this audit's §1 opens on.
- **Move the Accept-surface above the fold on 393px.** `landing/src/components/sections/Hero.tsx:94-104`. Collapse the friction disclosure ("Email + password. No card…") and the "See how it works" jumplink into a single 28px-tall line *below the CTA buttons*, and either fold H1_c into the sub or shrink H1_c to `text-xl`. Buys ~80–100px of vertical, brings the confirm-first differentiator to eye level. Expected lift: the mockup earns its screen space.
- **Primary CTA copy matches the action.** `landing/src/i18n/dictionaries/en.ts:11`. Change `cta_primary: "Pick my focus"` → `cta_primary: "Start free — pick my focus"`. Expected effect: reduces click-through disappointment (button promises pick; app delivers signup form).

**P1 (would raise signup 10%+, do this month):**
- **Promote EvidenceClaim from banner to a 3-study strip.** `landing/src/components/sections/EvidenceClaim.tsx:8-25`. Show 3 named study cites (`Helgerud 2007 · Schumann 2022 · Wulf 1998`) inline as chips before the "Read →" link. Expected effect: aggregate "92" was abstract; three names are receipts.
- **Open WontDo by default on desktop.** `landing/src/components/sections/WontDo.tsx:7`. Change `<details>` to `<details open>` on `sm:`+ (server-render two variants or use CSS `open` toggle). Objections in the open beat objections in a drawer. Expected effect: buyers with the "will it try to be my doctor" concern get answered without a click.
- **Split "Browse programs — no signup" into label + micro-copy.** `landing/src/i18n/dictionaries/en.ts:13`. Change to `browse_link: "Browse programs"` and add a `browse_sub: "No signup"` under it in `Hero.tsx:87-92`. Parallel structure with primary CTA's disclosure. Impact: scan clarity.
- **BetaCTA secondary → "Email Margus".** `landing/src/i18n/dictionaries/en.ts:93`. Change `cta_secondary: "Talk to the founder"` → `"Email Margus"`. Named human beats role.
- **Reorder middle sections.** `landing/src/app/page.tsx:22-29`. Move `<EvidenceClaim />` to sit after `<Programs />` (so: Hero → Contrast → YourFirstWeek → Programs → EvidenceClaim → WontDo → Origin → BetaCTA). Concrete-week proof runs directly off the contrast; evidence sits as trust footer to program cards.

**P2 (polish, nice-to-have):**
- **V1 chisel detaches on H1 wrap.** `landing/src/components/sections/Hero.tsx:63-68`. Constrain the wrapping span with `whitespace-nowrap` or reflow ChiselStroke inside the H1_b span layout box. Cosmetic on ≤375px.
- **V3 H1_c hierarchy weight.** `landing/src/components/sections/Hero.tsx:70-72`. `text-2xl` at 24px competes with the 18px sub. Shrink H1_c to `text-lg` (aligned with sub) or fold into the sub as a leading clause. This one call also buys ~20px above-the-fold, complementing the P0 fold fix.
- **A8 H1_c as `<p>` not heading child.** `landing/src/components/sections/Hero.tsx:70-72`. Fold the span structure so H1_c is a `<span className="block">` inside the `<h1>`. NVDA/JAWS read the hero as one utterance.
- **Program-card citations above "Preview →".** `landing/src/components/sections/Programs.tsx:155-164`. Trust anchor precedes call-to-scan. Small.
- **Founder avatar next to Hero sub or beta badge.** No file yet — add. Ladder-style trust unlock; safe to defer past first beta cohort.

Total P0 work: ~30 min copy + ~1h layout. P1 work: ~2–3h. P2: ~1–2h.

The landing is engaging and honest. The single largest lift available today is putting a category noun in front of the metaphor and getting the Accept surface above the fold. Everything else is polish on a page that's already carrying the argument.
