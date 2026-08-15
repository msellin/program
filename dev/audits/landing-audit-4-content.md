# Landing Audit 4 — Content, IA, Length

**Founder question:** is the Terav landing too short or too long?
**Short answer:** it is **the wrong shape, not the wrong length**. Total body text is modest (~440 words) but the scroll is long because eight sections each get their own full-height slab. Cut two sections, fold one, move one to a sub-page, and the page reads as tight — not sparse. The bones are good; the composition is over-serialised.

---

## 1. Length verdict

**Scroll length on a 375×812 phone:** roughly **9–10 viewport heights** end-to-end (Hero ~1.4vh, ThreeWayContrast ~1.2vh, HowItWorks ~3.5vh — three stacked mockups each ~1.1vh, Programs ~2.3vh — five stacked cards, EvidenceClaim ~0.5vh, WontDo ~0.4vh collapsed, OriginStory ~1.4vh, BetaCTA ~1.4vh, Footer ~1vh). The screenshots confirm this: shot 3 is mid-HowItWorks step 1; shot 6/7 span step 2; shot 8 is mid-Programs; shots 9 shows Evidence → WontDo → OriginStory stacked; shot 10 is the CTA + footer at the very bottom.

**Body copy word count** (excluding UI chrome and legal): ~440 words. Hero ~40, Contrast ~40, HowItWorks ~55, Programs ~65, EvidenceClaim ~15, WontDo ~55, OriginStory ~85, BetaCTA ~30, Footer ~30.

**Verdict:** the page is not verbally long. It is **structurally long**. A modern reference — Cursor's landing is ~3 viewport heights on mobile with more claims than this; Ultrahuman clocks ~6vh but every one is a dense card or interactive; Linear's product page is ~5vh and every section carries a visual demo. Terav ships three mockups back-to-back in HowItWorks, which alone burns 3.5vh for what is essentially "we adapt the plan." That's the fat.

Target: **6–7 viewport heights, ~380 words body copy.**

---

## 2. Section-by-section

**Hero** (`Hero.tsx`, ~40 words). *Keep as-is.* Front-loaded correctly ("Sharpen your edge" → adaptive/cited/approved → CTA + stats + mockup). The three stats work. The "Browse a program first — no signup needed →" is the smartest link on the page and belongs where it is. One-line critique: `sub` uses "reads your log every session" which foreshadows the redundancy problem — the same claim reappears three more times below.

**ThreeWayContrast** (`ThreeWayContrast.tsx`, ~40 words). *Trim; keep.* The table is only 2 rows on a 4-column grid and screenshot 4 shows it overflowing horizontally on mobile (visible scrollbar under the second row). Two rows is thin — either add a third differentiating row (e.g. "What you log" → "Nothing / a check-in / a note the engine parses") or convert to three stacked comparison cards on mobile. One-line critique: title is punchy but "Where Terav sits" eyebrow buries the contrast; use it as the H2 replacement.

**HowItWorks** (`HowItWorks.tsx`, ~55 words + 3 full mockups). *Cut hard — this is the single biggest length offender.* Three full-height alternating mockups is a Framer template pattern from 2022. On mobile it burns 3.5vh for content that reads: intake → session → progress. Two of these mockups (Today, Progress) also duplicate the Hero mockup and each other visually. **Recommendation: kill this section as three stacked slabs, convert to a horizontal-swipe / three-tab pattern, or fold into a single "Session, cited, sharpened" strip with one mockup and three inline captions.** One-line critique: `evidence_link` at the bottom is buried under 3.5vh of scroll — nobody reaches it.

**Programs** (`Programs.tsx`, ~65 words). *Keep; make horizontal on mobile.* Five stacked cards is 2.3vh. Screenshots 7 + 8 show the vertical stack goes on and on. This is the single best carousel candidate on the page — five programs, uniform card shape, meant to be scanned not read. `roadmap_link` at the bottom is well-placed. One-line critique: card taglines are good ("For lifters who can't yet run 5k", "Add cardio without losing the squat") but "Multi-tier" as duration on Handstand Walk reads as a bug next to "8 weeks".

**EvidenceClaim** (`EvidenceClaim.tsx`, ~15 words). *Keep. Rare best-in-class section on this page.* One-tap card, one sentence, one action. This is the pattern the rest of the page should copy.

**WontDo** (`WontDo.tsx`, ~55 words). *Keep — collapsed by default is correct.* Anti-claims ("not a clinician," "not certain," "not a streak game") are strong differentiation vs Whoop/Peloton's aspirational fog. Only critique: on mobile it appears immediately after the EvidenceClaim card and looks like a related collapsed accordion. Add breathing room or a mono-caps eyebrow to make it feel like its own section.

**OriginStory** (`OriginStory.tsx`, ~85 words). *Trim by half and merge into BetaCTA or ThreeWayContrast.* This is the second-biggest length offender. The blade quote is the brand's poetic anchor but 85 words at position 7 of 8 is too late — the reader who cares has already scrolled past, and the reader who doesn't isn't going to read a paragraph about a multi-year training log 6vh in. The technical rigor claim ("built against a multi-year training log for one lifter") is buried where nobody sees it — this belongs in Hero sub-copy or a `/story` sub-page. One-line critique: the quote is good, the body is a founder essay draft.

