# CLAUDE.md

Project context for Claude Code sessions in this repo.

## What this is

**Terav** — a focused-improvement training app. Landing: https://terav.fit. App: https://app.terav.fit.
Positioning: pick one focus (an engine, a skill, a lift, a stubborn joint); Terav sharpens that
arc every session against your log; runs alongside your existing week. NOT a full training plan.

Multi-user beta (Supabase auth + KV state sync). 5 shipping programs across strength (5/3/1
anterior-hip), aerobic (Engine Builder), concurrent (CSM), skill (Handstand Walk), mobility
(Overhead), and race-anchored (Rowing 2K Test Prep). Confirm-first mechanic — engine proposes,
user Accepts, every change cites a study OR names its log signal.

Data model at `data/` was originally seeded from Margus's own multi-year rehab logs (still the
`anterior-hip-rebuild` program's clinical context) — derived from ten Digilugu / Terviseportaal
documents covering 2020-12 to 2023-11. The source PDFs are NOT in this repo and should not be
added — they contain isikukood and provider identifiers. Hip-rebuild remains `personal: true`
in the manifest; other programs are catalog-public.

## Read these first

1. `data/clinical-context.json` — findings, exam results, history, provocative positions,
   red flags. This is the constraint set. Everything else must respect it.
2. `data/open-questions.json` — ten unanswered questions with rationale and impact
   mapping. Until these are answered, program content is provisional.
3. `data/exercises.json` — movement library, 24 exercises, plus class modifications.
4. `data/program.json` — blocks, phases, progression rules. Marked `PROVISIONAL`.

## Non-obvious reasoning you would not otherwise recover

**The left hip findings do not match the left hip symptoms.** The left labral lesion is
superior-POSTERIOR. Documented pain is ANTERIOR (groin, "puusaliigese eesmisel pinnal").
Meanwhile the anterior lesion is on the asymptomatic right side. Combined with groin pain
on resisted straight-leg raise (documented twice, a year apart) and clicking in the
LOWERING phase of hanging leg raises, the working hypothesis is iliopsoas involvement,
not labral pathology. Labral changes are common in asymptomatic athletes. Do not build
a labral-tear rehab programme.

**Hanging knee raises and L-sits are wrong for this user**, despite being standard hip
flexor recommendations. They are documented provocateurs. Same for Copenhagen planks as
a first-line choice (adduction load, and FADIR was positive bilaterally) and aggressive
couch stretching (pushes the anterior capsule).

**Possible sacroiliitis was raised in 2021 and never closed out.** See
`open-questions.json` q4. If inflammatory features are present, this stops being a
programming problem.

**Exercise demonstrably worked once.** 2021-01-21: orthopaedist recorded positive
dynamics and significantly improved strength indicators. Do not treat this user as
fragile — the record argues against it.

**The mechanism was disc golf, not just CrossFit.** Both physiatry notes name it.

**Physiotherapy is the highest-value unaddressed action.** Two referrals, one attended
session. Any advice generated here should keep saying so rather than substituting for it.

## Hard constraints on generated content

- Never reintroduce a movement flagged in `clinical-context.json.provocative_positions`
  without an explicit phase gate and symptom condition.
- Every `exercise_id` in `program.json` must resolve against `exercises.json`.
- `exercises.json` is a **shared** library rendered to every user of every catalog
  program. Its `cues`, `cues_external_focus`, `cues_internal_focus` and `rationale`
  must be general coaching copy — no named side, no documented deficit, no specific
  diagnosis, no personal training number. Constraints belonging to one person's
  clinical record go in that program's `exercise_overrides` (see
  `programs/anterior-hip-rebuild.json`), merged at render time by
  `applyProgramExerciseOverrides`. `next-app/src/lib/data-integrity.test.ts` fails
  the suite if personal language reappears in the shared library.
- Progression rules stay machine-evaluable — conditions, not prose.
- Keep the data de-identified. No name, isikukood, provider names or codes.
- This is not medical advice and the files should not present it as such. The user has an
  orthopaedist and a physiatrist; the programme is a supplement to clinical care.

## Workflow for turning PROVISIONAL into real

1. User fills `answer` fields in `data/open-questions.json`.
2. Check q4 first. Inflammatory features present → stop, refer, do not regenerate.
3. Check q1 and q3. These set the starting point and determine whether the
   `barbell_reintroduction` ladder in `program.json` is needed at all.
4. Apply each answered question's `impact` mapping.
5. Regenerate `program.json` only. `exercises.json` and `clinical-context.json` change
   only if new clinical information arrives.
6. Flip `status` from `PROVISIONAL` and record the date.

## App notes

**Both of the claims that used to sit here were false, and had been for a long
time.** `daily_log_schema` is *not* the logging input shape — nothing reads it.
`progression_rules.states[]` does *not* derive `green|amber|red` — nothing reads
that either, and a hardcoded ladder ran instead. Zod strips unknown keys
silently, so every program authored both in good faith and neither ever took
effect. `data-integrity.test.ts` now fails on any top-level key the runtime
discards; both are listed there as knowingly-dead with reasons.

