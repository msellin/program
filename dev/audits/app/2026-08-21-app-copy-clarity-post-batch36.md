# Terav app — Post-Batch-36 copy clarity audit (microcopy, tone, empty states, CTA vocabulary)

Personas audited: persona-recover, persona-strength, persona-erratic
Fresh artifacts: `next-app/tests/e2e/artifacts/personas/{persona}/text/*.txt`
Baseline compare: `next-app/tests/e2e/artifacts/personas.baseline-pre-batch-36/`
Voice source: `landing/src/i18n/dictionaries/en.ts`
Batch-36 spec anchors: §2.13 CTA vocabulary, §5 score-hero, §7.5 tier collapse, HeroStateCard StatusPill labels, Profile pill labels.

---

## 1. Overall verdict

**COPY SHIPPABLE WITH ONE P0 EDIT** — the Batch-36 modernization has landed cleanly on Today (eyebrow, H1, HeroStateCard StatusPill, ExplainSheet cite-threshold copy) and on the program preview (`active` / `verified` / `personal` pills wired to §7.5). The score-hero renders `WORKOUT READY · Why? · Progress load. Nothing above 3/10 in your check.` — exactly what §5 asked for. Tone is disciplined, no motivational leaks, no emoji, no streak language.

**The one P0**: the tier ladder has drifted into a **three-way naming collision** — the programs *catalog* renders `REVIEWED` per card, the program *preview* collapses the same program to `VERIFIED`, and Evidence renders `REFERENCED` at per-citation level. A user browsing the catalog sees a "reviewed" concurrent-strength card, taps into preview, sees "verified", opens Evidence and sees "referenced" against the same underlying citation set. Three labels, one thing. §7.5 was supposed to collapse to two (`cited` / `verified`). The catalog didn't get the memo.

Two smaller compliance gaps: (a) `Save check` CTA renders a `<ChevronRight>` icon instead of a literal `→` glyph (Batch 36 §2.13 spec uses the literal glyph in `Why this? →`, `Check due →`, `Start check →` — mixed convention across surfaces); (b) proposal accept verb is per-kind (`Apply bump`, `Advance to Cycle 1`, `Log reading`) instead of the locked `Accept`. The per-kind verbs are stronger UX, but that's a design-lead call to ratify or fix.

What went well: no fragility leaks on persona-recover (no "consult your doctor" inline; the "not a diagnosis" line on `/check/hip` is direct and confident); the empty-extras copy on persona-strength/persona-erratic ("This program has no extras — every prescribed session lives on Today.") does all three empty-state jobs in 22 words; the Guide page is a genuine, cite-anchored glossary. This is the strongest copy the app has shipped.

---

## 2. Empty-state inventory

| Route × persona | Captured string | Orients? | Motivates? | Guides? | Rewrite / verdict |
|---|---|---|---|---|---|
| `/extras` persona-strength | "This program has no extras — every prescribed session lives on Today. You can still use the session-log card on Today to log cross-modal work (cardio, class attendance, walks) if you want it in your history." | y | y | y | ship as-is. |
| `/extras` persona-erratic | (same string) | y | y | y | ship. |
| `/today` persona-strength (extras block, 0 drills) | "0 drills available / Accessory work, mobility, around-runs. Optional — logged to today." | y | n | n | Rewrite: "No accessories today. Open Extras to log cross-modal work." (§2.13 arrow if primary.) |
| `/today` persona-erratic (rest day) | "Rest day. / Submax HR reduction at fixed pace has no session on the schedule today. Optional work (accessories, mobility, easy movement) lives on the Extras tab and still logs to today." | y | y | y | ship — 27 words, precise. |
| ReadinessTrail — no check history yet | (silent — returns `null` at `ReadinessTrail.tsx:61`) | n | n | n | **P1**: Trail should render 14 hollow-ring cells with tooltip "No check on Mon 4 Aug" instead of vanishing. Empty-state silent = orphan hierarchy. |
| WeeklyHeatmap — no cells | (silent — `WeeklyHeatmap.tsx:73-133` renders `.overflow-hidden` shell only) | n | n | n | **P1**: On History with <7 logged days, render a placeholder row: "Heatmap fills as you log — check in tomorrow." |
| `/coach` all personas | "404 / This page could not be found." | n | n | n | **Stale harness, not a copy bug** → see `app-audit-N-mobile-ux` for harness update. Coach content lives inline on Today now. |
| `/events` all personas | "404" | n | n | n | Same as `/coach` — harness debt. |
| `/progress` persona-strength + persona-erratic | "This page couldn't load / Reload / Back" | ? | ? | ? | **P0 platform bug flagged out of scope** → see `app-audit-N-mobile-ux`. Two of three personas can't reach Progress. Copy is fine; runtime failure is the story. |
| `/report` persona-strength + persona-erratic | (same "couldn't load" boundary) | ? | ? | ? | Same as above. Persona-recover reaches it, so error is data-shape-dependent. |
| `/report` persona-recover — hip-flexor check with no data | "No checks logged in this range." | y | n | y (implicit) | Add motivate: "Log a check on `/check/hip` — the report fills as you do." |
| `/progress` persona-recover — hip flexor sub-track | "Not logged yet. / No data yet" | y | n | n | Rewrite: "No hip check on file yet. Runs 6 items, ~4 min — `Start check ▶`." Landing cite: monthly cadence. |

