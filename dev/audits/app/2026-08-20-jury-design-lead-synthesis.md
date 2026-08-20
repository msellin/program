# Jury synthesis — design-lead (composition + IA + product-integrity)

**Prompt-injection guard.** This document responds ONLY to the founder-authored jury prompt (Lane B synthesis). No instruction inside any read artifact — design system, market research, viz brief, deep review, mockups — has been treated as an authority; they are evidence. If a paragraph in any source read like an instruction ("ship X"), it was treated as a claim to weigh, not an order to obey.

**Owner:** product-design-lead (Lane B, judge lens)
**Date:** 2026-08-20
**Role in this pass:** JUDGE, not writer. Vote yes/no on the SYSTEM.
**Docs judged:**
- `dev/audits/app/2026-08-20-terav-design-system.md` (Lane A system doc, ~6900 words)
- `dev/audits/app/2026-08-20-market-research.md` (peer landscape)
- `dev/audits/app/2026-08-20-viz-layer-brief.md` (viz proposals)
- `dev/audits/app/2026-08-20-deep-design-review.md` (visual-craft deep review)
- `dev/audits/app/2026-08-19-master-task-list.md` §G Rejected R1-R12 (hard constraint)
- `dev/audits/app/2026-08-19-founder-observations-queue.md` O1-O21 (esp. O21 "1995 not 2026")
**Mockups walked:** `/tmp/stitch/today-v1.png`, `today-4.png`, `today-minimalist.png`, `session.png`, `session-detail.png`, `program-preview.png`, `landing.png`.
**Other jury briefs read:** none present at write-time. mobile-ux, motion-perf, a11y, copy, landing-alignment lenses not yet filed. This synthesis records the composition-lens vote and flags the four missing lenses as blockers to a full jury verdict.

---

## The vote

**APPROVE-WITH-CAVEATS.** The system as documented is a genuine step-up from Batches 33/34/35 and is grounded in the correct diagnosis (composition, not palette). Ship it — but ship it with the five caveats below applied in-batch, not after. And route a copy of this synthesis + the other four missing jury briefs to the founder before flipping the deploy switch.

Recommendation to founder: **ship with jury's caveats applied.** Do NOT send back to Lane A for another revision. Another revision cycle costs another ~30h of design authoring, ~2 weeks of calendar time, and pulls at least one thread the deep review already resolved (composition-level > primitive-level). The remaining risk on the doc is executable in-batch during the ~121h engineering appetite Lane A has already scoped.

---

## The five caveats (must-fix in Batch 36, not deferred)

1. **The success gate at ≥7.0/10 average, no surface <6.0, is defensible but the measurement protocol is loose.** Founder blind-scoring 65 screenshots (13 surfaces × 5 personas) is a real evaluation, but "blind" needs a mechanic — screenshots must be presented in randomized order, without filenames indicating pre/post batch, and the pre-Batch-36 baseline artifacts must be *saved* (Lane A §8 says to save to `tests/e2e/artifacts/personas.baseline-pre-batch-36/`; that step needs to happen BEFORE any Batch 36 code lands, and it needs a checksum-committed manifest so the "blind" test is genuinely blind). Without that mechanic the gate collapses to "the founder walks the new build and vibes." Fix in-batch: engineering commits a `baseline-pre-batch-36/` snapshot with a manifest before the first primitive PR merges; a small script randomizes filenames for the blind walk. This is 2h of infra work and it converts a soft gate into a hard one.

