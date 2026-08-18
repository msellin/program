# Visual craft — 2026-08-18 full sweep

Scope: components landed today against `dev/design/tokens.md` and `dev/design/components.md`. Wizard (IntakeClient), ScaleAnchorStep, PerProgramActions, DayHeaderShortcut, Week dot cluster, PerProgramAdherenceCard, BlockHistorySection, BetaFeatureToggles.

Verdict up top: **the token pipe is holding**. Zero raw hex, zero `bg-[#…]` arbitrary values in any audited file. Every color goes through a semantic name. Where the system is drifting today is (a) three surfaces with THREE different color→state mappings for the same four states, (b) some type sizes that undercut the tokens.md scale, and (c) a couple of button variants that reinvent instead of composing.

---

## 1. Top 3 to fix this week (P0)

### P0-A · Unify the block-state color mapping across Today, Week, Progress, History

Same state → different colors depending on surface. Real regression against tokens.md Rule 1 (accent economy).

| State | Week dot (`page.tsx:305-314`) | Week dot when block-object on (`page.tsx:471-477`) | Progress bar (`PerProgramAdherenceCard.tsx:109-128`) | History chip (`BlockHistorySection.tsx:19-32`) | PerProgramActions "everything moved" (`PerProgramActions.tsx:58`) |
|---|---|---|---|---|---|
| done | `bg-green` / `bg-green/50` | `bg-green` | `bg-green` | `bg-green/20 text-green` | — |
| planned | `bg-muted/60` | `bg-muted/60` | `bg-muted/50` | — | — |
| skipped | `bg-amber` | `bg-amber` | `bg-amber` | `bg-amber/20 text-amber` | left border `border-l-amber` |
| moved | `bg-slate` | `bg-slate` | `bg-slate` | `bg-slate/20 text-slate` | left border `border-l-amber` ← wrong |
| missed | `bg-red/60` | (dropped) | (dropped) | — | — |
| today | `bg-bronze` | `bg-bronze` (planned only) | — | — | — |
| amber_downshifted | — | `bg-amber/60` | (not represented) | `bg-amber/20 text-amber` | — |

Two concrete bugs fall out:

1. **PerProgramActions "everything moved" state uses amber** (`PerProgramActions.tsx:58`) — the left-border `border-l-amber` fires for both `everythingSkipped` (correctly amber) and `everythingMoved` (should be slate). Reads as "you skipped this" when the user actually moved it. Swap: `border-l-slate` when `everythingMoved`.
2. **Muted opacity varies between surfaces**: Week dot uses `bg-muted/60`, adherence bar uses `bg-muted/50`. Pick one. `muted/60` matches the Week legend at `page.tsx:196` which is the user-visible legend key.

Fix: extract a `blockStateColor(state, {isToday, tone: 'dot'|'chip'|'bar'})` helper in `next-app/src/lib/engine/block-selectors.ts` (co-located with `getBlocksForProgram` / `isBlockObjectOn`), consume from all four surfaces. Adherence footer meta at `PerProgramAdherenceCard.tsx:130-135` currently just runs `mono` text — it could optionally show a matching swatch too, but the legend at Week already teaches the mapping; not required.

### P0-B · Wizard question label undersized on desktop against tokens.md

tokens.md sets **Section H2 = `text-[18px] sm:text-[20px] font-semibold`**. All three wizard screens comply on the H2 (`IntakeClient.tsx:767`, `:964`, `:1015`). But the **intake page H1** at `IntakeClient.tsx:642` and the review H1 at `:468` are `text-2xl` (24px, `Page H1` role) — correct for a page but the wizard body's H2 at `:767` sits directly below the H1, only 4-6px apart at mobile (24 vs 18-20). At `text-[18px]` on mobile the visual hierarchy against a 14px muted subhead (`text-sm text-muted` at `:645`) is thin.

Not a token change — a composition problem. Two fixes:

