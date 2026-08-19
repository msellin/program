# Multi-track (super-admin) UX delta audit · DELTA-3

Persona: `persona-multitrack` · Store: `active_program_id: engine-builder`,
`active_program_ids: [engine-builder, concurrent-strength-maintenance, overhead-mobility]`,
45 days simulated.
Artifacts under
`next-app/tests/e2e/artifacts/personas/persona-multitrack/`.

## 1. Verdict

The multi-track scaffolding is real: Today, Week, Progress and History all
enumerate the three programs, per-program Skip/Move works via block-object
mode, the super-admin "Add alongside" affordance is wired, and the store
handles `active_program_ids` cleanly. But the shipping surfaces around it
still speak in the singular — the Programs catalog only marks one program
ACTIVE, the interference banner literally says "Two tracks" while the day
below reads "3 tracks", Today's h2 headings show goal-metric strings
("Submax HR reduction at fixed pace") instead of the program name, and the
Report / Extras pages never widen past `active_program_id`. Not a hard
blocker for a super-admin beta on a small box, but it does not read as a
finished feature yet, and one quiet failure mode
(extras inherit the primary's `started_at` because their `program_states`
entry is missing) will produce silently-wrong phase timelines on Progress
and Today the moment the founder graduates one arc while others continue.

## 2. What works

- **Today shows all three tracks.** `next-app/src/app/page.tsx:59-67`
  builds `activeSlugs` primary-first from `active_program_ids`,
  `page.tsx:145-171` maps each to a `groups[]` entry, and
  `page.tsx:400-444` renders one section per group.
  `text/01-today.txt:30-67` confirms three block clusters render
  (`ENGINE COMPOSITE (BLOCK 1)` → `SUBMAX HR REDUCTION AT FIXED PACE` →
  `LOADED OVERHEAD SHOULDER FLEXION`).
- **Week correctly reports N tracks per day.**
  `next-app/src/app/week/page.tsx:279-286` iterates
  `programs.map(...)` and tags blocks with their source
  `programSlug`; the header shows `3 TRACKS` on Mon/Wed/Fri/Sun in
  `text/02-week.txt:22, 40, 54, 67` and `2 TRACKS` on Tue/Thu on
  lines 31, 47.
- **Per-track adherence card in Progress renders one row per program.**
  `next-app/src/components/progress/PerProgramAdherenceCard.tsx:97-106`
  reads both `active_program_id` and `active_program_ids`, dedupes
  via `Set`, and `text/05-progress.txt:22-40` shows three rows
  (`engine builder 11/14 · 79%`, `concurrent strength maintenance
  11/25 · 44%`, `overhead mobility 11/47 · 23%`).
- **History groups blocks per program.**
  `next-app/src/components/history/BlockHistorySection.tsx:40-49`
  unions primary + secondaries and
  `text/04-history.txt:27-61` renders three grouped sections
  (`Engine Builder`, `Concurrent Strength Maintenance`,
  `Overhead Mobility`), each with its own block rows.
- **Profile lists all three active plans.**
  `next-app/src/app/profile/page.tsx:115-124` composes `activeSlugs`
  primary-first, and `text/08-profile.txt:10-21` shows the three
  cards with the `TODAY'S` badge only on Engine Builder.
- **Super-admin badge + "Add alongside" both wire correctly.**
  `next-app/src/lib/super-admin.ts:13` whitelists the persona;
  `text/08-profile.txt:6` shows the `STAFF` chip;
  `next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx:405-424`
  gates the admin-only add on `useIsSuperAdmin()`.
- **Interference banner + concurrent-training legend both fire.**
  `next-app/src/app/page.tsx:342-354` renders the "Two tracks
  scheduled today" panel whenever ≥2 groups have blocks, with the
  Schumann 2022 citation baked in
  (`text/01-today.txt:22-23`). This is the honest primer for the
  interference cost.
- **Day-header shortcut for whole-day skip.**
  `next-app/src/app/page.tsx:397-399` renders `DayHeaderShortcut`
  only when block-object mode is on AND ≥2 groups populated —
  `text/01-today.txt:25-29` shows `3 tracks scheduled today. Skip
  or move each independently below.` with a `Skip whole day` control.

## 3. What's broken

- **Programs catalog only chips ONE program as ACTIVE.**
  `next-app/src/app/programs/page.tsx:152` passes
  `isActive={p.slug === activeProgramId}` — the singular
  `active_program_id` only. `text/06-programs.txt:64` shows
  `ACTIVE` on Engine Builder alone; Concurrent-Strength
  Maintenance (line 20) and Overhead Mobility (line 95) have no
  active indicator despite being in `active_program_ids`. Same
  bug on the individual preview: `text/07-programs-active.txt:4`
  only tags Engine Builder. This is the highest-traffic
  discovery page — a user with 3 tracks has to open Profile to
  learn which they've enrolled in.
