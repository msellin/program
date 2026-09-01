# Terav app — Copy clarity audit (microcopy, tone, empty states, 21 personas)

Date: 2026-09-01
Personas read: all 21 bundles, with primary weight on the four never-audited ones — `persona-pullup`, `persona-pullup-fast`, `persona-muscleup`, `persona-engine-block2` — plus `persona-recover`, `persona-strength`, `persona-erratic`, `persona-handstand`.
Artifacts: `next-app/tests/e2e/artifacts/personas/*/text/`
Voice source: `landing/src/i18n/dictionaries/en.ts`
Prior round cross-referenced: `dev/audits/app/2026-08-21-app-copy-clarity-post-batch36.md`

**Artifact hygiene note before anything else.** Each `text/` directory contains a mix of Sept-1 captures and Aug-19/21 orphans. `01-today.txt`, `02-week.txt`, `03-coach.txt`, `04-history.txt`, `05-progress.txt`, `12-extras.txt`, `15-events.txt` are stale files from the pre-`/record` route map (mtimes Aug 19–21; bottom nav still reads `TODAY / WEEK / PROGRESS / HISTORY / PROFILE`). **Everything in this audit is drawn only from files with a 2026-09-01 mtime.** The `/coach` and `/events` 404s reported on 2026-08-21 are stale-file artifacts, not live bugs — that finding is retired. The harness should delete orphaned extracts on regen so the next auditor is not reading two route maps at once. → see `app-audit-N-mobile-ux`.

---

## 1. Overall verdict

The three new programs shipped with **strong long-form copy and broken short-form copy**. The program previews for First Strict Pull-Up and Muscle-Up Acquisition are the best explanatory writing in the app — "The transition is the bottleneck — not the pull, not the dip" is a sentence a competitor would pay for, and "Not enforced — you can still start if you assess honestly that you're close enough" is exactly the non-fragile, non-condescending register the landing promises. The Guide is a genuine glossary. The catalog's tier ladder P0 from 2026-08-21 is **fixed** — `REFERENCED / REVIEWED / VERIFIED` collapsed cleanly to `CITED / VERIFIED` with an honest legend.

But the app now tells first-time users to tap a menu that was deleted, names a tab that was renamed, and points at a page that redirects. **The rest-day card was fixed today for exactly this failure mode — naming a place the user cannot go — and three other strings have the identical bug, one of them in the first-run banner.** `FirstRunBanner.tsx:69` says "More lives behind the ⋮ menu (top right): Programs, Check, **Extras**, Report, Guide, Evidence" — the ⋮ menu was deleted (`AppShell.tsx:137` documents the deletion) and Extras became Off-plan on 2026-08-21. `guide/page.tsx:117` repeats both errors. `StatusCards.tsx:396` says "head to Progress" — `/progress` is a redirect stub. For a beta going to the founder's friends this week, the first screen a new user reads contains a three-way navigation lie.

Second-worst: **the proposal — the product's whole promise — now speaks three different vocabularies on two adjacent screens, and loses its citation on one of them.** Third: `Terav — Cut C · Record` renders an internal batch codename in the user-visible footer of `/record`.

The rest-day rewrite itself is good copy ("If you trained anyway — a ride, a run, a class — log it below; it still counts toward your history" — 22 words, orients, motivates, guides) but it is being fed the wrong noun on five of eight programs, and it fires on past and future dates while still saying "today."

---

## 2. Copy shipped today — direct judgement

### 2.1 Rest-day card — good string, wrong noun, wrong tense

`components/session/shared/StatusCards.tsx:100`
```
{programName ? `${programName} has no session on the schedule today. ` : "No session on the schedule today. "}
If you trained anyway — a ride, a run, a class — log it below; it still counts toward your history.
```

The second sentence is a clear improvement — it drops the dead "Extras tab", names three concrete activities, and closes with the reason to bother ("counts toward your history"). Ship the sentence.

**Two defects in the first sentence.**

**(a) `programName` is being handed the retest-metric name, not the program name.** Captured across five personas:

| Persona | Captured rest-day string | Program actually is |
|---|---|---|
| persona-pullup `01-day` | "**Strict pull-up max reps** has no session on the schedule today." | First Strict Pull-Up |
| persona-muscleup `17-session-past` | "**Strict ring muscle-up (reps)** has no session…" | Muscle-Up Acquisition |
| persona-handstand `01-day` | "**Handstand composite (Block 1)** has no session…" | Handstand Walk |
| persona-engine-block2 `01-day` | "**Threshold pace / power shift** has no session…" | Engine Builder Block 2 |
| persona-erratic `01-day` | "**Submax HR reduction at fixed pace** has no session…" | Concurrent Strength Maintenance |

