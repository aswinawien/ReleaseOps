'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MembershipRole, TicketStatus, TicketWithRelations } from '@/lib/supabase/database.types';
import { canTransitionStatus } from '@/lib/auth/permissions';
import { ticketStatuses } from '@/lib/validations/tickets';
import { updateTicketStatusAction } from '@/features/tickets/actions';
import { useBoardRealtime } from '@/features/realtime/use-board-realtime';
import { PriorityBadge, StatusBadge } from '@/components/tickets/status-badge';
import { Alert } from '@/components/ui/alert';
import { titleFromSlug } from '@/lib/utils';

export function KanbanBoard({
  tickets: initialTickets,
  role,
  organizationId,
}: {
  tickets: TicketWithRelations[];
  role: MembershipRole;
  organizationId: string;
}) {
  const router = useRouter();
  const [tickets, setTickets] = useState(initialTickets);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const reconcile = useCallback(() => {
    router.refresh();
  }, [router]);

  useBoardRealtime(organizationId, reconcile);

  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  const canMove = ticketStatuses.some((status) =>
    tickets.some((ticket) => canTransitionStatus(role, ticket.status, status)),
  );

  const columns = useMemo(
    () =>
      ticketStatuses.map((status) => ({
        status,
        tickets: tickets.filter((ticket) => ticket.status === status),
      })),
    [tickets],
  );

  function move(ticketId: string, from: TicketStatus, to: TicketStatus) {
    if (from === to) {
      return;
    }
    if (!canTransitionStatus(role, from, to)) {
      setError('Your role cannot make that move.');
      return;
    }

    const previous = tickets;
    setTickets((current) =>
      current.map((ticket) => (ticket.id === ticketId ? { ...ticket, status: to } : ticket)),
    );

    startTransition(async () => {
      setError(null);
      const result = await updateTicketStatusAction({ ticketId, status: to });
      if (!result.ok) {
        setTickets(previous);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="grid gap-3">
      {error ? <Alert>{error}</Alert> : null}
      <p className="text-sm text-ink-soft">
        {canMove
          ? 'Drag a card or pick a status. The write hits Postgres; the WebSocket only announces.'
          : 'Your role can read the board. Status moves stay with owner, admin, and agent.'}
      </p>
      {tickets.length === 0 ? (
        <p className="border border-line bg-board px-4 py-8 text-center text-sm text-ink-soft">
          No tickets on this board yet.
        </p>
      ) : null}
      <div
        className="kanban-track"
        tabIndex={0}
        role="region"
        aria-label="Ticket board by status. Scroll sideways for every column."
        style={{ ['--kanban-cols' as string]: ticketStatuses.length }}
      >
        <div className="kanban-lane">
          {columns.map((column) => (
            <section
              key={column.status}
              className="flex min-h-0 flex-col bg-board"
              onDragOver={
                canMove
                  ? (event) => {
                      event.preventDefault();
                    }
                  : undefined
              }
              onDrop={
                canMove
                  ? (event) => {
                      event.preventDefault();
                      const raw = event.dataTransfer.getData('text/plain');
                      const [ticketId, from] = raw.split(':');
                      if (ticketId && from) {
                        move(ticketId, from as TicketStatus, column.status);
                      }
                    }
                  : undefined
              }
            >
              <header className="sticky top-0 z-10 flex items-center justify-between bg-rail px-3 py-2 text-rail-ink">
                <h2 className="text-sm font-semibold">{titleFromSlug(column.status)}</h2>
                <span className="tabular text-sm">{column.tickets.length}</span>
              </header>
              <ul className="grid min-h-0 flex-1 content-start gap-2 overflow-y-auto p-2">
                {column.tickets.length === 0 ? (
                  <li className="px-2 py-6 text-center text-sm text-ink-soft">Empty</li>
                ) : (
                  column.tickets.map((ticket) => (
                    <li
                      key={ticket.id}
                      draggable={canMove}
                      onDragStart={
                        canMove
                          ? (event) => {
                              event.dataTransfer.setData(
                                'text/plain',
                                `${ticket.id}:${ticket.status}`,
                              );
                            }
                          : undefined
                      }
                      className="border border-line bg-white p-3"
                    >
                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="font-medium text-ink underline-offset-2 hover:underline"
                      >
                        {ticket.title}
                      </Link>
                      <p className="mt-1 text-sm text-ink-soft">
                        {ticket.assignee?.full_name ?? 'Unassigned'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                      </div>
                      {canMove ? (
                        <label className="mt-2 grid gap-1 text-xs font-medium">
                          Move to
                          <select
                            className="min-h-11 border border-line bg-white px-2 text-sm"
                            value={ticket.status}
                            disabled={pending}
                            onChange={(event) => {
                              move(ticket.id, ticket.status, event.target.value as TicketStatus);
                            }}
                          >
                            {ticketStatuses.map((status) => (
                              <option
                                key={status}
                                value={status}
                                disabled={
                                  !canTransitionStatus(role, ticket.status, status) &&
                                  status !== ticket.status
                                }
                              >
                                {titleFromSlug(status)}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
