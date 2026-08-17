# Intake visual craft — quiet-form with section-weight + safety-red

Owner: product-design-lead
Written: 2026-08-17
Status: draft — awaiting founder review
Related audits: `dev/design-briefs/2026-08-17-b3-program-agnostic-onboarding.md`, `dev/design-briefs/2026-08-17-flow-grade-full-journey.md`
Blocked by / blocks: does not block anything. Touches `IntakeClient.tsx` only.

---

## The call

Ship **quiet-form**: keep the wall-of-text depth signal, but give the surface three tools it doesn't have today — **semantic chip weight (safety-red for gates, bronze for calibration, neutral for context)**, **numbered section headers with a monogram tile**, and **a rationale that stays visible on the load-bearing questions but collapses under a "why we ask" affordance on the calibration questions**. No stock photos, no illustrations, no video. One CSS-only pictogram tile per movement-calibration question. Progress moves to the **top**, sticky under the header, as a thin bronze bar with a "Question 6 of 11" label so the user sees momentum instead of a lonely `0 / 11` at the footer.

**Why (three-line summary):**
- The chips are semantically flat today; a safety-gate answer of "Yes" reads the same as "3 days per week." That is a hierarchy bug, not a taste problem — Refactoring UI rule 1.
- Rationale paragraphs are load-bearing on gates (trust) and noise on calibration (obvious). Treat them differently or ship the same visual rhythm forever.
- The intake is not a medical form and should not drift toward one. Numbered section chips + a bronze progress rail is how Linear, Cal.com, Stripe onboarding all get "serious but not clinical." The current design has picked neither.

---

## The problem

The intake at `/programs/handstand-walk/intake` reads as eleven identical question blocks stacked in three identical section boxes. Every question has the same shape: **label → gray rationale paragraph → chip row of identical outlined pills**. Section headers are text-only (`Screening` / `Where you are now` / `About you` / `Physical tests` / `Consent`) with no visual anchoring, no numbering, no icon. Progress lives in the bottom-right in mono — `0 / 11` — so the user sees "you have done nothing" for the entire first two-thirds of scrolling.

The founder called it "reading a book without any pics." He's right, but the fix is not to add pics. The fix is that the surface uses zero of the tools a form has for hierarchy:

- **No accent economy.** Every chip is bronze-on-outline when picked. Safety-critical answers ("Yes — persistent or limiting", "Yes — diagnosed", "Yes" to acute wrist injury) have no visual weight distinct from "3 days per week." A user who taps the wrong one gets no visual signal that they have just tripped a hard block until the whole surface re-renders with a red banner.
- **No signposting.** Section names are 14px semibold text on the same surface as the questions. The user can't scan the page and say "I'm in section 3 of 5" — they have to read.
- **Rationale monotony.** The `q.help` line is treated as equal weight for every question. `wrist_pain_12mo` help copy is "why we ask" trust content; `days_per_week` help copy is a threat ("if your ceiling is 2 we'll tell you upfront…"); `age_band` has no help copy at all. Same visual treatment for three different jobs.
- **No mental model for movement questions.** "How long can you hold a wall handstand (chest to wall or back to wall)?" assumes the user knows what "chest to wall" means. Some do. Some don't. The chips do not disambiguate.
- **Progress is punitive.** `0 / 11` reads as a debt at the bottom of the screen. Every survey research paper since 2005 says put the progress bar at the top and phrase it as forward motion.

Future scenarios the design has to hold:

1. **A second program's intake with 15 questions and 3 physical tests** — Overhead Mobility ships next. Cannot re-do this brief per program.
2. **A safety-gate false positive** — user picks "Unsure / never tested" for osteoporosis, doesn't realize it's not a hard block, wants to see whether "Yes" would be one. The chip semantic weight should show that "Yes" is the loud answer.
3. **A symptomatic user** — `persona-recover` with wrist twinges. This person needs the trust rationale MORE, not less. Do not compress it for them.
4. **A screen-reader user** — every visual anchor must have a text equivalent. The pictogram tile is decorative and must be `aria-hidden`.
5. **A returning user** — signed up 3 weeks ago, comes back to change age band. Intake should be re-openable and not read as "start over."
6. **A user on a 320px iPhone SE** — the chip rows already wrap. Adding a pictogram cannot make the layout narrower per chip.

