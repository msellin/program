# Hackathon lane briefs: paste one into each lane session

**Every lane, the same rules (paste these with the brief):**
> You are one of 5 parallel lane sessions in the Terav 1-day hackathon. Read `dev/active/launch-readiness/HACKATHON.md`
> and your lane below, then `CLAUDE.md`. Item IDs refer to `dev/active/launch-readiness/ACTION-POINTS.md`, and the
> evidence and file:line refs are in the source file named there.
> - **Files:** touch only the files your lane owns. If an item needs a file another lane owns, write it in
>   `dev/active/launch-readiness/lanes-handoff.md` and move on.
> - **Commits:** one commit per item. `cd next-app && npm run verify` must pass first (it now runs `tsc` + vitest).
> - **Pushing:** `git pull --rebase` before every push, then push to main. If the rebase conflicts in a file you don't
>   own, stop and tell the owner.
> - **Done means verified:** check the result on the live site after CI deploys (about 4 min), and say what you checked.
> - **Rules:** no hip or clinical wording for non-hip users; nothing presented as medical advice; the shared
>   `exercises.json` stays general; never weaken the safety gate in `lib/symptom-state.ts`.
> - **When finished:** tick your IDs in `ACTION-POINTS.md` (add `✓ <sha>`) and report in 5 lines.

---

## Lane 1: Privacy and personal track (about 3 h)
**Owns:** `next-app/public/data/{log,program,open-questions,clinical-context}.json`, `lib/data-loader.ts`,
`lib/storage.ts` (the seed function only), `app/report/page.tsx`, `app/check/hip/**`,
`components/workout/SignalsStrip.tsx`, `components/AssessmentDueBanner.tsx`, `app/programs/[slug]/page.tsx`
(generateStaticParams only), `app/dev/**`, `app/admin/**`, `lib/route-access.ts`.

**Items:** P-01, P-02, P-03, P-04, P-05, P-06, A-UX-07.
**Detail:** `HANDOVER.md` §3 B1 (exact caller analysis), `findings-app.md` #5, #6, #9, #15, `personal-separation.md`.
**Done when:**
- `curl -s -o /dev/null -w '%{http_code}' https://app.terav.fit/data/clinical-context.json` returns 404 (or 401).
- Signed in as `e2e-persona-pullup@example.test`: `/check/hip` redirects, and neither the report nor Today shows
  "hip", "groin", "Rehab" or "orthopaedist".
- `/dev/primitives` is not reachable.
- The owner's hip track still works: check `/report` and `/check/hip` as the owner. Ask the owner to look.

## Lane 2a: Workout session (about 4 h)
**Owns:** `components/session/{DaySession,SetView,OverflowSheet,NoteSheet,BriefView,RestTakeover}.tsx`, the new
`components/session/SessionDone.tsx`, `components/session/OffPlanSession.tsx` (the stop path only).

**Items:** SF-01, SF-02, A-UX-02, A-UX-06, G-07 (the session side: red = hold + alternative).
**Detail:** `findings-app.md` #1–4, #7, #13; `findings-design.md` §4.
**Done when:**
- In every advertised program, "Something hurt" is visible in the session's top row and reachable in one tap.
- Its "Stop session" ends the session and shows a stopped screen with a symptom prompt.
- Finish shows a Done screen (summary, "Back to Today").
- No "Continue" CTA survives Finish or Stop.
- A hold can't be logged at 0 s without a confirm.
- Add a vitest for Stop ≠ Finish.

## Lane 2b: Today and Plan (about 4 h)
**Owns:** `components/session/TodaySession.tsx`, `components/workout/{HeroStateCard,Day1EmptyState}.tsx`,
`components/session/shared/StatusCards.tsx`, `components/proposals/{ProposalCard,ProposalStack}.tsx`,
`FirstRunBanner.tsx`, the feedback/report-a-bug floating button, `app/plan/page.tsx`, `lib/useStore.ts`
(the skip-count area only).

