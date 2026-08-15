import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { ApprovalStatus, ApprovalWithActors, Database as Db } from '@/lib/supabase/database.types';

type Client = SupabaseClient<Db>;

const APPROVAL_SELECT =
  '*, requester:profiles!approvals_requested_by_fkey(id, full_name), reviewer:profiles!approvals_reviewed_by_fkey(id, full_name), ticket:tickets(id, title)';

export type ApprovalBoardRow = ApprovalWithActors & {
  ticket: { id: string; title: string } | null;
};

export async function listOrganizationApprovals(
  client: Client,
  organizationId: string,
  status?: ApprovalStatus,
): Promise<ApprovalBoardRow[]> {
  let query = client
    .from('approvals')
    .select(APPROVAL_SELECT)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return (data ?? []) as ApprovalBoardRow[];
}

export async function countPendingApprovals(
  client: Client,
  organizationId: string,
): Promise<number> {
  const { count, error } = await client
    .from('approvals')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'pending');

  if (error) {
    throw error;
  }
  return count ?? 0;
}

export async function countApprovalsByStatus(
  client: Client,
  organizationId: string,
): Promise<Record<string, number>> {
  const { data, error } = await client
    .from('approvals')
    .select('status')
    .eq('organization_id', organizationId);

  if (error) {
    throw error;
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return counts;
}
