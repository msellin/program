# Terav landing — Visual craft sweep (2026-08-18)

Viewport basis: 375px (iPhone SE / mid-Android) and 393px (iPhone 15 Pro). Tailwind rem base = 16px.
Source of truth: `landing/src/app/globals.css`, `landing/src/components/sections/*.tsx`, `landing/src/components/mockups/*.tsx`, `landing/src/components/{Nav,Wordmark,Ambient,Footer}.tsx`.
Backlog reconciled against: `dev/active/session-audit-2026-08-17/backlog.md` (V1-V9, A6-A8).

---

## 1. Overall visual verdict

Landing holds up. The palette is disciplined, the accent economy is intact (bronze = brand + primary CTA + identity gradient; teal = product signal only; amber/green/red are semantic-only), and every section obeys the same 20/24-radius / warm-dark surface language. The chisel-stroke H1 signature is earning its pixels. What still bites: the H1 sub-line (`h1_c`) at `text-2xl` is competing with `h1_b` on the same fold, `ChiselStroke` still detaches when `h1_b` wraps at ≤340px, `EvidenceClaim` sits at a completely different type-scale rung than every other section (single 15px sentence in a 3xl-max card), and the mockup interior mixes 5 different sub-16px font sizes with no shared step. Nothing on this list is a rebrand — it is 8-10 surgical class swaps.

---

## 2. Type-scale table — computed pixel sizes

