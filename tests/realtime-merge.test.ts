import {
  applyCommentChange,
  applyNotificationChange,
  mergeTicketRow,
  parsePresenceState,
  parseTypingBroadcast,
} from '@/lib/realtime/merge';
import type { Ticket, TicketComment } from '@/lib/supabase/database.types';

const ticket: Ticket = {
  id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
  organization_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  project_id: null,
  title: 'Staging deploy is blocked',
  description: 'Preview is down.',
  status: 'open',
  priority: 'high',
  created_by: '33333333-3333-4333-8333-333333333333',
  assigned_to: null,
  created_at: '2026-08-15T00:00:00.000Z',
  updated_at: '2026-08-15T00:00:00.000Z',
};

const comment: TicketComment = {
  id: 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',
  organization_id: ticket.organization_id,
  ticket_id: ticket.id,
  author_id: ticket.created_by,
  body: 'Still failing on preview.',
  created_at: '2026-08-15T00:01:00.000Z',
  updated_at: '2026-08-15T00:01:00.000Z',
};

describe('realtime merge helpers', () => {
  it('merges a ticket update without replacing the local row on a bad payload', () => {
    const next = mergeTicketRow(ticket, { ...ticket, status: 'in_progress' });
    expect(next.status).toBe('in_progress');
    expect(mergeTicketRow(ticket, { id: 'someone-else' })).toBe(ticket);
  });

  it('inserts, updates, and deletes comments by id', () => {
    const inserted = applyCommentChange([], 'INSERT', comment);
    expect(inserted).toHaveLength(1);
    const updated = applyCommentChange(inserted, 'UPDATE', {
      ...comment,
      body: 'Health checks are green.',
    });
    expect(updated[0]?.body).toBe('Health checks are green.');
    expect(applyCommentChange(updated, 'DELETE', { id: comment.id })).toEqual([]);
  });

  it('parses typing broadcasts and ignores malformed payloads', () => {
    expect(parseTypingBroadcast({ userId: '1', fullName: 'Jonas', isTyping: true })).toEqual({
      userId: '1',
      fullName: 'Jonas',
      isTyping: true,
    });
    expect(parseTypingBroadcast({ userId: '1' })).toBeNull();
  });

  it('omits the current user from presence', () => {
    const viewers = parsePresenceState(
      {
        a: [{ userId: '111', fullName: 'Mira Chen' }],
        b: [{ userId: '222', fullName: 'Jonas Reed' }],
      },
      '111',
    );
    expect(viewers).toEqual([{ userId: '222', fullName: 'Jonas Reed' }]);
  });

  it('upserts notifications from postgres change payloads', () => {
    const row = {
      id: 'n1',
      organization_id: ticket.organization_id,
      user_id: '222',
      ticket_id: ticket.id,
      title: 'Ticket assigned to you',
      body: ticket.title,
      read_at: null,
      created_at: ticket.created_at,
    };
    const next = applyNotificationChange([], 'INSERT', row);
    expect(next).toHaveLength(1);
  });
});
