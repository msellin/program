# Money + launch engineering (2026-10-27)

## 1. Recommendation
- Ads today sell a FREE open beta (+ "founding member price" opt-in), not a paid trial. Zero billing code, MoR approval same-day unconfirmed (Paddle async review, health-adjacent ruling unknown), and a card-less sign-up is the honest metric for EUR 100-200.
- Smoke test measures sign-up rate per goal/creative and activation (first session logged). It cannot measure willingness to pay; add a one-tap "founding price EUR 5.99/mo locked" intent click (stored, no charge) as a weak WTP proxy.
- Plan later: EUR 9.99/mo, EUR 89/yr (consider 69-79), 14d card-up-front trial; apply to Paddle (fallback Polar) TODAY in parallel, in writing re "training app is not medical advice".

## 2. BLOCKS-ADS-TODAY (ordered)
1. Owner: Supabase Auth: signups ON, custom SMTP via Resend (domain verified), rate limits, Bot protection/captcha; decide Confirm-email (on = best hygiene, costs ~20-30% drop; if off, admin gate trusting JWT email is unsafe: ADMIN_EMAILS match needs confirmed email). Run one real sign-up from a phone. [owner, S-M]
2. Carry the program: read `?next=` on `(auth)/sign-up/page.tsx` (emailRedirectTo at L37/L76 hard-coded), pass through to `/sign-in?next=`; same for Google OAuth button (redirectTo) and the sign-in "Sign up" link (`sign-in/page.tsx:215`). Allowlist only same-origin relative paths; add the redirect URL in Supabase URL config. [M]
3. Landing CTAs (`Hero.tsx:81`, `BetaCTA.tsx:22`) to `/sign-up?next=/programs/<slug>/intake` per ad landing; fix copy: "no signup wall" (Hero:96), "closed beta" (terms:27), `auth-errors.ts` invite-only remap. [S]
4. UTM + click-id capture: landing writes utm_*/fbclid/gclid to first-party storage, forwards on CTA, sign-up puts them in `options.data` (user metadata). Query via Supabase SQL, no pixel. [M]
5. Measurement: Cloudflare Web Analytics toggle on both Pages projects (owner; CSP in `next-app/public/_headers` adds static.cloudflareinsights.com + cloudflareinsights.com; `csp.test.ts` update) and update both privacy pages same commit. Events = SQL: sign_up (auth.users + metadata), activation (first log in `user_states`). No Meta/Google pixel today (privacy pages promise none; Art. 9 data; Meta health-data restriction). [S-M]
6. Ad-side: use platform-native lead metrics (link clicks, landing views) + campaign UTMs; Google needs Consent Mode v2/CMP only if tag used, so skip. Read Meta/Google health + personal-attribute policy; copy = "train around it", no condition claims. [owner, S]
7. Sign-up error copy for confirm-email-pending, rate-limited (429), existing email, mail delivery failure; resend path visible. [S]
8. Abuse: Supabase captcha (Turnstile) wired in sign-up (`captchaToken` in signUp call) = M; if skipped, cap ad spend and watch daily. Rate-limit `functions/api/feedback.ts` (sends Resend mail). [M]
9. Verify `user_profiles` trigger applied in prod (only in dev/active/saas-launch/sql) and consent is recorded. [owner S]

## 3. Billing build (BEFORE-SCALE, ~2-3 dev days)
- Checkout: Paddle overlay/link, new component on `next-app/src/app/profile/page.tsx` (M).
- Webhook: `next-app/functions/api/webhooks/paddle.ts`, verify signature, write tier/status via service role to a migrated `user_profiles` (tier, trial_ends_at, paddle ids); add secret to `dev/scripts/check-runtime-bindings.sh` + `runtime-env.test.ts` (M).
- Gate: replace `MULTI_MAIN_ENABLED` (useStore.ts:1064) with entitlement read; enforce server-side too (M).
- Cancel: Paddle portal link on profile (S). Trial-end/receipt email via Resend (S-M). Refund + terms copy (S).
- Free/paid line: free = one active focus + core sessions and symptom check; paid = second concurrent program, full history/PDF export, AI narrative; video coach later paid reason. Never gate the safety check.

## 4. Tech risks, 10-500 users
- [BEFORE-SCALE] Silent write loss: `postgres-adapter.ts:89/163` drops failed pushes, no retry/Sentry.
- [BEFORE-SCALE] No Sentry in `functions/`; no function rate limits.
- [BEFORE-SCALE] Supabase plan: no automated backups on free; 500 MB cap, whole-jsonb rewrite per 2s push.
- [BEFORE-SCALE] Admin endpoints full-scan `user_states` (fine at hundreds).
- [BEFORE-SCALE] 9-14 required intake answers vs "two minutes" promise; safety-block dead ends for cold traffic.
- [LATER] Anon revoke grants; Supabase-down UI state unchecked.

## 5. Verified vs Haiku
- Verified in code: sign-up emailRedirectTo hard-coded (L37, L76), no `?next` read; signup_disabled remap in auth-errors.ts; CSP script-src 'self' 'unsafe-inline' in _headers; functions/api has only admin, delete-account, feedback (no billing).
- From Haiku, unverified: dashboard state (toggle, SMTP, captcha, confirm), Paddle/Polar approval time and Estonia payouts, Meta/Google/Paddle policy text, user_profiles trigger applied, Cloudflare Analytics needing no banner (check with counsel), market numbers (weak, no demand test).


> **Superseded 2026-10-27 (owner):** billing provider is **Stripe** (existing account, separate Terav account, Stripe Tax). Paddle/Polar are no longer the plan. See `launch-plan.md` O5, C and D9.
