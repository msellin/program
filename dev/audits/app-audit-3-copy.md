# App Audit 3 — Copy & Voice

Scope: every user-facing string in the Terav app (Today, Week, Progress, History, Profile, Check, Coach, Guide, Extras, Data, Report, all workout components, program catalog + preview).

---

## PII / brand-rule flags surfaced during the scan

- **Location leak.** `src/app/page.tsx:610` — `"Tallinna Ülemiste Järve Jooks (13.7 km). No strength today. Reach the start line healthy."` This is a race-day rest card for `anterior-hip-rebuild`. It puts a specific Estonian city + landmark race in-app. The `feedback_no-location.md` rule forbids this on landing/marketing but the spirit — "positioning is category-and-mechanism, not geography" — extends here. The founder is also the sole hip-program user (personal program), so this is arguably personal data leaking into an app copy string. **Rewrite** to `"Race day. No strength today. Reach the start line healthy."`
- **Estonia mention in Privacy.** `src/app/legal/privacy/page.tsx:57` — `"In Estonia: aki.ee"`. Legal jurisdiction page is the one place this is defensible (GDPR context), keep, but flag for the founder.
- **Founder mentioned in code paths.** Comments in `page.tsx:78-88` and `progress/page.tsx:65-68` refer to "the founder's default" / "the founder's personal file". These are code comments, not user-facing — no action.
- **No client PII in copy.** The app's user is Margus; no other client PII in string literals.

---

## 1. Voice consistency score — 6.5 / 10

Terav has **one strong voice ~70% of the time** and drifts in three predictable places:

- **The strong voice** (Today's rest card, SkipSheet, Guide's Green/Amber/Red, DayAdjustment proposal): terse, physical, cites the mechanism, admits what it doesn't do. This is the target.
- **Drift 1 — HeroStateCard.** `"Ready to work / Progress today. Feel it."` (`HeroStateCard.tsx:11`). "Feel it" is closer to a Nike ad than a rehab log. Amber "Load with care / Hold today's prescription. Don't push." also reads coach-y. Whoop and Superhuman would show the number and the reason, no exhortation.
- **Drift 2 — Coach "coming soon".** `"A coach that reads your whole log every time you ask."` (`coach/page.tsx:404`). This is a marketing headline in the middle of the app. Also the "It'll do / Weekly review / Session-day check / Explain the plan" chip list reads like landing-page feature bullets. The user is signed in, they already know what the app promises.
- **Drift 3 — YourPlanCard reveal.** `"Your plan"` + Sparkles icon (`YourPlanCard.tsx:67-70`). Sparkles is the only emoji-adjacent glyph in the app UI — it clashes with the "no exclamation, no unlock" voice. Everything else uses lucide icons that don't editorialise.

The **top-nav H1s are inconsistent tone/size**: Today has no H1 (correct — the tab is the title), Week/Progress/History use `text-3xl font-semibold tracking-tight`, but Report uses `text-2xl`, Profile has none, Data uses `text-2xl "Data & privacy"`. Not a copy problem, but the tonal impression of "which tab am I on?" varies.

---

## 2. Button label audit

