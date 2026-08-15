import { Button } from '@/components/ui/button';

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}) {
  return (
    <div className="border border-dashed border-line bg-board px-6 py-12 text-center">
      <h2 className="font-display text-xl leading-none">{title}</h2>
      <p className="mx-auto mt-3 max-w-[65ch] text-sm text-ink-soft">{description}</p>
      {actionHref ? (
        <a
          href={actionHref}
          className="mt-6 inline-flex min-h-11 items-center justify-center bg-sea px-4 text-sm font-semibold text-white hover:bg-sea-dark"
        >
          {actionLabel}
        </a>
      ) : actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
