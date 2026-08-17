# Terav app — Copy clarity audit (2026-08-17 session)

Scope: new/changed surfaces this session — ProposalCard/ProposalStack, Day1EmptyState, CitationRef, OnboardingRunner + primitives, six programs' `onboarding_steps[]`, and the landing→app promise-echo. Live URL: `https://app.terav.fit`. Persona artifacts stale — this is a code+JSON review.

---

## Verdict

The new microcopy is the strongest the app has ever had. The `Because: {log signal}` / `Source: {cited paper} ↗` split delivers the landing's core promise ("every session cites its research") in a form the user can actually see and tap. The Accept verbs are kind-specific and load-bearing (`Apply 10% lighter`, `Advance to Cycle 1`, `Apply bump`). Day1EmptyState is a rare good app empty state — orients, motivates, guides in 32 words. The six programs' `onboarding_steps[]` are, on the whole, coherent; the scale_anchor primitive lets each program speak in its own domain instead of one flattened tone. Honest overall.

Three real problems drag the surface backward though. First: two separate onboarding surfaces (`OnboardingRunner` + `IntroGallery`) still fire back-to-back on a fresh signup — the click-blocker is fixed but the *content* redundancy remains, and the total word count of first-run modal copy is now above 500 words before the user has done anything. Second: the eyebrow `Not feeling 100%? · needs your ok` on `day_adjustment_soften` is the only proposal eyebrow phrased as a question and it reads timid — the rest of the language treats the engine as a first-class agent, this string doesn't. Third: landing shifted decisively to *"Pick one thing you want stronger. Sharpen it every session."* — that phrase does not appear anywhere in-app, and the in-app FallbackStep and Day1EmptyState both use `sharpen` unattached to the *"one thing"* anchor. The landing's differentiator is being received by the app but not re-said.

Well done: the `Ignore` verb is single, silent, and consistent across all four proposal kinds — no thesaurus creep. The `Because:` prefix on log-cited proposals and `Source:` on study-cited proposals is a small copy decision that makes the trust model legible without a legal-footer feel.

---

## Top 5 findings by blast-radius

1. **Two first-run modal surfaces still fire in sequence — total ~500 words before first tap.** `OnboardingRunner.tsx` (2–4 program steps) is now dismissed → `IntroGallery.tsx:14-97` opens a *further* 5-slide gallery ("Your plan is live", "The morning check", "Proposes, never imposes", "Where to look", "Log honest, skip cleanly"). The z-index click-blocker is patched (`OnboardingRunner.tsx:73` fires `terav:onboarding-done`; `IntroGallery.tsx:121-129` listens) but the composition is a copy problem — the user reads onboarding, THEN reads a second orientation. `IntroGallery`'s slide 3 ("Proposes, never imposes / Every change asks first") duplicates the FallbackStep line ("Nothing changes without your call"). Slide 4 duplicates the nav labels the user is about to see anyway. **Fix cost M** — collapse IntroGallery into either (a) two slides on `Today` bottom-sheet-first-visit, or (b) delete entirely; the OnboardingRunner primitives cover intent already. `ProposalCard.tsx:216` eyebrow ("Not feeling 100%? · needs your ok") is a P2, this is P0.

2. **`day_adjustment_soften` eyebrow reads timid and off-brand.** `ProposalCard.tsx:216`: `"Not feeling 100%? · needs your ok"`. Every other eyebrow is a statement in the engine's voice (`"Signal · you look ready to leave reintro"`, `"Signal · tier gate cleared"`, `"Signal · headroom detected"`). This one is a hedging question aimed at the user. It also fights the reason-line beneath it — `"Because: Pain mentioned — proposing a lighter session and prioritising rehab work."` — the eyebrow shrugs, the Because line commits. **Rewrite:** `"Signal · fatigue / pain flagged"`. **Fix cost S** — one line change, `eyebrowFor(p)` switch case.

