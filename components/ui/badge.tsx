import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeTone = 'neutral' | 'sea' | 'signal' | 'ok' | 'danger';

const tones: Record<BadgeTone, string> = {
  neutral: 'border-line bg-white text-ink',
  sea: 'border-sea/40 bg-sea/10 text-sea-dark',
  signal: 'border-signal/40 bg-signal/15 text-ink',
  ok: 'border-ok/40 bg-ok/10 text-ok',
  danger: 'border-danger/40 bg-danger/10 text-danger',
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
        'inline-flex items-center border px-2 py-0.5 text-xs font-semibold capitalize',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
