-- ============================================================================
-- FCDSA Meet 2026 — Hall of Records, Mascot, Feedback, and tally breakdowns
-- Adds:
--   • records   — Hall of Records archive (public-read / admin-write)
--   • mascot    — single editable row for the meet mascot page
--   • feedback  — public can submit; only admins can read/delete
--   • medal_by_level / medal_by_sport — derived views for the tally breakdown
-- Public-read, admin-write (standard pattern). Idempotent: safe to re-run.
-- Apply AFTER 0001–0006.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) HALL OF RECORDS
-- ---------------------------------------------------------------------------
create table if not exists records (
  id            uuid primary key default gen_random_uuid(),
  sport         text not null,
  event_name    text not null,
  record_holder text not null,
  delegation    text not null default '',
  mark          text not null default '',
  level         text not null default '',   -- e.g. Elementary / Secondary / Open
  year_set      int,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

alter table records enable row level security;

drop policy if exists records_public_read on records;
create policy records_public_read on records for select using (true);

drop policy if exists records_admin_write on records;
create policy records_admin_write on records for all
  using (public.is_admin()) with check (public.is_admin());

drop trigger if exists audit_records on records;
create trigger audit_records
  after insert or update or delete on records
  for each row execute function public.log_audit();

-- ---------------------------------------------------------------------------
-- 2) MASCOT (single row — the admin just edits it)
-- ---------------------------------------------------------------------------
create table if not exists mascot (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default '',
  tagline     text not null default '',
  description text not null default '',
  symbolism   text not null default '',
  image_url   text not null default '',
  updated_at  timestamptz not null default now()
);

alter table mascot enable row level security;

drop policy if exists mascot_public_read on mascot;
create policy mascot_public_read on mascot for select using (true);

drop policy if exists mascot_admin_write on mascot;
create policy mascot_admin_write on mascot for all
  using (public.is_admin()) with check (public.is_admin());

drop trigger if exists audit_mascot on mascot;
create trigger audit_mascot
  after insert or update or delete on mascot
  for each row execute function public.log_audit();

-- Seed exactly one mascot row so the admin can just edit it.
insert into mascot (name)
select '' where not exists (select 1 from mascot);

-- ---------------------------------------------------------------------------
-- 3) FEEDBACK — anyone may submit; only admins may read or delete.
-- ---------------------------------------------------------------------------
create table if not exists feedback (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default '',
  email      text not null default '',
  subject    text not null default '',
  message    text not null,
  created_at timestamptz not null default now()
);

alter table feedback enable row level security;

-- Public (anon) INSERT only — no public SELECT (submissions stay private).
drop policy if exists feedback_public_insert on feedback;
create policy feedback_public_insert on feedback for insert with check (true);

drop policy if exists feedback_admin_all on feedback;
create policy feedback_admin_all on feedback for all
  using (public.is_admin()) with check (public.is_admin());

grant insert on feedback to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4) MEDAL BREAKDOWN VIEWS — by division level and by sport.
-- Mirror the medal_tally / standings pattern (views inherit underlying RLS;
-- grant select so PostgREST exposes them).
-- ---------------------------------------------------------------------------
create or replace view medal_by_level as
select
  c.level as level,
  count(*) filter (where r.medal = 'gold')   as gold,
  count(*) filter (where r.medal = 'silver') as silver,
  count(*) filter (where r.medal = 'bronze') as bronze,
  count(*) filter (where r.medal in ('gold','silver','bronze')) as total
from results r
join events e on e.id = r.event_id
join categories c on c.id = e.category_id
group by c.level;

grant select on medal_by_level to anon, authenticated;

create or replace view medal_by_sport as
select
  s.id    as sport_id,
  s.name  as sport_name,
  c.level as level,
  count(*) filter (where r.medal = 'gold')   as gold,
  count(*) filter (where r.medal = 'silver') as silver,
  count(*) filter (where r.medal = 'bronze') as bronze,
  count(*) filter (where r.medal in ('gold','silver','bronze')) as total
from results r
join events e on e.id = r.event_id
join sports s on s.id = e.sport_id
join categories c on c.id = e.category_id
group by s.id, s.name, c.level;

grant select on medal_by_sport to anon, authenticated;