What is actually live (2026-09-02):

- **`symptom_regions[]`** — the region ids a program asks about in the morning
  check. Ids resolve against `lib/symptom-regions.ts`, a shared library programs
  select from the way they select from `exercises.json`. A test fails on an
  unknown id, and on a program that declares none.
- **`lib/symptom-state.ts`** — the one place `green|amber|red` is derived, over
  every scored region rather than four hardcoded ones.

The split is deliberate: **a program declares what feeds the safety gate; it does
not declare how lenient the gate is.** Every program had authored its own
thresholds (`first-strict-pullup` reds at >6 where the app reds at >5). Making
those live would put nine unreviewed threshold sets on the decision that tells
someone not to train, several laxer than the audited default. Same reasoning as
confirm-first: the engine proposes, it does not quietly decide.

Before this, the check rendered `groin_left` / `low_back` / `buttock_left` /
`shoulder_right` — `anterior-hip-rebuild`'s clinical map, the one program marked
`personal: true` — to every user of every program. A pull-up user with medial
epicondylitis had no elbow field and the engine saw green. Storage stayed flat
and unmigrated, so history under the original four still validates and renders.

Suggested MVP is in `README.md`. The history view matters most: a multi-year symptom
record with load context is something none of the clinical notes contain, and it is what
would make the next specialist appointment productive.

## Validation

**There are two data trees. Only one of them ships.**

- `data/` — the author-time clinical corpus this project started from. Nothing in
  the app loads it. `validate.py` checks this tree.
- `next-app/public/data/` — **the runtime data the app actually serves**
  (`data-loader.ts` fetches `/data/programs/*.json`, `/data/exercises.json`,
  `/data/programs/manifest.json`, `/data/citations.json`). This is the tree that
  can break production.

**One command, run from `next-app`:**

```bash
cd next-app && npm run verify
```

Any edit under `next-app/public/data/` — including a one-line citation change —
must pass `npm run verify` before commit. **JSON that parses is not JSON that
validates.** On 2026-09-01 a citation appended to `evidence_base.references[]`
omitted the required `used_for`; the file was valid JSON, `programSchema.parse`
threw at runtime, and the program rendered "Couldn't load program data" for every
user. Two more defects from the same edit — a `reference_ids[]` that drifted out
of sync, and four `capability_slot` values in muscle-up that resolved to zero
drills — were invisible to JSON syntax checking by construction.

Enforced at three points, all running `npm run verify`:

1. **pre-commit hook** — `.githooks/pre-commit`, versioned. Enable once per clone:
   `git config core.hooksPath .githooks`
2. **`npm run deploy`** — verify runs before the build. Still available as a
   manual fallback from the laptop.
3. **CI — `.github/workflows/deploy.yml`** (since 2026-09-01). Push to main
   builds and deploys BOTH Pages projects. This is now the real gate; the
   laptop deploy is the fallback, not the path to production.

**CI gates on three separate things, and they are not the same thing.** Tests
passing does not mean the artifact is correct, and a correct artifact does not
mean production received it:

1. `verify` — the suite. Also the landing's only gate: the landing has no suite
   of its own, and `data-integrity.test.ts` is what asserts its catalog agrees
   with the app manifest.
2. **The built artifact carries its build-time env.** `output: "export"` inlines
   `NEXT_PUBLIC_*` at build time, so a build made without secrets compiles and
   deploys perfectly happily and then nobody can sign in. CI greps `out/` for
   the Supabase host, the `sb_publishable_` key prefix and the Sentry ingest
   host, and refuses to deploy without all three.
3. **The live site serves that exact artifact.** CI records the built
   `main-app-<hash>.js` filename and polls `app.terav.fit` until the live HTML
   asks for that same file.

Gate 3 exists because of a specific failure. On 2026-09-01 a Sentry DSN was
added to a gitignored `.env.local`, verified by grepping the local `out/`
directory, and reported as live. Production had never received the build —
`out/` is what your laptop built, not what Cloudflare serves. Nothing in the
system could tell those two apart, so "I verified it" and "it works" had come
apart with no way to notice.

**Secrets live in GitHub Actions secrets**, not just `.env.local`. A new
`NEXT_PUBLIC_*` var must be added in BOTH places or CI ships a build without
it. Currently: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`,
`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

Referential integrity across the shipped tree — `exercise_id` and `drill_library`
resolution, `capability_slot` satisfiability, `references[]` ↔ `reference_ids[]` ↔
`citations.json`, manifest ↔ filesystem — is asserted in
`next-app/src/lib/data-integrity.test.ts`, alongside the de-identification rules.
An unresolved `exercise_id` does **not** throw: `DaySession` and `OffPlanSession`
both `continue` past it, so the movement silently vanishes from the workout. The
test is the only thing that catches it.

Run vitest from `next-app`, not the repo root — the root sweeps in git worktrees
under `.claude/` and inflates the run.

```bash
cd next-app && npx vitest run src/lib/data-integrity.test.ts
```

That suite covers referential integrity across every manifest program, checks each
`exercise_overrides` key resolves, and guards the shared library against
person-specific clinical copy.
