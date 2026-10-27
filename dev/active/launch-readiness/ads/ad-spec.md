# Ad spec: FINAL for upload (M-03). Review panel M-04 runs on this before the owner uploads (M-05)

**Offer:** a free open beta. **Budget:** €150 total, Meta €100 / Google €50, over 5–7 days (D7).
**Audience:** 18+, EU + UK + US + CA + AU. English only. Interests and keywords only: **no** custom audiences,
remarketing, lookalikes or Customer Match (health is a sensitive category). Meta: turn **off** Advantage+ audience
expansion and detailed-targeting expansion; placements Feed + Stories + Reels (automatic is fine).
**Tracking:** UTMs only, no pixel. The landing forwards every `utm_*` on the landing URL to the app's sign-up link
(`CtaLink`), and lane 5 saves them with the user. Read results with `dev/scripts/activation.sql` by `utm_campaign`
(committed by lane 5, M-02).
**Landing it points at:** the program page, not the home page. Each page has a sticky mobile "Start free" bar, a
per-program preview image and no outcome numbers.

## Wording rules (from `findings-compliance.md` §2, `HANDOVER.md` §3)
- **Banned in ad text, creatives, handles, URLs:** pain, injury, rehab, recover, heal, treat, cure, symptoms, diagnosis,
  hip, "your weakness/problem/condition", "stuck", "in N weeks", guaranteed, proven, clinically, any %/bpm/seconds
  gain, "125 studies" (or any study count), "university", before/after imagery, testimonials, "CrossFit" (say
  "functional fitness"), "AI form check".
- **Allowed:** "one focus", "adapts to your log", "every change shows its reason/source", "you approve every change",
  "free during the beta", "short sessions alongside your gym programming".
- No faces or bodies-as-results in creatives. No claims about the viewer's body ("Are you tired of…").

## Ad sets (one per advertised program, D2)
Base URL pattern: `https://terav.fit/programs/<slug>/?utm_source=<meta|google>&utm_medium=paid&utm_campaign=<campaign>&utm_content=<ad>`

| Set | Landing URL | utm_campaign | Meta detailed targeting (interests) | Google keywords (phrase match) |
|-----|-------------|--------------|-------------------------------------|--------------------------------|
| **pullup** | `https://terav.fit/programs/first-strict-pullup/?utm_source={meta\|google}&utm_medium=paid&utm_campaign=pullup-v1&utm_content={ad}` | `pullup-v1` | Calisthenics, Bodyweight exercise, Functional training, Gymnastics | "first pull up", "how to do a pull up", "pull up progression", "strict pull up program" |
| **handstand** | `https://terav.fit/programs/handstand-walk/?utm_source={meta\|google}&utm_medium=paid&utm_campaign=handstand-v1&utm_content={ad}` | `handstand-v1` | Calisthenics, Gymnastics, Handstand, Functional training | "handstand walk progression", "learn handstand walk", "handstand walk drills" |
| **strengthcardio** | `https://terav.fit/programs/concurrent-strength-maintenance/?utm_source={meta\|google}&utm_medium=paid&utm_campaign=strengthcardio-v1&utm_content={ad}` | `strengthcardio-v1` | Functional training, Weight training, Hybrid training, HYROX (if offered) | "keep strength while running", "strength and cardio plan", "concurrent training program" |

`utm_content` values: Meta `m-hA-tA`, `m-hB-tB` (headline/text letters below); Google `g-rsa1`. `{meta|google}` is
replaced by the platform, not left literal.

**Google negative keywords (campaign level):** pain, injury, rehab, physio, physiotherapy, hip, shoulder pain, knee,
back pain, surgery, kipping, free trial, jobs, app store, reddit, youtube, video, PDF, template, near me, gym membership.
**Google:** Search only (no Display/Search Partners), manual CPC or "maximise clicks" with a €2 cap, 3 phrase-match
keywords per ad group, schedule all days. Expect few clicks at €50; that is enough to see whether the page converts.

