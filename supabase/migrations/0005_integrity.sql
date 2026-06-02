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
