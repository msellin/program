# 04 Copy lens (founder feedback 2026-10-29)

Rule used: a string earns its space if it changes what the user does in the next 10 seconds. Shot 3 has four blocks; two fail.

## A. Figure motion — CHANGE (vote)
Copy angle only: if the set-player figure animates, no caption needed. If it stays still, the label must say so is fine: "Watch demo" already carries motion and he called it "very good". Do not add "animated" captions. Fix the reading problem (SetView.tsx:534), not the wording.

## B. Today below the fold — CUT / CHANGE (vote CUT 2, CHANGE 2)
- "No check yet / Save a morning check to calibrate today's load." Heading is a status of nothing. Earns space only as a one-line row, not a bordered card. Rewrite: "Morning check · 1 min" with chevron, no heading. CHANGE.
- "First hip check +1 more": hip-only signal, collapsed, orange rail. Unclear what "First hip check" means (a nudge? a result?). Keep for hip program; label must be an action: "Hip check due +1 more". CHANGE.
- "2 tracks scheduled today. If it's too much, snooze one from Profile." + "Mobility runs alongside the rest without interference. Optional to sequence — do mobility after strength/skill when time permits." 34 words of reassurance; he can already see two cards above. The snooze hint is the only actionable part and Profile is a dead-end for a mid-day decision. CUT the banner (TodaySession.tsx:623); if kept, one line: "Two tracks today. Mobility fits after lifting." and drop the snooze sentence.
- "Heavy squat day — keep conditioning light / The plan doesn't schedule anything here..." (RunSlotCard.tsx:907). It is a card about a thing that is not happening, on a day he already did the heavy lift. Wrong place: belongs in Plan day detail. CUT from Today; if retained, 11 words: "Heavy squat day. Keep any cardio easy."
Also: "Today" appears as eyebrow in hero cards, check card and H1 area; drop repeats ("TODAY · ANTERIOR HIP REBUILD" under an H1 "Anterior Hip Rebuild" repeats the name twice).

## Hero subtitle "Cycles 3 + 4 (with 1RM test)"
Jargon plus parenthetical; "Cycles" is internal program vocabulary, and "1RM test" is a promise of a max attempt that clashes with a hip rebuild. Rewrite: "Weeks 7-10 · includes a strength test" (use the real week range), or drop entirely since the row below already says "Thu - front squat + unilateral". Overhead card: "Load + retest · Weeks 8-10 · week 10 of 10 · ends 31 Oct" repeats week three ways; rewrite "Week 10 of 10 · ends 31 Oct". "1 block · 4 exercises": "block" leaks; use "4 exercises".

## C. Session insights — BUILD, templated, no Haiku (vote BUILD)
Honest sentences from the log (each names its signal, so it satisfies "names its log signal"):
- "Front squat 5x5 at 80 kg, all rated Easy. Working max is 107.5 kg." (set data + rating)
- "Last logged 115 kg x 3, above the 107.5 working max. Update it?" (proposal, Accept/Ignore, not statement)
- "Mobility: 2 of 2 moves done, 3rd day this week." (counts)
- "1 morning check in the last 14 days." (only when asked for; neutral)
Never: "great session", causal claims about hip pain, comparisons to norms.
Haiku: not safe. Free text can assert a cause or a benefit that neither a study nor a log row backs, and it cannot be unit-tested against the data-integrity rules; it breaks "cites a study OR names its log signal". If wanted later: Haiku may only rephrase a templated sentence whose numbers are inserted by code and verified after generation (reject if any digit differs). Today the templates are cheaper and testable.
Ring/score equivalent: skip; a pie on a 2-move track is decoration. A per-track one-liner like above is the Terav version.

## D. Brief when all done — CUT the link, KEEP the emptiness (vote CUT)
"Log an extra session" (BriefView.tsx:462) beside "Finish session" is a competing CTA on a completed brief; it already lives in OffPlanSheet. Show instead a one-line state: "Both moves done. Finish to save." The empty space is fine; a finished state should be quiet.

## E. Back in guided set — BUILD (vote BUILD)
Copy: the back control re-opens the set as "ready" (FollowAlong.tsx:485), and "Skip set" is the only forward. Replace with "Back to current set" shown when viewing a finished one; label finished view "Set 2 · done · 0:30". Never label the only forward action "Skip" for a set that is merely not-current.

## Top 3
1. E: add a non-destructive return from a finished set ("Back to current set").
2. B: cut the two-tracks banner and the heavy-squat card from Today; shrink check card to a row.
3. C: ship templated, number-from-log insights (incl. 115x3 working-max proposal); no Haiku.