## Copy (2 headlines + 2 texts per Meta ad set for an A/B)
Character counts checked (Meta headline ≤40, Google headline ≤30, Google description ≤90).

**Meta headlines**
- Shared: "Get better at one thing" (23) · "Training that adapts to your log" (32) · "Free during the beta" (20)
- pullup: "Pull-up progressions, with sources" (34) · "Build toward your first pull-up" (31)
- handstand: "Handstand walk, step by step" (28) · "Train one skill until it sticks" (31)
- strengthcardio: "Add cardio. Keep your strength." (31) · "A focused plan for your engine" (30)

**Meta primary texts** (125 characters shows before "…more"; the first sentence carries the point)
- **A:** "Terav builds one focus (your engine, a lift or a skill) around your existing week. You log, it suggests, you accept."
- **B:** "Skill work with the reasons shown: each change names the study or the log signal behind it. Free during the beta."
- **C:** "Pick a focus: pull-ups, handstand walk, or strength + cardio. Short sessions that sit alongside your gym programming."

Pairing: headline A (`hA`) = first headline of the set, headline B (`hB`) = second; text A/B for `tA`/`tB`. Set C aside
as the spare. Meta CTA button: **Sign Up**. Display link: `terav.fit`. Description line: "Free during the beta".

**Google RSA, per ad group** (15 headline slots; pins none; 4 descriptions)
- Headlines (≤30): "Get better at one thing" · "Adapts to your training log" · "Free during the beta" ·
  "Every change shows why" · "You approve every change" · "Start free today" and the set's own:
  - pullup: "Pull-up progressions" · "Your first strict pull-up"
  - handstand: "Handstand walk, step by step" · "Train one skill till it sticks"
  - strengthcardio: "Add cardio, keep strength" · "Focused strength + cardio"
- Descriptions (≤90):
  - "One focus, built around your training week. Every change shows its reason. Free beta." (85)
  - "Log your sessions; Terav suggests the next step and you approve it. Start free today." (85)
  - "Pick a skill or a lift. Short sessions alongside your gym programming. Free beta." (81)
- Final URL: the set's landing URL with `utm_source=google`. Path fields: `training` / `<pull-ups|handstand|strength-cardio>`.

## Creative (no stock before/after, no faces)
Rendered: `ads/creatives/<set>-1080x1080.png` and `<set>-1080x1920.png` (script `ads/make-creatives.mjs`, brand-colour
headline cards, one per set; headline = the set's first Meta headline, plus "Free during the beta" and the wordmark).
These are **valid to upload as they are**. Stories/Reels safe zone is respected (text sits between 250 px and 1670 px).

Optional upgrade, after lane 2b's Today cleanup is live (not blocking): composite a phone frame with a fresh Today
screenshot (`launch-gaps.spec.ts` → `screens/gaps/C-viewport-393/01-today-top.png`) under the headline, one per set.
Another option: the follow-along figure rig (`dev/active/exercise-media`) as a 6–10 s loop for pull-up and handstand.
Check any screenshot against the banned list first (no hip/rehab text, no numbers presented as results).

## Pre-upload checklist (owner, M-05)
1. Open each landing URL on a phone: hero says "Improve your weakest area. Keep your training.", the "Start free" button
   goes to the app sign-up with the `utm_*` still on the URL.
2. Meta: special ad category = none (not health/financial); say "No" to Advantage+ audience; set 18+; the 3 ad sets above;
   budget €100 split evenly; run 5–7 days. Review can take up to 24 h.
3. Google: Search campaign, €50 total, the keyword groups above, negatives added.
4. Do not upload before the M-04 review panel's fixes are applied.

## Decision rule after 3–5 days
- Pause any ad with CTR < 0.5% after 1,000 impressions.
- Compare cost per sign-up and the activation rate (first session logged) between sets.
- €150 can't measure conversion to paid; it shows whether cold traffic signs up and activates at all.
