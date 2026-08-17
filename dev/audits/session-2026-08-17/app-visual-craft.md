# Terav app — Visual craft audit (post-migration, new surfaces)

Scope: code review of new/changed surfaces this session — `ProposalCard`, `Day1EmptyState`, `OnboardingRunner` + 6 step primitives, `CitationRef`. Persona artifacts are stale and were not consulted. Live URL `app.terav.fit` referenced only where a claim depends on rendered composition.

Palette source: `next-app/src/app/globals.css:8-44`
Viewport basis: 393 mobile / 1280 desktop, root 16px

---

## Verdict — GO WITH CAVEATS for beta

The new surfaces hold the warm-dark discipline and the tone system works: amber = "needs your ok" (safety), green = "you look ready" (readiness), slate = "signal detected" (opportunistic), bronze = the one accent for primary CTA and Day-1 attention. Accent economy inside the product UI is genuinely restrained — I count exactly four semantic colors in use across the new surfaces (bronze, amber, green, red, slate — with slate as engine-signal, not a fifth accent-of-vibes). That's better than most Linear/Cal.com screens I've studied. The type system is the weak link: body copy is a hard-coded `text-[13px]` (12.87px effective at 16px root) everywhere in the new surfaces, which is below the 15-16px "read on the couch" threshold this rehab-adjacent app should sit at. This is not a landing page; users are reading `Because: ...` reasons and citation snippets on a phone, one-handed, with a stiff hip. Second issue is a hierarchy inversion in `OnboardingRunner` — the four primitives all shout `text-2xl` (24px) titles inside a modal, then whisper 13px body, but the "Next" button is only `text-sm` (14px). Third, `CitationRef` collapses "Source:" and the actual citation into a single `text-muted → text-strong` contrast that is invisible at 12px on a phone. None of these block beta — they degrade the read, they don't break the product. Ship it, then fix the type ramp in a P0 sweep before the launch-week screenshot cycle.

The single thing done right: the amber left-border stripe on safety proposals (`ProposalCard.tsx:191-193`) — 4px, semantic, consistent with the taper-week callout on `page.tsx:194` and the concurrent-warning at `page.tsx:226`. This is what a design system looks like when the primitives were designed together.

---

## Type scale — new surfaces, actual px

