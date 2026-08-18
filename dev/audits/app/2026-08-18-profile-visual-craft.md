# Profile page — visual craft audit

Reviewed: `next-app/src/app/profile/page.tsx` (post product-design-lead pass)
Palette source: `next-app/src/app/globals.css`
Cross-checks: `src/app/page.tsx` (Today), `src/app/progress/page.tsx` (Progress)
Viewport basis: 393 px mobile / 320 px SE floor

---

## Verdict (3 sentences)

Profile is now genuinely calm and does read as a switchboard rather than a dashboard — the deletion of the compliance card, the single bronze accent on `primary`, and the muted footer link are all correct calls. The remaining messiness is a **type-scale ladder that skips a rung** (10 → 11 → 12 → 14 → 14 with no 13, and body copy alternating between `text-sm` and `text-[14px]` for what looks like the same role) plus **inconsistent card-frame semantics** — the Programs list and "More" nav both use `border border-line-soft` but Today and Progress cards use `border border-line bg-surface`, so Profile's containers read as one weight lighter than the rest of the app. Fix the ramp and pick one card-frame token and Profile is done.

---

## P0 — ship this week

### P0-1. Body-copy size collision: `text-sm` vs `text-[14px]` for the same role
`text-sm` in Tailwind = 14 px. `text-[14px]` also = 14 px. But the two tokens are used side-by-side for identity-tier text within one component:

- L140 `text-sm text-muted` — email (identity row)
- L181 `text-[14px] font-semibold text-strong` — program name
- L214, L225 `text-sm` — nav row label ("Ask coach", "How this app works")
- L238 `text-[12px]` — Sign-out button

Two Tailwind tokens for one px value is the definition of "messy" — a designer scanning the file thinks they mean different things. **Fix:** everywhere in this file, use `text-sm` for 14 px body/label roles. Reserve `text-[14px]` for nothing — delete it. Same edit on L181: swap `text-[14px] font-semibold` for `text-sm font-semibold`. This is a one-diff change and removes an entire class of design-review confusion.

### P0-2. Card frame weight — `border-line-soft` on Profile vs `border-line` on Progress/Today
- Profile Programs list L171: `border border-line-soft divide-y divide-line-soft`
- Profile "More" nav L208: `border border-line-soft divide-y divide-line-soft`
- Progress Milestone card L329: `border border-line bg-surface divide-y divide-line-soft`
- Progress chart card L252: `border border-line bg-surface`

`--color-line-soft: #24272f` vs `--color-line: #3a3f4a` — that's a real ~2 shade gap on the warm-dark ground (`#0e0f12`). At 393 px the Profile cards look like they're floating one z-layer below Progress cards. And Profile is missing `bg-surface` entirely, so the container isn't lifted off the ground at all — it's just a hairline rectangle on the page background.

**Fix:** promote Profile lists to `border border-line-soft bg-surface` (keep the softer outer line — Profile is intentionally quieter — but add the `bg-surface` lift so the container feels like a card and matches the app-wide grammar of "surface = content, ground = between cards"). Divide-y stays `divide-line-soft` — that's correct inside a lifted card.

---

## P1 — do this month

### P1-1. Type-scale ladder skips 13 px, doubles up 12 px
Ramp actually in use on this route:

| px | Class | Role | L |
|----|-------|------|---|
| 10 | `text-[10px]` mono-caps | `admin` chip, `primary` chip, `since Aug 2025` | 147, 155, 184 |
| 11 | `text-[11px]` muted | program meta ("12 weeks · rehab"), inline CTA | 189, 202 |
| 12 | `text-[12px]` mono-caps | Sign out button label | 238 |
| 12 | `text-[12px]` (not mono, not caps) | footer legal links, export, delete | 249, 254, 275 |
| 14 | `text-sm` / `text-[14px]` | email, program name, nav row label | 140, 181, 214, 225 |

Two problems.

**(a) 12 px used for two visually different roles.** L238 is `mono-caps` (Sign out button) and L249/254 is sans lowercase (Privacy / Terms / Export / Delete). Same size, different faces, adjacent on screen. That's not a ladder rung — that's the same rung with two shoes on it. **Fix:** drop the footer legal + utility links to `text-[11px] text-muted` — they should be quieter than the Sign-out button (which is the primary destructive-adjacent action). Now 11 px = quiet-utility, 12 px = named button.

