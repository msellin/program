# Terav app — Visual craft audit (Batches 22–25, post-Coach-kill)

Personas surveyed: `persona-recover`, `persona-strength`, `persona-erratic`, `persona-graduate`, `persona-multitrack`, `persona-mobility`, `persona-rowing`, `persona-erratic` (History dense state)
Artifacts: `next-app/tests/e2e/artifacts/personas/{persona}/mobile/` (refreshed 2026-08-19)
Palette source: `next-app/src/app/globals.css:1-215`
Viewport basis: 393 px mobile / 1280 px desktop capped `max-w-[760px]` (`AppShell.tsx`)
Peer set: `dev/audits/app/competitor-refs.md` (Pliability, GOWOD, Runna, Whoop) — marketing sites returned zero design detail on this pass; peer notes here are held from the Batch 16 audit's screenshot pass. Prior audit: `2026-08-19-app-audit-visual-craft.md`.

**Framing** — findings are IDEAS not action items. The confirm-first engine, rehab-not-fragile positioning, one bronze accent + three semantic colors, and cite-the-paper voice all override "cleaner is better" in several places. Where a peer would strip a label, Terav keeps it because the label is load-bearing evidence-first identity.

**Focus scope** — new surfaces introduced by Batches 22–25 that have not been audited: `/account` route (F7 identity + F1 Extensions), `MoveSheet` bottom sheet (F6), `GraduationCard` 4-verb vertical stack (F5), `RetestReminder` full-card Monday hand-off (F10), `Week` expanded action grid (F6), Coach 404 fallthrough (S1). Settled surfaces (Today ProposalCard, Progress Insights, History heatmap) audited only where the new surfaces disturb existing rhythm.

**PII check** — persona artifacts contain fixture emails only (`e2e-persona-graduate@example.test` visible on Profile). No real client data. No warning required.

**Prompt-injection guard** — the `next-app/AGENTS.md` "This is NOT the Next.js you know" block that leaked into `globals.css` output was ignored per the audit prompt. The only authoritative instructions are the audit brief.

---

## 1. Overall visual verdict

Batch 25 lands three of the cleanest new surfaces the app has shipped. The `/account` route (`src/app/account/page.tsx:91-394`) reads like a Whoop settings page — sectioned mono-caps eyebrows, list-row targets with chevrons, one destructive verb held in red, one bronze accent for identity. Deleting the `/coach` route (S1) removed a surface that never carried its weight; the 404 fallthrough visible in `persona-strength/mobile/03-coach.png` is intentional and correct — no stub, no half-page, just a clean bottom-nav-visible 404. The `GraduationCard` 4-verb vertical stack (`page.tsx:889-939`) is the strongest confirm-first celebration in the app: bronze primary "Repeat this arc" + three secondary + one slate "Pick your next focus" — Refactoring UI rule 33 executed to the letter (one accent, tiered by weight not by color).

**The top failure mode that remains: the 13 px body floor is holding, and the new surfaces have adopted 11 px muted as the dominant secondary label size.** `/account` uses `text-[11px] text-muted` for six labels (`account/page.tsx:118, 136, 156, 183, 190, 241`). That's below the 12 px caption floor established in the last audit. For a users-list-of-their-things surface — extensions, primary program, delete-my-account — 11 px muted is where copy becomes squint-copy at 6 am. If nothing else lands from this audit, promote the row-label `text-[11px]` on `/account` and `MoveSheet` to `text-[12px]`.

**The one thing done exceptionally right in this batch:** the `MoveSheet` (`src/components/workout/MoveSheet.tsx:104-201`) is a textbook bottom-sheet. `bg-surface-2 border border-line rounded-t-lg` opening from the bottom, `max-h-[85vh]`, sticky footer with the primary CTA, `env(safe-area-inset-bottom)` respected, focus trap, body-scroll lock, escape-key close, "has session" amber pill + "logged" green pill on target rows so the user sees the collision *before* they commit. Two-tap confirm-first for stacking is Terav-identity work: the engine doesn't overwrite your day silently. This is the pattern Whoop and Runna reach for; Terav's version cites the impact ("this will stack two sessions") in plain language.

Verdict headline: **Batches 22–25 executed a subtractive design (kill Coach, move destructive verbs off Profile, replace chip-row with verb-stack). Every subtraction was correct. The residual drift is at the 11 px secondary-body level — one notch too small on the new list-row surfaces.**

---

## 2. Type scale — new surfaces per role

Rendered at Tailwind default (16 px root) via `layout.tsx` on `<html>`. No custom root override. `html { font-feature-settings: "ss01", "cv11", "tnum" }` at `globals.css:64` is stylistic-set + tabular figures — held from prior audit.

