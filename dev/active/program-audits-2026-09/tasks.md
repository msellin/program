# Tasks — COMPLETE 2026-09-02

All three programs promoted REFERENCED → REVIEWED (badge: CITED → VERIFIED).

## first-strict-pullup — done
- [x] Citation dimension · C-1 beattie_2014 removed, C-2 + C-3 rewritten
- [x] Readiness inputs · declares [shoulder, elbow, low_back]
- [x] Intake deferrals · elbow + shoulder rules, visible on session
- [x] Screen coherence · CI legend guarded, "Program week" disambiguated
- [x] Tier phase resolution · clean, now test-guarded
- [x] Promoted + landing badge

## muscle-up — done
- [x] Citation dimension · C-3 rewritten
- [x] Readiness inputs · declares [shoulder, elbow, wrist]
- [x] Intake deferrals · mu_band_assisted_ring_dip authored as the substitute
- [x] Screen coherence · "Week 9" over "YOU FINISHED" fixed
- [x] Tier phase resolution · clean
- [x] Promoted + landing badge

## engine-builder-block-2 — done
- [x] Citation dimension · clean, 32 refs
- [x] Readiness inputs · declares [low_back, knee, achilles]
- [x] Safety gates · all three cardiac questions correctly gated
- [x] Promoted + landing badge

## Cross-cutting, shipped
- [x] Readiness gate reads program-declared regions (was one person's hip map)
- [x] intake_exclusions[] — the intake's promises are now kept
- [x] phase_gates — implemented all along, schema was stripping its input
- [x] Dead-key test — fails on any top-level key the runtime discards
- [x] Harness: started_at + intake_answers persist; personas no longer graduate
      on day 21 of an 8-week arc
- [x] Harness: feedback widget suppressed during tours (addInitScript)

## Deliberately left open
- Red flags (`gait_change`, `click_painful`) are still hip-scoped via `isHip`
  rather than program-declared. Same category error as the regions, far smaller
  blast radius — no other program's users are asked about them.
- `progression_rules` and `daily_log_schema` remain in program files as
  authoring documentation, explicitly marked dead in the dead-key allowlist.
- PROG-2 (`overhead-mobility.capability_domains`) — dead, almost certainly just
  delete, outside this audit's scope.
- EVID-1 (named outside specialist) and EVID-2 (counting completed arcs) remain
  the two bars the ladder copy openly says no program has cleared.
