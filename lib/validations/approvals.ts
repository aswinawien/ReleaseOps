import { z } from 'zod';

export const approvalStatuses = [
  'pending',
  'approved',
  'changes_requested',
  'rejected',
] as const;

export const approvalFilterSchema = z.object({
  status: z.union([z.enum(approvalStatuses), z.literal('all')]).optional().default('pending'),
});

export const requestApprovalSchema = z.object({
  ticketId: z.string().uuid(),
  notes: z.string().trim().max(2000).optional().default(''),
});

export const reviewApprovalSchema = z.object({
  approvalId: z.string().uuid(),
  decision: z.enum(['approved', 'changes_requested', 'rejected']),
  notes: z.string().trim().max(2000).optional().default(''),
});
