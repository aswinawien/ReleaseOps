-- Signup cannot insert an organization as the signed-in user and then RETURNING it:
-- SELECT on organizations requires is_org_member, and membership does not exist yet.
-- This function creates both rows in one security-definer transaction.
-- auth.uid() must be present (JWT). Signup without a session uses the server admin client instead.

create or replace function public.create_workspace(p_name text, p_slug text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_org uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  if length(trim(p_name)) < 2 then
    raise exception 'Workspace name is required';
  end if;

  insert into public.organizations (name, slug)
  values (trim(p_name), p_slug)
  returning id into v_org;

  insert into public.memberships (organization_id, user_id, role)
  values (v_org, v_uid, 'owner');

  return v_org;
end;
$$;

revoke all on function public.create_workspace(text, text) from public;
grant execute on function public.create_workspace(text, text) to authenticated;
