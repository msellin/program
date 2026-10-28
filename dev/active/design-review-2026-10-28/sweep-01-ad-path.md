# Sweep 01: ad path (first run, intake, first session) and viewport captures at 375 and 393 (2026-10-28)

Screens: `dev/active/launch-readiness/screens/gaps/{A-first-run,C-viewport-375,C-viewport-393}/`. Byte-identical duplicates (same hash) were checked once and are listed under Checked.

## Findings

- [B] A-first-run/02-sign-up-page-not-submitted.png — three legal boxes gate sign-up before any program is seen → show a program preview first, ask consent at submit
- [B] C-viewport-375/10-off-plan-top.png — Extra session offers hang drills while Rest card says "No hanging" → hide hang drills while the shoulder red-flag holds
- [B] C-viewport-393/10-off-plan-top.png — same contradiction at 393: Dead hang and Active hang offered on a rest day → apply the same hang gate as 375
- [B] A-first-run/06-intake-17.png — "By week 8: 8-10 strict pull-ups unbroken" contradicts landing "Not guarantees" → drop the week-8 number or cite it
- [H] A-first-run/01-landing-pullup.png — "MULTI-TIER" jargon in the ad landing eyebrow → "Skill · 8 weeks"; drop the tier word
- [H] A-first-run/01-landing-pullup.png — landing is text only, no product image or session preview → add one real screen of a session
- [H] A-first-run/03-first-screen-after-sign-in.png — signed-in Today is 60% blank with one button → show the chosen program and the next step
- [H] A-first-run/03-first-screen-after-sign-in.png — "calibrated to your baseline, not a template with your name on it" is awkward → "Answer 16 short questions so the plan fits you"
- [H] A-first-run/04-programs.png — "Coming soon" rows keep chevrons and look tappable → remove the chevron or disable the row
- [H] A-first-run/04-programs.png — intro says "focus arc", "adaptive", "Personalised" → plain words: say what the plan does
- [H] A-first-run/05-program-detail.png — "multi-tier skill program on the shared pull drill library" is jargon → one plain sentence about who it is for
- [H] A-first-run/05-program-detail.png — "Personalised sessions target your weakest sub-capability first" → "sub-capability" is internal vocabulary; say "weakest sub-skill"
- [H] A-first-run/05-program-detail.png — no start or join action above the fold on program detail → put a start action in the first screen
- [H] A-first-run/06-intake-01.png — answers show "TIER A", "TIER B / C", "TIER C+" codes to strangers → hide tier codes from intake answers
- [H] A-first-run/06-intake-01.png — section label cut to "WHERE YOU ARE…" at 375 → shorten the label or let it wrap
- [H] A-first-run/06-intake-11.png — "PHYSICAL TES…" label truncated on steps 11–15 at 375 → shorten the label or let it wrap
- [H] A-first-run/06-intake-12.png — steps 12–15 show an enabled Next with blank input, no Skip link → add Skip, or gate Next like step 11
- [H] A-first-run/06-intake-05.png — "Yes" promises "we'll tell you what to do next"; no next step is captured → verify it is not a dead end
- [H] A-first-run/06-intake-17.png — result recommends "Tier D", which intake never defined (A to C+) → use one tier vocabulary
- [H] A-first-run/06-intake-17.png — explain-back text hidden under the "Start program" bar → add bottom padding above the sticky button
- [H] A-first-run/08-first-session.png — "The neuromuscular precursor to a pull-up. Retraction hold isolates the endpoint." → "A rowing-style pull that builds the start of a pull-up"
- [H] A-first-run/08-first-session.png — "FIRST STRICT PULL-" eyebrow clipped at the right edge → recheck after cb83e26; shorten or wrap
- [H] C-viewport-375/02-plan-top.png — progress reads 7/8 on Plan while Today reads 1/8 in the same week → one progress number
- [H] C-viewport-375/02-plan-top.png — "Mixed practice · Post-acquisition: engine interleaves 2-3 drills ... capabilities" → say what the session does, no internal terms
- [H] C-viewport-375/02-plan-top.png — Wed 28 Oct still shows Row strength after "Rest today" adjustment → show the adjusted rest day on Plan
- [H] C-viewport-375/05-check-top.png — sticky "Update check" bar covers Elbow and Low back chips → add scroll padding above the sticky bar
- [H] C-viewport-393/05-check-top.png — sticky bar covers Low back chips; "FLAGS · TAP TO TOGGLE" caption peeks under it → pad content above the bar
- [H] C-viewport-375/10-off-plan-bottom.png — "Lifts you did elsewhere" squats and deadlifts for a pull-up user, reads like a log → label as suggestions or remove for this program
- [H] C-viewport-393/10-off-plan-bottom.png — same unexplained "Lifts you did elsewhere" list of squats and deadlifts → explain the subtitle or hide the list
- [M] A-first-run/01-landing-pullup.png — "What it's for" bullets repeat program detail section 1 nearly verbatim → keep one version, shorten the landing
- [M] A-first-run/01-landing-pullup.png — ranges use hyphens ("15-30 minutes", "1-2") → en dashes for ranges
- [M] A-first-run/02-sign-up-page-not-submitted.png — "Verifying..." captcha runs before any consent box is ticked → start the captcha on submit
- [M] A-first-run/02-sign-up-page-not-submitted.png — Google button disabled until three boxes ticked, helper is tiny low-contrast mono → enable Google, or show the rule plainly
- [M] A-first-run/03-first-screen-after-sign-in.png — "Browse programs" small pill, unlike full-width primary CTAs elsewhere → one primary button style
- [M] A-first-run/04-programs.png — chip "Gymnastics & skill" vs card eyebrow "SKILL" → one category name
- [M] A-first-run/04-programs.png — native unstyled "Curated" select breaks the design system → build a styled sort control
- [M] A-first-run/04-programs.png — "Engine Builder" meta wraps into a ragged three-line block → align the meta block to the title
- [M] A-first-run/04-programs.png — coming-soon descriptions are dimmed to low contrast → raise contrast to meet AA
- [M] A-first-run/05-program-detail.png — "Some athletes can't dead-hang" switches to third person; landing says "You" → keep second person throughout
- [M] A-first-run/06-intake-01.png — disabled bronze Next is too dim to read as a control → clearer disabled state
- [M] A-first-run/06-intake-01.png — teal "Back" link is a second accent beside bronze CTAs → use one link colour
- [M] A-first-run/06-intake-04.png — Yes/No pills, full-width option cards and a 2×2 grid all used → one control style per question type
- [M] A-first-run/06-intake-04.png — "we bias the plan toward closed-chain scap work" → "we start with shoulder-friendly scap work"
- [M] A-first-run/06-intake-09.png — "medial elbow", "negatives", "scap-focused" jargon in helper text → plain descriptions
- [M] A-first-run/06-intake-11.png — "scap CARs", "pull-aparts" undefined; cue wall is too dense → one short cue, link to a demo
- [M] A-first-run/06-intake-12.png — "scapulae" and "depressing and retracting" for a stranger → "pull your shoulder blades down and back"
- [M] A-first-run/06-intake-12.png — "reps" unit floats far from the input → place unit inside the field
- [M] A-first-run/06-intake-16.png — consent repeats the sign-up consent in different wording → merge into one consent
- [M] A-first-run/06-intake-16.png — checkboxes about 18px, small touch targets → at least 44px tap area
- [M] A-first-run/06-intake-17.png — "≈ 3 seconds ... ≈ 3 reps ... ≈ 3 reps feet elevated" run-on → list each measure on its own line
- [M] A-first-run/06-intake-18.png — program name repeated three times on first Today → keep it once in the heading
- [M] A-first-run/06-intake-18.png — "1/8" beside "WEEK 1 OF 8" are two progress meters → one meter, label what it counts
- [M] A-first-run/08-first-session.png — "HANG, SCAP, ROW BASE · WEEK 1 OF 8 · ENDS 22 DEC" internal block name, wraps → plain block name
- [M] A-first-run/08-first-session.png — "Non-optional in weeks 1-3" awkward → "Required in weeks 1 to 3"
- [M] A-first-run/09-first-session-bottom.png — "Band shoulder prep (I-Y-T + face pull)" uses unexplained I-Y-T → "Band shoulder prep (face pull, Y and T raise)"
- [M] C-viewport-375/01-today-top.png — rest state leaves 55% blank; "Log how it feels" is a tiny underlined link → make it a real button
- [M] C-viewport-375/02-plan-top.png — "FIRST STRICT PULLUP" spelled without hyphen; elsewhere "Pull-Up" → one program name spelling
- [M] C-viewport-375/02-plan-bottom.png — day descriptions truncated with ellipsis, no way to read the session → allow two lines
- [M] C-viewport-375/03-session-top.png — rest session repeats the Today card and program name, no app header → reuse app chrome or drop the repeat
- [M] C-viewport-375/04-record-top.png — "Morning check" label wraps, "1 red" orphaned to next line → widen label column or shorten
- [M] C-viewport-375/04-record-top.png — "Sessions 2 / 2" this week while Plan shows one logged → reconcile the count
- [M] C-viewport-375/04-record-bottom.png — history mixes "logged", "2 done" and "1 done" → one vocabulary
- [M] C-viewport-375/05-check-bottom.png — "Cooked" as a choice for a heavy week reads as slang → "Heavy" or "Exhausted"
- [M] C-viewport-375/05-check-bottom.png — "The engine reads these... feed today's proposal" → "Your notes adjust today's plan"
- [M] C-viewport-375/06-programs-bottom.png — green left rule on Engine group breaks the bronze accent → use the group accent in the palette
- [M] C-viewport-375/07-profile-top.png — raw email used as the account name, breaks at the hyphen → show a display name or truncate the email
- [M] C-viewport-375/07-profile-top.png — "multi-tier" in program card meta → "8 weeks"
- [M] C-viewport-375/07-profile-top.png — away-day dates as "28.10.2026" while the app elsewhere says "26 Oct" → one date format
- [M] C-viewport-375/07-profile-bottom.png — "Re-run intake" and "Report" unexplained, Re-run may reset progress → label and confirm Re-run
- [M] C-viewport-375/08-account-top.png — red "Delete my account" sits directly under Export with no gap → separate the danger zone
- [M] C-viewport-375/10-off-plan-top.png — internal drill-library names ("Dead-hang ladder", "Scapular pull ladder") → plain exercise names
- [M] C-viewport-375/10-off-plan-bottom.png — about 15 rows with no grouping or filter → group by body area or cap the list
- [M] C-viewport-393/01-today-top.png — capture shows Extra session with an orange rule, not Today → recapture the Today screen
- [M] C-viewport-393/02-plan-bottom.png — "Row strength — closed-chain pull + Scapula..." truncated → allow two lines
- [M] C-viewport-393/04-record-top.png — "112 reps" hero number with "+12.0" decimal on a rep count → show reps as whole numbers
- [M] C-viewport-393/04-record-top.png — "vs previous (2026-10-10)" ISO date vs "26 Oct" elsewhere → one date format
- [M] C-viewport-393/05-check-bottom.png — "The engine reads these... today's proposal" → plain sentence about what changes
- [M] C-viewport-393/06-programs-bottom.png — "Eight weeks of Zone..." cut mid-sentence; "Zone" unexplained → finish the sentence, explain Zone
- [M] C-viewport-393/06-programs-bottom.png — green left rule on Engine group → use the bronze group accent
- [M] C-viewport-393/10-off-plan-top.png — "HELD" tag on ring row is unexplained → add a short label or tooltip text
- [M] C-viewport-393/03-session-top.png — session screen has no logo or settings header, unlike Today → one shared header
- [L] A-first-run/01-landing-pullup.png — mono labels ("WHAT IT'S FOR", "SKILL · ...") are small and low contrast → larger, brighter labels
- [L] A-first-run/04-programs.png — second carousel card clipped mid-word with no clear scroll cue → add an edge fade or dots
- [L] A-first-run/05-program-detail.png — "Levels" line orphans "Volume" on its own line → keep the level chain on one line
- [L] A-first-run/06-intake-01.png — answer option 5 is cut under the footer with no fade → add a fade over the footer
- [L] A-first-run/06-intake-13.png — ring row step lacks the demo link that steps 12 and 15 have → add it or drop it everywhere
- [L] A-first-run/06-intake-17.png — "Back to answers" teal link vs bronze accent → one link colour
- [L] A-first-run/08-first-session.png — "Log an extra session" link sits above the Start button → put the link below the CTA
- [L] A-first-run/09-first-session-bottom.png — "OPTIONAL" tag is tiny mono and easy to miss → larger tag or a clearer label
- [L] C-viewport-375/01-today-top.png — "Rest today." card has no next step beyond the text link → add "Plan a lighter day"
- [L] C-viewport-375/04-record-bottom.png — "Tue 29 Sept" uses "Sept", other months use three letters → "Sep"
- [L] C-viewport-375/05-check-top.png — "WHY?" link is tiny mono under the back-off card → make it a readable link
- [L] C-viewport-375/05-check-bottom.png — stiffness options mix "<15 min" with "15-30" and ">30" → add units to every option
- [L] C-viewport-375/06-programs-bottom.png — "(daily 10-15 min)" wraps to "min)" alone → widen the meta column
- [L] C-viewport-375/08-account-top.png — email row has a chevron but no edit target → remove the chevron or make it editable
- [L] C-viewport-375/09-settings-top.png — "Accept confirm" and "Accept" are internal voice → "Confirm plan changes"
- [L] C-viewport-375/09-settings-top.png — "Light theme coming soon" placeholder in settings → hide until shipped
- [L] C-viewport-393/03-session-top.png — about half the screen is empty below "Back to Today" → tighten or add the next session
- [L] C-viewport-393/04-record-top.png — "Next test in 24 days" tiny, right-aligned, low contrast → larger, left-aligned
- [L] C-viewport-393/05-check-top.png — selected "Severe" has a red ring while selected "None" has a white ring → one selected style
- [L] C-viewport-393/06-programs-top.png — "CITED" badge clipped off the carousel card edge → keep badges inside the card
- [L] C-viewport-393/08-account-top.png — "joined Oct 2026" lowercase, Profile uses uppercase eyebrow → one eyebrow style
- [L] C-viewport-393/09-settings-top.png — "Language: Estonian, Finnish coming soon" row → hide until shipped
- [L] A-first-run/01-landing-pullup.png — "8 WEEKS" caps vs "8 wks" on cards vs "8 weeks" on detail → one duration format
- [L] A-first-run/06-intake-01.png — em dashes in every option label → fewer em dashes, plainer labels

## Cross-screen

- "First Strict Pull-Up" appears as "Pullup" on Plan and Profile → pick one spelling everywhere
- Dates appear as "26 Oct", "28.10.2026", "2026-10-10" and "29 Sept" → one date format app-wide
- Jargon across ad path: "engine", "arc", "capability", "sub-capability", "tier", "multi-tier", "closed-chain", "proxy" → plain words in strangers' screens
- Accent: teal links vs bronze CTAs on the same screens → one link colour

## Scores (10 = best)

- Text density: 4
- Text size: 5
- Visual richness: 3
- Consistency: 4

## Checked

Checked: 66 screenshots (58 distinct; 8 byte-identical duplicates, one of each pair checked once).