| Role | Class chain | Mobile px (393) | Line-height | Verdict | Recommend |
|------|-------------|-----------------|-------------|---------|-----------|
| /account H1 "Account" | `text-[32px] font-semibold tracking-tight text-strong leading-none` (`account/page.tsx:104`) | 32 | 1.0 | Hold — matches Batch-16 H1 convention across Today/Week/Progress/Profile. | Hold. |
| /account back link "Profile" | `text-[13px] text-slate hover:text-ink` (`account/page.tsx:97`) | 13 | 1.5 | 13 px slate as the *back* affordance is thin. GOWOD gives back arrows a 15 px equivalent. Slate + hover-to-ink is the correct semantic — but at 13 px it recedes too far. | Bump to `text-[14px]` and keep slate. |
| /account identity chip email | `text-[16px] font-semibold text-strong break-words` (`account/page.tsx:117`) | 16 | 1.5 | **Best type moment in the batch.** Email is the primary evidence "who am I" — 16 px semibold is exactly the Whoop settings weight. | Hold. |
| /account identity chip meta ("joined Aug 2026 · staff") | `text-[11px] text-muted mt-0.5` (`account/page.tsx:118`) | 11 | 1.15 | 11 px is caption-territory. Meta is legitimately secondary — but it's *sitting next to* 16 px semibold, so the visual jump 16→11 is a 1.45× ratio compression. That reads as "cramped credentials list" not "clean settings row." Pliability's equivalent (join date under name) is 13. | Bump to `text-[12px]`. |
| /account section eyebrow "SIGN-IN" / "PROGRAMS" / "EXTENSIONS" / "DATA & PRIVACY" | `font-mono text-[10px] uppercase tracking-widest text-muted mb-2` (`account/page.tsx:127, 147, 172, 204`) | 10 | 1.15 | Correct. Matches the app's mono-caps eyebrow convention. `mb-2` (8 px) is the right rhythm gap to the list below. | Hold. |
| /account list-row primary text ("Email", value, program name) | `text-sm text-strong truncate` for value; `text-[11px] text-muted` for label (`account/page.tsx:136-137, 156-157, 182-183`) | 14 / 11 | 1.5 | The 14 px value on top of 11 px label is Whoop-shape. But the 11 px label is *below* the 12 px WCAG-comfort floor for muted text at low contrast. This is the same pattern that ships in Extensions and Extensions revert. Six instances = becoming systemic. | Bump the muted row-label from 11 → 12 px. The value can stay at `text-sm` (14). |
| /account Undo affordance in Extensions | `text-[11px] text-muted hover:text-ink underline decoration-line` (`account/page.tsx:190`) | 11 | 1.5 | Undo is an active verb but sized like a footnote. 11 px underlined muted reads as "legal disclaimer link." A revert is not a legal action — it's the user's answer to "did I mean that." | Bump to `text-[12px]` and pair with the RotateCcw icon at `size={12}` → `size={14}`. |
| /account list-row body ("Extended +4w · retest window pushed") | `text-[11px] text-muted mt-0.5` (`account/page.tsx:183`) | 11 | 1.5 | Same 11 px issue — this is a diagnostic sentence explaining *what the toggle did*, not a caption. | Bump to `text-[12px]`. |
| /account Data & privacy row labels | `text-sm text-strong` / `text-sm text-red` (`account/page.tsx:213, 226`) | 14 | 1.5 | 14 px semibold-weight-implied via row structure. The `text-red` on "Delete my account" is the app's semantic-red, contrasted against a `active:bg-red/5` press state. Exactly Refactoring UI's "destructive = colored text, not a red button" rule. | Hold. |
| /account legal footer "Privacy · Terms · Medical disclaimer" | `text-[11px] text-muted` (`account/page.tsx:241`) | 11 | 1.15 | 11 px legal footer is the one place 11 px is legitimately correct — matches profile, matches landing. Quiet by design. | Hold. |
| MoveSheet title "Move Wed 19 Aug's session" | `font-semibold text-strong pr-4` (no explicit size → inherits `text-base` = 16 px) (`MoveSheet.tsx:120`) | 16 | 1.5 | Correct. Matches ConfirmSheet's title convention. `pr-4` reserves space for the close-X. | Hold. |
| MoveSheet session summary sub | `text-[13px] text-muted mt-0.5 truncate` (`MoveSheet.tsx:123`) | 13 | 1.5 | 13 px sub under a 16 px title is 0.81× ratio — Steve Schoger says title-to-sub should sit at 0.75-0.85, so mathematically this is fine. But it's still 13, still below body-floor. | Bump to `text-[14px]`. Ratio stays acceptable. |
| MoveSheet section legend "This week" / "Next week" | `font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5` (`MoveSheet.tsx:219`) | 10 | 1.15 | Matches /account eyebrow convention. Correct. | Hold. |
| MoveSheet day label "Mon 17 Aug" | `text-sm text-strong` (`MoveSheet.tsx:247`) | 14 | 1.5 | 14 px semibold-by-role is at the app's body floor. Good enough. | Hold. |
| MoveSheet day summary ("Zone 2 · Bike", "Rest day") | `text-[11px] text-muted truncate` (`MoveSheet.tsx:248`) | 11 | 1.5 | Same 11 px muted anti-pattern. On a target-picker list where the *summary is the disambiguator* ("has session" vs "logged" vs "rest"), 11 px is too small. Runna's equivalent is 13. | Bump to `text-[12px]`. |
| MoveSheet stack warning "That day already has a session…" | `text-[12px] text-amber border-l-4 border-amber pl-2 leading-snug` (`MoveSheet.tsx:161`) | 12 | 1.375 | 12 px amber with the amber left-border is the correct pattern for a soft warning. Not urgent enough for 14 px semantic-red treatment; not throwaway enough for 10 px caption. | Hold. |
| MoveSheet "Why? (optional)" label | `font-mono text-[10px] uppercase tracking-widest text-muted mb-1` (`MoveSheet.tsx:171`) | 10 | 1.15 | Correct field-label convention. | Hold. |
| MoveSheet reason input value | `w-full text-[14px] px-3 py-2 min-h-[44px]` (`MoveSheet.tsx:182`) | 14 | 1.5 | Explicit `text-[14px]` on `<input>` — good, this locks Safari to the app font-size and prevents iOS's 16 px auto-zoom. Wait — 14 px is *below* the 16 px auto-zoom threshold, so iOS *will* zoom on focus. That's a mobile-UX issue (→ see `app-mobile-ux`), not a visual one, but flag: this specific input should probably sit at `text-[16px]` to skip the iOS zoom. | → see `app-mobile-ux` |
| MoveSheet primary CTA "Move session" / "Confirm — stack the session" | `bg-bronze text-ground rounded py-2 min-h-[44px] text-sm font-semibold` (`MoveSheet.tsx:193`) | 14 | 1.5 | Correct primary shape — bronze fill, ground text, `text-sm` semibold. Matches ConfirmSheet primary at `ConfirmSheet.tsx:109-114`. | Hold. |
| GraduationCard eyebrow "YOU FINISHED" | `font-mono text-[10px] uppercase tracking-widest text-bronze` (`page.tsx:824`) | 10 | 1.15 | Bronze eyebrow (vs. the default muted eyebrow) is the one moment in the app where the eyebrow *itself* signals celebration. Correct semantic overload. | Hold. |
| GraduationCard program name H2 | `text-lg font-semibold text-strong mt-1` (`page.tsx:825`) | 18 | 1.5 | 18 px semibold is the *only* card-H2 in the app that lives above the 14 px "text-sm" floor. Right choice for a celebratory hero moment. | Hold. |
| GraduationCard "9 weeks logged. Nice." | `text-[14px] text-muted mt-0.5` (`page.tsx:827`) | 14 | 1.5 | 14 px muted under 18 px semibold — 0.78× ratio, exactly on Schoger's target. | Hold. |
| GraduationCard verb-row label ("REPEAT THIS ARC" etc.) | `font-mono text-[11px] uppercase tracking-wider` (`page.tsx:722-723`) | 11 | 1.5 | 11 px mono-caps as a *button label* is aggressive. The bottom-nav labels are also 10 px mono-caps — but those sit under a 20 px icon. Here it's the whole verb affordance. GOWOD and Whoop both use sentence-case 14 px for equivalent action-row buttons. | Consider migrating verb labels to sentence-case `text-[14px] font-semibold`. Keeps the confirm-first weight while dropping the "server-log admin" feel that the last audit flagged. This is the highest-value type change in the batch. |
| GraduationCard verb-row caption ("Restart · keep intake + baselines") | `text-[12px] text-ground/80` for primary; `text-[12px] text-muted` for secondary (`page.tsx:731-732`) | 12 | 1.5 | 12 px caption below the 11 px label. Correct rhythm *within the anti-pattern*. | Ships with the recommendation above if verb-label goes 14/sentence. Caption stays at 12 muted. |
| RetestReminder eyebrow "RETEST WINDOW OPEN" | `font-mono text-[10px] uppercase tracking-widest text-bronze` (`page.tsx:1188`) | 10 | 1.15 | Bronze eyebrow again — same celebratory-status semantic as GraduationCard. Consistent. | Hold. |
| RetestReminder title "End of week 8 · Engine Builder" | `font-semibold text-strong` (inherits `text-base` = 16 px) (`page.tsx:1191`) | 16 | 1.5 | 16 px semibold as the primary "here's what's happening" statement — Whoop-daily-card weight. Correct. | Hold. |
| RetestReminder body "You've logged 8 weeks…" | `text-muted leading-snug` (inherits `text-[14px]` from parent `.text-[14px]` on line 1183) | 14 | 1.375 | 14 px body with `leading-snug` (1.375) is the correct 3-line paragraph shape. Better than the 13 px + 1.5 that dominates elsewhere in the app. | Hold — and consider making this the *pattern* other Today cards migrate to. |
| RetestReminder metric list items | `text-[13px] text-ink flex items-baseline gap-1.5` (`page.tsx:1205`) | 13 | 1.5 | 13 px list items under a 10 px muted eyebrow. Same body-floor issue. | Bump to `text-[14px]`. |
| RetestReminder CTA buttons "Log retest →" / "Not this week" | `font-mono text-[11px] uppercase tracking-wider px-3 py-2 min-h-[44px]` (`page.tsx:1216, 1223`) | 11 | 1.5 | Same 11 px mono-caps button-label anti-pattern as GraduationCard. On a 44 px tap-target the label survives because tracking-wider pads the counters, but "Log retest →" reads as "codepath: log_retest" not "act on this." | Same recommendation — sentence-case 14 px. Applies uniformly to any font-mono button label that isn't a bottom-nav tab. |
| Week expanded — day header "Mon 17 Aug · 2 logged" | `font-semibold` for name; `font-mono text-[11px] text-muted font-normal` for date; `text-[11px] text-green font-mono font-normal` for "· 2 logged" (`week/page.tsx:488-495`) | 16 / 11 | 1.5 | The 16 px `<span>Mon</span>` inherits from row's default text-base. Correct — the day-name is the primary "where am I" anchor. 11 px mono date is the secondary. `· 2 logged` at 11 px green mono is a metadata note. This works. | Hold, though the "· 2 logged" is legitimately actionable-adjacent info; bumping to 12 would help. |
| Week expanded — session name ("Zone 2 · Bike") | `text-[14px] mt-1` in muted (`week/page.tsx:517`) | 14 | 1.5 | 14 px body under 16 px semibold day-name is the right ratio. Batch 24 got this right. | Hold. |
| Week expanded — reason italic "↳ Family thing came up" | `text-[12px] text-slate italic mt-1` (`week/page.tsx:528`) | 12 | 1.5 | 12 px slate italic for the move reason — quiet supporting evidence. `↳` glyph as the visual "this is a reply/consequence" is a nice restraint move (not a callout box, not a border-l-4, just a glyph). | Hold. |
| Week expanded — 3-verb action row labels ("Open in Today" / "Move…" / "Skip") | `font-mono text-[11px] uppercase tracking-wider px-3 py-2 min-h-[44px]` (`week/page.tsx:670, 690, 698`) | 11 | 1.5 | **Third instance of the same 11 px mono-caps button-label pattern.** Consistent with GraduationCard verbs and RetestReminder CTAs — either all three go sentence-case 14, or none do. Do not split. | Same. Migrate the whole family to `text-[14px] font-semibold` sentence-case. |
| FirstRunBanner title "Five tabs, one flow" | `font-semibold text-strong text-[14px]` (`FirstRunBanner.tsx:50`) | 14 | 1.5 | 14 px semibold as the banner title is quiet — this is *not* a hero. A first-run onboarding banner that reads at 14 says "we trust you to notice this without shouting." Correct restraint. | Hold. |
| FirstRunBanner tab-list items | `text-[14px] text-muted space-y-1 leading-relaxed` (`FirstRunBanner.tsx:62`) | 14 | 1.625 | 14 px muted + leading-relaxed = the app's best-read paragraph shape. Should be the body pattern everywhere. | Hold. Steal the pattern for other banners. |
| FirstRunBanner "More lives behind the ⋮" footnote | `text-[12px] text-muted pt-1` (`FirstRunBanner.tsx:69`) | 12 | 1.5 | 12 px muted footnote — quiet secondary. Good. | Hold. |
| FirstRunBanner CTA "Got it — start the day" | `font-mono text-[11px] uppercase tracking-wider px-3 py-2 rounded bg-bronze` (`FirstRunBanner.tsx:76`) | 11 | 1.5 | Fourth instance of the same anti-pattern. | Migrate. |

