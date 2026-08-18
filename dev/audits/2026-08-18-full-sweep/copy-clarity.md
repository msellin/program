# Copy clarity — 2026-08-18 full sweep

Scope: strings shipped today in the intake wizard, block-object surfaces (Today / Week / Progress / History), the beta feature-flag toggle, the SignalsStrip "Rescheduled session" chip, and the OnboardingRunner crumb.

---

## 1. Top 3 to fix this week (P0)

1. **"programs" as the plural collective on Today reads wrong for a focused-improvement product.**
   `next-app/src/app/page.tsx:321` ("Two programs scheduled today.") and `:455` ("{programCount} programs scheduled today. Skip or move each independently below."). Landing positioning is "pick one focus (an engine, a skill, a lift, a stubborn joint)". A user running Engine Builder + Handstand Walk does not think "I have two programs today", they think "I have two focuses". The word also collides with the `/programs` catalog route where "programs" means the *offerings*, not the *user's active picks*. Rewrite: **"tracks"** consistently. "Two tracks today." / "{N} tracks today. Skip or move each below." Same fix in `PerProgramActions` body (`PerProgramActions.tsx:110`, `:254`) — "Other programs today are unaffected" → **"Other tracks today aren't affected."**

2. **"downshifted" is engineer copy leaking to user surface.**
   `next-app/src/components/history/BlockHistorySection.tsx:28` maps `amber_downshifted` → chip label **"downshifted"**. A founder-first user reads this as either (a) a car metaphor or (b) a bug. The internal engine state is `amber_downshifted` but the user-facing story is "the engine dialed today back because a symptom flag was up." Rewrite chip label: **"eased"** (matches the SignalsStrip vocabulary already used elsewhere; parallel with the traffic-light `green | amber | red` symptom scale). Fallback if "eased" is too soft: **"dialed back"** (two words is fine on a chip). Not "downshifted" — never.

3. **Feature-flag copy leaks the internal name of the rebuild AND scares the user with "on-your-own-risk".**
   `next-app/src/app/profile/page.tsx:321`: **"Flip on-your-own-risk features for early validation."** — reads legal-adjacent and implies the block-object model might break their data. `:333` **"Block-object plan model"** is the internal engineering name and is meaningless to the user. The sublabel is 5 sentences of internal changelog. Rewrite:
   - Header body → **"Preview features that aren't final. You can turn them off anytime."**
   - Label → **"Per-track Skip and Move"** (describes the user-visible outcome, not the data model).
   - Badge → keep **"default on"** but rethink tone (see §2, Profile).
   - Sublabel, 2 sentences max → **"Skip or move each track independently on Today. Also unlocks the per-track dots on Week and the adherence card on Progress."**

---

## 2. Findings by surface

### `IntakeClient.tsx`

- **`:1061` `primaryLabel = isLast ? "Finish" : "Next →"`** — "Finish" collides. This is a multi-program user's active vocabulary: they "finish a session" in the log flow. Wizard finishes should be **"Review"** (they land on `reviewing=true` which shows the tier + override screen, they haven't committed yet). The button that *actually* commits is `:555` "Start program with this tier" — that one is correct. Fix the misleading "Finish".
- **`:1061`, `:1083` arrows in button text** (`← Back`, `Next →`). Screen readers will read "left arrow Back" and "Next right arrow" as literal punctuation. Small buttons already have `min-w-[88px]` / `min-w-[100px]`; the arrow adds noise without clarity. The sticky footer position + button order already telegraphs direction. Drop the arrows. Keep **"Back"** / **"Next"** / **"Review"**.
- **`:945` "Change your answer above to continue."** — persona-recover just honestly answered "yes, shoulder pain when I press overhead." Reading "change your answer to continue" implies the wizard wants a different answer, i.e. wants them to lie. Rewrite: **"This answer stops the program here. Change it above only if you misread the question — otherwise, this program isn't for you today."** Longer but honest. Or shorter and equally honest: **"With this answer we can't start this program. Pick another program, or change the answer if you misread."**
- **`:646` "Short questions so the program starts at the right level. Everything stays on your account — not shared with anyone."** — clean. Passes.
- **`:837` calibration hints render as inline `opt.hint` mono uppercase** (e.g. "Tier A / B boundary"). "Tier A / B" is meaningless to a first-time user. This is source-data prose from `program.json.intake.questions[].options[].hint`; if the data says **"Tier A"** the string will read that. Fix at the data layer (out of scope for this file), but flag it: the runtime rendering here should not be shipped until the underlying hints read "Beginner / Intermediate" or a concrete cue ("~10 sec wall hold"). Currently the wizard exposes engineering tier IDs to the user. Defer to `app-audit-N-data`? — or fix the data files. Either way the string as-rendered here is a P1.
- **`:966` "optional" badge** on Physical tests screen — clean. Passes.
- **`:970` "Doing these is not required. If you do, they override your self-report answers when picking your tier. Skip and we use your self-report as a proxy."** — good. Passes. One nit: "self-report" is used twice in one sentence; second instance can be "your earlier answers".

