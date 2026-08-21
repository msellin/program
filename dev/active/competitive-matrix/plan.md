---
name: Competitive fitness-app design matrix
started: 2026-08-21
status: DRAFT — awaiting founder go/no-go
---

# Competitive design matrix — plan

**Why this exists:** Batch 37/38/38.1 fine-tuned the existing visual system
without ever questioning whether it's the right visual system. Founder feedback
2026-08-21: "we didn't make any full design changes, still kept the same tabs,
same date navigations, same blocks and visual for programs, and today blocks."
Before we redesign, we need to see how the category actually looks — what's
convention, what's differentiator, what's trend, what's dead.

**Deliverable:** `dev/audits/competitive/2026-08-21-fitness-app-matrix.md` —
a single markdown file with (1) attribute matrix (rows = apps, columns =
measurables), (2) synthesis section calling out clusters + trends +
differentiators, (3) explicit recommendations for Terav's next design push
naming which patterns to steal, reject, or invert.

**Not a design push.** This is research. The design push comes after and
uses this matrix as input.

## Apps to survey (~30)

### Recovery / mobility
1. Pliability (formerly ROMWOD)
2. GOWOD
3. ROMWOD legacy (archive.org)
4. Down Dog (yoga)
5. Yoga With Adriene app
6. Alo Moves

### Running / cardio
7. Runna
8. Strava
9. Nike Run Club
10. Adidas Running (Runtastic)
11. Garmin Connect
12. Coros
13. TrainingPeaks

### Strength / logging
14. Hevy
15. Fitbod
16. StrongLifts 5×5
17. Caliber
18. Ladder
19. Boostcamp
20. Future

### CrossFit / functional
21. SugarWOD
22. Wodwell
23. Beyond the Whiteboard
24. Freeletics

### Recovery / readiness scoring
25. Whoop
26. Oura Ring app
27. Apple Fitness+
28. Peloton
29. Zwift

### Skill / bodyweight
30. GMB Fitness
31. The Movement Athlete

**Excluded on purpose:** MyFitnessPal (nutrition, wrong category), Strong
Women / SWEAT (audience-specific, not scale-relevant), Nike Training Club
(too broad, dilutes the axis). Instagram/TikTok fitness — anti-pattern per
existing `competitor-refs.md`.

## Measurables (~80 items, 8 buckets)

### A. Visual system (12)
- A1 Background scheme (dark-only / light-only / dual)
- A2 Primary accent color
- A3 Accent economy (single-accent / multi-accent)
- A4 H1 max size (px at mobile)
- A5 Body-copy default (px)
- A6 Mono/tabular numerals for data
- A7 Card border radius
- A8 Card border weight (0 / hairline / 1px / 2px)
- A9 Icon stroke weight
- A10 Icon size default
- A11 Font family (system / custom sans / custom serif)
- A12 Illustration or photography

### B. Information architecture (10)
- B1 Number of primary tabs
- B2 Nav position (bottom / top / side / gestural)
- B3 Persistent header (yes/no)
- B4 Dashboard vs session split (yes/no)
- B5 Program picker (catalog / algorithmic / hybrid)
- B6 Onboarding step count
- B7 Auth-first or content-first
- B8 Web app parity (yes/partial/no)
- B9 Watch app included
- B10 Widget included

### C. Data visualisation (12)
- C1 Line chart present
- C2 Bar chart present
- C3 Heatmap present
- C4 Ring / donut present
- C5 Sparkline present
- C6 Sankey / flow present
- C7 Time-scale zoom levels (day / week / month / quarter / year / all-time)
- C8 Absolute + relative deltas ("+2 kg" and "+3%")
- C9 Comparison mode (this week vs last)
- C10 Trend arrow chips
- C11 Aggregation tier at scale (rolling avg / phase avg / month-rollup)
- C12 Empty-state visualization design

### D. Content density (10)
- D1 Words-per-screen on primary home
- D2 Cards-per-scroll on primary home
- D3 Text-to-visual ratio
- D4 Video embedded in session
- D5 GIF/anim for exercises
- D6 Voice guidance
- D7 Music integration
- D8 Instructor photos on session
- D9 Long-form articles / blog inside app
- D10 Colored states used (green/amber/red or more)

### E. Interaction / adaptivity (10)
- E1 Confirm-first or auto-apply
- E2 Streaks visible on home
- E3 Achievements / badges surface
- E4 Points / XP / rings
- E5 Push notification frequency (silent / daily / multi-daily)
- E6 Social feed
- E7 Skip / move affordance for planned session
- E8 Undo affordance
- E9 Rest-timer type (large digit / ring / hidden)
- E10 Set-log input pattern (spinner / keypad / +/- / voice)

