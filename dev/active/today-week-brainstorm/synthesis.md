# Today + Week + Session — Synthesis

Owner: product-design-lead
Written: 2026-08-21
Status: decision doc — awaiting founder pick
Inputs synthesized:
- `dev/active/today-week-brainstorm/design-lead-brainstorm.md` (IA lens → Model B: Plan/Session split)
- `dev/active/today-week-brainstorm/mobile-ux-brainstorm.md` (ergonomics lens → Model C: Bottom-Sheet Picker)
- `dev/active/today-week-brainstorm/copy-semantics-brainstorm.md` (naming lens → Model A: Day rename)
- `dev/active/today-week-brainstorm/prompt-context.md`

---

## 1. Executive summary

Three parallel brainstorms went at the same tension from three different angles — architecture, ergonomics, and naming — and they landed on the same load-bearing conclusion: **Today, as it exists, is dishonest about what it is.** The tab is called Today, but it hosts a date picker; the H1 says Today while the body shows Friday; the Session route says it's a separate thing while rendering the same component. That is a single sin worn three ways.

Where the three lenses diverge is on the fix. Design-lead wants an architectural split — carve out a **Plan** tab that owns date browsing and let Today become truly today. Mobile-UX wants an ergonomic overlay — hide date browsing inside a **bottom sheet** so the "primary Today" stays intact and the ouch-zone DateNav dies. Copy-clarity wants a **rename** — call the tab "Day" and let the H1 carry the date honestly ("Wednesday · +1"); no new IA required.

Crucially, copy-clarity's move is **compatible with either destination model**. That means the founder has two separable decisions: a naming decision, and a destination decision. This synthesis lays out the three plausible combined shapes and surfaces the discrete forks the founder must pick.

---

## 2. The one shared move

**All three lenses agree that Today must stop being a date browser.** Whatever else changes, `activeDate` must not live on Today's chrome as a stranded top-of-screen DateNav. That single decision resolves the founder's bug at the semantic root — every downstream surface that inherits from Today (Session, Extras, Check, Report) stops needing a `?date=` smuggle.

Everything else is a variable on top of that decision:
- Copy-clarity varies **what Today is called** (Day, contextual H1).
- Mobile-UX varies **where date browsing goes** (bottom sheet, still on the same tab).
- Design-lead varies **whether date browsing gets its own tab** (Plan absorbs it).

---

## 3. Three combined shapes

### Comparison table

| Dimension | Shape 1 — **Plan + Day** | Shape 2 — **Sheet + Day** | Shape 3 — **Today unchanged + Sheet** |
|---|---|---|---|
| Bottom nav | Day · Plan · Record · Profile (4 tabs) | Day · Record · Programs · Profile (4 tabs, Week killed) | Today · Week · Record · Profile (4 tabs) |
| Today tab name | **Day** | **Day** | **Today** (unchanged) |
| Where date-browse lives | **Plan tab** (owns weekly + date scrub) | **Bottom sheet** on Day | **Bottom sheet** on Today |
| `activeDate` primitive | Route param `/plan?anchor=YYYY-MM-DD`; Day is stateless (`todayISO()`) | Zustand `browsedDate` (Day tab reads from store when sheet has picked a day) | Zustand `browsedDate`; Today tab reads from store when sheet has picked a day |
| Session route | Kept (`/session/[slug]?date=…`) as deep-link primitive | Killed as a route; sessions inflate in place on Day | Kept as-is; still needs `?date=` |
| Fixes the founder's bug? | **Yes — by policy.** Day never carries date state. | **Yes — by plumbing.** Sheet writes `browsedDate` to store; Day+Session both read it. | **Yes — by plumbing.** Same store mechanism, but the "Today" label still lies while the sheet is active. |
| Multi-track handling | Day = hero + peek-strip; Plan = multi-dot week grid | Day = hero + peek-strip; sheet's day preview stacks per-track | Today = current stacked cards; sheet's day preview stacks per-track |
| Peer alignment | Whoop (Today home) + Freeletics (Plan tab) + TrainingPeaks | Apple Fitness+ (sheet-picker) + Oura (home + sheet) + Hevy | Whoop-lite; least distinctive |
| Implementation cost | **M** — Week → Plan rename + Today DateNav delete + hero/peek-strip on Day + one new `?anchor` route | **L** — sheet component + Zustand slice + session route deletion + inflate-in-place mode + Week teardown | **S** — sheet component + Zustand slice + Today DateNav delete + Extras absorption |
| What it gives up | Users who "peek at tomorrow from Today" now change tabs. Week's current pattern gets a rename but keeps its investment. | Week's dot-grid and MoveSheet get scrapped; the sheet is a new surface people must learn. | Least ambitious — leaves the "Today" naming lie in place; the H1 still says "Today" even when the sheet has scoped to next Wed. Semantic sin survives. |

