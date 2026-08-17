# Combined roadmap — F track + remaining P tiers (2026-08-17)

Synthesis of:
- Post-audit backlog `dev/active/session-audit-2026-08-17/backlog.md`
- Research briefs A / B / C at `dev/audits/product-concerns/`

**Bottom line up front:** three of the research findings materially rewrite the F track. One earlier proposal is a fail-mode (Concern C); the other two need reshaping.

---

## What the research changed

**Concern A → Sharpness "A/B/C/D grade" is the wrong shape.** LinkedIn Profile Strength + Whoop Journal + TrainerRoad Progression Levels all validate the transparency pattern, but every commercial success avoided A/B/C/D letter grades (D reads as failing, punitive baggage). Duolingo tried Skill Strength decay, users hated it. Grade *data*, not users.

**Concern B → Self-learning-from-notes is validated.** MacroFactor, Strava, Whoop, Fitbod, Runna all rule-tune adaptively without LLM. Founder's premise is correct. One warning: at beta scale "padel → red" probably really means "Sunday → red" — the sample size gates when Phase B correlation lift becomes trustworthy.

**Concern C → Video form analysis as paid pillar is almost certainly wrong.** Coach's Eye shut down. Hudl Technique shut down. OnForm pivoted to B2B (coaches, teams). Uplift Labs same. HomeCourt narrowed to basketball only. **Nobody has built a durable D2C AI-form-check subscription.** Founder-obvious feature, commercially unproven. Video demos = ship free. AI form check = don't build the backend as paid pillar.

The pattern that CONVERTS to paid: **adaptive planning + a small daily number derived from your own data**. Terav's confirm-first proposals map exactly onto this. Ideological model: **Hevy Pro (narrow, quiet paid)** not Runna (wide content paywall).

---

## F track (research-validated, ranked)

### F1 (revised) · Signal-completeness surface

**Was:** Sharpness A/B/C/D grade with video as final +1 to A.
**Now:** literal "the engine sees / would additionally use" enumeration per program. No letter grade. No user shame. Named tiers only if we ship v2 later (e.g., **Baseline / Calibrated / Full** or the sword metaphor **Blunt / Honed / Sharp / Razor** — the sword metaphor threads the Terav brand verb).

**Path 1 first (ship now, ~4-5h):**
- Add a `signals` block to each program JSON: what the engine currently reads, what it would additionally use, per-signal user actions to close the gap
- New `<SignalCompletenessCard>` on Progress route
- Copy: literal + non-punitive ("your engine reads pace + notes. It would also use HR if you logged it. → Log HR each session · Connect wearable")
- No score. No grade. Just a list.

**Path 2 (promote later if Path 1 gets clicks):** program-level engine-capability tier with named states.

**F1 is NOT paid.** It's a free-tier transparency feature that USES paid features as its "add wearable" upgrade. Points at F4.

### F4 · Wearable ingest (Garmin FIT + Whoop HRV + Oura HR/sleep)

**Concern C validates this as a paid pillar.** Wearable ingest is the clearest paid-tier upgrade that fits Terav's positioning. FIT spec exists at `dev/active/saas-launch/future-features.md`.

- Garmin manual FIT upload (spec ready)
- Later: Whoop HRV, Oura sleep
- Sets up F1 Path 1's "log HR" checklist → "connect wearable" one-tap

Estimated: **~3-4 weeks solo** for the FIT parser + Supabase schema + upload UI. Big lift, but this is the paid-tier keystone.

### F5 · Multi-year trend + symptom-load correlation view

**Concern C validates this as a paid pillar.** MacroFactor's expenditure V3, TrainerRoad's PLs — users pay for the small daily number derived from their own data. Terav's version:

- Chart: your last N months of load + symptoms + proposals accepted
- "Your groin pain correlates with load spikes 3-4 days earlier"
- Requires real data volume, so paid-users self-select via the FIT ingest + long log history
- Only meaningful for users with 90+ days of logs — so it's a natural post-beta unlock

Estimated: **~1-2 weeks** for the correlation math + chart component.

### F2 · Self-learning-notes (Phase A first)

**Concern B validates all 4 phases.** Modified per research: Phase B must produce PROPOSALS (founder-review), not auto-mutations. Phase A can ship now safely.

**Phase A (ship now, ~4-6h):**
- Weekly Worker cron scans users' notes for words that appear ≥3× in 30 days AND aren't in `note-signals.ts` regex
- Emits a JSON queue you review
- You decide which to add to the regex

**Phase B (ship after A, ~1-2d):** correlation lift on existing keywords. Founder approves rule weight changes. Never auto-applied.

