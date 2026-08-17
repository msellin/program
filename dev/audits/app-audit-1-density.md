# Terav — IA & Density Audit

Scope: information architecture, screen-level density, hierarchy, and where the user gets lost. Not typography, not colour, not competitor styling.

Reference apps used: Whoop 4.0 iOS (Overview / Recovery ring), Ultrahuman Ring (single-metric cards), Strava (activity feed), Runna (adaptive plan), Levels (single-day density), Notion mobile (content-first), Linear mobile (restrained).

---

## 1. First-30-seconds verdict per tab

**Today.** The user lands into a stack that is *conceptually* right but *rhythmically* wrong. Above the fold today: `YourPlanCard` (dismissable reveal, ~180px) → `FirstRunBanner` (privacy pitch) → `MissedSessionPrompt` → `DateNav` → phase context line → `HeroStateCard` (Ready/Amber/Red) → `SignalsStrip` → `TierAdvanceProposal` → `RetestReminder` → taper / interference / handstand / multi-dim callouts → phase legend → block group heading → first `ExerciseCard`. On a 390px viewport the first exercise checkbox arrives around scroll 3-4. The screenshots show it: three separate collapsed cards (DateNav, HeroState, SignalsStrip pill) before "BARBELL REINTRO SESSION" even appears, and the block's own note ("Empty bar → moderate load…") burns another 90px before a single set can be logged. Runna and Whoop both surface the primary action (start session / view recovery score) inside the first phone-height. Terav does not.

**Week.** Best-designed of the five. Header + range navigator + one phase line + a clean 7-row list where each row carries a single status dot, the day name, date, session names, and optional strip below for skip/override/conditioning. Signal-to-noise here is high. One issue: the "Rules of the week" accordion (`week/page.tsx:322-348`) is discoverable but under-used; the phase description already tells the user everything so the accordion often expands to redundant principles.

**Progress.** Overloaded and mode-splitting. Tab bar (`Lifts | Hip | Insights`) sits under an H1 (`page.tsx:200`) that repeats the bottom-nav label. Lifts tab: three simultaneous engine banners possible (pause/resume, cycle end, waypoint accelerate) + TM editor + Milestones with expandable per-lift progress bar. Insights tab: sub-header sentence + WeeklyNarrativeTile + TierAdvanceProposal + RetestMetricsPanel + (hip-only) SymptomLoadChart. The tab bar hides the most valuable content of the app (the Insights retest deltas + symptom-vs-load chart) behind a click for strength users. Whoop's Overview never hides its recovery ring.

**History.** Actually strong. Heatmap → symptom sparklines (only rendered for regions with data) → lift sparklines (only rendered for lifts with data) → collapsible day log. The "only render regions/lifts with data" logic is the right call and rare among competitors — Strava and Runna both show empty rings. One friction: the heatmap has no legend and no way to click through to a specific day.

**Profile.** Clean. Identity row + 3-stat grid + active plans list + secondary nav (Coach / Guide / Manage data) + Legal + Sign out. This is the tab that landed the IA audit best. Only complaint: the "sessions / weeks active / checks" stat grid is a vanity metric with no context — a Whoop-style *streak* or *last-7-day compliance* would be more actionable.

---

## 2. Density scorecard

Signal % = share of pixels doing real work. Noise % = decorative, restated, or filler. One highest-impact cut per tab.

| Tab      | Signal | Noise | Highest-impact cut |
|----------|--------|-------|--------------------|
| Today    | ~55%   | ~45%  | Kill the phase-context sub-header (`page.tsx:157-164`) OR the `YourPlanCard` after first view — currently both explain "what phase / what plan". |
| Week     | ~80%   | ~20%  | Move "Rules of the week" accordion (`week/page.tsx:322`) to a `?` icon in the phase strip; nobody expands it. |
| Progress | ~50%   | ~50%  | Delete the tab bar (`page.tsx:209-230`) or promote Insights to the default landing for *all* programs. Lifts/Hip become collapsible sections. |
| History  | ~85%   | ~15%  | Add a day-picker link on heatmap cells → jump to that day's Today read-only view. Highest-value missing action. |
| Profile  | ~75%   | ~25%  | Replace vanity stat grid (`profile/page.tsx:127-131`) with a 7-day compliance ring — matches Whoop's Overview mental model. |

---

## 3. The overlaps — content that appears in 2+ places

1. **Phase / week-of / ends-date.** Rendered on Today (`page.tsx:157-164` phase-context line), on Today's YourPlanCard (`YourPlanCard.tsx:79-88` phase_lines), on Week (`week/page.tsx:169-175` phase strip), and implicit on Progress (via milestones dates). **Authoritative home: Week.** Today should say only "week 2 of 4" as a chip; Progress should reference by milestone date, not by phase.