| Role | Class chain | px (393 & 1280) | Line-height | Verdict |
|---|---|---|---|---|
| ProposalCard eyebrow | `font-mono text-[10px] uppercase tracking-widest` (`ProposalCard.tsx:100`) | 10 | 1 (default) | OK for caption; tracking-widest at 10px is ~0.4px per em, right at the wall |
| ProposalCard reason ("Because:") | `text-[13px] text-ink … leading-snug` (`ProposalCard.tsx:109`) | 12.87 | 1.375 (snug) | **Too small.** This is the load-bearing sentence. Should be 15px |
| ProposalCard evidence lift row | `text-[12px] font-mono text-muted` (`ProposalCard.tsx:113`) | 11.88 | 1.5 (default) | Numeric, mono, muted — OK. Tabular-nums inherited from `body` (`globals.css:48`) |
| ProposalCard match chip (LifeLoad-7 etc.) | `font-mono text-[10px] uppercase tracking-wider` (`ProposalCard.tsx:126`) | 10 | 1 | OK as a tag |
| ProposalCard CTA verb | `font-mono text-[11px] uppercase tracking-wider` (`ProposalCard.tsx:162`) | 10.88 | 1 | **Undersized for the primary action.** Compare to the OnboardingRunner "Next" at 14px. Nothing in the app tells the user "the Accept button is your promise-keeper" more than its type size |
| Day1EmptyState eyebrow | `text-[10px] uppercase tracking-widest text-bronze` (`Day1EmptyState.tsx:24`) | 10 | 1 | OK |
| Day1EmptyState title | `text-lg font-semibold text-strong leading-snug` (`Day1EmptyState.tsx:27`) | 18 | 1.375 | Correct scale — matches Today card title convention |
| Day1EmptyState body | `text-[13px] text-muted leading-relaxed` (`Day1EmptyState.tsx:30`) | 12.87 | 1.625 | **Too small for a first-run onboarding paragraph.** This is the one thing the fresh user reads before their first tap |
| Day1EmptyState CTA | `font-mono text-[11px] uppercase tracking-wider` (`Day1EmptyState.tsx:36`) | 10.88 | 1 | Same undersize as ProposalCard |
| OnboardingRunner step title (all 5 primitives) | `text-2xl font-semibold tracking-tight` (`ScaleAnchorStep.tsx:17`, `LifeLoadStep.tsx:32`, `SymptomPrimerStep.tsx:19`, `ScanAnchorStep.tsx:17`, `CustomCopyStep.tsx:16`, `FallbackStep.tsx:12`) | 24 | 1.25 (default) | Correct — the "biggest moment" in the app |
| OnboardingRunner step body | `text-[13px] text-muted` (six sites) | 12.87 | 1.5-1.625 | **Below spec** for modal body — this is a full-viewport moment, use 15px |
| OnboardingRunner primary button | `text-sm font-semibold` (`OnboardingRunner.tsx:133`) | 14 | default | Inconsistent — every OTHER primary CTA in the app is 10.88px mono. Pick one |
| OnboardingRunner secondary button | `font-mono text-[11px] uppercase` (`OnboardingRunner.tsx:126`) | 10.88 | 1 | This is the mono-CTA convention. The primary at line 133 breaks it |
| ScaleAnchor tier cell label | `text-[10px] uppercase tracking-widest` (`ScaleAnchorStep.tsx:23,27,31`) | 10 | 1 | OK — these are keys, not sentences |
| ScaleAnchor tier body ("Nothing noticeable" etc.) | `text-[13px] text-strong` (`ScaleAnchorStep.tsx:24,28,32`) | 12.87 | 1.5 | Marginal; 14px would breathe |
| LifeLoad grid number | `text-base font-semibold` (`LifeLoadStep.tsx:48,50,52,53`) | 16 | 1.5 | Correct — these are the tap targets |
| SymptomPrimer field list | `text-[13px] text-ink` (`SymptomPrimerStep.tsx:25`) | 12.87 | 1.5 | Reads as a checklist of what's coming; 13px works here (list-context) |
| SymptomPrimer GDPR note | `text-[11px] text-muted italic` (`SymptomPrimerStep.tsx:32`) | 10.88 | 1.375 | Legal note italicized at 11px = compliance-checkbox aesthetic. Fine, but not something to be proud of |
| CitationRef trigger | `text-[12px] leading-snug` (`CitationRef.tsx:37`) | 11.88 | 1.375 | **Too small** — this IS the honesty payload. If a citation is worth showing, it's worth reading. 13-14px |
| CitationRef expanded title | `text-[12px] text-ink` (inherits `CitationRef.tsx:56`, span at :58) | 11.88 | ~1.4 | Same |
| CitationRef display_line (Journal Year) | `font-mono text-[11px]` (`CitationRef.tsx:59`) | 10.88 | 1 | OK for reference-line |

**Hierarchy verdict.** The eyebrow (10px) → body (13px) → CTA (11px mono) → title (18px) ladder in `ProposalCard` has a 1.15× ratio between eyebrow and body — that's the invisible ratio Reichenstein warns about. Compare Linear web app: their card body sits at 14px with 13px meta, a 1.08× ratio, but they carry the hierarchy through weight (500 vs. 400) and color, not size. Terav does the same trick with `text-muted` vs. `text-ink` vs. `text-strong` — but at 13px the muted/ink distinction (7 tone steps between `#8a8f9a` and `#d6d9de`) is doing all the work. If body were 15px, the ramp would breathe. Right now it's tight.

**Line-height verdict.** `leading-snug` on 13px body (`ProposalCard.tsx:109`) = 17.7px line-box. That's on the edge of "crushed" for two-line reasons. Prefer `leading-normal` (1.5 → 19.3px) or bump body to 14-15px and keep snug.

**Font pairing.** `globals.css:40-43` uses the framework-injected `--font-sans` + `--font-mono`. Not fighting a display face — one clean sans is right for a rehab tracker. Do not add anything.

---

## Color system — accent economy inside the new surfaces