---

## 3. Proposal explanations (the core promise)

Persona-strength `/today` — **1 proposal captured** (dashboard reveal card):

| Proposal | Has 'why'? | Cites source? | Verdict |
|---|---|---|---|
| "ROOM TO PUSH — HEADROOM ON YOUR LOG · Because: 3 straight green days plus 'felt strong' in a recent note. The engine reads that as headroom. / block pull (midshin) · 147.5 → 152.5 kg (+5) / back squat (high bar) · 115 → 117.5 kg (+2.5) / Source: Rhea et al. 2003 / APPLY BUMP / IGNORE" | **yes** | **yes** (Rhea et al. 2003) | Ships. This is the product's core promise in one card: verdict eyebrow, `Because:` prefix, lift-by-lift deltas, cited source, Accept + Ignore. |

Persona-recover `/today` — **1 proposal captured**:

| Proposal | Has 'why'? | Cites source? | Verdict |
|---|---|---|---|
| "YOU LOOK READY TO LEAVE REINTRO · Because: Two straight sessions above 80% TM at RPE ≤ 7 with no red/amber days. Mechanically you're done with Phase 1. / 2026-08-19 · block_pull_midshin · 101 kg × 5 @ RPE 7 · 80.2% TM / … / 2 most recent qualifying sessions · 1 lower-intensity session in between didn't hit the threshold / Source: ACSM 2002 / ADVANCE TO CYCLE 1 — FIRST REAL 5/3/1 FSL / IGNORE" | **yes** | **yes** (ACSM 2002) | Ships. `block_pull_midshin` still leaks as snake_case in the qualifying-sessions readout — humanize helper is imported for the deltas but not for the receipts. See §5. |

Persona-erratic `/today` — **0 proposals** (amber morning check + rest day). Correct — engine doesn't propose into an amber state. HeroStateCard already carries the "Hold load" explanation.

**Gap vs. landing promise**: landing says "every change cites a study OR names its log signal." Both captured proposals cite a study *and* name the log signal (3 green days / 2 qualifying sessions). Delivered.

**§2.13 vocabulary compliance for proposal buttons**:
- Spec says `Accept` / `Ignore`.
- Captured: `APPLY BUMP` / `IGNORE` (persona-strength), `ADVANCE TO CYCLE 1 — FIRST REAL 5/3/1 FSL` / `IGNORE` (persona-recover).
- Source: `next-app/src/lib/proposals/useProposalActions.ts:120-135` — verb is per-proposal-kind.
- **Verdict**: this is *stronger* UX than a bare "Accept" — the user knows what they're accepting without reading the card body. But it's a spec drift. Recommend: ratify per-kind verbs in the design system OR fall back to `Accept`. Do not leave the doc-spec/code mismatch.

---

## 4. CTA vocabulary compliance (§2.13)

