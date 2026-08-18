# KV → Postgres migration plan (2026-08-18)

**Goal:** move user-state storage from Cloudflare KV to Supabase Postgres via
the `PersistenceAdapter` interface that already exists. Same Supabase project
as auth — no cross-service latency, native RLS binding to `auth.uid()`, direct
client access (no Pages Function hop needed).

## Decisions locked

1. **JSONB blob, not normalized tables.** Same shape as the current KV blob
   → zero data-migration risk, byte-identical semantics. Normalizing gives us
   SQL analytics later but that's a distinct project.
2. **Direct client access via `@supabase/supabase-js`.** No Pages Function
   hop. RLS binds to `auth.uid()` so a user can only read/write their own
   row. Same package that already ships in the app (`@supabase/supabase-js
   ^2.109.0`). Eliminates the `functions/api/state.ts` maintenance burden
   long-term.
3. **Snapshot retention: 14-day rolling** — same as KV. At-write pruning in
   the adapter, no `pg_cron` dependency yet.
4. **Feature-flag rollout:** `user_profile.storage_backend: "kv" | "postgres"`.
   - Founder account first for validation
   - Then default to `postgres` for new signups
   - Existing users migrate on their next login (dual-read with KV fallback)
   - KV retired 2+ weeks after clean dual-mode with no rollbacks
5. **Dual-write during cutover.** For users on the `postgres` backend, we
   still shadow-write to KV as belt-and-braces. Removed in Phase 2F.

## Schema

```sql
create table public.user_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  store jsonb not null,
  updated_at bigint not null,
  created_at timestamptz default now(),
  modified_at timestamptz default now()
);

create table public.user_state_snapshots (
  user_id uuid references auth.users(id) on delete cascade,
  snapshot_date date not null,
  store jsonb not null,
  created_at timestamptz default now(),
  primary key (user_id, snapshot_date)
);

alter table public.user_states enable row level security;
alter table public.user_state_snapshots enable row level security;

-- Read: user can only read their own row
create policy "own state read" on public.user_states
  for select using (auth.uid() = user_id);

-- Write: user can only upsert their own row
create policy "own state upsert" on public.user_states
  for insert with check (auth.uid() = user_id);
create policy "own state update" on public.user_states
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Same for snapshots
create policy "own snap read" on public.user_state_snapshots
  for select using (auth.uid() = user_id);
create policy "own snap upsert" on public.user_state_snapshots
  for insert with check (auth.uid() = user_id);
create policy "own snap delete" on public.user_state_snapshots
  for delete using (auth.uid() = user_id);
```

## Phases

- **2A · Design + SQL migration file** (~2h) — this doc + `supabase/migrations/*.sql` for you to run in Supabase SQL Editor.
- **2B · PostgresAdapter class** (~2h) — `next-app/src/lib/persistence/postgres-adapter.ts` implementing `PersistenceAdapter`.
- **2C · Feature flag + dual mode** (~1h) — `user_profile.storage_backend` + adapter factory picks based on flag.
- **2D · Backfill script** (~2h) — Node script using service_role key to iterate existing users and copy KV → Postgres. Deferred until 2A/2B/2C are validated.
- **2E · Cutover** (~2h) — flip flag default to `postgres` for new signups; existing users migrate on next login.
- **2F · KV retirement** (~1h + wait period) — after 2 weeks clean, remove KV writes + Pages Function + `KVAdapter`.

## Rollback

- Per-user: flip `user_profile.storage_backend` back to `"kv"` — dual-read
  falls back automatically, KV blob is intact.
- Full: default flag stays `"kv"` for new signups, existing users remain on KV.

## What this does NOT solve

- Normalized SQL analytics tables (deferred — the JSONB blob is the same shape as KV)
- Real-time presence / multi-device sync (Supabase Realtime is a follow-up)
- Coach chat message persistence (currently KV via worker; unaffected by this migration)
- Assessment pack authoring (still program JSON, unaffected)
