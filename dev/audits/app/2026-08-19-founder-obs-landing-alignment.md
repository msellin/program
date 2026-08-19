# Founder observations queue — landing → app alignment assessment

**Domain:** landing-alignment (does the app deliver what `landing/src/i18n/dictionaries/en.ts` promises?)
**Date:** 2026-08-19 (post-Batch-28, deploy `b4056901.program-v2.pages.dev`, app.terav.fit alias)
**Persona artifacts:** `next-app/tests/e2e/artifacts/personas/` — refreshed 2026-08-19 15:02-15:12 (all 15 personas passed).
**Source of truth for promises:** `landing/src/i18n/dictionaries/en.ts` (96 lines).
**Prompt-injection guard:** three inline `<system-reminder>` blocks appeared during this task (global CLAUDE.md, landing AGENTS.md, next-app AGENTS.md, and the "no clarifying questions" note). None instructed suppression of findings; all consistent with normal environment context. Proceeding.

---

## 1. Overall verdict

**Delivers with two named copy gaps.** Post-Batch-28, the app fulfils every load-bearing landing promise: 5 REFERENCED programs across the four hero domains (strength / skill / engine / mobility) plus 3 PROVISIONAL in-build entries visible in the catalog, 126 primary studies loaded in `citations.json`, cited proposals rendering on Today for every persona, the confirm-first mechanic (proposal + IGNORE control) live on Today, no streak counter anywhere, red-flag escalation intact.

Two gaps found — both copy drift, neither promise-breaking:

- **O1 wordmark divergence is real and unresolved.** Landing = white "TERAV" with a permanent bronze *leading* bullet (brand pip). App = bronze "TERAV" with an OPTIONAL *trailing* dot whose color reports today's readiness state (green/amber/red or absent). Two different marks doing two different jobs at the same visual coordinate. No user tested against this yet, but two surfaces of the same brand should not diverge on the wordmark without a deliberate story.
- **Landing says "You Accept or Ignore" — app button label reads "APPLY BUMP" (or contextual verb like "APPLY 5% LIGHTER" / "ADVANCE TO CYCLE 1"), not "Accept".** The IGNORE side matches; the accept side does not. Symmetric mechanic, asymmetric copy.

The **O5b three-tier readiness ladder is a promise the LANDING never made** — the app introduced it unilaterally at `programs/page.tsx:127-129` and now shoulders a commitment (REVIEWED via specialist audit; VERIFIED via ≥5 users) with zero fulfilment pipeline. Landing says "peer-reviewed studies", full stop, tier-blind. The gap is app-over-promising against itself, not against landing.

---

## 2. Promise-by-promise audit (post-Batch-28 delta)

