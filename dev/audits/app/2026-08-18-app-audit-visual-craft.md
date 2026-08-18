# Terav app — Visual craft audit (Progress rebuild + Aug 18 ship)

Personas: persona-recover, persona-strength, persona-erratic
Palette source: `/Users/margussellin/www/program/next-app/src/app/globals.css`
Focus surfaces: Progress (rebuilt), WeeklyNarrativeTile, HeritageClusterChip, MilestoneLiftGroup, ProposalCard (new tones), IntakeClient (radiogroup rows), programs catalog

---

## Prior-audit carry-forward (2026-08-17 → 2026-08-18)

Verified against current code. Landed / still-open state:

| P0 / P1 finding | State today |
|---|---|
| P0-1 Cull type scale to ~7 sizes | **Still open.** `text-[13px]` = 176 hits, `text-[12px]` = 98, `text-[11px]` = 85, `text-[10px]` = 69, `text-[14px]` = 27, `text-[15px]` = 20, `text-[9px]` = 2. **The half-pixel sizes are gone** (0 hits for `text-[10.5px]/[11.5px]/[12.5px]/[13.5px]/[14.5px]`). Real progress: the fractional-px anti-pattern has been closed. Scale is still 7 arbitrary sizes + Tailwind tokens; the previous "22 sizes in play" number is down to ~9. Ship P0 pass mark. |
| P0-2 Promote body from 13 → 14 | **Not done.** `text-[13px]` remains the dominant body token (176 hits). The rebuild introduced more 13px, not less: `SummaryLine` value + label in `WeeklyNarrativeTile.tsx:213-214`, `ProposalCard.tsx:153` (`Because:` reason). |
| P0-3 Fix section-H2 mono-caps shout | **Partially done.** Progress (`progress/page.tsx:230, 242, 274`) and the new components all use the correct `text-[15px] font-semibold text-strong` — 20+ hits system-wide. But History still has 4 mono-caps H2 (`history/page.tsx:102, 123, 149, 208`) and `HipProgressTile.tsx:43` still shouts `font-mono text-[13px] uppercase tracking-widest`. Inconsistency risk: Progress and History now diverge visually. |
| P0-4 ReadinessProposal green Accept | **Resolved by deletion.** `ReadinessProposal.tsx` no longer exists; the flow is folded into `ProposalCard.onAccept` with kind `readiness_after_layoff`, which uses the shared `bg-bronze` primary button (`ProposalCard.tsx:233`). Correct fix. |
| P0-5 BottomNav labels 9 → 10.5 | **Partially done.** `BottomNav.tsx:57` — labels bumped to `text-[10px]`, not the recommended 10.5. 9px is gone from nav labels. Ship. |

**Verdict:** the type ramp got cleaner (half-pixels culled) but the 13px body baseline is now more entrenched, not less. Discipline on the mono-caps H2 fractured — Progress and Programs adopted the 15px normal-case standard while History kept the shout. Pick a lane.

---

## 1. Progress rebuild — accent economy after the density fix

The 10-sections-to-5-blocks compression is the right move for scannability. Bronze / green / amber / slate / red now co-exist inside a single 393px viewport on Progress.

**Two concerns:**

1. **Slate is doing too many jobs.** Slate = "secondary destination" pre-rebuild. Post-rebuild, slate now also means: retest-due proposal accent, waypoint milestone marker, EngineBanner action button, HipProgressTile due-link, "verified" status legend on programs (`programs/page.tsx:92`), SignalCompleteness eyebrows. That's four distinct semantics under one color: destination, marker, action, category chip. **Recommend:** demote slate on SignalCompletenessCard eyebrows to `text-muted`.

2. **Amber overload on Progress.** Progress may render: welcome-back amber banner, HeritageClusterChip amber (Cluster B), MilestoneRow amber "soon" pill, and — if a `non_responder_recommendation` under-dosing proposal fires — a fourth amber card. Four amber accents in one scroll reads as "everything is a warning." The MilestoneRow soon-pill uses full `bg-amber text-surface` (`progress/page.tsx:470`) which is the loudest amber treatment. **Demote soon-pill to `bg-amber/20 text-amber`** so the only full-fill semantic pill is `beaten`.

Rogue-color grep: zero `bg-[#hex]` / `text-[#hex]`. Token discipline holds.

---

## 2. WeeklyNarrativeTile expandable slot — card-within-card?

Layout at `WeeklyNarrativeTile.tsx:56, 175-192`. Correctly done as a disclosure, not a card-within-card. No second border, no second surface color, no `p-4` padding stack.

**One micro-nit:** the expanded content uses `pt-2` after the toggle button. The disclosure content itself starts with `space-y-4`. Compare to the tile's outer rhythm which is 12px `space-y-3`. **Change `pt-2` → `pt-3`** at `WeeklyNarrativeTile.tsx:190`.

