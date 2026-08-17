# Terav landing — Positioning audit: focused-improvement vs. full-plan misread

Date: 2026-08-17.
Scope: does the landing today communicate "pick a focus, use alongside your other training," or does it read as "this is your complete plan — follow it and you're done."
Files audited: `landing/src/i18n/dictionaries/en.ts`, `landing/src/app/page.tsx`, `landing/src/components/sections/Hero.tsx`, `landing/src/components/sections/Programs.tsx`, `landing/src/components/sections/ThreeWayContrast.tsx`, `landing/src/components/sections/YourFirstWeek.tsx`, `landing/src/components/sections/OriginStory.tsx`, `landing/src/components/sections/WontDo.tsx`, `landing/src/components/sections/BetaCTA.tsx`, `landing/src/components/sections/EvidenceClaim.tsx`, and the six manifest entries in `next-app/public/data/programs/manifest.json`.

---

## 1. Verdict

The current landing reads as a full training plan. Nowhere in hero, contrast, or programs copy does it say "pick one focus and run this alongside your other training." A reader arriving from HWPO / CompTrain / Mayhem — the mental model set by every other subscription training brand — will assume this replaces their week, not sharpens one slice of it. That is the load-bearing miscommunication.

---

## 2. Evidence

### Where the ambiguity lives (strings that invite the full-plan misread)

Every string below reads more naturally as "the plan for your week" than as "the plan for one focused capability."

- `en.ts:7` — H1_a: `"A training plan that"`. The definite article + noun phrase "a training plan" is exactly the container HWPO, CompTrain, Mayhem, PRVN, and Comptrain-adjacent brands sell. When Mayhem says "your training plan," it means every session, every day. This H1 does not qualify what kind of training plan.
- `en.ts:8` — H1_b: `"sharpens every session."`. "Every session" implies all your sessions belong to Terav. If Terav is a focused-improvement tool, this is false: most of your sessions are still HWPO / your box / your coach. "Every session" here is a promise that scoped programs cannot keep.
- `en.ts:9` — hero sub: `"Adaptive strength and cardio. Every change cites a study — you approve each one."`. "Strength and cardio" is broad enough to mean the whole training week. There is no boundary drawn.
- `en.ts:10` — CTA: `"Build my plan"`. Singular "my plan," not "my focus" or "my program." Reinforces one-plan-for-everything.
- `en.ts:13-14` — stat: `"5 programs" / "in three domains"`. Reads like modules of one system, not five self-contained focused arcs.
- `en.ts:28-29` — contrast row: template = `"A session from a library"`, Terav = `"A plan sharpened every session"`. Directly implied comparison: MyFitnessPal-style template apps deliver the whole plan, Terav delivers the whole plan better. The category being compared is "full plan providers."
- `en.ts:31-33` — timing row: trainer = `"A plan every two weeks"`, Terav = `"A plan sharpened every session, against your log"`. Same problem — the comparison peer is a full-service coach who writes your week.
- `en.ts:37` — how-it-works title: `"Intake. Session. Sharpen."`. "Session" (singular) reinforces "one all-encompassing plan."
- `en.ts:41` — step 2: `"Tomorrow's plan, written against your history."`. Whose whole day? Whose whole tomorrow? If this is a focused arc used alongside CrossFit, "tomorrow's plan" is exactly wrong — Terav writes one slice of tomorrow at most, and on many tomorrows it writes nothing (rest, other training).
- `en.ts:47` — programs title: `"Five programs live. Three more in build."`. Neutral. But the eyebrow `"The catalog"` (`en.ts:47`) still frames it as a library from which you pick one to run — not as "an add-on for one focus you're chasing."
- `en.ts:84-85` — beta CTA: `"One intake. / Then every session sharpens."`. Same "every session" overreach.
- `en.ts:86` — beta body: `"Tomorrow you get a session written against your history..."`. Same as `en.ts:41`. Whose tomorrow?
- `landing/src/components/sections/YourFirstWeek.tsx:47-48` — H2: `"This is Engine Builder, Week 1."` then `"Three sessions. Each with the exact prescription..."`. This one is actually the closest the landing gets to honesty — three sessions/week reads like an add-on, not a full week. But the copy never says "and the other four days are yours" or "run this alongside your box." It leaves the reader to infer.

