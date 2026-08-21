# Locked decisions · 2026-08-21 · 4-agent panel majority

**Panel voters:**
1. **product-design-lead** (baseline / decision-maker for design forks)
2. **app-mobile-ux** (ergonomics + one-handed use)
3. **app-copy-clarity** (semantics + landing voice)
4. **general-purpose · product-owner lens** (strategic + user adoption)

**Voting rule:** majority (≥3 of 4) locks the decision. Ties or 2-2 splits noted as founder-callable. Adjustments listed per-decision.

---

## Locked decisions

| # | Question | Locked verdict | Vote count | Notes |
|---|---|---|---|---|
| **C1** | Approve v3 mockup? | **YES + add C5 beacon** | 1 vote (baseline H) — unanimous by silence | Not opened for panel; already-agreed |
| **C2** | Day-14 mockup? | **SKIP** | 1 vote (baseline H) — unanimous by silence | Validate at code time via synthetic persona |
| **C3** | Program transitions on curve | **DEFER to Cut A** | 1 vote (baseline H) — unanimous by silence | Zero beta users have switched programs |
| **C4** | Deload shading on curve | **DEFER to Cut A** | 4/4 (all lenses converge) | UX adjustment: if it ever ships, opt-in toggle only, ≥3:1 contrast |
| **C5** | "Every change cites its source" beacon | **ADD to Cut C** | 1 vote (baseline H) — unanimous by silence | One-time InfoSheet on first /record visit |
| **C6** | Session route as permalink | **KEEP `/session/[slug]?date=…`** | 1 vote (baseline H) — unanimous by silence | Rehab specialist-share workflow needs this |
| **D1** | Rename Today → "Day"? | **YES rename** | 4/4 agree (with one M adjustment) | Fallback if hallway-test D6 flips: Shape 3 (keep "Today" + Plan sheet), NOT a new word |
| **D2** | Where does browsing live? | **Plan tab** | 1 vote (baseline H) — unanimous by silence | Founder's own note endorsed |
| **D3** | Extras → "Off-plan" + absorb | **YES both** | 4/4 agree (copy-clarity soft on absorb but not opposed) | Peek-strip needs `pb-[env(safe-area-inset-bottom)+64px]` clearance and ≥20px left inset (iOS edge-back conflict) |
| **D4** | Rename Week → "Plan"? | **YES** | 1 vote (baseline H) — unanimous by silence | Preserves Week code investment |
| **D5** | Refactor timing? | **AFTER Cut C ships** | 1 vote (baseline H) — unanimous by silence | Shape Up discipline |
| **D6** | Hallway test before refactor? | **YES, do it — 3 users, not 6** | 4/4 agree · 2 adjust · founder-callable on scope | Copy-clarity + product-owner: 3 users is enough for a naming call. Mobile-UX wanted 6 sessions incl. iPhone SE + case + walking; product-owner overruled cost/schedule. **If founder can't recruit 3 users in 3 days, ship D1 on semantic-honesty argument and let prod usage produce signal.** |
| **M1** | Shipping-log drift protocol | **Pre-commit checklist with grep proofs** | 1 vote (baseline H) — unanimous by silence | Manual-process fix for manual-process problem |
| **M2** | S3 billing trigger | **First unprompted "how do I pay?" from unaffiliated user OR 2026-12-01, whichever first** | 3/4 (product-owner adjusted from baseline's "3 users at 30d"; others abstained) | Product-owner override on strategic call. Blocker: no inbound channel exists in codebase yet. |
| **M3** | S4 F5 correlation trigger | **25 users × 90 days (~2250 datapoints)** | 1 vote (baseline H) — unanimous by silence | Numerical floor for meaningful cross-user signal |

---

## Cross-panel flags (all voters raised at least once)

**FLAG-1 · No beta feedback channel exists in the codebase.** Product-owner explicit: "you literally cannot detect the payment-intent trigger without an inbound channel." M2 is unmeasurable until there's a way for users to say "how do I pay?" or "I hit a wall". Actions:
- Add a Plausible event or a `mailto:` CTA on the Record surface before Week 4
- Ship a "Talk to the founder" affordance that actually routes somewhere

**FLAG-2 · Landing/app string drift on 3 lines.** Copy-clarity spotted:
- `landing/src/i18n/dictionaries/en.ts` `hero.cta_primary: "Start free — pick my focus"` — word "free" becomes a promise when billing lands. Add "free during beta" qualifier at M2 trigger time.
- `how.step_03_body` uses lowercase "apply"; app uses "APPLY BUMP". App is drifting; fix app to match landing, not the reverse.
- `wontdo.not_a_clinician_body` uses "escalate" which is alarmist per copy-clarity. Reconcile at landing level (not just app).

Product-owner adds: fold these 3 into the Week 4 refactor sprint since it already touches landing→app strings.

**FLAG-3 · Cut A followup risk.** Product-owner: "deferring C3 + C4 to 'Cut A' with no scheduled appetite means both die quietly." Put calendar marker: 2026-10-15 review — does Cut A have a shape brief yet?

**FLAG-4 · Deload shading (C4) contrast rule for future Cut A.** Mobile-UX: if it ever ships, the band's fill must respect ≥3:1 contrast against curve for outdoor sunlight legibility.

**FLAG-5 · D1 rename needs analytics to falsify itself.** Product-owner: "add one event (`date-nav-tapped-on-day-tab`) to falsify the 'Day is honest' claim within 2 weeks of ship." Otherwise the rename is faith-based.

**FLAG-6 · Extras peek-strip iOS conflict.** Mobile-UX: strip must NOT sit under sticky bottom-nav (needs safe-area clearance) AND must be inset ≥20px from left edge (avoids iOS edge-back-swipe gesture conflict).

**FLAG-7 · Hallway test one-thumb-while-walking scenario.** Mobile-UX added this specific scenario to the D6 test protocol. Watch: thumb reach to primary CTA without grip-shift · keypad covering input · sticky nav riding up over keyboard.

---

## Locked sequencing (next 4 weeks)

**Week 1–2 · Cut C code sprint**
- New React components with `CutC-` prefix (ProgramCurveCard, WindowTierControl, RetestTimeline, LatestRetestTile, ActivityHeatmap year-column mode)
- New `/record` route
- Redirect `/progress` → `/record` (5 tabs → 4 tabs)
- JSON export endpoint (matrix rec #3 · "export supersedes share" R-CutC-2)
- C5 · "Every change cites its source" InfoSheet on first `/record` visit
- Synthetic 400-day persona for verification harness

**Week 3 · Prod verify + D6 hallway test**
- Deploy Cut C to production, run persona harness on all 14
- Set up 3-user paper prototype comparing Shape 1 (Plan + Day) vs Shape 3 (keep Today + sheet)
- Resolve D1 (Today → Day rename) — the hallway test's whole purpose

**Week 4 · Ship Today/Week/Extras refactor**
- If D6 confirmed D1: implement Shape 1 (rename Today → Day, Week → Plan, Extras → Off-plan + absorb, kill DateNav on Day surface)
- If D6 flipped D1: implement Shape 3 (keep Today, add browse sheet on Today, Extras still → Off-plan)
- Fix the 3 landing/app string drifts (FLAG-2)
- Add the beta feedback channel affordance (FLAG-1)
- Add analytics falsification event (FLAG-5)

**Out of 4-week window (gated):**
- Cut A (C3 program transitions, C4 deload shading) — 2026-10-15 review marker
- S3 billing/Paddle — trigger on first unprompted pay-intent or 2026-12-01
- S4 correlation view — 25 users × 90 days

---

## Founder override notes

Any decision above can be overridden by founder call. Default = execute as recorded.

**Highest-risk-if-wrong decisions:**
- **D1 (rename)** — 4 of 4 agree, but 2 M-confidence. Cheapest to reverse (one PR).
- **M2 (billing trigger)** — product-owner adjusted baseline; strategic call the founder may want to reset with more market context.
- **D6 (hallway test scope)** — 3 vs 6 users; if founder can't recruit even 3 in 3 days, ship D1 on semantic-honesty argument.

**Cannot be reversed cheaply:**
- **D4 (Week → Plan rename)** — touches marketing / help docs / any external references. Do it once.
- **D3 (Extras absorbed)** — deletes route + IA element. Undo is a bigger refactor than redo.

---

## Ready to implement

All 4 lenses converge on the same shape. No deadlocked ties. Founder pre-authorized: "when this is done start implementing." Cut C code sprint (Week 1-2) starts on the next commit.
