# Marcus — 26, CrossFit, Copenhagen. Reviewing program-v2.pages.dev on iPhone.

Hevy is the yardstick. If I can't log a set faster than I can there, I'm out.

## 1. First impression

I opened the app and the first thing it asked me was **"How's the low back this morning?"** — with a 0–10 pain scale, red numbers on the right, "SETUP 1 OF 3." I'm 26, I deadlift 240, I don't need my training app to ask me if I hurt before it will show me any training. I hit "Skip setup" so hard my thumb printed on the screen.

Second beat: the palette is nice (warm orange on near-black), the type is confident, but I landed on "Rest day — no barbell scheduled" and a nav bar with **seven tabs**: TODAY / WEEK / EXTRAS / CHECK / COACH / PROGRESS / HISTORY. Seven. Hevy has four.

## 2. The session flow — top set + FSL + one accessory

I paged back to Thursday to get a barbell day. Squat 5×5, block pull 5×5, Bulgarian split squat 3×8/side, single-leg RDL, dead bugs. Fine session shape.

The exercise card is dense and good in principle: exercise name, sets × reps prescription, coach note (`3–4 × 5 ramping empty bar to a moderate 5`), current TM, a **SUGGESTED TODAY** box with the target load, a **plate visualizer** showing what plates go on the bar per side, a "last session" note, and a 5-row **set matrix** with PREV/RX / WEIGHT KG / REPS / RPE.

**Logging one set:** tap weight → keyboard → 3 digits → tap reps → 1 digit → tap RPE → 1 digit. That's three focus taps + typing per set. No slider, no swipe-to-complete. The set commits on blur — no explicit "log" button per row, which is actually clean. **BUT** the row does not visually mark itself "complete" the way Hevy does with the row filling green. I typed a set and the only feedback was the numbers sitting there. In Hevy I know a set is banked because the row goes green and the "next set" cue advances.

**Timed vs Hevy, five working sets of squat:**
- Hevy in my head: swipe right on row 1 (auto-copies last), tap RPE. ~2s per set once you're grooved. 5 sets in ~10–15s of interaction.
- This app: 3 field taps × 5 sets = 15 taps + typing. Roughly 30–40s of interaction for the same 5 sets. Not terrible. **Not Hevy.**

The one thing this app does that Hevy doesn't: the **plate visualizer** ("25 + 1.25 kg /side → 72.5 kg") next to the suggested weight. Genuinely helpful for pull day when I'm loading small plates. Boostcamp doesn't do this either. Point to the app.

**FSL / working sets:** rows 2–5 sit in the matrix pre-filled with blank fields. Row 5 has "100×5" in the RX column as a hint. Fine. But: **no "copy previous set" gesture.** In Hevy I swipe → done. Here I re-type 100, 5, 7 for each set. Four sets × three fields = **12 taps of pure repetition** when 4 of them should be swipes. This is the single biggest speed killer.

**Accessory (Bulgarian split squat, 3×8/side):** same 3-column matrix. Note the "L / R" chips at the top — good, someone thought about unilateral movements. But there's no per-side entry — just three rows for three sets, so you're mentally aggregating both sides into one row. Hevy handles per-side explicitly if you toggle it. Small L.

**The scary moment.** I typed 110 kg into row 1, then hit reload. The next visit's **SUGGESTED TODAY** was **"500 kg × 5"** with a plate visualizer showing ten 25kg plates plus a 15 on each side — because my earlier scripted probe had typed 500 as a weight. Underneath: `→ est 1RM ~1333.5 kg · suggested TM 1133.5 kg (+1023.5)`. **No sanity ceiling.** The plate viz will happily draw a bar that would kill a person. In a real app this is embarrassing; on a "serious lifter" app it's disqualifying. Cap plausibility to something like 3× bodyweight or user-set max. Even a warning modal at >2× current TM would save face.

## 3. What's genuinely good — three things

1. **Plate visualizer beside the suggested load.** Hevy doesn't do this. Boostcamp doesn't do this. It's the one thing here I'd want ported over.
2. **The Progress tab's TM section with milestones anchored to a birthday waypoint.** Trajectory targets like "TM 145 kg by 2026-12-20" with days-away counters is a proper long-horizon view. 5/3/1 apps usually stop at "increment 2.5 kg." This is thinking further out.
3. **Inline set matrix, not a modal.** Whole session visible at once. Density is right for a lifter — you can see squat, block pull, BSS, SLRDL, dead bug on one scroll. That's how Sheiko templates read.

## 4. What's slow / awkward / broken — ranked

