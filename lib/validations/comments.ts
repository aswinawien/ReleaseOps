import { z } from 'zod';

export const createCommentSchema = z.object({
  ticketId: z.string().uuid(),
  body: z
    .string()
    .trim()
    .min(2, 'Comment must be at least 2 characters.')
    .max(4000, 'Comment must be 4000 characters or fewer.'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
