import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAppContext } from '@/lib/auth/session';
import { isSupabaseConfigured } from '@/lib/env';
import { countUnreadNotifications } from '@/lib/repositories/tickets';
import { countPendingApprovals } from '@/lib/repositories/approvals';
import { AppShell } from '@/components/layout/app-shell';
import { RealtimeProvider } from '@/features/realtime/realtime-provider';
import { Alert } from '@/components/ui/alert';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <Alert>
          Supabase is not configured. Copy `.env.example` to `.env.local` and add your project
          URL and anon key.
        </Alert>
      </main>
    );
  }

  const context = await getAppContext();
  if (!context) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    redirect(user ? '/join' : '/login');
  }

  const supabase = await createClient();
  const [unreadCount, pendingApprovalCount] = await Promise.all([
    countUnreadNotifications(supabase, context.userId),
    countPendingApprovals(supabase, context.organization.id),
  ]);

  return (
    <RealtimeProvider
      userId={context.userId}
      fullName={context.profile.full_name}
      organizationId={context.organization.id}
    >
      <AppShell
        organizationName={context.organization.name}
        userName={context.profile.full_name}
        role={context.role}
        unreadCount={unreadCount}
        pendingApprovalCount={pendingApprovalCount}
      >
        {children}
      </AppShell>
    </RealtimeProvider>
  );
}
