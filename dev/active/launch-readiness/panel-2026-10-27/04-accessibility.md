# Panel: accessibility WCAG 2.2 AA (Sonnet) — 5 PNG, 2 DOM, source grep; no keyboard/SR pass
1. FIX — 9–10px mono labels in session UI: RestTakeover (`text-[10px]`, `text-[9.5px]` ~L306/362/397), SetView (6× 10px, 2× 9px), BriefView (11× 10px). RIR labels, "+30s", LAST TIME, PRESCRIBED. → ≥12px. 1.4.4/1.4.12.
2. FIX — SetView unfilled set chips near-invisible (border ~1.3:1), state by dimness only → `border-line-strong` + text label; check `disabled:opacity-40` buttons. 1.4.11/1.4.3.
3. FIX — HurtSheet: title is `<p>`; step change inside trapped dialog doesn't move focus; `role=status` injected late. Focus new step title on setStep; mount empty status region. `shared/BottomSheet.tsx` L62-65, `HurtSheet.tsx` L102. 4.1.2/2.4.3.
4. FIX — RestTakeover countdown: confirm end-of-rest announcement and +30s/Skip announce; focus on open. 4.1.3/2.4.3.
5. FIX — /check severity radios each tabbable (~12 stops) → roving tabindex + arrows or native radios; selected state mostly colour → add check/weight. 1.4.1/4.1.2/2.1.1.
6. FIX — /check sticky "Update check" bar + nav obscure focused controls → `scroll-padding-bottom` ≥140px. 2.4.11.
7. FIX — /check `#outside-training` label linkage unverified; focus ring `ring-slate/40` <3:1 → outline-bronze. 3.3.2/1.4.11.
8. LATER — amber used for both "Something hurt" warn and current-set chip.
9. LATER — truncated exercise tabs: aria-label should include progress.
10. LATER — SetView L697 `role=alertdialog` on an inline block → `role=group`.
11. LATER — stale `role=dialog` InfoSheet in /record DOM; check it isn't open after load.
12. LATER — heading hierarchy on session and /check (add h2s).
13. LATER — reduced motion missing on RestTakeover countdown and sheet slide-in.
Palette: muted #93989f 6.6:1 pass; line #5f6570 3.27:1 borderline. Problem is size and dimmed states.
