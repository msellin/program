# Today + Week + Session — Copy & semantics brainstorm

Lens: naming, information framing, mental-unit vocabulary.
Author: app-audit-copy-clarity
Written: 2026-08-21
Companion brainstorms (not covered here): IA architecture, mobile UX, session flow.

---

## 1. Naming autopsy

Four words carry almost the entire mental model — and three of them lie.

**"Today"** is the identity of the primary tab AND a fixed calendar concept. But the tab quietly hosts a DateNav that lets you look at tomorrow, Friday, or last Monday. The moment you tap forward, the H1 still says "Today" while the body says "Friday 21 Aug" — an eight-day-off-Today Friday. The tab name is now a lie. Persona-strength text shows the collision plainly: line 5 `TODAY · WEEK 3 OF 4` and line 12 `Today` sit on top of a body dated `Friday 21 Aug`. The user has to reason: is the H1 the tab-name, or a claim about the date?

**"Session"** does three jobs. It is (a) a route (`/session/[slug]`), (b) a component (`TodaySession`), and (c) a verb ("Open session", "Log session", "Log extra session"). Nothing in the copy tells the user which meaning applies. When you tap "Open session" on Today (persona-strength line 34), you land on a route whose H1 is essentially the same block card you just came from. It reads like a broken link, not a drill-in.

**"Open session"** is the worst CTA in the app. The plan is already OPEN, in front of you. What "open session" means is closer to *"enter the focused workout view"* — but the word "open" implies opening something that was closed, which nothing was.

**"Week"** is honest — it labels the 7-day rhythm view. But it inherits none of Today's date state. Set Today to Wednesday, jump to Week, Week still highlights today. Two navigation systems, one mental model, zero continuity.

**"Extras"** reads as bonus content. What it means is *"off-plan sessions you can log without touching the coach's proposals."* Every persona sees the word next to a real block on Today and cannot tell whether Extras is a companion drawer or a separate area of the app.

---

## 2. Three alternative naming models

### Model A — **Date-scoped labels** (the honest-clock model)

The core move: the tab that shows a day is called **Day**, not Today. The word "Today" becomes a **contextual eyebrow** ("Wednesday · today", "Wednesday · +1 day", "Wednesday · 3 days ago"), so the H1 never lies about which date it is showing. "Today" is preserved as a home button (a "back to today" affordance), not as a tab name.

| Surface | Current | Proposed |
|---|---|---|
| Bottom nav | `Today` | `Day` |
| Bottom nav | `Week` | `Week` (unchanged) |
| H1 on `/` | "Today" | The date, weekday-first: **"Wednesday · today"** / **"Wednesday · +1"** / **"Wednesday · –3"** |
| Eyebrow above H1 | "TODAY · WEEK 3 OF 4" | **"WEEK 3 OF 4 · ENDS 31 AUG"** (drops "TODAY", which the H1 already tells you) |
| CTA into workout view | "Open session" | **"Start this session →"** (if today) / **"Preview this session →"** (if future) / **"Review this session →"** (if past) |
| Extras route name | "Extras" | **"Off-plan"** |
| "Log extra session" | "Log extra session →" | **"Log off-plan session →"** |
| Concurrent scoping | (implicit) | Each block card labelled with its program: **"ENGINE BUILDER · TODAY"** stays; but on non-today days the eyebrow reads **"ENGINE BUILDER · +1 DAY"** |

**Date-context reads to the user as:** the H1 always names the date, and its relation to today is a modifier ("+1", "–3", "today"). No screen ever ambiguously says "Today" while showing a different day.

**Multi-track reads as:** each program is a **track**. The word "track" is already the founder's internal vocabulary (memory-note `project_saas-track-model`) and honest — a track is a linear thing that runs alongside other tracks. Concurrent users see "3 tracks scheduled today" (already in persona-multitrack line 26 — this stays).

**CTA vocabulary:** verb-first, date-tense-explicit. "Start" for today, "Preview" for future, "Review" for past.

**Peer reference:** Runna, which shows "Today's run · Tuesday" as a header pattern with a "Move to another day" affordance.

**Kills:** the "Today tab shows tomorrow" lie. The overloaded "Open session" verb. The Extras / bonus-content confusion.

**Risks:** "Day" is a colourless tab name. First-time users may not know why the app has a tab called Day instead of the more universal "Today". Solvable with the H1 doing the work, but it's a real risk.

---

### Model B — **Focus-first** (the promise-forward model)

The core move: reframe every surface around the landing promise word — **Focus**. Today's H1 leads with what's being sharpened; the date is secondary metadata.

