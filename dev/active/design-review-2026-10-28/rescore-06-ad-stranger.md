# Rescore 06 Ad stranger (after P0, e6f1139). Evidence: A-first-run fresh captures only (375px)

Scores (new, round-1 doubled in brackets): text density 6 (6) | text size 8 (8) | visual richness 5 (4) | consistency 8 (8)

## Walk, one gut line per screen
- 01 landing: still strong. Clear promise, self-qualifying bullets, one CTA. Unchanged, fine.
- 02 sign-up: still three checkboxes before Google works, plus bot check. I'd still wince, but I'd tick and go.
- 03 first screen after sign-in: "Pick your focus. Browse programs" on an empty screen. I just chose pull-up; the ad intent is lost again.
- 04 programs: better, 3 cards up top, but filters, sort and repeated category lists below for 3 programs. No pull-up figure on the cards in the capture.
- 05 program detail: big win. Stick-figure hang, title, 8 wks / 2-5 days / 15-30 min tiles, Start free all in the first viewport. I get it in 5 seconds.
- 06-intake-01 (Level): fast, 4 plain options, one tap plus Continue. Subtext reads like test criteria, but fine.
- 06-intake-02 (Safety): one screen, "None of these" at top. Painless. Long if I don't tap it (5 Q's), but one tap fixes that.
- 06-intake-03 (Your plan): ladder with "you are here", weeks/minutes/days, expected week-8 outcome. Two more consent boxes after the three at sign-up: annoying but it's the last gate.
- 07 Today day 1: tour card gone. "Start your first session" is the first button. Good. "Find your exact level / Start tests" card sits below, optional.
- 08 session: header no longer clipped. But "How to run this" is still three unlabeled fragments, and the figures/media are below the fold behind the sticky bar.
- 09 session bottom: sticky Start session is clear.

## Would I...
- finish setup? Yes. 3 taps plus 2 consents, about 30 seconds. Round 1 was no.
- do session 1? Yes, if I land on Start. Guided player was already good.
- come back tomorrow? Maybe. Still no visible payoff or reminder after session 1 (not in these captures, unchanged from round 1).

## What improved
- 16-step intake to 3 screens; physical tests are now optional and out of the way.
- Program page has a hero figure, stat tiles and a CTA in the first viewport.
- Day 1 leads with one action; tour card removed; session header overflow fixed.

## Still wrong
- [B] 02 sign-up / 03 post-sign-in: `next=/programs/first-strict-pullup` still lost, lands on generic "Pick your focus" and I must browse again. Route authenticated sign-in to `next` (or straight to that program's quick start).
- [H] 02 sign-up: three checkboxes gate Google; plus two more consents at step 3. Collapse to one "I agree" line at sign-up and drop the duplicate step-3 consents (keep only the stop-if-pain commitment).
- [H] 08 session: "How to run this" is three unlabeled sentences with no exercise names. Prefix each with the move name, or hide until expanded.
- [H] 08 session: first viewport has no figure or clip; the figures are below the fold. Show a figure per block in the collapsed list.
- [M] 04 programs: filters, sort and repeated lists for 3 programs; pull-up card cut off. Hide filters until more than 6 programs.
- [M] 06-intake-03: first-screen week-8 promise "25-45 second dead hang" is the only payoff text; add a figure of the target.
- [M] 06-intake-02: tap "None of these" is good, but 5 Qs follow it; collapse them when "None" is set so the screen is short.
- [L] 06-intake-01: tier subtexts read as test criteria ("Passive dead hang at least 15 s"), simplify.
- [L] 07: "Do a morning check first" link and "Find your exact level" card compete with the CTA; fine, but demote.

## P1 first, for my lens
1. Fix the `next=` handoff so the ad click lands on the pull-up quick start. This is the last blocker between ad and rep.
2. Merge consents (sign-up three to one, drop the step-3 duplicates).
3. Label "How to run this" and put one figure per block in the first session viewport.

Not verified from captures: post-session payoff, 375 vs 393 differences, actual demo clip.