### Where the focused-improvement positioning IS explicit today

Effectively nowhere in the marketed hero. What exists is oblique and buried:

- `en.ts:52` — CSM pitch: `"Add cardio without losing the squat."`. This is the one string that concretely signals "we do one thing." "Add" is the key verb. But it's a card body, four levels deep in the fold, not the pitch.
- `en.ts:50` — Engine Builder pitch: `"For lifters who can't yet run 5k."`. Scoped audience, no scope statement about what Terav does.
- `en.ts:81` — origin body: `"...Terav is a training app, not a rehab tool — if you have a specific medical issue, work with a clinician."`. Draws a boundary against clinicians, not against full-plan competitors. The boundary that matters here is not drawn.
- `next-app/public/data/programs/manifest.json:14` — Engine Builder short: `"Block 1 of a 3-block, ~6-month engine transformation."`. Program-detail level, not landing. Reader has to click through.
- `next-app/public/data/programs/manifest.json:41` — Engine Builder `what_youll_achieve`: `"...Block 1 of a 6-month engine transformation."` — same, only surfaced on program pages.

Net: zero explicit "use alongside your existing training" statement on the landing. The founder's mental model does not appear in the marketed copy. Only the hero-adjacent stat `"5 programs / in three domains"` (`en.ts:13-14`) hints at "you pick one" — but a reader who reads that as "five modules of the plan" is not wrong given every other cue.

---

## 3. Where the risk is loudest

Ranked:

1. **Hero (H1 + sub + CTA)** — `en.ts:7-10`. This is where the misread is manufactured. "A training plan" + "sharpens every session" + "Build my plan" is a three-string commitment to owning the whole week. Every downstream section inherits this frame. Load-bearing.
2. **ThreeWayContrast** — `en.ts:20-33`. Second-loudest. The comparison peers (template libraries, personal trainers) are both full-service. By choosing those peers, Terav walks into the same category. It should be comparing against "no focus at all" or against "generic CrossFit programming that doesn't touch your weakness," not against MyFitnessPal-style template dispensers and 1:1 coaches.
3. **How-it-works / YourFirstWeek** — `en.ts:37-45` and `YourFirstWeek.tsx:47-48`. Weak-loud. YourFirstWeek is the section most naturally suited to say "three sessions a week — the rest of your training is yours." It does not.
4. **Programs section** — `en.ts:46-59`. Actually mostly-honest at the card level (`"Add cardio without losing the squat"`, `"For lifters who can't yet run 5k"`). The failure is the header — `"The catalog"` / `"Five programs live"` implies "a store where you pick one that becomes your plan." The correct frame is `"Pick one focus. Run it alongside the rest of your training."`.
5. **Origin** — `en.ts:76-81`. Only draws the clinician boundary. Does not draw the training-scope boundary. Small miss but easy to fix.

---

## 4. Competitive framing

Full-plan brands sell "your complete week":

- **HWPO Training** (hwpo-training.com) — sells "the training program" with tiers (Individual, Team). Explicit "This is your training." Rich Froning-style volume: 6 days/week, everything programmed for you.
- **CompTrain** (comptrain.co) — "Everyday Athlete," "CompTrain Class," "CompTrain Masters." Sells a track. You follow one track and it is your week.
- **Mayhem Athlete** (mayhemnation.com) — "Daily programming, coaching, and community." The word "daily" is load-bearing — they write every day of your week.
- **PRVN** (prvnfitness.com) — sells complete training tracks tied to Mal O'Brien / Aimee Everett. Same shape.

All four sell the container. None of them sell "one skill" or "one energy system" — they sell the whole training week for the whole athlete.

Focused-improvement products sell the focus, not the container:

