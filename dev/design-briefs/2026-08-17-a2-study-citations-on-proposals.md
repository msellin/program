# A2 — Study citations on proposals

Owner: product-design-lead
Written: 2026-08-17
Status: draft — awaiting founder review
Related audits: `dev/audits/app/2026-08-17-app-audit-landing-alignment.md` (§2 promise #2, §3.3), `dev/audits/app/2026-08-17-app-audit-copy-clarity.md`, task `dev/active/post-audit-p0s/tasks.md` A2 (deferred).
Blocked by / blocks: unblocks A1 (over-performer TM bump — needs a citation to render). Blocks the next honest bump of the landing hero back from "88" to a rounder number, and the eventual in-app `/evidence` route.

---

## The call

Ship a **canonical `citations.json` library** at `next-app/public/data/citations.json`, referenced by stable IDs from both program JSONs and proposals; render citations on proposal cards as an inline **"Source: {Author Year}"** line with a **tap-to-expand detail** (full title + journal + link) — and **snapshot the citation payload into the day-adjustment record at Accept time** so the audit trail is permanent.

**Why (three-line summary):**
- One canonical library kills the 38 duplicate refs already present across the 5 programs, and gives A1's TM-bump rule a stable ID to point at without a code change per proposal type.
- Inline `Source: Author Year` reads at thumb distance in a rehab/erratic morning; tap-expand keeps mobile density under control and gives sighted-and-SR users the same information at the same tap depth.
- Snapshotting at Accept turns the landing promise ("Every change cites a study — you approve each one") into a per-log-entry audit fact, GDPR-honest and survivable across future citation edits.

---

## The problem

The landing hero says the load-bearing sentence out loud: **"Every change cites a study — you approve each one."** The only live proposal in the shipped app (`ReadinessProposal.tsx:59`) shows two sessions above 80% TM and offers "Advance to Cycle 1" — with **zero source string in the DOM**. `DayAdjustmentProposal.tsx:92` gives a reason ("Padel yesterday, load felt heavy — lightening today") and no citation. `TierAdvanceProposal.tsx:39` renders an internal-only `rationale` truncated to one line. The audit's promise #2 fails both halves: no cite string, no visible Accept/Ignore. A2 owns the cite half.

The fast fix — string-concatenate a citation into each proposal's `reason` line — collapses under three future scenarios the founder has already signalled will happen:

1. **A1 ships an over-performer TM bump rule next.** That rule needs to cite something (ACSM position stand on progression, Rhea 2003 meta on strength dose-response, or the 5/3/1 wave literature). If we hardcode a string into `TMBumpProposal.tsx`, we've built the second one-off in a week.
2. **New program ships with 40 new refs.** `engine-builder.json` already carries 35 refs, `handstand-walk.json` 33, `concurrent-strength-maintenance.json` 32, `rowing-2k-test-prep.json` 28, `overhead-mobility.json` 19 — **147 total, 109 unique, 38 cross-program duplicates** (confirmed programmatic count against `evidence_base.references[]`). Each new program today re-inlines its own copy of Coyle 1984, Seiler 2010, Helgerud 2007, etc. The list will get worse before it gets better.
3. **The founder edits Coyle 1984's short title.** Today, they'd have to grep across 6 files and pray. Every accepted `day_adjustment` in a user's log would also silently update to the new string — quietly rewriting history, exactly the trust-break the confirm-first architecture is designed to prevent.

"Future-scenario-proof" for A2 means the design has to hold up for:

- The **rehab persona** on a symptomatic morning, tapping through the readiness banner one-handed, needing minimum cognitive load to read "why."
- The **strength persona** wanting to trust that "TM +2.5 kg" is grounded — a receipt they can screenshot, not a marketing string.
- The **erratic persona** on a 17-day layoff, seeing "soften plan" cite Coyle 1984 detraining without the phrase feeling like a lecture.
- **Screen-reader users** — the citation has to be announceable without breaking the aria-live announcement flow already installed by C6 (`AppShell.tsx` + `lib/announce.ts`).
- **GDPR data export** — every accepted proposal already writes `day_adjustments[date] = { load_multiplier, reason, source, accepted_at }` (`schemas.ts:683`). A citation snapshot has to survive an export and be intelligible without server round-trip.
- **New proposal types added by code** — future proposal file needs to point at a citation ID; no re-render, no schema break.

---

## Options considered

### Option A — Inline citation string per component (the fast hack)
- **Shape:** Add `citation?: string` to each proposal component's props. Author writes the full source string in the component or in a per-proposal constant.
- **Sketch:**
```
+---------------------------------------------------+
| Signal · Back after 17 days                       |
| Softening today's top set to 85% TM.              |
| Source: Coyle EF 1984, J Appl Physiol 57(6):1857  |
| [ Apply 15% lighter ]  [ Not today ]              |
+---------------------------------------------------+
```
- **Pros:** Ships in an afternoon. Zero data-shape work.
- **Cons:** Duplicates the 147-ref sprawl the programs already carry. Founder can't edit one citation without hunting through files. Snapshot integrity is impossible — no ID, only strings. Fails future-scenario 1 (A1 hardcode), 2 (new-program dedupe), 3 (silent history rewrite on edit).
- **Verdict:** rejected. This is the exact anti-pattern the founder said to skip.

### Option B — Canonical `citations.json` library + ID reference + inline `Source: {Author Year}` on proposals, with snapshot at Accept
- **Shape:** New file `next-app/public/data/citations.json` — the union of all program refs plus proposal-only additions, keyed by stable `id`. Program JSONs migrate to storing `evidence_base.reference_ids: string[]` alongside legacy `references[]` (kept as an override for program-only cites). Proposal shape gets `source_citation_id: string | null`. Rendering: `Source: {display_short}` on the card (visible), tap-expand reveals full author/title/journal/url. On Accept, the current citation is copied into `day_adjustments[date].citation_snapshot: {…}` so a later library edit doesn't retroactively change history.
- **Sketch:**
```
+---------------------------------------------------+
| Signal · Back after 17 days                       |
| Softening today's top set to 85% TM.              |
| Because: 17-day gap since last session.           |
| Source: Coyle 1984 ↗   [ small chevron ]          |
| [ Apply 15% lighter ]  [ Not today ]              |
+---------------------------------------------------+
      tap Source ↗ opens a small in-card panel:
+---------------------------------------------------+
| Coyle EF et al. 1984                              |
| J Appl Physiol 57(6):1857-1864                    |
| VO2max −7% at 12 days of detraining; layoffs      |
| >2 wks show measurable aerobic loss.              |
| [ Read on evidence page ↗ ]                       |
+---------------------------------------------------+
```
- **Pros:** One source of truth. Dedupe wins immediately (38 cross-program duplicates become 0). A1's TM-bump rule cites an ID, not a string. Snapshot at Accept locks the user's audit trail. Screen readers announce a clean `aria-label`. Founder edits once. Migration to reference the canonical file can be done program-by-program without breaking any that haven't migrated yet (both fields co-exist).
- **Cons:** Schema work up front. Requires a migration script for the 147 refs. Two-way lookup (program shows its refs, proposal shows one ref) needs a small loader.
- **Verdict:** winner.

### Option C — Full modal-detail per citation on tap
- **Shape:** Citation on the proposal card is a compact chip; tap opens a full-screen sheet with the abstract, quote, and inline link to `/evidence#{id}`.
- **Sketch:**
```
+---------------------------------------------------+
| Signal · Back after 17 days                       |
| Softening today's top set to 85% TM.              |
| [ Source: Coyle 1984 ↗ ]  ← chip                  |
| [ Apply 15% lighter ]  [ Not today ]              |
+---------------------------------------------------+
   tap chip → full-height iOS sheet slides up
   (a whole route change of attention)
```
- **Pros:** Room for a full excerpt, chart, PMID button.
- **Cons:** Overkill for a rehab morning check. Two interactions to read what should be scannable. Modal-shift breaks the flow of an Accept — user has to close the sheet to Accept the proposal. Fails the Julie-Zhuo "one primary action per view" test.
- **Verdict:** rejected. Kept for the future `/evidence/{id}` in-app deep link (see "does not solve"), not for the proposal card.

---

## Chosen: Option B — canonical library + ID reference + inline `Source: Author Year` + tap-expand

### Full wireframe

```
393px mobile — Today screen, DayAdjustmentProposal live
+---------------------------------------------------+
|  ⚠  NOT FEELING 100%? · NEEDS YOUR OK             |  ← eyebrow (10px amber)
|                                                   |
|  Padel yesterday, load felt heavy today.          |  ← reason (14px ink)
|  Softening today's barbell to 85%.                |
|                                                   |
|  Because: outside-training load logged            |  ← 12px muted
|  yesterday + high fatigue score this AM.          |
|                                                   |
|  Source: Halson 2014 ↗                            |  ← 12px accent, tap area 44h
|                                                   |
|  Rehab & mobility unchanged.                      |  ← 12px muted
|                                                   |
|  [ Apply 15% lighter today ]  [ Not today ]       |  ← Accept + Ignore
+---------------------------------------------------+

after tap on "Source: Halson 2014 ↗":
+---------------------------------------------------+
|  ⚠  NOT FEELING 100%? · NEEDS YOUR OK             |
|  Padel yesterday, load felt heavy today.          |
|  ...                                              |
|                                                   |
|  ▾  Source: Halson 2014                           |
|      Halson SL 2014                               |
|      Sports Med 44(S2):139-147                    |
|      Monitoring fatigue in athletes — 24-48 h     |
|      recovery windows after extra external load.  |
|      [ Read on evidence page ↗ ]  ← opt-in nav    |
|                                                   |
|  [ Apply 15% lighter today ]  [ Not today ]       |
+---------------------------------------------------+

Log-cited proposal (MissedSessionPrompt) — no study needed:
+---------------------------------------------------+
|  Yesterday was a strength day — nothing logged.   |
|  Because: you logged 0 sessions on Wed and Thu.   |  ← log-cited, no Source
|  [ Log yesterday now ]  [ Mark skipped ]          |
+---------------------------------------------------+
```

### Cross-persona coherence check

| Persona | State | Does the design hold? | Notes |
|---------|-------|-----------------------|-------|
| persona-recover | Symptomatic morning, DayAdjustmentProposal fires with amber | y | "Source: Halson 2014 ↗" fits on one line at 12px; expand is optional, not required to Accept. Rehab/mobility line still visible above the fold. |
| persona-strength | 30 green days + "felt strong" note → future TMBumpProposal fires | y | "Source: Rhea 2003 ↗" reads as validation, not lecture. Snapshotted at Accept — user can export their log later and show a reviewer why the +2.5kg happened. |
| persona-erratic | 17-day layoff, ReadinessProposal fires "Back after 17 days — soften" | y | "Source: Coyle 1984 ↗" — the exact promise the landing makes. Log-cited half of the reason ("17-day gap") stays visible; study-cited half is one tap away. |

### Modern-standard checks

- **iOS HIG:** Tap-expand stays inside the card — no sheet, no modal, no route change. The Accept CTA remains reachable without dismissing an overlay. Pass.
- **Material 3:** `Source: {short}` uses a state-layer on hover/press at 8% opacity accent — matches the existing bronze chip pattern. Pass.
- **Refactoring UI:** Accent economy — the amber/green/slate accent already carried by the proposal card is retained. `Source` uses `text-accent underline decoration-accent/40` (dim by default, solid on hover). No new colour introduced. Hierarchy through weight, not size. Pass.
- **`prefers-reduced-motion`:** Expand uses `max-height` transition; reduced-motion disables the transition and shows/hides instantly. Pass — delegate to `app-motion-perf` for the exact ease token.
- **Fitts's law:** Tap target for `Source: ↗` is padded to 44×44 (visible hit region ~120×24, invisible hit-slop to 44 via `py-3 -my-3`). Placed above the primary Accept button, in-cradle for the right-thumb reach at 393px. Pass — delegate to `app-mobile-ux` for the ergonomic verification.

---

## Data shape changes

### New file: `next-app/public/data/citations.json`

```ts
// next-app/public/data/citations.json
{
  "schema_version": "1.0",
  "citations": [
    {
      "id": "coyle_1984",                          // stable id — reused across programs + proposals
      "authors": "Coyle EF, Martin WH, Sinacore DR, Joyner MJ, Hagberg JM, Holloszy JO",
      "year": 1984,
      "title": "Time course of loss of adaptations after stopping prolonged intense endurance training",
      "source": "J Appl Physiol 57(6):1857-1864",
      "url": "https://pubmed.ncbi.nlm.nih.gov/6511559/",
      "display_short": "Coyle 1984",              // rendered on the card
      "display_line": "Detraining: VO2max −7% at 12 days, −16% at 12 weeks",
      "domain": "aerobic_physiology",             // aerobic_physiology | concurrent | motor_learning | strength_progression | fatigue_recovery
      "used_by_programs": [
        "engine-builder",
        "concurrent-strength-maintenance"
      ],
      "used_by_proposals": [
        "readiness_return_after_layoff",
        "day_adjustment_high_fatigue"
      ]
    }
  ]
}
```

### Program JSON migration (`next-app/public/data/programs/*.json`)

```ts
// evidence_base gets a new field (additive, non-destructive):
// existing: references: EvidenceRef[]  ← keep during migration
// new:      reference_ids: string[]    ← the canonical IDs

// Migration script (dev/scripts/migrate-citations.ts) does:
// 1. Read all 5 programs' references[]
// 2. Group by id, pick canonical entry (longest 'used_for' description wins)
// 3. Emit citations.json
// 4. Rewrite each program to have reference_ids: string[] AND keep references[] for now
// 5. Legacy references[] deleted in a follow-up PR after evidence page + program preview UI reads from the resolver
```

### Proposal shape addition (`next-app/src/lib/schemas.ts`)

```ts
// New Zod schema added near line 683 alongside day_adjustments:
export const proposalCitationSnapshotSchema = z.object({
  id: z.string(),
  display_short: z.string(),
  display_line: z.string().optional(),
  authors: z.string(),
  year: z.number(),
  source: z.string(),
  snapshotted_at: z.number(), // epoch ms
});

// day_adjustments extends:
day_adjustments: z.record(z.string(), z.object({
  load_multiplier: z.number().min(0.5).max(1.15),
  reason: z.string().optional(),
  source: z.enum(["notes", "manual"]).optional(),
  accepted_at: z.number().optional(),
  citation_snapshot: proposalCitationSnapshotSchema.optional(),  // ← NEW
})).optional();
```

### Proposal-type → citation-ID mapping (authored, not hardcoded)

Stored inline in each proposal component OR in `next-app/src/lib/engine/proposal-citations.ts` (one file, easily audited). Enumeration:

| Proposal type | Component | Cited kind | Citation ID | Notes |
|---|---|---|---|---|
| Reintro readiness → Cycle 1 | `ReadinessProposal.tsx` | log-cited (2 sessions above 80% TM) + study-cited | `kraemer_2002_acsm_position_stand` | ACSM Progression Models in Resistance Training for Healthy Adults — MSSE 34(2):364-380. Anchor for progressive reintroduction. **New citation — add to library.** |
| Day-load softening (padel / high-fatigue / amber) | `DayAdjustmentProposal.tsx` | study-cited | `halson_2014` | Halson SL 2014, Monitoring training load — Sports Med 44(S2):139-147. **New citation — add to library.** |
| Return-after-layoff softening | `DayAdjustmentProposal.tsx` (variant) | study-cited | `coyle_1984` | already in `engine-builder.json` |
| Tier advance (skill programs) | `TierAdvanceProposal.tsx` | study-cited | `wulf_lewthwaite_2016` | OPTIMAL theory — autonomy + enhanced expectancies. Already in `handstand-walk.json` + `overhead-mobility.json`. |
| Cycle-end TM bump (5/3/1 wave) | future `TMBumpProposal.tsx` (A1 ships) | study-cited | `rhea_2003_meta` | Rhea MR 2003, A meta-analysis to determine the dose response for strength development — MSSE 35(3):456-464. **New citation — add to library.** Also `kraemer_ratamess_2004`. |
| Missed session prompt | `MissedSessionPrompt.tsx` | **log-cited only** — no source | null | "Because: yesterday's strength day had no log." Log fact is the citation. |
| Manual TM adjustment | future `manual_tm_edit` | **log-cited only** | null | User-initiated; not engine-proposed. |

Rule: **study-cited if the proposal encodes a mechanism the app is asserting about the human body. Log-cited if it's purely stating what the log shows.** Log-cited proposals still render a `Because: {reason}` line (fulfills the "shows its reasoning" softened landing copy) but omit the `Source:` row.

### Deep-link target

Tap on `Source: {short} ↗` **expands in place** (no route change). The expanded panel carries a secondary link `[ Read on evidence page ↗ ]` that navigates to `/evidence#{id}` on the landing (via `landing.terav.app/evidence#coyle_1984`). Requires the landing evidence page to add anchor IDs — one-line change to `landing/src/app/evidence/page.tsx:31` per row (`id={cite.slug}` on the row wrapper). External link uses `target="_blank" rel="noopener"` — flagged with `↗` glyph; no consent gate needed for the landing (same-origin PWA→landing), but the raw journal URL gets a small "opens PubMed" affordance to preserve consent-first defaults.

---

## Component tree

Current:
```
ReadinessProposal
  └─ <section>
       ├─ eyebrow
       ├─ reason (14px)
       ├─ evidence list (dates × exercises)
       ├─ meta line (12px)
       └─ actions (Advance / Not yet)
```

Proposed:
```
ReadinessProposal / DayAdjustmentProposal / TierAdvanceProposal / TMBumpProposal
  └─ <section>
       ├─ eyebrow
       ├─ reason (14px)
       ├─ because line (12px muted)         ← always present
       ├─ <CitationRef id={…} />            ← NEW; renders "Source: {short} ↗" + expand
       │    ├─ short label (12px accent)
       │    └─ expanded detail panel (12px), lazy on tap
       ├─ rehab-unchanged disclaimer (12px muted, existing)
       └─ actions (Accept / Ignore)         ← Accept calls acceptWithCitation()
```

### File-level changes (implementation notes)

- `next-app/public/data/citations.json` — **NEW**. Author the union of the 109 unique refs currently spread across 5 programs, plus 3 new refs (Halson 2014, Rhea 2003, Kraemer 2002 ACSM position stand). Total ~112 canonical entries.
- `next-app/src/lib/schemas.ts:683-693` — extend `day_adjustments` value with optional `citation_snapshot`.
- `next-app/src/lib/schemas.ts:335-364` — add optional `reference_ids: z.array(z.string())` on `evidenceBaseSchema` alongside existing `references`.
- `next-app/src/lib/engine/citations.ts` — **NEW**. `loadCitations(): Promise<CitationLibrary>`, `getCitationById(id: string): Citation | null`, `snapshotCitation(id: string): CitationSnapshot`. Static import from `/data/citations.json`, cached in-memory after first load.
- `next-app/src/lib/engine/proposal-citations.ts` — **NEW**. The proposal-kind → citation-id table shown above. Consumed by each proposal component.
- `next-app/src/components/citations/CitationRef.tsx` — **NEW**. `<CitationRef id={string} />` — renders the inline "Source: short ↗" line + expanded panel. Includes `aria-expanded` + `aria-controls` semantics. Registers keyboard focus on expand.
- `next-app/src/components/workout/ReadinessProposal.tsx:65-71` — remove the ad-hoc evidence `<ul>` block (or fold it under the citation panel as "Log evidence" — keeps the transparency the founder liked). Replace with `<CitationRef id="kraemer_2002_acsm_position_stand" />`.
- `next-app/src/components/workout/DayAdjustmentProposal.tsx:92-93` — inject `<CitationRef id={proposalCitationId(signals)} />` between reason and rehab disclaimer. `proposalCitationId(signals)` returns null when the reason is purely log-derived — in which case the component simply renders the existing `signals.matches` chip strip (which IS the log citation).
- `next-app/src/components/workout/TierAdvanceProposal.tsx:39-43` — replace truncated `rationale` line with `<CitationRef id={tierAdvanceCitationId(program)} />` and move the raw rationale into the expand panel.
- `next-app/src/components/workout/MissedSessionPrompt.tsx:88-91` — no citation ref. Add explicit `Because: yesterday's scheduled strength session had no log.` under the "Log yesterday" prompt so the log-cited kind is coherent with the study-cited kind.
- `next-app/src/lib/useStore.ts` — `acceptDayAdjustment` grows a new arg `citationId: string | null`. When non-null, calls `snapshotCitation(id)` and writes to `citation_snapshot`. Same treatment on `promoteTier` and `advancePhase`.
- `landing/src/app/evidence/page.tsx:31` (and per-row) — add `id={slug}` to each citation `<li>` or wrapper so `/evidence#coyle_1984` deep-links land in-view. → follow-up.
- `dev/scripts/migrate-citations.ts` — **NEW**. Reads all 5 program JSONs, deduplicates references[] by id, emits `citations.json`, and rewrites each program to include `reference_ids: string[]` while preserving `references[]` for one release cycle. Prints a diff report. Idempotent.

### Delegate-to-specialist

- **Microcopy:** → `app-copy-clarity` — write the `display_short` and `display_line` strings for the new citations (Halson 2014, Rhea 2003, Kraemer 2002 ACSM position stand). Write the `Because:` prefix vs. `Source:` prefix disambiguation. Write the ↗ glyph rules (external-link vs. same-page expand). Write the tone rule: `display_line` is 60-80 chars, one clause, no lecture.
- **A11y:** → `app-accessibility` — verify `<CitationRef>` semantics (`aria-expanded`, `aria-controls`, focus-order on expand, SR announcement pattern). Verify tap-target ≥ 44×44 via hit-slop. Verify contrast on the citation-accent colour (delegate to visual-craft for the token). Verify the aria-live announcement on Accept remains coherent when a citation is snapshotted ("Load adjustment applied: 15% lighter today. Cited Halson 2014.").
- **Type / colour:** → `app-visual-craft` — pick the citation-line colour token. Options: existing `text-muted` (invisible, fails hierarchy), `text-accent` (bronze — steals focus from the CTA), a new `text-citation` at 55-65% ground contrast (recommended, matches Linear's dim-link pattern). Type: 12px only; do not scale up.

---

## Migration

Destructive-in-name-only: legacy `references[]` stays for one release cycle so the intake preview + program guide don't break during the transition.

- **Step 1:** Author `dev/scripts/migrate-citations.ts`. Run against a temp branch. Verify: 5 programs → 1 `citations.json` + 5 rewritten JSONs with `reference_ids: string[]`. Confirm 109 unique + 3 new = 112 canonical entries.
- **Step 2:** Add 3 new proposal-only citations (Halson 2014, Rhea 2003, Kraemer 2002) directly in `citations.json` — they don't appear in any program yet. Flag with `used_by_programs: []`.
- **Step 3:** Add `<CitationRef>` component + `lib/engine/citations.ts` loader. Land in a PR by itself with a Storybook fixture for the three visual states (collapsed, expanded, external-link).
- **Step 4:** Wire `<CitationRef>` into each of the 4 existing proposal components. Add `citation_snapshot` to the store schema + Accept handlers.
- **Step 5:** Wire the landing evidence page anchors (`id={slug}` per row).
- **Step 6:** Add a Playwright assertion in the persona harness: `persona-strength/text/01-today.txt` must contain `Source:` when a proposal is present. This is the audit's verify step and it becomes a permanent regression guard.
- **Step 7 (follow-up PR):** Delete legacy `references[]` from the 5 programs. Update the intake preview + program guide UI to read from the resolver.

**Rollback plan:** every step is additive until Step 7. If step 4 breaks proposal rendering, `<CitationRef>` falls through to `null` when `id` doesn't resolve — proposal card renders exactly as it does today. If the migration script produces a bad `citations.json`, revert the file and the programs re-read from their local `references[]` (still present). Zero data-loss risk on the client because `citation_snapshot` is additive on `day_adjustments`.

---

## Peer benchmarks

- **Linear (issue references)** — Linear renders `#IDL-1234` as a subdued inline chip; hover shows a preview card without changing route. **Steal:** the "in-line, tap-expand, no route change" pattern. **Reject:** Linear's chip has no citation semantics; our `Source:` needs a clear "external evidence" affordance (the ↗ glyph).
- **Anthropic console (model card + citations)** — the console's model documentation surfaces "source: {paper}" under generation settings, in a muted inline style with a small external-link icon. **Steal:** muted-by-default treatment; primary action stays visually dominant. **Reject:** their citations open in a new tab immediately — for a rehab-morning proposal we want expand-in-place first, tab-out second.
- **Whoop (recovery advice)** — Whoop cites its research with a "Learn more" link that opens a full modal. **Steal:** the fact that they cite at all raises the reader's trust — and Whoop's audience is much less technical than Terav's. **Reject:** the full-modal flow is overkill for our card-native surface, and Whoop's citations tend to be their own studies (a positioning we don't want — Terav's whole promise is *primary* sources, not house research).
- **Strava (heat-load advice)** — no citations. Cautionary tale: their "you're at high load" nudges have no source at all, and readers rightly discount them. Our A2 fix is exactly what Strava is missing.

---

## What this decision does NOT solve

- **In-app `/evidence` route.** Landing has one at `/evidence`; the app has none. Rendering the full library inside the app is a separate design brief. For now, `[ Read on evidence page ↗ ]` deep-links out.
- **Cite-density on the program preview.** Program cards today don't surface citations at all (audit §2 promise #17, half-pass). Wiring `reference_ids` into the program-preview UI is a follow-up brief — the data will be ready after A2's migration.
- **Cite-density on the intake wizard.** The 18-question engine-builder intake references studies in prose; formalising those into `citation_id` references is out of scope for A2.
- **Multi-language display strings.** `display_short` and `display_line` are English only. i18n of citation metadata is deferred until landing dictionaries wire up per-locale program content — not before.
- **Citation editing UI.** Founder edits `citations.json` in the repo; no admin UI. Snapshotting at Accept means a mid-flight edit can't corrupt existing logs, so this is defensible for months.
- **The A1 over-performer rule itself.** A2 gives A1 a citation to point at. A1 still needs its trigger + component (see `tasks.md` A1). This brief only makes A1 shippable in one pass instead of two.
- **What happens when a citation is later retracted.** Not a scenario for beta scope. Log the concern; revisit if it ever matters.

---

## Estimated implementation cost

**10-14h, high confidence.** Breakdown:

- Migration script + `citations.json` authorship (dedupe existing 147 → 109; author 3 new): **3-4h**
- `<CitationRef>` component + loader + snapshot util: **2-3h**
- Wire into 4 proposal components + Accept handler updates: **2-3h**
- Landing evidence page anchor IDs + external-link affordance: **1h**
- Persona harness assertion (Playwright grep for `Source:` in the strength persona's `01-today.txt`): **1h**
- QA across 3 personas + reduced-motion + SR pass: **1-2h**

A1's TM-bump rule then costs ~2-4h *less* because the citation surface is already there — `TMBumpProposal.tsx` just adds `<CitationRef id="rhea_2003_meta" />` at the right slot.
