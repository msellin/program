-- Sign-ups and activations by ad campaign (M-02). Run in the Supabase SQL editor.
--
-- Attribution is written to auth.users.raw_user_meta_data at sign-up from the
-- utm_* / fbclid / gclid params on the landing CTA (next-app/src/lib/attribution.ts).
-- "Activated" = the user has at least one day log in their synced store
-- (user_states.store.logs is keyed by date), i.e. they finished a first session
-- or logged something. Users who never synced have no user_states row.
--
-- Read-only. Counts only; no emails leave the query.

with u as (
  select
    id,
    created_at,
    coalesce(nullif(raw_user_meta_data ->> 'utm_source', ''), '(none)')   as utm_source,
    coalesce(nullif(raw_user_meta_data ->> 'utm_campaign', ''), '(none)') as utm_campaign,
    coalesce(nullif(raw_user_meta_data ->> 'utm_content', ''), '(none)')  as utm_content,
    email_confirmed_at is not null as confirmed
  from auth.users
),
a as (
  select
    u.*,
    coalesce(jsonb_typeof(s.store -> 'logs') = 'object'
             and (select count(*) from jsonb_object_keys(s.store -> 'logs')) > 0, false) as activated
  from u
  left join public.user_states s on s.user_id = u.id
)
select
  utm_source,
  utm_campaign,
  utm_content,
  count(*)                                              as signups,
  count(*) filter (where confirmed)                     as confirmed,
  count(*) filter (where activated)                     as activated,
  round(100.0 * count(*) filter (where activated) / nullif(count(*), 0), 1) as activation_pct
from a
where created_at >= now() - interval '30 days'
group by 1, 2, 3
order by signups desc;
