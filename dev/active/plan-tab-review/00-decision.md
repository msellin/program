# Plan tab review: decision (2026-10-29)

Evidence: owner's phone, `shots/phone-1..7.png` (Plan with days open, Record). Brief: `BRIEF.md`.
Lenses: `01-visual-craft` · `02-mobile-ux` · `03-copy-clarity` · `04-accessibility` · `05-user-two-track-athlete`
(CrossFit athlete running two tracks) · `06-design-lead` (decides). All Sonnet. **Nothing built yet. Waiting on the owner.**

## Scores: Plan with days open, 1–10
| Visual | Mobile UX | Copy | A11y | Two-track user | Design lead |
|---|---|---|---|---|---|
| 4 | 4 | 5 | 6 | 5 | 5 |

Record "Recent": 6 / 6 / 7 / – / 7. Visual's 6 is a guess: that lens did not open phone-7.

A 10 needs (lead): one day open (today), one entry point per track, logged days that read as finished, no label
wrapping, and Move/Skip out of the content column.

## Agreed changes (votes are out of 5 lenses)
1. **Accordion: yes (5/5).** One day open at a time. Today is open on load. Tapping the open day closes it. Focus
   stays on the toggle that was pressed (a11y).
2. **One action per open day (5/5).** It is a single auto-width button, so no 3-column grid and no wrapping.
   Labels are "Open day", "Log" and "Preview", sentence case, no arrows. Bronze is used only on today. The
   accessible name includes the date.
3. **Move/Skip go behind "⋯" (5/5, option a).** A 44 px "⋯" sits on the open day's header and opens a bottom
   sheet with Move… and Skip. The sheet takes focus, Esc closes it, and focus returns to "⋯". It reuses
   `MoveSheet` and `ConfirmSheet`. The house rule says verbs belong out of the content column; this meets it
   per day, not as a screen-level top row.
4. **Hide verbs that can't apply (5/5).** A logged day gets no Move or Skip. A missed past day keeps Move. Verbs
   are hidden, not disabled.
5. **One log entry point, not two (5/5).** The track lines become the entry points: "Anterior Hip Rebuild ·
   Not logged ›" and "Overhead Mobility · Done ✓ ›". Each one opens that track's session for that date. The
   full-width "Log overhead mobility →" and the "Log session →" button both go.
6. **Past-day state reads true (5/5, plus user D9).** "planned" on a past day becomes "Not logged". A logged
   track shows Done ✓, so Mon and Wed stop saying "planned" after a squat or pull was logged.
7. **Record "Recent": keep it as is (3–2, lead decides).** Plan looks forward over this week. Recent looks back
   across weeks: the owner uses it for last week and for the notes counts.
8. **Bottom-nav labels: keep sentence case (5/5).** The app already uses sentence case (`BottomNav.tsx:29-34`).
   The two-track user doesn't care either way. Uppercase adds nothing and reads worse at caption size. Peer
   note: Runna, Hevy, Strava and Whoop also use sentence/title-case tab labels. That comes from general
   knowledge and was not re-checked this round.

Small items the lead adopted:
- Show the program's display name, not the slug (`page.tsx:884`, `1041`).
- "Open Day" becomes "Open day".
- Drop the green "· 1 logged" suffix; the check marker already says it.
- Clear the bottom nav: phone-3 shows the Wed row clipped.
- Show skipped days with a "Skipped" label instead of `opacity-70` (`page.tsx:557`, contrast).

Deferred: clamping the collapsed summary to one short title (visual D9). The accordion may make it unnecessary.

## Action set per day state (lead's ruling)
| State | 1-track user | 2-track user | "⋯" sheet |
|---|---|---|---|
| Today | bronze "Open day" | bronze "Open day"; track lines are status only | Move, Skip |
| Past, any track logged | one button (lead: "Edit") | track lines "Done ✓ ›" / "Not logged ›"; no button | none |
| Past, missed | "Log" | track lines "Not logged ›"; no button | Move, Skip |
| Future | "Preview" | track lines "Planned ›" open Preview; no button | Move, Skip |
| Rest day | "Log a session" today/past; nothing on future days | same | none |
| Skipped / moved | inline "Unskip" / "Undo move" (unchanged) | same | n/a |

The rule: a day never has two controls that open the same thing. With 1 track, the track list stays hidden.

## Dissent and open points
- **D7 Recent:** mobile UX and copy wanted current-week days dropped from Recent (Plan already shows them).
  Copy's fallback is to rename it "Earlier". They were outvoted 3–2.
- **The per-state table is the lead's ruling.** The lenses did not vote on it row by row. Two calls in it are
  worth the owner's eye:
  - A partly logged 2-track day gets no "⋯", because Move would drag the track that is already done. So you
    can't move the unlogged half.
  - "Edit" is the lead's own label for a logged past day on a 1-track user. Copy may rename it.
- **Move takes two taps.** The user lens accepted "⋯" but asked that Move stay "one tap away"; behind "⋯" it is
  two taps.
- **A11y** rated a visible text-link strip (option b) the safest pattern, and voted (a) on condition of the
  focus handling in item 3.

## Implementation sketch (`next-app/src/app/plan/page.tsx`)
- **67–75:** replace the `expandedDays` Set with `openDay: string | null`, initialised to today's ISO date.
  Tapping the open day sets it to null.
