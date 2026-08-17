# Landing → App integrity audit — 2026-08-17

**Verdict — go-with-caveats.** The app largely delivers on the new focused-improvement positioning. The Accept/Ignore verb pair is honestly implemented in `ProposalCard` and always visible. The 5-programs-in-three-domains claim holds (public catalog: engine-builder, handstand-walk, concurrent-strength-maintenance, rowing-2k-test-prep, overhead-mobility — spanning endurance, skill, strength). Log-derived proposals honestly say "Because:" and cited proposals honestly say "Source:".

But four gaps opened by the positioning shift will read as broken promises to a beta user with the landing tab still open. In priority order: (1) the app's `<title>` and description are still the OLD full-plan positioning; (2) the "rest of your week is still yours" beat lives in exactly ONE onboarding step in ONE program; (3) the highest-priority proposal kind (`day_adjustment_soften` — pain / fatigue) is explicitly `citationId: null`, so the landing's "every change cites a study" is technically false for the safety-critical case; (4) the programs page is still framed as a browse-and-add catalog, not "pick your focus."

None of these are ship-stoppers, but the first three combine into a bad first-two-minutes experience for landing-arrival users. All fixable in a single afternoon.

---

## Top 5 landing→app gaps, ranked by beta blast radius

### 1. App `<title>` and description are the OLD "full-plan" pitch — regression from the landing copy pass

- **Landing promise** (`landing/src/app/layout.tsx:20`): title `"Terav — Pick one thing you want stronger. Sharpen it every session."`, description says "focused-improvement training tool ... the rest of your week is still yours."
- **App reality** (`next-app/src/app/layout.tsx:24-26`): title `"Terav — sharpen the plan"`, description `"Adaptive training that learns from every session. Aerobic, concurrent, and skill programs, cited to the study."`
- **Why it matters:** the app tab title is one of the most durable surfaces — it's on every phone home-screen icon caption, every browser history entry, every PWA install prompt. A user who taps "Pick my focus" on the landing lands on a page still calling itself "sharpen the plan." That's not a small nit; it's the specific word ("plan") the landing positioning was rewritten to avoid.
- **Fix cost: S.** One file, two strings. Change title to something like `"Terav — pick your focus"` and description to match the landing's focused-improvement phrasing.

### 2. "The rest of your week is still yours" appears in exactly one place in the app — one onboarding step in one program

- **Landing promise** (`landing/src/i18n/dictionaries/en.ts:10`, `en.ts:30`): "the rest of your week is still yours" appears in the hero sub AND the Scope-row of the ThreeWayContrast. It's the central differentiator vs. templates/trainers.
- **App reality:** `grep -rn "rest of your week"` across `next-app/src` finds ONE hit — `SessionActions.tsx:340`, a mid-session copy string about how the rest of your programmed WEEK responds to a hard session. That's a different meaning.
  - `engine-builder.json` onboarding step 3 says "The other four days are yours." — the CLOSEST paraphrase, but scoped to Engine Builder only.
  - `concurrent-strength-maintenance.json`, `rowing-2k-test-prep.json`, `handstand-walk.json`, `overhead-mobility.json`, `anterior-hip-rebuild.json` all omit the beat entirely from their `onboarding_steps[]`.
- **Why it matters:** the beat is what makes the landing pitch defensible ("we're not replacing your gym"). If it appears nowhere in-context, the user who signs up expecting a side-track has to infer that from what's absent. That's exactly the trust erosion this audit exists to catch.
- **Fix cost: S.** Add one line to `FallbackStep.tsx` and one `custom_copy` beat to each non-engine-builder program's `onboarding_steps[]`. Or, add a single "the rest of your week is still yours" line to `Day1EmptyState.tsx` (`next-app/src/components/workout/Day1EmptyState.tsx:30`) — one string ships the promise to every fresh user regardless of program.

### 3. `day_adjustment_soften` proposals ship with `citationId: null` — landing's "every change cites a study" is technically false for the safety-critical case