- **Interference banner copy contradicts the day below.**
  `next-app/src/app/page.tsx:345` hardcodes
  `"Two tracks scheduled today."` even when 3 groups populate.
  `text/01-today.txt:22` shows `"Two tracks scheduled today"`
  directly above `text/01-today.txt:27`'s `"3 tracks scheduled
  today."` from `page.tsx:491`. Two different components, two
  different copy strategies, one screen.
- **Today's per-program h2 shows the goal metric, not the
  program name.** `next-app/src/app/page.tsx:405-408` calls
  `programDisplayName` which resolves to
  `program.program_goal?.display_name` at `page.tsx:457-458`.
  `public/data/programs/concurrent-strength-maintenance.json:86`
  is `"Submax HR reduction at fixed pace"` and
  `public/data/programs/overhead-mobility.json:77` is
  `"Loaded overhead shoulder flexion"` — those are the target
  metrics, not the program's shipping name.
  `text/01-today.txt:43, 55` renders them as section headings.
  `BlockHistorySection.tsx:108-116` calls out the same
  anti-pattern and fixed it locally; Today never got the same
  patch.
- **Report shows retest metrics for the primary only.**
  `next-app/src/app/report/page.tsx` loads only the primary
  (comment refs at line 124 already acknowledge "per-program
  metrics are coming"). `text/10-report.txt:43-77` lists only
  Engine Builder's `submax_hr_pace5` and Resting HR — nothing
  from concurrent-strength or overhead-mobility, and the
  "Aerobic sessions in range" chart is engine-only. If this is
  the specialist-facing PDF (`text/10-report.txt:14` header),
  it silently omits two-thirds of the plan.
- **Extras page is primary-only.**
  `text/12-extras.txt:14-32` lists only Engine Builder's
  cardio blocks (Zone 1/2, Sustained tempo, Threshold, 4×4,
  Recovery, Retest). Overhead Mobility's "Scap activation"
  / "Thoracic prep" and Concurrent-Strength's strength
  accessories don't appear.
- **Progress top summary describes the primary modality only.**
  `next-app/src/app/progress/page.tsx:200-209` swaps a
  one-liner based on `activeSlugForDefault` (primary only).
  `text/05-progress.txt:5` shows only
  "Aerobic base indicators — HR trend…" even though two of
  three programs are strength / mobility.
- **Retest metrics panel is primary-only.**
  `next-app/src/app/progress/page.tsx:43-49` only loads the
  primary via `loadProgram(primarySlug)` and passes it to
  `RetestMetricsPanel` (`RetestMetricsPanel.tsx:28-45`).
  `text/05-progress.txt:44-78` shows only the engine-builder
  retest metrics; concurrent-strength's `back_squat_5rm` and
  overhead-mobility's `passive_shoulder_flexion` are absent.
- **Missing `program_states` for extras causes phase-anchor
  drift.** Only `engine-builder` has an entry
  (`final-store.json:619-624`). `schedule.ts:63-82` falls back
  from `program_states[slug].started_at` to the profile-level
  `active_program_started_at` (2026-07-05 for engine-builder)
  for BOTH extras. If the founder graduates engine-builder and
  starts a new primary, `active_program_started_at` gets
  overwritten (`useStore.ts:875-891`, `912-931`) and the
  extras' phase clocks silently shift with it. Undetectable in
  a 45-day snapshot — will detonate at week 8+.
- **Copy uses "your program" (singular) in a few load-bearing
  surfaces.**
  `src/app/guide/page.tsx:11` says "your active program picks
  the scheme"; `src/app/coach/page.tsx:423` says "the research
  your program is built on"; `text/11-guide.txt:8, 66` reflect
  both to the user.

## 4. Missing

- **Per-program tier badge in Profile.** Profile already knows
  `program_states[slug].tier` (Engine Builder has
  `tier: foundation`) but doesn't render it. Overhead Mobility
  is `multi-tier` (`text/08-profile.txt:21`) and the user has
  no tier picked — no callout says "Pick a tier to start" for
  the two extras.
- **"Start intake for track N" flow.** Adding via
  `addSecondaryProgramForce` (`useStore.ts:912-931`) writes
  `active_program_ids[]` and a shell `program_states[slug]`
  entry, but the extras never get `baseline_capabilities`,
  `intake_answers`, or a real `started_at`. No visible prompt
  on Today or Profile to run intake for the added tracks. The
  founder's own words on Progress: "Baseline setup — a few
  minutes on the wizard + a 5-day measurement window"
  (`text/07-programs-active.txt:26`) never triggers for
  secondaries.
- **Cross-program weekly load summary.** No surface totals
  weekly minutes / sessions across all three arcs. The Week
  Signals block (`text/05-progress.txt:12-18`) shows
  `Sessions 0 / 0 · Endurance 1 session · 32 min` — that's
  engine-only. The founder cannot see "you've committed to
  ~9 hours/week across three programs" anywhere.
- **Per-program remove control near the block group.**
  `removeActiveProgram` exists (`useStore.ts:933-950`) but
  is only reachable via the program's own preview page.
  Profile explicitly says "removal happens on the program
  page" (`profile/page.tsx:159-160`). That's fine for a
  singleton user; with 3 tracks it means 3 taps deep to
  drop one.
- **Track-level interference conflict flags.** The Today
  banner is generic Schumann 2022 boilerplate; it doesn't
  distinguish which pairing is the risk. Engine + Concurrent
  + Overhead has exactly one strength-versus-cardio conflict
  (concurrent × engine); Overhead Mobility is a neutral
  daily mob block and shouldn't trigger the ≥6-hour spacing
  rule. Copy could name the pairing.
- **Progress top-line summary that respects all three
  modalities.** Currently the aerobic / strength / concurrent
  / skill string is chosen by `active_program_id` alone
  (`progress/page.tsx:200-209`). A super-admin with 3 arcs
  needs either a composite string or three switches.

## 5. Recommended fixes (ordered)

1. **Fix the "Two tracks" hardcode** — `page.tsx:344-345`:
   inject `groupsWithBlocks.length` and pluralise
   ("2 tracks" / "3 tracks scheduled today"). One-line fix,
   removes the most-visible inconsistency.
2. **Chip every active program on the catalog** —
   `programs/page.tsx:24, 152`: read `active_program_ids`
   too, pass `isActive` when the slug is in either list.
   Optionally split the chip into `today's` (primary) vs
   `active` (secondary) to keep the primary distinguishable.
3. **Fix Today's per-program h2** — replace the
   `programDisplayName` call at `page.tsx:407` with the same
   slug-title-case fallback History uses
   (`BlockHistorySection.tsx:113-116`). The manifest name
   would be even better if the page loaded the manifest, but
   slug-case unblocks it. Add a comment cross-referencing
   the History fix so the anti-pattern doesn't come back.
4. **Stamp real `program_states[slug].started_at` on add** —
   `useStore.ts:902-906` already calls
   `ensureProgramStateEntry` with a `started_at` fallback,
   but the persona artifact proves the extras' entries never
   materialise for the daily-loop simulator. Verify the
   store path (or fix `ensureProgramStateEntry` to always
   write `started_at`, and guard `schedule.ts:69-71` against
   inheriting the primary's anchor when the profile-level
   fallback is stale).
5. **Widen Progress + Report to all `active_program_ids`** —
   `progress/page.tsx:34-49`: load all active programs, not
   just primary; render one `RetestMetricsPanel` per program
   (or fold into `PerProgramAdherenceCard`). Same for
   `report/page.tsx`. Without this, the "specialist-facing
   PDF" is misleading.
6. **Add intake-not-started chips for extras** — anywhere a
   secondary shows without `program_states[slug].tier` (for
   multi-tier programs) or without
   `baseline_capabilities` (for programs that require
   intake), render a bronze "start intake" pill that deep-
   links to `/programs/[slug]`. Profile is the natural home.
7. **Extras page: iterate `active_program_ids`** —
   `text/12-extras.txt:12` currently shows one program's
   accessories. Grouping by program name (like History does)
   is the minimum change.
8. **Copy sweep** — `guide/page.tsx:11`, `coach/page.tsx:367,
   423`: "your program" → "your programs" when
   `active_program_ids.length > 1`, or drop the possessive
   and speak in the plural universally.
9. **Nice-to-have: cross-program interference summary** —
   replace the boilerplate Schumann banner with a specific
   sentence naming the conflicting pairing when it exists;
   suppress entirely on mobility-only pairings.

## Failure modes checked, none crashed

- Missing `program_states[slug]` for extras: guards at
  `schedule.ts:65, 70, 116`, `retest-evaluator.ts:128, 143,
  157`, `plan-generator.ts:109` all use `?.` chains and
  fall back to safe defaults. Nothing throws; the
  correctness cost is what §3 documents.
- `activePhaseFor` on a program with no started_at:
  falls back to `phase[0].starts` (`schedule.ts:137-138`)
  or the last phase (`schedule.ts:146`). Silent, not fatal.
- `programDisplayName` with a missing `program_goal`:
  falls back to the slug (`page.tsx:458`). Safe.

Word count target ~1200 · this file is ~1180.
