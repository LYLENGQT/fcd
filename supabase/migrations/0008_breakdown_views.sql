-- ============================================================================
-- FCDSA Meet 2026 — Extra medal-breakdown views (division gender split + matrix)
-- Adds:
--   • medal_by_division          — medals grouped by division (level × gender)
--   • medal_by_delegation_sport  — medals per delegation × sport (heatmap matrix)
-- Mirror the medal_tally / medal_by_* pattern: derived views, never written;
-- grant select so PostgREST exposes them. Championship points are NOT computed
-- here — the 5/3/1 scheme lives only in standings (0004) + src/lib/scoring.ts.
-- Idempotent: safe to re-run. Apply AFTER 0001–0007.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) BY DIVISION (level × gender) — the gender split medal_by_level collapses.
-- ---------------------------------------------------------------------------
create or replace view medal_by_division as
select
  c.level  as level,
  c.gender as gender,
  count(*) filter (where r.medal = 'gold')   as gold,
  count(*) filter (where r.medal = 'silver') as silver,
  count(*) filter (where r.medal = 'bronze') as bronze,
  count(*) filter (where r.medal in ('gold','silver','bronze')) as total
from results r
join events e     on e.id = r.event_id
join categories c on c.id = e.category_id
group by c.level, c.gender;

grant select on medal_by_division to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2) BY DELEGATION × SPORT — one row per (delegation, sport) for the heatmap.
-- ---------------------------------------------------------------------------
create or replace view medal_by_delegation_sport as
select
  d.id     as delegation_id,
  d.name   as delegation_name,
  d.abbrev as abbrev,
  d.color  as color,
  s.id     as sport_id,
  s.name   as sport_name,
  count(*) filter (where r.medal = 'gold')   as gold,
  count(*) filter (where r.medal = 'silver') as silver,
  count(*) filter (where r.medal = 'bronze') as bronze,
  count(*) filter (where r.medal in ('gold','silver','bronze')) as total
from results r
join events e      on e.id = r.event_id
join sports s      on s.id = e.sport_id
join delegations d on d.id = r.delegation_id
group by d.id, d.name, d.abbrev, d.color, s.id, s.name;

grant select on medal_by_delegation_sport to anon, authenticated;