### Shape 1 · Plan + Day (design-lead's B + copy-clarity's A rename)

Rename Today → **Day**, and rename Week → **Plan**. Day is always `todayISO()`, no DateNav. Plan absorbs date browsing (with the existing Week grid, multi-dot, and MoveSheet as its interior). Session route survives as `/session/[slug]?date=…`, opened from either surface, always with a Back that respects referrer.

Header on Day reads: `Wednesday · today` (contextual eyebrow does the naming work). Header on a future day *does not exist on Day* — because Day is always today. Future browsing happens on Plan, whose H1 reads `Plan · week of 17 Aug` with the anchor date scrollable.

Multi-track: on Day, hero-of-the-day + a peek-strip of secondary tracks. On Plan, the multi-dot grid stays and is exactly the surface where "which days converge" gets answered.

### Shape 2 · Sheet + Day (mobile-UX's C + copy-clarity's A rename)

Rename Today → **Day**. Kill the Week tab. Date browsing lives inside a bottom sheet triggered by a `▲ Browse other days` chip pinned above BottomNav. The sheet's day-strip picks a date; Day's content re-renders for that date; the H1 reads `Wednesday · +1` / `Wednesday · today` / `Wednesday · −3` accordingly.

Session route is killed. Tapping "Start" on the hero inflates the card in place to the full workout UI; URL becomes `/day?focus=engine-builder&date=YYYY-MM-DD` (or hash). Back button collapses.

Multi-track: same hero + peek-strip. In the sheet's day preview, all three tracks list with counts and a single "Open this day" CTA that scopes Day to the picked date.

This is the most ergonomically clean shape (mobile-UX makes the case) and the most semantically clean shape (copy-clarity's rename resolves the "Today shows tomorrow" lie). It is also the most expensive to build because it retires Week entirely.

### Shape 3 · Today unchanged + Sheet (mobile-UX's C alone, most conservative)

Keep the **Today** tab name (preserves landing voice consistency). Keep the Week tab (preserves current investment). Add the `▲ Browse other days` bottom sheet on Today. Delete Today's top-of-page DateNav. The sheet writes to a Zustand `browsedDate`; when the sheet is dismissed with a date picked, Today's body renders that date's content but the tab still reads "Today" and the H1 still reads "Today."

This is the fast option. It fixes the ergonomic sin (chevrons in the ouch zone) and it fixes the plumbing bug (session route reads `browsedDate` from store, no `?date=` smuggle needed). It **does not** fix the semantic sin — the tab named Today still shows non-today when the sheet has been used. Copy-clarity would call this a regression risk, not a fix.

---

## 4. Founder decisions surfaced

These are the discrete forks. Each is a fork the founder personally has to call — engineering cannot decide them.

**D1 — Naming: Keep "Today" or rename to "Day"?**
Landing voice says "Today" a lot; the copy-clarity brief argues that the tab-vs-body lie is the *cause* of the founder's bug and demands rename. Keeping "Today" is landing-consistent but leaves the semantic sin intact. Renaming to "Day" is honest but colourless.

**D2 — Destination: Where does "browse other days" live?**
Options: (a) its own Plan tab (Shape 1); (b) bottom sheet on Day (Shape 2); (c) bottom sheet on Today (Shape 3). Shape 1 gives dedicated planning real estate. Shape 2/3 keep the Today-as-primary surface intact and hide the browse affordance until needed.

**D3 — Extras: Rename to "Off-plan" (copy-clarity), fold into Today's peek-strip (design-lead), or leave as-is?**
Copy-clarity wants `Off-plan`. Design-lead wants Extras absorbed into Today's peek-strip and its `/extras` route demoted to a scroll-anchor. These stack — you can do both.

**D4 — Session route: Permalink (`/session/[slug]?date=…`) or modal-only (inflate-in-place)?**
Permalink preserves deep-linking (GPX shares, "here's my workout" links). Modal-only is cleaner IA but breaks bookmarks. Shape 1 keeps permalink; Shape 2 kills it; Shape 3 keeps it as-is.

**D5 — Is Week's investment kept or killed?**
Shape 1 keeps and rebrands (Week → Plan). Shape 2 kills (Week absorbed into sheet). Shape 3 keeps as-is. The Week grid, dots, MoveSheet, ConfirmSheet, WeekDayActions are all real code — killing them is a real cost.

---

## 5. The 7 adjacent frictions

Design-lead flagged these. Marking which shape resolves each; "still open" means no shape from this brainstorm resolves it and it needs a follow-up brief.

| # | Friction | Shape 1 · Plan+Day | Shape 2 · Sheet+Day | Shape 3 · Today+Sheet | Still open? |
|---|---|---|---|---|---|
| 1 | Past-day: no clean visual state for accepted-days-ago proposal | Partial — on Plan, past-day view can render a "you accepted this on Tue" chip; but chip design not specified | Partial — sheet's day preview can render the chip; but Day tab's inflated view still needs the state | Partial — same as Shape 2 | **Yes — needs proposal-history-state brief** |
| 2 | Future-day: session card that shouldn't fire yet | Yes — Plan uses `Preview →` CTA per copy-clarity's tense trifurcation | Yes — sheet-scoped Day uses `Preview →` | Yes — sheet-scoped Today uses `Preview →` | No — resolvable in-shape if D1 adopts tense-aware CTAs |
| 3 | Retro-log Extras is one tap deeper under B | Yes — retro-log lives on Plan's past-day drill-in (one tap deeper than today's Extras card) | Yes — retro-log lives inside the sheet's day preview | Yes — same as Shape 2 | No — accept the extra tap; retro-log is low-frequency |
| 4 | Session-in-progress model + resume banner | Not addressed — Session route survives, could add a resume banner on Day | Not addressed — inflate-in-place means "in-progress" is a card state on Day; no cross-tab persistence needed | Not addressed | **Yes — needs session-lifecycle brief** |
| 5 | Check + Report + specialist-share past-date context | Partial — Plan can host a `Share this day` export per past date | Partial — sheet's day preview can host `Share this day` | Partial — same as Shape 2 | **Yes — needs specialist-share brief (out of scope here)** |
| 6 | Retest events orphaned | No — retest lives on Record; cross-surface handoff from proposal → retest not solved | No — same | No — same | **Yes — needs retest-lifecycle brief** |
| 7 | FirstRunBanner's home ambiguous | Yes — banner lives on Day (the decision moment) | Yes — banner lives on Day | Yes — banner lives on Today | No — resolvable in-shape |