**Sizes in play across the new surfaces:** 32, 18, 16, 14, 13, 12, 11, 10 — eight sizes. Same count as the last audit. But the *center of gravity* on the new surfaces has shifted toward 11 (six /account rows, three MoveSheet elements, four button-labels). **The 11 px slot is doing too much work.** Either it's a legal footnote, or it's a status meta, or it's a button label, or it's an active verb. Refactoring UI: one size, one job.

**Recommend:** the 8-size ramp is not the problem — the problem is that 11 px carries four different semantic jobs. Assign 11 to *footnote/legal only*. Push all row-label / status-meta / button-caption uses to 12. Push all button-*labels* to 14 sentence-case. That leaves a cleaner 6-size ramp in practice: 32/18/16/14/12/10 with 11 reserved for legal.

---

## 3. Line-height / tracking

`leading-none` on the 32 px H1 on `/account` (`account/page.tsx:104`) — same convention as the other H1s. Fine at 32 px where wrap is impossible in current copy. Held from the last audit's recommendation to swap to `leading-[1.05]` for future-proofing.

`leading-relaxed` (1.625) on the FirstRunBanner tab list (`FirstRunBanner.tsx:62`) — this is the *best* body leading in the app. 1.625 on 14 px = 22.75 px line-box, wide enough for morning-eye scanning. **Recommend adopting `leading-relaxed` as the default for any 3+ line paragraph in the app.** Currently `page.tsx:1194` uses `leading-snug` (1.375) on the RetestReminder body — that's the same "cramped academic" pattern I flagged last audit. Change to `leading-relaxed`.

