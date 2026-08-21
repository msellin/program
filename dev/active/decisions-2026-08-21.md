# Product decisions · 2026-08-21

**Made by:** product-design-lead agent as decision-maker
**Basis:** competitive matrix (31 apps × 79 attrs) + Cut C brief + 3-lens Today/Week brainstorm + synthesis + founder's latest notes ("day/week don't both need date navigator", "not sure if Day is right name", "colorful charts", "design must work for all public programs")
**Founder can override any of these — but the default is: implement as recorded.**

---

## Decision table

| # | Question | Verdict | Confidence | One-line defense |
|---|---|---|---|---|
| C1 | Approve v3 mockup for code? | **YES — ship as-is, with one addition (see C5)** | **H** | v3 folded all four audit passes + stress-test PROCEED + founder's colorful mandate reconciled without violating R2; further iteration is polish, not signal. |
| C2 | Day-14 empty-state mockup? | **SKIP — validate via synthetic day-14 persona at code time** | **H** | ASCII wireframe in brief §3a is unambiguous; day-14 is a "less data" projection of the same primitive, not a new shape. |
| C3 | Program transitions on curve — Cut C or Cut A? | **DEFER to Cut A** | **H** | No user has switched programs mid-arc in beta yet; adding phase-markers now solves a problem nobody has, adds engineering surface (track changeover dates), and the RetestTimeline already carries a per-event citation that can name the switch. |
| C4 | Deload period shading — Cut C or Cut A? | **DEFER to Cut A** | **M** | Same argument as C3 — deferred until data exists to shade; hallway test to resolve: show two day-400 users a v3 curve with a 4-week dip and ask "what happened here?" — if both read it as plateau (not deload), C4 becomes urgent. |
| C5 | "Every change cites its source" onboarding beacon? | **ADD for Cut C — one-time InfoSheet on first `/record` visit** | **H** | Cheap (one component, one localStorage key), high leverage (the differentiator is invisible to cold-landing users per the design-lead review), and it's the exact spot where the confirm-first ethos gets its first user-facing statement. |
| C6 | Session route as permalink or modal-only? | **KEEP AS PERMALINK — `/session/[slug]?date=…`** | **H** | Rehab-primary + specialist-share use cases (matrix rec: "the tenure-external artifact is portable data") both require a bookmarkable URL; inflate-in-place breaks the "show my physio last Tuesday's session" story that is Terav's unique advantage. |
| D1 | Rename Today → "Day"? | **YES — rename to "Day"** | **M** | The tab-vs-body lie ("Today" while body shows Friday) is the root cause of the founder's bug; landing keeps saying "today" (lowercase word, not tab-noun) so brand fragmentation risk is smaller than the semantic sin fix; if founder weights landing-voice higher, fall back to Shape 3 (keep "Today" + add sheet). |
| D2 | Where does non-today browsing live? | **PLAN TAB — rename Week → Plan, absorb date browsing there** | **H** | Founder's own instinct ("day and week both don't need date navigator, its either only for week or only for day view") directly endorses ONE surface owning date scrub; Plan preserves the Week code investment via rebrand not delete, and gives multi-track its natural home. |
| D3 | Rename Extras → "Off-plan" + absorb into Day peek-strip? | **YES both — rename Extras → "Off-plan", demote route to scroll-anchor on Day** | **M** | Two stackable moves: rename fixes the "Extras sounds like appetizers" copy problem; absorption pulls low-frequency retro-log affordance into the surface that owns "what did I do today"; a route stub can redirect to Day#off-plan for bookmarks. |
| D4 | Rename Week → "Plan"? | **YES — Week becomes Plan** | **H** | Follows from D2; "Plan" carries the mental model the founder is already using in their own notes ("Today, Week and Sessions… big refactor"); Freeletics + TrainingPeaks precedent; keeps MoveSheet/dot-grid/phase-readouts intact under new name. |
| D5 | Refactor timing — before / with / after Cut C code? | **AFTER Cut C ships** | **H** | Cut C is scoped, the mockups exist, and the founder is ready to move; bundling the Today/Week refactor risks 4-week ship slip on a 2-week Cut C; refactor gets its own 2-week appetite once Cut C is verified in prod. |
| D6 | Hallway-test before refactor commit? | **YES — 1-day paper prototype of Shape 1 vs Shape 3 on 3 users** | **M** | D1 (Today vs Day name) is the only genuinely uncertain call in this decision batch; 4h build + 1h session resolves both the naming call AND the destination call with thumb data instead of opinion; cheap insurance before a 2-week refactor. |
| M1 | QA-1 shipping-log drift protocol? | **Pre-commit grep-check + a batch checklist in the shipping-log template** | **H** | Post-commit CI adds infrastructure surface for a problem that's manual-process shaped; a required "verify shipped ≠ archive" step in the batch template with 5-line grep proofs is what actually caught the drift last time, and it doesn't add a moving part. |
| M2 | S3 SaaS Phase 3 billing timing? | **Trigger: 3 unaffiliated beta users hit 30-day mark AND ask about paying** | **M** | Building Paddle infra before there's a paying-intent signal is premature; the trigger is user-shaped (revealed preference for payment), not calendar-shaped; if it hasn't fired by 2026-11-01, revisit — silence is data. |
| M3 | S4 F5 correlation view trigger? | **Set explicit trigger: 25 users × 90 days of continuous logs** | **H** | Correlation math is meaningless below ~2000 (user × day) data points; 25 × 90 = 2250 is the floor where cross-user signals stop being noise; if beta doesn't reach this by 2027-Q1, defer indefinitely and reconsider the feature's premise. |

