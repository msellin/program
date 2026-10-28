# Deep design review: brief shared by every reviewer (2026-10-28)

**Context.** Terav (app.terav.fit) is a mobile PWA for focused training: pick one skill, lift or engine and
it sharpens that arc against your log. A €150 Meta/Google ad test starts this week and sends strangers to
pull-up, handstand-walk and strength programs.

**What changed today.** Live since cb83e26:
- one card style;
- an 8-step type scale (eyebrow 11, caption 13, small 14, body 16, h3 17, h2 20, h1 32, metric 40);
- named radii;
- status-only left bars.

Spec: `dev/active/visual-system/visual-system-plan.md`, tokens: `brand/tokens.css`.

**Owner's question.** Is it good now? Specifically:
- too much text?
- text too small or too big?
- too few visuals?
- how does it compare with the peers people already use?

## Evidence: use ONLY these (captured from live after the new design shipped)
- `dev/active/launch-readiness/screens/gaps/A-first-run/`: a stranger's first run, from landing to the first session.
- `dev/active/launch-readiness/screens/gaps/C-viewport-375/` and `C-viewport-393/`: the main screens at real phone size.
- `next-app/tests/e2e/artifacts/personas/<id>/mobile/` and `.../flows/` for ONLY these ids: persona-pullup,
  persona-pullup-fast, persona-handstand, persona-handstand-fast, persona-csm-red, persona-strength-long.
  Other persona folders may still hold the OLD design, so don't use them.

**Peers:** `dev/audits/app/competitor-refs.md` (Pliability, GOWOD, Runna, Whoop, Hevy, …).

**Code** is in `next-app/src/`, if you need to confirm a cause.

**Test data.** The personas run on simulator seed data. Implausible numbers (100+ reps, 269 bpm) are seed data, not
UI defects.

## Rules
- Look at screenshots: Read the PNGs. View at most about 30 images, and pick the ones that matter for your lens.
- Every finding cites a screenshot path.
- Severity is one of:
  - **ADS-BLOCKER**: a stranger from an ad would bounce or be misled;
  - **FIX-THIS-WEEK**;
  - **LATER**.
- Separate taste from defect. Say when something is GOOD; the owner needs to know what to keep.
- Don't change any code.
- Write your report to `dev/active/design-review-2026-10-28/<NN>-<lens>.md`, at most 40 lines:
  - a one-line verdict;
  - scores 1–10 (10 = best) for text density, text size, visual richness and consistency;
  - findings;
  - what to keep.
- Reply to the lead with the same report.
