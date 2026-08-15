'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import { userNotificationChannelName } from '@/lib/realtime/channels';
import { applyNotificationChange } from '@/lib/realtime/merge';
import type { Notification } from '@/lib/supabase/database.types';

export function useNotificationsRealtime(
  userId: string,
  initial: Notification[],
): Notification[] {
  const [notifications, setNotifications] = useState(initial);

  useEffect(() => {
    setNotifications(initial);
  }, [initial]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel(userNotificationChannelName(userId))
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((current) =>
            applyNotificationChange(current, payload.eventType, payload.new ?? payload.old),
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  return notifications;
}