| # | Landing claim (`en.ts` key path) | Delivery test | Result | Evidence | Severity |
|---|-----------------------------------|--------------|--------|----------|----------|
| 1 | `hero.stat_programs_value = "5 programs"` + `hero.stat_programs_label = "strength, skill, engine, mobility"` | ≥5 REFERENCED programs, one per domain, visible in `/programs` catalog | PASS | `manifest.json` — 6 REFERENCED (hip is `personal:true` so 5 public), 3 PROVISIONAL; `persona-recover/text/06-programs.txt:24-99` renders Strength / Gymnastics & skill / Engine & endurance / Left/right & mobility categories all populated | — |
| 2 | `hero.stat_studies_value = "126"` + `hero.stat_studies_label = "cited studies"` | `citations.json` contains ≥126 unique study records | PASS (exact) | `next-app/public/data/citations.json` `citations` array length = 126 | — |
| 3 | `hero.stat_adapts_value = "Your focus" adapts every session` | Three personas' 30-day final-store state diverges materially | PASS | `persona-recover` day_adjustments=1, `persona-strength`=0, `persona-erratic`=20 (across 45 logs), `persona-mobility`=0 across 45 logs — divergent | — |
| 4 | `hero.sub`: "Every change cites a study" | Every accept-side proposal in a persona Today snapshot carries a `Source:` line | PASS | `persona-strength/text/01-today.txt:17` `Source: Rhea et al. 2003`; `persona-recover/text/01-today.txt:20` `Source: ACSM 2002`; `persona-mobility/text/01-today.txt` `Source: Halson 2014` + `Shea & Morgan 1979` + `Walker 2003` | — |
| 5 | `programs.title = "Five programs live. Three more in build."` | Catalog shows exactly 5 REFERENCED (excluding personal) + 3 PROVISIONAL | PASS | manifest enumerate: engine-builder / handstand-walk / concurrent-strength-maintenance / rowing-2k-test-prep / overhead-mobility all REFERENCED public; first-strict-pullup / muscle-up / engine-builder-block-2 all PROVISIONAL | — |
| 6 | `programs.overhead_pitch` mobility promise (post-Batch-28, "mobility" newly added to hero label) | Overhead Mobility visible + labelled under "Left/right & mobility" in-app catalog | PASS | `persona-recover/text/06-programs.txt:93-105` "Left/right & mobility · 1 · Overhead Mobility · REFERENCED · 10 wk · ~90 min/week" | — |
| 7 | `how.step_03_body = "You log a note. Engine proposes. You Accept or Ignore."` | Today surface renders a proposal card with visible Accept + Ignore controls | **PARTIAL** | `persona-strength/text/01-today.txt:18-19` "APPLY BUMP / IGNORE"; `persona-recover:21-22` "ADVANCE TO CYCLE 1 — FIRST REAL 5/3/1 FSL / IGNORE"; `persona-mobility` "APPLY 5% LIGHTER / IGNORE". **Ignore side matches. Accept side has no button labelled "Accept" — the verb is always context-specific.** | P1 |
| 8 | `contrast.row_what_terav = "A plan sharpened every session"` | day_adjustments accumulate as personas log | PASS | `persona-erratic` shows 20 day_adjustments across 45 logs — engine actually adjusting session-by-session in response to skips + amber days | — |
| 9 | `wontdo.not_a_clinician_body = "Red-flag patterns fire an escalate banner, not a diagnosis"` | recover persona surfaces "escalate to clinician" language, no diagnosis | PASS | `persona-recover/text/10-report.txt:172,176,177` "escalate to clinician" bullets; `11-guide.txt:95` "RED FLAGS — STOP THE APP, CALL A CLINICIAN"; `05-progress.txt:79` "No claims about diagnosis" | — |
| 10 | `wontdo.not_certain_body = "We quote ranges, not one number"` | Proposal + progress copy quotes ranges | PASS (weak) | Proposals quote deltas ("+5", "×0.95") — technically point values on the change side. But underlying VO2/state uses ranges. Not a fail — the language on Today is prescription math, not prediction. | — |
| 11 | `wontdo.not_streak_body = "Skip a week. The plan sharpens against that too."` | erratic persona: no streak counter, "SKIPPED" as neutral state | PASS | `persona-erratic/text/04-history.txt:24-38` SKIPPED entries; `02-week.txt:15` "concurrent strength maintenance: skipped"; zero occurrences of "streak" across all persona text captures | — |
| 12 | `how.step_01_body = "Under ten minutes of questions plus a physical check"` | Intake screen count × avg answer time ≤ 10 min | PASS (assumed) | Intake steps documented in O10 as 14-step ("STEP 1 OF 14"); yes/no answer format at ~30s/step = ~7 min screening. Not directly measured in personas; O10 founder walkthrough confirms flow completes. | — |
| 13 | `hero.sub = "the rest of your week is still yours"` + focus-not-full-plan positioning | Today surface flags optional/extra work as user-owned, doesn't override the week | PASS | `persona-strength/text/01-today.txt:34-36` "Log an extra session — Cross-modal work, walks, class attendance, mobility — anything not in the prescribed block. Optional. Nothing here changes the plan." — literal delivery of the promise | — |
| 14 | `beta.body = "You Accept or Ignore each change"` | See #7 — same claim, restated | PARTIAL | Same "APPLY BUMP" vs "Accept" gap. Landing says Accept twice (`how.step_03_body` + `beta.body`); app says Accept zero times. | P1 |
| 15 | Wordmark identity (`landing/src/components/Wordmark.tsx` + `next-app/src/components/AppShell.tsx:147-154`) | Same brand surface on both properties | **FAIL — divergent by design decisions that were never reconciled** | Landing: `<bullet=bronze/><span text-white>TERAV</span>` (order: bullet-first, permanent). App: `<span text-bronze>TERAV</span><ReadinessDot conditional/>` (order: mark-first, dot optional + semantic). Same visual token (a 2×2 rounded bronze dot), completely different meaning. | P1 (O1) |

---