**Phase C (paid tier, ~1 week):** per-user vocabulary calibration. Strongest positioning move. Ships after A + B have data.

**Phase D (deferred):** LLM only for genuinely novel phrasing. Not in hot path.

### F6 · Concurrent tracks (paid)

**Concern C confirms multi-program concurrent use as paid.** Design brief already at `dev/design-briefs/2026-08-17-concurrent-tracks-density.md`. ~12-14h behind feature flags.

### F3 (revised) · Coach chat — included, not the pitch

**Concern C:** coach chat as **included-not-marketed** feature. Not a paid pillar. Turn on eventually, don't lead with it.

Worker already built at `worker/src/index.ts`. Env-var-gated OFF in prod. Turn-on cost: ~1 week to productionize with rate limiting + billing hookup.

### F-KILL · Video form analysis as paid pillar

**REJECTED by Concern C evidence.** Do not build the backend AI form check as a paid tier feature. Every attempt in this space since 2016 has failed or pivoted to B2B.

**What we CAN do:**
- Ship exercise demo videos for every drill (**free tier**)
- Feed the Sharpness-completeness surface's "video the retest" checkbox as an OPTIONAL free-tier upload (user films, gets stored in their log, no AI)
- Never charge for AI form analysis

If a beta user asks about form check: point at OnForm / their coach. Don't build it.

---

## Ranked F-track roadmap

| # | Feature | Free/Paid | Estimate | Blocked by |
|---|---|---|---|---|
| 1 | **F1 Path 1** — Signal-completeness surface (no letter grades) | Free | 4-5h | — |
| 2 | **F2 Phase A** — Note-keyword surfacing | Backend | 4-6h | — |
| 3 | **F4** — Garmin FIT ingest (paid) | **Paid** | 3-4wk | Object storage EU region |
| 4 | **F5** — Trend + correlation view (paid) | **Paid** | 1-2wk | 90d log history |
| 5 | **F2 Phase B** — Correlation lift (founder-review) | Backend | 1-2d | F2 Phase A shipped + data |
| 6 | **F6** — Concurrent tracks (paid) | **Paid** | 12-14h | Design brief already filed |
| 7 | **F2 Phase C** — Per-user vocabulary calibration | **Paid** | ~1wk | F2 A+B shipped |
| 8 | **F3** — Coach chat (included, not the pitch) | Free (bundled with paid) | ~1wk | Rate limiting + billing |
| — | ~~Video form analysis as paid pillar~~ | KILLED | — | Concern C evidence |

---

## Remaining P tier polish (post-foundation)

Foundation shipped tonight (`9135bc5`). Remaining P items:

**P2 — mobile UX (~5 items left, ~2h):**
- M2 Programs snap-carousel dots (S) — delete or wire
- M4 Hero stat row wraps at 393px (S)
- M6 body+main compound bottom padding (S)
- M7 ProposalCard two dismiss affordances (S) — X vs Ignore
- M9 OnboardingRunner + iOS soft keyboard (M)

**P3 — visual craft (9 items, ~2h):** V1-V9. **Component-level** — several touch surfaces F1 will change (SignalCompletenessCard). Defer P3 until after F1.

**P4 — copy craft (5 items, ~2h):**
- C1 Landing hero verb "sharpen" doesn't survive to app (S)
- C2 `life_load` label conflict across 6 programs (S)
- C3 Pick-my-focus CTA lacks friction disclosure (S)
- C4 Landing sub-pages don't reference focused-improvement (M)
- C5 Landing 88 studies / library 112 reconciliation (S)

**P5 — motion + perf (2 items left, MO1 + MO3):**
- MO1 `animate-card-in` referenced but not defined (S)
- MO3 Landing font loading verify (S)

**X — cross-cutting (2 remaining):**
- X2 Repurpose old `program` project (Cloudflare dashboard)
- X3 iOS PWA splash images (M)

**Total remaining polish: ~9h.**

---

## Suggested interleave sequence

Ship in this order to avoid the double-polish problem:

1. **F1 Path 1** (4-5h) — signal-completeness surface. Ships free-tier value + primes paid upsell paths.
2. **P2 residual** (2h) — mobile UX. Stable surfaces, unaffected by F1.
3. **F2 Phase A** (4-6h) — note keyword surfacing. Backend-only, doesn't touch UI.
4. **P4 copy craft** (2h) — all 5 items, landing sub-pages + label discipline.
5. **P5 motion** (30 min) — MO1 + MO3 tiny fixes.
6. **F4 FIT ingest** (3-4 weeks) — the paid-tier keystone. Own session sequence.
7. Post-F4: **P3 visual craft** as the "one final audit pass" the founder identified — this is when the new surfaces (SignalCompletenessCard, FIT-connected screens, correlation view) have all landed and can be polished together, not in isolation.
8. **F5 correlation view** — paid tier pillar 2.
9. **F6 concurrent tracks**, **F2 Phase B+C**, **F3 coach chat** — parallel or sequenced based on beta signal.

