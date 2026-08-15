import { z } from 'zod';

export const membershipRoles = ['owner', 'admin', 'agent', 'client', 'viewer'] as const;

export const updateMembershipRoleSchema = z.object({
  membershipId: z.string().uuid(),
  role: z.enum(membershipRoles),
});

export const createInvitationSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  role: z.enum(membershipRoles),
});

export const invitationTokenSchema = z.string().uuid();

export type UpdateMembershipRoleInput = z.infer<typeof updateMembershipRoleSchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
