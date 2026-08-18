# Profile page — mobile UX audit (2026-08-18)

**File:** `next-app/src/app/profile/page.tsx`
**Shell:** `AppShell.tsx:147-154` (main pb = `calc(64px + env(safe-area-inset-bottom) + 1rem)`)
**Nav:** `BottomNav.tsx:39` (sticky, `pb-[env(safe-area-inset-bottom)]`, min-h 52px)
**Viewports checked:** 393×852 (iPhone 15 Pro), 375×667 (SE)

## Overall verdict

The design-lead pass materially improved thumb-zone hierarchy: Sign out is now a full-width outline button in the primary reach zone, and Delete correctly recedes into a low-key footer. The most reachable-and-repeat action (Sign out) still doesn't collide with the destructive action (Delete), which is the important win. Two real regressions remain — footer text-links are below Apple's 44px tap-target minimum, and the removed inline × left behind a benign but sticky `hover:` residue on the program row and "More" nav rows that the new `@media (hover: none)` reset only partially neutralises.

---

## P0 — blocking

### P0.1 Footer text-link tap targets fail Apple HIG 44×44

- **Where:** `profile/page.tsx:250-272` — Privacy / Terms / Medical disclaimer + Export / Delete are inline `text-[12px]` links with no vertical padding.
- **Actual size:** 12px font × ~16px line-height = ~16px tall. Horizontal hit-slop ~0. Even the WCAG 2.5.8 minimum (24×24) fails.
- **Fitts consequence at 393×852:** these sit ~80-120px above the bottom nav — inside the primary thumb zone but 3× harder to hit than the 44px nav icons directly below. Users will misfire onto the nav bar's Profile tab or overshoot into Delete when reaching for Terms.
- **Adjacency:** flex-wrap gap-x-4 = 16px between links. If the row wraps at SE (375px), Delete lands directly under Export with only `gap-y-1` = 4px vertical gap. Two destructive-adjacent actions vertically stacked inside a 4px seam is a P0 misfire risk.
- **Fix:** wrap each footer link in `inline-flex items-center min-h-[44px] py-2` and increase gap-y to 3+. Or convert Export/Delete to a `divide-y` list.

---

## P1 — fix this week

### P1.1 Bottom padding — footer sits too close to the sticky bottom nav

- **Where:** `profile/page.tsx:136` outer `pb-6` (24px) + `AppShell` pb = 64 + inset + 16px. Total = ~104px + inset.
- **Result:** Delete/Export sits ~104px above viewport bottom on scroll-end — reachable, but Delete lands in the same y-band as the Progress tab icon in the bottom nav. Users mid-reach for Delete cross-target the nav.
- **Fix:** raise the footer off the nav by increasing outer `pb-6` → `pb-10`.

### P1.2 Residual `hover:` styles on rows

- **Where:** `profile/page.tsx:212, 223, 250, 258, 269` — nav rows and footer links use `hover:bg-line-soft/50` / `hover:text-ink`.
- **iOS behaviour:** `globals.css:169-176` `@media (hover: none)` uses `revert`, which reverts to browser default — not always Tailwind utility. In practice this leaves the last-tapped row visibly tinted until another element is tapped.
- **Fix:** switch nav rows to `active:bg-line-soft/50` (fires only during touch, releases automatically). Pair every `hover:` with `focus-visible:` for keyboard. `@media (hover: none)` reset stays as safety net, not primary tool.

### P1.3 Program list row — primary badge fragile at SE 375

- **Where:** `profile/page.tsx:176-194`.
- **Multi-plan primary badge:** `p.name` + `primary` pill on one line with `truncate`. At 375px with a long program name, the name truncates *before* the badge appears, so the primary indicator visually detaches from its target.
- **Fix:** move the `primary` badge to the row's meta line (`duration_weeks · difficulty · primary`) or the row's right side before ChevronRight.

### P1.4 ConfirmSheet — no body scroll lock on iOS Safari

- **Where:** `ConfirmSheet.tsx:59-70`.
- **iOS Safari behaviour:** with the sheet open, page scroll behind the dim overlay is still active. Rubber-band scroll behind the sheet shifts the underlying Profile page.
- **Fix:** add `document.body.style.overflow = 'hidden'` on open, restore on close. Also `overscroll-behavior: contain` on the panel container.

### P1.5 ConfirmSheet close-X `-m-2` collides with title baseline

- **Where:** `ConfirmSheet.tsx:75-82` — close button is 44×44 but uses `-m-2` (negative 8px margin) so its visible tap area extends into the title's baseline.
- **Consequence:** users tapping the last character of a wrapped title ("Delete your account permanently?" wraps to line 2 on SE) hit the X and cancel.
- **Fix:** remove `-m-2`; add `pr-11` to the title container so wrapped text can't slip under the X's rect.

---

## P2 — nice to have

### P2.1 Scroll length — fold-2 empty on desktop

- On 393×852 with 1 active program, total content ≈ 620px; fold-2 (852-1704) is empty.
- Not a bug. Optional: wrap in `flex flex-col min-h-[calc(100dvh-nav)]` with `<footer className="mt-auto">` to anchor footer to viewport bottom when content is short.

### P2.2 0-program state — CTA too high

- **Where:** `profile/page.tsx:200-206`.
- The empty-state pill lands at y ≈ 160px — deep in the ouch zone for a first-time-user CTA.
- **Fix:** in the empty state, render "Pick your focus →" as a bottom-anchored primary button, or promote to full-width `bg-bronze` in place of Sign out (signed-in users without a program don't need Sign out on primary reach row).

### P2.3 Landscape 852×393 — Sign out button too wide

- **Where:** `profile/page.tsx:235-242` `w-full` outline button.
- At landscape 728px wide, target is huge but 14px label looks like a hero CTA. Distinct visual regression vs portrait.
- **Fix:** cap at `sm:max-w-xs mx-auto`.

### P2.4 PWA standalone top-inset respected

- `AppShell.tsx:117` `paddingTop: env(safe-area-inset-top)`. Good, keep as-is.

---

## Cross-persona check

| State | 393×852 | 375×667 |
|-------|---------|---------|
| 0 programs | Empty state pill too high (P2.2). Legal footer fine. | Same, sharper. |
| 1 program | Works. | Program name may truncate awkwardly if long. |
| 2 programs | `primary` badge inline with truncated title is fragile (P1.3). | Fails visibly — badge wraps below name. |

## Files reviewed
- `next-app/src/app/profile/page.tsx`
- `next-app/src/components/AppShell.tsx`
- `next-app/src/components/nav/BottomNav.tsx`
- `next-app/src/components/ConfirmSheet.tsx`
- `next-app/src/app/globals.css` (hover-reset block 165-176)
