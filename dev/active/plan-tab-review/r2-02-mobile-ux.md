# Mobile UX — Plan tab rescore (live)
Score now: 7/10 (was 4). What still keeps it from a 10: the "⋯" trigger and day header still sit in the top third, the track rows truncate at 375, and the ⋯ sheet floats instead of docking to the bottom edge.
Did each shipped change land?
- Accordion: yes. One day open (page.tsx:69, 562), and the load shot at 375 shows today plus a short list, with no wall of open days.
- One action: yes. WeekDayActions is a single 44px-min button (page.tsx:847).
- "⋯" sheet: yes. The trigger is w-11 h-11 (page.tsx:943) and the rows are min-h-[48px] (934). Sheet shots show it in the bottom third, reachable by thumb, with Cancel last. It is a floating card with 12px side margins, not an edge-docked sheet.
- Hidden verbs: yes. Move/Skip are only in the sheet, so the content column is calm. The "⋯" itself is at y~283-340, in the ouch zone (about the top 35%). That is acceptable for a rare action, though the open-day header is the highest-traffic spot.
- Track rows: yes. Link rows are min-h-[44px] (page.tsx:681), with a chevron and a clear separation between rows (two-track-375-02-open-1).
- Not logged: yes. Overhead Mobility reads "Not logged" in muted text. It is subtle but consistent with Missed (amber).
Top 3 remaining findings
1. two-track-375-02-open-1: the hip track label truncates ("Anterior hip + strength rebuild · …") and hides the state, which is the reason for the row. Let the label wrap to two lines, or put the state on its own line (page.tsx:681).
2. two-track-375-03-menu / 393-03-menu: the sheet floats about 12px above the viewport bottom and the dimmed nav can be seen behind it. Dock it flush with pb-[env(safe-area-inset-bottom)], and add a scrim tap-to-close (confirm it exists) and a larger top radius so it reads as a sheet.
3. Collapsed day headers (two-track-393-02-open-0): the chevron at the far right is a 12px glyph, and the header is the only tap target. The py-4 row is about 64px so the hit area is fine, but the trigger and the "⋯" are adjacent in the open row. Check there is at least 8px between them (page.tsx:590 vs 943, -mr-2 pulls "⋯" closer). Also hover: only at lines 316, 347, 654, 681, 934, 943, with no active: twin, so touch gets no pressed state and iOS shows sticky hover.
Cross-check at 375: no horizontal overflow, and the fixed nav does not cover today's row on load. Content clips only through truncation.
