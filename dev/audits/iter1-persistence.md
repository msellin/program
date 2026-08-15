# Iter 1 — State Persistence Audit

Target: `https://program-v2.pages.dev` (2026-08-07). Source: `storage.ts`, `useStore.ts`, `schemas.ts`, `Onboarding.tsx`, `FirstRunBanner.tsx`, `app/data/page.tsx`. Method: Playwright, fresh browser context per scenario, 30 screenshots in `iter1-persistence-shots/`.

## Summary

Schema + sanitiser survive every malformed shape without crashing; round-trip import is byte-identical. But the layer has **three critical bugs**: Wipe is a no-op across reload (seed refills it), concurrent-tab writes silently clobber, and v1→v2 migration is effectively dead because the seed wins the race. Onboarding and FirstRunBanner both gate on the same "empty store" the seed usually clears within ~1s, so a fresh visitor almost never sees either.

## Bug count

- **Critical: 3** — wipe doesn't stick; cross-tab clobber; v1 migration silently dead.
- **High: 4** — negative TMs pass schema; paste-import bypasses 5 MB size limit; onboarding partial answers discarded; coach history not cleared by Wipe.
- **Medium/Low: 4** — no set-count bound; sanitiser skips backup in most corruption cases; `saveStore` throws without boundary; wipe+empty-seed traps user behind Onboarding on /data.

## 1, 2, 4. Fresh install + onboarding + seed

`localStorage.clear()` + cache/SW purge, reload. After ~2.5 s store has 4 logs / 3 TMs from `/data/log.json` seed. All 5 tabs render normally. Neither Onboarding nor FirstRunBanner appears — both gate on `logsCount>0 || tmCount>0` and by the time they mount, hydrate has replaced empty with seeded. Seed always wins on prod (`s2-onboarding-preseed.png` at t=300 ms already shows Today). **The onboarding flow, as shipped, is effectively unreachable on the live URL.** Fine for a single-user tracker, gap for QA.

## 3 + 17. FirstRunBanner interaction

With `/data/log.json` routed to 404, both dialog and banner render simultaneously; modal visually covers banner but flags are independent. Skip setup sets `program.onboarding.done=1`, revealing banner; banner's X sets `program.firstrun.dismissed=1`. Both persist across reload. No collision, no state leak.

## 5. Malformed localStorage

No crash in any of: scalar `"hello"`, missing `logs`, missing `training_maxes`, `training_maxes: [1,2,3]`, `weight_kg: -50` with TM `-100`, 5000-set entry, truncated JSON, whitespace+trailing junk. Recovery is either seed-refill or sanitiser-preserved with defective values intact.

- `trySanitize` writes `program.log.v2.corrupt` only on the scalar/array top-level branch (storage.ts:32). **Partial-shape corruption is silently lossy** — most common cases skip the backup.
- **[HIGH]** `training_maxes: z.record(z.string(), z.number())` has no positivity constraint — `-100` persists. `weight_kg` on set logs unbounded. Add `.positive().max(500)` on TMs.
- **[MEDIUM]** `sets: z.array(setLogSchema)` has no `.max(N)` — 5000-set payload loads unchallenged.
- **[LOW]** Parse warning logged twice per hydrate (StrictMode). Cosmetic.

## 6. v1 → v2 migration — dead

Injected valid `program.log.v1` with 2 dates, removed v2 key, reloaded. Expected: 2 migrated days. Actual: **4 logs / 3 TMs from seed, no v1 dates.** The emptiness check (`storage.ts:132`) uses AND; migration produces 2 logs and 0 TMs so AND should prevent seeding — yet empirically the seed overwrote. Likely cause: StrictMode double-invoke re-runs the hydrate effect, and the second `seedFromRepoLogIfEmpty` sees the pre-migration `current` closure. **[CRITICAL]** Persist a `seeded_at`/`migrated_at` flag; short-circuit seed if either exists; run the seed synchronously before `set({hydrated: true})`.

## 7. Quota exceeded

Filled localStorage with four 1 MB blobs; the fifth threw `QuotaExceededError`. App reloads fine; a 130-byte save afterward succeeded. **`saveStore` re-throws and normal setters (`setTM`, `updateSet`, …) don't wrap it** — an ordinary log during quota exhaustion is an unhandled rejection. Only `importFile` and `PasteImport.handleImport` catch it. **[MEDIUM]** Wrap setters or add an error boundary.