---

## Options considered

### Option A — "Illustrate every question"

- **Shape:** Commission or generate a small illustration for each question. Movement questions get a stick-figure of the position. Screening questions get a medical-adjacent icon (a wrist, a heart).
- **Sketch:**
```
+---------------------------------+
| [icon] How long wall handstand? |
| [chip] [chip] [chip] [chip]     |
+---------------------------------+
```
- **Pros:** Fastest way to break the "wall of text" feeling. Instant recognizability.
- **Cons:** Cost. Consistency risk (medical-icon vibe drifts toward "clinical form" — exactly the brand direction we said no to). Illustrations of a body doing a handstand look either stock or amateurish; middle ground doesn't exist without an illustrator on staff. Rejected explicitly by the invoker.
- **Verdict:** Rejected — cost + brand drift.

### Option B — "One question per screen, wizard style"

- **Shape:** Full-page single-question wizard. Big label, big chips, big Next button. Progress dots at the top.
- **Sketch:**
```
+---------------------------------+
| Step 3 of 11         [====----] |
|                                 |
| Have you had wrist pain in the  |
| last 12 months during handstand |
| or upper-body weight-bearing    |
| work?                           |
|                                 |
| [ No ]                          |
| [ Occasional / mild ]           |
| [ Yes — persistent or limiting ]|
|                                 |
| Why we ask ▸                    |
+---------------------------------+
```
- **Pros:** Zero scan fatigue. Feels modern (Typeform / Airtable onboarding). Solves the "wall of text" complaint completely. Perfect thumb ergonomics.
- **Cons:** **11 taps to get through screening alone.** A returning user changing age band would have to walk the wizard. The user cannot scan the whole intake to see what they're being asked. Loses the "we're being upfront about everything" honesty posture — one-at-a-time formats hide the shape of the interrogation. Wrong for a rehab / calibration surface where trust is earned by transparency, not by pacing.
- **Verdict:** Rejected — hides the shape of the intake, which is the honesty asset.

### Option C — "Quiet-form: semantic weight + section monograms + top progress + collapsible rationale on calibration" **(winner)**

- **Shape:** Keep the current stacked layout. Change four things:
  1. **Chip semantic weight.** Safety-gate answers with `unsafe_values` picked get a `red/10` background + `red/40` border, muted (not shouty). Correct safety-gate answers ("No") stay neutral-picked (bronze). Calibration chips stay bronze-picked. This makes the load-bearing answer legible by color, not by reading.
  2. **Section header monogram tile.** A 40×40 rounded-square tile with a numeric step (`01`, `02`, `03`, `04`, `05`) in bronze on a `surface-2` tile. Sits to the left of the section title. Signals "you are in step N" without adding chrome.
  3. **Top progress rail.** Sticky under the page header. 2px bronze rail on `line-soft` track. Label reads "Question 6 of 11" not `0 / 11`. Keeps the bottom CTA copy exactly as-is (it already speaks the count).
  4. **Rationale rules.** Screening + About-you rationale stays inline and always-visible (trust load-bearing). Calibration questions (`wall_hold_seconds_selfreport`, `freestand_hold_seconds_selfreport`, `walk_distance_selfreport`) collapse the tier-mapping hints into a "Why the tiers?" disclosure under the chip row. The pictogram tile takes the vertical space the rationale used to.
  5. **CSS-only movement pictogram.** Three 56×56 tiles: `wall handstand` (two lines and a dot), `freestand` (an inverted T), `handstand walk` (an inverted T with a chevron). All drawn with `border` + `border-radius` — no SVG asset pipeline. Decorative, `aria-hidden`.
- **Sketch:** see full wireframe below.
- **Pros:** Ship-in-a-day. Preserves the honesty posture. Adds real semantic weight where it matters (safety). Keeps rationale where trust needs it. Costs zero art. Scales to Overhead Mobility, Rowing, and any future intake without a per-program illustration pass.
- **Cons:** Doesn't move the needle for a user who wanted a photo of a handstand. That user is a minority and the correct answer to their need is Day 3's video reference, not intake bloat.
- **Verdict:** **Winner.**

