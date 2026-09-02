# Tasks

## first-strict-pullup
- [x] Citation dimension — `2026-09-02-citation-dimension.md`. C-1 beattie_2014
      mismatch (P1), C-2 vigouroux_2007 overreach (P2), C-3 sinnett_2019 needs
      verification (P2).
- [ ] Comprehensive audit doc
- [ ] P0 fixes
- [ ] Delta until clean
- [ ] Promote to REVIEWED + landing badge

## muscle-up
- [x] Citation dimension — clean apart from shared C-3.
- [ ] Screen coherence: "Week 9 · random practice" renders directly above
      "YOU FINISHED" on Day (persona-muscleup/text/01-day.txt). Same class as
      handstand's "Week NaN".
- [ ] Comprehensive audit doc
- [ ] P0 fixes
- [ ] Delta until clean
- [ ] Promote to REVIEWED + landing badge

## engine-builder-block-2
- [x] Citation dimension — clean. Strongest evidence base in the catalog.
- [ ] Comprehensive audit doc
- [ ] P0 fixes
- [ ] Delta until clean
- [ ] Promote to REVIEWED + landing badge

## Cross-cutting (found during the sweep)
- [~] **P0 · readiness gate reads one person's hip body map for every program.**
  Full writeup: `dev/audits/programs/2026-09-02-readiness-input-P0.md`.
  Blocks promotion of all three — an audit cannot certify a program whose
  authored symptom inputs the engine never reads. Awaiting founder's call
  between the three fix options (program-driven check / generic core + extras /
  add the missing regions).
- [ ] `any_of` and `or` in progression rules are prose, not conditions —
  violates the machine-evaluable constraint in CLAUDE.md. Moot while nothing
  evaluates the block, but must be fixed if option 1 or 2 is taken.
- [ ] CLAUDE.md's two false claims about `daily_log_schema` and
  `progression_rules.states[]` need correcting whichever option is chosen.