Three frictions (1, 4, 6) plus the specialist-share sub-case of 5 are genuinely open regardless of which shape wins. They should be scoped as follow-up briefs after the founder picks a shape.

---

## 6. Recommendation

**Ship Shape 1 — Plan + Day.**

The founder's instinct — "Today, Week and Sessions … needs a big refactor" — is already thinking in terms of three named surfaces, not one timeline. Shape 1 honors that mental model, preserves the Week investment by rebranding rather than deleting, resolves the founder's bug by *policy* (Day is always today, no state to leak) rather than *plumbing* (which is what Shape 2 and 3 do), and matches the load-bearing peer references — Whoop's single-purpose Today plus Freeletics' Plan tab plus TrainingPeaks' calendar. It also stacks cleanly with copy-clarity's rename (Day + Plan is a coherent naming pair), and it gives multi-track its natural home: Day gets a focused hero + peek-strip (positioning-consistent with "one focus per session"), while Plan gets the multi-dot grid where the "three tracks converging on Wednesday" question actually gets answered.

**Honest caveat.** If the founder weights landing-voice consistency higher than semantic honesty, D1 flips to "keep Today" and the recommendation degrades to Shape 3 (add the sheet, don't rename). That's a defensible call — Terav's landing dictionary uses "Today" as a core word and the app diverging risks brand fragmentation. This is the one place I would defer to the founder's brand instinct rather than argue.

**Where I would fight.** D4 — keep the Session route as a bookmarkable permalink. Deep-linking a specific workout ("I did this last Tuesday, look") is the exact affordance a rehab-primary or specialist-sharing user needs, and inflate-in-place kills it without a great substitute.

---

## 7. Fastest next test

**Do a 3-user hallway prototype on a Wednesday evening.** Not a full mock — just a paper or Figma cut of Shape 1 vs. Shape 3 (the two most viable ends of the spectrum), on a real iPhone 15, showing a persona-multitrack state (Engine Builder + CSM + Overhead scheduled for the day).

Ask each user two questions, watch what their thumb does, do not prompt:

1. "It's Wednesday night. Show me what you have tomorrow."
2. "You did a class Tuesday you didn't log. Log it."

If all three tap the bottom-sheet chip on Shape 3, that's the sheet-model validated. If all three switch to the Plan tab on Shape 1, that's Plan validated. If they split, the "Today"-vs-"Day" naming call becomes the deciding factor and D1 needs a copy A/B on a real screen (not just this doc).

This is a ~4-hour prototype + ~1-hour user session. It resolves D1 and D2 in a single afternoon and lets the founder pick a shape with real thumb-data, not just synthesized opinion.
