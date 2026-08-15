import {
  ROLE_CAPABILITIES,
  canAssignRole,
  canAssignTicket,
  canComment,
  canCreateTicket,
  canInviteRole,
  canManageMembers,
  canReviewApproval,
  canTransitionStatus,
} from '@/lib/auth/permissions';

describe('role permissions', () => {
  it('lets clients create tickets and comment, but not assign', () => {
    expect(canCreateTicket('client')).toBe(true);
    expect(canComment('client')).toBe(true);
    expect(canAssignTicket('client')).toBe(false);
  });

  it('keeps viewers read-only', () => {
    expect(canCreateTicket('viewer')).toBe(false);
    expect(canComment('viewer')).toBe(false);
    expect(canAssignTicket('viewer')).toBe(false);
  });

  it('lets agents move a ticket through the supported status flow', () => {
    expect(canTransitionStatus('agent', 'open', 'in_progress')).toBe(true);
    expect(canTransitionStatus('client', 'open', 'in_progress')).toBe(false);
    expect(canTransitionStatus('agent', 'closed', 'in_progress')).toBe(false);
  });

  it('lets clients review approvals', () => {
    expect(canReviewApproval('client')).toBe(true);
    expect(canReviewApproval('agent')).toBe(false);
  });

  it('lets owners and admins change roles, but not agents', () => {
    expect(canManageMembers('owner')).toBe(true);
    expect(canManageMembers('admin')).toBe(true);
    expect(canManageMembers('agent')).toBe(false);
  });

  it('stops admins from granting or editing the owner role', () => {
    expect(canAssignRole('admin', 'agent', 'owner')).toBe(false);
    expect(canAssignRole('admin', 'owner', 'admin')).toBe(false);
    expect(canAssignRole('owner', 'agent', 'owner')).toBe(true);
    expect(canAssignRole('client', 'agent', 'viewer')).toBe(false);
  });

  it('lets owners and admins invite, but admins cannot invite an owner', () => {
    expect(canInviteRole('owner', 'agent')).toBe(true);
    expect(canInviteRole('admin', 'client')).toBe(true);
    expect(canInviteRole('admin', 'owner')).toBe(false);
    expect(canInviteRole('agent', 'client')).toBe(false);
  });

  it('keeps the published matrix aligned with the helpers', () => {
    const review = ROLE_CAPABILITIES.find((row) => row.action === 'Review approval');
    expect(review?.client).toBe(true);
    expect(review?.agent).toBe(false);
    const members = ROLE_CAPABILITIES.find((row) => row.action === 'Change member roles');
    expect(members?.owner).toBe(true);
    expect(members?.admin).toBe(true);
    expect(members?.agent).toBe(false);
    const invites = ROLE_CAPABILITIES.find((row) => row.action === 'Invite members');
    expect(invites?.owner).toBe(true);
    expect(invites?.admin).toBe(true);
    expect(invites?.agent).toBe(false);
    const kanban = ROLE_CAPABILITIES.find((row) => row.action === 'Move tickets on the Kanban');
    expect(kanban?.agent).toBe(true);
    expect(kanban?.client).toBe(false);
    expect(kanban?.viewer).toBe(false);
  });
});
