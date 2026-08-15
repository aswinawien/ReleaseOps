'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAppContext } from '@/lib/auth/session';
import { canRequestApproval, canReviewApproval } from '@/lib/auth/permissions';
import { actionErr, actionOk, type ActionResult } from '@/lib/actions/result';
import { requestApprovalSchema, reviewApprovalSchema } from '@/lib/validations/approvals';

export async function requestApprovalAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = requestApprovalSchema.safeParse(input);
  if (!parsed.success) {
    return actionErr(parsed.error.issues[0]?.message ?? 'Approval request is invalid.');
  }

  const context = await requireAppContext();
  if (!canRequestApproval(context.role)) {
    return actionErr('Your role cannot request approvals.');
  }

  const supabase = await createClient();
  const { data: ticket } = await supabase
    .from('tickets')
    .select('id')
    .eq('id', parsed.data.ticketId)
    .eq('organization_id', context.organization.id)
    .maybeSingle();

  if (!ticket) {
    return actionErr('Ticket not found.');
  }

  const { data, error } = await supabase
    .from('approvals')
    .insert({
      organization_id: context.organization.id,
      ticket_id: ticket.id,
      requested_by: context.userId,
      notes: parsed.data.notes || null,
    })
    .select('id')
    .single();

  if (error) {
    return actionErr(error.message);
  }

  revalidatePath(`/tickets/${ticket.id}`);
  return actionOk({ id: data.id });
}

export async function reviewApprovalAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = reviewApprovalSchema.safeParse(input);
  if (!parsed.success) {
    return actionErr(parsed.error.issues[0]?.message ?? 'Approval review is invalid.');
  }

  const context = await requireAppContext();
  if (!canReviewApproval(context.role)) {
    return actionErr('Your role cannot review approvals.');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('approvals')
    .update({
      status: parsed.data.decision,
      reviewed_by: context.userId,
      notes: parsed.data.notes || null,
    })
    .eq('id', parsed.data.approvalId)
    .eq('organization_id', context.organization.id)
    .select('id, ticket_id')
    .single();

  if (error) {
    return actionErr(error.message);
  }

  revalidatePath(`/tickets/${data.ticket_id}`);
  return actionOk({ id: data.id });
}
