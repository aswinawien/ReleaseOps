import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database as Db, MembershipWithProfile } from '@/lib/supabase/database.types';

type Client = SupabaseClient<Db>;

export async function listOrganizationMembers(
  client: Client,
  organizationId: string,
): Promise<MembershipWithProfile[]> {
  const { data, error } = await client
    .from('memberships')
    .select('*, profile:profiles(id, full_name)')
    .eq('organization_id', organizationId)
    .order('created_at');

  if (error) {
    throw error;
  }
  return (data ?? []) as MembershipWithProfile[];
}
