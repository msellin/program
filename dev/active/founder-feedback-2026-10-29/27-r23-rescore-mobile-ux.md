# R23 rescore, mobile UX: Plan + Profile (412x915, shots/r23)

Scores: Plan 7 (was 6), Profile 8 (was 6).

## Plan
Header is fixed: wordmark, H1, one switcher card with the phase as a second line, no intro, no legend, one dot per row, no "2 TRACKS". Rows are clean: day + date, one title, chevron. Open row (Thu) has Open Day / Move... / Skip as 3 full-width 44px+ buttons.
- [H] "You've missed 2 of 3" card is ~650px open by default (plan.png): it pushes the whole week below the fold and the first day row is not visible at all → collapse to a 2-line summary with one "Choose" row (or show the 3 options collapsed behind it); keep the week visible at ~y=300. app/plan/page.tsx (missed-week card)
- [M] H1 "Plan" still costs ~50px beside the switcher → drop it, wordmark + active tab already say it.
- [M] Row titles repeat the day ("Mon — heavy squat day" under "Mon") → strip the day prefix from titles.
- [M] Dot states are unexplained (hollow = missed?, grey = planned, green = done) and the legend is gone → add a "?" popover or an "N done" word on the row.
- [L] Close X on the card is ~24px at top right (plan.png 368,238) → 44px hit area.

## Profile
Programs first, "Week 5 of 34", Away days gone, MORE is 2 rows, Working maxes sit between. Whole page is ~1.3 screens; Sign out is reachable with one scroll. Nothing blocking.
- [M] The email wraps to 2 lines in the account row with a hyphen break → truncate, or show a name and put the email as the subline.
- [M] Maxes warning triangles (3 of 4) have no label, so they read as errors → add a one-line key under the card title.
- [L] "Update my answers" / "End this program" text links sit 8px apart at ~12px type; keep the 44px row height but add a gap.