- **Landing promise** (`en.ts:10`): "Every change cites a study." Also in `how.step_02_title` ("A session, cited.") and the evidence claim ("Every session cites its research.").
- **App reality** (`next-app/src/lib/engine/proposal-citations.ts:22`): `day_adjustment_soften: null`. The comment above the map is honest — it distinguishes log-cited from study-cited kinds — but the ProposalCard render at `ProposalCard.tsx:143` only shows `<CitationRef>` when `citationId` is truthy. So the pain / fatigue proposal (the HIGHEST-priority proposal, priority 100) renders a `Because: {reason}` line and NO `Source:` line.
- **Two ways to read this:**
  1. **Charitable:** the landing says "cites a study"; the app substitutes "cites a log signal" for the log-derived proposal. That's honest engineering, but the landing copy doesn't grant that distinction.
  2. **Strict:** the landing claim is unqualified. A skeptical user takes the first proposal they see, notes there's no study cited under a load-softening recommendation, and concludes the landing overpromised.
- **Why it matters:** the day-adjustment proposal is likely the FIRST proposal most beta users will see (it fires on high life-load + fatigue signals — precisely what a new user tapping through onboarding will generate). First-touch trust surface.
- **Fix cost: S/M.** Two paths, both cheap:
  - **App side (S):** wire a plausible citation for `day_adjustment_soften` — the classic "training when fatigued increases injury risk" or "RPE-based load adjustment" bodies of literature. Even one reference (e.g., Halson 2014 or Foster 1998) lets the "Source:" line render.
  - **Landing side (S):** soften the hero sub from "Every change cites a study" to "Every change shows its reasoning — a log signal or a cited study." (matches the `FallbackStep.tsx:21` line already shipped inside the app).

### 4. `/programs` page frames itself as a browse-and-add catalog, not "pick your focus"

- **Landing promise** (`en.ts:8`, `en.ts:12`, `en.ts:52`): CTA `"Pick my focus"`, eyebrow `"Pick one program"`, hero H1 `"Pick one thing you want stronger."`
- **App reality** (`next-app/src/app/programs/page.tsx:74-83`): H1 is `"Programs"`, sub is `"Each program targets one weakness. Length varies by program..."`, footer is `"More programs land as they're authored."` The nouns are all catalog nouns — Programs, categories, filters — not focus / pick / one-thing language. And the primary CTA on each card action (`ProgramPreviewClient.tsx:401`) is `"Start this program"`, not `"Make this my focus"`.
- **Why it matters:** the landing routes `/programs` from `browse_link` ("Browse programs — no signup") — so browse is one entry point. But it ALSO routes from the primary hero CTA "Pick my focus" via `/sign-up` → Today → Programs (in some flows). Users arriving from either path see the same catalog framing. The landing's positioning verb ("pick") doesn't survive the click.
- **Fix cost: S.** Change three strings in `programs/page.tsx`: H1 "Pick your focus", sub "Each program is one focus arc — an engine, a skill, a lift, a stubborn joint. The rest of your week stays yours." Change the primary CTA in `ProgramPreviewClient.tsx:401` from "Start this program" to "Make this my focus" (or "Start this focus"). Zero engine change.

### 5. Landing hero says "88 cited studies" — actual count is 112

- **Landing claim** (`en.ts:16`, `evidence.title`): "88" three times.
- **App reality:** `jq '.citations | length' next-app/public/data/citations.json` returns **112**.
- **Why it matters:** wrong direction is safe (under-promise, over-deliver), but a beta user checking `/evidence` on the landing vs. the citations they actually see cited in-app will notice the mismatch. It also suggests the landing hasn't been re-synced against the corpus since some batch of citation additions.
- **Fix cost: S.** Update `en.ts` from `88` to `112` (or a round `100+`). Two lines: `hero.stat_studies_value` and `evidence.title`.

---

## Confirmed-delivered promises (worth naming so they don't get counted twice)

