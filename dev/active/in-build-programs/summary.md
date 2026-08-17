# In-build programs — Executive summary

*Written 2026-08-17. Deliverable for moving three `in_build` roadmap items from placeholder to draft-ready-for-implementation. Read this first before opening any of the artifact files.*

## Artifacts delivered

**DRAFT program JSONs** (validate against `programSchema`; not in catalog):
- `next-app/public/data/programs/DRAFT/first-strict-pullup.draft.json`
- `next-app/public/data/programs/DRAFT/muscle-up.draft.json`
- `next-app/public/data/programs/DRAFT/engine-builder-block-2.draft.json`

**Whitepapers** (evidence trails):
- `dev/whitepapers/05_first_strict_pullup.md`
- `dev/whitepapers/06_muscle_up.md`
- `dev/whitepapers/07_engine_builder_block_2.md`

**New citations patch** (additive only, needs review before `citations.json` migration):
- `dev/scripts/new-citations-for-in-build.json`

**Proposed manifest entries** (not applied to `manifest.json`):
- `dev/active/in-build-programs/proposed-manifest-entries.json`

## Per-program status

### First Strict Pull-Up

**Decided:**
- Multi-dimensional generation strategy, four tiers (Hang / Assisted / First Rep / Volume) gated by dead hang seconds and current strict pull-up count.
- Six capability domains: `pu_dead_hang_grip`, `pu_scap_control`, `pu_row_strength`, `pu_negative_control`, `pu_hollow_active_shape`, `pu_full_pullup_volume`.
- Drill library: 25 drills prefixed `pu_`.
- Weekly retest of max reps (Tier C/D) or hang seconds (Tier A/B). Full 4-week retest battery.
- Roadmap-referenced "pending Youdas 2010 authoring" is now handled — `youdas_2010` is one of the 7 new citations (verified). Roig 2009 (also new, verified) anchors the eccentric-heavy Tier B.

**Needs founder review:**
- GtG unlock at Tier C — engineering choice.
- Band-tension taper schedule — coach convention.
- 3-3-3 tempo — coach folklore.
- Two citations (`sinnett_2019`, `beattie_2014`) pending verification. If Sinnett doesn't verify, band-assist framing rests on Roig 2009 mechanism alone.

### Muscle-Up Acquisition

**Decided:**
- Multi-dimensional strategy, three tiers (Prep / Transition / First Rep). Hard prerequisite gate at intake: 3+ strict pull-ups AND 3+ strict ring dips.
- Five capability domains.
- Drill library: 24 drills prefixed `mu_` plus 8 shared drills.
- Deliberate exclusion of kipping muscle-up training (Henry 1968 specificity).

**Needs founder review:**
- The 3+3 prerequisite gate is coach consensus (Sommer 2008, Low 2016), NOT RCT — explicitly flagged.
- `vidal_rovira_2024` pending verification. Not load-bearing.
- Direct RCT for strict muscle-up progression protocol does not exist.

### Engine Builder Block 2

**Decided:**
- Correlated_tier strategy, three tiers (Foundation / Progression / Push).
- Hard intake gate on Block 1 completion — routes users without a base to Block 1.
- Two hard sessions per week: threshold cruise + Norwegian 4×4 alternating with Rønnestad 5×3 / 8×2.
- Threshold expansion 3×8 → 3×15 min across the block.
- Retest at week 4 (mid-block check) and weeks 9-10 (taper + retest).

**Needs founder review:**
- Threshold expansion cadence — coach-consensus.
- Weekly 4×4 / short-interval alternation — Rønnestad supports both formats but not weekly alternation specifically.
- **Every citation already exists in citations.json — zero new citations required.**

## Total unique new citations needed (deduplicated)

Seven new citations, of which four are shared between First Strict Pull-Up and Muscle-Up:

| ID | Verified? | Programs |
|---|---|---|
| `youdas_2010` | Verified | Pull-Up, Muscle-Up |
| `roig_2009` | Verified | Pull-Up, Muscle-Up |
| `vigouroux_2007` | Verified | Pull-Up |
| `sinnett_2019` | Pending | Pull-Up, Muscle-Up |
| `beattie_2014` | Pending | Pull-Up |
| `dickie_2017` | Pending | Pull-Up, Muscle-Up |
| `vidal_rovira_2024` | Pending | Muscle-Up |

Three verified, four pending. All four pending are non-load-bearing. Full detail in `dev/scripts/new-citations-for-in-build.json`.

## Recommended shipping order (closest to done first)

1. **Engine Builder Block 2** — strongest evidence base, zero new citations, reuses Block 1 infrastructure. Only pending review is coach-consensus schedule shape. Flip to PROVISIONAL first.
2. **First Strict Pull-Up** — load-bearing claims covered by verified citations (Youdas 2010, Roig 2009). Pending citations supportive, not load-bearing.
3. **Muscle-Up Acquisition** — thinnest evidence base. Prerequisite gate is coach consensus. Ship after Pull-Up so users have on-ramp, and after science-advisor review of the gate framing.

## Engineering choices flagged (founder can override)

**First Strict Pull-Up:** dead-hang 4-min cap; band tension taper; GtG heuristic; 3-3-3 tempo; GtG unlock at Tier C; first strict rep from week 5 Tier B.

**Muscle-Up:** 3+3 prerequisite gate; false-grip 3-min cap; seated-band → low-ring → jump-assist progression; weighted preview at Tier C; ring dip support hold as Tier A entry.

**Engine Builder Block 2:** threshold expansion 3×8 → 3×15; weekly 4×4 / short-interval alternation; Z3 optional third session for Push; 20-min TT as anchor; Foundation-tier 2-week ramp; week 4 mid-block retest; 10% weekly mileage cap.

## What was NOT done (per task instructions)

- `manifest.json` unchanged. Proposed entries in `dev/active/in-build-programs/proposed-manifest-entries.json`.
- `citations.json` unchanged. New citations in `dev/scripts/new-citations-for-in-build.json`.
- Roadmap page unchanged. Status labels stay `in_build` until founder flips.
- No runtime code touched. All three run on existing generators.

## What the founder needs to sign off on

1. Verification of the 4 pending citations.
2. The Muscle-Up prerequisite gate framing (coach consensus, not RCT).
3. The `engineering_choices_flagged` lists per program.
4. Shipping order.
5. `status: "draft"` → `"PROVISIONAL"` per program.

## Referential integrity

All three DRAFT JSONs validate against `programSchema` (Zod). All `reference_ids` point at either existing `citations.json` entries or the 7 new-citations patch entries. Exercise references follow the `pu_*` / `mu_*` / `hs_*` / `aerobic_*` prefix conventions.