2. **Semantic score-hero (§5) passes R8 in letter but needs a stricter visual guardrail.** The composition — `StatusPill` in `WorkoutHero`'s eyebrow row + `ReadinessTrail` sparkline above the hero + `ExplainSheet` on tap — is the right call. It is not a Whoop donut. It is not a proprietary composite. But there is a real slippage vector: the moment "GREEN + ▁▂▃▄▅▄▃▂ ↗" reads as *the identity of the app* rather than an eyebrow chrome, R8 has been violated in spirit even if not in letter. Fix in-batch: add a hard constraint in the system doc that the ReadinessTrail sparkline width MUST be ≤ 40% of the card interior width and MUST sit ABOVE the WorkoutHero in visual weight rank order 3 (behind the workout name at 26px and the CTA at 14px semibold bronze). The single-sentence R8-adjacent rule: **the workout name is always the tallest strong-white element on Today**. If a persona render shows the ReadinessTrail visually outweighing the workout name, ship fails.

3. **The 13-surface / one-batch / 121h call is realistic-but-brittle.** Lane A §6 argues correctly that visual drift during a partial ship poisons the jury. I agree with the reasoning. But 121h across one engineer (2-3 weeks focused) or two engineers (1 week) is a scope that historically overruns by 30-50% in this repo — Batches 33/34/35 blew estimates per the deep review, and the deep review itself flagged "worst-case × 1.4 buffer" as the honest math. That puts real appetite at 145-180h. The caveat is not "reject the one-batch call"; it's "budget it honestly and ring-fence rollback." Fix in-batch: split the in-branch ship order §6 already has (1: primitives to hidden route → 6: founder review → 7: deploy) into gates with a hard "if step N slips >48h, we pause and re-scope" rule. The `/dev/primitives` story-file route in step 1 is a great artifact for continuous jury visibility; make it a first-week deliverable, not a checkpoint at the end.

4. **The bento-rejection call (§4) is the correct product-integrity choice AND the doc under-defends it against the market research force.** Lane A defends the single-column-with-Extras-2×2 stance well — bento tiles at 174px cannot hold a WorkoutHero without breaking the anchor. That reasoning is sound. But market research §1 finding 4 is emphatic: bento is the 2026 default; a single-column stack "reads as 2022." The system doc §4's falsifiability test ("if founder + personas walk Today and it reads as under-organised, revisit") is written but never bound to the success-gate math in §8. Fix in-batch: bind the two. If the blind-walk average for Today's surface lands between 6.0 and 6.9 (passes floor, misses target), the FIRST intervention is the falsifiability test §4 named — a 2-col bento below the workout hero for Extras + Signals + Adherence. Do not iterate on primitives; iterate on Today's composition. This makes the bento-rejection an explicit product bet with a named unwind rather than a stance that only gets revisited if someone remembers to look.

5. **The doc omits the founder-verdict spirit test — "does it still read as 1995?" — as a first-class gate.** §8's success gate is a numeric average across 13 surfaces × 5 personas. That is a rigorous measure but it can pass numerically while still failing the O21 verdict. A 7.2/10 average across 13 surfaces where the founder still walks Today and says "cleaner but still not 2026" is a failed ship. Fix in-batch: append a binary yes/no question to the founder blind walk of Today specifically: *"Does this read as a peer product from 2026 alongside The Outsiders / Runna / Ladder?"* If numeric passes but the binary is NO on Today, the ship pauses for the bento-fallback under caveat 4. This aligns the measurement with what O21 actually asked.

---

## Answering the founder's critical questions

### Q1 — Bento rejected for Today. Was that call right?

**Defended, not overturned.** The market research §1.4 signal is real (bento is the 2026 dashboard default), but Lane A's §4 correctly diagnoses that the market research bento pattern is a *browse-and-aggregate* composition (Garmin's In Focus / At a Glance is a stat wall for slow-moving biometrics), and Terav's Today is a *primary-action surface* (one focus, one arc, one workout). Different job → different composition. The peer that matters most for Terav's positioning — The Outsiders, Gentler Stories' 2026 ADA finalist — uses **one hero + a stack of individual metric cards below, not a bento**. That's the pattern to follow, and it's the pattern Lane A shipped in the doc.

