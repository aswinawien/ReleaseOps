'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAppContext } from '@/lib/auth/session';
import {
  canAssignTicket,
  canChangeTicketPriority,
  canChangeTicketStatus,
  canCreateTicket,
  canTransitionStatus,
} from '@/lib/auth/permissions';
import { getTicketById } from '@/lib/repositories/tickets';
import { actionErr, actionOk, type ActionResult } from '@/lib/actions/result';
import {
  assignTicketSchema,
  createTicketSchema,
  updateTicketPrioritySchema,
  updateTicketStatusSchema,
} from '@/lib/validations/tickets';

export async function createTicketAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = createTicketSchema.safeParse(input);
  if (!parsed.success) {
    return actionErr(parsed.error.issues[0]?.message ?? 'Ticket details are invalid.');
  }

  const context = await requireAppContext();
  if (!canCreateTicket(context.role)) {
    return actionErr('Your role cannot create tickets.');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tickets')
    .insert({
      organization_id: context.organization.id,
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      project_id: parsed.data.projectId ?? null,
      created_by: context.userId,
    })
    .select('id')
    .single();

  if (error) {
    return actionErr(error.message);
  }

  revalidatePath('/tickets');
  revalidatePath('/dashboard');
  return actionOk({ id: data.id });
}

export async function updateTicketStatusAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = updateTicketStatusSchema.safeParse(input);
  if (!parsed.success) {
    return actionErr(parsed.error.issues[0]?.message ?? 'Invalid status change.');
  }

  const context = await requireAppContext();
  if (!canChangeTicketStatus(context.role)) {
    return actionErr('Your role cannot change ticket status.');
  }

  const supabase = await createClient();
  const ticket = await getTicketById(supabase, parsed.data.ticketId);
  if (!ticket || ticket.organization_id !== context.organization.id) {
    return actionErr('Ticket not found.');
  }

  if (
    ticket.status !== parsed.data.status &&
    !canTransitionStatus(context.role, ticket.status, parsed.data.status)
  ) {
    return actionErr('That status move is not allowed for your role.');
  }

  const { data, error } = await supabase
    .from('tickets')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.ticketId)
    .eq('organization_id', context.organization.id)
    .select('id')
    .single();

  if (error) {
    return actionErr(error.message);
  }

  revalidatePath(`/tickets/${parsed.data.ticketId}`);
  revalidatePath('/tickets');
  revalidatePath('/dashboard');
  return actionOk({ id: data.id });
}

export async function updateTicketPriorityAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = updateTicketPrioritySchema.safeParse(input);
  if (!parsed.success) {
    return actionErr(parsed.error.issues[0]?.message ?? 'Invalid priority change.');
  }

  const context = await requireAppContext();
  if (!canChangeTicketPriority(context.role)) {
    return actionErr('Your role cannot change ticket priority.');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tickets')
    .update({ priority: parsed.data.priority })
    .eq('id', parsed.data.ticketId)
    .eq('organization_id', context.organization.id)
    .select('id')
    .single();

  if (error) {
    return actionErr(error.message);
  }

  revalidatePath(`/tickets/${parsed.data.ticketId}`);
  revalidatePath('/dashboard');
  return actionOk({ id: data.id });
}

export async function assignTicketAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = assignTicketSchema.safeParse(input);
  if (!parsed.success) {
    return actionErr(parsed.error.issues[0]?.message ?? 'Invalid assignment.');
  }

  const context = await requireAppContext();
  if (!canAssignTicket(context.role)) {
    return actionErr('Your role cannot assign tickets.');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tickets')
    .update({ assigned_to: parsed.data.assignedTo })
    .eq('id', parsed.data.ticketId)
    .eq('organization_id', context.organization.id)
    .select('id')
    .single();

  if (error) {
    return actionErr(error.message);
  }

  revalidatePath(`/tickets/${parsed.data.ticketId}`);
  revalidatePath('/tickets');
  revalidatePath('/dashboard');
  return actionOk({ id: data.id });
}
