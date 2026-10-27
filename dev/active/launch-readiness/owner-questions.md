# Questions to send (owner sends; the agent drafted them 2026-10-27)

## To a lawyer (Estonia / EU, health and consumer data). Before scaling, not before the free beta
Context: Terav is a training web app (not a medical device) for athletes improving one skill or lift. Free beta now,
with a paid subscription via Stripe later. Supabase (EU?) stores accounts, training logs and, if the user reports it,
pain/symptom scores; these are GDPR Art. 9 data.
1. Is our explicit-consent flow (checkbox at sign-up, separate from the terms; Google sign-up blocked until it is
   ticked) enough under Art. 9(2)(a)? Do we need a DPIA now, at ~100 users?
2. If public programs record pain only when the user reports it (no daily questionnaire), does that change the
   assessment?
3. Can we run Cloudflare Web Analytics (cookieless, no personal data stored per the vendor) without a consent
   banner under ePrivacy / Estonian law?
4. Our processors: Supabase, Cloudflare, Resend, Sentry, Google (OAuth), later Stripe. What must the privacy policy
   say about international transfers?
5. Subscription terms for EU consumers: 14-day withdrawal for digital services (immediate access waiver wording),
   auto-renewal notice, a 14-day free trial. What exact wording?
6. A minimum age: 16 (Estonian digital consent is believed to be 13). Is 16 right for health-adjacent data?
7. Do our disclaimers ("training template, not medical advice; see a clinician for persistent pain") suffice, given
   we never diagnose?

## To the accountant. Before Stripe goes live
Terav will sell a €9.99/month or €89/year digital subscription to consumers worldwide via Stripe (not a merchant of
record; Stripe Tax calculates the tax).
1. Below €10k/year of cross-border EU B2C sales, do we charge Estonian VAT to all EU consumers, and when must we
   register for OSS?
2. UK, US states, Norway, Switzerland, Australia: at what thresholds must we register, and should we block any
   country at launch?
3. Does the company need anything new (VAT number changes, bookkeeping for Stripe payouts, a monthly Stripe Tax
   report)?