---

## Chosen: Option C — quiet-form

### Full wireframe (393px mobile, dark)

```
+---------------------------------------------------+
| ‹ Back to program                                 |
|                                                   |
| Intake — Handstand Walk                           |
| Short questions so the program starts at the      |
| right level. Everything is stored locally on      |
| your account — not shared with anyone.            |
|                                                   |
|  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   |   ← sticky under header
|  ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░  Question 3 of 11  |   ← bronze bar, mono label
|                                                   |
| +---+ SCREENING                          gate 01  |
| | 01| Safety gates — a few no-questions           |
| +---+ before we start.                            |
|                                                   |
| Have you had wrist pain in the last 12 months     |
| during handstand or upper-body weight-bearing     |
| work?                                        *    |
|                                                   |
| [ No ] [ Occasional / mild ] [ Yes — persistent ] |
|                              └── red-tinted when
|                                  picked (gate)     |
|                                                   |
| Have you had shoulder pain during any overhead    |
| pressing or overhead hold in the last 12 months?* |
| Includes press, jerk, snatch, overhead squat, or  |
| any handstand attempt. If yes, we defer inversions|
| this block and route to shoulder-safe positions.  |
|                                                   |
| [ Yes ] [ No ]                                    |
|                                                   |
| ... (osteoporosis, hypertension, acute wrist)     |
|                                                   |
| +---+ WHERE YOU ARE NOW                calibr. 02 |
| | 02| Skill-level self report. Best guess is fine |
| +---+ — you'll re-test on Day 3.                  |
|                                                   |
| [ ▓ ]  How long can you hold a wall handstand     |
| [═╪═]  (chest to wall or back to wall)?      *    |
|                                                   |
| [ Never held one ] [ Under 15s ] [ 15-30s ]       |
| [ 30-60s ] [ Over 60s ]                           |
|                                                   |
| Why the tiers? ▸                                  |   ← collapsed
|                                                   |
| [ ┴ ]  How long can you freestand (no wall)?  *   |
|                                                   |
| [ Never freestanded ] [ Brief (< 2s) ] [ 2-5s ]   |
| [ 5-15s ] [ 15-30s ] [ Over 30s ]                 |
|                                                   |
| Why the tiers? ▸                                  |
|                                                   |
| [ ┴▸]  How far can you handstand walk cont.?  *   |
|                                                   |
| [ Never ] [ 1-3 steps ] [ 5m+ ] [ 10m+ ] [ 20m+ ] |
|                                                   |
| Why the tiers? ▸                                  |
|                                                   |
| +---+ ABOUT YOU                          engine 03|
| | 03| Context for the adaptive engine.            |
| +---+                                             |
|                                                   |
| Realistically, how many days per week can you     |
| commit?                                       *   |
| Honest answer wins. If your ceiling is 2, we'll   |
| tell you upfront whether this program can deliver.|
|                                                   |
| [ 2 ] [ 3 ] [ 4 ] [ 5 ] [ 6 ] [ 7 ]               |
|                                                   |
| Age band                                      *   |
| [ 18-30 ] [ 31-45 ] [ 46-60 ] [ 60+ ]             |
|                                                   |
| +---+ PHYSICAL TESTS         optional    tests 04 |
| | 04| More precise than self-report. Skip and     |
| +---+ we use the answers above. 5 tests.       ▸  |
|                                                   |
| +---+ CONSENT                          required 05|
| | 05|                                             |
| +---+                                             |
| [ ] I understand this is a training template …    |
| [ ] I agree to stop the session if shoulder …     |
|                                                   |
| [==================================== SUBMIT ]    |   ← existing sticky CTA
|                                                   |
+---------------------------------------------------+
```

The pictogram column on calibration questions is a 56px-wide left column with the chip row wrapping in the remaining space. On the 320px iPhone SE the pictogram drops to 40px and shifts inline above the label. This is the ONLY layout branch — everything else is single-column stacked as today.

### Cross-persona coherence check

