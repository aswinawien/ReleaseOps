-- Realtime publication, replica identity, and private channel authorization.
-- Durable facts still live in Postgres. These policies only authorize sockets.

alter table public.tickets replica identity full;
alter table public.ticket_comments replica identity full;
alter table public.approvals replica identity full;
alter table public.activity_events replica identity full;
alter table public.notifications replica identity full;

do $$
declare
  target text;
begin
  foreach target in array array[
    'tickets',
    'ticket_comments',
    'approvals',
    'activity_events',
    'notifications'
  ]
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = target
    ) then
      execute format('alter publication supabase_realtime add table public.%I', target);
    end if;
  end loop;
end $$;

-- Private Broadcast/Presence channels use realtime.messages RLS.
-- Topic contract:
--   ticket:{ticket_id}  viewing + typing
--   org:{organization_id} connection heartbeat / org presence

drop policy if exists realtime_select_authorized_topics on realtime.messages;
drop policy if exists realtime_insert_authorized_topics on realtime.messages;
drop policy if exists realtime_update_authorized_topics on realtime.messages;

create policy realtime_select_authorized_topics
on realtime.messages
for select
to authenticated
using (
  (
    realtime.topic() like 'ticket:%'
    and exists (
      select 1
      from public.tickets t
      where t.id::text = substr(realtime.topic(), 8)
        and public.is_org_member(t.organization_id)
    )
  )
  or (
    realtime.topic() like 'org:%'
    and exists (
      select 1
      from public.memberships m
      where m.user_id = auth.uid()
        and m.organization_id::text = substr(realtime.topic(), 5)
    )
  )
);

create policy realtime_insert_authorized_topics
on realtime.messages
for insert
to authenticated
with check (
  (
    realtime.topic() like 'ticket:%'
    and exists (
      select 1
      from public.tickets t
      where t.id::text = substr(realtime.topic(), 8)
        and public.is_org_member(t.organization_id)
    )
  )
  or (
    realtime.topic() like 'org:%'
    and exists (
      select 1
      from public.memberships m
      where m.user_id = auth.uid()
        and m.organization_id::text = substr(realtime.topic(), 5)
    )
  )
);

create policy realtime_update_authorized_topics
on realtime.messages
for update
to authenticated
using (
  realtime.topic() like 'ticket:%'
  or realtime.topic() like 'org:%'
)
with check (
  (
    realtime.topic() like 'ticket:%'
    and exists (
      select 1
      from public.tickets t
      where t.id::text = substr(realtime.topic(), 8)
        and public.is_org_member(t.organization_id)
    )
  )
  or (
    realtime.topic() like 'org:%'
    and exists (
      select 1
      from public.memberships m
      where m.user_id = auth.uid()
        and m.organization_id::text = substr(realtime.topic(), 5)
    )
  )
);
