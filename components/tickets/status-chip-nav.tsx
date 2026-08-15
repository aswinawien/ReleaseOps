import Link from 'next/link';
import { ticketStatuses } from '@/lib/validations/tickets';
import { titleFromSlug } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function StatusChipNav({
  counts,
  active,
  allHref = '/tickets',
}: {
  counts: Record<string, number>;
  active?: string;
  allHref?: string;
}) {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return (
    <nav aria-label="Queue by status" className="flex flex-wrap gap-1 border border-line bg-board p-1">
      <Link
        href={allHref}
        className={cn(
          'inline-flex min-h-11 items-center gap-2 px-3 text-sm',
          !active ? 'bg-rail text-rail-ink' : 'text-ink hover:bg-white',
        )}
        aria-current={!active ? 'page' : undefined}
      >
        All
        <span className="tabular">{total}</span>
      </Link>
      {ticketStatuses.map((status) => {
        const count = counts[status] ?? 0;
        const selected = active === status;
        return (
          <Link
            key={status}
            href={`/tickets?status=${status}`}
            className={cn(
              'inline-flex min-h-11 items-center gap-2 px-3 text-sm',
              selected ? 'bg-rail text-rail-ink' : 'text-ink hover:bg-white',
            )}
            aria-current={selected ? 'page' : undefined}
          >
            {titleFromSlug(status)}
            <span className="tabular">{count}</span>
          </Link>
        );
      })}
    </nav>
  );
}