---

## 3. HERITAGE cluster chip — three-state legibility on tile header

`HeritageClusterChip.tsx:48-56` renders `inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest`.

**One issue:** Cluster C is the strongest signal but visually lands at the same intensity as Cluster A. `bg-red/15` needs to be `bg-red/20` or `/25` so red visually leads amber under equal-luminance /15 alpha.

**Recommend:** truncate the chip label to just "Cluster A / B / C" (or shorter — see copy audit) and move the descriptor into the `title` attribute.

---

## 4. Milestone 2-line header — `font-medium text-sm` + `text-[11px] text-muted`

Type ratio: 14px semibold vs. 11px muted. **Hierarchy reads.** But 11px muted is at the app's caption floor and this is the PRIMARY comparator.

**Recommend:** promote line 2 to `text-[12px] text-ink`. And `mt-0.5` → `mt-1` so the two lines read as structured hierarchy, not wrapped text.

---

## 5. Radiogroup option rows — physical-test intake vs. checkbox lists

Three variants for the same interaction pattern:

| Pattern | min-h | Row spacing | Indicator | Label |
|---|---|---|---|---|
| Physical-test row | 56 | 6 | native 16px radio | 14 + 12 muted description |
| Question row (radiogroup) | 52 | 6 | custom 16px bronze circle-check | 14 sm-semibold + 11 mono hint |
| Consent (checkbox) | (native ~24) | 12 | native 20px checkbox | 14 strong |

Two problems:

1. **Consent checkboxes are the smallest tap targets in the wizard.** No `min-h` set. Add `min-h-[52px]` to the consent `<label>`.
2. **Two indicator styles.** Physical-test uses native OS radios; question rows have the app's custom bronze-fill circle-check.

**Recommend:** unify on the custom bronze circle-check indicator for physical-test rows too.

---

## 6. Programs catalog — 9 programs (1 personal + 8 public), 4 categories

**Two concerns:**

1. **Left-border color chaos.** Category tokens: rehab = slate, strength = bronze, skill = slate, gymnastics = slate, endurance = green, hyrox = amber, mobility = slate, other = line. **Slate now codes 4 of 7 category classifications.**
2. **Status chip legend at 11px muted.** The legend defines the primary trust affordance on the catalog. 11px muted is invisible on iPhone SE unless the user leans in. **Promote to `text-[12px] text-ink`.**

---

## 7. Two new ProposalCard tones — red for Cluster C, amber for Cluster B

**Total ProposalCard tone budget:** amber, green, slate, red. Four tones. Same as the app's semantic-color set minus the neutral. **This is the ceiling — do not add a fifth tone.** The next proposal kind should reuse an existing tone based on directional/safety semantics.

---

## Priorities

**P0 (this week)**
1. Progress amber pill overload — demote `bg-amber text-surface` "soon" pill on `progress/page.tsx:470` to `bg-amber/20 text-amber`.
2. HERITAGE Cluster C weight — `HeritageClusterChip.tsx:66` bump to `bg-red/25`.
3. Milestone comparator legibility — `progress/page.tsx:409` promote to `text-[12px] text-ink`; `mt-0.5` → `mt-1`.
4. Body 13 → 14 push — the prior P0 didn't land. Do one targeted pass on `.text-ink` body strings only.

**P1 (this month)**
1. Radiogroup indicator unify — kill native radios on physical-test rows; render the custom bronze-fill circle-check for parity with question rows.
2. Consent tap target — add `min-h-[52px] p-2` to consent label.
3. History H2 mono-caps shouts — align to Progress-style `text-[15px] font-semibold text-strong`.
4. Programs catalog category-color collapse — slate now codes 4 of 7 categories.
5. Catalog trust-legend legibility — 11px muted → 12px ink.
6. WeeklyNarrativeTile disclosure rhythm — `pt-2` → `pt-3`.

**P2 (nice to have)**
1. Under-dosing ProposalCard eyebrow ArrowUp — extend to include `non_responder_recommendation` with `verdict !== "true_non_response"`.
2. Cluster chip label truncate to `Cluster A/B/C` only — move descriptor to `title`.
3. SignalCompletenessCard eyebrow `text-slate` → `text-muted` on the two eyebrows inside the disclosure.

**Applied 2026-08-18 (P0 P1-6):** amber pill demoted, Cluster C to /25, milestone comparator to 12px ink + mt-1, HERITAGE chip made tappable with InfoSheet, WeeklyNarrativeTile pt-2 → pt-3.

**Deferred:** body 13→14 push (systematic), radiogroup indicator unification, consent tap targets, History H2 alignment, catalog category-color collapse, catalog trust legend.
