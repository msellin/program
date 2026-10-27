# H06 design drift (read-only first pass, 2026-10-27)

**Token sets:** (1) `next-app/src/app/globals.css` @theme, ~35 colours plus chart `--dv-*` and safe-area tokens. (2) `landing/src/app/globals.css` @theme, ~20 colours, with `ground-2`, `surface-3`, `faint`, `teal`, `bronze-lo`. (3) `dev/design/tokens.md`, the stated canon, which says both CSS files must match it. (4) `dev/design/components.md`, 7 button variants.

**Shared:** Inter and JetBrains Mono in both (`next/font/google`). ground `#0e0f12`, surface `#16181c`, surface-2 `#20232a`, ink, strong, green, amber, red are identical.
**Diverged:** muted app `#93989f` vs landing `#8a8f9a`. line app `#5f6570` vs landing `#2a2e37`. bronze app `#c89666` vs landing `#d09a68`. slate (app) vs teal (landing). bronze-hi `#e2b686` vs `#e8b988`. Landing has bronze-lo only, app has bronze-hover/active only.
**Doc drift:** tokens.md lists app `line` as `#3a3f4a`, but code is `#5f6570`. It lists `muted` as the landing value only. Its "app does not use pill buttons" conflicts with 39 app files using `rounded-full`, which may be dots or avatars (not checked).

**Hardcoded-style hits (hex, rgb, arbitrary px/hex/rounded/text):** app 1,552 across about 130 files; landing 214 across about 30.
Top 10 app files: IntakeClient.tsx 107, session/SetView.tsx 84, follow-along/FollowAlong.tsx 65, report/page.tsx 64, session/BriefView.tsx 57, app globals.css 43 (token defs, expected), workout/RunSlotCard.tsx 42, ProgramPreviewClient.tsx 42, session/shared/StatusCards.tsx 39, plan/page.tsx 39.

**Buttons:** 7 documented variants in components.md. Neither CSS file defines a `.btn` class, so every button is inline Tailwind. 271 `<button`/`<Button` in app, 6 in landing. About 220 distinct bg-colour class strings with padding or radius (estimate, not AST-counted). Real distinct styles are likely well above 7.

**Font use:** Inter (sans) and JetBrains Mono (mono) in both. The app adds a system-ui fallback in `global-error.tsx`. The Recharts ticks in `_CutCRechartsInner.tsx` hardcode `#93989f`.

**Issues:**
- [BLOCKS-ADS-TODAY] None found. Every token resolves and each surface renders from its own @theme.
- [BEFORE-SCALE] Hardcoded hex and arbitrary Tailwind in app components (1,552 hits), with no shared class or component layer for buttons.
- [BEFORE-SCALE] The muted, line and bronze values diverge between the two CSS files, and tokens.md does not match the app's `line`.
- [LATER] Rename slate to teal. Retire the ground-2 alias. Correct the pill-button claim in tokens.md.

**Consolidation target:** one `packages/tokens` (or a shared `tokens.css`) generated from tokens.md, imported by both @theme blocks, plus a `<Button variant>` component set replacing inline button classes.

Not checked: rendered visual diffs (no browser run), the `.next/` and `out/` build output, the landing `.tsx` inline styles beyond class-name grep, AST-accurate button counts, and whether any `rounded-full` in app is a pill button.