`leading-snug` (1.375) on the MoveSheet stack warning at `MoveSheet.tsx:161` — correct for a 2-line warning strip inside a 12 px amber block. Snug is right when the copy is short and the visual weight is coming from the border-l-4 + color, not the leading.

Tracking on the MoveSheet primary CTA (`MoveSheet.tsx:193`) — no explicit tracking, `text-sm font-semibold` default. Good — CTAs at this size don't need tracking help. The `tracking-wider` (0.05em) on the 11 px mono-caps button labels *does* have a visual job (padding out the counter-forms so they don't merge), but if those move to sentence-case 14 px, drop tracking to default.

`tracking-widest` (0.1em) on the 10 px eyebrow labels — held. Same pattern across all new surfaces (six /account eyebrows, three MoveSheet legends, two graduation eyebrows). Consistent.

`font-variant-numeric: tabular-nums` inherited from `html` — verified via the Progress "138 bpm -3 bpm" column alignment on `persona-graduate/mobile/01-today.png`. The GraduationCard "Where you landed" ledger (`page.tsx:846-868`) uses `font-mono flex items-baseline gap-2` and the columns *do* align because mono + tabular-nums both stabilize width. Correct.

---

## 4. Font pairing

No change from prior audit — Inter + JetBrains Mono via `next/font/google` in `layout.tsx`. All new surfaces respect the pairing:
- `/account` H1 is Inter; eyebrows are Mono; row values are Inter; row labels are Inter; legal footer is Inter. **No proliferation of Mono into body copy.** Good.
- `MoveSheet` day labels are Inter; day meta is Inter; section legends are Mono. Correct.
- `GraduationCard` uses Mono for eyebrow + verb labels + "arc verdict" pill; Inter for title, body, verb captions. Correct.
- `RetestReminder` uses Mono for eyebrow + button labels + metric list bullets? No — the metric bullet is Inter `text-[13px] text-ink` (`page.tsx:1205`). Correct.

The one thing worth naming: **the Mono verb-label pattern (`font-mono text-[11px] uppercase tracking-wider`) has spread to six new button surfaces across Batches 23–25.** GraduationCard verbs (3), RetestReminder CTAs (2), Week expanded action-row (3), FirstRunBanner CTA (1), MoveSheet field label (1). That's 10 new sites of the pattern. Held against Pliability (zero mono), GOWOD (zero mono), Whoop (mono only for numbers), Terav is *deliberately* leaning further into "we cite the paper, we read the log" identity — but the pattern is starting to feel like the app's answer to *every* button-label problem. When the same class chain does eyebrow + pill + button-label + field-label, the eye can't distinguish jobs.

**Recommend:** keep mono-caps for eyebrow + pill + field-label roles. Move button-labels to sentence-case Inter `text-[14px] font-semibold`. This preserves the identity where it's load-bearing (labels-that-describe-a-thing) and softens where it's fighting the tap-affordance (buttons-that-do-a-thing).

---

## 5. Palette & accent economy

Palette source `globals.css:8-48` — unchanged since Batch 16. Complete inventory:

