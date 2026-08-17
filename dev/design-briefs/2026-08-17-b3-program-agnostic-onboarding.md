# B3 — Program-agnostic onboarding

Owner: product-design-lead
Written: 2026-08-17
Status: draft — awaiting founder review
Related audits: `dev/audits/app/2026-08-17-app-audit-copy-clarity.md` (§6, §Fix-index), `dev/audits/app/2026-08-17-app-audit-landing-alignment.md`
Blocks / blocked by: aligns with `dev/active/saas-launch/plan.md` §7 Phase 1 ("Extract Margus's current program into `programs/anterior-hip-rebuild.json` as v1 template"). Depends on nothing shipped; the intake wizard (`programs/[slug]/ProgramPreviewClient.tsx`) is the neighbour but does not need to move first.

---

## The call

**Move onboarding out of `Onboarding.tsx` and into declarative `onboarding_steps` on each program JSON, rendered by a program-agnostic `<OnboardingRunner>` over a closed union of 5 primitive step types.** Legacy hip-rebuild copy migrates verbatim into `anterior-hip-rebuild.json`. Programs without `onboarding_steps` get a single shared fallback splash — never zero.

**Why (three-line summary):**
- Every future program author (Deadlift Base, Muscle-Up, Zone-2 v2) ships steps in JSON only — no component edits, no branch conditions. The `active_program_id === "anterior-hip-rebuild"` gate at `next-app/src/components/Onboarding.tsx:65` is a monument to the wrong seam.
- The current file quietly *writes symptom data* on completion (`Onboarding.tsx:81-97` calls `setDaySymptoms`) — a consent-first violation the audit flagged and the SaaS-launch legal work at `dev/active/saas-launch/plan.md` §6 makes non-negotiable. Splitting onboarding into declared primitives forces the consent moment to become explicit and per-primitive.
- The five shipping programs already need visibly different onboardings (Engine Builder needs Life-load + Zone-1/2 primer; Handstand Walk needs a scan-anchor and a wrist-symptom primer; Rowing 2K needs a scan-anchor around a target test date). A hardcoded 2-step generic modal would be a fast lie; per-program JSON is the same appetite (~6-8h) that scales indefinitely.

---

## The problem

`next-app/src/components/Onboarding.tsx:64-78` gates the entire onboarding modal on `activeSlug === "anterior-hip-rebuild"`. `persona-strength` (engine-builder) and `persona-erratic` (concurrent-strength) fresh signups render `null` — they get no scale-anchor, no Life-load definition, no "here's how Terav proposes and you accept" primer. The copy-clarity audit calls this out at §6 and again in `dev/audits/app/2026-08-17-app-audit-copy-clarity.md:177`. Landing at `landing/src/i18n/dictionaries/en.ts` promises "Every session, against your log" — but a fresh engine-builder user doesn't even know what a Life-load rating means before they first hit `/check`.

The fast fix — bolt a hardcoded 2-step generic modal in front of the hip-specific 3-step — is the wrong seam. It solves today's persona regressions without unblocking any future program author. Next month's Deadlift Base needs a 1RM anchor step. Muscle-Up needs a strict-pullup prerequisite gate. Rowing 2K needs a target-test-date. Each of those is a code diff in `Onboarding.tsx` under the fast approach. Under the declarative approach, each is a JSON field.

