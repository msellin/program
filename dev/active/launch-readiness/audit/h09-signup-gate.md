# H09 sign-up gate (read-only, 2026-10-27)
**Verdict:** No invite code, allowlist or waitlist in code. The gate is the Supabase dashboard "allow new users to sign up" toggle (owner-only); the app only remaps its error to "closed beta, invite-only" copy.

| Gate | Where | To open |
|---|---|---|
| Signup toggle (email + Google) | dashboard; copy remap `next-app/src/lib/auth-errors.ts:26-33` | Owner flips dashboard |
| Email confirm | `sign-up/page.tsx:87-88`, resend `sign-in/page.tsx:81` | Dashboard "Confirm email" off, or accept friction |
| Auth mailer | Supabase SMTP (Resend only in `functions/api/feedback.ts:110`, `admin/notify.ts`) | Dashboard custom SMTP; built-in mailer is limited (Supabase docs, not verified) |
| Form gates | `sign-up/page.tsx:53-64` (terms, health consent, pw>=8) | UI only, not an allowlist |
| Captcha / rate limit | none in repo (grep 0 hits) | Dashboard, owner-only, not checked |
| Google OAuth | `GoogleAuthButton.tsx:44-46` | Same dashboard toggle |
| ADMIN_EMAILS, super-admin, MULTI_MAIN_ENABLED, features.ts | `functions/api/admin/*.ts`, `lib/super-admin.ts`, `useStore.ts:1064`, `lib/features.ts` | Not sign-up gates |

**New-user state:** `persistence/postgres-adapter.ts:65-66` returns null with no `user_states` row, so the app starts empty; the row is created on first write (`:85`). Consent lives only in `raw_user_meta_data` (`sign-up/page.tsx:72-75`). The `user_profiles` trigger is only in `dev/active/saas-launch/sql/001_user_profiles.sql:48-66`, not `supabase/migrations`; applied status unknown.

**Issues**
- [BLOCKS-ADS-TODAY] Confirm the Supabase signup toggle is ON and run one real signup (owner-only).
- [BLOCKS-ADS-TODAY] Landing sends paid traffic to `/sign-up` (`landing/.../Hero.tsx:81`, `BetaCTA.tsx:22`) and promises "no signup wall" (`Hero.tsx:96`); terms say "closed beta" (`legal/terms/page.tsx:27`). Fix copy before spend.
- [BLOCKS-ADS-TODAY] With confirm-email on, ad signups depend on the mailer; verify delivery first.
- [BEFORE-SCALE] No captcha or rate limit in code; enable Supabase Bot protection and rate limits.
- [BEFORE-SCALE] Consent evidence sits in auth metadata; verify `user_profiles` trigger status (Art. 9 record).
- [BEFORE-SCALE] Test the new-user path end to end on a real or staging account (not run here).
- [LATER] Remove closed-beta remap copy in `auth-errors.ts` once open.

Not checked: Supabase dashboard (signup toggle, confirm email, SMTP, captcha, rate limits), trigger applied state, live signup, CI/Cloudflare secrets.
