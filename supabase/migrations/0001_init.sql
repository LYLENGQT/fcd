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
