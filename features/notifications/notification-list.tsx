'use client';

import Link from 'next/link';
import { useNotificationsRealtime } from '@/features/realtime/use-notifications-realtime';
import { markAllNotificationsReadAction, markNotificationReadAction } from '@/features/notifications/actions';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import type { Notification } from '@/lib/supabase/database.types';

export function NotificationList({
  userId,
  initial,
}: {
  userId: string;
  initial: Notification[];
}) {
  const notifications = useNotificationsRealtime(userId, initial);

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications"
        description="Assignment, comments, and approvals will show up here. They are written to Postgres first."
      />
    );
  }

  return (
    <div className="grid gap-4">
      <form
        action={async () => {
          await markAllNotificationsReadAction();
        }}
      >
        <Button type="submit" variant="secondary">
          Mark all as read
        </Button>
      </form>
      <ul className="divide-y divide-line rounded-xl border border-line bg-card">
        {notifications.map((notification) => (
          <li key={notification.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium">{notification.title}</p>
              <p className="text-sm text-ink-soft">
                {notification.body} · {formatRelativeTime(notification.created_at)}
                {notification.read_at ? '' : ' · unread'}
              </p>
            </div>
            <div className="flex gap-2">
              {notification.ticket_id ? (
                <Link
                  href={`/tickets/${notification.ticket_id}`}
                  className="inline-flex min-h-11 items-center rounded-md border border-line bg-white px-3 text-sm font-semibold"
                >
                  Open ticket
                </Link>
              ) : null}
              {!notification.read_at ? (
                <form
                  action={async () => {
                    await markNotificationReadAction(notification.id);
                  }}
                >
                  <Button type="submit" variant="ghost">
                    Mark read
                  </Button>
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
