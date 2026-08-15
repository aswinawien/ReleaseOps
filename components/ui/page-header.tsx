import type { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl">
        <h1 className="font-display text-[2.25rem] leading-none tracking-tight text-ink">{title}</h1>
        {description ? <p className="mt-2 max-w-[70ch] text-sm text-ink-soft">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}
