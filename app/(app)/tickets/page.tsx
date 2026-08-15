import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAppContext } from '@/lib/auth/session';
import { listTickets } from '@/lib/repositories/tickets';
import { ticketFilterSchema } from '@/lib/validations/tickets';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge, PriorityBadge } from '@/components/tickets/status-badge';
import { canCreateTicket } from '@/lib/auth/permissions';
import { formatRelativeTime, titleFromSlug } from '@/lib/utils';
import { TicketFilters } from '@/features/tickets/ticket-filters';

export const metadata = { title: 'Tickets' };

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const parsed = ticketFilterSchema.catch({ query: '', page: 1 }).parse({
    query: typeof params.q === 'string' ? params.q : '',
    status: typeof params.status === 'string' && params.status ? params.status : undefined,
    priority:
      typeof params.priority === 'string' && params.priority ? params.priority : undefined,
    page: typeof params.page === 'string' ? params.page : '1',
  });

  const context = await requireAppContext();
  const supabase = await createClient();
  const { tickets, total, pageSize } = await listTickets(
    supabase,
    context.organization.id,
    parsed,
  );
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Tickets</h1>
          <p className="mt-2 text-ink-soft">
            {total} work order{total === 1 ? '' : 's'} in this workspace.
          </p>
        </div>
        {canCreateTicket(context.role) ? (
          <Link
            href="/tickets/new"
            className="inline-flex min-h-11 items-center rounded-md bg-sea px-4 text-sm font-semibold text-white hover:bg-sea-dark"
          >
            New ticket
          </Link>
        ) : null}
      </div>
      <TicketFilters filters={parsed} />
      {tickets.length === 0 ? (
        <EmptyState
          title="No matching tickets"
          description="Try clearing filters or create a new request."
          actionLabel={canCreateTicket(context.role) ? 'Create ticket' : undefined}
          actionHref={canCreateTicket(context.role) ? '/tickets/new' : undefined}
        />
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-card">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/tickets/${ticket.id}`}
                className="grid gap-3 px-4 py-4 hover:bg-paper/70 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-medium">{ticket.title}</p>
                  <p className="text-sm text-ink-soft">
                    {ticket.project?.name ?? 'No project'} ·{' '}
                    {ticket.assignee?.full_name ?? 'Unassigned'} · updated{' '}
                    {formatRelativeTime(ticket.updated_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <span className="text-sm text-ink-soft">
                    {titleFromSlug(ticket.status)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {pageCount > 1 ? (
        <nav aria-label="Pagination" className="flex gap-2">
          {Array.from({ length: pageCount }, (_, index) => {
            const page = index + 1;
            const search = new URLSearchParams();
            if (parsed.query) search.set('q', parsed.query);
            if (parsed.status) search.set('status', parsed.status);
            if (parsed.priority) search.set('priority', parsed.priority);
            search.set('page', String(page));
            return (
              <Link
                key={page}
                href={`/tickets?${search.toString()}`}
                className={
                  page === parsed.page
                    ? 'rounded-md bg-ink px-3 py-2 text-sm text-white'
                    : 'rounded-md border border-line bg-white px-3 py-2 text-sm'
                }
                aria-current={page === parsed.page ? 'page' : undefined}
              >
                {page}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
