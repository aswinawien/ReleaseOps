import { requireAppContext } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { listProjects } from '@/lib/repositories/tickets';
import { canCreateTicket } from '@/lib/auth/permissions';
import { TicketCreateForm } from '@/features/tickets/ticket-create-form';
import { Alert } from '@/components/ui/alert';
import { PageHeader } from '@/components/ui/page-header';

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
      <PageHeader
        title="New ticket"
        description="Clients and staff can open a work order. Assignment and status changes stay with the studio team."
      />
      <TicketCreateForm projects={projects} />
    </div>
  );
}
