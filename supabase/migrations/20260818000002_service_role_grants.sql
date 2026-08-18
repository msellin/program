-- Grant service_role access to user_states + user_state_snapshots.
-- The RLS policies handle the authenticated role via auth.uid(), but the
-- service_role (used by the backfill script + any future admin tooling)
-- needs explicit table-level GRANTs on top of its RLS-bypass privilege.
--
-- Standard Supabase pattern — omitted from the initial migration because
-- Supabase Studio wizard usually applies these grants automatically, but
-- migrations added via the CLI don't get the wizard treatment.

grant select, insert, update, delete on public.user_states to service_role;
grant select, insert, update, delete on public.user_state_snapshots to service_role;

-- authenticated role uses RLS policies (already in migration 001), but
-- also needs the base grants to hit the tables at all.
grant select, insert, update on public.user_states to authenticated;
grant select, insert, update, delete on public.user_state_snapshots to authenticated;
