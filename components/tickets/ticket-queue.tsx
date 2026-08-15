import Link from 'next/link';
import type { TicketWithRelations } from '@/lib/supabase/database.types';
import { StatusBadge, PriorityBadge } from '@/components/tickets/status-badge';
import { formatRelativeTime } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

export function TicketQueue({
  tickets,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyActionHref,
}: {
  tickets: TicketWithRelations[];
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
}) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        actionHref={emptyActionHref}
      />
    );
  }

  return (
    <div className="overflow-x-auto border border-line bg-board">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <caption className="sr-only">Work orders</caption>
        <thead className="bg-rail text-rail-ink">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">
              Work order
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Assignee
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Updated
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Status
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              Priority
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-t border-line hover:bg-white">
              <td className="px-3 py-3">
                <Link href={`/tickets/${ticket.id}`} className="font-medium text-ink underline-offset-2 hover:underline">
                  {ticket.title}
                </Link>
                <p className="text-ink-soft">{ticket.project?.name ?? 'No project'}</p>
              </td>
              <td className="px-3 py-3 text-ink-soft">{ticket.assignee?.full_name ?? 'Unassigned'}</td>
              <td className="tabular px-3 py-3 text-ink-soft">{formatRelativeTime(ticket.updated_at)}</td>
              <td className="px-3 py-3">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-3 py-3">
                <PriorityBadge priority={ticket.priority} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
