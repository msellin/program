# 03 Action points (unticked) + panel P-01..P-43 (verified 2026-10-30)

Rows ticked ✓ in ACTION-POINTS.md and not listed here were not re-checked. Panel IDs prefixed PANEL-.
"Commit" evidence = the commit named on the register line exists in `git log` on main; file refs read in code.

| ID | Verdict | Relevance | Evidence (file:line or commit) | Note ≤15 words |
|---|---|---|---|---|
| P-08 | UNKNOWN | TRUST | `lib/engine/` has no hip-specific split file; not traced | hip triggers in shared deriveState not confirmed moved |
| P-09 | OPEN | TRUST | `lib/data-loader.ts:11,40` DEFAULT_PROGRAM_SLUG = hip; `app/check/page.tsx:142` LEGACY_REGIONS | both fallbacks still present |
| P-10 | PARTIAL | TRUST | `app/guide/page.tsx:160` anterior-hip mention remains | guide case study still names hip program |
| SF-03 | PARTIAL | ADS | commit 362d271 (fallback only) | one-tap "how do you feel" not built; blocker dropped |
| SF-06 | DONE | TRUST | register G-14 ✓ 2026-10-29 captures in screens/gaps/B-red-day | red-day captures exist; CSM red state captured |
| A-UX-04 | PARTIAL | ADS | commit 4308e73; `workout/ProposalCard.tsx:170` "Not now" | names done; citations-behind-Why? mostly done via panel P-12 |
| A-UX-05 | PARTIAL | ADS | commit e1ecbf6; `app/plan/page.tsx:254,431,507` | status/Unskip done; skip-toast count unchanged |
| A-UX-09 | PARTIAL | LATER | `components/nav/BottomNav.tsx:34-39` tabs Today/Plan/Record/Profile; `AppShell.tsx:179-183` gear still; `app/account`,`app/settings` still exist | tabs shipped; gear and Account/Settings not folded into Profile |
| A-UX-10 | OPEN | ADS | `app/reset-password/page.tsx:23-36` no timeout or expired state | waits forever on tokenless visit |
| A-UX-11 | UNKNOWN | LATER | not traced; panel P-05 commit 3fcbe5b reads one source for retest card | likely largely fixed by P-05 |
| A-UX-12 | UNKNOWN | LATER | not traced (rest rail) | no evidence either way |
| A-UX-16 | PARTIAL | LATER | `app/feedback/page.tsx:62-65,122` visible error; `functions/api/feedback.ts` no rate limit | error shown; no rate limit |
| A-UX-17 | UNKNOWN | LATER | not traced | off-plan duplicates not checked |
| A-UX-18 | OPEN | LATER | `public/data/programs/muscle-up.json:656` "Ring dip ladder" unchanged | title not conditional on exclusion |
| A-UX-19 | PARTIAL | LATER | `BottomNav.tsx:52` inner max-w-[760px]; programs carousel `app/programs/page.tsx:231` | nav content capped; bar still full-width; carousel clip unchecked |
| A-UX-20 | UNKNOWN | ADS | `programs/[slug]/intake/IntakeClient.tsx:776` wizard; question cap not traced | P-25 reordered, split not confirmed |
| SG-07 | OWNER | PAY | register: A (+lawyer); `app/legal` has no paid-terms commit found | needs lawyer; paid terms not written |
| L-09 | OPEN | TRUST | register open; no VERIFIED-badge commit | verifier pass on 125 citations not done |
| L-10 | OWNER | LATER | register O | named reviewer needs a human |
| L-11 | OWNER | PAY | register O | beta quote with consent |
| L-12 | OPEN | ADS | register; landing uses coded mockups (`TodayMockup`) | re-shoot of real screens not done |
| M-05 | OWNER | ADS | register O | Meta/Google accounts, spend |
| M-06 | OWNER | ADS | depends on M-05 | read test after 3-5 days |
| M-07 | OPEN | TRUST | no consent banner/Consent Mode in `landing/src` or `next-app/src` | needed before conversion tags |
| M-08 | OPEN | LATER | marketing-channels.md only | ideas, after M-06 |
| O-02 | OWNER | ADS | register O | real phone sign-up test |
| O-04 | OPEN | TRUST | no Sentry in `next-app/functions`; no rate limits seen | functions not instrumented |
| O-05 | OWNER | LATER | register O | revoke unused Resend key |
| O-06 | OPEN | ADS | register; stranger first run spec only in launch-gaps.spec (X-04) | signed-out to day-1 spec exists partly |
| B-01 | OWNER | PAY | register O | Stripe account, Stripe Tax |
| B-02 | OPEN | PAY | no stripe code in `next-app/functions`; only privacy text | products, portal, webhook absent |
| B-03 | OPEN | PAY | no `entitlements` in `next-app/src`; commit d38cc3f owner defers until M-06 read | deferred by owner decision |
| B-04 | OPEN | PAY | depends on B-03 | upgrade moments absent |
| B-05 | OWNER | PAY | register O | accountant VAT/OSS |
| R-01 | PARTIAL | PAY | panel P-29 `session/shared/StatusCards.tsx:469,479` "Keep going", "Other options" | end-of-program offer exists; not a Pro hook |
| R-02 | OPEN | LATER | 16 files still use UTC date slices (`grep toISOString`) | engine gaps unaddressed |
| R-03 | PARTIAL | TRUST | `handstand-walk.json:1828,2152` Ferrari swapped to Yiou (note only); Das not checked | Ferrari drift fixed; Das unverified |
| R-04 | OPEN | LATER | register L | no HYROX program |
| R-05 | OPEN | LATER | register L | no video coach |
| R-06 | OPEN | LATER | `README.md` still "Personal hip / lumbosacral tracker"; saas-launch/tasks.md not bannered | stale docs unbannered |
| R-07 | OWNER | PAY | register O | lawyer review |
| G-12 | UNKNOWN | TRUST | not traced in `components/check` | scale anchors vs gate unverified |
| G-13 | UNKNOWN | LATER | not traced | Record sheet clipping, "/" redirect |
| PANEL-P-01 | DONE | TRUST | 9bc012c, ba992ea (session page red card) | red Today and session page one rest card |
| PANEL-P-02 | DONE | TRUST | 9bc012c, ba992ea | no log-anyway on red |
| PANEL-P-03 | DONE | TRUST | 9bc012c; not visually captured | load-adjust hidden while severe |
| PANEL-P-04 | DONE | ADS | fc85d44 | Stopped and Done screens not captured |
| PANEL-P-05 | DONE | ADS | 3fcbe5b | retest card hides under 2 readings |
| PANEL-P-06 | DONE | ADS | 5aade6f, ba992ea | one progress selector |
| PANEL-P-07 | DONE | TRUST | 45e5430, ba992ea | profile maxes and chips fixed |
| PANEL-P-08 | DONE | TRUST | cad8b74; `ProgramPreviewClient.tsx:293` still renders "Reviewed by" when human named | agent reviewer hidden |
| PANEL-P-09 | DONE | ADS | df23eec, 5aade6f, ba992ea; `proposals/select.ts:282` needs retest | no tier jargon day 1 |
| PANEL-P-10 | DONE | ADS | 9bc012c | rest-day next-session line |
| PANEL-P-11 | DONE | ADS | 5aade6f | plan card collapsed |
| PANEL-P-12 | DONE | TRUST | 5aade6f; recheck PASS | citations behind Why? |
| PANEL-P-13 | DONE | ADS | 9bc012c | suggestion copy softened |
| PANEL-P-14 | DONE | ADS | 5aade6f; recheck PASS | check copy rewrite |
| PANEL-P-15 | DONE | LATER | 5aade6f; recheck PASS | radios, selected state |
| PANEL-P-16 | DONE | ADS | 5aade6f; grep finds no "Interleaved consolidation"/"Post-acquisition" in src | Plan fixes; Move sheet uncaptured |
| PANEL-P-17 | DONE | ADS | fc85d44, ba992ea; `FollowAlong.tsx:561` | overlap fixed; placement not re-captured |
| PANEL-P-18 | PARTIAL | ADS | fc85d44; `BriefView.tsx:476` sticky Start; recheck FAIL on prose cards | sticky CTA done; prose collapse unconfirmed |
| PANEL-P-19 | DONE | LATER | fc85d44; no text-[9px]/[10px] in session or follow-along | min text size |
| PANEL-P-20 | DONE | LATER | fc85d44 | sheet a11y, uncaptured |
| PANEL-P-21 | DONE | ADS | fc85d44; "Pain or tweak" absent in src | copy renamed |
| PANEL-P-22 | DONE | ADS | fc85d44; "full tutorial" absent in src | cue line replaces placeholder |
| PANEL-P-23 | SUPERSEDED | LATER | lane C: no FAB in AppShell | feedback moved to Profile |
| PANEL-P-24 | DONE | ADS | 3fcbe5b | Record sheet to inline line |
| PANEL-P-25 | DONE | ADS | df23eec, ba992ea | ability questions first |
| PANEL-P-26 | DONE | ADS | cad8b74; recheck PASS | carousel peek |
| PANEL-P-27 | PARTIAL | LATER | 6ee8648, ba992ea; `offplan/OffPlanSession.tsx:87` "Accessory work" remains | nav label Profile; Accessory work copy left |
| PANEL-P-28 | PARTIAL | LATER | 6ee8648; `OffPlanSession.tsx:253` "Back to Day" kept | Profile clearance only |
| PANEL-P-29 | DONE | PAY | 5aade6f; `StatusCards.tsx:469,479` | one primary action |
| PANEL-P-30 | OPEN | LATER | listed LATER; no ingest feature | WOD ingest |
| PANEL-P-31 | OPEN | ADS | LATER; intake still one wizard | shorter intake for trained |
| PANEL-P-32 | UNKNOWN | LATER | not traced | first-run screen emptiness |
| PANEL-P-33 | UNKNOWN | LATER | not traced | nav active weight |
| PANEL-P-34 | UNKNOWN | LATER | not traced | Record sheet handle |
| PANEL-P-35 | UNKNOWN | LATER | not traced | red banner distinct from amber |
| PANEL-P-36 | UNKNOWN | LATER | not traced | non-negotiable banner |
| PANEL-P-37 | UNKNOWN | LATER | not traced | stop-session confirm etc. |
| PANEL-P-38 | UNKNOWN | LATER | not traced | skip-confirm styling |
| PANEL-P-39 | UNKNOWN | LATER | D-03 ui/Card, D-01 Button shipped | second accent unconfirmed |
| PANEL-P-40 | UNKNOWN | LATER | not traced | Record log rows |
| PANEL-P-41 | UNKNOWN | LATER | 6e89b95 touched delete copy (A-UX-15) | copy partly changed |
| PANEL-P-42 | UNKNOWN | LATER | not traced | a11y polish list |
| PANEL-P-43 | UNKNOWN | LATER | not traced | eyebrow spacing |
| PANEL-RECHECK-new-4 | OPEN | TRUST | "Shoulder 8/10" vs "above 5/10" unmatched, no fix commit | 15768f3 ticks others only |
| PANEL-RECHECK-new-6 | DONE | LATER | "Post-acquisition" absent from src | jargon gone |
| PANEL-RECHECK-new-8 | UNKNOWN | ADS | not traced | pull-up user offered deadlifts off-plan |

## Summary
- Rows: 44 register items + 43 panel items + 3 recheck extras. Most panel P-01..P-29 are DONE in code (lane commits 9bc012c, 5aade6f, fc85d44, cad8b74, df23eec, 3fcbe5b, 45e5430, ba992ea).
- Partial panel: P-18 (prose cards), P-27 ("Accessory work"), P-28 ("Back to Day").
- A-UX-09 tabs are shipped (Today/Plan/Record/Profile), but the header gear and separate Account/Settings routes remain.
- Real open blockers on the paid path: B-02/B-03/B-04 billing absent (owner deferred B-03 until M-06 read); SG-07 paid terms; M-07 consent.
- Open ads-path items: A-UX-10 (reset-password dead wait), L-12 (real screens), M-05/O-02 owner-only.
- P-09/R-06 unmitigated hip fallbacks and stale README remain; LATER P-32..P-43 mostly UNKNOWN (not traced).
