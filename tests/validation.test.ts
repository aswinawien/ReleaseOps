import { createTicketSchema, ticketFilterSchema } from '@/lib/validations/tickets';
import { createCommentSchema } from '@/lib/validations/comments';
import { loginSchema, signupSchema } from '@/lib/validations/auth';

describe('ticket validation', () => {
  it('rejects a short title and description', () => {
    const result = createTicketSchema.safeParse({
      title: 'Hi',
      description: 'Too short',
      priority: 'medium',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a complete create payload', () => {
    const result = createTicketSchema.safeParse({
      title: 'Preview environment is down',
      description: 'Health checks fail after the last content migration.',
      priority: 'high',
      projectId: null,
    });
    expect(result.success).toBe(true);
  });

  it('defaults pagination when filters are empty', () => {
    const result = ticketFilterSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.query).toBe('');
  });
});

describe('comment validation', () => {
  it('requires a ticket id and a real comment body', () => {
    expect(
      createCommentSchema.safeParse({ ticketId: 'not-a-uuid', body: 'x' }).success,
    ).toBe(false);
    expect(
      createCommentSchema.safeParse({
        ticketId: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
        body: 'The preview origin is still returning 502.',
      }).success,
    ).toBe(true);
  });
});

describe('auth validation', () => {
  it('requires a valid email and password', () => {
    expect(loginSchema.safeParse({ email: 'mira', password: 'short' }).success).toBe(false);
    expect(
      loginSchema.safeParse({
        email: 'mira.owner@harborpine.test',
        password: 'HarborPine!demo1',
      }).success,
    ).toBe(true);
  });

  it('requires a workspace name on signup', () => {
    const result = signupSchema.safeParse({
      email: 'new.owner@harborpine.test',
      password: 'HarborPine!demo1',
      fullName: 'A',
      organizationName: '',
    });
    expect(result.success).toBe(false);
  });
});
