-- Shareable workspace invites. Email is stored so accept can match the signed-in user.
-- The public preview is a token lookup (get_invitation), not a table grant to anon.

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email text not null,
  role public.membership_role not null,
  token uuid not null unique default gen_random_uuid(),
  invited_by uuid not null references public.profiles (id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint invitations_email_not_blank check (length(trim(email)) > 2)
);

create unique index invitations_pending_email_idx
  on public.invitations (organization_id, lower(email))
  where accepted_at is null;

create index invitations_organization_id_idx on public.invitations (organization_id, created_at desc);

alter table public.invitations enable row level security;

create policy invitations_select on public.invitations
for select to authenticated
using (public.is_org_member(organization_id));

create policy invitations_insert on public.invitations
for insert to authenticated
with check (
  invited_by = (select auth.uid())
  and public.has_org_role(
    organization_id,
    array['owner'::public.membership_role, 'admin'::public.membership_role]
  )
  and (
    role <> 'owner'::public.membership_role
    or public.has_org_role(
      organization_id,
      array['owner'::public.membership_role]
    )
  )
);

create policy invitations_update on public.invitations
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
  and (
    role <> 'owner'::public.membership_role
    or public.has_org_role(
      organization_id,
      array['owner'::public.membership_role]
    )
  )
);

create policy invitations_delete on public.invitations
for delete to authenticated
using (
  public.has_org_role(
    organization_id,
    array['owner'::public.membership_role, 'admin'::public.membership_role]
  )
);

grant select, insert, update, delete on public.invitations to authenticated;

create or replace function public.get_invitation(p_token uuid)
returns table (
  id uuid,
  organization_name text,
  email text,
  role public.membership_role,
  expires_at timestamptz,
  accepted_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    i.id,
    o.name,
    i.email,
    i.role,
    i.expires_at,
    i.accepted_at
  from public.invitations i
  join public.organizations o on o.id = i.organization_id
  where i.token = p_token;
$$;

revoke all on function public.get_invitation(uuid) from public;
grant execute on function public.get_invitation(uuid) to anon, authenticated;