**Scenarios the design must survive:**
1. Author ships a 6th program next month — writes JSON, no TSX diff, onboarding renders correctly.
2. Hip-rebuild user completes onboarding, then switches to engine-builder — the engine-builder onboarding must run (different program, different anchor, different consent).
3. Persona-recover morning-symptomatic — the symptom primer must run before any data write; the user must be able to dismiss without silent mutation.
4. Persona-strength cycle-end overperformer — the scale-anchor must land as "energy / readiness / recovery", not as "pain".
5. Persona-erratic 15 skips — user re-enters the app after 20 days — no forced re-onboarding.
6. Offline first-run — cached program JSON must include steps; no network round-trip on `/`.
7. Screen-reader user — step counter reads as live-polite; focus trap works; ESC dismisses.
8. Reduced-motion user — no fade/scale entrance; instant open.
9. Estonian / Russian later — strings must be locale-swappable without touching the primitive union.
10. GDPR-honest for any medical write (rehab programs' symptom primer) — no write without an explicit tap on a labelled "Save today's check" button.

---

## Options considered

### Option A — Hardcoded 2-step generic + keep hip-specific gated

- **Shape:** Add a 2-step "scale + life-load" prologue to `Onboarding.tsx`; keep the current 3-step hip flow behind the same `activeSlug === "anterior-hip-rebuild"` gate; render prologue first for everyone.
- **Sketch:**
```
+---------------------------------+
|  Step 1 of 2 · The 0-10 scale   |
|  ... (generic for everyone)     |
+---------------------------------+
             then, if hip:
+---------------------------------+
|  Step 3 of 5 · Low back today   |
|  ... (hip-only, gated in TSX)   |
+---------------------------------+
```
- **Pros:** 30 min to build. Ships today.
- **Cons:** Every new program means another TSX branch. Program authors can't ship without engineering. Consent-first is still violated because the hip write happens silently on "Start". The scale-anchor copy is program-agnostic but the *scale itself* is not — engine-builder's scale is "readiness 0-10 where 10 = peak", handstand's is "wrist symptom 0-10 where 10 = can't bear weight", rowing's is "life-load 0-10 where 10 = wrecked". One generic copy lies to three of five programs.
- **Verdict:** rejected. This is the "fast option kept for contrast" — it solves the persona regression without solving the underlying seam.

### Option B — Move everything to a `<OnboardingProvider>` context with a program-keyed switch

- **Shape:** Keep the modal component as-is, but wrap it in a provider that reads program metadata and swaps step definitions inline. Steps are still TS-authored, but colocated per program in a `next-app/src/lib/onboarding/steps/{slug}.ts` file.
- **Pros:** Type-safe. Reusable primitives possible. Better than A.
- **Cons:** Program authors still write TSX (or a TS module). No parity with the SaaS-launch Phase 1 plan (`dev/active/saas-launch/plan.md:44` says program authors ship `program.json`, not code). No path to a future no-code / low-code program editor. Still a compile-time coupling to the program set.
- **Verdict:** rejected. A half-measure with all the friction of code, none of the leverage of data.

### Option C — Declarative `onboarding_steps` in the program JSON, rendered by a program-agnostic `<OnboardingRunner>`

- **Shape:** Each program's JSON gains an optional `onboarding_steps: OnboardingStep[]` array. The union is 5 primitives: `scale_anchor`, `life_load`, `symptom_primer`, `scan_anchor`, `custom_copy`. Onboarding.tsx becomes `OnboardingRunner.tsx` — pure renderer over `steps`. When a program has no `onboarding_steps`, a single shared fallback splash renders (the "how the app proposes and you accept" primer).
- **Pros:** New programs = JSON only. Aligns with the SaaS-launch data-first ethos at `dev/active/saas-launch/plan.md` §3, §7. Locale is the same shape (`title_et`, `body_et` per step field, or a keyed dictionary — decided below). Explicit consent moment surfaces as `symptom_primer` with a required "Save today's check" primary action distinct from step-through. Fail-loud validation via Zod (`schemas.ts`).
- **Cons:** Requires migrating the hip-rebuild copy out of `Onboarding.tsx` into `anterior-hip-rebuild.json`. One-time cost, ~1h. Program authors need to learn 5 primitives — cheap docs cost. Illustrations become a first-class field (see §Future-proofing).
- **Verdict:** **winner.**

---

## Chosen: Option C — Declarative `onboarding_steps` per program

### The step-type union

Five primitives, no more. Each program composes from this set; the escape hatch is `custom_copy`, deliberately last-resort.

1. **`scale_anchor`** — the 0-10 scale explanation with anchor examples. Read-only (no user input, just orientation). Optional `scale_label` overrides the axis name so engine-builder can say "readiness" instead of "pain".
2. **`life_load`** — collects the Life-load number for today (0-10). Writes to `store.logs[today].symptoms.life_load` on explicit tap. Required consent moment for programs that use life-load in adaptation (engine-builder, concurrent-strength).
3. **`symptom_primer`** — for rehab programs. Read-only introduction to what fields the daily check collects. Does NOT write any medical data; that happens on `/check` after the user explicitly navigates. Names the fields so first `/check` view is not a cold surprise.
4. **`scan_anchor`** — for programs that anchor to a physical measurement or a target date. Presents the anchor and links out to the intake wizard for the actual capture. Handstand needs wall-hold time, Rowing 2K needs target-test-date, First Strict Pullup needs dead-hang time. This primitive is a *pointer* — not a data-entry form. It reduces to "here's what we'll measure at intake next screen".
5. **`custom_copy`** — `{ title, body_md, illustration_id?, primary_cta_label?, secondary_cta_label? }`. Escape hatch for anything the four above don't cover. Argue in review before shipping; if two programs use `custom_copy` for the same purpose, it becomes a 6th primitive.

**Explicitly rejected as a primitive: `retest_reminder`.** Retest is a Progress-page concern (`RetestMetricsPanel.tsx` already surfaces it). Front-loading a retest-reminder at onboarding is premature — the user has zero baseline. Kill this before it ships. If the pattern is needed later, it fires from `/progress` at the right moment.

### JSON schema (Zod, drop into `next-app/src/lib/schemas.ts` above `programSchema`)

```ts
// next-app/src/lib/schemas.ts — new export, near line 275 (above programIntakeSchema)
export const onboardingStepSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("scale_anchor"),
    id: z.string(),
    scale_label: z.string(),               // "pain" | "readiness" | "wrist symptom" | ...
    anchor_low: z.string(),                // "0 = nothing"
    anchor_mid: z.string().optional(),     // "4 = mild"
    anchor_high: z.string(),               // "10 = severe"
    body_md: z.string().optional(),
  }),
  z.object({
    type: z.literal("life_load"),
    id: z.string(),
    prompt: z.string(),                    // "How's the load outside training today?"
    body_md: z.string().optional(),
    required_consent_key: z.enum(["symptom_data"]).optional(),
  }),
  z.object({
    type: z.literal("symptom_primer"),
    id: z.string(),
    fields: z.array(z.object({
      label: z.string(),                   // "Low back"
      scale: z.enum(["0-10", "yes-no", "minutes"]),
    })),
    consent_note_md: z.string(),           // GDPR-honest sentence about where this lands
  }),
  z.object({
    type: z.literal("scan_anchor"),
    id: z.string(),
    anchor_name: z.string(),               // "Wall handstand hold" | "Target 2K test date"
    body_md: z.string(),
    routes_to: z.enum(["intake_wizard", "capture_now"]).default("intake_wizard"),
  }),
  z.object({
    type: z.literal("custom_copy"),
    id: z.string(),
    title: z.string(),
    body_md: z.string(),
    illustration_id: z.string().optional(),
    primary_cta_label: z.string().optional(),
    secondary_cta_label: z.string().optional(),
  }),
]);

export const onboardingStepsSchema = z.array(onboardingStepSchema).max(6);
export type OnboardingStep = z.infer<typeof onboardingStepSchema>;
```

Add to `programSchema` (`schemas.ts:366-506`): `onboarding_steps: onboardingStepsSchema.optional()`. Optional keeps every legacy program valid.

**Fail-loud on unknown step types.** `z.discriminatedUnion` throws on unknown `type` at program-load time in `next-app/src/lib/program-templates.ts`. Programs with a bad step do not load — surface as an error card in `/programs/[slug]`. Better a loud author-time failure than a silent user-facing skip.

### Default step-set per shipping program (6 programs from manifest.json)

| Program | Steps (in order) |
|---|---|
| `anterior-hip-rebuild` | `scale_anchor` (pain) → `symptom_primer` (low_back / groin / sleep) → `custom_copy` ("Your hip decides the load. Green light means we advance.") |
| `engine-builder` | `scale_anchor` (readiness) → `life_load` → `custom_copy` ("You'll spend most sessions in Zone 1-2. Boring is the point.") |
| `concurrent-strength-maintenance` | `scale_anchor` (readiness) → `life_load` → `custom_copy` ("RPE 7 ceiling. If a set feels like an 8, stop. Schumann's number, not ours.") |
| `handstand-walk` | `scale_anchor` (wrist symptom) → `scan_anchor` (wall hold) → `custom_copy` ("If wrists complain, we back off — no exceptions.") |
| `rowing-2k-test-prep` | `scale_anchor` (readiness) → `scan_anchor` (target 2K date) → `life_load` |
| `overhead-mobility` | `scale_anchor` (range-of-motion 0-10) → `custom_copy` ("Daily 10-15 min. Skip a day, the plan doesn't punish.") |

Six is the ceiling on the union's `.max(6)`; four programs hit 3 steps, two hit 3-4. Onboarding is not a form. It is an orientation.

### Zero-step programs — the fallback

If a program has zero `onboarding_steps`, the runner renders a **single shared fallback splash** — one screen, `custom_copy` under the hood, with copy owned by `next-app/src/lib/onboarding/fallback.ts`:

> **Welcome to {programName}.**
> The app proposes, you Accept or Ignore. Every change cites its reasoning.
> Log honestly. Skip when you skip. The plan sharpens either way.

One primary CTA: **Got it**. No secondary. This is Krug's "if it needs explaining, it isn't done" applied to the empty case — one screen, no data write, no scale anchor. Ships as a component export from `next-app/src/components/onboarding/FallbackStep.tsx`.

**Do not ship "no onboarding at all" for a shipped program.** The audit's core finding was a persona hitting Today cold. A one-tap dismiss is fine; nothing is not.

### Skip behavior

- User can **Skip** any step. State survives via `localStorage["program.onboarding.done.<slug>"] = "1"` (per-program key). This is a change from the current single `program.onboarding.done` key at `Onboarding.tsx:10` — necessary for cross-program coherence (see below).
- **Re-open onboarding later:** `/profile` gets a new row: "Re-run onboarding for {activeProgram}". Fires the runner even if the localStorage flag is set. Discoverable but not naggy.
- **Guest / unauthenticated:** runner returns `null`. Same guard as today at `Onboarding.tsx:59`.
- **Already-logged today's symptoms:** for programs whose step-set includes `symptom_primer`, if `store.logs[today].symptoms != null`, the runner skips that step but shows the others. This mirrors current behavior at `Onboarding.tsx:69-71` (`todaySymptomsLogged`).

### Migration for the hip-rebuild flow

**Destructive-ish. One-time. Reviewable diff.**

1. Move the three hip-specific steps ("How's the low back", "How's the left hip / groin", "Slept how many hours") out of `next-app/src/components/Onboarding.tsx:109-134` into `anterior-hip-rebuild.json.onboarding_steps`. The morning-check now lives on `/check`, not the modal — so the hip-flavoured three-question capture is **replaced by** a `symptom_primer` step that says "each morning you'll rate low back, hip/groin, sleep. Head to Check to log today's."
2. `Onboarding.tsx` is renamed and gutted to `next-app/src/components/onboarding/OnboardingRunner.tsx`. All hip-specific state (`Answers`, `finish`) is deleted. `setDaySymptoms` call at `Onboarding.tsx:95` is deleted — that write moves into the `/check` handler where it already exists.
3. Localstorage key migrates: on runner mount, if `localStorage["program.onboarding.done"] === "1"` AND `activeSlug === "anterior-hip-rebuild"`, migrate to `program.onboarding.done.anterior-hip-rebuild` and clear the old key. One tiny useEffect.
4. **Risk named:** hip user who had already completed the old 3-step and been silently symptom-logged today would, under the new flow, see the hip onboarding once more with the *primer* framing. This is desired — they now see the honest "we'll ask you these each morning on /check" language they never saw before. No data loss (the old symptom write is preserved in their log).

### Cross-program coherence when switching

- **User switches program** (e.g. hip → engine-builder): new onboarding fires. Per-program localStorage key means the engine-builder run is un-seen. `Skip` remains available.
- **User has two active programs** (v2 concurrent, `active_program_ids`): the *primary* program's onboarding runs. The secondary can be re-run from `/profile`.
- This aligns with `dev/active/saas-launch/plan.md` §7 Phase 1 ("Skip onboarding if `user_profile.active_program_id` already set") — but corrects the ambiguity: skip *this program's* onboarding if it's been seen, not skip onboarding globally.

### Full wireframe (mobile 393px)

```
+-------------------------------------------+
|  Setup · 2 of 3                           |  <- mono-caps, text-muted
|                                           |
|  Readiness — the 0-10 scale               |  <- h2, text-strong, semibold
|                                           |
|  0 = fresh, 10 = wrecked                  |  <- body, text-muted
|                                           |
|  [ 0 ][ 1 ][ 2 ][ 3 ][ 4 ][ 5 ]           |
|  [ 6 ][ 7 ][ 8 ][ 9 ][10]                 |  <- visual chip row; scale_anchor
|                                           |     is READ-ONLY: chips animate,
|  You'll rate this each morning on         |     no active state, no writes.
|  Check. Not a diagnosis — a trend line.   |
|                                           |
|                                           |
|  [ Skip setup ]         [ Next ]          |  <- Skip = ghost, Next = bronze
|   (44x44 min)         (thumb-zone)         |
+-------------------------------------------+
       ↑ safe-area-inset-bottom padding
```

For `life_load` and `symptom_primer` the primary CTA changes label (`Save today's check` / `Got it`) and behavior differs — see §Consent-first below.

### Cross-persona coherence check

| Persona | State | Does the design hold? | Notes |
|---|---|---|---|
| persona-recover | fresh hip-rebuild, symptomatic morning | y | `scale_anchor` names pain; `symptom_primer` warns before /check; no silent write |
| persona-strength | fresh engine-builder, overperformer | y | `scale_anchor` names *readiness* not pain; `life_load` is optional to save |
| persona-erratic | fresh concurrent-strength, life-load noisy | y | 3 steps, all skippable; per-program key means re-onboarding after 20-day gap doesn't re-fire |
| persona-recover | switches to overhead-mobility mid-recovery | y | Different program → different onboarding fires once; hip data preserved |
| persona-strength | zero-step program (hypothetical future) | y | Fallback splash fires — not silence |

### Modern-standard checks

- **iOS HIG:** Full-screen dialog with `bg-ground/95 backdrop-blur-sm` — retained from current `Onboarding.tsx:143`. Safe-area padding on the CTA row (`pb-[env(safe-area-inset-bottom)]`) added. Tap targets ≥ 44×44. **Pass.**
- **Material 3:** Motion-token bucket for entrance = `duration-200 ease-out` (short bucket). Reduced-motion respects `globals.css` §F1 wrapper (already shipped). **Pass.**
- **Refactoring UI:** One primary bronze CTA per step. Skip is ghost, not competing. Hierarchy through weight + step counter, not size stacking. **Pass.**
- **`prefers-reduced-motion`:** Instant open, no scale/fade. Handled globally by the existing `@media (prefers-reduced-motion: reduce)` block in `globals.css`. **Pass.**
- **Fitts's law:** Primary CTA in bottom-right thumb cradle; Skip on the far left (opposite thumb, harder to accidentally hit). Step counter top-center — non-interactive. **Pass.**

---

## Data shape changes

```ts
// next-app/src/lib/schemas.ts — add near line 275
export const onboardingStepSchema = z.discriminatedUnion("type", [ /* see above */ ]);
export const onboardingStepsSchema = z.array(onboardingStepSchema).max(6);
export type OnboardingStep = z.infer<typeof onboardingStepSchema>;

// programSchema (schemas.ts:366) gains:
onboarding_steps: onboardingStepsSchema.optional(),
```

Store change — none. Onboarding state lives in localStorage per program: `program.onboarding.done.<slug>`. No Zustand write. No sync round-trip. iOS Safari ITP 7-day clear will re-fire onboarding — acceptable and desirable (the user gets re-oriented).

**No schema migration for existing logs.** The `symptoms` shape at `schemas.ts:541-562` already carries `life_load` (line 561). The `life_load` step writes to the existing field. No new columns.

---

## Component tree

Current:
```
AppShell
└── Onboarding (single file, 230 lines, hip-hardcoded)
    ├── steps[] (inline, 3 hip questions)
    ├── setDaySymptoms (silent write on finish) ← consent violation
    └── focus trap
```

Proposed:
```
AppShell
└── OnboardingRunner (pure renderer, reads program.onboarding_steps)
    ├── steps[] (from program JSON)
    ├── <StepRenderer> switch:
    │   ├── ScaleAnchorStep (read-only, no writes)
    │   ├── LifeLoadStep (explicit tap → writes life_load)
    │   ├── SymptomPrimerStep (read-only, GDPR note)
    │   ├── ScanAnchorStep (routes to /programs/[slug]/intake)
    │   └── CustomCopyStep (markdown body)
    ├── <FallbackStep> (rendered when program has no steps)
    └── focus trap + reduced-motion honoring
```

### File-level changes

- `next-app/src/lib/schemas.ts:275` — insert `onboardingStepSchema` + `onboardingStepsSchema`; add `onboarding_steps` field to `programSchema` at ~line 389.
- `next-app/src/components/Onboarding.tsx:1-230` — **delete**. Replace with a new folder `next-app/src/components/onboarding/`.
- `next-app/src/components/onboarding/OnboardingRunner.tsx` — new, ~120 lines. Reads `useStore((s) => s.store.user_profile?.active_program_id)`, loads program via existing `program-templates.ts`, renders steps, owns the localStorage key, owns focus trap.
- `next-app/src/components/onboarding/ScaleAnchorStep.tsx` — new, ~40 lines. Read-only chip row.
- `next-app/src/components/onboarding/LifeLoadStep.tsx` — new, ~50 lines. Chip row + primary CTA writes `life_load` via `setDaySymptoms`.
- `next-app/src/components/onboarding/SymptomPrimerStep.tsx` — new, ~40 lines. Field-list + GDPR sentence.
- `next-app/src/components/onboarding/ScanAnchorStep.tsx` — new, ~40 lines. Copy + link to intake.
- `next-app/src/components/onboarding/CustomCopyStep.tsx` — new, ~30 lines. Markdown body.
- `next-app/src/components/onboarding/FallbackStep.tsx` — new, ~30 lines. Universal splash.
- `next-app/src/components/AppShell.tsx:10, 110` — rewrite import from `Onboarding` to `OnboardingRunner`.
- `next-app/src/lib/store.ts:371, 903` — the `localStorage.removeItem("program.onboarding.done")` calls need to loop-remove the per-program keys instead. Small change, ~4 lines each site.
- `next-app/public/data/programs/anterior-hip-rebuild.json` — add `onboarding_steps` with 3 steps (scale + symptom_primer + custom_copy).
- `next-app/public/data/programs/engine-builder.json` — add 3 steps.
- `next-app/public/data/programs/concurrent-strength-maintenance.json` — add 3 steps.
- `next-app/public/data/programs/handstand-walk.json` — add 3 steps.
- `next-app/public/data/programs/rowing-2k-test-prep.json` — add 3 steps.
- `next-app/public/data/programs/overhead-mobility.json` — add 2 steps.
- `next-app/src/app/profile/page.tsx` — add "Re-run onboarding" row that clears the per-program key.

### Delegate to specialists

- **Microcopy:** → `app-copy-clarity` — write the `title`, `body_md`, `anchor_low/mid/high` for each of 6 programs × 3 steps. Enforce the strings budget (≤ 24 words per body). Anchor language must match the Guide's Green/Amber/Red section (`guide/page.tsx:136`) and the Life-load definition.
- **A11y:** → `app-accessibility` — verify focus trap on OnboardingRunner, step counter as `aria-live="polite"`, ESC dismisses, focus restores to `<h1>Today</h1>` on close. Contrast on the step counter (currently mono-caps text-muted at `Onboarding.tsx:147`).
- **Type / color:** → `app-visual-craft` — apply the codemodded type ramp (10/12/14/16/18/24-30) to the new components. Confirm bronze primary CTA, ghost secondary Skip — no rogue accent colors.
- **Thumb reach:** → `app-mobile-ux` — verify primary CTA in bottom-right thumb cradle, ≥ 44×44 tap targets on scale chips (currently `aspect-square` at grid-cols-6 = ~55px each on 393px viewport, passes), safe-area-inset on CTA row.

---

## Migration

Destructive on one file (`Onboarding.tsx` deleted), additive on six JSONs. Steps:

1. Ship the schema change (`schemas.ts` addition) + validation. This is backward-compat — no program has `onboarding_steps` yet, everything still validates.
2. Ship the new `OnboardingRunner` + step components. Do NOT wire it into `AppShell` yet.
3. Author steps into 6 program JSONs. Verify each with the existing `for f in data/*.json; do python3 -m json.tool "$f" > /dev/null; done` gate (per `CLAUDE.md` §Validation).
4. Swap `AppShell.tsx:110` from `<Onboarding />` to `<OnboardingRunner />`.
5. Delete `Onboarding.tsx`.
6. Ship the localStorage key migration (one useEffect in OnboardingRunner).

**Rollback plan:** revert steps 4-6 as one commit. Steps 1-3 stay — additive-only, harmless if the runner isn't wired.

---

## Future-proofing scenarios (must-hold list)

- **New program next month:** author writes `onboarding_steps` in JSON, no TSX. **Passes.**
- **Illustration in a step:** `custom_copy.illustration_id?: string` resolves to a static asset under `/public/images/onboarding/`. Not markdown-image — first-class field. Prevents raw URL sprawl in copy. **Passes.**
- **Multilingual (Estonian, Russian):** step strings live in the program JSON *denormalized* (`title`, `title_et`, `title_ru`). This matches the existing pattern in `exerciseSchema:38` (`name_et`). A dictionary-keyed approach was considered and rejected — programs are already the shipping unit, colocating strings keeps the review surface single-file. **Passes.**
- **A11y:** focus trap already implemented via `useFocusTrap` (`Onboarding.tsx:79`); OnboardingRunner keeps it. Step counter becomes `<p aria-live="polite">`. ESC dismisses. Focus restores to `document.querySelector("h1")` on close. **Passes.**
- **Reduced motion:** the `@media (prefers-reduced-motion: reduce)` block in `globals.css` (shipped in F1) handles this globally. No component-level branching needed. **Passes.**
- **Offline:** program JSONs are served from `/public/data/programs/*.json` and cached by the Next.js SW. Onboarding steps ship in the same bundle. **Passes.**
- **Consent-first (rehab programs):** `symptom_primer` writes **nothing**. `life_load` writes only on explicit tap of the labelled primary CTA. Both include a GDPR-honest note about where data lands (localStorage + KV via `dev/active/saas-launch/plan.md` §5). Skip is always available, never disabled. **Passes.**

---

## Peer benchmarks

- **Linear onboarding** (linear.app first-run): 3 screens, declarative under the hood, no data write until final "Create workspace" tap. Steal: the discipline of *one primary action per screen*. Reject: they use full-screen slideshow motion; we honor `prefers-reduced-motion` and keep it instant.
- **Cal.com onboarding**: uses a `steps` array in TS that a `<OnboardingLayout>` renders. Same shape we're proposing — but Cal keeps it in TS because their programs are all Cal-authored. We're one seam further out (data-driven) because our programs are content, not code. Steal: the OnboardingLayout skeleton (progress bar top, CTA row bottom, content middle). Reject: their step type is `React.FC` — that's the Option B path we already rejected.
- **Whoop first-run**: a mixed anchor / consent flow. Every write is behind an explicit tap and a "why we ask" disclosure. Steal: the "why we ask" line beneath each symptom-primer field. Reject: Whoop's onboarding takes 8+ minutes — too much for a training log with a mostly-honest audience.

---

## What this decision does NOT solve

- Intake wizard (`ProgramPreviewClient.tsx`) — separate concern. Onboarding is orientation; intake is capture. `scan_anchor` links to intake but does not replace it. Deferred to its own brief if the surface reveals gaps.
- Consent modal for GDPR at signup — separate concern owned by the SaaS-launch legal work (`saas-launch/plan.md` §6). Onboarding assumes consent has been granted elsewhere.
- Retest-week reveal card — owned by Progress, not onboarding. Killed the `retest_reminder` primitive above; if a retest primer is needed, it fires from `/progress`.
- Post-onboarding first-run tutorial overlay on Today — `saas-launch/tasks.md` Phase 4 lists it. Different surface, different lifecycle.
- Empty-state Today when no program is picked — already handled by `NoActiveProgram` component; the runner correctly returns null in that state.

---

## Estimated implementation cost

**6-8h, high confidence.** Schema + 6 small step components + runner + wiring + 6 JSON edits + one localStorage migration. No engine changes, no store shape changes beyond the additive schema field. Copy authoring for 6 programs adds another 2-3h owned by `app-copy-clarity`.

---

**Files delivered:** `/Users/margussellin/www/program/dev/design-briefs/2026-08-17-b3-program-agnostic-onboarding.md`