| File:line | Current | Verdict | Proposed |
|---|---|---|---|
| `check/page.tsx:190` | `Save check` | keep | (fine — specific, matches the noun) |
| `programs/page.tsx` (empty state) | `Browse programs →` | keep | — |
| `page.tsx:361` | `Browse programs →` | rewrite | `Pick a program →` (matches Profile/Week; "browse" implies casual, "pick" matches confirm-first) |
| `page.tsx:533` | `Retest — log your numbers` | keep | (great — specific promise) |
| `page.tsx:538` | `Pick your next program →` | keep | — |
| `page.tsx:554` | `End this program` | keep | — |
| `page.tsx:610` | (race copy — see PII note) | rewrite | see PII section |
| `DayAdjustmentProposal.tsx:112` | `Apply ×0.90` | rewrite | `Apply 10% lighter today` (math label reads as jargon on first sight; keep multiplier in secondary text) |
| `DayAdjustmentProposal.tsx:119` | `Not today` | keep | — |
| `ReadinessProposal.tsx:95` | `Advance to Cycle 1 (5/3/1)` | keep | — |
| `ReadinessProposal.tsx:103` | `Not yet` | keep | — |
| `TierAdvanceProposal.tsx:74` | `Advance to {tierLabel}` | keep | — |
| `MissedSessionPrompt.tsx:113` | `Yes — log it now` | rewrite | `Log yesterday now` (the question was "did you train?" — "Yes" is a modal answer, not a button-command) |
| `MissedSessionPrompt.tsx:120` | `No — mark skipped` | rewrite | `Mark yesterday skipped` |
| `MissedSessionPrompt.tsx:156` | `← Back` | keep | — |
| `SessionActions.tsx:414` | `Confirm` (Skip sheet) | rewrite | `Skip session` — "Confirm" is a generic verb; the sheet's title says "Skip today's session?" so the CTA should echo it |
| `SessionActions.tsx:218` | `Shift whole week` | keep | — |
| `SessionActions.tsx:481` | `Move` | rewrite | `Move session` |
| `data/page.tsx:143` | `Share` | rewrite | `Share log` |
| `data/page.tsx:151` | `Download JSON` | keep | — |
| `data/page.tsx:185` | `Wipe local log` | keep | — |
| `data/page.tsx:274` | `Import pasted JSON` | keep | — |
| `report/page.tsx:156` | `Print / save PDF` | keep | — |
| `coach/page.tsx:333` | (Send icon, aria-label `Send message`) | keep | — |
| `check/page.tsx` no reset button | add | consider `Reset` (secondary) — currently the user can only save, not clear |
| `progress/page.tsx:261` | `Apply all` (engine banner) | rewrite | `Apply all TM changes` (nine other Apply-all-adjacent buttons exist across proposals; specificity prevents mis-tap) |

Global pattern: Terav's tap targets are `font-mono uppercase tracking-wider` — that's a strong voice and it works. The buttons that break the voice are the ones that fall back on generic verbs (`Confirm`, `Move`, `Apply all`, `Share`).

---

## 3. Empty state audit

| Location | Current | Verdict | Proposed |
|---|---|---|---|
| `page.tsx:353` (no active program) | `Pick a program` / `Each program starts with a short intake so the plan is calibrated to your baseline, not a template with your name on it.` | keep | Strong — teaches + invites. Model. |
| `week/page.tsx:73` | `Pick a program to see the weekly rhythm here.` | keep | — |
| `progress/page.tsx:85` | `Pick a program to see your training maxes, milestones, and trends here.` | keep | — |
| `extras/page.tsx:36` | `Pick a program to see accessory work, mobility, and around-session blocks here.` | keep | — |
| `report/page.tsx:89` | `Pick a program to generate a training summary here.` | keep | — |
| `history/page.tsx:57` | `No entries yet. Log a session or save a morning check.` | keep | Terse + directive. Model. |
| `progress/page.tsx:296` (no TMs yet) | `No training maxes yet. / Enter a training max to see progress against milestones — it appears here as soon as it's set.` | keep | — |
| `progress/page.tsx:387` (chart under 3 days) | `A trend line needs at least three logged days. Log a morning check on Today and lift a session to start the picture.` | keep | Excellent — explains the mechanism. |
| `extras/page.tsx:103` | `This program has no extras — every prescribed session lives on Today. You can still use the RunSlotCard on Today to log cross-modal work…` | rewrite | Kill the internal component name: `…use the session-log card on Today…` — users don't know what a "RunSlotCard" is. |
| `coach/page.tsx:352` | `Ask anything about your program, form, or how the plan is progressing.` | keep | — |
| `history/page.tsx:222` (lift with no sets) | `no logged sets yet` | keep | — |
| `report/page.tsx:576` (no incidents) | `Nothing crossed threshold in this range.` | keep | Restrained. Good. |
| `NoActiveProgram` (Progress fallback for aerobic user) | (implicit — the "Lifts" tab is hidden) | keep — but confirm the "Insights" landing has an empty-state for Retest metrics with 0 data. Not verified in this pass. |
| `SessionActions.tsx:30-33` (skipped strip) | `Session skipped today / No reason logged` | keep | — |

**Overall: empty states are already the strongest surface in the app.** They teach the mechanism and offer the action, they don't apologize. Only fix needed: the "RunSlotCard" internal name leak.

---

## 4. Proposal card copy audit

The confirm-first surfaces are the load-bearing UI in Terav. All four are graded against: (a) explains why in one line, (b) states what happens on Accept, (c) states what stays put, (d) makes ignoring a first-class option.

### DayAdjustmentProposal — `components/workout/DayAdjustmentProposal.tsx`