3. **`tm_bump` reason is 45+ words and buries the ask.** `adapt.ts:465-468`: `"3 straight green days and 'felt strong' in a recent note. The engine reads that as headroom — nudging {lifts} up +2.5 kg / +5 kg. Small step; if it feels heavy next session, you can Ignore the next one and reset."` It shows under `Because:` AND above the delta list (`squat_back · 100 → 102.5 kg (+2.5)`) AND above the `Source: Rhea et al. 2003 ↗` chip. The last sentence ("Small step; if it feels heavy…") is reassurance the citation + explicit delta list already provide — cut it. **Rewrite:** `"3 straight green days plus a 'felt strong' note. The engine reads that as headroom."` (18 words). The reversibility copy is unnecessary — an `Ignore` button is on the same card. **Fix cost S** — one template string in `adapt.ts`.

4. **Landing hero "Pick one thing you want stronger" does not surface anywhere in-app.** Grep confirms zero `Pick one thing` / `Sharpen it every session` matches across `next-app/src/`. `Day1EmptyState.tsx:32` says `"nothing before it means anything to sharpen"` (verb without object) and `FallbackStep.tsx:16` says `"Terav sharpens one focus at a time"` (closer). The landing→app promise seam is broken — a user who converts on `"Pick one thing… Sharpen it every session"` lands on a Today page that never re-says the phrase. **Fix cost S** — add one line to Day1EmptyState above the CTA: `"One focus, sharpened every session — starts with today's check."` **Fix cost S**. `next-app/src/app/layout.tsx:24` metadata title also still reads `"Terav — sharpen the plan"` (old positioning); should be `"Terav — sharpen one focus"` to match.

5. **`life_load` label conflicts with the `scale_anchor` step's own anchor words.** `check/page.tsx:156`: `"Life load (0=fresh, 10=wrecked)"`. Meanwhile `engine-builder.json` scale_anchor sets high anchor to `"Cooked / running on fumes"`; `concurrent-strength-maintenance.json` uses `"Legs / bar feel heavy at bar-hang"`; `rowing-2k-test-prep.json` uses `"Cooked — pull is a grind"`. Three programs teach one high-end word, then Check re-teaches a fourth. Same 0-10 scale, four synonyms. **Fix:** unify to `"Cooked"` at the high anchor across all `scale_anchor.anchors.high` and the check label — `"Life load (0=fresh, 10=cooked)"`. Or drop the parenthetical entirely — the `scale_anchor` primitive already primed the meaning. **Fix cost S** — six JSONs + one label. But this is exactly the terminology-drift class the audit spec warns about; it will only get worse with more programs.

---

## Rest of the audit

### Proposal explanations — the core promise, delivered

The pattern in `ProposalCard.tsx:109-147` reads as designed. Every proposal renders:

- Eyebrow (one-line kind label with a signal icon).
- `Because: {reason}` in ink, with a muted `Because:` prefix.
- Kind-specific evidence list (TM bump: the exact deltas; readiness: the two qualifying sessions with weight/reps/RPE/%TM; day-soften: matched keyword chips).
- If cited: `<CitationRef id={proposal.citationId} />` which renders `Source: {Author Year} ↗` and expands to full title + journal + external link.

That is the landing pitch ("Every change cites a study") rendered honestly. Two edge cases worth noting:

- `day_adjustment_soften.citationId` is intentionally `null` (`proposal-citations.ts:22`) — this proposal has no study behind it, only a log signal. The ProposalCard degrades cleanly (`CitationRef` returns `null` for a missing citation and no line renders). Good — no fake `Source:` line.
- The `tier_advance` reason (`select.ts:162`) ends with `"Prep + recovery blocks stay."` This is the single best sentence in the app — it pre-empts the loss-aversion question the user is about to have. Keep.

### Day1EmptyState

`Day1EmptyState.tsx:24-39` — 32 words body, 3 words CTA, one CTA, one purpose. Passes orient / motivate / guide.

