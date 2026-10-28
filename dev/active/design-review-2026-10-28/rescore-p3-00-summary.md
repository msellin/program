# Rescore after P3: summary (2026-10-28)

Same six Sonnet lenses, on live captures after deploys 3416f75 + d5c1749 (`BRIEF-RESCORE-P3.md`). 1–10, 10 is best.
Round 1 → P0 → P1 → P2 → P3. Path B (red day) did not run (no persona had a Wednesday session).

| Lens | Density | Size | Visual richness | Consistency |
|---|---|---|---|---|
| Visual craft | 4 → 6 → 7 → 8 → 8 | 8 → 8 → 8 → 8 → 8 | 4 → 5 → 7 → 7 → 7 | 8 → 7 → 8 → 8 → 8 |
| Mobile UX | 6 → 7 → 7 → 8 → 8 | 8 → 7 → 8 → 8 → 8 | 6 → 6 → 6 → 7 → 8 | 8 → 7 → 7 → 8 → 8 |
| Copy density | 6 → 8 → 8 → 9 → 9 | 8 → 8 → 8 → 8 → 8 | 6 → 8 → 8 → 8 → 8 | 6 → 7 → 8 → 8 → 8 |
| Accessibility | 8 → 8 → 9 → 9 → 9 | 6 → 6 → 7 → 7 → 7 | 6 → 7 → 7 → 8 → 8 | 8 → 8 → 8 → 8 → 8 |
| Design lead vs peers | 6 → 7 → 7 → 8 → 8 | 8 → 8 → 8 → 8 → 8 | 3 → 5 → 6 → 7 → 7 | 9 → 8 → 8 → 8 → 8 |
| Ad stranger | 6 → 6 → 7 → 8 → 8 | 8 → 8 → 8 → 8 → 8 | 4 → 5 → 6 → 8 → 8 | 8 → 8 → 7 → 8 → 8 |
| **Mean** | **6.0 → 7.0 → 7.5 → 8.3 → 8.3** | **7.7 → 7.5 → 7.8 → 7.8 → 7.8** | **4.8 → 6.0 → 6.7 → 7.5 → 7.7** | **7.8 → 7.5 → 7.7 → 8.0 → 8.0** |

**Stranger:** finish setup yes, session 1 yes, come back yes.

P3 was polish; the scores plateau. The six lenses agree the remaining gains are not more small fixes but: real
visuals (figures that carry the page), the sign-up consents, and the screens no round has covered (the set-by-set
player — see `../custom-track/custom-track-plan.md`).

## Settled by the lead
- **`next=` lost after sign-in (stranger, [B], third time): harness artefact.** `launch-gaps.spec.ts:54` signs in at
  `/sign-in/` with no `next=`, so it cannot carry the arrival program. The real path is for O-02 on the owner's phone.
- **Heatmaps "colour-only, no text equivalent" (a11y, [H]): not so.** Each week row is a button whose aria-label
  reads "Week of …: N done, N amber, N red, N rest, N missed" (`WeeklyHeatmap.tsx`); not visible in a screenshot.
- **Plan "Skipped" on Mon (copy, 4th round):** a real skipped training day in the persona (P2 `rest-day-check.md`).

## Still open
1. **Sign-up:** three consent checkboxes before any value; Google greyed until ticked [H, stranger].
2. **Figures:** thin, ~40px brief thumbnails look alike; hero figure still light [M, visual + lead]. Coach + motion +
   visual review of all ~54 figures has never been done past the first 9 (2026-10-19 panel).
3. **Brief:** "Scap retraction hold …" truncates beside OPTIONAL; Start bar still shows a sliver of the next card at 375
   [M/L, visual + mobile + a11y].
4. **Today 375×667:** "Do a morning check first" sits half under the bottom nav at rest [M, mobile].
5. **Session-done:** ladder as four text lines; "Next level" after one session reads as a claim; no figure on Next
   session [M, lead + copy].
6. **Record:** two near-identical 12-week heatmaps (Readiness, Activity) and two empty trend cards after session 1
   [M, copy]; still no headline line chart [lead, carried].
7. **Extra session list:** flat text cards, no figures or grouping [M, visual].
8. **Eyebrows:** 12px uppercase grey still too many per screen [M, a11y + lead].
