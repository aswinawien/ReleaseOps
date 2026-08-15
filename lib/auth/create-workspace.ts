import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { getServiceRoleKey } from '@/lib/env';
import { actionErr, actionOk, type ActionResult } from '@/lib/actions/result';

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug.length >= 2 ? slug : `workspace-${crypto.randomUUID().slice(0, 8)}`;
}

export async function bootstrapOwnerWorkspace(
  userId: string,
  organizationName: string,
): Promise<ActionResult<{ organizationId: string }>> {
  if (!getServiceRoleKey()) {
    return actionErr(
      'Workspace creation needs SUPABASE_SERVICE_ROLE_KEY on the server. Never put that key in NEXT_PUBLIC_ vars.',
    );
  }

  const admin = createAdminClient();

  const { data: existing, error: existingError } = await admin
    .from('memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    return actionErr(existingError.message);
  }
  if (existing?.organization_id) {
    return actionOk({ organizationId: existing.organization_id });
  }

  const slug = `${slugify(organizationName)}-${userId.slice(0, 6)}`;
  const { data: organization, error: orgError } = await admin
    .from('organizations')
    .insert({ name: organizationName, slug })
    .select('id')
    .single();

  if (orgError) {
    return actionErr(orgError.message);
  }

  const { error: membershipError } = await admin.from('memberships').insert({
    organization_id: organization.id,
    user_id: userId,
    role: 'owner',
  });

  if (membershipError) {
    return actionErr(membershipError.message);
  }

  return actionOk({ organizationId: organization.id });
}