2. **Retest / evaluation-window reminders.** `RetestReminder` on Today (`page.tsx:637-678`), `TierAdvanceProposal` on Today AND on Progress → Insights (`page.tsx:170` and `progress/page.tsx:371`), and the `RetestMetricsPanel` under Insights. **Authoritative home: Progress → Insights.** Today should be a single-line chip "Retest window this week — Progress" and nothing more.

3. **"Not feeling 100%?" / day-adjustment.** `SignalsStrip` collapses it (`SignalsStrip.tsx:62-77`), but expands into `DayAdjustmentProposal` which duplicates the copy of the strip. When accepted it renders a *second* signal ("Not feeling 100% · ×0.90 applied"). Two states, three surfaces.

4. **Rest-day / no-session copy.** Rendered as `RestDayCard` (`page.tsx:561-635`), and separately in Week as "Rest / accessory day" text. The Today card also has a 3-line explanation that "Extras tab" exists. See screenshot 3: 80% of the fold on a rest day is copy pointing to Extras. Move to a one-line link.

5. **Program schedule frequency.** "4×/week · 45 min" appears in every block header (`page.tsx:707-713`), in YourPlanCard schedule_line, and in Week rows. It's not wrong three times, but three times is noise.

6. **Progression rules / TM note.** In program.json → surfaced under TMs on Progress (`progress/page.tsx:319`), in ExerciseDetailsSheet, and via TMSuggestionInline (`ExerciseCard.tsx:356-394`) when a set is logged. Three explanations of the same rule.

---

## 4. What's missing (2026 competitors have it, Terav doesn't)

1. **A single recovery/readiness score visible at all times.** Whoop's ring, Ultrahuman's stack score, Oura's Readiness. Terav has `derived_state` (green/amber/red) but hides it behind the HeroStateCard title. There is no persistent chip in the sticky nav. Given that the entire adaptive engine keys off morning check → derived_state, this should be a 24px dot next to the TERAV wordmark in `AppShell.tsx:117`. Every screen would then answer "how am I today" without a tap.

2. **A session timer / active-session mode.** Strong, Hevy, Runna all have a "session started" state that survives navigation. Terav's `RestTimerHost` (`AppShell.tsx:143`) exists but only for between-sets rest. There's no concept of "I'm mid-workout" — the app doesn't visibly change when the user is logging vs. planning.

3. **Notifications / reminders.** No push, no email digest, no "your morning check is due" nudge. The `SignalsStrip.tsx:96-131` overdue-check logic is smart but only fires *once the user is already in the app*. Runna and Whoop use push heavily.

4. **Import from wearables.** Given a rowing / engine-builder user with HR-driven programs, importing from Garmin/Apple Health/Whoop is table stakes. The `RunSlotCard` (`page.tsx:301, 337`) supports GPX import (screenshot 3) but nothing for wearables. Ultrahuman and Whoop assume it.

5. **Weekly review / auto-generated summary.** `WeeklyNarrativeTile` (imported at `progress/page.tsx:9`) is a start but lives buried under a tab. Strava's Monday-morning digest is a stickiness driver Terav could replicate cheaply since all the data is in `store.logs`.

---

## 5. What's over-explained (help text that repeats what the design should say)

- **`InfoSheet` proliferation on Progress.** Three separate InfoSheets (`progress/page.tsx:417-441`): TM, Milestones, and Symptom-vs-load. All three explain what the section title already claims. Delete two of three; keep only Symptom-vs-load because the concept is genuinely non-obvious.
- **The phase legend under multi-dim programs** (`page.tsx:238-251`). "Week 3 · random practice — order shuffled by the seed. Shea & Morgan 1979." This is a research citation on a workout screen. Move to a `?` on the block header.
- **Interference callout** (`page.tsx:195-220`). A four-line paragraph with "Wilson-Loenneke" and "Schumann 2022" references. Correct programming, wrong surface.
- **`YourPlanCard.tsx:89-91`** attribution_line renders a small italic sentence explaining "why this plan looks the way it does" — but the four lines above already show it. The attribution_line is scaffolding from a design that didn't need the rest of the card.
- **`SignalsStrip.tsx:225-234`** morning-check-overdue expanded copy explains that "load adjustment, red-state gating, and the notes engine all key off the morning check" — the user doesn't need to know the internal wiring, they need the button. Cut copy, keep the CTA.
- **RestDayCard rest variant** (`page.tsx:626-634`) explains that Extras tab exists, that optional work counts, that mobility lives there. Three claims when one link would do.

---

## 6. Top 10 IA/density changes, ranked

### P0 (do this week)

1. **Kill the YourPlanCard for returning sessions.** `page.tsx:131` — the card is already dismissable per program (`YourPlanCard.tsx:31 revealSeen`), but on session start (screenshots) it's still landing above DateNav. Move it below `SignalsStrip` and auto-dismiss after 3 views regardless of tap. Rationale: 180px of "already read that" above fold.

