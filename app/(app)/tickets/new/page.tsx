import { requireAppContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { listProjects } from '@/lib/repositories/tickets';
import { canCreateTicket } from '@/lib/auth/permissions';
import { TicketCreateForm } from '@/features/tickets/ticket-create-form';
import { Alert } from '@/components/ui/alert';

export const metadata = { title: 'New ticket' };

export default async function NewTicketPage() {
  const context = await requireAppContext();
  if (!canCreateTicket(context.role)) {
    return <Alert>Viewers can read tickets but cannot create them.</Alert>;
  }

  const supabase = await createClient();
  const projects = await listProjects(supabase, context.organization.id);

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div>
        <h1 className="font-display text-4xl">New ticket</h1>
        <p className="mt-2 text-ink-soft">
          Clients and staff can open a work order. Assignment and status changes stay with the
          studio team.
        </p>
      </div>
      <TicketCreateForm projects={projects} />
    </div>
  );
}
