import {
  connectionStatusLabel,
  isUnhealthyConnection,
  reduceConnectionStatus,
} from '@/lib/realtime/connection-state';

describe('realtime connection state', () => {
  it('starts in connecting, then connected', () => {
    const connecting = reduceConnectionStatus('idle', { type: 'SUBSCRIBE' });
    expect(connecting).toBe('connecting');
    expect(reduceConnectionStatus(connecting, { type: 'SUBSCRIBED' })).toBe('connected');
  });

  it('marks a drop as disconnected and a retry as recovered', () => {
    const disconnected = reduceConnectionStatus('connected', { type: 'CLOSED' });
    expect(disconnected).toBe('disconnected');
    const reconnecting = reduceConnectionStatus(disconnected, { type: 'SUBSCRIBE' });
    expect(reconnecting).toBe('reconnecting');
    const recovered = reduceConnectionStatus(reconnecting, { type: 'SUBSCRIBED' });
    expect(recovered).toBe('recovered');
    expect(reduceConnectionStatus(recovered, { type: 'SETTLE_RECOVERY' })).toBe('connected');
  });

  it('exposes copy that does not pretend the socket is the source of truth', () => {
    expect(connectionStatusLabel('disconnected')).toMatch(/Disconnected/);
    expect(isUnhealthyConnection('reconnecting')).toBe(true);
    expect(isUnhealthyConnection('connected')).toBe(false);
  });
});
