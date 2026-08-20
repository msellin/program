# Post-ship design-lead calls — 2026-08-20

Owner: product-design-lead
Written: 2026-08-20
Status: draft — awaiting founder review
Related audits:
- `dev/audits/app/2026-08-19-founder-observations-queue.md` (O1-O21; O18-O21 post-ship)
- `dev/audits/app/2026-08-19-master-task-list.md` (Batch 28-32 shipped; §G rejected list — HARD CONSTRAINT)
- `dev/audits/app/2026-08-19-founder-obs-design-lead.md` (prior four-decision brief)
- Fresh persona artifacts (mtime 2026-08-19 15:00) — still valid; the F8-second dashboard split is additive to shape
- `next-app/src/components/session/TodaySession.tsx:481-577` (current dashboard render)
- `next-app/src/components/DashboardBlock.tsx` (F9 primitive)

Blocks: Batch 33 shape, S3 sequencing, F5 correlation trigger conversation.

---

## Executive verdict — "if Terav does one thing next, it's X"

**Ship Batch 33 as a focused DashboardBlock v2 pass (O19 + O21 together) — one deliberate visual-perception push, benchmarked with pre/post persona screenshots, gated on a measurable "does it feel different?" harness.** Do not ship the visual refresh as a series of small polish PRs — that spreads risk and mutes the perceived change. Do not sit on the app to "let it settle." The founder's O19 read ("I don't really see a big dashboard change") is the load-bearing signal: the dashboard skeleton is correct, but its *chrome* under-shoots. The fix is a visual-perception increment, not another IA increment. O20 (Extras integration) is already shipped at MVP quality — do not go deeper this batch. O22 (billing/S3) is real and next-after but must not co-ship with a visual refresh; monetization deserves its own audit cycle.

**Why (three-line summary):**
- The dashboard skeleton is right — O19 is a *skin* problem, not a structure problem. Reskin, do not restructure.
- Shipping O19 + O21 together turns two "meh" observations into one visible batch; splitting them means the founder feels two half-changes and still says "1995."
- The remaining strategic work (S3, S4) is founder-scope, not designer-scope; billing has zero design blockers this quarter.

---

# Call 1 — Dashboard perceptual weight (O19)

## The call

**Ship option (b) — redesign the DashboardBlock summary card as a hero variant WITHIN the existing primitive.** Not (a) polish-only; not (c) full three-column restructure. The primitive stays; a `variant="hero"` prop unlocks stronger visual language for the workout summary specifically, and Extras / Morning check / Proposals stay at the current neutral weight so the workout block is unambiguously *the* focal point of Today.

### Root-cause diagnosis first

O19 has three candidate causes. Ranking by likelihood after reading `TodaySession.tsx:481-534`:

1. **Genuine visual under-shoot (95% confident).** The current summary block reads: mono-caps eyebrow ("Today"), 16px title with a *count* string (`3 blocks · 12 exercises`), 14px phase lede, muted bullet list, one bronze CTA. That's a spec-sheet, not a dashboard hero. The primitive was designed to be neutral so it could be reused five ways — but the *primary content* of Today deserves stronger visual weight than "Extras" or "Morning check." Neutrality across surfaces made the summary block invisible.
2. **Expectation gap (5% confident).** Founder cited Garmin/Whoop. Those apps use readiness rings, streak counters, animated tick-completions — most of which Terav rejects (R5 gamification, R8 autonomous score-hero). Some expectation delta is unavoidable given constraints. But the current chrome under-uses even the levers Terav *does* have (typography, density, single-surface accent).
3. **Cache (dismissed).** Deploy landed; founder confirmed structural delta (5 cards → 1 card) — they're looking at the shipped bundle. This isn't a cache miss.

### The move — DashboardBlock v2 with a `variant="hero"` prop

The hero variant applies **only** to the workout summary block. Everything else on Today keeps the neutral variant. Result: one visual focal point per Today screen, matching Refactoring UI's "one primary emphasis per view" discipline.

**Hero-variant deltas from neutral:**

