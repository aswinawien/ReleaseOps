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

export function canAssignRole(
  actor: MembershipRole,
  targetCurrent: MembershipRole,
  next: MembershipRole,
): boolean {
  if (!canManageMembers(actor)) {
    return false;
  }
  if (actor === 'admin' && (targetCurrent === 'owner' || next === 'owner')) {
    return false;
  }
  return true;
}

export function canInviteRole(actor: MembershipRole, next: MembershipRole): boolean {
  return canAssignRole(actor, 'viewer', next);
}

export const MEMBERSHIP_ROLES: MembershipRole[] = [
  'owner',
  'admin',
  'agent',
  'client',
  'viewer',
];

export const ROLE_CAPABILITIES = [
  { action: 'Read workspace tickets', owner: true, admin: true, agent: true, client: true, viewer: true },
  { action: 'Create ticket', owner: true, admin: true, agent: true, client: true, viewer: false },
  { action: 'Assign / status / priority', owner: true, admin: true, agent: true, client: false, viewer: false },
  { action: 'Comment', owner: true, admin: true, agent: true, client: true, viewer: false },
  { action: 'Request approval', owner: true, admin: true, agent: true, client: false, viewer: false },
  { action: 'Review approval', owner: true, admin: true, agent: false, client: true, viewer: false },
  { action: 'Change member roles', owner: true, admin: true, agent: false, client: false, viewer: false },
  { action: 'Invite members', owner: true, admin: true, agent: false, client: false, viewer: false },
  { action: 'Move tickets on the Kanban', owner: true, admin: true, agent: true, client: false, viewer: false },
] as const;

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
