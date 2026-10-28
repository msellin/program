# 01 Visual craft (2026-10-28)

**Verdict:** The type scale and one-card system work, and the app now looks like one product. It is still a dark, text-and-box app with almost no imagery or illustration. A stranger from an ad gets a wall of grey paragraphs before the first thing they can do.

Scores (1-5, 5 = best): text density 2 (too much text), text size 4, visual richness 2, consistency 4.

## Findings
1. **FIX-THIS-WEEK: too much explanatory text before the action.**
   - Day 1 (`dev/active/launch-readiness/screens/gaps/A-first-run/07-today-day-1.png`): the "Four tabs" card, then a "Setup" card, push the first session below the fold at 375.
   - First session (`.../A-first-run/08-first-session.png`): three bordered boxes of "how to run this" copy, then the Follow-along card, all above Start session.
   - Program detail (`.../A-first-run/05-program-detail.png`): a 4-line blurb, a Levels line, then 4 sections of paragraphs. Each section is a full card.
   - Fix: collapse "Four tabs" to a one-time toast. Show one line of cue per exercise, with the rest behind a tap.
2. **FIX-THIS-WEEK: the 16px body and 32px H1 work.**
   - H1 is clearly dominant: 32 vs 16 is 2x (`.../C-viewport-393/04-record-top.png`, `02-plan-top.png`).
   - Card titles at 17 bold vs 14 muted subtext read clearly (`.../C-viewport-393/01-today-top.png`, a screen that shows "Extra session").
   - The weak spot is the muted 14px grey subtext. It is the smallest body-like text on long screens and it carries meaning, e.g. the rest-day reason (`.../C-viewport-393/03-session-top.png`). Consider body size and `ink`, not `muted`, for any text that explains why.
3. **FIX-THIS-WEEK: mono is overused.**
   - It sets the history dates (`.../C-viewport-393/04-record-bottom.png`, a 30-row list of "Tue 13 Oct  logged"), filter chips (`04-programs.png`), the "LOAD 30 MORE" button, the program-detail Levels line and descriptive footers (`08-first-session.png`: "HANG, SCAP, ROW BASE · WEEK 1 OF 8 · ENDS 22 DEC").
   - The spec says mono is for numbers, dates and eyebrows. Descriptive sentences and buttons in mono drift from that and read as "dev tool".
   - Fix: sans for chips, buttons and footers. Keep mono for eyebrows and numeric values.
4. **LATER: the 11px eyebrows** (`TODAY · WEEK 7 OF 9`, `READINESS - 12 WEEKS`) with wide tracking are fine as labels. Do not put anything the user must read at 11px. The `HELD` tag (`.../C-viewport-393/01-today-top.png`) is borderline.
5. **FIX-THIS-WEEK: the first screen has no visual hook.**
   - `.../A-first-run/03-first-screen-after-sign-in.png` is a heading, a paragraph, a button and about 400px of empty ground.
   - Programs (`04-programs.png`) are text-only cards. There is no pull-up, handstand or barbell image anywhere in the app, although a skill app sells on seeing the skill.
   - Fix: one illustration or photo per program, shown on the program card and the day-1 header. It does not need to be elaborate: a line drawing of the skill ladder would do.
6. **GOOD: data viz is the best-looking thing in the app.**
   - The readiness heatmap (`.../C-viewport-393/04-record-top.png`) uses pill cells, a legend and a clean empty state. The retest card has a 40px metric with a green delta.
   - The week-dot strip on Today (`persona-handstand/mobile/01-day.png`) is compact and readable.
   - Peers (Whoop, Strava, Runna) lead with this kind of chart. Terav should too: put a mini progress or retest chart on Today.
7. **LATER: the Plan list has two row treatments.** Mon shows a grey dot and an expand chevron. Tue and Thu rest rows show "rest" with a chevron and no dot (`.../C-viewport-393/02-plan-top.png`). The Today row is tinted and a TODAY pill sits next to the date. Status is inferable but the rhythm is uneven.
8. **ADS-BLOCKER candidate, verify:** `.../A-first-run/08-first-session.png` shows the H1 "Wednesday" with the program name eyebrow cut off to the right ("FIRST STRICT PULL-"). The latest commit cb83e26 claims to have moved the program name above the day. Confirm the live build before spending ad money.
9. **FIX-THIS-WEEK: accent economy is mostly good, with two leaks.**
   - Bronze means primary action and "now". Teal is the info and link colour. Status is red, amber, green.
   - The "Back" link, "Export" and the "Levels" line are all teal. The Handstand Today view carries teal (Suggestion, WHY?), bronze (Advance, week dots), green, amber (dots, shoulder callout) and a bronze progress bar, all in one screen (`persona-handstand/mobile/01-day.png`). The `ADVANCE` suggestion card has bronze fill and a teal eyebrow, which is two accents in one card.
   - Fix: the eyebrow inside the Accept card should be bronze-hi or muted.
10. **GOOD: status-only left bars.** The red rest card (`.../C-viewport-393/03-session-top.png`) and the amber safety callout (`persona-handstand/mobile/01-day.png`) are unmistakable. The red card also gives the "Back to Today" CTA clear priority.
11. **LATER: Back and Next in intake** are equal-weight outline and ghost buttons (`.../A-first-run/06-intake-05.png`). The disabled Next in dim bronze is correct. Large dead space between the question and the footer is acceptable on a one-question-per-screen flow.

## Peer comparison (from `dev/audits/app/competitor-refs.md`; not re-researched)
- Pliability and GOWOD use video thumbnails and big imagery, Whoop and Strava use dominant rings and charts, Hevy uses dense tables. Terav has the density of Hevy and the imagery of none.
- Terav's type (16/32) is in line with them. Its restraint (one accent) is better than most. Its richness is lower than all of them.

## Keep
- The 8-step scale (eyebrow 11, caption 13, small 14, body 16, h3 17, h2 20, h1 32, metric 40) and the 32px H1.
- One card style and one radius set.
- Bronze primary button, with a single bronze nav-active indicator.
- The status left bars.
- The readiness heatmap and the metric cards.
- The "terav." wordmark with its bronze dot: it holds at about 24px.

## Note
`C-viewport-393/01-today-top.png` actually shows the Extra session screen, not Today. The capture names look mismatched. I used `persona-handstand/mobile/01-day.png` as the Today reference.
