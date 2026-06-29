-- ============================================================================
-- FCDSA Meet 2026 — Host municipality pages
-- Adds the dynamic host-info tables: emergency contacts, poblacion map, and
-- committees. (The narrative host pages — Overview, Accommodation, Food & Dining,
-- Tourist Spots, Transportation — render from hardcoded content in the app and
-- intentionally have no table here.)
-- Public-read, admin-write. Idempotent: safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) EMERGENCY CONTACTS
-- ---------------------------------------------------------------------------
create table if not exists emergency_contacts (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  contact_number text not null default '',
  address        text not null default '',
  contact_type   text not null default 'general',
  sort_order     int not null default 0,
  created_at     timestamptz not null default now()
);

alter table emergency_contacts enable row level security;

drop policy if exists emergency_contacts_public_read on emergency_contacts;
create policy emergency_contacts_public_read on emergency_contacts for select using (true);

drop policy if exists emergency_contacts_admin_write on emergency_contacts;
create policy emergency_contacts_admin_write on emergency_contacts for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2) HOST MAP (single row — the admin just edits it)
-- ---------------------------------------------------------------------------
create table if not exists host_map (
  id         uuid primary key default gen_random_uuid(),
  embed_url  text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table host_map enable row level security;

drop policy if exists host_map_public_read on host_map;
create policy host_map_public_read on host_map for select using (true);

drop policy if exists host_map_admin_write on host_map;
create policy host_map_admin_write on host_map for all
  using (public.is_admin()) with check (public.is_admin());

-- Seed exactly one map row so the admin can just edit it.
insert into host_map (embed_url)
select '' where not exists (select 1 from host_map);

-- ---------------------------------------------------------------------------
-- 3) COMMITTEES
-- ---------------------------------------------------------------------------
create table if not exists committees (
  id          uuid primary key default gen_random_uuid(),
  role_name   text not null,
  person_name text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

alter table committees enable row level security;

drop policy if exists committees_public_read on committees;
create policy committees_public_read on committees for select using (true);

drop policy if exists committees_admin_write on committees;
create policy committees_admin_write on committees for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4) AUDIT TRIGGERS
-- ---------------------------------------------------------------------------
drop trigger if exists audit_emergency_contacts on emergency_contacts;
create trigger audit_emergency_contacts
  after insert or update or delete on emergency_contacts
  for each row execute function public.log_audit();

drop trigger if exists audit_committees on committees;
create trigger audit_committees
  after insert or update or delete on committees
  for each row execute function public.log_audit();
