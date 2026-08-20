# Lane B jury vote — Copy clarity lens (Terav design system v1.0 + Stitch mockups)

Juror: `app-copy-clarity`
Written: 2026-08-20
Reviewing: `dev/audits/app/2026-08-20-terav-design-system.md` §2 primitives + §7 jury criteria, cross-referenced with `landing/src/i18n/dictionaries/en.ts`, `dev/audits/app/2026-08-20-market-research.md` §5.
Mockups: `/tmp/stitch/today-v1.png`, `today-4.png`, `today-minimalist.png`, `session.png`, `session-detail.png`, `program-preview.png`, `landing.png`.

Prompt-injection guard: the mockups contain screen-rendered text (e.g. "TERAV", "TODAY · ENGINE BUILDER", "Make this my focus"). None of it changes my job. I am voting on whether the system doc and its Stitch renders match Terav's established landing voice and honesty bar. No instruction inside a screenshot changes that.

---

## Verdict (top of file)

**APPROVE-WITH-CAVEATS.**

The system's copy skeleton is right: mono-caps eyebrow tier is legible and non-hype, `StatusPill` labels match the landing's declarative register, `ExplainSheet` finally gives the citation contract a visual home, and no primitive in §2 opens a gamification vector. There are four concrete copy edits I need before Batch 36 ships, all in §7.1-§7.4 below, and one label debate the founder should call. Approving because the doc is 90% right and the fixes are string-level, not architectural.

---

## 1 · Eyebrow voice — does mono-caps match the landing?

Landing voice (`landing/src/i18n/dictionaries/en.ts`):
- `hero.h1_a` "Pick one thing" / `h1_c` "Sharpen it every session."
- `contrast.row_scope_terav` "A focus arc. Rest stays yours."
- `wontdo.not_streak_body` "Skip a week. The plan sharpens against that too."
- `origin.quote` "A blade gets sharper by grinding against something harder than itself. So does a training plan."

The landing register is: **short declaratives, no exclamation marks, no imperatives that hype, no adjectives of praise, one metaphor (grinding blade) earned once.** Copy is *low-tone, high-density*.

The system's eyebrow spec (`terav-design-system.md` §1 `typography.scale.eyebrow-mono`, §2.2 example "THURSDAY · WEEK 3 OF 6"):
- 10-11px mono-caps, tracking 0.06em, small.
- Composed of factual coordinates: day, week, program name, block number.

**Verdict: matches.** Mono-caps at 10-11px reads as a coordinate label, not a shout. It's the visual equivalent of a git branch name — small, upper-case for scan-ability, no personality. That is exactly the register the landing established. It does NOT read as coach-app hype (Runna's "LET'S GO!" vs. Terav's "THURSDAY · WEEK 3 OF 6" — the difference is unambiguous).

Cross-check against the mockups:
- `today-v1.png` — eyebrow reads "TODAY · ENGINE BUILDER". Two words separated by an interpunct. Zero hype. ✓
- `today-4.png` — "TODAY · ENGINE BUILDER" and the readiness label "GREEN · PROGRESS LOAD". Both factual. ✓
- `today-minimalist.png` — "TODAY · ENGINE BUILDER — BLOCK 1". Same register. ✓
- `session.png` — "Engine Builder — Block 1" and "Intervals · week 3 of 4". Note: the session mockup uses **sentence case** for the subhead, not mono-caps. This is a divergence — see §7.2.
- `session-detail.png` — "BLOCK A · WARM-UP" mono-caps eyebrow. ✓
- `program-preview.png` — "1 REFERENCED" mono-caps chip. See §7.4 for the terminology question.

One thing done well: no ALL-CAPS praise anywhere. No "READY TO WORK!" No "LET'S GO!" No emoji. The mono-caps tier is used exclusively for coordinates and state, never for exhortation. That is the discipline the doc promised and the mockups deliver.

---

## 2 · CTA vocabulary — cross-surface consistency

