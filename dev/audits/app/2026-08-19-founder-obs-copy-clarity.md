# Terav app — Founder-observations copy-clarity assessment (2026-08-19)

**Scope**: O5a, O5b, O10c, O13, O14a, plus tone-drift scan of the queue's founder-cited language.
**Personas verified against**: `persona-strength` (01-today, 06-programs, 03-coach), `persona-erratic` (01-today, 04-history, 06-programs).
**Voice source**: `landing/src/i18n/dictionaries/en.ts:6-80`.

## O5a — PROVISIONAL leaks past the legend

**Verdict**: **HIDE**, don't legend. Copy-fix option (2) — "add PROVISIONAL to the legend" — is wrong. It permanently legitimises what the code at `next-app/src/app/programs/page.tsx:234` explicitly calls a "legacy status … being migrated to Referenced." You'd be documenting technical debt as a public trust tier.

**Captured evidence**: `persona-strength/text/06-programs.txt:48, 56, 86` — three programs render "PROVISIONAL" chips with no legend entry. Users see a fourth state that the paragraph above (`06-programs.txt:7`) doesn't define. That's the classic "debug variable leaked into production copy" tell.

**Recommendation**: Option (3) from the queue (hide PROVISIONAL programs from the catalog, same filter as `personal:true`) plus a one-shot data-migration to promote or demote each of `engine-builder-block-2`, `first-strict-pullup`, `muscle-up`.

Rationale — three arguments stacked:
1. **Trust-ladder integrity**: the whole point of the legend at `programs/page.tsx:126-130` is to make the confidence gradient legible. A fourth tier called "provisional" (meaning "same as Referenced but not yet migrated") is legalese users can't parse and shouldn't have to.
2. **Voice consistency**: `landing/en.ts:10` promises "Every change cites a study" and `en.ts:67` says "126 primary studies. Every session cites its research." A "provisional" chip broadcasts "citations may not be ready" — undermines the landing promise on the exact surface (`/programs`) where trust conversion happens.
3. **Cheapest path**: the manifest at `next-app/public/data/programs/manifest.json` already supports `personal: true` filtering. Add a `status: "PROVISIONAL"` filter on the same predicate. Three programs disappear; catalog cleans up in one commit. Founder's implicit preference of "promote all three" is more work (per-program citation audit) with the same ship-quality endpoint.

**Rewrite for the catalog empty-adjacent case** (if a category ends up empty after PROVISIONAL hide): current `programs/page.tsx:177` reads "Nothing in this category yet. Try another, or check back — the catalog is growing." That's fine — orients, motivates, guides. Keep.

**If founder insists on legending PROVISIONAL** (rejected but if): the string must reframe from "legacy alias" to a real fourth-tier meaning. Proposed: `PROVISIONAL = drafted from evidence, harness not yet passing.` But this locks in migration debt. Don't.

## O5b — How does a program earn REVIEWED / VERIFIED

**Verdict**: The three-tier ladder is currently **making a promise the app has no process to keep** — zero programs are REVIEWED, zero are VERIFIED, and there's no user-visible mechanism for either. That's a landing-alignment gap (`app-landing-alignment` owns the gap audit) but the copy fix is mine.

**Recommendation — two-part copy delivery**:

**Part 1**: An info sheet accessible from the legend on `/programs`. The three coloured terms (`referenced`, `reviewed`, `verified` at `programs/page.tsx:127-129`) become tap-targets that open an existing-pattern bottom sheet (Terav has `ConfirmSheet`, `MoveSheet`, `PrimaryPicker` — reuse the same pattern for consistency). No new route. Sheet content, verbatim:

```
How programs earn each status

REFERENCED — default state
· Every claim in the program cites a peer-reviewed paper.
· The adaptive engine passes the simulator harness across archetypes
  (novice, intermediate, advanced) without stalling.
· Written by Terav; not reviewed by an outside specialist.

REVIEWED — external audit complete
· A named domain specialist (physiotherapist, coach, or sport
  scientist) has audited the citations against current literature.
· They record which references they checked and on what date.
· Not endorsed — audited. They flag anything they'd change.
· Currently: 0 programs at this tier. First target: Overhead Mobility
  (physiotherapist review, Q4 2026).

VERIFIED — 5+ users completed the arc
· Five or more real users have completed the full arc.
· Each rated the outcome vs. what the program promised.
· This is field evidence, not endorsement.
· Currently: 0 programs at this tier. Unlocks as beta users graduate.

Every program starts at Referenced. We don't ship anything below that.
Some programs will never leave Referenced (small user base = no
Verified) and that's honest.
```

**Word count**: ~180. Longer than the 40-word empty-state budget, but this isn't an empty state — it's disclosure. Ginny Redish rule: for trust-decision content, users scan headings first; give them the ladder, then let them read the tier that matters to them.