Cause: `TodaySession.tsx:472` and `DaySession.tsx:177` pass `program.program_goal?.display_name`, while `TodaySession.tsx:223` correctly passes `programDisplayName(primary, primary.slug)`. Three call sites, two behaviours. `day-format.ts:13-15` already documents this exact anti-pattern — "`program_goal.display_name` is often the target metric … and reads as a bug" — and then two call sites do it anyway.
**Fix**: pass `programDisplayName` at both sites. String becomes "First Strict Pull-Up has no session scheduled for Tuesday."

**(b) The card says "today" on past and future dates.** `persona-erratic/17-session-past.txt` and `persona-muscleup/17-session-past.txt` both render "…has no session on the schedule **today**" while the user is looking at a past date. This is the same class of bug the activity sheet was fixed for this morning (`OffPlanSheet.tsx:65-72` correctly renders `isToday ? "today" : humanDate`). The rest card did not get the same treatment.
**Rewrite**: `` `${programName} has no session scheduled for ${isToday ? "today" : humanDate}.` ``

**(c) Direct contradiction on persona-recover.** `persona-recover/01-day.txt` renders, in this order:
```
Rest day.
No session on the schedule today. If you trained anyway — … log it below …
Primary conditioning day
30-45 min. CrossFit class, run, HYROX simulation, or intervals of your choice.
```
The card declares a rest day with nothing scheduled, and a prescribed conditioning session renders directly beneath it. On the single most-viewed screen. **P0.** Either the rest card must not render when a conditioning block exists, or its condition is wrong.

**(d) The promise "log it below" is unkept on `/session/[slug]` for future dates.** `persona-recover/18-session-future.txt` is the whole page:
```
Rest day.
No session on the schedule today. If you trained anyway — a ride, a run, a class — log it below; it still counts toward your history.
```
Nothing below. No log card, no CTA. The string points at empty space.

### 2.2 RPE picker — the scale is right, the wording is not

`components/session/RestTakeover.tsx:24-27, 213`
```
"How was that?"
"How many more could you have done? This sets your training max."
[Plenty left / 4-5+ in reserve] [Easy / ~3 in reserve] [Solid / ~2 in reserve] [Grind / 0-1 in reserve]
```

The four-step scale is the right call and the code comment justifies it well. Three copy problems.

**(a) "in reserve" is jargon, and it is the wrong answer shape.** The question asked is "How many more could you have done?" The honest answer to that question is "about three more" — not "~3 in reserve." Reps-in-reserve is a powerlifting term of art; it is not defined anywhere in the app, including the Guide, which teaches RPE in the *opposite* frame ("9 = one rep left · 8 = two left · 7 = three"). So the app has two vocabularies for one construct: **"left" in the Guide, "in reserve" in the picker.** With the catalog now half gymnastics — a Tier A pull-up user who cannot yet dead-hang 15 seconds — "in reserve" is a stranger's word.
**Rewrite the sublabels to answer the question literally**: `4-5+ more` · `~3 more` · `~2 more` · `0-1 more`. Same information, zero jargon, and it parses as the answer to the sentence directly above it.

**(b) The label ladder is out of order to a novice.** `Plenty left → Easy → Solid → Grind`. "Plenty left" is a reserve statement; "Easy / Solid / Grind" are effort statements. Mixing the two axes means the easiest option does not read as the easiest — "Easy" sounds easier than "Plenty left." Under a 66px button at 13.5px, the user is reading the label, not the mono 9px sublabel.
**Rewrite**: `Very easy · Easy · Solid · Grind`, sublabels as in (a). One axis, monotone ladder, familiar words retained.

**(c) "This sets your training max" is false on three of eight programs and undefined on first use.** First Strict Pull-Up, Muscle-Up, and Handstand Walk have no training max. TM is defined only in `/guide`, which lives behind Profile → More; the picker fires mid-session on day one. `persona-pullup` reaches this picker with no strength program in sight.
**Rewrite**: strength programs keep "This sets your training max." Everything else: "This tunes your next session." Gate on whether the program has a TM, not on copy convenience.

### 2.3 Draft-program string — ships as-is

`ProgramPreviewClient.tsx:538-542`: "Not published yet. / This program is still being written and isn't in the catalog. It'll appear on the Programs tab when it's ready." Orients, explains, sets an expectation, 22 words, no apology, no error tone. Correct. One nit: the disabled button also reads "Not published yet" (`:556`, `:587`), duplicating the heading two lines away. Button should read **"Not available"** — 2 words, distinct from the explanation.

### 2.4 Activity sheet date — fixed correctly

