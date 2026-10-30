# Redesign P2: tasks

<!-- SUPERSEDED-BY: dev/active/ROADMAP.md -->
> **Not maintained since 2026-10-30.** The one task list is `dev/active/ROADMAP.md`. Every open item here was
> checked against the code (`dev/active/roadmap-reconcile/`) and the live ones moved there. Statuses below are history.

- [x] L1 Today hero first; one check prompt; day-1 hero; plain proposal "because" copy
- [x] L2 Brief follow-along as compact rows with figures; short titles; content clears footer
- [x] L3 Sticky bars never cover content at first view; 44px text links; line-strong chip borders
- [x] L4 Quick start: Continue hint, no mid-word hyphenation, shorter safety questions
- [x] L5 One duration source; plan and program page agree with the brief
- [x] L6 Harness: session-done capture, activity selector, rest-day check
- [x] Lead: wire duration, verify, walkthroughs, deploy
- [x] Re-shoot + rescore (1–10) (d92e032)

## Found during P2 (2026-10-28): guided sessions could not be finished
The new session-done capture could not reach the done screen. Three defects, all live before P2:
- [x] Player layout: under ~800px of height the "Something hurts" row covered −1 / +1 / "Log all" (iPhone SE, Safari
      with toolbars). The middle column now scrolls (`justify-center-safe`), and the ring is 124px at ≤700px.
- [x] "Set done" with an untouched counter logged nothing (`completeSet(0)`). It now logs the prescribed reps; Skip
      remains the way to log nothing.
- [x] All-guided days: Start always reopened block 1, and "Finish session" needed a set-flow hero, so it never showed.
      BriefView now resumes the first unfinished guided block, shows "Continue session" and "Finish session" once
      anything is logged, and makes Finish the only action when every guided block is done.
Details: `followalong-log-bug.md`. Reviewer notes on L5 (consents) and L1 ("so today is lighter" claimed an
unaccepted change) were corrected by the lead; frozen-shoulder question keeps "over weeks".