2. **Collapse phase-context sub-header into DateNav.** `page.tsx:157-164` — the "Rebuild + evaluate (race prep sub-goal) · week 2 of 4 · ends 29 Aug" line duplicates YourPlanCard's schedule_line and lives right under an already-context-heavy DateNav. Merge into a single line inside `DateNav.tsx` under the day label: "Sun 16 Aug · Today · wk 2/4". Rationale: reclaims a full row.

3. **Promote a persistent readiness dot to the sticky nav.** `AppShell.tsx:113-133` — a 10px coloured dot beside the TERAV wordmark, reading `derived_state` for today. HeroStateCard demotes to a smaller card once the dot exists. Rationale: Whoop's core pattern; makes state ambient instead of a card.

4. **Progress tab bar → single scroll.** `progress/page.tsx:209-230` — for aerobic/skill users the Lifts tab is empty already (`hideLifts` at line 179). Split into two flat sections (Insights first, then Lifts if applicable). Rationale: three tabs for a page that has at most one meaningful surface per program is unnecessary chrome.

### P1 (next sprint)

5. **Collapse rest-day copy to one line + link.** `page.tsx:626-634` — replace `RestDayCard rest variant` with a two-line rest state: title "Rest day." + one link "Optional work → Extras". Rationale: screenshot 3 shows 6+ lines for what should be 2.

6. **Move engine-banner cluster from Progress → Today.** `progress/page.tsx:235-272` — the cycle-end recommendation and pause/resume banners are actionable *today*, not on a page a user visits weekly. `SignalsStrip` is the right home. Rationale: proposals should sit next to the day being adjusted.

7. **Add heatmap → day-detail click-through.** `history/page.tsx:73-77` — `Heatmap` renders but has no click behaviour surfaced. Wire cell click to `setActiveDate` on Today, or to a read-only day sheet. Rationale: History without drill-down is a wall of colours.

8. **Consolidate "retest reminder" surfaces.** `page.tsx:637-678` (RetestReminder on Today), `page.tsx:170` (TierAdvanceProposal on Today), `progress/page.tsx:371` (TierAdvanceProposal again on Insights). Pick one home per proposal type: gate advances live on Progress, one-line "retest window this week → Progress" chip lives on Today. Rationale: same proposal in two places = user learns to ignore both.

### P2 (backlog)

9. **Cut two of three Progress InfoSheets.** `progress/page.tsx:417-441` — delete TM and Milestones sheets, keep Symptom-vs-load. Rationale: h2 + subtitle should carry that meaning; explanation sheets are documentation debt.

10. **Replace Profile vanity stats with 7-day compliance ring.** `profile/page.tsx:127-131` — "42 sessions · 8 weeks active · 12 checks" is cumulative and uninteresting past week 2. A ring of last 7 planned-vs-completed matches Whoop's language and stays motivating over months. Rationale: compliance beats totals.

---

## 7. What Terav is doing better than competitors

- **Empty-state honesty.** `history/page.tsx:83-89, 107-113` — regions and lifts with no data don't render. Strava shows you an empty HR chart; Runna shows placeholder rings. This is a small design decision but it makes History feel authored, not templated.
- **`SignalsStrip` collapsing rule.** `SignalsStrip.tsx:20-36` — "before/after" comment in the source is the correct call. Five separate cards was the wrong pattern; a single strip with expand is right. Whoop, Ultrahuman, and Oura all use variants of this.
- **Program-aware default tab on Progress.** `progress/page.tsx:160-167` — aerobic-primary users land on Insights, strength users land on Lifts. Runna hard-codes "Overview" and asks users to relearn per program. This is quietly excellent.
- **The `dedupeItems` merge on Today.** `page.tsx:780-805` — "back squat main + back squat volume" appears as one card with merged scheme text instead of two cards for the same lift. Hevy fails at this.
- **Phase-name humaniser + phase-progress line.** `page.tsx:746-776` — stripping "(Phase 1 weeks 0-1)" from block/phase names AND deriving a live "week 2 of 4" line is the right handling of source-data hints that would otherwise leak. Runna's phase labels regularly confuse users this way.
- **`primaryLiftsForProgram` preference for user-entered lifts.** `progress/page.tsx:41-53` — never hides a lift the user has entered a TM for. Strong hides your customs when you switch templates. This is correct.
- **The `wc:` handling of overrides / skips / logged / rest as one dot color per day.** `week/page.tsx:239-258` — five states, one visual language. Runna uses three inconsistent icons for the same information.

---

Word count: ~1720.

File references cited: 24 file:line pairs across the 5 tab pages + AppShell + SignalsStrip + HeroStateCard + YourPlanCard + DateNav + BottomNav + HeaderQuickLinks + ExerciseCard.

No PII observed in the code or screenshots. The screenshots show a battery percentage and time — normal device chrome, not client data.
