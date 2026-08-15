import { z } from 'zod';

export const ticketStatuses = [
  'open',
  'in_progress',
  'waiting_on_client',
  'waiting_on_team',
  'resolved',
  'closed',
] as const;

export const ticketPriorities = ['low', 'medium', 'high', 'urgent'] as const;

export const createTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(4, 'Title must be at least 4 characters.')
    .max(120, 'Title must be 120 characters or fewer.'),
  description: z
    .string()
    .trim()
    .min(12, 'Describe the request in at least 12 characters.')
    .max(8000, 'Description is too long.'),
  priority: z.enum(ticketPriorities),
  projectId: z.string().uuid().nullable().optional(),
});

export const updateTicketStatusSchema = z.object({
  ticketId: z.string().uuid(),
  status: z.enum(ticketStatuses),
});

export const updateTicketPrioritySchema = z.object({
  ticketId: z.string().uuid(),
  priority: z.enum(ticketPriorities),
});

export const assignTicketSchema = z.object({
  ticketId: z.string().uuid(),
  assignedTo: z.string().uuid().nullable(),
});

export const ticketFilterSchema = z.object({
  query: z.string().trim().max(120).optional().default(''),
  status: z.enum(ticketStatuses).optional(),
  priority: z.enum(ticketPriorities).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type TicketFilters = z.infer<typeof ticketFilterSchema>;