| Persona | State | Does the design hold? | Notes |
|---------|-------|-----------------------|-------|
| persona-recover | rehab, wary of "medical form" drift | y | Bronze monograms + calibration rationale hidden = surface reads "training", not "clinic." Screening rationale still visible so trust is intact. |
| persona-strength | overperformer, blazes through in 90s | y | Semantic chip weight means their "No / No / No" scan-through is instant. Progress rail rewards momentum. |
| persona-erratic | dismisses forms, wants to bail | y | Top progress rail with "Question 6 of 11" surfaces that they are two-thirds through. "Why the tiers" is collapsed — no extra friction. |

### Modern-standard checks

- **iOS HIG:** Chip min-height 40 today → bump to 44 for gate answers only (the load-bearing ones). Sticky progress rail sits under safe-area header inset. Pass.
- **Material 3:** State-layer for chip press is the current bronze/15 fill — kept. Motion tokens on the rationale disclose use `200ms ease-out`, safe under M3's Motion Emphasized bucket.
- **Refactoring UI:** Accent economy respected — bronze for user commitment, red only for tripped gates, everything else neutral. Hierarchy through weight (monogram tile + size ramp on section header), not through five new colors.
- **`prefers-reduced-motion`:** The rationale disclose animation becomes an instant show/hide. Progress bar width transition drops to instant. Pictogram tiles have no motion regardless.
- **Fitts's law:** Primary CTA stays in the thumb cradle. Section monograms are non-interactive so their placement in the reach-difficult top-left doesn't matter.

---

## Data shape changes

**Zero schema changes.** Every visual decision derives from data already in the JSON:

- Safety-gate semantic weight reads from `program.intake.safety_gates[].unsafe_values` — the array already exists at `next-app/src/lib/schemas.ts:387`.
- Section monograms compute from the existing `screening / skill / about / physical_tests / consent` split at `IntakeClient.tsx:294-317`.
- Calibration pictogram map is a client-side constant keyed by `question.id` — three keys total (`wall_hold_seconds_selfreport`, `freestand_hold_seconds_selfreport`, `walk_distance_selfreport`).
- "Why the tiers" body reads from each option's existing `hint` field (`intakeQuestionSchema` already has it — schema line 217+).

```ts
// next-app/src/app/programs/[slug]/intake/IntakeClient.tsx (new consts)
const PICTOGRAM_BY_QID: Record<string, "wall" | "freestand" | "walk"> = {
  wall_hold_seconds_selfreport: "wall",
  freestand_hold_seconds_selfreport: "freestand",
  walk_distance_selfreport: "walk",
};

// Answers that trip a safety gate get semantic red weight on the chip.
function isGateUnsafe(
  gates: SafetyGate[],
  qid: string,
  value: string,
): boolean {
  return gates.some((g) => g.question_id === qid && g.unsafe_values.includes(value));
}
```

Overhead Mobility and Rowing 2k intakes add their pictogram keys to `PICTOGRAM_BY_QID` when they ship — one-liner per program.

---

## Component tree

Current:
```
IntakeClient
  header
  Blocker? (banner)
  QuestionGroup ("Screening")
    header
    ul > li × N
      label + help + chips
  QuestionGroup ("Where you are now")
  QuestionGroup ("About you")
  PhysicalTestsGroup
  ConsentBlock (inline)
  sticky footer: ProgressRow + CTA
```

Proposed:
```
IntakeClient
  header
  StickyTopProgress          ← NEW: rail + "Question N of M"
  Blocker? (banner)
  SectionCard (step="01", label="Screening", tone="gate")
    QuestionRow (semanticGate=true) × 5
  SectionCard (step="02", label="Where you are now", tone="calibration")
    CalibrationQuestionRow × 3   ← includes PictogramTile + collapsible hint list
    QuestionRow (about) × 0
  SectionCard (step="03", label="About you", tone="engine")
    QuestionRow × 2
  SectionCard (step="04", label="Physical tests", tone="optional", collapsed)
    PhysicalTestRow × 5
  SectionCard (step="05", label="Consent", tone="required")
    ConsentCheckbox × 2
  sticky footer: CTA (progress row REMOVED — moved to top)
```

### File-level changes (implementation notes)

