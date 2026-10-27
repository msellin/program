# Launch readiness — context

## State (2026-10-27)

- Brief committed (`2ab7004`). Plan proposed to the owner; **waiting for go-ahead** before Phase 0/1.
- Started from the Plain Words session (`~/www/mensmindset`). Shared notes folder for that session family:
  `~/Library/Application Support/Claude/side-session-notes/local_97a7e004-db6f-40c9-b4f6-b8bf19ec2994`
  (empty at start).

## Key files

- `brief.md` — why Terav, what a quick look found, core idea, owner's working process.
- `next-app/public/data/programs/manifest.json` — the 9 programs; `anterior-hip-rebuild` is `personal: true`.
- `next-app/tests/e2e/personas.spec.ts` + `artifacts/personas/` — 24 personas, last run 2026-10-01 (stale).
- `next-app/tests/e2e/landing-shots.spec.ts` — targets old `terav-landing.pages.dev`, 5 pages only.
- `dev/scripts/run-app-audit.sh` — existing persona + 6-specialist audit; reused for capture, not for the
  specialist dispatch (those agents are scoped to polish, not launch readiness).
- `dev/active/saas-launch/`, `dev/active/OPEN-TASKS.md`, `dev/active/traffic/` — roadmap docs, partly stale.
- `dev/design/{tokens,components}.md`, `dev/design-briefs/` — design system docs to compare against.

## Decisions

- Audit areas: the brief's seven, with UX split into app UX and visual system → 8 agents.
- Audit agents Sonnet (roadmap + tech on Haiku); planners, judge, red team and panel on Sonnet; market sweep on Haiku.
- Findings tagged BLOCKS-ADS / BEFORE-SCALE / LATER so the plan can sort them mechanically.

- Owner 2026-10-27: everything lands in this repo folder; cheaper models (no Opus agents); 23 Haiku
  web-search agents on competitors + market, answering "market / add / pivot".

## Market result (2026-10-27)

`findings-market.md`: **as-built, no pivot signal, evidence WEAK** (adjacent apps get paid; no demand test
for Terav itself). BLOCKS-ADS adds: lead message = per-change why + Accept; clear trial-end/cancel; read
Meta/Google primary health-ad policy. BEFORE-SCALE: post-goal next-focus path (H&F first renewal ~30%),
Concept2 import, annual vs one-off framing. €150 test ≈ 4-30 trials: shows cost per trial, not conversion.

## Owner clarification (2026-10-27)

Core idea = improve weaknesses, CrossFit-leaning, research/whitepaper-based. Paid-tier idea = AI video
coach (plan in `dev/active/video-analysis/`, spike passed 2026-09-01, unbuilt). Owner ideas are
hypotheses → 3 Haiku agents researching the video-coach market → `findings-video-coach.md` verdict.

## Next steps

1. Owner go-ahead on Phase 0 capture + Phase 1 audit.
2. Phase 0 capture.
