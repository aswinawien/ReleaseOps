import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { getPublicSupabaseEnv, getServiceRoleKey } from '@/lib/env';
import type { Database } from '@/lib/supabase/database.types';

export function createAdminClient() {
  const env = getPublicSupabaseEnv();
  const serviceRoleKey = getServiceRoleKey();
  if (!env || !serviceRoleKey) {
    throw new Error('Supabase service-role configuration is missing.');
  }

  return createClient<Database>(env.url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
