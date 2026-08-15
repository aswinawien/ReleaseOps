export function ticketChannelName(ticketId: string): string {
  return `ticket:${ticketId}`;
}

export function ticketDatabaseChannelName(ticketId: string): string {
  return `ticket-db:${ticketId}`;
}

export function organizationChannelName(organizationId: string): string {
  return `org:${organizationId}`;
}

export function organizationDatabaseChannelName(organizationId: string): string {
  return `org-db:${organizationId}`;
}

export function userNotificationChannelName(userId: string): string {
  return `user-db:${userId}`;
}

export const TYPING_EVENT = 'typing';
export const TYPING_TTL_MS = 2500;
export const RECOVERY_SETTLE_MS = 4000;