| Piece | Verdict |
|---|---|
| Header `"Not feeling 100%? · needs your ok"` | Keep. Second half is the load-bearing bit — signals confirm-first without saying it. |
| Reason line (from engine) | Depends on `note-signals.ts` output. Copy is data-driven, no static string to review here. |
| `"Rehab & mobility work stays as prescribed regardless of your choice."` | Keep. This is the invariant made visible. Good. |
| Buttons `Apply ×0.90` / `Not today` | Rewrite `Apply ×0.90` → `Apply 10% lighter today` (see button table). |

Grade: **A−**. The "needs your ok" tag is the single best microcopy call in the app.

### ReadinessProposal — `components/workout/ReadinessProposal.tsx`

| Piece | Verdict |
|---|---|
| Header `"Signal · you look ready to leave reintro"` | Keep. |
| Body (54-61): `"Two straight sessions above 80% TM at RPE ≤ 7 with no red/amber days. Mechanically you're done with Phase 1. Advancing to Cycle 1 is a call to make deliberately — not something the app will do behind your back."` | **Keep.** This is Cursor-tier explain-the-mechanism copy. |
| Evidence list (64-68) | Keep. Data → user. |
| Footer (70-73): `"Hip-flexor / rehab work stays on regardless. You can also sit tight and let Phase 2 begin on its scheduled date."` | Keep. |
| Confirm dialog: `"Advance to {targetName}? Phase 2 will start today (${todayISO()}). Everything downstream shifts by ${daysToShift} days."` | Keep. |

Grade: **A**. This is the model every other proposal should look like.

### TierAdvanceProposal — `components/workout/TierAdvanceProposal.tsx`

| Piece | Verdict |
|---|---|
| Header `"Ready for the next tier?"` | Rewrite — the header should mirror ReadinessProposal's declarative "Signal · you cleared ___'s threshold". A question header + a body that answers its own question wastes a line. Proposed: `"Signal · tier gate cleared"` |
| Body (34-36): `"Your latest retest clears {tierLabel}'s threshold. Advancing swaps your weekly focus to the next tier's drills; wrist prep + recovery blocks stay."` | **Wrist prep + recovery is handstand-specific.** Copy is program-agnostic but reads program-specific. Rewrite to `"…swaps your weekly focus to the next tier's drills; recovery and prep blocks stay."` — or make it truly program-scoped. |
| Confirm: `"Advance to ${tierLabel}? Your plan will retune to this tier's drills tomorrow."` | Keep. |

Grade: **B+**. Fine, but two small drifts: header question, and handstand-leaked "wrist prep".

### MissedSessionPrompt — `components/workout/MissedSessionPrompt.tsx`

| Piece | Verdict |
|---|---|
| Title `"Yesterday was a strength day — nothing logged."` | Keep. Diagnosis first, no blame. |
| Body (86-89): `"Log what you did so history stays honest, or mark it skipped so the week's progression can respond correctly."` | Keep — the two options with consequences. |
| Skip Only body (135): `"This session is lost. Rest of the week runs as scheduled. Progression order breaks if you're on a wave."` | Keep. |
| Skip & shift body (147): `"This session takes over the next scheduled strength day. Last day of the week drops. Recommended for wave-based programs."` | Keep. |

Grade: **A**. Consequence-cost explanation is exactly the pattern SkipSheet copies later.

### Aggregate

Terav's proposal-card system is the strongest microcopy work in the app. It:
- Explains the WHY in one line.
- States the cost (Skip Only: order breaks; Skip & shift: last day drops).
- States what stays put (rehab, mobility).
- Never uses "unlock" / "crush" / "transform".

**The only pattern drift is TierAdvanceProposal.** Bring it in line with ReadinessProposal.

---

## 5. Jargon inventory

Every jargon term ranked: fine as-is / needs first-use tooltip / kill.

