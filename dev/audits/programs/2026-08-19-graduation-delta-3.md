# DELTA-3 — Post-graduation experience audit (persona-graduate)

**Persona:** `tests/e2e/artifacts/personas/persona-graduate/` — engine-builder, foundation tier, 64 days simulated, active date 2026-08-19 (8+ days past the last phase `ends: 2026-03-01`, remapped to user's real 2026-06-16 start → last phase remapped ends ~2026-08-10).

## 1. Verdict

**It is technically the end, but not intentionally so.** Today renders a single-card graduation surface with two CTAs and an "End this program" link; the retest delta is real and correctly displayed. Every other surface in the app — Week, Progress, History, Profile, Programs → engine-builder — is oblivious to graduation and continues to treat the program as ACTIVE, so the app as a whole does not honor its own "arc ends" contract. The founder's ambiguous "is it the end?" is best answered: **the arc ends on Today, but nowhere else — and the one place it does end offers no path to Block 2 despite the block existing in the catalog.**

## 2. What renders on Today post-graduation

Cite: `tests/e2e/artifacts/personas/persona-graduate/text/01-today.txt:1-29` and `dom/01-today.html`.

Rendered content (mobile), in order:

- "GREEN · Progress load. Nothing above 3/10 in your check." — `text/01-today.txt:8-9`
- "YOU FINISHED / Engine composite (Block 1)" — `text/01-today.txt:11-13` (from `GraduationCard` in `next-app/src/app/page.tsx:665-666`, `programName` resolves to `program.program_goal.display_name` ≈ "Engine composite (Block 1)")
- "9 weeks logged. Nice." — `text/01-today.txt:15` (from `page.tsx:667-671`; 64 days ÷ 7 = 9)
- "WHERE YOU LANDED / Submax HR at pace-5 (row 2:00/500m) / 138 bpm / -3 bpm" — `text/01-today.txt:17-21` (rendered from `displayable` list at `page.tsx:673-695`)
- "RETEST — LOG YOUR NUMBERS" (link → `/progress`) — `text/01-today.txt:22`, `page.tsx:702-707`
- "PICK YOUR NEXT PROGRAM →" (link → `/programs`) — `text/01-today.txt:23`, `page.tsx:708-713`
- "End this program" (opens ConfirmSheet) — `text/01-today.txt:24`, `page.tsx:715-721`

Suppressed correctly (comments cite this at `page.tsx:185-247`):

- ProposalStack, SignalsStrip, RetestReminder, phase readout — hidden by `!isPastProgramEnd(...)` guard (`src/lib/engine/schedule.ts:98-107`).

Only one displayable metric renders. The Resting HR retest is authored in the program but the persona has no reading logged, so it is quietly dropped by the `metrics.filter((m) => m.supported && m.current != null)` filter at `page.tsx:657` — meaning the "Where you landed" section shows a single row even though the program expected two headline metrics.

## 3. "Is it the end?" — answered per surface

### Block 2 suggestion — MISSING (biggest gap)

The manifest ships a real `engine-builder-block-2` program (`public/data/programs/manifest.json:244-249`; slug `engine-builder-block-2`, 10 wk). The Block 1 JSON explicitly references the arc: "Block 2 of the 3-block engine transformation" (`public/data/programs/engine-builder.json:5, 11`).

Yet `GraduationCard` never links to it. The next-program CTA at `page.tsx:708-713` is a generic `Link href="/programs"` — it dumps the user in the catalog and lets them re-find their own arc's next block. On the catalog screen for persona-graduate, Block 2 is listed as one of eight programs, tagged PROVISIONAL, no visual hint that "this is your next block" (`text/06-programs.txt:80-87`). This is the single biggest miss in the graduation experience.

### Different-program suggestion — GENERIC ONLY

The `Pick your next program →` CTA lands at `/programs` (`page.tsx:709`). No filter, no "based on your tier / adherence" hint, no suggestion. On landing at Programs, engine-builder Block 1 still displays with an `ACTIVE` badge (`text/06-programs.txt:63-64`, `dom/06-programs.html`), which contradicts the graduation state on Today. Persona-graduate has not signed the program off, so from `program_states.engine-builder`'s perspective it is still their active program (`final-store.json`: `active_program_started_at: 2026-06-16`, `program_states.engine-builder: { tier: "foundation" }` — no `graduated_at`, no `ended_at`, no completion marker).

### Survey / feedback — DOES NOT EXIST

No prompt anywhere. Not on Today (`text/01-today.txt`), not on Progress (`text/05-progress.txt`), not on Report (`text/10-report.txt`), not in `GraduationCard` (`page.tsx:637-737`). There is no "how did the arc go?", no 1-10 rating, no free-text field, no "did you PR / hit target?". The engine builder's citation-heavy positioning would justify collecting this, and future adaptive logic almost certainly needs it.

### Retest report / shareable summary — WORKS AS A GENERIC REPORT, NOT AN "ARC SUMMARY"

The Report page renders (`text/10-report.txt:1-159`) with:

- Range: 28 May → 19 Aug 2026 (12 weeks, wider than the arc)
- Overview counts: 84 days in range, 64 logged, 21 endurance sessions, 64 green mornings (`text/10-report.txt:16-40`)
- Retest metrics section with baseline 141 bpm → current 138 bpm, Δ −2.6 bpm, target −5 / stretch −10 (`text/10-report.txt:42-78`)
- Weekly aerobic volume table, 9 weeks (`text/10-report.txt:80-101`)
- Full aerobic session log by session type (`text/10-report.txt:102-152`)

This is a solid *log* summary, but it is **not** an arc report. There is no header framing "You finished Engine Builder Block 1", no summary of `block_1_targets` (VO2max change 5-8%, resting HR −5 to −10, submax HR drop 3-8 — `public/data/programs/engine-builder.json:19-32`) with pass/fail against the persona's actuals, no explicit "target hit / partial / miss" verdict per metric. A mid-arc user and a graduated user see the same layout.

The submax HR delta of −2.6 bpm sits **inside** the target band of −3 to −8 (target −5), so this persona is arguably at "target hit — lower bound." Neither the Progress panel (`text/05-progress.txt:33-49`) nor the Report says so.

### Extension / repeat option — DOES NOT EXIST

No "repeat this arc," no "extend by 4 weeks," no "hold at this tier for another cycle." The only reset mechanism is the destructive "End this program" (`page.tsx:715-721`) which drops the user back to the catalog with no arc history annotation.

## 4. Dead-end check — per surface

| Surface | Post-graduation behaviour | Cite |
|---|---|---|
| **Today** | GraduationCard shown; suppresses proposals, phase readout, retest reminder. Feels like *an* ending, not *the* ending. | `text/01-today.txt`, `page.tsx:186-247, 356-357` |
| **Week** | Week 8 view still labeled "Week 8 — deload and retest," schedule shows Z1 sessions Mon/Sun + "Block 1 retest" Thu — as if the arc is still live. No graduation banner. Arrow lets user page forward but there are no future weeks with content. | `text/02-week.txt:9-56` |
| **Coach** | "Coming soon" placeholder unchanged. Does not acknowledge graduation. | `text/03-coach.txt` |
| **History** | Activity heatmap "Last 8 weeks · 0 strength · 52 active total"; log rows show "0 done" for every recent day because the persona's logged sessions predate the current window and are not surfaced as arc-complete. No "you did it" framing anywhere. | `text/04-history.txt:7-27` |
| **Progress** | Renders retest panel as if mid-arc. "CHECK AT WEEK 8" label with baseline / current / Δ, target −5 / stretch −10 shown but no verdict. No arc-complete banner. Second metric (resting HR) shows LOG BASELINE — a nudge to record intake data at the *end* of the arc, which is temporally wrong. | `text/05-progress.txt:30-59` |
| **Programs catalog** | engine-builder still tagged `ACTIVE`, alongside Block 2 listed generically without a "next-in-arc" hint. | `text/06-programs.txt:63-71, 80-87` |
| **Programs → engine-builder detail** | "This is your current program" banner still renders (`ProgramPreviewClient.tsx:317-339`). Buttons are "Go to Today" + "End program." No "you finished this — pick Block 2" alternative. | `text/07-programs-active.txt:30-33` |
| **Profile** | Lists "Engine Builder — Block 1: Base / 8 weeks · beginner" as the sole item with no state annotation. Graduation invisible. | `text/08-profile.txt:8-10`, `dom/08-profile.html` |
| **Report** | Same layout as a mid-arc report — no "arc complete" framing. | `text/10-report.txt` |
| **Extras** | Still lists Block 1's aerobic blocks as available (Z2 SS, threshold, VO2max, retest) — logging to today. Fine. | `text/12-extras.txt` |

Only `page.tsx` is graduation-aware (`grep -n isPastProgramEnd`, sole call site in `src/app/`). Every other route is blind.

## 5. Landing → app promise alignment

The landing promises "focused-improvement, not a full plan" — implicit that arcs end. The app *does* end the arc for the primary "Today" surface, so the top-level promise is honored at first read. But it fails the arc's implied second half: an ending that feels intentional, not "the plan is over, good luck." A user finishing Block 1 and returning to the catalog to encounter their finished program still tagged ACTIVE and Block 2 listed generically with no "this is your next block" cue does not feel like the arc had a *destination*, just a stop.

## 6. Missing — what SHOULD exist but doesn't

Ordered by user-visible impact:

1. **Block-2 pointer (P0).** Engine-builder authors declared the 3-block arc and shipped `engine-builder-block-2`. GraduationCard must know that (a) this program has a `next_block_slug` (or the manifest infers it from name) and (b) surface a primary CTA "Start Block 2 (Volume) →" alongside the existing "Pick your next program" fallback. Rowing, Handstand Walk, Overhead — programs without a next-in-arc — degrade to today's catalog link.
2. **Arc verdict (P0).** Report and Progress must render `block_1_targets` vs actuals as a pass/partial/miss verdict. The persona hit target on submax HR — the app should say so with a green check, not force the user to squint at "-2.6" and know the target was −3 lower bound.
3. **"Graduated" state on Profile + Programs catalog + Programs detail (P0).** Once `isPastProgramEnd` is true, the label ACTIVE should flip to GRADUATED (or "You finished — 2026-08-11" or similar). The `ProgramPreviewClient.tsx:317-339` "This is your current program" banner must recognise the graduated state and change to "You finished this program on [date]" with "Start Block 2" + "Repeat this arc" + "Explore programs" as options — not "Go to Today" + "End program."
4. **Retest survey (P1).** One-question qualitative prompt: "How did the block feel? [Too easy / Right / Too hard / Injured]" plus optional 1-2 line note. Store on `program_states.[slug].graduation.feedback`. Needed for adaptive tier promotion in future blocks and to bootstrap the VERIFIED social-proof tier the catalog already advertises.
5. **Extend / repeat (P1).** Explicit "Give me another 2 weeks of Phase 4" or "Repeat this arc at foundation" affordance. Without this, the only progression is Block 2 (which is one step up) or "end program" (which is destructive).
6. **Week view respect (P2).** Post-graduation, Week should either lock forward navigation or render a "Program complete — new arc?" state instead of blank rest days.
7. **Progress "arc complete" banner (P2).** Change "CHECK AT WEEK 8" to "WEEK 8 — RESULT" and lock the delta as the final value with a target-verdict badge.

## 7. What works — celebrate

- GraduationCard exists, is graduation-triggered, suppresses noise. `page.tsx:186-247, 356-357` guard three separate mid-arc surfaces from bleeding through, which is the right shape.
- Retest evaluator returns real data — the persona's 21 aerobic sessions were consumed and produced a clean baseline → current → Δ tuple (`text/05-progress.txt:33-49`, `retest-evaluator.ts:219-256`).
- Comments in `page.tsx:242-246` show intentional design: "the graduation experience is one card, not a menu." That principle is worth keeping; the fix is to make the one card actually terminal.
- Weeks-in calculation is honest: 9 weeks reads correctly for a 64-day run (`page.tsx:649-655`).
- "End this program" as a small, non-primary link is the right hierarchy — it is a destructive last resort, not the CTA.
- Block 2 exists as a real program in the manifest, so the fix in §6.1 is a wiring change, not a content authoring effort.

## 8. Recommended fixes — minimum to feel intentional

Ordered. Each is a small, discrete change.

1. **Add `next_block_slug` to engine-builder + rowing-2k-test-prep manifests, wire GraduationCard.** Detect via `program.goals.arc.next_slug` or a new manifest field. When present, primary CTA becomes "Start Block 2 (Volume) — 10 wk →". When absent, keep the generic catalog link. Effort: ~1 hour.
2. **Add `graduated_at` to `program_states[slug]`.** Set on first render of GraduationCard (or on ConfirmSheet "End program"). Everywhere `active_program` or `active_program_started_at` is read to display ACTIVE, first check for `graduated_at` and display GRADUATED instead. Sites: `ProgramPreviewClient.tsx:317-339`, `profile/page.tsx` program list, `programs/page.tsx` catalog badge. Effort: ~2 hours.
3. **Arc-verdict badge in `GraduationCard.displayable` list.** Compute `withinTarget(current, baseline, target, stretch)`, render "target hit" / "on track" / "below target" chip. Same block also lands in Report. Effort: ~1 hour.
4. **Optional 2-tap feedback prompt.** Modal on first graduation render: [Too easy / Right / Too hard], skippable. Persist to `program_states[slug].graduation.feedback`. Effort: ~2 hours.
5. **Week / Progress / Report graduation banners.** Cheap: reuse `isPastProgramEnd` guard and prepend an "Arc complete — see summary on Today" callout. Effort: ~30 min total.
6. **"Repeat this arc" secondary CTA on GraduationCard.** Resets `active_program_started_at` to today for the same slug. Keeps history intact. Effort: ~30 min.

Delivering just items 1-3 (≈4 hours) converts "the plan is over, good luck" into a defensible arc closure with a clear next-arc handoff — enough to answer the founder's question with "yes, it's the end, and the app knows it."

---

*Read-only audit. All citations point to `next-app/src/`, `next-app/public/data/programs/`, or persona artifacts under `next-app/tests/e2e/artifacts/personas/persona-graduate/`.*
