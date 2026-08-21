# Today + Week + Session — IA brainstorm

Owner: product-design-lead
Written: 2026-08-21
Status: generative brainstorm — not a spec
Scope: alternative UX models for Today + Week + Session + date-context
Related:
- `dev/active/today-week-brainstorm/prompt-context.md`
- `next-app/src/components/session/TodaySession.tsx`
- `next-app/src/app/week/page.tsx`
- `next-app/src/app/session/[slug]/SessionClient.tsx`
- `dev/audits/competitive/2026-08-21-fitness-app-matrix.md` §5 + bucket B

---

## 1. Problem framing

The founder found a stale-date bug, but the bug is a symptom. The tension is that Terav has **two overlapping mental models** running at the same time and the app can't tell them apart.

Model 1 — **"what should I do RIGHT NOW"** (present-tense, always-today, decision moment).
Model 2 — **"let me look at the plan"** (browsing, historical, planning-forward, any date).

Today runs Model 1 in the header but hosts Model 2 in the DateNav. Week runs pure Model 2 but forgets whatever date you chose on Today. Session runs Model 1 with a slug filter, but the URL now has to smuggle a date through `?date=` because the mental model leaks. Extras has its own parallel DateNav because Extras thought it was a Today twin.

The multi-track persona makes this worse: **five "Open session" CTAs on one screen** (Engine Builder, CSM, Overhead Mobility, Extras, Log-extra) shatters the "one focus per session" positioning. Concurrent programs aren't the problem; the container is.

The refactor's job is to pick *one* primary rhythm and let the other one live as a scoped, opt-in browse tool. Not both, everywhere.

---

## 2. Three alternative UX models

### Model A — **"Date-scoped surface"** (Today + Week merge into `/day/[date]`)

**The mental model.** Terav becomes **a date-first agenda** where every session, every proposal, every log entry lives at a specific dated URL. There is no "Today" as a special place — today is just `/day/2026-08-21`, and the app defaults to today when you open it. Week is a *view mode* on the same route, not a separate tab.

**Tab bar (4 tabs).**
- **Plan** — `/day/[date]` (default = today), with `?view=day|week` param
- **Record** — Progress + History (already collapsing per Cut C)
- **Programs** — catalog
- **Profile** — auth, exports, settings

**Date-context.** Lives in the URL. `/day/2026-08-21`, `/day/2026-08-22?view=week`. Store carries a `lastViewedDate` for restore-on-relaunch only. No component-local `activeDate`. DateNav mutates the URL, doesn't mutate a hook.

**Multi-track.** Day view shows a *single hero* — the primary program's session for that day, with a **peek-strip** of other tracks (mobility icon + retest icon + rehab icon, tappable to switch which one is hero). No stack of five cards. Concurrent-user's "these two conflict" banner stays. Week view: multi-dot per day (already built).

**Session.** No separate route. Tapping "Start" on the hero **inflates the card in place** to the full inline workout UI. URL becomes `/day/2026-08-21?focus=engine-builder`. Back button returns to the compact hero. Bookmarkable and shareable — the URL captures date + focused program.

**Wireframe (mobile 393px):**
```
+-------------------------------------+
| TERAV                          [⚙]  |
| TODAY · WEEK 3 OF 4 · ENDS 31 AUG   |
| Concurrent Strength Maintenance     |
| ▓▓▓▓▓▓▓▓▓░░░░ 3/4                   |
+-------------------------------------+
| ‹  Fri 21 Aug          [Day|Week]  ›|
+-------------------------------------+
| PROPOSAL — Room to push             |
| Because: 3 green days + "felt       |
| strong" note. block pull 147.5→152.5|
| Source: Rhea et al. 2003            |
| [ APPLY BUMP ]        [ IGNORE ]    |
+-------------------------------------+
| ● Engine Builder · block pull       |
|   1 block · 6 sets · ~45 min        |
|   [ Start session → ]               |
+-------------------------------------+
| Also today (2 tracks)               |
| ⧗ Overhead Mobility · 3 blocks tap  |
| ⧗ Extras · 6 drills tap             |
+-------------------------------------+
| Log something off-plan  [+]         |
+-------------------------------------+
| [Plan] [Record] [Programs] [Profile]|
+-------------------------------------+
```

**Peer inspiration.** Closest to **Runna** (today's-run hero + adaptive banner + reschedule affordance) and **Peloton Home** (hero-of-the-day). Deliberately differs from **Garmin/Whoop** (which are widget-tile dashboards — Terav's positioning is focused-improvement, not glanceable-lots).