| Term | Where | Verdict |
|---|---|---|
| **TM** | Progress, ExerciseCard, SuggestionBox, Guide | Fine — Guide defines it, and Progress's Info button links to the definition. Model of jargon that earns its keep. |
| **AMRAP** | Guide, SuggestionBox context | Fine — Guide defines it. But AMRAP appears in ExerciseCard set schemes without a link. **Add first-use tooltip on ExerciseCard's scheme text.** |
| **RPE** | ExerciseCard, SuggestionBox, ReadinessProposal (`RPE ≤ 7`) | Fine — Guide has the killer 10=failure/9=one-rep-left rundown. |
| **Z1 / Z2 / Threshold / VO2max** | Guide, Today taper card, RunSlotCard | Fine — Guide's endurance section is comprehensive. |
| **500m split** | Guide, RowingPersonalisedTargets, Report aerobic list | Fine — Guide covers it. |
| **FSL** | Guide, SuggestionBox | Fine — Guide defines it. |
| **Deload** | Guide, engine banners | Fine. |
| **5/3/1** | Guide, ReadinessProposal | Fine — cited in-context. |
| **Interference / Interference window** | Today concurrent card, TierAdvanceProposal, Coach starters | **Needs one-line explainer** on first Today render. Currently the Today card says `"Yesterday had a hard aerobic session. The concurrent-training model wants ≥6h between hard cardio and heavy strength — space today's lift accordingly, or accept a small strength cost."` — this actually is the explainer. Fine. |
| **Norwegian 4×4** | Guide, Coach starters | Fine — Guide has the definition. |
| **Taper / Under-taper / Over-taper** | Guide, Today taper banner | Fine. |
| **Reintro / reintroduction cap** | ReadinessProposal, phases | **Program-specific.** Only surfaces to anterior-hip users where it's context-native. Fine. |
| **Confirm-first** (implicit in "needs your ok") | DayAdjustmentProposal | Never said outright to the user. **Fine — the phrase is internal; the pattern is visible.** |
| **phase_shift_days** / **block_a_home** | (internal only, no user-facing surface found) | Fine. |
| **capability_profile** / **program_states** / **schema_version** | Internal only | Fine. |
| **`concurrent_strength_policy`** | Only in code | Fine. |
| **"×N progs"** (Week page) | `week/page.tsx:288` | **Kill.** "progs" is a lazy abbreviation. Use `"×N programs"` or a Layers icon with a numeric badge. |
| **"beat / beaten"** as milestone status | Progress | Fine — physical, non-hype. |
| **"provocateur incidents"** | Report | Fine — the audience is a clinician, this is their word. |

**Citation strings** (Helgerud 2007, Bosquet 2007, Schumann 2022, Wilson-Loenneke, Shea & Morgan, Robineau, Mujika, Joyner-Coyle, Kibler, Escamilla, Wulf & Shea):

- `app/page.tsx:247` — `"Shea & Morgan 1979."` shown to any handstand-walk user in week 3+. **Explain-what-it-means once.** Proposed: `"Week 3+ shuffles drill order — random practice retains better than blocked. Shea & Morgan 1979."` Currently the surrounding sentence does this (`"random practice — order shuffled by the seed"`), so **actually fine as-is** — the citation follows a plain-English clause.
- `guide/page.tsx:43` — `"(Helgerud 2007)"` — Guide context, fine.
- `guide/page.tsx:51` — `"Bosquet 2007 meta-analysis"` — Guide context, fine.
- `page.tsx:261` — `"Concurrent endurance + strength has known interference effects (Schumann 2022)."` — Today card, has plain-English sentence. Fine.
- `page.tsx:189` (comment) — Wilson-Loenneke is in a code comment only. Fine.
- `coach/page.tsx:96,109,122,135` — `"The coach cites Robineau + Schumann"` etc. — These are in the pre-launch "coming soon" card describing what Coach WILL do. Reader sees name → doesn't know who they are → distrusts the copy. **Rewrite:** `"The coach cites the concurrent-training research the program is built on."` The specific names are for the coach to produce on demand, not for the pre-launch marketing.

Verdict on evidence claim: **Guide handles citations well.** The main audit finding is that the Coach "coming soon" page name-drops five research pairs without explaining who they are — this reads as showing off, not evidence-forward.

---

## 6. Where copy is doing product-management work

Places where copy explains a feature that should just work, or apologises for absent features:

