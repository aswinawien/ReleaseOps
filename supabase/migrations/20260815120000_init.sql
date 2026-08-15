-- ReleaseOps initial schema, RLS, and durable activity/notification triggers.
-- Synthetic agency data only. No production tenant names.

create extension if not exists pgcrypto;

create type public.membership_role as enum ('owner', 'admin', 'agent', 'client', 'viewer');
create type public.ticket_status as enum (
  'open',
  'in_progress',
  'waiting_on_client',
  'waiting_on_team',
  'resolved',
  'closed'
);
create type public.ticket_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.approval_status as enum (
  'pending',
  'approved',
  'changes_requested',
  'rejected'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_name_length check (char_length(name) between 2 and 80),
  constraint organizations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_name_length check (char_length(full_name) between 1 and 80)
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.membership_role not null,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title text not null,
  description text not null default '',
  status public.ticket_status not null default 'open',
  priority public.ticket_priority not null default 'medium',
  created_by uuid not null references public.profiles (id),
  assigned_to uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tickets_title_length check (char_length(title) between 4 and 120)
);

create table public.ticket_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ticket_comments_body_length check (char_length(body) between 2 and 4000)
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  ticket_id uuid not null references public.tickets (id) on delete cascade,
  requested_by uuid not null references public.profiles (id),
  reviewed_by uuid references public.profiles (id),
  status public.approval_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  ticket_id uuid references public.tickets (id) on delete cascade,
  actor_id uuid not null references public.profiles (id),
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  ticket_id uuid references public.tickets (id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index memberships_user_id_idx on public.memberships (user_id);
create index memberships_organization_id_idx on public.memberships (organization_id);
create index tickets_organization_id_idx on public.tickets (organization_id);
create index tickets_status_idx on public.tickets (organization_id, status);
create index tickets_assigned_to_idx on public.tickets (assigned_to);
create index ticket_comments_ticket_id_idx on public.ticket_comments (ticket_id);
create index activity_events_ticket_id_idx on public.activity_events (ticket_id, created_at desc);
create index notifications_user_id_idx on public.notifications (user_id, created_at desc);
create index approvals_ticket_id_idx on public.approvals (ticket_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute procedure public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute procedure public.set_updated_at();

create trigger tickets_set_updated_at
before update on public.tickets
for each row execute procedure public.set_updated_at();

create trigger ticket_comments_set_updated_at
before update on public.ticket_comments
for each row execute procedure public.set_updated_at();

create trigger approvals_set_updated_at
before update on public.approvals
for each row execute procedure public.set_updated_at();

create or replace function public.is_org_member(_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships
    where organization_id = _organization_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(
  _organization_id uuid,
  _roles public.membership_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships
    where organization_id = _organization_id
      and user_id = auth.uid()
      and role = any (_roles)
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.tg_ticket_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity_events (
      organization_id, ticket_id, actor_id, event_type, metadata
    ) values (
      new.organization_id,
      new.id,
      new.created_by,
      'ticket_created',
      jsonb_build_object('title', new.title, 'priority', new.priority)
    );
    return new;
  end if;

  if old.status is distinct from new.status then
    insert into public.activity_events (
      organization_id, ticket_id, actor_id, event_type, metadata
    ) values (
      new.organization_id,
      new.id,
      coalesce(auth.uid(), new.created_by),
      'status_changed',
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;

  if old.priority is distinct from new.priority then
    insert into public.activity_events (
      organization_id, ticket_id, actor_id, event_type, metadata
    ) values (
      new.organization_id,
      new.id,
      coalesce(auth.uid(), new.created_by),
      'priority_changed',
      jsonb_build_object('from', old.priority, 'to', new.priority)
    );
  end if;

  if old.assigned_to is distinct from new.assigned_to then
    insert into public.activity_events (
      organization_id, ticket_id, actor_id, event_type, metadata
    ) values (
      new.organization_id,
      new.id,
      coalesce(auth.uid(), new.created_by),
      'assignment_changed',
      jsonb_build_object('from', old.assigned_to, 'to', new.assigned_to)
    );

    if new.assigned_to is not null then
      insert into public.notifications (
        organization_id, user_id, ticket_id, title, body
      ) values (
        new.organization_id,
        new.assigned_to,
        new.id,
        'Ticket assigned to you',
        new.title
      );
    end if;
  end if;

  return new;
end;
$$;

create trigger tickets_activity
after insert or update on public.tickets
for each row execute procedure public.tg_ticket_activity();

create or replace function public.tg_comment_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ticket_row public.tickets%rowtype;
begin
  select * into ticket_row from public.tickets where id = new.ticket_id;

  insert into public.activity_events (
    organization_id, ticket_id, actor_id, event_type, metadata
  ) values (
    new.organization_id,
    new.ticket_id,
    new.author_id,
    'comment_added',
    jsonb_build_object('comment_id', new.id)
  );

  if ticket_row.created_by is distinct from new.author_id then
    insert into public.notifications (
      organization_id, user_id, ticket_id, title, body
    ) values (
      new.organization_id,
      ticket_row.created_by,
      new.ticket_id,
      'New comment on your ticket',
      ticket_row.title
    );
  end if;

  if ticket_row.assigned_to is not null
     and ticket_row.assigned_to is distinct from new.author_id
     and ticket_row.assigned_to is distinct from ticket_row.created_by then
    insert into public.notifications (
      organization_id, user_id, ticket_id, title, body
    ) values (
      new.organization_id,
      ticket_row.assigned_to,
      new.ticket_id,
      'New comment on an assigned ticket',
      ticket_row.title
    );
  end if;

  return new;
end;
$$;

create trigger ticket_comments_activity
after insert on public.ticket_comments
for each row execute procedure public.tg_comment_activity();

create or replace function public.tg_approval_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ticket_title text;
begin
  select title into ticket_title from public.tickets where id = new.ticket_id;

  if tg_op = 'INSERT' then
    insert into public.activity_events (
      organization_id, ticket_id, actor_id, event_type, metadata
    ) values (
      new.organization_id,
      new.ticket_id,
      new.requested_by,
      'approval_requested',
      jsonb_build_object('approval_id', new.id)
    );
    return new;
  end if;

  if old.status is distinct from new.status then
    insert into public.activity_events (
      organization_id, ticket_id, actor_id, event_type, metadata
    ) values (
      new.organization_id,
      new.ticket_id,
      coalesce(new.reviewed_by, auth.uid(), new.requested_by),
      'approval_reviewed',
      jsonb_build_object('from', old.status, 'to', new.status)
    );

    if new.requested_by is distinct from new.reviewed_by then
      insert into public.notifications (
        organization_id, user_id, ticket_id, title, body
      ) values (
        new.organization_id,
        new.requested_by,
        new.ticket_id,
        'Approval updated',
        coalesce(ticket_title, 'A ticket you requested approval for was reviewed.')
      );
    end if;
  end if;

  return new;
end;
$$;

create trigger approvals_activity
after insert or update on public.approvals
for each row execute procedure public.tg_approval_activity();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.projects enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_comments enable row level security;
alter table public.approvals enable row level security;
alter table public.activity_events enable row level security;
alter table public.notifications enable row level security;

create policy organizations_select on public.organizations
for select to authenticated
using (public.is_org_member(id));

create policy organizations_update on public.organizations
for update to authenticated
using (public.has_org_role(id, array['owner'::public.membership_role, 'admin'::public.membership_role]))
with check (public.has_org_role(id, array['owner'::public.membership_role, 'admin'::public.membership_role]));

create policy organizations_insert on public.organizations
for insert to authenticated
with check (true);

create policy profiles_select on public.profiles
for select to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.memberships mine
    join public.memberships theirs on theirs.organization_id = mine.organization_id
    where mine.user_id = auth.uid()
      and theirs.user_id = profiles.id
  )
);

create policy profiles_update on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy memberships_select on public.memberships
for select to authenticated
using (public.is_org_member(organization_id));

create policy memberships_insert on public.memberships
for insert to authenticated
with check (
  user_id = auth.uid()
  or public.has_org_role(
    organization_id,
    array['owner'::public.membership_role, 'admin'::public.membership_role]
  )
);

create policy memberships_update on public.memberships
for update to authenticated
using (
  public.has_org_role(
    organization_id,
    array['owner'::public.membership_role, 'admin'::public.membership_role]
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner'::public.membership_role, 'admin'::public.membership_role]
  )
);

create policy projects_select on public.projects
for select to authenticated
using (public.is_org_member(organization_id));

create policy projects_write on public.projects
for all to authenticated
using (
  public.has_org_role(
    organization_id,
    array['owner'::public.membership_role, 'admin'::public.membership_role, 'agent'::public.membership_role]
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner'::public.membership_role, 'admin'::public.membership_role, 'agent'::public.membership_role]
  )
);

create policy tickets_select on public.tickets
for select to authenticated
using (public.is_org_member(organization_id));

create policy tickets_insert on public.tickets
for insert to authenticated
with check (
  created_by = auth.uid()
  and public.has_org_role(
    organization_id,
    array['owner'::public.membership_role, 'admin'::public.membership_role, 'agent'::public.membership_role, 'client'::public.membership_role]
  )
);

create policy tickets_update on public.tickets
for update to authenticated
using (
  public.has_org_role(
    organization_id,
    array['owner'::public.membership_role, 'admin'::public.membership_role, 'agent'::public.membership_role]
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner'::public.membership_role, 'admin'::public.membership_role, 'agent'::public.membership_role]
  )
);

create policy ticket_comments_select on public.ticket_comments
for select to authenticated
using (public.is_org_member(organization_id));

create policy ticket_comments_insert on public.ticket_comments
for insert to authenticated
with check (
  author_id = auth.uid()
  and public.has_org_role(
    organization_id,
    array['owner'::public.membership_role, 'admin'::public.membership_role, 'agent'::public.membership_role, 'client'::public.membership_role]
  )
);

create policy ticket_comments_update on public.ticket_comments
for update to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

create policy approvals_select on public.approvals
for select to authenticated
using (public.is_org_member(organization_id));

create policy approvals_insert on public.approvals
for insert to authenticated
with check (
  requested_by = auth.uid()
  and public.has_org_role(
    organization_id,
    array['owner'::public.membership_role, 'admin'::public.membership_role, 'agent'::public.membership_role]
  )
);

create policy approvals_update on public.approvals
for update to authenticated
using (
  public.has_org_role(
    organization_id,
    array['owner'::public.membership_role, 'admin'::public.membership_role, 'client'::public.membership_role]
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner'::public.membership_role, 'admin'::public.membership_role, 'client'::public.membership_role]
  )
);

create policy activity_events_select on public.activity_events
for select to authenticated
using (public.is_org_member(organization_id));

create policy notifications_select on public.notifications
for select to authenticated
using (user_id = auth.uid());

create policy notifications_update on public.notifications
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
