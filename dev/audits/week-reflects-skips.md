# Week tab — reflects skips + overrides?

Target: https://program-v2.pages.dev/week/  · run 2026-08-07 (Fri, EEST/UTC+3)
Source: `next-app/src/app/week/page.tsx`

## 1. Verdict

The rewrite is live and the badge/strikethrough/reason wiring works. But every
skip and every override lands on the row **one day AFTER** the intended date.
The bug is a UTC/local timezone mixup in the ISO conversion — see below.

| Scenario | Pass? | Notes |
|---|---|---|
| A · baseline | Partial | 7 rows, Today highlighted, Prev/Next visible; Now correctly hidden at offset 0; no skip/moved-in badges. However baseline is NOT log-empty: `seedFromRepoLogIfEmpty()` seeds logs, so LOGGED counters appear. Not a Week-tab bug. |
| B · skip today | **FAIL** | Injected `skipped["2026-08-07"] = {reason:"sick"}`. Badge appeared on **Sat 8 Aug** row instead of **Fri 7 Aug** (today). Reason text and strikethrough render correctly, just on the wrong day. |
| C · whole-week shift | **FAIL** | Every SKIPPED / MOVED-IN badge shifted one row further into the future than intended. `skipped[Mon 08-03]` shows on Tue, Wed skip on Thu, Thu skip on Fri (today), Sat skip on Sun. Next-week overrides same story: Mon override on Tue, Sat override on Sun. Badges, strikethrough, `↳ shifted +7d from …` reason text all render — placement is wrong. |
| D · Now button | Pass | Now button appears only when `offset !== 0`, click returns view to `This week`. |

Bottom line for the user's original question — **"does it change when I skip
or move a day?"** — Yes, the UI reacts, but with a systematic +1-day offset
that will make it look broken.

## 2. Screenshots

- `dev/audits/week-A-baseline.png` — this week, no skips
- `dev/audits/week-B-skip-today.png` — sick today, badge lands on Saturday
- `dev/audits/week-C1-thisweek-shifted.png` — this-week view after shift
- `dev/audits/week-C2-nextweek-movedin.png` — next-week view after shift
- `dev/audits/week-D-now-return.png` — after Now button

## 3. Bugs found

**B1 — UTC-based `iso()` produces off-by-one row lookups in positive-offset TZs.**

`next-app/src/lib/utils.ts:8`
```ts
export const iso = (d: Date) => d.toISOString().slice(0, 10);
```
`next-app/src/app/week/page.tsx:36-42, 97-99`
```ts
const now = new Date(todayISO() + "T00:00:00");        // local midnight
...
const dateForDay = new Date(viewedMon);
dateForDay.setDate(viewedMon.getDate() + i);
const dateISO = iso(dateForDay);                        // ← UTC → prev-day in EEST
```
`dateForDay` is constructed at local-midnight, so its UTC value is the previous
calendar date in any TZ east of UTC. `iso()` reads the UTC date, so `dateISO`
is one day behind the row's label. Skips/overrides keyed by the user-natural
"today" ISO string then attach to the following row.

Fix: use a local-date formatter for the row lookup — e.g. a helper
`function isoLocal(d: Date) { const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), da=String(d.getDate()).padStart(2,"0"); return \`${y}-${m}-${da}\`; }` — and swap it in both `today()` and `iso(dateForDay)` in the Week page (and audit other call sites of `iso()` for the same trap).

**B2 — original template conditioning bleeds through under a MOVED-IN block.**

`next-app/src/app/week/page.tsx:187-189`
```tsx
{templateEntry?.conditioning && !skip ? (
  <p className="text-[12px] text-muted italic mt-1">{templateEntry.conditioning}</p>
) : null}
```
An override replaces the block, but the template's `conditioning` line still
prints, so e.g. a squat-variant moved onto Thursday still shows *"None. This
is the second squat day of the week — respect the load."* Add `&& !override`
to the guard, or use the override to hide it.

## 4. UX nits

- The `moved-in` badge uses `bg-slate/30 text-slate` — very low contrast on the dark surface. `skipped` (amber) reads at a glance; `moved-in` almost disappears.
- With B1 in place the visible day label ("Fri 7 Aug") and the internal `today` key can drift when the user opens the app after midnight local. Even the TODAY highlight will move to the wrong visual row late at night in Estonia — worth a targeted fix.
- The "Now" button lives to the right of Next; consider always rendering it (disabled at offset 0) so the button count doesn't shift as offset changes.
- No "Jump to today" affordance on the day-row itself — tapping a row does nothing. If Week is meant to be navigable, wiring row → `/today/?date=…` would earn its keep.
