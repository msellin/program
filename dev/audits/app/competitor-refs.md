# Terav — canonical competitor peer set

The apps our audit agents benchmark against. Do NOT swap this list without a
reason — the point is that audits over time compare against the same peers,
so drift and progress are trackable. Add new peers only when the market
actually shifts.

Every peer here is a mobile-first, single-focus training / recovery / cardio /
skill product with an authenticated home surface. That's the design space
Terav lives in — NOT SaaS dashboards (Linear, Cal, Anthropic), which was the
old benchmark and produced the wrong reference class (too dense, too
information-per-inch, wrong emotional register for a coach app).

## The peer set

### Recovery / mobility focus (nearest neighbors — same "one thing" positioning)

| App | URL | Why it's the reference |
|-----|-----|------------------------|
| **Pliability** (formerly ROMWOD) | https://pliability.com — https://apps.apple.com/us/app/pliability/id1140617076 | Mobility-first, one arc per day, big card UI, aggressive white space. Cited by Margus as the visual target for "cleaner, bigger" UI. |
| **GOWOD** | https://gowod.com — https://apps.apple.com/us/app/gowod/id1176192026 | Mobility, competitive/CrossFit adjacent, structured plans. The Aug-19 batch was seeded from GOWOD screenshots. Study identity chip, section labels, single-focus hero. |
| **ROMWOD legacy** | archived — https://web.archive.org/web/20220101000000*/romwod.com | Historical reference — the app Pliability replaced. Old UI patterns to reject. |

### Cardio / progression focus (Engine Builder + Rowing 2K peer)

| App | URL | Why it's the reference |
|-----|-----|------------------------|
| **Runna** | https://runna.com — https://apps.apple.com/us/app/runna-personalised-run-plans/id1544678181 | Adaptive plan, weekly view with block-per-day and reschedule ("move today's run to tomorrow"). Cited by Margus as the target for the Week tab's move-drag interaction. Study weekly plan collapse/expand. |
| **Strava** | https://strava.com — https://apps.apple.com/us/app/strava-run-ride-hike/id426826309 | Log-first, feed-adjacent. Study session detail card composition and the "post-session" summary UI. |
| **Whoop** | https://whoop.com — https://apps.apple.com/us/app/whoop-fitness-health-coach/id1233194330 | Adaptive coach ("recovery score"), score-driven daily card. Study single-metric hero cards and how they compress dense data into one number confidently. |

### Strength / logging focus (5/3/1 + CSM peer)

| App | URL | Why it's the reference |
|-----|-----|------------------------|
| **Hevy** | https://hevyapp.com — https://apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1512473074 | Strength logging, template-based programs, clean list UX. Study set-log input and rest-timer surface. |
| **Ladder** | https://joinladder.com — https://apps.apple.com/us/app/ladder-team-training/id1466767906 | Coached strength, "one team = one program" positioning. Closest to Terav's confirm-first pattern. Study program-detail hero + week grid. |

### Skill focus (Handstand Walk + skill-first pivot peer)

| App | URL | Why it's the reference |
|-----|-----|------------------------|
| **GMB Fitness** | https://gmb.io | Skill progressions, tiered path. Study tier-progression visual metaphor. |
| **Movement Athlete** | https://themovementathlete.com | Skill-first, assessment-driven. Study assessment → placement flow (relevant to Terav's assessment_pack + tier placement). |

## How to use this list

- **app-visual-craft** — per audit, WebSearch 2-3 peer names + "UI review" or "screenshots" for current design breakdowns; WebFetch the highest-quality reference (design-blog post, app store screenshots, Refactoring UI-style teardown). Cite what to steal, what to reject, with an image URL where possible.
- **app-mobile-ux** — pull thumb-reach + tap-target references from the same peers. Runna and Whoop are the strongest for adaptive-coach nav patterns; Pliability for spacious card interaction.
- **app-motion-perf** — Whoop and Runna both animate score reveals and coach proposals. Study `prefers-reduced-motion` behavior + entry choreography.
- **product-design-lead** — when making a fork decision, name which peer the recommendation is aligned with and which it deliberately rejects. "We're going Pliability-scale on identity chip, not Whoop-scale on data density" is a stronger brief than "make it cleaner."

## Anti-pattern: what NOT to benchmark against

- **SaaS dashboards** (Linear, Cal.com, Notion, Anthropic console) — different reference class. They optimize for information density on a laptop; Terav optimizes for one-tap decisions on a phone at 6am. Studying them produces cramped, over-chromed UI.
- **Consumer social apps** (Instagram, TikTok) — wrong emotional register. Terav is a coach, not a feed.
- **Medical / clinical apps** — too fragile-tone. The rehab-not-fragile positioning is deliberate.

## Cadence

Refresh this list once a quarter. If Margus flags a new competitor mid-quarter, add it here (with a note on WHY it's added) before the next audit run — don't add it inside the audit itself, or the peer set stops being canonical.

Last refresh: 2026-08-19 (initial seed).
