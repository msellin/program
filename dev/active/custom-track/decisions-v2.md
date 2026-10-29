# Custom track v2: design decisions for vote (2026-10-28)

The owner rejected v1 (`custom-track-layout.md`) as dull and pointed at GOWOD, Runna and Pliability as the visual
bar (`peers-visual-language.md`). Rule: peers are idea sources only; each decision below passes only on a majority
of lens votes, AND only if it keeps Terav's core idea:
- one focus, sharpened every session against the user's own log;
- confirm-first: the engine proposes, the user accepts; nothing changes silently;
- every change cites a study or names its log signal;
- runs alongside the user's existing week; not a full training plan.

Fixed (not up for vote): one prescription line per exercise, no duplicate top-set card, "set N of M" never
truncates, a set list that works at 15+ sets, Last time with context and the right comparison, Change weight /
Missed as real buttons, figure + tap-to-load demo in the player (nothing from YouTube before a tap), Something hurt
one tap away, proposals stay on the brief, tokens from `brand/tokens.css` only (flat bronze brand, no new colours).

## Brief
- **B1 Header** (GOWOD/Pliability): program eyebrow, 32 px day name, one meta line
  "4 exercises · about 60 min · week 3 of 8". Phase jargon removed.
- **B2 Stat trio** (Runna/peers): three tiles under the header — `18 sets` · `60 min` · `102.5 kg top`.
- **B3 Why-today line** (Terav core): one line under the header naming the basis, e.g. "Top set 81% of your 126 kg
  training max · cycle week 3" with a › to the evidence/plan. Replaces the deleted card's basis line.
- **B4 Exercise cards** (Runna stack): rounded-2xl cards, 72×54 line-figure thumbnail left (blank tile with the
  movement initial when no figure yet), name 17 px, one prescription line. Main lift card is taller, has a bronze
  left edge, and shows its sets as small chips: `77.5×5` `90×5` `102.5×5+` `5×77.5`.
- **B5 Start pill** (Runna/Pliability): full-width bronze pill with ▶ glyph, "Start session"; in progress
  "Continue — set 4" with a quieter "Finish" beside it.
- **B6 Week dot row** (Pliability): 7 dots for this week's sessions under the header.

## Player
- **P1 Progress bar** (GOWOD): thin segmented bar at the top, one segment per exercise, each filling by its sets.
- **P2 Exercise switcher**: the exercise name is a button ("Block pull, mid-shin height ▾ · 1 of 4") that opens a
  sheet listing every exercise with n/m done. Replaces the truncating tab rail.
- **P3 Media band** (GOWOD/Pliability): the animated line figure fills a band ~30% of screen height at the top
  (24% under 700 px tall), warm lifted surface, "▶ Watch demo" pill on it (tap loads the trimmed clip in the band).
  No figure → no band; a slim "▶ Watch demo" pill sits under the name instead. No figure and no clip → nothing.
- **P4 Set line**: under the name, "Set 3 of 8 · Top set · 81% TM" (role: Warm-up / Set / Top set / Back-off /
  Extra set / Editing set N).
- **P5 Hero target** (Runna/coach): 56–64 px tabular numerals "102.5 kg × 5+", plates "Per side 25 + 15 + 1.25"
  beneath, then "Last top set · Mon · 101 × 5".
- **P6a Set strip — horizontal**: one row of 56 px-wide chips (kg×reps, ✓ when logged, current outlined bronze),
  scrolls sideways, current chip centred; same accessible names as today's pips.
- **P6b Set list — table**: Hevy-style 3-row table (set · kg · reps · state), scrolls inside itself.
  (Vote for ONE of P6a / P6b.)
- **P7 Next-up line** (Runna/coach): one muted line above the button, "Next · set 4 · 77.5 × 5" or "Next · Barbell
  hip thrust".
- **P8 Bottom bar** (Runna): full-width bronze pill "Done — set 3 · 102.5 kg"; under it two outlined 44 px pills
  "Change weight" · "Missed 102.5 kg". AMRAP: a 5×2 rep grid replaces the pill.
- **P9 Rest ring** (GOWOD): rest countdown drawn as a ring (same ring as the guided player) around today's big
  number; the effort question (Easy / Right / Too hard) stays — it is an engine input.
- **P10 Header wash**: a soft bronze-to-ground gradient behind the media band / brief header (Runna's lime wash).
