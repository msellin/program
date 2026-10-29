# R23 rescore: Visual craft, Plan + Profile (2026-10-29)

Evidence: shots/r23/plan.png, plan-row-open.png, profile.png, profile-full.png.

Scores: Plan 7/10 (was 6), Profile 8/10 (was 6).

## Plan
- [H] Missed-week card (amber bar, 3 option boxes, "what a skipped week does" box) is ~650px tall and pushes day list to ~y=1000; the 200px target is lost whenever it shows → collapse to headline + one primary "Shift the week" with the other two behind "Other options", cut the grey explainer box.
- [H] Day-row glyph is still a dot with colour only: Mon/Tue hollow vs Wed/Fri/Sat grey vs Thu green are nearly indistinguishable, no shape per state, no icon+word per brand rule → ring+check for done, empty ring for planned, bronze ring for today (page.tsx ~581-640).
- [M] Row title "Mon — heavy squat day" repeats the day name already on line 1 → strip the "Mon — " prefix.
- [M] Expanded Thu: second grey dot + "Anterior Hip Rebuild · planned" and a green "✓ front squat" line add three tones in one block → one muted line.
- [L] Amber is used both for the missed card and TODAY chip border.

## Profile
- [M] Amber warning triangles on 3 of 4 maxes, unexplained → add a word ("stale") or drop the icon.
- [L] "Update my answers" / "End this program" underlined text sits tight under the tappable program row → demote End into the program detail.
- [L] Sign out is a full outlined button; make it a text row so it stays quiet.
