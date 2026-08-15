# Today bug report — "I see the whole week when I scroll"

Audit URL: https://program-v2.pages.dev/ (Cloudflare Pages)
Viewport: iPhone 14 Pro 390x844, three passes (cold, cleared storage, seeded week of logs).
Date of run: 2026-08-07 (but the live deployed build reports date as Thursday 6 Aug — the
build is not being rebuilt daily so it's showing whatever the server clock says at request time).

## 1. What renders on `/` right now

The Today route (`src/app/page.tsx`) renders a single, short document. Full DOM height
equals viewport height (**scrollHeight = 844**), i.e. the page is not scrollable at all
on the cold-load state we captured:

- `h1` "Today"
- caption "Rebuild + evaluate (race prep sub-goal)"
- `DateNav` — one line: **"Thursday 6 Aug"** with the caption "TODAY"
- `HeroStateCard` — "No check yet / Save a morning check to calibrate today."
- `RestDayCard` — "Rest day — no barbell scheduled."
- `BottomNav` — Today / Week / Extras / Check / Coach / Progress / History

Day-name DOM sweep across all three passes (cold, `localStorage.clear()`, and a seeded
seven-day `program.log.v2` write) returned **exactly one occurrence** each time:

```
"Thursday 6 Aug"  <p class="text-[15px] font-semibold text-strong leading-tight">  top=158
```

Seeding storage with a week of prior logs did not change what Today renders — the Today
page never enumerates other days.

## 2. Reproduction of the reported bug

**Not reproducible on `/`.** No swipe gesture, no scroll behaviour, no lazy-loaded
week-strip. There is nowhere on the Today page that surfaces Monday/Tuesday/... together.

For comparison I loaded `/week/` (`src/app/week/page.tsx`). It renders exactly the
symptom the user described — a vertical list `Mon / Tue / Wed / Thu / Fri / Sat / Sun`
with the session for each day, and you have to scroll to see the whole thing. See
`today-inspect-week-comparison.png`.

**Most likely explanation:** the user was on the **Week** tab, not the Today tab, when
they saw a week of day names. The bottom nav's Today and Week icons live side-by-side
(TODAY / WEEK, positions 1 and 2 in `BottomNav`), and their icons — dumbbell vs calendar
— are similar in weight at that pixel size. It is easy to tap Week and read "Today"
because every row on the Week page carries a "TODAY" badge on the current day (see
screenshot), which reinforces the misread.

Secondary hypothesis: user is describing the DateNav's `‹ / ›` day-stepper as "scrolling
through the week". Tapping the chevrons advances one calendar day at a time and shows
its weekday label; if you tap through seven times you have seen "Monday, Tuesday,
Wednesday..." — but each one replaces the last in-place, so it doesn't match "when I
scroll it" naturally.

## 3. The DateNav

Isolated screenshot at `today-datenav.png`. It shows one day (`weekday: long, day:
numeric, month: short`, e.g. "Thursday 6 Aug") plus a "TODAY" mono-caps caption,
flanked by prev/next chevron buttons. Source: `src/components/workout/DateNav.tsx`.
No horizontal scroll, no swipe handlers, no gesture library — nothing that would
surface additional day labels.

## 4. Recommended fix

No code bug. Recommend one of:

1. **Disambiguate the bottom-nav labels.** Rename the Week tab to something like
   "Plan" or "Week plan" so it doesn't read as "your week overview" when the user
   wanted "what's on today". Or swap the calendar icon for something clearly weekly
   (e.g. a 7-cell grid). The current pair — dumbbell "TODAY" next to calendar "WEEK" —
   is easy to confuse on a phone at a glance.
2. **Ask the user to send a screenshot** the next time it happens. Given zero
   day-name occurrences on `/` across three storage states, the fastest resolution is
   confirmation that they were on `/week/`.

Files reviewed:
- `/Users/margussellin/www/program/next-app/src/app/page.tsx`
- `/Users/margussellin/www/program/next-app/src/app/week/page.tsx`
- `/Users/margussellin/www/program/next-app/src/components/workout/DateNav.tsx`
- `/Users/margussellin/www/program/next-app/src/components/workout/HeroStateCard.tsx`
- `/Users/margussellin/www/program/next-app/src/components/nav/BottomNav.tsx`

Artefacts:
- `today-inspect.png` — full-page Today, cold load
- `today-inspect-empty.png` — after `localStorage.clear()`
- `today-inspect-seeded.png` — after seeding seven days of logs
- `today-inspect-week-comparison.png` — the Week tab, showing the actual seven-day list
- `today-datenav.png` — isolated DateNav
- `today-inspect-findings.json` — raw DOM sweep data for all four passes