### `OnboardingRunner.tsx`

- **`:108` "How Terav reads you · {step + 1} of {totalSteps}"** — nice. Passes cleanly. Persona-strength won't feel babied; persona-recover won't feel clinical. "reads you" is warm without being sentimental.
- **`:132` "Skip setup" / `:139` "Start" or "Next"** — clean. Two-word max. Passes.

### `ScaleAnchorStep.tsx`

- **`:26` "How the scale reads"** — the label above the tiles works. Persona-recover doesn't get "wrecked / mild / severe" as a clinical assessment; persona-strength gets "fresh / gritty / cooked" per the program's authored anchors. Passes.

### `PerProgramActions.tsx`

- **`:61` `{programName} — skipped today` / `moved`** — "moved" alone is passive and vague ("moved where?"). Since `:64` follows up with "Rescheduled to {date}", the top line is redundant + weaker than the subline. Rewrite: change label from **"moved"** to **"rescheduled"**. Consistent with the SignalsStrip chip "Rescheduled session" already shipped. The verb the user does is **Move**; the state after they did it is **Rescheduled**. Different words for action vs. state is fine and disambiguates.
- **`:65` "Rescheduled to {date} another day"** fallback — the `?? "another day"` is a graceful degrade but a user seeing "Rescheduled to another day" reads it as a bug. If `actual_date` is missing the panel shouldn't render "rescheduled to" at all. Rewrite: when the date is missing, drop the subline entirely (the top line already says "rescheduled").
- **`:93` / `:102` buttons "Move" / "Skip"** — perfect. One word, one action. Passes.
- **`:109` `Skip {programName} today?`** — good but only when `programName` is short. If it's the humanized slug "concurrent strength maintenance" this becomes a 6-word title. Cap at ~25 chars for the interpolation, or use **"Skip this track today?"** and put the program name in the body.
- **`:110` "This program's session on this date is marked skipped. Other programs today are unaffected."** — reads like a system log entry. Rewrite: **"Just this track, just today. Other tracks scheduled today stay."** Same-day skip is what's actually happening; the current copy is written in the passive voice of a state-machine transition.
- **`:184` "Reason (optional)"** with placeholder **"e.g. travelling, tired"** — good. Passes.
- **`:190` placeholder "e.g. travelling, tired"** — persona-strength (senior athlete) might read this as juvenile examples; persona-erratic dismisses forms so the placeholder never gets read anyway. Acceptable. Passes.
- **`:248` "Move {programName}"** and **`:253` "This program's session on {fromDate} moves to the chosen date. Other programs today are unaffected."** — same critique as `:110`. Rewrite: **"This track's session on {fromDate} moves to your chosen date. Other tracks aren't affected."**

### `page.tsx` (Today) — DayHeaderShortcut only

