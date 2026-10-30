# Design lead - Plan tab rescore (live)
Score now: 7/10 (was 5). The shipped structure is right (accordion, one action, verbs behind the menu, track rows, Not logged). What holds it back is information being cut off or contradicting itself, not layout.

Checked myself: two-track-393-01-load and -02-open-1. Confirmed the state word is clipped ("Anterior hip + strength rebuild . No..."), and today (Fri) has a green check while both tracks read "Planned". Collapsed summaries also clip mid-phrase.

## Ranked follow-ups (votes = lenses that raised it, of 5)
1. Track row clips its own state. 5/5 (visual, mobile, copy, a11y via 1.4.10, user). page.tsx:~662-689 (Link row, min-h 44 at :681). Let the label wrap or put the state in a right-aligned column. REAL DEFECT: the state is the point of the row.
2. Today's header green check while all tracks are Planned. 1/5 raised it (user), plus visual's "mixed state cues". page.tsx header glyph logic and lib/plan-day-tracks.ts. I confirmed it in 01-load. REAL DEFECT: a "done" mark on an undone day is wrong. Show a ring or "today" mark until a track is Done.
3. One term for the same state: "Missed" badge and "2 of 3 missed this week" vs "Not logged" in the rows. 2/5 (copy, user). The Skip dialog already argues against "missed". Use "Not logged" in the badge and banner; rename "Fix the week" to what it does. REAL (inconsistency); the exact wording is an idea for app-copy-clarity.
4. Collapsed-row summaries clip mid-phrase ("pre-bed +...", "pre- bed"). 2/5 (visual, user wants dots). Cap at "N blocks" or two clean lines; non-breaking hyphen. IDEA, polish. The per-track dots are an idea and I decline them for now (more chrome on the quiet list).
5. Menu sheet floats 12px off the bottom with the nav visible behind it; the focus-trap re-arm below. 2/5 (mobile, a11y). page.tsx:~945-960 (p-3 wrapper), useFocusTrap.ts:68. Dock the sheet with safe-area padding and wrap closeMenu in useCallback. Mostly IDEA; the re-arm is a minor REAL defect.

## Focus-trap claim (a11y finding 1): partly real
Real: closeMenu (page.tsx:931) is a new function each render and is in the effect deps (useFocusTrap.ts:68). Any DayMenu re-render while the sheet is open (opening Move or the Skip confirm sets state) re-runs the effect and sends focus back to the first item.
Wrong: "overwrites previouslyFocused with a node inside the sheet, so Esc returns focus to the wrong place". The cleanup runs first and calls prev.focus() on the "⋯" button; the next effect then reads activeElement as that button. Focus restore stays correct. The impact is a focus jump, not a lost return point. Severity: minor. Fix: useCallback for closeMenu, or hold onEscape in a ref in the hook (shared by 9 consumers, so the hook fix is better).

## Rejected lens findings
- Rename "Open day" to "Start session" (copy): the link opens the day, not a session; wording is a toss-up, not a defect. Leave it.
- Mobile "scrim tap-to-close needs confirming": it exists (page.tsx onClick={closeMenu} on the dialog wrapper, panel stops propagation). Not a finding.
- Mobile "no active: states / sticky hover": real in principle, not seen on live, keep as backlog and not in the top 5.
- Visual "two button styles for one slot": intentional (primary on today, quiet elsewhere); one primary per view is right.
- "Add per-track dots to collapsed rows": rejected for now, see 4.
