import type {
  ActivityEvent,
  Approval,
  Notification,
  Ticket,
  TicketComment,
} from '@/lib/supabase/database.types';

export type ChangeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function mergeTicketRow(current: Ticket, incoming: unknown): Ticket {
  if (!isRecord(incoming) || incoming.id !== current.id) {
    return current;
  }
  return { ...current, ...incoming } as Ticket;
}

export function upsertById<T extends { id: string }>(items: T[], incoming: T): T[] {
  const index = items.findIndex((item) => item.id === incoming.id);
  if (index === -1) {
    return [...items, incoming];
  }
  const next = [...items];
  next[index] = { ...items[index], ...incoming };
  return next;
}

export function removeById<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter((item) => item.id !== id);
}

export function applyCommentChange(
  comments: TicketComment[],
  eventType: ChangeEventType,
  row: unknown,
): TicketComment[] {
  if (!isRecord(row) || typeof row.id !== 'string') {
    return comments;
  }
  if (eventType === 'DELETE') {
    return removeById(comments, row.id);
  }
  return upsertById(comments, row as TicketComment);
}

export function applyActivityChange(
  events: ActivityEvent[],
  eventType: ChangeEventType,
  row: unknown,
): ActivityEvent[] {
  if (!isRecord(row) || typeof row.id !== 'string') {
    return events;
  }
  if (eventType === 'DELETE') {
    return removeById(events, row.id);
  }
  return upsertById(events, row as ActivityEvent);
}

export function applyApprovalChange(
  approvals: Approval[],
  eventType: ChangeEventType,
  row: unknown,
): Approval[] {
  if (!isRecord(row) || typeof row.id !== 'string') {
    return approvals;
  }
  if (eventType === 'DELETE') {
    return removeById(approvals, row.id);
  }
  return upsertById(approvals, row as Approval);
}

export function applyNotificationChange(
  notifications: Notification[],
  eventType: ChangeEventType,
  row: unknown,
): Notification[] {
  if (!isRecord(row) || typeof row.id !== 'string') {
    return notifications;
  }
  if (eventType === 'DELETE') {
    return removeById(notifications, row.id);
  }
  return upsertById(notifications, row as Notification);
}

export type TypingBroadcast = {
  userId: string;
  fullName: string;
  isTyping: boolean;
};

export function parseTypingBroadcast(payload: unknown): TypingBroadcast | null {
  if (!isRecord(payload)) {
    return null;
  }
  if (
    typeof payload.userId !== 'string' ||
    typeof payload.fullName !== 'string' ||
    typeof payload.isTyping !== 'boolean'
  ) {
    return null;
  }
  return {
    userId: payload.userId,
    fullName: payload.fullName,
    isTyping: payload.isTyping,
  };
}

export type PresenceMember = {
  userId: string;
  fullName: string;
};

export function parsePresenceState(
  state: Record<string, Array<{ userId?: string; fullName?: string }>>,
  currentUserId: string,
): PresenceMember[] {
  const members = new Map<string, PresenceMember>();
  for (const presences of Object.values(state)) {
    for (const presence of presences) {
      if (!presence.userId || !presence.fullName || presence.userId === currentUserId) {
        continue;
      }
      members.set(presence.userId, {
        userId: presence.userId,
        fullName: presence.fullName,
      });
    }
  }
  return [...members.values()].sort((a, b) => a.fullName.localeCompare(b.fullName));
}