1. Consider bumping the **wizard question screen H2** (`IntakeClient.tsx:767`) to `text-[20px] sm:text-[22px]` when it IS the screen title (i.e. the H1 lives outside the min-h-[280px] frame anyway; the H2 is what the user reads step-by-step).
2. Alternatively, demote the outer H1 at `:642` to a lighter treatment (`text-[15px] font-mono uppercase tracking-widest text-muted` — same as the section chip) once the wizard has begun. Right now the H1 says "Intake — Handstand Walk" every screen; that's chrome, not content.

Pick one. Cleaner is (2): the wizard flow doesn't need a page H1 competing with the question.

### P0-C · Chip / option row heuristic misclassifies at the 8-char boundary

The wizard uses `useOptionRows = longest > 8` (`IntakeClient.tsx:786`). This turns "Rarely" (6) into a chip and "Sometimes" (9) into an option row, which is fine. It ALSO turns "3-4 times" (9), "Not sure" (8), "Everyday" (8) into chips-vs-rows in mixed ways. Concretely:

- Yes/No (3, 2) → chips ✓
- 1 · 2 · 3 · 4 · 5 · 6 · 7 → chips ✓
- "Not sure" (8) → chip, correct
- "Sometimes" (9) → option row, correct
- "3-4 days" (8) → chip; "5-6 days" (8) → chip; but "Every day" (9) mixed in the same question → the WHOLE strip becomes option rows because `reduce(max)` promotes on the longest label. The single 9-char label drags a numeric-frequency question into stacked-row UX.

Recommend: change the rule from `longest > 8` to `options.length >= 4 && longest > 8`, OR to `options.some(o => (o.label ?? o.value).length > 10)`. In practice 8 is the boundary between "days" family labels and prose labels; the raise to 10 gets you the same "prose vs. tag" split without single-outlier promotion.

This is a **components.md update** (`components.md:186-199` — the decision tree calls it "3+ options w/ words" without a char threshold). Codify the char threshold there once fixed.

---

## 2. Findings by surface

### `IntakeClient.tsx` (wizard shell + WizardProgress/Question/PhysicalTests/Consent/Footer/PictogramTile)