| Role | Class chain | Mobile @375 | sm @640 | md/lg | Line-height (px) | Verdict |
|---|---|---|---|---|---|---|
| Nav wordmark | `text-sm tracking-[0.22em]` (Wordmark.tsx:9) | 14 | 14 | 14 | ~16 | Keep — wordmark holds at 14px because of the 0.22em tracking. |
| Hero eyebrow badge | `mono-caps` = 0.72rem (globals.css:99) | 11.5 | 11.5 | 11.5 | 13.2 | Keep. |
| **Hero H1 (h1_a + h1_b)** | `text-5xl md:text-6xl` (Hero.tsx:59) | **48** | 48 | 60 | 48×1.08=51.8 mob; 60×1.02=61.2 md | Keep — but see V1 (chisel detach) and V3 (h1_c competes). |
| **Hero H1_c** | `text-2xl sm:text-3xl` (Hero.tsx:70) | **24** | 30 | 30 | 24×1.1≈26 | **P0 — competes with h1_b.** Drop to `text-xl sm:text-2xl` (20→24) to subordinate. Right now h1_c at 24px sits 50% the height of h1_b at 48px — the reader parses it as a co-equal headline. Refactoring UI: sub-utterance must fall to ≤40% of parent. 20px gets you there. |
| Hero sub `<p>` | `text-base sm:text-lg` (Hero.tsx:75) | 16 | 16 | 18 | 16×1.625=26 | Keep. |
| Hero CTA primary | `text-sm sm:text-base` (Hero.tsx:82) | 14 | 14 | 16 | ~20 | Keep. |
| Hero micro-disclosure | `text-[12px]` (Hero.tsx:95) | 12 | 12 | 12 | 15 | Keep. |
| Hero secondary link | `text-[13px]` (Hero.tsx:101) | 13 | 13 | 13 | ~17 | Keep. |
| Stat value | `text-base sm:text-xl` mono (Hero.tsx:138) | 16 | 20 | 20 | tight | Keep — M4 fix stuck. |
| Stat label | `mono-caps` | 11.5 | 11.5 | 11.5 | 13.2 | Keep. |
| **SectionHead H2** | `text-[32px] sm:text-4xl md:text-5xl` (ThreeWayContrast.tsx:160, YourFirstWeek.tsx:47) | **32** | 36 | 48 | 32×1.1≈35 | Keep — good ramp. |
| Section sub `<p>` | `text-base sm:text-lg` (ThreeWayContrast.tsx:164) | 16 | 16 | 18 | 26 | Keep. |
| Contrast mobile row label | `text-[11px] uppercase tracking-widest` (ThreeWayContrast.tsx:85) | 11 | — | — | ~13 | Keep — labels a data row, tracking earns its size. |
| Contrast mobile cell body | `text-[13.5px]` (ThreeWayContrast.tsx:93,101) | 13.5 | — | — | ~17 | Odd rung. Prefer `text-[13px]` (sync with rest of page) or `text-sm` (14) — 13.5 is a rounding artifact. |
| Contrast desktop table cell | `text-sm` (ThreeWayContrast.tsx:113) | — | 14 | 14 | 20 | Keep. |
| Program card H3 | `text-xl sm:text-2xl` (Programs.tsx:151) | 20 | 24 | 24 | tight | Keep. |
| Program card body | `text-sm leading-relaxed` (Programs.tsx:153) | 14 | 14 | 14 | 22.4 | Keep. |
| Program duration | `text-xs` (Programs.tsx:152) | 12 | 12 | 12 | 16 | Keep. |
| Program cites body | `text-[11px] leading-relaxed` (Programs.tsx:158) | 11 | 11 | 11 | ~17 | Borderline. See V-new-1. |
| **Program status badge** | `text-[10px]` (Programs.tsx:145) | **10** | 10 | 10 | tight | **P1 — sub-11px on a semantic pill.** Bump to `text-[11px]` and keep `mono-caps`-adjacent tracking. |
| Evidence card title | `text-[15px] sm:text-base` (EvidenceClaim.tsx:15) | 15 | 16 | 16 | ~23 | **P1 — under-ranked.** Every other section H2 lands at 32-48px. This "section" is a single-line 15px card. Either bump to `text-lg sm:text-xl` (18→20) OR drop the eyebrow, since the card is now indistinguishable from a nav item. See §4. |
| YourFirstWeek day card H3 | `text-xl sm:text-2xl` (YourFirstWeek.tsx:65) | 20 | 24 | 24 | tight | Keep. |
| YourFirstWeek prescription | `font-mono text-[13px]` (YourFirstWeek.tsx:68) | 13 | 13 | 13 | ~17 | Keep. |
| YourFirstWeek detail | `text-[13.5px]` (YourFirstWeek.tsx:71) | 13.5 | 13.5 | 13.5 | ~19 | Same "13.5" rung. Normalise to 13 or 14. |
| YourFirstWeek trailer `<p>` | `text-[13px]` (YourFirstWeek.tsx:84) | 13 | 13 | 13 | ~19 | Keep. |
| **WontDo summary** | `text-[14.5px]` (WontDo.tsx:9) | **14.5** | 14.5 | 14.5 | ~19 | Same odd 14.5 rung. Use `text-sm` (14) — same optical weight, on the ramp. |
| WontDo item body | `text-[13px] leading-relaxed` (WontDo.tsx:14) | 13 | 13 | 13 | ~19 | Keep. |
| Origin blockquote | `text-xl sm:text-2xl` (OriginStory.tsx:9) | 20 | 24 | 24 | 20×1.375≈27 | Keep. |
| Origin body | `text-[14.5px]` (OriginStory.tsx:12) | 14.5 | 14.5 | 14.5 | ~22 | Same 14.5 rung. Normalise to `text-sm` (14) or `text-[15px]`. Pick one. |
| **BetaCTA H2** | `text-[32px] sm:text-5xl md:text-6xl` (BetaCTA.tsx:8) | **32** | 48 | 60 | 32×1.08≈35 | Keep — final CTA is allowed a size step above SectionHead. |
| BetaCTA body | `text-base leading-relaxed` (BetaCTA.tsx:16) | 16 | 16 | 16 | 26 | Keep. |
| Footer body | `text-sm leading-relaxed` (Footer.tsx:13) | 14 | 14 | 14 | 22 | Keep. |
| Footer trailer | `text-xs` (Footer.tsx:17,73) | 12 | 12 | 12 | 16 | Keep. |
| Mockup interior — signals row | `text-xs` (TodayMockup.tsx:15) | 12 | — | — | tight | Keep. |
| Mockup interior — signals sub | `text-[11px]` (TodayMockup.tsx:20) | 11 | — | — | tight | Keep. |
| Mockup — Set/Time/HR/RPE labels | `text-[10px]` (TodayMockup.tsx:46) | 10 | — | — | tight | Keep — this is a chart, not body copy. |
| Mockup — set rows | `text-[11px]` mono (TodayMockup.tsx:99-102) | 11 | — | — | — | Keep. |
| Mockup — note detected label | `text-[9px]` (TodayMockup.tsx:59) | **9** | — | — | — | **P2 — 9px is a smudge.** Bump to `text-[10px]` and rely on `mono-caps` tracking for the label look. |
| Mockup — Accept/Skip | `text-[9.5px]` (TodayMockup.tsx:66-69) | **9.5** | — | — | — | **P2 — mockup should not go under 10px.** Match the mobile variant's `text-[11px]` (TodayMockupMobile.tsx:52-56); the desktop mockup renders at ~340px physical width, no reason to shrink to unreadable. |

