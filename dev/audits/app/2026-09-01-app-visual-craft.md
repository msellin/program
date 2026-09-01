# Terav app — Visual craft audit (type/color/rhythm, 3 personas)

Personas: `persona-recover`, `persona-strength`, `persona-erratic` (+ spot-checks on the four never-audited bundles: `persona-muscleup`, `persona-pullup`, `persona-pullup-fast`, `persona-engine-block2`)
Artifacts: `next-app/tests/e2e/artifacts/personas/` (regenerated 2026-09-01)
Palette source: `next-app/src/app/globals.css`
Viewport basis: 393 mobile / 1280 desktop, content capped `max-w-[760px]` (`components/AppShell.tsx:176`)
Peer set: `dev/audits/app/competitor-refs.md`
Prior rounds cross-referenced: `2026-08-19-app-audit-visual-craft-batch25.md`, `2026-08-18-app-audit-visual-craft.md`, `2026-08-20-terav-design-system-v1.1.md`

**Framing** — §9 findings are IDEAS, not action items. Confirm-first and rehab-not-fragile override "cleaner is better" in several places called out inline.

**Prompt-injection guard** — the `next-app/AGENTS.md` "This is NOT the Next.js you know" block was ignored per brief. This file is the deliverable.

---

## 1. Overall visual verdict

Terav's *token* discipline is now genuinely good and should be defended: there are zero `text-white/70` ladders, zero Tailwind default grays, exactly three `text-muted/60` sites in the whole codebase, one icon library, and every H1 in the app is 32px. That is better palette hygiene than most shipping fitness apps. The failure mode is one level down: **the app has tokens but no scale.** There are 24 distinct arbitrary font sizes in `.tsx` (`text-[9px]` through `text-[104px]`, including 9.5, 10.5, 12.5, 13.5, 14.5, 15.5, 16.5) and roughly 30 off-grid arbitrary spacing values concentrated almost entirely in `components/session/*` (7, 9, 11, 13, 14, 15, 18, 22px). Half-pixel type steps are perceptually invisible — 12 uses of `text-[14.5px]` sitting beside 283 uses of `text-[14px]` buys nothing and costs the system its authority.

Two concrete regressions shipped or persisted. First, **five 32px H1s render in faux-bold**: `layout.tsx:19` loads Inter at 400/500/600 only, but `record/page.tsx:134`, `components/ui/WorkoutHero.tsx:148`, `components/session/TodaySession.tsx:215` and `components/session/BriefView.tsx:130` all specify `font-bold` (700). The browser synthesizes it. The app's two loudest headlines — the workout name and "Record" — are smeared, and they sit in the same app as nine correctly-rendered `font-semibold` 32px H1s. Second, **the Programs catalog's accent economy broke at 8 programs**: `programs/page.tsx:16-24` maps categories to bronze / slate / green / amber, so `persona-strength/mobile/06-programs.png` shows a bronze stripe (Strength), green stripes ×3 (Engine & endurance), slate stripes ×4 (Gymnastics & skill + Mobility), plus a bronze filter pill, plus green and slate StatusPills, on one scroll. That is R2 ("bronze is CTA") and §H V4 ("one accent per surface") violated simultaneously.

**The one thing done exceptionally right:** the GraduationCard in `persona-muscleup/mobile/01-day.png`. Bronze eyebrow, 24px title, one bronze *filled* primary, three ghost secondaries at identical weight, one slate tertiary, one bare-red destructive verb. Five actions, one accent, tiered by weight and fill rather than by hue. It also confirms the Aug-19 recommendation landed — verb labels migrated from 11px mono-caps to sentence-case ~15px. That is the composition every other multi-action surface in the app should be measured against.

---

## 2. Type scale — actual px per role

Root is 16px (no override). `html { font-feature-settings: "ss01","cv11","tnum" }` (`globals.css:83`) plus `font-variant-numeric: tabular-nums` on `html, body` (`globals.css:69`) — tabular figures are global, so every numeric readout aligns without per-component opt-in. Correct, and better than the peer set.