`OffPlanSheet.tsx:71`: "A run, a row, a class. Recorded against {today | Friday 28 Aug} — the engine reads duration, effort and heart rate." Correct fix, correct pattern. **This is the pattern the rest-day card (§2.1b) and the session headers (§4.1) should copy.**

---

## 3. Dead-name inventory — the P0 cluster

The rest-day fix removed one dead name. Three remain, all reachable by a first-time user, all in an installed PWA with no address bar.

| # | Source | String | Reality |
|---|---|---|---|
| 1 | `components/FirstRunBanner.tsx:69` | "More lives behind the ⋮ menu (top right): Programs, Check, **Extras**, Report, Guide, Evidence." | The ⋮ menu is **deleted** — `AppShell.tsx:137`: "check / ⋮ overflow all deleted — bottom nav owns tab-switching". Extras is Off-plan. Two lies in one sentence, in the first paragraph a new user reads. |
| 2 | `components/FirstRunBanner.tsx:51` | Title: **"Five tabs, one flow"** — followed by a list of **four** tabs (Day, Plan, Record, Profile). | Off-by-one in the headline. |
| 3 | `app/guide/page.tsx:117,121` | "The rest live behind the ⋮ menu in the top right:" … "**Extras.** Accessories, home rehab, cardio / conditioning blocks — no calendar pressure." | Same two errors, on the page whose entire job is to be authoritative. |
| 4 | `components/session/shared/StatusCards.tsx:396` | "No retest metrics recorded — head to **Progress** to log your final numbers." | `/progress` is a redirect stub (`app/progress/page.tsx:4`). The surface is called **Record** in the nav — and confusingly, the page titled **"Progress"** is `/report`. Captured on `persona-muscleup/01-day` and `persona-pullup-fast/01-day` — i.e. this is the *graduation* screen, the emotional high point of the product. |

**Rewrites:**
- FirstRunBanner title: **"Four tabs, one flow"**.
- FirstRunBanner footer: **"Programs, Check, Off-plan, Report, Guide and Evidence live under Profile → More."**
- Guide `:117`: **"These are the bottom-nav tabs. The rest live under Profile → More:"**; `:121` label **Off-plan**, copy "Accessories, home rehab, cardio — no calendar pressure."
- Graduation: **"No retest numbers logged. Open Record to add your final ones."**

**Harness gap:** `persona-pullup/flows/onboarding-first-run/01-first-run.txt` captured the ordinary Today screen — the banner is suppressed once `logsCount > 0` (`FirstRunBanner.tsx:41`), and every persona has logs. **The single most important copy surface for this week's beta is captured by zero of 21 personas.** Add a zero-log persona. → also see `app-audit-N-mobile-ux`.

---

## 4. Errors, negative and date-blind states

### 4.1 "TODAY'S SESSION" / "TODAY'S TOP SET" on non-today dates

| Persona · route | Header says | Section label says |
|---|---|---|
| `persona-erratic/18-session-future` | **Friday** | **TODAY'S SESSION** |
| `persona-pullup-fast/18-session-future` | **Friday** | **TODAY'S TOP SET** |
| `persona-strength/16-session-today` | Tuesday | TODAY'S SESSION (correct — is today) |
| `persona-pullup/flows/activity-log-sheet` | **Wednesday** | **TODAY'S TOP SET** |

The page correctly names the weekday in its own header and then contradicts itself one element down. **Rewrite**: drop the possessive entirely — **"THE SESSION"** / **"TOP SET"**. The weekday is already stated above; repeating it as "today's" adds nothing and can only be wrong.

### 4.2 Internal codename in the footer

`app/record/page.tsx:242` renders `Terav — Cut C · Record`, captured verbatim on every persona's `05b-record.txt`. "Cut C" is a design-batch codename. **P0 for a beta with outside users.** Rewrite: **`Terav · Record`** or delete the line.

### 4.3 Internal token in the clinician-facing report

Both `persona-recover/10-report.txt` and `persona-erratic/10-report.txt`, under "Personal contraindications":
```
Overhead pressing — sim: shoulder flagged during intake

> **CORRECTION 2026-09-01.** `sim: shoulder flagged during intake` is **not** a
> production string. It is written by the persona simulator at
> `tests/e2e/harness/simulator-v2.ts:612` and occurs **zero** times in `src/`.
> It reached the rendered report because the seeded persona store contained it.
> Test data, not a leak — no app change made. The `Terav — Cut C · Record`
> footer in the same finding was real and is fixed.

```
`sim:` is a harness/simulator prefix leaking into the one document explicitly designed to be printed and handed to a physio. **Rewrite**: "Overhead pressing — flagged during intake."

