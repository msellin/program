# Two-track athlete — Plan tab
Score now: 5/10 (Plan, opened-days state). What a 10 needs: one day open and it is today; one obvious "Log" for the day that doesn't make me pick between two tracks; a logged day looks finished (no Move/Skip); "Missed" days say which track is missed; nothing wraps.
Record Recent score: 7/10. I do open it, for last week's days and the "2 notes" counts. Plan only shows this week.
D1 APPROVE — I open Tue to log it and then have to scroll past Mon/Wed all open (phone-3). One at a time with today open is what I expect. Let me re-tap to close it.
D2 APPROVE — "Log session →" wrapping to three lines (phone-1/3) looks broken. One button, one verb. But on a two-track past day it must not silently mean hip only; see D5.
D3 AMEND — pick (a), a "⋯" on the header. I'd never use Move/Skip daily, so they shouldn't be three big buttons every time. Keep Move one tap away since life gets in the way. Skip can go in the sheet.
D4 APPROVE — Mon shows "1 logged" with a green check and still offers Skip (phone-3). I'd never skip a day I already logged, and it's scary to sit next to Log. Move on a missed day stays.
D5 AMEND — tappable track rows, no sheet. Tue says "Anterior Hip Rebuild · planned" and "Overhead Mobility · planned", so I tap the one I did. Today the hip log hides behind a vague "Log session" and mobility has its own big button, which is lopsided. Row shows "Not logged ›" / "Done ✓"; the same tap opens the backfill.
D6 APPROVE — a Missed day listing both tracks as "planned" contradicts the "Missed" tag above it. "Not logged" is plain and not guilt-trippy.
D7 (a) keep — Recent shows the Wed and Mon I did, plus last week. If it dropped the current week it would feel half-empty. Plan = ahead, Record = looking back. Maybe fine to tidy later.
D8 KEEP Sentence case — I read icon plus word, not caps. Uppercase makes no difference to me. The caps in the Record legend ("AMBER CHECK") are the louder thing.
D9 (mine) Mon shows "✓ back squat 110 kg × 7" but both tracks still say "planned" even though I logged it. Per-track state should show done for the track I logged.
Top 3 findings
1. Logged day still shows Log overhead mobility / Log session / Move / Skip — plan/page.tsx ~873-944 (WeekDayActions).
2. Past-day track state says "planned" under a Missed tag — plan/page.tsx:1018-1047.
3. 3-col grid wraps "Log session →" at 393 pt, and the hip log is the odd one out vs mobility's full-width button — plan/page.tsx:873-944.
