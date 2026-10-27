# H11 billing and entitlement code audit (2026-10-27, read-only)

Verdict: no billing code exists. The only paid-tier logic is one hardcoded launch const.

- [BLOCKS-ADS-TODAY] No checkout, webhook, entitlement check or cancel link. Grep for paddle/stripe/lemon/checkout/subscription/isPro/paywall hits only privacy copy (next-app/src/app/legal/privacy/page.tsx:121,135, "when paid tier launches"). next-app/functions/api/ has only admin/*, delete-account.ts, feedback.ts. No webhook route.
- [BLOCKS-ADS-TODAY] Ads need a privacy decision, not billing. Superseded note says the live privacy page states no analytics tools are active in beta. Ad pixels or cookies on app.terav.fit with health data would contradict that and need a consent flow first.
- [BLOCKS-ADS-TODAY] No waitlist exists. Zero hits for waitlist/pricing/9.99 in landing/src and next-app/src. A waitlist form is a small build.
- [BEFORE-SCALE] Free-tier cap is `const MULTI_MAIN_ENABLED = false;` at next-app/src/lib/useStore.ts:1064. It is a code const, not a remote flag, so changing it needs a deploy. Its effect (replace primary on add) is at useStore.ts:1066-1078.
- [BEFORE-SCALE] Gating is client-side only. No server-side check on program writes was found.
- [BEFORE-SCALE] Admin override is the only role check: ADMIN_EMAILS in functions/api/admin/*.ts and delete-account.ts. The superseded note's "super-admins bypass" is not visible in the useStore branch.
- [LATER] `tier` / `trial_ends_at` are declared inert in next-app/src/lib/schemas.ts:1884-1885 (comment 1875). data-integrity.test.ts:1840-1844 lists them as knowingly inert.
- [LATER] Stored tier shape exists only in dev/active/saas-launch/sql/001_user_profiles.sql:29-32 (tier, trial_ends_at, paddle_customer_id, paddle_subscription_status). It is not in supabase/migrations/ (only user_states and service_role_grants). Nothing writes it.
- Gated features today: none by tier. The only live gate is the second program. Full history, PDF export and AI narrative have no gating code.
- Minimum pieces for "14-day trial then pay":
  1. Checkout: Paddle product with trial price, link or overlay from next-app/src/app/profile/page.tsx (new component).
  2. Webhook: new next-app/functions/api/webhooks/paddle.ts, verifies the Paddle signature, writes status via service role (SUPABASE_SERVICE_ROLE_KEY is already bound). A new secret must be added to dev/scripts/check-runtime-bindings.sh and runtime-env.test.ts.
  3. Gate: replace the MULTI_MAIN_ENABLED branch in useStore.ts:1064 with an entitlement read, and enforce it server-side too.
  4. Cancel: Paddle customer-portal link on profile/page.tsx. Trial end and cancel arrive via the webhook, no cron.
  5. Trial and receipt email: Resend via functions/api/admin/notify.ts pattern.
- Ads as free open beta with waitlist: yes, once the privacy and consent item is cleared. It skips checkout, webhook, entitlement, cancel, trial email, Paddle/VAT setup and refund terms. The free beta needs no billing code.
Not checked: live Supabase tables (whether user_profiles exists in prod), Paddle account, en.ts pricing copy, legal terms and refund wording, PDF/AI gating, wrangler bindings on the live project.
