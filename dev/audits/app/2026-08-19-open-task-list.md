# August 19 app audit — what remains

> **Triaged 2026-09-08.** Every `- [ ]` in the original was checked against the
> codebase, not against its own description. Result: **40 already done and
> never ticked · 4 obsolete or superseded · 9 genuinely remaining.**
>
> The full original is preserved at
> `dev/archive/triaged-2026-09-08/audits__app__2026-08-19-open-task-list.md` — nothing was deleted, and the
> DONE verdicts are recoverable from there. What follows is only what survived,
> so the generated index in `dev/active/OPEN-TASKS.md` counts reality instead of
> counting boxes nobody walked back to tick.

## Remaining

- [ ] **B4 — body copy 13px -> 14px.** Mostly shipped (290 `text-[14px]`), but
      35 `text-[13px]` remain across 21 files and **`text-[9px]` survives at
      `SetView.tsx:379` and `:462`** — the densest interactive surface in the
      app, in the primary logging flow, one of them also truncated.
- [ ] **C15 — safety copy must be >= 14px.** Original anchors are gone; the class
      of defect is not: `WeekRecoveryCard.tsx:100,127,138,149` (deload guidance),
      `RacePlanCard.tsx:105` (taper caution banner), `StatusCards.tsx:206`.
- [ ] **C17 — `border-l-slate` on non-interactive borders.** `plan/page.tsx:347`,
      `:354`, `ProgramPreviewClient.tsx:247`.
- [ ] **FOUNDER — D9** `content-visibility` on off-screen Week rows. Conditional
      on a CLS regression nobody has measured.
- [ ] **FOUNDER — D12** block-category mono-caps -> sentence case. The list marks
      this Rejectable; mono-caps is the brand.
- [ ] **FOUNDER — E5** retest-week polish. No acceptance criterion; all three
      retest surfaces ship.
- [ ] **FOUNDER — F2** close or archive the concurrent-tracks audit.
- [ ] **FOUNDER — F3** SaaS Phase 3 billing. See `saas-launch/`.
- [ ] **FOUNDER — F4** F5 correlation view trigger. Needs an explicit
      "N users x 90 days" threshold.
