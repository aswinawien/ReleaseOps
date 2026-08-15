type PublicSupabaseEnv = {
  url: string;
  anonKey: string;
};

function read(name: string): string | undefined {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    return undefined;
  }
  return value;
}

export function getPublicSupabaseEnv(): PublicSupabaseEnv | null {
  const url = read('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = read('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !anonKey) {
    return null;
  }
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getPublicSupabaseEnv() !== null;
}

export function getServiceRoleKey(): string | null {
  return read('SUPABASE_SERVICE_ROLE_KEY') ?? null;
}