**BetaCTA** (`BetaCTA.tsx`, ~30 words). *Keep — but the copy repeats Hero.* "Sharpen the plan. Every session." + "Cited every session" is the fourth restatement of the same claim. Change the body to something the reader hasn't seen: pricing signal ("Free during beta. No card."), a scarcity anchor ("First 100 seats in Tartu"), or a founder-note handoff to the "Talk to the founder" button.

---

## 3. The cut list

| # | What | Where | Rationale | Action |
|---|------|-------|-----------|--------|
| 1 | Three full-height alternating mockup slabs | `HowItWorks.tsx` L18-40 | 3.5vh burned; two of three mockups duplicate Hero and each other; classic "we adapt" repeat | **Collapse to one row** with three thumbnails or a swipe carousel, OR keep one mockup and inline the three step captions beside it |
| 2 | 85-word founder body paragraph | `OriginStory.tsx` L12-14 (dict `en.ts` L80-81) | Position 7 of 8; nobody reads a founder essay this deep; buries the rigor claim | **Move to a `/story` sub-page.** Keep only the blade quote on the landing, folded into `BetaCTA` above the H2 as a bronze pull-quote |
| 3 | 4th restatement of "adaptive · cited · every session" | `BetaCTA.tsx` L16-18 + dict `en.ts` L83-86 | Same claim as Hero sub, HowItWorks eyebrow, EvidenceClaim title | **Rewrite body** to "Free during beta. Built in Tartu, opens elsewhere Q2." (pricing + geography, both new info) |
| 4 | "See how it works" secondary CTA in Hero | `Hero.tsx` L76-81 | Anchors to `#how-it-works` which we're recommending to collapse; also weakens the primary Get started | **Delete.** Replace with the currently-buried `browse_link` promoted to secondary button ("Browse a program →") |
| 5 | ThreeWayContrast as a 4-column horizontal-scroll table | `ThreeWayContrast.tsx` L14-41 | 640px min-width forces horizontal scrollbar on mobile (visible in shot 4) | **Rebuild as three stacked cards** on mobile, or three swipeable cards with the "Terav" card visually elevated |
| 6 | 100+ citations pattern in EvidenceClaim | dict `en.ts` L62 | The `/evidence` page already exists with the real evidence — no cut needed here, but the number-drop on the landing card should not lie | **Keep as is** — this is a good handoff. But make sure `/evidence` page loads fast; it's the deepest promise on the landing |
| 7 | Redundant "adaptive" language across dict | `en.ts` L9, L36, L62 | "reads your log every session" / "sharpened every session" / "Every session cites" — same claim in three consecutive sections | **Vary the promise per section:** Hero = adaptive; HowItWorks = mechanism; EvidenceClaim = citation |
| 8 | "Talk to the founder" mailto | `BetaCTA.tsx` L28-33 | Good for a beta but 0-conversion for a distracted mobile visitor | **Keep, but as a text link** below the primary button, not a second full button that steals visual weight |

---

## 4. The add list

What's missing that a 2026 landing needs:

1. **Pricing signal.** Nowhere on the page does it say what Terav costs. "Beta" in the badge implies free but doesn't commit. Add one line: "Free during beta. £X after." Even "Free during beta, pricing TBD" is better than silence. Fold into BetaCTA.
2. **A single social-proof line.** Not fake testimonials — one honest sentence: "Currently in use by N athletes at CrossFit Tartu." If N=1 (Margus), phrase differently: "Built by athletes, on athletes, at a CrossFit box in Tartu." Wait — that's already in BetaCTA. Say the actual count when you have one.
3. **"Your first week" preview** — a 3-panel strip showing Mon/Wed/Fri of Engine Builder Week 1. Whoop, Runna and Ultrahuman all have this. It answers the "what does the actual product look like" question that three abstract mockups don't answer. Would replace the current HowItWorks entirely.
4. **A trust row.** Not logos — a single line with 3 pill-shaped stats: "5 programs · 100+ citations · 0 dark patterns" (or similar). Compresses what the Hero stats do into a horizontal band that shows up between Programs and EvidenceClaim.
5. **A worked example of one citation** — pick the strongest study (Helgerud 2007 Norwegian 4×4) and show one line: "The 4×4 protocol in Engine Builder Week 3? Helgerud MSSE 2007 — the stroke-volume intervention." One concrete cite is more convincing than "100+ studies."
6. **Language switcher / Estonian mention.** Terav is Estonian for "sharp" — the OriginStory doesn't mention this on the landing, only the footer does. This is the brand's single most differentiating naming asset. Say it in Hero sub or as a Hero eyebrow.
7. **A tiny FAQ / "Common questions" collapsible strip** — 3–4 items: "Does it replace my coach?" "How is this not Whoop?" "What's the intake?" "When does it launch outside Tartu?" This absorbs traffic from the "What Terav is not" section.

---

## 5. Recommended new IA

