export const CONNECTION_STATUSES = [
  'idle',
  'connecting',
  'connected',
  'disconnected',
  'reconnecting',
  'recovered',
] as const;

export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export type ConnectionEvent =
  | { type: 'SUBSCRIBE' }
  | { type: 'SUBSCRIBED' }
  | { type: 'CLOSED' }
  | { type: 'CHANNEL_ERROR' }
  | { type: 'TIMED_OUT' }
  | { type: 'SETTLE_RECOVERY' };

export function reduceConnectionStatus(
  state: ConnectionStatus,
  event: ConnectionEvent,
): ConnectionStatus {
  switch (event.type) {
    case 'SUBSCRIBE':
      if (state === 'idle') {
        return 'connecting';
      }
      if (state === 'connected' || state === 'recovered') {
        return 'reconnecting';
      }
      if (state === 'disconnected' || state === 'reconnecting') {
        return 'reconnecting';
      }
      return 'connecting';
    case 'SUBSCRIBED':
      if (state === 'reconnecting' || state === 'disconnected') {
        return 'recovered';
      }
      return 'connected';
    case 'CLOSED':
    case 'CHANNEL_ERROR':
      return 'disconnected';
    case 'TIMED_OUT':
      return 'reconnecting';
    case 'SETTLE_RECOVERY':
      return state === 'recovered' ? 'connected' : state;
    default:
      return state;
  }
}

export function connectionStatusLabel(status: ConnectionStatus): string {
  switch (status) {
    case 'idle':
    case 'connecting':
      return 'Connecting to live updates';
    case 'connected':
      return 'Live';
    case 'disconnected':
      return 'Disconnected from live updates';
    case 'reconnecting':
      return 'Reconnecting';
    case 'recovered':
      return 'Live connection recovered';
  }
}

export function isUnhealthyConnection(status: ConnectionStatus): boolean {
  return status === 'disconnected' || status === 'reconnecting';
}