- `next-app/src/app/programs/[slug]/intake/IntakeClient.tsx:428-551` — replace the top-level render tree. Move progress markup from `:517-534` (bottom) to a new `StickyTopProgress` block placed after the header (`:443`). Keep the CTA at bottom; drop its progress row.
- `IntakeClient.tsx:554-657` (`QuestionGroup`) — split into `SectionCard` (the shell) and `QuestionRow` / `CalibrationQuestionRow` (the row body). SectionCard takes `step: string`, `title: string`, `hint: string`, `tone: "gate" | "calibration" | "engine" | "optional" | "required"`. Renders the 40×40 monogram tile plus title + hint.
- `IntakeClient.tsx:581-598` (chip render for `select`) — extend to accept an `isUnsafe(value)` predicate. When picked AND unsafe, chip uses `border-red/40 bg-red/10 text-red` instead of `border-bronze bg-bronze/15`. Same file as the existing yes/no boolean case at `:600-618`.
- Same file, new `PictogramTile` component (30-40 LOC, no dependencies) — three variants, all CSS-only using `::before` / `::after` pseudos. Wall handstand: 2px vertical line + 6px round dot at the top, on a `border-l-2 border-l-bronze/40` right-wall. Freestand: an inverted T made of two lines. Walk: same T plus a small right-chevron via `border` triangle trick. All `aria-hidden`.
- Same file, new `CalibrationHintDisclosure` — a `<details>` element rendering `option.hint` as a `key → value` list. Ships with `open` closed by default. On `prefers-reduced-motion`, drop the CSS transition on the summary marker.
- `next-app/src/app/globals.css` — add three tiny utilities: `.chip-gate-picked`, `.chip-calib-picked`, `.section-monogram`. Everything else composes from existing tokens.

### Delegate-to-specialist

- **Type scale / palette:** → `app-visual-craft` — pick the exact monogram tile weight, the section-header type ramp (14/13 today reads flat), and audit the `red/10` chip surface for contrast against the `red/40` border on `surface`.
- **Ergonomics:** → `app-mobile-ux` — verify the safety-gate chips clear 44×44, verify sticky top progress does not collide with the app's global top chrome, and verify the 56px pictogram column does not push chip rows into two-line labels on 320px viewports.
- **A11y:** → `app-accessibility` — verify `aria-current="step"` on the current section monogram, `role="progressbar"` on the top rail with `aria-valuenow` / `aria-valuemax`, `aria-hidden` on all pictograms, and that the collapsible "Why the tiers" disclosure is keyboard-operable.
- **Copy:** → `app-copy-clarity` — the section hint on "Physical tests" needs to communicate that skipping is fine without sounding dismissive; the "Question N of M" label needs to sit between motivational and clinical (mono, muted).

---

## Field-by-field before/after

### Screening question (safety gate)

**Before** — `IntakeClient.tsx:575-598`:
```
Have you had wrist pain in the last 12 months during handstand or upper-body weight-bearing work? *

[ No ]  [ Occasional / mild ]  [ Yes — persistent or limiting ]
   ↑ all three chips: border-line / bg-surface / text-strong. Picked = bronze.
```

**After**:
```
Have you had wrist pain in the last 12 months during handstand or upper-body weight-bearing work? *

[ No ]  [ Occasional / mild ]  [ Yes — persistent or limiting ]
   ↑ No + Occasional picked = bronze/15 border-bronze.
   ↑ Yes picked = red/10 border-red/40 text-red. (Not shouty — the block banner is still the loud one.)
```

Rationale line: unchanged, still inline above the chips. This is a trust-load-bearing question — the "why we ask" text stays.

### Calibration question (self-report skill)

**Before** — same file, question row shape:
```
How long can you hold a wall handstand (chest to wall or back to wall)? *

[ Never held one ] [ Under 15s ] [ 15-30s ] [ 30-60s ] [ Over 60s ]
   ↑ tier hints ("Tier A entry") are dropped — never rendered, waste in JSON.
```

**After**:
```
[▓]  How long can you hold a wall handstand (chest to wall or back to wall)? *
[═╪═]
     [ Never held one ] [ Under 15s ] [ 15-30s ] [ 30-60s ] [ Over 60s ]

     Why the tiers? ▸    ← disclosure. Opened: shows the option → tier mapping
                            using each option's existing `hint` field.
```

