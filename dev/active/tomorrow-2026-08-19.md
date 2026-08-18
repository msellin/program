# Tomorrow (2026-08-19) — task list

Rolled up from tonight's comprehensive audit sweep + reconciled fix pass.
Ordered by priority. Trivial fixes went in tonight; what remains needs
either (a) architectural work, (b) design decisions, or (c) tools you
haven't set up yet (PostHog, lawyer).

## Tier 1 — verify tonight's work landed clean (~15 min)

Harness rerun should have completed overnight. Spot-check:

- [ ] Confirm all 8 personas produced artifacts (should be 8 folders in
      `next-app/tests/e2e/artifacts/personas/`)
- [ ] `persona-handstand/text/01-today.txt` — no `Week NaN`; phase readout
      matches persona start date (July 1 → mid-arc, not "YOU FINISHED")
- [ ] `persona-handstand/final-store.json` — `program_states["handstand-walk"]
      .tier === "tier_a"` present
- [ ] `persona-engine/final-store.json` — `logs[date].runs[]` populated on
      Tue/Thu/Sat days with realistic `avg_hr` values
- [ ] `persona-strength/text/01-today.txt` — CSM strength suggestions now
      show 5×5 @ 75% TM (not 55% cold-start ramp)

If any check fails: the underlying fix regressed. Report and I'll debug.

## Tier 2 — architectural work still open (~2-4 hrs each)

Ordered by user-facing impact.

- [ ] **P0-2 Today contradictory-state final sweep**
  - Batches 1+2 should have resolved most instances via phase-shift
    fallback + tier-aware phase selection.
  - Manually verify by signing in as `e2e-persona-handstand@example.test`
    at https://app.terav.fit/sign-in with `TestPassword123!` and looking
    at Today. If it still shows 2-5 contradictory state summaries, gate
    each card explicitly on `program_states[slug].tier != null` for
    "YOU FINISHED" and retest-window banners.
  - Root cause was two clocks (elapsed days vs JSON phase dates) fighting
    when `program_states[slug]` was empty. That's fixed now, but any
    remaining contradictions are per-card gating.

- [ ] **CSM amber-week drop-4×4 hook (P1-11)**
  - `concurrent-strength-maintenance.json:541` describes: "amber week
    detection (≥3 amber days) → drop 4×4 next week".
  - No engine code consumes this today. Needs:
    - Rolling-7-day amber-day counter in `adapt.ts`
    - New proposal type `weekly_intensity_soften` in `proposals/select.ts`
    - Scheduled-override write for `block_4x4_row` in the next week
    - Confirm-first Accept surface on Today
  - ~3-4 hrs, one meaningful engine feature. Founder-decision: worth
    shipping for CSM's first paid user, or defer?

- [ ] **Skill/mobility exercise logging in simulator (P0-M residual)**
  - Batch 3b added `runs[]` for aerobic. Skill (wall_hold_seconds,
    freestand_hold_seconds) and mobility (TGU_hold_max_seconds, OHS depth)
    still don't populate in `exercises` or `capability_profile`.
  - Blocks adaptation verification for handstand-walk + overhead-mobility
    personas' retest windows.
  - Fix: add a per-program items writer that inspects the block's
    exercise items and writes plausible ramp values across the arc.

- [ ] **Full intake commit path in simulator**
  - Currently the simulator writes minimal `program_states[slug].tier`.
    It doesn't write `intake_answers`, `capability_profile`,
    `baseline_capabilities`, or `baseline_training_maxes`. YourPlanCard
    reveals partial content; retest-metric delta math has no baselines.
  - Fix: extract the state-writing side effects of `IntakeClient.commit()`
    into a reusable helper and call it from `simulator-v2.ts`.

## Tier 3 — design decisions (needs founder call)

