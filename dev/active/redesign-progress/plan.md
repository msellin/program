---
name: Redesign Cut C revised — collapse Progress + History into unified training-record surface
started: 2026-08-21
status: BRIEF PHASE (design brief being drafted by product-design-lead agent)
---

# Cut C revised · Plan

## Approved scope

1. **Collapse Progress + History into one surface** — matrix finding: most peers that scale (Oura, Hevy, Whoop, Peloton, Apple Fitness+) use a single training-record surface with zoom controls. Split-tab approach only used by feature-heavy power-user apps (Garmin, TrainingPeaks). Terav's current 5-tab IA has both `/progress` and `/history` which the founder observed feel duplicated. New surface name TBD by brief (candidates: History, Trends, Progress, Record).

2. **Rolling-avg math per program, exposed as labeled zoom tier** (matrix rec #1) — Oura reference: 3-day / 90-day / since-inception. Each of Terav's 5 programs gets its own aggregation window matched to program cadence.

3. **JSON export with citation payload** (matrix rec #3) — Garmin reference for tenure trust; Whoop wipe-on-cancel anti-pattern. Available in-account, one-click, includes accepted proposals + citations (the differentiator no peer exports).

## IA impact

- 5 tabs → 4 tabs (delete or redirect `/progress` → collapsed surface)
- New primary surface name lives at `/history` OR renamed (brief decides based on which peer pattern the design most closely follows)
- Everything else in IA untouched: Today, Week, Programs, Account/Profile

## Non-goals (explicit)

- Today hero-of-the-day rebuild (that's Cut B, later)
- Widget (Cut A)
- Year-in-Review artifact (Cut A)
- Onboarding replacement (Cut A)
- New IA beyond the tab collapse
- New visual system — inherits v1.1.1 (bronze CTA-only, warm-dark, mono-caps, ArcProgressBar, StatusPill)

## Process (per screen)

1. **Brief** — product-design-lead agent produces `brief.md` with ASCII wireframes at 4 data states (empty · 30d · 90d · 400d). Founder reviews.
2. **Stitch mockup** — one mockup of the unified surface at the 400d state. Founder reviews.
3. **Code** — new component (rolling-avg curve), new screen composition, delete/redirect `/progress`, JSON export endpoint + button.
4. **Verification** — synthesize 400-day persona (fabricate ~350 days of logs on rowing or CSM). Run harness. Confirm no regression + surface actually renders sanely at scale.
5. **Deploy** — Cloudflare Pages, persona harness re-run against live.

## Deliverables

- `dev/active/redesign-progress/brief.md` — design brief (this cycle)
- Stitch mockup URL (linked in brief.md)
- Code: new Progress/History unified route, rolling-avg curve component, JSON export endpoint
- `dev/active/redesign-progress/context.md` — durable state notes (updated during build)
- `dev/active/redesign-progress/tasks.md` — checklist

## Verification target

- persona-strength-slow at day 400+ renders the new surface with no visual break, no error boundary, no chart that goes off-canvas
- JSON export downloads and includes accepted proposals + citations
- Persona harness 14/14 green on all remaining routes

## Timeline (my pace)

- Brief: 1-2 hours
- Stitch: ~1 hour
- Code: 2-3 days
- Verification: half day
- Deploy: half day

Total: ~3 days, ~2 review cycles (brief + Stitch).

## What we learn from this cut

- Does the rolling-avg-math approach feel right for Terav's 5 program shapes? (If not, Cut B/A are on hold pending re-think.)
- Does IA-tab-collapse feel like a real change or a rearranging-deck-chairs move? (If real, motivates Cut B's Today hero-of-the-day rebuild.)
- Does JSON export change how the product feels? (If yes, launch-week reality.)
