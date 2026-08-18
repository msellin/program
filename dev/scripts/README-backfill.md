# KV → Postgres backfill (Phase 2D)

Iterates every Supabase auth user, reads their KV blob (from Cloudflare), writes
it into `public.user_states` (+ today's snapshot). Safe to re-run: uses upsert
semantics on `user_states` and `(user_id, snapshot_date)` dedupe on snapshots.

## Prereqs

1. Phase 2A SQL migration must be applied (`user_states` + `user_state_snapshots`
   tables + RLS policies exist).
2. You have Node 20+ and `tsx` (`npx tsx …` works, no install needed).
3. Env vars set (see below).

## Env vars

**Supabase (get from Dashboard → Project Settings → API):**
- `SUPABASE_URL` — `https://<project-ref>.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` — the `service_role` JWT. **Bypasses RLS.**
  Never commit. Never paste in a browser.

**Cloudflare (get from Dashboard → Workers & Pages → KV → your `STORE`
namespace):**
- `KV_ACCOUNT_ID` — your Cloudflare account ID (top-right of the dashboard).
- `KV_NAMESPACE_ID` — the namespace ID for the `STORE` KV binding.
- `CF_API_TOKEN` — a Cloudflare API token with `Workers KV Storage:Read`
  permission scoped to your account. Create at
  https://dash.cloudflare.com/profile/api-tokens.

## Usage

```bash
cd /Users/margussellin/www/program

# Dry-run: no writes, just report which users have KV state
export SUPABASE_URL=https://<ref>.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<jwt>
export KV_ACCOUNT_ID=<id>
export KV_NAMESPACE_ID=<id>
export CF_API_TOKEN=<token>
npx tsx dev/scripts/backfill-kv-to-postgres.ts

# Apply (writes to Postgres):
npx tsx dev/scripts/backfill-kv-to-postgres.ts --commit

# Migrate a single user only (safest first-run pattern):
npx tsx dev/scripts/backfill-kv-to-postgres.ts --user margus@dolmit.com --commit
```

## What it does per user

1. Reads Cloudflare KV at `user-email:<email>:v2`. Falls back to legacy
   `user:<uid>:v2` if the email-keyed entry is empty.
2. Parses the JSON. Any parse error is reported and skipped.
3. Upserts `public.user_states(user_id, store, updated_at)`. The store is
   written as-is — no schema massaging. `updated_at` uses the store's own
   value if present, else `Date.now()`.
4. Upserts today's snapshot into `public.user_state_snapshots`.

## What it does NOT do

- Doesn't touch KV. Original KV blobs stay intact for rollback.
- Doesn't flip any user's `feature_flags.postgres_store` — that's Phase 2E
  (cutover).
- Doesn't migrate KV snapshots. Only the live state + a fresh today's
  snapshot. Historical KV snapshots stay in KV; if we ever need them, they're
  read-only accessible via the Pages Function until 2F.
- Doesn't wipe or delete anything.

## Rollback

Trivial: if a migrated user reports issues, flip
`feature_flags.postgres_store` off for that user (or leave it off entirely).
KV blob is intact and the adapter falls back to KV cleanly.
