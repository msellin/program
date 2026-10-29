# Copy clarity — Plan tab
Score now: 5/10 (Plan, opened-days state). What a 10 needs: one verb per state ("Log", "Preview", "Open"), true track states ("Not logged", not "planned" on Tue "Missed"), no wrapped labels, track names in Title case, no contradictory header vs row ("Missed" badge over two "planned" lines).
Record Recent score: 7/10 (clear, scannable; "3 done" fine; "Recent" is generic but the heading is honest. Overlap with Plan week is a content-duplication issue, not a wording one).
D1 APPROVE — fewer simultaneous labels on screen; today open by default removes the first tap.
D2 AMEND — one button: "Open" (today) / "Log" (past) / "Preview" (future). Drop arrows (decorative, and "Open Day" is Title case vs sentence-case elsewhere). "Log" alone is fine because the date is the row header.
D3 AMEND — (a) overflow "⋯" with "Move…" / "Skip" in a sheet. Rarely used verbs should not share row weight with the main action; label the icon "More".
D4 APPROVE — a verb that cannot apply should be absent, not disabled-grey. Mon "1 logged" offering Skip is a lie.
D5 AMEND — tappable track rows ("Anterior Hip Rebuild · Not logged ›") beat a sheet: label and action are the same string. Two-track past day: both rows show state; no separate "Log overhead mobility →".
D6 APPROVE — "Not logged" on past, "Planned" on today/future, check + "Logged" on done. "Missed" badge on Tue then agrees with rows; use "Not logged" in rows and keep "Missed" only as day badge (or drop one).
D7 AMEND — (b) Recent drops current-week days; plan owns them. If kept as is, rename "Recent" -> "Earlier" so it does not repeat Plan's week. Phone-7 shows Thu 29, Wed 28, Mon 26 in both places.
D8 APPROVE keep Sentence case — matches every other label in the app; uppercase is already used for heatmap legend ("AMBER CHECK") as a data caption, keep that distinction. Nav label = tab H1 ("Today", "Plan", "Record", "Profile") is consistent.
D9 Track names: the slug is regex-lowercased ("Log overhead mobility →") while the row says "Overhead Mobility". Render the program's display name everywhere; never `slug.replace`.
D10 Capitalisation: "Open Day" (Title) vs "Move…" / "Skip" / "Log session →" (sentence). Make all sentence case.
Top 3 findings
1. plan/page.tsx:884 `Log {slug.replace(/-/g, " ")} →` produces lowercase slug text and sits above a "Log session →" that is ambiguous between tracks (page.tsx:918).
2. plan/page.tsx:1019-1047 `perProgramDayStates` defaults to "planned" for past days; phone-3 Tue shows "Missed" badge plus two "· planned" lines. Contradiction. Also line 1043 `programName: slug.replace(...)` repeats the slug-derived name.
3. plan/page.tsx:897-944 3-col grid wraps "Log session →" to 3 lines at 393 pt (phone-3); shorter verb ("Log") fixes copy and layout together. Record Recent (CutCLogList.tsx ~83): fine, see D7.
