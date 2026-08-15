'use client';

import { useRealtimeContext } from '@/features/realtime/realtime-provider';
import { isUnhealthyConnection } from '@/lib/realtime/connection-state';

export function ConnectionBanner() {
  const { status, label } = useRealtimeContext();
  const unhealthy = isUnhealthyConnection(status);

  return (
    <div
      role="status"
      aria-live="polite"
      className={unhealthy ? 'border-b border-signal/50 bg-signal px-4 py-2 text-sm text-ink' : 'sr-only'}
    >
      {unhealthy ? `${label}. Ticket edits still save to the database.` : label}
    </div>
  );
}

export function ConnectionBadge() {
  const { status, label } = useRealtimeContext();
  const live = status === 'connected' || status === 'recovered';

  return (
    <p className="flex items-center gap-2 text-xs text-rail-ink/80" aria-live="polite">
      <span className={live ? 'h-2 w-2 bg-ok' : 'h-2 w-2 bg-signal'} aria-hidden="true" />
      <span>{label}</span>
    </p>
  );
}
