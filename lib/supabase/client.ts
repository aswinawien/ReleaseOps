import { createBrowserClient } from '@supabase/ssr';
import { getPublicSupabaseEnv } from '@/lib/env';
import type { Database } from '@/lib/supabase/database.types';

export function createClient() {
  const env = getPublicSupabaseEnv();
  if (!env) {
    throw new Error('Supabase public environment variables are not configured.');
  }

  return createBrowserClient<Database>(env.url, env.anonKey);
}
