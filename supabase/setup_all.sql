-- ============================================================================
-- FCDSA Meet 2026 — FULL SETUP (migrations 0001–0005, in order)
-- Paste this whole file into Supabase → SQL Editor → Run, on a FRESH project.
-- ============================================================================


-- ▼▼▼ 0001_init.sql ▼▼▼

-- ============================================================================
-- FCDSA Meet 2026 — Initial schema
-- Apply via: Supabase Dashboard → SQL Editor (paste & run), or `supabase db push`.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
create type user_role      as enum ('admin', 'encoder', 'viewer');
create type gender_div      as enum ('boys', 'girls', 'mixed');
create type school_level     as enum ('elementary', 'secondary');
create type event_type       as enum ('individual', 'team');
create type schedule_status  as enum ('scheduled', 'ongoing', 'finished', 'cancelled');
create type medal_kind       as enum ('gold', 'silver', 'bronze', 'none');
create type stream_platform  as enum ('youtube', 'facebook', 'other');

-- ---------------------------------------------------------------------------
-- PROFILES (users/roles) — 1:1 with auth.users
-- ---------------------------------------------------------------------------
create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  role        user_role not null default 'viewer',
  created_at  timestamptz not null default now()
);

-- Helper: is the current JWT an admin? (SECURITY DEFINER avoids RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Auto-create a profile row when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- CORE SPORTS DOMAIN
-- ---------------------------------------------------------------------------
create table delegations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  abbrev      text not null,
  slug        text not null unique,
  logo_url    text,
  color       text not null default '#1e40af',  -- hex, used for tally bars/badges
  created_at  timestamptz not null default now()
);

create table schools (
  id            uuid primary key default gen_random_uuid(),
  delegation_id uuid not null references delegations (id) on delete cascade,
  name          text not null,
  level         school_level,
  created_at    timestamptz not null default now()
);

create table athletes (
  id            uuid primary key default gen_random_uuid(),
  delegation_id uuid not null references delegations (id) on delete cascade,
  school_id     uuid references schools (id) on delete set null,
  first_name    text not null,
  last_name     text not null,
  gender        gender_div not null default 'mixed',
  level         school_level,
  photo_url     text,
  created_at    timestamptz not null default now()
);

create table sports (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  icon        text,                          -- lucide icon name
  created_at  timestamptz not null default now()
);

-- Age/gender divisions, e.g. "Secondary Boys", "Elementary Girls"
create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  level       school_level not null,
  gender      gender_div not null,
  created_at  timestamptz not null default now(),
  unique (level, gender)
);

create table events (
  id           uuid primary key default gen_random_uuid(),
  sport_id     uuid not null references sports (id) on delete cascade,
  category_id  uuid not null references categories (id) on delete restrict,
  name         text not null,                -- e.g. "100m Dash", "Team Final"
  type         event_type not null default 'individual',
  created_at   timestamptz not null default now()
);

create table schedules (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events (id) on delete cascade,
  venue       text not null,
  start_at    timestamptz not null,
  status      schedule_status not null default 'scheduled',
  created_at  timestamptz not null default now()
);

-- One row per podium placement (or non-podium finish) attributed to a delegation.
create table results (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events (id) on delete cascade,
  delegation_id uuid not null references delegations (id) on delete cascade,
  athlete_id    uuid references athletes (id) on delete set null, -- null for team events
  placement     int  not null check (placement >= 1),
  medal         medal_kind not null default 'none',
  mark          text,                         -- free-form time/distance/score
  recorded_by   uuid references profiles (id) on delete set null,
  recorded_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index results_event_idx       on results (event_id);
create index results_delegation_idx  on results (delegation_id);
create index results_athlete_idx     on results (athlete_id);

-- ---------------------------------------------------------------------------
-- MEDAL TALLY (DERIVED) — a view aggregated from results. Never written to.
-- Ranking: gold desc, silver desc, bronze desc (standard meet convention).
-- ---------------------------------------------------------------------------
create view medal_tally as
select
  d.id   as delegation_id,
  d.name as delegation_name,
  d.abbrev,
  d.slug,
  d.color,
  count(*) filter (where r.medal = 'gold')   as gold,
  count(*) filter (where r.medal = 'silver') as silver,
  count(*) filter (where r.medal = 'bronze') as bronze,
  count(*) filter (where r.medal in ('gold','silver','bronze')) as total,
  rank() over (
    order by
      count(*) filter (where r.medal = 'gold')   desc,
      count(*) filter (where r.medal = 'silver') desc,
      count(*) filter (where r.medal = 'bronze') desc
  ) as rank
from delegations d
left join results r on r.delegation_id = d.id
group by d.id, d.name, d.abbrev, d.slug, d.color;

-- ---------------------------------------------------------------------------
-- CONTENT
-- ---------------------------------------------------------------------------
create table announcements (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  body          text not null,
  pinned        boolean not null default false,
  published     boolean not null default true,
  published_at  timestamptz not null default now(),
  author_id     uuid references profiles (id) on delete set null,
  created_at    timestamptz not null default now()
);

create table livestreams (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  embed_url   text not null,
  platform    stream_platform not null default 'youtube',
  event_id    uuid references events (id) on delete set null,
  is_live     boolean not null default false,
  starts_at   timestamptz,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- AUDIT LOG
-- ---------------------------------------------------------------------------
create table audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references profiles (id) on delete set null,
  action      text not null,                 -- 'insert' | 'update' | 'delete'
  entity      text not null,                 -- table name
  entity_id   text,
  details     jsonb,
  created_at  timestamptz not null default now()
);


-- ▼▼▼ 0002_rls.sql ▼▼▼

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


-- ▼▼▼ 0003_audit_triggers.sql ▼▼▼

-- ============================================================================
-- FCDSA Meet 2026 — Audit triggers
-- Records insert/update/delete on key admin-managed tables into audit_log.
-- SECURITY DEFINER so the insert bypasses audit_log's admin-only RLS.
-- ============================================================================

create or replace function public.log_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entity_id text;
  v_details   jsonb;
begin
  if (tg_op = 'DELETE') then
    v_entity_id := old.id::text;
    v_details   := to_jsonb(old);
  else
    v_entity_id := new.id::text;
    v_details   := to_jsonb(new);
  end if;

  insert into public.audit_log (actor_id, action, entity, entity_id, details)
  values (auth.uid(), lower(tg_op), tg_table_name, v_entity_id, v_details);

  if (tg_op = 'DELETE') then
    return old;
  end if;
  return new;
end;
$$;

create trigger audit_results
  after insert or update or delete on results
  for each row execute function public.log_audit();

create trigger audit_schedules
  after insert or update or delete on schedules
  for each row execute function public.log_audit();

create trigger audit_announcements
  after insert or update or delete on announcements
  for each row execute function public.log_audit();

create trigger audit_athletes
  after insert or update or delete on athletes
  for each row execute function public.log_audit();

create trigger audit_delegations
  after insert or update or delete on delegations
  for each row execute function public.log_audit();


-- ▼▼▼ 0004_features.sql ▼▼▼

-- ============================================================================
-- FCDSA Meet 2026 — Feature migration 0004
-- Adds: encoder write access (is_staff), overall championship standings view,
-- a venues directory, and a public Storage bucket for logos/photos.
-- Apply AFTER 0001–0003. Idempotent where practical.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) STAFF HELPER — admin OR encoder may encode results / manage schedule.
-- ---------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'encoder')
  );
