# Copy clarity (microcopy) - Plan tab rescore (live)
Score now: 6/10 (was 5). Still short of 10: the tab says "Missed" in three places while the rows say "Not logged", and some labels are truncated or generic.

Did each shipped change land?
- Accordion: yes. One open day shows its summary in full; collapsed rows truncate with "…", which is fine.
- One action: yes, but "Open day" on today's row (page.tsx ~872) is vague next to Log / Edit log / Preview, and it sits inside the day that is already open.
- "⋯" sheet: yes. Title is the date, items are Move… / Skip / Cancel, all short. The aria-label "More for <day>" is good.
- Hidden verbs: yes. The Skip confirm body ("The engine reads that as an intentional off-day, not a missed one.") is the best string on the tab.
- Track rows: partly. The row text clips to "Anterior hip + strength rebuild · No…" at 393px (two-track-393-02-open-1), so the state word is cut off.
- Not logged: it landed in the track rows, but the day header still says "Missed" (amber), and the banner says "2 of 3 missed this week".

Top 3 remaining findings
1. Tone and drift: the banner "2 of 3 missed this week" and the amber "Missed" badge (two-track-393-01-load; one-track-393-01-load) judge the user, while the rows say "Not logged". Use one neutral term: "Not logged". Banner rewrite: "2 of 3 days not logged". The skip dialog already says missed is the wrong frame.
2. "Fix the week ›" doesn't say what it does, and "Fix" implies the user broke something. Rewrite: "Adjust week ›" or "Catch up ›". Check which one matches the destination.
3. The track-row state is clipped ("· No…"), and "Open day" / "Log" don't say what they open. Put the state on its own line or shorten the track name. Rename "Open day" to "Start session" for today and keep "Log" for past days.
Minor: "1 activity" in green on Tue/Thu (two-track-393-02-open-1) is unexplained. Say "1 off-plan activity" or "Run logged".
