# Future feature backlog

Ideas we've explicitly deferred. Not blocking current work. Captured here so nothing gets lost between context windows.

## Landing — "Talk to founder" contact line

**When surfaced:** 2026-08-16 landing review.

**What:** small line under the beta CTA on `landing/src/components/sections/BetaCTA.tsx`: *"Questions? Email sellinmargus@gmail.com"*. No calendar, no form.

**Why:** pre-beta, solo founder — 1:1 access is cheapest, highest-trust signal in health/rehab. Also produces qualitative feedback the tracker won't capture.

**Precondition:** only add when Margus can commit to ~48h reply time. Dead link hurts more than none.

**Email to use:** `sellinmargus@gmail.com` (not the dolmit address).

## Video upload + AI form analysis

**When surfaced:** during the Engine Builder / skill-programs conversation, 2026-08-11. Explicitly future.

**Use case:** the user records a rep of a skill movement (strict HSPU, muscle-up transition, handstand walk attempt, snatch pull, single-leg RDL). App runs pose analysis + vision-LLM interpretation. Returns structured feedback: what looked good, what to fix, whether to progress.

**Why it belongs to this app specifically:** skill programs (HSPU, muscle-up, gymnastics) are pass/fail on form. Text cues + video demos help; personal feedback on your rep is what actually closes the loop. Nobody in the fitness app market does this well (OnForm / Coach's Eye = annotation without AI; Fitbod / Hevy / Runna = no video). Genuine gap.

**Technical shape when we build it:**

- **Client-side pose detection first** — MediaPipe Tasks JS or a small YOLO model in-browser. Extracts keypoints (shoulder / hip / knee angles) without uploading the raw video. Privacy + cost win.
- **Server-side vision LLM interpretation** — sampled keyframes (5-10 per video) sent to Claude Sonnet or Gemini vision. Analyses form cues against the exercise's known technique standards.
- **Storage** — raw videos in R2 (free tier holds ~4 videos/user/month for 100 users). Kept only until analysis complete; user opts in to preserve for progress-tracking.
- **Cost profile** — Claude vision ~$0.003/image × ~10 keyframes = ~$0.03 per analysis. R2 storage cents/month. Total ~$0.05-0.10/user/month if used sparingly. Fits paid-tier margin comfortably.

**When to build:** post-beta, only after (a) at least one skill program is live (First Strict HSPU or Pull-Up) AND (b) we have paid users on that program asking for it. Otherwise it's a resource sink solving a problem nobody's hit yet.

**Risks to be honest about:**
- IP / medical-adjacent territory — form advice needs "this is a training log, not medical / coaching advice" wording
- Privacy — video of you exercising is sensitive; opt-in only, never train models on it
- Reliability of pose detection under gym-lighting conditions
- Users may over-rely on AI feedback vs a real coach

**Rough time-to-build estimate when we do:** 3-4 weeks solo. MediaPipe integration + backend pipeline + prompt engineering + UI + review flow. Not trivial, not scary.

## v2 architecture: multi-dimensional plan generation (no tiers)

**When surfaced:** 2026-08-11 Margus's handstand profile broke the tier model — his freestand is Foundation, walk is Push, turns are Foundation, obstacles are Progression. No single tier fits. This IS the general case: real athletes have uneven capabilities.

**The v2 model:**
- Programs become **libraries of drills tagged by capability_domain + level (1-5) + prerequisites + retest metric**
- Intake becomes multi-dimensional capability assessment (numeric answers per dimension, not buckets)
- Plan generator produces custom weekly templates — each user gets drills targeting THEIR weak dimensions at each dimension's own level
- Retest per capability dimension, not per program

**Example session for Margus's handstand week:**
- 15 min freestand work (Foundation-level drills — his weak spot)
- 10 min walk maintenance (Push-level — already there, don't lose it)
- 15 min turn introduction (Foundation-level — zero baseline)
- Skip obstacle work (already competent)

**When to build:** after Engine Builder validates the current fixed-tier engine with real users. Handstand Walk is the perfect first program authored on the new architecture — its capability spread is too wide for tiers to fit honestly.

**Why v1 first:** the current fixed-tier design works for programs where capability tends to move together (aerobic base is tightly correlated across metrics). It fails for skill programs where sub-skills develop independently. So Engine Builder can ship on v1; Handstand Walk needs v2.

## Handstand Walk — one program, four tiers

**When surfaced:** 2026-08-11 IA discussion. Margus has real test users at his box who can't handstand walk at all + wants advanced skills for himself.

**Design:** ONE program.json, four intake tiers, one skill library. Same pattern as Engine Builder. Simpler than three separate programs and covers the full progression from "never held a handstand" to "wants precision walking with turns".

Tiers:
1. **Foundation** — can't hold anything. Wall walks → wall hold → intro free-standing. Block 1 outcome: 5-15s free-standing. Full arc: ~24 weeks to first walk.
2. **Progression** — wall hold + brief freestand. Block 1 outcome: first 5m walk. Full arc: 16-20 weeks to 20m.
3. **Push** — free-stands 30s, no walk. Block 1 outcome: 20m controlled walk. Full arc: 8-12 weeks.
4. **Advanced** — walks 10m+. Block 1 outcome: turns + obstacle work. Full arc: multi-block toward precision walking + one-arm work.

Intake questions determine tier. Content authoring: ~30-40 hours (all tiers share the drill library, just different session emphasis per tier).

Test cohort at Margus's box: friends who can't hold + Margus himself. First real multi-tier validation of the tiered-generator model.

## Multi-program compatibility check

**When surfaced:** 2026-08-11 IA discussion.

Every program declares `domain` + `intensity`. Stacking rules enforce Hickson-style interference limits:
- Blocked: demanding × demanding
- Warned: demanding × moderate (concurrent training research shows real interference)
- Allowed silently: demanding × light (in a different domain), rehab + anything, mobility + anything

UX on block: modal with Switch / Downgrade current / Cancel.

Ships alongside the injury-profile refactor — same architectural moment (composable programs).

## Injury profile → persistent Extras

**When surfaced:** 2026-08-11 IA discussion.

Currently `block_a_home` (Margus's hip flexor rehab) is baked into his program JSON. That's wrong — rehab is a property of the user's injury profile, not the training program. If he switched from Anterior Hip Rebuild to Engine Builder, his rehab would disappear from Extras.

**Right architecture:**

- **`user.injury_profile.rehab_blocks[]`** — persistent standing rehab, driven by what the user flagged at signup + monthly assessment scores. Stays with the user regardless of program.
- **`program.extras_blocks[]`** — program's own adjuncts (warm-ups, cool-downs, activation drills specific to the program's focus). Changes when program changes.
- **Extras page** merges both. Adherence tracked separately so the specialist report shows rehab consistency independently of barbell adherence.

**Effort:** ~1 week of refactor when the time comes. Data migration is the tricky part (Margus's existing hip rehab in program.json needs to move to a per-user injury profile).

**Trigger to build:** when second user with a different injury profile signs up. Until then, the current structure works for user 1.

**Sales angle:** *"you can change what you're training for; your rehab work travels with you."* — genuinely differentiating vs every other app (they'd make you re-add rehab exercises each time).

## Other deferred ideas (add as they surface)

- **Wearable ingest** — Whoop, Garmin, Apple HealthKit, Oura HRV → next-session load modulation
- **Community / social layer** — comparing anonymised progress with other users
- **Coach view** — box owners see aggregate metrics for their members
- **Referral credits** — free month per friend signup
- **Multi-language** — Estonian + English at minimum (Margus's box is EE-primary)
- **Native mobile shells** — iOS / Android via Capacitor when PWA insufficient