---

## Reasoning per decision

### C1 · Approve v3 mockup for code

v3 landed all four audit-agent reports (visual-craft APPROVE-WITH-NITS, mobile-ux BLOCK→fixed, copy-clarity APPROVE-WITH-NITS all 7 folded, product-design-lead APPROVE-WITH-NITS all 3 folded), the founder's colorful-charts mandate got reconciled without violating R2 (state tokens + 3-step lightness ramp, no new decorative accent), and the peer-screenshot stress test confirmed the 3 architecture claims with one citation correction already folded (Hevy-aligned window labels, not Oura). One nit to fold at code time: the palette drift (`--strong: #F0F1F3` in mockup vs `#f4f5f7` shipping) — trivial reconciliation in `globals.css`. **Confidence H:** further mockup iteration is decoration; ship it.

### C2 · Day-14 mockup skip

Brief §3a already renders the day-14 state as a detailed ASCII wireframe with explicit copy for the trend-section text ("Trend needs three retest events to draw a line") and the empty-state CTA ("Open today"). The day-14 shape is not a new layout — it's the same three-section rhythm with less data. Verification is cheaper as a synthetic day-14 Playwright persona at code time than as an eleventh mockup review cycle. **Confidence H:** the review-1 recommendation already made this call; endorsing.

### C3 · Program transitions on curve — defer

Zero beta users have switched programs mid-arc. Adding phase-markers on the curve now requires: (a) tracking program-changeover dates in the store, (b) rendering a vertical rule + label on the curve, (c) authoring the citation ("switched from CSM to engine-builder on 2026-01-15 · basis: log signal `strength_maintenance_hit_target`"). That's ~4h of engineering for a problem nobody has. The RetestTimeline already handles the tenure story per-event; if a program switch coincides with a retest (which it should, because retests are the natural boundary), the RetestEventSheet can name the switch. **Confidence H:** Cut A candidate, not Cut C.

### C4 · Deload shading — defer, but weakly

