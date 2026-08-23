# Week recovery card — task checklist

- [x] Read design package turn t3 (screens 3a/3b) in full — not read
      during the original Day redesign pass
- [x] Researched existing plumbing: `skipDay`/`skipAndShiftWeek`/
      `skipWholeWeek`/`computeWeekShift` in useStore.ts, `MissedSessionPrompt`'s
      existing single-day check, `proposal-citations.ts`'s reserved
      `missed_session` kind, `dismissProposal`'s generic signature
- [x] Wrote plan, got user approval (see week-recovery-plan.md)
- [x] `src/lib/engine/missed-week.ts` — `detectMissedWeek()`, pure function
- [x] `src/lib/engine/missed-week.test.ts` — 5 unit tests (nothing missed →
      null; a real miss is flagged with correct counts; explicitly-skipped
      days excluded; today/future days never flagged; a logged run counts
      as not-missed). All passing.
- [x] `src/components/plan/WeekRecoveryCard.tsx` — the banner: dynamic
      headline, three option cards wired to the three existing store
      actions, reason chips, "what a skipped week does" info box
      (copy corrected from the mockup — dropped the "retest window
      slides" claim after checking `retest-evaluator.ts`/`select.ts` and
      confirming that's not actually true in this codebase; kept only
      what's verifiably true: TM doesn't change, history isn't
      backfilled), dismiss via `dismissProposal`.
- [x] Wired into `src/app/plan/page.tsx` — renders above the day-list,
      current week only, gated on the signal + not-already-dismissed
- [x] Removed `<MissedSessionPrompt>` from `TodaySession.tsx` (dashboard
      mode) + its now-dead `useRouter`/`router` plumbing + stale comment.
      Component file itself untouched/kept (just unused going forward).
- [x] tsc clean; eslint 71 problems full-repo (unchanged from before this
      change, confirmed via `git stash` diff — zero new issues); vitest
      167/167 (162 baseline + 5 new)
- [x] Live sanity check via the sandboxed e2e test account: `/plan` and
      `/` both render without error, no console errors, no crash. Did
      NOT manufacture a live "missed week" state to visually see the
      banner render (the test account's program only started today, so
      there's no natural past-day gap to trigger it, and forcing one via
      direct store manipulation was judged not worth the risk/time given
      the unit tests already cover the exact trigger scenarios directly).
      Known gap: the banner's actual rendered appearance (three option
      buttons, reason chips, info box) has been code-reviewed but not
      eyeballed live. Low risk — same JSX/Tailwind patterns already
      proven in the Day redesign's sheets/cards, but flagging honestly
      rather than claiming full visual verification.
- [ ] Commit + push — pending
- [ ] Confirm Cloudflare Pages auto-deploy picked it up
