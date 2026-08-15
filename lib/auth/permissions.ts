import type { MembershipRole, TicketStatus } from '@/lib/supabase/database.types';

const STAFF_ROLES: MembershipRole[] = ['owner', 'admin', 'agent'];
const MANAGER_ROLES: MembershipRole[] = ['owner', 'admin'];

export function canCreateTicket(role: MembershipRole): boolean {
  return role !== 'viewer';
}

export function canComment(role: MembershipRole): boolean {
  return role !== 'viewer';
}

export function canAssignTicket(role: MembershipRole): boolean {
  return STAFF_ROLES.includes(role);
}

export function canChangeTicketStatus(role: MembershipRole): boolean {
  return STAFF_ROLES.includes(role);
}

export function canChangeTicketPriority(role: MembershipRole): boolean {
  return STAFF_ROLES.includes(role);
}

export function canRequestApproval(role: MembershipRole): boolean {
  return STAFF_ROLES.includes(role);
}

export function canReviewApproval(role: MembershipRole): boolean {
  return role === 'client' || MANAGER_ROLES.includes(role);
}

export function canManageMembers(role: MembershipRole): boolean {
  return MANAGER_ROLES.includes(role);
}

export function isStaffRole(role: MembershipRole): boolean {
  return STAFF_ROLES.includes(role);
}

export const TICKET_STATUS_FLOW: Record<TicketStatus, TicketStatus[]> = {
  open: ['in_progress', 'waiting_on_client', 'waiting_on_team', 'resolved', 'closed'],
  in_progress: ['waiting_on_client', 'waiting_on_team', 'resolved', 'open', 'closed'],
  waiting_on_client: ['in_progress', 'waiting_on_team', 'resolved', 'closed'],
  waiting_on_team: ['in_progress', 'waiting_on_client', 'resolved', 'closed'],
  resolved: ['closed', 'open', 'in_progress'],
  closed: ['open'],
};

export function canTransitionStatus(
  role: MembershipRole,
  from: TicketStatus,
  to: TicketStatus,
): boolean {
  if (!canChangeTicketStatus(role) || from === to) {
    return false;
  }
  return TICKET_STATUS_FLOW[from].includes(to);
}
