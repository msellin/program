# Peer study: what the top apps have that Terav doesn't (2026-10-28)

**Owner's verdict.** Today's Terav UX/UI is nothing like GOWOD, Pliability or the top contenders: too much text, too
few visuals, no graphs, missing beautiful UI elements. "We need to have all that." Your job is to study the peers hard
and concretely, so a redesign can copy what works.

## Method
- Research the live product with WebSearch and WebFetch:
  - App Store / Google Play listings and their screenshot captions;
  - the company's own site and feature pages;
  - design galleries (Mobbin, Screenlane, Dribbble case studies, UI breakdown articles, YouTube app-tour write-ups).
- Cite a URL for every claim. Never describe a screen you did not find evidence for; mark memory-only claims "(unverified)".
- Know Terav first. Look at about 10 Terav screenshots (`dev/active/launch-readiness/screens/gaps/C-viewport-375/`,
  `A-first-run/`, and `next-app/tests/e2e/artifacts/personas/persona-pullup/flows/`) and `dev/audits/app/competitor-refs.md`.

## Deliver, per peer and per screen type
Cover these screen types:
- onboarding / assessment;
- home / today;
- workout / session player;
- exercise detail;
- progress and graphs;
- program catalog / program page;
- completion / reward;
- body maps / scores / levels.

For each screen type, record:
- the UI elements they use: video, 3D or illustrated figures, body maps, rings, scores, charts (which kind), skill
  trees, streaks, badges, hero imagery, gradients, motion;
- the information density (words on screen);
- the visual style.

Then write a **gap table**: element | which peers have it | Terav has it? (yes / weak / no) | effort S/M/L | impact on a
paid-ad stranger.

End with **the 10 elements Terav should adopt first**, ranked, each tied to a Terav screen.

Write `dev/active/design-review-2026-10-28/<file named in your task>`, at most about 120 lines. Don't edit code. Reply to
the lead with the top-10 list only.
