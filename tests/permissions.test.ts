import {
  canAssignTicket,
  canComment,
  canCreateTicket,
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
});