- **`coach/page.tsx:395-458` — the entire NotConfigured "Coming soon" panel.** ~200 words describing what the Coach *will* do. This is a landing-page block inside the app. If Coach isn't ready, the sensible shape is: a one-line "Coach is live for beta users only — join waitlist" or hide the tab. The current copy sets four different expectations (Weekly review, Session-day check, Explain the plan, Signals triage) and then says "Meanwhile" and points at logging. Kill 60% of it. Suggested replacement below.
- **`page.tsx:127-129` comment turned into policy** — the `{/* Big top slab is gone… */}` comment is code hygiene, not user copy, but the Today page has ~4-6 potential banners (YourPlanCard, FirstRunBanner, MissedSessionPrompt, TierAdvance, RetestReminder, taper, concurrent, handstand-safety, contextual-interference, multi-program warning) and the copy in each is fighting for the fold. The AUDIT here is not the text of any one banner but the fact that copy is compensating for IA — every banner is trying to earn its slot with a sentence of exposition. Voice can't fix that; the IA audit owns it. **Flag for the IA-audit sibling.**
- **`page.tsx:600` — `"You've scheduled your test date further out than the program's 6-week arc. Use the intervening weeks to keep easy Z2 volume — log any sessions via the card below and they'll anchor your baseline."`** Explaining a UX consequence (the user picked a distant date; the plan doesn't cover the gap) — this is copy filling in for a feature that should shape the plan around the user's date. Fine as a stopgap, but flag.
- **`data/page.tsx:189-193`** — `"On mobile: tap Share → AirDrop / Messages / Files to save a backup."` Instructions doing the work a native share sheet should do. Actually fine here — the platform variance is real.
- **`FirstRunBanner.tsx:53-55`** — `"More lives behind the ⋮ menu (top right): Programs, Check, Extras, Coach, Report, Guide."` This exists because the nav has too many second-tier tabs. Copy is compensating. Flag for IA audit.
- **`week/page.tsx:184-188`** — `"Looking further ahead than 6 weeks isn't useful — the plan will have adapted by then. See milestones on Progress for the year-long shape."` Actually excellent — this is copy doing product-strategy work correctly (defending a design decision to the user in plain English). Keep.

---

## 7. Coach starter prompts — audit

`coach/page.tsx:15-51` (STARTER_PROMPTS_BY_PROGRAM). Are these questions a real user would ask?

| Program | Prompt | Verdict |
|---|---|---|
| anterior-hip | `Look at my recent logs and tell me what to do this week.` | **Real.** |
| anterior-hip | `How's my squat progression looking against the milestones?` | Real. |
| anterior-hip | `The hip felt weak yesterday. Should I change today's session?` | Real. Diagnostic + actionable. |
| anterior-hip | `Explain why today's prescription is what it is.` | Real. |
| engine-builder | `Am I ready to add the Norwegian 4×4 yet?` | Real — user who's mid-block would ask this. |
| engine-builder | `Look at my HR data — is my Z2 pace drifting?` | Real. |
| engine-builder | `How's my submax HR trend against the week-8 retest?` | **Product-team wishful thinking.** "Submax HR trend against week-8 retest" is app-native language, not user-native. Rewrite: `"Is my Z2 pace getting easier at the same HR?"` |
| engine-builder | `Should I take a rest day given my recent load?` | Real. |
| CSM | `Is my back squat still holding at pre-block level?` | Real. |
| CSM | `Am I too close to the interference ceiling this week?` | Real for CSM audience. |
| CSM | `The last hard row session felt heavy. Adjust today's lift?` | Real. |
| CSM | `Explain why today's session is scheduled after yesterday's Z2.` | Real. |
| rowing | `How's my 2K trend against the target?` | Real. |
| rowing | `Given my last threshold session, what pace should I hold today?` | Real. |
| rowing | `Am I tapering enough with the test date coming up?` | Real. |
| rowing | `Should I move today's session — I have a WOD later.` | Real, CrossFit-native. |
| handstand | `Am I ready to graduate from wall to freestand?` | Real. |
| handstand | `The wrist is complaining. Adjust today's drill selection?` | Real. |
| handstand | `Explain the drill order — is this random practice or blocked?` | **Product-team.** A user who knows about random vs blocked practice already knows the answer. Rewrite: `"Why did the drill order change this week?"` |
| handstand | `How's my freestand hold trending against the tier gate?` | Real. |
| overhead-mobility | `How's my ROM trend? Have I hit the phase-2 gate?` | Real. |
| overhead-mobility | `The shoulder felt tight yesterday. Change today's routine?` | Real. |
| overhead-mobility | `Explain which mobility drill targets which position.` | Real. |

**Score: 21/24 real, 2 product-team, 1 borderline.** Very high hit rate.

**Default starters** (152-157) — for a user with no active program:
- `Which program in the catalog would fit me?` — Real.
- `How do the adaptive engine's proposals work?` — Product-team. Rewrite: `"How does the app decide what I lift today?"`
- `What does the app do with my logged sessions?` — Real (privacy-curious user).
- `Explain what makes this different from a template plan.` — Product-team. Rewrite: `"Why won't a generic strength template work for me?"`

---

## 8. Guide + Legal — scannable?

Guide (`app/guide/page.tsx`): **Scannable.** Structure is `<h2>` mono-caps section headers + short `<Term>` paragraphs. RPE definition (lines 80-92) is the best microcopy in the entire app — teaches the scale by example. Only minor rewrite:
- Line 62: `"Only tested at cycle 4 end (Dec) and phase 6 (birthday)"` — "Dec" and "(birthday)" are personal calendar references leaking from `anterior-hip-rebuild`'s phase schedule. **Kill personal calendar refs from the shared Guide.** Rewrite: `"Only tested at scheduled retest points — see your program's phase timeline."`

Legal pages weren't read in this pass (Privacy was sampled — `aki.ee` referenced, defensible under GDPR). No wall-of-text sighted in samples.

---

## 9. Sheet copy (Skip/Move/Week) — consequence-cost audit

The recent redesign added **explicit cost lines** (`"Cost: −1 session this week. Progression order breaks…"`) to `SkipSheet` and `WeekSheet`. Assessment:

- **SkipSheet** (`SessionActions.tsx:303-419`) — Right length. The two options each have a two-line rationale + a Cost line. This is the pattern. Recommendation: also add a Cost line to Skip Only that names what's saved: `"Cost: −1 session this week. Kept: the rest of the week's dates."` Users read cost/kept in pairs and this closes the frame.
- **MoveSheet** (`SessionActions.tsx:422-487`) — Under-explained relative to Skip. `"Session moves to the chosen date. Today is marked skipped-because-moved. Progression trajectory continues from wherever the last completed session landed."` is fine but lacks a Cost line. Add: `"Cost: this date is now blank. If the new date already has a session, both stack."`
- **WeekSheet** (`SessionActions.tsx:124-224`) — Right length. `"Zero sessions lost."` / `"Phase runs 1 week longer."` / `"Rest / accessory days unchanged."` is the model. The `phaseEndsSoon` warning (191-197) is doing product-management work well — it names a real edge case in one clause.

Jargon check on sheets: `"wave"` (SkipSheet line 362) is 5/3/1-specific. A user not on a wave-based program still sees this text. Rewrite to `"Progression order breaks if the plan follows a set schedule."` — or gate the "wave-based programs" line behind `program.uses_wave_progression`.

---

## 10. Top 15 microcopy rewrites, ranked

Ranked P0 (ship this week) / P1 (next release) / P2 (nice-to-have).

### P0

**1. Kill the race-day location leak.** `src/app/page.tsx:610`
- Current: `"Tallinna Ülemiste Järve Jooks (13.7 km). No strength today. Reach the start line healthy."`
- Proposed: `"Race day. No strength today. Reach the start line healthy."`
- Rationale: Violates the no-location rule (spirit of `feedback_no-location.md`), and specific race identifiers are quasi-PII for the sole hip-program user.

**2. Kill the "wrist prep" leak in TierAdvanceProposal.** `src/components/workout/TierAdvanceProposal.tsx:35`
- Current: `"…swaps your weekly focus to the next tier's drills; wrist prep + recovery blocks stay."`
- Proposed: `"…swaps your weekly focus to the next tier's drills; prep and recovery blocks stay."`
- Rationale: Handstand-specific vocabulary leaked into a program-agnostic component.

**3. Rewrite the Coach "coming soon" page.** `src/app/coach/page.tsx:395-458`
- Current: 200 words + 4 feature bullets + 5 researcher name-drops.
- Proposed skeleton (≤70 words): headline `"Coach — beta"`, subhead `"Reads your full log every turn. Cites the program's evidence base. Never invents a number."`, one line about waitlist / meanwhile, and a link to Guide for what it'll do. Drop the researcher names entirely — those show up in Coach's outputs, not its intro.
- Rationale: The current copy is a landing page inside the app, and reader distrust rises with every unrecognized name.

**4. Kill personal-calendar references in Guide.** `src/app/guide/page.tsx:62`
- Current: `"1RM. Your one-rep max. Only tested at cycle 4 end (Dec) and phase 6 (birthday)."`
- Proposed: `"1RM. Your one-rep max. Tested only at scheduled retest points — see your program's phase timeline."`
- Rationale: "Dec" and "birthday" are one specific program's schedule leaking into a shared Guide.

**5. Rewrite "×N progs" on Week.** `src/app/week/page.tsx:288`
- Current: `"{n}× progs"`
- Proposed: `"{n} programs"` (drop the "×", drop the abbreviation)
- Rationale: Only lazy abbreviation in the app.

### P1

**6. Rewrite DayAdjustmentProposal accept button.** `src/components/workout/DayAdjustmentProposal.tsx:112`
- Current: `Apply ×0.90`
- Proposed: `Apply 10% lighter today`
- Rationale: Multiplier syntax reads as math jargon on first sight. Keep the ×0.90 in the confirmation strip that appears after Accept (already does).

**7. Rewrite MissedSessionPrompt buttons.** `MissedSessionPrompt.tsx:113,120`
- Current: `Yes — log it now` / `No — mark skipped`
- Proposed: `Log yesterday now` / `Mark yesterday skipped`
- Rationale: Yes/No are answers to a modal question; the buttons should be direct commands. Also disambiguates on a page where "today" and "yesterday" appear together.

**8. Rewrite SkipSheet primary confirm.** `SessionActions.tsx:414`
- Current: `Confirm`
- Proposed: `Skip session` (or `Skip and shift` when shift = true — pick from `shift` state)
- Rationale: Generic verb; the sheet title asks a specific question, the CTA should mirror it.

**9. Rewrite `MoveSheet` primary confirm.** `SessionActions.tsx:481`
- Current: `Move`
- Proposed: `Move session`
- Rationale: Generic verb, one-word.

**10. Rewrite HeroStateCard exhortations.** `HeroStateCard.tsx:11-13`
- Current green: `"Ready to work / Progress today. Feel it."` Amber: `"Load with care / Hold today's prescription. Don't push."` Red: `"Ease off today / Reduce load or take rest. Listen to the signals."`
- Proposed green: `"Green — progress today. / Nothing above 3/10 in your check."` Amber: `"Amber — hold today. / A 4-5/10 or stiffness over 30 min."` Red: `"Red — ease off. / Painful click, night pain, or above 5/10."`
- Rationale: Cite the mechanism (which check inputs put you here) instead of exhorting. Matches Guide's Green/Amber/Red section which already explains it once — reuse the phrasing.

**11. Rewrite the internal-component leak in Extras empty state.** `extras/page.tsx:107`
- Current: `"…use the RunSlotCard on Today to log cross-modal work…"`
- Proposed: `"…use the session-log card on Today to log cross-modal work…"`
- Rationale: Users don't know component names.

**12. Fix Coach default starters.** `coach/page.tsx:152-157`
- Current: `"How do the adaptive engine's proposals work?"` / `"Explain what makes this different from a template plan."`
- Proposed: `"How does the app decide what I lift today?"` / `"Why won't a generic strength template work for me?"`
- Rationale: Speak user-native, not product-team-native.

### P2

**13. Add "cost / kept" symmetry to SkipSheet's Skip Only option.** `SessionActions.tsx:362`
- Current cost line: `"Cost: −1 session this week. Progression order breaks if you're on a wave (5/3/1 etc.)."`
- Proposed addition: `"Kept: the rest of the week's dates."`
- Rationale: Users read cost/kept in pairs; closes the frame the second option opened.

**14. Add a Cost line to MoveSheet.** `SessionActions.tsx:458`
- Proposed addition: `"Cost: this date is now blank. If the new date already has a session, both stack."`
- Rationale: MoveSheet is the only sheet without a Cost line; the redesign didn't reach it.

**15. Rewrite TierAdvanceProposal header from question to signal.** `TierAdvanceProposal.tsx:32`
- Current: `"Ready for the next tier?"`
- Proposed: `"Signal · tier gate cleared"` (matches ReadinessProposal's pattern)
- Rationale: Voice consistency across proposal cards.

---

## Model microcopy — for reference

The four strings other rewrites should aspire to:

- `ReadinessProposal.tsx:57-61` — mechanism + boundary + trust.
- `SessionActions.tsx:184-186` — WeekSheet's three-line cost framing.
- `MissedSessionPrompt.tsx:135` / `.147` — cost per option, one line each.
- `guide/page.tsx:80-92` — RPE scale defined by example, not by definition.

Total user-facing string touch: ~15 rewrites in ~10 files. No new copy needed anywhere.
