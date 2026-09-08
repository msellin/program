# August 18 motion/perf sweep — what remains

> **Triaged 2026-09-08.** Every `- [ ]` in the original was checked against the
> codebase, not against its own description. Result: **10 already done and
> never ticked · 3 obsolete or superseded · 3 genuinely remaining.**
>
> The full original is preserved at
> `dev/archive/triaged-2026-09-08/audits__app__2026-08-18-motion-perf-sweep.md` — nothing was deleted, and the
> DONE verdicts are recoverable from there. What follows is only what survived,
> so the generated index in `dev/active/OPEN-TASKS.md` counts reality instead of
> counting boxes nobody walked back to tick.

## Remaining

- [ ] **P0-2 — the font-weight cut is in source but not in the artifact.**
      `layout.tsx:17-29` declares five faces (Inter 400/500/600, JetBrains
      400/500) as of 2026-09-03, and the build still emits **13 woff2 totalling
      300 KB** — effectively identical to the pre-fix measurement, including an
      85 KB single face. Either `next/font` is not honouring the weight array
      (Inter is variable; static-instance generation can surprise) or `out/` was
      not rebuilt. Measure against the LIVE artifact, not `out/` — that
      distinction is why the Sentry DSN incident happened.
- [ ] **P0-3 — MO3** flips to done when P0-2 actually lands.
- [ ] **P2-2 — verify the font preload** targets the right woff2 afterwards.