### 4.4 Report — counts without denominators

`persona-erratic/10-report.txt`: **"MORNING CHECK / 45 amber"**. No denominator, no green, no red. Handed to a clinician, "45 amber" reads as 45 bad days out of an unknown total. `persona-recover` renders the full "16 green · 10 amber · 4 red" — so the erratic case is a degenerate render, not a design. **Rewrite**: "45 of 45 days amber."

Same page: **"ENDURANCE SESSIONS / 11 · 0 km"** — "0 km" when distance wasn't captured reads as eleven sessions covering zero distance. Omit the unit when the value is absent.

Same page: **"Target 0 kg · stretch 3 kg"** under Back squat 5RM, with `BASELINE —` and `Δ —`. A target of zero kilograms is meaningless. **Rewrite**: "No baseline yet — targets set once you log one."

### 4.5 Report — a wall of zeros with no empty state

`persona-recover/10-report.txt`, "Rehab adherence": thirteen consecutive rows of **`Week of 2026-06-08 · 0 / 7`**. This is the app's only judgemental surface, and it judges by repetition rather than by words. **Rewrite**: when every week is zero, replace the table with one line — **"No home rehab logged in this range."** Non-alarmist, honest, and it stops the report making its case thirteen times.

### 4.6 Section header jargon

`/report` → **"Provocateur incidents"**. Clinical register, and "provocateur" is not in the Guide. **Rewrite**: **"Flare days"**, subtitle unchanged ("Days where morning-check symptoms crossed a threshold or a note contained pain/click/flare keywords").

### 4.7 What the negative states got right

- `persona-recover/14-check-hip`: "This is not a diagnosis — you already have an orthopaedist and physiatrist for that. The point is to catch changes between appointments." Confident, positions the tool, no hedging. **Best sentence in the app.**
- `persona-handstand/01-day`: "Shoulder pain stops the session. / Any sharp shoulder pain during handstand work — end the block, log it on the check page, take rest. Non-negotiable." Direct without alarm. One flaw: "stops the **session**" then "end the **block**" in adjacent sentences (§8), and "the check page" is a place-name not matching any nav label. **Rewrite the second clause**: "…stop, log it on the morning check, take rest."
- No "escalate" verb in user-facing copy outside the recover program's red-flag table, where "escalate to clinician" is appropriate.

---

## 5. Proposals — the core promise, now speaking three languages

`persona-strength` carries one proposal, rendered on two surfaces.

**Surface A — `01-day.txt` (Today):**
```
ROOM TO PUSH — HEADROOM ON YOUR LOG
Because: 3 straight green days plus 'felt strong' in a recent note. The engine reads that as headroom.
block pull (midshin) · 147.5 → 152.5 kg (+5)
back squat (high bar) · 115 → 117.5 kg (+2.5)
Source: Rhea et al. 2003
APPLY BUMP        IGNORE
```

**Surface B — `16-session-today.txt` (the session):**
```
NEW NUMBERS — YOUR TRAINING MAX GOES UP
block pull (midshin)  147.5 → 152.5 kg
back squat (high bar) 115 → 117.5 kg
3 straight green days plus 'felt strong' in a recent note. The engine reads that as headroom.
Use these        Adjust
…
ACCEPT THE NUMBERS TO START
```

| Element | Surface A | Surface B | Verdict |
|---|---|---|---|
| What changes | yes | yes | ✅ |
| Why (log signal) | yes, `Because:` prefixed | yes, unprefixed | ✅ |
| **Cites a study** | **`Source: Rhea et al. 2003`** | **absent** | **P0** |
| Accept verb | `APPLY BUMP` | `Use these` | drift |
| Decline verb | `IGNORE` | **`Adjust`** | **wrong word** |
| Gate copy | — | "ACCEPT THE NUMBERS TO START" | third verb |

**Two P0s here.**

**(a) The citation is dropped on the surface where the user actually decides.** Landing (`en.ts`): *"126 primary studies. **Every session cites its research.**"* and *"See what every step cites →"*. The session surface — the one gated behind "ACCEPT THE NUMBERS TO START", i.e. the one the user must act on to train — is the one that omits `Source: Rhea et al. 2003`. The cite must render on Surface B.

**(b) `Adjust` is not a decline verb.** It means "edit these numbers." A user who wants to reject the proposal reads `Use these / Adjust` and has no option that means no. Meanwhile the gate line says "Accept the numbers", the Today card says "Apply bump", and the landing says "You **apply** the change or **ignore** it." Four vocabularies for one mechanic.