---

## Research queue (not yet designed, agent-dispatchable)

Ideas surfaced during founder conversation that deserve prior-art research before any implementation call. Each entry frames the question + the specific agent brief. Not on the F track.

### E · Diagnostic intake — bilateral self-report screen with demo videos

**Surfaced by:** founder + friend, 2026-08-17. Prompted by GoWOD's actual model (~500K users, ~$10-15/mo, mobility-focused).

**Corrected mechanism (founder clarification, 2026-08-17):** GoWOD does NOT watch or analyze user video. The pattern is:
1. Video demo shows the user how to perform the movement (e.g. seated forward fold, wall shoulder rotation, forward reach with one leg lead)
2. User performs it, both sides separately
3. User answers a 0-10 slider: "how well / how far did you get?"
4. L / R asymmetry captured cleanly
5. Results feed a weakness map that recommends program(s) to close the gap

**Zero AI. Zero video analysis. Zero measurement equipment.** Just structured self-report with visual guidance + bilateral capture. Trivial technically.

**What we already have:**
- `intake.physical_tests` block on every program JSON (`schemas.ts:physicalTestSchema`)
- Each test: `id`, `label`, `instructions` (text), `unit` (degrees/seconds/reps/kg/m/bpm), `min`, `max`
- Handstand-walk has 5 tests (wrist ext, shoulder flexion, wall hold, cold press, etc.), overhead-mobility more, engine-builder some
- Our existing pattern captures numeric measurement in program-specific units — NOT self-report sliders, NOT bilateral

**What E would ADD to what we have:**
- `demo_video_url` or `demo_image_url` on physicalTestSchema (Concern F resolves the hosting question)
- Optional `bilateral: true` flag → capture L + R separately, engine sees asymmetry
- Optional `self_report_scale: "0-10"` → alternative to numeric unit measurement
- Optional "general movement screen" that runs across all programs at signup, not per-program
- Cross-program synthesis: results feed program picker recommendations ("your left ankle is 3, right ankle is 7 — Overhead Mobility would help; or run engine-builder with the caveat that squat depth may limit you")

**Terav-specific scope discipline:**
- GoWOD is mobility-only. Terav is NOT. Keep the screen SHORT (10-15 movements max) and cross-cutting (some mobility, some balance, some symmetry) so it serves all program types.
- Bilateral asymmetry is the highest-signal component (a program that ignores your L-R gap will keep failing you).
- Every movement in the screen must map onto AT LEAST one Terav program's weakness dimension, or it doesn't earn a slot.

**Question for a future research agent:**

*"For a focused-improvement app that runs alongside your other training (Terav), what's the right diagnostic-intake movement battery? Constraint: 10-15 movements max, no video analysis, bilateral where relevant, self-report + demo video only, must map to Terav's existing programs (engine-builder, concurrent-strength-maintenance, overhead-mobility, handstand-walk, rowing-2k-test-prep, first-strict-pull-up, muscle-up)."*

*Research targets — start with published batteries + Terav's own whitepapers:*
- *Functional Movement Screen (FMS) — 7 tests, industry standard, published sensitivity/specificity*
- *Selective Functional Movement Assessment (SFMA) — clinical version, 10+ tests*
- *Beighton hypermobility scale — 9 measurements*
- *Y-Balance Test — single-leg reach in 3 directions, sensitive asymmetry detector*
- *Thomas test, ankle dorsiflexion knee-to-wall, sit-and-reach — sport-adjacent*
- *GoWOD's public materials — what movements do they use, how do they validate*
- *Kneesovertoesguy ATG assessment battery — published free*
- *NBA / NFL / NCAA combine mobility screens — public methodology*
- ***Terav's own whitepapers*** *at `dev/whitepapers/*.md` — motor learning + handstand-walk sections already reference specific test batteries. Cross-check what we've already documented.*
- ***Terav's own program JSONs*** *— existing physical_tests may already list the right movements per program; a general screen might just be their union*

*Deliverable: `dev/audits/product-concerns/E-diagnostic-intake-battery.md` with:*
1. *3-5 candidate 10-15 movement batteries + trade-offs*
2. *Recommended MVP battery, with each movement mapped to which Terav program(s) it informs*
3. *Data-shape extensions to physicalTestSchema needed to support GoWOD-style bilateral + slider + demo-video*
4. *Cross-reference to Concern F (video demo library) — if we ship the demos, this becomes cheap*

