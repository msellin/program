| ID | Verdict | Relevance | Evidence (file:line or commit) | Note |
|---|---|---|---|---|
| M-036 | PARTIAL | ADS | next-app/src/components/workout/RedRestCard.tsx:24-31 | Link now 44px; no next-session or Plan link; void unchecked |
| M-037 | UNKNOWN | ADS | "WEEK 1 OF" absent from src; day-1 Today not traced | Needs a live day-1 render to judge the duplicated meters |
| M-038 | UNKNOWN | ADS | no zero-delta render found in src/components/session/done | Delta colouring not traced; needs screenshot |
| M-039 | UNKNOWN | ADS | grep of teal classes in plan and workout found nothing | Accent leak is visual; needs screenshot |
| M-040 | PARTIAL | ADS | next-app/src/components/follow-along/FollowAlong.tsx:561; plan/WeekRecoveryCard.tsx:10 | "This hurts" and "Pain or tweak" gone; "Something hurts" remains |
| M-041 | UNKNOWN | ADS | not located in src | Chip truncation is a render question; no code change seen |
| M-042 | PARTIAL | ADS | next-app/src/components/follow-along/FollowAlong.tsx:40 | Visible "BOTH" badge label remains; OPTIONAL and TOP SET not found |
| M-043 | UNKNOWN | ADS | rest-day and future/past session header not located | Needs render of rest and past session screens |
| M-044 | PARTIAL | ADS | next-app/src/components/session/OverflowSheet.tsx:104; VideoModal.tsx:92 | Watch row hidden without video; fallback modal still shows "No embedded demo" |
| M-045 | PARTIAL | ADS | next-app/src/components/workout/RunSlotCard.tsx:687 | GPX button only in run slot; duplicate card not checked |
| M-046 | PARTIAL | ADS | next-app/src/components/offplan/OffPlanSession.tsx:103-151 | Now library-wide, not plan-only; collapse and grouping not found |
| M-047 | OPEN | ADS | next-app/src/components/session/OverflowSheet.tsx:82 | Still builds `${rowCount + 1}th`, producing "3th" |
| M-048 | PARTIAL | ADS | next-app/src/components/session/RestTakeover.tsx:29-34 | Five-step scale documented; 11px chip labels unchecked |
| M-049 | OPEN | TRUST | next-app/src/components/session/HurtSheet.tsx:93, 127 | "Stop session" still bg-amber primary; stopped-state not traced |
| M-050 | UNKNOWN | ADS | next-app/src/components/session/SetView.tsx (not read) | Hold-as-reps not traced; captures stale per list |
| M-051 | UNKNOWN | ADS | intake step flow not traced; "neck numbness" absent from src | Step structure needs the intake render to judge |
| M-052 | PARTIAL | ADS | next-app/src/app/programs/[slug]/intake/IntakeClient.tsx:1323 | Checkbox label 44px; other control types not checked |
| M-053 | OPEN | ADS | next-app/public/data/exercises.json; programs/muscle-up.json; programs/first-strict-pullup.json | "I-Y-T", "scap CARs", "scapulae", "closed-chain" still in shipped JSON |
| M-054 | UNKNOWN | ADS | IntakeClient.tsx not traced for steps 12-15 Next gating | Needs intake render |
| M-055 | PARTIAL | ADS | commits 2b1ff58 and 631ce62 (Plan tab rework) | Rows and header changed; header height not re-measured |
| M-056 | OPEN | LATER | next-app/src/app/plan/page.tsx row markup: no icon or minutes found | Visual gap; needs assets or design |
| M-057 | PARTIAL | ADS | next-app/src/app/plan/page.tsx:668-671 | Unskip is now 44px underlined text link; row labels not rechecked |
| M-058 | UNKNOWN | ADS | next-app/src/app/plan/page.tsx:694 only gates opens | Move-target list not located |
| M-059 | PARTIAL | ADS | next-app/src/app/plan/page.tsx:337 | Maps to "Mixed practice"; interleaved paragraph string gone |
| M-060 | PARTIAL | ADS | commit 425dd10 (N left, closed-week count) | "1 green" string gone; count fix unverified |
| M-061 | PARTIAL | ADS | next-app/src/components/record/_CutCRechartsInner.tsx:102; CutCProgramCurveCard.tsx:44; commit 425dd10 | Still shows 1dp; "Loading chart…" loader remains |
| M-062 | PARTIAL | ADS | next-app/src/components/record/CutCActivityHeatmap.tsx:157; commit d5c1749 | Aria summary added; legend not found |
| M-063 | PARTIAL | ADS | next-app/src/components/record/CutCLatestRetestTile.tsx:123 | Delta wording reworked; retest dot labels unchecked |
| M-064 | PARTIAL | TRUST | next-app/src/app/report/page.tsx:672-674; overhead-mobility.json (cm_below_knee) | Load progression section renders unconditionally; raw key in data |
| M-065 | PARTIAL | TRUST | "sim:" absent from app code; report/page.tsx:636 | "Provocateur incidents" title remains, hip program only |
| M-066 | PARTIAL | ADS | next-app/src/app/programs/page.tsx:554-569 | Clamp and nowrap duration in place; CITED pill layout unchecked |
| M-067 | DONE | ADS | strings absent from next-app/src, landing/src, public/data | Quoted copy no longer present in shipped code or data |
| M-068 | OPEN | ADS | next-app/src/app/programs/page.tsx:354 | "More programs land as they're authored" still rendered |
| M-069 | OPEN | TRUST | next-app/public/data/programs/anterior-hip-rebuild.json:11, 55 | birthday_2027 and pre_birthday still shipped and fetchable |
| M-070 | PARTIAL | LATER | next-app/src/app/report/page.tsx:763; ExerciseDetailsSheet.tsx:168 | Orthopaedist line gated to hip; "Provocateur" label remains |
| M-071 | OPEN | LATER | next-app/public/data/programs/muscle-up.json:656; overhead pressing in muscle-up and first-strict-pullup JSON | Coming-soon programs; ring-dip ladder and contraindication still in data |
| M-072 | PARTIAL | TRUST | next-app/src/app/profile/page.tsx:117, 372 | Sign-out present; email still used as display name; FOUNDATION absent |
| M-073 | OPEN | LATER | next-app/src/app/settings/page.tsx:111-113, 51 | "Light theme coming soon" row still rendered; "Accept confirm" remains |
| M-074 | PARTIAL | ADS | next-app/src/app/check/page.tsx:274, 431 | End-of-page padding done; mid-scroll sticky bar and chip size unverified |
| M-075 | OPEN | ADS | next-app/src/app/check/page.tsx:87; components/workout/EngineReadsNotesHint.tsx:30 | "Cooked" preset and "The engine reads these" still present |
| M-076 | PARTIAL | ADS | next-app/src/app/check/hip/page.tsx:46 | Non-hip users get null render; no "no hip check" note |
| M-077 | OPEN | LATER | next-app/src/app/not-found.tsx:25 | Still says "Today became Day, Week became Plan" |
| M-078 | PARTIAL | ADS | next-app/src/app/plan/page.tsx:316, 347 | Disabled controls still opacity-30; nav label size unchecked |
| M-079 | PARTIAL | TRUST | next-app/src/app/plan/page.tsx:867 | line-strong token in use; contrast values not re-measured |
| M-080 | DONE | ADS | commit 7afcd3f | Bottom-nav padding class now generated; guard test added |
| M-081 | OPEN | LATER | next-app/src/components/session/shared/StatusCards.tsx:469; HurtSheet.tsx:134 | "Keep going 4 more weeks" streak tone remains |
| M-082 | PARTIAL | LATER | next-app/src/app/guide/page.tsx:34 | "bottom-nav labs" typo gone; glossary length unchecked |
| M-083 | PARTIAL | TRUST | next-app/src/components/session/TodaySession.tsx:573; RunSlotCard.tsx:631 | "Shea & Morgan 1979" still visible; "WOD name" placeholder remains |
| M-084 | PARTIAL | ADS | next-app/src/components/workout/HeroStateCard.tsx:47 | Quoted copy gone; "Progress load" line remains |
| M-085 | PARTIAL | LATER | next-app/src/components/session/BriefView.tsx:469 | Extra-session row exists; position above Start and video line unchecked |
| M-086 | OPEN | LATER | next-app/src/app/programs/[slug]/intake/IntakeClient.tsx:592 | "Back to answers" link still present; colour and fade unchecked |
| M-087 | PARTIAL | LATER | next-app/src/components/session/done/DoneSections.tsx:71-77 | NextSessionCard added; no streak or summary |
| M-088 | PARTIAL | LATER | next-app/src/app/programs/[slug]/ProgramPreviewClient.tsx:542-546 | Tappable is intentional; description contrast unchecked |
| M-089 | OPEN | LATER | next-app/src/app/account/page.tsx:107; profile/page.tsx:129 | Lowercase "joined {date}" remains; H1 audit not done |
| M-090 | PARTIAL | LATER | "MULTI-TIER" absent from landing/src | Eyebrow gone; hyphen ranges unchecked |

Summary: 55 rows. DONE 2 (M-067, M-080). PARTIAL 31. OPEN 13. UNKNOWN 9. OWNER 0. SUPERSEDED 0.
Surprising: the copy and feedback rounds removed most quoted strings, but the shipped JSON still carries the intake and coming-soon copy (M-053, M-069, M-071).
Biggest open safety/trust items: M-049 (amber Stop session), M-069 (personal milestones served), M-075 (Cooked preset).
Relevance: the ADS items mostly sit in the session and intake flow; PAY and billing items are not in this set.
UNKNOWN items (9) need a live render, not code; none is a blocker for the ad path that code can settle.