**Tradeoffs.**
1. Multi-track parallel visibility disappears from the fold — user must tap the peek-strip. Overperformer persona may resent this. Correct trade: focused-improvement is the positioning; the hero enforces it.
2. Session-as-inflation gives up a dedicated `/session/[slug]` URL as the deep-link primitive. GPX imports, "back to session" browser navigation get subtler. Compensating: `/day/[date]?focus=slug` is still fully shareable.
3. Requires a real date-scoped store slice (`viewedDate` selector) — non-trivial refactor.

---

### Model B — **"Plan / Session split"** (Week becomes the plan surface; Today becomes always-today)

**The mental model.** Terav becomes **a two-tempo app**. Today is **strictly the decision moment** — no date browsing, no "look at tomorrow." If you want to look ahead, browse, plan, or move things, you go to **Plan** (the current Week, expanded to timeline). Today's URL is `/` and it *always* renders `todayISO()`. There is no date context to smuggle.

**Tab bar (4 tabs).**
- **Today** — `/` — always today, no DateNav
- **Plan** — `/plan?anchor=YYYY-MM-DD` — week+day timeline browser (this is where you look at tomorrow, next week, last month)
- **Record** — Progress + History
- **Profile**

**Date-context.** Only lives on Plan. Today is stateless. Plan has a URL-param anchor. Session route deleted — sessions open from either surface but inflate in place (same as Model A) or overlay as a full-screen route with a Back that respects referrer.

**Multi-track.** Same hero-strip on Today. On Plan, the current Week table stays (multi-dot dots per day) — this is where multi-track lives visibly, because that's where the "I have three tracks this week" question is actually asked.

**Session.** A dedicated overlay route `/session/[slug]` that always reads `todayISO()` when opened from Today, and reads a `?date=` param only when opened from Plan. Semantically clean: Today never navigates through a date, so it never leaks one.

**Wireframe:**
```
Today (/)                     Plan (/plan)
+----------------------+     +----------------------+
| TERAV           [⚙] |     | TERAV           [⚙] |
| TODAY · WEEK 3/4    |     | ‹  Aug 17-23        ›|
| CSM                 |     | ▓▓▓▓▓▓▓▓▓ 3/4        |
|                     |     |                      |
| ● Room to push      |     | Mon 17 ● done        |
| PROPOSAL card       |     | Tue 18 ● done        |
| [ APPLY ] [IGNORE]  |     | Wed 19 ○○ skipped    |
|                     |     | Thu 20 ● done        |
| ● Today's block     |     | Fri 21 ●● ← today    |
| block pull · 45 min |     |   block pull · CSM   |
| [ Start ]           |     |   Overhead · mob     |
|                     |     | Sat 22 ○ planned     |
| Also today:         |     | Sun 23 rest          |
| ⧗ Mobility (tap)    |     |                      |
| ⧗ Extras (tap)      |     | Rules of the week ▸  |
+----------------------+     +----------------------+
| [Today][Plan][Rec][Pr]|   | [Today][Plan][Rec][Pr]|
+----------------------+     +----------------------+
```

**Peer inspiration.** Closest to **Whoop** (Today = single-purpose home) + **Freeletics** (weekly plan is a separate surface) + **TrainingPeaks** (Calendar as the planning surface). Deliberately differs from **Hevy** (calendar-as-primary — Terav is not a log-first app) and **Strava** (feed-as-primary — Terav has no social layer).

**Tradeoffs.**
1. Users who *browse* the plan a lot from Today (checking tomorrow before bed) now have to change tabs. That's the specific behavior the current bug came from — the founder tried to browse tomorrow from Today. This model says "that behavior belongs on Plan, not Today." Bold, but positioning-consistent.
2. Splits into two tab-labels ("Today" + "Plan") that overlap semantically at ~10-20% of interactions. Sharpness of Today's purpose has to be preserved by *never* adding DateNav back.
3. Session route survives — good for deep-links and back-nav, but keeps the `?date=` smuggling for the browse-and-tap path.

---

### Model C — **"One-thing model"** (kill the Today / Week distinction entirely; single scrolling timeline)

**The mental model.** Terav becomes **a timeline you scroll**. There is no Today tab. There is no Week tab. The primary surface is a single vertical timeline centered on today, with past days scrolling up and future days scrolling down. Think **Notion Daily** or **Sunsama** but for training. Every day has a card. Today's card is expanded by default; other days are collapsed.