**(b) No 13 px anywhere.** Today uses `text-[13px]` extensively for card-secondary copy (Today L210, L215, L242, L275). Profile skips from 12 → 14 with nothing in between. That's fine — Profile has less density than Today, so a shorter ramp is defensible. But confirm the intent: three roles (10 caption chip → 11 meta → 14 label) with 12 reserved for one button. Anything else = orphan.

### P1-2. Bronze accent is right, but the empty-state bronze button is a second flavour
L184 `bg-bronze/20 text-bronze` — the `primary` chip. Correct: bronze as a state marker, tinted so it doesn't shout.
L202 `bg-bronze text-ground` — the "Pick a program →" empty-state CTA. This is bronze at 100% saturation, the loudest instance of the accent in the whole route.

Both are legitimate bronze uses (chip for state, solid for primary CTA). But the design-lead review specifically called for "+ Add another program" as an inline text-link (`mono-11 bronze link`) instead of a solid button. Current code still ships the solid button for the empty state. **Fix:** replace L200-206 with `<Link className="inline-block font-mono text-[11px] uppercase tracking-wider text-bronze hover:text-bronze-hover min-h-[44px] py-3">+ Add a program →</Link>`. Now bronze appears exactly twice on the page: as a `/20` tint on the primary chip and as a text-link glyph in the empty state. That's Refactoring UI accent economy.

### P1-3. Line-weight consistency across the two container groups
Programs list (L171) and "More" nav (L208) both use identical `rounded border border-line-soft divide-y divide-line-soft` — good, they're the same visual class. But their **row internals differ** in a way that reads:

- Programs row L178: `flex items-center gap-2 min-h-[48px] px-3` (no `py-`, height driven by `min-h`)
- Nav row L212/223: `flex items-center justify-between gap-3 px-3 py-3 min-h-[48px]` (both `py-3` and `min-h-[48px]`)

Both hit 48 px, but Programs uses vertical centering only, Nav pads with 12 px top+bottom. The visual rhythm holds because both land at 48 px. But the class chain is different for the same target. **Fix:** unify to `flex items-center justify-between gap-3 px-3 py-3 min-h-[48px]` on both. The `justify-between` was missing on Programs L178 (`gap-2` instead) — Programs relies on `flex-1` on the middle column to push the chevron right. That works but reads less consistent to the next reader.

### P1-4. Icon economy — check stroke width
All four Lucide icons imported (`BookOpen`, `LogOut`, `MessageSquare`, `ChevronRight`) at 16 px. Lucide default `strokeWidth={2}` — none of the usages override, so all four are at 2. Consistent. ✅

Sizes: 16 everywhere except `LogOut size={14}` L240 — the smaller icon inside the Sign-out button. That's a defensible exception (icon inside a `mono-caps` button feels chunky at 16), but it's the only 14 in the route. Keep it if you like it; note it's inconsistent with the 16/20/24 ladder documented elsewhere. **Suggestion:** bump to 16 for uniformity — `mono-caps` at 12 px carries a 16 icon fine.

### P1-5. `text-muted` underlined footer links — interactive read at 320 px
L258, L269: `text-muted hover:text-ink underline underline-offset-2 decoration-line`
- `--color-muted: #8a8f9a` (muted)
- `--color-line: #3a3f4a` (decoration)

Ratio between the text and the underline stroke: 8a8f9a vs 3a3f4a. The underline is much darker than the text, so at 320 px on OLED the underline reads as a hairline shadow more than an affordance. Design-lead's original spec was `underline decoration-line` — that's what shipped. But paired with `text-muted` (already low-contrast against ground), the whole link reads as "static caption" not "tap me".

**Fix:** change decoration to `decoration-muted/60` so the underline tracks the text weight (both muted-family), OR promote text to `text-ink` and keep `decoration-line`. Design-lead flagged this exactly — "muted underline" is the right idea but decoration-line is too dark relative to muted text. Pick one of:
- (a) `text-muted underline underline-offset-2 decoration-muted/50 hover:text-ink hover:decoration-ink/50` — both dim, both tracking each other
- (b) `text-ink/80 underline underline-offset-2 decoration-line hover:text-ink` — bump text one step, keep decoration dark, resulting link now clearly interactive

Prefer (a) — it preserves the "footer utilities are quiet" intent. This satisfies WCAG-adjacent interactive-affordance without shouting.

---

## P2 — nice-to-have

