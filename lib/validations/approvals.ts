import { z } from 'zod';

export const requestApprovalSchema = z.object({
  ticketId: z.string().uuid(),
  notes: z.string().trim().max(2000).optional().default(''),
});

export const reviewApprovalSchema = z.object({
  approvalId: z.string().uuid(),
  decision: z.enum(['approved', 'changes_requested', 'rejected']),
  notes: z.string().trim().max(2000).optional().default(''),
});