**Lock it.** Landing's own words are the tiebreak: **`Apply` / `Ignore`**. Surface A keeps the informative `APPLY BUMP` (it is genuinely better — the user knows what they're applying). Surface B becomes **`Apply` / `Ignore`**, gate line becomes **"Apply the new numbers to start."** The 2026-08-21 audit flagged Accept-verb drift as a P1 "ratify or revert" decision; it was neither ratified nor reverted, and a *third* pair has since been added. **This is a regression.** Ratify in `terav-design-system-v1.1.md` this week.

**Coach/proposal coverage gap:** only `persona-strength` and `persona-recover` (per the prior round) surface proposals. None of the four new skill/endurance programs captured a single proposal card across any Sept-1 route. Either the engine does not propose on skill programs, or the personas do not reach the state. Both are worth knowing before the beta. → see `app-audit-N-landing-alignment` for whether skill programs deliver the cited-adaptation promise at all.

---

## 6. Empty-state inventory

Three jobs: orient, motivate, guide.

| Route × persona | Captured string | Orient | Motivate | Guide | Verdict / rewrite |
|---|---|---|---|---|---|
| `/record` LATEST RETEST · persona-pullup | "Your first retest lands here once you have a baseline reading. Log a session at the retest window to seed it. **LOG A CHECK →**" | y | y | y | **Ship.** Model empty state — 22 words, names the mechanism, one CTA. |
| `/record` TREND · persona-pullup | "The trend curve builds here once you have two or more retest readings for the same metric." | y | y | partial | Ship. Add nothing. |
| `/record` RETESTS · 0 EVENTS · persona-pullup | "Your retest history builds here — each reading tied to the study or log signal that triggered it." | y | y | n | Ship — "tied to the study or log signal" sells the product while the shelf is empty. Best-in-class. |
| `/off-plan` · persona-erratic | "Accessory work lives in your sessions **now**. Mobility drills, activation and around-run work are scheduled into the days your plan puts them on, so there's no separate list to keep up with. To log a run, a row or a class, use "Log a run, row, or class" at the bottom of any session. **BACK TO DAY**" | y | y | y | Structurally correct, but **"now" is changelog voice** — a first-time user never knew the old way. And "around-run work" is jargon. **Rewrite (34 words)**: "Accessory work lives inside your sessions. Mobility, activation and warm-up drills are scheduled on the days your plan puts them on — no separate list to keep up with. To log a run, row or class, use the button at the bottom of any session." |
| `/off-plan` · persona-pullup | "Accessory work, home rehab, around-runs. Logging to today." + a 24-item list | partial | n | n | **Contradicts the erratic version of the same route.** One program says "there is no separate list", another shows a 24-row list. Also: `Ring row` appears **three times** with identical labels and different set counts (3/4/4), as does `First strict pull-up attempt` (three times, three parent blocks). The user cannot tell them apart. **P1**: dedupe by parent block, or append the differentiator to the label. And "1 sets" (six occurrences) is an unpluralised template. |
| `/report` hip-flexor check · persona-recover | "No checks logged in this range." | y | n | n | Carried over unfixed from 2026-08-21. **Rewrite**: "No hip checks in this range. Six items, about 4 minutes — start one from Profile → Check." |
| `/record` This week so far · persona-pullup | "Sessions **0 / 0**" | n | n | n | Zero-of-zero is not a state. **Rewrite**: "Sessions — none scheduled this week." |
| `/session/[slug]` future · persona-recover | "Rest day. No session on the schedule today. …log it below…" with nothing below | n | n | **broken** | See §2.1d. |

**Verdict**: `/record`'s three empty states are the strongest copy in the app and should be the house template. `/off-plan` is two contradictory pages sharing a route.

---

## 7. Forms, labels, onboarding

**Morning check** (`persona-pullup/13-check`, `persona-erratic/13-check`) — unchanged and still good. Persistent labels above every control (`Low back`, `Any joint pain`, `Muscle soreness`, `Shoulder / upper body`, `Morning stiffness`, `Life load`). Named scale steps rather than bare numbers: `None / Mild / Notable / Severe`, `None / <15 min / 15-30 / >30`, `Fresh / Normal / Cooked`. `FLAGS · TAP TO TOGGLE` tells you the interaction. The notes explainer — "The engine reads these. Keywords like padel, hike, poor sleep feed today's proposal — no LLM, just a keyword parser, all done on-device" — is 26 words that sell trust. **Ship all of it.**