### P2-1. Spacing rhythm — `space-y-5` outer + `p-3` inner is intentional; the outlier is `pt-4` on the Sign-out `<section>` (L234)
`space-y-5` = 20 px between siblings. `<section className="pt-4">` at L234 adds another 16 px on top of the 20 px gap → 36 px total between the "More" card and the Sign-out button. That's the intentional Fitts-law separation the design lead called out ("Sign out is separate from nav so it's not fat-fingered when reaching for guide"). Good. But `pt-4` inside a `space-y-5` parent is a subtle rhythm-break — a designer reading the file would ask "why not `mt-4` on section or bump the parent gap". **Non-blocking**: consider `pt-2` (padding-top on top of the 20 px gap = 28 px, still visibly separated but not screaming). Or leave it; 36 px reads intentional on device.

### P2-2. Footer `pt-6 border-t border-line-soft` — the `border-t` is doing the same job as the added padding
`pt-6` = 24 px above the border. `border-t border-line-soft` is a 1 px hairline in `#24272f`. On the `--color-ground` `#0e0f12` background the hairline is barely visible (that's the intent — a whisper of separation, not a wall). But then we ALSO have `space-y-3` inside the footer (L248), which puts a rhythm sub-unit under the border. Reads correct. ✅

### P2-3. Cross-persona (1 / 2 / 0 programs)
- **1 program (persona-recover / persona-strength typical):** list renders as a single-row `<ul>` with just a chevron. No `primary` chip fires (L183 gate requires `activePrograms.length > 1`). Reads clean.
- **2 programs (multi-track power user):** primary chip fires on row 1, second row is chip-less. Both rows separated by `divide-y divide-line-soft`. Reads clean. Verified L173: `isPrimary = i === 0 && p.slug === activeProgramId` — falls back correctly.
- **0 programs (persona-erratic pre-pick):** empty state = bronze solid button "Pick a program →" (see P1-2). Works but is the loudest bronze in the route.

Visual system holds across all three densities. ✅

### P2-4. Palette landing table for this route
| Token | Value | Uses on Profile | Verdict |
|-------|-------|-----------------|---------|
| ground | `#0e0f12` | page background | correct |
| surface | `#16181c` | NOT USED on Profile (see P0-2) | inconsistent w/ rest of app |
| line | `#3a3f4a` | Sign-out button border L238, decoration-line L258/269 | correct |
| line-soft | `#24272f` | Programs card border L171, Nav card border L208, footer top-border L248, loading skeleton L142 | correct |
| ink | `#d6d9de` | Sign-out button text L238, hover: on footer links | correct |
| strong | `#f4f5f7` | program name L181 | correct — only strong in route |
| muted | `#8a8f9a` | email L140, meta L189, admin chip text L147, all footer text | correct |
| bronze | `#c89666` | primary chip bg/20 + text L184, empty-state CTA solid L202 | 2 uses, both defensible; see P1-2 |
| slate | `#79b8c4` | admin chip bg/20 + text L147 | 1 use — reserves slate for "admin marker" role, consistent with warmer accent economy |
| red | `#e5654b` | deleteError banner text + border-l L275 | correct — red lives only in error state, never on trigger |
| green, amber | — | not used on Profile | correct — no state signals belong here |

Accent economy verdict: **disciplined.** Bronze primary, slate as super-admin marker, red only when a delete-request fails. Three semantic accents used at three saturation levels (chip tint, solid CTA, error banner). This is Refactoring UI textbook.

---

## Summary of concrete diffs

1. **L181** `text-[14px]` → `text-sm` (kill the arbitrary duplicate of Tailwind's own token)
2. **L171, L208** `border border-line-soft` → `border border-line-soft bg-surface` (lift the cards; match Progress/Today grammar)
3. **L200-206** solid bronze button → inline `text-bronze` text-link with `+ Add a program →` label
4. **L249, L254 area (footer text-[12px])** → `text-[11px]` so the ramp reads 10/11/14 with 12 reserved for the Sign-out button alone
5. **L258, L269** `text-muted ... decoration-line` → `text-muted ... decoration-muted/50` (underline tracks text weight, reads interactive)
6. **L178** add `justify-between` so both card-row templates match ("More" nav pattern L212)
7. **(optional)** L240 `LogOut size={14}` → `size={16}` for icon-size uniformity

Post these seven edits, Profile stops feeling messy — not because it was ugly, but because the file had three overlapping type tokens for one role, two card-frame conventions, and a decoration that fought its own text. Take out the redundancy and the calm the design-lead pass was going for actually lands on device.
