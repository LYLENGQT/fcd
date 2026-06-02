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