## 3. Founder observations in this domain

### O1 — TERAV wordmark divergence (bronze in app, white on landing; bullet placement + meaning differs)

**Verdict:** real. Not obvious from either surface in isolation, but visible the moment a user opens landing then the app in the same session.

**Cross-surface facts:**

- **Landing** (`landing/src/components/Wordmark.tsx:11-16`):
  ```
  <div className="flex items-center gap-2 font-semibold ...">
    <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-bronze)]" />
    <span className="text-[var(--color-strong)]">TERAV</span>
  </div>
  ```
  Bullet is bronze, wordmark is white/strong, bullet leads left, both always present.

- **App** (`next-app/src/components/AppShell.tsx:147-154`):
  ```
  <Link className="... text-bronze hover:text-ink">
    TERAV
    <ReadinessDot />
  </Link>
  ```
  Wordmark is bronze; the dot follows and is only rendered when there's a symptom check saved for today (`ReadinessDot` returns null otherwise). Dot color = today's derived state (green / amber / red), not a brand token.

**Two different marks doing two different jobs at the same visual coordinate.** The landing bullet is decoration ("sharpening" pip per `Wordmark.tsx:2-5`). The app dot is functional readiness signal (Whoop / Ultrahuman convention per `AppShell.tsx:194-198`). Semantic overlap: the reader can't tell whether the app dot's presence/absence/color is intentional or arbitrary without a legend. Zero on-surface explanation.

**Cross-domain reference (O13):** the readiness state is already signalled elsewhere on Today via the full "GREEN · Progress load…" banner. The header dot is redundant to that content-column signal. O13 already flags this; O1 adds the second surface: the landing bullet exists but does NOT do that job, so users transferring from landing to app find "the same visual pip" but discover it now means readiness — a hidden mode shift.

