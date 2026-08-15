import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAppContext } from '@/lib/auth/session';
import { listBoardTickets } from '@/lib/repositories/tickets';
import { canCreateTicket } from '@/lib/auth/permissions';
import { PageHeader } from '@/components/ui/page-header';
import { KanbanBoard } from '@/features/kanban/kanban-board';

export const metadata = { title: 'Board' };

export default async function DashboardPage() {
  const context = await requireAppContext();
  const supabase = await createClient();
  const tickets = await listBoardTickets(supabase, context.organization.id);
  const canCreate = canCreateTicket(context.role);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Board"
        description={`Kanban for ${context.organization.name}. Six status bays share this rail; scroll sideways when they cannot. Moves write to Postgres.`}
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
      <KanbanBoard tickets={tickets} role={context.role} organizationId={context.organization.id} />
    </div>
  );
}
