-- Phase 0 schema — user profile table with RLS so users only see their own row.
--
-- Paste this into Supabase Dashboard → SQL Editor → New Query → Run.
-- Idempotent: safe to run multiple times.
--
-- Why this table if the app already stores everything in Cloudflare KV?
-- Auth-adjacent metadata lives here (tier, trial, consent timestamps, active
-- program, display name) so we can query across users without paying the KV
-- round-trip. The training log itself stays in KV (fast, blob-shaped, sync-
-- friendly). Postgres is the source of truth for anything relational or
-- billing-adjacent.

create table if not exists public.user_profiles (
  uid uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Consent timestamps (GDPR — evidence when the user agreed to what)
  accepted_terms_at timestamptz,
  consented_symptom_data_at timestamptz,
  -- Onboarding / program selection
  weakness_at_signup text,
  goal_at_signup text,
  experience_level text check (experience_level in ('beginner','intermediate','advanced')),
  active_program_id text,
  active_program_started_at date,
  -- Tier + billing (paid tier ships later; column exists for schema stability)
  tier text not null default 'free' check (tier in ('free','trial','paid','beta_forever')),
  trial_ends_at timestamptz,
  paddle_customer_id text,
  paddle_subscription_status text
);

-- Autoupdate updated_at on any row change
create or replace function public.tg_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists user_profiles_touch on public.user_profiles;
create trigger user_profiles_touch
  before update on public.user_profiles
  for each row execute function public.tg_touch_updated_at();

-- On new signup, create a matching user_profiles row automatically
create or replace function public.tg_handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (uid, email, accepted_terms_at, consented_symptom_data_at)
  values (
    new.id,
    new.email,
    -- pulled from raw_user_meta_data we set at signUp() in sign-up/page.tsx
    (new.raw_user_meta_data->>'accepted_terms_at')::timestamptz,
    (new.raw_user_meta_data->>'consented_symptom_data_at')::timestamptz
  );
  return new;
end$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_handle_new_user();

-- RLS: each user reads/writes only their own row
alter table public.user_profiles enable row level security;

drop policy if exists "own profile select" on public.user_profiles;
create policy "own profile select" on public.user_profiles
  for select using ( auth.uid() = uid );

drop policy if exists "own profile update" on public.user_profiles;
create policy "own profile update" on public.user_profiles
  for update using ( auth.uid() = uid ) with check ( auth.uid() = uid );

-- No public insert / delete — inserts happen via the trigger above (service
-- role bypasses RLS). Deletes cascade from auth.users on account delete.
