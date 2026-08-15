'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/env';
import {
  ticketChannelName,
  ticketDatabaseChannelName,
  TYPING_EVENT,
} from '@/lib/realtime/channels';
import {
  applyActivityChange,
  applyApprovalChange,
  applyCommentChange,
  mergeTicketRow,
  parsePresenceState,
  parseTypingBroadcast,
  type PresenceMember,
} from '@/lib/realtime/merge';
import { reduceConnectionStatus, type ConnectionStatus } from '@/lib/realtime/connection-state';
import type {
  ActivityEvent,
  Approval,
  Ticket,
  TicketComment,
} from '@/lib/supabase/database.types';

type UseTicketRealtimeArgs = {
  ticketId: string;
  userId: string;
  fullName: string;
  initialTicket: Ticket;
  initialComments: TicketComment[];
  initialActivity: ActivityEvent[];
  initialApprovals: Approval[];
  onReconcile: () => Promise<void>;
};

export function useTicketRealtime({
  ticketId,
  userId,
  fullName,
  initialTicket,
  initialComments,
  initialActivity,
  initialApprovals,
  onReconcile,
}: UseTicketRealtimeArgs) {
  const [ticket, setTicket] = useState(initialTicket);
  const [comments, setComments] = useState(initialComments);
  const [activity, setActivity] = useState(initialActivity);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [viewers, setViewers] = useState<PresenceMember[]>([]);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const typingTimers = useRef<Map<string, number>>(new Map());
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(
    null,
  );

  useEffect(() => {
    setTicket(initialTicket);
    setComments(initialComments);
    setActivity(initialActivity);
    setApprovals(initialApprovals);
  }, [initialActivity, initialApprovals, initialComments, initialTicket]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();
    setStatus((current) => reduceConnectionStatus(current, { type: 'SUBSCRIBE' }));

    const dbChannel = supabase
      .channel(ticketDatabaseChannelName(ticketId))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets', filter: `id=eq.${ticketId}` },
        (payload) => {
          if (payload.new) {
            setTicket((current) => mergeTicketRow(current, payload.new));
          }
          void onReconcile();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_comments',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          setComments((current) =>
            applyCommentChange(current, payload.eventType, payload.new ?? payload.old),
          );
          void onReconcile();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_events',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          setActivity((current) =>
            applyActivityChange(current, payload.eventType, payload.new ?? payload.old),
          );
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'approvals',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          setApprovals((current) =>
            applyApprovalChange(current, payload.eventType, payload.new ?? payload.old),
          );
          void onReconcile();
        },
      );

    const liveChannel = supabase.channel(ticketChannelName(ticketId), {
      config: {
        private: true,
        broadcast: { self: false },
        presence: { key: userId },
      },
    });

    liveChannel
      .on('broadcast', { event: TYPING_EVENT }, ({ payload }) => {
        const typing = parseTypingBroadcast(payload);
        if (!typing || typing.userId === userId) {
          return;
        }
        const existing = typingTimers.current.get(typing.userId);
        if (existing) {
          window.clearTimeout(existing);
        }
        if (!typing.isTyping) {
          setTypingNames((names) => names.filter((name) => name !== typing.fullName));
          typingTimers.current.delete(typing.userId);
          return;
        }
        setTypingNames((names) =>
          names.includes(typing.fullName) ? names : [...names, typing.fullName],
        );
        typingTimers.current.set(
          typing.userId,
          window.setTimeout(() => {
            setTypingNames((names) => names.filter((name) => name !== typing.fullName));
            typingTimers.current.delete(typing.userId);
          }, 2500),
        );
      })
      .on('presence', { event: 'sync' }, () => {
        setViewers(parsePresenceState(liveChannel.presenceState(), userId));
      });

    dbChannel.subscribe((subscribeStatus) => {
      if (subscribeStatus === 'SUBSCRIBED') {
        setStatus((current) => reduceConnectionStatus(current, { type: 'SUBSCRIBED' }));
      }
      if (subscribeStatus === 'TIMED_OUT') {
        setStatus((current) => reduceConnectionStatus(current, { type: 'TIMED_OUT' }));
      }
      if (subscribeStatus === 'CHANNEL_ERROR' || subscribeStatus === 'CLOSED') {
        setStatus((current) =>
          reduceConnectionStatus(current, {
            type: subscribeStatus === 'CLOSED' ? 'CLOSED' : 'CHANNEL_ERROR',
          }),
        );
      }
    });

    liveChannel.subscribe(async (subscribeStatus) => {
      if (subscribeStatus === 'SUBSCRIBED') {
        await liveChannel.track({ userId, fullName, viewing: true });
      }
    });

    channelRef.current = liveChannel;

    return () => {
      typingTimers.current.forEach((timer) => window.clearTimeout(timer));
      typingTimers.current.clear();
      void supabase.removeChannel(dbChannel);
      void supabase.removeChannel(liveChannel);
    };
  }, [fullName, onReconcile, ticketId, userId]);

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      const channel = channelRef.current;
      if (!channel) {
        return;
      }
      void channel.send({
        type: 'broadcast',
        event: TYPING_EVENT,
        payload: { userId, fullName, isTyping },
      });
    },
    [fullName, userId],
  );

  return {
    ticket,
    comments,
    activity,
    approvals,
    viewers,
    typingNames,
    status,
    sendTyping,
  };
}
