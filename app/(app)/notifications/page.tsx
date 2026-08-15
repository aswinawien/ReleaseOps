import { createClient } from '@/lib/supabase/server';
import { requireAppContext } from '@/lib/auth/session';
import { listNotifications } from '@/lib/repositories/tickets';
import { NotificationList } from '@/features/notifications/notification-list';

export const metadata = { title: 'Notifications' };

export default async function NotificationsPage() {
  const context = await requireAppContext();
  const supabase = await createClient();
  const notifications = await listNotifications(supabase, context.userId);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-display text-4xl">Notifications</h1>
        <p className="mt-2 text-ink-soft">
          These rows come from the database. The live channel only announces that a new row exists.
        </p>
      </div>
      <NotificationList userId={context.userId} initial={notifications} />
    </div>
  );
}