**Also owns:** `app/check/page.tsx`, `components/check/*`, `components/onboarding/OnboardingRunner.tsx`.
**Items:** G-01 (the Today side), G-04, G-05, G-08, G-10, G-11, A-UX-01, A-UX-03, A-UX-05, A-UX-08, A-UX-13, SF-03 (minimum: no "Check first" blocker for public
programs; full version: the one-tap "How do you feel today?" row from `personal-separation.md`).
**Detail:** `findings-app.md` #8, #10, #11; `findings-design.md` §3; owner: the sticky bars cover content on a real
phone.
**Done when:**
- At 375×667 (`screens/gaps/C-viewport-375/` shows today's state), Today has at most 3 cards.
- Nothing is sticky except the bottom nav; suggestions sit inline under the hero; feedback lives in You.
- No "Workout ready" appears on a rest day, and there is one week number.
- A skipped day shows one status, the toast counts visible sessions, and Unskip is visible.
- A pull-up user can start a session without doing a check.

## Lane 3: Landing, claims and ads spec (about 3–4 h)
**Owns:** `landing/**`, `dev/active/launch-readiness/ads/**`.

**Items:** L-01 (landing copy), L-03, L-05, L-06, L-07, L-08, P-07, M-03.
**Detail:**
- `findings-product.md` §1–3 (hero copy, catalog lines).
- `findings-compliance.md` §2 (safe and banned words).
- `findings-evidence-angle.md` (stage-1 line).
- `audit/h03`, `h07`, `g3`.
- The draft ad spec: `ads/ad-spec-draft.md`.

**Done when:**
- terav.fit's hero is outcome-first, with one "Start free" label everywhere.
- None of these appear: "125 primary studies", "Every change cites a study", "Six weeks to a 2K PR", any %/bpm
  claim, "stubborn joint", hip wording.
- Every program page has an `og:image` and `og:title`; check with
  `curl -s https://terav.fit/programs/first-strict-pullup/ | grep og:image`.
- A 404 page exists.
- `ads/ad-spec.md` is final.
- `dev/scripts/check-landing-sync.sh` and `data-integrity.test.ts` still pass. The landing catalog must agree with
  the app manifest.

## Lane 4: Programs data and gates (about 3–4 h)
**Owns:** `next-app/public/data/programs/*.json`, `next-app/public/data/programs/manifest.json`,
`next-app/public/data/citations.json`, the engine gate code for the CSM red state and the handstand retest_gate
(find it via OPEN-TASKS.md:46 and :55), `tests/e2e/harness/personas.ts`.

**Also owns:** `lib/proposals/select.ts`, `lib/engine/suggest.ts`, the phase/schedule code.
**Items:** G-01 (the schedule side), G-06, G-07 (with lane 2a), G-09, L-01 (manifest numbers), L-02, L-04 (catalog flags plus the persona-harness review: owner rule), SF-04,
SF-05.
**Detail:** `audit/h18-claims.md` (exact manifest lines), `roadmap-reconciliation.md` 1–2, `audit/x12`.
**Done when:**
- `npm run verify` passes.
- `grep -i sadowski` finds nothing in the handstand-walk and muscle-up programs.
- `kilding_2012` is withdrawn per OPEN-TASKS.
- The concurrent-strength-maintenance red state resumes at 3×4 (or the promise text is gone).
- The handstand bail-out actually gates (or its text is gone).
- Engine, rowing and overhead are marked "coming soon", and the landing still syncs.
- The personas still cover every shipped program.

## Lane 5: Sign-up, legal and measurement (about 4 h)
**Owns:** `app/(auth)/**`, `components/auth/GoogleAuthButton.tsx`, `lib/auth-errors.ts`, `app/legal/**`,
`app/welcome/**`, `app/account/page.tsx` (the delete flow), the UTM capture (new `lib/attribution.ts` plus the hook
point in sign-up), `dev/scripts/hackathon-auth-config.sh`, Supabase email templates (`supabase/templates/`, new).

**Also owns:** `app/programs/[slug]/intake/IntakeClient.tsx`.
**Items:** G-02, G-03, SG-01, SG-02, SG-03, SG-04, SG-05, SG-06, SG-08, M-02, A-UX-14, A-UX-15.
**Detail:** `findings-money-tech.md`, `findings-compliance.md` 3–6, 8, `audit/h05`, `g2`, `g3`.
**Done when:**
- `screens/gaps/A-first-run/notes.md` shows the landing CTA is already `sign-up?next=%2Fprograms%2Ffirst-strict-pullup`.
  After the fix, sign-up (email and Google) lands in that program's intake with the UTM saved to user metadata.
- Google sign-up needs the consent ticks plus the 16+ tick.
- The privacy page names Stripe (not Paddle), Google OAuth, Cloudflare Web Analytics and Resend, and makes no false
  claims (`findings-compliance.md` §1.4).
- Delete account takes at most 2 taps.
- `dev/scripts/activation.sql` exists, counting sign-ups and first sessions by utm_campaign.

---

## Sweep 1 (one session, after the lanes merge; about 1 h)
**Items:** A-UX-04 (one name per concept; `findings-design.md` §2 glossary), D-01 (one `ui/Button`), D-02 (header
rule), then A-UX-09 if time allows.
**Rule:** these touch every lane's files, so start only when lanes 1–5 have pushed.

## QA block (about 1 h)
1. Fix G-14 in the spec first (dismiss the onboarding modal; test red on a training day). Then re-run the gap capture: `npx playwright test -c tests/e2e/playwright.config.ts launch-gaps.spec.ts --workers=1`.
   Compare it with today's `screens/gaps/`.
2. Run `npm run e2e:personas` in the background (about 30 min). All 24 should pass; the muscle-up-elbow failure is
   known (O-03).
3. The owner does a real phone sign-up (O-02).
4. The review panel (M-04): 3 Sonnet lenses, 1 round, on terav.fit + `ads/ad-spec.md`.
