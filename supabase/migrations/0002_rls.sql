-- ============================================================================
-- FCDSA Meet 2026 — Row Level Security
-- Policy: public tables are world-readable (anon SELECT). Writes (insert/update/
-- delete) require an authenticated ADMIN (profiles.role = 'admin').
-- ============================================================================

-- Enable RLS everywhere.
alter table profiles      enable row level security;
alter table delegations   enable row level security;
alter table schools       enable row level security;
alter table athletes      enable row level security;
alter table sports        enable row level security;
alter table categories    enable row level security;
alter table events        enable row level security;
alter table schedules     enable row level security;
alter table results       enable row level security;
alter table announcements enable row level security;
alter table livestreams   enable row level security;
alter table audit_log     enable row level security;

-- ---------------------------------------------------------------------------
-- PROFILES — a user can read/update their own row; admins can read all.
-- ---------------------------------------------------------------------------
create policy profiles_select_self_or_admin on profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_self on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- PUBLIC-READ + ADMIN-WRITE tables.
-- Generated pattern repeated per table: anon/auth SELECT, admin full write.
-- ---------------------------------------------------------------------------

-- delegations
create policy delegations_public_read on delegations for select using (true);
create policy delegations_admin_write on delegations for all
  using (public.is_admin()) with check (public.is_admin());

-- schools
create policy schools_public_read on schools for select using (true);
create policy schools_admin_write on schools for all
  using (public.is_admin()) with check (public.is_admin());

-- athletes
create policy athletes_public_read on athletes for select using (true);
create policy athletes_admin_write on athletes for all
  using (public.is_admin()) with check (public.is_admin());

-- sports
create policy sports_public_read on sports for select using (true);
create policy sports_admin_write on sports for all
  using (public.is_admin()) with check (public.is_admin());

-- categories
create policy categories_public_read on categories for select using (true);
create policy categories_admin_write on categories for all
  using (public.is_admin()) with check (public.is_admin());

-- events
create policy events_public_read on events for select using (true);
create policy events_admin_write on events for all
  using (public.is_admin()) with check (public.is_admin());

-- schedules
create policy schedules_public_read on schedules for select using (true);
create policy schedules_admin_write on schedules for all
  using (public.is_admin()) with check (public.is_admin());

-- results
create policy results_public_read on results for select using (true);
create policy results_admin_write on results for all
  using (public.is_admin()) with check (public.is_admin());

-- announcements: public reads only PUBLISHED rows; admins read/write all.
create policy announcements_public_read on announcements
  for select using (published = true or public.is_admin());
create policy announcements_admin_write on announcements for all
  using (public.is_admin()) with check (public.is_admin());

-- livestreams
create policy livestreams_public_read on livestreams for select using (true);
create policy livestreams_admin_write on livestreams for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- AUDIT LOG — admin read only; inserts happen via SECURITY DEFINER triggers.
-- ---------------------------------------------------------------------------
create policy audit_admin_read on audit_log
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- REALTIME — broadcast results changes so the public tally can live-update.
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table results;

-- NOTE on the medal_tally VIEW: views inherit the RLS of underlying tables.
-- Since results + delegations are public-read, medal_tally is public-read too.
-- Grant explicit select to the API roles so PostgREST exposes it.
grant select on medal_tally to anon, authenticated;