- **551–715 (day row):**
  - Add "⋯" to the header when Move or Skip applies.
  - Remove `opacity-70` (557) and the "· N logged" suffix (593–597).
  - Add bottom padding on the page container so the nav does not clip the last row.
- **636–650 + 1018–1047 (`perProgramDayStates`):**
  - Return `{ slug, displayName, state: done | notLogged | planned }`, taking `displayName` from the manifest.
  - With 2+ tracks, render each track as a `Link` row to `/session/<slug>?date=` on every day except today.
  - On today, render plain text.
- **790–972 (`WeekDayActions`):**
  - Delete the secondary-track buttons (873–887) and the 3-column grid (897–944).
  - Render the single button only where the table says.
  - Move Move/Skip into the "⋯" sheet, reusing `ConfirmSheet` (946) and `MoveSheet` (959).
  - Leave the Unskip / Undo-move branch (835–849) and the rest-day branch (851–867) as they are.
- **Unchanged:** `BottomNav.tsx` and Record.
- **Tests:** the e2e specs (`next-app/tests/e2e/launch-gaps.spec.ts`, `tests/e2e/harness/flows.ts`) reference the "Log
  session →" / "Move…" buttons and need updating. Then rescore on live screenshots per the consensus rule.

## Built (2026-10-29, owner said "Build it")
- `next-app/src/app/plan/page.tsx`:
  - `openDay` holds one day (today on load).
  - `WeekDayActions` renders a single button: "Open day" / "Log" / "Edit log" / "Preview" / "Log a session" / "Unskip".
  - New `DayMenu`: a "⋯" sheet with Move… / Skip, using `useFocusTrap` (Esc closes it, focus returns to "⋯").
  - Track lines are `Link` rows on non-today 2-track days.
  - The "· N logged" suffix and the skipped-day `opacity-70` are gone.
- `next-app/src/lib/plan-day-tracks.ts` (+ test): per-track state. A track counts as done when the day's log has
  a done exercise under one of its blocks. The block state alone missed the founder's Mon squat and Wed pull,
  because exercise keys carry the session's block id, which is not always the scheduled instance id.
- e2e harness (`flows.ts`, `launch-gaps.spec.ts`): Move/Skip flows open the day, then "⋯", then the verb.
- Not changed:
  - Bottom padding. Mobile's D9 was a false alarm: `AppShell.tsx:213` already pads 64 px plus the safe area,
    and phone-3 only caught a row mid-scroll.
  - "Edit log" is used for a logged past day on a 1-track user; copy may still rename it.
- Local captures (dev server + seeded throwaway 2-track user, since deleted): `shots/build/`.
- Still to do: rescore on live screenshots once CI deploys.
- Seen in passing, not touched:
  - The `e2e-persona-concurrent` week renders all Rest on live too (persona data).
  - The orphan "None. This is the second squat day…" conditioning line (r23 [M]).
  - A past day with an unlogged log row still reads "planned" in the day marker (Wed in one-track shots).

## Rescore on live (2026-10-30, round 2)
Evidence: `shots/live/` (seeded two-track test user at 393 and 375, hip persona at 393; the test user is since
deleted). Brief: `RESCORE-BRIEF.md`. Lens files: `r2-01..r2-06`.

| Visual | Mobile UX | Copy | A11y | Two-track user | Design lead |
|---|---|---|---|---|---|
| 7 (was 4) | 7 (4) | 6 (5) | 8 (6) | 8 (5) | 7 (5) |

All lenses say every shipped change landed. The lead's ranked follow-ups (not built; owner decides):
1. **Track row clips its own state** ("Anterior hip + strength rebuild · No…"), 5/5, real defect. Let the label
   wrap or give the state its own right-aligned column (`page.tsx` track `Link` row).
2. **Today shows a green check while both tracks read "Planned"** (two-track-393-01-load). Real per the lead;
   the cause is not yet traced: the day marker and the track lines read the log differently.
3. **One word for one state:** the "Missed" badge and the "2 of 3 missed" banner vs "Not logged" in the rows; also
   "Fix the week" is vague. 2/5.
4. Collapsed summaries cut mid-phrase ("pre-bed +…"). Polish, 2/5.
5. The "⋯" sheet floats above the bottom edge; `closeMenu` is a new function each render, so the focus trap
   re-runs and focus jumps to the first item when the sheet re-renders. Return focus stays correct (the lead
   checked the a11y claim against `useFocusTrap.ts:68`). Fix in the hook (9 users) by holding `onEscape` in a ref.
Rejected: renaming "Open day", per-track dots on collapsed rows, and the "two button styles" note (intentional).

## Built after the rescore (2026-10-30, owner: "Fix top three")
1. Track lines: the name wraps and the state sits in its own column, so "Not logged" / "Planned" never clips.
2. The day marker reads Done only when no track on that day is still Planned or Not logged. Logged work outside
   every track (an off-plan session; in the seeded user, a back squat on a home-rehab day) now shows Partly done,
   not a filled check over two "Planned" lines.
3. One word: the day badge, the legend and the banner say "Not logged" ("2 of 3 not logged this week"); the
   banner button is "Adjust the week ›" and its first option "Skip the unlogged days". The day badge no longer
   wraps beside "⋯" at 375 px.
Checked locally on a seeded two-track user (393 and 375) and the hip persona at 375; test user deleted.
Still open: follow-ups 4-5, and a past day whose log holds only unlogged rows still reads Planned (Wed).