**Palette in use across new surfaces:**
- Ground `#0e0f12` — modal backdrop (`OnboardingRunner.tsx:99` `bg-ground/95 backdrop-blur-sm`)
- Ink `#d6d9de` — body copy on ProposalCard reason, SymptomPrimer list rows
- Muted `#8a8f9a` — secondary body across all six new surfaces (uniform, disciplined)
- Strong `#f4f5f7` — titles (18px on Day1, 24px on Onboarding, 13px anchor labels)
- Bronze `#c89666` — Day-1 CTA background, Day-1 eyebrow, Day-1 border/bg, Onboarding primary button, ScanAnchor secondary CTA, CitationRef external link
- Amber `#e0a63a` — day_adjustment_soften border/bg/eyebrow, LifeLoad-4-6 buttons, ScaleAnchor mid tier, `bg-amber/20` chip
- Green `#5fb37a` — readiness_after_layoff border/bg/eyebrow
- Red `#e5654b` — LifeLoad-7-10 buttons, ScaleAnchor high tier
- Slate `#79b8c4` — tier_advance + tm_bump border/bg/eyebrow, ScaleAnchor low tier (0-3), SymptomPrimer bullet

**Semantic role coherence.** Amber = "attention, needs consent" is consistent across ProposalCard-safety, LifeLoad 4-6, and ScaleAnchor mid tier. Red = "high, pause" is consistent between ScaleAnchor high and LifeLoad-7+. Green appears ONLY on readiness_after_layoff (`ProposalCard.tsx:197-200`) — a very tight budget, which is right. Bronze = "user action / paths forward" is consistent between Day-1 CTA, Onboarding primary button, and CitationRef external link.

**One minor role-collision.** Slate is doing two jobs: (1) engine-signal opportunistic (`ProposalCard.tsx:205-208` for tier_advance and tm_bump), (2) low-severity scale anchor 0-3 (`ScaleAnchorStep.tsx:23`). These aren't in the same viewport so it's tolerable, but a fresh user who saw a slate tm_bump proposal yesterday and today sees "0-3 slate" in onboarding might parse "0-3" as an engine-detected opportunity rather than "quiet, low, fine." Consider using `text-muted` for the 0-3 tier and reserving slate for engine-detected signals.

**No rogue hex.** `grep -rn "bg-\[#\|text-\[#\|border-\[#"` across the new files returned no matches. All colors flow through the `@theme` tokens.

**Warm-dark vs. hard-black.** `bg-ground/95` on the OnboardingRunner backdrop (`OnboardingRunner.tsx:99`) is warm-dark consistent — no `bg-black/*` sneaking in.

---

## Spacing rhythm

| Surface | Padding | Internal gap | Verdict |
|---|---|---|---|
| ProposalCard | `p-3` = 12px (`ProposalCard.tsx:96`) | `space-y-2` = 8px | Tight but coherent — matches sibling `text-[13px]` cards on `page.tsx:194,226,242` |
| ProposalStack (between cards) | `space-y-2` = 8px (`ProposalStack.tsx:29`) | — | **Too tight for stacked-proposal case.** With three proposals visible (LifeLoad-soften + tier_advance + tm_bump), the eye reads them as one wall. Use `space-y-3` (12px) |
| Day1EmptyState | `p-4` = 16px (`Day1EmptyState.tsx:22`) | `space-y-3` = 12px | Correct — this is the sole card in view, breathes right |
| OnboardingRunner modal panel | `space-y-6` = 24px between step-body and button row (`OnboardingRunner.tsx:101`) | `pt-2` = 8px extra above buttons (`:122`) | The 24px is right for modal cadence; the extra 8px pt-2 is redundant |
| ScaleAnchor step | `space-y-4` = 16px (`ScaleAnchorStep.tsx:16`) | `gap-2` = 8px between tier cells | Tier cells `p-3` = 12px internal — matches ProposalCard, good |
| LifeLoad grid | `gap-1.5` = 6px (`LifeLoadStep.tsx:36`) | — | 6-col × 6px = 30px gutter. On a 320px-wide iPhone SE the buttons are ~48px wide. Cramped but usable |
| SymptomPrimer field list | `space-y-1.5` = 6px between rows (`SymptomPrimerStep.tsx:23`) | — | Very tight for a checklist you're reading to internalize what data will be captured. `space-y-2` |

