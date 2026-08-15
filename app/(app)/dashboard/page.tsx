import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAppContext } from '@/lib/auth/session';
import { countTicketsByStatus, listTickets } from '@/lib/repositories/tickets';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge, PriorityBadge } from '@/components/tickets/status-badge';
import { canCreateTicket } from '@/lib/auth/permissions';
import { formatRelativeTime } from '@/lib/utils';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const context = await requireAppContext();
  const supabase = await createClient();
  const [counts, recent] = await Promise.all([
    countTicketsByStatus(supabase, context.organization.id),
    listTickets(supabase, context.organization.id, { query: '', page: 1 }),
  ]);

  const cards = [
    { label: 'Open', value: counts.open ?? 0 },
    { label: 'In progress', value: counts.in_progress ?? 0 },
    { label: 'Waiting on client', value: counts.waiting_on_client ?? 0 },
    { label: 'Resolved', value: counts.resolved ?? 0 },
  ];

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Workspace</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            Counts below come from tickets in {context.organization.name}, not sample charts.
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
      <section aria-label="Ticket counts" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border border-line bg-card p-4">
            <p className="text-sm text-ink-soft">{card.label}</p>
            <p className="mt-2 font-display text-3xl">{card.value}</p>
          </article>
        ))}
      </section>
      <section>
        <h2 className="font-display text-2xl">Recent tickets</h2>
        {recent.tickets.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No tickets yet"
              description="Create the first work order for this workspace."
              actionLabel={canCreateTicket(context.role) ? 'Create ticket' : undefined}
              actionHref={canCreateTicket(context.role) ? '/tickets/new' : undefined}
            />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-card">
            {recent.tickets.slice(0, 8).map((ticket) => (
              <li key={ticket.id}>
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="flex flex-col gap-2 px-4 py-3 hover:bg-paper/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{ticket.title}</p>
                    <p className="text-sm text-ink-soft">
                      {ticket.assignee?.full_name ?? 'Unassigned'} · {formatRelativeTime(ticket.updated_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
