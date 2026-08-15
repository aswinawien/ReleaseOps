import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database as Db,
  Invitation,
  InvitationPreview,
} from '@/lib/supabase/database.types';

type Client = SupabaseClient<Db>;

export async function listPendingInvitations(
  client: Client,
  organizationId: string,
): Promise<Invitation[]> {
  const { data, error } = await client
    .from('invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .is('accepted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function getInvitationPreview(
  client: Client,
  token: string,
): Promise<InvitationPreview | null> {
  const { data, error } = await client.rpc('get_invitation', { p_token: token });
  if (error) {
    throw error;
  }
  const rows = data ?? [];
  return rows[0] ?? null;
}