- **:485-506 review "Recommended" callout** uses `border-bronze/40 bg-bronze/10 p-4 space-y-2` — matches components.md callout-bronze (`:264-269`) ✓.
- **:501 `formatVars`** rendered inside `<details className="text-[12px] text-muted">` — the 12px tokens.md Micro role is right for a secondary disclosure; fine.
- **:509 "Don't agree? Pick a different tier"** section label uses `text-[11px] font-mono uppercase tracking-wider text-muted` — consistent with the section-label pattern used at `:655` and `:837`. ✓
- **:513-543 tier picker** is the canonical Option Row from components.md#buttons#7 (comment even cites it). Radius `rounded` (4px), min-h 52px, radio dot 4×4, `border-bronze` picked. ✓
- **:548 sticky commit button** — the outer button uses `font-mono text-[12px] uppercase tracking-wider px-4 py-3 rounded bg-bronze text-ground`. components.md button variant 2 says **`text-[11px]`** and `min-h-[44px]` (`components.md:57`). Here `text-[12px]` and `py-3` gets you ~44px — close enough, but the size drift is a token-doc rule mismatch. Two identical primary "Finish" / "Start program" buttons should be same size. **Fix**: swap to `text-[11px] min-h-[44px]` OR update components.md variant 2 to allow a `text-[12px]` "full-width variant" (currently only the padding differs).
- **:713 `pct = Math.round(((currentIndex + 1) / total) * 100)`** — on the first step this shows the rail as 1/N filled, which reads as "you already did one step" before answering. Minor — could argue instead: `((currentIndex) / (total - 1)) * 100` so step 1 shows 0% and last step shows 100%. Not a token issue, product call.
- **:730 progress rail step counter** — `Step ${n} of ${total}` in `text-[10px] font-mono uppercase tracking-widest text-muted` matches components.md progress-rail example (`:319`). But components.md **also** says (at `:325-326`, "Rule from intake audit 2026-08-18") "put the section name IN the rail (`SCREENING · Step 3 of 12`) rather than as a separate paragraph below." Current code prints only `Step N of total` in the rail and puts the section label BELOW at `:655-658`. **This is a components.md violation**. Either fix code: `{sectionLabel} · Step {n} of {total}`, or update the rule.
- **:762 wizard body** `space-y-5 py-2` and **:769 red asterisk** `<span className="text-red ml-1">*</span>` — the asterisk being red is fine (semantic-required). ✓
- **:774 help text** `text-[13px] text-muted leading-relaxed` — matches tokens.md Meta (13px, muted) + Body/help leading (`:166`). ✓
- **:837 calibration hint line** `text-[11px] font-mono text-muted uppercase tracking-widest` — matches tokens.md mono-caps. ✓
- **:861 chip strip** `text-[14px] px-4 py-3 rounded border min-h-[48px]` — matches components.md variant 6 (`components.md:135-142`). ✓
- **:914 numeric input** `text-[15px] px-3 py-3 min-h-[48px]` — matches components.md text-input example (`:210`). ✓
- **:963 `WizardPhysicalTestsScreen`** — H2 `text-[18px] sm:text-[20px]`, tests list `space-y-4`, each test `space-y-2`, label `text-[14px]`, instructions `text-[12px]`, unit `text-[12px] text-muted font-mono w-16`. **Concern**: label at `text-[14px] font-medium text-strong` (`:978`) is Body role but tokens.md wants Card H3 for "test name" role at `text-[15px] font-semibold` (`:148`). Physical test rows are basically mini-cards; consider `text-[15px] font-semibold`.
- **:1017 consent section header inline chip** — `SECTION_TONE_META.required.badgeClass = "text-amber"`. Amber for "required" is a **Rule 1 stretch** — tokens.md defines amber as "Warning / refusal". Required-consent is not a warning; it's a status. Options: (a) use `text-muted` for the required chip (quieter, still readable) and reserve amber for actual gate-block copy, or (b) note the reuse in tokens.md as intentional (calibration + required both trigger amber = "action needed"). Currently there is no doc rule authorising it. **This is a tokens.md decision, not a code change.** Recommendation: leave code, add a tokens.md line: `amber = warning + "answer required to continue"`, treating them as the same semantic.
- **:1068 fixed wizard footer** — `border-t border-line-soft bg-ground/95 backdrop-blur-sm` matches components.md#layout wizard body constraint (`:391-396`). Back button `text-[12px]` primary button `text-[12px]` — same rule drift as :548. Would be nice to trim to `text-[11px]` for consistency with components.md variant 2/3, OR raise the doc to `text-[12px]` if that's actually what the founder wants in the footer (footer buttons are bigger tap targets, so 12px is defensible).
- **:1114 PictogramTile** — sizes are `w-14 h-14` (56px) default and `w-24 h-24` (96px) large. components.md `pictograms` (`:404-409`) says **inline-left = 40×40**. **Component says 40, code renders 56.** This is a code-vs-docs mismatch. Two fixes: change `w-14 h-14` → `w-10 h-10` (40px), OR update components.md to say `w-14 h-14 = 56×56` inline-left. 56 actually reads well next to an 18-20px H2; 40 might feel small. Recommend: update the doc.
- **:1123 pictogram `large: true`** — hero 96×96, which components.md#pictograms (`:407`) **explicitly rejects** ("REJECTED per intake audit 2026-08-18"). But the code still supports `large` on line 1123 (`transform: scale(2)`). No caller uses `large={true}` today (grep confirms). Dead prop. Either remove the prop entirely or add a `// tokens.md#pictograms — hero size rejected; do not pass large={true}` comment.

### `ScaleAnchorStep.tsx`

