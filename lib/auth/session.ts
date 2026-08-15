import 'server-only';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import type { Membership, MembershipRole, Organization, Profile } from '@/lib/supabase/database.types';

export type AppContext = {
  userId: string;
  email: string | undefined;
  profile: Profile;
  organization: Organization;
  membership: Membership;
  role: MembershipRole;
};

export async function getAppContext(): Promise<AppContext | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const { data: membership } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!profile || !membership) {
    return null;
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', membership.organization_id)
    .maybeSingle();

  if (!organization) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    profile,
    organization,
    membership,
    role: membership.role,
  };
}

export async function requireAppContext(): Promise<AppContext> {
  if (!isSupabaseConfigured()) {
    redirect('/login');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const context = await getAppContext();
  if (!context) {
    redirect('/join');
  }
  return context;
}