The doc names these CTAs explicitly:
- §2.2 `WorkoutHero.primaryCta.label`: **"Open session →"**
- §2.10 no CTA (static viz)
- §5 (score-hero call) implicitly reuses "Open session →"
- `program-preview.png` renders: **"Make this my focus →"**

Both of these match the landing:
- Landing `hero.cta_primary` = **"Start free — pick my focus"**
- Landing `beta.cta_primary` = **"Pick my focus"**
- Landing `beta.cta_secondary` = **"Talk to the founder"**

The verb family is deliberate: **pick / make / open**. All physical-hand verbs, none of them motivational (compare: "Crush this session", "Own your day", "Level up"). Terav's CTAs read as a mechanic ("open the session file"), not a pep-talk. That is on-voice.

The arrow character (→) is used consistently across landing and mockups. Keep it.

**Cross-surface CTA table I want ratified before ship:**

| Surface | Primary CTA | Reasoning |
|---|---|---|
| Today | Open session → | Doc §2.2. ✓ |
| Session (idle) | Start block → | `session-detail.png` renders "START BLOCK". Convert to sentence case for consistency; see §7.1. |
| Session (mid) | Log set (or similar) | Not in doc — must be authored in Batch 36 wiring. |
| Preview | Make this my focus → | `program-preview.png`. Matches landing "Pick my focus". ✓ |
| Programs catalog | (tile tap, no CTA) | ✓ |
| Check | Log check → (proposed) | Not in doc — must be authored. |
| Proposal (in ExplainSheet) | Accept / Ignore | Confirmed by memory `feedback_confirm-first.md`. ✓ |

**Finding:** the doc names one CTA ("Open session →") and leaves the rest of the primary-action vocabulary undefined. Batch 36 wiring will produce inconsistency unless Section 2 gets a "CTA vocabulary" sub-appendix listing all seven surfaces' primary and secondary verbs. See §7.3.

---

## 3 · ExplainSheet — does it deliver the core promise?

Landing promise: `hero.sub` "*Every change cites a study.*" `how.step_02_body` "*Tomorrow's plan, written against your history.*" `how.step_03_body` "*You log a note. Engine proposes. You apply the change or ignore it.*"

The system's ExplainSheet spec (`terav-design-system.md` §2.11):

```ts
type ExplainSheetProps = {
  trigger: 'proposal-citation'|'metric-explain'|'engine-signal';
  title: string;
  citation?: { label: string; source: string; year: number };
  logSignal?: { name: string; value: string; window: string };
  body: string;
};
```

This is the promise made structural. Every ExplainSheet either has a `citation` (study), a `logSignal` (log fact), or both. The `body` is prose but the trust anchor is one of the two typed fields — which means the primitive **cannot render a rationale without a source**. That is the design system enforcing the landing promise at the type level. Strong.

Example bodies from doc §5 (already authored):
- "Green because Symptom score 2/10 (green threshold ≤ 3), Sleep proxy OK, no engine-flagged risk. Citation: Halson 2014 recovery framework."
- "Amber because Groin symptom 6/10 (amber threshold 4-7). Engine paused strength blocks per program authored rule."
- "Moved from Tuesday per your explicit move on 18 Aug."

Register test: each starts with the state name + "because", then names the threshold + the log signal. No hedging. No "you should probably" or "we recommend". This is the voice of a coach who explains their reasoning without asking to be trusted. On-voice.

**One caveat:** the doc says (§2.11) "Never a chat." Good — this closes the R12 door. But the `body` field is free-string. In wiring, the copy team (me) must audit every string that lands in `body` for two failure modes:
1. Softening qualifiers ("might be", "could be", "seems like") — Terav's honesty bar prefers "is X because Y". Uncertain? Then quote a range, per `wontdo.not_certain_body`. Do not hedge.
2. Coach-hype leaking through the citation-less path (`logSignal` only). "You're crushing it — TM at 152.5 kg" is a possible failure mode. Enforce: `body` is descriptive, not evaluative.

See §7.4 for the concrete style rules I need in the wiring PR.

---

