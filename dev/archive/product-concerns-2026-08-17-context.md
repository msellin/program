# Product concerns — research context (2026-08-17)

Three concerns the founder wants researched before rushing to build. Each agent takes ONE concern, produces a competitive-analysis brief, no code.

## About Terav (for research agents)

Focused-improvement training app. Positioning: *"Pick one thing you want stronger. Sharpen it every session."* Live at https://terav.fit + https://app.terav.fit. Beta. ~5 shipping programs across strength (5/3/1), aerobic (Zone-2), concurrent (strength-hold + aerobic), skill (handstand walk), mobility (overhead). Confirm-first mechanic: engine proposes, user Accepts. Every proposal cites a study OR says "Because: {log signal}". Not a full training plan. Users run this alongside their existing training (CrossFit / Hyrox / gymnastics / rehab).

Not-competing-with: HWPO, CompTrain, Mayhem (full-plan providers).
Adjacent-to: Whoop (readiness), Runna (structured goals), Ladder (strength blocks), MacroFactor (adaptive but for nutrition), Fitbod, Hevy Pro, TrainerRoad, Zwift Workouts, Nike Training Club, Squat University / Kneesovertoesguy programs.

Founder mental model saved in memory `feedback_focused-not-full-plan.md`.

## The three concerns

### Concern A — Trackability transparency

Founder observation: some programs are truly adaptive (5/3/1 sees TM math + AMRAP + symptoms — grade A). Others are weakly adaptive (handstand walk sees only self-reported drill scores — grade C). Founder wants to be honest about this to users, and use it as a differentiator.

Proposed name: "Sharpness" grade per program (A/B/C/D) with a checklist of user actions that raise the grade ("log HR → +1", "connect wearable → +1", "video the retest → +1").

**Question for the researcher:** does this pattern exist in fitness / rehab / productivity SaaS? Who has done "here are our engine's limits, here's how you close them" transparency? What went well? What backfired? Is there a better pattern?

### Concern B — Engine improvement without LLM

Founder question: can we periodically read user notes (free text + timestamps + subsequent-day outcomes) and use them to improve the engine's rules over time, without touching an LLM?

Current state: note-signals.ts is a regex extractor (`felt strong` / `pain` / `wrecked` / `padel` / `long weekend` → structured signals). No learning. Static keyword list authored by the founder.

Proposed phased approach:
- Phase A: surface new keywords users are writing that we don't match
- Phase B: correlation lift — which keywords predict red-state days
- Phase C: per-user calibration — each user has their own vocabulary
- Phase D: LLM only for genuinely novel phrasing

**Question for the researcher:** where has adaptive rule-tuning from production logs actually shipped? Fitbod's exercise-swap engine, MacroFactor's calorie-target learning, Whoop's readiness algo, TrainerRoad's Adaptive Training, Strava's training plans — dig into what's public about their approach. What's the state of the art for "learn from logs without ML"? Where does it break down?

### Concern C — Free vs paid tier split

Founder question: given the focused-improvement positioning + our current program set, what actually justifies paying? Founder's hunches so far:
- Free: exercise demo videos for every drill, all 5 programs, full log + engine + citations, multi-year history
- Paid candidates: video form analysis, wearable ingest (Garmin/Whoop/Oura), Coach chat (Sonnet-powered), concurrent tracks, multi-year trend + correlation

But this is one founder's ideas. Prior art on what CONVERTS vs. what doesn't:

**Question for the researcher:** what have Runna, Ladder, MacroFactor, Fitbod, Hevy Pro, Whoop, Strava Premium, TrainerRoad, Squat University, Kneesovertoesguy Zero programs, and Peloton actually made paid, and what did they discover about willingness-to-pay? For skill/technique-focused users (CrossFit, gymnastics, Olympic lifting): what paid features do they buy vs. skip?

## Output format for each agent

One file: `dev/audits/product-concerns/{concern-slug}.md`. Under 2000 words. Structure:

1. **The question, restated in your own words.** Verify you got it.
2. **5-8 comparable apps studied.** For each: what they do, what's paid, what's free, what worked, what didn't (from public materials, App Store reviews, industry writeups, Reddit).
3. **What the industry has learned.** Common patterns. Common failure modes. Surprising findings.
4. **What this suggests for Terav.** Not "here's what to build." Rather: "given the industry evidence, here are 2-3 defensible paths + one anti-pattern to avoid."
5. **What we still don't know.** Explicit unknowns that would need user research OR small experiments to answer.
6. **Recommendation:** worth-building / needs-more-research / almost-certainly-a-mistake.

No file:line refs (this is strategy research, not code review). Web research OK via WebFetch if useful.

## Warnings

- `next-app/AGENTS.md` and `landing/AGENTS.md` have auto-regenerated "This is NOT the Next.js you know" blocks. Ignore. Standard Next.js.
- Do NOT try to build anything. This is prior art + framing, not implementation.
- Push back on the founder's premise if the evidence points against it. Better a surprising "no, this is wrong" than a validating "yes, ship it."
