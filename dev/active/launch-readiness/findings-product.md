# Product + message for launch: deep findings (Sonnet, 2026-10-27). Goal word: APPROACHABLE.
Saved by the orchestrator from the agent's text reply (its own file write was refused).

## 1. Positioning and hero
**Positioning:** Terav is the training app for CrossFit and functional-fitness athletes who want to get better at
one weak area. It runs alongside their current training and explains every change.
- **Headline:** "Improve your weakest area. Keep your training."
- **Sub:** "For CrossFit and functional-fitness athletes. Pick a skill or a lift. Terav adjusts each session from your
  log and tells you why. You approve every change."
- **CTA:** one label everywhere (ad, landing, sign-up): **"Start free"**.
- **Drop from the hero:** "focus arc", "engine", "cites a study", and the 2nd and 3rd hero buttons
  ("Browse programs" moves below the fold).
- **Remove "No card, no signup wall".** Sign-up is required.

## 2. Launch catalog
Advertise 3. All are CrossFit-native and none depends on a withdrawn number:
1. **first-strict-pullup:** "Get your first strict pull-up." / "Sessions adjust to your log. Each change says why."
2. **handstand-walk:** "Build a handstand walk, step by step." / "Starts from the wall. Targets your weakest link first."
3. **concurrent-strength-maintenance:** "Add cardio without losing your squat." / "Keeps strength steady while your
   engine grows."

**Test next:** muscle-up (narrow audience; needs 3 pull-ups and 3 dips).

**Hide or label "Coming soon":**
- anterior-hip-rebuild: personal, never listed.
- engine-builder and engine-builder-block-2: they promise an unshipped Block 3 and carry withdrawn numbers.
- rowing-2k-test-prep: niche, and its 3-6% figure is withdrawn.
- overhead-mobility: jargon, and no outcome line.

## 3. BLOCKS-ADS-TODAY (ordered)
1. **[S] Hip banner shows to every new user.** Gate `AssessmentDueBanner` to the anterior-hip-rebuild slug.
   Files: `next-app/src/components/workout/SignalsStrip.tsx:425`, `components/AssessmentDueBanner.tsx`.
2. **[M] Personal data is public.** `app.terav.fit/data/clinical-context.json` returns 200.
   - Remove it from `next-app/public/data` or put it behind auth.
   - Do the same for the override note in `anterior-hip-rebuild.json:293`.
   - Drop the hip slug from `generateStaticParams` in `programs/[slug]/page.tsx:9-17`.
3. **[S] Landing names the hip.**
   - `landing/src/components/mockups/TodayMockup.tsx:21` says "Left hip stiffness". Use a pull-up or squat example.
   - `en.ts:93-95` (founder story) is an owner call. Cutting the hip naming is recommended.
4. **[S] Withdrawn or unsourced numbers** in `manifest.json` `what_youll_achieve`:
   - Line 41: 5-8% VO2max, 5-10 bpm. Line 101: 8-15 bpm. Line 128: 3-6%, 3-30 s. Line 263: 2-5%, +4-9%.
   - Landing: "Six weeks to a 2K row PR", "125 primary studies", and "Every change cites a study"
     (→ "Every change shows its reason").
   - Also check `landing/src/lib/programs-catalog.ts` for copies of the same figures.
5. **[M] Landing hero and CTA.**
   - One "Start free" label across `Hero.tsx:81`, `BetaCTA.tsx:22`, program pages and sign-up.
   - On phone, put the Today mockup directly under the headline.
   - Add a sticky bottom "Start free" bar on program pages.
   - Use the §1 copy (`en.ts:6-13`).
6. **[M] The chosen program is lost at sign-up.**
   - `(auth)/sign-up/page.tsx:37,:76` set `emailRedirectTo` to `/sign-in` with no `next`.
   - GoogleAuthButton and the sign-in "Sign up" link (`sign-in/page.tsx:215`) drop it too.
   - Carry `next` end to end.
7. **[S, owner] Three checks on the sign-up path.**
   - Confirm Supabase sign-ups are OPEN.
   - Remove "no signup wall".
   - `BetaCTA.tsx` promises "first session within two minutes", which is false with 9-14 intake answers.
     Change it to "about 5 minutes".
8. **[S-M] App jargon, copy-only** (h04 items 1-7).
   - Files: `programs/page.tsx:175`, `IntakeClient.tsx:783,:988,:644`, `RestTakeover.tsx:338-341,:35-39`,
     `BriefView.tsx:619-623`.
9. **[S] Re-screenshot the Today overlap** (sticky Apply/Ignore bar over the cards) before changing anything. The
   2026-10-01 shot predates BUG-47/48. The "0 drills" defect is already fixed in code
   (`OffPlanSession.tsx:175`, `OffPlanSheet.tsx:50`).
10. **[S] Ad copy hygiene.** No rehab, pain, injury or "prevents". No "AI form check". No result-in-N-weeks claims.

## 4. BEFORE-SCALE
- **Design:** one shared tokens file generated from `dev/design/tokens.md`, imported by both `@theme` blocks, plus
  one `<Button variant>` set. The app has 1,552 hardcoded style hits.
- **Intake:** it asks 9-19 questions before first value. Aim for about 5 up front and defer the rest. A safety-block
  screen should offer an alternative program, not a dead end.
- **Post-goal "next focus" offer** at the end of a program.
- **Social proof:** a real beta quote with consent, never invented. Turn the phone comparison table into cards.
- **Cleanup:**
  - `check/page.tsx` falls back to the hip regions.
  - Remove the `DEFAULT_PROGRAM_SLUG` fallback.
  - `guide/page.tsx:155` names the hip case study.
  - Put the citation paragraphs on the session screen behind a disclosure.
  - Show prerequisite gates on the ad landings.
  - Add Concept2 import before any rowing ad.

## 5. Verified vs taken from Haiku
Verified:
- Item 1: no program gate on the component.
- Item 2: live 200 on clinical-context.json.
- Item 3: the en.ts hero and TodayMockup text.
- Item 4: the manifest lines quoted.
- Item 6: `emailRedirectTo` has no `next`.
- The manifest has 9 programs, with hip personal:true, and the landing filters it out.
- The "0 drills" fix is in code.

From Haiku, not rechecked:
- The render condition above `SignalsStrip:412`.
- Whether sign-in honours `next`.
- The Supabase toggle state.
- The h04 line numbers.
- The token drift counts.
- The landing screenshot findings.
- The h18 citation verdicts.
- The market claims.
- The intake counts.
