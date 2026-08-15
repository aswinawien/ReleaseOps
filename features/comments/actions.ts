'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAppContext } from '@/lib/auth/session';
import { canComment } from '@/lib/auth/permissions';
import { actionErr, actionOk, type ActionResult } from '@/lib/actions/result';
import { createCommentSchema } from '@/lib/validations/comments';

export async function createCommentAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createCommentSchema.safeParse(input);
  if (!parsed.success) {
    return actionErr(parsed.error.issues[0]?.message ?? 'Comment is invalid.');
  }

  const context = await requireAppContext();
  if (!canComment(context.role)) {
    return actionErr('Your role cannot comment on tickets.');
  }

  const supabase = await createClient();
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('id, organization_id')
    .eq('id', parsed.data.ticketId)
    .eq('organization_id', context.organization.id)
    .maybeSingle();

  if (ticketError) {
    return actionErr(ticketError.message);
  }
  if (!ticket) {
    return actionErr('Ticket not found.');
  }

  const { data, error } = await supabase
    .from('ticket_comments')
    .insert({
      organization_id: context.organization.id,
      ticket_id: ticket.id,
      author_id: context.userId,
      body: parsed.data.body,
    })
    .select('id')
    .single();

  if (error) {
    return actionErr(error.message);
  }

  revalidatePath(`/tickets/${ticket.id}`);
  return actionOk({ id: data.id });
}
