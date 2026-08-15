import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAppContext } from '@/lib/auth/session';
import {
  getTicketById,
  listAssignableMembers,
  listTicketActivity,
  listTicketApprovals,
  listTicketComments,
} from '@/lib/repositories/tickets';
import { TicketWorkspace } from '@/features/tickets/ticket-workspace';

export const metadata = { title: 'Ticket' };

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const context = await requireAppContext();
  const supabase = await createClient();
  const ticket = await getTicketById(supabase, id);

  if (!ticket || ticket.organization_id !== context.organization.id) {
    notFound();
  }

  const [comments, activity, approvals, assignableMembers] = await Promise.all([
    listTicketComments(supabase, ticket.id),
    listTicketActivity(supabase, ticket.id),
    listTicketApprovals(supabase, ticket.id),
    listAssignableMembers(supabase, context.organization.id),
  ]);

  return (
    <TicketWorkspace
      role={context.role}
      userId={context.userId}
      fullName={context.profile.full_name}
      initialTicket={ticket}
      initialComments={comments}
      initialActivity={activity}
      initialApprovals={approvals}
      assignableMembers={assignableMembers}
    />
  );
}