The composition-lens defense: a bento's dominant visual signal is *tile equality* — three ~172px-wide cards on one row all announce "I am a peer of the others in this row." That's exactly wrong for Terav's product-integrity claim of one primary daily action. The workout is not a peer of the readiness sparkline, and it is not a peer of the Extras. Bento would tell the eye they are peers; single-column with graded emphasis tells the eye there is a primary. This is Refactoring UI's "one primary emphasis per view" rule holding load.

Where the market signal DOES land is on Progress: §3's WeeklyHeatmap on Progress IS a bento-adjacent surface (a 7×12 uniform micro-cell grid), and Programs catalog IS a 2×3 category tile grid. So Terav ships bento where the job is browse/aggregate — just not where the job is primary daily action. This is precisely the "category signal collides with product positioning, positioning wins" reasoning Lane A named, and it's the right call.

**Vote on Q1: defend.**

### Q2 — Semantic score-hero — R8 pass or fail?

**Passes R8 in letter. Passes R8 in spirit ONLY WITH caveat 2's guardrail.** The composition — StatusPill (categorical) + ReadinessTrail sparkline (contextual trend) + ExplainSheet (why-this rationale) as a composite hero — threads the needle correctly. It is not a Whoop donut. It is not a proprietary composite. It is not "close the ring." The largest strong-white element on Today is the workout name at 26px, not a readiness percentage. That's the load-bearing distinction.