Same defer logic as C3. The concern the founder raised — "4-week dip reads as plateau" — is real, but v3 already renders retest pins on the curve, and a deload week is typically bounded by a retest pin on either side (that's what a deload IS: post-cycle recovery before next test). Reading "pin, dip, pin" as "cycle-end, deload, cycle-start" is legible without shading. **Confidence M** because I haven't hallway-tested this. If two day-400 users see the v3 curve and read the 4-week dip as "I got worse" instead of "I deloaded," C4 flips to urgent. Cheap test: annotate one dip on v3 with a `deload` chip and see if the reading changes.

### C5 · "Every change cites its source" beacon — add

This is the one Cut C addition I'm recommending. The design-lead review flagged it as "category vacancy under-dramatized," and the product-design-lead review agreed it's the only place the confirm-first differentiator gets a user-facing declaration. Implementation: one-time InfoSheet on first `/record` visit, localStorage-gated (`terav:record-beacon-seen`), single sentence + dismiss. Copy budget: 40 chars for the headline (`Every change here cites its source.`), 60 chars for the sub-line (`Tap any retest pin to see the study.`). This is Refactoring UI economy — one sentence, one CTA (Got it), one dismiss. **Confidence H:** cheap, high-leverage, exact-fit for the differentiator gap.

### C6 · Session route as permalink

The synthesis brainstorm's Shape 2 proposed killing the session route (inflate-in-place). I'm rejecting it. The rehab persona (Margus's own primary use case) needs to hand a URL to a physio: "here's what I did last Tuesday, look at the sets and RPE." That IS a bookmarkable-URL use case; inflate-in-place kills it without a great substitute. Also: matrix rec R-CutC-2 explicitly says "the tenure-external artifact is portable data, not a shareable image" — that principle extends to per-session URLs. Route stays: `/session/[slug]?date=YYYY-MM-DD`. Under D2's Plan-tab model, `?date=` is a valid deep-link parameter (not a smuggled state hack, because Day never reads it — only Session does). **Confidence H:** this is the load-bearing rehab affordance; I would fight the founder on this if they pushed for modal-only.

### D1 · Rename Today → "Day"

The founder wrote "not sure if 'day' is correct tab name" — I'm pushing back on the doubt, not the instinct. "Day" is honest: the tab renders one day's content. "Today" is a lie whenever the body shows non-today. Landing dictionary uses "today" as a lowercase word ("your today"), not as a proper-noun tab-label, so brand fragmentation risk is lower than the design-lead's caveat implied. Alternatives considered and rejected: "Now" (Whoop-precedent, but implies real-time which we're not), "Focus" (positioning-adjacent but ambiguous with the focused-improvement thesis), "Session-day" (compound word, awkward), "Sesh" (too casual for rehab tone). **Confidence M** because this is the one call the hallway test in D6 should validate — if 3 users read "Day" and don't reach for a date-navigator, we're done; if any of them ask "which day?" the H1 pattern needs work.

### D2 · Non-today browsing lives on Plan tab

Founder's own note — "day and week both don't need date navigator, its either only for week or only for day view" — is the clearest permission I've seen to make ONE surface own date scrub. Plan absorbs it. Day is stateless (`todayISO()`). This resolves the founder's bug by policy (no state to leak) not plumbing (which is what Shape 3's Zustand mechanism does). Design-lead's Model B pick, and it stacks cleanly with D1 (Day + Plan is a coherent naming pair). **Confidence H:** the founder telegraphed this call in the note.

### D3 · Extras → "Off-plan" + absorb

Two stackable moves. Rename: "Extras" reads as add-ons/appetizers; "Off-plan" is honest about what it is (a class you did outside your program's plan). Absorb: the retro-log affordance belongs on the surface that owns "what did I do today," which is Day. Route stub survives at `/extras` → `/day#off-plan` for bookmark preservation. Peek-strip position: below the primary hero, above the peek-strip of secondary tracks. **Confidence M:** the rename call is confident; the absorption call is a design-lead pick that hasn't been prototyped — a hallway test could flip it, but the ergonomic gain is real (one less route, one fewer tab, one clearer mental model).

### D4 · Rename Week → "Plan"

Follows from D2 — if Plan owns date browsing, the tab must be called Plan. "Week" was a describes-the-content name; "Plan" is a describes-the-purpose name. Freeletics uses "Plan"; TrainingPeaks uses "Calendar" (rejected: implies scheduling primary function, but Terav's engine proposes, user accepts — plan is what emerges, not what's set). MoveSheet, day-cells, phase readouts all live on unchanged under the new label. **Confidence H:** naming discipline call.

### D5 · Refactor AFTER Cut C ships

Cut C mockups are done, the brief is written, engineering can start. The Today/Week refactor requires: rename Today→Day, rename Week→Plan, delete Today's DateNav, absorb Extras, verify session route deep-linking through the new IA. That's 2 weeks of engineering. Bundling it with Cut C code (also ~2 weeks) risks a 4-week ship, and both surfaces would be in-flight simultaneously — hard to persona-test. Ship Cut C first (Record surface + JSON export + new components), verify in prod for 3-5 days, then refactor Today/Week/Session in a bounded second sprint. **Confidence H:** Shape Up appetite discipline — one shape at a time.

### D6 · Hallway test before refactor commit

D1 is the only decision here where I'm at M-confidence. The 1-day prototype test — paper cut of Shape 1 (Day + Plan) vs Shape 3 (Today + Sheet), 3 users, 2 questions, watch what the thumb does — resolves it definitively. Cheap insurance before committing to a 2-week refactor. If it validates D1, we ship with confidence; if it flips, we save 2 weeks of building the wrong thing. **Confidence M** on the test format but H on the principle — the test happens, the format can flex.

### M1 · Shipping-log drift protocol

The S5 rerun found 3+ items marked "shipped 2026-08-18" that only partially executed on disk. The failure mode is human — the batch commit archived the plan before the code was fully written. Fix: add a "verify shipped ≠ archive" checklist step to the batch template, with 5-line grep proofs for each claimed fix, before the plan gets archived. A post-commit CI job is heavier (adds infrastructure, needs maintenance, would re-parse JSONs on every push) for the same signal a checklist provides. **Confidence H:** manual-process problems get manual-process fixes; don't automate what a checklist solves.

### M2 · S3 SaaS Phase 3 billing trigger

Building Paddle before there's revealed preference for payment is premature — the beta could still pivot on positioning. Trigger: 3 unaffiliated beta users (not founder + friends) hit the 30-day mark AND ask (unprompted) how/where they pay. That's the intent signal that makes billing infrastructure worth the ~2 weeks of engineering + Paddle integration + entitlement plumbing. If it hasn't fired by 2026-11-01 (10 weeks from now), revisit the assumption — either the beta isn't scaling or the payment intent isn't there, and both are strategic signals worth acting on. **Confidence M** because I'm guessing at the trigger number; the founder can flex 3→5 or 30d→60d based on beta velocity.

### M3 · S4 F5 correlation view trigger

Cross-user correlation math needs data. The floor for meaningful signals in a 6-8 variable correlation matrix is ~2000 (user × day) data points; below that, everything looks like noise. 25 users × 90 days = 2250 — the minimum viable dataset. If beta doesn't reach 25 continuously-logging users by 2027-Q1, defer indefinitely and reconsider whether the feature has a premise at all (single-user correlation views are still valuable and already in Record). **Confidence H:** this is a numerical floor, not an opinion.

---

## Founder-controlled overrides you might disagree with

Items where I have a moderate-confidence pick but the founder's landing voice, business context, or long-tenure vision could reasonably choose differently. Flagged as "would not fight if overridden."

- **D1 (Today → Day rename)** — If the founder weights landing-voice consistency higher than semantic honesty, keep "Today" and fall back to Shape 3 (add the browse sheet on Today; the tab keeps its name; the H1 continues to carry contextual eyebrow "Wednesday · today"). Would not fight — brand consistency is a founder call. Impact: Shape 3 doesn't resolve the semantic sin but does resolve the ergonomic sin, so it's a real 80% fix.

- **D3 (Extras → Off-plan + absorb)** — The absorb-into-peek-strip half is a design-lead pick without a prototype. If the founder wants to keep Extras as a route but rename it "Off-plan," that's coherent and I would not fight. The rename is the load-bearing move; absorption is polish.

- **C5 (onboarding beacon)** — If the founder thinks a one-time InfoSheet is user-noise (Terav's tone leans instrumental/laconic, and beacons can feel salesy), skip it. Would not fight, but the differentiator remains invisible to cold users until they tap a retest pin. Backup: put the sentence in the Record header as a static mono-caps line for 30 days then remove it (self-decaying beacon).

- **M2 (S3 billing trigger)** — Number of users and calendar window are guesses. The founder likely has better intuition about when a paid tier becomes urgent. Would not fight a 5-user or 60-day trigger.

- **C6 (session permalink)** — This is the one I'd fight for, but I flagged it here anyway because the founder might have a specialist-share workflow I'm not aware of that makes modal-only viable. If specialist-share happens via JSON export exclusively (not URL-share), permalink becomes optional.

---

## Sequencing recommendation

**Next 4 weeks — the shipped-work sequence:**

**Week 1-2 · Cut C code sprint.** Build Record surface end-to-end: new components (ProgramCurveCard, WindowTierControl, RetestTimeline, LatestRetestTile, ActivityHeatmap year mode) with `CutC-` prefix, `/record` route composition, `/progress` redirect, `/history` retire, JSON export endpoint with citation payload, C5 onboarding beacon (one-time InfoSheet), synthetic day-14 + day-90 + day-400 personas for verification. Deploy to program-v2.pages.dev. Delegate: type-scale ramp → `app-visual-craft`; tap-target verification → `app-mobile-ux`; ARIA on RetestEventSheet + Export button → `app-accessibility`; citation string budget → `app-copy-clarity`. Persona harness rerun before deploy.

**Week 3 · Verify in prod + hallway test.** Cut C ships. 3-5 days of persona reruns + real-user observation on the founder's own instance (400-day state). In parallel: run D6's 1-day paper prototype (Shape 1 vs Shape 3) with 3 users on Wednesday evening. Resolve D1 with thumb data. If D1 validates → proceed to Week 4; if D1 flips → fall back to Shape 3, adjust scope, still proceed.

**Week 4 · Today/Week/Session refactor sprint.** Rename Today → Day (or keep Today per hallway result), rename Week → Plan, delete Today's DateNav, absorb Extras (or rename only, per founder's D3 call), verify session route deep-linking, update FirstRunBanner + landing→app strings for the new tab names. Deploy. Persona harness rerun. This is the 2-week refactor described in D5 compressed to 1 week because most of the work is naming + route wiring, not new components.

**What unlocks what:** Cut C unlocks nothing downstream in this window (it's a leaf feature). The refactor unlocks: cleaner F2 first-run banner copy (references stable tab names), cleaner analytics event naming, and — most importantly — a Day surface that's honest about what it is, which is the precondition for shipping the "hero-of-the-day + peek-strip" multi-track pattern in Cut B (deferred to a future sprint outside this window).

**Not in this 4-week window:** Cut A (Year-in-Review, program transitions on curve, deload shading), F5 correlation view (M3 gated), S3 billing (M2 gated), any coach-surface revival (R12 rejected). The 4-week window is disciplined: Cut C ships, refactor ships, everything else waits.
