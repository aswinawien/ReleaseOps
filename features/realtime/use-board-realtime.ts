'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import { organizationDatabaseChannelName } from '@/lib/realtime/channels';

export function useBoardRealtime(organizationId: string, onReconcile: () => void) {
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();
    let timer: number | null = null;

    const channel = supabase
      .channel(organizationDatabaseChannelName(organizationId))
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          if (timer) {
            window.clearTimeout(timer);
          }
          timer = window.setTimeout(() => {
            onReconcile();
          }, 150);
        },
      )
      .subscribe();

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
      void supabase.removeChannel(channel);
    };
  }, [onReconcile, organizationId]);
}