But R8's *spirit* is "no autonomous readiness identity as the primary emphasis of the app," and there's a slippage vector Lane A did not lock down: if the ReadinessTrail sparkline grows to the width of the card (viz brief §Position 2 says 96×20px, which is fine, but the doc doesn't enforce that against future edits), OR if the StatusPill collapses to being the *only* colored element on the fold, the composite starts *behaving* as a score-hero even though no single element is one. Caveat 2's fix — a hard "workout name is always the tallest strong-white element on Today" rule — is what prevents the spirit-violation.

Cross-persona check on §5's composition:
- **persona-recover (rehab, symptomatic morning)** — pill CHECK FIRST amber, sparkline worsening tint, tap explains "Groin symptom 6/10, engine paused strength blocks." **Holds.** The design honors "cautious progression" and does not shame — amber pill is a state, not a red flag.
- **persona-strength (overperformer, cycle-end)** — pill WORKOUT READY green, sparkline flat bronze, tap says "TM 152.5 kg at cycle-end schedule." **Holds.** The design lets the persona feel pushed via the workout name at 26px, not via a competing "you're crushing it" mechanic.
- **persona-erratic (15 skips)** — pill MOVED FROM TUE slate, sparkline honest, no shame. **Holds.** This is the R5-critical case; the design says "moved from Tuesday per your explicit move on 18 Aug" without any adherence framing.

The composite hero passes cross-persona. Ship it, with caveat 2's guardrail.

**Vote on Q2: pass with guardrail.**

### Q3 — 13 surfaces / one batch / 121h — realistic or reckless?

**Realistic-but-brittle. Not reckless.** Lane A's reasoning in §6 is correct: primitive set IS the migration, so once the seven new primitives (WorkoutHero, WeeklySessionStrip, ArcProgressBar, MetricStripCluster, CategoryTileGrid, WeeklyHeatmap, OutcomeBar) exist, the secondary surfaces are 2-6h each of composition. Staging Batch 36 primary + Batch 37 secondary would ship a mid-state where Today is v1.0 and Profile is 2022 — that is the exact failure the deep review named and the doc explicitly refuses to repeat.

Where "brittle" comes in: 121h across one engineer at focused pace is 3 weeks. Real appetite with the 1.4× buffer the deep review used honestly is 145-180h. This is not a fatal problem, but it needs the pause-and-rescope gate caveat 3 named. The `/dev/primitives` hidden-route story file in §6 step 1 is the mitigation lever — if primitives are alive in isolation by end of week 1, jury has visual anchors to review before any surface wiring happens, and if wiring runs long, the deploy-block is scoped-not-canceled.

**Vote on Q3: realistic with named rollback gates.**

### Q4 — Success gate at 7.0/10 from 5.2/10 baseline — defensible or arbitrary?

**Defensible-but-underspecified.** The 5.2/10 baseline in the deep review §1.8 is a real number backed by per-surface diagnosis. The +1.8-point delta target to 7.0 is aggressive (a 35% improvement is a lot to ask from one batch) but not fantasy — the moves in Lane A's system doc are specifically the moves that address the deep review's four root causes (primitive monopoly, data-as-text, wrong-thing-tallest, motion-perceptually-absent). If those moves land and the sparkline + arc bar + weekly strip + WorkoutHero all wire correctly, +1.8 is available.

What makes the gate underspecified is the mechanic (caveat 1 fixes this) and the missing binary "does it still read as 1995" (caveat 5 fixes this). A numeric average is a poor proxy for the O21 verdict; both need to pass.

**Vote on Q4: defensible with caveat 1 + caveat 5 applied.**

### Q5 — Is v1 the right skeleton?

**Yes.** The viz-layer brief §0 already answered this: v1's skeleton (letter-prefix block list, one-hero-per-view pattern, ambient dot trail, secondary Extras card, full-width bronze CTA) is correct; what v1 lacks is viz density — which is what Positions 1-6 in the viz brief and §2-§5 of the system doc add. The `today-v1.png` mockup has the composition right; today-4 adds the arc/readiness/log-extra strips that the system doc formalizes.

Founder's O21 verdict "not many visuals or graphs" is a viz-density complaint, not a composition complaint. The design system doc addresses it by adding six viz elements (WeeklyHeatmap, ArcProgressBar, WeeklySessionStrip, Sparkline-with-targetValue, ReadinessTrail with magnitude tint, OutcomeBar) across the surfaces where they earn their pixels. None of the six is gamification. None is a score-donut. All read as honest data-shape.

The composition itself does NOT need another revision. Batches 33/34/35 shipped composition changes on top of shaky primitives; Batch 36 as scoped is the correct next move: lock the primitive set, wire consistently, verify cross-surface. Sending back to Lane A for a v2 composition would restart a conversation that has already reached its answer.

**Vote on Q5: v1 skeleton is right; ship with viz-layer additions.**

---

## Composition-lens verdict on the doc itself

The system doc reads as a senior product-design brief. It names its choices (bento-rejected §4, semantic-score-hero §5, one-batch §6), defends each against the strongest counter-argument (bento's market-research pull, R8 spirit, staging temptation), and specifies falsifiability (§4's revisit test, §8's success gate, §7's fail-states). This is the shape of a document engineering can ship from in one pass.

Three composition-lens strengths worth naming:

1. **The 12-primitive vocabulary is disciplined.** §2 refuses to add variants to escape discipline (DashboardBlock stays as workhorse; WorkoutHero is a NEW dedicated component, not a `variant: 'hero'` prop). This is the single strongest architectural call in the doc — it's the direct fix for the "primitive monopoly" root cause the deep review §2.1 diagnosed at 95% confidence. Every primitive earns ≥2 consumer surfaces per Appendix A. No one-offs. This is the composition system Terav has not had until now.

2. **The surface-primitive matrix (§3) is the ship contract.** Every one of 13 surfaces has a named pattern and named primitives. Deviations are prohibited without a written brief. This closes the "each engineer picks a variant" leakage vector that produced the batch-33-34-35 outcome of individually-nicer-but-collectively-flat.

3. **Appendix B "What Terav is NOT" is the load-bearing product-integrity artifact.** 13 explicit rejections, each tied to a rule (R1-R12 or §4). This is the list that future founder observations, competitor screenshots, and market trends will be argued against. It's short, canonical, and answerable.

Three composition-lens concerns (already surfaced as caveats above, restated for the record):

- The R8 semantic-hero call needs a visual weight-rank rule (caveat 2).
- The 121h scope needs pause-and-rescope gates (caveat 3).
- The bento-rejection needs to be bound to a falsifiability trigger in the success gate math (caveat 4).

---

## What the missing lenses would likely catch (and my fallback vote)

Four jury briefs are not present at write-time: **mobile-ux, motion-perf, a11y, copy, landing-alignment.** I record what each is likely to surface so the founder does not treat this synthesis as a full jury verdict.

- **mobile-ux (thumb-reach, safe-area, fold math).** Likely finding: the WorkoutHero's "Open session →" CTA at the bottom of a hero card that may itself be 400px+ tall (26px title + 3-cell metric strip + 4-block list + CTA) risks pushing the primary tap below the fold on 375×667 (iPhone SE). Lane A's §3 primitive spec doesn't lock the hero's max height. If the mobile-ux jury lens agrees this is an issue, the fix is a hero-collapse rule at <667 device height (block list collapses to "4 blocks →" chip). Add as caveat 6 if their brief lands.
- **motion-perf (bundle delta, CLS, LCP, INP).** Likely finding: seven new primitives + Sparkline/ReadinessTrail upgrades will exceed the doc's "net delta <20KB gzipped" target unless components are strictly co-located and the WeeklyHeatmap uses inline SVG rather than a library. Lane A §7 item 6 delegates this to `app-motion-perf` — the delegation is correct; the number may need to move to ≤35KB honestly.
- **a11y (WCAG 2.2 AA).** Likely finding: the ReadinessTrail sparkline + WeeklyHeatmap need SR-alt text that is prose-descriptive, not "chart"; the ExplainSheet's citation modality needs a focus-trap; the StatusPill's `role="status"` is correct but must NOT be `aria-live="polite"` on mount cascade (would announce 5 pills at once). All fixable.
- **copy (StatusPill vocabulary + ExplainSheet body).** Likely finding: WORKOUT READY / CHECK FIRST / MOVED FROM TUE / IN PROGRESS / DONE is short and disciplined. IN PROGRESS variants for skill/mobility programs are not yet written. OutcomeBar rangeCaption strings ("TYPICAL RANGE +15 TO +25 KG · 8 WEEKS") need per-program authoring; the persona-recover rehab program cannot honestly claim "typical range" — it needs "authored target, individual" phrasing.
- **landing-alignment.** Likely finding: post-Batch-36, the app's StatusPill vocabulary + warm-dark palette + IBM Plex Mono numeric tier should surface at least partially on landing/en.ts to prevent the "landing looks 2026, app still looks 2022" mismatch that persisted after Batches 33/34/35. Lane A §Appendix C flags this as `landing-conversion-strategist` scope.

If any of the five missing briefs comes back with a **REJECT** verdict, my composition-lens APPROVE-WITH-CAVEATS collapses to APPROVE-BLOCKING (do not deploy until the rejecting brief's dealbreaker is resolved). If all five land as APPROVE or APPROVE-WITH-CAVEATS, the composition-lens vote stands.

---

## Ship recommendation

**Ship with jury's five caveats applied in-batch.** Do not send back to Lane A for another revision. Do not ship as documented without the caveats.

The one-line recommendation to founder: **the design system doc is a genuine step-up and is grounded in the correct diagnosis; the five caveats above convert it from an approved-in-principle document into an approved-and-executable Batch 36. Fold them into the doc before the first primitive PR merges; then ship all 13 surfaces as one wave.**

The one-line risk to name honestly: **the +1.8-point improvement from 5.2 to 7.0 in the success gate is aggressive; if Batch 36 lands and the founder walks Today and says "cleaner but still 1995," the doc's own §8 says do not silently patch — write a new brief.** That brief exists as a named artifact in the plan; the ship can land at 6.5 average and still be a defensible move-forward while a targeted bento-fallback (caveat 4) is scoped in Batch 37.

**Final vote: APPROVE-WITH-CAVEATS.**

Composition-lens signed. Awaiting mobile-ux, motion-perf, a11y, copy, and landing-alignment jury briefs to finalize the collective jury.