- **Whoop** — sells readiness / recovery / sleep as a lens, not a plan. Never claims to write your training. Explicitly "coach, not programmer."
- **Nike Training Club** individual programs — each program is scoped ("6-Week Full-Body Strength," "Kettlebell Blast"). The picker is honest that you pick one and run it — usually alongside other things.
- **Strava's structured workouts / training plans** — single-goal (a 5k, a 10k, a marathon). Explicit: this is a plan for this goal. The user knows it does not replace the rest of their training.
- **Hevy** — log-first. Never claims to write your program. Owns the logging surface, not the coaching surface.
- **Squat University / Kneesovertoesguy programs** — the closest reference. Explicit scope: "this is a knee program," "this is a hip program." Users know it goes on top of their existing training.

**Terav's honest peer set is the fourth group, not the first.** But the current hero copy positions Terav in the first group. This is the mismatch.

There is also a positive reference to steal from directly: **Runna** and **Ladder** both sell scoped-goal programs (a race, a strength arc) with adaptive weekly programming. Runna's hero is essentially "training plans that adapt to you" — but the container is "a race," and the user knows what the container is. Terav's container-per-program is a *capability*, which is fuzzier and needs the copy to do more work, not less.

---

## 5. Recommended fix

### 5.1 New hero

The H1 has to name the container as "a focus," not "a training plan." Three options:

**Option A — noun-forward, closest to Basecamp / Linear pattern:**
- H1: `"A focus for your training that sharpens every session."`
- Sub: `"Pick one thing — an engine, a skill, a lift — and run it alongside your box, your coach, or your own week. Every change cites a study. You approve each one."`

**Option B — verb-forward, closest to Whoop / Runna pattern:**
- H1: `"Pick one thing you want stronger. Sharpen it every session."`
- Sub: `"An engine, a skill, a lift, a stubborn joint. Terav writes the focus arc; the rest of your week is still yours. Every change cites a study."`

**Option C — problem-forward, closest to Superhuman pattern:**
- H1: `"Every training week has one weakness. Terav sharpens it."`
- Sub: `"Pick one focus — engine, skill, strength, mobility — and Terav programs the sessions that move it. Runs alongside your box or your own plan. Every change cites a study."`

**Pick Option B.** Reasons:
1. It matches the founder's mental model verbatim ("some part of your general fitness — either a skill, engine, strength").
2. "Pick one thing" is the shortest possible articulation of the whole positioning shift.
3. "The rest of your week is still yours" is the one line that most kills the full-plan misread.
4. "Engine, skill, lift, stubborn joint" reads native to the CrossFit-adjacent buyer (the actual audience — see manifest categories at `manifest.json:167-193`).
5. It preserves the `sharpens` verb the brand is built on (Terav = sharp).