```
1. Hero
   — H1 + sub + primary CTA + browse-a-program secondary + stats + mockup
2. ThreeWayContrast (title becomes "Templates. Trainers. Then us.")
   — 3 stacked cards on mobile, not a table
3. YourFirstWeek (NEW — replaces current HowItWorks)
   — one visual: Mon/Wed/Fri of Engine Builder Week 1
   — three step captions to the side
   — link "See how a session gets cited →" to /evidence
4. Programs
   — horizontal swipe carousel on mobile, grid on desktop
5. EvidenceClaim
   — single-card handoff to /evidence (unchanged; this section is already right)
6. WontDo + FAQ (merged accordion strip)
   — "What Terav is not" + 3 common questions in one collapsible block
7. BetaCTA
   — H2 + pricing/scarcity line (NOT the fourth restatement of adaptive-cited-every-session)
   — Get started + Talk to the founder text link
   — blade quote as pull-quote above H2 (the only OriginStory content that lands)
Footer (unchanged)
```

Net: **8 sections → 7**. HowItWorks and OriginStory removed. YourFirstWeek and FAQ added. WontDo folded with FAQ. BetaCTA copy rewritten.

Scroll: roughly **6–7 vh on mobile**.

---

## 6. Word count budget

Target for the new landing:

| Section | Current words | Target | Change |
|---|---|---|---|
| Hero | 40 | 45 | +5 (add Estonian etymology) |
| ThreeWayContrast | 40 | 50 | +10 (add 3rd row) |
| YourFirstWeek (was HowItWorks) | 55 | 40 | -15 |
| Programs | 65 | 55 | -10 (trim to one 6-word tagline each) |
| EvidenceClaim | 15 | 15 | 0 |
| WontDo + FAQ | 55 | 90 | +35 (add 3 FAQ items) |
| BetaCTA | 30 | 40 | +10 (pricing + scarcity) |
| OriginStory | 85 | 0 | -85 (moved to /story) |
| **Total** | **385** | **335** | **-50** |

50 fewer words distributed across one fewer section = tighter, not thinner.

---

## 7. The "I've seen enough" audit

**Where a modern distracted mobile visitor stops reading today:**

- **Best case (converts):** hits the primary Get started button in the Hero. ~15% of visitors.
- **Median case (bounces):** scrolls past the Hero, sees the ThreeWayContrast table cut off on the right, doesn't understand it's a table, thumb-flicks past HowItWorks step 1 (which looks like the Hero mockup again), gets to Programs, sees five cards, scrolls faster, hits EvidenceClaim, doesn't tap, hits WontDo collapsed, hits OriginStory quote, either reads it or leaves. **The bounce sentence is the ThreeWayContrast table's horizontal scroll** — it signals broken responsive design and reduces trust in the product 3 seconds in.
- **Second bounce point:** the identical Today mockup appearing three times (Hero + HowItWorks step 2 + implicit in step 3). The reader thinks "I already saw this."
- **Third bounce point:** OriginStory — 85 words at position 7 is where the "I get it, I'm done" thought fires. If the primary CTA weren't below it, most readers would leave here without reaching it.

**How to close it:**

1. **Fix the contrast table** on mobile (immediate: reduces the 3-second bounce).
2. **Kill the duplicate Today mockup** in HowItWorks — one Today visual for the whole page.
3. **Move the CTA up** — a sticky bottom-bar CTA that fades in after the Hero scrolls out. Cursor, Linear, and Runna all do this. Removes the "I never reached the button" bounce.
4. **Cut OriginStory** to just the blade quote — 30 words instead of 85 means the reader who reaches it actually reads it.

---

## Reference-landing name-checks

- **Cursor** — the discipline model. One claim, one demo, no origin story on the landing. Terav should copy the confidence.
- **Ultrahuman** — dark theme, similar target audience, uses horizontal carousels for its product modules exactly where Terav currently stacks vertically. The Programs section should look like Ultrahuman's "Metabolic Health / Sleep / Circadian" carousel.
- **Runna** — the closest competitor. Recently redesigned toward a "your first week of training" hero mockup that shows an actual schedule. Terav's Hero mockup shows a session; Runna's shows a week. Consider whether the Hero mockup should be the week view for stronger "here's what you get" signalling.
- **Linear** — the section-density model. Every section carries a live product demo, not a static mockup. Terav's static mockups are cheaper but read as marketing; Linear's live-looking demos read as product.
- **Whoop** — a warning, not a model. Aspirational fog with heavy footer, no honest limits. WontDo is Terav's answer to Whoop and should stay prominent, not collapse into a `<details>`.

---

## TL;DR for the founder

- **Not too short.** The claims are all present.
- **Yes, too long** — but only because HowItWorks and OriginStory each occupy real estate they haven't earned. Cut those two and the landing feels tight.
- **The single highest-ROI change** is replacing HowItWorks (3 stacked mockups) with one "Your first week" strip. That alone saves 2.5vh and answers the "what does the product actually do" question better than three abstract steps.
- **Second highest-ROI:** rewrite BetaCTA body to include pricing + scarcity. Nobody knows what this costs.
- **Fix the ThreeWayContrast table** — its mobile overflow is the actual 3-second bounce point.
