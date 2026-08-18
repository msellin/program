-- Phase 2A of the KV → Postgres migration.
-- Run in Supabase SQL Editor. Idempotent (uses if-not-exists guards).
--
-- Creates:
--   public.user_states           — one row per user, jsonb blob mirroring the KV shape
--   public.user_state_snapshots  — 14-day rolling per-day snapshots (same as KV)
--
-- Both bound to auth.users via ON DELETE CASCADE — deleting the auth user
-- purges their state automatically. Complies with "Delete my account"
-- cascade without an extra service_role call.
--
-- RLS policies bind to auth.uid() so each user can only read/write their
-- own row. Client uses the anon key + user's JWT; service_role bypasses
-- RLS and is reserved for the backfill script (Phase 2D).

create table if not exists public.user_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  store jsonb not null,
  updated_at bigint not null,
  created_at timestamptz not null default now(),
  modified_at timestamptz not null default now()
);

create table if not exists public.user_state_snapshots (
  user_id uuid references auth.users(id) on delete cascade,
  snapshot_date date not null,
  store jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, snapshot_date)
);

-- Index for snapshot pruning by user + date range.
create index if not exists user_state_snapshots_user_date_idx
  on public.user_state_snapshots (user_id, snapshot_date desc);

alter table public.user_states enable row level security;
alter table public.user_state_snapshots enable row level security;

-- user_states policies — one per operation kind.
drop policy if exists "own state read" on public.user_states;
create policy "own state read" on public.user_states
  for select
  using (auth.uid() = user_id);

drop policy if exists "own state upsert" on public.user_states;
create policy "own state upsert" on public.user_states
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "own state update" on public.user_states;
create policy "own state update" on public.user_states
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Deletion via auth.users cascade only — no user-facing delete policy.

-- user_state_snapshots policies.
drop policy if exists "own snap read" on public.user_state_snapshots;
create policy "own snap read" on public.user_state_snapshots
  for select
  using (auth.uid() = user_id);

drop policy if exists "own snap upsert" on public.user_state_snapshots;
create policy "own snap upsert" on public.user_state_snapshots
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "own snap delete" on public.user_state_snapshots;
create policy "own snap delete" on public.user_state_snapshots
  for delete
  using (auth.uid() = user_id);

-- Trigger: bump modified_at on every update to user_states.
create or replace function public.set_modified_at()
returns trigger
language plpgsql
as $$
begin
  new.modified_at = now();
  return new;
end;
$$;

drop trigger if exists user_states_modified_at on public.user_states;
create trigger user_states_modified_at
  before update on public.user_states
  for each row
  execute function public.set_modified_at();

-- Grant statement is implicit via Supabase's default role setup, but
-- documented here for transparency:
--   authenticated role has SELECT/INSERT/UPDATE on public tables when RLS
--   allows it. service_role bypasses RLS. anon role gets nothing on these
--   tables.