- **`:454-456` "{humanDate}" + "{programCount} programs scheduled today. Skip or move each independently below."** — see P0 #1. Rewrite: **"{humanDate}"** + **"{programCount} tracks today. Skip or move each below."** ("independently" is a filler word; if the button says "Skip whole day" and each row has its own Skip, independence is already implied by the affordances.)
- **`:465` "Skip whole day"** and **`:483` "Confirm skip"** — the flow is: tap "Skip whole day" → button transforms to a "Confirm skip" + "Cancel" pair. This is the classic destructive-action-inline pattern. Both labels are clear. Passes. Nit: "Confirm skip" and "Skip" appearing twice in nearby DOM (this button + the per-track Skip button below) may confuse; consider **"Yes, skip today"** for the confirm. Small nit, not P0.
- **`:321` "Two programs scheduled today. If it's too much, snooze one from Profile."** — see P0 #1 for "programs → tracks". Also: "snooze" isn't a verb this app defines elsewhere. The user removes a program via Profile's X button, which is more permanent than "snooze" implies. Rewrite: **"Two tracks today. If it's too much, pause one from Profile."** — or **"remove one"** if that matches the destructive nature of the Profile action better. Currently the Profile flow does full remove-with-confirm; "snooze" is a misleading verb for it.

### `week/page.tsx`

- **`:196` legend `planned · done · skipped · moved`** — good. Mono uppercase, short. Passes. But **"moved"** as a state label — reconsider per P0 #1 / PerProgramActions note: this reads as "moved to the trash" or ambiguously as "physical movement". Rewrite: **`planned · done · skipped · rescheduled`**. Four segments still fit horizontally.
- **`:344` tooltip `${programName}: ${state}`** — because `programName` is `slug.replace(/-/g, " ")` (`:480`), tooltips read literally "anterior hip rebuild: planned". Persona-recover reads the raw slug. Fix: pass the display name from `program_goal.display_name` where possible, fall back to prettified slug. (This is partially a data-shape fix, but the string composition here should prefer the display name.)
- **`:376` empty right-column meta shows "rest" or "—"** — one-char "—" as the state for missed days is technically fine but reads as "unknown". If the day is genuinely off-plan for all tracks, the row already says "Rest / accessory day" in the body — remove the "—" on the right side; keep only "rest". Reduce visual noise.
- **`:322` "Yesterday had a hard aerobic session. The concurrent-training model wants ≥6h between hard cardio and heavy strength — space today's lift accordingly, or accept a small strength cost."** — dense but the persona (someone running concurrent) is a senior athlete who wants density. Passes. The em-dash construction is fine.
- **`:371` "{contributingProgramCount} programs"** amber badge — same fix as P0 #1: **"{N} tracks"**.

### `PerProgramAdherenceCard.tsx`

- **`:88` "Per-program adherence"** — same "program" → "track" rewrite. Rewrite: **"Per-track adherence"**. Header + `:90` "last 28 days" mono. Clean.
- **`:98` `{r.slug.replace(/-/g, " ")}`** — again shows the raw slug. Same display-name fix as Week.
- **`:101` `{r.done}/{r.total - r.moved} done · {r.adherencePct}%`** — number formatting test: `12/14 done · 86%` reads OK, `0/0 done · 0%` reads as broken. The empty state should not render this row at all (`:47` short-circuits on `blocks.length === 0`, so 0/0 shouldn't happen). But if `blocks.length === moved` (everything rescheduled), the string becomes `0/0 done · 0%` while the bar has a full slate segment. Add a fast-path: if `denom === 0`, render **"All {moved} rescheduled — nothing due yet"** instead of `0/0 done · 0%`.
- **`:132` footer "{X} done · {Y} upcoming · {Z} skipped · {N} moved"** — the terminology drift you flagged. The bar segment is **planned** (`:116`), the footer says **upcoming**. Reader will notice. Pick one. Recommend **"upcoming"** (user-facing, forward-looking; "planned" is engineer-y and matches the state-machine value). Then either rename the bar's aria-label or accept the mismatch is invisible (it's in `role="img" aria-label` at `:107`). Cleanest: update `:107` aria-label to also say "upcoming" not "planned". Same file: `:131` `${r.done} done`, `:133` `${r.skipped} skipped`, `:134` `${r.moved} moved` — see P0 for **moved → rescheduled**.
- **`:140` "Moved blocks don't count as misses — they're rescheduled work."** — good sentence, does its job. Persona-erratic sees this and understands they aren't being punished. Passes. If P0 #1 lands: **"Rescheduled sessions don't count as misses — they're work moved to another day."**

### `BlockHistorySection.tsx`

