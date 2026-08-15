import { createClient } from '@/lib/supabase/server';
import { requireAppContext } from '@/lib/auth/session';
import { listNotifications } from '@/lib/repositories/tickets';
import { NotificationList } from '@/features/notifications/notification-list';
import { PageHeader } from '@/components/ui/page-header';

export const metadata = { title: 'Alerts' };

export default async function NotificationsPage() {
  const context = await requireAppContext();
  const supabase = await createClient();
  const notifications = await listNotifications(supabase, context.userId);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Alerts"
        description="These rows come from the database. The live channel only announces that a new row exists."
      />
      <NotificationList userId={context.userId} initial={notifications} />
    </div>
  );
}