One gap: the check page shows `CITED / Kellmann 2010 · pain-provocation thresholds` and a save confirmation "✓ Saved. Today's prescription adjusts to this read." — but **the 0-10 scale the report and Guide reference is never shown here**. The check collects `None/Mild/Notable/Severe`; the report renders "groin L 6" and "Peak symptom (0-10)"; the Guide teaches "Nothing above 3/10". Three representations of one scale, and the user never sees the mapping. **P1**: add one line under REGIONS — "None 0 · Mild 1-3 · Notable 4-5 · Severe 6+ — the same 0-10 scale your report uses."

**Intake** — captured at step 1 only across all personas (`19-intake.txt`). What is captured is good: one question per step, a bolded question, a plain-language rationale beneath, and options as full sentences. Muscle-Up step 1 — "3-5 minimum. Below that, the muscle-up work is premature and this program will route you to First Strict Pull-Up first" — is honest gatekeeping that also cross-sells. Engine Block 2 step 1 — "Block 2 assumes a base. Without one, you'll under-adapt and over-fatigue" — states the consequence, not the rule. **Best onboarding copy in the app.**

Three defects:
- **Typo, every persona**: `SCREENING· STEP 1 OF 14` — missing space before the middle dot. Also present at `1 OF 18`, `1 OF 7`. Grep the eyebrow template.
- **Step counts read as a wall.** "STEP 1 OF 14" / "1 OF 18" is a long climb to show on screen one, and it conflicts with the preview's friendlier framing: "9 short questions and 5 benchmark tests." The user is told 14 (a number) and separately told 9+5 (a structure). **Rewrite the eyebrow**: `SCREENING · 1 OF 9 QUESTIONS` and switch to `BENCHMARKS · 1 OF 5` when the section changes. Same total, half the dread.
- **Validation**: "Answer this to continue." is rendered as a page-level footer line, not attached to the field. Acceptable on a one-question step; will fail the moment a step has two inputs. Flagged, not blocking.

**"Skip setup"** (`OnboardingRunner.tsx:132`) is captured by no persona. Untested copy path in the week it matters most.

**Graduation card** (`persona-muscleup/01-day`, `persona-pullup-fast/01-day`) — three options with one-line consequences each, which is right:
```
Repeat this arc — Restart · keep intake + baselines
Extend +4 weeks — Push the retest date · keep the arc going
Take a break — Pauses Today · stays in your programs list
```
Clean. Problems: **"8 weeks logged. Nice."** — "Nice." is the only motivational tic in the app; it lands as a pat on the head after ten weeks of work. Delete it, or earn it with a number: "8 weeks logged · 26 sessions." And **"HOW WAS THIS ARC? 1 2 3 4 5"** has unanchored endpoints — the user does not know whether 1 is good. **Rewrite**: "How was this arc?" with `1 — not for me` and `5 — nailed it` under the rail.

---

## 8. Terminology map

| Concept | Terms in use | Where | Recommend |
|---|---|---|---|
| The container | **program** (catalog, Profile, "End this program"), **arc** (landing, catalog intro "one focus arc", graduation ×3), **block** (Engine Builder Block 2, "end the block"), **cycle** (Guide: "One 4-week 5/3/1 block"), **phase** (Guide: "chunked into phases") | everywhere | "arc" is landing-sanctioned — keep it **only** for the lifecycle (start/finish/repeat). **Kill "block" as a synonym for session** — `persona-handstand/01-day` says "stops the session" then "end the block" in adjacent sentences. Guide already collides "cycle" and "block" in one definition. |
| Reps-in-reserve | "in reserve" (RPE picker), "left" / "left in the tank" (Guide), RPE number (session rail, proposals, report `@ 8.5`) | picker vs Guide | One frame. Use **"more"** in the picker (§2.2a), keep RPE numbers on the rail, and have the Guide teach the bridge. |
| The Record surface | nav **RECORD**, H1 "Record", but `/report` H1 is **"Progress"**, Profile menu calls `/report` **"Report"**, Guide calls it **"Report"**, graduation card says **"head to Progress"**, and `/progress` is a redirect to Record | 5 names, 2 pages | **P0.** `/report` H1 must be **"Report"** (matching nav, menu and Guide). The word "Progress" must not appear as a page title anywhere — it is a dead route. |
| Off-plan surface | **Off-plan** (H1, route), **Extras** (Guide `:121`, FirstRunBanner `:69`, `schedule.ts:528`, `suggest.ts:149` user-facing "Consider skipping and doing Extras only") | 2 names | **Off-plan** everywhere. `suggest.ts:149` is a user-visible red-state string still saying "Extras". |
| Exercise ids | humanised in `/report` ("Block pull, mid-shin height") and in proposals ("block pull (midshin)"); **raw slug in `/record`** — `persona-erratic/04-history-redirect`: "Top lift / **block_pull_midshin** · 113 kg × 5" | Record | **Carried over unfixed from 2026-08-21 P1 #2.** The helper exists and two other surfaces use it. |
| Program names | "First Strict **Pullup**" (Today H1, graduation) vs "First Strict **Pull-Up**" (catalog, preview, intake); "**Muscle Up**" vs "**Muscle-Up Acquisition (strict ring)**"; "Engine Builder Block 2" vs "Engine Builder — Block 2: Volume" | all 3 new programs | `day-format.ts:17` title-cases the slug, and its own comment claims "Slug title-case matches the manifest name for every current program." **That invariant broke today on all three new programs.** Read the manifest name; fall back to the slug. |
| Tier ladder | `CITED` / `VERIFIED` + honest legend | catalog, preview | **Fixed since 2026-08-21. Ship.** One nit: the strip reads "**8 CITED · LIVE NOW**" above cards showing VERIFIED — reads as a contradiction before the legend is read. **Rewrite: "8 programs · live now."** |
| Seed | "random practice — order shuffled by **the seed**. Shea & Morgan 1979." | pullup, handstand, muscleup Today | Developer word. **Rewrite**: "Order shuffled on purpose — varied practice beats blocked practice. Shea & Morgan 1979." |
| Around-runs | "around-runs", "around-run work" | `/off-plan` both variants | Undefined compound. Say **"warm-up and cool-down work"**. |

