'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { organizationChannelName, RECOVERY_SETTLE_MS } from '@/lib/realtime/channels';
import {
  connectionStatusLabel,
  reduceConnectionStatus,
  type ConnectionStatus,
} from '@/lib/realtime/connection-state';
import { isSupabaseConfigured } from '@/lib/env';

type RealtimeContextValue = {
  status: ConnectionStatus;
  label: string;
  userId: string;
  fullName: string;
  organizationId: string;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function RealtimeProvider({
  userId,
  fullName,
  organizationId,
  children,
}: {
  userId: string;
  fullName: string;
  organizationId: string;
  children: ReactNode;
}) {
  const [status, dispatch] = useReducer(reduceConnectionStatus, 'idle' as ConnectionStatus);
  const recoverTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();
    dispatch({ type: 'SUBSCRIBE' });

    const channel = supabase.channel(organizationChannelName(organizationId), {
      config: {
        private: true,
        presence: { key: userId },
      },
    });

    channel.subscribe(async (subscribeStatus) => {
      if (subscribeStatus === 'SUBSCRIBED') {
        dispatch({ type: 'SUBSCRIBED' });
        await channel.track({
          userId,
          fullName,
          surface: 'workspace',
        });
        if (recoverTimer.current) {
          window.clearTimeout(recoverTimer.current);
        }
        recoverTimer.current = window.setTimeout(() => {
          dispatch({ type: 'SETTLE_RECOVERY' });
        }, RECOVERY_SETTLE_MS);
        return;
      }
      if (subscribeStatus === 'TIMED_OUT') {
        dispatch({ type: 'TIMED_OUT' });
        return;
      }
      if (subscribeStatus === 'CHANNEL_ERROR' || subscribeStatus === 'CLOSED') {
        dispatch({ type: subscribeStatus === 'CLOSED' ? 'CLOSED' : 'CHANNEL_ERROR' });
      }
    });

    const onOffline = () => dispatch({ type: 'CLOSED' });
    const onOnline = () => dispatch({ type: 'SUBSCRIBE' });
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      if (recoverTimer.current) {
        window.clearTimeout(recoverTimer.current);
      }
      void supabase.removeChannel(channel);
    };
  }, [fullName, organizationId, userId]);

  const value = useMemo(
    () => ({
      status,
      label: connectionStatusLabel(status),
      userId,
      fullName,
      organizationId,
    }),
    [fullName, organizationId, status, userId],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtimeContext(): RealtimeContextValue {
  const value = useContext(RealtimeContext);
  if (!value) {
    throw new Error('useRealtimeContext must be used within RealtimeProvider.');
  }
  return value;
}
