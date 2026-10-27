# Video coach: smartphone pose accuracy and claim risk (accessed 2026-10-27)

## Facts
- No validation study of MediaPipe/BlazePose on pull-ups, inversions or handstands found. Searches returned squat, gait and barbell-lift studies only. Not found.
- arXiv 2503.14760 (fetched): MediaPipe heavy (33 joints) vs marker MoCap and IMUs, 10 participants, sit-to-stand/squat/squat-to-box. Text gives no numeric bias or limits of agreement (only in figures). MediaPipe min knee angle closer to IMU than max angle. Squat-to-box: MediaPipe starts/ends "roughly 15°" below reference. Failure modes: self-occlusion, jitter, clothing, lighting; video at 30 Hz. https://arxiv.org/html/2503.14760
- Clinical single-arm study (MDPI Healthcare 14/4/482): reports 95.8% accuracy and ICC 0.91 vs physiotherapist; quasi-experimental. Full text returned 403, so figures are from search snippet only. https://www.mdpi.com/2227-9032/14/4/482
- MDPI Biomechanics 6/1/1 (2D squat hip/knee vs marker): sample and error values not retrieved (403). https://www.mdpi.com/2673-7078/6/1/1
- 2026 squat knee flexion conference paper: residual -13.9° ± 15.1°, LoA [-43.5°, 15.5°]. Found in search snippet only, not fetched; source URL not captured. Not verified.
- CrossFit: no official Open/Games AI-judging policy found. UNC Charlotte 2020 OpenPose rep-counting prototype (25 videos, arXiv 2005.03194). InData Labs vendor claim of a 2021 CrossFit competition deployment, self-reported. https://arxiv.org/pdf/2005.03194
- Regulatory: FTC v. Pact (Sept 2017), not AI: app charged users for missed fitness goals and misled on rewards; ~$940k refunds. Fetched: https://www.ftc.gov/news-events/news/press-releases/2017/09/mobile-app-settles-ftc-allegations-it-failed-deliver-promised-cash-rewards-meeting-exercise-diet
- No FTC or ASA action on fitness-app AI form or injury-prevention claims found. Not found.
- Meta: vendor blogs say the personal-attributes policy bars ads implying knowledge of a viewer's fitness level or health. Meta's own policy text not retrieved. https://www.magier.com/blog/meta-ads-creative-best-practices-for-health-and-fitness-brands (secondary)
- Apple NAD (2025): Apple discontinued the "More Personal Siri" ad after NAD review of AI claims. Source: search snippet only (URL not captured).

## What it means for Terav
- Claim "measures your rep / reports margins" is the defensible frame. Joint-angle error of 10-15° on squats is already larger than a typical pass/fail margin, so "pass/fail" wording is unsupported.
- Inversion and pull-up occlusion is untested in retrieved literature. Any pull-up claim needs own validation against a reference.
- Avoid "prevents injury" or "AI form coach" wording. No retrieved source supports it, and it invites the same scrutiny as AI claims in Apple's NAD case.
- Validate on own filmed sets with a stated error band before any paid tier is priced on it.
- Keep the physio referral visible; the tool is not a clinical measurement.

## Verdict signal
build-later

## Confidence
Low. Only two full-text sources were retrieved, the key MDPI studies returned 403, and no pull-up or inversion validation was found. Regulatory findings rest on one FTC case and vendor blogs.