---

## 9. Tone vs. positioning

| Landing claim (`en.ts`) | App evidence | Match |
|---|---|---|
| "You log a note. Engine proposes. You **apply** the change or **ignore** it." | Today: `APPLY BUMP / IGNORE` ✅. Session: `Use these / Adjust` ✗. Gate: "ACCEPT THE NUMBERS" ✗. | **partial — §5** |
| "126 primary studies. **Every session cites its research.**" | Today proposal cites `Rhea et al. 2003`; session proposal cites nothing. Check page cites `Kellmann 2010`. Session rails cite inline (`Fahs 2015`, `Youdas 2010`, `Wilson 2012`). | **partial — §5a** |
| "Each program targets one capability … Runs alongside your other training." | "Cross-modal work, walks, class attendance, mobility — anything not in the prescribed block. Optional. **Nothing here changes the plan.**" | ✅ |
| "A focus arc. Rest stays yours." | Off-plan: "Do these when you can — no calendar constraint." | ✅ |
| "Cited before shipped" | Catalog legend: "Every program ships at least CITED." Plus honest non-cites: "(engineering choice — no direct dose-response study for hang time)" and "Signal-cited · no study reference for this metric." | ✅ **Exceptional** — the app admits where evidence stops. |
| Not fragile | Muscle-Up preview: "Not enforced — you can still start if you assess honestly that you're close enough." Hip check: "not a diagnosis — you already have an orthopaedist and physiatrist for that." | ✅ |

**Streak / gamification / emoji smoke test: clean.** Grep of `great job|keep going|nice work|well done|streak|you missed|crushed it|🎉|🔥|💪|awesome|amazing` across `src/**` returns only code comments *documenting the rejection* (`check/page.tsx:25` "R5 no gamification"; `WeeklySessionStrip.tsx:15` "R5-adjacent to invite 'keep the streak going'"; `ReadinessTrail.tsx:24` "no streak count, no 'N days in a row'"). Zero production strings. `persona-erratic` — 45 amber days, three skipped sessions in the last five — is never scolded, never nudged, never congratulated. **The hardest tone test in the app, passed outright.** The single leak is "8 weeks logged. **Nice.**" (§7).

**Brand:** "Terav" renders correctly capitalised in the wordmark, `/record` footer, `/programs` legend, and `/off-plan`. No pronunciation guide anywhere. ✅ — except the footer carries "Cut C" alongside it (§4.2).

**Nav / H1 consistency:** `DAY / PLAN / RECORD / PROFILE`. Plan H1 = "Plan" ✅. Record H1 = "Record" ✅. Profile H1 = "Profile" ✅. Day's H1 is the program name with a `TODAY · WEEK n OF m` eyebrow — a deliberate and good exception. `/report` breaks the pattern (§8).

---

## 10. Priorities