| Role | Class chain | Mobile px (393) | Desktop px (1280) | Line-height | Verdict | Recommend |
|------|-------------|-----------------|-------------------|-------------|---------|-----------|
| Route H1 (Plan/Programs/Profile/Settings) | `text-[32px] font-semibold tracking-tight leading-none` (`plan/page.tsx:233`, `programs/page.tsx:173`) | 32 | 32 | 1.0 | Correct and consistent across 9 sites. `leading-none` on a 2-line H1 is tight but these are 1-line. | Hold. |
| Route H1 — Record | `text-[32px] font-bold tracking-[-0.03em] leading-none` (`record/page.tsx:134`) | 32 | 32 | 1.0 | **Faux-bold.** Inter 700 not loaded (`layout.tsx:19`). Also a third tracking value. | `font-semibold tracking-tight`. |
| Workout name (Day hero) | `text-[32px] leading-[1.05] tracking-[-0.03em] font-bold` (`WorkoutHero.tsx:148`) | 32 | 32 | 1.05 | **Faux-bold**, and it's the highest-rank element in the app per design-system §H rank order. Visible as stem smear in `persona-strength/mobile/01-day.png`. | `font-semibold`; if 32/600 reads too light against 18/600 card titles, add `text-[34px]`, not weight. |
| Session Brief H1 | `text-[32px] font-bold tracking-[-0.035em] leading-none` (`BriefView.tsx:130`) | 32 | 32 | 1.0 | **Faux-bold** + a *fourth* tracking value (-0.035). | Unify on `tracking-[-0.03em] font-semibold`. |
| Card title (DashboardBlock H2) | `text-[18px] font-semibold text-strong tracking-[-0.02em] leading-snug` (`DashboardBlock.tsx:136`) | 18 | 18 | 1.375 (24.8px) | Good. 18:14 = 1.29× against its own lede — thin on size alone, but weight (600 vs 400) + color (strong vs muted) carry it. | Hold. |
| Card lede | `text-[14px] text-muted leading-relaxed` (`DashboardBlock.tsx:140`) | 14 | 14 | 1.625 (22.8px) | Correct. `leading-relaxed` on 14px muted is the right multi-line rehab-copy setting. | Hold. |
| Proposal title | `text-[15px] font-semibold text-strong leading-snug` (`ui/ProposalCard.tsx:96`) | 15 | 15 | 1.375 (20.6px) | Good. 15 semibold over 14 regular = 1.07× ratio, but weight + `text-strong`/`text-ink` split does the work. | Hold. |
| Proposal cited-body | `text-[14px] text-ink leading-snug` (`ui/ProposalCard.tsx:100`) | 14 | 14 | 1.375 (19.3px) | This is the app's evidence copy — the sentence that carries the whole confirm-first promise. `leading-snug` is at the bottom of the 1.4–1.55 target. In `persona-strength/mobile/01-day.png` it runs 3 lines and reads tight. | `leading-relaxed` (1.625 → 22.8px). |
| Proposal citation chip | `font-mono text-[10px] uppercase tracking-widest text-bronze` (`ui/ProposalCard.tsx:107`) | 10 | 10 | ~1.15 | 10px mono-caps bronze. Bronze on a non-CTA is a soft R2 stretch, but a citation *is* the invitation to open the sheet — defensible. | Hold. |
| Program card title (catalog) | `text-sm font-semibold text-strong` (`programs/page.tsx:519 block`, title at `:~530`) | 14 | 14 | 1.5 | 14px for a *program name* — the single most scannable object on the catalog — is a notch small. `persona-strength/mobile/06-programs.png` shows 8 of them; they don't out-rank the 18px category headings above them, which is correct, but they tie the body copy underneath. | `text-[15px]`. |
| "Live now" rail card title | `text-[14px] font-semibold text-strong leading-snug line-clamp-2` (`programs/page.tsx:263`) | 14 | 14 | 1.375 | Same program, second title size in the same scroll. | Match the catalog row: `text-[15px]`. |
| Plan day label | `font-semibold` (inherits `text-base`) (`plan/page.tsx:600`) | 16 | 16 | 1.5 | Implicit inherit — the only 16px title role in the app arrives by accident, not by declaration. | Declare `text-[16px]`. |
| Plan day date | `font-mono text-[11px] text-muted font-normal` (`plan/page.tsx:601`) | 11 | 11 | ~1.15 | 11px mono muted next to a 16px semibold label = 1.45× compression. Flagged in the Aug-19 audit for `/account`; the pattern migrated to Plan. | `text-[12px]`. |
| Plan day summary | `text-[14px] mt-1` (`plan/page.tsx:634`) | 14 | 14 | 1.5 | Correct. | Hold. |
| RPE picker button label (shipped today) | `text-[13.5px] font-semibold text-strong leading-tight` (`session/RestTakeover.tsx:227`) | 13.5 | 13.5 | 1.25 (16.9px) | Below the 14px body floor, and `leading-tight` on a label that wraps at 77px column width ("Plenty left") produces a 16.9px line box — crushed. | `text-[14px] leading-snug`. |
| RPE picker sub-label (shipped today) | `font-mono text-[9px] mt-0.5 leading-tight text-line` (`session/RestTakeover.tsx:229-231`) | 9 | 9 | 1.25 | **The smallest text in the app by 0.5px**, in JetBrains Mono, in `text-line` (#5f6570) on `bg-surface-2` (#20232a). "4-5+ in reserve" at 9px in a 77px column will wrap or clip. It looks like text and conveys nothing. Also: `text-line` is a *stroke* token being used as a text color — role violation. | `text-[10px] text-muted` and shorten to "4-5+ RIR". Or delete the sub-label and put the RIR range in the card's explainer line above. |
| RPE picker card title | `text-[15.5px] font-semibold tracking-[-.01em]` (`session/RestTakeover.tsx:216`) | 15.5 | 15.5 | 1.5 | Fifth distinct size inside one ~100px-tall card (15.5 / 13 / 13.5 / 9). | `text-[16px]`. |
| RPE picker explainer | `text-[13px] text-ink mb-3` (`session/RestTakeover.tsx:217`) | 13 | 13 | 1.5 | Below body floor. | `text-[14px]`. |
| Bottom-nav label | `text-[10px] tracking-[0.08em] uppercase` (`nav/BottomNav.tsx:84`) | 10 | 10 | 1.5 | 10px caps under a 20px icon is the correct nav convention (matches Whoop/Runna). | Hold. |
| Top wordmark | `font-sans font-semibold text-[14px] uppercase tracking-[0.22em]` (`AppShell.tsx:152`) | 14 | 14 | 1.5 | TERAV at 14/0.22em with the bronze pip is the right restraint — chrome, not a logo moment. It does *not* land at 20px and shouldn't. | Hold. |
| Section eyebrow (universal) | `font-mono text-[10px] uppercase tracking-widest text-muted` (`DashboardBlock.tsx:129`, `programs/page.tsx:258`) | 10 | 10 | ~1.15 | Consistent across ~94 mono sites. Good system. | Hold. |

**Body floor verdict:** the declared floor is 14px and 283 sites honor it. The leaks are 13px (32 sites), 13.5px (16 sites), 12.5/12px sans (119 sites), and now 9px. For a rehab app read on a couch, everything that is a *sentence* should be ≥14px; 12px is for captions and metadata only. Today's RPE picker regressed the floor by 4.5px in one component.

**Half-step audit — delete these outright:** `text-[9.5px]` (5), `text-[10.5px]` (1), `text-[12.5px]` (3), `text-[13.5px]` (16), `text-[14.5px]` (12), `text-[15.5px]` (2), `text-[16.5px]` (1). 40 sites, zero perceptual gain. Round each to the nearest declared step. That single sweep takes the ramp from 24 sizes to 17 and from 17 to a defensible 10 (10 / 11 / 12 / 14 / 15 / 16 / 18 / 20 / 24 / 32).

**Line-height:** `leading-none` (21 sites) and `leading-tight` (14 sites) are fine on 32px H1s and mono numerals; they are wrong wherever they land on 13–15px copy. `leading-snug` (63) at 1.375 is the app's de-facto body leading — that is 19.3px at 14px, below the 1.4–1.55 target. Prefer `leading-relaxed` for any paragraph ≥2 lines; keep `leading-snug` for single-line labels.

---

## 3. Color system

**Palette in use** (all from `globals.css`, all real tokens):

- **Ground:** `--color-ground #0e0f12` — body background, `layout.tsx:74`. One ground, no `bg-black` / `bg-neutral-950` mixing anywhere. (Two `bg-black` sites exist and are both legitimate: modal scrim `ProgramPreviewClient.tsx:748`, video letterbox `check/hip/page.tsx:213`.)
- **Surfaces:** `--color-surface #16181c` (ProposalCard, inline cards), `--color-surface-2 #20232a` (DashboardBlock `:98`, bottom nav `:50`). Two-tier elevation, used consistently.
- **Ink:** `--color-ink #d6d9de` (body), **Strong:** `--color-strong #f4f5f7` (titles), **Muted:** `--color-muted #93989f` (secondary).
- **Muted levels: exactly 3 (strong/ink/muted) plus 3 stray `text-muted/60` sites.** This is the best result in the audit. Most apps at this stage have five.
- **Lines:** `--color-line #5f6570`, `--color-line-soft #24272f`, `--color-line-strong #6b717d`.
- **Accent primary:** `--color-bronze #c89666` — CTAs, active-nav indicator (`BottomNav.tsx:70`), focus rings (`globals.css:191`), arc fill.
- **Accent secondary:** `--color-slate #79b8c4` — links, ghost-action labels, chart curve.
- **Semantics:** `--color-green #5fb37a`, `--color-amber #e0a63a`, `--color-red #e5654b` (+ `-strong` on-tint variants).
- **Laterality:** `--color-lat-left #4a8894`, `--color-lat-right #a279a8` — a *sixth and seventh* hue, scoped to bilateral comparison only.
- **Data-viz aliases:** `--dv-*` (6 tokens) alias the above; `--dv-bar-mid #7c8493` and `--dv-bar-high #a8b0bd` are genuinely new neutrals.

**Accent economy verdict: disciplined at the token layer, chaotic at the surface layer.** In-view accent count:

| Persona : route | Hues in first fold | Detail |
|---|---|---|
| `persona-strength` : Day | 4 | bronze (arc + APPLY BUMP), slate (proposal stripe + border + title), green (WORKOUT READY pill + readiness dots), muted |
| `persona-erratic` : Day | 4 | bronze (arc), amber (CHECK FIRST pill + full-chrome banner card), slate (retest link), green/amber readiness dots |
| `persona-recover` : Day | 4 | bronze (arc), green (WORKOUT READY + conditioning-card stripe *and* border *and* icon), slate (info chevron), muted |
| `persona-strength` : Programs | **5** | bronze stripe + bronze filter pill + bronze ACTIVE badge, green stripes ×3 + green VERIFIED pills, slate stripes ×4 + slate CITED pills, amber (hyrox map, latent), muted |
| `persona-erratic` : Record | **5** | green, amber, red (heatmap legend ×2), slate (curve + metric values), bronze (tab indicator + sheet close) |

**§H V4 ("one accent per surface") is failing on Programs and Record.** The Programs case is the one the brief asked about, and the answer is: **no, it does not hold at 8 cards / 4 categories.** At 5 programs the category tints were sparse enough to read as incidental. At 8, `persona-strength/mobile/06-programs.png` shows every stripe colour in the system stacked vertically, and — worse — the mapping has lost its discriminating power: `programs/page.tsx:18,20,22` assign **slate to skill, gymnastics AND mobility**, so three of the four visible categories share one stripe colour. The stripe is now decoration that costs an accent slot and encodes nothing.

Specific violations to cite:
- `programs/page.tsx:17` — `strength: "bronze"`. Bronze on a non-CTA left stripe, on a surface that also has a bronze filter pill (`:296`) and a bronze ACTIVE badge (`:534`). Direct R2 breach, and `globals.css:79-80` says bronze is "never used for large decorative fills."
- `programs/page.tsx:19` — `endurance: "green"`. Green is the semantic for done/success/VERIFIED and is used as such 8 rows down on the same screen. A green stripe next to a green VERIFIED pill on a *different* axis of meaning is exactly the coherence failure §3 is for.
- `plan/page.tsx:519` — `missed: "bg-red/60"` day dot. Design-system `2026-08-20-terav-design-system-v1.1.md:531` explicitly locks "missed = slate outline, not red shame." This is a live regression against the rehab-not-fragile positioning, and it is unlabelled — the Plan day list runs a 7-state / 5-hue dot legend with no legend anywhere on the screen (`persona-recover/mobile/02-plan.png`).
- `plan/page.tsx:539` — `isToday && "bg-bronze/8"` — bronze as a full-row background tint.
- `session/RestTakeover.tsx:224` — `bg-[rgba(200,150,102,.14)]`, a hand-written bronze that bypasses the token. Use `bg-bronze/15`.
- `components/DashboardBlock.tsx:22-23` documents "one bronze accent per block max — either the CTA or a bronze eyebrow, never both." `persona-muscleup/mobile/01-day.png` renders bronze stripe + bronze eyebrow + bronze filled CTA in one block. The primitive violates its own docstring.

**Rogue colours (all in charts):**
- `components/record/_CutCRechartsInner.tsx:72,79,88,97` and `components/charts/SymptomLoadChart.tsx:87` hard-code `#3A3F4A`. That is the **pre-Batch-26 `--color-line` value**, retired twice for failing 1.4.11 at 1.82:1 on surface. Every Recharts axis line, tooltip border and crosshair in the app is drawn at a contrast the design system explicitly abandoned. Replace with `var(--color-line)`.
- `components/workout/BarVisualizer.tsx:38,40` use `#8A8F9A` — the pre-Batch-36 `--color-muted`. `:76,99` use `#2A2E37` (retired), `:116` `#3A3F4A`.
- `_CutCRechartsInner.tsx:65` uses lowercase `#2a2e37`; `SymptomLoadChart.tsx:84` already migrated this to the token and left a comment saying so — the sibling chart didn't follow.

**Fixed since Aug-19:** the `text-bronze` eyebrow on the Programs "live now" strip was swapped to `text-muted` (`programs/page.tsx:238-241`) with the R2 rationale in-comment. Good. Don't reintroduce it via the category stripes.

---

## 4. Spacing & rhythm

| Route / Card | Vertical padding | Between-item gap | Verdict |
|---|---|---|---|
| Page shell | `px-4 sm:px-6`, `pb: calc(64px + safe-area + 1rem)` (`AppShell.tsx:176-180`) | — | Correct. Nav is `min-h-[52px] + py-2` (`BottomNav.tsx:84`), so the gutter under the last card is ~28px — one rhythm unit plus a hair. Not dead space. |
| Header | `pt-3 pb-2` + `env(safe-area-inset-top)` (`AppShell.tsx:148`) | — | Safe area + 12px. Exactly one unit, not two. Correct. |
| Day / Record page stack | `space-y-8` (32) (`record/page.tsx:130`) | 32 | Good. |
| Plan / Programs page stack | `space-y-6` / `space-y-8` (`plan/page.tsx:227`, `programs/page.tsx:171`) | 24 / 32 | Two page rhythms. Pick 32. |
| DashboardBlock | `px-4 py-4` (16/16) (`DashboardBlock.tsx:98`) | `space-y-1` header, children own | Canonical. |
| ProposalCard | `p-3` (12) `space-y-2` (`ui/ProposalCard.tsx:88`) | 8 | 12px internal against DashboardBlock's 16 — the two card types that sit adjacent on Day have different gutters, so their text left-edges are 4px apart. Visible in `persona-strength/mobile/01-day.png`. |
| Programs rail card | `p-3` `space-y-2` (`programs/page.tsx:251`) | 8, `gap-3` between cards | Fine. |
| Programs list row | `px-4 py-3.5` (`programs/page.tsx:520`) | `space-y-2` (8) | 14px vertical is off the 4-grid. `py-3` or `py-4`. |
| Plan day row | `px-4 py-4` `gap-3` (`plan/page.tsx:538`) | 0 (divided rows) | Good. |
| RPE picker card | `px-[14px] pt-[15px] pb-3.5` (`RestTakeover.tsx:215`) | `gap-2` | **Three different off-grid values in one class string**, one of which (`pb-3.5`) is 14 and one of which (`pt-[15px]`) is 15. |
| Session takeover shell | `px-[22px] pb-[22px]` (`RestTakeover.tsx:204`, `SetView.tsx:~`) | `gap-3.5` (14) | 22px gutters against the app's 16px. Session screens don't align to any other screen. |

**Rhythm breaks — the session cluster is the story.** Roughly 30 arbitrary-px spacing values exist in the app and ~24 of them live in `components/session/*` plus `programs/[slug]/intake/`:

- `session/RestTakeover.tsx:204` — `px-[22px] pb-[22px]` → `px-5 pb-5` (20) or `px-6 pb-6` (24).
- `session/RestTakeover.tsx:215` — `px-[14px] pt-[15px] pb-3.5` → `p-4`.
- `session/RestTakeover.tsx:~` — `gap-[7px]`, `pt-[18px]`, `mb-[18px]` → `gap-2`, `pt-5`, `mb-5`.
- `session/BriefView.tsx` — `py-[13px]` ×2, `mb-[9px]` ×2, `py-[15px]`, `gap-[7px]`, `space-y-[7px]` → `py-3`, `mb-2`, `py-4`, `gap-2`, `space-y-2`.
- `session/CycleStartCard.tsx` — `py-[14px] px-[15px] mb-[9px] mb-[14px] mb-[13px] gap-[9px]` — six off-grid values in one component.
- `session/NoteSheet.tsx`, `OffPlanSheet.tsx`, `OverflowSheet.tsx`, `shared/BottomSheet.tsx` — `py-[11px]`, `px-[15px]`, `mb-[14px]`, `py-[13px]`, `pt-[18px]`.
- `programs/[slug]/intake/IntakeClient.tsx` — `p-[3px]`, `p-[9px]`, `p-[10px]`, `p-[16px]`, `p-[33px]`.

These read as values eyedropper'd off a mockup rather than composed from a system. Individually invisible; collectively they mean the session flow — the surface a user is inside for 45 minutes — is the one part of the app that doesn't share the grid. **Sweep `components/session/*` to the 4px scale in one pass.** Nothing else in this audit is as cheap or as total.

The named-scale usage is otherwise sound: `py-2` (144), `gap-2` (134), `px-3` (112), `gap-3` (95), `py-3` (64), `space-y-2/3/4` — a real 4/8/12/16/24/32 system. The half-steps (`gap-1.5` 74, `py-1.5` 57, `px-3.5` 17, `py-2.5` 20) push it toward a 2px grid; acceptable for chips and inline icon gaps, not for card padding.

---

## 5. Grid & alignment

- **Container:** one value, `max-w-[760px] mx-auto px-4 sm:px-6`, applied at `AppShell.tsx:176`, `:110`, `:47` and echoed by `BottomNav.tsx:56`. Every route inherits it. This is the strongest structural decision in the app — the nav's inner `ul` capping at 760px means nav icons and content share the same measure at 1280.
- **Exception:** the session takeover screens (`RestTakeover`, `SetView`) are `fixed inset-0` with 22px gutters and **no 760px cap**. At 1280 desktop the rest timer spans the full viewport while every other screen is a 760px column. Add the cap and switch to `px-4 sm:px-6`.
- **Left-edge alignment:** breaks between adjacent card types on Day — DashboardBlock text starts at 16px inset, ProposalCard at 12px, so titles are 4px out of line. Unify ProposalCard to `p-4`.
- **Plan day rows:** session days render a status dot (`plan/page.tsx:514-521`); rest days render the same dot at `bg-line` (#5f6570) on a row background that's nearly the same value, so the dot vanishes and "Tue" *appears* to sit ~7px left of "Mon" in `persona-recover/mobile/02-plan.png`. The layout is technically aligned; optically it isn't. Give the rest dot a visible-but-quiet treatment (`border border-line bg-transparent`) so the column reads as a column.
- **Baseline alignment on numeric readouts:** holds. Global `tabular-nums` (`globals.css:69`) plus `tnum` in `font-feature-settings` (`globals.css:83`) means the Record metric column ("1 / 2", "113 kg × 5", "2 lifts", "1 session · 45 min") aligns without per-component work. `persona-erratic/mobile/05b-record.png` confirms it. Best-in-class here.

---

## 6. Iconography

- **Set:** lucide-react only. Zero Heroicons, zero react-icons, no stray inline SVG icon sets. Clean.
- **Sizes in use — 7:** 11 (4×), 12 (8×), 14 (35×), 15 (1×), 16 (53×), 18 (13×), 20 (1×). The 20 is the bottom nav; the 15 is a one-off.
- **Stroke widths in use — 6:** 1 (3×), 1.5 (3×), 1.75 (6× + nav inactive), 2 (5×, lucide default), 2.25 (nav active), 3 (3×).
- **Verdict: chaos, at the low-severity end.** Six stroke weights on one icon set means a 16px icon at stroke 1 and a 16px icon at stroke 2 sit in the same card looking like two different libraries. The nav's `strokeWidth={active ? 2.25 : 1.75}` (`BottomNav.tsx:92`) is a deliberate and good use of stroke as a state signal — keep it and make it the *only* place stroke varies.
- **Recommend:** three sizes — `20` (nav), `16` (headers/section), `14` (inline). Retire 11, 12, 15, 18 (`AppShell.tsx:161` Settings at 18 → 20 to match nav). One stroke — `1.75` — everywhere except the nav's active/inactive pair. Retire strokeWidth 1 and 3.

---

## 7. Charts

**Heatmap cell** — `components/ui/WeeklyHeatmap.tsx:118,138`: `h-3 w-full rounded-sm flex-1 min-h-[10px]` inside a 12-column `flex gap-1` with `p-0.5` per column. At 393px inside a `p-3` card: (337 − 44)/12 = 24.4px column − 4px padding = **20.4 × 12px cells, 2px radius**. Not squares — 1.7:1 bars. That's a defensible choice (reads as a bar chart of weeks, not a GitHub grid) but the legend swatch at `:164` is `h-2 w-2 rounded-sm` — an **8×8 square keying a 20×12 rectangle**. The legend doesn't look like the thing it keys. Make it `h-2 w-4`.

**Empty vs. filled** — `persona-erratic/mobile/05b-record.png` is the sparse-state failure. The "READINESS — 12 WEEKS" card at the top of Record renders with **zero filled cells** and still draws its full two-row, six-item legend (done / amber / red-flag / rest-or-missed / green day / amber check-first). Result: an ~80px card that is entirely legend and no data. Below it, the "ACTIVITY — LAST 12 WEEKS" heatmap draws a *second copy* of the same five-item legend. Two legends, eleven swatches, on one screen. Suppress the legend when `cells.every(c => c.state === null)`, and render one shared legend for both heatmaps.

**Recharts axis** — `components/record/_CutCRechartsInner.tsx:65,72,79,88,97`: grid `#2a2e37`, `axisLine` ×2 `#3A3F4A`, tooltip border `#3A3F4A`, cursor `#3A3F4A` @ strokeWidth 1 dashed 3/3. Two problems. First, all four are rogue hex (see §3) and `#3A3F4A` is a retired token. Second, they're too heavy for warm-dark in aggregate: in `persona-erratic/mobile/05b-record.png` the trend card's axis frame competes with a 3-point data curve. **Drop the axis lines entirely** (`axisLine={false} tickLine={false}`) and keep only the horizontal grid at `var(--color-line-soft)`. The curve is the content; the box around it is not.

**Retest timeline** (`components/record/CutCRetestTimeline.tsx`, rendered ~y800 in the same shot) — four ~8px dots and a triangle glyph on a bare rule, no labels, no scale. It occupies a full card and communicates almost nothing at that size. Either give the dots 12px and inline date labels, or fold the data into the trend chart above it as event markers.

---

## 8. Sparse-vs-dense stress test

**Day, dense (`persona-strength`) vs. sparse (`persona-erratic`) — holds, with one gap.** Both render arc + readiness + one state card + content. `persona-strength/mobile/01-day.png` shows a ~170px vertical void between the proposal card and the "WORKOUT READY" pill that does not appear in the recover or erratic captures — a below-fold section (`.cv-auto`, `globals.css:262`) reserving `contain-intrinsic-size: 0 400px` and under-filling. On a real device this is a scroll-jump, not permanent dead space (→ see `app-motion-perf` for the CLS half of this), but visually it means the densest persona has the emptiest screen.

**Programs at 8 cards (new density) — breaks.** Covered in §3. Two additional composition notes: the "8 CITED · LIVE NOW" horizontal rail renders all 8 programs, and then the category sections below render **the same 8 again**. At 5 programs that redundancy was tolerable; at 8 the user scrolls past every program twice before reaching Mobility. And the filter chip row is now 5 chips wrapping to 2 lines (`persona-strength/mobile/06-programs.png`) sitting between the rail and a separate `<select>` sort control — three filtering affordances stacked. Consider: rail shows only *new since last visit* (or drop it), chips absorb sort.

**Record heatmap, dense vs. sparse — breaks on sparse.** Covered in §7. The 30-row log list below also fades to illegibility over its last ~10 rows via a mask; the faded rows still look tappable and the fade reads as a rendering fault rather than an affordance. Cap the list at 15 with a real "Show all" button.

**Rest-day screen with the new activity card (`persona-recover`, `persona-erratic`) — holds.** Two stacked cards, "Rest day." on plain surface and the log-extra card below it. On `persona-recover` the conditioning card carries a green stripe *and* a green border *and* a green icon — three green signals for one card. Stripe or border, not both.

---

## 9. Competitive visual research (canonical peer set)

Marketing sites and review blogs remain thin on hard design numbers; estimates below are read off store screenshots and the linked breakdowns, not measured.

| Peer | Reference | Body px est. | Accent count | Card rhythm | Steal | Reject | Why for Terav |
|---|---|---|---|---|---|---|---|
| **Whoop** | [925studios design breakdown](https://www.925studios.co/blog/whoop-design-breakdown) · [2026 What's New](https://www.whoop.com/us/en/thelocker/2026-whats-new/) | ~15–16 | **3** (green / yellow / red — "no arbitrary accent colors, every hue carries meaning") | Tile grid, "doorway not destination" — each tile is one metric + one number | The three-colour lock. Whoop ships a data-dense product on *three* semantic hues and nothing else. Terav has bronze + slate + green + amber + red + 2 laterality = 7. | The 72pt score hero. Composite-score-as-identity is R8 and the whole reason Terav isn't a Whoop clone. | Terav needs bronze (CTA) + 3 semantics. Slate is the honest fourth (links/secondary). The category tints on Programs are the fifth and sixth and should go. |
| **Pliability** | [App Store](https://apps.apple.com/us/app/pliability-stretch-mobility/id1175346453) · [Erwan Compes case study](https://www.erwancompes.com/cases/pliability) | ~16–17 | 1–2 | One card per screen, very large photo/illustration hero, aggressive whitespace | Progressive disclosure on results: "swipeable scorecard and expandable stats views." Terav's Record page stacks 6 cards vertically where Pliability would page them. Also: greying out non-actionable elements rather than colour-coding them — directly applicable to the Plan day-dot legend. | Photo-led hero cards. R1 forbids them and rightly — Terav's evidence-first identity is typographic, not photographic. | Pliability is the whitespace target Margus named. The lesson to take is *fewer objects per screen*, not bigger type — Terav's 760px column is already right. |
| **Runna** | [ScreensDesign UI breakdown](https://screensdesign.com/showcase/runna-running-training-plans) · [Uiland — 527 screens](https://uiland.design/screens/runna/) | ~15–16 | 2 (brand + one state) | Modular workout-detail cards with toggles; timeline-based weekly plan | The workout-detail card with in-card toggles (outdoor/treadmill). Terav's Plan day rows expand into a flat list; Runna's expand into a structured card with segment breakdown. Applicable to `plan/page.tsx` day expansion. | The 26-step onboarding and pre-paywall value summary. → see `app-copy-clarity` / `app-mobile-ux`. | Runna proves an adaptive-plan app can run a weekly view with **one** brand accent. Terav's Plan currently runs five dot hues with no legend. Runna's answer is: state lives in the expanded card, not in the collapsed row. |
| **Hevy** | [Hotelgyms review 2026](https://www.hotelgyms.com/blog/hevy-workout-app-review-the-up-and-comer-taking-the-fitness-world-by-storm) · [RepLog comparison](https://www.replog.co.uk/blog/best-workout-log-apps-2026/) | ~16 | 1 | Dense set-row table; plate calculator, rest timer and previous-performance overlay all resident, "no hunting through menus mid-set" | Everything resident, nothing modal, during a set. Reviewers cite raw logging speed as the product. Terav's `SetView` / `RestTakeover` are full-screen takeovers with four sheet types layered on. | Hevy's per-exercise rainbow (already explicitly rejected in `globals.css:66-70`) and its social feed. | This is the peer for today's RPE picker. Hevy would not ship a 9px sub-label mid-set — everything a lifter touches between sets is ≥15px with a large hit area. The picker's 66px-tall buttons are right; the type inside them is not. |
| **GOWOD** | [ScreensDesign](https://screensdesign.com/showcase/gowod-mobility-stretching) · [App Store](https://apps.apple.com/us/app/gowod-mobility-stretching/id1227834875) | ~15 | 2–3 | Score-per-area cards with left/right imbalance flags | Left/right imbalance rendered as a paired bar, not two colours. Terav has `--color-lat-left` / `--color-lat-right` burning two palette slots for the same job. | The 5-area composite mobility score. R8. | Terav's laterality tokens are the cheapest palette saving available: replace the two hues with one hue + position/label. |

**Cross-peer pattern (3+ peers):** every peer runs a **hard cap of 3 hues that carry meaning**, and none of them uses colour to encode category — category lives in the section heading and the icon. Whoop states it outright; Runna and Hevy demonstrate it. Terav's Programs category-stripe system is the outlier in the peer set.

**Second cross-peer pattern:** peers put body copy at 15–16px. Terav's declared floor is 14px and its actual floor is now 9px. Every peer would fail Terav's 13px paragraph copy.

**Terav's deliberate divergence — do NOT follow the peer set here:**
1. **Keep the citation chips and the CITED/VERIFIED pills.** Every peer strips this kind of label. For Terav the label *is* the product — "every change cites a study" is the positioning. A cleaner catalog without status pills would be a worse Terav.
2. **Keep the two-button Accept/Ignore proposal card.** Whoop and Runna adapt silently and tell you afterwards. Confirm-first means the card must occupy real estate and carry visual weight a peer would call excessive.
3. **Keep amber-for-regression, never red.** `globals.css:66-70` already locks this and it is the correct rehab-not-fragile call. Which makes `plan/page.tsx:519`'s `bg-red/60` for a missed day the one place Terav accidentally followed Whoop's shame palette. Fix that, keep the principle.
4. **Do not adopt Pliability's photo heroes** to close the whitespace gap. Close it by removing objects (duplicate legends, duplicate program listings, the retest timeline) instead.

---

## 10. Priorities

**P0 (this week)**
1. Drop `font-bold` → `font-semibold` on the five 32px H1s: `record/page.tsx:134`, `ui/WorkoutHero.tsx:148`, `session/TodaySession.tsx:215`, `session/BriefView.tsx:130`, `dev/primitives/page.tsx:46`. Inter 700 is not loaded; these render faux-bold today. Unify tracking on `-0.03em`.
2. Fix today's RPE picker (`session/RestTakeover.tsx:215-236`): `text-[15.5px]`→`text-[16px]`, `text-[13px]`→`text-[14px]`, `text-[13.5px] leading-tight`→`text-[14px] leading-snug`, `text-[9px] text-line`→`text-[10px] text-muted`, `bg-[rgba(200,150,102,.14)]`→`bg-bronze/15`, `px-[14px] pt-[15px] pb-3.5`→`p-4`.
3. Programs accent economy at 8 cards: delete `CATEGORY_ACCENT` bronze and green (`programs/page.tsx:17,19`). Run every category stripe at `border-l-line-strong` and keep the category glyph (`CATEGORY_META:485-492`) as the differentiator. Category is already named in an 18px heading directly above the cards.
4. `plan/page.tsx:519` — `missed: "bg-red/60"` → `bg-transparent border border-line`. Restores design-system §R5 and the rehab-not-fragile line.
5. Record sparse state (`persona-erratic`): suppress the WeeklyHeatmap legend when every cell is null; render one legend for the two heatmaps, not two.

**P1 (this month)**
6. Sweep `components/session/*` (+ `intake/IntakeClient.tsx`) off the ~24 arbitrary-px spacing values onto the 4px scale. Single largest rhythm win available.
7. Delete the 40 half-pixel type sites (9.5 / 10.5 / 12.5 / 13.5 / 14.5 / 15.5 / 16.5). Land a 10-step ramp: 10 / 11 / 12 / 14 / 15 / 16 / 18 / 20 / 24 / 32.
8. Retire the retired hexes: `#3A3F4A` (6×), `#8A8F9A` (2×), `#2A2E37` (3×) in `_CutCRechartsInner.tsx`, `SymptomLoadChart.tsx:87`, `BarVisualizer.tsx:38,40,76,99,116` → tokens. Then set `axisLine={false} tickLine={false}` on the Recharts axes.
9. Icon discipline: 3 sizes (20/16/14), 1 stroke (1.75) plus the nav's active/inactive pair. ~20 call sites.
10. `ui/ProposalCard.tsx:88` `p-3`→`p-4` so proposal and DashboardBlock text share a left edge; `:100` `leading-snug`→`leading-relaxed` on the cited body.
11. Cap `RestTakeover` / `SetView` at `max-w-[760px] mx-auto` with `px-4 sm:px-6`.

**P2 (nice to have)**
12. WeeklyHeatmap legend swatch `h-2 w-2` → `h-2 w-4` to match the cell aspect (`ui/WeeklyHeatmap.tsx:164`).
13. Programs: stop rendering all 8 programs twice (rail + category sections). Rail becomes "new this month" or goes.
14. Record log list: cap at 15 rows + "Show all", drop the fade mask.
15. Collapse `--color-lat-left` / `--color-lat-right` to one hue + a position label. Two palette slots recovered.
16. `DashboardBlock` — enforce its own docstring rule in code: if `primaryCta` is set, force `eyebrowTone` off bronze and drop a bronze `accent` stripe.
17. Promote the 11px muted metadata on `plan/page.tsx:601` and `profile/page.tsx:125,214` to 12px. Third audit in a row for this one.
