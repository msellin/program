# Deep design review: lead verdict (2026-10-28)

**Inputs.** 6 Sonnet reviewers on live screenshots of the new visual system (cb83e26):
- 01 visual craft
- 02 mobile UX
- 03 copy density
- 04 accessibility
- 05 design lead vs peers
- 06 stranger from a pull-up ad

The lead checked the disputed claims against code and the latest captures.

## Verdict
The visual system worked. Every reviewer scored consistency 4–4.5 and text size 4, and the 16px body with a 32px H1 reads well. The product still sells with paragraphs where its peers sell with pictures and short paths:

| reviewer | text density | text size | visual richness | consistency |
|---|---|---|---|---|
| visual | 2 | 4 | 2 | 4 |
| mobile | 3 | 4 | 3 | 4 |
| copy | 3 | 4 | 3 | 3 |
| a11y | 4 | 3 | 3 | 4 |
| design lead | 3 | 4 | 1.5 | 4.5 |
| stranger | 3 | 4 | 2 | 4 |
| **mean** | **3.0** | **3.8** | **2.4** | **3.9** |

Weakest areas: visuals, then text volume on the ad path. Not type size, and not consistency.

## Ads-blockers (verified)
| # | Issue | Raised by | Fix | Owner |
|---|---|---|---|---|
| B1 | The session player's media box is a quarter of the screen showing only "Open the full tutorial for this move." on drills without a figure (`persona-pullup/flows/session-follow-along/02-guided-ready.png`) | 05, 06 | When there is no figure, collapse the box. The exercise name and cue move up, and the tutorial becomes a link. | A |
| B2 | Intake answers show "TIER A / A-B / B-C"; questions run to 40+ words; 16 steps | 03, 06, (prior P-25) | Drop the tier hints. Shorten questions to one line plus at most a 12-word helper. Show "~3 min" on step 1. | A |
| B3 | Day-1 Today: the "Four tabs" tour card pushes the first session below the fold at 375 | 01, 02, 03, 06 | Delete the tour card; the nav labels already say it. | A |
| B4 | Program detail: about 250 words in 4 "Section n of 4" cards, no Start button in the first viewport | 02, 03, 05, 06 | Sticky "Start free" CTA. Cut to about 80 words, with "How it works" collapsed. | A |

## Fix this week
- **Session brief.**
  - Three unlabeled "how to run this" prose cards sit above the exercises.
  - The sticky footer (extra-session link, 2-line mono phase line, Start) takes 28% of 375×667.
  - "guided, one at a time, with a timer" repeats three times.
  - Fix: Start plus the nav only, and cues fold into each exercise. (01, 02, 03, 06)
- **Morning check.** The sticky "Update check" bar covers the severity chips. These are the safety input. Add scroll padding. (02, 04; was V-12)
- **Jargon.**
  - tier, arc, engine and capability appear in user copy.
  - The Plan banner "engine interleaves… weakest capabilities".
  - A grammar bug in the handstand proposal: "Wall handstand established's threshold".
  - Use "level". (03)
- **Mono overuse.** Chips, buttons, the "Load 30 more" button, the Levels line and footers use mono. Mono is for numbers, dates and eyebrows only. (01, 04, 05)
- **Small fixes.**
  - A teal eyebrow above the bronze CTA on the handstand Advance card.
  - Record "1 green · 1 amber · 1 / red" wraps, so use dots.
  - Red text on surface-3 is 4.08:1, so use red-strong.
  - "Why" copy is in muted; use ink.

## Biggest gap: visuals (owner decision)
There is no image of a person, movement or program anywhere on the stranger's path (all six reviewers agree). Peers lead with imagery (Pliability, GOWOD) or charts (Whoop, Strava).
- **Cheapest:** one cover image per advertised program, shown on the program card, program detail and the day-1 header. Needs assets: photo, AI image or illustration.
- **Already in the code:** `components/follow-along/ExerciseFigure.tsx` (rig figures). Find which ad-path drills lack a figure.
- **Later:** day-type icons on Plan, a progress line as the Record hero, a finish-screen payoff.

## Not defects / already handled
- "FIRST STRICT PULL-" clipped beside the H1: fixed in cb83e26. The A-first-run shots were taken on 70351e8.
- "next= lost after sign-in" (06): the harness signs a fresh user in directly and never passes `?next`. The real carry-through is SG-01 (6e89b95). Re-test on the owner's phone sign-up (O-02).
- C-393 `01-today-top` shows the extra-session screen: a capture redirect quirk (G-13), not the app.
- Sign-up's 3 ticks are a compliance design (SG-02: terms, explicit health consent, 16+). Owner option: merge terms with 16+ into one tick. Art. 9 health consent must stay a separate tick.

## Keep (do not churn)
- the 8-step scale with 32px H1 and 16px body;
- one card, named radii, status-only bars;
- the bronze primary;
- the red rest card (the best screen, 28 words);
- the in-session rep dial, rest screen and effort chips;
- the Record readiness heatmap and 40px metric;
- "Pick your focus.";
- the 4-tab nav;
- plain consent lines.