| Surface | Current | Proposed |
|---|---|---|
| Bottom nav | `Today` | `Focus` |
| Bottom nav | `Week` | `Rhythm` |
| H1 on `/` | "Today" | **The program name**, e.g. "Engine Builder" or "3 focuses" (concurrent) |
| Eyebrow | "TODAY · WEEK 3 OF 4" | **"WEEK 3 OF 4 · WEDNESDAY 21 AUG"** |
| Block-card headline | "TODAY" | **"TODAY'S SHARPENING"** (single-focus) / **"TODAY · ENGINE BUILDER"** (concurrent, unchanged) |
| CTA into workout view | "Open session" | **"Sharpen today →"** |
| Session route H1 | (currently same as Today) | **"Sharpening: Norwegian 4×4"** — the *what* is the title, not "Session" |
| Extras | "Extras" | **"Around your focus"** (long) or **"Around it"** (short) |
| "Log extra session" | "Log extra session →" | **"Log something off-focus →"** |
| Concurrent multi-track | "3 tracks scheduled today" | **"3 focuses running"** |

**Date-context reads as:** date is metadata in the eyebrow. The H1 answers "what am I sharpening", not "when is it". DateNav lives as a small day-strip below the header.

**Multi-track reads as:** each program is a **focus**. Landing already uses this word 12 times ("Pick one thing", "your focus arc", "Pick my focus"). The app currently doesn't say "focus" once in the captured Today text. That is the disconnect.

**CTA vocabulary:** the verb "sharpen" leads. Every session-open CTA becomes "Sharpen today →" / "Sharpen tomorrow →" / "Sharpened Wednesday →" (past-tense for review).

**Peer reference:** Oura's "Readiness" (a word, not a date) is the tab identity; the date is contextual. Apple Fitness+ "For You" (a promise, not a date).

**Kills:** the Today-tab-that-isn't-Today problem, by removing "Today" from the tab set entirely. The generic "session" word — replaced with the specific *what* is being sharpened.

**Risks:** overcommits to landing metaphor inside the app, where verbs like "sharpen" can feel precious after the 30th session. Verb fatigue is real. Also loses the calendar anchor that some users (esp. rehab-primary and Runna-refugees) reach for.

---

### Model C — **Verbs-only** (the app-that-does-work model)

The core move: bottom nav is verbs, not nouns. Each surface names the action you're there to take, not the mental container.

| Surface | Current | Proposed |
|---|---|---|
| Bottom nav | `Today` | **`Train`** |
| Bottom nav | `Week` | **`Plan`** |
| Bottom nav | `Progress` / `History` (→ Record per Cut C) | `Record` |
| Bottom nav | `Programs` | **`Browse`** |
| H1 on `/` | "Today" | **"Train — Wednesday 21 Aug"** |
| H1 on `/week` | "Week" | **"Plan — week of 17 Aug"** |
| CTA into workout view | "Open session" | **"Start →"** (today) / **"Preview →"** (future) / **"Review →"** (past) |
| Extras route name | "Extras" | **"Add"** (as in "add off-plan work") — or keep under Train with an accordion |
| Concurrent multi-track | "3 tracks scheduled today" | **"3 to train today"** |

**Date-context reads as:** each verb-tab carries a date in its H1 subtitle. The verb tells you what you're here to do; the subtitle tells you when. No name lies because the name is a verb, and a verb never claims to be a date.

**Multi-track reads as:** each program is a **program**. Verbs-only lets us stop shopping for a synonym — the word "program" is fine when the tab-word is a verb, because the noun collision (program-vs-week-vs-session) dissolves.

**CTA vocabulary:** minimal. Two-word max. `Start →`, `Preview →`, `Review →`, `Add →`, `Skip`, `Move`, `Log`. Arrows only where the CTA opens another surface (per §2.13 lock).

**Peer reference:** Hevy's "Start Workout" (verb-first CTA); Zwift Companion's "Ride / Run" verbs in nav. Peloton's "Class" tab is closer to Model B (noun-first).

**Kills:** every noun-vs-noun ambiguity: session/workout/block, today/day/date. If nav is verbs, the nouns can settle into one primary meaning each in the body copy.

**Risks:** "Train" reads gym-bro to some rehab-primary users. "Plan" as a verb-tab is fine but the underlying content is still a noun (the week). Losing "Today" as a returnable-home concept — no way to say "take me back to now" in one tap without adding a subtle home affordance.

---

## 3. CTA vocabulary rewrite proposal

Assuming Model A wins (see §5). Arrow-glyph consistency preserved: `→` for lateral/deeper navigation, `↓` for downward-on-page, no glyph on primary bronze CTAs that don't navigate.