**Rhythm scale.** The values in use across new surfaces are 6/8/12/16/24 — clean, from Tailwind's 4px baseline. No `mt-[27px]` ad-hoc values. This is the discipline win.

**Bottom-nav gutter.** BottomNav `min-h-[52px]` + safe-area-inset-bottom (`BottomNav.tsx:35,53`). Content pages don't add explicit bottom padding — the `<main>` route-in animation and the auto-scroll rely on the sticky-nav pushing itself out. Verify on live URL that the last proposal isn't hidden behind the nav on iPhone with the URL bar visible. This is out-of-scope for visual-craft → **see app-mobile-ux**.

---

## Iconography

- All icons `lucide-react`. No Heroicons, no custom SVGs sneaking in.
- Stroke widths in use: `1.75` (nav inactive, header icons, ExerciseCard), `2.25` (nav active), `2` (default, most call sites), `1.9` (AlertTriangle in ExerciseCard `:215`), `3` (Check in intake `:344,399`), `0.5` (BarVisualizer plates).
- The `1.9` at `ExerciseCard.tsx:215` is the one outlier that doesn't match a system tier. Should be `2` or `1.75`. Cosmetic.
- New surfaces use `ArrowUp size={12}` (`ProposalCard.tsx:102`), `X size={16}` (`ProposalCard.tsx:155`), `ArrowRight size={14}` (`Day1EmptyState.tsx:39`), `▾` unicode (`CitationRef.tsx:50`). Sizes 12/14/16 — three inline-icon tiers, tight and consistent.
- CitationRef uses `▾` unicode instead of `ChevronDown` from lucide. This is one text-only inconsistency in an otherwise-lucide-clean codebase. Cost is zero to fix; visual weight of `▾` doesn't match lucide chevrons elsewhere. `ChevronDown size={12}` with a rotate transform is the right move.

---

## Charts — new surfaces don't touch charts

No new chart code shipped this session. The Recharts stroke-width `2` at `SymptomLoadChart.tsx:142,152` is unchanged. Not audited.

---

## Cross-program primitive rendering

Verified `onboarding_steps[]` for all six shipped programs (`anterior-hip-rebuild`, `concurrent-strength-maintenance`, `engine-builder`, `handstand-walk`, `overhead-mobility`, `rowing-2k-test-prep`). Each program renders 2-4 steps drawn from the primitive set. Manifest step counts inspected: anterior-hip 3 steps, CSM 3, engine-builder 3+, handstand-walk 3, overhead-mobility 2, rowing 3+.

Rendering hygiene concerns:
1. `overhead-mobility` renders only `scale_anchor` → `custom_copy`. That's TWO screens for a mobility supplement's onboarding — the least-important program has the shortest funnel, correct. But `scale_anchor` in that program uses "Pinch at the top" for mid-tier — that copy will render in `text-[13px] text-strong` inside a 16px `p-3` tier cell. Fine.
2. `handstand-walk` uses `scan_anchor` with `cta_href: /intake` (`ScanAnchorStep.tsx:22`). The CTA button is `border border-bronze text-bronze` outline — this is a SECONDARY bronze treatment inside a step where the primary "Next" is a SOLID bronze button (`OnboardingRunner.tsx:133`). Two bronze CTAs in the same viewport with different visual weight — this is confusing. Which one advances onboarding? Which one takes you to `/intake` (leaving the modal)? The user has to read to disambiguate. Consider `text-strong` outline or `text-slate` outline for the scan_anchor CTA, reserving bronze for "Next / Start."
3. `symptom_primer` on `anterior-hip-rebuild` renders four field names + a GDPR note. The list uses `<span>·</span>` bullets in `text-slate` (`SymptomPrimerStep.tsx:26`). Slate-as-bullet, again — see role-collision note above. `text-muted` would be neutral and correct.

---

## Compositional risks (the class of bug the IntroGallery/OnboardingRunner z-index collision belonged to)

1. **Day1EmptyState + ProposalStack render order.** `page.tsx:169-182` — Day1EmptyState renders BEFORE ProposalStack. On a fresh signup, ProposalStack returns null (no logs → no proposals) so this is fine. But `selectProposals` might return an evergreen proposal (e.g., a tier_advance whose gate is met by default program state). Verify: on the day after `hasHistory` flips true and Day-1 is gone, do proposals appear in the SAME slot Day-1 vacated? Yes — the fold collapses cleanly. Not a bug.

