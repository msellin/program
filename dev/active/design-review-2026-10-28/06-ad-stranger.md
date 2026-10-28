# 06 Ad stranger (29yo, Hevy + Strava, 60-second patience)

**Verdict:** Looks credible and calm, but the path to a first rep is 16 intake steps, a consent wall and an ID-card sign-up. I would bounce at sign-up or at intake step 4-7, and I would not finish intake unless the ad promised a lot.

Scores (1-5): text density 3 | text size 4 | visual richness 2 | consistency 4

## Screen by screen (A = dev/active/launch-readiness/screens/gaps/A-first-run/)
- 01-landing-pullup: impressed. Clear promise ("From no hang to a rep you own"), one big CTA, bullets I can self-qualify against. Good.
- 02-sign-up-page-not-submitted: would quit here. Three checkboxes before I can even tap Google, Cloudflare "Verifying..." widget on top of that. Hevy and Strava give me one button.
- 03-first-screen-after-sign-in: confused. I just clicked a pull-up ad and land on "Pick your focus", empty screen with a Browse button. The ad's `next=` was lost. I'd already picked.
- 04-programs: bored. Shows 3 horizontal cards, a filter chip row, a sort dropdown, then more lists below (the same programs repeated, per notes.md). The pull-up card is cut off. Three programs do not need filters and sort.
- 05-program-detail: meh. Text only, "Section 1 of 4" cards, ~200 words before any button; the CTA is not visible in the first viewport. No image, no video, no sample session.
- 06-intake-01: okay, the radio cards with tier labels are clear, progress bar good. But "TIER A / B" labels are internal jargon and the question is long.
- 06-intake-06 / 07 (screening): wary. Neck numbness and uncontrolled blood pressure for a pull-up app feels like a clinic form. Steps 4-7 are four medical questions in a row.
- 06-intake-11 to 15: would quit. Five physical tests (hang, scap pulls, ring rows, pull-up, negative), each with a paragraph of instructions, on a first visit, before any value. The "Skip physical tests" link is small and low contrast; it is the only thing that saves the funnel. It should be the default.
- 06-intake-16: annoyed. Another two consent checkboxes, after I ticked three at sign-up.
- 06-intake-17 (Where you start): good idea, "explain-back" is trust-building. But the Start button covers the card text and the seed data says "3 sec hang -> Tier D", which if real would look wrong.
- 07-today-day-1: okay. Heading plus progress bar is fine, but the "Four tabs" tutorial card sits above the actual job. "Start your first session" is below the fold.
- 08-first-session: confused. Header "FIRST STRICT PULL-" is clipped (notes.md says horizontal overflow: true). Three "How to run this" cards are unlabeled fragments ("Feet-elevated ring row / inverted row." then "The neuromuscular precursor..."). Reads like broken copy. No exercise images, only a play icon.
- 09-first-session-bottom: Start session button is sticky and clear. Good. Session count is 5 exercises, about 32 min, fine.
- persona-pullup/flows/session-follow-along/02-guided-ready and 03-guided-working: impressed, this is the best screen. Big ring counter, one action, "Something hurts" always visible. But the tutorial area is an empty grey box that says "Open the full tutorial for this move": no video where I would expect it.
- flows/session-log-set/03-rest: good. 2:00 timer is large and RPE chips are clear (Hevy-like). "How many more could you have done?" is clever.
- flows/session-follow-along/05-guided-done: bare. One line, no reward, no summary.
- persona-pullup/mobile/01-day: calm, scannable, week 7 state is nice (readiness dots, one card).
- mobile/02-plan: week list is readable; the bottom nav overlaps the Thu/Fri rows in the capture (full-page screenshot artefact, probably).
- mobile/05b-record: impressed. Heatmap plus a line chart is the only real visual richness in the app, and it appears only after weeks of data.

## Findings
- ADS-BLOCKER: sign-up demands three checkboxes before any button works, plus a bot check (A-first-run/02-sign-up-page-not-submitted.png).
- ADS-BLOCKER: landing and sign-up carry `next=/programs/first-strict-pullup`, yet after sign-in the stranger lands on a generic "Pick your focus" empty screen (03-first-screen-after-sign-in.png). Verify this is not a test-harness artefact. If real, it kills most of the ad funnel.
- ADS-BLOCKER: 16-step intake including 4 screening questions and 5 physical tests before any value (06-intake-04..15). Make physical tests skipped by default or move them to week 1's first session as a retest.
- FIX-THIS-WEEK: session page header clipped and overflow-x true (08-first-session.png). "How to run this" shows three unlabeled sentences.
- FIX-THIS-WEEK: Day 1 pushes "Start your first session" below a "Four tabs" card (07-today-day-1.png). Dismiss the tutorial by default.
- FIX-THIS-WEEK: Program detail has no CTA in the first viewport and is all text (05-program-detail.png).
- FIX-THIS-WEEK: movement media is missing. The tutorial box is empty (session-follow-along/02-guided-ready.png) and the session list has none.
- LATER: Programs page has filters and sort for 3 programs, and the pull-up card is cut off (04-programs.png).
- LATER: Finish screen has no payoff (05-guided-done.png). Tier jargon (A/B/C/D) in intake options.
- Taste, not defect: warm-dark palette and mono eyebrows read as serious and niche rather than friendly. Fine for the brand.

## Would I...
- finish intake? No, not with 16 steps. Maybe if I could skip tests: ~7 steps.
- do session 1? Yes if I got there; the guided flow is good.
- come back tomorrow? Unlikely. No push, no reward after session, no streak or summary I can see.

## Keep
Landing hero and CTA; radio-card intake with a progress bar; "Where you start" explain-back; guided set screen with a big ring and "Something hurts"; rest screen with RPE chips; Record heatmap and chart; consistent card, type scale and radii across screens.
