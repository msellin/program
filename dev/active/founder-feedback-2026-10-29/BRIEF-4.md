# Founder feedback round 4: Record (2026-10-29 evening)

Founder: "Record is probably the weakest link of all." The full session history takes up the bottom; visuals he
doesn't understand; do we need that much? GOWOD shows time worked this week or sessions done, with very nice
visuals; maybe show how far behind you are instead. Likes "Sessions 3/3" and weekly bests. "The readiness and trend
and rehab parts make it really messy." Files: `app/record/page.tsx`, `components/record/*`, `components/ui/WeeklyHeatmap.tsx`.

## The page today, top to bottom (his account: hip program + overhead mobility; six screenshots, described)
1. Wordmark + gear; H1 "Record"; "Export" link; intro "Tap a point to see why it moved. Every change cites a study
   or a signal from your log."
2. Divider "NOW". Card **READINESS — 12 WEEKS**: a 12-column × 7-row grid of green pills (done) and dark pills;
   legend DONE / AMBER / RED-FLAG / REST OR MISSED.
3. Card **Week of 26 Oct · This week so far** (‹ ›): Sessions 3 / 3 · Top lift `block_pull_midshin · 135 kg × 7`
   (raw exercise id shown) · Weekly bests 3 lifts · Morning check 1 green. Mono green values.
4. Divider "TREND"; tabs 30D / 90D / 1Y / ALL. Card **ROLLING 84-DAY AVG** — empty ("The trend curve builds here once
   you have two or more retest readings…"). Card **RETESTS · 0 EVENTS** — empty.
5. **REHAB · HIP FLEXOR & BALANCE** + "CHECK DUE →" chip; paragraph about the sub-track from the clinical reports;
   card **Monthly check (lower = better)** "No hip check on file yet… START CHECK → / No data yet"; card
   **Rehab · last 30d 0/30 0%** with a paragraph ("Home rehab is the daily consistency layer the clinical file leans
   on…"). (Hip program only — `personal: true`.)
6. A dual-axis chart: Pull top set (kg, green line), Squat top set (kg, bronze line), Peak symptom (0–10, red bars),
   x-axis dates 08-17…10-29, a tooltip "2026-10-15 Pull top set: 170 kg"; then a "Data table" link.
7. Divider "LOG". Card **ACTIVITY — LAST 12 WEEKS**: the same grid as Readiness, visually identical.
8. "54 active days · showing last 30", then a 30-row list (› date · "3 done", "1 run", "2 done · 2 notes",
   "logged"…, some rows with a green dot), "LOAD 30 MORE".

## Your job (your lens)
Decide what Record is FOR in a focused-improvement app (one arc, confirm-first, evidence-backed), and what a
pre-ads MVP Record should be: per section KEEP / MERGE / MOVE (where) / CUT, the ideal order, the one headline
visual (e.g. week rings or sessions-done this week, the focus metric's trend, "on track / N behind"), and what to do
with the history list. Respect: the hip rehab views are that program's own (personal) — a generic replacement must
work for skill and strength programs too; no new claims the data can't back; safety signals stay visible where they
matter. Score Record 1–10 now and after. Peers (GOWOD, Runna, Hevy, Strong, Whoop) as ideas only.

Write `dev/active/founder-feedback-2026-10-29/<NN>-r4-<lens>.md`, ≤ 35 lines, ending with your top 3. Reply with the
top 3 and scores only. Don't edit code.
