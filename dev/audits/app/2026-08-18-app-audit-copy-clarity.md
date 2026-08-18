# Terav app — Copy clarity audit (delta since 2026-08-17)

Scope: microcopy on surfaces that shipped in the 2026-08-17 → 2026-08-18 window.
Source: `next-app/src/**` (no persona artifacts regenerated for this delta pass).
Voice source: `landing/src/i18n/dictionaries/en.ts`.

---

## 0. Prior audit — still open at the top of beta

Two P0s from 2026-08-17 look partially closed. Verify before beta blast.

- **"Every change cites a study" — partially closed.** `ProposalCard.tsx:153-154` now renders a `Because: {reason}` line on every kind, plus a `CitationRef` block when `proposal.citationId` is present (`:219-223`). This is the exact repair recommended in the last audit. Remaining gap: `day_adjustment_soften` and `retest_due` reasons are still log-cited only; no `citationId` is populated in the engine paths I sampled. If landing keeps the claim as-is, the confirm-first proposal shape now supports it — the engine just needs to attach citation IDs on the two categories that don't yet. **P0-carryover.**
- **"Not a streak game" — closed.** `StreakChip.tsx` is gone. `grep -r "StreakChip"` returns nothing in `src/`. No flame icon in the hero. Landing promise now honoured.
- **Onboarding only for anterior-hip — closed by intake wizard.** Every multi-dim program that shipped or was rebuilt (HSW, muscle-up, first-strict-pullup, engine-builder-block-2, overhead-mobility) now has an intake path. Non-multi-dim users still hit the legacy `OnboardingRunner`, which now composes six step files under `components/onboarding/`. That structural fix is out of scope for a copy audit but the 0-10 scale anchor question (P1 last time) is now covered by `ScaleAnchorStep.tsx`.
- **`/coach` empty state (P0 last time).** Still says "Coming soon" (`coach/page.tsx:416`). Not touched in this window. Carry the finding.

---

## 1. Overall verdict

The new `ProposalCard` is the strongest piece of microcopy in the app right now — the `Signal · {phenomenon}` eyebrow, the `Because: {reason}` body, and a kind-specific accept verb ("Apply 20% lighter", "Advance to Cycle 1", "Log reading") are the confirm-first promise made legible on-screen. The two new kinds sit inside that pattern without breaking it. **The single beta-blast risk is the Cluster A/B/C naming** — every other product-facing string in the app avoids clinical framing, but "Cluster A · responding" reads like a research-protocol chip. Second risk: the RetestLoggingSheet leaks an engineering word ("Idempotent") into a user-facing dialog. Third: the physical-test ranges on HSW are the best copy in the intake and might be the best copy in the product — descriptions are concrete, embodied, and testable without a clinician. What still misses: the new milestone 2-line header collapses tightly but the second line's density borders on illegible.

---

## 2. ProposalCard — new kinds vs. old kinds

Comparing across all six kinds (`ProposalCard.tsx:308-346`).

| Kind | Eyebrow | Reason source | Accept verb | Verdict |
|---|---|---|---|---|
| `day_adjustment_soften` | `Signal · fatigue / pain flagged` | engine reason (no citation) | `Apply {N}% lighter` | reference tone. |
| `readiness_after_layoff` | `Signal · you look ready to leave reintro` | engine reason + evidence list | `Advance to {phaseName}` | reference tone. |
| `tier_advance` | `Signal · tier gate cleared` | engine reason | `Advance to {tierLabel}` | reference tone. |
| `tm_bump` | `Signal · headroom detected` | engine reason + lift diff list | `Apply bump` | reference tone. |
| **`non_responder_recommendation`** | `Signal · HERITAGE non-responder pattern` OR `Signal · under-dosing pattern` | engine reason + per-metric verdicts | **`Got it`** | see below. |
| **`retest_due`** | `Signal · mid-block retest window open` OR `Signal · end-of-block retest window open` | engine reason + metric name | **`Log reading`** | see below. |

Findings.