$$;

-- Results: encoders + admins may write (was admin-only).
drop policy if exists results_admin_write on results;
create policy results_staff_write on results
  for all using (public.is_staff()) with check (public.is_staff());

-- Schedules: encoders + admins may update status/entries during the meet.
drop policy if exists schedules_admin_write on schedules;
create policy schedules_staff_write on schedules
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- 2) OVERALL STANDINGS (championship points) — derived view.
-- Points scheme: gold = 5, silver = 3, bronze = 1 (meet convention; adjust
-- here if the organizers ratify a different table).
-- ---------------------------------------------------------------------------
create or replace view standings as
select
  d.id   as delegation_id,
  d.name as delegation_name,
  d.abbrev,
  d.slug,
  d.color,
  count(*) filter (where r.medal = 'gold')   as gold,
  count(*) filter (where r.medal = 'silver') as silver,
  count(*) filter (where r.medal = 'bronze') as bronze,
  (count(*) filter (where r.medal = 'gold')   * 5)
  + (count(*) filter (where r.medal = 'silver') * 3)
  + (count(*) filter (where r.medal = 'bronze') * 1) as points,
  rank() over (
    order by
      (count(*) filter (where r.medal = 'gold')   * 5)
      + (count(*) filter (where r.medal = 'silver') * 3)
      + (count(*) filter (where r.medal = 'bronze') * 1) desc
  ) as rank
from delegations d
left join results r on r.delegation_id = d.id
group by d.id, d.name, d.abbrev, d.slug, d.color;

grant select on standings to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3) VENUES — directory of competition sites (public page + reference).
-- ---------------------------------------------------------------------------
create table if not exists venues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  map_url     text,
  created_at  timestamptz not null default now()
);

alter table venues enable row level security;

drop policy if exists venues_public_read on venues;
create policy venues_public_read on venues for select using (true);

drop policy if exists venues_admin_write on venues;
create policy venues_admin_write on venues for all
  using (public.is_admin()) with check (public.is_admin());

-- Audit venue changes too (function from 0003).
drop trigger if exists audit_venues on venues;
create trigger audit_venues
  after insert or update or delete on venues
  for each row execute function public.log_audit();

-- ---------------------------------------------------------------------------
-- 4) STORAGE — public "media" bucket for delegation logos & athlete photos.
-- Public read; staff (admin/encoder) may upload/update/delete.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists media_staff_insert on storage.objects;
create policy media_staff_insert on storage.objects
  for insert with check (bucket_id = 'media' and public.is_staff());

drop policy if exists media_staff_update on storage.objects;
create policy media_staff_update on storage.objects
  for update using (bucket_id = 'media' and public.is_staff());

drop policy if exists media_staff_delete on storage.objects;
create policy media_staff_delete on storage.objects
  for delete using (bucket_id = 'media' and public.is_staff());


-- ▼▼▼ 0005_integrity.sql ▼▼▼

-- ============================================================================
-- FCDSA Meet 2026 — Data integrity 0005
-- Prevents duplicate result rows without blocking legitimate ties (two athletes
-- CAN share a placement / medal — e.g. two golds — so we do NOT unique on
-- (event_id, placement)). Apply AFTER 0001–0004.
--
-- NOTE: if existing data already contains duplicates these CREATE INDEX
-- statements will fail; de-dupe first, then re-run.
-- ============================================================================

-- An athlete may appear at most once per event (individual events).
create unique index if not exists results_uniq_athlete
  on results (event_id, athlete_id)
  where athlete_id is not null;

-- A delegation may have at most one team result per event (team events have a
-- null athlete_id; individual events can have many athletes per delegation, so
-- this partial index only covers the team case).
create unique index if not exists results_uniq_team
  on results (event_id, delegation_id)
  where athlete_id is null;