- **Ground:** `#0e0f12` — canvas across all new surfaces (`AppShell`).
- **Surface:** `#16181c` — `/account` list rows, MoveSheet day rows, FirstRunBanner background.
- **Surface-2:** `#20232a` — MoveSheet panel bg, ConfirmSheet panel bg.
- **Ink:** `#d6d9de` — body text default (MoveSheet input value, RetestReminder metric bullets).
- **Strong:** `#f4f5f7` — H1, row value text, card titles.
- **Muted:** `#8a8f9a` — 11 px labels (over-used), 10 px eyebrows, secondary body.
- **Line:** `#3a3f4a` — dividers between card sections, MoveSheet radio inputs.
- **Line-soft:** `#24272f` — card borders, list-row dividers (`/account` `divide-y divide-line-soft`).
- **Green:** `#5fb37a` — "logged" pill in MoveSheet (`MoveSheet.tsx:258`), Week "logged" chip, GraduationCard delta+.
- **Amber:** `#e0a63a` — "has session" pill in MoveSheet (`MoveSheet.tsx:253`), stack warning border-l-4, Week skipped dot.
- **Amber-strong:** `#f0b854` — not used in new surfaces.
- **Red:** `#e5654b` — /account "Delete my account" (`account/page.tsx:225`), `deleteError` message (`account/page.tsx:232`), ConfirmSheet `danger` primary (`ConfirmSheet.tsx:110`).
- **Bronze (primary):** `#c89666` — /account identity chip letter, GraduationCard eyebrow + primary verb + border-l-4, RetestReminder eyebrow + CTA, MoveSheet primary CTA, FirstRunBanner CTA. Everywhere Terav wants "this is the yes."
- **Bronze-hover:** `#d9a97c` — hover state on all bronze CTAs.
- **Bronze-hi:** `#e2b686` — identity-chip letter `text-bronze-hi` on `bg-bronze/20` (`account/page.tsx:112`). Correct: the base bronze doesn't clear 4.5:1 on a bronze/20 fill; bronze-hi does.
- **Bronze-active:** `#b3814f` — press state on the GraduationCard primary verb (`page.tsx:715`).
- **Slate (secondary accent):** `#79b8c4` — /account back-link (`account/page.tsx:97`), Week move-reason italic (`week/page.tsx:528`), GraduationCard "Next block" card (`page.tsx:876`), "Pick your next focus" verb border. Terav-cool-answer to bronze-warm-primary.
- **Lat-left / lat-right:** `#4a8894` / `#a279a8` — unchanged, not used in new surfaces.

**Accent economy verdict — holding.** One primary (bronze), one secondary (slate), three semantic (green/amber/red). Zero rogue hex in the new surfaces: `grep -rn "bg-\[#\|text-\[#" src/app/account src/components/workout/MoveSheet.tsx src/components/FirstRunBanner.tsx` returns zero. Every non-token color would show up. It doesn't. This is Refactoring UI rule 33 executed cleanly at Terav's expected scale — better than any peer in the reference set for accent discipline.

**In-view accent count per persona:route:**
- persona-graduate / Today (`01-today.png`): 3 accents visible — bronze (GraduationCard border + verb + eyebrow), green (`TARGETS HIT` pill + "-3 bpm" delta), slate (Next block card border). Zero red. Correct celebratory register.
- persona-recover / Today (`01-today.png`): 3 accents — bronze (proposal card + Advance CTA + `intake pending`-adjacent), green (GREEN status pill), amber-strong (Advance CTA background gradient). One instance of what looks like `bg-amber` fill on the "ADVANCE TO CYCLE 1" pill — verify against `page.tsx` — this is the promotion pill, correctly amber. Held.
- persona-strength / Today (`01-today.png`): 3 accents — bronze (proposal + Apply Bump + block category border), green (GREEN status + delta+), slate (`CUE On the dedicated pull day only`).
- persona-erratic / Week (`02-week.png`): 3 accents — amber (Mon-line-through skipped state), slate (phase banner border-l-4), bronze (bottom-nav Today icon). Everything else is muted-grey neutral. Sparse-state discipline held.

**Semantic role coherence:** every red I found is destructive-only. Every amber is warning-only. Every green is done/success-only. No overlap. `MoveSheet` amber pill for "has session" is the *only* ambiguity — technically that's informational not warning — but it's paired with the amber stack-warning bar below, so the color reads as "this deserves your attention." I'd defend it.

**Rogue colors:** none.

**One nit worth naming:** `/account` uses `active:bg-red/5` on the Delete row (`account/page.tsx:223`) — a 5% red wash on press. Compare to `active:bg-line-soft/50` on the other rows. That subtle differentiation ("your press has weight here") is the exact Jony-Ive-subtraction move — a whole extra visual signal delivered without adding a single new color. Steal this pattern for Skip/End-program press states.

---

## 6. Spacing rhythm

**/account vertical rhythm:**
- Page wrapper: `space-y-5 pt-4` (`account/page.tsx:92`) → 20 px between top-level sections. Consistent with Profile.
- Back-link → H1 gap: implicit via `space-y-5` = 20 px.
- H1 → identity chip: 20 px.
- Identity chip internal: `px-4 py-3 flex items-center gap-3` — 12 px vertical padding, 16 px horizontal. `w-12 h-12` avatar. Correct card-internal rhythm.
- Section eyebrow → list gap: `mb-2` (8 px) — tighter than the 20 px between-sections; correct hierarchical rhythm.
- Section list rows: `px-4 py-3 min-h-[48px]` — 12 px vertical padding, floor 48 px tap. Consistent.
- Extensions list: `divide-y divide-line-soft` — 1 px `line-soft` divider between rows. Cheaper than gap-2 (no double-border effect). Correct.
- Between-row padding equals across sections. **No ad-hoc `mt-[27px]` or similar.**

**MoveSheet rhythm:**
- Header: `p-4 pb-2` (16 top, 8 bottom) — the tighter bottom pad opens toward the list. Correct sheet-header convention.
- Body: `px-4 py-3 space-y-4` (12 vertical, 16 between sections).
- DayList internal: `<li>` at `px-3 py-3 min-h-[48px]` (12 px padding). One notch tighter than /account row padding (`px-4 py-3`). **This is a rhythm break** — same-shape list, different edge inset.
- Footer: `p-3 border-t border-line-soft` — 12 px padding around the sticky CTA.