| CTA (locked) | Source expected | Persona captured text | Compliant? | Notes |
|---|---|---|---|---|
| `Open session →` | `TodaySession.tsx:601` `label: "Open session"` + ChevronRight icon | "Open session" | icon-arrow, not glyph | Text extract can't see SVG. Design consistent with `Save check` — both use `<ChevronRight>`. |
| `Start block ▶` | `dev/primitives/page.tsx:282` `Start block ▶` | not surfaced on any live route yet | n/a | Only in dev primitives. Ships as literal ▶ glyph. |
| `Make this my focus →` | `ProgramPreviewClient.tsx:527,558` `"Make this my focus"` / `"Make this my focus (replace current)"` | not surfaced (both personas already active) | n/a | No arrow suffix in source string. Preview didn't test this path. |
| `Save check →` | `check/page.tsx:199` `Save check` + `<ChevronRight>` | "Save check" | icon-arrow, not glyph | Same convention as Open session. Fine, but see the mixed convention below. |
| `Manage →` | — | not captured | n/a | Not on the persona routes. |
| `Why this? →` | `ProposalCard.tsx:127` LITERAL `Why this? →` glyph | "WHY?" (from HeroStateCard, different label) | **mixed** | HeroStateCard uses bare "Why?" (no arrow, no "this"). ProposalCard uses "Why this? →" literal glyph. Two different labels for the same explanatory affordance. |
| `Log extra session →` | `RunSlotCard.tsx:67` `"Log an extra session"` | "Log an extra session" | **no** — extra "an", no arrow | **P1 rewrite**: "Log extra session →". Drop "an", add arrow glyph. |
| `Accept` / `Ignore` | Locked | "APPLY BUMP" / "ADVANCE TO CYCLE 1 …" / "IGNORE" | **partial** — Ignore locked, Accept substituted | See §3. |

