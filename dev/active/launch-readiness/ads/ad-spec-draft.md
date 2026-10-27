# Ad spec: DRAFT for the hackathon (Lane 3 finalises it → `ad-spec.md`; review panel M-04 before upload)

**Offer:** a free open beta. **Budget:** €150 total, Meta €100 / Google €50, over 5–7 days (D7).
**Audience:** 18+, EU + UK + US + CA + AU. English only. Interests and keywords only: **no** custom audiences,
remarketing, lookalikes or Customer Match (health is a sensitive category).
**Tracking:** UTMs only (no pixel). Read the results with `dev/scripts/activation.sql` by utm_campaign.
**Wording:** only from the safe list (`findings-compliance.md` §2). Banned: pain, injury, rehab, recover, hip,
"your weakness", "stuck", "in N weeks", proven, clinically, %/bpm/s gains, "125 studies", before/after, testimonials,
"CrossFit" in ad text, "AI form check".

## Ad sets (one per advertised program)
| Set | Landing URL (UTMs) | Meta interests | Google keywords (phrase) |
|-----|--------------------|----------------|--------------------------|
| pullup | `https://terav.fit/programs/first-strict-pullup/?utm_source={meta\|google}&utm_medium=paid&utm_campaign=pullup-v1&utm_content={ad}` | Calisthenics, Functional training, Bodyweight exercise, Gymnastics | "first pull up", "how to do a pull up", "pull up progression", "strict pull up program" |
| handstand | `…/programs/handstand-walk/?…&utm_campaign=handstand-v1…` | Calisthenics, Gymnastics, Handstand, Functional training | "handstand walk progression", "learn handstand walk", "handstand walk drills" |
| strength-cardio | `…/programs/concurrent-strength-maintenance/?…&utm_campaign=strengthcardio-v1…` | Functional training, Weight training, Hybrid training, HYROX (if offered) | "keep strength while running", "strength and cardio plan", "concurrent training program" |

## Copy (pick 2 headlines + 2 texts per set for an A/B)
**Headlines** (Meta ≤40 chars; Google RSA ≤30):
- Shared: "Get better at one thing" · "Training that adapts to your log" · "Free during beta"
- pullup: "Pull-up progressions, with sources" · "Build toward your first pull-up"
- handstand: "Handstand walk, step by step" · "Train one skill until it sticks"
- strength-cardio: "Add cardio. Keep your strength." · "A focused plan for your engine"

**Primary texts:**
- **A:** "Terav builds one focus (your engine, a lift or a skill) around your existing week. You log, it suggests, you accept."
- **B:** "Skill work with the reasons shown: every change names the study or the log signal behind it. Free during beta."
- **C:** "Pick a focus: pull-ups, handstand walk, or strength + cardio. Short sessions that sit alongside your gym programming."

**Google descriptions (≤90 chars):**
- "One focus, built around your training week. Every change shows its reason. Free beta."
- "Log your sessions; Terav suggests the next step and you approve it. Start free today."

## Creative (Lane 3; no stock before/after imagery)
- 1080×1080 and 1080×1920: a phone frame showing the Today screen (after the Lane 2b cleanup) plus a headline overlay.
  Make one per set from fresh screenshots (`launch-gaps.spec.ts` → `screens/gaps/C-viewport-393/01-today-top.png`).
- Option: the follow-along figure rig (`dev/active/exercise-media`) as a 6–10 s loop for the pull-up and handstand
  sets. No faces, no bodies-as-results.

## Decision rule after 3–5 days
- Pause any ad with CTR < 0.5% after 1,000 impressions.
- Compare cost per sign-up and the activation rate (first session logged) between sets.
- €150 can't measure conversion to paid; it shows whether cold traffic signs up and activates at all.
