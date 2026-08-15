import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAppContext } from '@/lib/auth/session';
import { countTicketsByStatus, listTickets } from '@/lib/repositories/tickets';
import { ticketFilterSchema } from '@/lib/validations/tickets';
import { canCreateTicket } from '@/lib/auth/permissions';
import { PageHeader } from '@/components/ui/page-header';
import { StatusChipNav } from '@/components/tickets/status-chip-nav';
import { TicketQueue } from '@/components/tickets/ticket-queue';
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
  const [{ tickets, total, pageSize }, counts] = await Promise.all([
    listTickets(supabase, context.organization.id, parsed),
    countTicketsByStatus(supabase, context.organization.id),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const canCreate = canCreateTicket(context.role);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Tickets"
        description={`${total} work order${total === 1 ? '' : 's'} in this workspace.`}
        action={
          canCreate ? (
            <Link
              href="/tickets/new"
              className="inline-flex min-h-11 items-center bg-sea px-4 text-sm font-semibold text-white hover:bg-sea-dark"
            >
              New ticket
            </Link>
          ) : null
        }
      />
      <StatusChipNav counts={counts} active={parsed.status} />
      <TicketFilters filters={parsed} />
      <TicketQueue
        tickets={tickets}
        emptyTitle="No matching tickets"
        emptyDescription="Try clearing filters or create a new request."
        emptyActionLabel={canCreate ? 'Create ticket' : undefined}
        emptyActionHref={canCreate ? '/tickets/new' : undefined}
      />
      {pageCount > 1 ? (
        <nav aria-label="Pagination" className="flex flex-wrap gap-1">
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
                    ? 'inline-flex min-h-11 min-w-11 items-center justify-center bg-rail px-3 text-sm text-rail-ink'
                    : 'inline-flex min-h-11 min-w-11 items-center justify-center border border-line bg-board px-3 text-sm'
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