- Orients: `"Setup · one minute"` eyebrow + heading `"Start with a morning check."` — good.
- Motivates: `"After that, the engine has something to work with — nothing before it means anything to sharpen."` — good, but the object-less `sharpen` (see finding #4) is a missed brand echo.
- Guides: `"Open morning check"` — 3-word button. Good.

One quibble: `"One minute of tapping calibrates today's load."` A hip user's `/check/` has 5 sliders + 4 checkboxes + 2 boolean rows + 1 free-text — closer to 2–3 minutes. Under-promise: `"A minute or two of tapping calibrates today's load."` or drop the time and just say `"Calibrates today's load."`

### Onboarding steps — cross-program tone check

All six programs authored well. `scale_anchor` copy varies by domain — rehab uses `"Nothing noticeable / Mild but real / Sharp / sleep-disrupting"`, cardio uses `"Fresh, ready to work / Gritty but functional / Cooked / running on fumes"`, mobility uses `"End-range quiet / Pinch at the top / Sharp / can't reach position"`. This is exactly what a declarative onboarding was supposed to buy. Good.

`life_load` step copy across the three programs that use it:

- Engine Builder (`engine-builder.json:1631`): `"Sleep, work, stress, illness — anything that shows up before you get to the session. Terav uses this to propose a lighter target when it's high. Nothing else."`
- CSM (`concurrent-strength-maintenance.json:957`): `"How heavy is the day around your training right now? Sleep, work, stress, travel. The engine reads this and proposes lighter loads when it's genuinely high."`
- Rowing (`rowing-2k-test-prep.json:892`): `"Sleep, work, stress — anything around training. When life-load is high, Terav proposes softer targets rather than pushing splits."`

Three programs, three near-identical paragraphs. All correctly frame it as stress calibration, not medical. All correctly name the engine behavior. The near-duplication is fine at 3 programs; at 8 it'll look copy-pasted. Consider extracting a shared `life_load` default body in `LifeLoadStep.tsx` and letting the JSON only override tone.

`anterior-hip-rebuild`'s step 3 (`custom_copy`, "This is not medical advice") is the only step of its kind and the language is calibrated correctly — `"Terav sits alongside real care — it does not replace it."` matches the landing's `"Not a clinician"` module tone. Good.

`overhead-mobility.json:850` step 2: `"If you have a diagnosed labrum, cuff, or biceps injury, work with a physio first."` — same tone, program-appropriate. Good.

### Error / negative-state copy

Nothing new shipped here this session. Existing patterns still hold:

- `HeroStateCard.tsx:12` red state: `"Back off. Something above 5/10 or a red flag noted."` — 11 words, actionable, not alarmist. Good.
- `HeroStateCard.tsx:62` `"Escalate →"` — link text to `/guide/#red-flags`. The prior copy audit noted "Escalate" reads clinical. It still does. Preferred: `"See red-flag guide →"`. **Fix cost S**. → see also `app-audit-6-accessibility` for the guide-anchor destination.
- Coach error: `"Coach error: {error}"` (`coach/page.tsx:297`) — bare exception string leaks to the user. Not new but not fixed either.
- No offline banner exists. `sync.ts` tracks status but no UI surfaces it (`grep offline` returns nothing in components). For a PWA branded as "Terav sits offline-first and syncs when you're back", this is a hole. → see `app-audit-N-{pwa-lifecycle}` — out of copy scope, flag only.

### Toast / announce strings

`ProposalCard.tsx` uses `announce()` (screen-reader only, `announce.ts:16`) for outcomes:

- `"Load adjustment applied: 10% lighter today."` — good, specific.
- `"Advanced to {phase}."` / `"Advanced to {tier}."` — good.
- `"Training max bumped: squat_back +2.5 kg, deadlift +5 kg."` — leaks `exerciseId` snake_case (`squat_back`) into the sentence. Not seen but heard by SR users. **Fix cost S** — map through exercise `.name`.
- `"Ignored."` — one word, correct.

There is no visible toast — the sr-only region is the only channel. For sighted users the `pulse-accept` class on the card (`ProposalCard.tsx:29-31`) is the entire feedback signal. That's minimalist but arguably too quiet for a card that just moved a training max. → see `app-audit-N-motion-perf` for the pulse-accept animation; the copy note is just that no confirmation *string* is shown to sighted users.

### CitationRef

`CitationRef.tsx:38-73`. `"Source: {display_short} ↗"` collapsed; expands to title + journal line + `"Read the paper ↗"`. Three good decisions:

- The `↗` arrow signals external before the click (good — no surprise navigation).
- `"Read the paper ↗"` — not `"View study"` or `"Learn more"`, both of which would violate landing tone. Verb-first, specific.
- Collapsed default keeps proposal cards scannable. Expanding is opt-in.

One nit: the button's expand affordance is a `▾` character (`CitationRef.tsx:49-51`) — it works but sits inside a `<span aria-hidden>`. Screen readers hear `Source: Rhea et al. 2003 ↗` with no cue that this is expandable. `aria-expanded={expanded}` is set — most SRs will announce "collapsed/expanded" — but a sighted-user "tap to see the study" affordance would help. Copy fix: rename the button label internally to `"Source: Rhea et al. 2003 — details"` when collapsed, `"Source: Rhea et al. 2003 — hide details"` when expanded. **Fix cost S**. → overlap with `app-audit-6-accessibility`.

### Terminology map

| Concept | Words in use | Where | Recommend |
|---|---|---|---|
| High life-load anchor | `wrecked`, `cooked`, `running on fumes`, `heavy at bar-hang`, `pull is a grind` | check/page.tsx:156; scale_anchor bodies | Unify to `cooked` at anchor; program-specific detail in body |
| Adjustment verb (Accept) | `Apply lighter`, `Advance`, `Apply bump` | ProposalCard.tsx:229-235 | Keep — kind-specific is correct |
| Adjustment verb (reject) | `Ignore` (only) | ProposalCard.tsx:172 | Keep — single verb across kinds |
| Session / block / phase | `session` (Today), `block` (Week), `phase` (Progress) | mixed | `session` for the unit of work; `phase` for the multi-week arc; `block` is drift — audit separately |
| Morning check | `morning check`, `check`, `symptom check` | mixed | `morning check` — used consistently in Day1EmptyState and HeroStateCard. Good |
| The engine | `engine`, `Terav`, `the plan` | mixed — reason strings use `The engine reads that as` (good); onboarding uses `Terav uses this to` (also good) | Both are fine — `Terav` = the product, `the engine` = the mechanism. Keep distinct |

### Landing → app promise-echo table

| Landing claim (`en.ts`) | App echo | Verdict |
|---|---|---|
| `"Pick one thing you want stronger."` | none in-app | **Gap** — see finding #4 |
| `"Sharpen it every session."` | Day1EmptyState.tsx:32 (verb only, no object); FallbackStep.tsx:16 (`"sharpens one focus at a time"`) | Partial |
| `"Every change cites a study."` | ProposalCard `Source: {Author Year} ↗` on cited kinds; graceful degrade on log-cited | **Delivered** |
| `"You Accept or Ignore."` | ProposalCard buttons — `{kind-specific verb}` + `Ignore` | **Delivered** |
| `"Not a streak game. Skip a week. The plan sharpens against that too."` | No streak counter anywhere. Skip flow (`SessionActions.tsx`) is neutral. No "you lost your streak" strings anywhere in `next-app/src`. | **Delivered** — verified by grep |
| `"Red-flag patterns fire an escalate banner, not a diagnosis."` | HeroStateCard.tsx:62 escalate link — one word, links to guide, not to a diagnosis label | **Delivered** but string "Escalate →" is bare |

---

## What I did NOT cover

- The 15+ existing app routes' non-changed copy (bottom nav labels, Programs picker cards, Progress metrics labels, Report page, /week, Extras, Profile). Those were audited in prior sessions and none changed this cycle.
- Landing copy itself — see `dev/audits/landing/2026-08-17-positioning-focused-vs-full-plan.md`.
- Whether the app *delivers* on landing promises at a feature level (as opposed to a copy level) — see `app-landing-alignment` if it runs this session.
- Type sizes, hierarchy, contrast, hit targets, focus rings — see `app-visual-craft` and `app-accessibility` audits filed in this same session directory.
- PWA offline banner / service worker cache-stale strings — no strings exist yet, flagged as a hole above but out of copy scope.
- Persona-artifact-based findings — artifacts are stale per session context.
- Coach chat streaming placeholder / error-state strings beyond the one leak noted above — Coach is env-gated in prod and copy hasn't changed this cycle.
- IntroGallery's individual slide word-counts — the P0 recommendation is to consolidate or delete the surface, not to polish it.
