# Peer visual language: GOWOD, Runna, Pliability (2026-10-28)

Sources: App Store frames (marketing, polished), screensdesign.com GOWOD and Runna galleries (real in-app captures; the
unlocked ones are sharp, locked ones are blurred but layout is readable). Pliability has no screensdesign page, so its
in-app evidence is limited to three App Store frames (Today card, search/browse, Training page) plus the web site. Treat
Pliability type sizes as estimates. Contact sheets live in the scratchpad `peers/` dir (not in repo, copyrighted).
No GOWOD or Pliability session-complete screen was obtainable; "done" evidence is Runna only.

## GOWOD (dark navy, blue accent)
- Player: video is a full-width ~16:9 band directly under a thin header (back, wordmark, kebab), about 30% of screen height. Looping studio clip, brand watermark on the wall.
- A 2px segmented progress bar sits ABOVE the exercise title, under the header: progress is the first thing you see.
- Title is small (about 16-17px, semibold, white); metadata line beneath in muted grey ("2/6 - 1 min each side - passive stretch"). The number that matters is not big here; the timer is.
- Below the video: two pill tabs (Instructions / Stimulus), outlined, the active one filled with a translucent blue tint. Instructions are bullet rows with small blue dots; Stimulus shows a front/back body silhouette with the target muscle highlighted in blue.
- Controls: bottom-left circular countdown ring with the seconds inside (the timer IS the control), then a skip chevron, then a squared "Next" button at the right. Rounded-rect ~10px radius, never a hard-edged rectangle.
- Overview: stacked photo cards with the title overlaid bottom-left (Pre WOD / Post WOD), day selector as small square chips (Day 1/2/3) with the active chip bordered blue, a bordered card listing the exercises, one full-width blue "Next" at the bottom.
- Colour: deep navy surfaces, one saturated blue for the single primary action and selected states; everything else grey-blue. Gradient only as a faint top glow on the hero.
- Progress/stats: a ring score (72%) with per-body-zone vertical slider bars, monthly bar chart, donut distribution.

## Runna (light UI in-app, black buttons, lime and coral colour)
- Colour is carried by a lime-to-white gradient wash behind the workout header (a different hue per workout type in the library: each type is a coloured block with an icon, e.g. strength blue, pilates green, intervals red).
- Session overview: big plain title ("4km Easy Run", about 28px bold), one-line meta, a row of three icon-over-label circles (warm-up, link activity, skip) that turn into black checkmarks when done: state is shown by the icon, not text. Step cards have a thick coloured left edge and a number.
- Today list on home: card with a green left edge, title, distance/time/pace trio in three columns with tiny caps labels.
- Player (warm-up/strength): header is a single timer "0:03 / 1:28" centred in large numerals with a thin progress line under it; a full-width 16:9 video (red running track, coach caption) fills the top third; below it a vertical stack of white exercise cards, each with a small left thumbnail figure, name, and "15 secs" in grey. Current card is the one under the video; the rest are the "next up" list.
- Controls: a bottom bar of two big pills side by side: black "Pause / Stop" and coral "Hold to Finish" (hold-to-confirm prevents accidents). Before starting there is a single full-width black "Start" with a play glyph.
- Done: the same workout page flips to completed: checkmark circles, a stats row (distance / time / pace, caps labels over large numbers), a thumbs feedback row ("How did you find this workout?"), then Share sheet. Completion is a re-skin of the overview, not a separate celebration screen.
- Corners: cards ~12-16px, buttons fully pill or ~12px.

## Pliability (pure black, neon yellow-green accent, mono caps captions)
- Today card: one large rounded card (~20px radius) with a wide hero photo carousel (today in the centre, tomorrow peeking at the edges), title and "12 min" over the image, then "Daily Sessions - 1 of 7 complete" and a full-width lime pill "Start" with a play glyph. Seven dots at the top (filled = done) are the week progress.
- Photos fill every tile with a bottom dark gradient scrim carrying the title in white; very high contrast: black ground, lime for exactly one action per screen.
- Browse: coloured icon tiles (green / blue) for entry points, section headers in plain 16-18px, chips with icon over label, horizontal carousels with a 15% peek of the next card.
- Typography: geometric sans for titles, monospaced all-caps for captions ("EVIDENCE-BASED ROUTINES"): a small technical-label voice.
- Player (from frames): full-bleed video with white title overlay at the bottom (about 28px, light weight), a blurred dark scrim, exercise list below with rounded thumbnails; pain-area heat spots in red/yellow glow on bodies in marketing.

## Cross-cutting
- All three keep the exercise name modest (16-28px) and rely on media, a timer/ring, and one big action button for richness; none shows a big weight/rep number because they are timed, not set-logged.
- Media 30-45% of screen height at top, full-bleed, no card border. Everything under it is a flat list of rounded cards with one thing per row.
- Next-up is always visible as the list below the current item (Runna), a Next button (GOWOD), or the next card peek (Pliability).

## Steal for Terav
1. Put a thin segmented progress bar (one segment per exercise, bronze for done, dim for rest) above the exercise title, as GOWOD does; it costs 2px and reads instantly.
2. Make the figure/clip band full-bleed at the top, 30-35% height, no border, with a bottom scrim; the animated line figure sits on a slightly lifted warm surface (not black) so it reads as a stage.
3. Make the "now" number huge: current set target ("4 x 6 @ 80 kg" or "Set 2 of 4") at 40-48px tabular figures, exercise name at 20-22px; peers undersize the title and lose hierarchy, but strength logging needs the number as the hero.
4. Use Runna's stack: current exercise on top, remaining exercises as compact rounded cards below with a 40px line-figure thumbnail, name and "3 x 8" in muted text; that is the "next up".
5. Bottom control bar of two pills like Runna: a bronze-filled primary (Log set / Done) beside a quiet outlined secondary (Skip / Pause); consider hold-to-finish for ending the session.
6. Circular rest-timer ring with seconds inside (GOWOD) that replaces the primary button area during rest, then turns back into "Log set".
7. Brief screen: Runna-style header with big plain title, one meta line, a three-column stat trio in small caps labels (sets / minutes / load) and a left accent edge on the session card in bronze; use a Pliability-style week dot row for progress and one full-width bronze "Start" pill with a play glyph.
8. Done screen as a re-skin of the brief: icon-over-label checkmark circles, result trio in big numerals with caps labels, a single "How did that feel?" feedback row, then one pill; add one tasteful gradient wash (bronze to background) behind the header as Runna does with lime, since we have no photography.