| String today | Where | Proposed | Rationale |
|---|---|---|---|
| `Open session` | Today block card | **`Start this session →`** (today only) | Names the action, not the panel. |
| — | Today block card, future date | **`Preview this session →`** | New string — replaces the "Open session on tomorrow" broken UX. |
| — | Today block card, past date | **`Review this session →`** | New string — for date-nav backward viewing. |
| `Open extras` | Today Extras block | **`Browse off-plan →`** | Names the content, not the container. |
| `Log extra session →` | Today Extras footer | **`Log off-plan session →`** | Removes "extra" (which reads as bonus). |
| `Log session` | Today primary CTA | **`Log today's session`** (no arrow — same surface) | Terminal action, not navigation. |
| `Import GPX` | Today secondary CTA | `Import GPX` (unchanged) | Fine. |
| `APPLY BUMP` | Proposal card | **`Apply`** (Title-case; existing bronze) | "BUMP" is jargon. |
| `IGNORE` | Proposal card | **`Ignore`** | Case consistency; parity with landing dictionary. |
| `WHY?` | Proposal card / block | **`Why this? →`** | Locked per §2.13; already the standard. |
| `WORKOUT READY` | Session status | **`Ready to start`** | "Workout" is a Hevy word; Terav says "session". |
| `PREVIEW →` | Graduate page | **`Preview next block →`** | Names what's being previewed. |
| `PICK YOUR NEXT FOCUS →` | Graduate page | **`Pick your next focus →`** | Case only (Model B keeps the word "focus"; Model A tolerates it because it's a landing-echo moment, not a persistent chrome word). |
| `Skip to content` | A11y skip link | Unchanged. | |
| — | New — date-nav prev/next | **`‹ Prev day`** / **`Next day ›`** | Explicit rather than bare arrows. |
| — | New — jump-to-today | **`Back to today ↩`** | Explicit home affordance when DateNav is off today. |

---

## 4. Concept dictionary — Terav-native terms (Model A + one word from Model B)

These terms should appear consistently across UI, landing, and marketing. Users learn each one *once*.

1. **Focus** — the one capability a program sharpens (an engine, a lift, a skill, a joint). Only used at program-selection / graduate moments; not in daily chrome.
2. **Program** — the shipped arc (Engine Builder, Handstand Walk, etc.). Not "plan", not "track" in app chrome (the founder-internal "track" word stays internal).
3. **Session** — a scheduled block on a specific date, inside a program. Never a component, never a verb.
4. **Block** — the phase-of-program container (weeks 3–6). What "Zone 2 · Row / Ski" belongs to.
5. **Today** — the current calendar date, as an unambiguous anchor. Used only when the date shown IS today. Never as a persistent tab label under Model A.
6. **Day** — the tab that shows one day's plan, whichever day the user is viewing.
7. **Week** — the 7-day rhythm view. Unchanged.
8. **Record** — the Cut C archive surface. Unchanged.
9. **Off-plan** — anything logged outside the coach's proposals. Replaces "Extras". Never called "bonus" or "extra".
10. **Proposal** — an engine-suggested change (load bump, tier-up, 5% lighter). User applies or ignores.
11. **Sharpen** — the promise verb. Reserve for landing, onboarding, and end-of-block moments. Do NOT repeat in daily chrome (verb fatigue).
12. **Cite** — every proposal carries a citation. This is a UI concept, not just a landing claim; `Source: Rhea et al. 2003` is the receipt.

**The one missing word (see §5):** **Day**.

---

## 5. Recommendation

**Top pick: Model A — Date-scoped labels.**

The founder's captured bug — "when in today view i move to tomorrow to see tomorrow plan, then from there i click on one session, i get empty session as it probably looks at todays date" — is not fundamentally an architecture bug. It is a **naming bug that CAUSED an architecture bug**. Because the tab is called "Today", the session route was written to assume "today", because "Today" is what the tab says it's showing. Rename the tab to **Day**, make the H1 name the actual date, and the bug becomes structurally impossible to write next time — the developer looking at the DayPage component will not assume `todayISO()`; they'll look for `activeDate`.

The one word Terav needs and does not currently have is **Day** — a tab identity that can honestly show any date, with "today" as a contextual modifier in the H1, not a tab-level lie. Every other rename in Model A flows from that primitive.

Model B (Focus-first) is *emotionally* the most on-brand — it makes the landing promise visible in the app chrome — but it overloads the word "focus" into daily-driver frequency where it will feel precious by month two. Preserve "focus" for high-ceremony moments (program pick, graduate arc): a promise word, not a chrome word.

Model C (Verbs-only) is the cleanest engineering model but reads gym-bro on "Train" and loses the "return to now" gesture that any date-aware app needs. Worth revisiting only if the mobile-UX brainstorm converges on a verb-tab pattern independently.

**This lens must converge with:**

- **IA architecture brainstorm** — Model A requires a shared `activeDate` primitive in the Zustand store; the tactical `?date=` fix from commit `8edfe46` is not sufficient. IA lens must confirm the state-shape.
- **Mobile UX brainstorm** — Model A's "Wednesday · today" H1 pattern must fit the mobile viewport without wrapping; the day-strip DateNav needs a mobile-first pattern (Runna's is a good reference).
- **Session-flow brainstorm** — the `Start / Preview / Review` CTA trifurcation implies the session route knows its date-tense, which is exactly the bug the founder observed. All three brainstorms need to align on `activeDate` being the load-bearing primitive across Today / Week / Session / Extras.

If those brainstorms converge, Model A is a low-risk semantic reshape that fixes the founder's observed bug at the naming layer, aligns app copy with the landing voice (which already avoids saying "Today" as a category word), and leaves the Cut C Record redesign untouched.
