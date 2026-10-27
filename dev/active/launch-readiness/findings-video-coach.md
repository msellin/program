# AI video coach as a paid-tier feature: verdict (2026-10-27)

Owner hypothesis: an AI video coach is a reason to pay. Sources: `market/video-coach-{ai-apps,human-review,skill-accuracy}.md`
(3 Haiku agents, all low confidence), plus the existing design in `dev/active/video-analysis/`.

**Verdict: BUILD LATER. Not a launch feature, and not the reason someone pays on day one.** Evidence: weak.

- **People do pay for form feedback**, but as a counted quota from a human coach (for example
  $75/month for 2 reviews a week vs $125/month for 4, or about $25 for a one-off review). Free r/formcheck
  (~151k members) caps the value of generic feedback. *(human-review)*
- **No consumer AI form-checker has an independent accuracy test on pull-ups or muscle-ups.** The one
  validation found measures rep counting, not form. Squat knee-angle offsets of 10–15° are reported.
  Nothing validates MediaPipe on inversions. *(ai-apps, skill-accuracy)*
- **The field is churning.** Kemtai appears to have moved to clinical use. AI-form apps price at about
  $10–19/month, the same band as Terav. *(ai-apps)*
- **Terav's own design already answers the accuracy risk:** "margins, not verdicts", error bands, on-device
  processing, user-requested only. The Phase 0 spike passed on HSPU (100% detection) but squat framing was
  weak (66%). Phases 1–4 are unbuilt: weeks of work, not a sprint item.

**What to do with it:**
- **Launch / ads:** do not advertise it, and do not put it in the paid tier yet. Ads must not claim
  "AI form check" or "prevents injury".
- **Before scale:** use it as the *second* paid reason once billing works, starting with the strict pull-up
  (skill-first, as `video-analysis/HANDOVER.md` says). Validate it against the owner's own clips first.
- **A cheap test of demand now:** list "Video feedback (coming)" on the pricing page and count clicks.
  That is a waitlist signal, not a promise.