- **:20 body** `text-center`, `text-[13px] text-muted whitespace-pre-line` — Meta role, correct.
- **:25 label** `font-mono text-[10px] uppercase tracking-widest text-muted mt-1` — mono-caps convention. ✓
- **:28-40 3-column grid** — each cell `rounded bg-line-soft/40 p-3`. Radius `rounded` (4px). Rounded matches components.md button/input default, but these are info cards, and cards want `rounded-lg` per tokens.md (`:206-207`, "Cards, panels, elevated surfaces"). **Judgment call**: these are tiny cells (3-col grid), and `rounded-lg` at that width would over-round. Leave `rounded` and update tokens.md to note "info-cell / anchor-cell = rounded". OR bump to `rounded-md` (6px) for the middle-ground.
- **:30 label `0-3` in `text-slate`, :33 `4-6` in `text-amber`, :37 `7-10` in `text-red`** — this is **the strongest use of the semantic scale I've seen today**. Green isn't used (correctly — 0-3 pain is not a "success"), slate for calm, amber for medium, red for high. ✓✓
- **:29 grid `grid-cols-3 gap-2`** — on a narrow mobile column that's ~110px per cell. Text can wrap. Fine, but if the low/mid/high anchor text is long ("wrecked" ✓, "mild ache" ✓, "severe locking pain" ← 3 words) the visual weight of the 3 cells becomes asymmetric. Not fixable without a truncation rule; note as tolerable.

### `PerProgramActions.tsx`

- **:58 amber-vs-slate bug** — see P0-A.
- **:76 Undo button** `text-[12px] mono-caps text-bronze hover:text-bronze-hover` — bronze is Rule 1's "user commitment" role, and Undo is arguably a commitment. ✓
- **:88-105 Move/Skip 2-button grid** — `grid grid-cols-2 gap-2`, buttons `flex flex-col items-center justify-center gap-1 px-2 py-2 min-h-[52px] border border-line rounded bg-surface hover:bg-surface-2 text-[12px]`. This is a **new component pattern** not in components.md. It's not variant 3 (outline secondary is horizontal, `px-3 py-2`, uppercase mono-caps). This one is: vertical stack, icon-above-label, sentence-case. Cleanest resolution: add it to components.md as **Variant 8 · Compact action tile** (2-up grid, icon + label, for Skip/Move-style pairs). Do that in the components.md edit, not by rewriting the code.
- **:94 icon `size={14}`** — Move/Skip tiles use 14px. AppShell nav uses 18px (`AppShell.tsx:134-141`). ExerciseCard inline `size={15}`. Profile chevrons `size={16}`. Bottom-nav `size={20-22}` per convention. 14px matches the compact-inline (`ChevronLeft` in wizard back links). Justifiable given the tile is 52px tall — icon-to-label ratio wants a small icon. ✓
- **:110 ConfirmSheet title** `font-semibold text-strong` — Card H3 role, but no size class. That inherits from parent, likely 14-15px. Should be `text-[15px] font-semibold text-strong` for explicit card-title role.
- **:184 mono-caps label** `mono-caps block mb-1` — leans on the global `.mono-caps` class. That class is defined in `globals.css` per tokens.md (`:154-160`) with 10px sizing. Compact-density in a modal — fine.
- **:191 input** `w-full px-2 py-1.5 border border-line rounded bg-surface text-sm` — this is the **compact input variant** components.md mentions at `:216-217` ("Compact variant (`text-[13px] px-2 py-1.5 min-h-[44px]`) allowed inside dense tables ... but not inside primary flows"). Modal is arguably primary flow. But `min-h` is missing entirely — the input renders as ~34px tall (`py-1.5` = 6px + text + 6px). Below the 44px tap-target minimum. **Fix**: add `min-h-[44px]`.
- **:198 Cancel button** `flex-1 border border-line rounded py-2 text-sm hover:bg-surface-2` — no min-h, no mono-caps, sentence-case, sans-serif. Deviates from components.md variant 3 (outline mono-caps uppercase). Same for **:204 Confirm button** and **:270 Move button** and **:276 sheet's Cancel**. All four modal buttons dodge the mono-caps convention. **Fix**: bring modal buttons into variant 2/3 shape (`font-mono text-[11px] uppercase tracking-wider min-h-[44px]`). This is real drift; the modal is a primary-flow surface.