### F. Adaptivity / coaching (8)
- F1 Load-adjust proposals surface
- F2 Skip-effect propagation (does skipping change next session?)
- F3 Readiness / recovery score
- F4 Symptom / injury tracking
- F5 Deload / rest indication
- F6 Program deviation tolerance
- F7 Off-plan session logging
- F8 Coach chat surface (human / AI / none)

### G. Trust / credibility (7)
- G1 Study citations visible in-product
- G2 Coach photos and credentials
- G3 Peer testimonials in-app
- G4 "Backed by science" marketing
- G5 Research / whitepaper pages
- G6 Data export
- G7 Clinical / physio endorsement

### H. Scale behavior — the founder's core question (10)
- H1 History time-range (30d / 90d / 1y / all-time)
- H2 History aggregation at 400 days (heatmap / list / rollup / summary tiers)
- H3 Progress metrics tier at 400 days (individual / weekly / phase / month)
- H4 Retest list growth (uncapped / capped / paginated / rolled up)
- H5 Off-day representation (blank / marked / colored)
- H6 Program-completion archive (visible / hidden / graduated view)
- H7 Chart densification at 400 points (all points / decimated / rolling avg)
- H8 Weekly-narrative retention (recent / all / decayed)
- H9 Data export as counterweight (CSV / PDF / other)
- H10 Long-time-user identity — "power user" surface

Total: 79 items. Add 20+ during execution if a novel pattern surfaces
worth counting.

## Execution method

3 research agents in parallel, each covering ~10 apps:

**Agent 1** — Recovery + mobility + running (12 apps)
**Agent 2** — Strength + logging + CrossFit (10 apps)
**Agent 3** — Readiness + skill + adjacent (9 apps)

Each agent:
1. WebSearch for each app's marketing page + app-store screenshot page
2. WebFetch high-quality UI teardowns / review posts where available
3. Extract the 79 attributes per app, with source citations (URL + page name)
4. Note any 80th+ attributes worth adding to the matrix
5. Return a CSV-shaped block or a partial matrix

Then I merge, cross-check duplicates, and synthesise.

## Deliverable structure

`dev/audits/competitive/2026-08-21-fitness-app-matrix.md`:

1. **Executive summary** (200 words) — top 5 patterns Terav could adopt,
   top 3 patterns Terav should deliberately reject, top 1 category-white-space
   Terav could own.
2. **Matrix** — apps × attributes table. Truncated to top ~40 attributes for
   readability, full 80+ in an appendix.
3. **Per-attribute synthesis** — for each of the 79 attributes, name the
   convention (what does everyone do?), the trend (what are new apps doing
   different?), and the differentiator (what's rare and interesting?).
4. **Scale-behavior deep-dive** (H bucket) — the founder's core concern.
   Screenshot references where possible. Recommendations for what Terav's
   Progress + History should look like at 400 days.
5. **Recommendations for Terav** — concrete design moves that emerge from
   the data. Not a redesign spec — a set of directional bets ("Progress should
   have month/quarter/year zoom levels like Strava does, not like Whoop's
   30-day-only scroll").

## Estimated cost

Realistic: 3 agents × ~200k tokens each = ~600k tokens for the research pass.
Plus ~50k for my synthesis. Total ~650k tokens for a competitive matrix that
becomes the input to every design decision for months.

## Risks

- **Screenshot access** — App Store screenshots + marketing pages are
  reliable. Actual in-app screens require review posts / YouTube stills.
  Some attributes will be unknown or inferred. Mark those explicitly.
- **Snapshot decay** — This is a 2026-08-21 snapshot. Fitness apps ship
  redesigns constantly. Flag the date in the doc header.
- **"Follow the herd" risk** — matrix could suggest Terav copy the median.
  Synthesis MUST explicitly identify where the median is wrong for Terav's
  positioning (confirm-first, cite-first, focused-improvement, rehab-safe).
- **Research is not design** — deliverable is a matrix, not a redesigned
  app. Founder alignment: this pass ends with recommendations, and the
  actual design push is a separate cycle.

## What I need from founder before firing

1. Go/no-go on the apps list (30 apps — remove any? add any?)
2. Go/no-go on the 79 measurables — any category missing? Any measurable
   framed wrong?
3. Confirm: research pass now, design push in a separate cycle after.
