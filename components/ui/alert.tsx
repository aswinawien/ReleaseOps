import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Alert({
  children,
  tone = 'danger',
  className,
}: {
  children: ReactNode;
  tone?: 'danger' | 'info';
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-md border px-3 py-2 text-sm',
        tone === 'danger' ? 'border-danger/30 bg-danger/10 text-danger' : 'border-line bg-white text-ink',
        className,
      )}
    >
      {children}
    </div>
  );
}
