# Rescore after P0: summary (2026-10-28)

The same six Sonnet lenses as round 1, on live captures after deploy e6f1139. Round-1 scores are doubled from 1–5.
Scores are 1–10, where 10 is best.

| Lens | Density | Size | Visual richness | Consistency |
|---|---|---|---|---|
| Visual craft | 4 → 6 | 8 → 8 | 4 → 5 | 8 → 7 |
| Mobile UX | 6 → 7 | 8 → 7 | 6 → 6 | 8 → 7 |
| Copy density | 6 → 8 | 8 → 8 | 6 → 8 | 6 → 7 |
| Accessibility | 8 → 8 | 6 → 6 | 6 → 7 | 8 → 8 |
| Design lead vs peers | 6 → 7 | 8 → 8 | 3 → 5 | 9 → 8 |
| Ad stranger | 6 → 6 | 8 → 8 | 4 → 5 | 8 → 8 |
| **Mean** | **6.0 → 7.0** | **7.7 → 7.5** | **4.8 → 6.0** | **7.8 → 7.5** |

**The stranger's verdict.** Round 1: they quit partway through the 16-step intake. Now: they would finish setup and do session 1.
Coming back tomorrow is still a maybe, because nothing rewards them after the session.

## What still holds the scores down (agreement across lenses)
1. **The session brief is unchanged (6 of 6 lenses).** Three unlabelled "How to run this" prose cards come before any
   exercise. The 11px mono phase caption wraps. The sticky footer takes about 28% of 375×667. "guided, one at a time,
   with a timer" repeats. Follow-along scrolls inside a scrolling page.
2. **The figures read as placeholders (visual, lead, stranger).** Thin grey sticks, and a mostly empty hero tile. Fix: a
   bronze accent on the working limb or the bar, a tinted ground, a heavier stroke. Hero loops (the prompt pack) or owner
   video next.
3. **Today has no hero (lead, stranger).** Build one card: figure, focus, duration, Start, then the week strip and the
   readiness ring (REDESIGN-TARGET §1).
4. **The check screen's sticky "Update check" covers the severity controls (mobile, a11y).** These are the safety input.
   Pad the scroll area; make the chips at least 44px.
5. **Too much mono, and small nav labels (visual, a11y).** Use sans for chips, footers and descriptions. Nav labels at
   12–13px. Use `line-strong` on borders that sit on surface-2.
6. **The quick start's plan screen (copy, stranger).** About 55 words of consent. The ladder labels are truncated. There
   is no H1.
7. **Copy (copy).** The Plan "Mixed practice… engine interleaves… capabilities" line is jargon. The name is spelled
   "Pull-Up" and "PULLUP". Rest days are shown struck through as "Skipped".
8. **No payoff after the session (stranger).** Add a session-done screen: a PB, a ladder tick, the next session.

**Not a defect:** "next= lost after sign-in" again. The harness signs a fresh user in directly. The real carry-through is
SG-01; check it on the owner's phone (O-02).