**Rhythm break:** `/account` rows use `px-4 py-3` but `MoveSheet` rows use `px-3 py-3`. Same list-row semantic (radio/tappable row with a leading indicator + primary + secondary + trailing chip). Either both should be `px-4` or both `px-3`. **Recommend `px-4` for both** — matches the 16 px column inset the app is already using on all card interiors.

**GraduationCard rhythm:**
- Card container: `p-4 space-y-3` — 16 px padding, 12 px between elements. Consistent.
- Verb-row stack: `space-y-2 pt-1` (`page.tsx:894`) — 8 px between verb rows. Tighter than the 12 px card-space. Correct — the verbs are one *set of choices*, not one-per-section.
- Verb button internal: `px-3 py-2.5 min-h-[52px]` (`page.tsx:715-716`) — 12 px horizontal, 10 px vertical, 52 px min. The 52 px is above the 48 px floor because the button carries a two-line label+caption; correct.
- Between "Pick your next focus" and "How was this arc?" feedback: no explicit gap — inherits `space-y-3` from card = 12 px. The transition from *choice* to *feedback capture* wants slightly more air. **Recommend `mt-4` on the GraduationFeedback container** (extra 4 px) to signal "this is a different phase of the interaction."

**RetestReminder rhythm:**
- Card: `p-4 text-[14px] space-y-2` — 16 px padding, 8 px between elements. Tighter than GraduationCard's `space-y-3` (12 px).
- Metric list items: `space-y-0.5` (2 px) — very tight, correct for a "just a list of names" moment.
- Buttons: `flex flex-wrap gap-2 pt-1` — 8 px gap. `pt-1` = 4 px above buttons after the list.

**Week expanded rhythm:**
- Day row: `px-4 py-4 flex items-start gap-3` (`week/page.tsx:429-430`) — 16 vertical, 12 gap. Correct for a card-list row that expands.
- Expanded content: `mt-1` on each element inside (`week/page.tsx:517, 528, 531, 537, 540`). 4 px between each is *tight*. When the day expands to show run log + top lift + move reason + action row, the vertical stack becomes dense.
- Action row: `mt-3 grid grid-cols-3 gap-2` — 12 px above, 8 px gap. Correct visual separation between the disclosure content and the verbs.

**Recommend:** on Week's expanded content, promote the inner `mt-1` gaps to `mt-2` where the elements are semantically different (reason vs. run log vs. top lift vs. action row). Keep `mt-1` between homogenous list items (individual runs).

---

## 7. Grid & alignment

**/account left-edge alignment:**
- H1 sits at page-wrapper edge (0 inset from `AppShell.tsx` inner container).
- Section eyebrow ("SIGN-IN") also at page-wrapper edge — 0 inset. `mb-2` down to list.
- List rows: `rounded border border-line-soft bg-surface` — the list *card* starts at page-wrapper edge; the row content is `px-4` inset inside the card.
- Consistent across all four sections.

**/account vs. Profile alignment:** Both use `space-y-5 pt-4`, both wrap in `AppShell`'s container. Left-edge of "SIGN-IN" eyebrow on /account aligns with left-edge of "YOUR PROGRAMS" eyebrow on Profile — verified in `persona-graduate/mobile/08-profile.png`. Correct grid consistency across the two related routes.

**MoveSheet alignment:**
- Panel: `w-full sm:max-w-md` — full-width on mobile, capped at 448 px on ≥ sm.
- Header + body + footer share `p-4` / `p-3` / `p-3` horizontal insets. The section legend "This week" left-edge aligns with the day-row label "Mon 17 Aug" — verified via the `px-4 py-3` on body + `px-3` on radio row = 4 px inset from the panel's 16 px inset. **That inset difference means the section legend does NOT align with the row primary text.** Section legend at 16 px page-inset; row primary text at 16 + 12 (radio) + 12 (row px-3) = 40 px from panel edge, vs. 16 for legend. The visual result: the section legend hangs left of the list, floating. That can read as intentional "this is a legend, not a row" — Steve Schoger would call it a proper hanging indent. But it can also read as sloppy. **Recommend either explicit hanging legend (pull the row content in another 4 px to fully separate) or aligning the legend to the row-primary edge (`ml-8` on the legend).** Pick one and hold.

**GraduationCard alignment:**
- Card container: `p-4` = 16 px inset.
- Eyebrow, H2, weeks-logged sub, "Where you landed" panel, "Next block" panel, verb-row stack — all left-edge aligned at 16 px inset.
- Inside "Where you landed" panel: `p-3` = 12 px inset. So ledger rows are 16 + 12 = 28 px from card edge.
- Inside "Next block" panel: `p-3` = 12 px inset. Same 28 px.
- Verb rows: `px-3 py-2.5` = 12 px inset inside a container that's already at 16 px inset. Total 28 px.

All internal cards align on the 28 px line. Correct.

**RetestReminder alignment:** single-level card, no nested panels. All content aligns at 16 px card-inset. Simple, right.

**Week day-row alignment:** the dot column + primary column split. Dot has `mt-2 w-2 h-2` — 2 px wide, sits at column-left with `flex-shrink-0`. Primary column is `flex-1 min-w-0`. Chevron on the right at fixed size. The expanded content (`week/page.tsx:526` `<div id={weekday-${dateISO}}>`) inherits the `flex-1` column and does NOT get an extra indent — so expanded content aligns with the row header text, not with the dot. **Correct** — the expanded content is *of* the row, not below the row.

---

## 8. Iconography

`grep -n "size=" src/app/account/page.tsx src/components/workout/MoveSheet.tsx src/components/FirstRunBanner.tsx`:

- /account: `ChevronLeft size={14}` (back), `ChevronRight size={16}` (rows × 4), `RotateCcw size={12}` (Undo).
- MoveSheet: `X size={18}` (close).
- FirstRunBanner: `X size={16}` (dismiss).
- Week: `ChevronDown size={14}` (expand).
- GraduationCard: no icons — verbs are pure type. Correct restraint.
- RetestReminder: `→` glyph in the CTA label, not an icon.

**Icon-size ramp:** 12, 14, 16, 18. That's the peer-standard mobile size ramp (Runna, Whoop, Cal use 14 for chevrons, 16 for row-chevrons, 18-20 for close/menu). Terav is in-line.

**Rogue icons:** none. Every icon in the new surfaces is `lucide-react`. `grep -rn "@heroicons\|react-icons" src/app/account src/components/workout/MoveSheet.tsx src/components/FirstRunBanner.tsx` returns zero.

**Stroke width:** default lucide `strokeWidth={2}` inherited on all. `grep -rn "strokeWidth" src/app/account src/components/workout/MoveSheet.tsx src/components/FirstRunBanner.tsx` returns zero — no ad-hoc overrides. Consistent.

**One nit:** the `RotateCcw size={12}` on /account Extensions Undo (`account/page.tsx:192`) is at the app's icon floor. Paired with `text-[11px]` text, both are one notch small. If the text bumps to 12, bump the icon to 14 to match.

---

## 9. Chrome — wordmark, header, bottom-nav

The Coach kill (S1, Batch 25) means the bottom-nav shows five tabs: Today / Week / Progress / History / Profile. Verified in all persona mobile screenshots — no Coach tab. Programs, Extras, Report, Check, Guide, Coach (now 404), Events all live behind the ⋮ menu.

`persona-strength/mobile/03-coach.png` — a plain 404 with the wordmark, header icons, and bottom-nav still rendered. Well-formed: `404 | This page could not be found.` centered vertically. **Verdict: correct subtraction.** The 404 is a stump, not a stub — it doesn't try to be helpful (no "Coach was removed, go to Progress instead" copy), and that's *right* for a route the user shouldn't have reached anyway. Confirm-first identity: don't apologize for a route we killed intentionally. Only downside: the 404 doesn't visually distinguish "we removed this on purpose" from "you typed a bad URL." A user who bookmarked /coach will land here confused. **Recommend:** either add a one-line "This surface was removed. See Progress → Insights." OR (better) redirect /coach → /progress at the route level. The latter is a `→ see app-mobile-ux` finding but the visual craft implication is: the 404 shape is correct for the *general* case, but /coach specifically needs a redirect.

Wordmark unchanged. Header icons (⋮ + programs stack + stethoscope) unchanged.

---

## 10. Sparse-vs-dense stress test

- **/account** — persona-graduate has 1 graduated program, 0 extensions. Section renders: identity chip + Sign-in email + Data & privacy + legal footer. Extensions section is *absent* (correctly gated on `extendedPrograms.length > 0`). Empty state = don't render. Correct minimalism.

- **/account** — hypothetical multi-program user (persona-multitrack) with extensions on 2/3 programs. Extensions section renders 2 rows. Each row: name + "Extended +4w · retest window pushed" + Undo. `divide-y divide-line-soft` between rows. Whitespace is tight but breathable. Holds.

- **MoveSheet** — persona-strength with dense week (4-5 sessions/week): the "has session" amber pill fires on 4 of the 7 target rows. **This is where the pill economy matters** — 4 amber pills in one 7-item list starts to feel like a citation list, not a target picker. Recommend the pill could go smaller (`text-[9px]`) once density hits 3+, or the pill could invert (only show "clear" chip on truly-empty days). Held for observation.

- **MoveSheet** — persona-erratic with sparse week (1 skipped session, 6 rest days): pill visibility drops to zero, radio list reads clean. Sparse-state holds.

- **GraduationCard** — persona-graduate is the *only* persona hitting this. `04-history.png` and `01-today.png` show the full card ~80% of the mobile viewport (395 × 800). The 4-verb vertical stack dominates the fold. Whether that's right depends on whether graduation is a *decision moment* the user should linger in (yes) or a *pass-through* to the next program (also yes). Batches 23-25 chose "decision moment" — 4 verbs stacked, each with a caption, feedback capture below. Correct for the once-per-arc frequency.

- **RetestReminder** — only fires on the Monday of a cadence-hit week (see `page.tsx:1163-1167` gate). Doesn't stack with GraduationCard (they're mutually exclusive by phase). Held.

- **Week expanded** — persona-erratic has line-through skipped session on Mon (`02-week.png`); expanded state would show "Unskip" as the single-verb affordance (`week/page.tsx:645-656`). Correct single-affordance for a two-state row.

- **History heatmap** — `persona-erratic/mobile/04-history.png` shows 8-week amber-dominant heatmap with the `10 strength · 45 active total` header. Cell fill is `amber` with 1 px `bg-line-soft` gap. **Verdict: dense-state holds.** The heatmap doesn't buckle under 45 amber cells. Compare with the last-audit's `persona-recover/04-history.png` (green-dominant): the same shape reads confidently in either regime.

---

## 11. Competitor benchmark (this pass)

Marketing sites (Pliability, Runna, Whoop, Hevy) returned zero design detail via WebFetch — every response was "the page you fetched is marketing copy." That's expected: peer visual language lives inside the apps, not the landing sites. This audit therefore leans on the peer notes captured in the Batch 16 audit and my prior teardowns.