**P0 — fix before the beta goes to friends**
1. **`FirstRunBanner.tsx:51,69`** — "Five tabs" listing four; "⋮ menu (top right)" which was deleted; "Extras" which was renamed. The first copy a new user reads is wrong three ways. Add a zero-log persona so this never ships unaudited again.
2. **`guide/page.tsx:117,121`** — same ⋮ and Extras errors on the authority page. Also fix `suggest.ts:149` ("doing Extras only").
3. **`StatusCards.tsx:396`** — "head to Progress"; `/progress` is a redirect. Graduation screen.
4. **Proposal citation dropped on the session surface** — `Source: Rhea et al. 2003` renders on Today, not on the gated session card. Direct break of "Every session cites its research."
5. **`Use these / Adjust`** — "Adjust" is not a decline verb; there is no way to say no. Lock `Apply` / `Ignore` app-wide and ratify in the design system.
6. **`record/page.tsx:242`** — `Terav — Cut C · Record`. Internal codename, every persona, every visit.
7. **`persona-recover/01-day`** — "Rest day / No session on the schedule" rendering directly above a prescribed conditioning session.
8. **`/report` H1 "Progress"** — collides with a dead route and with the nav's "Record". Rename to "Report".
9. **`sim: shoulder flagged during intake`** — harness token in the clinician-facing report.

**P1 — this month**
10. Rest-day card: pass `programDisplayName`, not `program_goal.display_name` (`TodaySession.tsx:472`, `DaySession.tsx:177`) — five of eight programs currently name a metric.
11. Rest-day card + session headers: date-aware wording. Kill "TODAY'S SESSION" / "TODAY'S TOP SET" on non-today dates; use the `OffPlanSheet.tsx:71` pattern.
12. RPE picker: sublabels → `4-5+ more / ~3 more / ~2 more / 0-1 more`; labels → `Very easy / Easy / Solid / Grind`; "This sets your training max" gated to programs with a TM.
13. `day-format.ts:17` — read the manifest name. "First Strict Pullup" ≠ "First Strict Pull-Up"; three new programs affected.
14. `/off-plan` renders two contradictory pages; dedupe the 24-item list (three identical "Ring row" rows) and fix "1 sets".
15. `block_pull_midshin` still raw on `/record` — carried unfixed from 2026-08-21 P1 #2.
16. Symptom-scale mapping shown once on `/check` ("None 0 · Mild 1-3 · Notable 4-5 · Severe 6+").
17. Report: "45 amber" → "45 of 45 days amber"; "11 · 0 km" drop the unit; "Target 0 kg" → no-baseline line; 13 rows of "0 / 7" → one empty-state line.
18. Intake eyebrow typo `SCREENING· STEP` (all personas); re-frame the counter as `1 OF 9 QUESTIONS`.
19. `/session/[slug]` future rest day: "log it below" with nothing below.
20. Delete "Nice." from the graduation card; anchor the 1-5 arc rating.

**P2 — polish**
21. "the seed" → "shuffled on purpose"; "around-runs" → "warm-up and cool-down work"; "Provocateur incidents" → "Flare days"; `/off-plan` "…lives in your sessions **now**" → drop "now".
22. Catalog: "8 CITED · LIVE NOW" → "8 programs · live now"; collapse the 62-word tier legend to one line plus "How tiers work →".
23. `/record`'s permanent 85-word explainer header should be dismissible after first read.
24. Profile "WHAT TERAV BELIEVES" → "YOUR TRAINING MAXES" + "What percentages are calculated from. Updated when you apply a proposal." Also: "INTAKE PENDING" is an orphan pill with no CTA on an 8-week-old program — make it a link.
25. `persona-pullup-fast/18-session-future` "HOW TO RUN THIS" blends three exercises' notes into one unlabeled blob under a single named exercise.
26. Delete stale pre-Aug-21 text extracts on harness regen (§preamble).
27. `handstand/01-day` safety string: "end the block, log it on the check page" → "stop, log it on the morning check".

---

## 11. Deltas vs. 2026-08-21

**Fixed**: tier-ladder three-way collision (P0) — now a clean two-tier `CITED / VERIFIED` with an honest legend. `Log an extra session` → `Log extra session →` (P1 #3). Rest-day "Extras tab" dead name. Activity-sheet date. `/coach` and `/events` 404s — retired as stale artifacts, not live bugs.

**Still open**: `block_pull_midshin` on `/record` (P1 #2). Accept-verb drift (P1 #7) — **regressed**, a third pair (`Use these / Adjust`) was added rather than the two being reconciled. `/report` hip-check "No checks logged in this range" motivate line (P1 #6). Onboarding/first-run path still uncovered by any persona (P2 #13) — and this round shows that gap is now hiding a P0.

**New with the 5→8 catalog expansion**: rest-day card naming the retest metric; program-name hyphenation drift on all three new programs; "in reserve" jargon against a half-gymnastics catalog; "This sets your training max" on programs with no training max; duplicate un-differentiated drill rows on `/off-plan`; "the seed" surfacing on all three skill programs.

The new programs' long-form copy is a level above the app's short-form copy. Bring the strings up to the standard the previews already set.