The 56×40 pictogram column signals "this is a movement question, not a form question." The `hint` metadata that today is silently ignored gets a real UI home.

---

## What NOT to touch

- Copy on every existing question, hint, safety-gate title/body, consent label — untouched.
- Section names (`Screening`, `Where you are now`, `About you`, `Physical tests`, `Consent`) — kept.
- Question order — kept.
- Consent block placement (bottom) — kept.
- Physical-tests progressive disclosure (`<details>`) — kept, tone unchanged.
- The blocker banner treatment — kept.
- The submit-button copy state machine — kept (`Answer N more to continue` etc.).
- Bottom-nav — untouched.

---

## Migration

Additive change. No data migration required.

- **Step 1**: land `SectionCard` + `PictogramTile` + safety-gate chip variant behind no flag; the store shape doesn't move. Existing intake answers still round-trip.
- **Step 2**: any user mid-intake keeps their answers — they live in React state, not persisted state. Refresh mid-intake was already lossy; this brief does not fix or worsen that.
- **Rollback plan**: single revert of the `IntakeClient.tsx` diff + one `globals.css` diff. No JSON schema change to unwind.

---

## Peer benchmarks

- **Linear onboarding** ([linear.app/join](https://linear.app/join)): numbered section monograms, one accent color, muted rationale that never grows into a paragraph. Steal: the monogram-as-anchor pattern, the top progress rail. Reject: their step-by-step wizard — see Option B rejection.
- **Cal.com scheduling forms** ([cal.com](https://cal.com)): grouped sections with unobtrusive section headers, chip-style multi-select for availability. Steal: the section-scoped `hint` pattern (short, right-aligned, mono for meta). Reject: their empty-state illustrations — brand mismatch for rehab.
- **Anthropic console consent screens** ([console.anthropic.com](https://console.anthropic.com)): quiet copy-forward panels, mono captions, `required` badge in the corner. Steal: the `required` / `optional` mono badge (Terav already uses this on the physical-tests header — extend to consent + about-you). Reject: their long-form paragraphs — too dense for mobile.
- **Whoop onboarding**: pictogram-first for body regions (an outline of a wrist, an outline of a shoulder). Steal: the concept of a pictogram as a visual anchor per question. Reject: their photorealistic body imagery — expensive, wrong tone, brittle to update.

---

## What this decision does NOT solve

- **Movement reference video / "what does chest-to-wall handstand look like?"** — deferred. Day 3 retest UI is where movement reference belongs, not intake. Separate brief when we shape the retest flow.
- **Intake edit-in-place after signup** — the founder's "returning user wants to change age band" scenario. Design of an `/profile/programs/handstand-walk/intake` edit surface is a separate brief. This decision leaves the primitive (SectionCard) usable for that later.
- **Intake analytics** — this brief does not add instrumentation. If we want to know where users drop off, that's a separate observability decision.
- **The physical-tests details panel remaining collapsed by default** — kept for this iteration. If field data shows users blowing past it and regretting it, revisit as its own decision.
- **Consent-first policy on gate reversal** — if a user picks "Yes — diagnosed" and then flips to "No" to unblock themselves, we currently allow it silently. That's the correct default (undoable within session) but worth a follow-up review with `app-copy-clarity` on whether the block banner should stay in the DOM as a dismissed toast.

---

## Estimated implementation cost

**6-8 hours, high confidence.** One file (`IntakeClient.tsx`), one CSS additive diff (`globals.css`), zero schema change. Split:

- 2h — `SectionCard` refactor from `QuestionGroup`, plumb `step` + `tone` props.
- 1h — chip semantic-weight branch on `isUnsafe`.
- 1h — `PictogramTile` (three variants, CSS-only).
- 1h — Sticky top progress rail + move progress out of the footer.
- 1h — `CalibrationHintDisclosure` reading from `option.hint`.
- 1h — a11y pass (roles, `aria-hidden`, `aria-current`) and cross-browser sanity on the pictogram border-trick triangles.

Delegate handoffs (visual-craft, mobile-ux, a11y, copy) run in parallel behind the merge — the primitives ship first.