**Tab bar (3 tabs).**
- **Plan** — the timeline (starts anchored at today, scroll to browse)
- **Record** — Progress + History
- **Profile**

Programs collapses into Profile as "Manage programs."

**Date-context.** The scroll position **IS** the date context. Tapping a collapsed day expands it in place. There's no DateNav — you swipe/scroll. URL uses a hash for deep-link: `/plan#2026-08-21`.

**Multi-track.** Each day's card has a multi-dot header (same pattern as Week today) + tabs inside the card for each program. Expanded day is a mini-Today.

**Session.** No route. Expanding the day IS opening the session. Starting a workout enters an in-card "workout mode" that pins the card to top and dims siblings until Done or Cancel.

**Wireframe:**
```
+----------------------+
| TERAV          [⚙]  |
| ‹ Scroll to browse › |
+----------------------+
|                      |
| ○ Mon 17 · done      |
| ○ Tue 18 · done      |
| ⊘ Wed 19 · skipped   |
| ● Thu 20 · done      |
+----------------------+
| ▼ FRI 21 · TODAY     |
| CSM · Week 3/4       |
|                      |
| PROPOSAL             |
| Room to push...      |
| [APPLY][IGNORE]      |
|                      |
| block pull 45min     |
| [ Start ]            |
|                      |
| + Extras (6)         |
+----------------------+
| ○ Sat 22 · planned   |
| ○ Sun 23 · rest      |
| ○ Mon 24 · planned   |
+----------------------+
| [Plan] [Record] [Pr] |
+----------------------+
```

**Peer inspiration.** Closest to **Oura Timeline** (single scroll, day-scoped cards) + **Notion Calendar Daily** + **Zwift Companion** (recent-first list — but Zwift's 250-cap failure warns against pure enumeration at scale). Deliberately differs from **Peloton** (hero-of-day but no scroll timeline) and **Runna** (structured week table).

**Tradeoffs.**
1. No canonical URL for "today" — deep-links break the mental model ("go to today" is a scroll gesture, not a route). Static export target (Cloudflare Pages) makes hash-routing legitimate but is a small ergonomic loss.
2. Scroll performance at 400 days requires windowing (react-window or intersection-observer). Non-trivial. Terav is not a scroll-heavy app; this is a whole new perf profile.
3. Loses the semantic "you are on the Today tab" affordance — new users can't glance at the nav to know what they're looking at. Novelty penalty. Bill Buxton: first idea is rarely best. This is the "sketch it because you must" option, not the pick.

---

## 3. Comparison matrix

| Model | Fewer tabs? | Kills date-context bug? | Handles multi-track? | Session bookmarkable? | Confirm-first friendly? | Complexity to build |
|---|---|---|---|---|---|---|
| **A — Date-scoped surface** | 4 (was 5) | Yes — URL is truth | Hero + peek-strip (opinionated) | Yes — `/day/date?focus=slug` | Excellent — proposals live on the dated card | Medium-high (URL routing + store slice + inflate-in-place) |
| **B — Plan / Session split** | 4 (was 5) | Yes — Today is stateless | Hero on Today; multi-dot Week on Plan | Yes — `/session/slug?date=…` | Excellent — Today is the accept surface | Medium (Plan = renamed Week; delete Today DateNav) |
| **C — One-thing timeline** | 3 (was 5) | Sidesteps — scroll IS date | Per-day tabs inside cards | Weak — hash routes only | OK — proposal card lives on today's expanded card | High (windowing + perf + workout-mode overlay) |

---

## 4. Recommendation

**Stake the refactor on Model B — Plan / Session split.**

Why:

1. **It resolves the bug by policy, not by URL plumbing.** Today is the decision moment. Today has no DateNav. Today reads `todayISO()`. Every downstream surface that inherits from Today (Extras, Session, Check, Report) also reads today by default. The bug becomes structurally impossible. No `?date=` smuggling needed.
2. **It preserves the current Week's investment.** The Week surface — dots, expand/collapse, MoveSheet, ConfirmSheet, WeekDayActions — is real work. Model B rebrands it to Plan and lets it be the primary planning surface, gaining rather than deleting.
3. **It's the smallest bet that changes the mental model.** Model A is the more ambitious redesign (URL-as-state, hero+peek-strip, kill Session route) and may be right in 6 months, but it touches every surface and requires an invasive store refactor while beta is shipping. Model B is a rename + a delete (Today's DateNav) + a "always today" invariant. Cheap.
4. **It preserves what works.** Hero-of-the-day on Today (Peloton pattern). Multi-track visibility on Plan (multi-dot). Session route still bookmarkable for deep-links (GPX shares, "here's my workout" links). Proposal card stays on Today. Confirm-first stays on Today. Rehab firewall stays intact.
5. **It respects the founder's stated instinct.** "Today, Week and Sessions" — the founder is thinking in three surfaces, not in one timeline. Model B keeps two of the three (renaming Week → Plan, folding Session semantically into Today) and honors the mental model the founder already has.

