# Context
- Repro of founder's 2026-10-01 Brief: "TODAY'S TOP SET 75×5" + rail "1 × 75 kg · 5 × 75 kg" vs set view "set 1 of 5". `railScheme` in BriefView.tsx ignores `straight_sets`.
- Row counts: DaySession.tsx ~468 `item.sets ?? exercise.default.sets ?? 3`; item.scheme is prose.
- Plan day actions: app/plan/page.tsx ~877-927 link only `/session/${primarySlug}?date=`.
- overhead-mobility blocks are capability_slot + slot_drill_count; drills are exercises.json `om_*` with `default: null`, video_search only.