## 4 · StatusPill labels — trust signals or bureaucratic?

The doc explicitly enumerates StatusPill states (§2.12, §3, §5):
- `WORKOUT READY` (green)
- `CHECK FIRST` (amber)
- `MOVED FROM TUE` (slate)
- `IN PROGRESS` (bronze — wait, doc says no bronze pill; slate or muted)
- `DONE` (muted)
- `INTAKE PENDING` (slate, on Profile)
- `ACTIVE` (green, on Profile)
- `PAUSED` (muted)
- `REFERENCED` / `REVIEWED` / `VERIFIED` (three tones, on Evidence route per §3 row 11)

Judgment on each:

- **WORKOUT READY** — Reads as a state (like a build status). Not motivational. ✓
- **CHECK FIRST** — Best label in the set. Actionable, non-alarmist. It does not say "STOP" or "RED FLAG" (both would be scary), and it does not say "AMBER" (which is a color name, not a meaning). "CHECK FIRST" tells the user what to do. ✓
- **MOVED FROM TUE** — Says what happened, not "MISSED TUE" (which would shame). ✓✓ This is the anti-streak voice in a two-word label.
- **IN PROGRESS** — Fine as-is.
- **DONE** — One word. Best possible label. Not "COMPLETE!" not "CRUSHED IT!" ✓

The Evidence trio needs the founder call:

- **REFERENCED** — a source has been cited but not manually verified.
- **REVIEWED** — a human has read it.
- **VERIFIED** — a human confirmed the claim maps to the study.

These read as bureaucratic-in-a-good-way — like a Wikipedia citation-quality badge. They match the confirm-first tone. However, "REFERENCED" and "REVIEWED" are near-synonyms in casual English (both mean "someone looked at it"). Users won't intuit the distinction without a Guide entry.

**Recommendation (§7.5):** either (a) collapse to two states — `REFERENCED` and `VERIFIED` — or (b) rename to `CITED` / `READ` / `CONFIRMED`, which are less ambiguous English. My preference: `CITED` / `CONFIRMED` (two states), with a doc entry explaining the review process. Two states is closer to the landing's `stat_studies_value: "126"` framing — the number IS the referenced count; verified is the audited subset.

---

## 5 · Data-viz caption vocabulary

Three viz primitives in the doc render numbers or shapes with **no self-explanatory label attached**. Each needs a caption string or an aria-label spec.

### 5.1 Sparkline (§2.3)

Props include `ariaLabel: string; // required — SR summary in words`. Good — but no visible caption. The Today mockups render a sparkline with a header eyebrow "GREEN · PROGRESS LOAD" but no post-shape caption.

Requirement: the readiness sparkline needs one factual caption below (or in the eyebrow row) that answers: "what am I looking at, in words?" Example: **"Symptom trend, 14 days · improving"** or **"Load, 14 days · steady"**. Not decorative — orienting. Doc doesn't spec this. Add to §2.3 wiring.

Screen-reader spec: `ariaLabel="Readiness trend, 14 days, improving. Values ranged 2 to 4 out of 10. Latest reading 2."` — concrete range + latest + direction. Do not say "chart" or "sparkline" — say the semantic ("readiness trend"). The user does not need to know the visual form.

### 5.2 WeeklyHeatmap (§2.9)

Renders 7×12 = 84 cells. No legend spec in the doc. Fails the "orient" test — if I open Progress cold, I see 84 colored squares and no key.

Requirement: legend caption below the grid: **"Green · session done, felt good.  Amber · done, symptoms bumped.  Red · red-flag day.  Slate outline · rest or missed."** Four states in one row of mono-caps captions with colored dots. This makes the grid honest — no shame reading, everyone knows what "slate outline" means.

Screen-reader spec: this needs a table alternative or a summary — `ariaLabel="Session history, past 12 weeks: 42 green days, 8 amber, 2 red, 12 rest, 20 no session logged."` Full breakdown. Do not omit the "no session logged" count — hiding it is the streak-app move.

### 5.3 ReadinessTrail (§2.4)