1. **No sanity ceiling on the suggestion engine.** Typo → 500 kg squat suggestion. Fix: cap suggested load at max(prevBest * 1.10, TM * 1.15). Reject inputs > 3× bodyweight without a confirm.
2. **No "copy previous set" swipe.** Every FSL row is 3 manual entries. Fix: swipe-right on a row copies the row above; tap the row number to mark complete. That's the Hevy gesture.
3. **No visual "set complete" state.** Rows look identical whether logged or not once numbers are in. Fix: fill background green (or your `green` state color) on blur when all three fields are populated.
4. **Onboarding modal is a pain scale.** For 100% of new users the first interaction is a symptom score. Even for the intended user (the rehab persona) this should be dismissible without labeling itself SETUP 1 OF 3.
5. **Seven-tab nav.** TODAY, WEEK, EXTRAS, CHECK, COACH, PROGRESS, HISTORY. WEEK could collapse into TODAY (page arrows already exist). CHECK is a modal, not a tab. COACH is currently a 5-step deploy-your-own-Cloudflare-Worker screen (see below). That's 3 tabs I'd kill.
6. **The Coach tab, as shipped, is broken to end users.** It literally shows `cd worker && npm install` / `wrangler secret put ANTHROPIC_API_KEY`. That is not shipping. Hide the tab if `NEXT_PUBLIC_COACH_URL` is unset.
7. **"Add set" instead of a swipe-to-append.** Minor, but Hevy just always shows a spare row.
8. **`Set TM` button under the suggestion engine** is unlabeled in context — I don't know if it's committing 1133 kg as my new TM. Terrifying.
9. **Rest timer: nowhere.** Between working sets I want a countdown. Not seeing one is a red flag for anyone running 5/3/1 or Sheiko.
10. **Warmups are not scaffolded.** The card says "ramping empty bar to a moderate 5 (RPE 6–7)" — that's prose, not sets. Give me 4 ramp rows with plate math filled in.

## 5. The collapse / accordion question

Hevy keeps exercise cards **collapsed by default** on the workout screen — you see a stack of chip-sized exercise headers, tap to expand. It's a UX capitulation for people who scroll a lot on long sessions.

This app does the opposite: every exercise is expanded, matrix visible, coach note visible, cues collapsible under a tap. For a **4-lift day I actually like this better.** I can eyeball squat / pull / BSS / SLRDL on one scroll and know what's next. That's what a Sheiko printout gives you.

But for a **big session — 6 lifts + 4 accessories + rehab extras — this design will kill me.** Every exercise card is at least half a screen tall because of the SUGGESTED TODAY box, plate viz, cue chips, and 5-row matrix. Ten cards means ten screens of scroll. Scrolling to find "which accessory am I on" between sets is the enemy of tempo.

**My take:** ship a toggle. Default expanded (this is a strength app, we're not scared of density), but let me tap the exercise header to collapse it to a one-liner once I've finished all sets. Hevy's approach — collapse everything by default and expand on tap — is wrong for a programmed template, right for freestyle logging. This app is programmed, so density-first is correct, but I need to be able to hide the ones I've finished.

## 6. Would I use this daily instead of Hevy?

Not today. Six reasons:

- **The suggestion engine is unsafe** (500 kg squat with cheerful plate art). Fix that or I don't trust the number.
- **No rest timer** and no per-set completion state cost me tempo mid-workout.
- **Seven tabs, three of which shouldn't exist**, one of which literally shows deploy instructions to end users.
- **No swipe-copy for FSL sets.** Three fields × four rows of repetition per lift adds up.
- The whole app is **built around a symptom check** that I don't have to do. The "SYMPTOM VS LOAD" chart on Progress and the "How's the low back this morning?" modal on Today make the app feel like a **PT portal**, not a lifting app. Boostcamp doesn't ask me if I hurt. Neither does Hevy. That framing shrinks the addressable user to one person.
- **The Coach concept is fluff for me unless it does something Hevy doesn't.** Something like "your bar speed is decaying by set — drop the top set 2.5 kg" would be useful. "Reads your full history + clinical context each turn" is not, because I'm not a patient.

**But** — a few things this app does that I'd steal:
- Plate viz next to suggested load.
- Milestone trajectory anchored to a real-world date, not just "next cycle."
- Coach notes stapled to each exercise ("ramping empty bar to a moderate 5"). Boostcamp does this well too; Hevy doesn't.
- The information density on the session view is genuinely closer to how a serious template reads than Hevy's card-per-exercise flow.

If the target user isn't me — if it's someone rehabbing, tracking symptom vs load, taking notes to bring to a physiatrist — then the app is well-thought-out and I'm the wrong reviewer. **But it's marketing itself to serious lifters (the buddy pitched me on it), and to that audience the symptom-first framing plus the unfixed suggestion-engine sanity issue means it stays in the "interesting sidecar to Hevy" bucket for me. Not a replacement.**

Kill: WEEK tab, CHECK tab, COACH tab (until it works), the symptom-vs-load chart on Progress (or hide behind a toggle for lifters who don't want it). Add: rest timer, swipe-copy set, sanity-clamp suggestion, per-row completion state.

Word count check: ~1,200.
