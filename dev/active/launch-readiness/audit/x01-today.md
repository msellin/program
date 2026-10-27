# X01 Today screen audit (mobile 01-day, 6 personas, 2026-10-27)
BROKEN · persona-handstand/mobile/01-day.png · ProposalCard.tsx:13 (sticky verb bar) · sticky "ADVANCE TO TIER B / IGNORE" bar + bottom nav stack over the shoulder-pain card, hiding the Rest-day/log content [HACKATHON]
BROKEN · persona-erratic/mobile/01-day.png · TodaySession.tsx (extra-session card) · "Row · z2" logged-run chip and "Log session" row sit under/behind the bottom nav; card bottom clipped [HACKATHON]
CONFUSING · persona-pullup, -handstand, -concurrent, -recover · StatusCards.tsx:103 + HeroStateCard.tsx:47 · green "WORKOUT READY" pill shown above "Rest day." card; state contradicts itself [HACKATHON]
CONFUSING · persona-erratic · persona-concurrent mobile/01-day.png · "CHECK FIRST" pill above a "Rest day" card with no session to check [HACKATHON]
CONFUSING · persona-multitrack/mobile/01-day.png · TodaySession header "WEEK 1 OF 1 · ENDS 30 OCT" vs body "week 4 of 4" and "Weeks 4-7" [HACKATHON]
CONFUSING · persona-pullup/mobile/01-day.png · TodaySession.tsx:418-427 vs header week · body says "Program week 7" while header says "WEEK 3 OF 4" [HACKATHON]
CONFUSING · all personas · TodaySession.tsx:427 · "Shea & Morgan 1979", "order shuffled by the seed", "Source: Rhea et al. 2003" are research jargon on the first screen of a first-time user [BEFORE-SCALE]
CONFUSING · persona-erratic/mobile/01-day.png · SignalsStrip.tsx:64 · amber "Not feeling 100% · ×0.95 applied +1 more" banner has no clear action; "×0.95" is opaque [BEFORE-SCALE]
CONFUSING · persona-handstand/mobile/01-day.png · ProposalCard.tsx:249 · "TIER GATE CLEARED" + "Because: ... Tier B — Wall handstand established's threshold" reads as a rank-up, not a choice [BEFORE-SCALE]
CONFUSING · persona-recover, -concurrent · TodaySession.tsx (block card) · program name repeated 3x (eyebrow, H1, progress label) and "Cycles 3 + 4 (with 1RM test)" jargon [BEFORE-SCALE]
CONFUSING · persona-multitrack/mobile/01-day.png · RunSlotCard.tsx:85-87 · "Log extra session →" CTA is an arrow-title but reads like a link; "Nothing here changes the plan" is ambiguous [LATER]
UGLY · persona-recover/mobile/01-day.png · TodaySession.tsx · two competing primary cards (blue-accent "1 block" and green "Primary conditioning day") with different card styles [BEFORE-SCALE]
UGLY · persona-handstand/mobile/01-day.png · empty gap between tier card and status pill (~y 440-600) [POLISH]
UGLY · persona-multitrack/mobile/01-day.png · "Open session" CTA with no progress row, unlike other personas; inconsistent header block [BEFORE-SCALE]
POLISH · all personas · duplicated "Cross-modal work, walks..." paragraph on every rest day [LATER]
Good:
1. Single hero title per screen with a clear mono eyebrow and a progress bar (pullup, erratic) gives orientation fast.
2. "Log session / Import GPX" actions are always visible in the same place, so the escape hatch is discoverable.
3. Rest-day copy plainly says what is scheduled and what to do if you trained anyway.
Not checked: tap behaviour, real-device safe-area, dark/light parity, the 375px SE viewport, desktop 01-day.png, and whether sticky bars are obscuring content at 393px in-browser (inferred from screenshots only).