2. **OnboardingRunner primary CTA vs. ProposalCard Accept.** Both are `bg-bronze text-ground`. Users learning "bronze = my action" during onboarding will carry that to the Today page — but ProposalCard Accept is 10.88px mono UPPERCASE while OnboardingRunner "Next" is 14px sentence-case. Same color, different scale, different weight, different case. Two "primary CTA" typographic conventions live in the app. **This is the compositional break** — same visual role, inconsistent form. Pick one. Recommendation: everywhere the user is committing to an engine-computed action (Accept, Start, Advance), use the mono-UPPERCASE-11px convention. Everywhere the user is progressing through THEIR OWN flow (Next in onboarding), use sentence-case 14px. That mental model — mono = system speaks, sans = user acts — is a Reichenstein-clean discipline. Right now it's arbitrary.

3. **CitationRef expansion inside a scroll container.** Tapping expand adds `mt-1 pl-3 border-l border-line` block below (`CitationRef.tsx:56`). Inside a ProposalCard on Today, expanding pushes the Accept/Ignore button row DOWN. If a user was reaching for Accept and the citation expands (tapped by accident), the next tap lands on the expanded panel, not Accept. Not a visual bug per se — layout shift after tap. → **see app-mobile-ux**.

---

## Top 5 findings by blast-radius

1. **Body copy is 12.87px across every new surface — read on a couch after a bad hip day.** `ProposalCard.tsx:109`, `Day1EmptyState.tsx:30`, all 6 onboarding primitives. Bump to 14-15px (`text-sm` or `text-[15px]`). **S** — mechanical replace.

2. **Two primary-CTA typographic conventions coexist.** `ProposalCard.tsx:162` (10.88px mono UPPERCASE) vs. `OnboardingRunner.tsx:133` (14px sans sentence-case). Both `bg-bronze text-ground`. Pick the mono-caps convention for engine-actions, sans for user-flow. **M** — decide + touch 4 sites.

3. **Slate carries two semantic loads.** Engine-signal (`ProposalCard.tsx:205-208`) AND scale-anchor 0-3 (`ScaleAnchorStep.tsx:23`) AND bullet-in-list (`SymptomPrimerStep.tsx:26`). Recommend keeping slate for engine-signal only; switch 0-3 tier and bullets to `text-muted`. **S**.

4. **CitationRef trigger is 11.88px — the honesty payload is smaller than a caption.** `CitationRef.tsx:37`. Users are meant to see "Source: X" as a trust move. At 11.88px `text-muted → text-strong`, it reads as legal fine-print, not evidence. Bump to 13px with `text-ink` for the citation name. **S**.

5. **Two bronze CTA weights in the same onboarding viewport when `scan_anchor` runs.** `ScanAnchorStep.tsx:24` (outline bronze) + `OnboardingRunner.tsx:133` (solid bronze). Handstand-walk and rowing-2k users see both. Recommend switching scan_anchor CTA to slate outline (`border-slate text-slate`) — slate = "engine-cited-alternative-action" is already the convention. **S**.

---

## What I did NOT cover

- Persona artifact rendering (stale per session context; would need a rerun to confirm).
- WCAG contrast ratios on the new surfaces — → see **app-accessibility**.
- Tap-target sizes on the LifeLoad 11-button grid at 320px viewport — → see **app-mobile-ux**.
- Motion/animation timing on `.pulse-accept` (already spec'd in `globals.css:140-144`, not changed) — → see **app-motion-perf**.
- Landing → app promise-alignment (positioning copy shift) — → see **app-landing-alignment**.
- Coach page and its dense proposal list (this session did not ship changes to `/coach` — no scope).
- History heatmap, Progress charts — not touched this session.
- Bottom-nav gutter measured on device — → see **app-mobile-ux**.
- CORS / SW / Auth redirects on the new domain — infra concern, not visual.
- Type-scale of legacy surfaces (`HeroStateCard`, `SignalsStrip`) — sampled for cross-check but not audited; they share the `text-[13px]` convention, so recommendations here apply if adopted globally.
- CitationRef expanded-panel layout-shift → **see app-mobile-ux**.
