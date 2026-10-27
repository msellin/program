# Supabase auth email templates (SG-06)

Branded HTML for the two auth emails. Applied through the Management API
(`PATCH /v1/projects/{ref}/config/auth`), not by the deploy.

| File | API field | Subject field |
|---|---|---|
| `confirm-signup.html` | `mailer_templates_confirmation_content` | `mailer_subjects_confirmation` = `Confirm your Terav email` |
| `recovery.html` | `mailer_templates_recovery_content` | `mailer_subjects_recovery` = `Reset your Terav password` |

Both use only `{{ .ConfirmationURL }}`. That URL carries the `emailRedirectTo` the app sets,
so the `?next=` program deep link survives the confirm click. **The Supabase Redirect URLs
allow-list must permit `https://app.terav.fit/sign-in?next=...`** (add `https://app.terav.fit/**`).
Sender is `no-reply@terav.fit` via Resend SMTP (see `dev/scripts/hackathon-auth-config.sh`).
