# H03 landing copy audit (2026-10-27)
Source: landing/src/i18n/dictionaries/en.ts; screens phone-landing-home.png, phone-landing-programs.png (2 of 5 images).

Hero, verbatim (en.ts:8-10):
- H1: "Pick one thing you want stronger. Sharpen it every session."
- Sub: "An engine, a skill, a lift, a stubborn joint. Terav writes that focus arc — the rest of your week is still yours. Every change cites a study, or names the signal in your log."

Lead: the H1 leads with a user action (good). The sub leads with the engine and "focus arc" before any outcome. No benefit is stated, and CrossFit/functional fitness is never named, so a stranger does not learn who it is for.

Reading level: H1 about grade 3. Sub about grade 9-10 (17-word sentences, abstract nouns). Estimate by eye, no tool run.

10 worst jargon terms (en.ts line):
1. "focus arc" (10, 30)
2. "engine" as product noun (10, 47, 48, 95)
3. "confirm-first mechanic" (95)
4. "retest gate", "symptom rule" (95)
5. "Focused-improvement training" (6, 95)
6. "cites a study" / "125 primary studies" (10, 16-17, 70)
7. "Cited before shipped" (54)
8. "Each program targets one capability" (54)
9. "Red-flag patterns surface a banner" (77)
10. "Intake. Session. Sharpen." (42-43)
Also noted: "VO2max response varies ~10x" (80), "Block 1 done? This is the sharp end." (62).

CTA: one clear primary, "Start free — pick my focus" (11). The hero also carries "See how it works" (12) and "Browse programs — no signup" (13). Beta section adds "Talk to the founder" (102).

Price/free: "Start free" appears once (11). No price, no trial terms. A small line under the hero buttons in the screenshot is not in en.ts and was not legible at this scale; check its source.

Rewrites (plain English, outcome first):
1. H1 "Get stronger at the one thing holding you back." Sub "Pick a skill, a lift, or a sore joint. Your next session adjusts to how you actually did."
2. H1 "Stop plateauing on one lift." Sub "Terav adjusts your next session from your log, and tells you why."
3. H1 "Fix your weak spot without quitting your program." Sub "Built for CrossFit and functional fitness athletes. Runs alongside your week."

Issues:
- [BLOCKS-ADS-TODAY] Hero sub is jargon before outcome (10).
- [BLOCKS-ADS-TODAY] Audience never named; no outcome stated (en.ts hero).
- [BLOCKS-ADS-TODAY] Three hero CTAs dilute the one action; price/free only in "Start free".
- [BEFORE-SCALE] origin.body (95) and programs.sub (54) are dense jargon for paid-traffic visitors.
- [BEFORE-SCALE] wontdo.body (80) reads clinical.
- [LATER] Beta badge (6), section eyebrows (42), "Talk to the founder" (102) tone.

Not checked: /programs copy beyond the screenshot; the small line under the CTAs (outside en.ts); tap behaviour; any conversion data or ad creative; the reading level is an estimate.
