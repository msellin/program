#!/usr/bin/env bash
#
# Gate 4 — prove the RUNTIME Pages bindings exist on the live project.
#
# Gates 1-3 cover the suite, the built artifact's build-time env, and whether
# production serves that exact artifact. None of them can see a Cloudflare
# Pages project binding: those are read by `functions/` via `env.*` at REQUEST
# time, so they are not in the bundle and the artifact grep has nothing to
# find. All three gates pass green with every one of them missing, and the
# failure surfaces on a real user's first tap.
#
# The sharp one is SUPABASE_SERVICE_ROLE_KEY: without it
# `DELETE /api/delete-account` returns 500 and account deletion — a GDPR
# obligation on Article 9 health data — does not happen. It fails safe but it
# fails silently, and `runtime-env.test.ts` could only ever assert that the
# list a human checks against is the right list, never that anyone checked.
#
# The expected list is DERIVED, never typed. It is whatever `functions/`
# actually reads, by the same scan `runtime-env.test.ts` uses — so a new
# binding added to a function is covered by this gate on the same commit,
# without anyone remembering to add it here.
#
# Names only. `wrangler pages secret list` reports "Value Encrypted" and never
# the value; nothing in this script can print a secret because nothing in it
# ever holds one.
#
# Requires CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID (CI), or a
# `wrangler login` session (laptop).
set -euo pipefail

PROJECT="${1:-program-v2}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FUNCTIONS="$ROOT/next-app/functions"

[ -d "$FUNCTIONS" ] || { echo "no functions/ at $FUNCTIONS — did the directory move?"; exit 1; }

expected=$(grep -rhoE "\benv\.[A-Z_][A-Z0-9_]*" "$FUNCTIONS" | sed 's/env\.//' | sort -u)
[ -n "$expected" ] || { echo "scanned functions/ and found no env reads — the scan is broken, not the config."; exit 1; }

echo "Runtime bindings required by functions/ (derived):"
echo "$expected" | sed 's/^/  /'
echo

bound=$(npx --yes wrangler@4 pages secret list --project-name "$PROJECT" 2>/dev/null \
  | grep -oE "^[[:space:]]*-[[:space:]]*[A-Z_][A-Z0-9_]*:" \
  | tr -d ' -:' || true)

[ -n "$bound" ] || {
  echo "Could not read bindings for project '$PROJECT'."
  echo "Either the token lacks pages:read, or the project name is wrong."
  exit 1
}

fail=0
while read -r name; do
  if echo "$bound" | grep -qx "$name"; then
    echo "  ok       $name"
  else
    echo "  MISSING  $name — bound on no environment of $PROJECT"
    fail=1
  fi
done <<< "$expected"

echo
if [ "$fail" -ne 0 ]; then
  echo "Refusing to deploy: a Pages function reads a binding production does not have."
  echo "Set it with: npx wrangler@4 pages secret put <NAME> --project-name $PROJECT"
  exit 1
fi
echo "All runtime bindings present on $PROJECT."