**Do NOT build without the E-brief.** Scope discipline: GoWOD-shaped feature could easily eat the roadmap if we mistake it for a mobility-track feature instead of an intake-tier upgrade. Terav's diagnostic intake serves ALL programs; must stay short.

### F · Video demo library for exercises (free tier)

**Surfaced by:** founder, 2026-08-17. Concern C validates video demos as legitimately free-tier. But: build it ourselves vs. embed YouTube vs. license from a stock library? Storage + delivery cost at scale? Estonian language subtitles? Should each program author its OWN demos or share a global drill library?

**Question for a future research agent:**

*What are the actual delivery + hosting patterns for exercise demo libraries in fitness apps at Terav's scale (10-10K users)? Fitbod embeds YouTube, Hevy hosts its own MP4s, Ladder shoots pro video, MacroFactor has no video at all. What's the cost/quality/legal trade-off? Video accessibility (captions, audio descriptions, playback speed) for WCAG.*

*Deliverable: `dev/audits/product-concerns/F-video-demo-library.md` — hosting patterns, cost estimates, WCAG requirements, build vs. license recommendation.*

### Later additions

- Wearable ingest deep-dive (Garmin FIT vs. Whoop OAuth vs. Oura API — F4 pillar) — has spec at `dev/active/saas-launch/future-features.md`, could use a stronger competitive analysis before starting
- Community / social layer (validated NEGATIVE by Concern C — Terav's positioning rejects streaks + leaderboards — but folks always ask, worth documenting the "no" explicitly)

## Auth polish queued separately (not the F/P track)

Signup + sign-in currently support only email + password. Adds queued:

- **Resend confirmation email** — shipped 2026-08-17 (`sign-up/page.tsx` "Check your email" screen + `sign-in/page.tsx` "Email not confirmed" detected state). Founder observed one beta user (`margussellin112@hot.ee`) sitting in unconfirmed state; without a resend button they'd hit the "email already registered" trap on retry.
- **Google sign-in** — queued. Requires Supabase Auth → Providers → Google enabled + Google Cloud Console OAuth client + callback URL `https://app.terav.fit/auth/callback` (route currently doesn't exist; needs creation). Founder cost: ~10 min (Google Cloud + Supabase dashboard). Code cost: ~1h (add `<SignInWithGoogle />` button on both auth pages, add `/auth/callback` route for the OAuth code-exchange). Total: ~half a day of shared work.
- **Apple sign-in** — deferred until Google ships and signals demand. Requires Apple Developer team ($99/yr) + Sign-in-with-Apple entitlement. Higher setup cost, iOS-first buyer segment though.

## What NOT to do (rejected explicitly)

- ~~Sharpness A/B/C/D letter grades~~ — Concern A says grade data not users
- ~~Video form analysis as paid pillar~~ — Concern C evidence-based rejection
- ~~Re-paywalling any currently-free feature~~ — Strava/Whoop churn warning
- ~~Marketing coach chat as a paid pillar~~ — dilutes the "engine-not-content" positioning
- ~~Cross-user note aggregation at beta scale~~ — Concern D rejection: Strava 2018 / Flo 2021 / 23andMe 2023 precedents; free-text resists safe anonymization; noise-dominated at N < 1000. **Deferred**, not killed — narrow path documented at `dev/audits/product-concerns/D-cross-user-note-learning.md` for future.

## D-brief follow-up: what F2 actually looks like post-D

The D-brief argues cross-user is a **different product**, not a superset of F2 per-user. Concrete change to F2 roadmap:

- **F2 Phase A + B + C stay** — all per-user, no cross-user aggregation needed
- **F2 Phase D (LLM fallback for novel phrasing) reshaped** — becomes: monthly founder-side batch review using the founder's Claude Team seat, per-user (or founder-only aggregate for pattern discovery), NOT a user-facing LLM in prod
- **Cross-user D-path** — deferred until N > 1000 active weekly note-writers AND we've introduced structured toggles as the primary aggregation substrate

**Architecture implication:** you still need Supabase Postgres for F2 Phase A/B/C per-user time-window queries. Cross-user analytics warehouse not needed for years. See `dev/active/product-concerns-2026-08-17/architecture.md` (to be filed if founder approves).

---

## Immediate next action

**F1 Path 1** is the highest-leverage next commit — 4-5h, ships value now, primes the paid ladder without over-committing to grades. Should I start on it, or continue P track polish first?