**Mixed arrow convention** — icon (`<ChevronRight>`) is used on `Open session`, `Save check`; literal `→` glyph is used on `Why this?`, `Check due`, `Start check`, `Escalate`. This is a design-lead call, but the spec appears to want the literal glyph (that's how §2.13 documents it). Two visually identical arrows implemented two ways is invisible drift — pick one.

---

## 5. Terminology map — the tier ladder P0

| Concept | Terms in use | Occurrences | Recommend |
|---|---|---|---|
| Program tier ladder | `REFERENCED` / `REVIEWED` / `VERIFIED` (catalog + legend) vs. `cited` / `verified` (preview + evidence) vs. `referenced` (Live-now strip) | catalog ×15+, preview ×3, evidence ×N, strip ×3 | **§7.5 says two tiers: `cited` / `verified`.** Fix: catalog card chips should map REFERENCED → `cited`, REVIEWED+VERIFIED → `verified`. Live-now strip: "5 cited · live now" or "5 programs · live now". Kill the "referenced" surface label — reserved for internal/manifest data. |
| Session names | "session" / "block" / "workout" | Today H1 is program-name; block list uses "block"; RunSlotCard says "extra session"; navbar has "Open session" | consistent — "session" is the container, "block" is the training unit. Ship. |
| Symptom scale | 0-10, "3/10", "4-5/10", ">5/10", "above 3/10" | Amber card, Guide, HeroStateCard, morning check | consistent, but Guide should be the canonical explainer (Green ≤ 3, Amber 4-5, Red > 5). It is. |
| Training max | "TM" (used everywhere) | ~30 | Guide defines it once (`guide/page.tsx`) — ship. |
| RPE | "RPE 7", "RPE ≤ 7", "@ 7" | HeroStateCard, ProposalCard, Guide | Guide defines. First-appearance on Today includes "@ RPE 7" — a novice user hits this before Guide. **P1**: HeroStateCard subtitle amber ("Hold load. A 4-5/10 or morning stiffness over 30 min.") does not name RPE, so first-appearance is on the block list where "×5 @ RPE 7" is presented cold. Consider Guide-hover tooltip on first RPE token. |
| Symptom regions | "L Groin", "Low back", "L Buttock", "R Shoulder" | check/hip | ✅ lay language, sides annotated. Ship. |
| Green/Amber/Red state pills | "Workout ready" / "Check first" / "Back off" / "No check" | HeroStateCard | new labels per §5 — feel right. "Workout ready" is a promise word; "Check first" is a caution word; "Back off" is direct without being alarmist; "No check" is neutral. Ship. |
| Snake-case leak | `block_pull_midshin` | persona-recover Today reveal, Progress top-lift readout, Report load-progression, History | **P1** — `humanizeExerciseId` is imported in ProposalCard but the qualifying-sessions receipt block (persona-recover Today line 18-19: `block_pull_midshin · 101 kg × 5 @ RPE 7 · 80.2% TM`) still shows raw slug. Grep `next-app/src/components/workout/ProposalCard.tsx` for `block_pull_midshin` — the render for readiness_after_layoff receipts uses `l.exerciseId` directly instead of `humanizeExerciseId(l.exerciseId)`. |

---

## 6. HeroStateCard + ExplainSheet body copy (§5)

**Score-hero composition captured** (persona-strength Today):
```
WORKOUT READY
WHY?
Progress load. Nothing above 3/10 in your check.
```

- **StatusPill label**: `Workout ready` (lowercase in source, CSS uppercase-tracking → "WORKOUT READY"). ✅
- **Adjacent Why? button**: single trigger (not two). ✅ matches design-lead condition 2.
- **Body copy**: "Progress load. Nothing above 3/10 in your check." — 8 words, cites threshold (3/10), names signal source (check). ✅ meets ExplainSheet body-copy rules: no exclamation, no hedging.

**Persona-recover** captured the same "Workout ready" state on Today — HeroStateCard is date-aware and the persona's morning check was green.

**Persona-erratic** captured amber:
```
CHECK FIRST
WHY?
Hold load. A 4-5/10 or morning stiffness over 30 min.
```
- StatusPill `Check first` amber. ✅
- Body: 11 words, cites both threshold (4-5/10) and 30-min stiffness rule. ✅

**Red state** (not surfaced by any persona this run): source at `HeroStateCard.tsx:73` reads "Back off. Something above 5/10 or a red flag noted." — 10 words, cites threshold, no alarmism. Escalate link at line 131-136 uses literal `→` glyph. Ship.

**No-check state**: `HeroStateCard.tsx:87-88` — "No check yet / Save a morning check to calibrate today's load." Card is a `/check/` link. ✅

**ExplainSheet content**: `HeroStateCard.tsx:141-151` — sheet passes `citation: { study: "Kellmann 2010 · Scand J Med Sci Sports", threshold: "All symptom scores ≤ 3/10 → progress load" }` and `logSignal: { signal: "Morning check clean · all regions ≤ 3/10", source: "morning check" }`. Threshold cited, signal named. Ship.

---

## 7. Forms & labels

**Morning check** (persona-strength `/check`):
- Labels: `Low back`, `Any joint pain`, `Muscle soreness`, `Shoulder / upper body`, `Woke me at night`, `Morning stiffness`, `Life load (0=fresh, 10=cooked)`, `Outside training yesterday`.
- ✅ Lay language throughout. `Life load` is a delightful phrase — "0=fresh, 10=cooked" is the exact right amount of hint.
- ✅ Persistent labels above each slider.
- Sub-tag: `L Groin`, `L Buttock`, `R Shoulder` — left/right badges are readable. ✅

**Morning check** (persona-recover `/check`):
- Same shape, includes region-specific hip inputs (`L Groin`, `L Buttock`, plus `Clicking present`, `Clicking is painful`, `Woke me at night`, `Shortened my stride when running`).
- ✅ "Shortened my stride when running" — user-voice, not "gait alteration".

**Notes prompt**: none captured. The `Outside training yesterday` textarea explainer says "The engine reads these. Keywords like padel, hike, poor sleep feed today's proposal — no LLM, just a keyword parser, all done on-device." — 26 words, sets expectation, names the mechanism. ✅

**Save button**: "Save check" + `<ChevronRight>` icon. Spec wants literal `→`. Mixed-convention nit. See §4.

---

## 8. Onboarding

Not captured by these three personas — all three enter with an already-active program (persona-recover on Anterior Hip Rebuild, persona-strength + persona-erratic on Concurrent-Strength Maintenance). The `Baseline setup — a few minutes / 7 short questions to set your baseline. The rest of the program is generated from that.` line on `/programs/{slug}` (07-programs-active.txt line 46-48) is the closest thing captured. ✅ 17 words, one goal, one CTA implied.

Persona artifact gap: no persona covers the fresh-signup path. Onboarding-flow copy is untested by this run — recommend adding a `persona-fresh-signup` to the harness.

---

## 9. Tone vs. positioning

Landing promises (from `landing/src/i18n/dictionaries/en.ts`, remembered): "adaptive strength, cardio, and rehab · sharper every session · engine proposes, you Accept or Ignore · not fragile — sharpens against your log · pick one focus".

| Promise | App evidence | Match? |
|---|---|---|
| "engine proposes, you Accept or Ignore" | Persona-strength: `APPLY BUMP` / `IGNORE`. Persona-recover: `ADVANCE TO CYCLE 1 …` / `IGNORE`. | **partial** — the ceremony is exactly right, but the primary verb has drifted from "Accept" (see §3, §4). |
| "every change cites a study" | Both captured proposals include `Source: Rhea et al. 2003` / `Source: ACSM 2002`. | ✅ |
| "pick one focus" | Programs catalog H1: "Pick your focus." Programs preview CTA: `Make this my focus`. | ✅ |
| "not fragile" | Persona-recover `/check/hip` ground rules: "Skip any test that produces sharp or shooting pain. Log the pain, don't push through it." No timid language. Report page: "This is a self-tracked training log, not a diagnosis." Confident, not hedged. | ✅ |
| "adaptive to how you respond" | Persona-erratic amber card: `Not feeling 100% · ×0.95 applied+1 more`. Persona-recover Today: engine reads two qualifying sessions → advance proposal. | ✅ |
| "runs alongside your existing week" | Persona-strength Today: `Log an extra session / Cross-modal work, walks, class attendance, mobility — anything not in the prescribed block. Optional. Nothing here changes the plan.` | ✅ — "Nothing here changes the plan." is exactly the escape hatch the landing promises. |

**Streak / motivational / gamification hits**: **zero**. Greppable confirmation:
- `streak` appears only in engine internals (`adapt.ts` green-streak check) + code comments ("R5-adjacent to invite 'keep the streak going'" — comment describes what is REJECTED).
- Emoji: zero in prod strings. `progress/page.tsx:463` comment references a removed 🎉.
- No "Great job!" / "Keep going!" / "You missed 3 sessions" strings.
- No "consult your doctor" fragility outside `/legal/*`. Persona-recover `/check/hip` says instead: "you already have an orthopaedist and physiatrist for that. The point is to catch changes between appointments." — confident, positions the app.

---

## 10. Program preview tier pills (§7.5 collapse)

**Persona-strength `/programs/concurrent-strength-maintenance`** captured:
```
Concurrent-Strength Maintenance
ACTIVE
VERIFIED
```
Source: `ProgramPreviewClient.tsx:196-213` — `active` (green tone), `verified` (green tone, mapped from REVIEWED per §7.5). ✅

**Persona-recover `/programs/anterior-hip-rebuild`** captured:
```
Anterior hip + strength rebuild
ACTIVE
PERSONAL
```
Source: `ProgramPreviewClient.tsx:214-216` — `personal` slate. ✅ Correctly no tier chip (personal programs sit outside the ladder per S6 Batch 31).

**Persona-erratic `/programs/concurrent-strength-maintenance`** same as persona-strength. ✅

**Verdict**: preview page is fully §7.5 compliant. This is where the collapse landed cleanly.

---

## 11. Compare vs. pre-Batch-36 baseline

Baseline `persona-strength/text/01-today.txt`:
```
Thursday 20 Aug
Today
Today
ROOM TO PUSH — HEADROOM ON YOUR LOG
… APPLY BUMP / IGNORE
Today
No check yet
Save a morning check to calibrate today's load.
```

Post-Batch-36 same file:
```
TERAV
CONCURRENT STRENGTH MAINTENANCE
3/4
TODAY · WEEK 3 OF 4 · ENDS 30 AUG
Concurrent Strength Maintenance
Thursday 20 Aug
Today
ROOM TO PUSH — HEADROOM ON YOUR LOG
…
WORKOUT READY / WHY? / Progress load. Nothing above 3/10 in your check.
```

**Wins**:
- Eyebrow lands: `TODAY · WEEK 3 OF 4 · ENDS 30 AUG` (mono-caps 10px per spec).
- H1 changes: `Today` → `Concurrent Strength Maintenance` (program name, not the generic "Today").
- HeroStateCard modernized: `No check yet / Save a morning check…` full card → compact StatusPill `WORKOUT READY` + Why? trigger + threshold-cited body.
- Program status ribbon added: `3/4` progress fraction visible at top.

**Persona-recover baseline** on `/programs/concurrent-strength-maintenance` had `REVIEWED`; post-Batch-36 has `VERIFIED`. This is a tier promotion (the concurrent program moved up the ladder), not a copy regression. ✅

**No regressions found** in captured strings from baseline vs. post-Batch-36 across the 15 routes × 3 personas.

---

## 12. Priorities

**P0 (blocks the product promise)**:
1. **Tier ladder terminology collision** — catalog says `REVIEWED`, preview says `VERIFIED`, evidence says `REFERENCED`, live-now strip says `referenced`. §7.5 says collapse to two: `cited` / `verified`. Fix `next-app/src/app/programs/page.tsx:442-462` (StatusChip map) to use `cited` / `verified` labels; fix line 235 to read "5 programs · live now" or "5 cited · live now"; fix `evidence/page.tsx:87-89` per-citation label to render `cited` instead of `REFERENCED`. One user-facing lexicon, three surfaces.

**P1 (polish this month)**:
2. **Snake-case leak** in `readiness_after_layoff` proposal receipt block — persona-recover shows `block_pull_midshin · 101 kg × 5 @ RPE 7`. `humanizeExerciseId` is imported; wrap the receipt line too (`components/workout/ProposalCard.tsx`).
3. **`Log an extra session` → `Log extra session →`** — drop "an", add arrow glyph. `RunSlotCard.tsx:67`.
4. **ReadinessTrail empty state** — currently returns `null` when no check history. Should render 14 hollow-ring cells so hierarchy stays intact. `ReadinessTrail.tsx:61`.
5. **WeeklyHeatmap empty state** — silent when cells array empty. Add "Heatmap fills as you log — check in tomorrow." placeholder for users with <7 logged days.
6. **Progress hip-flexor sub-track empty state** — "Not logged yet. / No data yet" is orient-only. Add motivate + guide: "No hip check on file yet. Runs 6 items, ~4 min. `Start check ▶`."
7. **Accept verb decision** — ratify per-kind verbs (`Apply bump`, `Advance to Cycle 1`, `Log reading`) in `terav-design-system-v1.1.md` OR revert to locked `Accept` in `useProposalActions.ts`. Do not leave doc/code drift.
8. **Arrow convention** — pick one: icon (`<ChevronRight>`) OR literal glyph (`→`). Currently mixed across `Open session`, `Save check`, `Why this?`, `Escalate`, `Check due`, `Start check`. Recommend literal glyph for text-based CTAs and icon only when button is icon-only.

**P2 (nice-to-have)**:
9. **`Why?` vs `Why this? →`** — HeroStateCard uses bare "Why?", ProposalCard uses "Why this? →". Same affordance, different label. Standardise on `Why this? →`.
10. **First-RPE token tooltip** — on Today's first RPE surface (block list `×5 @ RPE 7`), attach a Guide-hover explainer for novice users who haven't opened /guide.
11. **Persona harness stale routes** — `/coach` and `/events` return 404 across all personas. Coach content is now inline on Today; events route doesn't exist. Harness needs a rebuild — → see `app-audit-N-mobile-ux`.
12. **`/progress` + `/report` runtime failure** — persona-strength and persona-erratic both hit "This page couldn't load / Reload / Back" boundary. Copy is fine; the platform failure is the story. → see `app-audit-N-mobile-ux`.
13. **Onboarding path uncovered** — no fresh-signup persona in the harness. Add `persona-fresh-signup` so onboarding copy gets audited.

---

## 13. Summary

- **Overall verdict**: **COPY SHIPPABLE — one P0 tier-ladder collision to fix before batch close.**
- **CTA vocabulary compliance**: mostly compliant. Two drifts: `Accept` verb substituted per-kind (design-lead ratify or revert); arrow convention mixed (icon vs. literal glyph — pick one).
- **P0 copy issues**: (1) three-way tier ladder naming collision across catalog / preview / evidence — collapse to `cited` / `verified` per §7.5.
- **P1 polish**: snake-case leak on `readiness_after_layoff` receipts; `Log an extra session` → `Log extra session →`; ReadinessTrail + WeeklyHeatmap silent empty states; Progress hip-flexor no-data motivate line; Accept-verb doc/code ratification; arrow convention pick.

The score-hero (§5), ExplainSheet body copy (§7 rules), and program preview (§7.5) are the strongest parts of Batch 36. The catalog tier chip lagged.