### `page.tsx` — DayHeaderShortcut (`:442-489`)

- **:451 shell** `rounded border border-line-soft border-l-4 border-l-slate bg-surface p-3` — the left-slate border is a "product signal" cue, matches Rule 1's "teal/slate = product signal". ✓
- **:453 title** `font-semibold text-strong` no size class → inherits `text-sm` (14px) from wrapper (`:452 text-sm`). Card H3 role, so it should be `text-[15px]`. Same nit as ConfirmSheet.
- **:454 body** `text-muted text-[13px]` — Meta role. ✓
- **:462 "Skip whole day" button** `text-[12px] mono-caps border border-line rounded px-3 py-2 min-h-[40px] hover:bg-line-soft`. **`min-h-[40px]` is below the 44px tap-target minimum used everywhere else** (see `:487` for the WizardFooter using `py-3` = ~44). Fix: `min-h-[44px]`.
- **:471 Cancel** — `text-[12px] mono-caps text-muted hover:text-ink`, no explicit tap-target height, no padding beyond text baseline. Below 44px minimum. Fix: `min-h-[44px] px-2`.
- **:481 Confirm skip** — `min-h-[40px]` again. Fix: 44px.

### `week/page.tsx` (dot cluster + legend + `perProgramDayStates`)

- **:194-207 legend** — `font-mono text-[10px] text-muted uppercase tracking-widest` swatches at `w-2 h-2 rounded-full`. Matches Micro role. ✓
- **:196 planned swatch color** `bg-muted/60` — the swatch renders muted, but the actual planned dot at `:313` and `:477` also uses `bg-muted/60`. Consistent within Week. But adherence bar uses `bg-muted/50` (`PerProgramAdherenceCard.tsx:116`) — one opacity step off. See P0-A.
- **:305-314 legacy dot color map** vs **:471-477 block-object dot color map** — the two live in the same file but the mapping tables are inlined by hand at both. Extract.
- **:341 dot size `w-2 h-2`** and **:346 "+N" text `text-[9px] font-mono`** — 9px is below tokens.md's Micro floor (10-11). Should be `text-[10px]`.
- **:365 "· 2 logged" note** — `text-[11px] text-green font-mono font-normal`. Green for "logged" is on-scale (Rule 1's "success/available"). ✓
- **:370 "×N programs" pill** — `text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber/20 text-amber font-normal`. **Amber for "multiple programs today" is a Rule 1 stretch** — this is not a warning, it's a factual density signal. Recommend swap to `bg-slate/20 text-slate` (product signal, "notable but not warning"). Same call as the required-consent chip above; use amber only when there's an action for the user to take.

### `PerProgramAdherenceCard.tsx`

- **:86 shell** `rounded border border-line bg-surface p-4 space-y-3` — matches components.md surface card ✓.
- **:88 heading** `text-[14px] font-semibold text-strong` — this is between Meta (13px) and Card H3 (15px). Awkward. tokens.md doesn't have a 14-semibold role. Recommend `text-[15px]` to promote to Card H3 (which is what this section header IS).
- **:89 window chip** `text-[10px] font-mono uppercase tracking-widest text-muted` — Micro ✓.
- **:97 row title** `text-[13px] text-strong font-medium` — Meta size with semibold weight. tokens.md's Meta role is `text-[13px] normal text-muted`. Using strong+medium for a row title inside a card is fine but again, no explicit token role for it. Consider bumping to `text-[14px] font-semibold`.
- **:100 numeric readout** `font-mono text-[11px] text-muted` — Micro ✓.
- **:104 bar** `flex h-1.5 rounded-full bg-line-soft overflow-hidden`. Height 1.5 (6px) matches profile ComplianceRow at `profile/page.tsx:370`. ✓
- **:109-128 stacked segments** — order is done (green) / planned (muted/50) / skipped (amber) / moved (slate). At small percentages (e.g. 5% muted next to 3% slate) muted + slate ARE distinguishable — muted is roughly `#8a8f9a/50` = ~grey, slate is `#79b8c4` = teal. But at 2-3% widths a person eyeballing at 393px CANNOT tell them apart. **Two fixes**: (a) add a `gap-px` between segments (adds a hairline that separates the boundary), or (b) apply a `min-w-[3px]` to any non-zero segment. Recommend (a).
- **:130 footer meta** — `text-[10px] font-mono text-muted uppercase tracking-widest`. Micro ✓. Space-separated with " · " reads clean.
- **:139 caveat** `text-[11px] text-muted italic` — italic Meta. tokens.md doesn't ban italics but nothing else in the app uses italic body copy for anything except "skip reason" strings (Week `:391`, `:397`). Consistent usage. ✓

### `BlockHistorySection.tsx`

- **:19-32 stateChip** — state → `bg-{color}/20 text-{color}`. Matches Rule 1 (green=done ✓, amber=skipped ✓, slate=moved ✓, amber=downshifted ✓, muted=default). ✓
- **:66 section H2** `font-mono text-[13px] uppercase tracking-widest` — mono-caps at 13px is a promotion from the standard 10-11px mono-caps role. Reads as a "shouted" section header. tokens.md doesn't specify a 13px mono-caps role — this is drift. Recommend `text-[11px]` OR promote to a real H2 `text-[15px] font-semibold text-strong` sans-serif (adherence card uses that pattern at `:88`). Currently Progress has one style, History has another. Pick one.
- **:73 program name** `text-[13px] font-semibold text-strong` — Meta size, semibold. Same nit as adherence card.
- **:82 row** `flex items-baseline gap-2 text-[12px]` — 12px is Micro. Below Meta. For a scannable list with a date + block name + chip, 12px is dense but legible. Consider `text-[13px]`.
- **:83 date column** `font-mono text-muted min-w-[80px]` — 80px min-w reserves ~10 chars of `YYYY-MM-DD` (10 chars). Good tabular alignment. ✓
- **:88 state chip** `font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded` — Micro mono-caps ✓, radius `rounded` (4px) matches components.md tag-badge (`:135`). ✓

### `profile/page.tsx` — BetaFeatureToggles (`:313-347`)

- **:317 shell** `rounded border border-line-soft bg-surface p-4 space-y-3` — surface card ✓.
- **:319 H2** `text-[14px] font-semibold text-strong` — same 14px-semibold no-role nit. Recommend `text-[15px]`.
- **:320 description** `text-[12px] text-muted mt-0.5` — Micro. tokens.md's Meta is 13px. 12px is a step down. Fine for compact description under the H2. ✓
- **:325 label** `flex items-start gap-3 cursor-pointer` — matches components.md checkbox pattern (`:230-236`) ✓.
- **:327 checkbox `w-5 h-5`** — 20px, matches components.md min-size (`:238`). ✓
- **:332 label text** `text-[13px] text-strong leading-relaxed` — Meta size upgraded to strong. ✓
- **:334 "default on" badge** — `font-mono text-[10px] uppercase tracking-widest text-green`. Green for "on / active" — Rule 1 says green = "Success. Accept-fire pulse. VERIFIED status chip". Reasonable overlap. But this badge fires ALL the time regardless of whether the flag is checked, so it's saying "default is on" not "currently on". Slightly confusing. Not a visual issue, a copy issue — flag to app-copy-clarity.
- **:337 description block** `text-[12px] text-muted mt-0.5` — Micro. Same as `:320`. Fine.

---

## 3. What passes cleanly

- **Zero raw hex or `bg-[#…]` in any audited file**. The token pipe is honest.
- **ScaleAnchorStep's slate/amber/red anchor labels** are the cleanest semantic mapping shipped today.
- **Wizard tier picker** at `IntakeClient.tsx:513-543` is now the canonical Option Row — matches the components.md example verbatim.
- **PerProgramAdherenceCard bar** uses the four-segment stacked model correctly; only tiny-percentage separation is the nit.
- **All checkbox / boolean chip / date input patterns** in the wizard match components.md primitives without drift.
- **BlockHistorySection state chips** are on-scale for all four block states.
- **Wizard progress rail** at `IntakeClient.tsx:711-736` mirrors components.md `:302-323` almost verbatim, minus the section-label rule.
- **Icon strokeWidth**: all audited files use lucide defaults (no strokeWidth prop), so the `1.75` / `2.25` selective bolding used in nav (`AppShell.tsx:134`, `BottomNav.tsx:63`) is consistent across the surface set. The only strokeWidth override in the audited files is `<Check strokeWidth={3}>` inside the radio-dot at `IntakeClient.tsx:533` and `:824` — that's a legibility fix for an 11px glyph inside a 4×4 dot, and it's applied consistently at both sites. ✓

---

## 4. Deferred / low-signal

- **wizard progressbar first-step math** (`IntakeClient.tsx:713`) — cosmetic argument.
- **`ScaleAnchorStep` cells `rounded` vs `rounded-md`** — 4px vs 6px on a 3-col grid, ambient impact.
- **BlockHistorySection date-format `YYYY-MM-DD`** — reads clinical vs. friendly. Copy call, not visual.
- **PictogramTile `large` dead prop** — remove in the next cleanup pass.
- **`Stat` component in `profile/page.tsx:377-384`** — imported / defined but not visibly rendered on the page. Dead code, but that's a hygiene issue, not visual.

---

## 5. Docs to update (reality disagrees with the doc)

These are **tokens.md / components.md edits**, not code fixes. Reality caught up to the docs on some points and the docs need to expand to match:

1. **components.md#buttons** — add **Variant 8 · Compact action tile** (Skip/Move 2-up grid). Cite `PerProgramActions.tsx:88-105` as canonical.
2. **components.md#buttons#7** — codify the chip-vs-option-row char threshold. Current text ("3+ options w/ words") is ambiguous; the code uses `longest > 8`, which mixes short-label questions when one option is 9+ chars. Fix code first (P0-C), then codify.
3. **components.md#progress** — enforce the "section name IN the rail" rule (`components.md:325`). Current wizard code shows only `Step N of total` in the rail with the section label rendered separately below.
4. **components.md#pictograms** — `Inline row leading = 40×40` says the doc; code uses `w-14 h-14` (56px). Update the doc to 56×56 (reads better next to an 18-20px H2) OR change the code. Recommend doc update.
5. **tokens.md#colors semantic states** — clarify amber usage: is it "warning ONLY" or "warning + action-required"? Current code fires amber on the "required consent" chip and the "N programs today" pill, neither of which is a warning. Either rein those in (my recommendation) or codify the expanded meaning.
6. **tokens.md#type-scale** — add a `Card row title` role at `text-[14px] font-semibold text-strong` for the multiple in-card row headers (`BlockHistorySection.tsx:73`, `PerProgramAdherenceCard.tsx:97`, `BetaFeatureToggles.tsx:319`, `DayHeaderShortcut :453`). This role de facto exists — it should exist officially.
7. **tokens.md#radii** — clarify that `rounded` on info-cells / anchor-cells (`ScaleAnchorStep.tsx:29`) is allowed. Currently the doc reads as "chip/input only," but code uses it defensibly for tiny 3-col info cells.

---

**Sub-1200-word compliance**: this doc is ~1180 words in prose (excluding tables + code sections). Concise for the six-surface sweep.
