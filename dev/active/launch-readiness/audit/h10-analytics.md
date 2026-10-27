# H10 analytics and conversion tracking (2026-10-27, read-only)

**Now:** no analytics, pixels or ad tags exist in landing/ or next-app/src. Only Sentry (errors; replay on error only, sendDefaultPii false, next-app/sentry.client.config.ts:40-55) and a no-cookie YouTube embed.
**Privacy promises:** landing/src/app/privacy/page.tsx:39-44 says "zero analytics or tracking scripts during beta" and "no third-party advertising trackers". next-app/src/app/legal/privacy/page.tsx "Cookies & tracking" says "No analytics tools are active" and "We don't use your data for advertising". Both are true today; any pixel makes both false.
**No trial exists in code.** Sign-up is free beta (landing en.ts "Start free"; Hero "Beta is free"). Conversion = sign-up confirmed (next-app/src/app/(auth)/sign-up/page.tsx) then intake complete.

- [BLOCKS-ADS-TODAY] No conversion event anywhere, and no utm/click-id capture. Ads cannot be measured.
- [BLOCKS-ADS-TODAY] Any pixel requires editing both privacy pages and listing the recipient as a sub-processor, in the same commit.
- [BLOCKS-ADS-TODAY] Health data: intake and symptom pages are Art. 9 data. Meta Business Tools terms restrict sharing data "based on health information", and CAPI is not an exemption (per third-party guides, verify at facebook.com/legal/terms/businesstools). No pixel on app pages; any event name must not reveal the program (e.g. anterior-hip-rebuild, /check/hip).
- [BLOCKS-ADS-TODAY] Pixel/gtag needs script-src and connect-src changes in next-app/public/_headers:6 (script-src is 'self' only; csp.test.ts guards it).
- [BEFORE-SCALE] Google Ads in EEA needs Consent Mode v2 (ad_storage, ad_user_data, ad_personalization, analytics_storage) defaulting to denied, plus a CMP banner. Source: https://www.auditsocials.com/blog/google-consent-mode-v2-enforcement-2026-eea-advertisers-remarketing-basic-advanced-consent (secondary; Google docs not fetched).
- [BEFORE-SCALE] Google Ads health-category policy not checked; confirm before optimizing on sign-up.
- [LATER] Paid tier and trial event: Paddle not wired (legal page says "when paid tier launches").

**Options**
A. Cloudflare Web Analytics (cookieless) + first-party attribution. Files: layout beacon in next-app and landing, CSP for static.cloudflareinsights.com / cloudflareinsights.com, a utm capture at sign-up stored on user_profiles, one Pages Function or Supabase row for the sign-up event. Banner: not needed per vendor claim (verify with counsel). Hours: 2-3. Gives funnel and campaign counts; no ad-platform optimization.
B. Meta Pixel + CAPI via a Pages Function. Files: both layouts, functions/api/capi.ts, CSP (connect.facebook.net, graph.facebook.com), both privacy pages, banner. Hashed email in CAPI is personal data. Banner required (ePrivacy). Hours: 8-12. Highest risk given the health restriction.
C. Google Ads gtag + Consent Mode v2. Files: gtag snippet with denied defaults, CMP banner, privacy pages, CSP, conversion label on sign-up. Banner required. Hours: 5-7.

**Recommendation for today: A.** Measure landing to sign-up to intake with cookieless analytics and a utm stored with the sign-up row; read ad-level conversions from sign-up counts by utm_campaign. Before spend scales, add C behind a real CMP after legal review. Skip B for this product.

Not checked: live site headers and what Cloudflare Pages actually serves; Meta and Google current policy text (only third-party summaries); Supabase schema for user_profiles; Paddle state; counsel review.