**Where it lives**: bottom sheet from `/programs` legend tap. NOT a new `/status` or `/how-status-works` route — that fragments IA. Founder's queue O4 is collapsing top-nav to Settings only; don't add discoverable routes. If desktop needs it too, same content renders inline in `/evidence` as a section (already the trust-evidence home).

**Part 2 — honesty callout on the catalog**. Add one line below the legend at `programs/page.tsx:126`:

```
All 5 programs shipped today are REFERENCED. Higher tiers unlock as
specialists audit and as users complete arcs. That's the ladder — not
a marketing gradient.
```

This closes the "why is nothing REVIEWED" question in the founder's original observation without waiting for the sheet to be tapped. Word count: 38. Under budget.

**Tone check against landing**: `landing/en.ts:78-79` — "Not certain about you. VO2max response varies ~10× person-to-person. We quote ranges, not one number." That's the honesty voice. The Part 2 callout matches it. Do NOT hedge with "we're working on it" or "coming soon" — the queue's own `en.ts:53` already says "Five programs live. Three more in build." That register (specific, dated where possible, no marketing hype) is the reference.

## O10c — Tier-placement disclosure when signals are incomplete

**Verdict**: This is both a **real engine issue** AND **a copy failure** — copy can't paper over the misplacement but can honestly name why the engine defaulted. The engine call goes to `app-landing-alignment` / whoever owns the intake logic. My job: what does "How this was picked" say?

**Current state**: `IntakeClient.tsx:539-544`:

```tsx
<details className="text-[12px] text-muted">
  <summary className="cursor-pointer hover:text-ink">How this was picked</summary>
  <p className="mt-1">Based on: {formatVars(inferred.vars)}</p>
</details>
```

That's a debug dump wrapped in a `<details>`. It shows raw variables — the exact same failure pattern Torrey Podmajersky flags: "if it needs explaining, you shipped the model, not the copy."

**Rewrite (proposed content model for the disclosure)**:

The disclosure should have three tiers of content depending on signal completeness. Every branch has to name which signals fired and which didn't. The founder's case (3-5 strict reps intake answer + skipped physical tests → Tier A) is the "signal conflict" branch.

**Branch A — Complete signals, engine confident**:
```
How this was picked

We used:
· Your intake answer: [answer, e.g. "3-5 strict reps"]
· Your physical test: [test name, e.g. "6 strict pull-ups today"]
· Your session history: [N sessions of pull work in the last 4 weeks]

The physical test carries the most weight because it's a measured
number. The intake answer confirms it. This is a confident pick.
```