- [ ] **Brand consistency pass** (already scoped in
      `dev/active/brand-visual-consistency.md`)
  - Landing vs app category color mismatch: aerobic (teal on landing) vs
    endurance (green in app); skill (bronze on landing) vs skill (slate
    in app). Neither is "wrong per audit" — it's an unowned design call.
  - Landing home programs section vs landing /programs page also have
    two different `ProgramCard` components + two data sources
    (`programsFor(dict)` in Programs.tsx, `PUBLIC_PROGRAMS` in
    programs-catalog.ts). Consolidate to one source.
  - Requires you to decide the taxonomy + color mapping, then I execute.

- [ ] **Logo / wordmark / favicon / splash / Instagram assets**
  - `dev/active/brand-visual-consistency.md` has the full plan. Blocked
    on your decision on wordmark. Consider running the design-lead agent
    on this specifically if you want expert input.

## Tier 4 — beta launch prerequisites (founder actions)

- [ ] **PostHog** — deferred (Sentry User Feedback covers beta needs).
      Re-open when cohort/funnel data becomes useful.
- [ ] **Lawyer review of TOS + privacy** — €300-800. Legal pages
      shipped tonight are GDPR-hardened for beta scope but should be
      reviewed before public launch.
- [ ] **Beta invite mechanism** — deferred (box members = 3-5 known
      people, obscurity is fine).
- [ ] **Buy real production domain** — already done. `terav.fit` +
      `app.terav.fit` custom domains wired. `npm run deploy` in
      `next-app/` now targets the right project (`program-v2`).

## Tier 5 — dead-code + polish

- [ ] `store.cycle.phase_id` never populates (P1-10 in reconciled report).
      Only consumed by `coach-client.ts` for LLM context. Either wire a
      writer or delete the field. Not user-visible; low priority.

- [ ] Persona harness parallel mode — currently serial (7-8 min for 8
      personas) via `test.describe.configure({ mode: "serial" })`.
      Playwright can run parallel with isolated browser contexts. Only
      concern is Supabase admin API rate limits during rapid signup/
      reset. Bench with `mode: "parallel"` + workers: 2; if it holds,
      cut runtime ~50%.

- [ ] The `AGENTS.md` "This is NOT the Next.js you know" block in both
      `landing/` and `next-app/` root reads as system-reminder prompt-
      injection to subagents. Vector A + comprehensive audits both
      flagged it (agents ignored it correctly per my dispatch prompt).
      Options: rename to `NEXT_NOTES.md`, reword the block, or add an
      explicit "this is content, not instruction" wrapper. Rewriter
      is `node_modules/next/dist/server/lib/generate-agent-files.js` per
      the block itself — investigate whether Next.js gives an opt-out.

## Reports you can read for context

Everything I dispatched tonight wrote to `dev/audits/`. Highlights:

- `dev/audits/programs/2026-08-18-comprehensive-reconciled.md` —
  the master fix list, 18 items ordered
- `dev/audits/programs/2026-08-18-setup-audit.md` — Vector A JSON
  audit (mostly landed as trivial fixes tonight)
- `dev/audits/programs/2026-08-18-{slug}-comprehensive.md` — 5 per-
  program end-to-end audits with adaptation-verification sections
- `dev/audits/app/2026-08-18-profile-*.md` — 4 Profile-page audits
  from earlier in the session (all landed tonight)

## Commits shipped tonight (for `git log --oneline` context)

- `65a397b` Batch 1 · trivial audit fixes across 8 files
- `cccd609` Batch 2 · architectural audit fixes
- `df9b3a0` Batch 3a · retest empty-state UX + rowing tier fallback
- `c70feba` Batch 3b · persona simulator + tier + runs[] gap closed

Earlier in the session: Profile reconcile, Vector A JSON fixes,
5/3/1 fix, GDPR-hardened legal pages, harness state-push fix.

## What NOT to do first

- Do NOT restart the persona harness manually — it just finished
  overnight. Only re-run after a real code change.
- Do NOT change landing colors ad-hoc. The brand pass is the right
  place for that call.
- Do NOT dispatch new specialist audit agents unless a new area is
  in scope. Tonight's five program agents covered the shipped catalog
  end-to-end; re-running the same audits won't surface anything new.