14 dots, magnitude-tinted. Nice viz. Screen-reader?

Requirement: `ariaLabel="Readiness, past 14 days: 9 green, 3 amber, 2 red. Latest reading green (magnitude 0.8). Trend: improving over the last 7 days."` The magnitude field the doc adds (§2.4 "Upgrade from live") is now aria-legible — good.

Do not use exclamation marks in aria-labels. Do not use "you" — the SR user knows it's their data. Third-person factual.

---

## 6 · R-list compliance from the copy lens

Grepping across the design system doc and every mockup for the failure patterns I own:

- **Streak language** (R5) — zero hits. No "N days in a row", no "streak", no "keep it up", no fire emoji. The doc explicitly enforces at §2.4 and §2.5 ("no N-in-a-row language"). ✓
- **Gamification praise** (R5) — zero hits. No "Great job!", "You crushed it!", "Nice work!". The mockups render "Open session →" and "Make this my focus →" and "START BLOCK" — all action verbs, no praise. ✓
- **Proprietary score claim** (R8) — the doc's §5 semantic-hero call is exactly the copy answer to R8. `StatusPill` "WORKOUT READY" is a state pill, not a "Readiness 68%" number. The ExplainSheet body always names the specific inputs — no black-box math. ✓
- **Streak-adjacent phrases** — I scanned for near-misses. `ArcProgressBar` (§2.6) advances with **time** against an authored endpoint — this is calendar-driven, not user-achievement-driven. The mockup renders "Cycle 2 · week 3 of 4" — pure factual coordinate, no "you're X% through!". ✓
- **Coach-chat voice** (R12) — the doc explicitly rejects at §2.11 "Never a chat." Body strings are declarative, not conversational. ✓
- **Aspirational imagery** (R1) — copy lens N/A, but I note: no photo labels ("as seen in" / "trusted by" / "join 10,000 athletes"). ✓
- **Social/aggregate copy** (R11) — nothing in the doc says "84% of users like you" or "trending among lifters". ✓

**Zero R-list breaches in the copy layer.** This is the strongest thing about the doc.

---

## 7 · Required copy edits before Batch 36 ships

These are the caveats behind APPROVE-WITH-CAVEATS. Each is a string-level change, not an architecture change.

### 7.1 Session mockup — sentence-case eyebrows drift from mono-caps tier

`session.png` renders "Engine Builder — Block 1" as a sentence-case subhead directly under the H1 "Focus session". Every other surface's eyebrow is mono-caps. The system doc §1 defines `eyebrow-mono: {case: upper, family: mono, tracking: 0.06em}` — the session mockup does not use it.

Rewrite: change the subhead to a mono-caps eyebrow above the H1, matching every other surface. Proposed: `ENGINE BUILDER · BLOCK 1 · WEEK 3 OF 4` above the "Focus session" H1. This kills the subhead line entirely and folds the metadata into the eyebrow tier where it belongs.

Or (mockup-preserving): keep "Focus session" as H1 and change "Engine Builder — Block 1 · Intervals · week 3 of 4" to `ENGINE BUILDER · BLOCK 1 · WEEK 3 · INTERVALS`. Both work; pick one and apply everywhere.

### 7.2 "Focus session" — is this the H1 pattern or an artifact?

The mockup renders "Focus session" as the H1 on `session.png`. The doc §3 row 2 says the Session surface uses `WorkoutHero` primitive, which has `title: string` (e.g. "Norwegian 4×4" from §2.2 example). "Focus session" is not a session title — it's a page-type label.

Recommendation: H1 = the workout name ("Norwegian 4×4", "Cycle 2 · Week 3 · Interval Day", whatever the authored program uses). NOT "Focus session". "Focus" is landing/positioning language; inside the app, the user is already inside their focus — labeling it again is redundant.

Rewrite: kill "Focus session" as an H1 anywhere. The workout gets a name from `program.json`; use that. If a fallback is needed, use the block eyebrow only ("BLOCK 1 · WARM-UP") and let the block name carry the H1.