| Attribute | Neutral (existing) | Hero variant (new) |
|-----------|-------------------|-------------------|
| Container padding | `px-4 py-4` | `px-5 py-5` |
| Border | `border border-line-soft` | `border border-line-soft` + left-edge `border-l-4 border-l-bronze` |
| Eyebrow | 10px mono muted | 11px mono `text-strong` (not bronze — accent economy) |
| Title | 16px semibold | **20px semibold** (title bumps one tier; still under R3's 32px H1 ceiling) |
| Metric line | absent | **NEW** — one line of hero-typographic content between title and lede |
| Lede | 14px muted | 14px muted |
| Body list | 13px muted bullets | 13px muted bullets — unchanged |
| CTA | bronze fill 14px | bronze fill 14px — unchanged |

The `hero` variant does *not* invent new color, motion, or iconography — Terav's rejected list rules those out. What it adds is **one line of hero-typographic content**: a numeric-forward metric that reads at a glance and answers "what is today?" before the user parses the block list.

**Hero-metric candidates (pick per-program via a `hero_metric` field, or derive):**
- Anterior hip: `48 min · 3 blocks` in 24px mono numeric
- Engine Builder: `4×4 intervals · Z4` in 20px mono
- 5/3/1: `Press day · TM 55 kg` — mixed numerals + label
- Skill: `Handstand walk · 4 sets` — count-forward

**Wireframe (mobile 393px, hero variant applied):**

```
+---------------------------------------------------------+
| TODAY · ANTERIOR HIP REBUILD                            |  <- 11px mono strong
|                                                         |
| Barbell reintro session                                 |  <- 20px semibold
| 48 min · 3 blocks                                       |  <- 24px mono numeric (HERO METRIC)
| Phase 2 · Week 3 of 6                                   |  <- 14px muted lede
|                                                         |
| · Scapular pull ladder                                  |  <- 13px muted (unchanged)
| · Shoulder + grip prep                                  |
| · Row strength                                          |
|                                                         |
| [ Open session → ]                                      |  <- bronze CTA (unchanged)
+---------------------------------------------------------+
```

Two-persona check:

- **persona-recover** (rehab, cautious): hero-metric = duration + block count. Rehab users want to know "how long, how many things"; hero-metric answers directly.
- **persona-strength** (overperformer): hero-metric = "Press day · TM 55 kg" — surfaces the lift + load, which is the emotional anchor for a 5/3/1 user. Numeric-forward.
- **persona-erratic** (skips): hero-metric = same as recover; if session is paused, hero-metric absorbs a `Paused · resume when ready` string in muted, no bronze CTA. Absence is honest (R6).

### Why not (a) polish-only

Polish-only means shipping typography tweaks + `--color-surface-2` + a hover state layer. That's what visual-craft would default to. It's incremental and honest but it will NOT close O19 — the founder is not asking for cleaner, they're asking for *different*. Polish doesn't cross the perception threshold.

### Why not (c) full 3-column restructure

The three-column dashboard (readiness ring + workout + extras / recovery) is a Whoop/Garmin structural pattern that fights R8 (no autonomous score-hero) and R5 (no gamification). It also breaks single-column mobile-first rhythm — 393px isn't wide enough for a 3-column layout without collapsing to stacked-column-on-mobile, which is what we already have. Restructuring introduces migration risk for zero perception gain over hero-variant.

**Rejected counter-argument:** "hero variant is just a bigger card — same thing polish would do." No. Polish is 12 small changes across the primitive. Hero variant is one prop with one clear visual identity that names the workout summary as the primary emphasis. Different intent, different diff shape.

**Cost:** 4-6h. Add `variant` prop to `DashboardBlock`. Add `hero_metric` field (optional) to program schema OR derive from block metadata. Wire up on the workout summary render in `TodaySession.tsx:499-533`. Ship the token bump for surface-2 if visual-craft's brief lands with it.

---

# Call 2 — Extras integration on Today (O20)

## The call

**Ship (a) as the final answer — the current MVP ExtrasBlock stays as-is until beta-user data proves it's under-used.** Do not inline-expand (b). Do not inline-log (c). The MVP is the correct scope for beta.

### Why not (b) inline expansion

Inline expansion collapses `/extras` into a Today accordion. Two problems:

1. **Route economy.** `/extras` is a real route with filtering, program-context switching, and per-drill deep-linking (guide + logging). Collapsing it into Today's accordion duplicates the surface and creates two truths for "how do I see extras?" — the Today dashboard block or the /extras route. Users learn one, the other rots.
2. **Density on multi-track.** persona-strength runs 2-3 tracks. Each track's extras would want expansion; three inline-expanded ExtrasBlocks stacked below the workout blocks buries the CTA below the fold on 393px. The `Open extras →` route hand-off is faster.

### Why not (c) inline logging (Garmin-style)

Inline logging on Today is the Garmin/Whoop pattern the founder cites — "tap to mark done." Two problems:

1. **Confirm-first violation.** Marking an extra "done" from a summary card is a silent mutation of the log. The rest of Terav requires ConfirmSheet + primary Accept verb for any log write. Inline-tap-done breaks that contract for one surface and creates a "quiet-write" precedent that will leak into other blocks.
2. **Data quality.** An accessory logged from Today without opening the drill means we don't get the reps/duration/notes fields. Terav's log schema is intentionally structured (`daily_log_schema`) — an inline tap-done creates malformed log rows that break downstream analytics (correlation view, retest-window signals). Not worth the ergonomic win.

### Why (a) is the right call for beta

The MVP ExtrasBlock shipped in `dccab37`:
- Names count ("N drills available")
- Previews up to 4 drill names
- Hands off to `/extras` where the real logging happens

That IS the Garmin pattern applied honestly to Terav's constraints. Discoverability solved (users see there are extras on Today). Density controlled (one block, ~120px tall collapsed). No confirm-first violation. No data-quality regression.

**Trade-off named:** users tap through one extra route hop to log a drill. Cost: ~0.5s per log. In exchange: correct schema writes, confirm-first preserved, single truth for extras surface. Ship it.

### When to revisit

If persona-erratic or persona-strength artifacts show `<10%` extras engagement after 30 days of beta, revisit with inline logging **as a per-drill affordance INSIDE the DashboardBlock body** — a "mark done" button below each drill name that opens a ConfirmSheet, not a silent write. That's the confirm-first-honest version of (c). Not this batch.

**Cost this batch:** 0h. Ship-as-is.

---

# Call 3 — Visual refresh (O21) shipping cadence

## The call

**Ship option (c) — the visual refresh ships ONLY if it measurably moves the "1995→2026" needle in a fresh persona-harness audit.** Not (a) single big-bang; not (b) drip of small PRs. The harness screenshot diff IS the success criterion.

### Why not (a) single Batch 33 big-bang

Single-batch visual refresh with typography + motion + surface-2 + DashboardBlock v2 all at once is 20-30h of coupled changes. High regression risk. If persona harness breaks, the diff is unreadable — was it the motion tokens, the type scale, or the surface-2 rollout? Split diagnosis kills the audit cycle.

### Why not (b) drip of small PRs

Small PRs are safer per-diff but mute the perceived change — the founder just told us in O19 that incremental structural change reads as "meh." Incremental visual change will read the same. The whole point is to cross a perception threshold.

### Why (c) benchmarked-refresh

Ship Batch 33 with these coupled changes:

1. **DashboardBlock v2 hero variant** (Call 1 — the load-bearing move)
2. **Surface-2 token** (`--color-surface-2` for nested surfaces inside blocks — exercise cards, extras list rows). One new token, well-justified.
3. **Typography bump** on hero elements (H1 32→36 or 40 per visual-craft; hero-metric 20-24px mono; eyebrow 10→11px on hero variant only)
4. **Motion tokens** — one entry-animation for DashboardBlock (200ms fade-in-up with `prefers-reduced-motion` fallback; `app-motion-perf` owns the spec)
5. **Sparkline on Progress** — subtle inline sparkline on PerProgramAdherenceCard (data-viz as first-class, not text-only). This is the one place data-viz earns its pixels without R8 violation.

### Success criterion — the harness diff

Before Batch 33 lands: capture `next-app/tests/e2e/artifacts/personas/*/mobile/today.png` for all 14 personas. That's the "1995" baseline.

After Batch 33 lands: regenerate the harness. Diff comparison is a design review, not a pass/fail — the founder eyeballs 3 personas (recover, strength, erratic) side-by-side and answers:

- Does the workout summary read as *the primary emphasis* now, or still as "another card"?
- Does the block hierarchy scan in <2 seconds on the mobile artifact?
- Does the app feel *contemporary* or still like a spec sheet?

If two of three are yes: ship. If not: iterate the hero variant or type ramp before rollout. This is the "no UI churn between audits" rule applied to visual refresh specifically — the harness IS the audit gate.

### What to NOT include in Batch 33

- **Photography** — R1, stays rejected.
- **Streak counters, completion percentages, week X/Y hero widgets** — R5, R8.
- **Second primary accent** — R2. Bronze stays alone.
- **Light theme** — deferred; a light palette is a multi-day authoring pass, not a token swap. Settings row already flagged as "coming soon."
- **Video / animated illustrations** — motion is one entry-animation, not decorative loops.

**Cost:** 10-14h. DashboardBlock v2 (4-6h) + surface-2 token wiring (~2h) + type ramp (~2h) + motion tokens (~2h) + Progress sparkline (~2h). Coordinate with `app-visual-craft` (owns the type ramp + surface-2 hex value) and `app-motion-perf` (owns the entry animation spec + reduced-motion path).

---

# Call 4 — Order of remaining work

## The call — top 3 ranked

**1. Ship Batch 33 (visual refresh — Call 1 + Call 3 combined).**
**2. Take a beat and let the app settle — run beta signups against the refreshed shape for 2 weeks.**
**3. Start S3 (billing / Paddle) authoring in parallel — no design blockers, founder-scope.**

### Detailed ranking

**#1 — Batch 33 visual refresh (7-14 day slot).**

Rationale: O19 + O21 are the founder's most recent observations — they're the highest-signal signal. Founder just walked the app and said "1995." That's not a bug backlog; that's a product-integrity call (Marty Cagan: what the customer experiences IS the product). Fixing it now, before beta signups accelerate, means the first batch of real users sees the refreshed shape, not the "meh" version. Every week we ship this later, the "1995" impression compounds. Coupled with Call 1, this is one coherent design push, one PR series, one persona-harness regeneration. Do it first.

Risk: visual-refresh work has a well-known tendency to drift into perfectionism. Cap the appetite at 14h (Ryan Singer — quality does not decide scope; scope decides quality). If we can't move the "1995→2026" needle in 14h, we're overthinking the levers; ship what we have and iterate later.

**#2 — Take a beat (2-week settle window).**

Rationale: post-Batch-33, the app has shipped four major surfaces of change in three weeks (F8, F8-second, F9, F10, F11, F12, Batch 33). The founder's own memory file says "no UI churn between audit cadences." A 2-week settle window with beta signups actively rolling in is exactly the audit input we lack — real users clicking real bronze buttons on the refreshed shape. Without that data, S3 (billing) is a guess about willingness-to-pay against a "meh" app that no longer exists. Wait, gather, then decide S3 timing.

What "settle" means concretely:
- No UI-visible commits for 2 weeks post-Batch-33
- Bug-only merges allowed
- Persona harness re-runs on any accidental UI touch
- Beta-signup metrics collected: session-open rate, first-week retention, extras engagement, morning-check completion rate

Risk: 2 weeks is a long time for a founder in fast-ship mode. Counter: fast ship is what got us to "meh." Deliberate ship is what gets us out.

**#3 — S3 billing (parallel authoring, no design blocker).**

Rationale: S3 is a founder-scope decision — Paddle integration, tier pricing, free-vs-paid feature gates. There is no design work blocked on Batch 33. Founder can be reading Paddle docs, drafting pricing pages, and wiring the S3 backend during the settle window. When the settle window closes and beta-user data is in, S3 goes from "founder decision" to "founder ships." Don't sequence billing behind Batch 33 — sequence billing behind *beta data from Batch 33*.

Two design constraints on S3 for the future brief:
- Paywall placement must NOT interrupt an in-progress session. Interruption during work is a trust-loss moment.
- The `Add second program` action is the one clear paywall trigger (multi-track is the paid feature per user memory). Every other free feature stays free.

### The rejected options

**Ship the Extras integration deeper (O20 option b/c).** Rejected per Call 2 — the MVP is correct for beta. Deeper integration is post-beta-data work.

**Move to F5 correlation view (S4 blocker).** Rejected. F5 needs N users × 90 days of data before the visualization has anything to plot. Building it now means building against synthetic data, which is the definition of "solution looking for a problem." Trigger this when the beta hits ~10 users with 30+ days of logs.

**"Just do S3 first, monetization is the priority."** Rejected. Monetizing an app the founder calls "1995" is monetizing the wrong version of the product. Fix the perception first; charge second.

---

# Rejected alternatives — the ones NOT chosen and why

- **Full three-column dashboard restructure (Call 1 option c).** Rejected. Fights mobile-first single-column rhythm and R8. Cost too high; perception gain likely negative.
- **Inline extras logging on Today (Call 2 option c).** Rejected. Confirm-first violation + log schema regression. Revisit as a per-drill ConfirmSheet affordance after beta-usage data if extras engagement is low.
- **Big-bang single-batch visual refresh (Call 3 option a).** Rejected. Unreadable regression diff, high risk, no measurable gate.
- **Drip of small polish PRs (Call 3 option b).** Rejected. Mutes perceived change; O19 is already a "small change didn't land" signal.
- **Ship S3 (billing) before Batch 33.** Rejected. Monetizes the "meh" version. Fix perception; charge second.
- **Ship F5 correlation view now.** Rejected. Insufficient data. Set trigger at N ≥ 10 users × 30 days.
- **Add a "streak" or "completion %" widget to Today for engagement feel.** Rejected. R5 violation. Perceived-engagement wins that betray the confirm-first contract will cost more trust than they buy.

---

## What Batch 33 does NOT solve

- **Light theme** — Settings row is a placeholder. Multi-day palette pass; defer.
- **i18n extraction** — Settings row placeholder. Defer until a second language is on-deck.
- **F5 correlation view** — data-gated. Defer per Call 4.
- **S3 billing UI** — founder-scope, parallel authoring, defer to post-settle-window.
- **Progress tab restructure** — Progress gets ONE new element (sparkline). Full restructure is a separate brief when Progress needs it.
- **History tab** — untouched. Current heatmap + row-log pattern stands.
- **QA-1 shipping-log-drift protocol** — small process fix, ship anytime as a script; not blocking Batch 33.

---

## Estimated implementation cost

- **Call 1 (hero variant):** 4-6h, high confidence — one prop + one field + wireup.
- **Call 2 (extras):** 0h, ship-as-is.
- **Call 3 (visual refresh coupling):** 10-14h combined with Call 1 (call it Batch 33 total).
- **Call 4 (settle window + S3 parallel):** 0h designer time; founder-scope.

**Batch 33 total: 10-14h. High confidence on the shape; medium confidence that it moves the "1995→2026" needle in one pass — the persona-harness diff is the honest gate.**

---

## Coordination with visual-craft's parallel brief

The visual-craft agent is producing a warm-dark 2026 refresh brief in parallel. When their brief lands, reconcile with this one on three points:

1. **Type ramp for hero variant.** This brief specifies 20px title / 24px hero-metric mono / 11px eyebrow strong. Visual-craft may propose different values against WCAG contrast + rhythm math. Their values win; the hero-variant *structure* stays as specified here.
2. **Surface-2 token hex.** This brief calls for `--color-surface-2`. Visual-craft computes the exact hex against surface + line-soft contrast pairs. Their hex wins.
3. **Motion token spec.** This brief specifies 200ms fade-in-up with `prefers-reduced-motion` fallback for DashboardBlock entry. `app-motion-perf` owns the exact easing curve + reduced-motion instant-render path.

If visual-craft proposes anything that violates R1/R5/R8 (photography, gamification, autonomous score-hero), this brief overrules. Otherwise, they own the pixel math; this brief owns the structural call.

---

## Delegate-to-specialist checklist

- **app-visual-craft** — hero-variant type ramp + surface-2 hex + Progress sparkline chart tokens. Type-ramp WCAG 1.4.3 compliance on all four palette contexts. Reconcile with parallel refresh brief.
- **app-motion-perf** — DashboardBlock entry animation spec (200ms fade-in-up) + reduced-motion fallback path + verify no cumulative layout shift regression on hero-metric render.
- **app-mobile-ux** — verify hero-variant CTA remains in thumb zone at new padding (`py-5`); verify hero-metric at 24px does not push CTA below viewport fold on 393px × 812px iPhone SE class device.
- **app-accessibility** — `variant="hero"` must not regress heading semantics; verify `aria-label` on hero-metric numerals (they're semantic content, not decoration); verify `prefers-reduced-motion` respected in entry animation.
- **app-copy-clarity** — hero-metric strings must fit within 24 characters (mobile line-fit). Draft copy for the 5 program archetypes: hip (`48 min · 3 blocks`), 5/3/1 (`Press day · TM 55 kg`), engine (`4×4 intervals · Z4`), skill (`Handstand walk · 4 sets`), rowing (`2K time trial · pace 1:52`). Refine per program.

---

**Ship Batch 33. Take a beat. Then talk billing.**
