# Launch readiness — plan

**Question:** what is needed before Terav can be advertised safely on Meta and Google, made
approachable, with the owner's personal tracks separated from the public catalog?

**Status (2026-10-27):** plan proposed. Owner asked (same day) for cheaper models, everything in this repo
folder, and a 20+ agent Haiku market/competitor sweep that also answers *is there a market, pivot, or add?*
Market sweep started; Phase 0/1 wait for go-ahead.
Source of truth for the why: `brief.md` (same folder).

## Phase 0 — capture (mechanical, no agents, zero model tokens)

Persona screenshots in `next-app/tests/e2e/artifacts/personas/` date from 2026-10-01 and predate
BUG-47/48, so they are regenerated rather than reused.

1. `npm run e2e:personas` against app.terav.fit — 24 personas, desktop + phone, every app route they reach.
   Creates/reuses the harness's test users in production Supabase (as it always has).
2. Landing capture: `landing-shots.spec.ts` points at the old `terav-landing.pages.dev` and covers 5 pages.
   Extend it (test file only) to terav.fit and the full page list below, at 390×844 and 1440×900.
3. One fresh-account "first five minutes" walk: new user → welcome → program picker → intake → first
   Today → first session, timed, screenshot per step. This is the closest thing to what an ad click sees.
4. A contact sheet (one PNG grid per surface) so agents read ~10 images, not 300.

**Screens.** Landing: `/`, `/programs`, `/programs/[slug]` for each public program, `/evidence`,
`/roadmap`, `/privacy`, `/terms`, `/disclaimer`.
App: sign-in, sign-up, reset-password, welcome, programs, program detail, intake, Today (`/`), week, plan,
session, record, check, progress, history, report, evidence, guide, settings, account, profile, feedback,
off-plan, extras, legal ×3. States: brand-new empty account, mid-program (engine, pull-up), multi-track.
`/check/hip` is captured too, as evidence for the personal-track separation finding. Excluded: `/admin`,
`/dev/primitives`.

## Phase M — market + competitors (started 2026-10-27, 23 agents, Haiku)

One web-search agent per competitor or market question, each writing `market/<slug>.md` (≤ 30 lines,
every claim with URL + access date). Then one Sonnet synthesis → `findings-market.md` with a verdict:
**market exists as built / add X / pivot to Y**, and the evidence strength behind it.

Competitors (14): Pliability, GOWOD, Runna, Whoop, Hevy, Ladder, GMB Fitness, Movement Athlete,
Fitbod, Future, calisthenics apps (Thenx/Calisteniapp/Caliverse), CrossFit programming subs (HWPO/
PRVN/Mayhem/TrainHeroic), rowing/erg apps (ErgZone/Hydrow/Concept2), one-off skill programmes
(Handstand Factory, pull-up/muscle-up PDFs and courses).
Market (9): app-market size and growth; subscription pricing + trial conversion; search demand for
skill goals; Meta/Google acquisition cost for fitness apps; user pain points (Reddit/forums); AI/adaptive
coach trend; hybrid/HYROX trend; retention/churn benchmarks; one-off programme vs subscription.

## Phase 1 — audit (read-only, 8 agents, Sonnet + Haiku)

Each agent gets: the brief, named files, one question, the done condition, an output cap of 40 lines,
and writes `findings-<area>.md` here. Each finding is tagged **BLOCKS-ADS / BEFORE-SCALE / LATER**.

| # | Area | Main inputs |
|---|------|-------------|
| 1 | Product + catalog | manifest, `programs/*.json`, landing program pages; personal-vs-public leakage (code paths reading `personal`, hip check, hip home block) |
| 2 | UX — app | app contact sheets, first-five-minutes walk, onboarding length |
| 3 | Visual system | landing + app sheets, `globals.css`, `dev/design/*`, `dev/design-briefs/*`; inventory of competing type/colour/component/tone approaches |
| 4 | Roadmap reconciliation (Haiku) | OPEN-TASKS, saas-launch/*, NEXT.md, README.md, whitepapers, traffic plan vs the code |
| 5 | Monetisation | `tier`, `MULTI_MAIN_ENABLED`, saas-launch pricing; free/paid line options, MoR (Paddle / Lemon Squeezy / Stripe+tax), trial, cancel/refund, EU consumer rules |
| 6 | Compliance + safety | privacy/terms/disclaimer (both apps), consent flow, Art. 9 health data, delete-account, Meta/Google health & fitness ad policy |
| 7 | Tech readiness (Haiku) | invite gate, sign-up path, analytics + consent + pixel/CAPI/gtag feasibility on static export, Sentry, load on Supabase/Pages, backups, rate limits |
| 8 | Ad readiness | one outcome per program, truthful claims vs `citations.json` and traffic plan's citation hold, landing message per outcome, creative format (figure rig, Reel pipeline) |

Roadmap (4) also hands its "still-true" list to the planners so the plan does not re-plan done work.

## Phase 2 — one launch-readiness plan (owner's process)

1. Evidence brief: I merge the 8 findings into one de-duplicated brief (≤ 2 pages).
2. **3 independent planners** (Sonnet), same brief incl. the market verdict, no sight of each other.
   Each must answer the pivot/add question, not only launch-readiness.
3. **Blind judge** (Sonnet): plans relabelled A/B/C, scored on a stated rubric.
4. **Red team** (Sonnet) against the leading plan: what breaks, what is mis-ordered, what is untrue.
5. **Final panel** (3 Sonnet lenses: skeptical target user, growth, compliance/coach), delta rounds to 3.
6. Output `launch-plan.md`: blocks-ads list, can-wait list, order, effort (S/M/L), and owner decisions
   as one-line questions. Report states what the review did and did not establish.

No build work until the owner picks.

## Cost (tokens, estimates)

| Step | Agents | Model | Tokens |
|------|--------|-------|--------|
| Phase 0 capture | 0 | — | ~0 (shell) |
| Phase M market sweep | 23 | Haiku | ~1.2–1.8M (≈50–80k each) |
| Market synthesis | 1 | Sonnet | ~80k |
| Phase 1 audit | 6 + 2 | Sonnet + Haiku | ~1.1–1.6M |
| Planners | 3 | Sonnet | ~300–400k |
| Judge + red team | 2 | Sonnet | ~150k |
| Final panel, ≤3 rounds | 3 | Sonnet | ~200–350k |
| **Total** | **40** | no Opus agents | **~3–4.4M**, ~40% Haiku |

## Risks

- Persona run touches production Supabase (test users only). It is how the harness already works.
- Agents reading hundreds of screenshots blow their budget → contact sheets, and per-agent image caps.
- Agents re-auditing stale audit findings (see memory: visible change > audit chasing) → each brief says
  judge the live product, not old reports.
- Ad-policy and VAT/MoR facts change → agents 5/6/8 must cite the live policy page they read, with date.
- All outputs live in this folder (owner rule, 2026-10-27); nothing goes to the outside notes folder.
