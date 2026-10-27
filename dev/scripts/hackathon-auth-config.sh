#!/usr/bin/env bash
# Hackathon kickoff (O-01): open Supabase sign-ups for the free beta and send
# auth email through Resend instead of Supabase's rate-limited built-in mailer.
#
# Written 2026-10-27 by the launch-readiness audit; NOT run there. The owner
# provides the tokens and approves the change.
#
#   SUPABASE_ACCESS_TOKEN  personal access token: https://supabase.com/dashboard/account/tokens
#   RESEND_SMTP_KEY        a Resend API key with sending access for terav.fit
#                          (the domain must be verified in Resend first)
#   TURNSTILE_SECRET       optional; only with CAPTCHA=1, and only AFTER the sign-up
#                          page sends a Turnstile token (SG-08). Enabling captcha
#                          before the widget ships breaks every sign-up.
#
# Usage:
#   dev/scripts/hackathon-auth-config.sh show     # print the current values (secrets masked)
#   dev/scripts/hackathon-auth-config.sh apply    # show the diff, ask, then PATCH
#
# Fields per https://supabase.com/docs/guides/auth/auth-smtp (Management API
# PATCH /v1/projects/{ref}/config/auth). Only keys present in the current GET
# are sent, so a renamed field fails loudly instead of being silently ignored.

set -euo pipefail
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MODE="${1:-show}"

: "${SUPABASE_ACCESS_TOKEN:?set SUPABASE_ACCESS_TOKEN}"
URL="$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' "$REPO_ROOT/next-app/.env.local" | cut -d= -f2- | tr -d '"')"
PROJECT_REF="$(echo "$URL" | sed -E 's#https://([^.]+)\..*#\1#')"
API="https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth"

current="$(curl -fsS "$API" -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN")"

desired="$(python3 - <<EOF
import json, os
d = {
  "disable_signup": False,          # sign-ups ON (the only gate today)
  "external_email_enabled": True,
  "mailer_autoconfirm": False,      # D6: confirm-email ON
  "smtp_admin_email": "no-reply@terav.fit",
  "smtp_host": "smtp.resend.com",
  "smtp_port": "465",
  "smtp_user": "resend",
  "smtp_pass": os.environ.get("RESEND_SMTP_KEY", ""),
  "smtp_sender_name": "Terav",
  "rate_limit_email_sent": 100,     # per hour, after custom SMTP is on
}
if os.environ.get("CAPTCHA") == "1":
  d.update({
    "security_captcha_enabled": True,
    "security_captcha_provider": "turnstile",
    "security_captcha_secret": os.environ.get("TURNSTILE_SECRET", ""),
  })
print(json.dumps(d))
EOF
)"

python3 - "$MODE" "$current" "$desired" <<'EOF'
import json, sys
mode, cur, want = sys.argv[1], json.loads(sys.argv[2]), json.loads(sys.argv[3])
secret = lambda k: any(s in k for s in ("pass", "secret", "key"))
mask = lambda k, v: ("***set***" if v else "(empty)") if secret(k) else v
missing = [k for k in want if k not in cur]
print(f"{'key':32} {'current':28} -> desired")
for k, v in want.items():
    print(f"{k:32} {str(mask(k, cur.get(k, 'MISSING'))):28} -> {mask(k, v)}")
if missing:
    print("\nThese keys are not in the current config (renamed?):", ", ".join(missing))
    print("Check the Management API reference before applying.")
    sys.exit(2 if mode == "apply" else 0)
EOF

[ "$MODE" = "apply" ] || exit 0
: "${RESEND_SMTP_KEY:?set RESEND_SMTP_KEY before apply}"
read -r -p "Apply these auth settings to project $PROJECT_REF? [y/N] " ok
[ "$ok" = "y" ] || { echo "Aborted."; exit 1; }
curl -fsS -X PATCH "$API" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$desired" >/dev/null
echo "Applied. Next: one real sign-up from a phone (O-02)."