- **"You Accept or Ignore each change"** — `ProposalCard.tsx:158-172` renders both buttons inline, always visible, min-height 44px, keyboard-accessible. Verb pair is honest. `SignalsStrip` was correctly stripped to passive info per Phase 3.
- **"5 programs live"** — public catalog: engine-builder, handstand-walk, concurrent-strength-maintenance, rowing-2k-test-prep, overhead-mobility. `anterior-hip-rebuild` is `personal: true` and correctly hidden from the public catalog (`programs/page.tsx:39`).
- **"Three domains"** — endurance, skill, strength across public programs. Matches.
- **"Three more in build"** — landing text says three; not audited against roadmap page, but the promise structure is intact.
- **"A plan sharpened every session"** — `evaluateOverperformer` at `next-app/src/lib/engine/adapt.ts:471` and the four proposal-selection functions in `select.ts` do adapt per-session against logs. This is real.
- **"Not a streak game"** — no streak counter in `BottomNav.tsx` or `HeroStateCard.tsx`. Skipped weeks handled by `readiness_after_layoff` proposal, which is exactly the mechanism the landing implies.
- **"Not a clinician"** — `Day1EmptyState`, `SignUpPage`, disclaimer page all correctly frame the app as training-log-not-medical-advice. Signup requires explicit medical-disclaimer + symptom-data consent (`sign-up/page.tsx:29-40`).
- **"Under ten minutes of questions"** — engine-builder intake declares 18 questions, CSM 7, rowing 9. Even at 30 sec/question worst case, engine-builder is 9 min. Meets the promise but only barely on the biggest program — worth watching if intake grows.

---

## Cross-phase compositional risks the phase briefs couldn't have caught

- **Day1EmptyState + ProposalStack interaction:** on a fresh account with no morning check saved, Today renders `<Day1EmptyState />` per `page.tsx:177`. But `<ProposalStack>` renders ABOVE (`page.tsx:168`). If any proposal source fires in the empty-signal state, the ProposalStack could paint an empty proposal card above the "start with a morning check" CTA — competing attention. The `todayHasOnlyLifeLoadSeed` guard in `select.ts:54-70` mitigates for the LifeLoad-7 case, but nothing else. Worth a live check on a fresh signup.
- **OnboardingRunner + IntroGallery z-collision:** context.md flagged this was fixed by the `terav:onboarding-done` custom-event handshake. Verified in code (`OnboardingRunner.tsx:73-75`). No further action.

---

## What I did NOT cover

- **Live URL verification.** I did not fetch `https://app.terav.fit/sign-up`, `https://terav.fit`, or run the Playwright personas. Persona artifacts are STALE per context.md, and every finding above is code-derived. Any "user experience" claim from me is inference from the code, not proof from a rendered page.
- **Coach worker CORS / auth on the new domain.** Not in scope.
- **Landing positioning strategy.** Context.md points at `dev/audits/landing/2026-08-17-positioning-focused-vs-full-plan.md` as source of truth; I did not re-audit whether focused-improvement is the right positioning, only whether the app delivers on it.
- **Roadmap page** ("Three more in build"). I checked the landing string exists but did not verify a corresponding page enumerates the three.
- **Metadata / open-graph on the app.** I checked `app/layout.tsx` title + description but not the PWA manifest.json, apple-touch-icon caption, or open-graph tags on individual app routes.
- **Onboarding step time budget.** Counted questions per program but did not measure actual time-on-task.
- **Ranking of the 5 programs to the landing's per-program pitches** (`engine_builder_pitch`, `csm_pitch`, etc.). I confirmed the slugs exist but did not diff the landing pitch string against each program's `short_description`.
- **The `evidence` page** on the landing (`landing/src/app/evidence/page.tsx` per audit prompt). I audited the hero-stat count against `citations.json` but not the enumerated evidence page.

---

## Fix summary — one afternoon of work

| # | File | Change | Cost |
|---|------|--------|------|
| 1 | `next-app/src/app/layout.tsx:24-26` | Update `<title>` and description to focused-improvement copy | S |
| 2 | `next-app/src/components/workout/Day1EmptyState.tsx:30` | Add "the rest of your week is still yours" beat | S |
| 3a | `next-app/src/lib/engine/proposal-citations.ts:22` | Wire a citation for `day_adjustment_soften` | S |
| 3b | *(alternative)* `landing/src/i18n/dictionaries/en.ts:10` | Soften "every change cites a study" → "shows its reasoning" | S |
| 4 | `next-app/src/app/programs/page.tsx:75-77`, `ProgramPreviewClient.tsx:401` | Retitle "Pick your focus", CTA "Make this my focus" | S |
| 5 | `landing/src/i18n/dictionaries/en.ts:16,67` | Update 88 → 112 (or "100+") | S |