**What to verify before committing:**

1. **Behavior probe on real users.** Watch 3 users open the app on a Wednesday evening and ask them to "check what I have tomorrow." If they all tap the Today's DateNav today, they'll want Plan. If any of them navigate to Week today, Model B is validated pre-shipping. This is the single load-bearing behavioral question.
2. **Concurrent user reaction.** Model B puts the second/third track behind a peek-strip on Today. persona-multitrack currently sees three parallel cards. Show that persona a mockup of the peek-strip and ask "does this hide your mobility track too much?" — if yes, the peek-strip needs to be a scroll-visible strip, not a horizontal chip row.
3. **Extras' place.** Model B says Extras is on Today (compact card). Founder should confirm whether `/extras` route survives or Extras absorbs into Today's peek-strip. My call: absorb into peek-strip; `/extras` becomes a scroll-anchor on Today for deep-link compatibility, not a separate tab.

---

## 5. Adjacent friction not yet solved

Even Model B leaves gaps. Flagging so the founder + other brainstorm agents (visual craft, copy, motion) can react:

1. **The "past day view" is ambiguous under all three models.** If I browse to last Wednesday, do I see (a) what was planned, (b) what got logged, (c) both? Currently Today at yesterday shows "logged" state fine but the proposal card renders as if it's still fresh. Retrospective viewing of a proposal that's already-accepted or already-ignored has no clean visual state. Needs a "this was Tuesday's proposal — you accepted it" affordance.

2. **The "future day view" over-promises.** Under Model A and Model B, tapping a future day shows a session card with an "Open session" affordance that shouldn't fire yet — you can't do Thursday's workout on Tuesday. Currently Week shows this correctly (no direct-open verb on future days); Today's DateNav does not. Model B fixes it by moving the browse to Plan, but the semantic of "you're looking at future, this is not actionable" needs an explicit visual state.

3. **Extras isn't just a Today card — it's a scheduling concept.** A user who logs a "Wednesday CrossFit class" retroactively is doing something Model B doesn't fully model. Today's Extras card is compact and forward-looking; retro-logging via `/extras?date=YYYY-MM-DD` still requires a date-context flow. Under Model B this goes on Plan (past day drill-in), but that hop is one tap deeper than today.

4. **Session-in-progress state.** None of the three models say what happens if a user starts a workout on Today, then swipes over to Plan mid-session. Should the session persist as an overlay? A resume-banner on return? Currently the app has no in-progress state at all — every input is auto-saved, so "in progress" is a UX fiction. Model B should decide: either add explicit "in progress" (Hevy pattern) or explicitly reject it (StrongLifts pattern — you log a set, it's saved, that's the whole state).

5. **The check-in / report / coach loop is on separate routes with no shared date context either.** Report is "as of now." Check is "morning-of." If a specialist wants to see "the state on Aug 10," none of the current surfaces render that view. Not in scope for this brainstorm — but Model B's "date is only on Plan" invariant means specialist-share on a past date needs a per-day export from Plan, not from Report.

6. **Retest events as first-class artifacts** (competitive matrix §6.2) don't fit cleanly into any of the three models. A retest is neither Today nor Plan — it's an *event* with a delta and citations, part identity. Under all three models it lives on Record. But retest cadence is program-defined and shows up as a proposal on Today; that flow (retest proposal → do it → see it appear on Record) is a cross-surface handoff none of the three models specify.

7. **Onboarding's first-touch surface.** New user picks a program, is dumped into Today (or Plan under Model B) with a Day-1 empty state. The empty state is fine, but the *transition* — from "you just picked Engine Builder" to "your first session is Monday" — has no dedicated surface. Currently Today handles this via FirstRunBanner. Under Model B, unclear whether that banner belongs on Today or Plan. Founder call.