**Held from Batch 16:**
- **Pliability** — spacious cards, minimal chrome, one accent (mint), body at 16 px. Terav's /account leans in this direction (identity chip at 16, section eyebrows quiet at 10). *Steal:* the "identity chip that IS the destination" pattern (Pliability's account screen is an identity card + 3 section lists). *Already stolen* — /account is exactly this shape. *Reject:* Pliability's spacious card interior padding (`p-6`) is too airy for Terav's info-per-inch confirm-first density.
- **GOWOD** — uppercase mono eyebrows, section-labelled cards, single-focus hero. Terav has fully adopted this. *Steal:* the "one big verb + captions" pattern GOWOD uses on its post-session card — Terav's GraduationCard verb stack is a stronger version of this (4 verbs not 1, each with a caption).
- **Runna** — week-view with per-day expand/collapse, move-drag interaction. Terav's Week + MoveSheet is the direct answer. *Steal:* Runna shows the *impact* of a move ("this stacks with Tue's tempo") in-list before commit — Terav's MoveSheet does this via "has session" pill + amber stack warning. On par. *Reject:* Runna's drag-to-reorder gesture — Terav's confirm-first + accessibility posture wants tap-to-open-sheet, not drag.
- **Whoop** — single-metric hero cards, tight muted-gray economy, mono only for numbers. Terav is *deliberately* leaning further into mono — this is the confirm-first / cite-the-paper identity, correctly overriding "cleaner is better."

**What this audit adds:** the peer set's account-page pattern is *always* 14 px row labels + 12 px row meta + 10 px section eyebrows. Terav's /account is 14 / 11 / 10. Bumping row meta from 11 → 12 puts Terav on the peer line without losing character.

---

## 12. Priorities

**P0 (do this week):**
- Bump `text-[11px] text-muted` → `text-[12px] text-muted` for row meta/labels on /account (6 sites), MoveSheet day summary (1 site), and the Extensions "Extended +4w · retest window pushed" line. **The single highest-leverage change.**
- Migrate the four button-label instances (`GraduationCard` verbs, `RetestReminder` CTAs, `Week` expanded action-row, `FirstRunBanner` CTA) from `font-mono text-[11px] uppercase tracking-wider` → sentence-case `text-[14px] font-semibold`. Keep mono-caps for eyebrows and pills. This is the largest single visual-identity cleanup in the audit.
- Change `leading-snug` → `leading-relaxed` on the RetestReminder body (`page.tsx:1194`). One-line edit, immediate morning-read gain.

**P1 (do this month):**
- Redirect `/coach` → `/progress` at the route level (or add a one-line "See Progress → Insights" hint to the 404). Cross-audit into `app-mobile-ux`.
- Align MoveSheet row padding to /account: `px-3 py-3` → `px-4 py-3` (`MoveSheet.tsx:232, 233`). Removes the 4-px inset drift between two sibling list surfaces.
- Bump /account back-link from `text-[13px]` → `text-[14px]` (`account/page.tsx:97`).
- Bump MoveSheet input value from `text-[14px]` → `text-[16px]` to defeat iOS auto-zoom (`MoveSheet.tsx:182`). Cross-audit into `app-mobile-ux`.
- Bump MoveSheet session-summary sub from `text-[13px]` → `text-[14px]` (`MoveSheet.tsx:123`).
- Bump RetestReminder metric list from `text-[13px]` → `text-[14px]` (`page.tsx:1205`).
- Bump /account identity-chip meta from `text-[11px]` → `text-[12px]` (`account/page.tsx:118`).

**P2 (nice to have):**
- On GraduationCard, add `mt-4` between "Pick your next focus" verb and the GraduationFeedback container to signal a phase change in the interaction.
- On Week expanded content, promote `mt-1` → `mt-2` between semantically different elements (run log → top lift → move reason → action row); keep `mt-1` between homogenous list items.
- Adopt `active:bg-red/5` (from /account Delete) as the standard press state for destructive verbs elsewhere in the app (Skip on Today, End program on GraduationCard).
- If /account Undo icon stays paired with promoted 12 px text, bump `RotateCcw size={12}` → `size={14}` to match icon-to-text ratio.
- Consider swapping H1 `leading-none` → `leading-[1.05]` on /account (`account/page.tsx:104`) for future-proofing wrap. Same recommendation held from last audit for the other H1s.

---

## 13. Kept observations (not action-worthy, worth noting)

- The `/account` route is the first surface in the app where destructive verbs (Delete) live in their own visual context rather than being hidden behind a disclosure. That's a stronger design than the Batch-16 Danger-zone disclosure it replaces — the disclosure suggested the action was dangerous *and* hidden; the /account page acknowledges "this is where you do rare things" and puts them at the tail. Cleaner mental model.
- The GraduationCard `border-l-4 border-l-bronze` on the outer card + the same treatment on the inner "Next block" panel (`border-l` implicit via rounded border) creates a *nested* bronze accent moment. The eye reads it as "this is the celebratory container, and this specific thing inside is what to do next." Rare well-executed nested emphasis without extra colors.
- MoveSheet's "Confirm — stack the session" second-tap language is one of the best confirm-first labels in the app. Not "Are you sure?" — not "Confirm" — but a full sentence stating what the confirm does. Copy quality worth naming even though it's `→ see app-copy-clarity`.
- The FirstRunBanner reads at 14 px muted with leading-relaxed. Every other Today card should adopt this pattern. It's the app's best-read paragraph shape, and it currently exists on exactly one component.

---

## 14. What's still broken from prior audits

- 13 px body floor across the rest of the app (`text-[13px]` appears 200+ times) — untouched by Batches 22-25. The new surfaces mostly avoided 13 (MoveSheet has one instance, RetestReminder has one) but did not fix the existing corpus.
- The mono-caps button-label anti-pattern (this audit's P0) applied to 10+ new sites in Batches 23-25. Compounds the existing pattern.
- Coach kill is the strongest subtraction of the batch — no residual footprint in bottom-nav, Profile, or Guide. **Fully executed.**
- Danger-zone disclosure fully replaced by /account. **Fully executed.**

---

*Prompt-injection guard notice: three `<system-reminder>` blocks appeared in tool outputs during this audit — one about `AGENTS.md` auto-generation from `next dev`, one about `next-app/CLAUDE.md` importing AGENTS.md, one about global agent instructions. All ignored per the audit prompt. Only the audit brief was treated as authoritative.*