- **`:28` `amber_downshifted → "downshifted"`** — see P0 #2. Rewrite label: **"eased"**.
- **`:26` `moved → "moved"`** — see P0 #1 corollary: **"rescheduled"**.
- **`:67` "Recent blocks · last 14 days"** — "blocks" is another engineer word. Users don't think of what they did as "blocks", they think of it as "sessions" or "workouts" (per your CLAUDE.md the winning term should be one primary; the codebase uses `block` internally, `session` in copy). Rewrite: **"Recent sessions · last 14 days"**.
- **`:86` `{b.block_template_id}`** — the ID literally shows. Persona-strength sees `block_squat_main`. This is a P0-in-disguise: the History row is unreadable. Fix: resolve to `program.blocks.find(b => b.id === block_template_id)?.name` and run through the `humanBlockName` sanitizer already in Today's `page.tsx:894`. As shipped, this row will read "2026-08-15 · block_hs_wall_hold · done" — that is debug copy in production.

### `profile/page.tsx` — BetaFeatureToggles only

See P0 #3. Additionally:
- **`:334` badge "default on" green** — a badge that says "default on" on an unchecked-by-default UX pattern reads inconsistent. It's *actually* on-by-default and the user unchecks to opt out — so the badge is truthful. But "default on" green on a beta panel implies stability, which contradicts "on-your-own-risk" two lines up. Pick one tone. If the block-object model is safe enough to be default-on, drop the "on-your-own-risk" phrasing (see P0 #3). If it's genuinely risky, don't default it on.
- Sublabel is 5 sentences. Trim to 2 max (see P0 #3 rewrite).

### SignalsStrip — "Rescheduled session" chip

Not read in-file this pass (out of scope directory), but the ambient concept is right: a user landing on a date that only has content because they moved something to it should see **"Rescheduled session"** with a reason line explaining "You moved this from {originalDate}". If the SignalsStrip currently just says "Rescheduled session" without the from-date context, it's under-explaining. Verify → see `app-audit-N-signals` if it's not doing the from-date; otherwise it's clean.

---

## 3. Passes cleanly

- OnboardingRunner crumb (`:108`) — **"How Terav reads you · {N} of {M}"**.
- ScaleAnchorStep label (`:26`) — **"How the scale reads"**.
- PerProgramActions button pair — **"Move"** / **"Skip"**.
- Intake footer body copy at `:646` — plain and honest.
- DayHeaderShortcut's Confirm/Cancel inline destructive pattern (the flow, not the "programs" plural).
- Adherence card footnote (`:140`) — the "moved blocks don't count as misses" line does real work.
- Retest reminder body at `page.tsx:812` — **"You're {N} weeks in. Progress → Insights shows your current retest metrics against baseline and target."** — dense, clear, honest.

---

## 4. Deferred / low-signal

- **`page.tsx:311` "Week {N} · blocked practice — drills in the composed order"** — CI-literature reference "Shea & Morgan 1979" as a mono citation is niche but on-brand for a "cites a study" product. Persona-strength appreciates; personas-recover/erratic will ignore. No change.
- **`page.tsx:246` "Taper week. Volume drops ~45%, intensity holds. This is where the ~3% peak uplift comes from — resist the urge to add sessions."** — the "~3% peak uplift" is a factual claim that should have a citation the way the concurrent-interference block does. Not a copy fix; flag to `app-landing-alignment`.
- **`week/page.tsx:184` "Looking further ahead than {FUTURE_WEEKS} weeks isn't useful — the plan will have adapted by then."** — good honesty. Keep.
- **Placeholder `"e.g. travelling, tired"`** in the Skip reason — fine.
- **`page.tsx:296` "Any sharp shoulder pain during handstand work — end the block, log it on the check page, take rest. Non-negotiable."** — persona-recover will read this well; persona-strength will nod. "Non-negotiable" reads slightly authoritarian but the safety context earns it. Keep.
- Terminology map: **session / workout / block / track / program** — the primary user-facing pair should be **"session"** (a single day's work) and **"track"** (an ongoing focused-improvement arc). "Block" is engineering. "Workout" is unused (good). "Program" should remain only for the *catalog offering* and be replaced by "track" everywhere it refers to *the user's active pick*. Documented as the P0 anchor.
