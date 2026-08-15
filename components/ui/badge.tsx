import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeTone = 'neutral' | 'sea' | 'signal' | 'ok' | 'danger';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-line/60 text-ink',
  sea: 'bg-sea/10 text-sea-dark',
  signal: 'bg-signal/15 text-ink',
  ok: 'bg-ok/10 text-ok',
  danger: 'bg-danger/10 text-danger',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
