# R23 rescore, COPY lens: Plan + Profile (2026-10-29)
Scores: Plan 6 (unchanged; the built cuts are real but the recovery card swamps them), Profile 8 (was 6).
Evidence: shots/r23/plan.png, plan-row-open.png, profile.png, profile-full.png.

## Fixed (verified)
- Plan intro, "2 TRACKS", legend gone. INTAKE PENDING, STAFF, Away days, Report/Evidence rows gone from Profile. "Update my answers" in.

## Still wrong
- [H] Plan opens on "You've missed 2 of 3 this week." plus ~20 words of reassurance; it is the first thing seen, keeps a missed-count scold, and pushes the week list off-screen. components/plan/WeekRecoveryCard.tsx:91-92,117 -> collapse to a one-line row "2 days missed · Fix the week ›" that expands to the three options.
- [H] Week switcher still "Cycles 3 and 4 · includes a strength test"; "cycles" undefined (BriefView.tsx:194 comment shows the same fix was made there). -> "Weeks 3-4 · strength test this week".
- [H] Day rows repeat the day: "Mon — heavy squat day" under "Mon". Strip the prefix -> "Heavy squat day". Other days have no prefix, so it is inconsistent.
- [H] Profile max rows show amber warning triangles (Front Squat, Back Squat, Block Pull) with no label. Amber = warning, meaning unknown. Add a sub-line ("Test due") or drop the icon.
- [M] Open row shows an orphan "None. This is the second squat day of the week — respect the load." (reads as an answer with no question) -> label it "Note:" or write "Second squat day this week: keep the load easy."
- [M] app/profile/page.tsx:295 "Browse all programs →" still caps + arrow -> "Browse programs".
- [L] "planned" lowercase next to the dot and the row "Open Day" capital D -> "Open day".
