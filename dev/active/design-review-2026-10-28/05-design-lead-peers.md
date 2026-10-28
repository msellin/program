# 05 Design lead: peer benchmark (Pliability, Hevy, Runna, Whoop)
Paths: G=dev/active/launch-readiness/screens/gaps ; P=next-app/tests/e2e/artifacts/personas/persona-pullup

**Verdict:** The system is disciplined and calm (Linear-grade), but it does not yet look like a product people pay for next to Pliability/Hevy/Runna/Whoop. The gap is visuals, not type or spacing: there is no human, movement or hero image anywhere in the stranger's path. Peers sell with pictures; Terav sells with paragraphs. (Peers compared from knowledge of their store pages; not re-fetched.)

Scores (1-5): text density 3 | text size 4 | visual richness 1.5 | consistency 4.5

## Findings
1. ADS-BLOCKER: exercise visuals. The session player's media slot is an empty box saying "No illustration yet, open the full tutorial" (P/flows/session-log-set/02-set.png, P/flows/session-follow-along/03-guided-working.png). It holds ~25% of the screen, on the one screen that is the product. Hevy/Pliability show a looping clip or image there. A stranger doing a first pull-up session sees a placeholder. Hide the slot when no media, or fill it.
2. ADS-BLOCKER: first run is wall-to-wall text with no payoff image. Landing (G/A-first-run/01-landing-pullup.png) is a headline + 4 bullets; program detail (05-program-detail.png) is "Section 1 of 4" text cards; Today day 1 (07-today-day-1.png) leads with a "Four tabs" tutorial card, then a setup card, then "HOW TO RUN THIS" stacked text cards that name no exercise (08-first-session.png). Pliability's first screen is a person mid-movement and a single CTA. 16-step intake (06-intake-03.png) is honest but long, with no sense of reward; the progress bar is a thin 1px sliver.
3. FIX-THIS-WEEK: Today has no hero. Whoop's one-number card / Runna's today-workout card both make "what do I do now" a picture plus a number. Ours is title, progress bar, text. The primary button is good (bronze, thumb zone, 08-first-session.png) but the card above it is prose.
4. FIX-THIS-WEEK: progress viz is the best-looking surface and under-used. Readiness grid + big "112 reps +12.0" metric (G/C-viewport-393/04-record-top.png) is Whoop-like and good. But it is rendered as a status grid, not a progress line; the strength story (reps over time) is not the hero and the history below is 30+ text rows (04-record-bottom.png).
5. FIX-THIS-WEEK: Plan is a text list (02-plan-top.png): truncated descriptions ("Scapula..."), "Rest / accessory day" repeated. Runna shows per-day workout type chips/icons and a visual week strip. Cheap win: day-type icon + duration.
6. LATER: Programs catalog (06-programs-top.png) is text cards with CITED chips; no cover art, a "Sort" native select, "Curated" dropdown, chips that read as buttons. Reads as a directory, not a shelf. Pliability/GOWOD have a cover image per program.
7. GOOD, keep: the rest screen (P/flows/session-log-set/03-rest.png): huge 2:00 timer, "How was that?" RIR chips with "~3 more" hints, clear Skip/+30s hierarchy. Comparable to Hevy's rest timer and better on coaching. The rep dial (02-set.png) is clean and thumb-reachable.
8. GOOD: the red "Back off" morning check (G/C-viewport-393/05-check-top.png): status bar + plain explanation. Confident, not clinical; no peer does safety this well. A selling point for the ad story, not just a screen.
9. TASTE: type scale reads right at 375/393; body 16 is comfortable, monospace eyebrows give identity. Dim grey secondary copy (landing, 05-program-detail.png) is at the low end of contrast, and all-caps mono labels are everywhere (eyebrow overload dilutes hierarchy).

## 3 highest-leverage moves for the ad test
1. Fill the session media slot: a looping 3-5s clip or a still per pull-up/handstand drill (start with the ~8 moves of first-strict-pullup and handstand-walk). If not ready by launch, collapse the empty box and move the exercise name + cue up.
2. Put one real image on the landing hero and program detail (a person on the bar / wall handstand, bronze-graded to the palette) and make the first Today screen show the first exercise visual plus "Start session" instead of the Four-tabs tutorial and prose cards.
3. Make the first-run reward visible: intake progress as a real stepped bar with "2 min left", and end it on a "Your starting tier: Hang" result card (the Whoop-style single answer) before Today.

## 3 for after
1. Per-program cover art + day-type icons on Plan/Programs, so the catalog reads as a shelf (Pliability/Runna).
2. Today hero card: today's focus, duration, one metric trend (Whoop pattern), replacing the stacked "how to run this" text.
3. Progress line chart for the program's headline metric (max reps/hold) as the Record hero; collapse the long history list behind it (Strava summary pattern).

## What to keep
Warm-dark palette and bronze CTA; the card/radius system; rest screen and RIR chips; rep dial; Back-off check; readiness grid + metric; bottom nav. Do not add chrome to fix the visual gap: add images.