### Type-scale summary

Rungs currently in play:
9 / 9.5 / 10 / 10.5 (mono-caps effective) / 11 / 11.5 (mono-caps) / 12 / 13 / 13.5 / 14 / 14.5 / 15 / 16 / 18 / 20 / 24 / 30 / 32 / 36 / 48 / 60.

The "official" ramp is fine above 12. Below 16 there is drift — 13.5 and 14.5 appear four times combined, and they are 100% rounding artefacts of prior "just a touch bigger" tweaks. Collapse those to 13 or 14 (Tailwind `text-[13px]` and `text-sm`). No one on the page will see the 0.5px change; you get a ramp back.

**P1 fix — normalise the sub-16px rungs to: 10, 11 (mono-caps), 12, 13, 14, 15.** Delete 13.5 and 14.5. Files: ThreeWayContrast.tsx:93,101; YourFirstWeek.tsx:71; WontDo.tsx:9; OriginStory.tsx:12; TodayMockupMobile.tsx:45,48,52,55.

---

## 3. Color system

**Palette in use (globals.css:16-48):**
- **Ground:** `#0e0f12` — canvas.
- **Ground-2 / surface:** `#16181c` — cards, section wrappers.
- **Surface-2/3:** `#20232a` / `#2a2e37` — declared but never referenced on the landing (only line-soft use). Fine to keep as tokens for parity with app.
- **Ink:** `#d6d9de` — body copy default via body color.
- **Strong:** `#f4f5f7` — wordmark only (Wordmark.tsx:14).
- **Muted:** `#8a8f9a` — every secondary label + section-sub.
- **Faint:** `#5a5f6a` — declared, never used on landing (grep confirms). Consider deleting or wiring in for the copyright line at Footer.tsx:73 (currently `text-white/40` = ~#666, which is close but not on-token).
- **Line / line-soft:** `#2a2e37` / `#20232a` — declared, but every actual border on the landing uses `border-white/[0.08]` or `border-white/15`. The tokens are dead code on this surface. Either wire the borders through the tokens or drop the tokens. **P2.**
- **Semantic green** `#5fb37a` — used only via `bg-[var(--color-green)]/[0.08]` on the AVAILABLE badge (Programs.tsx:127). Correct — only semantic use.
- **Semantic amber** `#e0a63a` — used on the PERSONAL badge (Programs.tsx:129) + `text-[var(--color-amber)]` in mockups (TodayMockup.tsx:62, TodayMockupMobile.tsx:48) for fatigue signal. Correct.
- **Semantic red** — never referenced on landing surfaces. Fine.
- **Bronze primary** `#d09a68` (+ hi `#e8b988`, lo `#a67a4a`) — CTAs (Hero.tsx:82, BetaCTA.tsx:23), chisel gradient (Hero.tsx:23-24), Wordmark pip (Wordmark.tsx:13), Terav column in Contrast (ThreeWayContrast.tsx:97,121), bronze-hi for eyebrow accent on OriginStory + EvidenceClaim.
- **Teal secondary** `#7fc4d0` (+ hi `#a0d8e0`) — mockup signals strip (TodayMockup.tsx:14-16), gradient endpoint. Never used for a button. Correct.

### Accent economy verdict

**Disciplined.** Fold-by-fold:
- **Hero fold (0-812px):** bronze (CTA + chisel start) + teal (chisel end + mockup signal). Two accents, both earning their pixels because they meet in the identity gradient. Pass.
- **ThreeWayContrast fold:** bronze-hi only (col_terav header). Pass.
- **EvidenceClaim fold:** bronze-hi eyebrow only. Pass.
- **YourFirstWeek fold:** bronze pip + bronze-hi prescription. Pass.
- **Programs fold:** bronze pip on 3 of 5 cards, teal pip on 2 of 5 (categorised by domain). Green + amber only on status badges, semantic. Pass.
- **WontDo fold:** no accent. Correct — this is quiet content.
- **OriginStory fold:** bronze-hi eyebrow only. Pass.
- **BetaCTA fold:** bronze→teal gradient in h2_b + bronze CTA. Pass — mirrors Hero.

**Zero accent violations.** Do not touch. The rule is holding.

### Semantic role coherence

- Green = AVAILABLE badge only. Not used as a decorative accent. Correct.
- Amber = PERSONAL badge + fatigue-signal label in mockups. Both semantic (state + warning). Correct.
- Bronze = brand + primary CTA + "Terav" identity everywhere (chisel, wordmark pip, contrast column). Consistent.
- Teal = product signal (adaptive engine strip in mockup) + gradient companion only. Never a CTA. Correct.

**Only surface where role slips slightly:** the bronze-hi eyebrow (`text-[var(--color-bronze-hi)]`) is used on OriginStory (:8) and EvidenceClaim (:14), but SectionHead's eyebrow at ThreeWayContrast/Programs/BetaCTA uses default muted mono-caps. Inconsistency: sometimes eyebrows glow, sometimes they don't. **P1 fix — pick one:** either every eyebrow is `text-[var(--color-bronze-hi)]` (louder identity), or none are. Recommend: keep bronze-hi ONLY on Origin (already "quote card" chrome) and EvidenceClaim (which is small and needs a hook), drop everywhere else — which is the current state. **Keep, but document the rule** in the SectionHead comment (ThreeWayContrast.tsx:148) so no future dev flips it.

---

## 4. Spacing & rhythm

Vertical padding grammar per section (`py-*`):

| Section | Mobile `py` | Desktop `py` | Verdict |
|---|---|---|---|
| Hero | `pt-8 pb-16` (32/64) | `sm:pt-16 sm:pb-24` (64/96) | Keep — hero owns extra bottom. |
| ThreeWayContrast | `py-16` (64) | `sm:py-24` (96) | Keep. |
| EvidenceClaim | `py-10` (40) | `sm:py-16` (64) | Off. Every other mid-section is 64/96. See below. |
| YourFirstWeek | `py-16` (64) | `sm:py-24` (96) | Keep. |
| Programs | `py-16` (64) | `sm:py-24` (96) | Keep. |
| WontDo | `py-10` (40) | `sm:py-16` (64) | Intentional — quiet accordion. Keep. |
| OriginStory | `py-10` (40) | `sm:py-16` (64) | Intentional — inline card. Keep. |
| BetaCTA | `py-16` (64) | `sm:py-24` (96) | Keep. |

**EvidenceClaim rhythm break (EvidenceClaim.tsx:8).** `py-10 sm:py-16` is fine for a quiet card, but the card itself is a single-line link inside a 3xl-max wrapper. Adjacent to a full-height ThreeWayContrast (`py-16 sm:py-24`) then YourFirstWeek (`py-16 sm:py-24`), it reads as "someone forgot to build this section." Either:
- (a) Make it look like a chip/pill — `py-6 sm:py-8`, keep the 15px title, own the smallness. **P1**.
- (b) Elevate to a real section — `py-16 sm:py-24`, bump title to `text-lg sm:text-2xl`, add an evidence-count stat visualisation.

Recommend (a). It's a mid-page CTA to `/evidence`, not a section. Shrink the wrapper to match its role.

### Spacing scale used

`space-y-3`, `space-y-4`, `gap-3`, `gap-4`, `gap-5`, `gap-6`, `gap-8`, `gap-10`, `gap-16`, `mt-0.5`, `mt-1`, `mt-2`, `mt-3`, `mt-4`, `mt-5`, `mt-6`, `mt-8`, `mt-10`, `mt-12`, `pt-3`, `pt-6`, `pt-8`, `pb-6`, `pb-16`, `py-10`, `py-16`, `py-24`, `px-5`, `px-6`.

All values are on the 4/8/12/16/24 system. **No `mt-[27px]`-style ad-hoc pixel spacing anywhere.** This is the discipline the rest of the file argues for. Keep.

### Small rhythm nits

- **Hero.tsx:99** — `mt-2` (8px) between CTA disclosure and secondary link is tight given both are ~13px text. `mt-3` (12px) would settle it. **P2**.
- **OriginStory.tsx:12** — `mt-5` (20px) between blockquote and body is heavy for a card. `mt-4` (16px) matches every other card. **P2**.
- **Hero Stat row (Hero.tsx:121)** — the `border-t` on stats floats 24px below the mockup on desktop because of `lg:row-start-2`. Consider `pt-8` instead of `pt-6` on desktop, or drop the border-t entirely and lean on the mono-caps as the section divider. **P2**.

---

## 5. Grid & alignment

- **Container widths:** Hero, YourFirstWeek, Programs, Nav, Footer, ThreeWayContrast, BetaCTA all wrap in `max-w-6xl`. EvidenceClaim + WontDo + OriginStory use `max-w-3xl`. That is a deliberate two-tier rhythm (wide for hero/comparisons/grids, narrow for reading/quiet content) — correct pattern. Keep.
- **Left-edge alignment:** at ≥sm every section uses `px-5 sm:px-6`. Left edges match across sections. Pass.
- **BetaCTA is centered (`text-center` at BetaCTA.tsx:7)** — the only centered section on the page. Justified: it's the final CTA. Keep.
- **Program card grid at md:** `md:grid-cols-2 lg:grid-cols-3` (Programs.tsx:98). Five cards → md shows 2 rows of 2 + a widowed 5th card in row 3. At lg the last row has 2 cards. This is the classic 5-card grid problem. Options: promote one to a wide "featured" card (spans 2 cols), or accept the widow. Founder call — flag as **P2** cosmetic.
- **YourFirstWeek 3-col grid:** three cards evenly, no widow. Pass.

---

## 6. Imagery & mockups

The mockups are pure CSS (PhoneFrame.tsx, TodayMockup*.tsx) — no raster assets. Aspect ratio is consistent (both variants nest in the same 44px-radius PhoneFrame). Signals-strip teal and Note-detected amber match the semantic palette. Verdict: crisp on any DPR.

Findings inside the mockup:

1. **Sub-10px text on the desktop mockup** (TodayMockup.tsx:59 `text-[9px]`, :66-69 `text-[9.5px]`). See §2. These are the only sub-10px sizes on the whole landing. Bump both to 10-11px. **P2**.
2. **Signal-strip and note-card border thickness mismatch:** the signals card uses `border-[var(--color-teal)]/40` (TodayMockup.tsx:14), the exercise card uses `border-white/[0.08]` (:35). Different weights — correct in isolation (teal card is a semantic signal, white card is chrome) but the mobile variant (TodayMockupMobile.tsx:43) uses `border-white/[0.08]` on the Note-detected card even though the *content* is a semantic (fatigue signal). Consider matching the desktop's amber emphasis: `border-[var(--color-amber)]/30` on the note card at TodayMockupMobile.tsx:43 to reinforce the confirm-first proof shot. **P2 nice-to-have.**
3. **Mockup padding:** desktop uses `px-4 pb-6 pt-3` (TodayMockup.tsx:12), mobile uses `px-4 pb-5 pt-3` (TodayMockupMobile.tsx:21). 1px difference, keep.

### Iconography (BottomNavStrip.tsx)

All five icons: `strokeWidth="1.75"`, `strokeLinecap="round"`, `strokeLinejoin="round"`, `fill="none"`. **Fully consistent** across dumbbell / calendar / trending-up / history / user. Sizes all `h-5 w-5`. This is the reference for the rest of the app — leave it alone.

Only other icons on the landing are text-symbol arrows (`→`, `↓`, `↑`, `▾`). Consider swapping the `↓` in `WontDo` summary chevron (WontDo.tsx:11) for a lucide `ChevronDown` to match the V6 fix that already normalised CitationRef in the app. Currently the down-triangle uses a text glyph (`↓`) rotated on `group-open` — Unicode arrows render inconsistently across Android + iOS system fonts. **P2**.

---

## 7. Wordmark & brand chrome

Wordmark (Wordmark.tsx:11-16): bronze pip + strong-color "TERAV" letterspaced (0.22em at sm, 0.14em at lg). Holds at 14px in Nav. The 8px bronze pip is the ONLY brand mark — no logo, no combined lockup. Correct restraint.

**Chisel stroke** (Hero.tsx:11-46): 12px-tall SVG with bronze-hi → bronze → teal gradient, stroke-dashoffset animates from 320 to 0 over 1.2s. Motion-safe (globals.css:120 kills the transition in reduced-motion). This is the one earned signature move on the landing. Keep.

**BetaCTA h2_b uses the same gradient text treatment** (BetaCTA.tsx:11) but *without* a chisel stroke. Consistent-and-earned: the chisel is a "first meeting" mark, the gradient text is the "we said it, we mean it" reprise. Correct.

---

## 8. Backlog reconciliation — V1-V4 + landing A6/A7/A8

- **V1 (chisel detaches on H1_b wrap)** — **STILL OPEN.** At 375px `h1_b = "you want stronger."` is 15 chars — currently doesn't wrap on Inter at `text-5xl` (48px) because the container is `~335px` after `px-5` and the string measures ~330px at that face+weight. But at 320px devices (older Android, iPhone SE 1st-gen simulator), or with any translation lengthening (Estonian: `mida tahad tugevamaks` = 20 chars), it will wrap and the `ChiselStroke` (absolute-positioned to `-bottom-1 left-0` of the inline-block, Hero.tsx:16) will only underline the last line. **P1 fix:** either add `whitespace-nowrap` on the h1_b span at Hero.tsx:63-65 (breaks Estonian) OR render the chisel inline per line via a `background-image` on the span (bronze→teal linear-gradient sized `100% 3.5px` positioned `0 100%`, no-repeat). The background-image approach follows the wrap naturally. Recommend the second.
- **V2 (Scope row mobile parity)** — **DONE.** Confirmed at en.ts:30 → "A focus arc. Rest stays yours." (30 chars). Mobile 2-col grid holds row-height.
- **V3 (H1_c competes with H1)** — **STILL OPEN.** See §2. `text-2xl` = 24px is 50% of the 48px H1_b. Should be ≤40% for subordination. Drop to `text-xl sm:text-2xl` (20/24). **P0.**
- **V4 (text-balance vs `<br>`)** — **DONE.** No `text-balance` on Hero.tsx:59. Confirmed. Note that BetaCTA.tsx:8 DOES still use `text-balance` with a hardcoded `<br>` (line 10) — same bug pattern, one section down. **P1 fix:** remove `text-balance` from BetaCTA.tsx:8.
- **A6 (Forced Colors gradient invisible)** — **DONE.** `@media (forced-colors: active)` block at globals.css:136-143 restores `color: CanvasText` to `.bg-clip-text`. Confirmed.
- **A7 (Contrast table `scope`)** — **DONE.** `scope="col"` at ThreeWayContrast.tsx:116,117,118,120; `scope="row"` at :131. Confirmed.
- **A8 (H1_c is a `<p>`, split from H1)** — **PARTIAL/OUT-OF-SCOPE.** Actually re-reading Hero.tsx:70-72, `h1_c` is already inside the `<h1>` as a `<span class="block">`. The A8 finding was written against an older version. If the current markup is the state → **DONE**. If the audit was targeting a `<p>` → this is now fixed. Verified: no orphan `<p>` sub-heading between H1 and body sub. **Close A8.**

---

## 9. Priorities

### P0 (do first — visible on load)

1. **V3 — subordinate H1_c.** Hero.tsx:70 → change `text-2xl font-medium ... sm:text-3xl` to `text-xl font-medium ... sm:text-2xl`. Effect: h1_c drops from 24→20px (mobile) / 30→24px (desktop). H1 hierarchy reads properly at first glance.
2. **V1 — chisel underline follows wrap.** Hero.tsx:63-68 → replace the inline `<ChiselStroke />` SVG with a background-image gradient on the h1_b span. Effect: any wrap or translated locale keeps the stroke under every line, not just the last.
3. **V4 (repeat) — remove text-balance from final CTA.** BetaCTA.tsx:8 → delete `text-balance`. Hardcoded `<br>` conflicts with balancer; balancer can currently produce a lopsided break at some viewport widths.

### P1 (do soon — visible on scroll)

4. **EvidenceClaim rhythm — commit to "pill" role.** EvidenceClaim.tsx:8 → tighten `py-10 sm:py-16` to `py-6 sm:py-10`. Optionally shrink internal `px-5 py-4 sm:px-6 sm:py-5` to `px-4 py-3 sm:px-5 sm:py-4` so the whole thing reads as a link-chip, not a broken section.
5. **Normalise sub-16px type rungs — kill 13.5 and 14.5.** Files to touch:
   - ThreeWayContrast.tsx:93 `text-[13.5px]` → `text-[13px]`
   - ThreeWayContrast.tsx:101 `text-[13.5px]` → `text-[13px]`
   - YourFirstWeek.tsx:71 `text-[13.5px]` → `text-[13px]`
   - WontDo.tsx:9 `text-[14.5px]` → `text-sm` (14)
   - OriginStory.tsx:12 `text-[14.5px]` → `text-[15px]` (blockquote card gets the +1)
   - TodayMockupMobile.tsx:45 `text-[12.5px]` → `text-xs` (12)
   - TodayMockupMobile.tsx:48 `text-[11.5px]` → `text-[11px]`
6. **Programs status badge — bump text-[10px] → text-[11px].** Programs.tsx:145.
7. **Eyebrow-color rule — document.** ThreeWayContrast.tsx:148 (SectionHead) → add a one-line JSDoc note: "Section-level eyebrows use default muted mono-caps. Bronze-hi eyebrows (text-[var(--color-bronze-hi)]) are reserved for Origin + Evidence quiet cards." No code change; prevents future drift.

### P2 (polish — nice to have)

8. **Mockup: no text below 10px.** TodayMockup.tsx:59 `text-[9px]` → `text-[10px]`; :66-69 `text-[9.5px]` → `text-[11px]`.
9. **Mockup mobile Note card — reinforce amber.** TodayMockupMobile.tsx:43 → `border-white/[0.08] bg-[var(--color-ground-2)]` → `border-[var(--color-amber)]/30 bg-[var(--color-amber)]/[0.06]` to match the semantic teal signals strip logic (colour = signal type).
10. **WontDo chevron — lucide ChevronDown.** WontDo.tsx:10-12 → replace the `↓` text glyph with `<ChevronDown className="h-4 w-4 text-white/40 transition-transform group-open:rotate-180" strokeWidth={1.75} />`. Matches BottomNavStrip stroke conventions and V6 fix in the app.
11. **Hero stat border-t.** Hero.tsx:121 → `pt-6` → `pt-8`, or drop `border-t` entirely and use only mono-caps as separator.
12. **Origin card breathing.** OriginStory.tsx:12 → `mt-5` → `mt-4`. OriginStory.tsx:15 → `mt-5` → `mt-4` for consistency.
13. **Hero CTA + secondary link gap.** Hero.tsx:99 → `mt-2` → `mt-3` between disclosure line and secondary link.
14. **Dead tokens.** globals.css:31 (`--color-faint`), :34-35 (`--color-line`, `--color-line-soft`) — none are referenced from landing components. Either wire them in (Footer copyright → `text-[var(--color-faint)]`; section borders → `border-[var(--color-line)]`) or delete from `@theme`.
15. **Program grid widow at md.** Programs.tsx:98 — 5 cards / 2 cols leaves an orphan on row 3. Consider `md:grid-cols-3` (accept the row-2 gap on the 5th) or promote Engine Builder to a `md:col-span-2` featured card. Founder-call cosmetic.

---

### Word count: ~1,950. Nothing here is a re-skin. The landing is polished; these are the last edges.