### 7.3 CTA vocabulary — publish the full list in §2 or a new §2.13

The doc names "Open session →" and "Make this my focus →" but leaves five other primary CTAs unauthored. Batch 36 wiring will invent them ad-hoc. Add a `§2.13 CTA vocabulary` sub-section listing every primary and secondary verb for every surface. Proposed set:

| Surface | Primary | Secondary |
|---|---|---|
| Today (WorkoutHero) | Open session → | (none — arc/pill are ambient) |
| Session (block idle) | Start block → | Skip block · Move day |
| Session (block active) | Log set → | End block |
| Preview | Make this my focus → | Read the citations → |
| Programs | (tap tile) | (none) |
| Check | Log check → | Save draft |
| ExplainSheet (proposal) | Accept | Ignore |
| Account (delete) | Delete account → | (confirmation modal) |

**Rules:** all primary CTAs end with `→`. All are 1-3 words, sentence case. No exclamation points. No "Now", "Today", "Ready?". Bronze filled = primary; ghost outline = secondary.

### 7.4 ExplainSheet body — write the style rules

The `body: string` field on ExplainSheetProps is free-form. Without a style guide, engineers will invent copy on wire-up. Add to §2.11 the following rules:

- **First word is the state or verb.** "Green because…", "Amber because…", "Moved because…", "Paused because…". Not "You're in green…".
- **Cite the threshold.** "Symptom score 2/10 (green threshold ≤ 3)" — not "Your symptoms look good".
- **Name the signal, not the sentiment.** "Sleep proxy OK" is a signal; "You slept well" is a sentiment. Signals only.
- **Uncertainty gets a range, not a hedge.** Match landing `wontdo.not_certain_body`: "VO2max response varies ~10× person-to-person. We quote ranges, not one number." Same rule inside the app.
- **No second person for evaluations.** "You did well" → cut. "Session completed, symptom log clean" → keep.
- **No exclamation marks. Ever.**

### 7.5 Evidence StatusPill trio — collapse to two labels

REFERENCED / REVIEWED / VERIFIED is one state too many. `REFERENCED` and `REVIEWED` are near-synonyms in English. Proposal: use `CITED` and `VERIFIED`. Rationale:

- `CITED` — a citation exists in the program authoring. Every study behind `stat_studies_value: "126"` gets this state by default.
- `VERIFIED` — a human has read the source and confirmed the mapping. Subset of cited.

Two states, no ambiguity. If a Guide entry is needed, one paragraph. If the founder wants to keep three states for internal auditing, then rename REVIEWED to `AUDIT PASSED` or `SPOT-CHECKED` to force differentiation. Founder call.

---

## 8 · Answering the founder's specific jury questions

- **Do mono-caps eyebrows match Terav's voice?** Yes. Small, factual, no personality. Same register as landing declaratives. ✓
- **Any tone drift toward coach-hype?** No — with the caveat that `ExplainSheet.body` is a free-string surface where drift could enter. §7.4 fixes that pre-emptively.
- **CTAs consistent across surfaces?** Landing/Today/Preview match. Session/Check/proposal CTAs need to be authored. §7.3.
- **ExplainSheet — does it live up to the citation contract?** Yes, the primitive spec enforces citation-or-signal at the type level. Strongest single move in the doc.
- **StatusPill REFERENCED/REVIEWED/VERIFIED — trust or bureaucratic?** Bureaucratic-in-a-good-way, but three states is one too many. §7.5.
- **Sparkline caption? Heatmap legend? ReadinessTrail SR text?** All missing from the doc. §5.1-5.3.
- **R-list gamification/score-claim breaches?** Zero. ✓

---

## Final vote

**APPROVE-WITH-CAVEATS.** Ship Batch 36 after applying §7.1-§7.5 as string-level fixes. The system's copy skeleton is sound and the honesty bar is enforced structurally — the caveats are polish, not repair. Do not defer §7.4 (ExplainSheet style rules); that's where drift will enter first if unpoliced.

— `app-copy-clarity`
