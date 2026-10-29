# R23 rescore - design lead - Plan + Profile
Plan 6.5/10 (was 6). Profile 7.5/10 (was 6). Evidence: shots/r23/plan.png, plan-row-open.png, profile.png, profile-full.png.
- [H] Plan: missed-week card is ~75% of the first screen and pushes the 7 day rows below the fold; the header fix is wasted when it shows. -> collapse to a one-line banner "Missed 2 of 3 - Choose" that expands to the 3 options; drop the "What a skipped week does" block into an info line. (app/plan/page.tsx)
- [H] Plan: week header still says "This week" and its subtitle wraps to 2 lines inside a bordered box. -> "26 Oct - 1 Nov" + one-line "Cycles 3-4 · strength test"; "This week" only as a small chip when current.
- [H] Plan: dot states unreadable. Mon (missed, ring) vs Tue/Wed/Fri (filled grey) vs Thu (green) have no key and the missed days look "planned". -> missed = struck/amber dot, done = filled green, planned = ring; today = row tint only.
- [M] Plan: row titles repeat the day ("Mon - heavy squat day" under "Mon") and open row shows an orphan "None. This is the second squat day..." line. -> strip the day prefix from titles; label that line "Note".
- [M] Profile: "Update my answers / End this program" still inline under the program row; End is a destructive verb 1 tap away. -> move both into the program sheet behind the chevron (profile/page.tsx).
- [L] Profile: amber warning icons on 3 maxes have no explanation until expanded. -> add a one-word reason ("Stale") or drop the icon.
No [B]: a one-program new user sees no empty maxes shell, calendar form or intake-pending.