- **`Signal · HERITAGE non-responder pattern`** (`ProposalCard.tsx:320`) leaks the internal project codename "HERITAGE" into user-facing copy. Every other eyebrow is a plain phenomenon description; this one names an internal Phase 4 initiative. Beta users don't know what HERITAGE is and can't google it. **Rewrite: `Signal · not responding to current dose`.** Reserve "non-responder" and "under-dosing" as verdict-level language (they're clinical but concrete and describe what actually happened).
- **`Got it`** (`ProposalCard.tsx:342`) is out of family. Every other accept verb is imperative + specific ("Apply", "Advance", "Log"). "Got it" is dismissive-neutral. If the accept action here is "acknowledge, then go pick a new arc on /programs", the verb should say that. **Rewrite: `Acknowledge` (2 words budget) or `See options` (drops user on `/programs`).**
- **Per-metric verdict rendering** (`ProposalCard.tsx:184-195`) — `{metric_id} ({role}) · Δ {n} at mid-block · {verdict}` reads like a debug dump. `metric_id` is a slug (`vo2max_estimate`). `role` is engine metadata. `verdict` uses `replace(/_/g, " ")` on strings like `true_non_response`. This is the one place in the whole card family where the machine leaks. **Rewrite: `VO2max estimate · +0.4 at week 4 · not responding` (drop role, humanize metric name from a schema lookup, keep the verdict phrase but map `true_non_response` → `not responding`, `under_dosing` → `under-dosing`).**
- **`retest_due` sub-line** — `Week {N} · logging {metricDisplayName} ({unit})` (`ProposalCard.tsx:178-181`) — "logging" is present-tense-gerund, awkward in context because the user hasn't logged yet. **Rewrite: `Week {N} · log {metricDisplayName} ({unit})`** (drops one syllable, makes it feel like a prompt not a status).
- **`Log reading`** as the accept verb is on-family and clear. Keep.

## 3. Cluster A/B/C chip (`HeritageClusterChip.tsx`)

Founder question: too clinical, or right?

Verdict: **too clinical for the chip label; the underlying concepts are load-bearing and should stay.**

`Cluster A · responding`, `Cluster B · under-dosing`, `Cluster C · non-responder` (`HeritageClusterChip.tsx:60-66`). The "Cluster A/B/C" prefix is research-paper vocabulary — Trainerize and Whoop don't ship it. The right-hand phrases are plain English and correct. On the chip surface, the Cluster letter buys nothing the colour doesn't already say (green/amber/red already communicates "one of three states"). Cutting the prefix keeps the taxonomy inside the docs/engine where it belongs.

- **Rewrite:** `Responding`, `Under-dosing`, `Not responding`. Colour still carries the tier signal; the word tells you what it means. If the internal Cluster nomenclature must appear somewhere for consistency with the `non_responder_recommendation` card, put it in the `title=` tooltip that already exists (`HeritageClusterChip.tsx:51`) — not on the label.
- **P0**: `non-responder` reads clinical-cold. Landing tone is warm-dark. `Not responding` (verb, present tense) reads as a state you're in *right now*, which is what the classifier actually says. Match this to the ProposalCard verdict rewrite in §2.

## 4. RetestLoggingSheet copy

`workout/RetestLoggingSheet.tsx`. Sheet title, helper, labels, submit.

| String | Location | Finding | Rewrite |
|---|---|---|---|
| `Week {N} · mid-block` / `end-of-block` | `:67-69` | fine, on-brand. | keep |
| `Log {metricDisplayName}` (h2) | `:70-72` | clear, matches the accept verb. | keep |
| `Recorded {date}. Idempotent — resubmitting today overwrites, not duplicates.` | `:73-76` | **`Idempotent` is engineering vocabulary.** No non-technical user knows what this promises. The reassurance the sentence tries to give ("you won't accidentally double-log") is real and worth keeping. | **`Recorded {date}. Re-submitting today updates this entry — it won't duplicate.`** |
| `Reading ({unit})` | `:80-82` | short, factual, correct. | keep |
| `Intensity compliance % (optional)` | `:99-101` | **Two problems.** (1) "compliance" is coach-speak; landing tone is "sharpens against your log", not "did you comply?". (2) The concept is under-explained above the field — the placeholder does the work but the label doesn't. | **`How closely did you hit the prescribed intensity? (optional)`** for the label; keep the current placeholder as-is. |
| `How closely did prescribed intensity hit? Blank = don't score.` (placeholder) | `:112` | grammatically inverted ("did prescribed intensity hit"). The user hits the intensity, not the other way around. | **`e.g. 90 (you hit ~90% of the prescribed intensity). Blank = skip.`** |
| `Enter a number.` (error) | `:39` | fine. | keep |
| `Compliance % must be between 0 and 100 (or leave blank).` | `:43` | fine. | keep |
| `Log reading` (submit) | `:136` | matches the card verb, kept together. | keep |

Overall: sheet is 90% right. Killing "Idempotent" is the single P0 change; the "compliance" softening is P1.

## 5. Physical-test ranges (HSW: `wrist_ext_passive_deg`, `shoulder_flexion_overhead_deg`)

`public/data/programs/handstand-walk.json:376-427`.

Verdict: **the best microcopy in the app.** Every label anchors to a body-shape reference (fingertips, wall, elbows straight, ribs stay down); every description makes the test actionable without a clinician. This is exactly what the intake needs — Podmajersky-grade "every string is a design decision" energy.

Two small refinements only, both P2:

- `Under 45° — barely bend back` / `About 60° — some bend, no pain` (`:378, 383`) — the degree numbers are there for the engine, not the user. Non-clinicians don't intuitively know 45° vs. 60° in a wrist. The bodily descriptions carry the choice. Keep degrees for engine transparency but demote them: **`Barely bends back — under 45°`** puts the human-legible phrase first, the number as a suffix. Same for the other three wrist ranges and all four shoulder ranges.
- `90°+ — comfortable past vertical` and `Passes behind vertical — hyper-mobile end range` (`:393, 424`) — the top-tier label on shoulder reads slightly medical ("hyper-mobile") in a program that otherwise avoids clinical framing. **Rewrite: `Passes behind vertical without effort`** (drops the diagnostic-adjacent word). The description already covers it.
- The trailing "Rough is fine — the engine adjusts as you log real sessions." (`IntakeClient.tsx:1246-1248`) is a masterclass in permission-granting. Keep.

## 6. WeeklyNarrativeTile expanded disclosure — "How the engine reads you"

`WeeklyNarrativeTile.tsx:183-185`.

The disclosure label is `How the engine reads you`, all-caps in mono via the eyebrow tone. Body content is `SignalCompletenessCard` rendered in `inline` mode.

Verdict: **label is right; body headers are wrong for a disclosure.**

- Label: `How the engine reads you` is on-brand, matches the "sharpens against your log" language on landing, and correctly frames disclosure content as engine-transparency. **Keep.**
- Inside the disclosure, `SignalCompletenessCard` renders `The engine sees` and `Would additionally use` as mono all-caps eyebrows (`SignalCompletenessCard.tsx:45-47, 61-63`). Standalone-mode chrome is stripped in `inline` (correct), but the two internal eyebrows now sit inside a disclosure whose label ALREADY says "How the engine reads you". So the user reads: **"How the engine reads you → The engine sees → …"**. Two headers, same idea, adjacent. Cognitive overhead for zero information gain.
- **Rewrite for inline mode**: drop the "The engine sees" eyebrow entirely (the parent disclosure carries that framing); replace "Would additionally use" with a plainer secondary heading like `To sharpen more, add:`. Two-header collision resolved, and the second heading now names a user action instead of an engine capability.
- Word count of the currently-active section: `{N} signals active · {M} could be added` (`SignalCompletenessCard.tsx:113-115`) reads engineering-forward when it's in the standalone card, and doesn't appear at all in inline mode — no gap.

## 7. Milestone 2-line collapsed header

`progress/page.tsx:409-425`.

Rendered example (from the code): `TM 120 kg · next 140 kg in 40d (+delta)`.

Verdict: **legible in the strength case; illegible in three edge cases.**

- **Case 1 (happy path)**: `TM 120 kg · next 140 kg in 40d (+20.0)` — reads. Green `+20.0` chip explains itself. Good.
- **Case 2 (missed milestone)**: `TM 120 kg · next 140 kg (5d ago) (-20.0)` — the parens-with-negative sits next to another parens-with-time. Two same-shaped tokens in a row confuse the eye. **Rewrite: replace `(Nd ago)` with `— missed Nd ago`** so the two parenthetical shapes don't collide.
- **Case 3 (no TM logged)**: `TM — · next 140 kg in 40d` — the `TM —` reads as a broken value on scan. Match the pattern used elsewhere in the empty-state audit: **`No TM yet · next 140 kg in 40d`**. Slightly longer but the "yet" verbs the reader forward.
- **Case 4 (delta polarity)**: the `+delta` calculation is `currentTM - nextEff`, so `+X` means "you're above target" which reads correct in that direction. But the collapsed header always shows the *next* milestone, which by definition the user is BELOW — so `+delta` will almost always be negative here. The green/red colour split (`:415-419`) handles the polarity visually but the number will nearly always be red in the collapsed view. Consider whether showing "kg to go" instead reads more useful in this exact slot: **`next 140 kg in 40d · 20 kg to go`** trades exactness for readability.
- The trailing emoji `🎉` on `all cleared 🎉` (`:423`) is the only emoji in this file. Landing tone is "not a streak game" — a celebration emoji on milestone clear reads slightly gamified. Non-blocking but noted: **remove the emoji, keep "all cleared"**. The bronze bar filled to 100% next to it already does the celebrating.

## 8. New 3 programs — catalog copy

Comparing `short_description`, `who_this_is_for`, `what_youll_achieve` across `muscle-up.json`, `first-strict-pullup.json`, `engine-builder-block-2.json`.

**first-strict-pullup** — best of the three.
- `who_this_is_for`: `You want a strict pull-up. Some athletes can't dead-hang 15 seconds yet; some do 1-2 reps and want to hit 5. The app meets you where you are and builds each sub-capability separately. Not for kipping pull-ups — that's a different skill.` Meets the reader where they are, names the exclusion. Strong.
- `what_youll_achieve` names concrete numbers per tier (25-45s hang, 3-5 unbroken, 8-10 unbroken). Passes the honesty test. Keep.
- `short_description` uses `→` in `Grip → scap → negative → band → unassisted` — good rhythm. Keep.

**muscle-up** — nearly as strong, but one framing risk.
- `short_description`: `Multi-tier strict ring muscle-up program. Reuses pull-up + handstand drill libraries. False-grip base, transition mechanics, ring dip strength. Not for kipping muscle-ups — different skill, different program.` The "reuses pull-up + handstand drill libraries" is engineering-facing and buys the user nothing. **Rewrite: drop that sentence.** Save the phrase for a dev-doc or a footer credit. The rest of the paragraph is fine.
- `who_this_is_for`: `The transition is the bottleneck — not the pull, not the dip.` This is the sharpest sentence in any catalog blurb we ship. Keep.
- `what_youll_achieve` names weeks specifically ("first strict attempt week 8-10") — matches landing's "we quote ranges, not one number" claim. Good.

**engine-builder-block-2** — dense; borderline for a catalog card.
- `short_description` is 47 words and has three separate technical concepts (threshold cruise, VO2max session, Z1 volume floor). This is a program page, not a catalog card. **On the catalog surface, cut to the first 20 words**: `Block 2 of the 3-block engine transformation. Two hard sessions per week — threshold cruise + VO2max — on top of a rising Z1 volume floor.` Save the rest for the program detail page.
- `who_this_is_for`: `This is a sharp-end block: two hard sessions per week, more time, more intensity.` "sharp-end" reads writerly; on-brand for founder voice but might read jargony to a Norwegian-4x4 beginner. Non-blocking.
- `what_youll_achieve` uses `+4-9%`, `-3 to -8 bpm` — matches the landing "quote ranges" pattern precisely. Best-in-class number honesty. Keep.
- Prereq item 2: `Chest-strap HR monitor strongly recommended — half the block's target zones sit in the range where wrist-optical HR drops out.` Excellent technical honesty. Keep.

Cross-cutting: all three ship with `"status": "PROVISIONAL"` in the manifest. If any of these are visible in the beta catalog, decide whether beta users should see the PROVISIONAL badge — either surface it as a small chip ("provisional — data will refine this") or gate visibility until status flips. Out of scope for a copy audit but a beta-blast risk if it silently ships.

## 9. Priorities

**P0 (beta-blast risk — fix before public beta):**
1. **"HERITAGE" appears in a user-facing eyebrow.** `ProposalCard.tsx:320` → `Signal · not responding to current dose`. Internal codename must not ship.
2. **"Cluster A/B/C" chip labels** → drop the letter prefix, keep `Responding` / `Under-dosing` / `Not responding`. Reserve Cluster nomenclature for the tooltip and internal engine. `HeritageClusterChip.tsx:60-66`.
3. **"Idempotent — resubmitting today overwrites, not duplicates"** → `Re-submitting today updates this entry — it won't duplicate.` `RetestLoggingSheet.tsx:73-76`.
4. **`Got it` accept verb** on `non_responder_recommendation` breaks the family. → `Acknowledge` or `See options`. `ProposalCard.tsx:342`.
5. **Carryover from 2026-08-17: citation IDs on `day_adjustment_soften` and `retest_due` proposals.** The card now renders `CitationRef` when `citationId` is present; the engine paths for these two kinds need to actually populate one for landing's "every change cites a study" to hold. (Engine change, not copy — but the copy claim depends on it.)

**P1 (do this month):**
6. **Per-metric verdict debug-dump** on `non_responder_recommendation` → humanize metric names, drop `role`, map underscore-verdicts to phrases. `ProposalCard.tsx:184-195`.
7. **"compliance"** in `RetestLoggingSheet` → "How closely did you hit the prescribed intensity?" `RetestLoggingSheet.tsx:99-101, 112`.
8. **WeeklyNarrativeTile expanded disclosure — double header collision.** In `inline` mode, `SignalCompletenessCard` should drop the "The engine sees" eyebrow and rename "Would additionally use" → `To sharpen more, add:`. `SignalCompletenessCard.tsx:45-47, 61-63`.
9. **Milestone header edge cases** — no-TM (`No TM yet · next 140 kg in 40d`), missed milestone (`— missed Nd ago` instead of second parens), `all cleared 🎉` → drop emoji. `progress/page.tsx:409-425`.
10. **muscle-up short_description** — drop the "reuses pull-up + handstand drill libraries" sentence. Engineering-facing.
11. **engine-builder-block-2 short_description** — trim to 20 words for the catalog surface.
12. **retest_due sub-line** — `Week N · log {metric}` instead of `logging {metric}`. `ProposalCard.tsx:178-181`.

**P2 (polish):**
13. **HSW physical-test range labels** — swap word order so bodily description leads and degrees suffix: `Barely bends back — under 45°`. Applies to all four ranges on both wrist and shoulder tests. `public/data/programs/handstand-walk.json:376-427`.
14. **Shoulder tier-D label** — `Passes behind vertical without effort` (drop "hyper-mobile").
15. **Milestone bar** — consider `next 140 kg in 40d · 20 kg to go` instead of the always-negative `(-X.X)` chip.
16. **Physical-test skip button** — `Skip all physical tests →` (`IntakeClient.tsx:1282`) → `Skip physical tests →` (drop "all" — there's only one set).
17. **Verify `/coach` route.** Still a "Coming soon" static page since 2026-08-17. If Coach doesn't ship in beta, add a dated milestone + notify-me hook per last audit; if the concept migrated into Profile, delete the route. `coach/page.tsx:416`.

---

Word count: ~1490.