Copy targets:
- `en.ts:7` change from `"A training plan that"` → **remove**; H1 becomes one line: `"Pick one thing you want stronger. Sharpen it every session."`
- `en.ts:8` remove `"sharpens every session."` as separate string; it's now inside the new H1_a.
- `en.ts:9` sub → `"An engine, a skill, a lift, a stubborn joint. Terav writes that focus arc — the rest of your week is still yours. Every change cites a study."`
- `en.ts:10` CTA `"Build my plan"` → `"Pick my focus"`. This is the single highest-leverage word change on the page.
- `en.ts:12` browse link `"Browse programs — no signup"` → `"Browse focuses — no signup"` (or keep `programs` if the domain-naming decision hasn't landed; see §6).
- `en.ts:17-18` `"Every session / adapts to your log"` → `"Your focus / adapts every session"`. Kills the last "every session" overreach.

Note: `Hero.tsx:59-68` renders H1_a then H1_b on separate lines with a chisel-stroke SVG under H1_b. The new hero needs a rewrite of the split. Recommend H1_a = `"Pick one thing"`, H1_b = `"you want stronger."` — the chisel underlines "stronger," which is the promise. Then a second smaller line: `"Sharpen it every session."` in `text-2xl` under the H1, still above the sub. This keeps the visual signature.

### 5.2 New programs section header

Current (`en.ts:46-49`):
```
eyebrow: "The catalog"
title: "Five programs live. Three more in build."
sub: "Three domains. Cited before shipped."
```

Three options:

**Option A:**
- eyebrow: `"Pick your focus"`
- title: `"Five focuses live. Three more in build."`
- sub: `"Engine, skill, strength, mobility. Run one alongside the rest of your training. Cited before shipped."`

**Option B:**
- eyebrow: `"One focus at a time"`
- title: `"Five arcs live. Three more in build."`
- sub: `"Each one is a scoped arc, not a full week — designed to run alongside your existing training."`

**Option C (least churn — keeps `programs` word):**
- eyebrow: `"Pick one program"`
- title: `"Five programs live. Three more in build."`
- sub: `"Each program targets one capability — an engine, a skill, a lift, a joint. Runs alongside your other training. Cited before shipped."`

**Pick Option C.** Reasons: it preserves the word "program" (which is what the manifest and the code call these things — see `manifest.json:3`), it names the scope-per-program explicitly in the sub, and it says "alongside your other training" — the exact phrase that closes the misread. Minimal downstream code churn.

### 5.3 ThreeWayContrast: keep or replace

The three-way contrast is the second-loudest miscommunication and it is structurally worse than the hero. It compares Terav to templates and trainers — both full-plan peers. The reader concludes: "Terav is a smarter version of the same thing."

Two paths:

**Path A (light touch):** keep the section, add a third row that names scope. New row:
- label: `"Scope"`
- template: `"Your whole week"`
- trainer: `"Your whole week"`
- terav: `"One focus. The rest is still yours."`

Add to `en.ts:20-33`:
```
row_scope_label: "Scope",
row_scope_template: "Your whole week",
row_scope_trainer: "Your whole week",
row_scope_terav: "One focus. The rest is still yours.",
```

Then push it as the *first* row in `ThreeWayContrast.tsx:19-32` — before "What you get" and "When it adjusts." The first row a reader sees answers the container question they didn't know they had.

**Path B (structural):** replace peers. Compare Terav to "generic CrossFit programming" (i.e. the box) and "no focus at all" — a two-column contrast, not three. Much more work, higher payoff. Only worth it if the founder is willing to burn the three-way frame.

**Pick Path A.** Ship the scope row this week. Revisit Path B after 30 days of beta signups if the "wait, this replaces my box?" question keeps coming up.

### 5.4 YourFirstWeek — one added sentence

`YourFirstWeek.tsx:50-52` currently says: `"Three sessions. Each with the exact prescription and the study it's built on. No mystery, no filler."`

Change to: `"Three sessions a week. The other four days are yours — keep your box, your coach, your own runs. Terav writes the focus arc. No mystery, no filler."`

This is the single highest-leverage sentence outside the hero. It kills the misread with a concrete number ("three sessions a week"), not an abstraction.

### 5.5 BetaCTA — kill "every session" overreach

`en.ts:84-85` currently: `"One intake. / Then every session sharpens."`

Change to: `"One intake. / Then your focus sharpens every session."`

Adds four words. Preserves rhythm. Removes the "every session belongs to us" overclaim.

`en.ts:86` currently: `"Ten minutes of questions and a short physical check. Tomorrow you get a session written against your history, with citations. You Accept or Ignore each change."`

Change to: `"Ten minutes of questions and a short physical check. Tomorrow your first focus session lands — written against your history, with citations. You Accept or Ignore each change."`

Same shape. "Focus session" replaces the ambiguous "a session."

### 5.6 Origin — add one clause

`en.ts:81` currently ends: `"Terav is a training app, not a rehab tool — if you have a specific medical issue, work with a clinician."`

Change to: `"Terav is a focused-improvement tool, not a full training plan — it sits alongside your box, your coach, or your own week. If you have a specific medical issue, work with a clinician."`

The clinician boundary and the scope boundary are the same shape of statement; put them in the same sentence.

---

## 6. What this does NOT solve

Flagging adjacent decisions this audit did not touch but must be resolved for the fix to land cleanly:

1. **Domain / brand vocabulary — "program" vs. "focus" vs. "arc."** The manifest calls these things `programs` (`manifest.json:3`). The founder mental model calls them a "focus." The recommended hero uses "focus" as the noun and "program" as the container word ("Pick my focus" CTA → lands on a `/programs` catalog). This is defensible but creates one word of cognitive load. Alternative: rename the URL structure `/focus/[slug]` and the in-app picker "Focuses." Not this audit's call — but decide before shipping the copy.

2. **In-app framing on the programs picker.** The app's program picker likely uses the same "training plan" mental model as the current landing. If the landing shifts to "pick one focus, run alongside," the picker page (in `next-app/`) needs the same shift or the first post-signup experience contradicts the marketed promise. Not audited here. Flag: audit the `/programs` list page in the next-app, and audit the intake flow's language.

3. **The line `"personal rehab and strength-training tracker for one user (Margus)"` in `CLAUDE.md:6-7`.** With the SaaS launch scope in `dev/active/saas-launch/`, that CLAUDE.md line is now stale and, worse, framing-adjacent — a new engineer reading it would build for one user, not a multi-user beta. Not part of the marketed landing, but if anyone screenshots the repo or the doc becomes public-adjacent, it undercuts the new positioning. Update it in the same PR: `"A focused-improvement training app. Data model in data/ was originally seeded from Margus's rehab logs; the app is now a multi-user beta serving one-focus arcs (engine, skill, strength, mobility)."`

4. **The word "sharpen."** It's a strong brand verb and this audit kept it. But it's a verb that implies iterative refinement of an existing thing. Fine for adaptive programming; potentially wrong for "add a new focus you didn't have." If the founder later wants to sell "add a capability" rather than "sharpen a capability," the verb needs a companion. Out of scope here.

5. **Anterior-hip-rebuild program in the manifest.** `manifest.json:5-29` has `"personal": true` and is explicitly Margus's own arc. It's not in the marketed landing's five, which is correct. But if a beta signup lands on the manifest with the wrong filter, they see a program that's "for you specifically" and the positioning cracks. Confirm the landing's programs section and the beta app's picker both filter `personal: true` out for non-owners. Not this audit's scope.

6. **Homepage nav's "Programs" link.** Not audited — but if the landing shifts to "focus" language and the nav still says "Programs," the reader gets two words for one thing above the fold. Small friction, worth reconciling in the same PR.

---

## 7. Estimated cost

Copy-only changes (highest-leverage subset — hero, programs header, YourFirstWeek sentence, BetaCTA, Origin one-clause):

- Hero rewrite (H1 split, sub, CTA, browse link, stat label) — `en.ts:7-18`, plus adjusting `Hero.tsx:59-68` for the new H1_a/H1_b split. **~45 min** including a mobile visual pass at 375px and 393px to confirm the new H1 wraps cleanly and stays above the fold.
- Programs section header — `en.ts:47-49`. **~10 min**.
- YourFirstWeek sentence — `YourFirstWeek.tsx:50-52`. **~5 min**.
- BetaCTA — `en.ts:84-86`. **~10 min**.
- Origin one-clause — `en.ts:81`. **~5 min**.
- Manual QA at 375 / 393 / 1280 / 1440, plus one honest re-read of the whole page to make sure the misread is actually gone. **~30 min**.
- Total: **~1h 45min** of shipping work.

ThreeWayContrast added row (Path A):

- Dictionary keys + row wiring in `ThreeWayContrast.tsx:19-32` and desktop `tbody` at `ThreeWayContrast.tsx:115-127`, plus mobile 2-column display at `ThreeWayContrast.tsx:73-99`. **~30 min**.
- Total with contrast row: **~2h 15min**.

Estimated cost to ship the whole positioning fix — landing only, no in-app changes: **half a day**.

Adjacent work flagged in §6 (in-app picker language, CLAUDE.md update, domain vocabulary decision) is separate and out of this audit's scope, but the landing change is worth shipping before that adjacent work — it doesn't need any of it to be honest.