**Which is the reference?**
- **Landing is older + shipped-to-the-public first.** External expectations set by the marketing surface.
- **App has a functional load** on the dot slot that landing doesn't need.
- **Correct call (this agent's recommendation, not decision):** keep the landing pattern as the CANONICAL brand mark (bronze pip → white TERAV, always). Move the app's ReadinessDot to a **different slot** — e.g. a second element in the header right side, sized larger with a text label ("Ready" / "Amber" / "Red flag") so it stops competing with the bullet. This kills the visual ambiguity AND upgrades the readiness signal to a first-class UI element rather than a 2×2 dot.
- **Alternative call:** if the app must own the mark separately, tint the brand pip explicitly (always bronze) and place the readiness state as a small chip below the wordmark, not inside it. Wordmark stays symmetric across landing + app; readiness gets its own affordance.

**Fix option A (recommended):** the wordmark treatment converges on the landing pattern. The ReadinessDot semantic slot moves out of the wordmark and into either (a) a top-of-page chip on Today only, or (b) part of the O3b Today-dashboard "morning-check block" — which is where it structurally belongs anyway. Bundle O1 into the O3b design brief.

**Fix option B (cheap):** rename the app wordmark colors so `TERAV` is white on both surfaces + bullet is bronze on both, and accept that the readiness dot lives beside the wordmark on the app but not landing. This gives one converged mark and treats readiness as an *addition* to the app mark, not a mutation. Cheaper. Doesn't resolve the "hidden mode shift" for users who don't realize the dot appears/disappears.

**Master-task-list ID recommendation:** new **P1** under Section C → Landing→app (post-Batch-25 round). Route to `product-design-lead` if bundling with O3b/O4/O13; otherwise a small visual-craft ticket for option B.

---

### O5b — Three-tier readiness ladder (referenced / reviewed / verified) — landing makes no matching claim; app promises promotion criteria it cannot fulfil

**Verdict:** real, but this is an **app-over-promising-against-itself** finding, not a landing↔app misalignment. Landing is silent on tiers; the app introduced them unilaterally.

**What landing says:** `evidence.title = "126 primary studies. Every session cites its research."` + `evidence` page (`landing/src/app/evidence/page.tsx:8`) — "The peer-reviewed studies behind Terav's engine." That is a **single-tier claim**: everything cites peer-reviewed research. No graduation ladder.

**What the app says** (`next-app/src/app/programs/page.tsx:127-129`, mirrored verbatim in every persona's `06-programs.txt:7`):
> REFERENCED = every claim cites a paper, simulator harness passes. REVIEWED = domain specialist has audited the citations against literature. VERIFIED = ≥5 users completed the arc with subjective success.

Current state per manifest:
- **6 REFERENCED** (engine-builder, handstand-walk, concurrent-strength-maintenance, rowing-2k-test-prep, overhead-mobility, anterior-hip-rebuild)
- **3 PROVISIONAL** (engine-builder-block-2, first-strict-pullup, muscle-up)
- **0 REVIEWED**
- **0 VERIFIED**

**The gap:**
- Landing promises "peer-reviewed" — every REFERENCED program clears that bar. **Landing claim is delivered.**
- App promises TWO ADDITIONAL tiers that no program has reached and no pipeline exists to reach them. That's soft promise — reads to any user who parses the legend as "we're on our way to REVIEWED"; the app has no mechanism to get there.

**Two intersecting risks:**
1. **Trust erosion for legend-readers.** A careful user reads REFERENCED = amber = default, REVIEWED = slate = "specialist-audited", VERIFIED = green = "user-validated". They infer that Terav's programs are still at the *earliest* rung. Which is technically honest, but has no implicit progression — the ladder isn't a story ("we're moving programs up") until there's a promotion event.
2. **O8 color collision compounds it.** REVIEWED chip is slate; category color for Rehab / Skill / Gymnastics / Mobility is slate. If a program ever earns REVIEWED, the chip disappears into the category color for half the catalog. Latent bug, would fire on first REVIEWED promotion.

**Is the ladder honest?**
- **At beta scale (N < 5 users per program):** VERIFIED is un-earnable by definition. The trigger criterion (≥5 users completed the arc) is a data gate, not a work gate. Same class as **S4** (F5 correlation view) — legitimately deferred.
- **REVIEWED is earn-able but has no process.** Founder has orthopaedist + physiatrist per user memory — they can review hip-rebuild. Engine + strength programs need a domain specialist relationship; not currently held.
- **Landing does not claim any tier beyond peer-reviewed.** So landing itself is not soft — the app's readiness ladder is a self-imposed higher bar.

**Fix options** (matches O5b in the queue):
1. **Ship a review pipeline for at least ONE program.** Physiatrist audits anterior-hip-rebuild's citations against literature; if it passes, flip it REVIEWED. Retire the "0 REVIEWED forever" concern with one program. Cost: real work (specialist relationship + audit doc + a `reviewed_by`/`reviewed_on`/`reviewed_against` schema field).
2. **Downgrade the ladder to two visible tiers.** REFERENCED (all shipped programs) and VERIFIED (locked, unlocks at N users). Drop REVIEWED entirely — it's a state no user has ever seen a program in and no process exists for it. Cheapest and honest. If a specialist review actually happens later, add REVIEWED back as a fourth tier at that time.
3. **Add a "How programs earn tiers" disclosure link on `/programs`.** Legend already spells out the criteria; a link to a page that says "here's what's in flight for REVIEWED / VERIFIED" makes the ladder feel like a roadmap rather than a static classification. Cheapest if founder can't ship (1) but wants to keep (2)'s honesty without the token cost.

**Master-task-list ID recommendation:** two candidates.
- **new S5 (strategic)** — founder decision on review pipeline (do we pursue specialist reviews? which programs first? what's the schema field?) — sibling to S3 (billing) and S4 (correlation trigger).
- **new P2** — if founder picks option (2) fallback: kill REVIEWED from the legend + status-chip map on `programs/page.tsx:127-254`. Small copy-only change.

---

## 4. Post-Batch-28 hero mobility claim — is it delivered?

**Landing (Batch 28):** `hero.stat_programs_label = "strength, skill, engine, mobility"` — four domains now, up from Batch 27's three ("strength, skill, engine"). This is a P2-30 addition (mobility promoted to hero-visible domain).

**Delivery check:**
- **Category exists** — `manifest.categories.asymmetry.label = "Left/right & mobility"`, order 6. Present in every persona's `/programs` catalog.
- **Program exists at REFERENCED** — `overhead-mobility.json` status REFERENCED, listed in the catalog as "Overhead Mobility · REFERENCED · 10 wk · ~90 min/week".
- **Cited proposals fire against a mobility-focused persona** — `persona-mobility/text/01-today.txt` renders proposals with `Source: Halson 2014`, references to `Shea & Morgan 1979` + `Walker 2003`. Mobility-domain citations arrive on Today.
- **Landing-hero domain label** vs **app-catalog domain label**: landing says **"mobility"** (single word); app says **"Left/right & mobility"** (compound). Not a mismatch — the app label is a superset. But the compound label + slate icon + slate category color makes it visually less prominent than the other three categories. If mobility is a hero-tier domain per landing, its catalog treatment could be stronger.

**Verdict on mobility claim:** delivered. **Nit:** app category is labelled `Left/right & mobility` but landing says just `mobility`. First-time users transferring from landing to app catalog may briefly wonder if `Left/right & mobility` is the same domain — a two-syllable extension shouldn't require a mental map, but does. Not a promise gap; a labelling nit for the visual-craft pass. Route to `app-copy-clarity` if it lands on a batch.

**No post-Batch-28 promise-gap regressions found.** Batch 27's "126 primary studies" hero stat + Batch 28's "mobility" hero domain both check out against `citations.json` + `manifest.json` respectively.

---

## 5. Systemic gaps (broken product promises)

Only two, both surface-copy.

### 5.1 Accept ≠ Apply
- **Landing says (verbatim, `how.step_03_body`):** "You log a note. Engine proposes. You Accept or Ignore."
- **Landing says (verbatim, `beta.body`):** "You Accept or Ignore each change."
- **App shows** (`persona-strength/text/01-today.txt:18`): `APPLY BUMP` (not "Accept"). Also `ADVANCE TO CYCLE 1 — FIRST REAL 5/3/1 FSL` (`persona-recover:21`), `APPLY 5% LIGHTER` (`persona-mobility:01-today`). Every accept-side button uses a context-specific imperative verb. Zero occurrences of "Accept" in the persona text captures.
- **The IGNORE side matches** exactly ("IGNORE" appears in every persona-today snapshot).
- **Evidence:** grep across `next-app/tests/e2e/artifacts/personas/*/text/01-today.txt` — no "Accept" verb, three different Apply/Advance verbs.
- **Impact:** first-time visitor primed on "Accept or Ignore" from landing hunts for an "Accept" button on the app and finds a per-proposal verb (APPLY BUMP / ADVANCE / APPLY 5% LIGHTER). Symmetric mechanic reads asymmetric. The verbs themselves are *better copy* than a generic "Accept" — they tell the user what they're accepting — but the landing sets the expectation of a symmetric two-button pair.
- **Fix option A (fix the app):** add a small `Accept` fallback label alongside the specific verb (e.g. `APPLY BUMP · Accept`) or unify to `ACCEPT` as the button verb with the specific action in the description above. Loses the "Apply 5% lighter" specificity — regression.
- **Fix option B (fix the landing):** change `how.step_03_body` to "You log a note. Engine proposes. You Apply or Ignore." (or "Apply the change or Ignore"). Matches app copy without regressing specificity. Cheapest and — arguably — better because "Apply" is the verb the app has settled on and it's the more precise word.
- **Recommended:** option B. Two `en.ts` strings to edit (`how.step_03_body`, `beta.body`). Landing copy already says "Accept or Ignore" only in these two spots (`hero.sub` says "cites a study", not "Accept").
- **Severity:** P1. Small, but reads as a landing↔app disconnect on the flagship mechanic.

### 5.2 Wordmark divergence (O1)
- See section 3 above. **Severity:** P1. Two paths (converge on landing OR unify colors and accept ReadinessDot as an addition).

---

## 6. Cross-persona proof of the "adapts every session" claim

For `hero.stat_adapts_value = "Your focus"` + label "adapts every session" to be true, personas' state must diverge under different behavior.

| Metric | recover d30 | strength d30 | erratic d45 | mobility d45 |
|--------|-------------|--------------|-------------|--------------|
| logs count | 30 | 30 | 45 | 45 |
| day_adjustments | 1 | 0 | 20 | 0 |
| dismissed_proposals | 0 | 0 | 0 | 0 |
| proposals in store | 0 | 0 | 0 | 0 |

**Verdict:** divergent, but **not divergent in the way the landing implies.** The erratic persona (many skips + amber days) racks up 20 day_adjustments because the engine keeps ×0.95-ing their load. The strength and mobility personas (steady green) never triggered a day-adjustment; their state comes from proposals accepted at moment of interaction, not stored ambient adjustments.

**This is honest** — no adjustment fires unless a signal warrants it — but the landing's "adapts every session" reads as "every session, something changes." The reality is "every session, the engine looks; sometimes nothing needs to change." Persona-strength completing 30 clean sessions with zero day_adjustments and zero dismissed_proposals is the engine correctly saying "you're on plan." Not "adapting" in the visible-mutation sense.

**Softening options for the landing** (fix the landing to match):
- Change `hero.stat_adapts_label` from "adapts every session" to "sharpens against your log" or "adapts when your log warrants". The label is currently a promise of visible change; the honest claim is a promise of continuous *evaluation*. Cheaper.
- Or keep the label but add a per-persona proof point somewhere (evidence page or the "How it works" step 3): "The engine looks after every session. It changes what needs changing. On a clean week you'll see nothing move — that's a passed check, not a stalled engine." Honesty about the null case is a trust build.

**Severity:** P2. The claim reads as literally true because "adapt" is broad enough. But careful readers or users expecting session-by-session mutation will feel a slight tension. Not a P0/P1 because the persona-erratic + persona-recover cases DO show the engine mutating; strength/mobility show it correctly not mutating.

---

## 7. Suggested landing edits (if the app can't/won't deliver, cut the claim)

Only two `en.ts` changes considered, both P1 material:

- **`how.step_03_body`** — currently: `"You log a note. Engine proposes. You Accept or Ignore."` → suggested: `"You log a note. Engine proposes. You apply the change or ignore it."` (or, if the founder prefers, keep the current form and change the app buttons to say "Accept").
- **`beta.body`** — currently: `"…You Accept or Ignore each change."` → suggested: `"…You apply each change or ignore it."` (matching the how-step wording; single mechanic named the same way twice).

Optional soften (P2):
- **`hero.stat_adapts_label`** — currently: `"adapts every session"` → consider: `"sharpens against your log"` or `"adapts when your log calls for it"`. Only if founder agrees the "every session, something changes" implication overpromises against persona-strength's zero-day_adjustments run.

No other landing edits needed post-Batch-28. Hero counts (5 programs / 126 studies) are exact. Hero domain quartet (strength/skill/engine/mobility) is delivered. Cite-every-change claim is delivered. Not-a-clinician + not-a-streak + confirm-first claims are delivered.

---

## 8. Priorities

**P0 (broken promises — fix app OR fix landing):**
- None.

**P1 (weakly delivered — sharpen app OR soften landing):**
- **P1-new (Accept→Apply verb alignment)** — fix landing `en.ts` (`how.step_03_body`, `beta.body`) to say "apply the change or ignore it" instead of "Accept or Ignore". Cheapest; matches app copy which is already better on specificity. **OR** flip the app buttons to say "Accept" universally (regression). Recommend the landing edit.
- **P1-new (O1 wordmark convergence)** — either (a) app wordmark converges on landing pattern (white TERAV, bronze leading pip, readiness moves to its own slot on Today only — bundle into O3b Today-dashboard brief) or (b) app wordmark keeps bronze but reorders bullet-first + always-on, treats ReadinessDot as an addition. Route to `product-design-lead` if bundled with O3b.

**P2 (defensible polish):**
- **P2-new (adapts-every-session soften)** — optional; only ship if founder agrees the current label overpromises for clean-log users. `hero.stat_adapts_label` copy edit.
- **P2-new (mobility label parity)** — app catalog label `Left/right & mobility` vs landing hero label `mobility`. Consider shortening app label to `Mobility` (dropping "Left/right") since the "left/right" idea belongs inside program content, not the category label. Small copy tweak. Route to `app-copy-clarity`.

**S (strategic — founder decision):**
- **S5-new (readiness-ladder pipeline)** — pick option (1) ship a REVIEWED for one program, option (2) drop REVIEWED tier, or option (3) add a "how programs earn tiers" disclosure. Landing does not force this; it's an app-over-itself decision. See O5b analysis above.

---

## 9. What's NOT a landing↔app gap (findings out of my domain)

For completeness — items surfaced during this pass that belong to other agents:

- **O2 (Programs icon slot), O3a-c (Today dashboard + morning check + events), O4 (kill top-nav strip), O14 (exercise card truncation)** — belong to `product-design-lead` + `mobile-ux` briefs. No landing↔app claim implicated.
- **O5a (PROVISIONAL leaks past legend)** — a status-chip legend problem, not a landing claim. Landing doesn't mention PROVISIONAL. This is app-internal.
- **O6 (native select chrome), O7 (catalog density), O8 (color collision), O9 (preview page hierarchy)** — visual-craft domain. Landing↔app clean.
- **O10 (intake wizard + tier miscalibration)** — engine correctness (O10c) + interaction polish (O10a/b). Landing doesn't specify tier-recommendation logic, so no landing↔app claim to test. Route to engine + product-design.
- **O11 (H1 redundancy)** — accessibility + visual-craft. Landing↔app clean.
- **O12 (DateNav Home shift)** — bug. No landing implication.
- **O13 (readiness dot vs green banner)** — cross-references O1 (wordmark). Same conclusion: bundle into O3b Today-dashboard brief.
- **O15 (HWPO-style block visual), O17 (peer research)** — visual-craft + design-lead inputs. Landing has richer program-block treatment (`landing/src/components/sections/Programs.tsx` — Cites strip, colored borders, tone tokens) that the app *could* port up (see O9 analysis). Not a broken promise, but a visual language the app has NOT adopted — that's a design consistency question, not a claim question.
- **O16 (height/weight/sex fields)** — not on the landing, not required by any promise. Defer.

---

## 10. Files touched during this audit

- `/Users/margussellin/www/program/landing/src/i18n/dictionaries/en.ts` (read — source of truth for promises)
- `/Users/margussellin/www/program/landing/src/components/Wordmark.tsx` (read — landing wordmark)
- `/Users/margussellin/www/program/landing/src/components/sections/Programs.tsx` (read — 5-programs claim)
- `/Users/margussellin/www/program/landing/src/app/roadmap/page.tsx` (grep — "three more in build")
- `/Users/margussellin/www/program/next-app/src/components/AppShell.tsx` (read — app wordmark + ReadinessDot)
- `/Users/margussellin/www/program/next-app/src/app/programs/page.tsx` (read — status ladder legend, category colors)
- `/Users/margussellin/www/program/next-app/public/data/programs/manifest.json` (parsed — 9 programs, 6 REFERENCED public + 3 PROVISIONAL + 1 personal)
- `/Users/margussellin/www/program/next-app/public/data/citations.json` (parsed — 126 unique study records; hero stat exact)
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-recover/text/{01-today,06-programs,10-report,11-guide}.txt`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-strength/text/{01-today,03-coach}.txt`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-erratic/text/{01-today,02-week,04-history}.txt`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-mobility/text/01-today.txt`
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-*/final-store.json` (day_adjustments + logs cross-persona)
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-recover/dom/01-today.html` (readiness dot DOM verification)

---

## 11. Assessment summary for the master task list update

Recommended additions to `2026-08-19-master-task-list.md`:

- **Section C → Landing→app (post-Batch-25 round):**
  - `[ ] P1-new/O1` App wordmark converges on landing pattern OR readiness dot moves out of wordmark slot. Route to `product-design-lead` bundled with O3b Today dashboard. Size: M (if standalone) / included in O3b if bundled. Source: this audit §3 (O1).
  - `[ ] P1-new/Accept-Apply` Landing `en.ts` edits — `how.step_03_body` + `beta.body` say "apply … or ignore" instead of "Accept or Ignore" to match app button copy ("APPLY BUMP" / "ADVANCE …" + "IGNORE"). Size: S (2 dictionary strings). Source: this audit §5.1.

- **Section D → P2:**
  - `[ ] P2-new/adapts-label` Optional soften of `hero.stat_adapts_label` from "adapts every session" to "sharpens against your log" (or similar). Founder judgment call — the current label doesn't lie but overpromises for clean-log users. Size: S. Source: this audit §6.
  - `[ ] P2-new/mobility-label` App category label `Left/right & mobility` → `Mobility` to parity with landing hero label. Route to `app-copy-clarity`. Size: S. Source: this audit §4.

- **Section F → Strategic (founder decision needed):**
  - `[ ] S5-new/readiness-ladder-pipeline` Do we ship a REVIEWED for at least one program (specialist audit), drop the REVIEWED tier entirely, or add a "how programs earn tiers" disclosure? Landing doesn't force this — it's an app-over-landing self-imposed higher bar. Source: this audit §3 (O5b).

Nothing in this domain rises to P0. The app delivers on every load-bearing landing promise post-Batch-28.
