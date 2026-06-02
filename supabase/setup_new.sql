-- ============================================================================
-- FCDSA Meet 2026 — INCREMENTAL SETUP (migrations 0004 + 0005 only)
-- Use this when 0001-0003 are already applied. Safe to re-run (idempotent).
-- ============================================================================

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

