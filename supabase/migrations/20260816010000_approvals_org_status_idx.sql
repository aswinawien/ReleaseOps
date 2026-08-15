-- Org-wide approval board filters by organization_id and status.
create index if not exists approvals_organization_status_idx
  on public.approvals (organization_id, status, created_at desc);
