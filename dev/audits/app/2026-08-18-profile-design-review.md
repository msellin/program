# Profile page — design review

Owner: product-design-lead
Written: 2026-08-18
Status: recommendation — awaiting founder review
Reviewed file: `next-app/src/app/profile/page.tsx`
Related audits: `2026-08-18-app-audit-visual-craft.md`, `2026-08-18-app-audit-mobile-ux.md`, `2026-08-18-app-audit-copy-clarity.md`

---

## The call, in one sentence per question

1. **IA order — CHANGE IT.** Ship: `Identity → Programs → Nav → Sign out → Legal footer`. The compliance card moves to Progress (see #2). Programs is the reason a beta user visits Profile — it should be second, not third.

2. **Compliance card — MOVE IT.** Kill the 7-day sessions/morning-checks card here. It duplicates Today's "did I train?" signal, doesn't drive any Profile-scoped action, and adds ~140 px of noise above the primary content. Profile becomes purely identity + programs + account. If you want a rolling-7 strip anywhere, it belongs above the Progress route, not here.

3. **Legal parity — KEEP THE SPLIT, LABEL IT.** Landing = marketing summary in plain English (2-min read). In-app = canonical GDPR text with sub-processor list, retention table, DPA contact. This is the SaaS standard (Stripe, Linear, Vercel, Notion all do this). Do not unify — the in-app doc is the legally binding one and needs the density. Do add one sentence at the top of the landing version: *"This is a plain-English summary. The binding policy is inside the app."* with a link.

4. **Delete-account affordance — CURRENT SIZE IS RIGHT, CHANGE THE COLOR SEMANTIC.** The tiny footer link is correctly rare, correctly hard-to-fat-finger, correctly guarded by ConfirmSheet. But red text-link in a footer next to "Privacy / Terms" reads like an error state at a glance. Ship it as a neutral muted underline ("Delete my account") and let the ConfirmSheet carry the danger signal (red confirm button, explicit "This cannot be undone" body — which it already does). Red is an accent; spend it on the confirm, not the trigger. This is Refactoring UI accent economy applied.

5. **Density — HERE'S THE RAMP.** Profile is a low-frequency route (2-3 visits/week per user, mostly to switch programs). It should feel calmer than Today. Concrete numbers: 4-5 blocks max, `space-y-5` (20 px) between blocks, `p-3` (12 px) inside cards, `min-h-[48px]` on all rows, body copy `14 px / leading-relaxed`, section labels `10 px uppercase mono muted`, primary program name `14 px semibold strong`, meta `11 px muted`. No hero. No divider walls of nav rows.

6. **Removing inline × was correct.** Discoverability is not hurt because the row itself is a chevron → deep-link, which is the standard "tap to manage" affordance. Removal on the program's own page also means the user sees what they're about to delete (weeks completed, current phase) before confirming — a better consent surface than a modal fired from a list row. Add one small hint on the program page: a "Remove from active" text-link at the bottom of that page, matching the delete-account pattern.

---

## Ship-this wireframe (393 px, dark palette)

```
┌─────────────────────────────────────────────────────┐
│  margus@dolmit.com  [admin]      since Aug 2025     │  ← identity row
│  text-sm muted        mono-10        mono-10 muted  │     no card, no border
│                                                      │     h ≈ 20 px
│                            (space-y-5, 20 px gap)   │
├─────────────────────────────────────────────────────┤
│  YOUR PROGRAMS                     mono-10 muted    │  ← section label
│  ┌───────────────────────────────────────────────┐  │
│  │ Engine Builder            [primary]        ›  │  │  ← 14 semibold + chip
│  │ 12 weeks · intermediate                        │  │     11 muted
│  │ ──────────────────────────────────────────────│  │     divide-y line-soft
│  │ 5/3/1 Anterior Hip                          ›  │  │     min-h 48 each row
│  │ 16 weeks · rehab                               │  │
│  └───────────────────────────────────────────────┘  │
│  + Add another program        mono-11 bronze link   │  ← inline add affordance
│                                                      │     (replaces the empty-
│                                                      │      state CTA button)
│                            (space-y-5)              │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐  │
│  │ 📖  How this app works                     ›  │  │  ← single nav row
│  └───────────────────────────────────────────────┘  │     (Coach re-appears here
│                                                      │      when COACH_URL set)
│                            (space-y-5)              │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │            ⎋  Sign out                         │  │  ← full-width outline btn
│  └───────────────────────────────────────────────┘  │     border-line, mono-12
│                                                      │     min-h 48
│                            (pt-6, border-t)         │
├─────────────────────────────────────────────────────┤
│  Privacy   Terms   Medical disclaimer               │  ← 12 muted, hover ink
│  Export my data (JSON)   Delete my account          │  ← both muted underline
│                                                      │     danger only in confirm
└─────────────────────────────────────────────────────┘
```

**Type + spacing tokens (only Profile):**
- Section label: `font-mono text-[10px] uppercase tracking-wider text-muted`
- Program name: `text-[14px] font-semibold text-strong`
- Program meta: `text-[11px] text-muted`
- Nav row label: `text-sm text-ink`
- Sign-out button: `font-mono text-[12px] uppercase tracking-wider`
- Footer links: `text-[12px] text-muted underline decoration-line`
- Card padding: `p-3` (12 px)
- Row min-height: `48px` (Fitts + iOS HIG)
- Block gap: `space-y-5` (20 px)
- Footer top-gap: `pt-6` + `border-t border-line-soft`

**Component reuse:**
- Programs list: existing `<ul>` + `divide-y` pattern from lines 237-264 — keep it, drop nothing.
- Nav list: existing `<nav aria-label="More">` pattern from lines 274-297 — keep it.
- Sign out: existing button lines 300-309 — keep as-is.
- Footer: existing structure lines 314-343 — change delete-link color from `text-red/80` → `text-muted hover:text-ink`, keep underline.
- Delete: `ConfirmSheet` already has `danger` prop that renders red confirm button — that's where red belongs.

**Deletions:**
- Remove compliance card (lines 200-230) entirely.
- Remove the `rollingWindow`, `daysSessionsDone`, `daysChecksLogged`, `activeWeeks`, `daysWithAnyLog` compute block (lines 115-150) — dead code once the card is gone.
- Remove the empty-state `Pick a program →` bronze button (lines 265-272) → replace with the inline "+ Add another program" text-link in the same slot; when zero programs, that link becomes the only content of the block and stays discoverable.

**Cross-persona check:**
- `persona-recover` — the rehab user visits Profile mainly to check their active hip program is still there. First-fold visibility of Programs is a win. No compliance card means no "you missed 4 sessions" guilt-inducing progress bar, which for a symptomatic morning is correct restraint.
- `persona-strength` — the overperformer wants fast switching between concurrent tracks. Programs at fold-1 with a chevron per row is the right shape. Primary badge tells them which one drives Today.
- `persona-erratic` — the skipper is the one the compliance card actively hurt (7-day dot strip lit up 1/7 red). Removing it from a low-frequency route stops re-punishing them for a signal they already saw on Today. Delete-account and export are both accessible but not shouting, which respects their volatility.

**Modern-standard checks:**
- iOS HIG: safe area handled by parent layout; all tap targets ≥ 48 px; sheet-based confirms not modals. Pass.
- Material 3: state layers via `hover:bg-line-soft/50` on rows. Pass.
- Refactoring UI: one bronze accent (primary badge + "+ Add another") on the whole route; red exists only inside the Confirm sheet. Pass.
- `prefers-reduced-motion`: no motion added; sheet animation is inherited from ConfirmSheet which respects the media query. Pass.
- Fitts's law: Sign-out is full-width in the thumb zone; delete-account is deliberately far from the cradle grip (bottom-right footer) because it should be effortful. Pass.

---

## If you take one thing from this

Profile is not a dashboard — it's a switchboard. Kill the compliance card, promote Programs to fold-1, and let red live only inside the confirm sheet, never on the trigger. Everything else on this page is already close to correct; the noise came from the card.
