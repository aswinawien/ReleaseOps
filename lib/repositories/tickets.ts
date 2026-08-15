import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { TicketFilters } from '@/lib/validations/tickets';
import type {
  ActivityWithActor,
  ApprovalWithActors,
  CommentWithAuthor,
  Database as Db,
  MembershipWithProfile,
  Notification,
  Project,
  TicketWithRelations,
} from '@/lib/supabase/database.types';

type Client = SupabaseClient<Db>;

const TICKET_SELECT =
  '*, creator:profiles!tickets_created_by_fkey(id, full_name), assignee:profiles!tickets_assigned_to_fkey(id, full_name), project:projects(id, name)';

export async function listProjects(
  client: Client,
  organizationId: string,
): Promise<Project[]> {
  const { data, error } = await client
    .from('projects')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name');

  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function listAssignableMembers(
  client: Client,
  organizationId: string,
): Promise<MembershipWithProfile[]> {
  const { data, error } = await client
    .from('memberships')
    .select('*, profile:profiles(id, full_name)')
    .eq('organization_id', organizationId)
    .in('role', ['owner', 'admin', 'agent'])
    .order('created_at');

  if (error) {
    throw error;
  }
  return (data ?? []) as MembershipWithProfile[];
}

export async function listTickets(
  client: Client,
  organizationId: string,
  filters: TicketFilters,
): Promise<{ tickets: TicketWithRelations[]; total: number; pageSize: number }> {
  const pageSize = 20;
  const from = (filters.page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = client
    .from('tickets')
    .select(TICKET_SELECT, { count: 'exact' })
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.priority) {
    query = query.eq('priority', filters.priority);
  }
  if (filters.query) {
    query = query.ilike('title', `%${filters.query}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    throw error;
  }

  return {
    tickets: (data ?? []) as TicketWithRelations[],
    total: count ?? 0,
    pageSize,
  };
}

export async function listBoardTickets(
  client: Client,
  organizationId: string,
): Promise<TicketWithRelations[]> {
  const { data, error } = await client
    .from('tickets')
    .select(TICKET_SELECT)
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false })
    .limit(200);

  if (error) {
    throw error;
  }
  return (data ?? []) as TicketWithRelations[];
}

export async function getTicketById(
  client: Client,
  ticketId: string,
): Promise<TicketWithRelations | null> {
  const { data, error } = await client
    .from('tickets')
    .select(TICKET_SELECT)
    .eq('id', ticketId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return (data as TicketWithRelations | null) ?? null;
}

export async function listTicketComments(
  client: Client,
  ticketId: string,
): Promise<CommentWithAuthor[]> {
  const { data, error } = await client
    .from('ticket_comments')
    .select('*, author:profiles!ticket_comments_author_id_fkey(id, full_name)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }
  return (data ?? []) as CommentWithAuthor[];
}

export async function listTicketActivity(
  client: Client,
  ticketId: string,
): Promise<ActivityWithActor[]> {
  const { data, error } = await client
    .from('activity_events')
    .select('*, actor:profiles!activity_events_actor_id_fkey(id, full_name)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }
  return (data ?? []) as ActivityWithActor[];
}

export async function listTicketApprovals(
  client: Client,
  ticketId: string,
): Promise<ApprovalWithActors[]> {
  const { data, error } = await client
    .from('approvals')
    .select(
      '*, requester:profiles!approvals_requested_by_fkey(id, full_name), reviewer:profiles!approvals_reviewed_by_fkey(id, full_name)',
    )
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }
  return (data ?? []) as ApprovalWithActors[];
}

export async function countTicketsByStatus(
  client: Client,
  organizationId: string,
): Promise<Record<string, number>> {
  const { data, error } = await client
    .from('tickets')
    .select('status')
    .eq('organization_id', organizationId);

  if (error) {
    throw error;
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return counts;
}

export async function listNotifications(
  client: Client,
  userId: string,
): Promise<Notification[]> {
  const { data, error } = await client
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function countUnreadNotifications(
  client: Client,
  userId: string,
): Promise<number> {
  const { count, error } = await client
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) {
    throw error;
  }
  return count ?? 0;
}