**Branch B — Physical tests skipped, intake alone (the founder's case)**:
```
How this was picked

We used:
· Your intake answer: "3-5 strict reps"
· Physical tests: you skipped these

Skipped tests default us conservative — we start you lower rather
than higher, because starting too heavy risks injury and starting
too easy costs one week you can skip past.

If "3-5 strict reps" is accurate today, Tier C is the honest
starting point. Tap Tier C below to switch — or run the physical
tests from Profile → Programs to let the engine pick with full
signal.
```

**Branch C — Signals conflict (intake says advanced, test shows novice or vice versa)**:
```
How this was picked

Your signals disagree:
· Your intake answer suggested [X]
· Your physical test showed [Y]

We defaulted to the more conservative of the two. Retesting closes
the gap fastest — or override below if you know which one reflects
today.
```

**Key copy principles used**:
1. **Name the signal weight explicitly** ("physical tests skipped → conservative default"). This is what Erika Hall means by "copy as evidence of thinking."
2. **Give the user the override affordance in the same sentence** ("Tap Tier C below to switch"). The `programs/page.tsx` intake wizard already has the override list at `IntakeClient.tsx:550-588`; disclosure should point at it.
3. **Kill "Based on: {formatVars(inferred.vars)}"** — that string will never be user-parseable.

**Engine-side note (out-of-scope but flagged)**: If the intake answer literally says "3-5 strict reps" and the engine still picks Tier A ("No hang yet"), the intake→tier weighting rule is broken. Copy shouldn't cover for that. → **see general-purpose O10c investigation — root cause: missing proxy tables in `intake-tier.ts:258-327`. Fix is code, not copy.**

**Word budget**: each branch is 45-75 words. That's over the "error toast ≤ 15 words" but this is disclosure content, not an error. Steve Krug rule: users tap "How this was picked" only when they doubt the recommendation — give them enough content to trust or override. Terser than that leaves them stranded.

## O13 — Readiness-dot + green banner both say "green"

**Verdict**: **Kill the header dot, keep the banner.** Founder's queue draft got the trade-off right — the banner is informative, the dot is silent — but I'd go stronger.

**Captured evidence**: `persona-strength/text/01-today.txt:20-21` shows the banner: `GREEN · Progress load. Nothing above 3/10 in your check.` That's 12 words doing three jobs (orient, motivate — sort of — and guide via "progress load" verb). Ginny Redish 3-job test: **passes**.

`AppShell.tsx:199-215` — the ReadinessDot component is a 2px filled circle with `aria-label="Today: green"`. That's decorative-tier state. It doesn't tell you WHAT green means, it doesn't route anywhere (no click handler), and it costs a slot in the wordmark strip that O2 + O4 are already trying to reclaim.

**Rewrite for the winning surface** (the banner at `HeroStateCard.tsx:10-18` — already good, minor sharpening):

Current:
```
green: { title: "Green", sub: "Progress load. Nothing above 3/10 in your check.", tone: "green" }
amber: { title: "Amber", sub: "Hold load. A 4-5/10 or morning stiffness over 30 min.", tone: "amber" }
red:   { title: "Red",   sub: "Back off. Something above 5/10 or a red flag noted.", tone: "red" }
```

**Proposed refinement** (keep, don't rewrite — the current strings are Terav-voice):
```
green: title "Green" · sub "Progress load — nothing above 3/10 today."
amber: title "Amber" · sub "Hold load — a 4-5/10 or stiffness over 30 min."
red:   title "Red"   · sub "Back off — something above 5/10 or a red flag."
```

The changes: en-dash instead of period+space (tightens the reasoning link), drop "in your check" (redundant — user knows they logged the check), "today" on green (matches the "Rest day" / "Hold load" register on amber/red). Not a rewrite — a polish.

**What to delete**: `AppShell.tsx:199-215` ReadinessDot entirely. It's not adding a job the banner doesn't already do.

**Cross-ref**: this reinforces O2/O4 (header IA trim). Header collapses to `TERAV · Settings`; state lives in content. That matches Whoop *only* on the dot pattern; Terav's confirm-first tone works better with the banner ("Progress load" is a verb the user acts on) than with an ambient dot ("you have some state, ok").

## O14a — Exercise-name parenthetical modifiers

**Verdict**: **Sub-title, not parenthetical.** Founder's instinct is right — the modifier is important context (a novice about to search for "hang" gets a fundamentally different exercise than "hang scap-engaged"), so truncating it corrupts the whole name.

**Captured evidence**: from `next-app/public/data/exercises.json:2819` — `"name": "Active hang (scap-engaged)"`. And `:3612` — `"Band shoulder prep (I-Y-T + face pull)"`. Terav has ~24+ exercises with this pattern in the pull/mobility drill library.

**Copy-model recommendation**:

**Structural change** — extract the parenthetical to a distinct field on the exercise. Schema:

```json
{
  "name": "Active hang",
  "variant": "scap-engaged"
}
```

Instead of concatenating into a single string. Then the card renders:

```
Active hang
scap-engaged · 3 sets
```

With the base name at `text-[15px] font-semibold text-strong` and the variant at `text-[12px] text-muted` on the line below. This maps to Refactoring UI's "de-emphasise secondary information" pattern — visual hierarchy carries the read, no truncation risk.

**Why not just line-clamp-2**: because "Active hang" and "Active hang (scap-engaged)" are meaningfully different drills. If the card wraps to `Active hang (scap-\nengaged)` at narrow widths, the second word looks like a suffix, not a variant. The two-line structure with base + variant explicitly labeled reads correctly at every width.

**Why not just widen the card**: card width is driven by BlockSection layout, not exercise-name length. Widening to fit long names steals space from proposal cards and the extras block on Today.

**Renames required in `exercises.json`** — quick pass:
- `Active hang (scap-engaged)` → `name: "Active hang"`, `variant: "scap-engaged"`
- `Band shoulder prep (I-Y-T + face pull)` → `name: "Band shoulder prep"`, `variant: "I-Y-T + face pull"`
- `Band shoulder prep (light)` → `name: "Band shoulder prep"`, `variant: "light"`
- (Grep the file, likely 20-30 exercises follow this pattern.)

**Displayed-anywhere check**: exercise names appear in ExerciseCard, in Coach proposals ("block pull (midshin)" — see `persona-strength/text/01-today.txt:16`), in Progress top-lift charts (per P1-66 shipped Batch 27), and in Report. The variant field would need to render or fall through on each surface. Coach proposal line at `persona-strength:01-today.txt:16` currently reads `block pull (midshin) · 147.5 → 152.5 kg (+5)` — with a variant field, that becomes `block pull · midshin · 147.5 → 152.5 kg (+5)` (bullet-separated). Reads cleaner.

**Fallback for O14b**: The queue proposes the chevron reveal "Add note" affordance is thin. Not my domain (interaction), but the copy pointer: if you keep the chevron, its label should be `Notes` (plural if a note is already saved). If you kill it and inline the Notes field, no label needed. Don't call it "Details" or "More" — those over-promise. → **see app-mobile-ux for interaction call**.

## Tone-drift scan of founder-cited language in the queue

Nothing egregious. A few notes worth flagging for the record:

**`en.ts:78-79` "Not certain about you. VO2max response varies ~10× person-to-person."** — this is Terav's honesty voice at its best. Keep as the reference for any future disclosure copy (see O5b Part 2, O10c Branch B).

**`en.ts:80` "Not a streak game. Skip a week. The plan sharpens against that too."** — good. Confirms R5 (streak/gamification rejected) is baked into voice, not just IA.

**`programs/page.tsx:117` "Pick your focus."** — three words, imperative, no hedging. Matches `en.ts:11` "Pick one thing you want stronger." Reference-grade H1.

**Queue-language flag**: the founder's O10b note says "wizards should feel like progress, not filling out a form." Correct diagnosis. The intake's current `INTAKE · FIRST STRICT PULL-UP` + `SCREENING · STEP 1 OF 14` at 10-11 px mono-caps reads as chrome, per the observation. But this is a **visual-craft finding** (progress-rail treatment), not a copy finding — the strings are fine, the rendering suppresses them. → **see app-visual-craft for progress-rail escalation**.

**Queue-language flag**: O11's proposed Today H1 rewrite to `Wednesday 19 Aug` — good instinct. That matches the info-hierarchy principle (H1 carries information, not tab name). Cross-check: `persona-erratic:01-today.txt:5` currently shows `Wednesday 19 Aug` right below the "Today" H1 in the date-picker. So the tab-name H1 is already a duplicate of the date immediately below it — evidence supports the founder's read. Route to product-design-lead per queue's own assessment.

## Priorities

**P0 (copy blocking product promise):**
- **O5a — Hide PROVISIONAL programs, don't legend them.** Debug-tier state on the trust-conversion surface (`/programs`) contradicts the "Every change cites a study" landing promise. One filter predicate.
- **O10c — Rewrite "How this was picked" disclosure.** Current `formatVars(inferred.vars)` is a raw variable dump. Ship the three-branch content model above. Copy alone doesn't fix the engine bug (confirmed root cause: missing proxy tables in `intake-tier.ts`) but stops the disclosure from making the mispick worse.

**P1 (do this month):**
- **O5b — Ship the "How programs earn each status" bottom sheet + the honesty callout on `/programs`.** Closes the ladder-integrity gap the founder surfaced. Content drafted above.
- **O13 — Kill the ReadinessDot, refine the banner strings.** Removes redundancy and reclaims a header slot for O4b's IA collapse.
- **O14a — Split exercise `name` into `name + variant` schema field; render as two-line card.** Data-model change plus one card refactor.

**P2 (polish):**
- **HeroStateCard sub-copy en-dash polish** (green/amber/red strings). Cosmetic.
- **`/programs` empty-category string** at `programs/page.tsx:177` is fine — no action.

## Files referenced

- `/Users/margussellin/www/program/next-app/src/app/programs/page.tsx:126-130, 175-178, 228-260` (legend, empty state, status chip map)
- `/Users/margussellin/www/program/next-app/src/app/programs/[slug]/intake/IntakeClient.tsx:518-548` (tier placement + "How this was picked" disclosure)
- `/Users/margussellin/www/program/next-app/src/components/workout/HeroStateCard.tsx:9-18` (banner copy)
- `/Users/margussellin/www/program/next-app/src/components/AppShell.tsx:199-215` (ReadinessDot — kill)
- `/Users/margussellin/www/program/next-app/public/data/exercises.json:2819, 3612` (parenthetical-modifier exercises — sample; grep for full list)
- `/Users/margussellin/www/program/next-app/public/data/programs/manifest.json` (add PROVISIONAL filter alongside `personal:true`)
- `/Users/margussellin/www/program/landing/src/i18n/dictionaries/en.ts:6-80` (voice reference)
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-strength/text/01-today.txt` (banner + proposal capture)
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-strength/text/06-programs.txt` (PROVISIONAL leak capture)
- `/Users/margussellin/www/program/next-app/tests/e2e/artifacts/personas/persona-erratic/text/01-today.txt` (AMBER banner)

**PII check**: no client PII detected in this audit's inputs. The captured persona artifacts are synthetic (persona-strength / persona-erratic seed data), the `data/clinical-context.json` case is Margus's own de-identified data per project CLAUDE.md, and nothing in the queue or persona text extracts contains third-party identifiers.
