# HYROX category research — shared brief

## The product context

Terav is an adaptive training app for CrossFitters, strength athletes, and
rehab-adjacent lifters. Current catalog: Engine Builder (aerobic base), CSM
(concurrent), Rowing 2K, Handstand Walk (skill), Overhead Mobility (skill),
Anterior Hip Rebuild (personal). All programs are evidence-based with 100+
cited studies across the catalog.

## Why HYROX

HYROX is arguably the fastest-growing fitness racing format in the world
right now. It's structured, measurable, mass-participation, gym-owned. Terav's
adaptive engine + tier-honest outcome ranges is a strong fit — the sport
rewards prepared athletes and punishes the unprepared, so specific
programming has a clear market.

## The three research questions

**Agent 1** — the physiology + biomechanics of HYROX. What actually makes it
hard? Which stations kill which athletes? What separates elite from amateur?
What's the peer-reviewed literature on the specific movement patterns
(sled push/pull, wall balls, sandbag lunges, burpee broad jumps, ski erg,
farmers carry, rowing)?

**Agent 2** — current best-practice HYROX programming. What are top coaches
doing? What's the evidence base for periodisation, hybrid endurance-strength
programming, taper protocols specific to HYROX? What published programs
exist (Nick Wilson, Runna HYROX plans, elite athlete public logs)? Which
of our existing programs (Engine Builder / CSM / Rowing 2K) could be adapted
with modest content changes to serve HYROX athletes?

**Agent 3** — concrete Terav HYROX program candidates. Given the app's
philosophy (evidence-first, adaptive, honest ranges, tier-based), what 2-3
programs would we actually build? What would be genuinely new territory that
the existing 5 don't cover? Are there natural stepping-stones (Engine
Builder → HYROX Base → HYROX Race Prep)? Should HYROX be its own catalog
category or a variant tag on existing programs?

## Constraints

- Programs must be evidence-based with cited literature (100+ citations
  across the current catalog is the bar)
- Outcome ranges honest — no "guaranteed sub-60 min HYROX time"
- Multi-tier (Foundation / Progression / Push) to serve amateur through
  advanced
- Adapts to intake data + logged sessions (not fixed template)
- Duration realistic — most programs 6-12 weeks
- Should work with common equipment access (some athletes have box access,
  many don't)

## What to deliver per agent

Structured markdown report with:

1. **Executive summary** — 3-5 bullets on the strongest actionable insights
2. **Detailed findings** — grouped by relevant sub-topic
3. **Literature cited** — DOIs / stable URLs where possible
4. **Terav-specific recommendations** — what should we build, in what order,
   and what would each program's tier structure + retest metric look like
5. **Open questions** — where does the evidence run out and we'd need to
   make engineering choices?

Save to `/Users/margussellin/www/program/dev/audits/hyrox-agent-{N}-{angle}.md`
and return the full report as your final message.

Use WebSearch / WebFetch to find real materials — this is deep research,
not code review. Prioritise peer-reviewed sources but include high-quality
practitioner content (elite coaches, published HYROX athletes) with
clear attribution.
