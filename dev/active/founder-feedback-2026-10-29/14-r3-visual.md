# R3 Visual craft: Plan, Profile (2026-10-29)

Read: plan/page.tsx 520-760 (row), profile/page.tsx classes, brand/tokens.css (bronze = only accent; status colours must travel with icon + word; teal = data).

## Plan: what is wrong
- Dots (page.tsx:581-608, 625-640): 2 dots per row, 8px, grey/muted-60 when planned. Two identical grey dots read as a bug, not data. Bronze-for-today is not in the legend. Per-program dots only carry meaning if the user can tell which program is which; they cannot. Colour-only status also breaks the brand rule (status = icon + word).
- "2 TRACKS" chip (:667-672) is on EVERY row, so it carries zero information. It also borrows amber (status colour) as decoration, against tokens.css. Cut.
- Row line 1 stacks day, date, TODAY chip, "· 1 logged", tracks chip, chevron; wraps with flex-wrap. Line 2 truncates the titles (line-clamp-1, :696), so the single most useful fact (what is the session) is the one clipped.
- Header stack (wordmark, H1, intro, week card, phase card, legend) = 30-40% of screen. Legend explains a dot system that should not need one.

## Plan: change
1. Cut the intro sentence, the "2 TRACKS" chip and the legend row. Fold the phase card into the week switcher as a subtitle line ("26 Oct - 1 Nov / Cycles 3-4, strength test"). Target: first day row at roughly 200px from top, not 300+.
2. Row = fixed 3-column layout: [status glyph 20px] [day + date, then titles] [right: chevron]. Day name "Mon" + date in one muted line; titles on line 2 may wrap to 2 lines (line-clamp-2) instead of 1 and drop the " + " join for " · ".
3. Replace the dots with ONE per-day glyph, with a shape per state (shape, not just colour):
   - done: green filled ring with check (lucide Check 12px), partial: ring with half fill (conic-gradient), planned: empty ring line colour, today: bronze ring 2px + row tint, skipped: amber dash/minus, moved: slate arrow, rest: no glyph, just muted "Rest".
   - Programs: replace per-program dots with a 6px coloured tick per track ONLY when 2+ tracks have sessions that day, and only on the expanded view. Collapsed row names the sessions in text, which already says which program.
4. Small per-day visual: yes, the done ring (item 3) is the one visual worth adding; a week strip of 7 rings (M T W T F S S) above the list doubles as the legend and as a progress hook ("3 of 5 done"). Not a figure per day: too heavy at 7 rows, and the figure belongs to the set player. Track colour: reject; a second palette fights "bronze is the only accent".
5. Keep: card with divide-y, today tint bg-bronze/8, expand-for-actions pattern.

Scores: Plan now 6/10 (clean parts, but unexplained dots, redundant chip, crowded head). After: 8.5/10.

## Profile: per section
- Account card: KEEP, but shrink: drop the avatar to 40px, move STAFF chip off the founder-only path (internal; hide for users). Fine otherwise.
- Working maxes: KEEP, REDESIGN lightly: show as 3 plain rows with tabular-nums value right-aligned, no chevrons until tapped (:158). Hide the whole card when empty (skill programs) rather than showing nothing or an empty frame. Move up under Programs? No: keep below Programs; programs are the primary object.
- Programs: KEEP first, move ABOVE working maxes. "INTAKE PENDING" shows on programs trained for weeks: visually it reads as an error; show only when no intake and zero logged sessions, else nothing. "End this program"/"Remove": demote to a row overflow/in-detail (red underline text at :256 sits too close to the tappable row).
- Away days: CUT from MVP Profile (agree with founder: date pickers + input + Add = tallest card for a rare action). MOVE to Plan, as a "Away?" row action on the week card, post-MVP.
- MORE list: REDESIGN. Six rows with identical grey icons is a junk drawer. MVP keep: Send feedback, Guide, Evidence. MOVE Extra session to Today (it is a session verb; memory: actions in the top row). MOVE Re-run intake into the program row detail. Report: fold into Record. Rows 16px muted icons: give the three that remain a one-line muted subtitle so they stop looking like settings.
- Footer links + Sign out: KEEP, make Sign out a text row, not a button, so it does not compete with bronze.

Ideal order: account (compact) > Programs > Working maxes > More (3 rows) > footer + Sign out.

## Top 3
1. Plan: delete the "2 TRACKS" chip, intro and legend; fold phase into the week card; first day row visible within ~200px.
2. Plan: replace the double grey dots with one shape-coded per-day glyph (done ring / partial / planned / today bronze / skipped / moved) plus a 7-ring week strip.
3. Profile: reorder (Programs first), cut Away days from MVP, cut MORE to 3 rows, and stop showing INTAKE PENDING on programs already in use.