## 8. Concurrent tabs — critical clobber

Two tabs. Tab A wrote `training_maxes.back_squat_highbar = 111`. Tab B did **not** observe — no `window.addEventListener("storage", …)` anywhere in `useStore.ts` / `storage.ts` / `StoreHydrator`. Tab B then wrote `training_maxes.front_squat = 88` from its stale copy; the whole-blob save overwrote localStorage. **Tab A's 111 was lost.** On reload Tab B only had 88. Realistic failure: iPhone + iPad both open. **[CRITICAL]** Add a `storage`-event listener in `StoreHydrator` that re-hydrates Zustand on cross-tab writes. Doesn't handle simultaneous writes, but eliminates the "phone open in background" clobber.

## 9-11. Import matrix

Valid full store (6 optional fields incl. nested `sets[]` with `rpe`): replaced after confirm, all fields present. Malformed JSON: red-text `Not valid JSON: …`. Valid JSON with `version: 3`: red-text `Invalid input at version` — zod path shown. Partial (missing `training_maxes`): red-text `Invalid input at training_maxes`, rejected. **All error paths preserve the current store.**

## 12. Big-payload import

7.85 MB paste. Paste-import path has **no size check** — only file-upload guards on 5 MB. Fill + confirm took ~6.6 s; Zod validated <1 s. Final `saveStore` almost certainly hit quota (store unchanged at 4 logs). No data loss, but no size warning either. **[HIGH]** Mirror the 5 MB guard in `PasteImport.handleImport`.

## 13. Wipe — critical: doesn't stick

`useStore.wipe → saveStore(initial)`. Immediately after: `logs`, `TMs`, `stretch_targets`, `scheduled_overrides`, `skipped`, `cycle` all reset. `onboarding.done` + `firstrun.dismissed` survive (arguable OK). `program.coach.history.v1` **survives** — confirm dialog claims "clears exercises, symptoms, TMs, and stretch targets", doesn't mention chat. **[HIGH]** Handing off the device leaves prior chat (with symptom history in prompt context) readable.

**[CRITICAL] After reload, the wiped store is refilled by seed** (4 logs / 3 TMs) without user action. `seedFromRepoLogIfEmpty` can't distinguish "user just wiped" from "first visit". Fix: set `program.log.v2.wiped_at` on wipe; short-circuit seed if present. Secondary: when seed is unreachable, wipe → reload triggers Onboarding modal on top of `/data/`. Skip works — **[LOW]** suppress Onboarding on the Data route.

## 14, 15. Paste edge cases + service worker

Empty / whitespace input: button `disabled={!text.trim()}`. Invalid JSON: red error, no mutation. `sw.ts` uses network-first for `/data/*.json` with cache fallback; fresh data lands on every online visit. Bundles precached by Serwist with `skipWaiting: true, clientsClaim: true`. No known staleness bug.

## 16. Onboarding partial answer discard — high

Tapped `5` on low_back, Next, `3` on groin, Skip setup. Expected: partial answers saved as today's symptom entry. Actual: **`store.logs[today] === undefined`**. `dismiss()` only sets `program.onboarding.done=1`; `setDaySymptoms` is only reached by `finish()`, which requires completing all 3 steps. **[HIGH]** User asked, user answered, data thrown away — worse than not asking. Save what was answered.

## Round-trip fidelity

Exported `localStorage.program.log.v2`, wiped, re-imported via paste (with Onboarding-Skip inbetween). **`JSON.stringify(imported) === JSON.stringify(original)` — byte-identical.** All 6 optional fields (`stretch_targets`, `scheduled_overrides`, `skipped`, `cycle`, nested `sets[]` with `rpe`) survive. Pipeline is trustworthy **provided** the user re-imports before the reload triggers a re-seed (see §13 CRITICAL).

## Survival + clobber matrix

**Survives Wipe correctly:** onboarding.done, firstrun.dismissed, program.log.v2.corrupt.
**Survives Wipe questionably:** program.coach.history.v1 (see §13).
**Cleared by Wipe correctly:** logs, TMs, stretch_targets, scheduled_overrides, skipped, cycle.
**Gets clobbered when it shouldn't:** seed refills after wipe on reload (§13); migrated v1 data lost to seed (§6); concurrent-tab TM writes last-writer-wins (§8).

Screenshots: 30 PNGs in `iter1-persistence-shots/`, naming `sN-<subcase>.png` + `roundtrip.png`.
